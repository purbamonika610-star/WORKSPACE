import { useCallback, useEffect, useRef, useState } from 'react';
import { LayoutDashboard, FolderKanban, CalendarDays, Inbox, Settings as SettingsIcon, RefreshCw, Menu, X, CloudOff, Cloud, MonitorDown, Smartphone } from 'lucide-react';
import { allTasks, hydrate, projectProgress, StoreProvider, useStore } from './store.jsx';
import { cloudGet, cloudMeta, cloudPut, getCfg, newCode, setCfg, validCode } from './cloud.js';
import { tx } from './i18n.js';
import { catOf } from './ui.jsx';
import Dashboard from './Dashboard.jsx';
import { AllProjects, ProjectView, TaskDrawer } from './Project.jsx';
import CalendarView from './Calendar.jsx';
import Content from './Content.jsx';
import Settings from './Settings.jsx';
import Lock from './Lock.jsx';
import { clearToken, getToken, hasDirty, requestToken, syncGoogle, wasConnected } from './google.js';

function useGoogle() {
  const { state, api, t } = useStore();
  const [connected, setConnected] = useState(!!getToken());
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');
  const busy = useRef(false);

  const sync = useCallback(async () => {
    if (busy.current) return;
    if (!getToken()) { setConnected(false); return; }
    busy.current = true; setSyncing(true); setError('');
    try { await syncGoogle(api); }
    catch (e) {
      if (e.message === 'AUTH') setConnected(false);
      else setError(e.message);
    } finally { busy.current = false; setSyncing(false); }
  }, [api]);

  const connect = useCallback(async () => {
    const id = api.get().settings.googleClientId;
    if (!id) { setError(t('needClientId')); return; }
    try { await requestToken(id, !wasConnected()); setConnected(true); await sync(); }
    catch (e) { setError(e.message); }
  }, [api, sync, t]);

  const disconnect = () => { clearToken(); setConnected(false); };

  // push local changes shortly after they happen
  useEffect(() => {
    if (!connected || !hasDirty(state)) return;
    const h = setTimeout(sync, 2500);
    return () => clearTimeout(h);
  }, [state, connected, sync]);

  // pull Google changes regularly and when the tab regains focus
  useEffect(() => {
    if (!connected) return;
    sync();
    const iv = setInterval(sync, 3 * 60 * 1000);
    const onFocus = () => sync();
    window.addEventListener('focus', onFocus);
    return () => { clearInterval(iv); window.removeEventListener('focus', onFocus); };
  }, [connected, sync]);

  return { connected, syncing, error, sync, connect, disconnect, expired: !connected && wasConnected() };
}

function useCloud() {
  const { state, api, lang } = useStore();
  const [cfg, setCfgS] = useState(getCfg);
  const [status, setStatus] = useState(getCfg() ? 'saved' : 'off');
  const [error, setError] = useState('');
  const [info, setInfo] = useState(null);
  const applied = useRef(state);
  const busy = useRef(false);
  const dirty = useRef(false);
  const changeId = useRef(0);
  const lastLocal = useRef(0);
  const save = (c) => { setCfg(c); setCfgS(c); };

  const apply = useCallback((remote) => {
    const local = api.get();
    const next = hydrate({ ...remote.data, settings: { ...(remote.data.settings || {}), anthropicKey: local.settings.anthropicKey } });
    applied.current = next;
    api.setState(next);
  }, [api]);

  const push = useCallback(async () => {
    const c = getCfg();
    if (!c || busy.current) return;
    busy.current = true; setStatus('saving');
    const id = changeId.current;
    try {
      const t = await cloudPut(c.code, api.get());
      save({ ...c, remoteAt: t });
      setInfo({ at: t, device: 'this' });
      dirty.current = changeId.current !== id;
      setStatus('saved'); setError('');
    } catch (e) { setStatus('error'); setError(e.message); }
    busy.current = false;
    if (dirty.current) setTimeout(() => push(), 800);
  }, [api]);

  const pull = useCallback(async (force) => {
    const c = getCfg();
    if (!c || busy.current) return;
    try {
      const m = await cloudMeta(c.code);
      if (!m) { await push(); return; }
      setInfo({ at: m.updated_at, device: m.device });
      if (!force && m.updated_at === c.remoteAt) return;
      if (!force && dirty.current && lastLocal.current > new Date(m.updated_at).getTime()) { await push(); return; }
      busy.current = true; setStatus('saving');
      const r = await cloudGet(c.code);
      if (r) {
        apply(r);
        dirty.current = false;
        save({ ...getCfg(), remoteAt: r.updated_at });
      }
      setStatus('saved'); setError('');
    } catch (e) { setStatus('error'); setError(e.message); }
    busy.current = false;
  }, [apply, push]);

  // upload shortly after every local change
  useEffect(() => {
    if (!cfg || state === applied.current) return;
    changeId.current += 1; dirty.current = true; lastLocal.current = Date.now();
    setStatus('pending');
    const h = setTimeout(push, 1500);
    return () => clearTimeout(h);
  }, [state, cfg, push]);

  // download changes from other devices
  useEffect(() => {
    if (!cfg) return;
    pull();
    const iv = setInterval(() => pull(), 15000);
    const onFocus = () => pull();
    const onVis = () => document.visibilityState === 'visible' && pull();
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVis);
    return () => { clearInterval(iv); window.removeEventListener('focus', onFocus); document.removeEventListener('visibilitychange', onVis); };
  }, [cfg?.code, pull]); // eslint-disable-line react-hooks/exhaustive-deps

  const enable = useCallback(async () => {
    save({ code: newCode(), remoteAt: null });
    await push();
  }, [push]);

  const join = useCallback(async (raw) => {
    const code = (raw || '').trim();
    if (!validCode(code)) { setError(lang === 'en' ? 'That code does not look right.' : 'Kodenya sepertinya salah.'); return false; }
    setStatus('saving'); setError('');
    try {
      const r = await cloudGet(code);
      if (!r) { setStatus(getCfg() ? 'saved' : 'off'); setError(lang === 'en' ? 'No workspace found for this code.' : 'Workspace dengan kode ini tidak ditemukan.'); return false; }
      save({ code, remoteAt: r.updated_at });
      apply(r);
      setInfo({ at: r.updated_at, device: r.device });
      setStatus('saved');
      return true;
    } catch (e) { setStatus('error'); setError(e.message); return false; }
  }, [apply, lang]);

  const disconnect = () => { save(null); setStatus('off'); setInfo(null); };

  // open a link like https://…/#sync=mw-… on a new device
  useEffect(() => {
    const m = window.location.hash.match(/sync=(mw-[0-9a-f-]+)/i);
    if (!m) return;
    history.replaceState(null, '', window.location.pathname + window.location.search);
    if (getCfg()?.code === m[1]) return;
    const ok = window.confirm(lang === 'en'
      ? 'Connect this device to your synced workspace? The data on this device will be replaced by your cloud workspace.'
      : 'Sambungkan device ini ke workspace yang tersinkron? Data di device ini akan diganti dengan workspace dari cloud.');
    if (ok) join(m[1]);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { cfg, status, error, info, enable, join, disconnect, syncNow: () => (dirty.current ? push() : pull(true)) };
}

function useReminders() {
  const { state, lang } = useStore();
  const ref = useRef(state);
  ref.current = state;
  const [toast, setToast] = useState(null);
  useEffect(() => {
    const check = () => {
      const s = ref.current;
      const now = Date.now();
      let fired = {};
      try { fired = JSON.parse(localStorage.getItem('mw-fired') || '{}'); } catch { /* */ }
      const items = [
        ...allTasks(s).filter((x) => x.task.deadline && x.task.reminder !== '' && x.task.status !== 'done')
          .map((x) => ({ key: `t${x.task.id}${x.task.deadline}${x.task.time}${x.task.reminder}`, title: tx(x.task.title, lang), date: x.task.deadline, time: x.task.time || '09:00', rem: Number(x.task.reminder) })),
        ...s.events.filter((e) => e.reminder !== '' && e.reminder != null)
          .map((e) => ({ key: `e${e.id}${e.date}${e.time}${e.reminder}`, title: e.title, date: e.date, time: e.time || '09:00', rem: Number(e.reminder) })),
      ];
      for (const it of items) {
        const at = new Date(`${it.date}T${it.time}:00`).getTime();
        const due = at - it.rem * 60000;
        if (now >= due && now < at + 15 * 60000 && !fired[it.key]) {
          fired[it.key] = now;
          const body = `${it.date} ${it.time}`;
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') new Notification(`⏰ ${it.title}`, { body });
          setToast({ title: it.title, body });
        }
      }
      localStorage.setItem('mw-fired', JSON.stringify(fired));
    };
    check();
    const iv = setInterval(check, 30000);
    return () => clearInterval(iv);
  }, [lang]);
  return [toast, () => setToast(null)];
}

function InstallButton({ lang }) {
  const [can, setCan] = useState(!!window.__installPrompt);
  useEffect(() => {
    const on = () => setCan(true);
    const off = () => { window.__installPrompt = null; setCan(false); };
    window.addEventListener('mw-installable', on);
    window.addEventListener('appinstalled', off);
    return () => { window.removeEventListener('mw-installable', on); window.removeEventListener('appinstalled', off); };
  }, []);
  if (!can || window.matchMedia('(display-mode: standalone)').matches) return null;
  const install = async () => {
    const p = window.__installPrompt;
    if (!p) return;
    p.prompt();
    const r = await p.userChoice.catch(() => null);
    if (r?.outcome === 'accepted') { window.__installPrompt = null; setCan(false); }
  };
  return (
    <div className="gsync install" onClick={install}>
      <MonitorDown size={16} />
      <div className="grow"><div className="small"><b>{lang === 'en' ? 'Install on desktop' : 'Pasang di desktop'}</b></div><div className="muted tiny">{lang === 'en' ? 'Open like an app' : 'Buka seperti aplikasi'}</div></div>
    </div>
  );
}

function Shell() {
  const { state, api, t, lang } = useStore();
  const [view, setView] = useState(() => localStorage.getItem('mw-view') || 'dashboard');
  const [task, setTask] = useState(null);
  const [navOpen, setNavOpen] = useState(false);
  const [calTarget, setCalTarget] = useState(null);
  const google = useGoogle();
  const cloud = useCloud();
  const [toast, closeToast] = useReminders();

  const openDay = (date, isNew) => { setCalTarget({ date, isNew, k: Date.now() }); go('calendar'); };
  const go = (v) => { setView(v); localStorage.setItem('mw-view', v); setNavOpen(false); window.scrollTo(0, 0); };
  useEffect(() => {
    const h = (e) => go(e.detail);
    window.addEventListener('mw-go', h);
    return () => window.removeEventListener('mw-go', h);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const nav = [
    ['dashboard', LayoutDashboard, t('dashboard')],
    ['projects', FolderKanban, t('projects')],
  ];

  let page;
  if (view.startsWith('project:')) page = <Lock><ProjectView projectId={view.slice(8)} openTask={setTask} /></Lock>;
  else if (view === 'projects') page = <Lock><AllProjects go={go} /></Lock>;
  else if (view === 'calendar') page = <CalendarView key={calTarget?.k || 'cal'} openTask={setTask} target={calTarget} clearTarget={() => setCalTarget(null)} />;
  else if (view === 'content') page = <Content />;
  else if (view === 'settings') page = <Settings google={google} cloud={cloud} />;
  else page = <Dashboard openTask={setTask} go={go} openDay={openDay} />;

  const ideaCount = state.content.ideas.filter((i) => i.brand === state.content.brand).length;

  return (
    <div className="app">
      <div className="topbar">
        <button className="icon-btn" onClick={() => setNavOpen(true)}><Menu size={20} /></button>
        <b>MONIKA WORKSPACE</b>
      </div>
      <aside className={`sidebar${navOpen ? ' open' : ''}`}>
        <div className="brand">
          <div className="logo">M</div>
          <div><b>MONIKA</b><span>WORKSPACE</span></div>
          <button className="icon-btn close-nav" onClick={() => setNavOpen(false)}><X size={18} /></button>
        </div>
        <nav>
          {nav.map(([id, Icon, label]) => (
            <button key={id} className={view === id ? 'on' : ''} onClick={() => go(id)}><Icon size={18} /> {label}</button>
          ))}
          <div className="nav-projects">
            {state.projects.map((p) => {
              const c = catOf(p.category);
              return (
                <button key={p.id} className={view === `project:${p.id}` ? 'on' : ''} onClick={() => go(`project:${p.id}`)}>
                  <span className="badge-key sm" style={{ background: c.color }}>{p.key}</span>
                  <span className="grow">{tx(p.name, lang)}</span>
                  <span className="muted small">{Math.round(projectProgress(p) * 100)}%</span>
                </button>
              );
            })}
          </div>
          <button className={view === 'calendar' ? 'on' : ''} onClick={() => go('calendar')}><CalendarDays size={18} /> {t('calendar')}</button>
          <button className={view === 'content' ? 'on' : ''} onClick={() => go('content')}><Inbox size={18} /> {t('contentInbox')} {ideaCount > 0 && <span className="count">{ideaCount}</span>}</button>
          <button className={view === 'settings' ? 'on' : ''} onClick={() => go('settings')}><SettingsIcon size={18} /> {t('settings')}</button>
        </nav>
        <div className="side-foot">
          <InstallButton lang={lang} />
          <div className={`gsync${cloud.cfg ? ' on' : ''}`} onClick={() => (cloud.cfg ? cloud.syncNow() : go('settings'))}>
            {cloud.status === 'error' ? <CloudOff size={16} /> : <Smartphone size={16} />}
            <div className="grow">
              <div className="small"><b>{lang === 'en' ? 'Device sync' : 'Sinkron device'}</b></div>
              <div className="muted tiny">{{ off: lang === 'en' ? 'Off · click to set up' : 'Mati · klik untuk atur', pending: lang === 'en' ? 'Saving soon…' : 'Akan disimpan…', saving: lang === 'en' ? 'Syncing…' : 'Menyinkronkan…', saved: lang === 'en' ? 'All saved ✓' : 'Semua tersimpan ✓', error: lang === 'en' ? 'Offline · will retry' : 'Offline · coba lagi nanti' }[cloud.status]}</div>
            </div>
            {cloud.cfg && <RefreshCw size={14} className={cloud.status === 'saving' ? 'spin' : ''} />}
          </div>
          <div className={`gsync${google.connected ? ' on' : ''}`} onClick={() => (google.connected ? google.sync() : state.settings.googleClientId ? google.connect() : go('settings'))}>
            {google.connected ? <Cloud size={16} /> : <CloudOff size={16} />}
            <div className="grow">
              <div className="small"><b>{t('googleCal')}</b></div>
              <div className="muted tiny">{google.syncing ? t('syncing') : google.connected ? t('connected') : google.expired ? (lang === 'en' ? 'Click to reconnect' : 'Klik untuk sambung lagi') : t('notConnected')}</div>
            </div>
            {google.connected && <RefreshCw size={14} className={google.syncing ? 'spin' : ''} />}
          </div>
          <div className="lang-toggle">
            <button className={lang === 'id' ? 'on' : ''} onClick={() => api.setLang('id')}>ID</button>
            <button className={lang === 'en' ? 'on' : ''} onClick={() => api.setLang('en')}>EN</button>
          </div>
        </div>
      </aside>
      {navOpen && <div className="scrim" onClick={() => setNavOpen(false)} />}
      <main>{page}</main>
      {task && <TaskDrawer taskId={task} onClose={() => setTask(null)} />}
      {toast && (
        <div className="toast" onClick={closeToast}>⏰ <div><b>{toast.title}</b><div className="muted small">{toast.body}</div></div></div>
      )}
    </div>
  );
}

export default function App() {
  return <StoreProvider><Shell /></StoreProvider>;
}
