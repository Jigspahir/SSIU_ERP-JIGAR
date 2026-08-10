import React, { useState } from 'react';
import { Badge } from '../../components/common/Badge';
import { Bell, CheckCircle, Clock, FileText, ShieldAlert } from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  category: 'ATTENDANCE' | 'EXAM' | 'FEES' | 'ASSIGNMENT' | 'SYSTEM';
  timestamp: string;
  message: string;
  isRead: boolean;
}

const initialNotifications: NotificationItem[] = [
  {
    id: 'nt-1',
    title: 'Mid-Sem Exam Hall Ticket Approved',
    category: 'EXAM',
    timestamp: 'Today, 10:15 AM',
    message: 'Your exam hall ticket HT-2024-001 has been verified and issued by Controller of Examinations. Click to view/download.',
    isRead: false
  },
  {
    id: 'nt-2',
    title: 'Fee Payment Receipt Confirmation',
    category: 'FEES',
    timestamp: 'Yesterday, 04:30 PM',
    message: 'Payment of ₹500 for Mid-Sem Exam Registration fee has been successfully credited (Txn: TXN-EXAM-991201).',
    isRead: true
  },
  {
    id: 'nt-3',
    title: 'Attendance Shortage Alert',
    category: 'ATTENDANCE',
    timestamp: '05 Mar 2024',
    message: 'Your attendance in Data Structures & Algorithms (CSE-101) is 85%. Minimum 75% required for exam eligibility.',
    isRead: true
  }
];

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
            System Notifications &amp; Alerts Log
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Real-time updates regarding Exam Forms, Hall Tickets, Fee Receipts, and Academic Announcements
          </p>
        </div>

        <button onClick={markAllRead} className="btn btn-secondary btn-sm">
          <CheckCircle size={14} /> Mark All as Read
        </button>
      </div>

      <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {notifications.map(n => (
          <div key={n.id} style={{ padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', background: n.isRead ? 'var(--bg-surface-hover)' : '#FFF9E6', borderLeft: n.isRead ? '4px solid var(--brand-navy)' : '4px solid var(--brand-orange)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <Badge variant={n.category === 'EXAM' ? 'orange' : 'navy'}>{n.category}</Badge>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{n.timestamp}</span>
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--brand-navy)' }}>{n.title}</h4>
              <p style={{ fontSize: '0.84375rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>{n.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
