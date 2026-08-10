import React, { useState } from 'react';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/common/Badge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { User, UserRole, Department, Program, Semester, Division, AcademicYear } from '../../types';
import { 
  Users, Shield, ShieldAlert, Key, ToggleLeft, ToggleRight, Plus, 
  Settings, Database, Search, Edit3, Trash2, KeyRound, Check, X
} from 'lucide-react';

export const SystemSettingsPage: React.FC = () => {
  const { user: currentUser } = useAuth();

  const users = db.getUsers();
  const auditLogs = db.getAuditLogs();
  const departments = db.getDepartments();
  const programs = db.getPrograms();
  const semesters = db.getSemesters();
  const divisions = db.getDivisions();
  const academicYears = db.getAcademicYears();
  const institutes = db.getInstitutes();

  // Tab State
  const [activeSettingsTab, setActiveSettingsTab] = useState<'USERS' | 'AUDIT' | 'MASTER'>('USERS');
  const [masterSubTab, setMasterSubTab] = useState<'DEPT' | 'PROG' | 'SEM' | 'DIV' | 'AY'>('DEPT');

  // Filters / Search
  const [userSearch, setUserSearch] = useState('');
  const [auditSearch, setAuditSearch] = useState('');

  // Modals
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [isMasterModalOpen, setIsMasterModalOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedMasterId, setSelectedMasterId] = useState<string | null>(null);

  // Form State: User
  const [username, setUsername] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState<UserRole>('STUDENT');
  const [userStatus, setUserStatus] = useState<boolean>(true);
  const [userPassword, setUserPassword] = useState('');

  // Form State: Reset Password
  const [newPassword, setNewPassword] = useState('');

  // Form State: Master entities
  const [masterName, setMasterName] = useState('');
  const [masterCode, setMasterCode] = useState('');
  const [parentSelectId, setParentSelectId] = useState(''); // e.g. instituteId, departmentId, programId, etc.
  const [masterStatus, setMasterStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  // User list operations
  const handleOpenAddUser = () => {
    setSelectedUser(null);
    setUsername('');
    setUserEmail('');
    setUserRole('STUDENT');
    setUserStatus(true);
    setUserPassword('');
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (u: User) => {
    setSelectedUser(u);
    setUsername(u.username || '');
    setUserEmail(u.email);
    setUserRole(u.role);
    setUserStatus(u.status === 'ACTIVE');
    setUserPassword('');
    setIsUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedUser) {
      db.updateEntity<User>('users', selectedUser.id, {
        username,
        email: userEmail,
        role: userRole,
        status: userStatus ? 'ACTIVE' : 'INACTIVE'
      }, `Modified credentials details for user profile: ${username}`);
    } else {
      db.addEntity<User>('users', {
        name: username,
        username,
        email: userEmail,
        password: userPassword || 'User@123',
        role: userRole,
        status: userStatus ? 'ACTIVE' : 'INACTIVE',
        createdAt: new Date().toISOString().split('T')[0]
      }, `Provisioned new user account for: ${username}`);
    }
    setIsUserModalOpen(false);
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    db.updateEntity<User>('users', selectedUser.id, {
      password: newPassword
    }, `Administrative password reset triggered for user: ${selectedUser.username}`);

    setNewPassword('');
    setIsResetPasswordModalOpen(false);
    alert(`Successfully reset password for user ${selectedUser.username}`);
  };

  const handleToggleUserStatus = (u: User) => {
    const nextStatus = u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    db.updateEntity<User>('users', u.id, {
      status: nextStatus
    }, `Toggled authorization status to ${nextStatus} for ${u.username}`);
  };

  // Master Settings operations
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
  };

  // Filter list
  const filteredUsers = users.filter(u => {
    const q = userSearch.toLowerCase();
    return (u.username || '').toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
  });

  const filteredLogs = auditLogs.filter(log => {
    const q = auditSearch.toLowerCase();
    return log.userName.toLowerCase().includes(q) || log.action.toLowerCase().includes(q) || log.details.toLowerCase().includes(q);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
            System Settings &amp; Operations
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Provision user authorization profiles, analyze security audits, and configure Master databases
          </p>
        </div>
      </div>

      {/* Main Tab Controls */}
      <div className="card" style={{ padding: '0.75rem 1rem', display: 'flex', gap: '0.5rem' }}>
        <button
          className={`btn btn-sm ${activeSettingsTab === 'USERS' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveSettingsTab('USERS')}
        >
          <Users size={14} /> Account Management
        </button>
        <button
          className={`btn btn-sm ${activeSettingsTab === 'AUDIT' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveSettingsTab('AUDIT')}
        >
          <Shield size={14} /> Security Audit Trails
        </button>
        <button
          className={`btn btn-sm ${activeSettingsTab === 'MASTER' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveSettingsTab('MASTER')}
        >
          <Settings size={14} /> Database Configuration
        </button>
      </div>

      {/* Tab: Users Management */}
      {activeSettingsTab === 'USERS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ position: 'relative', width: '320px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search username, email, roles..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                style={{ paddingLeft: '2.2rem' }}
              />
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>

            <button className="btn btn-primary" onClick={handleOpenAddUser}>
              <Plus size={16} /> Create User Account
            </button>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email Address</th>
                    <th>Assigned Role</th>
                    <th>Authorization</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>{u.username || 'N/A'}</td>
                      <td>{u.email}</td>
                      <td><Badge variant="navy">{u.role}</Badge></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => handleToggleUserStatus(u)}>
                          {u.status === 'ACTIVE' ? (
                            <span style={{ display: 'flex', alignItems: 'center', color: '#10B981', gap: '0.25rem', fontSize: '0.8125rem', fontWeight: 700 }}>
                              <ToggleRight size={20} /> Active
                            </span>
                          ) : (
                            <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)', gap: '0.25rem', fontSize: '0.8125rem' }}>
                              <ToggleLeft size={20} /> Inactive
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEditUser(u)}>
                            <Edit3 size={14} />
                          </button>
                          <button className="btn btn-secondary btn-sm" onClick={() => { setSelectedUser(u); setIsResetPasswordModalOpen(true); }} title="Reset Password">
                            <KeyRound size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Security Audit Logs */}
      {activeSettingsTab === 'AUDIT' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ position: 'relative', width: '360px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search event logs, actor, details..."
              value={auditSearch}
              onChange={e => setAuditSearch(e.target.value)}
              style={{ paddingLeft: '2.2rem' }}
            />
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Security Actor</th>
                    <th>Role Type</th>
                    <th>Trigger Action</th>
                    <th>Database Context</th>
                    <th>Log Description</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map(log => (
                    <tr key={log.id}>
                      <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.timestamp}</td>
                      <td style={{ fontWeight: 700 }}>{log.userName}</td>
                      <td><Badge variant="navy">{log.userRole}</Badge></td>
                      <td><Badge variant={log.action === 'DELETE' ? 'danger' : 'active'}>{log.action}</Badge></td>
                      <td><strong style={{ fontSize: '0.8125rem' }}>{log.entity}</strong></td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Database Config / Master Settings */}
      {activeSettingsTab === 'MASTER' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Sub Tab selection */}
          <div className="card" style={{ padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem', alignSelf: 'flex-start', background: 'var(--bg-surface-hover)' }}>
            <button className={`btn btn-sm ${masterSubTab === 'DEPT' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMasterSubTab('DEPT')}>Departments</button>
            <button className={`btn btn-sm ${masterSubTab === 'PROG' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMasterSubTab('PROG')}>Programs</button>
            <button className={`btn btn-sm ${masterSubTab === 'SEM' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMasterSubTab('SEM')}>Semesters</button>
            <button className={`btn btn-sm ${masterSubTab === 'DIV' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMasterSubTab('DIV')}>Divisions</button>
            <button className={`btn btn-sm ${masterSubTab === 'AY' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMasterSubTab('AY')}>Academic Years</button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" onClick={handleOpenAddMaster}>
              <Plus size={16} /> Add New Entry
            </button>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            {masterSubTab === 'DEPT' && (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Dept Name</th>
                      <th>Dept Code</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.map(d => (
                      <tr key={d.id}>
                        <td style={{ fontWeight: 700 }}>{d.name}</td>
                        <td>{d.code}</td>
                        <td><Badge variant={d.status === 'ACTIVE' ? 'active' : 'inactive'}>{d.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {masterSubTab === 'PROG' && (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Program Name</th>
                      <th>Program Code</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {programs.map(p => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 700 }}>{p.name}</td>
                        <td>{p.code}</td>
                        <td><Badge variant={p.status === 'ACTIVE' ? 'active' : 'inactive'}>{p.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {masterSubTab === 'SEM' && (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Semester Number</th>
                      <th>Semester Code</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {semesters.map(s => (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 700 }}>Semester {s.number}</td>
                        <td>{s.code}</td>
                        <td><Badge variant={s.status === 'ACTIVE' ? 'active' : 'inactive'}>{s.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {masterSubTab === 'DIV' && (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Division Name</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {divisions.map(d => (
                      <tr key={d.id}>
                        <td style={{ fontWeight: 700 }}>{d.name}</td>
                        <td><Badge variant={d.status === 'ACTIVE' ? 'active' : 'inactive'}>{d.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {masterSubTab === 'AY' && (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Academic Year Name</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {academicYears.map(ay => (
                      <tr key={ay.id}>
                        <td style={{ fontWeight: 700 }}>{ay.name}</td>
                        <td><Badge variant={ay.status === 'ACTIVE' ? 'active' : 'inactive'}>{ay.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* User Create/Edit Modal */}
      {isUserModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '480px', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1.25rem' }}>
              {selectedUser ? 'Edit User Credentials' : 'Provision User Account'}
            </h3>

            <form onSubmit={handleSaveUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Username Account ID *</label>
                <input type="text" className="form-input" value={username} onChange={e => setUsername(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Primary Email Address *</label>
                <input type="email" className="form-input" value={userEmail} onChange={e => setUserEmail(e.target.value)} required />
              </div>

              {!selectedUser && (
                <div className="form-group">
                  <label className="form-label">Account Password *</label>
                  <input type="password" className="form-input" value={userPassword} onChange={e => setUserPassword(e.target.value)} placeholder="User@123" required />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Assigned Security Role *</label>
                <select className="form-select" value={userRole} onChange={e => setUserRole(e.target.value as any)}>
                  <option value="SUPER_ADMIN">SUPER ADMIN</option>
                  <option value="UNIVERSITY_ADMIN">UNIVERSITY ADMIN</option>
                  <option value="PRINCIPAL">PRINCIPAL</option>
                  <option value="HOD">HEAD OF DEPT (HOD)</option>
                  <option value="FACULTY">FACULTY MEMBER</option>
                  <option value="STUDENT">STUDENT RECORD</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsUserModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save User account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {isResetPasswordModalOpen && selectedUser && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '0.25rem' }}>
              Reset Account Password
            </h3>
            <div style={{ fontSize: '0.8125rem', color: 'var(--brand-orange)', fontWeight: 700, marginBottom: '1.25rem' }}>
              Account: {selectedUser.username}
            </div>

            <form onSubmit={handleResetPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">New Password Value *</label>
                <input type="password" className="form-input" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Enter secure password..." required />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsResetPasswordModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Reset Password</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Master Configuration Modal */}
      {isMasterModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1.25rem' }}>
              Create Master Configuration Entry
            </h3>

            <form onSubmit={handleSaveMaster} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input type="text" className="form-input" value={masterName} onChange={e => setMasterName(e.target.value)} required />
              </div>

              {masterSubTab !== 'AY' && masterSubTab !== 'DIV' && (
                <div className="form-group">
                  <label className="form-label">Identification Code *</label>
                  <input type="text" className="form-input" value={masterCode} onChange={e => setMasterCode(e.target.value)} required />
                </div>
              )}

              {/* Conditional Parent Selection */}
              {masterSubTab === 'DEPT' && (
                <div className="form-group">
                  <label className="form-label">Parent Institute College *</label>
                  <select className="form-select" value={parentSelectId} onChange={e => setParentSelectId(e.target.value)}>
                    <option value="">Select Institute</option>
                    {institutes.map(inst => <option key={inst.id} value={inst.id}>{inst.name}</option>)}
                  </select>
                </div>
              )}

              {masterSubTab === 'PROG' && (
                <div className="form-group">
                  <label className="form-label">Parent Department *</label>
                  <select className="form-select" value={parentSelectId} onChange={e => setParentSelectId(e.target.value)}>
                    <option value="">Select Department</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              )}

              {masterSubTab === 'SEM' && (
                <div className="form-group">
                  <label className="form-label">Parent Program *</label>
                  <select className="form-select" value={parentSelectId} onChange={e => setParentSelectId(e.target.value)}>
                    <option value="">Select Program</option>
                    {programs.map(p => <option key={p.id} value={p.id}>{p.code}</option>)}
                  </select>
                </div>
              )}

              {masterSubTab === 'DIV' && (
                <div className="form-group">
                  <label className="form-label">Parent Semester *</label>
                  <select className="form-select" value={parentSelectId} onChange={e => setParentSelectId(e.target.value)}>
                    <option value="">Select Semester</option>
                    {semesters.map(sem => <option key={sem.id} value={sem.id}>{sem.code}</option>)}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={masterStatus} onChange={e => setMasterStatus(e.target.value as any)}>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsMasterModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
