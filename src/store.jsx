import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ELEVARA_STRATEGY_V2, COMPANY_SUBS, buildInterviewTasks, buildSeedProjects, buildThesisProject, DEFAULT_STRATEGIES, uid } from './seed.js';
import { makeT, tx } from './i18n.js';
import { libraryFor } from './library.js';

const KEY = 'monika-workspace-v1';
// Google OAuth Client ID (public identifier, not a secret).
export const GOOGLE_CLIENT_ID = '678605435644-iaoe6egkbv4171ivp7d7ji05f9jugifv.apps.googleusercontent.com';

export function initialState() {
  return {
    version: 1,
    lang: 'id',
    projects: [...buildSeedProjects(), buildThesisProject()],
    migrations: ['interview-2026-11-24', 'thesis-project', 'interview-pdf', 'company-research', 'carousel-5', 'elevara-va-social'],
    practice: {},
    events: [{ id: uid('e'), interviewLumi: true, title: '🎯 Interview PA – Lumi Advertising (Zoom)', date: '2026-11-24', time: '10:15', endTime: '11:00', reminder: '60', category: 'career', notes: 'Zoom · 30–45 min · Alvina Global Partners', isDeadline: true, updatedAt: Date.now() }],
    activity: [{ id: uid('a'), ts: Date.now(), text: { en: 'Workspace created with your 4 projects', id: 'Workspace dibuat dengan 4 project kamu' } }],
    deletedGcal: [],
    content: { brand: 'elevara', ideas: [], rejected: [], posts: [], trends: {}, metrics: [] },
    settings: {
      googleClientId: GOOGLE_CLIENT_ID,
      anthropicKey: '',
      strategies: { ...DEFAULT_STRATEGIES },
      postingDays: [1, 3, 5],
      postingTime: '19:00',
      contentLang: 'en',
      lastSync: 0,
    },
  };
}

// Fill in missing fields and run one-time migrations on saved data (from this browser or from the cloud).
export function hydrate(s) {
  const base = initialState();
  return migrate({ ...base, ...s, migrations: [...(s.migrations || [])], settings: { ...base.settings, ...s.settings }, content: { ...base.content, ...s.content } });
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return hydrate(JSON.parse(raw));
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
      st.events.push({ id: uid('e'), interviewLumi: true, title: '🎯 Interview PA – Lumi Advertising (Zoom)', date: '2026-11-24', time: '10:15', endTime: '11:00', reminder: '60', category: 'career', notes: 'Zoom · 30–45 min · Alvina Global Partners', isDeadline: true, updatedAt: Date.now() });
    }
    st.migrations.push('interview-2026-11-24');
  }
  if (!done.has('thesis-project')) {
    if (!st.projects.some((p) => p.id === 'thesis')) st.projects.push(buildThesisProject());
    st.migrations.push('thesis-project');
  }
  if (!done.has('interview-pdf')) {
    const career = st.projects.find((p) => p.id === 'career');
    const sec = career?.sections[0];
    if (sec) {
      const keep = sec.tasks.filter((t) => /Alvina/i.test(typeof t.title === 'string' ? t.title : t.title.en));
      sec.tasks.filter((t) => !keep.includes(t) && t.gcalId).forEach((t) => st.deletedGcal.push(t.gcalId));
      keep.forEach((t) => Object.assign(t, { deadline: '2026-11-24', updatedAt: Date.now() }));
      sec.name = { en: 'Interview preparation · Lumi Advertising', id: 'Persiapan interview · Lumi Advertising' };
      sec.tasks = [...buildInterviewTasks(), ...keep];
    }
    const ev = st.events.find((e) => e.interviewLumi);
    if (ev) Object.assign(ev, { title: '🎯 Interview PA – Lumi Advertising (Zoom)', time: '10:15', endTime: '11:00', reminder: '60', notes: 'Zoom · 30–45 min · Alvina Global Partners', updatedAt: Date.now() });
    st.practice = st.practice || {};
    st.migrations.push('interview-pdf');
  }
  if (!done.has('company-research')) {
    for (const p of st.projects) for (const sec of p.sections) for (const t of sec.tasks) {
      const title = typeof t.title === 'string' ? t.title : t.title?.en || '';
      if (/Alvina/i.test(title) && !t.guide) { t.guide = { type: 'company' }; if (!t.subtasks?.some((x) => x.done)) t.subtasks = COMPANY_SUBS(); t.updatedAt = Date.now(); }
    }
    st.migrations.push('company-research');
  }
  if (!done.has('carousel-5')) {
    const strat = st.settings.strategies || {};
    if (strat.elevara) strat.elevara = strat.elevara.replace(/CAROUSEL STRUCTURE \(7–9 slides\):[^\n]*/, "CAROUSEL STRUCTURE (5 slides): 1) Hook that names the audience's problem  2–4) Three creative, practical solutions, one per slide  5) CTA that shows exactly what problem Elevara solves.");
    const c = st.content || {};
    (c.ideas || []).forEach((i) => {
      const hit = libraryFor(i.brand || c.brand, i.title);
      if (hit && !i.preview) Object.assign(i, { preview: hit.carousel.slides.map((x) => x.headline), why: `Problem it solves: ${hit.problem}`, format: 'Carousel, 5 slides' });
    });
    (c.posts || []).forEach((p) => {
      const hit = libraryFor(p.brand, p.topic?.title);
      if (hit && p.status === 'draft' && p.carousel && p.carousel.slides?.length !== 5) {
        p.carousel = { ...structuredClone(hit.carousel), template: true, library: true };
        p.topic = { ...p.topic, format: 'Carousel, 5 slides' };
      }
    });
    st.migrations.push('carousel-5');
  }
  if (!done.has('elevara-va-social')) {
    if (st.settings.strategies) st.settings.strategies.elevara = ELEVARA_STRATEGY_V2;
    const c = st.content || {};
    const map = { 'Business Support': 'Virtual Assistant', 'Creative Services': 'Social Media' };
    c.ideas = (c.ideas || []).filter((i) => !/Academic/i.test(i.pillar || '') && !/homepage/i.test(i.title || ''));
    c.ideas.forEach((i) => { if (map[i.pillar]) i.pillar = map[i.pillar]; });
    (c.posts || []).forEach((p) => { if (p.topic && map[p.topic.pillar]) p.topic.pillar = map[p.topic.pillar]; });
    st.migrations.push('elevara-va-social');
  }
  if (!st.settings.googleClientId) st.settings.googleClientId = GOOGLE_CLIENT_ID;
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
