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
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { COLLEGE_CONFIG } from '../../lib/constants';
import { UserRole } from '../../types/user';

interface GoogleJwtPayload {
  email: string;
  name: string;
  picture?: string;
  sub: string;
  hd?: string; // Hosted Domain (e.g. mitacsc.ac.in)
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginWithGoogle, switchUserRole } = useAuthStore();

  const [inputEmail, setInputEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Handle Real Google OAuth Login
  const handleGoogleSuccess = async (credentialResponse: any) => {
    setErrorMsg('');
    try {
      if (!credentialResponse.credential) {
        throw new Error('Google credential token not received.');
      }

      const decoded: GoogleJwtPayload = jwtDecode(credentialResponse.credential);
      const email = decoded.email?.toLowerCase();
      const name = decoded.name;
      const hostedDomain = decoded.hd;

      // Restrict strictly to college domains (e.g. mitacsc.ac.in, mitacsc.edu.in, college.edu)
      const isAllowed =
        (hostedDomain && COLLEGE_CONFIG.allowedDomains.includes(hostedDomain)) ||
        COLLEGE_CONFIG.allowedDomains.some((d) => email.endsWith(`@${d}`));

      if (!isAllowed) {
        setErrorMsg(
          `Access Denied: Account "${email}" does not belong to @${COLLEGE_CONFIG.domain}. Only students & teachers of MIT ACSC are authorized to access this portal.`
        );
        return;
      }

      const res = await loginWithGoogle(email, name);
      if (res.success) {
        navigate('/');
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

    const res = await loginWithGoogle(inputEmail);
    if (res.success) {
      navigate('/');
    } else {
      setErrorMsg(res.error || 'Access Denied');
    }
  };

  const handleQuickDemoLogin = (role: UserRole) => {
    switchUserRole(role);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* College Header */}
        <div className="text-center space-y-2">
          {/* Logo Badge */}
          <div className="w-16 h-16 rounded-3xl bg-maroon-800 flex items-center justify-center text-white mx-auto shadow-lg shadow-maroon-900/20 ring-4 ring-maroon-100">
            <span className="font-serif font-black text-xl tracking-tighter">MIT</span>
          </div>

          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            MIT ACSC <span className="text-maroon-800">CampusCare</span>
          </h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {COLLEGE_CONFIG.name}
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-semibold bg-maroon-50 text-maroon-900 border border-maroon-200">
            <Sparkles className="w-3 h-3 text-maroon-700" />
            <span>AI CCTV Vision & Predictive Infrastructure Portal</span>
          </div>
        </div>

        {/* Login Box */}
        <div className="white-card p-6 sm:p-8 rounded-3xl space-y-5 shadow-md">
          <div>
            <h2 className="text-base font-bold text-slate-900">Sign In with College Google Account</h2>
            <p className="text-xs text-slate-500">
              Only verified faculty & students (@mitacsc.ac.in) have portal access
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Real Google OAuth Button */}
          <div className="flex justify-center w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setErrorMsg('Google Sign-In popup closed or failed.')}
              theme="outline"
              size="large"
              shape="pill"
              text="signin_with"
              logo_alignment="center"
              width="360"
            />
          </div>

          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-2 text-[10px] uppercase font-bold text-slate-400">
              Or Enter Email
            </span>
            <div className="border-t border-slate-200 w-full" />
          </div>

          {/* Fallback Email Input */}
          <form onSubmit={handleDomainLogin} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                College Email Address:
              </label>
              <input
                type="email"
                required
                placeholder="your.name@mitacsc.ac.in"
                value={inputEmail}
                onChange={(e) => setInputEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-maroon-700"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Verify Domain & Continue</span>
            </button>
          </form>

          {/* Quick Demo Access Switcher */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                — Quick 1-Click Demo Evaluation Roles —
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
                  <div className="text-[10px] text-slate-500 truncate">Omkar Sharma</div>
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
                  <div className="text-[10px] text-slate-500 truncate">Dr. Deshpande</div>
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
                  <div className="font-bold text-slate-900">Manager</div>
                  <div className="text-[10px] text-slate-500 truncate">Er. Ramesh</div>
                </div>
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('admin')}
              className="w-full p-2.5 rounded-xl bg-maroon-50 hover:bg-maroon-100 border border-maroon-200 text-left transition flex items-center justify-between"
            >
              <div className="flex items-center gap-2 text-xs">
                <Shield className="w-4 h-4 text-maroon-800 shrink-0" />
                <div>
                  <div className="font-bold text-maroon-900">College Principal / Campus Admin</div>
                  <div className="text-[10px] text-maroon-700">Dr. B. B. Waphare</div>
                </div>
              </div>
              <span className="text-maroon-800 font-bold text-xs">Enter Portal →</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
