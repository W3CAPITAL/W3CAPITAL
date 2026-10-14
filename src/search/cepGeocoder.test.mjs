import test from 'node:test';
import assert from 'node:assert/strict';
import { createCepGeocoder, parseCepQuery, formatCep } from './cepGeocoder.js';
test('normaliza CEP brasileiro', () => {
  assert.equal(parseCepQuery('CEP 01001-000'), '01001000');
  assert.equal(parseCepQuery('01001000'), '01001000');
  assert.equal(formatCep('01001000'), '01001-000');
  assert.equal(parseCepQuery('0100100'), null);
});
test('localiza CEP, mantém região aproximada e faz cache', async () => {
  let calls=0;
  const adapter = createCepGeocoder({ fetchImpl: async () => {
    calls++; return { ok: true, json: async () => ({
      cep:'01001000',street:'Praça da Sé',city:'São Paulo',state:'SP',
      location:{coordinates:{latitude:'-23.55',longitude:'-46.63'}}
    }) };
  } });
  const outcome=await adapter.geocode('01001-000');
  assert.equal(outcome.place.lat,-23.55);
  assert.deepEqual(outcome.place.types,['postal_code']);
  assert.ok(outcome.place.viewport.northeast.lat>outcome.place.lat);
  await adapter.geocode('01001000');
  assert.equal(calls,1);
});
