import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Badge } from '../../components/common/Badge';
import { UserCheck, Calendar, Clock, MessageSquare, Plus, CheckCircle, User } from 'lucide-react';

interface MentoringSession {
  id: string;
  studentName: string;
  enrollmentNo: string;
  facultyName: string;
  topic: string;
  date: string;
  timeSlot: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
}

const initialSessions: MentoringSession[] = [
  {
    id: 'ms-1',
    studentName: 'Aarav Patel',
    enrollmentNo: '230101001',
    facultyName: 'Prof. Rajesh Sharma',
    topic: 'Career Pathway Guidance & Internship Opportunities',
    date: '2024-03-12',
    timeSlot: '03:00 PM - 03:30 PM',
    status: 'COMPLETED',
    notes: 'Discussed Semester 5 elective choices and AI/ML project domain.'
  },
  {
    id: 'ms-2',
    studentName: 'Ananya Roy',
    enrollmentNo: '230101002',
    facultyName: 'Dr. Priya Desai',
    topic: 'Mid-term Attendance & Exam Preparation Counseling',
    date: '2024-03-20',
    timeSlot: '04:00 PM - 04:30 PM',
    status: 'SCHEDULED'
  }
];

export const MentorPage: React.FC = () => {
  const { user, role } = useAuth();
  const [sessions, setSessions] = useState<MentoringSession[]>(initialSessions);
  const [showModal, setShowModal] = useState(false);
  const [topic, setTopic] = useState('');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('02:00 PM - 02:30 PM');

  const facultyList = db.getFaculty();
  const assignedFaculty = facultyList[0]; // Primary Mentor

  const handleBookSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || !date) return;

    const newSess: MentoringSession = {
      id: `ms-${Date.now()}`,
      studentName: user?.name || 'Aarav Patel',
      enrollmentNo: '230101001',
      facultyName: assignedFaculty.name,
      topic,
      date,
      timeSlot,
      status: 'SCHEDULED'
    };

    setSessions([newSess, ...sessions]);
    setShowModal(false);
    setTopic('');
    setDate('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
            Faculty Mentorship &amp; Counseling Portal
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            {role === 'STUDENT'
              ? 'Connect with your assigned Faculty Mentor for academic counseling, career advice, and project guidance'
              : 'Manage assigned student mentees, counseling schedules, and academic progress notes'}
          </p>
        </div>

        {role === 'STUDENT' && (
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            <Plus size={16} /> Book Mentoring Session
          </button>
        )}
      </div>

      {/* Mentor Profile Card */}
      <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, var(--brand-navy) 0%, #1a365d 100%)', color: '#FFF' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--brand-gold)', color: 'var(--brand-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800 }}>
            {assignedFaculty.name.charAt(0)}
          </div>
          <div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--brand-gold)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Assigned Faculty Mentor
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0.2rem 0' }}>{assignedFaculty.name}</h3>
            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>{assignedFaculty.designation} • Department of Computer Engineering</div>
            <div style={{ fontSize: '0.8125rem', opacity: 0.8, marginTop: '0.25rem' }}>Email: {assignedFaculty.email} • Cabin: Room 304, IT Block</div>
          </div>
        </div>
      </div>

      {/* Counseling Schedule Table */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1.25rem' }}>
          Mentoring Sessions Register ({sessions.length})
        </h3>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Mentee Candidate</th>
                <th>Mentor</th>
                <th>Counseling Topic</th>
                <th>Date &amp; Time</th>
                <th>Status</th>
                <th>Notes / Feedback</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map(s => (
                <tr key={s.id}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{s.studentName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.enrollmentNo}</div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{s.facultyName}</td>
                  <td style={{ maxWidth: '240px', fontWeight: 600, color: 'var(--brand-navy)' }}>{s.topic}</td>
                  <td style={{ fontSize: '0.8125rem' }}>
                    <div>{s.date}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.timeSlot}</div>
                  </td>
                  <td>
                    <Badge variant={s.status === 'COMPLETED' ? 'active' : 'orange'}>{s.status}</Badge>
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    {s.notes || 'Session pending.'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                Book Mentoring Session
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
            </div>

            <form onSubmit={handleBookSession} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              <div className="form-group">
                <label className="form-label">Counseling Topic *</label>
                <input type="text" required className="form-input" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g., Internship Guidance & AI Project Discussion" />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Preferred Date *</label>
                  <input type="date" required className="form-input" value={date} onChange={e => setDate(e.target.value)} />
                </div>

                <div className="form-group">
                  <label className="form-label">Time Slot *</label>
                  <select className="form-select" value={timeSlot} onChange={e => setTimeSlot(e.target.value)}>
                    <option value="02:00 PM - 02:30 PM">02:00 PM - 02:30 PM</option>
                    <option value="03:00 PM - 03:30 PM">03:00 PM - 03:30 PM</option>
                    <option value="04:00 PM - 04:30 PM">04:00 PM - 04:30 PM</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Book Session</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
