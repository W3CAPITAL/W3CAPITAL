import test from 'node:test';
import assert from 'node:assert/strict';
import { translateUiText, PT_BR_UI } from './ptBrLocale.js';
test('tradução da interface W3 prioriza português brasileiro',()=>{
 assert.equal(translateUiText('LOCATION'),'LOCALIZAÇÃO');
 assert.equal(translateUiText('DATA LAYERS'),'CAMADAS DE DADOS');
 assert.equal(translateUiText('Street Traffic'),'Trânsito nas ruas');
 assert.equal(translateUiText('MISSION CONTROL · FIRST LAUNCH'),'MAPA DO BRASIL · PRIMEIRO ACESSO');
 assert.equal(translateUiText('São Paulo'),'São Paulo');
 assert.ok(Object.keys(PT_BR_UI).length>100);
});
