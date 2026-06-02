import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 860);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 860);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return isMobile;
}

const services = [
  {
    title: 'Diagnosticare motor',
    description: 'Verificăm rapid problemele motorului cu echipamente moderne.',
    img: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&q=80',
  },
  {
    title: 'Sistem de frânare',
    description: 'Înlocuim plăcuțe, discuri și verificăm siguranța sistemului.',
    img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
  },
  {
    title: 'Schimb ulei și filtre',
    description: 'Revizii simple și corecte pentru întreținerea motorului.',
    img: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=600&q=80',
  },
  {
    title: 'Climatizare auto',
    description: 'Încărcare freon și verificare sistem AC pentru orice sezon.',
    img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80',
  },
];

const stats = [
  { value: '12+', label: 'ani experiență' },
  { value: '5k+', label: 'mașini reparate' },
  { value: '15+', label: 'mecanici' },
  { value: '99%', label: 'clienți mulțumiți' },
];

export default function Home() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Acasă', target: 'home' },
    { label: 'Servicii', target: 'services' },
    { label: 'Despre noi', target: 'about' },
    { label: 'Contact', target: 'contact' },
  ];

  const goToSection = (target) => {
    document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMenuOpen(false);
  };

  return (
    <div style={{ fontFamily: 'Segoe UI, Arial, sans-serif', color: '#172033', background: '#fff', overflowX: 'hidden' }}>
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        background: '#fff',
        borderBottom: '1px solid #e5e7eb',
        padding: isMobile ? '12px 16px' : '16px 58px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: isMobile ? 'wrap' : 'nowrap',
        }}>
          <Logo />

          {!isMobile && (
            <div style={{ display: 'flex', gap: 28, fontSize: 15, fontWeight: 600 }}>
              {navLinks.map((item) => (
                <button key={item.target} onClick={() => goToSection(item.target)} style={navButton}>
                  {item.label}
                </button>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginLeft: isMobile ? 'auto' : 0, alignItems: 'center' }}>
            {!isMobile && (
              <>
                <button onClick={() => navigate('/login')} style={secondaryButton(false)}>Intră în cont</button>
                <button onClick={() => navigate('/register')} style={primaryButton(false)}>Cont nou</button>
              </>
            )}
            {isMobile && (
              <button
                onClick={() => setMenuOpen(prev => !prev)}
                aria-label="Deschide meniul"
                style={{
                  width: 42,
                  height: 42,
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  background: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 5,
                  cursor: 'pointer',
                }}
              >
                <span style={hamburgerLine} />
                <span style={hamburgerLine} />
                <span style={hamburgerLine} />
              </button>
            )}
          </div>
        </div>

        {isMobile && menuOpen && (
          <div style={{
            marginTop: 12,
            padding: 12,
            border: '1px solid #e5e7eb',
            borderRadius: 10,
            background: '#fff',
            display: 'grid',
            gap: 8,
          }}>
            {navLinks.map((item) => (
              <button key={item.target} onClick={() => goToSection(item.target)} style={mobileNavButton}>
                {item.label}
              </button>
            ))}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 6 }}>
              <button onClick={() => navigate('/login')} style={secondaryButton(true)}>Intră în cont</button>
              <button onClick={() => navigate('/register')} style={primaryButton(true)}>Cont nou</button>
            </div>
          </div>
        )}
      </nav>

      <section id="home" style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1.05fr .95fr',
        gap: isMobile ? 28 : 52,
        alignItems: 'center',
        padding: isMobile ? '34px 16px 44px' : '72px 58px',
        background: '#f3f6fb',
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: '#e8eefc',
            color: '#2563eb',
            borderRadius: 999,
            padding: '7px 14px',
            fontSize: 12,
            fontWeight: 800,
            marginBottom: 20,
          }}>
            Service auto în Chișinău
          </div>

          <h1 style={{
            fontSize: isMobile ? 36 : 56,
            lineHeight: 1.08,
            margin: '0 0 20px',
            fontWeight: 900,
            letterSpacing: 0,
          }}>
            Îngrijire auto simplă, rapidă și corectă
          </h1>

          <p style={{
            fontSize: isMobile ? 15 : 17,
            lineHeight: 1.7,
            color: '#526176',
            maxWidth: 620,
            marginBottom: 28,
          }}>
            Programează mașina la service, alege serviciul potrivit și urmărește statutul lucrării direct din contul tău.
          </p>

          <div style={{ display: 'flex', gap: 14, alignItems: 'stretch', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/login')} style={{ ...primaryButton(false), minHeight: 48, padding: '0 24px' }}>
              Programează-te
            </button>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: 10,
              padding: '10px 16px',
              minHeight: 48,
            }}>
              <span style={{ fontSize: 20 }}>☎</span>
              <div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Sună-ne</div>
                <div style={{ fontWeight: 800 }}>+373 60 123 456</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ position: 'relative', minWidth: 0 }}>
          <img
            src="https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=900&q=85"
            alt="Service auto"
            style={{
              width: '100%',
              height: isMobile ? 280 : 470,
              objectFit: 'cover',
              borderRadius: 14,
              display: 'block',
            }}
          />
          <div style={{
            position: isMobile ? 'static' : 'absolute',
            right: 18,
            bottom: 18,
            marginTop: isMobile ? 12 : 0,
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 10,
            padding: '12px 15px',
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            boxShadow: isMobile ? 'none' : '0 12px 28px rgba(15,23,42,.14)',
          }}>
            <span style={{ fontSize: 22 }}>🔧</span>
            <div>
              <div style={{ fontWeight: 800 }}>Rapid și eficient</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>Programări ușor de gestionat</div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" style={{ padding: isMobile ? '42px 16px' : '70px 58px', background: '#fff' }}>
        <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 34px' }}>
          <div style={{ color: '#2563eb', fontWeight: 800, fontSize: 12, letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 10 }}>
            Serviciile noastre
          </div>
          <h2 style={{ fontSize: isMobile ? 28 : 38, margin: '0 0 12px', fontWeight: 900 }}>
            Soluții pentru vehiculul tău
          </h2>
          <p style={{ color: '#64748b', lineHeight: 1.6, margin: 0 }}>
            De la revizii simple până la reparații mai complexe, lucrăm organizat și transparent.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, minmax(0, 1fr))',
          gap: 20,
        }}>
          {services.map((service) => (
            <article key={service.title} style={{
              border: '1px solid #e5e7eb',
              borderRadius: 10,
              overflow: 'hidden',
              background: '#fff',
            }}>
              <img src={service.img} alt={service.title} style={{ width: '100%', height: 170, objectFit: 'cover', display: 'block' }} />
              <div style={{ padding: 18 }}>
                <h3 style={{ margin: '0 0 8px', fontSize: 17 }}>{service.title}</h3>
                <p style={{ margin: '0 0 14px', color: '#64748b', fontSize: 14, lineHeight: 1.55 }}>{service.description}</p>
                <button onClick={() => navigate('/login')} style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#2563eb',
                  fontWeight: 800,
                  cursor: 'pointer',
                  padding: 0,
                }}>
                  Programare →
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="about" style={{
        background: '#111827',
        padding: isMobile ? '34px 16px' : '48px 58px',
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: isMobile ? 18 : 24,
      }}>
        {stats.map((stat) => (
          <div key={stat.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: isMobile ? 34 : 44, fontWeight: 900, color: '#60a5fa' }}>{stat.value}</div>
            <div style={{ fontSize: 12, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: 1 }}>{stat.label}</div>
          </div>
        ))}
      </section>

      <footer id="contact" style={{ background: '#f8fafc', padding: isMobile ? '34px 16px' : '54px 58px', borderTop: '1px solid #e5e7eb' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1.2fr 1.3fr',
          gap: 30,
          marginBottom: 28,
        }}>
          <div>
            <Logo />
            <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7, marginTop: 14, maxWidth: 420 }}>
              Service auto pentru clienți care vor programări clare, comunicare simplă și lucrări făcute la timp.
            </p>
          </div>

          <FooterColumn title="Link-uri">
            {['Acasă', 'Servicii', 'Despre noi', 'Intră în cont'].map((item) => (
              <div key={item} style={footerLine}>{item}</div>
            ))}
          </FooterColumn>

          <FooterColumn title="Program">
            <div style={footerLine}>Luni - Vineri: 08:00 - 18:00</div>
            <div style={footerLine}>Sâmbătă: 09:00 - 14:00</div>
            <div style={footerLine}>Duminică: Închis</div>
          </FooterColumn>

          <FooterColumn title="Contact">
            <div style={footerLine}>Strada Alba Iulia 12, Chișinău</div>
            <div style={footerLine}>+373 60 123 456</div>
            <div style={footerLine}>contact@autopro.md</div>
          </FooterColumn>
        </div>

        <div style={{
          borderTop: '1px solid #e5e7eb',
          paddingTop: 20,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 10,
          justifyContent: 'space-between',
          color: '#64748b',
          fontSize: 13,
        }}>
          <span>© 2026 AutoPro Moldova. Toate drepturile rezervate.</span>
          <span>Termeni și condiții · Politica de confidențialitate</span>
        </div>
      </footer>
    </div>
  );
}

function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        background: '#2563eb',
        borderRadius: 9,
        width: 38,
        height: 38,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.2-3.2a6 6 0 0 1-7.8 7.8l-6.2 6.2a2.1 2.1 0 0 1-3-3l6.2-6.2a6 6 0 0 1 7.8-7.8z" />
        </svg>
      </div>
      <span style={{ fontWeight: 900, fontSize: 20, whiteSpace: 'nowrap' }}>
        AutoPro <span style={{ color: '#2563eb' }}>Moldova</span>
      </span>
    </div>
  );
}

function FooterColumn({ title, children }) {
  return (
    <div>
      <h4 style={{ margin: '0 0 14px', fontSize: 15 }}>{title}</h4>
      {children}
    </div>
  );
}

const primaryButton = (small) => ({
  background: '#2563eb',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  padding: small ? '9px 13px' : '10px 20px',
  fontWeight: 800,
  fontSize: small ? 13 : 15,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
});

const secondaryButton = (small) => ({
  background: '#fff',
  color: '#172033',
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  padding: small ? '9px 12px' : '10px 16px',
  fontWeight: 800,
  fontSize: small ? 13 : 15,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
});

const navButton = {
  border: 'none',
  background: 'transparent',
  color: '#27364d',
  fontSize: 15,
  fontWeight: 700,
  cursor: 'pointer',
  padding: 0,
};

const mobileNavButton = {
  border: 'none',
  background: '#f8fafc',
  color: '#172033',
  borderRadius: 8,
  padding: '11px 12px',
  textAlign: 'left',
  fontWeight: 800,
  cursor: 'pointer',
};

const hamburgerLine = {
  width: 20,
  height: 2,
  background: '#172033',
  borderRadius: 2,
};

const footerLine = {
  color: '#64748b',
  fontSize: 14,
  marginBottom: 9,
  lineHeight: 1.5,
};
