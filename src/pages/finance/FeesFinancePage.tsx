import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Badge } from '../../components/common/Badge';
import { StatCard } from '../../components/common/StatCard';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { FeeReceiptModal } from '../../components/finance/FeeReceiptModal';
import { DashboardReportModal } from '../../components/reports/DashboardReportModal';
import { 
  FeeStructure, StudentFeeRecord, FeePaymentTransaction, PaymentMode, FeePaymentStatus 
} from '../../types';
import { 
  IndianRupee, CreditCard, FileText, CheckCircle2, Clock, 
  AlertTriangle, Plus, Search, Download, Printer, Trash2, ShieldAlert,
  Calendar, RotateCcw, ShieldCheck, Check, RefreshCw
} from 'lucide-react';

export const FeesFinancePage: React.FC = () => {
  const { user, role } = useAuth();

  const programs = db.getPrograms();
  const semesters = db.getSemesters();
  const feeStructures = db.getFeeStructures();
  const feeRecords = db.getStudentFeeRecords();
  const paymentTransactions = db.getFeePaymentTransactions();

  const financeStats = db.getFinanceOverviewStats();

  const [activeTab, setActiveTab] = useState<'DIRECTORY' | 'STRUCTURES' | 'TRANSACTIONS'>('DIRECTORY');

  // Filters State for Admin Directory
  const [selectedProgFilter, setSelectedProgFilter] = useState('ALL');
  const [selectedSemFilter, setSelectedSemFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals & Selection State
  const [isRecordPaymentModalOpen, setIsRecordPaymentModalOpen] = useState(false);
  const [isAddStructureModalOpen, setIsAddStructureModalOpen] = useState(false);
  const [isOnlinePaymentModalOpen, setIsOnlinePaymentModalOpen] = useState(false);
  const [selectedRecordForPayment, setSelectedRecordForPayment] = useState<StudentFeeRecord | null>(null);
  const [selectedTransactionForReceipt, setSelectedTransactionForReceipt] = useState<FeePaymentTransaction | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<StudentFeeRecord | null>(null);
  const [refundingTx, setRefundingTx] = useState<FeePaymentTransaction | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Student Semester View State
  const [studentSelectedSem, setStudentSelectedSem] = useState<string>('sem-cse-4');

  // Form State: Online Payment Gateway Simulation
  const [onlinePayType, setOnlinePayType] = useState<'SEMESTER' | 'EXAM' | 'CUSTOM'>('SEMESTER');
  const [onlinePayAmount, setOnlinePayAmount] = useState<number>(0);
  const [onlinePayMode, setOnlinePayMode] = useState<PaymentMode>('Online UPI');
  const [upiId, setUpiId] = useState('student@okaxis');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892');
  const [bankName, setBankName] = useState('HDFC Bank');
  const [paymentGatewayStep, setPaymentGatewayStep] = useState<'FORM' | 'PROCESSING' | 'SUCCESS'>('FORM');

  // Form State: Record Payment (Admin)
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMode, setPayMode] = useState<PaymentMode>('Online UPI');
  const [payTxId, setPayTxId] = useState('');
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [payRemarks, setPayRemarks] = useState('');

  // Form State: Fee Structure Creator
  const [structProgId, setStructProgId] = useState(programs[0]?.id || '');
  const [structSemId, setStructSemId] = useState(semesters[0]?.id || '');
  const [structTuition, setStructTuition] = useState(45000);
  const [structLab, setStructLab] = useState(8000);
  const [structDev, setStructDev] = useState(7000);
  const [structHostel, setStructHostel] = useState(15000);
  const [structExam, setStructExam] = useState(1200);

  // Filtered Fee Records for Admin Directory
  const filteredFeeRecords = feeRecords.filter(r => {
    const matchesProg = selectedProgFilter === 'ALL' || r.programId === selectedProgFilter;
    const matchesSem = selectedSemFilter === 'ALL' || r.semesterId === selectedSemFilter;
    const matchesStatus = selectedStatusFilter === 'ALL' || r.status === selectedStatusFilter;
    const matchesSearch = r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || r.enrollmentNo.includes(searchTerm);
    return matchesProg && matchesSem && matchesStatus && matchesSearch;
  });

  // Calculate Late Fee Helper
  const getLateFeeCalculation = (record?: StudentFeeRecord) => {
    if (!record || record.pendingAmount <= 0) return { daysOverdue: 0, lateFee: 0 };
    const today = new Date();
    const due = new Date(record.dueDate);
    if (today <= due) return { daysOverdue: 0, lateFee: 0 };
    const diffDays = Math.ceil((today.getTime() - due.getTime()) / (1000 * 3600 * 24));
    const lateFeePerDay = record.lateFeePerDay || 50;
    return { daysOverdue: diffDays, lateFee: diffDays * lateFeePerDay };
  };

  // Handlers for Admin
  const handleOpenRecordPayment = (rec: StudentFeeRecord) => {
    setSelectedRecordForPayment(rec);
    setPayAmount(rec.pendingAmount > 0 ? rec.pendingAmount : rec.totalAmount);
    setPayTxId(`UPI${Math.floor(1000000000 + Math.random() * 9000000000)}`);
    setPayRemarks('Semester fee installment payment');
    setIsRecordPaymentModalOpen(true);
  };

  const handleSavePaymentTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecordForPayment) return;

    const amount = Number(payAmount);
    if (amount <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }

    const receiptNo = `SSIU-REC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const newTx = db.addEntity<FeePaymentTransaction>('feePaymentTransactions', {
      studentFeeRecordId: selectedRecordForPayment.id,
      receiptNo,
      studentId: selectedRecordForPayment.studentId,
      studentName: selectedRecordForPayment.studentName,
      enrollmentNo: selectedRecordForPayment.enrollmentNo,
      programId: selectedRecordForPayment.programId,
      semesterId: selectedRecordForPayment.semesterId,
      paidAmount: amount,
      paymentMode: payMode,
      transactionId: payTxId,
      gatewayRef: `GW-${Math.floor(10000000 + Math.random() * 90000000)}`,
      feeType: 'TUITION',
      status: 'SUCCESS',
      paymentDate: payDate,
      remarks: payRemarks,
      recordedBy: user?.name || 'Accounts Admin'
    }, `Recorded fee payment of ₹${amount} for ${selectedRecordForPayment.studentName}`);

    const newPaidTotal = selectedRecordForPayment.paidAmount + amount;
    const newPendingTotal = Math.max(0, selectedRecordForPayment.totalAmount - newPaidTotal);
    let newStatus: FeePaymentStatus = 'PARTIAL';
    if (newPendingTotal === 0) newStatus = 'PAID';

    db.updateEntity<StudentFeeRecord>('studentFeeRecords', selectedRecordForPayment.id, {
      paidAmount: newPaidTotal,
      pendingAmount: newPendingTotal,
      status: newStatus
    }, `Updated fee balance for ${selectedRecordForPayment.studentName}`);

    setIsRecordPaymentModalOpen(false);
    setSelectedTransactionForReceipt(newTx);
  };

  // Handlers for Student Online Payment
  const handleOpenStudentOnlinePayment = (record: StudentFeeRecord, defaultType: 'SEMESTER' | 'EXAM' = 'SEMESTER') => {
    setSelectedRecordForPayment(record);
    setOnlinePayType(defaultType);
    if (defaultType === 'EXAM') {
      setOnlinePayAmount(record.examFee || 1200);
    } else {
      setOnlinePayAmount(record.pendingAmount > 0 ? record.pendingAmount : record.totalAmount);
    }
    setPaymentGatewayStep('FORM');
    setIsOnlinePaymentModalOpen(true);
  };

  const handleProcessOnlinePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecordForPayment) return;

    if (onlinePayAmount <= 0) {
      alert('Please specify a valid payment amount.');
      return;
    }

    setPaymentGatewayStep('PROCESSING');

    setTimeout(() => {
      const receiptNo = `SSIU-ONLINE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const txnRef = `PAY${Math.floor(1000000000 + Math.random() * 9000000000)}`;

      const newTx = db.addEntity<FeePaymentTransaction>('feePaymentTransactions', {
        studentFeeRecordId: selectedRecordForPayment.id,
        receiptNo,
        studentId: selectedRecordForPayment.studentId,
        studentName: selectedRecordForPayment.studentName,
        enrollmentNo: selectedRecordForPayment.enrollmentNo,
        programId: selectedRecordForPayment.programId,
        semesterId: selectedRecordForPayment.semesterId,
        paidAmount: onlinePayAmount,
        paymentMode: onlinePayMode,
        transactionId: txnRef,
        gatewayRef: `RAZORPAY_${Math.floor(1000000 + Math.random() * 9000000)}`,
        feeType: onlinePayType === 'EXAM' ? 'EXAM' : 'TUITION',
        status: 'SUCCESS',
        paymentDate: new Date().toISOString().split('T')[0],
        remarks: onlinePayType === 'EXAM' ? 'Online Exam Fee Registration Payment' : 'Online University Fee Payment via Student Portal',
        recordedBy: `${user?.name} (Student Online)`
      }, `Processed online payment of ₹${onlinePayAmount}`);

      const newPaidTotal = selectedRecordForPayment.paidAmount + onlinePayAmount;
      const newPendingTotal = Math.max(0, selectedRecordForPayment.totalAmount - newPaidTotal);
      let newStatus: FeePaymentStatus = 'PARTIAL';
      if (newPendingTotal === 0) newStatus = 'PAID';

      db.updateEntity<StudentFeeRecord>('studentFeeRecords', selectedRecordForPayment.id, {
        paidAmount: newPaidTotal,
        pendingAmount: newPendingTotal,
        status: newStatus
      }, `Updated online fee settlement`);

      setPaymentGatewayStep('SUCCESS');

      setTimeout(() => {
        setIsOnlinePaymentModalOpen(false);
        setSelectedTransactionForReceipt(newTx);
      }, 1500);
    }, 2000);
  };

  const handleCreateFeeStructure = (e: React.FormEvent) => {
    e.preventDefault();
    const total = Number(structTuition) + Number(structLab) + Number(structDev) + Number(structHostel) + Number(structExam);

    db.addEntity<FeeStructure>('feeStructures', {
      programId: structProgId,
      semesterId: structSemId,
      academicYearId: 'ay-2024',
      tuitionFee: Number(structTuition),
      labFee: Number(structLab),
      developmentFee: Number(structDev),
      hostelFee: Number(structHostel),
      totalAmount: total,
      status: 'ACTIVE'
    }, `Created Fee Structure of ₹${total} for program`);

    setIsAddStructureModalOpen(false);
  };

  const handleDeleteFeeRecordConfirm = () => {
    if (deletingRecord) {
      db.deleteEntity('studentFeeRecords', deletingRecord.id, `Deleted fee record for ${deletingRecord.studentName}`);
      setDeletingRecord(null);
    }
  };

  const handleRefundConfirm = () => {
    if (refundingTx) {
      const rec = feeRecords.find(r => r.id === refundingTx.studentFeeRecordId);
      if (rec) {
        const newPaid = Math.max(0, rec.paidAmount - refundingTx.paidAmount);
        const newPending = rec.pendingAmount + refundingTx.paidAmount;
        db.updateEntity<StudentFeeRecord>('studentFeeRecords', rec.id, {
          paidAmount: newPaid,
          pendingAmount: newPending,
          status: newPaid === 0 ? 'PENDING' : 'PARTIAL'
        }, `Refunded transaction ${refundingTx.receiptNo}`);
      }

      db.updateEntity<FeePaymentTransaction>('feePaymentTransactions', refundingTx.id, {
        status: 'REFUNDED',
        remarks: `REFUNDED on ${new Date().toISOString().split('T')[0]} by Admin`
      }, `Marked transaction ${refundingTx.receiptNo} as REFUNDED`);

      setRefundingTx(null);
    }
  };

  const handleExportCSVReport = () => {
    let csv = 'Receipt No,Student Name,Enrollment No,Date,Payment Mode,Transaction Ref,Amount,Status\n';
    paymentTransactions.forEach(t => {
      csv += `"${t.receiptNo}","${t.studentName}","${t.enrollmentNo}","${t.paymentDate}","${t.paymentMode}","${t.transactionId}",${t.paidAmount},"${t.status || 'SUCCESS'}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Fee_Transactions_Report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getStatusBadge = (status: FeePaymentStatus) => {
    switch (status) {
      case 'PAID': return <Badge variant="active">PAID</Badge>;
      case 'PARTIAL': return <Badge variant="orange">PARTIAL</Badge>;
      case 'OVERDUE': return <Badge variant="danger">OVERDUE</Badge>;
      case 'FAILED': return <Badge variant="danger">FAILED</Badge>;
      case 'REFUNDED': return <Badge variant="inactive">REFUNDED</Badge>;
      default: return <Badge variant="inactive">PENDING</Badge>;
    }
  };

  // 1. Faculty Restricted Access Screen
  if (role === 'FACULTY') {
    return (
      <div className="card" style={{ padding: '3rem', textAlign: 'center', margin: '2rem auto', maxWidth: '600px' }}>
        <ShieldAlert size={54} color="var(--brand-orange)" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--brand-navy)' }}>Access Restricted</h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.6 }}>
          Financial Management is restricted to University Admin and Student accounts. If you require financial access, please contact the System Admin.
        </p>
      </div>
    );
  }

  // 2. Student View Screen
  if (role === 'STUDENT') {
    const studentId = user?.id || 'stu-1';
    const studentFee = feeRecords.find(r => r.studentId === studentId || r.enrollmentNo === user?.enrollmentNo) || feeRecords[0];
    const studentTxs = paymentTransactions.filter(t => t.studentId === studentFee?.studentId || t.enrollmentNo === user?.enrollmentNo);

    const paidPct = studentFee ? Math.round((studentFee.paidAmount / Math.max(1, studentFee.totalAmount)) * 100) : 0;
    const { daysOverdue, lateFee } = getLateFeeCalculation(studentFee);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
              Student Fee Payment Portal
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Semester-wise fee breakdown, online payment gateway, and official downloadable receipts
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              className="btn btn-primary"
              onClick={() => handleOpenStudentOnlinePayment(studentFee, 'SEMESTER')}
            >
              <CreditCard size={16} /> Pay Semester Fees Online
            </button>
            <button 
              className="btn btn-navy"
              onClick={() => handleOpenStudentOnlinePayment(studentFee, 'EXAM')}
            >
              <IndianRupee size={16} /> Pay Exam Fee (₹1,200)
            </button>
          </div>
        </div>

        {/* Semester Selection Filter */}
        <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--brand-navy)' }}>
            Select Academic Semester:
          </span>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {semesters.map(s => (
              <button
                key={s.id}
                className={`btn btn-sm ${studentSelectedSem === s.id ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setStudentSelectedSem(s.id)}
              >
                {s.code} (Sem {s.number})
              </button>
            ))}
          </div>
        </div>

        {/* Student KPI Cards */}
        <div className="grid-4">
          <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--brand-navy)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>TOTAL FEE DEMAND</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--brand-navy)', marginTop: '0.25rem' }}>
              ₹{studentFee?.totalAmount.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.78125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Semester 4 Demand</div>
          </div>

          <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #10B981' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>PAID SETTLED AMOUNT</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#10B981', marginTop: '0.25rem' }}>
              ₹{studentFee?.paidAmount.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.78125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Verified Gateway Receipts</div>
          </div>

          <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--brand-orange)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>PENDING BALANCE</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--brand-orange)', marginTop: '0.25rem' }}>
              ₹{studentFee?.pendingAmount.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.78125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Due Date: {studentFee?.dueDate}</div>
          </div>

          <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #8B5CF6' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>STATUS &amp; LATE FEE</div>
            <div style={{ marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {getStatusBadge(studentFee?.status || 'PENDING')}
              {lateFee > 0 && <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#EF4444' }}>+₹{lateFee} Late</span>}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              {daysOverdue > 0 ? `${daysOverdue} Days Overdue (₹50/day)` : 'No Late Penalties'}
            </div>
          </div>
        </div>

        {/* Fee Component Breakdown & Online Payment Quick Control */}
        <div className="grid-2">
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={18} color="var(--brand-orange)" /> Semester Fee Components Breakdown
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Tuition Fee:</span>
                <strong>₹{studentFee?.tuitionFee.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Lab &amp; Computing Fee:</span>
                <strong>₹{studentFee?.labFee.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Campus Development Fee:</span>
                <strong>₹{studentFee?.developmentFee.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Hostel &amp; Mess Deposit:</span>
                <strong>₹{(studentFee?.hostelFee || 0).toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Mid-Sem Exam Registration Fee:</span>
                <strong>₹{(studentFee?.examFee || 1200).toLocaleString()}</strong>
              </div>
              {lateFee > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem', color: '#EF4444' }}>
                  <span>Late Fee Penalty ({daysOverdue} Days Overdue):</span>
                  <strong>+₹{lateFee.toLocaleString()}</strong>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.05rem', color: 'var(--brand-navy)', paddingTop: '0.25rem' }}>
                <span>TOTAL DEMAND DUE:</span>
                <span>₹{(studentFee?.totalAmount || 0) + lateFee}</span>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} color="#10B981" /> Payment Status &amp; Progress
              </h3>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                <span>Fee Settlement Ratio</span>
                <span style={{ color: 'var(--brand-orange)' }}>{paidPct}%</span>
              </div>
              <div style={{ height: '14px', borderRadius: '7px', backgroundColor: 'var(--border-light)', overflow: 'hidden', marginBottom: '1.25rem' }}>
                <div style={{ width: `${paidPct}%`, height: '100%', backgroundColor: paidPct === 100 ? '#10B981' : 'var(--brand-orange)', transition: 'width 0.3s ease' }} />
              </div>

              <div style={{ background: 'var(--bg-surface-hover)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.8125rem', lineHeight: 1.5, marginBottom: '1rem' }}>
                <div style={{ fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '0.2rem' }}>
                  🔒 Secure University Payment Gateway
                </div>
                Payments made online generate instant computerized GST-compliant receipts verified by Swarrnim Accounts Office.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => handleOpenStudentOnlinePayment(studentFee, 'SEMESTER')}>
                <CreditCard size={16} /> Pay Pending Balance (₹{studentFee?.pendingAmount.toLocaleString()})
              </button>
            </div>
          </div>
        </div>

        {/* Transaction History & Receipt Action */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '1.25rem' }}>
            Complete Payment Transaction History &amp; Official Receipts
          </h3>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Receipt No</th>
                  <th>Payment Date</th>
                  <th>Type</th>
                  <th>Payment Mode</th>
                  <th>Gateway Ref</th>
                  <th>Amount Paid</th>
                  <th>Status</th>
                  <th>Receipt Action</th>
                </tr>
              </thead>
              <tbody>
                {studentTxs.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No payment transactions recorded for your account yet.
                    </td>
                  </tr>
                ) : (
                  studentTxs.map(tx => (
                    <tr key={tx.id}>
                      <td><code style={{ fontWeight: 700, color: 'var(--brand-orange)' }}>{tx.receiptNo}</code></td>
                      <td>{tx.paymentDate}</td>
                      <td><Badge variant="navy">{tx.feeType || 'TUITION'}</Badge></td>
                      <td><Badge variant="orange">{tx.paymentMode}</Badge></td>
                      <td><code>{tx.transactionId}</code></td>
                      <td style={{ fontWeight: 800, color: tx.status === 'REFUNDED' ? '#EF4444' : '#10B981' }}>
                        ₹{tx.paidAmount.toLocaleString()}
                      </td>
                      <td>
                        <Badge variant={tx.status === 'SUCCESS' || !tx.status ? 'active' : tx.status === 'REFUNDED' ? 'inactive' : 'danger'}>
                          {tx.status || 'SUCCESS'}
                        </Badge>
                      </td>
                      <td>
                        <button className="btn btn-primary btn-sm" onClick={() => setSelectedTransactionForReceipt(tx)}>
                          <FileText size={14} /> Download Receipt
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Student Online Payment Modal */}
        {isOnlinePaymentModalOpen && selectedRecordForPayment && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1rem' }}>
            <div className="card" style={{ width: '100%', maxWidth: '520px', padding: '1.75rem' }}>
              {paymentGatewayStep === 'FORM' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                      Swarrnim Online Fee Gateway
                    </h3>
                    <Badge variant="orange">SECURE 256-BIT SSL</Badge>
                  </div>

                  <form onSubmit={handleProcessOnlinePayment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Payment Category</label>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          className={`btn btn-sm ${onlinePayType === 'SEMESTER' ? 'btn-primary' : 'btn-secondary'}`}
                          onClick={() => {
                            setOnlinePayType('SEMESTER');
                            setOnlinePayAmount(selectedRecordForPayment.pendingAmount || selectedRecordForPayment.totalAmount);
                          }}
                        >
                          Semester Dues (₹{selectedRecordForPayment.pendingAmount.toLocaleString()})
                        </button>
                        <button
                          type="button"
                          className={`btn btn-sm ${onlinePayType === 'EXAM' ? 'btn-primary' : 'btn-secondary'}`}
                          onClick={() => {
                            setOnlinePayType('EXAM');
                            setOnlinePayAmount(selectedRecordForPayment.examFee || 1200);
                          }}
                        >
                          Exam Fee (₹1,200)
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Amount to Pay (₹) *</label>
                      <input 
                        type="number" 
                        className="form-input" 
                        value={onlinePayAmount} 
                        onChange={e => setOnlinePayAmount(Number(e.target.value))} 
                        min={100} 
                        required 
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Payment Gateway Mode *</label>
                      <select 
                        className="form-select" 
                        value={onlinePayMode} 
                        onChange={e => setOnlinePayMode(e.target.value as PaymentMode)}
                      >
                        <option value="Online UPI">Instant UPI (GPay / PhonePe / Paytm / BHIM)</option>
                        <option value="Credit/Debit Card">Credit / Debit Card (Visa / Mastercard / RuPay)</option>
                        <option value="Net Banking">Net Banking (HDFC, SBI, ICICI, Axis)</option>
                      </select>
                    </div>

                    {onlinePayMode === 'Online UPI' && (
                      <div className="form-group">
                        <label className="form-label">Virtual Payment Address (VPA / UPI ID) *</label>
                        <input type="text" className="form-input" value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="username@upi" required />
                      </div>
                    )}

                    {onlinePayMode === 'Credit/Debit Card' && (
                      <div className="form-group">
                        <label className="form-label">Card Number &amp; Expiry *</label>
                        <input type="text" className="form-input" value={cardNumber} onChange={e => setCardNumber(e.target.value)} required />
                      </div>
                    )}

                    {onlinePayMode === 'Net Banking' && (
                      <div className="form-group">
                        <label className="form-label">Select Banking Partner *</label>
                        <select className="form-select" value={bankName} onChange={e => setBankName(e.target.value)}>
                          <option value="HDFC Bank">HDFC Bank NetBanking</option>
                          <option value="State Bank of India">State Bank of India (SBI)</option>
                          <option value="ICICI Bank">ICICI Bank Internet Banking</option>
                          <option value="Axis Bank">Axis Bank NetBanking</option>
                        </select>
                      </div>
                    )}

                    <div style={{ background: 'var(--bg-surface-hover)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <ShieldCheck size={16} color="#10B981" />
                      <span>Zero transaction surcharge applied. Receipt auto-generated on completion.</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                      <button type="button" className="btn btn-secondary" onClick={() => setIsOnlinePaymentModalOpen(false)}>Cancel</button>
                      <button type="submit" className="btn btn-primary">
                        Proceed to Pay ₹{onlinePayAmount.toLocaleString()}
                      </button>
                    </div>
                  </form>
                </>
              )}

              {paymentGatewayStep === 'PROCESSING' && (
                <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                  <RefreshCw size={42} color="var(--brand-orange)" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                    Processing Bank Transaction...
                  </h3>
                  <p style={{ fontSize: '0.84375rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    Connecting to {onlinePayMode} Gateway. Please do not refresh or close the page.
                  </p>
                </div>
              )}

              {paymentGatewayStep === 'SUCCESS' && (
                <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                  <CheckCircle2 size={54} color="#10B981" style={{ margin: '0 auto 1rem' }} />
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                    Payment Successful!
                  </h3>
                  <p style={{ fontSize: '0.84375rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    Your fee account has been updated and an official receipt has been issued.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Fee Receipt Modal */}
        <FeeReceiptModal
          isOpen={!!selectedTransactionForReceipt}
          onClose={() => setSelectedTransactionForReceipt(null)}
          transaction={selectedTransactionForReceipt}
          feeRecord={studentFee}
        />
      </div>
    );
  }

  // 3. Admin View Screen
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
            Fees &amp; Financial Management Admin Portal
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Manage fee structures, due dates, late fees, record payments &amp; issue refunds
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => setIsReportModalOpen(true)}>
            <FileText size={16} /> Generate Fee Report
          </button>
          <button className="btn btn-secondary" onClick={handleExportCSVReport}>
            <Download size={16} /> Export Financial Ledger (CSV)
          </button>
          <button className="btn btn-secondary" onClick={() => setIsAddStructureModalOpen(true)}>
            <Plus size={16} /> Add Fee Structure
          </button>
        </div>
      </div>

      {/* Financial KPI Summary Cards */}
      <div className="grid-4">
        <StatCard
          title="Total Fee Demand"
          value={`₹${(financeStats.totalDemand / 100000).toFixed(2)} L`}
          subtitle={`${financeStats.totalRecordsCount} student fee accounts`}
          icon={IndianRupee}
          colorScheme="navy"
        />
        <StatCard
          title="Collected Fees"
          value={`₹${(financeStats.totalCollected / 100000).toFixed(2)} L`}
          subtitle={`${financeStats.collectionPercentage}% collection rate`}
          icon={CheckCircle2}
          colorScheme="green"
        />
        <StatCard
          title="Pending Dues"
          value={`₹${(financeStats.totalPending / 100000).toFixed(2)} L`}
          subtitle="Outstanding balance"
          icon={IndianRupee}
          colorScheme="orange"
        />
        <StatCard
          title="Overdue Accounts"
          value={financeStats.overdueCount}
          subtitle="Past due deadline"
          icon={AlertTriangle}
          colorScheme="gold"
        />
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="card" style={{ padding: '0.75rem 1rem', display: 'flex', gap: '0.5rem' }}>
        <button
          className={`btn btn-sm ${activeTab === 'DIRECTORY' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('DIRECTORY')}
        >
          Student Fee Directory ({feeRecords.length})
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'STRUCTURES' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('STRUCTURES')}
        >
          Fee Structures ({feeStructures.length})
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'TRANSACTIONS' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('TRANSACTIONS')}
        >
          Payment Transactions ({paymentTransactions.length})
        </button>
      </div>

      {/* Sub-Tab 1: Student Fee Directory */}
      {activeTab === 'DIRECTORY' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Filters Bar */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div className="grid-4">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Program</label>
                <select className="form-select" value={selectedProgFilter} onChange={e => setSelectedProgFilter(e.target.value)}>
                  <option value="ALL">All Programs</option>
                  {programs.map(p => <option key={p.id} value={p.id}>{p.code}</option>)}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Semester</label>
                <select className="form-select" value={selectedSemFilter} onChange={e => setSelectedSemFilter(e.target.value)}>
                  <option value="ALL">All Semesters</option>
                  {semesters.map(s => <option key={s.id} value={s.id}>{s.code}</option>)}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Payment Status</label>
                <select className="form-select" value={selectedStatusFilter} onChange={e => setSelectedStatusFilter(e.target.value)}>
                  <option value="ALL">All Statuses</option>
                  <option value="PAID">PAID</option>
                  <option value="PARTIAL">PARTIAL</option>
                  <option value="PENDING">PENDING</option>
                  <option value="OVERDUE">OVERDUE</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Search Student</label>
                <div style={{ position: 'relative' }}>
                  <input type="text" className="form-input" placeholder="Search name or ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ paddingLeft: '2.2rem' }} />
                  <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Directory Table */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Enrollment &amp; Student</th>
                    <th>Program &amp; Sem</th>
                    <th>Due Date</th>
                    <th>Total Demand</th>
                    <th>Paid Amount</th>
                    <th>Pending Balance</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFeeRecords.map(rec => {
                    const prog = db.getProgramById(rec.programId);
                    const sem = db.getSemesterById(rec.semesterId);

                    return (
                      <tr key={rec.id}>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>{rec.studentName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--brand-orange)', fontWeight: 700 }}>{rec.enrollmentNo}</div>
                        </td>
                        <td><Badge variant="orange">{prog?.code || 'B.Tech'} • {sem?.code || 'Sem 4'}</Badge></td>
                        <td style={{ fontSize: '0.8125rem' }}>{rec.dueDate}</td>
                        <td style={{ fontWeight: 700 }}>₹{rec.totalAmount.toLocaleString()}</td>
                        <td style={{ fontWeight: 700, color: '#10B981' }}>₹{rec.paidAmount.toLocaleString()}</td>
                        <td style={{ fontWeight: 800, color: rec.pendingAmount > 0 ? '#EF4444' : 'var(--text-muted)' }}>
                          ₹{rec.pendingAmount.toLocaleString()}
                        </td>
                        <td>{getStatusBadge(rec.status)}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button className="btn btn-primary btn-sm" onClick={() => handleOpenRecordPayment(rec)}>
                              Record Payment
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => setDeletingRecord(rec)}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Fee Structures */}
      {activeTab === 'STRUCTURES' && (
        <div className="grid-2">
          {feeStructures.map(fs => {
            const prog = db.getProgramById(fs.programId);
            const sem = db.getSemesterById(fs.semesterId);

            return (
              <div key={fs.id} className="card card-hover" style={{ padding: '1.5rem', borderLeft: '4px solid var(--brand-navy)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <Badge variant="orange">{prog?.code} • {sem?.code}</Badge>
                  <Badge variant="active">{fs.status}</Badge>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1rem' }}>
                  ₹{fs.totalAmount.toLocaleString()} <span style={{ fontSize: '0.84375rem', fontWeight: 500, color: 'var(--text-muted)' }}>/ Semester</span>
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.84375rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Tuition Fee:</span> <strong>₹{fs.tuitionFee.toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Lab &amp; Equipment Fee:</span> <strong>₹{fs.labFee.toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Development Fee:</span> <strong>₹{fs.developmentFee.toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Hostel Fee:</span> <strong>₹{(fs.hostelFee || 0).toLocaleString()}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sub-Tab 3: Payment Transactions Log & Refund Action */}
      {activeTab === 'TRANSACTIONS' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Receipt No</th>
                  <th>Student Name</th>
                  <th>Enrollment</th>
                  <th>Date</th>
                  <th>Payment Mode</th>
                  <th>Tx ID</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paymentTransactions.map(tx => (
                  <tr key={tx.id}>
                    <td><code style={{ fontWeight: 700, color: 'var(--brand-orange)' }}>{tx.receiptNo}</code></td>
                    <td style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>{tx.studentName}</td>
                    <td>{tx.enrollmentNo}</td>
                    <td>{tx.paymentDate}</td>
                    <td><Badge variant="orange">{tx.paymentMode}</Badge></td>
                    <td><code>{tx.transactionId}</code></td>
                    <td style={{ fontWeight: 800, color: tx.status === 'REFUNDED' ? '#EF4444' : '#10B981' }}>
                      ₹{tx.paidAmount.toLocaleString()}
                    </td>
                    <td>
                      <Badge variant={tx.status === 'SUCCESS' || !tx.status ? 'active' : tx.status === 'REFUNDED' ? 'inactive' : 'danger'}>
                        {tx.status || 'SUCCESS'}
                      </Badge>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="btn btn-primary btn-sm" onClick={() => setSelectedTransactionForReceipt(tx)}>
                          <FileText size={14} /> Receipt
                        </button>
                        {tx.status !== 'REFUNDED' && (
                          <button className="btn btn-secondary btn-sm" style={{ color: '#EF4444' }} onClick={() => setRefundingTx(tx)}>
                            <RotateCcw size={14} /> Refund
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {isRecordPaymentModalOpen && selectedRecordForPayment && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '0.35rem' }}>
              Record Payment Transaction
            </h3>
            <div style={{ fontSize: '0.84375rem', color: 'var(--brand-orange)', fontWeight: 700, marginBottom: '1.25rem' }}>
              {selectedRecordForPayment.studentName} ({selectedRecordForPayment.enrollmentNo})
            </div>

            <form onSubmit={handleSavePaymentTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Payment Amount (₹) *</label>
                  <input type="number" className="form-input" min={100} value={payAmount} onChange={e => setPayAmount(Number(e.target.value))} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Mode *</label>
                  <select className="form-select" value={payMode} onChange={e => setPayMode(e.target.value as any)}>
                    <option value="Online UPI">Online UPI</option>
                    <option value="Credit/Debit Card">Credit/Debit Card</option>
                    <option value="Net Banking">Net Banking</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Demand Draft">Demand Draft</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Transaction Ref ID / Cheque No *</label>
                <input type="text" className="form-input" value={payTxId} onChange={e => setPayTxId(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Payment Date *</label>
                <input type="date" className="form-input" value={payDate} onChange={e => setPayDate(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Remarks / Accounting Notes</label>
                <textarea className="form-input" rows={2} value={payRemarks} onChange={e => setPayRemarks(e.target.value)} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsRecordPaymentModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save &amp; Generate Receipt</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Fee Structure Modal */}
      {isAddStructureModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '520px', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1.25rem' }}>
              Create Program Fee Structure
            </h3>

            <form onSubmit={handleCreateFeeStructure} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Program *</label>
                  <select className="form-select" value={structProgId} onChange={e => setStructProgId(e.target.value)}>
                    {programs.map(p => <option key={p.id} value={p.id}>{p.code}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Semester *</label>
                  <select className="form-select" value={structSemId} onChange={e => setStructSemId(e.target.value)}>
                    {semesters.map(s => <option key={s.id} value={s.id}>{s.code}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Tuition Fee (₹) *</label>
                  <input type="number" className="form-input" value={structTuition} onChange={e => setStructTuition(Number(e.target.value))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Lab Fee (₹) *</label>
                  <input type="number" className="form-input" value={structLab} onChange={e => setStructLab(Number(e.target.value))} required />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Development Fee (₹) *</label>
                  <input type="number" className="form-input" value={structDev} onChange={e => setStructDev(Number(e.target.value))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Exam Fee (₹)</label>
                  <input type="number" className="form-input" value={structExam} onChange={e => setStructExam(Number(e.target.value))} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddStructureModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Publish Fee Structure</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Record Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deletingRecord}
        onClose={() => setDeletingRecord(null)}
        onConfirm={handleDeleteFeeRecordConfirm}
        title="Delete Fee Record"
        message={`Are you sure you want to delete fee record for "${deletingRecord?.studentName}"?`}
      />

      {/* Refund Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!refundingTx}
        onClose={() => setRefundingTx(null)}
        onConfirm={handleRefundConfirm}
        title="Confirm Transaction Refund"
        message={`Are you sure you want to refund ₹${refundingTx?.paidAmount.toLocaleString()} for transaction ${refundingTx?.receiptNo}? This will re-add the amount to the student's pending fee balance.`}
      />

      {/* Fee Receipt Modal */}
      <FeeReceiptModal
        isOpen={!!selectedTransactionForReceipt}
        onClose={() => setSelectedTransactionForReceipt(null)}
        transaction={selectedTransactionForReceipt}
      />

      {/* Dashboard Report Modal */}
      <DashboardReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        dashboardType="FEES"
        currentFilters={{
          programId: selectedProgFilter,
          semesterId: selectedSemFilter,
          paymentStatus: selectedStatusFilter as any,
          searchQuery: searchTerm
        }}
        user={user}
        role={role}
      />
    </div>
  );
};
