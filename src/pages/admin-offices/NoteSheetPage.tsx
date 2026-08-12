import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Badge } from '../../components/common/Badge';
import { StatCard } from '../../components/common/StatCard';
import {
  FileText, Plus, Search, Filter, CheckCircle2, XCircle, Clock,
  ArrowRight, ShieldCheck, Download, Upload, AlertCircle, RefreshCw,
  DollarSign, Settings, Eye, Edit3, Trash, User, Info, Check, Calendar
} from 'lucide-react';
import { NoteSheet, NoteSheetStatus, NoteSheetAction, NoteSheetWorkflowConfig } from '../../types';
import { exportToExcel } from '../../services/exportService';

// Form interface for local state
interface NoteSheetFormData {
  instituteId: string;
  departmentId: string;
  contactNumber: string;
  subject: string;
  proposal: string;
  purposeJustification: string;
  budgetRequired: boolean;
  estimatedCost: number;
  vendorQuotation?: string;
  requiredDate: string;
  attachments: string[];
}

export const NoteSheetPage: React.FC = () => {
  const { user, role } = useAuth();
  
  // State from database
  const [noteSheets, setNoteSheets] = useState<NoteSheet[]>(() => db.getNoteSheets());
  const [configs, setConfigs] = useState<NoteSheetWorkflowConfig[]>(() => db.getNoteSheetWorkflowConfigs());
  
  // Active workflow config
  const activeConfig = useMemo(() => configs.find(c => c.isActive) || { steps: ['HOD', 'DEPUTY_REGISTRAR', 'REGISTRAR', 'VICE_PRESIDENT'] }, [configs]);

  // Dashboards & Tabs
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'MY_SHEETS' | 'APPROVAL_QUEUE' | 'CONFIG'>('DASHBOARD');
  const [subFilter, setSubFilter] = useState<'ALL' | 'DRAFT' | 'SUBMITTED' | 'PENDING' | 'RETURNED' | 'APPROVED' | 'REJECTED' | 'COMPLETED'>('ALL');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInst, setSelectedInst] = useState('ALL');
  const [selectedDept, setSelectedDept] = useState('ALL');

  // Modals & Forms
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState<NoteSheet | null>(null);
  
  // Form fields
  const [formData, setFormData] = useState<NoteSheetFormData>({
    instituteId: user?.instituteId || 'inst-1',
    departmentId: user?.departmentId || 'dept-1',
    contactNumber: user?.phone || '',
    subject: '',
    proposal: '',
    purposeJustification: '',
    budgetRequired: false,
    estimatedCost: 0,
    requiredDate: new Date().toISOString().split('T')[0],
    attachments: []
  });

  // Action fields (Approve, Reject, Return, Forward)
  const [actionType, setActionType] = useState<NoteSheetAction>('APPROVE');
  const [actionRemarks, setActionRemarks] = useState('');
  const [actionFile, setActionFile] = useState('');
  
  // Feedback
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Workflow builder state (Super Admin only)
  const [customSteps, setCustomSteps] = useState<string[]>(['HOD', 'DEPUTY_REGISTRAR', 'REGISTRAR', 'VICE_PRESIDENT']);
  const [newStep, setNewStep] = useState('DEPUTY_REGISTRAR');

  // Load catalogs
  const institutes = db.getInstitutes();
  const departments = db.getDepartments();

  const refreshData = () => {
    setNoteSheets(db.getNoteSheets());
    setConfigs(db.getNoteSheetWorkflowConfigs());
  };

  const showFeedback = (msg: string, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 4000);
    } else {
      setMessage(msg);
      setTimeout(() => setMessage(''), 4000);
    }
  };

  // Determine current pending items for logged in authority
  const pendingForMe = useMemo(() => {
    if (!user) return [];
    return noteSheets.filter(n => {
      // Registrar checks Deputy Registrar steps too
      if (user.role === 'REGISTRAR') {
        return n.currentOffice === 'REGISTRAR' || n.currentOffice === 'DEPUTY_REGISTRAR';
      }
      return n.currentOffice === user.role;
    });
  }, [noteSheets, user]);

  // Deriving KPIs
  const kpis = useMemo(() => {
    return {
      draft: noteSheets.filter(n => n.status === 'DRAFT' && n.creatorId === user?.id).length,
      submitted: noteSheets.filter(n => n.creatorId === user?.id && n.status !== 'DRAFT').length,
      pendingApproval: pendingForMe.length,
      approved: noteSheets.filter(n => n.status === 'COMPLETED').length,
      rejected: noteSheets.filter(n => n.status === 'REJECTED').length,
      returned: noteSheets.filter(n => n.status === 'RETURNED' && n.creatorId === user?.id).length
    };
  }, [noteSheets, pendingForMe, user]);

  // Main list filters
  const filteredNotes = useMemo(() => {
    return noteSheets.filter(n => {
      // Tab isolation
      if (activeTab === 'MY_SHEETS') {
        if (n.creatorId !== user?.id) return false;
        if (subFilter === 'DRAFT' && n.status !== 'DRAFT') return false;
        if (subFilter === 'SUBMITTED' && n.status === 'DRAFT') return false;
        if (subFilter === 'RETURNED' && n.status !== 'RETURNED') return false;
        if (subFilter === 'APPROVED' && n.status !== 'COMPLETED') return false;
        if (subFilter === 'REJECTED' && n.status !== 'REJECTED') return false;
      } else if (activeTab === 'APPROVAL_QUEUE') {
        // Must be in pendingForMe
        if (!pendingForMe.some(p => p.id === n.id)) return false;
      }

      // Search & hierarchy filters
      if (selectedInst !== 'ALL' && n.instituteId !== selectedInst) return false;
      if (selectedDept !== 'ALL' && n.departmentId !== selectedDept) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          n.noteSheetNumber.toLowerCase().includes(q) ||
          n.subject.toLowerCase().includes(q) ||
          n.creatorName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [noteSheets, activeTab, subFilter, pendingForMe, selectedInst, selectedDept, searchQuery, user]);

  // Form handlers
  const handleCreateSubmit = (e: React.FormEvent, isDraft: boolean) => {
    e.preventDefault();
    if (!user) return;

    db.createNoteSheet({
      ...formData,
      creatorId: user.id,
      creatorName: user.name,
      requiredDate: formData.requiredDate,
      date: new Date().toISOString().split('T')[0]
    }, user, isDraft);

    refreshData();
    setShowCreateModal(false);
    setFormData({
      instituteId: user?.instituteId || 'inst-1',
      departmentId: user?.departmentId || 'dept-1',
      contactNumber: user?.phone || '',
      subject: '',
      proposal: '',
      purposeJustification: '',
      budgetRequired: false,
      estimatedCost: 0,
      requiredDate: new Date().toISOString().split('T')[0],
      attachments: []
    });
    showFeedback(isDraft ? 'Draft Note Sheet saved successfully.' : 'Note Sheet submitted to approval workflow.');
  };

  const handleActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedNote) return;

    db.processNoteSheetAction(selectedNote.id, actionType, actionRemarks, actionFile || undefined, user);
    refreshData();
    setShowActionModal(false);
    setActionRemarks('');
    setActionFile('');
    showFeedback(`Note Sheet ${selectedNote.noteSheetNumber} processed successfully.`);
  };

  const saveWorkflowConfig = () => {
    const newConfig: NoteSheetWorkflowConfig = {
      id: 'ssiu-default',
      name: 'SSIU Hierarchy Config',
      steps: customSteps,
      isActive: true
    };
    db.saveNoteSheetWorkflowConfig(newConfig);
    refreshData();
    showFeedback('Approval Workflow Config updated successfully.');
  };

  // MOCK PDF PRINTING
  const printNoteSheet = (note: NoteSheet) => {
    const printContent = `
================ SSIU ERP Note Sheet Printout ================
Note Sheet Number: ${note.noteSheetNumber}
Date: ${note.date}
Subject: ${note.subject}
Creator: ${note.creatorName} (${note.contactNumber})
--------------------------------------------------------------
Proposal:
${note.proposal}

Purpose/Justification:
${note.purposeJustification}

Budget Details:
Required: ${note.budgetRequired ? 'Yes' : 'No'}
Estimated Cost: INR ${note.estimatedCost.toLocaleString()}
Vendor Quotation: ${note.vendorQuotation || 'N/A'}
Required Date: ${note.requiredDate}

Approval Trail & Signatures:
${note.movements.map(m => `[${m.timestamp}] - ${m.fromUser} (${m.action}): ${m.remarks}`).join('\n')}

==============================================================
    `;
    const w = window.open();
    if (w) {
      w.document.write(`<pre>${printContent}</pre>`);
      w.document.close();
      w.print();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
            Digital Note Sheet &amp; Approval Workflows
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Submit, process, track, and archive official SSIU administrative &amp; financial Note Sheets.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={refreshData}>
            <RefreshCw size={16} /> Refresh
          </button>
          {role !== 'STUDENT' && (
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
              <Plus size={16} /> Create Note Sheet
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div style={{ padding: '0.75rem 1.25rem', background: '#ECFDF5', border: '1px solid #6EE7B7', color: '#065F46', borderRadius: 'var(--radius-md)', fontWeight: 600 }}>
          {message}
        </div>
      )}

      {/* Navigation tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button className={`btn btn-sm ${activeTab === 'DASHBOARD' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('DASHBOARD')}>
          Dashboard Summary
        </button>
        <button className={`btn btn-sm ${activeTab === 'MY_SHEETS' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setActiveTab('MY_SHEETS'); setSubFilter('ALL'); }}>
          My Note Sheets ({kpis.draft + kpis.submitted})
        </button>
        <button className={`btn btn-sm ${activeTab === 'APPROVAL_QUEUE' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('APPROVAL_QUEUE')}>
          Pending My Approval ({kpis.pendingApproval})
        </button>
        {role === 'SUPER_ADMIN' && (
          <button className={`btn btn-sm ${activeTab === 'CONFIG' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('CONFIG')}>
            Workflow Settings
          </button>
        )}
      </div>

      {/* ─── TAB: DASHBOARD ─── */}
      {activeTab === 'DASHBOARD' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="grid-4">
            <StatCard title="Pending Action" value={String(kpis.pendingApproval)} icon={Clock} colorScheme="orange" subtitle="Awaiting your digital sign" />
            <StatCard title="My Drafts" value={String(kpis.draft)} icon={FileText} colorScheme="gold" subtitle="Unsubmitted Note Sheets" />
            <StatCard title="My Submissions" value={String(kpis.submitted)} icon={ShieldCheck} colorScheme="navy" subtitle="Active in workflow" />
            <StatCard title="Approved / Completed" value={String(kpis.approved)} icon={CheckCircle2} colorScheme="green" subtitle="Fully approved note sheets" />
          </div>

          <div className="grid-2">
            {/* Quick Actions Panel */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1rem' }}>
                Quick Action Guide
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <Badge variant="navy">Step 1</Badge>
                  <span>Draft a Proposal Note Sheet with estimated costs &amp; justification.</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <Badge variant="orange">Step 2</Badge>
                  <span>Submit to automatically route to your HOD/HOI.</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <Badge variant="active">Step 3</Badge>
                  <span>Track movement progress in real-time under "My Note Sheets" history.</span>
                </div>
              </div>
            </div>

            {/* Configured Workflow Details */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1rem' }}>
                Active Workflow Hierarchy
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                {activeConfig.steps.map((step, idx) => (
                  <React.Fragment key={step}>
                    <Badge variant="navy">{step.replace('_', ' ')}</Badge>
                    {idx < activeConfig.steps.length - 1 && <ArrowRight size={14} color="var(--text-muted)" />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB: LISTINGS (MY_SHEETS & APPROVAL_QUEUE) ─── */}
      {(activeTab === 'MY_SHEETS' || activeTab === 'APPROVAL_QUEUE') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Sub-Filters for My Sheets */}
          {activeTab === 'MY_SHEETS' && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {(['ALL', 'DRAFT', 'SUBMITTED', 'RETURNED', 'APPROVED', 'REJECTED'] as typeof subFilter[]).map(f => (
                <button key={f} className={`btn btn-xs ${subFilter === f ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setSubFilter(f)}>
                  {f}
                </button>
              ))}
            </div>
          )}

          {/* Search bar & filter selection */}
          <div className="card" style={{ padding: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: 200, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Search size={16} color="var(--text-muted)" />
              <input type="text" className="form-input" placeholder="Search Note Sheets..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <select className="form-select" style={{ maxWidth: 200 }} value={selectedInst} onChange={e => setSelectedInst(e.target.value)}>
              <option value="ALL">All Institutes</option>
              {institutes.map(inst => <option key={inst.id} value={inst.id}>{inst.code}</option>)}
            </select>
            <select className="form-select" style={{ maxWidth: 200 }} value={selectedDept} onChange={e => setSelectedDept(e.target.value)}>
              <option value="ALL">All Departments</option>
              {departments.map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
            </select>
          </div>

          {/* Note Sheets Table */}
          <div className="card" style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Note Sheet No.</th>
                  <th>Date</th>
                  <th>Creator</th>
                  <th>Subject</th>
                  <th>Cost (INR)</th>
                  <th>Workflow Location</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredNotes.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                      No Note Sheets found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredNotes.map(note => (
                    <tr key={note.id}>
                      <td><strong style={{ color: 'var(--brand-orange)' }}>{note.noteSheetNumber}</strong></td>
                      <td>{note.date}</td>
                      <td>{note.creatorName}</td>
                      <td style={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{note.subject}</td>
                      <td>₹{note.estimatedCost.toLocaleString()}</td>
                      <td><Badge variant="navy">{note.currentOffice.replace('_', ' ')}</Badge></td>
                      <td>
                        <Badge variant={
                          note.status === 'COMPLETED' ? 'active' :
                          note.status === 'REJECTED' ? 'danger' :
                          note.status === 'RETURNED' ? 'orange' : 'navy'
                        }>
                          {note.status}
                        </Badge>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button className="btn btn-secondary btn-xs" title="Print note sheet / view logs" onClick={() => { setSelectedNote(note); printNoteSheet(note); }}>
                            <Eye size={12} /> Print/View
                          </button>
                          {activeTab === 'APPROVAL_QUEUE' && (
                            <button className="btn btn-primary btn-xs" onClick={() => { setSelectedNote(note); setShowActionModal(true); }}>
                              <Check size={12} /> Decide
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB: WORKFLOW CONFIG (SUPER_ADMIN ONLY) ─── */}
      {activeTab === 'CONFIG' && role === 'SUPER_ADMIN' && (
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
            Configure University Workflow Steps
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Super Admin can re-order, append, or modify the steps required to process note sheets.
          </p>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {customSteps.map((step, idx) => (
              <React.Fragment key={idx}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'var(--bg-surface-hover)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
                  <span>{step}</span>
                  <button type="button" style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'red' }} onClick={() => {
                    const next = [...customSteps];
                    next.splice(idx, 1);
                    setCustomSteps(next);
                  }}>✕</button>
                </div>
                {idx < customSteps.length - 1 && <ArrowRight size={14} />}
              </React.Fragment>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem' }}>
            <select className="form-select" style={{ maxWidth: 200 }} value={newStep} onChange={e => setNewStep(e.target.value)}>
              <option value="HOD">HOD</option>
              <option value="HOI">HOI (Principal)</option>
              <option value="DEPUTY_REGISTRAR">Deputy Registrar</option>
              <option value="REGISTRAR">Registrar</option>
              <option value="VICE_PRESIDENT">Vice President</option>
            </select>
            <button className="btn btn-secondary btn-sm" onClick={() => setCustomSteps([...customSteps, newStep])}>
              + Add Step
            </button>
          </div>

          <button className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '1rem' }} onClick={saveWorkflowConfig}>
            Save Workflow Config
          </button>
        </div>
      )}

      {/* ─── MODAL: CREATE NOTE SHEET ─── */}
      {showCreateModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--brand-navy)' }}>Draft Note Sheet Proposal</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowCreateModal(false)}>✕</button>
            </div>
            <form onSubmit={e => handleCreateSubmit(e, false)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Institute</label>
                  <select className="form-select" value={formData.instituteId} onChange={e => setFormData({ ...formData, instituteId: e.target.value })}>
                    {institutes.map(inst => <option key={inst.id} value={inst.id}>{inst.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select className="form-select" value={formData.departmentId} onChange={e => setFormData({ ...formData, departmentId: e.target.value })}>
                    {departments.map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Creator Contact No.</label>
                  <input type="text" className="form-input" value={formData.contactNumber} onChange={e => setFormData({ ...formData, contactNumber: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Required Date</label>
                  <input type="date" className="form-input" value={formData.requiredDate} onChange={e => setFormData({ ...formData, requiredDate: e.target.value })} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Subject</label>
                <input type="text" className="form-input" placeholder="Enter Note Sheet Subject..." value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} required />
              </div>

              <div className="form-group">
                <label className="form-label">Proposal Details / Requirements</label>
                <textarea className="form-input" rows={4} placeholder="Type the detailed proposal requirements..." value={formData.proposal} onChange={e => setFormData({ ...formData, proposal: e.target.value })} required />
              </div>

              <div className="form-group">
                <label className="form-label">Justification / Purpose</label>
                <textarea className="form-input" rows={3} placeholder="Provide academic, structural or system justification..." value={formData.purposeJustification} onChange={e => setFormData({ ...formData, purposeJustification: e.target.value })} required />
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <input type="checkbox" checked={formData.budgetRequired} onChange={e => setFormData({ ...formData, budgetRequired: e.target.checked })} />
                  Requires Budget Approval
                </label>
              </div>

              {formData.budgetRequired && (
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Estimated Cost (INR)</label>
                    <input type="number" className="form-input" value={formData.estimatedCost} onChange={e => setFormData({ ...formData, estimatedCost: Number(e.target.value) })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Vendor Quotation Details</label>
                    <input type="text" className="form-input" placeholder="e.g. Quotation ref no. or vendor name" value={formData.vendorQuotation} onChange={e => setFormData({ ...formData, vendorQuotation: e.target.value })} />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={e => handleCreateSubmit(e, true)}>
                  Save as Draft
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Note Sheet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: ACTION DECISION ─── */}
      {showActionModal && selectedNote && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '540px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                Decision for Note Sheet {selectedNote.noteSheetNumber}
              </h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowActionModal(false)}>✕</button>
            </div>
            
            <div style={{ background: '#F8FAFC', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
              <strong>Subject:</strong> {selectedNote.subject}<br />
              <strong>Estimated Cost:</strong> ₹{selectedNote.estimatedCost.toLocaleString()}
            </div>

            <form onSubmit={handleActionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Action</label>
                <select className="form-select" value={actionType} onChange={e => setActionType(e.target.value as NoteSheetAction)}>
                  <option value="APPROVE">Approve &amp; Forward</option>
                  <option value="RETURN">Return for Correction</option>
                  <option value="REJECT">Reject Note Sheet</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Remarks</label>
                <textarea className="form-input" rows={3} placeholder="Provide approval notes or rejection/return reason..." value={actionRemarks} onChange={e => setActionRemarks(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Attachment Proof (Optional)</label>
                <input type="text" className="form-input" placeholder="Demo attachment URL or file name" value={actionFile} onChange={e => setActionFile(e.target.value)} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowActionModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Apply Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
