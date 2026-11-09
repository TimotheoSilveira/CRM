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

## Navegação, análises e logística

A barra lateral oferece acessos diretos a **KPIs de clientes**, **KPIs de produtos**, **Logística** e **Dashboards e foco**. As telas de análise ficam separadas da carteira de cadastro e do catálogo de preços; os indicadores dependem da importação da base faturada.

A tela **KPIs de clientes** apresenta faturamento, clientes compradores, média por cliente, recorrência e ticket médio, além de ranking dos principais clientes e segmentação de faturamento nas faixas A–E. A tela **KPIs de produtos** mostra faturamento, volume, produtos vendidos, pedidos, preço médio unitário, ranking de produtos e composição por categoria. Ambas permitem filtrar por período, regional e categoria; devoluções ficam excluídas por padrão e podem ser incluídas no filtro. Os resultados usam exclusivamente as linhas importadas da distrital definida.

A tela **Recompra** permite filtrar por tempo sem comprar; “Qualquer período” inclui todos os clientes, inclusive os sem data conhecida. O marcador da faixa de recência acompanha os dias desde a última compra e fica limitado a um ano para leitura visual.

## Dashboards e programas Python integrados

A tela **Dashboards e foco** reúne os quatro painéis enviados. **Vendas** sincroniza com a base faturada importada no CRM e mantém o recorte das 11 regionais da Distrital Timotheo; se ainda não houver importação, mostra a base de referência incluída no painel. **Pedidos** acompanha automaticamente o monitoramento já carregado em Pedidos em carteira, sem precisar importar duas vezes. **Importações** é um painel corporativo de abastecimento e não representa dados de clientes nem é filtrado por distrital; a referência embutida é de 25/08/2026 e pode ser atualizada selecionando uma planilha no próprio painel.

As duas rotinas Python enviadas foram **convertidas em recursos nativos do CRM**, pois GitHub Pages executa JavaScript no navegador, não Python. A área **Clientes foco** aplica a lógica de “Clientes foco” para o ano selecionado e combina o relatório “Clientes sem compra por regional”: mostra lista priorizada, dias sem comprar, compras acumuladas, resumos por regional/perfil/município, filtros e exportação CSV; usa somente clientes da distrital e exclui devoluções. A lista depende da base faturada carregada no CRM.

Os painéis de vendas, pedidos e importações carregam bibliotecas externas de Excel/gráficos; é necessário que o navegador tenha acesso à internet e aos CDNs correspondentes. Os painéis e o CRM continuam locais no navegador: a integração não cria sincronização entre usuários.

## Sugestões de contato e logística

A visão geral inclui sugestões de contato baseadas no histórico importado: clientes da distrital com pelo menos 45 dias desde a última compra, priorizados por tempo e valor histórico. Clientes que já têm contato agendado nos próximos 7 dias são omitidos. Cada sugestão permite agendar uma data (padrão: 3 dias à frente) e o compromisso fica salvo na carteira local.

Na tela **Logística** da barra lateral, quando um pedido passa a faturado — por status do monitoramento, confirmação manual ou conciliação com a base faturada — ele entra em **Logística · aguardando mudança**. Permanece ativo até você confirmar **Confirmar mudança**, ou até completar 7 dias desde a data de faturamento; depois aparece em **Logística · mudanças concluídas**. O prazo automático é apenas uma regra de acompanhamento e **não confirma trânsito nem entrega**. As datas, a confirmação manual e o histórico ficam salvos no navegador.

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

As telas de Cashback, Promoções e importação de contatos foram testadas em navegador headless com registros controlados: conferência de 5% sobre compras elegíveis, exclusão de devoluções e de outra distrital, campanha de aniversário, importação de telefone/e-mail/data de nascimento para cliente conciliado e preservação de registro da outra distrital; sem erros de JavaScript. A planilha real de contatos ainda não foi enviada, então seu mapeamento específico depende de conferência quando for importada.

A integração dos painéis foi testada no navegador com registros controlados: navegação para a nova área, lista de clientes foco, sincronização do painel de vendas após carregar a base faturada, sincronização do painel de pedidos com a carteira local e visualização móvel; sem erros de JavaScript. As importações reais, os indicadores no endereço publicado e a versão do navegador do usuário ainda precisam de confirmação após o deploy.

## Arquivos principais

- `index.html` — interface e controladores da aplicação.
- `xlsx-utils.js` — leitura de planilhas Excel e modelos.
- `sales-clients.js` — histórico faturado, perfis de cliente e análises de recompra.
- `monitor.js` — importação e comparação de pedidos.
- `propostas.js` — catálogo, preços e propostas.
- `catalogo-inicial.js` — catálogo inicial.
- `import-center.js` — seleção, direcionamento e confirmação das importações.
- `crm-recency-funnel.js` — classificação por tempo sem comprar e limpeza da carteira por distrital.
- `crm-campaigns.js` — Cashback, campanhas promocionais e importação segura de contatos.
- `crm-dashboards.js` — navegação dos painéis e versão CRM do relatório de clientes foco.
- `dashboards/` — painéis de vendas, pedidos e importações integrados.
- `vendor/jszip.min.js` — biblioteca local usada para abrir e gerar arquivos Excel.

A biblioteca JSZip incluída mantém o aviso de licença MIT no cabeçalho do próprio arquivo.

## Plano semanal por regional

A nova área **Plano semanal** gera uma lista por cada uma das 11 regionais da Distrital Timotheo. Escolha a meta de **20, 25, 30, 35 ou 40 contatos por semana**; o CRM distribui a lista em cinco dias úteis, com 4 a 8 clientes por dia, e permite visualizar/baixar CSV por regional ou o consolidado.

A priorização combina: (1) janela estimada de recompra pela mediana do intervalo entre pedidos faturados; (2) variação do faturamento nos últimos 30 dias contra os 30 dias anteriores, para identificar crescimento e queda que pede diagnóstico; (3) faturamento e ticket médio dos últimos 12 meses; (4) vacas cadastradas, sem inferir doses ou demanda; (5) tempo desde o último contato registrado; e (6) retornos de proposta/negociação. A pontuação, os motivos e os dados de comparação ficam visíveis para o regional. Sugestões de visita são destacadas para clientes com queda relevante de faturamento ou com sinal combinado de valor e rebanho.

Para evitar abordagem duplicada, são excluídos clientes com pedido ainda ativo no monitoramento, contato de CRM já agendado dentro da semana e contato realizado nos últimos 14 dias. Se uma regional tiver menos clientes elegíveis do que a meta, a tela mostra a quantidade disponível e não preenche a lista com clientes de fora da distrital. Cada atividade pode ser registrada como visita, WhatsApp, ligação ou e-mail, planejada ou realizada, com resultado e observação. O histórico e os planos são locais ao navegador; não sincronizam automaticamente entre gerentes/regionais.

A semana é organizada de segunda a sexta e não consulta feriados nem calcula rota geográfica de visitas. A estimativa de recompra usa apenas clientes com datas de pedidos suficientes para calcular um ciclo e é uma indicação comercial, não uma previsão garantida. O uso depende da importação da base faturada e do monitoramento atualizado.


## Identidade, comunicação e potencial de venda

A identidade do painel foi atualizada para **Distrital Timotheo · Leite Sul**; a logomarca local fica em `assets/logo-distrital-leite-sul.jpeg`. O cadastro do cliente aceita WhatsApp, e-mail e número de vacas.

A tela **Potencial de venda** compara o faturamento do ano-base escolhido com uma estimativa por rebanho. Para clientes com número de vacas cadastrado, a estimativa é: vacas × doses por vaca/ano × preço médio por dose. Para os demais clientes, o potencial principal usa o faturamento do ano-base. As premissas por vaca e preço são ajustáveis; o preço inicia na média ponderada do histórico importado (ano-base, ou histórico disponível se o ano selecionado não tiver vendas). É uma simulação comercial, não uma recomendação técnica nem previsão garantida.

A tela **Contato e mensagens** permite escolher clientes, revisar modelos e abrir WhatsApp ou e-mail com os campos preenchidos. O WhatsApp abre o aplicativo ou WhatsApp Web; o e-mail é preparado no aplicativo de e-mail padrão e precisa ser enviado pelo usuário. **Envio automático sem revisão não está habilitado**: por ser uma aplicação estática, isso exige integração segura com backend e serviço de e-mail.

Na área **Propostas**, salvar uma proposta como **Rascunho** não a move para o funil. Ao alterar para **Enviada** (ou **Aprovada**), o CRM vincula a proposta a uma oportunidade existente do cliente ou cria uma oportunidade automaticamente na etapa **Proposta**. A proposta guarda o identificador da oportunidade; o valor e os produtos da negociação são atualizados no funil. O envio da proposta ao cliente continua sendo manual pelo WhatsApp/e-mail.

## Automação da carteira por tempo sem comprar

Depois de importar a base faturada da Distrital Timotheo Souza Silveira, o CRM concilia clientes pelo código do cliente e, quando necessário, pelo nome e regional. Clientes fora da lista atual do monitoramento são encaminhados automaticamente: **última compra há mais de 10 meses → “Sem compra há mais de 10 meses”**; **compra nos últimos 10 meses, inclusive no limite → “Diagnóstico”**. O corte usa 10 meses de calendário, calculados a partir da data em que a rotina roda.

A lista atual de clientes do monitoramento é atualizada a cada nova importação. Clientes presentes nela não são classificados por recência enquanto permanecerem no monitoramento. A carteira é filtrada para manter somente registros explicitamente associados à distrital ou conciliados com a base faturada/monitoramento da distrital; registros atribuídos a outra distrital são removidos localmente na reconciliação. A mudança não apaga o histórico faturado nem os pedidos do monitoramento.

Na conferência das planilhas anexadas em **09/11/2026**, há **3.214 clientes únicos** na base da distrital; **52** aparecem no monitoramento, restando **3.162** para a classificação. Pelo corte de calendário de 10 meses nessa data, **957** vão para “Sem compra há mais de 10 meses” e **2.205** para “Diagnóstico”. A contagem é um retrato dessas planilhas e muda com novas importações e com a data da próxima execução.

A automação roda no navegador deste CRM após importar a base faturada e atualizar o monitoramento. Importe primeiro a base faturada para reconstruir as análises e classificar a carteira; depois importe o monitoramento atual para retirar dessa classificação os clientes com pedidos em carteira. Se você arrastar manualmente um cliente automatizado para outra etapa do funil, essa escolha manual é preservada nas próximas sincronizações. Os dados continuam locais neste navegador; não é feita publicação ou sincronização com GitHub por esta rotina.
