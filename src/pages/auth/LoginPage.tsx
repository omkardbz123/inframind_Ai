import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import {
  Sparkles,
  Shield,
  GraduationCap,
  Briefcase,
  Wrench,
  UserCheck,
  Lock,
  AlertTriangle,
  CheckCircle2,
  Building2,
  ArrowRight,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { COLLEGE_CONFIG } from '../../lib/constants';
import { UserRole } from '../../types/user';

interface GoogleJwtPayload {
  email: string;
  name: string;
  picture?: string;
  sub: string;
  hd?: string;
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginWithGoogle, switchUserRole } = useAuthStore();

  // Active Login Portal Tab: 'student' or 'teacher'
  const [activeTab, setActiveTab] = useState<'student' | 'teacher'>('student');
  const [inputEmail, setInputEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Handle Real Google OAuth Login
  const handleGoogleSuccess = async (credentialResponse: any) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      if (!credentialResponse.credential) {
        throw new Error('Google credential token not received.');
      }

      const decoded: GoogleJwtPayload = jwtDecode(credentialResponse.credential);
      const email = decoded.email?.toLowerCase();
      const name = decoded.name;
      const hostedDomain = decoded.hd;

      // Verify domain strictly matches @mitacsc.edu.in or @mitacsc.ac.in
      const isAllowed =
        (hostedDomain && COLLEGE_CONFIG.allowedDomains.includes(hostedDomain)) ||
        COLLEGE_CONFIG.allowedDomains.some((d) => email.endsWith(`@${d}`));

      if (!isAllowed) {
        setErrorMsg(
          `Access Denied: Account "${email}" does not belong to @${COLLEGE_CONFIG.domain}. Only students & teachers of MIT ACSC with @mitacsc.edu.in are authorized.`
        );
        return;
      }

      setSuccessMsg(`Welcome, ${name}! Redirecting to ${activeTab === 'student' ? 'Student' : 'Faculty'} Portal...`);
      const res = await loginWithGoogle(email, name, activeTab);
      if (res.success) {
        setTimeout(() => navigate('/'), 600);
      } else {
        setErrorMsg(res.error || 'Authentication error');
      }
    } catch (err: any) {
      setErrorMsg(`Google Authentication Error: ${err.message || 'Login failed'}`);
    }
  };

  const handleDomainLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const email = inputEmail.trim().toLowerCase();

    // Check if email ends with @mitacsc.edu.in or @mitacsc.ac.in
    const isValidCollegeEmail = COLLEGE_CONFIG.allowedDomains.some(
      (domain) => email.endsWith(`@${domain}`)
    );

    if (!isValidCollegeEmail) {
      setErrorMsg(
        `Invalid Domain: Only official email addresses ending with @mitacsc.edu.in (e.g. 5454317@mitacsc.edu.in) are permitted to log in.`
      );
      return;
    }

    const res = await loginWithGoogle(email, undefined, activeTab);
    if (res.success) {
      setSuccessMsg(`Login verified for ${email}! Redirecting...`);
      setTimeout(() => navigate('/'), 500);
    } else {
      setErrorMsg(res.error || 'Access Denied');
    }
  };

  const handleQuickFill = (email: string) => {
    setInputEmail(email);
    setErrorMsg('');
  };

  const handleQuickDemoLogin = (role: UserRole) => {
    switchUserRole(role);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* College Header */}
        <div className="text-center space-y-2">
          {/* Logo Badge */}
          <div className="w-16 h-16 rounded-3xl bg-maroon-800 flex items-center justify-center text-white mx-auto shadow-lg shadow-maroon-900/20 ring-4 ring-maroon-100">
            <span className="font-serif font-black text-2xl tracking-tighter">MIT</span>
          </div>

          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            MIT ACSC <span className="text-maroon-800">CampusCare</span>
          </h1>
          <p className="text-xs font-medium text-slate-600 max-w-sm mx-auto">
            {COLLEGE_CONFIG.name}
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-maroon-50 text-maroon-900 border border-maroon-200">
            <Sparkles className="w-3.5 h-3.5 text-maroon-700" />
            <span>Official Student & Teacher Maintenance Portal</span>
          </div>
        </div>

        {/* Main Login Card */}
        <div className="white-card p-6 sm:p-8 rounded-3xl space-y-6 shadow-md border border-slate-200">
          {/* Portal Switcher Tabs */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-100 rounded-2xl gap-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab('student');
                setErrorMsg('');
                setInputEmail('5454317@mitacsc.edu.in');
              }}
              className={`py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'student'
                  ? 'bg-white text-maroon-900 shadow-sm border border-slate-200/80 font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className={`w-4 h-4 ${activeTab === 'student' ? 'text-maroon-800' : 'text-slate-400'}`} />
              <span>Student Login</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('teacher');
                setErrorMsg('');
                setInputEmail('dr.deshpande@mitacsc.edu.in');
              }}
              className={`py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'teacher'
                  ? 'bg-white text-maroon-900 shadow-sm border border-slate-200/80 font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className={`w-4 h-4 ${activeTab === 'teacher' ? 'text-maroon-800' : 'text-slate-400'}`} />
              <span>Teacher / Faculty Login</span>
            </button>
          </div>

          {/* Portal Subtitle */}
          <div className="p-3 bg-maroon-50/70 border border-maroon-100 rounded-2xl flex items-center justify-between text-xs">
            <div>
              <div className="font-bold text-maroon-950">
                {activeTab === 'student' ? '🎓 MIT ACSC Student Portal' : '👨‍🏫 MIT ACSC Faculty Portal'}
              </div>
              <div className="text-[11px] text-maroon-800">
                {activeTab === 'student'
                  ? 'Report classroom breakdowns, track repairs & rate services'
                  : 'Report lecture hall & lab issues with priority dispatch'}
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-maroon-800 text-white shrink-0">
              @mitacsc.edu.in
            </span>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium flex items-start gap-2 animate-in fade-in duration-150">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 1. Official Google OAuth Button */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">
              Quick Google Single Sign-On
            </label>
            <div className="flex justify-center w-full">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setErrorMsg('Google Sign-In popup closed or failed.')}
                theme="outline"
                size="large"
                shape="pill"
                text="signin_with"
                logo_alignment="center"
                width="380"
              />
            </div>
          </div>

          <div className="relative flex items-center justify-center my-1">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[10px] uppercase font-bold text-slate-400">
              Or Sign In with College Email
            </span>
            <div className="border-t border-slate-200 w-full" />
          </div>

          {/* 2. Direct College Email Form */}
          <form onSubmit={handleDomainLogin} className="space-y-3.5 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700">
                  {activeTab === 'student' ? 'Student College Email:' : 'Faculty College Email:'}
                </label>
                <button
                  type="button"
                  onClick={() =>
                    handleQuickFill(
                      activeTab === 'student' ? '5454317@mitacsc.edu.in' : 'dr.deshpande@mitacsc.edu.in'
                    )
                  }
                  className="text-[11px] text-maroon-800 font-semibold hover:underline"
                >
                  Fill Sample: {activeTab === 'student' ? '5454317@mitacsc.edu.in' : 'dr.deshpande@mitacsc.edu.in'}
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
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-maroon-700 font-medium"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Must end with <strong>@mitacsc.edu.in</strong> or <strong>@mitacsc.ac.in</strong>
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-maroon-800 hover:bg-maroon-900 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition"
            >
              <Lock className="w-4 h-4" />
              <span>Enter {activeTab === 'student' ? 'Student' : 'Teacher'} Portal</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </form>

          {/* Quick Demo Evaluator Drawer */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
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
                onClick={() => handleQuickDemoLogin('admin')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-maroon-50 border border-slate-200 hover:border-maroon-200 text-left transition flex items-center gap-2"
              >
                <Shield className="w-4 h-4 text-maroon-800 shrink-0" />
                <div className="truncate">
                  <div className="font-bold text-slate-900">Principal / Admin</div>
                  <div className="text-[10px] text-slate-500 truncate">Dr. B. B. Waphare</div>
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
