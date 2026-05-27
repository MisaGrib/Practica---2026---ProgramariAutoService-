import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [step, setStep] = useState(1); // 1 = email, 2 = reset parola
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCheckEmail = async () => {
    if (!email) { setError('Introdu email-ul.'); return; }
    setLoading(true);
    setError('');
    try {
      await api.get(`/users/email/${email}`);
      setStep(2);
    } catch {
      setError('Nu există niciun cont cu acest email.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError('Toate câmpurile sunt obligatorii.'); return;
    }
    if (newPassword !== confirmPassword) {
      setError('Parolele noi nu coincid.'); return;
    }
    setLoading(true);
    setError('');
    try {
      await api.put('/auth/reset-password', {
        email,
        newPassword
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch {
      setError('Nu s-a putut reseta parola. Verifică email-ul și încearcă din nou.');
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = ({ show, toggle }) => (
    <span onClick={toggle} style={{ cursor: 'pointer', color: '#888' }}>
      {show ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      )}
    </span>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif' }}>

      {/* STANGA */}
      <div style={{
        flex: 1,
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1200&q=90)',
        backgroundSize: 'cover', backgroundPosition: 'center',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', padding: '40px 50px'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            background: '#2563eb', borderRadius: 10, width: 38, height: 38,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: 20, color: '#fff' }}>
            AutoPro <span style={{ color: '#60a5fa' }}>Moldova</span>
          </span>
        </div>

        {/* Text */}
        <div>
          <h1 style={{ color: '#fff', fontSize: 42, fontWeight: 900, lineHeight: 1.2, marginBottom: 16 }}>
            {step === 1 ? 'Ai uitat\nparola?' : 'Resetează\nparola!'}
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 16, lineHeight: 1.7, maxWidth: 380 }}>
            {step === 1
              ? 'Introdu email-ul contului tău și te vom ajuta să îți resetezi parola.'
              : 'Alege o parolă nouă sigură pentru contul tău.'}
          </p>
        </div>

        <div />
      </div>

      {/* DREAPTA */}
      <div style={{
        width: 500, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '60px 50px', background: '#fff'
      }}>

        <button onClick={() => step === 1 ? navigate('/login') : setStep(1)} style={{
          background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer',
          fontSize: 14, marginBottom: 36, textAlign: 'left',
          display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          {step === 1 ? 'Înapoi la Login' : 'Înapoi'}
        </button>

        {/* Indicator pasi */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
          {[1, 2].map(s => (
            <div key={s} style={{
              flex: 1, height: 4, borderRadius: 4,
              background: s <= step ? '#2563eb' : '#e5e7eb'
            }} />
          ))}
        </div>

        <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 6 }}>
          {step === 1 ? 'Recuperare Parolă' : 'Parolă Nouă'}
        </h2>
        <p style={{ color: '#888', fontSize: 14, marginBottom: 28, letterSpacing: 0.5 }}>
          {step === 1 ? 'PASUL 1 DIN 2 — VERIFICARE EMAIL' : 'PASUL 2 DIN 2 — RESETARE PAROLĂ'}
        </p>

        {success && (
          <div style={{
            background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8,
            padding: '10px 14px', color: '#16a34a', fontSize: 14, marginBottom: 16
          }}>✅ Parola a fost resetată! Redirecționare...</div>
        )}

        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8,
            padding: '10px 14px', color: '#dc2626', fontSize: 14, marginBottom: 16
          }}>{error}</div>
        )}

        {step === 1 ? (
          <>
            <label style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, marginBottom: 6, display: 'block' }}>
              EMAIL
            </label>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, border: '1px solid #e5e7eb',
              borderRadius: 10, padding: '12px 14px', marginBottom: 24
            }}>
              <span>✉️</span>
              <input
                type="email" placeholder="adresa@email.md" value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCheckEmail()}
                style={{ border: 'none', outline: 'none', fontSize: 15, width: '100%' }}
              />
            </div>

            <button onClick={handleCheckEmail} disabled={loading} style={{
              width: '100%', background: '#2563eb', color: '#fff', border: 'none',
              borderRadius: 10, padding: '14px', fontWeight: 700, fontSize: 15,
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1
            }}>
              {loading ? 'SE VERIFICĂ...' : 'CONTINUĂ'}
            </button>
          </>
        ) : (
          <>
            {/* Parola noua */}
            <label style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, marginBottom: 6, display: 'block' }}>
              PAROLĂ NOUĂ
            </label>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, border: '1px solid #e5e7eb',
              borderRadius: 10, padding: '12px 14px', marginBottom: 16
            }}>
              <span>🔒</span>
              <input
                type={showNew ? 'text' : 'password'} placeholder="••••••••" value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                style={{ border: 'none', outline: 'none', fontSize: 15, width: '100%' }}
              />
              <EyeIcon show={showNew} toggle={() => setShowNew(!showNew)} />
            </div>

            {/* Confirma parola */}
            <label style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, marginBottom: 6, display: 'block' }}>
              CONFIRMĂ PAROLA NOUĂ
            </label>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, border: '1px solid #e5e7eb',
              borderRadius: 10, padding: '12px 14px', marginBottom: 24
            }}>
              <span>🔒</span>
              <input
                type={showConfirm ? 'text' : 'password'} placeholder="••••••••" value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleResetPassword()}
                style={{ border: 'none', outline: 'none', fontSize: 15, width: '100%' }}
              />
              <EyeIcon show={showConfirm} toggle={() => setShowConfirm(!showConfirm)} />
            </div>

            <button onClick={handleResetPassword} disabled={loading} style={{
              width: '100%', background: '#2563eb', color: '#fff', border: 'none',
              borderRadius: 10, padding: '14px', fontWeight: 700, fontSize: 15,
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1
            }}>
              {loading ? 'SE SALVEAZĂ...' : 'SALVEAZĂ PAROLA →'}
            </button>
          </>
        )}

      </div>
    </div>
  );
}