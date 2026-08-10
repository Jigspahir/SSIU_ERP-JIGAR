import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Badge } from '../../components/common/Badge';
import { SessionPlanTopic } from '../../types';
import { BookOpen, CheckCircle2, Clock, Plus, Layers, Filter } from 'lucide-react';

export const SessionPlanPage: React.FC = () => {
  const { user, role } = useAuth();

  const subjects = db.getSubjects();
  const sessionPlanTopics = db.getSessionPlanTopics();

  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [isAddTopicModalOpen, setIsAddTopicModalOpen] = useState(false);

  // Add Topic Form State
  const [unitNo, setUnitNo] = useState(1);
  const [lectureNo, setLectureNo] = useState(1);
  const [topicTitle, setTopicTitle] = useState('');
  const [teachingMethod, setTeachingMethod] = useState<'Chalk & Board' | 'PPT Presentation' | 'Lab Demonstration' | 'Interactive Case Study'>('PPT Presentation');
  const [plannedDate, setPlannedDate] = useState(new Date().toISOString().split('T')[0]);

  const filteredTopics = sessionPlanTopics.filter(t => t.subjectId === selectedSubjectId || selectedSubjectId === 'ALL');
  const completedCount = filteredTopics.filter(t => t.status === 'COMPLETED').length;
  const progressPct = filteredTopics.length > 0 ? Math.round((completedCount / filteredTopics.length) * 100) : 0;

  const handleToggleStatus = (topicId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    db.updateEntity<SessionPlanTopic>('sessionPlanTopics', topicId, {
      status: nextStatus as any,
      completedDate: nextStatus === 'COMPLETED' ? new Date().toISOString().split('T')[0] : undefined
    }, `Updated session plan topic status to ${nextStatus}`);
  };

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    const newTopic: Omit<SessionPlanTopic, 'id'> = {
      subjectId: selectedSubjectId,
      unitNo: Number(unitNo),
      lectureNo: Number(lectureNo),
      topicTitle,
      teachingMethod,
      plannedDate,
      status: 'PENDING',
      facultyId: user?.id || 'fac-1'
    };

    db.addEntity<SessionPlanTopic>('sessionPlanTopics', newTopic, `Added session plan topic: ${topicTitle}`);
    setIsAddTopicModalOpen(false);
    setTopicTitle('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
            Course Session Plan &amp; Syllabus Coverage
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            {role === 'STUDENT' ? 'Track syllabus completion & upcoming topic schedule' : role === 'FACULTY' ? 'Manage topic schedule, lecture planning & mark completion' : 'Monitor syllabus coverage across university subjects'}
          </p>
        </div>

        {role !== 'STUDENT' && (
          <button className="btn btn-primary" onClick={() => setIsAddTopicModalOpen(true)}>
            <Plus size={16} /> Add Session Topic
          </button>
        )}
      </div>

      {/* Subject Filter & Progress Bar Card */}
      <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #0F2C59 0%, #183B70 100%)', color: '#FFFFFF' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-gold)', textTransform: 'uppercase' }}>Select Subject</div>
            <select
              className="form-select"
              value={selectedSubjectId}
              onChange={e => setSelectedSubjectId(e.target.value)}
              style={{ minWidth: '260px', marginTop: '0.35rem', backgroundColor: '#FFFFFF', color: 'var(--brand-navy)', fontWeight: 700 }}
            >
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
            </select>
          </div>

          <div style={{ minWidth: '240px', flex: 1, maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              <span>Syllabus Completion</span>
              <span style={{ color: 'var(--brand-gold)' }}>{progressPct}% ({completedCount} / {filteredTopics.length} Topics)</span>
            </div>
            <div style={{ height: '10px', borderRadius: '5px', backgroundColor: 'rgba(255,255,255,0.2)', overflow: 'hidden' }}>
              <div style={{ width: `${progressPct}%`, height: '100%', backgroundColor: 'var(--brand-orange)', transition: 'width 0.3s ease' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Session Topics Table */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Unit &amp; Lecture #</th>
                <th>Topic Title</th>
                <th>Teaching Method</th>
                <th>Planned Date</th>
                <th>Completed Date</th>
                <th>Status</th>
                {role !== 'STUDENT' && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {filteredTopics.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No session topics created for this subject yet.
                  </td>
                </tr>
              ) : (
                filteredTopics.map(topic => (
                  <tr key={topic.id}>
                    <td>
                      <span style={{ fontWeight: 800, color: 'var(--brand-navy)' }}>Unit {topic.unitNo}</span> • Lec #{topic.lectureNo}
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--brand-navy)', maxWidth: '300px' }}>
                      {topic.topicTitle}
                    </td>
                    <td>
                      <Badge variant="orange">{topic.teachingMethod}</Badge>
                    </td>
                    <td>{topic.plannedDate}</td>
                    <td>{topic.completedDate || '-'}</td>
                    <td>
                      <Badge variant={topic.status === 'COMPLETED' ? 'active' : 'inactive'}>
                        {topic.status}
                      </Badge>
                    </td>
                    {role !== 'STUDENT' && (
                      <td>
                        <button
                          className={`btn ${topic.status === 'COMPLETED' ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                          onClick={() => handleToggleStatus(topic.id, topic.status)}
                        >
                          {topic.status === 'COMPLETED' ? 'Mark Pending' : 'Mark Completed'}
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Topic Modal */}
      {isAddTopicModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1.25rem' }}>
              Add Session Plan Topic
            </h3>

            <form onSubmit={handleCreateTopic} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Unit Number *</label>
                  <input type="number" className="form-input" min={1} max={10} value={unitNo} onChange={e => setUnitNo(Number(e.target.value))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Lecture Number *</label>
                  <input type="number" className="form-input" min={1} max={50} value={lectureNo} onChange={e => setLectureNo(Number(e.target.value))} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Topic Title *</label>
                <input type="text" className="form-input" placeholder="e.g. Relational Normalization 3NF & BCNF" value={topicTitle} onChange={e => setTopicTitle(e.target.value)} required />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Teaching Method *</label>
                  <select className="form-select" value={teachingMethod} onChange={e => setTeachingMethod(e.target.value as any)}>
                    <option value="PPT Presentation">PPT Presentation</option>
                    <option value="Chalk & Board">Chalk &amp; Board</option>
                    <option value="Lab Demonstration">Lab Demonstration</option>
                    <option value="Interactive Case Study">Interactive Case Study</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Planned Date *</label>
                  <input type="date" className="form-input" value={plannedDate} onChange={e => setPlannedDate(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddTopicModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Topic</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
