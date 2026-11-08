(()=>{
  const $=id=>document.getElementById(id);
  const status=$('importStatus');
  const accept='.xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv';
  const setStatus=(message,kind='info')=>{if(!status)return;status.textContent=message;status.style.color=kind==='error'?'#a84442':kind==='success'?'#267451':'#536443'};
  async function runSales(file){
    if(!file)return;
    const button=$('importSalesBtn');if(button)button.disabled=true;
    setStatus(`Lendo a base faturada “${file.name}”… ela pode levar alguns segundos por conter milhares de linhas.`);
    try{
      if(!window.crmImportSalesFile)throw new Error('O módulo de vendas não carregou. Recarregue a página completa e tente novamente.');
      const result=await window.crmImportSalesFile(file);
      if(!result||!Array.isArray(result.rows)||!Array.isArray(result.headers))throw new Error('A importação terminou sem confirmação dos registros salvos.');
      if(!result.rows.length||!result.headers.length)throw new Error('O arquivo foi lido, mas não retornou linhas ou cabeçalhos.');
      const incomplete=result.rows.filter(row=>!Array.isArray(row.sourceRow)||row.sourceRow.length<result.headers.length).length;
      if(incomplete)throw new Error(`${incomplete} linha(s) não preservaram todas as colunas da planilha.`);
      const commissionHeaders=result.headers.filter(h=>/comiss|^com[.\s]/i.test(String(h||'').trim())).length;
      setStatus(`Base faturada importada e preservada: ${result.rows.length.toLocaleString('pt-BR')} linhas, ${result.headers.length} colunas, ${result.clients.length.toLocaleString('pt-BR')} clientes agrupados e ${commissionHeaders} colunas de comissão. As linhas repetidas foram mantidas.`, 'success');
    }catch(error){setStatus(`Falha ao importar “${file.name}”: ${error?.message||String(error)}. Nenhum sucesso será indicado sem confirmação do armazenamento.`, 'error')}
    finally{if(button)button.disabled=false}
  }
  async function runMonitor(file){
    if(!file)return;
    const button=$('importMonitorDashboardBtn');if(button)button.disabled=true;
    setStatus(`Lendo o monitoramento “${file.name}”…`);
    try{
      if(!window.crmImportMonitorFile)throw new Error('O módulo de monitoramento não carregou. Recarregue a página completa e tente novamente.');
      const result=await window.crmImportMonitorFile(file,true);
      if(!result?.ok)throw new Error(result?.error||'A importação não confirmou os pedidos salvos.');
      setStatus(`Monitoramento importado: ${result.orders.toLocaleString('pt-BR')} pedidos agrupados em ${result.rows.toLocaleString('pt-BR')} linhas de itens.`, 'success');
    }catch(error){setStatus(`Falha ao importar “${file.name}”: ${error?.message||String(error)}.`, 'error')}
    finally{if(button)button.disabled=false}
  }
  window.addEventListener('load',()=>{const missing=[];if(!window.JSZip)missing.push('biblioteca de leitura Excel');if(!window.CRMXlsx?.workbookSheets)missing.push('leitor Excel');if(!window.crmImportSalesFile)missing.push('módulo de vendas');if(!window.crmImportMonitorFile)missing.push('módulo de monitoramento');if(missing.length)setStatus(`Pacote incompleto: não carregou ${missing.join(', ')}. Publique juntos o HTML e todos os componentes do pacote.`, 'error');else setStatus('Componentes de importação carregados. Se uma gravação falhar, o CRM exibirá o erro e não confirmará sucesso.', 'info')},{once:true});
  $('importSalesBtn')?.addEventListener('click',()=>$('salesImportFile').click());
  $('salesImportFile')?.addEventListener('change',e=>{const file=e.target.files?.[0];runSales(file);e.target.value=''})
  $('importMonitorDashboardBtn')?.addEventListener('click',()=>$('dashboardMonitorFile').click());
  $('dashboardMonitorFile')?.addEventListener('change',e=>{const file=e.target.files?.[0];runMonitor(file);e.target.value=''})
})();
