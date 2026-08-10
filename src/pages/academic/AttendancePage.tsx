import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Badge } from '../../components/common/Badge';
import { AttendanceSession, AttendanceStatus } from '../../types';
import { 
  CheckCircle2, XCircle, Clock, Calendar, Search, Filter, 
  Check, Save, AlertTriangle, BarChart3, UserCheck, ShieldCheck 
} from 'lucide-react';

export const AttendancePage: React.FC = () => {
  const { user, role } = useAuth();
  
  const subjects = db.getSubjects();
  const divisions = db.getDivisions();
  const departments = db.getDepartments();
  const students = db.getStudents();
  const attendanceSessions = db.getAttendanceSessions();

  // Filters & State
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [selectedDivisionId, setSelectedDivisionId] = useState(divisions[0]?.id || '');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [lectureNo, setLectureNo] = useState(1);
  const [topicTaught, setTopicTaught] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Attendance marking state for Faculty
  const divisionStudents = students.filter(s => s.divisionId === selectedDivisionId || !selectedDivisionId);
  const [markingState, setMarkingState] = useState<Record<string, AttendanceStatus>>(() => {
    const map: Record<string, AttendanceStatus> = {};
    divisionStudents.forEach(s => { map[s.id] = 'PRESENT'; });
    return map;
  });

  const [notification, setNotification] = useState('');

  // 1. Faculty Attendance Marking Handler
  const handleMarkingToggle = (studentId: string, status: AttendanceStatus) => {
    setMarkingState(prev => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    const map: Record<string, AttendanceStatus> = {};
    divisionStudents.forEach(s => { map[s.id] = status; });
    setMarkingState(map);
  };

  const handleSubmitAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId || !selectedDivisionId) {
      alert('Please select a valid Subject and Division.');
      return;
    }

    const records = divisionStudents.map(s => ({
      studentId: s.id,
      studentName: s.name,
      enrollmentNo: s.enrollmentNo,
      status: markingState[s.id] || 'PRESENT'
    }));

    const newSession: Omit<AttendanceSession, 'id'> = {
      date: selectedDate,
      subjectId: selectedSubjectId,
      divisionId: selectedDivisionId,
      facultyId: user?.id || 'fac-1',
      facultyName: user?.name || 'Prof. Demo Faculty',
      lectureNo: Number(lectureNo),
      topicTaught: topicTaught || 'Regular Lecture',
      submittedAt: new Date().toISOString(),
      status: 'SUBMITTED',
      records
    };

    db.addEntity<AttendanceSession>('attendanceSessions', newSession, `Submitted attendance for ${records.length} students on ${selectedDate}`);
    setNotification('Attendance session submitted successfully!');
    setTopicTaught('');
    setTimeout(() => setNotification(''), 4000);
  };

  // 2. Student View Render
  const renderStudentView = () => {
    const studentId = user?.id || 'stu-1';
    const stats = db.getStudentAttendanceStats(studentId);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {/* Overall Summary KPI Grid */}
        <div className="grid-4">
          <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--brand-orange)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Overall Attendance</div>
            <div style={{ fontSize: '2.25rem', fontWeight: 900, color: stats.percentage >= 75 ? '#10B981' : '#EF4444', marginTop: '0.25rem' }}>
              {stats.percentage}%
            </div>
            <div style={{ fontSize: '0.78125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {stats.percentage >= 75 ? 'Good Academic Standing' : 'Low Attendance Alert (<75%)'}
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #10B981' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Attended</div>
            <div style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--brand-navy)', marginTop: '0.25rem' }}>
              {stats.presentClasses}
            </div>
            <div style={{ fontSize: '0.78125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Present / Late Classes</div>
          </div>

          <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #EF4444' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Classes Absent</div>
            <div style={{ fontSize: '2.25rem', fontWeight: 900, color: '#EF4444', marginTop: '0.25rem' }}>
              {stats.absentClasses}
            </div>
            <div style={{ fontSize: '0.78125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Missed Lectures</div>
          </div>

          <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #3B82F6' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Conducted</div>
            <div style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--brand-navy)', marginTop: '0.25rem' }}>
              {stats.totalClasses}
            </div>
            <div style={{ fontSize: '0.78125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Total Conducted Sessions</div>
          </div>
        </div>

        {/* Subject-Wise Breakdown Table */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={20} color="var(--brand-orange)" /> Subject-Wise Attendance Breakdown
          </h3>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Subject Name</th>
                  <th>Subject Code</th>
                  <th>Present / Total</th>
                  <th>Attendance %</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map(subj => {
                  const stat = stats.subjectStats[subj.id] || { total: 0, present: 0 };
                  const pct = stat.total > 0 ? Math.round((stat.present / stat.total) * 100) : 100;

                  return (
                    <tr key={subj.id}>
                      <td style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>{subj.name}</td>
                      <td><code style={{ color: 'var(--brand-orange)', fontWeight: 700 }}>{subj.code}</code></td>
                      <td>{stat.present} / {stat.total} Classes</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ flex: 1, height: '8px', borderRadius: '4px', backgroundColor: 'var(--border-light)', overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', backgroundColor: pct >= 75 ? '#10B981' : '#EF4444' }} />
                          </div>
                          <span style={{ fontWeight: 800, fontSize: '0.875rem' }}>{pct}%</span>
                        </div>
                      </td>
                      <td>
                        <Badge variant={pct >= 75 ? 'active' : 'inactive'}>
                          {pct >= 75 ? 'Eligible' : 'Low Attendance Warning'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // 3. Faculty Marking View
  const renderFacultyView = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {notification && (
        <div style={{ padding: '1rem', background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', borderRadius: 'var(--radius-sm)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={18} /> {notification}
        </div>
      )}

      {/* Class & Subject Selector Form */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <UserCheck size={20} color="var(--brand-orange)" /> Mark Lecture Attendance
        </h3>

        <form onSubmit={handleSubmitAttendance} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="grid-4">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Subject *</label>
              <select className="form-select" value={selectedSubjectId} onChange={e => setSelectedSubjectId(e.target.value)}>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Division *</label>
              <select className="form-select" value={selectedDivisionId} onChange={e => setSelectedDivisionId(e.target.value)}>
                {divisions.map(d => <option key={d.id} value={d.id}>{d.name} ({d.roomNo})</option>)}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Date *</label>
              <input type="date" className="form-input" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} required />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Lecture No. *</label>
              <input type="number" className="form-input" min={1} max={10} value={lectureNo} onChange={e => setLectureNo(Number(e.target.value))} required />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Topic Taught in Class</label>
            <input type="text" className="form-input" placeholder="e.g. Relational Normalization & 3NF Decomposition" value={topicTaught} onChange={e => setTopicTaught(e.target.value)} />
          </div>

          {/* Quick Mark All Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleMarkAll('PRESENT')}>
                Mark All Present
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleMarkAll('ABSENT')}>
                Mark All Absent
              </button>
            </div>

            <button type="submit" className="btn btn-primary">
              <Save size={16} /> Submit Attendance
            </button>
          </div>
        </form>
      </div>

      {/* Student Attendance Roster */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--brand-navy)' }}>Student Roster ({divisionStudents.length} Enrolled)</h4>
            <div style={{ fontSize: '0.78125rem', color: 'var(--text-muted)' }}>Toggle status for each student</div>
          </div>

          <div style={{ position: 'relative', width: '240px' }}>
            <input type="text" className="form-input" placeholder="Search student..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ paddingLeft: '2.2rem', padding: '0.4rem 0.75rem 0.4rem 2.2rem', fontSize: '0.8125rem' }} />
            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Enrollment No</th>
                <th>Student Name</th>
                <th>Status Toggle</th>
              </tr>
            </thead>
            <tbody>
              {divisionStudents.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.enrollmentNo.includes(searchTerm)).map(st => {
                const stStatus = markingState[st.id] || 'PRESENT';

                return (
                  <tr key={st.id}>
                    <td><code style={{ fontWeight: 700, color: 'var(--brand-orange)' }}>{st.enrollmentNo}</code></td>
                    <td style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>{st.name}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          onClick={() => handleMarkingToggle(st.id, 'PRESENT')}
                          style={{
                            padding: '0.35rem 0.75rem',
                            borderRadius: 'var(--radius-sm)',
                            border: stStatus === 'PRESENT' ? '2px solid #10B981' : '1px solid var(--border-color)',
                            backgroundColor: stStatus === 'PRESENT' ? '#ECFDF5' : 'transparent',
                            color: stStatus === 'PRESENT' ? '#047857' : 'var(--text-muted)',
                            fontWeight: 700,
                            fontSize: '0.8125rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem'
                          }}
                        >
                          <CheckCircle2 size={14} /> Present
                        </button>

                        <button
                          type="button"
                          onClick={() => handleMarkingToggle(st.id, 'ABSENT')}
                          style={{
                            padding: '0.35rem 0.75rem',
                            borderRadius: 'var(--radius-sm)',
                            border: stStatus === 'ABSENT' ? '2px solid #EF4444' : '1px solid var(--border-color)',
                            backgroundColor: stStatus === 'ABSENT' ? '#FEF2F2' : 'transparent',
                            color: stStatus === 'ABSENT' ? '#B91C1C' : 'var(--text-muted)',
                            fontWeight: 700,
                            fontSize: '0.8125rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem'
                          }}
                        >
                          <XCircle size={14} /> Absent
                        </button>

                        <button
                          type="button"
                          onClick={() => handleMarkingToggle(st.id, 'LATE')}
                          style={{
                            padding: '0.35rem 0.75rem',
                            borderRadius: 'var(--radius-sm)',
                            border: stStatus === 'LATE' ? '2px solid #F5A623' : '1px solid var(--border-color)',
                            backgroundColor: stStatus === 'LATE' ? '#FFFBEB' : 'transparent',
                            color: stStatus === 'LATE' ? '#B45309' : 'var(--text-muted)',
                            fontWeight: 700,
                            fontSize: '0.8125rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem'
                          }}
                        >
                          <Clock size={14} /> Late
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // 4. Admin View
  const renderAdminView = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Admin Attendance Master Overview */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={20} color="var(--brand-orange)" /> University Attendance Reports &amp; Audit Logs
        </h3>

        <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Filter Department</label>
            <select className="form-select" value={selectedDepartmentId} onChange={e => setSelectedDepartmentId(e.target.value)}>
              <option value="ALL">All Departments</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Filter Subject</label>
            <select className="form-select" value={selectedSubjectId} onChange={e => setSelectedSubjectId(e.target.value)}>
              <option value="ALL">All Subjects</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Filter Date</label>
            <input type="date" className="form-input" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
          </div>
        </div>

        {/* Sessions Table */}
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Subject</th>
                <th>Faculty</th>
                <th>Division</th>
                <th>Topic Taught</th>
                <th>Present / Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendanceSessions.map(sess => {
                const subj = db.getSubjectById(sess.subjectId);
                const div = db.getDivisionById(sess.divisionId);
                const presentCount = sess.records.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length;

                return (
                  <tr key={sess.id}>
                    <td><span style={{ fontWeight: 600 }}>{sess.date}</span></td>
                    <td style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>{subj ? subj.name : 'Subject'}</td>
                    <td>{sess.facultyName}</td>
                    <td>{div ? div.name : 'Div'}</td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{sess.topicTaught}</td>
                    <td style={{ fontWeight: 700 }}>{presentCount} / {sess.records.length}</td>
                    <td><Badge variant="active">{sess.status}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
          Attendance Management
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          {role === 'STUDENT' ? 'Track your subject-wise lecture attendance & academic standing' : role === 'FACULTY' ? 'Mark, submit & review student attendance for your assigned classes' : 'Monitor attendance compliance across departments & divisions'}
        </p>
      </div>

      {role === 'STUDENT' ? renderStudentView() : role === 'FACULTY' ? renderFacultyView() : renderAdminView()}
    </div>
  );
};
