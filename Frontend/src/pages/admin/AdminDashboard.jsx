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
  appointments: { id: null, customerId: '', vehicleId: '', mechanicId: '', serviceId: '', scheduledDate: '', problemDescription: '', status: 'Programat' },
  mechanics: { id: null, firstName: '', lastName: '', phone: '', email: '', userId: '' },
  customers: { id: null, firstName: '', lastName: '', phone: '', email: '', userId: '' },
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

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [active, setActive] = useState('overview');
  const [data, setData] = useState({
    appointments: [], appointmentDetails: [], mechanics: [], customers: [],
    vehicles: [], vehicleDetails: [], services: [], payments: [],
    paymentDetails: [], users: [], userDetails: [], roles: []
  });
  const [forms, setForms] = useState(initialForms);
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
        api.get('/appointments'),
        api.get('/appointments/details'),
        api.get('/mechanic'),
        api.get('/customer'),
        api.get('/vehicles'),
        api.get('/vehicles/details'),
        api.get('/services'),
        api.get('/payments'),
        api.get('/payments/details'),
        api.get('/users'),
        api.get('/users/details'),
        api.get('/roles')
      ]);

      setData({
        appointments: appointments.data || [],
        appointmentDetails: appointmentDetails.data || [],
        mechanics: mechanics.data || [],
        customers: customers.data || [],
        vehicles: vehicles.data || [],
        vehicleDetails: vehicleDetails.data || [],
        services: services.data || [],
        payments: payments.data || [],
        paymentDetails: paymentDetails.data || [],
        users: users.data || [],
        userDetails: userDetails.data || [],
        roles: roles.data || []
      });
    } catch {
      setError('Nu s-au putut încărca datele. Verifică dacă backend-ul rulează și tokenul este valid.');
    }
  };

 const stats = useMemo(() => {
  const activeAppointments = data.appointmentDetails.filter(a => ['Programat', 'În progres'].includes(a.status)).length;
  
  const now = new Date();
  const revenue = data.paymentDetails
    .filter(p => {
      const date = new Date(p.paymentDate);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    })
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  return { revenue, activeAppointments, mechanics: data.mechanics.length, customers: data.customers.length };
}, [data]);

  const normalizePhone = value => (value || '').replace(/\D/g, '');
  const isValidEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const isValidPhone = value => /^\d{8,15}$/.test(value);

  const setField = (section, field, value) => {
    if ((section === 'mechanics' || section === 'customers') && field === 'phone') {
      value = normalizePhone(value);
    }
    setForms(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  };

  const resetForm = section => setForms(prev => ({ ...prev, [section]: initialForms[section] }));

  const validateForm = (section, form) => {
    if (section === 'mechanics' || section === 'customers') {
      if (!form.firstName || !form.lastName || !form.phone || !form.email) {
        setError('Completează toate câmpurile pentru client/mecanic.');
        return false;
      }
      if (!isValidPhone(form.phone)) {
        setError('Telefonul trebuie să conțină doar cifre și minim 8 caractere.');
        return false;
      }
      if (!isValidEmail(form.email)) {
        setError('Adresa de email nu este validă.');
        return false;
      }
    }

    if (section === 'users') {
      if (!form.email) {
        setError('Selectează un email pentru contul de utilizator.');
        return false;
      }
      if (!isValidEmail(form.email)) {
        setError('Adresa de email pentru utilizator nu este validă.');
        return false;
      }
      if (!form.id && (!form.passwordHash || form.passwordHash.length < 8)) {
        setError('Parola trebuie să aibă cel puțin 8 caractere.');
        return false;
      }
      if (form.passwordHash && form.passwordHash.length > 0 && form.passwordHash.length < 8) {
        setError('Parola trebuie să aibă cel puțin 8 caractere.');
        return false;
      }
    }

    return true;
  };

  const save = async section => {
    setError('');
    if (!validateForm(section, forms[section])) return;

    setLoading(true);
    try {
      const form = forms[section];
      const endpoint = endpoints[section];
      const payload = toPayload(section, form);
      if (form.id) await api.put(`${endpoint}/${form.id}`, payload);
      else await api.post(endpoint, payload);
      resetForm(section);
      setMessage('Operația a fost salvată cu succes.');
      setTimeout(() => setMessage(''), 2200);
      await loadData();
    } catch (err) {
      setError(typeof err?.response?.data === 'string' ? err.response.data : 'Operația nu a reușit. Verifică datele introduse.');
    } finally {
      setLoading(false);
    }
  };

  const remove = async (section, id) => {
    if (!window.confirm('Sigur vrei să ștergi această înregistrare?')) return;
    setLoading(true);
    setError('');
    try {
      await api.delete(`${endpoints[section]}/${id}`);
      setMessage('Înregistrarea a fost ștearsă.');
      setTimeout(() => setMessage(''), 2200);
      await loadData();
    } catch {
      setError('Ștergerea nu a reușit. Posibil înregistrarea este folosită în altă tabelă.');
    } finally {
      setLoading(false);
    }
  };

  const edit = (section, item) => {
    if (section === 'appointments') {
      setForms(prev => ({ ...prev, appointments: {
        id: item.id,
        customerId: item.customerId || '',
        vehicleId: item.vehicleId || '',
        mechanicId: item.mechanicId || '',
        serviceId: item.serviceId || '',
        scheduledDate: toInputDate(item.scheduledDate),
        problemDescription: item.problemDescription || '',
        status: item.status || 'Programat'
      }}));
      return;
    }
    if (section === 'payments') {
      setForms(prev => ({ ...prev, payments: {
        id: item.id,
        appointmentId: item.appointmentId || '',
        paymentType: item.paymentType || 'Numerar',
        amount: item.amount || ''
      }}));
      return;
    }
    if (section === 'users') {
      setForms(prev => ({ ...prev, users: {
        id: item.id,
        email: item.email || '',
        passwordHash: '',
        roleId: item.roleId || 2,
        isActive: item.isActive ?? true
      }}));
      return;
    }
    setForms(prev => ({ ...prev, [section]: { ...prev[section], ...item } }));
  };

  const logoutAdmin = () => {
    logout();
    window.location.href = '/login';
  };

  const renderOverview = () => {
    const recent = [...data.appointmentDetails]
      .sort((a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate))
      .slice(0, 5);

    return (
      <>
        <div style={statsGrid}>
          <StatCard icon={<MoneyIcon />} title="Venit total pentru luna " month={new Date().getMonth() + 1} value={`${stats.revenue.toLocaleString('ro-MD')} MDL`} accent="#16a34a" />
          <StatCard icon={<PulseIcon />} title="Programări active" value={stats.activeAppointments} accent="#2563eb" />
          <StatCard icon={<ToolIcon />} title="Mecanici" value={stats.mechanics} accent="#9333ea" />
          <StatCard icon={<UsersIcon />} title="Clienți" value={stats.customers} accent="#f97316" />
        </div>

        <Panel title="Ultimele 5 programări">
          <Table headers={['Cod / Serviciu', 'Client', 'Vehicul', 'Mecanic', 'Data', 'Status']}>
            {recent.map(a => (
              <tr key={a.id}>
                <Td><b>{a.serviceName}</b><div style={muted}>{a.appointmentCode}</div></Td>
                <Td>{a.customer}</Td>
                <Td>{a.licensePlate}</Td>
                <Td>{a.mechanic}</Td>
                <Td>{formatDate(a.scheduledDate)}</Td>
                <Td><Status value={a.status} /></Td>
              </tr>
            ))}
          </Table>
        </Panel>
      </>
    );
  };

  const renderSection = () => {
    if (active === 'overview') return renderOverview();
    return (
      <div style={{ display: 'grid', gap: 22 }}>
        <Panel title={`${titles[active]} - formular`}>
          <div style={{ padding: 20 }}>{renderForm(active)}</div>
        </Panel>
        <Panel title={`${titles[active]} - listă`}>
          {renderTable(active)}
        </Panel>
      </div>
    );
  };

  const availableUserEmails = useMemo(() => {
    const clientRoleId = data.roles.find(r => r.name === 'Client')?.id;
    const mechanicRoleId = data.roles.find(r => r.name === 'Mecanic')?.id;

    const customers = data.customers
      .filter(c => (c.userId === null || c.userId === undefined) && c.email?.trim())
      .map(c => ({ email: c.email, label: `${c.email} – Client ${c.firstName} ${c.lastName}`, roleId: clientRoleId }));

    const mechanics = data.mechanics
      .filter(m => (m.userId === null || m.userId === undefined) && m.email?.trim())
      .map(m => ({ email: m.email, label: `${m.email} – Mecanic ${m.firstName} ${m.lastName}`, roleId: mechanicRoleId }));

    return [...customers, ...mechanics];
  }, [data.customers, data.mechanics, data.roles]);

  const handleUserEmailChange = value => {
    setField('users', 'email', value);
    const selected = availableUserEmails.find(item => item.email === value);
    if (selected?.roleId) {
      setField('users', 'roleId', selected.roleId);
    }
  };

  const renderForm = section => {
    if (section === 'appointments') return <AppointmentForm form={forms.appointments} data={data} setField={setField} save={save} resetForm={resetForm} loading={loading} />;
    if (section === 'mechanics' || section === 'customers') return <PersonForm section={section} form={forms[section]} data={data} setField={setField} save={save} resetForm={resetForm} loading={loading} />;
    if (section === 'vehicles') return <VehicleForm form={forms.vehicles} data={data} setField={setField} save={save} resetForm={resetForm} loading={loading} />;
    if (section === 'services') return <ServiceForm form={forms.services} setField={setField} save={save} resetForm={resetForm} loading={loading} />;
    if (section === 'payments') return <PaymentForm form={forms.payments} data={data} setField={setField} save={save} resetForm={resetForm} loading={loading} />;
    if (section === 'users') return <UserForm form={forms.users} data={data} availableEmails={availableUserEmails} handleEmailChange={handleUserEmailChange} setField={setField} save={save} resetForm={resetForm} loading={loading} />;
    return null;
  };

  const renderTable = section => {
    if (section === 'appointments') {
      return (
        <Table headers={['Cod', 'Client', 'Vehicul', 'Mecanic', 'Serviciu', 'Data', 'Status', 'Acțiuni']}>
          {data.appointmentDetails.map(a => <tr key={a.id}>
            <Td>{a.appointmentCode}</Td><Td>{a.customer}</Td><Td>{a.licensePlate}</Td><Td>{a.mechanic}</Td><Td>{a.serviceName}</Td><Td>{formatDate(a.scheduledDate)}</Td><Td><Status value={a.status} /></Td>
            <Td><Actions onEdit={() => edit('appointments', data.appointments.find(x => x.id === a.id) || a)} onDelete={() => remove('appointments', a.id)} /></Td>
          </tr>)}
        </Table>
      );
    }
    if (section === 'mechanics') {
      return (
        <Table headers={['Nume', 'Telefon', 'Email', 'Acțiuni']}>
          {data.mechanics.map(m => <tr key={m.id}><Td>{m.firstName} {m.lastName}</Td><Td>{m.phone}</Td><Td>{m.email}</Td><Td><Actions onEdit={() => edit('mechanics', m)} onDelete={() => remove('mechanics', m.id)} /></Td></tr>)}
        </Table>
      );
    }
    if (section === 'customers') {
      return (
        <Table headers={['Nume', 'Telefon', 'Email', 'Acțiuni']}>
          {data.customers.map(c => <tr key={c.id}><Td>{c.firstName} {c.lastName}</Td><Td>{c.phone}</Td><Td>{c.email}</Td><Td><Actions onEdit={() => edit('customers', c)} onDelete={() => remove('customers', c.id)} /></Td></tr>)}
        </Table>
      );
    }
    if (section === 'vehicles') {
      return (
        <Table headers={['Număr', 'Marcă', 'Model', 'Serie', 'Client', 'Acțiuni']}>
          {data.vehicleDetails.map(v => <tr key={v.id}><Td>{v.licensePlate}</Td><Td>{v.brand}</Td><Td>{v.model}</Td><Td>{v.series}</Td><Td>{v.customer}</Td><Td><Actions onEdit={() => edit('vehicles', data.vehicles.find(x => x.id === v.id) || v)} onDelete={() => remove('vehicles', v.id)} /></Td></tr>)}
        </Table>
      );
    }
    if (section === 'services') {
      return (
        <Table headers={['Denumire', 'Descriere', 'Preț', 'Acțiuni']}>
          {data.services.map(s => <tr key={s.id}><Td>{s.name}</Td><Td>{s.description}</Td><Td>{Number(s.price).toLocaleString('ro-MD')} MDL</Td><Td><Actions onEdit={() => edit('services', s)} onDelete={() => remove('services', s.id)} /></Td></tr>)}
        </Table>
      );
    }
    if (section === 'payments') {
      return (
        <Table headers={['Programare', 'Data', 'Tip', 'Sumă', 'Acțiuni']}>
          {data.paymentDetails.map(p => <tr key={p.id}><Td>{p.appointmentCode}</Td><Td>{formatDate(p.paymentDate)}</Td><Td>{p.paymentType}</Td><Td>{Number(p.amount).toLocaleString('ro-MD')} MDL</Td><Td><Actions onEdit={() => edit('payments', data.payments.find(x => x.id === p.id) || p)} onDelete={() => remove('payments', p.id)} /></Td></tr>)}
        </Table>
      );
    }
    if (section === 'users') {
      return (
        <Table headers={['Email', 'Rol', 'Acțiuni']}>
          {data.userDetails.map(u => <tr key={u.id}><Td>{u.email}</Td><Td>{u.name}</Td><Td><Actions onEdit={() => edit('users', data.users.find(x => x.id === u.id) || u)} onDelete={() => remove('users', u.id)} /></Td></tr>)}
        </Table>
      );
    }
    return null;
  };

  return (
    <div style={page}>
      <aside style={sidebar}>
        <div style={brand}><div style={brandIcon}>A</div><b>ADMIN<span style={{ color: '#2563eb' }}>PANEL</span></b></div>
        <nav style={{ display: 'grid', gap: 8 }}>
          {menuItems.map(([key, label]) => <button key={key} onClick={() => setActive(key)} style={active === key ? navActive : navButton}>{label}</button>)}
        </nav>
        <div style={{ marginTop: 'auto', display: 'grid', gap: 8 }}>
          
          <button onClick={logoutAdmin} style={bottomButton}>Deconectare</button>
        </div>
      </aside>

      <main style={{ flex: 1, minWidth: 0 }}>
        <header style={header}>
          <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: 4 }}>SISTEM ADMINISTRARE AUTOPRO</div>
          <div style={avatar}>{user?.email?.slice(0, 2).toUpperCase() || 'AD'}</div>
        </header>
        <section style={{ padding: 32 }}>
          {error && <Alert type="error">{error}</Alert>}
          {message && <Alert type="success">{message}</Alert>}
          {renderSection()}
        </section>
      </main>
    </div>
  );
}

function AppointmentForm({ form, data, setField, save, resetForm, loading }) {
  const availableVehicles = form.customerId
    ? data.vehicles.filter(v => String(v.customerId) === String(form.customerId))
    : [];

  const handleCustomerChange = value => {
    setField('appointments', 'customerId', value);
    setField('appointments', 'vehicleId', '');
  };

  return <FormGrid>
    <Select label="Client" value={form.customerId} onChange={handleCustomerChange}><option value="">Alege client</option>{data.customers.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}</Select>
    <Select label="Vehicul" value={form.vehicleId} onChange={v => setField('appointments', 'vehicleId', v)}><option value="">{form.customerId ? 'Alege vehicul' : 'Alege întâi clientul'}</option>{availableVehicles.map(v => <option key={v.id} value={v.id}>{v.licensePlate} - {v.brand} {v.model}</option>)}</Select>
    <Select label="Mecanic" value={form.mechanicId} onChange={v => setField('appointments', 'mechanicId', v)}><option value="">Alege mecanic</option>{data.mechanics.map(m => <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>)}</Select>
    <Select label="Serviciu" value={form.serviceId} onChange={v => setField('appointments', 'serviceId', v)}><option value="">Alege serviciu</option>{data.services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</Select>
    <Input label="Data" type="datetime-local" value={form.scheduledDate} onChange={v => setField('appointments', 'scheduledDate', v)} />
    <Select label="Status" value={form.status} onChange={v => setField('appointments', 'status', v)}><option>Programat</option><option>În progres</option><option>Complet</option><option>Anulat</option></Select>
    <Input label="Problema" value={form.problemDescription} onChange={v => setField('appointments', 'problemDescription', v)} />
    <Buttons loading={loading} isEdit={form.id} onSave={() => save('appointments')} onCancel={() => resetForm('appointments')} />
  </FormGrid>;
}

function PersonForm({ section, form, data, setField, save, resetForm, loading }) {
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
    <Select label="Client" value={form.customerId} onChange={v => setField('vehicles', 'customerId', v)}><option value="">Alege client</option>{data.customers.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}</Select>
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
  const completedAppointments = data.appointmentDetails.filter(a => a.status === 'Complet');

  const handleAppointmentChange = value => {
    setField('payments', 'appointmentId', value);
    const appointment = data.appointmentDetails.find(a => String(a.id) === String(value));
    setField('payments', 'amount', appointment ? String(appointment.servicePrice) : '');
  };

  return <FormGrid>
    <Select label="Programare" value={form.appointmentId} onChange={handleAppointmentChange}>
      <option value="">Alege programare</option>
      {completedAppointments.map(a => <option key={a.id} value={a.id}>{a.appointmentCode}</option>)}
    </Select>
    <Select label="Tip" value={form.paymentType} onChange={v => setField('payments', 'paymentType', v)}><option>Numerar</option><option>Card</option></Select>
    <Input label="Sumă" type="number" value={form.amount} onChange={v => setField('payments', 'amount', v)} />
    <Buttons loading={loading} isEdit={form.id} onSave={() => save('payments')} onCancel={() => resetForm('payments')} />
  </FormGrid>;
}

function UserForm({ form, data, availableEmails, handleEmailChange, setField, save, resetForm, loading }) {
  const selectedRole = data.roles.find(r => r.id === Number(form.roleId));

  return <FormGrid>
    {!form.id ? (
      <>
        <Select label="Email" value={form.email} onChange={handleEmailChange}>
          <option value="">Selectează email</option>
          {availableEmails.length > 0 ? availableEmails.map(item => <option key={item.email} value={item.email}>{item.label}</option>) : <option value="">Nu sunt emailuri disponibile</option>}
        </Select>
        <Input label="Rol" type="text" value={selectedRole?.name || ''} onChange={() => {}} disabled />
      </>
    ) : (
      <Input label="Email" type="email" value={form.email} onChange={() => {}} disabled />
    )}
    <Input label={form.id ? 'Parolă nouă (opțional)' : 'Parolă'} value={form.passwordHash} type="password" onChange={v => setField('users', 'passwordHash', v)} />
    {form.id && <Select label="Rol" value={form.roleId} onChange={v => setField('users', 'roleId', v)}>{data.roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</Select>}
    <Select label="Activ" value={String(form.isActive)} onChange={v => setField('users', 'isActive', v === 'true')}><option value="true">Da</option><option value="false">Nu</option></Select>
    <Buttons loading={loading} isEdit={form.id} onSave={() => save('users')} onCancel={() => resetForm('users')} />
  </FormGrid>;
}

const endpoints = {
  appointments: '/appointments',
  mechanics: '/mechanic',
  customers: '/customer',
  vehicles: '/vehicles',
  services: '/services',
  payments: '/payments',
  users: '/users'
};

const titles = {
  appointments: 'Programări',
  mechanics: 'Mecanici',
  customers: 'Clienți',
  vehicles: 'Vehicule',
  services: 'Servicii',
  payments: 'Plăți',
  users: 'Utilizatori'
};

function toPayload(section, form) {
  if (section === 'appointments') return {
    customerId: Number(form.customerId), vehicleId: Number(form.vehicleId), mechanicId: Number(form.mechanicId),
    serviceId: Number(form.serviceId), scheduledDate: form.scheduledDate, problemDescription: form.problemDescription || null, status: form.status
  };
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

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString('ro-MD');
}

function Status({ value }) {
  const [bg, color] = statusStyle[value] || ['#e5e7eb', '#374151'];
  return <span style={{ background: bg, color, padding: '5px 10px', borderRadius: 999, fontSize: 11, fontWeight: 800, whiteSpace: 'nowrap', textTransform: 'uppercase' }}>{value}</span>;
}

function monthName(month) {
  const months = ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
    'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'];
  return months[month - 1];
}

function StatCard({ icon, title, value, accent, month }) {
  return <div style={statCard}>
    <div style={{ ...statIcon, background: `${accent}14`, color: accent }}>{icon}</div>
    <div style={{ fontSize: 28, fontWeight: 900 }}>{value}</div>
    <div style={statTitle}>{title}{month ? monthName(month) : ''}</div>
  </div>;
}

function Panel({ title, children }) {
  return <div><h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 16 }}>{title}</h2><div style={panel}>{children}</div></div>;
}

function Table({ headers, children }) {
  return <div style={{ overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr>{headers.map(h => <Th key={h}>{h}</Th>)}</tr></thead><tbody>{children}</tbody></table></div>;
}

function FormGrid({ children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(160px, 1fr))', gap: 14, alignItems: 'end' }}>{children}</div>;
}

function Input({ label, type = 'text', value, onChange, disabled }) {
  return <label style={fieldWrap}><span style={labelStyle}>{label}</span><input disabled={disabled} type={type} value={value ?? ''} onChange={e => onChange(e.target.value)} style={{ ...inputStyle, background: disabled ? '#f9fafb' : '#fff' }} /></label>;
}

function Select({ label, value, onChange, children, disabled }) {
  return <label style={fieldWrap}><span style={labelStyle}>{label}</span><select disabled={disabled} value={value ?? ''} onChange={e => onChange(e.target.value)} style={{ ...inputStyle, background: disabled ? '#f9fafb' : '#fff' }}>{children}</select></label>;
}

function Buttons({ loading, isEdit, onSave, onCancel }) {
  return <div style={{ display: 'flex', gap: 10 }}><button onClick={onSave} disabled={loading} style={primaryButton}>{loading ? 'Se salvează...' : isEdit ? 'Actualizează' : 'Adaugă'}</button>{isEdit && <button onClick={onCancel} style={secondaryButton}>Anulează</button>}</div>;
}

function Actions({ onEdit, onDelete }) {
  return <div style={{ display: 'flex', gap: 8 }}><button onClick={onEdit} style={smallButton}>Edit</button><button onClick={onDelete} style={{ ...smallButton, color: '#dc2626', borderColor: '#fecaca' }}>Delete</button></div>;
}

function Th({ children }) {
  return <th style={{ padding: '14px 20px', background: '#f5f6f8', color: '#94a3b8', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', textAlign: 'left', whiteSpace: 'nowrap' }}>{children}</th>;
}

function Td({ children }) {
  return <td style={{ padding: '16px 20px', borderTop: '1px solid #f1f5f9', fontSize: 14, verticalAlign: 'middle' }}>{children}</td>;
}

function Alert({ type, children }) {
  const error = type === 'error';
  return <div style={{ background: error ? '#fef2f2' : '#f0fdf4', border: `1px solid ${error ? '#fecaca' : '#bbf7d0'}`, color: error ? '#b91c1c' : '#15803d', padding: 14, borderRadius: 6, marginBottom: 18 }}>{children}</div>;
}

function MoneyIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" /></svg>; }
function PulseIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h4l3-8 4 16 3-8h4" /></svg>; }
function ToolIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.2-3.2a6 6 0 0 1-7.8 7.8l-6.2 6.2a2.1 2.1 0 0 1-3-3l6.2-6.2a6 6 0 0 1 7.8-7.8z" /></svg>; }
function UsersIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>; }

const page = { minHeight: '100vh', display: 'flex', background: '#f5f6f8', color: '#081225', fontFamily: 'Segoe UI, sans-serif' };
const sidebar = { width: 230, background: '#fff', borderRight: '1px solid #e5e7eb', padding: 22, display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh' };
const brand = { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 };
const brandIcon = { width: 36, height: 36, borderRadius: 8, background: '#0f172a', color: '#60a5fa', display: 'grid', placeItems: 'center', fontWeight: 900 };
const navButton = { border: 'none', textAlign: 'left', padding: '13px 14px', borderRadius: 6, cursor: 'pointer', fontWeight: 700, color: '#475569', background: 'transparent' };
const navActive = { ...navButton, color: '#fff', background: '#0f172a' };
const bottomButton = { border: 'none', background: 'transparent', textAlign: 'left', color: '#64748b', fontWeight: 700, padding: '10px 12px', cursor: 'pointer' };
const header = { height: 72, background: '#fff', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' };
const avatar = { width: 38, height: 38, borderRadius: '50%', background: '#0f172a', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 12 };
const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 18, marginBottom: 30 };
const statCard = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 26, boxShadow: 'none' };
const statIcon = { width: 42, height: 42, borderRadius: 8, display: 'grid', placeItems: 'center', marginBottom: 18 };
const statTitle = { fontSize: 11, color: '#94a3b8', fontWeight: 900, letterSpacing: 1.2, textTransform: 'uppercase' };
const panel = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' };
const muted = { color: '#64748b', fontSize: 12, marginTop: 4 };
const fieldWrap = { display: 'flex', flexDirection: 'column', gap: 6 };
const labelStyle = { fontSize: 11, color: '#64748b', fontWeight: 900, letterSpacing: 0.8, textTransform: 'uppercase' };
const inputStyle = { height: 42, border: '1px solid #e5e7eb', borderRadius: 6, padding: '0 12px', outline: 'none', fontSize: 14, background: '#fff' };
const primaryButton = { height: 42, border: 'none', borderRadius: 6, padding: '0 16px', background: '#2563eb', color: '#fff', fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap' };
const secondaryButton = { height: 42, border: '1px solid #e5e7eb', borderRadius: 6, padding: '0 16px', background: '#fff', color: '#475569', fontWeight: 800, cursor: 'pointer' };
const smallButton = { border: '1px solid #dbeafe', background: '#fff', color: '#2563eb', borderRadius: 8, padding: '7px 10px', cursor: 'pointer', fontWeight: 800, fontSize: 12 };

