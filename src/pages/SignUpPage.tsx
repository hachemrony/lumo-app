import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import LumoAvatar from '../components/LumoAvatar';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const inputStyle = {
    display: 'block',
    marginBottom: '16px',
    padding: '12px',
    width: '100%',
    borderRadius: '8px',
    border: '1.5px solid #2a4d8f',
    fontSize: '1rem',
  };
  const [dotsBackground, setDotsBackground] = useState<any>(null);

  useEffect(() => {
   fetch('/lottie/dots-background.json')
    .then((res) => res.json())
    .then((data) => setDotsBackground(data));
  }, []);
  

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
        <h2 style={{ fontSize: '2rem', marginBottom: '20px', color: '#2a4d8f' }}>Sign Up</h2>
  
        <input
          type="text"
          placeholder="Your Name"
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
          placeholder="Email (optional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />
  
        <button
         onClick={handleSignUp}
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
         Create Account
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
