import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types/user';
import { Shield, GraduationCap, Briefcase, Wrench, Sparkles, UserCheck } from 'lucide-react';

const ROLE_META: Record<
  UserRole,
  { label: string; sub: string; icon: React.ElementType }
> = {
  student: {
    label: 'Student',
    sub: 'Omkar (TE Comp)',
    icon: GraduationCap,
  },
  teacher: {
    label: 'Teacher',
    sub: 'Dr. Rajiv Deshpande',
    icon: UserCheck,
  },
  employee: {
    label: 'Technician',
    sub: 'Rajesh (Electrical)',
    icon: Wrench,
  },
  manager: {
    label: 'Manager',
    sub: 'Er. Ramesh Kulkarni',
    icon: Briefcase,
  },
  admin: {
    label: 'Principal',
    sub: 'Dr. B. B. Waphare',
    icon: Shield,
  },
};

export const RoleSwitcherPill: React.FC = () => {
  const { selectedRole, switchUserRole } = useAuthStore();

  return (
    <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-full shadow-xs max-w-full overflow-hidden">
      <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full bg-maroon-50 text-maroon-900 border border-maroon-100 shrink-0">
        <Sparkles className="w-3 h-3 text-maroon-700" />
        <span>Role:</span>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 px-0.5 max-w-full">
        {(Object.keys(ROLE_META) as UserRole[]).map((r) => {
          const isSelected = selectedRole === r;
          const meta = ROLE_META[r];
          const RIcon = meta.icon;

          return (
            <button
              key={r}
              onClick={() => switchUserRole(r)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-all ${
                isSelected
                  ? 'bg-maroon-800 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-maroon-900 hover:bg-slate-100'
              }`}
              title={meta.sub}
            >
              <RIcon className="w-3.5 h-3.5 shrink-0" />
              <span>{meta.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
