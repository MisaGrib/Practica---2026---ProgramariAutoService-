import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const menuItems = [
  { key: 'overview', label: 'Privire Generală' },
  { key: 'appointments', label: 'Programări' },
  { key: 'mechanics', label: 'Mecanici' },
  { key: 'customers', label: 'Clienți' },
  { key: 'vehicles', label: 'Vehicule' },
  { key: 'services', label: 'Servicii' },
  { key: 'payments', label: 'Plăți' },
  { key: 'users', label: 'Utilizatori' }
];

const statusColor = {
  Programat: { bg: '#dbeafe', color: '#1d4ed8' },
  'În progres': { bg: '#fef3c7', color: '#b45309' },
  Complet: { bg: '#dcfce7', color: '#15803d' },
  Anulat: { bg: '#fee2e2', color: '#dc2626' }
};

export default function AdminDashboard() {
  const { user, logout } = useAuth();

  const [active, setActive] = useState('overview');
  const [appointments, setAppointments] = useState([]);
  const [mechanics, setMechanics] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [services, setServices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setError('');

    try {
      const [
        appointmentsRes,
        mechanicsRes,
        customersRes,
        vehiclesRes,
        servicesRes,
        paymentsRes,
        usersRes
      ] = await Promise.all([
        api.get('/appointments/details'),
        api.get('/mechanics'),
        api.get('/customers'),
        api.get('/vehicles/details'),
        api.get('/services'),
        api.get('/payments/details'),
        api.get('/users/details')
      ]);

      setAppointments(appointmentsRes.data);
      setMechanics(mechanicsRes.data);
      setCustomers(customersRes.data);
      setVehicles(vehiclesRes.data);
      setServices(servicesRes.data);
      setPayments(paymentsRes.data);
      setUsers(usersRes.data);
    } catch {
      setError('Nu s-au putut încărca datele pentru dashboard.');
    }
  };

  const stats = useMemo(() => {
    const activeAppointments = appointments.filter(a =>
      a.status === 'Programat' || a.status === 'În progres'
    ).length;

    const totalRevenue = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

    return {
      revenue: totalRevenue,
      appointments: activeAppointments,
      mechanics: mechanics.length,
      customers: customers.length
    };
  }, [appointments, payments, mechanics, customers]);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const renderStatus = (status) => {
    const style = statusColor[status] || { bg: '#e5e7eb', color: '#374151' };

    return (
      <span style={{
        background: style.bg,
        color: style.color,
        padding: '5px 10px',
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: 0.8,
        textTransform: 'uppercase'
      }}>
        {status}
      </span>
    );
  };

  const renderOverview = () => (
    <>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: 18,
        marginBottom: 30
      }}>
        <StatCard title="Venit total" value={`${stats.revenue.toLocaleString('ro-MD')} MDL`} accent="#16a34a" />
        <StatCard title="Programări active" value={stats.appointments} accent="#2563eb" />
        <StatCard title="Mecanici" value={stats.mechanics} accent="#9333ea" />
        <StatCard title="Clienți" value={stats.customers} accent="#f97316" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <Panel title="Programări Recente">
          <table style={tableStyle}>
            <thead>
              <tr>
                <Th>Cod / Serviciu</Th>
                <Th>Client</Th>
                <Th>Data</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {appointments.slice(0, 6).map(item => (
                <tr key={item.id}>
                  <Td>
                    <strong>{item.serviceName}</strong>
                    <div style={muted}>{item.appointmentCode}</div>
                  </Td>
                  <Td>{item.customer}</Td>
                  <Td>{new Date(item.scheduledDate).toLocaleString('ro-MD')}</Td>
                  <Td>{renderStatus(item.status)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel title="Acțiuni Rapide">
          <QuickAction title="Mecanic nou" text="Adaugă un mecanic în echipă" onClick={() => setActive('mechanics')} dark />
          <QuickAction title="Serviciu nou" text="Adaugă un tip de reparație" onClick={() => setActive('services')} blue />
          <QuickAction title="Clienți & flotă" text="Gestionează clienții înregistrați" onClick={() => setActive('customers')} />
        </Panel>
      </div>
    </>
  );

  const renderTable = () => {
    if (active === 'appointments') {
      return (
        <DataTable title="Programări" headers={['Cod', 'Client', 'Vehicul', 'Mecanic', 'Serviciu', 'Data', 'Status']}>
          {appointments.map(a => (
            <tr key={a.id}>
              <Td>{a.appointmentCode}</Td>
              <Td>{a.customer}</Td>
              <Td>{a.licensePlate}</Td>
              <Td>{a.mechanic}</Td>
              <Td>{a.serviceName}</Td>
              <Td>{new Date(a.scheduledDate).toLocaleString('ro-MD')}</Td>
              <Td>{renderStatus(a.status)}</Td>
            </tr>
          ))}
        </DataTable>
      );
    }

    if (active === 'mechanics') {
      return (
        <DataTable title="Mecanici" headers={['Nume', 'Telefon', 'Email']}>
          {mechanics.map(m => (
            <tr key={m.id}>
              <Td>{m.firstName} {m.lastName}</Td>
              <Td>{m.phone}</Td>
              <Td>{m.email}</Td>
            </tr>
          ))}
        </DataTable>
      );
    }

    if (active === 'customers') {
      return (
        <DataTable title="Clienți" headers={['Nume', 'Telefon', 'Email']}>
          {customers.map(c => (
            <tr key={c.id}>
              <Td>{c.firstName} {c.lastName}</Td>
              <Td>{c.phone}</Td>
              <Td>{c.email}</Td>
            </tr>
          ))}
        </DataTable>
      );
    }

    if (active === 'vehicles') {
      return (
        <DataTable title="Vehicule" headers={['Număr', 'Marcă', 'Model', 'Serie', 'Client']}>
          {vehicles.map(v => (
            <tr key={v.id}>
              <Td>{v.licensePlate}</Td>
              <Td>{v.brand}</Td>
              <Td>{v.model}</Td>
              <Td>{v.series}</Td>
              <Td>{v.customer}</Td>
            </tr>
          ))}
        </DataTable>
      );
    }

    if (active === 'services') {
      return (
        <DataTable title="Servicii" headers={['Denumire', 'Descriere', 'Preț']}>
          {services.map(s => (
            <tr key={s.id}>
              <Td>{s.name}</Td>
              <Td>{s.description}</Td>
              <Td>{Number(s.price).toLocaleString('ro-MD')} MDL</Td>
            </tr>
          ))}
        </DataTable>
      );
    }

    if (active === 'payments') {
      return (
        <DataTable title="Plăți" headers={['Programare', 'Data', 'Tip', 'Sumă']}>
          {payments.map(p => (
            <tr key={p.id}>
              <Td>{p.appointmentCode}</Td>
              <Td>{new Date(p.paymentDate).toLocaleString('ro-MD')}</Td>
              <Td>{p.paymentType}</Td>
              <Td>{Number(p.amount).toLocaleString('ro-MD')} MDL</Td>
            </tr>
          ))}
        </DataTable>
      );
    }

    if (active === 'users') {
      return (
        <DataTable title="Utilizatori" headers={['Email', 'Rol']}>
          {users.map(u => (
            <tr key={u.id}>
              <Td>{u.email}</Td>
              <Td>{u.name}</Td>
            </tr>
          ))}
        </DataTable>
      );
    }

    return renderOverview();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f8fafc', color: '#081225', fontFamily: 'Segoe UI, sans-serif' }}>
      <aside style={{
        width: 230,
        background: '#fff',
        borderRight: '1px solid #e5e7eb',
        padding: 22,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: '#0f172a',
            color: '#60a5fa',
            display: 'grid',
            placeItems: 'center',
            fontWeight: 900
          }}>
            A
          </div>
          <strong>ADMIN<span style={{ color: '#2563eb' }}>PANEL</span></strong>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {menuItems.map(item => (
            <button key={item.key} onClick={() => setActive(item.key)} style={{
              border: 'none',
              textAlign: 'left',
              padding: '13px 14px',
              borderRadius: 10,
              cursor: 'pointer',
              fontWeight: 700,
              color: active === item.key ? '#fff' : '#475569',
              background: active === item.key ? '#0f172a' : 'transparent'
            }}>
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={() => window.location.href = '/'} style={sideBottomButton}>Pagina principală</button>
          <button onClick={handleLogout} style={sideBottomButton}>Deconectare</button>
        </div>
      </aside>

      <main style={{ flex: 1 }}>
        <header style={{
          height: 72,
          background: '#fff',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px'
        }}>
          <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: 4 }}>
            SISTEM ADMINISTRARE AUTOPRO
          </div>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: '#0f172a',
            color: '#fff',
            display: 'grid',
            placeItems: 'center',
            fontWeight: 900,
            fontSize: 12
          }}>
            {user?.email?.slice(0, 2).toUpperCase() || 'AD'}
          </div>
        </header>

        <section style={{ padding: 32 }}>
          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              padding: 14,
              borderRadius: 10,
              marginBottom: 18
            }}>
              {error}
            </div>
          )}

          {active === 'overview' ? renderOverview() : renderTable()}
        </section>
      </main>
    </div>
  );
}

function StatCard({ title, value, accent }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: 18,
      padding: 26,
      boxShadow: '0 2px 8px rgba(15,23,42,0.04)'
    }}>
      <div style={{
        width: 42,
        height: 42,
        borderRadius: 12,
        background: `${accent}14`,
        color: accent,
        display: 'grid',
        placeItems: 'center',
        fontSize: 22,
        fontWeight: 900,
        marginBottom: 18
      }}>
        •
      </div>
      <div style={{ fontSize: 28, fontWeight: 900 }}>{value}</div>
      <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 900, letterSpacing: 1.2, textTransform: 'uppercase' }}>
        {title}
      </div>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 16 }}>{title}</h2>
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 18,
        overflow: 'hidden'
      }}>
        {children}
      </div>
    </div>
  );
}

function QuickAction({ title, text, onClick, dark, blue }) {
  return (
    <button onClick={onClick} style={{
      width: '100%',
      textAlign: 'left',
      border: '1px solid #e5e7eb',
      background: dark ? '#0f172a' : blue ? '#2563eb' : '#fff',
      color: dark || blue ? '#fff' : '#0f172a',
      borderRadius: 16,
      padding: 24,
      cursor: 'pointer',
      marginBottom: 14
    }}>
      <div style={{ fontSize: 17, fontWeight: 900, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13, opacity: 0.8 }}>{text}</div>
    </button>
  );
}

function DataTable({ title, headers, children }) {
  return (
    <Panel title={title}>
      <table style={tableStyle}>
        <thead>
          <tr>
            {headers.map(header => <Th key={header}>{header}</Th>)}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </Panel>
  );
}

function Th({ children }) {
  return (
    <th style={{
      padding: '14px 20px',
      background: '#f8fafc',
      color: '#94a3b8',
      fontSize: 11,
      letterSpacing: 1,
      textTransform: 'uppercase',
      textAlign: 'left'
    }}>
      {children}
    </th>
  );
}

function Td({ children }) {
  return (
    <td style={{
      padding: '16px 20px',
      borderTop: '1px solid #f1f5f9',
      fontSize: 14
    }}>
      {children}
    </td>
  );
}

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse'
};

const muted = {
  color: '#64748b',
  fontSize: 12,
  marginTop: 4
};

const sideBottomButton = {
  border: 'none',
  background: 'transparent',
  textAlign: 'left',
  color: '#64748b',
  fontWeight: 700,
  padding: '10px 12px',
  cursor: 'pointer'
};