// Connect an Instagram professional account and upload slide images for auto-posting.
// Auth: the private workspace sync code (same as cloud sync). The Instagram token is
// stored server-side only and never returned to the browser.
import { createClient } from 'npm:@supabase/supabase-js@2';

const GRAPH = 'https://graph.instagram.com/v23.0';
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });

async function syncId(code: unknown): Promise<string | null> {
  if (typeof code !== 'string' || code.length < 32) return null;
  const h = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(code)))).map((b) => b.toString(16).padStart(2, '0')).join('');
  const { data } = await db.from('workspace_sync').select('id').eq('id', h).maybeSingle();
  return data ? h : null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method' }, 405);
  try {
    const ct = req.headers.get('content-type') || '';
    if (ct.startsWith('multipart/form-data')) {
      const f = await req.formData();
      const id = await syncId(f.get('code'));
      if (!id) return json({ error: 'Sync code not found' }, 401);
      const file = f.get('file');
      const post = String(f.get('post_id') || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 60);
      const idx = Math.max(0, Math.min(19, Number(f.get('idx')) || 0));
      if (!(file instanceof File) || !post) return json({ error: 'Missing file' }, 400);
      if (file.type !== 'image/jpeg' || file.size > 8 * 1024 * 1024) return json({ error: 'JPEG up to 8 MB only' }, 400);
      const path = `${id}/${post}/${idx}-${Date.now()}.jpg`;
      const up = await db.storage.from('ig-slides').upload(path, file, { contentType: 'image/jpeg', upsert: true });
      if (up.error) return json({ error: up.error.message }, 500);
      return json({ url: db.storage.from('ig-slides').getPublicUrl(path).data.publicUrl });
    }

    const body = await req.json();
    const id = await syncId(body.code);
    if (!id) return json({ error: 'Sync code not found' }, 401);

    if (body.action === 'connect') {
      let token = String(body.token || '').trim();
      if (token.length < 20) return json({ error: 'Token looks too short' }, 400);
      // Exchange to a long-lived token when an app secret is configured; dashboard tokens are already long-lived.
      const me = await fetch(`${GRAPH}/me?fields=user_id,username,account_type&access_token=${encodeURIComponent(token)}`).then((r) => r.json());
      if (me.error || !me.user_id) return json({ error: me.error?.message || 'Instagram did not accept this token' }, 400);
      let expires = new Date(Date.now() + 59 * 864e5).toISOString();
      const rf = await fetch(`https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(token)}`).then((r) => r.json()).catch(() => ({}));
      if (rf?.access_token) { token = rf.access_token; expires = new Date(Date.now() + (rf.expires_in || 5184000) * 1000).toISOString(); }
      const { error } = await db.from('ig_account').upsert({ sync_id: id, ig_user_id: String(me.user_id), username: me.username, token, token_expires: expires, connected_at: new Date().toISOString(), updated_at: new Date().toISOString() });
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true, username: me.username, account_type: me.account_type });
    }
    if (body.action === 'disconnect') {
      await db.from('ig_account').delete().eq('sync_id', id);
      return json({ ok: true });
    }
    if (body.action === 'retry') {
      await db.from('ig_published').delete().eq('sync_id', id).eq('post_id', String(body.post_id || '')).eq('state', 'failed');
      return json({ ok: true });
    }
    return json({ error: 'Unknown action' }, 400);
  } catch (e) {
    return json({ error: String((e as Error).message || e) }, 500);
  }
});
