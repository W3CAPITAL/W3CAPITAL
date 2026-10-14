import test from 'node:test';
import assert from 'node:assert/strict';
import handler,{normalizeIbgeMunicipalities,normalizeMunicipalitySearch} from './sp-municipios.js';
const example=()=>Array.from({length:645},(_,i)=>({id:3500000+i,nome:'Municipio '+String(i).padStart(3,'0')}));
test('normaliza nomes oficiais sem atribuir coordenadas fictícias',()=>{
 assert.deepEqual(normalizeIbgeMunicipalities([{id:3550308,nome:'São Paulo'}]),[{id:3550308,name:'São Paulo',uf:'SP'}]);
 assert.equal(normalizeMunicipalitySearch('São José'), 'sao jose');
 assert.throws(()=>normalizeIbgeMunicipalities({}),TypeError);
});
test('consulta IBGE usa paginação, filtro, fonte pública e não retorna coordenadas',async()=>{
 const originalFetch=globalThis.fetch;
 globalThis.fetch=async()=>({ok:true,json:async()=>example()});
 const request=(query)=>({method:'GET',query});
 const execute=async(q)=>{
   const result={headers:{},statusCode:200};
   const res={setHeader(k,v){result.headers[k]=v;return res;},status(code){result.statusCode=code;return res;},json(data){result.data=data;return res;}};
   await handler(request(q),res);return result;
 };
 try{
   const all=await execute({});
   assert.equal(all.statusCode,200);
   assert.equal(all.data.total,645);
   assert.equal(all.data.municipalities.length,40);
   assert.equal(all.data.coordinatesProvided,false);
   assert.ok(all.data.municipalities.every(x=>!('lat' in x)));
   const filtered=await execute({q:'Municipio 021'});
   assert.equal(filtered.data.total,1);
   assert.equal(filtered.data.municipalities[0].name,'Municipio 021');
   const page=await execute({offset:'40'});
   assert.equal(page.data.municipalities[0].name,'Municipio 040');
   assert.equal((await execute({offset:'-1'})).statusCode,400);
 }finally{globalThis.fetch=originalFetch;}
});
