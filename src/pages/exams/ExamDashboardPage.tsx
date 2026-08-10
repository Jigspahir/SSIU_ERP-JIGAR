import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Badge } from '../../components/common/Badge';
import { StatCard } from '../../components/common/StatCard';
import { BarChart, LineChart, PieChart } from '../../components/common/Charts';
import { 
  FileSignature, Calendar, FileCheck, Award, Users, CheckCircle2, 
  Clock, ShieldCheck, FileText, ArrowRight, IndianRupee
} from 'lucide-react';

interface ExamDashboardPageProps {
  setActiveTab: (tab: string) => void;
}

export const ExamDashboardPage: React.FC<ExamDashboardPageProps> = ({ setActiveTab }) => {
  const { user, role } = useAuth();

  const exams = db.getExams();
  const forms = db.getExamForms();
  const results = db.getStudentResults();
  const marks = db.getStudentMarks();
  const timetables = db.getExamTimetables();

  const studentObj = role === 'STUDENT' ? db.getStudents().find(s => s.id === user?.id || s.email === user?.email) : null;
  const studentForm = studentObj ? forms.find(f => f.studentId === studentObj.id) : null;
  const studentResult = studentObj ? results.find(r => r.studentId === studentObj.id) : null;

  const totalExams = exams.length;
  const scheduledExams = exams.filter(e => e.status === 'SCHEDULED').length;
  const ongoingExams = exams.filter(e => e.status === 'ONGOING').length;
  const publishedExams = exams.filter(e => e.status === 'RESULTS_PUBLISHED').length;

  const examFormStatusData = [
    { label: 'Approved', value: forms.filter(f => f.status === 'APPROVED' || f.status === 'HALL_TICKET_ISSUED').length || 18, color: '#10B981' },
    { label: 'Pending Doc', value: forms.filter(f => f.status === 'VERIFICATION_PENDING').length || 6, color: '#F37023' },
    { label: 'Paid', value: forms.filter(f => f.paymentStatus === 'PAID').length || 22, color: '#3B82F6' },
    { label: 'Rejected', value: forms.filter(f => f.status === 'REJECTED').length || 2, color: '#EF4444' }
  ];

  const examPassRatioData = [
    { label: 'Distinction (>8.5)', value: 52, color: '#10B981' },
    { label: 'First Class (7.0-8.5)', value: 38, color: '#3B82F6' },
    { label: 'Pass (5.0-7.0)', value: 8, color: '#FFB200' },
    { label: 'Remedial (<5.0)', value: 2, color: '#EF4444' }
  ];

  const examRegistrationTrend = [
    { label: 'Day 1', value: 25 },
    { label: 'Day 2', value: 55 },
    { label: 'Day 3', value: 90 },
    { label: 'Day 4', value: 140 },
    { label: 'Day 5', value: 185 },
    { label: 'Day 6', value: 210 }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Banner Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
            Examination Management Dashboard
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            {role === 'STUDENT'
              ? 'Track exam registrations, fees, schedules, admit cards, and grade performance'
              : role === 'FACULTY'
              ? 'Manage evaluation marks, review timetable schedules, and monitor student performance'
              : 'University examination control center: master setup, form approvals, hall tickets & results'}
          </p>
        </div>
      </div>

      {/* Role-Specific Metric Cards */}
      <div className="grid-4">
        <StatCard
          title="Total Examinations"
          value={totalExams}
          icon={FileSignature}
          colorScheme="navy"
          trend={`${scheduledExams} Active`}
        />
        <StatCard
          title="Exam Forms Submitted"
          value={forms.length}
          icon={FileCheck}
          colorScheme="orange"
          trend={`${forms.filter(f => f.status === 'APPROVED' || f.status === 'HALL_TICKET_ISSUED').length} Approved`}
        />
        <StatCard
          title="Hall Tickets Issued"
          value={forms.filter(f => f.status === 'HALL_TICKET_ISSUED').length}
          icon={ShieldCheck}
          colorScheme="green"
          trend="Ready for Exam"
        />
        <StatCard
          title="Results Published"
          value={publishedExams}
          icon={Award}
          colorScheme="gold"
          trend={`${results.filter(r => r.status === 'PASS').length} Pass`}
        />
      </div>

      {/* Visual Analytics Charts Row */}
      <div className="grid-3">
        <BarChart
          title="Exam Form Application Status"
          data={examFormStatusData}
          summaryText="Over 80% of submitted student examination forms are fully verified and approved with Hall Tickets generated."
        />
        <LineChart
          title="Cumulative Registration Trajectory"
          data={examRegistrationTrend}
          color="#F37023"
          summaryText="Registration velocity surged to 210 completed applications prior to the regular form deadline."
        />
        <PieChart
          title="Result Grade Point Breakdown"
          data={examPassRatioData}
          summaryText="Examination performance yields a 98% overall pass rate with 90% securing Distinction or First Class SGPA."
        />
      </div>

      {/* Quick Navigation Cards Grid */}
      <div className="grid-3">
        {(role === 'SUPER_ADMIN' || role === 'UNIVERSITY_ADMIN' || role === 'PRINCIPAL') && (
          <div className="card card-hover" style={{ padding: '1.5rem', borderTop: '4px solid var(--brand-navy)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: 'var(--brand-navy-subtle)', color: 'var(--brand-navy)' }}>
                <FileSignature size={24} />
              </div>
              <Badge variant="navy">Admin Setup</Badge>
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '0.5rem' }}>
              Exam Master &amp; Fees
            </h3>
            <p style={{ fontSize: '0.84375rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Configure examination dates, deadlines, base fees, per-subject fees, and late penalties.
            </p>
            <button className="btn btn-navy btn-sm" onClick={() => setActiveTab('exams')}>
              Open Exam Master <ArrowRight size={14} />
            </button>
          </div>
        )}

        <div className="card card-hover" style={{ padding: '1.5rem', borderTop: '4px solid var(--brand-orange)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: 'var(--brand-orange-light)', color: 'var(--brand-orange)' }}>
              <FileCheck size={24} />
            </div>
            <Badge variant="orange">Forms Portal</Badge>
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '0.5rem' }}>
            Exam Form &amp; Verification
          </h3>
          <p style={{ fontSize: '0.84375rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            {role === 'STUDENT' ? 'Check eligibility, select subjects, upload documents, and submit exam form.' : 'Review uploaded student documents and verify registration applications.'}
          </p>
          <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('exam-forms')}>
            Go to Exam Forms <ArrowRight size={14} />
          </button>
        </div>

        <div className="card card-hover" style={{ padding: '1.5rem', borderTop: '4px solid #10B981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: '#ECFDF5', color: '#10B981' }}>
              <ShieldCheck size={24} />
            </div>
            <Badge variant="active">Admit Card</Badge>
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '0.5rem' }}>
            Hall Ticket &amp; Admit Card
          </h3>
          <p style={{ fontSize: '0.84375rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Generate, view, and download official Hall Tickets with seating plan &amp; timetable details.
          </p>
          <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('exam-hallticket')}>
            View Hall Ticket <ArrowRight size={14} />
          </button>
        </div>

        {(role === 'SUPER_ADMIN' || role === 'UNIVERSITY_ADMIN' || role === 'HOD' || role === 'FACULTY') && (
          <div className="card card-hover" style={{ padding: '1.5rem', borderTop: '4px solid var(--brand-cyan)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: 'var(--brand-cyan-light)', color: 'var(--brand-cyan)' }}>
                <FileText size={24} />
              </div>
              <Badge variant="navy">Evaluation</Badge>
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '0.5rem' }}>
              Marks Entry &amp; Evaluation
            </h3>
            <p style={{ fontSize: '0.84375rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Input internal (30) and external (70) marks for assigned subjects prior to result publication.
            </p>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('exam-marks')}>
              Marks Management <ArrowRight size={14} />
            </button>
          </div>
        )}

        <div className="card card-hover" style={{ padding: '1.5rem', borderTop: '4px solid #8B5CF6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: '#F3E8FF', color: '#8B5CF6' }}>
              <Award size={24} />
            </div>
            <Badge variant="gold">Scorecard</Badge>
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '0.5rem' }}>
            Result Management &amp; Marksheet
          </h3>
          <p style={{ fontSize: '0.84375rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Calculate SGPA/CGPA, publish examination results, and download official university marksheets.
          </p>
          <button className="btn btn-gold btn-sm" onClick={() => setActiveTab('exam-results')}>
            View Results <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Active Exam Timetable Overview Table */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
            Upcoming Examination Schedule
          </h3>
          <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('exam-schedule')}>
            View Full Timetable
          </button>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Exam Name</th>
                <th>Type</th>
                <th>Dates</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {exams.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No exams scheduled.</td></tr>
              ) : (
                exams.map(exam => (
                  <tr key={exam.id}>
                    <td style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>{exam.name}</td>
                    <td><Badge variant="orange">{exam.type}</Badge></td>
                    <td style={{ fontSize: '0.84375rem' }}>{exam.startDate} to {exam.endDate}</td>
                    <td>
                      <Badge variant={exam.status === 'RESULTS_PUBLISHED' ? 'active' : exam.status === 'SCHEDULED' ? 'navy' : 'warning'}>
                        {exam.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('exam-schedule')}>
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
