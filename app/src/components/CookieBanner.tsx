import { quorinData } from '@/data/products';
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
      <div style={{ maxWidth: 1000, margin: '0 auto', background: 'var(--color-surface)', padding: 24, borderRadius: 16, display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--color-border-subtle)', boxShadow: 'var(--color-shadow-md)' }}>
        <div style={{ color: 'var(--color-text-primary)' }}>
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>Cookies on {quorinData.brand}</div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>We use cookies to enhance your experience. Accept to enable all features or decline for limited functionality.</div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={decline} style={{ padding: '10px 16px', borderRadius: 999, background: 'transparent', border: '1px solid var(--color-border-subtle)', color: 'var(--color-text-primary)', fontSize: 13, cursor: 'pointer' }}>Decline</button>
          <button onClick={accept} style={{ padding: '10px 16px', borderRadius: 999, background: 'var(--color-accent)', color: 'white', fontSize: 13, cursor: 'pointer' }}>Accept</button>
        </div>
      </div>
    </div>
  );
}
