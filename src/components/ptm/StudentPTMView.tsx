import React from 'react';
import { Calendar, Clock, Video, MapPin, CheckCircle, MessageSquare, AlertCircle, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ptmService } from '../../services/ptmService';
import { db } from '../../services/db';
import { Badge } from '../common/Badge';

export const StudentPTMView: React.FC = () => {
  const { user } = useAuth();
  const currentStudent = db.getStudents().find(s => s.email === user?.email || s.enrollmentNo === user?.username || s.id === user?.id);

  if (!currentStudent) {
    return null;
  }

  const { schedules, records, followUps } = ptmService.getPTMHistoryForStudent(currentStudent.id, user!, 'STUDENT');
  const upcomingSchedule = schedules.find(s => s.status === 'INVITED' || s.status === 'CONFIRMED' || s.status === 'SCHEDULED');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Upcoming PTM Banner */}
      {upcomingSchedule ? (
        <div className="card" style={{ padding: '1.25rem 1.5rem', borderLeft: '4px solid #1E3A8A' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={20} color="#1E3A8A" />
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0F2C59' }}>
                Upcoming Parent–Teacher Meeting (PTM)
              </h3>
            </div>
            <Badge variant={upcomingSchedule.parentResponse === 'CONFIRMED' ? 'active' : 'warning'}>
              Parent Status: {upcomingSchedule.parentResponse}
            </Badge>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', background: '#F8FAFC', padding: '0.85rem', borderRadius: '6px', fontSize: '0.8125rem' }}>
            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem' }}>Event</span>
              <strong>{upcomingSchedule.ptmEventTitle}</strong>
            </div>
            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem' }}>Date &amp; Slot</span>
              <strong>{upcomingSchedule.date} ({upcomingSchedule.slotTime || 'Scheduled Slot'})</strong>
            </div>
            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem' }}>Faculty Mentor</span>
              <strong>{upcomingSchedule.facultyName}</strong>
            </div>
            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem' }}>Venue / Mode</span>
              <strong>{upcomingSchedule.venue} ({upcomingSchedule.mode})</strong>
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: '1.5rem', textAlign: 'center', color: '#64748B' }}>
          <Calendar size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.3 }} />
          <h4 style={{ margin: 0, color: '#0F2C59' }}>No Active PTM Scheduled</h4>
          <span style={{ fontSize: '0.8125rem' }}>Your next parent consultation schedule will appear here.</span>
        </div>
      )}

      {/* 2-Column: Past PTM Records (Student Visible) & Follow-up Action Items */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        
        {/* Past Records */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.5rem' }}>
            <MessageSquare size={18} color="#0F2C59" />
            <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 800, color: '#0F2C59' }}>
              Faculty Feedback &amp; Mentorship Notes
            </h4>
          </div>

          {records.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {records.map(rec => (
                <div key={rec.id} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0.85rem', borderRadius: '6px', fontSize: '0.8125rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <strong style={{ color: '#0F2C59' }}>PTM on {rec.date}</strong>
                    <Badge variant={rec.outcome === 'SATISFACTORY' ? 'active' : 'warning'}>
                      {rec.outcome}
                    </Badge>
                  </div>
                  <p style={{ margin: '0.35rem 0', color: '#334155', fontStyle: 'italic' }}>
                    "{rec.facultyRemarks}"
                  </p>
                  {rec.areasForImprovement && (
                    <div style={{ fontSize: '0.75rem', color: '#B45309', marginTop: '0.35rem' }}>
                      <strong>Advice:</strong> {rec.areasForImprovement}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748B' }}>
              <p style={{ margin: 0, fontSize: '0.8125rem' }}>No past PTM remarks recorded yet.</p>
            </div>
          )}
        </div>

        {/* Assigned Follow-Up Actions */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.5rem' }}>
            <FileText size={18} color="#0F2C59" />
            <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 800, color: '#0F2C59' }}>
              My Academic Follow-up Tasks ({followUps.length})
            </h4>
          </div>

          {followUps.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {followUps.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8125rem', border: '1px solid #E2E8F0' }}>
                  <div>
                    <strong style={{ color: '#1E293B' }}>{item.actionDescription}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.15rem' }}>
                      Assigned by: {item.assignedToName} • Due: {item.dueDate}
                    </div>
                  </div>
                  <Badge variant={item.status === 'COMPLETED' ? 'active' : item.status === 'OVERDUE' ? 'danger' : 'warning'}>
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748B' }}>
              <p style={{ margin: 0, fontSize: '0.8125rem' }}>No active follow-up tasks assigned.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
