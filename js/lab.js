(function(){
  'use strict';
  if(window.__GiaHuyLabReady) return; window.__GiaHuyLabReady=true;

  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const STORAGE='giahuy-lab-project-v1', LAST='giahuy-lab-last-project-v1';
  const DEFAULT_CODE=`void setup() {\n  pinMode(13, OUTPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  digitalWrite(13, HIGH);\n  Serial.println("LED ON");\n  delay(500);\n  digitalWrite(13, LOW);\n  Serial.println("LED OFF");\n  delay(500);\n}`;
  const boardProfilesUrl='data/lab-board-profiles.json', modulesUrl='data/lab-modules.json';
  const now=()=>Date.now(), uid=p=>p+'_'+Math.random().toString(36).slice(2,10);
  const esc=s=>String(s==null?'':s).replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]));

  const app={
    boards:[],modules:[],board:null,project:null,activeDiagnostic:null,wireDraft:null,wireDrag:null,history:[],future:[],logsPaused:false,serialPaused:false,zoom:1,searchTerm:'',moduleFilter:'All',consoleTab:'diagnostics',consoleFilter:'all',consoleSearch:'',
    events:[], lesson:{required:2,done:0}
  };

  function blankProject(boardId){
    return {schemaVersion:1,projectId:uid('project'),name:'Arduino Lab Project',targetBoardId:boardId,policy:'strict',systemState:'READY',components:[
      {id:'board-1',kind:'board',boardId:boardId,x:40,y:65,locked:true},
      {id:'led-1',kind:'led',componentType:'LED demo',x:570,y:180,locked:false},
      {id:'button-1',kind:'button',componentType:'Button demo',x:570,y:390,locked:false}
    ],wires:[],netlist:{nets:[]},diagnostics:[],code:DEFAULT_CODE,artifact:null,artifactStale:true,ui:{zoom:1},createdAt:now(),updatedAt:now()};
  }

  function saveSnapshot(push=true){
    if(push){app.history.push(structuredClone(app.project)); if(app.history.length>40) app.history.shift(); app.future=[];}
  }
  function persist(){
    app.project.updatedAt=now(); app.project.netlist=buildNetlist();
    try{localStorage.setItem(STORAGE,JSON.stringify(app.project)); localStorage.setItem(LAST,JSON.stringify(app.project));}catch(e){pushEvent('Persistence','SAVE_FAILED','Không thể lưu localStorage: '+e.message,'warning');}
  }
  function loadSaved(){
    try{const raw=localStorage.getItem(LAST)||localStorage.getItem(STORAGE); if(raw){const p=JSON.parse(raw); if(p&&p.schemaVersion===1)return p;}}catch(e){}
    return null;
  }
  function normalizeProject(p){
    const base=blankProject(p?.targetBoardId||app.boards[0]?.boardId);
    return Object.assign(base,p,{components:Array.isArray(p.components)&&p.components.length?p.components:base.components,wires:Array.isArray(p.wires)?p.wires:[],diagnostics:Array.isArray(p.diagnostics)?p.diagnostics:[],netlist:p.netlist||{nets:[]},ui:p.ui||{zoom:1},policy:p.policy||'strict',code:typeof p.code==='string'?p.code:DEFAULT_CODE});
  }
  function pushEvent(subsystem,code,message,severity='info',meta={}){
    const ev={eventId:uid('evt'),timestamp:now(),subsystem,errorCode:code,message,severity,...meta}; app.project.events=app.project.events||[]; app.project.events.unshift(ev); if(app.project.events.length>300)app.project.events.length=300;
    renderEvents();
  }
  function log(severity,code,subsystem,studentMessage,details={}){
    const existing=app.project.diagnostics.find(d=>d.errorCode===code&&d.resolved===false&&JSON.stringify(d.componentIds||[])===JSON.stringify(details.componentIds||[]));
    if(existing){existing.occurrenceCount=(existing.occurrenceCount||1)+1; existing.lastSeenAt=now(); renderAll(); return existing;}
    const d={diagnosticId:uid('diag'),eventId:uid('evt'),timestamp:now(),severity,errorCode:code,subsystem,message:studentMessage,technicalMessage:details.technicalMessage||studentMessage,studentMessage,teacherMessage:details.teacherMessage||studentMessage,componentIds:details.componentIds||[],portIds:details.portIds||[],wireIds:details.wireIds||[],netIds:details.netIds||[],actual:details.actual||null,expected:details.expected||null,cause:details.cause||'',evidence:details.evidence||'',suggestedFix:details.suggestedFix||'',focusTarget:details.focusTarget||null,relatedDiagnostics:details.relatedDiagnostics||[],occurrenceCount:1,firstSeenAt:now(),lastSeenAt:now(),resolved:false,resolvedAt:null,recoveryEventId:null,runBlocked:!!details.runBlocked,lessonImpact:details.lessonImpact||'NONE',sourceRef:details.sourceRef||null};
    app.project.diagnostics.unshift(d); pushEvent(subsystem,code,studentMessage,severity,{diagnosticId:d.diagnosticId}); renderAll(); return d;
  }
  function resolveDiagnostics(predicate,recovery){
    const resolved=[];
    app.project.diagnostics.forEach(d=>{if(!d.resolved&&predicate(d)){d.resolved=true;d.resolvedAt=now();d.recoveryEventId=recovery;resolved.push(d);}});
    if(resolved.length){pushEvent('Recovery','RECOVERY',`${resolved.length} diagnostic đã được giải quyết`, 'success',{relatedDiagnostics:resolved.map(x=>x.diagnosticId)}); renderAll();}
  }

  function findPort(componentId,portId){
    const c=app.project.components.find(x=>x.id===componentId); if(!c)return null;
    if(c.kind==='board') return (app.board?.pins||[]).find(p=>p.id===portId)||null;
    if(c.kind==='led') return ledPorts().find(p=>p.id===portId)||null;
    if(c.kind==='button') return buttonPorts().find(p=>p.id===portId)||null;
    return null;
  }
  function portKey(c,p){return `${c}:${p}`;}
  function ledPorts(){return [
    {id:'anode',label:'Anode',role:'load',direction:'input',voltageDomain:'UNKNOWN',inputOnly:true,outputCapable:false,allowedEndpointTypes:['gpio','power'],verificationStatus:'unverified'},
    {id:'cathode',label:'Cathode',role:'ground_return',direction:'input',voltageDomain:'UNKNOWN',inputOnly:true,outputCapable:false,allowedEndpointTypes:['ground','gpio'],verificationStatus:'unverified'}
  ];}
  function buttonPorts(){return [
    {id:'a',label:'A',role:'switch',direction:'bidirectional',voltageDomain:'UNKNOWN',inputOnly:false,outputCapable:false,allowedEndpointTypes:['gpio','power','ground'],verificationStatus:'unverified'},
    {id:'b',label:'B',role:'switch',direction:'bidirectional',voltageDomain:'UNKNOWN',inputOnly:false,outputCapable:false,allowedEndpointTypes:['gpio','power','ground'],verificationStatus:'unverified'}
  ];}
  function endpointType(p){if(!p)return'unknown'; if(p.role==='ground')return'ground'; if(p.role==='power')return'power'; if(p.role==='gpio')return'gpio'; return p.role||'unknown';}
  function pairKey(a,b){return [portKey(a.componentId,a.portId),portKey(b.componentId,b.portId)].sort().join('|');}
  function existingWire(a,b){return app.project.wires.find(w=>pairKey(w.source,w.target)===pairKey(a,b));}

  function validateConnection(a,b){
    const source=findPort(a.componentId,a.portId), target=findPort(b.componentId,b.portId);
    const out={state:'VALID',severity:'success',code:null,message:'Kết nối hợp lệ.',technicalMessage:'',cause:'',expected:'',actual:'',suggestedFix:'',runBlocked:false};
    if(!source||!target)return {...out,state:'ERROR',severity:'error',code:'WIRE004',message:'Một đầu dây không còn tồn tại.',cause:'Endpoint missing',suggestedFix:'Chọn lại chân nguồn và chân đích.'};
    if(a.componentId===b.componentId&&a.portId===b.portId)return {...out,state:'ERROR',severity:'error',code:'WIRE003',message:'Không thể nối một chân với chính nó.',cause:'Duplicate/self connection',suggestedFix:'Chọn một port khác.'};
    if(existingWire(a,b))return {...out,state:'ERROR',severity:'error',code:'WIRE003',message:'Kết nối này đã tồn tại.',cause:'Duplicate connection',suggestedFix:'Xóa dây cũ hoặc chọn cặp chân khác.'};
    if(!Array.isArray(target.allowedEndpointTypes)||!target.allowedEndpointTypes.includes(endpointType(source))){
      out.state='ERROR';out.severity='error';out.code='WIRE002';out.message=`Port ${target.label} không tương thích với ${source.label}.`;out.actual=`${endpointType(source)} → ${endpointType(target)}`;out.expected=(target.allowedEndpointTypes||[]).join(', ');out.cause='Hai endpoint không nằm trong compatibility matrix.';out.suggestedFix=`Chọn đúng loại chân cho ${target.label}.`;out.runBlocked=true;return out;
    }
    if(!Array.isArray(source.allowedEndpointTypes)||!source.allowedEndpointTypes.includes(endpointType(target))){
      out.state='ERROR';out.severity='error';out.code='WIRE002';out.message=`Port ${source.label} không chấp nhận ${target.label}.`;out.actual=`${endpointType(source)} ↔ ${endpointType(target)}`;out.expected=(source.allowedEndpointTypes||[]).join(', ');out.cause='Endpoint policy mismatch.';out.suggestedFix=`Đổi chân đích sang loại phù hợp với ${source.label}.`;out.runBlocked=true;return out;
    }
    if(source.verificationStatus==='unverified'||target.verificationStatus==='unverified'){
      out.state='WARNING';out.severity='warning';out.code='ASSET001';out.message='Kết nối tạo được nhưng metadata của endpoint chưa được xác minh.';out.actual=`${source.label} → ${target.label}`;out.expected='Endpoint có metadata đã xác minh';out.cause='Một hoặc cả hai endpoint đang UNVERIFIED.';out.suggestedFix='Kiểm tra source/pinout trước khi gọi kết nối là safe.';out.runBlocked=false;
    }
    const sv=source.voltageDomain,tv=target.voltageDomain;
    if(sv&&tv&&sv!=='UNKNOWN'&&tv!=='UNKNOWN'&&sv!=='GND'&&tv!=='GND'&&sv!==tv&&endpointType(source)==='power'&&endpointType(target)==='power'){
      out.state='ERROR';out.severity='error';out.code='PWR001';out.message=`Sai voltage domain: ${sv} → ${tv}.`;out.actual=sv;out.expected=tv;out.cause='Power rails with different voltage domains were merged.';out.suggestedFix='Giữ các rail điện áp khác nhau tách biệt.';out.runBlocked=true;
    }
    if((sv==='5V'&&tv==='3.3V')||(sv==='3.3V'&&tv==='5V')){
      out.state='ERROR';out.severity='error';out.code='GPIO001';out.message='Không được đưa 5V vào miền GPIO 3.3V.';out.actual=sv;out.expected=tv+' logic class';out.cause='Voltage domain mismatch trên signal/power endpoint.';out.suggestedFix='Dùng chân 3V3 hoặc mạch chuyển mức phù hợp.';out.runBlocked=true;
    }
    if(source.role==='gpio'&&source.outputCapable&&target.role==='gpio'&&target.outputCapable){
      out.state='ERROR';out.severity='error';out.code='WIRE002';out.message=`Không nối trực tiếp hai output: ${source.label} ↔ ${target.label}.`;out.actual='output ↔ output';out.expected='output ↔ input/passive';out.cause='GPIO capability conflict.';out.suggestedFix='Chọn chân input/passive hoặc thiết bị trung gian.';out.runBlocked=true;
    }
    return out;
  }

  function addWire(a,b,forced=false){
    const v=validateConnection(a,b); const wire={wireId:uid('wire'),source:{...a},target:{...b},netId:uid('net'),routePoints:[],validationState:v.state,electricalState:v.state==='ERROR'?'FAULT':'UNKNOWN',faultState:v.state==='ERROR',createdAt:now(),updatedAt:now(),createdBy:'student',locked:false,teacherLocked:false,lessonRequired:false,tracePath:[],focusTarget:null,canAutoFix:false};
    if(v.state==='ERROR'&&!forced&&app.project.policy==='strict'){
      const d=log(v.severity,v.code||'WIRE002','Wiring',v.message,{technicalMessage:v.technicalMessage||v.message,componentIds:[a.componentId,b.componentId],portIds:[a.portId,b.portId],wireIds:[wire.wireId],actual:v.actual,expected:v.expected,cause:v.cause,evidence:`${a.componentId}:${a.portId} → ${b.componentId}:${b.portId}`,suggestedFix:v.suggestedFix,focusTarget:{wireId:wire.wireId,componentId:b.componentId,portId:b.portId},runBlocked:v.runBlocked});
      app.activeDiagnostic=d; openDiagnostic(d); return false;
    }
    saveSnapshot(true); app.project.wires.push(wire); rebuildAfterTopology(); persist(); renderAll();
    if(v.state==='ERROR'){
      wire.validationState='ERROR';wire.faultState=true;
      const d=log('error',v.code||'WIRE002','Wiring',v.message,{componentIds:[a.componentId,b.componentId],portIds:[a.portId,b.portId],wireIds:[wire.wireId],actual:v.actual,expected:v.expected,cause:v.cause,suggestedFix:v.suggestedFix,focusTarget:{wireId:wire.wireId,componentId:b.componentId,portId:b.portId},runBlocked:v.runBlocked});
      app.activeDiagnostic=d; openDiagnostic(d);
    } else {
      log(v.state==='WARNING'?'warning':'success',v.state==='WARNING'?'ASSET001':'WIRE_OK','Wiring',`${a.portId} → ${b.portId} đã được kết nối.`,{componentIds:[a.componentId,b.componentId],portIds:[a.portId,b.portId],wireIds:[wire.wireId],focusTarget:{wireId:wire.wireId}});
      const recovery=uid('recovery'); resolveDiagnostics(d=>d.portIds?.includes(a.portId)&&d.portIds?.includes(b.portId),recovery);
      toast(v.state==='WARNING'?'Kết nối đã lưu — cần kiểm tra metadata.':'Kết nối hợp lệ.',v.state==='WARNING'?'warning':'success');
    }
    return true;
  }
  function rebuildAfterTopology(){
    app.project.netlist=buildNetlist();
    app.project.wires.forEach(w=>{if(w.validationState==='ERROR')w.faultState=true;});
  }
  function buildNetlist(){
    const parent=new Map(), find=x=>{if(!parent.has(x))parent.set(x,x);let r=x;while(parent.get(r)!==r)r=parent.get(r);while(parent.get(x)!==x){const nx=parent.get(x);parent.set(x,r);x=nx;}return r;}, union=(a,b)=>{const ra=find(a),rb=find(b);if(ra!==rb)parent.set(rb,ra)};
    app.project.wires.forEach(w=>{union(portKey(w.source.componentId,w.source.portId),portKey(w.target.componentId,w.target.portId));});
    const groups=new Map(); app.project.wires.forEach(w=>{const k=find(portKey(w.source.componentId,w.source.portId));if(!groups.has(k))groups.set(k,[]);groups.get(k).push(w.source,w.target)});
    return {schemaVersion:1,nets:Array.from(groups.entries()).map(([root,endpoints])=>({netId:uid('net'),endpoints:[...new Map(endpoints.map(e=>[portKey(e.componentId,e.portId),e])).values()],validationState:'UNKNOWN',diagnostics:[]}))};
  }

  function renderBoard(){
    const el=$('#boardNode'); if(!el||!app.board)return;
    const digital=app.board.pins.filter(p=>p.role==='gpio'), power=app.board.pins.filter(p=>p.role!=='gpio');
    const pin=(p,side)=>`<button class="port port-${side}" aria-label="Port ${esc(p.label)}" title="${esc(p.label)}" data-component="board-1" data-port="${esc(p.id)}"><span class="port-label">${esc(p.label)}</span><i></i></button>`;
    const left=digital.slice(0,Math.ceil(digital.length/2)),right=digital.slice(Math.ceil(digital.length/2));
    el.innerHTML=`<div class="board-card"><div class="board-head"><div><span class="lab-kicker">${esc(app.board.verificationStatus.toUpperCase())}</span><b>${esc(app.board.name)}</b><small>${app.board.logicVoltage}V logic · Pinout có nguồn xác minh</small></div><div class="board-meta">${app.board.pins.length} exposed pins</div></div><div class="pin-grid"><div class="pin-bank"><div class="pin-bank-title">GPIO / ANALOG</div>${left.map(p=>pin(p,'right')).join('')}</div><div class="pin-bank"><div class="pin-bank-title">GPIO / BUSES</div>${right.map(p=>pin(p,'left')).join('')}</div><div class="pin-bank"><div class="pin-bank-title">POWER</div>${power.map(p=>pin(p,'right')).join('')}</div></div><div style="padding:0 12px 12px;color:#8fa1b8;font-size:8px">Source: <a href="${esc(app.board.sourceRef)}" target="_blank" rel="noreferrer" style="color:#b9c8db">official documentation</a></div></div>`;
    positionComponent('board-1');
  }
  function renderComponent(c){
    if(c.kind==='led')return;
    if(c.kind==='button')return;
    if(c.kind!=='visual')return;
  }
  function syncPositions(){
    app.project.components.forEach(c=>positionComponent(c.id));
  }
  function positionComponent(id){
    const c=app.project.components.find(x=>x.id===id); if(!c)return; const el=document.getElementById(c.id==='board-1'?'boardNode':c.id==='led-1'?'ledNode':c.id==='button-1'?'buttonNode':`node-${c.id}`); if(!el)return; el.style.left=(c.x*app.zoom)+'px'; el.style.top=(c.y*app.zoom)+'px'; el.style.transform=`scale(${app.zoom})`; el.style.transformOrigin='top left';}

  function renderGenericNode(c){
    let el=document.getElementById(`node-${c.id}`); if(!el){el=document.createElement('div');el.className='component-node';el.id=`node-${c.id}`;$('#circuitCanvas').appendChild(el);}
    el.innerHTML=`<div class="component-head"><span class="component-type">${esc(c.supportLevel||'UNVERIFIED').toUpperCase()}</span><b>${esc(c.name)}</b><button class="node-x" data-remove="${esc(c.id)}">×</button></div><div class="component-body"><div class="led-glyph">◈</div><small>${esc(c.category)} · ${esc(c.verificationStatus||'unverified')}</small><div class="port-list"><span class="port"><span class="port-label">No verified ports</span><i></i></span></div></div>`;
    positionComponent(c.id);
  }

  function renderWireLayer(){
    const svg=$('#wireLayer'),canvas=$('#circuitCanvas'); if(!svg||!canvas)return; const rect=canvas.getBoundingClientRect();svg.setAttribute('viewBox',`0 0 ${rect.width} ${rect.height}`);svg.innerHTML='';
    const pointFor=(key)=>{const e=document.querySelector(`.port[data-component="${CSS.escape(key.componentId)}"][data-port="${CSS.escape(key.portId)}"]`);if(!e)return null;const r=e.getBoundingClientRect();return{x:r.left+r.width/2-rect.left,y:r.top+r.height/2-rect.top};};
    app.project.wires.forEach(w=>{const a=pointFor(w.source),b=pointFor(w.target);if(!a||!b)return;const mx=(a.x+b.x)/2;const d=`M ${a.x} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`;const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',d);p.setAttribute('class',`wire-path ${w.validationState.toLowerCase()}${app.activeWireId===w.wireId?' selected':''}`);p.dataset.wireId=w.wireId;p.setAttribute('tabindex','0');p.setAttribute('aria-label',`Dây ${w.wireId}`);svg.appendChild(p);});
    if(app.wireDraft){const a=pointFor(app.wireDraft.source),b=app.wireDraft.current;if(a&&b){const mx=(a.x+b.x)/2;const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',`M ${a.x} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`);p.setAttribute('class','wire-path wire-preview');svg.appendChild(p);}}
  }

  function renderNodeClasses(){
    $$('.port').forEach(p=>{p.classList.remove('valid','warning','error','focused','correct-target','invalid-target');const c=p.dataset.component,id=p.dataset.port;const matching=app.project.wires.filter(w=>w.source.componentId===c&&w.source.portId===id||w.target.componentId===c&&w.target.portId===id);const worst=matching.some(w=>w.validationState==='ERROR')?'error':matching.some(w=>w.validationState==='WARNING')?'warning':matching.length?'valid':'';if(worst)p.classList.add(worst);if(app.focusTarget?.componentId===c&&app.focusTarget?.portId===id)p.classList.add('focused');if(app.correctTarget?.componentId===c&&app.correctTarget?.portId===id)p.classList.add('correct-target');});
  }
  function renderAll(){
    renderBoard(); renderNodeClasses(); syncPositions(); app.project.components.filter(c=>c.kind==='visual').forEach(renderGenericNode); renderWireLayer(); renderConsole(); renderEvents(); updateStats(); updateLesson(); updateState(); updateArtifact();
  }

  function updateStats(){
    const ds=app.project.diagnostics.filter(d=>!d.resolved);$('#wireCount').textContent=app.project.wires.length;$('#errorCount').textContent=ds.filter(d=>d.severity==='error').length;$('#warningCount').textContent=ds.filter(d=>d.severity==='warning').length;$('#netCount').textContent=app.project.netlist?.nets?.length||0;$('#tabErrorCount').textContent=ds.filter(d=>d.severity==='error').length;}
  function updateState(){
    const blocking=app.project.diagnostics.some(d=>!d.resolved&&d.runBlocked);
    if(blocking) app.project.systemState='FAULT';
    else if(app.project.systemState==='FAULT') app.project.systemState='EDITING';
    else app.project.systemState=app.project.systemState||'READY';
    $('#simState').textContent=app.project.systemState;
  }
  function updateLesson(){
    const okA=app.project.wires.some(w=>(portKey(w.source.componentId,w.source.portId)==='board-1:D13'&&portKey(w.target.componentId,w.target.portId)==='led-1:anode')||(portKey(w.target.componentId,w.target.portId)==='board-1:D13'&&portKey(w.source.componentId,w.source.portId)==='led-1:anode'));
    const okG=app.project.wires.some(w=>(portKey(w.source.componentId,w.source.portId)==='board-1:GND1'&&portKey(w.target.componentId,w.target.portId)==='led-1:cathode')||(portKey(w.target.componentId,w.target.portId)==='board-1:GND1'&&portKey(w.source.componentId,w.source.portId)==='led-1:cathode'));
    app.lesson.done=Number(okA)+Number(okG);$('#lessonProgress').textContent=`${app.lesson.done}/2`;$('#lessonBar').style.width=(app.lesson.done/2*100)+'%';
  }
  function updateArtifact(){const a=app.project.artifact;$('#artifactState').textContent=a&&!app.project.artifactStale?'VALID':'STALE';$('#artifactState').className='status-chip '+(a&&!app.project.artifactStale?'ok':'warning');}
  function updateBoardBadge(){const b=app.board;const e=$('#boardVerification');e.textContent=b?b.verificationStatus.toUpperCase():'UNVERIFIED';e.className='status-chip '+(b?.verificationStatus==='verified'?'ok':'warning');}

  function renderConsole(){
    const body=$('#consoleBody'); if(!body)return; if(app.consoleTab!=='diagnostics'){body.classList.add('hidden');return;} body.classList.remove('hidden'); const term=app.consoleSearch.toLowerCase();let ds=app.project.diagnostics.slice();if(app.consoleFilter!=='all')ds=ds.filter(d=>d.severity===app.consoleFilter);if(term)ds=ds.filter(d=>JSON.stringify(d).toLowerCase().includes(term));
    if(app.logsPaused)return;
    body.innerHTML=ds.length?ds.map(d=>diagCard(d)).join(''):`<div class="empty-console"><div><strong>Console đang sạch</strong><span>Mọi diagnostic vẫn được giữ trong project history; Clear chỉ dọn view hiện tại.</span></div></div>`;
  }
  function diagCard(d){const resolved=d.resolved?' · Resolved':'';return `<article class="console-card ${esc(d.severity)}" data-diag="${esc(d.diagnosticId)}"><div class="cc-top"><span class="sev ${esc(d.severity)}">${esc(d.severity.toUpperCase())}</span><span class="cc-code">${esc(d.errorCode)}${esc(resolved)}</span></div><h4>${esc(d.studentMessage)}</h4><p>${esc(d.actual||'')} ${d.expected?'· expected: '+esc(d.expected):''}</p><div class="cc-meta"><span class="cc-tag">${esc(d.subsystem)}</span><span class="cc-tag">×${d.occurrenceCount||1}</span>${d.runBlocked?'<span class="cc-tag">BLOCK RUN</span>':''}</div><div class="cc-actions"><button data-action="focus" data-id="${esc(d.diagnosticId)}">Focus</button><button data-action="correct" data-id="${esc(d.diagnosticId)}">Chân đúng</button><button data-action="why" data-id="${esc(d.diagnosticId)}">Why?</button><button data-action="fix" data-id="${esc(d.diagnosticId)}">Cách sửa</button><button data-action="copy" data-id="${esc(d.diagnosticId)}">Copy</button></div></article>`;}
  function renderEvents(){const body=$('#eventsBody'); if(!body)return;body.innerHTML=(app.project?.events||[]).slice(0,120).map(e=>`<div class="event-row"><b>${esc(e.errorCode||e.subsystem)} — ${esc(e.message)}</b><small>${new Date(e.timestamp).toLocaleString('vi-VN')} · ${esc(e.subsystem)} · ${esc(e.severity)}</small></div>`).join('')||'<div class="empty-console"><div><strong>Chưa có event</strong><span>Thao tác wiring, compile, runtime và recovery sẽ xuất hiện ở đây.</span></div></div>';}

  function openDiagnostic(d,whyMode=false){app.activeDiagnostic=d;$('#modalTitle').textContent=d.errorCode||'DIAGNOSTIC';$('#modalBody').innerHTML=diagnosticDetail(d,whyMode);$('#diagnosticModal').classList.add('open');$('#diagnosticModal').setAttribute('aria-hidden','false');focusDiagnostic(d);}
  function closeDiagnostic(){$('#diagnosticModal').classList.remove('open');$('#diagnosticModal').setAttribute('aria-hidden','true');}
  function diagnosticDetail(d,why=false){return `<div class="diag-detail"><div class="diag-row"><b>Student</b><span>${esc(d.studentMessage)}</span></div><div class="diag-row"><b>Subsystem</b><span>${esc(d.subsystem)}</span></div><div class="diag-row"><b>Source / target</b><span>${esc(d.portIds?.join(' → ')||'—')}</span></div><div class="diag-row"><b>Actual</b><span>${esc(d.actual||'—')}</span></div><div class="diag-row"><b>Expected</b><span>${esc(d.expected||'—')}</span></div><div class="diag-box"><strong>${why?'Why?':'Cause'}</strong><p>${esc(d.cause||d.technicalMessage||'Không có mô tả.')}</p></div><div class="diag-box"><strong>Cách sửa</strong><p>${esc(d.suggestedFix||'Kiểm tra pinout và compatibility matrix rồi nối lại.')}</p></div><div class="diag-row"><b>State</b><span>${d.resolved?'Resolved':'Active'}${d.runBlocked?' · Run bị chặn trong Strict mode':''}</span></div></div>`;}
  function focusDiagnostic(d){const f=d.focusTarget||{}; app.focusTarget={componentId:f.componentId,portId:f.portId}; if(d.wireIds?.[0])app.activeWireId=d.wireIds[0]; const c=app.project.components.find(x=>x.id===f.componentId);if(c&&c.id!=='board-1'){const el=document.getElementById(c.id==='led-1'?'ledNode':c.id==='button-1'?'buttonNode':`node-${c.id}`);el?.classList.add('node-focused');setTimeout(()=>el?.classList.remove('node-focused'),1300);}renderNodeClasses();renderWireLayer();}
  function showCorrect(d){
    app.correctTarget=null;
    if(d.errorCode==='GPIO001'){const target=d.portIds?.find(x=>String(x).startsWith('GPIO'))||d.portIds?.[1];app.correctTarget={componentId:d.componentIds?.find(x=>x!=='board-1')||'board-1',portId:target};}
    else if(d.portIds?.[1])app.correctTarget={componentId:d.componentIds?.[1]||'board-1',portId:d.portIds?.[1]};
    renderNodeClasses(); closeDiagnostic(); toast('Đã đánh dấu chân đích để bạn kiểm tra.', 'success');
  }
  function copyDiagnostic(d){const text=`${d.errorCode}\n${d.studentMessage}\nActual: ${d.actual||'-'}\nExpected: ${d.expected||'-'}\nCause: ${d.cause||'-'}\nFix: ${d.suggestedFix||'-'}`;navigator.clipboard?.writeText(text).then(()=>toast('Đã copy diagnostic.')).catch(()=>toast('Clipboard không khả dụng.','warning'));}

  function compile(){
    app.project.systemState='COMPILING'; updateState(); renderAll();
    const code=$('#codeEditor').value;app.project.code=code;app.project.artifactStale=true;
    const errs=[];const brace=(code.match(/\{/g)||[]).length-(code.match(/\}/g)||[]).length;if(brace!==0)errs.push({code:'COMP002',msg:'Thiếu hoặc dư dấu ngoặc { } trong firmware.',line:null});
    const stringMismatch=(code.match(/"/g)||[]).length%2;if(stringMismatch)errs.push({code:'COMP002',msg:'Chuỗi ký tự có số lượng dấu ngoặc kép không cân bằng.',line:null});
    const target=app.board?.name||'';if(/ESP32|WiFi\.h|ESPAsyncWebServer/i.test(code)&&/Arduino Uno/i.test(target))errs.push({code:'FW002',msg:'Firmware hiện chứa dấu hiệu target ESP32 nhưng board đang là Arduino Uno R3.'});
    if(/Arduino\.h|AVR/i.test(code)&&/ESP32/i.test(target))errs.push({code:'FW002',msg:'Firmware hiện chứa target AVR nhưng board đang là ESP32-DevKitC V4.'});
    const pinRefs=[];for(const m of code.matchAll(/(?:pinMode|digitalWrite|digitalRead|analogRead|analogWrite)\s*\(\s*([A-Z]?\d+)\s*,?/g))pinRefs.push(m[1]);
    for(const ref of [...new Set(pinRefs)]){const id=/^A\d+$/.test(ref)?ref:'D'+ref;const pin=app.board?.pins.find(p=>p.id===id);if(!pin){errs.push({code:'FW001',msg:`Firmware đang tham chiếu ${ref} nhưng board profile không có pin này.`});continue;}const pm=new RegExp(`pinMode\\s*\\(\\s*${ref}\\s*,\\s*OUTPUT\\s*\\)`,'i').test(code);if(pm&&pin.inputOnly)errs.push({code:'GPIO002',msg:`${id} là input-only nhưng firmware đặt OUTPUT.`});const other=app.project.wires.filter(w=>portKey(w.source.componentId,w.source.portId)===`board-1:${id}`||portKey(w.target.componentId,w.target.portId)===`board-1:${id}`);if(!other.length)errs.push({code:'FW001',msg:`Firmware dùng ${ref} nhưng pin chưa có kết nối trong schematic.`});}
    if(errs.length){errs.forEach(e=>log('error',e.code,'Compiler',e.msg,{technicalMessage:e.msg,cause:'Firmware resource map / parser check.',suggestedFix:'Sửa code hoặc nối đúng schematic; hệ thống không tự sửa code.',runBlocked:true}));app.project.systemState='FAULT';updateState();renderAll();return false;}
    const warnings=app.project.components.filter(c=>c.kind!=='board').filter(c=>c.kind!=='visual').length;
    if(app.board?.verificationStatus!=='verified')log('warning','ASSET001','Asset','Board profile chưa được xác minh.');
    app.project.artifact={artifactId:uid('artifact'),targetBoardId:app.board.boardId,toolchain:'browser-compiler-lite',createdAt:now(),codeHash:btoa(unescape(encodeURIComponent(code))).slice(0,24),diagnostics:[],stale:false};app.project.artifactStale=false;app.project.systemState='STOPPED';pushEvent('Compiler','COMP_OK','Compile thành công bằng browser compiler-lite','success',{targetBoardId:app.board.boardId});persist();renderAll();toast('Compile thành công — artifact hợp lệ.','success');return true;
  }

  function strictBlocking(){return app.project.policy==='strict'&&app.project.diagnostics.some(d=>!d.resolved&&d.runBlocked);}
  function run(){
    if(!app.project.artifact||app.project.artifactStale){if(!compile())return;}
    if(strictBlocking()){const d=app.project.diagnostics.find(x=>!x.resolved&&x.runBlocked);log('error','RUN_BLOCKED','Runtime',`Run bị chặn vì ${d?.errorCode||'blocking diagnostic'}.`,{cause:'Strict mode policy.',suggestedFix:d?.suggestedFix||'Giải quyết blocking diagnostics trước khi Run.',runBlocked:true});openDiagnostic(d||app.project.diagnostics[0]);return;}
    app.project.systemState='RUNNING';pushEvent('Runtime','RUN_START','Simulation bắt đầu','success',{targetBoardId:app.board.boardId});serialWrite('--- simulation started ---');renderAll(); toast('Simulation đang chạy.','success');simulateFirmware();
  }
  function simulateFirmware(){
    clearRuntimeTimers(); app.runtimeTimers=[]; const code=app.project.code||'';const match=code.match(/Serial\.begin\s*\(\s*(\d+)\s*\)/i);$('#baudValue').textContent=match?match[1]:'9600';
    const lines=[...code.matchAll(/Serial\.println\s*\(\s*(['"])(.*?)\1\s*\)/g)].map(m=>m[2]);let i=0;const tick=()=>{if(app.project.systemState!=='RUNNING')return;if(lines.length){serialWrite(lines[i%lines.length]);i++;}const ledOn=/digitalWrite\s*\(\s*(?:13|LED_BUILTIN)\s*,\s*HIGH/i.test(code)&&/led-1:anode/.test(lessonWireText());const led=document.getElementById('ledGlyph');if(led)led.classList.toggle('on',ledOn&&i%2===1);app.runtimeTimers.push(setTimeout(tick,Math.max(250,Number((code.match(/delay\s*\(\s*(\d+)\s*\)/i)||[])[1])||500)));};tick();}
  function clearRuntimeTimers(){(app.runtimeTimers||[]).forEach(clearTimeout);app.runtimeTimers=[];}
  function stopRun(){clearRuntimeTimers();app.project.systemState='STOPPED';pushEvent('Runtime','RUN_STOP','Simulation đã dừng','info');serialWrite('--- simulation stopped ---');renderAll();}
  function reset(){clearRuntimeTimers();const boardId=app.project.targetBoardId;saveSnapshot(true);app.project=blankProject(boardId);app.activeDiagnostic=null;app.wireDraft=null;app.focusTarget=null;app.correctTarget=null;app.activeWireId=null;$('#codeEditor').value=DEFAULT_CODE;persist();renderAll();toast('Project đã reset về safe state.','success');}
  function lessonWireText(){return app.project.wires.map(w=>`${w.source.componentId}:${w.source.portId}->${w.target.componentId}:${w.target.portId}`).join('|');}

  function exportProject(){const blob=new Blob([JSON.stringify(app.project,null,2)],{type:'application/json'});downloadBlob(blob,(app.project.name||'arduino-lab')+'.json');}
  function exportReport(){const report={generatedAt:new Date().toISOString(),projectId:app.project.projectId,targetBoardId:app.project.targetBoardId,policy:app.project.policy,systemState:app.project.systemState,wires:app.project.wires,netlist:app.project.netlist,diagnostics:app.project.diagnostics,events:app.project.events||[],artifact:app.project.artifact};downloadBlob(new Blob([JSON.stringify(report,null,2)],{type:'application/json'}),'arduino-lab-diagnostic-report.json');toast('Đã export diagnostic report.','success');}
  function downloadBlob(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
  function importProject(){let input=document.getElementById('labImportInput');if(!input){input=document.createElement('input');input.type='file';input.accept='.json,application/json';input.id='labImportInput';input.hidden=true;document.body.appendChild(input);input.addEventListener('change',()=>{const f=input.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{saveSnapshot(true);app.project=normalizeProject(JSON.parse(r.result));selectBoard(app.project.targetBoardId,false);$('#codeEditor').value=app.project.code||DEFAULT_CODE;persist();renderAll();toast('Đã nạp project.','success');}catch(e){toast('Project JSON không hợp lệ.','warning');}};r.readAsText(f);});}input.value='';input.click();}

  function handlePortDown(e){e.preventDefault();e.stopPropagation();const btn=e.currentTarget;app.wireDraft={source:{componentId:btn.dataset.component,portId:btn.dataset.port},current:currentPoint(e)};renderWireLayer();}
  function currentPoint(e){const r=$('#circuitCanvas').getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};}
  function handlePointerMove(e){if(app.wireDraft){app.wireDraft.current=currentPoint(e);const under=document.elementFromPoint(e.clientX,e.clientY)?.closest?.('.port');$$('.port').forEach(p=>p.classList.remove('invalid-target','correct-target'));if(under){const v=validateConnection(app.wireDraft.source,{componentId:under.dataset.component,portId:under.dataset.port});under.classList.add(v.state==='VALID'?'correct-target':'invalid-target');}renderWireLayer();}}
  function finishWire(e){if(!app.wireDraft)return;const source=app.wireDraft.source;const under=document.elementFromPoint(e.clientX,e.clientY)?.closest?.('.port');app.wireDraft=null;$$('.port').forEach(p=>p.classList.remove('invalid-target','correct-target'));if(under)addWire(source,{componentId:under.dataset.component,portId:under.dataset.port});else log('warning','WIRE004','Wiring','Endpoint missing — thả dây không trúng một port.',{cause:'Pointer released outside a recognized port.',suggestedFix:'Kéo lại đầu dây và thả đúng tâm port.',runBlocked:false});renderWireLayer();}

  function enableNodeDrag(){
    $$('#ledNode .component-head,#buttonNode .component-head,.component-node[id^="node-"] .component-head').forEach(h=>{if(h.dataset.dragBound)return;h.dataset.dragBound='1';h.addEventListener('pointerdown',e=>{if(e.target.closest('.node-x'))return;const el=h.closest('.component-node');const id=el.id==='ledNode'?'led-1':el.id==='buttonNode'?'button-1':el.id.replace('node-','');const c=app.project.components.find(x=>x.id===id);if(!c||c.locked)return;const start={x:e.clientX,y:e.clientY,cx:c.x,cy:c.y};const move=ev=>{c.x=Math.max(4,start.cx+(ev.clientX-start.x)/app.zoom);c.y=Math.max(4,start.cy+(ev.clientY-start.y)/app.zoom);positionComponent(c.id);renderWireLayer()};const up=()=>{window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);saveSnapshot(true);persist();};window.addEventListener('pointermove',move);window.addEventListener('pointerup',up,{once:true});});});
  }
  function enablePortEvents(){ $$('.port').forEach(p=>{if(!p.dataset.component||!p.dataset.port)return;if(p.dataset.wiredBound)return;p.dataset.wiredBound='1';p.addEventListener('pointerdown',handlePortDown);p.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();handlePortDown(e);}});});}

  function library(){
    const list=$('#moduleList');if(!list)return;let ms=app.modules.filter(m=>(app.moduleFilter==='All'||m.category===app.moduleFilter)&&(!app.searchTerm||(m.accessibilityLabels?.name||m.variant||'').toLowerCase().includes(app.searchTerm)||m.category.toLowerCase().includes(app.searchTerm)||m.moduleId.toLowerCase().includes(app.searchTerm)));$('#moduleCount').textContent=app.modules.length;
    list.innerHTML=ms.map(m=>`<div class="module-card" draggable="true" data-module-id="${esc(m.moduleId)}"><span class="m-icon"><i class="${m.category==='Sensor'?'cil-speedometer':m.category==='Board'?'cil-memory':m.category==='Actuator'?'cil-bolt':'cil-puzzle'}"></i></span><div><b>${esc(m.accessibilityLabels?.name||m.variant||m.moduleId)}</b><small>${esc(m.category)} · ${esc(m.moduleId)}</small></div><span class="m-badge ${esc(m.verificationStatus)}">${esc(m.verificationStatus)}</span></div>`).join('')||'<div class="empty-console" style="min-height:180px"><div><strong>Không tìm thấy module</strong><span>Đổi từ khóa hoặc category.</span></div></div>';
    $$('.module-card',list).forEach(card=>{card.addEventListener('dragstart',e=>{card.classList.add('dragging');e.dataTransfer.setData('text/module-id',card.dataset.moduleId);e.dataTransfer.effectAllowed='copy';});card.addEventListener('dragend',()=>card.classList.remove('dragging'));card.addEventListener('dblclick',()=>addModuleToCanvas(card.dataset.moduleId));});
  }
  function addModuleToCanvas(moduleId){const m=app.modules.find(x=>x.moduleId===moduleId);if(!m)return;const c={id:uid('module'),kind:'visual',name:(m.accessibilityLabels?.name||m.variant||m.moduleId),moduleId:m.moduleId,category:m.category,verificationStatus:m.verificationStatus,supportLevel:m.supportLevel,x:Math.min(760,120+app.project.components.length*18),y:520};app.project.components.push(c);saveSnapshot(true);renderAll();toast(`${m.accessibilityLabels?.name||m.variant||m.moduleId} đã thêm vào canvas — ${m.verificationStatus}.`,'warning');}

  function selectBoard(id,resetProject=true){const b=app.boards.find(x=>x.boardId===id)||app.boards[0];if(!b)return;if(resetProject&&app.project&&app.project.targetBoardId!==b.boardId){saveSnapshot(true);app.project=blankProject(b.boardId);}
    app.board=b;app.project.targetBoardId=b.boardId;$('#boardSelect').value=b.boardId;$('#boardVerification').textContent=b.verificationStatus.toUpperCase();updateBoardBadge();app.project.artifactStale=true;persist();renderAll();pushEvent('Board Registry','BOARD_SELECTED',`Target board: ${b.name}`,'info',{targetBoardId:b.boardId});
  }

  function resetCode(){if(confirm('Khôi phục code mẫu main.ino?')){$('#codeEditor').value=DEFAULT_CODE;app.project.code=DEFAULT_CODE;app.project.artifactStale=true;persist();renderAll();toast('Đã khôi phục code mẫu.');}}
  function toast(msg,type='info'){const t=$('#labToast');t.textContent=msg;t.className='lab-toast show';setTimeout(()=>t.className='lab-toast',1900);}

  function undo(){if(!app.history.length)return toast('Không có thao tác để Undo.','warning');app.future.push(structuredClone(app.project));app.project=app.history.pop();selectBoard(app.project.targetBoardId,false);$('#codeEditor').value=app.project.code||DEFAULT_CODE;persist();renderAll();}
  function redo(){if(!app.future.length)return toast('Không có thao tác để Redo.','warning');app.history.push(structuredClone(app.project));app.project=app.future.pop();selectBoard(app.project.targetBoardId,false);$('#codeEditor').value=app.project.code||DEFAULT_CODE;persist();renderAll();}

  function bind(){
    $('#compileBtn').addEventListener('click',compile);$('#consoleToggle').addEventListener('click',()=>document.body.classList.toggle('console-collapsed'));$('#consoleOpenMobile').addEventListener('click',()=>document.body.classList.add('mobile-console-open'));document.body.addEventListener('click',e=>{if(document.body.classList.contains('mobile-console-open')&&!e.target.closest('.lab-console')&&!e.target.closest('#consoleOpenMobile'))document.body.classList.remove('mobile-console-open');});$('#runBtn').addEventListener('click',()=>app.project.systemState==='RUNNING'?stopRun():run());$('#resetBtn').addEventListener('click',reset);$('#newProject').addEventListener('click',()=>{saveSnapshot(true);app.project=blankProject(app.board.boardId);$('#codeEditor').value=DEFAULT_CODE;persist();renderAll();toast('Project mới đã tạo.','success');});
    $('#labSave').addEventListener('click',()=>{app.project.name=prompt('Tên project:',app.project.name)||app.project.name;persist();exportProject();toast('Project đã lưu và export.','success');});$('#labLoad').addEventListener('click',importProject);$('#labTheme').addEventListener('click',()=>document.body.classList.toggle('gh-dark'));$('#codeReset').addEventListener('click',resetCode);
    $('#boardSelect').addEventListener('change',e=>selectBoard(e.target.value));$('#policySelect').addEventListener('change',e=>{app.project.policy=e.target.value;persist();updateState();renderAll();});
    $('#zoomIn').addEventListener('click',()=>setZoom(app.zoom+.1));$('#zoomOut').addEventListener('click',()=>setZoom(app.zoom-.1));$('#centerCanvas').addEventListener('click',()=>{const c=app.project.components.find(x=>x.id==='board-1');if(c){c.x=40;c.y=65;positionComponent('board-1');renderWireLayer();}});
    $('#moduleSearch').addEventListener('input',e=>{app.searchTerm=e.target.value.toLowerCase();library();});$('#consoleSearch').addEventListener('input',e=>{app.consoleSearch=e.target.value;renderConsole();});$('#consoleFilter').addEventListener('change',e=>{app.consoleFilter=e.target.value;renderConsole();});$('#pauseLogs').addEventListener('click',()=>{app.logsPaused=!app.logsPaused;$('#pauseLogs').textContent=app.logsPaused?'▶':'Ⅱ';if(!app.logsPaused)renderConsole();});$('#clearLogs').addEventListener('click',()=>{$('#consoleBody').innerHTML='<div class="empty-console"><div><strong>View đã được làm sạch</strong><span>Diagnostic history vẫn được giữ.</span></div></div>';});$('#exportReport').addEventListener('click',exportReport);
    $('#serialClear').addEventListener('click',()=>$('#serialOutput').textContent='');$('#serialPause').addEventListener('click',()=>{app.serialPaused=!app.serialPaused;$('#serialPause').textContent=app.serialPaused?'Resume':'Auto-scroll';});
    $$('.console-tab').forEach(tab=>tab.addEventListener('click',()=>{app.consoleTab=tab.dataset.tab;$('.console-tab.active')?.classList.remove('active');tab.classList.add('active');$('.console-body')?.classList.toggle('hidden',app.consoleTab!=='diagnostics');$('.serial-body')?.classList.toggle('hidden',app.consoleTab!=='serial');$('.events-body')?.classList.toggle('hidden',app.consoleTab!=='events');}));
    $('#consoleBody').addEventListener('click',e=>{const btn=e.target.closest('button[data-action]');const card=e.target.closest('[data-diag]');if(!btn||!card)return;const d=app.project.diagnostics.find(x=>x.diagnosticId===btn.dataset.id);if(!d)return;app.activeDiagnostic=d;if(btn.dataset.action==='focus')focusDiagnostic(d);else if(btn.dataset.action==='correct')showCorrect(d);else if(btn.dataset.action==='why')openDiagnostic(d,true);else if(btn.dataset.action==='copy')copyDiagnostic(d);else if(btn.dataset.action==='fix')openDiagnostic(d);});
    $('#modalFocus').addEventListener('click',()=>app.activeDiagnostic&&focusDiagnostic(app.activeDiagnostic));$('#modalCorrect').addEventListener('click',()=>app.activeDiagnostic&&showCorrect(app.activeDiagnostic));$('#modalWhy').addEventListener('click',()=>app.activeDiagnostic&&openDiagnostic(app.activeDiagnostic,true));$('#modalUndo').addEventListener('click',()=>{const id=app.activeDiagnostic?.wireIds?.[0];if(id){app.project.wires=app.project.wires.filter(w=>w.wireId!==id);resolveDiagnostics(d=>d.wireIds?.includes(id),uid('recovery'));persist();renderAll();toast('Đã Undo dây lỗi.');}closeDiagnostic();});$$('[data-close-modal]').forEach(x=>x.addEventListener('click',closeDiagnostic));
    $('#circuitCanvas').addEventListener('dragover',e=>{e.preventDefault();$('#circuitCanvas').classList.add('lab-drop-highlight');});$('#circuitCanvas').addEventListener('dragleave',()=>$('#circuitCanvas').classList.remove('lab-drop-highlight'));$('#circuitCanvas').addEventListener('drop',e=>{e.preventDefault();$('#circuitCanvas').classList.remove('lab-drop-highlight');addModuleToCanvas(e.dataTransfer.getData('text/module-id'));});
    $('#wireLayer').addEventListener('click',e=>{const p=e.target.closest('.wire-path');if(p){app.activeWireId=p.dataset.wireId;renderWireLayer();}});
    document.addEventListener('click',e=>{const x=e.target.closest('[data-remove]');if(!x)return;const id=x.dataset.remove;if(id==='led')removeComponent('led-1');else if(id==='button')removeComponent('button-1');else removeComponent(id);});
    window.addEventListener('pointermove',handlePointerMove);window.addEventListener('pointerup',finishWire);window.addEventListener('resize',renderWireLayer);window.addEventListener('keydown',e=>{if(e.key==='Escape'&&app.wireDraft){app.wireDraft=null;renderWireLayer();toast('Đã hủy preview.');}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();undo();}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'){e.preventDefault();redo();}if(e.key==='Delete'&&app.activeWireId){const id=app.activeWireId;app.project.wires=app.project.wires.filter(w=>w.wireId!==id);resolveDiagnostics(d=>d.wireIds?.includes(id),uid('recovery'));app.activeWireId=null;persist();renderAll();}});
    $('#codeEditor').addEventListener('input',()=>{app.project.code=$('#codeEditor').value;app.project.artifactStale=true;app.project.systemState='EDITING';updateArtifact();});
  }
  function removeComponent(id){if(id==='board-1')return;saveSnapshot(true);const c=app.project.components.find(x=>x.id===id);if(!c)return;app.project.components=app.project.components.filter(x=>x.id!==id);app.project.wires=app.project.wires.filter(w=>w.source.componentId!==id&&w.target.componentId!==id);persist();renderAll();toast(`${c.name||c.componentType||'Component'} đã được xóa.`);}
  function setZoom(z){app.zoom=Math.max(.7,Math.min(1.25,z));$('#zoomValue').textContent=Math.round(app.zoom*100)+'%';app.project.ui.zoom=app.zoom;syncPositions();renderWireLayer();}
  function serialWrite(s){if(app.serialPaused)return;const out=$('#serialOutput');out.textContent+=(out.textContent?'\n':'')+`[${new Date().toLocaleTimeString('vi-VN')}] ${s}`;if(!app.serialPaused)out.scrollTop=out.scrollHeight;}

  async function boot(){
    try{
      const [br,mr]=await Promise.all([fetch(boardProfilesUrl).then(r=>r.json()),fetch(modulesUrl).then(r=>r.json())]);
      app.boards=br.profiles||[];app.modules=mr||[];const saved=loadSaved();app.project=normalizeProject(saved||blankProject(app.boards[0]?.boardId));app.board=app.boards.find(b=>b.boardId===app.project.targetBoardId)||app.boards[0];app.zoom=Number(app.project.ui?.zoom||1);$('#codeEditor').value=app.project.code||DEFAULT_CODE;
      $('#boardSelect').innerHTML=app.boards.map(b=>`<option value="${esc(b.boardId)}">${esc(b.name)} · ${b.verificationStatus}</option>`).join('');$('#boardSelect').value=app.board.boardId;$('#policySelect').value=app.project.policy||'strict';updateBoardBadge();
      const cats=['All',...new Set(app.modules.map(m=>m.category))];$('#moduleFilters').innerHTML=cats.map(c=>`<button class="lab-filter ${c==='All'?'active':''}" data-filter="${esc(c)}">${esc(c)}</button>`).join('');$$('.lab-filter').forEach(f=>f.addEventListener('click',()=>{$$('.lab-filter').forEach(x=>x.classList.remove('active'));f.classList.add('active');app.moduleFilter=f.dataset.filter;library();}));
      library();bind();renderAll();enableNodeDrag();enablePortEvents();setZoom(app.zoom);pushEvent('System','READY','Lab workspace sẵn sàng','success');
      if(app.project.systemState==='RUNNING')app.project.systemState='STOPPED';
    }catch(e){console.error(e);document.querySelector('.lab-shell')?.insertAdjacentHTML('afterbegin',`<div class="lab-toast show">Không tải được lab data: ${esc(e.message)}</div>`);}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  window.GiaHuyLab={getProject:()=>app.project,exportProject,loadSaved,validateConnection};
})();
