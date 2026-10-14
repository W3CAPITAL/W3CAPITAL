/**
 * Verified public camera *directory entries*. A link is not a promise of an
 * active feed and none of these carries a made-up coordinate.
 * São Paulo's published CET favorites:
 * https://cameras.cetsp.com.br/View/Cam.aspx
 * https://www.cetsp.com.br/consultas/cameras-cet.aspx
 * Highway camera catalogue: https://dersp.der.sp.gov.br/WebSite/Servicos/ServicosOnline/CamerasOnlineMapa.aspx
 */
import { PUBLIC_BRAZIL_APIS } from '../config/publicBrazilApis.js';
const CET = PUBLIC_BRAZIL_APIS.cameras.cetSp;
const DER = PUBLIC_BRAZIL_APIS.cameras.derSp;
const cameras=[
 ['Ascendino Reis × Rua Pedro de Toledo','ascendino reis pedro de toledo'],
 ['Av. Brasil × Av. Brigadeiro Luís Antônio','brasil brigadeiro luis antonio'],
 ['Av. Brasil × Av. Henrique Schaumann','brasil henrique schaumann'],
 ['Av. Brigadeiro Luís Antônio × Alameda Santos','brigadeiro luis antonio alameda santos'],
 ['Av. Cidade Jardim × Av. Nove de Julho','cidade jardim nove de julho'],
 ['Rua da Consolação × Rua Caio Prado','consolacao caio prado'],
 ['Av. Hélio Pellegrino × Rua Diogo Jácome','helio pellegrino diogo jacome'],
 ['Av. Ibirapuera × Rua Ipê','ibirapuera ipe'],
 ['Av. Iguatemi × Av. Brigadeiro Faria Lima','iguatemi brigadeiro faria lima'],
 ['Av. Paulista × Av. Brigadeiro Luís Antônio','paulista brigadeiro luis antonio'],
 ['Av. Paulista × Metrô Consolação','paulista metro consolacao'],
];
const entries=cameras.map(([name,street],idx)=>Object.freeze({
 id:'cet-'+(idx+1),state:'SP',city:'São Paulo',name,
 url:CET,type:'verified-directory-entry',agency:'CET-SP',street
}));
const portals=[
 {id:'cet-sp-portal',state:'SP',city:'São Paulo',name:'Câmeras oficiais CET — São Paulo',url:CET,type:'portal',agency:'CET-SP',street:'principais vias paulistas'},
 {id:'der-sp-portal',state:'SP',city:'São Paulo',name:'Mapa oficial DER — rodovias do estado',url:DER,type:'portal',agency:'DER-SP',street:'rodovia estado de sao paulo sp'},
 {id:'rj-cor-portal',state:'RJ',city:'Rio de Janeiro',name:'Centro de Operações Rio — câmeras públicas',url:PUBLIC_BRAZIL_APIS.cameras.corRio,type:'portal',agency:'COR.Rio',street:'transito rio de janeiro'},
 {id:'bh-sumob-portal',state:'MG',city:'Belo Horizonte',name:'SUMOB — informação municipal',url:PUBLIC_BRAZIL_APIS.cameras.sumobBh,type:'portal',agency:'Prefeitura de Belo Horizonte',street:'transito belo horizonte'}
];
export const BRAZIL_CAMERA_SOURCES=Object.freeze([...portals,...entries]);
export function normalizeBrText(value){
  return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^\p{L}\p{N}]/gu,' ').replace(/\s+/g,' ').trim();
}
const STATES={SP:/\b(?:sp|sao paulo|paulista|pinheiros|consolacao|faria lima|santana|jardins|ibirapuera|tiete|santo amaro|itaquera|moema|centro de sao paulo)\b/, RJ:/\b(?:rj|rio de janeiro|copacabana|ipanema|barra da tijuca)\b/, MG:/\b(?:mg|belo horizonte|contagem|savassi)\b/};
const GENERIC=new Set(['avenida','rua','estado','cidade','bairro','paulo','sao','brasil','centro','perto','cameras','camera','rodovia','regiao','local']);
export function findPublicBrazilCameras(q){
  const search=normalizeBrText(q);
  const selected=Object.keys(STATES).filter(state=>STATES[state].test(search));
  const region=selected.length===1?selected[0]:null;
  // No match on an exact road does not mean the next camera is "nearby".
  const significant=search.split(' ').filter(word=>word.length>3&&!GENERIC.has(word));
  const candidates=BRAZIL_CAMERA_SOURCES.filter(item=>!region||item.state===region);
  const scored=candidates.map(item=>{
    const normalized=normalizeBrText(item.name+' '+item.street+' '+item.city);
    const relevance=significant.filter(word=>normalized.split(' ').includes(word)).length;
    return {...item,relevance};
  });
  // Show precise, source-published entries only when at least one street token matches.
  // Always retain government catalogues so users can search a different road there.
  const entries=scored.filter(item=>item.type!=='portal'&&item.relevance>0)
    .sort((a,b)=>b.relevance-a.relevance||a.name.localeCompare(b.name,'pt-BR'));
  return [...entries,...scored.filter(item=>item.type==='portal')];
}
