import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { workTransferService } from '../../services/workTransferService';
import { WorkItemSummary, WorkTransferRecord } from '../../types/workTransfer';
import { WorkAssignmentHistoryModal } from '../../components/work-transfer/WorkAssignmentHistoryModal';
import { Badge } from '../../components/common/Badge';
import { 
  Inbox, UserCheck, Calendar, CheckCircle2, History, AlertTriangle, 
  ArrowRight, Search, CheckSquare, Clock, ArrowLeftRight
} from 'lucide-react';

interface ReceivedWorkPageProps {
  setActiveTab?: (tab: string, params?: any) => void;
}

export const ReceivedWorkPage: React.FC<ReceivedWorkPageProps> = ({ setActiveTab }) => {
  const { user } = useAuth();
  const currentUserId = user?.id || 'fac-1';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHistoryWorkItem, setSelectedHistoryWorkItem] = useState<{ id: string; title: string } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    workTransferService.autoSyncTransferStatuses();
  }, [refreshKey]);

  // Retrieve incoming active transfers to current user
  const activeIncomingTransfers = useMemo(() => {
    const active = workTransferService.getActiveTransfers();
    return active.filter(t => t.toUserId === currentUserId);
  }, [currentUserId, refreshKey]);

  // Extract work items delegated to this user
  const receivedWorkItems: Array<WorkItemSummary & { transferMeta: WorkTransferRecord }> = useMemo(() => {
    const items: Array<WorkItemSummary & { transferMeta: WorkTransferRecord }> = [];

    activeIncomingTransfers.forEach(transfer => {
      // Find all tasks from fromUser
      const fromItems = workTransferService.getAssignableWorkItemsForUser(transfer.fromUserId);
      
      transfer.workItemIds.forEach(itemId => {
        const found = fromItems.find(i => i.id === itemId);
        if (found) {
          items.push({
            ...found,
            currentAssigneeId: currentUserId,
            currentAssigneeName: user?.name || 'Delegated Assignee',
            isDelegated: true,
            delegationLabel: `Delegated from ${transfer.fromUserName}`,
            transferMeta: transfer
          });
        }
      });
    });

    return items;
  }, [activeIncomingTransfers, currentUserId, user, refreshKey]);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return receivedWorkItems;
    const q = searchQuery.toLowerCase();
    return receivedWorkItems.filter(item => 
      item.title.toLowerCase().includes(q) ||
      (item.studentName && item.studentName.toLowerCase().includes(q)) ||
      (item.transferMeta.fromUserName && item.transferMeta.fromUserName.toLowerCase().includes(q)) ||
      (item.transferMeta.trackingCode && item.transferMeta.trackingCode.toLowerCase().includes(q))
    );
  }, [receivedWorkItems, searchQuery]);

  const handleCompleteTask = (item: WorkItemSummary & { transferMeta: WorkTransferRecord }) => {
    try {
      workTransferService.markWorkItemCompleted(item.id, currentUserId, user?.name || 'Faculty Member');
      setRefreshKey(k => k + 1);
    } catch (err: any) {
      alert(err.message || 'Failed to complete task.');
    }
  };

  const handleOpenWork = (item: WorkItemSummary) => {
    if (setActiveTab) {
      if (item.type === 'STUDENT_REQUEST') {
        setActiveTab('requests', { requestId: item.id });
      } else if (item.type === 'EDP_DUTY') {
        setActiveTab('edp-duties', { recordId: item.id });
      } else if (item.type === 'EXAM_VERIFICATION') {
        setActiveTab('exam-forms', { recordId: item.id });
      } else if (item.type === 'DOCUMENT_VERIFICATION') {
        setActiveTab('student-documents', { recordId: item.id });
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
            <Inbox size={24} color="var(--brand-orange, #F37023)" />
            <h1 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
              Received Work / Inbound Delegations
            </h1>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.85)', margin: '6px 0 0 0' }}>
            Work responsibilities temporarily delegated to you by colleagues during their leave or absence.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => setActiveTab && setActiveTab('work-transfer')}
            className="btn btn-secondary btn-sm"
            style={{ background: 'rgba(255,255,255,0.15)', color: '#FFFFFF', borderColor: 'transparent' }}
          >
            My Main Workload
          </button>
        </div>
      </div>

      {/* ─── Search & Metrics ─── */}
      <div className="card" style={{ padding: '1rem 1.25rem', background: 'var(--bg-surface, #FFFFFF)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--brand-navy, #0B192C)' }}>
              {receivedWorkItems.length} Delegated Work Items Active
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748B)' }}>
              across {activeIncomingTransfers.length} active transfer orders
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 240px', maxWidth: '360px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted, #64748B)' }} />
              <input
                type="text"
                placeholder="Search received tasks, colleagues, tracking code..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="form-control form-control-sm"
                style={{ paddingLeft: '32px', borderRadius: '20px', fontSize: '0.78125rem' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Received Work Items Table ─── */}
      {filteredItems.length === 0 ? (
        <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center', background: 'var(--bg-surface, #FFFFFF)' }}>
          <Inbox size={40} color="#94A3B8" style={{ margin: '0 auto 0.75rem auto' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--brand-navy, #0B192C)' }}>No Received Work At This Time</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #64748B)', margin: '4px 0 0 0' }}>
            You currently have no active work responsibilities transferred to you from other faculty members.
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, background: 'var(--bg-surface, #FFFFFF)', overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Task Title &amp; Description</th>
                  <th>Original Owner (Delegated By)</th>
                  <th>Transfer Reason &amp; Order</th>
                  <th>Effective Period</th>
                  <th>Priority</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => {
                  const isCompleted = item.transferMeta.completedItemIds.includes(item.id);
                  return (
                    <tr key={item.id} style={{ background: isCompleted ? 'rgba(16, 185, 129, 0.04)' : 'transparent' }}>
                      <td>
                        <div style={{ fontWeight: 800, color: 'var(--brand-navy, #0B192C)', fontSize: '0.875rem' }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748B)', marginTop: '2px' }}>
                          {item.description || item.module}
                        </div>
                        {item.studentName && (
                          <div style={{ fontSize: '0.71875rem', color: 'var(--brand-navy, #0B192C)', marginTop: '2px' }}>
                            Student: <strong>{item.studentName}</strong> (<code>{item.enrollmentNo || item.studentEnrollment || item.studentId}</code>)
                          </div>
                        )}
                      </td>
                      <td>
                        <strong style={{ fontSize: '0.8125rem', color: 'var(--brand-navy, #0B192C)' }}>
                          {item.transferMeta.fromUserName}
                        </strong>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted, #64748B)' }}>
                          {item.transferMeta.fromUserRole} • {item.transferMeta.fromUserDepartmentName || 'Department'}
                        </div>
                      </td>
                      <td>
                        <Badge variant="orange">{item.transferMeta.reason}</Badge>
                        <code style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted, #64748B)', marginTop: '2px' }}>
                          {item.transferMeta.trackingCode}
                        </code>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.78125rem' }}>
                          <strong>{item.transferMeta.startAt}</strong> to <strong>{item.transferMeta.endAt}</strong>
                        </div>
                      </td>
                      <td>
                        <Badge variant={item.priority === 'CRITICAL' ? 'danger' : 'orange'}>{item.priority}</Badge>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          {isCompleted ? (
                            <Badge variant="success">Completed</Badge>
                          ) : (
                            <>
                              <button
                                onClick={() => handleOpenWork(item)}
                                className="btn btn-primary btn-sm"
                                style={{
                                  fontSize: '0.71875rem',
                                  padding: '3px 8px',
                                  background: 'var(--brand-navy, #0B192C)',
                                  border: 'none',
                                  fontWeight: 700
                                }}
                              >
                                Open Work
                              </button>
                              <button
                                onClick={() => handleCompleteTask(item)}
                                className="btn btn-primary btn-sm"
                                style={{
                                  fontSize: '0.71875rem',
                                  padding: '3px 8px',
                                  background: '#10B981',
                                  border: 'none',
                                  fontWeight: 700
                                }}
                              >
                                Complete
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setSelectedHistoryWorkItem({ id: item.id, title: item.title })}
                            className="btn btn-secondary btn-sm"
                            style={{
                              fontSize: '0.71875rem',
                              padding: '3px 8px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}
                            title="View Transfer Timeline"
                          >
                            <History size={12} /> Details
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
      )}

      {/* Assignment History Modal */}
      <WorkAssignmentHistoryModal
        isOpen={Boolean(selectedHistoryWorkItem)}
        onClose={() => setSelectedHistoryWorkItem(null)}
        workItemId={selectedHistoryWorkItem?.id || null}
        workItemTitle={selectedHistoryWorkItem?.title}
      />
    </div>
  );
};
