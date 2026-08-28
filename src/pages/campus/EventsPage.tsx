import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/common/Badge';
import { ExcelTableContainer, ExcelTable, ExcelTh, ExcelTd } from '../../components/common/ExcelTable';
import { Modal } from '../../components/common/Modal';
import { 
  Calendar, MapPin, Users, Plus, CheckCircle, Clock, 
  Building, Sparkles, Trophy, Eye, Check
} from 'lucide-react';

interface EventItem {
  id: string;
  title: string;
  category: 'HACKATHON' | 'WORKSHOP' | 'TECHFEST' | 'SEMINAR' | 'CULTURAL' | 'SPORTS' | 'CONFERENCE';
  date: string;
  time: string;
  venue: string;
  organizer: string;
  registeredCount: number;
  isRegistered?: boolean;
  description?: string;
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
    isRegistered: true,
    description: '36-hour national hackathon bringing innovative student founders to prototype AI, clean-tech, and Web3 solutions with seed funding opportunities.'
  },
  {
    id: 'evt-2',
    title: 'Cloud Computing & AWS Architecture Hands-on Workshop',
    category: 'WORKSHOP',
    date: '2024-04-18',
    time: '10:00 AM - 01:00 PM',
    venue: 'Computer Lab 3, SSCIT Block',
    organizer: 'Dept. of Computer Engineering',
    registeredCount: 85,
    isRegistered: false,
    description: 'Deep dive into AWS serverless architecture, EC2 orchestration, VPC networking, and cloud security with hands-on lab deployments.'
  },
  {
    id: 'evt-3',
    title: 'Annual TechFest Innovista 2024: Robotics & Coding Arena',
    category: 'TECHFEST',
    date: '2024-04-25',
    time: '09:30 AM - 05:30 PM',
    venue: 'University Central Auditorium & Quadrangle',
    organizer: 'Student Activity Council & IEEE Student Branch',
    registeredCount: 320,
    isRegistered: false,
    description: 'Grand annual technical festival featuring RoboWars, competitive speed debugging, drone race, and tech exhibitions.'
  },
  {
    id: 'evt-4',
    title: 'Generative AI & Machine Learning Industry Masterclass',
    category: 'SEMINAR',
    date: '2024-05-02',
    time: '02:00 PM - 04:30 PM',
    venue: 'Seminar Hall 1, Academic Block A',
    organizer: 'AI & Data Science Department',
    registeredCount: 195,
    isRegistered: true,
    description: 'Interactive seminar with industry leaders from leading AI labs on building LLM agents, RAG architectures, and fine-tuning.'
  }
];

export const EventsPage: React.FC = () => {
  const { role } = useAuth();
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [viewEvent, setViewEvent] = useState<EventItem | null>(null);

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

  const getCategoryBadge = (cat: EventItem['category']) => {
    switch (cat) {
      case 'HACKATHON': return <Badge variant="orange">HACKATHON</Badge>;
      case 'WORKSHOP': return <Badge variant="navy">WORKSHOP</Badge>;
      case 'TECHFEST': return <Badge variant="gold">TECHFEST</Badge>;
      case 'SEMINAR': return <Badge variant="active">SEMINAR</Badge>;
      case 'CULTURAL': return <Badge variant="danger">CULTURAL</Badge>;
      case 'SPORTS': return <Badge variant="warning">SPORTS</Badge>;
      case 'CONFERENCE': return <Badge variant="navy">CONFERENCE</Badge>;
      default: return <Badge variant="inactive">{cat}</Badge>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
          Swarrnim University Events &amp; TechFest Portal
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Discover upcoming Hackathons, Guest Seminars, Workshops, and Cultural Fests at Swarrnim Campus
        </p>
      </div>

      {/* Excel-Style Events Table */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <ExcelTableContainer minWidth="1700px">
          <ExcelTable>
            <thead>
              <tr>
                <ExcelTh align="center" style={{ width: '70px', minWidth: '70px' }}>Sr. No.</ExcelTh>
                <ExcelTh align="center" style={{ width: '120px', minWidth: '120px' }}>Event Date</ExcelTh>
                <ExcelTh align="center" style={{ width: '120px', minWidth: '120px' }}>Event Type</ExcelTh>
                <ExcelTh align="left" style={{ width: '300px', minWidth: '300px' }}>Event Name</ExcelTh>
                <ExcelTh align="center" style={{ width: '150px', minWidth: '150px' }}>Time</ExcelTh>
                <ExcelTh align="left" style={{ width: '280px', minWidth: '280px' }}>Venue</ExcelTh>
                <ExcelTh align="left" style={{ width: '230px', minWidth: '230px' }}>Organized By</ExcelTh>
                <ExcelTh align="center" style={{ width: '110px', minWidth: '110px' }}>Attendees</ExcelTh>
                <ExcelTh align="center" style={{ width: '170px', minWidth: '170px' }}>Registration Status</ExcelTh>
                <ExcelTh align="center" style={{ width: '150px', minWidth: '150px' }}>Action</ExcelTh>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr>
                  <ExcelTd colSpan={10} align="center" style={{ padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                    <Calendar size={40} style={{ margin: '0 auto 0.75rem auto', color: 'var(--border-color)', opacity: 0.6 }} />
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: 'var(--brand-navy)' }}>No upcoming campus events</p>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.825rem' }}>Scheduled university workshops and techfests will appear here</p>
                  </ExcelTd>
                </tr>
              ) : (
                events.map((evt, idx) => (
                  <tr key={evt.id}>
                    <ExcelTd align="center" mono color="var(--brand-navy)">
                      <span style={{ fontWeight: 700 }}>{idx + 1}</span>
                    </ExcelTd>

                    <ExcelTd align="center">
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{evt.date}</span>
                    </ExcelTd>

                    <ExcelTd align="center">
                      {getCategoryBadge(evt.category)}
                    </ExcelTd>

                    <ExcelTd align="left">
                      <div 
                        style={{ 
                          fontWeight: 700, 
                          color: 'var(--brand-navy)',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          lineHeight: 1.35,
                          fontSize: '0.85rem'
                        }}
                        title={evt.title}
                      >
                        {evt.title}
                      </div>
                    </ExcelTd>

                    <ExcelTd align="center">
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {evt.time}
                      </span>
                    </ExcelTd>

                    <ExcelTd align="left">
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <MapPin size={13} style={{ color: 'var(--brand-orange, #F37023)', flexShrink: 0 }} />
                        {evt.venue}
                      </span>
                    </ExcelTd>

                    <ExcelTd align="left">
                      <span style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--brand-navy)' }}>
                        {evt.organizer}
                      </span>
                    </ExcelTd>

                    <ExcelTd align="center">
                      <span style={{ fontSize: '0.8125rem', color: '#047857', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Users size={13} /> {evt.registeredCount}
                      </span>
                    </ExcelTd>

                    <ExcelTd align="center">
                      {evt.isRegistered ? (
                        <Badge variant="active">REGISTERED</Badge>
                      ) : (
                        <Badge variant="navy">REGISTRATION OPEN</Badge>
                      )}
                    </ExcelTd>

                    <ExcelTd align="center">
                      {role === 'STUDENT' ? (
                        <button 
                          type="button"
                          onClick={() => handleRSVP(evt.id)} 
                          className={evt.isRegistered ? 'btn btn-secondary btn-sm' : 'btn btn-primary btn-sm'}
                          style={{ 
                            padding: '0.35rem 0.75rem', 
                            fontSize: '0.78rem',
                            whiteSpace: 'nowrap',
                            background: evt.isRegistered ? undefined : 'var(--brand-orange, #F37023)',
                            borderColor: evt.isRegistered ? undefined : 'var(--brand-orange, #F37023)',
                            fontWeight: 700
                          }}
                        >
                          {evt.isRegistered ? 'Cancel RSVP' : 'Register Now'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setViewEvent(evt)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', whiteSpace: 'nowrap' }}
                        >
                          <Eye size={13} /> View Details
                        </button>
                      )}
                    </ExcelTd>
                  </tr>
                ))
              )}
            </tbody>
          </ExcelTable>
        </ExcelTableContainer>

        <div style={{ marginTop: '1rem', fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          Showing {events.length} Records
        </div>
      </div>

      {/* EVENT DETAILS MODAL */}
      {viewEvent && (
        <Modal
          isOpen={Boolean(viewEvent)}
          onClose={() => setViewEvent(null)}
          title={viewEvent.title}
          subtitle={`Organized by ${viewEvent.organizer}`}
          maxWidth="640px"
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
              <button 
                type="button" 
                onClick={() => setViewEvent(null)} 
                className="btn btn-secondary"
                style={{ minWidth: '90px' }}
              >
                Close
              </button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {getCategoryBadge(viewEvent.category)}
              <Badge variant={viewEvent.isRegistered ? 'active' : 'navy'}>
                {viewEvent.isRegistered ? 'REGISTERED' : 'REGISTRATION OPEN'}
              </Badge>
            </div>

            {viewEvent.description && (
              <div style={{ padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '0.875rem', lineHeight: 1.6, color: '#1E293B' }}>
                {viewEvent.description}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8125rem' }}>
              <div><strong>Date &amp; Time:</strong> {viewEvent.date} ({viewEvent.time})</div>
              <div><strong>Venue:</strong> {viewEvent.venue}</div>
              <div><strong>Total Attendees:</strong> {viewEvent.registeredCount}</div>
              <div><strong>Organizing Cell:</strong> {viewEvent.organizer}</div>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
export default EventsPage;
