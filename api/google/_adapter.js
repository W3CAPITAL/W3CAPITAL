/**
 * Adapt the upstream localhost-only request gate to Vercel's trusted edge.
 * Validate browser origin and fetch metadata, then strip CDN forwarding fields
 * from the upstream middleware request (which otherwise rejects all proxies).
 */
import { googlePlacesContextProxy } from '../../server/providers/places/google.js';
import { PROXY_SIGNALS } from '../../src/localRequestGate.mjs';
const routes = new Map();
googlePlacesContextProxy().configureServer({middlewares:{use(path,handler){routes.set(path,handler);}}});
function deny(req) {
  const host=String(req.headers?.host||'').toLowerCase();
  if(!/^[a-z0-9.-]+(?::\d{1,5})?$/.test(host))return true;
  const site=String(req.headers?.['sec-fetch-site']||'').toLowerCase();
  if(site&&site!=='same-origin'&&site!=='none')return true;
  const origin=req.headers?.origin;
  if(origin){
    try {
      const parsed=new URL(origin);
      if(parsed.origin!=='https://'+host&&parsed.origin!=='http://'+host)return true;
      if(parsed.pathname!=='/'||parsed.search||parsed.hash)return true;
    }catch{return true;}
  }
  return false;
}
export function runOfficialGooglePlaces(route,req,res){
  if(deny(req)){
    res.statusCode=403;res.setHeader('Content-Type','application/json');res.end(JSON.stringify({error:'Origem não autorizada',places:[]}));return;
  }
  const fn=routes.get('/api/google/'+route);
  if(!fn){res.statusCode=404;res.end('Not found');return;}
  // The Vercel runtime is the trust boundary: its forwarding headers are a
  // normal property of this request, not proof of an external browser origin.
  const headers={...req.headers};
  for(const name of PROXY_SIGNALS)delete headers[name];
  const proxyReq=Object.create(req);
  Object.defineProperty(proxyReq,'headers',{value:headers,enumerable:true});
  Object.defineProperty(proxyReq,'socket',{value:{encrypted:true,remoteAddress:'vercel-edge'},enumerable:true});
  return fn(proxyReq,res);
}
