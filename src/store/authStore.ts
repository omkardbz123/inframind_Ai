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
  loginWithGoogle: (email?: string, name?: string, forcedRole?: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchUserRole: (role: UserRole) => void;
  setGeminiApiKey: (key: string) => void;
  clearAuthError: () => void;
}

const STORAGE_AUTH_KEY = 'campuscare_current_user';
const STORAGE_GEMINI_KEY = 'campuscare_gemini_key';

export const useAuthStore = create<AuthState>((set, get) => {
  // Try loading saved user session or default to Student
  let initialUser: UserProfile | null = DEMO_USERS[0]; // Student 5454317@mitacsc.edu.in
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

    loginWithGoogle: async (inputEmail?: string, inputName?: string, forcedRole?: UserRole) => {
      const email = (inputEmail || '5454317@mitacsc.edu.in').trim();
      const name = inputName || (email.split('@')[0]);

      // Verify domain strictly
      const emailDomain = email.split('@')[1]?.toLowerCase();
      const isAllowedDomain = COLLEGE_CONFIG.allowedDomains.some(
        (domain) => emailDomain === domain || emailDomain?.endsWith(`.${domain}`)
      );

      if (!isAllowedDomain) {
        const errMsg = `Access Restricted: "${email}" is not a recognized MIT ACSC account. Only verified college emails ending in @mitacsc.edu.in (or @mitacsc.ac.in) are permitted.`;
        set({ authError: errMsg });
        return { success: false, error: errMsg };
      }

      // Check if matches known demo user or create new profile
      const matched = DEMO_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
      
      const determinedRole: UserRole = forcedRole || (matched ? matched.role : (
        email.includes('admin') || email.includes('principal')
          ? 'admin'
          : email.includes('faculty') || email.includes('teacher') || email.includes('dr.') || email.includes('prof')
          ? 'teacher'
          : email.includes('plumb') || email.includes('elec') || email.includes('tech')
          ? 'employee'
          : 'student'
      ));

      const userProfile: UserProfile = matched ? { ...matched, role: determinedRole } : {
        uid: `user-google-${Date.now()}`,
        email,
        displayName: name,
        role: determinedRole,
        collegeId: determinedRole === 'teacher' ? `MITACSC-FAC-${Math.floor(100 + Math.random() * 900)}` : `MITACSC-STU-${email.split('@')[0]}`,
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
