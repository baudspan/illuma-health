import React, { useState, useEffect } from 'react';
import { LayoutGrid, User, AlertCircle, CheckCircle2, Bed } from 'lucide-react';

export default function WardManagement() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/rooms')
      .then(res => res.json())
      .then(data => {
        setRooms(data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Available': return 'var(--color-success)';
      case 'Occupied': return 'var(--color-error)';
      case 'Maintenance': return 'var(--color-warning)';
      default: return 'var(--color-text-muted)';
    }
  };

  return (
    <div className="page-container">
      <div style={{ marginBottom: '32px' }}>
        <h1>Ward & Bed Management</h1>
        <p className="label">Live floor map and occupancy tracking for all departments.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {rooms.map((room) => (
          <div key={room.Room_ID} className="glass-panel" style={{ padding: '24px', borderTop: `4px solid ${getStatusColor(room.Status)}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '10px', background: 'rgba(124, 107, 237, 0.1)', color: 'var(--color-primary)', borderRadius: '12px' }}>
                  <Bed size={24} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '18px' }}>{room.Room_Number}</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{room.Room_Type}</div>
                </div>
              </div>
              <div style={{ 
                padding: '4px 10px', 
                borderRadius: '20px', 
                fontSize: '11px', 
                fontWeight: 700, 
                textTransform: 'uppercase',
                background: `${getStatusColor(room.Status)}20`,
                color: getStatusColor(room.Status)
              }}>
                {room.Status}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Capacity</span>
                <span style={{ fontWeight: 600 }}>{room.Capacity} Beds</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Daily Rate</span>
                <span style={{ fontWeight: 600 }}>₹{room.Rate_Per_Day}</span>
              </div>
            </div>

            {room.Status === 'Occupied' ? (
              <button className="btn btn-outline" style={{ width: '100%', marginTop: '20px', fontSize: '13px' }}>
                View Patient Details
              </button>
            ) : (
              <button className="btn btn-primary" style={{ width: '100%', marginTop: '20px', fontSize: '13px' }} disabled={room.Status === 'Maintenance'}>
                {room.Status === 'Maintenance' ? 'Under Repair' : 'Assign Patient'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
