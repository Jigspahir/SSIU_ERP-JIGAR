import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/common/Badge';
import { ExcelTableContainer, ExcelTable, ExcelTh, ExcelTd } from '../../components/common/ExcelTable';
import { Modal } from '../../components/common/Modal';
import { 
  Bell, Plus, Pin, Calendar, FileText, Download, Eye, 
  CheckCircle, Building, User, Info, Loader2
} from 'lucide-react';
import { downloadNoticePdf } from '../../services/noticePdfService';

interface NoticeItem {
  id: string;
  title: string;
  category: 'ACADEMIC' | 'EXAM' | 'HOLIDAY' | 'FEES' | 'EVENT' | 'ADMINISTRATIVE' | 'GENERAL';
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
  },
  {
    id: 'not-3',
    title: 'Final Year Major Project Submission Guidelines & Review Dates',
    category: 'ACADEMIC',
    publishedDate: '2024-03-10',
    content: 'Final year students must submit their complete thesis documentation and GitHub repository links before 15th April 2024. Departmental viva voce will follow.',
    isPinned: false,
    publishedBy: 'Dean of Academic Affairs'
  },
  {
    id: 'not-4',
    title: 'Even Semester Fee Payment Deadline & Online Receipt Verification',
    category: 'FEES',
    publishedDate: '2024-03-12',
    content: 'Students who have pending fee dues for Semester 4/6/8 are advised to clear them before 20th March to avoid examination registration hold.',
    isPinned: false,
    publishedBy: 'Accounts Department'
  }
];

export const NoticesPage: React.FC = () => {
  const { role } = useAuth();
  const [notices, setNotices] = useState<NoticeItem[]>(initialNotices);
  const [showModal, setShowModal] = useState(false);
  const [viewNotice, setViewNotice] = useState<NoticeItem | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<NoticeItem['category']>('ACADEMIC');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);

  const handlePostNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    const newNot: NoticeItem = {
      id: `not-${Date.now()}`,
      title: title.trim(),
      category,
      publishedDate: new Date().toISOString().split('T')[0],
      content: content.trim(),
      isPinned,
      publishedBy: 'University Administration'
    };

    setNotices([newNot, ...notices]);
    setShowModal(false);
    setTitle('');
    setContent('');
    setIsPinned(false);
    showToast('success', `Notice "${newNot.title}" published successfully.`);
  };

  const handleDownloadNotice = async (n: NoticeItem, index: number, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (downloadingId) return; // Prevent concurrent downloads

    setDownloadingId(n.id);
    showToast('info', `Generating PDF for "${n.title}"...`);

    try {
      const success = await downloadNoticePdf({
        ...n,
        serialNo: index + 1
      });

      if (success) {
        showToast('success', 'Official Notice PDF downloaded.');
      } else {
        showToast('error', 'Unable to generate PDF. Please try again.');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'An error occurred during PDF generation.');
    } finally {
      setDownloadingId(null);
    }
  };

  const getCategoryBadge = (cat: NoticeItem['category']) => {
    switch (cat) {
      case 'EXAM': return <Badge variant="orange">EXAM</Badge>;
      case 'HOLIDAY': return <Badge variant="danger">HOLIDAY</Badge>;
      case 'ACADEMIC': return <Badge variant="navy">ACADEMIC</Badge>;
      case 'FEES': return <Badge variant="active">FEES</Badge>;
      case 'EVENT': return <Badge variant="gold">EVENT</Badge>;
      case 'ADMINISTRATIVE': return <Badge variant="inactive">ADMIN</Badge>;
      default: return <Badge variant="navy">GENERAL</Badge>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 1000,
          backgroundColor: toastMessage.type === 'success' ? '#10B981' : toastMessage.type === 'error' ? '#EF4444' : 'var(--brand-navy)',
          color: '#FFFFFF', padding: '0.75rem 1.25rem', borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)', fontWeight: 600, fontSize: '0.8125rem',
          display: 'flex', alignItems: 'center', gap: '0.5rem'
        }}>
          {toastMessage.type === 'info' && <Loader2 size={15} className="animate-spin" />}
          {toastMessage.text}
        </div>
      )}

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.3125rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
            Official Notice Board &amp; Campus Circulars
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Swarrnim Startup &amp; Innovation University Official Circulars, Exam Notices &amp; Administrative Bulletins
          </p>
        </div>

        {(role === 'SUPER_ADMIN' || role === 'UNIVERSITY_ADMIN' || role === 'PRINCIPAL') && (
          <button 
            type="button"
            onClick={() => setShowModal(true)} 
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, background: 'var(--brand-orange, #F37023)', borderColor: 'var(--brand-orange, #F37023)' }}
          >
            <Plus size={15} /> Post New Notice
          </button>
        )}
      </div>

      {/* Excel-Style Notice Board Table */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <ExcelTableContainer minWidth="100%">
          <ExcelTable>
            <thead>
              <tr>
                <ExcelTh align="center" style={{ width: '80px', minWidth: '80px' }}>SR. NO.</ExcelTh>
                <ExcelTh align="center" style={{ width: '140px', minWidth: '140px' }}>NOTICE DATE</ExcelTh>
                <ExcelTh align="center" style={{ width: '140px', minWidth: '140px' }}>NOTICE TYPE</ExcelTh>
                <ExcelTh align="left" style={{ minWidth: '280px' }}>NOTICE TITLE</ExcelTh>
              </tr>
            </thead>
            <tbody>
              {notices.length === 0 ? (
                <tr>
                  <ExcelTd colSpan={4} align="center" style={{ padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                    <Bell size={40} style={{ margin: '0 auto 0.75rem auto', color: 'var(--border-color)', opacity: 0.6 }} />
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9375rem', color: 'var(--brand-navy)' }}>No notices posted yet</p>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.78125rem' }}>Official campus circulars will appear here</p>
                  </ExcelTd>
                </tr>
              ) : (
                notices.map((n, idx) => {
                  const isDownloading = downloadingId === n.id;
                  return (
                    <tr 
                      key={n.id} 
                      style={{ 
                        background: n.isPinned ? 'rgba(243, 112, 35, 0.03)' : undefined,
                        cursor: 'pointer'
                      }}
                      onClick={(e) => handleDownloadNotice(n, idx, e)}
                      title="Click to download official PDF notice"
                    >
                      <ExcelTd align="center" mono color="var(--brand-navy)">
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 700 }}>
                          {n.isPinned && <Pin size={13} color="var(--brand-orange, #F37023)" />}
                          <span>{idx + 1}</span>
                        </div>
                      </ExcelTd>

                      <ExcelTd align="center">
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{n.publishedDate}</span>
                      </ExcelTd>

                      <ExcelTd align="center">
                        {getCategoryBadge(n.category)}
                      </ExcelTd>

                      <ExcelTd align="left">
                        <div 
                          style={{ 
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '0.5rem'
                          }}
                        >
                          <span 
                            style={{ 
                              fontWeight: 600, 
                              color: 'var(--brand-navy)',
                              lineHeight: 1.35,
                              fontSize: '0.84375rem',
                              transition: 'color 0.15s ease'
                            }}
                            className="hover:underline"
                          >
                            {n.title}
                          </span>

                          <span 
                            style={{ 
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              fontSize: '0.71875rem',
                              fontWeight: 600,
                              color: isDownloading ? 'var(--brand-orange)' : 'var(--text-muted)',
                              flexShrink: 0,
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              backgroundColor: 'rgba(0,0,0,0.03)'
                            }}
                          >
                            {isDownloading ? (
                              <>
                                <Loader2 size={12} className="animate-spin" />
                                <span>Generating...</span>
                              </>
                            ) : (
                              <>
                                <Download size={12} />
                                <span>PDF</span>
                              </>
                            )}
                          </span>
                        </div>
                      </ExcelTd>
                    </tr>
                  );
                })
              )}
            </tbody>
          </ExcelTable>
        </ExcelTableContainer>

        <div style={{ marginTop: '0.85rem', fontSize: '0.78125rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          Showing {notices.length} Notices • Click any notice to download official PDF
        </div>
      </div>

      {/* VIEW NOTICE MODAL */}
      {viewNotice && (
        <Modal
          isOpen={Boolean(viewNotice)}
          onClose={() => setViewNotice(null)}
          title="Official Notice Details"
          subtitle={`Published on ${viewNotice.publishedDate} • Issued by ${viewNotice.publishedBy}`}
          maxWidth="640px"
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              {viewNotice.fileUrl ? (
                <a
                  href={viewNotice.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', background: 'var(--brand-orange, #F37023)', borderColor: 'var(--brand-orange, #F37023)' }}
                >
                  <Download size={14} /> Download Circular PDF
                </a>
              ) : <div />}
              <button 
                type="button" 
                onClick={() => setViewNotice(null)} 
                className="btn btn-secondary"
                style={{ minWidth: '90px' }}
              >
                Close
              </button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {viewNotice.isPinned && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--brand-orange, #F37023)', fontSize: '0.75rem', fontWeight: 700 }}>
                  <Pin size={13} /> PINNED NOTICE
                </span>
              )}
              {getCategoryBadge(viewNotice.category)}
            </div>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--brand-navy)', margin: 0, lineHeight: 1.4 }}>
              {viewNotice.title}
            </h3>

            <div style={{ padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '0.875rem', lineHeight: 1.6, color: '#1E293B', whiteSpace: 'pre-line' }}>
              {viewNotice.content}
            </div>

            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', borderTop: '1px solid #E2E8F0', paddingTop: '0.75rem' }}>
              <strong>Authority:</strong> {viewNotice.publishedBy}
            </div>
          </div>
        </Modal>
      )}

      {/* POST NEW NOTICE MODAL */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Post Official Notice"
          subtitle="Publish a formal circular to student and faculty portals"
          maxWidth="560px"
        >
          <form onSubmit={handlePostNotice} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--brand-navy)' }}>
                Notice Title *
              </label>
              <input 
                type="text" 
                required 
                className="input-field" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="e.g. Mid-Sem Exam Schedule Announcement" 
                style={{ width: '100%', height: '40px', fontSize: '0.85rem', borderColor: '#CBD5E1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--brand-navy)' }}>
                Category *
              </label>
              <select 
                className="input-field" 
                value={category} 
                onChange={e => setCategory(e.target.value as any)}
                style={{ width: '100%', height: '40px', fontSize: '0.85rem', borderColor: '#CBD5E1' }}
              >
                <option value="ACADEMIC">ACADEMIC</option>
                <option value="EXAM">EXAMINATION</option>
                <option value="HOLIDAY">HOLIDAY</option>
                <option value="FEES">FEES &amp; FINANCE</option>
                <option value="EVENT">CAMPUS EVENT</option>
                <option value="ADMINISTRATIVE">ADMINISTRATIVE</option>
                <option value="GENERAL">GENERAL</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--brand-navy)' }}>
                Notice Details *
              </label>
              <textarea 
                required 
                className="input-field" 
                rows={5} 
                value={content} 
                onChange={e => setContent(e.target.value)} 
                placeholder="Type circular content in full detail..." 
                style={{ width: '100%', minHeight: '120px', resize: 'vertical', fontSize: '0.85rem', padding: '0.75rem', borderColor: '#CBD5E1', borderRadius: '6px' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 0.85rem', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
              <input 
                type="checkbox" 
                id="pin-notice" 
                checked={isPinned} 
                onChange={e => setIsPinned(e.target.checked)} 
                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--brand-orange, #F37023)' }}
              />
              <label htmlFor="pin-notice" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--brand-navy)', cursor: 'pointer' }}>
                Pin as Important Notice at Top of Register
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', borderTop: '1px solid #E2E8F0', paddingTop: '1rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                style={{ background: 'var(--brand-orange, #F37023)', borderColor: 'var(--brand-orange, #F37023)', fontWeight: 700 }}
              >
                Publish Notice
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};
export default NoticesPage;
