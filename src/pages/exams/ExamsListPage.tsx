import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../../services/db';
import {
  Exam, Program, AcademicYear, Semester, Institute, Department,
  Subject, Student, StudentMarks, StudentResult, ExamTimetable,
  ExamSubjectItem, ExamFeeItem, ExamLateFeeRule, NoteSheet
} from '../../types';
import { Badge } from '../../components/common/Badge';
import {
  Plus, Edit2, Trash2, Calendar as CalendarIcon, FileSignature,
  Search, Filter, BookOpen, Users, CheckCircle2, AlertTriangle,
  Award, Clock, Layers, ChevronRight, X, Save, UploadCloud,
  FileCheck, ShieldCheck, Printer, RefreshCw, CheckSquare, Eye,
  IndianRupee, AlertCircle, FileText, ArrowRight, Check, XCircle, Send
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ExamsListPage: React.FC = () => {
  const { user, role } = useAuth();

  // Master lists
  const [exams, setExams] = useState<Exam[]>([]);
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [noteSheets, setNoteSheets] = useState<NoteSheet[]>([]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterInstitute, setFilterInstitute] = useState('ALL');
  const [filterDepartment, setFilterDepartment] = useState('ALL');
  const [filterProgram, setFilterProgram] = useState('ALL');
  const [filterAcademicYear, setFilterAcademicYear] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');

  // Modals & Active State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeWizardTab, setActiveWizardTab] = useState<'BASIC' | 'SUBJECTS' | 'FEES' | 'NOTESHEET'>('BASIC');
  const [selectedExamDetails, setSelectedExamDetails] = useState<Exam | null>(null);

  // Notifications
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State for Wizard
  const defaultFormData: Partial<Exam> = {
    examCode: '',
    name: '',
    type: 'Regular',
    session: 'Summer 2026',
    academicYearId: 'ay-2026',
    academicYearCode: '2026-27',
    instituteId: 'inst-1',
    departmentId: 'dept-cse',
    programId: 'prog-btech-cse',
    semesterId: 'sem-4',
    semesterNumber: 4,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    formStartDate: new Date().toISOString().split('T')[0],
    formEndDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
    lateFeeStartDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
    lateFeeEndDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    minAttendanceRequired: 75,
    status: 'DRAFT',
    description: '',
    instructions: 'Candidates must carry valid University Identity Card and official Hall Ticket to the examination hall.',
    notesheetId: '',
    subjects: [],
    fees: [
      { examType: 'Regular', amount: 2500, currency: 'INR', isMandatory: true },
      { examType: 'Backlog', amount: 500, currency: 'INR', isMandatory: false },
      { examType: 'Supplementary', amount: 800, currency: 'INR', isMandatory: false },
    ],
    lateFeeRule: {
      calculationType: 'FIXED',
      amount: 500,
      maximumAmount: 2000,
      gracePeriodDays: 2,
      isActive: true,
    },
  };

  const [formData, setFormData] = useState<Partial<Exam>>(defaultFormData);

  // Broadcast Notice Modal State
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [noticeData, setNoticeData] = useState({
    title: '',
    message: '',
    examId: '',
    noticeType: 'IMPORTANT_NOTICE' as any,
    priority: 'HIGH' as any,
    programId: '',
    departmentId: '',
    semesterId: '',
    attachmentName: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setExams(db.getExams(undefined, user));
    setInstitutes(db.getInstitutes());
    setDepartments(db.getDepartments());
    setPrograms(db.getPrograms());
    setAcademicYears(db.getAcademicYears());
    setSemesters(db.getSemesters());
    setSubjects(db.getSubjects());
    setNoteSheets(db.getNoteSheets(user, 'EXAM'));
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Filtered Programs by Department & Institute
  const availablePrograms = useMemo(() => {
    return programs.filter(p => {
      if (formData.departmentId && p.departmentId !== formData.departmentId) return false;
      if (formData.instituteId && p.instituteId !== formData.instituteId) return false;
      return true;
    });
  }, [programs, formData.departmentId, formData.instituteId]);

  // Load eligible subjects when program/semester changes
  const eligibleSubjects = useMemo(() => {
    if (!formData.programId || !formData.semesterId) return [];
    return subjects.filter(
      s => s.programId === formData.programId && s.semesterId === formData.semesterId
    );
  }, [subjects, formData.programId, formData.semesterId]);

  // Update subjects in formData when academic context changes
  const handlePopulateEligibleSubjects = () => {
    const list: ExamSubjectItem[] = eligibleSubjects.map(s => ({
      subjectId: s.id,
      subjectCode: s.code,
      subjectName: s.name,
      examType: formData.type || 'Regular',
      durationMinutes: 180,
      maximumMarks: 100,
      passingMarks: 40,
      internalMarks: 30,
      externalMarks: 70,
      credits: s.credits || 3,
      examMode: 'OFFLINE',
      status: 'ACTIVE',
    }));
    setFormData(prev => ({ ...prev, subjects: list }));
  };

  // Open Create Exam Modal
  const handleOpenCreateModal = (examToEdit?: Exam) => {
    if (examToEdit) {
      setFormData({
        ...examToEdit,
      });
      setIsEditing(true);
    } else {
      const initCode = `EXAM-${new Date().getFullYear()}-CSE-SEM4-REG`;
      const initData: Partial<Exam> = {
        ...defaultFormData,
        examCode: initCode,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        formStartDate: new Date().toISOString().split('T')[0],
        formEndDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
      };
      setFormData(initData);
      setIsEditing(false);
    }
    setActiveWizardTab('BASIC');
    setShowCreateModal(true);
  };

  // Save Examination (Draft or Configured)
  const handleSaveExam = (targetStatus: 'DRAFT' | 'FORM_OPEN' = 'DRAFT') => {
    if (!formData.name?.trim()) {
      showToast('error', 'Examination Name is mandatory.');
      return;
    }
    if (!formData.programId) {
      showToast('error', 'Please select an Academic Program.');
      return;
    }
    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      showToast('error', 'Exam Start Date cannot be after Exam End Date.');
      return;
    }
    if (formData.formStartDate && formData.formEndDate && new Date(formData.formStartDate) >= new Date(formData.formEndDate)) {
      showToast('error', 'Form Start Date must be strictly before Form End Date.');
      return;
    }

    try {
      const payload: Partial<Exam> = {
        ...formData,
        status: targetStatus,
      };

      if (isEditing && formData.id) {
        db.updateExam(formData.id, payload, user);
        showToast('success', `Examination "${formData.name}" updated successfully.`);
      } else {
        db.createExam(payload, user);
        showToast('success', `Examination "${formData.name}" created successfully with status ${targetStatus}.`);
      }

      setShowCreateModal(false);
      loadData();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save examination.');
    }
  };

  // Status Action Handlers
  const handlePublishForm = (exam: Exam) => {
    if (!exam.formStartDate || !exam.formEndDate) {
      showToast('error', 'Exam Form Start and End dates must be set before publishing form.');
      return;
    }
    db.publishExamForm(exam.id, user);
    showToast('success', `Exam "${exam.name}" is now PUBLISHED and open for student form submission.`);
    loadData();
  };

  const handleUnpublishExam = (exam: Exam) => {
    db.unpublishExam(exam.id, user);
    showToast('success', `Exam "${exam.name}" has been UNPUBLISHED and reverted to DRAFT.`);
    loadData();
  };

  const handleCloseForm = (exam: Exam) => {
    db.closeExamForm(exam.id, user);
    showToast('success', `Exam form window for "${exam.name}" has been CLOSED.`);
    loadData();
  };

  const handleCancelExam = (exam: Exam) => {
    const reason = window.prompt(`Enter reason for cancelling "${exam.name}":`, 'Cancelled by Controller of Examinations.');
    if (reason !== null) {
      db.cancelExam(exam.id, user, reason);
      showToast('success', `Examination "${exam.name}" has been CANCELLED.`);
      loadData();
    }
  };

  // Filtered examinations list
  const filteredExams = useMemo(() => {
    return exams.filter(e => {
      if (filterInstitute !== 'ALL' && e.instituteId !== filterInstitute) return false;
      if (filterDepartment !== 'ALL' && e.departmentId !== filterDepartment) return false;
      if (filterProgram !== 'ALL' && e.programId !== filterProgram) return false;
      if (filterAcademicYear !== 'ALL' && e.academicYearId !== filterAcademicYear) return false;
      if (filterStatus !== 'ALL' && e.status !== filterStatus) return false;
      if (filterType !== 'ALL' && e.type !== filterType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesCode = (e.examCode || e.code || '').toLowerCase().includes(q);
        const matchesName = (e.name || '').toLowerCase().includes(q);
        const matchesSession = (e.session || '').toLowerCase().includes(q);
        const matchesType = (e.type || '').toLowerCase().includes(q);
        if (!matchesCode && !matchesName && !matchesSession && !matchesType) return false;
      }
      return true;
    });
  }, [exams, filterInstitute, filterDepartment, filterProgram, filterAcademicYear, filterStatus, filterType, searchQuery]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Toast Notification */}
      {notification && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            background: notification.type === 'success' ? '#ECFDF5' : '#FEF2F2',
            color: notification.type === 'success' ? '#065F46' : '#991B1B',
            border: `1px solid ${notification.type === 'success' ? '#A7F3D0' : '#FECACA'}`,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {notification.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          {notification.message}
        </div>
      )}

      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-navy)', margin: 0 }}>
            University Examination Management Core
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
            Phase 2: Controller of Examinations — Examination Creation, Academic Mapping, Subjects, Fee &amp; Late Fee Rules
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setNoticeData({
                title: '',
                message: '',
                examId: exams[0]?.id || '',
                noticeType: 'IMPORTANT_NOTICE',
                priority: 'HIGH',
                programId: '',
                departmentId: '',
                semesterId: '',
                attachmentName: '',
              });
              setShowNoticeModal(true);
            }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
          >
            <AlertCircle size={18} /> Broadcast Notice
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleOpenCreateModal()}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
          >
            <Plus size={18} /> Create Examination
          </button>
        </div>
      </div>

      {/* Filters Card */}
      <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 2, minWidth: '240px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input"
              placeholder="Search exam code, name, session, or type..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.25rem', width: '100%' }}
            />
          </div>

          <div style={{ flex: 1, minWidth: '150px' }}>
            <select className="select" value={filterType} onChange={e => setFilterType(e.target.value)} style={{ width: '100%' }}>
              <option value="ALL">All Exam Types</option>
              <option value="Regular">Regular</option>
              <option value="Backlog">Backlog</option>
              <option value="Supplementary">Supplementary</option>
              <option value="Remedial">Remedial</option>
              <option value="Re-Examination">Re-Examination</option>
              <option value="Improvement">Improvement</option>
              <option value="Special Examination">Special Examination</option>
            </select>
          </div>

          <div style={{ flex: 1, minWidth: '150px' }}>
            <select className="select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: '100%' }}>
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">DRAFT</option>
              <option value="FORM_OPEN">FORM_OPEN</option>
              <option value="FORM_CLOSED">FORM_CLOSED</option>
              <option value="SCHEDULED">SCHEDULED</option>
              <option value="ONGOING">ONGOING</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="RESULT_PROCESSING">RESULT_PROCESSING</option>
              <option value="RESULT_PUBLISHED">RESULT_PUBLISHED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <div style={{ flex: 1, minWidth: '160px' }}>
            <select className="select" value={filterProgram} onChange={e => setFilterProgram(e.target.value)} style={{ width: '100%' }}>
              <option value="ALL">All Programs</option>
              {programs.map(p => (
                <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Examinations List Table */}
      <div className="card" style={{ padding: '1.5rem', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--brand-navy)', margin: 0 }}>
            Configured Examinations ({filteredExams.length})
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Showing records scoped to Exam Controller &amp; Academic hierarchy
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface-hover)' }}>
                <th>Exam Code</th>
                <th>Examination Name</th>
                <th>Type</th>
                <th>Session &amp; Year</th>
                <th>Program &amp; Sem</th>
                <th>Form Window</th>
                <th>Status</th>
                <th>Linked Notesheet</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExams.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No examinations match the selected criteria. Click "<strong>Create Examination</strong>" to draft a new session.
                  </td>
                </tr>
              ) : (
                filteredExams.map(exam => {
                  const prog = programs.find(p => p.id === exam.programId);
                  const isFormOpen = exam.status === 'FORM_OPEN';
                  const isDraft = exam.status === 'DRAFT';
                  const isFormClosed = exam.status === 'FORM_CLOSED';

                  return (
                    <tr key={exam.id}>
                      <td>
                        <strong style={{ color: 'var(--brand-orange)', fontFamily: 'monospace' }}>
                          {exam.examCode || exam.code}
                        </strong>
                      </td>
                      <td>
                        <strong>{exam.name}</strong>
                        {exam.description && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {exam.description}
                          </div>
                        )}
                      </td>
                      <td>
                        <Badge variant={exam.type === 'Regular' ? 'navy' : exam.type === 'Backlog' ? 'orange' : 'gold'}>
                          {exam.type}
                        </Badge>
                      </td>
                      <td>
                        <div>{exam.session || 'Summer 2026'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{exam.academicYearCode || '2026-27'}</div>
                      </td>
                      <td>
                        <div>{prog?.code || exam.programId}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Semester {exam.semesterNumber || 4}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.8rem' }}>
                          <strong>{exam.formStartDate || exam.startDate}</strong>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          to {exam.formEndDate || exam.formDeadline || exam.endDate}
                        </div>
                      </td>
                      <td>
                        <Badge variant={
                          exam.status === 'FORM_OPEN' ? 'active' :
                          exam.status === 'DRAFT' ? 'warning' :
                          exam.status === 'FORM_CLOSED' ? 'orange' :
                          exam.status === 'SCHEDULED' || exam.status === 'ONGOING' ? 'navy' :
                          exam.status === 'COMPLETED' || exam.status === 'RESULT_PUBLISHED' ? 'active' : 'danger'
                        }>
                          {exam.status}
                        </Badge>
                      </td>
                      <td>
                        {exam.notesheetNumber || exam.notesheetId ? (
                          <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--brand-navy)', fontWeight: 700 }}>
                            📄 {exam.notesheetNumber || exam.notesheetId}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>None</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem', alignItems: 'center' }}>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            title="View Exam Details & Sub-Configs"
                            onClick={() => setSelectedExamDetails(exam)}
                            style={{ padding: '0.25rem 0.5rem' }}
                          >
                            <Eye size={15} />
                          </button>

                          {(isDraft || isFormClosed) && (
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              title="Publish / Open Exam Form Window"
                              onClick={() => handlePublishForm(exam)}
                              style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                            >
                              Open Form
                            </button>
                          )}

                          {isFormOpen && (
                            <>
                              <button
                                type="button"
                                className="btn btn-warning btn-sm"
                                title="Close Exam Form Window"
                                onClick={() => handleCloseForm(exam)}
                                style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                              >
                                Close Form
                              </button>
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                title="Unpublish Exam (revert to DRAFT)"
                                onClick={() => handleUnpublishExam(exam)}
                                style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                              >
                                Unpublish
                              </button>
                            </>
                          )}

                          {(isDraft || isFormClosed) && (
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              title="Edit Exam Configuration"
                              onClick={() => handleOpenCreateModal(exam)}
                              style={{ padding: '0.25rem 0.5rem' }}
                            >
                              <Edit2 size={15} />
                            </button>
                          )}

                          {exam.status !== 'CANCELLED' && exam.status !== 'COMPLETED' && exam.status !== 'RESULT_PUBLISHED' && (
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              title="Cancel Examination"
                              onClick={() => handleCancelExam(exam)}
                              style={{ padding: '0.25rem 0.5rem', color: 'var(--danger-color)' }}
                            >
                              <XCircle size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── CREATE / EDIT EXAMINATION WIZARD MODAL ─── */}
      {showCreateModal && (
        <div className="modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ width: '96%', maxWidth: '880px', maxHeight: '92vh', display: 'flex', flexDirection: 'column', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)', overflow: 'hidden', padding: 0 }}>
            
            {/* Modal Header */}
            <div style={{ padding: '1.25rem 1.5rem', background: 'var(--brand-navy)', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={22} color="var(--brand-orange)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
                  {isEditing ? 'Edit Examination Configuration' : 'Create New Examination Session'}
                </h3>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowCreateModal(false)} style={{ color: '#FFFFFF' }}>
                <X size={20} />
              </button>
            </div>

            {/* Wizard Step Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-surface-hover)' }}>
              <button
                type="button"
                className={`btn btn-sm ${activeWizardTab === 'BASIC' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setActiveWizardTab('BASIC')}
                style={{ flex: 1, borderRadius: 0, padding: '0.75rem', fontWeight: 700 }}
              >
                1. Academic Mapping &amp; Dates
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activeWizardTab === 'SUBJECTS' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => {
                  if (formData.subjects?.length === 0) handlePopulateEligibleSubjects();
                  setActiveWizardTab('SUBJECTS');
                }}
                style={{ flex: 1, borderRadius: 0, padding: '0.75rem', fontWeight: 700 }}
              >
                2. Subjects ({formData.subjects?.length || 0})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activeWizardTab === 'FEES' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setActiveWizardTab('FEES')}
                style={{ flex: 1, borderRadius: 0, padding: '0.75rem', fontWeight: 700 }}
              >
                3. Fees &amp; Late Fee Rules
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activeWizardTab === 'NOTESHEET' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setActiveWizardTab('NOTESHEET')}
                style={{ flex: 1, borderRadius: 0, padding: '0.75rem', fontWeight: 700 }}
              >
                4. Notesheet Link &amp; Review
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* ─── TAB 1: ACADEMIC MAPPING & DATES ─── */}
              {activeWizardTab === 'BASIC' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="grid-2">
                    <div>
                      <label className="label" style={{ fontWeight: 700 }}>Examination Code *</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="e.g. EXAM-2026-CSE-SEM4-REG"
                        value={formData.examCode || formData.code || ''}
                        onChange={e => setFormData({ ...formData, examCode: e.target.value, code: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="label" style={{ fontWeight: 700 }}>Examination Type *</label>
                      <select
                        className="select"
                        value={formData.type || 'Regular'}
                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                      >
                        <option value="Regular">Regular</option>
                        <option value="Backlog">Backlog</option>
                        <option value="Supplementary">Supplementary</option>
                        <option value="Remedial">Remedial</option>
                        <option value="Re-Examination">Re-Examination</option>
                        <option value="Improvement">Improvement</option>
                        <option value="Special Examination">Special Examination</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="label" style={{ fontWeight: 700 }}>Examination Name / Title *</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. B.Tech CSE Semester-4 Summer 2026 Regular Examination"
                      value={formData.name || ''}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="grid-3">
                    <div>
                      <label className="label" style={{ fontWeight: 700 }}>Institute</label>
                      <select
                        className="select"
                        value={formData.instituteId || 'inst-1'}
                        onChange={e => setFormData({ ...formData, instituteId: e.target.value })}
                      >
                        {institutes.map(inst => (
                          <option key={inst.id} value={inst.id}>{inst.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label" style={{ fontWeight: 700 }}>Department</label>
                      <select
                        className="select"
                        value={formData.departmentId || 'dept-cse'}
                        onChange={e => setFormData({ ...formData, departmentId: e.target.value })}
                      >
                        {departments.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label" style={{ fontWeight: 700 }}>Program *</label>
                      <select
                        className="select"
                        value={formData.programId || 'prog-btech-cse'}
                        onChange={e => setFormData({ ...formData, programId: e.target.value })}
                      >
                        {availablePrograms.map(p => (
                          <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid-3">
                    <div>
                      <label className="label" style={{ fontWeight: 700 }}>Academic Year</label>
                      <select
                        className="select"
                        value={formData.academicYearId || 'ay-2026'}
                        onChange={e => {
                          const ay = academicYears.find(a => a.id === e.target.value);
                          setFormData({ ...formData, academicYearId: e.target.value, academicYearCode: ay?.name || '2026-27' });
                        }}
                      >
                        {academicYears.map(ay => (
                          <option key={ay.id} value={ay.id}>{ay.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label" style={{ fontWeight: 700 }}>Semester</label>
                      <select
                        className="select"
                        value={formData.semesterId || 'sem-4'}
                        onChange={e => {
                          const sem = semesters.find(s => s.id === e.target.value);
                          setFormData({ ...formData, semesterId: e.target.value, semesterNumber: sem?.number || 4 });
                        }}
                      >
                        {semesters.map(s => (
                          <option key={s.id} value={s.id}>Semester {s.number} ({s.code})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label" style={{ fontWeight: 700 }}>Exam Session</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="e.g. Summer 2026 / Winter 2026"
                        value={formData.session || ''}
                        onChange={e => setFormData({ ...formData, session: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="card" style={{ padding: '1rem', background: '#F8FAFC', border: '1px solid var(--border-color)' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '0.75rem' }}>
                      Window &amp; Session Timeline Dates
                    </h4>
                    <div className="grid-4">
                      <div>
                        <label className="label">Exam Form Start *</label>
                        <input
                          type="date"
                          className="input"
                          value={formData.formStartDate || ''}
                          onChange={e => setFormData({ ...formData, formStartDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="label">Exam Form End *</label>
                        <input
                          type="date"
                          className="input"
                          value={formData.formEndDate || ''}
                          onChange={e => setFormData({ ...formData, formEndDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="label">Examination Start *</label>
                        <input
                          type="date"
                          className="input"
                          value={formData.startDate || ''}
                          onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="label">Examination End *</label>
                        <input
                          type="date"
                          className="input"
                          value={formData.endDate || ''}
                          onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid-3" style={{ marginTop: '0.75rem' }}>
                      <div>
                        <label className="label">Late Fee Form Start</label>
                        <input
                          type="date"
                          className="input"
                          value={formData.lateFeeStartDate || ''}
                          onChange={e => setFormData({ ...formData, lateFeeStartDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="label">Late Fee Final End Deadline</label>
                        <input
                          type="date"
                          className="input"
                          value={formData.lateFeeEndDate || ''}
                          onChange={e => setFormData({ ...formData, lateFeeEndDate: e.target.value, lateFeeDeadline: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="label">Mandatory Attendance Gate (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          className="input"
                          value={formData.minAttendanceRequired ?? 75}
                          onChange={e => setFormData({ ...formData, minAttendanceRequired: Number(e.target.value), minAttendancePercentage: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="label" style={{ fontWeight: 700 }}>General Instructions for Students</label>
                    <textarea
                      className="input"
                      rows={2}
                      value={formData.instructions || ''}
                      onChange={e => setFormData({ ...formData, instructions: e.target.value })}
                      placeholder="e.g. Hall Ticket mandatory, reporting time 30 minutes prior..."
                    />
                  </div>
                </div>
              )}

              {/* ─── TAB 2: SUBJECTS CONFIGURATION ─── */}
              {activeWizardTab === 'SUBJECTS' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--brand-navy)', margin: 0 }}>
                        Academic Paper / Subject Configuration
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                        Loaded from Program academic structure. Configure Max Marks, Passing Marks, Duration &amp; Mode.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={handlePopulateEligibleSubjects}
                    >
                      <RefreshCw size={14} /> Re-populate from Academic Structure
                    </button>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table className="table" style={{ fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ background: 'var(--bg-surface-hover)' }}>
                          <th>Subject Code &amp; Name</th>
                          <th>Credits</th>
                          <th>Max Marks</th>
                          <th>Passing</th>
                          <th>Internal / External</th>
                          <th>Duration (min)</th>
                          <th>Mode</th>
                        </tr>
                      </thead>
                      <tbody>
                        {!formData.subjects || formData.subjects.length === 0 ? (
                          <tr>
                            <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                              No subjects configured yet. Click "<strong>Re-populate from Academic Structure</strong>".
                            </td>
                          </tr>
                        ) : (
                          formData.subjects.map((sub, sIdx) => (
                            <tr key={sub.subjectId || sIdx}>
                              <td>
                                <strong>{sub.subjectCode}</strong> - {sub.subjectName}
                              </td>
                              <td style={{ width: '80px' }}>
                                <input
                                  type="number"
                                  className="input"
                                  value={sub.credits ?? 3}
                                  onChange={e => {
                                    const next = [...(formData.subjects || [])];
                                    next[sIdx].credits = Number(e.target.value);
                                    setFormData({ ...formData, subjects: next });
                                  }}
                                  style={{ padding: '0.25rem 0.5rem' }}
                                />
                              </td>
                              <td style={{ width: '90px' }}>
                                <input
                                  type="number"
                                  className="input"
                                  value={sub.maximumMarks ?? 100}
                                  onChange={e => {
                                    const next = [...(formData.subjects || [])];
                                    next[sIdx].maximumMarks = Number(e.target.value);
                                    setFormData({ ...formData, subjects: next });
                                  }}
                                  style={{ padding: '0.25rem 0.5rem' }}
                                />
                              </td>
                              <td style={{ width: '80px' }}>
                                <input
                                  type="number"
                                  className="input"
                                  value={sub.passingMarks ?? 40}
                                  onChange={e => {
                                    const next = [...(formData.subjects || [])];
                                    next[sIdx].passingMarks = Number(e.target.value);
                                    setFormData({ ...formData, subjects: next });
                                  }}
                                  style={{ padding: '0.25rem 0.5rem' }}
                                />
                              </td>
                              <td style={{ width: '130px' }}>
                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                  <input
                                    type="number"
                                    className="input"
                                    title="Internal Marks"
                                    value={sub.internalMarks ?? 30}
                                    onChange={e => {
                                      const next = [...(formData.subjects || [])];
                                      next[sIdx].internalMarks = Number(e.target.value);
                                      setFormData({ ...formData, subjects: next });
                                    }}
                                    style={{ padding: '0.25rem 0.35rem', width: '50px' }}
                                  />
                                  <span style={{ alignSelf: 'center' }}>/</span>
                                  <input
                                    type="number"
                                    className="input"
                                    title="External Marks"
                                    value={sub.externalMarks ?? 70}
                                    onChange={e => {
                                      const next = [...(formData.subjects || [])];
                                      next[sIdx].externalMarks = Number(e.target.value);
                                      setFormData({ ...formData, subjects: next });
                                    }}
                                    style={{ padding: '0.25rem 0.35rem', width: '50px' }}
                                  />
                                </div>
                              </td>
                              <td style={{ width: '100px' }}>
                                <input
                                  type="number"
                                  className="input"
                                  value={sub.durationMinutes ?? 180}
                                  onChange={e => {
                                    const next = [...(formData.subjects || [])];
                                    next[sIdx].durationMinutes = Number(e.target.value);
                                    setFormData({ ...formData, subjects: next });
                                  }}
                                  style={{ padding: '0.25rem 0.5rem' }}
                                />
                              </td>
                              <td style={{ width: '110px' }}>
                                <select
                                  className="select"
                                  value={sub.examMode || 'OFFLINE'}
                                  onChange={e => {
                                    const next = [...(formData.subjects || [])];
                                    next[sIdx].examMode = e.target.value as any;
                                    setFormData({ ...formData, subjects: next });
                                  }}
                                  style={{ padding: '0.25rem 0.35rem' }}
                                >
                                  <option value="OFFLINE">OFFLINE</option>
                                  <option value="ONLINE">ONLINE</option>
                                  <option value="OTHER">OTHER</option>
                                </select>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ─── TAB 3: FEES & LATE FEE RULES ─── */}
              {activeWizardTab === 'FEES' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--brand-navy)', margin: '0 0 0.5rem 0' }}>
                      Examination Fee Structure
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 1rem 0' }}>
                      Set university exam fee amounts per exam type (Regular, Backlog, Supplementary).
                    </p>

                    <div className="grid-3">
                      {(formData.fees || []).map((fee, fIdx) => (
                        <div key={fee.examType || fIdx} className="card" style={{ padding: '1rem', background: '#F8FAFC', border: '1px solid var(--border-color)' }}>
                          <label className="label" style={{ fontWeight: 700 }}>{fee.examType} Exam Fee (₹)</label>
                          <input
                            type="number"
                            min="0"
                            className="input"
                            value={fee.amount}
                            onChange={e => {
                              const next = [...(formData.fees || [])];
                              next[fIdx].amount = Number(e.target.value);
                              setFormData({ ...formData, fees: next, baseFee: next[0]?.amount });
                            }}
                          />
                          <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                            <input
                              type="checkbox"
                              checked={fee.isMandatory !== false}
                              onChange={e => {
                                const next = [...(formData.fees || [])];
                                next[fIdx].isMandatory = e.target.checked;
                                setFormData({ ...formData, fees: next });
                              }}
                            />
                            <span>Mandatory Registration Fee</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Late Fee Rule */}
                  <div className="card" style={{ padding: '1.25rem', background: '#FFFBEB', border: '1px solid #FDE68A' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#92400E', margin: '0 0 0.75rem 0' }}>
                      Late Exam Form Submission Penalty Rule
                    </h4>
                    <div className="grid-3">
                      <div>
                        <label className="label" style={{ color: '#92400E' }}>Calculation Type</label>
                        <select
                          className="select"
                          value={formData.lateFeeRule?.calculationType || 'FIXED'}
                          onChange={e => {
                            setFormData({
                              ...formData,
                              lateFeeRule: {
                                ...(formData.lateFeeRule as any),
                                calculationType: e.target.value as any,
                              },
                            });
                          }}
                        >
                          <option value="FIXED">Fixed Amount (₹)</option>
                          <option value="PER_DAY">Per Day Rate (₹/day)</option>
                          <option value="PERCENTAGE">Percentage (%)</option>
                        </select>
                      </div>

                      <div>
                        <label className="label" style={{ color: '#92400E' }}>Late Fee Amount (₹ / %)</label>
                        <input
                          type="number"
                          min="0"
                          className="input"
                          value={formData.lateFeeRule?.amount ?? 500}
                          onChange={e => {
                            setFormData({
                              ...formData,
                              lateFeeRule: {
                                ...(formData.lateFeeRule as any),
                                amount: Number(e.target.value),
                              },
                              lateFee: Number(e.target.value),
                            });
                          }}
                        />
                      </div>

                      <div>
                        <label className="label" style={{ color: '#92400E' }}>Grace Period (Days)</label>
                        <input
                          type="number"
                          min="0"
                          className="input"
                          value={formData.lateFeeRule?.gracePeriodDays ?? 2}
                          onChange={e => {
                            setFormData({
                              ...formData,
                              lateFeeRule: {
                                ...(formData.lateFeeRule as any),
                                gracePeriodDays: Number(e.target.value),
                              },
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── TAB 4: NOTESHEET LINK & REVIEW ─── */}
              {activeWizardTab === 'NOTESHEET' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div className="card" style={{ padding: '1.25rem', background: '#F8FAFC', border: '1px solid var(--border-color)' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--brand-navy)', margin: '0 0 0.5rem 0' }}>
                      Link Phase 1 Examination Proposal Notesheet
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 1rem 0' }}>
                      Optionally associate this examination session with an official university Notesheet sanction.
                    </p>

                    <div>
                      <label className="label">Select Approved / Pending Examination Notesheet</label>
                      <select
                        className="select"
                        value={formData.notesheetId || ''}
                        onChange={e => {
                          const ns = noteSheets.find(n => n.id === e.target.value);
                          setFormData({
                            ...formData,
                            notesheetId: e.target.value,
                            notesheetNumber: ns?.noteSheetNumber,
                          });
                        }}
                        style={{ width: '100%' }}
                      >
                        <option value="">-- No Linked Notesheet --</option>
                        {noteSheets.map(ns => (
                          <option key={ns.id} value={ns.id}>
                            {ns.noteSheetNumber} — {ns.title} ({ns.status})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Review Summary Card */}
                  <div className="card" style={{ padding: '1.25rem', border: '1px solid var(--border-color)' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--brand-navy)', margin: '0 0 0.75rem 0' }}>
                      Examination Summary &amp; Configuration Review
                    </h4>
                    <div className="grid-2" style={{ fontSize: '0.85rem' }}>
                      <div>
                        <div><strong>Code:</strong> {formData.examCode || formData.code}</div>
                        <div><strong>Name:</strong> {formData.name}</div>
                        <div><strong>Type:</strong> {formData.type}</div>
                        <div><strong>Session:</strong> {formData.session} ({formData.academicYearCode})</div>
                      </div>
                      <div>
                        <div><strong>Program:</strong> {availablePrograms.find(p => p.id === formData.programId)?.name}</div>
                        <div><strong>Form Window:</strong> {formData.formStartDate} to {formData.formEndDate}</div>
                        <div><strong>Exam Dates:</strong> {formData.startDate} to {formData.endDate}</div>
                        <div><strong>Configured Subjects:</strong> {formData.subjects?.length || 0} Papers</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '1rem 1.5rem', background: 'var(--bg-surface-hover)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                {activeWizardTab !== 'BASIC' && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      if (activeWizardTab === 'NOTESHEET') setActiveWizardTab('FEES');
                      else if (activeWizardTab === 'FEES') setActiveWizardTab('SUBJECTS');
                      else if (activeWizardTab === 'SUBJECTS') setActiveWizardTab('BASIC');
                    }}
                  >
                    Back
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleSaveExam('DRAFT')}
                  style={{ fontWeight: 700 }}
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => handleSaveExam('FORM_OPEN')}
                  style={{ fontWeight: 800 }}
                >
                  Save &amp; Publish Form Window
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── EXAM DETAILS INSPECTOR MODAL ─── */}
      {selectedExamDetails && (
        <div className="modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ width: '96%', maxWidth: '820px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)', overflow: 'hidden', padding: 0 }}>
            
            {/* Inspector Header */}
            <div style={{ padding: '1.25rem 1.5rem', background: 'var(--brand-navy)', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.85 }}>Examination Details</span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
                  {selectedExamDetails.name}
                </h3>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelectedExamDetails(null)} style={{ color: '#FFFFFF' }}>
                <X size={20} />
              </button>
            </div>

            {/* Inspector Body */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.875rem' }}>
              
              {/* Top Meta Bar */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <Badge variant={selectedExamDetails.type === 'Regular' ? 'navy' : 'orange'}>
                  {selectedExamDetails.type}
                </Badge>
                <Badge variant={
                  selectedExamDetails.status === 'FORM_OPEN' ? 'active' :
                  selectedExamDetails.status === 'DRAFT' ? 'warning' :
                  selectedExamDetails.status === 'FORM_CLOSED' ? 'orange' : 'navy'
                }>
                  {selectedExamDetails.status}
                </Badge>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--brand-navy)' }}>
                  {selectedExamDetails.examCode || selectedExamDetails.code}
                </span>
                {selectedExamDetails.notesheetNumber && (
                  <Badge variant="gold">
                    📄 Notesheet: {selectedExamDetails.notesheetNumber}
                  </Badge>
                )}
              </div>

              {/* Academic Hierarchy */}
              <div className="grid-2 card" style={{ padding: '1rem', background: '#F8FAFC' }}>
                <div>
                  <div><strong>Program:</strong> {programs.find(p => p.id === selectedExamDetails.programId)?.name || selectedExamDetails.programId}</div>
                  <div><strong>Session:</strong> {selectedExamDetails.session} ({selectedExamDetails.academicYearCode})</div>
                  <div><strong>Semester:</strong> Semester {selectedExamDetails.semesterNumber || 4}</div>
                </div>
                <div>
                  <div><strong>Form Window:</strong> {selectedExamDetails.formStartDate} to {selectedExamDetails.formEndDate}</div>
                  <div><strong>Exam Window:</strong> {selectedExamDetails.startDate} to {selectedExamDetails.endDate}</div>
                  <div><strong>Created By:</strong> {selectedExamDetails.createdBy || 'Exam Controller'}</div>
                </div>
              </div>

              {/* Configured Subjects Table */}
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '0.5rem' }}>
                  Configured Subjects &amp; Paper Marks Scheme ({selectedExamDetails.subjects?.length || 0})
                </h4>
                <div style={{ overflowX: 'auto' }}>
                  <table className="table" style={{ fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-surface-hover)' }}>
                        <th>Subject</th>
                        <th>Credits</th>
                        <th>Max</th>
                        <th>Pass</th>
                        <th>Internal</th>
                        <th>External</th>
                        <th>Duration</th>
                        <th>Mode</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!selectedExamDetails.subjects || selectedExamDetails.subjects.length === 0 ? (
                        <tr>
                          <td colSpan={8} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                            No detailed subject breakdown attached.
                          </td>
                        </tr>
                      ) : (
                        selectedExamDetails.subjects.map(s => (
                          <tr key={s.subjectId}>
                            <td><strong>{s.subjectCode}</strong> - {s.subjectName}</td>
                            <td>{s.credits}</td>
                            <td>{s.maximumMarks}</td>
                            <td>{s.passingMarks}</td>
                            <td>{s.internalMarks}</td>
                            <td>{s.externalMarks}</td>
                            <td>{s.durationMinutes} min</td>
                            <td><Badge variant="navy">{s.examMode}</Badge></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Configured Fees & Late Fee Rules */}
              <div className="grid-2">
                <div className="card" style={{ padding: '1rem', background: '#F8FAFC' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--brand-navy)', margin: '0 0 0.5rem 0' }}>
                    Exam Fee Schedule
                  </h4>
                  {(selectedExamDetails.fees || []).map(f => (
                    <div key={f.examType} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.25rem 0' }}>
                      <span>{f.examType} Fee:</span>
                      <strong>₹{f.amount.toLocaleString('en-IN')}</strong>
                    </div>
                  ))}
                </div>

                <div className="card" style={{ padding: '1rem', background: '#FFFBEB', border: '1px solid #FDE68A' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#92400E', margin: '0 0 0.5rem 0' }}>
                    Late Fee Calculation Rule
                  </h4>
                  <div style={{ fontSize: '0.85rem' }}>
                    <div><strong>Type:</strong> {selectedExamDetails.lateFeeRule?.calculationType || 'FIXED'}</div>
                    <div><strong>Amount:</strong> ₹{selectedExamDetails.lateFeeRule?.amount ?? selectedExamDetails.lateFee}</div>
                    <div><strong>Grace Period:</strong> {selectedExamDetails.lateFeeRule?.gracePeriodDays ?? 2} Days</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Inspector Footer */}
            <div style={{ padding: '1rem 1.5rem', background: 'var(--bg-surface-hover)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedExamDetails(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── BROADCAST EXAM NOTICE MODAL ─── */}
      {showNoticeModal && (
        <div className="modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ width: '96%', maxWidth: '680px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)', overflow: 'hidden', padding: 0 }}>
            
            {/* Header */}
            <div style={{ padding: '1.25rem 1.5rem', background: 'var(--brand-navy)', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={22} color="var(--brand-orange)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
                  Broadcast Official Examination Notice
                </h3>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowNoticeModal(false)} style={{ color: '#FFFFFF' }}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
              <div>
                <label className="label" style={{ fontWeight: 700 }}>Associated Examination (Optional)</label>
                <select
                  className="select"
                  value={noticeData.examId}
                  onChange={e => {
                    const ex = exams.find(x => x.id === e.target.value);
                    setNoticeData({
                      ...noticeData,
                      examId: e.target.value,
                      programId: ex?.programId || noticeData.programId,
                      departmentId: ex?.departmentId || noticeData.departmentId,
                      semesterId: ex?.semesterId || noticeData.semesterId
                    });
                  }}
                  style={{ width: '100%' }}
                >
                  <option value="">-- General University Examination Broadcast --</option>
                  {exams.map(ex => (
                    <option key={ex.id} value={ex.id}>{ex.name} ({ex.session})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label" style={{ fontWeight: 700 }}>Notice Title *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Mandatory Guidelines for Summer 2026 Examination Hall Conduct"
                  value={noticeData.title}
                  onChange={e => setNoticeData({ ...noticeData, title: e.target.value })}
                />
              </div>

              <div className="grid-2">
                <div>
                  <label className="label" style={{ fontWeight: 700 }}>Notice Category</label>
                  <select
                    className="select"
                    value={noticeData.noticeType}
                    onChange={e => setNoticeData({ ...noticeData, noticeType: e.target.value as any })}
                  >
                    <option value="IMPORTANT_NOTICE">IMPORTANT_NOTICE</option>
                    <option value="EXAM_FORM">EXAM_FORM</option>
                    <option value="EXAM_DEADLINE">EXAM_DEADLINE</option>
                    <option value="EXAM_SCHEDULE">EXAM_SCHEDULE</option>
                    <option value="EXAM_CENTRE">EXAM_CENTRE</option>
                    <option value="HALL_TICKET">HALL_TICKET</option>
                    <option value="RESULT">RESULT</option>
                    <option value="REASSESSMENT">REASSESSMENT</option>
                  </select>
                </div>

                <div>
                  <label className="label" style={{ fontWeight: 700 }}>Priority Level</label>
                  <select
                    className="select"
                    value={noticeData.priority}
                    onChange={e => setNoticeData({ ...noticeData, priority: e.target.value as any })}
                  >
                    <option value="HIGH">HIGH (Urgent Alert)</option>
                    <option value="URGENT">URGENT (Top Banner)</option>
                    <option value="NORMAL">NORMAL</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label" style={{ fontWeight: 700 }}>Notice Content / Message *</label>
                <textarea
                  className="input"
                  rows={4}
                  placeholder="Type the detailed circular, instructions, or deadline warning for eligible students..."
                  value={noticeData.message}
                  onChange={e => setNoticeData({ ...noticeData, message: e.target.value })}
                />
              </div>

              <div>
                <label className="label" style={{ fontWeight: 700 }}>Attachment File Name (Optional)</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Exam_Ordinance_Summer_2026.pdf"
                  value={noticeData.attachmentName}
                  onChange={e => setNoticeData({ ...noticeData, attachmentName: e.target.value })}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '1rem 1.5rem', background: 'var(--bg-surface-hover)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowNoticeModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  if (!noticeData.title.trim() || !noticeData.message.trim()) {
                    showToast('error', 'Notice Title and Message are required.');
                    return;
                  }
                  try {
                    db.createManualExamNotice({
                      title: noticeData.title.trim(),
                      message: noticeData.message.trim(),
                      examId: noticeData.examId || undefined,
                      noticeType: noticeData.noticeType,
                      priority: noticeData.priority,
                      programId: noticeData.programId || undefined,
                      departmentId: noticeData.departmentId || undefined,
                      semesterId: noticeData.semesterId || undefined,
                      attachmentName: noticeData.attachmentName.trim() || undefined,
                    }, user);
                    showToast('success', `Examination notice "${noticeData.title}" broadcasted successfully.`);
                    setShowNoticeModal(false);
                  } catch (err: any) {
                    showToast('error', err.message || 'Failed to broadcast notice.');
                  }
                }}
                style={{ fontWeight: 800 }}
              >
                <Send size={15} /> Dispatch Broadcast Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
