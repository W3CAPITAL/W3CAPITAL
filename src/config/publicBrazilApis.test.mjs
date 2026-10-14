import test from 'node:test';
import assert from 'node:assert/strict';
import {PUBLIC_BRAZIL_APIS} from './publicBrazilApis.js';

test('configuração do GitHub expõe apenas URLs públicas e não credenciais',()=>{
 for(const group of Object.values(PUBLIC_BRAZIL_APIS)){
   for(const endpoint of Object.values(group)){
     const u=new URL(endpoint);
     assert.equal(u.protocol,'https:');
     assert.equal(u.username,'');assert.equal(u.password,'');
     assert.equal(u.search,'');assert.equal(u.hash,'');
     assert.doesNotMatch(endpoint,/key=|token=|apikey=/i);
   }
 }
 assert.match(PUBLIC_BRAZIL_APIS.geography.ibgeSpMunicipalities,/estados\/35\/municipios$/);
});
