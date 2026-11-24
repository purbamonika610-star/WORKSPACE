// Runs every 5 minutes (pg_cron). Publishes posts that are marked Ready, have uploaded
// slides, and whose scheduled time has arrived. ig_published is the lock so a post is
// never published twice.
import { createClient } from 'npm:@supabase/supabase-js@2';

const GRAPH = 'https://graph.instagram.com/v23.0';
const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function zonedToUtc(date: string, time: string, tz: string): number {
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = (time || '19:00').split(':').map(Number);
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).formatToParts(new Date(guess)).map((p) => [p.type, p.value]));
  const asLocal = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute);
  return guess - (asLocal - guess);
}

async function g(path: string, token: string, params: Record<string, string> = {}, method = 'POST') {
  const qs = new URLSearchParams({ ...params, access_token: token });
  const r = await fetch(`${GRAPH}/${path}${method === 'GET' ? `?${qs}` : ''}`, method === 'GET' ? {} : { method, body: qs });
  const j = await r.json();
  if (j.error) throw new Error(j.error.error_user_msg || j.error.message);
  return j;
}

async function waitReady(id: string, token: string) {
  for (let i = 0; i < 20; i++) {
    const s = await g(id, token, { fields: 'status_code' }, 'GET');
    if (s.status_code === 'FINISHED') return;
    if (s.status_code === 'ERROR' || s.status_code === 'EXPIRED') throw new Error(`Media ${s.status_code}`);
    await sleep(1500);
  }
  throw new Error('Instagram took too long to process the image');
}

async function publish(acc: { ig_user_id: string; token: string }, urls: string[], caption: string) {
  const { ig_user_id: uid, token } = acc;
  let creation: string;
  if (urls.length === 1) {
    creation = (await g(`${uid}/media`, token, { image_url: urls[0], caption })).id;
  } else {
    const kids: string[] = [];
    for (const u of urls.slice(0, 10)) kids.push((await g(`${uid}/media`, token, { image_url: u, is_carousel_item: 'true' })).id);
    for (const k of kids) await waitReady(k, token);
    creation = (await g(`${uid}/media`, token, { media_type: 'CAROUSEL', children: kids.join(','), caption })).id;
  }
  await waitReady(creation, token);
  const pub = await g(`${uid}/media_publish`, token, { creation_id: creation });
  const info = await g(pub.id, token, { fields: 'permalink' }, 'GET').catch(() => ({}));
  return { media_id: pub.id as string, permalink: (info as { permalink?: string }).permalink || null };
}

Deno.serve(async (req) => {
  const { data: cfg } = await db.from('ig_config').select('value').eq('key', 'cron_secret').single();
  if (!cfg || req.headers.get('x-cron-secret') !== cfg.value) return new Response('forbidden', { status: 403 });
  const log: unknown[] = [];
  const { data: accounts } = await db.from('ig_account').select('*');
  for (const acc of accounts || []) {
    try {
      // Keep the 60-day token alive.
      if (acc.token_expires && new Date(acc.token_expires).getTime() - Date.now() < 10 * 864e5) {
        const rf = await fetch(`https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(acc.token)}`).then((r) => r.json());
        if (rf.access_token) {
          acc.token = rf.access_token;
          await db.from('ig_account').update({ token: rf.access_token, token_expires: new Date(Date.now() + (rf.expires_in || 5184000) * 1000).toISOString(), updated_at: new Date().toISOString() }).eq('sync_id', acc.sync_id);
        }
      }
      const { data: ws } = await db.from('workspace_sync').select('data').eq('id', acc.sync_id).single();
      const tz = ws?.data?.settings?.timezone || 'Asia/Makassar';
      const posts = (ws?.data?.content?.posts || []) as any[];
      const { data: done } = await db.from('ig_published').select('post_id, state, attempts').eq('sync_id', acc.sync_id);
      const doneMap = new Map((done || []).map((d) => [d.post_id, d]));
      const now = Date.now();
      const connected = new Date(acc.connected_at).getTime();
      for (const p of posts) {
        if (p.status !== 'ready' || !p.igMedia?.length || !p.postDate) continue;
        const due = zonedToUtc(p.postDate, p.postTime, tz);
        if (due > now || due < connected - 5 * 60e3 || now - due > 12 * 3600e3) continue;
        const prev = doneMap.get(p.id);
        if (prev && (prev.state !== 'failed' || prev.attempts >= 3)) continue;
        // Take the lock.
        if (prev) {
          const { data: got } = await db.from('ig_published').update({ state: 'publishing', updated_at: new Date().toISOString() }).eq('sync_id', acc.sync_id).eq('post_id', p.id).eq('state', 'failed').select();
          if (!got?.length) continue;
        } else {
          const { error } = await db.from('ig_published').insert({ sync_id: acc.sync_id, post_id: p.id, state: 'publishing' });
          if (error) continue;
        }
        const c = p.carousel || {};
        const tags = (c.hashtags || []).slice(0, 30).join(' ');
        const caption = `${c.caption || p.topic?.hook || ''}${tags ? `\n\n${tags}` : ''}`.slice(0, 2200);
        try {
          const r = await publish(acc, p.igMedia, caption);
          await db.from('ig_published').update({ state: 'published', media_id: r.media_id, permalink: r.permalink, error: null, published_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('sync_id', acc.sync_id).eq('post_id', p.id);
          log.push({ post: p.id, ok: true });
        } catch (e) {
          await db.from('ig_published').update({ state: 'failed', error: String((e as Error).message || e).slice(0, 500), attempts: (prev?.attempts || 0) + 1, updated_at: new Date().toISOString() }).eq('sync_id', acc.sync_id).eq('post_id', p.id);
          log.push({ post: p.id, ok: false, error: String(e) });
        }
      }
    } catch (e) {
      log.push({ account: acc.username, error: String(e) });
    }
  }
  return new Response(JSON.stringify({ ran: new Date().toISOString(), log }), { headers: { 'Content-Type': 'application/json' } });
});
