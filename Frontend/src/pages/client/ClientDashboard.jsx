import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const MONTHS = ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie', 'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'];

const statusStyle = {
  Programat: ['#dbeafe', '#1d4ed8'],
  'În progres': ['#fef3c7', '#b45309'],
  Complet: ['#dcfce7', '#15803d'],
  Anulat: ['#fee2e2', '#dc2626']
};

const menuItems = [
  ['overview', 'Privire de Ansamblu'],
  ['appointments', 'Programările Mele'],
  ['vehicles', 'Vehiculele Mele'],
  ['services', 'Servicii Disponibile'],
];

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

export default function ClientDashboard() {
  const { user, logout } = useAuth();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [active, setActive] = useState('overview');
  const [customer, setCustomer] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [services, setServices] = useState([]);
  const [mechanics, setMechanics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [apptFilter, setApptFilter] = useState('Toate');
  const [apptSearch, setApptSearch] = useState('');
  const [showBooking, setShowBooking] = useState(false);
  const [bookingForm, setBookingForm] = useState({ vehicleId: '', mechanicId: '', serviceId: '', appointmentDate: '', scheduledDate: '' });
  const [bookingError, setBookingError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
const [vehicleForm, setVehicleForm] = useState({ licensePlate: '', brand: '', model: '', series: '' });
const [vehicleError, setVehicleError] = useState('');
const [vehicleLoading, setVehicleLoading] = useState(false);

  useEffect(() => { loadData(); }, [user]);

  const loadData = async () => {
    if (!user?.email) return;
    setError('');
    try {
      const customerRes = await api.get(`/customer/email/${encodeURIComponent(user.email)}`);
      const c = customerRes.data;
      setCustomer(c);

      const [apptRes, vehicleRes, serviceRes, mechanicRes] = await Promise.all([
        api.get('/appointments/details'),
        api.get('/vehicles'),
        api.get('/services'),
        api.get('/mechanic'),
      ]);

      const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
      const mine = (apptRes.data || []).filter(a => a.customer?.toLowerCase() === fullName);
      setAppointments(mine);

      const myVehicles = (vehicleRes.data || []).filter(v => v.customerId === c.id);
      setVehicles(myVehicles);

      setServices(serviceRes.data || []);
      setMechanics(mechanicRes.data || []);
    } catch {
      setError('Nu s-au putut încărca datele.');
    }
  };

  const stats = useMemo(() => ({
    active: appointments.filter(a => ['Programat', 'În progres'].includes(a.status)).length,
    finalizate: appointments.filter(a => a.status === 'Complet').length,
    vehicule: vehicles.length,
  }), [appointments, vehicles]);

  const filteredAppointments = useMemo(() => {
    return appointments
      .filter(a => apptFilter === 'Toate' || a.status === apptFilter)
      .filter(a => {
        if (!apptSearch) return true;
        const search = apptSearch.toLowerCase();
        const appointmentDate = a.scheduledDate ? formatAppointmentSearchDate(new Date(a.scheduledDate)) : '';
        return a.serviceName?.toLowerCase().includes(search)
          || a.appointmentCode?.toLowerCase().includes(search)
          || a.mechanic?.toLowerCase().includes(search)
          || a.licensePlate?.toLowerCase().includes(search)
          || appointmentDate.includes(search);
      })
      .sort((a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate));
  }, [appointments, apptFilter, apptSearch]);

  const recentAppointments = useMemo(() =>
    [...appointments].sort((a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate)).slice(0, 5),
    [appointments]
  );

  const getServiceDuration = service => {
    if (!service) return 60;
    const name = (service.name || '').toLowerCase();
    if ((name.includes('revizie') || name.includes('service')) || (name.includes('schimb') && name.includes('ulei'))) return 120;
    if (name.includes('diagn') || name.includes('verific') || name.includes('consult')) return 60;
    if (name.includes('fr') || name.includes('ambreiaj') || name.includes('cutie')) return 180;
    if (Number(service.price || 0) >= 2500) return 180;
    return 90;
  };

  const getAvailableTimeSlots = (dateValue, service) => {
    if (!dateValue || !service) return [];
    const date = new Date(`${dateValue}T00:00`);
    const day = date.getDay();
    if (day === 0) return [];
    const open = day === 6 ? 9 * 60 : 8 * 60;
    const close = day === 6 ? 14 * 60 : 18 * 60;
    const duration = getServiceDuration(service);
    const now = new Date();
    const isToday = dateValue === toInputDateOnly(now);
    const slots = [];
    for (let minutes = open; minutes + duration <= close; minutes += 30) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      const slotDate = new Date(`${dateValue}T${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`);
      if (isToday && slotDate <= now) continue;
      slots.push(`${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`);
    }
    return slots;
  };

  const formatAppointmentSearchDate = date => {
    if (!date || Number.isNaN(new Date(date).getTime())) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}.${month}.${year} ${hours}:${minutes} ${year}-${month}-${day}`;
  };

  const getAvailableBookingSlots = (dateValue, service, mechanicId) => {
    const slots = getAvailableTimeSlots(dateValue, service);
    if (!dateValue || !service || !mechanicId) return slots;
    const mechanic = mechanics.find(m => String(m.id) === String(mechanicId));
    if (!mechanic) return slots;
    const mechanicName = `${mechanic.firstName} ${mechanic.lastName}`.toLowerCase();
    const occupied = appointments
      .filter(a => a.status !== 'Anulat' && a.mechanic?.toLowerCase() === mechanicName)
      .filter(a => toInputDateOnly(a.scheduledDate) === dateValue)
      .map(a => {
        const start = new Date(a.scheduledDate);
        const duration = getServiceDuration({ name: a.serviceName, price: a.servicePrice });
        return {
          start,
          end: new Date(start.getTime() + duration * 60000)
        };
      });
    const duration = getServiceDuration(service);
    return slots.filter(time => {
      const start = new Date(`${dateValue}T${time}`);
      const end = new Date(start.getTime() + duration * 60000);
      return !occupied.some(slot => start < slot.end && slot.start < end);
    });
  };

  const selectedService = services.find(s => String(s.id) === String(bookingForm.serviceId));
  const availableSlots = getAvailableBookingSlots(bookingForm.appointmentDate, selectedService, bookingForm.mechanicId);
  const selectedTime = bookingForm.scheduledDate ? bookingForm.scheduledDate.split('T')[1]?.slice(0, 5) : '';

  const openBooking = (vehicleId = '', serviceId = '') => {
    setBookingForm({ vehicleId: String(vehicleId), mechanicId: '', serviceId: String(serviceId), appointmentDate: '', scheduledDate: '' });
    setBookingError('');
    setShowBooking(true);
    setActive('appointments');
  };

  const handleBookingField = (field, value) => {
    setBookingForm(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'serviceId') { next.appointmentDate = ''; next.scheduledDate = ''; }
      if (field === 'appointmentDate') { next.scheduledDate = ''; }
      return next;
    });
  };

  const handleTimeChange = value => {
    setBookingForm(prev => ({ ...prev, scheduledDate: prev.appointmentDate && value ? `${prev.appointmentDate}T${value}` : '' }));
  };

  const submitBooking = async () => {
    setBookingError('');
    if (!bookingForm.vehicleId || !bookingForm.mechanicId || !bookingForm.serviceId || !bookingForm.scheduledDate) {
      setBookingError('Completează toate câmpurile.');
      return;
    }
    setBookingLoading(true);
    try {
      await api.post('/appointments', {
        customerId: customer.id,
        vehicleId: Number(bookingForm.vehicleId),
        mechanicId: Number(bookingForm.mechanicId),
        serviceId: Number(bookingForm.serviceId),
        scheduledDate: bookingForm.scheduledDate,
        problemDescription: null,
      });
      setShowBooking(false);
      setBookingForm({ vehicleId: '', mechanicId: '', serviceId: '', appointmentDate: '', scheduledDate: '' });
      setMessage('Programare creată cu succes!');
      setTimeout(() => setMessage(''), 3000);
      await loadData();
    } catch (err) {
      setBookingError(typeof err?.response?.data === 'string' ? err.response.data : 'Nu s-a putut crea programarea.');
    } finally { setBookingLoading(false); }
  };

  const canCancelAppointment = appointment => {
    if (!appointment || appointment.status !== 'Programat') return false;
    const scheduledDate = new Date(appointment.scheduledDate);
    return scheduledDate.getTime() - Date.now() > 2 * 60 * 60 * 1000;
  };

  const cancelAppointment = async (id) => {
    setError('');
    setCancelLoading(true);
    try {
      await api.put(`/appointments/${id}/status`, JSON.stringify('Anulat'), {
        headers: { 'Content-Type': 'application/json' }
      });
      setMessage('Programarea a fost anulată cu succes.');
      setTimeout(() => setMessage(''), 3000);
      await loadData();
    } catch (err) {
      setError(typeof err?.response?.data === 'string' ? err.response.data : 'Nu s-a putut anula programarea.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setCancelLoading(false);
    }
  };

  const navigateTo = key => { setActive(key); setShowBooking(false); if (isMobile) setSidebarOpen(false); };

  const renderOverview = () => (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: isMobile ? 20 : 26, fontWeight: 900, margin: '0 0 4px' }}>
          Salut, {customer?.firstName || ''}! 👋
        </h1>
        <p style={{ color: '#64748b', margin: 0, fontSize: 14 }}>Bine ai revenit la AUTOPRO</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard label="VIZITE ACTIVE" value={stats.active} accent="#2563eb" icon="🕐" />
        <StatCard label="REPARAȚII FINALIZATE" value={stats.finalizate} accent="#16a34a" icon="✅" />
        <StatCard label="VEHICULE ÎNREGISTRATE" value={stats.vehicule} accent="#f97316" icon="🚗" />
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', borderBottom: '1px solid #f1f5f9' }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>Programări Recente</h2>
          <button onClick={() => navigateTo('appointments')} style={{ border: 'none', background: 'none', color: '#2563eb', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            Vezi tot istoricul →
          </button>
        </div>
        {recentAppointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>📅</div>
            <div style={{ fontWeight: 600, marginBottom: 12 }}>Nicio programare încă</div>
            <button onClick={() => openBooking()} style={btnPrimary}>+ Programare Nouă</button>
          </div>
        ) : (
          <div>
            {recentAppointments.map(a => {
              const d = new Date(a.scheduledDate);
              return (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 22px', borderBottom: '1px solid #f8fafc', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 140 }}>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>{a.serviceName}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{a.appointmentCode}</div>
                  </div>
                  <div style={{ fontSize: 13, color: '#64748b', minWidth: 120 }}>
                    {d.getDate()} {MONTHS[d.getMonth()]} {d.getFullYear()}
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{String(d.getHours()).padStart(2, '0')}:{String(d.getMinutes()).padStart(2, '0')}</div>
                  </div>
                  <div style={{ fontSize: 13, color: '#64748b', minWidth: 100 }}>🔧 {a.mechanic}</div>
                  <StatusBadge value={a.status} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
        <div style={{ background: '#2563eb', borderRadius: 12, padding: '24px 28px', color: '#fff' }}>
          <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 8 }}>Programare Nouă</div>
          <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 20 }}>Rezervă un loc pentru mașina ta rapid și ușor.</div>
          <button onClick={() => openBooking()} style={{ border: '2px solid #fff', background: 'transparent', color: '#fff', borderRadius: 8, padding: '10px 20px', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
            + Programare Nouă
          </button>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '24px 28px' }}>
          <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 8 }}>Servicii Disponibile</div>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>Descoperă toate serviciile oferite de AUTOPRO.</div>
          <button onClick={() => navigateTo('services')} style={{ border: '2px solid #0f172a', background: 'transparent', color: '#0f172a', borderRadius: 8, padding: '10px 20px', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
            Vezi Serviciile →
          </button>
        </div>
      </div>
    </div>
  );

  const renderAppointments = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>Programările Mele</h2>
        <button onClick={() => { setShowBooking(true); setBookingError(''); setBookingForm({ vehicleId: '', mechanicId: '', serviceId: '', appointmentDate: '', scheduledDate: '' }); }} style={btnPrimary}>
          + Programare Nouă
        </button>
      </div>

      {showBooking && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 18 }}>Programare Nouă</div>
          {bookingError && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{bookingError}</div>}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
            <FieldSelect label="Vehicul" value={bookingForm.vehicleId} onChange={v => handleBookingField('vehicleId', v)}>
              <option value="">Alege vehicul</option>
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.licensePlate} — {v.brand} {v.model}</option>)}
            </FieldSelect>
            <FieldSelect label="Serviciu" value={bookingForm.serviceId} onChange={v => handleBookingField('serviceId', v)}>
              <option value="">Alege serviciu</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </FieldSelect>
            <FieldSelect label="Mecanic" value={bookingForm.mechanicId} onChange={v => handleBookingField('mechanicId', v)}>
              <option value="">Alege mecanic</option>
              {mechanics.map(m => <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>)}
            </FieldSelect>
            <FieldInput label="Data" type="date" min={toInputDateOnly(new Date())} value={bookingForm.appointmentDate} onChange={v => handleBookingField('appointmentDate', v)} disabled={!bookingForm.serviceId} />
            <FieldSelect label="Ora" value={selectedTime} onChange={handleTimeChange} disabled={!bookingForm.appointmentDate || availableSlots.length === 0}>
              <option value="">{!bookingForm.appointmentDate ? 'Alege întâi data' : availableSlots.length ? 'Alege ora' : 'Nu sunt ore disponibile'}</option>
              {availableSlots.map(t => <option key={t} value={t}>{t}</option>)}
            </FieldSelect>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
            <button onClick={submitBooking} disabled={bookingLoading} style={btnPrimary}>
              {bookingLoading ? 'Se salvează...' : 'Confirmă Programarea'}
            </button>
            <button onClick={() => setShowBooking(false)} style={{ border: '1px solid #e5e7eb', background: '#fff', borderRadius: 8, padding: '10px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer', color: '#475569' }}>
              Anulează
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {['Toate', 'Programat', 'În progres', 'Complet', 'Anulat'].map(f => (
          <button key={f} onClick={() => setApptFilter(f)} style={{
            border: '1px solid #e5e7eb', borderRadius: 999, padding: '6px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
            background: apptFilter === f ? '#0f172a' : '#fff',
            color: apptFilter === f ? '#fff' : '#475569',
          }}>{f}</button>
        ))}
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ padding: '12px 18px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
          <input value={apptSearch} onChange={e => setApptSearch(e.target.value)} placeholder="Caută serviciu, cod, mecanic sau dată..." style={{ border: 'none', outline: 'none', fontSize: 14, width: '100%', background: 'transparent', color: '#1a1a2e' }} />
          {apptSearch && <span onClick={() => setApptSearch('')} style={{ cursor: 'pointer', color: '#94a3b8', fontSize: 20 }}>×</span>}
        </div>
        {filteredAppointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>Nicio programare găsită.</div>
        ) : filteredAppointments.map(a => {
          const d = new Date(a.scheduledDate);
          return (
            <div key={a.id} style={{ padding: '18px 22px', borderBottom: '1px solid #f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>
                    {a.serviceName}
                    <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400, marginLeft: 8 }}>#{a.appointmentCode}</span>
                  </div>
                  <div style={{ fontSize: 13, color: '#64748b', marginTop: 4, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <span>🕐 {d.getDate()} {MONTHS[d.getMonth()]} {d.getFullYear()} la {String(d.getHours()).padStart(2, '0')}:{String(d.getMinutes()).padStart(2, '0')}</span>
                    <span>🔧 {a.mechanic}</span>
                    <span>🚗 {a.licensePlate}</span>
                  </div>
                  {a.problemDescription && (
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>📝 {a.problemDescription}</div>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <StatusBadge value={a.status} />
                  {canCancelAppointment(a) && (
                    <button
                      onClick={() => cancelAppointment(a.id)}
                      disabled={cancelLoading}
                      style={{
                        border: '1px solid #f87171',
                        background: '#fee2e2',
                        color: '#b91c1c',
                        borderRadius: 8,
                        padding: '8px 14px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: 12
                      }}
                    >
                      {cancelLoading ? 'Se anulează...' : 'Anulează'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

 const submitVehicle = async () => {
  setVehicleError('');
  if (!vehicleForm.licensePlate || !vehicleForm.brand || !vehicleForm.model) {
    setVehicleError('Completează numărul, marca și modelul.');
    return;
  }
  setVehicleLoading(true);
  try {
    await api.post('/vehicles', {
      licensePlate: vehicleForm.licensePlate,
      brand: vehicleForm.brand,
      model: vehicleForm.model,
      series: vehicleForm.series || null,
      customerId: customer.id,
    });
    setShowVehicleForm(false);
    setVehicleForm({ licensePlate: '', brand: '', model: '', series: '' });
    setMessage('Vehicul adăugat cu succes!');
    setTimeout(() => setMessage(''), 3000);
    await loadData();
  } catch (err) {
    setVehicleError(typeof err?.response?.data === 'string' ? err.response.data : 'Nu s-a putut adăuga vehiculul.');
  } finally { setVehicleLoading(false); }
};

const renderVehicles = () => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
      <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>Vehiculele Mele</h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 13, color: '#64748b' }}>{vehicles.length} vehicule înregistrate</span>
        <button onClick={() => { setShowVehicleForm(true); setVehicleError(''); }} style={btnPrimary}>
          + Adaugă Vehicul
        </button>
      </div>
    </div>

    {showVehicleForm && (
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 18 }}>Vehicul Nou</div>
        {vehicleError && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{vehicleError}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
          <FieldInput label="Număr Înmatriculare" value={vehicleForm.licensePlate} onChange={v => setVehicleForm(p => ({ ...p, licensePlate: v }))} />
          <FieldInput label="Marcă" value={vehicleForm.brand} onChange={v => setVehicleForm(p => ({ ...p, brand: v }))} />
          <FieldInput label="Model" value={vehicleForm.model} onChange={v => setVehicleForm(p => ({ ...p, model: v }))} />
          <FieldInput label="Serie (opțional)" value={vehicleForm.series} onChange={v => setVehicleForm(p => ({ ...p, series: v }))} />
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <button onClick={submitVehicle} disabled={vehicleLoading} style={btnPrimary}>
            {vehicleLoading ? 'Se salvează...' : 'Adaugă Vehicul'}
          </button>
          <button onClick={() => setShowVehicleForm(false)} style={{ border: '1px solid #e5e7eb', background: '#fff', borderRadius: 8, padding: '10px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer', color: '#475569' }}>
            Anulează
          </button>
        </div>
      </div>
    )}

    {vehicles.length === 0 && !showVehicleForm ? (
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🚗</div>
        <div style={{ fontWeight: 700, fontSize: 15 }}>Niciun vehicul înregistrat</div>
        <div style={{ fontSize: 13, marginTop: 4, marginBottom: 20 }}>Adaugă primul tău vehicul pentru a face programări.</div>
        <button onClick={() => { setShowVehicleForm(true); setVehicleError(''); }} style={btnPrimary}>+ Adaugă Vehicul</button>
      </div>
    ) : (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        {vehicles.map(v => {
          const lastAppt = [...appointments]
            .filter(a => a.licensePlate === v.licensePlate)
            .sort((a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate))[0];
          const lastDate = lastAppt ? new Date(lastAppt.scheduledDate) : null;
          return (
            <div key={v.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ background: '#0f172a', padding: '22px 24px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>{v.brand}</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', marginBottom: 10 }}>{v.brand} {v.model}</div>
                <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', color: '#fff', borderRadius: 6, padding: '4px 12px', fontSize: 13, fontWeight: 700 }}>{v.licensePlate}</div>
                <div style={{ position: 'absolute', right: 16, bottom: -8, fontSize: 72, opacity: 0.08 }}>🚗</div>
              </div>
              <div style={{ padding: '18px 24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>Serie</div>
                    <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>{v.series || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>Ultimul Service</div>
                    <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>
                      {lastDate ? `${lastDate.getDate()} ${MONTHS[lastDate.getMonth()]} ${lastDate.getFullYear()}` : '—'}
                    </div>
                  </div>
                </div>
                <button onClick={() => openBooking(v.id)} style={{ ...btnPrimary, width: '100%', justifyContent: 'center' }}>
                  Programează
                </button>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);

  const renderServices = () => (
    <div>
      <div style={{ background: '#2563eb', borderRadius: 12, padding: isMobile ? '24px 20px' : '32px 36px', marginBottom: 28, color: '#fff' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', opacity: 0.75, marginBottom: 8 }}>AUTOPRO MOLDOVA</div>
        <div style={{ fontSize: isMobile ? 20 : 26, fontWeight: 900, marginBottom: 8 }}>Servicii Premium pentru Mașina Ta</div>
        <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 20 }}>Mecanici certificați, piese originale, garanție pentru fiecare lucrare.</div>
        <button onClick={() => openBooking()} style={{ border: '2px solid #fff', background: 'transparent', color: '#fff', borderRadius: 8, padding: '10px 20px', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
          PROGRAMEAZĂ-TE ACUM →
        </button>
      </div>

      {services.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>Nu sunt servicii disponibile.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {services.map(s => {
            const duration = getServiceDuration(s);
            const h = Math.floor(duration / 60);
            const m = duration % 60;
            const durationLabel = h > 0 ? (m > 0 ? `${h}h ${m}min` : `${h}h`) : `${m}min`;
            return (
              <div key={s.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: '#eff6ff', display: 'grid', placeItems: 'center', fontSize: 18 }}>🔧</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>🕐 {durationLabel}</div>
                </div>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 15, marginBottom: 6 }}>{s.name}</div>
                  <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>{s.description || '—'}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <div>
                    <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8 }}>DE LA</div>
                    <div style={{ fontSize: 20, fontWeight: 900 }}>{Number(s.price).toLocaleString('ro-MD')} <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b' }}>MDL</span></div>
                  </div>
                  <button onClick={() => openBooking('', s.id)} style={btnPrimary}>
                    Programează →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f5f6f8', fontFamily: 'Segoe UI, sans-serif', color: '#081225' }}>
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 40 }} />
      )}

      <aside style={{
        width: 230, background: '#fff', borderRight: '1px solid #e5e7eb',
        padding: 22, display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: isMobile ? (sidebarOpen ? 0 : -260) : 0,
        height: '100vh', zIndex: 50, transition: 'left 0.25s ease', overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: '#0f172a', color: '#60a5fa', display: 'grid', placeItems: 'center', fontWeight: 900 }}>C</div>
          <b>CLIENT</b>
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
        <header style={{ height: 64, background: '#fff', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', position: 'sticky', top: 0, zIndex: 30 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {isMobile && (
              <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4, display: 'flex', flexDirection: 'column', gap: 5 }}>
                <span style={{ width: 22, height: 2, background: '#0f172a', display: 'block', borderRadius: 2 }} />
                <span style={{ width: 22, height: 2, background: '#0f172a', display: 'block', borderRadius: 2 }} />
                <span style={{ width: 22, height: 2, background: '#0f172a', display: 'block', borderRadius: 2 }} />
              </button>
            )}
            <span style={{ fontSize: isMobile ? 11 : 13, fontWeight: 900, letterSpacing: isMobile ? 1 : 3, color: '#0f172a' }}>
              AUTOPRO
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {!isMobile && customer && (
              <span style={{ fontSize: 13, fontWeight: 700 }}>{customer.firstName} {customer.lastName}</span>
            )}
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#0f172a', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 13 }}>
              {customer ? customer.firstName[0].toUpperCase() : '?'}
            </div>
          </div>
        </header>

        <section style={{ padding: isMobile ? 16 : 32 }}>
          {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: 14, borderRadius: 8, marginBottom: 18, fontSize: 14 }}>{error}</div>}
          {message && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: 14, borderRadius: 8, marginBottom: 18, fontSize: 14 }}>{message}</div>}
          {active === 'overview' && renderOverview()}
          {active === 'appointments' && renderAppointments()}
          {active === 'vehicles' && renderVehicles()}
          {active === 'services' && renderServices()}
        </section>
      </main>
    </div>
  );
}

function StatCard({ label, value, accent, icon }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '22px 20px' }}>
      <div style={{ width: 40, height: 40, borderRadius: 8, background: `${accent}18`, display: 'grid', placeItems: 'center', fontSize: 18, marginBottom: 14 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 900 }}>{value}</div>
      <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginTop: 4 }}>{label}</div>
    </div>
  );
}

function StatusBadge({ value }) {
  const [bg, color] = statusStyle[value] || ['#e5e7eb', '#374151'];
  return <span style={{ background: bg, color, padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 800, whiteSpace: 'nowrap', textTransform: 'uppercase' }}>{value}</span>;
}

function FieldSelect({ label, value, onChange, children, disabled }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' }}>{label}</span>
      <select disabled={disabled} value={value ?? ''} onChange={e => onChange(e.target.value)}
        style={{ height: 42, border: '1px solid #e5e7eb', borderRadius: 6, padding: '0 12px', outline: 'none', fontSize: 14, background: disabled ? '#f9fafb' : '#fff', width: '100%', boxSizing: 'border-box' }}>
        {children}
      </select>
    </label>
  );
}

function FieldInput({ label, type, value, onChange, min, disabled }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' }}>{label}</span>
      <input disabled={disabled} type={type} min={min} value={value ?? ''} onChange={e => onChange(e.target.value)}
        style={{ height: 42, border: '1px solid #e5e7eb', borderRadius: 6, padding: '0 12px', outline: 'none', fontSize: 14, background: disabled ? '#f9fafb' : '#fff', width: '100%', boxSizing: 'border-box' }} />
    </label>
  );
}

function toInputDateOnly(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

const btnPrimary = { border: 'none', borderRadius: 8, padding: '10px 18px', background: '#2563eb', color: '#fff', fontWeight: 800, fontSize: 13, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' };