import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import LumoAvatar from '../components/LumoAvatar';

export default function LoginPage() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [dotsBackground, setDotsBackground] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/lottie/dots-background.json')
      .then(res => res.json())
      .then(data => setDotsBackground(data));
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

  const handleLogin = () => {
    if (!name.trim() || !password.trim()) {
      alert('❌ Please enter both name and password.');
      return;
    }

    const allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
    const allAdmins = JSON.parse(localStorage.getItem('allAdmins') || '[]');

    const foundUser = allUsers.find((user: any) => user.name === name && user.password === password);
    const foundAdmin = allAdmins.find((admin: any) => admin.name === name && admin.password === password);

    if (foundAdmin) {
      localStorage.setItem('userName', foundAdmin.name);
      localStorage.setItem('userRole', 'admin');
      alert('✅ Welcome Admin!');
      navigate('/');
    } else if (foundUser) {
      localStorage.setItem('userName', foundUser.name);
      localStorage.setItem('userRole', 'student');
      alert('✅ Welcome Student!');
      navigate('/');
    } else {
      alert('❌ Invalid username or password.');
    }
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
      <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10 }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'white',
            border: '1px solid #ccc',
            borderRadius: '6px',
            padding: '5px 10px',
            fontSize: '0.9rem',
            cursor: 'pointer',
            fontWeight: 400
          }}
        >
          Home
        </button>
      </div>

      <div style={{ padding: '40px', maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '20px', color: '#2a4d8f' }}>Log In</h2>

        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
        />

        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="Your Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        <label style={{ display: 'block', marginBottom: '24px', fontSize: '0.9rem', textAlign: 'left' }}>
          <input
            type="checkbox"
            checked={showPassword}
            onChange={() => setShowPassword(!showPassword)}
            style={{ marginRight: '8px' }}
          />
          Show Password
        </label>

        <button
          onClick={handleLogin}
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
            transition: 'all 0.3s ease'
          }}
        >
          Log In
        </button>
      </div>

      {/* Lumo Footer */}
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
