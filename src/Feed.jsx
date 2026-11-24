import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft, Bell, Maximize2, Minimize2, BadgeCheck, Bookmark, ChevronLeft, ChevronRight, Clapperboard, EllipsisVertical, Grid3x3, Heart,
  House, ImagePlus, Link2, MessageCircle, MoreHorizontal, Pencil, Search, Send, SquarePlus, SquareUser, UserPlus,
} from 'lucide-react';
import { fmtDate, todayStr, useStore } from './store.jsx';
import { imgUrl } from './imgdb.js';
import { Modal } from './ui.jsx';
import { IgPostStatus, useIg } from './Instagram.jsx';

// Calm, premium palettes. Each post keeps one palette for all its slides.
export const PALETTES = [
  { bg: '#F6F0E8', fg: '#3B1F1A', accent: '#B3412A', soft: '#EADFD2' },
  { bg: '#2A2238', fg: '#FFFFFF', accent: '#C9B6FF', soft: '#3A3150' },
  { bg: '#EEE8FB', fg: '#2E1F5E', accent: '#7A5AE0', soft: '#DCD2F6' },
  { bg: '#E7EFE8', fg: '#1F3A2B', accent: '#3E8E62', soft: '#D3E2D6' },
  { bg: '#FBEDEF', fg: '#4A1D2A', accent: '#D0527A', soft: '#F3D8DE' },
  { bg: '#1E1B1A', fg: '#F6F0E8', accent: '#F2B98B', soft: '#2E2A28' },
];

export const palFor = (p) => PALETTES[(p.id || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0) % PALETTES.length];

const DEFAULT_PROFILES = {
  elevara: { name: 'Elevara', title: 'Virtual Assistant & Social Media Agency', bio: 'We take the busywork off your plate 🤍\nVirtual assistants · Social media management\nDM “ELEVARA” for a free strategy call ↓', link: 'elevara.agency', followers: '1,248', following: '312' },
  sister: { name: "Sister's business", title: 'Bali', bio: 'Made with love in Bali 🌿', link: '', followers: '860', following: '210' },
  personal: { name: 'Monika', title: 'Creator', bio: 'Building things I love ✨', link: '', followers: '540', following: '380' },
};

function useImg(k) {
  const [u, setU] = useState(null);
  useEffect(() => { if (!k) return; let on = true; imgUrl(k).then((x) => on && setU(x)); return () => { on = false; }; }, [k]);
  return u;
}

function Img({ k, className, onRatio }) {
  const u = useImg(k);
  return u ? <img src={u} className={className} alt="" draggable={false} onLoad={onRatio ? (e) => onRatio(e.currentTarget.naturalWidth / e.currentTarget.naturalHeight) : undefined} /> : <div className={`${className} img-loading`} />;
}

/** One designed slide. Sizes use container units so it works as a tiny grid tile or a big viewer. */
export function SlideArt({ post, i, pal, handle }) {
  const slides = post.carousel?.slides || [];
  const s = slides[i] || { headline: post.topic?.hook || post.topic?.title || '', body: '' };
  const n = slides.length || 1;
  const role = i === 0 ? 'cover' : i === n - 1 && n > 1 ? 'cta' : 'fix';
  const style = { '--bg': pal.bg, '--fg': pal.fg, '--ac': pal.accent, '--soft': pal.soft };
  return (
    <div className="sa" style={style}><div className={`sa-in sa-${role}`}>
      <div className="sa-top">
        <span className="sa-logo">{handle.split('.')[0].toUpperCase()}</span>
        <span>{role === 'cta' ? '' : (post.topic?.pillar || '')}</span>
      </div>
      {role === 'cover' && (
        <>
          <div className="sa-blob" />
          <h2 className="sa-hook">{s.headline}</h2>
          {s.body && <p className="sa-body">{s.body}</p>}
          <div className="sa-swipe">Swipe <ChevronRight /></div>
        </>
      )}
      {role === 'fix' && (
        <>
          <div className="sa-num">{String(i).padStart(2, '0')}</div>
          <h3 className="sa-head">{s.headline}</h3>
          <p className="sa-body">{s.body}</p>
          <div className="sa-bar"><span style={{ width: `${(i / (n - 1)) * 100}%` }} /></div>
        </>
      )}
      {role === 'cta' && (
        <>
          <div className="sa-mark">{handle[0].toUpperCase()}</div>
          <h3 className="sa-head center">{s.headline}</h3>
          <p className="sa-body center">{s.body}</p>
          <div className="sa-btn">DM “{handle.split('.')[0].toUpperCase()}”</div>
          <div className="sa-handle">@{handle}</div>
        </>
      )}
    </div></div>
  );
}

function Tile({ post, idx, handle, onOpen, drag }) {
  const pal = palFor(post);
  const today = todayStr();
  const { lang } = useStore();
  const ig = useIg();
  const live = ig.published?.[post.id]?.state === 'published';
  const multi = (post.images?.length || post.carousel?.slides?.length || 0) > 1;
  return (
    <div className={`ig-tile${drag.dragId === post.id ? ' dragging' : ''}`} draggable
      onDragStart={() => drag.setDragId(post.id)} onDragEnd={() => drag.setDragId(null)}
      onDragOver={(e) => e.preventDefault()} onDrop={() => { drag.swap(drag.dragId, post.id); drag.setDragId(null); }}
      onClick={() => onOpen(post.id, idx)}>
      {post.images?.length ? <Img k={post.images[0]} className="ig-img" /> : <SlideArt post={post} i={0} pal={pal} handle={handle} />}
      {live && <span className="ig-live">✓ Live</span>}
      {post.postDate && <span className={`ig-badge${post.postDate <= today ? ' past' : ''}`}>{fmtDate(post.postDate, lang)}</span>}
      {multi && <span className="ig-multi"><svg viewBox="0 0 24 24" width="16" height="16"><path fill="#fff" d="M8 3h11a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm-4 4v12a2 2 0 0 0 2 2h12v-2H6V7H4Z" /></svg></span>}
      <div className="ig-hover"><Heart size={15} fill="#fff" /> {likesFor(post)} <MessageCircle size={15} fill="#fff" /> {Math.round(likesFor(post) / 9)}</div>
    </div>
  );
}

const likesFor = (p) => 40 + ((p.id || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 160);

export default function Feed({ posts, brand, handle, onEdit, onAddExisting }) {
  const { state, api, lang } = useStore();
  const en = lang === 'en';
  const [dragId, setDragId] = useState(null);
  const [open, setOpen] = useState(null); // { id, idx }
  const [editing, setEditing] = useState(false);
  const [tab, setTab] = useState('grid');
  const [full, setFull] = useState(false);
  useEffect(() => {
    if (!full) return;
    const k = (e) => { if (e.key === 'Escape' && !document.querySelector('.igp')) setFull(false); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [full]);
  const fileRef = useRef();
  const prof = { ...DEFAULT_PROFILES[brand], ...(state.content.profiles?.[brand] || {}) };
  const months = [...new Set(posts.map((p) => (p.postDate || '').slice(0, 7)).filter(Boolean))].sort();
  const [upTo, setUpTo] = useState(todayStr().slice(0, 7));
  const inView = upTo === 'all' ? posts : posts.filter((p) => (p.postDate || '').slice(0, 7) <= upTo);
  const sorted = [...inView].sort((a, b) => (b.postDate || '').localeCompare(a.postDate || '') || (b.postTime || '').localeCompare(a.postTime || '') || b.createdAt - a.createdAt);
  const shown = tab === 'grid' ? sorted : [];
  const monthName = (m) => new Date(m + '-01T00:00').toLocaleDateString(en ? 'en-GB' : 'id-ID', { month: 'long', year: 'numeric' });
  const pillars = [...new Set(posts.map((p) => p.topic?.pillar).filter(Boolean))];

  const swap = (a, b) => {
    if (!a || !b || a === b) return;
    api.update((s) => {
      const pa = s.content.posts.find((x) => x.id === a);
      const pb = s.content.posts.find((x) => x.id === b);
      for (const k of ['postDate', 'designDate', 'editDate']) [pa[k], pb[k]] = [pb[k], pa[k]];
      for (const p of [pa, pb]) {
        for (const e of s.events) {
          if (e.postId !== p.id) continue;
          e.date = e.postKind === 'post' ? p.postDate : e.postKind === 'design' ? p.designDate : p.editDate;
          e.updatedAt = Date.now();
        }
      }
      return s;
    });
  };
  const saveProf = (patch) => api.update((s) => { s.content.profiles = { ...(s.content.profiles || {}), [brand]: { ...prof, ...patch } }; return s; });
  const openIdx = open ? sorted.findIndex((p) => p.id === open.id) : -1;

  return (
    <div className={`feed-wrap${full ? ' full' : ''}`}>
      {full && <div className="phone-backdrop" onClick={() => setFull(false)} />}
      {full && <button className="phone-close" onClick={() => setFull(false)}><Minimize2 size={16} /> {en ? 'Exit full screen' : 'Keluar layar penuh'}</button>}
      <div className="phone ig">
        <div className="ig-status"><b>9:41</b><span>●●● ▲ ▮</span></div>
        <div className="ig-topbar">
          <ArrowLeft size={22} />
          <b className="ig-handle">{handle} <BadgeCheck size={15} className="ig-verified" /></b>
          <Bell size={21} />
          <EllipsisVertical size={20} />
        </div>

        <div className="ig-scroll">
          <div className="ig-profile">
            <div className="ig-ring"><div className="ig-av">{prof.name[0]}</div></div>
            <div className="ig-right">
              <div className="ig-name">{prof.name} <span>| {prof.title}</span></div>
              <div className="ig-stats3">
                <div><b>{inView.length}</b><span>Posts</span></div>
                <div><b>{prof.followers}</b><span>Followers</span></div>
                <div><b>{prof.following}</b><span>Following</span></div>
              </div>
            </div>
          </div>
          <div className="ig-bio">
            {prof.bio.split('\n').map((l, i) => <div key={i}>{l}</div>)}
            {prof.link && <a className="ig-link"><Link2 size={13} /> {prof.link}</a>}
          </div>
          <div className="ig-actions">
            <button className="ig-btn blue">Follow</button>
            <button className="ig-btn">Message</button>
            <button className="ig-btn">Contact</button>
            <button className="ig-btn sq"><UserPlus size={15} /></button>
          </div>

          {pillars.length > 0 && (
            <div className="ig-highlights">
              {pillars.map((p, i) => (
                <div key={p} className="ig-hl">
                  <div className="ig-hl-c" style={{ background: PALETTES[i % PALETTES.length].bg, color: PALETTES[i % PALETTES.length].accent }}>{p.split(' ').map((w) => w[0]).join('').slice(0, 2)}</div>
                  <span>{p.length > 11 ? p.slice(0, 10) + '…' : p}</span>
                </div>
              ))}
              <div className="ig-hl"><div className="ig-hl-c add">+</div><span>New</span></div>
            </div>
          )}

          <div className="ig-tabs">
            <button className={tab === 'grid' ? 'on' : ''} onClick={() => setTab('grid')}><Grid3x3 size={20} /></button>
            <button className={tab === 'reels' ? 'on' : ''} onClick={() => setTab('reels')}><Clapperboard size={20} /></button>
            <button className={tab === 'tagged' ? 'on' : ''} onClick={() => setTab('tagged')}><SquareUser size={20} /></button>
          </div>

          <div className="ig-grid">
            {shown.map((p, i) => <Tile key={p.id} post={p} idx={i} handle={handle} onOpen={(id, idx) => setOpen({ id, idx })} drag={{ dragId, setDragId, swap }} />)}
            {shown.length === 0 && <div className="ig-empty muted">{tab === 'grid' ? (en ? 'No posts yet' : 'Belum ada post') : (en ? 'Nothing here yet' : 'Belum ada apa-apa di sini')}</div>}
          </div>
        </div>

        <div className="ig-bottom">
          <House size={23} /><Search size={23} /><SquarePlus size={23} /><Clapperboard size={23} />
          <div className="ig-me">{prof.name[0]}</div>
        </div>

        {openIdx >= 0 && (
          <IGPost post={sorted[openIdx]} idx={openIdx} handle={handle} prof={prof}
            onBack={() => setOpen(null)}
            onPrev={openIdx > 0 ? () => setOpen({ id: sorted[openIdx - 1].id }) : null}
            onNext={openIdx < sorted.length - 1 ? () => setOpen({ id: sorted[openIdx + 1].id }) : null}
            onEdit={() => onEdit(sorted[openIdx].id)} />
        )}
      </div>

      <div className="feed-side card">
        <h3>Feed preview</h3>
        <p className="muted small">
          {en
            ? 'This is how your profile will look. Tap a post to see it like on Instagram: swipe through every slide and read the caption. Drag one tile onto another to swap their posting dates. Upload your Canva exports on a post to replace the preview with your real design.'
            : 'Begini tampilan profilmu nanti. Klik satu post untuk melihatnya seperti di Instagram: geser tiap slide dan baca caption-nya. Seret satu kotak ke kotak lain untuk menukar tanggal posting. Upload hasil export Canva di post itu supaya preview diganti desain aslimu.'}
        </p>
        <label className="lbl">{en ? 'Show the feed up to' : 'Tampilkan feed sampai'}</label>
        <div className="seg full month-seg">
          {[...new Set([todayStr().slice(0, 7), ...months])].sort().map((m) => <button key={m} className={upTo === m ? 'on' : ''} onClick={() => setUpTo(m)}>{monthName(m)}</button>)}
          <button className={upTo === 'all' ? 'on' : ''} onClick={() => setUpTo('all')}>{en ? 'All' : 'Semua'}</button>
        </div>
        <p className="muted small" style={{ margin: 0 }}>{en ? 'Posts are ordered by posting date: the newest is top-left, like on Instagram.' : 'Post diurutkan sesuai tanggal posting: yang terbaru di kiri atas, seperti di Instagram.'} {upTo !== 'all' && `${inView.length} post ${en ? 'until the end of' : 'sampai akhir'} ${monthName(upTo)}.`}</p>
        <button className="btn full primary" onClick={() => setFull(true)}><Maximize2 size={15} /> {en ? 'View full screen' : 'Lihat layar penuh'}</button>
        <button className="btn full" onClick={() => setEditing(true)}><Pencil size={15} /> {en ? 'Edit profile' : 'Edit profil'}</button>
        <button className="btn full" onClick={() => fileRef.current.click()}><ImagePlus size={15} /> {en ? 'Add a post I already made' : 'Tambah post yang sudah ada'}</button>
        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => { const f = [...e.target.files]; if (f.length) onAddExisting(f, todayStr()); e.target.value = ''; }} />
      </div>

      {editing && (
        <Modal title={en ? 'Edit profile' : 'Edit profil'} onClose={() => setEditing(false)}>
          <div className="form-grid one">
            <label>{en ? 'Name' : 'Nama'}<input value={prof.name} onChange={(e) => saveProf({ name: e.target.value })} /></label>
            <label>{en ? 'Title' : 'Judul'}<input value={prof.title} onChange={(e) => saveProf({ title: e.target.value })} /></label>
            <label>Bio<textarea rows={4} value={prof.bio} onChange={(e) => saveProf({ bio: e.target.value })} /></label>
            <label>Link<input value={prof.link} onChange={(e) => saveProf({ link: e.target.value })} /></label>
            <div className="form-grid">
              <label>Followers<input value={prof.followers} onChange={(e) => saveProf({ followers: e.target.value })} /></label>
              <label>Following<input value={prof.following} onChange={(e) => saveProf({ following: e.target.value })} /></label>
            </div>
          </div>
          <div className="modal-foot"><button className="btn primary" onClick={() => setEditing(false)}>{en ? 'Done' : 'Selesai'}</button></div>
        </Modal>
      )}
    </div>
  );
}

function IGPost({ post, idx, handle, prof, onBack, onPrev, onNext, onEdit }) {
  const { lang, api } = useStore();
  const [edit, setEdit] = useState(null); // { caption, tags }
  const saveCaption = () => {
    const hashtags = edit.tags.split(/[\s,]+/).filter(Boolean).map((h) => (h.startsWith('#') ? h : `#${h}`));
    api.update((s) => {
      const p = s.content.posts.find((x) => x.id === post.id);
      p.carousel = { slides: [], cta: '', ...(p.carousel || {}), caption: edit.caption, hashtags };
      return s;
    });
    setEdit(null); setMore(true);
  };
  const en = lang === 'en';
  const [i, setI] = useState(0);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [more, setMore] = useState(false);
  const [pop, setPop] = useState(false);
  const [dx, setDx] = useState(0);
  const [ratio, setRatio] = useState(0.8);
  const start = useRef(null);
  const imgs = post.images || [];
  const c = post.carousel;
  const n = imgs.length || c?.slides?.length || 1;
  const pal = palFor(post);
  useEffect(() => { setI(0); setMore(false); setLiked(false); setSaved(false); setEdit(null); }, [post.id]);
  useEffect(() => {
    const k = (e) => {
      if (/INPUT|TEXTAREA/.test(e.target.tagName)) return;
      if (e.key === 'ArrowRight') setI((v) => Math.min(n - 1, v + 1));
      else if (e.key === 'ArrowLeft') setI((v) => Math.max(0, v - 1));
      else if (e.key === 'Escape') onBack();
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [n, onBack]);

  const down = (e) => { start.current = e.clientX; };
  const move = (e) => { if (start.current != null) setDx(e.clientX - start.current); };
  const up = () => {
    if (start.current == null) return;
    if (dx < -40) setI((v) => Math.min(n - 1, v + 1));
    else if (dx > 40) setI((v) => Math.max(0, v - 1));
    start.current = null; setDx(0);
  };
  const dbl = () => { setLiked(true); setPop(true); setTimeout(() => setPop(false), 700); };
  const likes = likesFor(post) + (liked ? 1 : 0);
  const caption = c?.caption || post.topic?.hook || '';
  const tags = c?.hashtags || [];
  const today = todayStr();
  const when = post.postDate ? new Date(post.postDate + 'T00:00').toLocaleDateString(en ? 'en-GB' : 'id-ID', { day: 'numeric', month: 'long' }) : '';

  return (
    <div className="igp">
      <div className="ig-topbar">
        <button onClick={onBack} aria-label="back"><ArrowLeft size={22} /></button>
        <div className="igp-title"><small>{handle.toUpperCase()}</small><b>Posts</b></div>
        <span style={{ width: 22 }} />
      </div>
      <div className="igp-scroll">
        <div className="igp-head">
          <div className="ig-ring sm"><div className="ig-av">{prof.name[0]}</div></div>
          <div className="grow"><b>{handle}</b> <BadgeCheck size={13} className="ig-verified" /><div className="igp-sub">{post.topic?.pillar}</div></div>
          {post.postDate > today && <span className="igp-sched">{en ? 'Scheduled' : 'Terjadwal'} · {fmtDate(post.postDate, lang)}</span>}
          <MoreHorizontal size={20} />
        </div>

        <div className="igp-media" style={imgs.length ? { aspectRatio: String(Math.min(1.91, Math.max(0.75, ratio))) } : undefined} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up} onDoubleClick={dbl}>
          <div className="igp-track" style={{ transform: `translateX(calc(${-i * 100}% + ${dx}px))`, transition: start.current != null ? 'none' : undefined }}>
            {Array.from({ length: n }, (_, k) => (
              <div className="igp-slide" key={k}>
                {imgs.length ? <Img k={imgs[k]} className="ig-img fit" onRatio={k === 0 ? setRatio : undefined} /> : <SlideArt post={post} i={k} pal={pal} handle={handle} />}
              </div>
            ))}
          </div>
          {n > 1 && <span className="igp-count">{i + 1}/{n}</span>}
          {i > 0 && <button className="igp-nav l" onClick={() => setI(i - 1)}><ChevronLeft size={16} /></button>}
          {i < n - 1 && <button className="igp-nav r" onClick={() => setI(i + 1)}><ChevronRight size={16} /></button>}
          {pop && <Heart className="igp-pop" size={90} fill="#fff" color="#fff" />}
        </div>

        <div className="igp-bar">
          <button onClick={() => setLiked(!liked)} className={liked ? 'liked' : ''}><Heart size={24} fill={liked ? '#ED4956' : 'none'} color={liked ? '#ED4956' : 'currentColor'} /></button>
          <MessageCircle size={24} />
          <Send size={23} />
          {n > 1 && <div className="igp-dots">{Array.from({ length: n }, (_, k) => <span key={k} className={k === i ? 'on' : ''} onClick={() => setI(k)} />)}</div>}
          <button className="igp-save" onClick={() => setSaved(!saved)}><Bookmark size={24} fill={saved ? 'currentColor' : 'none'} /></button>
        </div>

        <div className="igp-text">
          <b>{likes.toLocaleString()} likes</b>
          {edit ? (
            <div className="igp-edit">
              <label>Caption</label>
              <textarea rows={9} value={edit.caption} autoFocus onChange={(e) => setEdit({ ...edit, caption: e.target.value })} onKeyDown={(e) => e.stopPropagation()} />
              <label>Hashtags</label>
              <textarea rows={2} value={edit.tags} onChange={(e) => setEdit({ ...edit, tags: e.target.value })} onKeyDown={(e) => e.stopPropagation()} placeholder="#elevara #virtualassistant" />
              <div className="igp-edit-foot">
                <span className="muted small">{edit.caption.length}/2200</span>
                <button className="btn sm ghost" onClick={() => setEdit(null)}>{en ? 'Cancel' : 'Batal'}</button>
                <button className="btn sm primary" onClick={saveCaption}>{en ? 'Save' : 'Simpan'}</button>
              </div>
            </div>
          ) : (
            <>
              <div className={`igp-cap${more ? ' open' : ''}`} onDoubleClick={() => setEdit({ caption, tags: tags.join(' ') })}>
                <b>{handle}</b> {caption.split('\n').map((l, k) => <span key={k}>{l}<br /></span>)}
                {tags.length > 0 && <span className="igp-tags">{tags.join(' ')}</span>}
              </div>
              <div className="igp-cap-actions">
                {!more && caption.length > 90 && <button className="igp-more" onClick={() => setMore(true)}>{en ? 'more' : 'selengkapnya'}</button>}
                <button className="igp-editbtn" onClick={() => setEdit({ caption, tags: tags.join(' ') })}><Pencil size={12} /> {en ? 'Edit caption' : 'Edit caption'}</button>
              </div>
            </>
          )}
          <div className="igp-cmt">{en ? `View all ${Math.round(likes / 9)} comments` : `Lihat semua ${Math.round(likes / 9)} komentar`}</div>
          <div className="igp-date">{when}</div>
        </div>

        {c?.slides?.length > 0 && (
          <div className="igp-script">
            <div className="igp-script-h">{en ? 'Slide script' : 'Script per slide'}</div>
            {c.slides.map((s, k) => (
              <button key={k} className={`igp-row${k === i ? ' on' : ''}`} onClick={() => setI(k)}>
                <span className="igp-role">{k === 0 ? 'Hook' : k === c.slides.length - 1 ? 'CTA' : `Fix ${k}`}</span>
                <span className="grow"><b>{s.headline}</b><br />{s.body}</span>
              </button>
            ))}
          </div>
        )}

        <div style={{ padding: '0 12px' }}><IgPostStatus post={post} lang={lang} /></div>
        <div className="igp-foot">
          <button className="btn sm" disabled={!onPrev} onClick={onPrev}><ChevronLeft size={14} /> {en ? 'Newer' : 'Lebih baru'}</button>
          <button className="btn sm primary" onClick={onEdit}><Pencil size={14} /> {en ? 'Edit post' : 'Edit post'}</button>
          <button className="btn sm" disabled={!onNext} onClick={onNext}>{en ? 'Older' : 'Lebih lama'} <ChevronRight size={14} /></button>
        </div>
      </div>
    </div>
  );
}
