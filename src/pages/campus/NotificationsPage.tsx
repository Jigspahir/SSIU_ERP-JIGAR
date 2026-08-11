import React, { useState } from 'react';
import { Badge } from '../../components/common/Badge';
import { Bell, CheckCircle, Clock, Filter, Check, ShieldAlert } from 'lucide-react';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { ERPNotification, NotificationModule } from '../../types';

export const NotificationsPage: React.FC = () => {
  const { user, role } = useAuth();
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'UNREAD' | 'READ'>('ALL');
  const [filterModule, setFilterModule] = useState<string>('ALL');
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const allUserNotifs = db.getNotifications(user, role);

  const filteredNotifs = allUserNotifs.filter(n => {
    const isRead = (n.isReadByUsers || []).includes(user?.id || 'guest');
    if (filterStatus === 'UNREAD' && isRead) return false;
    if (filterStatus === 'READ' && !isRead) return false;
    if (filterModule !== 'ALL' && n.module !== filterModule) return false;
    return true;
  });

  const handleMarkRead = (id: string) => {
    if (user?.id) {
      db.markNotificationAsRead(id, user.id);
      setRefreshKey(prev => prev + 1);
    }
  };

  const handleMarkAllRead = () => {
    db.markAllNotificationsAsRead(user, role);
    setRefreshKey(prev => prev + 1);
  };

  const getModuleBadge = (mod: NotificationModule) => {
    switch (mod) {
      case 'EXAM': return <Badge variant="orange">EXAM</Badge>;
      case 'FEES': return <Badge variant="gold">FEE UPDATE</Badge>;
      case 'ASSIGNMENT': return <Badge variant="navy">ASSIGNMENT</Badge>;
      case 'MATERIAL': return <Badge variant="navy">STUDY MATERIAL</Badge>;
      case 'TIMETABLE': return <Badge variant="navy">TIMETABLE</Badge>;
      case 'NOTICE': return <Badge variant="orange">NOTICE</Badge>;
      case 'EVENT': return <Badge variant="gold">EVENT</Badge>;
      case 'APPROVAL': return <Badge variant="active">VERIFIED</Badge>;
      case 'REQUEST': return <Badge variant="navy">REQUEST</Badge>;
      default: return <Badge variant="navy">SYSTEM</Badge>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
            System Notifications &amp; Alerts Log
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Centralized role-based real-time notification directory for Swarrnim ERP
          </p>
        </div>

        <button onClick={handleMarkAllRead} className="btn btn-secondary btn-sm">
          <CheckCircle size={14} color="#10B981" /> Mark All as Read
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} color="var(--brand-orange)" />
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--brand-navy)' }}>Filter Status:</span>
          </div>

          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {(['ALL', 'UNREAD', 'READ'] as const).map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`btn btn-sm ${filterStatus === st ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.8125rem' }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--brand-navy)' }}>Module:</span>
          <select
            className="form-select"
            value={filterModule}
            onChange={e => setFilterModule(e.target.value)}
            style={{ width: 'auto', fontSize: '0.8125rem' }}
          >
            <option value="ALL">All Modules</option>
            <option value="EXAM">Exams</option>
            <option value="FEES">Fees &amp; Finance</option>
            <option value="ASSIGNMENT">Assignments</option>
            <option value="MATERIAL">Study Materials</option>
            <option value="TIMETABLE">Timetable</option>
            <option value="NOTICE">Notices</option>
            <option value="EVENT">Events</option>
            <option value="APPROVAL">Approvals</option>
            <option value="REQUEST">Requests</option>
          </select>
        </div>
      </div>

      {/* Notifications Directory List */}
      <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredNotifs.length === 0 ? (
          <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Bell size={36} color="var(--brand-orange)" style={{ opacity: 0.6, marginBottom: '0.5rem' }} />
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--brand-navy)' }}>No notifications found</div>
            <div style={{ fontSize: '0.8125rem', marginTop: '4px' }}>There are no alerts matching your selected filter criteria.</div>
          </div>
        ) : (
          filteredNotifs.map(n => {
            const isRead = (n.isReadByUsers || []).includes(user?.id || 'guest');
            return (
              <div
                key={n.id}
                style={{
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: isRead ? 'var(--bg-surface-hover)' : '#FFF9E6',
                  borderLeft: isRead ? '4px solid var(--brand-navy)' : '4px solid var(--brand-orange)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}
              >
                <div style={{ flex: 1, minWidth: '260px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    {getModuleBadge(n.module)}
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Clock size={13} /> {n.timestamp}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--brand-navy)', margin: 0 }}>{n.title}</h4>
                  <p style={{ fontSize: '0.84375rem', color: 'var(--text-main)', marginTop: '0.25rem', lineHeight: 1.45 }}>{n.message}</p>
                </div>

                {!isRead && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.8125rem' }}
                  >
                    <Check size={14} color="#10B981" /> Mark Read
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
