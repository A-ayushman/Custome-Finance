export async function onRequest(context) {
  const { request, next } = context;
  const res = await next();
  try {
    const ct = res.headers.get('content-type') || '';
    if (ct.indexOf('text/html') === -1) return res;

    const url = new URL(request.url);
    const host = url.host;
    const isStaging = host.indexOf('dashboard-staging') !== -1 || host.indexOf('odic-finance-ui.pages.dev') !== -1;
    const apiBase = isStaging ? 'https://api-staging.odicinternational.com' : 'https://api.odicinternational.com';

    const inject = `\n<script>(function(){
var BASE=${JSON.stringify(apiBase)};
try{window.ODIC_API_BASE_URL=BASE;}catch(e){}
try{var m=document.querySelector("meta[name=\"api-base-url\"]");if(m){m.setAttribute("content",BASE);}else{var mm=document.createElement("meta");mm.setAttribute("name","api-base-url");mm.setAttribute("content",BASE);document.head.appendChild(mm);}}catch(e){}
function toJSON(fd){var o={};fd.forEach(function(v,k){if(o[k]!==undefined){if(Array.isArray(o[k]))o[k].push(v);else o[k]=[o[k],v];}else{o[k]=v;}});return o;}
function pathOf(u){try{return new URL(u,location.href).pathname;}catch(e){return "";}}
function isApiPath(p){return typeof p==="string" && p.indexOf("/api/")===0;}
function rewrite(u){try{var U=new URL(u,location.href);var baseH=new URL(BASE).host;var h=U.host; if(isApiPath(U.pathname)){ if(h!==baseH && (h.indexOf("odicinternational.com")!==-1 || h.indexOf("workers.dev")!==-1)){ return BASE+U.pathname+U.search; } if(h===location.host){ return BASE+U.pathname+U.search; } } return U.href; }catch(e){ if(typeof u==="string"){ if(u.indexOf("/api/")===0) return BASE+u; if(u.indexOf("api/")===0) return BASE+"/"+u; } return u; }}
(function(){
  var __origFetch=window.fetch;
  function __isVendorPath(p){return p==="/api/vendors"||/^\/api\/vendors(\/|$)/.test(p);} 
  function __toObj(fd){var o={};fd.forEach(function(v,k){if(o[k]!==undefined){if(Array.isArray(o[k]))o[k].push(v);else o[k]=[o[k],v];}else{o[k]=v;}});return o;}
  async function __handleBodyForVendors(url,method,headers,body){
    try{
      var p=pathOf(url);
      if(!__isVendorPath(p))return {headers:headers,body:body};
      if(method!=="POST"&&method!=="PUT")return {headers:headers,body:body};
      if(body&&typeof FormData!=="undefined"&&body instanceof FormData){headers.set("Content-Type","application/json");return {headers:headers,body:JSON.stringify(__toObj(body))};}
      if(body&&typeof URLSearchParams!=="undefined"&&body instanceof URLSearchParams){headers.set("Content-Type","application/json");return {headers:headers,body:JSON.stringify(Object.fromEntries(body))};}
      if(body==null){return {headers:headers,body:JSON.stringify({})};}
      var ct=headers.get("content-type")||"";
      if(ct.indexOf("application/x-www-form-urlencoded")!==-1&&typeof body==="string"){var usp=new URLSearchParams(body);headers.set("Content-Type","application/json");return {headers:headers,body:JSON.stringify(Object.fromEntries(usp))};}
      return {headers:headers,body:body};
    }catch(e){return {headers:headers,body:body};}
  }
  function __patchedFetch(input,init){return (async function(){try{
    if(typeof input==="string"){var url=rewrite(input);var method=((init&&init.method)||"GET").toUpperCase();var headers=new Headers((init&&init.headers)||{});var body=init&&init.body;var hb=await __handleBodyForVendors(url,method,headers,body);var ni=Object.assign({},init||{},{headers:hb.headers,body:hb.body});return __origFetch(url,ni);} 
    if(input instanceof Request){var url0=input.url;var url=rewrite(url0);var method=(input.method||"GET").toUpperCase();var headers=new Headers(input.headers);var body=(init&&init.body)||undefined;return __origFetch(new Request(url,{method,headers,body,redirect:input.redirect,credentials:input.credentials,mode:input.mode,cache:input.cache,referrer:input.referrer,referrerPolicy:input.referrerPolicy,integrity:input.integrity}),(init||{}));}
    return __origFetch(input,init);
  }catch(e){return __origFetch(input,init);}})();}
  window.fetch=__patchedFetch;
  setInterval(function(){if(window.fetch!==__patchedFetch){window.fetch=__patchedFetch;}},1500);
})();
var _open=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(m,u){try{var nu=rewrite(u);return _open.apply(this,[m,nu].concat([].slice.call(arguments,2)));}catch(e){return _open.apply(this,arguments);}};
// Fallback capture submit → always send JSON to BASE/api/vendors
addEventListener("submit",function(e){var f=e.target;if(!(f&&f.tagName==="FORM"))return;var method=(f.getAttribute("method")||"POST").toUpperCase();var action=(f.getAttribute("action")||"").trim();var isV=(action===""||action==="/api/vendors"||/\/api\/vendors(\/?|$)/.test(action));if(method==="POST"&&isV){e.preventDefault();var BASE2=(window.ODIC_API_BASE_URL||"").replace(/\/$/,"");if(!BASE2){console.warn("ODIC API base missing");return;}var fd=new FormData(f);var body=toJSON(fd);fetch(BASE2+"/api/vendors",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}).then(function(r){return r.json()}).then(function(d){console.log("vendors create via JSON",d);dispatchEvent(new CustomEvent("vendors:create:result",{detail:d}));}).catch(function(err){console.error("vendors create error",err);});}},true);

// Permanent UX fix: fallback overlay for "+ Add New Vendor" button
(function(){
  function matchAddVendor(el){if(!el) return false; var t=(el.textContent||el.innerText||"").toLowerCase(); if(t.includes("add vendor")||t.includes("add new vendor")) return true; return false;}
  function createOverlay(){
    var o=document.createElement('div');
    o.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;';
    var b=document.createElement('div');
    b.style.cssText='background:#fff;max-width:560px;width:100%;border-radius:8px;box-shadow:0 8px 30px rgba(0,0,0,0.2);padding:20px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;';
    b.innerHTML = '<h3 style="margin:0 0 12px">Add Vendor</h3>\
      <form id="odic-add-vendor-form">\
        <label>Company Name*<br/><input name="company_name" required style="width:100%"/></label><br/><br/>\
        <label>GSTIN<br/><input name="gstin" placeholder="22ABCDE1234F1Z5" style="width:100%"/></label><br/><br/>\
        <label>PAN<br/><input name="pan" placeholder="ABCDE1234F" style="width:100%"/></label><br/><br/>\
        <label>Status<br/><select name="status"><option value="pending">pending</option><option value="approved">approved</option><option value="rejected">rejected</option><option value="suspended">suspended</option></select></label><br/><br/>\
        <div style="display:flex;gap:8px;justify-content:flex-end">\
          <button type="button" id="odic-cancel" style="padding:8px 12px">Cancel</button>\
          <button type="submit" style="padding:8px 12px;background:#006cff;color:#fff;border:0;border-radius:4px">Create</button>\
        </div>\
      </form>';
    o.appendChild(b);
    return o;
  }
  function openOverlay(){
    var ov=createOverlay();
    function close(){try{ov.remove();}catch(e){}}
    ov.addEventListener('click',function(e){if(e.target===ov) close();});
    var form=ov.querySelector('#odic-add-vendor-form');
    var cancel=ov.querySelector('#odic-cancel');
    if(cancel) cancel.addEventListener('click',function(){close();});
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var data={}; new FormData(form).forEach((v,k)=>{data[k]=v});
      var base=(window.ODIC_API_BASE_URL||'').replace(/\/$/,'');
      if(!base){alert('API base not set');return;}
      fetch(base+'/api/vendors',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}).then(r=>r.json()).then(d=>{
        if(d&&d.success){
          dispatchEvent(new CustomEvent('vendors:create:result',{detail:d}));
          close();
        }else{
          alert('Failed to create: '+(d&&d.error&&d.error.message||'unknown'));
        }
      }).catch(err=>{console.error('create vendor failed',err);alert('Request failed');});
    });
    document.body.appendChild(ov);
  }
  addEventListener('click',function(e){
    var el=e.target; // bubble up to find matching element
    for(var i=0;i<4 && el;i++,el=el.parentElement){ if(matchAddVendor(el)){ e.preventDefault(); openOverlay(); break; } }
  },true);
})();
})();</script>\n<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Crect width='32' height='32' rx='6' fill='%23006cff'/%3E%3Ctext x='6' y='22' font-size='16' fill='white'%3EOD%3C/text%3E%3C/svg%3E">\n`;

    const text = await res.text();
    const html = text.replace('</head>', inject + '</head>');
    const headers = new Headers(res.headers);
    headers.delete('content-length');
    return new Response(html, { status: res.status, headers });
  } catch (err) {
    return res;
  }
}
