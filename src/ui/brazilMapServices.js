/**
 * Public Brazilian traffic-camera discovery. These are official CATALOG links,
 * not unverified private streams or imaginary precise camera coordinates.
 */
const SOURCES = Object.freeze({
  sp: [
    { name: 'CET · câmeras nas vias da capital', url: 'https://cameras.cetsp.com.br/View/Cam.aspx', kind: 'Cidade de São Paulo', official: true },
    { name: 'DER/SP · câmeras das rodovias estaduais', url: 'https://dersp.der.sp.gov.br/WebSite/Servicos/ServicosOnline/CamerasOnlineMapa.aspx', kind: 'Rodovias do estado de SP', official: true },
  ],
  rj: [
    { name: 'COR.Rio · portal oficial', url: 'https://cor.rio/', kind: 'Informações municipais; câmeras podem exigir o aplicativo COR.Rio', official: true },
  ],
});
const CET_NAMES = Object.freeze([
  'Ascendino Reis × Rua Pedro de Toledo',
  'Avenida Brasil × Brigadeiro Luís Antônio',
  'Avenida Brasil × Henrique Schaumann',
  'Brigadeiro Luís Antônio × Alameda Santos',
  'Cidade Jardim × Avenida Nove de Julho',
  'Consolação × Rua Caio Prado',
  'Hélio Pellegrino × Rua Diogo Jácome',
  'Ibirapuera × Rua Ipê',
  'Iguatemi × Brigadeiro Faria Lima',
  'Avenida Paulista × Brigadeiro Luís Antônio',
  'Avenida Paulista × Metrô Consolação',
]);
const normalize = text => String(text||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim();
const stopwords=new Set(['rua','avenida','av','r','praça','praca','de','da','do','dos','das','a','o','sao','paulo','brasil','sp','bairro','centro','cep']);
export function cameraRegion(query='', point=null) {
 const text=normalize(query);
 if(/\b(?:rj|rio de janeiro)\b/.test(text)) return 'rj';
 if(/\b(?:sp|sao paulo)\b/.test(text)) return 'sp';
 const lat=Number(point?.lat),lng=Number(point?.lng);
 if(Number.isFinite(lat)&&Number.isFinite(lng)) {
   if(lat>=-25.4&&lat<=-22.3&&lng>=-48.5&&lng<=-44.3)return 'sp';
   if(lat>=-23.4&&lat<=-20.7&&lng>=-44.9&&lng<=-40.5)return 'rj';
 }
 return null;
}
export function officialCameraSources(query='', point=null) {
 const region=cameraRegion(query,point);
 const sources=SOURCES[region]||[];
 const tokens=normalize(query).split(' ').filter(x=>x.length>=3&&!stopwords.has(x));
 const matches=region==='sp'&&tokens.length>0 ? CET_NAMES.filter(name=>{
   const label=normalize(name);
   return tokens.some(token=>label.includes(token));
 }) : [];
 return {region,sources,matches,query:String(query||'').trim()};
}
function linkElement(doc, name, url) {
 const a=doc.createElement('a');a.textContent=name;a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.className='br-service-link';return a;
}
export function attachBrazilMapServices({search,container,doc=document,getMapLocation=()=>null}={}){
 if(!search||!container)return ()=>{};
 const bar=doc.createElement('section');bar.className='br-services';bar.setAttribute('aria-label','Serviços de mapas e câmeras públicas do Brasil');
 const actions=doc.createElement('div');actions.className='br-services-actions';
 const google=linkElement(doc,'Abrir no Google Maps','https://www.google.com/maps');
 google.setAttribute('aria-label','Pesquisar o endereço no Google Maps oficial');
 const cameras=doc.createElement('button');cameras.type='button';cameras.textContent='Câmeras públicas BR';cameras.className='br-service-button';cameras.setAttribute('aria-expanded','false');
 const panel=doc.createElement('div');panel.className='br-cameras-results';panel.hidden=true;panel.setAttribute('role','region');panel.setAttribute('aria-label','Fontes oficiais de câmeras públicas');
 actions.append(google,cameras);bar.append(actions,panel);container.appendChild(bar);
 let destroyed=false;
 function currentQuery(){return String(search.value||'').trim();}
 function updateMaps(){
   const query=currentQuery();
   google.href=query?'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(query):'https://www.google.com/maps';
 }
 function show(){
   const {region,sources,matches,query}=officialCameraSources(currentQuery(),getMapLocation());
   panel.replaceChildren();
   const notice=doc.createElement('p');
   notice.textContent=region==='sp'?
     'Câmeras oficiais de São Paulo. A posição exata e a transmissão devem ser conferidas no site da fonte.':
     region==='rj'?'Fonte municipal do Rio de Janeiro; a disponibilidade das imagens depende do órgão.':
     'Ainda não há catálogo público verificado para esta região. Nenhuma câmera particular é acessada.';
   panel.appendChild(notice);
   if(region==='sp'&&query&&!matches.length){
     const info=doc.createElement('p');
     info.textContent='Nenhuma câmera da lista pública da CET coincide com esse nome de rua. Não serão mostradas câmeras distantes como “próximas”.';
     panel.appendChild(info);
   }
   if(matches.length){
     const title=doc.createElement('strong');title.textContent='Câmeras da CET com nomes correspondentes (localização aproximada; não é distância medida)';panel.appendChild(title);
     const ul=doc.createElement('ul');ul.className='br-camera-list';
     for(const name of matches){
       const li=doc.createElement('li');
       li.append(linkElement(doc,name,'https://cameras.cetsp.com.br/View/Cam.aspx'));
       ul.append(li);
     }
     panel.appendChild(ul);
   }
   for(const source of sources){
     const item=doc.createElement('div');item.className='br-source';
     item.append(linkElement(doc,source.name,source.url));
     const small=doc.createElement('span');small.textContent=source.kind;item.append(small);
     panel.append(item);
   }
 }
 function onToggle(){
   panel.hidden=!panel.hidden;
   cameras.setAttribute('aria-expanded',String(!panel.hidden));
   if(!panel.hidden)show();
 }
 function onInput(){updateMaps();if(!panel.hidden)show();}
 function onEscape(event){if(event.key==='Escape'&&!panel.hidden){panel.hidden=true;cameras.setAttribute('aria-expanded','false');cameras.focus();}}
 cameras.addEventListener('click',onToggle);search.addEventListener('input',onInput);bar.addEventListener('keydown',onEscape);
 updateMaps();
 return ()=>{if(destroyed)return;destroyed=true;cameras.removeEventListener('click',onToggle);search.removeEventListener('input',onInput);bar.removeEventListener('keydown',onEscape);bar.remove();};
}
