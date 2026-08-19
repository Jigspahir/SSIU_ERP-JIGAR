import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Badge } from '../../components/common/Badge';
import { ExamForm, ExamFeeBreakdown } from '../../types';
import {
  IndianRupee, CreditCard, CheckCircle2,
  FileText, RefreshCw, RotateCcw, Shield, Info, Download,
  ChevronDown, ChevronUp, Sparkles, Clock
} from 'lucide-react';

const FEE_CATEGORIES = [
  { key: 'REGULAR' as const, label: 'Regular Exam Fee', icon: FileText, color: '#3B82F6', bgColor: 'rgba(59,130,246,0.08)', description: 'Standard semester examination fee for enrolled subjects' },
  { key: 'BACKLOG' as const, label: 'Backlog / ATKT Fee', icon: RotateCcw, color: '#F59E0B', bgColor: 'rgba(245,158,11,0.08)', description: 'Fee for re-appearing in previously failed subjects' },
  { key: 'RE_EXAM' as const, label: 'Re-Exam Fee', icon: RefreshCw, color: '#8B5CF6', bgColor: 'rgba(139,92,246,0.08)', description: 'Re-examination fee as per university rules' },
  { key: 'SUPPLEMENTARY' as const, label: 'Supplementary Exam Fee', icon: Sparkles, color: '#EC4899', bgColor: 'rgba(236,72,153,0.08)', description: 'Supplementary / improvement examination fee' },
  { key: 'REASSESSMENT' as const, label: 'Reassessment Fee', icon: Shield, color: '#10B981', bgColor: 'rgba(16,185,129,0.08)', description: 'Paper reassessment / re-evaluation fee' },
  { key: 'RECHECKING' as const, label: 'Rechecking Fee', icon: Shield, color: '#6366F1', bgColor: 'rgba(99,102,241,0.08)', description: 'Answer script rechecking / verification fee' }
];

export const StudentExamFeesPage: React.FC = () => {
  const { user, role } = useAuth();
  const exams = db.getExams();
  const forms = db.getExamForms();
  const students = db.getStudents();

  const [selectedExamId, setSelectedExamId] = useState<string>(exams[0]?.id || '');
  const [paymentMode, setPaymentMode] = useState<string>('ONLINE_UPI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>('REGULAR');
  const [payingFormId, setPayingFormId] = useState<string | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4500);
  };

  const currentExam = useMemo(() => exams.find(e => e.id === selectedExamId), [exams, selectedExamId]);
  const currentStudent = useMemo(() =>
    role === 'STUDENT' ? students.find(s => s.id === user?.id || s.email === user?.email) : null,
    [students, user, role]
  );
  const myForms = useMemo(() =>
    currentStudent ? forms.filter(f => f.studentId === currentStudent.id) : [],
    [forms, currentStudent]
  );
  const feeBreakdowns = useMemo(() => {
    const result: Record<string, ExamFeeBreakdown> = {};
    FEE_CATEGORIES.forEach(cat => {
      result[cat.key] = db.getExamFeeBreakdown(selectedExamId, currentStudent?.id || '', cat.key, 1);
    });
    return result;
  }, [selectedExamId, currentStudent]);

  const currentForm = useMemo(() =>
    currentStudent ? myForms.find(f => f.examId === selectedExamId) : null,
    [myForms, selectedExamId, currentStudent]
  );

  const handlePayFee = (form: ExamForm) => {
    setIsProcessing(true);
    setPayingFormId(form.id);
    const txnId = `TXN-EXAM-${Date.now().toString().slice(-8)}`;
    setTimeout(() => {
      try {
        db.updateEntity<ExamForm>('examForms', form.id, {
          paymentStatus: 'PAID', paymentMode, transactionId: txnId,
          paidAt: new Date().toISOString().split('T')[0],
          status: (form.status === 'DRAFT' || form.status === 'PAYMENT_PENDING') ? 'VERIFICATION_PENDING' : form.status
        }, 'Paid Exam Fee — Student Self-Service');
        showToast('success', `Payment of ₹${form.totalFee} successful! Ref: ${txnId}`);
      } catch { showToast('error', 'Payment failed. Please try again.'); }
      finally { setIsProcessing(false); setPayingFormId(null); }
    }, 1000);
  };

  const handleDownloadReceipt = (form: ExamForm) => {
    const examObj = exams.find(e => e.id === form.examId);
    const content = `====================================================\nSWARRNIM UNIVERSITY — EXAMINATION FEE RECEIPT\n====================================================\nReceipt No   : REC-EXAM-${form.id}\nDate         : ${form.paidAt || new Date().toISOString().split('T')[0]}\nStudent      : ${form.studentName}\nEnrollment   : ${form.enrollmentNo}\nExam         : ${examObj?.name || 'Semester Examination'}\nPayment Mode : ${form.paymentMode || 'ONLINE'}\nTxn Ref ID   : ${form.transactionId || 'TXN-EXAM-000'}\n----------------------------------------------------\nBase Exam Fee      : Rs. ${form.baseFee || 300}\nSubject Fees       : Rs. ${form.subjectFee || 0}\nLate Fee Penalty   : Rs. ${form.lateFee || 0}\nTOTAL AMOUNT PAID  : Rs. ${form.totalFee}\nStatus             : PAYMENT VERIFIED & CONFIRMED\n====================================================\nFinance & Examination Division, Swarrnim University\n====================================================`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `ExamFeeReceipt_${form.enrollmentNo}.txt`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const payBadge = (status: string) => {
    switch (status) {
      case 'PAID': case 'COMPLETED': case 'SUCCESS': return <Badge variant="success">Paid</Badge>;
      case 'PENDING': case 'INITIATED': return <Badge variant="warning">Pending</Badge>;
      case 'FAILED': return <Badge variant="danger">Failed</Badge>;
      default: return <Badge variant="navy">{status}</Badge>;
    }
  };

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
            <IndianRupee size={28} color="var(--brand-orange)" />
            Examination Fees
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            All examination-related fees — amounts are university-authoritative. Select an exam to view applicable fees.
          </p>
        </div>
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Select Exam</label>
          <select value={selectedExamId} onChange={e => setSelectedExamId(e.target.value)} className="form-select" style={{ minWidth: '240px' }}>
            {exams.map(exam => <option key={exam.id} value={exam.id}>{exam.name}</option>)}
          </select>
        </div>
      </div>

      {/* Current Form Alert */}
      {currentForm && (
        <div style={{ background: 'linear-gradient(135deg,#F0FDF4 0%,#ECFDF5 100%)', border: '1px solid #A7F3D0', borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CheckCircle2 size={24} color="#10B981" />
            <div>
              <p style={{ margin: 0, fontWeight: 700, color: '#065F46' }}>Exam Form Found — {currentExam?.name}</p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#047857', marginTop: '0.15rem' }}>
                Subjects: {currentForm.formSubjects?.length ?? (currentForm.regularSubjects?.length ?? 0)} • Total: ₹{currentForm.totalFee}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {payBadge(currentForm.paymentStatus)}
            {(currentForm.paymentStatus === 'PENDING' || currentForm.paymentStatus === 'INITIATED') && (
              <button onClick={() => handlePayFee(currentForm)} disabled={isProcessing} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CreditCard size={16} />
                {isProcessing && payingFormId === currentForm.id ? 'Processing...' : `Pay ₹${currentForm.totalFee}`}
              </button>
            )}
            {(currentForm.paymentStatus === 'PAID' || currentForm.paymentStatus === 'COMPLETED') && (
              <button onClick={() => handleDownloadReceipt(currentForm)} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                <Download size={14} /> Receipt
              </button>
            )}
          </div>
        </div>
      )}

      {/* Fee Categories */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--brand-navy)', margin: 0 }}>Applicable Fee Schedule</h3>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Info size={12} /> Configured by Exam Controller — not editable by students
          </span>
        </div>
        {FEE_CATEGORIES.map(cat => {
          const breakdown = feeBreakdowns[cat.key];
          const Icon = cat.icon;
          const isExpanded = expandedCategory === cat.key;
          return (
            <div key={cat.key} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <button onClick={() => setExpandedCategory(isExpanded ? null : cat.key)} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: cat.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={20} color={cat.color} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{cat.label}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cat.description}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                  <span style={{ fontWeight: 800, fontSize: '1.05rem', color: cat.color }}>₹{breakdown.totalPayable.toLocaleString()}</span>
                  {isExpanded ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                </div>
              </button>
              {isExpanded && (
                <div style={{ borderTop: '1px solid var(--border-light)', padding: '1.25rem', background: cat.bgColor }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '1rem' }}>
                    {[
                      { label: 'Base Fee', value: breakdown.baseFee },
                      { label: `Per Subject (×${breakdown.subjectCount})`, value: breakdown.subjectFeeTotal },
                      ...(breakdown.isLate ? [{ label: 'Late Fee', value: breakdown.lateFee }] : []),
                      ...(breakdown.concession > 0 ? [{ label: 'Concession', value: -breakdown.concession }] : [])
                    ].map((row, i) => (
                      <div key={i} style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', textAlign: 'center' }}>
                        <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>{row.label}</p>
                        <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--brand-navy)', marginTop: '0.2rem' }}>₹{Math.abs(row.value).toLocaleString()}</p>
                      </div>
                    ))}
                    <div style={{ background: cat.color, borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <p style={{ margin: 0, fontSize: '0.72rem', color: 'rgba(255,255,255,0.85)', fontWeight: 700 }}>TOTAL PAYABLE</p>
                      <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginTop: '0.2rem' }}>₹{breakdown.totalPayable.toLocaleString()}</p>
                    </div>
                  </div>
                  {breakdown.isLate && (
                    <div style={{ marginTop: '0.875rem', padding: '0.6rem 0.875rem', background: '#FEF3C7', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#92400E', fontWeight: 600 }}>
                      <Clock size={14} /> Late fee applied — submission deadline has passed for this exam.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Payment History Table */}
      {myForms.length > 0 && (
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '0.875rem' }}>My Examination Payment History</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-card-alt)' }}>
                  {['Exam','Form #','Subjects','Total','Payment','Txn ID','Paid On','Status','Action'].map(h => (
                    <th key={h} style={{ padding: '0.6rem 0.875rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.4px', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {myForms.map((form, idx) => {
                  const examObj = exams.find(e => e.id === form.examId);
                  return (
                    <tr key={form.id} style={{ borderBottom: '1px solid var(--border-light)', background: idx % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-main)' }}>
                      <td style={{ padding: '0.6rem 0.875rem', fontWeight: 600, color: 'var(--brand-navy)', whiteSpace: 'nowrap' }}>{examObj?.name || '—'}</td>
                      <td style={{ padding: '0.6rem 0.875rem', color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.78rem' }}>{form.id}</td>
                      <td style={{ padding: '0.6rem 0.875rem' }}>{form.formSubjects?.length ?? (form.regularSubjects?.length ?? 0)}</td>
                      <td style={{ padding: '0.6rem 0.875rem', fontWeight: 700, color: 'var(--brand-navy)' }}>₹{form.totalFee ?? 0}</td>
                      <td style={{ padding: '0.6rem 0.875rem' }}>{payBadge(form.paymentStatus)}</td>
                      <td style={{ padding: '0.6rem 0.875rem', fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{form.transactionId || '—'}</td>
                      <td style={{ padding: '0.6rem 0.875rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{form.paidAt || '—'}</td>
                      <td style={{ padding: '0.6rem 0.875rem' }}>
                        <Badge variant={form.status === 'APPROVED' || form.status === 'VERIFIED' ? 'success' : form.status === 'REJECTED' ? 'danger' : form.status === 'VERIFICATION_PENDING' ? 'warning' : 'navy'}>
                          {form.status}
                        </Badge>
                      </td>
                      <td style={{ padding: '0.6rem 0.875rem' }}>
                        {(form.paymentStatus === 'PENDING' || form.paymentStatus === 'INITIATED') ? (
                          <button onClick={() => handlePayFee(form)} disabled={isProcessing} className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <CreditCard size={13} /> Pay ₹{form.totalFee}
                          </button>
                        ) : (form.paymentStatus === 'PAID' || form.paymentStatus === 'COMPLETED') ? (
                          <button onClick={() => handleDownloadReceipt(form)} className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Download size={13} /> Receipt
                          </button>
                        ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Mode */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
        <h4 style={{ margin: '0 0 0.875rem 0', fontWeight: 700, color: 'var(--brand-navy)', fontSize: '0.9rem' }}>Payment Mode</h4>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {[{ value: 'ONLINE_UPI', label: '📱 UPI / QR' }, { value: 'NET_BANKING', label: '🏦 Net Banking' }, { value: 'CREDIT_DEBIT_CARD', label: '💳 Card' }, { value: 'DEMAND_DRAFT', label: '📋 Demand Draft' }].map(opt => (
            <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
              <input type="radio" name="paymentMode" value={opt.value} checked={paymentMode === opt.value} onChange={e => setPaymentMode(e.target.value)} />
              {opt.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
