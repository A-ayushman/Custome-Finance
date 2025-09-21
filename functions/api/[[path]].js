export async function onRequest(context) {
  const { request } = context;
  try {
    const url = new URL(request.url);
    const host = url.host;
    const isStaging =
      host.indexOf('dashboard-staging') !== -1 ||
      host.indexOf('odic-finance-ui.pages.dev') !== -1;
    const apiBase = isStaging
      ? 'https://api-staging.odicinternational.com'
      : 'https://api.odicinternational.com';

    const upstream = new URL(apiBase);
    const pathAfterApi = url.pathname.replace(/^\/api\/?/, '');
    const targetUrl = upstream.origin + '/api/' + pathAfterApi + url.search;

    const method = request.method.toUpperCase();
    const reqHeaders = new Headers(request.headers);
    reqHeaders.set('Cache-Control', 'no-store');

    let body = request.body;
    const contentType = reqHeaders.get('content-type') || '';

    const isVendorsEndpoint = /^vendors(\b|\/)/.test(pathAfterApi);
    const isRolesEndpoint = /^roles(\b|\/)/.test(pathAfterApi);
    const isMutating = method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE';

    if (isMutating && (isVendorsEndpoint || isRolesEndpoint)) {
      try {
        if (contentType.indexOf('multipart/form-data') !== -1) {
          const fd = await request.formData();
          const obj = {};
          fd.forEach((v, k) => {
            if (obj[k] !== undefined) {
              if (Array.isArray(obj[k])) obj[k].push(v);
              else obj[k] = [obj[k], v];
            } else {
              obj[k] = v;
            }
          });
          body = JSON.stringify(obj);
          reqHeaders.set('content-type', 'application/json');
        } else if (contentType.indexOf('application/x-www-form-urlencoded') !== -1) {
          const text = await request.text();
          const usp = new URLSearchParams(text);
          const obj = Object.fromEntries(usp);
          body = JSON.stringify(obj);
          reqHeaders.set('content-type', 'application/json');
        }
      } catch (e) { /* passthrough */ }
    }

    reqHeaders.delete('host');
    reqHeaders.delete('content-length');
    reqHeaders.delete('origin');

    const resp = await fetch(targetUrl, { method, headers: reqHeaders, body });

    const outHeaders = new Headers(resp.headers);
    outHeaders.set('Cache-Control', 'no-store');
    outHeaders.set('X-Content-Type-Options', 'nosniff');
    outHeaders.set('Referrer-Policy', 'no-referrer');
    outHeaders.set('X-Frame-Options', 'DENY');
    if (!outHeaders.has('Permissions-Policy')) {
      outHeaders.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    }

    return new Response(resp.body, { status: resp.status, headers: outHeaders });
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: 'proxy_error', message: String(err) }),
      { status: 502, headers: { 'content-type': 'application/json' } }
    );
  }
}
