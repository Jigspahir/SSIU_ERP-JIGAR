import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/common/Badge';
import { StatCard } from '../../components/common/StatCard';
import { Bus, MapPin, Users, CheckCircle2 } from 'lucide-react';

interface BusRoute {
  id: string;
  routeNo: string;
  routeName: string;
  driverName: string;
  driverPhone: string;
  capacity: number;
  assignedStudents: number;
}

const initialRoutes: BusRoute[] = [
  { id: 'r-1', routeNo: 'Route 101', routeName: 'Ahmedabad ISRO Colony - Swarrnim Campus', driverName: 'Vikram Singh', driverPhone: '+91 98765 12345', capacity: 50, assignedStudents: 44 },
  { id: 'r-2', routeNo: 'Route 102', routeName: 'Gandhinagar Sector 11 - Swarrnim Campus', driverName: 'Manish Patel', driverPhone: '+91 98765 67890', capacity: 50, assignedStudents: 48 },
  { id: 'r-3', routeNo: 'Route 103', routeName: 'Chandkheda Circle - Swarrnim Campus', driverName: 'Suresh Kumar', driverPhone: '+91 98765 54321', capacity: 40, assignedStudents: 32 }
];

export const TransportWorkspacePage: React.FC = () => {
  const { user } = useAuth();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
            Transport &amp; Fleet Operations
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Bus routes, transport pass approvals, driver assignments, and vehicle fleet management
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-4">
        <StatCard title="Active Bus Fleet" value="18 Buses" icon={Bus} subtitle="GPS Tracked Vehicles" />
        <StatCard title="Total Bus Routes" value="12 Routes" icon={MapPin} subtitle="Ahmedabad &amp; Gandhinagar" />
        <StatCard title="Commuter Students" value="680+" icon={Users} subtitle="Transport Pass Holders" />
        <StatCard title="Fleet Maintenance" value="100% Fit" icon={CheckCircle2} subtitle="All Inspections Passed" />
      </div>

      {/* Bus Routes Table */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '1rem' }}>
          Active Campus Transport Bus Routes
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Route No</th>
                <th>Route Coverage</th>
                <th>Assigned Driver</th>
                <th>Driver Contact</th>
                <th>Capacity</th>
                <th>Occupancy</th>
              </tr>
            </thead>
            <tbody>
              {initialRoutes.map(r => (
                <tr key={r.id}>
                  <td><strong>{r.routeNo}</strong></td>
                  <td>{r.routeName}</td>
                  <td>{r.driverName}</td>
                  <td>{r.driverPhone}</td>
                  <td>{r.capacity} Seats</td>
                  <td><Badge variant="active">{r.assignedStudents} / {r.capacity} Occupied</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
