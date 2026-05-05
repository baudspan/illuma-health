import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import WardManagement from './pages/WardManagement';
import './index.css';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redirect to their own dashboard if they try to access another role's page
    const dashboardMap = {
      'Admin': '/admin',
      'Doctor': '/',
      'Nurse': '/nurse',
      'Patient': '/patient'
    };
    return <Navigate to={dashboardMap[userRole] || '/login'} replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Doctor / Staff Routes */}
        <Route path="/" element={<ProtectedRoute allowedRoles={['Doctor']}><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<DashboardHome />} />
          <Route path="appointments" element={<DoctorAppointments />} />
          <Route path="patients" element={<PatientsList role="Doctor" />} />
          <Route path="lab" element={<DoctorLab />} />
          <Route path="pharmacy" element={<DoctorPharmacy />} />
          <Route path="emergency" element={<DoctorEmergency />} />
          <Route path="wards" element={<WardManagement />} />
        </Route>

        {/* Patient Routes */}
        <Route path="/patient" element={<ProtectedRoute allowedRoles={['Patient']}><PatientLayout /></ProtectedRoute>}>
          <Route index element={<PatientDashboardHome />} />
          <Route path="appointments" element={<PatientAppointments />} />
          <Route path="records" element={<PatientRecords />} />
          <Route path="reports" element={<PatientLab />} />
          <Route path="diet" element={<PatientDiet />} />
          <Route path="billing" element={<PatientBilling />} />
        </Route>
        
        {/* Nurse Routes */}
        <Route path="/nurse" element={<ProtectedRoute allowedRoles={['Nurse']}><NurseLayout /></ProtectedRoute>}>
          <Route index element={<NurseDashboardHome />} />
          <Route path="patients" element={<PatientsList role="Nurse" />} />
          <Route path="vitals" element={<NurseVitals />} />
          <Route path="meds" element={<NurseMeds />} />
          <Route path="discharge" element={<NurseDischarge />} />
        </Route>
        
        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['Admin']}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboardHome />} />
          <Route path="staff" element={<AdminStaff />} />
          <Route path="departments" element={<AdminDepartments />} />
          <Route path="finance" element={<AdminFinance />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="wards" element={<WardManagement />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
