import test from 'node:test';
import assert from 'node:assert/strict';
import {SP_DISTRICTS} from './spDistricts.js';
test('São Paulo lista os 96 distritos oficiais sem coordenadas inventadas',()=>{assert.equal(SP_DISTRICTS.length,96);assert.equal(new Set(SP_DISTRICTS).size,96);assert.ok(SP_DISTRICTS.includes('Vila Jacuí'));assert.ok(SP_DISTRICTS.includes('Sé'));});
