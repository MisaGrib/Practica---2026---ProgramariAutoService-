import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const menuItems = [
  ['today', 'Sarcini Azi'],
  ['calendar', 'Calendar'],
  ['history', 'Istoric Lucrări'],
];

const statusStyle = {
  Programat: ['#dbeafe', '#1d4ed8'],
  'În progres': ['#fef3c7', '#b45309'],
  Complet: ['#dcfce7', '#15803d'],
  Anulat: ['#fee2e2', '#dc2626']
};

const DAYS = ['Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm', 'Dum'];
const MONTHS = ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie', 'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'];

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

export default function MecanicDashboard() {
  const { user, logout } = useAuth();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [active, setActive] = useState('today');
  const [mechanic, setMechanic] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [historySearch, setHistorySearch] = useState('');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [bellOpen, setBellOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [noteValue, setNoteValue] = useState('');

  useEffect(() => { loadData(); }, [user]);

  const loadData = async () => {
    if (!user?.email) return;
    setError('');
    try {
      const mechanicRes = await api.get(`/mechanic/email/${encodeURIComponent(user.email)}`);
      const m = mechanicRes.data;
      setMechanic(m);

      const apptRes = await api.get('/appointments/details');
      const fullName = `${m.firstName} ${m.lastName}`.toLowerCase();
      const mine = (apptRes.data || []).filter(a =>
        a.mechanic?.toLowerCase() === fullName
      );
      setAppointments(mine);
    } catch {
      setError('Nu s-au putut încărca datele. Verifică conexiunea.');
    }
  };

  const updateStatus = async (id, status) => {
    setLoading(true);
    try {
      await api.put(`/appointments/${id}/status`, JSON.stringify(status), {
        headers: { 'Content-Type': 'application/json' }
      });
      setMessage(`Status actualizat: ${status}`);
      setTimeout(() => setMessage(''), 2500);
      await loadData();
    } catch {
      setError('Nu s-a putut actualiza statusul.');
      setTimeout(() => setError(''), 2500);
    } finally { setLoading(false); }
  };

  const saveNote = async (id) => {
    setLoading(true);
    try {
      const appt = appointments.find(a => a.id === id);
      if (!appt) return;
      const appointmentRes = await api.get(`/appointments/${id}`);
      const fullAppointment = appointmentRes.data;
      await api.put(`/appointments/${id}`, {
        customerId: fullAppointment.customerId,
        vehicleId: fullAppointment.vehicleId,
        mechanicId: fullAppointment.mechanicId,
        serviceId: fullAppointment.serviceId,
        scheduledDate: fullAppointment.scheduledDate,
        problemDescription: noteValue,
        status: fullAppointment.status
      });
      setEditingNote(null);
      setNoteValue('');
      setMessage('Diagnostic salvat!');
      setTimeout(() => setMessage(''), 2500);
      await loadData();
    } catch (err) {
      const message = err?.response?.data || err?.message || 'Nu s-a putut salva diagnosticul.';
      setError(message);
      setTimeout(() => setError(''), 2500);
    } finally { setLoading(false); }
  };

  const now = new Date();
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  const todayAppointments = useMemo(() =>
    appointments.filter(a => {
      const d = new Date(a.scheduledDate);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === todayDate.getTime();
    }).sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate)),
    [appointments]
  );

  const stats = useMemo(() => ({
    total: todayAppointments.length,
    finalizate: todayAppointments.filter(a => a.status === 'Complet').length,
    inLucru: todayAppointments.filter(a => a.status === 'În progres').length,
    programate: todayAppointments.filter(a => a.status === 'Programat').length,
  }), [todayAppointments]);

  const historyAppointments = useMemo(() => {
    const q = historySearch.toLowerCase();
    return appointments
      .filter(a => ['Complet', 'Anulat'].includes(a.status))
      .filter(a => !q || a.customer?.toLowerCase().includes(q) || a.serviceName?.toLowerCase().includes(q) || a.appointmentCode?.toLowerCase().includes(q))
      .sort((a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate));
  }, [appointments, historySearch]);

  const notifications = useMemo(() => {
    const now = new Date();
    return todayAppointments
      .filter(a => a.status === 'Programat' || a.status === 'În progres')
      .map(a => {
        const apptTime = new Date(a.scheduledDate);
        const diffMin = (apptTime - now) / 60000;
        return { ...a, diffMin, urgent: diffMin > 0 && diffMin <= 30 };
      })
      .slice(0, 3);
  }, [todayAppointments]);

  const urgentCount = notifications.filter(n => n.urgent).length;

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const appointmentDays = useMemo(() => {
    const set = new Set();
    appointments.forEach(a => {
      const d = new Date(a.scheduledDate);
      if (d.getMonth() === calendarDate.getMonth() && d.getFullYear() === calendarDate.getFullYear())
        set.add(d.getDate());
    });
    return set;
  }, [appointments, calendarDate]);

  const selectedDayAppointments = useMemo(() =>
    appointments.filter(a => {
      const d = new Date(a.scheduledDate);
      return d.getDate() === selectedDay.getDate() &&
        d.getMonth() === selectedDay.getMonth() &&
        d.getFullYear() === selectedDay.getFullYear();
    }).sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate)),
    [appointments, selectedDay]
  );

  const navigateTo = key => { setActive(key); if (isMobile) setSidebarOpen(false); };

  const renderToday = () => (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard label="TOTAL AZI" value={stats.total} color="#081225" />
        <StatCard label="FINALIZATE" value={stats.finalizate} color="#16a34a" />
        <StatCard label="ÎN LUCRU" value={stats.inLucru} color="#f97316" />
        <StatCard label="PROGRAMATE" value={stats.programate} color="#2563eb" />
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 900, margin: '0 0 6px' }}>Agenda de Lucru — Astăzi</h2>
        <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>
          {new Date().toLocaleDateString('ro-MD', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
        <div style={{ marginBottom: 20, padding: 14, borderRadius: 12, background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', fontSize: 13, lineHeight: 1.5 }}>
          Notă: poți începe, finaliza sau adăuga diagnosticul doar după ora programată. Dacă lucrările sunt planificate în viitor, acțiunile vor fi disponibile la ora programată.
        </div>

        {todayAppointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
            <div style={{ fontWeight: 600 }}>Nu ai programări astăzi!</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 14 }}>
            {todayAppointments.map(a => {
              const apptTime = new Date(a.scheduledDate);
              const inProgress = a.status === 'În progres';
              const done = a.status === 'Complet';
              const cancelled = a.status === 'Anulat';
              const isEditing = editingNote === a.id;

              return (
                <div key={a.id} style={{
                  borderRadius: 10, border: `1px solid ${inProgress ? '#fde68a' : '#f1f5f9'}`,
                  background: inProgress ? '#fffbeb' : done ? '#f0fdf4' : cancelled ? '#fef2f2' : '#fff',
                  overflow: 'hidden'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'center', minWidth: 44 }}>
                      <div style={{ fontSize: 18, fontWeight: 900 }}>{apptTime.getHours().toString().padStart(2, '0')}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{apptTime.getMinutes().toString().padStart(2, '0')}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 140 }}>
                      <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>{a.serviceName}</div>
                      <div style={{ fontSize: 13, color: '#64748b', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <span>👤 {a.customer}</span>
                        <span>🚗 {a.licensePlate}</span>
                      </div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{a.appointmentCode}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <Status value={a.status} />
                      {!done && !cancelled && (
                        inProgress ? (
                          <button onClick={() => updateStatus(a.id, 'Complet')} disabled={loading || now < apptTime} style={btnGreen}>✓ Finalizează</button>
                        ) : (
                          <button onClick={() => updateStatus(a.id, 'În progres')} disabled={loading || now < apptTime} style={btnBlue}>▶ Începe</button>
                        )
                      )}
                      {!cancelled && (
                        <button onClick={() => {
                          if (isEditing) { setEditingNote(null); setNoteValue(''); }
                          else { setEditingNote(a.id); setNoteValue(a.problemDescription || ''); }
                        }} disabled={loading || now < apptTime} style={{ border: '1px solid #e5e7eb', background: '#fff', borderRadius: 8, padding: '6px 12px', cursor: loading || now < apptTime ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 700, color: '#475569' }}>
                          {isEditing ? 'Anulează' : '📝 Diagnostic'}
                        </button>
                      )}
                    </div>
                    {now < apptTime && !done && !cancelled && (
                      <div style={{ marginTop: 10, fontSize: 12, color: '#475569', background: '#f8fafc', borderRadius: 8, padding: '10px 14px', border: '1px solid #e2e8f0' }}>
                        Acțiunea va fi activă la ora programată: {apptTime.toLocaleTimeString('ro-MD', { hour: '2-digit', minute: '2-digit' })}.
                      </div>
                    )}
                  </div>

                  {/* Camp diagnostic */}
                  {isEditing && (
                    <div style={{ borderTop: '1px solid #f1f5f9', padding: '14px 20px', background: '#f8fafc' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 }}>
                        Diagnostic / Notă
                      </div>
                      <textarea
                        value={noteValue}
                        onChange={e => setNoteValue(e.target.value)}
                        placeholder="Descrie diagnosticul sau observațiile tehnice..."
                        rows={3}
                        style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 12px', fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'Segoe UI, sans-serif', boxSizing: 'border-box' }}
                      />
                      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                        <button onClick={() => saveNote(a.id)} disabled={loading} style={{ ...btnBlue, fontSize: 13 }}>
                          {loading ? 'Se salvează...' : '💾 Salvează'}
                        </button>
                        <button onClick={() => { setEditingNote(null); setNoteValue(''); }} style={{ border: '1px solid #e5e7eb', background: '#fff', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#475569' }}>
                          Anulează
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Afisare diagnostic existent */}
                  {!isEditing && a.problemDescription && (
                    <div style={{ borderTop: '1px solid #f1f5f9', padding: '10px 20px', background: '#f8fafc' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8 }}>Diagnostic: </span>
                      <span style={{ fontSize: 13, color: '#475569' }}>{a.problemDescription}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const renderCalendar = () => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    return (
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 24 }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ margin: 0, fontWeight: 800 }}>{MONTHS[month]} {year}</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setCalendarDate(new Date(year, month - 1, 1))} style={navBtn}>‹</button>
              <button onClick={() => setCalendarDate(new Date(year, month + 1, 1))} style={navBtn}>›</button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 8 }}>
            {DAYS.map(d => <div key={d} style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#94a3b8', padding: '6px 0' }}>{d}</div>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {cells.map((day, i) => {
              if (!day) return <div key={i} />;
              const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
              const isSelected = day === selectedDay.getDate() && month === selectedDay.getMonth() && year === selectedDay.getFullYear();
              const hasAppt = appointmentDays.has(day);
              return (
                <div key={i} onClick={() => setSelectedDay(new Date(year, month, day))} style={{
                  textAlign: 'center', padding: '10px 4px', borderRadius: 8, cursor: 'pointer',
                  background: isSelected ? '#0f172a' : isToday ? '#dbeafe' : 'transparent',
                  color: isSelected ? '#fff' : isToday ? '#1d4ed8' : '#1a1a2e',
                  fontWeight: isToday || isSelected ? 800 : 400, fontSize: 14
                }}>
                  {day}
                  {hasAppt && <div style={{ width: 5, height: 5, borderRadius: '50%', background: isSelected ? '#60a5fa' : '#2563eb', margin: '2px auto 0' }} />}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
          <h3 style={{ margin: '0 0 4px', fontWeight: 800 }}>
            {selectedDay.toLocaleDateString('ro-MD', { day: 'numeric', month: 'long', year: 'numeric' })}
          </h3>
          <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>{selectedDayAppointments.length} programări</div>
          {selectedDayAppointments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>📅</div>
              <div>Nicio programare în această zi</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {selectedDayAppointments.map(a => {
                const t = new Date(a.scheduledDate);
                return (
                  <div key={a.id} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '14px 16px', borderRadius: 10, border: '1px solid #f1f5f9' }}>
                    <div style={{ textAlign: 'center', minWidth: 40 }}>
                      <div style={{ fontSize: 17, fontWeight: 900 }}>{t.getHours().toString().padStart(2, '0')}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{t.getMinutes().toString().padStart(2, '0')}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, marginBottom: 3 }}>{a.serviceName}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>👤 {a.customer}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>🚗 {a.licensePlate}</div>
                      {a.problemDescription && <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>📝 {a.problemDescription}</div>}
                    </div>
                    <Status value={a.status} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderHistory = () => (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard label="FINALIZATE" value={appointments.filter(a => a.status === 'Complet').length} color="#16a34a" />
        <StatCard label="ANULATE" value={appointments.filter(a => a.status === 'Anulat').length} color="#dc2626" />
        <StatCard label="TOTAL" value={appointments.filter(a => ['Complet', 'Anulat'].includes(a.status)).length} color="#081225" />
      </div>
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
          <input value={historySearch} onChange={e => setHistorySearch(e.target.value)}
            placeholder="Caută după client, serviciu sau cod..."
            style={{ border: 'none', outline: 'none', fontSize: 14, width: '100%', color: '#1a1a2e', background: 'transparent' }} />
          {historySearch && <span onClick={() => setHistorySearch('')} style={{ cursor: 'pointer', color: '#94a3b8', fontSize: 20 }}>×</span>}
        </div>
        {historyAppointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>Nicio lucrare găsită.</div>
        ) : historyAppointments.map(a => {
          const d = new Date(a.scheduledDate);
          return (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderBottom: '1px solid #f8fafc', flexWrap: 'wrap' }}>
              <div style={{ width: 44, textAlign: 'center', background: '#f5f6f8', borderRadius: 8, padding: '8px 4px', flexShrink: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 900 }}>{d.getDate()}</div>
                <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase' }}>{MONTHS[d.getMonth()].slice(0, 3)}</div>
              </div>
              <div style={{ flex: 1, minWidth: 140 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 800 }}>{a.serviceName}</span>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>#{a.appointmentCode}</span>
                </div>
                <div style={{ fontSize: 13, color: '#64748b', marginTop: 3 }}>👤 {a.customer}</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>🚗 {a.licensePlate}</div>
                {a.problemDescription && <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>📝 {a.problemDescription}</div>}
              </div>
              <Status value={a.status} />
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f5f6f8', fontFamily: 'Segoe UI, sans-serif', color: '#081225' }}>
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 40 }} />
      )}

      {/* Sidebar — același stil ca Admin */}
      <aside style={{
        width: 230, background: '#fff', borderRight: '1px solid #e5e7eb',
        padding: 22, display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: isMobile ? (sidebarOpen ? 0 : -260) : 0,
        height: '100vh', zIndex: 50, transition: 'left 0.25s ease', overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: '#0f172a', color: '#60a5fa', display: 'grid', placeItems: 'center', fontWeight: 900 }}>M</div>
          <b>MECANIC</b>
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
              {active === 'today' ? 'PANOU MECANIC' : active === 'calendar' ? 'CALENDAR PROGRAMĂRI' : 'ISTORIC LUCRĂRI'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Clopot */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => setBellOpen(!bellOpen)} style={{ border: 'none', background: 'none', cursor: 'pointer', position: 'relative', padding: 6 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {urgentCount > 0 && (
                  <span style={{ position: 'absolute', top: 2, right: 2, width: 16, height: 16, borderRadius: '50%', background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 800, display: 'grid', placeItems: 'center' }}>
                    {urgentCount}
                  </span>
                )}
              </button>
              {bellOpen && (
                <>
                  <div onClick={() => setBellOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 98 }} />
                  <div style={{ position: 'absolute', right: 0, top: 44, width: 300, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', zIndex: 99, overflow: 'hidden' }}>
                    <div style={{ padding: '14px 18px', borderBottom: '1px solid #f1f5f9', fontWeight: 800, fontSize: 14 }}>Programări Astăzi</div>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '20px 18px', color: '#94a3b8', fontSize: 14 }}>Nicio programare activă.</div>
                    ) : notifications.map(n => {
                      const t = new Date(n.scheduledDate);
                      return (
                        <div key={n.id} style={{ padding: '12px 18px', borderBottom: '1px solid #f8fafc', background: n.urgent ? '#fffbeb' : '#fff' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 700, fontSize: 14 }}>{n.serviceName}</span>
                            {n.urgent && <span style={{ fontSize: 11, fontWeight: 800, color: '#f97316', background: '#fff7ed', padding: '2px 8px', borderRadius: 99 }}>⚡ CURÂND</span>}
                          </div>
                          <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>👤 {n.customer} · 🚗 {n.licensePlate}</div>
                          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                            {t.getHours().toString().padStart(2, '0')}:{t.getMinutes().toString().padStart(2, '0')}
                            {n.urgent && ` · în ${Math.round(n.diffMin)} min`}
                          </div>
                        </div>
                      );
                    })}
                    <div onClick={() => { navigateTo('today'); setBellOpen(false); }} style={{ padding: '12px 18px', textAlign: 'center', color: '#2563eb', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                      Vezi toate →
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Nume + Avatar */}
            {!isMobile && mechanic && (
              <span style={{ fontSize: 13, fontWeight: 700 }}>{mechanic.firstName} {mechanic.lastName}</span>
            )}
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#0f172a', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 13 }}>
              {mechanic ? mechanic.firstName[0].toUpperCase() : '?'}
            </div>
          </div>
        </header>

        <section style={{ padding: isMobile ? 16 : 28 }}>
          {error && <Alert type="error">{error}</Alert>}
          {message && <Alert type="success">{message}</Alert>}
          {active === 'today' && renderToday()}
          {active === 'calendar' && renderCalendar()}
          {active === 'history' && renderHistory()}
        </section>
      </main>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '20px 24px' }}>
      <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 900, color }}>{value}</div>
    </div>
  );
}

function Status({ value }) {
  const [bg, color] = statusStyle[value] || ['#e5e7eb', '#374151'];
  return <span style={{ background: bg, color, padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 800, whiteSpace: 'nowrap', textTransform: 'uppercase' }}>{value}</span>;
}

function Alert({ type, children }) {
  const err = type === 'error';
  return <div style={{ background: err ? '#fef2f2' : '#f0fdf4', border: `1px solid ${err ? '#fecaca' : '#bbf7d0'}`, color: err ? '#b91c1c' : '#15803d', padding: 14, borderRadius: 8, marginBottom: 18, fontSize: 14 }}>{children}</div>;
}

const btnBlue = { border: 'none', borderRadius: 8, padding: '8px 16px', background: '#2563eb', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' };
const btnGreen = { border: 'none', borderRadius: 8, padding: '8px 16px', background: '#16a34a', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' };
const navBtn = { border: '1px solid #e5e7eb', background: '#fff', borderRadius: 6, width: 32, height: 32, cursor: 'pointer', fontSize: 16, display: 'grid', placeItems: 'center' };
