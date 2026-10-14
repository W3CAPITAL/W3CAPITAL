/** Official São Paulo municipality names via IBGE. No API key, no fabricated coordinates. */
import { PUBLIC_BRAZIL_APIS } from '../src/config/publicBrazilApis.js';

let cache = { data: null, until: 0 };
let inFlight = null;
const TTL = 24 * 60 * 60 * 1000;
export const normalizeMunicipalitySearch = text => String(text ?? '')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim();

export function normalizeIbgeMunicipalities(payload) {
  if (!Array.isArray(payload)) throw new TypeError('Resposta inválida do IBGE');
  const seen = new Set();
  return payload.filter(x => Number.isSafeInteger(x?.id) && /^.{2,100}$/.test(x?.nome || ''))
    .map(x => ({ id: x.id, name: x.nome.trim(), uf: 'SP' }))
    .filter(x => { if (seen.has(x.id)) return false; seen.add(x.id); return true; })
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

async function load(fetchImpl = fetch) {
  if (cache.data && cache.until > Date.now()) return cache.data;
  if (inFlight) return inFlight;
  inFlight = (async () => {
    const response = await fetchImpl(PUBLIC_BRAZIL_APIS.geography.ibgeSpMunicipalities, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(8_000),
      redirect: 'error',
    });
    if (!response.ok) throw new Error('IBGE indisponível');
    const cities = normalizeIbgeMunicipalities(await response.json());
    if (cities.length < 600) throw new Error('Resposta incompleta do IBGE');
    cache = { data: cities, until: Date.now() + TTL };
    return cities;
  })();
  try { return await inFlight; } finally { inFlight = null; }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=1800');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Somente GET' });
  const query = String(req.query?.q ?? '').trim();
  if (query.length > 90 || /[\x00-\x1f]/.test(query)) return res.status(400).json({ error: 'Pesquisa inválida' });
  const offset = Number(req.query?.offset || 0);
  if (!Number.isSafeInteger(offset) || offset < 0 || offset > 10000) return res.status(400).json({ error: 'Página inválida' });
  try {
    const full = await load();
    const q = normalizeMunicipalitySearch(query);
    const selected = q ? full.filter(city => normalizeMunicipalitySearch(city.name).includes(q)) : full;
    return res.status(200).json({
      source: 'IBGE · API de Localidades', region: 'SP', total: selected.length,
      offset, limit: 40, municipalities: selected.slice(offset, offset + 40),
      coordinatesProvided: false,
    });
  } catch {
    return res.status(503).json({ source: 'IBGE', municipalities: [], error: 'Serviço de municípios temporariamente indisponível' });
  }
}
