(()=>{
  'use strict';
  const CRM_KEY='crm-comercial-v1', MONITOR_KEY='crm-monitor-v1', CURRENT_KEY='crm-current-monitor-clients-v1';
  const DB='crm-comercial-data-v1', STORE='datasets', DATASET='sales-history-v1';
  const DISTRICT='TIMOTHEO SOUZA SILVEIRA';
  const norm=s=>String(s??'').trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const nk=norm(DISTRICT);
  const key=(code,name,region)=>norm(code)?'c:'+norm(code):'n:'+norm(name)+'|'+norm(region);
  let busy=false, pending=false, salesRows=[];
  const read=(k,fallback)=>{try{const x=JSON.parse(localStorage.getItem(k)||'null');return x??fallback}catch{return fallback}};
  function cutoffDate(){const d=new Date();d.setHours(12,0,0,0);d.setMonth(d.getMonth()-10);return d.toISOString().slice(0,10)}
  function salesDateMap(rows){const map=new Map();for(const t of rows){if(norm(t.districtManager)!==nk||norm(t.operation).includes('devolucao'))continue;const k=key(t.clientCode,t.name,t.region),date=String(t.date||'').slice(0,10);if(!k||!date)continue;const prior=map.get(k);if(!prior||date>prior.lastBuy)map.set(k,{lastBuy:date,name:t.name||prior?.name||'',region:t.region||prior?.region||'',clientCode:t.clientCode||prior?.clientCode||'',product:t.product||prior?.product||'',category:t.category||prior?.category||'',profile:t.profile||prior?.profile||'',city:t.city||prior?.city||'',purchases:0})}return map}
  function salesClientMap(rows){const map=new Map();for(const t of rows){if(norm(t.districtManager)!==nk)continue;const k=key(t.clientCode,t.name,t.region);if(!map.has(k))map.set(k,{name:t.name||'',region:t.region||'',clientCode:t.clientCode||'',lastBuy:'',product:t.product||'',category:t.category||'',profile:t.profile||'',city:t.city||'',purchases:0,seller:t.seller||'',districtManager:DISTRICT});const c=map.get(k);if(String(t.date||'')>String(c.lastBuy||''))c.lastBuy=t.date||'';c.purchases=Math.max(c.purchases,Number(t.accumulated)||0);if(t.product)c.product=t.product;if(t.category)c.category=t.category}return map}
  function accountKeys(x){return [norm(x.clientCode||x.clientId)?'c:'+norm(x.clientCode||x.clientId):'',norm(x.name)?'n:'+norm(x.name)+'|'+norm(x.region):''].filter(Boolean)}
  function monitoredKeys(){const snapshot=read(CURRENT_KEY,null),items=Array.isArray(snapshot)?snapshot:(read(MONITOR_KEY,{}).orders||[]).filter(o=>norm(o.districtManager)===nk&&!o.missing&&!o.manualBilled&&!o.explicitBilled),set=new Set();for(const x of items)for(const k of accountKeys(x))set.add(k);return set}
  function isMonitored(x,keys){return accountKeys(x).some(k=>keys.has(k))}
  function matchRecord(rows,c){const k=key(c.clientCode,c.name,c.region);return rows.find(r=>key(r.clientCode,r.name,r.region)===k)||(c.clientCode?rows.find(r=>norm(r.clientCode)===norm(c.clientCode)):null)||rows.find(r=>norm(r.name)===norm(c.name)&&norm(r.region)===norm(c.region))||null}
  function emitRowsChanged(){window.dispatchEvent(new Event('crm:records-updated'))}
  function reconcile(){if(busy){pending=true;return}if(!salesRows.length)return;busy=true;try{
    const rows=read(CRM_KEY,[]);if(!Array.isArray(rows))return;
    const clients=salesClientMap(salesRows),lastDates=salesDateMap(salesRows),monitored=monitoredKeys(),before=JSON.stringify(rows);
    // Retain records only when they are explicitly assigned to this district or verified in its sales/monitoring data.
    let kept=rows.filter(r=>{const manager=norm(r.districtManager),k=key(r.clientCode||r.orderId,r.name,r.region);if(manager&&manager!==nk)return false;const explicit=manager===nk,matched=clients.has(k)||isMonitored(r,monitored)||!!matchRecord([...clients.values()],r);if(explicit||matched){r.districtManager=DISTRICT;return true}return false});
    for(const [k,c] of clients){let r=matchRecord(kept,c);if(!r){const id='sales-'+(norm(c.clientCode)||norm(c.name))+'-'+norm(c.region);r={id,type:'customer',name:c.name,clientCode:c.clientCode,phone:'',email:'',region:c.region,city:c.city||'',profile:c.profile||'LEITE',product:c.product||'',category:c.category||'',seller:c.seller||'',value:0,purchases:c.purchases||0,stage:'Diagnóstico',next:'',lastBuy:c.lastBuy||'',districtManager:DISTRICT,notes:'Cliente incluído automaticamente a partir do histórico faturado da sua distrital.',created:new Date().toISOString()};kept.push(r)}
      r.districtManager=DISTRICT;r.clientCode=r.clientCode||c.clientCode;r.lastBuy=c.lastBuy||r.lastBuy||'';r.product=c.product||r.product;r.category=c.category||r.category;r.city=c.city||r.city;r.profile=c.profile||r.profile;r.purchases=Math.max(Number(r.purchases)||0,Number(c.purchases)||0);
      const monitoredNow=isMonitored({...r,clientCode:r.clientCode||c.clientCode},monitored);
      if(monitoredNow){if(r.autoRecencyStage){r.autoRecencyStage=false;r.autoRecencyReason='';}continue}
      const latest=lastDates.get(k)?.lastBuy||r.lastBuy||'';if(!/^\d{4}-\d\d-\d\d$/.test(latest))continue;
      // Do not reset a stage the user deliberately moved after the automatic classification.
      if(r.autoRecencyManualOverride)continue;
      const oldEnough=latest<cutoffDate();
      r.stage=oldEnough?'Sem compra há mais de 10 meses':'Diagnóstico';
      r.autoRecencyStage=true;r.autoRecencyReason=oldEnough?'Última compra anterior ao limite de 10 meses':'Comprou nos últimos 10 meses';r.type='customer';
    }
    const after=JSON.stringify(kept);if(after!==before){localStorage.setItem(CRM_KEY,after);window.crmRefreshBilling?.();emitRowsChanged();window.crmClientDetail?.render?.();window.crmRepurchase?.render?.()}
  }catch(err){console.error('Automação de carteira da distrital:',err)}finally{busy=false;if(pending){pending=false;queueMicrotask(reconcile)}}}
  function loadSalesFromDb(){return new Promise(resolve=>{if(!window.indexedDB){resolve([]);return}let req;try{req=indexedDB.open(DB,1)}catch{resolve([]);return}req.onsuccess=()=>{const db=req.result;if(!db.objectStoreNames.contains(STORE)){db.close();resolve([]);return}try{const tx=db.transaction(STORE,'readonly'),get=tx.objectStore(STORE).get(DATASET);get.onsuccess=()=>{salesRows=(get.result?.rows||[]).filter(r=>norm(r.districtManager)===nk);db.close();resolve(salesRows)};get.onerror=()=>{db.close();resolve([])}}catch{db.close();resolve([])}};req.onerror=()=>resolve([])})}
  window.crmSetCurrentMonitorClients=items=>{try{const clients=(items||[]).map(o=>({clientCode:o.clientCode||o.clientId||'',name:o.name||'',region:o.region||'',districtManager:DISTRICT}));localStorage.setItem(CURRENT_KEY,JSON.stringify(clients));reconcile()}catch(err){console.error('Não foi possível registrar a lista atual do monitoramento:',err)}};
  window.crmAutoReconcileDistrict=()=>reconcile();
  window.addEventListener('crm:sales-ready',e=>{salesRows=(Array.isArray(window.crmSalesData)?window.crmSalesData:[]).filter(r=>norm(r.districtManager)===nk);reconcile()});
  window.addEventListener('crm:records-updated',()=>{if(salesRows.length)reconcile()});
  window.addEventListener('crm:monitor-updated',()=>reconcile());
  loadSalesFromDb().then(rows=>{salesRows=rows;reconcile()});
})();
