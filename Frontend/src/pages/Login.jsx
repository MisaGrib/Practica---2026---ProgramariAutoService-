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

      {/* STANGA - imagine */}
      <div style={{
        flex: 1, background: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)) center/cover',
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1200&q=90)',
        backgroundSize: 'cover', backgroundPosition: 'center',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', padding: '60px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
          <div style={{
            background: '#2563eb', borderRadius: 12, width: 44, height: 44,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22
          }}>🚗</div>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 22 }}>AutoPro Moldova</span>
        </div>
        <h1 style={{ color: '#fff', fontSize: 42, fontWeight: 900, lineHeight: 1.2, marginBottom: 20 }}>
          Bine ai revenit la bord!
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 16, lineHeight: 1.7, marginBottom: 40, maxWidth: 380 }}>
          Accesează contul tău pentru a vedea programările, stadiul reparațiilor și istoricul auto.
        </p>
        <div style={{
          background: 'rgba(255,255,255,0.1)', borderRadius: 14, padding: '20px 24px',
          display: 'flex', alignItems: 'center', gap: 16, backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.15)', maxWidth: 380
        }}>
          <span style={{ fontSize: 28 }}>🛡️</span>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, marginBottom: 4 }}>Sistem Securizat</div>
            <div style={{ color: '#94a3b8', fontSize: 13 }}>
              Datele tale sunt protejate conform standardelor internaționale.
            </div>
          </div>
        </div>
      </div>

      {/* DREAPTA - formular */}
      <div style={{
        width: 480, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '60px 50px', background: '#fff'
      }}>
        <button onClick={() => navigate('/')} style={{
          background: 'none', border: 'none', color: '#666', cursor: 'pointer',
          fontSize: 14, marginBottom: 32, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 6
        }}>← ÎNAPOI ACASĂ</button>

        <h2 style={{ fontSize: 30, fontWeight: 900, marginBottom: 6 }}>Autentificare</h2>
        <p style={{ color: '#888', fontSize: 14, marginBottom: 28 }}>Introduceți datele pentru autentificare</p>
        

       

       

    

        <label style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>EMAIL</label>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, border: '1px solid #e5e7eb',
          borderRadius: 10, padding: '12px 14px', marginBottom: 16
        }}>
          <span>✉️</span>
          <input
            type="email" placeholder="adresa@email.md" value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ border: 'none', outline: 'none', fontSize: 15, width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>PAROLĂ</label>
          <span style={{ fontSize: 12, color: '#2563eb', cursor: 'pointer', fontWeight: 600 }}>AM UITAT PAROLA</span>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, border: '1px solid #e5e7eb',
          borderRadius: 10, padding: '12px 14px', marginBottom: 24
        }}>
          <span>🔒</span>
          <input
            type="password" placeholder="••••••••" value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ border: 'none', outline: 'none', fontSize: 15, width: '100%' }}
          />
        </div>

        <button onClick={handleLogin} disabled={loading} style={{
          width: '100%', background: '#2563eb', color: '#fff', border: 'none',
          borderRadius: 10, padding: '14px', fontWeight: 700, fontSize: 15,
          cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 20,
          opacity: loading ? 0.7 : 1
        }}>
          {loading ? 'SE ÎNCARCĂ...' : 'AUTENTIFICARE'}
        </button>

        <div style={{ textAlign: 'center', color: '#888', fontSize: 13, marginBottom: 12 }}>
          NU AI UN CONT?
        </div>
        <div style={{ textAlign: 'center' }}>
          <span onClick={() => navigate('/login')} style={{
            fontWeight: 700, fontSize: 14, cursor: 'pointer', color: '#1a1a2e'
          }}>CREAZĂ CONT</span>
        </div>
      </div>
    </div>
  );
}