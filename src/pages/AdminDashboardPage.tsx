import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import translations from '../i18n/translations';


export default function AdminDashboardPage() {
  const [usageData, setUsageData] = useState<any>({});
  const navigate = useNavigate();
  const [selectedLanguage] = useState<'en' | 'fr'>(
    (localStorage.getItem('selectedLanguage') as 'en' | 'fr') || 'en'
  );
  

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('allUsers') || '[]');
    const allUsage: any = {};

    users.forEach((user: any) => {
      const key = `usage-${user.name}`;
      const data = JSON.parse(localStorage.getItem(key) || '{}');
      allUsage[user.name] = data;
    });

    setUsageData(allUsage);
  }, []);

  const getCost = (actions: any) => {
    let cost = 0;
    for (const day in actions) {
      const a = actions[day];
      cost += (a.summarize || 0) * 0.03;
      cost += (a.practice || 0) * 0.0015;
      cost += (a.ask || 0) * 0.001;
      cost += (a.image || 0) * 0.04;
    }
    return `$${cost.toFixed(2)}`;
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Home Button Top Left */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10, display: 'flex', gap: '12px'}}>
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
        <button
         onClick={() => navigate('/admin-hub')}
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
         Dashboard
        </button>
      </div>

      <h2 style={{ fontSize: '2rem', fontWeight: 'normal', marginBottom: '30px', color: '#2a4d8f', textAlign: 'center' }}>
         {translations.apiUsageTrackerTitle[selectedLanguage]}
      </h2>

      {Object.entries(usageData).map(([user, actions]: any) => (
        <div key={user} style={{
          marginBottom: '24px',
          border: '1px solid #ccc',
          borderRadius: '8px',
          padding: '20px',
          backgroundColor: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '500', marginBottom: '8px' }}>{user}</h3>
          <p style={{ fontSize: '0.95rem', color: '#555' }}>
           {translations.estimatedCost[selectedLanguage]}: <strong>{getCost(actions)}</strong>
          </p>
          <pre style={{
            marginTop: '10px',
            backgroundColor: '#f9f9f9',
            padding: '12px',
            borderRadius: '6px',
            overflowX: 'auto',
            fontSize: '0.85rem'
          }}>
            {JSON.stringify(actions, null, 2)}
          </pre>
        </div>
      ))}
    </div>
  );
}
