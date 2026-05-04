import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import PatientLayout from './layouts/PatientLayout';
import PatientDashboardHome from './pages/PatientDashboardHome';
import NurseLayout from './layouts/NurseLayout';
import NurseDashboardHome from './pages/NurseDashboardHome';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboardHome from './pages/AdminDashboardHome';
import PatientsList from './pages/PatientsList';
import DoctorAppointments from './pages/DoctorAppointments';
import DoctorLab from './pages/DoctorLab';
import DoctorPharmacy from './pages/DoctorPharmacy';
import DoctorEmergency from './pages/DoctorEmergency';
import PatientAppointments from './pages/PatientAppointments';
import PatientRecords from './pages/PatientRecords';
import PatientLab from './pages/PatientLab';
import PatientDiet from './pages/PatientDiet';
import PatientBilling from './pages/PatientBilling';
import NurseVitals from './pages/NurseVitals';
import NurseMeds from './pages/NurseMeds';
import NurseDischarge from './pages/NurseDischarge';
import AdminStaff from './pages/AdminStaff';
import AdminDepartments from './pages/AdminDepartments';
import AdminFinance from './pages/AdminFinance';
import AdminInventory from './pages/AdminInventory';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="appointments" element={<DoctorAppointments />} />
          <Route path="patients" element={<PatientsList role="Doctor" />} />
          <Route path="lab" element={<DoctorLab />} />
          <Route path="pharmacy" element={<DoctorPharmacy />} />
          <Route path="emergency" element={<DoctorEmergency />} />
        </Route>

        <Route path="/patient" element={<PatientLayout />}>
          <Route index element={<PatientDashboardHome />} />
          <Route path="appointments" element={<PatientAppointments />} />
          <Route path="records" element={<PatientRecords />} />
          <Route path="reports" element={<PatientLab />} />
          <Route path="diet" element={<PatientDiet />} />
          <Route path="billing" element={<PatientBilling />} />
        </Route>
        
        <Route path="/nurse" element={<NurseLayout />}>
          <Route index element={<NurseDashboardHome />} />
          <Route path="patients" element={<PatientsList role="Nurse" />} />
          <Route path="vitals" element={<NurseVitals />} />
          <Route path="meds" element={<NurseMeds />} />
          <Route path="discharge" element={<NurseDischarge />} />
        </Route>
        
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardHome />} />
          <Route path="staff" element={<AdminStaff />} />
          <Route path="departments" element={<AdminDepartments />} />
          <Route path="finance" element={<AdminFinance />} />
          <Route path="inventory" element={<AdminInventory />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
