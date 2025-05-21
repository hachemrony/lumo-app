import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import LumoAvatar from '../components/LumoAvatar';
import translations from '../i18n/translations';


export default function AdminHubPage() {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState<string | null>(null);
  const [dotsBackground, setDotsBackground] = useState<any>(null);
  const [selectedLanguage] = useState<'en' | 'fr'>(
    (localStorage.getItem('selectedLanguage') as 'en' | 'fr') || 'en'
  );
  
  

  useEffect(() => {
    fetch('/lottie/dots-background.json')
      .then((res) => res.json())
      .then((data) => setDotsBackground(data));
  }, []);

  const buttonStyle = (id: string) => ({
    backgroundColor: isHovered === id ? '#2a4d8f' : 'transparent',
    color: isHovered === id ? 'white' : '#2a4d8f',
    padding: '12px',
    width: '100%',
    border: '2px solid #2a4d8f',
    borderRadius: '6px',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  });

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

      {/* Home Button Top Right */}
      <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10 }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'white',
            border: '1px solid #ccc',
            borderRadius: '6px',
            padding: '5px 10px',
            fontSize: '0.9rem',
            cursor: 'pointer',
            fontWeight: 400,
          }}
        >
          Home
        </button>
        
      </div>

      {/* Centered Content */}
      <div style={{ padding: '40px', maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '30px', color: '#2a4d8f' }}>
  {translations.adminHubTitle[selectedLanguage]}
</h2>

<button
  onClick={() => navigate('/upload')}
  onMouseEnter={() => setIsHovered('upload')}
  onMouseLeave={() => setIsHovered(null)}
  style={buttonStyle('upload')}
>
  {translations.uploadLessons[selectedLanguage]}
</button>

<button
  onClick={() => navigate('/manage')}
  onMouseEnter={() => setIsHovered('manage')}
  onMouseLeave={() => setIsHovered(null)}
  style={{ ...buttonStyle('manage'), marginTop: '16px' }}
>
  {translations.manageLessons[selectedLanguage]}
</button>

<button
  onClick={() => navigate('/admin-dashboard')}
  onMouseEnter={() => setIsHovered('track')}
  onMouseLeave={() => setIsHovered(null)}
  style={{ ...buttonStyle('track'), marginTop: '16px' }}
>
  {translations.trackUsage[selectedLanguage]}
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
