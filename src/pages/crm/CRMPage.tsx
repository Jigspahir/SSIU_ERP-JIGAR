import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Badge } from '../../components/common/Badge';
import { StatCard } from '../../components/common/StatCard';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { 
  CRMLead, AdmissionApplication, LeadSource, LeadStatus, 
  AdmissionApplicationStatus, LeadFollowUp, Program, Batch, Semester, Division
} from '../../types';
import { 
  Users, UserPlus, PhoneCall, CheckCircle, Plus, Search, 
  ArrowRight, MessageSquare, ShieldAlert, Award, FileText, Check, X, Upload,
  Edit3, Trash2, Download, Eye
} from 'lucide-react';
import { fileStorage } from '../../services/fileStorage';
import { DashboardReportModal } from '../../components/reports/DashboardReportModal';

export const CRMPage: React.FC = () => {
  const { user, role, canMutate } = useAuth();

  const leads = db.getCRMLeads();
  const applications = db.getAdmissionApplications();
  const facultyList = db.getFaculty();
  const programs = db.getPrograms();
  const batches = db.getBatches();
  const semesters = db.getSemesters();
  const divisions = db.getDivisions();

  const [activeTab, setActiveTab] = useState<'LEADS' | 'APPLICATIONS' | 'REPORTS'>('LEADS');

  // Filters State
  const [leadSourceFilter, setLeadSourceFilter] = useState('ALL');
  const [leadStatusFilter, setLeadStatusFilter] = useState('ALL');
  const [counsellorFilter, setCounsellorFilter] = useState('ALL');
  const [appStatusFilter, setAppStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals State
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [isReviewApplicationModalOpen, setIsReviewApplicationModalOpen] = useState(false);
  const [isNewApplicationModalOpen, setIsNewApplicationModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  
  const [selectedLead, setSelectedLead] = useState<CRMLead | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<AdmissionApplication | null>(null);
  const [deletingLead, setDeletingLead] = useState<CRMLead | null>(null);

  // Form State: Add/Edit Lead
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadSource, setLeadSource] = useState<LeadSource>('Website');
  const [leadStatus, setLeadStatus] = useState<LeadStatus>('NEW');
  const [leadCounsellorId, setLeadCounsellorId] = useState('');
  const [leadProgramId, setLeadProgramId] = useState('');
  const [leadRemarks, setLeadRemarks] = useState('');

  // Form State: Add Follow-up
  const [followUpNotes, setFollowUpNotes] = useState('');
  const [updateStatus, setUpdateStatus] = useState<LeadStatus>('FOLLOW_UP');

  // Form State: Admission Application review
  const [appStatus, setAppStatus] = useState<AdmissionApplicationStatus>('APPLIED');
  const [appReviewerRemarks, setAppReviewerRemarks] = useState('');

  // Form State: Create Admission Application
  const [appName, setAppName] = useState('');
  const [appEmail, setAppEmail] = useState('');
  const [appPhone, setAppPhone] = useState('');
  const [appGender, setAppGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [appDob, setAppDob] = useState('2005-05-15');
  const [appBloodGroup, setAppBloodGroup] = useState('O+');
  const [appAddress, setAppAddress] = useState('');
  const [appGuardianName, setAppGuardianName] = useState('');
  const [appGuardianPhone, setAppGuardianPhone] = useState('');
  const [appProgId, setAppProgId] = useState(programs[0]?.id || '');

  // Role Scoped Leads Filtering
  const scopedLeads = leads.filter(l => {
    // Faculty/Counsellor can only see leads assigned to them
    if (role === 'FACULTY' && user?.employeeId) {
      const assignedFac = facultyList.find(f => f.email === user.email || f.employeeId === user.employeeId);
      if (assignedFac && l.counsellorId !== assignedFac.id) return false;
    }

    const matchesSource = leadSourceFilter === 'ALL' || l.source === leadSourceFilter;
    const matchesStatus = leadStatusFilter === 'ALL' || l.status === leadStatusFilter;
    const matchesCounsellor = counsellorFilter === 'ALL' || l.counsellorId === counsellorFilter;
    const matchesSearch = l.name.toLowerCase().includes(searchTerm.toLowerCase()) || l.phone.includes(searchTerm);
    return matchesSource && matchesStatus && matchesCounsellor && matchesSearch;
  });

  // Role Scoped Applications Filtering
  const scopedApplications = applications.filter(a => {
    // Students can only see their own application
    if (role === 'STUDENT') {
      return a.email === user?.email || a.studentId === user?.id;
    }

    const matchesStatus = appStatusFilter === 'ALL' || a.status === appStatusFilter;
    const matchesSearch = a.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) || a.phone.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  // Handlers
  const handleOpenAddLead = () => {
    setSelectedLead(null);
    setLeadName('');
    setLeadEmail('');
    setLeadPhone('');
    setLeadSource('Website');
    setLeadStatus('NEW');
    setLeadCounsellorId(facultyList[0]?.id || '');
    setLeadProgramId(programs[0]?.id || '');
    setLeadRemarks('');
    setIsLeadModalOpen(true);
  };

  const handleOpenEditLead = (lead: CRMLead) => {
    setSelectedLead(lead);
    setLeadName(lead.name);
    setLeadEmail(lead.email);
    setLeadPhone(lead.phone);
    setLeadSource(lead.source);
    setLeadStatus(lead.status);
    setLeadCounsellorId(lead.counsellorId);
    setLeadProgramId(lead.programId);
    setLeadRemarks(lead.remarks || '');
    setIsLeadModalOpen(true);
  };

  const handleSaveLead = (e: React.FormEvent) => {
    e.preventDefault();
    const counsellor = facultyList.find(f => f.id === leadCounsellorId);
    const counsellorName = counsellor ? counsellor.name : 'Unassigned';

    if (selectedLead) {
      db.updateEntity<CRMLead>('crmLeads', selectedLead.id, {
        name: leadName,
        email: leadEmail,
        phone: leadPhone,
        source: leadSource,
        status: leadStatus,
        counsellorId: leadCounsellorId,
        counsellorName,
        programId: leadProgramId,
        remarks: leadRemarks
      }, `Updated CRM Lead details for ${leadName}`);
    } else {
      db.addEntity<CRMLead>('crmLeads', {
        name: leadName,
        email: leadEmail,
        phone: leadPhone,
        source: leadSource,
        status: leadStatus,
        counsellorId: leadCounsellorId,
        counsellorName,
        programId: leadProgramId,
        remarks: leadRemarks,
        createdAt: new Date().toISOString().split('T')[0],
        followUps: []
      }, `Created new CRM Lead candidate ${leadName}`);
    }
    setIsLeadModalOpen(false);
  };

  const handleAddFollowUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    const newFollowUp: LeadFollowUp = {
      id: `f-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      notes: followUpNotes,
      counsellorName: user?.name || 'Counsellor'
    };

    const updatedFollowUps = [...(selectedLead.followUps || []), newFollowUp];
    db.updateEntity<CRMLead>('crmLeads', selectedLead.id, {
      status: updateStatus,
      followUps: updatedFollowUps
    }, `Logged follow-up action notes for lead ${selectedLead.name}`);

    setFollowUpNotes('');
    setIsFollowUpModalOpen(false);
  };

  const handleConvertLeadToApplicant = (lead: CRMLead) => {
    // Auto-create admission application from lead details
    const newApp = db.addEntity<AdmissionApplication>('admissionApplications', {
      leadId: lead.id,
      applicantName: lead.name,
      email: lead.email,
      phone: lead.phone,
      gender: 'Male',
      dateOfBirth: '2005-05-15',
      bloodGroup: 'O+',
      address: 'Gandhinagar, Gujarat',
      guardianName: 'Guardian',
      guardianPhone: lead.phone,
      programId: lead.programId,
      semesterId: semesters[0]?.id || '',
      batchId: batches[0]?.id || '',
      divisionId: divisions[0]?.id || '',
      status: 'APPLIED',
      submittedAt: new Date().toISOString().split('T')[0],
      documents: [
        { id: `doc-app-${Date.now()}-1`, name: '12th Marksheet & Transcript', status: 'PENDING' },
        { id: `doc-app-${Date.now()}-2`, name: 'Government ID Proof (Aadhaar)', status: 'PENDING' }
      ]
    }, `Converted CRM Lead ${lead.name} to Admission Application`);

    db.updateEntity<CRMLead>('crmLeads', lead.id, { status: 'CONVERTED' });
    alert(`Successfully registered Admission Application for ${lead.name}`);
  };

  const handleOpenReviewApplication = (app: AdmissionApplication) => {
    setSelectedApplication(app);
    setAppStatus(app.status);
    setAppReviewerRemarks(app.reviewerRemarks || '');
    setIsReviewApplicationModalOpen(true);
  };

  const handleSaveApplicationReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApplication) return;

    db.updateEntity<AdmissionApplication>('admissionApplications', selectedApplication.id, {
      status: appStatus,
      reviewerRemarks: appReviewerRemarks
    }, `Reviewed admission application status to ${appStatus} for ${selectedApplication.applicantName}`);

    setIsReviewApplicationModalOpen(false);
  };

  const handleDirectAdmissionApplicationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    db.addEntity<AdmissionApplication>('admissionApplications', {
      applicantName: appName,
      email: appEmail,
      phone: appPhone,
      gender: appGender,
      dateOfBirth: appDob,
      bloodGroup: appBloodGroup,
      address: appAddress,
      guardianName: appGuardianName,
      guardianPhone: appGuardianPhone,
      programId: appProgId,
      semesterId: semesters[0]?.id || '',
      batchId: batches[0]?.id || '',
      divisionId: divisions[0]?.id || '',
      status: 'APPLIED',
      submittedAt: new Date().toISOString().split('T')[0],
      documents: [
        { id: `doc-app-${Date.now()}-1`, name: '12th Marksheet & Transcript', status: 'PENDING' },
        { id: `doc-app-${Date.now()}-2`, name: 'Government ID Proof (Aadhaar)', status: 'PENDING' }
      ]
    }, `Submitted new admission application for ${appName}`);

    setIsNewApplicationModalOpen(false);
  };

  const handleConvertApplicationToStudent = (app: AdmissionApplication) => {
    const student = db.convertApplicantToStudent(app.id);
    if (student) {
      alert(`Applicant ${app.applicantName} successfully converted to active Student. Enrolled with Enrollment No: ${student.enrollmentNo}`);
    }
  };

  const handleToggleDocVerification = (app: AdmissionApplication, docId: string, verified: boolean) => {
    const updatedDocs = app.documents.map(d => d.id === docId ? { ...d, status: verified ? 'VERIFIED' as const : 'REJECTED' as const } : d);
    db.updateEntity<AdmissionApplication>('admissionApplications', app.id, {
      documents: updatedDocs
    });
    setSelectedApplication(prev => prev ? { ...prev, documents: updatedDocs } : null);
  };

  const handleDeleteLeadConfirm = () => {
    if (deletingLead) {
      db.deleteEntity('crmLeads', deletingLead.id, `Removed Lead candidate ${deletingLead.name}`);
      setDeletingLead(null);
    }
  };

  const getLeadStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'CONVERTED': return <Badge variant="active">CONVERTED</Badge>;
      case 'FOLLOW_UP': return <Badge variant="orange">FOLLOW UP</Badge>;
      case 'INTERESTED': return <Badge variant="gold">INTERESTED</Badge>;
      case 'NEW': return <Badge variant="navy">NEW</Badge>;
      case 'CLOSED': return <Badge variant="inactive">CLOSED</Badge>;
      default: return <Badge variant="inactive">{status}</Badge>;
    }
  };

  const getAppStatusBadge = (status: AdmissionApplicationStatus) => {
    switch (status) {
      case 'CONVERTED': return <Badge variant="active">CONVERTED TO STUDENT</Badge>;
      case 'APPROVED': return <Badge variant="active">APPROVED</Badge>;
      case 'SHORTLISTED': return <Badge variant="gold">SHORTLISTED</Badge>;
      case 'DOCUMENT_VERIFICATION': return <Badge variant="orange">DOC VERIFICATION</Badge>;
      case 'REJECTED': return <Badge variant="danger">REJECTED</Badge>;
      default: return <Badge variant="navy">APPLIED</Badge>;
    }
  };

  // 4. Student View Template
  const renderStudentView = () => {
    const myApp = scopedApplications[0];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
            Admission Application Portal
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            View admission evaluation progress and upload required documents
          </p>
        </div>

        {!myApp ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
            <FileText size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
            <h4 style={{ fontWeight: 800, color: 'var(--brand-navy)' }}>No Application Found</h4>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              We could not find an active admission application matching your email address.
            </p>
          </div>
        ) : (
          <div className="grid-2">
            {/* Left: Application Details */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--brand-navy)' }}>
                  Application #{myApp.id.split('-')[1]}
                </h3>
                {getAppStatusBadge(myApp.status)}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                <div><span style={{ color: 'var(--text-muted)' }}>Applicant Name:</span> <strong>{myApp.applicantName}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Applied Program:</span> <strong>{programs.find(p => p.id === myApp.programId)?.name}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Submitted Date:</span> <strong>{myApp.submittedAt}</strong></div>
                {myApp.reviewerRemarks && (
                  <div style={{ padding: '0.75rem', background: 'var(--brand-orange-light)', borderLeft: '3px solid var(--brand-orange)', borderRadius: 'var(--radius-sm)', marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-orange)' }}>REVIEWER REMARKS:</span>
                    <p style={{ fontSize: '0.8125rem', marginTop: '0.25rem' }}>{myApp.reviewerRemarks}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Uploaded Verification Documents */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '1.25rem' }}>
                Required Documents
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {myApp.documents.map(doc => (
                  <div key={doc.id} style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.8125rem' }}>{doc.name}</div>
                      <Badge variant={doc.status === 'VERIFIED' ? 'active' : 'orange'}>{doc.status}</Badge>
                    </div>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      {doc.fileUrl && (
                        <>
                          <button className="btn btn-secondary btn-sm" onClick={() => fileStorage.viewFile(doc.fileUrl!)}>
                            <Eye size={14} /> View
                          </button>
                          <button className="btn btn-primary btn-sm" onClick={() => fileStorage.downloadFile(doc.fileUrl!, doc.name)}>
                            <Download size={14} /> Download
                          </button>
                        </>
                      )}
                      <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', margin: 0 }}>
                        <Upload size={14} /> {doc.fileUrl ? 'Replace' : 'Upload'}
                        <input
                          type="file"
                          style={{ display: 'none' }}
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const fileUrl = await fileStorage.saveFile(file);
                              const updatedDocs = myApp.documents.map(d => d.id === doc.id ? { ...d, fileUrl, status: 'PENDING' as const } : d);
                              db.updateEntity<AdmissionApplication>('admissionApplications', myApp.id, { documents: updatedDocs });
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (role === 'STUDENT') return renderStudentView();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
            CRM &amp; Admissions Portal
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Manage enquiries, log follow-ups, evaluate applications, and convert leads into students
          </p>
        </div>

        {role !== 'FACULTY' && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => setIsReportModalOpen(true)}>
              <FileText size={16} /> Generate Admission Report
            </button>
            <button className="btn btn-secondary" onClick={() => setIsNewApplicationModalOpen(true)}>
              New Application Form
            </button>
            <button className="btn btn-secondary" onClick={handleOpenAddLead}>
              <Plus size={16} /> Add CRM Lead
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="card" style={{ padding: '0.75rem 1rem', display: 'flex', gap: '0.5rem' }}>
        <button
          className={`btn btn-sm ${activeTab === 'LEADS' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setActiveTab('LEADS'); setSearchTerm(''); }}
        >
          CRM Leads &amp; Enquiries ({scopedLeads.length})
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'APPLICATIONS' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setActiveTab('APPLICATIONS'); setSearchTerm(''); }}
        >
          Admission Applications ({scopedApplications.length})
        </button>
        {role !== 'FACULTY' && (
          <button
            className={`btn btn-sm ${activeTab === 'REPORTS' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('REPORTS')}
          >
            Funnel Reports
          </button>
        )}
      </div>

      {/* Tab Content: CRM Leads */}
      {activeTab === 'LEADS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Filters */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div className="grid-4">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Lead Source</label>
                <select className="form-select" value={leadSourceFilter} onChange={e => setLeadSourceFilter(e.target.value)}>
                  <option value="ALL">All Sources</option>
                  <option value="Website">Website</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Walk-in">Walk-in</option>
                  <option value="Reference">Reference</option>
                  <option value="Educational Fair">Educational Fair</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Lead Status</label>
                <select className="form-select" value={leadStatusFilter} onChange={e => setLeadStatusFilter(e.target.value)}>
                  <option value="ALL">All Statuses</option>
                  <option value="NEW">NEW</option>
                  <option value="CONTACTED">CONTACTED</option>
                  <option value="INTERESTED">INTERESTED</option>
                  <option value="FOLLOW_UP">FOLLOW UP</option>
                  <option value="CONVERTED">CONVERTED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>

              {role !== 'FACULTY' ? (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Assigned Counsellor</label>
                  <select className="form-select" value={counsellorFilter} onChange={e => setCounsellorFilter(e.target.value)}>
                    <option value="ALL">All Counsellors</option>
                    {facultyList.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
              ) : (
                <div />
              )}

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Search Lead</label>
                <div style={{ position: 'relative' }}>
                  <input type="text" className="form-input" placeholder="Search name, phone..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ paddingLeft: '2.2rem' }} />
                  <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Leads Directory Table */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Lead Name</th>
                    <th>Email &amp; Phone</th>
                    <th>Lead Source</th>
                    <th>Program interested</th>
                    <th>Counsellor</th>
                    <th>Status</th>
                    <th>Follow-ups</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {scopedLeads.map(l => (
                    <tr key={l.id}>
                      <td style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>{l.name}</td>
                      <td>
                        <div style={{ fontSize: '0.8125rem' }}>{l.email}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{l.phone}</div>
                      </td>
                      <td><Badge variant="orange">{l.source}</Badge></td>
                      <td>{programs.find(p => p.id === l.programId)?.code}</td>
                      <td style={{ fontSize: '0.8125rem' }}>{l.counsellorName}</td>
                      <td>{getLeadStatusBadge(l.status)}</td>
                      <td>
                        <button className="btn btn-secondary btn-sm" onClick={() => { setSelectedLead(l); setUpdateStatus(l.status); setIsFollowUpModalOpen(true); }}>
                          <MessageSquare size={14} /> Log ({l.followUps?.length || 0})
                        </button>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          {l.status !== 'CONVERTED' && role !== 'FACULTY' && (
                            <button className="btn btn-primary btn-sm" onClick={() => handleConvertLeadToApplicant(l)}>
                              Convert Lead
                            </button>
                          )}
                          {role !== 'FACULTY' && (
                            <>
                              <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEditLead(l)}>
                                <Edit3 size={14} />
                              </button>
                              <button className="btn btn-danger btn-sm" onClick={() => setDeletingLead(l)}>
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Admission Applications */}
      {activeTab === 'APPLICATIONS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Applications Directory Table */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Applicant Name</th>
                    <th>Email &amp; Phone</th>
                    <th>Applied Program</th>
                    <th>Submitted Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {scopedApplications.map(app => (
                    <tr key={app.id}>
                      <td style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>{app.applicantName}</td>
                      <td>
                        <div style={{ fontSize: '0.8125rem' }}>{app.email}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.phone}</div>
                      </td>
                      <td><strong>{programs.find(p => p.id === app.programId)?.code}</strong></td>
                      <td>{app.submittedAt}</td>
                      <td>{getAppStatusBadge(app.status)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => handleOpenReviewApplication(app)}>
                            Review Application
                          </button>
                          {app.status === 'APPROVED' && role !== 'FACULTY' && (
                            <button className="btn btn-primary btn-sm" onClick={() => handleConvertApplicationToStudent(app)}>
                              Convert to Student
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Funnel Reports Tab */}
      {activeTab === 'REPORTS' && role !== 'FACULTY' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="grid-3">
            <div className="card" style={{ padding: '1.5rem' }}>
              <h4 style={{ fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '1rem' }}>Lead Sources Breakdown</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                {['Website', 'Social Media', 'Walk-in', 'Reference'].map(src => {
                  const count = leads.filter(l => l.source === src).length;
                  return (
                    <div key={src} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.4rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{src}:</span>
                      <strong>{count} Leads</strong>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card" style={{ padding: '1.5rem' }}>
              <h4 style={{ fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '1rem' }}>CRM Pipeline Funnel</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                {['NEW', 'INTERESTED', 'FOLLOW_UP', 'CONVERTED'].map(st => {
                  const count = leads.filter(l => l.status === st).length;
                  return (
                    <div key={st} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.4rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{st}:</span>
                      <strong>{count} Candidates</strong>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card" style={{ padding: '1.5rem' }}>
              <h4 style={{ fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '1rem' }}>Admissions Status</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                {['APPLIED', 'DOCUMENT_VERIFICATION', 'APPROVED', 'CONVERTED'].map(st => {
                  const count = applications.filter(a => a.status === st).length;
                  return (
                    <div key={st} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.4rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{st}:</span>
                      <strong>{count} Applicants</strong>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lead Add/Edit Modal */}
      {isLeadModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '540px', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1.25rem' }}>
              {selectedLead ? 'Edit Lead Profile' : 'Add New CRM Lead'}
            </h3>

            <form onSubmit={handleSaveLead} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Full Candidate Name *</label>
                <input type="text" className="form-input" value={leadName} onChange={e => setLeadName(e.target.value)} required />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input type="email" className="form-input" value={leadEmail} onChange={e => setLeadEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input type="text" className="form-input" value={leadPhone} onChange={e => setLeadPhone(e.target.value)} required />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Lead Source *</label>
                  <select className="form-select" value={leadSource} onChange={e => setLeadSource(e.target.value as any)}>
                    <option value="Website">Website</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Walk-in">Walk-in</option>
                    <option value="Reference">Reference</option>
                    <option value="Educational Fair">Educational Fair</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Interested Program *</label>
                  <select className="form-select" value={leadProgramId} onChange={e => setLeadProgramId(e.target.value)}>
                    {programs.map(p => <option key={p.id} value={p.id}>{p.code}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Assign Counsellor *</label>
                  <select className="form-select" value={leadCounsellorId} onChange={e => setLeadCounsellorId(e.target.value)}>
                    {facultyList.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Lead Status *</label>
                  <select className="form-select" value={leadStatus} onChange={e => setLeadStatus(e.target.value as any)}>
                    <option value="NEW">NEW</option>
                    <option value="CONTACTED">CONTACTED</option>
                    <option value="INTERESTED">INTERESTED</option>
                    <option value="FOLLOW_UP">FOLLOW UP</option>
                    <option value="CONVERTED">CONVERTED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Enquiry Notes / Details</label>
                <textarea className="form-input" rows={2} value={leadRemarks} onChange={e => setLeadRemarks(e.target.value)} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsLeadModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Lead Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Follow Up Logger Modal */}
      {isFollowUpModalOpen && selectedLead && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '480px', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '0.25rem' }}>
              CRM Follow-up Logger
            </h3>
            <div style={{ fontSize: '0.8125rem', color: 'var(--brand-orange)', fontWeight: 700, marginBottom: '1.25rem' }}>
              Candidate: {selectedLead.name}
            </div>

            <form onSubmit={handleAddFollowUpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Previous Follow-up Feed */}
              <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', backgroundColor: 'var(--bg-surface-hover)', display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '0.5rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Log History</div>
                {selectedLead.followUps?.length === 0 ? (
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>No follow-up log recorded yet.</div>
                ) : (
                  selectedLead.followUps?.map(f => (
                    <div key={f.id} style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '0.4rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--brand-navy)', fontWeight: 700 }}>
                        <span>{f.counsellorName}</span>
                        <span>{f.date}</span>
                      </div>
                      <p style={{ fontSize: '0.8125rem', marginTop: '0.15rem', color: 'var(--text-muted)' }}>{f.notes}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Follow-up Notes / Call Details *</label>
                <textarea className="form-input" rows={2} value={followUpNotes} onChange={e => setFollowUpNotes(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Update Status *</label>
                <select className="form-select" value={updateStatus} onChange={e => setUpdateStatus(e.target.value as any)}>
                  <option value="NEW">NEW</option>
                  <option value="CONTACTED">CONTACTED</option>
                  <option value="INTERESTED">INTERESTED</option>
                  <option value="FOLLOW_UP">FOLLOW UP</option>
                  <option value="CONVERTED">CONVERTED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsFollowUpModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Follow-up Notes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Admission Application Modal */}
      {isReviewApplicationModalOpen && selectedApplication && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '640px', padding: '1.75rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1rem' }}>
              Review Admission Application
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Applicant Profile */}
              <div className="grid-2" style={{ fontSize: '0.8125rem', padding: '0.85rem', background: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-sm)', gap: '0.5rem' }}>
                <div><span style={{ color: 'var(--text-muted)' }}>Name:</span> <strong>{selectedApplication.applicantName}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Email:</span> <strong>{selectedApplication.email}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Phone:</span> <strong>{selectedApplication.phone}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Guardian:</span> <strong>{selectedApplication.guardianName} ({selectedApplication.guardianPhone})</strong></div>
              </div>

              {/* Documents Checklist */}
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '0.5rem' }}>Document Verification</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selectedApplication.documents?.map(doc => (
                    <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', borderBottom: '1px solid var(--border-light)' }}>
                      <div>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{doc.name}</span>
                        {doc.fileUrl && (
                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
                            <button type="button" className="btn btn-secondary btn-sm py-0.5 px-1.5 text-xs" onClick={() => fileStorage.viewFile(doc.fileUrl!)}>
                              <Eye size={12} /> View
                            </button>
                            <button type="button" className="btn btn-secondary btn-sm py-0.5 px-1.5 text-xs" onClick={() => fileStorage.downloadFile(doc.fileUrl!, doc.name)}>
                              <Download size={12} /> Download
                            </button>
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Badge variant={doc.status === 'VERIFIED' ? 'active' : 'orange'}>{doc.status}</Badge>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleToggleDocVerification(selectedApplication, doc.id, true)}>
                          <Check size={14} /> Verify
                        </button>
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => handleToggleDocVerification(selectedApplication, doc.id, false)}>
                          <X size={14} /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSaveApplicationReview} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Reviewer Comments / Remarks</label>
                  <textarea className="form-input" rows={2} value={appReviewerRemarks} onChange={e => setAppReviewerRemarks(e.target.value)} />
                </div>

                <div className="form-group">
                  <label className="form-label">Application Status</label>
                  <select className="form-select" value={appStatus} onChange={e => setAppStatus(e.target.value as any)}>
                    <option value="APPLIED">APPLIED</option>
                    <option value="DOCUMENT_VERIFICATION">DOCUMENT VERIFICATION</option>
                    <option value="SHORTLISTED">SHORTLISTED</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="REJECTED">REJECTED</option>
                    <option value="CONVERTED">CONVERTED</option>
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setIsReviewApplicationModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Review</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* New Application Form Modal */}
      {isNewApplicationModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '640px', padding: '1.75rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1.25rem' }}>
              Direct Admission Application Form
            </h3>

            <form onSubmit={handleDirectAdmissionApplicationSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Full Applicant Name *</label>
                  <input type="text" className="form-input" value={appName} onChange={e => setAppName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Course / Degree Program *</label>
                  <select className="form-select" value={appProgId} onChange={e => setAppProgId(e.target.value)}>
                    {programs.map(p => <option key={p.id} value={p.id}>{p.code}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Applicant Email *</label>
                  <input type="email" className="form-input" value={appEmail} onChange={e => setAppEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Applicant Phone *</label>
                  <input type="text" className="form-input" value={appPhone} onChange={e => setAppPhone(e.target.value)} required />
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Gender *</label>
                  <select className="form-select" value={appGender} onChange={e => setAppGender(e.target.value as any)}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input type="date" className="form-input" value={appDob} onChange={e => setAppDob(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <input type="text" className="form-input" value={appBloodGroup} onChange={e => setAppBloodGroup(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Residential Address</label>
                <input type="text" className="form-input" value={appAddress} onChange={e => setAppAddress(e.target.value)} />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Guardian Name *</label>
                  <input type="text" className="form-input" value={appGuardianName} onChange={e => setAppGuardianName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Guardian Phone *</label>
                  <input type="text" className="form-input" value={appGuardianPhone} onChange={e => setAppGuardianPhone(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsNewApplicationModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Application</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Lead Dialog */}
      <ConfirmDialog
        isOpen={!!deletingLead}
        onClose={() => setDeletingLead(null)}
        onConfirm={handleDeleteLeadConfirm}
        title="Remove CRM Lead"
        message={`Are you sure you want to remove the lead record for "${deletingLead?.name}"?`}
      />

      {/* Dashboard Report Modal */}
      <DashboardReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        dashboardType="ADMISSION"
        currentFilters={{
          status: appStatusFilter !== 'ALL' ? appStatusFilter : undefined,
          searchQuery: searchTerm
        }}
        user={user}
        role={role}
      />
    </div>
  );
};
