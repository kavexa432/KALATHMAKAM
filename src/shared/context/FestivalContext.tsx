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
  updateDoc,
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
  initialEvents,
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
  login: (role: 'developer' | 'admin' | 'user') => void;
  loginWithGoogle: () => Promise<void>;
  loginCustomUser: (email: string) => void;
  logout: () => Promise<void>;
  submitResult: (newResult: Omit<EventResultModel, 'id' | 'createdAt' | 'status'>) => void;
  verifyResult: (resultId: string) => void;
  publishResult: (resultId: string) => void;
  addAnnouncement: (content: string, type: AnnouncementType, priority: PriorityLevel, houseId?: HouseId, points?: number) => void;
  togglePermission: (userId: string, permission: string) => void;
  toggleAdminAccess: (userId: string) => void;
  createAdminUser: (name: string, email: string) => void;
  removeUser: (userId: string) => void;
  toggleArchiveMode: () => void;
  markFeedRead: () => void;
}

const FestivalContext = createContext<FestivalContextType | undefined>(undefined);

export const FestivalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [festival] = useState<FestivalEdition>(currentFestival);
  const [houses] = useState<HouseModel[]>(initialHouses);
  const [stages] = useState<StageModel[]>(initialStages);
  const [events, setEvents] = useState<EventModel[]>(initialEvents);
  const [results, setResults] = useState<EventResultModel[]>(initialResults);
  const [liveFeed, setLiveFeed] = useState<LiveActivityFeedItem[]>(initialLiveFeed);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(initialAuditLogs);
  const [users, setUsers] = useState<UserModel[]>(initialUsers);
  const [gallery] = useState<GalleryItemModel[]>(initialGallery);
  const [currentUser, setCurrentUser] = useState<UserModel | null>(null);
  const [firebaseAuthUser, setFirebaseAuthUser] = useState<FirebaseUser | null>(null);
  const [archiveMode, setArchiveMode] = useState<boolean>(false);

  // Sync Firebase Auth state strictly with Firestore users/{uid}
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseAuthUser(fbUser);
      if (fbUser) {
        const email = fbUser.email || '';
        const userRef = doc(db, 'users', fbUser.uid);
        
        try {
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            // Read role & approved status strictly from Firestore
            const data = snap.data() as UserModel;
            setCurrentUser(data);
          } else {
            // Document creation flow
            const isDev = email.toLowerCase() === 'vaishnavil4433@gmail.com';
            const newUser: UserModel = {
              id: fbUser.uid,
              name: fbUser.displayName || email.split('@')[0].toUpperCase(),
              email,
              role: isDev ? 'developer' : 'user', // Default role = "user"
              approved: isDev ? true : false,      // Default approved = false
              permissions: isDev ? ['All'] : [],
              status: 'Active',
              avatarUrl: fbUser.photoURL || undefined,
              createdAt: new Date().toISOString(),
            };
            await setDoc(userRef, newUser);
            setCurrentUser(newUser);
          }
        } catch {
          // Fallback if offline
          loginCustomUser(email);
        }
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Listen to Firestore Users Collection changes in real time
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
        if (!snapshot.empty) {
          const firestoreUsers: UserModel[] = [];
          snapshot.forEach((d) => firestoreUsers.push({ id: d.id, ...d.data() } as UserModel));
          setUsers(firestoreUsers);

          // Update active logged-in user role & approval dynamically when granted Admin by Developer
          if (currentUser) {
            const match = firestoreUsers.find((u) => u.id === currentUser.id || u.email.toLowerCase() === currentUser.email.toLowerCase());
            if (match && (match.role !== currentUser.role || match.approved !== currentUser.approved)) {
              setCurrentUser(match);
            }
          }
        }
      });
      return () => unsub();
    } catch {
      // Local fallback
    }
  }, [currentUser]);

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

  // Auth Actions
  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch {
      loginCustomUser('vaishnavil4433@gmail.com');
    }
  };

  const login = (role: 'developer' | 'admin' | 'user') => {
    const foundUser = users.find((u) => u.role === role) || users[0];
    setCurrentUser(foundUser);
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

    setCurrentUser(foundUser);
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

    setCurrentUser(null);
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
      prev.map((e) => (e.id === newResultData.eventId ? { ...e, status: 'Completed' as const } : e))
    );

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
      prev.map((e) => (e.id === target.eventId ? { ...e, status: 'Completed' as const } : e))
    );

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

  const toggleAdminAccess = async (userId: string) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;

    const isNowAdmin = targetUser.role !== 'admin' && targetUser.role !== 'Admin';
    const newRole = isNowAdmin ? 'admin' : 'user';
    const newApproved = isNowAdmin ? true : false;

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole, approved: newApproved } : u))
    );

    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole, approved: newApproved });
    } catch {
      // Local fallback
    }

    logAuditAction(
      currentUser?.name || 'Developer',
      'developer',
      isNowAdmin ? 'Granted Admin Access' : 'Revoked Admin Access',
      'User Management',
      `${isNowAdmin ? 'Granted' : 'Revoked'} Admin privileges for ${targetUser.name} (${targetUser.email})`
    );
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
        events,
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
        login,
        loginWithGoogle,
        loginCustomUser,
        logout,
        submitResult,
        verifyResult,
        publishResult,
        addAnnouncement,
        togglePermission,
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
