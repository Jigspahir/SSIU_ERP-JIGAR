import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Badge } from '../../components/common/Badge';
import { StatCard } from '../../components/common/StatCard';
import { Wrench, CheckCircle2, Clock, AlertTriangle, Plus } from 'lucide-react';

interface MaintenanceTicket {
  id: string;
  ticketNo: string;
  facility: string;
  category: 'ELECTRICAL' | 'PLUMBING' | 'IT_NETWORK' | 'FURNITURE' | 'CIVIL';
  issueText: string;
  reportedBy: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  date: string;
}

const initialMaintenanceTickets: MaintenanceTicket[] = [
  { id: 'm-1', ticketNo: 'EST-2024-081', facility: 'SSCIT Lab 301', category: 'IT_NETWORK', issueText: 'LAN Switch 2 port connectivity drop in Row B', reportedBy: 'Prof. Demo Faculty', priority: 'HIGH', status: 'IN_PROGRESS', date: '2024-03-10' },
  { id: 'm-2', ticketNo: 'EST-2024-082', facility: 'Management Auditorium', category: 'ELECTRICAL', issueText: 'Stage projector bulb replacement required', reportedBy: 'Demo HOD Five', priority: 'MEDIUM', status: 'OPEN', date: '2024-03-12' },
  { id: 'm-3', ticketNo: 'EST-2024-083', facility: 'Hostel Block A', category: 'PLUMBING', issueText: 'Water dispenser maintenance filter change', reportedBy: 'Demo Warden 1', priority: 'LOW', status: 'RESOLVED', date: '2024-03-08' }
];

export const MaintenanceWorkspacePage: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(initialMaintenanceTickets);

  const handleResolve = (id: string) => {
    setTickets(tickets.map(t => t.id === id ? { ...t, status: 'RESOLVED' } : t));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
            Campus Estate &amp; Maintenance Operations
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Facility repair tickets, electrical/IT maintenance, campus infrastructure, and equipment servicing
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-4">
        <StatCard title="Open Repair Tickets" value="1 Open" icon={Clock} subtitle="Pending Servicing" />
        <StatCard title="In Progress" value="1 Ticket" icon={Wrench} subtitle="Work Underway" />
        <StatCard title="Resolved Repairs" value="28" icon={CheckCircle2} subtitle="Completed This Month" />
        <StatCard title="Service SLA Rating" value="98.2%" icon={AlertTriangle} subtitle="Within 24 Hours" />
      </div>

      {/* Maintenance Tickets Table */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '1rem' }}>
          Campus Infrastructure Repair Tickets
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Location / Facility</th>
                <th>Category</th>
                <th>Issue Description</th>
                <th>Reported By</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(t => (
                <tr key={t.id}>
                  <td><strong>{t.ticketNo}</strong></td>
                  <td>{t.facility}</td>
                  <td><Badge variant="navy">{t.category}</Badge></td>
                  <td>{t.issueText}</td>
                  <td>{t.reportedBy}</td>
                  <td><Badge variant={t.priority === 'HIGH' ? 'danger' : 'warning'}>{t.priority}</Badge></td>
                  <td>
                    <Badge variant={t.status === 'RESOLVED' ? 'active' : t.status === 'IN_PROGRESS' ? 'warning' : 'danger'}>
                      {t.status}
                    </Badge>
                  </td>
                  <td>
                    {t.status !== 'RESOLVED' && (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleResolve(t.id)}
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                      >
                        <CheckCircle2 size={13} /> Mark Resolved
                      </button>
                    )}
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
