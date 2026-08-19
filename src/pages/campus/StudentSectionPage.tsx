import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { studentSectionService } from '../../services/studentSectionService';
import { 
  StudentSectionService, StudentSectionRequest, StudentSectionDocument,
  StudentSectionRequestStatus, StudentServiceCategory, StudentSectionDeliveryMode
} from '../../types/studentSection';
import { Badge } from '../../components/common/Badge';
import { StatCard } from '../../components/common/StatCard';
import { Modal } from '../../components/common/Modal';
import { FeeReceiptModal } from '../../components/finance/FeeReceiptModal';
import { 
  FileText, Award, Download, Plus, CheckCircle, Clock, XCircle, 
  ShieldCheck, Search, IndianRupee, Sparkles, Send, Eye, Printer,
  Building2, AlertCircle, HelpCircle, CheckCircle2, RotateCcw,
  CreditCard, ExternalLink, QrCode
} from 'lucide-react';
import { PaymentMode, Student } from '../../types';
import { StudentDocumentsSection } from '../../components/profile/StudentDocumentsSection';

interface StudentSectionPageProps {
  initialTab?: 'SERVICES' | 'MY_REQUESTS' | 'MY_DOCUMENTS';
}

export const StudentSectionPage: React.FC<StudentSectionPageProps> = ({ initialTab = 'SERVICES' }) => {
  const { user, role } = useAuth();
  const [activeTab, setActiveTab] = useState<'SERVICES' | 'MY_REQUESTS' | 'MY_DOCUMENTS'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [services, setServices] = useState<StudentSectionService[]>([]);
  const [requests, setRequests] = useState<StudentSectionRequest[]>([]);
  const [documents, setDocuments] = useState<StudentSectionDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Modals state
  const [applyingService, setApplyingService] = useState<StudentSectionService | null>(null);
  const [payingRequest, setPayingRequest] = useState<StudentSectionRequest | null>(null);
  const [viewingRequest, setViewingRequest] = useState<StudentSectionRequest | null>(null);
  const [viewingDocument, setViewingDocument] = useState<StudentSectionDocument | null>(null);
  const [viewingReceiptTx, setViewingReceiptTx] = useState<any | null>(null);

  // Application Form state
  const [purpose, setPurpose] = useState('');
  const [copies, setCopies] = useState(1);
  const [isUrgent, setIsUrgent] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState<StudentSectionDeliveryMode>('DIGITAL');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Payment Form state
  const [payMode, setPayMode] = useState<PaymentMode>('Online UPI');
  const [upiId, setUpiId] = useState('student@okaxis');
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  // Toast
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = () => {
    setServices(studentSectionService.getServices(true));
    setRequests(studentSectionService.getScopedRequests(user, role));
    setDocuments(studentSectionService.getScopedDocuments(user, role));
  };

  useEffect(() => {
    loadData();
  }, [user, role]);

  const filteredServices = services.filter(s => {
    const matchesCategory = categoryFilter === 'ALL' || s.category === categoryFilter;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenApply = (service: StudentSectionService) => {
    setApplyingService(service);
    setPurpose('');
    setCopies(1);
    setIsUrgent(false);
    setDeliveryMode(service.deliveryMode === 'BOTH' ? 'DIGITAL' : service.deliveryMode);
    setDeliveryAddress('');
    setFormError(null);
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingService || !user) return;
    if (!purpose.trim()) {
      setFormError('Please provide a specific purpose for this request.');
      return;
    }

    setFormError(null);
    setLoading(true);

    try {
      const newReq = studentSectionService.createRequest({
        serviceId: applyingService.id,
        purpose: purpose.trim(),
        copies,
        isUrgent,
        deliveryMode,
        deliveryAddress: deliveryMode !== 'DIGITAL' ? deliveryAddress.trim() : undefined
      }, user);

      loadData();
      setApplyingService(null);
      showToast('success', `Request ${newReq.requestNo} submitted successfully!`);
      setActiveTab('MY_REQUESTS');
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit request.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingRequest || !user) return;

    setPayError(null);
    setPayLoading(true);

    try {
      studentSectionService.processPayment(payingRequest.id, {
        paymentMode: payMode,
        shouldSucceed: true
      }, user);

      loadData();
      setPayingRequest(null);
      showToast('success', `Payment of ₹${payingRequest.calculatedFee} confirmed! Receipt generated.`);
    } catch (err: any) {
      setPayError(err.message || 'Payment processing failed.');
    } finally {
      setPayLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: StudentSectionRequestStatus): 'success' | 'gold' | 'active' | 'danger' | 'navy' => {
    switch (status) {
      case 'READY':
      case 'COMPLETED':
        return 'success';
      case 'PAYMENT_PENDING':
        return 'gold';
      case 'PAID':
      case 'UNDER_REVIEW':
      case 'PROCESSING':
        return 'active';
      case 'REJECTED':
      case 'CANCELLED':
        return 'danger';
      default:
        return 'navy';
    }
  };

  const stats = {
    totalServices: services.length,
    myRequests: requests.length,
    readyDocs: documents.length,
    pendingPayments: requests.filter(r => r.status === 'PAYMENT_PENDING').length
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '1.5rem',
          right: '1.5rem',
          zIndex: 9999,
          backgroundColor: toast.type === 'success' ? '#10B981' : '#EF4444',
          color: '#FFF',
          padding: '0.875rem 1.25rem',
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontWeight: 600,
          fontSize: '0.9rem'
        }}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-navy)', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <Award size={28} style={{ color: 'var(--brand-gold)' }} />
            Student Section &amp; Official University Services Portal
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Apply for Bonafide, Academic Transcripts, Degree Certificates, Migration, Transfer Certificates, and access your verified document vault
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className={`btn ${activeTab === 'SERVICES' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('SERVICES')}
          >
            <Sparkles size={16} /> Services Catalog
          </button>
          <button 
            className={`btn ${activeTab === 'MY_REQUESTS' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('MY_REQUESTS')}
          >
            <Clock size={16} /> My Requests ({requests.length})
          </button>
          <button 
            className={`btn ${activeTab === 'MY_DOCUMENTS' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('MY_DOCUMENTS')}
          >
            <ShieldCheck size={16} /> My Documents ({documents.length})
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-4">
        <StatCard title="Available Services" value={stats.totalServices} icon={Award} colorScheme="navy" subtitle="Official University Catalog" />
        <StatCard title="My Active Requests" value={stats.myRequests} icon={FileText} colorScheme="gold" subtitle="Track Application Progress" />
        <StatCard title="Pending Payments" value={stats.pendingPayments} icon={CreditCard} colorScheme={stats.pendingPayments > 0 ? 'orange' : 'green'} subtitle="Action Required to Process" />
        <StatCard title="Ready Documents" value={stats.readyDocs} icon={CheckCircle2} colorScheme="green" subtitle="Verified & Downloadable" />
      </div>

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* TAB 1: SERVICES CATALOG */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'SERVICES' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Filter Bar */}
          <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '260px' }}>
              <Search size={18} color="var(--text-muted)" />
              <input
                type="text"
                className="form-input"
                placeholder="Search official university services (e.g. Bonafide, Transcript, Degree)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ maxWidth: '400px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {['ALL', 'CERTIFICATE', 'TRANSCRIPT', 'DEGREE', 'MIGRATION', 'TRANSFER', 'DUPLICATE_ID', 'VERIFICATION'].map(cat => (
                <button
                  key={cat}
                  className={`btn btn-sm ${categoryFilter === cat ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setCategoryFilter(cat)}
                  style={{ fontSize: '0.75rem' }}
                >
                  {cat.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Services Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {filteredServices.map(service => (
              <div 
                key={service.id} 
                className="card card-hover" 
                style={{ 
                  padding: '1.5rem', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  borderTop: '4px solid var(--brand-navy)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <Badge variant="navy">{service.category}</Badge>
                    <span style={{ fontSize: '1.125rem', fontWeight: 800, color: service.fee === 0 ? '#10B981' : 'var(--brand-navy)' }}>
                      {service.fee === 0 ? 'FREE' : `₹${service.fee}`}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '0.5rem' }}>
                    {service.name}
                  </h3>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1rem', minHeight: '40px' }}>
                    {service.description}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.78125rem', color: 'var(--text-muted)', marginBottom: '1.25rem', backgroundColor: 'var(--bg-main)', padding: '0.75rem', borderRadius: '6px' }}>
                    <div>Standard SLA: <strong>{service.processingDays} working days</strong></div>
                    {service.urgentFee > 0 && (
                      <div>Urgent Delivery: <strong>+{service.urgentProcessingDays} day (₹{service.urgentFee})</strong></div>
                    )}
                    <div>Mode: <strong>{service.deliveryMode}</strong></div>
                  </div>
                </div>

                <button 
                  className="btn btn-primary"
                  onClick={() => handleOpenApply(service)}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <Plus size={16} /> Apply for Service
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* TAB 2: MY REQUESTS */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'MY_REQUESTS' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '1.25rem' }}>
            My Student Section Service Applications
          </h3>

          {requests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <FileText size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p style={{ fontSize: '1rem', fontWeight: 600 }}>No service requests submitted yet.</p>
              <button className="btn btn-primary" onClick={() => setActiveTab('SERVICES')} style={{ marginTop: '0.75rem' }}>
                Browse Services Catalog
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Request No</th>
                    <th>Service Name</th>
                    <th>Date Applied</th>
                    <th>Fee Status</th>
                    <th>Application Status</th>
                    <th>Generated Document</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(r => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>{r.requestNo}</td>
                      <td>
                        <strong>{r.serviceName}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {r.copies} {r.copies > 1 ? 'copies' : 'copy'} {r.isUrgent ? '• URGENT' : ''}
                        </div>
                      </td>
                      <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                      <td>
                        {r.calculatedFee === 0 ? (
                          <Badge variant="success">FREE</Badge>
                        ) : r.paymentStatus === 'PAID' ? (
                          <Badge variant="success">PAID (₹{r.calculatedFee})</Badge>
                        ) : (
                          <Badge variant="gold">PENDING (₹{r.calculatedFee})</Badge>
                        )}
                      </td>
                      <td>
                        <Badge variant={getStatusBadgeVariant(r.status)}>
                          {r.status.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td>
                        {r.documentNo ? (
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand-green)' }}>
                            {r.documentNo}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pending Processing</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          {r.status === 'PAYMENT_PENDING' && (
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => {
                                setPayingRequest(r);
                                setPayError(null);
                              }}
                              style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                            >
                              <CreditCard size={13} /> Pay ₹{r.calculatedFee}
                            </button>
                          )}

                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => setViewingRequest(r)}
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                          >
                            <Eye size={13} /> Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* TAB 3: MY DOCUMENTS */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'MY_DOCUMENTS' && (() => {
        const currentStudent = db.getStudents().find(s => s.id === user?.id || s.enrollmentNo === user?.username) || db.getStudents()[0];
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Student Documents Section from Document Master Single Source of Truth */}
            {currentStudent && (
              <StudentDocumentsSection student={currentStudent} onRefresh={loadData} />
            )}

            {/* Issued Official Service Certificates */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={20} color="var(--brand-gold)" />
                Issued Official University Certificates ({documents.length})
              </h3>

              {documents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                  <ShieldCheck size={40} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                  <p style={{ fontSize: '0.9375rem', fontWeight: 600 }}>No service certificates issued yet.</p>
                  <p style={{ fontSize: '0.8rem' }}>Apply for Bonafide, Transcript, or Degree in Services tab to generate official verified certificates.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                  {documents.map(doc => (
                    <div 
                      key={doc.id}
                      className="card"
                      style={{
                        padding: '1.5rem',
                        borderLeft: '4px solid var(--brand-green)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '1rem'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                            {doc.documentNo}
                          </span>
                          <Badge variant="success">VERIFIED</Badge>
                        </div>

                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '0.35rem' }}>
                          {doc.serviceName}
                        </h4>

                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                          Issued to: <strong>{doc.studentName}</strong> ({doc.enrollmentNo})<br />
                          Issued Date: {new Date(doc.generatedAt).toLocaleDateString()}<br />
                          Verification Security Code: <code>{doc.verificationCode}</code>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="btn btn-secondary" 
                          onClick={() => setViewingDocument(doc)}
                          style={{ flex: 1, fontSize: '0.8rem', justifyContent: 'center' }}
                        >
                          <Eye size={14} /> Preview
                        </button>
                        <a 
                          href={doc.fileUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="btn btn-primary"
                          style={{ flex: 1, fontSize: '0.8rem', justifyContent: 'center' }}
                        >
                          <Download size={14} /> Download
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* MODAL 1: APPLY FOR SERVICE */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {applyingService && (
        <Modal isOpen={Boolean(applyingService)} onClose={() => setApplyingService(null)} title={`Apply: ${applyingService.name}`} maxWidth="640px">
          <form onSubmit={handleApplySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <div style={{ backgroundColor: 'var(--bg-main)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
              <div><strong>Service:</strong> {applyingService.name} ({applyingService.category})</div>
              <div style={{ marginTop: '0.25rem' }}><strong>Base Fee:</strong> {applyingService.fee === 0 ? 'FREE' : `₹${applyingService.fee} per copy`}</div>
              <div style={{ marginTop: '0.25rem' }}><strong>Standard Processing:</strong> {applyingService.processingDays} working days</div>
            </div>

            {formError && (
              <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                {formError}
              </div>
            )}

            <div>
              <label className="form-label" style={{ fontWeight: 600 }}>Purpose / Reason <span style={{ color: '#EF4444' }}>*</span></label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="e.g. Required for Canadian Study Visa Application & Bank Education Loan Documentation..."
                value={purpose}
                onChange={e => setPurpose(e.target.value)}
                required
              />
            </div>

            <div className="grid-2">
              <div>
                <label className="form-label" style={{ fontWeight: 600 }}>Number of Official Copies</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  className="form-input"
                  value={copies}
                  onChange={e => setCopies(Math.max(1, Number(e.target.value)))}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 600 }}>Preferred Delivery Mode</label>
                <select
                  className="form-select"
                  value={deliveryMode}
                  onChange={e => setDeliveryMode(e.target.value as any)}
                >
                  <option value="DIGITAL">Digital PDF Vault Only (Instant Download)</option>
                  <option value="PHYSICAL">Physical Hardcopy (Collect from Student Section)</option>
                  <option value="BOTH">Both Digital Copy + Physical Dispatch</option>
                </select>
              </div>
            </div>

            {applyingService.urgentFee > 0 && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', backgroundColor: '#FFFBEB', padding: '0.75rem', borderRadius: '6px', border: '1px solid #FDE68A' }}>
                <input
                  type="checkbox"
                  checked={isUrgent}
                  onChange={e => setIsUrgent(e.target.checked)}
                />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#92400E' }}>
                  Request Urgent Priority Processing (+₹{applyingService.urgentFee} fee for 24-48 hour clearance)
                </span>
              </label>
            )}

            {deliveryMode !== 'DIGITAL' && (
              <div>
                <label className="form-label" style={{ fontWeight: 600 }}>Postal / Courier Delivery Address</label>
                <textarea
                  className="form-input"
                  rows={2}
                  placeholder="Enter full postal address with PIN code if requesting postal dispatch..."
                  value={deliveryAddress}
                  onChange={e => setDeliveryAddress(e.target.value)}
                />
              </div>
            )}

            {/* Fee Summary Box */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 1rem', backgroundColor: '#EEF4FB', borderRadius: '8px', border: '1px solid #BFDBFE' }}>
              <span style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>Total Calculated Service Fee:</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--brand-navy)' }}>
                {(applyingService.fee * copies) + (isUrgent ? applyingService.urgentFee : 0) === 0
                  ? 'FREE'
                  : `₹${(applyingService.fee * copies) + (isUrgent ? applyingService.urgentFee : 0)}`}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" onClick={() => setApplyingService(null)} className="btn btn-secondary" disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Submitting...' : <><Send size={16} /> Confirm &amp; Submit Application</>}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* MODAL 2: PAY FOR SERVICE */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {payingRequest && (
        <Modal isOpen={Boolean(payingRequest)} onClose={() => setPayingRequest(null)} title={`Pay Service Fee: ${payingRequest.requestNo}`} maxWidth="520px">
          <form onSubmit={handlePaySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ backgroundColor: '#EEF4FB', padding: '1rem', borderRadius: '8px', border: '1px solid #BFDBFE' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Service Requested:</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--brand-navy)' }}>{payingRequest.serviceName}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--brand-orange)', marginTop: '0.5rem' }}>
                ₹{payingRequest.calculatedFee.toLocaleString()}
              </div>
            </div>

            {payError && (
              <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                {payError}
              </div>
            )}

            <div>
              <label className="form-label" style={{ fontWeight: 600 }}>Payment Method</label>
              <select className="form-select" value={payMode} onChange={e => setPayMode(e.target.value as PaymentMode)}>
                <option value="Online UPI">Instant UPI (Google Pay, PhonePe, Paytm)</option>
                <option value="Net Banking">Net Banking (HDFC, SBI, ICICI, Axis)</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Credit Card">Credit Card</option>
              </select>
            </div>

            {payMode === 'Online UPI' && (
              <div>
                <label className="form-label" style={{ fontWeight: 600 }}>Virtual Payment Address (UPI ID)</label>
                <input
                  type="text"
                  className="form-input"
                  value={upiId}
                  onChange={e => setUpiId(e.target.value)}
                  placeholder="username@okhdfcbank"
                  required
                />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" onClick={() => setPayingRequest(null)} className="btn btn-secondary" disabled={payLoading}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={payLoading}>
                {payLoading ? 'Verifying Transaction...' : <><CreditCard size={16} /> Pay ₹{payingRequest.calculatedFee} &amp; Confirm</>}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* MODAL 3: VIEW REQUEST TIMELINE & DETAILS */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {viewingRequest && (
        <Modal isOpen={Boolean(viewingRequest)} onClose={() => setViewingRequest(null)} title={`Request Details: ${viewingRequest.requestNo}`} maxWidth="720px">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', backgroundColor: 'var(--bg-main)', padding: '1rem', borderRadius: '8px' }}>
              <div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--brand-navy)', margin: 0 }}>
                  {viewingRequest.serviceName}
                </h4>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Purpose: {viewingRequest.purpose}
                </div>
              </div>
              <Badge variant={getStatusBadgeVariant(viewingRequest.status)}>
                {viewingRequest.status.replace(/_/g, ' ')}
              </Badge>
            </div>

            {/* Timeline */}
            <div>
              <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '0.75rem' }}>
                Application Processing Timeline
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {viewingRequest.timeline.map((t, idx) => (
                  <div key={t.id || idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: '#EEF4FB',
                      color: 'var(--brand-navy)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      flexShrink: 0
                    }}>
                      {idx + 1}
                    </div>
                    <div style={{ flex: 1, backgroundColor: '#F8FAFC', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <strong style={{ fontSize: '0.85rem', color: 'var(--brand-navy)' }}>
                          {t.action.replace(/_/g, ' ')}
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(t.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>
                        {t.remarks}
                      </div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        By: {t.fromUserName} ({t.fromUserRole})
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setViewingRequest(null)}>
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* MODAL 4: DOCUMENT PREVIEW */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {viewingDocument && (
        <Modal isOpen={Boolean(viewingDocument)} onClose={() => setViewingDocument(null)} title={`Official Certificate Preview: ${viewingDocument.documentNo}`} maxWidth="750px">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Formal Certificate Display Frame */}
            <div style={{
              border: '8px double var(--brand-navy)',
              padding: '2.5rem',
              backgroundColor: '#FFFDF9',
              borderRadius: '8px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              position: 'relative'
            }}>
              {/* Seal Watermark Background */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                opacity: 0.04,
                pointerEvents: 'none'
              }}>
                <Award size={320} color="var(--brand-navy)" />
              </div>

              {/* University Header */}
              <div style={{ textAlign: 'center', borderBottom: '2px solid var(--brand-orange)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--brand-navy)', margin: 0, letterSpacing: '0.5px' }}>
                  SWARRNIM STARTUP &amp; INNOVATION UNIVERSITY
                </h2>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  (Established under Gujarat Private Universities Act No. 8 of 2017) • Gandhinagar, Gujarat - 382420
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--brand-orange)', marginTop: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {viewingDocument.serviceName}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Document No: <strong>{viewingDocument.documentNo}</strong> • Date of Issue: <strong>{new Date(viewingDocument.generatedAt).toLocaleDateString()}</strong>
                </div>
              </div>

              {/* Certificate Body */}
              <div style={{ fontSize: '0.95rem', lineHeight: 1.8, color: '#1E293B', marginBottom: '2rem' }}>
                This is to certify that <strong>{viewingDocument.studentName}</strong>, bearing Enrollment Number <strong>{viewingDocument.enrollmentNo}</strong>, is a registered student of the <strong>{viewingDocument.departmentName}</strong> pursuing <strong>{viewingDocument.programName}</strong> at Swarrnim Startup &amp; Innovation University.
                <br /><br />
                This document is generated automatically by the university's Enterprise ERP System and stands digitally verified under the University Academic Charter with security verification token <strong>{viewingDocument.verificationCode}</strong>.
              </div>

              {/* Footer Signatures */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '1.5rem', borderTop: '1px solid #E2E8F0' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '64px', height: '64px', margin: '0 auto', backgroundColor: '#F1F5F9', border: '1px solid #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <QrCode size={48} color="var(--brand-navy)" />
                  </div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>Digital Verification QR</span>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontStyle: 'italic', fontWeight: 700, color: 'var(--brand-navy)' }}>
                    Dr. K. N. Rao
                  </div>
                  <div style={{ borderTop: '1px solid var(--brand-navy)', paddingTop: '0.25rem', fontSize: '0.75rem', fontWeight: 700 }}>
                    Registrar / Controller of Examinations
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={() => setViewingDocument(null)}>
                Close
              </button>
              <button className="btn btn-primary" onClick={() => window.print()}>
                <Printer size={16} /> Print Document
              </button>
              <a href={viewingDocument.fileUrl} target="_blank" rel="noreferrer" className="btn btn-navy">
                <Download size={16} /> Download Official PDF
              </a>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
