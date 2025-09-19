import { Hono } from 'hono';
import { cors } from 'hono/cors';

// Utility: basic JSON response helper
const ok = (c, data) => c.json({ success: true, data });
const bad = (c, message, status = 400) => c.json({ success: false, error: { message } }, status);

const app = new Hono();

// In production, lock CORS to your Pages domain(s)
const ALLOWED_ORIGINS = [
  'https://odic-finance-ui.pages.dev',
  // Add custom domains here, e.g. 'https://finance.example.com'
];
app.use('/*', cors({
  origin: (origin) => {
    if (!origin) return '*'; // allow curl / server-to-server
    try {
      const o = new URL(origin).origin;
      return ALLOWED_ORIGINS.includes(o) ? o : '*';
    } catch {
      return '*';
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
  if (!Number.isInteger(id) || id <= 0) return bad(c, 'Invalid vendor id', 400);
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

    const row = await DB.prepare('SELECT * FROM vendors WHERE id = ?').bind(id).first();
    return ok(c, row);
  } catch (e) {
    if ((e.message || '').includes('UNIQUE') && (e.message || '').includes('gstin')) {
      return bad(c, 'GSTIN already exists', 409);
    }
    return bad(c, `Failed to create vendor: ${e.message || e}`, 400);
  }
});

app.put('/api/vendors/:id', async (c) => {
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
  const row = await DB.prepare('SELECT 1 AS exists FROM vendors WHERE gstin = ? LIMIT 1').bind(gstin).first();
  const available = !row;
  return ok(c, { gstin, available });
});

// Example additional API route
app.get('/api/data', (c) => ok(c, { message: 'Here is some sample data' }));

export default app;

