import { useCallback, useEffect, useRef, useState } from 'react';
import { LayoutDashboard, FolderKanban, CalendarDays, Inbox, Settings as SettingsIcon, RefreshCw, Menu, X, CloudOff, Cloud } from 'lucide-react';
import { allTasks, projectProgress, StoreProvider, useStore } from './store.jsx';
import { tx } from './i18n.js';
import { catOf } from './ui.jsx';
import Dashboard from './Dashboard.jsx';
import { AllProjects, ProjectView, TaskDrawer } from './Project.jsx';
import CalendarView from './Calendar.jsx';
import Content from './Content.jsx';
import Settings from './Settings.jsx';
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

function Shell() {
  const { state, api, t, lang } = useStore();
  const [view, setView] = useState(() => localStorage.getItem('mw-view') || 'dashboard');
  const [task, setTask] = useState(null);
  const [navOpen, setNavOpen] = useState(false);
  const [calTarget, setCalTarget] = useState(null);
  const google = useGoogle();
  const [toast, closeToast] = useReminders();

  const openDay = (date, isNew) => { setCalTarget({ date, isNew, k: Date.now() }); go('calendar'); };
  const go = (v) => { setView(v); localStorage.setItem('mw-view', v); setNavOpen(false); window.scrollTo(0, 0); };
  const nav = [
    ['dashboard', LayoutDashboard, t('dashboard')],
    ['projects', FolderKanban, t('projects')],
  ];

  let page;
  if (view.startsWith('project:')) page = <ProjectView projectId={view.slice(8)} openTask={setTask} />;
  else if (view === 'projects') page = <AllProjects go={go} />;
  else if (view === 'calendar') page = <CalendarView key={calTarget?.k || 'cal'} openTask={setTask} target={calTarget} clearTarget={() => setCalTarget(null)} />;
  else if (view === 'content') page = <Content />;
  else if (view === 'settings') page = <Settings google={google} />;
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
