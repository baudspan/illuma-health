import React, { useState, useEffect } from 'react';
import { Plus, Search, ArrowUpCircle } from 'lucide-react';

export default function AdminInventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ Item_Name: '', Stock_Quantity: 0, Unit_Price: 0 });

  const fetchItems = () => {
    fetch('http://localhost:8000/api/inventory')
      .then(r => r.json())
      .then(data => { setItems(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchItems(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    await fetch('http://localhost:8000/api/inventory', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setShowAdd(false);
    setForm({ Item_Name: '', Stock_Quantity: 0, Unit_Price: 0 });
    fetchItems();
  };

  const handleRestock = async (itemId) => {
    const qty = window.prompt('Enter quantity to add:');
    if (!qty || isNaN(qty)) return;
    await fetch(`http://localhost:8000/api/inventory/${itemId}/restock`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: parseInt(qty) })
    });
    fetchItems();
  };

  const filtered = items.filter(i => (i.Item_Name || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>Global Inventory</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input className="input-field" style={{ paddingLeft: '36px', width: '250px' }} placeholder="Search inventory..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}><Plus size={18} /> Add Item</button>
        </div>
      </div>

      {showAdd && (
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
          <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '16px', alignItems: 'end' }}>
            <div>
              <label className="label">Item Name</label>
              <input className="input-field" value={form.Item_Name} onChange={e => setForm({...form, Item_Name: e.target.value})} required />
            </div>
            <div>
              <label className="label">Stock Qty</label>
              <input type="number" className="input-field" value={form.Stock_Quantity} onChange={e => setForm({...form, Stock_Quantity: parseInt(e.target.value)})} />
            </div>
            <div>
              <label className="label">Unit Price (₹)</label>
              <input type="number" step="0.01" className="input-field" value={form.Unit_Price} onChange={e => setForm({...form, Unit_Price: parseFloat(e.target.value)})} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ height: '44px' }}>Save</button>
          </form>
        </div>
      )}

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--color-background)' }}>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-muted)' }}>ITEM</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-muted)' }}>STOCK</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-muted)' }}>UNIT PRICE</th>
              <th style={{ padding: '16px 24px', textAlign: 'right', fontWeight: 600, color: 'var(--color-text-muted)' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" style={{ padding: '32px', textAlign: 'center' }}>Loading...</td></tr>
            ) : filtered.map((item, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '16px 24px', fontWeight: 600 }}>{item.Item_Name}</td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600,
                    background: item.Stock_Quantity < 10 ? 'rgba(255, 77, 109, 0.1)' : 'rgba(0, 196, 159, 0.1)',
                    color: item.Stock_Quantity < 10 ? 'var(--color-error)' : 'var(--color-success)' }}>
                    {item.Stock_Quantity} units
                  </span>
                </td>
                <td style={{ padding: '16px 24px', color: 'var(--color-text-muted)' }}>₹{item.Unit_Price}</td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '12px' }} onClick={() => handleRestock(item.Item_ID)}>
                    <ArrowUpCircle size={14} style={{ marginRight: '4px' }} /> Restock
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
