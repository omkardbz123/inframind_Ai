import { create } from 'zustand';
import { UserProfile, UserRole, DepartmentType } from '../types/user';
import { DEMO_USERS } from '../lib/constants';

interface UserStoreState {
  users: UserProfile[];
  addUser: (userData: {
    displayName: string;
    email: string;
    role: UserRole;
    department?: DepartmentType;
    phone?: string;
    employeeId?: string;
    collegeId?: string;
  }) => UserProfile;
  updateUser: (uid: string, updates: Partial<UserProfile>) => void;
  deleteUser: (uid: string) => void;
  syncLoginUser: (user: UserProfile) => void;
}

const STORAGE_USERS_KEY = 'campuscare_all_users_v2';

export const useUserStore = create<UserStoreState>((set, get) => {
  let initialUsers: UserProfile[] = DEMO_USERS;
  try {
    const saved = localStorage.getItem(STORAGE_USERS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge demo users to guarantee standard accounts are present
        const map = new Map<string, UserProfile>();
        DEMO_USERS.forEach((u) => map.set(u.uid, u));
        parsed.forEach((u: UserProfile) => map.set(u.uid, u));
        initialUsers = Array.from(map.values());
      }
    }
  } catch {
    initialUsers = DEMO_USERS;
  }

  const save = (users: UserProfile[]) => {
    try {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
    } catch {}
  };

  return {
    users: initialUsers,

    addUser: (userData) => {
      const newUser: UserProfile = {
        uid: `user-${userData.role}-${Date.now().toString(36)}`,
        displayName: userData.displayName,
        email: userData.email.toLowerCase().trim(),
        role: userData.role,
        department: userData.department,
        phone: userData.phone || '+91 98000 00000',
        employeeId:
          userData.employeeId ||
          (userData.role === 'employee'
            ? `EMP-${(userData.department || 'GEN').substring(0, 4).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`
            : userData.role === 'manager'
            ? `MGR-ESTATE-${Math.floor(100 + Math.random() * 900)}`
            : undefined),
        collegeId:
          userData.collegeId ||
          (userData.role === 'student'
            ? `MITACSC-2026-${userData.email.split('@')[0]}`
            : userData.role === 'teacher'
            ? `MITACSC-FAC-${Math.floor(100 + Math.random() * 900)}`
            : undefined),
        isActive: true,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      const updated = [newUser, ...get().users];
      set({ users: updated });
      save(updated);
      return newUser;
    },

    updateUser: (uid, updates) => {
      const updated = get().users.map((u) => (u.uid === uid ? { ...u, ...updates } : u));
      set({ users: updated });
      save(updated);
    },

    deleteUser: (uid) => {
      const updated = get().users.filter((u) => u.uid !== uid);
      set({ users: updated });
      save(updated);
    },

    syncLoginUser: (user) => {
      const existing = get().users.find(
        (u) => u.uid === user.uid || u.email.toLowerCase() === user.email.toLowerCase()
      );
      if (!existing) {
        const updated = [user, ...get().users];
        set({ users: updated });
        save(updated);
      } else {
        // update lastLoginAt
        const updated = get().users.map((u) =>
          u.uid === existing.uid ? { ...u, lastLoginAt: new Date().toISOString() } : u
        );
        set({ users: updated });
        save(updated);
      }
    },
  };
});
