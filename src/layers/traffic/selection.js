import * as Cesium from 'cesium';
import { registerPickOwner, unregisterPickOwner, resolvePickId } from '../../data/pickRegistry.js';

export const VEHICLE_PICK_PREFIX = 'GEV-TRANSITO-';
const CLASS_NAMES = Object.freeze({
  motorway: 'Rodovia', trunk: 'Via expressa', primary: 'Via principal',
  secondary: 'Via secundária', tertiary: 'Via local', residential: 'Rua residencial',
  service: 'Via de serviço', unclassified: 'Via pública', living_street: 'Rua compartilhada',
});
const BUCKETS = Object.freeze({ free: 'Trânsito livre', slow: 'Trânsito lento', jam: 'Congestionamento' });

/** A traffic dot is a VISUALIZATION, not an individually tracked/identified motor vehicle. */
export function trafficDotDetails(dot, liveMode = false) {
  if (!dot || !Number.isInteger(dot.id)) return null;
  const properties = dot.road?.roadProperties || {};
  const safeName = String(properties.name || properties['name:pt'] || '').trim();
  const street = safeName.slice(0, 120) || CLASS_NAMES[dot.road?.type] || 'Via sem nome disponível';
  const flow = liveMode && dot.road?.flow && dot.bucket && BUCKETS[dot.bucket]
    ? BUCKETS[dot.bucket] : null;
  return {
    id: VEHICLE_PICK_PREFIX + dot.id,
    label: 'Ponto de trânsito ' + dot.id,
    street,
    type: CLASS_NAMES[dot.road?.type] || 'Via pública',
    congestion: flow || 'Sem medição de fluxo para esta via',
    source: flow ? 'TomTom (fluxo por trecho)' : 'OpenStreetMap (traçado de vias)',
    estimatedSpeed: Number.isFinite(dot.mps) ? Math.round(dot.mps * 3.6) : null,
    licensePlate: null,
    identityAvailable: false,
    observation: 'Ponto animado para representar fluxo de trânsito, não um veículo real individualizado.',
  };
}

function makeCard(documentRef) {
  const card = documentRef.createElement('section');
  card.id = 'gev-traffic-vehicle-info';
  card.className = 'gev-traffic-vehicle-info';
  card.hidden = true;
  card.setAttribute('role', 'region');
  card.setAttribute('aria-label', 'Informações do ponto de trânsito');
  card.innerHTML = '<div class="gev-vehicle-top"><strong>🚗 INFORMAÇÕES DO TRÂNSITO</strong><button type="button" aria-label="Fechar ficha de trânsito">×</button></div><div class="gev-vehicle-details"></div>';
  return card;
}

/** Click live Cesium primitives; owns only our registered traffic IDs. */
export function installTrafficSelection(viewer, layerState, { documentRef = globalThis.document } = {}) {
  if (!viewer?.scene || !documentRef?.body) return () => {};
  let active = null;
  const card = makeCard(documentRef);
  documentRef.body.appendChild(card);
  const close = () => { active = null; card.hidden = true; };
  card.querySelector('button').addEventListener('click', close);
  const onKey = (event) => { if (event.key === 'Escape') close(); };
  documentRef.addEventListener('keydown', onKey);
  registerPickOwner('traffic', id => id.startsWith(VEHICLE_PICK_PREFIX));

  function display(dot) {
    const details = trafficDotDetails(dot, layerState._liveMode);
    if (!details) return;
    active = dot.id;
    const body = card.querySelector('.gev-vehicle-details');
    body.replaceChildren();
    const fields = [
      ['Identificador visual', String(dot.id)],
      ['Rua / avenida', details.street],
      ['Categoria', details.type],
      ['Condição da via', details.congestion],
      ['Velocidade da animação', details.estimatedSpeed === null ? 'Indisponível' : details.estimatedSpeed + ' km/h (simulada)'],
      ['Placa do veículo', 'Indisponível — a fonte não identifica veículos ou placas'],
      ['Fonte', details.source],
    ];
    for (const [name, value] of fields) {
      const row = documentRef.createElement('div');
      row.className = 'gev-vehicle-row';
      const key = documentRef.createElement('span'); key.textContent = name;
      const val = documentRef.createElement('strong'); val.textContent = value;
      row.append(key, val); body.appendChild(row);
    }
    const note = documentRef.createElement('p');
    note.className = 'gev-vehicle-note';
    note.textContent = details.observation;
    body.appendChild(note);
    try {
      const cartographic = Cesium.Cartographic.fromCartesian(dot.point.position);
      if (Number.isFinite(cartographic.latitude) && Number.isFinite(cartographic.longitude)) {
        const lat = Cesium.Math.toDegrees(cartographic.latitude).toFixed(5);
        const lon = Cesium.Math.toDegrees(cartographic.longitude).toFixed(5);
        const link = documentRef.createElement('a');
        link.href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(lat + ',' + lon);
        link.target = '_blank'; link.rel = 'noopener noreferrer';
        link.textContent = 'Ver trecho no Google Maps ↗';
        body.appendChild(link);
      }
    } catch { /* Position may disappear during a scene update. */ }
    card.hidden = false;
  }

  const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
  handler.setInputAction(event => {
    if (!layerState._enabled || !layerState._dots.length) return;
    const picked = viewer.scene.pick(event.position);
    const id = resolvePickId(picked);
    let dot = id?.startsWith(VEHICLE_PICK_PREFIX)
      ? layerState._dots.find(item => item.point.id === id && item.point.show !== false) : null;
    // Fallback for tiny (<8px) dots, only when the scene picked no other entity.
    if (!dot && !id && (picked === undefined || picked === null || picked.primitive?.isCesium3DTileset)) {
      let distance = 15 * 15;
      for (const item of layerState._dots) {
        if (item.point.show === false || item.point.pixelSize < 1) continue;
        const xy = Cesium.SceneTransforms.worldToWindowCoordinates(viewer.scene, item.point.position);
        if (!xy) continue;
        const dx = xy.x - event.position.x, dy = xy.y - event.position.y;
        const d = dx * dx + dy * dy;
        if (d < distance) { distance = d; dot = item; }
      }
    }
    if (dot) display(dot);
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  return () => {
    handler.destroy();
    unregisterPickOwner('traffic');
    documentRef.removeEventListener('keydown', onKey);
    card.remove();
  };
}
