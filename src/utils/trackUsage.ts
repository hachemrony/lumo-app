// utils/trackUsage.ts

export const trackUsage = (action: 'summarize' | 'ask' | 'practice' | 'image', username: string) => {
    const key = `usage-${username}`;
    const existing = JSON.parse(localStorage.getItem(key) || '{}');
  
    const today = new Date().toISOString().slice(0, 10); // e.g., "2025-05-21"
    if (!existing[today]) {
      existing[today] = {};
    }
  
    existing[today][action] = (existing[today][action] || 0) + 1;
  
    localStorage.setItem(key, JSON.stringify(existing));
  };
  