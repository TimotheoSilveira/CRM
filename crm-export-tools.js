(()=>{
  'use strict';
  const KEY='crm-comercial-v1';
  const $=id=>document.getElementById(id);
  const STAGES=['Novo lead','Sem compra há mais de 10 meses','Primeiro contato','Diagnóstico','Proposta','Negociação','Pedido em carteira','Em processamento','A faturar','Faturado'];
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
  const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const localRecords=()=>{try{const v=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(v)?v:[]}catch{return []}};
  const fmtMoney=n=>Number(n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  const col=n=>{let x='';for(n++;n;n=Math.floor((n-1)/26))x=String.fromCharCode(65+(n-1)%26)+x;return x};
  const excelDate=s=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(String(s||'')))return null;const d=new Date(s+'T00:00:00Z');return Math.floor((d-Date.UTC(1899,11,30))/86400000)};
  function xmlCell(ref,value,style=0,type='text'){
    if(value===null||value===undefined||value==='')return `<c r="${ref}" s="${style}"/>`;
    if(type==='number'&&Number.isFinite(Number(value)))return `<c r="${ref}" s="${style}"><v>${Number(value)}</v></c>`;
    return `<c r="${ref}" s="${style}" t="inlineStr"><is><t xml:space="preserve">${esc(value)}</t></is></c>`;
  }
  function recordRows(){
    const all=localRecords(),stage=$('crmExportStage')?.value||'*';
    const region=$('regionFilter')?.value||'',profile=$('profileFilter')?.value||'';
    const q=norm($('pipelineSearch')?.value||$('globalSearch')?.value||'').trim();
    const visible=all.filter(r=>{
      if((r.type==='customer'&&!r.autoRecencyStage&&!r.autoRecencyManualOverride)||(r.stage==='Faturado'&&/historico de vendas/i.test(r.notes||'')))return false;
      if(stage!=='*'&&r.stage!==stage)return false;
      if(region&&r.region!==region)return false;
      if(profile&&r.profile!==profile)return false;
      if(q&&!norm([r.name,r.clientCode,r.product,r.region,r.city,r.profile,r.stage,r.notes,r.lastQuoteId].join(' ')).includes(q))return false;
      return true;
    });
    return visible.sort((a,b)=>(Number(b.value)||0)-(Number(a.value)||0)||String(a.name||'').localeCompare(String(b.name||''),'pt-BR'));
  }
  const HEADERS=['Posição','Cliente','Código do cliente','Regional','Município','Perfil','Produto / necessidade','Etapa do funil','Valor da oportunidade','Última compra','Próximo contato','Telefone','E-mail','Proposta mais recente','Observações'];
  function stylesXml(){return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="2"><numFmt numFmtId="164" formatCode="&quot;R$&quot; #,##0.00;[Red]-&quot;R$&quot; #,##0.00"/><numFmt numFmtId="165" formatCode="dd/mm/yyyy"/></numFmts><fonts count="4"><font><sz val="11"/><name val="Aptos"/></font><font><b/><color rgb="FFFFFFFF"/><sz val="17"/><name val="Aptos Display"/></font><font><color rgb="FF38536B"/><i/><sz val="10"/><name val="Aptos"/></font><font><b/><color rgb="FF153E5C"/><sz val="10"/><name val="Aptos"/></font></fonts><fills count="5"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF0B3D6D"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFEAF2F7"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFF5F9FC"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left style="thin"><color rgb="FFDCE5EC"/></left><right style="thin"><color rgb="FFDCE5EC"/></right><top style="thin"><color rgb="FFDCE5EC"/></top><bottom style="thin"><color rgb="FFDCE5EC"/></bottom><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="11"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center"/></xf><xf numFmtId="0" fontId="2" fillId="3" borderId="0" applyFont="1" applyFill="1"/><xf numFmtId="0" fontId="3" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="3" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="2" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="1" applyBorder="1"/><xf numFmtId="0" fontId="0" fillId="4" borderId="1" applyFill="1" applyBorder="1"/><xf numFmtId="164" fontId="0" fillId="0" borderId="1" applyNumberFormat="1" applyBorder="1"/><xf numFmtId="165" fontId="0" fillId="0" borderId="1" applyNumberFormat="1" applyBorder="1"/><xf numFmtId="165" fontId="0" fillId="4" borderId="1" applyNumberFormat="1" applyFill="1" applyBorder="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`}
  async function makeWorkbook(rows,stage){
    if(!window.JSZip)throw Error('A biblioteca de exportação ainda está carregando. Recarregue a página e tente novamente.');
    const zip=new JSZip(),last=Math.max(6,6+rows.length),total=rows.reduce((a,r)=>a+(Number(r.value)||0),0);
    const widths=[10,34,18,25,23,13,32,28,21,16,16,18,30,23,48];
    let xmlRows='';
    xmlRows+=`<row r="1" ht="32" customHeight="1">${xmlCell('A1','DISTRITAL TIMOTHEO SOUZA SILVEIRA',1)}</row>`;
    xmlRows+=`<row r="2" ht="22" customHeight="1">${xmlCell('A2',`CRM COMERCIAL · FUNIL DE VENDAS · ${stage==='*'?'TODAS AS ETAPAS':stage.toLocaleUpperCase('pt-BR')}`,2)}</row>`;
    xmlRows+=`<row r="3" ht="8"/>`;
    xmlRows+=`<row r="4" ht="22">${xmlCell('A4','OPORTUNIDADES',3)}${xmlCell('B4',rows.length,4,'number')}${xmlCell('D4','VALOR TOTAL',3)}${xmlCell('E4',total,8,'number')}${xmlCell('G4','ETAPA EXPORTADA',3)}${xmlCell('H4',stage==='*'?'Todas':stage,4)}</row>`;
    xmlRows+=`<row r="5" ht="8"/>`;
    xmlRows+=`<row r="6" ht="30" customHeight="1">${HEADERS.map((h,i)=>xmlCell(col(i)+'6',h,5)).join('')}</row>`;
    rows.forEach((r,i)=>{
      const n=i+7,shade=i%2?7:6, d1=excelDate(r.lastBuy),d2=excelDate(r.next),values=[i+1,r.name,r.clientCode,r.region,r.city,r.profile,r.product,r.stage,Number(r.value)||0,d1,d2,r.phone,r.email,r.lastQuoteId,r.notes];
      const cells=values.map((v,j)=>{let st=shade,typ='text';if(j===0||j===8)typ='number';if(j===8)st=8;if(j===9||j===10){if(v!==null){typ='number';st=i%2?10:9}}return xmlCell(col(j)+n,v,st,typ)}).join('');
      xmlRows+=`<row r="${n}" ht="22" customHeight="1">${cells}</row>`;
    });
    const cols=widths.map((w,i)=>`<col min="${i+1}" max="${i+1}" width="${w}" customWidth="1"/>`).join('');
    const sheet=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><dimension ref="A1:O${last}"/><sheetViews><sheetView workbookViewId="0"><pane ySplit="6" topLeftCell="A7" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft" activeCell="A7" sqref="A7"/></sheetView></sheetViews><sheetFormatPr defaultRowHeight="18"/><cols>${cols}</cols><sheetData>${xmlRows}</sheetData><autoFilter ref="A6:O${last}"/><mergeCells count="2"><mergeCell ref="A1:O1"/><mergeCell ref="A2:O2"/></mergeCells><pageMargins left="0.25" right="0.25" top="0.5" bottom="0.5" header="0.2" footer="0.2"/><pageSetup orientation="landscape" fitToWidth="1" fitToHeight="0"/></worksheet>`;
    zip.file('[Content_Types].xml','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>');
    zip.file('_rels/.rels','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>');
    zip.file('xl/workbook.xml','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><bookViews><workbookView/></bookViews><sheets><sheet name="Funil" sheetId="1" r:id="rId1"/></sheets></workbook>');
    zip.file('xl/_rels/workbook.xml.rels','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>');
    zip.file('xl/styles.xml',stylesXml());zip.file('xl/worksheets/sheet1.xml',sheet);
    return zip.generateAsync({type:'blob',compression:'DEFLATE',mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
  }
  async function exportStage(){
    const stage=$('crmExportStage')?.value||'*',rows=recordRows();
    if(!rows.length){alert('Não há oportunidades visíveis nessa etapa com os filtros atuais.');return}
    const btn=$('crmExportXlsx');btn.disabled=true;btn.textContent='Preparando Excel…';
    try{const blob=await makeWorkbook(rows,stage),a=document.createElement('a'),url=URL.createObjectURL(blob),slug=(stage==='*'?'todas-etapas':stage.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-'));a.href=url;a.download=`funil-${slug}-${new Date().toISOString().slice(0,10)}.xlsx`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500)}catch(e){alert('Não foi possível gerar o Excel: '+(e?.message||e))}finally{btn.disabled=false;btn.textContent='⇩ Exportar Excel'}
  }
  function mount(){
    const view=$('pipelineView'),bar=view?.querySelector('.view-toolbar'),board=$('pipelineLarge');if(!bar||!board||$('crmExportToolbar'))return;
    const box=document.createElement('div');box.id='crmExportToolbar';box.className='crm-export-toolbar panel';
    box.innerHTML=`<div class="crm-export-copy"><strong>Compartilhar funil</strong><span>Exporte somente a etapa escolhida, respeitando os filtros da tela.</span></div><div class="crm-export-controls"><label for="crmExportStage">Etapa para exportar</label><select id="crmExportStage" class="field-control"><option value="*">Todas as etapas</option>${STAGES.map(s=>`<option value="${esc(s)}">${esc(s)}</option>`).join('')}</select><button id="crmExportXlsx" class="btn btn-primary">⇩ Exportar Excel</button></div>`;
    bar.insertAdjacentElement('afterend',box);
    const style=document.createElement('style');style.textContent=`.crm-export-toolbar{display:flex;align-items:center;justify-content:space-between;gap:16px;margin:0 0 12px;padding:14px 16px}.crm-export-copy{display:grid;gap:4px}.crm-export-copy strong{color:#153e5c;font-size:13px}.crm-export-copy span{color:#647184;font-size:11px}.crm-export-controls{display:flex;align-items:end;gap:8px;flex-wrap:wrap}.crm-export-controls label{font-size:10px;font-weight:800;color:#475569}.crm-export-controls select{min-width:230px}.crm-export-controls button{white-space:nowrap}.crm-export-toolbar .field-control{height:38px}@media(max-width:680px){.crm-export-toolbar{align-items:stretch;flex-direction:column}.crm-export-controls{display:grid;grid-template-columns:1fr}.crm-export-controls select,.crm-export-controls button{width:100%;min-width:0}}`;
    document.head.appendChild(style);$('crmExportXlsx').addEventListener('click',exportStage);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
