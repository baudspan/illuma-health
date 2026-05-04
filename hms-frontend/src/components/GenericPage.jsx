import React from 'react';
import { Settings, CheckCircle } from 'lucide-react';

export default function GenericPage({ title, description }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div style={{ background: 'white', padding: '48px', borderRadius: '24px', boxShadow: '0 8px 32px rgba(124, 107, 237, 0.08)', border: '1px solid var(--color-border)', maxWidth: '500px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <div style={{ background: 'rgba(124, 107, 237, 0.1)', padding: '20px', borderRadius: '50%', color: 'var(--color-primary)' }}>
            <Settings size={48} />
          </div>
        </div>
        <h1 style={{ marginBottom: '16px' }}>{title}</h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '32px', fontSize: '16px', lineHeight: 1.6 }}>
          {description || "This module is fully structurally integrated into the UI. Once the FastAPI backend is connected, real data will be injected here."}
        </p>
        <button className="btn btn-outline" style={{ pointerEvents: 'none' }}>
          <CheckCircle size={18} style={{ color: 'var(--color-success)' }} />
          UI Component Ready for Backend
        </button>
      </div>
    </div>
  );
}
