import { create } from 'zustand';
import { UserProfile, UserRole } from '../types/user';
import { DEMO_USERS, COLLEGE_CONFIG } from '../lib/constants';

interface AuthState {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  selectedRole: UserRole;
  customGeminiApiKey: string;
  authError: string | null;

  // Actions
  loginWithGoogle: (email?: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchUserRole: (role: UserRole) => void;
  setGeminiApiKey: (key: string) => void;
  clearAuthError: () => void;
}

const STORAGE_AUTH_KEY = 'campuscare_current_user';
const STORAGE_GEMINI_KEY = 'campuscare_gemini_key';

export const useAuthStore = create<AuthState>((set, get) => {
  // Try loading saved user session or default to Student
  let initialUser: UserProfile | null = DEMO_USERS[0]; // Student Omkar
  try {
    const saved = localStorage.getItem(STORAGE_AUTH_KEY);
    if (saved) {
      initialUser = JSON.parse(saved);
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

    loginWithGoogle: async (inputEmail?: string, inputName?: string) => {
      const email = inputEmail || 'omkar.student@college.edu';
      const name = inputName || 'Omkar Sharma';

      // Verify domain
      const emailDomain = email.split('@')[1]?.toLowerCase();
      const isAllowedDomain = COLLEGE_CONFIG.allowedDomains.some(
        (domain) => emailDomain === domain || emailDomain?.endsWith(`.${domain}`)
      );

      if (!isAllowedDomain) {
        const errMsg = `Access Restricted: "${email}" is not a recognized college Google account. Only @${COLLEGE_CONFIG.domain} accounts are permitted.`;
        set({ authError: errMsg });
        return { success: false, error: errMsg };
      }

      // Check if matches known demo user or create new profile
      const matched = DEMO_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
      const userProfile: UserProfile = matched || {
        uid: `user-google-${Date.now()}`,
        email,
        displayName: name,
        role: email.includes('admin')
          ? 'admin'
          : email.includes('faculty') || email.includes('dr.') || email.includes('prof')
          ? 'teacher'
          : email.includes('plumb') || email.includes('elec') || email.includes('tech')
          ? 'employee'
          : 'student',
        isActive: true,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

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
      // Find corresponding demo user
      const demoMatch = DEMO_USERS.find((u) => u.role === role) || DEMO_USERS[0];
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
