import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/common/Badge';
import { Calendar, MapPin, Users, Plus, CheckCircle } from 'lucide-react';

interface EventItem {
  id: string;
  title: string;
  category: 'HACKATHON' | 'WORKSHOP' | 'TECHFEST' | 'SEMINAR' | 'CULTURAL';
  date: string;
  time: string;
  venue: string;
  organizer: string;
  registeredCount: number;
  isRegistered?: boolean;
}

const initialEvents: EventItem[] = [
  {
    id: 'evt-1',
    title: 'Swarrnim National Startup Hackathon 2024',
    category: 'HACKATHON',
    date: '2024-04-10',
    time: '09:00 AM - 06:00 PM',
    venue: 'Swarrnim Innovation Incubation Center, Main Block',
    organizer: 'SSCIT Innovation Cell & AI Society',
    registeredCount: 142,
    isRegistered: true
  },
  {
    id: 'evt-2',
    title: 'Cloud Computing & AWS Architecture Hands-on Workshop',
    category: 'WORKSHOP',
    date: '2024-04-18',
    time: '10:00 AM - 01:00 PM',
    venue: 'Computer Lab 3, SSCIT Block',
    organizer: 'Dept of Computer Engineering',
    registeredCount: 85
  }
];

export const EventsPage: React.FC = () => {
  const { role } = useAuth();
  const [events, setEvents] = useState<EventItem[]>(initialEvents);

  const handleRSVP = (id: string) => {
    setEvents(events.map(e => {
      if (e.id === id) {
        const nextReg = !e.isRegistered;
        return {
          ...e,
          isRegistered: nextReg,
          registeredCount: nextReg ? e.registeredCount + 1 : e.registeredCount - 1
        };
      }
      return e;
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
          Swarrnim University Events &amp; TechFest Portal
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Discover upcoming Hackathons, Guest Seminars, Workshops, and Cultural Fests at Swarrnim Campus
        </p>
      </div>

      <div className="grid-2">
        {events.map(evt => (
          <div key={evt.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <Badge variant="navy">{evt.category}</Badge>
                <span style={{ fontSize: '0.8125rem', color: '#10B981', fontWeight: 700 }}>
                  <Users size={14} style={{ display: 'inline', marginRight: '4px' }} /> {evt.registeredCount} Attendees
                </span>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '0.75rem' }}>{evt.title}</h3>
              <div style={{ fontSize: '0.84375rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div><strong>Date:</strong> {evt.date} ({evt.time})</div>
                <div><strong>Venue:</strong> {evt.venue}</div>
                <div><strong>Organized by:</strong> {evt.organizer}</div>
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {evt.isRegistered ? (
                <span style={{ color: '#10B981', fontWeight: 700, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <CheckCircle size={16} /> Registered Candidate
                </span>
              ) : (
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Registrations Open</span>
              )}

              {role === 'STUDENT' && (
                <button onClick={() => handleRSVP(evt.id)} className={evt.isRegistered ? 'btn btn-secondary btn-sm' : 'btn btn-primary btn-sm'}>
                  {evt.isRegistered ? 'Cancel RSVP' : 'Register Now'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
