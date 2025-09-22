import { Hono } from 'hono';
import { cors } from 'hono/cors';

// Utility: basic JSON response helper
const ok = (c, data) => c.json({ success: true, data });
const bad = (c, message, status = 400) => c.json({ success: false, error: { message } }, status);

// RBAC helpers by role level (L1..L5)
const LEVEL = { L1:1, L2:2, L3:3, L4:4, L5:5 };
function requireLevelAtLeast(c, min){
  const u = c.req.header('x-user-level');
  const lvl = Number(u||0);
  if (!Number.isInteger(lvl) || lvl < min) {
    return bad(c, 'forbidden', 403);
  }
  return null;
}
// shortcut checks
const canCreateEntries = (lvl)=> lvl>=LEVEL.L2; // L2+ can create entries (PO, vendor, invoice, DC)
const canApprove = (lvl)=> lvl>=LEVEL.L4;       // L4/L5 approve
// Payment mark-done: now allowed to all L1..L5 per latest directive
const canMarkPaymentDone = (lvl)=> Number.isInteger(lvl) && lvl >= LEVEL.L1 && lvl <= LEVEL.L5;

const app = new Hono();

// In production, lock CORS to your Pages domain(s) with dynamic allowlist via settings
const ALLOWED_ORIGINS_BASE = [
  'https://odic-finance-ui.pages.dev',
  'https://dashboard.odicinternational.com',
  'https://api.odicinternational.com',
  'https://dashboard-staging.odicinternational.com',
  'https://api-staging.odicinternational.com',
];
let __allowedOrigins = ALLOWED_ORIGINS_BASE.slice();
let __ao_expiry = 0;
async function refreshAllowedOrigins(c) {
  const now = Date.now();
  if (now < __ao_expiry) return __allowedOrigins;
  __ao_expiry = now + 5 * 60 * 1000; // 5 minutes cache
  try {
    const row = await c.env.DB.prepare('SELECT value FROM settings WHERE key = ?').bind('allowed_origins').first();
    const canon = await c.env.DB.prepare('SELECT value FROM settings WHERE key = ?').bind('canonical_domain').first();
    const extras = [];
    if (canon?.value) {
      try { const v = JSON.parse(canon.value); if (v) extras.push(String(v)); } catch { extras.push(String(canon.value)); }
    }
    if (row?.value) {
      try { const vals = JSON.parse(row.value); if (Array.isArray(vals)) extras.push(...vals); }
      catch { extras.push(String(row.value)); }
    }
    const set = new Set(ALLOWED_ORIGINS_BASE.concat(extras.filter(Boolean)));
    __allowedOrigins = Array.from(set);
  } catch (_) { /* keep previous */ }
  return __allowedOrigins;
}
// Strict CORS gate for browsers: block disallowed origins early
app.use('/*', async (c, next) => {
  const origin = c.req.header('Origin');
  if (origin) {
    try {
      const o = new URL(origin).origin;
      const list = await refreshAllowedOrigins(c);
      if (!list.includes(o)) {
        return bad(c, 'CORS not allowed for this origin', 403);
      }
    } catch {
      return bad(c, 'Invalid Origin header', 400);
    }
  }
  await next();
});
// CORS middleware: reflect allowed origin for browsers, allow '*' for server-to-server
app.use('/*', cors({
  origin: (origin) => {
    if (!origin) return '*';
    try {
      const o = new URL(origin).origin;
      return __allowedOrigins.includes(o) ? o : '';
    } catch {
      return '';
    }
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Helpers: allowed statuses and mapping for common aliases
const ALLOWED_STATUSES = new Set(['pending', 'approved', 'rejected', 'suspended']);
const STATUS_ALIASES = new Map([
  ['active', 'approved'],
  ['inactive', 'suspended'],
]);
const normalizeStatus = (val) => {
  if (!val) return undefined;
  const s = String(val).trim().toLowerCase();
  const mapped = STATUS_ALIASES.get(s) || s;
  return mapped;
};

// DB param sanitizers: D1 does not allow `undefined` in .bind()
const toDb = (v) => (v === undefined ? null : v);
const toJsonOrNull = (v) => (v === undefined || v === null ? null : JSON.stringify(v));

// Security headers for all responses
app.use('*', async (c, next) => {
  await next();
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('Referrer-Policy', 'no-referrer');
  c.header('X-Frame-Options', 'DENY');
  c.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  // Basic cache controls for API responses
  c.header('Cache-Control', 'no-store');
});

// Simple in-memory rate limit for mutating requests (note: per-worker instance)
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 120; // max requests per IP per window for POST/PUT/DELETE
const __rate_buckets = new Map();
app.use('*', async (c, next) => {
  const method = c.req.method.toUpperCase();
  if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
    const ip = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const b = __rate_buckets.get(ip) || { start: now, count: 0 };
    if (now - b.start > RATE_LIMIT_WINDOW_MS) {
      b.start = now; b.count = 0;
    }
    b.count++;
    __rate_buckets.set(ip, b);
    if (b.count > RATE_LIMIT_MAX) {
      return bad(c, 'Rate limit exceeded. Please retry later.', 429);
    }
  }
  await next();
});

// Basic validators
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const isValidGSTIN = (s) => typeof s === 'string' && GSTIN_REGEX.test(s.trim());
const isValidPAN = (s) => typeof s === 'string' && PAN_REGEX.test(s.trim());

// Root route for basic API check
app.get('/', (c) => c.text('Welcome to ODIC International API'));

// Health check API
app.get('/api/health', (c) => ok(c, { status: 'healthy', version: '2.2.0', timestamp: new Date().toISOString() }));

// Vendors endpoints (Phase 1)
app.get('/api/vendors', async (c) => {
  const { DB } = c.env;
  const url = new URL(c.req.url);
  const page = Math.max(parseInt(url.searchParams.get('page') || '1', 10), 1);
  const size = Math.min(Math.max(parseInt(url.searchParams.get('size') || '25', 10), 1), 100);
  const search = (url.searchParams.get('search') || '').trim();
  const statusRaw = (url.searchParams.get('status') || '').trim();
  const status = normalizeStatus(statusRaw);

  const where = [];
  const params = [];
  if (search) {
    where.push('(company_name LIKE ? OR legal_name LIKE ? OR gstin LIKE ?)');
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (status) {
    if (!ALLOWED_STATUSES.has(status)) {
      return bad(c, `Invalid status filter. Allowed: ${[...ALLOWED_STATUSES].join(', ')}`);
    }
    where.push('status = ?');
    params.push(status);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const offset = (page - 1) * size;
  const totalStmt = DB.prepare(`SELECT COUNT(*) as cnt FROM vendors ${whereSql}`);
  const total = (await totalStmt.bind(...params).first())?.cnt || 0;

  const listStmt = DB.prepare(`SELECT id, company_name, legal_name, gstin, pan, state, state_code, pin_code, business_type, status, rating, created_at
                               FROM vendors ${whereSql}
                               ORDER BY created_at DESC
                               LIMIT ? OFFSET ?`);
  const rows = await listStmt.bind(...params, size, offset).all();

  return ok(c, { page, size, total, items: rows.results || [] });
});

app.get('/api/vendors/:id{[0-9]+}', async (c) => {
  const { DB } = c.env;
  const id = Number(c.req.param('id'));
  if (!Number.isInteger(id) || id <= 0) return bad(c, 'Invalid vendor id', 400);
  const stmt = DB.prepare('SELECT * FROM vendors WHERE id = ?');
  const row = await stmt.bind(id).first();
  if (!row) return bad(c, 'Vendor not found', 404);
  return ok(c, row);
});

app.post('/api/vendors', async (c) => {
  const u = Number(c.req.header('x-user-level')||0);
  if (!canCreateEntries(u)) return bad(c,'forbidden',403);
  const { DB } = c.env;
  const body = await c.req.json().catch(() => ({}));
  if (!body.company_name) return bad(c, 'company_name is required');
  if (body.gstin && !isValidGSTIN(body.gstin)) return bad(c, 'Invalid GSTIN format');
  if (body.pan && !isValidPAN(body.pan)) return bad(c, 'Invalid PAN format');

  // Normalize and validate fields
  const status = normalizeStatus(body.status) || 'pending';
  if (status && !ALLOWED_STATUSES.has(status)) {
    return bad(c, `Invalid status. Allowed: ${[...ALLOWED_STATUSES].join(', ')}`);
  }
  let rating = 0;
  if (typeof body.rating === 'number') rating = body.rating;

  try {
    const stmt = DB.prepare(`INSERT INTO vendors (company_name, legal_name, gstin, pan, address_lines, state, state_code, pin_code, contact_person, contact_number, email, business_type, status, rating, tags, is_draft)
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    const params = [
      body.company_name,
      body.legal_name,
      body.gstin,
      body.pan,
      body.address_lines === undefined || body.address_lines === null ? null : JSON.stringify(body.address_lines),
      body.state,
      body.state_code,
      body.pin_code,
      body.contact_person,
      body.contact_number,
      body.email,
      body.business_type,
      status,
      rating,
      body.tags === undefined || body.tags === null ? null : JSON.stringify(body.tags),
      (c.req.header('x-draft')==='1' ? 1 : 0)
    ];
    const sanitized = params.map(v => (v === undefined ? null : v));
    const res = await stmt.bind(...sanitized).run();

    // Get inserted id robustly across D1 versions
    let id = res?.lastRowId ?? res?.meta?.last_row_id ?? res?.meta?.lastRowId;
    if (id === undefined || id === null) {
      try {
        const last = await DB.prepare('SELECT last_insert_rowid() AS id').first();
        id = last?.id;
      } catch (_) {
        // ignore and fall back to responding with input payload
      }
    }

    if (id === undefined || id === null) {
      // Fallback: respond with normalized payload when id is unavailable
      return ok(c, {
        id: null,
        company_name: body.company_name,
        legal_name: body.legal_name ?? null,
        gstin: body.gstin ?? null,
        pan: body.pan ?? null,
        address_lines: body.address_lines ?? null,
        state: body.state ?? null,
        state_code: body.state_code ?? null,
        pin_code: body.pin_code ?? null,
        contact_person: body.contact_person ?? null,
        contact_number: body.contact_number ?? null,
        email: body.email ?? null,
        business_type: body.business_type ?? null,
        status,
        rating,
        tags: body.tags ?? null
      });
    }

    // Audit log
    try { await DB.prepare('INSERT INTO audit_log (actor_level, action, entity_type, entity_id, payload) VALUES (?, ?, ?, ?, ?)').bind(u,'create','vendor',id, JSON.stringify({company_name:body.company_name,gstin:body.gstin})).run(); } catch(_){ }
    const row = await DB.prepare('SELECT * FROM vendors WHERE id = ?').bind(id).first();
    return ok(c, row);
  } catch (e) {
    if ((e.message || '').includes('UNIQUE') && (e.message || '').includes('gstin')) {
      return bad(c, 'GSTIN already exists', 409);
    }
    return bad(c, `Failed to create vendor: ${e.message || e}`, 400);
  }
});

app.put('/api/vendors/:id{[0-9]+}', async (c) => {
  const u = Number(c.req.header('x-user-level')||0);
  if (!canCreateEntries(u)) return bad(c,'forbidden',403);
  const { DB } = c.env;
  const id = Number(c.req.param('id'));
  if (!Number.isInteger(id) || id <= 0) return bad(c, 'Invalid vendor id', 400);
  const body = await c.req.json().catch(() => ({}));

  // Build dynamic update with validation/normalization
  const fields = ['company_name','legal_name','gstin','pan','address_lines','state','state_code','pin_code','contact_person','contact_number','email','business_type','status','rating','tags'];
  const sets = [];
  const params = [];
  for (const f of fields) {
    if (f in body) {
      let val = body[f];
      if (f === 'status') {
        val = normalizeStatus(val);
        if (!val || !ALLOWED_STATUSES.has(val)) {
          return bad(c, `Invalid status. Allowed: ${[...ALLOWED_STATUSES].join(', ')}`);
        }
      }
      if (f === 'rating' && typeof val !== 'number') {
        return bad(c, 'rating must be a number');
      }
      if (f === 'gstin' && val && !isValidGSTIN(val)) return bad(c, 'Invalid GSTIN format');
      if (f === 'pan' && val && !isValidPAN(val)) return bad(c, 'Invalid PAN format');
      if (['address_lines','tags'].includes(f)) val = (val === undefined || val === null ? null : JSON.stringify(val));
      // Convert undefined to null for D1 safety
      if (val === undefined) val = null;
      sets.push(`${f} = ?`);
      params.push(val);
    }
  }
  if (!sets.length) return bad(c, 'No updatable fields provided');
  params.push(id);

  const sql = `UPDATE vendors SET ${sets.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
  try {
    await DB.prepare(sql).bind(...params).run();
    try { await DB.prepare('INSERT INTO audit_log (actor_level, action, entity_type, entity_id, payload) VALUES (?, ?, ?, ?, ?)').bind(u,'update','vendor',id, JSON.stringify(body)).run(); } catch(_){ }
    const row = await DB.prepare('SELECT * FROM vendors WHERE id = ?').bind(id).first();
    return ok(c, row);
  } catch (e) {
    if ((e.message || '').includes('UNIQUE') && (e.message || '').includes('gstin')) {
      return bad(c, 'GSTIN already exists', 409);
    }
    return bad(c, `Failed to update vendor: ${e.message || e}`, 400);
  }
});

// GSTIN availability endpoint
app.get('/api/vendors/unique/gstin/:gstin', async (c) => {
  const { DB } = c.env;
  const gstin = (c.req.param('gstin') || '').trim();
  if (!gstin) return bad(c, 'gstin is required');
  if (!isValidGSTIN(gstin)) return bad(c, 'Invalid GSTIN format');
  const row = await DB.prepare('SELECT 1 AS found FROM vendors WHERE gstin = ? LIMIT 1').bind(gstin).first();
  const available = !row;
  return ok(c, { gstin, available });
});


// PAN availability endpoint
app.get('/api/vendors/unique/pan/:pan', async (c) => {
  try {
    const { DB } = c.env;
    const raw = c.req.param('pan');
    const pan = (raw || '').trim();
    if (!pan) return bad(c, 'pan is required');
    if (!isValidPAN(pan)) return bad(c, 'Invalid PAN format');
    const row = await DB.prepare('SELECT 1 AS found FROM vendors WHERE pan = ? LIMIT 1').bind(pan).first();
    const available = !row;
    return ok(c, { pan, available });
  } catch (e) {
    return bad(c, 'Failed to check PAN availability', 400);
  }
});

// CSV export of vendors (supports optional search/status filters)
app.get('/api/vendors/export.csv', async (c) => {
  const { DB } = c.env;
  const url = new URL(c.req.url);
  const search = (url.searchParams.get('search') || '').trim();
  const statusRaw = (url.searchParams.get('status') || '').trim();
  const status = normalizeStatus(statusRaw);

  const where = [];
  const params = [];
  if (search) {
    where.push('(company_name LIKE ? OR legal_name LIKE ? OR gstin LIKE ?)');
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (status) {
    if (!ALLOWED_STATUSES.has(status)) {
      return bad(c, `Invalid status filter. Allowed: ${[...ALLOWED_STATUSES].join(', ')}`);
    }
    where.push('status = ?');
    params.push(status);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const stmt = DB.prepare(`SELECT id, company_name, legal_name, gstin, pan, state, state_code, pin_code, business_type, status, rating, created_at FROM vendors ${whereSql} ORDER BY created_at DESC`);
  const rows = await stmt.bind(...params).all();
  const items = rows.results || [];
  const header = ['id','company_name','legal_name','gstin','pan','state','state_code','pin_code','business_type','status','rating','created_at'];
  const esc = (v) => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const csv = [header.join(',')].concat(items.map(r => header.map(h => esc(r[h])).join(','))).join('\n');
  const today = new Date().toISOString().slice(0,10);
  // Audit export action
try { await c.env.DB.prepare('INSERT INTO audit_log (actor_level, action, entity_type) VALUES (?, ?, ?)').bind(Number(c.req.header('x-user-level')||0),'export','vendors').run(); } catch(_){ }
return new Response(csv, { status: 200, headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Cache-Control': 'no-store', 'Content-Disposition': `attachment; filename="vendors_export_${today}.csv"` }});
});

// CSV dry-run: validate CSV without writing (set header x-dry-run:1)
// CSV import of vendors (upsert by GSTIN)
app.post('/api/vendors/import.csv', async (c) => {
  const u = Number(c.req.header('x-user-level')||0);
  if (!canCreateEntries(u)) return bad(c,'forbidden',403);
  const { DB } = c.env;
  const ct = c.req.header('Content-Type') || '';
  let text = '';
  if (ct.includes('multipart/form-data')) {
    const fd = await c.req.formData();
    const file = fd.get('file');
    if (!file) return bad(c, 'file field is required (multipart)');
    text = await file.text();
  } else {
    text = await c.req.text();
  }
  if (!text) return bad(c, 'Empty CSV');

  const lines = text.split(/\r?\n/).filter(l => l.trim().length);
  if (lines.length <= 1) return bad(c, 'CSV must include header and at least one row');
  const header = lines[0].split(',').map(h => h.trim());
  const idx = (name) => header.indexOf(name);
  const required = ['company_name'];
  for (const r of required) if (idx(r) === -1) return bad(c, `Missing required column: ${r}`);

  const dryRun = c.req.header('x-dry-run') === '1';
  let inserted = 0, updated = 0, skipped = 0, errors = [];
  for (let i = 1; i < lines.length; i++) {
    const raw = lines[i];
    const cols = raw.match(/(?:^|,)(?:\"([^\"]*)\"|([^,]*))/g)?.map(s => s.replace(/^,/, '').replace(/^\"|\"$/g, '')) || raw.split(',');
    const rec = Object.fromEntries(header.map((h, j) => [h, cols[j] ?? '']));

    const company_name = rec.company_name?.trim();
    const gstin = rec.gstin?.trim() || null;
    const status = normalizeStatus(rec.status) || 'pending';
    const rating = rec.rating ? Number(rec.rating) : 0;

    if (!company_name) { skipped++; continue; }
    if (gstin && !isValidGSTIN(gstin)) { errors.push(`Row ${i+1}: invalid GSTIN`); continue; }
        
    try {
      const stmt = DB.prepare(`INSERT INTO vendors (company_name, legal_name, gstin, pan, state, state_code, pin_code, business_type, status, rating)
                               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                               ON CONFLICT(gstin) WHERE gstin IS NOT NULL DO UPDATE SET company_name=excluded.company_name, legal_name=excluded.legal_name, pan=excluded.pan, state=excluded.state, state_code=excluded.state_code, pin_code=excluded.pin_code, business_type=excluded.business_type, status=excluded.status, rating=excluded.rating, updated_at=CURRENT_TIMESTAMP`);
      if (!dryRun) {
        const res = await stmt.bind(
          company_name,
          rec.legal_name || null,
          gstin,
          rec.pan || null,
          rec.state || null,
          rec.state_code || null,
          rec.pin_code || null,
          rec.business_type || null,
          status,
          rating
        ).run();
        if (res.meta?.rows_written === 1 && res.meta?.changes === 1) inserted++;
        else updated++;
      }
    } catch (e) {
      if ((e.message || '').includes('UNIQUE') && (e.message || '').includes('gstin')) { updated++; continue; }
      errors.push(`Row ${i+1}: ${e.message || e}`);
    }
  }

  // Audit
  try { await DB.prepare('INSERT INTO audit_log (actor_level, action, entity_type, payload) VALUES (?, ?, ?, ?)').bind(Number(c.req.header('x-user-level')||0), dryRun ? 'import_dry_run' : 'import', 'vendors_csv', JSON.stringify({inserted,updated,skipped,errorsCount:errors.length})).run(); } catch(_){ }
  return ok(c, { dryRun, inserted, updated, skipped, errors });
});

// Settings API (editable by L4/L5) to manage custom domains and other toggles
app.get('/api/settings/:key', async (c) => {
  const key = c.req.param('key');
  const row = await c.env.DB.prepare('SELECT key, value, updated_at FROM settings WHERE key = ?').bind(key).first();
  return ok(c, row || null);
});
app.put('/api/settings/:key', async (c) => {
  const lvl = Number(c.req.header('x-user-level')||0);
  if (!canApprove(lvl)) return bad(c,'forbidden',403);
  const key = c.req.param('key');
  const body = await c.req.json().catch(()=>({}));
  const value = body.value == null ? null : JSON.stringify(body.value);
  await c.env.DB.prepare('INSERT INTO settings (key,value,updated_at) VALUES (?,?,CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=CURRENT_TIMESTAMP').bind(key,value).run();
  // Audit
  try { await c.env.DB.prepare('INSERT INTO audit_log (actor_level, action, entity_type, payload) VALUES (?,?,?,?)').bind(lvl,'settings_update','settings', JSON.stringify({key})).run(); } catch(_){ }
  const row = await c.env.DB.prepare('SELECT key, value, updated_at FROM settings WHERE key = ?').bind(key).first();
  return ok(c, row);
});

// Example additional API route
app.get('/api/data', (c) => ok(c, { message: 'Here is some sample data' }));

// Roles endpoints (CRUD to allow future changes)
app.get('/api/roles', async (c) => {
  const { DB } = c.env;
  const rows = await DB.prepare('SELECT id, name, level, permissions, created_at FROM roles ORDER BY level ASC').all();
  return ok(c, rows.results || []);
});
app.get('/api/roles/:id', async (c) => {
  const { DB } = c.env;
  const id = Number(c.req.param('id'));
  if (!Number.isInteger(id) || id <= 0) return bad(c, 'Invalid role id');
  const row = await DB.prepare('SELECT id, name, level, permissions, created_at FROM roles WHERE id = ?').bind(id).first();
  if (!row) return bad(c, 'Role not found', 404);
  return ok(c, row);
});
app.post('/api/roles', async (c) => {
  const { DB } = c.env;
  const body = await c.req.json().catch(() => ({}));
  const name = (body.name || '').trim();
  const level = Number(body.level);
  let permissions = body.permissions;
  if (!name) return bad(c, 'name is required');
  if (!Number.isInteger(level)) return bad(c, 'level must be an integer');
  try {
    if (typeof permissions === 'string') {
      try { permissions = JSON.parse(permissions); } catch {}
    }
    const permStr = permissions == null ? null : JSON.stringify(permissions);
    const res = await DB.prepare('INSERT INTO roles (name, level, permissions) VALUES (?, ?, ?)').bind(name, level, permStr).run();
    const id = res?.lastRowId ?? res?.meta?.last_row_id ?? res?.meta?.lastRowId;
    const row = await DB.prepare('SELECT id, name, level, permissions, created_at FROM roles WHERE id = ?').bind(id).first();
    return ok(c, row);
  } catch (e) {
    if ((e.message||'').includes('UNIQUE')) return bad(c, 'Role name or level already exists', 409);
    return bad(c, `Failed to create role: ${e.message || e}`, 400);
  }
});
app.put('/api/roles/:id', async (c) => {
  const { DB } = c.env;
  const id = Number(c.req.param('id'));
  if (!Number.isInteger(id) || id <= 0) return bad(c, 'Invalid role id');
  const body = await c.req.json().catch(() => ({}));
  const fields = [];
  const params = [];
  if ('name' in body) { fields.push('name = ?'); params.push((body.name||'').trim() || null); }
  if ('level' in body) { const lvl = Number(body.level); if (!Number.isInteger(lvl)) return bad(c, 'level must be an integer'); fields.push('level = ?'); params.push(lvl); }
  if ('permissions' in body) {
    let p = body.permissions;
    if (typeof p === 'string') { try { p = JSON.parse(p); } catch {} }
    fields.push('permissions = ?'); params.push(p == null ? null : JSON.stringify(p));
  }
  if (!fields.length) return bad(c, 'No updatable fields provided');
  params.push(id);
  try {
    await DB.prepare(`UPDATE roles SET ${fields.join(', ')} WHERE id = ?`).bind(...params).run();
    const row = await DB.prepare('SELECT id, name, level, permissions, created_at FROM roles WHERE id = ?').bind(id).first();
    return ok(c, row);
  } catch (e) {
    if ((e.message||'').includes('UNIQUE')) return bad(c, 'Role name or level already exists', 409);
    return bad(c, `Failed to update role: ${e.message || e}`, 400);
  }
});
app.delete('/api/roles/:id', async (c) => {
  const { DB } = c.env;
  const id = Number(c.req.param('id'));
  if (!Number.isInteger(id) || id <= 0) return bad(c, 'Invalid role id');
  const u = await DB.prepare('SELECT COUNT(1) AS cnt FROM users WHERE role_id = ?').bind(id).first();
  if ((u?.cnt || 0) > 0) return bad(c, 'Role is in use by users; reassign users before deletion', 409);
  await DB.prepare('DELETE FROM roles WHERE id = ?').bind(id).run();
  return ok(c, { deleted: true });
});

// Payments endpoints
app.post('/api/payments/:id{[0-9]+}{[0-9]+}/proof', async (c) => {
  const lvl = Number(c.req.header('x-user-level')||0);
  if (!(lvl === LEVEL.L1 || lvl === LEVEL.L5)) return bad(c,'forbidden',403);
  const id = Number(c.req.param('id'));
  if (!Number.isInteger(id) || id <= 0) return bad(c, 'Invalid payment id', 400);
  const body = await c.req.json().catch(() => ({}));
  const proof_url = (body.proof_url || '').toString().trim();
  if (!proof_url) return bad(c, 'proof_url is required');
  await c.env.DB.prepare('UPDATE payments SET proof_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(proof_url, id).run();
  try { await c.env.DB.prepare('INSERT INTO audit_log (actor_level, action, entity_type, entity_id, payload) VALUES (?,?,?,?,?)').bind(lvl,'upload_proof','payment',id, JSON.stringify({proof_url})).run(); } catch(_){ }
  const row = await c.env.DB.prepare('SELECT * FROM payments WHERE id = ?').bind(id).first();
  return ok(c, row);
});

app.get('/api/payments', async (c) => {
  const { DB } = c.env;
  const url = new URL(c.req.url);
  const page = Math.max(parseInt(url.searchParams.get('page') || '1', 10), 1);
  const size = Math.min(Math.max(parseInt(url.searchParams.get('size') || '25', 10), 1), 100);
  const status = (url.searchParams.get('status') || '').trim();
  const vendor_id = url.searchParams.get('vendor_id');
  const where = [];
  const params = [];
  if (status) { where.push('status = ?'); params.push(status); }
  if (vendor_id) { where.push('vendor_id = ?'); params.push(Number(vendor_id)); }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const total = (await DB.prepare(`SELECT COUNT(*) AS cnt FROM payments ${whereSql}`).bind(...params).first())?.cnt || 0;
  const rows = await DB.prepare(`SELECT * FROM payments ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`).bind(...params, size, (page-1)*size).all();
  return ok(c, { page, size, total, items: rows.results || [] });
});

app.get('/api/payments/:id{[0-9]+}', async (c) => {
  const id = Number(c.req.param('id'));
  if (!Number.isInteger(id) || id <= 0) return bad(c, 'Invalid payment id');
  const row = await c.env.DB.prepare('SELECT * FROM payments WHERE id = ?').bind(id).first();
  if (!row) return bad(c, 'Not found', 404);
  return ok(c, row);
});

app.post('/api/payments', async (c) => {
  const lvl = Number(c.req.header('x-user-level')||0);
  if (!canCreateEntries(lvl)) return bad(c,'forbidden',403);
  const b = await c.req.json().catch(()=>({}));
  const vendor_id = b.vendor_id ? Number(b.vendor_id) : null;
  const amount = b.amount ? Number(b.amount) : 0;
  const invoice_ref = (b.invoice_ref||'').toString();
  const status = (b.status||'pending').toString();
  await c.env.DB.prepare('INSERT INTO payments (vendor_id, invoice_ref, amount, status, created_by_level) VALUES (?,?,?,?,?)').bind(vendor_id, toDb(invoice_ref), amount, status, lvl).run();
  const row = await c.env.DB.prepare('SELECT * FROM payments ORDER BY id DESC LIMIT 1').first();
  try { await c.env.DB.prepare('INSERT INTO audit_log (actor_level, action, entity_type, entity_id, payload) VALUES (?,?,?,?,?)').bind(lvl,'create','payment',row?.id||null, JSON.stringify({vendor_id, amount})).run(); } catch(_){ }
  return ok(c, row);
});

app.put('/api/payments/:id{[0-9]+}', async (c) => {
  const lvl = Number(c.req.header('x-user-level')||0);
  if (!canCreateEntries(lvl)) return bad(c,'forbidden',403);
  const id = Number(c.req.param('id'));
  if (!Number.isInteger(id) || id <= 0) return bad(c, 'Invalid payment id');
  const b = await c.req.json().catch(()=>({}));
  const fields = [];
  const params = [];
  for (const k of ['vendor_id','invoice_ref','amount','status','proof_url']) {
    if (k in b) { fields.push(`${k} = ?`); params.push(b[k]); }
  }
  if (!fields.length) return bad(c, 'No updatable fields provided');
  params.push(id);
  await c.env.DB.prepare(`UPDATE payments SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).bind(...params).run();
  const row = await c.env.DB.prepare('SELECT * FROM payments WHERE id = ?').bind(id).first();
  return ok(c, row);
});

app.post('/api/payments/:id{[0-9]+}{[0-9]+}/mark-done', async (c) => {
  const lvl = Number(c.req.header('x-user-level')||0);
  if (!canMarkPaymentDone(lvl)) return bad(c,'forbidden',403);
  const id = Number(c.req.param('id'));
  if (!Number.isInteger(id) || id <= 0) return bad(c, 'Invalid payment id', 400);
  await c.env.DB.prepare('UPDATE payments SET status = "done", marked_done_by_level = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(lvl, id).run();
  try { await c.env.DB.prepare('INSERT INTO audit_log (actor_level, action, entity_type, entity_id) VALUES (?,?,?,?)').bind(lvl,'mark_done','payment',id).run(); } catch(_){ }
  const row = await c.env.DB.prepare('SELECT * FROM payments WHERE id = ?').bind(id).first();
  return ok(c, row);
});

// Instrument Types
app.get('/api/instrument-types', async (c) => {
  const rows = await c.env.DB.prepare('SELECT id, name, created_at FROM instrument_types ORDER BY name').all();
  return ok(c, rows.results || []);
});
app.post('/api/instrument-types', async (c) => {
  const lvl = Number(c.req.header('x-user-level')||0);
  if (!canCreateEntries(lvl)) return bad(c,'forbidden',403);
  const b = await c.req.json().catch(()=>({}));
  const name = (b.name||'').toString().trim();
  if (!name) return bad(c, 'name is required');
  try {
    await c.env.DB.prepare('INSERT INTO instrument_types (name) VALUES (?)').bind(name).run();
    const row = await c.env.DB.prepare('SELECT id, name, created_at FROM instrument_types WHERE name = ?').bind(name).first();
    return ok(c, row);
  } catch(e) {
    if ((e.message||'').includes('UNIQUE')) return bad(c,'name exists',409);
    return bad(c, 'Failed to create');
  }
});

// Financial Instruments
const INSTR_STATUSES = new Set(['pending','active','approved','rejected','expired']);
app.get('/api/instruments', async (c) => {
  const { DB } = c.env;
  const url = new URL(c.req.url);
  const page = Math.max(parseInt(url.searchParams.get('page') || '1', 10), 1);
  const size = Math.min(Math.max(parseInt(url.searchParams.get('size') || '25', 10), 1), 100);
  const search = (url.searchParams.get('search')||'').trim();
  const status = (url.searchParams.get('status')||'').trim();
  const type_id = url.searchParams.get('type_id');
  const where = [];
  const params = [];
  if (search) { where.push('(title LIKE ? OR reference_no LIKE ?)'); params.push(`%${search}%`,`%${search}%`); }
  if (status) { where.push('status = ?'); params.push(status); }
  if (type_id) { where.push('type_id = ?'); params.push(Number(type_id)); }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const total = (await DB.prepare(`SELECT COUNT(*) AS cnt FROM financial_instruments ${whereSql}`).bind(...params).first())?.cnt || 0;
  const rows = await DB.prepare(`SELECT * FROM financial_instruments ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`).bind(...params, size, (page-1)*size).all();
  return ok(c, { page, size, total, items: rows.results || [] });
});
app.get('/api/instruments/:id{[0-9]+}', async (c) => {
  const id = Number(c.req.param('id'));
  if (!Number.isInteger(id) || id <= 0) return bad(c,'Invalid id');
  const row = await c.env.DB.prepare('SELECT * FROM financial_instruments WHERE id = ?').bind(id).first();
  if (!row) return bad(c,'Not found',404);
  return ok(c, row);
});
function parseDetailsByType(name, body) {
  // Normalize per instrument type with forward-compat JSON shape
  switch ((name||'').toLowerCase()) {
    case 'bank guarantee':
      return {
        bank_name: body.bank_name || null,
        bg_number: body.bg_number || null,
        beneficiary: body.beneficiary || null,
        margin_percent: body.margin_percent == null ? null : Number(body.margin_percent),
        claimable_until: body.claimable_until || null
      };
    case 'letter of credit':
      return {
        issuing_bank: body.issuing_bank || null,
        advising_bank: body.advising_bank || null,
        lc_number: body.lc_number || null,
        shipment_terms: body.shipment_terms || null,
        expiry_date: body.expiry_date || null,
      };
    case 'rtgs':
    case 'neft':
    case 'upi_b2b':
      return {
        utr: body.utr || null,
        txn_date: body.txn_date || null,
        payer_bank: body.payer_bank || null,
        payee_bank: body.payee_bank || null,
        channel: (name||'').toUpperCase()
      };
    case 'e-kuber':
    case 'pfms':
      return {
        pfms_id: body.pfms_id || null,
        sanction_no: body.sanction_no || null,
        scheme: body.scheme || null,
        fund_source: body.fund_source || null
      };
    case 'gem payment':
      return {
        gem_order_no: body.gem_order_no || null,
        gem_invoice_no: body.gem_invoice_no || null,
        gem_seller_id: body.gem_seller_id || null,
      };
    case 'digital signature':
      return {
        signer_id: body.signer_id || null,
        dsc_serial: body.dsc_serial || null,
        signed_at: body.signed_at || null,
        audit_trail_url: body.audit_trail_url || null,
      };
    default:
      return {};
  }
}

app.post('/api/instruments', async (c) => {
  const lvl = Number(c.req.header('x-user-level')||0);
  if (!canCreateEntries(lvl)) return bad(c,'forbidden',403);
  const b = await c.req.json().catch(()=>({}));
  const type_id = b.type_id ? Number(b.type_id) : null; const type_name = (b.type_name||'').toString();
  const title = (b.title||'').toString().trim();
  if (!title) return bad(c, 'title is required');
  const reference_no = (b.reference_no||'').toString();
  const vendor_id = b.vendor_id ? Number(b.vendor_id) : null;
  const amount = b.amount ? Number(b.amount) : 0;
  const currency = (b.currency||'INR').toString();
  const status = INSTR_STATUSES.has((b.status||'pending').toString()) ? (b.status||'pending').toString() : 'pending';
  const issue_date = b.issue_date || null;
  const expiry_date = b.expiry_date || null;
  const document_url = b.document_url || null;
  const notes = b.notes || null;
  const details = parseDetailsByType(type_name, b);
  const bg_number = details.bg_number || null;
  const lc_number = details.lc_number || null;
  const utr = details.utr || null;
  const pfms_id = details.pfms_id || null;
  const gem_order_no = details.gem_order_no || null;
  const signer_id = details.signer_id || null;
  await c.env.DB.prepare('INSERT INTO financial_instruments (type_id,title,reference_no,vendor_id,amount,currency,status,issue_date,expiry_date,document_url,notes,details,bg_number,lc_number,utr,pfms_id,gem_order_no,signer_id,created_by_level) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
    .bind(toDb(type_id), toDb(title), toDb(reference_no), toDb(vendor_id), toDb(amount), toDb(currency), toDb(status), toDb(issue_date), toDb(expiry_date), toDb(document_url), toDb(notes), JSON.stringify(details), toDb(bg_number), toDb(lc_number), toDb(utr), toDb(pfms_id), toDb(gem_order_no), toDb(signer_id), lvl).run();
  const row = await c.env.DB.prepare('SELECT * FROM financial_instruments ORDER BY id DESC LIMIT 1').first();
  try { await c.env.DB.prepare('INSERT INTO audit_log (actor_level, action, entity_type, entity_id, payload) VALUES (?,?,?,?,?)').bind(lvl,'create','financial_instrument',row?.id||null, JSON.stringify({title,amount})).run(); } catch(_){ }
  return ok(c, row);
});
app.put('/api/instruments/:id{[0-9]+}', async (c) => {
  const lvl = Number(c.req.header('x-user-level')||0);
  if (!canCreateEntries(lvl)) return bad(c,'forbidden',403);
  const id = Number(c.req.param('id'));
  if (!Number.isInteger(id) || id <= 0) return bad(c,'Invalid id');
  const b = await c.req.json().catch(()=>({}));
  const fields = [];
  const params = [];
  for (const k of ['type_id','title','reference_no','vendor_id','amount','currency','status','issue_date','expiry_date','document_url','notes','details','bg_number','lc_number','utr','pfms_id','gem_order_no','signer_id']) {
    if (k in b) { fields.push(`${k} = ?`); params.push(b[k]); }
  }
  if (!fields.length) return bad(c, 'No updatable fields provided');
  params.push(id);
  await c.env.DB.prepare(`UPDATE financial_instruments SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).bind(...params).run();
  const row = await c.env.DB.prepare('SELECT * FROM financial_instruments WHERE id = ?').bind(id).first();
  return ok(c, row);
});

// Instruments CSV export/import
app.get('/api/instruments/export.csv', async (c) => {
  const rows = await c.env.DB.prepare('SELECT id,type_id,title,reference_no,vendor_id,amount,currency,status,issue_date,expiry_date,document_url,created_at FROM financial_instruments ORDER BY created_at DESC').all();
  const items = rows.results || [];
  const header = ['id','type_id','title','reference_no','vendor_id','amount','currency','status','issue_date','expiry_date','document_url','created_at'];
  const esc = (v) => v==null?'':(/[",\n]/.test(String(v))?'"'+String(v).replace(/"/g,'""')+'"':String(v));
  const csv = [header.join(',')].concat(items.map(r=>header.map(h=>esc(r[h])).join(','))).join('\n');
  const today = new Date().toISOString().slice(0,10);
  return new Response(csv, { status: 200, headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Cache-Control': 'no-store', 'Content-Disposition': `attachment; filename="instruments_${today}.csv"` }});
});

// Payments CSV export
app.get('/api/payments/export.csv', async (c) => {
  const rows = await c.env.DB.prepare('SELECT id,vendor_id,invoice_ref,amount,status,proof_url,created_at FROM payments ORDER BY created_at DESC').all();
  const items = rows.results || [];
  const header = ['id','vendor_id','invoice_ref','amount','status','proof_url','created_at'];
  const esc = (v) => v==null?'':(/[",\n]/.test(String(v))?'"'+String(v).replace(/"/g,'""')+'"':String(v));
  const csv = [header.join(',')].concat(items.map(r=>header.map(h=>esc(r[h])).join(','))).join('\n');
  const today = new Date().toISOString().slice(0,10);
  return new Response(csv, { status: 200, headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Cache-Control': 'no-store', 'Content-Disposition': `attachment; filename="payments_${today}.csv"` }});
});

// Purchase Orders (PO)
const PO_STATUSES = new Set(['pending','approved','rejected']);
app.get('/api/pos', async (c) => {
  const DB = c.env.DB; const url = new URL(c.req.url);
  const page = Math.max(parseInt(url.searchParams.get('page')||'1',10),1);
  const size = Math.min(Math.max(parseInt(url.searchParams.get('size')||'25',10),1),100);
  const status = (url.searchParams.get('status')||'').trim(); const vendor_id = url.searchParams.get('vendor_id');
  const where=[], params=[]; if (status){where.push('status=?'); params.push(status);} if (vendor_id){where.push('vendor_id=?'); params.push(Number(vendor_id));}
  const whereSql = where.length?`WHERE ${where.join(' AND ')}`:'';
  const total = (await DB.prepare(`SELECT COUNT(*) AS c FROM purchase_orders ${whereSql}`).bind(...params).first())?.c||0;
  const rows = await DB.prepare(`SELECT * FROM purchase_orders ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`).bind(...params,size,(page-1)*size).all();
  return ok(c,{page,size,total,items:rows.results||[]});
});
app.get('/api/pos/:id{[0-9]+}', async (c)=>{ const id=Number(c.req.param('id')); if(!Number.isInteger(id)||id<=0) return bad(c,'Invalid id'); const row=await c.env.DB.prepare('SELECT * FROM purchase_orders WHERE id = ?').bind(id).first(); if(!row) return bad(c,'Not found',404); return ok(c,row); });
app.post('/api/pos', async (c)=>{ const lvl=Number(c.req.header('x-user-level')||0); if(!canCreateEntries(lvl)) return bad(c,'forbidden',403); const b=await c.req.json().catch(()=>({})); const vendor_id=b.vendor_id?Number(b.vendor_id):null; const po_number=(b.po_number||'').toString().trim(); if(!po_number) return bad(c,'po_number required'); const items=b.items==null?null:JSON.stringify(b.items); const amount=b.amount?Number(b.amount):0; const status=PO_STATUSES.has((b.status||'pending').toString())?(b.status||'pending').toString():'pending'; await c.env.DB.prepare('INSERT INTO purchase_orders (vendor_id,po_number,items,amount,status,created_by_level) VALUES (?,?,?,?,?,?)').bind(toDb(vendor_id),po_number,items,amount,status,lvl).run(); const row=await c.env.DB.prepare('SELECT * FROM purchase_orders WHERE po_number = ?').bind(po_number).first(); return ok(c,row); });
app.put('/api/pos/:id{[0-9]+}', async (c)=>{ const lvl=Number(c.req.header('x-user-level')||0); if(!canCreateEntries(lvl)) return bad(c,'forbidden',403); const id=Number(c.req.param('id')); if(!Number.isInteger(id)||id<=0) return bad(c,'Invalid id'); const b=await c.req.json().catch(()=>({})); const fields=[],params=[]; for(const k of ['vendor_id','po_number','items','amount','status']){ if(k in b){ let v=b[k]; if(k==='items') v = (v==null?null:JSON.stringify(v)); params.push(v); fields.push(`${k} = ?`);} } if(!fields.length) return bad(c,'No updatable fields provided'); params.push(id); await c.env.DB.prepare(`UPDATE purchase_orders SET ${fields.join(', ')}, updated_at=CURRENT_TIMESTAMP WHERE id = ?`).bind(...params).run(); const row=await c.env.DB.prepare('SELECT * FROM purchase_orders WHERE id = ?').bind(id).first(); return ok(c,row); });
app.get('/api/pos/export.csv', async (c)=>{ const rows=await c.env.DB.prepare('SELECT id,vendor_id,po_number,amount,status,created_at FROM purchase_orders ORDER BY created_at DESC').all(); const items=rows.results||[]; const header=['id','vendor_id','po_number','amount','status','created_at']; const esc=(v)=>v==null?'':(/[",\n]/.test(String(v))?'"'+String(v).replace(/"/g,'""')+'"':String(v)); const csv=[header.join(',')].concat(items.map(r=>header.map(h=>esc(r[h])).join(','))).join('\n'); const today=new Date().toISOString().slice(0,10); return new Response(csv,{status:200,headers:{'Content-Type':'text/csv; charset=utf-8','Cache-Control':'no-store','Content-Disposition':`attachment; filename="pos_${today}.csv"`}}); });

// Invoices
const INV_STATUSES = new Set(['pending','approved','rejected','paid']);
app.get('/api/invoices', async (c)=>{ const DB=c.env.DB; const url=new URL(c.req.url); const page=Math.max(parseInt(url.searchParams.get('page')||'1',10),1); const size=Math.min(Math.max(parseInt(url.searchParams.get('size')||'25',10),1),100); const status=(url.searchParams.get('status')||'').trim(); const vendor_id=url.searchParams.get('vendor_id'); const where=[],params=[]; if(status){where.push('status=?'); params.push(status);} if(vendor_id){where.push('vendor_id=?'); params.push(Number(vendor_id));} const whereSql=where.length?`WHERE ${where.join(' AND ')}`:''; const total=(await DB.prepare(`SELECT COUNT(*) AS c FROM invoices ${whereSql}`).bind(...params).first())?.c||0; const rows=await DB.prepare(`SELECT * FROM invoices ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`).bind(...params,size,(page-1)*size).all(); return ok(c,{page,size,total,items:rows.results||[]}); });
app.get('/api/invoices/:id{[0-9]+}', async (c)=>{ const id=Number(c.req.param('id')); if(!Number.isInteger(id)||id<=0) return bad(c,'Invalid id'); const row=await c.env.DB.prepare('SELECT * FROM invoices WHERE id = ?').bind(id).first(); if(!row) return bad(c,'Not found',404); return ok(c,row); });
app.post('/api/invoices', async (c)=>{ const lvl=Number(c.req.header('x-user-level')||0); if(!canCreateEntries(lvl)) return bad(c,'forbidden',403); const b=await c.req.json().catch(()=>({})); const vendor_id=b.vendor_id?Number(b.vendor_id):null; const invoice_number=(b.invoice_number||'').toString().trim(); if(!invoice_number) return bad(c,'invoice_number required'); const amount=b.amount?Number(b.amount):0; const status=INV_STATUSES.has((b.status||'pending').toString())?(b.status||'pending').toString():'pending'; const due_date=b.due_date||null; await c.env.DB.prepare('INSERT INTO invoices (vendor_id,invoice_number,amount,status,due_date,created_by_level) VALUES (?,?,?,?,?,?)').bind(toDb(vendor_id),invoice_number,amount,status,toDb(due_date),lvl).run(); const row=await c.env.DB.prepare('SELECT * FROM invoices WHERE invoice_number = ?').bind(invoice_number).first(); return ok(c,row); });
app.put('/api/invoices/:id{[0-9]+}', async (c)=>{ const lvl=Number(c.req.header('x-user-level')||0); if(!canCreateEntries(lvl)) return bad(c,'forbidden',403); const id=Number(c.req.param('id')); if(!Number.isInteger(id)||id<=0) return bad(c,'Invalid id'); const b=await c.req.json().catch(()=>({})); const fields=[],params=[]; for(const k of ['vendor_id','invoice_number','amount','status','due_date']){ if(k in b){ params.push(b[k]); fields.push(`${k} = ?`);} } if(!fields.length) return bad(c,'No updatable fields provided'); params.push(id); await c.env.DB.prepare(`UPDATE invoices SET ${fields.join(', ')}, updated_at=CURRENT_TIMESTAMP WHERE id = ?`).bind(...params).run(); const row=await c.env.DB.prepare('SELECT * FROM invoices WHERE id = ?').bind(id).first(); return ok(c,row); });
app.get('/api/invoices/export.csv', async (c)=>{ const rows=await c.env.DB.prepare('SELECT id,vendor_id,invoice_number,amount,status,due_date,created_at FROM invoices ORDER BY created_at DESC').all(); const items=rows.results||[]; const header=['id','vendor_id','invoice_number','amount','status','due_date','created_at']; const esc=(v)=>v==null?'':(/[",\n]/.test(String(v))?'"'+String(v).replace(/"/g,'""')+'"':String(v)); const csv=[header.join(',')].concat(items.map(r=>header.map(h=>esc(r[h])).join(','))).join('\n'); const today=new Date().toISOString().slice(0,10); return new Response(csv,{status:200,headers:{'Content-Type':'text/csv; charset=utf-8','Cache-Control':'no-store','Content-Disposition':`attachment; filename="invoices_${today}.csv"`}}); });

// Delivery Challans (DC)
const DC_STATUSES = new Set(['pending','approved','rejected','delivered']);
app.get('/api/dcs', async (c)=>{ const DB=c.env.DB; const url=new URL(c.req.url); const page=Math.max(parseInt(url.searchParams.get('page')||'1',10),1); const size=Math.min(Math.max(parseInt(url.searchParams.get('size')||'25',10),1),100); const status=(url.searchParams.get('status')||'').trim(); const vendor_id=url.searchParams.get('vendor_id'); const where=[],params=[]; if(status){where.push('status=?'); params.push(status);} if(vendor_id){where.push('vendor_id=?'); params.push(Number(vendor_id));} const whereSql=where.length?`WHERE ${where.join(' AND ')}`:''; const total=(await DB.prepare(`SELECT COUNT(*) AS c FROM delivery_challans ${whereSql}`).bind(...params).first())?.c||0; const rows=await DB.prepare(`SELECT * FROM delivery_challans ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`).bind(...params,size,(page-1)*size).all(); return ok(c,{page,size,total,items:rows.results||[]}); });
app.get('/api/dcs/:id{[0-9]+}', async (c)=>{ const id=Number(c.req.param('id')); if(!Number.isInteger(id)||id<=0) return bad(c,'Invalid id'); const row=await c.env.DB.prepare('SELECT * FROM delivery_challans WHERE id = ?').bind(id).first(); if(!row) return bad(c,'Not found',404); return ok(c,row); });
app.post('/api/dcs', async (c)=>{ const lvl=Number(c.req.header('x-user-level')||0); if(!canCreateEntries(lvl)) return bad(c,'forbidden',403); const b=await c.req.json().catch(()=>({})); const vendor_id=b.vendor_id?Number(b.vendor_id):null; const dc_number=(b.dc_number||'').toString().trim(); if(!dc_number) return bad(c,'dc_number required'); const items=b.items==null?null:JSON.stringify(b.items); const status=DC_STATUSES.has((b.status||'pending').toString())?(b.status||'pending').toString():'pending'; await c.env.DB.prepare('INSERT INTO delivery_challans (vendor_id,dc_number,items,status,created_by_level) VALUES (?,?,?,?,?)').bind(toDb(vendor_id),dc_number,items,status,lvl).run(); const row=await c.env.DB.prepare('SELECT * FROM delivery_challans WHERE dc_number = ?').bind(dc_number).first(); return ok(c,row); });
app.put('/api/dcs/:id{[0-9]+}', async (c)=>{ const lvl=Number(c.req.header('x-user-level')||0); if(!canCreateEntries(lvl)) return bad(c,'forbidden',403); const id=Number(c.req.param('id')); if(!Number.isInteger(id)||id<=0) return bad(c,'Invalid id'); const b=await c.req.json().catch(()=>({})); const fields=[],params=[]; for(const k of ['vendor_id','dc_number','items','status']){ if(k in b){ let v=b[k]; if(k==='items') v=(v==null?null:JSON.stringify(v)); params.push(v); fields.push(`${k} = ?`);} } if(!fields.length) return bad(c,'No updatable fields provided'); params.push(id); await c.env.DB.prepare(`UPDATE delivery_challans SET ${fields.join(', ')}, updated_at=CURRENT_TIMESTAMP WHERE id = ?`).bind(...params).run(); const row=await c.env.DB.prepare('SELECT * FROM delivery_challans WHERE id = ?').bind(id).first(); return ok(c,row); });
app.get('/api/dcs/export.csv', async (c)=>{ const rows=await c.env.DB.prepare('SELECT id,vendor_id,dc_number,status,created_at FROM delivery_challans ORDER BY created_at DESC').all(); const items=rows.results||[]; const header=['id','vendor_id','dc_number','status','created_at']; const esc=(v)=>v==null?'':(/[",\n]/.test(String(v))?'"'+String(v).replace(/"/g,'""')+'"':String(v)); const csv=[header.join(',')].concat(items.map(r=>header.map(h=>esc(r[h])).join(','))).join('\n'); const today=new Date().toISOString().slice(0,10); return new Response(csv,{status:200,headers:{'Content-Type':'text/csv; charset=utf-8','Cache-Control':'no-store','Content-Disposition':`attachment; filename="dcs_${today}.csv"`}}); });

// CSV imports for PO, Invoices, DCs (upsert by unique number)
app.post('/api/pos/import.csv', async (c) => {
  const lvl=Number(c.req.header('x-user-level')||0); if(!canCreateEntries(lvl)) return bad(c,'forbidden',403);
  const ct=c.req.header('Content-Type')||''; let text='';
  if (ct.includes('multipart/form-data')) { const fd=await c.req.formData(); const f=fd.get('file'); if(!f) return bad(c,'file required'); text=await f.text(); } else { text=await c.req.text(); }
  if (!text) return bad(c,'Empty CSV');
  const lines=text.split(/\r?\n/).filter(l=>l.trim().length); if (lines.length<=1) return bad(c,'CSV must include header and at least one row');
  const header=lines[0].split(',').map(h=>h.trim()); const idx=(n)=>header.indexOf(n);
  if (idx('po_number')===-1) return bad(c,'Missing required column: po_number');
  const dry=c.req.header('x-dry-run')==='1'; let inserted=0,updated=0,skipped=0,errors=[];
  for(let i=1;i<lines.length;i++){
    const cols = lines[i].match(/(?:^|,)(?:\"([^\"]*)\"|([^,]*))/g)?.map(s=>s.replace(/^,/, '').replace(/^\"|\"$/g,'')) || lines[i].split(',');
    const rec=Object.fromEntries(header.map((h,j)=>[h, cols[j]??'']));
    const po_number=(rec.po_number||'').trim(); if(!po_number){skipped++; continue;}
    const vendor_id = rec.vendor_id? Number(rec.vendor_id) : null;
    const amount = rec.amount? Number(rec.amount) : 0;
    const status = rec.status? String(rec.status) : 'pending';
    try{
      const sql=`INSERT INTO purchase_orders (vendor_id,po_number,items,amount,status) VALUES (?,?,?,?,?) ON CONFLICT(po_number) DO UPDATE SET vendor_id=excluded.vendor_id, items=excluded.items, amount=excluded.amount, status=excluded.status, updated_at=CURRENT_TIMESTAMP`;
      if (!dry) { await c.env.DB.prepare(sql).bind(toDb(vendor_id), po_number, null, amount, status).run(); }
      dry?updated++:(inserted++); // we can't easily determine upsert, count as inserted; adjusted below
    }catch(e){ if((e.message||'').includes('UNIQUE')){ updated++; } else { errors.push(`Row ${i+1}: ${e.message||e}`);} }
  }
  try { await c.env.DB.prepare('INSERT INTO audit_log (actor_level, action, entity_type, payload) VALUES (?,?,?,?)').bind(lvl, dry?'import_dry_run':'import','pos_csv', JSON.stringify({inserted,updated,skipped,errorsCount:errors.length})).run(); } catch(_){ }
  return ok(c,{dryRun: dry, inserted, updated, skipped, errors});
});

app.post('/api/invoices/import.csv', async (c) => {
  const lvl=Number(c.req.header('x-user-level')||0); if(!canCreateEntries(lvl)) return bad(c,'forbidden',403);
  const ct=c.req.header('Content-Type')||''; let text='';
  if (ct.includes('multipart/form-data')) { const fd=await c.req.formData(); const f=fd.get('file'); if(!f) return bad(c,'file required'); text=await f.text(); } else { text=await c.req.text(); }
  if (!text) return bad(c,'Empty CSV');
  const lines=text.split(/\r?\n/).filter(l=>l.trim().length); if (lines.length<=1) return bad(c,'CSV must include header and at least one row');
  const header=lines[0].split(',').map(h=>h.trim()); const idx=(n)=>header.indexOf(n);
  if (idx('invoice_number')===-1) return bad(c,'Missing required column: invoice_number');
  const dry=c.req.header('x-dry-run')==='1'; let inserted=0,updated=0,skipped=0,errors=[];
  for(let i=1;i<lines.length;i++){
    const cols = lines[i].match(/(?:^|,)(?:\"([^\"]*)\"|([^,]*))/g)?.map(s=>s.replace(/^,/, '').replace(/^\"|\"$/g,'')) || lines[i].split(',');
    const rec=Object.fromEntries(header.map((h,j)=>[h, cols[j]??'']));
    const invoice_number=(rec.invoice_number||'').trim(); if(!invoice_number){skipped++; continue;}
    const vendor_id = rec.vendor_id? Number(rec.vendor_id) : null;
    const amount = rec.amount? Number(rec.amount) : 0;
    const status = rec.status? String(rec.status) : 'pending';
    const due_date = rec.due_date||null;
    try{
      const sql=`INSERT INTO invoices (vendor_id,invoice_number,amount,status,due_date) VALUES (?,?,?,?,?) ON CONFLICT(invoice_number) DO UPDATE SET vendor_id=excluded.vendor_id, amount=excluded.amount, status=excluded.status, due_date=excluded.due_date, updated_at=CURRENT_TIMESTAMP`;
      if (!dry) { await c.env.DB.prepare(sql).bind(toDb(vendor_id), invoice_number, amount, status, toDb(due_date)).run(); }
      dry?updated++:(inserted++);
    }catch(e){ if((e.message||'').includes('UNIQUE')){ updated++; } else { errors.push(`Row ${i+1}: ${e.message||e}`);} }
  }
  try { await c.env.DB.prepare('INSERT INTO audit_log (actor_level, action, entity_type, payload) VALUES (?,?,?,?)').bind(lvl, dry?'import_dry_run':'import','invoices_csv', JSON.stringify({inserted,updated,skipped,errorsCount:errors.length})).run(); } catch(_){ }
  return ok(c,{dryRun: dry, inserted, updated, skipped, errors});
});

app.post('/api/dcs/import.csv', async (c) => {
  const lvl=Number(c.req.header('x-user-level')||0); if(!canCreateEntries(lvl)) return bad(c,'forbidden',403);
  const ct=c.req.header('Content-Type')||''; let text='';
  if (ct.includes('multipart/form-data')) { const fd=await c.req.formData(); const f=fd.get('file'); if(!f) return bad(c,'file required'); text=await f.text(); } else { text=await c.req.text(); }
  if (!text) return bad(c,'Empty CSV');
  const lines=text.split(/\r?\n/).filter(l=>l.trim().length); if (lines.length<=1) return bad(c,'CSV must include header and at least one row');
  const header=lines[0].split(',').map(h=>h.trim()); const idx=(n)=>header.indexOf(n);
  if (idx('dc_number')===-1) return bad(c,'Missing required column: dc_number');
  const dry=c.req.header('x-dry-run')==='1'; let inserted=0,updated=0,skipped=0,errors=[];
  for(let i=1;i<lines.length;i++){
    const cols = lines[i].match(/(?:^|,)(?:\"([^\"]*)\"|([^,]*))/g)?.map(s=>s.replace(/^,/, '').replace(/^\"|\"$/g,'')) || lines[i].split(',');
    const rec=Object.fromEntries(header.map((h,j)=>[h, cols[j]??'']));
    const dc_number=(rec.dc_number||'').trim(); if(!dc_number){skipped++; continue;}
    const vendor_id = rec.vendor_id? Number(rec.vendor_id) : null;
    const status = rec.status? String(rec.status) : 'pending';
    let items = null; if ('items' in rec) { try { items = rec.items ? JSON.stringify(JSON.parse(rec.items)) : null; } catch { items = null; } }
    try{
      const sql=`INSERT INTO delivery_challans (vendor_id,dc_number,items,status) VALUES (?,?,?,?) ON CONFLICT(dc_number) DO UPDATE SET vendor_id=excluded.vendor_id, items=excluded.items, status=excluded.status, updated_at=CURRENT_TIMESTAMP`;
      if (!dry) { await c.env.DB.prepare(sql).bind(toDb(vendor_id), dc_number, items, status).run(); }
      dry?updated++:(inserted++);
    }catch(e){ if((e.message||'').includes('UNIQUE')){ updated++; } else { errors.push(`Row ${i+1}: ${e.message||e}`);} }
  }
  try { await c.env.DB.prepare('INSERT INTO audit_log (actor_level, action, entity_type, payload) VALUES (?,?,?,?)').bind(lvl, dry?'import_dry_run':'import','dcs_csv', JSON.stringify({inserted,updated,skipped,errorsCount:errors.length})).run(); } catch(_){ }
  return ok(c,{dryRun: dry, inserted, updated, skipped, errors});
});

});
app.post('/api/instruments/import.csv', async (c) => {
  const lvl = Number(c.req.header('x-user-level')||0);
  if (!canCreateEntries(lvl)) return bad(c,'forbidden',403);
  const ct = c.req.header('Content-Type')||'';
  let text='';
  if (ct.includes('multipart/form-data')) { const fd=await c.req.formData(); const f=fd.get('file'); if(!f) return bad(c,'file required'); text=await f.text(); } else { text=await c.req.text(); }
  if (!text) return bad(c,'Empty CSV');
  const lines = text.split(/\r?\n/).filter(l=>l.trim().length);
  if (lines.length<=1) return bad(c,'CSV must include header and at least one row');
  const header = lines[0].split(',').map(h=>h.trim());
  const idx=(n)=>header.indexOf(n);
  const req=['title']; for (const r of req) if (idx(r)===-1) return bad(c,`Missing required column: ${r}`);

  const dryRun = c.req.header('x-dry-run') === '1';
  let inserted=0, updated=0, skipped=0, errors=[];

  // cache type name -> id
  const typeCache = new Map();
  async function resolveTypeId(name){
    if (!name) return null;
    const key = String(name).toLowerCase();
    if (typeCache.has(key)) return typeCache.get(key);
    const row = await c.env.DB.prepare('SELECT id FROM instrument_types WHERE lower(name) = lower(?) LIMIT 1').bind(name).first();
    const id = row?.id || null;
    typeCache.set(key,id);
    return id;
  }
  const INSTR_ALLOWED = new Set(['pending','active','approved','rejected','expired']);

  for (let i=1;i<lines.length;i++){
    const cols = lines[i].match(/(?:^|,)(?:\"([^\"]*)\"|([^,]*))/g)?.map(s=>s.replace(/^,/, '').replace(/^\"|\"$/g,'')) || lines[i].split(',');
    const rec = Object.fromEntries(header.map((h,j)=>[h, cols[j]??'']));

    const title=(rec.title||'').trim();
    if(!title){skipped++; continue;}

    const type_name = (rec.type_name||'').toString();
    const type_id = await resolveTypeId(type_name);
    const reference_no = (rec.reference_no||'').toString().trim() || null;
    const vendor_id = rec.vendor_id? Number(rec.vendor_id) : null;
    const amount = rec.amount? Number(rec.amount) : 0;
    const currency = (rec.currency||'INR').toString();
    const statusRaw = (rec.status||'pending').toString();
    const status = INSTR_ALLOWED.has(statusRaw) ? statusRaw : 'pending';
    const issue_date = rec.issue_date || null;
    const expiry_date = rec.expiry_date || null;
    const document_url = rec.document_url || null;
    const notes = rec.notes || null;

    const detailsObj = parseDetailsByType(type_name, rec) || {};
    const bg_number = detailsObj.bg_number || null;
    const lc_number = detailsObj.lc_number || null;
    const utr = detailsObj.utr || null;
    const pfms_id = detailsObj.pfms_id || null;
    const gem_order_no = detailsObj.gem_order_no || null;
    const signer_id = detailsObj.signer_id || null;
    const hasDetails = Object.values(detailsObj).some(v => v !== undefined && v !== null && String(v).length>0);
    const details = hasDetails ? JSON.stringify(detailsObj) : null;

    try{
      if (dryRun) {
        if (reference_no) {
          const exists = await c.env.DB.prepare('SELECT id FROM financial_instruments WHERE reference_no = ?').bind(reference_no).first();
          if (exists) updated++; else inserted++;
        } else {
          inserted++;
        }
        continue;
      }
      if (reference_no) {
        const exists = await c.env.DB.prepare('SELECT id FROM financial_instruments WHERE reference_no = ?').bind(reference_no).first();
        const sql = `INSERT INTO financial_instruments (type_id,title,reference_no,vendor_id,amount,currency,status,issue_date,expiry_date,document_url,notes,details,bg_number,lc_number,utr,pfms_id,gem_order_no,signer_id)
                     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
                     ON CONFLICT(reference_no) DO UPDATE SET type_id=excluded.type_id, title=excluded.title, vendor_id=excluded.vendor_id, amount=excluded.amount, currency=excluded.currency, status=excluded.status, issue_date=excluded.issue_date, expiry_date=excluded.expiry_date, document_url=excluded.document_url, notes=excluded.notes, details=excluded.details, bg_number=excluded.bg_number, lc_number=excluded.lc_number, utr=excluded.utr, pfms_id=excluded.pfms_id, gem_order_no=excluded.gem_order_no, signer_id=excluded.signer_id, updated_at=CURRENT_TIMESTAMP`;
        await c.env.DB.prepare(sql).bind(
          toDb(type_id), toDb(title), toDb(reference_no), toDb(vendor_id), toDb(amount), toDb(currency), toDb(status), toDb(issue_date), toDb(expiry_date), toDb(document_url), toDb(notes), toDb(details), toDb(bg_number), toDb(lc_number), toDb(utr), toDb(pfms_id), toDb(gem_order_no), toDb(signer_id)
        ).run();
        if (exists) updated++; else inserted++;
      } else {
        await c.env.DB.prepare('INSERT INTO financial_instruments (type_id,title,reference_no,vendor_id,amount,currency,status,issue_date,expiry_date,document_url,notes,details,bg_number,lc_number,utr,pfms_id,gem_order_no,signer_id,created_by_level) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
          .bind(toDb(type_id), toDb(title), null, toDb(vendor_id), toDb(amount), toDb(currency), toDb(status), toDb(issue_date), toDb(expiry_date), toDb(document_url), toDb(notes), toDb(details), toDb(bg_number), toDb(lc_number), toDb(utr), toDb(pfms_id), toDb(gem_order_no), toDb(signer_id), lvl)
          .run();
        inserted++;
      }
    }catch(e){
      errors.push(`Row ${i+1}: ${e.message||e}`);
    }
  }
  try { await c.env.DB.prepare('INSERT INTO audit_log (actor_level, action, entity_type, payload) VALUES (?,?,?,?)').bind(lvl, dryRun?'import_dry_run':'import','instruments_csv', JSON.stringify({inserted,updated,skipped,errorsCount:errors.length})).run(); } catch(_){ }
  return ok(c,{dryRun, inserted, updated, skipped, errors});
});

// Reports
app.get('/api/reports/summary', async (c) => {
  const DB=c.env.DB;
  const vendor_count = (await DB.prepare('SELECT COUNT(*) AS c FROM vendors').first())?.c||0;
  const vendor_pending = (await DB.prepare("SELECT COUNT(*) AS c FROM vendors WHERE status='pending'").first())?.c||0;
  const payments_pending = (await DB.prepare("SELECT COUNT(*) AS c FROM payments WHERE status='pending'").first())?.c||0;
  const payments_done = (await DB.prepare("SELECT COUNT(*) AS c FROM payments WHERE status='done'").first())?.c||0;
  const instruments_active = (await DB.prepare("SELECT COUNT(*) AS c FROM financial_instruments WHERE status='active'").first())?.c||0;
  return ok(c,{vendor_count,vendor_pending,payments_pending,payments_done,instruments_active});
});

export default app;

