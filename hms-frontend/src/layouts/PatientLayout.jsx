import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home,
  Calendar, 
  FileText, 
  Utensils, 
  CreditCard,
  LogOut,
  Bell,
  HeartPulse,
  Activity
} from 'lucide-react';

export default function PatientLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'My Dashboard', icon: <Home size={20} />, path: '/patient' },
    { name: 'Clinical Records', icon: <Activity size={20} />, path: '/patient/records' },
    { name: 'Appointments', icon: <Calendar size={20} />, path: '/patient/appointments' },
    { name: 'Lab Reports', icon: <FileText size={20} />, path: '/patient/reports' },
    { name: 'Diet & Meals', icon: <Utensils size={20} />, path: '/patient/diet' },
    { name: 'Billing', icon: <CreditCard size={20} />, path: '/patient/billing' },
  ];

  return (
    <div className="dashboard-wrapper">
      <aside className="sidebar">
        <div className="sidebar-header">
          <HeartPulse color="var(--color-primary)" size={28} />
          <h2>Illuma Patient</h2>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/patient' && location.pathname.startsWith(item.path));
            return (
              <Link 
                to={item.path} 
                key={item.name} 
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button 
            className="btn btn-outline" 
            style={{ width: '100%', borderColor: 'var(--color-error)', color: 'var(--color-error)' }}
            onClick={() => {
              localStorage.removeItem('userRole');
              navigate('/login');
            }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      <div className="main-content">
        <header className="top-header">
          <div className="header-search">
            <h3 style={{ margin: 0, color: 'var(--color-text-main)' }}>Patient Portal</h3>
          </div>
          <div className="header-actions">
            <button className="icon-btn">
              <Bell size={20} />
            </button>
            <div className="user-profile">
              <div className="avatar" style={{ backgroundColor: 'var(--color-success)' }}>SM</div>
              <div className="user-info">
                <span className="user-name">Suresh Mishra</span>
                <span className="user-role">UHID: ILL-8892</span>
              </div>
            </div>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
