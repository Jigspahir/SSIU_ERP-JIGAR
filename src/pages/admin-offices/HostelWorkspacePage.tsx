import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Badge } from '../../components/common/Badge';
import { StatCard } from '../../components/common/StatCard';
import { Home, Users, CheckCircle2, Clock, Plus, ShieldCheck } from 'lucide-react';

interface HostelRoom {
  id: string;
  blockName: string;
  roomNo: string;
  capacity: number;
  occupied: number;
  status: 'AVAILABLE' | 'FULL' | 'MAINTENANCE';
}

const initialHostelRooms: HostelRoom[] = [
  { id: 'h-101', blockName: 'Block A (Boys Hostel)', roomNo: 'A-101', capacity: 3, occupied: 3, status: 'FULL' },
  { id: 'h-102', blockName: 'Block A (Boys Hostel)', roomNo: 'A-102', capacity: 3, occupied: 2, status: 'AVAILABLE' },
  { id: 'h-201', blockName: 'Block B (Girls Hostel)', roomNo: 'B-201', capacity: 2, occupied: 2, status: 'FULL' },
  { id: 'h-202', blockName: 'Block B (Girls Hostel)', roomNo: 'B-202', capacity: 2, occupied: 1, status: 'AVAILABLE' }
];

export const HostelWorkspacePage: React.FC = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<HostelRoom[]>(initialHostelRooms);
  const students = db.getStudents();

  const totalOccupied = rooms.reduce((acc, r) => acc + r.occupied, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
            Hostel &amp; Residence Administration
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Room allocations, mess attendance management, night pass approvals, and resident safety
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-4">
        <StatCard title="Total Hostel Rooms" value={String(rooms.length)} icon={Home} subtitle="Block A &amp; Block B" />
        <StatCard title="Hostel Residents" value={String(totalOccupied)} icon={Users} subtitle="Active Occupants" />
        <StatCard title="Available Bed Slots" value="2 Slots" icon={CheckCircle2} subtitle="Ready for Allocation" />
        <StatCard title="Night Passes Approved" value="14" icon={Clock} subtitle="This Month" />
      </div>

      {/* Hostel Allocation Table */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '1rem' }}>
          Hostel Block Room Allocations
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Hostel Block</th>
                <th>Room Number</th>
                <th>Capacity</th>
                <th>Occupied</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map(r => (
                <tr key={r.id}>
                  <td><strong>{r.blockName}</strong></td>
                  <td>{r.roomNo}</td>
                  <td>{r.capacity} Beds</td>
                  <td>{r.occupied} Occupied</td>
                  <td>
                    <Badge variant={r.status === 'AVAILABLE' ? 'active' : 'danger'}>
                      {r.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
