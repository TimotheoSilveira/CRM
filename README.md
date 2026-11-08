# CRM Comercial — pacote completo

CRM estático para hospedagem em GitHub Pages, com funil comercial, clientes, pedidos em carteira, histórico faturado, recompra, catálogo e propostas.

## Publicação no GitHub Pages

1. Extraia o pacote.
2. Envie **todo o conteúdo da pasta `crm-comercial`** para a raiz do repositório publicado — incluindo `index.html`, os arquivos `.js` e a pasta `vendor`.
3. Ative o GitHub Pages para o branch e a pasta que contêm o `index.html`.
4. Abra o endereço publicado em `https://` e confira na primeira tela se aparece “Componentes de importação carregados”. Não publique somente o HTML: os caminhos relativos dos módulos e da biblioteca de Excel precisam ser preservados.

## Importações

- **Base faturada:** primeira tela → “Importar base faturada”. Mantém todas as linhas e colunas, inclusive as colunas de comissão, no histórico local do navegador. A tela mostra a quantidade de linhas, colunas e clientes agrupados após confirmar a gravação.
- **Monitoramento:** primeira tela → “Importar monitoramento”, ou a área “Pedidos em carteira”. Agrupa itens por pedido e compara as cargas.
- **Outras planilhas:** use “Outras planilhas” ou a área específica de preços/clientes. Os formatos reconhecidos são Excel `.xlsx` e CSV.

Se houver falha de armazenamento ou de leitura, a área de status apresenta o erro e não declara a importação como concluída. Para arquivos grandes, use um navegador atualizado, em uma janela normal com armazenamento local e IndexedDB habilitados; não abra o HTML diretamente como `file://`.

## Dados e privacidade

Esta é uma aplicação estática, sem backend: os dados importados permanecem no armazenamento do navegador e **não são sincronizados** entre pessoas, dispositivos ou navegadores. O próprio código do site pode estar público no GitHub Pages; não use esse arranjo como controle de acesso para uma equipe nem para informações que exijam armazenamento central protegido. Para uso compartilhado, será necessário um backend com autenticação e banco de dados.

As planilhas são processadas no navegador. Antes de trocar de navegador/dispositivo ou limpar os dados do site, exporte e guarde uma cópia da carteira; o histórico faturado deve ser reimportado da planilha-base para reconstruir suas análises.

## O que foi validado

Em uma sessão limpa de navegador, com as planilhas originais fornecidas:

- Base faturada: **26.765 linhas, 34 colunas, 3.217 clientes agrupados e 4 colunas de comissão**; linhas repetidas preservadas.
- Monitoramento: **2.833 pedidos e 12.686 linhas de itens**.
- Catálogo: **1.015 produtos**.
- Resumo do painel recalculado a partir da base faturada e dados mantidos após recarregar a página.
- Nenhum erro de JavaScript observado nesse teste.

Isso valida o pacote aqui; a publicação no seu repositório e o armazenamento disponíveis no seu navegador ainda dependem de serem configurados como acima.

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
