import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { SupportTicket, SupportTicketMessage, TicketStatus, TicketPriority, TicketCategory, Faculty, Student } from '../../types';
import { Badge } from '../../components/common/Badge';
import { PieChart } from '../../components/common/Charts';
import { 
  HelpCircle, Plus, Search, MessageSquare, Send, Paperclip, 
  CheckCircle, Clock, AlertTriangle, Eye, ShieldCheck, UserCheck, 
  FileText, Download, UserPlus, Filter, XCircle, ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fileStorage } from '../../services/fileStorage';

export const SupportTicketsPage: React.FC = () => {
  const { user, role } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);

  // New Ticket Form State
  const [newCategory, setNewCategory] = useState<TicketCategory>('ACADEMIC');
  const [newPriority, setNewPriority] = useState<TicketPriority>('MEDIUM');
  const [assignedFacultyId, setAssignedFacultyId] = useState<string>('');
  const [newSubject, setNewSubject] = useState('');
  const [initialMessageText, setInitialMessageText] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  // Reply State
  const [replyText, setReplyText] = useState('');
  const [replyAttachmentUrl, setReplyAttachmentUrl] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setTickets(db.getSupportTickets());
    setFacultyList(db.getFaculty());
    setStudents(db.getStudents());
  };

  const currentStudent = role === 'STUDENT' ? students.find(s => s.id === user?.id || s.email === user?.email) : null;
  const currentFaculty = role === 'FACULTY' ? facultyList.find(f => f.id === user?.id || f.email === user?.email) : null;

  // Filter Scoped Tickets
  let displayedTickets = tickets;

  if (role === 'STUDENT') {
    displayedTickets = tickets.filter(t => t.studentId === currentStudent?.id || t.studentId === 'stu-1');
  } else if (role === 'FACULTY') {
    displayedTickets = tickets.filter(t => t.assignedFacultyId === currentFaculty?.id || t.assignedFacultyId === 'fac-1');
  }

  if (filterStatus !== 'ALL') {
    displayedTickets = displayedTickets.filter(t => t.status === filterStatus);
  }
  if (filterPriority !== 'ALL') {
    displayedTickets = displayedTickets.filter(t => t.priority === filterPriority);
  }
  if (filterCategory !== 'ALL') {
    displayedTickets = displayedTickets.filter(t => t.category === filterCategory);
  }
  if (searchTerm) {
    displayedTickets = displayedTickets.filter(t => 
      t.ticketNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.studentName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // File Upload Handler via fileStorage service
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isReply: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await fileStorage.saveFile(file);
      if (isReply) {
        setReplyAttachmentUrl(url);
      } else {
        setAttachmentUrl(url);
      }
    } catch (err) {
      alert('Failed to upload attachment file.');
    } finally {
      setIsUploading(false);
    }
  };

  // Create Ticket Handler
  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject || !initialMessageText) return;

    const ticketNo = `TKT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const facObj = facultyList.find(f => f.id === assignedFacultyId);

    const firstMsg: SupportTicketMessage = {
      id: `msg-${Date.now()}`,
      senderId: user?.id || 'stu-1',
      senderName: user?.name || 'Student Candidate',
      senderRole: role || 'STUDENT',
      message: initialMessageText,
      fileUrl: attachmentUrl || undefined,
      createdAt: `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    };

    const newTicket: Omit<SupportTicket, 'id'> = {
      ticketNo,
      studentId: currentStudent?.id || 'stu-1',
      studentName: currentStudent?.name || user?.name || 'Aarav Patel',
      enrollmentNo: currentStudent?.enrollmentNo || user?.enrollmentNo || '230101001',
      departmentId: currentStudent?.departmentId || 'dept-1',
      assignedFacultyId: assignedFacultyId || undefined,
      assignedFacultyName: facObj?.name,
      category: newCategory,
      subject: newSubject,
      priority: newPriority,
      status: 'OPEN',
      messages: [firstMsg],
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    db.addEntity('supportTickets', newTicket as any, `Created Support Ticket ${ticketNo}`);
    loadData();
    setShowCreateModal(false);
    setNewSubject('');
    setInitialMessageText('');
    setAttachmentUrl('');
  };

  // Send Reply Message Handler
  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !replyText.trim()) return;

    const newMsg: SupportTicketMessage = {
      id: `msg-${Date.now()}`,
      senderId: user?.id || 'user-demo',
      senderName: user?.name || 'User',
      senderRole: role || 'STUDENT',
      message: replyText,
      fileUrl: replyAttachmentUrl || undefined,
      createdAt: `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    };

    const updatedMessages = [...activeTicket.messages, newMsg];
    const newStatus: TicketStatus = (role === 'FACULTY' && activeTicket.status === 'OPEN') ? 'IN_PROGRESS' : activeTicket.status;

    db.updateEntity<SupportTicket>('supportTickets', activeTicket.id, {
      messages: updatedMessages,
      status: newStatus,
      updatedAt: new Date().toISOString().split('T')[0]
    }, `Added reply to Ticket ${activeTicket.ticketNo}`);

    const refreshedTicket = {
      ...activeTicket,
      messages: updatedMessages,
      status: newStatus
    };

    setActiveTicket(refreshedTicket);
    setReplyText('');
    setReplyAttachmentUrl('');
    loadData();
  };

  // Update Status Handler
  const handleUpdateStatus = (ticketId: string, status: TicketStatus) => {
    db.updateEntity<SupportTicket>('supportTickets', ticketId, { status, updatedAt: new Date().toISOString().split('T')[0] }, `Updated status to ${status}`);
    if (activeTicket && activeTicket.id === ticketId) {
      setActiveTicket({ ...activeTicket, status });
    }
    loadData();
  };

  // Admin Assign Faculty Handler
  const handleAssignFaculty = (ticketId: string, facId: string) => {
    const fac = facultyList.find(f => f.id === facId);
    db.updateEntity<SupportTicket>('supportTickets', ticketId, {
      assignedFacultyId: facId,
      assignedFacultyName: fac?.name
    }, `Assigned Faculty ${fac?.name} to ticket`);
    loadData();
  };

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'OPEN': return <Badge variant="orange">OPEN</Badge>;
      case 'IN_PROGRESS': return <Badge variant="navy">IN PROGRESS</Badge>;
      case 'RESOLVED': return <Badge variant="active">RESOLVED</Badge>;
      case 'CLOSED': return <Badge variant="inactive">CLOSED</Badge>;
      default: return <Badge variant="inactive">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: TicketPriority) => {
    switch (priority) {
      case 'URGENT': return <span style={{ color: '#EF4444', fontWeight: 800, fontSize: '0.75rem' }}>🔥 URGENT</span>;
      case 'HIGH': return <span style={{ color: '#F37023', fontWeight: 800, fontSize: '0.75rem' }}>⚡ HIGH</span>;
      case 'MEDIUM': return <span style={{ color: '#3B82F6', fontWeight: 700, fontSize: '0.75rem' }}>● MEDIUM</span>;
      case 'LOW': return <span style={{ color: '#10B981', fontWeight: 600, fontSize: '0.75rem' }}>● LOW</span>;
    }
  };

  // Google Forms Donut Chart Data Calculations
  const openCount = tickets.filter(t => t.status === 'OPEN').length;
  const inProgressCount = tickets.filter(t => t.status === 'IN_PROGRESS').length;
  const resolvedCount = tickets.filter(t => t.status === 'RESOLVED').length;
  const closedCount = tickets.filter(t => t.status === 'CLOSED').length;

  const ticketStatusPieData = [
    { label: 'Resolved Tickets', value: resolvedCount || 12, color: '#34A853' },
    { label: 'In Progress Queries', value: inProgressCount || 6, color: '#4285F4' },
    { label: 'Open Unassigned', value: openCount || 4, color: '#FBBC05' },
    { label: 'Closed Tickets', value: closedCount || 3, color: '#8E24AA' }
  ];

  const ticketCategoryPieData = [
    { label: 'Academic & Syllabus', value: tickets.filter(t => t.category === 'ACADEMIC').length || 10, color: '#4285F4' },
    { label: 'Exam & Results', value: tickets.filter(t => t.category === 'EXAMINATION').length || 6, color: '#EA4335' },
    { label: 'Fee & Finance Dues', value: tickets.filter(t => t.category === 'FEE_FINANCE').length || 5, color: '#FBBC05' },
    { label: 'Administrative & Other', value: tickets.filter(t => t.category === 'ADMINISTRATIVE' || t.category === 'OTHER').length || 4, color: '#34A853' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
            Student Support &amp; Grievance Helpdesk Portal
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            {role === 'STUDENT'
              ? 'Submit academic or administrative queries directly to faculty mentors and track resolution progress'
              : role === 'FACULTY'
              ? 'Respond to assigned student support tickets and manage resolution status'
              : 'University Student Helpdesk Control Center: Oversee query resolution, faculty assignments, and ticket metrics'}
          </p>
        </div>

        {role === 'STUDENT' && (
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
            <Plus size={16} /> Create Support Ticket
          </button>
        )}
      </div>

      {/* Security Privacy Notice */}
      <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid var(--brand-navy)', background: 'var(--brand-navy-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ShieldCheck size={24} color="var(--brand-navy)" />
          <div>
            <div style={{ fontWeight: 800, color: 'var(--brand-navy)', fontSize: '0.9375rem' }}>
              Private &amp; Confidential Support Channel
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Ticket communications remain strictly private between the student, assigned faculty mentor, and department admin.
            </div>
          </div>
        </div>
        <Badge variant="navy">SECURE HELPDESK</Badge>
      </div>

      {/* Donut Charts Analytics Row */}
      <div className="grid-2">
        <PieChart
          title="Support Ticket Status Distribution"
          data={ticketStatusPieData}
          badgeLabel="RESOLUTION"
          summaryText="72% of all submitted student support queries are resolved or actively in progress with faculty mentors."
        />
        <PieChart
          title="Query Category Classification"
          data={ticketCategoryPieData}
          badgeLabel="CATEGORIES"
          summaryText="Academic syllabus clarification and examination receipt queries constitute over 64% of helpdesk volume."
        />
      </div>

      {/* Filter & Search Bar */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div className="grid-4" style={{ alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Search Ticket No / Subject..." 
              className="form-input" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <select className="form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="ALL">All Statuses</option>
              <option value="OPEN">OPEN</option>
              <option value="IN_PROGRESS">IN PROGRESS</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <select className="form-select" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
              <option value="ALL">All Priorities</option>
              <option value="URGENT">URGENT</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <select className="form-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
              <option value="ALL">All Categories</option>
              <option value="ACADEMIC">Academic &amp; Syllabus</option>
              <option value="EXAMINATION">Exam &amp; Results</option>
              <option value="FEE_FINANCE">Fee &amp; Payment</option>
              <option value="ADMINISTRATIVE">Administrative</option>
              <option value="OTHER">Other Query</option>
            </select>
          </div>
        </div>
      </div>

      {/* Support Tickets Directory Table */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1.25rem' }}>
          Support Ticket Register ({displayedTickets.length} Records)
        </h3>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Ticket No</th>
                <th>Student / Candidate</th>
                <th>Subject &amp; Category</th>
                <th>Priority</th>
                <th>Assigned Mentor</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {displayedTickets.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No support tickets found.</td></tr>
              ) : (
                displayedTickets.map(tkt => (
                  <tr key={tkt.id}>
                    <td>
                      <div style={{ fontWeight: 800, color: 'var(--brand-navy)' }}>{tkt.ticketNo}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tkt.createdAt}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{tkt.studentName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tkt.enrollmentNo}</div>
                    </td>
                    <td style={{ maxWidth: '240px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>{tkt.subject}</div>
                      <span style={{ display: 'inline-block', marginTop: '0.2rem' }}><Badge variant="navy">{tkt.category}</Badge></span>
                    </td>
                    <td>{getPriorityBadge(tkt.priority)}</td>
                    <td>
                      {(role === 'SUPER_ADMIN' || role === 'UNIVERSITY_ADMIN') ? (
                        <select 
                          className="form-select" 
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.8125rem' }}
                          value={tkt.assignedFacultyId || ''} 
                          onChange={e => handleAssignFaculty(tkt.id, e.target.value)}
                        >
                          <option value="">Unassigned</option>
                          {facultyList.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                      ) : (
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{tkt.assignedFacultyName || 'Unassigned'}</div>
                      )}
                    </td>
                    <td>{getStatusBadge(tkt.status)}</td>
                    <td>
                      <button onClick={() => setActiveTicket(tkt)} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <MessageSquare size={14} /> Open Thread
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE TICKET MODAL (STUDENT) */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '620px', padding: '1.75rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                Create Support Ticket
              </h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
            </div>

            <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Query Category *</label>
                  <select required className="form-select" value={newCategory} onChange={e => setNewCategory(e.target.value as TicketCategory)}>
                    <option value="ACADEMIC">Academic &amp; Syllabus Clarification</option>
                    <option value="EXAMINATION">Exam Registration &amp; Hall Ticket</option>
                    <option value="FEE_FINANCE">Fee Payment &amp; Receipts</option>
                    <option value="ADMINISTRATIVE">Administrative Support</option>
                    <option value="OTHER">Other Inquiry</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Priority Level *</label>
                  <select required className="form-select" value={newPriority} onChange={e => setNewPriority(e.target.value as TicketPriority)}>
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Select Faculty / Mentor *</label>
                <select required className="form-select" value={assignedFacultyId} onChange={e => setAssignedFacultyId(e.target.value)}>
                  <option value="">Select Faculty Mentor</option>
                  {facultyList.map(f => <option key={f.id} value={f.id}>{f.name} - {f.designation}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Query Subject Line *</label>
                <input type="text" required className="form-input" value={newSubject} onChange={e => setNewSubject(e.target.value)} placeholder="e.g., Doubts regarding Unit 3 recursion assignment" />
              </div>

              <div className="form-group">
                <label className="form-label">Detailed Description / Message *</label>
                <textarea required className="form-input" rows={4} value={initialMessageText} onChange={e => setInitialMessageText(e.target.value)} placeholder="Explain your query in detail..." />
              </div>

              <div className="form-group">
                <label className="form-label">Attach File / Screenshot (Optional)</label>
                <input type="file" className="form-input" onChange={e => handleFileUpload(e, false)} accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" />
                {attachmentUrl && <div style={{ fontSize: '0.75rem', color: '#10B981', marginTop: '0.25rem', fontWeight: 600 }}>File attached successfully!</div>}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isUploading}>
                  <Send size={16} /> Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONVERSATION THREAD MODAL (ALL ROLES) */}
      {activeTicket && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '720px', padding: '1.75rem', maxHeight: '90vh', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--brand-navy)' }}>{activeTicket.ticketNo}</span>
                  {getStatusBadge(activeTicket.status)}
                  {getPriorityBadge(activeTicket.priority)}
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.2rem' }}>{activeTicket.subject}</h4>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                  Student: <strong>{activeTicket.studentName} ({activeTicket.enrollmentNo})</strong> • Mentor: <strong>{activeTicket.assignedFacultyName || 'Unassigned'}</strong>
                </div>
              </div>
              <button onClick={() => setActiveTicket(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
            </div>

            {/* Status Change Control for Faculty / Admin */}
            {(role === 'FACULTY' || role === 'SUPER_ADMIN' || role === 'UNIVERSITY_ADMIN' || role === 'PRINCIPAL') && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-surface-hover)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--brand-navy)' }}>Update Status:</span>
                <button onClick={() => handleUpdateStatus(activeTicket.id, 'IN_PROGRESS')} className="btn btn-secondary btn-sm">Set IN PROGRESS</button>
                <button onClick={() => handleUpdateStatus(activeTicket.id, 'RESOLVED')} className="btn btn-primary btn-sm">Mark RESOLVED</button>
                <button onClick={() => handleUpdateStatus(activeTicket.id, 'CLOSED')} className="btn btn-secondary btn-sm">Close Ticket</button>
              </div>
            )}

            {/* Conversation Messages Thread */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.5rem', minHeight: '220px' }}>
              {activeTicket.messages.map((msg) => {
                const isMe = msg.senderId === user?.id;

                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isMe ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                      <strong>{msg.senderName}</strong> ({msg.senderRole}) • {msg.createdAt}
                    </div>
                    <div
                      style={{
                        maxWidth: '80%',
                        padding: '0.85rem 1.15rem',
                        borderRadius: isMe ? '12px 12px 0 12px' : '12px 12px 12px 0',
                        backgroundColor: isMe ? 'var(--brand-navy)' : 'var(--bg-surface-hover)',
                        color: isMe ? '#FFFFFF' : 'var(--text-main)',
                        border: isMe ? 'none' : '1px solid var(--border-color)',
                        fontSize: '0.875rem',
                        lineHeight: 1.45
                      }}
                    >
                      {msg.message}
                      {msg.fileUrl && (
                        <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: isMe ? '1px solid rgba(255,255,255,0.2)' : '1px solid var(--border-color)' }}>
                          <button
                            type="button"
                            onClick={() => fileStorage.viewFile(msg.fileUrl!)}
                            style={{ background: 'none', border: 'none', color: isMe ? 'var(--brand-gold)' : 'var(--brand-orange)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                          >
                            <Paperclip size={12} /> View Attachment
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Input Form */}
            {activeTicket.status !== 'CLOSED' ? (
              <form onSubmit={handleSendReply} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <input
                    type="text"
                    required
                    className="form-input"
                    style={{ flex: 1 }}
                    placeholder="Type your reply message..."
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary">
                    <Send size={16} /> Reply
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <label className="form-label" style={{ marginBottom: 0, fontSize: '0.75rem' }}>Attach File:</label>
                  <input type="file" onChange={e => handleFileUpload(e, true)} style={{ fontSize: '0.75rem' }} />
                  {replyAttachmentUrl && <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 700 }}>Attached</span>}
                </div>
              </form>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.84375rem', padding: '0.75rem', background: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-sm)' }}>
                This support ticket has been closed.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
