import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { LoginPage } from './pages/auth/LoginPage';
import { Dashboard } from './pages/dashboard/Dashboard';
import { InstitutesPage } from './pages/master/InstitutesPage';
import { DepartmentsPage } from './pages/master/DepartmentsPage';
import { ProgramsPage } from './pages/master/ProgramsPage';
import { AcademicYearsPage } from './pages/master/AcademicYearsPage';
import { BatchesPage } from './pages/master/BatchesPage';
import { SemestersPage } from './pages/master/SemestersPage';
import { DivisionsPage } from './pages/master/DivisionsPage';
import { SubjectsPage } from './pages/master/SubjectsPage';
import { FacultyPage } from './pages/master/FacultyPage';
import { StudentsPage } from './pages/master/StudentsPage';
import { ProfilePage } from './pages/profile/ProfilePage';

// Academic Module Pages
import { AttendancePage } from './pages/academic/AttendancePage';
import { TimetablePage } from './pages/academic/TimetablePage';
import { SessionPlanPage } from './pages/academic/SessionPlanPage';
import { UnitMaterialPage } from './pages/academic/UnitMaterialPage';
import { AssignmentsPage } from './pages/academic/AssignmentsPage';
import { AcademicCalendarPage } from './pages/academic/AcademicCalendarPage';
import { FeedbackPage } from './pages/feedback/FeedbackPage';
import { SupportTicketsPage } from './pages/support/SupportTicketsPage';

// Campus & Support Pages
import { CertificatesPage } from './pages/campus/CertificatesPage';
import { MentorPage } from './pages/campus/MentorPage';
import { NoticesPage } from './pages/campus/NoticesPage';
import { EventsPage } from './pages/campus/EventsPage';
import { LibraryPage } from './pages/campus/LibraryPage';
import { NotificationsPage } from './pages/campus/NotificationsPage';
import { RequestsPage } from './pages/campus/RequestsPage';
import { EdpDutyPage } from './pages/campus/EdpDutyPage';

// Fees & Finance Module Page
import { FeesFinancePage } from './pages/finance/FeesFinancePage';
import { HRManagementPage } from './pages/hr/HRManagementPage';

// CRM & Admissions Module Page
import { CRMPage } from './pages/crm/CRMPage';

// Reports & Analytics Module Page
import { ReportsPage } from './pages/reports/ReportsPage';

// Administrative Offices Workspaces
import { RegistrarWorkspacePage } from './pages/admin-offices/RegistrarWorkspacePage';
import { IQACWorkspacePage } from './pages/admin-offices/IQACWorkspacePage';
import { ExamCellWorkspacePage } from './pages/admin-offices/ExamCellWorkspacePage';
import { StudentSectionWorkspacePage } from './pages/admin-offices/StudentSectionWorkspacePage';
import { HostelWorkspacePage } from './pages/admin-offices/HostelWorkspacePage';
import { LibraryWorkspacePage } from './pages/admin-offices/LibraryWorkspacePage';
import { TransportWorkspacePage } from './pages/admin-offices/TransportWorkspacePage';
import { MaintenanceWorkspacePage } from './pages/admin-offices/MaintenanceWorkspacePage';

// System Settings Module Page
import { SystemSettingsPage } from './pages/settings/SystemSettingsPage';

// Examination Management Module Pages
import { ExamDashboardPage } from './pages/exams/ExamDashboardPage';
import { ExamsListPage } from './pages/exams/ExamsListPage';
import { ExamSchedulePage } from './pages/exams/ExamSchedulePage';
import { ExamFormsPage } from './pages/exams/ExamFormsPage';
import { ExamFeesPage } from './pages/exams/ExamFeesPage';
import { HallTicketPage } from './pages/exams/HallTicketPage';
import { MarksManagementPage } from './pages/exams/MarksManagementPage';
import { ResultManagementPage } from './pages/exams/ResultManagementPage';
import { MarksheetPage } from './pages/exams/MarksheetPage';

import { WhatsNewModal } from './components/common/WhatsNewModal';
import { db } from './services/db';

import './styles/index.css';

const MainAppContent: React.FC = () => {
  const { user, role } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [showWhatsNew, setShowWhatsNew] = useState<boolean>(true);

  // If not logged in, enforce login page screen
  if (!user) {
    return <LoginPage />;
  }

  // Define allowed tabs per role
  const getIsTabAllowed = (tab: string) => {
    if (role === 'SUPER_ADMIN' || role === 'UNIVERSITY_ADMIN') return true;
    if (tab === 'dashboard' || tab === 'profile') return true;

    // Academic & Campus module tabs are accessible by all authenticated roles
    const academicTabs = [
      'attendance', 'timetable', 'session-plan', 'materials', 'assignments', 'calendar',
      'feedback', 'tickets', 'certificates', 'mentor', 'notices', 'events', 'library', 'notifications', 'requests'
    ];
    if (academicTabs.includes(tab)) return true;

    // Fees & Finance tab is accessible by Admin and Student, but restricted for Faculty
    if (tab === 'fees' || tab === 'crm' || tab === 'reports') {
      return true;
    }

    // Examination Management tabs
    const examTabs = ['exam-dashboard', 'exams', 'exam-forms', 'exam-fees', 'exam-schedule', 'exam-hallticket', 'exam-marks', 'exam-results', 'exam-marksheet'];
    if (examTabs.includes(tab)) return true;

    if (role === 'PRINCIPAL') {
      return ['departments', 'programs', 'academic-years', 'batches', 'semesters', 'divisions', 'subjects', 'faculty', 'students'].includes(tab);
    }
    if (role === 'HOD') {
      return ['programs', 'batches', 'semesters', 'divisions', 'subjects', 'faculty', 'students'].includes(tab);
    }
    if (role === 'FACULTY') {
      return ['divisions', 'subjects', 'students', 'faculty'].includes(tab);
    }
    if (role === 'REGISTRAR') {
      return ['registrar', 'students', 'faculty', 'departments', 'programs', 'notices', 'reports'].includes(tab);
    }
    if (role === 'IQAC') {
      return ['iqac', 'faculty', 'feedback', 'reports'].includes(tab);
    }
    if (role === 'EXAM_CELL') {
      return ['exam-cell', 'exam-dashboard', 'exams', 'exam-forms', 'exam-schedule', 'exam-hallticket', 'exam-marks', 'exam-results', 'exam-marksheet', 'students', 'reports'].includes(tab);
    }
    if (role === 'STUDENT_SECTION') {
      return ['student-section', 'students', 'certificates', 'notifications'].includes(tab);
    }
    if (role === 'HOSTEL_ADMIN') {
      return ['hostel-admin', 'students', 'tickets', 'notifications'].includes(tab);
    }
    if (role === 'LIBRARY_ADMIN') {
      return ['library-admin', 'library', 'students'].includes(tab);
    }
    if (role === 'TRANSPORT_ADMIN') {
      return ['transport-admin', 'students'].includes(tab);
    }
    if (role === 'MAINTENANCE_ADMIN') {
      return ['maintenance-admin', 'tickets'].includes(tab);
    }
    return false;
  };

  const renderActivePage = () => {
    // Route guard check: fallback to dashboard if tab is unauthorized for active role
    const currentTab = getIsTabAllowed(activeTab) ? activeTab : 'dashboard';

    switch (currentTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'fees':
        return <FeesFinancePage />;
      case 'hr':
        return <HRManagementPage />;
      case 'crm':
        return <CRMPage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SystemSettingsPage />;
      case 'attendance':
        return <AttendancePage />;
      case 'timetable':
        return <TimetablePage />;
      case 'session-plan':
        return <SessionPlanPage />;
      case 'materials':
        return <UnitMaterialPage />;
      case 'assignments':
        return <AssignmentsPage />;
      case 'calendar':
        return <AcademicCalendarPage />;
      case 'feedback':
        return <FeedbackPage />;
      case 'tickets':
        return <SupportTicketsPage />;
      case 'certificates':
        return <CertificatesPage />;
      case 'mentor':
        return <MentorPage />;
      case 'notices':
        return <NoticesPage />;
      case 'events':
        return <EventsPage />;
      case 'library':
        return <LibraryPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'requests':
        return <RequestsPage />;
      case 'edp-duties':
        return <EdpDutyPage />;
      case 'exam-dashboard':
        return <ExamDashboardPage setActiveTab={setActiveTab} />;
      case 'exams':
        return <ExamsListPage />;
      case 'exam-schedule':
        return <ExamSchedulePage />;
      case 'exam-forms':
        return <ExamFormsPage />;
      case 'exam-fees':
        return <ExamFeesPage />;
      case 'exam-hallticket':
        return <HallTicketPage />;
      case 'exam-marks':
        return <MarksManagementPage />;
      case 'exam-results':
        return <ResultManagementPage />;
      case 'exam-marksheet':
        return <MarksheetPage />;
      case 'registrar':
        return <RegistrarWorkspacePage />;
      case 'iqac':
        return <IQACWorkspacePage />;
      case 'exam-cell':
        return <ExamCellWorkspacePage />;
      case 'student-section':
        return <StudentSectionWorkspacePage />;
      case 'hostel-admin':
        return <HostelWorkspacePage />;
      case 'library-admin':
        return <LibraryWorkspacePage />;
      case 'transport-admin':
        return <TransportWorkspacePage />;
      case 'maintenance-admin':
        return <MaintenanceWorkspacePage />;
      case 'institutes':
        return <InstitutesPage />;
      case 'departments':
        return <DepartmentsPage />;
      case 'programs':
        return <ProgramsPage />;
      case 'academic-years':
        return <AcademicYearsPage />;
      case 'batches':
        return <BatchesPage />;
      case 'semesters':
        return <SemestersPage />;
      case 'divisions':
        return <DivisionsPage />;
      case 'subjects':
        return <SubjectsPage />;
      case 'faculty':
        return <FacultyPage />;
      case 'students':
        return <StudentsPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  const unreadNotifs = user ? db.getNotifications(user, role).filter(n => !(n.isReadByUsers || []).includes(user.id)) : [];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      {showWhatsNew && unreadNotifs.length > 0 && (
        <WhatsNewModal
          notifications={unreadNotifs}
          onClose={() => setShowWhatsNew(false)}
          onNavigateTab={setActiveTab}
        />
      )}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: '100vh' }}>
        <Topbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />
        <main style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}

export default App;
