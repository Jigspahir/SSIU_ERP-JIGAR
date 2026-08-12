import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Badge } from '../../components/common/Badge';
import { StatCard } from '../../components/common/StatCard';
import { InwardOutwardRecord, RegistrarFileMovement } from '../../types';
import { 
  FileText, ShieldCheck, CheckCircle2, Clock, Plus, 
  Building2, Users, Download, Printer, Search, Send, 
  FileCheck, ArrowUpRight, ArrowDownLeft, FileSpreadsheet,
  AlertTriangle, History, CheckSquare, Layers, Lock
} from 'lucide-react';

interface CircularNotice {
  id: string;
  refNo: string;
  title: string;
  category: 'POLICY' | 'ACCREDITATION' | 'APPOINTMENT' | 'CIRCULAR';
  issuedDate: string;
  status: 'PUBLISHED' | 'DRAFT';
  targetColleges: string;
}

interface StatutoryApproval {
  id: string;
  requestNo: string;
  title: string;
  applicantEntity: string;
  submittedDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  category: 'AFFILIATION' | 'PROGRAM_SANCTION' | 'FACULTY_APPOINTMENT' | 'INFRASTRUCTURE';
}

const initialCirculars: CircularNotice[] = [
  {
    id: 'circ-1',
    refNo: 'SSIU/REG/2024/014',
    title: 'University Academic Regulations & Attendance Minimum Eligibility Policy',
    category: 'POLICY',
    issuedDate: '2024-01-15',
    status: 'PUBLISHED',
    targetColleges: 'All Constituent Institutes (SSCIT, SSD, SSB, SIHSP, SISA, SSAP)'
  },
  {
    id: 'circ-2',
    refNo: 'SSIU/REG/2024/022',
    title: 'UGC & AICTE Faculty Recruitment & Designation Compliance Guidelines',
    category: 'APPOINTMENT',
    issuedDate: '2024-02-01',
    status: 'PUBLISHED',
    targetColleges: 'All Institutes'
  },
  {
    id: 'circ-3',
    refNo: 'SSIU/REG/2024/035',
    title: 'Annual Academic Audit & Accreditation Statutory Filings',
    category: 'ACCREDITATION',
    issuedDate: '2024-03-05',
    status: 'PUBLISHED',
    targetColleges: 'All Departments'
  }
];

const initialApprovals: StatutoryApproval[] = [
  {
    id: 'appr-1',
    requestNo: 'SSIU/SANCTION/2024/01',
    title: 'Annual Institutional Affiliation Renewal 2024-25',
    applicantEntity: 'Swarrnim Institute of Health Sciences & Pharmacy',
    submittedDate: '2024-02-20',
    status: 'APPROVED',
    category: 'AFFILIATION'
  },
  {
    id: 'appr-2',
    requestNo: 'SSIU/SANCTION/2024/02',
    title: 'Intake Capacity Expansion for B.Tech AI & DS (60 to 120 Seats)',
    applicantEntity: 'Swarrnim School of Computer & IT',
    submittedDate: '2024-03-01',
    status: 'PENDING',
    category: 'PROGRAM_SANCTION'
  },
  {
    id: 'appr-3',
    requestNo: 'SSIU/SANCTION/2024/03',
    title: 'Ratification of Associate Professor Appointments in CSE Department',
    applicantEntity: 'Department of Computer Science & Engineering',
    submittedDate: '2024-03-06',
    status: 'PENDING',
    category: 'FACULTY_APPOINTMENT'
  }
];

interface OfficeTask {
  id: string;
  title: string;
  assignedTo: string;
  dueDate: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'COMPLETED';
}

const initialTasks: OfficeTask[] = [
  { id: 'task-1', title: 'Compile UGC Annual Compliance Report 2023-24', assignedTo: 'Deputy Registrar (Academic)', dueDate: '2024-03-25', priority: 'HIGH', status: 'PENDING' },
  { id: 'task-2', title: 'Verify Affiliation Filings for Pharmacy Council Inspection', assignedTo: 'Assistant Registrar (Affiliations)', dueDate: '2024-03-20', priority: 'HIGH', status: 'PENDING' },
  { id: 'task-3', title: 'Issue Standing Committee Minutes of Meeting', assignedTo: 'Section Officer (Secretariat)', dueDate: '2024-03-15', priority: 'MEDIUM', status: 'COMPLETED' }
];

export const RegistrarWorkspacePage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'DISPATCH' | 'CIRCULARS' | 'APPROVALS' | 'FILES' | 'TASKS' | 'AUDIT'>('DISPATCH');

  // Master Lists
  const [circulars, setCirculars] = useState<CircularNotice[]>(initialCirculars);
  const [approvals, setApprovals] = useState<StatutoryApproval[]>(initialApprovals);
  const [tasks, setTasks] = useState<OfficeTask[]>(initialTasks);
  const [dispatches, setDispatches] = useState<InwardOutwardRecord[]>(() => db.getInwardOutwardRecords());
  const [fileMovements, setFileMovements] = useState<RegistrarFileMovement[]>(() => db.getRegistrarFileMovements());

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [dispatchTypeFilter, setDispatchTypeFilter] = useState<'ALL' | 'INWARD' | 'OUTWARD'>('ALL');

  // Modals
  const [showCircularModal, setShowCircularModal] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  // Form States: Circular
  const [circRefNo, setCircRefNo] = useState(`SSIU/REG/2024/0${circulars.length + 10}`);
  const [circTitle, setCircTitle] = useState('');
  const [circCategory, setCircCategory] = useState<CircularNotice['category']>('CIRCULAR');
  const [circTargetColleges, setCircTargetColleges] = useState('All Constituent Institutes');

  // Form States: Dispatch
  const [dispType, setDispType] = useState<'INWARD' | 'OUTWARD'>('INWARD');
  const [dispNo, setDispNo] = useState(`INW/2024/0${dispatches.length + 100}`);
  const [dispParty, setDispParty] = useState('');
  const [dispSubject, setDispSubject] = useState('');
  const [dispCategory, setDispCategory] = useState<InwardOutwardRecord['category']>('GENERAL');
  const [dispMode, setDispMode] = useState<InwardOutwardRecord['mode']>('SPEED_POST');
  const [dispTrackingNo, setDispTrackingNo] = useState('');
  const [dispSection, setDispSection] = useState('Academic Affairs Section');

  // Form States: File Movement
  const [fileNo, setFileNo] = useState(`SSIU/FILE/2024/ACAD-0${fileMovements.length + 1}`);
  const [fileTitle, setFileTitle] = useState('');
  const [fileSection, setFileSection] = useState('Registrar Office');
  const [fileCustodian, setFileCustodian] = useState('Academic Council');
  const [filePriority, setFilePriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');

  // Form States: Task
  const [taskTitle, setTaskTitle] = useState('');
  const [taskAssignedTo, setTaskAssignedTo] = useState('Deputy Registrar');
  const [taskDueDate, setTaskDueDate] = useState('2024-03-30');
  const [taskPriority, setTaskPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');

  const institutes = db.getInstitutes();
  const departments = db.getDepartments();
  const faculty = db.getFaculty();
  const auditLogs = db.getAuditLogs();

  // Handlers
  const handleCreateCircular = (e: React.FormEvent) => {
    e.preventDefault();
    if (!circTitle) return;

    const newCirc: CircularNotice = {
      id: `circ-${Date.now()}`,
      refNo: circRefNo,
      title: circTitle,
      category: circCategory,
      issuedDate: new Date().toISOString().split('T')[0],
      status: 'PUBLISHED',
      targetColleges: circTargetColleges
    };

    setCirculars([newCirc, ...circulars]);
    db.addNotification({
      title: `Official Circular: ${circTitle}`,
      message: `Ref ${circRefNo}: Published by Registrar Office.`,
      module: 'NOTICE',
      timestamp: 'Just now',
      targetRole: 'ALL',
      linkTab: 'registrar'
    });

    db.logAudit('CREATE', 'Registrar Circulars', `Issued gazetted circular ${circRefNo}: ${circTitle}`);
    setShowCircularModal(false);
    setCircTitle('');
  };

  const handleCreateDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispParty || !dispSubject) return;

    const newRecord: Omit<InwardOutwardRecord, 'id'> = {
      type: dispType,
      dispatchNo: dispNo,
      senderOrRecipient: dispParty,
      subject: dispSubject,
      category: dispCategory,
      mode: dispMode,
      trackingNo: dispTrackingNo || `SP${Math.floor(100000000 + Math.random() * 900000000)}IN`,
      assignedSection: dispSection,
      receivedOrDispatchedDate: new Date().toISOString().split('T')[0],
      status: 'PROCESSING',
      remarks: 'Logged in Registrar Dispatch Register'
    };

    const saved = db.addEntity<InwardOutwardRecord>('inwardOutwardRecords', newRecord, `Logged ${dispType} correspondence ${dispNo}`);
    setDispatches([saved, ...dispatches]);
    setShowDispatchModal(false);
    setDispParty('');
    setDispSubject('');
  };

  const handleCreateFileMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileTitle) return;

    const newFM: Omit<RegistrarFileMovement, 'id'> = {
      fileNo,
      fileTitle,
      initiatingSection: fileSection,
      currentCustodian: fileCustodian,
      movementDate: new Date().toISOString().split('T')[0],
      priority: filePriority,
      status: 'IN_MOVEMENT',
      remarks: 'Digital file note tracking initiated'
    };

    const saved = db.addEntity<RegistrarFileMovement>('registrarFileMovements', newFM, `Initiated file movement ${fileNo}`);
    setFileMovements([saved, ...fileMovements]);
    setShowFileModal(false);
    setFileTitle('');
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle) return;

    const newTask: OfficeTask = {
      id: `task-${Date.now()}`,
      title: taskTitle,
      assignedTo: taskAssignedTo,
      dueDate: taskDueDate,
      priority: taskPriority,
      status: 'PENDING'
    };

    setTasks([newTask, ...tasks]);
    setShowTaskModal(false);
    setTaskTitle('');
  };

  const handleApproveSanction = (id: string, status: 'APPROVED' | 'REJECTED') => {
    setApprovals(approvals.map(a => a.id === id ? { ...a, status } : a));
    db.logAudit('UPDATE', 'Statutory Approvals', `Registrar ${status} sanction request ${id}`);
  };

  const handleToggleTaskStatus = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: t.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED' } : t));
  };

  // Export Data to CSV
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];

    if (activeTab === 'DISPATCH') {
      headers = ['Type', 'Dispatch No', 'Sender/Recipient', 'Subject', 'Category', 'Mode', 'Tracking No', 'Date', 'Status'];
      rows = dispatches.map(d => [d.type, d.dispatchNo, d.senderOrRecipient, d.subject, d.category, d.mode, d.trackingNo || '-', d.receivedOrDispatchedDate, d.status]);
    } else if (activeTab === 'CIRCULARS') {
      headers = ['Reference No', 'Circular Title', 'Category', 'Target Colleges', 'Issue Date', 'Status'];
      rows = circulars.map(c => [c.refNo, c.title, c.category, c.targetColleges, c.issuedDate, c.status]);
    } else {
      headers = ['File No', 'File Title', 'Initiating Section', 'Current Custodian', 'Movement Date', 'Priority', 'Status'];
      rows = fileMovements.map(f => [f.fileNo, f.fileTitle, f.initiatingSection, f.currentCustodian, f.movementDate, f.priority, f.status]);
    }

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.map(cell => `"${cell}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `registrar-${activeTab.toLowerCase()}-register.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredDispatches = dispatches.filter(d => {
    const matchesType = dispatchTypeFilter === 'ALL' || d.type === dispatchTypeFilter;
    const matchesSearch = d.dispatchNo.toLowerCase().includes(searchTerm.toLowerCase()) || d.senderOrRecipient.toLowerCase().includes(searchTerm.toLowerCase()) || d.subject.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
            Registrar Office &amp; University Secretariat
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Authorized university-wide administration, official correspondence dispatches, statutory circulars, policy sanctions, and file tracking
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => window.print()}>
            <Printer size={16} /> Print Gazette
          </button>
          <button className="btn btn-secondary" onClick={handleExportCSV}>
            <FileSpreadsheet size={16} /> Export CSV
          </button>
          <button className="btn btn-primary" onClick={() => setShowCircularModal(true)}>
            <Plus size={16} /> Issue Circular
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid-4">
        <StatCard title="Constituent Institutes" value={`${institutes.length} Colleges`} icon={Building2} subtitle="6 Approved Colleges" />
        <StatCard title="Inward / Outward Logs" value={`${dispatches.length} Records`} icon={FileText} subtitle="Active Mail Register" />
        <StatCard title="Statutory Approvals" value={`${approvals.filter(a => a.status === 'PENDING').length} Pending`} icon={ShieldCheck} subtitle="Sanctions Queue" />
        <StatCard title="University Audit Log" value={`${auditLogs.length} Events`} icon={History} subtitle="Complete System Trail" />
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="card" style={{ padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
        <button
          onClick={() => setActiveTab('DISPATCH')}
          className={`btn ${activeTab === 'DISPATCH' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.8125rem' }}
        >
          <FileText size={15} /> Inward &amp; Outward Register ({dispatches.length})
        </button>
        <button
          onClick={() => setActiveTab('CIRCULARS')}
          className={`btn ${activeTab === 'CIRCULARS' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.8125rem' }}
        >
          <FileCheck size={15} /> Statutory Circulars ({circulars.length})
        </button>
        <button
          onClick={() => setActiveTab('APPROVALS')}
          className={`btn ${activeTab === 'APPROVALS' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.8125rem' }}
        >
          <ShieldCheck size={15} /> Statutory Approvals ({approvals.length})
        </button>
        <button
          onClick={() => setActiveTab('FILES')}
          className={`btn ${activeTab === 'FILES' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.8125rem' }}
        >
          <Layers size={15} /> File Movement Tracking ({fileMovements.length})
        </button>
        <button
          onClick={() => setActiveTab('TASKS')}
          className={`btn ${activeTab === 'TASKS' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.8125rem' }}
        >
          <CheckSquare size={15} /> Office Tasks ({tasks.length})
        </button>
        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`btn ${activeTab === 'AUDIT' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.8125rem' }}
        >
          <History size={15} /> University Audit Log
        </button>
      </div>

      {/* TAB 1: INWARD & OUTWARD CORRESPONDENCE REGISTER */}
      {activeTab === 'DISPATCH' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--brand-navy)' }}>
                Official Inward &amp; Outward Correspondence Register
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Digital dispatch ledger for UGC/AICTE directives, government letters, and official university dispatches
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <select className="form-select" style={{ width: '140px' }} value={dispatchTypeFilter} onChange={e => setDispatchTypeFilter(e.target.value as any)}>
                <option value="ALL">All Types</option>
                <option value="INWARD">INWARD</option>
                <option value="OUTWARD">OUTWARD</option>
              </select>

              <input
                type="text"
                className="form-input"
                style={{ width: '220px' }}
                placeholder="Search dispatch no, subject..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />

              <button className="btn btn-primary" onClick={() => setShowDispatchModal(true)}>
                <Plus size={16} /> Log Correspondence
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Dispatch No</th>
                  <th>Sender / Recipient Party</th>
                  <th>Subject &amp; Correspondence</th>
                  <th>Category</th>
                  <th>Mode &amp; Tracking</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredDispatches.map(d => (
                  <tr key={d.id}>
                    <td>
                      <Badge variant={d.type === 'INWARD' ? 'orange' : 'navy'}>
                        {d.type === 'INWARD' ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />} {d.type}
                      </Badge>
                    </td>
                    <td><strong>{d.dispatchNo}</strong></td>
                    <td>{d.senderOrRecipient}</td>
                    <td>{d.subject}</td>
                    <td><Badge variant="navy">{d.category}</Badge></td>
                    <td>
                      <div>{d.mode}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.trackingNo || 'No tracking'}</div>
                    </td>
                    <td>{d.receivedOrDispatchedDate}</td>
                    <td>
                      <Badge variant={d.status === 'DISPOSED' ? 'active' : d.status === 'PROCESSING' ? 'warning' : 'danger'}>
                        {d.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: STATUTORY CIRCULARS */}
      {activeTab === 'CIRCULARS' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '1rem' }}>
            Gazetted University Circulars &amp; Statutory Directives
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Reference No</th>
                  <th>Title &amp; Directive</th>
                  <th>Category</th>
                  <th>Target Coverage</th>
                  <th>Issue Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {circulars.map(c => (
                  <tr key={c.id}>
                    <td><strong>{c.refNo}</strong></td>
                    <td>{c.title}</td>
                    <td><Badge variant="navy">{c.category}</Badge></td>
                    <td>{c.targetColleges}</td>
                    <td>{c.issuedDate}</td>
                    <td><Badge variant="active">{c.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: STATUTORY APPROVALS */}
      {activeTab === 'APPROVALS' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '1rem' }}>
            Statutory Sanctions &amp; Affiliation Approvals Queue
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Request No</th>
                  <th>Sanction Subject</th>
                  <th>Applicant College / Department</th>
                  <th>Category</th>
                  <th>Submitted Date</th>
                  <th>Approval Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {approvals.map(a => (
                  <tr key={a.id}>
                    <td><strong>{a.requestNo}</strong></td>
                    <td>{a.title}</td>
                    <td>{a.applicantEntity}</td>
                    <td><Badge variant="navy">{a.category}</Badge></td>
                    <td>{a.submittedDate}</td>
                    <td>
                      <Badge variant={a.status === 'APPROVED' ? 'active' : a.status === 'REJECTED' ? 'danger' : 'warning'}>
                        {a.status}
                      </Badge>
                    </td>
                    <td>
                      {a.status === 'PENDING' && (
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          <button className="btn btn-sm btn-primary" onClick={() => handleApproveSanction(a.id, 'APPROVED')}>Approve</button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleApproveSanction(a.id, 'REJECTED')}>Reject</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: FILE MOVEMENT TRACKING */}
      {activeTab === 'FILES' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--brand-navy)' }}>
              Digital File Movement &amp; Custody Tracking
            </h3>

            <button className="btn btn-primary" onClick={() => setShowFileModal(true)}>
              <Plus size={16} /> Initiate File Note
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>File Number</th>
                  <th>File Title</th>
                  <th>Initiating Section</th>
                  <th>Current Custodian</th>
                  <th>Movement Date</th>
                  <th>Priority</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {fileMovements.map(f => (
                  <tr key={f.id}>
                    <td><strong>{f.fileNo}</strong></td>
                    <td>{f.fileTitle}</td>
                    <td>{f.initiatingSection}</td>
                    <td><Badge variant="orange">{f.currentCustodian}</Badge></td>
                    <td>{f.movementDate}</td>
                    <td><Badge variant={f.priority === 'HIGH' ? 'danger' : 'warning'}>{f.priority}</Badge></td>
                    <td><Badge variant="active">{f.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: OFFICE TASKS & REMINDERS */}
      {activeTab === 'TASKS' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--brand-navy)' }}>
              Registrar Secretariat Tasks &amp; Reminders
            </h3>

            <button className="btn btn-primary" onClick={() => setShowTaskModal(true)}>
              <Plus size={16} /> Add Task
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Task Title</th>
                  <th>Assigned Officer</th>
                  <th>Due Date</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(t => (
                  <tr key={t.id}>
                    <td><strong>{t.title}</strong></td>
                    <td>{t.assignedTo}</td>
                    <td>{t.dueDate}</td>
                    <td><Badge variant={t.priority === 'HIGH' ? 'danger' : 'warning'}>{t.priority}</Badge></td>
                    <td>
                      <Badge variant={t.status === 'COMPLETED' ? 'active' : 'warning'}>{t.status}</Badge>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-secondary" onClick={() => handleToggleTaskStatus(t.id)}>
                        {t.status === 'COMPLETED' ? 'Reopen' : 'Mark Complete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: UNIVERSITY AUDIT HISTORY LOG */}
      {activeTab === 'AUDIT' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '1rem' }}>
            University System Audit Trail &amp; Activity Log
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User &amp; Role</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Audit Trail Details</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.slice(0, 15).map(log => (
                  <tr key={log.id}>
                    <td><span style={{ fontSize: '0.78125rem', color: 'var(--text-muted)' }}>{new Date(log.timestamp).toLocaleString()}</span></td>
                    <td><strong>{log.userName}</strong> ({log.userRole})</td>
                    <td><Badge variant="navy">{log.action}</Badge></td>
                    <td>{log.entity}</td>
                    <td>{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Issue Circular */}
      {showCircularModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '550px', padding: '1.5rem', backgroundColor: '#FFF' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1rem' }}>
              Issue Statutory University Circular
            </h3>

            <form onSubmit={handleCreateCircular}>
              <div className="form-group">
                <label className="form-label">Reference Number *</label>
                <input type="text" className="form-input" value={circRefNo} onChange={e => setCircRefNo(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Circular Title &amp; Subject *</label>
                <input type="text" className="form-input" placeholder="e.g. Revised Examination Regulations 2024" value={circTitle} onChange={e => setCircTitle(e.target.value)} required />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select className="form-select" value={circCategory} onChange={e => setCircCategory(e.target.value as any)}>
                    <option value="POLICY">POLICY</option>
                    <option value="ACCREDITATION">ACCREDITATION</option>
                    <option value="APPOINTMENT">APPOINTMENT</option>
                    <option value="CIRCULAR">CIRCULAR</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Target Coverage *</label>
                  <input type="text" className="form-input" value={circTargetColleges} onChange={e => setCircTargetColleges(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCircularModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Publish Circular</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Log Correspondence */}
      {showDispatchModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '550px', padding: '1.5rem', backgroundColor: '#FFF' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1rem' }}>
              Log Inward / Outward Correspondence
            </h3>

            <form onSubmit={handleCreateDispatch}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Register Type *</label>
                  <select className="form-select" value={dispType} onChange={e => {
                    const nextType = e.target.value as 'INWARD' | 'OUTWARD';
                    setDispType(nextType);
                    setDispNo(`${nextType === 'INWARD' ? 'INW' : 'OUT'}/2024/0${dispatches.length + 100}`);
                  }}>
                    <option value="INWARD">INWARD</option>
                    <option value="OUTWARD">OUTWARD</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Dispatch Number *</label>
                  <input type="text" className="form-input" value={dispNo} onChange={e => setDispNo(e.target.value)} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{dispType === 'INWARD' ? 'Sender Organization / Party *' : 'Recipient Organization / Party *'}</label>
                <input type="text" className="form-input" placeholder="e.g. University Grants Commission (UGC)" value={dispParty} onChange={e => setDispParty(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Subject &amp; Correspondence Content *</label>
                <input type="text" className="form-input" placeholder="Subject of incoming/outgoing letter" value={dispSubject} onChange={e => setDispSubject(e.target.value)} required />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={dispCategory} onChange={e => setDispCategory(e.target.value as any)}>
                    <option value="GOVT_DIRECTIVE">GOVT_DIRECTIVE</option>
                    <option value="UGC_AICTE">UGC_AICTE</option>
                    <option value="AFFILIATION">AFFILIATION</option>
                    <option value="LEGAL">LEGAL</option>
                    <option value="GENERAL">GENERAL</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Dispatch Mode</label>
                  <select className="form-select" value={dispMode} onChange={e => setDispMode(e.target.value as any)}>
                    <option value="SPEED_POST">SPEED_POST</option>
                    <option value="REGISTERED_POST">REGISTERED_POST</option>
                    <option value="EMAIL">EMAIL</option>
                    <option value="HAND_DELIVERY">HAND_DELIVERY</option>
                    <option value="COURIER">COURIER</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Tracking / Reference Number</label>
                <input type="text" className="form-input" placeholder="e.g. SP984210452IN" value={dispTrackingNo} onChange={e => setDispTrackingNo(e.target.value)} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowDispatchModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Correspondence</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: File Movement */}
      {showFileModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '550px', padding: '1.5rem', backgroundColor: '#FFF' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1rem' }}>
              Initiate Digital File Note Tracking
            </h3>

            <form onSubmit={handleCreateFileMovement}>
              <div className="form-group">
                <label className="form-label">File Number *</label>
                <input type="text" className="form-input" value={fileNo} onChange={e => setFileNo(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">File Title &amp; Subject *</label>
                <input type="text" className="form-input" placeholder="e.g. Proposal for New Program Sanction" value={fileTitle} onChange={e => setFileTitle(e.target.value)} required />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Initiating Section</label>
                  <input type="text" className="form-input" value={fileSection} onChange={e => setFileSection(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Current Custodian Section</label>
                  <input type="text" className="form-input" value={fileCustodian} onChange={e => setFileCustodian(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowFileModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Track File</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Office Task */}
      {showTaskModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '550px', padding: '1.5rem', backgroundColor: '#FFF' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1rem' }}>
              Add Registrar Office Task
            </h3>

            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label className="form-label">Task Title *</label>
                <input type="text" className="form-input" placeholder="e.g. Verify Affiliation Filings" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} required />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Assigned Officer</label>
                  <input type="text" className="form-input" value={taskAssignedTo} onChange={e => setTaskAssignedTo(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input type="date" className="form-input" value={taskDueDate} onChange={e => setTaskDueDate(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
