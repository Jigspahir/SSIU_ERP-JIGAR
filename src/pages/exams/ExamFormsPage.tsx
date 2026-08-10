import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { Exam, ExamForm, Student, Subject, ExamFormDocument, ExamFormStatus } from '../../types';
import { Badge } from '../../components/common/Badge';
import { 
  FileCheck, Search, CheckCircle, XCircle, Download, Upload, Eye, 
  CreditCard, ShieldCheck, Ticket, AlertCircle, Clock, BookOpen, UserCheck, ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fileStorage } from '../../services/fileStorage';

export const ExamFormsPage: React.FC = () => {
  const { user, role } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [forms, setForms] = useState<ExamForm[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Student Selection State
  const [selectedRegularSubjects, setSelectedRegularSubjects] = useState<string[]>([]);
  const [selectedRemedialSubjects, setSelectedRemedialSubjects] = useState<string[]>([]);
  const [uploadedDocs, setUploadedDocs] = useState<ExamFormDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [paymentMode, setPaymentMode] = useState<string>('ONLINE_UPI');
  
  // Admin Review Modal State
  const [reviewingForm, setReviewingForm] = useState<ExamForm | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allExams = db.getExams();
    const allForms = db.getExamForms();
    setStudents(db.getStudents());
    setSubjects(db.getSubjects());
    
    if (role === 'STUDENT') {
      const student = db.getStudents().find(s => s.id === user?.id || s.email === user?.email);
      if (student) {
        const studentExams = allExams.filter(e => e.semesterId === student.semesterId && e.programId === student.programId);
        setExams(studentExams);
        setForms(allForms.filter(f => f.studentId === student.id));
        if (studentExams.length > 0) setSelectedExamId(studentExams[0].id);
      }
    } else {
      setExams(allExams);
      setForms(allForms);
      if (allExams.length > 0) setSelectedExamId(allExams[0].id);
    }
  };

  const currentExam = exams.find(e => e.id === selectedExamId);
  const currentStudent = students.find(s => s.id === user?.id || s.email === user?.email);

  // Calculate Attendance Percentage for Student
  const calculateAttendance = (): number => {
    if (!currentStudent) return 82;
    const attStats = db.getStudentAttendanceStats(currentStudent.id);
    return attStats.percentage || 85;
  };

  const attendancePct = calculateAttendance();
  const isEligible = attendancePct >= (currentExam?.minAttendancePercentage || 75);
  const availableSubjects = subjects.filter(s => s.semesterId === currentExam?.semesterId && s.programId === currentExam?.programId);

  useEffect(() => {
    if (currentExam) {
      const regularIds = availableSubjects.map(s => s.id);
      setSelectedRegularSubjects(regularIds);
    }
  }, [selectedExamId]);

  // Calculate Fee Components
  const baseFee = currentExam?.baseFee ?? 300;
  const perSubFee = currentExam?.perSubjectFee ?? 100;
  const totalSubjectCount = selectedRegularSubjects.length + selectedRemedialSubjects.length;
  const subjectFeeTotal = totalSubjectCount * perSubFee;

  const isLate = currentExam?.formDeadline ? new Date() > new Date(currentExam.formDeadline) : false;
  const lateFeeAmount = isLate ? (currentExam?.lateFee ?? 200) : 0;
  const grandTotalFee = baseFee + subjectFeeTotal + lateFeeAmount;

  // Handle Document File Upload
  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>, docName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileUrl = await fileStorage.saveFile(file);
      const newDoc: ExamFormDocument = {
        id: `doc-${Date.now()}`,
        name: docName,
        fileUrl,
        status: 'PENDING'
      };
      setUploadedDocs(prev => [...prev.filter(d => d.name !== docName), newDoc]);
    } catch (err) {
      alert('Failed to upload document.');
    } finally {
      setIsUploading(false);
    }
  };

  // Submit Form by Student
  const handleStudentSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent || !currentExam) return;

    const txnId = `TXN-EXAM-${Date.now().toString().slice(-6)}`;

    const newForm: Omit<ExamForm, 'id'> = {
      examId: currentExam.id,
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      enrollmentNo: currentStudent.enrollmentNo,
      programId: currentStudent.programId,
      semesterId: currentStudent.semesterId,
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'VERIFICATION_PENDING',
      paymentStatus: 'PAID',
      regularSubjects: selectedRegularSubjects,
      remedialSubjects: selectedRemedialSubjects,
      baseFee,
      subjectFee: subjectFeeTotal,
      lateFee: lateFeeAmount,
      totalFee: grandTotalFee,
      documents: uploadedDocs,
      paymentMode,
      transactionId: txnId,
      paidAt: new Date().toISOString().split('T')[0],
      isEligible,
      attendancePercentage: attendancePct
    };

    db.addEntity('examForms', newForm as any, `Student ${currentStudent.name} submitted Exam Form for ${currentExam.name}`);
    loadData();
  };

  // Admin Verification Handlers
  const handleAdminVerifyDoc = (formId: string, docId: string, status: 'VERIFIED' | 'REJECTED') => {
    const form = forms.find(f => f.id === formId);
    if (!form) return;

    const updatedDocs = (form.documents || []).map(d => d.id === docId ? { ...d, status } : d);
    db.updateEntity<ExamForm>('examForms', formId, { documents: updatedDocs });
    setReviewingForm(prev => prev ? { ...prev, documents: updatedDocs } : null);
    loadData();
  };

  const handleAdminApproveForm = (formId: string) => {
    db.updateEntity<ExamForm>('examForms', formId, { status: 'APPROVED' }, 'Approved Exam Form');
    setReviewingForm(null);
    loadData();
  };

  const handleAdminRejectForm = (formId: string) => {
    if (!rejectionReason) {
      alert('Please enter a rejection reason.');
      return;
    }
    db.updateEntity<ExamForm>('examForms', formId, { status: 'REJECTED', rejectionReason }, 'Rejected Exam Form');
    setReviewingForm(null);
    setRejectionReason('');
    loadData();
  };

  const handleAdminIssueHallTicket = (formId: string) => {
    const hallTicketNo = `HT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    db.updateEntity<ExamForm>('examForms', formId, { 
      status: 'HALL_TICKET_ISSUED',
      hallTicketNo
    }, `Issued Hall Ticket ${hallTicketNo}`);
    setReviewingForm(null);
    loadData();
  };

  // Download File Receipts
  const handleDownloadFormReceipt = (form: ExamForm) => {
    const exam = db.getExams().find(e => e.id === form.examId);
    const content = `===================================================================
SWARRNIM UNIVERSITY - SUBMITTED EXAM FORM ACKNOWLEDGEMENT
===================================================================
Form ID       : ${form.id}
Exam Name     : ${exam?.name || 'Semester Examination'}
Applied Date  : ${form.appliedDate}
Student Name  : ${form.studentName}
Enrollment No : ${form.enrollmentNo}
Form Status   : ${form.status}
Payment Status: ${form.paymentStatus} (Txn: ${form.transactionId || 'N/A'})
-------------------------------------------------------------------
FEE BREAKDOWN:
-------------------------------------------------------------------
Base Exam Fee        : Rs. ${form.baseFee || 300}
Subject Fees (${form.regularSubjects.length} subs) : Rs. ${form.subjectFee}
Late Fee Penalty     : Rs. ${form.lateFee || 0}
TOTAL FEE PAID       : Rs. ${form.totalFee}
===================================================================
Control of Examinations, Swarrnim University
===================================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ExamForm_${form.enrollmentNo}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadHallTicket = (form: ExamForm) => {
    const exam = db.getExams().find(e => e.id === form.examId);
    const timetables = db.getExamTimetables().filter(t => t.examId === form.examId);

    let scheduleText = '';
    timetables.forEach(t => {
      const subj = db.getSubjects().find(s => s.id === t.subjectId);
      scheduleText += `${subj?.code?.padEnd(10)} | ${subj?.name?.padEnd(30)} | Date: ${t.date} | Time: ${t.startTime}-${t.endTime} | Room: ${t.roomNo}\n`;
    });

    const content = `===================================================================================
                          SWARRNIM UNIVERSITY
                 OFFICIAL EXAMINATION HALL TICKET / ADMIT CARD
===================================================================================
Hall Ticket No : ${form.hallTicketNo || 'HT-2024-9999'}
Exam Name      : ${exam?.name || 'End Semester Examination'}
Student Name   : ${form.studentName}
Enrollment No  : ${form.enrollmentNo}
Program        : ${db.getPrograms().find(p => p.id === form.programId)?.name || 'B.Tech'}
Semester       : ${db.getSemesters().find(s => s.id === form.semesterId)?.code || 'Sem-4'}
Exam Center    : Swarrnim University Main Campus, Gandhinagar
-----------------------------------------------------------------------------------
EXAMINATION TIMETABLE & SEAT ALLOCATION:
-----------------------------------------------------------------------------------
Subject Code | Subject Name                   | Date & Time                 | Room
-----------------------------------------------------------------------------------
${scheduleText || 'Schedule to be announced at exam hall.\n'}
-----------------------------------------------------------------------------------
IMPORTANT INSTRUCTIONS FOR CANDIDATE:
1. Carry this official Hall Ticket and Student Photo ID Card to every exam session.
2. Electronic gadgets, mobile phones, and smart watches are strictly prohibited.
3. Candidates must reach the examination hall 20 minutes prior to start time.
===================================================================================
                                                  [Controller of Examinations]
===================================================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HallTicket_${form.enrollmentNo}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  let displayedForms = forms.filter(f => f.examId === selectedExamId);
  if (searchTerm) {
    displayedForms = displayedForms.filter(f => 
      f.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      f.enrollmentNo.includes(searchTerm)
    );
  }

  const getStatusBadge = (status: ExamFormStatus) => {
    switch (status) {
      case 'DRAFT': return <Badge variant="inactive">DRAFT</Badge>;
      case 'SUBMITTED': return <Badge variant="navy">SUBMITTED</Badge>;
      case 'PAID': return <Badge variant="active">PAID</Badge>;
      case 'VERIFICATION_PENDING': return <Badge variant="orange">DOC VERIFICATION</Badge>;
      case 'APPROVED': return <Badge variant="active">APPROVED</Badge>;
      case 'HALL_TICKET_ISSUED': return <Badge variant="gold">HALL TICKET ISSUED</Badge>;
      case 'REJECTED': return <Badge variant="inactive">REJECTED</Badge>;
      default: return <Badge variant="inactive">{status}</Badge>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
          Examination Registration &amp; Form Application Portal
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          {role === 'STUDENT'
            ? 'Complete your examination registration, select eligible subjects, upload documents, and submit fees'
            : 'Review, verify student application documents, approve forms, and generate official hall tickets'}
        </p>
      </div>

      {/* Select Exam Filter */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <label className="form-label" style={{ marginBottom: 0 }}>Select Exam Event:</label>
            <select className="form-select" style={{ maxWidth: '380px' }} value={selectedExamId} onChange={e => setSelectedExamId(e.target.value)}>
              {exams.length === 0 ? <option value="">No active exams available</option> : null}
              {exams.map(exam => (
                <option key={exam.id} value={exam.id}>{exam.name}</option>
              ))}
            </select>
          </div>

          {(role === 'SUPER_ADMIN' || role === 'UNIVERSITY_ADMIN') && (
            <div style={{ position: 'relative', width: '260px' }}>
              <input 
                type="text" 
                placeholder="Search Candidate / Enrollment..." 
                className="form-input"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      {/* STUDENT EXAMINATION FORM APPLICATION SECTIONS */}
      {role === 'STUDENT' && currentExam && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* SECTION 1: ELIGIBILITY CHECK */}
          <div className="card" style={{ padding: '1.5rem', borderLeft: `5px solid ${isEligible ? '#10B981' : '#EF4444'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{ padding: '0.65rem', borderRadius: 'var(--radius-sm)', background: isEligible ? '#ECFDF5' : '#FEF2F2', color: isEligible ? '#10B981' : '#EF4444' }}>
                  {isEligible ? <UserCheck size={26} /> : <AlertCircle size={26} />}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                    SECTION 1: ATTENDANCE ELIGIBILITY CHECK
                  </h3>
                  <div style={{ fontSize: '0.84375rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    Calculated Student Attendance: <strong style={{ color: isEligible ? '#10B981' : '#EF4444' }}>{attendancePct}%</strong> (Minimum Required: {currentExam.minAttendancePercentage || 75}%)
                  </div>
                </div>
              </div>
              <Badge variant={isEligible ? 'active' : 'inactive'}>
                {isEligible ? 'ELIGIBLE TO REGISTER' : 'INELIGIBLE - SHORT ATTENDANCE'}
              </Badge>
            </div>
          </div>

          {/* SECTION 2: EXAM DETAILS */}
          <div className="card" style={{ padding: '1.5rem', borderTop: '4px solid var(--brand-navy)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1rem' }}>
              SECTION 2: EXAMINATION SPECIFICATION DETAILS
            </h3>

            <div className="grid-3" style={{ fontSize: '0.875rem' }}>
              <div><span style={{ color: 'var(--text-muted)' }}>Exam Event Name:</span> <div style={{ fontWeight: 800 }}>{currentExam.name}</div></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Exam Type:</span> <div style={{ fontWeight: 800, color: 'var(--brand-orange)' }}>{currentExam.type}</div></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Examination Window:</span> <div style={{ fontWeight: 800 }}>{currentExam.startDate} to {currentExam.endDate}</div></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Regular Form Deadline:</span> <div style={{ fontWeight: 800 }}>{currentExam.formDeadline || '2026-12-31'}</div></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Late Fee Penalty:</span> <div style={{ fontWeight: 800, color: 'var(--color-danger)' }}>₹{currentExam.lateFee || 200}</div></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Per Subject Charge:</span> <div style={{ fontWeight: 800 }}>₹{currentExam.perSubjectFee || 100} / course</div></div>
            </div>
          </div>

          {/* IF FORM ALREADY SUBMITTED: SHOW APPLICATION STATUS & DOWNLOADS */}
          {(() => {
            const myForm = forms.find(f => f.examId === currentExam.id);

            if (myForm) {
              return (
                <div className="card" style={{ padding: '1.75rem', borderLeft: '6px solid var(--brand-orange)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                        SECTION 7: SUBMITTED APPLICATION STATUS &amp; DOWNLOADS
                      </h3>
                      <div style={{ fontSize: '0.84375rem', color: 'var(--text-muted)' }}>Form Reference ID: {myForm.id} • Submitted on {myForm.appliedDate}</div>
                    </div>
                    {getStatusBadge(myForm.status)}
                  </div>

                  <div className="grid-3" style={{ background: 'var(--bg-surface-hover)', padding: '1.15rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem' }}>
                    <div><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Selected Subjects:</span> <div style={{ fontWeight: 800 }}>{myForm.regularSubjects.length} Courses</div></div>
                    <div><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Amount Paid:</span> <div style={{ fontWeight: 800, color: '#10B981' }}>₹{myForm.totalFee}</div></div>
                    <div><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Txn Reference:</span> <div style={{ fontWeight: 800, color: 'var(--brand-navy)' }}>{myForm.transactionId || 'N/A'}</div></div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button className="btn btn-secondary" onClick={() => handleDownloadFormReceipt(myForm)}>
                      <Download size={16} /> Download Form Submission Receipt
                    </button>

                    {myForm.status === 'HALL_TICKET_ISSUED' && (
                      <button className="btn btn-primary" onClick={() => handleDownloadHallTicket(myForm)}>
                        <Ticket size={16} /> Download Admit Card / Hall Ticket
                      </button>
                    )}
                  </div>
                </div>
              );
            }

            if (!isEligible) {
              return (
                <div className="card" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--color-danger)' }}>
                  <AlertCircle size={40} style={{ margin: '0 auto 0.75rem' }} />
                  <h4 style={{ fontSize: '1.125rem', fontWeight: 800 }}>Ineligible for Exam Registration</h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    You do not meet the minimum required attendance threshold of {currentExam.minAttendancePercentage || 75}%. Please contact your HOD.
                  </p>
                </div>
              );
            }

            {/* FORM FILLING WIZARD */}
            return (
              <form onSubmit={handleStudentSubmitForm} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* SECTION 3: SUBJECT SELECTION */}
                <div className="card" style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1rem' }}>
                    SECTION 3: ELIGIBLE COURSE &amp; SUBJECT SELECTION
                  </h3>

                  <div className="grid-2">
                    {availableSubjects.map(sub => (
                      <label key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-surface-hover)', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={selectedRegularSubjects.includes(sub.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedRegularSubjects([...selectedRegularSubjects, sub.id]);
                            else setSelectedRegularSubjects(selectedRegularSubjects.filter(id => id !== sub.id));
                          }}
                        />
                        <div>
                          <div style={{ fontWeight: 800, color: 'var(--brand-navy)' }}>{sub.code} - {sub.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--brand-orange)', fontWeight: 600 }}>Regular Subject • Fee: ₹{perSubFee}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* SECTION 4: DOCUMENTS UPLOAD */}
                <div className="card" style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1rem' }}>
                    SECTION 4: DOCUMENT UPLOADS &amp; IDENTIFICATION
                  </h3>

                  <div className="grid-2">
                    <div style={{ padding: '1.15rem', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                      <label className="form-label">Government ID Proof (Aadhaar / Passport) *</label>
                      <input type="file" required onChange={(e) => handleDocUpload(e, 'Government ID Proof')} className="form-input" accept=".pdf,.png,.jpg,.jpeg" />
                    </div>
                    <div style={{ padding: '1.15rem', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                      <label className="form-label">Previous Semester Marksheet / Transcript *</label>
                      <input type="file" required onChange={(e) => handleDocUpload(e, 'Previous Marksheet')} className="form-input" accept=".pdf,.png,.jpg,.jpeg" />
                    </div>
                  </div>
                </div>

                {/* SECTION 5 & 6: FEES & ONLINE PAYMENT */}
                <div className="grid-2">
                  <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--brand-orange)' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1rem' }}>
                      SECTION 5: EXAM FEES SUMMARY
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.4rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Base Exam Form Fee:</span>
                        <strong>₹{baseFee}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.4rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Subject Fees ({totalSubjectCount} subjects):</span>
                        <strong>₹{subjectFeeTotal}</strong>
                      </div>
                      {lateFeeAmount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.4rem', color: 'var(--color-danger)' }}>
                          <span>Late Form Penalty:</span>
                          <strong>₹{lateFeeAmount}</strong>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 900, color: 'var(--brand-navy)', paddingTop: '0.4rem' }}>
                        <span>Total Payable:</span>
                        <span style={{ color: 'var(--brand-orange)' }}>₹{grandTotalFee}</span>
                      </div>
                    </div>
                  </div>

                  <div className="card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1rem' }}>
                      SECTION 6: ONLINE PAYMENT GATEWAY
                    </h3>

                    <div className="form-group">
                      <label className="form-label">Payment Mode *</label>
                      <select className="form-select" value={paymentMode} onChange={e => setPaymentMode(e.target.value)}>
                        <option value="ONLINE_UPI">Google Pay / PhonePe / Paytm UPI</option>
                        <option value="CREDIT_DEBIT_CARD">Credit / Debit Card</option>
                        <option value="NET_BANKING">Net Banking</option>
                      </select>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={isUploading || selectedRegularSubjects.length === 0}>
                      <CreditCard size={16} /> Pay ₹{grandTotalFee} &amp; Submit Registration Form
                    </button>
                  </div>
                </div>
              </form>
            );
          })()}
        </div>
      )}

      {/* ADMIN EXAMINATION APPLICATIONS DIRECTORY */}
      {(role === 'SUPER_ADMIN' || role === 'UNIVERSITY_ADMIN') && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1.25rem' }}>
            Submitted Exam Applications Directory ({currentExam?.name})
          </h3>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Student Info</th>
                  <th>Applied Date</th>
                  <th>Attendance %</th>
                  <th>Fee Paid</th>
                  <th>Form Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {displayedForms.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No form applications found for this exam event.</td></tr>
                ) : (
                  displayedForms.map(form => (
                    <tr key={form.id}>
                      <td>
                        <div style={{ fontWeight: 800, color: 'var(--brand-navy)' }}>{form.studentName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{form.enrollmentNo}</div>
                      </td>
                      <td>{form.appliedDate}</td>
                      <td>
                        <span style={{ fontWeight: 700, color: (form.attendancePercentage ?? 80) >= 75 ? '#10B981' : '#EF4444' }}>
                          {form.attendancePercentage ?? 80}%
                        </span>
                      </td>
                      <td style={{ fontWeight: 800, color: '#10B981' }}>₹{form.totalFee}</td>
                      <td>{getStatusBadge(form.status)}</td>
                      <td>
                        <button onClick={() => setReviewingForm(form)} className="btn btn-secondary btn-sm">
                          <Eye size={14} /> Review &amp; Verify
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

      {/* ADMIN REVIEW & VERIFICATION MODAL */}
      {reviewingForm && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '620px', padding: '1.75rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1rem' }}>
              Review Exam Form: {reviewingForm.studentName}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="grid-2" style={{ background: 'var(--bg-surface-hover)', padding: '1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8125rem' }}>
                <div><span style={{ color: 'var(--text-muted)' }}>Enrollment No:</span> <strong>{reviewingForm.enrollmentNo}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Attendance:</span> <strong>{reviewingForm.attendancePercentage ?? 80}%</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Fee Paid:</span> <strong style={{ color: '#10B981' }}>₹{reviewingForm.totalFee}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Txn Ref:</span> <strong>{reviewingForm.transactionId || 'N/A'}</strong></div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '0.5rem' }}>Uploaded Verification Documents</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {(!reviewingForm.documents || reviewingForm.documents.length === 0) ? (
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>No documents uploaded.</div>
                  ) : (
                    reviewingForm.documents.map(doc => (
                      <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', borderBottom: '1px solid var(--border-light)' }}>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{doc.name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button type="button" className="btn btn-secondary btn-sm" onClick={() => fileStorage.viewFile(doc.fileUrl)}>
                            <Eye size={12} /> View
                          </button>
                          <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleAdminVerifyDoc(reviewingForm.id, doc.id, 'VERIFIED')}>
                            <CheckCircle size={14} /> Verify
                          </button>
                          <button type="button" className="btn btn-danger btn-sm" onClick={() => handleAdminVerifyDoc(reviewingForm.id, doc.id, 'REJECTED')}>
                            <XCircle size={14} /> Reject
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleDownloadFormReceipt(reviewingForm)}>
                    <Download size={14} /> Form Receipt
                  </button>
                  {reviewingForm.hallTicketNo && (
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleDownloadHallTicket(reviewingForm)}>
                      <Ticket size={14} /> Hall Ticket
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setReviewingForm(null)}>Close</button>
                  {reviewingForm.status !== 'APPROVED' && reviewingForm.status !== 'HALL_TICKET_ISSUED' && (
                    <button type="button" className="btn btn-primary" onClick={() => handleAdminApproveForm(reviewingForm.id)}>
                      Approve Form
                    </button>
                  )}
                  {(reviewingForm.status === 'APPROVED' || reviewingForm.status === 'VERIFICATION_PENDING') && (
                    <button type="button" className="btn btn-gold" onClick={() => handleAdminIssueHallTicket(reviewingForm.id)}>
                      <Ticket size={14} /> Issue Hall Ticket
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
