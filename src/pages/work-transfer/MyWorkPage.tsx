import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { workTransferService } from '../../services/workTransferService';
import { WorkItemSummary, WorkItemType } from '../../types/workTransfer';
import { WorkAssignmentHistoryModal } from '../../components/work-transfer/WorkAssignmentHistoryModal';
import { Badge } from '../../components/common/Badge';
import { 
  CheckSquare, ArrowLeftRight, Clock, AlertTriangle, CheckCircle2, 
  History, Calendar, Filter, Search, Plus, ArrowUpRight, Flame, UserCheck
} from 'lucide-react';

interface MyWorkPageProps {
  setActiveTab?: (tab: string, params?: any) => void;
}

export const MyWorkPage: React.FC<MyWorkPageProps> = ({ setActiveTab }) => {
  const { user } = useAuth();
  const [filterSection, setFilterSection] = useState<'ALL' | 'PENDING' | 'IN_PROGRESS' | 'DUE_TODAY' | 'OVERDUE' | 'COMPLETED'>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHistoryWorkItem, setSelectedHistoryWorkItem] = useState<{ id: string; title: string } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const currentUserId = user?.id || 'fac-1';

  useEffect(() => {
    workTransferService.autoSyncTransferStatuses();
  }, [refreshKey]);

  // Load active assignable items for current user (which automatically handles active delegations in/out)
  const allItems: WorkItemSummary[] = useMemo(() => {
    return workTransferService.getAssignableWorkItemsForUser(currentUserId);
  }, [currentUserId, refreshKey]);

  const todayStr = new Date().toISOString().slice(0, 10);

  // Compute breakdown counts
  const pendingCount = useMemo(() => allItems.filter(i => i.status === 'PENDING').length, [allItems]);
  const inProgressCount = useMemo(() => allItems.filter(i => i.status === 'IN_PROGRESS').length, [allItems]);
  const dueTodayCount = useMemo(() => allItems.filter(i => i.dueDate && i.dueDate.slice(0, 10) === todayStr).length, [allItems, todayStr]);
  const overdueCount = useMemo(() => allItems.filter(i => i.dueDate && i.dueDate.slice(0, 10) < todayStr && i.status !== 'COMPLETED').length, [allItems, todayStr]);
  const completedCount = useMemo(() => allItems.filter(i => i.status === 'COMPLETED').length, [allItems]);

  // Filter items
  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      // Section filter
      if (filterSection === 'PENDING' && item.status !== 'PENDING') return false;
      if (filterSection === 'IN_PROGRESS' && item.status !== 'IN_PROGRESS') return false;
      if (filterSection === 'DUE_TODAY' && (!item.dueDate || item.dueDate.slice(0, 10) !== todayStr)) return false;
      if (filterSection === 'OVERDUE' && (!item.dueDate || item.dueDate.slice(0, 10) >= todayStr || item.status === 'COMPLETED')) return false;
      if (filterSection === 'COMPLETED' && item.status !== 'COMPLETED') return false;

      // Module / Type filter
      if (selectedType !== 'ALL' && item.type !== selectedType) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesStudent = item.studentName && item.studentName.toLowerCase().includes(q);
        const matchesEnroll = item.enrollmentNo && item.enrollmentNo.toLowerCase().includes(q);
        const matchesDept = item.departmentName && item.departmentName.toLowerCase().includes(q);
        if (!matchesTitle && !matchesStudent && !matchesEnroll && !matchesDept) return false;
      }

      return true;
    });
  }, [allItems, filterSection, selectedType, searchQuery, todayStr]);

  const handleAction = (item: WorkItemSummary) => {
    if (setActiveTab) {
      if (item.type === 'STUDENT_REQUEST') {
        setActiveTab('requests', { requestId: item.id });
      } else if (item.type === 'EDP_DUTY') {
        setActiveTab('edp-duties', { recordId: item.id });
      } else if (item.type === 'EXAM_VERIFICATION') {
        setActiveTab('exam-forms', { recordId: item.id });
      } else if (item.type === 'DOCUMENT_VERIFICATION') {
        setActiveTab('student-documents', { recordId: item.id });
      } else {
        setActiveTab('work-transfer-new');
      }
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return <Badge variant="danger">CRITICAL</Badge>;
      case 'HIGH': return <Badge variant="orange">HIGH</Badge>;
      case 'MEDIUM': return <Badge variant="warning">MEDIUM</Badge>;
      default: return <Badge variant="inactive">LOW</Badge>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* ─── Header Banner ─── */}
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
          gap: '1rem',
          boxShadow: '0 4px 12px rgba(11, 25, 44, 0.15)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CheckSquare size={24} color="var(--brand-orange, #F37023)" />
            <h1 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
              My Work / Active Workload
            </h1>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.85)', margin: '6px 0 0 0' }}>
            Your current academic and administrative workload. Tasks transferred away on leave are hidden; received delegations appear here.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => setActiveTab && setActiveTab('work-transfer-new')}
            className="btn btn-primary btn-sm"
            style={{
              background: 'var(--brand-orange, #F37023)',
              borderColor: 'var(--brand-orange, #F37023)',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '0.8125rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.5rem 1rem'
            }}
          >
            <ArrowLeftRight size={15} /> Transfer Work
          </button>
        </div>
      </div>

      {/* ─── Top Stats Breakdown ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
        <div 
          onClick={() => setFilterSection('ALL')}
          className="card" 
          style={{ 
            padding: '1rem', 
            background: 'var(--bg-surface, #FFFFFF)', 
            borderLeft: '4px solid var(--brand-navy, #0B192C)',
            cursor: 'pointer',
            boxShadow: filterSection === 'ALL' ? '0 0 0 2px var(--brand-navy, #0B192C)' : 'none'
          }}
        >
          <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-muted, #64748B)' }}>TOTAL WORKLOAD</span>
          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--brand-navy, #0B192C)', marginTop: '2px' }}>
            {allItems.length} Tasks
          </div>
          <div style={{ fontSize: '0.725rem', color: 'var(--text-muted, #64748B)' }}>Active Responsibilities</div>
        </div>

        <div 
          onClick={() => setFilterSection('PENDING')}
          className="card" 
          style={{ 
            padding: '1rem', 
            background: 'var(--bg-surface, #FFFFFF)', 
            borderLeft: '4px solid var(--brand-orange, #F37023)',
            cursor: 'pointer',
            boxShadow: filterSection === 'PENDING' ? '0 0 0 2px var(--brand-orange, #F37023)' : 'none'
          }}
        >
          <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-muted, #64748B)' }}>NEW / PENDING</span>
          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--brand-orange, #F37023)', marginTop: '2px' }}>
            {pendingCount} Tasks
          </div>
          <div style={{ fontSize: '0.725rem', color: 'var(--text-muted, #64748B)' }}>Awaiting Action</div>
        </div>

        <div 
          onClick={() => setFilterSection('IN_PROGRESS')}
          className="card" 
          style={{ 
            padding: '1rem', 
            background: 'var(--bg-surface, #FFFFFF)', 
            borderLeft: '4px solid #3B82F6',
            cursor: 'pointer',
            boxShadow: filterSection === 'IN_PROGRESS' ? '0 0 0 2px #3B82F6' : 'none'
          }}
        >
          <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-muted, #64748B)' }}>IN PROGRESS</span>
          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#1D4ED8', marginTop: '2px' }}>
            {inProgressCount} Tasks
          </div>
          <div style={{ fontSize: '0.725rem', color: 'var(--text-muted, #64748B)' }}>Under Processing</div>
        </div>

        <div 
          onClick={() => setFilterSection('DUE_TODAY')}
          className="card" 
          style={{ 
            padding: '1rem', 
            background: 'var(--bg-surface, #FFFFFF)', 
            borderLeft: '4px solid #F59E0B',
            cursor: 'pointer',
            boxShadow: filterSection === 'DUE_TODAY' ? '0 0 0 2px #F59E0B' : 'none'
          }}
        >
          <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-muted, #64748B)' }}>DUE TODAY</span>
          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#D97706', marginTop: '2px' }}>
            {dueTodayCount} Tasks
          </div>
          <div style={{ fontSize: '0.725rem', color: 'var(--text-muted, #64748B)' }}>High Urgency</div>
        </div>

        <div 
          onClick={() => setFilterSection('OVERDUE')}
          className="card" 
          style={{ 
            padding: '1rem', 
            background: 'var(--bg-surface, #FFFFFF)', 
            borderLeft: '4px solid #EF4444',
            cursor: 'pointer',
            boxShadow: filterSection === 'OVERDUE' ? '0 0 0 2px #EF4444' : 'none'
          }}
        >
          <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#DC2626' }}>OVERDUE</span>
          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#DC2626', marginTop: '2px' }}>
            {overdueCount} Tasks
          </div>
          <div style={{ fontSize: '0.725rem', color: '#DC2626' }}>Immediate Attention</div>
        </div>
      </div>

      {/* ─── Filter Pills & Search ─── */}
      <div className="card" style={{ padding: '1rem 1.25rem', background: 'var(--bg-surface, #FFFFFF)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Section Tabs */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: 'All Work', count: allItems.length },
              { id: 'PENDING', label: 'Pending', count: pendingCount },
              { id: 'IN_PROGRESS', label: 'In Progress', count: inProgressCount },
              { id: 'DUE_TODAY', label: 'Due Today', count: dueTodayCount },
              { id: 'OVERDUE', label: 'Overdue', count: overdueCount },
              { id: 'COMPLETED', label: 'Completed', count: completedCount },
            ].map(tab => {
              const active = filterSection === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFilterSection(tab.id as any)}
                  style={{
                    padding: '0.4rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.78125rem',
                    fontWeight: active ? 800 : 600,
                    border: 'none',
                    background: active ? 'var(--brand-navy, #0B192C)' : 'var(--bg-surface-hover, #F1F5F9)',
                    color: active ? '#FFFFFF' : 'var(--text-secondary, #475569)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>{tab.label}</span>
                  <span style={{
                    fontSize: '0.6875rem',
                    background: active ? 'rgba(243,112,35,0.3)' : '#E2E8F0',
                    color: active ? 'var(--brand-gold, #FBBF24)' : '#64748B',
                    padding: '1px 6px',
                    borderRadius: '10px'
                  }}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 240px', maxWidth: '360px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted, #64748B)' }} />
              <input
                type="text"
                placeholder="Search by title, student, department..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="form-control form-control-sm"
                style={{ paddingLeft: '32px', borderRadius: '20px', fontSize: '0.78125rem' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Work Items Table ─── */}
      {filteredItems.length === 0 ? (
        <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center', background: 'var(--bg-surface, #FFFFFF)' }}>
          <CheckCircle2 size={40} color="#10B981" style={{ margin: '0 auto 0.75rem auto' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--brand-navy, #0B192C)' }}>No Work Items Found</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #64748B)', margin: '4px 0 0 0' }}>
            {searchQuery ? 'No tasks match your search filter.' : 'All assigned work items in this category are completely up to date.'}
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, background: 'var(--bg-surface, #FFFFFF)', overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Work Title &amp; Description</th>
                  <th>Category / Module</th>
                  <th>Student / Reference</th>
                  <th>Assigned / Due Date</th>
                  <th>Priority</th>
                  <th>Responsibility Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: 800, color: 'var(--brand-navy, #0B192C)', fontSize: '0.875rem' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748B)', marginTop: '2px' }}>
                        {item.description || item.module}
                      </div>
                    </td>
                    <td>
                      <Badge variant="navy">{item.type.replace('_', ' ')}</Badge>
                      {item.departmentName && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted, #64748B)', marginTop: '2px' }}>
                          {item.departmentName}
                        </div>
                      )}
                    </td>
                    <td>
                      {item.studentName ? (
                        <div>
                          <strong style={{ fontSize: '0.8125rem' }}>{item.studentName}</strong>
                          <code style={{ fontSize: '0.7rem', display: 'block', color: 'var(--text-muted, #64748B)' }}>
                            {item.enrollmentNo || item.studentEnrollment || item.studentId || ''}
                          </code>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted, #64748B)', fontSize: '0.78125rem' }}>University Central</span>
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: '0.78125rem' }}>
                        <span>Assigned: <strong>{(item.assignedAt || item.createdAt || '').slice(0, 10)}</strong></span>
                        {item.dueDate && (
                          <div style={{ color: item.dueDate.slice(0, 10) < todayStr ? '#DC2626' : 'var(--text-muted, #64748B)', fontSize: '0.71875rem' }}>
                            Due: {item.dueDate.slice(0, 10)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>{getPriorityBadge(item.priority)}</td>
                    <td>
                      {item.isReturnedFromDelegation ? (
                        <Badge variant="navy">{item.delegationLabel || 'Returned from Delegation'}</Badge>
                      ) : item.isDelegated ? (
                        <Badge variant="orange">{item.delegationLabel || 'Delegated Task'}</Badge>
                      ) : item.status === 'COMPLETED' ? (
                        <Badge variant="success">Completed</Badge>
                      ) : (
                        <Badge variant="active">Active Assignment</Badge>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => handleAction(item)}
                          className="btn btn-primary btn-sm"
                          style={{
                            fontSize: '0.71875rem',
                            padding: '3px 8px',
                            background: 'var(--brand-navy, #0B192C)',
                            border: 'none',
                            fontWeight: 700
                          }}
                        >
                          Process
                        </button>
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
                          title="View Chronological Assignment & Delegation Chain"
                        >
                          <History size={12} /> History
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
