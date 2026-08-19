import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Badge } from '../../components/common/Badge';
import { TimetableEntry } from '../../types';
import { Calendar, Clock, MapPin, Plus, Trash2, BookOpen, User, CheckCircle2 } from 'lucide-react';

export const TimetablePage: React.FC = () => {
  const { user, role } = useAuth();

  const subjects = db.getSubjects();
  const divisions = db.getDivisions();
  const facultyList = db.getFaculty();
  const timetableEntries = db.getTimetableEntries();

  const [activeDay, setActiveDay] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'>('Monday');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State for Admin Creator Modal
  const [dayOfWeek, setDayOfWeek] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'>('Monday');
  const [timeSlot, setTimeSlot] = useState('09:00 AM - 10:00 AM');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [facultyId, setFacultyId] = useState(facultyList[0]?.id || '');
  const [divisionId, setDivisionId] = useState(divisions[0]?.id || '');
  const [roomNo, setRoomNo] = useState('Lab-301');

  const days: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday')[] = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];

  const handleCreateTimetable = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: Omit<TimetableEntry, 'id'> = {
      dayOfWeek,
      timeSlot,
      subjectId,
      facultyId,
      divisionId,
      roomNo,
      departmentId: 'dept-1',
      status: 'ACTIVE'
    };

    db.addEntity<TimetableEntry>('timetableEntries', newEntry, `Added timetable slot ${timeSlot} on ${dayOfWeek}`);
    setIsAddModalOpen(false);
  };

  const handleDeleteSlot = (id: string) => {
    if (window.confirm('Are you sure you want to delete this timetable entry?')) {
      db.deleteEntity('timetableEntries', id, 'Deleted timetable entry');
    }
  };

  // Filter entries for active day tab & role
  const dayEntries = timetableEntries.filter(t => {
    if (t.dayOfWeek !== activeDay) return false;
    if (role === 'FACULTY' && user) {
      const fac = facultyList.find(f => f.id === user.id || f.email === user.email);
      const facId = fac?.id || user.id;
      return t.facultyId === facId || t.facultyId === user.id;
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
            Class &amp; Lecture Timetable
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            {role === 'STUDENT' ? 'View your daily class schedule & room assignments' : role === 'FACULTY' ? 'View your assigned teaching lectures & lab slots' : 'Schedule and manage master timetable slots'}
          </p>
        </div>

        {role !== 'STUDENT' && role !== 'FACULTY' && (
          <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={16} /> Add Timetable Slot
          </button>
        )}
      </div>

      {/* Day Selector Tabs */}
      <div className="card" style={{ padding: '0.75rem 1rem', display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
        {days.map(d => (
          <button
            key={d}
            onClick={() => setActiveDay(d)}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: activeDay === d ? 'var(--brand-orange)' : 'transparent',
              color: activeDay === d ? '#FFFFFF' : 'var(--text-main)',
              fontWeight: activeDay === d ? 700 : 500,
              fontSize: '0.875rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all var(--transition-fast)'
            }}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Day Schedule Cards Grid */}
      <div className="grid-2">
        {dayEntries.length === 0 ? (
          <div className="card" style={{ gridColumn: 'span 2', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Calendar size={48} color="var(--brand-gold)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <h4 style={{ fontSize: '1.125rem', fontWeight: 700 }}>No Lectures Scheduled for {activeDay}</h4>
            <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>Select another day or add a new schedule slot.</p>
          </div>
        ) : (
          dayEntries.map(entry => {
            const subj = db.getSubjectById(entry.subjectId);
            const fac = facultyList.find(f => f.id === entry.facultyId);
            const div = db.getDivisionById(entry.divisionId);

            return (
              <div key={entry.id} className="card card-hover" style={{ padding: '1.5rem', borderLeft: '4px solid var(--brand-navy)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--brand-orange)', fontWeight: 800, fontSize: '0.9375rem' }}>
                    <Clock size={18} /> {entry.timeSlot}
                  </div>
                  <Badge variant="active">{subj?.type || 'THEORY'}</Badge>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '0.5rem' }}>
                  {subj?.name || 'Subject'} ({subj?.code})
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.84375rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <User size={15} color="var(--brand-navy-medium)" />
                    <span>Faculty: <strong>{fac ? fac.name : 'Assigned Faculty'}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MapPin size={15} color="var(--brand-gold)" />
                    <span>Classroom / Venue: <strong>{entry.roomNo}</strong> ({div?.name})</span>
                  </div>
                </div>

                {role !== 'STUDENT' && role !== 'FACULTY' && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteSlot(entry.id)}>
                      <Trash2 size={14} /> Remove Slot
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Slot Modal */}
      {isAddModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1.25rem' }}>
              Add Timetable Slot Entry
            </h3>

            <form onSubmit={handleCreateTimetable} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Day *</label>
                  <select className="form-select" value={dayOfWeek} onChange={e => setDayOfWeek(e.target.value as any)}>
                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Time Slot *</label>
                  <input type="text" className="form-input" value={timeSlot} onChange={e => setTimeSlot(e.target.value)} placeholder="09:00 AM - 10:00 AM" required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Subject *</label>
                <select className="form-select" value={subjectId} onChange={e => setSubjectId(e.target.value)}>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                </select>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Faculty *</label>
                  <select className="form-select" value={facultyId} onChange={e => setFacultyId(e.target.value)}>
                    {facultyList.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Division *</label>
                  <select className="form-select" value={divisionId} onChange={e => setDivisionId(e.target.value)}>
                    {divisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Room / Lab No *</label>
                <input type="text" className="form-input" value={roomNo} onChange={e => setRoomNo(e.target.value)} placeholder="Lab-301" required />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
