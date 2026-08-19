// ==============================================================================
// SWARRNIM UNIVERSITY ERP — STUDENT PROFILE-FIRST SEARCH & DIRECTORY
// ==============================================================================

import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { studentProfileAccessService, StudentIdentitySummary } from '../../services/studentProfileAccessService';
import { StudentProfileModal, StudentProfileTabType } from '../../components/profile/StudentProfileModal';
import { Student } from '../../types';
import { Badge } from '../../components/common/Badge';
import { StatCard } from '../../components/common/StatCard';
import { 
  Users, Search, Filter, GraduationCap, Building2, BookOpen, 
  Eye, ShieldCheck, AlertCircle, RefreshCw, ChevronLeft, ChevronRight, UserCheck, Award
} from 'lucide-react';

interface StudentDirectorySearchPageProps {
  initialSearchQuery?: string;
  initialRecordId?: string;
  initialStudentId?: string;
  initialTab?: StudentProfileTabType;
  initialDocId?: string;
}

export const StudentDirectorySearchPage: React.FC<StudentDirectorySearchPageProps> = ({
  initialSearchQuery = '',
  initialRecordId,
  initialStudentId,
  initialTab = 'OVERVIEW',
  initialDocId
}) => {
  const { user, role } = useAuth();
  const isStudent = role === 'STUDENT';

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery);
  const [filterInstitute, setFilterInstitute] = useState<string>('ALL');
  const [filterDepartment, setFilterDepartment] = useState<string>('ALL');
  const [filterProgram, setFilterProgram] = useState<string>('ALL');
  const [filterSemester, setFilterSemester] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterStudentType, setFilterStudentType] = useState<string>('ALL');
  const [page, setPage] = useState<number>(1);
  const limit = 12;

  // Selected Student Profile Modal State
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [activeProfileTab, setActiveProfileTab] = useState<StudentProfileTabType>(initialTab);
  const [activeDocId, setActiveDocId] = useState<string | undefined>(initialDocId);
  const [refreshKey, setRefreshKey] = useState(0);

  // Deep link auto-open student profile
  useEffect(() => {
    const targetId = initialRecordId || initialStudentId;
    if (targetId && user && role) {
      const student = db.getStudents().find(s => s.id === targetId || s.enrollmentNo === targetId);
      if (student) {
        if (studentProfileAccessService.isUserAuthorizedForStudent(user, role, student)) {
          setSelectedStudent(student);
          if (initialTab) setActiveProfileTab(initialTab);
          if (initialDocId) setActiveDocId(initialDocId);
        }
      }
    }
  }, [initialRecordId, initialStudentId, initialTab, initialDocId, user, role]);

  // Master Data Lookups for Filters
  const institutes = useMemo(() => db.getInstitutes(), []);
  const departments = useMemo(() => {
    const all = db.getDepartments();
    if (filterInstitute !== 'ALL') {
      return all.filter(d => d.instituteId === filterInstitute);
    }
    return all;
  }, [filterInstitute]);
  const programs = useMemo(() => {
    const all = db.getPrograms();
    if (filterDepartment !== 'ALL') {
      return all.filter(p => p.departmentId === filterDepartment);
    }
    if (filterInstitute !== 'ALL') {
      return all.filter(p => p.instituteId === filterInstitute);
    }
    return all;
  }, [filterInstitute, filterDepartment]);
  const semesters = useMemo(() => db.getSemesters(), []);

  // Execute Search via Central Authorized Service
  const searchResults = useMemo(() => {
    if (isStudent || !user || !role) {
      return { records: [], total: 0, page: 1, totalPages: 1 };
    }

    try {
      return studentProfileAccessService.searchStudents(
        user,
        role,
        searchQuery,
        {
          instituteId: filterInstitute,
          departmentId: filterDepartment,
          programId: filterProgram,
          semesterId: filterSemester,
          status: filterStatus,
          studentType: filterStudentType
        },
        page,
        limit
      );
    } catch (err) {
      return { records: [], total: 0, page: 1, totalPages: 1 };
    }
  }, [user, role, isStudent, searchQuery, filterInstitute, filterDepartment, filterProgram, filterSemester, filterStatus, filterStudentType, page, limit, refreshKey]);

  // Total Students Scoped
  const totalScopedCount = useMemo(() => {
    if (!user || !role || isStudent) return 0;
    return db.getStudents().filter(s => studentProfileAccessService.isUserAuthorizedForStudent(user, role, s)).length;
  }, [user, role, isStudent, refreshKey]);

  // Open Profile Handler
  const handleOpenProfile = (studentSummary: StudentIdentitySummary, targetTab: StudentProfileTabType = 'OVERVIEW') => {
    const fullStudent = db.getStudents().find(s => s.id === studentSummary.id);
    if (fullStudent) {
      setSelectedStudent(fullStudent);
      setActiveProfileTab(targetTab);
    }
  };

  if (isStudent) {
    return (
      <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
        <AlertCircle size={48} color="#EF4444" style={{ margin: '0 auto 1rem auto' }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)' }}>Access Restricted</h3>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          Students are not authorized to use the global student directory search. Please visit <strong>My Profile</strong> to manage your personal records.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--brand-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={24} color="var(--brand-orange)" /> Student Directory &amp; Profile Search
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Search authorized students by name, enrollment number, program, or department. Select a student to inspect their full profile and document vault.
          </p>
        </div>

        <button 
          className="btn btn-secondary btn-sm" 
          onClick={() => setRefreshKey(k => k + 1)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <RefreshCw size={14} /> Refresh Directory
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid-4">
        <StatCard
          icon={Users}
          title="Authorized Students"
          value={totalScopedCount}
          subtitle="In your role & institute scope"
          colorScheme="blue"
        />
        <StatCard
          icon={Search}
          title="Search Results"
          value={searchResults.total}
          subtitle={`Page ${searchResults.page} of ${searchResults.totalPages}`}
          colorScheme="orange"
        />
        <StatCard
          icon={Building2}
          title="Institute Scope"
          value={user?.instituteId ? 'SCOPED' : 'ALL INSTITUTES'}
          subtitle={user?.instituteId || 'University Wide'}
          colorScheme="gold"
        />
        <StatCard
          icon={ShieldCheck}
          title="Access Governance"
          value="PROFILE-FIRST"
          subtitle="Direct doc access blocked"
          colorScheme="green"
        />
      </div>

      {/* Search & Filter Bar */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Main Search Input */}
          <div style={{ position: 'relative' }}>
            <Search 
              size={18} 
              color="var(--brand-navy)" 
              style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} 
            />
            <input
              type="text"
              className="form-control"
              placeholder="Search by Student Name, Enrollment Number (e.g. SIT-CE-001), Student ID, Email, Phone, or ABC ID..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              style={{ paddingLeft: '2.75rem', fontSize: '0.9375rem', height: '46px' }}
            />
          </div>

          {/* Filter Dropdowns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Institute</label>
              <select 
                className="form-control" 
                value={filterInstitute} 
                onChange={e => {
                  setFilterInstitute(e.target.value);
                  setFilterDepartment('ALL');
                  setFilterProgram('ALL');
                  setPage(1);
                }}
              >
                <option value="ALL">All Institutes</option>
                {institutes.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Department</label>
              <select 
                className="form-control" 
                value={filterDepartment} 
                onChange={e => {
                  setFilterDepartment(e.target.value);
                  setFilterProgram('ALL');
                  setPage(1);
                }}
              >
                <option value="ALL">All Departments</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Program</label>
              <select 
                className="form-control" 
                value={filterProgram} 
                onChange={e => {
                  setFilterProgram(e.target.value);
                  setPage(1);
                }}
              >
                <option value="ALL">All Programs</option>
                {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Semester</label>
              <select 
                className="form-control" 
                value={filterSemester} 
                onChange={e => {
                  setFilterSemester(e.target.value);
                  setPage(1);
                }}
              >
                <option value="ALL">All Semesters</option>
                {semesters.map(s => <option key={s.id} value={s.id}>{s.code} (Sem {s.number})</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Status</label>
              <select 
                className="form-control" 
                value={filterStatus} 
                onChange={e => {
                  setFilterStatus(e.target.value);
                  setPage(1);
                }}
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="GRADUATED">Graduated</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results Grid / Minimal Identity Preview Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Showing {searchResults.records.length} of {searchResults.total} students found
          </div>
        </div>

        {searchResults.records.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
            <Users size={40} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem auto' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--brand-navy)' }}>No Students Found</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Try adjusting your search keywords or clearing filter criteria.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
            {searchResults.records.map(student => (
              <div 
                key={student.id} 
                className="card" 
                style={{ 
                  padding: '1.25rem', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  gap: '1rem',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  border: '1px solid var(--border-color)'
                }}
              >
                {/* Header: Photo + Name + Badges */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <img
                    src={student.photo || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80'}
                    alt={student.name}
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid var(--brand-orange)',
                      flexShrink: 0
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--brand-navy)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>
                      {student.name}
                    </h4>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--brand-orange)', fontWeight: 700, marginTop: '0.15rem' }}>
                      {student.enrollmentNo}
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                      <Badge variant={student.status === 'ACTIVE' ? 'active' : 'inactive'}>{student.status}</Badge>
                      <Badge variant="gold">{student.studentType}</Badge>
                    </div>
                  </div>
                </div>

                {/* Academic Placement Metadata */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8125rem', background: 'var(--bg-surface-hover)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  <div><span style={{ color: 'var(--text-muted)' }}>Program:</span> <strong>{student.programName}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Department:</span> <strong>{student.departmentName}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Institute:</span> <strong>{student.instituteName}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Semester:</span> <strong>Semester {student.semesterNumber}</strong> ({student.divisionName})</div>
                </div>

                {/* Actions: View Profile */}
                <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleOpenProfile(student, 'OVERVIEW')}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                  >
                    <Eye size={14} /> View Student Profile
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleOpenProfile(student, 'DOCUMENTS')}
                    title="Open Document Vault"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
                  >
                    <ShieldCheck size={14} /> Documents
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {searchResults.totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
            <button
              className="btn btn-secondary btn-sm"
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Page {searchResults.page} of {searchResults.totalPages}
            </span>
            <button
              className="btn btn-secondary btn-sm"
              disabled={page >= searchResults.totalPages}
              onClick={() => setPage(p => Math.min(searchResults.totalPages, p + 1))}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Authorized Student Profile Central Gateway */}
      {selectedStudent && (
        <StudentProfileModal
          isOpen={Boolean(selectedStudent)}
          onClose={() => setSelectedStudent(null)}
          student={selectedStudent}
          initialTab={activeProfileTab}
          initialDocId={activeDocId}
        />
      )}
    </div>
  );
};
