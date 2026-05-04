import React, { useState, useEffect } from 'react';
import { X, Pill } from 'lucide-react';

export default function RequestMedicineModal({ isOpen, onClose }) {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    Item_ID: '',
    Quantity_Dispensed: 1,
    Prescription_ID: 1 // Default/mock for prototype
  });

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('http://localhost:8000/api/inventory')
        .then(res => res.json())
        .then(data => {
          setInventory(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.Item_ID) return alert("Select an item.");

    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:8000/api/dispense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert("Medicine requested successfully!");
        onClose();
      } else {
        const err = await res.json();
        alert("Error: " + err.detail);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '32px', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer' }}>
          <X size={24} color="var(--color-text-muted)" />
        </button>
        
        <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Pill size={24} color="var(--color-primary)" /> Request Medicine
        </h2>

        {loading ? (
          <p>Loading inventory...</p>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="label">Select Medicine / Supply</label>
              <select 
                className="input-field" 
                value={formData.Item_ID} 
                onChange={e => setFormData({...formData, Item_ID: parseInt(e.target.value)})}
                required
              >
                <option value="">-- Choose Item --</option>
                {inventory.map(item => (
                  <option key={item.Item_ID} value={item.Item_ID} disabled={item.Stock_Quantity <= 0}>
                    {item.Item_Name} (In Stock: {item.Stock_Quantity})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="label">Quantity</label>
              <input 
                type="number" 
                className="input-field" 
                min="1" 
                value={formData.Quantity_Dispensed} 
                onChange={e => setFormData({...formData, Quantity_Dispensed: parseInt(e.target.value)})}
                required
              />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
              <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={submitting || !formData.Item_ID}>
                {submitting ? 'Requesting...' : 'Request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
