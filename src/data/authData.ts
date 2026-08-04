export type UserRole = 'Developer' | 'Admin' | 'Student';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isAdminGranted: boolean; // Developer controls this!
  joinedDate: string;
  chestNumber?: string;
  house?: string;
}

export const INITIAL_PRESTORED_USERS: UserAccount[] = [
  {
    id: 'u-dev-1',
    name: 'Chief Systems Developer',
    email: 'developer@mgmayiroor.ac.in',
    passwordHash: 'dev123password',
    role: 'Developer',
    isAdminGranted: true, // Developers always have full admin rights
    joinedDate: 'Jan 10, 2026',
  },
  {
    id: 'u-[#]-admin',
    name: 'Prof. Suresh Varkala (Faculty Admin)',
    email: 'admin@mgmayiroor.ac.in',
    passwordHash: 'admin123password',
    role: 'Admin',
    isAdminGranted: true,
    joinedDate: 'Jan 12, 2026',
  },
  {
    id: 'u-[#]-student-1',
    name: 'Gautham S. Nair',
    email: 'gautham@mgmayiroor.ac.in',
    passwordHash: 'student123',
    role: 'Student',
    isAdminGranted: false,
    joinedDate: 'Jan 20, 2026',
    chestNumber: 'K26-402',
    house: 'Ruby',
  },
  {
    id: 'u-[#]-student-2',
    name: 'Anjali R. Pillai',
    email: 'anjali@mgmayiroor.ac.in',
    passwordHash: 'student123',
    role: 'Student',
    isAdminGranted: false,
    joinedDate: 'Jan 21, 2026',
    chestNumber: 'K26-118',
    house: 'Emerald',
  },
];

// Helper to get users from localStorage or initial pre-stored DB
export const getUsersDB = (): UserAccount[] => {
  const stored = localStorage.getItem('kalathmakam_users_db');
  if (!stored) {
    localStorage.setItem('kalathmakam_users_db', JSON.stringify(INITIAL_PRESTORED_USERS));
    return INITIAL_PRESTORED_USERS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_PRESTORED_USERS;
  }
};

// Save DB state
export const saveUsersDB = (users: UserAccount[]) => {
  localStorage.setItem('kalathmakam_users_db', JSON.stringify(users));
};

// Current Session helper
export const getCurrentSession = (): UserAccount | null => {
  const stored = localStorage.getItem('kalathmakam_current_user');
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

export const setCurrentSession = (user: UserAccount | null) => {
  if (!user) {
    localStorage.removeItem('kalathmakam_current_user');
  } else {
    localStorage.setItem('kalathmakam_current_user', JSON.stringify(user));
  }
};
