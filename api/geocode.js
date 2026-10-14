/** Vercel geocoding for Brazilian streets; precise names win over nearest POIs. */
import { nominatimToGeocodeResult } from '../src/nominatimGeocode.js';
import { rankBrazilCandidates } from '../src/search/brazilPrecision.js';
import { PUBLIC_BRAZIL_APIS } from '../src/config/publicBrazilApis.js';
const cache = new Map();
let nextAt = 0;
let serial = Promise.resolve();
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const UA = 'God-Eye-Brasil/1.2 (+https://github.com/W1CAPITAL/God-Eye)';
function provider() {
  const raw = process.env.NOMINATIM_SEARCH_URL || PUBLIC_BRAZIL_APIS.geography.nominatim;
  const url = new URL(raw);
  if (url.protocol!=='https:' || url.username || url.password || url.search || url.hash) throw new Error('Invalid provider');
  return url;
}
async function fromGoogle(q,brazil) {
  const key=process.env.GOOGLE_MAPS_SERVER_API_KEY || process.env.GOOGLE_GEOCODING_API_KEY;
  if (!key) return [];
  const url=new URL('https://maps.googleapis.com/maps/api/geocode/json');
  url.searchParams.set('address',q);
  url.searchParams.set('region','br');
  url.searchParams.set('language','pt-BR');
  if (brazil) url.searchParams.set('components','country:BR');
  url.searchParams.set('key',key);
  const reply=await fetch(url,{signal:AbortSignal.timeout(5000),headers:{Accept:'application/json'},redirect:'error'});
  if(!reply.ok) return [];
  const response=await reply.json();
  if(response?.status!=='OK') return [];
  return Array.isArray(response.results)?response.results:[];
}
async function fromOSM(q,brazil) {
  const run=serial.then(async()=>{
    const delay=Math.max(0,nextAt-Date.now());
    if(delay) await sleep(delay);
    nextAt=Date.now()+1200;
    const url=provider();
    url.searchParams.set('q',q);
    url.searchParams.set('format','jsonv2');
    url.searchParams.set('addressdetails','1');
    url.searchParams.set('limit','8');
    url.searchParams.set('accept-language','pt-BR');
    if(brazil)url.searchParams.set('countrycodes','br');
    const reply=await fetch(url,{headers:{'User-Agent':UA,Accept:'application/json'},redirect:'error',signal:AbortSignal.timeout(6000)});
    if(!reply.ok)throw new Error('Geocoder offline');
    const rows=await reply.json();
    if(!Array.isArray(rows))throw new Error('Invalid geocoder response');
    return rows.map(row=>{
      const place=nominatimToGeocodeResult(row);
      if(!place)return null;
      place.address={...(row.address||{}),country_code:row.address?.country_code||''};
      return place;
    }).filter(Boolean);
  });
  serial=run.catch(()=>null);
  return run;
}
function limitCache(){
  while(cache.size>200)cache.delete(cache.keys().next().value);
}
export default async function handler(req,res){
  if(req.method!=='GET')return res.status(405).json({error:'GET only'});
  const q=String(req.query?.q||'').trim();
  if(q.length<3||q.length>180||/[\x00-\x1f]/.test(q))return res.status(400).json({status:'INVALID_REQUEST',results:[],error:'Informe um endereço válido.'});
  const brazil=String(req.query?.country||'').toLowerCase()==='br';
  const key=(brazil?'BR':'WORLD')+':'+q.toLocaleLowerCase('pt-BR');
  const cached=cache.get(key);
  if(cached?.until>Date.now()) {
    res.setHeader('Cache-Control','public, s-maxage=120, stale-while-revalidate=300');
    return res.status(200).json(cached.value);
  }
  try {
    let fromOfficial=false;
    let rows=await fromGoogle(q,brazil).catch(()=>[]);
    if(rows.length)fromOfficial=true;
    if(!rows.length)rows=await fromOSM(q,brazil);
    const ranked=brazil?rankBrazilCandidates(q,rows):rows;
    const value=ranked.length?{status:'OK',results:ranked.slice(0,3).map(({address,...record})=>record),provider:fromOfficial?'google':'openstreetmap'}:{status:'ZERO_RESULTS',results:[]};
    if(!fromOfficial) {cache.set(key,{value,until:Date.now()+(ranked.length?600000:30000)});limitCache();}
    res.setHeader('Cache-Control',fromOfficial?'no-store':'public, s-maxage=120, stale-while-revalidate=300');
    return res.status(200).json(value);
  }catch {
    res.setHeader('Cache-Control','no-store');
    return res.status(503).json({status:'UNKNOWN_ERROR',results:[],error:'Busca de endereço temporariamente indisponível.'});
  }
}
