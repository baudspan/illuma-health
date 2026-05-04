import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home,
  Users,
  ActivitySquare,
  Pill,
  ClipboardList,
  LogOut,
  Bell,
  HeartPulse
} from 'lucide-react';

export default function NurseLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Ward Dashboard', icon: <Home size={20} />, path: '/nurse' },
    { name: 'Admitted Patients', icon: <Users size={20} />, path: '/nurse/patients' },
    { name: 'Vitals Entry', icon: <ActivitySquare size={20} />, path: '/nurse/vitals' },
    { name: 'Medications', icon: <Pill size={20} />, path: '/nurse/meds' },
    { name: 'Discharge Queue', icon: <ClipboardList size={20} />, path: '/nurse/discharge' },
  ];

  return (
    <div className="dashboard-wrapper">
      <aside className="sidebar">
        <div className="sidebar-header">
          <HeartPulse color="var(--color-primary)" size={28} />
          <h2>Illuma Nurse</h2>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/nurse' && location.pathname.startsWith(item.path));
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
            <h3 style={{ margin: 0, color: 'var(--color-text-main)' }}>Nursing Station</h3>
          </div>
          <div className="header-actions">
            <button className="icon-btn">
              <Bell size={20} />
              <span className="notification-dot"></span>
            </button>
            <div className="user-profile">
              <div className="avatar" style={{ backgroundColor: 'var(--color-error)' }}>SN</div>
              <div className="user-info">
                <span className="user-name">Nurse Sunita</span>
                <span className="user-role">Head Nurse - General Ward</span>
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
