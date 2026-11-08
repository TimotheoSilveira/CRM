# CRM Comercial — pacote completo

CRM estático para hospedagem em GitHub Pages, com funil comercial, clientes, pedidos em carteira, histórico faturado, recompra, catálogo e propostas.

## Publicação no GitHub Pages

1. Extraia o pacote.
2. Envie **todo o conteúdo da pasta `crm-comercial`** para a raiz do repositório publicado — incluindo `index.html`, os arquivos `.js` e a pasta `vendor`.
3. Ative o GitHub Pages para o branch e a pasta que contêm o `index.html`.
4. Abra o endereço publicado em `https://` e confira na primeira tela se aparece “Componentes de importação carregados”. Não publique somente o HTML: os caminhos relativos dos módulos e da biblioteca de Excel precisam ser preservados.

## Escopo por distrital

O pacote está configurado para a **Distrital Timotheo Souza Silveira**. O histórico faturado e o monitoramento só aceitam linhas com esse gerente distrital identificado nas colunas `Gerente Distrital` e `Nm. Distrital`; registros sem identificação ou atribuídos a outra distrital não entram nas análises nem na carteira. O filtro fixo fica visível no funil, clientes e monitoramento.

## Importações

- **Base faturada:** primeira tela → “Importar base faturada”. Mantém todas as linhas e colunas, inclusive as colunas de comissão, no histórico local do navegador. A tela mostra a quantidade de linhas, colunas e clientes agrupados após confirmar a gravação.
- **Monitoramento:** primeira tela → “Importar monitoramento”, ou a área “Pedidos em carteira”. Agrupa itens por pedido e compara as cargas.
- **Outras planilhas:** use “Outras planilhas” ou a área específica de preços/clientes. Os formatos reconhecidos são Excel `.xlsx` e CSV.

Se houver falha de armazenamento ou de leitura, a área de status apresenta o erro e não declara a importação como concluída. Para arquivos grandes, use um navegador atualizado, em uma janela normal com armazenamento local e IndexedDB habilitados; não abra o HTML diretamente como `file://`.

## Análises de clientes e produtos

A tela **Clientes** apresenta faturamento, clientes compradores, média por cliente, recorrência e ticket médio, além de ranking dos principais clientes e segmentação de faturamento nas faixas A–E. A tela **Produtos e preços** separa o catálogo de preços da análise de vendas: mostra faturamento, volume, produtos vendidos, pedidos, preço médio unitário, ranking de produtos e composição por categoria. Ambas permitem filtrar por período, regional e categoria; devoluções ficam excluídas por padrão e podem ser incluídas no filtro. Os resultados usam exclusivamente as linhas importadas da distrital definida.

## Dados e privacidade

Esta é uma aplicação estática, sem backend: os dados importados permanecem no armazenamento do navegador e **não são sincronizados** entre pessoas, dispositivos ou navegadores. O próprio código do site pode estar público no GitHub Pages; não use esse arranjo como controle de acesso para uma equipe nem para informações que exijam armazenamento central protegido. Para uso compartilhado, será necessário um backend com autenticação e banco de dados.

As planilhas são processadas no navegador. Antes de trocar de navegador/dispositivo ou limpar os dados do site, exporte e guarde uma cópia da carteira; o histórico faturado deve ser reimportado da planilha-base para reconstruir suas análises.

## O que foi validado

Com as planilhas originais e o recorte da distrital:

- Base faturada: **26.756 linhas, 34 colunas, 3.214 clientes agrupados e 4 colunas de comissão**; linhas repetidas preservadas.
- Monitoramento: **75 pedidos em 299 linhas de itens**; linhas sem distrital ou de outra distrital ficam de fora.
- Catálogo inicial: **1.015 produtos**.
- Teste real no navegador: importação da base, carregamento dos indicadores, ranking e tabelas; **26.756 linhas** no histórico e nenhuma linha de outra distrital. Não foram observados erros de JavaScript.
- Com devoluções excluídas por padrão, o recorte de teste mostrou **R$ 37.504.683,57** de faturamento, **3.213 clientes compradores**, **1.884 recorrentes**, **10.121 pedidos**, **621.881 unidades/doses** e **3.119 produtos vendidos**. Os valores variam quando a base é atualizada ou os filtros mudam.

A versão filtrada ainda precisa ser testada no navegador e no endereço de publicação do usuário; esta validação foi feita localmente com os anexos.

## Arquivos principais

- `index.html` — interface e controladores da aplicação.
- `xlsx-utils.js` — leitura de planilhas Excel e modelos.
- `sales-clients.js` — histórico faturado, perfis de cliente e análises de recompra.
- `monitor.js` — importação e comparação de pedidos.
- `propostas.js` — catálogo, preços e propostas.
- `catalogo-inicial.js` — catálogo inicial.
- `import-center.js` — seleção, direcionamento e confirmação das importações.
- `vendor/jszip.min.js` — biblioteca local usada para abrir e gerar arquivos Excel.

A biblioteca JSZip incluída mantém o aviso de licença MIT no cabeçalho do próprio arquivo.
