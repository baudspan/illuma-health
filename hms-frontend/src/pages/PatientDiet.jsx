import React, { useState, useEffect } from 'react';
import { Utensils, Clock, CheckCircle } from 'lucide-react';

export default function PatientDiet() {
  const patientId = 1; 
  const [dietPlan, setDietPlan] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:8000/api/diet/${patientId}`)
      .then(res => res.json())
      .then(data => {
        setDietPlan(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [patientId]);

  const getTimeForMeal = (type) => {
    switch(type) {
      case 'Breakfast': return '08:00 AM';
      case 'Lunch': return '01:00 PM';
      case 'Snack': return '04:30 PM';
      case 'Dinner': return '07:30 PM';
      default: return 'Anytime';
    }
  };

  const getImageForMeal = (type) => {
    switch(type) {
      case 'Breakfast': return 'https://images.unsplash.com/photo-1494390248081-4e521a5940db?auto=format&fit=crop&w=300&q=80';
      case 'Lunch': return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=300&q=80';
      case 'Snack': return 'https://images.unsplash.com/photo-1590080875518-356c526d1ee5?auto=format&fit=crop&w=300&q=80';
      case 'Dinner': return 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=300&q=80';
      default: return 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=300&q=80';
    }
  };

  return (
    <div className="page-container">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ marginBottom: '8px' }}>Smart Diet & Meal Plan</h1>
        <p className="label">Your personalized clinical nutrition timeline for faster recovery.</p>
      </div>

      {loading ? <p>Loading diet plan...</p> : (
        <div style={{ display: 'grid', gap: '24px', position: 'relative' }}>
          {/* Vertical line for timeline */}
          <div style={{ position: 'absolute', left: '24px', top: '24px', bottom: '24px', width: '2px', background: 'var(--color-border)', zIndex: 0 }}></div>

          {dietPlan.map((meal, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '24px', position: 'relative', zIndex: 1 }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--color-surface)', border: '2px solid var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: 'var(--shadow-sm)' }}>
                <Utensils size={20} color="var(--color-primary)" />
              </div>
              
              <div className="glass-panel" style={{ flex: 1, padding: '0', display: 'flex', overflow: 'hidden', alignItems: 'stretch' }}>
                <div style={{ width: '150px', flexShrink: 0 }}>
                  <img src={getImageForMeal(meal.Meal_Type)} alt={meal.Meal_Type} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '24px', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '18px', color: 'var(--color-primary)' }}>{meal.Meal_Type}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-muted)', fontSize: '14px', fontWeight: 600 }}>
                      <Clock size={16} /> {getTimeForMeal(meal.Meal_Type)}
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '12px', fontSize: '16px', fontWeight: 500 }}>
                    {meal.Food_Items}
                  </div>
                  
                  {meal.Special_Instructions && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 170, 0, 0.1)', color: 'var(--color-warning)', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>
                      <CheckCircle size={14} /> {meal.Special_Instructions}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
