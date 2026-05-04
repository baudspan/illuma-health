import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Search } from 'lucide-react';

export default function AdminStaff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ Name: '', Role: 'Doctor', Contact: '', Email: '' });

  const fetchStaff = () => {
    fetch('http://localhost:8000/api/staff')
      .then(r => r.json())
      .then(data => { setStaff(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    await fetch('http://localhost:8000/api/staff', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setShowAdd(false);
    setForm({ Name: '', Role: 'Doctor', Contact: '', Email: '' });
    fetchStaff();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this staff member?')) return;
    await fetch(`http://localhost:8000/api/staff/${id}`, { method: 'DELETE' });
    fetchStaff();
  };

  const filtered = staff.filter(s => s.Name.toLowerCase().includes(search.toLowerCase()) || (s.Role || '').toLowerCase().includes(search.toLowerCase()));

  const roleColor = (role) => {
    switch(role) {
      case 'Doctor': return 'var(--color-primary)';
      case 'Nurse': return 'var(--color-error)';
      case 'Admin': return 'var(--color-warning)';
      default: return 'var(--color-success)';
    }
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>Staff Directory</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input className="input-field" style={{ paddingLeft: '36px', width: '250px' }} placeholder="Search staff..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}><Plus size={18} /> Add Staff</button>
        </div>
      </div>

      {showAdd && (
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
          <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '16px', alignItems: 'end' }}>
            <div>
              <label className="label">Name</label>
              <input className="input-field" value={form.Name} onChange={e => setForm({...form, Name: e.target.value})} required />
            </div>
            <div>
              <label className="label">Role</label>
              <select className="input-field" value={form.Role} onChange={e => setForm({...form, Role: e.target.value})}>
                <option>Doctor</option><option>Nurse</option><option>Admin</option><option>Receptionist</option><option>Pharmacist</option><option>Lab_Tech</option><option>Dietician</option><option>Other</option>
              </select>
            </div>
            <div>
              <label className="label">Contact</label>
              <input className="input-field" value={form.Contact} onChange={e => setForm({...form, Contact: e.target.value})} />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input-field" value={form.Email} onChange={e => setForm({...form, Email: e.target.value})} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ height: '44px' }}>Save</button>
          </form>
        </div>
      )}

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--color-background)' }}>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-muted)' }}>ID</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-muted)' }}>NAME</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-muted)' }}>ROLE</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-muted)' }}>CONTACT</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-muted)' }}>STATUS</th>
              <th style={{ padding: '16px 24px', textAlign: 'right', fontWeight: 600, color: 'var(--color-text-muted)' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ padding: '32px', textAlign: 'center' }}>Loading...</td></tr>
            ) : filtered.map((s, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '16px 24px', fontWeight: 600 }}>STF-{s.Staff_ID}</td>
                <td style={{ padding: '16px 24px' }}>{s.Name}</td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600, background: `${roleColor(s.Role)}15`, color: roleColor(s.Role) }}>{s.Role}</span>
                </td>
                <td style={{ padding: '16px 24px', color: 'var(--color-text-muted)' }}>{s.Contact || s.Email || '-'}</td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ color: s.Status === 'Active' ? 'var(--color-success)' : 'var(--color-text-muted)' }}>{s.Status}</span>
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  <button className="icon-btn" onClick={() => handleDelete(s.Staff_ID)} title="Remove"><Trash2 size={16} color="var(--color-error)" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
