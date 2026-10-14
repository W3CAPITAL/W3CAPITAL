/** Public, keyless endpoints and official portals safe to publish in a public repository.
 * These are hostnames only, never credentials. Follow each provider's rate and display rules.
 */
export const PUBLIC_BRAZIL_APIS = Object.freeze({
  cep: Object.freeze({
    brasilApiV2: 'https://brasilapi.com.br/api/cep/v2/',
    viaCep: 'https://viacep.com.br/ws/',
  }),
  geography: Object.freeze({
    ibgeSpMunicipalities: 'https://servicodados.ibge.gov.br/api/v1/localidades/estados/35/municipios',
    nominatim: 'https://nominatim.openstreetmap.org/search',
  }),
  cameras: Object.freeze({
    cetSp: 'https://cameras.cetsp.com.br/View/Cam.aspx',
    derSp: 'https://dersp.der.sp.gov.br/WebSite/Servicos/ServicosOnline/CamerasOnlineMapa.aspx',
    corRio: 'https://cor.rio/',
    sumobBh: 'https://portalsumob.pbh.gov.br/',
  }),
});
export const PUBLIC_BRAZIL_API_ATTRIBUTION = Object.freeze({
  brasilApi: 'BrasilAPI · dados postais públicos; sem varredura automatizada',
  viaCep: 'ViaCEP · consulta pontual de CEP',
  ibge: 'IBGE · Divisão Territorial Brasileira',
  nominatim: '© OpenStreetMap contributors · Nominatim: limite de 1 req/s por aplicação',
  cameras: 'CET-SP, DER-SP, COR.Rio e Prefeitura de Belo Horizonte; links públicos, não streams privados',
});
