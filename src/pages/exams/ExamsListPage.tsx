import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { Exam, Program, AcademicYear, Semester } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Plus, Edit2, Trash2, Calendar as CalendarIcon, FileSignature } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ExamsListPage: React.FC = () => {
  const { role } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Partial<Exam>>({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setExams(db.getExams());
    setPrograms(db.getPrograms());
    setAcademicYears(db.getAcademicYears());
    setSemesters(db.getSemesters());
  };

  const handleOpenModal = (exam?: Exam) => {
    if (exam) {
      setFormData(exam);
      setIsEditing(true);
    } else {
      setFormData({
        status: 'DRAFT',
        type: 'Mid Semester',
        baseFee: 300,
        perSubjectFee: 100,
        lateFee: 200,
        formDeadline: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        lateFeeDeadline: new Date(Date.now() + 21 * 86400000).toISOString().split('T')[0],
        minAttendancePercentage: 75
      });
      setIsEditing(false);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({});
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && formData.id) {
      db.updateEntity('exams', formData.id, formData as Exam, 'Updated Exam Details');
    } else {
      db.addEntity('exams', formData as any, 'Created New Exam');
    }
    loadData();
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      db.deleteEntity('exams', id, 'Deleted Exam');
      loadData();
    }
  };

  const getProgramName = (id: string) => programs.find(p => p.id === id)?.name || id;
  const getAyName = (id: string) => academicYears.find(a => a.id === id)?.name || id;

  if (role !== 'SUPER_ADMIN' && role !== 'UNIVERSITY_ADMIN' && role !== 'PRINCIPAL') {
    return <div style={{ padding: '2rem' }}>Unauthorized Access</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
            Examination Master Directory
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Create and configure examination events, fee structures, deadlines, and attendance rules
          </p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-primary">
          <Plus size={16} /> Create New Exam
        </button>
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Exam Name &amp; Type</th>
                <th>Program / Academic Year</th>
                <th>Exam Window Dates</th>
                <th>Base Fee / Late Penalty</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {exams.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No exams registered in master.</td></tr>
              ) : (
                exams.map(exam => (
                  <tr key={exam.id}>
                    <td>
                      <div style={{ fontWeight: 800, color: 'var(--brand-navy)' }}>{exam.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{exam.type}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.84375rem', fontWeight: 600 }}>{getProgramName(exam.programId)}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{getAyName(exam.academicYearId)}</div>
                    </td>
                    <td style={{ fontSize: '0.84375rem' }}>
                      <CalendarIcon size={14} style={{ display: 'inline', marginRight: '4px' }} />
                      {exam.startDate} to {exam.endDate}
                    </td>
                    <td style={{ fontSize: '0.84375rem' }}>
                      <div>Base Fee: <strong>₹{exam.baseFee ?? 300}</strong></div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-danger)' }}>Late Fee: ₹{exam.lateFee ?? 200}</div>
                    </td>
                    <td>
                      <Badge variant={
                        exam.status === 'RESULTS_PUBLISHED' ? 'active' :
                        exam.status === 'SCHEDULED' ? 'navy' :
                        exam.status === 'ONGOING' ? 'orange' : 'inactive'
                      }>
                        {exam.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button onClick={() => handleOpenModal(exam)} className="btn btn-secondary btn-sm" title="Edit Exam">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(exam.id)} className="btn btn-danger btn-sm" title="Delete Exam">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '640px', padding: '1.75rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1.25rem' }}>
              {isEditing ? 'Edit Examination Master' : 'Create New Examination Event'}
            </h3>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Exam Name *</label>
                <input type="text" required className="form-input" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. B.Tech Sem-4 End Semester Exam 2024" />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Exam Type *</label>
                  <select required className="form-select" value={formData.type || ''} onChange={e => setFormData({...formData, type: e.target.value as any})}>
                    <option value="Mid Semester">Mid Semester</option>
                    <option value="End Semester">End Semester</option>
                    <option value="Practical">Practical</option>
                    <option value="Remedial">Remedial</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status *</label>
                  <select required className="form-select" value={formData.status || ''} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                    <option value="DRAFT">DRAFT</option>
                    <option value="SCHEDULED">SCHEDULED</option>
                    <option value="ONGOING">ONGOING</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="RESULTS_PUBLISHED">RESULTS_PUBLISHED</option>
                  </select>
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Academic Year *</label>
                  <select required className="form-select" value={formData.academicYearId || ''} onChange={e => setFormData({...formData, academicYearId: e.target.value})}>
                    <option value="">Select Academic Year</option>
                    {academicYears.map(ay => <option key={ay.id} value={ay.id}>{ay.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Target Program *</label>
                  <select required className="form-select" value={formData.programId || ''} onChange={e => setFormData({...formData, programId: e.target.value})}>
                    <option value="">Select Program</option>
                    {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Semester *</label>
                  <select required className="form-select" value={formData.semesterId || ''} onChange={e => setFormData({...formData, semesterId: e.target.value})}>
                    <option value="">Select Semester</option>
                    {semesters.filter(s => !formData.programId || s.programId === formData.programId).map(s => <option key={s.id} value={s.id}>{s.code}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Start Date *</label>
                  <input type="date" required className="form-input" value={formData.startDate || ''} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date *</label>
                  <input type="date" required className="form-input" value={formData.endDate || ''} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '0.75rem' }}>
                  Fee Rules &amp; Registration Deadlines
                </h4>
                <div className="grid-3">
                  <div className="form-group">
                    <label className="form-label">Base Fee (₹) *</label>
                    <input type="number" required min="0" className="form-input" value={formData.baseFee ?? 300} onChange={e => setFormData({...formData, baseFee: Number(e.target.value)})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Per Subject Fee (₹) *</label>
                    <input type="number" required min="0" className="form-input" value={formData.perSubjectFee ?? 100} onChange={e => setFormData({...formData, perSubjectFee: Number(e.target.value)})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Late Penalty Fee (₹) *</label>
                    <input type="number" required min="0" className="form-input" value={formData.lateFee ?? 200} onChange={e => setFormData({...formData, lateFee: Number(e.target.value)})} />
                  </div>
                </div>

                <div className="grid-3">
                  <div className="form-group">
                    <label className="form-label">Min Attendance (%) *</label>
                    <input type="number" required min="0" max="100" className="form-input" value={formData.minAttendancePercentage ?? 75} onChange={e => setFormData({...formData, minAttendancePercentage: Number(e.target.value)})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Regular Deadline *</label>
                    <input type="date" required className="form-input" value={formData.formDeadline || ''} onChange={e => setFormData({...formData, formDeadline: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Late Fee Deadline *</label>
                    <input type="date" required className="form-input" value={formData.lateFeeDeadline || ''} onChange={e => setFormData({...formData, lateFeeDeadline: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description / Instructions</label>
                <textarea className="form-input" rows={2} value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Exam Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
