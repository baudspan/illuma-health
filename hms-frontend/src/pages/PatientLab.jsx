import React, { useState, useEffect } from 'react';
import { Microscope, Activity } from 'lucide-react';

export default function PatientLab() {
  const patientId = 1; // Logged in patient mock
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/labs/orders/${patientId}`);
      if (res.ok) setOrders(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [patientId]);

  const generateReport = async (orderId) => {
    try {
      const res = await fetch('http://localhost:8000/api/labs/generate_result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Order_ID: orderId })
      });
      if (res.ok) {
        alert("Report generated successfully! (Abnormal alert sent to Doctor Emergency Queue)");
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-container">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ marginBottom: '8px' }}>Lab & Diagnostics</h1>
        <p className="label">Track diagnostic tests scheduled by your doctor.</p>
      </div>

      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--color-background)' }}>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-muted)' }}>TEST NAME</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-muted)' }}>ORDER DATE</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-muted)' }}>STATUS</th>
              <th style={{ padding: '16px 24px', textAlign: 'right', fontWeight: 600, color: 'var(--color-text-muted)' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" style={{ padding: '32px', textAlign: 'center' }}>Loading tests...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan="4" style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>No lab tests scheduled.</td></tr>
            ) : orders.map((order, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '16px 24px', fontWeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Microscope size={16} color="var(--color-primary)" /> {order.Test_Name}
                  </div>
                </td>
                <td style={{ padding: '16px 24px', color: 'var(--color-text-muted)' }}>
                  {order.Order_Date ? new Date(order.Order_Date).toLocaleDateString() : 'N/A'}
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ 
                    padding: '4px 10px', 
                    borderRadius: '12px', 
                    fontSize: '12px', 
                    fontWeight: 600,
                    background: order.Status === 'Completed' ? 'rgba(0, 196, 159, 0.1)' : 'rgba(255, 170, 0, 0.1)',
                    color: order.Status === 'Completed' ? 'var(--color-success)' : 'var(--color-warning)'
                  }}>
                    {order.Status}
                  </span>
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  {order.Status === 'Pending' ? (
                    <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '12px', borderColor: 'var(--color-error)', color: 'var(--color-error)' }} onClick={() => generateReport(order.Order_ID)}>
                      <Activity size={14} style={{ marginRight: '4px' }}/> Generate Report
                    </button>
                  ) : (
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Result Generated</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
