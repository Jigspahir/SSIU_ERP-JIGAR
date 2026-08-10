import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Badge } from '../../components/common/Badge';
import { AcademicCalendarEvent } from '../../types';
import { Calendar as CalendarIcon, MapPin, Plus, Trash2, Tag, AlertCircle } from 'lucide-react';

export const AcademicCalendarPage: React.FC = () => {
  const { user, role } = useAuth();

  const events = db.getAcademicCalendarEvents();

  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);

  // Add Event Form State
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState<'HOLIDAY' | 'EXAM' | 'EVENT' | 'SEMINAR' | 'IMPORTANT'>('EVENT');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Swarrnim Campus');
  const [isImportant, setIsImportant] = useState(false);

  const filteredEvents = events.filter(e => {
    const matchesType = selectedType === 'ALL' || e.eventType === selectedType;
    const matchesMonth = selectedMonth === 'ALL' || e.startDate.startsWith(selectedMonth);
    return matchesType && matchesMonth;
  });

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const newEvent: Omit<AcademicCalendarEvent, 'id'> = {
      title,
      eventType,
      startDate,
      endDate,
      description,
      location,
      isImportant,
      createdBy: user?.name || 'Demo Admin'
    };

    db.addEntity<AcademicCalendarEvent>('academicCalendarEvents', newEvent, `Added calendar event: ${title}`);
    setIsAddEventModalOpen(false);
    setTitle('');
    setDescription('');
  };

  const handleDeleteEvent = (id: string) => {
    if (window.confirm('Delete this academic calendar event?')) {
      db.deleteEntity('academicCalendarEvents', id, 'Deleted calendar event');
    }
  };

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'EXAM': return <Badge variant="inactive">EXAM</Badge>;
      case 'HOLIDAY': return <Badge variant="orange">HOLIDAY</Badge>;
      case 'SEMINAR': return <Badge variant="active">SEMINAR</Badge>;
      case 'IMPORTANT': return <Badge variant="inactive">IMPORTANT</Badge>;
      default: return <Badge variant="active">EVENT</Badge>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
            Academic Calendar &amp; University Events
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            {role === 'STUDENT' || role === 'FACULTY' ? 'Track upcoming exams, academic holidays, workshops & university events' : 'Manage academic events, exam dates, holidays & important university schedules'}
          </p>
        </div>

        {role !== 'STUDENT' && role !== 'FACULTY' && (
          <button className="btn btn-primary" onClick={() => setIsAddEventModalOpen(true)}>
            <Plus size={16} /> Add Calendar Event
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div className="grid-2">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Event Category Filter</label>
            <select className="form-select" value={selectedType} onChange={e => setSelectedType(e.target.value)}>
              <option value="ALL">All Categories</option>
              <option value="EXAM">Exams &amp; Tests</option>
              <option value="HOLIDAY">Holidays &amp; Vacations</option>
              <option value="SEMINAR">Seminars &amp; Hackathons</option>
              <option value="EVENT">University Events &amp; Sports</option>
              <option value="IMPORTANT">Important Dates</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Month Filter</label>
            <select className="form-select" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
              <option value="ALL">All Months</option>
              <option value="2024-10">October 2024</option>
              <option value="2024-11">November 2024</option>
              <option value="2024-12">December 2024</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredEvents.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <CalendarIcon size={48} color="var(--brand-gold)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <h4 style={{ fontSize: '1.125rem', fontWeight: 700 }}>No Academic Events Found</h4>
            <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>Try selecting another category or month filter.</p>
          </div>
        ) : (
          filteredEvents.map(evt => (
            <div key={evt.id} className="card card-hover" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem', borderLeft: evt.isImportant ? '5px solid #EF4444' : '5px solid var(--brand-orange)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', flex: 1, minWidth: '280px' }}>
                <div style={{ padding: '0.85rem 1.15rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--brand-navy)', color: '#FFFFFF', textAlign: 'center', minWidth: '80px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-gold)', textTransform: 'uppercase' }}>
                    {new Date(evt.startDate).toLocaleDateString('en-US', { month: 'short' })}
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>
                    {new Date(evt.startDate).getDate()}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    {getEventBadge(evt.eventType)}
                    {evt.isImportant && (
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#EF4444', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <AlertCircle size={14} /> High Priority
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '0.35rem' }}>
                    {evt.title}
                  </h3>

                  <p style={{ fontSize: '0.84375rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '0.5rem' }}>
                    {evt.description}
                  </p>

                  <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.78125rem', color: 'var(--text-muted)' }}>
                    <span>Duration: <strong>{evt.startDate}</strong> to <strong>{evt.endDate}</strong></span>
                    {evt.location && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <MapPin size={13} color="var(--brand-orange)" /> {evt.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {role !== 'STUDENT' && role !== 'FACULTY' && (
                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteEvent(evt.id)}>
                  <Trash2 size={14} /> Remove Event
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Event Modal */}
      {isAddEventModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '520px', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1.25rem' }}>
              Add Academic Calendar Event
            </h3>

            <form onSubmit={handleCreateEvent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Event Category *</label>
                <select className="form-select" value={eventType} onChange={e => setEventType(e.target.value as any)}>
                  <option value="EXAM">Exams &amp; Tests</option>
                  <option value="HOLIDAY">Holiday &amp; Vacation</option>
                  <option value="SEMINAR">Seminar &amp; Workshop</option>
                  <option value="EVENT">University Event &amp; Cultural Fest</option>
                  <option value="IMPORTANT">Important Announcement</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Event Title *</label>
                <input type="text" className="form-input" placeholder="e.g. Mid-Semester Examinations AY 2024-2025" value={title} onChange={e => setTitle(e.target.value)} required />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Start Date *</label>
                  <input type="date" className="form-input" value={startDate} onChange={e => setStartDate(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date *</label>
                  <input type="date" className="form-input" value={endDate} onChange={e => setEndDate(e.target.value)} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Venue / Location</label>
                <input type="text" className="form-input" placeholder="Swarrnim Auditorium" value={location} onChange={e => setLocation(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Event Description *</label>
                <textarea className="form-input" rows={3} placeholder="Brief summary of event details..." value={description} onChange={e => setDescription(e.target.value)} required />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" id="isImportant" checked={isImportant} onChange={e => setIsImportant(e.target.checked)} />
                <label htmlFor="isImportant" style={{ fontSize: '0.84375rem', fontWeight: 700, color: 'var(--brand-navy)', cursor: 'pointer' }}>
                  Mark as High Priority Event
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddEventModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Publish Event</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
