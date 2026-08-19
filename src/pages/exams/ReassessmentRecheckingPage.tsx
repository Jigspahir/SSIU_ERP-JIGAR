import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Badge } from '../../components/common/Badge';
import { ReassessmentApplication, ReassessmentType, StudentMarks } from '../../types';
import {
  Shield, CheckCircle, XCircle, CreditCard, BookOpen,
  ChevronRight, AlertTriangle, Clock, ArrowRight, Info,
  RefreshCw
} from 'lucide-react';

export const ReassessmentRecheckingPage: React.FC = () => {
  const { user, role } = useAuth();
  const students = db.getStudents();
  const exams = db.getExams();
  const subjects = db.getSubjects();

  const isStudent = role === 'STUDENT';
  const currentStudent = useMemo(() =>
    isStudent ? students.find(s => s.id === user?.id || s.email === user?.email) : null,
    [students, user, isStudent]
  );

  const [activeType, setActiveType] = useState<ReassessmentType>('REASSESSMENT');
  const [applyModal, setApplyModal] = useState<{ mark: StudentMarks; subject: any; exam: any } | null>(null);
  const [step, setStep] = useState<'APPLY' | 'PAYMENT'>('APPLY');
  const [paymentMode, setPaymentMode] = useState('ONLINE_UPI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [pendingApp, setPendingApp] = useState<ReassessmentApplication | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4500);
  };

  const studentMarksList = useMemo(() =>
    currentStudent
      ? db.getStudentMarks().filter(m => m.studentId === currentStudent.id)
      : [],
    [currentStudent]
  );

  // Eligible marks from exams
  const eligibleMarks = useMemo(() => {
    return studentMarksList.filter(m => {
      if (!m.examId) return true;
      const exam = exams.find(e => e.id === m.examId);
      return !exam || exam.status === 'RESULT_PUBLISHED' || exam.status === 'RESULTS_PUBLISHED' || exam.status === 'COMPLETED' || exam.status === 'ONGOING';
    });
  }, [studentMarksList, exams]);

  const myApplications = useMemo(() =>
    currentStudent ? db.getReassessmentApplications(currentStudent.id).filter(a => a.type === activeType) : [],
    [currentStudent, activeType]
  );

  const getAppForMark = (examId: string, subjectId: string) =>
    myApplications.find(a => (a.examId === examId || !examId) && a.subjectId === subjectId);

  const handleApply = () => {
    if (!applyModal || !currentStudent) return;
    const { mark, exam } = applyModal;
    const fee = activeType === 'REASSESSMENT' ? 200 : 150;
    const res = db.applyReassessment(currentStudent.id, exam?.id || mark.examId || '', mark.subjectId, activeType, { fee });
    if (res.success && res.application) {
      setPendingApp(res.application);
      setStep('PAYMENT');
    } else {
      showToast('error', res.error || 'Failed to apply.');
      setApplyModal(null);
    }
  };

  const handlePayment = () => {
    if (!pendingApp) return;
    setIsProcessing(true);
    setTimeout(() => {
      const res = db.payReassessmentFee(pendingApp.id, paymentMode);
      if (res.success) {
        showToast('success', `Application submitted! Txn: ${res.application?.transactionId}`);
        setPendingApp(null);
        setApplyModal(null);
        setStep('APPLY');
      } else {
        showToast('error', res.error || 'Payment failed.');
      }
      setIsProcessing(false);
    }, 1200);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUBMITTED': return <Badge variant="navy">Submitted</Badge>;
      case 'PAYMENT_PENDING': return <Badge variant="warning">Payment Pending</Badge>;
      case 'PAID': return <Badge variant="success">Paid</Badge>;
      case 'PROCESSING': return <Badge variant="warning">Processing</Badge>;
      case 'COMPLETED': return <Badge variant="success">Completed</Badge>;
      case 'REJECTED': return <Badge variant="danger">Rejected</Badge>;
      default: return <Badge variant="navy">{status}</Badge>;
    }
  };

  const feeForType = activeType === 'REASSESSMENT' ? 200 : 150;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {toast && (
        <div style={{ position: 'fixed', top: '1.25rem', right: '1.25rem', zIndex: 9999, padding: '0.85rem 1.25rem',
          background: toast.type === 'success' ? '#D1FAE5' : '#FEE2E2',
          border: `1px solid ${toast.type === 'success' ? '#6EE7B7' : '#FECACA'}`,
          borderRadius: 'var(--radius-md)', color: toast.type === 'success' ? '#065F46' : '#991B1B',
          fontWeight: 600, fontSize: '0.875rem', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-navy)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <Shield size={28} color="var(--brand-orange)" /> Reassessment / Rechecking
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Apply for reassessment (re-evaluation) or rechecking (script verification) of your marks.
          </p>
        </div>

        {/* Type Toggle */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-card-alt)', padding: '0.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
          {([
            { value: 'REASSESSMENT', label: '📋 Reassessment', fee: 200 },
            { value: 'RECHECKING', label: '🔍 Rechecking', fee: 150 }
          ] as const).map(opt => (
            <button
              key={opt.value}
              onClick={() => setActiveType(opt.value)}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: '0.8rem',
                background: activeType === opt.value ? 'var(--brand-orange)' : 'transparent',
                color: activeType === opt.value ? '#fff' : 'var(--text-muted)',
                transition: 'all var(--transition-fast)'
              }}
            >
              {opt.label} (₹{opt.fee}/subject)
            </button>
          ))}
        </div>
      </div>

      {/* Info Banner */}
      <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 'var(--radius-lg)', padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <Info size={18} color="#6366F1" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
        <div style={{ fontSize: '0.82rem', color: '#4338CA' }}>
          {activeType === 'REASSESSMENT' ? (
            <><strong>Reassessment</strong>: Your answer script will be re-evaluated by a different examiner. Marks may increase, remain the same, or decrease based on evaluation.</>
          ) : (
            <><strong>Rechecking</strong>: Only totaling errors and un-evaluated answers will be checked. No re-evaluation of answers is done.</>
          )}
        </div>
      </div>

      {/* Flow Reference */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
        {['Select Subject', 'Apply', 'Fee Calculation', 'Payment', 'Application Submitted', 'Exam Section Processing', 'Result / Status Updated'].map((s, i, arr) => (
          <React.Fragment key={s}>
            <span style={{ padding: '0.25rem 0.6rem', background: 'var(--bg-card-alt)', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-light)' }}>{s}</span>
            {i < arr.length - 1 && <ChevronRight size={14} />}
          </React.Fragment>
        ))}
      </div>

      {/* Eligible Results Table */}
      <div>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '0.875rem' }}>
          Eligible Subjects for {activeType === 'REASSESSMENT' ? 'Reassessment' : 'Rechecking'}
        </h3>

        {eligibleMarks.length === 0 ? (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '2.5rem', textAlign: 'center' }}>
            <RefreshCw size={40} color="var(--text-muted)" style={{ display: 'block', margin: '0 auto 0.75rem' }} />
            <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-muted)' }}>No marks records found</p>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Reassessment is only available after evaluation marks are officially declared.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-card-alt)' }}>
                  {['Subject', 'Exam', 'Marks', 'Grade/Status', 'Fee', 'Status', 'Action'].map(h => (
                    <th key={h} style={{ padding: '0.6rem 0.875rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.4px', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {eligibleMarks.map((mark, idx) => {
                  const exam = exams.find(e => e.id === mark.examId);
                  const subject = mark.subjectId ? subjects.find(s => s.id === mark.subjectId) : null;
                  const existingApp = getAppForMark(mark.examId || '', mark.subjectId);
                  const maxMarks = mark.maxMarks ?? ((mark.maxInternalMarks || 0) + (mark.maxExternalMarks || 0) || 100);
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)', background: idx % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-main)' }}>
                      <td style={{ padding: '0.7rem 0.875rem' }}>
                        <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)' }}>{subject?.name || mark.subjectName || mark.subjectId}</p>
                        <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)' }}>{subject?.code || mark.subjectCode || ''}</p>
                      </td>
                      <td style={{ padding: '0.7rem 0.875rem', color: 'var(--text-secondary)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>{exam?.name || 'Semester Exam'}</td>
                      <td style={{ padding: '0.7rem 0.875rem', fontWeight: 700, color: 'var(--brand-navy)' }}>
                        {mark.totalMarks !== undefined ? `${mark.totalMarks}` : '—'}/{maxMarks}
                      </td>
                      <td style={{ padding: '0.7rem 0.875rem' }}>
                        <Badge variant={mark.isPass ? 'success' : 'danger'}>
                          {mark.grade || (mark.isPass ? 'PASS' : 'FAIL')}
                        </Badge>
                      </td>
                      <td style={{ padding: '0.7rem 0.875rem', fontWeight: 700, color: 'var(--brand-orange)' }}>₹{feeForType}</td>
                      <td style={{ padding: '0.7rem 0.875rem' }}>
                        {existingApp ? getStatusBadge(existingApp.status) : <Badge variant="navy">Not Applied</Badge>}
                      </td>
                      <td style={{ padding: '0.7rem 0.875rem' }}>
                        {!existingApp ? (
                          <button
                            onClick={() => {
                              setApplyModal({ mark, subject, exam });
                              setStep('APPLY');
                            }}
                            className="btn btn-primary"
                            style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                          >
                            <Shield size={13} /> Apply
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Applied</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* My Applications */}
      {myApplications.length > 0 && (
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '0.875rem' }}>
            My {activeType === 'REASSESSMENT' ? 'Reassessment' : 'Rechecking'} Applications
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-card-alt)' }}>
                  {['App No.', 'Subject', 'Exam', 'Marks', 'Fee', 'Payment', 'Status', 'Applied On'].map(h => (
                    <th key={h} style={{ padding: '0.6rem 0.875rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.4px', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {myApplications.map((app, idx) => (
                  <tr key={app.id} style={{ borderBottom: '1px solid var(--border-light)', background: idx % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-main)' }}>
                    <td style={{ padding: '0.7rem 0.875rem', fontFamily: 'monospace', fontSize: '0.78rem', fontWeight: 600 }}>{app.applicationNo}</td>
                    <td style={{ padding: '0.7rem 0.875rem', fontWeight: 600 }}>{app.subjectName || '—'}<br /><span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{app.subjectCode}</span></td>
                    <td style={{ padding: '0.7rem 0.875rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{app.examName || '—'}</td>
                    <td style={{ padding: '0.7rem 0.875rem', fontWeight: 700 }}>
                      {app.marksObtained !== undefined ? app.marksObtained : '—'}
                      {app.revisedMarks !== undefined ? <span style={{ color: '#10B981', marginLeft: '0.3rem' }}>→ {app.revisedMarks}</span> : ''}
                    </td>
                    <td style={{ padding: '0.7rem 0.875rem', fontWeight: 700, color: 'var(--brand-orange)' }}>₹{app.fee}</td>
                    <td style={{ padding: '0.7rem 0.875rem' }}>
                      <Badge variant={app.paymentStatus === 'PAID' ? 'success' : app.paymentStatus === 'PENDING' ? 'warning' : 'danger'}>
                        {app.paymentStatus}
                      </Badge>
                    </td>
                    <td style={{ padding: '0.7rem 0.875rem' }}>{getStatusBadge(app.status)}</td>
                    <td style={{ padding: '0.7rem 0.875rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{app.applicationDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {applyModal && step === 'APPLY' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', padding: '2rem', maxWidth: '480px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <h3 style={{ margin: '0 0 1rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
              Apply for {activeType === 'REASSESSMENT' ? 'Reassessment' : 'Rechecking'}
            </h3>

            <div style={{ background: 'var(--bg-card-alt)', borderRadius: 'var(--radius-lg)', padding: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.82rem' }}>
                {[
                  ['Subject', applyModal.subject?.name || applyModal.mark.subjectName || 'N/A'],
                  ['Code', applyModal.subject?.code || applyModal.mark.subjectCode || 'N/A'],
                  ['Exam', applyModal.exam?.name || 'Semester Exam'],
                  ['Marks', `${applyModal.mark.totalMarks}/${applyModal.mark.maxMarks ?? ((applyModal.mark.maxInternalMarks || 0) + (applyModal.mark.maxExternalMarks || 0) || 100)}`],
                  ['Grade', applyModal.mark.grade || (applyModal.mark.isPass ? 'PASS' : 'FAIL')],
                  ['Application Fee', `₹${feeForType}`]
                ].map(([k, v]) => (
                  <div key={k}>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{k}: </span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: activeType === 'REASSESSMENT' ? 'rgba(99,102,241,0.06)' : 'rgba(16,185,129,0.06)', border: `1px solid ${activeType === 'REASSESSMENT' ? 'rgba(99,102,241,0.2)' : 'rgba(16,185,129,0.2)'}`, borderRadius: 'var(--radius-sm)', padding: '0.75rem', fontSize: '0.78rem', color: activeType === 'REASSESSMENT' ? '#4338CA' : '#065F46', marginBottom: '1rem' }}>
              <Info size={13} style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} />
              {activeType === 'REASSESSMENT'
                ? 'By applying for reassessment, you agree that revised marks will be final and binding.'
                : 'Rechecking verifies totaling and unevaluated sections only. No change in evaluation.'}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setApplyModal(null)} className="btn btn-outline">Cancel</button>
              <button onClick={handleApply} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Apply & Pay ₹{feeForType} <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {pendingApp && step === 'PAYMENT' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', padding: '2rem', maxWidth: '440px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <h3 style={{ margin: '0 0 1rem', fontWeight: 800, color: 'var(--brand-navy)' }}>Payment Gateway</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', background: 'var(--bg-card-alt)', padding: '0.875rem 1rem', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Amount Due</span>
              <span style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--brand-navy)' }}>₹{pendingApp.fee}</span>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Payment Mode</label>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {[{ value: 'ONLINE_UPI', label: '📱 UPI' }, { value: 'NET_BANKING', label: '🏦 Net Banking' }, { value: 'CREDIT_DEBIT_CARD', label: '💳 Card' }].map(opt => (
                  <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}>
                    <input type="radio" name="rsmPayMode" value={opt.value} checked={paymentMode === opt.value} onChange={e => setPaymentMode(e.target.value)} />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
            <div style={{ padding: '0.6rem 0.875rem', background: '#FFF7ED', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', color: '#92400E', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
              <AlertTriangle size={13} /> Application will only be processed after payment is verified.
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={() => { setApplyModal(null); setPendingApp(null); setStep('APPLY'); }} className="btn btn-outline">Cancel</button>
              <button onClick={handlePayment} disabled={isProcessing} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CreditCard size={16} /> {isProcessing ? 'Processing...' : `Pay ₹${pendingApp.fee}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
