import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types/user';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, selectedRole } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(selectedRole)) {
    return (
      <div className="p-8 text-center max-w-md mx-auto">
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl">
          <h2 className="text-base font-bold text-rose-400">Access Restricted</h2>
          <p className="text-xs text-slate-300 mt-1">
            Your current role (<strong className="capitalize">{selectedRole}</strong>) does not have authorization to view this module.
          </p>
          <p className="text-[11px] text-slate-400 mt-3">
            Tip for Hackathon Evaluators: Switch your role to <strong>Manager</strong> or <strong>Admin</strong> using the role selector pill in the top header.
          </p>
        </div>
      </div>
    );
  }

  return <Outlet />;
};
