import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, ChevronLeft, ChevronRight, Copy, ImagePlus, Inbox, LayoutGrid, Loader2, RefreshCw, Sparkles, ThumbsDown, Trash2, Wand2, CalendarClock, Clapperboard, Heart } from 'lucide-react';
import { addDays, fmtDate, todayStr, useStore } from './store.jsx';
import { aiCarousel, aiTopics, templateCarousel, templateTopics } from './ai.js';
import { uid } from './seed.js';
import { delImg, imgUrl, putImg } from './imgdb.js';
import { Modal, Pill } from './ui.jsx';
import SocialHub from './Social.jsx';
import Feed, { SlideArt, palFor } from './Feed.jsx';

const BRANDS = {
  elevara: { name: 'Elevara', handle: 'elevara.agency', cat: 'elevara' },
  sister: { name: { en: "Sister's business", id: 'Bisnis kakak/adik' }, handle: 'sister.bali', cat: 'sister' },
  personal: { name: { en: 'Personal brand', id: 'Personal brand' }, handle: 'monika', cat: 'personal' },
};
const bname = (b, lang) => (typeof BRANDS[b].name === 'string' ? BRANDS[b].name : BRANDS[b].name[lang]);
const STATUSES = [
  ['draft', 'stDraft', '#8B6FE0', '#F1ECFD'],
  ['design', 'stDesign', '#C98A1B', '#FBF3E0'],
  ['ready', 'stReady', '#4C7EE8', '#EAF1FE'],
  ['posted', 'stPosted', '#2F9E6A', '#E4F5EC'],
];
const stInfo = (s) => STATUSES.find((x) => x[0] === s) || STATUSES[0];

function useAsync() {
  const [busy, setBusy] = useState({});
  const run = async (key, fn) => {
    setBusy((b) => ({ ...b, [key]: true }));
    try { return await fn(); } finally { setBusy((b) => { const n = { ...b }; delete n[key]; return n; }); }
  };
  return [busy, run];
}

// Pick the next free posting day and plan design + edit sessions before it.
function planDates(state, brand) {
  const { postingDays, postingTime } = state.settings;
  const taken = new Set(state.content.posts.filter((p) => p.brand === brand).map((p) => p.postDate));
  let d = addDays(todayStr(), 2);
  for (let i = 0; i < 90; i++, d = addDays(d, 1)) {
    const wd = new Date(d + 'T00:00').getDay();
    if (postingDays.includes(wd) && !taken.has(d)) break;
  }
  const today = todayStr();
  const design = addDays(d, -2) < today ? today : addDays(d, -2);
  const edit = addDays(d, -1) < today ? today : addDays(d, -1);
  return { postDate: d, designDate: design, editDate: edit, postTime: postingTime };
}

function scheduleEvents(s, post, t) {
  const want = [
    ['design', post.designDate, '10:00', '12:00', `🎨 ${t('designSession')}: ${post.topic.title}`, 'content'],
    ['edit', post.editDate, '14:00', '15:00', `✍️ ${t('editSession')}: ${post.topic.title}`, 'content'],
    ['post', post.postDate, post.postTime || '19:00', '', `📤 ${t('postDay')} (${BRANDS[post.brand].handle}): ${post.topic.title}`, BRANDS[post.brand].cat],
  ];
  for (const [kind, date, time, endTime, title, category] of want) {
    const ex = s.events.find((e) => e.postId === post.id && e.postKind === kind);
    if (ex) Object.assign(ex, { date, time, endTime, updatedAt: Date.now() });
    else s.events.push({ id: uid('e'), postId: post.id, postKind: kind, title, date, time, endTime, reminder: '30', category, notes: post.topic.title, isDeadline: false, updatedAt: Date.now() });
  }
}

function CopyBtn({ text, t }) {
  const [ok, setOk] = useState(false);
  return (
    <button className="btn ghost sm" onClick={() => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1200); }}>
      {ok ? <Check size={14} /> : <Copy size={14} />} {ok ? t('copied') : t('copy')}
    </button>
  );
}

function ImgThumb({ k, className, alt = '' }) {
  const [u, setU] = useState(null);
  useEffect(() => { let on = true; imgUrl(k).then((x) => on && setU(x)); return () => { on = false; }; }, [k]);
  return u ? <img src={u} className={className} alt={alt} draggable={false} /> : <div className={`${className} img-loading`} />;
}

export default function Content() {
  const { state, api, t, lang } = useStore();
  const [tab, setTab] = useState('hub');
  const [openPost, setOpenPost] = useState(null);
  const [busy, run] = useAsync();
  const [err, setErr] = useState('');
  const [feedback, setFeedback] = useState('');
  const active = state.settings.activeBrands?.length ? state.settings.activeBrands : ['elevara'];
  const brand = active.includes(state.content.brand) ? state.content.brand : active[0];
  const settings = state.settings;
  const hasKey = !!settings.anthropicKey;
  const ideas = state.content.ideas.filter((i) => i.brand === brand);
  const posts = state.content.posts.filter((p) => p.brand === brand);
  const autoFilled = useRef({});

  const avoidList = () => {
    const s = api.get();
    return [...s.content.rejected, ...s.content.ideas.map((i) => i.title), ...s.content.posts.map((p) => p.topic.title)];
  };

  const fetchTopics = (count, fb) => run('topics', async () => {
    setErr('');
    try {
      const s = api.get();
      const hard = [...s.content.ideas.map((i) => i.title), ...s.content.posts.map((p) => p.topic.title)];
      const opts = { apiKey: s.settings.anthropicKey, strategy: s.settings.strategies[brand], lang: s.settings.contentLang, count, avoid: avoidList(), hard, rejected: s.content.rejected, feedback: fb, brand };
      let list = s.settings.anthropicKey ? await aiTopics(opts) : templateTopics(opts);
      if (!list.length) setErr(lang === 'en' ? 'You’ve seen every ready-made topic. Ask Claude in the chat for a new batch, or add your own key in Settings for unlimited AI ideas.' : 'Semua topik siap pakai sudah kamu lihat. Minta topik baru ke Claude di chat, atau isi API key di Pengaturan untuk ide AI tanpa batas.');
      api.update((st) => { st.content.ideas.push(...list.map((x) => ({ ...x, id: uid('i'), brand }))); return st; });
    } catch (e) { setErr(e.message || String(e)); }
  });

  useEffect(() => {
    if (ideas.length < 4 && !busy.topics && !autoFilled.current[brand]) {
      autoFilled.current[brand] = true;
      fetchTopics(4 - ideas.length);
    }
  }, [brand]); // eslint-disable-line

  const reject = (idea) => {
    api.update((s) => { s.content.ideas = s.content.ideas.filter((x) => x.id !== idea.id); s.content.rejected.push(idea.title); return s; });
    fetchTopics(1, feedback);
  };
  const refreshAll = () => {
    api.update((s) => { s.content.rejected.push(...s.content.ideas.filter((x) => x.brand === brand).map((x) => x.title)); s.content.ideas = s.content.ideas.filter((x) => x.brand !== brand); return s; });
    fetchTopics(4, feedback);
  };

  const writeCarousel = async (postId, fb, fresh) => {
    const s = api.get();
    const post = s.content.posts.find((p) => p.id === postId) || fresh;
    const opts = { apiKey: s.settings.anthropicKey, strategy: s.settings.strategies[post.brand], lang: s.settings.contentLang, topic: post.topic, feedback: fb, previous: post.carousel, brand: post.brand };
    const carousel = s.settings.anthropicKey ? await aiCarousel(opts) : templateCarousel(opts);
    api.update((st) => { const p = st.content.posts.find((x) => x.id === postId); if (p) { p.carousel = carousel; p.generating = false; } return st; });
  };

  const pick = (idea) => {
    const s = api.get();
    const dates = planDates(s, brand);
    const post = { id: uid('p'), brand, topic: { title: idea.title, hook: idea.hook, pillar: idea.pillar, why: idea.why, format: idea.format, plan: idea.plan }, status: 'draft', images: [], generating: true, createdAt: Date.now(), ...dates };
    api.update((st) => {
      st.content.ideas = st.content.ideas.filter((x) => x.id !== idea.id);
      st.content.posts.push(post);
      scheduleEvents(st, post, t);
      st.activity.unshift({ id: uid('a'), ts: Date.now(), text: { en: `Planned content "${idea.title}" for ${dates.postDate}`, id: `Merencanakan konten "${idea.title}" untuk ${dates.postDate}` } });
      return st;
    });
    setOpenPost(post.id);
    run(`post_${post.id}`, () => writeCarousel(post.id, undefined, post).catch((e) => {
      setErr(e.message || String(e));
      api.update((st) => { const p = st.content.posts.find((x) => x.id === post.id); if (p) p.generating = false; return st; });
    }));
    fetchTopics(1, feedback);
  };

  const addExisting = async (files, date) => {
    const keys = [];
    for (const f of files) { const k = uid('img'); await putImg(k, f); keys.push(k); }
    api.update((st) => {
      st.content.posts.push({ id: uid('p'), brand, topic: { title: files[0]?.name?.replace(/\.[^.]+$/, '') || 'Post', hook: '', pillar: '' }, status: 'posted', images: keys, postDate: date || todayStr(), designDate: '', editDate: '', manual: true, createdAt: Date.now() });
      return st;
    });
  };

  const scheduleReels = () => {
    api.update((s) => {
      let d = todayStr();
      while (new Date(d + 'T00:00').getDay() !== 6) d = addDays(d, 1);
      for (let i = 0; i < 4; i++) {
        const date = addDays(d, i * 7);
        if (!s.events.some((e) => e.reelsSession && e.date === date)) {
          s.events.push({ id: uid('e'), reelsSession: true, title: `🎬 ${t('editSessionReels')}`, date, time: '10:00', endTime: '12:00', reminder: '60', category: 'content', notes: '', isDeadline: false, updatedAt: Date.now() });
        }
      }
      return s;
    });
  };

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>{t('contentInbox')}</h1>
          <p className="muted">{hasKey ? <><Sparkles size={13} /> {t('aiMode')} · Claude</> : t('templateMode')}</p>
        </div>
        {active.length > 1 && <div className="seg">
          {active.map((b) => (
            <button key={b} className={brand === b ? 'on' : ''} onClick={() => api.update((s) => { s.content.brand = b; return s; })}>{bname(b, lang)}</button>
          ))}
        </div>}
        {active.length === 1 && <span className="black-pill">{bname(brand, lang)}</span>}
      </header>

      <div className="tabs">
        <button className={tab === 'hub' ? 'on' : ''} onClick={() => setTab('hub')}><Sparkles size={15} /> {lang === 'en' ? 'Overview & trends' : 'Ringkasan & tren'}</button>
        <button className={tab === 'inbox' ? 'on' : ''} onClick={() => setTab('inbox')}><Inbox size={15} /> {t('ideas')} {ideas.length > 0 && <span className="count">{ideas.length}</span>}</button>
        <button className={tab === 'feed' ? 'on' : ''} onClick={() => setTab('feed')}><LayoutGrid size={15} /> Feed preview</button>
        <button className={tab === 'pipeline' ? 'on' : ''} onClick={() => setTab('pipeline')}><CalendarClock size={15} /> {t('socialCalendar')}</button>
      </div>

      {err && <div className="alert">{t('error')}: {err}</div>}

      {tab === 'hub' && <SocialHub brand={brand} brandName={bname(brand, 'en')} posts={posts} goInbox={() => setTab('inbox')} />}

      {tab === 'inbox' && (
        <>
          <div className="card inbox-intro">
            <div className="grow"><h2>{t('inboxTitle')}</h2><p className="muted small" style={{ margin: 0 }}>{t('inboxSub')}</p></div>
            <input className="fb-input" value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder={t('improvePh')} />
            <button className="btn" onClick={refreshAll} disabled={!!busy.topics}><RefreshCw size={15} className={busy.topics ? 'spin' : ''} /> {t('refreshAll')}</button>
          </div>
          <div className="ideas">
            {ideas.map((idea) => (
              <div className="card idea" key={idea.id}>
                <Pill color="#8B6FE0" bg="#F1ECFD">{idea.pillar}</Pill>
                <h3>{idea.title}</h3>
                <p className="hook">“{idea.hook}”</p>
                <p className="muted small">{idea.why}</p>
                {(idea.format || idea.trend) && <div className="row-gap">{idea.trend && <Pill color="#C2397F" bg="#FCEBF3">🔥 {lang === 'en' ? 'Trend' : 'Tren'} {idea.date ? fmtDate(idea.date, lang) : ''}</Pill>}{idea.format && <span className="fmt-chip">{idea.format}</span>}</div>}
                {idea.preview?.length > 0 && (
                  <ol className="slide-preview">{idea.preview.map((h, i) => <li key={i}><span>{i === 0 ? 'Hook' : i === 4 ? 'CTA' : `Fix ${i}`}</span>{h}</li>)}</ol>
                )}
                {idea.plan?.length > 0 && (
                  <details className="plan">
                    <summary>{lang === 'en' ? 'How to run this' : 'Cara menjalankannya'}</summary>
                    <ol>{idea.plan.map((st, i) => <li key={i}>{st}</li>)}</ol>
                  </details>
                )}
                <div className="idea-actions">
                  <button className="btn ghost" onClick={() => reject(idea)}><ThumbsDown size={15} /> {t('notInterested')}</button>
                  <button className="btn primary" onClick={() => pick(idea)}><Heart size={15} /> {t('pickThis')}</button>
                </div>
              </div>
            ))}
            {busy.topics && <div className="card idea skeleton"><Loader2 className="spin" size={20} /><span className="muted">{t('loadingTopics')}</span></div>}
          </div>
        </>
      )}

      {tab === 'feed' && <Feed posts={posts} brand={brand} handle={BRANDS[brand].handle} onEdit={setOpenPost} onAddExisting={addExisting} />}

      {tab === 'pipeline' && (
        <div className="card">
          <div className="row-gap" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
            <h2 style={{ margin: 0 }}>{t('pipeline')}</h2>
            <button className="btn" onClick={scheduleReels}><Clapperboard size={15} /> {t('editSessionReels')} × 4</button>
          </div>
          {posts.length === 0 && <p className="muted">{t('noPosts')}</p>}
          <div className="pipeline">
            <div className="pl-row pl-headrow muted small"><span>{t('title')}</span><span>{t('designSession')}</span><span>{t('editSession')}</span><span>{t('postDay')}</span><span>{t('status')}</span></div>
            {[...posts].sort((a, b) => (a.postDate || '').localeCompare(b.postDate || '')).map((p) => {
              const st = stInfo(p.status);
              return (
                <div key={p.id} className="pl-row hover" onClick={() => setOpenPost(p.id)}>
                  <span className="row-title">{p.topic.title}</span>
                  <span>{fmtDate(p.designDate, lang) || '—'}</span>
                  <span>{fmtDate(p.editDate, lang) || '—'}</span>
                  <span><b>{fmtDate(p.postDate, lang, { weekday: 'short', day: 'numeric', month: 'short' })}</b> {p.postTime}</span>
                  <span><Pill color={st[2]} bg={st[3]}>{t(st[1])}</Pill></span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {openPost && <PostModal postId={openPost} onClose={() => setOpenPost(null)} busy={busy} run={run} writeCarousel={writeCarousel} setErr={setErr} />}
    </div>
  );
}

function PostModal({ postId, onClose, busy, run, writeCarousel, setErr }) {
  const { state, api, t, lang } = useStore();
  const post = state.content.posts.find((p) => p.id === postId);
  const [fb, setFb] = useState('');
  const [view, setView] = useState(0);
  const [helper, setHelper] = useState(null); // { prompt, paste, copied, error }
  const fileRef = useRef();
  if (!post) return null;
  const hasKey = !!state.settings.anthropicKey;
  const en = lang === 'en';
  const claudePrompt = (feedback) => `You are the Instagram content writer for my brand. Follow this strategy exactly:

${state.settings.strategies[post.brand]}

Write a complete Instagram carousel with exactly 5 slides: slide 1 = scroll-stopping hook about the audience's problem; slides 2–4 = three creative, concrete solutions (one per slide); slide 5 = CTA that shows what problem we solve. Max ~25 words per slide. Write it in ${state.settings.contentLang === 'id' ? 'Bahasa Indonesia' : 'English'}.
Topic: ${post.topic?.title || ''}
Hook: ${post.topic?.hook || ''}
Pillar: ${post.topic?.pillar || ''}
${post.carousel && (!post.carousel.template || post.carousel.library) ? `\nThis is a revision of the current version:\n${JSON.stringify({ slides: post.carousel.slides, caption: post.carousel.caption })}\n` : ''}${feedback ? `\nMy feedback to apply: ${feedback}\n` : ''}
I design every slide by hand in Canva, so give each slide a short Canva design note (layout, emphasis, visual idea).

Reply with ONLY this JSON, no other text:
{"slides":[{"headline":"","body":"","design_note":""}],"caption":"hook line, value, CTA (80–150 words)","hashtags":["#..."],"cta":""}`;
  const applyPaste = () => {
    try {
      const raw = helper.paste.slice(helper.paste.indexOf('{'), helper.paste.lastIndexOf('}') + 1);
      const j = JSON.parse(raw);
      if (!Array.isArray(j.slides) || !j.slides.length || !j.caption) throw new Error('x');
      const car = { slides: j.slides.map((x) => ({ headline: x.headline || '', body: x.body || '', design_note: x.design_note || '' })), caption: j.caption, hashtags: Array.isArray(j.hashtags) ? j.hashtags : [], cta: j.cta || '' };
      set((p) => { p.carousel = car; p.generating = false; });
      setHelper(null); setView(0);
    } catch {
      setHelper({ ...helper, error: en ? 'Could not read this. Copy Claude’s whole answer (from { to }) and paste it again.' : 'Belum bisa dibaca. Salin seluruh jawaban Claude (dari { sampai }) lalu tempel lagi.' });
    }
  };
  const c = post.carousel;
  const generating = post.generating || busy[`post_${post.id}`];
  const set = (fn) => api.update((s) => { const p = s.content.posts.find((x) => x.id === postId); fn(p, s); return s; });
  const fullScript = c ? [
    ...c.slides.map((s, i) => `SLIDE ${i + 1}\n${s.headline}\n${s.body}\n[Canva: ${s.design_note}]`),
    `CAPTION\n${c.caption}\n\n${c.hashtags.join(' ')}`,
  ].join('\n\n') : '';

  const upload = async (files) => {
    const keys = [];
    for (const f of files) { const k = uid('img'); await putImg(k, f); keys.push(k); }
    set((p) => { p.images = [...(p.images || []), ...keys]; if (p.status === 'draft') p.status = 'design'; });
  };
  const changeDate = (postDate) => set((p, s) => {
    p.postDate = postDate;
    p.designDate = addDays(postDate, -2) < todayStr() ? todayStr() : addDays(postDate, -2);
    p.editDate = addDays(postDate, -1) < todayStr() ? todayStr() : addDays(postDate, -1);
    if (!p.manual) scheduleEvents(s, p, t);
  });
  const total = post.images?.length || 0;

  return (
    <Modal title={post.topic.title} onClose={onClose} wide>
      <div className="post-layout">
        <div className="post-left">
          <div className="viewer">
            {total ? <ImgThumb k={post.images[Math.min(view, total - 1)]} className="viewer-img" /> : (
              c ? <SlideArt post={post} i={Math.min(view, c.slides.length - 1)} pal={palFor(post)} handle={BRANDS[post.brand]?.handle || 'elevara.agency'} />
                : <div className="slide-preview"><Loader2 className="spin" /></div>
            )}
            <button className="nav l" onClick={() => setView((v) => Math.max(0, v - 1))}><ChevronLeft size={18} /></button>
            <button className="nav r" onClick={() => setView((v) => Math.min((total || c?.slides.length || 1) - 1, v + 1))}><ChevronRight size={18} /></button>
          </div>
          {total > 0 && (
            <div className="thumbs">
              {post.images.map((k, i) => (
                <div key={k} className={`thumb${i === view ? ' on' : ''}`} onClick={() => setView(i)}>
                  <ImgThumb k={k} className="thumb-img" />
                  <button className="thumb-x" onClick={(e) => { e.stopPropagation(); delImg(k); set((p) => { p.images = p.images.filter((x) => x !== k); }); }}>×</button>
                </div>
              ))}
            </div>
          )}
          <button className="btn full" onClick={() => fileRef.current.click()}><ImagePlus size={15} /> {lang === 'en' ? 'Upload Canva exports (slides in order)' : 'Upload hasil export Canva (urut per slide)'}</button>
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => { const f = [...e.target.files]; if (f.length) upload(f); e.target.value = ''; }} />

          <div className="form-grid" style={{ marginTop: 14 }}>
            <label>{t('postDay')}<input type="date" value={post.postDate} onChange={(e) => changeDate(e.target.value)} /></label>
            <label>{t('time')}<input type="time" value={post.postTime || ''} onChange={(e) => set((p, s) => { p.postTime = e.target.value; if (!p.manual) scheduleEvents(s, p, t); })} /></label>
          </div>
          {!post.manual && <div className="sched muted small">🎨 {fmtDate(post.designDate, lang, { weekday: 'short', day: 'numeric', month: 'short' })} · ✍️ {fmtDate(post.editDate, lang, { weekday: 'short', day: 'numeric', month: 'short' })} · 📤 {fmtDate(post.postDate, lang, { weekday: 'short', day: 'numeric', month: 'short' })}</div>}
          <label className="lbl">{t('status')}</label>
          <div className="seg full">
            {STATUSES.map(([id, key, col, bg]) => <button key={id} className={post.status === id ? 'on' : ''} style={post.status === id ? { color: col, background: bg } : {}} onClick={() => set((p) => { p.status = id; })}>{t(key)}</button>)}
          </div>
        </div>

        <div className="post-right">
          {post.topic.why && <p className="muted small"><b>{t('why')}:</b> {post.topic.why}</p>}
          {post.topic.plan?.length > 0 && <details className="plan"><summary>{lang === 'en' ? 'How to run this' : 'Cara menjalankannya'}</summary><ol>{post.topic.plan.map((st, i) => <li key={i}>{st}</li>)}</ol></details>}
          {generating && !c && <div className="gen"><Loader2 className="spin" /> {t('generating')}</div>}
          {c && (
            <>
              <div className="row-gap" style={{ justifyContent: 'space-between' }}>
                <h4 style={{ margin: 0 }}>{t('slides')} ({c.slides.length}) {c.template && <span className="muted small">· template</span>}</h4>
                <CopyBtn text={fullScript} t={t} />
              </div>
              <ol className="slides">
                {c.slides.map((s, i) => (
                  <li key={i} className={i === view ? 'on' : ''} onClick={() => setView(i)}>
                    <div className="slide-n">{i + 1}</div>
                    <div className="grow">
                      <b>{s.headline}</b>
                      <p>{s.body}</p>
                      <p className="canva-note">🎨 {s.design_note}</p>
                    </div>
                    <CopyBtn text={`${s.headline}\n${s.body}`} t={t} />
                  </li>
                ))}
              </ol>
              <div className="row-gap" style={{ justifyContent: 'space-between' }}><h4 style={{ margin: 0 }}>{t('caption')}</h4><CopyBtn text={`${c.caption}\n\n${c.hashtags.join(' ')}`} t={t} /></div>
              <textarea className="caption-edit" rows={8} value={c.caption} onChange={(e) => set((p) => { p.carousel.caption = e.target.value; })} />
              <input className="caption-tags" value={c.hashtags.join(' ')} onChange={(e) => set((p) => { p.carousel.hashtags = e.target.value.split(' ').map((h) => (h && !h.startsWith('#') ? `#${h}` : h)); })} placeholder="#hashtags" />
            </>
          )}
          {!post.manual && (
            <>
            {!hasKey && c?.template && !c?.library && !helper && (
              <div className="tip-box" style={{ marginTop: 12 }}><Wand2 size={16} /><span>{en
                ? 'This is only a template (no AI key yet). Click Regenerate: you’ll get a ready prompt to paste into Claude, then paste the answer back here.'
                : 'Ini baru template (belum ada API key). Klik Regenerate: kamu dapat prompt siap pakai untuk ditempel ke Claude, lalu tempel jawabannya kembali di sini.'}</span></div>
            )}
            {helper && (
              <div className="claude-helper">
                <b>{en ? 'Write it with Claude (free with your Claude account)' : 'Tulis dengan Claude (gratis pakai akun Claude-mu)'}</b>
                <ol className="small">
                  <li>{en ? 'Copy the prompt.' : 'Salin prompt-nya.'} <button className="btn sm black" onClick={async () => { try { await navigator.clipboard.writeText(helper.prompt); setHelper({ ...helper, copied: true }); } catch { /* */ } }}>{helper.copied ? (en ? 'Copied ✓' : 'Tersalin ✓') : (en ? 'Copy prompt' : 'Salin prompt')}</button></li>
                  <li>{en ? 'Open ' : 'Buka '}<a href="https://claude.ai/new" target="_blank" rel="noreferrer">claude.ai</a>{en ? ', paste it and send.' : ', tempel, lalu kirim.'}</li>
                  <li>{en ? 'Copy Claude’s whole answer and paste it below.' : 'Salin seluruh jawaban Claude, lalu tempel di bawah.'}</li>
                </ol>
                <textarea rows={4} value={helper.paste || ''} onChange={(e) => setHelper({ ...helper, paste: e.target.value, error: '' })} placeholder={en ? 'Paste Claude’s answer here…' : 'Tempel jawaban Claude di sini…'} />
                {helper.error && <p className="small" style={{ color: '#C2397F', margin: 0 }}>{helper.error}</p>}
                <div className="row-gap">
                  <button className="btn primary" disabled={!helper.paste} onClick={applyPaste}>{en ? 'Use this version' : 'Pakai versi ini'}</button>
                  <button className="btn ghost" onClick={() => setHelper(null)}>{en ? 'Cancel' : 'Batal'}</button>
                </div>
              </div>
            )}
            <form className="improve" onSubmit={(e) => {
              e.preventDefault();
              if (!hasKey) { setHelper({ prompt: claudePrompt(fb), paste: '' }); setFb(''); return; }
              set((p) => { p.generating = true; });
              run(`post_${post.id}`, () => writeCarousel(post.id, fb || 'Make it stronger and more engaging.').catch((er) => { setErr(er.message); set((p) => { p.generating = false; }); }));
              setFb('');
            }}>
              <input value={fb} onChange={(e) => setFb(e.target.value)} placeholder={t('improvePh')} />
              <button className="btn primary" disabled={!!generating}>{generating ? <Loader2 size={15} className="spin" /> : <Wand2 size={15} />} {fb ? t('improve') : t('regenerate')}</button>
            </form>
            </>
          )}
          <div className="modal-foot">
            <button className="btn danger ghost" onClick={() => {
              if (!confirm(`${t('delete')}?`)) return;
              (post.images || []).forEach((k) => delImg(k));
              api.update((s) => {
                s.content.posts = s.content.posts.filter((p) => p.id !== post.id);
                s.events.filter((e) => e.postId === post.id && e.gcalId).forEach((e) => s.deletedGcal.push(e.gcalId));
                s.events = s.events.filter((e) => e.postId !== post.id);
                return s;
              });
              onClose();
            }}><Trash2 size={15} /> {t('delete')}</button>
            <button className="btn primary" onClick={onClose}>{t('close')}</button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
