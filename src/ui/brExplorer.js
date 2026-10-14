import './brExplorer.css';
import {SP_DISTRICTS} from '../data/spDistricts.js';

/**
 * Lightweight, accessible São Paulo / Brazil map companion.
 * Official cameras are linked, not proxied; Google Places results are only shown
 * here with attribution, never overlaid on non-Google map tiles.
 */
export function installBrazilExplorer({doc=document,fetchImpl=fetch}={}) {
 if(doc.getElementById('br-explorer-launcher')) return;
 const button=(label,cls='')=>{
   const element=doc.createElement('button');element.type='button';element.className=cls;element.textContent=label;return element;
 };
 const launcher=button('☷  BRASIL · MAPAS + CÂMERAS','br-explorer-launcher');
 launcher.id='br-explorer-launcher';
 launcher.setAttribute('aria-label','Abrir consulta brasileira de mapas e câmeras públicas');
 launcher.setAttribute('aria-expanded','false');
 launcher.setAttribute('aria-controls','br-explorer-dialog');
 const dialog=doc.createElement('section');dialog.id='br-explorer-dialog';dialog.className='br-explorer-panel';dialog.hidden=true;
 dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','false');dialog.setAttribute('aria-label','Explorador do Brasil');
 const heading=doc.createElement('div');heading.className='br-explorer-heading';
 const title=doc.createElement('strong');title.textContent='EXPLORADOR DO BRASIL';
 const close=button('×','br-explorer-close');close.setAttribute('aria-label','Fechar explorador');
 heading.append(title,close);
 const tabs=doc.createElement('div');tabs.className='br-explorer-tabs';tabs.setAttribute('role','group');tabs.setAttribute('aria-label','Tipo de pesquisa');
 const cameras=button('📷 Câmeras públicas','br-tab active');
 const google=button('◉ Google Maps · Locais','br-tab');
 cameras.setAttribute('aria-pressed','true');google.setAttribute('aria-pressed','false');
 const districts=button('◈ 96 distritos SP','br-tab');districts.setAttribute('aria-pressed','false');
 const municipalities=button('⌂ Municípios SP · IBGE','br-tab');municipalities.setAttribute('aria-pressed','false');
 tabs.append(cameras,google,districts,municipalities);
 const form=doc.createElement('form');form.className='br-explorer-search';
 const input=doc.createElement('input');input.type='search';input.name='q';input.maxLength=120;input.value='São Paulo';input.placeholder='Rua, avenida, bairro ou cidade';input.setAttribute('aria-label','Pesquisar locais do Brasil');
 const submit=button('Pesquisar','br-explorer-submit');submit.type='submit';form.append(input,submit);
 const notice=doc.createElement('p');notice.className='br-explorer-note';
 notice.textContent='Acesse somente câmeras públicas nos portais oficiais. Sem imagens simuladas ou localização presumida.';
 const results=doc.createElement('div');results.className='br-explorer-results';results.setAttribute('aria-live','polite');
 const source=doc.createElement('div');source.className='br-explorer-source';source.textContent='Fonte: CET São Paulo, DER-SP e portais governamentais';
 const footer=doc.createElement('div');footer.className='br-explorer-footer';
 const threeD=button('◈ Ativar Google 3D','br-explorer-three-d');
 const sourceHint=doc.createElement('span');sourceHint.textContent='3D real exige chave Maps Tiles ou Cesium ion';
 footer.append(threeD,sourceHint);dialog.append(heading,tabs,form,notice,results,source,footer);
 doc.body.append(launcher,dialog);
 let kind='cameras',controller=null,seq=0,spOffset=0;
 const say=text=>{results.replaceChildren();const p=doc.createElement('p');p.className='br-explorer-message';p.textContent=text;results.appendChild(p);};
 function item(name,description,url,credit){
   const article=doc.createElement('article');article.className='br-explorer-item';
   const label=doc.createElement('strong');label.textContent=name;
   const subtitle=doc.createElement('small');subtitle.textContent=description;
   article.append(label,subtitle);
   if(url&&/^https:\/\//.test(url)){
     const link=doc.createElement('a');link.textContent='Abrir fonte oficial ↗';link.href=url;link.target='_blank';link.rel='noopener noreferrer';
     article.appendChild(link);
   }
   if(credit){const c=doc.createElement('small');c.textContent=credit;article.appendChild(c);}
   results.appendChild(article);
 }
 function showDistricts(){
   const q=input.value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');
   results.replaceChildren();notice.textContent='96 distritos oficiais de São Paulo. A localização é consultada pelo nome real, não por coordenadas inventadas.';
   source.textContent='Fonte: Prefeitura de São Paulo · Tabela oficial de distritos';
   let total=0;
   for(const name of SP_DISTRICTS){
     if(q&&!name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').includes(q))continue;
     const chip=button(name,'br-district-chip');chip.title='Localizar '+name+' no mapa 3D';
     chip.addEventListener('click',()=>{
       const locationInput=doc.getElementById('location-search');
       if(!locationInput){say('Barra de navegação ainda não foi carregada.');return;}
       locationInput.value=name+', São Paulo, SP';
       locationInput.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));
       setOpen(false);
     });
     results.appendChild(chip);total++;
   }
   if(!total)say('Nenhum distrito encontrado.');
 }
 async function search(){
   if(kind==='districts'){showDistricts();return;}
   const q=input.value.trim();
   if(kind!=='municipios' && q.length<2){say('Informe uma rua, bairro ou cidade.');return;}
   controller?.abort();controller=new AbortController();const current=++seq;
   submit.disabled=true;submit.textContent='Buscando…';say('Consultando as fontes…');
   try{
     const endpoint=kind==='cameras'?'/api/public-cameras':kind==='municipios'?'/api/sp-municipios':'/api/maps-places';
     const requestUrl=endpoint+'?q='+encodeURIComponent(q)+(kind==='municipios'?'&offset='+spOffset:'');
     const response=await fetchImpl(requestUrl,{signal:controller.signal});
     if(!response.ok)throw new Error('HTTP '+response.status);
     const data=await response.json();if(current!==seq)return;
     results.replaceChildren();
     if(kind==='cameras'){
       notice.textContent='Selecione uma fonte oficial. A disponibilidade de cada câmera é definida pelo operador. Não há vídeo inventado.';
       source.textContent='Portais oficiais · CET-SP · DER-SP · SUMOB · Prefeitura do Rio';
       for(const record of data.sources||[])item(record.name,record.agency+' · '+record.city+'/'+record.state+' · consultar no portal',record.url);
       if(!data.sources?.length)say('Nenhum portal oficial catalogado para esta região.');
     } else if (kind==='municipios') {
       notice.textContent='Municípios oficiais do estado de São Paulo (IBGE). A pesquisa de cada município é feita pelo nome, sem coordenadas inventadas.';
       source.textContent='Fonte: IBGE · API pública de Localidades';
       const found=Array.isArray(data.municipalities)?data.municipalities:[];
       for(const city of found) {
         const chip=button(city.name+' · SP','br-district-chip');
         chip.title='Localizar '+city.name+' no mapa';
         chip.addEventListener('click',()=>{
           const locationInput=doc.getElementById('location-search');
           if(!locationInput){say('Barra de navegação ainda não foi carregada.');return;}
           locationInput.value=city.name+', São Paulo, Brasil';
           locationInput.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));
           setOpen(false);
         });
         results.appendChild(chip);
       }
       if(!found.length){say('Nenhum município encontrado.');}
       const nav=doc.createElement('div');nav.className='br-explorer-pages';
       const count=doc.createElement('small');count.textContent='Exibindo '+(found.length?spOffset+1:0)+'–'+(spOffset+found.length)+' de '+(data.total||0)+' municípios';
       const prev=button('← Anterior','br-district-chip');prev.disabled=spOffset<=0;
       const next=button('Próximos →','br-district-chip');next.disabled=spOffset+found.length>=(data.total||0);
       prev.addEventListener('click',()=>{spOffset=Math.max(0,spOffset-40);void search();});
       next.addEventListener('click',()=>{spOffset+=40;void search();});
       nav.append(prev,count,next);results.appendChild(nav);
     } else {
       notice.textContent='Resultados oficiais do Google Maps, com atribuição. Clique para visualizar no próprio Google Maps.';
       source.textContent='Dados e nomes de locais © Google Maps';
       if(!data.configured){say('Google Places não está configurado na Vercel. Defina GOOGLE_MAPS_SERVER_API_KEY no ambiente de produção.');return;}
       if(data.error){say(data.error);return;}
       for(const place of data.places||[])item(place.name,place.address,place.mapsUrl||('https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(place.name+' '+place.address)),'Fonte: Google Maps');
       if(!data.places?.length)say('Nenhum local correspondente encontrado.');
     }
   }catch(error){if(error.name!=='AbortError')say('Falha temporária na pesquisa. Tente novamente.');}
   finally{if(current===seq){submit.disabled=false;submit.textContent='Pesquisar';}}
 }
 function changeTab(next){
   kind=next;spOffset=0;cameras.classList.toggle('active',next==='cameras');google.classList.toggle('active',next==='google');districts.classList.toggle('active',next==='districts');municipalities.classList.toggle('active',next==='municipios');
   cameras.setAttribute('aria-pressed',String(next==='cameras'));google.setAttribute('aria-pressed',String(next==='google'));
   districts.setAttribute('aria-pressed',String(next==='districts'));
   municipalities.setAttribute('aria-pressed',String(next==='municipios'));
   input.value=next==='districts'||next==='municipios'?'':'São Paulo';
   input.placeholder=next==='districts'?'Filtrar 96 distritos...':next==='municipios'?'Filtrar municípios de São Paulo...':'Rua, avenida, bairro ou cidade';
   void search();
 }
 function setOpen(open){
   dialog.hidden=!open;launcher.setAttribute('aria-expanded',String(open));
   if(open){input.focus();void search();}
   else{controller?.abort();launcher.focus();}
 }
 launcher.addEventListener('click',()=>setOpen(dialog.hidden));
 close.addEventListener('click',()=>setOpen(false));
 cameras.addEventListener('click',()=>changeTab('cameras'));
 google.addEventListener('click',()=>changeTab('google'));
 districts.addEventListener('click',()=>changeTab('districts'));
 municipalities.addEventListener('click',()=>changeTab('municipios'));
 input.addEventListener('input',()=>{if(kind==='districts')showDistricts();if(kind==='municipios')spOffset=0;});
 form.addEventListener('submit',(event)=>{event.preventDefault();void search();});
 doc.addEventListener('keydown',(event)=>{if(event.key==='Escape'&&!dialog.hidden)setOpen(false);});
 threeD.addEventListener('click',()=>{
   const target=doc.querySelector('#map-stack-chips [data-stack-id="photoreal"]');
   if(target&&!target.hasAttribute('disabled')&&target.getAttribute('aria-disabled')!=='true')target.click();
   else say('Para usar prédios fotorrealistas 3D, configure GOOGLE_MAPS_API_KEY ou CESIUM_ION_TOKEN na Vercel e escolha Google 3D em Fonte do mapa.');
 });
}
