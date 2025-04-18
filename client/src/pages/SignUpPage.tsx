import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);


  const handleSignUp = () => {
    if (!name || !password) {
      alert('Please fill in your name and password.');
      return;
    }
  
    const newUser = { name, password, email };
  
    // 1. Get existing users or start fresh
    const existingUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
  
    // 2. Check if username already exists
    const duplicate = existingUsers.find((user: any) => user.name === name);
    if (duplicate) {
      alert('This username already exists. Please choose another one.');
      return;
    }
  
    // 3. Save updated users list
    existingUsers.push(newUser);
    localStorage.setItem('allUsers', JSON.stringify(existingUsers));
  
    // 4. Save current user as logged in
    localStorage.setItem('userData', JSON.stringify(newUser));
    localStorage.setItem('userName', name);
  
    alert('✅ Account created!');
    navigate('/');
  };  
  
  

  return (
    <div style={{ padding: '40px', maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '20px' }}>Sign Up</h2>
      <input
        type="text"
        placeholder="Your Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ display: 'block', marginBottom: '16px', padding: '12px', width: '100%' }}
      />
      <input
        type={showPassword ? 'text' : 'password'}
        placeholder="Create Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: 'block', marginBottom: '8px', padding: '12px', width: '100%' }}
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
        placeholder="Email (optional)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: 'block', marginBottom: '24px', padding: '12px', width: '100%' }}
      />
      <button
        onClick={handleSignUp}
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
        Create Account
      </button>
    </div>
  );
}
