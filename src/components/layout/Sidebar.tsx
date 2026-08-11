import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { HeaderLogo } from './HeaderLogo';
import { 
  LayoutDashboard, Building2, GraduationCap, Calendar, 
  Layers, Bookmark, Users2, UserCheck, ShieldCheck, 
  ChevronLeft, ChevronRight, User, BookOpen, Clock, FileText, FileCheck, CalendarDays,
  IndianRupee, FolderCheck, BarChart3, Settings, FileSignature, Award, MessageSquare, HelpCircle,
  Bell, Library, CheckSquare, Send, CalendarCheck, FileSpreadsheet
} from 'lucide-react';
import { UserRole } from '../../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  allowedRoles: UserRole[];
  category?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  mobileOpen = false,
  setMobileOpen
}) => {
  const { user, role } = useAuth();

  const allNavItems: Record<string, NavItem> = {
    'dashboard': { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT'], category: 'Main' },
    
    // Academic & Core
    'calendar': { id: 'calendar', label: 'Academic', icon: CalendarDays, allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT'], category: 'Academic' },
    'attendance': { id: 'attendance', label: 'Attendance', icon: UserCheck, allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT'], category: 'Academic' },
    'subjects': { id: 'subjects', label: 'Subjects', icon: BookOpen, allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT'], category: 'Academic' },
    'timetable': { id: 'timetable', label: 'Timetable', icon: Clock, allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT'], category: 'Academic' },
    'session-plan': { id: 'session-plan', label: 'Session Plan', icon: BookOpen, allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT'], category: 'Academic' },
    'materials': { id: 'materials', label: 'Study Material', icon: FileText, allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT'], category: 'Academic' },
    'assignments': { id: 'assignments', label: 'Assignments', icon: FileCheck, allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT'], category: 'Academic' },
    
    // Exam & Marks
    'exam-dashboard': { id: 'exam-dashboard', label: 'Examination', icon: BarChart3, allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT'], category: 'Examinations' },
    'exam-marks': { id: 'exam-marks', label: 'Marks', icon: FileSpreadsheet, allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'HOD', 'FACULTY'], category: 'Examinations' },

    // Finance & Documents
    'fees': { id: 'fees', label: 'Fees', icon: IndianRupee, allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'STUDENT'], category: 'Finance & Admin' },
    'crm': { id: 'crm', label: 'Documents', icon: FolderCheck, allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT'], category: 'Finance & Admin' },
    'certificates': { id: 'certificates', label: 'Certificates', icon: Award, allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'STUDENT'], category: 'Finance & Admin' },
    'requests': { id: 'requests', label: 'Requests', icon: CheckSquare, allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD'], category: 'Finance & Admin' },

    // Mentorship & Support
    'mentor': { id: 'mentor', label: 'Mentor', icon: UserCheck, allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT'], category: 'Support & Campus' },
    'tickets': { id: 'tickets', label: role === 'FACULTY' ? 'Student Queries' : 'Support Ticket', icon: HelpCircle, allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT'], category: 'Support & Campus' },
    'feedback': { id: 'feedback', label: 'Feedback', icon: MessageSquare, allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT'], category: 'Support & Campus' },

    // Campus Services
    'notices': { id: 'notices', label: 'Notices', icon: Bell, allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT'], category: 'Campus' },
    'events': { id: 'events', label: 'Events', icon: CalendarCheck, allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT'], category: 'Campus' },
    'library': { id: 'library', label: 'Library', icon: Library, allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT', 'LIBRARY_ADMIN'], category: 'Campus' },
    'notifications': { id: 'notifications', label: 'Notifications', icon: Bell, allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT', 'REGISTRAR', 'IQAC', 'EXAM_CELL', 'STUDENT_SECTION', 'HOSTEL_ADMIN', 'LIBRARY_ADMIN', 'TRANSPORT_ADMIN', 'MAINTENANCE_ADMIN'], category: 'Campus' },

    // Administration Offices Workspaces
    'registrar': { id: 'registrar', label: 'Registrar Office', icon: FileCheck, allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'REGISTRAR'], category: 'Administration' },
    'iqac': { id: 'iqac', label: 'IQAC Cell', icon: Award, allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'IQAC'], category: 'Administration' },
    'exam-cell': { id: 'exam-cell', label: 'Exam Controller', icon: ShieldCheck, allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'EXAM_CELL'], category: 'Administration' },
    'student-section': { id: 'student-section', label: 'Student Section', icon: FolderCheck, allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'STUDENT_SECTION'], category: 'Administration' },
    'hostel-admin': { id: 'hostel-admin', label: 'Hostel Office', icon: Building2, allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'HOSTEL_ADMIN'], category: 'Administration' },
    'library-admin': { id: 'library-admin', label: 'Library Office', icon: Library, allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'LIBRARY_ADMIN'], category: 'Administration' },
    'transport-admin': { id: 'transport-admin', label: 'Transport Fleet', icon: Clock, allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'TRANSPORT_ADMIN'], category: 'Administration' },
    'maintenance-admin': { id: 'maintenance-admin', label: 'Maintenance Office', icon: Settings, allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'MAINTENANCE_ADMIN'], category: 'Administration' },

    // Master Hierarchy & User Directory for Admin
    'students': { id: 'students', label: 'Students', icon: Users2, allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'REGISTRAR', 'STUDENT_SECTION'], category: 'Master' },
    'faculty': { id: 'faculty', label: 'Faculty', icon: UserCheck, allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'REGISTRAR', 'IQAC'], category: 'Master' },
    'departments': { id: 'departments', label: 'Departments', icon: Building2, allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'REGISTRAR'], category: 'Master' },
    'programs': { id: 'programs', label: 'Programs', icon: GraduationCap, allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'REGISTRAR'], category: 'Master' },
    'reports': { id: 'reports', label: 'Reports', icon: BarChart3, allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT', 'REGISTRAR', 'IQAC', 'EXAM_CELL'], category: 'System' },
    'settings': { id: 'settings', label: 'Settings', icon: Settings, allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN'], category: 'System' },
    'profile': { id: 'profile', label: 'My Profile', icon: User, allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT', 'REGISTRAR', 'IQAC', 'EXAM_CELL', 'STUDENT_SECTION', 'HOSTEL_ADMIN', 'LIBRARY_ADMIN', 'TRANSPORT_ADMIN', 'MAINTENANCE_ADMIN'], category: 'System' }
  };

  // Exact Structure Definitions per Prompt
  const studentOrderKeys = [
    'dashboard', 'calendar', 'attendance', 'subjects', 'timetable', 'materials',
    'assignments', 'exam-dashboard', 'fees', 'crm', 'certificates', 'mentor',
    'tickets', 'feedback', 'notices', 'events', 'library', 'notifications', 'profile'
  ];

  const facultyOrderKeys = [
    'dashboard', 'subjects', 'timetable', 'attendance', 'session-plan', 'materials',
    'assignments', 'exam-marks', 'exam-dashboard', 'tickets', 'mentor', 'feedback', 'profile'
  ];

  const adminOrderKeys = [
    'dashboard', 'registrar', 'iqac', 'exam-cell', 'student-section', 'hostel-admin', 'library-admin', 'transport-admin', 'maintenance-admin',
    'students', 'faculty', 'departments', 'programs', 'subjects',
    'calendar', 'attendance', 'exam-dashboard', 'fees', 'crm', 'certificates',
    'requests', 'tickets', 'feedback', 'notices', 'events', 'reports', 'settings', 'profile'
  ];

  let orderKeys = adminOrderKeys;
  if (role === 'STUDENT') {
    orderKeys = studentOrderKeys;
  } else if (role === 'FACULTY') {
    orderKeys = facultyOrderKeys;
  } else if (role === 'REGISTRAR') {
    orderKeys = ['dashboard', 'registrar', 'students', 'faculty', 'departments', 'programs', 'notices', 'reports', 'profile'];
  } else if (role === 'IQAC') {
    orderKeys = ['dashboard', 'iqac', 'faculty', 'feedback', 'reports', 'profile'];
  } else if (role === 'EXAM_CELL') {
    orderKeys = ['dashboard', 'exam-cell', 'exam-dashboard', 'students', 'reports', 'profile'];
  } else if (role === 'STUDENT_SECTION') {
    orderKeys = ['dashboard', 'student-section', 'students', 'certificates', 'notifications', 'profile'];
  } else if (role === 'HOSTEL_ADMIN') {
    orderKeys = ['dashboard', 'hostel-admin', 'students', 'tickets', 'notifications', 'profile'];
  } else if (role === 'LIBRARY_ADMIN') {
    orderKeys = ['dashboard', 'library-admin', 'library', 'students', 'profile'];
  } else if (role === 'TRANSPORT_ADMIN') {
    orderKeys = ['dashboard', 'transport-admin', 'students', 'profile'];
  } else if (role === 'MAINTENANCE_ADMIN') {
    orderKeys = ['dashboard', 'maintenance-admin', 'tickets', 'profile'];
  }

  const visibleItems: NavItem[] = orderKeys
    .map(key => allNavItems[key])
    .filter((item): item is NavItem => Boolean(item));

  const categories = Array.from(new Set(visibleItems.map(i => i.category || 'General')));

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    if (setMobileOpen) {
      setMobileOpen(false);
    }
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileOpen?.(false)}
        />
      )}
      <aside
        className={`sidebar-mobile-drawer ${mobileOpen ? 'mobile-open' : ''}`}
        style={{
          width: collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
          backgroundColor: 'var(--bg-sidebar)',
          color: 'var(--text-on-navy)',
          height: '100vh',
          maxHeight: '100vh',
          position: 'sticky',
          top: 0,
          alignSelf: 'flex-start',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width var(--transition-normal)',
          zIndex: 90,
          boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
          flexShrink: 0
        }}
      >
        <div
          style={{
            padding: collapsed ? '1.25rem 0.5rem' : '1.25rem 1.5rem',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: 'var(--topbar-height)'
          }}
        >
          <HeaderLogo collapsed={collapsed} />

          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              color: 'var(--brand-orange)',
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background var(--transition-fast)'
            }}
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: collapsed ? '1rem 0.5rem' : '1.25rem 1rem' }}>
          {categories.map(cat => {
            const itemsInCat = visibleItems.filter(i => (i.category || 'General') === cat);
            if (itemsInCat.length === 0) return null;

            return (
              <div key={cat} style={{ marginBottom: '1.5rem' }}>
                {!collapsed && cat !== 'Main' && (
                  <div
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '1.2px',
                      color: 'var(--brand-gold)',
                      marginBottom: '0.5rem',
                      paddingLeft: '0.75rem',
                      opacity: 0.9
                    }}
                  >
                    {cat}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {itemsInCat.map(item => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: collapsed ? '0.75rem' : '0.625rem 0.75rem',
                          justifyContent: collapsed ? 'center' : 'flex-start',
                        borderRadius: 'var(--radius-md)',
                        border: 'none',
                        background: isActive
                          ? 'linear-gradient(90deg, var(--brand-orange) 0%, #D95300 100%)'
                          : 'transparent',
                        color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.75)',
                        fontWeight: isActive ? 700 : 500,
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                        boxShadow: isActive ? '0 4px 12px rgba(243, 112, 35, 0.3)' : 'none'
                      }}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon size={18} style={{ color: isActive ? '#FFFFFF' : 'var(--brand-gold)' }} />
                      {!collapsed && <span>{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          padding: collapsed ? '1rem 0.5rem' : '1rem 1.25rem',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          backgroundColor: 'rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'var(--brand-orange)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.875rem'
          }}
        >
          {user?.name?.charAt(0) || 'U'}
        </div>

        {!collapsed && (
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name || 'User'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--brand-gold)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {role}
            </div>
          </div>
        )}
      </div>
    </aside>
  </>
  );
};
