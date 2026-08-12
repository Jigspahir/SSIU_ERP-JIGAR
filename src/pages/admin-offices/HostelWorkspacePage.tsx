import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Badge } from '../../components/common/Badge';
import { StatCard } from '../../components/common/StatCard';
import { Home, Users, CheckCircle2, Clock, Plus, ShieldCheck, Check, X, AlertCircle, FileText } from 'lucide-react';
import { ApprovalRequest } from '../../types';

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
  const { user, role } = useAuth();
  const [rooms, setRooms] = useState<HostelRoom[]>(initialHostelRooms);
  const [requests, setRequests] = useState<ApprovalRequest[]>(
    db.getApprovalRequests().filter(r => r.currentOffice === 'HOSTEL_ADMIN' || r.category === 'HOSTEL_NO_DUES' || r.category === 'LEAVE_APPLICATION')
  );
  
  const [selectedRoomForAlloc, setSelectedRoomForAlloc] = useState<HostelRoom | null>(null);
  const [allocStudentId, setAllocStudentId] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  const students = db.getStudents();
  const totalOccupied = rooms.reduce((acc, r) => acc + r.occupied, 0);

  const handleAllocateBed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomForAlloc || !allocStudentId) return;

    const targetStudent = students.find(s => s.id === allocStudentId);
    setRooms(prev => prev.map(r => {
      if (r.id === selectedRoomForAlloc.id) {
        const nextOccupied = r.occupied + 1;
        return { ...r, occupied: nextOccupied, status: nextOccupied >= r.capacity ? 'FULL' : 'AVAILABLE' };
      }
      return r;
    }));

    setSuccessMsg(`Student ${targetStudent?.name || allocStudentId} allocated to ${selectedRoomForAlloc.blockName} - Room ${selectedRoomForAlloc.roomNo} successfully.`);
    setSelectedRoomForAlloc(null);
    setAllocStudentId('');
  };

  const handleApproveRequest = (reqId: string) => {
    db.updateEntity<ApprovalRequest>('approvalRequests', reqId, { status: 'APPROVED', completedAt: new Date().toISOString() });
    setRequests(db.getApprovalRequests().filter(r => r.currentOffice === 'HOSTEL_ADMIN' || r.category === 'HOSTEL_NO_DUES'));
    setSuccessMsg('Hostel Request Approved Successfully.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
            Hostel &amp; Residence Administration Portal
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Room allocations, mess attendance management, night pass gate approvals, and resident safety
          </p>
        </div>
      </div>

      {successMsg && (
        <div style={{ padding: '0.85rem 1.25rem', backgroundColor: '#ECFDF5', border: '1px solid #6EE7B7', color: '#065F46', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={18} color="#059669" />
          {successMsg}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid-4">
        <StatCard title="Total Hostel Rooms" value={String(rooms.length)} icon={Home} subtitle="Block A &amp; Block B" />
        <StatCard title="Hostel Residents" value={String(totalOccupied)} icon={Users} subtitle="Active Occupants" />
        <StatCard title="Available Bed Slots" value={`${rooms.reduce((acc, r) => acc + (r.capacity - r.occupied), 0)} Slots`} icon={CheckCircle2} subtitle="Ready for Allocation" />
        <StatCard title="Pending Clearance Queue" value={String(requests.filter(r => r.status === 'PENDING').length)} icon={Clock} subtitle="No-Dues &amp; Leave Gate Passes" />
      </div>

      {/* Hostel Allocation Table */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '1rem' }}>
          Hostel Block Room Allocations &amp; Capacity Tracker
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
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map(room => (
                <tr key={room.id}>
                  <td><strong>{room.blockName}</strong></td>
                  <td><span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--brand-navy)' }}>{room.roomNo}</span></td>
                  <td>{room.capacity} Beds</td>
                  <td><strong>{room.occupied} / {room.capacity}</strong></td>
                  <td>
                    <Badge variant={room.status === 'FULL' ? 'inactive' : room.status === 'AVAILABLE' ? 'active' : 'orange'}>
                      {room.status}
                    </Badge>
                  </td>
                  <td>
                    {room.status === 'AVAILABLE' && (role === 'HOSTEL_ADMIN' || role === 'SUPER_ADMIN' || role === 'UNIVERSITY_ADMIN') ? (
                      <button className="btn btn-primary btn-sm" onClick={() => setSelectedRoomForAlloc(room)}>
                        <Plus size={14} /> Allocate Bed
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Occupied</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hostel Requests & No-Dues Clearance Queue */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1rem' }}>
          Hostel Clearance &amp; Gate Pass Approval Queue
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Request No</th>
                <th>Student Name</th>
                <th>Category</th>
                <th>Title / Description</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No pending hostel requests in queue.</td></tr>
              ) : (
                requests.map(req => (
                  <tr key={req.id}>
                    <td><strong>{req.requestNo}</strong></td>
                    <td>{req.applicantName}</td>
                    <td><Badge variant="navy">{req.category}</Badge></td>
                    <td>{req.title}</td>
                    <td>
                      <Badge variant={req.status === 'APPROVED' ? 'active' : 'gold'}>
                        {req.status}
                      </Badge>
                    </td>
                    <td>
                      {req.status === 'PENDING' && (role === 'HOSTEL_ADMIN' || role === 'SUPER_ADMIN' || role === 'UNIVERSITY_ADMIN') ? (
                        <button className="btn btn-primary btn-sm" onClick={() => handleApproveRequest(req.id)}>
                          <Check size={14} /> Approve Request
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Processed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Room Allocation Modal */}
      {selectedRoomForAlloc && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1rem' }}>
              Allocate Bed: {selectedRoomForAlloc.blockName} - Room {selectedRoomForAlloc.roomNo}
            </h3>

            <form onSubmit={handleAllocateBed} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Select Student *</label>
                <select className="form-select" value={allocStudentId} onChange={e => setAllocStudentId(e.target.value)} required>
                  <option value="">Select Candidate...</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.enrollmentNo})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedRoomForAlloc(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Confirm Room Allocation</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
