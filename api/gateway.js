/** Read-only Vercel bridge to original public-feed middlewares. */
import { openSkyProxy } from '../server/providers/aircraft/opensky.js';
import { celestrakProxy, rocketLaunchesProxy } from '../server/providers/space.js';
import { adsbLolProxy } from '../server/providers/aircraft/adsb-lol.js';
import { weatherProxy } from '../server/providers/weather.js';
import { cycloneProxy } from '../server/providers/cyclones.js';
import { firePerimetersProxy } from '../server/providers/firePerimeters.js';
import { radioBrowserProxy } from '../server/providers/radio.js';
import { regionalBriefProxy } from '../server/providers/regional/briefing.js';
const approved = new Set(['flights', 'celestrak', 'launches', 'military', 'weather', 'cyclones', 'fire-perimeters', 'radio', 'regional-brief']);
const routes = [];
for (const factory of [openSkyProxy, celestrakProxy, rocketLaunchesProxy, adsbLolProxy, weatherProxy, cycloneProxy, firePerimetersProxy, radioBrowserProxy, regionalBriefProxy]) {
  const plugin = factory();
  plugin.configureServer?.({ middlewares: { use(path, fn) { routes.push({ path, fn }); } } });
}
routes.sort((a, b) => b.path.length - a.path.length);
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Somente consultas GET estão disponíveis na hospedagem.' });
  const target = Array.isArray(req.query.path) ? req.query.path.join('/') : String(req.query.path ?? '');
  if (target.length > 140 || !/^[a-z0-9_\-/]+$/.test(target)) return res.status(400).json({ error: 'Rota inválida.' });
  const base = target.split('/')[0];
  if (!approved.has(base) || (base === 'radio' && !/^radio(?:\/stations)?$/.test(target))) return res.status(404).json({ error: 'Fonte não habilitada na Vercel.' });
  const fullPath = '/api/' + target;
  const route = routes.find((entry) => fullPath === entry.path || fullPath.startsWith(entry.path + '/'));
  if (!route) return res.status(404).json({ error: 'Fonte não encontrada.' });
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(req.query)) {
    if (key === 'path') continue;
    for (const entry of Array.isArray(value) ? value : [value])
      if (entry != null && String(entry).length < 600) params.append(key, String(entry));
  }
  req.url = (fullPath.slice(route.path.length) || '/') + (params.size ? '?' + params : '');
  try { await route.fn(req, res); }
  catch (error) {
    console.error('God-Eye public feed error:', String(error?.message || error).slice(0, 180));
    if (!res.headersSent) return res.status(503).json({ error: 'Fonte pública temporariamente indisponível.' });
  }
}
