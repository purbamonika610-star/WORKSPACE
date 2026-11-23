import { useState } from 'react';
import { ChevronLeft, ChevronRight, Flag, Plus, Trash2, Bell, Clock } from 'lucide-react';
import { addDays, allTasks, fmtDate, toDateStr, todayStr, useStore } from './store.jsx';
import { tx } from './i18n.js';
import { CATEGORIES } from './seed.js';
import { catOf, CategoryPicker, Modal, ReminderSelect } from './ui.jsx';

export function itemsByDate(state, lang) {
  const map = {};
  const push = (d, it) => { (map[d] ||= []).push(it); };
  for (const { task, project } of allTasks(state)) {
    if (!task.deadline) continue;
    push(task.deadline, { kind: 'task', id: task.id, title: tx(task.title, lang), time: task.time, cat: project.category, done: task.status === 'done', high: task.priority === 'high' });
  }
  for (const e of state.events) push(e.date, { kind: 'event', id: e.id, title: e.title, time: e.time, endTime: e.endTime, cat: e.category, deadline: e.isDeadline, reminder: e.reminder, post: !!e.postId });
  for (const d in map) map[d].sort((a, b) => (a.time || '99').localeCompare(b.time || '99'));
  return map;
}

const blank = (date) => ({ id: '', title: '', date, time: '', endTime: '', reminder: '', category: 'elevara', notes: '', isDeadline: false });

export function EventForm({ initial, onDone }) {
  const { api, t, lang } = useStore();
  const [ev, setEv] = useState(initial);
  const set = (p) => setEv((x) => ({ ...x, ...p }));
  const save = (e) => {
    e.preventDefault();
    if (!ev.title.trim()) return;
    api.saveEvent({ ...ev, category: ev.isDeadline && ev.category === 'elevara' && !initial.id ? ev.category : ev.category });
    onDone();
  };
  return (
    <form onSubmit={save} className="event-form">
      <input className="title-input" autoFocus value={ev.title} onChange={(e) => set({ title: e.target.value })} placeholder={t('title')} />
      <label className="lbl">{t('category')}</label>
      <CategoryPicker value={ev.category} onChange={(category) => set({ category })} lang={lang} />
      <div className="form-grid">
        <label>{t('date')}<input type="date" value={ev.date} onChange={(e) => set({ date: e.target.value })} /></label>
        <label>{t('reminder')}<ReminderSelect value={ev.reminder} onChange={(reminder) => set({ reminder })} t={t} /></label>
        <label>{t('time')}<input type="time" value={ev.time} onChange={(e) => set({ time: e.target.value })} /></label>
        <label>{t('endTime')}<input type="time" value={ev.endTime} onChange={(e) => set({ endTime: e.target.value })} /></label>
      </div>
      <label className="toggle"><input type="checkbox" checked={ev.isDeadline} onChange={(e) => set({ isDeadline: e.target.checked, category: e.target.checked ? 'deadline' : ev.category })} /> <Flag size={14} /> {t('isDeadline')}</label>
      <label className="lbl">{t('notes')}</label>
      <textarea rows={3} value={ev.notes} onChange={(e) => set({ notes: e.target.value })} placeholder={t('projectNotesPh')} />
      <div className="modal-foot">
        {initial.id ? <button type="button" className="btn danger ghost" onClick={() => { api.deleteEvent(initial.id); onDone(); }}><Trash2 size={15} /> {t('delete')}</button> : <span />}
        {ev.source === 'google' && <span className="muted small">{t('fromGoogle')}</span>}
        <button className="btn primary">{t('save')}</button>
      </div>
    </form>
  );
}

const HOUR_H = 56;
const START_H = 6;
const END_H = 23;
const TABS = [
  ['all', { en: 'All scheduled', id: 'Semua jadwal' }, () => true],
  ['events', { en: 'Events', id: 'Acara' }, (it) => it.kind === 'event' && !['meeting', 'content'].includes(it.cat) && !it.deadline],
  ['meetings', { en: 'Meetings', id: 'Meeting' }, (it) => it.cat === 'meeting'],
  ['deadlines', { en: 'Task deadlines', id: 'Deadline task' }, (it) => it.kind === 'task' || it.deadline],
  ['content', { en: 'Content', id: 'Konten' }, (it) => it.cat === 'content' || it.post],
];
const toMin = (hm) => { const [h, m] = hm.split(':').map(Number); return h * 60 + m; };

function TimeGrid({ days, items, onItem, onSlot, lang, t }) {
  const today = todayStr();
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const hours = Array.from({ length: END_H - START_H }, (_, i) => START_H + i);
  return (
    <div className="tg" style={{ '--cols': days.length }}>
      <div className="tg-head">
        <div />
        {days.map((d) => (
          <div key={d} className={`tg-day${d === today ? ' today' : ''}`}>
            {new Date(d + 'T00:00').toLocaleDateString(lang === 'en' ? 'en-GB' : 'id-ID', { weekday: 'short' })} <b>{new Date(d + 'T00:00').getDate()}</b>
          </div>
        ))}
      </div>
      <div className="tg-allday">
        <div className="tg-label">{t('allDay')}</div>
        {days.map((d) => (
          <div key={d} className="tg-ad-cell" onClick={() => onSlot(d, '')}>
            {(items[d] || []).filter((x) => !x.time).map((it) => {
              const c = catOf(it.cat);
              return <div key={it.id} className={`ad-chip${it.done ? ' struck' : ''}`} style={{ background: c.bg, color: c.color }} onClick={(e) => { e.stopPropagation(); onItem(it); }}>{(it.kind === 'task' || it.deadline) && <Flag size={10} />} {it.title}</div>;
            })}
          </div>
        ))}
      </div>
      <div className="tg-body" style={{ height: hours.length * HOUR_H }}>
        <div className="tg-hours">{hours.map((h) => <div key={h} style={{ height: HOUR_H }}>{String(h).padStart(2, '0')}:00</div>)}</div>
        {days.map((d) => (
          <div key={d} className={`tg-col${d === today ? ' today' : ''}`}>
            {hours.map((h) => <div key={h} className="tg-slot" style={{ height: HOUR_H }} onClick={() => onSlot(d, `${String(h).padStart(2, '0')}:00`)} />)}
            {(items[d] || []).filter((x) => x.time).map((it) => {
              const c = catOf(it.cat);
              const s = Math.max(toMin(it.time), START_H * 60);
              const e = it.endTime && it.endTime > it.time ? toMin(it.endTime) : s + 60;
              const top = ((s - START_H * 60) / 60) * HOUR_H;
              const h = Math.max(((e - s) / 60) * HOUR_H - 4, 26);
              return (
                <div key={it.id} className={`tg-ev${it.done ? ' struck' : ''}`} style={{ top, height: h, background: c.bg, color: c.color, '--c': c.color }} onClick={(ev) => { ev.stopPropagation(); onItem(it); }}>
                  <div className="tg-ev-time">{it.time}{it.endTime ? ` – ${it.endTime}` : ''}</div>
                  <div className="tg-ev-title">{it.title}</div>
                </div>
              );
            })}
            {d === today && nowMin >= START_H * 60 && nowMin < END_H * 60 && <div className="tg-now" style={{ top: ((nowMin - START_H * 60) / 60) * HOUR_H }} />}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CalendarView({ openTask, target, clearTarget }) {
  const { state, t, lang } = useStore();
  const [mode, setMode] = useState(() => localStorage.getItem('mw-calmode') || 'week');
  const [anchor, setAnchor] = useState(() => target?.date || todayStr());
  const [day, setDay] = useState(target && !target.isNew ? target.date : null);
  const [editing, setEditing] = useState(target?.isNew ? blank(target.date) : null);
  const [hidden, setHidden] = useState([]);
  const [tab, setTab] = useState('all');
  const map = itemsByDate(state, lang);
  const today = todayStr();
  const tabFn = TABS.find((x) => x[0] === tab)[2];
  const filtered = {};
  for (const d in map) filtered[d] = map[d].filter((it) => !hidden.includes(it.cat) && tabFn(it));
  const setM = (m) => { setMode(m); localStorage.setItem('mw-calmode', m); };

  const a = new Date(anchor + 'T00:00');
  const weekStart = addDays(anchor, -((a.getDay() + 6) % 7));
  const monthFirst = new Date(a.getFullYear(), a.getMonth(), 1);
  const startOffset = (monthFirst.getDay() + 6) % 7;
  const gridStart = new Date(monthFirst); gridStart.setDate(1 - startOffset);
  const cells = Array.from({ length: 42 }, (_, i) => { const d = new Date(gridStart); d.setDate(gridStart.getDate() + i); return d; });
  const weekdays = Array.from({ length: 7 }, (_, i) => new Date(2024, 0, 1 + i).toLocaleDateString(lang === 'en' ? 'en-GB' : 'id-ID', { weekday: 'short' }));
  const move = (n) => {
    if (mode === 'month') { const d = new Date(a); d.setDate(1); d.setMonth(d.getMonth() + n); setAnchor(toDateStr(d)); }
    else setAnchor(addDays(anchor, n * (mode === 'week' ? 7 : 1)));
  };
  const loc = lang === 'en' ? 'en-GB' : 'id-ID';
  const title = mode === 'month' ? a.toLocaleDateString(loc, { month: 'long', year: 'numeric' })
    : mode === 'week' ? `${fmtDate(weekStart, lang)} – ${fmtDate(addDays(weekStart, 6), lang, { day: 'numeric', month: 'short', year: 'numeric' })}`
      : fmtDate(anchor, lang, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const openItem = (it) => { if (it.kind === 'task') openTask(it.id); else setEditing(state.events.find((x) => x.id === it.id)); };
  const dayItems = day ? (map[day] || []) : [];
  const close = (fn) => () => { fn(null); clearTarget?.(); };

  return (
    <div className="page">
      <header className="page-head cal-head">
        <div>
          <h1>{t('calendar')}</h1>
          <p className="muted">{t('clickDayHint')}</p>
        </div>
        <button className="btn black" onClick={() => setEditing(blank(mode === 'month' ? today : anchor))}><Plus size={16} /> {t('newEvent')}</button>
      </header>

      <div className="cal-tabs">
        {TABS.map(([id, name]) => (
          <button key={id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>{tx(name, lang)}</button>
        ))}
      </div>

      <div className="cal-bar">
        <div className="row-gap">
          <h2 className="cal-title">{title}</h2>
          <button className="btn sm" onClick={() => setAnchor(today)}>{t('today')}</button>
        </div>
        <div className="row-gap">
          <div className="seg">
            {[['day', { en: 'Day', id: 'Hari' }], ['week', { en: 'Week', id: 'Minggu' }], ['month', { en: 'Month', id: 'Bulan' }]].map(([m, n]) => (
              <button key={m} className={mode === m ? 'on' : ''} onClick={() => setM(m)}>{tx(n, lang)}</button>
            ))}
          </div>
          <button className="icon-btn bordered" onClick={() => move(-1)}><ChevronLeft size={18} /></button>
          <button className="icon-btn bordered" onClick={() => move(1)}><ChevronRight size={18} /></button>
        </div>
      </div>

      <div className="legend">
        {CATEGORIES.map((c) => (
          <button key={c.id} className={`legend-item${hidden.includes(c.id) ? ' off' : ''}`} onClick={() => setHidden((h) => (h.includes(c.id) ? h.filter((x) => x !== c.id) : [...h, c.id]))}>
            <span className="dot" style={{ background: c.color }} />{tx(c.name, lang)}
          </button>
        ))}
      </div>

      {mode === 'month' ? (
        <div className="card cal">
          <div className="cal-week">{weekdays.map((w) => <div key={w}>{w}</div>)}</div>
          <div className="cal-grid">
            {cells.map((d) => {
              const ds = toDateStr(d);
              const items = filtered[ds] || [];
              const other = d.getMonth() !== a.getMonth();
              return (
                <div key={ds} className={`cal-cell${other ? ' other' : ''}${ds === today ? ' today' : ''}`} onClick={() => setDay(ds)}>
                  <div className="cal-num">{d.getDate()}</div>
                  <div className="cal-items">
                    {items.slice(0, 3).map((it) => {
                      const c = catOf(it.cat);
                      return (
                        <div key={it.id} className={`cal-item${it.done ? ' struck' : ''}`} style={{ background: c.bg, color: c.color }} onClick={(e) => { e.stopPropagation(); openItem(it); }}>
                          {(it.kind === 'task' || it.deadline) && <Flag size={10} />}
                          {it.time && <b>{it.time}</b>} {it.title}
                        </div>
                      );
                    })}
                    {items.length > 3 && <div className="more">+{items.length - 3}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="card cal tg-card">
          <TimeGrid days={mode === 'week' ? Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)) : [anchor]}
            items={filtered} onItem={openItem} onSlot={(d, time) => setEditing({ ...blank(d), time })} lang={lang} t={t} />
        </div>
      )}

      {day && !editing && (
        <Modal title={fmtDate(day, lang, { weekday: 'long', day: 'numeric', month: 'long' })} onClose={close(setDay)}>
          <ul className="list">
            {dayItems.length === 0 && <p className="muted">—</p>}
            {dayItems.map((it) => {
              const c = catOf(it.cat);
              return (
                <li key={it.id} className="row hover day-item" style={{ borderLeft: `4px solid ${c.color}` }}
                  onClick={() => { if (it.kind === 'task') { setDay(null); openTask(it.id); } else setEditing(state.events.find((x) => x.id === it.id)); }}>
                  <div className="grow">
                    <div className={`row-title${it.done ? ' struck' : ''}`}>{it.title}</div>
                    <div className="row-meta">
                      <span style={{ color: c.color }}>{it.kind === 'task' ? t('taskDeadline') : tx(c.name, lang)}</span>
                      {it.time && <span><Clock size={12} /> {it.time}{it.endTime ? `–${it.endTime}` : ''}</span>}
                      {it.reminder && <span><Bell size={12} /></span>}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <button className="btn black full" style={{ marginTop: 12 }} onClick={() => setEditing(blank(day))}><Plus size={16} /> {t('addEvent')}</button>
        </Modal>
      )}

      {editing && (
        <Modal title={editing.id ? t('editEvent') : t('newEvent')} onClose={close(setEditing)}>
          <EventForm initial={{ ...blank(editing.date), ...editing }} onDone={close(setEditing)} />
        </Modal>
      )}
    </div>
  );
}
