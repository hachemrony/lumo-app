import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);


  const handleLogin = () => {
    const users = JSON.parse(localStorage.getItem('allUsers') || '[]');
  
    const matchedUser = users.find((user: any) => user.name === name && user.password === password);
  
    if (!matchedUser) {
      alert('Invalid username or password');
      return;
    }
  
    // Save logged-in user
    localStorage.setItem('userData', JSON.stringify(matchedUser));
    localStorage.setItem('userName', matchedUser.name);
    navigate('/');
  };
  
  

  return (
    <div style={{ padding: '40px', maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '20px' }}>Log In</h2>
      <input
        type="text"
        placeholder="Your Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ display: 'block', marginBottom: '16px', padding: '12px', width: '100%' }}
      />
      <input
        type={showPassword ? 'text' : 'password'}
        placeholder="Your Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: 'block', marginBottom: '8px', padding: '12px', width: '100%' }}
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
        style={{
          backgroundColor: '#2a4d8f',
          color: 'white',
          padding: '12px 24px',
          border: 'none',
          borderRadius: '6px',
          fontSize: '1rem',
          cursor: 'pointer'
        }}
      >
        Log In
      </button>
    </div>
  );
}
