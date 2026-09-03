import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { mentorAssignmentService } from '../../services/mentorAssignmentService';
import { 
  MentorAssignment, MentorAssignmentHistory, MentorBulkUploadRow 
} from '../../types/mentorAssignment';
import { Student, Faculty, UserRole } from '../../types';
import { ExcelDataTable, ExcelColumn, ExcelFilterOption, ExcelBulkAction } from '../common/ExcelDataTable';
import { Badge } from '../common/Badge';
import { StatCard } from '../common/StatCard';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { 
  UserCheck, Users, Search, Download, Upload, Plus, 
  RotateCcw, History, AlertCircle, CheckCircle2, 
  FileSpreadsheet, ArrowRight, UserX, Check, X,
  GraduationCap, Building2, BookOpen, Layers
} from 'lucide-react';
import * as XLSX from 'xlsx';

export interface StudentMentorAllocationRow {
  id: string;
  student: Student;
  studentName: string;
  enrollmentNo: string;
  departmentId: string;
  departmentName: string;
  programId: string;
  programName: string;
  programCode: string;
  semesterId: string;
  semesterNumber: number | string;
  divisionId: string;
  divisionName: string;
  currentMentorName: string;
  mentorEmployeeId: string;
  mentorRole: string;
  mentorFacultyId: string;
  mentorEmail: string;
  assignedDate: string;
  assignedDateFormatted: string;
  assignedByName: string;
  assignedByRole: string;
  allocationStatus: 'ASSIGNED' | 'UNASSIGNED';
  isAssigned: boolean;
  activeMentor: MentorAssignment | null;
}

interface MentorAssignmentTabProps {
  initialDeptFilter?: string;
  initialInstFilter?: string;
}

export const MentorAssignmentTab: React.FC<MentorAssignmentTabProps> = ({
  initialDeptFilter,
  initialInstFilter
}) => {
  const { user, role } = useAuth();

  // Filters State
  const [selectedInstFilter, setSelectedInstFilter] = useState<string>(initialInstFilter || (user?.instituteId || 'ALL'));
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>(initialDeptFilter || (user?.departmentId || 'ALL'));
  const [selectedProgFilter, setSelectedProgFilter] = useState<string>('ALL');
  const [selectedSemFilter, setSelectedSemFilter] = useState<string>('ALL');
  const [selectedDivFilter, setSelectedDivFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals State
  const [assigningStudent, setAssigningStudent] = useState<Student | null>(null);
  const [isChangeMode, setIsChangeMode] = useState(false);
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [changeReason, setChangeReason] = useState('');
  const [effectiveFrom, setEffectiveFrom] = useState(new Date().toISOString().split('T')[0]);

  const [historyStudent, setHistoryStudent] = useState<Student | null>(null);
  const [historyList, setHistoryList] = useState<MentorAssignmentHistory[]>([]);

  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkValidationResult, setBulkValidationResult] = useState<{
    totalRows: number;
    validRows: MentorBulkUploadRow[];
    invalidRows: MentorBulkUploadRow[];
    errorsSummary: string[];
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [deletingAssignment, setDeletingAssignment] = useState<MentorAssignment | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Trigger re-render
  const [refreshKey, setRefreshKey] = useState(0);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4500);
  };

  const institutes = db.getInstitutes ? db.getInstitutes() : [];
  const departments = db.getDepartments ? db.getDepartments() : [];
  const programs = db.getPrograms ? db.getPrograms() : [];
  const semesters = db.getSemesters ? db.getSemesters() : [];
  const divisions = db.getDivisions ? db.getDivisions() : [];
  const allFaculty = db.getFaculty ? db.getFaculty() : [];

  // Scoped assignments & students from authoritative live data service
  const { assignments, students } = useMemo(() => {
    return mentorAssignmentService.getAssignments({
      instituteId: role === 'PRINCIPAL' ? (user?.instituteId || undefined) : (selectedInstFilter !== 'ALL' ? selectedInstFilter : undefined),
      departmentId: role === 'HOD' ? (user?.departmentId || undefined) : (selectedDeptFilter !== 'ALL' ? selectedDeptFilter : undefined),
      programId: selectedProgFilter !== 'ALL' ? selectedProgFilter : undefined,
      searchQuery
    }, user);
  }, [user, role, selectedInstFilter, selectedDeptFilter, selectedProgFilter, searchQuery, refreshKey]);

  // Eligible Faculty List in scope
  const eligibleFaculty = useMemo(() => {
    return mentorAssignmentService.getEligibleMentors({
      instituteId: role === 'PRINCIPAL' ? user?.instituteId : (selectedInstFilter !== 'ALL' ? selectedInstFilter : undefined),
      departmentId: role === 'HOD' ? user?.departmentId : (selectedDeptFilter !== 'ALL' ? selectedDeptFilter : undefined)
    });
  }, [role, user, selectedInstFilter, selectedDeptFilter, refreshKey]);

  // Merge student records into flat Excel-like allocation rows
  const allRows: StudentMentorAllocationRow[] = useMemo(() => {
    return students.map(student => {
      const active = assignments.find(
        a => (a.studentId === student.id || a.studentEnrollmentNo === student.enrollmentNo) && 
             a.status === 'ACTIVE'
      );
      const activeMentor = active || mentorAssignmentService.getActiveMentorForStudent(student.id);
      const isAssigned = Boolean(activeMentor && activeMentor.status === 'ACTIVE');

      const dept = departments.find(d => d.id === student.departmentId);
      const prog = programs.find(p => p.id === student.programId);
      const sem = semesters.find(s => s.id === student.semesterId);
      const div = divisions.find(d => d.id === student.divisionId);
      const assignedFac = isAssigned && activeMentor ? allFaculty.find(f => f.id === activeMentor.mentorFacultyId) : null;

      const semNum = sem?.number || (student as any).semester || 4;
      const divName = div?.name || (student as any).division || (student as any).section || 'Div A';

      return {
        id: student.id,
        student,
        studentName: student.name,
        enrollmentNo: student.enrollmentNo,
        departmentId: student.departmentId || '',
        departmentName: dept?.name || student.branchName || 'Engineering & Technology',
        programId: student.programId || '',
        programName: prog?.name || student.programName || 'B.Tech Program',
        programCode: prog?.code || 'B.TECH',
        semesterId: student.semesterId || '',
        semesterNumber: semNum,
        divisionId: student.divisionId || '',
        divisionName: divName,
        currentMentorName: isAssigned && activeMentor ? activeMentor.mentorName : 'UNASSIGNED',
        mentorEmployeeId: isAssigned && activeMentor ? activeMentor.mentorEmployeeId : '—',
        mentorRole: assignedFac?.designation || (isAssigned ? 'Faculty Mentor' : '—'),
        mentorFacultyId: activeMentor?.mentorFacultyId || '',
        mentorEmail: activeMentor?.mentorEmail || assignedFac?.email || '—',
        assignedDate: activeMentor?.assignedDate || '',
        assignedDateFormatted: activeMentor?.assignedDate ? new Date(activeMentor.assignedDate).toLocaleDateString() : '—',
        assignedByName: activeMentor?.assignedByName || '—',
        assignedByRole: activeMentor?.assignedByRole || '—',
        allocationStatus: isAssigned ? 'ASSIGNED' : 'UNASSIGNED',
        isAssigned,
        activeMentor: activeMentor || null
      };
    });
  }, [students, assignments, departments, programs, semesters, divisions, allFaculty]);

  // Apply filters
  const filteredRows = useMemo(() => {
    return allRows.filter(row => {
      // Semester filter
      if (selectedSemFilter !== 'ALL' && String(row.semesterNumber) !== selectedSemFilter) {
        return false;
      }
      // Division filter
      if (selectedDivFilter !== 'ALL' && row.divisionName !== selectedDivFilter) {
        return false;
      }
      // Status filter
      if (selectedStatusFilter === 'ASSIGNED' && !row.isAssigned) return false;
      if (selectedStatusFilter === 'UNASSIGNED' && row.isAssigned) return false;

      return true;
    });
  }, [allRows, selectedSemFilter, selectedDivFilter, selectedStatusFilter]);

  // Summary Metrics
  const totalStudents = allRows.length;
  const assignedStudents = allRows.filter(r => r.isAssigned).length;
  const unassignedStudents = totalStudents - assignedStudents;
  const allocationPercentage = totalStudents > 0 ? Math.round((assignedStudents / totalStudents) * 100) : 0;

  // Handle open Single Assign / Change Modal
  const handleOpenAssignModal = (student: Student, isChange = false) => {
    setAssigningStudent(student);
    setIsChangeMode(isChange);
    setChangeReason('');
    setEffectiveFrom(new Date().toISOString().split('T')[0]);

    const active = mentorAssignmentService.getActiveMentorForStudent(student.id);
    if (active && !isChange) {
      setIsChangeMode(true);
      setSelectedFacultyId(active.mentorFacultyId);
    } else {
      setSelectedFacultyId(active?.mentorFacultyId || '');
    }
  };

  // Submit Assign / Change
  const handleSubmitAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningStudent || !selectedFacultyId || !user) return;

    try {
      mentorAssignmentService.assignMentor({
        studentId: assigningStudent.id,
        mentorFacultyId: selectedFacultyId,
        effectiveFrom,
        changeReason,
        isChange: isChangeMode
      }, user);

      setAssigningStudent(null);
      setRefreshKey(k => k + 1);
      showToast('success', `Faculty mentor assigned successfully to student ${assigningStudent.name} (${assigningStudent.enrollmentNo}).`);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to assign mentor.');
    }
  };

  // View History
  const handleOpenHistory = (student: Student) => {
    setHistoryStudent(student);
    const history = mentorAssignmentService.getAssignmentHistory(student.id);
    setHistoryList(history);
  };

  // Remove Mentor
  const handleConfirmRemove = () => {
    if (!deletingAssignment || !user) return;
    try {
      mentorAssignmentService.removeMentor(deletingAssignment.id, deleteReason || 'Mentor unassigned by administrator', user);
      setDeletingAssignment(null);
      setDeleteReason('');
      setRefreshKey(k => k + 1);
      showToast('success', `Mentor assignment removed successfully.`);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to remove mentor.');
    }
  };

  // Download Template
  const handleDownloadTemplate = () => {
    const bytes = mentorAssignmentService.exportMentorTemplateXlsx();
    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Mentor_Assignment_Template_${new Date().toISOString().split('T')[0]}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Official .XLSX mentor assignment template downloaded.');
  };

  // Bulk File Upload & Validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx')) {
      showToast('error', 'Only official .xlsx files are permitted. CSV and other formats are not supported.');
      return;
    }

    setBulkFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const buffer = event.target?.result as ArrayBuffer;
        if (user) {
          const result = mentorAssignmentService.parseAndValidateBulkXlsx(buffer, user);
          setBulkValidationResult(result);
        }
      } catch (err: any) {
        showToast('error', `Failed to parse XLSX file: ${err.message}`);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Commit Bulk Upload
  const handleCommitBulk = () => {
    if (!bulkValidationResult || bulkValidationResult.validRows.length === 0 || !user) return;

    setIsUploading(true);
    try {
      const count = mentorAssignmentService.commitBulkUpload(bulkValidationResult.validRows, user);
      setIsBulkModalOpen(false);
      setBulkFile(null);
      setBulkValidationResult(null);
      setRefreshKey(k => k + 1);
      showToast('success', `Successfully processed bulk mentor assignment for ${count} students.`);
    } catch (err: any) {
      showToast('error', `Bulk assignment failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSelectedProgFilter('ALL');
    setSelectedSemFilter('ALL');
    setSelectedDivFilter('ALL');
    setSelectedStatusFilter('ALL');
    setSearchQuery('');
  };

  // ─── Filter Options for ExcelDataTable ──────────────────────────────────────
  const filterOptions: ExcelFilterOption[] = useMemo(() => {
    const opts: ExcelFilterOption[] = [];

    // Institute Filter (for Super Admin / Univ Admin)
    if (role === 'SUPER_ADMIN' || role === 'UNIVERSITY_ADMIN') {
      opts.push({
        key: 'institute',
        label: 'Institute',
        value: selectedInstFilter,
        options: [
          { label: 'All Institutes', value: 'ALL' },
          ...institutes.map(i => ({ label: `[${i.code}] ${i.name}`, value: i.id }))
        ]
      });
    }

    // Department Filter (for Super Admin / Univ Admin / HOI)
    if (role === 'SUPER_ADMIN' || role === 'UNIVERSITY_ADMIN' || role === 'PRINCIPAL') {
      opts.push({
        key: 'department',
        label: 'Department',
        value: selectedDeptFilter,
        options: [
          { label: 'All Departments', value: 'ALL' },
          ...departments.map(d => ({ label: `[${d.code}] ${d.name}`, value: d.id }))
        ]
      });
    }

    // Program Filter
    opts.push({
      key: 'program',
      label: 'Program',
      value: selectedProgFilter,
      options: [
        { label: 'All Programs', value: 'ALL' },
        ...programs.map(p => ({ label: `[${p.code}] ${p.name}`, value: p.id }))
      ]
    });

    // Semester Filter
    opts.push({
      key: 'semester',
      label: 'Semester',
      value: selectedSemFilter,
      options: [
        { label: 'All Semesters', value: 'ALL' },
        { label: 'Sem 1', value: '1' },
        { label: 'Sem 2', value: '2' },
        { label: 'Sem 3', value: '3' },
        { label: 'Sem 4', value: '4' },
        { label: 'Sem 5', value: '5' },
        { label: 'Sem 6', value: '6' },
        { label: 'Sem 7', value: '7' },
        { label: 'Sem 8', value: '8' }
      ]
    });

    // Division Filter
    opts.push({
      key: 'division',
      label: 'Division',
      value: selectedDivFilter,
      options: [
        { label: 'All Divisions', value: 'ALL' },
        { label: 'Div A', value: 'Div A' },
        { label: 'Div B', value: 'Div B' },
        { label: 'Div C', value: 'Div C' },
        { label: 'Div D', value: 'Div D' }
      ]
    });

    // Allocation Status Filter
    opts.push({
      key: 'status',
      label: 'Allocation Status',
      value: selectedStatusFilter,
      options: [
        { label: 'All Students', value: 'ALL' },
        { label: 'Assigned Mentors Only', value: 'ASSIGNED' },
        { label: 'Unassigned Students Only', value: 'UNASSIGNED' }
      ]
    });

    return opts;
  }, [role, institutes, departments, programs, selectedInstFilter, selectedDeptFilter, selectedProgFilter, selectedSemFilter, selectedDivFilter, selectedStatusFilter]);

  const handleFilterChange = (key: string, value: string) => {
    switch (key) {
      case 'institute': setSelectedInstFilter(value); break;
      case 'department': setSelectedDeptFilter(value); break;
      case 'program': setSelectedProgFilter(value); break;
      case 'semester': setSelectedSemFilter(value); break;
      case 'division': setSelectedDivFilter(value); break;
      case 'status': setSelectedStatusFilter(value); break;
    }
  };

  // ─── Columns Definition for Clean Excel-Like Table ──────────────────────────
  const columns: ExcelColumn<StudentMentorAllocationRow>[] = useMemo(() => [
    // 1. Index
    {
      key: 'index',
      header: '#',
      width: '45px',
      minWidth: '40px',
      align: 'center',
      sortable: false,
      sticky: 'left',
      render: (_item, idx) => <span style={{ color: '#64748B', fontWeight: 600, fontSize: '0.75rem' }}>{idx + 1}</span>,
      getRawValue: item => item.id
    },
    // 2. Student Name
    {
      key: 'studentName',
      header: 'STUDENT NAME',
      width: '180px',
      minWidth: '160px',
      sortable: true,
      sticky: 'left',
      render: item => (
        <div style={{ fontWeight: 800, color: 'var(--brand-navy, #0B192C)', fontSize: '0.8125rem' }}>
          {item.studentName}
        </div>
      ),
      getRawValue: item => item.studentName
    },
    // 3. Enrollment No.
    {
      key: 'enrollmentNo',
      header: 'ENROLLMENT NO.',
      width: '130px',
      minWidth: '120px',
      sortable: true,
      render: item => (
        <code style={{ 
          fontSize: '0.75rem', 
          fontWeight: 800, 
          color: 'var(--brand-orange, #F37023)',
          background: 'rgba(243, 112, 35, 0.08)',
          padding: '2px 6px',
          borderRadius: '4px'
        }}>
          {item.enrollmentNo}
        </code>
      ),
      getRawValue: item => item.enrollmentNo
    },
    // 4. Department
    {
      key: 'departmentName',
      header: 'DEPARTMENT',
      width: '160px',
      minWidth: '140px',
      sortable: true,
      render: item => (
        <div style={{ fontSize: '0.78125rem', color: '#334155', fontWeight: 600 }} title={item.departmentName}>
          {item.departmentName}
        </div>
      ),
      getRawValue: item => item.departmentName
    },
    // 5. Program
    {
      key: 'programName',
      header: 'PROGRAM',
      width: '130px',
      minWidth: '110px',
      sortable: true,
      render: item => (
        <span style={{ 
          fontSize: '0.725rem', 
          fontWeight: 800, 
          color: 'var(--brand-navy, #0B192C)',
          background: '#F1F5F9',
          padding: '2px 6px',
          borderRadius: '4px'
        }}>
          {item.programCode || item.programName}
        </span>
      ),
      getRawValue: item => item.programCode || item.programName
    },
    // 6. Semester
    {
      key: 'semesterNumber',
      header: 'SEM',
      width: '70px',
      align: 'center',
      sortable: true,
      render: item => <strong style={{ color: '#1E293B', fontSize: '0.78125rem' }}>Sem {item.semesterNumber}</strong>,
      getRawValue: item => item.semesterNumber
    },
    // 7. Division
    {
      key: 'divisionName',
      header: 'DIV',
      width: '75px',
      align: 'center',
      sortable: true,
      render: item => (
        <span style={{ 
          fontSize: '0.725rem', 
          fontWeight: 700, 
          color: '#475569',
          background: '#F8FAFC',
          border: '1px solid #E2E8F0',
          padding: '1px 5px',
          borderRadius: '3px'
        }}>
          {item.divisionName}
        </span>
      ),
      getRawValue: item => item.divisionName
    },
    // 8. Current Mentor
    {
      key: 'currentMentorName',
      header: 'CURRENT MENTOR',
      width: '190px',
      minWidth: '170px',
      sortable: true,
      render: item => (
        item.isAssigned && item.activeMentor ? (
          <div>
            <div style={{ fontWeight: 800, color: 'var(--brand-navy, #0B192C)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem' }}>
              <UserCheck size={13} color="#10B981" /> {item.currentMentorName}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
              <code>{item.mentorEmployeeId}</code>
            </div>
          </div>
        ) : (
          <span style={{ 
            fontSize: '0.7rem', 
            fontWeight: 800, 
            color: '#DC2626', 
            background: '#FEF2F2', 
            padding: '2px 6px', 
            borderRadius: '4px',
            border: '1px solid #FECACA'
          }}>
            UNASSIGNED
          </span>
        )
      ),
      getRawValue: item => item.currentMentorName
    },
    // 9. Mentor Role
    {
      key: 'mentorRole',
      header: 'MENTOR ROLE',
      width: '140px',
      minWidth: '120px',
      sortable: true,
      render: item => (
        <span style={{ fontSize: '0.75rem', color: item.isAssigned ? '#334155' : '#94A3B8', fontWeight: 600 }}>
          {item.mentorRole}
        </span>
      ),
      getRawValue: item => item.mentorRole
    },
    // 10. Assigned Date
    {
      key: 'assignedDateFormatted',
      header: 'ASSIGNED DATE',
      width: '115px',
      minWidth: '100px',
      align: 'center',
      sortable: true,
      render: item => (
        <span style={{ fontSize: '0.75rem', color: item.isAssigned ? '#1E293B' : '#94A3B8', fontWeight: 600 }}>
          {item.assignedDateFormatted}
        </span>
      ),
      getRawValue: item => item.assignedDateFormatted
    },
    // 11. Assigned By
    {
      key: 'assignedByName',
      header: 'ASSIGNED BY',
      width: '150px',
      minWidth: '130px',
      sortable: true,
      render: item => (
        item.isAssigned && item.assignedByName !== '—' ? (
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-navy, #0B192C)' }}>
              {item.assignedByName}
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#64748B' }}>
              ({item.assignedByRole})
            </div>
          </div>
        ) : (
          <span style={{ color: '#94A3B8', fontSize: '0.75rem' }}>—</span>
        )
      ),
      getRawValue: item => item.assignedByName
    },
    // 12. Allocation Status
    {
      key: 'allocationStatus',
      header: 'STATUS',
      width: '115px',
      align: 'center',
      sortable: true,
      render: item => {
        return item.isAssigned ? (
          <Badge variant="active">ASSIGNED</Badge>
        ) : (
          <Badge variant="danger">UNASSIGNED</Badge>
        );
      },
      getRawValue: item => item.allocationStatus
    },
    // 13. Actions
    {
      key: 'actions',
      header: 'ACTIONS',
      width: '180px',
      minWidth: '160px',
      align: 'center',
      sortable: false,
      render: item => (
        <div style={{ display: 'inline-flex', gap: '0.3rem', alignItems: 'center' }}>
          {!item.isAssigned ? (
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={() => handleOpenAssignModal(item.student, false)}
              style={{ padding: '0.18rem 0.5rem', fontSize: '0.72rem', fontWeight: 700 }}
              title="Assign Faculty Mentor"
            >
              <Plus size={12} /> Assign Mentor
            </button>
          ) : (
            <>
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={() => handleOpenAssignModal(item.student, true)}
                style={{ padding: '0.18rem 0.45rem', fontSize: '0.7rem', fontWeight: 700 }}
                title="Change Faculty Mentor"
              >
                <RotateCcw size={11} /> Change
              </button>

              <button
                type="button"
                className="btn btn-sm btn-outline"
                onClick={() => handleOpenHistory(item.student)}
                style={{ padding: '0.18rem 0.45rem', fontSize: '0.7rem', fontWeight: 700 }}
                title="View Assignment History"
              >
                <History size={11} /> History
              </button>

              {item.activeMentor && (
                <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  onClick={() => setDeletingAssignment(item.activeMentor)}
                  style={{ padding: '0.18rem 0.45rem', fontSize: '0.7rem' }}
                  title="Remove / Unassign Mentor"
                >
                  <UserX size={11} />
                </button>
              )}
            </>
          )}
        </div>
      )
    }
  ], []);

  // ─── Bulk Actions for ExcelDataTable ────────────────────────────────────────
  const bulkActions: ExcelBulkAction<StudentMentorAllocationRow>[] = useMemo(() => [
    {
      key: 'export_selected',
      label: 'Export Selected to Excel',
      icon: <Download size={13} />,
      variant: 'secondary',
      onClick: selected => {
        const rows = selected.map((s, idx) => ({
          '#': idx + 1,
          'Student Name': s.studentName,
          'Enrollment No.': s.enrollmentNo,
          'Department': s.departmentName,
          'Program': s.programName,
          'Semester': `Sem ${s.semesterNumber}`,
          'Division': s.divisionName,
          'Current Mentor': s.currentMentorName,
          'Mentor Role': s.mentorRole,
          'Assigned Date': s.assignedDateFormatted,
          'Assigned By': `${s.assignedByName} (${s.assignedByRole})`,
          'Allocation Status': s.allocationStatus
        }));
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Selected_Mentee_Allocations');
        XLSX.writeFile(wb, `Selected_Mentor_Allocations_${new Date().toISOString().slice(0, 10)}.xlsx`);
        showToast('success', `Exported ${selected.length} selected mentor allocation records.`);
      }
    },
    {
      key: 'bulk_upload_trigger',
      label: 'Open Bulk Upload Wizard',
      icon: <Upload size={13} />,
      variant: 'primary',
      onClick: () => {
        setIsBulkModalOpen(true);
        setBulkFile(null);
        setBulkValidationResult(null);
      }
    }
  ], []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 1000,
          backgroundColor: toastMessage.type === 'success' ? '#10B981' : '#EF4444',
          color: '#FFFFFF', padding: '0.85rem 1.25rem', borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)', fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: '0.5rem'
        }}>
          {toastMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {toastMessage.text}
        </div>
      )}

      {/* Header Banner */}
      <div className="card" style={{
        padding: '1.5rem',
        background: 'linear-gradient(135deg, var(--brand-navy, #0B192C) 0%, #1a365d 100%)',
        color: '#FFFFFF',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        borderRadius: '8px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Badge variant="gold">
              {role === 'HOD' ? 'Department Authority' : role === 'PRINCIPAL' ? 'Institute Authority' : 'University Central Master'}
            </Badge>
            <span style={{ fontSize: '0.78125rem', color: '#FEF3C7' }}>Student Mentee Allocation Register</span>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#FFFFFF', marginTop: '0.35rem' }}>
            Student Mentee &amp; Faculty Mentor Allocation Master
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#E2E8F0', marginTop: '0.2rem' }}>
            {role === 'HOD' 
              ? `Manage student mentee mappings and faculty mentor allocations for ${user?.departmentId || 'your Department'}.`
              : role === 'PRINCIPAL'
              ? `Institutional mentor allocation register across all constituent departments in ${user?.instituteId || 'your Institute'}.`
              : 'University-wide faculty mentor allocation and oversight management.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button 
            type="button"
            className="btn btn-secondary" 
            onClick={handleDownloadTemplate} 
            style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.3)', padding: '0.45rem 0.9rem', fontSize: '0.8125rem' }}
          >
            <Download size={15} /> Download .XLSX Template
          </button>
          <button 
            type="button"
            className="btn btn-primary" 
            onClick={() => { setIsBulkModalOpen(true); setBulkFile(null); setBulkValidationResult(null); }}
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.8125rem' }}
          >
            <Upload size={15} /> Bulk Assign (.XLSX)
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-4" style={{ gap: '1rem' }}>
        <StatCard 
          title="Total Students" 
          value={totalStudents} 
          subtitle="Authorized students in scope" 
          icon={Users} 
          colorScheme="navy" 
        />
        <StatCard 
          title="Mentors Assigned" 
          value={assignedStudents} 
          subtitle={`${allocationPercentage}% Allocation Rate`} 
          icon={CheckCircle2} 
          colorScheme="green" 
          onClick={() => setSelectedStatusFilter('ASSIGNED')} 
        />
        <StatCard 
          title="Unassigned Students" 
          value={unassignedStudents} 
          subtitle={unassignedStudents > 0 ? 'Requires mentor allocation' : 'All students allocated'} 
          icon={AlertCircle} 
          colorScheme={unassignedStudents > 0 ? 'orange' : 'green'} 
          onClick={() => setSelectedStatusFilter('UNASSIGNED')} 
        />
        <StatCard 
          title="Eligible Mentors" 
          value={eligibleFaculty.length} 
          subtitle="Active faculty in department" 
          icon={UserCheck} 
          colorScheme="gold" 
        />
      </div>

      {/* Main Excel-Style ERP Data Table */}
      <ExcelDataTable<StudentMentorAllocationRow>
        data={filteredRows}
        columns={columns}
        keyField="id"
        title="Student Mentee Allocation Master Table"
        subtitle={`Showing ${filteredRows.length} of ${totalStudents} authorized student records • Scope: ${role === 'HOD' ? (user?.departmentId || 'Department') : 'University Master'}`}
        storageKey="ssiu_student_mentor_allocation_grid_v1"
        searchPlaceholder="Search student name, enrollment no, mentor, department..."
        searchFields={['studentName', 'enrollmentNo', 'currentMentorName', 'mentorEmployeeId', 'departmentName', 'programName', 'divisionName']}
        filters={filterOptions}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        bulkActions={bulkActions}
        enableSelection={true}
        exportFilename="SSIU_Student_Mentor_Allocation_Master"
        exportTitle="SWARRNIM STARTUP & INNOVATION UNIVERSITY — STUDENT MENTEE ALLOCATION REGISTER"
        pageSizeOptions={[10, 25, 50, 100, 200]}
        defaultPageSize={25}
        emptyMessage="No student mentee records found matching the selected filters."
        emptyDescription="Try clearing filters or adjusting your search criteria."
      />

      {/* ─── MODAL: Single Assign / Change Mentor ───────────────────────────── */}
      {assigningStudent && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '540px', padding: '1.75rem', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy, #0B192C)' }}>
                {isChangeMode ? 'Change Student Mentor' : 'Assign Faculty Mentor'}
              </h3>
              <button className="btn-icon" onClick={() => setAssigningStudent(null)}><X size={18} /></button>
            </div>

            {/* Overwrite notice if reassigning */}
            {isChangeMode && (
              <div style={{
                padding: '0.85rem 1rem', borderRadius: '8px',
                backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)',
                color: '#B45309', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem'
              }}>
                <AlertCircle size={18} />
                <div>
                  <strong>Mentor already assigned.</strong> Reassigning will archive the current mentor into the assignment history.
                </div>
              </div>
            )}

            <form onSubmit={handleSubmitAssignment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Student Metadata */}
              <div style={{ padding: '0.85rem 1rem', backgroundColor: 'var(--bg-surface-hover, #F8FAFC)', borderRadius: '8px', border: '1px solid var(--border-color, #E2E8F0)' }}>
                <div style={{ fontWeight: 800, color: 'var(--brand-navy, #0B192C)' }}>{assigningStudent.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Enrollment: <strong style={{ color: 'var(--brand-orange, #F37023)' }}>{assigningStudent.enrollmentNo}</strong> • Department: <strong>{departments.find(d => d.id === assigningStudent.departmentId)?.name || assigningStudent.branchName}</strong>
                </div>
              </div>

              {/* Eligible Faculty Picker */}
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  Select Eligible Faculty Mentor *
                </label>
                <select 
                  className="form-control" 
                  value={selectedFacultyId} 
                  onChange={e => setSelectedFacultyId(e.target.value)} 
                  required
                >
                  <option value="">-- Choose Eligible Faculty --</option>
                  {mentorAssignmentService.getEligibleMentors({ studentId: assigningStudent.id }).map(fac => (
                    <option key={fac.id} value={fac.id}>
                      {fac.name} ({fac.employeeId || 'FAC'}) - {fac.designation} [{fac.departmentId}]
                    </option>
                  ))}
                </select>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                  Only active faculty belonging to the student's authorized department/institute are eligible.
                </span>
              </div>

              {/* Effective From Date */}
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>Effective From Date *</label>
                <input type="date" className="form-control" value={effectiveFrom} onChange={e => setEffectiveFrom(e.target.value)} required />
              </div>

              {/* Mandatory Reason when changing mentor */}
              {isChangeMode && (
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    Reason for Mentor Change * (Mandatory)
                  </label>
                  <textarea 
                    className="form-control" 
                    rows={3} 
                    placeholder="e.g. Student specialization stream change / Faculty sabbatical leave" 
                    value={changeReason} 
                    onChange={e => setChangeReason(e.target.value)} 
                    required 
                  />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setAssigningStudent(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <Check size={16} /> {isChangeMode ? 'Confirm Mentor Change' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: View Mentor Assignment History ───────────────────────────── */}
      {historyStudent && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '640px', padding: '1.75rem', maxHeight: '80vh', overflowY: 'auto', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy, #0B192C)' }}>
                  Mentor Assignment History
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  {historyStudent.name} ({historyStudent.enrollmentNo})
                </p>
              </div>
              <button className="btn-icon" onClick={() => setHistoryStudent(null)}><X size={18} /></button>
            </div>

            {historyList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                <History size={40} style={{ opacity: 0.3, margin: '0 auto 0.75rem' }} />
                <p style={{ fontWeight: 600 }}>No previous mentor reassignments recorded.</p>
                <p style={{ fontSize: '0.8rem' }}>All historical reassignments and change reasons are permanently preserved here.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {historyList.map(item => (
                  <div key={item.id} style={{
                    padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color, #E2E8F0)',
                    backgroundColor: 'var(--bg-surface-hover, #F8FAFC)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Badge variant="navy">PREVIOUS: {item.previousMentorName || 'None'}</Badge>
                        <ArrowRight size={14} color="var(--text-muted)" />
                        <Badge variant="active">NEW: {item.newMentorName}</Badge>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8125rem', color: 'var(--brand-navy, #0B192C)', fontWeight: 600, marginTop: '0.35rem' }}>
                      Reason: <span style={{ fontWeight: 400 }}>{item.changeReason}</span>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Changed By: <strong>{item.changedByName}</strong> ({item.changedByRole}) • Active Period: {new Date(item.effectiveFrom).toLocaleDateString()} to {new Date(item.effectiveTo).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <button className="btn btn-secondary" onClick={() => setHistoryStudent(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: Bulk XLSX Assignment ─────────────────────────────────────── */}
      {isBulkModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '680px', padding: '1.75rem', maxHeight: '85vh', overflowY: 'auto', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy, #0B192C)' }}>
                  Bulk Mentor Assignment (.XLSX)
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Upload official Excel spreadsheet to batch assign mentors
                </p>
              </div>
              <button className="btn-icon" onClick={() => setIsBulkModalOpen(false)}><X size={18} /></button>
            </div>

            {/* Template Notice */}
            <div style={{ padding: '0.85rem 1rem', borderRadius: '8px', backgroundColor: 'var(--bg-surface-hover, #F8FAFC)', border: '1px solid var(--border-color, #E2E8F0)', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--brand-navy, #0B192C)', fontSize: '0.875rem' }}>Official .XLSX Template</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Format: Student Enrollment, Dept Code, Program Code, Semester, Section, Mentor Employee ID</div>
              </div>
              <button className="btn btn-sm btn-secondary" onClick={handleDownloadTemplate}>
                <Download size={14} /> Download Template
              </button>
            </div>

            {/* Upload File Input */}
            <div style={{ border: '2px dashed var(--border-color, #CBD5E1)', borderRadius: '8px', padding: '2rem', textAlign: 'center', marginBottom: '1rem' }}>
              <FileSpreadsheet size={40} style={{ color: 'var(--brand-orange, #F37023)', margin: '0 auto 0.75rem' }} />
              <div style={{ fontWeight: 700, color: 'var(--brand-navy, #0B192C)', marginBottom: '0.25rem' }}>
                {bulkFile ? bulkFile.name : 'Select or drop .XLSX file'}
              </div>
              <input type="file" accept=".xlsx" onChange={handleFileChange} style={{ display: 'none' }} id="mentor-xlsx-upload" />
              <label htmlFor="mentor-xlsx-upload" className="btn btn-sm btn-primary" style={{ cursor: 'pointer' }}>
                <Upload size={14} /> Browse .XLSX File
              </label>
            </div>

            {/* Validation Preview */}
            {bulkValidationResult && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <Badge variant="navy">Total Rows: {bulkValidationResult.totalRows}</Badge>
                  <Badge variant="active">Valid: {bulkValidationResult.validRows.length}</Badge>
                  <Badge variant={bulkValidationResult.invalidRows.length > 0 ? 'danger' : 'active'}>
                    Invalid: {bulkValidationResult.invalidRows.length}
                  </Badge>
                </div>

                {bulkValidationResult.errorsSummary.length > 0 && (
                  <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#DC2626', fontSize: '0.8rem', maxHeight: '120px', overflowY: 'auto' }}>
                    <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Validation Errors Found:</div>
                    <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                      {bulkValidationResult.errorsSummary.map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                  </div>
                )}

                {bulkValidationResult.validRows.length > 0 && (
                  <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--border-color, #CBD5E1)', borderRadius: '8px' }}>
                    <table className="table" style={{ fontSize: '0.75rem' }}>
                      <thead>
                        <tr>
                          <th>Enrollment</th>
                          <th>Student Name</th>
                          <th>Mentor Emp ID</th>
                          <th>Mentor Name</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bulkValidationResult.validRows.slice(0, 10).map((r, i) => (
                          <tr key={i}>
                            <td><code>{r.studentEnrollmentNo}</code></td>
                            <td>{r.studentName}</td>
                            <td><code>{r.mentorEmployeeId}</code></td>
                            <td>{r.mentorName}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsBulkModalOpen(false)}>Cancel</button>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={handleCommitBulk} 
                disabled={!bulkValidationResult || bulkValidationResult.validRows.length === 0 || isUploading}
              >
                {isUploading ? 'Applying Updates...' : `Confirm & Commit (${bulkValidationResult?.validRows.length || 0} Records)`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Remove Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingAssignment)}
        title="Remove Mentor Assignment"
        message={`Are you sure you want to unassign mentor ${deletingAssignment?.mentorName} from student ${deletingAssignment?.studentName}?`}
        confirmLabel="Remove Mentor"
        onConfirm={handleConfirmRemove}
        onClose={() => setDeletingAssignment(null)}
      />
    </div>
  );
};
