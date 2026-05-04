import React, { useState, useEffect } from 'react';
import { X, FileText, Plus, Trash2, Pill } from 'lucide-react';

export default function PrescriptionModal({ isOpen, onClose }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    Patient_ID: '',
    Doctor_ID: 1, // hardcoded for now
    Notes: '',
    Medications: []
  });

  const [currentMed, setCurrentMed] = useState({
    Medicine_Name: '',
    Dosage: '',
    Duration: '',
    Instructions: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetch('http://localhost:8000/api/patients')
        .then(res => res.json())
        .then(data => setPatients(data))
        .catch(err => console.error(err));
    }
  }, [isOpen]);

  const handleMedChange = (e) => {
    setCurrentMed({ ...currentMed, [e.target.name]: e.target.value });
  };

  const addMedication = () => {
    if (currentMed.Medicine_Name && currentMed.Dosage) {
      setFormData({
        ...formData,
        Medications: [...formData.Medications, currentMed]
      });
      setCurrentMed({ Medicine_Name: '', Dosage: '', Duration: '', Instructions: '' });
    }
  };

  const removeMedication = (index) => {
    const newMeds = [...formData.Medications];
    newMeds.splice(index, 1);
    setFormData({ ...formData, Medications: newMeds });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.Patient_ID) {
      alert("Please select a patient.");
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setFormData({ Patient_ID: '', Doctor_ID: 1, Notes: '', Medications: [] });
        onClose();
        alert("Prescription saved successfully!");
      } else {
        const err = await res.json();
        alert("Error: " + err.detail);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '800px', padding: '32px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer' }}>
          <X size={24} color="var(--color-text-muted)" />
        </button>
        
        <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={24} color="var(--color-primary)" /> Write Prescription
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <div>
              <label className="label">Patient ID</label>
              <input 
                type="number"
                className="input-field" 
                value={formData.Patient_ID} 
                onChange={e => setFormData({...formData, Patient_ID: parseInt(e.target.value) || ''})}
                placeholder="Enter Patient ID"
                required
              />
            </div>
            <div>
              <label className="label">Clinical Notes</label>
              <textarea 
                className="input-field" 
                value={formData.Notes} 
                onChange={e => setFormData({...formData, Notes: e.target.value})}
                placeholder="Diagnosis, observations..."
                rows="3"
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '24px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Pill size={18} /> Medications
            </h3>
            
            {/* Added Medications List */}
            {formData.Medications.length > 0 && (
              <div style={{ marginBottom: '16px', background: 'var(--color-background)', borderRadius: '8px', padding: '12px' }}>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '8px' }}>Medicine</th>
                      <th style={{ padding: '8px' }}>Dosage</th>
                      <th style={{ padding: '8px' }}>Duration</th>
                      <th style={{ padding: '8px' }}>Instructions</th>
                      <th style={{ padding: '8px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.Medications.map((med, idx) => (
                      <tr key={idx} style={{ borderTop: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '8px', fontWeight: 500 }}>{med.Medicine_Name}</td>
                        <td style={{ padding: '8px' }}>{med.Dosage}</td>
                        <td style={{ padding: '8px' }}>{med.Duration}</td>
                        <td style={{ padding: '8px', color: 'var(--color-text-muted)' }}>{med.Instructions}</td>
                        <td style={{ padding: '8px', textAlign: 'right' }}>
                          <button type="button" onClick={() => removeMedication(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)' }}>
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Add Medication Form */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr auto', gap: '12px', alignItems: 'end' }}>
              <div>
                <label className="label">Medicine Name</label>
                <input type="text" name="Medicine_Name" value={currentMed.Medicine_Name} onChange={handleMedChange} className="input-field" placeholder="e.g. Paracetamol" />
              </div>
              <div>
                <label className="label">Dosage</label>
                <input type="text" name="Dosage" value={currentMed.Dosage} onChange={handleMedChange} className="input-field" placeholder="500mg" />
              </div>
              <div>
                <label className="label">Duration</label>
                <input type="text" name="Duration" value={currentMed.Duration} onChange={handleMedChange} className="input-field" placeholder="5 Days" />
              </div>
              <div>
                <label className="label">Instructions</label>
                <input type="text" name="Instructions" value={currentMed.Instructions} onChange={handleMedChange} className="input-field" placeholder="After meals" />
              </div>
              <button type="button" onClick={addMedication} className="btn btn-outline" style={{ height: '42px', padding: '0 16px' }}>
                <Plus size={18} /> Add
              </button>
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading || formData.Medications.length === 0}>
              {loading ? 'Saving...' : 'Save Prescription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
