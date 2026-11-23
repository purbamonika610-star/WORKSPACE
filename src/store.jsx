import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { buildSeedProjects, buildThesisProject, DEFAULT_STRATEGIES, uid } from './seed.js';
import { makeT, tx } from './i18n.js';

const KEY = 'monika-workspace-v1';

export function initialState() {
  return {
    version: 1,
    lang: 'id',
    projects: [...buildSeedProjects(), buildThesisProject()],
    migrations: ['interview-2026-11-24', 'thesis-project'],
    events: [{ id: uid('e'), interviewLumi: true, title: '🎯 Interview PA – Lumi Advertising', date: '2026-11-24', time: '', endTime: '', reminder: '', category: 'career', notes: '', isDeadline: true, updatedAt: Date.now() }],
    activity: [{ id: uid('a'), ts: Date.now(), text: { en: 'Workspace created with your 4 projects', id: 'Workspace dibuat dengan 4 project kamu' } }],
    deletedGcal: [],
    content: { brand: 'elevara', ideas: [], rejected: [], posts: [], trends: {}, metrics: [] },
    settings: {
      googleClientId: '',
      anthropicKey: '',
      strategies: { ...DEFAULT_STRATEGIES },
      postingDays: [1, 3, 5],
      postingTime: '19:00',
      contentLang: 'en',
      lastSync: 0,
    },
  };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw);
      const base = initialState();
      return migrate({ ...base, ...s, migrations: s.migrations || [], settings: { ...base.settings, ...s.settings }, content: { ...base.content, ...s.content } });
    }
  } catch { /* ignore */ }
  return initialState();
}

// One-time updates applied to data already saved in the browser.
function migrate(st) {
  const done = new Set(st.migrations);
  if (!done.has('interview-2026-11-24')) {
    const career = st.projects.find((p) => p.id === 'career');
    const sec = career?.sections[0];
    sec?.tasks.forEach((t) => { if (t.status !== 'done') Object.assign(t, { deadline: '2026-11-23', priority: 'high', updatedAt: Date.now() }); });
    if (!st.events.some((e) => e.interviewLumi)) {
      st.events.push({ id: uid('e'), interviewLumi: true, title: '🎯 Interview PA – Lumi Advertising', date: '2026-11-24', time: '', endTime: '', reminder: '', category: 'career', notes: '', isDeadline: true, updatedAt: Date.now() });
    }
    st.migrations.push('interview-2026-11-24');
  }
  if (!done.has('thesis-project')) {
    if (!st.projects.some((p) => p.id === 'thesis')) st.projects.push(buildThesisProject());
    st.migrations.push('thesis-project');
  }
  return st;
}

const Ctx = createContext(null);

export function StoreProvider({ children }) {
  const [state, setState] = useState(load);
  const ref = useRef(state);
  ref.current = state;

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  }, [state]);

  const api = useMemo(() => {
    const update = (fn) => setState((s) => fn(structuredClone(s)) || s);
    const log = (s, en, id) => {
      s.activity.unshift({ id: uid('a'), ts: Date.now(), text: { en, id } });
      s.activity = s.activity.slice(0, 60);
    };
    const findTask = (s, taskId) => {
      for (const p of s.projects) for (const sec of p.sections) {
        const i = sec.tasks.findIndex((t) => t.id === taskId);
        if (i >= 0) return { p, sec, task: sec.tasks[i], i };
      }
      return null;
    };
    return {
      get: () => ref.current,
      setState,
      update,
      setLang: (lang) => update((s) => { s.lang = lang; return s; }),
      setSettings: (patch) => update((s) => { Object.assign(s.settings, patch); return s; }),
      updateTask: (taskId, patch, silent) => update((s) => {
        const f = findTask(s, taskId);
        if (!f) return s;
        const before = f.task.status;
        Object.assign(f.task, patch, { updatedAt: Date.now() });
        if (!silent && patch.status && patch.status !== before) {
          const name = (l) => tx(f.task.title, l);
          if (patch.status === 'done') log(s, `Completed "${name('en')}"`, `Menyelesaikan "${name('id')}"`);
          else if (patch.status === 'doing') log(s, `Started "${name('en')}"`, `Mulai mengerjakan "${name('id')}"`);
        }
        return s;
      }),
      addTask: (projectId, sectionId, title, extra = {}) => update((s) => {
        const p = s.projects.find((x) => x.id === projectId);
        const sec = p?.sections.find((x) => x.id === sectionId);
        if (!sec) return s;
        sec.tasks.push({ id: uid('t'), title, status: 'todo', priority: 'medium', deadline: '', time: '', reminder: '', notes: '', subtasks: [], updatedAt: Date.now(), ...extra });
        log(s, `Added task "${title}" to ${tx(p.name, 'en')}`, `Menambah task "${title}" ke ${tx(p.name, 'id')}`);
        return s;
      }),
      deleteTask: (taskId) => update((s) => {
        const f = findTask(s, taskId);
        if (!f) return s;
        if (f.task.gcalId) s.deletedGcal.push(f.task.gcalId);
        f.sec.tasks.splice(f.i, 1);
        log(s, `Deleted "${tx(f.task.title, 'en')}"`, `Menghapus "${tx(f.task.title, 'id')}"`);
        return s;
      }),
      addSection: (projectId, name) => update((s) => {
        const p = s.projects.find((x) => x.id === projectId);
        p.sections.push({ id: uid('s'), name, tasks: [] });
        return s;
      }),
      renameSection: (projectId, sectionId, name) => update((s) => {
        const sec = s.projects.find((x) => x.id === projectId)?.sections.find((x) => x.id === sectionId);
        if (sec) sec.name = name;
        return s;
      }),
      deleteSection: (projectId, sectionId) => update((s) => {
        const p = s.projects.find((x) => x.id === projectId);
        const sec = p.sections.find((x) => x.id === sectionId);
        sec?.tasks.forEach((t) => t.gcalId && s.deletedGcal.push(t.gcalId));
        p.sections = p.sections.filter((x) => x.id !== sectionId);
        return s;
      }),
      setProjectNotes: (projectId, notes) => update((s) => {
        const p = s.projects.find((x) => x.id === projectId);
        p.notes = notes;
        return s;
      }),
      saveEvent: (ev) => update((s) => {
        const i = s.events.findIndex((e) => e.id === ev.id);
        const item = { ...ev, updatedAt: Date.now() };
        if (i >= 0) s.events[i] = { ...s.events[i], ...item };
        else {
          s.events.push({ ...item, id: item.id || uid('e') });
          log(s, `Added "${ev.title}" to calendar (${ev.date})`, `Menambah "${ev.title}" ke kalender (${ev.date})`);
        }
        return s;
      }),
      deleteEvent: (id) => update((s) => {
        const e = s.events.find((x) => x.id === id);
        if (e?.gcalId) s.deletedGcal.push(e.gcalId);
        s.events = s.events.filter((x) => x.id !== id);
        return s;
      }),
      log: (en, id) => update((s) => { log(s, en, id); return s; }),
    };
  }, []);

  const t = useMemo(() => makeT(state.lang), [state.lang]);
  return <Ctx.Provider value={{ state, api, t, lang: state.lang }}>{children}</Ctx.Provider>;
}

export const useStore = () => useContext(Ctx);

// ---------- derived helpers ----------
export function allTasks(state) {
  const out = [];
  for (const p of state.projects) for (const sec of p.sections) for (const task of sec.tasks) out.push({ task, project: p, section: sec });
  return out;
}

export function taskProgress(task) {
  if (task.status === 'done') return 1;
  if (task.subtasks?.length) {
    const d = task.subtasks.filter((x) => x.done).length;
    return d / task.subtasks.length;
  }
  return task.status === 'doing' ? 0.25 : 0;
}

export function projectProgress(p) {
  const ts = p.sections.flatMap((s) => s.tasks);
  if (!ts.length) return 0;
  return ts.reduce((a, t) => a + taskProgress(t), 0) / ts.length;
}

export const todayStr = () => toDateStr(new Date());
export function toDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}
export function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return toDateStr(d);
}
export function daysUntil(dateStr) {
  const a = new Date(todayStr() + 'T00:00:00');
  const b = new Date(dateStr + 'T00:00:00');
  return Math.round((b - a) / 86400000);
}
export function fmtDate(dateStr, lang, opts = { day: 'numeric', month: 'short' }) {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString(lang === 'en' ? 'en-GB' : 'id-ID', opts);
}
export function relDay(dateStr, t) {
  const d = daysUntil(dateStr);
  if (d < 0) return t('overdue');
  if (d === 0) return t('dueToday');
  if (d === 1) return t('tomorrow');
  return t('inXDays', { n: d });
}
