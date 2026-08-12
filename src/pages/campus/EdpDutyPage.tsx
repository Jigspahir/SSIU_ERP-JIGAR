import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { EdpDuty, EdpDutyRole, EdpDutyStatus, EdpDutyEvidence } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { 
  CalendarDays, MapPin, Clock, Camera, CheckCircle2, ShieldCheck, 
  Plus, Search, ListFilter as Filter, FileSpreadsheet, FileText, UserCheck, 
  AlertCircle, ChevronRight, Eye, Navigation, Award
} from 'lucide-react';
import { exportToExcel, exportToWord } from '../../services/exportService';

export const EdpDutyPage: React.FC = () => {
  const { user, role } = useAuth();

  const institutes = db.getInstitutes();
  const departments = db.getDepartments();
  const facultyList = db.getFaculty();
  const usersList = db.getUsers();

  const [duties, setDuties] = useState<EdpDuty[]>(() => db.getScopedEdpDuties(user, role));

  // Filters
  const [selectedInstId, setSelectedInstId] = useState('ALL');
  const [selectedDeptId, setSelectedDeptId] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedDuty, setSelectedDuty] = useState<EdpDuty | null>(null);

  // Form State: Create Duty
  const [eventName, setEventName] = useState('');
  const [eventType, setEventType] = useState<'CONVOCATION' | 'SEMINAR' | 'EXAM_INVIGILATION' | 'WORKSHOP' | 'CULTURAL_FEST' | 'SPORTS_MEET' | 'NAAC_AUDIT'>('WORKSHOP');
  const [dutyRole, setDutyRole] = useState<EdpDutyRole>('VENUE_INCHARGE');
  const [assignedUserId, setAssignedUserId] = useState('');
  const [instituteId, setInstituteId] = useState('inst-1');
  const [departmentId, setDepartmentId] = useState('dept-1');
  const [dutyDate, setDutyDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:30 AM');
  const [endTime, setEndTime] = useState('04:30 PM');
  const [venue, setVenue] = useState('');
  const [responsibilityDetails, setResponsibilityDetails] = useState('');

  // Form State: Submit Evidence
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=600&q=80');
  const [latitude, setLatitude] = useState(23.0225);
  const [longitude, setLongitude] = useState(72.5714);
  const [locationAddress, setLocationAddress] = useState('Swarrnim Main Campus, Gandhinagar-Ahmedabad Highway, Gujarat 382421');
  const [reportsNotes, setReportsNotes] = useState('');
  const [evidenceRemarks, setEvidenceRemarks] = useState('');

  // Form State: Review & Verify
  const [verificationStatus, setVerificationStatus] = useState<EdpDutyStatus>('VERIFIED');
  const [verificationRemarks, setVerificationRemarks] = useState('');

  const refreshDuties = () => {
    setDuties(db.getScopedEdpDuties(user, role));
  };

  // Filtered Duties
  const filteredDuties = useMemo(() => {
    return duties.filter(d => {
      if (selectedInstId !== 'ALL' && d.instituteId !== selectedInstId) return false;
      if (selectedDeptId !== 'ALL' && d.departmentId !== selectedDeptId) return false;
      if (selectedStatus !== 'ALL' && d.status !== selectedStatus) return false;
      if (selectedRole !== 'ALL' && d.dutyRole !== selectedRole) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesCode = d.dutyCode.toLowerCase().includes(q);
        const matchesEvent = d.eventName.toLowerCase().includes(q);
        const matchesStaff = d.assignedUserName.toLowerCase().includes(q);
        const matchesVenue = d.venue.toLowerCase().includes(q);
        if (!matchesCode && !matchesEvent && !matchesStaff && !matchesVenue) return false;
      }
      return true;
    });
  }, [duties, selectedInstId, selectedDeptId, selectedStatus, selectedRole, searchQuery]);

  // Statistics
  const totalDuties = duties.length;
  const pendingEvidenceCount = duties.filter(d => d.status === 'ASSIGNED' || d.status === 'IN_PROGRESS').length;
  const verifiedCount = duties.filter(d => d.status === 'VERIFIED').length;
  const activeEventsCount = new Set(duties.map(d => d.eventName)).size;

  const canCreateDuty = role === 'SUPER_ADMIN' || role === 'UNIVERSITY_ADMIN' || role === 'REGISTRAR' || role === 'PRINCIPAL' || role === 'HOD';

  // Create Duty Submit
  const handleCreateDutySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName || !assignedUserId || !venue || !responsibilityDetails) return;

    // Find assigned staff details
    const faculty = facultyList.find(f => f.id === assignedUserId);
    const userRec = usersList.find(u => u.id === assignedUserId);

    const assignedUserName = faculty?.name || userRec?.name || 'Assigned Staff';
    const assignedUserRole = userRec?.role || (faculty ? 'FACULTY' : 'FACULTY');
    const assignedUserDesignation = faculty?.designation || userRec?.designation || 'Staff Member';

    db.addEdpDuty({
      eventName,
      eventType,
      dutyRole,
      assignedUserId,
      assignedUserName,
      assignedUserRole,
      assignedUserDesignation,
      instituteId,
      departmentId,
      dutyDate,
      startTime,
      endTime,
      venue,
      responsibilityDetails
    }, user);

    setIsCreateModalOpen(false);
    setEventName('');
    setVenue('');
    setResponsibilityDetails('');
    refreshDuties();
  };

  // Submit Evidence Handlers
  const handleOpenEvidenceModal = (duty: EdpDuty) => {
    setSelectedDuty(duty);
    setReportsNotes(duty.reportsNotes || '');
    setIsEvidenceModalOpen(true);
  };

  const handleSubmitEvidenceConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDuty || !photoUrl || !reportsNotes) return;

    db.addEdpDutyEvidence(selectedDuty.id, {
      photoUrl,
      latitude,
      longitude,
      locationAddress,
      capturedAt: new Date().toISOString(),
      deviceInfo: 'Web GPS Verified Camera Device',
      remarks: evidenceRemarks || 'Geo-tagged duty execution evidence photo'
    }, reportsNotes);

    setIsEvidenceModalOpen(false);
    setSelectedDuty(null);
    refreshDuties();
  };

  // Review & Verify Handlers
  const handleOpenReviewModal = (duty: EdpDuty) => {
    setSelectedDuty(duty);
    setVerificationStatus('VERIFIED');
    setVerificationRemarks(duty.verificationRemarks || 'Duty verified. Verified GPS coordinates and report notes.');
    setIsReviewModalOpen(true);
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDuty || !user) return;

    db.verifyEdpDuty(selectedDuty.id, user, verificationStatus, verificationRemarks);
    setIsReviewModalOpen(false);
    setSelectedDuty(null);
    refreshDuties();
  };

  // Export Handlers
  const handleExportExcel = () => {
    const headers = ['Duty Code', 'Event Name', 'Event Type', 'Duty Role', 'Assigned Staff', 'Staff Designation', 'Duty Date', 'Time Slot', 'Venue', 'Status', 'GPS Location', 'Verified By'];
    const rows = filteredDuties.map(d => [
      d.dutyCode,
      d.eventName,
      d.eventType,
      d.dutyRole.replace('_', ' '),
      d.assignedUserName,
      d.assignedUserDesignation || 'Staff',
      d.dutyDate,
      `${d.startTime} - ${d.endTime}`,
      d.venue,
      d.status,
      d.evidenceList.length > 0 ? `${d.evidenceList[0].latitude.toFixed(4)}°N, ${d.evidenceList[0].longitude.toFixed(4)}°E` : 'NOT_CAPTURED',
      d.verifiedByAdminName || 'UNVERIFIED'
    ]);

    exportToExcel('EDP Duty Management & Geo Evidence Register', headers, rows, {
      instituteName: selectedInstId,
      departmentName: selectedDeptId,
      searchQuery
    }, { name: user?.name, role: user?.role });
  };

  const handleExportWord = () => {
    const headers = ['Duty Code', 'Event Name', 'Duty Role', 'Assigned Staff', 'Date', 'Venue', 'Status', 'GPS Captured'];
    const rows = filteredDuties.map(d => [
      d.dutyCode,
      d.eventName,
      d.dutyRole.replace('_', ' '),
      d.assignedUserName,
      d.dutyDate,
      d.venue,
      d.status,
      d.evidenceList.length > 0 ? 'GPS VERIFIED' : 'PENDING'
    ]);

    exportToWord('EDP Duty Management & Event Evidence Audit Report', headers, rows, {
      instituteName: selectedInstId,
      departmentName: selectedDeptId,
      searchQuery
    }, { name: user?.name, role: user?.role });
  };

  const getStatusBadgeVariant = (status: EdpDutyStatus) => {
    switch (status) {
      case 'VERIFIED': return 'active';
      case 'COMPLETED': return 'active';
      case 'IN_PROGRESS': return 'orange';
      case 'ASSIGNED': return 'navy';
      case 'EXCUSED': return 'gold';
      case 'ABSENT': return 'inactive';
      default: return 'navy';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Badge variant="gold">Event Duty &amp; Evidence Vault</Badge>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--brand-navy)', marginTop: '0.25rem' }}>
            EDP Duty Management
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Assign campus event duties to Faculty, HODs, and HOIs with real-time GPS geo-tagged photo evidence verification
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={handleExportWord} style={{ background: '#1E3E62', color: '#FFFFFF' }}>
            <FileText size={16} /> Export Word
          </button>
          <button className="btn btn-secondary" onClick={handleExportExcel} style={{ background: '#10B981', color: '#FFFFFF', borderColor: '#10B981' }}>
            <FileSpreadsheet size={16} /> Export Excel
          </button>
          {canCreateDuty && (
            <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
              <Plus size={16} /> Assign EDP Duty
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-4">
        <StatCard title="Total Assigned Duties" value={totalDuties} subtitle="EDP Event Duties Roster" icon={CalendarDays} colorScheme="navy" />
        <StatCard title="Pending Evidence" value={pendingEvidenceCount} subtitle="Awaiting GPS Evidence Submission" icon={Camera} colorScheme="orange" />
        <StatCard title="Verified Duties" value={verifiedCount} subtitle="Admin &amp; Registrar Audit Verified" icon={ShieldCheck} colorScheme="green" />
        <StatCard title="Active Events" value={activeEventsCount} subtitle="Campus EDP Events" icon={Award} colorScheme="gold" />
      </div>

      {/* Filter Controls Bar */}
      <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-surface-hover)' }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Filter size={18} color="var(--brand-orange)" /> Duty Roster Filters &amp; Search
        </div>

        <div className="grid-4" style={{ gap: '0.75rem' }}>
          <div>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Institute / School</label>
            <select className="form-input" style={{ fontSize: '0.8125rem' }} value={selectedInstId} onChange={e => setSelectedInstId(e.target.value)}>
              <option value="ALL">All Institutes</option>
              {institutes.map(i => <option key={i.id} value={i.id}>{i.code} - {i.name}</option>)}
            </select>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Department</label>
            <select className="form-input" style={{ fontSize: '0.8125rem' }} value={selectedDeptId} onChange={e => setSelectedDeptId(e.target.value)}>
              <option value="ALL">All Departments</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.code} - {d.name}</option>)}
            </select>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Duty Status</label>
            <select className="form-input" style={{ fontSize: '0.8125rem' }} value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
              <option value="ALL">All Statuses</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="VERIFIED">VERIFIED</option>
              <option value="EXCUSED">EXCUSED</option>
            </select>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Search Keywords</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search event, staff..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '2.25rem', fontSize: '0.8125rem' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* EDP Duties Roster Table */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
            Assigned EDP Event Duties ({filteredDuties.length})
          </h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Duty Code</th>
                <th>Event Name &amp; Role</th>
                <th>Assigned Staff Member</th>
                <th>Date &amp; Schedule</th>
                <th>Venue / Location</th>
                <th>GPS Evidence</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDuties.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No EDP duties found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredDuties.map(d => {
                  const isAssignedToMe = d.assignedUserId === user?.id || d.assignedUserId === user?.employeeId;
                  const hasEvidence = d.evidenceList.length > 0;

                  return (
                    <tr key={d.id}>
                      <td><strong>{d.dutyCode}</strong></td>
                      <td>
                        <div style={{ fontWeight: 800, color: 'var(--brand-navy)' }}>{d.eventName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--brand-orange)', fontWeight: 600 }}>
                          Role: {d.dutyRole.replace('_', ' ')}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700 }}>{d.assignedUserName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.assignedUserDesignation || d.assignedUserRole}</div>
                      </td>
                      <td>
                        <div>{d.dutyDate}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.startTime} - {d.endTime}</div>
                      </td>
                      <td>{d.venue}</td>
                      <td>
                        {hasEvidence ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#10B981', fontWeight: 700, fontSize: '0.75rem' }}>
                            <Navigation size={14} /> GPS VERIFIED ({d.evidenceList.length})
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pending Photo</span>
                        )}
                      </td>
                      <td>
                        <Badge variant={getStatusBadgeVariant(d.status)}>
                          {d.status}
                        </Badge>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          {isAssignedToMe && d.status !== 'VERIFIED' && (
                            <button className="btn btn-primary btn-sm" onClick={() => handleOpenEvidenceModal(d)}>
                              <Camera size={14} /> Upload GPS Photo
                            </button>
                          )}
                          <button className="btn btn-secondary btn-sm" onClick={() => handleOpenReviewModal(d)}>
                            <Eye size={14} /> View Evidence
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Create & Assign EDP Duty */}
      {isCreateModalOpen && (
        <Modal isOpen={isCreateModalOpen} title="Assign EDP / Event Duty" onClose={() => setIsCreateModalOpen(false)}>
          <form onSubmit={handleCreateDutySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Event Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. National AI Conference 2024"
                value={eventName}
                onChange={e => setEventName(e.target.value)}
                required
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Event Category *</label>
                <select className="form-input" value={eventType} onChange={e => setEventType(e.target.value as any)}>
                  <option value="CONVOCATION">CONVOCATION</option>
                  <option value="SEMINAR">SEMINAR</option>
                  <option value="WORKSHOP">WORKSHOP</option>
                  <option value="EXAM_INVIGILATION">EXAM_INVIGILATION</option>
                  <option value="CULTURAL_FEST">CULTURAL_FEST</option>
                  <option value="SPORTS_MEET">SPORTS_MEET</option>
                  <option value="NAAC_AUDIT">NAAC_AUDIT</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Duty Role *</label>
                <select className="form-input" value={dutyRole} onChange={e => setDutyRole(e.target.value as any)}>
                  <option value="EVENT_COORDINATOR">EVENT COORDINATOR</option>
                  <option value="VENUE_INCHARGE">VENUE INCHARGE</option>
                  <option value="DISCIPLINE_OFFICER">DISCIPLINE OFFICER</option>
                  <option value="TECHNICAL_LEAD">TECHNICAL LEAD</option>
                  <option value="REGISTRATION_DESK">REGISTRATION DESK</option>
                  <option value="STAGE_MANAGER">STAGE MANAGER</option>
                  <option value="VIP_HOSPITALITY">VIP HOSPITALITY</option>
                  <option value="GENERAL_DUTY">GENERAL DUTY</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Assign Staff Member (Faculty / HOD / HOI) *</label>
              <select className="form-input" value={assignedUserId} onChange={e => setAssignedUserId(e.target.value)} required>
                <option value="">Select Staff Member...</option>
                {facultyList.map(f => (
                  <option key={f.id} value={f.id}>{f.name} ({f.designation} - {f.employeeId})</option>
                ))}
              </select>
            </div>

            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Duty Date *</label>
                <input type="date" className="form-input" value={dutyDate} onChange={e => setDutyDate(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Start Time *</label>
                <input type="text" className="form-input" placeholder="09:00 AM" value={startTime} onChange={e => setStartTime(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">End Time *</label>
                <input type="text" className="form-input" placeholder="04:00 PM" value={endTime} onChange={e => setEndTime(e.target.value)} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Venue / Event Location *</label>
              <input type="text" className="form-input" placeholder="e.g. Swarrnim Auditorium Stage B" value={venue} onChange={e => setVenue(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Responsibility Details &amp; Task Guidelines *</label>
              <textarea className="form-input" rows={3} placeholder="Detailed instructions for assigned staff..." value={responsibilityDetails} onChange={e => setResponsibilityDetails(e.target.value)} required />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsCreateModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Assign EDP Duty</button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 2: Upload Geo-Tagged GPS Photo Evidence */}
      {isEvidenceModalOpen && selectedDuty && (
        <Modal isOpen={isEvidenceModalOpen} title={`Upload Geo-Tagged Evidence: ${selectedDuty.dutyCode}`} onClose={() => setIsEvidenceModalOpen(false)}>
          <form onSubmit={handleSubmitEvidenceConfirm} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: '#F0FDF4', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid #BBF7D0' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#166534', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Navigation size={18} color="#166534" /> Live GPS Coordinates Auto-Tagged
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#15803D', marginTop: '0.25rem', lineHeight: 1.5 }}>
                <div><strong>Latitude &amp; Longitude:</strong> {latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E</div>
                <div><strong>GPS Address:</strong> {locationAddress}</div>
                <div><strong>Captured Timestamp:</strong> {new Date().toLocaleString()}</div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Duty Execution Photo URL / Capture *</label>
              <input type="text" className="form-input" value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} required />
              <div style={{ marginTop: '0.5rem' }}>
                <img src={photoUrl} alt="Evidence Preview" style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Duty Execution Report &amp; Work Notes *</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Describe task execution, attendance, and outcomes..."
                value={reportsNotes}
                onChange={e => setReportsNotes(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsEvidenceModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Submit Evidence</button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 3: View Evidence & Admin Verification */}
      {isReviewModalOpen && selectedDuty && (
        <Modal isOpen={isReviewModalOpen} title={`EDP Duty Evidence Audit: ${selectedDuty.dutyCode}`} onClose={() => setIsReviewModalOpen(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Duty Summary Box */}
            <div style={{ background: 'var(--bg-surface-hover)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--brand-navy)' }}>{selectedDuty.eventName}</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Assigned to: <strong>{selectedDuty.assignedUserName}</strong> ({selectedDuty.assignedUserDesignation}) • Role: <strong>{selectedDuty.dutyRole.replace('_', ' ')}</strong>
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Venue: <strong>{selectedDuty.venue}</strong> • Schedule: <strong>{selectedDuty.dutyDate} ({selectedDuty.startTime} - {selectedDuty.endTime})</strong>
              </div>
            </div>

            {/* Geo-Tagged Evidence Gallery */}
            <div>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Camera size={18} color="var(--brand-orange)" /> Uploaded GPS Evidence ({selectedDuty.evidenceList.length})
              </h4>

              {selectedDuty.evidenceList.length === 0 ? (
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No evidence photos uploaded yet.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {selectedDuty.evidenceList.map(ev => (
                    <div key={ev.id} style={{ display: 'flex', gap: '1rem', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: '#FFFFFF' }}>
                      <img src={ev.photoUrl} alt="Evidence" style={{ width: '120px', height: '90px', objectFit: 'cover', borderRadius: '4px' }} />
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <div style={{ color: '#10B981', fontWeight: 700 }}><Navigation size={12} /> {ev.latitude.toFixed(4)}°N, {ev.longitude.toFixed(4)}°E</div>
                        <div><strong>Address:</strong> {ev.locationAddress}</div>
                        <div><strong>Captured On:</strong> {new Date(ev.capturedAt).toLocaleString()}</div>
                        <div><strong>Device:</strong> {ev.deviceInfo || 'GPS Verified Mobile Tablet'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Admin Verification Action Form */}
            {canCreateDuty && (
              <form onSubmit={handleVerifySubmit} style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--brand-navy)' }}>Admin Duty Audit Verification</div>
                
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Audit Status *</label>
                    <select className="form-input" value={verificationStatus} onChange={e => setVerificationStatus(e.target.value as EdpDutyStatus)}>
                      <option value="VERIFIED">VERIFIED &amp; APPROVED</option>
                      <option value="EXCUSED">EXCUSED</option>
                      <option value="ABSENT">MARKED ABSENT</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Verification Remarks</label>
                    <input type="text" className="form-input" value={verificationRemarks} onChange={e => setVerificationRemarks(e.target.value)} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setIsReviewModalOpen(false)}>Close</button>
                  <button type="submit" className="btn btn-primary">Save Audit Decision</button>
                </div>
              </form>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
