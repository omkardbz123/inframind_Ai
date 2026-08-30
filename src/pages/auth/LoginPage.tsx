import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Wrench,
  Briefcase,
  UserCheck,
  ArrowRight,
  Lock,
  Mail,
  AlertCircle,
  Loader2,
  KeyRound,
  CheckCircle2,
  X,
  RefreshCw,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUserStore } from '../../store/userStore';
import { UserRole } from '../../types/user';
import { COLLEGE_CONFIG } from '../../lib/constants';
import { sendPasswordResetOtpEmail } from '../../lib/emailSimulator';

declare global {
  interface Window {
    google?: any;
  }
}

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '632291817556-6qonel2v1pqrv6522meld8jfio14hd42.apps.googleusercontent.com';

const STORAGE_PASSWORDS_KEY = 'campuscare_user_passwords';

function getStoredPasswords(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_PASSWORDS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveUserPassword(email: string, pass: string) {
  const all = getStoredPasswords();
  all[email.toLowerCase().trim()] = pass;
  localStorage.setItem(STORAGE_PASSWORDS_KEY, JSON.stringify(all));
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginWithGoogle, authError, clearAuthError } = useAuthStore();
  const { users } = useUserStore();

  const [inputEmail, setInputEmail] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isAuthenticatingWithGoogle, setIsAuthenticatingWithGoogle] = useState(false);

  // Forgot Password / OTP Reset State
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [inputOtp, setInputOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetStep, setResetStep] = useState<'request' | 'verify'>('request');
  const [resetError, setResetError] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const googleButtonContainerRef = useRef<HTMLDivElement | null>(null);
  const tokenClientRef = useRef<any>(null);

  // Initialize Google Identity Services (GIS) & OAuth2 Token Client
  useEffect(() => {
    const initializeGoogleAuth = () => {
      if (typeof window === 'undefined' || !window.google?.accounts) return;

      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'openid email profile',
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error) {
              setIsAuthenticatingWithGoogle(false);
              setLocalError(`Google Sign-In failed: ${tokenResponse.error_description || tokenResponse.error}`);
              return;
            }

            if (tokenResponse.access_token) {
              try {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: {
                    Authorization: `Bearer ${tokenResponse.access_token}`,
                  },
                });

                if (!res.ok) throw new Error('Failed to retrieve profile from Google');

                const googleUser = await res.json();
                await processAuthenticatedGoogleUser({
                  email: googleUser.email,
                  name: googleUser.name || googleUser.given_name,
                  picture: googleUser.picture,
                });
              } catch (err: any) {
                setIsAuthenticatingWithGoogle(false);
                setLocalError(`Google authentication error: ${err.message}`);
              }
            }
          },
        });
      } catch (e) {
        console.warn('Google Identity Services initialization notice:', e);
      }
    };

    if (window.google?.accounts) {
      initializeGoogleAuth();
    } else {
      const timer = setInterval(() => {
        if (window.google?.accounts) {
          clearInterval(timer);
          initializeGoogleAuth();
        }
      }, 300);
      return () => clearInterval(timer);
    }
  }, []);

  const processAuthenticatedGoogleUser = async ({
    email,
    name,
    picture,
  }: {
    email: string;
    name: string;
    picture?: string;
  }) => {
    setIsAuthenticatingWithGoogle(true);
    setLocalError('');
    clearAuthError();

    const localPart = email.split('@')[0];
    const emailDomain = email.split('@')[1]?.toLowerCase();
    const isCollegeDomain =
      emailDomain === 'mitacsc.edu.in' ||
      emailDomain === 'mitacsc.ac.in' ||
      COLLEGE_CONFIG.allowedDomains.some(
        (domain) => emailDomain === domain || emailDomain?.endsWith(`.${domain}`)
      );

    const matched = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    // Authorization Rule:
    // 1. College email (@mitacsc.edu.in) -> Allowed
    // 2. External email -> Allowed only if registered as employee/staff in directory
    if (!isCollegeDomain && !matched) {
      setIsAuthenticatingWithGoogle(false);
      setLocalError(
        `Access Restricted: External account "${email}" is not an official MIT ACSC college email (@mitacsc.edu.in) and has not been registered as an authorized staff/technician in the system directory.`
      );
      return;
    }

    const startsWithDigit = /^\d/.test(localPart);
    let role: UserRole = 'student';
    if (matched) {
      role = matched.role;
    } else if (startsWithDigit && isCollegeDomain) {
      role = 'student';
    } else if (email.includes('admin') || email.includes('principal')) {
      role = 'admin';
    } else if (email.includes('manager') || email.includes('estate')) {
      role = 'manager';
    } else if (
      email.includes('electrician') ||
      email.includes('plumber') ||
      email.includes('tech') ||
      email.includes('employee')
    ) {
      role = 'employee';
    } else {
      role = 'teacher';
    }

    const finalAvatar =
      picture || (email.startsWith('5454317') ? '/avatars/user_5454317.png' : undefined);

    const loginRes = await loginWithGoogle(email, name, role, finalAvatar);

    if (loginRes.success) {
      window.location.href = '/';
    } else {
      setIsAuthenticatingWithGoogle(false);
      if (loginRes.error) setLocalError(loginRes.error);
    }
  };

  const handleGoogleCredentialResponse = async (response: any) => {
    if (!response.credential) return;

    try {
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);

      await processAuthenticatedGoogleUser({
        email: payload.email,
        name: payload.name || payload.given_name,
        picture: payload.picture,
      });
    } catch (e: any) {
      setLocalError(`Google Token decoding error: ${e.message}`);
    }
  };

  const handleTriggerGoogleOAuth = () => {
    setLocalError('');
    clearAuthError();
    setIsAuthenticatingWithGoogle(true);

    if (tokenClientRef.current) {
      try {
        tokenClientRef.current.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (e) {
        console.warn('tokenClient error:', e);
      }
    }

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(
      window.location.origin
    )}&response_type=token&scope=openid%20profile%20email&prompt=select_account`;

    const width = 500;
    const height = 620;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      authUrl,
      'GoogleSignIn',
      `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes`
    );

    if (!popup) {
      setIsAuthenticatingWithGoogle(false);
      setLocalError('Popup blocked by browser. Please allow popups for Google Sign-In.');
    } else {
      const checkPopup = setInterval(() => {
        if (!popup || popup.closed) {
          clearInterval(checkPopup);
          setIsAuthenticatingWithGoogle(false);
        }
      }, 1000);
    }
  };

  // Password-based Email Sign-In
  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMessage('');
    clearAuthError();

    const trimmedEmail = inputEmail.trim().toLowerCase();
    const emailDomain = trimmedEmail.split('@')[1]?.toLowerCase();
    const isCollegeDomain =
      emailDomain === 'mitacsc.edu.in' ||
      emailDomain === 'mitacsc.ac.in' ||
      COLLEGE_CONFIG.allowedDomains.some(
        (domain) => emailDomain === domain || emailDomain?.endsWith(`.${domain}`)
      );

    const matched = users.find((u) => u.email.toLowerCase() === trimmedEmail);

    // Reject unregistered external emails
    if (!isCollegeDomain && !matched) {
      setLocalError(
        `Access Restricted: "${trimmedEmail}" is not an official MIT ACSC college account (@mitacsc.edu.in) and has not been registered as an authorized staff/technician in the system directory.`
      );
      return;
    }

    // Check Password (stored password or default initial password "mitacsc@123")
    const storedPasswords = getStoredPasswords();
    const validPassword = storedPasswords[trimmedEmail] || 'mitacsc@123';

    if (inputPassword && inputPassword !== validPassword) {
      setLocalError(
        'Incorrect password. Default initial password is "mitacsc@123". If forgotten, click "Forgot Password?" to reset via OTP.'
      );
      return;
    }

    const localPart = trimmedEmail.split('@')[0];
    const startsWithDigit = /^\d/.test(localPart);

    let role: UserRole = 'student';
    if (matched) {
      role = matched.role;
    } else if (startsWithDigit && isCollegeDomain) {
      role = 'student';
    } else if (trimmedEmail.includes('admin') || trimmedEmail.includes('principal')) {
      role = 'admin';
    } else if (trimmedEmail.includes('manager') || trimmedEmail.includes('estate')) {
      role = 'manager';
    } else if (
      trimmedEmail.includes('electrician') ||
      trimmedEmail.includes('plumber') ||
      trimmedEmail.includes('tech') ||
      trimmedEmail.includes('employee')
    ) {
      role = 'employee';
    } else {
      role = 'teacher';
    }

    const userName = matched
      ? matched.displayName
      : startsWithDigit
      ? `Student ${localPart.toUpperCase()}`
      : `Prof. ${localPart.charAt(0).toUpperCase() + localPart.slice(1)}`;

    const avatar = trimmedEmail.startsWith('5454317')
      ? '/avatars/user_5454317.png'
      : matched?.photoURL;

    const res = await loginWithGoogle(trimmedEmail, userName, role, avatar);
    if (res.success) {
      window.location.href = '/';
    }
  };

  // Open Forgot Password Modal
  const handleOpenForgotPassword = () => {
    setResetEmail(inputEmail.trim());
    setResetError('');
    setResetStep('request');
    setInputOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setIsResetModalOpen(true);
  };

  // Send 6-digit OTP
  const handleSendResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');

    const targetEmail = resetEmail.trim().toLowerCase();
    if (!targetEmail) {
      setResetError('Please enter your registered email address.');
      return;
    }

    const emailDomain = targetEmail.split('@')[1]?.toLowerCase();
    const isCollegeDomain =
      emailDomain === 'mitacsc.edu.in' ||
      emailDomain === 'mitacsc.ac.in' ||
      COLLEGE_CONFIG.allowedDomains.some(
        (domain) => emailDomain === domain || emailDomain?.endsWith(`.${domain}`)
      );

    const matched = users.find((u) => u.email.toLowerCase() === targetEmail);

    if (!isCollegeDomain && !matched) {
      setResetError(
        `Access Restricted: "${targetEmail}" is not a recognized college email and is not registered in the staff directory.`
      );
      return;
    }

    setIsSendingOtp(true);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);

    // Send email with OTP
    sendPasswordResetOtpEmail(targetEmail, otp);

    setTimeout(() => {
      setIsSendingOtp(false);
      setResetStep('verify');
    }, 600);
  };

  // Verify OTP and Set New Password
  const handleVerifyAndResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');

    if (inputOtp.trim() !== generatedOtp.trim()) {
      setResetError('Invalid verification code. Please enter the exact 6-digit OTP received in your email.');
      return;
    }

    if (newPassword.length < 6) {
      setResetError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match. Please re-enter.');
      return;
    }

    const targetEmail = resetEmail.trim().toLowerCase();
    saveUserPassword(targetEmail, newPassword);

    setIsResetModalOpen(false);
    setInputEmail(targetEmail);
    setInputPassword(newPassword);
    setSuccessMessage('Password reset successfully! You can now sign in with your new password.');
  };

  const handleQuickDemoLogin = async (role: UserRole) => {
    const demoAccounts: Record<
      UserRole,
      { email: string; name: string; photoURL?: string }
    > = {
      student: {
        email: '5454317@mitacsc.edu.in',
        name: 'Omkar Bhujbal (TE3302)',
        photoURL: '/avatars/user_5454317.png',
      },
      teacher: {
        email: 'dr.deshpande@mitacsc.edu.in',
        name: 'Dr. Rajiv Deshpande (Prof. CS)',
      },
      employee: {
        email: 'rajesh.electrician@mitacsc.edu.in',
        name: 'Rajesh Kamble (Senior Electrician)',
      },
      manager: {
        email: 'ramesh.manager@mitacsc.edu.in',
        name: 'Er. Ramesh Kulkarni (Facilities Manager)',
      },
      admin: {
        email: 'principal.admin@mitacsc.edu.in',
        name: 'Dr. B. B. Waphare (Principal & Dean)',
      },
    };

    const target = demoAccounts[role];
    const res = await loginWithGoogle(target.email, target.name, role, target.photoURL);
    if (res.success) {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-maroon-950 to-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md space-y-6">
        {/* College Header Crest */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-xl p-1.5 ring-4 ring-maroon-800/30">
            <div className="w-full h-full rounded-xl bg-maroon-800 flex flex-col items-center justify-center text-white font-serif font-black tracking-wider">
              <span className="text-xs">MAEER</span>
              <span className="text-[10px] tracking-tight">MIT ACSC</span>
            </div>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              MIT ACSC CampusCare
            </h1>
            <p className="text-xs text-maroon-200 font-medium">
              MAEER's MIT Arts, Commerce & Science College, Alandi (D.), Pune
            </p>
          </div>
        </div>

        {/* Main Login Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-7 shadow-2xl border border-white/20 space-y-5">
          {/* Domain Notice Banner */}
          <div className="p-3 bg-maroon-50 rounded-xl border border-maroon-100 text-xs text-maroon-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-maroon-800 shrink-0" />
            <div className="text-[11px] leading-tight">
              <strong>Institutional Single Sign-On:</strong> Enter your registered college ID (e.g. <code>@mitacsc.edu.in</code>) or authorized staff email.
            </div>
          </div>

          {/* Success Message Banner */}
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Message */}
          {(localError || authError) && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{localError || authError}</span>
            </div>
          )}

          {/* Google Sign-In Primary Button */}
          <button
            type="button"
            disabled={isAuthenticatingWithGoogle}
            onClick={handleTriggerGoogleOAuth}
            className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-2xl font-bold text-xs flex items-center justify-center gap-3 shadow-xs hover:shadow-md transition active:scale-98 disabled:opacity-50"
          >
            {isAuthenticatingWithGoogle ? (
              <Loader2 className="w-4 h-4 animate-spin text-maroon-800" />
            ) : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            )}
            <span>
              {isAuthenticatingWithGoogle
                ? 'Authenticating with Google...'
                : 'Sign in with Google Workspace (@mitacsc.edu.in)'}
            </span>
          </button>

          {/* Hidden GSI container */}
          <div ref={googleButtonContainerRef} className="hidden" />

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Or Sign In With Password
            </span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Email & Password Login Form */}
          <form onSubmit={handleEmailPasswordLogin} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>Email Address:</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setInputEmail('5454317@mitacsc.edu.in');
                    setInputPassword('mitacsc@123');
                  }}
                  className="text-[11px] text-maroon-800 font-semibold hover:underline"
                >
                  Fill Sample
                </button>
              </div>

              <input
                type="email"
                required
                placeholder="e.g. 5454317@mitacsc.edu.in or sbkhole@mitacsc.edu.in"
                value={inputEmail}
                onChange={(e) => setInputEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-maroon-700 font-medium text-xs"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Password:</span>
                </label>
                <button
                  type="button"
                  onClick={handleOpenForgotPassword}
                  className="text-[11px] text-maroon-800 font-semibold hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              <input
                type="password"
                required
                placeholder="Enter account password (default: mitacsc@123)"
                value={inputPassword}
                onChange={(e) => setInputPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-maroon-700 font-medium text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-maroon-800 hover:bg-maroon-900 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition active:scale-98 text-xs"
            >
              <Lock className="w-4 h-4" />
              <span>Sign In to Campus Portal</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </form>

          {/* Quick Demo Evaluator Access */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <div className="text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                — Fast 1-Click Evaluation Access —
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('student')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-maroon-50 border border-slate-200 hover:border-maroon-200 text-left transition flex items-center gap-2"
              >
                <img
                  src="/avatars/user_5454317.png"
                  alt="Omkar"
                  className="w-5 h-5 rounded-full object-cover ring-1 ring-maroon-300 shrink-0"
                />
                <div className="truncate">
                  <div className="font-bold text-slate-900">Student (Omkar)</div>
                  <div className="text-[10px] text-slate-500 truncate">5454317@mitacsc.edu.in</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('teacher')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-maroon-50 border border-slate-200 hover:border-maroon-200 text-left transition flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <div className="truncate">
                  <div className="font-bold text-slate-900">Teacher</div>
                  <div className="text-[10px] text-slate-500 truncate">dr.deshpande@mitacsc.edu.in</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('employee')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-maroon-50 border border-slate-200 hover:border-maroon-200 text-left transition flex items-center gap-2"
              >
                <Wrench className="w-4 h-4 text-amber-600 shrink-0" />
                <div className="truncate">
                  <div className="font-bold text-slate-900">Electrician</div>
                  <div className="text-[10px] text-slate-500 truncate">Rajesh Kamble</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('manager')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-maroon-50 border border-slate-200 hover:border-maroon-200 text-left transition flex items-center gap-2"
              >
                <Briefcase className="w-4 h-4 text-purple-600 shrink-0" />
                <div className="truncate">
                  <div className="font-bold text-slate-900">Facilities Manager</div>
                  <div className="text-[10px] text-slate-500 truncate">Er. Ramesh Kulkarni</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin')}
                className="col-span-2 p-2.5 rounded-xl bg-slate-50 hover:bg-maroon-50 border border-slate-200 hover:border-maroon-200 text-left transition flex items-center gap-2"
              >
                <Shield className="w-4 h-4 text-maroon-800 shrink-0" />
                <div className="truncate">
                  <div className="font-bold text-slate-900">Principal / Admin</div>
                  <div className="text-[10px] text-slate-500 truncate">Dr. B. B. Waphare (Principal & Dean)</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 space-y-1">
          <p>MIT Arts, Commerce & Science College, Alandi (D.), Pune - 412105</p>
          <p className="text-[11px]">Smart India Hackathon • CampusCare Infrastructure Portal</p>
        </div>
      </div>

      {/* Forgot Password / OTP Reset Modal Dialog */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 sm:p-7 space-y-5 text-slate-900">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-maroon-800 text-white flex items-center justify-center font-bold">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Reset Account Password</h3>
                  <p className="text-xs text-slate-500">MIT ACSC Security Verification</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-900 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {resetError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{resetError}</span>
              </div>
            )}

            {resetStep === 'request' ? (
              <form onSubmit={handleSendResetOtp} className="space-y-4 text-xs">
                <p className="text-slate-600 leading-relaxed">
                  Enter your official college email address. We will send a secure 6-digit verification code (OTP) to your inbox to reset your password.
                </p>

                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">Registered Email ID:</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. 5454317@mitacsc.edu.in"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-maroon-700 font-medium"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Allowed: <strong>@mitacsc.edu.in</strong> or authorized employee accounts.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsResetModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingOtp}
                    className="px-5 py-2.5 bg-maroon-800 hover:bg-maroon-900 text-white font-bold rounded-xl flex items-center gap-2 shadow-xs transition"
                  >
                    {isSendingOtp && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Send Verification Code</span>
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyAndResetPassword} className="space-y-4 text-xs">
                <div className="p-3 bg-maroon-50 rounded-xl border border-maroon-100 text-[11px] text-maroon-900">
                  We dispatched a 6-digit code to <strong>{resetEmail}</strong>. (Also logged in Sent Logs for demo).
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">6-Digit Verification Code (OTP):</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="e.g. 482910"
                    value={inputOtp}
                    onChange={(e) => setInputOtp(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-maroon-700 font-mono font-bold tracking-widest text-center text-base"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">New Password:</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter new password (min. 6 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-maroon-700 font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">Confirm New Password:</label>
                  <input
                    type="password"
                    required
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-maroon-700 font-medium"
                  />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => handleSendResetOtp({ preventDefault: () => {} } as any)}
                    className="text-[11px] text-maroon-800 font-bold hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Resend Code</span>
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsResetModalOpen(false)}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-maroon-800 hover:bg-maroon-900 text-white font-bold rounded-xl shadow-xs transition"
                    >
                      Reset Password
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
