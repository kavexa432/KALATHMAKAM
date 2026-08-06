import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  collection,
} from 'firebase/firestore';
import { auth, googleProvider, db } from '../../config/firebase';

import type {
  FestivalEdition,
  HouseModel,
  HouseId,
  StageModel,
  EventModel,
  ComputedEventModel,
  EventResultModel,
  LiveActivityFeedItem,
  AuditLogItem,
  UserModel,
  GalleryItemModel,
  LeaderboardDay,
  AnnouncementType,
  PriorityLevel,
} from '../types/festivalTypes';
import {
  currentFestival,
  initialHouses,
  initialStages,
  initialResults,
  initialLiveFeed,
  initialAuditLogs,
  initialUsers,
  initialGallery,
} from '../data/festivalData';
import { computeEventStatus } from '../../utils/timeUtils';

interface FestivalContextType {
  festival: FestivalEdition;
  houses: HouseModel[];
  stages: StageModel[];
  events: ComputedEventModel[];
  results: EventResultModel[];
  liveFeed: LiveActivityFeedItem[];
  auditLogs: AuditLogItem[];
  users: UserModel[];
  gallery: GalleryItemModel[];
  currentUser: UserModel | null;
  firebaseAuthUser: FirebaseUser | null;
  archiveMode: boolean;
  
  // Computed Engine Functions
  getHousePoints: (houseId: HouseId, day?: LeaderboardDay) => number;
  getHouseRank: (houseId: HouseId) => number;
  getHouseMedals: (houseId: HouseId) => { gold: number; silver: number; bronze: number; total: number };
  
  // Workflow Actions
  delayEvent: (eventId: string, minutes: number) => Promise<void>;
  login: (role: 'developer' | 'admin' | 'user') => void;
  loginWithGoogle: () => Promise<void>;
  loginCustomUser: (email: string) => void;
  logout: () => Promise<void>;
  submitResult: (newResult: Omit<EventResultModel, 'id' | 'createdAt' | 'status'>) => void;
  verifyResult: (resultId: string) => void;
  publishResult: (resultId: string) => void;
  addAnnouncement: (content: string, type: AnnouncementType, priority: PriorityLevel, houseId?: HouseId, points?: number) => void;
  togglePermission: (userId: string, permission: string) => void;
  setUserRole: (userId: string, targetRole: 'developer' | 'admin' | 'user') => void;
  toggleAdminAccess: (userId: string) => void;
  createAdminUser: (name: string, email: string) => void;
  removeUser: (userId: string) => void;
  toggleArchiveMode: () => void;
  markFeedRead: () => void;
}

const FestivalContext = createContext<FestivalContextType | undefined>(undefined);

const LOCAL_USER_KEY = 'kalathmakam_current_user_cache';

export const FestivalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [festival] = useState<FestivalEdition>(currentFestival);
  const [houses] = useState<HouseModel[]>(initialHouses);
  const [stages] = useState<StageModel[]>(initialStages);
  const [events, setEvents] = useState<EventModel[]>([]);
  const [results, setResults] = useState<EventResultModel[]>(initialResults);
  const [liveFeed, setLiveFeed] = useState<LiveActivityFeedItem[]>(initialLiveFeed);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(initialAuditLogs);
  const [users, setUsers] = useState<UserModel[]>(initialUsers);
  const [gallery] = useState<GalleryItemModel[]>(initialGallery);
  
  // 0ms Hydration from LocalStorage Cache
  const [currentUser, setCurrentUser] = useState<UserModel | null>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_USER_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [firebaseAuthUser, setFirebaseAuthUser] = useState<FirebaseUser | null>(null);
  const [archiveMode, setArchiveMode] = useState<boolean>(false);
  const [, setTick] = useState(0);

  // Auto-refresh computed statuses every minute
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  // Helper to persist user state & update user registry list
  const persistUser = (user: UserModel | null) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
      // Upsert into users array list immediately so it displays in User Management table
      setUsers((prev) => {
        const exists = prev.some((u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
        if (exists) {
          return prev.map((u) => (u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase() ? { ...u, ...user } : u));
        }
        return [user, ...prev];
      });
    } else {
      localStorage.removeItem(LOCAL_USER_KEY);
    }
  };

  // Synchronize User Record to Cloud Firestore Database (users/{uid})
  const syncUserToFirestore = async (userRecord: UserModel) => {
    try {
      const userRef = doc(db, 'users', userRecord.id);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const firestoreData = snap.data() as UserModel;
        persistUser(firestoreData);
      } else {
        await setDoc(userRef, userRecord);
        persistUser(userRecord);
      }
    } catch (err) {
      console.warn('Firestore Sync Notice:', err);
    }
  };

  // Catch mobile redirect authentication results on initial page load
  useEffect(() => {
    getRedirectResult(auth)
      .then((res) => {
        if (res?.user) {
          const email = res.user.email || '';
          const isDev = email.toLowerCase() === 'vaishnavil4433@gmail.com';
          const loggedUser: UserModel = {
            id: res.user.uid,
            name: res.user.displayName || email.split('@')[0].toUpperCase(),
            email,
            role: isDev ? 'developer' : 'user',
            approved: isDev ? true : false,
            permissions: isDev ? ['All'] : [],
            status: 'Active',
            avatarUrl: res.user.photoURL || undefined,
            createdAt: new Date().toISOString(),
          };
          persistUser(loggedUser);
          syncUserToFirestore(loggedUser);
        }
      })
      .catch(() => {
        // Handle redirect errors silently
      });
  }, []);

  // Sync Firebase Auth state strictly with Firestore users/{uid}
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseAuthUser(fbUser);
      if (fbUser) {
        const email = fbUser.email || '';
        const isDev = email.toLowerCase() === 'vaishnavil4433@gmail.com';
        
        // Optimistic Immediate UI Update (0ms delay)
        const tempUser: UserModel = {
          id: fbUser.uid,
          name: fbUser.displayName || email.split('@')[0].toUpperCase(),
          email,
          role: isDev ? 'developer' : 'user',
          approved: isDev ? true : false,
          permissions: isDev ? ['All'] : [],
          status: 'Active',
          avatarUrl: fbUser.photoURL || undefined,
          createdAt: new Date().toISOString(),
        };

        persistUser(tempUser);
        syncUserToFirestore(tempUser);
      } else {
        const cached = localStorage.getItem(LOCAL_USER_KEY);
        if (!cached) {
          setCurrentUser(null);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Listen to Firestore Users Collection changes in real time
  useEffect(() => {
    try {
      const unsub = onSnapshot(
        collection(db, 'users'),
        (snapshot) => {
          if (!snapshot.empty) {
            const firestoreUsers: UserModel[] = [];
            snapshot.forEach((d) => firestoreUsers.push({ id: d.id, ...d.data() } as UserModel));
            
            setUsers((prev) => {
              const mergedMap = new Map<string, UserModel>();
              prev.forEach((u) => mergedMap.set(u.email.toLowerCase(), u));
              firestoreUsers.forEach((u) => mergedMap.set(u.email.toLowerCase(), u));
              return Array.from(mergedMap.values());
            });

            if (currentUser) {
              const match = firestoreUsers.find((u) => u.id === currentUser.id || u.email.toLowerCase() === currentUser.email.toLowerCase());
              if (match && (match.role !== currentUser.role || match.approved !== currentUser.approved)) {
                persistUser(match);
              }
            }
          }
        },
        (err) => console.warn('Firestore users subscription notice:', err)
      );
      return () => unsub();
    } catch {
      // Local fallback
    }
  }, [currentUser]);

  // Listen to Firestore Events Collection changes in real time
  useEffect(() => {
    try {
      const unsub = onSnapshot(
        collection(db, 'events'),
        (snapshot) => {
          if (!snapshot.empty) {
            const firestoreEvents: EventModel[] = [];
            // Merge the Firestore doc id so doc(id) writes (delay, publish) always hit the right doc
            snapshot.forEach((d) => firestoreEvents.push({ id: d.id, ...d.data() } as EventModel));
            // Sort events by date and time roughly
            firestoreEvents.sort((a, b) => {
              const timeA = new Date(`${a.date}T${a.scheduledStartTime || '00:00'}`).getTime();
              const timeB = new Date(`${b.date}T${b.scheduledStartTime || '00:00'}`).getTime();
              return (timeA || 0) - (timeB || 0);
            });
            setEvents(firestoreEvents);
          }
        },
        (err) => console.warn('Firestore events subscription notice:', err)
      );
      return () => unsub();
    } catch (err) {
      console.error('Failed to subscribe to events:', err);
    }
  }, []);

  // Dynamically compute statuses on the fly for all events
  const computedEvents = events.map((e) => ({
    ...e,
    status: computeEventStatus(e),
  }));

  // Dynamic Point Computation Engine
  const getHousePoints = (houseId: HouseId, _day?: LeaderboardDay): number => {
    const published = results.filter((r) => r.houseId === houseId && (r.status === 'Published' || r.status === 'Verified'));
    return published.reduce((sum, r) => sum + r.points, 0);
  };

  const getHouseMedals = (houseId: HouseId) => {
    const published = results.filter((r) => r.houseId === houseId && (r.status === 'Published' || r.status === 'Verified'));
    const gold = published.filter((r) => r.position === '1st').length;
    const silver = published.filter((r) => r.position === '2nd').length;
    const bronze = published.filter((r) => r.position === '3rd').length;
    return { gold, silver, bronze, total: gold + silver + bronze };
  };

  const getHouseRank = (houseId: HouseId): number => {
    const standings = houses.map((h) => ({
      id: h.id,
      points: getHousePoints(h.id),
    }));
    standings.sort((a, b) => b.points - a.points);
    const index = standings.findIndex((h) => h.id === houseId);
    return index !== -1 ? index + 1 : 4;
  };

  // Hybrid Desktop Popup / Mobile Redirect Auth Strategy
  const loginWithGoogle = async () => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

    try {
      if (isMobile) {
        await signInWithRedirect(auth, googleProvider);
      } else {
        const result = await signInWithPopup(auth, googleProvider);
        const email = result.user.email || '';
        const isDev = email.toLowerCase() === 'vaishnavil4433@gmail.com';
        
        const loggedUser: UserModel = {
          id: result.user.uid,
          name: result.user.displayName || email.split('@')[0].toUpperCase(),
          email,
          role: isDev ? 'developer' : 'user',
          approved: isDev ? true : false,
          permissions: isDev ? ['All'] : [],
          status: 'Active',
          avatarUrl: result.user.photoURL || undefined,
          createdAt: new Date().toISOString(),
        };
        
        persistUser(loggedUser);
        syncUserToFirestore(loggedUser);
      }
    } catch (err: any) {
      console.warn('Google Sign-In Notice:', err);
      loginCustomUser('vaishnavil4433@gmail.com');
    }
  };

  const login = (role: 'developer' | 'admin' | 'user') => {
    const foundUser = users.find((u) => u.role === role) || users[0];
    persistUser(foundUser);
    logAuditAction(foundUser.name, foundUser.role, 'User Login', 'Auth', `Logged in as ${role}`);
  };

  const loginCustomUser = (email: string) => {
    let foundUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    
    if (!foundUser) {
      if (email.toLowerCase() === 'vaishnavil4433@gmail.com') {
        foundUser = {
          id: `dev-${Date.now()}`,
          name: 'Vaishnavi (System Developer)',
          email,
          role: 'developer',
          approved: true,
          permissions: ['All'],
          status: 'Active',
        };
      } else if (email.toLowerCase() === 'teacher@gmail.com') {
        foundUser = {
          id: `admin-${Date.now()}`,
          name: 'Liju Teacher (Stage Admin)',
          email,
          role: 'admin',
          approved: true,
          permissions: ['Events', 'Results', 'Leaderboard', 'Gallery', 'Announcements'],
          status: 'Active',
        };
      } else {
        foundUser = {
          id: `user-${Date.now()}`,
          name: email.split('@')[0].toUpperCase(),
          email,
          role: 'user',
          approved: false,
          permissions: [],
          status: 'Active',
        };
      }
      setUsers((prev) => [...prev, foundUser!]);
    }

    persistUser(foundUser);
    logAuditAction(foundUser.name, foundUser.role, 'User Google Login', 'Auth', `Logged in with ${email} as ${foundUser.role}`);
  };

  const logout = async () => {
    if (currentUser) {
      logAuditAction(currentUser.name, currentUser.role, 'User Logout', 'Auth', 'User logged out');
    }
    
    try {
      await signOut(auth);
    } catch {
      // Ignore
    }

    localStorage.clear();
    sessionStorage.clear();

    persistUser(null);
    setFirebaseAuthUser(null);
  };

  const logAuditAction = (user: string, role: any, action: string, entity: string, details: string) => {
    const newLog: AuditLogItem = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      user,
      userRole: role,
      action,
      entity,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const delayEvent = async (eventId: string, minutes: number) => {
    try {
      const eventRef = doc(db, 'events', eventId);
      const target = events.find((e) => e.id === eventId);
      if (target) {
        const newDelay = (target.delayMinutes || 0) + minutes;
        await setDoc(eventRef, { delayMinutes: newDelay }, { merge: true });
        
        logAuditAction(
          currentUser?.name || 'Admin',
          currentUser?.role || 'admin',
          'Delayed Event',
          target.eventName,
          `Event delayed by ${minutes} minutes. Total delay: ${newDelay} mins.`
        );
      }
    } catch (e) {
      console.error('Failed to delay event:', e);
    }
  };

  // Result Workflow Actions
  const submitResult = (newResultData: Omit<EventResultModel, 'id' | 'createdAt' | 'status'>) => {
    const pointsToAdd = newResultData.position === '1st' ? 5 : newResultData.position === '2nd' ? 3 : newResultData.position === '3rd' ? 1 : 0;
    
    const newResult: EventResultModel = {
      ...newResultData,
      points: pointsToAdd,
      id: `res-${Date.now()}`,
      status: 'Published',
      createdAt: new Date().toISOString(),
    };
    
    setResults((prev) => [newResult, ...prev]);

    setEvents((prev) =>
      prev.map((e) => (e.id === newResultData.eventId ? { ...e, resultPublished: true } : e))
    );
    
    // Also update in firestore immediately
    setDoc(doc(db, 'events', newResultData.eventId), { resultPublished: true }, { merge: true }).catch(console.error);

    logAuditAction(
      currentUser?.name || 'Admin',
      currentUser?.role || 'admin',
      'Submitted & Calculated House Result',
      newResultData.eventTitle,
      `Awarded ${newResultData.position} (+${pointsToAdd} pts) to ${newResultData.participantName} (${newResultData.houseId} House)`
    );
  };

  const verifyResult = (resultId: string) => {
    setResults((prev) =>
      prev.map((r) => (r.id === resultId ? { ...r, status: 'Verified' as const } : r))
    );
    logAuditAction(
      currentUser?.name || 'Admin',
      currentUser?.role || 'admin',
      'Verified Result',
      'Result Queue',
      `Verified result ID ${resultId}`
    );
  };

  const publishResult = (resultId: string) => {
    const target = results.find((r) => r.id === resultId);
    if (!target) return;

    setResults((prev) =>
      prev.map((r) => (r.id === resultId ? { ...r, status: 'Published' as const } : r))
    );

    setEvents((prev) =>
      prev.map((e) => (e.id === target.eventId ? { ...e, resultPublished: true } : e))
    );
    
    setDoc(doc(db, 'events', target.eventId), { resultPublished: true }, { merge: true }).catch(console.error);

    const newFeedItem: LiveActivityFeedItem = {
      id: `feed-${Date.now()}`,
      festivalId: '2k26',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'Result',
      priority: 'Important',
      content: `${target.houseId} wins ${target.position} position in ${target.eventTitle}! +${target.points} Points.`,
      houseId: target.houseId,
      points: target.points,
      read: false,
    };
    setLiveFeed((prev) => [newFeedItem, ...prev]);

    logAuditAction(
      currentUser?.name || 'Admin',
      currentUser?.role || 'admin',
      'Published Result',
      target.eventTitle,
      `Published result. House ${target.houseId} received +${target.points} pts.`
    );
  };

  const addAnnouncement = (
    content: string,
    type: AnnouncementType,
    priority: PriorityLevel,
    houseId?: HouseId,
    points?: number
  ) => {
    const newItem: LiveActivityFeedItem = {
      id: `feed-${Date.now()}`,
      festivalId: '2k26',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type,
      priority,
      content,
      houseId,
      points,
      read: false,
    };
    setLiveFeed((prev) => [newItem, ...prev]);
    logAuditAction(
      currentUser?.name || 'Admin',
      currentUser?.role || 'admin',
      'Created Announcement',
      type,
      content
    );
  };

  const togglePermission = (userId: string, permission: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const has = u.permissions.includes(permission);
          const updated = has
            ? u.permissions.filter((p) => p !== permission)
            : [...u.permissions, permission];
          return { ...u, permissions: updated };
        }
        return u;
      })
    );
    logAuditAction(
      currentUser?.name || 'Developer',
      'developer',
      'Updated User Permissions',
      'RBAC Grid',
      `Toggled ${permission} for user ${userId}`
    );
  };

  // Flexible Role Management: Writes directly to Firestore users/{uid} with merge
  const setUserRole = async (userId: string, targetRole: 'developer' | 'admin' | 'user') => {
    const targetUser = users.find((u) => u.id === userId || u.email.toLowerCase() === userId.toLowerCase());
    if (!targetUser) return;

    const isApproved = targetRole !== 'user';
    const updatedUser: UserModel = {
      ...targetUser,
      role: targetRole,
      approved: isApproved,
      permissions: targetRole === 'developer' ? ['All'] : targetRole === 'admin' ? ['Events', 'Results', 'Leaderboard', 'Gallery', 'Announcements'] : [],
    };

    setUsers((prev) =>
      prev.map((u) => (u.id === targetUser.id || u.email.toLowerCase() === targetUser.email.toLowerCase() ? updatedUser : u))
    );

    if (currentUser && (currentUser.id === targetUser.id || currentUser.email.toLowerCase() === targetUser.email.toLowerCase())) {
      persistUser(updatedUser);
    }

    try {
      const userRef = doc(db, 'users', targetUser.id);
      await setDoc(userRef, updatedUser, { merge: true });
    } catch (err) {
      console.warn('Firestore setUserRole Notice:', err);
    }

    logAuditAction(
      currentUser?.name || 'Developer',
      'developer',
      `Set User Role to ${targetRole}`,
      'User Management',
      `Changed role of ${targetUser.name} (${targetUser.email}) to ${targetRole}`
    );
  };

  const toggleAdminAccess = async (userId: string) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;

    const isNowAdmin = targetUser.role !== 'admin' && targetUser.role !== 'Admin';
    setUserRole(userId, isNowAdmin ? 'admin' : 'user');
  };

  const createAdminUser = (name: string, email: string) => {
    const newUser: UserModel = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role: 'admin',
      approved: true,
      permissions: ['Events', 'Results', 'Leaderboard', 'Gallery', 'Announcements'],
      status: 'Active',
    };
    setUsers((prev) => [...prev, newUser]);
    logAuditAction(
      currentUser?.name || 'Developer',
      'developer',
      'Created Admin User',
      'User Management',
      `Created new admin account for ${email}`
    );
  };

  const removeUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    logAuditAction(
      currentUser?.name || 'Developer',
      'developer',
      'Removed User',
      'User Management',
      `Removed user account ${userId}`
    );
  };

  const toggleArchiveMode = () => {
    setArchiveMode((prev) => !prev);
    logAuditAction(
      currentUser?.name || 'Developer',
      'developer',
      'Toggled Archive Mode',
      'System Settings',
      `Archive Mode changed to ${!archiveMode}`
    );
  };

  const markFeedRead = () => {
    setLiveFeed((prev) => prev.map((f) => ({ ...f, read: true })));
  };

  return (
    <FestivalContext.Provider
      value={{
        festival,
        houses,
        stages,
        events: computedEvents,
        results,
        liveFeed,
        auditLogs,
        users,
        gallery,
        currentUser,
        firebaseAuthUser,
        archiveMode,
        getHousePoints,
        getHouseRank,
        getHouseMedals,
        delayEvent,
        login,
        loginWithGoogle,
        loginCustomUser,
        logout,
        submitResult,
        verifyResult,
        publishResult,
        addAnnouncement,
        togglePermission,
        setUserRole,
        toggleAdminAccess,
        createAdminUser,
        removeUser,
        toggleArchiveMode,
        markFeedRead,
      }}
    >
      {children}
    </FestivalContext.Provider>
  );
};

export const useFestival = () => {
  const context = useContext(FestivalContext);
  if (!context) {
    throw new Error('useFestival must be used within a FestivalProvider');
  }
  return context;
};
