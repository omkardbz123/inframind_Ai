import { create } from 'zustand';
import { UserProfile, UserRole } from '../types/user';
import { DEMO_USERS, COLLEGE_CONFIG } from '../lib/constants';
import { useUserStore } from './userStore';

interface AuthState {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  selectedRole: UserRole;
  customGeminiApiKey: string;
  authError: string | null;

  // Actions
  loginWithGoogle: (
    email?: string,
    name?: string,
    forcedRole?: UserRole,
    photoURL?: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchUserRole: (role: UserRole) => void;
  setGeminiApiKey: (key: string) => void;
  clearAuthError: () => void;
}

const STORAGE_AUTH_KEY = 'campuscare_current_user';
const STORAGE_GEMINI_KEY = 'campuscare_gemini_key';

export const useAuthStore = create<AuthState>((set, get) => {
  let initialUser: UserProfile | null = DEMO_USERS[0];
  try {
    const saved = localStorage.getItem(STORAGE_AUTH_KEY);
    if (saved) {
      initialUser = JSON.parse(saved);
      if (initialUser && initialUser.email === '5454317@mitacsc.edu.in') {
        initialUser.photoURL = '/avatars/user_5454317.png';
        initialUser.displayName = 'Omkar Bhujbal';
      }
    }
  } catch {
    initialUser = DEMO_USERS[0];
  }

  const savedApiKey = localStorage.getItem(STORAGE_GEMINI_KEY) || '';

  return {
    currentUser: initialUser,
    isAuthenticated: !!initialUser,
    selectedRole: initialUser?.role || 'student',
    customGeminiApiKey: savedApiKey,
    authError: null,

    loginWithGoogle: async (
      inputEmail?: string,
      inputName?: string,
      forcedRole?: UserRole,
      photoURL?: string
    ) => {
      const email = (inputEmail || '5454317@mitacsc.edu.in').trim().toLowerCase();
      const localPart = email.split('@')[0];
      const emailDomain = email.split('@')[1]?.toLowerCase();

      // Verify domain - allow mitacsc.edu.in, mitacsc.ac.in, and gmail.com
      const isAllowedDomain =
        !emailDomain ||
        COLLEGE_CONFIG.allowedDomains.some(
          (domain) => emailDomain === domain || emailDomain?.endsWith(`.${domain}`)
        );

      if (!isAllowedDomain) {
        const errMsg = `Access Restricted: "${email}" is not a recognized MIT ACSC account. Only verified college emails ending in @mitacsc.edu.in (or @mitacsc.ac.in) are permitted.`;
        set({ authError: errMsg });
        return { success: false, error: errMsg };
      }

      // Check if matches known user in store or demo users
      const allUsers = useUserStore.getState().users;
      const matched = allUsers.find((u) => u.email.toLowerCase() === email);

      const startsWithDigit = /^\d/.test(localPart);

      let determinedRole: UserRole = 'student';
      if (forcedRole) {
        determinedRole = forcedRole;
      } else if (matched) {
        determinedRole = matched.role;
      } else if (startsWithDigit) {
        determinedRole = 'student';
      } else {
        if (localPart.includes('admin') || localPart.includes('principal')) {
          determinedRole = 'admin';
        } else if (localPart.includes('manager') || localPart.includes('estate')) {
          determinedRole = 'manager';
        } else if (
          localPart.includes('electrician') ||
          localPart.includes('plumber') ||
          localPart.includes('tech') ||
          localPart.includes('employee')
        ) {
          determinedRole = 'employee';
        } else {
          determinedRole = 'teacher';
        }
      }

      let resolvedDisplayName = inputName;
      if (!resolvedDisplayName) {
        if (matched) {
          resolvedDisplayName = matched.displayName;
        } else if (email === '5454317@mitacsc.edu.in') {
          resolvedDisplayName = 'Omkar Bhujbal';
        } else if (determinedRole === 'student') {
          resolvedDisplayName = `Student ${localPart.toUpperCase()}`;
        } else if (determinedRole === 'teacher') {
          const capitalized = localPart.charAt(0).toUpperCase() + localPart.slice(1);
          resolvedDisplayName = `Prof. ${capitalized}`;
        } else {
          resolvedDisplayName = localPart;
        }
      }

      const defaultAvatar =
        email === '5454317@mitacsc.edu.in'
          ? '/avatars/user_5454317.png'
          : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(resolvedDisplayName)}&backgroundColor=800020&textColor=ffffff`;

      const avatarUrl = photoURL || matched?.photoURL || defaultAvatar;

      const userProfile: UserProfile = matched
        ? { ...matched, role: determinedRole, displayName: resolvedDisplayName, photoURL: avatarUrl }
        : {
            uid: `user-${determinedRole}-${Date.now().toString(36)}`,
            email,
            displayName: resolvedDisplayName,
            photoURL: avatarUrl,
            role: determinedRole,
            collegeId:
              determinedRole === 'student'
                ? `MITACSC-2026-${localPart}`
                : determinedRole === 'teacher'
                ? `MITACSC-FAC-${Math.floor(100 + Math.random() * 900)}`
                : undefined,
            employeeId:
              determinedRole === 'employee'
                ? `EMP-STAFF-${Math.floor(100 + Math.random() * 900)}`
                : determinedRole === 'manager'
                ? `MGR-ESTATE-${Math.floor(100 + Math.random() * 900)}`
                : undefined,
            isActive: true,
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
          };

      useUserStore.getState().syncLoginUser(userProfile);

      localStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify(userProfile));
      set({
        currentUser: userProfile,
        isAuthenticated: true,
        selectedRole: userProfile.role,
        authError: null,
      });

      return { success: true };
    },

    logout: () => {
      localStorage.removeItem(STORAGE_AUTH_KEY);
      set({
        currentUser: null,
        isAuthenticated: false,
        selectedRole: 'student',
        authError: null,
      });
    },

    switchUserRole: (role: UserRole) => {
      const allUsers = useUserStore.getState().users;
      const demoMatch =
        allUsers.find((u) => u.role === role) ||
        DEMO_USERS.find((u) => u.role === role) ||
        DEMO_USERS[0];
      localStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify(demoMatch));
      set({
        currentUser: demoMatch,
        isAuthenticated: true,
        selectedRole: role,
        authError: null,
      });
    },

    setGeminiApiKey: (key: string) => {
      localStorage.setItem(STORAGE_GEMINI_KEY, key);
      set({ customGeminiApiKey: key });
    },

    clearAuthError: () => set({ authError: null }),
  };
});
