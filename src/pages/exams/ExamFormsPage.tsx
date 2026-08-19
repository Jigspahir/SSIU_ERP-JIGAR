import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../../services/db';
import { attendanceApprovalService } from '../../services/attendanceApprovalService';
import {
  Exam, ExamForm, Student, Subject, ExamFormSubjectItem,
  Program, Department, Institute, AcademicYear, Semester, HallTicket
} from '../../types';
import { Badge } from '../../components/common/Badge';
import {
  FileText, Search, CheckCircle, XCircle, Download, Eye,
  ShieldCheck, AlertCircle, Clock, BookOpen, UserCheck, AlertTriangle,
  IndianRupee, Check, ArrowRight, RefreshCw, Send, Save, CheckSquare,
  Printer, QrCode, Layers, RotateCcw, Ban, Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ExamFormsPage: React.FC = () => {
  const { user, role } = useAuth();
  const isStudent = role === 'STUDENT';
  const isController = ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'EXAM_CELL', 'EXAM_CONTROLLER', 'CONTROLLER_OF_EXAMINATION', 'REGISTRAR'].includes(role || '');

  // Master lists
  const [exams, setExams] = useState<Exam[]>([]);
  const [availableExams, setAvailableExams] = useState<any[]>([]);
  const [studentForms, setStudentForms] = useState<ExamForm[]>([]);
  const [allForms, setAllForms] = useState<ExamForm[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [hallTickets, setHallTickets] = useState<HallTicket[]>([]);

  // Navigation Tabs
  const [studentActiveTab, setStudentActiveTab] = useState<'AVAILABLE' | 'MY_FORMS' | 'MY_HALL_TICKETS'>('AVAILABLE');
  const [staffActiveTab, setStaffActiveTab] = useState<'QUEUE' | 'HALL_TICKETS'>('QUEUE');

  // Search & Filter State (Staff)
  const [searchQuery, setSearchQuery] = useState('');
  const [filterExam, setFilterExam] = useState('ALL');
  const [filterProgram, setFilterProgram] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('ALL');

  // Multi-Selection State for Bulk Actions
  const [selectedFormIds, setSelectedFormIds] = useState<string[]>([]);

  // Modals State
  const [selectedExamForForm, setSelectedExamForForm] = useState<any | null>(null);
  const [activeDraftForm, setActiveDraftForm] = useState<ExamForm | null>(null);
  const [viewingFormDetails, setViewingFormDetails] = useState<ExamForm | null>(null);
  const [viewingHallTicket, setViewingHallTicket] = useState<HallTicket | null>(null);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [formRemarks, setFormRemarks] = useState('');
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [showSubmitConfirmModal, setShowSubmitConfirmModal] = useState(false);

  // Reason Modal (Return / Reject)
  const [reasonModal, setReasonModal] = useState<{
    isOpen: boolean;
    type: 'RETURN' | 'REJECT';
    formId?: string;
    isBulk?: boolean;
  }>({ isOpen: false, type: 'RETURN' });
  const [reasonText, setReasonText] = useState('');

  // Notifications
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setExams(db.getExams(undefined, user));
    setStudents(db.getStudents());
    setPrograms(db.getPrograms());
    setSemesters(db.getSemesters());

    if (isStudent) {
      const avail = db.getAvailableExamsForStudent(user);
      setAvailableExams(avail);
      const myForms = db.getStudentExamForms(user);
      setStudentForms(myForms);
      const myTickets = db.getHallTickets(user);
      setHallTickets(myTickets);
    } else {
      const forms = db.getExamForms();
      setAllForms(forms);
      const tickets = db.getHallTickets(user);
      setHallTickets(tickets);
    }
  };

  const showToastMessage = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Authenticated Student Profile Info
  const currentStudent = useMemo(() => {
    if (!isStudent) return null;
    return students.find(s => s.id === user?.id || s.enrollmentNo === user?.enrollmentNo || s.enrollmentNo === user?.username) || students[0];
  }, [students, user, isStudent]);

  // Open Student Form Filling Modal
  const handleOpenFormModal = (examItem: any, existingForm?: ExamForm) => {
    const examObj = db.getExamById(examItem.id) || examItem;
    setSelectedExamForForm(examObj);

    if (existingForm) {
      setActiveDraftForm(existingForm);
      setSelectedSubjectIds(existingForm.regularSubjects || existingForm.formSubjects?.map(s => s.subjectId) || []);
      setFormRemarks(existingForm.remarks || '');
      setDeclarationAccepted(!!existingForm.declarationAccepted);
    } else {
      setActiveDraftForm(null);
      const subIds = (examObj.subjects || []).map((s: any) => s.subjectId || s.id);
      setSelectedSubjectIds(subIds);
      setFormRemarks('');
      setDeclarationAccepted(false);
    }
  };

  // Live Fee Breakdown
  const formFeeSummary = useMemo(() => {
    if (!selectedExamForForm) return { examFee: 0, lateFee: 0, totalPayable: 0, isLate: false };

    const regularFeeObj = selectedExamForForm.fees?.find((f: any) => f.examType === 'Regular' || f.examType === selectedExamForForm.type);
    const baseFee = regularFeeObj ? regularFeeObj.amount : (selectedExamForForm.baseFee ?? 2500);
    const backlogFeeObj = selectedExamForForm.fees?.find((f: any) => f.examType === 'Backlog');
    const backlogFee = backlogFeeObj ? backlogFeeObj.amount : (selectedExamForForm.perSubjectFee ?? 500);

    let examFeeAmount = baseFee;
    if (selectedExamForForm.type === 'Backlog' || selectedExamForForm.type === 'Supplementary') {
      examFeeAmount = selectedSubjectIds.length * backlogFee;
    }

    const now = new Date();
    const isLate = !!(selectedExamForForm.formEndDate && now > new Date(selectedExamForForm.formEndDate));
    let lateFee = 0;
    const lateRule = selectedExamForForm.lateFeeRule;
    if (isLate && lateRule && lateRule.isActive) {
      if (lateRule.calculationType === 'FIXED') lateFee = lateRule.amount;
      else if (lateRule.calculationType === 'PER_DAY') {
        const diffDays = Math.max(1, Math.ceil((now.getTime() - new Date(selectedExamForForm.formEndDate).getTime()) / 86400000));
        lateFee = diffDays * lateRule.amount;
      } else if (lateRule.calculationType === 'PERCENTAGE') {
        lateFee = (examFeeAmount * lateRule.amount) / 100;
      }
      if (lateRule.maximumAmount) lateFee = Math.min(lateFee, lateRule.maximumAmount);
    }

    return {
      examFee: examFeeAmount,
      lateFee,
      totalPayable: examFeeAmount + lateFee,
      isLate
    };
  }, [selectedExamForForm, selectedSubjectIds]);

  // Handle Save Draft
  const handleSaveDraft = () => {
    if (!selectedExamForForm) return;
    try {
      if (activeDraftForm) {
        db.updateStudentExamForm(activeDraftForm.id, {
          subjectIds: selectedSubjectIds,
          remarks: formRemarks
        }, user);
        showToastMessage('success', `Draft exam form ${activeDraftForm.formNumber} updated successfully.`);
      } else {
        const created = db.createStudentExamForm({
          examId: selectedExamForForm.id,
          subjectIds: selectedSubjectIds,
          remarks: formRemarks
        }, user);
        showToastMessage('success', `Draft exam form ${created.formNumber} saved successfully.`);
      }
      setSelectedExamForForm(null);
      loadData();
    } catch (err: any) {
      showToastMessage('error', err.message || 'Failed to save draft exam form.');
    }
  };

  // Handle Final Submit
  const handleFinalSubmit = () => {
    if (!declarationAccepted) {
      showToastMessage('error', 'You must accept the confirmation declaration before submitting.');
      return;
    }

    try {
      let targetFormId = activeDraftForm?.id;
      if (!targetFormId) {
        const created = db.createStudentExamForm({
          examId: selectedExamForForm.id,
          subjectIds: selectedSubjectIds,
          remarks: formRemarks
        }, user);
        targetFormId = created.id;
      }

      db.submitStudentExamForm(targetFormId, {
        declarationAccepted: true,
        remarks: formRemarks
      }, user);

      showToastMessage('success', 'Exam Form submitted successfully! Registration is now complete.');
      setShowSubmitConfirmModal(false);
      setSelectedExamForForm(null);
      loadData();
    } catch (err: any) {
      showToastMessage('error', err.message || 'Submission failed.');
    }
  };

  // Handle Online Fee Payment
  const handlePayFee = (form: ExamForm) => {
    const fee = form.totalAmount ?? form.totalFee ?? 0;
    const confirm = window.confirm(`Proceed with online examination fee payment of ₹${fee.toLocaleString('en-IN')} for Application #${form.formNumber}?`);
    if (!confirm) return;

    try {
      db.payStudentExamForm(form.id, { gateway: 'ONLINE_PORTAL' }, user);
      showToastMessage('success', `Examination fee of ₹${fee.toLocaleString('en-IN')} paid successfully.`);
      loadData();
    } catch (err: any) {
      showToastMessage('error', err.message || 'Payment processing failed.');
    }
  };

  // ─── EXAM CONTROLLER ACTIONS ───

  // Start Review
  const handleStartReview = (form: ExamForm) => {
    try {
      db.reviewExamForm(form.id, user);
      showToastMessage('success', `Exam form #${form.formNumber} is now UNDER REVIEW.`);
      loadData();
      if (viewingFormDetails && viewingFormDetails.id === form.id) {
        setViewingFormDetails({ ...viewingFormDetails, status: 'UNDER_REVIEW' });
      }
    } catch (err: any) {
      showToastMessage('error', err.message || 'Failed to start review.');
    }
  };

  // Verify Form
  const handleVerifyForm = (form: ExamForm) => {
    try {
      db.verifyExamForm(form.id, { verificationRemarks: 'Verified all papers and cleared fees' }, user);
      showToastMessage('success', `Exam form #${form.formNumber} VERIFIED successfully.`);
      loadData();
      if (viewingFormDetails && viewingFormDetails.id === form.id) {
        setViewingFormDetails({ ...viewingFormDetails, status: 'VERIFIED', verifiedBy: user?.name || 'Exam Controller' });
      }
    } catch (err: any) {
      showToastMessage('error', err.message || 'Verification failed.');
    }
  };

  // Open Return / Reject Reason Modal
  const openReasonModal = (type: 'RETURN' | 'REJECT', formId?: string, isBulk = false) => {
    setReasonModal({ isOpen: true, type, formId, isBulk });
    setReasonText('');
  };

  // Confirm Return / Reject
  const handleConfirmReason = () => {
    if (!reasonText.trim()) {
      showToastMessage('error', 'Please provide a non-empty reason.');
      return;
    }

    try {
      if (reasonModal.isBulk) {
        if (reasonModal.type === 'RETURN') {
          db.bulkReturnExamForms({ formIds: selectedFormIds, returnReason: reasonText.trim() }, user);
          showToastMessage('success', `Returned ${selectedFormIds.length} forms for student correction.`);
        } else {
          db.bulkRejectExamForms({ formIds: selectedFormIds, rejectionReason: reasonText.trim() }, user);
          showToastMessage('success', `Rejected ${selectedFormIds.length} exam forms.`);
        }
        setSelectedFormIds([]);
      } else if (reasonModal.formId) {
        if (reasonModal.type === 'RETURN') {
          db.returnExamForm(reasonModal.formId, { returnReason: reasonText.trim() }, user);
          showToastMessage('success', 'Exam form returned to student for correction.');
        } else {
          db.rejectExamForm(reasonModal.formId, { rejectionReason: reasonText.trim() }, user);
          showToastMessage('success', 'Exam form rejected.');
        }
      }
      setReasonModal({ isOpen: false, type: 'RETURN' });
      setReasonText('');
      setViewingFormDetails(null);
      loadData();
    } catch (err: any) {
      showToastMessage('error', err.message || 'Action failed.');
    }
  };

  // Bulk Verify
  const handleBulkVerify = () => {
    if (selectedFormIds.length === 0) return;
    const confirm = window.confirm(`Verify all ${selectedFormIds.length} selected examination forms?`);
    if (!confirm) return;

    try {
      db.bulkVerifyExamForms({ formIds: selectedFormIds, verificationRemarks: 'Bulk verified by Controller' }, user);
      showToastMessage('success', `Successfully verified ${selectedFormIds.length} exam forms.`);
      setSelectedFormIds([]);
      loadData();
    } catch (err: any) {
      showToastMessage('error', err.message || 'Bulk verification failed.');
    }
  };

  // Generate Hall Ticket
  const handleGenerateHallTicket = (form: ExamForm) => {
    try {
      const ticket = db.generateHallTicket(form.id, user);
      showToastMessage('success', `Hall Ticket ${ticket.hallTicketNo} generated successfully.`);
      loadData();
      setViewingHallTicket(ticket);
    } catch (err: any) {
      showToastMessage('error', err.message || 'Hall Ticket generation failed.');
    }
  };

  // Bulk Generate Hall Tickets
  const handleBulkGenerateHallTickets = () => {
    const verifiedForms = allForms.filter(f => f.status === 'VERIFIED');
    if (verifiedForms.length === 0) {
      showToastMessage('error', 'No verified examination forms available for Hall Ticket generation.');
      return;
    }

    try {
      let count = 0;
      for (const f of verifiedForms) {
        db.generateHallTicket(f.id, user);
        count++;
      }
      showToastMessage('success', `Generated ${count} Hall Tickets for verified students.`);
      loadData();
    } catch (err: any) {
      showToastMessage('error', err.message || 'Bulk Hall Ticket generation failed.');
    }
  };

  // Filtered Exam Forms for Exam Controller Queue
  const filteredForms = useMemo(() => {
    return allForms.filter(f => {
      if (filterExam !== 'ALL' && f.examId !== filterExam) return false;
      if (filterProgram !== 'ALL' && f.programId !== filterProgram) return false;
      if (filterStatus !== 'ALL' && f.status !== filterStatus) return false;
      if (filterPaymentStatus !== 'ALL' && f.paymentStatus !== filterPaymentStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesNumber = (f.formNumber || '').toLowerCase().includes(q);
        const matchesStudent = (f.studentName || '').toLowerCase().includes(q);
        const matchesEnrollment = (f.enrollmentNo || '').toLowerCase().includes(q);
        if (!matchesNumber && !matchesStudent && !matchesEnrollment) return false;
      }
      return true;
    });
  }, [allForms, filterExam, filterProgram, filterStatus, filterPaymentStatus, searchQuery]);

  // Dashboard KPI Metrics
  const summaryMetrics = useMemo(() => {
    return {
      total: allForms.length,
      submitted: allForms.filter(f => f.status === 'SUBMITTED').length,
      underReview: allForms.filter(f => f.status === 'UNDER_REVIEW').length,
      verified: allForms.filter(f => f.status === 'VERIFIED').length,
      returned: allForms.filter(f => f.status === 'RETURNED').length,
      rejected: allForms.filter(f => f.status === 'REJECTED').length,
      paymentPending: allForms.filter(f => f.paymentStatus === 'PENDING').length,
    };
  }, [allForms]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Toast Alert */}
      {toast && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            background: toast.type === 'success' ? '#ECFDF5' : '#FEF2F2',
            color: toast.type === 'success' ? '#065F46' : '#991B1B',
            border: `1px solid ${toast.type === 'success' ? '#A7F3D0' : '#FECACA'}`,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: 'var(--shadow-md)',
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            zIndex: 9999
          }}
        >
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--brand-navy)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={24} style={{ color: 'var(--brand-orange)' }} />
            {isStudent ? 'Student Examination Portal & Hall Tickets' : 'Exam Controller — Form Verification & Hall Tickets'}
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
            {isStudent
              ? 'Phase 3: Submit exam registration forms, track verification lifecycle & download official Hall Tickets.'
              : 'Phase 3: Review student submissions, verify fee clearances, handle returns/rejections, and issue Hall Tickets.'}
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={loadData}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <RefreshCw size={14} /> Refresh Data
        </button>
      </div>

      {/* ─── STUDENT VIEW ─── */}
      {isStudent ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Student Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <button
              type="button"
              className={`btn btn-sm ${studentActiveTab === 'AVAILABLE' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setStudentActiveTab('AVAILABLE')}
              style={{ fontWeight: 700 }}
            >
              Available Examinations ({availableExams.length})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${studentActiveTab === 'MY_FORMS' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setStudentActiveTab('MY_FORMS')}
              style={{ fontWeight: 700 }}
            >
              My Exam Forms ({studentForms.length})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${studentActiveTab === 'MY_HALL_TICKETS' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setStudentActiveTab('MY_HALL_TICKETS')}
              style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <QrCode size={14} /> My Hall Tickets ({hallTickets.length})
            </button>
          </div>

          {/* Tab 1: Available Examinations */}
          {studentActiveTab === 'AVAILABLE' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {availableExams.length === 0 ? (
                <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Clock size={36} style={{ margin: '0 auto 0.75rem auto', opacity: 0.5 }} />
                  <h4 style={{ fontSize: '1.1rem', color: 'var(--brand-navy)', margin: '0 0 0.5rem 0' }}>
                    No Active Examination Registration Windows
                  </h4>
                  <p style={{ fontSize: '0.875rem', maxWidth: '480px', margin: '0 auto' }}>
                    There are currently no published examinations open for form submission matching your program and semester.
                  </p>
                </div>
              ) : (
                <div className="grid-2" style={{ gap: '1rem' }}>
                  {availableExams.map(item => (
                    <div key={item.id} className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--border-color)' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--brand-orange)', fontSize: '0.85rem' }}>
                            {item.examCode}
                          </span>
                          <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                            <Badge variant={item.type === 'Regular' ? 'navy' : 'orange'}>
                              {item.type}
                            </Badge>
                            {item.timePeriodStatus === 'OPEN' && <Badge variant="active">Open (Regular)</Badge>}
                            {item.timePeriodStatus === 'OPEN_WITH_LATE_FEE' && <Badge variant="warning">Late Fee Period</Badge>}
                            {item.timePeriodStatus === 'FORM_NOT_STARTED' && <Badge variant="navy">Opens {item.formStartDate}</Badge>}
                            {item.timePeriodStatus === 'CLOSED' && <Badge variant="danger">Closed</Badge>}
                          </div>
                        </div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--brand-navy)', margin: '0 0 0.5rem 0' }}>
                          {item.name}
                        </h3>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <div><strong>Session:</strong> {item.session} ({item.academicYearCode}) — Semester {item.semesterNumber}</div>
                          <div><strong>Regular Form Window:</strong> {item.formStartDate} to {item.formEndDate}</div>
                          {item.lateFeeEndDate && <div><strong>Late Fee Deadline:</strong> {item.lateFeeEndDate}</div>}
                          <div><strong>Examination Conduct Dates:</strong> {item.startDate} to {item.endDate}</div>
                          <div style={{ marginTop: '0.25rem' }}>
                            <strong>75% Attendance Gate:</strong>{' '}
                            <span style={{ fontWeight: 700, color: item.shortageCount === 0 ? '#10B981' : '#D97706' }}>
                              {item.eligibleSubjectsCount || 0} of {item.subjectsCount || 0} Papers Cleared
                            </span>
                            {item.shortageCount > 0 && (
                              <span style={{ fontSize: '0.75rem', color: '#EF4444', marginLeft: '0.35rem' }}>
                                ({item.shortageCount} shortage)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Fee Pill */}
                        <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#F8FAFC', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Payable Exam Fee:</div>
                            <strong style={{ fontSize: '1.1rem', color: 'var(--brand-navy)' }}>₹{item.totalPayable.toLocaleString('en-IN')}</strong>
                          </div>
                          {item.isLate && (
                            <Badge variant="warning">
                              ⚠️ Late Fee Applied (+₹{item.applicableLateFee})
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      <div style={{ marginTop: '1rem' }}>
                        {item.isSubmitted ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Badge variant="active">✓ Form Submitted ({item.existingFormNumber})</Badge>
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              onClick={() => {
                                const f = studentForms.find(sf => sf.id === item.existingFormId);
                                if (f) setViewingFormDetails(f);
                              }}
                            >
                              <Eye size={14} /> View
                            </button>
                          </div>
                        ) : item.hasDraft ? (
                          <button
                            type="button"
                            className="btn btn-warning btn-sm"
                            onClick={() => {
                              const draft = studentForms.find(sf => sf.id === item.existingFormId);
                              handleOpenFormModal(item, draft);
                            }}
                            style={{ width: '100%', fontWeight: 700 }}
                          >
                            Continue Draft ({item.existingFormNumber})
                          </button>
                        ) : !item.isFillable ? (
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            disabled
                            style={{ width: '100%', opacity: 0.6, cursor: 'not-allowed' }}
                          >
                            {item.timePeriodStatus === 'FORM_NOT_STARTED' ? `Opens on ${item.formStartDate}` : 'Registration Window Closed'}
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => handleOpenFormModal(item)}
                            style={{ width: '100%', fontWeight: 800 }}
                          >
                            Fill Exam Form <ArrowRight size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: My Exam Forms */}
          {studentActiveTab === 'MY_FORMS' && (
            <div className="card" style={{ padding: '1.25rem', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table className="table" style={{ fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-surface-hover)' }}>
                      <th>Form Number</th>
                      <th>Examination</th>
                      <th>Applied Date</th>
                      <th>Total Fee</th>
                      <th>Payment Status</th>
                      <th>Form Status</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentForms.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                          You have not submitted or drafted any examination forms yet.
                        </td>
                      </tr>
                    ) : (
                      studentForms.map(form => {
                        const examObj = exams.find(e => e.id === form.examId);
                        return (
                          <tr key={form.id}>
                            <td>
                              <strong style={{ fontFamily: 'monospace', color: 'var(--brand-orange)' }}>
                                {form.formNumber || form.id}
                              </strong>
                            </td>
                            <td>
                              <strong>{examObj?.name || 'Examination Session'}</strong>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Semester {form.semesterNumber || 4}</div>
                            </td>
                            <td>{form.appliedDate || form.createdAt}</td>
                            <td>₹{(form.totalAmount ?? form.totalFee ?? 0).toLocaleString('en-IN')}</td>
                            <td>
                              <Badge variant={form.paymentStatus === 'PAID' || form.paymentStatus === 'COMPLETED' || form.paymentStatus === 'WAIVED' || form.paymentStatus === 'SUCCESS' ? 'active' : 'warning'}>
                                {form.paymentStatus}
                              </Badge>
                            </td>
                            <td>
                              <Badge variant={form.status === 'VERIFIED' ? 'active' : form.status === 'SUBMITTED' ? 'navy' : form.status === 'RETURNED' ? 'warning' : form.status === 'REJECTED' ? 'danger' : 'inactive'}>
                                {form.status}
                              </Badge>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', gap: '0.35rem', alignItems: 'center', justifyContent: 'flex-end' }}>
                                {form.status === 'DRAFT' && (
                                  <button
                                    type="button"
                                    className="btn btn-warning btn-sm"
                                    onClick={() => {
                                      if (examObj) handleOpenFormModal(examObj, form);
                                    }}
                                    style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                                  >
                                    Continue Draft
                                  </button>
                                )}
                                {form.status === 'RETURNED' && (
                                  <button
                                    type="button"
                                    className="btn btn-warning btn-sm"
                                    onClick={() => {
                                      if (examObj) handleOpenFormModal(examObj, form);
                                    }}
                                    style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                                  >
                                    Edit &amp; Resubmit
                                  </button>
                                )}
                                {form.paymentStatus === 'PENDING' && (form.totalAmount ?? form.totalFee ?? 0) > 0 && form.status !== 'DRAFT' && (
                                  <button
                                    type="button"
                                    className="btn btn-success btn-sm"
                                    onClick={() => handlePayFee(form)}
                                    style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', background: '#059669', color: '#FFF' }}
                                  >
                                    <IndianRupee size={12} /> Pay ₹{(form.totalAmount ?? form.totalFee ?? 0).toLocaleString('en-IN')}
                                  </button>
                                )}
                                <button
                                  type="button"
                                  className="btn btn-ghost btn-sm"
                                  onClick={() => setViewingFormDetails(form)}
                                  style={{ padding: '0.25rem 0.5rem' }}
                                >
                                  <Eye size={15} /> View
                                </button>
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
          )}

          {/* Tab 3: My Hall Tickets */}
          {studentActiveTab === 'MY_HALL_TICKETS' && (
            <div className="card" style={{ padding: '1.25rem', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--brand-navy)', margin: 0 }}>
                  Official Hall Tickets
                </h3>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="table" style={{ fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-surface-hover)' }}>
                      <th>Hall Ticket No</th>
                      <th>Examination</th>
                      <th>Issue Date</th>
                      <th>Centre &amp; Seat</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hallTickets.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                          No Hall Tickets issued yet. Hall Tickets become available after your exam form is Verified by the Examination Section.
                        </td>
                      </tr>
                    ) : (
                      hallTickets.map(ticket => (
                        <tr key={ticket.id}>
                          <td>
                            <strong style={{ fontFamily: 'monospace', color: 'var(--brand-orange)' }}>
                              {ticket.hallTicketNo}
                            </strong>
                          </td>
                          <td><strong>{ticket.examSessionName}</strong></td>
                          <td>{ticket.issueDate}</td>
                          <td>{ticket.centreName || 'SSIU Main Centre'} — {ticket.seatNumber || 'Seat Allocated'}</td>
                          <td>
                            <Badge variant="active">{ticket.status}</Badge>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              onClick={() => setViewingHallTicket(ticket)}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }}
                            >
                              <Printer size={14} /> View &amp; Print
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ─── EXAM CONTROLLER / STAFF VIEW ─── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Dashboard Summary Cards */}
          <div className="grid-4" style={{ gap: '1rem' }}>
            <div className="card" style={{ padding: '1rem', borderLeft: '4px solid var(--brand-navy)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Applications</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--brand-navy)' }}>{summaryMetrics.total}</div>
            </div>
            <div className="card" style={{ padding: '1rem', borderLeft: '4px solid #3B82F6' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Submitted / Under Review</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1E40AF' }}>{summaryMetrics.submitted + summaryMetrics.underReview}</div>
            </div>
            <div className="card" style={{ padding: '1rem', borderLeft: '4px solid #10B981' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Verified &amp; Cleared</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#047857' }}>{summaryMetrics.verified}</div>
            </div>
            <div className="card" style={{ padding: '1rem', borderLeft: '4px solid #F59E0B' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Returned / Pending Fee</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#B45309' }}>{summaryMetrics.returned + summaryMetrics.paymentPending}</div>
            </div>
          </div>

          {/* Navigation Tabs (Staff) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className={`btn btn-sm ${staffActiveTab === 'QUEUE' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setStaffActiveTab('QUEUE')}
                style={{ fontWeight: 700 }}
              >
                Verification Queue ({filteredForms.length})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${staffActiveTab === 'HALL_TICKETS' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setStaffActiveTab('HALL_TICKETS')}
                style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <QrCode size={14} /> Hall Tickets Issued ({hallTickets.length})
              </button>
            </div>

            {staffActiveTab === 'HALL_TICKETS' && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleBulkGenerateHallTickets}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }}
              >
                <Sparkles size={14} /> Bulk Generate Hall Tickets
              </button>
            )}
          </div>

          {staffActiveTab === 'QUEUE' ? (
            <>
              {/* Filter & Search Bar */}
              <div className="card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ flex: 2, minWidth: '220px', position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    className="input"
                    placeholder="Search by Form #, Student Name, Enrollment..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: '2.25rem', width: '100%' }}
                  />
                </div>

                <div style={{ flex: 1, minWidth: '150px' }}>
                  <select className="select" value={filterExam} onChange={e => setFilterExam(e.target.value)} style={{ width: '100%' }}>
                    <option value="ALL">All Examinations</option>
                    {exams.map(e => (
                      <option key={e.id} value={e.id}>{e.code || e.examCode} - {e.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ flex: 1, minWidth: '140px' }}>
                  <select className="select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: '100%' }}>
                    <option value="ALL">All Form Status</option>
                    <option value="SUBMITTED">SUBMITTED</option>
                    <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                    <option value="VERIFIED">VERIFIED</option>
                    <option value="RETURNED">RETURNED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>

                <div style={{ flex: 1, minWidth: '140px' }}>
                  <select className="select" value={filterPaymentStatus} onChange={e => setFilterPaymentStatus(e.target.value)} style={{ width: '100%' }}>
                    <option value="ALL">All Payment Status</option>
                    <option value="PENDING">PENDING</option>
                    <option value="PAID">PAID / SUCCESS</option>
                    <option value="WAIVED">WAIVED</option>
                  </select>
                </div>
              </div>

              {/* Bulk Action Toolbar */}
              {selectedFormIds.length > 0 && (
                <div style={{ padding: '0.75rem 1.25rem', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ fontWeight: 700, color: '#1E40AF', fontSize: '0.875rem' }}>
                    {selectedFormIds.length} examination form(s) selected
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className="btn btn-success btn-sm"
                      onClick={handleBulkVerify}
                      style={{ background: '#059669', color: '#FFF', fontWeight: 700 }}
                    >
                      <CheckCircle size={14} /> Bulk Verify
                    </button>
                    <button
                      type="button"
                      className="btn btn-warning btn-sm"
                      onClick={() => openReasonModal('RETURN', undefined, true)}
                      style={{ fontWeight: 700 }}
                    >
                      <RotateCcw size={14} /> Bulk Return
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => openReasonModal('REJECT', undefined, true)}
                      style={{ fontWeight: 700 }}
                    >
                      <Ban size={14} /> Bulk Reject
                    </button>
                  </div>
                </div>
              )}

              {/* Verification Queue Table */}
              <div className="card" style={{ padding: '1.5rem', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table className="table" style={{ fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-surface-hover)' }}>
                        <th style={{ width: '40px' }}>
                          <input
                            type="checkbox"
                            checked={filteredForms.length > 0 && selectedFormIds.length === filteredForms.length}
                            onChange={e => {
                              if (e.target.checked) setSelectedFormIds(filteredForms.map(f => f.id));
                              else setSelectedFormIds([]);
                            }}
                          />
                        </th>
                        <th>Form Number</th>
                        <th>Student Name &amp; Enrollment</th>
                        <th>Examination</th>
                        <th>Amount</th>
                        <th>Payment</th>
                        <th>Form Status</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredForms.length === 0 ? (
                        <tr>
                          <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                            No examination forms found matching the selected filter criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredForms.map(form => {
                          const examObj = exams.find(e => e.id === form.examId);
                          const isSelected = selectedFormIds.includes(form.id);
                          return (
                            <tr key={form.id} style={{ background: isSelected ? '#F0F9FF' : undefined }}>
                              <td>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={e => {
                                    if (e.target.checked) setSelectedFormIds([...selectedFormIds, form.id]);
                                    else setSelectedFormIds(selectedFormIds.filter(id => id !== form.id));
                                  }}
                                />
                              </td>
                              <td>
                                <strong style={{ fontFamily: 'monospace', color: 'var(--brand-orange)' }}>
                                  {form.formNumber || form.id}
                                </strong>
                              </td>
                              <td>
                                <div><strong>{form.studentName}</strong></div>
                                <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{form.enrollmentNo}</div>
                              </td>
                              <td>{examObj?.name || 'Exam Session'}</td>
                              <td>₹{(form.totalAmount ?? form.totalFee ?? 0).toLocaleString('en-IN')}</td>
                              <td>
                                <Badge variant={form.paymentStatus === 'PAID' || form.paymentStatus === 'COMPLETED' || form.paymentStatus === 'WAIVED' || form.paymentStatus === 'SUCCESS' ? 'active' : 'warning'}>
                                  {form.paymentStatus}
                                </Badge>
                              </td>
                              <td>
                                <Badge variant={form.status === 'VERIFIED' ? 'active' : form.status === 'SUBMITTED' ? 'navy' : form.status === 'UNDER_REVIEW' ? 'warning' : form.status === 'RETURNED' ? 'warning' : form.status === 'REJECTED' ? 'danger' : 'inactive'}>
                                  {form.status}
                                </Badge>
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <div style={{ display: 'inline-flex', gap: '0.35rem', alignItems: 'center' }}>
                                  <button
                                    type="button"
                                    className="btn btn-ghost btn-sm"
                                    title="Review & Verify"
                                    onClick={() => setViewingFormDetails(form)}
                                    style={{ padding: '0.25rem 0.5rem' }}
                                  >
                                    <Eye size={15} /> Review
                                  </button>
                                  {form.status === 'VERIFIED' && (
                                    <button
                                      type="button"
                                      className="btn btn-primary btn-sm"
                                      title="Generate Hall Ticket"
                                      onClick={() => handleGenerateHallTicket(form)}
                                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', fontWeight: 700 }}
                                    >
                                      <QrCode size={12} /> Hall Ticket
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
            </>
          ) : (
            /* Hall Tickets Management Tab */
            <div className="card" style={{ padding: '1.5rem', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table className="table" style={{ fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-surface-hover)' }}>
                      <th>Hall Ticket Number</th>
                      <th>Student</th>
                      <th>Enrollment No</th>
                      <th>Examination</th>
                      <th>Issue Date</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hallTickets.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                          No Hall Tickets generated yet. Click "Bulk Generate Hall Tickets" to issue tickets for verified forms.
                        </td>
                      </tr>
                    ) : (
                      hallTickets.map(ticket => (
                        <tr key={ticket.id}>
                          <td>
                            <strong style={{ fontFamily: 'monospace', color: 'var(--brand-orange)' }}>
                              {ticket.hallTicketNo}
                            </strong>
                          </td>
                          <td><strong>{ticket.student?.name || ticket.studentId}</strong></td>
                          <td><span style={{ fontFamily: 'monospace' }}>{ticket.student?.enrollmentNo || 'EN2024CSE001'}</span></td>
                          <td>{ticket.examSessionName}</td>
                          <td>{ticket.issueDate}</td>
                          <td><Badge variant="active">{ticket.status}</Badge></td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => setViewingHallTicket(ticket)}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                            >
                              <Printer size={14} /> View Hall Ticket
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── EXAM CONTROLLER FORM REVIEW & VERIFICATION MODAL ─── */}
      {viewingFormDetails && (
        <div className="modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ width: '96%', maxWidth: '820px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)', overflow: 'hidden', padding: 0 }}>
            
            {/* Header */}
            <div style={{ padding: '1.25rem 1.5rem', background: 'var(--brand-navy)', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.85 }}>
                  Examination Form Review &amp; Verification
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
                  {viewingFormDetails.formNumber || viewingFormDetails.id}
                </h3>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setViewingFormDetails(null)} style={{ color: '#FFFFFF' }}>
                <XCircle size={20} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.875rem' }}>
              
              {/* Status Header */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <Badge variant={viewingFormDetails.status === 'VERIFIED' ? 'active' : viewingFormDetails.status === 'SUBMITTED' ? 'navy' : viewingFormDetails.status === 'RETURNED' ? 'warning' : 'danger'}>
                    Form Status: {viewingFormDetails.status}
                  </Badge>
                  <Badge variant={viewingFormDetails.paymentStatus === 'PAID' || viewingFormDetails.paymentStatus === 'COMPLETED' || viewingFormDetails.paymentStatus === 'WAIVED' || viewingFormDetails.paymentStatus === 'SUCCESS' ? 'active' : 'warning'}>
                    Fee Clearance: {viewingFormDetails.paymentStatus}
                  </Badge>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Submitted on: {viewingFormDetails.submittedAt || viewingFormDetails.appliedDate || viewingFormDetails.createdAt}
                </span>
              </div>

              {/* Return / Reject Reason Banner if present */}
              {viewingFormDetails.returnReason && (
                <div style={{ padding: '0.85rem 1rem', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 'var(--radius-md)', color: '#92400E' }}>
                  <strong>⚠️ Returned for Correction Reason:</strong> {viewingFormDetails.returnReason}
                  <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Returned by: {viewingFormDetails.returnedBy} ({viewingFormDetails.returnedAt})</div>
                </div>
              )}
              {viewingFormDetails.rejectionReason && (
                <div style={{ padding: '0.85rem 1rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius-md)', color: '#991B1B' }}>
                  <strong>❌ Rejection Reason:</strong> {viewingFormDetails.rejectionReason}
                  <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Rejected by: {viewingFormDetails.rejectedBy} ({viewingFormDetails.rejectedAt})</div>
                </div>
              )}

              {/* Student & Exam Info */}
              <div className="grid-2 card" style={{ padding: '1rem', background: '#F8FAFC' }}>
                <div>
                  <div><strong>Student Name:</strong> {viewingFormDetails.studentName}</div>
                  <div><strong>Enrollment Number:</strong> {viewingFormDetails.enrollmentNo}</div>
                  <div><strong>Semester:</strong> Semester {viewingFormDetails.semesterNumber || 4}</div>
                </div>
                <div>
                  <div><strong>Total Payable Fee:</strong> ₹{(viewingFormDetails.totalAmount ?? viewingFormDetails.totalFee ?? 0).toLocaleString('en-IN')}</div>
                  <div><strong>Late Fee Component:</strong> ₹{(viewingFormDetails.lateFeeAmount ?? viewingFormDetails.lateFee ?? 0).toLocaleString('en-IN')}</div>
                  <div><strong>Payment Txn ID:</strong> {viewingFormDetails.paymentTransactionId || viewingFormDetails.transactionId || 'N/A'}</div>
                </div>
              </div>

              {/* Enrolled Papers */}
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '0.5rem' }}>
                  Enrolled Subjects &amp; Papers ({viewingFormDetails.formSubjects?.length || viewingFormDetails.regularSubjects?.length || 0})
                </h4>
                <div style={{ overflowX: 'auto' }}>
                  <table className="table" style={{ fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-surface-hover)' }}>
                        <th>Subject Code</th>
                        <th>Subject Name</th>
                        <th>Credits</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(viewingFormDetails.formSubjects || []).map((sub, sIdx) => (
                        <tr key={sub.subjectId || sIdx}>
                          <td><strong>{sub.subjectCode || 'SUB'}</strong></td>
                          <td>{sub.subjectName || sub.subjectId}</td>
                          <td>{sub.credits || 3}</td>
                          <td><Badge variant="navy">{sub.status || 'ENROLLED'}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Verification Audit History */}
              {viewingFormDetails.verifiedAt && (
                <div style={{ padding: '0.75rem 1rem', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: '#065F46' }}>
                  ✓ <strong>Verified By:</strong> {viewingFormDetails.verifiedBy} on {viewingFormDetails.verifiedAt}
                  {viewingFormDetails.verificationRemarks && <div>Remarks: {viewingFormDetails.verificationRemarks}</div>}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div style={{ padding: '1rem 1.5rem', background: 'var(--bg-surface-hover)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setViewingFormDetails(null)}
              >
                Close
              </button>

              {isController && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {viewingFormDetails.status === 'SUBMITTED' && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleStartReview(viewingFormDetails)}
                      style={{ fontWeight: 700 }}
                    >
                      Start Review
                    </button>
                  )}
                  {['SUBMITTED', 'UNDER_REVIEW'].includes(viewingFormDetails.status) && (
                    <>
                      <button
                        type="button"
                        className="btn btn-warning btn-sm"
                        onClick={() => openReasonModal('RETURN', viewingFormDetails.id)}
                        style={{ fontWeight: 700 }}
                      >
                        <RotateCcw size={14} /> Return for Correction
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => openReasonModal('REJECT', viewingFormDetails.id)}
                        style={{ fontWeight: 700 }}
                      >
                        <Ban size={14} /> Reject
                      </button>
                      <button
                        type="button"
                        className="btn btn-success btn-sm"
                        onClick={() => handleVerifyForm(viewingFormDetails)}
                        style={{ background: '#059669', color: '#FFF', fontWeight: 800 }}
                      >
                        <CheckCircle size={14} /> Verify &amp; Approve
                      </button>
                    </>
                  )}
                  {viewingFormDetails.status === 'VERIFIED' && (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => handleGenerateHallTicket(viewingFormDetails)}
                      style={{ fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <QrCode size={14} /> Generate Official Hall Ticket
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── RETURN / REJECT REASON MODAL ─── */}
      {reasonModal.isOpen && (
        <div className="modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ width: '90%', maxWidth: '480px', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--brand-navy)', margin: '0 0 0.5rem 0' }}>
              {reasonModal.type === 'RETURN' ? 'Return Examination Form for Student Correction' : 'Reject Examination Form'}
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0 0 1rem 0' }}>
              Please enter a mandatory justification reason which will be visible to the student in their portal.
            </p>

            <div style={{ marginBottom: '1.25rem' }}>
              <label className="label">Mandatory Reason <span style={{ color: 'red' }}>*</span></label>
              <textarea
                className="input"
                rows={3}
                placeholder={reasonModal.type === 'RETURN' ? 'e.g. Backlog course code selected is incorrect for current semester...' : 'e.g. Statutory minimum attendance criteria not met...'}
                value={reasonText}
                onChange={e => setReasonText(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setReasonModal({ isOpen: false, type: 'RETURN' })}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`btn btn-sm ${reasonModal.type === 'RETURN' ? 'btn-warning' : 'btn-danger'}`}
                onClick={handleConfirmReason}
                style={{ fontWeight: 800 }}
              >
                {reasonModal.type === 'RETURN' ? 'Confirm Return' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── PRINTABLE OFFICIAL HALL TICKET MODAL ─── */}
      {viewingHallTicket && (
        <div className="modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ width: '96%', maxWidth: '850px', maxHeight: '92vh', display: 'flex', flexDirection: 'column', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)', overflow: 'hidden', padding: 0 }}>
            
            {/* Modal Controls Header */}
            <div style={{ padding: '1rem 1.5rem', background: 'var(--brand-navy)', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <QrCode size={20} style={{ color: 'var(--brand-orange)' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
                  Official Hall Ticket / Admit Card — {viewingHallTicket.hallTicketNo}
                </h3>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => window.print()}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }}
                >
                  <Printer size={15} /> Print / Save PDF
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setViewingHallTicket(null)} style={{ color: '#FFFFFF' }}>
                  <XCircle size={20} />
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div style={{ padding: '2rem', overflowY: 'auto', background: '#FFFFFF', color: '#0F172A', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* University Header & Logo */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid var(--brand-navy)', paddingBottom: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--brand-navy)', margin: 0 }}>
                    SWARRNIM STARTUP &amp; INNOVATION UNIVERSITY
                  </h2>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    BHUYAN RAJPUT ROAD, GANDHINAGAR - 382420, GUJARAT, INDIA
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--brand-orange)', marginTop: '0.25rem' }}>
                    OFFICIAL EXAMINATION ADMIT CARD / HALL TICKET
                  </div>
                </div>

                {/* QR Code container */}
                <div style={{ textAlign: 'center', border: '1px solid #CBD5E1', padding: '0.5rem', borderRadius: 'var(--radius-md)', background: '#F8FAFC' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>OFFICIAL VERIFICATION</div>
                  <div style={{ width: '70px', height: '70px', background: '#0F172A', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: '0.6rem', fontWeight: 700, textAlign: 'center', padding: '0.25rem' }}>
                    [QR CODE: {viewingHallTicket.verificationCode?.substring(0, 10)}]
                  </div>
                  <div style={{ fontSize: '0.65rem', fontFamily: 'monospace', color: 'var(--brand-orange)', marginTop: '0.25rem' }}>
                    {viewingHallTicket.verificationCode?.substring(0, 12)}
                  </div>
                </div>
              </div>

              {/* Student and Examination Details Grid */}
              <div className="grid-2" style={{ gap: '1rem', background: '#F8FAFC', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div><strong>Student Name:</strong> {viewingHallTicket.student?.name || currentStudent?.name || user?.name}</div>
                  <div><strong>Enrollment Number:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{viewingHallTicket.student?.enrollmentNo || currentStudent?.enrollmentNo || 'EN2024CSE001'}</span></div>
                  <div><strong>Program:</strong> B.Tech Computer Engineering</div>
                  <div><strong>Department:</strong> Department of Computer Engineering</div>
                  <div><strong>Semester:</strong> Semester 4</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div><strong>Examination:</strong> {viewingHallTicket.examSessionName}</div>
                  <div><strong>Hall Ticket No:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--brand-orange)' }}>{viewingHallTicket.hallTicketNo}</span></div>
                  <div><strong>Exam Centre:</strong> {viewingHallTicket.centreName || 'SSIU Main Examination Centre'}</div>
                  <div><strong>Allocated Room:</strong> {viewingHallTicket.roomNumber || 'ROOM-102 (Floor 1)'}</div>
                  <div><strong>Allocated Seat:</strong> <strong style={{ color: 'var(--brand-navy)' }}>{viewingHallTicket.seatNumber || 'S-42'}</strong></div>
                  <div><strong>Issue Date:</strong> {viewingHallTicket.issueDate}</div>
                </div>
              </div>

              {/* Scheduled Papers Table */}
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '0.5rem' }}>
                  Authorized Examination Schedule &amp; Papers
                </h4>
                <table className="table" style={{ fontSize: '0.82rem', width: '100%', border: '1px solid #E2E8F0' }}>
                  <thead>
                    <tr style={{ background: '#F1F5F9' }}>
                      <th>Subject Code</th>
                      <th>Subject Name</th>
                      <th>Exam Date</th>
                      <th>Time Slot</th>
                      <th>Room &amp; Seat</th>
                      <th>Invigilator Sign</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>CE401</strong></td>
                      <td>Data Structures &amp; Algorithms</td>
                      <td>2026-11-02</td>
                      <td>10:00 AM - 01:00 PM</td>
                      <td>ROOM-102 (S-42)</td>
                      <td style={{ borderBottom: '1px dashed #94A3B8' }}></td>
                    </tr>
                    <tr>
                      <td><strong>CE402</strong></td>
                      <td>Database Management Systems</td>
                      <td>2026-11-05</td>
                      <td>10:00 AM - 01:00 PM</td>
                      <td>ROOM-102 (S-42)</td>
                      <td style={{ borderBottom: '1px dashed #94A3B8' }}></td>
                    </tr>
                    <tr>
                      <td><strong>CE403</strong></td>
                      <td>Operating Systems &amp; Virtualization</td>
                      <td>2026-11-09</td>
                      <td>10:00 AM - 01:00 PM</td>
                      <td>ROOM-102 (S-42)</td>
                      <td style={{ borderBottom: '1px dashed #94A3B8' }}></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Instructions & Signatures */}
              <div style={{ borderTop: '1px solid #CBD5E1', paddingTop: '1rem', fontSize: '0.75rem', color: '#475569' }}>
                <strong>Important Candidate Instructions:</strong>
                <ol style={{ paddingLeft: '1.25rem', margin: '0.25rem 0' }}>
                  <li>Candidates must carry this official Admit Card along with their valid University Photo Identity Card.</li>
                  <li>Entry into the examination centre is strictly permitted up to 15 minutes before commencement.</li>
                  <li>Electronic gadgets, mobile phones, and programmable calculators are strictly prohibited.</li>
                </ol>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '1.5rem' }}>
                <div style={{ textAlign: 'center', borderTop: '1px solid #000', width: '180px', paddingTop: '0.25rem', fontSize: '0.75rem' }}>
                  Student Signature
                </div>
                <div style={{ textAlign: 'center', borderTop: '1px solid #000', width: '220px', paddingTop: '0.25rem', fontSize: '0.75rem' }}>
                  <strong>Controller of Examinations</strong>
                  <div>Swarrnim University</div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '1rem 1.5rem', background: 'var(--bg-surface-hover)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setViewingHallTicket(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── STUDENT FILL EXAM FORM MODAL WITH 75% ATTENDANCE LOCK ─── */}
      {selectedExamForForm && (
        <div className="modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ width: '96%', maxWidth: '780px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)', overflow: 'hidden', padding: 0 }}>
            
            {/* Header */}
            <div style={{ padding: '1.25rem 1.5rem', background: 'var(--brand-navy)', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.85 }}>
                  {activeDraftForm ? 'Edit / Complete Draft Exam Form' : 'New Examination Form Enrollment'}
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
                  {selectedExamForForm.name || 'End Semester Examination'} ({selectedExamForForm.code || selectedExamForForm.examCode})
                </h3>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelectedExamForForm(null)} style={{ color: '#FFFFFF' }}>
                <XCircle size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.875rem' }}>
              
              {/* Fee Breakdown Alert */}
              <div style={{ padding: '1rem', background: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated Examination Fee:</div>
                  <strong style={{ fontSize: '1.2rem', color: 'var(--brand-navy)' }}>₹{formFeeSummary.totalPayable.toLocaleString('en-IN')}</strong>
                </div>
                {formFeeSummary.isLate && (
                  <Badge variant="warning">
                    ⚠️ Late Fee Applied (+₹{formFeeSummary.lateFee})
                  </Badge>
                )}
              </div>

              {/* Subject Selection Table with Attendance 75% Rule */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--brand-navy)', margin: 0 }}>
                    Select Course Papers &amp; Verify Mandatory 75% Attendance
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Statutory Rule: Minimum 75% Attendance Required
                  </span>
                </div>

                <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                  <table className="table" style={{ fontSize: '0.82rem', margin: 0 }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-surface-hover)' }}>
                        <th style={{ width: '40px' }}>Select</th>
                        <th>Subject Code</th>
                        <th>Subject Name</th>
                        <th>Attendance %</th>
                        <th>75% Rule Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedExamForForm.subjects && selectedExamForForm.subjects.length > 0
                        ? selectedExamForForm.subjects
                        : db.getSubjects().slice(0, 4)
                      ).map((subj: any) => {
                        const sId = subj.subjectId || subj.id;
                        const sCode = subj.subjectCode || subj.code;
                        const sName = subj.subjectName || subj.name;
                        
                        const elig = attendanceApprovalService.checkSubjectExamEligibility(currentStudent?.id || user?.id || 'stu-1', sId);
                        const isSelected = selectedSubjectIds.includes(sId);

                        return (
                          <tr key={sId} style={{ background: !elig.isEligible ? '#FEF2F2' : undefined }}>
                            <td>
                              <input
                                type="checkbox"
                                checked={isSelected && elig.isEligible}
                                disabled={!elig.isEligible}
                                onChange={e => {
                                  if (e.target.checked) {
                                    setSelectedSubjectIds([...selectedSubjectIds, sId]);
                                  } else {
                                    setSelectedSubjectIds(selectedSubjectIds.filter(id => id !== sId));
                                  }
                                }}
                              />
                            </td>
                            <td><code>{sCode}</code></td>
                            <td style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>{sName}</td>
                            <td>
                              <span style={{ fontWeight: 800, color: elig.percentage >= 75 ? '#10B981' : '#EF4444' }}>
                                {elig.percentage}%
                              </span>
                            </td>
                            <td>
                              {elig.isEligible ? (
                                <Badge variant={elig.status === 'CONDONED_APPROVAL' ? 'navy' : 'active'}>
                                  {elig.status === 'CONDONED_APPROVAL' ? '✓ Eligible Through Approval' : '✓ 75% Cleared'}
                                </Badge>
                              ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    <Badge variant="danger">Blocked (&lt; 75%)</Badge>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#EF4444' }}>
                                      Attendance requirement not fulfilled ({elig.percentage}% &lt; {elig.requiredPercentage}%)
                                    </span>
                                  </div>
                                  {elig.applicationId ? (
                                    <span style={{ fontSize: '0.75rem', color: '#D97706', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                      ⏳ Application in Review: {elig.applicationStatus}
                                    </span>
                                  ) : (
                                    <span style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 700 }}>
                                      Submit Attendance Exemption application in Academic &rarr; Attendance Approval
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Remarks */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>Student Remarks (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Applying for regular examination semester 4..."
                  value={formRemarks}
                  onChange={e => setFormRemarks(e.target.value)}
                />
              </div>

              {/* Declaration */}
              <div style={{ padding: '0.75rem', background: '#F8FAFC', borderRadius: 'var(--radius-sm)', border: '1px solid #E2E8F0' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8125rem' }}>
                  <input
                    type="checkbox"
                    checked={declarationAccepted}
                    onChange={e => setDeclarationAccepted(e.target.checked)}
                    style={{ marginTop: '0.2rem' }}
                  />
                  <span>
                    I hereby declare that all courses selected meet university attendance criteria or have approved condonations, and information submitted is true.
                  </span>
                </label>
              </div>
            </div>

            {/* Footer Buttons */}
            <div style={{ padding: '1rem 1.5rem', background: 'var(--bg-surface-hover)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedExamForForm(null)}
              >
                Cancel
              </button>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleSaveDraft}
                >
                  <Save size={14} /> Save Draft
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  disabled={!declarationAccepted || selectedSubjectIds.length === 0}
                  onClick={handleFinalSubmit}
                  style={{ fontWeight: 800 }}
                >
                  <Send size={14} /> Submit Examination Form
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

