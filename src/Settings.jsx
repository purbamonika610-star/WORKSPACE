import { useRef, useState } from 'react';
import { Download, Upload, RotateCcw, CalendarCheck, Sparkles, Globe, Megaphone, Bell, Smartphone, Copy, Link2 } from 'lucide-react';
import { initialState, useStore } from './store.jsx';
import { DEFAULT_STRATEGIES } from './seed.js';

const DAYS = { en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], id: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'] };

function CloudCard({ cloud, lang }) {
  const en = lang === 'en';
  const [code, setCode] = useState('');
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState('');
  const copy = async (txt, what) => { try { await navigator.clipboard.writeText(txt); setCopied(what); setTimeout(() => setCopied(''), 1800); } catch { /* */ } };
  const c = cloud.cfg;
  const link = c ? `${window.location.origin}${window.location.pathname}#sync=${c.code}` : '';
  const when = cloud.info?.at ? new Date(cloud.info.at).toLocaleString(en ? 'en-GB' : 'id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
  return (
    <section className="card">
      <h2><Smartphone size={17} /> {en ? 'Sync across devices' : 'Sinkron antar device'}</h2>
      {!c ? (
        <>
          <p className="muted small">{en
            ? 'Turn this on and every change is saved to the cloud automatically, so your laptop, phone and other devices always show the same workspace.'
            : 'Aktifkan ini, maka setiap perubahan otomatis tersimpan ke cloud. Laptop, HP, dan device lain akan selalu menampilkan workspace yang sama.'}</p>
          <button className="btn black" onClick={cloud.enable}><Smartphone size={15} /> {en ? 'Turn on sync (use this device’s data)' : 'Aktifkan sinkron (pakai data device ini)'}</button>
          <label className="lbl" style={{ marginTop: 16 }}>{en ? 'Already turned on elsewhere? Paste your sync code' : 'Sudah aktif di device lain? Tempel kode sinkronmu'}</label>
          <div className="row-gap">
            <input className="grow" value={code} onChange={(e) => setCode(e.target.value)} placeholder="mw-xxxxxx-xxxxxx-…" />
            <button className="btn" onClick={async () => { if (window.confirm(en ? 'The data on this device will be replaced by your cloud workspace. Continue?' : 'Data di device ini akan diganti dengan workspace dari cloud. Lanjut?')) { if (await cloud.join(code)) setCode(''); } }}>{en ? 'Connect' : 'Sambungkan'}</button>
          </div>
        </>
      ) : (
        <>
          <p className="small" style={{ margin: '0 0 6px' }}><b>{cloud.status === 'error' ? (en ? '⚠️ Could not reach the cloud. Your changes are kept and will upload when you are back online.' : '⚠️ Tidak bisa terhubung ke cloud. Perubahanmu aman dan akan diupload saat online lagi.') : (en ? '✓ Sync is on. Changes upload automatically.' : '✓ Sinkron aktif. Perubahan otomatis terupload.')}</b></p>
          {when && <p className="muted tiny" style={{ margin: '0 0 10px' }}>{en ? 'Last saved' : 'Terakhir tersimpan'}: {when}{cloud.info?.device && cloud.info.device !== 'this' ? ` · ${cloud.info.device}` : ''}</p>}
          <label className="lbl">{en ? 'Open on another device' : 'Buka di device lain'}</label>
          <p className="muted small" style={{ marginTop: 0 }}>{en ? 'Send this link to yourself (e.g. WhatsApp to yourself) and open it on the other device. Keep it private: it works like a password.' : 'Kirim link ini ke dirimu sendiri (misalnya WhatsApp ke nomor sendiri), lalu buka di device lain. Jangan dibagikan ke orang lain, karena fungsinya seperti password.'}</p>
          <div className="row-gap" style={{ flexWrap: 'wrap' }}>
            <button className="btn black" onClick={() => copy(link, 'link')}><Link2 size={15} /> {copied === 'link' ? (en ? 'Copied!' : 'Tersalin!') : (en ? 'Copy device link' : 'Salin link device')}</button>
            <button className="btn" onClick={() => copy(c.code, 'code')}><Copy size={15} /> {copied === 'code' ? (en ? 'Copied!' : 'Tersalin!') : (en ? 'Copy code' : 'Salin kode')}</button>
            <button className="btn ghost" onClick={() => setShow(!show)}>{show ? (en ? 'Hide code' : 'Sembunyikan') : (en ? 'Show code' : 'Lihat kode')}</button>
          </div>
          {show && <p className="small" style={{ fontFamily: 'monospace', wordBreak: 'break-all', background: '#F6F7FA', padding: 10, borderRadius: 10 }}>{c.code}</p>}
          <p className="muted tiny">{en ? 'Your Anthropic API key and uploaded Canva images stay on each device and are not uploaded.' : 'API key Anthropic dan gambar Canva yang kamu upload tetap di masing-masing device dan tidak ikut diupload.'}</p>
          <div className="row-gap">
            <button className="btn" onClick={cloud.syncNow}>{en ? 'Sync now' : 'Sinkron sekarang'}</button>
            <button className="btn ghost danger" onClick={() => window.confirm(en ? 'Stop syncing on this device? Your data stays here and in the cloud.' : 'Hentikan sinkron di device ini? Datamu tetap ada di sini dan di cloud.') && cloud.disconnect()}>{en ? 'Stop syncing on this device' : 'Hentikan sinkron di device ini'}</button>
          </div>
        </>
      )}
      {cloud.error && <p className="small" style={{ color: '#C2397F' }}>{cloud.error}</p>}
    </section>
  );
}

export default function Settings({ google, cloud }) {
  const { state, api, t, lang } = useStore();
  const s = state.settings;
  const [brand, setBrand] = useState('elevara');
  const fileRef = useRef();
  const origin = window.location.origin;

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ ...state, settings: { ...s, anthropicKey: '' } }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `monika-workspace-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };
  const importData = async (f) => {
    try {
      const data = JSON.parse(await f.text());
      if (!data.projects) throw new Error('bad file');
      api.setState({ ...initialState(), ...data, settings: { ...initialState().settings, ...data.settings, anthropicKey: s.anthropicKey } });
    } catch { alert('Backup file not valid'); }
  };

  return (
    <div className="page settings">
      <header className="page-head"><h1>{t('settings')}</h1></header>

      <section className="card">
        <h2><Globe size={17} /> {t('language')}</h2>
        <div className="seg">
          <button className={lang === 'id' ? 'on' : ''} onClick={() => api.setLang('id')}>🇮🇩 Bahasa Indonesia</button>
          <button className={lang === 'en' ? 'on' : ''} onClick={() => api.setLang('en')}>🇬🇧 English</button>
        </div>
      </section>

      {cloud && <CloudCard cloud={cloud} lang={lang} />}

      <section className="card">
        <h2><CalendarCheck size={17} /> {t('googleSection')}</h2>
        <label className="lbl">{t('clientId')}</label>
        <input value={s.googleClientId} onChange={(e) => api.setSettings({ googleClientId: e.target.value.trim() })} placeholder="1234567890-abc.apps.googleusercontent.com" />
        <div className="row-gap" style={{ marginTop: 10 }}>
          {google.connected
            ? <><span className="ok-chip">● {t('connected')}</span><button className="btn" onClick={google.sync} disabled={google.syncing}>{google.syncing ? t('syncing') : t('syncNow')}</button><button className="btn ghost" onClick={google.disconnect}>{t('disconnect')}</button></>
            : <button className="btn primary" onClick={google.connect} disabled={!s.googleClientId}>{t('connectGoogle')}</button>}
          {s.lastSync > 0 && <span className="muted small">{t('lastSync')}: {new Date(s.lastSync).toLocaleString()}</span>}
        </div>
        {google.error && <div className="alert">{google.error}</div>}
        <details className="howto">
          <summary>{lang === 'en' ? 'How to get a Client ID (one time, free, ~5 minutes)' : 'Cara dapat Client ID (sekali saja, gratis, ±5 menit)'}</summary>
          <ol>
            <li>{lang === 'en' ? 'Open' : 'Buka'} <a href="https://console.cloud.google.com/projectcreate" target="_blank" rel="noreferrer">console.cloud.google.com</a> {lang === 'en' ? 'and create a project named "Monika Workspace".' : 'lalu buat project bernama "Monika Workspace".'}</li>
            <li>{lang === 'en' ? 'Enable' : 'Aktifkan'} <a href="https://console.cloud.google.com/apis/library/calendar-json.googleapis.com" target="_blank" rel="noreferrer">Google Calendar API</a>.</li>
            <li>{lang === 'en' ? 'Go to "Google Auth Platform" → Branding, fill the app name and your email. Under Audience choose External and add your Gmail as a Test user.' : 'Masuk ke "Google Auth Platform" → Branding, isi nama app dan email kamu. Di Audience pilih External dan tambahkan Gmail kamu sebagai Test user.'}</li>
            <li>{lang === 'en' ? 'Clients → Create client → Web application. Under "Authorized JavaScript origins" add:' : 'Clients → Create client → Web application. Di "Authorized JavaScript origins" tambahkan:'} <code>{origin}</code></li>
            <li>{lang === 'en' ? 'Copy the Client ID, paste it above, then click Connect.' : 'Salin Client ID, tempel di atas, lalu klik Hubungkan.'}</li>
          </ol>
        </details>
        <p className="muted small">{lang === 'en'
          ? 'Every task with a deadline and every calendar entry is copied to your Google Calendar automatically. Changes you make in Google (time, date, title, deleting) come back here too. Events you create in Google appear in grey.'
          : 'Setiap task yang punya deadline dan semua catatan kalender otomatis masuk ke Google Calendar. Perubahan di Google (jam, tanggal, judul, hapus) juga kembali ke sini. Event yang kamu buat langsung di Google tampil warna abu-abu.'}</p>
      </section>

      <section className="card">
        <h2><Bell size={17} /> {t('reminder')}</h2>
        {typeof Notification !== 'undefined' && Notification.permission === 'granted'
          ? <span className="ok-chip">● {t('remindersActive')}</span>
          : <button className="btn" onClick={() => Notification?.requestPermission().then(() => api.setSettings({}))}>{t('remindersOn')}</button>}
      </section>

      <section className="card">
        <h2><Sparkles size={17} /> {t('aiSection')}</h2>
        <label className="lbl">{t('apiKey')}</label>
        <input type="password" value={s.anthropicKey} onChange={(e) => api.setSettings({ anthropicKey: e.target.value.trim() })} placeholder="sk-ant-..." />
        <p className="muted small">{t('apiKeyHelp')} {lang === 'en'
          ? <>Get one at <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer">console.anthropic.com</a> (pay-as-you-go; one topic list + one full carousel costs roughly US$0.05–0.10).</>
          : <>Buat di <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer">console.anthropic.com</a> (bayar sesuai pemakaian; satu daftar topik + satu carousel lengkap kira-kira US$0,05–0,10).</>}</p>

        <label className="lbl" style={{ marginTop: 12 }}>{lang === 'en' ? 'Brands shown in Social Media' : 'Brand yang tampil di Social Media'}</label>
        <div className="row-gap" style={{ flexWrap: 'wrap' }}>
          {[['elevara', 'Elevara'], ['sister', lang === 'en' ? 'Sister’s business' : 'Bisnis Kakak/Adik'], ['personal', 'Personal brand']].map(([id, name]) => {
            const act = s.activeBrands?.length ? s.activeBrands : ['elevara'];
            const on = act.includes(id);
            return (
              <label key={id} className="row-gap small" style={{ cursor: 'pointer' }}>
                <input type="checkbox" checked={on} onChange={() => {
                  const next = on ? act.filter((x) => x !== id) : [...act, id];
                  if (next.length) api.setSettings({ activeBrands: ['elevara', 'sister', 'personal'].filter((x) => next.includes(x)) });
                }} /> {name}
              </label>
            );
          })}
        </div>

        <div className="form-grid" style={{ marginTop: 12 }}>
          <label>{t('contentLang')}
            <select value={s.contentLang} onChange={(e) => api.setSettings({ contentLang: e.target.value })}>
              <option value="en">English</option>
              <option value="id">Bahasa Indonesia</option>
              <option value="both">English + Indonesia</option>
            </select>
          </label>
          <label>{t('postingTime')}<input type="time" value={s.postingTime} onChange={(e) => api.setSettings({ postingTime: e.target.value })} /></label>
        </div>
        <label className="lbl">{t('postingDays')}</label>
        <div className="days">
          {DAYS[lang].map((d, i) => (
            <button key={d} className={`day-chip${s.postingDays.includes(i) ? ' on' : ''}`} onClick={() => api.setSettings({ postingDays: s.postingDays.includes(i) ? s.postingDays.filter((x) => x !== i) : [...s.postingDays, i].sort() })}>{d}</button>
          ))}
        </div>
      </section>

      <section className="card">
        <h2><Megaphone size={17} /> {t('strategy')}</h2>
        <div className="seg" style={{ marginBottom: 10 }}>
          {[['elevara', 'Elevara'], ['sister', lang === 'en' ? "Sister's business" : 'Bisnis kakak/adik'], ['personal', 'Personal brand']].map(([k, n]) => (
            <button key={k} className={brand === k ? 'on' : ''} onClick={() => setBrand(k)}>{n}</button>
          ))}
        </div>
        <textarea rows={14} value={s.strategies[brand]} onChange={(e) => api.setSettings({ strategies: { ...s.strategies, [brand]: e.target.value } })} />
        <button className="btn ghost sm" onClick={() => api.setSettings({ strategies: { ...s.strategies, [brand]: DEFAULT_STRATEGIES[brand] } })}><RotateCcw size={14} /> Default</button>
      </section>

      <section className="card">
        <h2><Download size={17} /> {t('backup')}</h2>
        <div className="row-gap">
          <button className="btn" onClick={exportData}><Download size={15} /> {t('exportData')}</button>
          <button className="btn" onClick={() => fileRef.current.click()}><Upload size={15} /> {t('importData')}</button>
          <button className="btn danger ghost" onClick={() => confirm(t('resetConfirm')) && api.setState(initialState())}><RotateCcw size={15} /> {t('resetData')}</button>
          <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => e.target.files[0] && importData(e.target.files[0])} />
        </div>
      </section>
    </div>
  );
}
