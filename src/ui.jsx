import { X } from 'lucide-react';
import { CATEGORIES } from './seed.js';
import { tx } from './i18n.js';

export const catOf = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];

export const PRIORITY = {
  high: { color: '#D9534F', bg: '#FCEAEA' },
  medium: { color: '#C98A1B', bg: '#FBF3E0' },
  low: { color: '#3E9C6E', bg: '#E6F5EC' },
};
export const STATUS = {
  todo: { color: '#7A8394', bg: '#F0F2F6' },
  doing: { color: '#4C7EE8', bg: '#EAF1FE' },
  done: { color: '#2F9E6A', bg: '#E4F5EC' },
};

export function Ring({ value, size = 64, stroke = 7, color = '#8B6FE0', label }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#EEF0F5" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none"
          strokeDasharray={c} strokeDashoffset={c * (1 - value)} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: 'stroke-dashoffset .5s' }} />
      </svg>
      <span style={{ fontSize: size > 70 ? 20 : 13 }}>{label ?? `${Math.round(value * 100)}%`}</span>
    </div>
  );
}

export function Bar({ value, color = '#8B6FE0' }) {
  return <div className="bar"><div style={{ width: `${Math.round(value * 100)}%`, background: color }} /></div>;
}

export function Pill({ color, bg, children, onClick, title }) {
  return <span className={`pill${onClick ? ' clickable' : ''}`} style={{ color, background: bg }} onClick={onClick} title={title}>{children}</span>;
}

export function CatDot({ id }) {
  return <span className="dot" style={{ background: catOf(id).color }} />;
}

export function Modal({ title, onClose, children, wide }) {
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal${wide ? ' wide' : ''}`}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="close"><X size={18} /></button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export function CategoryPicker({ value, onChange, lang }) {
  return (
    <div className="cat-picker">
      {CATEGORIES.filter((c) => c.id !== 'google').map((c) => (
        <button type="button" key={c.id} className={`cat-chip${value === c.id ? ' on' : ''}`}
          style={{ '--c': c.color, '--bg': c.bg }} onClick={() => onChange(c.id)}>
          <span className="dot" style={{ background: c.color }} />{tx(c.name, lang)}
        </button>
      ))}
    </div>
  );
}

export function ReminderSelect({ value, onChange, t }) {
  return (
    <select value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
      <option value="">{t('noReminder')}</option>
      <option value="10">{t('min10')}</option>
      <option value="30">{t('min30')}</option>
      <option value="60">{t('hour1')}</option>
      <option value="1440">{t('day1')}</option>
    </select>
  );
}
