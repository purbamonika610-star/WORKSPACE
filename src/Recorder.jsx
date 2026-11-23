import { useEffect, useRef, useState } from 'react';
import { Mic, Square, Sparkles, RotateCcw, Loader2 } from 'lucide-react';
import { useStore } from './store.jsx';
import { aiInterviewFeedback } from './ai.js';

const STOP = new Set('about also because been being could does from have into just like more most much must other over some such than that their them then there these they this those very want were what when where which while will with would your yours make made being really things thing able'.split(' '));
const FILLERS = /\b(um+|uh+|erm|ehm|hmm|like|you know|actually|basically)\b/gi;
const stems = (txt) => (txt.toLowerCase().match(/[a-z]+/g) || []).filter((w) => w.length >= 4 && !STOP.has(w)).map((w) => w.slice(0, 5));

export function localCheck(transcript, keys, seconds) {
  const have = new Set(stems(transcript));
  const per = keys.map((k) => {
    const ks = [...new Set(stems(k))];
    const hit = ks.filter((s) => have.has(s)).length;
    return { k, ok: ks.length ? hit / ks.length >= 0.4 : false };
  });
  const words = (transcript.match(/\S+/g) || []).length;
  const fillers = (transcript.match(FILLERS) || []).length;
  const cov = per.filter((x) => x.ok).length / Math.max(1, keys.length);
  let score = Math.round(cov * 7 + (words >= 60 ? 2 : words >= 35 ? 1 : 0) + (fillers <= 3 ? 1 : 0));
  score = Math.max(1, Math.min(10, score));
  const verdict = score >= 8 ? 'ready' : score >= 5 ? 'almost' : 'practice';
  const tips = [];
  if (words < 40) tips.push('Jawabanmu masih terlalu pendek. Targetkan ±1 menit (sekitar 80–150 kata).');
  if (words > 220) tips.push('Jawabanmu agak panjang. Usahakan di bawah 1,5 menit, langsung ke poin.');
  if (fillers > 3) tips.push(`Ada ${fillers} kata pengisi (um, uh, like, actually...). Coba jeda sebentar daripada "um".`);
  if (cov < 1) tips.push('Sebutkan poin yang masih kurang (lihat daftar merah di atas).');
  if (seconds >= 20 && words) { const wpm = Math.round(words / (seconds / 60)); if (wpm > 170) tips.push(`Tempo bicaramu cepat (±${wpm} kata/menit). Pelan sedikit supaya terdengar tenang.`); }
  if (!tips.length) tips.push('Bagus! Isi lengkap dan panjangnya pas. Latih sekali lagi supaya makin natural.');
  return { score, verdict, covered: per.filter((x) => x.ok).map((x) => x.k), missing: per.filter((x) => !x.ok).map((x) => x.k), tips, words, fillers, local: true };
}

const VERDICT = {
  ready: { en: 'Ready! Sounds good', id: 'Siap! Jawabanmu sudah bagus', c: '#1E8A5F', bg: '#DDF4EA' },
  almost: { en: 'Almost there', id: 'Hampir! Tinggal sedikit lagi', c: '#9A6A00', bg: '#FFF1C9' },
  practice: { en: 'Practice once more', id: 'Latih sekali lagi ya', c: '#C2397F', bg: '#FCE4F0' },
};

export function Recorder({ card, onChecked }) {
  const { state, lang } = useStore();
  const en = lang === 'en';
  const [rec, setRec] = useState(false);
  const [text, setText] = useState('');
  const [interim, setInterim] = useState('');
  const [audio, setAudio] = useState('');
  const [secs, setSecs] = useState(0);
  const [fb, setFb] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const r = useRef({});
  const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

  useEffect(() => () => stopAll(), []); // eslint-disable-line react-hooks/exhaustive-deps

  function stopAll() {
    const x = r.current;
    x.want = false;
    try { x.sr?.stop(); } catch { /* */ }
    try { if (x.mr?.state === 'recording') x.mr.stop(); } catch { /* */ }
    x.stream?.getTracks().forEach((t) => t.stop());
    clearInterval(x.timer);
  }

  async function start() {
    setErr(''); setFb(null); setText(''); setInterim(''); setSecs(0);
    if (audio) URL.revokeObjectURL(audio);
    setAudio('');
    window.speechSynthesis?.cancel();
    const x = r.current;
    try {
      x.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setErr(en ? 'Microphone blocked. Allow microphone access in your browser (lock icon in the address bar).' : 'Mikrofon diblokir. Izinkan akses mikrofon di browser (ikon gembok di address bar).');
      return;
    }
    const chunks = [];
    try {
      x.mr = new MediaRecorder(x.stream);
      x.mr.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      x.mr.onstop = () => setAudio(URL.createObjectURL(new Blob(chunks, { type: x.mr.mimeType || 'audio/webm' })));
      x.mr.start();
    } catch { /* playback not supported */ }
    x.want = true;
    x.final = '';
    if (SR) {
      const sr = new SR();
      sr.lang = 'en-US'; sr.continuous = true; sr.interimResults = true;
      sr.onresult = (e) => {
        let inter = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const t = e.results[i][0].transcript;
          if (e.results[i].isFinal) x.final += (x.final ? ' ' : '') + t.trim();
          else inter += t;
        }
        setText(x.final); setInterim(inter);
      };
      sr.onend = () => { if (x.want) { try { sr.start(); } catch { /* */ } } };
      sr.onerror = (e) => { if (e.error === 'not-allowed') setErr(en ? 'Speech recognition blocked.' : 'Pengenalan suara diblokir browser.'); };
      x.sr = sr;
      try { sr.start(); } catch { /* */ }
    }
    const t0 = Date.now();
    x.timer = setInterval(() => setSecs(Math.round((Date.now() - t0) / 1000)), 500);
    setRec(true);
  }

  function stop() {
    stopAll();
    setRec(false);
    setInterim('');
  }

  async function check() {
    const transcript = text.trim();
    if (!transcript) { setErr(en ? 'No words captured yet. Record again or type your answer.' : 'Belum ada kata yang tertangkap. Rekam ulang atau ketik jawabanmu.'); return; }
    setErr('');
    const local = localCheck(transcript, card.keys, secs);
    const key = state.settings.anthropicKey;
    if (!key) { setFb(local); onChecked?.(); return; }
    setBusy(true);
    try {
      const ai = await aiInterviewFeedback({ apiKey: key, question: card.q, meaning: card.meaning, keys: card.keys, sample: card.a, transcript });
      setFb({ ...ai, words: local.words, fillers: local.fillers });
    } catch (e) {
      setFb({ ...local, note: (en ? 'AI feedback failed, showing quick check. ' : 'Feedback AI gagal, ini hasil cek cepat. ') + (e.message || '') });
    }
    setBusy(false);
    onChecked?.();
  }

  const v = fb && VERDICT[fb.verdict];
  const mm = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;

  return (
    <div className="recorder">
      <div className="rec-row">
        {!rec ? (
          <button className="btn rec-btn" onClick={start}><Mic size={16} /> {text ? (en ? 'Record again' : 'Rekam ulang') : (en ? 'Record my answer' : 'Rekam jawabanku')}</button>
        ) : (
          <button className="btn rec-btn on" onClick={stop}><Square size={14} /> {en ? 'Stop' : 'Berhenti'} · {mm}</button>
        )}
        {audio && !rec && <audio controls src={audio} className="rec-audio" />}
      </div>
      {!SR && <p className="tiny muted">{en ? 'Live transcription works in Chrome, Edge or Safari. You can still record and type what you said.' : 'Transkrip otomatis hanya di Chrome, Edge atau Safari. Kamu tetap bisa rekam lalu ketik jawabanmu.'}</p>}
      {(rec || text || interim || audio || !SR) && (
        <textarea className="rec-text" rows={4} value={rec ? `${text}${interim ? ` ${interim}` : ''}` : text} readOnly={rec}
          onChange={(e) => setText(e.target.value)} placeholder={en ? 'Your words appear here while you speak (you can also type or fix them)…' : 'Kata-katamu muncul di sini saat kamu bicara (bisa juga diketik atau dirapikan)…'} />
      )}
      {!rec && text && !fb && (
        <button className="btn black" onClick={check} disabled={busy}>
          {busy ? <Loader2 size={15} className="spin" /> : <Sparkles size={15} />} {en ? 'Check my answer' : 'Cek jawabanku'}
        </button>
      )}
      {err && <p className="small" style={{ color: '#C2397F', margin: 0 }}>{err}</p>}
      {fb && (
        <div className="rec-fb">
          <div className="fb-head" style={{ background: v.bg, color: v.c }}>
            <span className="fb-score">{fb.score}/10</span>
            <b>{en ? v.en : v.id}</b>
            <span className="tiny" style={{ marginLeft: 'auto' }}>{fb.words} {en ? 'words' : 'kata'} · {mm}{fb.local ? (en ? ' · quick check' : ' · cek cepat') : ' · AI coach'}</span>
          </div>
          {fb.covered.length > 0 && <div className="fb-list ok"><b>{en ? 'You covered' : 'Sudah kamu sebut'}</b><ul>{fb.covered.map((k) => <li key={k}>✓ {k}</li>)}</ul></div>}
          {fb.missing.length > 0 && <div className="fb-list miss"><b>{en ? 'Still missing' : 'Masih kurang'}</b><ul>{fb.missing.map((k) => <li key={k}>✗ {k}</li>)}</ul></div>}
          <div className="fb-list"><b>{en ? 'Tips' : 'Saran'}</b><ul>{fb.tips.map((k) => <li key={k}>{k}</li>)}</ul></div>
          {fb.better && <details className="plan"><summary>{en ? 'Your answer, polished' : 'Jawabanmu versi lebih bagus'}</summary><p className="small" style={{ lineHeight: 1.6 }}>{fb.better}</p></details>}
          {fb.note && <p className="tiny muted">{fb.note}</p>}
          {fb.local && <p className="tiny muted">{en ? 'Tip: add your Anthropic API key in Settings for a full AI coach review.' : 'Tips: isi API key Anthropic di Pengaturan untuk review lengkap dari AI coach.'}</p>}
          <button className="btn sm" onClick={start}><RotateCcw size={14} /> {en ? 'Try again' : 'Coba lagi'}</button>
        </div>
      )}
    </div>
  );
}
