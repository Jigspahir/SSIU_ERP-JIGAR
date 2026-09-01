import {
  LayoutDashboard, Building2, GraduationCap, CalendarDays, Calendar,
  UserCheck, BookOpen, Clock, FileText, FileCheck, CalendarCheck,
  IndianRupee, FolderCheck, BarChart3, Settings, Award, MessageSquare, HelpCircle,
  Bell, Library, CheckSquare, Rocket, Wrench,
  Grid, Activity, ShieldAlert, ShieldCheck, Users2, FileSpreadsheet, UploadCloud, User,
  RotateCcw, RefreshCw, LogOut, Boxes, Package, Layers, Archive,
  Mail, Send, Inbox, Briefcase, History, UserPlus, FileStack, KeyRound, Users, CheckCircle2,
  FileSignature, Landmark, FileBox, FileQuestion, DollarSign, FileDown, Search, ArrowLeftRight,
  AlertTriangle, Sparkles, Bot, Compass, Target, Wallet, Lock
} from 'lucide-react';
import { UserRole } from '../types';

export interface NavItemConfig {
  id: string;
  label: string;
  icon: any;
  allowedRoles: UserRole[];
  category: 'Main' | 'Academic' | 'Examinations' | 'Administration' | 'Finance & Admin' | 'Support & Campus' | 'Campus' | 'Master' | 'System';
}

export const ALL_NAV_ITEMS: Record<string, NavItemConfig> = {
  // Main
  'dashboard': {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'VICE_PRESIDENT', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT', 'REGISTRAR', 'DEPUTY_REGISTRAR', 'IQAC', 'EXAM_CELL', 'STUDENT_SECTION', 'HOSTEL_ADMIN', 'LIBRARY_ADMIN', 'TRANSPORT_ADMIN', 'MAINTENANCE_ADMIN', 'ACCOUNTS_ADMIN'],
    category: 'Main'
  },
  'ai-control-center': {
    id: 'ai-control-center',
    label: 'AI & Automation',
    icon: Sparkles,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'VICE_PRESIDENT', 'PRINCIPAL', 'HOD', 'REGISTRAR', 'DEPUTY_REGISTRAR', 'STUDENT_SECTION', 'ACCOUNTS_ADMIN', 'IQAC', 'FACULTY'],
    category: 'Main'
  },
  'abc-credits': {
    id: 'abc-credits',
    label: 'Academic Credits (ABC)',
    icon: Award,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRESIDENT', 'VICE_PRESIDENT', 'PROVOST', 'PRINCIPAL', 'HOD', 'FACULTY', 'MENTOR', 'STUDENT', 'REGISTRAR', 'DEPUTY_REGISTRAR', 'STUDENT_SECTION', 'IQAC', 'EXAM_CELL'],
    category: 'Academic'
  },
  'digilocker': {
    id: 'digilocker',
    label: 'DigiLocker Documents',
    icon: ShieldCheck,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRESIDENT', 'VICE_PRESIDENT', 'PROVOST', 'PRINCIPAL', 'HOD', 'FACULTY', 'MENTOR', 'STUDENT', 'REGISTRAR', 'DEPUTY_REGISTRAR', 'STUDENT_SECTION', 'IQAC', 'EXAM_CELL'],
    category: 'Academic'
  },
  'accreditation': {
    id: 'accreditation',
    label: 'Accreditation',
    icon: Award,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'VICE_PRESIDENT', 'PROVOST', 'PRESIDENT', 'PRINCIPAL', 'HOD', 'REGISTRAR', 'DEPUTY_REGISTRAR', 'IQAC', 'FACULTY'],
    category: 'Academic'
  },
  'accreditation-naac': {
    id: 'accreditation-naac',
    label: 'NAAC (7 Criteria)',
    icon: Layers,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'VICE_PRESIDENT', 'PROVOST', 'PRESIDENT', 'PRINCIPAL', 'HOD', 'REGISTRAR', 'DEPUTY_REGISTRAR', 'IQAC', 'FACULTY'],
    category: 'Academic'
  },
  'accreditation-nba': {
    id: 'accreditation-nba',
    label: 'NBA (10 Criteria OBE)',
    icon: Award,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'VICE_PRESIDENT', 'PROVOST', 'PRESIDENT', 'PRINCIPAL', 'HOD', 'REGISTRAR', 'DEPUTY_REGISTRAR', 'IQAC', 'FACULTY'],
    category: 'Academic'
  },
  'accreditation-evidence': {
    id: 'accreditation-evidence',
    label: 'Accreditation Evidence',
    icon: FileCheck,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'VICE_PRESIDENT', 'PROVOST', 'PRESIDENT', 'PRINCIPAL', 'HOD', 'REGISTRAR', 'DEPUTY_REGISTRAR', 'IQAC', 'FACULTY'],
    category: 'Academic'
  },
  'accreditation-reports': {
    id: 'accreditation-reports',
    label: 'SSR / SAR Snapshots',
    icon: FileSpreadsheet,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'VICE_PRESIDENT', 'PROVOST', 'PRESIDENT', 'PRINCIPAL', 'HOD', 'REGISTRAR', 'DEPUTY_REGISTRAR', 'IQAC', 'FACULTY'],
    category: 'Academic'
  },
  'obe': {
    id: 'obe',
    label: 'Outcome-Based Education (OBE)',
    icon: GraduationCap,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'VICE_PRESIDENT', 'PROVOST', 'PRESIDENT', 'PRINCIPAL', 'HOD', 'REGISTRAR', 'DEPUTY_REGISTRAR', 'IQAC', 'FACULTY', 'STUDENT'],
    category: 'Academic'
  },
  'course-outcomes': {
    id: 'course-outcomes',
    label: 'Course Outcomes (CO)',
    icon: GraduationCap,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'VICE_PRESIDENT', 'PROVOST', 'PRESIDENT', 'PRINCIPAL', 'HOD', 'REGISTRAR', 'DEPUTY_REGISTRAR', 'IQAC', 'FACULTY', 'STUDENT'],
    category: 'Academic'
  },
  'program-outcomes': {
    id: 'program-outcomes',
    label: 'Program Outcomes (PO)',
    icon: Compass,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'VICE_PRESIDENT', 'PROVOST', 'PRESIDENT', 'PRINCIPAL', 'HOD', 'REGISTRAR', 'DEPUTY_REGISTRAR', 'IQAC', 'FACULTY', 'STUDENT'],
    category: 'Academic'
  },
  'program-specific-outcomes': {
    id: 'program-specific-outcomes',
    label: 'Program Specific Outcomes (PSO)',
    icon: Target,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'VICE_PRESIDENT', 'PROVOST', 'PRESIDENT', 'PRINCIPAL', 'HOD', 'REGISTRAR', 'DEPUTY_REGISTRAR', 'IQAC', 'FACULTY', 'STUDENT'],
    category: 'Academic'
  },
  'co-po-mapping': {
    id: 'co-po-mapping',
    label: 'CO-PO Mapping Matrix',
    icon: Layers,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'VICE_PRESIDENT', 'PROVOST', 'PRESIDENT', 'PRINCIPAL', 'HOD', 'REGISTRAR', 'DEPUTY_REGISTRAR', 'IQAC', 'FACULTY'],
    category: 'Academic'
  },
  'co-pso-mapping': {
    id: 'co-pso-mapping',
    label: 'CO-PSO Mapping',
    icon: Layers,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'VICE_PRESIDENT', 'PROVOST', 'PRESIDENT', 'PRINCIPAL', 'HOD', 'REGISTRAR', 'DEPUTY_REGISTRAR', 'IQAC', 'FACULTY'],
    category: 'Academic'
  },
  'assessment-mapping': {
    id: 'assessment-mapping',
    label: 'Assessment Mapping',
    icon: FileCheck,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'VICE_PRESIDENT', 'PROVOST', 'PRESIDENT', 'PRINCIPAL', 'HOD', 'REGISTRAR', 'DEPUTY_REGISTRAR', 'IQAC', 'FACULTY'],
    category: 'Academic'
  },
  'attainment': {
    id: 'attainment',
    label: 'CO/PO Attainment Engine',
    icon: Award,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'VICE_PRESIDENT', 'PROVOST', 'PRESIDENT', 'PRINCIPAL', 'HOD', 'REGISTRAR', 'DEPUTY_REGISTRAR', 'IQAC', 'FACULTY', 'STUDENT'],
    category: 'Academic'
  },
  'grievance': {
    id: 'grievance',
    label: 'UGC Grievance & Safety',
    icon: ShieldAlert,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'VICE_PRESIDENT', 'PROVOST', 'PRESIDENT', 'PRINCIPAL', 'HOD', 'REGISTRAR', 'DEPUTY_REGISTRAR', 'IQAC', 'FACULTY', 'STUDENT', 'STAFF'],
    category: 'Support & Campus'
  },
  'research': {
    id: 'research',
    label: 'Research & Innovation',
    icon: BookOpen,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'VICE_PRESIDENT', 'PROVOST', 'PRESIDENT', 'PRINCIPAL', 'HOD', 'REGISTRAR', 'DEPUTY_REGISTRAR', 'IQAC', 'FACULTY', 'STUDENT'],
    category: 'Academic'
  },
  'startup-grants': {
    id: 'startup-grants',
    label: 'Innovation, Incubation & Startups',
    icon: Rocket,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'VICE_PRESIDENT', 'PROVOST', 'PRESIDENT', 'PRINCIPAL', 'HOD', 'REGISTRAR', 'DEPUTY_REGISTRAR', 'IQAC', 'FACULTY', 'STUDENT'],
    category: 'Academic'
  },
  'grants': {
    id: 'grants',
    label: 'Grants & SSIP',
    icon: Wallet,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'VICE_PRESIDENT', 'PROVOST', 'PRESIDENT', 'PRINCIPAL', 'HOD', 'REGISTRAR', 'DEPUTY_REGISTRAR', 'IQAC', 'FACULTY', 'STUDENT', 'STUDENT_ADMIN', 'STUDENT_SECTION', 'ERP_COORDINATOR', 'MENTOR'],
    category: 'Academic'
  },
  'government-integrations': {
    id: 'government-integrations',
    label: 'Government & National Depository',
    icon: Landmark,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'VICE_PRESIDENT', 'PROVOST', 'PRESIDENT', 'PRINCIPAL', 'HOD', 'REGISTRAR', 'DEPUTY_REGISTRAR', 'IQAC', 'FACULTY', 'STUDENT'],
    category: 'Academic'
  },
  'compliance-engine': {
    id: 'compliance-engine',
    label: 'Accreditation & OBE Compliance',
    icon: Award,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'VICE_PRESIDENT', 'PROVOST', 'PRESIDENT', 'PRINCIPAL', 'HOD', 'REGISTRAR', 'DEPUTY_REGISTRAR', 'IQAC', 'FACULTY', 'STUDENT'],
    category: 'Academic'
  },

  // Academic & Core
  'calendar': {
    id: 'calendar',
    label: 'Academic Calendar',
    icon: CalendarDays,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT'],
    category: 'Academic'
  },
  'attendance': {
    id: 'attendance',
    label: 'Attendance',
    icon: UserCheck,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT'],
    category: 'Academic'
  },
  'subjects': {
    id: 'subjects',
    label: 'Subjects',
    icon: BookOpen,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'MENTOR', 'STUDENT'],
    category: 'Academic'
  },
  'timetable': {
    id: 'timetable',
    label: 'Timetable',
    icon: Clock,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'MENTOR', 'STUDENT'],
    category: 'Academic'
  },
  'session-plan': {
    id: 'session-plan',
    label: 'Session Plan',
    icon: BookOpen,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'MENTOR', 'STUDENT'],
    category: 'Academic'
  },
  'materials': {
    id: 'materials',
    label: 'Study Material',
    icon: FileText,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'MENTOR', 'STUDENT'],
    category: 'Academic'
  },
  'study-material': {
    id: 'study-material',
    label: 'Study Material',
    icon: FileText,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'MENTOR', 'STUDENT'],
    category: 'Academic'
  },
  'assignments': {
    id: 'assignments',
    label: 'Assignments',
    icon: FileCheck,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT'],
    category: 'Academic'
  },
  'quiz': {
    id: 'quiz',
    label: 'Quiz',
    icon: HelpCircle,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT'],
    category: 'Academic'
  },
  'id-card': {
    id: 'id-card',
    label: 'Digital ID Card',
    icon: Award,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT'],
    category: 'Main'
  },

  // Examination & Results
  'exam-dashboard': {
    id: 'exam-dashboard',
    label: 'Examination',
    icon: BarChart3,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT', 'EXAM_CELL'],
    category: 'Examinations'
  },
  'question-bank': {
    id: 'question-bank',
    label: 'Question Bank',
    icon: BookOpen,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT', 'EXAM_CELL'],
    category: 'Examinations'
  },
  'paper-builder': {
    id: 'paper-builder',
    label: 'Paper Builder',
    icon: Sparkles,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'EXAM_CELL'],
    category: 'Examinations'
  },
  'paper-approval': {
    id: 'paper-approval',
    label: 'Paper Approval',
    icon: ShieldCheck,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'EXAM_CELL'],
    category: 'Examinations'
  },
  'published-papers': {
    id: 'published-papers',
    label: 'Published Papers',
    icon: Lock,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT', 'EXAM_CELL'],
    category: 'Examinations'
  },
  'exam-reports': {
    id: 'exam-reports',
    label: 'Examination Reports',
    icon: FileSpreadsheet,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'EXAM_CELL'],
    category: 'Examinations'
  },
  'exams': {
    id: 'exams',
    label: 'Exam Events',
    icon: FileCheck,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'EXAM_CELL', 'PRINCIPAL', 'HOD'],
    category: 'Examinations'
  },
  'exam-schedule': {
    id: 'exam-schedule',
    label: 'Exam Schedule',
    icon: CalendarDays,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'EXAM_CELL', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT'],
    category: 'Examinations'
  },
  'exam-forms': {
    id: 'exam-forms',
    label: 'Exam Forms',
    icon: FileText,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'EXAM_CELL', 'REGISTRAR', 'STUDENT', 'PRINCIPAL', 'HOD'],
    category: 'Examinations'
  },
  'exam-eligibility': {
    id: 'exam-eligibility',
    label: 'Exam Eligibility',
    icon: ShieldCheck,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'EXAM_CELL', 'REGISTRAR', 'STUDENT', 'PRINCIPAL', 'HOD', 'FACULTY'],
    category: 'Examinations'
  },
  'exam-fees': {
    id: 'exam-fees',
    label: 'Exam Fee Config',
    icon: IndianRupee,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'EXAM_CELL', 'REGISTRAR'],
    category: 'Examinations'
  },
  'exam-fees-student': {
    id: 'exam-fees-student',
    label: 'Exam Fees',
    icon: IndianRupee,
    allowedRoles: ['STUDENT'],
    category: 'Examinations'
  },
  'exam-backlog': {
    id: 'exam-backlog',
    label: 'Backlog / Re-Exam',
    icon: RotateCcw,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'STUDENT', 'EXAM_CELL'],
    category: 'Examinations'
  },
  'exam-reassessment': {
    id: 'exam-reassessment',
    label: 'Reassessment / Rechecking',
    icon: RefreshCw,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'STUDENT', 'EXAM_CELL'],
    category: 'Examinations'
  },
  'exam-hallticket': {
    id: 'exam-hallticket',
    label: 'Hall Tickets',
    icon: Award,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'EXAM_CELL', 'STUDENT', 'PRINCIPAL', 'HOD'],
    category: 'Examinations'
  },
  'exam-marks': {
    id: 'exam-marks',
    label: 'Marks Entry',
    icon: FileSpreadsheet,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'HOD', 'FACULTY', 'EXAM_CELL'],
    category: 'Examinations'
  },
  'exam-results': {
    id: 'exam-results',
    label: 'Results & Marksheets',
    icon: Award,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'EXAM_CELL', 'HOD', 'PRINCIPAL', 'STUDENT'],
    category: 'Examinations'
  },
  'exam-centres': {
    id: 'exam-centres',
    label: 'Exam Centres',
    icon: Building2,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'EXAM_CELL', 'PRINCIPAL'],
    category: 'Examinations'
  },
  'exam-seating': {
    id: 'exam-seating',
    label: 'Seating Plan',
    icon: Grid,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'EXAM_CELL', 'PRINCIPAL', 'HOD', 'STUDENT'],
    category: 'Examinations'
  },
  'exam-edp-duty': {
    id: 'exam-edp-duty',
    label: 'EDP Duty Roster',
    icon: ShieldAlert,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'EXAM_CELL', 'PRINCIPAL', 'HOD', 'FACULTY'],
    category: 'Examinations'
  },
  'exam-day-control': {
    id: 'exam-day-control',
    label: 'Exam Day Control',
    icon: Activity,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'EXAM_CELL', 'PRINCIPAL'],
    category: 'Examinations'
  },

  // Finance & Accounts
  'fees': {
    id: 'fees',
    label: 'Fees & Payments',
    icon: IndianRupee,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'STUDENT', 'ACCOUNTS_ADMIN'],
    category: 'Finance & Admin'
  },
  'accounts-admin': {
    id: 'accounts-admin',
    label: 'Accounts & Finance',
    icon: IndianRupee,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'ACCOUNTS_ADMIN'],
    category: 'Administration'
  },
  'crm': {
    id: 'crm',
    label: 'Documents',
    icon: FolderCheck,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT'],
    category: 'Finance & Admin'
  },
  'certificates': {
    id: 'certificates',
    label: 'Student Section',
    icon: Award,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'STUDENT', 'STUDENT_SECTION'],
    category: 'Campus'
  },
  'requests': {
    id: 'requests',
    label: 'Digital Approvals',
    icon: CheckSquare,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT', 'REGISTRAR', 'IQAC', 'EXAM_CELL', 'STUDENT_SECTION', 'HOSTEL_ADMIN', 'LIBRARY_ADMIN', 'TRANSPORT_ADMIN', 'MAINTENANCE_ADMIN', 'ACCOUNTS_ADMIN'],
    category: 'Finance & Admin'
  },
  'work-transfer': {
    id: 'work-transfer',
    label: 'Workload & Work Transfer',
    icon: ArrowLeftRight,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'VICE_PRESIDENT', 'PRINCIPAL', 'HOD', 'FACULTY', 'REGISTRAR', 'DEPUTY_REGISTRAR', 'IQAC', 'EXAM_CELL', 'STUDENT_SECTION'],
    category: 'Administration'
  },
  'work-transfer-new': {
    id: 'work-transfer-new',
    label: 'Transfer Work',
    icon: ArrowLeftRight,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'VICE_PRESIDENT', 'PRINCIPAL', 'HOD', 'FACULTY', 'REGISTRAR', 'DEPUTY_REGISTRAR', 'IQAC', 'EXAM_CELL', 'STUDENT_SECTION'],
    category: 'Administration'
  },
  'work-transfer-received': {
    id: 'work-transfer-received',
    label: 'Received Work',
    icon: ArrowLeftRight,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'VICE_PRESIDENT', 'PRINCIPAL', 'HOD', 'FACULTY', 'REGISTRAR', 'DEPUTY_REGISTRAR', 'IQAC', 'EXAM_CELL', 'STUDENT_SECTION'],
    category: 'Administration'
  },
  'work-transfer-active': {
    id: 'work-transfer-active',
    label: 'Active Transfers',
    icon: ArrowLeftRight,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'VICE_PRESIDENT', 'PRINCIPAL', 'HOD', 'FACULTY', 'REGISTRAR', 'DEPUTY_REGISTRAR', 'IQAC', 'EXAM_CELL', 'STUDENT_SECTION'],
    category: 'Administration'
  },
  'work-transfer-history': {
    id: 'work-transfer-history',
    label: 'Transfer History',
    icon: ArrowLeftRight,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'VICE_PRESIDENT', 'PRINCIPAL', 'HOD', 'FACULTY', 'REGISTRAR', 'DEPUTY_REGISTRAR', 'IQAC', 'EXAM_CELL', 'STUDENT_SECTION'],
    category: 'Administration'
  },
  'work-transfer-audit': {
    id: 'work-transfer-audit',
    label: 'Work Transfer Audit Center',
    icon: ShieldCheck,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'VICE_PRESIDENT', 'PRINCIPAL', 'HOD', 'REGISTRAR', 'DEPUTY_REGISTRAR', 'IQAC', 'EXAM_CELL'],
    category: 'Administration'
  },

  // Campus Services & Auxiliary
  'notices': {
    id: 'notices',
    label: 'Notices',
    icon: Bell,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT', 'REGISTRAR'],
    category: 'Campus'
  },
  'events': {
    id: 'events',
    label: 'Events',
    icon: CalendarCheck,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT'],
    category: 'Campus'
  },
  'mentor': {
    id: 'mentor',
    label: 'Mentorship',
    icon: UserCheck,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT'],
    category: 'Support & Campus'
  },
  'mentor-assignment': {
    id: 'mentor-assignment',
    label: 'Mentor Assignment',
    icon: UserCheck,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD'],
    category: 'Academic'
  },
  'tickets': {
    id: 'tickets',
    label: 'Support Tickets',
    icon: HelpCircle,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT', 'HOSTEL_ADMIN', 'MAINTENANCE_ADMIN'],
    category: 'Support & Campus'
  },
  'service-desk': {
    id: 'service-desk',
    label: 'Service Desk',
    icon: HelpCircle,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT', 'HOSTEL_ADMIN', 'MAINTENANCE_ADMIN'],
    category: 'Support & Campus'
  },
  'feedback': {
    id: 'feedback',
    label: 'Feedback',
    icon: MessageSquare,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT', 'IQAC'],
    category: 'Support & Campus'
  },
  'feedback-give': {
    id: 'feedback-give',
    label: 'Give Feedback',
    icon: MessageSquare,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT', 'IQAC'],
    category: 'Support & Campus'
  },
  'feedback-my': {
    id: 'feedback-my',
    label: 'My Feedback',
    icon: MessageSquare,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT', 'IQAC'],
    category: 'Support & Campus'
  },
  'feedback-suggestions': {
    id: 'feedback-suggestions',
    label: 'Suggestions',
    icon: MessageSquare,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT', 'IQAC'],
    category: 'Support & Campus'
  },
  'feedback-anonymous-grievance': {
    id: 'feedback-anonymous-grievance',
    label: 'Anonymous Grievance',
    icon: MessageSquare,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT', 'IQAC'],
    category: 'Support & Campus'
  },
  'feedback-track': {
    id: 'feedback-track',
    label: 'Track Grievance',
    icon: MessageSquare,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT', 'IQAC'],
    category: 'Support & Campus'
  },
  'feedback-reports': {
    id: 'feedback-reports',
    label: 'Reports & Analytics',
    icon: MessageSquare,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'IQAC'],
    category: 'Support & Campus'
  },
  'feedback-escalations': {
    id: 'feedback-escalations',
    label: 'Grievance Escalations',
    icon: ShieldAlert,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'REGISTRAR', 'IQAC'],
    category: 'Support & Campus'
  },
  'edp-duties': {
    id: 'edp-duties',
    label: 'EDP Duties',
    icon: CalendarCheck,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'REGISTRAR', 'IQAC', 'EXAM_CELL', 'STUDENT_SECTION', 'HOSTEL_ADMIN'],
    category: 'Campus'
  },
  'incubation': {
    id: 'incubation',
    label: 'Incubation & Startups',
    icon: Rocket,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT', 'REGISTRAR', 'IQAC'],
    category: 'Campus'
  },
  'library': {
    id: 'library',
    label: 'Library Catalog',
    icon: Library,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT', 'LIBRARY_ADMIN'],
    category: 'Campus'
  },
  'notifications': {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT', 'REGISTRAR', 'IQAC', 'EXAM_CELL', 'STUDENT_SECTION', 'HOSTEL_ADMIN', 'LIBRARY_ADMIN', 'TRANSPORT_ADMIN', 'MAINTENANCE_ADMIN', 'ACCOUNTS_ADMIN'],
    category: 'Campus'
  },

  // Administration Offices Workspaces
  'registrar': {
    id: 'registrar',
    label: 'Registrar Office',
    icon: FileCheck,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'REGISTRAR'],
    category: 'Administration'
  },
  'iqac': {
    id: 'iqac',
    label: 'IQAC Directorate',
    icon: Award,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'IQAC'],
    category: 'Administration'
  },
  'exam-cell': {
    id: 'exam-cell',
    label: 'Exam Controller',
    icon: ShieldCheck,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'EXAM_CELL'],
    category: 'Administration'
  },
  'student-section': {
    id: 'student-section',
    label: 'Student Section',
    icon: FolderCheck,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'STUDENT_SECTION'],
    category: 'Administration'
  },
  'hostel-admin': {
    id: 'hostel-admin',
    label: 'Hostel Office',
    icon: Building2,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'HOSTEL_ADMIN'],
    category: 'Administration'
  },
  'library-admin': {
    id: 'library-admin',
    label: 'Library Office',
    icon: Library,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'LIBRARY_ADMIN'],
    category: 'Administration'
  },
  'transport-admin': {
    id: 'transport-admin',
    label: 'Transport Fleet',
    icon: Clock,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'TRANSPORT_ADMIN'],
    category: 'Administration'
  },
  'maintenance-admin': {
    id: 'maintenance-admin',
    label: 'Campus Services & Maintenance',
    icon: Wrench,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'MAINTENANCE_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT', 'REGISTRAR', 'IQAC', 'EXAM_CELL', 'STUDENT_SECTION', 'HOSTEL_ADMIN', 'LIBRARY_ADMIN', 'TRANSPORT_ADMIN'],
    category: 'Campus'
  },
  'hr': {
    id: 'hr',
    label: 'HR & Staff Management',
    icon: Users2,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'REGISTRAR', 'IQAC'],
    category: 'Finance & Admin'
  },

  // Central University Systems
  'note-sheets': {
    id: 'note-sheets',
    label: 'Notesheet Dashboard',
    icon: FileSignature,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'REGISTRAR', 'IQAC', 'EXAM_CELL', 'STUDENT_SECTION', 'HOSTEL_ADMIN', 'LIBRARY_ADMIN', 'TRANSPORT_ADMIN', 'MAINTENANCE_ADMIN', 'ACCOUNTS_ADMIN'],
    category: 'Administration'
  },
  'notesheet-create': {
    id: 'notesheet-create',
    label: 'Create Notesheet',
    icon: FileText,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'REGISTRAR', 'IQAC', 'EXAM_CELL', 'STUDENT_SECTION', 'HOSTEL_ADMIN', 'LIBRARY_ADMIN', 'TRANSPORT_ADMIN', 'MAINTENANCE_ADMIN', 'ACCOUNTS_ADMIN'],
    category: 'Administration'
  },
  'notesheet-my': {
    id: 'notesheet-my',
    label: 'My Notesheets',
    icon: FileText,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'REGISTRAR', 'IQAC', 'EXAM_CELL', 'STUDENT_SECTION', 'HOSTEL_ADMIN', 'LIBRARY_ADMIN', 'TRANSPORT_ADMIN', 'MAINTENANCE_ADMIN', 'ACCOUNTS_ADMIN'],
    category: 'Administration'
  },
  'notesheet-drafts': {
    id: 'notesheet-drafts',
    label: 'Drafts',
    icon: FileText,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'REGISTRAR', 'IQAC', 'EXAM_CELL', 'STUDENT_SECTION', 'HOSTEL_ADMIN', 'LIBRARY_ADMIN', 'TRANSPORT_ADMIN', 'MAINTENANCE_ADMIN', 'ACCOUNTS_ADMIN'],
    category: 'Administration'
  },
  'notesheet-pending': {
    id: 'notesheet-pending',
    label: 'Pending With Me',
    icon: FileText,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'REGISTRAR', 'IQAC', 'EXAM_CELL', 'STUDENT_SECTION', 'HOSTEL_ADMIN', 'LIBRARY_ADMIN', 'TRANSPORT_ADMIN', 'MAINTENANCE_ADMIN', 'ACCOUNTS_ADMIN'],
    category: 'Administration'
  },
  'notesheet-sent': {
    id: 'notesheet-sent',
    label: 'Forwarded',
    icon: FileText,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'REGISTRAR', 'IQAC', 'EXAM_CELL', 'STUDENT_SECTION', 'HOSTEL_ADMIN', 'LIBRARY_ADMIN', 'TRANSPORT_ADMIN', 'MAINTENANCE_ADMIN', 'ACCOUNTS_ADMIN'],
    category: 'Administration'
  },
  'notesheet-returned': {
    id: 'notesheet-returned',
    label: 'Returned',
    icon: FileText,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'REGISTRAR', 'IQAC', 'EXAM_CELL', 'STUDENT_SECTION', 'HOSTEL_ADMIN', 'LIBRARY_ADMIN', 'TRANSPORT_ADMIN', 'MAINTENANCE_ADMIN', 'ACCOUNTS_ADMIN'],
    category: 'Administration'
  },
  'notesheet-clarification': {
    id: 'notesheet-clarification',
    label: 'Clarification Required',
    icon: FileText,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'REGISTRAR', 'IQAC', 'EXAM_CELL', 'STUDENT_SECTION', 'HOSTEL_ADMIN', 'LIBRARY_ADMIN', 'TRANSPORT_ADMIN', 'MAINTENANCE_ADMIN', 'ACCOUNTS_ADMIN'],
    category: 'Administration'
  },
  'notesheet-action-pending': {
    id: 'notesheet-action-pending',
    label: 'Action Pending',
    icon: FileText,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'REGISTRAR', 'IQAC', 'EXAM_CELL', 'STUDENT_SECTION', 'HOSTEL_ADMIN', 'LIBRARY_ADMIN', 'TRANSPORT_ADMIN', 'MAINTENANCE_ADMIN', 'ACCOUNTS_ADMIN'],
    category: 'Administration'
  },
  'notesheet-approved': {
    id: 'notesheet-approved',
    label: 'Approved',
    icon: FileText,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'REGISTRAR', 'IQAC', 'EXAM_CELL', 'STUDENT_SECTION', 'HOSTEL_ADMIN', 'LIBRARY_ADMIN', 'TRANSPORT_ADMIN', 'MAINTENANCE_ADMIN', 'ACCOUNTS_ADMIN'],
    category: 'Administration'
  },
  'notesheet-rejected': {
    id: 'notesheet-rejected',
    label: 'Rejected',
    icon: FileText,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'REGISTRAR', 'IQAC', 'EXAM_CELL', 'STUDENT_SECTION', 'HOSTEL_ADMIN', 'LIBRARY_ADMIN', 'TRANSPORT_ADMIN', 'MAINTENANCE_ADMIN', 'ACCOUNTS_ADMIN'],
    category: 'Administration'
  },
  'notesheet-closed': {
    id: 'notesheet-closed',
    label: 'Closed',
    icon: FileText,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'REGISTRAR', 'IQAC', 'EXAM_CELL', 'STUDENT_SECTION', 'HOSTEL_ADMIN', 'LIBRARY_ADMIN', 'TRANSPORT_ADMIN', 'MAINTENANCE_ADMIN', 'ACCOUNTS_ADMIN'],
    category: 'Administration'
  },
  'notesheet-history': {
    id: 'notesheet-history',
    label: 'Notesheet History',
    icon: FileText,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'REGISTRAR', 'IQAC', 'EXAM_CELL', 'STUDENT_SECTION', 'HOSTEL_ADMIN', 'LIBRARY_ADMIN', 'TRANSPORT_ADMIN', 'MAINTENANCE_ADMIN', 'ACCOUNTS_ADMIN'],
    category: 'Administration'
  },
  'inward-outward': {
    id: 'inward-outward',
    label: 'Inward & Outward',
    icon: FileText,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'REGISTRAR', 'IQAC', 'EXAM_CELL', 'STUDENT_SECTION', 'HOSTEL_ADMIN', 'LIBRARY_ADMIN', 'TRANSPORT_ADMIN', 'MAINTENANCE_ADMIN', 'ACCOUNTS_ADMIN'],
    category: 'Administration'
  },
  'inventory-assets': {
    id: 'inventory-assets',
    label: 'Inventory & Asset Management',
    icon: Boxes,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'REGISTRAR', 'IQAC', 'EXAM_CELL', 'STUDENT_SECTION', 'HOSTEL_ADMIN', 'LIBRARY_ADMIN', 'TRANSPORT_ADMIN', 'MAINTENANCE_ADMIN', 'ACCOUNTS_ADMIN'],
    category: 'Administration'
  },
  'inventory-dashboard': {
    id: 'inventory-dashboard',
    label: 'Inventory Dashboard',
    icon: Boxes,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'REGISTRAR', 'IQAC', 'EXAM_CELL', 'STUDENT_SECTION', 'HOSTEL_ADMIN', 'LIBRARY_ADMIN', 'TRANSPORT_ADMIN', 'MAINTENANCE_ADMIN', 'ACCOUNTS_ADMIN'],
    category: 'Administration'
  },
  'inventory-assets-register': {
    id: 'inventory-assets-register',
    label: 'Asset Register',
    icon: Package,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'REGISTRAR', 'IQAC', 'EXAM_CELL', 'STUDENT_SECTION', 'HOSTEL_ADMIN', 'LIBRARY_ADMIN', 'TRANSPORT_ADMIN', 'MAINTENANCE_ADMIN', 'ACCOUNTS_ADMIN'],
    category: 'Administration'
  },
  'inventory-stock': {
    id: 'inventory-stock',
    label: 'Consumable Stock Register',
    icon: Layers,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'REGISTRAR', 'IQAC', 'EXAM_CELL', 'STUDENT_SECTION', 'HOSTEL_ADMIN', 'LIBRARY_ADMIN', 'TRANSPORT_ADMIN', 'MAINTENANCE_ADMIN', 'ACCOUNTS_ADMIN'],
    category: 'Administration'
  },
  'inventory-files': {
    id: 'inventory-files',
    label: 'Physical Document Archive',
    icon: Archive,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'REGISTRAR', 'IQAC', 'EXAM_CELL', 'STUDENT_SECTION', 'HOSTEL_ADMIN', 'LIBRARY_ADMIN', 'TRANSPORT_ADMIN', 'MAINTENANCE_ADMIN', 'ACCOUNTS_ADMIN'],
    category: 'Administration'
  },
  'work-diary': {
    id: 'work-diary',
    label: 'Work Diary',
    icon: BookOpen,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'REGISTRAR', 'IQAC', 'EXAM_CELL', 'STUDENT_SECTION', 'HOSTEL_ADMIN', 'LIBRARY_ADMIN', 'TRANSPORT_ADMIN', 'MAINTENANCE_ADMIN', 'ACCOUNTS_ADMIN'],
    category: 'Administration'
  },

  // Master Data & Academic Structures
  'student-search': {
    id: 'student-search',
    label: 'Student Search',
    icon: Search,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'MENTOR', 'REGISTRAR', 'DEPUTY_REGISTRAR', 'VICE_PRESIDENT', 'EXAM_CELL', 'STUDENT_SECTION', 'ACCOUNTS_ADMIN', 'HOSTEL_ADMIN', 'LIBRARY_ADMIN', 'TRANSPORT_ADMIN', 'MAINTENANCE_ADMIN', 'IQAC'],
    category: 'Master'
  },
  'students': {
    id: 'students',
    label: 'Students Directory',
    icon: Users2,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'REGISTRAR', 'STUDENT_SECTION', 'ACCOUNTS_ADMIN', 'HOSTEL_ADMIN', 'TRANSPORT_ADMIN'],
    category: 'Master'
  },
  'faculty': {
    id: 'faculty',
    label: 'Faculty Directory',
    icon: UserCheck,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'REGISTRAR', 'IQAC'],
    category: 'Master'
  },
  'departments': {
    id: 'departments',
    label: 'Departments',
    icon: Building2,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'REGISTRAR'],
    category: 'Master'
  },
  'programs': {
    id: 'programs',
    label: 'Programs & Courses',
    icon: GraduationCap,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'REGISTRAR'],
    category: 'Master'
  },
  'document-master': {
    id: 'document-master',
    label: 'Document Master',
    icon: FileText,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'REGISTRAR', 'STUDENT_SECTION'],
    category: 'Master'
  },

  // System & Administration Tools
  'reports': {
    id: 'reports',
    label: 'Official Reports',
    icon: BarChart3,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT', 'REGISTRAR', 'IQAC', 'EXAM_CELL', 'ACCOUNTS_ADMIN', 'HOSTEL_ADMIN', 'TRANSPORT_ADMIN'],
    category: 'System'
  },
  'bulk-import': {
    id: 'bulk-import',
    label: 'Bulk Excel Import',
    icon: UploadCloud,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'EXAM_CELL', 'PRINCIPAL', 'HOD', 'REGISTRAR', 'HOSTEL_ADMIN', 'TRANSPORT_ADMIN', 'ACCOUNTS_ADMIN'],
    category: 'System'
  },
  'security-audit': {
    id: 'security-audit',
    label: 'Security & Audit',
    icon: ShieldCheck,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'REGISTRAR'],
    category: 'System'
  },
  'settings': {
    id: 'settings',
    label: 'System Settings',
    icon: Settings,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'ERP_COORDINATOR', 'REGISTRAR'],
    category: 'System'
  },
  'profile': {
    id: 'profile',
    label: 'My Profile',
    icon: User,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT', 'REGISTRAR', 'IQAC', 'EXAM_CELL', 'STUDENT_SECTION', 'HOSTEL_ADMIN', 'LIBRARY_ADMIN', 'TRANSPORT_ADMIN', 'MAINTENANCE_ADMIN', 'ACCOUNTS_ADMIN'],
    category: 'System'
  },

  // ─── STAGE 1: MODULAR ENTERPRISE EXTENSIONS ───
  'org-governance': {
    id: 'org-governance',
    label: 'Organization Governance',
    icon: Landmark,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'REGISTRAR', 'PRINCIPAL', 'HOD'],
    category: 'Administration'
  },
  'rbac-matrix': {
    id: 'rbac-matrix',
    label: 'Roles & Permissions (RBAC)',
    icon: ShieldCheck,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'REGISTRAR'],
    category: 'Administration'
  },
  'db-health': {
    id: 'db-health',
    label: 'Database Architecture & Health',
    icon: Landmark,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN'],
    category: 'System'
  },

  // ─── STAGE 2: STUDENT & STAFF MANAGEMENT HUBS ───
  'students-hub': {
    id: 'students-hub',
    label: 'Student Management Hub',
    icon: Users,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'REGISTRAR', 'PRINCIPAL', 'HOD', 'STUDENT_SECTION'],
    category: 'Administration'
  },
  'staff-hub': {
    id: 'staff-hub',
    label: 'Staff & Faculty Hub',
    icon: Briefcase,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'REGISTRAR', 'PRINCIPAL', 'HOD'],
    category: 'Administration'
  },

  // ─── STAGE 3: HR, ATTENDANCE, FEES & FINANCE HUBS ───
  'hr-hub': {
    id: 'hr-hub',
    label: 'HR Management Hub',
    icon: Briefcase,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'REGISTRAR', 'PRINCIPAL', 'HOD'],
    category: 'Administration'
  },
  'attendance-hub': {
    id: 'attendance-hub',
    label: 'Attendance Intelligence Hub',
    icon: UserCheck,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'REGISTRAR', 'PRINCIPAL', 'HOD', 'FACULTY'],
    category: 'Academic'
  },
  'fees-hub': {
    id: 'fees-hub',
    label: 'Fee Operations Hub',
    icon: IndianRupee,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'REGISTRAR', 'ACCOUNTS_ADMIN', 'PRINCIPAL', 'HOD'],
    category: 'Finance & Admin'
  },
  'finance-hub': {
    id: 'finance-hub',
    label: 'Institutional Finance Hub',
    icon: Landmark,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'REGISTRAR', 'ACCOUNTS_ADMIN', 'PRINCIPAL', 'HOD'],
    category: 'Finance & Admin'
  },
  'timetable-generator': {
    id: 'timetable-generator',
    label: 'Timetable Generator',
    icon: Clock,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'REGISTRAR', 'PRINCIPAL', 'HOD', 'FACULTY'],
    category: 'Academic'
  },
  'examination-hub': {
    id: 'examination-hub',
    label: 'Examination & Results Engine',
    icon: Award,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'REGISTRAR', 'EXAM_CELL', 'PRINCIPAL', 'HOD', 'FACULTY'],
    category: 'Examinations'
  },
  'lms-hub': {
    id: 'lms-hub',
    label: 'LMS & Course Hub',
    icon: BookOpen,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'REGISTRAR', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT'],
    category: 'Academic'
  },
  'dms-hub': {
    id: 'dms-hub',
    label: 'Document Management (DMS & OCR)',
    icon: FileText,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'REGISTRAR', 'PRINCIPAL', 'HOD', 'FACULTY'],
    category: 'Administration'
  }
};

export interface StudentNavSubItem {
  id: string;
  label: string;
  targetTab: string;
  subTab?: string;
}

export interface StudentNavGroup {
  id: string;
  label: string;
  icon: any;
  defaultTab: string;
  category?: string;
  children?: StudentNavSubItem[];
}

/**
 * UNIFIED RESEARCH & INNOVATION NAVIGATION GROUP (Stage 10.1 / 10.2)
 */
export const COMMON_RESEARCH_INNOVATION_NAV_GROUP: StudentNavGroup = {
  id: 'research-innovation-group',
  label: 'Research & Innovation',
  icon: BookOpen,
  defaultTab: 'research',
  category: '🎓 ACADEMIC',
  children: [
    { id: 'nav-research-dashboard', label: 'Research Dashboard', targetTab: 'research' },
    { id: 'nav-research-projects', label: 'Research Projects', targetTab: 'research-projects' },
    { id: 'nav-publications', label: 'Publications', targetTab: 'publications' },
    { id: 'nav-patents', label: 'Patents / Intellectual Property', targetTab: 'patents' },
    { id: 'nav-conferences', label: 'Conferences / Research Activities', targetTab: 'research-conferences' },
    { id: 'nav-grants', label: 'Funding / Grants', targetTab: 'research-grants' },
    { id: 'nav-scholars', label: 'Research Scholars / Students', targetTab: 'research-scholars' },
    { id: 'nav-innovations', label: 'Innovation / Startup Activities', targetTab: 'startup-grants' },
    { id: 'nav-reports', label: 'Reports & Analytics', targetTab: 'research-reports' },
  ]
};

export const STUDENT_RESEARCH_INNOVATION_NAV_GROUP: StudentNavGroup = {
  id: 'student-research-innovation-group',
  label: 'Research & Innovation',
  icon: BookOpen,
  defaultTab: 'startup-grants',
  children: [
    { id: 'nav-student-innovations', label: 'Innovation / Startup Activities', targetTab: 'startup-grants' },
    { id: 'nav-student-research-projects', label: 'Research Projects', targetTab: 'research-projects' },
    { id: 'nav-student-publications', label: 'Publications', targetTab: 'publications' },
    { id: 'nav-student-patents', label: 'Patents / Intellectual Property', targetTab: 'patents' },
  ]
};

/**
 * CANONICAL GRANTS & SSIP NAVIGATION GROUP (Stage 10.2)
 */
export const COMMON_GRANTS_SSIP_NAV_GROUP: StudentNavGroup = {
  id: 'grants-ssip-group',
  label: 'Grants & SSIP',
  icon: Wallet,
  defaultTab: 'grants',
  category: '🎓 ACADEMIC',
  children: [
    { id: 'nav-grants-dashboard', label: 'Grants Dashboard', targetTab: 'grants' },
    { id: 'nav-grant-opportunities', label: 'Grant Opportunities', targetTab: 'grant-opportunities' },
    { id: 'nav-grant-applications', label: 'Grant Applications', targetTab: 'grant-applications' },
    { id: 'nav-grant-research', label: 'Research Grants', targetTab: 'research-grants' },
    { id: 'nav-grant-ssip', label: 'SSIP Projects', targetTab: 'ssip-projects' },
    { id: 'nav-grant-disbursements', label: 'Funding / Disbursements', targetTab: 'grant-disbursements' },
    { id: 'nav-grant-milestones', label: 'Milestones', targetTab: 'grant-milestones' },
    { id: 'nav-grant-utilization', label: 'Utilization / Expenses', targetTab: 'grant-utilization' },
    { id: 'nav-grant-documents', label: 'Grant Documents', targetTab: 'grant-documents' },
    { id: 'nav-grant-reports', label: 'Grant Reports', targetTab: 'grant-reports' },
  ]
};

export const STUDENT_GRANTS_SSIP_NAV_GROUP: StudentNavGroup = {
  id: 'student-grants-ssip-group',
  label: 'Grants & SSIP',
  icon: Wallet,
  defaultTab: 'ssip-projects',
  children: [
    { id: 'nav-stu-ssip-projects', label: 'SSIP Projects', targetTab: 'ssip-projects' },
    { id: 'nav-stu-grant-opportunities', label: 'Grant Opportunities', targetTab: 'grant-opportunities' },
    { id: 'nav-stu-grant-applications', label: 'Grant Applications', targetTab: 'grant-applications' },
    { id: 'nav-stu-grant-milestones', label: 'Milestones', targetTab: 'grant-milestones' },
    { id: 'nav-stu-grant-utilization', label: 'Utilization / Expenses', targetTab: 'grant-utilization' },
  ]
};

/**
 * EXACT 10-Item Structured Student Navigation Specification (Section 1)
 */
export const STUDENT_NAVIGATION_STRUCTURE: StudentNavGroup[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    defaultTab: 'dashboard'
  },
  {
    id: 'student-digilocker',
    label: 'DigiLocker & Documents',
    icon: ShieldCheck,
    defaultTab: 'digilocker-documents'
  },
  {
    id: 'student-abc',
    label: 'Academic Credits / ABC',
    icon: Award,
    defaultTab: 'abc-credits'
  },
  {
    id: 'academic',
    label: 'Academic',
    icon: GraduationCap,
    defaultTab: 'subjects',
    children: [
      { id: 'academic-subjects', label: 'My Subjects', targetTab: 'subjects' },
      { id: 'academic-abc-credits', label: 'ABC Credits Ledger', targetTab: 'abc-credits' },
      { id: 'academic-timetable', label: 'Time Table', targetTab: 'timetable' },
      { id: 'academic-attendance', label: 'Attendance', targetTab: 'attendance' },
      { id: 'academic-assignments', label: 'Assignments', targetTab: 'assignments' },
      { id: 'academic-materials', label: 'Digital Repository', targetTab: 'materials' },
      { id: 'academic-quiz', label: 'Quiz', targetTab: 'quiz' }
    ]
  },
  {
    id: 'examination',
    label: 'Examination',
    icon: FileCheck,
    defaultTab: 'exam-forms',
    children: [
      { id: 'exam-forms', label: 'Exam Forms', targetTab: 'exam-forms' },
      { id: 'exam-fees-student', label: 'Exam Fees', targetTab: 'exam-fees-student' },
      { id: 'exam-backlog', label: 'Backlog / Re-Exam', targetTab: 'exam-backlog' },
      { id: 'exam-reassessment', label: 'Reassessment / Rechecking', targetTab: 'exam-reassessment' },
      { id: 'exam-hallticket', label: 'Hall Ticket', targetTab: 'exam-hallticket' },
      { id: 'exam-results', label: 'Results', targetTab: 'exam-results' }
    ]
  },
  {
    id: 'fees',
    label: 'Fees & Payments',
    icon: IndianRupee,
    defaultTab: 'fees-semester',
    children: [
      { id: 'fees-semester', label: 'Semester Fees', targetTab: 'fees-semester' }
    ]
  },
  {
    id: 'student-section',
    label: 'Student Section',
    icon: Award,
    defaultTab: 'student-section-services',
    children: [
      { id: 'student-section-services', label: 'Services', targetTab: 'student-section-services' },
      { id: 'student-section-requests', label: 'My Requests', targetTab: 'student-section-requests' },
      { id: 'student-digilocker-documents', label: 'DigiLocker & Documents', targetTab: 'digilocker-documents' },
      { id: 'student-section-documents', label: 'My Documents', targetTab: 'student-section-documents' },
      { id: 'id-card', label: 'Digital ID Card', targetTab: 'id-card' }
    ]
  },
  {
    id: 'requests',
    label: 'Requests',
    icon: CheckSquare,
    defaultTab: 'requests-my-requests',
    children: [
      { id: 'requests-subject-query', label: 'Subject Query', targetTab: 'requests-subject-query' },
      { id: 'requests-complaint', label: 'General Complaint', targetTab: 'requests-complaint' },
      { id: 'requests-my-requests', label: 'My Requests', targetTab: 'requests-my-requests' }
    ]
  },
  STUDENT_RESEARCH_INNOVATION_NAV_GROUP,
  STUDENT_GRANTS_SSIP_NAV_GROUP,
  {
    id: 'feedback',
    label: 'Feedback',
    icon: MessageSquare,
    defaultTab: 'feedback-give',
    children: [
      { id: 'feedback-give', label: 'Student Feedback', targetTab: 'feedback-give' },
      { id: 'feedback-anonymous-grievance', label: 'Anonymous Grievance', targetTab: 'feedback-anonymous-grievance' },
      { id: 'feedback-track', label: 'Track Grievance', targetTab: 'feedback-track' },
      { id: 'feedback-my', label: 'My Feedback', targetTab: 'feedback-my' },
      { id: 'feedback-suggestions', label: 'Suggestions', targetTab: 'feedback-suggestions' }
    ]
  },
  {
    id: 'student-ptm',
    label: 'PTM Consultation',
    icon: Users,
    defaultTab: 'student-ptm'
  },
  {
    id: 'notices',
    label: 'Notice',
    icon: Bell,
    defaultTab: 'notices'
  },
  {
    id: 'events',
    label: 'Events',
    icon: CalendarCheck,
    defaultTab: 'events'
  },
  {
    id: 'hostel',
    label: 'Hostel',
    icon: Building2,
    defaultTab: 'hostel'
  },
  {
    id: 'transport',
    label: 'Transport',
    icon: Clock,
    defaultTab: 'transport'
  },
  {
    id: 'service-desk',
    label: 'Service Desk',
    icon: HelpCircle,
    defaultTab: 'tickets'
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    defaultTab: 'notifications'
  }
];

/**
 * COMMON AUTHORIZED NOTESHEET NAVIGATION ITEM (Single Entry -> Opens Notesheet Dashboard)
 */
export const COMMON_NOTESHEET_NAV_GROUP: StudentNavGroup = {
  id: 'note-sheets',
  label: 'Notesheet',
  icon: FileSignature,
  defaultTab: 'note-sheets'
};

/**
 * COMMON AUTHORIZED PTM MANAGEMENT NAVIGATION ITEM
 */
export const COMMON_PTM_NAV_GROUP: StudentNavGroup = {
  id: 'ptm-management',
  label: 'PTM Management',
  icon: Users,
  defaultTab: 'ptm-dashboard',
  children: [
    { id: 'ptm-dashboard-item', label: 'Dashboard', targetTab: 'ptm-dashboard' },
    { id: 'ptm-schedule-item', label: 'PTM Schedule', targetTab: 'ptm-schedule' },
    { id: 'ptm-my-item', label: 'My PTMs', targetTab: 'ptm-my' },
    { id: 'ptm-records-item', label: 'PTM Records', targetTab: 'ptm-records' },
    { id: 'ptm-feedback-item', label: 'Parent Feedback', targetTab: 'ptm-feedback' },
    { id: 'ptm-followups-item', label: 'Follow-up Actions', targetTab: 'ptm-followups' },
    { id: 'ptm-reports-item', label: 'Reports', targetTab: 'ptm-reports' }
  ]
};

/**
 * COMMON WORKLOAD & WORK TRANSFER / DELEGATION NAVIGATION GROUP
 */
export const COMMON_WORK_TRANSFER_NAV_GROUP: StudentNavGroup = {
  id: 'work-transfer-group',
  label: 'Workload & Transfer',
  icon: ArrowLeftRight,
  defaultTab: 'work-transfer',
  children: [
    { id: 'workload-my-work', label: 'My Work', targetTab: 'work-transfer' },
    { id: 'workload-transfer-action', label: 'Transfer Work', targetTab: 'work-transfer-new' },
    { id: 'workload-received', label: 'Received Work', targetTab: 'work-transfer-received' },
    { id: 'workload-active', label: 'Active Transfers', targetTab: 'work-transfer-active' },
    { id: 'workload-history', label: 'Transfer History', targetTab: 'work-transfer-history' }
  ]
};

/**
 * HIGHER AUTHORITY WORKLOAD & WORK TRANSFER AUDIT NAVIGATION GROUP
 */
export const HIGHER_AUTHORITY_WORK_TRANSFER_NAV_GROUP: StudentNavGroup = {
  id: 'work-transfer-group',
  label: 'Workload & Transfer Audit',
  icon: ArrowLeftRight,
  defaultTab: 'work-transfer-audit',
  children: [
    { id: 'workload-active', label: 'Active Transfers', targetTab: 'work-transfer-active' },
    { id: 'workload-history', label: 'Transfer History', targetTab: 'work-transfer-history' },
    { id: 'workload-audit', label: 'Work Transfer Audit', targetTab: 'work-transfer-audit' }
  ]
};

/**
 * COMMON AUTHORIZED ACCREDITATION & NAAC/NBA NAVIGATION GROUP
 */
export const COMMON_ACCREDITATION_NAV_GROUP: StudentNavGroup = {
  id: 'accreditation-group',
  label: 'Accreditation',
  icon: Award,
  defaultTab: 'accreditation',
  category: '🎓 ACADEMIC',
  children: [
    { id: 'accreditation-overview', label: 'Accreditation Overview', targetTab: 'accreditation' },
    { id: 'accreditation-naac', label: 'NAAC (7 Criteria)', targetTab: 'accreditation-naac' },
    { id: 'accreditation-nba', label: 'NBA (10 Criteria OBE)', targetTab: 'accreditation-nba' },
    { id: 'accreditation-evidence', label: 'Evidence Repository', targetTab: 'accreditation-evidence' },
    { id: 'accreditation-reports', label: 'SSR / SAR Snapshots & Export', targetTab: 'accreditation-reports' },
  ]
};

/**
 * COMMON AUTHORIZED OUTCOME-BASED EDUCATION (OBE) NAVIGATION GROUP
 */
export const COMMON_OBE_NAV_GROUP: StudentNavGroup = {
  id: 'obe-group',
  label: 'Outcome Based Education (OBE)',
  icon: GraduationCap,
  defaultTab: 'obe',
  category: '🎓 ACADEMIC',
  children: [
    { id: 'obe-overview', label: 'OBE Overview', targetTab: 'obe' },
  ]
};

/**
 * EXACT Structured Faculty Navigation Specification
 */
export const FACULTY_NAVIGATION_STRUCTURE: StudentNavGroup[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    defaultTab: 'dashboard'
  },
  {
    id: 'academic',
    label: 'Academic',
    icon: GraduationCap,
    defaultTab: 'subjects',
    children: [
      { id: 'faculty-subjects', label: 'My Subjects', targetTab: 'subjects' },
      { id: 'faculty-timetable', label: 'Time Table', targetTab: 'timetable' },
      { id: 'faculty-session-plan', label: 'Session Plan', targetTab: 'session-plan' },
      { id: 'faculty-materials', label: 'Study Material', targetTab: 'materials' },
      { id: 'faculty-assignments', label: 'Assignments', targetTab: 'assignments' },
      { id: 'faculty-quiz', label: 'Quiz', targetTab: 'quiz' },
      { id: 'faculty-calendar', label: 'Academic Calendar', targetTab: 'calendar' }
    ]
  },
  {
    id: 'attendance',
    label: 'Attendance',
    icon: UserCheck,
    defaultTab: 'attendance',
    children: [
      { id: 'faculty-mark-attendance', label: 'Mark Attendance', targetTab: 'attendance' },
      { id: 'faculty-attendance-history', label: 'Attendance History', targetTab: 'attendance-history' },
      { id: 'faculty-subject-attendance', label: 'Subject Attendance', targetTab: 'subject-attendance' },
      { id: 'faculty-attendance-reports', label: 'Reports', targetTab: 'attendance-reports' },
      { id: 'faculty-attendance-import', label: 'Import / Export', targetTab: 'attendance-import' }
    ]
  },
  {
    id: 'examination',
    label: 'Examination',
    icon: FileCheck,
    defaultTab: 'exam-duties',
    children: [
      { id: 'faculty-exam-duties', label: 'My Exam Duties', targetTab: 'exam-duties' },
      { id: 'faculty-exam-schedule', label: 'Exam Related Tasks', targetTab: 'exam-schedule' },
      { id: 'faculty-attendance-apps', label: 'Student Attendance Applications', targetTab: 'attendance-applications' },
      { id: 'faculty-exam-info', label: 'Exam Information', targetTab: 'exam-dashboard' }
    ]
  },
  {
    id: 'students',
    label: 'Students',
    icon: Users2,
    defaultTab: 'my-students',
    children: [
      { id: 'faculty-my-students', label: 'My Students', targetTab: 'my-students' }
    ]
  },
  COMMON_PTM_NAV_GROUP,
  COMMON_WORK_TRANSFER_NAV_GROUP,
  COMMON_ACCREDITATION_NAV_GROUP,
  COMMON_OBE_NAV_GROUP,
  COMMON_RESEARCH_INNOVATION_NAV_GROUP,
  COMMON_GRANTS_SSIP_NAV_GROUP,
  {
    id: 'requests',
    label: 'Requests',
    icon: CheckSquare,
    defaultTab: 'requests-my-requests'
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: FolderCheck,
    defaultTab: 'student-documents',
    children: [
      { id: 'faculty-student-docs', label: 'Student Documents', targetTab: 'student-documents' },
      { id: 'faculty-pending-verification', label: 'Pending Verification', targetTab: 'pending-verification' }
    ]
  },
  COMMON_NOTESHEET_NAV_GROUP,
  {
    id: 'feedback',
    label: 'Feedback',
    icon: MessageSquare,
    defaultTab: 'feedback',
    children: [
      { id: 'faculty-student-feedback', label: 'Student Feedback', targetTab: 'feedback' }
    ]
  },
  {
    id: 'notices',
    label: 'Notices',
    icon: Bell,
    defaultTab: 'notices'
  },
  {
    id: 'events',
    label: 'Events',
    icon: CalendarCheck,
    defaultTab: 'events'
  },
  {
    id: 'inventory-assets',
    label: 'Inventory & Assets',
    icon: Boxes,
    defaultTab: 'inventory-assets'
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    defaultTab: 'notifications'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    defaultTab: 'settings'
  }
];

/**
 * FINAL MENTOR SIDEBAR STRUCTURE (14 Sections)
 */
export const MENTOR_NAVIGATION_STRUCTURE: StudentNavGroup[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    defaultTab: 'dashboard'
  },
  {
    id: 'mentees-group',
    label: 'My Mentees',
    icon: GraduationCap,
    defaultTab: 'mentee-list',
    children: [
      { id: 'mentee-list', label: 'Mentee List', targetTab: 'mentee-list' }
    ]
  },
  {
    id: 'academic-group',
    label: 'Academic',
    icon: BookOpen,
    defaultTab: 'mentee-subjects',
    children: [
      { id: 'mentee-subjects', label: 'My Subjects', targetTab: 'mentee-subjects' },
      { id: 'mentor-session-plan', label: 'Session Plan', targetTab: 'session-plan' },
      { id: 'mentor-study-material', label: 'Study Material', targetTab: 'study-material' }
    ]
  },
  {
    id: 'attendance-group',
    label: 'Attendance',
    icon: Clock,
    defaultTab: 'mentee-attendance-overview',
    children: [
      { id: 'mentee-attendance-overview', label: 'Mentee Attendance', targetTab: 'mentee-attendance-overview' },
      { id: 'mentee-attendance-reports', label: 'Attendance Reports', targetTab: 'attendance-reports' }
    ]
  },
  {
    id: 'examination-group',
    label: 'Examination',
    icon: Award,
    defaultTab: 'mentee-exam-eligibility',
    children: [
      { id: 'mentee-exam-eligibility', label: 'Exam Eligibility', targetTab: 'mentee-exam-eligibility' },
      { id: 'mentee-exam-attendance-approvals', label: 'Attendance Approvals', targetTab: 'mentee-exam-attendance-approvals' },
      { id: 'mentee-exam-requests', label: 'Exam Related Requests', targetTab: 'mentee-exam-requests' }
    ]
  },
  {
    id: 'documents-group',
    label: 'Student Documents',
    icon: FolderCheck,
    defaultTab: 'mentee-docs-pending',
    children: [
      { id: 'mentee-docs-pending', label: 'Pending Verification', targetTab: 'mentee-docs-pending' },
      { id: 'mentee-docs-verified', label: 'Verified Documents', targetTab: 'mentee-docs-verified' },
      { id: 'mentee-docs-history', label: 'Document History', targetTab: 'mentee-docs-history' }
    ]
  },
  {
    id: 'requests-group',
    label: 'Student Requests',
    icon: MessageSquare,
    defaultTab: 'mentee-requests-pending'
  },
  {
    id: 'counseling-group',
    label: 'Counseling',
    icon: Calendar,
    defaultTab: 'counseling',
    children: [
      { id: 'mentor-counseling-sessions', label: 'Counseling Sessions', targetTab: 'counseling' }
    ]
  },
  COMMON_NOTESHEET_NAV_GROUP,
  COMMON_WORK_TRANSFER_NAV_GROUP,
  COMMON_RESEARCH_INNOVATION_NAV_GROUP,
  COMMON_GRANTS_SSIP_NAV_GROUP,
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    defaultTab: 'notifications'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    defaultTab: 'settings'
  }
];

/**
 * FINAL HOD SIDEBAR STRUCTURE (16 Sections)
 */
export const HOD_NAVIGATION_STRUCTURE: StudentNavGroup[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    defaultTab: 'dashboard'
  },
  {
    id: 'department-group',
    label: 'Department',
    icon: Building2,
    defaultTab: 'hod-dept-overview',
    children: [
      { id: 'hod-dept-overview', label: 'Department Overview', targetTab: 'hod-dept-overview' },
      { id: 'hod-dept-students', label: 'Students', targetTab: 'hod-dept-students' },
      { id: 'hod-dept-faculty', label: 'Faculty', targetTab: 'hod-dept-faculty' },
      { id: 'hod-dept-programs', label: 'Programs', targetTab: 'hod-dept-programs' },
      { id: 'hod-dept-semesters', label: 'Semesters', targetTab: 'hod-dept-semesters' },
      { id: 'hod-dept-sections', label: 'Sections', targetTab: 'hod-dept-sections' }
    ]
  },
  {
    id: 'academic-group',
    label: 'Academic',
    icon: BookOpen,
    defaultTab: 'hod-academic-subjects',
    children: [
      { id: 'hod-academic-subjects', label: 'Subjects', targetTab: 'hod-academic-subjects' },
      { id: 'hod-faculty-allocation', label: 'Faculty Subject Allocation', targetTab: 'hod-faculty-allocation' },
      { id: 'hod-timetable', label: 'Timetable', targetTab: 'hod-timetable' },
      { id: 'hod-session-plans', label: 'Session Plans', targetTab: 'hod-session-plans' },
      { id: 'hod-materials', label: 'Study Material', targetTab: 'hod-materials' },
      { id: 'hod-assignments', label: 'Assignments', targetTab: 'hod-assignments' },
      { id: 'hod-quiz', label: 'Quiz', targetTab: 'hod-quiz' },
      { id: 'hod-calendar', label: 'Academic Calendar', targetTab: 'hod-calendar' }
    ]
  },
  {
    id: 'attendance-group',
    label: 'Attendance',
    icon: Clock,
    defaultTab: 'hod-attendance-overview',
    children: [
      { id: 'hod-attendance-overview', label: 'Department Attendance', targetTab: 'hod-attendance-overview' },
      { id: 'hod-attendance-shortage', label: 'Attendance Shortage', targetTab: 'hod-attendance-shortage' },
      { id: 'hod-subject-attendance', label: 'Subject-wise Attendance', targetTab: 'hod-subject-attendance' },
      { id: 'hod-attendance-approvals', label: 'Attendance Approvals', targetTab: 'hod-attendance-approvals' }
    ]
  },
  {
    id: 'students-group',
    label: 'Students',
    icon: GraduationCap,
    defaultTab: 'hod-students-list',
    children: [
      { id: 'hod-students-list', label: 'Student List', targetTab: 'hod-students-list' }
    ]
  },
  {
    id: 'faculty-group',
    label: 'Faculty',
    icon: UserCheck,
    defaultTab: 'hod-faculty-list',
    children: [
      { id: 'hod-faculty-list', label: 'Faculty List', targetTab: 'hod-faculty-list' },
      { id: 'hod-faculty-workload', label: 'Faculty Workload', targetTab: 'hod-faculty-workload' },
      { id: 'hod-faculty-subject-allocation', label: 'Subject Allocation', targetTab: 'hod-faculty-subject-allocation' },
      { id: 'hod-faculty-performance', label: 'Faculty Performance', targetTab: 'hod-faculty-performance' }
    ]
  },
  {
    id: 'examination-group',
    label: 'Examination',
    icon: Award,
    defaultTab: 'hod-exam-eligibility',
    children: [
      { id: 'hod-exam-eligibility', label: 'Exam Eligibility', targetTab: 'hod-exam-eligibility' },
      { id: 'hod-exam-attendance-approvals', label: 'Attendance Approvals', targetTab: 'hod-exam-attendance-approvals' },
      { id: 'hod-exam-info', label: 'Exam Information', targetTab: 'hod-exam-info' },
      { id: 'hod-exam-requests', label: 'Exam Requests', targetTab: 'hod-exam-requests' }
    ]
  },
  {
    id: 'requests-group',
    label: 'Requests',
    icon: MessageSquare,
    defaultTab: 'hod-requests-pending'
  },
  {
    id: 'documents-group',
    label: 'Documents',
    icon: FolderCheck,
    defaultTab: 'hod-docs-students',
    children: [
      { id: 'hod-docs-students', label: 'Student Documents', targetTab: 'hod-docs-students' },
      { id: 'hod-docs-overview', label: 'Verification Overview', targetTab: 'hod-docs-overview' }
    ]
  },
  COMMON_NOTESHEET_NAV_GROUP,
  COMMON_ACCREDITATION_NAV_GROUP,
  COMMON_OBE_NAV_GROUP,
  COMMON_RESEARCH_INNOVATION_NAV_GROUP,
  COMMON_GRANTS_SSIP_NAV_GROUP,
  {
    id: 'feedback-group',
    label: 'Feedback',
    icon: BarChart3,
    defaultTab: 'hod-feedback-department',
    children: [
      { id: 'hod-feedback-faculty', label: 'Faculty Feedback', targetTab: 'hod-feedback-faculty' },
      { id: 'hod-feedback-student', label: 'Student Feedback', targetTab: 'hod-feedback-student' },
      { id: 'hod-feedback-department', label: 'Department Feedback', targetTab: 'hod-feedback-department' }
    ]
  },
  {
    id: 'resource-assets-group',
    label: 'Department Resources & Assets',
    icon: Package,
    defaultTab: 'university-asset-management',
    children: [
      { id: 'university-asset-management', label: 'My Department Assets', targetTab: 'university-asset-management' },
      { id: 'asset-allocation-requests', label: 'Asset Requisitions', targetTab: 'asset-allocation-requests' },
      { id: 'classroom-allocation', label: 'Allocated Classrooms & Labs', targetTab: 'classroom-allocation' }
    ]
  },
  {
    id: 'notices',
    label: 'Notices',
    icon: Bell,
    defaultTab: 'notices'
  },
  {
    id: 'events',
    label: 'Events',
    icon: CalendarCheck,
    defaultTab: 'events'
  },
  {
    id: 'reports-group',
    label: 'Reports',
    icon: FileSpreadsheet,
    defaultTab: 'hod-reports-academic',
    children: [
      { id: 'hod-reports-academic', label: 'Academic Reports', targetTab: 'hod-reports-academic' },
      { id: 'hod-reports-attendance', label: 'Attendance Reports', targetTab: 'hod-reports-attendance' },
      { id: 'hod-reports-student', label: 'Student Reports', targetTab: 'hod-reports-student' },
      { id: 'hod-reports-faculty', label: 'Faculty Reports', targetTab: 'hod-reports-faculty' },
      { id: 'hod-reports-department', label: 'Department Reports', targetTab: 'hod-reports-department' }
    ]
  },
  HIGHER_AUTHORITY_WORK_TRANSFER_NAV_GROUP,
  {
    id: 'inventory-assets',
    label: 'Inventory & Assets',
    icon: Boxes,
    defaultTab: 'inventory-assets'
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    defaultTab: 'notifications'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    defaultTab: 'settings'
  }
];

/**
 * FINAL HOI / PRINCIPAL SIDEBAR STRUCTURE (16 Sections)
 */
export const PRINCIPAL_NAVIGATION_STRUCTURE: StudentNavGroup[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    defaultTab: 'dashboard'
  },
  {
    id: 'institute-group',
    label: 'Institute',
    icon: Building2,
    defaultTab: 'hoi-inst-overview',
    children: [
      { id: 'hoi-inst-overview', label: 'Institute Overview', targetTab: 'hoi-inst-overview' },
      { id: 'hoi-inst-departments', label: 'Departments', targetTab: 'hoi-inst-departments' },
      { id: 'hoi-inst-hods', label: 'HODs', targetTab: 'hoi-inst-hods' },
      { id: 'hoi-inst-programs', label: 'Programs', targetTab: 'hoi-inst-programs' },
      { id: 'hoi-inst-faculty', label: 'Faculty', targetTab: 'hoi-inst-faculty' },
      { id: 'hoi-inst-students', label: 'Students', targetTab: 'hoi-inst-students' },
      { id: 'hoi-inst-sections', label: 'Sections', targetTab: 'hoi-inst-sections' }
    ]
  },
  {
    id: 'academic-group',
    label: 'Academic',
    icon: BookOpen,
    defaultTab: 'hoi-academic-overview',
    children: [
      { id: 'hoi-academic-overview', label: 'Academic Overview', targetTab: 'hoi-academic-overview' },
      { id: 'hoi-academic-programs', label: 'Programs', targetTab: 'hoi-academic-programs' },
      { id: 'hoi-academic-subjects', label: 'Subjects', targetTab: 'hoi-academic-subjects' },
      { id: 'hoi-academic-allocation', label: 'Faculty Allocation', targetTab: 'hoi-academic-allocation' },
      { id: 'hoi-timetable', label: 'Timetable', targetTab: 'hoi-timetable' },
      { id: 'hoi-session-plans', label: 'Session Plans', targetTab: 'hoi-session-plans' },
      { id: 'hoi-calendar', label: 'Academic Calendar', targetTab: 'hoi-calendar' },
      { id: 'hoi-academic-performance', label: 'Academic Performance', targetTab: 'hoi-academic-performance' }
    ]
  },
  {
    id: 'students-group',
    label: 'Students',
    icon: GraduationCap,
    defaultTab: 'hoi-students-list',
    children: [
      { id: 'hoi-students-list', label: 'Student List', targetTab: 'hoi-students-list' }
    ]
  },
  {
    id: 'faculty-group',
    label: 'Faculty',
    icon: UserCheck,
    defaultTab: 'hoi-faculty-list',
    children: [
      { id: 'hoi-faculty-list', label: 'Faculty List', targetTab: 'hoi-faculty-list' },
      { id: 'hoi-faculty-workload', label: 'Faculty Workload', targetTab: 'hoi-faculty-workload' },
      { id: 'hoi-faculty-allocation', label: 'Faculty Allocation', targetTab: 'hoi-faculty-allocation' },
      { id: 'hoi-faculty-attendance', label: 'Faculty Attendance', targetTab: 'hoi-faculty-attendance' },
      { id: 'hoi-faculty-performance', label: 'Faculty Performance', targetTab: 'hoi-faculty-performance' }
    ]
  },
  {
    id: 'attendance-group',
    label: 'Attendance',
    icon: Clock,
    defaultTab: 'hoi-attendance-institute',
    children: [
      { id: 'hoi-attendance-institute', label: 'Institute Attendance', targetTab: 'hoi-attendance-institute' },
      { id: 'hoi-attendance-shortage', label: 'Attendance Shortage', targetTab: 'hoi-attendance-shortage' },
      { id: 'hoi-attendance-comparison', label: 'Department Comparison', targetTab: 'hoi-attendance-comparison' },
      { id: 'hoi-attendance-approvals', label: 'Pending Approvals', targetTab: 'hoi-attendance-approvals' }
    ]
  },
  {
    id: 'examination-group',
    label: 'Examination',
    icon: Award,
    defaultTab: 'hoi-exam-eligibility',
    children: [
      { id: 'hoi-exam-eligibility', label: 'Exam Eligibility', targetTab: 'hoi-exam-eligibility' },
      { id: 'hoi-exam-attendance-approvals', label: 'Attendance Approvals', targetTab: 'hoi-exam-attendance-approvals' },
      { id: 'hoi-exam-info', label: 'Exam Information', targetTab: 'hoi-exam-info' },
      { id: 'hoi-exam-reports', label: 'Examination Reports', targetTab: 'hoi-exam-reports' }
    ]
  },
  {
    id: 'requests-group',
    label: 'Requests',
    icon: MessageSquare,
    defaultTab: 'hoi-requests-pending'
  },
  {
    id: 'documents-group',
    label: 'Documents',
    icon: FolderCheck,
    defaultTab: 'hoi-docs-students',
    children: [
      { id: 'hoi-docs-students', label: 'Student Documents', targetTab: 'hoi-docs-students' },
      { id: 'hoi-docs-overview', label: 'Verification Overview', targetTab: 'hoi-docs-overview' }
    ]
  },
  COMMON_NOTESHEET_NAV_GROUP,
  COMMON_ACCREDITATION_NAV_GROUP,
  COMMON_OBE_NAV_GROUP,
  COMMON_RESEARCH_INNOVATION_NAV_GROUP,
  COMMON_GRANTS_SSIP_NAV_GROUP,
  {
    id: 'feedback-group',
    label: 'Feedback',
    icon: BarChart3,
    defaultTab: 'hoi-feedback-institute',
    children: [
      { id: 'hoi-feedback-student', label: 'Student Feedback', targetTab: 'hoi-feedback-student' },
      { id: 'hoi-feedback-faculty', label: 'Faculty Feedback', targetTab: 'hoi-feedback-faculty' },
      { id: 'hoi-feedback-department', label: 'Department Feedback', targetTab: 'hoi-feedback-department' },
      { id: 'hoi-feedback-institute', label: 'Institute Feedback', targetTab: 'hoi-feedback-institute' }
    ]
  },
  {
    id: 'reports-group',
    label: 'Reports',
    icon: FileSpreadsheet,
    defaultTab: 'hoi-reports-academic',
    children: [
      { id: 'hoi-reports-academic', label: 'Academic Reports', targetTab: 'hoi-reports-academic' },
      { id: 'hoi-reports-student', label: 'Student Reports', targetTab: 'hoi-reports-student' },
      { id: 'hoi-reports-faculty', label: 'Faculty Reports', targetTab: 'hoi-reports-faculty' },
      { id: 'hoi-reports-attendance', label: 'Attendance Reports', targetTab: 'hoi-reports-attendance' },
      { id: 'hoi-reports-examination', label: 'Examination Reports', targetTab: 'hoi-reports-examination' },
      { id: 'hoi-reports-institute', label: 'Institute Reports', targetTab: 'hoi-reports-institute' }
    ]
  },
  {
    id: 'notices',
    label: 'Notices',
    icon: Bell,
    defaultTab: 'notices'
  },
  {
    id: 'events',
    label: 'Events',
    icon: CalendarCheck,
    defaultTab: 'events'
  },
  HIGHER_AUTHORITY_WORK_TRANSFER_NAV_GROUP,
  {
    id: 'inventory-assets',
    label: 'Inventory & Assets',
    icon: Boxes,
    defaultTab: 'inventory-assets'
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    defaultTab: 'notifications'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    defaultTab: 'settings'
  }
];

/**
 * FINAL STUDENT SECTION SIDEBAR STRUCTURE (13 Sections)
 */
export const STUDENT_SECTION_NAVIGATION_STRUCTURE: StudentNavGroup[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    defaultTab: 'dashboard'
  },
  {
    id: 'students-group',
    label: 'Students',
    icon: GraduationCap,
    defaultTab: 'section-students-list',
    children: [
      { id: 'section-students-list', label: 'Student List', targetTab: 'section-students-list' },
      { id: 'section-students-profile', label: 'Student Profile', targetTab: 'section-students-profile' },
      { id: 'section-students-academic', label: 'Academic Details', targetTab: 'section-students-academic' },
      { id: 'section-students-docs', label: 'Student Documents', targetTab: 'section-students-docs' },
      { id: 'section-students-status', label: 'Student Status', targetTab: 'section-students-status' }
    ]
  },
  {
    id: 'documents-group',
    label: 'Student Documents',
    icon: FolderCheck,
    defaultTab: 'section-docs-verification',
    children: [
      { id: 'section-docs-verification', label: 'Document Verification', targetTab: 'section-docs-verification' },
      { id: 'section-docs-pending', label: 'Pending Documents', targetTab: 'section-docs-pending' },
      { id: 'section-docs-verified', label: 'Verified Documents', targetTab: 'section-docs-verified' },
      { id: 'section-docs-reupload', label: 'Re-upload Required', targetTab: 'section-docs-reupload' },
      { id: 'section-docs-locked', label: 'Locked Documents', targetTab: 'section-docs-locked' },
      { id: 'section-docs-master', label: 'Document Master', targetTab: 'section-docs-master' }
    ]
  },
  {
    id: 'services-group',
    label: 'Student Services',
    icon: FileText,
    defaultTab: 'section-service-bonafide',
    children: [
      { id: 'section-service-bonafide', label: 'Bonafide Certificate', targetTab: 'section-service-bonafide' },
      { id: 'section-service-transcript', label: 'Transcript', targetTab: 'section-service-transcript' },
      { id: 'section-service-degree', label: 'Degree / Provisional Degree', targetTab: 'section-service-degree' },
      { id: 'section-service-migration', label: 'Migration Certificate', targetTab: 'section-service-migration' },
      { id: 'section-service-transfer', label: 'Transfer Certificate', targetTab: 'section-service-transfer' },
      { id: 'section-service-character', label: 'Character / Other Certificate', targetTab: 'section-service-character' },
      { id: 'section-service-idcard', label: 'ID Card', targetTab: 'section-service-idcard' },
      { id: 'section-service-duplicate-id', label: 'Duplicate ID Card', targetTab: 'section-service-duplicate-id' },
      { id: 'section-service-other', label: 'Other Student Services', targetTab: 'section-service-other' }
    ]
  },
  {
    id: 'requests-group',
    label: 'Student Requests',
    icon: MessageSquare,
    defaultTab: 'section-requests-pending'
  },
  {
    id: 'fees-group',
    label: 'Service Fees & Payments',
    icon: IndianRupee,
    defaultTab: 'section-fees-pending',
    children: [
      { id: 'section-fees-config', label: 'Service Fee Configuration', targetTab: 'section-fees-config' },
      { id: 'section-fees-pending', label: 'Pending Payments', targetTab: 'section-fees-pending' },
      { id: 'section-fees-history', label: 'Payment History', targetTab: 'section-fees-history' },
      { id: 'section-fees-receipts', label: 'Receipts', targetTab: 'section-fees-receipts' },
      { id: 'section-fees-refunds', label: 'Refund Requests', targetTab: 'section-fees-refunds' }
    ]
  },
  {
    id: 'idcard-group',
    label: 'ID Card Management',
    icon: UserCheck,
    defaultTab: 'section-id-generate',
    children: [
      { id: 'section-id-generate', label: 'Generate ID Cards', targetTab: 'section-id-generate' },
      { id: 'section-id-replacement', label: 'Replacement Requests', targetTab: 'section-id-replacement' },
      { id: 'section-id-active', label: 'Active ID Cards', targetTab: 'section-id-active' },
      { id: 'section-id-blocked', label: 'Blocked ID Cards', targetTab: 'section-id-blocked' },
      { id: 'section-id-replaced', label: 'Replaced ID Cards', targetTab: 'section-id-replaced' },
      { id: 'section-id-verify', label: 'ID Card Verification', targetTab: 'section-id-verify' }
    ]
  },
  {
    id: 'academic-records-group',
    label: 'Academic Records',
    icon: BookOpen,
    defaultTab: 'section-academic-records',
    children: [
      { id: 'section-academic-records', label: 'Student Academic Records', targetTab: 'section-academic-records' },
      { id: 'section-academic-semesters', label: 'Semester Records', targetTab: 'section-academic-semesters' },
      { id: 'section-academic-results', label: 'Marks / Results View', targetTab: 'section-academic-results' },
      { id: 'section-academic-transcripts', label: 'Transcript Records', targetTab: 'section-academic-transcripts' },
      { id: 'section-academic-completion', label: 'Completion Records', targetTab: 'section-academic-completion' }
    ]
  },
  COMMON_NOTESHEET_NAV_GROUP,
  COMMON_RESEARCH_INNOVATION_NAV_GROUP,
  COMMON_GRANTS_SSIP_NAV_GROUP,
  {
    id: 'notices',
    label: 'Notices',
    icon: Bell,
    defaultTab: 'notices'
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    defaultTab: 'notifications'
  },
  {
    id: 'reports-group',
    label: 'Reports',
    icon: FileSpreadsheet,
    defaultTab: 'section-reports-student',
    children: [
      { id: 'section-reports-student', label: 'Student Reports', targetTab: 'section-reports-student' },
      { id: 'section-reports-docs', label: 'Document Reports', targetTab: 'section-reports-docs' },
      { id: 'section-reports-service', label: 'Service Reports', targetTab: 'section-reports-service' },
      { id: 'section-reports-requests', label: 'Request Reports', targetTab: 'section-reports-requests' },
      { id: 'section-reports-payments', label: 'Payment Reports', targetTab: 'section-reports-payments' }
    ]
  },
  COMMON_WORK_TRANSFER_NAV_GROUP,
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    defaultTab: 'settings'
  }
];

/**
 * FINAL STUDENT ADMINISTRATION & ONBOARDING SIDEBAR STRUCTURE (5 Primary Sections)
 */
export const STUDENT_ADMIN_NAVIGATION_STRUCTURE: StudentNavGroup[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    defaultTab: 'dashboard'
  },
  {
    id: 'onboarding-group',
    label: 'Admission & Onboarding',
    icon: UserPlus,
    defaultTab: 'onboarding-applications',
    children: [
      { id: 'onboarding-applications', label: 'Admission Applications', targetTab: 'onboarding-applications' },
      { id: 'onboarding-doc-verification', label: 'Document Verification', targetTab: 'onboarding-doc-verification' },
      { id: 'onboarding-fee-verification', label: 'Fee Verification', targetTab: 'onboarding-fee-verification' },
      { id: 'onboarding-student-creation', label: 'Student Creation', targetTab: 'onboarding-student-creation' },
      { id: 'onboarding-enrollment', label: 'Student ID / Enrollment', targetTab: 'onboarding-enrollment' },
      { id: 'students-directory', label: 'Student Master', targetTab: 'students-directory' }
    ]
  },
  {
    id: 'reports-group',
    label: 'Reports',
    icon: BarChart3,
    defaultTab: 'onboarding-reports',
    children: [
      { id: 'onboarding-reports', label: 'Onboarding Report', targetTab: 'onboarding-reports' },
      { id: 'onboarding-pending-verification', label: 'Pending Verification', targetTab: 'onboarding-pending-verification' },
      { id: 'onboarding-export-register', label: 'Export Register', targetTab: 'onboarding-export-register' }
    ]
  },
  COMMON_RESEARCH_INNOVATION_NAV_GROUP,
  COMMON_GRANTS_SSIP_NAV_GROUP,
  {
    id: 'resource-assets-group',
    label: 'Resource & Asset Allocation',
    icon: Package,
    defaultTab: 'university-asset-management',
    children: [
      { id: 'university-asset-management', label: 'Resource & Asset Workspace', targetTab: 'university-asset-management' },
      { id: 'asset-master-register', label: 'Asset Master Catalog', targetTab: 'asset-master-register' },
      { id: 'department-asset-allocation', label: 'Department Allocation', targetTab: 'department-asset-allocation' },
      { id: 'classroom-allocation', label: 'Classrooms & Labs', targetTab: 'classroom-allocation' },
      { id: 'faculty-workload-allocation', label: 'Faculty Teaching Load', targetTab: 'faculty-workload-allocation' },
      { id: 'asset-transfers-returns', label: 'Transfers & Returns', targetTab: 'asset-transfers-returns' },
      { id: 'asset-allocation-requests', label: 'Asset Requisitions', targetTab: 'asset-allocation-requests' },
      { id: 'asset-reports', label: 'Asset & Allocation Reports', targetTab: 'asset-reports' }
    ]
  },
  {
    id: 'system-group',
    label: 'System',
    icon: Bell,
    defaultTab: 'notifications',
    children: [
      { id: 'notifications', label: 'Notifications', targetTab: 'notifications' }
    ]
  }
];

/**
 * FINAL REGISTRAR / REGISTRAR OFFICE SIDEBAR STRUCTURE (21 Complete Sections)
 */
export const REGISTRAR_NAVIGATION_STRUCTURE: StudentNavGroup[] = [
  // ─── QUICK ACCESS ───
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    defaultTab: 'dashboard',
    category: 'QUICK ACCESS'
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    defaultTab: 'notifications',
    category: 'QUICK ACCESS'
  },
  {
    id: 'my-tasks',
    label: 'My Tasks',
    icon: CheckSquare,
    defaultTab: 'reg-approvals-pending',
    category: 'QUICK ACCESS'
  },

  // ─── 🎓 ACADEMIC ───
  {
    id: 'university-overview',
    label: 'University Overview',
    icon: Building2,
    defaultTab: 'reg-uni-overview',
    category: '🎓 ACADEMIC'
  },
  {
    id: 'institutes',
    label: 'Institutes',
    icon: Building2,
    defaultTab: 'reg-uni-institutes',
    category: '🎓 ACADEMIC'
  },
  {
    id: 'departments',
    label: 'Departments',
    icon: Layers,
    defaultTab: 'reg-uni-departments',
    category: '🎓 ACADEMIC'
  },
  {
    id: 'programs',
    label: 'Programs',
    icon: BookOpen,
    defaultTab: 'reg-uni-programs',
    category: '🎓 ACADEMIC'
  },
  {
    id: 'students',
    label: 'Students',
    icon: GraduationCap,
    defaultTab: 'reg-students-search',
    category: '🎓 ACADEMIC'
  },
  {
    id: 'faculty-staff',
    label: 'Faculty & Staff',
    icon: UserCheck,
    defaultTab: 'reg-faculty-overview',
    category: '🎓 ACADEMIC'
  },
  {
    id: 'academic-admin',
    label: 'Academic Administration',
    icon: Calendar,
    defaultTab: 'reg-academic-overview',
    category: '🎓 ACADEMIC'
  },
  {
    id: 'attendance',
    label: 'Attendance',
    icon: Clock,
    defaultTab: 'reg-attendance-overview',
    category: '🎓 ACADEMIC'
  },
  {
    id: 'examination',
    label: 'Examination',
    icon: Award,
    defaultTab: 'reg-exam-overview',
    category: '🎓 ACADEMIC'
  },
  {
    id: 'note-sheets',
    label: 'Notesheet',
    icon: FileSignature,
    defaultTab: 'reg-notesheets',
    category: '🎓 ACADEMIC'
  },
  {
    id: 'academic-requests',
    label: 'Academic Requests',
    icon: MessageSquare,
    defaultTab: 'reg-requests-pending',
    category: '🎓 ACADEMIC'
  },
  {
    id: 'academic-approvals',
    label: 'Academic Approvals',
    icon: CheckSquare,
    defaultTab: 'reg-approvals-academic',
    category: '🎓 ACADEMIC'
  },
  {
    id: 'academic-reports',
    label: 'Academic Reports',
    icon: FileSpreadsheet,
    defaultTab: 'reg-rep-academic',
    category: '🎓 ACADEMIC'
  },
  {
    id: 'academic-risks',
    label: 'Academic Risks',
    icon: AlertTriangle,
    defaultTab: 'reg-uni-structure',
    category: '🎓 ACADEMIC'
  },
  {
    id: 'accreditation-group',
    label: 'Accreditation',
    icon: Award,
    defaultTab: 'accreditation',
    category: '🎓 ACADEMIC',
    children: [
      { id: 'accreditation-overview', label: 'Accreditation Overview', targetTab: 'accreditation' },
      { id: 'accreditation-naac', label: 'NAAC (7 Criteria)', targetTab: 'accreditation-naac' },
      { id: 'accreditation-nba', label: 'NBA (10 Criteria OBE)', targetTab: 'accreditation-nba' },
      { id: 'accreditation-evidence', label: 'Evidence Repository', targetTab: 'accreditation-evidence' },
      { id: 'accreditation-reports', label: 'SSR / SAR Snapshots & Export', targetTab: 'accreditation-reports' },
    ]
  },
  COMMON_OBE_NAV_GROUP,
  COMMON_RESEARCH_INNOVATION_NAV_GROUP,
  COMMON_GRANTS_SSIP_NAV_GROUP,
  {
    id: 'digilocker-admin-center',
    label: 'DigiLocker Command Center',
    icon: ShieldCheck,
    defaultTab: 'digilocker-admin',
    category: '🎓 ACADEMIC'
  },
  {
    id: 'abc-compliance-center',
    label: 'ABC Compliance & Verification',
    icon: Award,
    defaultTab: 'abc-credits',
    category: '🎓 ACADEMIC'
  },

  // ─── 🏢 NON-ACADEMIC / REGISTRAR OFFICE ───
  {
    id: 'reg-office-overview',
    label: 'Registrar Office Overview',
    icon: Landmark,
    defaultTab: 'reg-my-office',
    category: '🏢 NON-ACADEMIC / REGISTRAR OFFICE'
  },
  {
    id: 'office-staff-group',
    label: 'Office Staff',
    icon: Users,
    defaultTab: 'reg-faculty-staff',
    category: '🏢 NON-ACADEMIC / REGISTRAR OFFICE',
    children: [
      { id: 'reg-office-deputy', label: 'Deputy Registrar', targetTab: 'reg-faculty-staff' },
      { id: 'reg-office-assistant', label: 'Assistant Registrar', targetTab: 'reg-faculty-staff' },
      { id: 'reg-office-other', label: 'Other Staff', targetTab: 'reg-faculty-staff' }
    ]
  },
  {
    id: 'work-allocation',
    label: 'Work Allocation',
    icon: Briefcase,
    defaultTab: 'reg-my-office',
    category: '🏢 NON-ACADEMIC / REGISTRAR OFFICE'
  },
  {
    id: 'office-requests',
    label: 'Office Requests',
    icon: Inbox,
    defaultTab: 'reg-my-office',
    category: '🏢 NON-ACADEMIC / REGISTRAR OFFICE'
  },
  {
    id: 'office-approvals',
    label: 'Office Approvals',
    icon: ShieldCheck,
    defaultTab: 'reg-approvals-admin',
    category: '🏢 NON-ACADEMIC / REGISTRAR OFFICE'
  },
  {
    id: 'office-documents',
    label: 'Office Documents',
    icon: FolderCheck,
    defaultTab: 'reg-docs-overview',
    category: '🏢 NON-ACADEMIC / REGISTRAR OFFICE'
  },
  {
    id: 'office-reports',
    label: 'Office Reports',
    icon: FileSpreadsheet,
    defaultTab: 'reg-rep-uni',
    category: '🏢 NON-ACADEMIC / REGISTRAR OFFICE'
  },
  {
    id: 'office-notifications',
    label: 'Office Notifications',
    icon: Bell,
    defaultTab: 'notifications',
    category: '🏢 NON-ACADEMIC / REGISTRAR OFFICE'
  },
  {
    id: 'office-audit-trail',
    label: 'Office Audit Trail',
    icon: Clock,
    defaultTab: 'reg-audit-logs',
    category: '🏢 NON-ACADEMIC / REGISTRAR OFFICE'
  }
];

/**
 * DEPUTY REGISTRAR SIDEBAR STRUCTURE (University-level administrative role under Registrar Office)
 */
export const DEPUTY_REGISTRAR_NAVIGATION_STRUCTURE: StudentNavGroup[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    defaultTab: 'dashboard'
  },
  {
    id: 'students-group',
    label: 'Student Administration',
    icon: GraduationCap,
    defaultTab: 'deputy-student-records',
    children: [
      { id: 'deputy-student-records', label: 'Student Records', targetTab: 'reg-students-records' }
    ]
  },
  {
    id: 'university-group',
    label: 'University',
    icon: Building2,
    defaultTab: 'reg-uni-institutes',
    children: [
      { id: 'reg-uni-institutes', label: 'Institutes', targetTab: 'reg-uni-institutes' },
      { id: 'reg-uni-departments', label: 'Departments', targetTab: 'reg-uni-departments' },
      { id: 'reg-uni-programs', label: 'Programs', targetTab: 'reg-uni-programs' },
      { id: 'reg-academic-year', label: 'Academic Master', targetTab: 'reg-academic-year' }
    ]
  },
  COMMON_NOTESHEET_NAV_GROUP,
  COMMON_ACCREDITATION_NAV_GROUP,
  COMMON_OBE_NAV_GROUP,
  COMMON_RESEARCH_INNOVATION_NAV_GROUP,
  COMMON_GRANTS_SSIP_NAV_GROUP,
  {
    id: 'inward-outward',
    label: 'Inward / Outward',
    icon: Inbox,
    defaultTab: 'inward-outward'
  },
  {
    id: 'correspondence',
    label: 'Official Correspondence',
    icon: Mail,
    defaultTab: 'reg-corr-incoming'
  },
  {
    id: 'approvals',
    label: 'Approvals',
    icon: FileCheck,
    defaultTab: 'reg-approvals-pending'
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    defaultTab: 'notifications'
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: BarChart3,
    defaultTab: 'reg-rep-uni'
  },
  HIGHER_AUTHORITY_WORK_TRANSFER_NAV_GROUP,
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    defaultTab: 'settings'
  }
];

export const VICE_PRESIDENT_NAVIGATION_STRUCTURE: StudentNavGroup[] = [
  {
    id: 'dashboard',
    label: 'Executive Dashboard',
    icon: LayoutDashboard,
    defaultTab: 'dashboard'
  },
  COMMON_NOTESHEET_NAV_GROUP,
  COMMON_ACCREDITATION_NAV_GROUP,
  COMMON_OBE_NAV_GROUP,
  COMMON_RESEARCH_INNOVATION_NAV_GROUP,
  COMMON_GRANTS_SSIP_NAV_GROUP,
  HIGHER_AUTHORITY_WORK_TRANSFER_NAV_GROUP,
  {
    id: 'governance-group',
    label: 'University Governance',
    icon: Building2,
    defaultTab: 'institutes',
    children: [
      { id: 'institutes', label: 'Institutes', targetTab: 'institutes' },
      { id: 'departments', label: 'Departments', targetTab: 'departments' },
      { id: 'programs', label: 'Programs & Courses', targetTab: 'programs' },
      { id: 'academic-years', label: 'Academic Years', targetTab: 'academic-years' }
    ]
  },
  {
    id: 'academics-group',
    label: 'Students & Academics',
    icon: GraduationCap,
    defaultTab: 'students',
    children: [
      { id: 'students', label: 'Student Directory', targetTab: 'students' },
      { id: 'faculty', label: 'Faculty Directory', targetTab: 'faculty' },
      { id: 'mentorship', label: 'Mentor Oversight', targetTab: 'mentor-assignment' },
      { id: 'attendance', label: 'Attendance Oversight', targetTab: 'attendance' }
    ]
  },
  {
    id: 'exams-group',
    label: 'Examinations',
    icon: Award,
    defaultTab: 'exam-dashboard',
    children: [
      { id: 'exam-dashboard', label: 'Exam Overview', targetTab: 'exam-dashboard' },
      { id: 'exam-schedule', label: 'Exam Schedules', targetTab: 'exam-schedule' },
      { id: 'exam-results', label: 'Results & Marksheets', targetTab: 'result-management' }
    ]
  },
  {
    id: 'finance-group',
    label: 'Finance & Accounts',
    icon: IndianRupee,
    defaultTab: 'fees',
    children: [
      { id: 'fees', label: 'Fee Collection', targetTab: 'fees' },
      { id: 'fee-structure', label: 'Fee Structures', targetTab: 'fee-structure' },
      { id: 'accounts', label: 'Accounts Workspace', targetTab: 'accounts' }
    ]
  },
  {
    id: 'campus-group',
    label: 'Campus & Facilities',
    icon: Layers,
    defaultTab: 'hostel',
    children: [
      { id: 'hostel', label: 'Hostel Management', targetTab: 'hostel' },
      { id: 'infrastructure', label: 'Infrastructure & Labs', targetTab: 'maintenance' },
      { id: 'inventory', label: 'Inventory & Assets', targetTab: 'inventory-assets' }
    ]
  },
  {
    id: 'services-group',
    label: 'Student Services & Desk',
    icon: Users2,
    defaultTab: 'student-requests',
    children: [
      { id: 'student-requests', label: 'Student Requests', targetTab: 'student-requests' },
      { id: 'support-tickets', label: 'Support & Complaints', targetTab: 'support-tickets' },
      { id: 'certificates', label: 'Document Services', targetTab: 'certificates' }
    ]
  },
  {
    id: 'hr-group',
    label: 'University HRMS',
    icon: UserCheck,
    defaultTab: 'university-hrms',
    children: [
      { id: 'university-hrms', label: 'HRMS Dashboard', targetTab: 'university-hrms' },
      { id: 'hr', label: 'Employee Master', targetTab: 'hr' },
      { id: 'recruitment', label: 'Recruitment & Vacancies', targetTab: 'recruitment' },
      { id: 'leave', label: 'Leave Management', targetTab: 'leave' },
      { id: 'payroll', label: 'Payroll & Payslips', targetTab: 'payroll' }
    ]
  },
  {
    id: 'audit-group',
    label: 'Audit & Activity',
    icon: ShieldCheck,
    defaultTab: 'security-audit'
  },
  {
    id: 'reports',
    label: 'University Reports',
    icon: BarChart3,
    defaultTab: 'reports'
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    defaultTab: 'notifications'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    defaultTab: 'settings'
  }
];

export const ERP_COORDINATOR_NAVIGATION_STRUCTURE: StudentNavGroup[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    defaultTab: 'dashboard'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    defaultTab: 'settings',
    children: [
      {
        id: 'settings-users',
        label: 'User Accounts & Access',
        targetTab: 'settings'
      },
      {
        id: 'settings-roles',
        label: 'Role Permissions Matrix',
        targetTab: 'settings'
      },
      {
        id: 'settings-security',
        label: 'Account Security & Locks',
        targetTab: 'settings'
      }
    ]
  },
  {
    id: 'inventory-assets',
    label: 'Inventory & Assets',
    icon: Boxes,
    defaultTab: 'inventory-assets'
  },
  {
    id: 'feedback',
    label: 'Student Feedback',
    icon: MessageSquare,
    defaultTab: 'feedback'
  },
  COMMON_ACCREDITATION_NAV_GROUP,
  COMMON_OBE_NAV_GROUP,
  COMMON_RESEARCH_INNOVATION_NAV_GROUP,
  COMMON_GRANTS_SSIP_NAV_GROUP,
  {
    id: 'security-audit',
    label: 'Security Audit Center',
    icon: ShieldCheck,
    defaultTab: 'security-audit'
  },
  {
    id: 'reports',
    label: 'Reports & Analytics',
    icon: BarChart3,
    defaultTab: 'reports'
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    defaultTab: 'notifications'
  },
  {
    id: 'profile',
    label: 'My Profile & Security',
    icon: User,
    defaultTab: 'profile'
  }
];

export const PARENT_NAVIGATION_STRUCTURE: StudentNavGroup[] = [
  {
    id: 'parent-ptm-dashboard',
    label: 'PTM Dashboard',
    icon: LayoutDashboard,
    defaultTab: 'parent-ptm'
  },
  {
    id: 'parent-my-children',
    label: 'My Children',
    icon: Users,
    defaultTab: 'parent-ptm'
  },
  {
    id: 'parent-feedback',
    label: 'Parent Feedback',
    icon: MessageSquare,
    defaultTab: 'parent-ptm'
  }
];

/**
 * Strict Role-Based Menu Sequences
 */
export const ROLE_NAV_ORDER: Record<string, string[]> = {
  PRESIDENT: [
    'dashboard',
    'note-sheets', 'notesheet-create', 'notesheet-pending', 'notesheet-my', 'notesheet-drafts', 'notesheet-sent', 'notesheet-returned', 'notesheet-clarification', 'notesheet-action-pending', 'notesheet-approved', 'notesheet-rejected', 'notesheet-closed', 'notesheet-history',
    'institutes', 'departments', 'programs', 'academic-years', 'batches', 'semesters', 'divisions', 'subjects',
    'student-search', 'students', 'student-profile', 'faculty', 'mentor-assignment', 'attendance',
    'exam-dashboard', 'exams', 'exam-schedule', 'exam-forms', 'exam-eligibility', 'result-management', 'marksheet',
    'fees', 'fee-structure', 'accounts',
    'hostel', 'maintenance', 'inventory-assets',
    'student-requests', 'support-tickets', 'certificates', 'student-section',
    'hr', 'leave',
    'security-audit', 'reports', 'notifications'
  ],
  PROVOST: [
    'dashboard',
    'note-sheets', 'notesheet-create', 'notesheet-pending', 'notesheet-my', 'notesheet-drafts', 'notesheet-sent', 'notesheet-returned', 'notesheet-clarification', 'notesheet-action-pending', 'notesheet-approved', 'notesheet-rejected', 'notesheet-closed', 'notesheet-history',
    'institutes', 'departments', 'programs', 'academic-years', 'batches', 'semesters', 'divisions', 'subjects',
    'student-search', 'students', 'student-profile', 'faculty', 'mentor-assignment', 'attendance',
    'exam-dashboard', 'exams', 'exam-schedule', 'exam-forms', 'exam-eligibility', 'result-management', 'marksheet',
    'fees', 'fee-structure', 'accounts',
    'hostel', 'maintenance', 'inventory-assets',
    'student-requests', 'support-tickets', 'certificates', 'student-section',
    'hr', 'leave',
    'security-audit', 'reports', 'notifications'
  ],
  UNIVERSITY_ADMIN: [
    'dashboard',
    'note-sheets', 'notesheet-create', 'notesheet-pending', 'notesheet-my', 'notesheet-drafts', 'notesheet-sent', 'notesheet-returned', 'notesheet-clarification', 'notesheet-action-pending', 'notesheet-approved', 'notesheet-rejected', 'notesheet-closed', 'notesheet-history',
    'institutes', 'departments', 'programs', 'academic-years', 'batches', 'semesters', 'divisions', 'subjects',
    'student-search', 'students', 'student-profile', 'faculty', 'mentor-assignment', 'attendance',
    'exam-dashboard', 'exams', 'exam-schedule', 'exam-forms', 'exam-eligibility', 'result-management', 'marksheet',
    'fees', 'fee-structure', 'accounts',
    'hostel', 'maintenance', 'inventory-assets',
    'student-requests', 'support-tickets', 'certificates', 'student-section',
    'hr', 'leave',
    'security-audit', 'reports', 'notifications', 'settings'
  ],
  ERP_COORDINATOR: [
    'dashboard',
    'accreditation', 'accreditation-overview', 'accreditation-naac', 'accreditation-nba', 'accreditation-evidence', 'accreditation-reports',
    'obe', 'course-outcomes', 'program-outcomes', 'program-specific-outcomes', 'co-po-mapping', 'co-pso-mapping', 'assessment-mapping', 'attainment',
    'settings',
    'security-audit',
    'inventory-assets',
    'reports',
    'notifications',
    'profile'
  ],
  VICE_PRESIDENT: [
    'dashboard',
    'note-sheets', 'notesheet-create', 'notesheet-pending', 'notesheet-my', 'notesheet-drafts', 'notesheet-sent', 'notesheet-returned', 'notesheet-clarification', 'notesheet-action-pending', 'notesheet-approved', 'notesheet-rejected', 'notesheet-closed', 'notesheet-history',
    'institutes', 'departments', 'programs', 'academic-years', 'batches', 'semesters', 'divisions', 'subjects',
    'student-search', 'students', 'student-profile', 'faculty', 'mentor-assignment', 'attendance',
    'exam-dashboard', 'exams', 'exam-schedule', 'exam-forms', 'exam-eligibility', 'result-management', 'marksheet',
    'fees', 'fee-structure', 'accounts',
    'hostel', 'maintenance', 'inventory-assets',
    'student-requests', 'support-tickets', 'certificates', 'student-section',
    'hr', 'leave',
    'security-audit', 'reports', 'notifications'
  ],
  DEPUTY_REGISTRAR: [
    'dashboard',
    'student-search', 'reg-uni-institutes', 'reg-uni-departments', 'reg-uni-programs', 'reg-academic-year',
    'accreditation', 'accreditation-overview', 'accreditation-naac', 'accreditation-nba', 'accreditation-evidence', 'accreditation-reports',
    'obe', 'course-outcomes', 'program-outcomes', 'program-specific-outcomes', 'co-po-mapping', 'co-pso-mapping', 'assessment-mapping', 'attainment',
    'note-sheets', 'notesheet-create', 'notesheet-my', 'notesheet-drafts', 'notesheet-pending', 'notesheet-sent', 'notesheet-returned', 'notesheet-clarification', 'notesheet-action-pending', 'notesheet-approved', 'notesheet-rejected', 'notesheet-closed',
    'inward-outward',
    'reg-corr-incoming', 'reg-corr-outgoing', 'reg-corr-circulars', 'reg-corr-external', 'reg-corr-register',
    'reg-approvals-pending', 'reg-approvals-academic', 'reg-approvals-admin', 'reg-approvals-financial', 'reg-approvals-special',
    'notifications',
    'reg-rep-uni', 'reg-rep-inst', 'reg-rep-dept'
  ],
  REGISTRAR: [
    'dashboard',
    'reg-uni-overview', 'reg-uni-institutes', 'reg-uni-departments', 'reg-uni-programs', 'reg-uni-structure',
    'reg-academic-year', 'reg-academic-semesters', 'reg-academic-calendar', 'reg-academic-overview',
    'reg-attendance-overview', 'reg-attendance-shortage', 'reg-attendance-approvals', 'reg-attendance-reports',
    'accreditation', 'accreditation-overview', 'accreditation-naac', 'accreditation-nba', 'accreditation-evidence', 'accreditation-reports',
    'obe', 'course-outcomes', 'program-outcomes', 'program-specific-outcomes', 'co-po-mapping', 'co-pso-mapping', 'assessment-mapping', 'attainment',
    'student-search', 'reg-students-search', 'reg-students-profile', 'reg-students-records', 'reg-students-status', 'reg-students-international', 'reg-students-stats',
    'reg-faculty-overview', 'reg-faculty-staff', 'reg-faculty-inst-strength', 'reg-faculty-dept-strength',
    'reg-notesheets', 'reg-notesheet-create', 'reg-notesheet-pending', 'reg-notesheet-my', 'reg-notesheet-drafts', 'reg-notesheet-sent', 'reg-notesheet-financial', 'reg-notesheet-returned', 'reg-notesheet-clarification', 'reg-notesheet-action-pending', 'reg-notesheet-approved', 'reg-notesheet-rejected', 'reg-notesheet-closed', 'reg-notesheet-history',
    'reg-requests-pending', 'reg-requests-escalated', 'reg-requests-assigned', 'reg-requests-dept', 'reg-requests-uni', 'reg-requests-history',
    'reg-approvals-pending', 'reg-approvals-academic', 'reg-approvals-admin', 'reg-approvals-financial', 'reg-approvals-special',
    'reg-exam-overview', 'reg-exam-forms', 'reg-exam-eligibility', 'reg-exam-halltickets', 'reg-exam-centres', 'reg-exam-results',
    'reg-docs-overview', 'reg-docs-certificates', 'reg-docs-transcripts', 'reg-docs-degrees', 'reg-docs-migration', 'reg-docs-verification',
    'reg-finance-fees', 'reg-finance-collection', 'reg-finance-pending', 'reg-finance-notesheets', 'reg-finance-reports',
    'reg-corr-incoming', 'reg-corr-outgoing', 'reg-corr-circulars', 'reg-corr-external', 'reg-corr-register',
    'reg-files-register', 'reg-files-movement', 'reg-files-archive', 'reg-files-search',
    'reg-comm-master', 'reg-comm-members', 'reg-comm-meetings', 'reg-comm-agenda', 'reg-comm-mom', 'reg-comm-actions',
    'reg-notices-create', 'reg-notices-published', 'reg-notices-circulars', 'reg-notices-history',
    'reg-inv-inst', 'reg-inv-dept', 'reg-inv-transfers', 'reg-inv-maintenance', 'reg-inv-reports',
    'reg-rep-uni', 'reg-rep-inst', 'reg-rep-dept', 'reg-rep-student', 'reg-rep-academic', 'reg-rep-faculty', 'reg-rep-exam', 'reg-rep-financial', 'reg-rep-inventory', 'reg-rep-custom',
    'notifications',
    'reg-audit-log', 'reg-audit-login', 'reg-audit-approvals', 'reg-audit-notesheets', 'reg-audit-system',
    'reg-excel-templates', 'reg-excel-history', 'reg-excel-failed', 'reg-excel-export',
    'settings',
    'reg-preferences', 'reg-change-password',
    'logout'
  ],
  STUDENT_SECTION: [
    'dashboard',
    'student-search', 'section-students-list', 'section-students-profile', 'section-students-academic', 'section-students-docs', 'section-students-status',
    'section-docs-verification', 'section-docs-pending', 'section-docs-verified', 'section-docs-reupload', 'section-docs-locked', 'section-docs-master',
    'section-service-bonafide', 'section-service-transcript', 'section-service-degree', 'section-service-migration', 'section-service-transfer', 'section-service-character', 'section-service-idcard', 'section-service-duplicate-id', 'section-service-other',
    'section-requests-pending', 'section-requests-assigned', 'section-requests-dept', 'section-requests-escalated', 'section-requests-history',
    'section-fees-config', 'section-fees-pending', 'section-fees-history', 'section-fees-receipts', 'section-fees-refunds',
    'section-id-generate', 'section-id-replacement', 'section-id-active', 'section-id-blocked', 'section-id-replaced', 'section-id-verify',
    'section-academic-records', 'section-academic-semesters', 'section-academic-results', 'section-academic-transcripts', 'section-academic-completion',
    'notices', 'notifications', 'inventory-assets', 'note-sheets', 'notesheet-create', 'notesheet-pending', 'notesheet-my', 'notesheet-drafts', 'notesheet-sent', 'notesheet-returned', 'notesheet-clarification', 'notesheet-action-pending', 'notesheet-approved', 'notesheet-rejected', 'notesheet-closed', 'inward-outward', 'work-diary',
    'section-reports-student', 'section-reports-docs', 'section-reports-service', 'section-reports-requests', 'section-reports-payments'
  ],
  PRINCIPAL: [
    'dashboard',
    'hoi-inst-overview', 'hoi-inst-departments', 'hoi-inst-hods', 'hoi-inst-programs', 'hoi-inst-faculty', 'hoi-inst-students', 'hoi-inst-sections',
    'hoi-academic-overview', 'hoi-academic-programs', 'hoi-academic-subjects', 'hoi-academic-allocation', 'hoi-timetable', 'hoi-session-plans', 'hoi-calendar', 'hoi-academic-performance',
    'accreditation', 'accreditation-overview', 'accreditation-naac', 'accreditation-nba', 'accreditation-evidence', 'accreditation-reports',
    'obe', 'course-outcomes', 'program-outcomes', 'program-specific-outcomes', 'co-po-mapping', 'co-pso-mapping', 'assessment-mapping', 'attainment',
    'student-search', 'hoi-students-list', 'hoi-students-profile', 'hoi-students-attendance', 'hoi-students-performance', 'hoi-students-at-risk', 'hoi-students-documents',
    'hoi-faculty-list', 'hoi-faculty-workload', 'hoi-faculty-allocation', 'hoi-faculty-attendance', 'hoi-faculty-performance',
    'hoi-attendance-institute', 'hoi-attendance-shortage', 'hoi-attendance-comparison', 'hoi-attendance-approvals',
    'hoi-exam-eligibility', 'hoi-exam-attendance-approvals', 'hoi-exam-info', 'hoi-exam-reports',
    'hoi-requests-pending', 'hoi-requests-dept', 'hoi-requests-escalated', 'hoi-requests-history',
    'hoi-docs-students', 'hoi-docs-overview',
    'hoi-feedback-student', 'hoi-feedback-faculty', 'hoi-feedback-department', 'hoi-feedback-institute',
    'hoi-reports-academic', 'hoi-reports-student', 'hoi-reports-faculty', 'hoi-reports-attendance', 'hoi-reports-examination', 'hoi-reports-institute',
    'notices', 'events', 'notifications', 'inventory-assets', 'note-sheets', 'notesheet-create', 'notesheet-pending', 'notesheet-my', 'notesheet-drafts', 'notesheet-sent', 'notesheet-returned', 'notesheet-clarification', 'notesheet-action-pending', 'notesheet-approved', 'notesheet-rejected', 'notesheet-closed', 'inward-outward', 'work-diary'
  ],
  HOD: [
    'dashboard',
    'hod-dept-overview', 'hod-dept-students', 'hod-dept-faculty', 'hod-dept-programs', 'hod-dept-semesters', 'hod-dept-sections',
    'hod-academic-subjects', 'hod-faculty-allocation', 'hod-timetable', 'session-plan', 'mentor-session-plan', 'hod-session-plans', 'study-material', 'mentor-study-material', 'materials', 'hod-materials', 'hod-assignments', 'hod-quiz', 'hod-calendar',
    'accreditation', 'accreditation-overview', 'accreditation-naac', 'accreditation-nba', 'accreditation-evidence', 'accreditation-reports',
    'obe', 'course-outcomes', 'program-outcomes', 'program-specific-outcomes', 'co-po-mapping', 'co-pso-mapping', 'assessment-mapping', 'attainment',
    'hod-attendance-overview', 'hod-attendance-shortage', 'hod-subject-attendance', 'hod-attendance-approvals',
    'student-search', 'hod-students-list', 'hod-students-profile', 'hod-students-performance', 'hod-students-at-risk', 'hod-students-documents',
    'hod-faculty-list', 'hod-faculty-workload', 'hod-faculty-subject-allocation', 'hod-faculty-performance',
    'hod-exam-eligibility', 'hod-exam-attendance-approvals', 'hod-exam-info', 'hod-exam-requests',
    'hod-requests-pending', 'hod-requests-dept', 'hod-requests-escalated', 'hod-requests-history',
    'hod-docs-students', 'hod-docs-overview',
    'hod-feedback-faculty', 'hod-feedback-student', 'hod-feedback-department',
    'notices', 'events', 'inventory-assets', 'note-sheets', 'notesheet-create', 'notesheet-pending', 'notesheet-my', 'notesheet-drafts', 'notesheet-sent', 'notesheet-returned', 'notesheet-clarification', 'notesheet-action-pending', 'notesheet-approved', 'notesheet-rejected', 'notesheet-closed', 'inward-outward', 'work-diary',
    'hod-reports-academic', 'hod-reports-attendance', 'hod-reports-student', 'hod-reports-faculty', 'hod-reports-department',
    'notifications'
  ],
  MENTOR: [
    'dashboard',
    'student-search', 'mentee-list', 'mentee-profile', 'mentee-academic-overview', 'mentee-attendance', 'mentee-academic-performance',
    'mentee-subjects', 'session-plan', 'mentor-session-plan', 'study-material', 'mentor-study-material', 'materials', 'mentee-timetable', 'mentee-assignments', 'mentee-academic-progress',
    'mentee-attendance-overview', 'mentee-attendance-shortage', 'mentee-attendance-applications',
    'mentee-exam-eligibility', 'mentee-exam-attendance-approvals', 'mentee-exam-requests',
    'mentee-docs-pending', 'mentee-docs-verified', 'mentee-docs-history',
    'mentee-requests-pending', 'mentee-requests-assigned', 'mentee-requests-history',
    'note-sheets', 'notesheet-create', 'notesheet-pending', 'notesheet-my', 'notesheet-drafts', 'notesheet-sent', 'notesheet-returned', 'notesheet-clarification', 'notesheet-action-pending', 'notesheet-approved', 'notesheet-rejected', 'notesheet-closed',
    'feedback', 'notices', 'events', 'notifications'
  ],
  STUDENT_ADMIN: [
    'dashboard',
    'onboarding-applications',
    'onboarding-doc-verification',
    'onboarding-fee-verification',
    'onboarding-student-creation',
    'onboarding-enrollment',
    'onboarding-mentor-assignment',
    'onboarding-account-activation',
    'onboarding-register',
    'students-directory',
    'student-search',
    'students-profile',
    'onboarding-reports',
    'onboarding-pending-verification',
    'onboarding-export-register',
    'notifications'
  ],

  STUDENT: [
    'dashboard',
    'academic', 'subjects', 'timetable', 'attendance', 'assignments', 'materials', 'quiz',
    'examination', 'exam-forms', 'exam-fees-student', 'exam-backlog', 'exam-reassessment', 'exam-hallticket', 'exam-results',
    'fees', 'fees-semester', 'fees-history', 'fees-receipts', 'fees-query',
    'student-section', 'student-section-services', 'student-section-requests', 'student-section-documents', 'certificates',
    'requests', 'requests-subject-query', 'requests-complaint', 'requests-my-requests',
    'student-ptm', 'feedback', 'feedback-give', 'feedback-anonymous-grievance', 'feedback-track', 'feedback-my', 'feedback-suggestions',
    'notices', 'events', 'hostel', 'transport', 'tickets', 'service-desk', 'notifications'
  ],

  PARENT: [
    'parent-ptm', 'ptm-dashboard', 'ptm-schedule', 'ptm-feedback', 'notifications'
  ],

  FACULTY: [
    'dashboard',
    'subjects', 'timetable', 'session-plan', 'mentor-session-plan', 'materials', 'study-material', 'mentor-study-material', 'assignments', 'quiz', 'calendar',
    'attendance', 'attendance-history', 'subject-attendance', 'attendance-reports', 'attendance-import', 'attendance-templates',
    'exam-duties', 'exam-schedule', 'attendance-applications', 'exam-dashboard',
    'student-search', 'my-students', 'student-academics', 'student-requests', 'students',
    'ptm-management', 'ptm-dashboard', 'ptm-schedule', 'ptm-my', 'ptm-records', 'ptm-feedback', 'ptm-followups', 'ptm-reports',
    'accreditation', 'accreditation-overview', 'accreditation-naac', 'accreditation-nba', 'accreditation-evidence', 'accreditation-reports',
    'obe', 'course-outcomes', 'program-outcomes', 'program-specific-outcomes', 'co-po-mapping', 'co-pso-mapping', 'assessment-mapping', 'attainment',
    'requests', 'requests-subject-query', 'requests-my-requests', 'requests-assigned',
    'documents', 'student-documents', 'pending-verification', 'document-master',
    'feedback', 'inventory-assets', 'note-sheets', 'notesheet-create', 'notesheet-pending', 'notesheet-my', 'notesheet-drafts', 'notesheet-sent', 'notesheet-returned', 'notesheet-clarification', 'notesheet-action-pending', 'notesheet-approved', 'notesheet-rejected', 'notesheet-closed', 'inward-outward', 'work-diary',
    'notices', 'events', 'notifications',
    'edp-duties', 'mentor', 'tickets'
  ],

  STAFF: [
    'dashboard',
    'inventory-assets',
    'notices',
    'events',
    'notifications',
    'profile'
  ],

  EXAM_CELL: [
    'dashboard', 'exam-cell', 'exams', 'exam-schedule', 'exam-eligibility', 'exam-forms', 'exam-fees',
    'exam-hallticket', 'exam-marks', 'exam-results', 'exam-centres', 'exam-seating',
    'exam-edp-duty', 'exam-day-control', 'inventory-assets', 'note-sheets', 'notesheet-create', 'notesheet-pending', 'notesheet-my', 'notesheet-drafts', 'notesheet-sent', 'notesheet-returned', 'notesheet-clarification', 'notesheet-action-pending', 'notesheet-approved', 'notesheet-rejected', 'notesheet-closed', 'inward-outward', 'work-diary', 'reports', 'bulk-import', 'student-search'
  ],

  ACCOUNTS_ADMIN: [
    'dashboard', 'accounts-admin', 'fees', 'student-search', 'students', 'inventory-assets', 'note-sheets', 'notesheet-create', 'notesheet-pending', 'notesheet-my', 'notesheet-drafts', 'notesheet-sent', 'notesheet-returned', 'notesheet-clarification', 'notesheet-action-pending', 'notesheet-approved', 'notesheet-rejected', 'notesheet-closed', 'inward-outward', 'work-diary', 'reports', 'bulk-import'
  ],

  HOSTEL_ADMIN: [
    'dashboard', 'hostel-admin', 'student-search', 'students', 'tickets', 'notifications', 'inventory-assets', 'note-sheets', 'notesheet-create', 'notesheet-pending', 'notesheet-my', 'notesheet-drafts', 'notesheet-sent', 'notesheet-returned', 'notesheet-clarification', 'notesheet-action-pending', 'notesheet-approved', 'notesheet-rejected', 'notesheet-closed', 'inward-outward', 'work-diary', 'reports', 'bulk-import'
  ],

  TRANSPORT_ADMIN: [
    'dashboard', 'transport-admin', 'student-search', 'students', 'inventory-assets', 'note-sheets', 'notesheet-create', 'notesheet-pending', 'notesheet-my', 'notesheet-drafts', 'notesheet-sent', 'notesheet-returned', 'notesheet-clarification', 'notesheet-action-pending', 'notesheet-approved', 'notesheet-rejected', 'notesheet-closed', 'inward-outward', 'work-diary', 'reports', 'bulk-import'
  ],

  LIBRARY_ADMIN: [
    'dashboard', 'library-admin', 'student-search', 'students', 'inventory-assets', 'note-sheets', 'notesheet-create', 'notesheet-pending', 'notesheet-my', 'notesheet-drafts', 'notesheet-sent', 'notesheet-returned', 'notesheet-clarification', 'notesheet-action-pending', 'notesheet-approved', 'notesheet-rejected', 'notesheet-closed', 'inward-outward', 'work-diary', 'reports', 'bulk-import'
  ],

  MAINTENANCE_ADMIN: [
    'dashboard', 'maintenance-admin', 'student-search', 'students', 'inventory-assets', 'note-sheets', 'notesheet-create', 'notesheet-pending', 'notesheet-my', 'notesheet-drafts', 'notesheet-sent', 'notesheet-returned', 'notesheet-clarification', 'notesheet-action-pending', 'notesheet-approved', 'notesheet-rejected', 'notesheet-closed', 'inward-outward', 'work-diary', 'reports', 'bulk-import'
  ],

  IQAC: [
    'dashboard', 'iqac', 'accreditation', 'accreditation-naac', 'accreditation-nba', 'accreditation-evidence', 'accreditation-reports',
    'obe', 'course-outcomes', 'program-outcomes', 'program-specific-outcomes', 'co-po-mapping', 'co-pso-mapping', 'assessment-mapping', 'attainment',
    'inward-outward', 'requests', 'edp-duties', 'faculty', 'student-search',
    'feedback', 'reports', 'inventory-assets', 'note-sheets', 'notesheet-create', 'notesheet-pending', 'notesheet-my', 'notesheet-drafts', 'notesheet-sent', 'notesheet-returned', 'notesheet-clarification', 'notesheet-action-pending', 'notesheet-approved', 'notesheet-rejected', 'notesheet-closed', 'work-diary'
  ],

  SUPER_ADMIN: [
    'dashboard', 'accounts-admin', 'registrar', 'iqac', 'accreditation', 'accreditation-naac', 'accreditation-nba', 'accreditation-evidence', 'accreditation-reports', 'exam-cell', 'student-section', 'hostel-admin', 'library-admin', 'transport-admin', 'maintenance-admin',
    'student-search', 'students', 'mentor-assignment', 'faculty', 'departments', 'programs', 'subjects', 'document-master', 'hr',
    'calendar', 'attendance', 'exam-dashboard', 'exam-eligibility', 'fees', 'crm', 'certificates',
    'ptm-management', 'ptm-dashboard', 'ptm-schedule', 'ptm-my', 'ptm-records', 'ptm-feedback', 'ptm-followups', 'ptm-reports',
    'requests', 'edp-duties', 'tickets', 'feedback', 'notices', 'events', 'reports', 'bulk-import', 'settings', 'security-audit', 'inventory-assets', 'note-sheets', 'notesheet-create', 'notesheet-pending', 'notesheet-my', 'notesheet-drafts', 'notesheet-sent', 'notesheet-returned', 'notesheet-clarification', 'notesheet-action-pending', 'notesheet-approved', 'notesheet-rejected', 'notesheet-closed', 'inward-outward', 'work-diary',
    'org-governance', 'rbac-matrix', 'db-health', 'students-hub', 'staff-hub',
    'hr-hub', 'attendance-hub', 'fees-hub', 'finance-hub',
    'timetable-generator', 'examination-hub', 'lms-hub', 'dms-hub'
  ]
};

export const getRoleNavigationItems = (role?: UserRole | null): NavItemConfig[] => {
  if (!role) return [];
  const order = ROLE_NAV_ORDER[role] || ROLE_NAV_ORDER['SUPER_ADMIN'];
  return order
    .map(id => ALL_NAV_ITEMS[id])
    .filter((item): item is NavItemConfig => Boolean(item));
};

export const isTabPermittedForRole = (tab: string, role?: UserRole | null): boolean => {
  if (!role) return false;
  if (tab === 'dashboard') return true;
  if (tab === 'settings') {
    return ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'ERP_COORDINATOR', 'REGISTRAR'].includes(role);
  }
  if (tab === 'inventory-assets' || tab === 'faculty-assets') {
    return ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'ERP_COORDINATOR', 'REGISTRAR', 'DEPUTY_REGISTRAR', 'VICE_PRESIDENT', 'PRINCIPAL', 'HOD', 'FACULTY', 'STAFF', 'ACCOUNTS_ADMIN', 'MAINTENANCE_ADMIN', 'HOSTEL_ADMIN', 'LIBRARY_ADMIN', 'TRANSPORT_ADMIN', 'STUDENT_SECTION', 'IQAC', 'EXAM_CELL'].includes(role);
  }
  if (tab === 'feedback' || tab === 'feedback-give' || tab === 'feedback-my' || tab === 'feedback-suggestions') {
    return ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'ERP_COORDINATOR', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT', 'IQAC', 'VICE_PRESIDENT', 'REGISTRAR', 'DEPUTY_REGISTRAR', 'STAFF'].includes(role);
  }
  if (tab === 'abc-credits' || tab === 'abc' || tab === 'abc-management') {
    return ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'MENTOR', 'STUDENT', 'REGISTRAR', 'DEPUTY_REGISTRAR', 'STUDENT_SECTION', 'IQAC'].includes(role);
  }
  if (tab === 'digilocker' || tab === 'digilocker-documents' || tab === 'digilocker-admin') {
    return ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT', 'REGISTRAR', 'DEPUTY_REGISTRAR', 'STUDENT_SECTION'].includes(role);
  }
  if (tab === 'accreditation' || tab === 'accreditation-overview' || tab === 'accreditation-naac' || tab === 'accreditation-nba' || tab === 'accreditation-evidence' || tab === 'accreditation-reports' || tab === 'naac' || tab === 'nba' || tab === 'iqac-accreditation') {
    return ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'VICE_PRESIDENT', 'PROVOST', 'PRESIDENT', 'PRINCIPAL', 'HOD', 'REGISTRAR', 'DEPUTY_REGISTRAR', 'IQAC', 'FACULTY'].includes(role);
  }
  if (
    tab === 'obe' || tab === 'obe-dashboard' || tab === 'course-outcomes' || tab === 'attainment' ||
    tab === 'program-outcomes' || tab === 'program-specific-outcomes' || tab === 'co-po-mapping' ||
    tab === 'co-pso-mapping' || tab === 'assessment-mapping' || tab === 'co-attainment' || tab === 'po-attainment'
  ) {
    if (role === 'STUDENT' && ['co-po-mapping', 'co-pso-mapping', 'assessment-mapping'].includes(tab)) {
      return false;
    }
    return ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'VICE_PRESIDENT', 'PROVOST', 'PRESIDENT', 'PRINCIPAL', 'HOD', 'REGISTRAR', 'DEPUTY_REGISTRAR', 'IQAC', 'FACULTY', 'STUDENT'].includes(role);
  }
  if (tab === 'grievance' || tab === 'anti-ragging' || tab === 'icc' || tab === 'student-grievance') {
    return ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'VICE_PRESIDENT', 'PROVOST', 'PRESIDENT', 'PRINCIPAL', 'HOD', 'REGISTRAR', 'DEPUTY_REGISTRAR', 'IQAC', 'FACULTY', 'STUDENT', 'STAFF'].includes(role);
  }
  if (
    tab === 'research' || tab === 'research-dashboard' || tab === 'publications' || tab === 'research-publications' ||
    tab === 'patents' || tab === 'research-patents' || tab === 'research-projects' || tab === 'research-grants' ||
    tab === 'research-scholars' || tab === 'research-consultancy' || tab === 'research-conferences' || tab === 'research-books' ||
    tab === 'research-awards' || tab === 'research-reports' || tab === 'research-naac'
  ) {
    return ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'VICE_PRESIDENT', 'PROVOST', 'PRESIDENT', 'PRINCIPAL', 'HOD', 'REGISTRAR', 'DEPUTY_REGISTRAR', 'IQAC', 'FACULTY', 'STUDENT', 'STUDENT_ADMIN', 'STUDENT_SECTION', 'ERP_COORDINATOR', 'MENTOR'].includes(role);
  }
  if (
    tab === 'startup-grants' || tab === 'startups' || tab === 'startups-directory' || tab === 'ssip' || tab === 'grants' ||
    tab === 'hackathons' || tab === 'incubation' || tab === 'incubation-centre' || tab === 'innovation' ||
    tab === 'innovation-dashboard' || tab === 'innovation-projects' || tab === 'innovation-mentors' ||
    tab === 'innovation-funding' || tab === 'industry-collaboration' || tab === 'innovation-events' ||
    tab === 'innovation-hackathons' || tab === 'innovation-awards' || tab === 'innovation-reports'
  ) {
    return ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'VICE_PRESIDENT', 'PROVOST', 'PRESIDENT', 'PRINCIPAL', 'HOD', 'REGISTRAR', 'DEPUTY_REGISTRAR', 'IQAC', 'FACULTY', 'STUDENT', 'STUDENT_ADMIN', 'STUDENT_SECTION', 'ERP_COORDINATOR', 'MENTOR'].includes(role);
  }
  if (
    tab === 'grants' || tab === 'grants-dashboard' || tab === 'grant-opportunities' || tab === 'grant-applications' ||
    tab === 'ssip-projects' || tab === 'grant-disbursements' || tab === 'grant-milestones' ||
    tab === 'grant-utilization' || tab === 'grant-documents' || tab === 'grant-reports' || tab === 'grant-closure' ||
    tab === 'funding' || tab === 'disbursement' || tab === 'milestone' || tab === 'utilization' || tab === 'seed-funding'
  ) {
    return ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'VICE_PRESIDENT', 'PROVOST', 'PRESIDENT', 'PRINCIPAL', 'HOD', 'REGISTRAR', 'DEPUTY_REGISTRAR', 'IQAC', 'FACULTY', 'STUDENT', 'STUDENT_ADMIN', 'STUDENT_SECTION', 'ERP_COORDINATOR', 'MENTOR'].includes(role);
  }
  if (tab === 'government-integrations' || tab === 'government-abc' || tab === 'government-digilocker') {
    return ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'VICE_PRESIDENT', 'PROVOST', 'PRESIDENT', 'PRINCIPAL', 'HOD', 'REGISTRAR', 'DEPUTY_REGISTRAR', 'IQAC', 'FACULTY', 'STUDENT'].includes(role);
  }
  if (tab === 'compliance-engine' || tab === 'compliance' || tab === 'accreditation-engine' || tab === 'nep-indicators') {
    return ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'VICE_PRESIDENT', 'PROVOST', 'PRESIDENT', 'PRINCIPAL', 'HOD', 'REGISTRAR', 'DEPUTY_REGISTRAR', 'IQAC', 'FACULTY', 'STUDENT'].includes(role);
  }
  if (role === 'STUDENT') {
    if (['settings', 'security-audit', 'student-search', 'students-search', 'students-directory', 'work-transfer', 'work-transfer-new', 'work-transfer-received', 'work-transfer-active', 'work-transfer-history', 'work-transfer-audit'].includes(tab)) {
      return false;
    }
  }
  if ([
    'student-search', 'students-search', 'students-directory', 
    'profile', 'mentor-profile', 'hod-profile', 'hoi-profile', 'section-profile', 'id-card', 
    'notifications',
    'work-transfer', 'work-transfer-new', 'work-transfer-received', 'work-transfer-active', 'work-transfer-history',
    'workload-transfer', 'delegate-work', 'faculty-work-transfer', 'hod-work-transfer', 'hoi-work-transfer'
  ].includes(tab)) {
    return true;
  }
  if (tab === 'work-transfer-audit' || tab === 'workload-audit' || tab === 'transfer-audit') {
    return ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'VICE_PRESIDENT', 'PROVOST', 'PRESIDENT', 'PRINCIPAL', 'HOD', 'REGISTRAR', 'DEPUTY_REGISTRAR', 'IQAC', 'EXAM_CELL'].includes(role);
  }
  if (tab.startsWith('ai-') || ['ai-control-center', 'ai-agents', 'ai-activity', 'ai-approvals', 'ai-policies', 'ai-audit-logs', 'ai-automation'].includes(tab)) {
    return ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'VICE_PRESIDENT', 'PROVOST', 'PRESIDENT', 'PRINCIPAL', 'HOD', 'REGISTRAR', 'DEPUTY_REGISTRAR', 'STUDENT_SECTION', 'FINANCE_OFFICER', 'ACCOUNTS_ADMIN', 'IQAC', 'FACULTY'].includes(role);
  }
  if (role === 'SUPER_ADMIN' || role === 'UNIVERSITY_ADMIN' || role === 'VICE_PRESIDENT' || role === 'PROVOST' || role === 'PRESIDENT') return true;
  const allowedList = ROLE_NAV_ORDER[role] || [];
  return allowedList.includes(tab);
};
