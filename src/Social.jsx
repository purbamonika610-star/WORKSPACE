// Social media hub: KPIs, trend research (refreshed daily), pillar mix, growth log, weekly system.
import { useEffect, useRef, useState } from 'react';
import { Flame, RefreshCw, TrendingUp, CalendarCheck, Lightbulb, Target, Users, Sparkles, ExternalLink, Plus, ListChecks, Workflow } from 'lucide-react';
import { addDays, fmtDate, todayStr, toDateStr, useStore } from './store.jsx';
import { aiTrends, EVERGREEN_TRENDS } from './ai.js';
import { uid } from './seed.js';

const INK = '#17161B';
const ACCENT = '#C2397F';

function weekStart(ds) { const d = new Date(ds + 'T00:00'); return addDays(ds, -((d.getDay() + 6) % 7)); }

function Kpi({ icon: Icon, label, value, sub, tone }) {
  return (
    <div className="kpi">
      <div className="kpi-ic" style={{ background: tone }}><Icon size={20} /></div>
      <div><div className="muted small">{label}</div><div className="kpi-v">{value}</div>{sub && <div className="muted tiny">{sub}</div>}</div>
    </div>
  );
}

function WeekBars({ data, lang }) {
  const [hover, setHover] = useState(null);
  const max = Math.max(3, ...data.map((d) => d.n));
  const W = 420, H = 170, pad = 26, bw = (W - pad) / data.length;
  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${W} ${H + 24}`} className="chart">
        {[0, Math.ceil(max / 2), max].map((v) => (
          <g key={v}><line x1={pad} x2={W} y1={H - (v / max) * (H - 10)} y2={H - (v / max) * (H - 10)} stroke="#EEEEF2" /><text x={pad - 6} y={H - (v / max) * (H - 10) + 4} textAnchor="end" className="ax">{v}</text></g>
        ))}
        {data.map((d, i) => {
          const h = (d.n / max) * (H - 10);
          const x = pad + i * bw + bw * 0.28;
          const w = bw * 0.44;
          return (
            <g key={d.week} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <rect x={pad + i * bw} y={0} width={bw} height={H} fill="transparent" />
              {d.n > 0 && <path d={`M${x},${H} v${-(h - 4)} q0,-4 4,-4 h${w - 8} q4,0 4,4 v${h - 4} z`} fill={d.future ? '#F3B5D6' : INK} />}
              <text x={pad + i * bw + bw / 2} y={H + 16} textAnchor="middle" className={`ax${d.current ? ' cur' : ''}`}>{fmtDate(d.week, lang)}</text>
            </g>
          );
        })}
        <line x1={pad} x2={W} y1={H} y2={H} stroke="#D9D9E0" />
      </svg>
      {hover != null && (
        <div className="tip" style={{ left: `${((pad + hover * bw + bw / 2) / W) * 100}%` }}>
          <b>{data[hover].n}</b> {lang === 'en' ? 'posts' : 'post'} · {lang === 'en' ? 'week of' : 'minggu'} {fmtDate(data[hover].week, lang)}
        </div>
      )}
      <div className="chart-key"><span><i style={{ background: INK }} />{lang === 'en' ? 'Posted / past' : 'Sudah lewat'}</span><span><i style={{ background: '#F3B5D6' }} />{lang === 'en' ? 'Planned' : 'Direncanakan'}</span></div>
    </div>
  );
}

function GrowthLine({ rows, lang }) {
  const [hover, setHover] = useState(null);
  if (rows.length < 2) return <p className="muted small">{lang === 'en' ? 'Log your followers at least twice to see the trend line.' : 'Catat jumlah followers minimal 2 kali untuk melihat grafiknya.'}</p>;
  const W = 420, H = 150, pad = 40;
  const vals = rows.map((r) => r.followers);
  const min = Math.min(...vals), max = Math.max(...vals);
  const span = Math.max(1, max - min);
  const x = (i) => pad + (i / (rows.length - 1)) * (W - pad - 10);
  const y = (v) => 10 + (1 - (v - min) / span) * (H - 20);
  const d = rows.map((r, i) => `${i ? 'L' : 'M'}${x(i)},${y(r.followers)}`).join(' ');
  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${W} ${H + 22}`} className="chart" onMouseLeave={() => setHover(null)}>
        {[min, max].map((v) => <g key={v}><line x1={pad} x2={W} y1={y(v)} y2={y(v)} stroke="#EEEEF2" /><text x={pad - 6} y={y(v) + 4} textAnchor="end" className="ax">{v}</text></g>)}
        <path d={`${d} L${x(rows.length - 1)},${H} L${x(0)},${H} Z`} fill="#F3B5D6" opacity=".3" />
        <path d={d} fill="none" stroke={ACCENT} strokeWidth="2" />
        {rows.map((r, i) => (
          <g key={r.id} onMouseEnter={() => setHover(i)}>
            <rect x={x(i) - 14} y={0} width={28} height={H} fill="transparent" />
            {(hover === i || i === rows.length - 1) && <circle cx={x(i)} cy={y(r.followers)} r="4.5" fill="#fff" stroke={ACCENT} strokeWidth="2" />}
            {(i === 0 || i === rows.length - 1) && <text x={x(i)} y={H + 16} textAnchor="middle" className="ax">{fmtDate(r.date, lang)}</text>}
          </g>
        ))}
        {hover != null && <line x1={x(hover)} x2={x(hover)} y1={0} y2={H} stroke="#C9C8D1" strokeDasharray="3 3" />}
      </svg>
      {hover != null && (
        <div className="tip" style={{ left: `${(x(hover) / W) * 100}%` }}>
          {fmtDate(rows[hover].date, lang)} · <b>{rows[hover].followers}</b> followers{rows[hover].reach ? ` · reach ${rows[hover].reach}` : ''}{rows[hover].er ? ` · ER ${rows[hover].er}%` : ''}
        </div>
      )}
    </div>
  );
}

const ROUTINE = [
  [1, '09:00', '10:00', { en: '💡 Pick topics from Content Inbox + check trends', id: '💡 Pilih topik dari Inbox Konten + cek tren' }],
  [2, '10:00', '11:30', { en: '✍️ Finalise scripts & captions for the week', id: '✍️ Finalisasi script & caption minggu ini' }],
  [3, '10:00', '12:30', { en: '🎨 Design carousels manually in Canva', id: '🎨 Desain carousel manual di Canva' }],
  [4, '14:00', '16:00', { en: '🎬 Edit Reels with my sister', id: '🎬 Edit Reels bersama kakak/adik' }],
  [5, '18:30', '19:30', { en: '💬 Post + reply to comments & DMs (golden hour)', id: '💬 Posting + balas komentar & DM (golden hour)' }],
  [0, '16:00', '16:45', { en: '📊 Weekly review: log followers, reach, what worked', id: '📊 Review mingguan: catat followers, reach, apa yang berhasil' }],
];

export default function SocialHub({ brand, brandName, posts, goInbox }) {
  const { state, api, lang } = useStore();
  const today = todayStr();
  const s = state.settings;
  const tr = state.content.trends?.[brand];
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [m, setM] = useState({ followers: '', reach: '', er: '' });
  const tried = useRef({});

  const research = async () => {
    if (!s.anthropicKey || busy) return;
    setBusy(true); setErr('');
    try {
      const out = await aiTrends({ apiKey: s.anthropicKey, strategy: s.strategies[brand], lang: s.contentLang, brandName, today });
      api.update((st) => {
        st.content.trends = { ...(st.content.trends || {}), [brand]: { date: today, ts: Date.now(), focus: out.weekly_focus, items: out.trends || [] } };
        const existing = new Set(st.content.ideas.map((i) => i.title));
        st.content.ideas.unshift(...(out.ideas || []).filter((i) => !existing.has(i.title)).map((i) => ({ ...i, id: uid('i'), brand, trend: true, date: today })));
        st.activity.unshift({ id: uid('a'), ts: Date.now(), text: { en: `Daily trend research done for ${brandName}`, id: `Riset tren harian selesai untuk ${brandName}` } });
        return st;
      });
    } catch (e) { setErr(e.message || String(e)); }
    setBusy(false);
  };

  // refresh automatically once a day
  useEffect(() => {
    if (s.anthropicKey && tr?.date !== today && !tried.current[brand]) { tried.current[brand] = true; research(); }
  }, [brand, s.anthropicKey]); // eslint-disable-line

  const trends = tr?.items?.length ? tr.items : EVERGREEN_TRENDS;
  const month = today.slice(0, 7);
  const posted = posts.filter((p) => p.postDate <= today && p.postDate?.startsWith(month)).length;
  const planned = posts.filter((p) => p.postDate > today).length;
  const ideas = state.content.ideas.filter((i) => i.brand === brand);
  const readyScripts = posts.filter((p) => p.carousel && p.postDate >= today).length;

  // consistency: last 4 weeks posting-day slots filled
  let slots = 0, filled = 0;
  const postDays = new Set(posts.map((p) => p.postDate));
  for (let i = 1; i <= 28; i++) {
    const d = addDays(today, -i);
    if (s.postingDays.includes(new Date(d + 'T00:00').getDay())) { slots++; if (postDays.has(d)) filled++; }
  }
  const consistency = slots ? Math.round((filled / slots) * 100) : 0;

  const metrics = (state.content.metrics || []).filter((r) => r.brand === brand).sort((a, b) => a.date.localeCompare(b.date));
  const lastF = metrics.at(-1)?.followers;
  const prevF = metrics.at(-2)?.followers;

  const ws = weekStart(today);
  const weeks = Array.from({ length: 8 }, (_, i) => {
    const w = addDays(ws, (i - 4) * 7);
    const n = posts.filter((p) => p.postDate >= w && p.postDate < addDays(w, 7)).length;
    return { week: w, n, future: w > ws, current: w === ws };
  });

  // pillar mix vs strategy targets
  const targets = [...(s.strategies[brand] || '').matchAll(/\d\.\s*([^—(\n]+?)\s*\((\d+)%\)/g)].map((x) => ({ name: x[1].trim(), target: Number(x[2]) }));
  const pillarCount = {};
  posts.forEach((p) => { const k = p.topic.pillar || '—'; pillarCount[k] = (pillarCount[k] || 0) + 1; });
  const totalP = posts.length || 1;
  const pillarRows = (targets.length ? targets : Object.keys(pillarCount).map((n) => ({ name: n, target: null }))).map((tg) => {
    const key = Object.keys(pillarCount).find((k) => k.toLowerCase().includes(tg.name.toLowerCase().split(' ')[0]) || tg.name.toLowerCase().includes(k.toLowerCase().split(' ')[0]));
    return { ...tg, actual: Math.round(((key ? pillarCount[key] : 0) / totalP) * 100) };
  });

  const todayTasks = state.events.filter((e) => e.date === today && (e.postId || e.reelsSession || e.routine));

  const addRoutine = () => api.update((st) => {
    for (let w = 0; w < 4; w++) {
      for (const [dow, time, endTime, title] of ROUTINE) {
        let d = addDays(today, w * 7);
        for (let k = 0; k < 7 && new Date(d + 'T00:00').getDay() !== dow; k++) d = addDays(d, 1);
        if (d < today || st.events.some((e) => e.routine && e.date === d && e.time === time)) continue;
        st.events.push({ id: uid('e'), routine: brand, title: `${title[lang]} · ${brandName}`, date: d, time, endTime, reminder: '30', category: 'content', notes: '', isDeadline: false, updatedAt: Date.now() });
      }
    }
    return st;
  });

  return (
    <div className="hub">
      <div className="kpis">
        <Kpi icon={CalendarCheck} label={lang === 'en' ? 'Posted this month' : 'Posting bulan ini'} value={posted} tone="#F8E08E" />
        <Kpi icon={TrendingUp} label={lang === 'en' ? 'Planned posts' : 'Post terjadwal'} value={planned} sub={`${readyScripts} ${lang === 'en' ? 'scripts ready' : 'script siap'}`} tone="#F6C2DD" />
        <Kpi icon={Lightbulb} label={lang === 'en' ? 'Ideas in inbox' : 'Ide di inbox'} value={ideas.length} sub={ideas.filter((i) => i.trend).length ? `${ideas.filter((i) => i.trend).length} ${lang === 'en' ? 'from trends' : 'dari tren'}` : ''} tone="#BFCDF0" />
        <Kpi icon={Target} label={lang === 'en' ? 'Consistency (4 wks)' : 'Konsistensi (4 mgg)'} value={`${consistency}%`} sub={`${filled}/${slots} ${lang === 'en' ? 'posting days' : 'hari posting'}`} tone="#B9C78F" />
        <Kpi icon={Users} label="Followers" value={lastF ?? '—'} sub={lastF != null && prevF != null ? `${lastF - prevF >= 0 ? '▲' : '▼'} ${Math.abs(lastF - prevF)} ${lang === 'en' ? 'since last log' : 'sejak catatan lalu'}` : ''} tone="#F3E3D3" />
      </div>

      {tr?.focus && <div className="focus-banner"><Sparkles size={18} /><div><b>{lang === 'en' ? 'This week’s focus' : 'Fokus minggu ini'}:</b> {tr.focus}</div></div>}

      <div className="hub-grid">
        <section className="card hub-trends">
          <div className="sec-head">
            <h2><Flame size={17} /> {lang === 'en' ? 'Trending now' : 'Sedang tren'}</h2>
            <button className="btn sm" onClick={research} disabled={!s.anthropicKey || busy}><RefreshCw size={14} className={busy ? 'spin' : ''} /> {busy ? (lang === 'en' ? 'Researching…' : 'Sedang riset…') : (lang === 'en' ? 'Research now' : 'Riset sekarang')}</button>
          </div>
          <p className="muted tiny" style={{ marginTop: -4 }}>
            {tr?.date ? `${lang === 'en' ? 'Live research from' : 'Riset langsung tanggal'} ${fmtDate(tr.date, lang, { day: 'numeric', month: 'long' })} · ${lang === 'en' ? 'refreshes automatically every day you open the app' : 'otomatis diperbarui setiap hari saat app dibuka'}`
              : s.anthropicKey ? (lang === 'en' ? 'Starting today’s research…' : 'Memulai riset hari ini…')
                : (lang === 'en' ? 'Showing evergreen formats. Add your Anthropic API key in Settings for live daily trend research.' : 'Menampilkan format evergreen. Tambahkan Anthropic API key di Pengaturan untuk riset tren harian otomatis.')}
          </p>
          {err && <div className="alert">{err}</div>}
          <ol className="trend-list">
            {trends.map((x, i) => (
              <li key={i}>
                <span className="rank">{i + 1}</span>
                <div className="grow">
                  <div className="row-gap" style={{ justifyContent: 'space-between' }}>
                    <b>{x.name}</b>
                    <span className="heat" title={`${x.heat}/5`}>{Array.from({ length: 5 }, (_, k) => <i key={k} className={k < (x.heat || 3) ? 'on' : ''} />)}</span>
                  </div>
                  <div className="small">{x.what}</div>
                  <div className="muted small"><b>{lang === 'en' ? 'Why now' : 'Kenapa sekarang'}:</b> {x.why_now}</div>
                  <div className="small how"><b>{lang === 'en' ? 'How we use it' : 'Cara kita pakai'}:</b> {x.how_to_use}</div>
                  <div className="row-gap" style={{ marginTop: 4 }}>
                    <span className="fmt-chip">{x.format}</span>
                    {x.source && /^https?:/.test(x.source) && <a className="tiny" href={x.source} target="_blank" rel="noreferrer">source <ExternalLink size={11} /></a>}
                  </div>
                </div>
              </li>
            ))}
          </ol>
          <button className="btn black full" onClick={goInbox}><Lightbulb size={15} /> {lang === 'en' ? 'Open idea inbox' : 'Buka inbox ide'}</button>
        </section>

        <div className="hub-col">
          <section className="card">
            <div className="sec-head"><h2>{lang === 'en' ? 'Posts per week' : 'Post per minggu'}</h2></div>
            <WeekBars data={weeks} lang={lang} />
          </section>
          <section className="card">
            <div className="sec-head"><h2>{lang === 'en' ? 'Pillar mix vs strategy' : 'Komposisi pilar vs strategi'}</h2></div>
            {pillarRows.length === 0 && <p className="muted small">—</p>}
            <div className="pillars">
              {pillarRows.map((r) => (
                <div key={r.name} className="pillar-row">
                  <span className="pr-name">{r.name}</span>
                  <span className="pr-track">
                    <i style={{ width: `${r.actual}%` }} />
                    {r.target != null && <em style={{ left: `${r.target}%` }} title={`target ${r.target}%`} />}
                  </span>
                  <span className="pr-val">{r.actual}%{r.target != null && <span className="muted"> / {r.target}%</span>}</span>
                </div>
              ))}
            </div>
            <p className="muted tiny">{lang === 'en' ? 'Bar = your planned & posted content. Line = target from your strategy.' : 'Batang = konten yang direncanakan & diposting. Garis = target dari strategi.'}</p>
          </section>
        </div>
      </div>

      <div className="hub-grid three">
        <section className="card">
          <div className="sec-head"><h2><ListChecks size={17} /> {lang === 'en' ? 'Today’s content work' : 'Tugas konten hari ini'}</h2></div>
          {todayTasks.length === 0 && <p className="muted small">{lang === 'en' ? 'Nothing scheduled today. Pick an idea or add the weekly routine.' : 'Belum ada jadwal konten hari ini. Pilih ide atau tambahkan rutinitas mingguan.'}</p>}
          <ul className="soft-list">
            {todayTasks.map((e) => <li key={e.id}><span className="time-chip">{e.time || '—'}</span><span className="grow small">{e.title}</span></li>)}
          </ul>
        </section>

        <section className="card">
          <div className="sec-head"><h2><Workflow size={17} /> {lang === 'en' ? 'Weekly system' : 'Sistem mingguan'}</h2></div>
          <ul className="routine">
            {ROUTINE.map(([dow, time, , title]) => (
              <li key={dow}><span className="rt-day">{new Date(2024, 0, dow === 0 ? 7 : dow).toLocaleDateString(lang === 'en' ? 'en-GB' : 'id-ID', { weekday: 'short' })}</span><span className="muted tiny">{time}</span><span className="small grow">{title[lang]}</span></li>
            ))}
          </ul>
          <button className="btn full" onClick={addRoutine}><Plus size={15} /> {lang === 'en' ? 'Put this routine in my calendar (4 weeks)' : 'Masukkan rutinitas ini ke kalender (4 minggu)'}</button>
        </section>

        <section className="card">
          <div className="sec-head"><h2><Users size={17} /> {lang === 'en' ? 'Growth log' : 'Catatan pertumbuhan'}</h2></div>
          <GrowthLine rows={metrics} lang={lang} />
          <form className="metric-form" onSubmit={(e) => {
            e.preventDefault();
            if (!m.followers) return;
            api.update((st) => { st.content.metrics = [...(st.content.metrics || []), { id: uid('m'), brand, date: today, followers: Number(m.followers), reach: Number(m.reach) || 0, er: Number(m.er) || 0 }]; return st; });
            setM({ followers: '', reach: '', er: '' });
          }}>
            <input type="number" placeholder="Followers" value={m.followers} onChange={(e) => setM({ ...m, followers: e.target.value })} />
            <input type="number" placeholder="Reach" value={m.reach} onChange={(e) => setM({ ...m, reach: e.target.value })} />
            <input type="number" step="0.1" placeholder="ER %" value={m.er} onChange={(e) => setM({ ...m, er: e.target.value })} />
            <button className="btn black sm"><Plus size={14} /></button>
          </form>
        </section>
      </div>
    </div>
  );
}

export { toDateStr };
