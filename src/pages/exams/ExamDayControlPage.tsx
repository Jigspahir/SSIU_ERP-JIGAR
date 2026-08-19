import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Badge } from '../../components/common/Badge';
import { StatCard } from '../../components/common/StatCard';
import {
  Activity,
  Calendar,
  Building2,
  Users,
  DoorOpen,
  ShieldCheck,
  FileCheck,
  Video,
  Printer,
  Grid,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';

export const ExamDayControlPage: React.FC = () => {
  const { user } = useAuth();
  const exams = db.getExams();
  const [selectedExamId, setSelectedExamId] = useState<string>(exams[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const selectedExam = exams.find(e => e.id === selectedExamId);

  const dayControlData = useMemo(() => {
    if (!selectedExamId) return null;
    return db.getExamDayControl(selectedExamId, selectedDate);
  }, [selectedExamId, selectedDate]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'var(--brand-orange)', color: '#fff' }}>
              <Activity size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--brand-navy)', margin: 0 }}>
                Exam Day Operations &amp; Control
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
                Real-time central dashboard for live exam day operations, centre capacities, seating coverage &amp; EDP staff
              </p>
            </div>
          </div>
        </div>

        <button onClick={handlePrint} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Printer size={15} /> Print Operational Summary
        </button>
      </div>

      {/* Exam & Date Selection Bar */}
      <div className="card" style={{ padding: '1rem', display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'center', background: '#F8FAFC' }}>
        <div style={{ flex: 1, minWidth: '280px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-navy)', display: 'block', marginBottom: '0.3rem' }}>
            ACTIVE EXAMINATION SESSION *
          </label>
          <select
            className="form-control"
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            style={{ fontWeight: 600 }}
          >
            {exams.map(e => (
              <option key={e.id} value={e.id}>
                {e.name} ({e.code}) — {e.session || 'Summer 2026'}
              </option>
            ))}
          </select>
        </div>

        <div style={{ minWidth: '200px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-navy)', display: 'block', marginBottom: '0.3rem' }}>
            OPERATIONAL DATE
          </label>
          <input
            type="date"
            className="form-control"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ fontWeight: 600 }}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-navy)', display: 'block', marginBottom: '0.3rem' }}>
            EXAM STATUS
          </label>
          <Badge variant={selectedExam?.status === 'ONGOING' ? 'active' : 'navy'}>
            {selectedExam?.status || 'DRAFT'}
          </Badge>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        <StatCard
          title="Eligible Students"
          value={dayControlData?.totalEligible || 0}
          icon={Users}
          colorScheme="navy"
          trend="Verified Candidates"
        />
        <StatCard
          title="Seated Candidates"
          value={dayControlData?.totalAllocated || 0}
          icon={CheckCircle2}
          colorScheme="green"
          trend={`${dayControlData?.totalEligible ? Math.round((dayControlData.totalAllocated / dayControlData.totalEligible) * 100) : 0}% Covered`}
        />
        <StatCard
          title="Hall Tickets Issued"
          value={dayControlData?.totalHallTickets || 0}
          icon={FileCheck}
          colorScheme="blue"
          trend="Admit Cards Live"
        />
        <StatCard
          title="EDP Staff on Duty"
          value={dayControlData?.totalEdpStaffAssigned || 0}
          icon={ShieldCheck}
          colorScheme="orange"
          trend="Surveillance / IT"
        />
      </div>

      {/* Centre Operations Breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--brand-navy)', margin: 0 }}>
          Centre &amp; Room Operational Status
        </h3>

        {(!dayControlData?.centresSummary || dayControlData.centresSummary.length === 0) ? (
          <div className="card" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No exam centres configured for this session.
          </div>
        ) : (
          dayControlData.centresSummary.map((centre: any) => (
            <div key={centre.centreId} className="card" style={{ padding: '1.5rem', borderTop: '4px solid var(--brand-navy)' }}>
              {/* Centre Banner */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--brand-orange)', background: 'var(--brand-orange-light)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                      {centre.centreCode}
                    </span>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--brand-navy)', margin: 0 }}>
                      {centre.centreName}
                    </h4>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                    Building: {centre.building} | Total Rooms: {centre.totalRooms} | Seated: {centre.seatedStudents} / {centre.totalCapacity} | EDP Staff: {centre.edpStaffCount}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Capacity Utilized</div>
                    <div style={{ fontWeight: 800, color: 'var(--brand-navy)', fontSize: '1rem' }}>
                      {centre.totalCapacity > 0 ? Math.round((centre.seatedStudents / centre.totalCapacity) * 100) : 0}%
                    </div>
                  </div>
                  <Badge variant={centre.seatedStudents > 0 ? 'active' : 'navy'}>
                    {centre.seatedStudents > 0 ? 'ACTIVE OPERATIONAL' : 'STANDBY'}
                  </Badge>
                </div>
              </div>

              {/* Room Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
                {centre.rooms.map((room: any) => {
                  const occupancy = room.capacity > 0 ? Math.round((room.allocatedSeats / room.capacity) * 100) : 0;

                  return (
                    <div
                      key={room.roomId}
                      style={{
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        padding: '0.85rem',
                        background: room.allocatedSeats > 0 ? '#F8FAFC' : '#FFFFFF',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.35rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ color: 'var(--brand-navy)', fontSize: '0.9rem' }}>{room.roomNumber}</strong>
                        <Badge variant={room.status === 'AVAILABLE' ? 'active' : 'inactive'}>
                          {room.status}
                        </Badge>
                      </div>

                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Seated: <strong style={{ color: 'var(--brand-navy)' }}>{room.allocatedSeats}</strong> / {room.capacity}
                      </div>

                      {/* Progress Bar */}
                      <div style={{ width: '100%', height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden', margin: '0.2rem 0' }}>
                        <div
                          style={{
                            width: `${occupancy}%`,
                            height: '100%',
                            background: occupancy >= 90 ? '#10B981' : occupancy > 0 ? '#3B82F6' : '#9CA3AF',
                            transition: 'width 0.3s ease'
                          }}
                        />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748B' }}>
                        <span>Occupancy: {occupancy}%</span>
                        <span>Free: {room.remainingSeats}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
