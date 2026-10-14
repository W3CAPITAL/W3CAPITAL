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

test('CEP sem coordenadas recorre à rua e cidade verificadas, não à Praça da Sé',async()=>{
 const calls=[];
 const adapter=createCepGeocoder({fetchImpl: async url=>{
   calls.push(String(url));
   if(String(url).includes('brasilapi.com.br'))return {ok:true,json:async()=>({cep:'01310-100',street:'Avenida Paulista',neighborhood:'Bela Vista',city:'São Paulo',state:'SP',location:{coordinates:{latitude:null,longitude:null}}})};
   return {ok:true,json:async()=>({status:'OK',results:[
     {formatted_address:'Praça da Sé, São Paulo - SP, Brasil',geometry:{location:{lat:-23.5503,lng:-46.6334}}},
     {formatted_address:'Avenida Paulista, São Paulo - SP, Brasil',geometry:{location:{lat:-23.5614,lng:-46.6559}}}
   ]})};
 }});
 const result=await adapter.geocode('01310-100');
 assert.equal(result.place?.lat,-23.5614);
 assert.equal(result.place?.postalApproximate,true);
 assert.match(result.place?.label,/Paulista/);
 assert.equal(calls.length,2);
});
test('não fabrica ponto geográfico quando rua do CEP não corresponde ao resultado',async()=>{
 const adapter=createCepGeocoder({fetchImpl:async url=>{
  if(String(url).includes('brasilapi'))return{ok:true,json:async()=>({street:'Rua Inexistente',city:'São Paulo',state:'SP'})};
  return{ok:true,json:async()=>({status:'OK',results:[{formatted_address:'Praça da Sé, São Paulo - SP',geometry:{location:{lat:-23.55,lng:-46.63}}}]})};
 }});
 const result=await adapter.geocode('09000-100');
 assert.equal(result.place,null);
});
