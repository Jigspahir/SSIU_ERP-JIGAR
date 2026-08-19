import React, { useState, useMemo } from 'react';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { FileText, Download, Printer, Filter, Calendar, Search } from 'lucide-react';
import { exportToExcel } from '../../services/exportService';

export const NoteSheetReportsTab: React.FC = () => {
  const { user } = useAuth();
  
  const [reportType, setReportType] = useState<
    'NOTE_SHEET_FINANCIAL' | 'INCOME' | 'EXPENSE' | 'FUND_BALANCE' |
    'CATEGORY_EXPENSE' | 'MONTHLY_FINANCIAL' | 'VENDOR_EXPENSE' |
    'PAYMENT_MODE' | 'REIMBURSEMENT' | 'SETTLEMENT' | 'LEDGER'
  >('NOTE_SHEET_FINANCIAL');

  // Filters
  const [selectedInst, setSelectedInst] = useState('ALL');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedNoteSheet, setSelectedNoteSheet] = useState('ALL');
  const [selectedFundAccount, setSelectedFundAccount] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedPaymentMode, setSelectedPaymentMode] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const institutes = db.getInstitutes();
  const departments = db.getDepartments();
  const noteSheets = db.getNoteSheets();
  const fundAccounts = db.getFundAccounts();
  const categories = db.getExpenseCategories();
  const receipts = db.getMoneyReceived();
  const expenses = db.getExpenses();
  const reimbursements = db.getReimbursements();
  const refunds = db.getRefunds();
  const settlements = db.getFinancialSettlements();
  const ledger = db.getAccountLedger();

  // Filtered dataset generator based on active reportType
  const reportData = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    if (reportType === 'NOTE_SHEET_FINANCIAL') {
      return noteSheets.filter(n => {
        if (selectedInst !== 'ALL' && n.instituteId !== selectedInst) return false;
        if (selectedDept !== 'ALL' && n.departmentId !== selectedDept) return false;
        if (selectedStatus !== 'ALL' && n.status !== selectedStatus) return false;
        if (startDate && n.date < startDate) return false;
        if (endDate && n.date > endDate) return false;
        if (q && !(n.noteSheetNumber.toLowerCase().includes(q) || n.subject.toLowerCase().includes(q) || n.creatorName.toLowerCase().includes(q))) return false;
        return true;
      }).map(n => {
        const sum = db.getNoteSheetFinancialSummary(n.id);
        const dept = departments.find(d => d.id === n.departmentId);
        return {
          id: n.id,
          noteSheetNumber: n.noteSheetNumber,
          date: n.date,
          department: dept ? dept.name : n.departmentId,
          subject: n.subject,
          creator: n.creatorName,
          budget: sum.approvedBudget,
          received: sum.totalReceived,
          spent: sum.totalSpent,
          returned: sum.totalReturned,
          balance: sum.balanceAvailable,
          utilization: `${sum.utilizedPercentage.toFixed(2)}%`,
          status: sum.isClosed ? 'CLOSED' : n.status
        };
      });
    }

    if (reportType === 'INCOME') {
      return receipts.filter(r => {
        if (selectedNoteSheet !== 'ALL' && r.noteSheetId !== selectedNoteSheet) return false;
        if (selectedFundAccount !== 'ALL' && r.bankAccountId !== selectedFundAccount) return false;
        if (selectedPaymentMode !== 'ALL' && r.paymentMode !== selectedPaymentMode) return false;
        if (startDate && r.date < startDate) return false;
        if (endDate && r.date > endDate) return false;
        if (q && !(r.noteSheetNumber.toLowerCase().includes(q) || r.source.toLowerCase().includes(q) || r.referenceNo.toLowerCase().includes(q) || r.receivedBy.toLowerCase().includes(q))) return false;
        return true;
      });
    }

    if (reportType === 'EXPENSE') {
      return expenses.filter(e => {
        if (selectedNoteSheet !== 'ALL' && e.noteSheetId !== selectedNoteSheet) return false;
        if (selectedCategory !== 'ALL' && e.category !== selectedCategory) return false;
        if (selectedFundAccount !== 'ALL' && e.paidFromAccountId !== selectedFundAccount) return false;
        if (selectedPaymentMode !== 'ALL' && e.paymentMode !== selectedPaymentMode) return false;
        if (startDate && e.date < startDate) return false;
        if (endDate && e.date > endDate) return false;
        if (q && !(e.noteSheetNumber.toLowerCase().includes(q) || e.itemName.toLowerCase().includes(q) || e.vendor.toLowerCase().includes(q) || e.invoiceNo.toLowerCase().includes(q))) return false;
        return true;
      });
    }

    if (reportType === 'FUND_BALANCE') {
      return fundAccounts.filter(a => {
        if (selectedStatus !== 'ALL' && a.status !== selectedStatus) return false;
        if (q && !(a.name.toLowerCase().includes(q) || a.code.toLowerCase().includes(q))) return false;
        return true;
      });
    }

    if (reportType === 'CATEGORY_EXPENSE') {
      const catMap: { [cat: string]: { count: number; total: number } } = {};
      expenses.forEach(e => {
        if (startDate && e.date < startDate) return;
        if (endDate && e.date > endDate) return;
        if (selectedNoteSheet !== 'ALL' && e.noteSheetId !== selectedNoteSheet) return;
        if (!catMap[e.category]) catMap[e.category] = { count: 0, total: 0 };
        catMap[e.category].count += 1;
        catMap[e.category].total += e.totalAmount;
      });
      const totalAll = Object.values(catMap).reduce((s, c) => s + c.total, 0) || 1;
      return Object.entries(catMap).map(([category, data]) => ({
        category,
        count: data.count,
        total: data.total,
        share: `${((data.total / totalAll) * 100).toFixed(2)}%`
      }));
    }

    if (reportType === 'VENDOR_EXPENSE') {
      const vendorMap: { [vendor: string]: { count: number; total: number } } = {};
      expenses.forEach(e => {
        if (startDate && e.date < startDate) return;
        if (endDate && e.date > endDate) return;
        if (!vendorMap[e.vendor]) vendorMap[e.vendor] = { count: 0, total: 0 };
        vendorMap[e.vendor].count += 1;
        vendorMap[e.vendor].total += e.totalAmount;
      });
      return Object.entries(vendorMap).map(([vendor, data]) => ({
        vendor,
        count: data.count,
        total: data.total
      })).sort((a, b) => b.total - a.total);
    }

    if (reportType === 'PAYMENT_MODE') {
      const modeMap: { [mode: string]: { inAmount: number; outAmount: number; count: number } } = {};
      receipts.forEach(r => {
        if (!modeMap[r.paymentMode]) modeMap[r.paymentMode] = { inAmount: 0, outAmount: 0, count: 0 };
        modeMap[r.paymentMode].inAmount += r.amount;
        modeMap[r.paymentMode].count += 1;
      });
      expenses.forEach(e => {
        if (!modeMap[e.paymentMode]) modeMap[e.paymentMode] = { inAmount: 0, outAmount: 0, count: 0 };
        modeMap[e.paymentMode].outAmount += e.totalAmount;
        modeMap[e.paymentMode].count += 1;
      });
      return Object.entries(modeMap).map(([mode, data]) => ({
        mode,
        inAmount: data.inAmount,
        outAmount: data.outAmount,
        netFlow: data.inAmount - data.outAmount,
        count: data.count
      }));
    }

    if (reportType === 'REIMBURSEMENT') {
      return reimbursements.filter(r => {
        if (selectedStatus !== 'ALL' && r.status !== selectedStatus) return false;
        if (selectedCategory !== 'ALL' && r.category !== selectedCategory) return false;
        if (startDate && r.expenseDate < startDate) return false;
        if (endDate && r.expenseDate > endDate) return false;
        if (q && !(r.applicantName.toLowerCase().includes(q) || r.noteSheetNumber.toLowerCase().includes(q) || r.purpose.toLowerCase().includes(q))) return false;
        return true;
      });
    }

    if (reportType === 'SETTLEMENT') {
      return settlements.map(s => {
        const ns = noteSheets.find(n => n.id === s.noteSheetId);
        return {
          ...s,
          subject: ns?.subject || '-'
        };
      });
    }

    if (reportType === 'LEDGER') {
      return ledger.filter(l => {
        if (selectedNoteSheet !== 'ALL' && l.noteSheetId !== selectedNoteSheet) return false;
        if (selectedFundAccount !== 'ALL' && l.fundAccountId !== selectedFundAccount) return false;
        if (startDate && l.date < startDate) return false;
        if (endDate && l.date > endDate) return false;
        if (q && !(l.description.toLowerCase().includes(q) || l.transactionId.toLowerCase().includes(q) || (l.noteSheetNumber && l.noteSheetNumber.toLowerCase().includes(q)))) return false;
        return true;
      });
    }

    return [];
  }, [reportType, selectedInst, selectedDept, selectedNoteSheet, selectedFundAccount, selectedCategory, selectedPaymentMode, selectedStatus, startDate, endDate, searchQuery, noteSheets, receipts, expenses, fundAccounts, reimbursements, settlements, ledger, departments]);

  const handleExportExcel = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    if (reportType === 'NOTE_SHEET_FINANCIAL') {
      headers = ['Note Sheet No.', 'Date', 'Department', 'Subject', 'Creator', 'Budget (₹)', 'Received (₹)', 'Spent (₹)', 'Returned (₹)', 'Balance (₹)', 'Utilization %', 'Status'];
      rows = (reportData as any[]).map(r => [r.noteSheetNumber, r.date, r.department, r.subject, r.creator, r.budget, r.received, r.spent, r.returned, r.balance, r.utilization, r.status]);
    } else if (reportType === 'INCOME') {
      headers = ['Receipt Date', 'Note Sheet No.', 'Source', 'Credit Account', 'Payment Mode', 'Reference ID', 'Received By', 'Amount (₹)', 'Remarks'];
      rows = (reportData as any[]).map(r => [r.date, r.noteSheetNumber, r.source, r.bankAccountName, r.paymentMode, r.referenceNo, r.receivedBy, r.amount, r.remarks || '-']);
    } else if (reportType === 'EXPENSE') {
      headers = ['Expense Date', 'Note Sheet No.', 'Category', 'Item Name', 'Qty', 'Unit', 'Rate (₹)', 'Total Amount (₹)', 'Vendor', 'Invoice No.', 'Paid From', 'Payment Mode'];
      rows = (reportData as any[]).map(e => [e.date, e.noteSheetNumber, e.category, e.itemName, e.quantity, e.unit, e.rate, e.totalAmount, e.vendor, e.invoiceNo, e.paidFromAccountName, e.paymentMode]);
    } else if (reportType === 'FUND_BALANCE') {
      headers = ['Account Code', 'Account Name', 'Opening Balance (₹)', 'Total Credits (₹)', 'Total Debits (₹)', 'Current Balance (₹)', 'Status'];
      rows = (reportData as any[]).map(a => [a.code, a.name, a.openingBalance, a.totalCredits, a.totalDebits, a.currentBalance, a.status]);
    } else if (reportType === 'CATEGORY_EXPENSE') {
      headers = ['Expense Category', 'Transactions Count', 'Total Spent (₹)', 'Share of Budget %'];
      rows = (reportData as any[]).map(c => [c.category, c.count, c.total, c.share]);
    } else if (reportType === 'VENDOR_EXPENSE') {
      headers = ['Vendor / Payee Name', 'Bills Count', 'Total Payout Amount (₹)'];
      rows = (reportData as any[]).map(v => [v.vendor, v.count, v.total]);
    } else if (reportType === 'PAYMENT_MODE') {
      headers = ['Payment Mode', 'Money In (₹)', 'Money Out (₹)', 'Net Flow (₹)', 'Transactions Count'];
      rows = (reportData as any[]).map(m => [m.mode, m.inAmount, m.outAmount, m.netFlow, m.count]);
    } else if (reportType === 'REIMBURSEMENT') {
      headers = ['Claim Date', 'Applicant', 'Role', 'Note Sheet No.', 'Category', 'Claim Amount (₹)', 'Status', 'Purpose', 'Payment Reference'];
      rows = (reportData as any[]).map(r => [r.expenseDate, r.applicantName, r.applicantRole, r.noteSheetNumber, r.category, r.amount, r.status, r.purpose, r.paymentReference || '-']);
    } else if (reportType === 'SETTLEMENT') {
      headers = ['Settled Date', 'Note Sheet No.', 'Subject', 'Approved Budget (₹)', 'Received (₹)', 'Spent (₹)', 'Returned (₹)', 'Final Balance (₹)', 'Utilization %', 'Settled By', 'Remarks'];
      rows = (reportData as any[]).map(s => [s.settledDate, s.noteSheetNumber, s.subject, s.approvedBudget, s.totalReceived, s.totalSpent, s.totalReturned, s.finalBalance, `${s.utilizationPercent}%`, s.settledBy, s.closureRemarks || '-']);
    } else if (reportType === 'LEDGER') {
      headers = ['Date', 'Txn ID', 'Note Sheet No.', 'Fund Account', 'Type', 'Description', 'Reference', 'Money In (₹)', 'Money Out (₹)', 'Running Balance (₹)', 'Mode', 'Created By'];
      rows = (reportData as any[]).map(l => [l.date, l.transactionId, l.noteSheetNumber || '-', l.fundAccountName, l.transactionType, l.description, l.reference, l.moneyIn || 0, l.moneyOut || 0, l.balance, l.paymentMode, l.createdBy]);
    }

    exportToExcel(
      `Financial Report - ${reportType.replace(/_/g, ' ')}`,
      headers,
      rows,
      { startDate: startDate || undefined, endDate: endDate || undefined },
      { name: user?.name, role: user?.role }
    );
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="notesheet-module-container space-y-5">
      
      {/* Report Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-500" /> Financial &amp; Fund Accounts Reports Engine
          </h3>
          <p className="text-sm text-slate-500 mt-0.5">
            Generate, filter, print, and export official university accounts, expense statements and audit ledgers.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button className="btn btn-secondary btn-sm text-sm font-bold flex items-center gap-1.5" onClick={handlePrintReport}>
            <Printer className="w-4 h-4" /> Print Report
          </button>
          <button className="btn btn-primary btn-sm text-sm font-bold flex items-center gap-1.5" onClick={handleExportExcel}>
            <Download className="w-4 h-4" /> Export Excel / CSV
          </button>
        </div>
      </div>

      {/* Report Type Selector Tabs */}
      <div className="card p-2.5 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {[
            { id: 'NOTE_SHEET_FINANCIAL', label: 'Note Sheet Financials' },
            { id: 'INCOME', label: 'Income & Receipts' },
            { id: 'EXPENSE', label: 'Expenses & Bills' },
            { id: 'FUND_BALANCE', label: 'Fund Balances' },
            { id: 'CATEGORY_EXPENSE', label: 'Category-wise Expenses' },
            { id: 'VENDOR_EXPENSE', label: 'Vendor-wise Expenses' },
            { id: 'PAYMENT_MODE', label: 'Payment Mode Report' },
            { id: 'REIMBURSEMENT', label: 'Reimbursement Claims' },
            { id: 'SETTLEMENT', label: 'Final Settlements' },
            { id: 'LEDGER', label: 'Full Account Ledger' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              className={`btn btn-sm ${reportType === tab.id ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setReportType(tab.id as any)}
              style={{ fontSize: '0.875rem', fontWeight: 700 }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Multi-Criteria Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="form-group mb-0">
            <label className="form-label text-sm font-semibold">Search Keywords</label>
            <input
              type="text"
              className="form-input text-sm"
              placeholder="Search ref, vendor, subject..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="form-group mb-0">
            <label className="form-label text-sm font-semibold">From Date</label>
            <input type="date" className="form-input text-sm" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>

          <div className="form-group mb-0">
            <label className="form-label text-sm font-semibold">To Date</label>
            <input type="date" className="form-input text-sm" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>

          <div className="form-group mb-0">
            <label className="form-label text-sm font-semibold">Fund Head</label>
            <select className="form-select text-sm font-medium" value={selectedFundAccount} onChange={e => setSelectedFundAccount(e.target.value)}>
              <option value="ALL">All Fund Accounts</option>
              {fundAccounts.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group mb-0">
            <label className="form-label text-sm font-semibold">Expense Category</label>
            <select className="form-select text-sm font-medium" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
              <option value="ALL">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group mb-0">
            <label className="form-label text-sm font-semibold">Payment Mode</label>
            <select className="form-select text-sm font-medium" value={selectedPaymentMode} onChange={e => setSelectedPaymentMode(e.target.value)}>
              <option value="ALL">All Modes</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 text-sm text-slate-500">
          <span>Total Records Found: <strong className="text-slate-800 dark:text-slate-200">{reportData.length}</strong></span>
          <button
            type="button"
            className="btn btn-ghost btn-xs text-sm"
            onClick={() => {
              setSelectedInst('ALL');
              setSelectedDept('ALL');
              setSelectedNoteSheet('ALL');
              setSelectedFundAccount('ALL');
              setSelectedCategory('ALL');
              setSelectedPaymentMode('ALL');
              setSelectedStatus('ALL');
              setStartDate('');
              setEndDate('');
              setSearchQuery('');
            }}
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Report Data Table View */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          
          {reportType === 'NOTE_SHEET_FINANCIAL' && (
            <table className="table" style={{ width: '100%', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-hover)' }}>
                  <th>Note Sheet No.</th>
                  <th>Date</th>
                  <th>Department</th>
                  <th>Subject</th>
                  <th>Creator</th>
                  <th style={{ textAlign: 'right' }}>Budget (₹)</th>
                  <th style={{ textAlign: 'right' }}>Received (₹)</th>
                  <th style={{ textAlign: 'right' }}>Spent (₹)</th>
                  <th style={{ textAlign: 'right' }}>Balance (₹)</th>
                  <th style={{ textAlign: 'center' }}>Utilization</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(reportData as any[]).map((r, i) => (
                  <tr key={i}>
                    <td><code>{r.noteSheetNumber}</code></td>
                    <td>{r.date}</td>
                    <td>{r.department}</td>
                    <td style={{ maxWidth: '220px', fontWeight: 600 }}>{r.subject}</td>
                    <td>{r.creator}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{r.budget.toLocaleString('en-IN')}</td>
                    <td style={{ textAlign: 'right', color: '#16a34a' }}>₹{r.received.toLocaleString('en-IN')}</td>
                    <td style={{ textAlign: 'right', color: '#dc2626' }}>₹{r.spent.toLocaleString('en-IN')}</td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--brand-navy)' }}>₹{r.balance.toLocaleString('en-IN')}</td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--brand-orange)' }}>{r.utilization}</td>
                    <td><span className="badge">{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'INCOME' && (
            <table className="table" style={{ width: '100%', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-hover)' }}>
                  <th>Receipt Date</th>
                  <th>Note Sheet No.</th>
                  <th>Source</th>
                  <th>Fund Head</th>
                  <th>Mode</th>
                  <th>Reference</th>
                  <th>Received By</th>
                  <th style={{ textAlign: 'right' }}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {(reportData as any[]).map((r, i) => (
                  <tr key={i}>
                    <td>{r.date}</td>
                    <td><code>{r.noteSheetNumber}</code></td>
                    <td><span className="badge" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#1d4ed8' }}>{r.source}</span></td>
                    <td>{r.bankAccountName}</td>
                    <td>{r.paymentMode}</td>
                    <td><code>{r.referenceNo}</code></td>
                    <td>{r.receivedBy}</td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: '#16a34a' }}>+ ₹{r.amount.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'EXPENSE' && (
            <table className="table" style={{ width: '100%', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-hover)' }}>
                  <th>Expense Date</th>
                  <th>Note Sheet No.</th>
                  <th>Category</th>
                  <th>Item Name</th>
                  <th>Qty &amp; Unit</th>
                  <th>Vendor</th>
                  <th>Invoice No.</th>
                  <th>Paid From</th>
                  <th>Payment Mode</th>
                  <th style={{ textAlign: 'right' }}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {(reportData as any[]).map((e, i) => (
                  <tr key={i}>
                    <td>{e.date}</td>
                    <td><code>{e.noteSheetNumber}</code></td>
                    <td><span className="badge">{e.category}</span></td>
                    <td style={{ fontWeight: 700 }}>{e.itemName}</td>
                    <td>{e.quantity} {e.unit}</td>
                    <td>{e.vendor}</td>
                    <td><code>{e.invoiceNo}</code></td>
                    <td>{e.paidFromAccountName}</td>
                    <td>{e.paymentMode}</td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: '#dc2626' }}>₹{e.totalAmount.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'FUND_BALANCE' && (
            <table className="table" style={{ width: '100%', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-hover)' }}>
                  <th>Account Code</th>
                  <th>Fund Head / Name</th>
                  <th style={{ textAlign: 'right' }}>Opening Balance (₹)</th>
                  <th style={{ textAlign: 'right' }}>Total Credits (₹)</th>
                  <th style={{ textAlign: 'right' }}>Total Debits (₹)</th>
                  <th style={{ textAlign: 'right' }}>Current Balance (₹)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(reportData as any[]).map((a, i) => (
                  <tr key={i}>
                    <td><code>{a.code}</code></td>
                    <td style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>{a.name}</td>
                    <td style={{ textAlign: 'right' }}>₹{(a.openingBalance || 0).toLocaleString('en-IN')}</td>
                    <td style={{ textAlign: 'right', color: '#16a34a' }}>+ ₹{(a.totalCredits || 0).toLocaleString('en-IN')}</td>
                    <td style={{ textAlign: 'right', color: '#dc2626' }}>- ₹{(a.totalDebits || 0).toLocaleString('en-IN')}</td>
                    <td style={{ textAlign: 'right', fontWeight: 900, color: '#059669', fontSize: '0.95rem' }}>
                      ₹{(a.currentBalance || 0).toLocaleString('en-IN')}
                    </td>
                    <td><span className="badge">{a.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'CATEGORY_EXPENSE' && (
            <table className="table" style={{ width: '100%', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-hover)' }}>
                  <th>Expense Category</th>
                  <th style={{ textAlign: 'center' }}>Transactions Count</th>
                  <th style={{ textAlign: 'right' }}>Total Spent (₹)</th>
                  <th style={{ textAlign: 'right' }}>Budget Share %</th>
                </tr>
              </thead>
              <tbody>
                {(reportData as any[]).map((c, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>{c.category}</td>
                    <td style={{ textAlign: 'center' }}>{c.count}</td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--brand-orange)' }}>₹{c.total.toLocaleString('en-IN')}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{c.share}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'VENDOR_EXPENSE' && (
            <table className="table" style={{ width: '100%', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-hover)' }}>
                  <th>Vendor / Payee Name</th>
                  <th style={{ textAlign: 'center' }}>Total Bills Count</th>
                  <th style={{ textAlign: 'right' }}>Total Payout Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {(reportData as any[]).map((v, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>{v.vendor}</td>
                    <td style={{ textAlign: 'center' }}>{v.count}</td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: '#dc2626' }}>₹{v.total.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'PAYMENT_MODE' && (
            <table className="table" style={{ width: '100%', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-hover)' }}>
                  <th>Payment Mode</th>
                  <th style={{ textAlign: 'right' }}>Total Inflow (₹)</th>
                  <th style={{ textAlign: 'right' }}>Total Outflow (₹)</th>
                  <th style={{ textAlign: 'right' }}>Net Flow (₹)</th>
                  <th style={{ textAlign: 'center' }}>Total Transactions</th>
                </tr>
              </thead>
              <tbody>
                {(reportData as any[]).map((m, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>{m.mode}</td>
                    <td style={{ textAlign: 'right', color: '#16a34a', fontWeight: 700 }}>+ ₹{m.inAmount.toLocaleString('en-IN')}</td>
                    <td style={{ textAlign: 'right', color: '#dc2626', fontWeight: 700 }}>- ₹{m.outAmount.toLocaleString('en-IN')}</td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--brand-navy)' }}>₹{m.netFlow.toLocaleString('en-IN')}</td>
                    <td style={{ textAlign: 'center' }}>{m.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'REIMBURSEMENT' && (
            <table className="table" style={{ width: '100%', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-hover)' }}>
                  <th>Claim Date</th>
                  <th>Applicant</th>
                  <th>Role</th>
                  <th>Note Sheet No.</th>
                  <th>Category</th>
                  <th>Purpose</th>
                  <th style={{ textAlign: 'right' }}>Claim Amount (₹)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(reportData as any[]).map((r, i) => (
                  <tr key={i}>
                    <td>{r.expenseDate}</td>
                    <td style={{ fontWeight: 700 }}>{r.applicantName}</td>
                    <td><span className="badge">{r.applicantRole}</span></td>
                    <td><code>{r.noteSheetNumber}</code></td>
                    <td>{r.category}</td>
                    <td>{r.purpose}</td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--brand-navy)' }}>₹{r.amount.toLocaleString('en-IN')}</td>
                    <td><span className="badge">{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'SETTLEMENT' && (
            <table className="table" style={{ width: '100%', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-hover)' }}>
                  <th>Settled Date</th>
                  <th>Note Sheet No.</th>
                  <th>Subject</th>
                  <th style={{ textAlign: 'right' }}>Sanctioned Budget (₹)</th>
                  <th style={{ textAlign: 'right' }}>Total Spent (₹)</th>
                  <th style={{ textAlign: 'right' }}>Final Remaining (₹)</th>
                  <th style={{ textAlign: 'center' }}>Utilization</th>
                  <th>Settled By</th>
                </tr>
              </thead>
              <tbody>
                {(reportData as any[]).map((s, i) => (
                  <tr key={i}>
                    <td>{s.settledDate}</td>
                    <td><code>{s.noteSheetNumber}</code></td>
                    <td style={{ fontWeight: 600 }}>{s.subject}</td>
                    <td style={{ textAlign: 'right' }}>₹{s.approvedBudget.toLocaleString('en-IN')}</td>
                    <td style={{ textAlign: 'right', color: '#dc2626' }}>₹{s.totalSpent.toLocaleString('en-IN')}</td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: '#059669' }}>₹{s.finalBalance.toLocaleString('en-IN')}</td>
                    <td style={{ textAlign: 'center', fontWeight: 700 }}>{s.utilizationPercent}%</td>
                    <td>{s.settledBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'LEDGER' && (
            <table className="table" style={{ width: '100%', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-hover)' }}>
                  <th>Date</th>
                  <th>Txn ID</th>
                  <th>Note Sheet</th>
                  <th>Fund Head</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th style={{ textAlign: 'right' }}>Money In (₹)</th>
                  <th style={{ textAlign: 'right' }}>Money Out (₹)</th>
                  <th style={{ textAlign: 'right' }}>Running Balance (₹)</th>
                  <th>Mode</th>
                  <th>Created By</th>
                </tr>
              </thead>
              <tbody>
                {(reportData as any[]).map((l, i) => (
                  <tr key={i}>
                    <td>{l.date}</td>
                    <td><code>{l.transactionId}</code></td>
                    <td><strong>{l.noteSheetNumber || '-'}</strong></td>
                    <td>{l.fundAccountName}</td>
                    <td><span className="badge">{l.transactionType}</span></td>
                    <td>{l.description}</td>
                    <td style={{ textAlign: 'right', color: '#16a34a', fontWeight: 700 }}>{l.moneyIn > 0 ? `+ ₹${l.moneyIn.toLocaleString('en-IN')}` : '-'}</td>
                    <td style={{ textAlign: 'right', color: '#dc2626', fontWeight: 700 }}>{l.moneyOut > 0 ? `- ₹${l.moneyOut.toLocaleString('en-IN')}` : '-'}</td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--brand-navy)' }}>₹{l.balance.toLocaleString('en-IN')}</td>
                    <td>{l.paymentMode}</td>
                    <td>{l.createdBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

        </div>
      </div>

    </div>
  );
};
