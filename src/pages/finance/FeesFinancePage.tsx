import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Badge } from '../../components/common/Badge';
import { StatCard } from '../../components/common/StatCard';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { FeeReceiptModal } from '../../components/finance/FeeReceiptModal';
import { DashboardReportModal } from '../../components/reports/DashboardReportModal';
import { FeeHeadManagementTab } from '../../components/finance/FeeHeadManagementTab';
import { FeeStructureManagementTab } from '../../components/finance/FeeStructureManagementTab';
import { FeeAssignmentTab } from '../../components/finance/FeeAssignmentTab';
import { StudentFeeAccountModal } from '../../components/finance/StudentFeeAccountModal';
import { FeeInvoiceManagementTab } from '../../components/finance/FeeInvoiceManagementTab';
import { FeeInvoiceViewModal } from '../../components/finance/FeeInvoiceViewModal';
import { OnlinePaymentModal } from '../../components/finance/OnlinePaymentModal';
import { FeeQueryModal } from '../../components/finance/FeeQueryModal';
import { FeeQueryResolveModal } from '../../components/finance/FeeQueryResolveModal';
import { feeQueryService } from '../../services/feeQueryService';
import { FeeQuery } from '../../types/feeQuery';
import { 
  FeeStructure, StudentFeeRecord, FeeInvoice, FeePaymentTransaction, PaymentMode, FeePaymentStatus 
} from '../../types';
import { 
  IndianRupee, CreditCard, FileText, CheckCircle2, Clock, 
  AlertTriangle, Plus, Search, Download, Printer, Trash2, ShieldAlert,
  Calendar, RotateCcw, ShieldCheck, Check, RefreshCw, Eye,
  AlertCircle, XCircle, HelpCircle, MessageSquare
} from 'lucide-react';
import { exportToExcel } from '../../services/exportService';

interface FeesFinancePageProps {
  initialStudentTab?: 'MY_FEES' | 'PAYMENT_HISTORY' | 'FEE_QUERIES';
  initialRecordId?: string;
}

export const FeesFinancePage: React.FC<FeesFinancePageProps> = ({ initialStudentTab = 'MY_FEES', initialRecordId }) => {
  const { user, role } = useAuth();

  const programs = db.getPrograms();
  const semesters = db.getSemesters();
  const feeStructures = db.getFeeStructures();
  const feeRecords = db.getStudentFeeRecords();
  const paymentTransactions = db.getFeePaymentTransactions();

  const financeStats = db.getFinanceOverviewStats();

  const feeHeads = db.getFeeHeads();
  const [activeTab, setActiveTab] = useState<'FEE_HEADS' | 'STRUCTURES' | 'ASSIGNMENT' | 'INVOICES' | 'DIRECTORY' | 'TRANSACTIONS' | 'LATE_FEES' | 'FAILED_PAYMENTS' | 'FEE_QUERIES'>('FEE_HEADS');
  const [studentTab, setStudentTab] = useState<'MY_FEES' | 'PAYMENT_HISTORY' | 'FEE_QUERIES'>(initialStudentTab);

  React.useEffect(() => {
    if (initialStudentTab) {
      setStudentTab(initialStudentTab);
    }
  }, [initialStudentTab]);

  React.useEffect(() => {
    if (initialRecordId) {
      const matchFee = feeRecords.find(f => f.id === initialRecordId || f.studentId === initialRecordId || f.enrollmentNo === initialRecordId);
      if (matchFee) {
        setViewingFeeRecord(matchFee);
      }
    }
  }, [initialRecordId, feeRecords]);
  const [isFeeQueryModalOpen, setIsFeeQueryModalOpen] = useState(false);
  const [resolvingFeeQuery, setResolvingFeeQuery] = useState<FeeQuery | null>(null);
  const [feeQueryFilterCategory, setFeeQueryFilterCategory] = useState('ALL');
  const [feeQueryFilterStatus, setFeeQueryFilterStatus] = useState('ALL');
  const [feeQuerySearch, setFeeQuerySearch] = useState('');
  const [viewingFeeRecord, setViewingFeeRecord] = useState<StudentFeeRecord | null>(null);
  const [viewingStudentInvoice, setViewingStudentInvoice] = useState<FeeInvoice | null>(null);
  const [payingInvoice, setPayingInvoice] = useState<FeeInvoice | null>(null);

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

    const progObj = programs.find(p => p.id === structProgId);
    const semObj = semesters.find(s => s.id === structSemId);

    db.addEntity<FeeStructure>('feeStructures', {
      structureCode: `FS-${progObj?.code || 'PRG'}-${semObj?.code || 'SEM'}-2026-V1`,
      name: `${progObj?.name || 'Program'} ${semObj?.code || 'Semester'} Fee`,
      academicYearCode: '2026-27',
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
    const headers = ['Receipt No', 'Student Name', 'Enrollment No', 'Date', 'Payment Mode', 'Transaction Ref', 'Amount (₹)', 'Status'];
    const rows = paymentTransactions.map(t => [
      t.receiptNo,
      t.studentName,
      t.enrollmentNo,
      t.paymentDate,
      t.paymentMode,
      t.transactionId,
      t.paidAmount,
      t.status || 'SUCCESS'
    ]);

    exportToExcel(
      `Fee_Transactions_Report_${new Date().toISOString().split('T')[0]}`,
      headers,
      rows,
      { departmentName: 'Accounts & Finance Department' },
      {
        name: user?.name || 'Accounts Head',
        role: (role as any) || 'SUPER_ADMIN'
      }
    );
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
    const studentQueries = feeQueryService.getScopedQueries(user, role);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {/* Student Portal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <IndianRupee size={28} style={{ color: 'var(--brand-orange)' }} />
              Student Fees, Payment &amp; Accounts Portal
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Semester-wise fee breakdown, online payment gateway, verified downloadable receipts, and direct Accounts fee query desk
            </p>
          </div>

          {/* Subtabs for Student */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button 
              className={`btn ${studentTab === 'MY_FEES' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setStudentTab('MY_FEES')}
            >
              <FileText size={16} /> My Fees &amp; Demands
            </button>
            <button 
              className={`btn ${studentTab === 'PAYMENT_HISTORY' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setStudentTab('PAYMENT_HISTORY')}
            >
              <Clock size={16} /> Payment History &amp; Receipts ({studentTxs.length})
            </button>
            <button 
              className={`btn ${studentTab === 'FEE_QUERIES' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setStudentTab('FEE_QUERIES')}
            >
              <HelpCircle size={16} /> Fee Queries ({studentQueries.length})
            </button>
          </div>
        </div>

        {/* ────────────────────────────────────────────────────────────────────────── */}
        {/* SUBTAB 1: MY FEES */}
        {/* ────────────────────────────────────────────────────────────────────────── */}
        {studentTab === 'MY_FEES' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              {/* Semester Selection Filter */}
              <div className="card" style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', margin: 0, flex: 1 }}>
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

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  className="btn btn-primary"
                  onClick={() => handleOpenStudentOnlinePayment(studentFee, 'SEMESTER')}
                >
                  <CreditCard size={16} /> Pay Semester Fees (₹{studentFee?.pendingAmount.toLocaleString()})
                </button>
                <button 
                  className="btn btn-navy"
                  onClick={() => handleOpenStudentOnlinePayment(studentFee, 'EXAM')}
                >
                  <IndianRupee size={16} /> Pay Exam Fee (₹1,200)
                </button>
              </div>
            </div>

            {/* Student KPI Cards */}
            <div className="grid-5" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--brand-navy)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>TOTAL FEES</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--brand-navy)', marginTop: '0.25rem' }}>
                  ₹{studentFee?.totalAmount.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Assigned Semester Base</div>
              </div>

              <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #10B981' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>PAID SETTLED</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#10B981', marginTop: '0.25rem' }}>
                  ₹{studentFee?.paidAmount.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Gateway Verified</div>
              </div>

              <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--brand-orange)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>PENDING DUE</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--brand-orange)', marginTop: '0.25rem' }}>
                  ₹{studentFee?.pendingAmount.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Due: {studentFee?.dueDate}</div>
              </div>

              <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #EF4444' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>OVERDUE LATE FEE</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: lateFee > 0 ? '#EF4444' : 'var(--brand-navy)', marginTop: '0.25rem' }}>
                  {lateFee > 0 ? `+₹${lateFee.toLocaleString()}` : '₹0'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  {daysOverdue > 0 ? `${daysOverdue} Days Overdue` : 'No Penalties'}
                </div>
              </div>

              <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #8B5CF6' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>TOTAL PAYABLE NOW</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#8B5CF6', marginTop: '0.25rem' }}>
                  ₹{(studentFee ? studentFee.pendingAmount + lateFee : 0).toLocaleString()}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Calculated by Backend</div>
              </div>
            </div>

            {/* Fee-Wise Breakdown Table as Required by Section 1 */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--brand-navy)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={18} color="var(--brand-orange)" /> Itemized Semester Fee Heads &amp; Breakdown
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Academic Year: <strong>2026-27</strong> • Semester: <strong>Semester 4</strong>
                </span>
              </div>

              <div className="table-responsive">
                <table className="table" style={{ fontSize: '0.85rem' }}>
                  <thead>
                    <tr>
                      <th>Fee Head</th>
                      <th>Academic Year</th>
                      <th>Semester</th>
                      <th style={{ textAlign: 'right' }}>Original Amount</th>
                      <th style={{ textAlign: 'right' }}>Concession</th>
                      <th style={{ textAlign: 'right' }}>Late Fee</th>
                      <th style={{ textAlign: 'right' }}>Total Payable</th>
                      <th style={{ textAlign: 'right' }}>Paid Amount</th>
                      <th style={{ textAlign: 'right' }}>Pending Amount</th>
                      <th>Due Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Tuition Fee</strong></td>
                      <td>2026-27</td>
                      <td>Sem 4</td>
                      <td style={{ textAlign: 'right' }}>₹{studentFee?.tuitionFee.toLocaleString()}</td>
                      <td style={{ textAlign: 'right', color: '#10B981' }}>-₹0</td>
                      <td style={{ textAlign: 'right', color: lateFee > 0 ? '#EF4444' : 'inherit' }}>+₹{lateFee > 0 ? Math.round(lateFee * 0.6) : 0}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{(studentFee?.tuitionFee || 0) + (lateFee > 0 ? Math.round(lateFee * 0.6) : 0)}</td>
                      <td style={{ textAlign: 'right', color: '#10B981', fontWeight: 600 }}>₹{Math.min(studentFee?.paidAmount || 0, studentFee?.tuitionFee || 0).toLocaleString()}</td>
                      <td style={{ textAlign: 'right', color: 'var(--brand-orange)', fontWeight: 700 }}>₹{Math.max(0, (studentFee?.tuitionFee || 0) - (studentFee?.paidAmount || 0))}</td>
                      <td>{studentFee?.dueDate}</td>
                      <td><Badge variant={studentFee?.paidAmount && studentFee.paidAmount >= (studentFee?.tuitionFee || 0) ? 'success' : 'gold'}>{studentFee?.paidAmount && studentFee.paidAmount >= (studentFee?.tuitionFee || 0) ? 'PAID' : 'PARTIALLY_PAID'}</Badge></td>
                    </tr>
                    <tr>
                      <td><strong>Lab &amp; Computing Infrastructure Fee</strong></td>
                      <td>2026-27</td>
                      <td>Sem 4</td>
                      <td style={{ textAlign: 'right' }}>₹{studentFee?.labFee.toLocaleString()}</td>
                      <td style={{ textAlign: 'right', color: '#10B981' }}>-₹0</td>
                      <td style={{ textAlign: 'right', color: lateFee > 0 ? '#EF4444' : 'inherit' }}>+₹{lateFee > 0 ? Math.round(lateFee * 0.2) : 0}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{(studentFee?.labFee || 0) + (lateFee > 0 ? Math.round(lateFee * 0.2) : 0)}</td>
                      <td style={{ textAlign: 'right', color: '#10B981', fontWeight: 600 }}>₹{studentFee?.status === 'PAID' ? studentFee.labFee : 0}</td>
                      <td style={{ textAlign: 'right', color: 'var(--brand-orange)', fontWeight: 700 }}>₹{studentFee?.status === 'PAID' ? 0 : studentFee?.labFee}</td>
                      <td>{studentFee?.dueDate}</td>
                      <td><Badge variant={studentFee?.status === 'PAID' ? 'success' : 'gold'}>{studentFee?.status === 'PAID' ? 'PAID' : 'PENDING'}</Badge></td>
                    </tr>
                    <tr>
                      <td><strong>Campus Development Fee</strong></td>
                      <td>2026-27</td>
                      <td>Sem 4</td>
                      <td style={{ textAlign: 'right' }}>₹{studentFee?.developmentFee.toLocaleString()}</td>
                      <td style={{ textAlign: 'right', color: '#10B981' }}>-₹0</td>
                      <td style={{ textAlign: 'right', color: lateFee > 0 ? '#EF4444' : 'inherit' }}>+₹{lateFee > 0 ? Math.round(lateFee * 0.2) : 0}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{(studentFee?.developmentFee || 0) + (lateFee > 0 ? Math.round(lateFee * 0.2) : 0)}</td>
                      <td style={{ textAlign: 'right', color: '#10B981', fontWeight: 600 }}>₹{studentFee?.status === 'PAID' ? studentFee.developmentFee : 0}</td>
                      <td style={{ textAlign: 'right', color: 'var(--brand-orange)', fontWeight: 700 }}>₹{studentFee?.status === 'PAID' ? 0 : studentFee?.developmentFee}</td>
                      <td>{studentFee?.dueDate}</td>
                      <td><Badge variant={studentFee?.status === 'PAID' ? 'success' : 'gold'}>{studentFee?.status === 'PAID' ? 'PAID' : 'PENDING'}</Badge></td>
                    </tr>
                    {studentFee?.hostelFee && studentFee.hostelFee > 0 ? (
                      <tr>
                        <td><strong>Hostel &amp; Dining Fee</strong></td>
                        <td>2026-27</td>
                        <td>Sem 4</td>
                        <td style={{ textAlign: 'right' }}>₹{studentFee.hostelFee.toLocaleString()}</td>
                        <td style={{ textAlign: 'right', color: '#10B981' }}>-₹0</td>
                        <td style={{ textAlign: 'right' }}>+₹0</td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{studentFee.hostelFee.toLocaleString()}</td>
                        <td style={{ textAlign: 'right', color: '#10B981', fontWeight: 600 }}>₹{studentFee.hostelFee.toLocaleString()}</td>
                        <td style={{ textAlign: 'right', color: 'var(--brand-orange)', fontWeight: 700 }}>₹0</td>
                        <td>{studentFee.dueDate}</td>
                        <td><Badge variant="success">PAID</Badge></td>
                      </tr>
                    ) : null}
                  </tbody>
                  <tfoot>
                    <tr style={{ backgroundColor: '#F8FAFC', fontWeight: 800, borderTop: '2px solid var(--border-color)' }}>
                      <td colSpan={3}>TOTAL SUMMARY DEMAND</td>
                      <td style={{ textAlign: 'right' }}>₹{studentFee?.totalAmount.toLocaleString()}</td>
                      <td style={{ textAlign: 'right', color: '#10B981' }}>-₹0</td>
                      <td style={{ textAlign: 'right', color: lateFee > 0 ? '#EF4444' : 'inherit' }}>+₹{lateFee.toLocaleString()}</td>
                      <td style={{ textAlign: 'right', color: '#8B5CF6' }}>₹{(studentFee ? studentFee.totalAmount + lateFee : 0).toLocaleString()}</td>
                      <td style={{ textAlign: 'right', color: '#10B981' }}>₹{studentFee?.paidAmount.toLocaleString()}</td>
                      <td style={{ textAlign: 'right', color: 'var(--brand-orange)' }}>₹{(studentFee ? studentFee.pendingAmount + lateFee : 0).toLocaleString()}</td>
                      <td>{studentFee?.dueDate}</td>
                      <td>{getStatusBadge(studentFee?.status || 'PENDING')}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Official Fee Invoices & Demand Notices */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={18} color="var(--brand-orange)" /> My Official Fee Invoices &amp; Demand Notices
              </h3>

              <div className="table-responsive">
                <table className="table" style={{ fontSize: '0.825rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th style={{ padding: '0.75rem' }}>Invoice Number</th>
                      <th style={{ padding: '0.75rem' }}>Invoice Date</th>
                      <th style={{ padding: '0.75rem' }}>Due Date</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right' }}>Invoiced Amount</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center' }}>Status</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {db.getFeeInvoicesByStudentId(studentId).length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                          No official fee demand notices issued for your account yet.
                        </td>
                      </tr>
                    ) : (
                      db.getFeeInvoicesByStudentId(studentId).map(inv => {
                        const lateFeeInfo = db.getInvoiceLateFeeInfo(inv.id);
                        return (
                          <tr key={inv.id} style={{ background: lateFeeInfo.isOverdue ? '#fff9f9' : undefined }}>
                            <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontWeight: 800, color: '#1e40af' }}>
                              {inv.invoiceNumber}
                              {lateFeeInfo.isOverdue && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.25rem' }}>
                                  <AlertCircle size={12} color="#ef4444" />
                                  <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 600 }}>{lateFeeInfo.overdueDays} days overdue</span>
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '0.75rem' }}>{inv.invoiceDate}</td>
                            <td style={{ padding: '0.75rem', fontWeight: 700, color: lateFeeInfo.isOverdue ? '#ef4444' : '#b91c1c' }}>{inv.dueDate}</td>
                            <td style={{ padding: '0.75rem', textAlign: 'right', fontFamily: 'monospace', fontWeight: 800 }}>
                              ₹{Number(inv.totalAmount).toLocaleString('en-IN')}
                              {lateFeeInfo.lateFeeAmount > 0 && (
                                <div style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: '0.2rem' }}>+₹{lateFeeInfo.lateFeeAmount.toLocaleString()} late fee</div>
                              )}
                            </td>
                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                              <Badge variant={inv.status === 'ISSUED' ? 'success' : inv.status === 'CANCELLED' ? 'danger' : inv.status === 'OVERDUE' ? 'danger' : 'gold'}>
                                {inv.status}
                              </Badge>
                            </td>
                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                              <div style={{ display: 'inline-flex', gap: '0.35rem', alignItems: 'center' }}>
                                <button
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => setViewingStudentInvoice(inv)}
                                >
                                  <Eye size={13} /> View
                                </button>
                                {(inv.status === 'ISSUED' || inv.status === 'PARTIALLY_PAID' || inv.status === 'OVERDUE') && (
                                  <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => setPayingInvoice(inv)}
                                  >
                                    <CreditCard size={13} /> {lateFeeInfo.isOverdue ? 'Pay + Late Fee' : 'Pay Now'}
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
          </div>
        )}

        {/* ────────────────────────────────────────────────────────────────────────── */}
        {/* SUBTAB 2: PAYMENT HISTORY & RECEIPTS */}
        {/* ────────────────────────────────────────────────────────────────────────── */}
        {studentTab === 'PAYMENT_HISTORY' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
                            <button className="btn btn-sm btn-secondary" onClick={() => setSelectedTransactionForReceipt(tx)}>
                              <FileText size={14} /> View Receipt
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Failed Payment History (Student View) */}
            {(() => {
              const failedTxs = db.getFailedPayments(studentId);
              if (failedTxs.length === 0) return null;
              return (
                <div className="card" style={{ padding: '1.5rem', border: '1.5px solid #fecaca' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#b91c1c', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <XCircle size={18} color="#ef4444" /> Failed Payment Attempts
                  </h3>
                  <div style={{ background: '#fff9f9', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.85rem 1rem', marginBottom: '1rem', fontSize: '0.8125rem', lineHeight: 1.6 }}>
                    <strong>Note:</strong> These payments were <strong>not processed</strong>. Your fee account balance and invoice status are unchanged. You can safely retry payment.
                  </div>
                  <div className="table-responsive">
                    <table className="table" style={{ fontSize: '0.8125rem' }}>
                      <thead>
                        <tr>
                          <th>Transaction No.</th>
                          <th>Date</th>
                          <th>Amount</th>
                          <th>Failure Reason</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {failedTxs.map(tx => (
                          <tr key={tx.id}>
                            <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>{tx.transactionNo}</td>
                            <td>{tx.paymentDate}</td>
                            <td style={{ fontWeight: 800, color: '#ef4444' }}>₹{Number(tx.paidAmount).toLocaleString('en-IN')}</td>
                            <td>
                              <div style={{ color: '#92400e', background: '#fef3c7', padding: '0.2rem 0.6rem', borderRadius: '4px', display: 'inline-block', fontSize: '0.75rem' }}>
                                {db.getFriendlyFailureReason(tx.failureReason)}
                              </div>
                            </td>
                            <td>
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => {
                                  const invForRetry = db.getFeeInvoices().find((i: any) => i.id === tx.invoiceId);
                                  if (invForRetry) setPayingInvoice(invForRetry);
                                }}
                              >
                                <RefreshCw size={13} /> Retry Payment
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ────────────────────────────────────────────────────────────────────────── */}
        {/* SUBTAB 3: FEE QUERIES (Accounts Directorate) */}
        {/* ────────────────────────────────────────────────────────────────────────── */}
        {studentTab === 'FEE_QUERIES' && (
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--brand-navy)', margin: 0 }}>
                  Accounts &amp; Fee Inquiry Desk
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                  Direct communication with the University Accounts Directorate for fee concessions, missing payments, and refund disputes
                </p>
              </div>

              <button className="btn btn-primary" onClick={() => setIsFeeQueryModalOpen(true)}>
                <Plus size={16} /> Submit New Fee Query
              </button>
            </div>

            {studentQueries.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                <HelpCircle size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                <p style={{ fontSize: '1rem', fontWeight: 600 }}>No fee queries submitted.</p>
                <p style={{ fontSize: '0.85rem' }}>If you have any discrepancy regarding fee amounts, late fees, or online payments, click Submit New Fee Query.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table" style={{ fontSize: '0.85rem' }}>
                  <thead>
                    <tr>
                      <th>Query ID</th>
                      <th>Category</th>
                      <th>Subject</th>
                      <th>Priority</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Accounts Resolution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentQueries.map(q => (
                      <tr key={q.id}>
                        <td style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>{q.queryNo}</td>
                        <td><Badge variant="navy">{q.category.replace(/_/g, ' ')}</Badge></td>
                        <td>
                          <strong>{q.subject}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {q.description}
                          </div>
                        </td>
                        <td>
                          <Badge variant={q.priority === 'URGENT' ? 'danger' : q.priority === 'HIGH' ? 'warning' : 'navy'}>
                            {q.priority}
                          </Badge>
                        </td>
                        <td>{new Date(q.createdAt).toLocaleDateString()}</td>
                        <td>
                          <Badge variant={q.status === 'RESOLVED' ? 'success' : q.status === 'UNDER_REVIEW' ? 'active' : q.status === 'REJECTED' ? 'danger' : 'gold'}>
                            {q.status.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td>
                          {q.resolutionSummary ? (
                            <div style={{ fontSize: '0.8rem', color: 'var(--brand-green)', fontWeight: 600 }}>
                              {q.resolutionSummary}
                              {q.assignedAccountsHandlerName && (
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>By: {q.assignedAccountsHandlerName}</div>
                              )}
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assigned to Accounts Directorate</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

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
                        <label className="form-label">UPI ID *</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          value={upiId} 
                          onChange={e => setUpiId(e.target.value)} 
                          placeholder="e.g. name@okhdfcbank" 
                          required 
                        />
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                      <button type="button" className="btn btn-secondary" onClick={() => setIsOnlinePaymentModalOpen(false)}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Pay ₹{onlinePayAmount.toLocaleString()} Now
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

        {/* Student Fee Query Modal */}
        {isFeeQueryModalOpen && (
          <FeeQueryModal
            isOpen={isFeeQueryModalOpen}
            onClose={() => setIsFeeQueryModalOpen(false)}
            onSuccess={() => {
              setIsFeeQueryModalOpen(false);
            }}
          />
        )}
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
      <div className="card" style={{ padding: '0.75rem 1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          className={`btn btn-sm ${activeTab === 'FEE_HEADS' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('FEE_HEADS')}
        >
          Fee Head Master ({feeHeads.length})
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'STRUCTURES' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('STRUCTURES')}
        >
          Fee Structures ({feeStructures.length})
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'ASSIGNMENT' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('ASSIGNMENT')}
        >
          Fee Assignment
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'INVOICES' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('INVOICES')}
        >
          Fee Invoices
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'DIRECTORY' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('DIRECTORY')}
        >
          Student Fee Directory ({feeRecords.length})
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'TRANSACTIONS' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('TRANSACTIONS')}
        >
          Payment Transactions ({paymentTransactions.length})
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'LATE_FEES' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('LATE_FEES')}
          style={{ borderColor: '#f87171' }}
        >
          <AlertTriangle size={13} style={{ marginRight: '0.25rem', verticalAlign: 'text-bottom' }} />
          Overdue & Late Fees
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'FAILED_PAYMENTS' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('FAILED_PAYMENTS')}
          style={{ borderColor: '#fbbf24' }}
        >
          <XCircle size={13} style={{ marginRight: '0.25rem', verticalAlign: 'text-bottom' }} />
          Failed Payments
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'FEE_QUERIES' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('FEE_QUERIES')}
          style={{ borderColor: 'var(--brand-orange)' }}
        >
          <HelpCircle size={13} style={{ marginRight: '0.25rem', verticalAlign: 'text-bottom' }} />
          Fee Queries ({db.getFeeQueries().length})
        </button>
      </div>

      {/* Sub-Tab 0: Fee Head Master */}
      {activeTab === 'FEE_HEADS' && <FeeHeadManagementTab />}

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
                            <button className="btn btn-secondary btn-sm" onClick={() => setViewingFeeRecord(rec)}>
                              View Ledger
                            </button>
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
      {activeTab === 'STRUCTURES' && <FeeStructureManagementTab />}

      {/* Sub-Tab 3: Student Fee Assignment (Phase 3) */}
      {activeTab === 'ASSIGNMENT' && <FeeAssignmentTab />}

      {/* Sub-Tab 4: Fee Invoices / Demands (Phase 4) */}
      {activeTab === 'INVOICES' && <FeeInvoiceManagementTab />}

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

      {/* Phase 7 — Sub-Tab: Overdue Invoices & Late Fee Rules */}
      {activeTab === 'LATE_FEES' && (() => {
        const allInvoices = db.getFeeInvoices ? db.getFeeInvoices() : [];
        const now = new Date();
        const overdueInvoices = allInvoices.filter((inv: any) =>
          inv.dueDate && new Date(inv.dueDate) < now && ['ISSUED', 'PARTIALLY_PAID', 'OVERDUE'].includes(inv.status)
        );
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Overdue Stats Banner */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #ef4444' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>OVERDUE INVOICES</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ef4444' }}>{overdueInvoices.length}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Past due date with balance</div>
              </div>
              <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #f97316' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>TOTAL OUTSTANDING</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f97316' }}>
                  ₹{overdueInvoices.reduce((sum: number, inv: any) => sum + Number(inv.totalAmount), 0).toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Across all overdue accounts</div>
              </div>
              <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #8b5cf6' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>LATE FEE ACCRUED</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#8b5cf6' }}>
                  ₹{overdueInvoices.reduce((sum: number, inv: any) => sum + Number(inv.lateFeeAmount || 0), 0).toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Based on applied late fee rules</div>
              </div>
            </div>

            {/* Overdue Invoices Table */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={18} color="#ef4444" /> Overdue Invoice Summary
              </h3>
              {overdueInvoices.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <CheckCircle2 size={40} color="#10b981" style={{ margin: '0 auto 1rem', display: 'block' }} />
                  <div style={{ fontWeight: 700 }}>No overdue invoices!</div>
                  <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>All invoices are within their due dates.</div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table" style={{ fontSize: '0.8125rem' }}>
                    <thead>
                      <tr>
                        <th>Invoice #</th>
                        <th>Student</th>
                        <th>Due Date</th>
                        <th>Days Overdue</th>
                        <th style={{ textAlign: 'right' }}>Invoice Total</th>
                        <th style={{ textAlign: 'right' }}>Late Fee</th>
                        <th style={{ textAlign: 'right' }}>Total Payable</th>
                        <th style={{ textAlign: 'center' }}>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overdueInvoices.map((inv: any) => {
                        const dueDate = new Date(inv.dueDate);
                        const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
                        const lateFee = Number(inv.lateFeeAmount || 0);
                        const totalPayable = Number(inv.totalAmount) + lateFee;
                        return (
                          <tr key={inv.id} style={{ background: daysOverdue > 30 ? '#fff5f5' : undefined }}>
                            <td><code style={{ fontWeight: 700, color: '#1e40af', fontSize: '0.8rem' }}>{inv.invoiceNumber}</code></td>
                            <td style={{ fontWeight: 600 }}>{inv.studentName || inv.studentId}</td>
                            <td style={{ color: '#ef4444', fontWeight: 700 }}>{inv.dueDate}</td>
                            <td>
                              <span style={{
                                padding: '0.2rem 0.5rem',
                                borderRadius: '99px',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                background: daysOverdue > 30 ? '#fee2e2' : '#fff3cd',
                                color: daysOverdue > 30 ? '#dc2626' : '#92400e',
                              }}>
                                {daysOverdue} days
                              </span>
                            </td>
                            <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>₹{Number(inv.totalAmount).toLocaleString('en-IN')}</td>
                            <td style={{ textAlign: 'right', fontFamily: 'monospace', color: lateFee > 0 ? '#ef4444' : 'var(--text-muted)', fontWeight: lateFee > 0 ? 800 : 400 }}>
                              {lateFee > 0 ? `+₹${lateFee.toLocaleString('en-IN')}` : '—'}
                            </td>
                            <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 900, color: '#b91c1c' }}>₹{totalPayable.toLocaleString('en-IN')}</td>
                            <td style={{ textAlign: 'center' }}>
                              <Badge variant="danger">{inv.status}</Badge>
                            </td>
                            <td>
                              <button className="btn btn-sm btn-secondary" onClick={() => setViewingStudentInvoice(inv)}>
                                <Eye size={13} /> View
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Late Fee Rules Info Panel */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={18} color="var(--brand-orange)" /> Late Fee Calculation Rules
              </h3>
              <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '1rem', marginBottom: '1rem', fontSize: '0.875rem', lineHeight: 1.7 }}>
                <strong>🔒 Backend-Enforced:</strong> Late fee rules are configured and calculated entirely on the server side using the <code>LateFeeService</code>.
                The available rule types are: <strong>PER_DAY</strong> (₹X per overdue day), <strong>FIXED</strong> (flat penalty), <strong>PERCENTAGE</strong> (% of invoice/outstanding), and <strong>ONE_TIME</strong> (single charge).
                A configurable <strong>grace period</strong> (days after due date before late fee begins) and a <strong>maximum cap</strong> are supported.
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                {[
                  { type: 'PER_DAY', label: 'Per Day', desc: '₹X per day after grace period. Increases with time.', color: '#3b82f6', bg: '#eff6ff' },
                  { type: 'FIXED', label: 'Fixed Penalty', desc: 'One-time flat fee triggered after due date. Constant.', color: '#8b5cf6', bg: '#f5f3ff' },
                  { type: 'PERCENTAGE', label: 'Percentage', desc: 'X% of invoice or outstanding balance. Capped at max.', color: '#f97316', bg: '#fff7ed' },
                  { type: 'ONE_TIME', label: 'One Time', desc: 'Applied once when due date passes. Never reapplied.', color: '#10b981', bg: '#ecfdf5' },
                ].map(r => (
                  <div key={r.type} style={{ background: r.bg, border: `1.5px solid ${r.color}30`, borderRadius: '8px', padding: '1rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 900, color: r.color, letterSpacing: '0.05em', marginBottom: '0.5rem' }}>{r.type}</div>
                    <div style={{ fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '0.25rem' }}>{r.label}</div>
                    <div style={{ fontSize: '0.78125rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{r.desc}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: '8px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                <strong>API Endpoints:</strong>
                <code style={{ display: 'block', margin: '0.5rem 0', color: 'var(--brand-navy)' }}>
                  GET /api/v1/late-fee-rules · POST /api/v1/late-fee-rules · PATCH /api/v1/late-fee-rules/:id/status
                </code>
                <code style={{ display: 'block', color: 'var(--brand-navy)' }}>
                  GET /api/v1/fee-invoices/:id/late-fee · POST /api/v1/fee-invoices/:id/recalculate-late-fee
                </code>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Phase 7 — Sub-Tab: Failed Payments Report */}
      {activeTab === 'FAILED_PAYMENTS' && (() => {
        const allFailedTxs = db.getFailedPayments();
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Safety Banner */}
            <div style={{ background: '#fefce8', border: '1.5px solid #fde047', borderRadius: '10px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <AlertCircle size={22} color="#d97706" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
              <div>
                <div style={{ fontWeight: 800, color: '#92400e', marginBottom: '0.25rem' }}>Failed Payment Safety Guarantee</div>
                <div style={{ fontSize: '0.8125rem', color: '#92400e', lineHeight: 1.6 }}>
                  A failed payment <strong>NEVER</strong> reduces a student's outstanding fee, marks an invoice as paid, generates a receipt, or updates the student fee account.
                  All failed transaction records are stored for audit and retry purposes only.
                  Gateway-reported failure status is always <strong>verified server-side</strong> before recording.
                </div>
              </div>
            </div>

            {/* Failed Transactions Table */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--brand-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                  <XCircle size={18} color="#ef4444" /> Failed Payment Transactions ({allFailedTxs.length})
                </h3>
              </div>

              {allFailedTxs.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <CheckCircle2 size={40} color="#10b981" style={{ margin: '0 auto 1rem', display: 'block' }} />
                  <div style={{ fontWeight: 700 }}>No failed payments on record.</div>
                  <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>All recent payment attempts were successful.</div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table" style={{ fontSize: '0.8125rem' }}>
                    <thead>
                      <tr>
                        <th>Transaction #</th>
                        <th>Date & Time</th>
                        <th>Invoice</th>
                        <th>Student</th>
                        <th>Gateway</th>
                        <th style={{ textAlign: 'right' }}>Amount</th>
                        <th>Failure Reason</th>
                        <th style={{ textAlign: 'center' }}>Invoice Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allFailedTxs.map((tx: any) => {
                        const invoice = db.getFeeInvoices ? db.getFeeInvoices().find((i: any) => i.id === tx.invoiceId) : null;
                        return (
                          <tr key={tx.id} style={{ background: '#fff9f9' }}>
                            <td><code style={{ fontWeight: 700, color: '#ef4444', fontSize: '0.78rem' }}>{tx.transactionNumber}</code></td>
                            <td style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(tx.createdAt).toLocaleString('en-IN')}</td>
                            <td><code style={{ color: '#1e40af', fontWeight: 600 }}>{invoice?.invoiceNumber || tx.invoiceId}</code></td>
                            <td style={{ fontWeight: 600 }}>{tx.studentId}</td>
                            <td><Badge variant="orange">{tx.gateway || 'RAZORPAY'}</Badge></td>
                            <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 800, color: '#ef4444' }}>₹{Number(tx.amount).toLocaleString('en-IN')}</td>
                            <td>
                              <div style={{ maxWidth: '200px', fontSize: '0.75rem', color: '#92400e', background: '#fef3c7', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                                {tx.failureReason || 'UNKNOWN'}
                              </div>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <Badge variant={invoice?.status === 'PAID' ? 'active' : invoice?.status === 'CANCELLED' ? 'danger' : 'inactive'}>
                                {invoice?.status || 'UNCHANGED'}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Sub-Tab 8: Fee Queries Resolution Queue */}
      {activeTab === 'FEE_QUERIES' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Filter Bar */}
          <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '260px' }}>
              <Search size={18} color="var(--text-muted)" />
              <input
                type="text"
                className="form-input"
                placeholder="Search by student name, enrollment no, or query ID..."
                value={feeQuerySearch}
                onChange={e => setFeeQuerySearch(e.target.value)}
                style={{ maxWidth: '360px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <select className="form-select" style={{ width: '180px' }} value={feeQueryFilterStatus} onChange={e => setFeeQueryFilterStatus(e.target.value)}>
                <option value="ALL">All Statuses</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="RESOLVED">Resolved</option>
                <option value="REJECTED">Rejected</option>
              </select>

              <select className="form-select" style={{ width: '200px' }} value={feeQueryFilterCategory} onChange={e => setFeeQueryFilterCategory(e.target.value)}>
                <option value="ALL">All Query Categories</option>
                <option value="SEMESTER_FEE">Semester Fee</option>
                <option value="EXAM_FEE">Exam Fee</option>
                <option value="BACKLOG_FEE">Backlog Fee</option>
                <option value="LATE_FEE">Late Fee</option>
                <option value="PAYMENT_ISSUE">Payment Issue</option>
                <option value="REFUND">Fee Refund</option>
              </select>
            </div>
          </div>

          {/* Fee Queries Table */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '1.25rem' }}>
              Accounts Directorate Fee Resolution Desk
            </h3>

            {db.getFeeQueries().length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                <HelpCircle size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                <p style={{ fontSize: '1rem', fontWeight: 600 }}>No fee queries filed yet.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table" style={{ fontSize: '0.85rem' }}>
                  <thead>
                    <tr>
                      <th>Query ID</th>
                      <th>Student Info</th>
                      <th>Category</th>
                      <th>Subject &amp; Inquiry</th>
                      <th>Priority</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {db.getFeeQueries()
                      .filter(q => {
                        const matchesStatus = feeQueryFilterStatus === 'ALL' || q.status === feeQueryFilterStatus;
                        const matchesCat = feeQueryFilterCategory === 'ALL' || q.category === feeQueryFilterCategory;
                        const matchesSearch = q.studentName.toLowerCase().includes(feeQuerySearch.toLowerCase()) ||
                                              q.enrollmentNo.toLowerCase().includes(feeQuerySearch.toLowerCase()) ||
                                              q.queryNo.toLowerCase().includes(feeQuerySearch.toLowerCase()) ||
                                              q.subject.toLowerCase().includes(feeQuerySearch.toLowerCase());
                        return matchesStatus && matchesCat && matchesSearch;
                      })
                      .map(q => (
                        <tr key={q.id}>
                          <td style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>{q.queryNo}</td>
                          <td>
                            <strong>{q.studentName}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {q.enrollmentNo} • {q.departmentName}
                            </div>
                          </td>
                          <td><Badge variant="navy">{q.category.replace(/_/g, ' ')}</Badge></td>
                          <td>
                            <strong>{q.subject}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {q.description}
                            </div>
                            {q.claimedAmount && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--brand-orange)', fontWeight: 600 }}>
                                Claimed Amount: ₹{q.claimedAmount.toLocaleString()}
                              </div>
                            )}
                          </td>
                          <td>
                            <Badge variant={q.priority === 'URGENT' ? 'danger' : q.priority === 'HIGH' ? 'warning' : 'navy'}>
                              {q.priority}
                            </Badge>
                          </td>
                          <td>{new Date(q.createdAt).toLocaleDateString()}</td>
                          <td>
                            <Badge variant={q.status === 'RESOLVED' ? 'success' : q.status === 'UNDER_REVIEW' ? 'active' : q.status === 'REJECTED' ? 'danger' : 'gold'}>
                              {q.status.replace(/_/g, ' ')}
                            </Badge>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => setResolvingFeeQuery(q)}
                              style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                            >
                              Resolve / Review
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fee Query Resolve Modal */}
      {resolvingFeeQuery && (
        <FeeQueryResolveModal
          query={resolvingFeeQuery}
          isOpen={Boolean(resolvingFeeQuery)}
          onClose={() => setResolvingFeeQuery(null)}
          onSuccess={() => {
            setResolvingFeeQuery(null);
          }}
        />
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

      {/* Student Fee Account / Ledger Breakdown Modal (Phase 3) */}
      <StudentFeeAccountModal
        isOpen={!!viewingFeeRecord}
        onClose={() => setViewingFeeRecord(null)}
        feeRecord={viewingFeeRecord}
      />

      {/* Student Fee Invoice View Modal (Phase 4) */}
      <FeeInvoiceViewModal
        isOpen={!!viewingStudentInvoice}
        onClose={() => setViewingStudentInvoice(null)}
        invoice={viewingStudentInvoice}
        onPayNow={(inv) => setPayingInvoice(inv)}
      />

      {/* Online Fee Payment Modal (Phase 5) */}
      <OnlinePaymentModal
        isOpen={!!payingInvoice}
        onClose={() => setPayingInvoice(null)}
        invoice={payingInvoice}
        onPaymentSuccess={() => {
          // Force re-render of student and admin fee records
          setPayingInvoice(null);
        }}
      />
    </div>
  );
};
