(()=>{
  'use strict';
  const DISTRICT='Timotheo Souza Silveira';
  const DISTRICT_KEY='timotheosouzasilveira';
  const CRM_KEY='crm-comercial-v1';
  const money=n=>Number(n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const records=()=>{try{return JSON.parse(localStorage.getItem(CRM_KEY)||'[]')}catch{return []}};
  const sales=()=>Array.isArray(window.crmSalesData)?window.crmSalesData:[];
  const salesKey=x=>norm(x.clientCode)?'c:'+norm(x.clientCode):'n:'+norm(x.name)+'|'+norm(x.region);
  const customerKey=x=>norm(x.clientCode)?'c:'+norm(x.clientCode):'n:'+norm(x.name)+'|'+norm(x.region);
  const defaultYear=new Date().getFullYear()-1;
  let selectedPotentialYear=defaultYear;
  function validSales(rows){return rows.filter(x=>!norm(x.operation).includes('devolucao'))}
  function indexedCustomers(year){
    const grouped=new Map(),history=validSales(sales());
    for(const x of history){
      const key=salesKey(x);let g=grouped.get(key);
      if(!g){g={key,name:x.name||'Cliente sem nome',region:x.region||'',code:x.clientCode||'',yearRevenue:0,allRevenue:0,yearQuantity:0,allQuantity:0,latest:x.date||''};grouped.set(key,g)}
      const value=Number(x.value)||0,quantity=Number(x.quantity)||0;g.allRevenue+=value;if(quantity>0&&value>0)g.allQuantity+=quantity;
      if(String(x.date||'').slice(0,4)===String(year)){g.yearRevenue+=value;if(quantity>0&&value>0)g.yearQuantity+=quantity}
      if((x.date||'')>g.latest)g.latest=x.date;
    }
    const clients=records().filter(r=>!/^d[1-6]$/.test(String(r.id||'')));
    const byCode=new Map(),byName=new Map();
    for(const r of clients){if(r.clientCode)byCode.set('c:'+norm(r.clientCode),r);byName.set('n:'+norm(r.name)+'|'+norm(r.region),r)}
    for(const g of grouped.values())g.record=byCode.get(g.key)||byName.get('n:'+norm(g.name)+'|'+norm(g.region))||null;
    for(const r of clients){
      if(norm(r.districtManager)&&norm(r.districtManager)!==DISTRICT_KEY)continue;
      const key=customerKey(r);if(grouped.has(key))continue;
      if(!r.districtManager&&!r.orderId&&!r.clientCode)continue;
      grouped.set(key,{key,name:r.name||'Cliente sem nome',region:r.region||'',code:r.clientCode||'',yearRevenue:0,allRevenue:0,yearQuantity:0,allQuantity:0,latest:r.lastBuy||'',record:r});
    }
    return [...grouped.values()].map(g=>{if(!g.record)g.record=byCode.get(g.key)||byName.get('n:'+norm(g.name)+'|'+norm(g.region))||null;return g}).sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
  }
  function ensureUI(){
    const sideNav=document.querySelector('nav[aria-label="Análises e logística"]');
    if(sideNav&&!document.getElementById('navPotential')){
      const b=document.createElement('button');b.id='navPotential';b.dataset.view='potentialView';b.innerHTML='<span class="ico">◉</span> Potencial de venda';sideNav.insertBefore(b,sideNav.querySelector('[data-view="logisticsView"]'));
      const c=document.createElement('button');c.id='navCommunication';c.dataset.view='communicationView';c.innerHTML='<span class="ico">✉</span> Contato e mensagens';sideNav.insertBefore(c,sideNav.querySelector('[data-view="logisticsView"]'));
      b.addEventListener('click',()=>showView('potentialView','Potencial de venda'));
      c.addEventListener('click',()=>showView('communicationView','Contato e mensagens'));
    }
    const content=document.querySelector('.content');if(!content)return;
    if(!document.getElementById('potentialView')){
      const section=document.createElement('section');section.id='potentialView';section.className='view-section';section.innerHTML=`
        <div class="page-head"><div><div class="eyebrow">Planejamento comercial</div><h2>Potencial de venda</h2><p class="sub">Compare a referência do faturamento do ano anterior com a estimativa pelo número de vacas.</p></div><div class="head-actions"><label class="field-control">Ano base <input id="potentialYear" type="number" min="2000" max="2100" style="width:70px;border:0;background:transparent" value="${defaultYear}"></label><button class="btn" id="potentialRefresh">↻ Atualizar</button></div></div>
        <div class="monitor-note"><b>Dois critérios, com regra visível:</b> o histórico usa o faturamento do ano selecionado. Quando há número de vacas cadastrado, o potencial principal usa vacas × doses por vaca/ano × preço médio por dose; sem número de vacas, usa o faturamento histórico do ano-base. Doses/vaca e preço médio são premissas editáveis, não uma recomendação zootécnica nem garantia de venda.</div>
        <div class="panel" style="margin-bottom:13px"><div class="panel-head"><div><h2>Premissas da estimativa por rebanho</h2><p>A referência é a média ponderada por unidade da base distrital; ajuste para simular um produto ou categoria específicos.</p></div></div><div class="analytics-filters" style="grid-template-columns:repeat(3,minmax(140px,1fr))"><label>Doses por vaca / ano<input class="field-control" id="potentialDosesPerCow" type="number" min="0" step="0.1" value="1"></label><label>Preço médio por dose (R$)<input class="field-control" id="potentialPricePerDose" type="number" min="0" step="0.01" value="0"></label><div id="potentialPriceSource" class="form-hint" style="align-self:center">Aguardando histórico faturado.</div></div></div>
        <div class="insight-kpis analytics-kpis" id="potentialKpis"></div>
        <div class="panel analytics-panel"><div class="panel-head"><div><h2>Potencial estimado por cliente</h2><p>O valor principal segue o método indicado em cada linha; edite o cadastro para informar o número de vacas.</p></div></div><div class="table-scroll"><table class="analytics-table" style="min-width:850px"><thead><tr><th>Cliente</th><th>Regional</th><th>Faturamento ano-base</th><th>Nº de vacas</th><th>Estimativa por vacas</th><th>Método usado</th><th>Potencial principal</th><th></th></tr></thead><tbody id="potentialRows"></tbody></table></div></div>
        <p class="analytics-footnote">O cálculo não presume participação de mercado, taxa de conversão nem ciclo reprodutivo. Para alterar a estimativa por rebanho, informe o rebanho e ajuste as premissas acima.</p>`;
      content.appendChild(section);
    }
    if(!document.getElementById('communicationView')){
      const section=document.createElement('section');section.id='communicationView';section.className='view-section';section.innerHTML=`
        <div class="page-head"><div><div class="eyebrow">Relacionamento comercial</div><h2>Contato e mensagens</h2><p class="sub">Prepare uma mensagem individual, revise o texto e abra o aplicativo escolhido.</p></div></div>
        <div class="monitor-note"><b>Envio com revisão:</b> o WhatsApp abre uma conversa com o texto preenchido. O e-mail abre uma mensagem pronta no aplicativo de e-mail padrão; o envio depende da sua confirmação nele. Envio automático sem revisão requer backend seguro e integração de e-mail, que esta versão estática não possui.</div>
        <div class="panel" style="max-width:900px"><div class="panel-head"><div><h2>Preparar contato</h2><p>Os campos telefone e e-mail ficam no cadastro do cliente.</p></div></div><div class="modal-body"><div class="form-grid"><div class="form-field full"><label for="messageClient">Cliente</label><select id="messageClient"><option value="">Selecione um cliente</option></select></div><div class="form-field"><label for="messageTemplate">Modelo</label><select id="messageTemplate"><option value="followup">Retomar contato</option><option value="offer">Apresentar oportunidade</option><option value="custom">Mensagem livre</option></select></div><div class="form-field"><label for="messageSubject">Assunto do e-mail</label><input id="messageSubject" maxlength="140" value="Acompanhamento comercial"></div><div class="form-field full"><label for="messageBody">Mensagem</label><textarea id="messageBody" maxlength="2500" style="min-height:180px"></textarea><span class="form-hint" id="messageContactInfo">Selecione um cliente para preencher os dados de contato.</span></div></div><div class="form-actions"><button class="btn" id="openWhatsApp" type="button">◉ Abrir WhatsApp</button><button class="btn btn-primary" id="openEmail" type="button">✉ Abrir e-mail</button></div></div></div>`;
      content.appendChild(section);
    }
    document.getElementById('potentialRefresh')?.addEventListener('click',renderPotential);
    ['potentialYear','potentialDosesPerCow','potentialPricePerDose'].forEach(id=>document.getElementById(id)?.addEventListener('input',e=>{if(id==='potentialPricePerDose')e.target.dataset.touched='1';renderPotential()}));
    document.getElementById('messageClient')?.addEventListener('change',renderMessage);
    document.getElementById('messageTemplate')?.addEventListener('change',renderMessage);
    document.getElementById('openWhatsApp')?.addEventListener('click',openWhatsApp);
    document.getElementById('openEmail')?.addEventListener('click',openEmail);
    renderPotential();fillMessageClients();renderMessage();
  }
  function showView(id,title){
    document.querySelectorAll('.view-section').forEach(x=>x.classList.toggle('active',x.id===id));
    document.querySelectorAll('.nav button[data-view]').forEach(x=>x.classList.toggle('active',x.dataset.view===id));
    const crumb=document.getElementById('crumbName');if(crumb)crumb.textContent=title;
    document.getElementById('sidebar')?.classList.remove('open');
    if(id==='potentialView')renderPotential();if(id==='communicationView'){fillMessageClients();renderMessage()}
  }
  function renderPotential(){
    const body=document.getElementById('potentialRows');if(!body)return;
    const year=Number(document.getElementById('potentialYear')?.value)||defaultYear;selectedPotentialYear=year;
    const customers=indexedCustomers(year),history=validSales(sales()),yearRows=history.filter(x=>String(x.date||'').slice(0,4)===String(year)&&Number(x.quantity)>0&&Number(x.value)>0),allRows=history.filter(x=>Number(x.quantity)>0&&Number(x.value)>0);
    const weighted=(arr)=>{const qty=arr.reduce((a,x)=>a+Number(x.quantity||0),0),value=arr.reduce((a,x)=>a+Number(x.value||0),0);return qty?value/qty:0};
    const inferred=weighted(yearRows)||weighted(allRows),priceEl=document.getElementById('potentialPricePerDose'),doseEl=document.getElementById('potentialDosesPerCow');
    if(priceEl&&!priceEl.dataset.touched){priceEl.value=inferred.toFixed(2)}
    const price=Math.max(0,Number(priceEl?.value)||0),doses=Math.max(0,Number(doseEl?.value)||0);
    const source=document.getElementById('potentialPriceSource');if(source)source.textContent=inferred?`Referência importada: ${yearRows.length?'ano '+year:'histórico disponível'} · média ponderada ${money(inferred)} por unidade.`:'Sem preço médio calculável; informe o preço manualmente.';
    const rows=customers.map(c=>{const cows=Math.max(0,Number(c.record?.cows)||0),animalPotential=cows*doses*price,hasHistory=c.yearRevenue!==0;const method=cows>0?'Número de vacas':hasHistory?`Faturamento ${year}`:'Sem base';const main=cows>0?animalPotential:hasHistory?c.yearRevenue:0;return{...c,cows,animalPotential,method,main,hasHistory}}).filter(c=>c.yearRevenue||c.cows||c.record);
    const sumMain=rows.reduce((a,x)=>a+x.main,0),sumHistory=rows.reduce((a,x)=>a+x.yearRevenue,0),withCows=rows.filter(x=>x.cows>0),animalSum=withCows.reduce((a,x)=>a+x.animalPotential,0);
    const kpi=document.getElementById('potentialKpis');if(kpi)kpi.innerHTML=[['Potencial principal',money(sumMain)],['Faturamento no ano-base',money(sumHistory)],['Estimativa dos clientes com vacas',money(animalSum)],['Clientes com rebanho informado',withCows.length.toLocaleString('pt-BR')]].map(([l,v])=>`<article class="insight-kpi"><span>${esc(l)}</span><strong>${esc(v)}</strong></article>`).join('');
    body.innerHTML=rows.length?rows.sort((a,b)=>b.main-a.main).map(c=>`<tr><td>${esc(c.name)}</td><td>${esc(c.region||'—')}</td><td class="number-cell">${money(c.yearRevenue)}</td><td class="number-cell">${c.cows?c.cows.toLocaleString('pt-BR'):'—'}</td><td class="number-cell">${c.cows?money(c.animalPotential):'—'}</td><td>${esc(c.method)}</td><td class="number-cell"><b>${money(c.main)}</b></td><td><button class="btn btn-small" data-edit-potential="${esc(c.record?.id||'')}">Editar</button></td></tr>`).join(''):'<tr><td colspan="8" class="analytics-empty">Importe a base faturada da sua distrital; informe o número de vacas no cadastro dos clientes para calcular o segundo cenário.</td></tr>';
    body.querySelectorAll('[data-edit-potential]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.editPotential&&window.crmEditRecord)window.crmEditRecord(b.dataset.editPotential);else document.querySelector('[data-view="clientsView"]')?.click()}));
  }
  function fillMessageClients(){const select=document.getElementById('messageClient');if(!select)return;const old=select.value;const map=new Map(),list=records().filter(r=>!/^d[1-6]$/.test(String(r.id||'')));for(const r of list){if(norm(r.districtManager)&&norm(r.districtManager)!==DISTRICT_KEY)continue;map.set(customerKey(r),{...r})}for(const x of sales()){const k=salesKey(x),prior=map.get(k)||{};map.set(k,{...prior,name:prior.name||x.name,region:prior.region||x.region,clientCode:prior.clientCode||x.clientCode,phone:prior.phone||'',email:prior.email||''})}const clients=[...map.values()].filter(x=>x.name).sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));select.innerHTML='<option value="">Selecione um cliente</option>'+clients.map(x=>`<option value="${esc(customerKey(x))}">${esc(x.name)}${x.region?' · '+esc(x.region):''}</option>`).join('');if(clients.some(x=>customerKey(x)===old))select.value=old;select._crmClients=clients;}
  function chosenClient(){const s=document.getElementById('messageClient');return s?._crmClients?.find(x=>customerKey(x)===s.value)||null}
  function renderMessage(){const client=chosenClient(),template=document.getElementById('messageTemplate')?.value||'followup',body=document.getElementById('messageBody'),subject=document.getElementById('messageSubject');if(!body)return;if(client&&template!=='custom'){const msg=template==='offer'?`Olá ${client.name}, tudo bem?\n\nEstou entrando em contato para conversarmos sobre oportunidades que podem fazer sentido para a sua propriedade. Se preferir, podemos alinhar suas necessidades e eu preparo uma proposta adequada.\n\nFico à disposição.\nTimotheo`:`Olá ${client.name}, tudo bem?\n\nEstou retomando nosso contato para saber como estão as necessidades da propriedade e se há algo em que eu possa ajudar neste momento.\n\nFico à disposição.\nTimotheo`;body.value=msg;if(subject&&template==='offer')subject.value='Oportunidades comerciais para sua propriedade';else if(subject)subject.value='Acompanhamento comercial'}const info=document.getElementById('messageContactInfo');if(info)info.textContent=client?`Telefone: ${client.phone||'não cadastrado'} · E-mail: ${client.email||'não cadastrado'}`:'Selecione um cliente para preencher os dados de contato.'}
  function openWhatsApp(){const client=chosenClient();if(!client){alert('Selecione um cliente.');return}const digits=String(client.phone||'').replace(/\D/g,'');if(digits.length<10){alert('Cadastre um número de WhatsApp válido no cadastro do cliente.');return}const phone=digits.startsWith('55')?digits:'55'+digits;window.open(`https://wa.me/${phone}?text=${encodeURIComponent(document.getElementById('messageBody').value)}`,'_blank','noopener')}
  function openEmail(){const client=chosenClient();if(!client){alert('Selecione um cliente.');return}if(!client.email||!String(client.email).includes('@')){alert('Cadastre um e-mail válido no cadastro do cliente.');return}const subject=encodeURIComponent(document.getElementById('messageSubject').value||'Acompanhamento comercial'),body=encodeURIComponent(document.getElementById('messageBody').value||'');window.location.href=`mailto:${encodeURIComponent(client.email)}?subject=${subject}&body=${body}`}
  function patchForm(){
    const form=document.getElementById('recordForm');if(!form||document.getElementById('fCows'))return;
    const phone=document.getElementById('fPhone')?.closest('.form-field');if(phone){const email=document.createElement('div');email.className='form-field';email.innerHTML='<label for="fEmail">E-mail</label><input id="fEmail" type="email" maxlength="160" placeholder="nome@exemplo.com">';phone.insertAdjacentElement('afterend',email)}
    const profile=document.getElementById('fProfile')?.closest('.form-field');if(profile){const cows=document.createElement('div');cows.className='form-field';cows.innerHTML='<label for="fCows">Número de vacas (opcional)</label><input id="fCows" type="number" min="0" step="1" placeholder="Ex.: 120">';profile.insertAdjacentElement('afterend',cows)}
    const name=document.getElementById('fName');if(name){const label=name.closest('.form-field')?.querySelector('label');if(label)label.textContent='Nome do cliente *'}
    const id=document.getElementById('recordId');if(!id)return;
    const fill=()=>{const current=records().find(r=>r.id===id.value);document.getElementById('fEmail').value=current?.email||'';document.getElementById('fCows').value=current?.cows||''};
    document.getElementById('newClientBtn')?.addEventListener('click',()=>setTimeout(()=>{document.getElementById('fEmail').value='';document.getElementById('fCows').value=''},0));
    document.getElementById('newBtn')?.addEventListener('click',()=>setTimeout(()=>{document.getElementById('fEmail').value='';document.getElementById('fCows').value=''},0));
    document.getElementById('newBtn2')?.addEventListener('click',()=>setTimeout(()=>{document.getElementById('fEmail').value='';document.getElementById('fCows').value=''},0));
    document.addEventListener('click',e=>{const b=e.target.closest('[data-edit]');if(b)setTimeout(fill,0)});
    form.addEventListener('submit',()=>{const recordId=id.value;setTimeout(()=>{const rows=records(),r=rows.find(x=>x.id===recordId||(!recordId&&x.id&&String(x.id).startsWith('c')));if(!r)return;r.email=document.getElementById('fEmail').value.trim();r.cows=Math.max(0,Number(document.getElementById('fCows').value)||0);r.districtManager=DISTRICT;try{localStorage.setItem(CRM_KEY,JSON.stringify(rows));window.dispatchEvent(new Event('crm:records-updated'));renderPotential();fillMessageClients()}catch(e){alert('Não foi possível salvar e-mail e número de vacas no cadastro.')}} ,0)});
  }
  function brand(){
    const brand=document.querySelector('.brand');if(brand){brand.innerHTML='<img class="brand-logo" src="assets/logo-distrital-leite-sul.jpeg" alt="Leite Sul"/><div><strong>Distrital Timotheo</strong><small>Leite Sul · CRM Vendas</small></div>'}
    const user=document.querySelector('.user');if(user)user.innerHTML='<div class="avatar">TS</div><div><b>Distrital Timotheo</b><small>Leite Sul · CRM local</small></div>';
    document.title='CRM Distrital Timotheo — Leite Sul';
    const img=document.createElement('style');img.textContent='.brand-logo{width:50px;height:42px;object-fit:contain;border-radius:7px;flex:none;background:#245568}.brand{padding-left:5px!important;padding-right:5px!important}.brand strong{font-size:13px}.brand small{letter-spacing:.06em}';document.head.appendChild(img);
  }
  function boot(){brand();patchForm();ensureUI();document.addEventListener('click',e=>{const b=e.target.closest('.nav button[data-view]');if(b&&['potentialView','communicationView'].includes(b.dataset.view)){e.preventDefault();e.stopImmediatePropagation();showView(b.dataset.view,b.dataset.view==='potentialView'?'Potencial de venda':'Contato e mensagens')} });window.addEventListener('crm:sales-ready',()=>{renderPotential();fillMessageClients()});window.addEventListener('crm:records-updated',()=>{renderPotential();fillMessageClients()});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
