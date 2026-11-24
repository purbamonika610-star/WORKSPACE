// Cross-device sync: the whole workspace is saved to Supabase under a private sync code.
// The code works like a password: anyone who has it can open the workspace, so keep it private.
const URL_ = 'https://zfajirhhydijbaakdipm.supabase.co/rest/v1/rpc/';
const KEY = 'sb_publishable_Q05Iqr5c9hYS6orgkh3q3g_lqp02wwR'; // public by design; data is only reachable with the sync code
const CFG = 'mw-cloud';

async function rpc(fn, body) {
  const res = await fetch(URL_ + fn, {
    method: 'POST',
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Cloud ${res.status}: ${(await res.text()).slice(0, 160)}`);
  return res.json();
}

export function getCfg() {
  try { return JSON.parse(localStorage.getItem(CFG) || 'null'); } catch { return null; }
}
export function setCfg(c) {
  try { if (c) localStorage.setItem(CFG, JSON.stringify(c)); else localStorage.removeItem(CFG); } catch { /* */ }
}
export function deviceName() {
  const ua = navigator.userAgent;
  const os = /iPhone|iPad/.test(ua) ? 'iPhone/iPad' : /Android/.test(ua) ? 'Android' : /Mac/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows' : 'Device';
  const br = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : /Firefox\//.test(ua) ? 'Firefox' : '';
  return `${os}${br ? ` · ${br}` : ''}`;
}
export function newCode() {
  const b = crypto.getRandomValues(new Uint8Array(18));
  const hex = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
  return `mw-${hex.match(/.{1,6}/g).join('-')}`; // e.g. mw-a1b2c3-d4e5f6-... (36 hex chars)
}
export const validCode = (c) => /^mw-[0-9a-f-]{38,}$/i.test((c || '').trim());

// Keep secrets out of the cloud copy.
export function toCloud(state) {
  const { anthropicKey, ...settings } = state.settings || {}; // eslint-disable-line no-unused-vars
  return { ...state, settings };
}

export const cloudMeta = async (code) => (await rpc('ws_meta', { p_code: code }))[0] || null;
export const cloudGet = async (code) => (await rpc('ws_get', { p_code: code }))[0] || null;
export const cloudPut = (code, state) => rpc('ws_put', { p_code: code, p_data: toCloud(state), p_device: deviceName() });
