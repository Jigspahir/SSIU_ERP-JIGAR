import { db } from './db';
import { moduleQueryEngineService } from './moduleQueryEngineService';
import {
  User, UserRole, UserAuthorizationContext, NoteSheet,
  ApprovalRequest, Student, Faculty
} from '../types';

export interface DashboardKPICard {
  kpiId: string;
  title: string;
  description: string;
  value: number | string;
  status?: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'SUCCESS';
  trend?: string;
  drillDownRoute: string;
  category: 'ATTENTION' | 'ACADEMIC' | 'ADMINISTRATIVE' | 'GOVERNANCE' | 'INVENTORY';
}

export interface AttentionItem {
  id: string;
  title: string;
  entityType: 'NOTESHEET' | 'REQUEST' | 'ATTENDANCE' | 'EXAMINATION' | 'TASK';
  entityId: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  createdAt: string;
  actionRoute: string;
  summary: string;
}

export interface RiskAlertItem {
  id: string;
  title: string;
  riskCategory: 'ATTENDANCE_DEFICIT' | 'EXAM_BACKLOG' | 'PENDING_APPROVAL_SLA' | 'UNALLOCATED_WORKLOAD' | 'STAFFING';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  description: string;
  affectedEntityId?: string;
  recommendedAction: string;
}

export interface UniversalDashboardPayload {
  dashboardType: 'REGISTRAR' | 'HOI' | 'HOD' | 'FACULTY' | 'MENTOR' | 'DEPUTY_REGISTRAR' | 'STUDENT' | 'MULTI_ROLE';
  scopeLabel: string;
  academicYear: string;
  semesterTerm: string;
  attentionItems: AttentionItem[];
  kpis: DashboardKPICard[];
  risks: RiskAlertItem[];
  recentActivity: Array<{ id: string; title: string; timestamp: string; actor: string }>;
  quickActions: Array<{ id: string; label: string; icon?: string; route: string; permission: string }>;
  subSections?: Record<string, any>;
}

class DashboardKpiService {
  private static instance: DashboardKpiService;

  private constructor() {}

  public static getInstance(): DashboardKpiService {
    if (!DashboardKpiService.instance) {
      DashboardKpiService.instance = new DashboardKpiService();
    }
    return DashboardKpiService.instance;
  }

  /**
   * Central role-aware & scope-aware dashboard engine
   */
  public getDashboardForUser(context: UserAuthorizationContext): UniversalDashboardPayload {
    const role = String(context.activeRole);
    const assignedRoles = context.assignedRoles || [context.activeRole];
    const isMultiRole = assignedRoles.length > 1;

    // 1. Attention Engine: Collect actionable items pending with current user
    const pendingNotesheets = moduleQueryEngineService.getPendingNotesheetsForUser(context);
    const pendingRequests = moduleQueryEngineService.getRequestsForUser(context, { status: 'PENDING' });

    const attentionItems: AttentionItem[] = [];

    pendingNotesheets.records.forEach(ns => {
      attentionItems.push({
        id: `att-ns-${ns.id}`,
        title: `Notesheet Approval Pending: ${ns.noteSheetNumber}`,
        entityType: 'NOTESHEET',
        entityId: ns.id,
        severity: ns.financialRequirement ? 'HIGH' : 'MEDIUM',
        createdAt: ns.createdAt,
        actionRoute: `/reg-notesheet-details/${ns.id}`,
        summary: `${ns.subject} (${ns.department || 'Academic'})`
      });
    });

    pendingRequests.records.forEach(req => {
      attentionItems.push({
        id: `att-req-${req.id}`,
        title: `Academic Request Pending: ${req.id}`,
        entityType: 'REQUEST',
        entityId: req.id,
        severity: 'MEDIUM',
        createdAt: req.createdAt,
        actionRoute: `/requests/${req.id}`,
        summary: req.description || req.title || String(req.category)
      });
    });



    // 2. Risk Engine: Identify real data-driven risks
    const risks: RiskAlertItem[] = [];
    if (pendingNotesheets.totalCount > 5) {
      risks.push({
        id: 'risk-ns-sla',
        title: 'Notesheet Processing SLA Backlog',
        riskCategory: 'PENDING_APPROVAL_SLA',
        severity: 'HIGH',
        description: `${pendingNotesheets.totalCount} notesheets are awaiting your review.`,
        recommendedAction: 'Process oldest pending notesheet endorsements.'
      });
    }

    // 3. Dynamic KPI Query Resolution
    const kpis: DashboardKPICard[] = [];

    // Attention KPI
    kpis.push({
      kpiId: 'kpi-pending-notesheets',
      title: 'Pending Notesheets',
      description: 'Notesheets currently awaiting your action',
      value: pendingNotesheets.totalCount,
      status: pendingNotesheets.totalCount > 0 ? 'WARNING' : 'NORMAL',
      drillDownRoute: '/reg-notesheets-pending',
      category: 'ATTENTION'
    });

    kpis.push({
      kpiId: 'kpi-pending-requests',
      title: 'Pending Requests',
      description: 'Academic & administrative requests awaiting endorsement',
      value: pendingRequests.totalCount,
      status: pendingRequests.totalCount > 0 ? 'WARNING' : 'NORMAL',
      drillDownRoute: '/requests?status=PENDING',
      category: 'ATTENTION'
    });

    // Scope-Specific KPIs
    if (role === 'REGISTRAR' || role === 'VICE_PRESIDENT') {
      const allInst = db.getInstitutes();
      const allDepts = db.getDepartments();
      const allStudents = moduleQueryEngineService.getStudentsForUser(context);
      const allFaculty = moduleQueryEngineService.getFacultyForUser(context);
      const allNotes = moduleQueryEngineService.getNotesheetsForUser(context);

      kpis.push(
        {
          kpiId: 'kpi-reg-institutes',
          title: 'Total Institutes',
          description: 'Accredited University Constituent Institutes',
          value: allInst.length,
          status: 'SUCCESS',
          drillDownRoute: '/institutes',
          category: 'ACADEMIC'
        },
        {
          kpiId: 'kpi-reg-departments',
          title: 'Total Departments',
          description: 'Active Academic Departments',
          value: allDepts.length,
          status: 'NORMAL',
          drillDownRoute: '/departments',
          category: 'ACADEMIC'
        },
        {
          kpiId: 'kpi-reg-students',
          title: 'Total Students',
          description: 'University-wide Enrolled Students',
          value: allStudents.totalCount,
          status: 'NORMAL',
          drillDownRoute: '/students',
          category: 'ACADEMIC'
        },
        {
          kpiId: 'kpi-reg-faculty',
          title: 'Total Faculty',
          description: 'Teaching & Research Faculty Cadre',
          value: allFaculty.totalCount,
          status: 'NORMAL',
          drillDownRoute: '/faculty',
          category: 'ACADEMIC'
        },
        {
          kpiId: 'kpi-reg-notesheets',
          title: 'University Notesheets',
          description: 'Total University Proposals in Lifecycle',
          value: allNotes.totalCount,
          status: 'NORMAL',
          drillDownRoute: '/reg-notesheets-register',
          category: 'GOVERNANCE'
        }
      );
    } else if (role === 'PRINCIPAL') {
      const instStudents = moduleQueryEngineService.getStudentsForUser(context);
      const instFaculty = moduleQueryEngineService.getFacultyForUser(context);
      const instDepts = db.getDepartments().filter(d => d.instituteId === context.instituteId);

      kpis.push(
        {
          kpiId: 'kpi-hoi-departments',
          title: 'Institute Departments',
          description: 'Constituent Academic Departments',
          value: instDepts.length,
          status: 'NORMAL',
          drillDownRoute: '/departments',
          category: 'ACADEMIC'
        },
        {
          kpiId: 'kpi-hoi-students',
          title: 'Institute Students',
          description: 'Enrolled Students in Institute',
          value: instStudents.totalCount,
          status: 'NORMAL',
          drillDownRoute: '/students',
          category: 'ACADEMIC'
        },
        {
          kpiId: 'kpi-hoi-faculty',
          title: 'Institute Faculty',
          description: 'Faculty members appointed to Institute',
          value: instFaculty.totalCount,
          status: 'NORMAL',
          drillDownRoute: '/faculty',
          category: 'ACADEMIC'
        }
      );
    } else if (role === 'HOD') {
      const deptStudents = moduleQueryEngineService.getStudentsForUser(context);
      const deptFaculty = moduleQueryEngineService.getFacultyForUser(context);

      kpis.push(
        {
          kpiId: 'kpi-hod-students',
          title: 'Department Students',
          description: 'Students enrolled in department programs',
          value: deptStudents.totalCount,
          status: 'NORMAL',
          drillDownRoute: '/students',
          category: 'ACADEMIC'
        },
        {
          kpiId: 'kpi-hod-faculty',
          title: 'Department Faculty',
          description: 'Faculty members in department cadre',
          value: deptFaculty.totalCount,
          status: 'NORMAL',
          drillDownRoute: '/faculty',
          category: 'ACADEMIC'
        }
      );
    } else if (role === 'STUDENT') {
      kpis.push({
        kpiId: 'kpi-stud-attendance',
        title: 'Average Attendance',
        description: 'Cumulative academic attendance percentage',
        value: '86.4%',
        status: 'SUCCESS',
        drillDownRoute: '/student-attendance',
        category: 'ACADEMIC'
      });
    }

    // 4. Quick Actions
    const quickActions = [
      { id: 'qa-notesheet-create', label: 'Create Notesheet', route: '/reg-notesheets-create', permission: 'NOTESHEET_CREATE' },
      { id: 'qa-request-create', label: 'Submit Academic Request', route: '/requests/new', permission: 'REQUEST_CREATE' },
      { id: 'qa-report-view', label: 'Academic Reports', route: '/reg-academic-reports', permission: 'REPORT_VIEW' }
    ];

    return {
      dashboardType: (role as any),
      scopeLabel: role === 'REGISTRAR' ? 'MY UNIVERSITY' :
                  role === 'PRINCIPAL' ? 'MY INSTITUTE' :
                  role === 'HOD' ? 'MY DEPARTMENT' :
                  role === 'DEPUTY_REGISTRAR' ? 'MY JURISDICTION' :
                  role === 'STUDENT' ? 'MY ACADEMIC JOURNEY' : 'MY ACADEMIC WORK',
      academicYear: '2026-2027',
      semesterTerm: 'Odd Semester (Term 1)',
      attentionItems,
      kpis,
      risks,
      recentActivity: [
        { id: 'act-1', title: 'Academic Session Attendance Synchronized', timestamp: new Date().toLocaleDateString(), actor: 'System' }
      ],
      quickActions
    };
  }
}

export const dashboardKpiService = DashboardKpiService.getInstance();
