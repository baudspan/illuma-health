import React, { useState, useEffect } from 'react';
import { Activity, Users, Calendar, AlertCircle, FileText, Pill, Plus } from 'lucide-react';
import AddPatientModal from '../components/AddPatientModal';
import PatientVitalsModal from '../components/PatientVitalsModal';
import PrescriptionModal from '../components/PrescriptionModal';
import LabAlertsModal from '../components/LabAlertsModal';
import RequestMedicineModal from '../components/RequestMedicineModal';

export default function DashboardHome() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVitalsOpen, setIsVitalsOpen] = useState(false);
  const [isPrescriptionOpen, setIsPrescriptionOpen] = useState(false);
  const [isLabAlertsOpen, setIsLabAlertsOpen] = useState(false);
  const [isMedicineOpen, setIsMedicineOpen] = useState(false);

  const [stats, setStats] = useState({ patients: 0, appointments: 0, alerts: 0 });
  const [upcomingApts, setUpcomingApts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ptsRes, aptsRes, alertsRes] = await Promise.all([
          fetch('http://localhost:8000/api/patients'),
          fetch('http://localhost:8000/api/appointments'),
          fetch('http://localhost:8000/api/labs/alerts')
        ]);
        
        const pts = await ptsRes.json();
        const apts = await aptsRes.json();
        const alerts = await alertsRes.json();
        
        const pendingApts = apts.filter(a => a.Status !== 'Completed' && a.Status !== 'Cancelled');
        
        setStats({
          patients: pts.length,
          appointments: pendingApts.length,
          alerts: alerts.length
        });
        
        setUpcomingApts(pendingApts.slice(0, 4)); // top 4
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="dashboard-home">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0 }}>Welcome back, Dr. Sharma</h1>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> New Patient
        </button>
      </div>
      
      {/* Stats Grid */}
      <div className="stats-grid" style={{ marginBottom: '32px' }}>
        <div className="stat-card glass-panel">
          <div className="stat-icon" style={{ background: 'rgba(124, 107, 237, 0.1)', color: 'var(--color-primary)' }}>
            <Users size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-label">Total Patients</span>
            <span className="stat-value">{stats.patients}</span>
          </div>
        </div>
        
        <div className="stat-card glass-panel">
          <div className="stat-icon" style={{ background: 'rgba(0, 196, 159, 0.1)', color: 'var(--color-success)' }}>
            <Calendar size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-label">Upcoming Appointments</span>
            <span className="stat-value">{stats.appointments}</span>
          </div>
        </div>
        
        <div className="stat-card glass-panel" style={{ borderLeft: '4px solid var(--color-error)' }}>
          <div className="stat-icon" style={{ background: 'rgba(255, 77, 109, 0.1)', color: 'var(--color-error)' }}>
            <AlertCircle size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-label">Abnormal Lab Alerts</span>
            <span className="stat-value text-error">{stats.alerts}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        {/* Main Content Left */}
        <div>
          <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Upcoming Appointments</h2>
          <div className="glass-panel" style={{ padding: '0' }}>
            {upcomingApts.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>No upcoming appointments.</div>
            ) : upcomingApts.map((apt, idx) => (
              <div key={idx} style={{ padding: '16px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{apt.Patient_Name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>ID: {apt.Patient_ID}</div>
                </div>
                <div style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={14} /> {apt.Appointment_Date} 
                  <span style={{ margin: '0 4px' }}>|</span>
                  {apt.Appointment_Time}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Right */}
        <div>
          <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Quick Actions</h2>
          <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button className="btn btn-outline" style={{ justifyContent: 'flex-start' }} onClick={() => setIsPrescriptionOpen(true)}>
              <FileText size={18} /> Write Prescription
            </button>
            <button className="btn btn-outline" style={{ justifyContent: 'flex-start' }} onClick={() => setIsLabAlertsOpen(true)}>
              <AlertCircle size={18} /> View Lab Alerts
            </button>
            <button className="btn btn-outline" style={{ justifyContent: 'flex-start' }} onClick={() => setIsMedicineOpen(true)}>
              <Pill size={18} /> Request Medicine
            </button>
            <button className="btn btn-outline" style={{ justifyContent: 'flex-start' }} onClick={() => setIsVitalsOpen(true)}>
              <Activity size={18} /> View Health Summary & Vitals
            </button>
          </div>
        </div>
      </div>

      <AddPatientModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onPatientAdded={() => {
          console.log("Patient added from Dashboard");
        }} 
      />

      <PatientVitalsModal 
        isOpen={isVitalsOpen} 
        onClose={() => setIsVitalsOpen(false)} 
        patientId={1} 
      />

      <PrescriptionModal 
        isOpen={isPrescriptionOpen} 
        onClose={() => setIsPrescriptionOpen(false)} 
      />

      <LabAlertsModal 
        isOpen={isLabAlertsOpen} 
        onClose={() => setIsLabAlertsOpen(false)} 
      />

      <RequestMedicineModal 
        isOpen={isMedicineOpen} 
        onClose={() => setIsMedicineOpen(false)} 
      />
    </div>
  );
}
