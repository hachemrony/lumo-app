import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import LumoAvatar from '../components/LumoAvatar';

export default function AdminSignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [dotsBackground, setDotsBackground] = useState<any>(null);

  useEffect(() => {
    fetch('/lottie/dots-background.json')
      .then((res) => res.json())
      .then((data) => setDotsBackground(data));
  }, []);

  const inputStyle = {
    display: 'block',
    marginBottom: '16px',
    padding: '12px',
    width: '100%',
    borderRadius: '8px',
    border: '1.5px solid #2a4d8f',
    fontSize: '1rem',
  };

  const handleSignup = () => {
    if (!name.trim() || !password.trim() || !email.trim()) {
      alert('❌ Please fill in all fields.');
      return;
    }

    const newAdmin = { name, password, email };
    const existingAdmins = JSON.parse(localStorage.getItem('allAdmins') || '[]');
    existingAdmins.push(newAdmin);
    localStorage.setItem('allAdmins', JSON.stringify(existingAdmins));
    localStorage.setItem('userName', name);
    localStorage.setItem('userRole', 'admin');
    alert('✅ Admin account created successfully!');
    navigate('/upload');
  };

  return (
    <>
      {dotsBackground && (
        <Lottie
          animationData={dotsBackground}
          loop
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: -1,
            pointerEvents: 'none',
            opacity: 0.2,
          }}
        />
      )}

      {/* Home Button */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'white',
            border: '1px solid #ccc',
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '1rem',
            cursor: 'pointer',
            fontWeight: 400
          }}
        >
          Home
        </button>
      </div>

      <div style={{ padding: '40px', maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '20px', color: '#2a4d8f' }}>Admin / Teacher Sign Up</h2>

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
        />

        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="Create Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        <label style={{ display: 'block', marginBottom: '16px', fontSize: '0.9rem', textAlign: 'left' }}>
          <input
            type="checkbox"
            checked={showPassword}
            onChange={() => setShowPassword(!showPassword)}
            style={{ marginRight: '8px' }}
          />
          Show Password
        </label>

        <input
          type="email"
          placeholder="School/Business Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />
        <small style={{ color: '#555' }}>
          (Use school email if available. <br /> Personal email allowed temporarily.)
        </small>

        <button
          onClick={handleSignup}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            backgroundColor: isHovered ? '#2a4d8f' : 'transparent',
            color: isHovered ? 'white' : '#2a4d8f',
            padding: '12px',
            width: '100%',
            border: '2px solid #2a4d8f',
            borderRadius: '6px',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            marginTop: '24px'
          }}
        >
          Sign Up
        </button>
      </div>

      <footer style={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 2
      }}>
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <LumoAvatar />
          <img
            src={process.env.PUBLIC_URL + "/logo.png"}
            alt="Lumo Logo"
            style={{ height: '14px', opacity: 0.7, marginTop: '-10px' }}
          />
        </div>
      </footer>
    </>
  );
}
