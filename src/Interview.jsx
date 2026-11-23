import { useMemo, useState } from 'react';
import { Volume2, Eye, RotateCcw, Check, Shuffle, ChevronDown, ChevronUp, Target, Clock, Video, Lightbulb } from 'lucide-react';
import { INTERVIEW, ALL_QUESTIONS, COMPANY } from './interview.js';
import { useStore } from './store.jsx';
import { Modal } from './ui.jsx';
import { Recorder } from './Recorder.jsx';

export function speak(text) {
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  } catch { /* not supported */ }
}

function QA({ item, open, onToggle, lang }) {
  const { state } = useStore();
  const st = state.practice?.[item.id];
  return (
    <div className={`qa${open ? ' open' : ''}`}>
      <button className="qa-q" onClick={onToggle}>
        <span className="qa-id">{item.id.toUpperCase()}</span>
        <span className="grow">{item.q}</span>
        {st === 'good' && <span className="qa-ok"><Check size={13} /></span>}
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && (
        <div className="qa-body">
          <div className="qa-meaning"><b>{lang === 'en' ? 'What they want to know' : 'Maksud pertanyaan ini'}</b><p>{item.meaning}</p></div>
          <div className="qa-keys"><b>{lang === 'en' ? 'Key points to say' : 'Poin penting yang harus disebut'}</b>
            <ul>{item.keys.map((k) => <li key={k}>{k}</li>)}</ul>
          </div>
          <div className="qa-answer">
            <div className="row-gap" style={{ justifyContent: 'space-between' }}>
              <b>{lang === 'en' ? 'Sample answer' : 'Contoh jawaban'}</b>
              <button className="btn ghost sm" onClick={() => speak(item.a)}><Volume2 size={14} /> {lang === 'en' ? 'Listen' : 'Dengarkan'}</button>
            </div>
            <p>{item.a}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function InterviewGuide({ guide, onPractice }) {
  const { lang } = useStore();
  const [open, setOpen] = useState(null);
  if (guide.type === 'overview') {
    return (
      <div className="guide">
        <div className="iv-meta">
          <div><Target size={15} /> {INTERVIEW.role}</div>
          <div><Clock size={15} /> Tue, 24 Nov 2026 · 10:15 (Bali = Singapore time)</div>
          <div><Video size={15} /> {INTERVIEW.platform}</div>
          <div>👤 {lang === 'en' ? 'Recruiter' : 'Rekruter'}: {INTERVIEW.contact}</div>
        </div>
        <h4>{lang === 'en' ? 'They asked you to prepare for' : 'Yang diminta untuk disiapkan'}</h4>
        <p className="small">{INTERVIEW.focus}</p>
        <h4>{lang === 'en' ? 'How to use this guide' : 'Cara pakai panduan ini'}</h4>
        <p className="small">{INTERVIEW.howTo}</p>
        <div className="tip-box"><Lightbulb size={16} /><span>{INTERVIEW.finalReminder}</span></div>
        <button className="btn black full" onClick={() => onPractice('all')}><Target size={15} /> {lang === 'en' ? 'Practice all 18 questions' : 'Latihan semua 18 pertanyaan'}</button>
      </div>
    );
  }
  if (guide.type === 'qa') {
    const sec = INTERVIEW.sections.find((s) => s.id === guide.section);
    return (
      <div className="guide">
        {sec.items.map((it) => <QA key={it.id} item={it} lang={lang} open={open === it.id} onToggle={() => setOpen(open === it.id ? null : it.id)} />)}
        <button className="btn black full" onClick={() => onPractice(sec.id)}><Target size={15} /> {lang === 'en' ? 'Practice this section (flashcards)' : 'Latihan bagian ini (flashcard)'}</button>
      </div>
    );
  }
  if (guide.type === 'glossary') {
    return (
      <div className="guide">
        <div className="gloss">
          {INTERVIEW.glossary.map(([term, en, id]) => (
            <div key={term} className="gl-row"><b>{term}</b><span>{en}<em>{id}</em></span><button className="icon-btn" onClick={() => speak(`${term}. ${en}`)}><Volume2 size={14} /></button></div>
          ))}
        </div>
        <button className="btn black full" onClick={() => onPractice('terms')}><Target size={15} /> {lang === 'en' ? 'Quiz me on the terms' : 'Kuis istilah'}</button>
      </div>
    );
  }
  if (guide.type === 'company') {
    const L = COMPANY.lumi; const A = COMPANY.alvina;
    const Facts = ({ rows }) => <div className="co-facts">{rows.map(([k, v]) => <div key={k}><b>{k}</b><span>{v}</span></div>)}</div>;
    return (
      <div className="guide">
        <div className="co-card">
          <h4 style={{ marginTop: 0 }}>🏢 {L.name}</h4>
          <p className="muted small" style={{ margin: '0 0 8px' }}>{L.tagline}</p>
          <Facts rows={L.facts} />
        </div>
        <div className="co-card">
          <h4 style={{ marginTop: 0 }}>{lang === 'en' ? 'Their 5 services' : '5 layanan mereka'}</h4>
          <Facts rows={L.services} />
        </div>
        <div className="co-card">
          <h4 style={{ marginTop: 0 }}>{lang === 'en' ? 'How it works: lead → appointment' : 'Cara kerja: lead → appointment'}</h4>
          <ol className="co-steps">{L.process.map((x) => <li key={x}>{x}</li>)}</ol>
          <div className="tip-box"><Lightbulb size={16} /><span>{lang === 'en' ? 'The PA role likely sits in steps 3–5: calling/chatting with leads, qualifying them, booking calls, writing handovers and updating the CRM. That matches your prepared answers on client communication, follow-ups and CRM.' : 'Posisi PA kemungkinan besar ada di langkah 3–5: menghubungi lead, mengecek kecocokan, mengatur jadwal call, menulis handover, dan update CRM. Ini pas sekali dengan jawaban yang sudah kamu siapkan soal komunikasi klien, follow-up, dan CRM.'}</span></div>
        </div>
        <div className="co-card">
          <h4 style={{ marginTop: 0 }}>{lang === 'en' ? 'Their values' : 'Nilai-nilai mereka'}</h4>
          <ul className="co-list">{L.values.map((x) => <li key={x}>{x}</li>)}</ul>
        </div>
        <div className="co-card">
          <h4 style={{ marginTop: 0 }}>🤝 {A.name}</h4>
          <Facts rows={A.facts} />
          <ul className="co-list" style={{ marginTop: 8 }}>{COMPANY.link.map((x) => <li key={x}>{x}</li>)}</ul>
        </div>
        <div className="co-card">
          <h4 style={{ marginTop: 0 }}>💬 {lang === 'en' ? 'Say this in the interview' : 'Kalimat yang bisa kamu pakai'}</h4>
          {COMPANY.talking.map((x) => (
            <div key={x} className="co-say"><span>“{x}”</span><button className="icon-btn" onClick={() => speak(x)}><Volume2 size={14} /></button></div>
          ))}
        </div>
        <div className="co-card">
          <h4 style={{ marginTop: 0 }}>❓ {lang === 'en' ? 'Smart questions about the role' : 'Pertanyaan pintar soal posisinya'}</h4>
          {COMPANY.askMore.map((x) => (
            <div key={x} className="co-say"><span>{x}</span><button className="icon-btn" onClick={() => speak(x)}><Volume2 size={14} /></button></div>
          ))}
        </div>
        <div className="co-card">
          <h4 style={{ marginTop: 0 }}>📚 {lang === 'en' ? 'Property & lead-gen terms' : 'Istilah properti & lead-gen'}</h4>
          <div className="gloss">{COMPANY.terms.map(([k, v]) => <div key={k} className="gl-row"><b>{k}</b><span>{v}</span><button className="icon-btn" onClick={() => speak(k)}><Volume2 size={14} /></button></div>)}</div>
        </div>
        <p className="tiny muted" style={{ margin: 0 }}>{lang === 'en' ? 'Sources' : 'Sumber'}: {COMPANY.sources.join(' · ')}</p>
      </div>
    );
  }
  if (guide.type === 'ask') {
    return <div className="guide"><p className="small muted">{lang === 'en' ? 'Tick the 3 questions you will ask at the end of the interview.' : 'Centang 3 pertanyaan yang akan kamu tanyakan di akhir interview.'}</p></div>;
  }
  if (guide.type === 'checklist') {
    return <div className="guide"><div className="tip-box"><Lightbulb size={16} /><span>{lang === 'en' ? 'Tick each item as you finish it. Join Zoom at 10:05–10:10.' : 'Centang setiap item yang sudah selesai. Masuk Zoom jam 10:05–10:10.'}</span></div></div>;
  }
  return null;
}

export function PracticeModal({ scope, onClose }) {
  const { state, api, lang } = useStore();
  const terms = scope === 'terms';
  const base = useMemo(() => {
    if (terms) return INTERVIEW.glossary.map(([term, en, id]) => ({ id: `t_${term}`, q: term, a: en, meaning: id }));
    return scope === 'all' ? ALL_QUESTIONS : ALL_QUESTIONS.filter((q) => q.sectionId === scope);
  }, [scope, terms]);
  const [order, setOrder] = useState(base.map((_, i) => i));
  const [i, setI] = useState(0);
  const [show, setShow] = useState(false);
  const card = base[order[i]];
  const practice = state.practice || {};
  const good = base.filter((c) => practice[c.id] === 'good').length;

  const mark = (val) => {
    api.update((s) => {
      s.practice = { ...(s.practice || {}), [card.id]: val };
      if (val === 'good' && !terms) {
        for (const p of s.projects) for (const sec of p.sections) for (const t of sec.tasks) {
          const st = t.subtasks?.find((x) => x.qid === card.id);
          if (st) { st.done = true; t.updatedAt = Date.now(); if (t.subtasks.every((x) => x.done)) t.status = 'done'; else if (t.status === 'todo') t.status = 'doing'; }
        }
      }
      return s;
    });
    setShow(false);
    setI((x) => (x + 1) % base.length);
  };
  const shuffle = () => { setOrder([...order].sort(() => Math.random() - 0.5)); setI(0); setShow(false); };

  const title = terms ? (lang === 'en' ? 'Key terms quiz' : 'Kuis istilah') : scope === 'all' ? (lang === 'en' ? 'Interview practice · all questions' : 'Latihan interview · semua pertanyaan') : (() => { const sc = INTERVIEW.sections.find((s) => s.id === scope); return lang === 'en' ? sc?.title : (sc?.titleId || sc?.title); })();

  return (
    <Modal title={title} onClose={() => { window.speechSynthesis?.cancel(); onClose(); }} wide>
      <div className="practice">
        <div className="pr-top">
          <span className="muted small">{i + 1} / {base.length} · {good} ✓ {lang === 'en' ? 'mastered' : 'sudah dikuasai'}</span>
          <div className="pr-bar"><i style={{ width: `${(good / base.length) * 100}%` }} /></div>
          <button className="btn sm" onClick={shuffle}><Shuffle size={14} /> {lang === 'en' ? 'Shuffle' : 'Acak'}</button>
        </div>
        <div className="flash">
          {!terms && <div className="muted tiny">{card.section}</div>}
          <div className="flash-q">{!terms && <span className="qa-id">{card.id.toUpperCase()}</span>}{card.q}</div>
          <button className="btn ghost sm" onClick={() => speak(card.q)}><Volume2 size={14} /> {lang === 'en' ? 'Hear the question' : 'Dengar pertanyaannya'}</button>
          {!terms && <Recorder key={card.id} card={card} onChecked={() => setShow(true)} />}
          {!show ? (
            <>
              <p className="muted small" style={{ textAlign: 'center', maxWidth: 480 }}>
                {terms ? (lang === 'en' ? 'Say the meaning out loud, then check.' : 'Sebutkan artinya dengan suara keras, lalu cek.')
                  : (lang === 'en' ? 'Press Record and answer out loud in your own words (about 1 minute). Then press Check, or just show the answer.' : 'Tekan Rekam dan jawab dengan suara keras pakai kata-katamu sendiri (±1 menit). Lalu tekan Cek jawabanku, atau langsung lihat jawaban.')}
              </p>
              <button className="btn black" onClick={() => setShow(true)}><Eye size={15} /> {lang === 'en' ? 'Show answer' : 'Lihat jawaban'}</button>
            </>
          ) : (
            <div className="flash-a">
              {terms ? (
                <><p className="big-a">{card.a}</p><p className="muted">{card.meaning}</p></>
              ) : (
                <>
                  <div className="qa-meaning"><b>{lang === 'en' ? 'What they want to know' : 'Maksud pertanyaan ini'}</b><p>{card.meaning}</p></div>
                  <div className="qa-keys"><b>{lang === 'en' ? 'Key points' : 'Poin penting'}</b><ul>{card.keys.map((k) => <li key={k}>{k}</li>)}</ul></div>
                  <details className="plan"><summary>{lang === 'en' ? 'Full sample answer' : 'Contoh jawaban lengkap'}</summary><p className="small" style={{ lineHeight: 1.6 }}>{card.a}</p>
                    <button className="btn ghost sm" onClick={() => speak(card.a)}><Volume2 size={14} /> {lang === 'en' ? 'Listen' : 'Dengarkan'}</button></details>
                </>
              )}
              <div className="row-gap" style={{ justifyContent: 'center', marginTop: 10 }}>
                <button className="btn" onClick={() => mark('again')}><RotateCcw size={15} /> {lang === 'en' ? 'Practice again' : 'Ulangi lagi'}</button>
                <button className="btn black" onClick={() => mark('good')}><Check size={15} /> {lang === 'en' ? 'I got it' : 'Sudah bisa'}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
