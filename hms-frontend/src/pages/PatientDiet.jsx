import React, { useState, useEffect } from 'react';
import { Utensils, Clock, CheckCircle, MapPin, AlertTriangle, Coffee, Pizza, Soup } from 'lucide-react';

export default function PatientDiet() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/patients/me/status')
      .then(res => res.json())
      .then(data => {
        setStatus(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="page-container"><p>Loading your clinical details...</p></div>;

  if (!status || !status.admission) {
    return (
      <div className="page-container">
        <div className="glass-panel" style={{ textAlign: 'center', padding: '48px' }}>
          <Utensils size={48} color="var(--color-text-muted)" style={{ marginBottom: '16px' }} />
          <h2>No Active Admission</h2>
          <p className="label">Your diet plan will appear here when you are admitted to a ward.</p>
        </div>
      </div>
    );
  }

  const diet = status.diet || { Type: 'General', Instructions: 'Standard hospital diet. Avoid oily foods.' };
  
  return (
    <div className="page-container">
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ marginBottom: '8px' }}>Clinical Nutrition Plan</h1>
          <p className="label">Generated based on your medical prescription and diagnosis.</p>
        </div>
        <div style={{ background: 'var(--color-primary)', color: 'white', padding: '12px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 8px 16px rgba(124, 107, 237, 0.2)' }}>
          <MapPin size={20} />
          <div>
            <div style={{ fontSize: '10px', opacity: 0.8, fontWeight: 600, textTransform: 'uppercase' }}>Current Location</div>
            <div style={{ fontWeight: 700 }}>{status.room.Number} ({status.room.Type})</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        {/* Left Column: Meal Timeline */}
        <div>
          <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', borderLeft: '4px solid var(--color-success)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <CheckCircle size={20} color="var(--color-success)" />
              <h3 style={{ margin: 0 }}>Active Diet: {diet.Type}</h3>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '16px' }}>
             <MealCard 
                icon={<Coffee size={24} />} 
                title="Breakfast" 
                time="08:30 AM" 
                menu="Oatmeal with Skimmed Milk, 1 Apple, 2 Egg Whites" 
                instructions="Serve at room temperature"
             />
             <MealCard 
                icon={<Pizza size={24} />} 
                title="Lunch" 
                time="01:00 PM" 
                menu="Boiled Brown Rice, Yellow Dal (No Salt), 1 Cup Curd" 
                instructions="High Fiber, Low Sodium"
             />
             <MealCard 
                icon={<Soup size={24} />} 
                title="Dinner" 
                time="07:30 PM" 
                menu="Clear Vegetable Soup, 1 Multi-grain Roti, Boiled Sabzi" 
                instructions="Easy to digest"
             />
          </div>
        </div>

        {/* Right Column: Warnings and Instructions */}
        <div>
          <div className="glass-panel" style={{ background: 'rgba(255, 77, 109, 0.05)', borderColor: 'rgba(255, 77, 109, 0.2)', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-error)', marginBottom: '16px' }}>
              <AlertTriangle size={24} />
              <h3 style={{ margin: 0 }}>Avoid List</h3>
            </div>
            <ul style={{ paddingLeft: '20px', color: 'var(--color-text)', fontSize: '14px', lineHeight: 1.8 }}>
              <li>Excessive Salt / Pickles</li>
              <li>Fried or Oily Snacks</li>
              <li>Red Meat / High Fat Dairy</li>
              <li>Sugary Carbonated Drinks</li>
            </ul>
          </div>

          <div className="glass-panel">
            <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>Doctor's Notes</h3>
            <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--color-text-muted)' }}>
              {diet.Instructions}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MealCard({ icon, title, time, menu, instructions }) {
  return (
    <div className="glass-panel" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
      <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(124, 107, 237, 0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <h4 style={{ margin: 0, fontSize: '18px' }}>{title}</h4>
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>{time}</span>
        </div>
        <p style={{ margin: '0 0 8px 0', fontSize: '15px', color: 'var(--color-text)' }}>{menu}</p>
        <div style={{ fontSize: '12px', color: 'var(--color-success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <CheckCircle size={14} /> {instructions}
        </div>
      </div>
    </div>
  );
}
