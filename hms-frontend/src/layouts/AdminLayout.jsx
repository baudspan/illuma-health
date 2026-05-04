import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home,
  Building,
  Users,
  CreditCard,
  Archive,
  LogOut,
  Bell,
  ShieldCheck
} from 'lucide-react';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Hospital Overview', icon: <Home size={20} />, path: '/admin' },
    { name: 'Staff Directory', icon: <Users size={20} />, path: '/admin/staff' },
    { name: 'Departments', icon: <Building size={20} />, path: '/admin/departments' },
    { name: 'Financials', icon: <CreditCard size={20} />, path: '/admin/finance' },
    { name: 'Inventory', icon: <Archive size={20} />, path: '/admin/inventory' },
  ];

  return (
    <div className="dashboard-wrapper">
      <aside className="sidebar">
        <div className="sidebar-header">
          <ShieldCheck color="var(--color-primary)" size={28} />
          <h2>Illuma Admin</h2>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
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
            <h3 style={{ margin: 0, color: 'var(--color-text-main)' }}>Administrator Console</h3>
          </div>
          <div className="header-actions">
            <button className="icon-btn">
              <Bell size={20} />
            </button>
            <div className="user-profile">
              <div className="avatar" style={{ backgroundColor: 'var(--color-warning)' }}>AD</div>
              <div className="user-info">
                <span className="user-name">System Admin</span>
                <span className="user-role">Management</span>
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
