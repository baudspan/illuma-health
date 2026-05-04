import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Stethoscope, User, ShieldCheck, HeartPulse } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

export default function Login() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('Doctor');
  const [loading, setLoading] = useState(false);

  const roles = [
    { id: 'Doctor', icon: <Stethoscope size={24} />, color: '#7c6bed' },
    { id: 'Nurse', icon: <HeartPulse size={24} />, color: '#ff4d6d' },
    { id: 'Patient', icon: <User size={24} />, color: '#00e0b8' },
    { id: 'Admin', icon: <ShieldCheck size={24} />, color: '#ffb142' },
  ];

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Store in localStorage
      localStorage.setItem('userRole', selectedRole);
      localStorage.setItem('userName', user.displayName);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userPhoto', user.photoURL);
      localStorage.setItem('firebaseUid', user.uid);

      // Store in MySQL via API
      try {
        await fetch('http://localhost:8000/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            role: selectedRole
          })
        });
      } catch (apiErr) {
        console.warn('Could not save to DB, continuing with local auth:', apiErr);
      }

      // Navigate based on role
      if (selectedRole === 'Patient') navigate('/patient');
      else if (selectedRole === 'Nurse') navigate('/nurse');
      else if (selectedRole === 'Admin') navigate('/admin');
      else navigate('/');
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      alert('Google Sign-In failed. Using role-based login instead.');
      // Fallback: role-based login without Google
      localStorage.setItem('userRole', selectedRole);
      if (selectedRole === 'Patient') navigate('/patient');
      else if (selectedRole === 'Nurse') navigate('/nurse');
      else if (selectedRole === 'Admin') navigate('/admin');
      else navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = () => {
    localStorage.setItem('userRole', selectedRole);
    if (selectedRole === 'Patient') navigate('/patient');
    else if (selectedRole === 'Nurse') navigate('/nurse');
    else if (selectedRole === 'Admin') navigate('/admin');
    else navigate('/');
  };

  return (
    <div className="split-layout">
      {/* Left Side Background */}
      <div className="split-left" style={{ backgroundImage: "url('/illuma_bg.png')" }}>
        <div className="split-left-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{ background: 'white', padding: '16px', borderRadius: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
              <Activity color="var(--color-primary)" size={48} />
            </div>
            <h1 style={{ fontSize: '48px', color: 'white', letterSpacing: '-1px', margin: 0 }}>Illuma Health</h1>
          </div>
          <h2 style={{ fontSize: '32px', fontWeight: '500', opacity: 0.9, lineHeight: 1.3, color: 'white', margin: 0 }}>
            The Future of <br/>Hospital Management
          </h2>
          <p style={{ marginTop: '24px', fontSize: '18px', opacity: 0.8, maxWidth: '400px' }}>
            Centralized records, intelligent workflows, and seamless coordination for every department.
          </p>
        </div>
      </div>

      {/* Right Side Login Form */}
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

          <form style={{ textAlign: 'left' }}>
            <button 
              type="button" 
              className="btn btn-outline" 
              style={{ width: '100%', marginBottom: '24px', fontSize: '15px' }}
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" style={{ width: 18, height: 18 }} />
              {loading ? 'Signing in...' : 'Sign in with Google'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', margin: '16px 0 24px', color: 'var(--color-border)' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }}></div>
              <span style={{ padding: '0 16px', fontSize: '14px', color: 'var(--color-text-muted)' }}>or with email</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }}></div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label className="label">Email Address</label>
              <input type="email" className="input-field" placeholder={`name@${selectedRole.toLowerCase()}.illuma.com`} />
            </div>
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label className="label">Password</label>
                <a href="#" style={{ fontSize: '12px', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>Forgot?</a>
              </div>
              <input type="password" className="input-field" placeholder="••••••••" />
            </div>
            
            <button 
              type="button" 
              className="btn btn-primary" 
              style={{ width: '100%', height: '54px', fontSize: '16px' }}
              onClick={handleEmailLogin}
            >
              Log in as {selectedRole}
              <Activity size={18} style={{ marginLeft: '8px' }}/>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
