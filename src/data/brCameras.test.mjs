import test from 'node:test';
import assert from 'node:assert/strict';
import {findPublicBrazilCameras,BRAZIL_CAMERA_SOURCES} from './brCameras.js';

test('São Paulo mostra endereços publicados pela CET sem fingir streaming embutido',()=>{
 const matches=findPublicBrazilCameras('Avenida Paulista, São Paulo, SP');
 assert.ok(matches.some(x=>x.name.includes('Paulista')&&x.agency==='CET-SP'));
 assert.ok(matches.every(x=>x.state==='SP'&&!x.streamUrl));
 assert.ok(BRAZIL_CAMERA_SOURCES.filter(x=>x.type==='verified-directory-entry').length===11);
});
test('câmeras de outras cidades não são apresentadas como próximas a São Paulo',()=>{
 const results=findPublicBrazilCameras('Copacabana, Rio de Janeiro, RJ');
 assert.ok(results.length>0&&results.every(x=>x.state==='RJ'));
});
test('rua sem câmera verificada mostra diretórios, sem criar uma câmera próxima',()=>{
 const results=findPublicBrazilCameras('Rua Desembargador Álvaro Ferreira, São Paulo - SP');
 assert.ok(results.length>0);
 assert.ok(results.every(x=>x.type==='portal'));
});
