import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Badge } from '../../components/common/Badge';
import { Award, Download, BookOpen, CheckCircle2, XCircle } from 'lucide-react';
import logoSvg from '../../assets/swarrnim-logo.svg';

export const MarksheetPage: React.FC = () => {
  const { user, role } = useAuth();
  const exams = db.getExams();
  const results = db.getStudentResults();
  const marks = db.getStudentMarks();
  const students = db.getStudents();
  const subjects = db.getSubjects();

  const [selectedExamId, setSelectedExamId] = useState<string>(exams[0]?.id || '');

  const currentExam = exams.find(e => e.id === selectedExamId);
  const currentStudent = role === 'STUDENT' ? students.find(s => s.id === user?.id || s.email === user?.email) : null;
  const currentResult = currentStudent ? results.find(r => r.examId === selectedExamId && r.studentId === currentStudent.id) : null;
  const studentMarks = currentStudent ? marks.filter(m => m.examId === selectedExamId && m.studentId === currentStudent.id) : [];

  const handleDownloadMarksheet = (resultObj: any) => {
    const examObj = exams.find(e => e.id === resultObj.examId);
    const mList = marks.filter(m => m.examId === resultObj.examId && m.studentId === resultObj.studentId);

    let subjectLines = '';
    mList.forEach(m => {
      const subj = subjects.find(s => s.id === m.subjectId);
      subjectLines += `${subj?.code?.padEnd(10)} | ${subj?.name?.padEnd(30)} | Int: ${m.internalMarks.toString().padStart(2)} | Ext: ${m.externalMarks.toString().padStart(2)} | Total: ${m.totalMarks.toString().padStart(3)} | Grade: ${m.grade}\n`;
    });

    const content = `===================================================================
SWARRNIM UNIVERSITY - OFFICIAL MARKSHEET / RESULT STATEMENT
===================================================================
Exam Name     : ${examObj?.name || 'Semester Examination'}
Date          : ${resultObj.publishedDate || new Date().toISOString().split('T')[0]}
Student Name  : ${resultObj.studentName}
Enrollment No : ${resultObj.enrollmentNo}
-------------------------------------------------------------------
SUBJECT-WISE MARKS BREAKDOWN:
-------------------------------------------------------------------
Code       | Subject Name                   | Internal | External | Total     | Grade
-------------------------------------------------------------------
${subjectLines || 'No subject marks recorded.\n'}-------------------------------------------------------------------
SUMMARY RESULTS:
Total Marks    : ${resultObj.totalMarksObtained} / ${resultObj.totalMaxMarks}
Semester SGPA  : ${resultObj.sgpa}
Cumulative CGPA: ${resultObj.cgpa}
FINAL RESULT   : ${resultObj.status}
===================================================================
Control of Examinations, Swarrnim University
===================================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Marksheet_${resultObj.enrollmentNo}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
          Official University Marksheet &amp; Transcript
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          {role === 'STUDENT' ? 'View your official semester grade transcript, SGPA, CGPA, and download official marksheet' : 'Overview of student grade transcripts'}
        </p>
      </div>

      {/* Select Exam Filter */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <label className="form-label" style={{ marginBottom: 0 }}>Select Exam Event:</label>
          <select className="form-select" style={{ maxWidth: '360px' }} value={selectedExamId} onChange={e => setSelectedExamId(e.target.value)}>
            {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
      </div>

      {role === 'STUDENT' && (
        <div>
          {!currentResult ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <BookOpen size={48} color="var(--brand-orange)" style={{ margin: '0 auto 1rem', opacity: 0.7 }} />
              <h4 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Results Pending Publication</h4>
              <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>Official marksheet will be available after university evaluation &amp; result publication.</p>
            </div>
          ) : (
            <div className="card" style={{ padding: '2rem', borderTop: '6px solid var(--brand-navy)' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--brand-orange)', paddingBottom: '1.25rem', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <img src={logoSvg} alt="Swarrnim Logo" style={{ height: '56px', objectFit: 'contain' }} />
                <div style={{ textAlign: 'right' }}>
                  <Badge variant={currentResult.status === 'PASS' ? 'active' : 'inactive'}>
                    {currentResult.status === 'PASS' ? 'PASS / SUCCESSFUL' : 'REMEDIAL / FAIL'}
                  </Badge>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--brand-navy)', marginTop: '0.35rem' }}>
                    SGPA: <span style={{ color: 'var(--brand-orange)' }}>{currentResult.sgpa}</span> | CGPA: <span style={{ color: 'var(--brand-navy)' }}>{currentResult.cgpa}</span>
                  </div>
                </div>
              </div>

              {/* Student Metadata Box */}
              <div className="grid-3" style={{ background: 'var(--bg-surface-hover)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>
                <div><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Candidate Name:</span> <div style={{ fontWeight: 800 }}>{currentResult.studentName}</div></div>
                <div><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Enrollment No:</span> <div style={{ fontWeight: 800, color: 'var(--brand-navy)' }}>{currentResult.enrollmentNo}</div></div>
                <div><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Published Date:</span> <div style={{ fontWeight: 800 }}>{currentResult.publishedDate}</div></div>
              </div>

              {/* Detailed Subject Marks Table */}
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '0.75rem' }}>
                Subject Performance &amp; Grade Breakdown
              </h4>

              <div className="table-responsive" style={{ marginBottom: '1.5rem' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Subject Code</th>
                      <th>Subject Name</th>
                      <th>Internal (30)</th>
                      <th>External (70)</th>
                      <th>Total (100)</th>
                      <th>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentMarks.length === 0 ? (
                      <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No mark entries found.</td></tr>
                    ) : (
                      studentMarks.map(m => {
                        const subj = subjects.find(s => s.id === m.subjectId);
                        return (
                          <tr key={m.id}>
                            <td style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>{subj?.code}</td>
                            <td>{subj?.name}</td>
                            <td>{m.internalMarks}</td>
                            <td>{m.externalMarks}</td>
                            <td style={{ fontWeight: 800 }}>{m.totalMarks}</td>
                            <td>
                              <Badge variant={m.isPass ? 'active' : 'inactive'}>
                                {m.grade}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary" onClick={() => handleDownloadMarksheet(currentResult)}>
                  <Download size={16} /> Download Official Marksheet Transcript
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Admin Summary Directory Table */}
      {(role === 'SUPER_ADMIN' || role === 'UNIVERSITY_ADMIN') && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1.25rem' }}>
            Published Marksheets Directory ({currentExam?.name})
          </h3>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Enrollment No</th>
                  <th>Student Name</th>
                  <th>Total Marks</th>
                  <th>SGPA</th>
                  <th>CGPA</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {results.filter(r => r.examId === selectedExamId).length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No published marksheets found.</td></tr>
                ) : (
                  results.filter(r => r.examId === selectedExamId).map(r => (
                    <tr key={r.id}>
                      <td>{r.enrollmentNo}</td>
                      <td style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>{r.studentName}</td>
                      <td>{r.totalMarksObtained} / {r.totalMaxMarks}</td>
                      <td style={{ fontWeight: 800, color: 'var(--brand-orange)' }}>{r.sgpa}</td>
                      <td>{r.cgpa}</td>
                      <td>
                        <Badge variant={r.status === 'PASS' ? 'active' : 'inactive'}>
                          {r.status}
                        </Badge>
                      </td>
                      <td>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleDownloadMarksheet(r)}>
                          <Download size={14} /> Marksheet
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
