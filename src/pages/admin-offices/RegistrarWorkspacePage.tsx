import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Badge } from '../../components/common/Badge';
import { 
  FileText, ShieldCheck, CheckCircle2, Clock, Plus, 
  Building2, Users, Download, Printer, Search, Send
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

export const RegistrarWorkspacePage: React.FC = () => {
  const { user } = useAuth();
  const [circulars, setCirculars] = useState<CircularNotice[]>(initialCirculars);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [refNo, setRefNo] = useState(`SSIU/REG/2024/0${circulars.length + 10}`);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CircularNotice['category']>('CIRCULAR');
  const [targetColleges, setTargetColleges] = useState('All Constituent Institutes');

  const institutes = db.getInstitutes();
  const departments = db.getDepartments();
  const faculty = db.getFaculty();

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const newCirc: CircularNotice = {
      id: `circ-${Date.now()}`,
      refNo,
      title,
      category,
      issuedDate: new Date().toISOString().split('T')[0],
      status: 'PUBLISHED',
      targetColleges
    };

    setCirculars([newCirc, ...circulars]);
    db.addNotification({
      title: `Official Circular: ${title}`,
      message: `Ref ${refNo}: Published by Registrar Office.`,
      module: 'NOTICE',
      timestamp: 'Just now',
      targetRole: 'ALL',
      linkTab: 'registrar'
    });

    setShowModal(false);
    setTitle('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
            Registrar Office &amp; University Secretariat
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Manage university circulars, statutory policies, institute approvals, and regulatory filings
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Issue Statutory Circular
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid-4">
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--brand-orange)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Constituent Institutes</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--brand-navy)', marginTop: '0.25rem' }}>{institutes.length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>6 Approved Colleges</div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--brand-navy)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Academic Depts</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--brand-navy)', marginTop: '0.25rem' }}>{departments.length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Across 6 Institutes</div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--brand-gold)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Appointed Faculty</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--brand-navy)', marginTop: '0.25rem' }}>{faculty.length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verified Staff Records</div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #10B981' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Statutory Notices</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10B981', marginTop: '0.25rem' }}>{circulars.length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Issued &amp; Gazetted</div>
        </div>
      </div>

      {/* Circulars Table */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '1rem' }}>
          Gazetted University Circulars &amp; Directives
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

      {/* Issue Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '550px', padding: '1.5rem', backgroundColor: '#FFF' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1rem' }}>
              Issue Statutory University Circular
            </h3>

            <form onSubmit={handleCreateNotice}>
              <div className="form-group">
                <label className="form-label">Reference Number *</label>
                <input type="text" className="form-input" value={refNo} onChange={e => setRefNo(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Circular Title &amp; Subject *</label>
                <input type="text" className="form-input" placeholder="e.g. Revised Examination Regulations 2024" value={title} onChange={e => setTitle(e.target.value)} required />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select className="form-select" value={category} onChange={e => setCategory(e.target.value as any)}>
                    <option value="POLICY">POLICY</option>
                    <option value="ACCREDITATION">ACCREDITATION</option>
                    <option value="APPOINTMENT">APPOINTMENT</option>
                    <option value="CIRCULAR">CIRCULAR</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Target Coverage *</label>
                  <input type="text" className="form-input" value={targetColleges} onChange={e => setTargetColleges(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Publish Circular</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
