import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

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

const Field = ({ label, icon, type, placeholder, value, onChange, extra }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, marginBottom: 6, display: 'block' }}>
      {label}
    </label>
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, border: '1px solid #e5e7eb',
      borderRadius: 10, padding: '12px 14px'
    }}>
      <span>{icon}</span>
      <input
        type={type} placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)}
        style={{ border: 'none', outline: 'none', fontSize: 15, width: '100%' }}
      />
      {extra}
    </div>
  </div>
);

export default function Register() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

 const handleRegister = async () => {
  if (!firstName || !lastName || !phone || !email || !password || !confirm) {
    setError('Toate câmpurile sunt obligatorii.');
    return;
  }
  if (password !== confirm) {
    setError('Parolele nu coincid.');
    return;
  }
  setLoading(true);
  setError('');
  try {
    await api.post('/auth/register', {
      email,
      password,
      firstName,
      lastName,
      phone
    });
    setSuccess(true);
    setTimeout(() => navigate('/login'), 2000);
  } catch (err) {
    const message = err?.response?.data || 'Eroare la înregistrare. Verifică datele introduse.';
    setError(typeof message === 'string' ? message : 'Eroare la înregistrare. Verifică datele introduse.');
  } finally {
    setLoading(false);
  }
};


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
            Bine ai venit<br />la bord!
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 16, lineHeight: 1.7, maxWidth: 380 }}>
            Înregistrează-te pentru a face programări, urmări statusul reparațiilor și gestiona vehiculele tale.
          </p>
        </div>

        <div />
      </div>

      {/* DREAPTA */}
      <div style={{
        width: 520, display: 'flex', flexDirection: 'column',
        justifyContent: 'flex-start', padding: '50px', background: '#fff',
        overflowY: 'auto'
      }}>

       

        <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 6, marginLeft: 120 }}>Creare cont</h2>
        <p style={{ color: '#888', fontSize: 14, marginBottom: 24, letterSpacing: 0.5 }}>
          Completează formularul de mai jos cu datele tale
        </p>

        {success && (
          <div style={{
            background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8,
            padding: '10px 14px', color: '#16a34a', fontSize: 14, marginBottom: 16
          }}>✅ Cont creat cu succes! Redirecționare...</div>
        )}

        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8,
            padding: '10px 14px', color: '#dc2626', fontSize: 14, marginBottom: 16
          }}>{error}</div>
        )}

        {/* Nume si Prenume pe aceeasi linie */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 0 }}>
          <div style={{ flex: 1 }}>
            <Field label="NUME" icon="👤" type="text"
              placeholder="Cojocaru" value={lastName} onChange={setLastName} />
          </div>
          <div style={{ flex: 1 }}>
            <Field label="PRENUME" icon="👤" type="text"
              placeholder="Maxim" value={firstName} onChange={setFirstName} />
          </div>
        </div>

        <Field label="TELEFON" icon="📞" type="tel"
          placeholder="+373 60 000 000" value={phone} onChange={setPhone} />

        <Field label="EMAIL" icon="✉️" type="email"
          placeholder="adresa@email.md" value={email} onChange={setEmail} />

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, marginBottom: 6, display: 'block' }}>
            PAROLĂ
          </label>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, border: '1px solid #e5e7eb',
            borderRadius: 10, padding: '12px 14px'
          }}>
            <span>🔒</span>
            <input
              type={showPass ? 'text' : 'password'} placeholder="••••••••" value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ border: 'none', outline: 'none', fontSize: 15, width: '100%' }}
            />
            <EyeIcon show={showPass} toggle={() => setShowPass(!showPass)} />
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, marginBottom: 6, display: 'block' }}>
            CONFIRMĂ PAROLA
          </label>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, border: '1px solid #e5e7eb',
            borderRadius: 10, padding: '12px 14px'
          }}>
            <span>🔒</span>
            <input
              type={showConfirm ? 'text' : 'password'} placeholder="••••••••" value={confirm}
              onChange={e => setConfirm(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleRegister()}
              style={{ border: 'none', outline: 'none', fontSize: 15, width: '100%' }}
            />
            <EyeIcon show={showConfirm} toggle={() => setShowConfirm(!showConfirm)} />
          </div>
        </div>

        <button onClick={handleRegister} disabled={loading} style={{
          width: '100%', background: '#2563eb', color: '#fff', border: 'none',
          borderRadius: 10, padding: '14px', fontWeight: 700, fontSize: 15,
          cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 20,
          opacity: loading ? 0.7 : 1
        }}>
          {loading ? 'SE ÎNCARCĂ...' : 'CREEAZĂ CONT'}
        </button>

        <div style={{ textAlign: 'center', color: '#888', fontSize: 13, marginBottom: 10 }}>
          AI DEJA UN CONT?
        </div>
        <div style={{ textAlign: 'center' }}>
          <span onClick={() => navigate('/login')} style={{
            fontWeight: 700, fontSize: 14, cursor: 'pointer', color: 'rgb(26, 26, 46)'
          }}>INTRĂ ÎN CONT</span>
        </div>

      </div>
    </div>
  );
}