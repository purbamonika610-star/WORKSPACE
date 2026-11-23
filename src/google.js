// Two-way sync between MONIKA WORKSPACE and Google Calendar (primary calendar).
// Uses Google Identity Services (browser OAuth token flow). Needs only an OAuth Client ID.
import { addDays, allTasks } from './store.jsx';
import { tx } from './i18n.js';
import { uid } from './seed.js';

const SCOPE = 'https://www.googleapis.com/auth/calendar.events';
const API = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
const TOKEN_KEY = 'mw-google-token';
const COLOR = { career: '9', elevara: '3', sister: '6', personal: '4', content: '2', meeting: '7', deadline: '11', life: '5' };
const TZ = Intl.DateTimeFormat().resolvedOptions().timeZone;

let gisPromise;
function loadGis() {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (!gisPromise) {
    gisPromise = new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true;
      s.onload = () => res();
      s.onerror = () => { gisPromise = null; rej(new Error('Could not load Google sign-in')); };
      document.head.appendChild(s);
    });
  }
  return gisPromise;
}

export function getToken() {
  try {
    const t = JSON.parse(sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY) || 'null');
    if (t && t.exp > Date.now() + 60000) return t.token;
  } catch { /* ignore */ }
  return null;
}
export function wasConnected() {
  return !!localStorage.getItem(TOKEN_KEY);
}
export function clearToken() {
  const tok = getToken();
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_KEY);
  if (tok && window.google?.accounts?.oauth2) window.google.accounts.oauth2.revoke(tok, () => {});
}

export async function requestToken(clientId, interactive = true) {
  await loadGis();
  return new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPE,
      callback: (resp) => {
        if (resp.error) return reject(new Error(resp.error_description || resp.error));
        const rec = JSON.stringify({ token: resp.access_token, exp: Date.now() + (resp.expires_in || 3600) * 1000 });
        localStorage.setItem(TOKEN_KEY, rec);
        resolve(resp.access_token);
      },
      error_callback: (e) => reject(new Error(e?.message || e?.type || 'Google sign-in was closed')),
    });
    client.requestAccessToken({ prompt: interactive ? 'consent' : '' });
  });
}

async function gfetch(token, url, opts = {}) {
  const r = await fetch(url, { ...opts, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(opts.headers || {}) } });
  if (r.status === 401) { clearToken(); throw new Error('AUTH'); }
  if (r.status === 204 || r.status === 410 || (opts.method === 'DELETE' && r.status === 404)) return null;
  if (!r.ok) throw new Error(`Google Calendar ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return r.json();
}

// ---- mapping ----
function timeBlock(date, time, endTime) {
  if (!time) return { start: { date }, end: { date: addDays(date, 1) } };
  let end = endTime;
  if (!end || end <= time) {
    const [h, m] = time.split(':').map(Number);
    const total = Math.min(h * 60 + m + 60, 23 * 60 + 59);
    end = `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  }
  return { start: { dateTime: `${date}T${time}:00`, timeZone: TZ }, end: { dateTime: `${date}T${end}:00`, timeZone: TZ } };
}
function reminders(rem) {
  if (rem === '' || rem == null) return { useDefault: true };
  return { useDefault: false, overrides: [{ method: 'popup', minutes: Number(rem) }] };
}

function taskToGoogle(task, project) {
  const sub = (task.subtasks || []).map((s) => `${s.done ? '☑' : '☐'} ${s.title}`).join('\n');
  return {
    summary: `${task.status === 'done' ? '✅ ' : ''}[${tx(project.name, 'en')}] ${tx(task.title, 'en')}`,
    description: [`Priority: ${task.priority}`, `Status: ${task.status}`, task.notes, sub].filter(Boolean).join('\n\n') + '\n\n— MONIKA WORKSPACE',
    ...timeBlock(task.deadline, task.time, ''),
    colorId: task.priority === 'high' ? '11' : COLOR[project.category],
    reminders: reminders(task.reminder),
    extendedProperties: { private: { monikaId: task.id, monikaType: 'task' } },
  };
}
function eventToGoogle(ev) {
  const body = {
    summary: ev.title,
    description: ev.notes || '',
    ...timeBlock(ev.date, ev.time, ev.endTime),
    reminders: reminders(ev.reminder),
  };
  if (ev.source !== 'google') {
    body.extendedProperties = { private: { monikaId: ev.id, monikaType: 'event' } };
    if (COLOR[ev.category]) body.colorId = COLOR[ev.category];
  }
  return body;
}
function parseGoogle(g) {
  let date = g.start?.date;
  let time = '';
  let endTime = '';
  if (g.start?.dateTime) {
    const s = new Date(g.start.dateTime);
    const e = new Date(g.end?.dateTime || g.start.dateTime);
    date = `${s.getFullYear()}-${String(s.getMonth() + 1).padStart(2, '0')}-${String(s.getDate()).padStart(2, '0')}`;
    time = s.toTimeString().slice(0, 5);
    endTime = e.toTimeString().slice(0, 5);
  }
  const rem = g.reminders?.useDefault === false && g.reminders.overrides?.length ? String(g.reminders.overrides[0].minutes) : '';
  return { date, time, endTime, reminder: rem, title: g.summary || '(no title)', notes: g.description || '' };
}
const cleanTaskTitle = (s) => s.replace(/^✅\s*/, '').replace(/^\[[^\]]*\]\s*/, '');

// ---- main sync ----
export async function syncGoogle(api) {
  const token = getToken();
  if (!token) throw new Error('AUTH');
  const snap = api.get();

  // 1) PULL
  const timeMin = new Date(Date.now() - 60 * 86400000).toISOString();
  const timeMax = new Date(Date.now() + 400 * 86400000).toISOString();
  const gEvents = [];
  let pageToken = '';
  do {
    const q = new URLSearchParams({ timeMin, timeMax, singleEvents: 'true', showDeleted: 'true', maxResults: '2500' });
    if (pageToken) q.set('pageToken', pageToken);
    const res = await gfetch(token, `${API}?${q}`);
    gEvents.push(...(res.items || []));
    pageToken = res.nextPageToken || '';
  } while (pageToken);

  const tasksById = new Map(allTasks(snap).map((x) => [x.task.id, x]));
  const eventsById = new Map(snap.events.map((e) => [e.id, e]));
  const eventsByGcal = new Map(snap.events.filter((e) => e.gcalId).map((e) => [e.gcalId, e]));
  const deletedSet = new Set(snap.deletedGcal);

  const taskPatches = []; // [id, patch]
  const eventPatches = []; // [id, patch]
  const eventRemovals = [];
  const imports = [];

  for (const g of gEvents) {
    if (deletedSet.has(g.id)) continue;
    const gUpdated = new Date(g.updated || 0).getTime();
    const mid = g.extendedProperties?.private?.monikaId;
    const type = g.extendedProperties?.private?.monikaType;
    const cancelled = g.status === 'cancelled';

    if (mid && type === 'task') {
      const hit = tasksById.get(mid);
      if (!hit) continue;
      const task = hit.task;
      if (task.gcalId && task.gcalId !== g.id) continue;
      const localDirty = (task.updatedAt || 0) > (task.syncedAt || 0);
      if (gUpdated <= (task.syncedAt || 0) + 1500 || localDirty) continue;
      if (cancelled) { taskPatches.push([task.id, { deadline: '', time: '', gcalId: '', syncedAt: Date.now() }]); continue; }
      const p = parseGoogle(g);
      const done = (g.summary || '').startsWith('✅');
      taskPatches.push([task.id, {
        deadline: p.date, time: p.time, reminder: p.reminder,
        title: cleanTaskTitle(p.title) !== tx(task.title, 'en') ? cleanTaskTitle(p.title) : task.title,
        status: done ? 'done' : task.status === 'done' ? 'todo' : task.status,
        gcalId: g.id, syncedAt: gUpdated,
      }]);
      continue;
    }
    const local = (mid && eventsById.get(mid)) || eventsByGcal.get(g.id);
    if (local) {
      const localDirty = (local.updatedAt || 0) > (local.syncedAt || 0);
      if (gUpdated <= (local.syncedAt || 0) + 1500 || localDirty) continue;
      if (cancelled) { eventRemovals.push(local.id); continue; }
      eventPatches.push([local.id, { ...parseGoogle(g), gcalId: g.id, syncedAt: gUpdated, updatedAt: gUpdated }]);
      continue;
    }
    if (cancelled || mid) continue;
    imports.push({ id: uid('e'), source: 'google', category: 'google', gcalId: g.id, ...parseGoogle(g), syncedAt: gUpdated, updatedAt: gUpdated, isDeadline: false });
  }

  api.update((s) => {
    for (const [id, patch] of taskPatches) {
      for (const p of s.projects) for (const sec of p.sections) {
        const t = sec.tasks.find((x) => x.id === id);
        if (t) { Object.assign(t, patch); t.updatedAt = patch.syncedAt; }
      }
    }
    for (const [id, patch] of eventPatches) {
      const e = s.events.find((x) => x.id === id);
      if (e) Object.assign(e, patch);
    }
    s.events = s.events.filter((e) => !eventRemovals.includes(e.id));
    s.events.push(...imports);
    return s;
  });

  // 2) PUSH local changes
  const now = api.get();
  const results = { tasks: [], events: [], deleted: [] };

  for (const { task, project } of allTasks(now)) {
    const dirty = (task.updatedAt || 0) > (task.syncedAt || 0);
    if (task.deadline && (!task.gcalId || dirty)) {
      const body = taskToGoogle(task, project);
      const r = task.gcalId
        ? await gfetch(token, `${API}/${encodeURIComponent(task.gcalId)}`, { method: 'PATCH', body: JSON.stringify(body) }).catch(() => null)
        : null;
      const res = r || await gfetch(token, API, { method: 'POST', body: JSON.stringify(body) });
      results.tasks.push([task.id, { gcalId: res.id, syncedAt: Math.max(Date.now(), new Date(res.updated).getTime()) }]);
    } else if (!task.deadline && task.gcalId) {
      await gfetch(token, `${API}/${encodeURIComponent(task.gcalId)}`, { method: 'DELETE' }).catch(() => null);
      results.tasks.push([task.id, { gcalId: '', syncedAt: Date.now() }]);
    }
  }
  for (const ev of now.events) {
    const dirty = (ev.updatedAt || 0) > (ev.syncedAt || 0);
    if (!ev.gcalId || dirty) {
      const body = eventToGoogle(ev);
      const r = ev.gcalId
        ? await gfetch(token, `${API}/${encodeURIComponent(ev.gcalId)}`, { method: 'PATCH', body: JSON.stringify(body) }).catch(() => null)
        : null;
      const res = r || await gfetch(token, API, { method: 'POST', body: JSON.stringify(body) });
      results.events.push([ev.id, { gcalId: res.id, syncedAt: Math.max(Date.now(), new Date(res.updated).getTime()) }]);
    }
  }
  for (const gid of now.deletedGcal) {
    await gfetch(token, `${API}/${encodeURIComponent(gid)}`, { method: 'DELETE' }).catch(() => null);
    results.deleted.push(gid);
  }

  api.update((s) => {
    for (const [id, patch] of results.tasks) {
      for (const p of s.projects) for (const sec of p.sections) {
        const t = sec.tasks.find((x) => x.id === id);
        if (t) Object.assign(t, patch, { updatedAt: Math.min(t.updatedAt || 0, patch.syncedAt) });
      }
    }
    for (const [id, patch] of results.events) {
      const e = s.events.find((x) => x.id === id);
      if (e) Object.assign(e, patch, { updatedAt: Math.min(e.updatedAt || 0, patch.syncedAt) });
    }
    s.deletedGcal = s.deletedGcal.filter((g) => !results.deleted.includes(g));
    s.settings.lastSync = Date.now();
    return s;
  });
  return { pulled: taskPatches.length + eventPatches.length + imports.length + eventRemovals.length, pushed: results.tasks.length + results.events.length + results.deleted.length };
}

export function hasDirty(state) {
  if (state.deletedGcal.length) return true;
  for (const { task } of allTasks(state)) {
    if (task.deadline && (!task.gcalId || (task.updatedAt || 0) > (task.syncedAt || 0))) return true;
    if (!task.deadline && task.gcalId) return true;
  }
  return state.events.some((e) => !e.gcalId || (e.updatedAt || 0) > (e.syncedAt || 0));
}
