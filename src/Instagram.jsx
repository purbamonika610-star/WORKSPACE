import { useEffect, useState } from 'react';
import { CheckCircle2, Camera as IgIcon, Loader2, RefreshCw, Send, TriangleAlert } from 'lucide-react';
import { getCfg, igAction, igStatus, igUpload } from './cloud.js';
import { getImg } from './imgdb.js';
import { fmtDate } from './store.jsx';

export const ACCOUNT = 'elevara.workspace';

// Shared Instagram status (one fetch for the whole app).
let shared = { loading: true, connected: false, published: {} };
const subs = new Set();
const emit = (v) => { shared = v; subs.forEach((f) => f(v)); };
let timer = null;
export async function refreshIg() {
  const code = getCfg()?.code;
  if (!code) { emit({ loading: false, connected: false, published: {}, noSync: true }); return; }
  try {
    const s = await igStatus(code);
    emit({ loading: false, ...s, published: Object.fromEntries((s.published || []).map((p) => [p.post_id, p])) });
  } catch (e) {
    emit({ ...shared, loading: false, error: e.message });
  }
}
export function useIg() {
  const [v, setV] = useState(shared);
  useEffect(() => {
    subs.add(setV);
    if (!timer) { refreshIg(); timer = setInterval(refreshIg, 60000); }
    return () => { subs.delete(setV); };
  }, []);
  return v;
}

// Turn an uploaded image into an Instagram-safe JPEG (1080 wide, ratio between 4:5 and 1.91:1).
async function toJpeg(blob) {
  const bmp = await createImageBitmap(blob);
  const W = 1080;
  let r = bmp.width / bmp.height;
  const target = Math.min(1.91, Math.max(0.8, r));
  const H = Math.round(W / target);
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d');
  // Background: the image's corner colour so padding blends in.
  const probe = document.createElement('canvas'); probe.width = 1; probe.height = 1;
  probe.getContext('2d').drawImage(bmp, 0, 0, 1, 1, 0, 0, 1, 1);
  const [pr, pg, pb] = probe.getContext('2d').getImageData(0, 0, 1, 1).data;
  x.fillStyle = `rgb(${pr},${pg},${pb})`; x.fillRect(0, 0, W, H);
  const s = Math.min(W / bmp.width, H / bmp.height);
  const w = bmp.width * s, h = bmp.height * s;
  x.drawImage(bmp, (W - w) / 2, (H - h) / 2, w, h);
  return new Promise((res) => c.toBlob(res, 'image/jpeg', 0.92));
}

const busyPosts = new Set();
/** Upload a Ready post's slides so the server can publish them. Returns true when done. */
export async function prepareForIg(post, update) {
  const code = getCfg()?.code;
  const sig = (post.images || []).join(',');
  if (!code || !sig || post.igSig === sig || busyPosts.has(post.id)) return false;
  busyPosts.add(post.id);
  try {
    const urls = [];
    for (let i = 0; i < post.images.length && i < 10; i++) {
      const b = await getImg(post.images[i]);
      if (!b) return false; // slides live on another device
      urls.push(await igUpload(code, post.id, i, await toJpeg(b)));
    }
    update((s) => { const p = s.content.posts.find((x) => x.id === post.id); if (p) { p.igMedia = urls; p.igSig = sig; } return s; });
    return true;
  } finally {
    busyPosts.delete(post.id);
  }
}

/** Background: keep every Ready post's slides uploaded while Instagram is connected. */
export function useIgAutoPrepare(posts, api) {
  const ig = useIg();
  const key = posts.filter((p) => p.status === 'ready').map((p) => p.id + (p.images || []).join(',') + (p.igSig || '')).join('|');
  useEffect(() => {
    if (!getCfg()?.code) return;
    posts.filter((p) => p.status === 'ready' && p.images?.length && p.igSig !== p.images.join(',')).forEach((p) => prepareForIg(p, api.update).catch(() => {}));
  }, [ig.loading, key]); // eslint-disable-line react-hooks/exhaustive-deps
}

/** One-line status for a post. */
export function IgPostStatus({ post, lang }) {
  const ig = useIg();
  const en = lang === 'en';
  const [retrying, setRetrying] = useState(false);
  if (ig.loading) return null;
  const pub = ig.published[post.id];
  if (pub?.state === 'published') return <div className="ig-st ok"><CheckCircle2 size={14} /> {en ? 'Published on Instagram' : 'Sudah terbit di Instagram'} {pub.permalink && <a href={pub.permalink} target="_blank" rel="noreferrer">{en ? 'View' : 'Lihat'} ↗</a>}</div>;
  if (pub?.state === 'scheduled') return <div className="ig-st ok"><CheckCircle2 size={14} /> {en ? `Scheduled on Instagram @${ACCOUNT} · ` : `Sudah terjadwal di Instagram @${ACCOUNT} · `}{fmtDate(post.postDate, lang, { weekday: 'short', day: 'numeric', month: 'short' })} {post.postTime}</div>;
  if (pub?.state === 'publishing') return <div className="ig-st"><Loader2 size={14} className="spin" /> {en ? 'Publishing now…' : 'Sedang diterbitkan…'}</div>;
  if (pub?.state === 'failed') return (
    <div className="ig-st bad"><TriangleAlert size={14} /> <span className="grow">{en ? 'Could not publish: ' : 'Gagal terbit: '}{pub.error}</span>
      <button className="btn sm" disabled={retrying} onClick={async () => { setRetrying(true); try { await igAction(getCfg().code, 'retry', { post_id: post.id }); await refreshIg(); } finally { setRetrying(false); } }}><RefreshCw size={13} /> {en ? 'Try again' : 'Coba lagi'}</button>
    </div>
  );
  if (ig.noSync) return <div className="ig-st muted"><IgIcon size={14} /> {en ? 'Turn on device sync in Settings to auto-post.' : 'Nyalakan Sinkron device di Pengaturan supaya bisa auto-post.'}</div>;
  const when = `${fmtDate(post.postDate, lang, { weekday: 'short', day: 'numeric', month: 'short' })} ${post.postTime || ''}`;
  if (post.status !== 'ready') return <div className="ig-st muted"><Send size={14} /> {en ? `Mark it Ready (with your slides uploaded) to auto-post on ${when}.` : `Tandai Ready (dan upload slide-nya) supaya otomatis terbit ${when}.`}</div>;
  if (!post.images?.length) return <div className="ig-st bad"><TriangleAlert size={14} /> {en ? 'Upload your Canva slides first, otherwise nothing can be posted.' : 'Upload slide Canva-nya dulu, kalau tidak ada gambar post tidak bisa terbit.'}</div>;
  if (post.igSig !== post.images.join(',')) return <div className="ig-st"><Loader2 size={14} className="spin" /> {en ? 'Preparing slides for Instagram…' : 'Menyiapkan slide untuk Instagram…'}</div>;
  return <div className="ig-st ok"><Send size={14} /> {en ? `Slides ready. Claude will schedule it on @${ACCOUNT} for ${when}` : `Slide siap. Claude akan menjadwalkannya di @${ACCOUNT} · ${when}`}</div>;
}

export function IgCard({ lang }) {
  const en = lang === 'en';
  const ig = useIg();
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  useEffect(() => { refreshIg(); }, []);
  const connect = async () => {
    setBusy(true); setErr('');
    try { await igAction(getCfg().code, 'connect', { token }); setToken(''); await refreshIg(); } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };
  const disconnect = async () => {
    if (!confirm(en ? 'Stop auto-posting to Instagram?' : 'Hentikan auto-post ke Instagram?')) return;
    setBusy(true); try { await igAction(getCfg().code, 'disconnect'); await refreshIg(); } finally { setBusy(false); }
  };
  return (
    <div className="card">
      <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><IgIcon size={18} /> {en ? 'Instagram auto-post' : 'Auto-post Instagram'}</h2>
      {ig.noSync ? (
        <p className="muted small">{en ? 'Turn on device sync first (card above). Auto-posting runs from your synced workspace.' : 'Nyalakan "Sinkron device" dulu (kartu di atas). Auto-post berjalan dari workspace yang tersinkron.'}</p>
      ) : !ig.connected ? (
        <>
          <p className="small" style={{ margin: '0 0 6px' }}>✅ {en ? 'Auto-post is on for' : 'Auto-post aktif untuk'} <b>@{ACCOUNT}</b></p>
          <p className="muted small">{en
            ? 'Mark a post Ready with its Canva slides uploaded. Claude checks your workspace every 2 hours and schedules Ready posts on Instagram for their date and time. Each post shows its status.'
            : 'Tandai post Ready dan upload slide Canva-nya. Claude mengecek workspace-mu tiap 2 jam dan menjadwalkan post Ready di Instagram sesuai tanggal & jamnya. Status tiap post kelihatan di post-nya.'}</p>
          <details className="small muted"><summary>{en ? 'Connect directly with a Meta token (optional)' : 'Sambungkan langsung pakai token Meta (opsional)'}</summary>
            <div className="row-gap" style={{ marginTop: 8 }}>
              <input type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="IGAA…" style={{ flex: 1 }} />
              <button className="btn" disabled={busy || token.length < 20} onClick={connect}>{en ? 'Connect' : 'Sambungkan'}</button>
            </div>
            {err && <p className="small" style={{ color: '#C2397F' }}>{err}</p>}
          </details>
        </>
      ) : ig.connected ? (
        <>
          <p className="small" style={{ margin: '0 0 6px' }}>✅ {en ? 'Connected to' : 'Tersambung ke'} <b>@{ig.username}</b></p>
          <p className="muted small">{en
            ? 'Every post marked Ready with uploaded slides is published automatically at its date and time (checked every 5 minutes). The connection renews itself.'
            : 'Setiap post berstatus Ready yang sudah ada slide-nya akan terbit otomatis di tanggal & jamnya (dicek tiap 5 menit). Sambungannya diperpanjang otomatis.'}</p>
          <button className="btn danger ghost" disabled={busy} onClick={disconnect}>{en ? 'Disconnect' : 'Putuskan'}</button>
        </>
      ) : (
        <>
          <p className="muted small">{en
            ? 'Paste the access token from your Meta app (Instagram API with Instagram login → Generate token). It is stored securely on the server, never in the app code.'
            : 'Tempel access token dari Meta app-mu (Instagram API with Instagram login → Generate token). Token disimpan aman di server, tidak di kode aplikasi.'}</p>
          <div className="row-gap">
            <input type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="IGAA…" style={{ flex: 1 }} />
            <button className="btn primary" disabled={busy || token.length < 20} onClick={connect}>{busy ? <Loader2 size={15} className="spin" /> : null} {en ? 'Connect' : 'Sambungkan'}</button>
          </div>
          {err && <p className="small" style={{ color: '#C2397F' }}>{err}</p>}
        </>
      )}
    </div>
  );
}
