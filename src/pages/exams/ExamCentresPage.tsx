import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Badge } from '../../components/common/Badge';
import { StatCard } from '../../components/common/StatCard';
import { ExamCentre, ExamRoom } from '../../types';
import {
  Building2,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  Edit2,
  DoorOpen,
  Users,
  Video,
  Layers,
  MapPin,
  Phone,
  User,
  ShieldCheck,
  Filter,
} from 'lucide-react';

export const ExamCentresPage: React.FC = () => {
  const { user, role } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedCentre, setSelectedCentre] = useState<ExamCentre | null>(null);

  // Modals
  const [isCentreModalOpen, setIsCentreModalOpen] = useState(false);
  const [centreFormMode, setCentreFormMode] = useState<'ADD' | 'EDIT'>('ADD');
  const [centreFormData, setCentreFormData] = useState<Partial<ExamCentre>>({
    code: '',
    name: '',
    building: '',
    address: '',
    contactPerson: '',
    contactNumber: '',
    capacity: 500,
    status: 'ACTIVE',
  });

  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [roomFormMode, setRoomFormMode] = useState<'ADD' | 'EDIT'>('ADD');
  const [roomFormData, setRoomFormData] = useState<Partial<ExamRoom>>({
    centreId: '',
    building: '',
    roomNumber: '',
    roomCode: '',
    floor: 1,
    capacity: 40,
    roomType: 'CLASSROOM',
    hasCCTV: true,
    status: 'AVAILABLE',
  });

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const canManage = role === 'SUPER_ADMIN' || role === 'UNIVERSITY_ADMIN' || role === 'EXAM_CELL' || role === 'PRINCIPAL';

  const centres = db.getExamCentres();
  const allRooms = db.getExamRooms();

  const filteredCentres = useMemo(() => {
    return centres.filter(c => {
      const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery ||
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.building.toLowerCase().includes(q) ||
        (c.contactPerson && c.contactPerson.toLowerCase().includes(q));
      return matchesStatus && matchesSearch;
    });
  }, [centres, statusFilter, searchQuery]);

  const activeCentresCount = centres.filter(c => c.status === 'ACTIVE').length;
  const totalCapacity = centres.reduce((acc, c) => acc + (c.capacity || 0), 0);
  const totalRoomsCount = allRooms.length;

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Centre Handlers
  const handleOpenAddCentre = () => {
    setCentreFormMode('ADD');
    setCentreFormData({
      code: `CENTRE-${String(centres.length + 1).padStart(2, '0')}`,
      name: '',
      building: '',
      address: '',
      contactPerson: '',
      contactNumber: '',
      capacity: 500,
      status: 'ACTIVE',
    });
    setIsCentreModalOpen(true);
  };

  const handleOpenEditCentre = (c: ExamCentre) => {
    setCentreFormMode('EDIT');
    setCentreFormData({ ...c });
    setIsCentreModalOpen(true);
  };

  const handleSaveCentre = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!centreFormData.name || !centreFormData.building) {
        showNotification('error', 'Centre Name and Building are mandatory.');
        return;
      }

      if (centreFormMode === 'ADD') {
        db.createExamCentre(centreFormData, user);
        showNotification('success', `Exam Centre "${centreFormData.name}" created successfully.`);
      } else if (centreFormData.id) {
        db.updateExamCentre(centreFormData.id, centreFormData, user);
        showNotification('success', `Exam Centre "${centreFormData.name}" updated successfully.`);
      }
      setIsCentreModalOpen(false);
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to save Exam Centre.');
    }
  };

  const handleToggleCentreStatus = (c: ExamCentre) => {
    const nextStatus = c.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    db.toggleExamCentreStatus(c.id, nextStatus, user);
    showNotification('success', `Centre "${c.name}" status changed to ${nextStatus}.`);
  };

  // Room Handlers
  const handleOpenAddRoom = (centreId: string) => {
    const c = centres.find(item => item.id === centreId);
    setRoomFormMode('ADD');
    setRoomFormData({
      centreId,
      building: c?.building || '',
      roomNumber: '',
      roomCode: '',
      floor: 1,
      capacity: 40,
      roomType: 'CLASSROOM',
      hasCCTV: true,
      status: 'AVAILABLE',
    });
    setIsRoomModalOpen(true);
  };

  const handleOpenEditRoom = (r: ExamRoom) => {
    setRoomFormMode('EDIT');
    setRoomFormData({ ...r });
    setIsRoomModalOpen(true);
  };

  const handleSaveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!roomFormData.roomNumber || !roomFormData.capacity || roomFormData.capacity <= 0) {
        showNotification('error', 'Room Number and positive Capacity are mandatory.');
        return;
      }

      if (roomFormMode === 'ADD') {
        db.createExamRoom(roomFormData, user);
        showNotification('success', `Room "${roomFormData.roomNumber}" added successfully.`);
      } else if (roomFormData.id) {
        db.updateExamRoom(roomFormData.id, roomFormData, user);
        showNotification('success', `Room "${roomFormData.roomNumber}" updated successfully.`);
      }
      setIsRoomModalOpen(false);
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to save Exam Room.');
    }
  };

  const handleToggleRoomStatus = (r: ExamRoom) => {
    const nextStatus = r.status === 'AVAILABLE' ? 'UNAVAILABLE' : 'AVAILABLE';
    db.toggleExamRoomStatus(r.id, nextStatus, user);
    showNotification('success', `Room "${r.roomNumber}" status changed to ${nextStatus}.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'var(--brand-navy)', color: '#fff' }}>
              <Building2 size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--brand-navy)', margin: 0 }}>
                Exam Centre &amp; Room Master
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
                Configure university examination centres, blocks, room capacities, and CCTV surveillance facilities
              </p>
            </div>
          </div>
        </div>

        {canManage && (
          <button onClick={handleOpenAddCentre} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={16} /> Add Exam Centre
          </button>
        )}
      </div>

      {/* Notification */}
      {notification && (
        <div style={{
          padding: '0.75rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          background: notification.type === 'success' ? '#ECFDF5' : '#FEF2F2',
          border: `1px solid ${notification.type === 'success' ? '#10B981' : '#EF4444'}`,
          color: notification.type === 'success' ? '#065F46' : '#991B1B',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {notification.type === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
          {notification.message}
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <StatCard
          title="Total Exam Centres"
          value={centres.length}
          icon={Building2}
          colorScheme="navy"
          trend={`${activeCentresCount} Active`}
        />
        <StatCard
          title="Total Seating Capacity"
          value={totalCapacity.toLocaleString()}
          icon={Users}
          colorScheme="blue"
          trend="Across All Centres"
        />
        <StatCard
          title="Total Exam Rooms"
          value={totalRoomsCount}
          icon={DoorOpen}
          colorScheme="orange"
          trend="Configured Blocks"
        />
        <StatCard
          title="Surveillance Enabled"
          value={allRooms.filter(r => r.hasCCTV).length}
          icon={Video}
          colorScheme="green"
          trend="CCTV Verified"
        />
      </div>

      {/* Filter Row */}
      <div className="card" style={{ padding: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: '260px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by code, centre name, building, contact person..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '2.25rem' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Filter size={16} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Status:</span>
          {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`btn btn-sm ${statusFilter === st ? 'btn-navy' : 'btn-outline'}`}
              style={{ textTransform: 'capitalize' }}
            >
              {st.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Centres Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.25rem' }}>
        {filteredCentres.map(c => {
          const centreRooms = allRooms.filter(r => r.centreId === c.id);
          const activeRoomsCount = centreRooms.filter(r => r.status === 'AVAILABLE' || r.status === 'ACTIVE').length;
          const calculatedCapacity = centreRooms.reduce((acc, r) => acc + (r.capacity || 0), 0) || c.capacity;

          return (
            <div key={c.id} className="card card-hover" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: `4px solid ${c.status === 'ACTIVE' ? 'var(--brand-navy)' : '#9CA3AF'}` }}>
              {/* Top Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--brand-orange)', background: 'var(--brand-orange-light)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                      {c.code}
                    </span>
                    <Badge variant={c.status === 'ACTIVE' ? 'active' : 'inactive'}>
                      {c.status}
                    </Badge>
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--brand-navy)', marginTop: '0.4rem' }}>
                    {c.name}
                  </h3>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    className="btn btn-outline btn-sm"
                    title="View Rooms"
                    onClick={() => setSelectedCentre(selectedCentre?.id === c.id ? null : c)}
                  >
                    <Eye size={14} /> {selectedCentre?.id === c.id ? 'Hide Rooms' : 'Rooms'} ({centreRooms.length})
                  </button>
                  {canManage && (
                    <>
                      <button
                        className="btn btn-outline btn-sm"
                        title="Edit Centre"
                        onClick={() => handleOpenEditCentre(c)}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className={`btn btn-sm ${c.status === 'ACTIVE' ? 'btn-outline-danger' : 'btn-outline-success'}`}
                        title={c.status === 'ACTIVE' ? 'Deactivate Centre' : 'Activate Centre'}
                        onClick={() => handleToggleCentreStatus(c)}
                      >
                        {c.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Centre Details Info */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.85rem', background: '#F9FAFB', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>BUILDING / BLOCK</span>
                  <strong style={{ color: 'var(--brand-navy)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Layers size={13} style={{ color: 'var(--brand-orange)' }} /> {c.building}
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>TOTAL SEATING CAPACITY</span>
                  <strong style={{ color: 'var(--brand-navy)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Users size={13} style={{ color: '#10B981' }} /> {calculatedCapacity} Seats
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>CONTACT OFFICER</span>
                  <span style={{ color: '#374151', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <User size={13} style={{ color: 'var(--text-muted)' }} /> {c.contactPerson || 'Controller of Exams'}
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>PHONE / HELPLINE</span>
                  <span style={{ color: '#374151', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Phone size={13} style={{ color: 'var(--text-muted)' }} /> {c.contactNumber || '+91 7923245000'}
                  </span>
                </div>
                {c.address && (
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>ADDRESS</span>
                    <span style={{ color: '#4B5563', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <MapPin size={13} style={{ color: 'var(--text-muted)' }} /> {c.address}
                    </span>
                  </div>
                )}
              </div>

              {/* Rooms Section inside Centre Card */}
              <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--brand-navy)' }}>
                    Configured Rooms ({centreRooms.length})
                  </span>
                  {canManage && (
                    <button
                      className="btn btn-navy btn-sm"
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                      onClick={() => handleOpenAddRoom(c.id)}
                    >
                      <Plus size={12} /> Add Room
                    </button>
                  )}
                </div>

                {centreRooms.length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>
                    No rooms configured yet for this centre. Click "Add Room" to configure classrooms or halls.
                  </p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.5rem' }}>
                    {centreRooms.map(r => (
                      <div
                        key={r.id}
                        style={{
                          border: `1px solid ${r.status === 'AVAILABLE' || r.status === 'ACTIVE' ? '#D1D5DB' : '#FECACA'}`,
                          borderRadius: '6px',
                          padding: '0.5rem',
                          background: r.status === 'AVAILABLE' || r.status === 'ACTIVE' ? '#FFFFFF' : '#FEF2F2',
                          fontSize: '0.8rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.25rem'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ color: 'var(--brand-navy)' }}>{r.roomNumber}</strong>
                          {r.hasCCTV && <span title="CCTV Active"><Video size={12} color="#10B981" /></span>}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                          <span>Cap: {r.capacity}</span>
                          <span>Fl: {r.floor}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: r.roomType === 'HALL' ? '#8B5CF6' : r.roomType === 'LAB' ? '#3B82F6' : '#6B7280' }}>
                            {r.roomType || 'CLASSROOM'}
                          </span>
                          {canManage && (
                            <button
                              onClick={() => handleOpenEditRoom(r)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}
                              title="Edit Room"
                            >
                              <Edit2 size={11} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Centre Modal */}
      {isCentreModalOpen && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ maxWidth: '550px', width: '90%', padding: '1.75rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1.25rem' }}>
              {centreFormMode === 'ADD' ? 'Add New Examination Centre' : 'Edit Examination Centre'}
            </h3>

            <form onSubmit={handleSaveCentre} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Centre Code *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={centreFormData.code || ''}
                    onChange={(e) => setCentreFormData({ ...centreFormData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. CENTRE-01"
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Centre Name *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={centreFormData.name || ''}
                    onChange={(e) => setCentreFormData({ ...centreFormData, name: e.target.value })}
                    placeholder="e.g. SSIU Main Campus Examination Centre"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Building / Block *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={centreFormData.building || ''}
                    onChange={(e) => setCentreFormData({ ...centreFormData, building: e.target.value })}
                    placeholder="e.g. Academic Block A & B"
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Total Capacity *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    className="form-control"
                    value={centreFormData.capacity || 500}
                    onChange={(e) => setCentreFormData({ ...centreFormData, capacity: parseInt(e.target.value, 10) })}
                  />
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Address</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={centreFormData.address || ''}
                  onChange={(e) => setCentreFormData({ ...centreFormData, address: e.target.value })}
                  placeholder="e.g. Swarrnim University Campus, Gandhinagar"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Contact Person</label>
                  <input
                    type="text"
                    className="form-control"
                    value={centreFormData.contactPerson || ''}
                    onChange={(e) => setCentreFormData({ ...centreFormData, contactPerson: e.target.value })}
                    placeholder="e.g. Dr. R. K. Sharma"
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Contact Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value={centreFormData.contactNumber || ''}
                    onChange={(e) => setCentreFormData({ ...centreFormData, contactNumber: e.target.value })}
                    placeholder="e.g. +91 9876543210"
                  />
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Status</label>
                <select
                  className="form-control"
                  value={centreFormData.status || 'ACTIVE'}
                  onChange={(e) => setCentreFormData({ ...centreFormData, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsCentreModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {centreFormMode === 'ADD' ? 'Create Centre' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Room Modal */}
      {isRoomModalOpen && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ maxWidth: '500px', width: '90%', padding: '1.75rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1.25rem' }}>
              {roomFormMode === 'ADD' ? 'Add Exam Room' : 'Edit Exam Room'}
            </h3>

            <form onSubmit={handleSaveRoom} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Room Number *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={roomFormData.roomNumber || ''}
                    onChange={(e) => setRoomFormData({ ...roomFormData, roomNumber: e.target.value.toUpperCase() })}
                    placeholder="e.g. ROOM-101"
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Room Code</label>
                  <input
                    type="text"
                    className="form-control"
                    value={roomFormData.roomCode || ''}
                    onChange={(e) => setRoomFormData({ ...roomFormData, roomCode: e.target.value.toUpperCase() })}
                    placeholder="e.g. R101"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Capacity (Seats) *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    className="form-control"
                    value={roomFormData.capacity || 40}
                    onChange={(e) => setRoomFormData({ ...roomFormData, capacity: parseInt(e.target.value, 10) })}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Floor Number</label>
                  <input
                    type="number"
                    min={0}
                    className="form-control"
                    value={roomFormData.floor || 1}
                    onChange={(e) => setRoomFormData({ ...roomFormData, floor: parseInt(e.target.value, 10) })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Room Type</label>
                  <select
                    className="form-control"
                    value={roomFormData.roomType || 'CLASSROOM'}
                    onChange={(e) => setRoomFormData({ ...roomFormData, roomType: e.target.value as any })}
                  >
                    <option value="CLASSROOM">CLASSROOM</option>
                    <option value="LAB">LAB</option>
                    <option value="HALL">HALL</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>
                <div>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Status</label>
                  <select
                    className="form-control"
                    value={roomFormData.status || 'AVAILABLE'}
                    onChange={(e) => setRoomFormData({ ...roomFormData, status: e.target.value as any })}
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="UNAVAILABLE">UNAVAILABLE</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="hasCCTV"
                  checked={roomFormData.hasCCTV ?? true}
                  onChange={(e) => setRoomFormData({ ...roomFormData, hasCCTV: e.target.checked })}
                  style={{ width: '16px', height: '16px' }}
                />
                <label htmlFor="hasCCTV" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--brand-navy)', cursor: 'pointer' }}>
                  Has CCTV Surveillance System installed &amp; functional
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsRoomModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {roomFormMode === 'ADD' ? 'Add Room' : 'Save Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
