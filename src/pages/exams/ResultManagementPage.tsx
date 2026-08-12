import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { Exam, Student, StudentMarks, StudentResult } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Award, Download, UploadCloud, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ResultManagementPage: React.FC = () => {
  const { user, role } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [marks, setMarks] = useState<StudentMarks[]>([]);
  const [results, setResults] = useState<StudentResult[]>([]);
  
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allExams = db.getExams();
    const allResults = db.getStudentResults();
    
    setStudents(db.getStudents());
    setMarks(db.getStudentMarks());
    
    if (role === 'STUDENT') {
      const student = db.getStudents().find(s => s.id === user?.id || s.email === user?.email);
      if (student) {
        const publishedExams = allExams.filter(e => e.status === 'RESULTS_PUBLISHED');
        setExams(publishedExams);
        setResults(allResults.filter(r => r.studentId === student.id));
        if (publishedExams.length > 0) setSelectedExamId(publishedExams[0].id);
      }
    } else {
      setExams(allExams);
      setResults(allResults);
      if (allExams.length > 0) setSelectedExamId(allExams[0].id);
    }
  };

  const currentExam = exams.find(e => e.id === selectedExamId);
  const examStudents = students.filter(s => s.programId === currentExam?.programId && s.semesterId === currentExam?.semesterId);

  const calculateGradePoint = (grade: string) => {
    switch (grade) {
      case 'O': return 10;
      case 'A+': return 9;
      case 'A': return 8;
      case 'B+': return 7;
      case 'B': return 6;
      case 'C': return 5;
      default: return 0;
    }
  };

  const handlePublishResults = () => {
    if (!currentExam) return;
    setIsPublishing(true);

    const examMarks = marks.filter(m => m.examId === currentExam.id);
    
    examStudents.forEach(st => {
      const studentMarks = examMarks.filter(m => m.studentId === st.id);
      
      let totalObtained = 0;
      let totalMax = 0;
      let totalGradePoints = 0;
      let creditCount = 0;
      let isFail = false;

      studentMarks.forEach(m => {
        totalObtained += m.totalMarks;
        totalMax += (m.maxInternalMarks + m.maxExternalMarks);
        
        const credits = 4;
        creditCount += credits;
        totalGradePoints += (calculateGradePoint(m.grade) * credits);
        
        if (!m.isPass) isFail = true;
      });

      const sgpa = creditCount > 0 ? (totalGradePoints / creditCount) : 0;
      const cgpa = sgpa; 
      
      const newResult: Omit<StudentResult, 'id'> = {
        examId: currentExam.id,
        studentId: st.id,
        studentName: st.name,
        enrollmentNo: st.enrollmentNo,
        programId: st.programId,
        semesterId: st.semesterId,
        totalMarksObtained: totalObtained,
        totalMaxMarks: totalMax || 1,
        sgpa: parseFloat(sgpa.toFixed(2)),
        cgpa: parseFloat(cgpa.toFixed(2)),
        status: isFail ? 'FAIL' : 'PASS',
        publishedDate: new Date().toISOString().split('T')[0]
      };

      const existing = db.getStudentResults().find(r => r.examId === currentExam.id && r.studentId === st.id);
      if (existing) {
        db.updateEntity<StudentResult>('studentResults', existing.id, newResult);
      } else {
        db.addEntity<StudentResult>('studentResults', newResult);
      }
    });

    db.updateEntity<Exam>('exams', currentExam.id, { status: 'RESULTS_PUBLISHED' }, 'Published Results');
    
    setTimeout(() => {
      setIsPublishing(false);
      loadData();
    }, 800);
  };

  const handleDownloadMarksheet = (resultId: string) => {
    const result = results.find(r => r.id === resultId);
    if (!result || !currentExam) return;

    const studentMarks = marks.filter(m => m.examId === currentExam.id && m.studentId === result.studentId);
    
    let subjectLines = '';
    studentMarks.forEach(m => {
      const subj = db.getSubjects().find(s => s.id === m.subjectId);
      subjectLines += `${subj?.code?.padEnd(10)} | ${subj?.name?.padEnd(30)} | Int: ${m.internalMarks.toString().padStart(2)} | Ext: ${m.externalMarks.toString().padStart(2)} | Total: ${m.totalMarks.toString().padStart(3)} | Grade: ${m.grade}\n`;
    });

    const marksheetContent = `===================================================================
SWARRNIM UNIVERSITY - OFFICIAL MARKSHEET / RESULT STATEMENT
===================================================================
Exam Name     : ${currentExam.name}
Date          : ${result.publishedDate}
Student Name  : ${result.studentName}
Enrollment No : ${result.enrollmentNo}
-------------------------------------------------------------------
SUBJECT-WISE MARKS BREAKDOWN:
-------------------------------------------------------------------
Code       | Subject Name                   | Internal | External | Total     | Grade
-------------------------------------------------------------------
${subjectLines}-------------------------------------------------------------------
SUMMARY RESULTS:
Total Obtained : ${result.totalMarksObtained} / ${result.totalMaxMarks}
Semester SGPA  : ${result.sgpa}
Cumulative CGPA: ${result.cgpa}
FINAL RESULT   : ${result.status}
===================================================================
Control of Examinations, Swarrnim University
===================================================================`;

    const blob = new Blob([marksheetContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Marksheet_${result.enrollmentNo}_${currentExam.name.replace(/[^a-z0-9]/gi, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
          Result Management &amp; Result Publication
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Calculate SGPA/CGPA, publish examination results, and review student scorecard rankings
        </p>
      </div>

      {/* Select Exam Bar */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <label className="form-label" style={{ marginBottom: 0 }}>Select Exam Event:</label>
          <select 
            className="form-select" 
            style={{ maxWidth: '380px' }} 
            value={selectedExamId} 
            onChange={e => setSelectedExamId(e.target.value)}
          >
            {exams.length === 0 ? <option value="">No exams available</option> : null}
            {exams.map(exam => (
              <option key={exam.id} value={exam.id}>{exam.name}</option>
            ))}
          </select>
        </div>
      </div>

      {currentExam && (role === 'SUPER_ADMIN' || role === 'UNIVERSITY_ADMIN' || role === 'EXAM_CELL' || role === 'PRINCIPAL') && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                Result Generation Summary
              </h3>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{currentExam.name}</div>
            </div>
            
            {currentExam.status !== 'RESULTS_PUBLISHED' ? (
              <button 
                className="btn btn-primary"
                onClick={handlePublishResults}
                disabled={isPublishing}
              >
                <UploadCloud size={16} /> {isPublishing ? 'Calculating & Publishing...' : 'Calculate & Publish Results'}
              </button>
            ) : (
              <Badge variant="active">
                <CheckCircle size={14} /> RESULTS PUBLISHED
              </Badge>
            )}
          </div>
          
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
                </tr>
              </thead>
              <tbody>
                {examStudents.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No enrolled students found.</td></tr>
                ) : (
                  examStudents.map(st => {
                    const result = results.find(r => r.examId === currentExam.id && r.studentId === st.id);
                    
                    return (
                      <tr key={st.id}>
                        <td style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>{st.enrollmentNo}</td>
                        <td>{st.name}</td>
                        <td>
                          {result ? (
                            <strong>{result.totalMarksObtained} / {result.totalMaxMarks}</strong>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>Pending Calculation</span>
                          )}
                        </td>
                        <td style={{ fontWeight: 800, color: 'var(--brand-orange)' }}>{result?.sgpa || '-'}</td>
                        <td>{result?.cgpa || '-'}</td>
                        <td>
                          {result ? (
                            <Badge variant={result.status === 'PASS' ? 'active' : 'inactive'}>
                              {result.status}
                            </Badge>
                          ) : (
                            <Badge variant="navy">Pending</Badge>
                          )}
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

      {currentExam && role === 'STUDENT' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {(() => {
            const result = results.find(r => r.examId === currentExam.id);
            if (!result) {
              return (
                <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Result not published yet for this examination.
                </div>
              );
            }
            
            const studentMarks = marks.filter(m => m.examId === currentExam.id && m.studentId === result.studentId);

            return (
              <>
                <div className="grid-4">
                  <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #10B981' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>RESULT STATUS</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: result.status === 'PASS' ? '#10B981' : '#EF4444', marginTop: '0.2rem' }}>
                      {result.status}
                    </div>
                  </div>
                  <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--brand-orange)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>SEMESTER SGPA</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--brand-navy)', marginTop: '0.2rem' }}>
                      {result.sgpa}
                    </div>
                  </div>
                  <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #8B5CF6' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>CUMULATIVE CGPA</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--brand-navy)', marginTop: '0.2rem' }}>
                      {result.cgpa}
                    </div>
                  </div>
                  <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--brand-navy)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>TOTAL MARKS</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--brand-navy)', marginTop: '0.2rem' }}>
                      {result.totalMarksObtained} <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>/ {result.totalMaxMarks}</span>
                    </div>
                  </div>
                </div>

                <div className="card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                      Detailed Subject Scorecard
                    </h3>
                    <button onClick={() => handleDownloadMarksheet(result.id)} className="btn btn-primary btn-sm">
                      <Download size={14} /> Download Marksheet
                    </button>
                  </div>
                  <div className="table-responsive">
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
                        {studentMarks.map(m => {
                          const subj = db.getSubjects().find(s => s.id === m.subjectId);
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
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};
