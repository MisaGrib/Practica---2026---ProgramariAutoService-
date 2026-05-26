import { useNavigate } from 'react-router-dom';

const services = [
  {
    title: 'Diagnosticare Motor',
    description: 'Folosim echipamente de ultimă generație pentru a identifica rapid orice problemă.',
    img: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400&q=80',
  },
  {
    title: 'Mentenanță Frâne',
    description: 'Siguranța ta este prioritatea noastră. Înlocuim plăcuțe și discuri cu piese de calitate.',
    img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
  },
  {
    title: 'Schimb Ulei & Filtre',
    description: 'Păstrează motorul sănătos cu revizii periodice conform specificațiilor producătorului.',
    img: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=400&q=80',
  },
  {
    title: 'Service Climatizare',
    description: 'Încărcare cu freon și igienizare sistem AC pentru confortul tău în orice sezon.',
    img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&q=80',
  },
];

const stats = [
  { value: '12+', label: 'ANI DE EXPERIENȚĂ' },
  { value: '5k+', label: 'MAȘINI REPARATE' },
  { value: '15+', label: 'MECANICI EXPERȚI' },
  { value: '99%', label: 'RATA DE SATISFACȚIE' },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: 'Segoe UI, sans-serif', color: '#1a1a2e' }}>

      {/* NAVBAR */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 60px', background: '#fff', boxShadow: '0 1px 8px rgba(0,0,0,0.07)',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            background: '#2563eb', borderRadius: 10, width: 36, height: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18
          }}>🚗</div>
          <span style={{ fontWeight: 800, fontSize: 20 }}>
            AutoPro <span style={{ color: '#2563eb' }}>Moldova</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 36, fontSize: 15, fontWeight: 500 }}>
          {['Acasă', 'Servicii', 'Despre Noi', 'Contact'].map(item => (
            <a key={item} href="#" style={{ textDecoration: 'none', color: '#1a1a2e' }}>{item}</a>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={() => navigate('/login')} style={{
            background: 'none', border: 'none', fontWeight: 600,
            fontSize: 15, cursor: 'pointer', color: '#1a1a2e'
          }}>INTRĂ ÎN CONT</button>
          <button onClick={() => navigate('/login')} style={{
            background: '#2563eb', color: '#fff', border: 'none',
            borderRadius: 8, padding: '10px 22px', fontWeight: 700,
            fontSize: 15, cursor: 'pointer'
          }}>CONT NOU</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '80px 60px', background: '#f0f4ff', minHeight: '85vh'
      }}>
        <div style={{ maxWidth: 560 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#e0e7ff', borderRadius: 20, padding: '6px 16px',
            fontSize: 13, fontWeight: 600, color: '#2563eb', marginBottom: 24
          }}>
            🛡️ CEL MAI BUN SERVICE AUTO DIN CHIȘINĂU
          </div>
          <h1 style={{ fontSize: 54, fontWeight: 900, lineHeight: 1.15, margin: '0 0 24px' }}>
            Îngrijire<br />Profesională<br />pentru <span style={{ color: '#2563eb' }}>Mașina Ta</span>
          </h1>
          <p style={{ fontSize: 17, color: '#555', marginBottom: 36, lineHeight: 1.7 }}>
            Oferim servicii premium de întreținere și reparații auto. Mecanici
            certificați, piese de origine și garanție pentru fiecare lucrare.
          </p>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/login')} style={{
              background: '#2563eb', color: '#fff', border: 'none',
              borderRadius: 10, padding: '16px 32px', fontWeight: 700,
              fontSize: 16, cursor: 'pointer'
            }}>Programează-te Acum</button>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: '#fff', borderRadius: 10, padding: '12px 20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <span style={{ fontSize: 22 }}>📞</span>
              <div>
                <div style={{ fontSize: 12, color: '#888' }}>Sună-ne</div>
                <div style={{ fontWeight: 700 }}>+373 60 123 456</div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 36 }}>
            <div style={{ display: 'flex' }}>
              {['👨', '👩', '👨', '👩'].map((e, i) => (
                <span key={i} style={{
                  fontSize: 24, marginLeft: i === 0 ? 0 : -8,
                  border: '2px solid #fff', borderRadius: '50%'
                }}>{e}</span>
              ))}
            </div>
            <span style={{ fontSize: 14, color: '#555' }}>
              <strong>500+</strong> clienți mulțumiți luna aceasta
            </span>
          </div>
        </div>

        <div style={{ position: 'relative', maxWidth: 520 }}>
          <img
            src="https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=600&q=80"
            alt="Service auto"
            style={{ borderRadius: 20, width: '100%', objectFit: 'cover', maxHeight: 480 }}
          />
          <div style={{
            position: 'absolute', bottom: 24, right: -20,
            background: '#fff', borderRadius: 14, padding: '14px 20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: 12
          }}>
            <div style={{
              background: '#fff7ed', borderRadius: 10, width: 40, height: 40,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20
            }}>🔧</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Rapid & Eficient</div>
              <div style={{ fontSize: 12, color: '#888' }}>Reparații în aceeași zi</div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICII */}
      <section style={{ padding: '80px 60px', background: '#fff', textAlign: 'center' }}>
        <div style={{ color: '#2563eb', fontWeight: 700, fontSize: 13, letterSpacing: 2, marginBottom: 12 }}>
          SERVICIILE NOASTRE
        </div>
        <h2 style={{ fontSize: 38, fontWeight: 900, marginBottom: 12 }}>
          Soluții Complete pentru Vehiculul Tău
        </h2>
        <p style={{ color: '#666', fontSize: 16, marginBottom: 56 }}>
          De la mentenanță de rutină până la reparații complexe, suntem pregătiți să readucem mașina ta pe drum.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          {services.map((s) => (
            <div key={s.title} style={{
              background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16,
              overflow: 'hidden', textAlign: 'left', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <img src={s.img} alt={s.title} style={{ width: '100%', height: 180, objectFit: 'cover' }} />
              <div style={{ padding: '20px' }}>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>{s.description}</p>
                <button onClick={() => navigate('/login')} style={{
                  background: 'none', border: 'none', color: '#2563eb',
                  fontWeight: 700, fontSize: 13, cursor: 'pointer', letterSpacing: 1
                }}>PROGRAMARE →</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
        padding: '60px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24
      }}>
        {stats.map((s) => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, fontWeight: 900, color: '#2563eb' }}>{s.value}</div>
            <div style={{ fontSize: 13, color: '#94a3b8', letterSpacing: 2, marginTop: 8 }}>{s.label}</div>
          </div>
        ))}
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#f8fafc', padding: '60px', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 40 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                background: '#2563eb', borderRadius: 10, width: 36, height: 36,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18
              }}>🚗</div>
              <span style={{ fontWeight: 800, fontSize: 18 }}>AutoPro</span>
            </div>
            <p style={{ color: '#666', fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
              Pasiune pentru excelență și precizie în tot ce facem. Service auto de încredere în inima Moldovei.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              {['f', 'in', 'ig'].map(s => (
                <div key={s} style={{
                  width: 36, height: 36, borderRadius: '50%', border: '1px solid #e5e7eb',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#555'
                }}>{s}</div>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ fontWeight: 700, marginBottom: 16 }}>Link-uri Rapide</h4>
            {['Acasă', 'Servicii', 'Despre Noi', 'Intră în cont'].map(l => (
              <div key={l} style={{ color: '#666', fontSize: 14, marginBottom: 10, cursor: 'pointer' }}>{l}</div>
            ))}
          </div>
          <div>
            <h4 style={{ fontWeight: 700, marginBottom: 16 }}>Program de Lucru</h4>
            {[
              ['Luni - Vineri:', '08:00 - 18:00'],
              ['Sâmbătă:', '09:00 - 14:00'],
              ['Duminică:', 'ÎNCHIS'],
            ].map(([zi, ora]) => (
              <div key={zi} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 10 }}>
                <span style={{ color: '#666' }}>{zi}</span>
                <span style={{ fontWeight: ora === 'ÎNCHIS' ? 700 : 400, color: ora === 'ÎNCHIS' ? '#2563eb' : '#1a1a2e' }}>{ora}</span>
              </div>
            ))}
          </div>
          <div>
            <h4 style={{ fontWeight: 700, marginBottom: 16 }}>Informații Contact</h4>
            {[
              ['📍', 'Strada Alba Iulia 12, Chișinău, Moldova'],
              ['📞', '+373 60 123 456'],
              ['✉️', 'contact@autopro.md'],
            ].map(([icon, text]) => (
              <div key={text} style={{ display: 'flex', gap: 10, fontSize: 14, color: '#666', marginBottom: 12 }}>
                <span>{icon}</span><span>{text}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{
          borderTop: '1px solid #e5e7eb', paddingTop: 24,
          display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#888'
        }}>
          <span>© 2026 AUTOPRO MOLDOVA. TOATE DREPTURILE REZERVATE.</span>
          <div style={{ display: 'flex', gap: 24 }}>
            <span style={{ cursor: 'pointer' }}>TERMENI ȘI CONDIȚII</span>
            <span style={{ cursor: 'pointer' }}>POLITICA DE CONFIDENȚIALITATE</span>
          </div>
        </div>
      </footer>

    </div>
  );
}