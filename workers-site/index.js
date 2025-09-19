import { Hono } from 'hono';
import { cors } from 'hono/cors';

// Utility: basic JSON response helper
const ok = (c, data) => c.json({ success: true, data });
const bad = (c, message, status = 400) => c.json({ success: false, error: { message } }, status);

const app = new Hono();

// CORS: permissive for now; will restrict in prod via allowlist
app.use('/*', cors({
  origin: '*',
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

// Root route for basic API check
app.get('/', (c) => c.text('Welcome to ODIC Finance API'));

// Health check API
app.get('/api/health', (c) => ok(c, { status: 'healthy', version: '2.1.0', timestamp: new Date().toISOString() }));

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

app.get('/api/vendors/:id', async (c) => {
  const { DB } = c.env;
  const id = Number(c.req.param('id'));
  if (!id) return bad(c, 'Invalid vendor id', 400);
  const stmt = DB.prepare('SELECT * FROM vendors WHERE id = ?');
  const row = await stmt.bind(id).first();
  if (!row) return bad(c, 'Vendor not found', 404);
  return ok(c, row);
});

app.post('/api/vendors', async (c) => {
  const { DB } = c.env;
  const body = await c.req.json().catch(() => ({}));
  if (!body.company_name) return bad(c, 'company_name is required');

  // Normalize and validate fields
  const status = normalizeStatus(body.status) || 'pending';
  if (status && !ALLOWED_STATUSES.has(status)) {
    return bad(c, `Invalid status. Allowed: ${[...ALLOWED_STATUSES].join(', ')}`);
  }
  let rating = 0;
  if (typeof body.rating === 'number') rating = body.rating;

  try {
    const stmt = DB.prepare(`INSERT INTO vendors (company_name, legal_name, gstin, pan, address_lines, state, state_code, pin_code, contact_person, contact_number, email, business_type, status, rating, tags)
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
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
      body.tags === undefined || body.tags === null ? null : JSON.stringify(body.tags)
    ];
    const sanitized = params.map(v => (v === undefined ? null : v));
    const res = await stmt.bind(...sanitized).run();

    const id = res.lastRowId;
    const row = await DB.prepare('SELECT * FROM vendors WHERE id = ?').bind(id).first();
    return ok(c, row);
  } catch (e) {
    return bad(c, `Failed to create vendor: ${e.message || e}`, 400);
  }
});

app.put('/api/vendors/:id', async (c) => {
  const { DB } = c.env;
  const id = Number(c.req.param('id'));
  if (!id) return bad(c, 'Invalid vendor id', 400);
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
    const row = await DB.prepare('SELECT * FROM vendors WHERE id = ?').bind(id).first();
    return ok(c, row);
  } catch (e) {
    return bad(c, `Failed to update vendor: ${e.message || e}`, 400);
  }
});

// Example additional API route
app.get('/api/data', (c) => ok(c, { message: 'Here is some sample data' }));

export default app;

