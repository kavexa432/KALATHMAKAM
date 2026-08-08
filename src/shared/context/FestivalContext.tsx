import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithPopup,
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
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { auth, googleProvider, db } from '../../config/firebase';

import type {
  FestivalEdition,
  HouseModel,
  HouseId,
  StageModel,
  EventModel,
  EventResultModel,
  LiveActivityFeedItem,
  AuditLogItem,
  UserModel,
  GalleryItemModel,
  LeaderboardDay,
  AnnouncementType,
  PriorityLevel,
  ResultDraftModel,
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

interface FestivalContextType {
  festival: FestivalEdition;
  houses: HouseModel[];
  stages: StageModel[];
  events: EventModel[];
  results: EventResultModel[];
  resultDrafts: ResultDraftModel[];
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
  publishEventWinners: (
    eventId: string,
    judgeNotes: string,
    winners: Array<{
      position: '1st' | '2nd' | '3rd';
      studentName: string;
      studentClass: string;
      houseId: HouseId;
      points: number;
    }>
  ) => Promise<void>;
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

const LOCAL_USER_KEY = 'kalathmakam_current_user_v1';

export const FestivalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [festival] = useState<FestivalEdition>(currentFestival);
  const [houses] = useState<HouseModel[]>(initialHouses);
  const [stages] = useState<StageModel[]>(initialStages);
  const [events, setEvents] = useState<EventModel[]>([]);
  const [results, setResults] = useState<EventResultModel[]>(initialResults);
  const [resultDrafts, setResultDrafts] = useState<ResultDraftModel[]>([]);
  const [liveFeed, setLiveFeed] = useState<LiveActivityFeedItem[]>(initialLiveFeed);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(initialAuditLogs);
  const [users, setUsers] = useState<UserModel[]>(initialUsers);
  const [gallery] = useState<GalleryItemModel[]>(initialGallery);
  
  // Keep backend awake ping
  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    // Ping every 20 seconds (20000ms)
    const interval = setInterval(() => {
      fetch(`${API_URL}/api/ping`).catch(() => {
        // Silently ignore ping failures
      });
    }, 20000);

    return () => clearInterval(interval);
  }, []);
  
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
  const [tick, setTick] = useState(0);

  // Auto-refresh computed statuses every minute
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  const computeDynamicEventStatus = (e: EventModel) => {
    if (e.cancelled) return 'Cancelled';
    if (e.resultsPublished || e.status === 'Completed') return 'Completed';

    const now = new Date();
    
    const startTimeParts = (e.scheduledStartTime || '00:00').split(':');
    let startTime = new Date(e.date);
    if (isNaN(startTime.getTime())) {
      startTime = new Date();
    }
    startTime.setHours(parseInt(startTimeParts[0] || '0'), parseInt(startTimeParts[1] || '0'), 0, 0);
    
    if (e.delayMinutes) {
      startTime = new Date(startTime.getTime() + e.delayMinutes * 60000);
    }

    const duration = e.durationMinutes || 60;
    const endTime = new Date(startTime.getTime() + duration * 60000);

    if (now < startTime) {
      return 'Upcoming';
    } else if (now >= startTime && now <= endTime) {
      return 'Running';
    } else {
      return 'Results Pending';
    }
  };

  const computedEvents = React.useMemo(() => {
    return events.map(e => ({
      ...e,
      status: computeDynamicEventStatus(e)
    }));
  }, [events, tick]);

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
      const cleanEmail = (userRecord.email || '').toLowerCase().trim();

      // 1. Check direct UID document in Firestore
      const userRef = doc(db, 'users', userRecord.id);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const firestoreData = snap.data() as UserModel;
        persistUser(firestoreData);
        return;
      }

      // 2. Check if Developer pre-authorized this email in users collection
      const q = query(collection(db, 'users'), where('email', '==', cleanEmail));
      const querySnap = await getDocs(q);
      
      if (!querySnap.empty) {
        const preAuthDoc = querySnap.docs[0];
        const preAuthData = preAuthDoc.data() as UserModel;
        const mergedUser: UserModel = {
          ...preAuthData,
          id: userRecord.id, // Link official UID
          avatarUrl: userRecord.avatarUrl || preAuthData.avatarUrl,
          name: preAuthData.name || userRecord.name,
        };
        await setDoc(userRef, mergedUser);
        persistUser(mergedUser);
        return;
      }

      // 3. System Developer always gets Developer access
      const isDev = cleanEmail === 'vaishnavil4433@gmail.com';
      const finalUser: UserModel = isDev
        ? { ...userRecord, role: 'developer', approved: true, permissions: ['All'] }
        : { ...userRecord, role: 'user', approved: false, permissions: [] };

      await setDoc(userRef, finalUser);
      persistUser(finalUser);
    } catch (err) {
      console.warn('Firestore Sync Notice:', err);
    }
  };

  // Helper to resolve role safely (e.g. vaishnavil4433@gmail.com is always developer)
  const resolveUserRole = (email: string, claimRole?: string): { role: 'developer' | 'admin' | 'user'; approved: boolean } => {
    const cleanEmail = (email || '').toLowerCase().trim();
    if (cleanEmail === 'vaishnavil4433@gmail.com') {
      return { role: 'developer', approved: true };
    }
    if (claimRole === 'developer' || claimRole === 'admin') {
      return { role: claimRole, approved: true };
    }
    return { role: 'user', approved: false };
  };



  // Sync Firebase Auth state strictly with Firestore users/{uid}
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseAuthUser(fbUser);
      if (fbUser) {
        const email = fbUser.email || '';
        
        try {
          const idTokenResult = await fbUser.getIdTokenResult();
          const claimRole = idTokenResult.claims.role as string | undefined;
          const { role, approved } = resolveUserRole(email, claimRole);

          // Optimistic Immediate UI Update
          const tempUser: UserModel = {
            id: fbUser.uid,
            name: fbUser.displayName || email.split('@')[0].toUpperCase(),
            email,
            role,
            approved,
            permissions: role === 'developer' ? ['All'] : role === 'admin' ? ['Events', 'Results', 'Leaderboard', 'Gallery', 'Announcements'] : [],
            status: 'Active',
            avatarUrl: fbUser.photoURL || undefined,
            createdAt: new Date().toISOString(),
          };

          persistUser(tempUser);
          syncUserToFirestore(tempUser);
        } catch (error) {
          console.error("Error fetching custom claims:", error);
        }
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

  // Listen to Firestore resultDrafts Collection
  useEffect(() => {
    try {
      const unsub = onSnapshot(
        collection(db, 'resultDrafts'),
        (snapshot) => {
          const drafts: ResultDraftModel[] = [];
          snapshot.forEach((d) => drafts.push({ id: d.id, ...d.data() } as ResultDraftModel));
          // Sort by newest first
          drafts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setResultDrafts(drafts);
        },
        (err) => console.warn('Firestore resultDrafts subscription notice:', err)
      );
      return () => unsub();
    } catch (err) {
      console.error('Failed to subscribe to resultDrafts:', err);
    }
  }, []);

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

  // Robust Google Auth Engine — popup works reliably on Android Chrome & Desktop
  const loginWithGoogle = async () => {
    try {
      const provider = googleProvider;
      provider.addScope('email');
      provider.addScope('profile');
      // Ensure fresh account selection only when needed (not forced re-pick)
      provider.setCustomParameters({ prompt: 'select_account' });

      const result = await signInWithPopup(auth, provider);
      if (result?.user) {
        const email = result.user.email || '';
        
        const tempUser: UserModel = {
          id: result.user.uid,
          name: result.user.displayName || email.split('@')[0].toUpperCase(),
          email,
          role: 'user',
          approved: false,
          permissions: [],
          status: 'Active',
          avatarUrl: result.user.photoURL || undefined,
          createdAt: new Date().toISOString(),
        };
        
        // syncUserToFirestore will read Firestore and assign the correct role
        // (developer if vaishnavil4433@gmail.com, admin if pre-authorized, user otherwise)
        await syncUserToFirestore(tempUser);
      }
    } catch (err: any) {
      // User closed popup or popup was blocked
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        return; // Silent — user intentionally closed
      }
      console.error('Google Sign-In error:', err);
      throw err;
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
      prev.map((e) => (e.id === newResultData.eventId ? { ...e, resultsPublished: true, winnerUploaded: true, housePointsUpdated: true } : e))
    );
    
    // Also update in firestore immediately
    setDoc(doc(db, 'events', newResultData.eventId), { resultsPublished: true, winnerUploaded: true, housePointsUpdated: true }, { merge: true }).catch(console.error);

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
      prev.map((e) => (e.id === target.eventId ? { ...e, resultsPublished: true, winnerUploaded: true, housePointsUpdated: true } : e))
    );
    
    setDoc(doc(db, 'events', target.eventId), { resultsPublished: true, winnerUploaded: true, housePointsUpdated: true }, { merge: true }).catch(console.error);

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

  const publishEventWinners = async (
    eventId: string,
    judgeNotes: string,
    winners: Array<{
      position: '1st' | '2nd' | '3rd';
      studentName: string;
      studentClass: string;
      houseId: HouseId;
      points: number;
    }>
  ) => {
    const targetEvent = events.find((e) => e.id === eventId);
    const eventTitle = targetEvent?.eventName || 'Competition';
    const category = targetEvent?.category || 'General';

    const newResults: EventResultModel[] = winners.map((w) => ({
      id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      eventId,
      festivalId: '2k26',
      eventTitle,
      category,
      participantName: w.studentName,
      studentClass: w.studentClass,
      houseId: w.houseId,
      houseName: w.houseId,
      position: w.position,
      points: w.points,
      createdAt: new Date().toISOString(),
      status: 'Published',
      judgeNotes,
    }));

    // Update local results state
    setResults((prev) => [...newResults, ...prev]);

    // Update local events state
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? {
              ...e,
              status: 'Completed',
              resultsPublished: true,
              winnerUploaded: true,
              housePointsUpdated: true,
            }
          : e
      )
    );

    // Sync to Firestore
    try {
      const eventRef = doc(db, 'events', eventId);
      await setDoc(
        eventRef,
        {
          status: 'Completed',
          resultsPublished: true,
          winnerUploaded: true,
          housePointsUpdated: true,
        },
        { merge: true }
      );

      for (const resItem of newResults) {
        await setDoc(doc(db, 'results', resItem.id), resItem);
      }
    } catch (err) {
      console.warn('Firestore sync notice:', err);
    }

    // Create Announcement Feed Item
    const topWinner = winners.find((w) => w.position === '1st');
    const feedContent = topWinner
      ? `🏆 ${eventTitle} (${category}) Results Published! 1st: ${topWinner.studentName} (${topWinner.houseId} House +${topWinner.points} pts)`
      : `🏆 ${eventTitle} Results Published!`;

    addAnnouncement(feedContent, 'Result', 'Important', topWinner?.houseId, topWinner?.points);

    logAuditAction(
      currentUser?.name || 'Admin',
      currentUser?.role || 'admin',
      'Published Competition Winners',
      eventTitle,
      `Published ${winners.length} winner positions for ${eventTitle}`
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
        resultDrafts,
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
        publishEventWinners,
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
