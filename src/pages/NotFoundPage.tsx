// src/pages/NotFoundPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '100px 20px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '3rem', color: '#2a4d8f' }}>404 - Page Not Found</h1>
      <p style={{ fontSize: '1.2rem', marginTop: '20px' }}>
        Oops! The page you're looking for doesn't exist.
      </p>
      <button
        onClick={() => navigate('/')}
        style={{
          marginTop: '40px',
          padding: '12px 24px',
          backgroundColor: '#2a4d8f',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
        }}
      >
        🔙 Go to Home
      </button>
    </div>
  );
}
