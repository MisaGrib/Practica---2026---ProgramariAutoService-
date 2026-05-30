import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const menuItems = [
  ['overview', 'Privire Generală'],
  ['appointments', 'Programări'],
  ['mechanics', 'Mecanici'],
  ['customers', 'Clienți'],
  ['vehicles', 'Vehicule'],
  ['services', 'Servicii'],
  ['payments', 'Plăți'],
  ['users', 'Utilizatori']
];

const initialForms = {
  appointments: { id: null, customerId: '', vehicleId: '', mechanicId: '', appointmentDate: '', serviceId: '', scheduledDate: '', problemDescription: '', status: 'Programat' },
  mechanics: { id: null, firstName: '', lastName: '', phone: '', email: '' },
  customers: { id: null, firstName: '', lastName: '', phone: '', email: '' },
  vehicles: { id: null, licensePlate: '', brand: '', model: '', series: '', customerId: '' },
  services: { id: null, name: '', description: '', price: '' },
  payments: { id: null, appointmentId: '', paymentType: 'Numerar', amount: '' },
  users: { id: null, email: '', passwordHash: '', roleId: 2, isActive: true }
};

const statusStyle = {
  Programat: ['#dbeafe', '#1d4ed8'],
  'În progres': ['#fef3c7', '#b45309'],
  Complet: ['#dcfce7', '#15803d'],
  Anulat: ['#fee2e2', '#dc2626']
};

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [active, setActive] = useState('overview');
  const [data, setData] = useState({
    appointments: [], appointmentDetails: [], mechanics: [], customers: [],
    vehicles: [], vehicleDetails: [], services: [], payments: [],
    paymentDetails: [], users: [], userDetails: [], roles: []
  });
  const [forms, setForms] = useState(initialForms);
  const [searches, setSearches] = useState({
    appointments: '', mechanics: '', customers: '',
    vehicles: '', services: '', payments: '', users: ''
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setError('');
    try {
      const [
        appointments, appointmentDetails, mechanics, customers, vehicles, vehicleDetails,
        services, payments, paymentDetails, users, userDetails, roles
      ] = await Promise.all([
        api.get('/appointments'), api.get('/appointments/details'),
        api.get('/mechanic'), api.get('/customer'),
        api.get('/vehicles'), api.get('/vehicles/details'),
        api.get('/services'), api.get('/payments'),
        api.get('/payments/details'), api.get('/users'),
        api.get('/users/details'), api.get('/roles')
      ]);
      setData({
        appointments: appointments.data || [], appointmentDetails: appointmentDetails.data || [],
        mechanics: mechanics.data || [], customers: customers.data || [],
        vehicles: vehicles.data || [], vehicleDetails: vehicleDetails.data || [],
        services: services.data || [], payments: payments.data || [],
        paymentDetails: paymentDetails.data || [], users: users.data || [],
        userDetails: userDetails.data || [], roles: roles.data || []
      });
    } catch {
      setError('Nu s-au putut încărca datele. Verifică dacă backend-ul rulează.');
    }
  };

  const stats = useMemo(() => {
    const activeAppointments = data.appointmentDetails.filter(a =>
      ['Programat', 'În progres'].includes(a.status)).length;
    const now = new Date();
    const revenue = data.paymentDetails
      .filter(p => { const d = new Date(p.paymentDate); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); })
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);
    return { revenue, activeAppointments, mechanics: data.mechanics.length, customers: data.customers.length };
  }, [data]);

  const setSearch = (section, value) => setSearches(prev => ({ ...prev, [section]: value }));

  const filtered = useMemo(() => {
    const q = key => searches[key]?.toLowerCase() || '';
    return {
      appointments: data.appointmentDetails.filter(a => !q('appointments') || a.appointmentCode?.toLowerCase().includes(q('appointments')) || a.customer?.toLowerCase().includes(q('appointments')) || a.mechanic?.toLowerCase().includes(q('appointments')) || a.serviceName?.toLowerCase().includes(q('appointments')) || a.status?.toLowerCase().includes(q('appointments'))),
      mechanics: data.mechanics.filter(m => !q('mechanics') || `${m.firstName} ${m.lastName}`.toLowerCase().includes(q('mechanics')) || m.email?.toLowerCase().includes(q('mechanics')) || m.phone?.includes(q('mechanics'))),
      customers: data.customers.filter(c => !q('customers') || `${c.firstName} ${c.lastName}`.toLowerCase().includes(q('customers')) || c.email?.toLowerCase().includes(q('customers')) || c.phone?.includes(q('customers'))),
      vehicles: data.vehicleDetails.filter(v => !q('vehicles') || v.licensePlate?.toLowerCase().includes(q('vehicles')) || v.brand?.toLowerCase().includes(q('vehicles')) || v.model?.toLowerCase().includes(q('vehicles')) || v.customer?.toLowerCase().includes(q('vehicles'))),
      services: data.services.filter(s => !q('services') || s.name?.toLowerCase().includes(q('services')) || s.description?.toLowerCase().includes(q('services'))),
      payments: data.paymentDetails.filter(p => !q('payments') || p.appointmentCode?.toLowerCase().includes(q('payments')) || p.paymentType?.toLowerCase().includes(q('payments'))),
      users: data.users
        .map(u => ({ ...u, roleName: data.roles.find(r => r.id === Number(u.roleId))?.name || '' }))
        .filter(u => !q('users') || u.email?.toLowerCase().includes(q('users')) || u.roleName?.toLowerCase().includes(q('users')))
    };
  }, [data, searches]);

  const normalizePhone = value => (value || '').replace(/\D/g, '');
  const isValidEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const isValidPhone = value => /^\d{8,15}$/.test(value);

  const getServiceDurationMinutes = service => {
    if (!service) return 60;
    const name = (service.name || '').toLowerCase();
    if ((name.includes('revizie') || name.includes('service')) || (name.includes('schimb') && name.includes('ulei'))) return 120;
    if (name.includes('diagn') || name.includes('verific') || name.includes('consult')) return 60;
    if (name.includes('fr') || name.includes('ambreiaj') || name.includes('cutie')) return 180;
    if (Number(service.price || 0) >= 2500) return 180;
    return 90;
  };

  const isWithinWorkingHours = (date, durationMinutes) => {
    const day = date.getDay();
    if (day === 0) return false;
    const startMinutes = date.getHours() * 60 + date.getMinutes();
    const endMinutes = startMinutes + durationMinutes;
    if (day === 6) return startMinutes >= 9 * 60 && endMinutes <= 14 * 60;
    return startMinutes >= 8 * 60 && endMinutes <= 18 * 60;
  };

  const hasMechanicScheduleConflict = (scheduledDate, durationMinutes, mechanicId, appointments, services, excludeId = null) => {
    const newStart = new Date(scheduledDate);
    const newEnd = new Date(newStart.getTime() + durationMinutes * 60000);
    return appointments
      .filter(a => String(a.mechanicId) === String(mechanicId) && a.status !== 'Anulat' && (!excludeId || a.id !== excludeId))
      .some(a => {
        const existingStart = new Date(a.scheduledDate);
        const service = services.find(s => s.id === a.serviceId);
        const dur = getServiceDurationMinutes(service);
        const existingEnd = new Date(existingStart.getTime() + dur * 60000);
        return newStart < existingEnd && existingStart < newEnd;
      });
  };

  const setField = (section, field, value) => {
    if ((section === 'mechanics' || section === 'customers') && field === 'phone') value = normalizePhone(value);
    setForms(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  };

  const resetForm = section => setForms(prev => ({ ...prev, [section]: initialForms[section] }));

  const validateForm = (section, form) => {
    if (section === 'mechanics' || section === 'customers') {
      if (!form.firstName || !form.lastName || !form.phone || !form.email) { setError('Completează toate câmpurile.'); return false; }
      if (!isValidPhone(form.phone)) { setError('Telefonul trebuie să conțină doar cifre și minim 8 caractere.'); return false; }
      if (!isValidEmail(form.email)) { setError('Email-ul nu este valid.'); return false; }
    }
    if (section === 'appointments') {
      if (!form.customerId || !form.vehicleId || !form.mechanicId || !form.serviceId || !form.scheduledDate) {
        setError('Completează toate câmpurile obligatorii.');
        return false;
      }
      const scheduled = new Date(form.scheduledDate);
      if (Number.isNaN(scheduled.getTime())) {
        setError('Data programării este invalidă.');
        return false;
      }
      const originalAppointment = form.id ? data.appointments.find(a => a.id === form.id) : null;
      const originalScheduled = originalAppointment ? new Date(originalAppointment.scheduledDate) : null;
      const dateChanged = !originalScheduled || originalScheduled.getTime() !== scheduled.getTime();
      if (scheduled <= new Date() && (!form.id || dateChanged)) {
        setError('Data programării trebuie să fie în viitor.');
        return false;
      }
      if (form.id && ['În progres', 'Complet'].includes(form.status) && new Date() < scheduled) {
        setError("Statusul poate fi schimbat la 'În progres' sau 'Complet' doar după ora programată.");
        return false;
      }
      const service = data.services.find(s => String(s.id) === String(form.serviceId));
      if (dateChanged && !isWithinWorkingHours(scheduled, getServiceDurationMinutes(service))) {
        setError('Programarea trebuie să fie în orar: luni-vineri 08:00-18:00, sâmbătă 09:00-14:00, duminică închis.');
        return false;
      }
      const vehicle = data.vehicles.find(v => String(v.id) === String(form.vehicleId));
      if (vehicle && String(vehicle.customerId) !== String(form.customerId)) {
        setError('Vehiculul selectat nu aparține clientului ales.');
        return false;
      }
      if (dateChanged && hasMechanicScheduleConflict(scheduled, getServiceDurationMinutes(service), form.mechanicId, data.appointments, data.services, form.id)) {
        setError('Mecanicul nu este liber în acest interval. Alege o altă oră sau un alt mecanic.');
        return false;
      }
    }
    if (section === 'users') {
      if (!form.email) { setError('Selectează un email.'); return false; }
      if (!form.id && (!form.passwordHash || form.passwordHash.length < 8)) { setError('Parola trebuie să aibă cel puțin 8 caractere.'); return false; }
      if (form.passwordHash && form.passwordHash.length > 0 && form.passwordHash.length < 8) { setError('Parola trebuie să aibă cel puțin 8 caractere.'); return false; }
    }
    return true;
  };

  const save = async section => {
    setError('');
    if (!validateForm(section, forms[section])) return;
    setLoading(true);
    try {
      const form = forms[section];
      const payload = toPayload(section, form);
      if (form.id) await api.put(`${endpoints[section]}/${form.id}`, payload);
      else await api.post(endpoints[section], payload);
      resetForm(section);
      setMessage('Operația a fost salvată cu succes.');
      setTimeout(() => setMessage(''), 2200);
      await loadData();
    } catch (err) {
      setError(typeof err?.response?.data === 'string' ? err.response.data : 'Operația nu a reușit.');
    } finally { setLoading(false); }
  };

  const remove = async (section, id) => {
    if (!window.confirm('Sigur vrei să ștergi această înregistrare?')) return;
    setLoading(true); setError('');
    try {
      await api.delete(`${endpoints[section]}/${id}`);
      setMessage('Înregistrarea a fost ștearsă.');
      setTimeout(() => setMessage(''), 2200);
      await loadData();
    } catch { setError('Ștergerea nu a reușit. Posibil înregistrarea este folosită în altă tabelă.'); }
    finally { setLoading(false); }
  };

  const edit = (section, item) => {
    if (section === 'appointments') { setForms(prev => ({ ...prev, appointments: { id: item.id, customerId: item.customerId || '', vehicleId: item.vehicleId || '', mechanicId: item.mechanicId || '', serviceId: item.serviceId || '', appointmentDate: toInputDateOnly(item.scheduledDate), scheduledDate: toInputDate(item.scheduledDate), problemDescription: item.problemDescription || '', status: item.status || 'Programat' } })); return; }
    if (section === 'payments') { setForms(prev => ({ ...prev, payments: { id: item.id, appointmentId: item.appointmentId || '', paymentType: item.paymentType || 'Numerar', amount: item.amount || '' } })); return; }
    if (section === 'users') { setForms(prev => ({ ...prev, users: { id: item.id, email: item.email || '', passwordHash: '', roleId: item.roleId || 2, isActive: item.isActive ?? true } })); return; }
    setForms(prev => ({ ...prev, [section]: { ...prev[section], ...item } }));
  };

  const availableUserEmails = useMemo(() => {
    const existingEmails = new Set(data.users.map(u => u.email?.toLowerCase()));
    const customers = data.customers.filter(c => c.email && !existingEmails.has(c.email.toLowerCase())).map(c => ({ email: c.email, label: `${c.email} – Client: ${c.firstName} ${c.lastName}` }));
    const mechanics = data.mechanics.filter(m => m.email && !existingEmails.has(m.email.toLowerCase())).map(m => ({ email: m.email, label: `${m.email} – Mecanic: ${m.firstName} ${m.lastName}` }));
    return [...customers, ...mechanics];
  }, [data.customers, data.mechanics, data.users]);

  const navigateTo = key => { setActive(key); if (isMobile) setSidebarOpen(false); };

  const renderOverview = () => {
    const recent = [...data.appointmentDetails].sort((a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate)).slice(0, 5);
    return (
      <>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
          <StatCard icon={<MoneyIcon />} title={`Venit — ${monthName(new Date().getMonth() + 1)}`} value={`${stats.revenue.toLocaleString('ro-MD')} MDL`} accent="#16a34a" />
          <StatCard icon={<PulseIcon />} title="Programări active" value={stats.activeAppointments} accent="#2563eb" />
          <StatCard icon={<ToolIcon />} title="Mecanici" value={stats.mechanics} accent="#9333ea" />
          <StatCard icon={<UsersIcon />} title="Clienți" value={stats.customers} accent="#f97316" />
        </div>
        <Panel title="Ultimele 5 programări">
          <ScrollTable headers={['Cod / Serviciu', 'Client', 'Data', 'Status']}>
            {recent.map(a => (
              <tr key={a.id}>
                <Td><b>{a.serviceName}</b><div style={muted}>{a.appointmentCode}</div></Td>
                <Td>{a.customer}</Td>
                <Td>{formatDate(a.scheduledDate)}</Td>
                <Td><Status value={a.status} /></Td>
              </tr>
            ))}
          </ScrollTable>
        </Panel>
      </>
    );
  };

  const renderSection = () => {
    if (active === 'overview') return renderOverview();
    return (
      <div style={{ display: 'grid', gap: 22 }}>
        <Panel title={`${titles[active]} — formular`}>
          <div style={{ padding: isMobile ? 14 : 20 }}>{renderForm(active)}</div>
        </Panel>
        <Panel title={`${titles[active]} — listă`}>
          <SearchBar value={searches[active]} onChange={v => setSearch(active, v)} placeholder={searchPlaceholders[active]} />
          {renderTable(active)}
        </Panel>
      </div>
    );
  };

  const renderForm = section => {
    if (section === 'appointments') return <AppointmentForm form={forms.appointments} data={data} setField={setField} save={save} resetForm={resetForm} loading={loading} />;
    if (section === 'mechanics' || section === 'customers') return <PersonForm section={section} form={forms[section]} setField={setField} save={save} resetForm={resetForm} loading={loading} />;
    if (section === 'vehicles') return <VehicleForm form={forms.vehicles} data={data} setField={setField} save={save} resetForm={resetForm} loading={loading} />;
    if (section === 'services') return <ServiceForm form={forms.services} setField={setField} save={save} resetForm={resetForm} loading={loading} />;
    if (section === 'payments') return <PaymentForm form={forms.payments} data={data} setField={setField} save={save} resetForm={resetForm} loading={loading} />;
    if (section === 'users') return <UserForm form={forms.users} data={data} availableEmails={availableUserEmails} setField={setField} save={save} resetForm={resetForm} loading={loading} />;
    return null;
  };

  const renderTable = section => {
    if (section === 'appointments') return (
      <ScrollTable headers={['Cod', 'Client', 'Mecanic', 'Data', 'Status', 'Acțiuni']}>
        {filtered.appointments.map(a => <tr key={a.id}>
          <Td><b>{a.appointmentCode}</b><div style={muted}>{a.serviceName}</div></Td>
          <Td>{a.customer}</Td><Td>{a.mechanic}</Td>
          <Td>{formatDate(a.scheduledDate)}</Td>
          <Td><Status value={a.status} /></Td>
          <Td><Actions onEdit={() => edit('appointments', data.appointments.find(x => x.id === a.id) || a)} onDelete={() => remove('appointments', a.id)} /></Td>
        </tr>)}
      </ScrollTable>
    );
    if (section === 'mechanics') return (
      <ScrollTable headers={['Nume', 'Telefon', 'Email', 'Acțiuni']}>
        {filtered.mechanics.map(m => <tr key={m.id}>
          <Td>{m.firstName} {m.lastName}</Td><Td>{m.phone}</Td><Td>{m.email}</Td>
          <Td><Actions onEdit={() => edit('mechanics', m)} onDelete={() => remove('mechanics', m.id)} /></Td>
        </tr>)}
      </ScrollTable>
    );
    if (section === 'customers') return (
      <ScrollTable headers={['Nume', 'Telefon', 'Email', 'Acțiuni']}>
        {filtered.customers.map(c => <tr key={c.id}>
          <Td>{c.firstName} {c.lastName}</Td><Td>{c.phone}</Td><Td>{c.email}</Td>
          <Td><Actions onEdit={() => edit('customers', c)} onDelete={() => remove('customers', c.id)} /></Td>
        </tr>)}
      </ScrollTable>
    );
    if (section === 'vehicles') return (
      <ScrollTable headers={['Număr', 'Marcă / Model', 'Client', 'Acțiuni']}>
        {filtered.vehicles.map(v => <tr key={v.id}>
          <Td>{v.licensePlate}</Td>
          <Td>{v.brand} {v.model}<div style={muted}>{v.series}</div></Td>
          <Td>{v.customer}</Td>
          <Td><Actions onEdit={() => edit('vehicles', data.vehicles.find(x => x.id === v.id) || v)} onDelete={() => remove('vehicles', v.id)} /></Td>
        </tr>)}
      </ScrollTable>
    );
    if (section === 'services') return (
      <ScrollTable headers={['Denumire', 'Descriere', 'Preț', 'Acțiuni']}>
        {filtered.services.map(s => <tr key={s.id}>
          <Td>{s.name}</Td><Td>{s.description}</Td>
          <Td>{Number(s.price).toLocaleString('ro-MD')} MDL</Td>
          <Td><Actions onEdit={() => edit('services', s)} onDelete={() => remove('services', s.id)} /></Td>
        </tr>)}
      </ScrollTable>
    );
    if (section === 'payments') return (
      <ScrollTable headers={['Programare', 'Data', 'Tip', 'Sumă', 'Acțiuni']}>
        {filtered.payments.map(p => <tr key={p.id}>
          <Td>{p.appointmentCode}</Td><Td>{formatDate(p.paymentDate)}</Td>
          <Td>{p.paymentType}</Td><Td>{Number(p.amount).toLocaleString('ro-MD')} MDL</Td>
          <Td><Actions onEdit={() => edit('payments', data.payments.find(x => x.id === p.id) || p)} onDelete={() => remove('payments', p.id)} /></Td>
        </tr>)}
      </ScrollTable>
    );
    if (section === 'users') return (
      <ScrollTable headers={['Email', 'Rol', 'Activ', 'Acțiuni']}>
        {filtered.users.map(u => <tr key={u.id}>
          <Td style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: u.isActive ? '#16a34a' : '#dc2626' }} />
            {u.email}
          </Td>
          <Td>{u.roleName || u.name}</Td>
          <Td>{u.isActive ? 'Activ' : 'Inactiv'}</Td>
          <Td><Actions onEdit={() => edit('users', data.users.find(x => x.id === u.id) || u)} onDelete={() => remove('users', u.id)} /></Td>
        </tr>)}
      </ScrollTable>
    );
    return null;
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f5f6f8', color: '#081225', fontFamily: 'Segoe UI, sans-serif' }}>
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 40 }} />
      )}
      <aside style={{
        width: 230, background: '#fff', borderRight: '1px solid #e5e7eb',
        padding: 22, display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: isMobile ? (sidebarOpen ? 0 : -260) : 0,
        height: '100vh', zIndex: 50, transition: 'left 0.25s ease',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: '#0f172a', color: '#60a5fa', display: 'grid', placeItems: 'center', fontWeight: 900 }}>A</div>
          <b>ADMIN<span style={{ color: '#2563eb' }}>PANEL</span></b>
        </div>
        <nav style={{ display: 'grid', gap: 6 }}>
          {menuItems.map(([key, label]) => (
            <button key={key} onClick={() => navigateTo(key)} style={{
              border: 'none', textAlign: 'left', padding: '12px 14px', borderRadius: 6,
              cursor: 'pointer', fontWeight: 700, fontSize: 14,
              color: active === key ? '#fff' : '#475569',
              background: active === key ? '#0f172a' : 'transparent'
            }}>{label}</button>
          ))}
        </nav>
        <div style={{ marginTop: 'auto', paddingTop: 16 }}>
          <button onClick={() => { logout(); window.location.href = '/login'; }} style={{
            border: 'none', background: 'transparent', textAlign: 'left',
            color: '#64748b', fontWeight: 700, padding: '10px 12px', cursor: 'pointer', width: '100%'
          }}>Deconectare</button>
        </div>
      </aside>
      <main style={{ flex: 1, minWidth: 0, marginLeft: isMobile ? 0 : 230 }}>
        <header style={{
          height: 64, background: '#fff', borderBottom: '1px solid #e5e7eb',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', position: 'sticky', top: 0, zIndex: 30
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {isMobile && (
              <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
                border: 'none', background: 'none', cursor: 'pointer', padding: 4,
                display: 'flex', flexDirection: 'column', gap: 5
              }}>
                <span style={{ width: 22, height: 2, background: '#0f172a', display: 'block', borderRadius: 2 }} />
                <span style={{ width: 22, height: 2, background: '#0f172a', display: 'block', borderRadius: 2 }} />
                <span style={{ width: 22, height: 2, background: '#0f172a', display: 'block', borderRadius: 2 }} />
              </button>
            )}
            <span style={{ fontSize: isMobile ? 11 : 13, fontWeight: 900, letterSpacing: isMobile ? 1 : 3, color: '#0f172a' }}>
              SISTEM ADMINISTRARE AUTOPRO
            </span>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#0f172a', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 12 }}>
            {user?.email?.slice(0, 2).toUpperCase() || 'AD'}
          </div>
        </header>
        <section style={{ padding: isMobile ? 16 : 32 }}>
          {error && <Alert type="error">{error}</Alert>}
          {message && <Alert type="success">{message}</Alert>}
          {renderSection()}
        </section>
      </main>
    </div>
  );
}

function AppointmentForm({ form, data, setField, save, resetForm, loading }) {
  const availableVehicles = form.customerId ? data.vehicles.filter(v => String(v.customerId) === String(form.customerId)) : [];
  const selectedService = data.services.find(s => String(s.id) === String(form.serviceId));
  const selectedDate = form.appointmentDate || toInputDateOnly(form.scheduledDate);
  const selectedTime = toInputTimeOnly(form.scheduledDate);
  const isBeforeScheduledTime = form.scheduledDate ? new Date() < new Date(form.scheduledDate) : true;
  const availableTimes = getAvailableTimeSlots(selectedDate, selectedService);
  const handleDateChange = value => {
    const nextTimes = getAvailableTimeSlots(value, selectedService);
    const nextTime = nextTimes.includes(selectedTime) ? selectedTime : '';
    setField('appointments', 'appointmentDate', value);
    setField('appointments', 'scheduledDate', nextTime ? combineDateTime(value, nextTime) : '');
  };
  const handleServiceChange = value => {
    setField('appointments', 'serviceId', value);
    setField('appointments', 'scheduledDate', '');
  };
  const handleTimeChange = value => {
    setField('appointments', 'scheduledDate', selectedDate && value ? combineDateTime(selectedDate, value) : '');
  };

  return <FormGrid>
    <Select label="Client" value={form.customerId} onChange={v => { setField('appointments', 'customerId', v); setField('appointments', 'vehicleId', ''); }}>
      <option value="">Alege client</option>
      {data.customers.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
    </Select>
    <Select label="Vehicul" value={form.vehicleId} onChange={v => setField('appointments', 'vehicleId', v)}>
      <option value="">{form.customerId ? 'Alege vehicul' : 'Alege întâi clientul'}</option>
      {availableVehicles.map(v => <option key={v.id} value={v.id}>{v.licensePlate} - {v.brand} {v.model}</option>)}
    </Select>
    <Select label="Mecanic" value={form.mechanicId} onChange={v => setField('appointments', 'mechanicId', v)}>
      <option value="">Alege mecanic</option>
      {data.mechanics.map(m => <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>)}
    </Select>
    <Select label="Serviciu" value={form.serviceId} onChange={handleServiceChange}>
      <option value="">Alege serviciu</option>
      {data.services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
    </Select>
    <Input label="Data" type="date" min={toInputDateOnly(new Date())} value={selectedDate} onChange={handleDateChange} />
    <Select label="Ora" value={selectedTime} onChange={handleTimeChange} disabled={!selectedDate || !form.serviceId || availableTimes.length === 0}>
      <option value="">{!form.serviceId ? 'Alege întâi serviciul' : availableTimes.length ? 'Alege ora' : 'Nu sunt ore disponibile'}</option>
      {availableTimes.map(time => <option key={time} value={time}>{time}</option>)}
    </Select>
    <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.45, alignSelf: 'center', minWidth: 180 }}>
      Grafic: L-V 08:00-18:00, S 09:00-14:00, D închis.
    </div>
    {form.id ? (
      <Select label="Status" value={form.status} onChange={v => setField('appointments', 'status', v)}>
        <option>Programat</option>
        <option disabled={isBeforeScheduledTime}>În progres</option>
        <option disabled={isBeforeScheduledTime}>Complet</option>
        <option>Anulat</option>
      </Select>
    ) : null}
    <Input label="Problema" value={form.problemDescription} onChange={v => setField('appointments', 'problemDescription', v)} />
    <Buttons loading={loading} isEdit={form.id} onSave={() => save('appointments')} onCancel={() => resetForm('appointments')} />
  </FormGrid>;
}

function PersonForm({ section, form, setField, save, resetForm, loading }) {
  return <FormGrid>
    <Input label="Nume" value={form.lastName} onChange={v => setField(section, 'lastName', v)} />
    <Input label="Prenume" value={form.firstName} onChange={v => setField(section, 'firstName', v)} />
    <Input label="Telefon" value={form.phone} type="tel" onChange={v => setField(section, 'phone', v)} />
    <Input label="Email" type="email" value={form.email} onChange={v => setField(section, 'email', v)} />
    <Buttons loading={loading} isEdit={form.id} onSave={() => save(section)} onCancel={() => resetForm(section)} />
  </FormGrid>;
}

function VehicleForm({ form, data, setField, save, resetForm, loading }) {
  return <FormGrid>
    <Input label="Număr" value={form.licensePlate} onChange={v => setField('vehicles', 'licensePlate', v)} />
    <Input label="Marcă" value={form.brand} onChange={v => setField('vehicles', 'brand', v)} />
    <Input label="Model" value={form.model} onChange={v => setField('vehicles', 'model', v)} />
    <Input label="Serie" value={form.series} onChange={v => setField('vehicles', 'series', v)} />
    <Select label="Client" value={form.customerId} onChange={v => setField('vehicles', 'customerId', v)}>
      <option value="">Alege client</option>
      {data.customers.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
    </Select>
    <Buttons loading={loading} isEdit={form.id} onSave={() => save('vehicles')} onCancel={() => resetForm('vehicles')} />
  </FormGrid>;
}

function ServiceForm({ form, setField, save, resetForm, loading }) {
  return <FormGrid>
    <Input label="Denumire" value={form.name} onChange={v => setField('services', 'name', v)} />
    <Input label="Descriere" value={form.description} onChange={v => setField('services', 'description', v)} />
    <Input label="Preț" type="number" value={form.price} onChange={v => setField('services', 'price', v)} />
    <Buttons loading={loading} isEdit={form.id} onSave={() => save('services')} onCancel={() => resetForm('services')} />
  </FormGrid>;
}

function PaymentForm({ form, data, setField, save, resetForm, loading }) {
  return <FormGrid>
    <Select label="Programare" value={form.appointmentId} onChange={v => {
      setField('payments', 'appointmentId', v);
      const appt = data.appointmentDetails.find(a => String(a.id) === String(v));
      setField('payments', 'amount', appt ? String(appt.servicePrice) : '');
    }}>
      <option value="">Alege programare</option>
      {data.appointments.filter(a => {
        const detail = data.appointmentDetails.find(d => d.id === a.id);
        const alreadyPaid = data.payments.some(p => p.appointmentId === a.id);
        return detail?.status === 'Complet' && !alreadyPaid;
      }).map(a => <option key={a.id} value={a.id}>{a.appointmentCode}</option>)}
    </Select>
    <Select label="Tip" value={form.paymentType} onChange={v => setField('payments', 'paymentType', v)}>
      <option>Numerar</option><option>Card</option>
    </Select>
    <Input label="Sumă" type="number" value={form.amount} onChange={v => setField('payments', 'amount', v)} />
    <Buttons loading={loading} isEdit={form.id} onSave={() => save('payments')} onCancel={() => resetForm('payments')} />
  </FormGrid>;
}

function UserForm({ form, data, availableEmails, setField, save, resetForm, loading }) {
  const handleEmailChange = v => {
    setField('users', 'email', v);
    const isCustomer = data.customers.some(c => c.email?.toLowerCase() === v.toLowerCase());
    const isMechanic = data.mechanics.some(m => m.email?.toLowerCase() === v.toLowerCase());
    if (isMechanic) setField('users', 'roleId', data.roles.find(r => r.name === 'Mecanic')?.id || 3);
    else if (isCustomer) setField('users', 'roleId', data.roles.find(r => r.name === 'Client')?.id || 2);
  };

  return <FormGrid>
    {!form.id ? (
      <Select label="Email" value={form.email} onChange={handleEmailChange}>
        <option value="">Selectează email</option>
        {availableEmails.length > 0
          ? availableEmails.map(item => <option key={item.email} value={item.email}>{item.label}</option>)
          : <option disabled>Nu sunt emailuri disponibile</option>}
      </Select>
    ) : (
      <Input label="Email" type="email" value={form.email} onChange={() => {}} disabled />
    )}
    <Input label={form.id ? 'Parolă nouă (opțional)' : 'Parolă'} value={form.passwordHash} type="password" onChange={v => setField('users', 'passwordHash', v)} />
    {form.id && (
      <Select label="Rol" value={form.roleId} onChange={v => setField('users', 'roleId', v)}>
        {data.roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
      </Select>
    )}
    {!form.id && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' }}>Rol</span>
        <div style={{ height: 42, border: '1px solid #e5e7eb', borderRadius: 6, padding: '0 12px', fontSize: 14, background: '#f9fafb', display: 'flex', alignItems: 'center', color: '#475569' }}>
          {data.roles.find(r => r.id === Number(form.roleId))?.name || '—'}
        </div>
      </div>
    )}
    <Select label="Activ" value={String(form.isActive)} onChange={v => setField('users', 'isActive', v === 'true')}>
      <option value="true">Da</option><option value="false">Nu</option>
    </Select>
    <Buttons loading={loading} isEdit={form.id} onSave={() => save('users')} onCancel={() => resetForm('users')} />
  </FormGrid>;
}

const endpoints = { appointments: '/appointments', mechanics: '/mechanic', customers: '/customer', vehicles: '/vehicles', services: '/services', payments: '/payments', users: '/users' };
const titles = { appointments: 'Programări', mechanics: 'Mecanici', customers: 'Clienți', vehicles: 'Vehicule', services: 'Servicii', payments: 'Plăți', users: 'Utilizatori' };
const searchPlaceholders = { appointments: 'Caută după cod, client, mecanic, status...', mechanics: 'Caută după nume, email, telefon...', customers: 'Caută după nume, email, telefon...', vehicles: 'Caută după număr, marcă, model, client...', services: 'Caută după denumire sau descriere...', payments: 'Caută după cod programare sau tip plată...', users: 'Caută după email sau rol...' };

function toPayload(section, form) {
  if (section === 'appointments') {
    const payload = { customerId: Number(form.customerId), vehicleId: Number(form.vehicleId), mechanicId: Number(form.mechanicId), serviceId: Number(form.serviceId), scheduledDate: form.scheduledDate, problemDescription: form.problemDescription || null };
    if (form.id) payload.status = form.status;
    return payload;
  }
  if (section === 'mechanics' || section === 'customers') return { firstName: form.firstName, lastName: form.lastName, phone: form.phone, email: form.email };
  if (section === 'vehicles') return { licensePlate: form.licensePlate, brand: form.brand, model: form.model, series: form.series, customerId: Number(form.customerId) };
  if (section === 'services') return { name: form.name, description: form.description, price: Number(form.price) };
  if (section === 'payments') return { appointmentId: Number(form.appointmentId), paymentType: form.paymentType, amount: Number(form.amount) };
  if (section === 'users') return { email: form.email, passwordHash: form.passwordHash, roleId: Number(form.roleId), isActive: Boolean(form.isActive) };
  return form;
}

function toInputDate(value) {
  if (!value) return '';
  const date = new Date(value);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

function toInputDateOnly(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

function toInputTimeOnly(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function combineDateTime(date, time) {
  return date && time ? `${date}T${time}` : '';
}

function getServiceDurationMinutesForSlots(service) {
  if (!service) return 60;
  const name = (service.name || '').toLowerCase();
  if ((name.includes('revizie') || name.includes('service')) || (name.includes('schimb') && name.includes('ulei'))) return 120;
  if (name.includes('diagn') || name.includes('verific') || name.includes('consult')) return 60;
  if (name.includes('fr') || name.includes('ambreiaj') || name.includes('cutie')) return 180;
  if (Number(service.price || 0) >= 2500) return 180;
  return 90;
}

function getAvailableTimeSlots(dateValue, service) {
  if (!dateValue || !service) return [];
  const date = new Date(`${dateValue}T00:00`);
  const day = date.getDay();
  if (day === 0) return [];

  const open = day === 6 ? 9 * 60 : 8 * 60;
  const close = day === 6 ? 14 * 60 : 18 * 60;
  const duration = getServiceDurationMinutesForSlots(service);
  const now = new Date();
  const isToday = toInputDateOnly(now) === dateValue;
  const slots = [];

  for (let minutes = open; minutes + duration <= close; minutes += 30) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const slotDate = new Date(`${dateValue}T${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`);
    if (isToday && slotDate <= now) continue;
    slots.push(`${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`);
  }

  return slots;
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString('ro-MD');
}

function monthName(month) {
  const months = ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie', 'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'];
  return months[month - 1];
}

function SearchBar({ value, onChange, placeholder }) {
  return (
    <div style={{ padding: '12px 18px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ border: 'none', outline: 'none', fontSize: 14, width: '100%', color: '#1a1a2e', background: 'transparent' }} />
      {value && <span onClick={() => onChange('')} style={{ cursor: 'pointer', color: '#94a3b8', fontSize: 20, lineHeight: 1 }}>×</span>}
    </div>
  );
}

function Status({ value }) {
  const [bg, color] = statusStyle[value] || ['#e5e7eb', '#374151'];
  return <span style={{ background: bg, color, padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 800, whiteSpace: 'nowrap', textTransform: 'uppercase' }}>{value}</span>;
}

function StatCard({ icon, title, value, accent }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '22px 20px' }}>
      <div style={{ width: 40, height: 40, borderRadius: 8, background: `${accent}14`, color: accent, display: 'grid', placeItems: 'center', marginBottom: 14 }}>{icon}</div>
      <div style={{ fontSize: 26, fontWeight: 900 }}>{value}</div>
      <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginTop: 4 }}>{title}</div>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 900, marginBottom: 14 }}>{title}</h2>
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>{children}</div>
    </div>
  );
}

function ScrollTable({ headers, children }) {
  return (
    <div style={{ overflowX: 'auto', maxHeight: 420, overflowY: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
        <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
          <tr>{headers.map(h => <Th key={h}>{h}</Th>)}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function FormGrid({ children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, alignItems: 'end' }}>{children}</div>;
}

function Input({ label, type = 'text', value, onChange, disabled, min }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' }}>{label}</span>
      <input disabled={disabled} type={type} min={min} value={value ?? ''} onChange={e => onChange(e.target.value)}
        style={{ height: 42, border: '1px solid #e5e7eb', borderRadius: 6, padding: '0 12px', outline: 'none', fontSize: 14, background: disabled ? '#f9fafb' : '#fff', width: '100%', boxSizing: 'border-box' }} />
    </label>
  );
}

function Select({ label, value, onChange, children, disabled }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' }}>{label}</span>
      <select disabled={disabled} value={value ?? ''} onChange={e => onChange(e.target.value)}
        style={{ height: 42, border: '1px solid #e5e7eb', borderRadius: 6, padding: '0 12px', outline: 'none', fontSize: 14, background: disabled ? '#f9fafb' : '#fff', width: '100%', boxSizing: 'border-box' }}>{children}</select>
    </label>
  );
}

function Buttons({ loading, isEdit, onSave, onCancel }) {
  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      <button onClick={onSave} disabled={loading} style={{ height: 42, border: 'none', borderRadius: 6, padding: '0 18px', background: '#2563eb', color: '#fff', fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap' }}>
        {loading ? 'Se salvează...' : isEdit ? 'Actualizează' : 'Adaugă'}
      </button>
      {isEdit && <button onClick={onCancel} style={{ height: 42, border: '1px solid #e5e7eb', borderRadius: 6, padding: '0 18px', background: '#fff', color: '#475569', fontWeight: 800, cursor: 'pointer' }}>Anulează</button>}
    </div>
  );
}

function Actions({ onEdit, onDelete }) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <button onClick={onEdit} style={{ border: '1px solid #dbeafe', background: '#fff', color: '#2563eb', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontWeight: 800, fontSize: 12 }}>Edit</button>
      <button onClick={onDelete} style={{ border: '1px solid #fecaca', background: '#fff', color: '#dc2626', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontWeight: 800, fontSize: 12 }}>Delete</button>
    </div>
  );
}

function Th({ children }) {
  return <th style={{ padding: '12px 18px', background: '#f5f6f8', color: '#94a3b8', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', textAlign: 'left', whiteSpace: 'nowrap' }}>{children}</th>;
}

function Td({ children, style }) {
  return <td style={{ padding: '14px 18px', borderTop: '1px solid #f1f5f9', fontSize: 14, verticalAlign: 'middle', ...style }}>{children}</td>;
}

function Alert({ type, children }) {
  const err = type === 'error';
  return <div style={{ background: err ? '#fef2f2' : '#f0fdf4', border: `1px solid ${err ? '#fecaca' : '#bbf7d0'}`, color: err ? '#b91c1c' : '#15803d', padding: 14, borderRadius: 8, marginBottom: 18, fontSize: 14 }}>{children}</div>;
}

const muted = { color: '#64748b', fontSize: 12, marginTop: 3 };

function MoneyIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" /></svg>; }
function PulseIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h4l3-8 4 16 3-8h4" /></svg>; }
function ToolIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.2-3.2a6 6 0 0 1-7.8 7.8l-6.2 6.2a2.1 2.1 0 0 1-3-3l6.2-6.2a6 6 0 0 1 7.8-7.8z" /></svg>; }
function UsersIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>; }