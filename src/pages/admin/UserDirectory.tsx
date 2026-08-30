import React, { useState } from 'react';
import {
  Phone,
  Mail,
  CheckCircle2,
  Search,
  PlusCircle,
  Edit2,
  Trash2,
  UserCheck,
  GraduationCap,
  Wrench,
  Briefcase,
  Shield,
  X,
  Building,
} from 'lucide-react';
import { useUserStore } from '../../store/userStore';
import { useAuthStore } from '../../store/authStore';
import { UserProfile, UserRole, DepartmentType } from '../../types/user';
import { DEPARTMENTS } from '../../lib/constants';

export const UserDirectory: React.FC = () => {
  const { users, addUser, updateUser, deleteUser } = useUserStore();
  const { currentUser, selectedRole } = useAuthStore();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Modal State for Add / Edit User
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('employee');
  const [formDepartment, setFormDepartment] = useState<DepartmentType>('electrical');
  const [formPhone, setFormPhone] = useState('');
  const [formId, setFormId] = useState('');

  const isAdmin = selectedRole === 'admin';
  const isManager = selectedRole === 'manager';
  const canManage = isAdmin || isManager;

  const filtered = users.filter((u) => {
    const matchSearch =
      u.displayName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(search.toLowerCase())) ||
      (u.employeeId && u.employeeId.toLowerCase().includes(search.toLowerCase())) ||
      (u.collegeId && u.collegeId.toLowerCase().includes(search.toLowerCase()));

    if (!matchSearch) return false;
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    return true;
  });

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormName('');
    setFormEmail('');
    setFormRole(isManager ? 'employee' : 'manager');
    setFormDepartment('electrical');
    setFormPhone('+91 98');
    setFormId('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: UserProfile) => {
    // Check permission: Admin can edit anyone, Manager can edit employees
    if (isAdmin || (isManager && user.role === 'employee')) {
      setEditingUser(user);
      setFormName(user.displayName);
      setFormEmail(user.email);
      setFormRole(user.role);
      setFormDepartment(user.department || 'electrical');
      setFormPhone(user.phone || '');
      setFormId(user.employeeId || user.collegeId || '');
      setIsModalOpen(true);
    }
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = formEmail.trim().toLowerCase();
    const isCollegeDomain =
      trimmedEmail.endsWith('@mitacsc.edu.in') || trimmedEmail.endsWith('@mitacsc.ac.in');

    if ((formRole === 'student' || formRole === 'teacher') && !isCollegeDomain) {
      alert('Students and Faculty must use official college emails ending with @mitacsc.edu.in or @mitacsc.ac.in');
      return;
    }

    if (editingUser) {
      updateUser(editingUser.uid, {
        displayName: formName.trim(),
        email: trimmedEmail,
        role: formRole,
        department: formRole === 'employee' || formRole === 'manager' ? formDepartment : undefined,
        phone: formPhone.trim(),
        employeeId: formRole === 'employee' || formRole === 'manager' ? formId.trim() : undefined,
        collegeId: formRole === 'student' || formRole === 'teacher' ? formId.trim() : undefined,
      });
    } else {
      addUser({
        displayName: formName.trim(),
        email: trimmedEmail,
        role: formRole,
        department: formRole === 'employee' || formRole === 'manager' ? formDepartment : undefined,
        phone: formPhone.trim(),
        employeeId: formRole === 'employee' || formRole === 'manager' ? formId.trim() : undefined,
        collegeId: formRole === 'student' || formRole === 'teacher' ? formId.trim() : undefined,
      });
    }

    setIsModalOpen(false);
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'student':
        return GraduationCap;
      case 'teacher':
        return UserCheck;
      case 'employee':
        return Wrench;
      case 'manager':
        return Briefcase;
      case 'admin':
        return Shield;
      default:
        return UserCheck;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Campus Users & Staff Directory
            <span className="px-2.5 py-0.5 bg-maroon-50 text-maroon-800 text-xs font-mono font-bold rounded-md border border-maroon-200">
              {users.length} Enrolled Accounts
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            MIT ACSC Students, Faculty, Estate Managers, and Maintenance Technicians
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-maroon-700"
            />
          </div>

          {/* Add Personnel Button for Admin and Manager */}
          {canManage && (
            <button
              onClick={handleOpenAddModal}
              className="px-3.5 py-2 bg-maroon-800 hover:bg-maroon-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95 shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Personnel</span>
            </button>
          )}
        </div>
      </div>

      {/* Role Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl w-fit shadow-xs">
        {['all', 'student', 'teacher', 'employee', 'manager', 'admin'].map((r) => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
              roleFilter === r
                ? 'bg-maroon-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {r === 'employee' ? 'Technicians' : r === 'all' ? 'All Roles' : `${r}s`}
          </button>
        ))}
      </div>

      {/* User Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((user) => {
          const isStudent = user.role === 'student';
          const canEditThisUser = isAdmin || (isManager && user.role === 'employee');
          const RoleIcon = getRoleIcon(user.role);

          return (
            <div
              key={user.uid}
              className="white-card white-card-hover p-5 rounded-2xl flex flex-col justify-between space-y-4 border border-slate-200"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-xl bg-maroon-800 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                      {user.displayName[0] || 'U'}
                    </div>

                    <div className="overflow-hidden">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-sm text-slate-900 truncate">
                          {user.displayName}
                        </h3>
                      </div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5 truncate">
                        {user.email}
                      </div>
                      {user.department && (
                        <div className="text-[11px] text-maroon-700 capitalize font-semibold mt-1">
                          {user.department} Maintenance
                        </div>
                      )}
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase shrink-0 border ${
                      user.role === 'student'
                        ? 'bg-purple-50 text-purple-800 border-purple-200'
                        : user.role === 'teacher'
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : user.role === 'employee'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : user.role === 'manager'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}
                  >
                    {user.role}
                  </span>
                </div>

                {/* ID & Status Details */}
                <div className="mt-3.5 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1.5">
                  {user.employeeId && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Employee ID:</span>
                      <span className="font-mono text-slate-900 font-semibold">{user.employeeId}</span>
                    </div>
                  )}
                  {user.collegeId && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">
                        {user.role === 'student' ? 'Student Roll / ID:' : 'Faculty ID:'}
                      </span>
                      <span className="font-mono text-slate-900 font-semibold">{user.collegeId}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-500">Account Status:</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Active Enrolled
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-2 border-t border-slate-100">
                {isStudent ? (
                  // For students: Do NOT display "Call Staff" action. Just show clean student info badge and Edit (if admin)
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400 font-medium">
                      MIT ACSC Registered Student
                    </span>
                    {canEditThisUser && (
                      <button
                        onClick={() => handleOpenEditModal(user)}
                        className="px-2.5 py-1 text-slate-600 hover:text-maroon-800 font-semibold flex items-center gap-1 hover:bg-slate-100 rounded-lg transition"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    )}
                  </div>
                ) : (
                  // For Faculty, Manager, Employee: Display Contact Actions + Edit
                  <div className="flex items-center gap-2 text-xs">
                    {user.phone && (
                      <a
                        href={`tel:${user.phone}`}
                        className="flex-1 py-1.5 px-2.5 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 rounded-xl flex items-center justify-center gap-1.5 font-medium border border-slate-200 transition"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Call</span>
                      </a>
                    )}
                    <a
                      href={`mailto:${user.email}`}
                      className="flex-1 py-1.5 px-2.5 bg-slate-50 hover:bg-maroon-50 hover:text-maroon-900 text-slate-700 rounded-xl flex items-center justify-center gap-1.5 font-medium border border-slate-200 transition"
                    >
                      <Mail className="w-3.5 h-3.5 text-maroon-700" />
                      <span>Email</span>
                    </a>
                    {canEditThisUser && (
                      <button
                        onClick={() => handleOpenEditModal(user)}
                        className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-xl border border-slate-200 transition"
                        title="Edit Record"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-maroon-800 text-white flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    {editingUser ? 'Edit Personnel Record' : 'Register New Personnel / User'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isAdmin
                      ? 'Admin Authority: Add/Edit Managers, Technicians, Teachers & Students'
                      : 'Manager Authority: Add/Edit Department Maintenance Technicians'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-900 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 mb-1 block">Full Name & Title:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Er. Suresh Kadam (Supervisor) or Omkar Sharma"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-maroon-700 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">College Email ID:</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. suresh.kadam@mitacsc.edu.in"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-maroon-700 font-medium"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Must end with @mitacsc.edu.in
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Role Category:</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-maroon-700"
                  >
                    {/* Admin can assign any role, Manager can only create/edit employees */}
                    {isAdmin ? (
                      <>
                        <option value="manager">Estate Manager</option>
                        <option value="employee">Technician / Employee</option>
                        <option value="teacher">Teacher / Faculty</option>
                        <option value="student">Student</option>
                        <option value="admin">Administrator</option>
                      </>
                    ) : (
                      <option value="employee">Technician / Employee</option>
                    )}
                  </select>
                </div>

                {(formRole === 'employee' || formRole === 'manager') && (
                  <div>
                    <label className="font-bold text-slate-700 mb-1 block">Department:</label>
                    <select
                      value={formDepartment}
                      onChange={(e) => setFormDepartment(e.target.value as DepartmentType)}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-maroon-700"
                    >
                      {DEPARTMENTS.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Phone Helpline:</label>
                  <input
                    type="tel"
                    placeholder="+91 98220 00000"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-maroon-700 font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">
                    {formRole === 'employee' || formRole === 'manager'
                      ? 'Employee ID:'
                      : 'College ID:'}
                  </label>
                  <input
                    type="text"
                    placeholder={
                      formRole === 'employee'
                        ? 'EMP-ELEC-045'
                        : formRole === 'manager'
                        ? 'MGR-ESTATE-010'
                        : 'MITACSC-STU-001'
                    }
                    value={formId}
                    onChange={(e) => setFormId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-maroon-700 font-mono font-medium"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                {editingUser && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete ${editingUser.displayName}?`)) {
                        deleteUser(editingUser.uid);
                        setIsModalOpen(false);
                      }
                    }}
                    className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl flex items-center gap-1.5 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Record</span>
                  </button>
                )}

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-maroon-800 hover:bg-maroon-900 text-white font-bold rounded-xl shadow-xs transition"
                  >
                    {editingUser ? 'Save Changes' : 'Create Record'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
