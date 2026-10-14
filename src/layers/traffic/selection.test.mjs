import test from 'node:test';
import assert from 'node:assert/strict';
import { trafficDotDetails, VEHICLE_PICK_PREFIX } from './selection.js';

test('cada bolinha é uma simulação: sem placa e sem identidade fabricada',()=>{
 const dot={id:3,mps:8.5,road:{type:'residential',roadProperties:{name:'Rua Augusta'}}};
 const d=trafficDotDetails(dot,false);
 assert.equal(d.id,VEHICLE_PICK_PREFIX+'3');
 assert.equal(d.street,'Rua Augusta');
 assert.equal(d.licensePlate,null);
 assert.equal(d.identityAvailable,false);
 assert.equal(d.estimatedSpeed,31);
 assert.match(d.observation,/não um veículo real/);
});
test('TomTom sinaliza apenas fluxo por trecho, nunca identifica carro',()=>{
 const d=trafficDotDetails({id:4,mps:2,road:{type:'primary',flow:{level:0.8}},bucket:'jam'},true);
 assert.equal(d.congestion,'Congestionamento');
 assert.match(d.source,/trecho/);
 assert.equal(d.licensePlate,null);
});
