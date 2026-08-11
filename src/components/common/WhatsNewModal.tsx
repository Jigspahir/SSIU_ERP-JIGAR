import React, { useState } from 'react';
import { Sparkles, Bell, X, Check, ArrowRight, CheckCheck, Calendar, BookOpen, FileText, Award, DollarSign, Clock } from 'lucide-react';
import { ERPNotification, NotificationModule } from '../../types';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { Badge } from './Badge';

interface WhatsNewModalProps {
  notifications: ERPNotification[];
  onClose: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const WhatsNewModal: React.FC<WhatsNewModalProps> = ({ notifications, onClose, onNavigateTab }) => {
  const { user, role } = useAuth();
  const [unreadList, setUnreadList] = useState<ERPNotification[]>(notifications);

  const getModuleBadge = (module: NotificationModule) => {
    switch (module) {
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

  const handleMarkRead = (notifId: string) => {
    if (user?.id) {
      db.markNotificationAsRead(notifId, user.id);
    }
    setUnreadList(prev => prev.filter(n => n.id !== notifId));
  };

  const handleMarkAllRead = () => {
    db.markAllNotificationsAsRead(user, role);
    setUnreadList([]);
    onClose();
  };

  if (unreadList.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(7, 19, 37, 0.7)',
        backdropFilter: 'blur(4px)',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '620px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          border: '1px solid rgba(243, 112, 35, 0.3)',
          overflow: 'hidden',
          animation: 'fadeIn 0.25s ease-out'
        }}
      >
        {/* Header Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0F2C59 0%, #183B70 60%, #F37023 100%)',
            padding: '1.25rem 1.5rem',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Bell size={22} color="#F5A623" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
                What&apos;s New &amp; Important Updates
              </h3>
              <p style={{ fontSize: '0.8125rem', margin: 0, color: 'rgba(255,255,255,0.85)' }}>
                You have {unreadList.length} unread system notice{unreadList.length > 1 ? 's' : ''} since last session
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              padding: '0.25rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.8
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Notifications List Body */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            background: 'var(--bg-main)'
          }}
        >
          {unreadList.map(n => (
            <div
              key={n.id}
              style={{
                padding: '1rem 1.15rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderLeft: '4px solid var(--brand-orange)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                transition: 'transform 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {getModuleBadge(n.module)}
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> {n.timestamp}
                  </span>
                </div>

                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => handleMarkRead(n.id)}
                  style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', color: 'var(--text-muted)' }}
                  title="Dismiss notification"
                >
                  <Check size={14} /> Mark Read
                </button>
              </div>

              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--brand-navy)', margin: 0 }}>
                {n.title}
              </h4>
              <p style={{ fontSize: '0.84375rem', color: 'var(--text-main)', margin: 0, lineHeight: 1.45 }}>
                {n.message}
              </p>

              {n.linkTab && onNavigateTab && (
                <div style={{ marginTop: '0.25rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
                    onClick={() => {
                      handleMarkRead(n.id);
                      onNavigateTab(n.linkTab!);
                      onClose();
                    }}
                  >
                    View Details <ArrowRight size={13} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border-color)',
            background: 'var(--bg-surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}
        >
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleMarkAllRead}
            style={{ fontSize: '0.8125rem' }}
          >
            <CheckCheck size={15} color="#10B981" /> Mark All as Read
          </button>

          <button
            className="btn btn-primary btn-sm"
            onClick={onClose}
            style={{ fontSize: '0.8125rem', padding: '0.5rem 1.25rem' }}
          >
            Continue to ERP
          </button>
        </div>
      </div>
    </div>
  );
};
