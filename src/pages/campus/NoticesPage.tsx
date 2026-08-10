import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/common/Badge';
import { Bell, Plus, Pin, Calendar, FileText, Download } from 'lucide-react';

interface NoticeItem {
  id: string;
  title: string;
  category: 'ACADEMIC' | 'EXAM' | 'HOLIDAY' | 'FEES' | 'EVENT';
  publishedDate: string;
  content: string;
  isPinned: boolean;
  publishedBy: string;
  fileUrl?: string;
}

const initialNotices: NoticeItem[] = [
  {
    id: 'not-1',
    title: 'Mid-Semester Examination Schedule & Time Table Announcement',
    category: 'EXAM',
    publishedDate: '2024-03-01',
    content: 'All B.Tech Computer Engineering students are informed that Mid-Semester Examinations will commence from 25th March 2024. Detailed timetable has been published on portal.',
    isPinned: true,
    publishedBy: 'Controller of Examinations',
    fileUrl: 'https://swarrnim.edu.in/docs/exam-notice.pdf'
  },
  {
    id: 'not-2',
    title: 'Holi Festival Holiday Announcement & Hostel Timings',
    category: 'HOLIDAY',
    publishedDate: '2024-03-05',
    content: 'University will remain closed on 25th and 26th March 2024 on account of Holi festival. Normal academic schedule resumes on 27th March.',
    isPinned: false,
    publishedBy: 'Registrar Office'
  }
];

export const NoticesPage: React.FC = () => {
  const { role } = useAuth();
  const [notices, setNotices] = useState<NoticeItem[]>(initialNotices);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<NoticeItem['category']>('ACADEMIC');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);

  const handlePostNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    const newNot: NoticeItem = {
      id: `not-${Date.now()}`,
      title,
      category,
      publishedDate: new Date().toISOString().split('T')[0],
      content,
      isPinned,
      publishedBy: 'University Administration'
    };

    setNotices([newNot, ...notices]);
    setShowModal(false);
    setTitle('');
    setContent('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
            Official Notice Board &amp; Campus Circulars
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Swarrnim Startup &amp; Innovation University Official Circulars, Exam Notices &amp; Administrative Bulletins
          </p>
        </div>

        {(role === 'SUPER_ADMIN' || role === 'UNIVERSITY_ADMIN' || role === 'PRINCIPAL') && (
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            <Plus size={16} /> Post New Notice
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {notices.map(n => (
          <div key={n.id} className="card" style={{ padding: '1.5rem', borderLeft: n.isPinned ? '5px solid var(--brand-orange)' : '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  {n.isPinned && <Pin size={16} color="var(--brand-orange)" />}
                  <Badge variant={n.category === 'EXAM' ? 'orange' : 'navy'}>{n.category}</Badge>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{n.publishedDate}</span>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '0.5rem' }}>{n.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: 1.5 }}>{n.content}</p>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem', fontWeight: 600 }}>
                  Issued by: {n.publishedBy}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '540px', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                Post Official Notice
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
            </div>

            <form onSubmit={handlePostNotice} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              <div className="form-group">
                <label className="form-label">Notice Title *</label>
                <input type="text" required className="form-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Mid-Sem Exam Schedule Announcement" />
              </div>

              <div className="form-group">
                <label className="form-label">Category *</label>
                <select className="form-select" value={category} onChange={e => setCategory(e.target.value as any)}>
                  <option value="ACADEMIC">ACADEMIC</option>
                  <option value="EXAM">EXAMINATION</option>
                  <option value="HOLIDAY">HOLIDAY</option>
                  <option value="FEES">FEES &amp; FINANCE</option>
                  <option value="EVENT">CAMPUS EVENT</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Notice Details *</label>
                <textarea required className="form-input" rows={4} value={content} onChange={e => setContent(e.target.value)} placeholder="Type circular content..." />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" id="pin" checked={isPinned} onChange={e => setIsPinned(e.target.checked)} />
                <label htmlFor="pin" style={{ fontSize: '0.875rem', fontWeight: 600 }}>Pin as Important Notice at Top</label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Publish Notice</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
