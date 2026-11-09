(()=>{
  'use strict';
  const DISTRICT='Timotheo Souza Silveira', DISTRICT_KEY='timotheosouzasilveira';
  const REGIONS=['PR CARAMBEI','PR CASTRO','RS FREDERICO WESTPHALEN','RS IJUI','RS SANTA ROSA','RS TAPEJARA','RS TEUTONIA','SC BRACO DO NORTE','SC CONCORDIA','SC TIMBO','SC TREZE TILIAS'];
  const CRM_KEY='crm-comercial-v1';
  const $=id=>document.getElementById(id);
  const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const cash=n=>Number(n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  const datePt=s=>/^\d{4}-\d\d-\d\d$/.test(String(s||''))?new Date(s+'T12:00:00').toLocaleDateString('pt-BR'):'—';
  const inDistrict=r=>REGIONS.includes(String(r||'').trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase());
  let activeTab='sales', lastSalesRef=null, lastSalesLen=-1;

  function ensureNav(){
    const nav=document.querySelector('nav[aria-label="Análises e logística"]');
    if(!nav||$('navDistrictDashboards'))return;
    const b=document.createElement('button');b.id='navDistrictDashboards';b.dataset.dashView='crmDashboardsView';b.innerHTML='<span class="ico">▤</span> Dashboards e foco';
    b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();showView()});
    const ref=nav.querySelector('[data-view="potentialView"]')||nav.querySelector('[data-view="logisticsView"]');nav.insertBefore(b,ref);
  }
  function ensureView(){
    const host=document.querySelector('.content');if(!host||$('crmDashboardsView'))return;
    const section=document.createElement('section');section.id='crmDashboardsView';section.className='view-section';
    section.innerHTML=`<div class="page-head"><div><div class="eyebrow">Análises integradas</div><h2>Dashboards da Distrital Timotheo</h2><p class="sub">Painéis de vendas, pedidos e importações, além da lista de clientes sem compra no ano.</p></div><div class="head-actions"><span class="profile-pill">Escopo comercial: ${esc(DISTRICT)}</span></div></div>
      <div class="monitor-note"><b>Dados da distrital:</b> os painéis de vendas, pedidos e clientes foco usam somente as 11 regionais da sua distrital e acompanham as bases importadas neste CRM. A base de importações é corporativa e não representa a carteira de clientes.</div>
      <div class="dash-tabs" role="tablist" aria-label="Painéis integrados">
        <button class="btn selected" data-dash-tab="sales">Vendas</button><button class="btn" data-dash-tab="orders">Pedidos</button><button class="btn" data-dash-tab="imports">Importações</button><button class="btn" data-dash-tab="focus">Clientes foco</button>
      </div>
      <div class="dash-panel" data-dash-panel="sales" hidden><div class="dash-frame-note">O painel de vendas é sincronizado com a base faturada deste CRM. Também aceita uma planilha de vendas com recorte fixo às regionais da distrital.</div><iframe title="Dashboard de vendas da Distrital Timotheo" loading="lazy" data-dash-frame="sales"></iframe></div>
      <div class="dash-panel" data-dash-panel="orders" hidden><div class="dash-frame-note">Este painel lê o monitoramento importado na aba <b>Pedidos em carteira</b>; não é necessário importar o mesmo arquivo duas vezes.</div><iframe title="Dashboard de pedidos da Distrital Timotheo" loading="lazy" data-dash-frame="orders"></iframe></div>
      <div class="dash-panel" data-dash-panel="imports" hidden><div class="dash-frame-note"><b>Base de referência do painel:</b> 25/08/2026. Atualize-a selecionando uma planilha no próprio painel de importações.</div><iframe title="Dashboard corporativo de importações" loading="lazy" data-dash-frame="imports"></iframe></div>
      <div class="dash-panel" data-dash-panel="focus" hidden>
        <div class="panel analytics-panel"><div class="panel-head"><div><h2>Clientes sem compra no ano selecionado</h2><p>Versão integrada dos relatórios “Clientes foco” e “Clientes sem compra por regional”. Dados agrupados por código ou por nome + regional.</p></div><div class="head-actions"><label class="form-hint">Ano <select id="focusYear" class="field-control"></select></label><button class="btn" id="focusExport">⇩ Exportar lista filtrada</button></div></div>
          <div class="monitor-note" id="focusSourceNote">Aguardando a base faturada da distrital. Importe-a na Visão geral do CRM para gerar a análise.</div>
          <div class="insight-kpis analytics-kpis" id="focusKpis"></div>
          <div class="analytics-filters"><label>Regional<select id="focusRegion" class="field-control"><option value="">Todas as regionais</option></select></label><label>Perfil<select id="focusProfile" class="field-control"><option value="">Todos os perfis</option></select></label><label>Município<select id="focusCity" class="field-control"><option value="">Todos os municípios</option></select></label><label>Buscar cliente<input id="focusSearch" class="field-control" placeholder="Nome ou código"></label></div>
          <div class="analytics-grid"><div class="panel analytics-inner"><div class="panel-head"><div><h2>Prioridade de contato</h2><p>Ordenação por compras acumuladas e depois por tempo sem comprar.</p></div><span class="profile-pill" id="focusCount">0 clientes</span></div><div class="table-scroll"><table class="analytics-table" style="min-width:850px"><thead><tr><th>Cliente</th><th>Regional</th><th>Município</th><th>Perfil</th><th>Última compra</th><th>Dias sem comprar</th><th>Compras acumuladas</th><th></th></tr></thead><tbody id="focusRows"></tbody></table></div></div>
          <div style="display:grid;gap:12px"><div class="panel analytics-inner"><div class="panel-head"><div><h2>Resumo por regional</h2><p>Clientes sem compra no ano atual.</p></div></div><div class="table-scroll"><table class="analytics-table"><thead><tr><th>Regional</th><th>Clientes</th><th>Municípios</th><th>Compras acumuladas</th><th>Média de dias</th></tr></thead><tbody id="focusRegionalRows"></tbody></table></div></div><div class="panel analytics-inner"><div class="panel-head"><div><h2>Por perfil</h2></div></div><div class="table-scroll"><table class="analytics-table"><thead><tr><th>Perfil</th><th>Clientes</th><th>Compras acumuladas</th></tr></thead><tbody id="focusProfileRows"></tbody></table></div></div><div class="panel analytics-inner"><div class="panel-head"><div><h2>Por município</h2></div></div><div class="table-scroll"><table class="analytics-table"><thead><tr><th>Município</th><th>Regional</th><th>Clientes</th><th>Compras acumuladas</th></tr></thead><tbody id="focusCityRows"></tbody></table></div></div></div></div>
          <p class="analytics-footnote">Clientes sem data válida de última compra aparecem identificados como “Sem data”. Devoluções não são consideradas compras. A classificação é recalculada quando a base faturada é atualizada.</p>
        </div>
      </div>`;
    host.appendChild(section);
    const style=document.createElement('style');style.textContent=`.dash-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 12px}.dash-tabs .selected{background:#185b97;border-color:#185b97;color:#fff}.dash-panel[hidden]{display:none}.dash-panel{margin-bottom:16px}.dash-panel iframe{display:block;width:100%;height:min(82vh,1100px);min-height:720px;border:1px solid var(--line);border-radius:13px;background:#fff}.dash-frame-note{font-size:11px;color:#647184;background:#fff;border:1px solid var(--line);border-radius:9px;padding:10px 13px;margin-bottom:10px}@media(max-width:760px){.dash-panel iframe{height:78vh;min-height:650px}.dash-tabs{display:grid;grid-template-columns:1fr 1fr}.dash-tabs .btn{justify-content:center}.dash-panel .analytics-grid{grid-template-columns:1fr}}`;
    document.head.appendChild(style);
    section.querySelectorAll('[data-dash-tab]').forEach(b=>b.addEventListener('click',()=>activateTab(b.dataset.dashTab)));
    ['focusYear','focusRegion','focusProfile','focusCity','focusSearch'].forEach(id=>$(id)?.addEventListener('input',renderFocus));
    $('focusExport')?.addEventListener('click',exportFocus);
  }
  function showView(){
    ensureView();document.querySelectorAll('.view-section').forEach(x=>x.classList.toggle('active',x.id==='crmDashboardsView'));
    document.querySelectorAll('.nav button[data-view],.nav button[data-campaign-view],.nav button[data-dash-view]').forEach(x=>x.classList.toggle('active',x.dataset.dashView==='crmDashboardsView'));
    const c=$('crumbName');if(c)c.textContent='Dashboards e foco';$('sidebar')?.classList.remove('open');activateTab(activeTab);renderFocus();
  }
  function activateTab(tab){activeTab=tab||'sales';const view=$('crmDashboardsView');if(!view)return;
    view.querySelectorAll('[data-dash-tab]').forEach(b=>b.classList.toggle('selected',b.dataset.dashTab===activeTab));view.querySelectorAll('[data-dash-panel]').forEach(p=>p.hidden=p.dataset.dashPanel!==activeTab);
    const urls={sales:'dashboards/dashboard-vendas.html',orders:'dashboards/dashboard-pedidos.html',imports:'dashboards/dashboard-importacao-2026.html'};
    if(urls[activeTab]){const frame=view.querySelector(`[data-dash-frame="${activeTab}"]`);if(frame&&!frame.src)frame.src=urls[activeTab]}
    if(activeTab==='focus')renderFocus();
  }
  function districtSales(){return (Array.isArray(window.crmSalesData)?window.crmSalesData:[]).filter(t=>inDistrict(t.region)&&(!t.districtManager||norm(t.districtManager)===DISTRICT_KEY)&&!norm(t.operation).includes('devolucao')&&Number(t.value)>0)}
  function districtRecords(){try{return JSON.parse(localStorage.getItem(CRM_KEY)||'[]').filter(r=>norm(r.districtManager)===DISTRICT_KEY&&inDistrict(r.region)&&!/^d[1-6]$/.test(String(r.id||'')))}catch{return []}}
  function makeCustomers(year){
    const map=new Map(),keyOf=x=>norm(x.clientCode)?'c:'+norm(x.clientCode):'n:'+norm(x.name)+'|'+norm(x.region);
    for(const t of districtSales()){
      if(!t.name||!inDistrict(t.region))continue;const key=keyOf(t);let c=map.get(key);
      if(!c){c={key,name:t.name,clientCode:t.clientCode||'',region:t.region||'',city:t.city||'',profile:t.profile||'Não informado',lastBuy:'',purchases:Number(t.accumulated)||0,yearRevenue:0,record:null};map.set(key,c)}
      if(t.date>c.lastBuy)c.lastBuy=t.date;if(t.city)c.city=t.city;if(t.profile)c.profile=t.profile;if(t.clientCode)c.clientCode=t.clientCode;c.purchases=Math.max(c.purchases,Number(t.accumulated)||0);
      if(String(t.date||'').slice(0,4)===String(year))c.yearRevenue+=Number(t.value)||0;
    }
    const records=districtRecords(),byCode=new Map(records.filter(r=>r.clientCode).map(r=>[norm(r.clientCode),r])),byName=new Map(records.map(r=>[norm(r.name)+'|'+norm(r.region),r]));
    for(const c of map.values())c.record=(c.clientCode&&byCode.get(norm(c.clientCode)))||byName.get(norm(c.name)+'|'+norm(c.region))||null;
    for(const r of records){const k=keyOf(r);if(map.has(k))continue;map.set(k,{key:k,name:r.name||'Cliente',clientCode:r.clientCode||'',region:r.region||'',city:r.city||'',profile:r.profile||'Não informado',lastBuy:r.lastBuy||'',purchases:Number(r.purchases)||0,yearRevenue:0,record:r})}
    const today=new Date();today.setHours(12,0,0,0);
    return [...map.values()].filter(c=>c.region&&inDistrict(c.region)&&!c.yearRevenue&&(!c.lastBuy||c.lastBuy.slice(0,4)!==String(year))).map(c=>{
      const d=/^\d{4}-\d\d-\d\d$/.test(c.lastBuy)?new Date(c.lastBuy+'T12:00:00'):null;
      return {...c,days:d?Math.max(0,Math.floor((today-d)/86400000)):null}
    }).sort((a,b)=>(b.purchases-a.purchases)||((b.days||0)-(a.days||0))||a.name.localeCompare(b.name,'pt-BR'));
  }
  function focusRows(){const year=Number($('focusYear')?.value)||new Date().getFullYear(),rows=makeCustomers(year),region=$('focusRegion')?.value||'',profile=$('focusProfile')?.value||'',city=$('focusCity')?.value||'',q=norm($('focusSearch')?.value||'');return rows.filter(c=>(!region||c.region===region)&&(!profile||c.profile===profile)&&(!city||c.city===city)&&(!q||norm(c.name+' '+c.clientCode).includes(q)))}
  function fillFocusFilters(rows){for(const [id,caption,key] of [['focusRegion','Todas as regionais','region'],['focusProfile','Todos os perfis','profile'],['focusCity','Todos os municípios','city']]){const e=$(id);if(!e)continue;const old=e.value,values=[...new Set(rows.map(x=>x[key]).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR'));e.innerHTML=`<option value="">${caption}</option>`+values.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');if(values.includes(old))e.value=old}}
  function renderFocus(){if(!$('focusRows'))return;const year=Number($('focusYear')?.value)||new Date().getFullYear();const all=makeCustomers(year);fillFocusFilters(all);const shown=focusRows(),buyers=all.length,regions=new Set(all.map(c=>c.region)).size,acc=all.reduce((s,c)=>s+c.purchases,0),days=all.filter(c=>c.days!==null),avg=days.length?days.reduce((s,c)=>s+c.days,0)/days.length:0;
    const note=$('focusSourceNote');if(note)note.innerHTML=Array.isArray(window.crmSalesData)&&window.crmSalesData.length?`Base faturada carregada · ${districtSales().length.toLocaleString('pt-BR')} linhas da ${esc(DISTRICT)} · clientes sem venda faturada em ${year}.`:'Importe a base faturada na Visão geral do CRM para gerar esta análise.';
    $('focusKpis').innerHTML=[['Clientes sem compra',buyers.toLocaleString('pt-BR')],['Regionais representadas',regions.toLocaleString('pt-BR')],['Compras acumuladas da carteira',cash(acc)],['Média de dias sem comprar',avg?Math.round(avg).toLocaleString('pt-BR')+' dias':'—']].map(([a,b])=>`<article class="insight-kpi"><span>${esc(a)}</span><strong>${esc(b)}</strong></article>`).join('');
    $('focusCount').textContent=`${shown.length.toLocaleString('pt-BR')} clientes`;const none='<tr><td colspan="8" class="analytics-empty">Sem resultados para o ano e os filtros atuais.</td></tr>';
    $('focusRows').innerHTML=shown.length?shown.map(c=>`<tr><td><b>${esc(c.name)}</b><small class="catalog-flag">${esc(c.clientCode||'')}</small></td><td>${esc(c.region)}</td><td>${esc(c.city||'—')}</td><td>${esc(c.profile||'Não informado')}</td><td>${datePt(c.lastBuy)}</td><td>${c.days===null?'Sem data':c.days.toLocaleString('pt-BR')}</td><td>${cash(c.purchases)}</td><td><button class="btn btn-small" data-focus-client="${esc(c.record?.id||'')}">Abrir</button></td></tr>`).join(''):none;
    const group=(key)=>{const m=new Map();for(const c of all){const k=c[key]||'Não informado',x=m.get(k)||{name:k,count:0,purchases:0,days:[],cities:new Set(),region:key==='city'?c.region:''};x.count++;x.purchases+=c.purchases;if(c.days!==null)x.days.push(c.days);if(c.city)x.cities.add(c.city);m.set(k,x)}return [...m.values()].sort((a,b)=>b.count-a.count||b.purchases-a.purchases)};
    $('focusRegionalRows').innerHTML=group('region').map(x=>`<tr><td>${esc(x.name)}</td><td>${x.count.toLocaleString('pt-BR')}</td><td>${x.cities.size.toLocaleString('pt-BR')}</td><td>${cash(x.purchases)}</td><td>${x.days.length?Math.round(x.days.reduce((a,b)=>a+b,0)/x.days.length).toLocaleString('pt-BR'):'—'}</td></tr>`).join('')||'<tr><td colspan="5" class="analytics-empty">Sem dados.</td></tr>';
    $('focusProfileRows').innerHTML=group('profile').map(x=>`<tr><td>${esc(x.name)}</td><td>${x.count.toLocaleString('pt-BR')}</td><td>${cash(x.purchases)}</td></tr>`).join('')||'<tr><td colspan="3" class="analytics-empty">Sem dados.</td></tr>';
    $('focusCityRows').innerHTML=group('city').slice(0,30).map(x=>`<tr><td>${esc(x.name||'Não informado')}</td><td>${esc(x.region||'—')}</td><td>${x.count.toLocaleString('pt-BR')}</td><td>${cash(x.purchases)}</td></tr>`).join('')||'<tr><td colspan="4" class="analytics-empty">Sem dados.</td></tr>';
    $('focusRows').querySelectorAll('[data-focus-client]').forEach(b=>b.onclick=()=>{const id=b.dataset.focusClient;if(id&&window.crmClientDetail?.open){document.querySelector('.nav button[data-view="clientsView"]')?.click();window.crmClientDetail.open(id)}});
  }
  function exportFocus(){const rows=focusRows();if(!rows.length){alert('Não há clientes para exportar com esses filtros.');return}const cols=['Regional','Cliente','Código Cliente','Perfil','Município','Última compra','Dias sem comprar','Compras acumuladas'];const q=v=>'"'+String(v??'').replace(/"/g,'""')+'"';const csv='\ufeff'+[cols.map(q).join(';'),...rows.map(c=>[c.region,c.name,c.clientCode,c.profile,c.city,c.lastBuy,c.days??'',c.purchases].map(q).join(';'))].join('\r\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download=`clientes-sem-compra-${$('focusYear').value}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
  function setup(){ensureNav();ensureView();const sel=$('focusYear');if(sel){const y=new Date().getFullYear();sel.innerHTML=[y,y-1,y-2].map(v=>`<option value="${v}">${v}</option>`).join('');sel.value=String(y)}
    window.addEventListener('crm:sales-ready',()=>renderFocus());window.addEventListener('crm:records-updated',()=>renderFocus());window.addEventListener('storage',e=>{if(e.key===CRM_KEY)renderFocus()});
    document.addEventListener('click',e=>{const b=e.target.closest('[data-dash-view="crmDashboardsView"]');if(b){e.preventDefault();e.stopPropagation();showView()}});
    renderFocus();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();
