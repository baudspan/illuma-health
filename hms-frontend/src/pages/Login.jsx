import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Stethoscope, User, ShieldCheck, HeartPulse } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('Doctor');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Clear any existing session when the login page is visited
  React.useEffect(() => {
    localStorage.clear();
  }, []);

  const roles = [
    { id: 'Doctor', icon: <Stethoscope size={24} />, color: '#7c6bed' },
    { id: 'Nurse', icon: <HeartPulse size={24} />, color: '#ff4d6d' },
    { id: 'Patient', icon: <User size={24} />, color: '#00e0b8' },
    { id: 'Admin', icon: <ShieldCheck size={24} />, color: '#ffb142' },
  ];


  const handleEmailLogin = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);

      const response = await fetch('http://127.0.0.1:8000/api/auth/login', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Invalid email or password');
      }

      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('userRole', data.user?.role || selectedRole);
      localStorage.setItem('userName', data.user?.name || 'User');
      localStorage.setItem('userEmail', email);

      if (selectedRole === 'Patient') navigate('/patient');
      else if (selectedRole === 'Nurse') navigate('/nurse');
      else if (selectedRole === 'Admin') navigate('/admin');
      else navigate('/');
    } catch (error) {
      console.error('Login Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="split-layout">
      <div className="split-left" style={{ backgroundImage: "url('/illuma_bg.png')" }}>
        <div className="split-left-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{ background: 'white', padding: '16px', borderRadius: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
              <Activity color="var(--color-primary)" size={48} />
            </div>
            <h1 style={{ fontSize: '48px', color: 'white', letterSpacing: '-1px', margin: 0 }}>Illuma Health</h1>
          </div>
          <h2 style={{ fontSize: '32px', fontWeight: '500', opacity: 0.9, lineHeight: 1.3, color: 'white', margin: 0 }}>
            The Future of <br />Hospital Management
          </h2>
          <p style={{ marginTop: '24px', fontSize: '18px', opacity: 0.8, maxWidth: '400px' }}>
            Centralized records, intelligent workflows, and seamless coordination for every department.
          </p>
        </div>
      </div>

      <div className="split-right">
        <div className="login-glass-panel">
          <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Welcome back</h2>
          <p className="label" style={{ marginBottom: '32px' }}>Please select your role to continue.</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
            {roles.map(role => (
              <div
                key={role.id}
                className={`role-card ${selectedRole === role.id ? 'active' : ''}`}
                onClick={() => setSelectedRole(role.id)}
              >
                <div style={{ color: selectedRole === role.id ? 'white' : role.color }}>
                  {role.icon}
                </div>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>{role.id}</span>
              </div>
            ))}
          </div>

          {error && (
            <div style={{ background: 'rgba(255, 77, 109, 0.1)', color: '#ff4d6d', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center', border: '1px solid rgba(255, 77, 109, 0.2)' }}>
              {error}
            </div>
          )}

          <form style={{ textAlign: 'left' }} onSubmit={(e) => { e.preventDefault(); handleEmailLogin(); }}>

            <div style={{ marginBottom: '20px' }}>
              <label className="label">Email Address</label>
              <input
                type="email"
                className="input-field"
                placeholder={`name@${selectedRole.toLowerCase()}.illuma.com`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label className="label">Password</label>
                <a href="#" style={{ fontSize: '12px', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>Forgot?</a>
              </div>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', height: '54px', fontSize: '16px' }}
              disabled={loading}
            >
              {loading ? 'Logging in...' : `Log in as ${selectedRole}`}
              <Activity size={18} style={{ marginLeft: '8px' }} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

