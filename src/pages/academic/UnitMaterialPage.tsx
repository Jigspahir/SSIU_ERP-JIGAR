import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Badge } from '../../components/common/Badge';
import { UnitMaterial } from '../../types';
import { FileText, Download, Plus, Trash2, BookOpen, Filter, Search, Eye } from 'lucide-react';
import { fileStorage } from '../../services/fileStorage';

export const UnitMaterialPage: React.FC = () => {
  const { user, role } = useAuth();

  const subjects = db.getSubjects();
  const materials = db.getUnitMaterials();

  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || 'ALL');
  const [selectedUnitNo, setSelectedUnitNo] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Upload Form State
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [unitNo, setUnitNo] = useState(1);
  const [unitTitle, setUnitTitle] = useState('Unit 1: ER Modeling & Architecture');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const filteredMaterials = materials.filter(m => {
    const matchesSubject = selectedSubjectId === 'ALL' || m.subjectId === selectedSubjectId;
    const matchesUnit = selectedUnitNo === 'ALL' || String(m.unitNo) === selectedUnitNo;
    const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase()) || m.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSubject && matchesUnit && matchesSearch;
  });

  const handleUploadMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      alert('Please select a file to upload.');
      return;
    }
    
    setIsUploading(true);
    try {
      const fileId = await fileStorage.saveFile(uploadFile);
      
      let fileExt = uploadFile.name.split('.').pop()?.toUpperCase() || 'FILE';
      if (fileExt.length > 4) fileExt = 'FILE';

      const newMaterial: Omit<UnitMaterial, 'id'> = {
        subjectId,
        unitNo: Number(unitNo),
        unitTitle,
        title,
        description,
        fileType: fileExt as any,
        fileSize: (uploadFile.size / (1024 * 1024)).toFixed(2) + ' MB',
        fileUrl: fileId,
        uploadedByFacultyId: user?.id || 'fac-1',
        uploadedByFacultyName: user?.name || 'Prof. Demo Faculty',
        uploadedDate: new Date().toISOString().split('T')[0]
      };

      db.addEntity<UnitMaterial>('unitMaterials', newMaterial, `Uploaded study material: ${title}`);
      db.addNotification({
        title: `New Study Material: ${title}`,
        message: `Unit ${unitNo}: ${unitTitle} study reference material published by ${user?.name || 'Faculty'}.`,
        module: 'MATERIAL',
        timestamp: 'Just now',
        targetRole: 'STUDENT',
        linkTab: 'materials'
      });
      setIsUploadModalOpen(false);
      setTitle('');
      setDescription('');
      setUploadFile(null);
    } catch (err) {
      console.error(err);
      alert('Failed to upload file.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    if (window.confirm('Delete this study material entry?')) {
      const material = materials.find(m => m.id === id);
      if (material && material.fileUrl.startsWith('idb://')) {
        await fileStorage.deleteFile(material.fileUrl);
      }
      db.deleteEntity('unitMaterials', id, 'Deleted study material');
    }
  };

  const handleDownload = (fileUrl: string, title: string) => {
    fileStorage.downloadFile(fileUrl, title);
  };

  const handleView = (fileUrl: string) => {
    fileStorage.viewFile(fileUrl);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
            Unit Study Material &amp; Course Library
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            {role === 'STUDENT' ? 'Access, preview, and download unit lecture notes & slide decks' : role === 'FACULTY' ? 'Upload, manage, and share unit study notes & presentations' : 'Monitor uploaded study resources across all departments'}
          </p>
        </div>

        {role !== 'STUDENT' && (
          <button className="btn btn-primary" onClick={() => setIsUploadModalOpen(true)}>
            <Plus size={16} /> Upload Study Material
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div className="grid-3">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Subject</label>
            <select className="form-select" value={selectedSubjectId} onChange={e => setSelectedSubjectId(e.target.value)}>
              <option value="ALL">All Subjects</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Unit Number</label>
            <select className="form-select" value={selectedUnitNo} onChange={e => setSelectedUnitNo(e.target.value)}>
              <option value="ALL">All Units</option>
              <option value="1">Unit 1</option>
              <option value="2">Unit 2</option>
              <option value="3">Unit 3</option>
              <option value="4">Unit 4</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Search Material</label>
            <div style={{ position: 'relative' }}>
              <input type="text" className="form-input" placeholder="Search title or topic..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ paddingLeft: '2.2rem' }} />
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Materials Cards Grid */}
      <div className="grid-2">
        {filteredMaterials.length === 0 ? (
          <div className="card" style={{ gridColumn: 'span 2', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <FileText size={48} color="var(--brand-gold)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <h4 style={{ fontSize: '1.125rem', fontWeight: 700 }}>No Study Materials Found</h4>
            <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>Try clearing your filters or check back after faculty uploads.</p>
          </div>
        ) : (
          filteredMaterials.map(mat => {
            const subj = db.getSubjectById(mat.subjectId);

            return (
              <div key={mat.id} className="card card-hover" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <Badge variant="orange">Unit {mat.unitNo}</Badge>
                    <span style={{ fontWeight: 800, fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: 'var(--brand-navy-subtle)', color: 'var(--brand-navy)' }}>
                      {mat.fileType} • {mat.fileSize || '3.5 MB'}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '0.35rem' }}>
                    {mat.title}
                  </h3>

                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--brand-orange)', marginBottom: '0.5rem' }}>
                    {subj?.name} ({subj?.code})
                  </div>

                  <p style={{ fontSize: '0.84375rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1rem' }}>
                    {mat.description}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Uploaded by <strong>{mat.uploadedByFacultyName}</strong> on {mat.uploadedDate}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {role !== 'STUDENT' && (
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteMaterial(mat.id)} title="Delete material">
                        <Trash2 size={14} />
                      </button>
                    )}
                    <button className="btn btn-secondary btn-sm" onClick={() => handleView(mat.fileUrl)} title="View Document">
                      <Eye size={14} /> View
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={() => handleDownload(mat.fileUrl, mat.title)}>
                      <Download size={14} /> Download
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Upload Material Modal */}
      {isUploadModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '520px', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1.25rem' }}>
              Upload Unit Study Material
            </h3>

            <form onSubmit={handleUploadMaterial} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Subject *</label>
                <select className="form-select" value={subjectId} onChange={e => setSubjectId(e.target.value)}>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                </select>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Unit Number *</label>
                  <input type="number" className="form-input" min={1} max={10} value={unitNo} onChange={e => setUnitNo(Number(e.target.value))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Upload File *</label>
                  <input type="file" className="form-input" onChange={e => setUploadFile(e.target.files?.[0] || null)} required accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,image/*" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Material Title *</label>
                <input type="text" className="form-input" placeholder="e.g. DBMS Module 1 Lecture Notes & ER Diagrams" value={title} onChange={e => setTitle(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Short Description</label>
                <textarea className="form-input" rows={3} placeholder="Brief summary of topic covered in this document..." value={description} onChange={e => setDescription(e.target.value)} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsUploadModalOpen(false)} disabled={isUploading}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isUploading}>{isUploading ? 'Uploading...' : 'Upload Resource'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
