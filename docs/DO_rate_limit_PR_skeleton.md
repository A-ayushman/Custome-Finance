# PR: Durable Object-based per-IP rate limiting (POST/PUT/DELETE)

## Summary
Replace the current in-memory, per-isolate rate limiter with a Durable Object (DO) that enforces consistent per-IP limits across isolates/regions. This avoids gaps when Cloudflare routes subsequent requests to different worker instances.

## Goals
- Enforce per-IP limits for mutating methods (POST/PUT/DELETE)
- Default: 120 requests per 60s window (configurable)
- Return 429 with helpful message on exceed
- Preserve existing headers (Cache-Control, security headers)
- Minimal latency overhead (<3ms in-region)

## Design
- DO Name: RateLimiterDO
- Storage key: `${ip}:${method}` or `${ip}:mutating`
- Sliding window or fixed window with precise reset timestamps
- Use alarms for periodic cleanup (optional)

## Files to add
- workers-site/rate_limiter_do.js (Durable Object class)
- Update wrangler-worker.toml with DO binding:

```toml
[[durable_objects.bindings]]
name = "RATE_LIMITER"
class_name = "RateLimiterDO"

[[migrations]]
new_classes = ["RateLimiterDO"]
```

## Worker integration (pseudocode)
```js
// inside app.use('*', ...) early middleware
if (["POST","PUT","DELETE"].includes(method)) {
  const ip = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown';
  const id = c.env.RATE_LIMITER.idFromName(ip);
  const obj = c.env.RATE_LIMITER.get(id);
  const res = await obj.fetch('https://do/check', { method: 'POST', body: JSON.stringify({ ip }) });
  if (res.status === 429) return bad(c, 'Rate limit exceeded. Please retry later.', 429);
}
```

## DO handler (pseudocode)
```js
export class RateLimiterDO {
  constructor(state, env) { this.state = state; this.env = env; this.windowMs = 60_000; this.max = 120; }
  async fetch(req) {
    const now = Date.now();
    let data = await this.state.storage.get('bucket') || { start: now, count: 0 };
    if (now - data.start > this.windowMs) { data.start = now; data.count = 0; }
    data.count++;
    await this.state.storage.put('bucket', data);
    if (data.count > this.max) return new Response('rate_limited', { status: 429 });
    return new Response('ok');
  }
}
```

## Tests
- Burst > max in 60s from same client → 429
- Distributed requests across multiple isolates → still 429 after threshold
- Non-mutating methods unaffected

## Ops/Config
- No traffic loss on deployment (middleware path guarded, returns 429 only when threshold exceeded)
- Optionally make window and max configurable via settings table

## Risks
- Slight latency increase for mutating requests due to DO call
- If DO regionally far, latency may spike; consider setting a colo hint or keeping logic minimal

## Rollback
- Revert middleware to in-memory map (already present)
- Remove DO binding and migration from wrangler-worker.toml

## Checklist
- [ ] Add DO class file
- [ ] Bind DO in wrangler-worker.toml with migration
- [ ] Wire middleware before route handlers
- [ ] Add minimal telemetry (counts, lastLimitAt)
- [ ] Validate in staging under load
- [ ] Update docs/ with configuration notes
```