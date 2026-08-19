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
import { StudentDirectorySearchPage } from './pages/students/StudentDirectorySearchPage';
import { DocumentMasterPage } from './pages/master/DocumentMasterPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { DigitalIdCardPage } from './pages/profile/DigitalIdCardPage';

// Academic Module Pages
import { AttendancePage } from './pages/academic/AttendancePage';
import { TimetablePage } from './pages/academic/TimetablePage';
import { SessionPlanPage } from './pages/academic/SessionPlanPage';
import { UnitMaterialPage } from './pages/academic/UnitMaterialPage';
import { AssignmentsPage } from './pages/academic/AssignmentsPage';
import { AcademicCalendarPage } from './pages/academic/AcademicCalendarPage';
import { QuizPage } from './pages/academic/QuizPage';
import { FeedbackPage } from './pages/feedback/FeedbackPage';
import { AdminFeedbackDashboardPage } from './pages/feedback/AdminFeedbackDashboardPage';
import { SupportTicketsPage } from './pages/support/SupportTicketsPage';

// Campus & Support Pages
import { CertificatesPage } from './pages/campus/CertificatesPage';
import { StudentSectionPage } from './pages/campus/StudentSectionPage';
import { StudentHostelPage } from './pages/campus/StudentHostelPage';
import { StudentTransportPage } from './pages/campus/StudentTransportPage';
import { MentorPage } from './pages/campus/MentorPage';
import { HODWorkspacePage } from './pages/campus/HODWorkspacePage';
import { HOIWorkspacePage } from './pages/campus/HOIWorkspacePage';
import { NoticesPage } from './pages/campus/NoticesPage';
import { EventsPage } from './pages/campus/EventsPage';
import { LibraryPage } from './pages/campus/LibraryPage';
import { NotificationsPage } from './pages/campus/NotificationsPage';
import { RequestsPage } from './pages/campus/RequestsPage';
import { EdpDutyPage } from './pages/campus/EdpDutyPage';
import { IncubationPage } from './pages/incubation/IncubationPage';

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
import { AccountsWorkspacePage } from './pages/admin-offices/AccountsWorkspacePage';

// System Settings Module Page
import { SystemSettingsPage } from './pages/settings/SystemSettingsPage';
import { SecurityAuditCenterPage } from './pages/admin-offices/SecurityAuditCenterPage';
import { NoteSheetPage } from './pages/admin-offices/NoteSheetPage';
import { NoteSheetVerificationPage } from './pages/public/NoteSheetVerificationPage';
import { InwardOutwardRegisterPage } from './pages/admin-offices/InwardOutwardRegisterPage';
import { WorkDiaryPage } from './pages/campus/WorkDiaryPage';
import { InventoryAssetPage } from './pages/campus/InventoryAssetPage';
import { BulkImportPage } from './pages/admin/BulkImportPage';

// Examination Management Module Pages
import { ExamDashboardPage } from './pages/exams/ExamDashboardPage';
import { ExamsListPage } from './pages/exams/ExamsListPage';
import { ExamSchedulePage } from './pages/exams/ExamSchedulePage';
import { ExamFormsPage } from './pages/exams/ExamFormsPage';
import { ExamEligibilityPage } from './pages/examinations/ExamEligibilityPage';
import { ExamFeesPage } from './pages/exams/ExamFeesPage';
import { StudentExamFeesPage } from './pages/exams/StudentExamFeesPage';
import { BacklogReExamPage } from './pages/exams/BacklogReExamPage';
import { ReassessmentRecheckingPage } from './pages/exams/ReassessmentRecheckingPage';
import { HallTicketPage } from './pages/exams/HallTicketPage';
import { MarksManagementPage } from './pages/exams/MarksManagementPage';
import { ResultManagementPage } from './pages/exams/ResultManagementPage';
import { MarksheetPage } from './pages/exams/MarksheetPage';
import { ExamCentresPage } from './pages/exams/ExamCentresPage';
import { SeatingArrangementPage } from './pages/exams/SeatingArrangementPage';
import { ExamEdpDutyPage } from './pages/exams/ExamEdpDutyPage';
import { ExamDayControlPage } from './pages/exams/ExamDayControlPage';

import { WhatsNewModal } from './components/common/WhatsNewModal';
import { db } from './services/db';
import { isTabPermittedForRole } from './constants/navigationConfig';

import './styles/index.css';

const MainAppContent: React.FC = () => {
  const { user, role } = useAuth();
  const [activeTab, setActiveTabState] = useState<string>(() => {
    if (typeof window !== 'undefined' && window.location.pathname === '/deputy-registrar/dashboard') {
      return 'dashboard';
    }
    return 'dashboard';
  });
  const [tabParams, setTabParams] = useState<Record<string, any> | null>(null);

  const setActiveTab = (tab: string, params?: any) => {
    if (params) {
      setTabParams(params);
    } else {
      setTabParams(null);
    }
    setActiveTabState(tab);
  };
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [showWhatsNew, setShowWhatsNew] = useState<boolean>(true);

  // Sync /deputy-registrar/dashboard URL route
  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname === '/deputy-registrar/dashboard') {
      setActiveTab('dashboard');
    }
  }, [role]);

  // If not logged in, enforce login page screen
  if (!user) {
    return <LoginPage />;
  }

  // Define allowed tabs per role using centralized navigationConfig single source of truth
  const getIsTabAllowed = (tab: string) => {
    return isTabPermittedForRole(tab, role);
  };

  const renderActivePage = () => {
    // Route guard check: fallback to dashboard if tab is unauthorized for active role
    const currentTab = getIsTabAllowed(activeTab) ? activeTab : 'dashboard';

    switch (currentTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;

      // ─── 2. Academic Section ───
      case 'academic':
      case 'subjects':
      case 'academic-subjects':
      case 'faculty-subjects':
        return <SubjectsPage />;
      case 'attendance':
      case 'academic-attendance':
      case 'faculty-mark-attendance':
        return <AttendancePage initialTab="ATTENDANCE" />;
      case 'attendance-history':
      case 'faculty-attendance-history':
        return <AttendancePage initialTab="HISTORY" />;
      case 'subject-attendance':
      case 'faculty-subject-attendance':
        return <AttendancePage initialTab="SUBJECT_STATS" />;
      case 'attendance-reports':
      case 'faculty-attendance-reports':
        return <AttendancePage initialTab="REPORTS" />;
      case 'attendance-applications':
      case 'faculty-attendance-apps':
        return <AttendancePage initialTab="APPLICATIONS" />;
      case 'materials':
      case 'academic-materials':
      case 'faculty-materials':
        return <UnitMaterialPage />;
      case 'assignments':
      case 'academic-assignments':
      case 'faculty-assignments':
        return <AssignmentsPage />;
      case 'timetable':
      case 'academic-timetable':
      case 'faculty-timetable':
        return <TimetablePage />;
      case 'quiz':
      case 'academic-quiz':
      case 'faculty-quiz':
        return <QuizPage />;
      case 'session-plan':
      case 'faculty-session-plan':
        return <SessionPlanPage />;
      case 'calendar':
      case 'faculty-calendar':
        return <AcademicCalendarPage />;

      // ─── 3. Examination Section ───
      case 'examination':
      case 'exam-dashboard':
      case 'faculty-exam-info':
        return <ExamDashboardPage setActiveTab={setActiveTab} />;
      case 'exam-duties':
      case 'faculty-exam-duties':
        return <ExamEdpDutyPage initialRecordId={tabParams?.recordId} />;
      case 'exam-eligibility':
        return <ExamEligibilityPage />;
      case 'exam-forms':
        return <ExamFormsPage />;
      // Student-facing exam fees (all categories: regular, backlog, reassessment, etc.)
      case 'exam-fees-student':
        return <StudentExamFeesPage />;
      // Backlog / Re-Exam application page
      case 'exam-backlog':
        return <BacklogReExamPage />;
      // Reassessment / Rechecking application page
      case 'exam-reassessment':
        return <ReassessmentRecheckingPage />;
      // Admin/Controller exam fee configuration
      case 'exam-fees':
        return <ExamFeesPage />;
      case 'exam-hallticket':
        return <HallTicketPage />;
      case 'exam-results':
        return <ResultManagementPage />;
      case 'exams':
        return <ExamsListPage />;
      case 'exam-schedule':
      case 'faculty-exam-schedule':
        return <ExamSchedulePage />;
      case 'exam-marks':
        return <MarksManagementPage />;
      case 'exam-marksheet':
        return <MarksheetPage />;
      case 'exam-centres':
        return <ExamCentresPage />;
      case 'exam-seating':
        return <SeatingArrangementPage />;
      case 'exam-edp-duty':
        return <ExamEdpDutyPage initialRecordId={tabParams?.recordId} />;
      case 'exam-day-control':
        return <ExamDayControlPage />;

      // ─── 3B. Students Section (Faculty & Mentor & Staff) ───
      case 'my-students':
      case 'faculty-my-students':
      case 'mentee-list':
        return <MentorPage initialTab="MY_STUDENTS" />;
      case 'mentee-profile':
        return <MentorPage initialTab="STUDENT_PROFILE" />;
      case 'mentee-academic-overview':
        return <MentorPage initialTab="ACADEMIC_OVERVIEW" />;
      case 'mentee-academic-performance':
      case 'mentee-academic-progress':
        return <MentorPage initialTab="ACADEMIC_PERFORMANCE" />;
      case 'mentee-subjects':
        return <MentorPage initialTab="STUDENT_SUBJECTS" />;
      case 'mentee-timetable':
        return <MentorPage initialTab="TIMETABLE" />;
      case 'mentee-assignments':
        return <MentorPage initialTab="ASSIGNMENTS" />;
      case 'mentee-attendance':
      case 'mentee-attendance-overview':
        return <MentorPage initialTab="ATTENDANCE" />;
      case 'mentee-attendance-shortage':
        return <MentorPage initialTab="ATTENDANCE_SHORTAGE" />;
      case 'mentee-attendance-applications':
      case 'mentee-exam-attendance-approvals':
        return <MentorPage initialTab="ATTENDANCE_APPROVALS" />;
      case 'mentee-exam-eligibility':
        return <MentorPage initialTab="EXAM_ELIGIBILITY" />;
      case 'mentee-exam-requests':
        return <MentorPage initialTab="EXAM_REQUESTS" />;
      case 'mentee-docs-pending':
        return <MentorPage initialTab="PENDING_VERIFICATION" />;
      case 'mentee-docs-verified':
        return <MentorPage initialTab="VERIFIED_DOCUMENTS" />;
      case 'mentee-docs-history':
        return <MentorPage initialTab="DOCUMENT_HISTORY" />;
      case 'mentee-requests-pending':
      case 'mentee-requests-assigned':
      case 'mentee-requests-history':
        return <RequestsPage initialCategory="ALL" />;
      case 'mentor-profile':
        return <ProfilePage />;
      case 'student-academics':
      case 'faculty-student-academics':
        return <MentorPage initialTab="STUDENT_ACADEMICS" />;
      case 'student-requests':
      case 'faculty-student-requests':
        return <RequestsPage initialCategory="ALL" />;

      // ─── 3C. HOD Portal Routes ───
      case 'hod-profile':
        return <ProfilePage />;
      case 'hod-dept-overview':
        return <HODWorkspacePage initialTab="OVERVIEW" />;
      case 'hod-dept-students':
      case 'hod-students-list':
      case 'hod-students-profile':
      case 'hod-students-performance':
        return <HODWorkspacePage initialTab="STUDENTS" />;
      case 'hod-students-at-risk':
        return <HODWorkspacePage initialTab="AT_RISK" />;
      case 'hod-dept-faculty':
      case 'hod-faculty-list':
      case 'hod-faculty-workload':
      case 'hod-faculty-performance':
        return <HODWorkspacePage initialTab="FACULTY" />;
      case 'hod-faculty-allocation':
      case 'hod-faculty-subject-allocation':
        return <HODWorkspacePage initialTab="FACULTY" />;
      case 'hod-dept-programs':
        return <ProgramsPage />;
      case 'hod-dept-semesters':
        return <SemestersPage />;
      case 'hod-dept-sections':
        return <DivisionsPage />;
      case 'hod-academic-subjects':
        return <SubjectsPage />;
      case 'hod-timetable':
        return <TimetablePage />;
      case 'hod-session-plans':
        return <SessionPlanPage />;
      case 'hod-materials':
        return <UnitMaterialPage />;
      case 'hod-assignments':
        return <AssignmentsPage />;
      case 'hod-quiz':
        return <QuizPage />;
      case 'hod-calendar':
        return <AcademicCalendarPage />;
      case 'hod-attendance-overview':
      case 'hod-subject-attendance':
        return <HODWorkspacePage initialTab="ATTENDANCE" />;
      case 'hod-attendance-shortage':
        return <HODWorkspacePage initialTab="ATTENDANCE_SHORTAGE" />;
      case 'hod-attendance-approvals':
      case 'hod-exam-attendance-approvals':
        return <HODWorkspacePage initialTab="ATTENDANCE_APPROVALS" />;
      case 'hod-exam-eligibility':
      case 'hod-exam-info':
        return <HODWorkspacePage initialTab="EXAMINATION" />;
      case 'hod-exam-requests':
      case 'hod-requests-pending':
      case 'hod-requests-dept':
      case 'hod-requests-escalated':
      case 'hod-requests-history':
        return <HODWorkspacePage initialTab="REQUESTS" />;
      case 'hod-docs-students':
      case 'hod-docs-overview':
      case 'hod-students-documents':
        return <DocumentMasterPage />;
      case 'hod-feedback-faculty':
      case 'hod-feedback-student':
        return <AdminFeedbackDashboardPage />;
      case 'hod-feedback-department':
        return <HODWorkspacePage initialTab="FEEDBACK" />;
      case 'hod-reports-academic':
      case 'hod-reports-attendance':
      case 'hod-reports-student':
      case 'hod-reports-faculty':
      case 'hod-reports-department':
        return <HODWorkspacePage initialTab="REPORTS" />;

      // ─── 3D. Principal / HOI Portal Routes ───
      case 'hoi-profile':
        return <ProfilePage />;
      case 'hoi-inst-overview':
      case 'hoi-academic-overview':
      case 'hoi-attendance-comparison':
        return <HOIWorkspacePage initialTab="OVERVIEW" />;
      case 'hoi-inst-departments':
        return <HOIWorkspacePage initialTab="DEPARTMENTS" />;
      case 'hoi-inst-hods':
        return <HOIWorkspacePage initialTab="HODS" />;
      case 'hoi-inst-programs':
      case 'hoi-academic-programs':
        return <ProgramsPage />;
      case 'hoi-inst-sections':
        return <DivisionsPage />;
      case 'hoi-academic-subjects':
        return <SubjectsPage />;
      case 'hoi-academic-allocation':
      case 'hoi-faculty-allocation':
        return <HOIWorkspacePage initialTab="FACULTY" />;
      case 'hoi-timetable':
        return <TimetablePage />;
      case 'hoi-session-plans':
        return <SessionPlanPage />;
      case 'hoi-calendar':
        return <AcademicCalendarPage />;
      case 'hoi-academic-performance':
      case 'hoi-inst-students':
      case 'hoi-students-list':
      case 'hoi-students-profile':
      case 'hoi-students-performance':
        return <HOIWorkspacePage initialTab="STUDENTS" />;
      case 'hoi-students-at-risk':
        return <HOIWorkspacePage initialTab="AT_RISK" />;
      case 'hoi-inst-faculty':
      case 'hoi-faculty-list':
      case 'hoi-faculty-attendance':
      case 'hoi-faculty-performance':
        return <HOIWorkspacePage initialTab="FACULTY" />;
      case 'hoi-faculty-workload':
        return <HOIWorkspacePage initialTab="FACULTY_WORKLOAD" />;
      case 'hoi-attendance-institute':
      case 'hoi-students-attendance':
        return <HOIWorkspacePage initialTab="ATTENDANCE" />;
      case 'hoi-attendance-shortage':
        return <HOIWorkspacePage initialTab="ATTENDANCE_SHORTAGE" />;
      case 'hoi-attendance-approvals':
      case 'hoi-exam-attendance-approvals':
        return <HOIWorkspacePage initialTab="ATTENDANCE_APPROVALS" />;
      case 'hoi-exam-eligibility':
        return <HOIWorkspacePage initialTab="EXAMINATION" />;
      case 'hoi-exam-info':
        return <ExamSchedulePage />;
      case 'hoi-exam-reports':
      case 'hoi-reports-academic':
      case 'hoi-reports-student':
      case 'hoi-reports-faculty':
      case 'hoi-reports-attendance':
      case 'hoi-reports-examination':
      case 'hoi-reports-institute':
        return <HOIWorkspacePage initialTab="REPORTS" />;
      case 'hoi-requests-pending':
      case 'hoi-requests-dept':
      case 'hoi-requests-escalated':
      case 'hoi-requests-history':
        return <HOIWorkspacePage initialTab="REQUESTS" />;
      case 'hoi-docs-students':
      case 'hoi-docs-overview':
      case 'hoi-students-documents':
        return <DocumentMasterPage />;
      case 'hoi-feedback-student':
      case 'hoi-feedback-faculty':
        return <AdminFeedbackDashboardPage />;
      case 'hoi-feedback-department':
      case 'hoi-feedback-institute':
        return <HOIWorkspacePage initialTab="FEEDBACK" />;

      // ─── 4. Fees & Payments Section ───
      case 'fees':
      case 'fees-semester':
        return <FeesFinancePage initialStudentTab="MY_FEES" initialRecordId={tabParams?.recordId} />;
      case 'fees-history':
      case 'fees-receipts':
        return <FeesFinancePage initialStudentTab="PAYMENT_HISTORY" initialRecordId={tabParams?.recordId} />;
      case 'fees-query':
        return <FeesFinancePage initialStudentTab="FEE_QUERIES" initialRecordId={tabParams?.recordId} />;

      // ─── 5. Student Section ───
      case 'section-profile':
        return <ProfilePage />;
      case 'student-section':
      case 'certificates':
      case 'student-section-services':
        return role === 'STUDENT' ? <StudentSectionPage initialTab="SERVICES" /> : <StudentSectionWorkspacePage initialTab="SERVICES" />;
      case 'student-section-requests':
        return role === 'STUDENT' ? <StudentSectionPage initialTab="MY_REQUESTS" /> : <StudentSectionWorkspacePage initialTab="SERVICES" />;
      case 'student-section-documents':
        return role === 'STUDENT' ? <StudentSectionPage initialTab="MY_DOCUMENTS" /> : <StudentSectionWorkspacePage initialTab="DOCUMENTS" />;
      case 'section-students-list':
      case 'section-students-profile':
      case 'section-students-status':
        return <StudentSectionWorkspacePage initialTab="STUDENTS" />;
      case 'section-students-academic':
        return <StudentSectionWorkspacePage initialTab="ACADEMIC_RECORDS" />;
      case 'section-students-docs':
      case 'section-docs-verification':
      case 'section-docs-pending':
      case 'section-docs-verified':
      case 'section-docs-reupload':
      case 'section-docs-locked':
        return <StudentSectionWorkspacePage initialTab="DOCUMENTS" />;
      case 'section-docs-master':
        return <DocumentMasterPage />;
      case 'section-service-bonafide':
        return <StudentSectionWorkspacePage initialTab="SERVICES" initialServiceCategory="BONAFIDE" />;
      case 'section-service-transcript':
        return <StudentSectionWorkspacePage initialTab="SERVICES" initialServiceCategory="TRANSCRIPT" />;
      case 'section-service-degree':
        return <StudentSectionWorkspacePage initialTab="SERVICES" initialServiceCategory="DEGREE" />;
      case 'section-service-migration':
        return <StudentSectionWorkspacePage initialTab="SERVICES" initialServiceCategory="MIGRATION" />;
      case 'section-service-transfer':
        return <StudentSectionWorkspacePage initialTab="SERVICES" initialServiceCategory="TRANSFER" />;
      case 'section-service-character':
      case 'section-service-other':
        return <StudentSectionWorkspacePage initialTab="SERVICES" initialServiceCategory="ALL" />;
      case 'section-service-idcard':
      case 'section-id-generate':
      case 'section-id-replacement':
      case 'section-id-active':
      case 'section-id-blocked':
      case 'section-id-replaced':
      case 'section-id-verify':
        return <StudentSectionWorkspacePage initialTab="IDCARD" />;
      case 'section-service-duplicate-id':
        return <StudentSectionWorkspacePage initialTab="SERVICES" initialServiceCategory="IDCARD" />;
      case 'section-requests-pending':
      case 'section-requests-assigned':
      case 'section-requests-dept':
      case 'section-requests-escalated':
      case 'section-requests-history':
        return <StudentSectionWorkspacePage initialTab="REQUESTS" />;
      case 'section-fees-config':
      case 'section-fees-pending':
      case 'section-fees-history':
      case 'section-fees-receipts':
      case 'section-fees-refunds':
        return <StudentSectionWorkspacePage initialTab="FEES" />;
      case 'section-academic-records':
      case 'section-academic-semesters':
      case 'section-academic-results':
      case 'section-academic-transcripts':
      case 'section-academic-completion':
        return <StudentSectionWorkspacePage initialTab="ACADEMIC_RECORDS" />;
      case 'section-reports-student':
      case 'section-reports-docs':
      case 'section-reports-service':
      case 'section-reports-requests':
      case 'section-reports-payments':
        return <StudentSectionWorkspacePage initialTab="REPORTS" />;

      // ─── 5D. Registrar University Governance Routes ───
      case 'reg-profile':
        return <ProfilePage />;
      case 'reg-uni-overview':
        return <RegistrarWorkspacePage initialTab="UNIVERSITY" initialSubFilter="OVERVIEW" />;
      case 'reg-uni-institutes':
        return <RegistrarWorkspacePage initialTab="UNIVERSITY" initialSubFilter="INSTITUTES" />;
      case 'reg-uni-departments':
        return <RegistrarWorkspacePage initialTab="UNIVERSITY" initialSubFilter="DEPARTMENTS" />;
      case 'reg-uni-programs':
        return <RegistrarWorkspacePage initialTab="UNIVERSITY" initialSubFilter="PROGRAMS" />;
      case 'reg-uni-structure':
        return <RegistrarWorkspacePage initialTab="UNIVERSITY" initialSubFilter="STRUCTURE" />;
      case 'reg-academic-year':
        return <RegistrarWorkspacePage initialTab="ACADEMICS" initialSubFilter="YEAR" />;
      case 'reg-academic-semesters':
        return <RegistrarWorkspacePage initialTab="ACADEMICS" initialSubFilter="SEMESTERS" />;
      case 'reg-academic-calendar':
        return <RegistrarWorkspacePage initialTab="ACADEMICS" initialSubFilter="CALENDAR" />;
      case 'reg-academic-overview':
        return <RegistrarWorkspacePage initialTab="ACADEMICS" initialSubFilter="OVERVIEW" />;
      case 'reg-students-overview':
      case 'reg-students-search':
        return <RegistrarWorkspacePage initialTab="STUDENTS" initialSubFilter="SEARCH" />;
      case 'reg-students-profile':
        return <RegistrarWorkspacePage initialTab="STUDENTS" initialSubFilter="PROFILE" />;
      case 'reg-students-records':
        return <RegistrarWorkspacePage initialTab="STUDENTS" initialSubFilter="RECORDS" />;
      case 'reg-students-status':
        return <RegistrarWorkspacePage initialTab="STUDENTS" initialSubFilter="STATUS" />;
      case 'reg-students-international':
        return <RegistrarWorkspacePage initialTab="STUDENTS" initialSubFilter="INTERNATIONAL" />;
      case 'reg-students-stats':
        return <RegistrarWorkspacePage initialTab="STUDENTS" initialSubFilter="STATS" />;
      case 'reg-faculty-overview':
        return <RegistrarWorkspacePage initialTab="FACULTY" initialSubFilter="OVERVIEW" />;
      case 'reg-faculty-staff':
      case 'reg-faculty-search':
        return <RegistrarWorkspacePage initialTab="FACULTY" initialSubFilter="STAFF" />;
      case 'reg-faculty-inst-strength':
      case 'reg-faculty-stats':
        return <RegistrarWorkspacePage initialTab="FACULTY" initialSubFilter="INST_STRENGTH" />;
      case 'reg-faculty-dept-strength':
      case 'reg-faculty-allocation':
        return <RegistrarWorkspacePage initialTab="FACULTY" initialSubFilter="DEPT_STRENGTH" />;
      case 'reg-notesheet-create':
        return <NoteSheetPage initialTab="CREATE" initialRecordId={tabParams?.recordId || tabParams?.notesheetId} initialAction={tabParams?.actionType} />;
      case 'reg-notesheet-pending':
        return <NoteSheetPage initialTab="PENDING_WITH_ME" initialRecordId={tabParams?.recordId || tabParams?.notesheetId} initialAction={tabParams?.actionType} />;
      case 'reg-notesheet-my':
        return <NoteSheetPage initialTab="MY_SHEETS" initialRecordId={tabParams?.recordId || tabParams?.notesheetId} initialAction={tabParams?.actionType} />;
      case 'reg-notesheet-drafts':
        return <NoteSheetPage initialTab="DRAFTS" initialRecordId={tabParams?.recordId || tabParams?.notesheetId} initialAction={tabParams?.actionType} />;
      case 'reg-notesheet-sent':
        return <NoteSheetPage initialTab="SENT" initialRecordId={tabParams?.recordId || tabParams?.notesheetId} initialAction={tabParams?.actionType} />;
      case 'reg-notesheet-financial':
        return <NoteSheetPage initialTab="FINANCIAL_SHEETS" initialRecordId={tabParams?.recordId || tabParams?.notesheetId} initialAction={tabParams?.actionType} />;
      case 'reg-notesheet-returned':
        return <NoteSheetPage initialTab="RETURNED" initialRecordId={tabParams?.recordId || tabParams?.notesheetId} initialAction={tabParams?.actionType} />;
      case 'reg-notesheet-clarification':
        return <NoteSheetPage initialTab="CLARIFICATION" initialRecordId={tabParams?.recordId || tabParams?.notesheetId} initialAction={tabParams?.actionType} />;
      case 'reg-notesheet-action-pending':
        return <NoteSheetPage initialTab="ACTION_PENDING" initialRecordId={tabParams?.recordId || tabParams?.notesheetId} initialAction={tabParams?.actionType} />;
      case 'reg-notesheet-approved':
        return <NoteSheetPage initialTab="APPROVED" initialRecordId={tabParams?.recordId || tabParams?.notesheetId} initialAction={tabParams?.actionType} />;
      case 'reg-notesheet-rejected':
        return <NoteSheetPage initialTab="REJECTED" initialRecordId={tabParams?.recordId || tabParams?.notesheetId} initialAction={tabParams?.actionType} />;
      case 'reg-notesheet-closed':
        return <NoteSheetPage initialTab="CLOSED" initialRecordId={tabParams?.recordId || tabParams?.notesheetId} initialAction={tabParams?.actionType} />;
      case 'reg-notesheet-history':
        return <NoteSheetPage initialTab="REGISTER" initialRecordId={tabParams?.recordId || tabParams?.notesheetId} initialAction={tabParams?.actionType} />;
      case 'reg-notesheets':
        return <NoteSheetPage initialTab={tabParams?.initialTab || "DASHBOARD"} initialRecordId={tabParams?.recordId || tabParams?.notesheetId} initialAction={tabParams?.actionType} />;
      case 'reg-notesheet-verify':
      case 'verify-notesheet':
      case 'notesheet-verification':
        return <NoteSheetPage initialTab="VERIFICATION" initialRecordId={tabParams?.recordId || tabParams?.notesheetId} initialAction={tabParams?.actionType} />;
      case 'reg-requests-pending':
      case 'reg-requests-escalated':
      case 'reg-requests-assigned':
      case 'reg-requests-dept':
      case 'reg-requests-uni':
      case 'reg-requests-history':
        return <RegistrarWorkspacePage initialTab="REQUESTS" initialRecordId={tabParams?.recordId} />;
      case 'reg-approvals-pending':
      case 'reg-approvals-academic':
      case 'reg-approvals-admin':
      case 'reg-approvals-financial':
      case 'reg-approvals-special':
      case 'reg-approvals-records':
      case 'reg-approvals-dept':
      case 'reg-approvals-inst':
        return <RegistrarWorkspacePage initialTab="APPROVALS" initialRecordId={tabParams?.recordId} />;
      case 'reg-exam-overview':
      case 'reg-exam-forms':
      case 'reg-exam-eligibility':
      case 'reg-exam-halltickets':
      case 'reg-exam-centres':
      case 'reg-exam-results':
      case 'reg-exam-status':
        return <RegistrarWorkspacePage initialTab="EXAMINATION" />;
      case 'reg-docs-overview':
      case 'reg-docs-certificates':
      case 'reg-docs-transcripts':
      case 'reg-docs-degrees':
      case 'reg-docs-migration':
      case 'reg-docs-verification':
      case 'reg-records-academic':
      case 'reg-records-docs':
      case 'reg-records-certificates':
      case 'reg-records-transcripts':
      case 'reg-records-degrees':
        return <RegistrarWorkspacePage initialTab="DOCUMENTS" />;
      case 'reg-finance-fees':
      case 'reg-finance-collection':
      case 'reg-finance-pending':
      case 'reg-finance-notesheets':
      case 'reg-finance-reports':
        return <RegistrarWorkspacePage initialTab="FINANCE" />;
      case 'reg-corr-incoming':
        return <RegistrarWorkspacePage initialTab="CORRESPONDENCE" initialSubFilter="INCOMING" />;
      case 'reg-corr-outgoing':
        return <RegistrarWorkspacePage initialTab="CORRESPONDENCE" initialSubFilter="OUTGOING" />;
      case 'reg-corr-circulars':
        return <RegistrarWorkspacePage initialTab="CORRESPONDENCE" initialSubFilter="CIRCULAR" />;
      case 'reg-corr-external':
        return <RegistrarWorkspacePage initialTab="CORRESPONDENCE" initialSubFilter="EXTERNAL_GOV" />;
      case 'reg-corr-register':
        return <RegistrarWorkspacePage initialTab="CORRESPONDENCE" initialSubFilter="ALL" />;
      case 'reg-files-register':
      case 'reg-files-movement':
      case 'reg-files-archive':
      case 'reg-files-search':
        return <RegistrarWorkspacePage initialTab="FILES" />;
      case 'reg-comm-master':
      case 'reg-comm-members':
      case 'reg-comm-meetings':
      case 'reg-comm-agenda':
      case 'reg-comm-mom':
      case 'reg-comm-actions':
        return <RegistrarWorkspacePage initialTab="COMMITTEES" />;
      case 'reg-notices-create':
      case 'reg-notices-published':
      case 'reg-notices-circulars':
      case 'reg-notices-history':
      case 'reg-notices-uni':
      case 'reg-notices-academic':
      case 'reg-notices-admin':
        return <RegistrarWorkspacePage initialTab="NOTICES" />;
      case 'reg-inv-inst':
      case 'reg-inv-dept':
      case 'reg-inv-transfers':
      case 'reg-inv-maintenance':
      case 'reg-inv-reports':
        return <RegistrarWorkspacePage initialTab="INVENTORY" />;
      case 'reg-rep-uni':
      case 'reg-rep-inst':
      case 'reg-rep-dept':
      case 'reg-rep-student':
      case 'reg-rep-academic':
      case 'reg-rep-faculty':
      case 'reg-rep-exam':
      case 'reg-rep-financial':
      case 'reg-rep-inventory':
      case 'reg-rep-custom':
      case 'reg-reports-uni':
      case 'reg-reports-academic':
      case 'reg-reports-student':
      case 'reg-reports-faculty':
      case 'reg-reports-attendance':
      case 'reg-reports-exam':
      case 'reg-reports-inst':
      case 'reg-reports-dept':
        return <RegistrarWorkspacePage initialTab="REPORTS" />;
      case 'reg-audit-log':
      case 'reg-audit-login':
      case 'reg-audit-approvals':
      case 'reg-audit-notesheets':
      case 'reg-audit-system':
      case 'reg-audit-logs':
        return <RegistrarWorkspacePage initialTab="AUDIT_LOGS" />;
      case 'reg-excel-templates':
      case 'reg-excel-history':
      case 'reg-excel-failed':
      case 'reg-excel-export':
        return <RegistrarWorkspacePage initialTab="EXCEL_CENTER" />;
      case 'reg-preferences':
      case 'reg-change-password':
        return <RegistrarWorkspacePage initialTab="SETTINGS" />;

      // ─── 6. Requests Section ───
      case 'requests':
      case 'requests-my-requests':
      case 'faculty-requests-all':
        return <RequestsPage initialCategory={tabParams?.initialCategory || tabParams?.category || "ALL"} initialRecordId={tabParams?.recordId || tabParams?.requestId} initialQueue={tabParams?.initialQueue} />;
      case 'requests-subject-query':
      case 'faculty-requests-queries':
        return <RequestsPage initialCategory="SUBJECT_QUERY" initialRecordId={tabParams?.recordId || tabParams?.requestId} initialQueue={tabParams?.initialQueue} />;
      case 'requests-assigned':
      case 'faculty-requests-assigned':
        return <RequestsPage initialCategory={tabParams?.initialCategory || tabParams?.category || "ALL"} initialRecordId={tabParams?.recordId || tabParams?.requestId} initialQueue={tabParams?.initialQueue} />;
      case 'requests-complaint':
        return <RequestsPage initialCategory="GENERAL_COMPLAINT" initialRecordId={tabParams?.recordId || tabParams?.requestId} initialQueue={tabParams?.initialQueue} />;

      // ─── 6B. Documents Section ───
      case 'documents':
      case 'student-documents':
      case 'faculty-student-docs':
        return (role === 'FACULTY' || role === 'STUDENT') ? <MentorPage initialTab="STUDENT_DOCUMENTS" /> : <DocumentMasterPage initialRecordId={tabParams?.recordId} />;
      case 'pending-verification':
      case 'faculty-pending-verification':
        return <MentorPage initialTab="PENDING_VERIFICATION" />;

      // ─── 7. Hostel Section ───
      case 'hostel':
      case 'hostel-admin':
        return role === 'STUDENT' ? <StudentHostelPage /> : <HostelWorkspacePage initialTab={tabParams?.subFilter} initialRecordId={tabParams?.recordId} />;

      // ─── 8. Transport Section ───
      case 'transport':
      case 'transport-admin':
        return role === 'STUDENT' ? <StudentTransportPage /> : <TransportWorkspacePage />;

      // ─── 9. Notifications Section ───
      case 'notifications':
        return <NotificationsPage setActiveTab={setActiveTab} />;

      // ─── 10. Profile & ID Card Section ───
      case 'profile':
        return <ProfilePage />;
      case 'id-card':
        return <DigitalIdCardPage />;

      // ─── Campus & Other Support ───
      case 'hr':
        return <HRManagementPage />;
      case 'crm':
        return <CRMPage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SystemSettingsPage />;
      case 'feedback':
      case 'feedback-give':
      case 'feedback-my':
      case 'feedback-suggestions':
        return <FeedbackPage />;
      case 'tickets':
      case 'service-desk':
        return <SupportTicketsPage />;
      case 'mentor':
        return <MentorPage />;
      case 'notices':
        return <NoticesPage />;
      case 'events':
        return <EventsPage />;
      case 'library':
        return <LibraryPage />;
      case 'edp-duties':
        return <EdpDutyPage />;
      case 'incubation':
        return <IncubationPage />;
      case 'registrar':
        return <RegistrarWorkspacePage />;
      case 'iqac':
        return <IQACWorkspacePage />;
      case 'exam-cell':
        return <ExamCellWorkspacePage />;
      case 'library-admin':
        return <LibraryWorkspacePage />;
      case 'accounts-admin':
        return <AccountsWorkspacePage initialTab={tabParams?.subFilter} initialRecordId={tabParams?.recordId} />;
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
      case 'student-search':
      case 'students-search':
      case 'students-directory':
      case 'reg-students-search':
      case 'section-students-list':
        return role !== 'STUDENT' ? (
          <StudentDirectorySearchPage 
            initialRecordId={tabParams?.recordId}
            initialStudentId={tabParams?.studentId}
            initialTab={tabParams?.initialTab}
            initialDocId={tabParams?.docId}
          />
        ) : (
          <Dashboard setActiveTab={setActiveTab} />
        );
      case 'mentor-assignment':
        return <StudentsPage initialTab="MENTOR_ASSIGNMENT" />;
      case 'document-master':
        return <DocumentMasterPage initialRecordId={tabParams?.recordId} />;
      case 'profile':
        return <ProfilePage />;
      case 'security-audit':
        return <SecurityAuditCenterPage />;
      case 'bulk-import':
        return role !== 'STUDENT' ? <BulkImportPage /> : <Dashboard setActiveTab={setActiveTab} />;
      case 'note-sheets':
        return role !== 'STUDENT' ? <NoteSheetPage initialTab={tabParams?.initialTab || "DASHBOARD"} initialRecordId={tabParams?.recordId || tabParams?.notesheetId} initialAction={tabParams?.actionType} /> : <Dashboard setActiveTab={setActiveTab} />;
      case 'notesheet-create':
        return role !== 'STUDENT' ? <NoteSheetPage initialTab="CREATE" initialRecordId={tabParams?.recordId || tabParams?.notesheetId} initialAction={tabParams?.actionType} /> : <Dashboard setActiveTab={setActiveTab} />;
      case 'notesheet-pending':
        return role !== 'STUDENT' ? <NoteSheetPage initialTab="PENDING_WITH_ME" initialRecordId={tabParams?.recordId || tabParams?.notesheetId} initialAction={tabParams?.actionType} /> : <Dashboard setActiveTab={setActiveTab} />;
      case 'notesheet-my':
        return role !== 'STUDENT' ? <NoteSheetPage initialTab="MY_SHEETS" initialRecordId={tabParams?.recordId || tabParams?.notesheetId} initialAction={tabParams?.actionType} /> : <Dashboard setActiveTab={setActiveTab} />;
      case 'notesheet-sent':
        return role !== 'STUDENT' ? <NoteSheetPage initialTab="SENT" initialRecordId={tabParams?.recordId || tabParams?.notesheetId} initialAction={tabParams?.actionType} /> : <Dashboard setActiveTab={setActiveTab} />;
      case 'notesheet-returned':
        return role !== 'STUDENT' ? <NoteSheetPage initialTab="RETURNED" initialRecordId={tabParams?.recordId || tabParams?.notesheetId} initialAction={tabParams?.actionType} /> : <Dashboard setActiveTab={setActiveTab} />;
      case 'notesheet-clarification':
        return role !== 'STUDENT' ? <NoteSheetPage initialTab="CLARIFICATION" initialRecordId={tabParams?.recordId || tabParams?.notesheetId} initialAction={tabParams?.actionType} /> : <Dashboard setActiveTab={setActiveTab} />;
      case 'notesheet-action-pending':
        return role !== 'STUDENT' ? <NoteSheetPage initialTab="ACTION_PENDING" initialRecordId={tabParams?.recordId || tabParams?.notesheetId} initialAction={tabParams?.actionType} /> : <Dashboard setActiveTab={setActiveTab} />;
      case 'notesheet-approved':
        return role !== 'STUDENT' ? <NoteSheetPage initialTab="APPROVED" initialRecordId={tabParams?.recordId || tabParams?.notesheetId} initialAction={tabParams?.actionType} /> : <Dashboard setActiveTab={setActiveTab} />;
      case 'notesheet-rejected':
        return role !== 'STUDENT' ? <NoteSheetPage initialTab="REJECTED" initialRecordId={tabParams?.recordId || tabParams?.notesheetId} initialAction={tabParams?.actionType} /> : <Dashboard setActiveTab={setActiveTab} />;
      case 'notesheet-drafts':
        return role !== 'STUDENT' ? <NoteSheetPage initialTab="DRAFTS" initialRecordId={tabParams?.recordId || tabParams?.notesheetId} initialAction={tabParams?.actionType} /> : <Dashboard setActiveTab={setActiveTab} />;
      case 'notesheet-closed':
        return role !== 'STUDENT' ? <NoteSheetPage initialTab="CLOSED" initialRecordId={tabParams?.recordId || tabParams?.notesheetId} initialAction={tabParams?.actionType} /> : <Dashboard setActiveTab={setActiveTab} />;
      case 'notesheet-history':
        return role !== 'STUDENT' ? <NoteSheetPage initialTab="REGISTER" initialRecordId={tabParams?.recordId || tabParams?.notesheetId} initialAction={tabParams?.actionType} /> : <Dashboard setActiveTab={setActiveTab} />;
      case 'notesheet-verify':
        return <NoteSheetPage initialTab="VERIFICATION" initialRecordId={tabParams?.recordId || tabParams?.notesheetId} initialAction={tabParams?.actionType} />;
      case 'inward-outward':
        return role !== 'STUDENT' ? <InwardOutwardRegisterPage initialRecordId={tabParams?.recordId} /> : <Dashboard setActiveTab={setActiveTab} />;
      case 'work-diary':
        return role !== 'STUDENT' ? <WorkDiaryPage initialRecordId={tabParams?.recordId} /> : <Dashboard setActiveTab={setActiveTab} />;
      case 'inventory-assets':
      case 'inventory-dashboard':
        return role !== 'STUDENT' ? <InventoryAssetPage initialTab="DASHBOARD" /> : <Dashboard setActiveTab={setActiveTab} />;
      case 'inventory-assets-register':
        return role !== 'STUDENT' ? <InventoryAssetPage initialTab="ASSET_REGISTER" /> : <Dashboard setActiveTab={setActiveTab} />;
      case 'inventory-stock':
        return role !== 'STUDENT' ? <InventoryAssetPage initialTab="CONSUMABLES_STOCK" /> : <Dashboard setActiveTab={setActiveTab} />;
      case 'inventory-stationery':
        return role !== 'STUDENT' ? <InventoryAssetPage initialTab="STATIONERY_REGISTER" /> : <Dashboard setActiveTab={setActiveTab} />;
      case 'inventory-dept':
        return role !== 'STUDENT' ? <InventoryAssetPage initialTab="DEPARTMENT_STORE" /> : <Dashboard setActiveTab={setActiveTab} />;
      case 'inventory-assignments':
        return role !== 'STUDENT' ? <InventoryAssetPage initialTab="ASSET_ASSIGNMENT" /> : <Dashboard setActiveTab={setActiveTab} />;
      case 'inventory-transactions':
        return role !== 'STUDENT' ? <InventoryAssetPage initialTab="STOCK_TRANSACTIONS" /> : <Dashboard setActiveTab={setActiveTab} />;
      case 'inventory-maintenance':
        return role !== 'STUDENT' ? <InventoryAssetPage initialTab="MAINTENANCE" /> : <Dashboard setActiveTab={setActiveTab} />;
      case 'inventory-verification':
        return role !== 'STUDENT' ? <InventoryAssetPage initialTab="PHYSICAL_VERIFICATION" /> : <Dashboard setActiveTab={setActiveTab} />;
      case 'inventory-transfers':
        return role !== 'STUDENT' ? <InventoryAssetPage initialTab="TRANSFERS" /> : <Dashboard setActiveTab={setActiveTab} />;
      case 'inventory-disposal':
        return role !== 'STUDENT' ? <InventoryAssetPage initialTab="DISPOSAL" /> : <Dashboard setActiveTab={setActiveTab} />;
      case 'inventory-files':
        return role !== 'STUDENT' ? <InventoryAssetPage initialTab="PHYSICAL_FILES" /> : <Dashboard setActiveTab={setActiveTab} />;
      case 'inventory-import':
        return role !== 'STUDENT' ? <InventoryAssetPage initialTab="EXCEL_IMPORT" /> : <Dashboard setActiveTab={setActiveTab} />;
      case 'inventory-reports':
        return role !== 'STUDENT' ? <InventoryAssetPage initialTab="REPORTS" /> : <Dashboard setActiveTab={setActiveTab} />;
      case 'inventory-audit':
        return role !== 'STUDENT' ? <InventoryAssetPage initialTab="AUDIT_LOG" /> : <Dashboard setActiveTab={setActiveTab} />;
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
