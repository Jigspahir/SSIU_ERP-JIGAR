import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Bell, LogOut, User, RefreshCw, 
  CheckCircle2, ChevronDown
} from 'lucide-react';
import { UserRole } from '../../types';
import { db } from '../../services/db';

interface TopbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({ activeTab, setActiveTab }) => {
  const { user, role, logout, resetSystemDatabase } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const rolesList: { role: UserRole; label: string; bg: string; text: string }[] = [
    { role: 'SUPER_ADMIN', label: 'Super Admin', bg: '#0F2C59', text: '#FFFFFF' },
    { role: 'UNIVERSITY_ADMIN', label: 'University Admin', bg: '#0F2C59', text: '#FFFFFF' },
    { role: 'PRINCIPAL', label: 'Principal', bg: '#183B70', text: '#FFFFFF' },
    { role: 'HOD', label: 'HOD', bg: '#0097D7', text: '#FFFFFF' },
    { role: 'FACULTY', label: 'Faculty', bg: '#10B981', text: '#FFFFFF' },
    { role: 'STUDENT', label: 'Student', bg: '#8B5CF6', text: '#FFFFFF' }
  ];

  const currentRoleInfo = rolesList.find(r => r.role === role) || rolesList[0];
  const auditLogs = db.getAuditLogs().slice(0, 5);

  const getBreadcrumbTitle = (tab: string) => {
    const map: Record<string, string> = {
      dashboard: 'Dashboard Overview',
      institutes: 'Institutes Master',
      departments: 'Departments Master',
      programs: 'Academic Programs Master',
      'academic-years': 'Academic Years Master',
      batches: 'Batches Master',
      semesters: 'Semesters Master',
      divisions: 'Divisions Master',
      subjects: 'Subjects Master',
      faculty: 'Faculty Directory',
      students: 'Student Directory',
      profile: 'User Profile & Security'
    };
    return map[tab] || 'Swarrnim ERP';
  };

  return (
    <header
      style={{
        height: 'var(--topbar-height)',
        backgroundColor: 'var(--bg-topbar)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 80
      }}
    >
      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand-orange)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          Swarrnim ERP • {role?.replace('_', ' ')} Scope
        </div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
          {getBreadcrumbTitle(activeTab)}
        </h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Static Read-Only Active Role Indicator (NO Dropdown / NO Switcher) */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            backgroundColor: currentRoleInfo.bg,
            color: currentRoleInfo.text,
            fontSize: '0.8125rem',
            fontWeight: 600,
            padding: '0.4rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
          }}
          title="Role is fixed by your login credentials. Logout to switch accounts."
        >
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#5EEAD4' }}></span>
          <span>Role: <strong>{currentRoleInfo.label}</strong></span>
        </div>

        <button
          className="btn btn-secondary btn-sm"
          style={{ borderRadius: 'var(--radius-full)' }}
          onClick={() => {
            if (window.confirm('Reset database back to original Swarrnim University seed data?')) {
              resetSystemDatabase();
              alert('Database reset successfully!');
            }
          }}
          title="Reset database to default seed state"
        >
          <RefreshCw size={14} /> Reset Seed Data
        </button>

        {/* Audit Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowUserDropdown(false); }}
            className="btn btn-secondary btn-icon"
            style={{ borderRadius: '50%', position: 'relative' }}
            title="System Audit Notifications"
          >
            <Bell size={18} />
            <span style={{ position: 'absolute', top: '2px', right: '2px', width: '8px', height: '8px', backgroundColor: 'var(--brand-orange)', borderRadius: '50%' }}></span>
          </button>

          {showNotifications && (
            <div
              className="card"
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 8px)',
                width: '320px',
                padding: '0.75rem',
                zIndex: 100,
                boxShadow: 'var(--shadow-lg)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', padding: '0 0.25rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--brand-navy)' }}>Recent Audit Activity</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Real-time</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '280px', overflowY: 'auto' }}>
                {auditLogs.map(log => (
                  <div key={log.id} style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-hover)', fontSize: '0.78125rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{log.userName} • {log.action}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{log.details}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-light)', marginTop: '2px' }}>
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Account Menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowUserDropdown(!showUserDropdown); setShowNotifications(false); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '0.25rem'
            }}
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
              alt={user?.name}
              style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--brand-orange)' }}
            />
            <ChevronDown size={14} color="var(--text-muted)" />
          </button>

          {showUserDropdown && (
            <div
              className="card"
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 8px)',
                width: '220px',
                padding: '0.5rem',
                zIndex: 100,
                boxShadow: 'var(--shadow-lg)'
              }}
            >
              <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.25rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--brand-navy)' }}>{user?.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.email}</div>
              </div>

              <button
                onClick={() => { setActiveTab('profile'); setShowUserDropdown(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: '0.8125rem',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-main)'
                }}
              >
                <User size={16} /> My Profile
              </button>

              <button
                onClick={() => { logout(); setShowUserDropdown(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: '0.8125rem',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-danger)',
                  marginTop: '0.25rem',
                  borderTop: '1px solid var(--border-color)'
                }}
              >
                <LogOut size={16} /> Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
