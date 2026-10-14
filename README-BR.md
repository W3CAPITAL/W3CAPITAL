# God's Eye View · Brasil

Fork da ferramenta original [God's Eye View](https://github.com/bilawalsidhu/gods-eye-view), autoria de Bilawal Sidhu, licença MIT.

Esta versão prepara a interface Cesium/Vite para Vercel e adiciona pesquisa brasileira por CEP, rua, avenida, bairro, cidade e UF. CEPs apontam para uma área postal aproximada, nunca para a posição garantida de uma residência ou pessoa.

## Implantação

Conecte este repositório à Vercel (framework Vite, saída `dist`, comando `npm run build`, Node 24.x). `/api/geocode` responde buscas geográficas com prioridade ao Brasil e `/api/health` é a verificação básica. O geocoder usa Nominatim e requer respeito ao limite do serviço; para produção em escala configure `NOMINATIM_SEARCH_URL` com uma instância própria/licenciada.

**Limitação:** o original tem dezenas de proxies do servidor local Vite. Na Vercel, apenas as funções serverless efetivamente implementadas estarão disponíveis. Algumas camadas ao vivo podem exigir migração adicional. Não exponha a rota administrativa local de chaves.

Créditos e licença original devem ser mantidos. Consulte o arquivo `LICENSE` e `THIRD_PARTY_NOTICES.md` após a importação do código original.

## São Paulo, Google Maps e câmeras públicas

- **Ruas e bairros de São Paulo:** digite a via com bairro, município e UF (por exemplo, `Avenida Paulista, Bela Vista, São Paulo - SP`). O geocodificador valida nome da via e cidade; não substitui rua desconhecida pela Praça da Sé, por atração turística ou por uma posição 19 km distante. A cobertura é dinâmica, dependente dos fornecedores de geocodificação; não existe índice local completo de imóveis ou garantia de numeração individual.
- **CEP:** consulte números como `01001-000` (BrasilAPI). A posição representa a referência postal e pode ser aproximada.
- **Google Maps:** o botão **BRASIL · MAPAS + CÂMERAS** abre uma pesquisa de estabelecimentos via **Google Places Text Search API** com atribuição e links oficiais. Configure `GOOGLE_MAPS_SERVER_API_KEY` (Google Geocoding e Places habilitados) nas variáveis de ambiente do projeto na Vercel. Pode haver cobrança conforme os termos e volume. O código utiliza API oficial, não scraping.
- **Câmeras públicas:** o explorador oferece os diretórios oficiais da CET-SP, DER-SP, COR.Rio e SUMOB, filtrados por município/rua quando há informação verificável. Os pontos individuais exibidos são entradas do catálogo da CET, não streaming embutido e **não** indicam proximidade em metros sem coordenadas validadas. A disponibilidade de imagens depende das respectivas autoridades; sem câmera conhecida, mostra o catálogo regional sem inventar câmeras.
- **3D verdadeiro:** habilite Google Photorealistic 3D Tiles com `GOOGLE_MAPS_API_KEY` (Maps Tiles API) ou `CESIUM_ION_TOKEN` (serviço de tiles 3D quando disponível); na ausência deles, o app usa imagens de satélite/mapa 2D projetado sobre o globo e não promete prédios em 3D. O botão **Ativar Google 3D** seleciona a camada real somente quando está disponível.
- **Desempenho:** metas de FPS e orçamento de cache/tiles ajustados para máquinas com pouca memória; controles com áreas clicáveis maiores e painéis com rolagem em celulares. Se o dispositivo ou a conexão forem lentos, escolha camadas Esri/OSM menos pesadas.

### Projetos de scraping indicados

`Mahanaicoach/google-maps-scraper-kit`, `omkarcloud/google-maps-scraper` e `gosom/google-maps-scraper` são coletores independentes, não parte das APIs oficiais do Google Maps; importar seus navegadores/robôs para funções serverless aumentaria consumo e pode criar problemas com termos de uso e bloqueios. Em vez disso, foram adotadas as APIs oficiais do Google para pesquisas no aplicativo. `googlemaps` é o ecossistema de bibliotecas Google Maps, e `dsdanielpark/Bard-API` não é necessário para geocodificar endereços.

**Privacidade e segurança:** nenhuma câmera privada, credencial de fornecedor, cookie de conta Google ou imagens de câmeras sem autorização são coletados. Configure as chaves apenas na Vercel; não faça commit de `.env`. Os resultados da pesquisa Google devem respeitar os termos de atribuição e exibição do Google.

## APIs públicas instaladas no próprio GitHub

Os **endereços públicos** das APIs estão versionados em [`src/config/publicBrazilApis.js`](src/config/publicBrazilApis.js) e são importados pelas integrações. Não precisam de chave na Vercel. Alterar o catálogo é suficiente para atualizar as URLs usadas pelo aplicativo.

| Serviço | Aplicação | Requer chave? |
| --- | --- | --- |
| [BrasilAPI CEP v2](https://brasilapi.com.br/docs) | Consulta postal com geolocalização quando fornecida | Não |
| [ViaCEP](https://viacep.com.br/) | Fonte pública de endereços/CEP, cadastrada para integrações | Não |
| [IBGE Localidades](https://servicodados.ibge.gov.br/api/docs/localidades) | Novo painel **Municípios SP · IBGE** com pesquisa paginada; consulta à lista oficial de municípios paulistas por `/api/sp-municipios` | Não |
| [Nominatim / OpenStreetMap](https://operations.osmfoundation.org/policies/nominatim/) | Geocodificação pública de ruas e localidades | Não; uso limitado |
| CET-SP / DER-SP / COR.Rio / SUMOB | Links para diretórios públicos de câmeras de trânsito | Não para consultar os portais |

**Não confundir disponibilizar URLs com ter uma base geográfica completa:** o IBGE fornece os nomes oficiais dos municípios, não coordenadas de cada rua. Para navegar a um município, o mapa faz uma geocodificação separada. Os portais de câmeras não garantem streaming embutido.

Respeite as políticas dos fornecedores: a BrasilAPI proíbe varredura sistemática de CEPs; o Nominatim público exige atribuição e no máximo **1 requisição por segundo no conjunto da aplicação**, que uma função serverless distribuída não consegue assegurar sozinha. Para tráfego maior, use serviço geográfico próprio ou contratado.

APIs autenticadas, inclusive **Google Places**, **Google Maps Tiles** e **Cesium ion**, ainda exigem credenciais válidas e restrições de uso apropriadas. Nunca publique chaves privadas, `.env` ou tokens pessoais no GitHub.
