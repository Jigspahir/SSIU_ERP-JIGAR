import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { HeaderLogo } from './HeaderLogo';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Bell, Dot, LogOut } from 'lucide-react';
import { 
  getRoleNavigationItems, NavItemConfig, 
  STUDENT_NAVIGATION_STRUCTURE, FACULTY_NAVIGATION_STRUCTURE, MENTOR_NAVIGATION_STRUCTURE, HOD_NAVIGATION_STRUCTURE, PRINCIPAL_NAVIGATION_STRUCTURE, STUDENT_SECTION_NAVIGATION_STRUCTURE, REGISTRAR_NAVIGATION_STRUCTURE, DEPUTY_REGISTRAR_NAVIGATION_STRUCTURE, StudentNavGroup, StudentNavSubItem 
} from '../../constants/navigationConfig';
import { mentorAssignmentService } from '../../services/mentorAssignmentService';
import { db } from '../../services/db';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  mobileOpen = false,
  setMobileOpen
}) => {
  const { user, role, logout } = useAuth();
  const isStudent = role === 'STUDENT';
  const isFaculty = role === 'FACULTY';
  const isHOD = role === 'HOD';
  const isPrincipal = role === 'PRINCIPAL';
  const isStudentSection = role === 'STUDENT_SECTION';
  const isRegistrar = role === 'REGISTRAR';
  const isDeputyRegistrar = role === 'DEPUTY_REGISTRAR';

  // Check if faculty is currently assigned as a mentor
  const isMentor = React.useMemo(() => {
    if (!isFaculty || !user) return false;
    const assignments = mentorAssignmentService.getAssignments({}, user);
    return Boolean((assignments.students && assignments.students.length > 0) || (user as any).isMentor);
  }, [isFaculty, user]);

  const [mentorMode, setMentorMode] = useState(false);

  // Auto-switch to mentor mode when activeTab is mentor-specific
  useEffect(() => {
    if (isMentor && (activeTab.startsWith('mentee-') || activeTab === 'mentor-profile')) {
      setMentorMode(true);
    }
  }, [activeTab, isMentor]);

  // State to manage expanded parent accordion items for all portals
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    'profile-group': false,
    'university-group': true,
    'institute-group': true,
    'department-group': true,
    'academic-group': true,
    'academics-group': true,
    'attendance-group': true,
    'students-group': true,
    'faculty-group': true,
    'examination-group': false,
    'records-group': false,
    'requests-group': true,
    'approvals-group': true,
    'notices-group': false,
    'documents-group': false,
    'feedback-group': false,
    'reports-group': false,
    'mentees-group': true,
    'services-group': true,
    'fees-group': false,
    'idcard-group': false,
    'academic-records-group': false,
    academic: true,
    attendance: true,
    examination: false,
    students: false,
    fees: false,
    'student-section': false,
    requests: false,
    documents: false,
    feedback: false
  });

  // Auto-expand active parent group whenever activeTab changes
  useEffect(() => {
    const navStructure = isStudent 
      ? STUDENT_NAVIGATION_STRUCTURE 
      : (isRegistrar
          ? REGISTRAR_NAVIGATION_STRUCTURE
          : (isDeputyRegistrar
              ? DEPUTY_REGISTRAR_NAVIGATION_STRUCTURE
              : (isStudentSection
                  ? STUDENT_SECTION_NAVIGATION_STRUCTURE
                  : (isPrincipal
                      ? PRINCIPAL_NAVIGATION_STRUCTURE
                      : (isHOD
                          ? HOD_NAVIGATION_STRUCTURE
                          : (isFaculty ? (mentorMode ? MENTOR_NAVIGATION_STRUCTURE : FACULTY_NAVIGATION_STRUCTURE) : null))))));
    if (navStructure) {
      navStructure.forEach(group => {
        if (group.children) {
          const isChildActive = group.children.some(
            sub => sub.targetTab === activeTab || sub.id === activeTab
          );
          if (isChildActive) {
            setOpenGroups(prev => ({ ...prev, [group.id]: true }));
          }
        }
      });
    }
  }, [activeTab, isStudent, isFaculty, isHOD, isPrincipal, isStudentSection, isRegistrar, isDeputyRegistrar, mentorMode]);

  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const canAccessPending = db.hasPendingWithMeAccess(user, role);
  const canCreateNotesheet = db.hasNoteSheetPermission(user, role, 'NOTESHEET_CREATE');
  const canViewNotesheet = db.hasNoteSheetPermission(user, role, 'NOTESHEET_VIEW');

  const visibleItems: NavItemConfig[] = getRoleNavigationItems(role).filter(i => {
    if (i.id === 'notesheet-pending') return canAccessPending;
    if (i.id === 'notesheet-create') return canCreateNotesheet;
    if (i.id.startsWith('notesheet-')) return canViewNotesheet;
    return true;
  });
  const categories = Array.from(new Set(visibleItems.map(i => i.category || 'General')));

  const handleNavClick = (id: string) => {
    if (id === 'logout') {
      logout();
      return;
    }
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
        {/* Sidebar Header & Toggle */}
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
              transition: 'all var(--transition-fast)'
            }}
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {!collapsed && (
          <div style={{ margin: '0.6rem 1.25rem 0.2rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <div
              style={{
                padding: '0.35rem 0.75rem',
                backgroundColor: 'rgba(245,166,35,0.12)',
                border: '1px solid rgba(245,166,35,0.3)',
                borderRadius: 'var(--radius-full)',
                color: 'var(--brand-gold)',
                fontSize: '0.6875rem',
                fontWeight: 800,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem'
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#F5A623', boxShadow: '0 0 6px #F5A623' }}></span>
              <span>⚡ {isStudent ? 'STUDENT PORTAL' : (isRegistrar ? 'REGISTRAR OFFICE PORTAL' : (isDeputyRegistrar ? 'DEPUTY REGISTRAR PORTAL' : (isStudentSection ? 'STUDENT SECTION PORTAL' : (isPrincipal ? 'PRINCIPAL / HOI PORTAL' : (isHOD ? 'HOD PORTAL' : (isFaculty ? (mentorMode ? 'MENTOR PORTAL' : 'FACULTY PORTAL') : 'DEMO MODE ACTIVE'))))))}</span>
            </div>

            {isFaculty && isMentor && (
              <div style={{ display: 'flex', gap: '0.3rem' }}>
                <button
                  onClick={() => { setMentorMode(false); setActiveTab('dashboard'); }}
                  style={{
                    flex: 1,
                    padding: '0.25rem 0.4rem',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    borderRadius: '4px',
                    border: '1px solid ' + (!mentorMode ? 'var(--brand-orange)' : 'rgba(255,255,255,0.15)'),
                    backgroundColor: !mentorMode ? 'var(--brand-orange)' : 'rgba(255,255,255,0.05)',
                    color: !mentorMode ? '#FFFFFF' : 'rgba(255,255,255,0.6)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Faculty View
                </button>
                <button
                  onClick={() => { setMentorMode(true); setActiveTab('mentee-list'); }}
                  style={{
                    flex: 1,
                    padding: '0.25rem 0.4rem',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    borderRadius: '4px',
                    border: '1px solid ' + (mentorMode ? 'var(--brand-gold)' : 'rgba(255,255,255,0.15)'),
                    backgroundColor: mentorMode ? 'var(--brand-gold)' : 'rgba(255,255,255,0.05)',
                    color: mentorMode ? 'var(--brand-navy)' : 'rgba(255,255,255,0.6)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Mentor View
                </button>
              </div>
            )}
          </div>
        )}

        {/* Navigation Items Container */}
        <div style={{ flex: 1, overflowY: 'auto', padding: collapsed ? '1rem 0.5rem' : '1.25rem 0.85rem' }}>
          {(isStudent || isFaculty || isHOD || isPrincipal || isRegistrar || isDeputyRegistrar || isStudentSection) ? (
            /* ─────────────────────────────────────────────────────────────
               STRUCTURED MENU WITH ACCORDIONS (Student, Faculty, Mentor, HOD, Principal, Registrar & Section)
               ───────────────────────────────────────────────────────────── */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {(isStudent ? STUDENT_NAVIGATION_STRUCTURE : (isRegistrar ? REGISTRAR_NAVIGATION_STRUCTURE : (isDeputyRegistrar ? DEPUTY_REGISTRAR_NAVIGATION_STRUCTURE : (isStudentSection ? STUDENT_SECTION_NAVIGATION_STRUCTURE : (isPrincipal ? PRINCIPAL_NAVIGATION_STRUCTURE : (isHOD ? HOD_NAVIGATION_STRUCTURE : (mentorMode ? MENTOR_NAVIGATION_STRUCTURE : FACULTY_NAVIGATION_STRUCTURE))))))).map((rawGroup, idx) => {
                // If faculty and not mentor, filter out mentor-only items (e.g. pending-verification)
                let group = rawGroup;
                if (isFaculty && !isMentor && !mentorMode && group.children) {
                  group = {
                    ...group,
                    children: group.children.filter(c => c.targetTab !== 'pending-verification')
                  };
                }

                const Icon = group.icon;
                const hasChildren = group.children && group.children.length > 0;
                const isGroupExpanded = Boolean(openGroups[group.id]);
                
                // Group is active if activeTab is equal to defaultTab OR any child targetTab
                const isChildTabActive = hasChildren && group.children!.some(
                  sub => sub.targetTab === activeTab || sub.id === activeTab
                );
                const isDirectActive = activeTab === group.id || activeTab === group.defaultTab;
                const isParentActive = isChildTabActive || isDirectActive;

                if (!hasChildren) {
                  // Direct Top-Level Link
                  return (
                    <button
                      key={group.id}
                      onClick={() => handleNavClick(group.defaultTab)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: collapsed ? '0.75rem' : '0.625rem 0.75rem',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        borderRadius: 'var(--radius-md)',
                        border: 'none',
                        background: isParentActive
                          ? 'linear-gradient(90deg, var(--brand-orange) 0%, #D95300 100%)'
                          : 'transparent',
                        color: isParentActive ? '#FFFFFF' : 'rgba(255,255,255,0.8)',
                        fontWeight: isParentActive ? 700 : 500,
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                        boxShadow: isParentActive ? '0 4px 12px rgba(243, 112, 35, 0.3)' : 'none',
                        width: '100%',
                        textAlign: 'left'
                      }}
                      title={collapsed ? group.label : undefined}
                    >
                      <Icon size={18} style={{ color: isParentActive ? '#FFFFFF' : 'var(--brand-gold)', flexShrink: 0 }} />
                      {!collapsed && (
                        <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {group.label}
                        </span>
                      )}
                    </button>
                  );
                }

                // Accordion Parent Group with Sub-items
                return (
                  <div key={group.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                    <button
                      onClick={() => {
                        if (collapsed) {
                          setCollapsed(false);
                          setOpenGroups(prev => ({ ...prev, [group.id]: true }));
                        } else {
                          toggleGroup(group.id);
                        }
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: collapsed ? '0.75rem' : '0.625rem 0.75rem',
                        borderRadius: 'var(--radius-md)',
                        border: 'none',
                        background: isParentActive && !isGroupExpanded
                          ? 'rgba(243, 112, 35, 0.25)'
                          : isParentActive
                          ? 'rgba(255,255,255,0.06)'
                          : 'transparent',
                        color: isParentActive ? '#FFFFFF' : 'rgba(255,255,255,0.85)',
                        fontWeight: isParentActive ? 700 : 600,
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                        width: '100%'
                      }}
                      title={collapsed ? group.label : undefined}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                        <Icon size={18} style={{ color: isParentActive ? 'var(--brand-orange)' : 'var(--brand-gold)', flexShrink: 0 }} />
                        {!collapsed && (
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {group.label}
                          </span>
                        )}
                      </div>
                      {!collapsed && (
                        <span style={{ color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center' }}>
                          {isGroupExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                        </span>
                      )}
                    </button>

                    {/* Sub-items List */}
                    {!collapsed && isGroupExpanded && (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.15rem',
                        paddingLeft: '1.75rem',
                        borderLeft: '1px solid rgba(255,255,255,0.12)',
                        marginLeft: '1.25rem',
                        marginTop: '0.15rem',
                        marginBottom: '0.35rem'
                      }}>
                        {group.children!
                          .filter(sub => {
                            if (sub.id === 'notesheet-pending' || sub.targetTab === 'notesheet-pending') {
                              return canAccessPending;
                            }
                            if (sub.id === 'notesheet-create' || sub.targetTab === 'notesheet-create') {
                              return canCreateNotesheet;
                            }
                            if (sub.id.startsWith('notesheet-') || sub.targetTab.startsWith('notesheet-')) {
                              return canViewNotesheet;
                            }
                            return true;
                          })
                          .map(sub => {
                          const isSubActive = activeTab === sub.targetTab || activeTab === sub.id;

                          return (
                            <button
                              key={sub.id}
                              onClick={() => handleNavClick(sub.targetTab)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.45rem 0.65rem',
                                borderRadius: 'var(--radius-sm)',
                                border: 'none',
                                background: isSubActive
                                  ? 'linear-gradient(90deg, var(--brand-orange) 0%, #D95300 100%)'
                                  : 'transparent',
                                color: isSubActive ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
                                fontWeight: isSubActive ? 700 : 500,
                                fontSize: '0.8125rem',
                                cursor: 'pointer',
                                transition: 'all var(--transition-fast)',
                                textAlign: 'left',
                                boxShadow: isSubActive ? '0 2px 8px rgba(243, 112, 35, 0.3)' : 'none'
                              }}
                            >
                              <span style={{
                                width: '4px',
                                height: '4px',
                                borderRadius: '50%',
                                backgroundColor: isSubActive ? '#FFFFFF' : 'rgba(255,255,255,0.4)'
                              }}></span>
                              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {sub.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Logout Action in menu list */}
              <button
                onClick={() => logout()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: collapsed ? '0.75rem' : '0.625rem 0.75rem',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: 'transparent',
                  color: '#EF4444',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  width: '100%',
                  textAlign: 'left',
                  marginTop: '0.5rem'
                }}
                title={collapsed ? "Logout" : undefined}
              >
                <LogOut size={18} style={{ color: '#EF4444', flexShrink: 0 }} />
                {!collapsed && (
                  <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Logout
                  </span>
                )}
              </button>
            </div>
          ) : (
            /* ─────────────────────────────────────────────────────────────
               OTHER ROLES: STANDARD ROLE-ORDERED CATEGORY NAVIGATION
               ───────────────────────────────────────────────────────────── */
            categories.map(cat => {
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
            })
          )}
        </div>

        {/* Sidebar Footer User Info */}
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

          {!collapsed && (
            <button
              onClick={() => logout()}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.6)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
