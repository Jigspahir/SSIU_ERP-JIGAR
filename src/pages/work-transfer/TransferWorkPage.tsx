import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { workTransferService } from '../../services/workTransferService';
import { TransferReason, WorkItemSummary } from '../../types/workTransfer';
import { Badge } from '../../components/common/Badge';
import { 
  ArrowLeftRight, CheckSquare, Calendar, UserCheck, AlertTriangle, 
  CheckCircle2, ArrowRight, ShieldCheck, HelpCircle, FileText, Send, ArrowLeft
} from 'lucide-react';

interface TransferWorkPageProps {
  setActiveTab?: (tab: string, params?: any) => void;
}

export const TransferWorkPage: React.FC<TransferWorkPageProps> = ({ setActiveTab }) => {
  const { user } = useAuth();
  const currentUserId = user?.id || 'fac-1';

  // Step state
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedWorkItemIds, setSelectedWorkItemIds] = useState<string[]>([]);
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>('');
  const [recipientSearch, setRecipientSearch] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().slice(0, 10);
  });
  const [reason, setReason] = useState<TransferReason>('LEAVE');
  const [remarks, setRemarks] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [createdTrackingCode, setCreatedTrackingCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Available Workload to transfer
  const assignableItems: WorkItemSummary[] = useMemo(() => {
    return workTransferService.getAssignableWorkItemsForUser(currentUserId);
  }, [currentUserId]);

  // 2. Eligible Recipients
  const facultyList = useMemo(() => {
    const allFac = db.getFaculty();
    const allUsers = db.getUsers().filter(u => u.role === 'FACULTY' || u.role === 'HOD' || u.role === 'PRINCIPAL' || u.role === 'STUDENT_SECTION');
    
    // Combine unique users
    const list: Array<{ id: string; name: string; designation: string; departmentName: string; email: string }> = [];
    const seenIds = new Set<string>();

    allFac.forEach(f => {
      if (f.id !== currentUserId && !seenIds.has(f.id)) {
        seenIds.add(f.id);
        const dept = db.getDepartmentById(f.departmentId);
        list.push({
          id: f.id,
          name: f.name,
          designation: f.designation || 'Faculty Member',
          departmentName: dept?.name || 'Academic Dept',
          email: f.email || `${f.id}@swarrnim.edu.in`
        });
      }
    });

    allUsers.forEach(u => {
      if (u.id !== currentUserId && !seenIds.has(u.id)) {
        seenIds.add(u.id);
        list.push({
          id: u.id,
          name: u.name,
          designation: u.role,
          departmentName: 'SSIU University',
          email: u.email || `${u.username}@swarrnim.edu.in`
        });
      }
    });

    return list;
  }, [currentUserId]);

  // Filtered Recipients
  const filteredRecipients = useMemo(() => {
    if (!recipientSearch.trim()) return facultyList;
    const q = recipientSearch.toLowerCase();
    return facultyList.filter(f => f.name.toLowerCase().includes(q) || f.departmentName.toLowerCase().includes(q) || f.designation.toLowerCase().includes(q));
  }, [facultyList, recipientSearch]);

  const selectedRecipient = useMemo(() => {
    return facultyList.find(f => f.id === selectedRecipientId);
  }, [facultyList, selectedRecipientId]);

  const handleToggleWorkItem = (id: string) => {
    setSelectedWorkItemIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAllWorkItems = () => {
    if (selectedWorkItemIds.length === assignableItems.length) {
      setSelectedWorkItemIds([]);
    } else {
      setSelectedWorkItemIds(assignableItems.map(i => i.id));
    }
  };

  const handleFinalSubmit = () => {
    setErrorMessage('');
    if (selectedWorkItemIds.length === 0) {
      setErrorMessage('Please select at least one task or work item to transfer.');
      return;
    }
    if (!selectedRecipientId) {
      setErrorMessage('Please select an authorized faculty member or staff recipient.');
      return;
    }
    if (!startDate || !endDate) {
      setErrorMessage('Start date and end date are required.');
      return;
    }
    if (endDate < startDate) {
      setErrorMessage('End date cannot be earlier than start date.');
      return;
    }

    try {
      const record = workTransferService.createWorkTransfer({
        fromUserId: currentUserId,
        toUserId: selectedRecipientId,
        startAt: startDate,
        endAt: endDate,
        reason,
        remarks,
        workItemIds: selectedWorkItemIds
      }, user);

      setCreatedTrackingCode(record.trackingCode);
      setIsSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to execute work transfer.');
    }
  };

  if (isSubmitted) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
        <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', background: 'var(--bg-surface, #FFFFFF)', borderRadius: '12px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
            <CheckCircle2 size={36} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--brand-navy, #0B192C)', margin: 0 }}>
            Workload Transfer Successfully Registered!
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted, #64748B)', margin: '8px 0 1.5rem 0' }}>
            Official Transfer Tracking Code: <strong style={{ color: 'var(--brand-navy, #0B192C)' }}><code>{createdTrackingCode}</code></strong>
          </p>

          <div style={{ maxWidth: '500px', margin: '0 auto 2rem auto', background: 'var(--bg-surface-hover, #F8FAFC)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-color, #E2E8F0)', textAlign: 'left', fontSize: '0.8125rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-muted, #64748B)' }}>Recipient:</span>
              <strong>{selectedRecipient?.name}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-muted, #64748B)' }}>Effective Dates:</span>
              <strong>{startDate} → {endDate}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-muted, #64748B)' }}>Reason:</span>
              <Badge variant="orange">{reason}</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted, #64748B)' }}>Total Tasks:</span>
              <strong>{selectedWorkItemIds.length} Work Items</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button
              onClick={() => setActiveTab && setActiveTab('work-transfer-active')}
              className="btn btn-primary btn-sm"
              style={{ background: 'var(--brand-orange, #F37023)', border: 'none', fontWeight: 800, padding: '0.5rem 1.25rem' }}
            >
              View Active Transfers
            </button>
            <button
              onClick={() => setActiveTab && setActiveTab('work-transfer')}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.5rem 1.25rem' }}
            >
              Back to My Workload
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      {/* ─── Header ─── */}
      <div
        className="card"
        style={{
          padding: '1.5rem',
          background: 'linear-gradient(135deg, #0B192C 0%, #1E3E62 100%)',
          color: '#FFFFFF',
          borderRadius: 'var(--radius-lg, 12px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ArrowLeftRight size={24} color="var(--brand-orange, #F37023)" />
            <h1 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
              Transfer Workload &amp; Delegate Responsibilities
            </h1>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.85)', margin: '6px 0 0 0' }}>
            Temporarily transfer authorized responsibilities during leaves, vacations, or official duties.
          </p>
        </div>

        <button
          onClick={() => setActiveTab && setActiveTab('work-transfer')}
          className="btn btn-secondary btn-sm"
          style={{ background: 'rgba(255,255,255,0.15)', color: '#FFFFFF', borderColor: 'transparent' }}
        >
          <ArrowLeft size={14} /> Back to My Work
        </button>
      </div>

      {/* ─── Step Indicator ─── */}
      <div className="card" style={{ padding: '1rem', background: 'var(--bg-surface, #FFFFFF)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {[
            { step: 1, label: '1. Select Tasks' },
            { step: 2, label: '2. Select Recipient' },
            { step: 3, label: '3. Period & Reason' },
            { step: 4, label: '4. Confirm & Submit' }
          ].map(s => {
            const isCur = currentStep === s.step;
            const isDone = currentStep > s.step;
            return (
              <div
                key={s.step}
                onClick={() => isDone && setCurrentStep(s.step as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: isDone ? 'pointer' : 'default',
                  opacity: isCur || isDone ? 1 : 0.4
                }}
              >
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: isCur ? 'var(--brand-orange, #F37023)' : isDone ? '#10B981' : '#CBD5E1',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 800
                  }}
                >
                  {isDone ? '✓' : s.step}
                </div>
                <span style={{ fontSize: '0.8125rem', fontWeight: isCur ? 800 : 600, color: isCur ? 'var(--brand-navy, #0B192C)' : 'var(--text-muted, #64748B)' }}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {errorMessage && (
        <div style={{ padding: '0.75rem 1rem', background: '#FEE2E2', borderLeft: '4px solid #DC2626', color: '#B91C1C', borderRadius: '6px', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ─── STEP 1: SELECT WORK ITEMS ─── */}
      {currentStep === 1 && (
        <div className="card" style={{ padding: '1.5rem', background: 'var(--bg-surface, #FFFFFF)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--brand-navy, #0B192C)', margin: 0 }}>
                Step 1: Choose Work Items to Delegate ({assignableItems.length} Available)
              </h3>
              <p style={{ fontSize: '0.78125rem', color: 'var(--text-muted, #64748B)', margin: '2px 0 0 0' }}>
                Select specific tasks or click "Select All" to delegate entire active queue.
              </p>
            </div>
            {assignableItems.length > 0 && (
              <button
                onClick={handleSelectAllWorkItems}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem' }}
              >
                {selectedWorkItemIds.length === assignableItems.length ? 'Deselect All' : 'Select All Tasks'}
              </button>
            )}
          </div>

          {assignableItems.length === 0 ? (
            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted, #64748B)' }}>
              <CheckCircle2 size={36} color="#10B981" style={{ margin: '0 auto 0.5rem auto' }} />
              <p>You have no active pending tasks in your workload to transfer at this time.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>Select</th>
                    <th>Module</th>
                    <th>Task Title &amp; Description</th>
                    <th>Student / Reference</th>
                    <th>Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {assignableItems.map(item => {
                    const isSelected = selectedWorkItemIds.includes(item.id);
                    return (
                      <tr
                        key={item.id}
                        onClick={() => handleToggleWorkItem(item.id)}
                        style={{ cursor: 'pointer', background: isSelected ? 'rgba(243, 112, 35, 0.05)' : 'transparent' }}
                      >
                        <td>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // Handled by tr onClick
                          />
                        </td>
                        <td><Badge variant="navy">{item.type.replace('_', ' ')}</Badge></td>
                        <td>
                          <strong>{item.title}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748B)' }}>{item.description}</div>
                        </td>
                        <td>
                          {item.studentName ? (
                            <span>{item.studentName} (<code>{item.enrollmentNo || item.studentEnrollment || item.studentId}</code>)</span>
                          ) : (
                            <span style={{ color: 'var(--text-muted, #64748B)' }}>General Task</span>
                          )}
                        </td>
                        <td><Badge variant={item.priority === 'CRITICAL' ? 'danger' : 'orange'}>{item.priority}</Badge></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button
              onClick={() => {
                if (selectedWorkItemIds.length === 0) {
                  setErrorMessage('Please select at least 1 work item to proceed.');
                  return;
                }
                setErrorMessage('');
                setCurrentStep(2);
              }}
              className="btn btn-primary btn-sm"
              style={{ background: 'var(--brand-orange, #F37023)', border: 'none', fontWeight: 800, padding: '0.5rem 1.25rem' }}
            >
              Continue to Select Recipient ({selectedWorkItemIds.length}) →
            </button>
          </div>
        </div>
      )}

      {/* ─── STEP 2: SELECT RECIPIENT ─── */}
      {currentStep === 2 && (
        <div className="card" style={{ padding: '1.5rem', background: 'var(--bg-surface, #FFFFFF)' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--brand-navy, #0B192C)', margin: 0 }}>
              Step 2: Choose Authorized Recipient
            </h3>
            <p style={{ fontSize: '0.78125rem', color: 'var(--text-muted, #64748B)', margin: '2px 0 0 0' }}>
              Select a colleague within your department or institute to temporarily take over responsibility.
            </p>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Search faculty by name, department, designation..."
              value={recipientSearch}
              onChange={e => setRecipientSearch(e.target.value)}
              className="form-control"
              style={{ fontSize: '0.8125rem' }}
            />
          </div>

          <div style={{ maxHeight: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {filteredRecipients.map(fac => {
              const isSelected = selectedRecipientId === fac.id;
              return (
                <div
                  key={fac.id}
                  onClick={() => setSelectedRecipientId(fac.id)}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: '8px',
                    border: isSelected ? '2px solid var(--brand-orange, #F37023)' : '1px solid var(--border-color, #E2E8F0)',
                    background: isSelected ? 'rgba(243, 112, 35, 0.04)' : 'var(--bg-surface, #FFFFFF)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '0.875rem', color: 'var(--brand-navy, #0B192C)' }}>{fac.name}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748B)' }}>
                      {fac.designation} • {fac.departmentName}
                    </div>
                  </div>
                  {isSelected && <Badge variant="active">Selected Recipient</Badge>}
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
            <button onClick={() => setCurrentStep(1)} className="btn btn-secondary btn-sm">
              ← Back to Tasks
            </button>
            <button
              onClick={() => {
                if (!selectedRecipientId) {
                  setErrorMessage('Please select a recipient faculty member.');
                  return;
                }
                setErrorMessage('');
                setCurrentStep(3);
              }}
              className="btn btn-primary btn-sm"
              style={{ background: 'var(--brand-orange, #F37023)', border: 'none', fontWeight: 800, padding: '0.5rem 1.25rem' }}
            >
              Continue to Details →
            </button>
          </div>
        </div>
      )}

      {/* ─── STEP 3: DATES & REASON ─── */}
      {currentStep === 3 && (
        <div className="card" style={{ padding: '1.5rem', background: 'var(--bg-surface, #FFFFFF)' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--brand-navy, #0B192C)', margin: 0 }}>
              Step 3: Transfer Period &amp; Absence Justification
            </h3>
            <p style={{ fontSize: '0.78125rem', color: 'var(--text-muted, #64748B)', margin: '2px 0 0 0' }}>
              Define when the transfer begins, when it expires, and the official absence reason.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 700 }}>
                Effective Start Date <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="form-control"
                style={{ fontSize: '0.8125rem' }}
              />
            </div>
            <div>
              <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 700 }}>
                Effective End Date <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="form-control"
                style={{ fontSize: '0.8125rem' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 700 }}>
              Absence Reason <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value as any)}
              className="form-control"
              style={{ fontSize: '0.8125rem' }}
            >
              <option value="LEAVE">Approved Leave</option>
              <option value="VACATION">Vacation / Semester Break</option>
              <option value="OFFICIAL_DUTY">Official University Duty</option>
              <option value="WEEK_OFF">Scheduled Week Off Coverage</option>
              <option value="TEMPORARY_ASSIGNMENT">Temporary Special Assignment</option>
              <option value="EMERGENCY">Medical / Personal Emergency</option>
              <option value="OTHER">Other Administrative Reason</option>
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 700 }}>
              Special Instructions / Notes for Recipient
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              placeholder="e.g. Please verify student bonafide applications before Friday exam council meeting."
              className="form-control"
              style={{ fontSize: '0.8125rem' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
            <button onClick={() => setCurrentStep(2)} className="btn btn-secondary btn-sm">
              ← Back to Recipient
            </button>
            <button
              onClick={() => {
                if (!startDate || !endDate) {
                  setErrorMessage('Start and End dates are required.');
                  return;
                }
                setErrorMessage('');
                setCurrentStep(4);
              }}
              className="btn btn-primary btn-sm"
              style={{ background: 'var(--brand-orange, #F37023)', border: 'none', fontWeight: 800, padding: '0.5rem 1.25rem' }}
            >
              Review Transfer Summary →
            </button>
          </div>
        </div>
      )}

      {/* ─── STEP 4: REVIEW & CONFIRMATION ─── */}
      {currentStep === 4 && (
        <div className="card" style={{ padding: '1.5rem', background: 'var(--bg-surface, #FFFFFF)' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--brand-navy, #0B192C)', margin: 0 }}>
              Step 4: Review &amp; Confirm Responsibility Transfer
            </h3>
            <p style={{ fontSize: '0.78125rem', color: 'var(--text-muted, #64748B)', margin: '2px 0 0 0' }}>
              Please review all transfer details before submitting to the SSIU audit ledger.
            </p>
          </div>

          {/* Warning Banner */}
          <div style={{ padding: '1rem', background: '#FEF3C7', borderLeft: '4px solid #F59E0B', borderRadius: '6px', color: '#92400E', fontSize: '0.8125rem', marginBottom: '1.25rem', display: 'flex', gap: '8px' }}>
            <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Responsibility Warning:</strong> You are transferring official operational responsibility for these {selectedWorkItemIds.length} tasks. During the active transfer period, they will be hidden from your active queue and assigned to the recipient. Upon expiry or revocation, remaining incomplete items will restore to you.
            </div>
          </div>

          {/* Live Summary Card */}
          <div style={{ background: 'var(--bg-surface-hover, #F8FAFC)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-color, #E2E8F0)', marginBottom: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', fontSize: '0.8125rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted, #64748B)', display: 'block', fontSize: '0.7rem' }}>ORIGIN USER (FROM)</span>
                <strong style={{ fontSize: '0.9375rem', color: 'var(--brand-navy, #0B192C)' }}>{user?.name || 'Faculty Member'}</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748B)' }}>{user?.role || 'FACULTY'}</div>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted, #64748B)', display: 'block', fontSize: '0.7rem' }}>RECIPIENT USER (TO)</span>
                <strong style={{ fontSize: '0.9375rem', color: 'var(--brand-orange, #F37023)' }}>{selectedRecipient?.name}</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748B)' }}>{selectedRecipient?.designation} • {selectedRecipient?.departmentName}</div>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted, #64748B)', display: 'block', fontSize: '0.7rem' }}>EFFECTIVE PERIOD</span>
                <strong>{startDate}</strong> to <strong>{endDate}</strong>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted, #64748B)', display: 'block', fontSize: '0.7rem' }}>ABSENCE REASON</span>
                <Badge variant="orange">{reason}</Badge>
              </div>
            </div>

            {remarks && (
              <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color, #E2E8F0)', fontSize: '0.78125rem' }}>
                <span style={{ color: 'var(--text-muted, #64748B)' }}>Instructions: </span>
                <em>{remarks}</em>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={() => setCurrentStep(3)} className="btn btn-secondary btn-sm">
              ← Back to Details
            </button>
            <button
              onClick={handleFinalSubmit}
              className="btn btn-primary btn-sm"
              style={{
                background: 'linear-gradient(135deg, #F37023 0%, #D95D16 100%)',
                border: 'none',
                fontWeight: 900,
                fontSize: '0.875rem',
                padding: '0.6rem 1.5rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Send size={15} /> Authorize &amp; Submit Transfer ({selectedWorkItemIds.length} Tasks)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
