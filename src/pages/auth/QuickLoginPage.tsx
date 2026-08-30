import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  UserCheck,
  Wrench,
  Briefcase,
  ArrowLeft,
  Sparkles,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types/user';

export const QuickLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuthStore();

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
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-maroon-950 to-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-lg space-y-6">
        {/* College Crest & Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-xl p-1.5 ring-4 ring-maroon-800/30">
            <div className="w-full h-full rounded-xl bg-maroon-800 flex flex-col items-center justify-center text-white font-serif font-black tracking-wider">
              <span className="text-xs">MAEER</span>
              <span className="text-[10px] tracking-tight">MIT ACSC</span>
            </div>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
              <span>MIT ACSC CampusCare</span>
              <span className="px-2 py-0.5 bg-amber-400/20 text-amber-300 text-xs font-mono font-bold rounded-md border border-amber-400/30 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                Quick Login
              </span>
            </h1>
            <p className="text-xs text-maroon-200 font-medium">
              MAEER's MIT Arts, Commerce & Science College, Alandi (D.), Pune
            </p>
          </div>
        </div>

        {/* Quick Login Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 space-y-6">
          {/* Header Banner */}
          <div className="p-4 bg-maroon-50 rounded-2xl border border-maroon-100 text-maroon-950 flex items-start gap-3">
            <div className="p-2 bg-maroon-800 text-white rounded-xl shadow-xs shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-maroon-900">
                — Fast 1-Click Evaluation Access —
              </h3>
              <p className="text-xs text-maroon-800/80 leading-relaxed mt-0.5">
                Select any institutional role below to instantly authenticate and evaluate role-specific dashboards, workflows, CCTV AI vision, and permissions.
              </p>
            </div>
          </div>

          {/* Evaluation Roles List */}
          <div className="space-y-3">
            {/* 1. Student (Omkar) */}
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('student')}
              className="w-full p-3.5 rounded-2xl bg-white hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 text-left transition flex items-center justify-between group shadow-xs hover:shadow-md"
            >
              <div className="flex items-center gap-3.5">
                <img
                  src="/avatars/user_5454317.png"
                  alt="Omkar"
                  className="w-10 h-10 rounded-xl object-cover ring-2 ring-emerald-500/30 shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm group-hover:text-emerald-800">
                      Student (Omkar)
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full">
                      Student Role
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    5454317@mitacsc.edu.in
                  </div>
                </div>
              </div>
              <div className="px-3 py-1.5 bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white rounded-xl text-xs font-bold text-slate-700 transition flex items-center gap-1">
                <span>Sign In</span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </button>

            {/* 2. Teacher */}
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('teacher')}
              className="w-full p-3.5 rounded-2xl bg-white hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 text-left transition flex items-center justify-between group shadow-xs hover:shadow-md"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-base shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm group-hover:text-blue-800">
                      Teacher
                    </span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-bold text-[10px] rounded-full">
                      Faculty Role
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    dr.deshpande@mitacsc.edu.in
                  </div>
                </div>
              </div>
              <div className="px-3 py-1.5 bg-slate-100 group-hover:bg-blue-600 group-hover:text-white rounded-xl text-xs font-bold text-slate-700 transition flex items-center gap-1">
                <span>Sign In</span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </button>

            {/* 3. Electrician */}
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('employee')}
              className="w-full p-3.5 rounded-2xl bg-white hover:bg-amber-50/50 border border-slate-200 hover:border-amber-300 text-left transition flex items-center justify-between group shadow-xs hover:shadow-md"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-base shrink-0">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm group-hover:text-amber-800">
                      Electrician
                    </span>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold text-[10px] rounded-full">
                      Technician Role
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">
                    Rajesh Kamble (Senior Electrician)
                  </div>
                </div>
              </div>
              <div className="px-3 py-1.5 bg-slate-100 group-hover:bg-amber-600 group-hover:text-white rounded-xl text-xs font-bold text-slate-700 transition flex items-center gap-1">
                <span>Sign In</span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </button>

            {/* 4. Facilities Manager */}
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('manager')}
              className="w-full p-3.5 rounded-2xl bg-white hover:bg-purple-50/50 border border-slate-200 hover:border-purple-300 text-left transition flex items-center justify-between group shadow-xs hover:shadow-md"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-base shrink-0">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm group-hover:text-purple-800">
                      Facilities Manager
                    </span>
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-800 font-bold text-[10px] rounded-full">
                      Manager Role
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">
                    Er. Ramesh Kulkarni (Facilities Manager)
                  </div>
                </div>
              </div>
              <div className="px-3 py-1.5 bg-slate-100 group-hover:bg-purple-600 group-hover:text-white rounded-xl text-xs font-bold text-slate-700 transition flex items-center gap-1">
                <span>Sign In</span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </button>

            {/* 5. Principal / Admin */}
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('admin')}
              className="w-full p-3.5 rounded-2xl bg-white hover:bg-rose-50/50 border border-slate-200 hover:border-rose-300 text-left transition flex items-center justify-between group shadow-xs hover:shadow-md"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-maroon-100 text-maroon-800 flex items-center justify-center font-bold text-base shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm group-hover:text-maroon-800">
                      Principal / Admin
                    </span>
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-bold text-[10px] rounded-full">
                      Admin Role
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">
                    Dr. B. B. Waphare (Principal & Dean)
                  </div>
                </div>
              </div>
              <div className="px-3 py-1.5 bg-slate-100 group-hover:bg-maroon-800 group-hover:text-white rounded-xl text-xs font-bold text-slate-700 transition flex items-center gap-1">
                <span>Sign In</span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </button>
          </div>

          {/* Navigation Back */}
          <div className="pt-2 text-center border-t border-slate-100">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-xs font-bold text-maroon-800 hover:text-maroon-950 transition hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Standard Institutional Login</span>
            </Link>
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
