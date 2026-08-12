import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { Exam, Subject, Student, StudentMarks } from '../../types';
import { Badge } from '../../components/common/Badge';
import { FileText, Save, Check, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const MarksManagementPage: React.FC = () => {
  const { user, role } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [marks, setMarks] = useState<StudentMarks[]>([]);
  
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  
  // Local state for editing marks
  const [editMarks, setEditMarks] = useState<Record<string, { internal: string, external: string }>>({});
  const [saveStatus, setSaveStatus] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allExams = db.getExams();
    setExams(allExams);
    setSubjects(db.getSubjects());
    setMarks(db.getStudentMarks());
    if (allExams.length > 0) setSelectedExamId(allExams[0].id);
  };

  useEffect(() => {
    if (selectedExamId && selectedSubjectId) {
      const exam = exams.find(e => e.id === selectedExamId);
      if (exam) {
        const enrolledStudents = db.getStudents().filter(s => s.programId === exam.programId && s.semesterId === exam.semesterId);
        setStudents(enrolledStudents);

        const localMarks: Record<string, { internal: string, external: string }> = {};
        const subjectMarks = db.getStudentMarks().filter(m => m.examId === selectedExamId && m.subjectId === selectedSubjectId);
        
        enrolledStudents.forEach(st => {
          const m = subjectMarks.find(x => x.studentId === st.id);
          localMarks[st.id] = {
            internal: m ? m.internalMarks.toString() : '',
            external: m ? m.externalMarks.toString() : ''
          };
        });
        setEditMarks(localMarks);
      }
    } else {
      setStudents([]);
    }
  }, [selectedExamId, selectedSubjectId, exams, marks]);

  const handleMarksChange = (studentId: string, field: 'internal' | 'external', value: string) => {
    setEditMarks(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const handleSaveMarks = () => {
    const maxInt = 30;
    const maxExt = 70;

    const newMarksList = students.map(st => {
      const internalVal = parseFloat(editMarks[st.id]?.internal) || 0;
      const externalVal = parseFloat(editMarks[st.id]?.external) || 0;
      const total = internalVal + externalVal;
      
      const grade = total >= 90 ? 'O' : total >= 80 ? 'A+' : total >= 70 ? 'A' : total >= 60 ? 'B+' : total >= 50 ? 'B' : total >= 40 ? 'C' : 'F';
      const isPass = total >= 40;

      return {
        id: `mark-${selectedExamId}-${selectedSubjectId}-${st.id}`,
        examId: selectedExamId,
        studentId: st.id,
        subjectId: selectedSubjectId,
        internalMarks: internalVal,
        externalMarks: externalVal,
        totalMarks: total,
        maxInternalMarks: maxInt,
        maxExternalMarks: maxExt,
        grade,
        isPass,
        enteredBy: user?.id || 'admin',
        enteredAt: new Date().toISOString()
      };
    });

    newMarksList.forEach(m => {
      const existing = db.getStudentMarks().find(x => x.examId === m.examId && x.subjectId === m.subjectId && x.studentId === m.studentId);
      if (existing) {
        db.updateEntity('studentMarks', existing.id, m);
      } else {
        db.addEntity('studentMarks', m as any);
      }
    });

    db.logAudit('UPDATE', 'Exam Marks', `Marks updated for Subject ${selectedSubjectId} in Exam ${selectedExamId}`);
    loadData();
    setSaveStatus('Marks saved successfully!');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const currentExam = exams.find(e => e.id === selectedExamId);
  const isLocked = currentExam?.status === 'RESULTS_PUBLISHED';

  let examSubjects = subjects.filter(s => s.semesterId === currentExam?.semesterId && s.programId === currentExam?.programId);
  if (role === 'FACULTY' && user?.id) {
    const facultyObj = db.getFaculty().find(f => f.email === user.email || f.id === user.id);
    if (facultyObj) {
      examSubjects = examSubjects.filter(s => (facultyObj.subjectIds || []).includes(s.id) || s.departmentId === facultyObj.departmentId);
    }
  }

  if (role !== 'SUPER_ADMIN' && role !== 'UNIVERSITY_ADMIN' && role !== 'EXAM_CELL' && role !== 'FACULTY' && role !== 'HOD') {
    return <div style={{ padding: '2rem' }}>Unauthorized Access</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
          Marks Management &amp; Internal Evaluation
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Input and update student internal (30) and external (70) marks for assigned subjects
        </p>
      </div>

      {/* Select Exam & Subject Bar */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div className="grid-2">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Select Exam Event *</label>
            <select 
              className="form-select" 
              value={selectedExamId} 
              onChange={e => { setSelectedExamId(e.target.value); setSelectedSubjectId(''); }}
            >
              <option value="">Select Exam Event</option>
              {exams.map(exam => <option key={exam.id} value={exam.id}>{exam.name}</option>)}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Select Subject *</label>
            <select 
              className="form-select" 
              value={selectedSubjectId} 
              onChange={e => setSelectedSubjectId(e.target.value)}
              disabled={!selectedExamId}
            >
              <option value="">Select Subject</option>
              {examSubjects.map(sub => <option key={sub.id} value={sub.id}>{sub.code} - {sub.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {selectedExamId && selectedSubjectId && (
        <div className="card" style={{ padding: '1.5rem' }}>
          {isLocked && (
            <div style={{ padding: '0.75rem 1rem', background: '#FFFBEB', borderLeft: '4px solid #F59E0B', borderRadius: 'var(--radius-sm)', color: '#B45309', fontWeight: 700, fontSize: '0.84375rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={16} /> Results have been published for this exam. Marks are locked and read-only.
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
              Marks Entry: {subjects.find(s => s.id === selectedSubjectId)?.name}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {saveStatus && <span style={{ fontSize: '0.8125rem', color: '#10B981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Check size={14} /> {saveStatus}</span>}
              {!isLocked && (
                <button onClick={handleSaveMarks} className="btn btn-primary">
                  <Save size={16} /> Save Marks
                </button>
              )}
            </div>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Sr.</th>
                  <th>Enrollment No</th>
                  <th>Student Name</th>
                  <th style={{ width: '140px' }}>Internal (30)</th>
                  <th style={{ width: '140px' }}>External (70)</th>
                  <th style={{ width: '120px' }}>Total (100)</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No students enrolled for this program/semester.</td></tr>
                ) : (
                  students.map((st, idx) => {
                    const internal = parseFloat(editMarks[st.id]?.internal || '0');
                    const external = parseFloat(editMarks[st.id]?.external || '0');
                    const total = internal + external;

                    return (
                      <tr key={st.id}>
                        <td>{idx + 1}</td>
                        <td style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>{st.enrollmentNo}</td>
                        <td>{st.name}</td>
                        <td>
                          <input 
                            type="number" 
                            min="0" max="30"
                            disabled={isLocked}
                            className="form-input" 
                            style={{ textAlign: 'center', padding: '0.35rem' }}
                            value={editMarks[st.id]?.internal || ''}
                            onChange={(e) => handleMarksChange(st.id, 'internal', e.target.value)}
                          />
                        </td>
                        <td>
                          <input 
                            type="number" 
                            min="0" max="70"
                            disabled={isLocked}
                            className="form-input" 
                            style={{ textAlign: 'center', padding: '0.35rem' }}
                            value={editMarks[st.id]?.external || ''}
                            onChange={(e) => handleMarksChange(st.id, 'external', e.target.value)}
                          />
                        </td>
                        <td>
                          <Badge variant={total >= 40 ? 'active' : 'inactive'}>
                            {total} Marks
                          </Badge>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
