import { useState } from 'react';
import { CheckCircle2, Circle, Clock, ListChecks, MoreHorizontal, Plus, StickyNote, Trash2, Search } from 'lucide-react';
import { projectProgress, relDay, daysUntil, useStore, allTasks } from './store.jsx';
import { tx } from './i18n.js';
import { Bar, catOf, Modal, Pill, PRIORITY, ReminderSelect, Ring, STATUS } from './ui.jsx';

const nextStatus = { todo: 'doing', doing: 'done', done: 'todo' };

export function TaskRow({ task, onOpen }) {
  const { api, t, lang } = useStore();
  const subDone = task.subtasks.filter((s) => s.done).length;
  const d = task.deadline ? daysUntil(task.deadline) : null;
  return (
    <li className={`task-row${task.status === 'done' ? ' is-done' : ''}`} onClick={() => onOpen(task.id)}>
      <button className="check" title={t('done')} onClick={(e) => { e.stopPropagation(); api.updateTask(task.id, { status: task.status === 'done' ? 'todo' : 'done' }); }}>
        {task.status === 'done' ? <CheckCircle2 size={20} color="#2F9E6A" /> : <Circle size={20} />}
      </button>
      <div className="grow">
        <div className="row-title">{tx(task.title, lang)}</div>
        <div className="row-meta">
          {task.subtasks.length > 0 && <span><ListChecks size={12} /> {subDone}/{task.subtasks.length}</span>}
          {task.notes && <span><StickyNote size={12} /></span>}
          {task.deadline && <span className={`due ${task.status !== 'done' && d < 0 ? 'late' : task.status !== 'done' && d <= 2 ? 'soon' : ''}`}><Clock size={12} /> {relDay(task.deadline, t)}{task.time ? ` · ${task.time}` : ''}</span>}
        </div>
      </div>
      <Pill {...STATUS[task.status]} title={t('status')} onClick={(e) => { e.stopPropagation(); api.updateTask(task.id, { status: nextStatus[task.status] }); }}>{t(task.status)}</Pill>
      <Pill {...PRIORITY[task.priority]}>{t(task.priority)}</Pill>
    </li>
  );
}

export function ProjectView({ projectId, openTask }) {
  const { state, api, t, lang } = useStore();
  const p = state.projects.find((x) => x.id === projectId);
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');
  const [adding, setAdding] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newSection, setNewSection] = useState('');
  const [menu, setMenu] = useState(null);
  if (!p) return null;
  const c = catOf(p.category);
  const tasks = p.sections.flatMap((s) => s.tasks);
  const pr = projectProgress(p);
  const match = (task) => (filter === 'all' || task.status === filter) && (!q || tx(task.title, lang).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="page">
      <div className="card proj-head" style={{ background: `linear-gradient(135deg, ${c.bg}, #fff 70%)` }}>
        <Ring value={pr} size={84} stroke={8} color={c.color} />
        <div className="grow">
          <div className="muted small">PROJECT {p.key}</div>
          <h1 style={{ margin: '2px 0 4px' }}>{tx(p.name, lang)}</h1>
          <p className="muted" style={{ margin: 0 }}>{tx(p.description, lang)}</p>
          <div className="proj-counts">
            {['todo', 'doing', 'done'].map((s) => (
              <Pill key={s} {...STATUS[s]}>{t(s)} · {tasks.filter((x) => x.status === s).length}</Pill>
            ))}
          </div>
        </div>
      </div>

      <div className="toolbar">
        <div className="seg">
          {['all', 'todo', 'doing', 'done'].map((f) => (
            <button key={f} className={filter === f ? 'on' : ''} onClick={() => setFilter(f)}>{f === 'all' ? t('filterAll') : t(f)}</button>
          ))}
        </div>
        <label className="search"><Search size={15} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('search')} /></label>
      </div>

      <div className="proj-layout">
        <div className="sections">
          {p.sections.map((sec) => {
            const list = sec.tasks.filter(match);
            const sp = sec.tasks.length ? sec.tasks.filter((x) => x.status === 'done').length / sec.tasks.length : 0;
            return (
              <section className="card section" key={sec.id}>
                <div className="section-head">
                  <input className="section-title" value={tx(sec.name, lang)} onChange={(e) => api.renameSection(p.id, sec.id, e.target.value)} />
                  <span className="muted small">{sec.tasks.filter((x) => x.status === 'done').length}/{sec.tasks.length}</span>
                  <div className="menu-wrap">
                    <button className="icon-btn" onClick={() => setMenu(menu === sec.id ? null : sec.id)}><MoreHorizontal size={16} /></button>
                    {menu === sec.id && (
                      <div className="menu"><button onClick={() => { if (confirm(`${t('delete')}?`)) api.deleteSection(p.id, sec.id); setMenu(null); }}><Trash2 size={14} /> {t('delete')}</button></div>
                    )}
                  </div>
                </div>
                <Bar value={sp} color={c.color} />
                <ul className="tasks">
                  {list.map((task) => <TaskRow key={task.id} task={task} onOpen={openTask} />)}
                </ul>
                {adding === sec.id ? (
                  <form className="add-row" onSubmit={(e) => { e.preventDefault(); if (newTitle.trim()) api.addTask(p.id, sec.id, newTitle.trim()); setNewTitle(''); }}>
                    <input autoFocus value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder={t('newTaskPh')} onBlur={() => !newTitle && setAdding(null)} />
                    <button className="btn primary sm">{t('save')}</button>
                  </form>
                ) : (
                  <button className="add-link" onClick={() => setAdding(sec.id)}><Plus size={15} /> {t('addTask')}</button>
                )}
              </section>
            );
          })}
          <form className="card add-section" onSubmit={(e) => { e.preventDefault(); if (newSection.trim()) { api.addSection(p.id, newSection.trim()); setNewSection(''); } }}>
            <Plus size={16} /><input value={newSection} onChange={(e) => setNewSection(e.target.value)} placeholder={t('newSectionPh')} />
            {newSection && <button className="btn sm">{t('addSection')}</button>}
          </form>
        </div>
        <aside className="card notes-card">
          <h2><StickyNote size={16} /> {t('projectNotes')}</h2>
          <textarea value={p.notes} onChange={(e) => api.setProjectNotes(p.id, e.target.value)} placeholder={t('projectNotesPh')} rows={14} />
        </aside>
      </div>
    </div>
  );
}

export function AllProjects({ go }) {
  const { state, t, lang } = useStore();
  return (
    <div className="page">
      <header className="page-head"><h1>{t('projects')}</h1></header>
      <div className="proj-grid">
        {state.projects.map((p) => {
          const c = catOf(p.category);
          const ts = p.sections.flatMap((s) => s.tasks);
          const pr = projectProgress(p);
          return (
            <button key={p.id} className="card proj-card" onClick={() => go(`project:${p.id}`)}>
              <div className="pc-top">
                <span className="badge-key lg" style={{ background: c.color }}>{p.key}</span>
                <Ring value={pr} size={56} color={c.color} />
              </div>
              <h2>{tx(p.name, lang)}</h2>
              <p className="muted small">{tx(p.description, lang)}</p>
              <div className="proj-counts">
                {['todo', 'doing', 'done'].map((s) => <Pill key={s} {...STATUS[s]}>{t(s)} · {ts.filter((x) => x.status === s).length}</Pill>)}
              </div>
              <div className="pc-sections">
                {p.sections.map((sec) => (
                  <div key={sec.id} className="pc-sec"><span>{tx(sec.name, lang)}</span><span className="muted">{sec.tasks.filter((x) => x.status === 'done').length}/{sec.tasks.length}</span></div>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function TaskDrawer({ taskId, onClose }) {
  const { state, api, t, lang } = useStore();
  const hit = allTasks(state).find((x) => x.task.id === taskId);
  const [sub, setSub] = useState('');
  if (!hit) return null;
  const { task, project, section } = hit;
  const set = (patch) => api.updateTask(task.id, patch);
  const setSubs = (subtasks) => {
    const allDone = subtasks.length && subtasks.every((s) => s.done);
    const anyDone = subtasks.some((s) => s.done);
    const status = allDone ? 'done' : anyDone && task.status === 'todo' ? 'doing' : !allDone && task.status === 'done' ? 'doing' : task.status;
    set({ subtasks, status });
  };
  return (
    <Modal title={`${tx(project.name, lang)} · ${tx(section.name, lang)}`} onClose={onClose}>
      <input className="title-input" value={tx(task.title, lang)} onChange={(e) => set({ title: e.target.value })} />
      <div className="form-grid">
        <label>{t('status')}
          <div className="seg full">
            {['todo', 'doing', 'done'].map((s) => <button key={s} className={task.status === s ? 'on' : ''} style={task.status === s ? { color: STATUS[s].color, background: STATUS[s].bg } : {}} onClick={() => set({ status: s })}>{t(s)}</button>)}
          </div>
        </label>
        <label>{t('priority')}
          <div className="seg full">
            {['high', 'medium', 'low'].map((s) => <button key={s} className={task.priority === s ? 'on' : ''} style={task.priority === s ? { color: PRIORITY[s].color, background: PRIORITY[s].bg } : {}} onClick={() => set({ priority: s })}>{t(s)}</button>)}
          </div>
        </label>
        <label>{t('deadline')}<input type="date" value={task.deadline} onChange={(e) => set({ deadline: e.target.value })} /></label>
        <label>{t('time')}<input type="time" value={task.time} onChange={(e) => set({ time: e.target.value })} /></label>
        <label className="span2">{t('reminder')}<ReminderSelect value={task.reminder} onChange={(v) => set({ reminder: v })} t={t} /></label>
      </div>

      <h4>{t('subtasks')} {task.subtasks.length > 0 && <span className="muted small">{task.subtasks.filter((s) => s.done).length}/{task.subtasks.length}</span>}</h4>
      <ul className="subs">
        {task.subtasks.map((s, i) => (
          <li key={s.id}>
            <input type="checkbox" checked={s.done} onChange={() => setSubs(task.subtasks.map((x, j) => (j === i ? { ...x, done: !x.done } : x)))} />
            <input className={`sub-input${s.done ? ' struck' : ''}`} value={s.title} onChange={(e) => setSubs(task.subtasks.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} />
            <button className="icon-btn" onClick={() => setSubs(task.subtasks.filter((_, j) => j !== i))}><Trash2 size={14} /></button>
          </li>
        ))}
      </ul>
      <form className="add-row" onSubmit={(e) => { e.preventDefault(); if (sub.trim()) { setSubs([...task.subtasks, { id: `st_${Date.now()}`, title: sub.trim(), done: false }]); setSub(''); } }}>
        <input value={sub} onChange={(e) => setSub(e.target.value)} placeholder={t('addSubtask')} />
        <button className="btn sm"><Plus size={14} /></button>
      </form>

      <h4>{t('notes')}</h4>
      <textarea rows={5} value={task.notes} onChange={(e) => set({ notes: e.target.value })} placeholder={t('projectNotesPh')} />

      <div className="modal-foot">
        <button className="btn danger ghost" onClick={() => { if (confirm(`${t('delete')}?`)) { api.deleteTask(task.id); onClose(); } }}><Trash2 size={15} /> {t('delete')}</button>
        <span className="muted small">{task.gcalId ? '✓ Google Calendar' : ''}</span>
        <button className="btn primary" onClick={onClose}>{t('close')}</button>
      </div>
    </Modal>
  );
}
