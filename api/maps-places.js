/** Official Google Places Text Search, not a scraper. Results are shown with attribution and Google Maps links. */
const buckets = new Map();
function admission(req) {
 const ip=String(req.headers?.['x-vercel-forwarded-for']||req.headers?.['x-real-ip']||'anonymous').split(',')[0].slice(0,75);
 const now=Date.now();
 const b=buckets.get(ip);
 if(!b||now-b.since>60000){buckets.set(ip,{since:now,count:1});return true;}
 if(b.count>=8)return false;
 b.count++;
 if(buckets.size>500)buckets.delete(buckets.keys().next().value);
 return true;
}
export default async function handler(req,res) {
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='GET')return res.status(405).json({places:[],error:'Método inválido'});
 const q=String(req.query?.q||'').trim();
 if(q.length<3||q.length>120||/[\x00-\x1f]/.test(q))return res.status(400).json({places:[],error:'Informe um estabelecimento, lugar ou endereço.'});
 const key=process.env.GOOGLE_MAPS_SERVER_API_KEY || process.env.GOOGLE_PLACES_API_KEY;
 if(!key)return res.status(200).json({configured:false,places:[],error:null,notice:'Configure GOOGLE_MAPS_SERVER_API_KEY na Vercel para ativar a pesquisa oficial de locais.'});
 if(!admission(req))return res.status(429).json({configured:true,places:[],error:'Limite temporário de consultas.',retryAfter:60});
 try{
  const response=await fetch('https://places.googleapis.com/v1/places:searchText',{
    method:'POST',redirect:'error',signal:AbortSignal.timeout(6500),
    headers:{'Content-Type':'application/json','X-Goog-Api-Key':key,'X-Goog-FieldMask':'places.id,places.displayName,places.formattedAddress,places.googleMapsUri,places.location,places.primaryType'},
    body:JSON.stringify({textQuery:q,languageCode:'pt-BR',regionCode:'BR',maxResultCount:10})
  });
  const data=await response.json().catch(()=>({}));
  if(!response.ok)return res.status(502).json({configured:true,places:[],error:'Google Places indisponível ou chave sem permissão.'});
  const places=(Array.isArray(data.places)?data.places:[]).slice(0,10).map(p=>({
    id:String(p.id||'').slice(0,140),
    name:String(p.displayName?.text||'').slice(0,180),
    address:String(p.formattedAddress||'').slice(0,260),
    mapsUrl:typeof p.googleMapsUri==='string'&&/^https:\/\/(?:www\.google\.com\/maps\/|maps\.google\.com\/)/.test(p.googleMapsUri)?p.googleMapsUri:null,
    // These coordinates are NOT exported to Cesium; Google display terms apply.
    type:String(p.primaryType||'').slice(0,70)
  })).filter(p=>p.id&&p.name);
  return res.status(200).json({configured:true,places,attribution:'Google Maps',error:null});
 }catch{
  return res.status(503).json({configured:true,places:[],error:'Não foi possível consultar o Google Maps agora.'});
 }
}
