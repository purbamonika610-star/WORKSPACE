// Stores uploaded Canva exports in IndexedDB (too large for localStorage).
const DB = 'monika-workspace-images';
let dbp;
function db() {
  if (!dbp) {
    dbp = new Promise((res, rej) => {
      const r = indexedDB.open(DB, 1);
      r.onupgradeneeded = () => r.result.createObjectStore('img');
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
  }
  return dbp;
}
function tx(mode, fn) {
  return db().then((d) => new Promise((res, rej) => {
    const t = d.transaction('img', mode);
    const req = fn(t.objectStore('img'));
    t.oncomplete = () => res(req?.result);
    t.onerror = () => rej(t.error);
  }));
}
export const putImg = (key, blob) => tx('readwrite', (s) => s.put(blob, key));
export const getImg = (key) => tx('readonly', (s) => s.get(key));
export const delImg = (key) => tx('readwrite', (s) => s.delete(key));
export const allImgs = () => db().then((d) => new Promise((res, rej) => {
  const out = {};
  const t = d.transaction('img', 'readonly');
  const c = t.objectStore('img').openCursor();
  c.onsuccess = () => { const cur = c.result; if (cur) { out[cur.key] = cur.value; cur.continue(); } };
  t.oncomplete = () => res(out);
  t.onerror = () => rej(t.error);
}));

const urlCache = new Map();
export async function imgUrl(key) {
  if (urlCache.has(key)) return urlCache.get(key);
  const b = await getImg(key);
  if (!b) return null;
  const u = URL.createObjectURL(b);
  urlCache.set(key, u);
  return u;
}
