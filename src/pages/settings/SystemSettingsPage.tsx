import React, { useState, useMemo } from 'react';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/common/Badge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { 
  User, UserRole, AccountStatus, AccessStatusType, DataScopeType, Department, Program, Semester, Division, AcademicYear, AuditLog 
} from '../../types';
import { 
  userAccountManagementService, ERP_PERMISSION_MODULES, ModulePermissionSet 
} from '../../services/userAccountManagementService';
import { 
  Users, Shield, ShieldCheck, ShieldAlert, Key, ToggleLeft, ToggleRight, Plus, 
  Settings, Database, Search, Edit3, Trash2, KeyRound, Check, X, Download,
  Printer, FileSpreadsheet, Lock, Unlock, Eye, History, RotateCcw, AlertTriangle,
  CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, UserCheck, UserX,
  Building2, Sparkles, RefreshCw, Copy, CheckSquare, Square, UserCog, Sliders, Globe, Workflow
} from 'lucide-react';

export const SystemSettingsPage: React.FC = () => {
  const { user: currentUser, role: currentRole } = useAuth();
  const isAuthorizedSettingsUser = ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'ERP_COORDINATOR', 'REGISTRAR'].includes(currentRole || '');
  const isERPCoordinator = currentRole === 'ERP_COORDINATOR';
  const isSuperOrUnivAdmin = ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'REGISTRAR'].includes(currentRole || '');

  // Master Database Lookups
  const departments = useMemo(() => db.getDepartments(), []);
  const programs = useMemo(() => db.getPrograms(), []);
  const semesters = useMemo(() => db.getSemesters(), []);
  const divisions = useMemo(() => db.getDivisions(), []);
  const academicYears = useMemo(() => db.getAcademicYears(), []);
  const institutes = useMemo(() => db.getInstitutes(), []);

  // Main Tab State
  const [activeSettingsTab, setActiveSettingsTab] = useState<'USERS' | 'ROLES' | 'AUDIT' | 'MASTER'>('USERS');
  const [masterSubTab, setMasterSubTab] = useState<'DEPT' | 'PROG' | 'SEM' | 'DIV' | 'AY'>('DEPT');

  // Role Template Subtab State
  const [selectedRoleTemplate, setSelectedRoleTemplate] = useState<UserRole>('HOD');
  const [roleTemplateDraft, setRoleTemplateDraft] = useState<Record<string, ModulePermissionSet>>({});

  // Master Filter Area State for Users
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [filterInstituteId, setFilterInstituteId] = useState('ALL');
  const [filterDeptId, setFilterDeptId] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  // Sorting & Pagination
  const [sortColumn, setSortColumn] = useState<keyof User | 'departmentName'>('username');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(25);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Modals & Action Drawers State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [permissionModalTab, setPermissionModalTab] = useState<'MODULES' | 'ACTIONS' | 'SCOPES' | 'APPROVALS' | 'SPECIAL' | 'SECURITY' | 'AUDIT'>('ACTIONS');
  const [userScopesDraft, setUserScopesDraft] = useState<Record<string, DataScopeType>>({});
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [isUserDetailsDrawerOpen, setIsUserDetailsDrawerOpen] = useState(false);
  const [isUserAuditModalOpen, setIsUserAuditModalOpen] = useState(false);
  const [isConfirmArchiveOpen, setIsConfirmArchiveOpen] = useState(false);
  const [isMasterModalOpen, setIsMasterModalOpen] = useState(false);

  // Lock Confirmation Modal State
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [lockTargetUser, setLockTargetUser] = useState<User | null>(null);
  const [lockReasonInput, setLockReasonInput] = useState('');

  // Selected User References
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedMasterId, setSelectedMasterId] = useState<string | null>(null);

  // Notification Toast State
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 5000);
  };

  // Form State: Create User (Sections A to F)
  const [formUsername, setFormUsername] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formConfirmPassword, setFormConfirmPassword] = useState('');
  const [formFullName, setFormFullName] = useState('');
  const [formEmpOrStudentId, setFormEmpOrStudentId] = useState('');
  const [formMobile, setFormMobile] = useState('');
  const [formInstId, setFormInstId] = useState(institutes[0]?.id || '');
  const [formDeptId, setFormDeptId] = useState(departments[0]?.id || '');
  const [formDesignation, setFormDesignation] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('FACULTY');
  const [formAccountStatus, setFormAccountStatus] = useState<AccountStatus>('ACTIVE');
  const [formForcePasswordReset, setFormForcePasswordReset] = useState(true);
  const [formTwoFactorEnabled, setFormTwoFactorEnabled] = useState(false);
  const [formAccountExpiresAt, setFormAccountExpiresAt] = useState('');

  // Form State: Edit User
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editEmpId, setEditEmpId] = useState('');
  const [editMobile, setEditMobile] = useState('');
  const [editInstId, setEditInstId] = useState('');
  const [editDeptId, setEditDeptId] = useState('');
  const [editDesignation, setEditDesignation] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('FACULTY');
  const [editAccountStatus, setEditAccountStatus] = useState<AccountStatus>('ACTIVE');
  const [editTwoFactorEnabled, setEditTwoFactorEnabled] = useState(false);
  const [editForcePasswordReset, setEditForcePasswordReset] = useState(false);
  const [editAccountExpiresAt, setEditAccountExpiresAt] = useState('');

  // Form State: Password Reset
  const [newPasswordVal, setNewPasswordVal] = useState('');
  const [confirmPasswordVal, setConfirmPasswordVal] = useState('');
  const [forceResetNextLogin, setForceResetNextLogin] = useState(true);

  // Form State: Permissions Matrix
  const [permissionDraft, setPermissionDraft] = useState<Record<string, Record<string, boolean>>>({});

  // Audit Search State
  const [auditSearch, setAuditSearch] = useState('');

  // Form State: Master entities
  const [masterName, setMasterName] = useState('');
  const [masterCode, setMasterCode] = useState('');
  const [parentSelectId, setParentSelectId] = useState('');
  const [masterStatus, setMasterStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  // Filtered & Sorted Users
  const filteredUsers = useMemo(() => {
    return userAccountManagementService.getUsers({
      role: filterRole,
      instituteId: filterInstituteId,
      departmentId: filterDeptId,
      status: filterStatus,
      searchQuery: searchQuery,
      dateFrom: filterDateFrom,
      dateTo: filterDateTo
    }, {
      column: sortColumn,
      direction: sortDirection
    });
  }, [filterRole, filterInstituteId, filterDeptId, filterStatus, searchQuery, filterDateFrom, filterDateTo, sortColumn, sortDirection, refreshKey]);

  // Pagination Slice
  const totalRecords = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / rowsPerPage));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredUsers.slice(start, start + rowsPerPage);
  }, [filteredUsers, currentPage, rowsPerPage]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterRole('ALL');
    setFilterInstituteId('ALL');
    setFilterDeptId('ALL');
    setFilterStatus('ALL');
    setFilterDateFrom('');
    setFilterDateTo('');
    setCurrentPage(1);
  };

  const handleSort = (col: keyof User | 'departmentName') => {
    if (sortColumn === col) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(col);
      setSortDirection('asc');
    }
  };

  // ─── USER CREATION WORKFLOW ────────────────────────────────────────────────
  const handleOpenCreateModal = () => {
    setFormUsername('');
    setFormEmail('');
    setFormPassword('User@123');
    setFormConfirmPassword('User@123');
    setFormFullName('');
    setFormEmpOrStudentId('');
    setFormMobile('');
    setFormInstId(institutes[0]?.id || '');
    setFormDeptId(departments[0]?.id || '');
    setFormDesignation('Assistant Professor');
    setFormRole('FACULTY');
    setFormAccountStatus('ACTIVE');
    setFormForcePasswordReset(true);
    setFormTwoFactorEnabled(false);
    setFormAccountExpiresAt('');
    setIsCreateModalOpen(true);
  };

  const handleSaveCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (formPassword !== formConfirmPassword) {
      showNotification('Passwords do not match. Please verify.', 'error');
      return;
    }

    try {
      const created = userAccountManagementService.createUser({
        username: formUsername,
        email: formEmail,
        name: formFullName,
        password: formPassword,
        role: formRole,
        employeeId: formEmpOrStudentId,
        phone: formMobile,
        instituteId: formInstId,
        departmentId: formDeptId,
        designation: formDesignation,
        accountStatus: formAccountStatus,
        forcePasswordReset: formForcePasswordReset,
        twoFactorEnabled: formTwoFactorEnabled,
        accountExpiresAt: formAccountExpiresAt
      }, currentUser);

      setIsCreateModalOpen(false);
      setRefreshKey(prev => prev + 1);
      showNotification(`User account "${created.username}" successfully provisioned with role ${created.role}.`);
    } catch (err: any) {
      showNotification(err.message || 'Failed to create user account.', 'error');
    }
  };

  // ─── USER EDIT WORKFLOW ────────────────────────────────────────────────────
  const handleOpenEditModal = (u: User) => {
    setSelectedUser(u);
    setEditFullName(u.name);
    setEditEmail(u.email);
    setEditEmpId(u.employeeId || u.enrollmentNo || '');
    setEditMobile(u.phone || '');
    setEditInstId(u.instituteId || institutes[0]?.id || '');
    setEditDeptId(u.departmentId || departments[0]?.id || '');
    setEditDesignation(u.designation || '');
    setEditRole(u.role);
    setEditAccountStatus(u.accountStatus || (u.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE'));
    setEditTwoFactorEnabled(u.twoFactorEnabled || false);
    setEditForcePasswordReset(u.forcePasswordReset || false);
    setEditAccountExpiresAt(u.accountExpiresAt || '');
    setIsEditModalOpen(true);
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      const selectedDept = departments.find(d => d.id === editDeptId);
      userAccountManagementService.updateUser(selectedUser.id, {
        name: editFullName,
        email: editEmail,
        employeeId: editEmpId,
        phone: editMobile,
        instituteId: editInstId,
        departmentId: editDeptId,
        departmentName: selectedDept?.name || selectedUser.departmentName,
        designation: editDesignation,
        role: editRole,
        accountStatus: editAccountStatus,
        twoFactorEnabled: editTwoFactorEnabled,
        forcePasswordReset: editForcePasswordReset,
        accountExpiresAt: editAccountExpiresAt
      }, currentUser);

      setIsEditModalOpen(false);
      setRefreshKey(prev => prev + 1);
      showNotification(`User account "${selectedUser.username}" profile successfully updated.`);
    } catch (err: any) {
      showNotification(err.message || 'Failed to update user account.', 'error');
    }
  };

  // ─── STATUS & LOCK TOGGLE ──────────────────────────────────────────────────
  const handleToggleActiveStatus = (u: User) => {
    const current = u.accountStatus || (u.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE');
    const targetStatus: AccountStatus = current === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      userAccountManagementService.toggleAccountStatus(u.id, targetStatus, currentUser);
      setRefreshKey(prev => prev + 1);
      showNotification(`Account status for "${u.username}" changed to ${targetStatus}.`);
    } catch (err: any) {
      showNotification(err.message || 'Failed to change account status.', 'error');
    }
  };

  const handleOpenLockModal = (u: User) => {
    const isLocked = u.accountStatus === 'LOCKED';
    if (isLocked) {
      try {
        userAccountManagementService.unlockUser(u.id, currentUser);
        setRefreshKey(prev => prev + 1);
        showNotification(`User account "${u.username}" successfully unlocked and restored to Active status.`);
      } catch (err: any) {
        showNotification(err.message || 'Failed to unlock user.', 'error');
      }
    } else {
      setLockTargetUser(u);
      setLockReasonInput('Administrative security hold pending policy compliance review');
      setIsLockModalOpen(true);
    }
  };

  const handleConfirmLockUser = () => {
    if (!lockTargetUser) return;
    if (!lockReasonInput || lockReasonInput.trim().length < 3) {
      showNotification('Please enter a valid lock reason before locking this account.', 'error');
      return;
    }
    try {
      userAccountManagementService.lockUser(lockTargetUser.id, lockReasonInput, currentUser);
      setIsLockModalOpen(false);
      setLockTargetUser(null);
      setLockReasonInput('');
      setRefreshKey(prev => prev + 1);
      showNotification(`User account "${lockTargetUser.username}" is now LOCKED. Sessions invalidated.`, 'error');
    } catch (err: any) {
      showNotification(err.message || 'Failed to lock user account.', 'error');
    }
  };

  // ─── PASSWORD RESET WORKFLOW ───────────────────────────────────────────────
  const handleOpenResetPassword = (u: User) => {
    setSelectedUser(u);
    setNewPasswordVal('');
    setConfirmPasswordVal('');
    setForceResetNextLogin(true);
    setIsResetPasswordModalOpen(true);
  };

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*';
    let gen = '';
    for (let i = 0; i < 10; i++) {
      gen += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPasswordVal(gen);
    setConfirmPasswordVal(gen);
  };

  const handleSaveResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (newPasswordVal !== confirmPasswordVal) {
      showNotification('Passwords do not match.', 'error');
      return;
    }

    try {
      userAccountManagementService.resetPassword(selectedUser.id, newPasswordVal, forceResetNextLogin, currentUser);
      setIsResetPasswordModalOpen(false);
      setRefreshKey(prev => prev + 1);
      showNotification(`Password for user "${selectedUser.username}" successfully reset.`);
    } catch (err: any) {
      showNotification(err.message || 'Failed to reset password.', 'error');
    }
  };

  // ─── MANAGE PERMISSIONS MATRIX ─────────────────────────────────────────────
  const handleOpenPermissionsModal = (u: User) => {
    setSelectedUser(u);
    setPermissionModalTab('ACTIONS');
    const { permissions } = userAccountManagementService.getEffectivePermissions(u);
    const scopes = userAccountManagementService.getUserScopes(u.id);
    
    // Deep clone to draft
    const draft: Record<string, Record<string, boolean>> = {};
    ERP_PERMISSION_MODULES.forEach(m => {
      draft[m.key] = { ...(permissions[m.key] as any) };
    });
    setPermissionDraft(draft);
    setUserScopesDraft(scopes || {});
    setIsPermissionsModalOpen(true);
  };

  const handleTogglePermissionAction = (moduleKey: string, action: keyof ModulePermissionSet) => {
    setPermissionDraft(prev => {
      const mod = prev[moduleKey] || {};
      return {
        ...prev,
        [moduleKey]: {
          ...mod,
          [action]: !mod[action]
        }
      };
    });
  };

  const handleToggleModuleAll = (moduleKey: string, enabled: boolean) => {
    setPermissionDraft(prev => {
      const mod = prev[moduleKey] || {};
      const actionKeys: (keyof ModulePermissionSet)[] = [
        'canView', 'canCreate', 'canEdit', 'canDelete', 'canApprove', 'canReject',
        'canExport', 'canImport', 'canPrint', 'canAssign', 'canTransfer', 'canVerify', 'canManage'
      ];
      const updatedMod: Record<string, boolean> = { ...mod };
      actionKeys.forEach(act => {
        updatedMod[act] = enabled;
      });
      return {
        ...prev,
        [moduleKey]: updatedMod
      };
    });
  };

  const handleSelectAllPermissions = () => {
    const draft: Record<string, Record<string, boolean>> = {};
    ERP_PERMISSION_MODULES.forEach(m => {
      draft[m.key] = {
        canView: true, canCreate: true, canEdit: true, canDelete: true, canApprove: true, canReject: true,
        canExport: true, canImport: true, canPrint: true, canAssign: true, canTransfer: true, canVerify: true, canManage: true
      };
    });
    setPermissionDraft(draft);
    showNotification('All module permissions granted in draft.');
  };

  const handleClearAllPermissions = () => {
    const draft: Record<string, Record<string, boolean>> = {};
    ERP_PERMISSION_MODULES.forEach(m => {
      draft[m.key] = {
        canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canReject: false,
        canExport: false, canImport: false, canPrint: false, canAssign: false, canTransfer: false, canVerify: false, canManage: false
      };
    });
    setPermissionDraft(draft);
    showNotification('All module permissions cleared in draft.');
  };

  const handleResetPermissionsToRole = () => {
    if (!selectedUser) return;
    const roleDefaults = userAccountManagementService.getRolePermissionTemplate(selectedUser.role);
    const resetDraft: Record<string, Record<string, boolean>> = {};
    ERP_PERMISSION_MODULES.forEach(m => {
      resetDraft[m.key] = { ...(roleDefaults[m.key] as any) };
    });
    setPermissionDraft(resetDraft);
    showNotification(`Permissions draft reset to default template for role ${selectedUser.role}.`);
  };

  const handleSavePermissions = () => {
    if (!selectedUser) return;
    try {
      userAccountManagementService.saveUserPermissions(selectedUser.id, permissionDraft, currentUser);
      userAccountManagementService.setUserScopes(selectedUser.id, userScopesDraft, currentUser);
      setIsPermissionsModalOpen(false);
      setRefreshKey(prev => prev + 1);
      showNotification(`Permissions matrix and data scopes successfully updated for "${selectedUser.username}".`);
    } catch (err: any) {
      showNotification(err.message || 'Failed to save permissions.', 'error');
    }
  };

  // ─── ROLE TEMPLATE MANAGEMENT ──────────────────────────────────────────────
  const handleLoadRoleTemplate = (role: UserRole) => {
    setSelectedRoleTemplate(role);
    const template = userAccountManagementService.getRolePermissionTemplate(role);
    const draft: Record<string, ModulePermissionSet> = {};
    ERP_PERMISSION_MODULES.forEach(m => {
      draft[m.key] = { ...(template[m.key] as any) };
    });
    setRoleTemplateDraft(draft);
  };

  const handleToggleRoleTemplateAction = (moduleKey: string, action: keyof ModulePermissionSet) => {
    setRoleTemplateDraft(prev => {
      const mod = prev[moduleKey] || {} as ModulePermissionSet;
      return {
        ...prev,
        [moduleKey]: {
          ...mod,
          [action]: !mod[action]
        }
      };
    });
  };

  const handleSaveRoleTemplate = () => {
    try {
      userAccountManagementService.updateRolePermissionTemplate(selectedRoleTemplate, roleTemplateDraft as any, currentUser);
      setRefreshKey(prev => prev + 1);
      showNotification(`Role default template for "${selectedRoleTemplate}" successfully updated. All users with this role inherit updated permissions.`);
    } catch (err: any) {
      showNotification(err.message || 'Failed to update role template.', 'error');
    }
  };

  // ─── USER DETAILS & AUDIT DRAWER ───────────────────────────────────────────
  const handleOpenUserDetails = (u: User) => {
    setSelectedUser(u);
    setIsUserDetailsDrawerOpen(true);
  };

  const handleOpenUserAudit = (u: User) => {
    setSelectedUser(u);
    setIsUserAuditModalOpen(true);
  };

  // ─── EXPORT & PRINT HANDLERS ───────────────────────────────────────────────
  const handleExportExcel = async () => {
    try {
      await userAccountManagementService.exportUsersExcel(filteredUsers, `SSIU_Users_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
      showNotification(`Exported ${filteredUsers.length} user accounts to official Excel (.xlsx).`);
    } catch (err: any) {
      showNotification('Failed to generate Excel export.', 'error');
    }
  };

  const handleExportCsv = () => {
    try {
      userAccountManagementService.exportUsersCsv(filteredUsers, `SSIU_Users_Export_${new Date().toISOString().split('T')[0]}.csv`);
      showNotification(`Exported ${filteredUsers.length} user accounts to CSV.`);
    } catch (err: any) {
      showNotification('Failed to generate CSV export.', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // ─── AUDIT TAB FILTER ──────────────────────────────────────────────────────
  const auditLogs = useMemo(() => db.getAuditLogs(), [refreshKey]);
  const filteredAuditLogs = useMemo(() => {
    const q = auditSearch.toLowerCase().trim();
    if (!q) return auditLogs;
    return auditLogs.filter(l => 
      l.userName.toLowerCase().includes(q) || 
      l.action.toLowerCase().includes(q) || 
      (l.details || '').toLowerCase().includes(q) ||
      (l.entity || '').toLowerCase().includes(q)
    );
  }, [auditLogs, auditSearch]);

  // Master Settings Save
  const handleOpenAddMaster = () => {
    setSelectedMasterId(null);
    setMasterName('');
    setMasterCode('');
    setParentSelectId('');
    setMasterStatus('ACTIVE');
    setIsMasterModalOpen(true);
  };

  const handleSaveMaster = (e: React.FormEvent) => {
    e.preventDefault();
    if (masterSubTab === 'DEPT') {
      const parentId = parentSelectId || institutes[0]?.id || '';
      if (selectedMasterId) {
        db.updateEntity<Department>('departments', selectedMasterId, { name: masterName, code: masterCode, instituteId: parentId, status: masterStatus }, `Updated department: ${masterName}`);
      } else {
        db.addEntity<Department>('departments', { name: masterName, code: masterCode, instituteId: parentId, status: masterStatus, email: 'dept@university.edu', phone: '1234567890' }, `Created new department: ${masterName}`);
      }
    } else if (masterSubTab === 'PROG') {
      const parentId = parentSelectId || departments[0]?.id || '';
      const instId = institutes[0]?.id || 'inst-1';
      if (selectedMasterId) {
        db.updateEntity<Program>('programs', selectedMasterId, { name: masterName, code: masterCode, departmentId: parentId, status: masterStatus }, `Updated program: ${masterName}`);
      } else {
        db.addEntity<Program>('programs', { name: masterName, code: masterCode, departmentId: parentId, instituteId: instId, status: masterStatus, durationYears: 4, degreeType: 'B.Tech', totalSemesters: 8, intakeCapacity: 60 }, `Created new program: ${masterName}`);
      }
    } else if (masterSubTab === 'SEM') {
      const parentId = parentSelectId || programs[0]?.id || '';
      const semNo = parseInt(masterCode) || 1;
      const finalStatus = masterStatus === 'ACTIVE' ? 'ACTIVE' as const : 'UPCOMING' as const;
      if (selectedMasterId) {
        db.updateEntity<Semester>('semesters', selectedMasterId, { code: masterCode, programId: parentId, status: finalStatus }, `Updated semester: ${masterCode}`);
      } else {
        db.addEntity<Semester>('semesters', { number: semNo, code: masterCode, programId: parentId, academicYearId: 'ay-2024', status: finalStatus }, `Created new semester: ${masterCode}`);
      }
    } else if (masterSubTab === 'DIV') {
      const parentId = parentSelectId || semesters[0]?.id || '';
      if (selectedMasterId) {
        db.updateEntity<Division>('divisions', selectedMasterId, { name: masterName, semesterId: parentId, status: masterStatus }, `Updated division: ${masterName}`);
      } else {
        db.addEntity<Division>('divisions', { name: masterName, semesterId: parentId, programId: 'prog-btech-cse', batchId: 'batch-2022', capacity: 60, roomNo: 'Room 101', status: masterStatus }, `Created new division: ${masterName}`);
      }
    } else if (masterSubTab === 'AY') {
      const finalStatus = masterStatus === 'ACTIVE' ? 'ACTIVE' as const : 'ARCHIVED' as const;
      if (selectedMasterId) {
        db.updateEntity<AcademicYear>('academicYears', selectedMasterId, { name: masterName, status: finalStatus }, `Updated academic year: ${masterName}`);
      } else {
        db.addEntity<AcademicYear>('academicYears', { name: masterName, startDate: '2024-06-15', endDate: '2025-05-15', isCurrent: false, status: finalStatus }, `Created new academic year: ${masterName}`);
      }
    }
    setIsMasterModalOpen(false);
    showNotification('Master table updated successfully.');
  };

  // Helper for Status Badge
  const renderStatusBadge = (status?: AccountStatus | string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">🟢 ACTIVE</span>;
      case 'LOCKED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800">🔒 LOCKED</span>;
      case 'DISABLED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-200 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:text-slate-300">🚫 DISABLED</span>;
      case 'PENDING':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">🟡 PENDING</span>;
      case 'SUSPENDED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300">🔴 SUSPENDED</span>;
      case 'INACTIVE':
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">⚪ INACTIVE</span>;
    }
  };

  const renderAccessBadge = (u: User) => {
    const isLocked = u.accountStatus === 'LOCKED';
    const isDisabled = u.accountStatus === 'DISABLED' || u.accountStatus === 'INACTIVE' || u.status === 'INACTIVE';
    const hasCustomOverrides = u.customPermissions && Object.keys(u.customPermissions).length > 0;
    
    if (isLocked) {
      return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200">LOCKED</span>;
    }
    if (isDisabled) {
      return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200">RESTRICTED</span>;
    }
    if (hasCustomOverrides) {
      return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200">CUSTOM</span>;
    }
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200">ENABLED</span>;
  };

  // Helper for Role Badge Colors
  const renderRoleBadge = (role: UserRole | string) => {
    let bg = 'bg-blue-100 text-blue-900 border-blue-200';
    if (['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'VICE_PRESIDENT', 'PRESIDENT', 'PROVOST'].includes(role)) {
      bg = 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800';
    } else if (['PRINCIPAL', 'HOD', 'REGISTRAR', 'DEPUTY_REGISTRAR', 'IQAC'].includes(role)) {
      bg = 'bg-indigo-100 text-indigo-900 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800';
    } else if (['FACULTY', 'MENTOR'].includes(role)) {
      bg = 'bg-teal-100 text-teal-900 border-teal-300 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800';
    } else if (['ACCOUNTS_ADMIN', 'HR_ADMIN', 'EXAM_CELL', 'STUDENT_SECTION'].includes(role)) {
      bg = 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
    } else if (['STUDENT', 'PARENT'].includes(role)) {
      bg = 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
    return (
      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase border ${bg}`}>
        {role.replace(/_/g, ' ')}
      </span>
    );
  };

  // ─── 403 FORBIDDEN GUARD FOR UNAUTHORIZED ROLES ───
  if (!isAuthorizedSettingsUser) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="w-16 h-16 bg-rose-100 dark:bg-rose-950/50 text-rose-600 rounded-full flex items-center justify-center mb-4 border border-rose-200 dark:border-rose-900">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-navy-900 dark:text-white mb-2">403 Forbidden — Access Restricted</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">
          Settings &amp; User Account Management is restricted to authorized Central University Administrators (Super Admin, University Admin, Central ERP Coordinator, Registrar). Your current role (<strong>{currentRole || 'GUEST'}</strong>) does not have authorization.
        </p>
        <a
          href="/dashboard"
          className="px-5 py-2.5 bg-[#001F3F] hover:bg-navy-800 text-white text-xs font-semibold rounded-lg shadow transition"
        >
          Return to Dashboard
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast Feedback Notification */}
      {feedbackMsg && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-sm font-bold border transition-all ${
          feedbackMsg.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-700' : 'bg-rose-50 text-rose-900 border-rose-300 dark:bg-rose-950 dark:text-rose-100 dark:border-rose-700'
        }`}>
          {feedbackMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-rose-600" />}
          <span>{feedbackMsg.text}</span>
          <button onClick={() => setFeedbackMsg(null)} className="ml-2 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ─── OFFICIAL PAGE HEADER ────────────────────────────────────────────── */}
      <div className="bg-[#001F3F] text-white p-6 rounded-2xl shadow-lg relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-400 text-slate-950">
              CENTRAL IDENTITY &amp; ACCESS GOVERNANCE
            </span>
            {isERPCoordinator && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500/20 border border-amber-400 text-amber-300">
                CENTRAL ERP COORDINATOR
              </span>
            )}
            <span className="text-xs text-blue-200">Security &amp; Authorization Management</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <Users className="w-7 h-7 text-amber-400" />
            <span>User Account Management</span>
          </h1>
          <p className="text-xs text-blue-100/80 max-w-2xl">
            {isERPCoordinator
              ? 'Central ERP oversight: view university-wide users, role assignments, security audits, and configuration.'
              : 'Manage university ERP users, assigned roles, account status, and authorization securely.'}
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/15 text-right">
            <div className="text-[10px] text-blue-200 uppercase font-black tracking-wider">Total Active Users</div>
            <div className="text-xl font-mono font-black text-amber-300">
              {db.getUsers().filter(u => u.status === 'ACTIVE').length} / {db.getUsers().length}
            </div>
          </div>
        </div>
      </div>

      {/* ─── CENTRAL ERP ACCESS GOVERNANCE KPI CARDS ────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Users</div>
          <div className="text-xl font-black text-navy-900 dark:text-white mt-1">{db.getUsers().length}</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">University wide</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Active Users</div>
          <div className="text-xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
            {db.getUsers().filter(u => (u.accountStatus || u.status) === 'ACTIVE').length}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Enabled logins</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Locked Users</div>
          <div className="text-xl font-black text-rose-700 dark:text-rose-300 mt-1">
            {db.getUsers().filter(u => u.accountStatus === 'LOCKED' || (u.status as any) === 'LOCKED').length}
          </div>
          <div className="text-[10px] text-rose-600 font-semibold mt-0.5">Restricted / Blocked</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Pending Requests</div>
          <div className="text-xl font-black text-amber-700 dark:text-amber-300 mt-1">
            {((db.getState() as any).assetRequisitions || []).filter((r: any) => r.status === 'PENDING_HOD_APPROVAL').length +
             ((db.getState() as any).assetTransferRequests || []).filter((r: any) => r.status === 'PENDING_HOD').length}
          </div>
          <div className="text-[10px] text-amber-600 font-semibold mt-0.5">Workflows awaiting</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Roles Configured</div>
          <div className="text-xl font-black text-indigo-700 dark:text-indigo-300 mt-1">19</div>
          <div className="text-[10px] text-slate-500 mt-0.5">RBAC Hierarchy</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Custom Overrides</div>
          <div className="text-xl font-black text-purple-700 dark:text-purple-300 mt-1">
            {db.getUsers().filter(u => u.customPermissions && Object.keys(u.customPermissions).length > 0).length}
          </div>
          <div className="text-[10px] text-purple-600 font-semibold mt-0.5">Direct Matrix rules</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Security Events</div>
          <div className="text-xl font-black text-blue-700 dark:text-blue-300 mt-1">
            {db.getAuditLogs().length}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Immutable audit logs</div>
        </div>
      </div>

      {/* ─── MAIN SETTINGS TABS ──────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSettingsTab('USERS')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeSettingsTab === 'USERS'
                ? 'bg-[#FF6B00] text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Account Management</span>
          </button>

          <button
            onClick={() => {
              setActiveSettingsTab('ROLES');
              handleLoadRoleTemplate(selectedRoleTemplate);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeSettingsTab === 'ROLES'
                ? 'bg-[#FF6B00] text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <UserCog className="w-4 h-4" />
            <span>Role Permission Templates</span>
          </button>

          <button
            onClick={() => setActiveSettingsTab('AUDIT')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeSettingsTab === 'AUDIT'
                ? 'bg-[#FF6B00] text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Security Audit Trails</span>
          </button>

          <button
            onClick={() => setActiveSettingsTab('MASTER')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeSettingsTab === 'MASTER'
                ? 'bg-[#FF6B00] text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Database Configuration</span>
          </button>
        </div>

        {activeSettingsTab === 'USERS' && (
          <div className="flex items-center gap-2 pr-2">
            <button
              onClick={handleExportExcel}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
              title="Export to official Microsoft Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Excel</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
              title="Export to CSV format"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition"
              title="Print register"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
          </div>
        )}
      </div>

      {/* ─── TAB 1: USERS ACCOUNT MANAGEMENT ─────────────────────────────────── */}
      {activeSettingsTab === 'USERS' && (
        <div className="space-y-4">
          {/* Top Search Toolbar & Action Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search username, email, roles..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium text-slate-900 dark:text-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {!isERPCoordinator && (
              <button
                onClick={handleOpenCreateModal}
                className="px-4 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#e05e00] text-white font-black text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>+ Create User Account</span>
              </button>
            )}
          </div>

          {/* Master Multi-Criteria Filter Area */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
              {/* Role Filter */}
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Assigned Role</label>
                <select
                  value={filterRole}
                  onChange={e => { setFilterRole(e.target.value); setCurrentPage(1); }}
                  className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200"
                >
                  <option value="ALL">All Roles</option>
                  <option value="SUPER_ADMIN">SUPER ADMIN</option>
                  <option value="UNIVERSITY_ADMIN">UNIVERSITY ADMIN</option>
                  <option value="ERP_COORDINATOR">CENTRAL ERP COORDINATOR</option>
                  <option value="REGISTRAR">REGISTRAR</option>
                  <option value="DEPUTY_REGISTRAR">DEPUTY REGISTRAR</option>
                  <option value="VICE_PRESIDENT">VICE PRESIDENT</option>
                  <option value="PRINCIPAL">PRINCIPAL</option>
                  <option value="HOD">HOD</option>
                  <option value="FACULTY">FACULTY</option>
                  <option value="STAFF">STAFF</option>
                  <option value="STUDENT_ADMIN">STUDENT ADMIN</option>
                  <option value="STUDENT">STUDENT</option>
                  <option value="IQAC">IQAC</option>
                  <option value="EXAM_CELL">EXAM CELL</option>
                  <option value="STUDENT_SECTION">STUDENT SECTION</option>
                  <option value="HOSTEL_ADMIN">HOSTEL ADMIN</option>
                  <option value="LIBRARY_ADMIN">LIBRARY ADMIN</option>
                  <option value="TRANSPORT_ADMIN">TRANSPORT ADMIN</option>
                  <option value="MAINTENANCE_ADMIN">MAINTENANCE ADMIN</option>
                  <option value="ACCOUNTS_ADMIN">ACCOUNTS ADMIN</option>
                  <option value="PARENT">PARENT</option>
                </select>
              </div>

              {/* Department Filter */}
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Department</label>
                <select
                  value={filterDeptId}
                  onChange={e => { setFilterDeptId(e.target.value); setCurrentPage(1); }}
                  className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200"
                >
                  <option value="ALL">All Departments</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              {/* Institution Filter */}
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Institution</label>
                <select
                  value={filterInstituteId}
                  onChange={e => { setFilterInstituteId(e.target.value); setCurrentPage(1); }}
                  className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200"
                >
                  <option value="ALL">All Institutes</option>
                  {institutes.map(i => (
                    <option key={i.id} value={i.id}>{i.name}</option>
                  ))}
                </select>
              </div>

              {/* Account Status Filter */}
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Account Status</label>
                <select
                  value={filterStatus}
                  onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                  className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">🟢 Active</option>
                  <option value="PENDING">🟡 Pending</option>
                  <option value="INACTIVE">⚪ Inactive</option>
                  <option value="LOCKED">⚫ Locked</option>
                  <option value="SUSPENDED">🔴 Suspended</option>
                </select>
              </div>

              {/* Date & Reset Trigger */}
              <div className="flex items-end gap-2">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="w-full py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-300 text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Filters</span>
                </button>
              </div>
            </div>

            {/* Live Count Bar */}
            <div className="flex justify-between items-center text-xs font-medium text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-2">
              <div>
                Records Showing: <strong className="text-slate-900 dark:text-white font-black">{totalRecords}</strong> of <strong className="text-slate-900 dark:text-white font-black">{db.getUsers().length}</strong> Total Accounts
              </div>
              <div className="text-[11px] text-slate-400">
                Sorted by: <span className="font-bold text-slate-700 dark:text-slate-300">{String(sortColumn)}</span> ({sortDirection.toUpperCase()})
              </div>
            </div>
          </div>

          {/* ─── 10-COLUMN EXCEL-STYLE ADMINISTRATIVE USER REGISTER ──────────── */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto min-h-[350px]">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-[#001F3F] text-white font-bold uppercase tracking-wider sticky top-0 z-10">
                  <tr>
                    <th onClick={() => handleSort('username')} className="p-3 cursor-pointer select-none hover:bg-blue-950 transition">
                      Username
                    </th>
                    <th onClick={() => handleSort('name')} className="p-3 cursor-pointer select-none hover:bg-blue-950 transition">
                      Full Name
                    </th>
                    <th onClick={() => handleSort('email')} className="p-3 cursor-pointer select-none hover:bg-blue-950 transition">
                      Email Address
                    </th>
                    <th onClick={() => handleSort('employeeId')} className="p-3 cursor-pointer select-none hover:bg-blue-950 transition">
                      Employee / Student ID
                    </th>
                    <th onClick={() => handleSort('departmentName')} className="p-3 cursor-pointer select-none hover:bg-blue-950 transition">
                      Department
                    </th>
                    <th onClick={() => handleSort('role')} className="p-3 cursor-pointer select-none hover:bg-blue-950 transition">
                      Assigned Role
                    </th>
                    <th onClick={() => handleSort('status')} className="p-3 cursor-pointer select-none hover:bg-blue-950 transition">
                      Account Status
                    </th>
                    <th className="p-3 select-none">
                      Access Status
                    </th>
                    <th onClick={() => handleSort('lastLoginAt')} className="p-3 cursor-pointer select-none hover:bg-blue-950 transition">
                      Last Login
                    </th>
                    <th onClick={() => handleSort('createdAt')} className="p-3 cursor-pointer select-none hover:bg-blue-950 transition">
                      Created Date
                    </th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                  {paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="p-12 text-center text-slate-500">
                        <Users className="w-12 h-12 mx-auto mb-2 text-slate-300 dark:text-slate-700 animate-pulse" />
                        <div className="font-bold text-sm text-slate-700 dark:text-slate-300">No user accounts found.</div>
                        <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria or resetting filters.</p>
                        <button
                          onClick={handleResetFilters}
                          className="mt-3 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs"
                        >
                          Clear Filters
                        </button>
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map(u => {
                      const currentStatus = u.accountStatus || (u.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE');
                      return (
                        <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition">
                          {/* 1. Username */}
                          <td className="p-3 font-mono font-bold text-[#001F3F] dark:text-blue-300 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-black flex items-center justify-center uppercase">
                                {(u.username || u.name || 'U').slice(0, 2)}
                              </div>
                              <span>{u.username || 'N/A'}</span>
                            </div>
                          </td>

                          {/* 2. Full Name */}
                          <td className="p-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                            {u.name}
                          </td>

                          {/* 3. Email */}
                          <td className="p-3 font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
                            {u.email}
                          </td>

                          {/* 4. Employee / Student ID */}
                          <td className="p-3 font-mono text-slate-500 whitespace-nowrap">
                            {u.employeeId || u.enrollmentNo || '—'}
                          </td>

                          {/* 5. Department */}
                          <td className="p-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                            {u.departmentName || 'SSCIT'}
                          </td>

                          {/* 6. Assigned Role */}
                          <td className="p-3 whitespace-nowrap">
                            {renderRoleBadge(u.role)}
                          </td>

                          {/* 7. Account Status */}
                          <td className="p-3 whitespace-nowrap">
                            {renderStatusBadge(currentStatus)}
                          </td>

                          {/* 8. Access Status */}
                          <td className="p-3 whitespace-nowrap">
                            {renderAccessBadge(u)}
                          </td>

                          {/* 9. Last Login */}
                          <td className="p-3 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                            {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('en-IN') : 'Never'}
                          </td>

                          {/* 10. Created Date */}
                          <td className="p-3 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                            {u.createdAt ? u.createdAt.split('T')[0] : '2024-01-01'}
                          </td>

                          {/* 11. Actions */}
                          <td className="p-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              {/* View Details */}
                              <button
                                type="button"
                                onClick={() => handleOpenUserDetails(u)}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                                title="View User Details & Access"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* Edit User */}
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(u)}
                                className="p-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300"
                                title="Edit User Account"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              {/* Manage Permissions */}
                              <button
                                type="button"
                                onClick={() => handleOpenPermissionsModal(u)}
                                className="p-1.5 rounded-lg bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300"
                                title="User Access & Permission Management"
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                              </button>

                              {/* Reset Password */}
                              <button
                                type="button"
                                onClick={() => handleOpenResetPassword(u)}
                                className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300"
                                title="Reset Password"
                              >
                                <KeyRound className="w-3.5 h-3.5" />
                              </button>

                              {/* Activate / Deactivate Toggle */}
                              <button
                                type="button"
                                onClick={() => handleToggleActiveStatus(u)}
                                className={`p-1.5 rounded-lg ${
                                  currentStatus === 'ACTIVE' 
                                    ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                    : 'bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                                }`}
                                title={currentStatus === 'ACTIVE' ? 'Deactivate Account' : 'Activate Account'}
                              >
                                {currentStatus === 'ACTIVE' ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                              </button>

                              {/* Lock / Unlock Toggle */}
                              <button
                                type="button"
                                onClick={() => handleOpenLockModal(u)}
                                className={`p-1.5 rounded-lg ${
                                  currentStatus === 'LOCKED'
                                    ? 'bg-rose-100 hover:bg-rose-200 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                }`}
                                title={currentStatus === 'LOCKED' ? 'Unlock Account' : 'Lock Account'}
                              >
                                {currentStatus === 'LOCKED' ? <Lock className="w-3.5 h-3.5 text-rose-600" /> : <Unlock className="w-3.5 h-3.5" />}
                              </button>

                              {/* View Audit Trail */}
                              <button
                                type="button"
                                onClick={() => handleOpenUserAudit(u)}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                                title="View User Audit Trail"
                              >
                                <History className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Toolbar */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={e => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  className="p-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-slate-500 ml-2">
                  Showing {totalRecords > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0}–{Math.min(currentPage * rowsPerPage, totalRecords)} of {totalRecords} records
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 disabled:opacity-40 font-bold flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Previous
                </button>

                <span className="px-3 py-1.5 font-bold text-slate-700 dark:text-slate-300">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 disabled:opacity-40 font-bold flex items-center gap-1"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: ROLE PERMISSION TEMPLATES ─────────────────────────────────── */}
      {activeSettingsTab === 'ROLES' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-sm font-black text-navy-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <UserCog className="w-5 h-5 text-orange-600" />
                <span>Role Default Permission Templates</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure default module actions inherited by users of each role across the university.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Selected Role:</span>
                <select
                  value={selectedRoleTemplate}
                  onChange={e => handleLoadRoleTemplate(e.target.value as UserRole)}
                  className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold text-xs text-blue-900 dark:text-blue-300"
                >
                  <option value="SUPER_ADMIN">SUPER ADMIN</option>
                  <option value="ERP_COORDINATOR">ERP COORDINATOR</option>
                  <option value="UNIVERSITY_ADMIN">UNIVERSITY ADMIN</option>
                  <option value="VICE_PRESIDENT">VICE PRESIDENT</option>
                  <option value="REGISTRAR">REGISTRAR</option>
                  <option value="DEPUTY_REGISTRAR">DEPUTY REGISTRAR</option>
                  <option value="PRINCIPAL">PRINCIPAL</option>
                  <option value="HOD">HOD</option>
                  <option value="FACULTY">FACULTY</option>
                  <option value="STAFF">STAFF</option>
                  <option value="STUDENT">STUDENT</option>
                  <option value="PARENT">PARENT</option>
                  <option value="ACCOUNTS_ADMIN">ACCOUNTS ADMIN</option>
                  <option value="EXAM_CELL">EXAM CELL</option>
                  <option value="IQAC">IQAC</option>
                  <option value="HOSTEL_ADMIN">HOSTEL ADMIN</option>
                  <option value="LIBRARY_ADMIN">LIBRARY ADMIN</option>
                  <option value="TRANSPORT_ADMIN">TRANSPORT ADMIN</option>
                  <option value="MAINTENANCE_ADMIN">MAINTENANCE ADMIN</option>
                  <option value="STUDENT_SECTION">STUDENT SECTION</option>
                </select>
              </div>

              <button
                onClick={handleSaveRoleTemplate}
                className="px-4 py-2 rounded-xl bg-[#001F3F] hover:bg-navy-900 text-white font-bold text-xs flex items-center gap-2 shadow-md"
              >
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Save Role Template</span>
              </button>
            </div>
          </div>

          {/* Role Permission Matrix Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto max-h-[600px]">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-[#001F3F] text-white font-bold uppercase tracking-wider sticky top-0 z-10">
                  <tr>
                    <th className="p-3">Module Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3 text-center">View</th>
                    <th className="p-3 text-center">Create</th>
                    <th className="p-3 text-center">Edit</th>
                    <th className="p-3 text-center">Delete</th>
                    <th className="p-3 text-center">Approve</th>
                    <th className="p-3 text-center">Reject</th>
                    <th className="p-3 text-center">Export</th>
                    <th className="p-3 text-center">Import</th>
                    <th className="p-3 text-center">Print</th>
                    <th className="p-3 text-center">Assign</th>
                    <th className="p-3 text-center">Transfer</th>
                    <th className="p-3 text-center">Verify</th>
                    <th className="p-3 text-center">Manage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                  {ERP_PERMISSION_MODULES.map(m => {
                    const modState = roleTemplateDraft[m.key] || {} as ModulePermissionSet;
                    const actionKeys: (keyof ModulePermissionSet)[] = [
                      'canView', 'canCreate', 'canEdit', 'canDelete', 'canApprove', 'canReject',
                      'canExport', 'canImport', 'canPrint', 'canAssign', 'canTransfer', 'canVerify', 'canManage'
                    ];
                    return (
                      <tr key={m.key} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-3 font-bold text-slate-900 dark:text-white">
                          <div>{m.name}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{m.description}</div>
                        </td>
                        <td className="p-3 text-slate-500 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {m.category}
                          </span>
                        </td>
                        {actionKeys.map(act => (
                          <td key={act} className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={!!modState[act]}
                              onChange={() => handleToggleRoleTemplateAction(m.key, act)}
                              className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 cursor-pointer"
                            />
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: SECURITY AUDIT TRAILS ────────────────────────────────────── */}
      {activeSettingsTab === 'AUDIT' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex justify-between items-center gap-3">
            <div className="relative max-w-md w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search event logs, actor, details, target..."
                value={auditSearch}
                onChange={e => setAuditSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
              />
            </div>
            <div className="text-xs text-slate-500">
              Total Log Entries: <strong className="text-slate-900 dark:text-white font-black">{filteredAuditLogs.length}</strong>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-[#001F3F] text-white font-bold uppercase tracking-wider sticky top-0 z-10">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Security Actor</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Module Context</th>
                    <th className="p-3 min-w-[320px]">Event Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                  {filteredAuditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-3 font-mono text-slate-500 whitespace-nowrap">
                        {log.timestamp ? new Date(log.timestamp).toLocaleString('en-IN') : '2026-08-25'}
                      </td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">{log.userName}</td>
                      <td className="p-3 whitespace-nowrap">{renderRoleBadge(log.userRole)}</td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded font-black text-[10px] bg-blue-100 text-blue-900 border border-blue-200">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">{log.module || log.entity}</td>
                      <td className="p-3 text-slate-700 dark:text-slate-300">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: DATABASE CONFIGURATION / MASTER TABLES ──────────────────── */}
      {activeSettingsTab === 'MASTER' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <button className={`px-3 py-1.5 rounded-lg text-xs font-bold ${masterSubTab === 'DEPT' ? 'bg-[#001F3F] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'}`} onClick={() => setMasterSubTab('DEPT')}>Departments</button>
              <button className={`px-3 py-1.5 rounded-lg text-xs font-bold ${masterSubTab === 'PROG' ? 'bg-[#001F3F] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'}`} onClick={() => setMasterSubTab('PROG')}>Programs</button>
              <button className={`px-3 py-1.5 rounded-lg text-xs font-bold ${masterSubTab === 'SEM' ? 'bg-[#001F3F] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'}`} onClick={() => setMasterSubTab('SEM')}>Semesters</button>
              <button className={`px-3 py-1.5 rounded-lg text-xs font-bold ${masterSubTab === 'DIV' ? 'bg-[#001F3F] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'}`} onClick={() => setMasterSubTab('DIV')}>Divisions</button>
              <button className={`px-3 py-1.5 rounded-lg text-xs font-bold ${masterSubTab === 'AY' ? 'bg-[#001F3F] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'}`} onClick={() => setMasterSubTab('AY')}>Academic Years</button>
            </div>

            <button
              onClick={handleOpenAddMaster}
              className="px-3.5 py-1.5 rounded-xl bg-[#001F3F] hover:bg-[#0F2C59] text-white font-bold text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add Master Entry
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4">
            {masterSubTab === 'DEPT' && (
              <table className="w-full text-xs text-left">
                <thead className="bg-[#001F3F] text-white font-bold">
                  <tr><th className="p-3">Dept Name</th><th className="p-3">Code</th><th className="p-3">Status</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {departments.map(d => (
                    <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-bold">{d.name}</td>
                      <td className="p-3 font-mono">{d.code}</td>
                      <td className="p-3">{renderStatusBadge(d.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {masterSubTab === 'PROG' && (
              <table className="w-full text-xs text-left">
                <thead className="bg-[#001F3F] text-white font-bold">
                  <tr><th className="p-3">Program Name</th><th className="p-3">Code</th><th className="p-3">Status</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {programs.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-bold">{p.name}</td>
                      <td className="p-3 font-mono">{p.code}</td>
                      <td className="p-3">{renderStatusBadge(p.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {masterSubTab === 'SEM' && (
              <table className="w-full text-xs text-left">
                <thead className="bg-[#001F3F] text-white font-bold">
                  <tr><th className="p-3">Semester Number</th><th className="p-3">Code</th><th className="p-3">Status</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {semesters.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-bold">Semester {s.number}</td>
                      <td className="p-3 font-mono">{s.code}</td>
                      <td className="p-3">{renderStatusBadge(s.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {masterSubTab === 'DIV' && (
              <table className="w-full text-xs text-left">
                <thead className="bg-[#001F3F] text-white font-bold">
                  <tr><th className="p-3">Division Name</th><th className="p-3">Status</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {divisions.map(d => (
                    <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-bold">{d.name}</td>
                      <td className="p-3">{renderStatusBadge(d.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {masterSubTab === 'AY' && (
              <table className="w-full text-xs text-left">
                <thead className="bg-[#001F3F] text-white font-bold">
                  <tr><th className="p-3">Academic Year</th><th className="p-3">Status</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {academicYears.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-bold">{a.name}</td>
                      <td className="p-3">{renderStatusBadge(a.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ─── MODAL 1: CREATE USER ACCOUNT (SECTIONS A TO F) ──────────────────── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-4 bg-[#001F3F] text-white flex justify-between items-center">
              <div>
                <h3 className="font-black text-sm uppercase tracking-wider flex items-center gap-2">
                  <Plus className="w-4 h-4 text-amber-400" />
                  <span>Provision New User Account</span>
                </h3>
                <p className="text-[11px] text-blue-200">Fill in identity, credentials, organization scope, and authorization</p>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-white hover:text-amber-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCreateUser} className="p-6 space-y-6 overflow-y-auto text-xs">
              {/* Section A: Account Information */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-blue-900 dark:text-blue-300 uppercase tracking-wider border-b pb-1">
                  A. Account &amp; Authentication Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Username Account ID *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. jigar.ahir"
                      value={formUsername}
                      onChange={e => setFormUsername(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Official University Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. jigar.ahir@swarrnim.edu.in"
                      value={formEmail}
                      onChange={e => setFormEmail(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Temporary Password *</label>
                    <input
                      type="password"
                      required
                      value={formPassword}
                      onChange={e => setFormPassword(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Confirm Password *</label>
                    <input
                      type="password"
                      required
                      value={formConfirmPassword}
                      onChange={e => setFormConfirmPassword(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Section B: User Identity */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-blue-900 dark:text-blue-300 uppercase tracking-wider border-b pb-1">
                  B. User Identity &amp; Profile Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Legal Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Jigar Ahir"
                      value={formFullName}
                      onChange={e => setFormFullName(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Employee / Student ID</label>
                    <input
                      type="text"
                      placeholder="e.g. EMP-CE-042"
                      value={formEmpOrStudentId}
                      onChange={e => setFormEmpOrStudentId(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mobile Phone Number</label>
                    <input
                      type="text"
                      placeholder="+91 98765 43210"
                      value={formMobile}
                      onChange={e => setFormMobile(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                    />
                  </div>
                </div>
              </div>

              {/* Section C & D: Organization & Role */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-blue-900 dark:text-blue-300 uppercase tracking-wider border-b pb-1">
                  C. Organization &amp; Assigned Security Role
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Institution Scope</label>
                    <select
                      value={formInstId}
                      onChange={e => setFormInstId(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold"
                    >
                      {institutes.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                    <select
                      value={formDeptId}
                      onChange={e => setFormDeptId(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold"
                    >
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Assigned Security Role *</label>
                    <select
                      value={formRole}
                      onChange={e => setFormRole(e.target.value as any)}
                      className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-black text-blue-700 dark:text-blue-300"
                    >
                      <option value="SUPER_ADMIN">SUPER ADMIN</option>
                      <option value="UNIVERSITY_ADMIN">UNIVERSITY ADMIN</option>
                      <option value="VICE_PRESIDENT">VICE PRESIDENT</option>
                      <option value="PRINCIPAL">PRINCIPAL</option>
                      <option value="HOD">HOD</option>
                      <option value="FACULTY">FACULTY</option>
                      <option value="STUDENT_ADMIN">STUDENT ADMIN</option>
                      <option value="STUDENT">STUDENT</option>
                      <option value="REGISTRAR">REGISTRAR</option>
                      <option value="DEPUTY_REGISTRAR">DEPUTY REGISTRAR</option>
                      <option value="IQAC">IQAC</option>
                      <option value="EXAM_CELL">EXAM CELL</option>
                      <option value="STUDENT_SECTION">STUDENT SECTION</option>
                      <option value="HOSTEL_ADMIN">HOSTEL ADMIN</option>
                      <option value="LIBRARY_ADMIN">LIBRARY ADMIN</option>
                      <option value="TRANSPORT_ADMIN">TRANSPORT ADMIN</option>
                      <option value="MAINTENANCE_ADMIN">MAINTENANCE ADMIN</option>
                      <option value="ACCOUNTS_ADMIN">ACCOUNTS ADMIN</option>
                      <option value="PARENT">PARENT</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section E & F: Account Status & Security */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-blue-900 dark:text-blue-300 uppercase tracking-wider border-b pb-1">
                  D. Account Status &amp; Security Governance
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Account Status</label>
                    <select
                      value={formAccountStatus}
                      onChange={e => setFormAccountStatus(e.target.value as any)}
                      className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold"
                    >
                      <option value="ACTIVE">🟢 Active</option>
                      <option value="PENDING">🟡 Pending Activation</option>
                      <option value="INACTIVE">⚪ Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Account Expiry Date</label>
                    <input
                      type="date"
                      value={formAccountExpiresAt}
                      onChange={e => setFormAccountExpiresAt(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                    />
                  </div>
                  <div className="flex flex-col justify-center space-y-2 pt-4">
                    <label className="flex items-center gap-2 cursor-pointer font-bold">
                      <input
                        type="checkbox"
                        checked={formForcePasswordReset}
                        onChange={e => setFormForcePasswordReset(e.target.checked)}
                        className="rounded text-orange-600 focus:ring-orange-500"
                      />
                      <span>Require password change on first login</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-bold">
                      <input
                        type="checkbox"
                        checked={formTwoFactorEnabled}
                        onChange={e => setFormTwoFactorEnabled(e.target.checked)}
                        className="rounded text-orange-600 focus:ring-orange-500"
                      />
                      <span>Enable Two-Factor Authentication (2FA)</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#e05e00] text-white font-black shadow-md flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Create User</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: EDIT USER ACCOUNT ──────────────────────────────────────── */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-4 bg-[#001F3F] text-white flex justify-between items-center">
              <div>
                <h3 className="font-black text-sm uppercase tracking-wider flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-amber-400" />
                  <span>Edit User Profile &amp; Role</span>
                </h3>
                <p className="text-[11px] text-blue-200">Username: <strong className="font-mono text-amber-300">{selectedUser.username}</strong></p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-white hover:text-amber-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="p-6 space-y-4 overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Username (Read-Only)</label>
                  <input
                    type="text"
                    disabled
                    value={selectedUser.username || ''}
                    className="w-full p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 font-mono font-bold text-slate-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Primary Email Address *</label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={e => setEditEmail(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={editFullName}
                    onChange={e => setEditFullName(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Employee / Student ID</label>
                  <input
                    type="text"
                    value={editEmpId}
                    onChange={e => setEditEmpId(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mobile Phone</label>
                  <input
                    type="text"
                    value={editMobile}
                    onChange={e => setEditMobile(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                  <select
                    value={editDeptId}
                    onChange={e => setEditDeptId(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold"
                  >
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Designation</label>
                  <input
                    type="text"
                    value={editDesignation}
                    onChange={e => setEditDesignation(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Assigned Security Role *</label>
                  <select
                    value={editRole}
                    onChange={e => setEditRole(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-black text-blue-700 dark:text-blue-300"
                  >
                    <option value="SUPER_ADMIN">SUPER ADMIN</option>
                    <option value="UNIVERSITY_ADMIN">UNIVERSITY ADMIN</option>
                    <option value="VICE_PRESIDENT">VICE PRESIDENT</option>
                    <option value="PRINCIPAL">PRINCIPAL</option>
                    <option value="HOD">HOD</option>
                    <option value="FACULTY">FACULTY</option>
                    <option value="STUDENT_ADMIN">STUDENT ADMIN</option>
                    <option value="STUDENT">STUDENT</option>
                    <option value="REGISTRAR">REGISTRAR</option>
                    <option value="DEPUTY_REGISTRAR">DEPUTY REGISTRAR</option>
                    <option value="IQAC">IQAC</option>
                    <option value="EXAM_CELL">EXAM CELL</option>
                    <option value="STUDENT_SECTION">STUDENT SECTION</option>
                    <option value="HOSTEL_ADMIN">HOSTEL ADMIN</option>
                    <option value="LIBRARY_ADMIN">LIBRARY ADMIN</option>
                    <option value="TRANSPORT_ADMIN">TRANSPORT ADMIN</option>
                    <option value="MAINTENANCE_ADMIN">MAINTENANCE ADMIN</option>
                    <option value="ACCOUNTS_ADMIN">ACCOUNTS ADMIN</option>
                    <option value="PARENT">PARENT</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Account Status</label>
                  <select
                    value={editAccountStatus}
                    onChange={e => setEditAccountStatus(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold"
                  >
                    <option value="ACTIVE">🟢 Active</option>
                    <option value="PENDING">🟡 Pending</option>
                    <option value="INACTIVE">⚪ Inactive</option>
                    <option value="LOCKED">⚫ Locked</option>
                    <option value="SUSPENDED">🔴 Suspended</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#001F3F] hover:bg-[#0F2C59] text-white font-black shadow-md flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Update Profile</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: LOCK USER CONFIRMATION ──────────────────────────────────── */}
      {isLockModalOpen && lockTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 bg-rose-900 text-white flex justify-between items-center">
              <h3 className="font-black text-sm uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-4 h-4 text-rose-300" />
                <span>Lock User Account: {lockTargetUser.username}</span>
              </h3>
              <button onClick={() => { setIsLockModalOpen(false); setLockTargetUser(null); }} className="text-white hover:text-rose-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl flex items-start gap-2.5 text-rose-900 dark:text-rose-200">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Security Hold &amp; Immediate Session Invalidation</strong>
                  Locking this account will immediately revoke all active authentication tokens, invalidate browser sessions, and reject any protected API requests from this user.
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Account Lock Reason * (Required for Immutable Audit Trail)
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Specify administrative or security reason for locking this account..."
                  value={lockReasonInput}
                  onChange={e => setLockReasonInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-medium text-xs focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setIsLockModalOpen(false); setLockTargetUser(null); }}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmLockUser}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black shadow-md flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Confirm &amp; Lock Account</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 3: COMPREHENSIVE USER ACCESS & PERMISSION MANAGEMENT (7 SECTIONS) ── */}
      {isPermissionsModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-6xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header: User Profile Summary */}
            <div className="p-4 bg-[#001F3F] text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                    CENTRAL ACCESS GOVERNANCE
                  </span>
                  <span className="text-xs text-blue-200 font-bold">USER ACCESS &amp; PERMISSION MANAGEMENT</span>
                </div>
                <h3 className="font-black text-base text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>{selectedUser.name}</span>
                  <span className="font-mono text-xs text-amber-300 font-normal">(@{selectedUser.username})</span>
                </h3>
                <div className="text-[11px] text-blue-200/80 flex items-center gap-3">
                  <span>Role: <strong className="text-white">{selectedUser.role}</strong></span>
                  <span>•</span>
                  <span>Dept: <strong className="text-white">{selectedUser.departmentName || 'SSCIT'}</strong></span>
                  <span>•</span>
                  <span>Status: {renderStatusBadge(selectedUser.accountStatus || selectedUser.status)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetPermissionsToRole}
                  className="px-3 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 transition"
                  title="Reset custom overrides and inherit role template defaults"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Role Defaults</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPermissionsModalOpen(false)}
                  className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 7-Section Navigation Tabs */}
            <div className="bg-slate-100 dark:bg-slate-800/80 p-2 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-xs font-bold">
              <button
                type="button"
                onClick={() => setPermissionModalTab('MODULES')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition flex items-center gap-1.5 ${
                  permissionModalTab === 'MODULES' ? 'bg-[#FF6B00] text-white shadow-sm font-black' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>1. Module Access</span>
              </button>

              <button
                type="button"
                onClick={() => setPermissionModalTab('ACTIONS')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition flex items-center gap-1.5 ${
                  permissionModalTab === 'ACTIONS' ? 'bg-[#FF6B00] text-white shadow-sm font-black' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>2. Action Permissions Matrix</span>
              </button>

              <button
                type="button"
                onClick={() => setPermissionModalTab('SCOPES')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition flex items-center gap-1.5 ${
                  permissionModalTab === 'SCOPES' ? 'bg-[#FF6B00] text-white shadow-sm font-black' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>3. Data Scope</span>
              </button>

              <button
                type="button"
                onClick={() => setPermissionModalTab('APPROVALS')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition flex items-center gap-1.5 ${
                  permissionModalTab === 'APPROVALS' ? 'bg-[#FF6B00] text-white shadow-sm font-black' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Workflow className="w-3.5 h-3.5" />
                <span>4. Approval Authority</span>
              </button>

              <button
                type="button"
                onClick={() => setPermissionModalTab('SPECIAL')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition flex items-center gap-1.5 ${
                  permissionModalTab === 'SPECIAL' ? 'bg-[#FF6B00] text-white shadow-sm font-black' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>5. Special Permissions</span>
              </button>

              <button
                type="button"
                onClick={() => setPermissionModalTab('SECURITY')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition flex items-center gap-1.5 ${
                  permissionModalTab === 'SECURITY' ? 'bg-[#FF6B00] text-white shadow-sm font-black' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>6. Security &amp; Lock</span>
              </button>

              <button
                type="button"
                onClick={() => setPermissionModalTab('AUDIT')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition flex items-center gap-1.5 ${
                  permissionModalTab === 'AUDIT' ? 'bg-[#FF6B00] text-white shadow-sm font-black' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>7. Audit History</span>
              </button>
            </div>

            {/* Modal Body Container */}
            <div className="overflow-y-auto p-4 flex-1 text-xs">
              {/* SECTION 1: MODULE ACCESS TOGGLES */}
              {permissionModalTab === 'MODULES' && (
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-blue-900 dark:text-blue-300">
                    Enable or disable access to entire ERP modules for this user account. When disabled, navigation menu items and API endpoints are blocked.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {ERP_PERMISSION_MODULES.map(m => {
                      const mod = permissionDraft[m.key] || {};
                      const isEnabled = mod.canView !== false && Object.values(mod).some(v => v === true);
                      return (
                        <div key={m.key} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between gap-2">
                          <div>
                            <div className="flex justify-between items-start">
                              <span className="font-bold text-slate-900 dark:text-white">{m.name}</span>
                              <button
                                type="button"
                                onClick={() => handleToggleModuleAll(m.key, !isEnabled)}
                                className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                  isEnabled ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                                }`}
                              >
                                {isEnabled ? 'ENABLED' : 'DISABLED'}
                              </button>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">{m.description}</p>
                          </div>
                          <div className="text-[10px] font-mono text-slate-500">
                            Category: <span className="font-bold text-slate-700 dark:text-slate-300">{m.category}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SECTION 2: ACTION PERMISSIONS MATRIX */}
              {permissionModalTab === 'ACTIONS' && (
                <div className="space-y-4">
                  {/* Action Bar & Legend */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex flex-wrap items-center gap-3 text-[11px]">
                      <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                        <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> GRANTED
                      </span>
                      <span className="flex items-center gap-1.5 font-bold text-slate-400">
                        <span className="w-2.5 h-2.5 rounded bg-slate-300 dark:bg-slate-600"></span> RESTRICTED
                      </span>
                      <span className="flex items-center gap-1.5 font-bold text-cyan-600 dark:text-cyan-400">
                        <span className="px-1.5 py-0.2 rounded bg-cyan-100 dark:bg-cyan-950 text-[9px]">INHERITED</span>
                      </span>
                      <span className="flex items-center gap-1.5 font-bold text-purple-600 dark:text-purple-400">
                        <span className="px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-950 text-[9px]">CUSTOM</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSelectAllPermissions}
                        className="px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold text-[11px]"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={handleClearAllPermissions}
                        className="px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold text-[11px]"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  {/* 13-Action Permission Matrix Table */}
                  <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead className="bg-[#001F3F] text-white font-bold uppercase tracking-wider sticky top-0 z-10">
                        <tr>
                          <th className="p-2.5">Module Name</th>
                          <th className="p-2.5 text-center">View</th>
                          <th className="p-2.5 text-center">Create</th>
                          <th className="p-2.5 text-center">Edit</th>
                          <th className="p-2.5 text-center">Delete</th>
                          <th className="p-2.5 text-center">Approve</th>
                          <th className="p-2.5 text-center">Reject</th>
                          <th className="p-2.5 text-center">Export</th>
                          <th className="p-2.5 text-center">Import</th>
                          <th className="p-2.5 text-center">Print</th>
                          <th className="p-2.5 text-center">Assign</th>
                          <th className="p-2.5 text-center">Transfer</th>
                          <th className="p-2.5 text-center">Verify</th>
                          <th className="p-2.5 text-center">Manage</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                        {ERP_PERMISSION_MODULES.map(m => {
                          const modState = permissionDraft[m.key] || {};
                          const roleDefault = userAccountManagementService.getRolePermissionTemplate(selectedUser.role)[m.key] || {};
                          const actionKeys: (keyof ModulePermissionSet)[] = [
                            'canView', 'canCreate', 'canEdit', 'canDelete', 'canApprove', 'canReject',
                            'canExport', 'canImport', 'canPrint', 'canAssign', 'canTransfer', 'canVerify', 'canManage'
                          ];
                          const hasCustomOverride = selectedUser.customPermissions && (selectedUser.customPermissions as any)[m.key];
                          return (
                            <tr key={m.key} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                              <td className="p-2.5 font-bold text-slate-900 dark:text-white">
                                <div className="flex items-center gap-2">
                                  <span>{m.name}</span>
                                  {hasCustomOverride ? (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">CUSTOM</span>
                                  ) : (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">INHERITED</span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 font-normal">{m.category}</div>
                              </td>
                              {actionKeys.map(act => (
                                <td key={act} className="p-2.5 text-center">
                                  <input
                                    type="checkbox"
                                    checked={!!modState[act]}
                                    onChange={() => handleTogglePermissionAction(m.key, act)}
                                    className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 cursor-pointer"
                                  />
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SECTION 3: DATA SCOPE */}
              {permissionModalTab === 'SCOPES' && (
                <div className="space-y-4">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl text-indigo-900 dark:text-indigo-300">
                    <strong className="block font-bold">Data Isolation &amp; Visibility Boundary</strong>
                    Data scopes dictate the horizontal boundary of records this user can query and interact with in each module.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {ERP_PERMISSION_MODULES.map(m => {
                      const currentScope = userScopesDraft[m.key] || (selectedUser.role === 'SUPER_ADMIN' || selectedUser.role === 'ERP_COORDINATOR' ? 'ALL_UNIVERSITY' : (selectedUser.role === 'HOD' ? 'DEPARTMENT' : 'SELF'));
                      return (
                        <div key={m.key} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                          <div className="font-bold text-slate-900 dark:text-white flex justify-between items-center">
                            <span>{m.name}</span>
                            <span className="text-[10px] font-mono text-slate-400">{m.category}</span>
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-slate-500 mb-1">Data Scope Boundary</label>
                            <select
                              value={currentScope}
                              onChange={e => setUserScopesDraft(prev => ({ ...prev, [m.key]: e.target.value as DataScopeType }))}
                              className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold text-xs text-blue-900 dark:text-blue-300"
                            >
                              <option value="ALL_UNIVERSITY">🌐 ALL UNIVERSITY (Central Level)</option>
                              <option value="INSTITUTION">🏛️ INSTITUTION (Campus Level)</option>
                              <option value="DEPARTMENT">🏢 DEPARTMENT (Department Level)</option>
                              <option value="PROGRAM">🎓 PROGRAM (Degree Level)</option>
                              <option value="CLASS">👥 CLASS (Division/Section)</option>
                              <option value="SELF">👤 SELF (Own Records Only)</option>
                              <option value="ASSIGNED_USERS">🎯 ASSIGNED USERS</option>
                              <option value="ASSIGNED_ASSETS">📦 ASSIGNED ASSETS</option>
                            </select>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SECTION 4: APPROVAL AUTHORITY */}
              {permissionModalTab === 'APPROVALS' && (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-900 dark:text-emerald-300 space-y-2">
                    <h4 className="font-black uppercase tracking-wider text-xs flex items-center gap-2">
                      <Workflow className="w-4 h-4 text-emerald-600" />
                      <span>Configured Approval Authority</span>
                    </h4>
                    <p>
                      Users with approval privileges can approve or reject asset requisitions, transfer requests, and academic permissions according to university policy.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                      <h4 className="font-bold text-slate-900 dark:text-white border-b pb-2">Approval Hierarchy Level</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                          <span className="text-slate-500">Authority Role:</span>
                          <strong className="text-slate-900 dark:text-white font-mono">{selectedUser.role}</strong>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                          <span className="text-slate-500">Jurisdiction:</span>
                          <strong className="text-slate-900 dark:text-white">{selectedUser.departmentName || 'University Wide'}</strong>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-500">Self-Approval Prohibition:</span>
                          <strong className="text-emerald-600 font-bold">STRICTLY ENFORCED</strong>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                      <h4 className="font-bold text-slate-900 dark:text-white border-b pb-2">Active Approval Workflows</h4>
                      <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>Asset Requisitions (Central Store / HOD)</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>Department Asset Transfers</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>Faculty Workload &amp; Transfer Authorizations</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 5: SPECIAL PERMISSIONS */}
              {permissionModalTab === 'SPECIAL' && (
                <div className="space-y-4">
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-900 dark:text-amber-300">
                    Special permissions grant elevated operational privileges. All activities under these permissions are recorded in the security audit trail.
                  </div>

                  <div className="space-y-3">
                    <label className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" className="mt-1 w-4 h-4 text-orange-600 rounded" defaultChecked={selectedUser.role === 'SUPER_ADMIN' || selectedUser.role === 'ERP_COORDINATOR'} />
                      <div>
                        <strong className="block font-bold text-slate-900 dark:text-white">Emergency Administrative Access</strong>
                        <p className="text-[11px] text-slate-500">Allows emergency operational overrides when department administrators are unavailable.</p>
                      </div>
                    </label>

                    <label className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" className="mt-1 w-4 h-4 text-orange-600 rounded" defaultChecked={['SUPER_ADMIN', 'ERP_COORDINATOR', 'REGISTRAR'].includes(selectedUser.role)} />
                      <div>
                        <strong className="block font-bold text-slate-900 dark:text-white">Direct Excel/CSV Data Export</strong>
                        <p className="text-[11px] text-slate-500">Grants privilege to export raw student, faculty, and inventory datasets in bulk.</p>
                      </div>
                    </label>

                    <label className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" className="mt-1 w-4 h-4 text-orange-600 rounded" defaultChecked={['SUPER_ADMIN', 'ERP_COORDINATOR'].includes(selectedUser.role)} />
                      <div>
                        <strong className="block font-bold text-slate-900 dark:text-white">Security Audit Log Inspector</strong>
                        <p className="text-[11px] text-slate-500">Allows reviewing complete system-wide authentication and authorization logs.</p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* SECTION 6: SECURITY & LOCK STATUS */}
              {permissionModalTab === 'SECURITY' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
                    <h4 className="font-bold text-slate-900 dark:text-white border-b pb-2 text-sm">Account Status &amp; Lock Controls</h4>
                    
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">Account Lock Status</div>
                        <div className="text-slate-500 text-[11px]">
                          Current: {renderStatusBadge(selectedUser.accountStatus || selectedUser.status)}
                        </div>
                        {selectedUser.accountStatus === 'LOCKED' && selectedUser.lockReason && (
                          <div className="text-rose-600 font-medium text-[11px] mt-1">
                            Lock Reason: {selectedUser.lockReason}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenLockModal(selectedUser)}
                        className={`px-4 py-2 rounded-xl font-black text-xs flex items-center gap-2 shadow-sm ${
                          selectedUser.accountStatus === 'LOCKED'
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-rose-600 hover:bg-rose-700 text-white'
                        }`}
                      >
                        {selectedUser.accountStatus === 'LOCKED' ? (
                          <>
                            <Unlock className="w-4 h-4" />
                            <span>Unlock Account</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4" />
                            <span>Lock User Account</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="font-bold text-slate-900 dark:text-white">Two-Factor Authentication</div>
                        <div className="text-slate-500 text-[11px] mt-0.5">Status: {selectedUser.twoFactorEnabled ? '🟢 Enabled' : '⚪ Disabled'}</div>
                      </div>

                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="font-bold text-slate-900 dark:text-white">Force Password Change</div>
                        <div className="text-slate-500 text-[11px] mt-0.5">Required on next login: {selectedUser.forcePasswordReset ? 'Yes' : 'No'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 7: AUDIT HISTORY */}
              {permissionModalTab === 'AUDIT' && (
                <div className="space-y-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Security Audit Logs for @{selectedUser.username}</span>
                  </div>

                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#001F3F] text-white font-bold">
                        <tr>
                          <th className="p-2.5">Timestamp</th>
                          <th className="p-2.5">Action</th>
                          <th className="p-2.5">Module</th>
                          <th className="p-2.5">Event Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {db.getAuditLogs().filter(l => l.userId === selectedUser.id || (selectedUser.username && (l.userName === selectedUser.username || (l.details || '').includes(selectedUser.username)))).slice(0, 10).map(l => (
                          <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="p-2.5 font-mono text-slate-500">{new Date(l.timestamp).toLocaleString('en-IN')}</td>
                            <td className="p-2.5 font-bold text-slate-900 dark:text-white">{l.action}</td>
                            <td className="p-2.5 font-mono text-slate-600 dark:text-slate-300">{l.module || l.entity}</td>
                            <td className="p-2.5 text-slate-600 dark:text-slate-400">{l.details}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 flex justify-between items-center">
              <div className="text-slate-500 text-[11px]">
                All permission modifications are evaluated in real-time and backed by backend authorization checks.
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsPermissionsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePermissions}
                  className="px-5 py-2 rounded-xl bg-[#001F3F] hover:bg-[#0F2C59] text-white font-black text-xs flex items-center gap-2 shadow-md"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Save User Permissions &amp; Scopes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 4: PASSWORD RESET ─────────────────────────────────────────── */}
      {isResetPasswordModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
            <div className="p-4 bg-[#001F3F] text-white flex justify-between items-center">
              <div>
                <h3 className="font-black text-sm uppercase tracking-wider flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <span>Reset User Password</span>
                </h3>
                <p className="text-[11px] text-blue-200">Account ID: <strong className="font-mono text-amber-300">{selectedUser.username}</strong></p>
              </div>
              <button onClick={() => setIsResetPasswordModalOpen(false)} className="text-white hover:text-amber-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveResetPassword} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-amber-800 dark:text-amber-300">
                  Password changes will be logged in the immutable security audit trail.
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">New Password *</label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-[11px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" /> Generate Secure
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Enter new password..."
                  value={newPasswordVal}
                  onChange={e => setNewPasswordVal(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Confirm New Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Confirm new password..."
                  value={confirmPasswordVal}
                  onChange={e => setConfirmPasswordVal(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={forceResetNextLogin}
                    onChange={e => setForceResetNextLogin(e.target.checked)}
                    className="rounded text-orange-600 focus:ring-orange-500"
                  />
                  <span>Force user to change password upon next login</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsResetPasswordModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#001F3F] hover:bg-[#0F2C59] text-white font-black shadow-md flex items-center gap-2"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── DRAWER: USER DETAILS PROFILE ────────────────────────────────────── */}
      {isUserDetailsDrawerOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col">
            <div className="p-5 bg-[#001F3F] text-white flex justify-between items-center">
              <div>
                <h3 className="font-black text-base flex items-center gap-2">
                  <Eye className="w-5 h-5 text-amber-400" />
                  <span>User Account Dossier</span>
                </h3>
                <p className="text-xs text-blue-200">{selectedUser.name}</p>
              </div>
              <button onClick={() => setIsUserDetailsDrawerOpen(false)} className="text-white hover:text-amber-400">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              {/* Account Identity Card */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#001F3F] text-amber-400 font-black text-base flex items-center justify-center">
                    {(selectedUser.name || 'U').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-slate-900 dark:text-white">{selectedUser.name}</h4>
                    <div className="font-mono text-slate-500">@{selectedUser.username}</div>
                  </div>
                  <div className="ml-auto">
                    {renderStatusBadge(selectedUser.accountStatus || selectedUser.status)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700 font-medium">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Email Address</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">{selectedUser.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Employee/Student ID</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">{selectedUser.employeeId || selectedUser.enrollmentNo || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Assigned Role</span>
                    <span>{renderRoleBadge(selectedUser.role)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Department</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">{selectedUser.departmentName || 'SSCIT'}</span>
                  </div>
                </div>
              </div>

              {/* Security & Access Overview */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <h4 className="font-black text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-600" />
                  <span>Security &amp; Authorization Metrics</span>
                </h4>
                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Last Login</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {selectedUser.lastLoginAt ? new Date(selectedUser.lastLoginAt).toLocaleString('en-IN') : 'Never Logged In'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">2FA Status</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {selectedUser.twoFactorEnabled ? '🟢 Enabled' : '⚪ Disabled'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Password Reset Required</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {selectedUser.forcePasswordReset ? '⚠️ Yes (At next login)' : 'No'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Created On</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">
                      {selectedUser.createdAt ? selectedUser.createdAt.split('T')[0] : '2024-01-01'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Accessible Modules Summary */}
              <div className="space-y-2">
                <h4 className="font-black text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Authorized ERP Modules</span>
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {ERP_PERMISSION_MODULES.map(m => {
                    const { permissions } = userAccountManagementService.getEffectivePermissions(selectedUser);
                    const canView = permissions[m.key]?.canView;
                    return (
                      <div
                        key={m.key}
                        className={`p-2 rounded-lg border text-[11px] font-bold flex items-center justify-between ${
                          canView ? 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:text-slate-500'
                        }`}
                      >
                        <span>{m.name}</span>
                        {canView ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 mt-auto">
              <button
                type="button"
                onClick={() => setIsUserDetailsDrawerOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 5: USER AUDIT LOG TRAIL ───────────────────────────────────── */}
      {isUserAuditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 bg-[#001F3F] text-white flex justify-between items-center">
              <div>
                <h3 className="font-black text-sm uppercase tracking-wider flex items-center gap-2">
                  <History className="w-4 h-4 text-amber-400" />
                  <span>Security Audit History for {selectedUser.name}</span>
                </h3>
                <p className="text-[11px] text-blue-200">Account: @{selectedUser.username} | Role: {selectedUser.role}</p>
              </div>
              <button onClick={() => setIsUserAuditModalOpen(false)} className="text-white hover:text-amber-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {userAccountManagementService.getUserAuditLogs(selectedUser).length === 0 ? (
                <div className="p-8 text-center text-slate-500 font-bold">
                  No security audit records logged for this account yet.
                </div>
              ) : (
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-[#001F3F] text-white font-bold">
                    <tr>
                      <th className="p-2.5">Date &amp; Time</th>
                      <th className="p-2.5">Actor</th>
                      <th className="p-2.5">Action</th>
                      <th className="p-2.5">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {userAccountManagementService.getUserAuditLogs(selectedUser).map(l => (
                      <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-2.5 font-mono text-slate-500 whitespace-nowrap">
                          {l.timestamp ? new Date(l.timestamp).toLocaleString('en-IN') : '2026-08-25'}
                        </td>
                        <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200">{l.userName}</td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-100 text-blue-900 border border-blue-200">
                            {l.action}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-300">{l.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsUserAuditModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs"
              >
                Close Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 6: MASTER TABLE CONFIGURATION MODAL ───────────────────────── */}
      {isMasterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
            <div className="p-4 bg-[#001F3F] text-white flex justify-between items-center">
              <h3 className="font-black text-sm uppercase tracking-wider">
                Create Master Entry ({masterSubTab})
              </h3>
              <button onClick={() => setIsMasterModalOpen(false)} className="text-white hover:text-amber-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMaster} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={masterName}
                  onChange={e => setMasterName(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                />
              </div>

              {masterSubTab !== 'AY' && masterSubTab !== 'DIV' && (
                <div>
                  <label className="block font-bold mb-1">Identification Code *</label>
                  <input
                    type="text"
                    required
                    value={masterCode}
                    onChange={e => setMasterCode(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono"
                  />
                </div>
              )}

              {masterSubTab === 'DEPT' && (
                <div>
                  <label className="block font-bold mb-1">Parent Institute College *</label>
                  <select
                    value={parentSelectId}
                    onChange={e => setParentSelectId(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold"
                  >
                    <option value="">Select Institute</option>
                    {institutes.map(inst => <option key={inst.id} value={inst.id}>{inst.name}</option>)}
                  </select>
                </div>
              )}

              {masterSubTab === 'PROG' && (
                <div>
                  <label className="block font-bold mb-1">Parent Department *</label>
                  <select
                    value={parentSelectId}
                    onChange={e => setParentSelectId(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold"
                  >
                    <option value="">Select Department</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              )}

              {masterSubTab === 'SEM' && (
                <div>
                  <label className="block font-bold mb-1">Parent Program *</label>
                  <select
                    value={parentSelectId}
                    onChange={e => setParentSelectId(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold"
                  >
                    <option value="">Select Program</option>
                    {programs.map(p => <option key={p.id} value={p.id}>{p.code}</option>)}
                  </select>
                </div>
              )}

              {masterSubTab === 'DIV' && (
                <div>
                  <label className="block font-bold mb-1">Parent Semester *</label>
                  <select
                    value={parentSelectId}
                    onChange={e => setParentSelectId(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold"
                  >
                    <option value="">Select Semester</option>
                    {semesters.map(sem => <option key={sem.id} value={sem.id}>{sem.code}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold mb-1">Status</label>
                <select
                  value={masterStatus}
                  onChange={e => setMasterStatus(e.target.value as any)}
                  className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsMasterModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#001F3F] hover:bg-[#0F2C59] text-white font-black"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
