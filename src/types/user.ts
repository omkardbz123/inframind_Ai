export type UserRole = 'admin' | 'manager' | 'employee' | 'student' | 'teacher';

export type DepartmentType = 'electrical' | 'plumbing' | 'technical' | 'janitorial' | 'furniture' | 'network' | 'general';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  department?: DepartmentType;
  employeeId?: string;
  phone?: string;
  collegeId?: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string;
}

export interface RolePermissions {
  canReportFault: boolean;
  canViewOwnTickets: boolean;
  canViewAssignedTasks: boolean;
  canViewDepartmentTickets: boolean;
  canViewAllTickets: boolean;
  canAssignTickets: boolean;
  canUpdateStatus: boolean;
  canManageAssets: boolean;
  canManageUsers: boolean;
  canAccessCCTVMonitoring: boolean;
  canGenerateReports: boolean;
  canViewRiskDashboard: boolean;
  canConfigureSystem: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  student: {
    canReportFault: true,
    canViewOwnTickets: true,
    canViewAssignedTasks: false,
    canViewDepartmentTickets: false,
    canViewAllTickets: false,
    canAssignTickets: false,
    canUpdateStatus: false,
    canManageAssets: false,
    canManageUsers: false,
    canAccessCCTVMonitoring: false,
    canGenerateReports: false,
    canViewRiskDashboard: false,
    canConfigureSystem: false,
  },
  teacher: {
    canReportFault: true,
    canViewOwnTickets: true,
    canViewAssignedTasks: false,
    canViewDepartmentTickets: false,
    canViewAllTickets: false,
    canAssignTickets: false,
    canUpdateStatus: false,
    canManageAssets: false,
    canManageUsers: false,
    canAccessCCTVMonitoring: false,
    canGenerateReports: false,
    canViewRiskDashboard: false,
    canConfigureSystem: false,
  },
  employee: {
    canReportFault: true,
    canViewOwnTickets: true,
    canViewAssignedTasks: true,
    canViewDepartmentTickets: false,
    canViewAllTickets: false,
    canAssignTickets: false,
    canUpdateStatus: true,
    canManageAssets: false,
    canManageUsers: false,
    canAccessCCTVMonitoring: false,
    canGenerateReports: false,
    canViewRiskDashboard: false,
    canConfigureSystem: false,
  },
  manager: {
    canReportFault: true,
    canViewOwnTickets: true,
    canViewAssignedTasks: true,
    canViewDepartmentTickets: true,
    canViewAllTickets: true,
    canAssignTickets: true,
    canUpdateStatus: true,
    canManageAssets: true,
    canManageUsers: false,
    canAccessCCTVMonitoring: true,
    canGenerateReports: true,
    canViewRiskDashboard: true,
    canConfigureSystem: false,
  },
  admin: {
    canReportFault: true,
    canViewOwnTickets: true,
    canViewAssignedTasks: true,
    canViewDepartmentTickets: true,
    canViewAllTickets: true,
    canAssignTickets: true,
    canUpdateStatus: true,
    canManageAssets: true,
    canManageUsers: true,
    canAccessCCTVMonitoring: true,
    canGenerateReports: true,
    canViewRiskDashboard: true,
    canConfigureSystem: true,
  },
};
