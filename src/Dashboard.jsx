import { useState } from 'react';
import { ChevronLeft, ChevronRight, Circle, Clock, Plus, ArrowUpRight, Flag } from 'lucide-react';
import { addDays, allTasks, daysUntil, fmtDate, projectProgress, relDay, taskProgress, toDateStr, todayStr, useStore } from './store.jsx';
import { tx } from './i18n.js';
import { catOf, Pill, PRIORITY } from './ui.jsx';
import { itemsByDate } from './Calendar.jsx';

function Shape({ kind, color }) {
  const common = { position: 'absolute', right: -10, top: -10, width: 150, height: 150, opacity: 0.55 };
  if (kind === 'plus') return <svg viewBox="0 0 100 100" style={common}><path d="M38 5h24v33h33v24H62v33H38V62H5V38h33z" fill={color} transform="rotate(18 50 50)" /></svg>;
  if (kind === 'heart') return <svg viewBox="0 0 100 100" style={common}><path d="M50 88 12 50C-2 34 8 8 30 10c10 1 16 8 20 14 4-6 10-13 20-14 22-2 32 24 18 40z" fill={color} /></svg>;
  if (kind === 'tri') return <svg viewBox="0 0 100 100" style={{ ...common, top: 30, right: -5 }}><path d="M5 10h90L50 95z" fill={color} /></svg>;
  return <svg viewBox="0 0 100 100" style={{ ...common, top: 20 }}><path d="M50 2l9 25 25-12-10 26 26 9-26 9 10 26-25-12-9 25-9-25-25 12 10-26-26-9 26-9-10-26 25 12z" fill={color} /></svg>;
}

function MiniCalendar({ map, onPick }) {
  const { lang } = useStore();
  const [cursor, setCursor] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const offset = (cursor.getDay() + 6) % 7;
  const start = new Date(cursor); start.setDate(1 - offset);
  const cells = Array.from({ length: 42 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
  const today = todayStr();
  const wd = Array.from({ length: 7 }, (_, i) => new Date(2024, 0, 1 + i).toLocaleDateString(lang === 'en' ? 'en-GB' : 'id-ID', { weekday: 'short' }).slice(0, 2));
  const mv = (n) => setCursor((c) => { const d = new Date(c); d.setMonth(d.getMonth() + n); return d; });
  return (
    <div className="minical">
      <div className="mc-head">
        <button className="icon-btn" onClick={() => mv(-1)}><ChevronLeft size={18} /></button>
        <span className="pink-pill">{cursor.toLocaleDateString(lang === 'en' ? 'en-GB' : 'id-ID', { month: 'long', year: 'numeric' })}</span>
        <button className="icon-btn" onClick={() => mv(1)}><ChevronRight size={18} /></button>
      </div>
      <div className="mc-grid">
        {wd.map((w, i) => <div key={i} className="mc-wd">{w}</div>)}
        {cells.map((d) => {
          const ds = toDateStr(d);
          const items = map[ds] || [];
          const other = d.getMonth() !== cursor.getMonth();
          return (
            <button key={ds} className={`mc-day${ds === today ? ' today' : ''}${other ? ' other' : ''}`} onClick={() => onPick(ds)}>
              {d.getDate()}
              {items.length > 0 && <span className="mc-dots">{items.slice(0, 3).map((it, i) => <i key={i} style={{ background: catOf(it.cat).color }} />)}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function Dashboard({ openTask, go, openDay }) {
  const { state, api, t, lang } = useStore();
  const items = allTasks(state);
  const total = items.length;
  const done = items.filter((x) => x.task.status === 'done').length;
  const doing = items.filter((x) => x.task.status === 'doing').length;
  const pending = total - done - doing;
  const overall = total ? items.reduce((a, x) => a + taskProgress(x.task), 0) / total : 0;
  const today = todayStr();
  const map = itemsByDate(state, lang);

  const open = items.filter((x) => x.task.status !== 'done');
  const prioRank = { high: 0, medium: 1, low: 2 };
  const priorities = open
    .filter((x) => (x.task.deadline && daysUntil(x.task.deadline) <= 1) || x.task.status === 'doing' || x.task.priority === 'high')
    .sort((a, b) => {
      const da = a.task.deadline ? daysUntil(a.task.deadline) : 99;
      const db = b.task.deadline ? daysUntil(b.task.deadline) : 99;
      return Math.min(da, 2) - Math.min(db, 2) || prioRank[a.task.priority] - prioRank[b.task.priority] || da - db;
    })
    .slice(0, 5);

  const upcoming = [
    ...open.filter((x) => x.task.deadline).map((x) => ({ date: x.task.deadline, title: tx(x.task.title, lang), cat: x.project.category, x })),
    ...state.events.filter((e) => e.isDeadline && e.date >= today).map((e) => ({ date: e.date, title: e.title, cat: 'deadline' })),
  ].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);

  const todayItems = (map[today] || []);
  const timed = todayItems.filter((x) => x.time);
  const untimed = todayItems.filter((x) => !x.time);
  const nowStr = new Date().toTimeString().slice(0, 5);

  const weekEnd = addDays(today, 7);
  const postsWeek = state.content.posts.filter((p) => p.postDate >= today && p.postDate <= weekEnd);
  const ideasWaiting = state.content.ideas.length;
  const dueWeek = open.filter((x) => x.task.deadline && x.task.deadline <= weekEnd);
  const overdue = open.filter((x) => x.task.deadline && x.task.deadline < today);

  const h = new Date().getHours();
  const greet = h < 11 ? t('goodMorning') : h < 15 ? (lang === 'en' ? 'Good afternoon' : 'Selamat siang') : h < 18 ? (lang === 'en' ? 'Good afternoon' : 'Selamat sore') : t('goodEvening');
  const maxP = Math.max(1, ...state.projects.map((p) => p.sections.flatMap((s) => s.tasks).length));

  return (
    <div className="page dash">
      <div className="dash-main">
        <header className="dash-head">
          <h1 className="hello">{greet}, Monika</h1>
          <p className="muted">
            {lang === 'en'
              ? `${fmtDate(today, lang, { weekday: 'long', day: 'numeric', month: 'long' })}. You have ${priorities.length} priorities and ${todayItems.length} items on your calendar today.`
              : `${fmtDate(today, lang, { weekday: 'long', day: 'numeric', month: 'long' })}. Hari ini ada ${priorities.length} prioritas dan ${todayItems.length} jadwal di kalender kamu.`}
          </p>
        </header>

        <div className="pastel-grid">
          <button className="pcard yellow" onClick={() => go('projects')}>
            <Shape kind="plus" color="#EFC93F" />
            <h3>{t('totalTasks')}:</h3>
            <div className="pc-stats">
              <div><b>{total}</b><span>TOTAL</span></div>
              <div><b>{done}</b><span>{t('completed').toUpperCase()}</span></div>
              <div><b>{doing}</b><span>{t('inProgress').toUpperCase()}</span></div>
              <div><b>{pending}</b><span>{t('pending').toUpperCase()}</span></div>
            </div>
            <div className="bars">
              {state.projects.map((p) => {
                const ts = p.sections.flatMap((s) => s.tasks);
                const d = ts.filter((x) => x.status === 'done').length;
                return (
                  <div key={p.id} className="bar-col">
                    <div className="bar-stack" style={{ height: `${(ts.length / maxP) * 100}%` }}>
                      <div className="bar-done" style={{ height: `${ts.length ? (d / ts.length) * 100 : 0}%` }} />
                    </div>
                    <span>{p.key}</span>
                  </div>
                );
              })}
            </div>
          </button>

          <div className="pcard pink">
            <Shape kind="heart" color="#EC8FC0" />
            <h3>{t('overall')}:</h3>
            <div className="big-pct">{Math.round(overall * 100)}<small>%</small></div>
            <div className="proj-lines">
              {state.projects.map((p) => {
                const pr = projectProgress(p);
                return (
                  <button key={p.id} className="pl" onClick={() => go(`project:${p.id}`)}>
                    <span className="pl-name">{tx(p.name, lang)}</span>
                    <span className="pl-track"><i style={{ width: `${pr * 100}%` }} /></span>
                    <b>{Math.round(pr * 100)}%</b>
                  </button>
                );
              })}
            </div>
          </div>

          <button className="pcard sage" onClick={() => go('calendar')}>
            <Shape kind="tri" color="#8A9C5B" />
            <h3>{t('deadline')}:</h3>
            <div className="pc-stats">
              <div><b>{overdue.length}</b><span>{t('overdue').toUpperCase()}</span></div>
              <div><b>{dueWeek.length}</b><span>{lang === 'en' ? 'THIS WEEK' : 'MINGGU INI'}</span></div>
              <div><b>{todayItems.length}</b><span>{t('today').toUpperCase()}</span></div>
            </div>
          </button>

          <button className="pcard blue" onClick={() => go('content')}>
            <Shape kind="star" color="#8FA6DE" />
            <h3>{lang === 'en' ? 'Content' : 'Konten'}:</h3>
            <div className="pc-stats">
              <div><b>{postsWeek.length}</b><span>{lang === 'en' ? 'POSTS THIS WEEK' : 'POST MINGGU INI'}</span></div>
              <div><b>{ideasWaiting}</b><span>{lang === 'en' ? 'IDEAS IN INBOX' : 'IDE DI INBOX'}</span></div>
            </div>
          </button>
        </div>

        <div className="dash-lists">
          <section>
            <div className="sec-head"><h2>{t('todayPriorities')}</h2><span className="black-pill">{priorities.length}</span></div>
            {priorities.length === 0 && <p className="muted">{t('nothingToday')}</p>}
            <ul className="soft-list">
              {priorities.map(({ task, project }, i) => {
                const c = catOf(project.category);
                return (
                  <li key={task.id} className={i === 0 ? 'first' : ''} style={i === 0 ? { background: c.bg } : {}} onClick={() => openTask(task.id)}>
                    <button className="round-ic" style={{ background: c.bg, color: c.color }} onClick={(e) => { e.stopPropagation(); api.updateTask(task.id, { status: 'done' }); }} title={t('done')}>
                      <Circle size={16} />
                    </button>
                    <div className="grow">
                      <div className="row-title">{tx(task.title, lang)}</div>
                      <div className="row-meta">{tx(project.name, lang)}</div>
                    </div>
                    {task.deadline ? <span className="time-chip" style={{ background: c.bg, color: c.color }}>{relDay(task.deadline, t)}</span> : <Pill {...PRIORITY[task.priority]}>{t(task.priority)}</Pill>}
                  </li>
                );
              })}
            </ul>
          </section>
          <section>
            <div className="sec-head"><h2>{t('upcoming')}</h2></div>
            {upcoming.length === 0 && <p className="muted">{t('noDeadlines')}</p>}
            <ul className="soft-list">
              {upcoming.map((u, i) => {
                const c = catOf(u.cat);
                const d = daysUntil(u.date);
                return (
                  <li key={i} onClick={() => (u.x ? openTask(u.x.task.id) : go('calendar'))}>
                    <div className="date-chip" style={{ background: c.bg, color: c.color }}>
                      <b>{new Date(u.date + 'T00:00').getDate()}</b><span>{fmtDate(u.date, lang, { month: 'short' })}</span>
                    </div>
                    <div className="grow">
                      <div className="row-title">{u.title}</div>
                      <div className="row-meta">{u.x ? tx(u.x.project.name, lang) : t('deadline')}</div>
                    </div>
                    <span className={`due ${d < 0 ? 'late' : d <= 2 ? 'soon' : ''}`}>{relDay(u.date, t)}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        <section className="recent">
          <div className="sec-head"><h2>{t('recent')}</h2></div>
          <ul className="timeline">
            {state.activity.slice(0, 6).map((a) => (
              <li key={a.id}><span className="tl-dot" /><div><div>{tx(a.text, lang)}</div>
                <div className="muted small">{new Date(a.ts).toLocaleString(lang === 'en' ? 'en-GB' : 'id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div></div></li>
            ))}
          </ul>
        </section>
      </div>

      <aside className="dash-rail">
        <MiniCalendar map={map} onPick={(d) => openDay(d)} />
        <div className="rail-actions">
          <button className="btn black grow" onClick={() => openDay(today, true)}><Plus size={16} /> {t('addEvent')}</button>
          <button className="icon-btn bordered" onClick={() => go('calendar')} title={t('calendar')}><ArrowUpRight size={17} /></button>
        </div>
        <div className="tl-head">
          <h2>{fmtDate(today, lang, { day: 'numeric', month: 'long' })}</h2>
          <span className="muted small">{t('todaySchedule')}</span>
        </div>
        <div className="today-tl">
          {untimed.map((it) => {
            const c = catOf(it.cat);
            return (
              <div key={it.id} className="tl-card" style={{ background: c.bg }} onClick={() => (it.kind === 'task' ? openTask(it.id) : openDay(today))}>
                <span className="round-ic" style={{ background: '#fff', color: c.color }}><Flag size={14} /></span>
                <div className="grow"><b className={it.done ? 'struck' : ''}>{it.title}</b><div className="muted tiny">{t('allDay')}</div></div>
              </div>
            );
          })}
          {timed.map((it, i) => {
            const c = catOf(it.cat);
            const showNow = nowStr >= (timed[i - 1]?.time || '00:00') && nowStr < it.time;
            return (
              <div key={it.id}>
                {showNow && <div className="now-line"><span>{nowStr}</span></div>}
                <div className="tl-row">
                  <span className="tl-time">{it.time}</span>
                  <div className={`tl-card${it.time < nowStr ? ' past' : ''}`} style={{ background: c.bg }} onClick={() => (it.kind === 'task' ? openTask(it.id) : openDay(today))}>
                    <span className="round-ic" style={{ background: '#fff', color: c.color }}><Clock size={14} /></span>
                    <div className="grow"><b>{it.title}</b><div className="muted tiny">{tx(c.name, lang)}</div></div>
                  </div>
                </div>
              </div>
            );
          })}
          {todayItems.length === 0 && <p className="muted small">{lang === 'en' ? 'Nothing scheduled today.' : 'Belum ada jadwal hari ini.'}</p>}
        </div>
        <button className="btn black full" onClick={() => go('calendar')}>{lang === 'en' ? 'Open full calendar' : 'Buka kalender lengkap'}</button>
      </aside>
    </div>
  );
}
