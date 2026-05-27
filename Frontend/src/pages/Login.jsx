import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Email-ul și parola sunt obligatorii.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', { email, password });

      login({ email: res.data.email, role: res.data.role }, res.data.token);

      if (res.data.role === 'Admin') navigate('/admin');
      else if (res.data.role === 'Mecanic') navigate('/mecanic');
      else navigate('/client');
    } catch {
      setError('Email sau parolă incorectă.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif' }}>
      <div style={{
        flex: 1,
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1200&q=90)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '40px 50px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            background: '#2563eb',
            borderRadius: 10,
            width: 38,
            height: 38,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: 20 }}>
            <span style={{ color: '#fff' }}>AutoPro</span><span style={{ color: '#60a5fa' }}> Moldova</span>
          </span>
        </div>

        <div>
          <h1 style={{
            color: '#fff',
            fontSize: 42,
            fontWeight: 900,
            lineHeight: 1.2,
            marginBottom: 16
          }}>
            Bine ai revenit<br />la bord!
          </h1>
          <p style={{
            color: '#cbd5e1',
            fontSize: 16,
            lineHeight: 1.7,
            maxWidth: 400
          }}>
            Accesează contul tău pentru a vedea programările, stadiul reparațiilor și istoricul auto.
          </p>
        </div>

        <div />
      </div>

      <div style={{
        width: 480,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px 50px',
        background: '#fff'
      }}>
        <button onClick={() => navigate('/')} style={{
  position: 'fixed',
  top: 24,
  right: 32,
  zIndex: 10,
  background: 'none',
  border: 'none',
  color: '#2563eb',
  cursor: 'pointer',
  fontSize: 14,
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  fontWeight: 600
}}>
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 5l-7 7 7 7" />
  </svg>
  Înapoi Acasă
</button>

        <h2 style={{ fontSize: 30, fontWeight: 900, marginBottom: 10, textAlign: 'center' }}>
          Autentificare
        </h2>

        <p style={{ color: '#888', fontSize: 14, marginBottom: 28, textAlign: 'center' }}>
          Introduceți datele pentru autentificare
        </p>

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fca5a5',
            borderRadius: 8,
            padding: '10px 14px',
            color: '#dc2626',
            fontSize: 14,
            marginBottom: 16
          }}>
            {error}
          </div>
        )}

        <label style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>
          EMAIL
        </label>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          border: '1px solid #e5e7eb',
          borderRadius: 10,
          padding: '12px 14px',
          marginBottom: 16
        }}>
          <span>✉️</span>
          <input
            type="email"
            placeholder="adresa@email.md"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ border: 'none', outline: 'none', fontSize: 15, width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>
            PAROLĂ
          </label>
          <span
            onClick={() => navigate('/forgot-password')}
            style={{ fontSize: 12, color: '#2563eb', cursor: 'pointer', fontWeight: 600 }}
          >
            AM UITAT PAROLA
          </span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          border: '1px solid #e5e7eb',
          borderRadius: 10,
          padding: '12px 14px',
          marginBottom: 24
        }}>
          <span>🔒</span>
          <input
            type={showPass ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ border: 'none', outline: 'none', fontSize: 15, width: '100%' }}
          />
          <span onClick={() => setShowPass(!showPass)} style={{ cursor: 'pointer', color: '#888' }}>
            {showPass ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </span>
        </div>

        <button onClick={handleLogin} disabled={loading} style={{
          width: '100%',
          background: '#2563eb',
          color: '#fff',
          border: 'none',
          borderRadius: 10,
          padding: '14px',
          fontWeight: 700,
          fontSize: 15,
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: 20,
          opacity: loading ? 0.7 : 1
        }}>
          {loading ? 'SE ÎNCARCĂ...' : 'AUTENTIFICARE'}
        </button>

        <div style={{ textAlign: 'center', color: '#888', fontSize: 13, marginBottom: 12 }}>
          NU AI UN CONT?
        </div>

        <div style={{ textAlign: 'center' }}>
          <span
            onClick={() => navigate('/register')}
            style={{
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              color: '#1a1a2e'
            }}
          >
            CREEAZĂ CONT
          </span>
        </div>
      </div>
    </div>
  );
}