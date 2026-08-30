import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  UserCheck,
  Shield,
  Wrench,
  Briefcase,
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  AlertCircle,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types/user';
import { COLLEGE_CONFIG } from '../../lib/constants';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginWithGoogle, authError, clearAuthError } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'student' | 'teacher'>('student');
  const [inputEmail, setInputEmail] = useState('');
  const [localError, setLocalError] = useState('');

  const handleDomainLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearAuthError();

    const trimmed = inputEmail.trim().toLowerCase();
    const emailDomain = trimmed.split('@')[1]?.toLowerCase();
    const isAllowedDomain = COLLEGE_CONFIG.allowedDomains.some(
      (domain) => emailDomain === domain || emailDomain?.endsWith(`.${domain}`)
    );

    if (!isAllowedDomain) {
      setLocalError(
        'Access Restricted: Only official college email addresses ending with @mitacsc.edu.in or @mitacsc.ac.in are permitted.'
      );
      return;
    }

    const userName =
      activeTab === 'student'
        ? trimmed.split('@')[0].toUpperCase()
        : `Prof. ${trimmed.split('@')[0]}`;

    const res = await loginWithGoogle(trimmed, userName, activeTab);
    if (res.success) {
      navigate('/');
    }
  };

  const handleGoogleOneClick = async () => {
    setLocalError('');
    clearAuthError();

    const typedEmail = inputEmail.trim();
    const emailToUse =
      typedEmail || (activeTab === 'student' ? '5454317@mitacsc.edu.in' : 'dr.deshpande@mitacsc.edu.in');

    const nameToUse = typedEmail
      ? (activeTab === 'student' ? `Student ${typedEmail.split('@')[0]}` : `Prof. ${typedEmail.split('@')[0]}`)
      : (activeTab === 'student' ? 'Omkar Sharma (Student)' : 'Dr. Rajiv Deshpande (Prof. CS)');

    const googleAvatar =
      activeTab === 'student'
        ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80';

    const res = await loginWithGoogle(emailToUse, nameToUse, activeTab, googleAvatar);
    if (res.success) {
      window.location.href = '/';
    } else if (res.error) {
      setLocalError(res.error);
    }
  };

  const handleQuickDemoLogin = async (role: UserRole) => {
    const demoAccounts: Record<UserRole, { email: string; name: string }> = {
      student: {
        email: '5454317@mitacsc.edu.in',
        name: 'Omkar (TY B.Sc CS)',
      },
      teacher: {
        email: 'dr.deshpande@mitacsc.edu.in',
        name: 'Dr. Deshpande (HOD Comp Sci)',
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
    const res = await loginWithGoogle(target.email, target.name, role);
    if (res.success) {
      navigate('/');
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
          {/* Segmented Tab Switcher */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setActiveTab('student');
                setLocalError('');
                clearAuthError();
              }}
              className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                activeTab === 'student'
                  ? 'bg-maroon-800 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student Login</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('teacher');
                setLocalError('');
                clearAuthError();
              }}
              className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                activeTab === 'teacher'
                  ? 'bg-maroon-800 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Teacher / Faculty</span>
            </button>
          </div>

          {/* Domain Notice Banner */}
          <div className="p-3 bg-maroon-50 rounded-xl border border-maroon-100 text-xs text-maroon-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-maroon-800 shrink-0" />
            <div className="text-[11px] leading-tight">
              <strong>Institutional Single Sign-On:</strong> Requires valid college email ID (e.g. <code>@mitacsc.edu.in</code>).
            </div>
          </div>

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
            onClick={handleGoogleOneClick}
            className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-2xl font-bold text-xs flex items-center justify-center gap-3 shadow-xs hover:shadow-md transition active:scale-98"
          >
            {/* Google SVG G-Icon */}
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
            <span>Sign in with Google Workspace (@mitacsc.edu.in)</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Or Enter College Email
            </span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Email Input Form */}
          <form onSubmit={handleDomainLogin} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>College Email ID:</span>
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setInputEmail(
                      activeTab === 'student' ? '5454317@mitacsc.edu.in' : 'dr.deshpande@mitacsc.edu.in'
                    )
                  }
                  className="text-[11px] text-maroon-800 font-semibold hover:underline"
                >
                  Fill Sample
                </button>
              </div>

              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder={
                    activeTab === 'student' ? 'e.g. 5454317@mitacsc.edu.in' : 'e.g. faculty.name@mitacsc.edu.in'
                  }
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-maroon-700 font-medium text-xs"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Must end with <strong>@mitacsc.edu.in</strong> or <strong>@mitacsc.ac.in</strong>
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-maroon-800 hover:bg-maroon-900 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition active:scale-98 text-xs"
            >
              <Lock className="w-4 h-4" />
              <span>Enter {activeTab === 'student' ? 'Student' : 'Teacher'} Portal</span>
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
                <GraduationCap className="w-4 h-4 text-maroon-700 shrink-0" />
                <div className="truncate">
                  <div className="font-bold text-slate-900">Student</div>
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
    </div>
  );
};
