import React, { useState, useMemo } from 'react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { studentRequestService } from '../../services/studentRequestService';
import { StudentRequestCategory } from '../../types/studentRequest';
import { Send, AlertCircle, ShieldCheck, UserCheck, BookOpen, AlertTriangle } from 'lucide-react';

interface StudentRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES: { value: StudentRequestCategory; label: string }[] = [
  { value: 'ACADEMIC', label: 'Academic Matter' },
  { value: 'SUBJECT_RELATED', label: 'Subject / Syllabus Related' },
  { value: 'ATTENDANCE', label: 'Attendance Discrepancy / Leave' },
  { value: 'FACULTY_RELATED', label: 'Faculty Query / Guidance' },
  { value: 'EXAMINATION', label: 'Examination & Hall Ticket' },
  { value: 'FEES', label: 'Fee Payment & Concession' },
  { value: 'ACCOUNTS', label: 'Accounts & Refund Query' },
  { value: 'HOSTEL', label: 'Hostel Allotment & Room Issue' },
  { value: 'TRANSPORT', label: 'Transport & Bus Route' },
  { value: 'IT_SUPPORT', label: 'IT Support & Portal Issue' },
  { value: 'LIBRARY', label: 'Library & Book Issue' },
  { value: 'DOCUMENT_CERTIFICATE', label: 'Bonafide / Certificates / NOC' },
  { value: 'COMPLAINT', label: 'Student Grievance / Complaint' },
  { value: 'OTHER', label: 'General Administrative Request' }
];

export const StudentRequestModal: React.FC<StudentRequestModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();

  const [category, setCategory] = useState<StudentRequestCategory>('SUBJECT_RELATED');
  const [subjectId, setSubjectId] = useState<string>('');
  const [subjectTitle, setSubjectTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [preferredContact, setPreferredContact] = useState(user?.phone || '');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Auto-lookup assigned mentor
  const mentorInfo = useMemo(() => {
    if (!user) return null;
    try {
      return studentRequestService.getStudentMentor(user.id || user.enrollmentNo || user.email);
    } catch (e: any) {
      return null;
    }
  }, [user]);

  // Enrolled subjects for student
  const availableSubjects = useMemo(() => {
    return db.getSubjects();
  }, []);

  if (!user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!subjectTitle.trim() || !description.trim()) {
      setError('Please provide a subject line and description for your request.');
      return;
    }

    if (!mentorInfo) {
      setError('Your mentor is not assigned. Please contact the Student Section.');
      return;
    }

    const attachments = fileName.trim() ? [
      {
        id: `att-${Date.now()}`,
        fileName: fileName.trim(),
        fileSize: '1.2 MB',
        fileType: fileName.toLowerCase().endsWith('.pdf') ? 'PDF' : 'Document',
        uploadedAt: new Date().toISOString()
      }
    ] : [];

    try {
      studentRequestService.createStudentRequest({
        category,
        subjectId: (category === 'SUBJECT_RELATED' || category === 'ACADEMIC') ? (subjectId || availableSubjects[0]?.id) : undefined,
        subject: subjectTitle.trim(),
        description: description.trim(),
        priority,
        attachments,
        preferredContact: preferredContact.trim() || undefined
      }, user);

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit student request.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Student Request" maxWidth="720px">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Mentor Routing Notice */}
        <div style={{
          backgroundColor: mentorInfo ? 'rgba(46, 125, 50, 0.08)' : 'rgba(211, 47, 47, 0.08)',
          border: `1px solid ${mentorInfo ? 'var(--brand-green)' : 'var(--brand-red)'}`,
          borderRadius: '8px',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.875rem'
        }}>
          {mentorInfo ? (
            <>
              <UserCheck size={24} style={{ color: 'var(--brand-green)', flexShrink: 0 }} />
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.925rem', color: 'var(--brand-green)' }}>
                  Automatic Mentor Routing Active
                </p>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                  Your request will be submitted directly to your assigned Faculty Mentor: <strong>{mentorInfo.mentorName}</strong> for initial assessment and controlled routing.
                </p>
              </div>
            </>
          ) : (
            <>
              <AlertTriangle size={24} style={{ color: 'var(--brand-red)', flexShrink: 0 }} />
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.925rem', color: 'var(--brand-red)' }}>
                  Mentor Assignment Missing
                </p>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.825rem', color: 'var(--brand-red)' }}>
                  Your mentor is not assigned. Please contact the Student Section to assign a mentor before submitting requests.
                </p>
              </div>
            </>
          )}
        </div>

        {error && (
          <div style={{
            backgroundColor: 'rgba(211, 47, 47, 0.1)',
            border: '1px solid var(--brand-red)',
            color: 'var(--brand-red)',
            padding: '0.75rem 1rem',
            borderRadius: '6px',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.875rem', fontWeight: 600 }}>
              Request Category <span style={{ color: 'var(--brand-red)' }}>*</span>
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as StudentRequestCategory)}
              className="input-field"
              style={{ width: '100%' }}
              required
            >
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.875rem', fontWeight: 600 }}>
              Priority Level <span style={{ color: 'var(--brand-red)' }}>*</span>
            </label>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value as any)}
              className="input-field"
              style={{ width: '100%' }}
              required
            >
              <option value="LOW">Low — Normal Inquiry</option>
              <option value="MEDIUM">Medium — Standard Request</option>
              <option value="HIGH">High — Time Sensitive</option>
              <option value="URGENT">Urgent — Immediate Attention Required</option>
            </select>
          </div>
        </div>

        {/* If Subject Related, show subject dropdown */}
        {(category === 'SUBJECT_RELATED' || category === 'ACADEMIC') && (
          <div>
            <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.875rem', fontWeight: 600 }}>
              Enrolled Subject <span style={{ color: 'var(--brand-red)' }}>*</span>
            </label>
            <select
              value={subjectId}
              onChange={e => setSubjectId(e.target.value)}
              className="input-field"
              style={{ width: '100%' }}
            >
              <option value="">-- Select Subject --</option>
              {availableSubjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
              Your mentor will route this request to the faculty assigned to teach this subject.
            </span>
          </div>
        )}

        <div>
          <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.875rem', fontWeight: 600 }}>
            Request Subject / Title <span style={{ color: 'var(--brand-red)' }}>*</span>
          </label>
          <input
            type="text"
            value={subjectTitle}
            onChange={e => setSubjectTitle(e.target.value)}
            placeholder="e.g. Request for Lab Manual Evaluation / Attendance Correction"
            className="input-field"
            style={{ width: '100%' }}
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.875rem', fontWeight: 600 }}>
            Detailed Description <span style={{ color: 'var(--brand-red)' }}>*</span>
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
            placeholder="Provide complete explanation, dates, roll numbers, or specific query details..."
            className="input-field"
            style={{ width: '100%', resize: 'vertical' }}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.875rem', fontWeight: 600 }}>
              Supporting Document / Attachment (Optional)
            </label>
            <input
              type="text"
              value={fileName}
              onChange={e => setFileName(e.target.value)}
              placeholder="e.g. Medical_Certificate.pdf / Receipt.png"
              className="input-field"
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.875rem', fontWeight: 600 }}>
              Preferred Contact Number
            </label>
            <input
              type="text"
              value={preferredContact}
              onChange={e => setPreferredContact(e.target.value)}
              placeholder="+91 98765 43210"
              className="input-field"
              style={{ width: '100%' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!mentorInfo}
            style={{ opacity: !mentorInfo ? 0.6 : 1 }}
          >
            <Send size={16} /> Submit to Mentor
          </button>
        </div>
      </form>
    </Modal>
  );
};
