import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Badge } from '../../components/common/Badge';
import { Assignment, AssignmentSubmission } from '../../types';
import { FileCheck, Calendar, Clock, Plus, Upload, CheckCircle2, Award, FileText, Download, Eye, Trash2 } from 'lucide-react';
import { fileStorage } from '../../services/fileStorage';

export const AssignmentsPage: React.FC = () => {
  const { user, role } = useAuth();

  const subjects = db.getSubjects();
  const divisions = db.getDivisions();
  const assignments = db.getAssignments();
  const submissions = db.getAssignmentSubmissions();

  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);

  // Form State for Faculty Assignment Creator
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [divisionId, setDivisionId] = useState(divisions[0]?.id || '');
  const [unitNo, setUnitNo] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('2024-11-15');
  const [totalMarks, setTotalMarks] = useState(20);
  const [assignmentFile, setAssignmentFile] = useState<File | null>(null);

  // Submission Form State for Student
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  
  const [isUploading, setIsUploading] = useState(false);

  // Grading Form State for Faculty
  const [selectedSubmission, setSelectedSubmission] = useState<AssignmentSubmission | null>(null);
  const [obtainedMarks, setObtainedMarks] = useState(18);
  const [feedback, setFeedback] = useState('Good work!');

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      let attachmentUrl = '';
      if (assignmentFile) {
        attachmentUrl = await fileStorage.saveFile(assignmentFile);
      }
      
      const newAsg: Omit<Assignment, 'id'> = {
        subjectId,
        divisionId,
        unitNo: Number(unitNo),
        title,
        description,
        deadline,
        totalMarks: Number(totalMarks),
        attachmentUrl,
        createdByFacultyId: user?.id || 'fac-1',
        createdByFacultyName: user?.name || 'Prof. Demo Faculty',
        createdDate: new Date().toISOString().split('T')[0],
        status: 'ACTIVE'
      };

      db.addEntity<Assignment>('assignments', newAsg, `Created assignment: ${title}`);
      setIsCreateModalOpen(false);
      setTitle('');
      setDescription('');
      setAssignmentFile(null);
    } catch (err) {
      console.error(err);
      alert('Failed to save assignment file.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment || !submissionFile) {
      alert('Please select a file to submit.');
      return;
    }
    
    setIsUploading(true);
    try {
      const fileUrl = await fileStorage.saveFile(submissionFile);

      const newSubm: Omit<AssignmentSubmission, 'id'> = {
        assignmentId: selectedAssignment.id,
        studentId: user?.id || 'stu-1',
        studentName: user?.name || 'Demo Student',
        enrollmentNo: user?.enrollmentNo || '230101001',
        submittedDate: new Date().toISOString().split('T')[0],
        fileUrl,
        notes: submissionNotes,
        status: 'SUBMITTED'
      };

      db.addEntity<AssignmentSubmission>('assignmentSubmissions', newSubm, `Submitted assignment ${selectedAssignment.title}`);
      setIsSubmitModalOpen(false);
      setSubmissionNotes('');
      setSubmissionFile(null);
    } catch(err) {
      console.error(err);
      alert('Failed to upload submission.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (window.confirm('Delete this assignment?')) {
      const asg = assignments.find(a => a.id === id);
      if (asg?.attachmentUrl?.startsWith('idb://')) {
        await fileStorage.deleteFile(asg.attachmentUrl);
      }
      db.deleteEntity('assignments', id, 'Deleted assignment');
    }
  };

  const handleGradeSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    db.updateEntity<AssignmentSubmission>('assignmentSubmissions', selectedSubmission.id, {
      status: 'GRADED',
      obtainedMarks: Number(obtainedMarks),
      feedback
    }, `Graded assignment submission for ${selectedSubmission.studentName}`);

    setIsGradingModalOpen(false);
    setSelectedSubmission(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
            Academic Assignments &amp; Submissions
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            {role === 'STUDENT' ? 'View active coursework assignments, upload submissions & view grades' : role === 'FACULTY' ? 'Create coursework assignments, review student submissions & give marks' : 'Monitor student coursework submission activity across departments'}
          </p>
        </div>

        {role !== 'STUDENT' && (
          <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={16} /> Create Assignment
          </button>
        )}
      </div>

      {/* Assignments Cards Grid */}
      <div className="grid-2">
        {assignments.map(asg => {
          const subj = db.getSubjectById(asg.subjectId);
          const studentSubm = submissions.find(s => s.assignmentId === asg.id && (s.studentId === user?.id || role !== 'STUDENT'));
          const totalSubms = submissions.filter(s => s.assignmentId === asg.id).length;

          return (
            <div key={asg.id} className="card card-hover" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: '4px solid var(--brand-orange)' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <Badge variant="orange">Unit {asg.unitNo}</Badge>
                  <div style={{ fontWeight: 800, fontSize: '0.8125rem', color: 'var(--brand-navy)' }}>
                    Max Marks: <span style={{ color: 'var(--brand-orange)', fontSize: '1rem' }}>{asg.totalMarks}</span>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '0.35rem' }}>
                  {asg.title}
                </h3>

                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--brand-orange)', marginBottom: '0.5rem' }}>
                  {subj?.name} ({subj?.code})
                </div>

                <p style={{ fontSize: '0.84375rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1rem' }}>
                  {asg.description}
                </p>
                {asg.attachmentUrl && (
                  <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => fileStorage.viewFile(asg.attachmentUrl!)} title="View Attachment">
                      <Eye size={14} /> View Document
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={() => fileStorage.downloadFile(asg.attachmentUrl!, asg.title)} title="Download Attachment">
                      <Download size={14} /> Download
                    </button>
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78125rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Calendar size={14} color="var(--brand-orange)" /> Deadline: <strong style={{ color: 'var(--brand-navy)' }}>{asg.deadline}</strong>
                  </span>
                  <span>Faculty: <strong>{asg.createdByFacultyName}</strong></span>
                </div>

                {/* Role Specific Actions */}
                {role === 'STUDENT' ? (
                  studentSubm ? (
                    <div style={{ padding: '0.65rem', borderRadius: 'var(--radius-sm)', background: '#ECFDF5', border: '1px solid #A7F3D0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#065F46', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <CheckCircle2 size={16} /> Submitted ({studentSubm.status})
                      </div>
                      {studentSubm.obtainedMarks !== undefined && (
                        <div style={{ fontSize: '0.875rem', fontWeight: 900, color: 'var(--brand-navy)' }}>
                          Score: <span style={{ color: 'var(--brand-orange)' }}>{studentSubm.obtainedMarks} / {asg.totalMarks}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => { setSelectedAssignment(asg); setIsSubmitModalOpen(true); }}>
                      <Upload size={16} /> Upload Submission
                    </button>
                  )
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--brand-navy)' }}>
                      Submissions: {totalSubms} Received
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteAssignment(asg.id)} title="Delete Assignment">
                        <Trash2 size={14} />
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => { setSelectedAssignment(asg); setIsGradingModalOpen(true); }}>
                        Review
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Assignment Modal */}
      {isCreateModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '520px', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1.25rem' }}>
              Create New Assignment
            </h3>

            <form onSubmit={handleCreateAssignment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Subject *</label>
                <select className="form-select" value={subjectId} onChange={e => setSubjectId(e.target.value)}>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                </select>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Unit Number *</label>
                  <input type="number" className="form-input" min={1} max={10} value={unitNo} onChange={e => setUnitNo(Number(e.target.value))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Marks *</label>
                  <input type="number" className="form-input" min={5} max={100} value={totalMarks} onChange={e => setTotalMarks(Number(e.target.value))} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Assignment Title *</label>
                <input type="text" className="form-input" placeholder="e.g. Assignment 1: ER Diagram & Schema Design" value={title} onChange={e => setTitle(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Problem Statement / Instructions *</label>
                <textarea className="form-input" rows={3} placeholder="Detailed instructions..." value={description} onChange={e => setDescription(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Deadline Date *</label>
                <input type="date" className="form-input" value={deadline} onChange={e => setDeadline(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Attachment (Optional)</label>
                <input type="file" className="form-input" onChange={e => setAssignmentFile(e.target.files?.[0] || null)} accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,image/*" />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsCreateModalOpen(false)} disabled={isUploading}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isUploading}>{isUploading ? 'Publishing...' : 'Publish Assignment'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Upload Submission Modal */}
      {isSubmitModalOpen && selectedAssignment && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '480px', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '0.5rem' }}>
              Upload Assignment Submission
            </h3>
            <div style={{ fontSize: '0.84375rem', color: 'var(--brand-orange)', fontWeight: 700, marginBottom: '1.25rem' }}>
              {selectedAssignment.title}
            </div>

            <form onSubmit={handleSubmitAssignment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Attachment File *</label>
                <input type="file" className="form-input" required onChange={e => setSubmissionFile(e.target.files?.[0] || null)} accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,image/*" />
              </div>

              <div className="form-group">
                <label className="form-label">Submission Notes / Comments</label>
                <textarea className="form-input" rows={3} placeholder="Add any notes for faculty evaluation..." value={submissionNotes} onChange={e => setSubmissionNotes(e.target.value)} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsSubmitModalOpen(false)} disabled={isUploading}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isUploading}>{isUploading ? 'Uploading...' : 'Submit Work'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Faculty Grading Modal */}
      {isGradingModalOpen && selectedAssignment && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '640px', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '0.5rem' }}>
              Submissions for {selectedAssignment.title}
            </h3>
            <div style={{ fontSize: '0.84375rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Review student uploaded solutions and give score out of {selectedAssignment.totalMarks}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '350px', overflowY: 'auto' }}>
              {submissions.filter(s => s.assignmentId === selectedAssignment.id).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No student submissions received yet.
                </div>
              ) : (
                submissions.filter(s => s.assignmentId === selectedAssignment.id).map(subm => (
                  <div key={subm.id} style={{ padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-surface-hover)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div style={{ fontWeight: 800, color: 'var(--brand-navy)' }}>{subm.studentName} ({subm.enrollmentNo})</div>
                      <Badge variant={subm.status === 'GRADED' ? 'active' : 'inactive'}>{subm.status}</Badge>
                    </div>

                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                      Submitted on: {subm.submittedDate} • Notes: {subm.notes || 'None'}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                      <button className="btn btn-secondary btn-sm py-1" onClick={() => fileStorage.viewFile(subm.fileUrl)}>
                        <Eye size={12} /> View
                      </button>
                      <button className="btn btn-primary btn-sm py-1" onClick={() => fileStorage.downloadFile(subm.fileUrl, `${subm.studentName}_Submission`)}>
                        <Download size={12} /> Download
                      </button>
                    </div>

                    {subm.obtainedMarks !== undefined ? (
                      <div style={{ fontSize: '0.84375rem', fontWeight: 700, color: '#10B981' }}>
                        Graded: {subm.obtainedMarks} / {selectedAssignment.totalMarks} ({subm.feedback})
                      </div>
                    ) : (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          setSelectedSubmission(subm);
                          setObtainedMarks(18);
                          setFeedback('Good structure');
                        }}
                      >
                        Assign Marks
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {selectedSubmission && (
              <form onSubmit={handleGradeSubmission} style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--brand-orange)' }}>
                  Grading {selectedSubmission.studentName}
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Marks (Out of {selectedAssignment.totalMarks})</label>
                    <input type="number" className="form-input" max={selectedAssignment.totalMarks} value={obtainedMarks} onChange={e => setObtainedMarks(Number(e.target.value))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Feedback</label>
                    <input type="text" className="form-input" value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Feedback comments..." />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary btn-sm">Save Grade</button>
              </form>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsGradingModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
