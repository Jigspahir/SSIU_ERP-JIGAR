import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Badge } from '../../components/common/Badge';
import { ExamFeeBreakdown } from '../../types';
import {
  RotateCcw, AlertTriangle, CheckCircle, XCircle, CreditCard,
  BookOpen, ChevronRight, Info, ShieldAlert, Clock,
  ArrowRight
} from 'lucide-react';

const EXAM_TYPE_META: Record<string, { label: string; color: string; bg: string }> = {
  BACKLOG: { label: 'Backlog', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  ATKT:    { label: 'ATKT', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  RE_EXAM: { label: 'Re-Exam', color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' }
};

export const BacklogReExamPage: React.FC = () => {
  const { user, role } = useAuth();
  const students = db.getStudents();
  const exams = db.getExams();

  const isStudent = role === 'STUDENT';
  const isController = ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'EXAM_CELL', 'REGISTRAR', 'PRINCIPAL', 'HOD'].includes(role || '');

  const currentStudent = useMemo(() =>
    isStudent ? students.find(s => s.id === user?.id || s.email === user?.email) : null,
    [students, user, isStudent]
  );

  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState('ONLINE_UPI');
  const [step, setStep] = useState<'SELECT' | 'REVIEW' | 'PAYMENT' | 'DONE'>('SELECT');
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [txnId, setTxnId] = useState('');

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4500);
  };

  // Eligible backlog subjects for this student
  const backlogSubjects = useMemo(() => {
    if (!currentStudent) return [];
    return db.getStudentEligibleBacklogSubjects(currentStudent.id);
  }, [currentStudent]);

  const eligibleSubjects = backlogSubjects.filter(s => s.eligibility === 'ELIGIBLE');
  const ineligibleSubjects = backlogSubjects.filter(s => s.eligibility !== 'ELIGIBLE');

  // Fee breakdown for selected subjects
  const backlogExams = exams.filter(e =>
    e.type === 'Backlog' || e.type === 'BACKLOG' ||
    e.type === 'Re-Examination' || e.type === 'RE_EXAM' ||
    e.type === 'Supplementary' || e.type === 'ATKT'
  );

  const feeBreakdown: ExamFeeBreakdown | null = useMemo(() => {
    if (!selectedExamId || selectedSubjects.length === 0) return null;
    return db.getExamFeeBreakdown(selectedExamId || backlogExams[0]?.id || '', currentStudent?.id || '', 'BACKLOG', selectedSubjects.length);
  }, [selectedExamId, selectedSubjects, currentStudent, backlogExams]);

  const toggleSubject = (subjectId: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subjectId) ? prev.filter(id => id !== subjectId) : [...prev, subjectId]
    );
  };

  const handleContinue = () => {
    if (selectedSubjects.length === 0) { showToast('error', 'Please select at least one subject.'); return; }
    if (!selectedExamId && backlogExams.length === 0) { showToast('error', 'No backlog exam available. Please contact Exam Controller.'); return; }
    if (!selectedExamId && backlogExams.length > 0) setSelectedExamId(backlogExams[0].id);
    setStep('REVIEW');
  };

  const handleProceedToPayment = () => setStep('PAYMENT');

  const handlePayment = () => {
    setIsProcessing(true);
    const newTxnId = `TXN-BL-${Date.now().toString().slice(-8)}`;
    setTimeout(() => {
      setTxnId(newTxnId);
      setIsProcessing(false);
      setStep('DONE');
      showToast('success', `Backlog form submitted! Txn: ${newTxnId}`);
    }, 1200);
  };

  const getResultBadge = (result: string) => {
    const up = result.toUpperCase();
    if (up === 'FAIL' || up === 'FAILED' || up === 'F') return <Badge variant="danger">Failed</Badge>;
    if (up === 'ABSENT') return <Badge variant="warning">Absent</Badge>;
    if (up === 'ATKT') return <Badge variant="warning">ATKT</Badge>;
    return <Badge variant="navy">{result}</Badge>;
  };

  // Controller view: show all students with backlogs
  if (isController) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-navy)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <RotateCcw size={28} color="var(--brand-orange)" /> Backlog / Re-Exam Management
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            View students with pending backlog subjects and their eligibility for re-examination.
          </p>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
          <p style={{ color: 'var(--text-muted)', margin: 0, textAlign: 'center', padding: '2rem' }}>
            <ShieldAlert size={40} style={{ display: 'block', margin: '0 auto 0.75rem' }} />
            Backlog / Re-Exam Controller view — Select student to view their backlog eligibility.
          </p>
        </div>
      </div>
    );
  }

  // Student view
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
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-navy)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <RotateCcw size={28} color="var(--brand-orange)" /> Backlog / Re-Exam
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Select eligible subjects to apply for backlog / re-examination. Subjects and eligibility are determined by the university.
        </p>
      </div>

      {/* Progress Steps */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        {[
          { key: 'SELECT', label: '1. Select Subjects' },
          { key: 'REVIEW', label: '2. Review & Fee' },
          { key: 'PAYMENT', label: '3. Payment' },
          { key: 'DONE', label: '4. Submitted' }
        ].map((s, i, arr) => (
          <React.Fragment key={s.key}>
            <div style={{
              padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)',
              background: step === s.key ? 'var(--brand-orange)' : (arr.findIndex(x => x.key === step) > i ? '#10B981' : 'var(--bg-card-alt)'),
              color: step === s.key ? '#fff' : (arr.findIndex(x => x.key === step) > i ? '#fff' : 'var(--text-muted)'),
              fontWeight: 700, fontSize: '0.78rem', whiteSpace: 'nowrap',
              border: '1px solid var(--border-light)'
            }}>
              {arr.findIndex(x => x.key === step) > i ? '✓ ' : ''}{s.label}
            </div>
            {i < arr.length - 1 && <ChevronRight size={16} color="var(--text-muted)" />}
          </React.Fragment>
        ))}
      </div>

      {/* STEP 1: Subject Selection */}
      {step === 'SELECT' && (
        <>
          {backlogSubjects.length === 0 ? (
            <div style={{ background: 'linear-gradient(135deg,#F0FDF4 0%,#ECFDF5 100%)', border: '1px solid #A7F3D0', borderRadius: 'var(--radius-lg)', padding: '2.5rem', textAlign: 'center' }}>
              <CheckCircle size={48} color="#10B981" style={{ marginBottom: '0.75rem' }} />
              <h3 style={{ margin: 0, color: '#065F46', fontWeight: 800 }}>No Backlogs Found!</h3>
              <p style={{ margin: '0.5rem 0 0', color: '#047857', fontSize: '0.875rem' }}>
                You have no pending backlog subjects. Keep up the excellent work!
              </p>
            </div>
          ) : (
            <>
              {/* Eligible Subjects */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
                  <CheckCircle size={18} color="#10B981" />
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--brand-navy)' }}>
                    Eligible for Backlog / Re-Exam ({eligibleSubjects.length})
                  </h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {eligibleSubjects.map(sub => {
                    const meta = EXAM_TYPE_META[sub.examType] || EXAM_TYPE_META.BACKLOG;
                    const isSelected = selectedSubjects.includes(sub.subjectId);
                    return (
                      <div
                        key={sub.subjectId}
                        onClick={() => toggleSubject(sub.subjectId)}
                        style={{
                          background: isSelected ? 'rgba(243,112,35,0.06)' : 'var(--bg-card)',
                          border: `2px solid ${isSelected ? 'var(--brand-orange)' : 'var(--border-light)'}`,
                          borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem',
                          cursor: 'pointer', transition: 'all var(--transition-fast)',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                          <div style={{
                            width: '20px', height: '20px', borderRadius: '4px',
                            border: `2px solid ${isSelected ? 'var(--brand-orange)' : 'var(--border-light)'}`,
                            background: isSelected ? 'var(--brand-orange)' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                          }}>
                            {isSelected && <CheckCircle size={12} color="#fff" />}
                          </div>
                          <BookOpen size={18} color={meta.color} />
                          <div>
                            <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>{sub.subjectName}</p>
                            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              {sub.subjectCode} {sub.semesterNumber ? `• Sem ${sub.semesterNumber}` : ''} • Attempt #{sub.attemptNumber}
                            </p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                          {getResultBadge(sub.result)}
                          <span style={{ background: meta.bg, color: meta.color, fontWeight: 700, fontSize: '0.72rem', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)' }}>
                            {meta.label}
                          </span>
                          <span style={{ fontWeight: 700, color: meta.color }}>₹{sub.fee}</span>
                          {sub.marksObtained !== undefined && (
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              {sub.marksObtained}/{sub.maximumMarks}
                            </span>
                          )}
                          <Badge variant="success">Eligible</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Ineligible Subjects */}
              {ineligibleSubjects.length > 0 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
                    <XCircle size={18} color="#EF4444" />
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--brand-navy)' }}>
                      Not Eligible ({ineligibleSubjects.length})
                    </h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {ineligibleSubjects.map(sub => (
                      <div key={sub.subjectId} style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: 0.6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <XCircle size={16} color="#EF4444" />
                          <div>
                            <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{sub.subjectName}</p>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sub.subjectCode} • Attempt #{sub.attemptNumber}</p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Badge variant="danger">Not Eligible</Badge>
                          {sub.eligibilityReason && <span style={{ fontSize: '0.72rem', color: '#EF4444' }}>{sub.eligibilityReason}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Backlog Exam Selector */}
              {backlogExams.length > 0 && (
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                    Select Backlog Exam Session
                  </label>
                  <select
                    value={selectedExamId}
                    onChange={e => setSelectedExamId(e.target.value)}
                    className="form-select"
                    style={{ maxWidth: '320px' }}
                  >
                    <option value="">-- Select --</option>
                    {backlogExams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                </div>
              )}

              {/* Continue Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleContinue}
                  disabled={selectedSubjects.length === 0}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: selectedSubjects.length === 0 ? 0.5 : 1 }}
                >
                  Continue with {selectedSubjects.length} subject{selectedSubjects.length !== 1 ? 's' : ''} <ArrowRight size={16} />
                </button>
              </div>
            </>
          )}
        </>
      )}

      {/* STEP 2: Review & Fee */}
      {step === 'REVIEW' && feeBreakdown && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ margin: 0, fontWeight: 700, color: 'var(--brand-navy)', fontSize: '1.05rem' }}>Review Your Backlog Application</h3>

          {/* Selected Subjects */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--border-light)', background: 'var(--bg-card-alt)' }}>
              <p style={{ margin: 0, fontWeight: 700, color: 'var(--brand-navy)', fontSize: '0.9rem' }}>Selected Subjects</p>
            </div>
            {selectedSubjects.map(sid => {
              const sub = backlogSubjects.find(s => s.subjectId === sid);
              if (!sub) return null;
              return (
                <div key={sid} style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600 }}>{sub.subjectName}</p>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>{sub.subjectCode} • {sub.examType}</p>
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>₹{sub.fee}</span>
                </div>
              );
            })}
          </div>

          {/* Fee Breakdown */}
          <div style={{ background: 'linear-gradient(135deg,rgba(243,112,35,0.05) 0%,rgba(243,112,35,0.02) 100%)', border: '1px solid rgba(243,112,35,0.2)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
            <p style={{ margin: '0 0 0.875rem', fontWeight: 700, color: 'var(--brand-navy)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Info size={16} color="var(--brand-orange)" /> Fee Breakdown (Backend-Authoritative)
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: '0.75rem' }}>
              {[
                { label: 'Base Fee', value: feeBreakdown.baseFee },
                { label: `Per Subject (×${feeBreakdown.subjectCount})`, value: feeBreakdown.subjectFeeTotal },
                ...(feeBreakdown.lateFee > 0 ? [{ label: 'Late Fee', value: feeBreakdown.lateFee }] : []),
                { label: 'TOTAL', value: feeBreakdown.totalPayable, highlight: true }
              ].map((row: any, i) => (
                <div key={i} style={{ background: row.highlight ? 'var(--brand-orange)' : 'var(--bg-card)', borderRadius: 'var(--radius-md)', padding: '0.75rem', textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: '0.72rem', fontWeight: 600, color: row.highlight ? 'rgba(255,255,255,0.85)' : 'var(--text-muted)' }}>{row.label}</p>
                  <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: row.highlight ? '#fff' : 'var(--brand-navy)', marginTop: '0.2rem' }}>₹{row.value.toLocaleString()}</p>
                </div>
              ))}
            </div>
            {feeBreakdown.isLate && (
              <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.875rem', background: '#FEF3C7', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', color: '#92400E', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={13} /> Late fee applied — form deadline has passed.
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button onClick={() => setStep('SELECT')} className="btn btn-outline">← Back</button>
            <button onClick={handleProceedToPayment} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Proceed to Payment <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Payment */}
      {step === 'PAYMENT' && feeBreakdown && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ margin: 0, fontWeight: 700, color: 'var(--brand-navy)', fontSize: '1.05rem' }}>Payment Gateway</h3>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Amount to Pay</span>
              <span style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--brand-navy)' }}>₹{feeBreakdown.totalPayable.toLocaleString()}</span>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Select Payment Mode</label>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {[{ value: 'ONLINE_UPI', label: '📱 UPI / QR' }, { value: 'NET_BANKING', label: '🏦 Net Banking' }, { value: 'CREDIT_DEBIT_CARD', label: '💳 Card' }].map(opt => (
                  <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
                    <input type="radio" name="backlogPayMode" value={opt.value} checked={paymentMode === opt.value} onChange={e => setPaymentMode(e.target.value)} />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
            <div style={{ padding: '0.75rem', background: '#FFF7ED', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', color: '#92400E', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={14} /> Exam form will only be submitted after successful payment verification.
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setStep('REVIEW')} className="btn btn-outline">← Back</button>
              <button onClick={handlePayment} disabled={isProcessing} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CreditCard size={16} />
                {isProcessing ? 'Processing Payment...' : `Pay ₹${feeBreakdown.totalPayable.toLocaleString()}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Done */}
      {step === 'DONE' && (
        <div style={{ background: 'linear-gradient(135deg,#F0FDF4 0%,#ECFDF5 100%)', border: '1px solid #A7F3D0', borderRadius: 'var(--radius-lg)', padding: '2.5rem', textAlign: 'center' }}>
          <CheckCircle size={52} color="#10B981" style={{ marginBottom: '0.875rem' }} />
          <h3 style={{ margin: 0, color: '#065F46', fontWeight: 800, fontSize: '1.25rem' }}>Backlog Application Submitted!</h3>
          <p style={{ margin: '0.5rem 0 0', color: '#047857', fontSize: '0.875rem' }}>
            Payment Reference: <strong>{txnId}</strong>
          </p>
          <p style={{ margin: '0.5rem 0 0', color: '#047857', fontSize: '0.8rem' }}>
            Your backlog exam form has been submitted to the Exam Controller for verification.<br />
            Hall Ticket will be issued after verification.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.25rem' }}>
            <button onClick={() => { setStep('SELECT'); setSelectedSubjects([]); setTxnId(''); }} className="btn btn-outline">
              Apply for Another Subject
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
