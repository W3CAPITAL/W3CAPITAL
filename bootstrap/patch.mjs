import fs from 'node:fs';
const load = (p) => fs.readFileSync(p, 'utf8');
const save = (p, v) => fs.writeFileSync(p, v);

let defaults = load('src/search/defaults.js');
const coordImport = "import { createCoordinateGeocoder } from './coordinateGeocoder.js';";
if (!defaults.includes(coordImport)) throw new Error('Upstream geocoder changed');
if (!defaults.includes("from './cepGeocoder.js'")) defaults = defaults.replace(coordImport, coordImport + "\nimport { createCepGeocoder } from './cepGeocoder.js';");
if (!defaults.includes("from './brazilGeocoder.js'")) defaults = defaults.replace(coordImport, coordImport + "\nimport { createBrazilGeocoder } from './brazilGeocoder.js';");
const coordProvider = '      createCoordinateGeocoder(),';
if (!defaults.includes(coordProvider)) throw new Error('Upstream provider list changed');
if (!defaults.includes('createCepGeocoder({')) defaults = defaults.replace(coordProvider, coordProvider + '\n      createCepGeocoder({ fetchImpl, endpoint: endpoints.cep }),\n      createBrazilGeocoder({ fetchImpl }),');
save('src/search/defaults.js', defaults);

let exportsFile = load('src/search/index.js');
if (!exportsFile.includes("from './cepGeocoder.js'")) exportsFile += "\nexport { createCepGeocoder, geocodeCep, parseCepQuery, formatCep, normalizeCepRow } from './cepGeocoder.js';\n";
save('src/search/index.js', exportsFile);

let location = load('src/locations.js');
if (!location.includes('  saoPaulo: {')) {
  const opening = location.indexOf('export const CITY_POIS = {');
  const ending = location.indexOf('\n};', opening);
  if (opening < 0 || ending < 0) throw new Error('Unable to locate CITY_POIS');
  const pois = [
    ['saoPaulo','São Paulo',760,[-24.05,-46.95,-23.35,-46.35],[['MASP',-23.5614,-46.6559],['Praça da Sé',-23.5503,-46.6334],['Parque Ibirapuera',-23.5874,-46.6576]]],
    ['rioDeJaneiro','Rio de Janeiro',5,[-23.05,-43.65,-22.75,-43.1],[['Cristo Redentor',-22.9519,-43.2105],['Pão de Açúcar',-22.9486,-43.1565],['Copacabana',-22.9711,-43.1822]]],
    ['brasilia','Brasília',1100,[-15.95,-47.98,-15.68,-47.78],[['Congresso Nacional',-15.7998,-47.8645],['Catedral de Brasília',-15.7983,-47.8755]]],
    ['beloHorizonte','Belo Horizonte',850,[-20.05,-44.05,-19.8,-43.85],[['Praça do Papa',-19.9574662,-43.9146067],['Mineirão',-19.8658,-43.9708]]],
    ['salvador','Salvador',5,[-13.06,-38.57,-12.87,-38.46],[['Elevador Lacerda',-12.9743,-38.5132],['Pelourinho',-12.9716,-38.5083]]],
    ['recife','Recife',3,[-8.17,-34.97,-8.01,-34.84],[['Marco Zero',-8.0631,-34.8711],['Boa Viagem',-8.12,-34.9]]],
  ];
  const generated = pois.map(([id, name, height, bounds, places]) =>
    "  " + id + ": { name: " + JSON.stringify(name) + ", groundElevation: " + height +
    ", viewBounds: { southwest: { lat: " + bounds[0] + ", lng: " + bounds[1] +
    " }, northeast: { lat: " + bounds[2] + ", lng: " + bounds[3] + " } }, pois: [" +
    places.map(([n, lat, lon]) => "{ name: " + JSON.stringify(n) + ", lat: " + lat +
    ", lon: " + lon + ", alt: 700, pitch: -30, heading: 80, buildingHeight: 25 }").join(',') + "] },\n"
  ).join('');
  location = location.slice(0, ending) + '\n' + generated + location.slice(ending);
  save('src/locations.js', location);
}

let photon = load('src/keylessGeocoder.js');
const oldTimeout = "      const deadline = AbortSignal.timeout(PHOTON_TIMEOUT_MS);\n      const requestSignal = signal\n        ? AbortSignal.any([signal, deadline])\n        : deadline;\n";
if (photon.includes(oldTimeout) && !photon.includes('// Shared budget for both Photon passes')) {
  photon = photon.replace(oldTimeout, '');
  const marker = '  /** One request: the feature array Photon returned, or null if it did not answer. */';
  photon = photon.replace(marker, '  // Shared budget for both Photon passes. Avoid using the whole search timeout on Photon alone.\n  const deadline = AbortSignal.timeout(PHOTON_TIMEOUT_MS);\n  const requestSignal = signal ? AbortSignal.any([signal, deadline]) : deadline;\n\n' + marker);
  save('src/keylessGeocoder.js', photon);
}

let dock = load('src/ui/templates/command-dock.html');
dock = dock.replace('Search any location...', 'Procurar rua, bairro, cidade ou CEP...');
dock = dock.replace('Search location by name or coordinates', 'Procurar endereço, coordenadas ou CEP');
dock = dock.replace('Search any location', 'Pesquisar localização');
save('src/ui/templates/command-dock.html', dock);

let html = load('index.html');
html = html.replace('<html lang="en">', '<html lang="pt-BR">').replace("<title>God's Eye View</title>", "<title>God's Eye View · Brasil</title>");
save('index.html', html);

let ignored = load('.gitignore');
for (const entry of ['.vercel/', '.env.production', '.env.local']) if (!ignored.includes(entry)) ignored += '\n' + entry;
save('.gitignore', ignored);

const pkg = JSON.parse(load('package.json'));
pkg.description = 'God’s Eye View — inteligência geoespacial com buscas por CEP e ruas do Brasil.';
pkg.scripts['test:br'] = 'node --test src/search/brazilGeocoder.test.mjs src/search/cepGeocoder.test.mjs';
save('package.json', JSON.stringify(pkg, null, 2) + '\n');

let readme = load('README.md');
if (!readme.includes('## Implantação brasileira na Vercel')) readme += '\n\n## Implantação brasileira na Vercel\n\nConsulte [README-BR.md](README-BR.md) para buscas de endereços e limitações das APIs na Vercel. Projeto original por Bilawal Sidhu, licença MIT.\n';
save('README.md', readme);
console.log('Brazilian adaptations installed.');
