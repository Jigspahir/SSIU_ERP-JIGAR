import React from 'react';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { FeePaymentTransaction, StudentFeeRecord } from '../../types';
import { db } from '../../services/db';
import { Printer, Download, CheckCircle2, Building2 } from 'lucide-react';
import logoSvg from '../../assets/swarrnim-logo.svg';

interface FeeReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: FeePaymentTransaction | null;
  feeRecord?: StudentFeeRecord | null;
}

export const FeeReceiptModal: React.FC<FeeReceiptModalProps> = ({
  isOpen,
  onClose,
  transaction,
  feeRecord
}) => {
  if (!transaction) return null;

  const student = db.getStudents().find(s => s.id === transaction.studentId);
  const program = db.getProgramById(transaction.programId);
  const semester = db.getSemesterById(transaction.semesterId);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const receiptContent = `====================================================
SWARRNIM UNIVERSITY - OFFICIAL FEE RECEIPT
====================================================
Receipt No   : ${transaction.receiptNo}
Date         : ${transaction.paymentDate}
Student Name : ${transaction.studentName}
Enrollment No: ${transaction.enrollmentNo}
Program      : ${program?.name || '-'}
Semester     : ${semester?.code || '-'}
Payment Mode : ${transaction.paymentMode}
Ref / Txn ID : ${transaction.transactionId}
----------------------------------------------------
Amount Paid  : Rs. ${transaction.paidAmount.toLocaleString()}
Status       : PAYMENT SUCCESSFUL / VERIFIED
====================================================
Issued by    : ${transaction.recordedBy}
Accounts Department, Swarrnim University
====================================================`;

    const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt_${transaction.receiptNo}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Official University Fee Receipt"
      subtitle={`Receipt No: ${transaction.receiptNo}`}
      maxWidth="680px"
      footer={
        <>
          <button className="btn btn-secondary" onClick={handlePrint}>
            <Printer size={16} /> Print Receipt
          </button>
          <button className="btn btn-primary" onClick={handleDownload}>
            <Download size={16} /> Download PDF
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0.5rem 0' }}>
        {/* Receipt Header Banner */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--brand-orange)', paddingBottom: '1rem' }}>
          <img src={logoSvg} alt="Swarrnim Logo" style={{ height: '54px', objectFit: 'contain' }} />
          <div style={{ textAlign: 'right' }}>
            <Badge variant="active">PAYMENT SUCCESSFUL</Badge>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-navy)', marginTop: '0.25rem' }}>
              OFFICIAL PAYMENT ACKNOWLEDGEMENT
            </div>
          </div>
        </div>

        {/* Transaction Metadata Grid */}
        <div className="grid-2" style={{ background: 'var(--bg-surface-hover)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ fontSize: '0.8125rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Receipt Number:</span>{' '}
            <strong style={{ color: 'var(--brand-navy)' }}>{transaction.receiptNo}</strong>
          </div>
          <div style={{ fontSize: '0.8125rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Payment Date:</span>{' '}
            <strong>{transaction.paymentDate}</strong>
          </div>
          <div style={{ fontSize: '0.8125rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Payment Mode:</span>{' '}
            <Badge variant="orange">{transaction.paymentMode}</Badge>
          </div>
          <div style={{ fontSize: '0.8125rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Transaction Reference:</span>{' '}
            <code style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>{transaction.transactionId}</code>
          </div>
        </div>

        {/* Student Details Box */}
        <div className="card" style={{ padding: '1.15rem' }}>
          <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '0.65rem' }}>
            Student Information
          </h4>
          <div className="grid-2" style={{ fontSize: '0.8125rem', gap: '0.5rem' }}>
            <div><span style={{ color: 'var(--text-muted)' }}>Student Name:</span> <strong>{transaction.studentName}</strong></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Enrollment No:</span> <strong style={{ color: 'var(--brand-orange)' }}>{transaction.enrollmentNo}</strong></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Program:</span> <strong>{program?.name || '-'}</strong></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Semester:</span> <strong>{semester?.code || '-'}</strong></div>
          </div>
        </div>

        {/* Amount Paid Component Table */}
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Description / Component</th>
                <th style={{ textAlign: 'right' }}>Amount Paid (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Academic Tuition &amp; Development Fees</td>
                <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{transaction.paidAmount.toLocaleString()}</td>
              </tr>
              <tr style={{ background: 'var(--bg-surface-hover)', fontWeight: 800 }}>
                <td style={{ color: 'var(--brand-navy)' }}>TOTAL AMOUNT RECEIVED</td>
                <td style={{ textAlign: 'right', color: 'var(--brand-orange)', fontSize: '1.1rem' }}>
                  ₹{transaction.paidAmount.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {transaction.remarks && (
          <div style={{ fontSize: '0.78125rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            Remarks: {transaction.remarks}
          </div>
        )}

        {/* Footer Authorization Stamp */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '1rem', borderTop: '1px dashed var(--border-color)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <div>
            <div>Issued by: <strong>{transaction.recordedBy}</strong></div>
            <div>Swarrnim Finance &amp; Accounts Department</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '0.25rem' }}>Swarrnim University Accounts</div>
            <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#10B981', fontWeight: 800 }}>[Digitally Verified]</div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
