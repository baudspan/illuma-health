import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Activity, 
  Pill, 
  FlaskConical, 
  LogOut,
  Bell
} from 'lucide-react';

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'Appointments', icon: <Calendar size={20} />, path: '/appointments' },
    { name: 'Patients (IPD/OPD)', icon: <Users size={20} />, path: '/patients' },
    { name: 'Lab & Diagnostics', icon: <FlaskConical size={20} />, path: '/lab' },
    { name: 'Pharmacy', icon: <Pill size={20} />, path: '/pharmacy' },
    { name: 'Emergency', icon: <Activity size={20} />, path: '/emergency' },
  ];

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Activity color="var(--color-primary)" size={28} />
          <h2>Illuma Health</h2>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
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

      {/* Main Content Area */}
      <div className="main-content">
        {/* Top Header */}
        <header className="top-header">
          <div className="header-search">
            <input type="text" className="search-input" placeholder="Search patients, doctors, or reports..." />
          </div>
          <div className="header-actions">
            <button className="icon-btn">
              <Bell size={20} />
              <span className="notification-dot"></span>
            </button>
            <div className="user-profile">
              <div className="avatar">RS</div>
              <div className="user-info">
                <span className="user-name">Dr. Ramesh Sharma</span>
                <span className="user-role">Cardiologist</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
