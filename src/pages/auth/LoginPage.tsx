import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { HeaderLogo } from '../../components/layout/HeaderLogo';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, AlertTriangle, UserCheck, Key, GraduationCap, Building2 } from 'lucide-react';
import { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim() || !password) {
      setError('Please enter both User ID and Password.');
      return;
    }

    const res = login(identifier, password);
    if (!res.success) {
      setError(res.error || 'Invalid User ID or Password. Access denied.');
    }
  };

  const demoAccounts = [
    {
      role: 'STUDENT',
      title: 'Student Candidate',
      userId: 'student',
      pass: 'Student@123',
      icon: GraduationCap,
      color: '#F59E0B',
      bg: '#FFFBEB'
    },
    {
      role: 'FACULTY',
      title: 'Faculty / Mentor',
      userId: 'faculty',
      pass: 'Faculty@123',
      icon: UserCheck,
      color: '#0284C7',
      bg: '#F0F9FF'
    },
    {
      role: 'HOD',
      title: 'Department HOD',
      userId: 'hod',
      pass: 'Faculty@123',
      icon: UserCheck,
      color: '#059669',
      bg: '#F0FDF4'
    },
    {
      role: 'REGISTRAR',
      title: 'Registrar Office',
      userId: 'registrar',
      pass: 'Admin@123',
      icon: ShieldCheck,
      color: '#EA580C',
      bg: '#FFF7ED'
    },
    {
      role: 'DEPUTY_REGISTRAR',
      title: 'Deputy Registrar',
      userId: 'deputyregistrar',
      pass: 'Admin@123',
      icon: ShieldCheck,
      color: '#4F46E5',
      bg: '#EEF2FF'
    },
    {
      role: 'EXAM_CELL',
      title: 'Exam Controller',
      userId: 'examcell',
      pass: 'Admin@123',
      icon: ShieldCheck,
      color: '#1E3A8A',
      bg: '#EFF6FF'
    },
    {
      role: 'STUDENT_SECTION',
      title: 'Student Section',
      userId: 'studentsection',
      pass: 'Admin@123',
      icon: UserCheck,
      color: '#0284C7',
      bg: '#F0F9FF'
    },
    {
      role: 'HOSTEL_ADMIN',
      title: 'Hostel Warden',
      userId: 'hosteladmin',
      pass: 'Admin@123',
      icon: UserCheck,
      color: '#F59E0B',
      bg: '#FFFBEB'
    },
    {
      role: 'IQAC',
      title: 'IQAC Director',
      userId: 'iqac',
      pass: 'Admin@123',
      icon: ShieldCheck,
      color: '#16A34A',
      bg: '#F0FDF4'
    },
    {
      role: 'PRINCIPAL',
      title: 'Institute Principal',
      userId: 'principal',
      pass: 'Admin@123',
      icon: Building2,
      color: '#E11D48',
      bg: '#FFF1F2'
    },
    {
      role: 'SUPER_ADMIN',
      title: 'University Super Admin',
      userId: 'admin',
      pass: 'Admin@123',
      icon: Key,
      color: '#0F2C59',
      bg: '#F1F5F9'
    }
  ];

  const handleDemoClick = (userId: string, pass: string) => {
    setIdentifier(userId);
    setPassword(pass);
    setError('');
    login(userId, pass);
  };

  /* ── Feature pills for the left panel ── */
  const featurePills = [
    { icon: GraduationCap, label: 'Academic Management' },
    { icon: UserCheck, label: 'Student Management' },
    { icon: Building2, label: 'Faculty Management' },
    { icon: ShieldCheck, label: 'Campus Operations' },
  ];

  return (
    <>
      {/* Scoped styles for the redesigned login page */}
      <style>{`
        /* ── Login Page Layout ── */
        .login-page {
          min-height: 100vh;
          width: 100%;
          display: flex;
          flex-direction: column;
          background: #071325;
        }

        /* ── Top Bar ── */
        .login-topbar {
          position: sticky;
          top: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2.5rem;
          height: 64px;
          background: #FFFFFF;
          border-bottom: 3px solid var(--brand-orange);
          flex-shrink: 0;
          z-index: 100;
        }
        .login-topbar-brand {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }
        .login-topbar-brand img {
          height: 42px;
          object-fit: contain;
        }
        .login-topbar-brand-text h1 {
          font-size: 0.9375rem;
          font-weight: 800;
          color: var(--brand-navy);
          line-height: 1.2;
          letter-spacing: -0.2px;
        }
        .login-topbar-brand-text span {
          font-size: 0.6875rem;
          font-weight: 700;
          color: var(--brand-navy-light);
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }
        .login-topbar-links {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }
        .login-topbar-link {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--text-muted);
          cursor: pointer;
          transition: color 0.15s;
          background: none;
          border: none;
          font-family: inherit;
        }
        .login-topbar-link:hover {
          color: var(--brand-orange);
        }
        .login-topbar-link-accent {
          padding: 0.4rem 1rem;
          border-radius: var(--radius-sm);
          border: 1.5px solid var(--brand-navy);
          color: var(--brand-navy);
          font-weight: 700;
          transition: all 0.15s;
        }
        .login-topbar-link-accent:hover {
          background: var(--brand-navy);
          color: #FFF;
        }

        /* ── Main Body (split) ── */
        .login-body {
          flex: 1;
          display: flex;
          min-height: 0;
        }

        /* ── Left Hero Panel ── */
        .login-left {
          flex: 1.1;
          position: sticky;
          top: 64px;
          height: calc(100vh - 64px - 48px);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 2.5rem 3.5rem;
          background: linear-gradient(135deg, #071325 0%, #0F2C59 55%, #183B70 100%);
          color: #FFF;
          overflow: hidden;
          box-sizing: border-box;
        }

        /* Geometric grid overlay */
        .login-left::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
        }

        /* Subtle radial glow top-right */
        .login-left::after {
          content: '';
          position: absolute;
          top: -5%;
          right: -10%;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(0,151,215,0.12) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .login-left-content {
          position: relative;
          z-index: 1;
          max-width: 480px;
          width: 100%;
        }

        .login-left-tag {
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 2.5px;
          color: var(--brand-gold);
          margin-bottom: 0.85rem;
        }

        .login-left-heading {
          font-size: 2.35rem;
          font-weight: 900;
          line-height: 1.18;
          letter-spacing: -0.4px;
          color: #FFFFFF;
          margin-bottom: 0.85rem;
        }

        .login-left-divider {
          width: 48px;
          height: 4px;
          background: var(--brand-orange);
          border-radius: 2px;
          margin-bottom: 1.15rem;
        }

        .login-left-desc {
          font-size: 0.95rem;
          line-height: 1.6;
          color: #94A3B8;
          max-width: 440px;
          margin-bottom: 1.75rem;
        }

        /* Feature pills grid */
        .login-feature-pills {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          max-width: 440px;
          position: relative;
          z-index: 1;
        }
        .login-feature-pill {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.65rem 0.85rem;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: var(--radius-sm);
          font-size: 0.8125rem;
          font-weight: 600;
          color: #CBD5E1;
          transition: all 0.2s;
        }
        .login-feature-pill:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(245,166,35,0.3);
          color: #FFF;
        }
        .login-feature-pill-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        /* Decorative dot accent between pills */
        .login-pills-dot {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--brand-gold);
          box-shadow: 0 0 10px rgba(245,166,35,0.5);
        }

        /* ── Right Panel ── */
        .login-right {
          flex: 1.35;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          background: var(--bg-main);
          padding: 2.5rem 2rem 5rem 2rem;
          overflow-y: auto;
        }

        .login-right-inner {
          width: 100%;
          max-width: 900px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* Login Card */
        .login-card {
          background: #FFFFFF;
          border-radius: var(--radius-lg);
          box-shadow: 0 8px 32px rgba(15,44,89,0.08), 0 2px 8px rgba(0,0,0,0.04);
          padding: 2.25rem 2rem;
          margin-bottom: 2rem;
          width: 100%;
          max-width: 480px;
        }

        .login-card-accent {
          width: 48px;
          height: 4px;
          background: var(--brand-navy);
          border-radius: 2px;
          margin-bottom: 1.25rem;
        }

        .login-card h2 {
          font-size: 1.625rem;
          font-weight: 800;
          color: var(--brand-navy);
          margin-bottom: 0.35rem;
        }

        .login-card-subtitle {
          font-size: 0.875rem;
          color: var(--text-muted);
          margin-bottom: 1.75rem;
          line-height: 1.5;
        }

        /* Form fields */
        .login-field-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: var(--text-main);
          margin-bottom: 0.45rem;
        }

        .login-field-wrapper {
          position: relative;
          margin-bottom: 1.15rem;
        }

        .login-field-input {
          width: 100%;
          font-family: inherit;
          font-size: 0.875rem;
          padding: 0.75rem 1rem 0.75rem 2.65rem;
          border: 1.5px solid var(--border-color);
          border-radius: 10px;
          background: #FFFFFF;
          color: var(--text-main);
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .login-field-input:focus {
          border-color: var(--brand-orange);
          box-shadow: 0 0 0 3px rgba(243,112,35,0.12);
        }
        .login-field-input::placeholder {
          color: #94A3B8;
        }

        .login-field-icon {
          position: absolute;
          left: 0.9rem;
          top: 50%;
          transform: translateY(-50%);
          color: #94A3B8;
          pointer-events: none;
        }

        .login-field-toggle {
          position: absolute;
          right: 0.85rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #94A3B8;
          display: flex;
          align-items: center;
          padding: 0;
          transition: color 0.15s;
        }
        .login-field-toggle:hover {
          color: var(--text-main);
        }

        /* Remember me + forgot */
        .login-extras {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.35rem;
        }
        .login-remember {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          cursor: pointer;
        }
        .login-remember input[type="checkbox"] {
          width: 16px;
          height: 16px;
          accent-color: var(--brand-navy);
          cursor: pointer;
        }
        .login-remember span {
          font-size: 0.8125rem;
          font-weight: 500;
          color: var(--text-main);
        }
        .login-forgot-btn {
          background: none;
          border: none;
          font-family: inherit;
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--brand-orange);
          cursor: pointer;
          transition: color 0.15s;
        }
        .login-forgot-btn:hover {
          color: var(--brand-orange-hover);
          text-decoration: underline;
        }

        /* Sign In button */
        .login-submit-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.85rem 1rem;
          font-family: inherit;
          font-size: 1rem;
          font-weight: 700;
          color: #FFFFFF;
          background: linear-gradient(135deg, var(--brand-navy) 0%, var(--brand-navy-medium) 100%);
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 14px rgba(15,44,89,0.25);
        }
        .login-submit-btn:hover {
          box-shadow: 0 6px 20px rgba(15,44,89,0.35);
          transform: translateY(-1px);
        }
        .login-submit-btn:active {
          transform: translateY(0);
        }

        /* Secure badge */
        .login-secure-badge {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.15rem;
          padding-top: 1.25rem;
          text-align: center;
        }
        .login-secure-badge-line1 {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.8125rem;
          font-weight: 700;
          color: var(--text-main);
        }
        .login-secure-badge-line2 {
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: var(--text-muted);
        }

        /* Error alert */
        .login-error-alert {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.75rem 1rem;
          background: #FEF2F2;
          border: 1px solid #FCA5A5;
          border-radius: 10px;
          color: #991B1B;
          font-size: 0.84375rem;
          font-weight: 600;
          margin-bottom: 1.25rem;
        }

        /* ── Demo Credentials Section ── */
        .login-demo-section {
          width: 100%;
          max-width: 900px;
          margin-top: 0.5rem;
        }
        .login-demo-header {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: #64748B;
          margin-bottom: 0.75rem;
        }
        .login-demo-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          width: 100%;
        }
        .login-demo-card {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 12px 14px;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100%;
          min-height: 135px;
          box-sizing: border-box;
          text-align: left;
        }
        .login-demo-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 14px rgba(15, 44, 89, 0.08);
          border-color: #CBD5E1;
        }
        .login-demo-card-top {
          display: flex;
          flex-direction: column;
        }
        .login-demo-card-icon {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-bottom: 0.5rem;
        }
        .login-demo-card-info-title {
          font-weight: 700;
          font-size: 0.8125rem;
          color: #0F172A;
          line-height: 1.25;
          margin-bottom: 0.4rem;
        }
        .login-demo-card-creds {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          font-size: 0.72rem;
          color: #64748B;
        }
        .login-demo-card-cred-row {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          line-height: 1.35;
        }
        .login-demo-card-cred-label {
          color: #64748B;
          font-weight: 500;
          font-size: 0.72rem;
        }
        .login-demo-card-cred-val {
          font-family: inherit;
          font-size: 0.72rem;
          font-weight: 600;
        }
        .login-demo-card-footer {
          margin-top: 0.6rem;
          display: flex;
          justify-content: flex-end;
          align-items: center;
        }
        .login-demo-card-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.6rem;
          font-family: inherit;
          font-size: 0.72rem;
          font-weight: 700;
          color: #EA580C;
          background: #FFF7ED;
          border: 1px solid #FFEDD5;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .login-demo-card:hover .login-demo-card-btn {
          background: #FFEDD5;
          border-color: #FED7AA;
          color: #C2410C;
          transform: translateX(2px);
        }

        /* ── Footer ── */
        .login-footer {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.85rem 2.5rem;
          background: #FFFFFF;
          border-top: 1px solid var(--border-color);
          flex-shrink: 0;
          z-index: 100;
        }
        .login-footer-copy {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
        }
        .login-footer-tagline {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: var(--brand-orange);
        }
        .login-footer-links {
          display: flex;
          gap: 1.25rem;
        }
        .login-footer-links span {
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--text-muted);
          cursor: pointer;
          transition: color 0.15s;
        }
        .login-footer-links span:hover {
          color: var(--brand-navy);
        }

        /* ── Responsive ── */
        @media (max-width: 1280px) {
          .login-demo-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 1100px) {
          .login-left {
            padding: 2rem 2rem;
          }
          .login-left-heading {
            font-size: 2rem;
          }
          .login-right {
            padding: 2rem 1.5rem 5rem 1.5rem;
          }
        }

        @media (max-width: 960px) {
          .login-body {
            flex-direction: column;
          }
          .login-left {
            position: static;
            height: auto;
            min-height: auto;
            flex: none;
            padding: 2.25rem 1.75rem;
            align-items: flex-start;
          }
          .login-left-content {
            max-width: 100%;
          }
          .login-left-heading {
            font-size: 1.85rem;
          }
          .login-right {
            flex: none;
            padding: 2rem 1.5rem 6.5rem 1.5rem;
          }
          .login-topbar {
            padding: 0 1.5rem;
          }
          .login-footer {
            flex-direction: column;
            gap: 0.4rem;
            padding: 0.65rem 1.5rem;
            text-align: center;
          }
          .login-demo-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 600px) {
          .login-topbar-links {
            display: none;
          }
          .login-left {
            padding: 1.75rem 1.25rem;
          }
          .login-left-heading {
            font-size: 1.5rem;
          }
          .login-feature-pills {
            grid-template-columns: 1fr;
          }
          .login-right {
            padding: 1.5rem 1rem 6.5rem 1rem;
          }
          .login-card {
            padding: 1.75rem 1.25rem;
          }
          .login-footer-links {
            gap: 0.75rem;
          }
          .login-demo-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="login-page">
        {/* ═══ Top Navigation Bar ═══ */}
        <header className="login-topbar">
          <div className="login-topbar-brand">
            <HeaderLogo lightMode />
            <div className="login-topbar-brand-text">
              <h1>Swarrnim Startup &amp; Innovation University</h1>
              <span>University Management System</span>
            </div>
          </div>
          <div className="login-topbar-links">
            <button className="login-topbar-link" type="button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Need Help?
            </button>
            <button className="login-topbar-link login-topbar-link-accent" type="button">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"/></svg>
              Contact IT Support
            </button>
          </div>
        </header>

        {/* ═══ Main Split Body ═══ */}
        <div className="login-body">
          {/* ── Left Branding Panel ── */}
          <div className="login-left login-hero-panel">
            <div className="login-left-content">
              <div className="login-left-tag">University Digital Gateway</div>
              <h2 className="login-left-heading">
                Empowering Education<br />Through Technology
              </h2>
              <div className="login-left-divider" />
              <p className="login-left-desc">
                A unified digital platform for managing academic,
                administrative and campus operations.
              </p>

              {/* Feature Pills */}
              <div className="login-feature-pills" style={{ position: 'relative' }}>
                <div className="login-pills-dot" />
                {featurePills.map((fp, i) => {
                  const Ic = fp.icon;
                  const colors = ['#F5A623', '#0097D7', '#10B981', '#F37023'];
                  return (
                    <div className="login-feature-pill" key={i}>
                      <div
                        className="login-feature-pill-icon"
                        style={{ background: `${colors[i]}22`, color: colors[i] }}
                      >
                        <Ic size={16} />
                      </div>
                      {fp.label}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Right Form Panel ── */}
          <div className="login-right login-form-panel">
            <div className="login-right-inner">
              {/* Login Card */}
              <div className="login-card">
                <div className="login-card-accent" />
                <h2>Welcome Back</h2>
                <p className="login-card-subtitle">
                  Sign in to access the University Management System
                </p>

                {/* Error Alert */}
                {error && (
                  <div className="login-error-alert">
                    <AlertTriangle size={18} color="#DC2626" style={{ flexShrink: 0 }} />
                    <div>{error}</div>
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} autoComplete="off">
                  {/* Username / Email */}
                  <label className="login-field-label">Username / University Email</label>
                  <div className="login-field-wrapper">
                    <Mail size={17} className="login-field-icon" />
                    <input
                      type="text"
                      className="login-field-input"
                      placeholder="Enter your university email or username"
                      value={identifier}
                      onChange={e => setIdentifier(e.target.value)}
                      required
                    />
                  </div>

                  {/* Password */}
                  <label className="login-field-label">Password</label>
                  <div className="login-field-wrapper">
                    <Lock size={17} className="login-field-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="login-field-input"
                      placeholder="Enter your password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      style={{ paddingRight: '2.65rem' }}
                      required
                    />
                    <button
                      type="button"
                      className="login-field-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>

                  {/* Remember Me + Forgot */}
                  <div className="login-extras">
                    <label className="login-remember">
                      <input type="checkbox" defaultChecked />
                      <span>Remember Me</span>
                    </label>
                    <button
                      type="button"
                      className="login-forgot-btn"
                      onClick={() => setIsForgotModalOpen(true)}
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {/* Submit */}
                  <button type="submit" className="login-submit-btn">
                    Sign In
                  </button>
                </form>

                {/* Secure Access Badge */}
                <div className="login-secure-badge">
                  <div className="login-secure-badge-line1">
                    <ShieldCheck size={15} />
                    Secure University Access
                  </div>
                  <div className="login-secure-badge-line2">Authorized Users Only</div>
                </div>
              </div>

              {/* ── Demo Credentials ── */}
              <div className="login-demo-section">
                <div className="login-demo-header">
                  <Key size={14} color="#F59E0B" />
                  <span>Demo Credentials (1-Click Test Login)</span>
                </div>
                <div className="login-demo-grid">
                  {demoAccounts.map(acc => {
                    const IconComponent = acc.icon;
                    return (
                      <div
                        key={acc.role}
                        className="login-demo-card"
                        onClick={() => handleDemoClick(acc.userId, acc.pass)}
                        style={{ borderLeft: `4px solid ${acc.color}` }}
                      >
                        <div className="login-demo-card-top">
                          <div
                            className="login-demo-card-icon"
                            style={{ backgroundColor: acc.bg, color: acc.color }}
                          >
                            <IconComponent size={16} />
                          </div>
                          <div className="login-demo-card-info-title">{acc.title}</div>
                          <div className="login-demo-card-creds">
                            <div className="login-demo-card-cred-row">
                              <span className="login-demo-card-cred-label">User ID:</span>
                              <span className="login-demo-card-cred-val" style={{ color: acc.color, fontWeight: 700 }}>{acc.userId}</span>
                            </div>
                            <div className="login-demo-card-cred-row">
                              <span className="login-demo-card-cred-label">Pass:</span>
                              <span className="login-demo-card-cred-val" style={{ color: '#1E293B' }}>{acc.pass}</span>
                            </div>
                          </div>
                        </div>
                        <div className="login-demo-card-footer">
                          <button 
                            className="login-demo-card-btn" 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDemoClick(acc.userId, acc.pass);
                            }}
                          >
                            Login <ArrowRight size={11} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ Footer ═══ */}
        <footer className="login-footer">
          <div className="login-footer-copy">
            © {new Date().getFullYear()} Swarrnim Startup &amp; Innovation University
          </div>
          <div className="login-footer-tagline">Where Ideas Come Alive</div>
          <div className="login-footer-links">
            <span>Privacy Policy</span>
            <span>Security</span>
            <span>IT Support</span>
          </div>
        </footer>
      </div>

      {/* Forgot Password Modal (unchanged) */}
      <ForgotPasswordModal isOpen={isForgotModalOpen} onClose={() => setIsForgotModalOpen(false)} />
    </>
  );
};
