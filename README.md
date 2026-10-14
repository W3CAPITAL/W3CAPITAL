# God-Eye View Brasil — W3CAPITAL

![Tela do God-Eye View](docs/media/hero-open-source-reveal.gif)

**Exploração geoespacial em português brasileiro, com São Paulo como ponto de partida.** Visualize o globo em Cesium, procure ruas, bairros e CEPs do Brasil, acompanhe camadas de fontes públicas e consulte informações de trânsito e câmeras autorizadas.

[![Validar God Eye W3 Brasil](https://github.com/W3CAPITAL/W3CAPITAL/actions/workflows/import-god-eye.yml/badge.svg)](https://github.com/W3CAPITAL/W3CAPITAL/actions/workflows/import-god-eye.yml)

## Recursos desta versão

- **Brasil e São Paulo:** o aplicativo abre com a câmera sobre a Avenida Paulista em perspectiva oblíqua. Atalhos de bairros, **96 distritos oficiais da capital** e pesquisa paginada dos municípios do estado pelo IBGE.
- **Busca brasileira:** CEP com BrasilAPI e recuperação por rua/cidade quando a coordenada postal não está disponível; pesquisa de logradouro confere nome, município e UF. Rua sem município prioriza São Paulo. Não troca uma rua desconhecida pela Praça da Sé ou outro ponto turístico.
- **3D real quando configurado:** o visualizador utiliza os **Google Photorealistic 3D Tiles**, via Maps Tiles API ou Cesium ion. Sem chave/tokens habilitados, aplica o mapa e globo alternativos e informa a indisponibilidade do 3D fotorrealista.
- **Google Maps:** pesquisa de estabelecimentos com Google Places ao configurar credencial; atalho externo de busca e visualização de trechos no Google Maps disponível sem chave.
- **Trânsito clicável:** ligue a camada **Trânsito nas ruas**, aproxime para exibir os pontos animados, clique em uma bolinha para ver a via, categoria, condição de trânsito (quando há fonte de fluxo), velocidade **da animação**, fonte dos dados e link do trecho no Google Maps.
- **Transparência sobre placas:** as bolinhas representam **simulações de tráfego**, não veículos individualmente rastreados. O OpenStreetMap e o fluxo de trecho da TomTom **não fornecem a placa, identidade ou velocidade real de cada carro**. O aplicativo exibe essas limitações e não inventa placas ou dados privados.
- **Câmeras públicas:** consulta aos diretórios governamentais catalogados como CET-SP, DER-SP, COR.Rio e SUMOB; sem prometer transmissão ao vivo por pontos não verificados.
- **Interface em português:** tela inicial, navegação, painéis, funções brasileiras, mensagens de localização e tradução adicional de rótulos carregados dinamicamente.
- **Camadas adicionais preservadas:** aeronaves, embarcações, satélites, meteorologia, sismos, incêndios, rádio e recursos do God’s Eye View original, sujeitos à disponibilidade das respectivas fontes.

## Publicação na Vercel

1. Importe o repositório [W3CAPITAL/W3CAPITAL](https://github.com/W3CAPITAL/W3CAPITAL).
2. Use **Vite**; comando `npm run build`; diretório de saída `dist`; Node.js **24.14.0**.
3. As APIs públicas BrasilAPI, ViaCEP, IBGE, Nominatim e os links públicos das câmeras ficam em `src/config/publicBrazilApis.js` e não precisam de credenciais.
4. **Opcional:** defina `GOOGLE_MAPS_API_KEY` com Google Maps Tiles API ativada ou `CESIUM_ION_TOKEN` para ativar os prédios 3D fotorrealistas. Para Places/Geocoding no servidor, use `GOOGLE_MAPS_SERVER_API_KEY`. Essas APIs podem ter custos e limites; configure cotas e restrições adequadas.
5. **Opcional:** para o fluxo rodoviário TomTom, configure as credenciais correspondentes ao fornecedor; sem dados ao vivo a animação continua **simulada**. Sem custos/chaves, as camadas públicas compatíveis funcionam de forma independente.

**Não publique tokens secretos, credenciais privadas, cookies ou arquivos `.env` no GitHub.** A visualização das ruas/CEP é aproximada conforme as bases utilizadas, sem garantia de endereço individual ou atualização em tempo real.

## Desenvolvimento e testes

```bash
npm ci
npm run test:br
npm run build
```

O GitHub Actions testa buscas, tradução, dados brasileiros e compilação para a Vercel. Os testes de unidade e build **não substituem** a validação da interface no navegador e das chaves no ambiente de produção.

## Documentação e créditos

- [Guia brasileiro de implantação e APIs](README-BR.md)
- [Fontes e atribuição](DATA_SOURCES.md)
- [Avisos a terceiros](THIRD_PARTY_NOTICES.md)
- [Licença](LICENSE)

O God-Eye W3 é baseado no [God's Eye View original, de Bilawal Sidhu](https://github.com/bilawalsidhu/gods-eye-view) e na [adaptação brasileira W1CAPITAL/God-Eye](https://github.com/W1CAPITAL/God-Eye), com personalizações próprias da W3CAPITAL. Preserve os créditos, as licenças e as regras das fontes externas.
