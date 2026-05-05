import React, { useState, useEffect } from 'react';
import { CreditCard, Download, Printer, ShieldCheck } from 'lucide-react';

export default function PatientBilling() {
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPaid, setIsPaid] = useState(false);
  const patientId = 1; // Default to Rajesh for testing

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/billing/generate/${patientId}`)
      .then(res => res.json())
      .then(data => {
        setBill(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [patientId]);

  return (
    <div className="page-container">
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ marginBottom: '8px' }}>Billing & Insurance</h1>
          <p className="label">Dynamic invoice based on your clinical activity.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-outline"><Printer size={18} style={{ marginRight: '8px' }} /> Print</button>
          <button className="btn btn-primary"><Download size={18} style={{ marginRight: '8px' }} /> Download PDF</button>
        </div>
      </div>

      {loading ? <p>Calculating charges...</p> : bill ? (
        <div className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px' }}>

          {/* Invoice Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--color-border)', paddingBottom: '24px', marginBottom: '32px' }}>
            <div>
              <h2 style={{ color: 'var(--color-primary)', marginBottom: '8px' }}>Illuma Health Systems</h2>
              <p className="label" style={{ margin: 0 }}>123 Care Avenue, Wellness City</p>
              <p className="label" style={{ margin: 0 }}>Phone: +1 (555) 123-4567</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h2 style={{ color: 'var(--color-text-main)', marginBottom: '8px' }}>INVOICE</h2>
              <p className="label" style={{ margin: 0 }}><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
              <p className="label" style={{ margin: 0 }}><strong>Patient ID:</strong> {patientId}</p>
            </div>
          </div>

          {/* Itemized Bill */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '32px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '12px 0', textAlign: 'left', color: 'var(--color-text-muted)' }}>DESCRIPTION</th>
                <th style={{ padding: '12px 0', textAlign: 'right', color: 'var(--color-text-muted)' }}>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '16px 0', borderBottom: '1px solid var(--color-border)' }}>
                  <strong>Doctor Consultation Fees</strong>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Based on completed appointments</div>
                </td>
                <td style={{ padding: '16px 0', textAlign: 'right', borderBottom: '1px solid var(--color-border)' }}>₹{bill.Doctor_Total.toFixed(2)}</td>
              </tr>
              <tr>
                <td style={{ padding: '16px 0', borderBottom: '1px solid var(--color-border)' }}>
                  <strong>Laboratory & Diagnostic Tests</strong>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Tests ordered by doctor</div>
                </td>
                <td style={{ padding: '16px 0', textAlign: 'right', borderBottom: '1px solid var(--color-border)' }}>₹{bill.Lab_Total.toFixed(2)}</td>
              </tr>
              <tr>
                <td style={{ padding: '16px 0', borderBottom: '1px solid var(--color-border)' }}>
                  <strong>Pharmacy & Medicines</strong>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Medicines dispensed from inventory</div>
                </td>
                <td style={{ padding: '16px 0', textAlign: 'right', borderBottom: '1px solid var(--color-border)' }}>₹{bill.Pharmacy_Total.toFixed(2)}</td>
              </tr>
              <tr>
                <td style={{ padding: '16px 0', borderBottom: '1px solid var(--color-border)' }}>
                  <strong>Room & Stay Charges</strong>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Bed and nursing charges</div>
                </td>
                <td style={{ padding: '16px 0', textAlign: 'right', borderBottom: '1px solid var(--color-border)' }}>₹{bill.Room_Total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          {/* Totals */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-background)', padding: '24px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-success)', fontWeight: 600 }}>
              <ShieldCheck size={20} /> Insurance Verified
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="label" style={{ marginBottom: '4px' }}>Total Amount Due</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-primary)' }}>₹{bill.Grand_Total.toFixed(2)}</div>
            </div>
          </div>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            {isPaid ? (
              <div style={{ padding: '16px', background: 'rgba(0, 196, 159, 0.1)', color: 'var(--color-success)', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <ShieldCheck /> Payment Successful! Receipt Sent.
              </div>
            ) : (
              <button className="btn btn-primary" onClick={() => setIsPaid(true)} style={{ width: '100%', padding: '16px', fontSize: '16px' }}>
                <CreditCard style={{ marginRight: '8px' }} /> Pay Securely Online
              </button>
            )}
          </div>
        </div>
      ) : <p>Failed to load bill.</p>}
    </div>
  );
}
