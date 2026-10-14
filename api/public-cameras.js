import { findPublicBrazilCameras } from '../src/data/brCameras.js';
export default function handler(req,res) {
  if(req.method!=='GET') return res.status(405).json({error:'Apenas GET'});
  const query=String(req.query?.q??'').trim().slice(0,150);
  const sources=findPublicBrazilCameras(query).slice(0,22);
  res.setHeader('Cache-Control','public, s-maxage=3600');
  return res.status(200).json({sources,liveFeedsEmbedded:0,notice:'Links de consultas públicas oficiais. A disponibilidade das imagens depende do operador; não são endereços diretos de vídeo.'});
}
