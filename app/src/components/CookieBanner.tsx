import { useEffect, useState } from 'react';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const key = 'quorin:cookies';

  useEffect(() => {
    try {
      const v = localStorage.getItem(key);
      if (!v) setVisible(true);
    } catch (e) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    try { localStorage.setItem(key, 'accepted'); } catch (e) {}
    setVisible(false);
    // optionally dispatch event for analytics init
    window.dispatchEvent(new CustomEvent('quorin:cookies', { detail: { accepted: true } }));
  };

  const decline = () => {
    try { localStorage.setItem(key, 'declined'); } catch (e) {}
    setVisible(false);
    window.dispatchEvent(new CustomEvent('quorin:cookies', { detail: { accepted: false } }));
  };

  if (!visible) return null;

  return (
    <div style={{ position: 'fixed', left: 16, right: 16, bottom: 20, zIndex: 80 }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', background: 'linear-gradient(180deg, rgba(8,8,13,0.95), rgba(8,8,13,0.95))', padding: 16, borderRadius: 12, display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ color: 'var(--color-text-primary)' }}>
          <div style={{ fontWeight: 700 }}>Cookies on QUORIN</div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>We use cookies to improve your experience. Accept to enable full features or decline to continue with limited functionality.</div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={decline} style={{ padding: '10px 14px', borderRadius: 999, background: 'transparent', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--color-text-primary)' }}>Decline</button>
          <button onClick={accept} style={{ padding: '10px 16px', borderRadius: 999, background: 'linear-gradient(135deg,#ff1a3c,#ff0044)', color: 'white' }}>Accept</button>
        </div>
      </div>
    </div>
  );
}