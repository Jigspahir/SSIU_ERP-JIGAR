import {
  LayoutDashboard, Building2, GraduationCap, CalendarDays,
  UserCheck, BookOpen, Clock, FileText, FileCheck, CalendarCheck,
  IndianRupee, FolderCheck, BarChart3, Settings, Award, MessageSquare, HelpCircle,
  Bell, Library, CheckSquare, Rocket, Wrench,
  Grid, Activity, ShieldAlert, ShieldCheck, Users2, FileSpreadsheet, UploadCloud, User,
  RotateCcw, RefreshCw, LogOut, Boxes, Package, Layers, Archive,
  Mail, Send, Inbox, Briefcase, History, UserPlus, FileStack, KeyRound, Users, CheckCircle2,
  FileSignature, Landmark, FileBox, FileQuestion, DollarSign, FileDown
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
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT', 'REGISTRAR', 'DEPUTY_REGISTRAR', 'IQAC', 'EXAM_CELL', 'STUDENT_SECTION', 'HOSTEL_ADMIN', 'LIBRARY_ADMIN', 'TRANSPORT_ADMIN', 'MAINTENANCE_ADMIN', 'ACCOUNTS_ADMIN'],
    category: 'Main'
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
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT'],
    category: 'Academic'
  },
  'timetable': {
    id: 'timetable',
    label: 'Timetable',
    icon: Clock,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT'],
    category: 'Academic'
  },
  'session-plan': {
    id: 'session-plan',
    label: 'Session Plan',
    icon: BookOpen,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT'],
    category: 'Academic'
  },
  'materials': {
    id: 'materials',
    label: 'Study Material',
    icon: FileText,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT'],
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
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN'],
    category: 'System'
  },
  'profile': {
    id: 'profile',
    label: 'My Profile',
    icon: User,
    allowedRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT', 'REGISTRAR', 'IQAC', 'EXAM_CELL', 'STUDENT_SECTION', 'HOSTEL_ADMIN', 'LIBRARY_ADMIN', 'TRANSPORT_ADMIN', 'MAINTENANCE_ADMIN', 'ACCOUNTS_ADMIN'],
    category: 'System'
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
  children?: StudentNavSubItem[];
}

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
    id: 'profile-group',
    label: 'Profile',
    icon: User,
    defaultTab: 'profile',
    children: [
      { id: 'profile', label: 'Student Profile', targetTab: 'profile' },
      { id: 'id-card', label: 'Digital ID Card', targetTab: 'id-card' }
    ]
  },
  {
    id: 'academic',
    label: 'Academic',
    icon: GraduationCap,
    defaultTab: 'subjects',
    children: [
      { id: 'academic-subjects', label: 'My Subjects', targetTab: 'subjects' },
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
      { id: 'fees-semester', label: 'Semester Fees', targetTab: 'fees-semester' },
      { id: 'fees-history', label: 'Payment History', targetTab: 'fees-history' },
      { id: 'fees-receipts', label: 'Receipts', targetTab: 'fees-receipts' },
      { id: 'fees-query', label: 'Fee Query', targetTab: 'fees-query' }
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
      { id: 'student-section-documents', label: 'My Documents', targetTab: 'student-section-documents' }
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
  {
    id: 'feedback',
    label: 'Feedback & Suggestions',
    icon: MessageSquare,
    defaultTab: 'feedback',
    children: [
      { id: 'feedback-give', label: 'Give Feedback', targetTab: 'feedback' },
      { id: 'feedback-my', label: 'My Feedback', targetTab: 'feedback' },
      { id: 'feedback-suggestions', label: 'Suggestions', targetTab: 'feedback' }
    ]
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
 * COMMON AUTHORIZED NOTESHEET NAVIGATION GROUP (12 Stages/Views)
 */
export const COMMON_NOTESHEET_NAV_GROUP: StudentNavGroup = {
  id: 'notesheet-group',
  label: 'Notesheet',
  icon: FileSignature,
  defaultTab: 'notesheet-create',
  children: [
    { id: 'note-sheets', label: 'Dashboard', targetTab: 'note-sheets' },
    { id: 'notesheet-create', label: 'Create Notesheet', targetTab: 'notesheet-create' },
    { id: 'notesheet-my', label: 'My Notesheets', targetTab: 'notesheet-my' },
    { id: 'notesheet-drafts', label: 'Drafts', targetTab: 'notesheet-drafts' },
    { id: 'notesheet-pending', label: 'Pending With Me', targetTab: 'notesheet-pending' },
    { id: 'notesheet-sent', label: 'Forwarded', targetTab: 'notesheet-sent' },
    { id: 'notesheet-returned', label: 'Returned', targetTab: 'notesheet-returned' },
    { id: 'notesheet-clarification', label: 'Clarification Required', targetTab: 'notesheet-clarification' },
    { id: 'notesheet-action-pending', label: 'Action Pending', targetTab: 'notesheet-action-pending' },
    { id: 'notesheet-approved', label: 'Approved', targetTab: 'notesheet-approved' },
    { id: 'notesheet-rejected', label: 'Rejected', targetTab: 'notesheet-rejected' },
    { id: 'notesheet-closed', label: 'Closed', targetTab: 'notesheet-closed' }
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
    id: 'profile-group',
    label: 'Profile',
    icon: User,
    defaultTab: 'profile',
    children: [
      { id: 'profile', label: 'Faculty Profile', targetTab: 'profile' }
    ]
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
      { id: 'faculty-attendance-reports', label: 'Attendance Reports', targetTab: 'attendance-reports' }
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
      { id: 'faculty-my-students', label: 'My Students', targetTab: 'my-students' },
      { id: 'faculty-student-academics', label: 'Student Academic Details', targetTab: 'student-academics' },
      { id: 'faculty-student-requests', label: 'Student Requests', targetTab: 'student-requests' }
    ]
  },
  {
    id: 'requests',
    label: 'Requests',
    icon: CheckSquare,
    defaultTab: 'requests-my-requests',
    children: [
      { id: 'faculty-requests-all', label: 'Student Requests', targetTab: 'requests-my-requests' },
      { id: 'faculty-requests-queries', label: 'Subject Queries', targetTab: 'requests-subject-query' },
      { id: 'faculty-requests-assigned', label: 'My Assigned Requests', targetTab: 'requests-assigned' }
    ]
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
  },
  {
    id: 'logout',
    label: 'Logout',
    icon: LogOut,
    defaultTab: 'logout'
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
    id: 'profile-group',
    label: 'Profile',
    icon: User,
    defaultTab: 'mentor-profile',
    children: [
      { id: 'mentor-profile', label: 'Mentor Profile', targetTab: 'mentor-profile' }
    ]
  },
  {
    id: 'mentees-group',
    label: 'My Mentees',
    icon: GraduationCap,
    defaultTab: 'mentee-list',
    children: [
      { id: 'mentee-list', label: 'Mentee List', targetTab: 'mentee-list' },
      { id: 'mentee-profile', label: 'Student Profile', targetTab: 'mentee-profile' },
      { id: 'mentee-academic-overview', label: 'Academic Overview', targetTab: 'mentee-academic-overview' },
      { id: 'mentee-attendance', label: 'Attendance', targetTab: 'mentee-attendance' },
      { id: 'mentee-academic-performance', label: 'Academic Performance', targetTab: 'mentee-academic-performance' }
    ]
  },
  {
    id: 'academic-group',
    label: 'Academic',
    icon: BookOpen,
    defaultTab: 'mentee-subjects',
    children: [
      { id: 'mentee-subjects', label: 'Student Subjects', targetTab: 'mentee-subjects' },
      { id: 'mentee-timetable', label: 'Timetable', targetTab: 'mentee-timetable' },
      { id: 'mentee-assignments', label: 'Assignments', targetTab: 'mentee-assignments' },
      { id: 'mentee-academic-progress', label: 'Academic Progress', targetTab: 'mentee-academic-progress' }
    ]
  },
  {
    id: 'attendance-group',
    label: 'Attendance',
    icon: Clock,
    defaultTab: 'mentee-attendance-overview',
    children: [
      { id: 'mentee-attendance-overview', label: 'Mentee Attendance', targetTab: 'mentee-attendance-overview' },
      { id: 'mentee-attendance-shortage', label: 'Attendance Shortage', targetTab: 'mentee-attendance-shortage' },
      { id: 'mentee-attendance-applications', label: 'Attendance Applications', targetTab: 'mentee-attendance-applications' }
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
    defaultTab: 'mentee-requests-pending',
    children: [
      { id: 'mentee-requests-pending', label: 'Pending Requests', targetTab: 'mentee-requests-pending' },
      { id: 'mentee-requests-assigned', label: 'Assigned Requests', targetTab: 'mentee-requests-assigned' },
      { id: 'mentee-requests-history', label: 'Request History', targetTab: 'mentee-requests-history' }
    ]
  },
  COMMON_NOTESHEET_NAV_GROUP,
  {
    id: 'feedback',
    label: 'Feedback',
    icon: Award,
    defaultTab: 'feedback'
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
  },
  {
    id: 'logout',
    label: 'Logout',
    icon: LogOut,
    defaultTab: 'logout'
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
    id: 'profile-group',
    label: 'Profile',
    icon: User,
    defaultTab: 'hod-profile',
    children: [
      { id: 'hod-profile', label: 'HOD Profile', targetTab: 'hod-profile' }
    ]
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
      { id: 'hod-students-list', label: 'Student List', targetTab: 'hod-students-list' },
      { id: 'hod-students-profile', label: 'Student Profile', targetTab: 'hod-students-profile' },
      { id: 'hod-students-performance', label: 'Academic Performance', targetTab: 'hod-students-performance' },
      { id: 'hod-students-at-risk', label: 'At-Risk Students', targetTab: 'hod-students-at-risk' },
      { id: 'hod-students-documents', label: 'Student Documents', targetTab: 'hod-students-documents' }
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
    defaultTab: 'hod-requests-pending',
    children: [
      { id: 'hod-requests-pending', label: 'Pending Requests', targetTab: 'hod-requests-pending' },
      { id: 'hod-requests-dept', label: 'Department Requests', targetTab: 'hod-requests-dept' },
      { id: 'hod-requests-escalated', label: 'Escalated Requests', targetTab: 'hod-requests-escalated' },
      { id: 'hod-requests-history', label: 'Request History', targetTab: 'hod-requests-history' }
    ]
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
  },
  {
    id: 'logout',
    label: 'Logout',
    icon: LogOut,
    defaultTab: 'logout'
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
    id: 'profile-group',
    label: 'Profile',
    icon: User,
    defaultTab: 'hoi-profile',
    children: [
      { id: 'hoi-profile', label: 'HOI / Principal Profile', targetTab: 'hoi-profile' }
    ]
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
      { id: 'hoi-students-list', label: 'Student List', targetTab: 'hoi-students-list' },
      { id: 'hoi-students-profile', label: 'Student Profile', targetTab: 'hoi-students-profile' },
      { id: 'hoi-students-attendance', label: 'Attendance', targetTab: 'hoi-students-attendance' },
      { id: 'hoi-students-performance', label: 'Academic Performance', targetTab: 'hoi-students-performance' },
      { id: 'hoi-students-at-risk', label: 'At-Risk Students', targetTab: 'hoi-students-at-risk' },
      { id: 'hoi-students-documents', label: 'Student Documents', targetTab: 'hoi-students-documents' }
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
    defaultTab: 'hoi-requests-pending',
    children: [
      { id: 'hoi-requests-pending', label: 'Pending Requests', targetTab: 'hoi-requests-pending' },
      { id: 'hoi-requests-dept', label: 'Department Requests', targetTab: 'hoi-requests-dept' },
      { id: 'hoi-requests-escalated', label: 'Escalated Requests', targetTab: 'hoi-requests-escalated' },
      { id: 'hoi-requests-history', label: 'Request History', targetTab: 'hoi-requests-history' }
    ]
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
  },
  {
    id: 'logout',
    label: 'Logout',
    icon: LogOut,
    defaultTab: 'logout'
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
    id: 'profile-group',
    label: 'Profile',
    icon: User,
    defaultTab: 'section-profile',
    children: [
      { id: 'section-profile', label: 'Section Profile', targetTab: 'section-profile' }
    ]
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
    defaultTab: 'section-requests-pending',
    children: [
      { id: 'section-requests-pending', label: 'Pending Requests', targetTab: 'section-requests-pending' },
      { id: 'section-requests-assigned', label: 'Assigned Requests', targetTab: 'section-requests-assigned' },
      { id: 'section-requests-dept', label: 'Department Requests', targetTab: 'section-requests-dept' },
      { id: 'section-requests-escalated', label: 'Escalated Requests', targetTab: 'section-requests-escalated' },
      { id: 'section-requests-history', label: 'Request History', targetTab: 'section-requests-history' }
    ]
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
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    defaultTab: 'settings'
  },
  {
    id: 'logout',
    label: 'Logout',
    icon: LogOut,
    defaultTab: 'logout'
  }
];

/**
 * FINAL REGISTRAR / REGISTRAR OFFICE SIDEBAR STRUCTURE (21 Complete Sections)
 */
export const REGISTRAR_NAVIGATION_STRUCTURE: StudentNavGroup[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    defaultTab: 'dashboard'
  },
  {
    id: 'university-group',
    label: 'University Administration',
    icon: Building2,
    defaultTab: 'reg-uni-overview',
    children: [
      { id: 'reg-uni-overview', label: 'University Overview', targetTab: 'reg-uni-overview' },
      { id: 'reg-uni-institutes', label: 'Institute Overview', targetTab: 'reg-uni-institutes' },
      { id: 'reg-uni-departments', label: 'Department Overview', targetTab: 'reg-uni-departments' },
      { id: 'reg-uni-programs', label: 'Program Overview', targetTab: 'reg-uni-programs' },
      { id: 'reg-uni-structure', label: 'Organization Structure', targetTab: 'reg-uni-structure' }
    ]
  },
  {
    id: 'academic-group',
    label: 'Academic Administration',
    icon: BookOpen,
    defaultTab: 'reg-academic-year',
    children: [
      { id: 'reg-academic-year', label: 'Academic Year', targetTab: 'reg-academic-year' },
      { id: 'reg-academic-semesters', label: 'Semester', targetTab: 'reg-academic-semesters' },
      { id: 'reg-academic-calendar', label: 'Academic Calendar', targetTab: 'reg-academic-calendar' },
      { id: 'reg-academic-overview', label: 'Academic Overview', targetTab: 'reg-academic-overview' }
    ]
  },
  {
    id: 'students-group',
    label: 'Student Administration',
    icon: GraduationCap,
    defaultTab: 'reg-students-search',
    children: [
      { id: 'reg-students-search', label: 'Student Search', targetTab: 'reg-students-search' },
      { id: 'reg-students-profile', label: 'Student Profile', targetTab: 'reg-students-profile' },
      { id: 'reg-students-records', label: 'Student Records', targetTab: 'reg-students-records' },
      { id: 'reg-students-status', label: 'Student Status', targetTab: 'reg-students-status' },
      { id: 'reg-students-international', label: 'International Students', targetTab: 'reg-students-international' },
      { id: 'reg-students-stats', label: 'Student Statistics', targetTab: 'reg-students-stats' }
    ]
  },
  {
    id: 'faculty-group',
    label: 'Faculty & Staff',
    icon: UserCheck,
    defaultTab: 'reg-faculty-overview',
    children: [
      { id: 'reg-faculty-overview', label: 'Faculty Overview', targetTab: 'reg-faculty-overview' },
      { id: 'reg-faculty-staff', label: 'Staff Overview', targetTab: 'reg-faculty-staff' },
      { id: 'reg-faculty-inst-strength', label: 'Institute-wise Strength', targetTab: 'reg-faculty-inst-strength' },
      { id: 'reg-faculty-dept-strength', label: 'Department-wise Strength', targetTab: 'reg-faculty-dept-strength' }
    ]
  },
  {
    id: 'notesheet-group',
    label: 'Notesheet',
    icon: FileSignature,
    defaultTab: 'reg-notesheet-create',
    children: [
      { id: 'reg-notesheets', label: 'Dashboard', targetTab: 'reg-notesheets' },
      { id: 'reg-notesheet-create', label: 'Create Notesheet', targetTab: 'reg-notesheet-create' },
      { id: 'reg-notesheet-my', label: 'My Notesheets', targetTab: 'reg-notesheet-my' },
      { id: 'reg-notesheet-drafts', label: 'Drafts', targetTab: 'reg-notesheet-drafts' },
      { id: 'reg-notesheet-pending', label: 'Pending With Me', targetTab: 'reg-notesheet-pending' },
      { id: 'reg-notesheet-sent', label: 'Forwarded', targetTab: 'reg-notesheet-sent' },
      { id: 'reg-notesheet-returned', label: 'Returned', targetTab: 'reg-notesheet-returned' },
      { id: 'reg-notesheet-clarification', label: 'Clarification Required', targetTab: 'reg-notesheet-clarification' },
      { id: 'reg-notesheet-action-pending', label: 'Action Pending', targetTab: 'reg-notesheet-action-pending' },
      { id: 'reg-notesheet-approved', label: 'Approved', targetTab: 'reg-notesheet-approved' },
      { id: 'reg-notesheet-rejected', label: 'Rejected', targetTab: 'reg-notesheet-rejected' },
      { id: 'reg-notesheet-closed', label: 'Closed', targetTab: 'reg-notesheet-closed' }
    ]
  },
  {
    id: 'requests-group',
    label: 'Requests & Service Desk',
    icon: MessageSquare,
    defaultTab: 'reg-requests-pending',
    children: [
      { id: 'reg-requests-pending', label: 'Pending Requests', targetTab: 'reg-requests-pending' },
      { id: 'reg-requests-escalated', label: 'Escalated Requests', targetTab: 'reg-requests-escalated' },
      { id: 'reg-requests-assigned', label: 'Assigned Requests', targetTab: 'reg-requests-assigned' },
      { id: 'reg-requests-dept', label: 'Department Requests', targetTab: 'reg-requests-dept' },
      { id: 'reg-requests-uni', label: 'University Requests', targetTab: 'reg-requests-uni' },
      { id: 'reg-requests-history', label: 'Request History', targetTab: 'reg-requests-history' }
    ]
  },
  {
    id: 'approvals-group',
    label: 'Approval Center',
    icon: CheckSquare,
    defaultTab: 'reg-approvals-pending',
    children: [
      { id: 'reg-approvals-pending', label: 'Pending Approvals', targetTab: 'reg-approvals-pending' },
      { id: 'reg-approvals-academic', label: 'Academic Approvals', targetTab: 'reg-approvals-academic' },
      { id: 'reg-approvals-admin', label: 'Administrative Approvals', targetTab: 'reg-approvals-admin' },
      { id: 'reg-approvals-financial', label: 'Financial Approvals', targetTab: 'reg-approvals-financial' },
      { id: 'reg-approvals-special', label: 'Special Approvals', targetTab: 'reg-approvals-special' }
    ]
  },
  {
    id: 'examination-group',
    label: 'Examination Oversight',
    icon: Award,
    defaultTab: 'reg-exam-overview',
    children: [
      { id: 'reg-exam-overview', label: 'Exam Overview', targetTab: 'reg-exam-overview' },
      { id: 'reg-exam-forms', label: 'Exam Form Status', targetTab: 'reg-exam-forms' },
      { id: 'reg-exam-eligibility', label: 'Exam Eligibility', targetTab: 'reg-exam-eligibility' },
      { id: 'reg-exam-halltickets', label: 'Hall Ticket Status', targetTab: 'reg-exam-halltickets' },
      { id: 'reg-exam-centres', label: 'Exam Centre Status', targetTab: 'reg-exam-centres' },
      { id: 'reg-exam-results', label: 'Result Status', targetTab: 'reg-exam-results' }
    ]
  },
  {
    id: 'records-group',
    label: 'Documents & Certificates',
    icon: FolderCheck,
    defaultTab: 'reg-docs-overview',
    children: [
      { id: 'reg-docs-overview', label: 'Document Overview', targetTab: 'reg-docs-overview' },
      { id: 'reg-docs-certificates', label: 'Certificate Requests', targetTab: 'reg-docs-certificates' },
      { id: 'reg-docs-transcripts', label: 'Transcript Records', targetTab: 'reg-docs-transcripts' },
      { id: 'reg-docs-degrees', label: 'Degree Records', targetTab: 'reg-docs-degrees' },
      { id: 'reg-docs-migration', label: 'Migration Records', targetTab: 'reg-docs-migration' },
      { id: 'reg-docs-verification', label: 'Verification Status', targetTab: 'reg-docs-verification' }
    ]
  },
  {
    id: 'finance-group',
    label: 'Financial Overview',
    icon: IndianRupee,
    defaultTab: 'reg-finance-fees',
    children: [
      { id: 'reg-finance-fees', label: 'Fee Overview', targetTab: 'reg-finance-fees' },
      { id: 'reg-finance-collection', label: 'Collection Overview', targetTab: 'reg-finance-collection' },
      { id: 'reg-finance-pending', label: 'Pending Fees', targetTab: 'reg-finance-pending' },
      { id: 'reg-finance-notesheets', label: 'Financial Notesheets', targetTab: 'reg-finance-notesheets' },
      { id: 'reg-finance-reports', label: 'Finance Reports', targetTab: 'reg-finance-reports' }
    ]
  },
  {
    id: 'correspondence-group',
    label: 'Official Correspondence',
    icon: Mail,
    defaultTab: 'reg-corr-incoming',
    children: [
      { id: 'reg-corr-incoming', label: 'Incoming Letters', targetTab: 'reg-corr-incoming' },
      { id: 'reg-corr-outgoing', label: 'Outgoing Letters', targetTab: 'reg-corr-outgoing' },
      { id: 'reg-corr-circulars', label: 'Circulars', targetTab: 'reg-corr-circulars' },
      { id: 'reg-corr-external', label: 'External Communication', targetTab: 'reg-corr-external' },
      { id: 'reg-corr-register', label: 'Correspondence Register', targetTab: 'reg-corr-register' }
    ]
  },
  {
    id: 'files-group',
    label: 'File & Record Management',
    icon: Archive,
    defaultTab: 'reg-files-register',
    children: [
      { id: 'reg-files-register', label: 'Official File Register', targetTab: 'reg-files-register' },
      { id: 'reg-files-movement', label: 'File Movement', targetTab: 'reg-files-movement' },
      { id: 'reg-files-archive', label: 'Archive', targetTab: 'reg-files-archive' },
      { id: 'reg-files-search', label: 'Record Search', targetTab: 'reg-files-search' }
    ]
  },
  {
    id: 'committees-group',
    label: 'Committee Management',
    icon: Users,
    defaultTab: 'reg-comm-master',
    children: [
      { id: 'reg-comm-master', label: 'Committee Master', targetTab: 'reg-comm-master' },
      { id: 'reg-comm-members', label: 'Members', targetTab: 'reg-comm-members' },
      { id: 'reg-comm-meetings', label: 'Meetings', targetTab: 'reg-comm-meetings' },
      { id: 'reg-comm-agenda', label: 'Agenda', targetTab: 'reg-comm-agenda' },
      { id: 'reg-comm-mom', label: 'MOM', targetTab: 'reg-comm-mom' },
      { id: 'reg-comm-actions', label: 'Action Items', targetTab: 'reg-comm-actions' }
    ]
  },
  {
    id: 'notices-group',
    label: 'Notices & Circulars',
    icon: Bell,
    defaultTab: 'reg-notices-published',
    children: [
      { id: 'reg-notices-create', label: 'Create Notice', targetTab: 'reg-notices-create' },
      { id: 'reg-notices-published', label: 'Published Notices', targetTab: 'reg-notices-published' },
      { id: 'reg-notices-circulars', label: 'Circulars', targetTab: 'reg-notices-circulars' },
      { id: 'reg-notices-history', label: 'Notice History', targetTab: 'reg-notices-history' }
    ]
  },
  {
    id: 'inventory-group',
    label: 'Inventory Overview',
    icon: Boxes,
    defaultTab: 'reg-inv-inst',
    children: [
      { id: 'reg-inv-inst', label: 'Institute Assets', targetTab: 'reg-inv-inst' },
      { id: 'reg-inv-dept', label: 'Department Assets', targetTab: 'reg-inv-dept' },
      { id: 'reg-inv-transfers', label: 'Transfers', targetTab: 'reg-inv-transfers' },
      { id: 'reg-inv-maintenance', label: 'Maintenance', targetTab: 'reg-inv-maintenance' },
      { id: 'reg-inv-reports', label: 'Inventory Reports', targetTab: 'reg-inv-reports' }
    ]
  },
  {
    id: 'reports-group',
    label: 'Reports & Analytics',
    icon: FileSpreadsheet,
    defaultTab: 'reg-rep-uni',
    children: [
      { id: 'reg-rep-uni', label: 'University Reports', targetTab: 'reg-rep-uni' },
      { id: 'reg-rep-inst', label: 'Institute Reports', targetTab: 'reg-rep-inst' },
      { id: 'reg-rep-dept', label: 'Department Reports', targetTab: 'reg-rep-dept' },
      { id: 'reg-rep-student', label: 'Student Reports', targetTab: 'reg-rep-student' },
      { id: 'reg-rep-academic', label: 'Academic Reports', targetTab: 'reg-rep-academic' },
      { id: 'reg-rep-faculty', label: 'Faculty Reports', targetTab: 'reg-rep-faculty' },
      { id: 'reg-rep-exam', label: 'Examination Reports', targetTab: 'reg-rep-exam' },
      { id: 'reg-rep-financial', label: 'Financial Reports', targetTab: 'reg-rep-financial' },
      { id: 'reg-rep-inventory', label: 'Inventory Reports', targetTab: 'reg-rep-inventory' },
      { id: 'reg-rep-custom', label: 'Custom Reports', targetTab: 'reg-rep-custom' }
    ]
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    defaultTab: 'notifications'
  },
  {
    id: 'audit-group',
    label: 'Audit & Activity',
    icon: ShieldCheck,
    defaultTab: 'reg-audit-log',
    children: [
      { id: 'reg-audit-log', label: 'Audit Log', targetTab: 'reg-audit-log' },
      { id: 'reg-audit-login', label: 'Login History', targetTab: 'reg-audit-login' },
      { id: 'reg-audit-approvals', label: 'Approval History', targetTab: 'reg-audit-approvals' },
      { id: 'reg-audit-notesheets', label: 'Notesheet History', targetTab: 'reg-audit-notesheets' },
      { id: 'reg-audit-system', label: 'System Activity', targetTab: 'reg-audit-system' }
    ]
  },
  {
    id: 'excel-group',
    label: 'Excel Center',
    icon: FileSpreadsheet,
    defaultTab: 'reg-excel-templates',
    children: [
      { id: 'reg-excel-templates', label: 'Excel Templates', targetTab: 'reg-excel-templates' },
      { id: 'reg-excel-history', label: 'Import History', targetTab: 'reg-excel-history' },
      { id: 'reg-excel-failed', label: 'Failed Imports', targetTab: 'reg-excel-failed' },
      { id: 'reg-excel-export', label: 'Export Center', targetTab: 'reg-excel-export' }
    ]
  },
  {
    id: 'settings-group',
    label: 'Settings',
    icon: Settings,
    defaultTab: 'profile',
    children: [
      { id: 'profile', label: 'Profile', targetTab: 'profile' },
      { id: 'reg-preferences', label: 'Preferences', targetTab: 'reg-preferences' },
      { id: 'reg-change-password', label: 'Change Password', targetTab: 'reg-change-password' }
    ]
  },
  {
    id: 'logout',
    label: 'Logout',
    icon: LogOut,
    defaultTab: 'logout'
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
  {
    id: 'profile',
    label: 'My Profile',
    icon: User,
    defaultTab: 'profile'
  }
];

/**
 * Strict Role-Based Menu Sequences
 */
export const ROLE_NAV_ORDER: Record<string, string[]> = {
  DEPUTY_REGISTRAR: [
    'dashboard',
    'reg-uni-institutes', 'reg-uni-departments', 'reg-uni-programs', 'reg-academic-year',
    'note-sheets', 'notesheet-create', 'notesheet-my', 'notesheet-drafts', 'notesheet-pending', 'notesheet-sent', 'notesheet-returned', 'notesheet-clarification', 'notesheet-action-pending', 'notesheet-approved', 'notesheet-rejected', 'notesheet-closed',
    'inward-outward',
    'reg-corr-incoming', 'reg-corr-outgoing', 'reg-corr-circulars', 'reg-corr-external', 'reg-corr-register',
    'reg-approvals-pending', 'reg-approvals-academic', 'reg-approvals-admin', 'reg-approvals-financial', 'reg-approvals-special',
    'notifications',
    'reg-rep-uni', 'reg-rep-inst', 'reg-rep-dept',
    'profile'
  ],
  REGISTRAR: [
    'dashboard',
    'reg-uni-overview', 'reg-uni-institutes', 'reg-uni-departments', 'reg-uni-programs', 'reg-uni-structure',
    'reg-academic-year', 'reg-academic-semesters', 'reg-academic-calendar', 'reg-academic-overview',
    'reg-students-search', 'reg-students-profile', 'reg-students-records', 'reg-students-status', 'reg-students-international', 'reg-students-stats',
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
    'profile', 'reg-preferences', 'reg-change-password',
    'logout'
  ],
  STUDENT_SECTION: [
    'dashboard', 'section-profile',
    'section-students-list', 'section-students-profile', 'section-students-academic', 'section-students-docs', 'section-students-status',
    'section-docs-verification', 'section-docs-pending', 'section-docs-verified', 'section-docs-reupload', 'section-docs-locked', 'section-docs-master',
    'section-service-bonafide', 'section-service-transcript', 'section-service-degree', 'section-service-migration', 'section-service-transfer', 'section-service-character', 'section-service-idcard', 'section-service-duplicate-id', 'section-service-other',
    'section-requests-pending', 'section-requests-assigned', 'section-requests-dept', 'section-requests-escalated', 'section-requests-history',
    'section-fees-config', 'section-fees-pending', 'section-fees-history', 'section-fees-receipts', 'section-fees-refunds',
    'section-id-generate', 'section-id-replacement', 'section-id-active', 'section-id-blocked', 'section-id-replaced', 'section-id-verify',
    'section-academic-records', 'section-academic-semesters', 'section-academic-results', 'section-academic-transcripts', 'section-academic-completion',
    'notices', 'notifications', 'inventory-assets', 'note-sheets', 'notesheet-create', 'notesheet-pending', 'notesheet-my', 'notesheet-drafts', 'notesheet-sent', 'notesheet-returned', 'notesheet-clarification', 'notesheet-action-pending', 'notesheet-approved', 'notesheet-rejected', 'notesheet-closed', 'inward-outward', 'work-diary',
    'section-reports-student', 'section-reports-docs', 'section-reports-service', 'section-reports-requests', 'section-reports-payments',
    'settings'
  ],
  PRINCIPAL: [
    'dashboard', 'hoi-profile',
    'hoi-inst-overview', 'hoi-inst-departments', 'hoi-inst-hods', 'hoi-inst-programs', 'hoi-inst-faculty', 'hoi-inst-students', 'hoi-inst-sections',
    'hoi-academic-overview', 'hoi-academic-programs', 'hoi-academic-subjects', 'hoi-academic-allocation', 'hoi-timetable', 'hoi-session-plans', 'hoi-calendar', 'hoi-academic-performance',
    'hoi-students-list', 'hoi-students-profile', 'hoi-students-attendance', 'hoi-students-performance', 'hoi-students-at-risk', 'hoi-students-documents',
    'hoi-faculty-list', 'hoi-faculty-workload', 'hoi-faculty-allocation', 'hoi-faculty-attendance', 'hoi-faculty-performance',
    'hoi-attendance-institute', 'hoi-attendance-shortage', 'hoi-attendance-comparison', 'hoi-attendance-approvals',
    'hoi-exam-eligibility', 'hoi-exam-attendance-approvals', 'hoi-exam-info', 'hoi-exam-reports',
    'hoi-requests-pending', 'hoi-requests-dept', 'hoi-requests-escalated', 'hoi-requests-history',
    'hoi-docs-students', 'hoi-docs-overview',
    'hoi-feedback-student', 'hoi-feedback-faculty', 'hoi-feedback-department', 'hoi-feedback-institute',
    'hoi-reports-academic', 'hoi-reports-student', 'hoi-reports-faculty', 'hoi-reports-attendance', 'hoi-reports-examination', 'hoi-reports-institute',
    'notices', 'events', 'notifications', 'inventory-assets', 'note-sheets', 'notesheet-create', 'notesheet-pending', 'notesheet-my', 'notesheet-drafts', 'notesheet-sent', 'notesheet-returned', 'notesheet-clarification', 'notesheet-action-pending', 'notesheet-approved', 'notesheet-rejected', 'notesheet-closed', 'inward-outward', 'work-diary', 'settings'
  ],
  HOD: [
    'dashboard', 'hod-profile',
    'hod-dept-overview', 'hod-dept-students', 'hod-dept-faculty', 'hod-dept-programs', 'hod-dept-semesters', 'hod-dept-sections',
    'hod-academic-subjects', 'hod-faculty-allocation', 'hod-timetable', 'hod-session-plans', 'hod-materials', 'hod-assignments', 'hod-quiz', 'hod-calendar',
    'hod-attendance-overview', 'hod-attendance-shortage', 'hod-subject-attendance', 'hod-attendance-approvals',
    'hod-students-list', 'hod-students-profile', 'hod-students-performance', 'hod-students-at-risk', 'hod-students-documents',
    'hod-faculty-list', 'hod-faculty-workload', 'hod-faculty-subject-allocation', 'hod-faculty-performance',
    'hod-exam-eligibility', 'hod-exam-attendance-approvals', 'hod-exam-info', 'hod-exam-requests',
    'hod-requests-pending', 'hod-requests-dept', 'hod-requests-escalated', 'hod-requests-history',
    'hod-docs-students', 'hod-docs-overview',
    'hod-feedback-faculty', 'hod-feedback-student', 'hod-feedback-department',
    'notices', 'events', 'inventory-assets', 'note-sheets', 'notesheet-create', 'notesheet-pending', 'notesheet-my', 'notesheet-drafts', 'notesheet-sent', 'notesheet-returned', 'notesheet-clarification', 'notesheet-action-pending', 'notesheet-approved', 'notesheet-rejected', 'notesheet-closed', 'inward-outward', 'work-diary',
    'hod-reports-academic', 'hod-reports-attendance', 'hod-reports-student', 'hod-reports-faculty', 'hod-reports-department',
    'notifications', 'settings'
  ],
  MENTOR: [
    'dashboard', 'mentor-profile',
    'mentee-list', 'mentee-profile', 'mentee-academic-overview', 'mentee-attendance', 'mentee-academic-performance',
    'mentee-subjects', 'mentee-timetable', 'mentee-assignments', 'mentee-academic-progress',
    'mentee-attendance-overview', 'mentee-attendance-shortage', 'mentee-attendance-applications',
    'mentee-exam-eligibility', 'mentee-exam-attendance-approvals', 'mentee-exam-requests',
    'mentee-docs-pending', 'mentee-docs-verified', 'mentee-docs-history',
    'mentee-requests-pending', 'mentee-requests-assigned', 'mentee-requests-history',
    'note-sheets', 'notesheet-create', 'notesheet-pending', 'notesheet-my', 'notesheet-drafts', 'notesheet-sent', 'notesheet-returned', 'notesheet-clarification', 'notesheet-action-pending', 'notesheet-approved', 'notesheet-rejected', 'notesheet-closed',
    'feedback', 'notices', 'events', 'notifications', 'settings'
  ],
  STUDENT: [
    'dashboard',
    'profile', 'id-card',
    'academic', 'subjects', 'timetable', 'attendance', 'assignments', 'materials', 'quiz',
    'examination', 'exam-forms', 'exam-fees-student', 'exam-backlog', 'exam-reassessment', 'exam-hallticket', 'exam-results',
    'fees', 'fees-semester', 'fees-history', 'fees-receipts', 'fees-query',
    'student-section', 'student-section-services', 'student-section-requests', 'student-section-documents', 'certificates',
    'requests', 'requests-subject-query', 'requests-complaint', 'requests-my-requests',
    'feedback',
    'notices', 'events', 'hostel', 'transport', 'tickets', 'service-desk', 'notifications'
  ],

  FACULTY: [
    'dashboard',
    'profile',
    'subjects', 'timetable', 'session-plan', 'materials', 'assignments', 'quiz', 'calendar',
    'attendance', 'attendance-history', 'subject-attendance', 'attendance-reports',
    'exam-duties', 'exam-schedule', 'attendance-applications', 'exam-dashboard',
    'my-students', 'student-academics', 'student-requests', 'students',
    'requests', 'requests-subject-query', 'requests-my-requests', 'requests-assigned',
    'documents', 'student-documents', 'pending-verification', 'document-master',
    'feedback', 'inventory-assets', 'note-sheets', 'notesheet-create', 'notesheet-pending', 'notesheet-my', 'notesheet-drafts', 'notesheet-sent', 'notesheet-returned', 'notesheet-clarification', 'notesheet-action-pending', 'notesheet-approved', 'notesheet-rejected', 'notesheet-closed', 'inward-outward', 'work-diary',
    'notices', 'events', 'notifications', 'settings',
    'edp-duties', 'mentor', 'tickets'
  ],

  EXAM_CELL: [
    'dashboard', 'exam-cell', 'exams', 'exam-schedule', 'exam-eligibility', 'exam-forms', 'exam-fees',
    'exam-hallticket', 'exam-marks', 'exam-results', 'exam-centres', 'exam-seating',
    'exam-edp-duty', 'exam-day-control', 'inventory-assets', 'note-sheets', 'notesheet-create', 'notesheet-pending', 'notesheet-my', 'notesheet-drafts', 'notesheet-sent', 'notesheet-returned', 'notesheet-clarification', 'notesheet-action-pending', 'notesheet-approved', 'notesheet-rejected', 'notesheet-closed', 'inward-outward', 'work-diary', 'reports', 'bulk-import', 'profile'
  ],

  ACCOUNTS_ADMIN: [
    'dashboard', 'accounts-admin', 'fees', 'students', 'inventory-assets', 'note-sheets', 'notesheet-create', 'notesheet-pending', 'notesheet-my', 'notesheet-drafts', 'notesheet-sent', 'notesheet-returned', 'notesheet-clarification', 'notesheet-action-pending', 'notesheet-approved', 'notesheet-rejected', 'notesheet-closed', 'inward-outward', 'work-diary', 'reports', 'bulk-import', 'profile'
  ],

  HOSTEL_ADMIN: [
    'dashboard', 'hostel-admin', 'students', 'tickets', 'notifications', 'inventory-assets', 'note-sheets', 'notesheet-create', 'notesheet-pending', 'notesheet-my', 'notesheet-drafts', 'notesheet-sent', 'notesheet-returned', 'notesheet-clarification', 'notesheet-action-pending', 'notesheet-approved', 'notesheet-rejected', 'notesheet-closed', 'inward-outward', 'work-diary', 'reports', 'bulk-import', 'profile'
  ],

  TRANSPORT_ADMIN: [
    'dashboard', 'transport-admin', 'students', 'inventory-assets', 'note-sheets', 'notesheet-create', 'notesheet-pending', 'notesheet-my', 'notesheet-drafts', 'notesheet-sent', 'notesheet-returned', 'notesheet-clarification', 'notesheet-action-pending', 'notesheet-approved', 'notesheet-rejected', 'notesheet-closed', 'inward-outward', 'work-diary', 'reports', 'bulk-import', 'profile'
  ],

  IQAC: [
    'dashboard', 'iqac', 'inward-outward', 'requests', 'edp-duties', 'faculty',
    'feedback', 'reports', 'inventory-assets', 'note-sheets', 'notesheet-create', 'notesheet-pending', 'notesheet-my', 'notesheet-drafts', 'notesheet-sent', 'notesheet-returned', 'notesheet-clarification', 'notesheet-action-pending', 'notesheet-approved', 'notesheet-rejected', 'notesheet-closed', 'work-diary', 'profile'
  ],

  SUPER_ADMIN: [
    'dashboard', 'accounts-admin', 'registrar', 'iqac', 'exam-cell', 'student-section', 'hostel-admin', 'library-admin', 'transport-admin', 'maintenance-admin',
    'students', 'mentor-assignment', 'faculty', 'departments', 'programs', 'subjects', 'document-master', 'hr',
    'calendar', 'attendance', 'exam-dashboard', 'exam-eligibility', 'fees', 'crm', 'certificates',
    'requests', 'edp-duties', 'tickets', 'feedback', 'notices', 'events', 'reports', 'bulk-import', 'settings', 'security-audit', 'inventory-assets', 'note-sheets', 'notesheet-create', 'notesheet-pending', 'notesheet-my', 'notesheet-drafts', 'notesheet-sent', 'notesheet-returned', 'notesheet-clarification', 'notesheet-action-pending', 'notesheet-approved', 'notesheet-rejected', 'notesheet-closed', 'inward-outward', 'work-diary', 'profile'
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
  if (role === 'SUPER_ADMIN' || role === 'UNIVERSITY_ADMIN') return true;
  const allowedList = ROLE_NAV_ORDER[role] || [];
  return allowedList.includes(tab);
};
