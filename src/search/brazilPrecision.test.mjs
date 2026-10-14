import test from 'node:test';
import assert from 'node:assert/strict';
import {scoreBrazilCandidate,rankBrazilCandidates} from './brazilPrecision.js';
const candidate = (name,lat=-23.55,lng=-46.63)=>({formatted_address:name,geometry:{location:{lat,lng}}});
test('não confunde endereço a 19 km com Praça da Sé',()=>{
 assert.equal(scoreBrazilCandidate('Rua das Orquídeas, São Paulo - SP',candidate('Praça da Sé, São Paulo - SP')), -Infinity);
 assert.ok(scoreBrazilCandidate('Rua das Orquídeas, São Paulo - SP',candidate('Rua das Orquídeas, São Paulo - SP',-23.7,-46.7))>0);
});
test('não aceita tipo de logradouro errado nem cidade divergente',()=>{
 assert.equal(scoreBrazilCandidate('Rua Augusta, São Paulo - SP',candidate('Praça Augusta, São Paulo, SP')),-Infinity);
 assert.equal(scoreBrazilCandidate('Rua Augusta, São Paulo - SP',candidate('Rua Augusta, Campinas, SP')),-Infinity);
});
test('ordena resultados e impede troca de país',()=>{
 const matches=rankBrazilCandidates('Avenida Paulista, São Paulo, SP',[candidate('Praça da Sé, São Paulo, SP'),candidate('Avenida Paulista, São Paulo, SP'),candidate('Avenida Paulista, Portugal',40,-9)]);
 assert.equal(matches.length,1);
 assert.match(matches[0].formatted_address,/Paulista/);
});
test('aceita abreviações, acentos e preposições',()=>{
 assert.ok(scoreBrazilCandidate('Av. Paulista, São Paulo, SP',candidate('Avenida Paulista, São Paulo, SP'))>0);
 assert.ok(scoreBrazilCandidate('Rua da Consolação, São Paulo, SP',candidate('Rua da Consolação, São Paulo, SP'))>0);
});
