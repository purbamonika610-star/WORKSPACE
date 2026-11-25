import { useState } from 'react';

// Front-door lock for "My Projects" and each project page.
// Only a SHA-256 hash of the PIN is stored here. This keeps casual visitors out;
// it is not strong protection (the app and its seed data are public).
const PIN_HASH = 'a055f39a6cef397d3e53631e90dd588f752ea68e87f88ad19b8a425301351306';
const KEY = 'mw-unlock';

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export default function Lock({ children }) {
  const [open, setOpen] = useState(() => {
    try { return sessionStorage.getItem(KEY) === '1'; } catch { return false; }
  });
  const [pin, setPin] = useState('');
  const [wrong, setWrong] = useState(false);

  if (open) return children;

  const submit = async (e) => {
    e.preventDefault();
    if ((await sha256(pin)) === PIN_HASH) {
      try { sessionStorage.setItem(KEY, '1'); } catch { /* private mode */ }
      setOpen(true);
    } else {
      setWrong(true);
      setPin('');
    }
  };

  return (
    <div className="page">
      <form onSubmit={submit} style={{ maxWidth: 380, margin: '72px auto', textAlign: 'center', display: 'grid', gap: 14 }}>
        <h1>Project dikunci</h1>
        <p style={{ opacity: 0.7 }}>Masukkan PIN untuk melihat project. / Enter the PIN to view projects.</p>
        <input
          type="password"
          inputMode="numeric"
          autoComplete="off"
          autoFocus
          value={pin}
          placeholder="PIN"
          onChange={(e) => { setPin(e.target.value); setWrong(false); }}
          style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #bbb', font: 'inherit' }}
        />
        {wrong && <p style={{ color: '#c0392b', margin: 0 }}>PIN salah. / Wrong PIN.</p>}
        <button type="submit" style={{ padding: '12px 14px', borderRadius: 12, border: 0, background: '#17161B', color: '#fff', font: 'inherit', fontWeight: 700, cursor: 'pointer' }}>
          Buka / Unlock
        </button>
      </form>
    </div>
  );
}
