import React, { useState, useEffect } from 'react';
import { Pill, Search } from 'lucide-react';

export default function DoctorPharmacy() {
  const [inventory, setInventory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/inventory')
      .then(res => res.json())
      .then(data => {
        setInventory(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ marginBottom: '8px' }}>Pharmacy Directory</h1>
          <p className="label">Check medicine availability and hospital stock levels.</p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: '16px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input 
              type="text" 
              className="input-field" 
              placeholder="Search medicines..." 
              style={{ paddingLeft: '44px' }} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--color-background)' }}>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-muted)' }}>ITEM NAME</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-muted)' }}>STOCK LEVEL</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-muted)' }}>UNIT PRICE</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-muted)' }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" style={{ padding: '32px', textAlign: 'center' }}>Loading inventory...</td></tr>
            ) : inventory.filter(item => item.Item_Name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
              <tr><td colSpan="4" style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>No items found matching "{searchQuery}".</td></tr>
            ) : inventory.filter(item => item.Item_Name.toLowerCase().includes(searchQuery.toLowerCase())).map((item, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '16px 24px', fontWeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Pill size={16} color="var(--color-primary)" /> {item.Item_Name}
                  </div>
                </td>
                <td style={{ padding: '16px 24px', fontWeight: 500 }}>{item.Stock_Quantity} Units</td>
                <td style={{ padding: '16px 24px', color: 'var(--color-text-muted)' }}>${item.Unit_Price}</td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ 
                    padding: '4px 10px', 
                    borderRadius: '12px', 
                    fontSize: '12px', 
                    fontWeight: 600,
                    background: item.Stock_Quantity > 50 ? 'rgba(0, 196, 159, 0.1)' : item.Stock_Quantity > 0 ? 'rgba(255, 170, 0, 0.1)' : 'rgba(255, 77, 109, 0.1)',
                    color: item.Stock_Quantity > 50 ? 'var(--color-success)' : item.Stock_Quantity > 0 ? 'var(--color-warning)' : 'var(--color-error)'
                  }}>
                    {item.Stock_Quantity > 50 ? 'In Stock' : item.Stock_Quantity > 0 ? 'Low Stock' : 'Out of Stock'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
