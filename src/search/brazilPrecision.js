/** Conservative geocoder ranking for real Brazilian addresses. No "nearest tourist POI" substitution. */
const UF = new Set('AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' '));
const PREPOSITIONS = new Set(['a','as','o','os','da','das','de','do','dos','e','em','no','na','nos','nas','br','brasil','brazil']);
const STREET_RE = /^(rua|r\.?|avenida|av\.?|travessa|trav\.?|alameda|estrada|rodovia|praca|praça|largo|viela|passagem|viel|r\.?|av\.?)\s+/i;
export function foldBrazil(text) {
  return String(text ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim().replace(/\s+/g,' ');
}
function words(text) {
  return foldBrazil(text).split(' ').filter(x=>x && !PREPOSITIONS.has(x));
}
export function classifyBrazilQuery(query) {
  const original = String(query ?? '').trim();
  const parts = original.split(/[,–—]/).map(x=>x.trim()).filter(Boolean);
  const suffix = parts.slice(1).join(' ');
  const street = STREET_RE.exec(parts[0] || '');
  const streetName = street ? parts[0].slice(street[0].length).trim() : '';
  const stateMatch = /(?:^|[\s,–—-])([A-Za-z]{2})(?:\s|$)/.exec(suffix);
  const state = stateMatch && UF.has(stateMatch[1].toUpperCase()) ? stateMatch[1].toUpperCase() : null;
  const city = parts.length > 1 ? foldBrazil(parts[1].replace(/\b[A-Za-z]{2}\s*$/, '')) : '';
  return { streetType: street ? foldBrazil(street[1]).replace(/^r$/, 'rua').replace(/^av$/, 'avenida').replace(/^trav$/, 'travessa') : null,
    streetWords: words(streetName), city, state, strict: Boolean(street || parts.length > 1) };
}
const aliases = {r:'rua',av:'avenida',trav:'travessa',praca:'praca'};
const labels = (value) => foldBrazil(value).split(' ').map(x=>aliases[x]||x);
export function scoreBrazilCandidate(query, candidate) {
  const desc = classifyBrazilQuery(query);
  const label = String(candidate?.formatted_address || candidate?.display_name || candidate?.label || '');
  const normalized = foldBrazil(label);
  const tokens = new Set(labels(label));
  const country = String(candidate?.address?.country_code || candidate?.country_code || '').toLowerCase();
  if (country && country !== 'br') return -Infinity;
  if (/\b(?:united states|estados unidos|portugal|argentina|colombia|france)\b/.test(normalized) && !/\bbrasil\b/.test(normalized)) return -Infinity;
  const coord = candidate?.geometry?.location || {lat:Number(candidate?.lat),lng:Number(candidate?.lon)};
  const lat = Number(coord.lat), lng = Number(coord.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat > 5.3 || lat < -33.8 || lng > -34 || lng < -74) return -Infinity;
  if (desc.state && !tokens.has(desc.state.toLowerCase()) && !tokens.has(stateName(desc.state))) {
    // Brazilian geocoders often omit the state abbreviation; never accept an explicitly different one.
    const other = [...UF].find(uf=>uf!==desc.state && tokens.has(uf.toLowerCase()));
    if (other) return -Infinity;
  }
  if (desc.city && !normalized.includes(desc.city)) {
    // Some providers omit the city but identify its neighbourhood; reject rather than guess.
    return -Infinity;
  }
  if (desc.streetType) {
    if (!tokens.has(desc.streetType)) return -Infinity;
    if (!desc.streetWords.length) return -Infinity;
    const matching = desc.streetWords.filter(t=>tokens.has(t)).length;
    if (matching < Math.ceil(desc.streetWords.length * 0.80)) return -Infinity;
    return 100 + 10*matching/desc.streetWords.length;
  }
  const queryWords=words(String(query).split(',')[0]);
  const matches=queryWords.filter(t=>tokens.has(t)).length;
  if (!queryWords.length || matches < Math.ceil(queryWords.length*0.7)) return -Infinity;
  return 50 + 10*matches/queryWords.length;
}
const NAMES = Object.freeze({AC:'acre',AL:'alagoas',AP:'amapa',AM:'amazonas',BA:'bahia',CE:'ceara',DF:'distrito federal',ES:'espirito santo',GO:'goias',MA:'maranhao',MT:'mato grosso',MS:'mato grosso do sul',MG:'minas gerais',PA:'para',PB:'paraiba',PR:'parana',PE:'pernambuco',PI:'piaui',RJ:'rio de janeiro',RN:'rio grande do norte',RS:'rio grande do sul',RO:'rondonia',RR:'roraima',SC:'santa catarina',SP:'sao paulo',SE:'sergipe',TO:'tocantins'});
function stateName(uf){return NAMES[uf]||'';}
export function rankBrazilCandidates(query, candidates) {
  return [...(Array.isArray(candidates)?candidates:[])].map((place,i)=>({place,score:scoreBrazilCandidate(query,place),i})).filter(x=>Number.isFinite(x.score)).sort((a,b)=>b.score-a.score||a.i-b.i).map(x=>x.place);
}
