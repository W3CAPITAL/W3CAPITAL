/** CEP lookup for Brazil. Postal geometry is approximate, never a rooftop. */
import { PUBLIC_BRAZIL_APIS } from '../config/publicBrazilApis.js';
const endpoint = PUBLIC_BRAZIL_APIS.cep.brasilApiV2;
const memo = new Map();
export function parseCepQuery(input) {
  const match = /^(?:cep\s*[:\-]?\s*)?(\d{5})-?(\d{3})$/i.exec(String(input ?? '').trim());
  return match ? match[1] + match[2] : null;
}
export function formatCep(input) { return String(input).slice(0, 5) + '-' + String(input).slice(5, 8); }
function validNumber(value, range) {
  if ((typeof value !== 'string' && typeof value !== 'number') || String(value).trim() === '') return null;
  const n = Number(value);
  return Number.isFinite(n) && Math.abs(n) <= range ? n : null;
}
export function normalizeCepRow(row, digits) {
  const lat = validNumber(row?.location?.coordinates?.latitude, 90);
  const lng = validNumber(row?.location?.coordinates?.longitude, 180);
  if (lat === null || lng === null || !row) return { place: null, located: false };
  const written = formatCep(row?.cep || digits);
  const street = String(row?.street || '').trim();
  const neighborhood = String(row?.neighborhood || '').trim();
  const city = String(row?.city || '').trim();
  const state = String(row?.state || '').trim();
  const label = [...new Set([street || 'CEP ' + written, neighborhood, [city, state].filter(Boolean).join(' - '), 'CEP ' + written].filter(Boolean))].join(', ');
  return { located: true, place: {
    lat, lng, name: street || 'CEP ' + written, label,
    exact: true, types: ['postal_code'],
    viewport: {
      southwest: { lat: Math.max(-90, lat - .01), lng: Math.max(-180, lng - .01) },
      northeast: { lat: Math.min(90, lat + .01), lng: Math.min(180, lng + .01) }
    }
  } };
}
export async function geocodeCep(query, { fetchImpl = fetch, signal, cache = memo, endpoint: urlBase = endpoint } = {}) {
  signal?.throwIfAborted();
  const digits = parseCepQuery(query);
  if (!digits) return { place: null, answered: true };
  const cached = cache.get(digits);
  if (cached && cached.until > Date.now()) return cached.value;
  cache.delete(digits);
  let answered = false, row = null;
  try {
    const timeout = AbortSignal.timeout(5000);
    const joint = signal ? AbortSignal.any([signal, timeout]) : timeout;
    const response = await fetchImpl(urlBase + digits, { signal: joint });
    if (response.ok) { row = await response.json(); answered = true; }
    else if (response.status === 404) answered = true;
  } catch {
    signal?.throwIfAborted();
    return { place: null, answered: false };
  }
  signal?.throwIfAborted();
  const place = answered ? normalizeCepRow(row, digits).place : null;
  const value = { place, answered };
  if (answered) {
    cache.set(digits, { value, until: Date.now() + (place ? 86400000 : 300000) });
    while (cache.size > 64) cache.delete(cache.keys().next().value);
  }
  return value;
}
export function createCepGeocoder({ fetchImpl = (...args) => fetch(...args), endpoint: urlBase = endpoint } = {}) {
  const cache = new Map();
  return { geocode: (q, opts = {}) => geocodeCep(q, { ...opts, cache, fetchImpl, endpoint: urlBase }) };
}
