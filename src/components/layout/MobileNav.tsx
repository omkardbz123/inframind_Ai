import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Ticket, Wrench, Video, MapPin } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const MobileNav: React.FC = () => {
  const { selectedRole } = useAuthStore();

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 shadow-lg px-2 py-1.5 flex items-center justify-around safe-area-pb">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-medium transition ${
            isActive ? 'text-maroon-800 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`
        }
      >
        <LayoutDashboard className="w-5 h-5" />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/report-fault"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-medium transition ${
            isActive ? 'text-maroon-800 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`
        }
      >
        <div className="p-1.5 rounded-full bg-maroon-800 text-white shadow-md shadow-maroon-900/20 -mt-4 ring-4 ring-white">
          <PlusCircle className="w-5 h-5" />
        </div>
        <span>Report</span>
      </NavLink>

      {selectedRole === 'employee' ? (
        <NavLink
          to="/assigned-tasks"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-medium transition ${
              isActive ? 'text-maroon-800 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`
          }
        >
          <Wrench className="w-5 h-5" />
          <span>My Tasks</span>
        </NavLink>
      ) : selectedRole === 'admin' || selectedRole === 'manager' ? (
        <NavLink
          to="/cctv-monitoring"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-medium transition ${
              isActive ? 'text-maroon-800 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`
          }
        >
          <Video className="w-5 h-5" />
          <span>CCTV AI</span>
        </NavLink>
      ) : (
        <NavLink
          to="/my-tickets"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-medium transition ${
              isActive ? 'text-maroon-800 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`
          }
        >
          <Ticket className="w-5 h-5" />
          <span>Tickets</span>
        </NavLink>
      )}

      <NavLink
        to="/risk-map"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-medium transition ${
            isActive ? 'text-maroon-800 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`
        }
      >
        <MapPin className="w-5 h-5" />
        <span>Risk Map</span>
      </NavLink>
    </nav>
  );
};
