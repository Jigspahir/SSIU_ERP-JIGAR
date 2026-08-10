import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { HeaderLogo } from '../../components/layout/HeaderLogo';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, Sparkles, AlertTriangle, UserCheck, Key, GraduationCap } from 'lucide-react';
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
      title: 'Student Login',
      userId: 'student',
      pass: 'Student@123',
      desc: 'Access enrolled courses, division timetable, and student profile',
      icon: GraduationCap,
      color: '#F5A623',
      bg: 'rgba(245, 166, 35, 0.08)'
    },
    {
      role: 'FACULTY',
      title: 'Faculty Login',
      userId: 'faculty',
      pass: 'Faculty@123',
      desc: 'Access teaching subjects, department peers, and student directory',
      icon: UserCheck,
      color: '#0097D7',
      bg: 'rgba(0, 151, 215, 0.08)'
    },
    {
      role: 'SUPER_ADMIN',
      title: 'Admin Login',
      userId: 'admin',
      pass: 'Admin@123',
      desc: 'Full access to manage the entire University ERP system & master data',
      icon: ShieldCheck,
      color: '#0F2C59',
      bg: 'rgba(15, 44, 89, 0.08)'
    }
  ];

  const handleDemoClick = (userId: string, pass: string) => {
    setIdentifier(userId);
    setPassword(pass);
    setError('');
    login(userId, pass);
  };

  return (
    <div style={{ minHeight: '100vh', width: '100vw', display: 'flex', backgroundColor: 'var(--brand-navy-dark)' }}>
      {/* Left Hero Panel */}
      <div
        style={{
          flex: '1.1',
          background: 'linear-gradient(135deg, #071325 0%, #0F2C59 60%, #183B70 100%)',
          padding: '4rem 3.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          position: 'relative',
          overflow: 'hidden',
          color: '#FFFFFF'
        }}
      >
        {/* Glowing Accents */}
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(245,166,35,0.25) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(0,151,215,0.2) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <HeaderLogo />
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: '520px', margin: '2rem 0' }}>
            <h2 style={{ fontSize: '2.65rem', fontWeight: 900, color: '#FFFFFF', lineHeight: 1.15, letterSpacing: '-0.5px' }}>
              Empowering <span style={{ color: 'var(--brand-gold)' }}>Innovation</span> &amp; Academic Excellence
            </h2>

            <p style={{ fontSize: '1rem', color: '#94A3B8', marginTop: '1.25rem', lineHeight: 1.6 }}>
              Welcome to Swarrnim Startup &amp; Innovation University ERP. Authenticate with your valid User ID and password to access your role-based dashboard.
            </p>
          </div>
        </div>

        {/* System Feature Pills removed */}
      </div>

      {/* Right Login Form & Demo Cards Panel */}
      <div
        style={{
          flex: '1',
          background: 'var(--bg-main)',
          padding: '3.5rem 3rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          overflowY: 'auto'
        }}
      >
        <div style={{ width: '100%', maxWidth: '440px' }}>
          <div style={{ textAlign: 'left', marginBottom: '1.75rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--brand-navy)' }}>
              Sign In to Your Account
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Enter your User ID and Password to identify your role.
            </p>
          </div>

          {/* Error Message Alert */}
          {error && (
            <div
              style={{
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5',
                color: '#991B1B',
                fontSize: '0.84375rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1.5rem'
              }}
            >
              <AlertTriangle size={20} color="#DC2626" style={{ flexShrink: 0 }} />
              <div>{error}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">User ID or Email *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter User ID (e.g. admin, faculty, student)"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
                <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Password *</label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  style={{ background: 'none', border: 'none', color: 'var(--brand-orange)', fontSize: '0.78125rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Forgot Password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter Password (e.g. Admin@123)"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  required
                />
                <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '0.9375rem',
                fontWeight: 700,
                marginTop: '0.5rem',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              Sign In to ERP <ArrowRight size={18} />
            </button>
          </form>

          {/* Quick Demo Credentials Selection Cards */}
          <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Key size={14} color="var(--brand-gold)" /> Demo Credentials (1-Click Test Login)
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {demoAccounts.map(acc => {
                const IconComponent = acc.icon;
                return (
                  <div
                    key={acc.role}
                    className="card card-hover"
                    onClick={() => handleDemoClick(acc.userId, acc.pass)}
                    style={{
                      padding: '0.85rem 1rem',
                      cursor: 'pointer',
                      borderLeft: `4px solid ${acc.color}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'var(--bg-surface)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: acc.bg, color: acc.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IconComponent size={18} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--brand-navy)' }}>{acc.title}</div>
                        <div style={{ fontSize: '0.78125rem', color: 'var(--text-muted)' }}>
                          User ID: <code style={{ color: acc.color, fontWeight: 700 }}>{acc.userId}</code> • Pass: <code style={{ color: 'var(--text-main)' }}>{acc.pass}</code>
                        </div>
                      </div>
                    </div>

                    <button className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}>
                      Login
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <ForgotPasswordModal isOpen={isForgotModalOpen} onClose={() => setIsForgotModalOpen(false)} />
    </div>
  );
};
