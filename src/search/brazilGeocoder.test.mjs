import test from 'node:test';
import assert from 'node:assert/strict';
import { createBrazilGeocoder, isBrazilianAddress } from './brazilGeocoder.js';
test('identifica ruas brasileiras com UF', () => {
  for (const q of ['Rua Augusta, São Paulo - SP', 'Av. Paulista, São Paulo, SP', 'Praça da Sé', 'Curitiba, PR', 'Alameda Santos'])
    assert.ok(isBrazilianAddress(q), q);
  for (const q of ['Paris', 'Tokyo', '01001-000', '', '12345']) assert.equal(isBrazilianAddress(q), false, q);
});
test('envia localização BR, normaliza coordenadas e aproveita cache', async () => {
  const calls = [];
  const adapter = createBrazilGeocoder({ fetchImpl: async (url) => {
    calls.push(String(url));
    return { ok: true, json: async () => ({ status: 'OK', results: [{ geometry: { location: { lat: -23.55, lng: -46.63 } }, formatted_address: 'Rua Augusta, São Paulo, Brasil', types: ['route'] }] }) };
  } });
  assert.equal((await adapter.geocode('Rua Augusta, São Paulo - SP')).place.lat, -23.55);
  assert.match(calls[0], /country=br/);
  await adapter.geocode('Rua Augusta, São Paulo - SP');
  assert.equal(calls.length, 1);
});
