/** Aplicação pública W3: interface pt-BR, inclusive painéis carregados após a inicialização. */
export const PT_BR_UI = Object.freeze({
  'DATA LAYERS':'CAMADAS DE DADOS','DISPLAY':'VISUALIZAÇÃO',
  'LOCATION':'LOCALIZAÇÃO','MAP SOURCE':'FONTE DO MAPA','Map source':'Fonte do mapa',
  'VISUAL PRESETS':'EFEITOS VISUAIS','ACTIVE STYLE':'ESTILO ATIVO',
  'RECENT IMAGERY':'IMAGENS RECENTES','WEATHER':'METEOROLOGIA',
  'CONTEXT':'CONTEXTO','CONTACTS':'CONTATOS','SPACE MISSIONS':'MISSÕES ESPACIAIS',
  'SELECT CONTEXT':'SELECIONE O CONTEXTO','AVAILABLE MISSIONS':'MISSÕES DISPONÍVEIS',
  'SELECT A MISSION TO INSPECT':'SELECIONE UMA MISSÃO',
  'LOADING 30-DAY MISSION INDEX':'CARREGANDO MISSÕES DOS ÚLTIMOS 30 DIAS',
  'COCKPIT':'CABINE','SEARCH NEARBY SITES':'BUSCAR LOCAIS PRÓXIMOS',
  'Street Traffic':'Trânsito nas ruas','TRAFFIC':'TRÂNSITO',
  'Show traffic':'Mostrar trânsito','SOURCE':'FONTE','UNKNOWN':'DESCONHECIDO',
  'Enable CCTV to load camera intersections':'Ative as câmeras para consultar cruzamentos',
  'CCTV OFF':'CÂMERAS DESLIGADAS','CCTV ON':'CÂMERAS LIGADAS',
  'NEAREST':'MAIS PRÓXIMA','PREV':'ANTERIOR','NEXT':'PRÓXIMA',
  'FOCUS':'FOCAR','COVERAGE OFF':'COBERTURA DESLIGADA',
  'COVERAGE ON':'COBERTURA LIGADA','AUTO HOP OFF':'ROTA AUTOMÁTICA DESLIGADA',
  'PROJECTION ON':'PROJEÇÃO LIGADA','PROJECTION OFF':'PROJEÇÃO DESLIGADA',
  'PARAMETERS':'PARÂMETROS','Density':'Densidade','Speed':'Velocidade',
  'SIMULATED':'SIMULADO','UNAVAILABLE':'INDISPONÍVEL',
  'LIVE':'AO VIVO','LOADING':'CARREGANDO','LOAD FAILED':'FALHA NO CARREGAMENTO',
  'LOAD COMPLETE':'CARREGAMENTO CONCLUÍDO',
  'ON':'LIGADO','OFF':'DESLIGADO','ENABLE':'ATIVAR','DISABLE':'DESATIVAR',
  'All':'Todos','None':'Nenhum','No data':'Sem dados',
  'SELECTED':'SELECIONADO','LAYERS':'CAMADAS',
  'VIEW':'VISÃO','Map':'Mapa','Normal':'Normal','Snow':'Neve',
  'Style':'Estilo','Models':'Modelos','Proximity':'Proximidade',
  'Scope':'Visor','Feather':'Suavização','Fade':'Desvanecimento',
  'Outside':'Fora','Shape':'Forma','Area':'Área','Line':'Linha',
  'Power':'Potência','Opacity':'Opacidade','Range':'Alcance',
  'Sector':'Setor','Rings':'Anéis','Detection':'Detecção',
  'Detect':'Detectar','DETECT':'DETECÇÃO','Allocation':'Distribuição',
  'Elastic':'Elástica','Weighted':'Ponderada','Tactical':'Tático',
  'Operator':'Operador','Minimal':'Mínimo','Draw':'Desenhar',
  'SEARCH':'BUSCAR','SEARCHING':'BUSCANDO','FILTER':'FILTRAR',
  'CONTACTS CONTEXT OFF':'CONTATOS DESATIVADOS',
  'SELECT CONTACTS TO LOAD OBSERVED / MAPPED PROXIMITY':'SELECIONE CONTATOS PARA VER A PROXIMIDADE MAPEADA',
  'NO STATION SELECTED':'NENHUMA ESTAÇÃO SELECIONADA',
  'DIRECTORY BAND':'FAIXA DE ESTAÇÕES','DRAG TO TUNE':'ARRASTE PARA SINTONIZAR',
  'STATION TAG':'CATEGORIA DA ESTAÇÃO','VOLUME':'VOLUME',
  'RADIO READY':'RÁDIO PRONTO',
  'POWER UP':'CONFIGURAR FONTES','GROUND STATION · PROVIDER SETTINGS':'CENTRAL DE DADOS · CONFIGURAÇÃO DE FONTES',
  'Power up the globe':'Ativar fontes e recursos do mapa',
  'SAVE KEYS':'SALVAR CHAVES','ESC to close':'ESC para fechar',
  'MISSION CONTROL · FIRST LAUNCH':'MAPA DO BRASIL · PRIMEIRO ACESSO',
  'Choose your first view':'Escolha o que deseja explorar',
  'LIVE CONTACTS':'CONTATOS AO VIVO',
  'Aircraft, vessels and nearby intelligence':'Aeronaves, embarcações e informações próximas',
  'Launches, spacecraft and orbital context':'Lançamentos, satélites e missões espaciais',
  'ENVIRONMENTAL':'MEIO AMBIENTE',
  'Live earthquakes and active fires, from USGS and NASA':'Terremotos e focos de incêndio com fontes públicas',
  'EXPLORE MANUALLY':'EXPLORAR MAPA',
  'Begin with a clean globe':'Abra o mapa do Brasil sem camadas extras',
  "Don't show this again":'Não mostrar novamente',
  'ESC to dismiss':'ESC para fechar',
  'Tip: the GEV MIC button in the dock lets you talk to the map.':'Dica: use o microfone para falar com o mapa.',
  'It feels like a forbidden cockpit—then you realize the sources are public and the data is real.':'Explore o Brasil em 3D com camadas geográficas e fontes públicas verificáveis.',
  'NO PLACE LEFT BEHIND':'BRASIL EM FOCO · SÃO PAULO EM 3D',
  'Visible map targets':'Pontos visíveis no mapa',
  'Expand LOCATION':'Abrir localização',
  'Expand Visual Presets':'Abrir efeitos visuais',
  'Collapse panel':'Recolher painel','Expand panel':'Expandir painel',
  'Keep visual presets open':'Manter efeitos abertos',
  'Keep location tray open':'Manter localização aberta',
  'Reset to full globe view':'Voltar à visão geral do globo',
  'Reset map to north up':'Apontar mapa para o norte',
  'Copy share link':'Copiar link para compartilhar',
  'Clear selected data layers':'Desativar camadas selecionadas',
  'Tilt map to oblique view':'Inclinar mapa para vista em perspectiva',
  'Toggle straight-down and tilted map views':'Alternar vista superior e inclinada',
  'LOADING LIVE DATA':'CARREGANDO DADOS PÚBLICOS',
  'syncing road network':'Sincronizando ruas e avenidas',
  'loading frames':'Carregando imagens',
  'Location: --':'Localização: --',
  'Landmark: --':'Ponto de interesse: --',
  'Street':'Rua','City':'Cidade','Close':'Fechar',
  'Near':'Perto','Traffic':'Trânsito','Vehicle':'Veículo',
});

export function translateUiText(value) {
  const raw=String(value??'');
  const trimmed=raw.trim();
  return PT_BR_UI[trimmed] ?? raw;
}
const attrs=['title','aria-label','placeholder'];
const skip='SCRIPT,STYLE,SVG,CANVAS,INPUT,TEXTAREA,OPTION';
function applyElement(el) {
  if (!el || el.nodeType!==1) return;
  for (const attr of attrs) {
    if (!el.hasAttribute(attr)) continue;
    const old=el.getAttribute(attr);
    const next=translateUiText(old);
    if (next!==old) el.setAttribute(attr,next);
  }
}
function translateTree(root,doc) {
  if (root.nodeType===1) {
    applyElement(root);
    for(const el of root.querySelectorAll('*'))applyElement(el);
  }
  if(root.nodeType===3) {
    const el=root.parentElement;
    if(el && !el.closest('#cesium-credits, .cesium-widget-credits, [data-no-translate]') && !skip.split(',').includes(el.tagName)) {
      const value=root.nodeValue;
      const translated=translateUiText(value);
      if(value!==translated)root.nodeValue=value.replace(value.trim(),translated);
    }
    return;
  }
  if(root.nodeType!==1 && root.nodeType!==9 && root.nodeType!==11)return;
  const walker=doc.createTreeWalker(root,4); // NodeFilter.SHOW_TEXT
  let node;
  while((node=walker.nextNode())){
    const el=node.parentElement;
    if(!el || el.closest('#cesium-credits, .cesium-widget-credits, [data-no-translate]') || skip.split(',').includes(el.tagName))continue;
    const txt=node.nodeValue;
    const translated=translateUiText(txt);
    if(txt!==translated)node.nodeValue=txt.replace(txt.trim(),translated);
  }
}
export function installPtBrLocale(doc=globalThis.document) {
  if(!doc?.body)return()=>{};
  doc.documentElement.lang='pt-BR';
  translateTree(doc.body,doc);
  const observer=new MutationObserver(records=>{
    for(const record of records) {
      if(record.type==='attributes')applyElement(record.target);
      for(const node of record.addedNodes)translateTree(node,doc);
    }
  });
  observer.observe(doc.body,{childList:true,subtree:true,attributes:true,attributeFilter:attrs});
  return()=>observer.disconnect();
}
