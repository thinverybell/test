(function(){
  'use strict';
  const REG = window.GH_ARDUINO_MODULE_REGISTRY_200 || {};
  const MODULES = REG.modules || {};
  const NAMES = REG.names || Object.keys(MODULES);
  const $ = (s, r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const CATS=[['all','Tất cả'],['arduino-board','Mạch Arduino'],['board','Board'],['sensor','Cảm biến'],['display','Hiển thị'],['motor','Động cơ'],['led','LED'],['io','Module / I/O'],['other','Khác']];
  const WIRE_TYPES=[
    {id:'single',name:'Dây nối đơn',sub:'1 lõi • 2 đầu cắm',count:1,asset:'assets/arduino-wires/wire-single.svg'},
    {id:'double',name:'Dây nối kép',sub:'2 lõi • 4 đầu cắm',count:2,asset:'assets/arduino-wires/wire-double.svg'},
    {id:'triple',name:'Dây nối ba',sub:'3 lõi • 6 đầu cắm',count:3,asset:'assets/arduino-wires/wire-triple.svg'},
    {id:'quad',name:'Dây nối bốn',sub:'4 lõi • 8 đầu cắm',count:4,asset:'assets/arduino-wires/wire-quad.svg'}
  ];
  const LEGACY_WIRE_TYPE={dupont:'single',female:'single',usb:'single',power:'single'};
  const COLORS=[['black','#111827'],['red','#ef4444'],['yellow','#fbbf24'],['green','#16a34a'],['blue','#2563eb'],['purple','#9333ea'],['orange','#f97316'],['white','#f8fafc'],['gray','#cbd5e1']];
  const state={zoom:1,tool:'select',activeCat:'all',query:'',wireType:'single',wireColor:'#111827',connector:'thẳng',length:'10 cm',selected:null,source:null,target:null,boardName:'Arduino Uno R3',components:new Map(),wires:[],history:[],future:[],drag:null,pan:null,running:false,logs:[],code:'void setup() {\n  pinMode(13, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(13, HIGH);\n  delay(500);\n  digitalWrite(13, LOW);\n  delay(500);\n}\n'};
  const dom={stage:$('#canvasStage'), wrap:$('#canvasWrap'), grid:$('#moduleGrid'), search:$('#moduleSearch'), chips:$('#categoryChips'), wireSvg:$('#wireSvg'), source:$('#sourceSel'),target:$('#targetSel'),portList:$('#portList'),console:$('#consoleBody'),toast:$('#toast'),empty:$('#canvasEmpty'),zoom:$('#zoomValue'),wireLabels:$('#wireLabelLayer')};
  const now=()=>new Date().toLocaleTimeString('vi-VN',{hour12:false});
  function log(level,msg,detail=''){const item={level,msg,detail,time:now()};state.logs.push(item);renderLogs();}
  function renderLogs(){const f=$('.console-filter.active')?.dataset.level||'all';dom.console.innerHTML=state.logs.filter(x=>f==='all'||x.level===f).map(x=>`<div class="log ${x.level}"><span class="time">[${x.time}]</span>${esc(x.msg)}${x.detail?` <span style="opacity:.55">${esc(x.detail)}</span>`:''}</div>`).join('');dom.console.scrollTop=dom.console.scrollHeight;}
  function toast(msg){dom.toast.textContent=msg;dom.toast.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>dom.toast.classList.remove('show'),1800)}
  function catFor(m){const k=(m.kind||'').toLowerCase(); const n=(m.title||'').toLowerCase(); if(k.includes('board') && (/^arduino /.test(n)||/^arduino$/.test(n)))return'arduino-board'; if(k.includes('board'))return'board';if(k.includes('display'))return'display';if(k.includes('motor'))return'motor';if(k.includes('io'))return'io';if(k.includes('sensor'))return'sensor';if(/led|buzzer/.test(m.title||''))return'led';return'other'}
  function assetFor(m){return m?.assetRef || `assets/arduino-topdown-2d-png/mod-${String(m.order||1).padStart(3,'0')}.png`}
  function normalizeWireType(id){if(LEGACY_WIRE_TYPE[id])return LEGACY_WIRE_TYPE[id];return WIRE_TYPES.some(w=>w.id===id)?id:'single'}
  function wireSpec(id){return WIRE_TYPES.find(w=>w.id===normalizeWireType(id))||WIRE_TYPES[0]}
  function realImgAttrs(name){return `data-real-module="${esc(name)}"`}
  function getPorts(name){
    const m=MODULES[name]; if(!m)return[];
    return (m.ports||[]).map((p,i)=>({key:`${name}::${p[0]}::${i}`,name:p[0],role:p[1],meta:p[5]||{},i}));
  }
  function makeBreadboardPins(){const out=[];for(let r=0;r<5;r++)for(let c=0;c<30;c++)out.push({name:`${String.fromCharCode(65+r)}${c+1}`,role:'passive',meta:{},i:out.length,bb:true,r,c});return out}
  function componentPins(c){return c.name.toLowerCase().includes('breadboard') ? makeBreadboardPins().slice(0,60) : getPorts(c.name)}
  function pinPosition(c,p,index,total){
    const rect={w:230,h:c.name.toLowerCase().includes('breadboard')?310:270};
    if(p.bb){const x=34 + p.c*5.35, y=70+p.r*25;return{x,y,side:'inside'}}
    const left= index < Math.ceil(total/2); const count=left?Math.ceil(total/2):total-Math.ceil(total/2); const j=left?index:index-Math.ceil(total/2); const y=22+j*(145/Math.max(1,count-1)); return{x:left?3:227,y,side:left?'left':'right'};
  }
  // Performance layer: virtual catalog + tiny thumbnails.
  // Full-size module images stay in the workbench and are requested only when a module is actually added.
  const libraryState={items:[],rowHeight:238,cols:2,raf:0,resizeObs:null};
  function thumbFor(m){const order=String(m?.order||1).padStart(3,'0');return `assets/arduino-topdown-2d-thumb/mod-${order}.webp`;}
  function getFilteredLibraryItems(){
    const q=state.query.toLowerCase().trim();
    return NAMES.filter(n=>{
      const m=MODULES[n]||{};
      const okCat=state.activeCat==='all'||catFor(m)===state.activeCat;
      const hay=`${n} ${m.sub||''} ${m.kind||''} ${m.title||''}`.toLowerCase();
      return okCat&&(!q||hay.includes(q));
    }).sort((a,b)=>{
      if(state.activeCat==='all'){const ca=catFor(MODULES[a]),cb=catFor(MODULES[b]);if(ca!==cb)return ca==='arduino-board'?-1:cb==='arduino-board'?1:0;}
      return a.localeCompare(b,'vi');
    });
  }
  function buildModuleCard(n,index){
    const m=MODULES[n]||{};
    const card=document.createElement('article');card.className='module-card';card.draggable=true;card.dataset.module=n;
    const row=Math.floor(index/libraryState.cols),col=index%libraryState.cols,gutter=10;
    card.style.position='absolute';card.style.top=`${row*libraryState.rowHeight+4}px`;card.style.left=`calc(${col*50}% + ${col?5:0}px)`;card.style.width=`calc(50% - ${gutter}px)`;
    card.innerHTML=`<div class="module-badge">${m.verificationStatus==='verified'?'Đã kiểm tra':'Lab'}</div><div class="module-thumb"><img loading="lazy" decoding="async" fetchpriority="low" src="${esc(thumbFor(m))}" alt="${esc(n)}"></div><div class="module-name">${esc(n)}</div><div class="module-kind">${esc(m.sub||m.kind||'Module')}</div>`;
    card.addEventListener('dragstart',e=>{e.dataTransfer.effectAllowed='copy';e.dataTransfer.setData('text/plain',n);});
    card.addEventListener('dblclick',()=>addComponent(n,280+(state.components.size%3)*270,150+(state.components.size%3)*80));
    return card;
  }
  function renderLibrary(){
    if(!dom.grid)return;
    libraryState.items=getFilteredLibraryItems();
    libraryState.cols=(dom.grid.clientWidth||300)>=430?2:1;
    libraryState.rowHeight=libraryState.cols===2?238:226;
    $('#moduleCount').textContent=libraryState.items.length;
    const rows=Math.ceil(libraryState.items.length/libraryState.cols);
    dom.grid.style.position='relative';dom.grid.style.display='block';dom.grid.style.height=`${Math.max(16,rows*libraryState.rowHeight+14)}px`;dom.grid.innerHTML='';dom.grid.scrollTop=0;
    scheduleLibraryViewport();
  }
  function scheduleLibraryViewport(){cancelAnimationFrame(libraryState.raf);libraryState.raf=requestAnimationFrame(renderLibraryViewport);}
  function renderLibraryViewport(){
    if(!dom.grid)return;
    const viewport=dom.grid.clientHeight||520,scrollTop=dom.grid.scrollTop,bufferRows=3;
    const firstRow=Math.max(0,Math.floor(scrollTop/libraryState.rowHeight)-bufferRows);
    const lastRow=Math.min(Math.ceil(libraryState.items.length/libraryState.cols),Math.ceil((scrollTop+viewport)/libraryState.rowHeight)+bufferRows);
    const first=firstRow*libraryState.cols,last=Math.min(libraryState.items.length,lastRow*libraryState.cols);
    const frag=document.createDocumentFragment();for(let i=first;i<last;i++)frag.appendChild(buildModuleCard(libraryState.items[i],i));
    dom.grid.innerHTML='';dom.grid.appendChild(frag);
  }
  function renderChips(){dom.chips.innerHTML=CATS.map(([id,label])=>`<button class="chip ${state.activeCat===id?'active':''}" data-cat="${id}">${label}</button>`).join('');$$('.chip',dom.chips).forEach(b=>b.onclick=()=>{state.activeCat=b.dataset.cat;renderChips();renderLibrary()})}
  function componentMarkup(c){const m=MODULES[c.name];const pins=componentPins(c);const total=pins.length; const pinEls=pins.map((p,i)=>{const pos=pinPosition(c,p,i,total);if(p.bb)return `<button class="breadboard-hole" data-pin-key="${esc(`${c.id}::${p.name}`)}" title="${esc(p.name)}"></button>`;return `<span class="pin" data-pin-key="${esc(p.key)}" title="${esc(p.name)}" style="left:${pos.side==='left'?4:214}px;top:${pos.y-6}px"></span><span class="pin-label" data-label-for="${esc(p.key)}" style="${pos.side==='left'?`left:18px;top:${pos.y-6}px`:`right:18px;top:${pos.y-6}px;text-align:right`}">${esc(p.name)}</span>`}).join('');const scale=Math.max(.55,Math.min(1.8,c.scale||1)); return `<article class="component ${c.status==='error'?'fault':''} ${state.selected===c.id?'selected':''}" data-component-id="${c.id}" style="left:${c.x}px;top:${c.y}px;transform:rotate(${c.r||0}deg) scale(${scale})"><div class="component-head"><div class="component-title">${esc(c.name)}</div><span class="component-status ${c.status==='ok'?'ok':c.status==='warn'?'warn':c.status==='error'?'error':''}"></span></div><div class="component-visual ${c.name.toLowerCase().includes('breadboard')?'breadboard-visual':''}"><img class="board-shadow" ${realImgAttrs(c.name)} fetchpriority="high" decoding="async" src="${esc(assetFor(m))}" alt="${esc(c.name)}">${c.name.toLowerCase().includes('breadboard')?'<div class="breadboard-holes">'+Array.from({length:60},(_,i)=>`<button class="breadboard-hole" data-pin-key="${esc(`${c.id}::${String.fromCharCode(65+Math.floor(i/30))}${i%30+1}`)}" title="${String.fromCharCode(65+Math.floor(i/30))}${i%30+1}"></button>`).join('')+'</div>':''}${c.name.toLowerCase().includes('breadboard')?'':pinEls}</div><div class="component-footer"><span>${esc(m?.sub||m?.kind||'Module')}</span><span class="status-pill">${c.statusText||'Sẵn sàng'}</span><span class="size-controls" title="Kích thước linh kiện"><button class="size-btn" data-size="down">−</button><b>${Math.round(scale*100)}%</b><button class="size-btn" data-size="up">＋</button><button class="size-btn reset-size" data-size="reset">↺</button></span></div></article>`}
  function renderComponents(){for(const old of $$('.component',dom.stage))old.remove(); for(const c of state.components.values()){const wrap=document.createElement('div');wrap.innerHTML=componentMarkup(c);const el=wrap.firstElementChild;dom.stage.appendChild(el);bindComponent(el,c)} dom.empty.style.display=state.components.size?'none':'block';renderWires();renderPortList();}
  function bindComponent(el,c){
    el.addEventListener('click',e=>{if(e.target.closest('.pin,.breadboard-hole,.size-btn,.component-head'))return;selectComponent(c.id)});
    const head=$('.component-head',el); head.addEventListener('pointerdown',e=>startComponentDrag(e,c,el));
    el.addEventListener('pointerdown',e=>{if(e.target.closest('.pin,.breadboard-hole,.size-btn,.component-head'))return;startComponentDrag(e,c,el)});
    $$('[data-size]',el).forEach(btn=>btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();const action=btn.dataset.size;const before=c.scale||1;checkpoint();if(action==='up')c.scale=Math.min(1.8,before+0.1);else if(action==='down')c.scale=Math.max(0.55,before-0.1);else c.scale=1;selectComponent(c.id);log('info',`Kích thước ${c.name}: ${Math.round(c.scale*100)}%`);renderComponents();}));
    $$('.pin,.breadboard-hole',el).forEach(pin=>{pin.addEventListener('pointerdown',e=>startWireDrag(e,c,pin));pin.style.touchAction='none';});
    el.addEventListener('wheel',e=>{if(!e.ctrlKey)return;e.preventDefault();checkpoint();const before=c.scale||1;c.scale=Math.max(.55,Math.min(1.8,before+(e.deltaY<0?.1:-.1)));selectComponent(c.id);renderComponents();log('info',`Kích thước ${c.name}: ${Math.round(c.scale*100)}%`)},{passive:false});
  }

  function selectComponent(id){state.selected=id;renderComponents();}
  function startComponentDrag(e,c,el){if(state.tool!=='select')return;e.preventDefault();e.stopPropagation();state.selected=c.id;checkpoint();const start=clientToStage(e.clientX,e.clientY);state.drag={id:c.id,dx:start.x-c.x,dy:start.y-c.y,el,lastWire:0};el.classList.add('dragging');const move=ev=>{const p=clientToStage(ev.clientX,ev.clientY);c.x=Math.max(10,p.x-state.drag.dx);c.y=Math.max(10,p.y-state.drag.dy);el.style.left=`${c.x}px`;el.style.top=`${c.y}px`;const t=performance.now();if(t-state.drag.lastWire>16){renderWires();state.drag.lastWire=t;}};const up=()=>{if(state.drag?.el)state.drag.el.classList.remove('dragging');state.drag=null;window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);renderComponents()};window.addEventListener('pointermove',move);window.addEventListener('pointerup',up);}
  function pinSelection(sel){
    const c=state.components.get(sel.component); if(!c)return;
    if(!state.source||state.target){state.source={...sel};state.target=null;log('info',`Đã chọn nguồn: ${c.name} / ${sel.pinKey.split('::').pop()}`)}
    else if(state.source.component===sel.component&&state.source.pinKey===sel.pinKey){return}
    else{state.target={...sel};log('info',`Đã chọn đích: ${c.name} / ${sel.pinKey.split('::').pop()}`);validateAndPreview();}
    updateSelectionUI();
  }
  function findNearestPin(clientX,clientY,exclude){
    const maxDist=34; let best=null; const wrap=dom.wrap.getBoundingClientRect();
    for(const el of $$('.pin,.breadboard-hole',dom.stage)){
      if(el===exclude)continue;
      const cmp=el.closest('.component'); if(!cmp)continue;
      const sel={component:cmp.dataset.componentId,pinKey:el.dataset.pinKey};
      if(exclude?.dataset?.pinKey===sel.pinKey && exclude.closest('.component')?.dataset.componentId===sel.component)continue;
      const r=el.getBoundingClientRect(); const x=r.left+r.width/2, y=r.top+r.height/2;
      const d=Math.hypot(x-clientX,y-clientY);
      if(d<=maxDist&&(!best||d<best.distance))best={el,sel,distance:d};
    }
    return best;
  }
  function clearSnapVisuals(){
    $$('.pin,.breadboard-hole',dom.stage).forEach(el=>el.classList.remove('snap-target','snap-invalid','drag-source'));
    $$('.component.wire-hover',dom.stage).forEach(el=>el.classList.remove('wire-hover'));
  }
  function updateSnapVisual(snap){
    clearSnapVisuals();
    if(!snap){state.hoverTarget=null;return null;}
    const res=validateConnection(state.source,snap.sel);
    snap.el.classList.add(res.level==='error'?'snap-invalid':'snap-target');
    snap.el.closest('.component')?.classList.add('wire-hover');
    state.hoverTarget={...snap,valid:res.level!=='error',result:res};
    return res;
  }
  function startWireDrag(e,c,pinEl){
    if(e.button!==0)return; e.preventDefault(); e.stopPropagation();
    const origin={component:c.id,pinKey:pinEl.dataset.pinKey};
    const originPoint=pinCenter(pinEl);
    const drag={origin,originPoint,pinEl,pointerId:e.pointerId,moved:false};
    state.wireDrag=drag; state.hoverTarget=null;
    try{pinEl.setPointerCapture(e.pointerId)}catch(_){}
    const move=ev=>{
      if(state.wireDrag!==drag)return;
      const moved=Math.hypot(ev.clientX-e.clientX,ev.clientY-e.clientY)>5;
      if(!drag.moved&&moved){
        drag.moved=true; state.source={...origin};state.target=null;
        pinEl.classList.add('drag-source'); dom.wrap.classList.add('wire-active'); updateSelectionUI();
      }
      if(!drag.moved)return;
      const snap=findNearestPin(ev.clientX,ev.clientY,pinEl);
      const res=updateSnapVisual(snap);
      state.target=snap?{...snap.sel}:null;
      const end=snap?pinCenter(snap.el):stagePoint(ev.clientX,ev.clientY);
      drawTempWire(originPoint,end);
      updateSelectionUI();
      if(snap&&res)toast(res.level==='error'?'Nối sai: xem Console':'Thả để nối cổng');
    };
    const up=ev=>{
      window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);dom.wrap.classList.remove('wire-active');
      if(state.wireDrag!==drag)return;
      state.wireDrag=null;
      if(!drag.moved){clearSnapVisuals();drawTempWire(null,null);pinSelection(origin);return;}
      const snap=findNearestPin(ev.clientX,ev.clientY,pinEl) || state.hoverTarget;
      clearSnapVisuals();drawTempWire(null,null);
      if(!snap){state.source=null;state.target=null;updateSelectionUI();log('warn','Chưa bắt được cổng đích','Hãy thả dây gần một chân cắm.');toast('Chưa bắt được chân đích');return;}
      state.source={...origin}; state.target={...snap.sel};
      const res=validateConnection(state.source,state.target);
      if(res.level==='error'){markFault(res);log('error',res.msg,res.detail);toast('Kết nối không hợp lệ — xem Console');state.source=null;state.target=null;updateSelectionUI();return;}
      addWire();
    };
    window.addEventListener('pointermove',move);window.addEventListener('pointerup',up);
  }
  function handlePinClick(e,c,pinEl){e.stopPropagation();const key=pinEl.dataset.pinKey;if(!state.source||state.target){state.source={component:c.id,pinKey:key};state.target=null;log('info',`Đã chọn nguồn: ${c.name} / ${key.split('::').pop()}`)}else if(state.source.component===c.id&&state.source.pinKey===key){return}else{state.target={component:c.id,pinKey:key};log('info',`Đã chọn đích: ${c.name} / ${key.split('::').pop()}`);validateAndPreview()}updateSelectionUI();}
  function validateAndPreview(){const res=validateConnection(state.source,state.target); if(res.level==='error'){markFault(res);log('error',res.msg,res.detail);toast('Kết nối không hợp lệ — xem Console')}else{log(res.level,res.msg,res.detail);toast(res.level==='ok'?'Cổng có thể kết nối':'Cổng cần kiểm tra')}}
  function portObj(sel){if(!sel)return null;const c=state.components.get(sel.component);if(!c)return null;const key=sel.pinKey; if(key.includes('::')&&key.split('::').length===2){const pn=key.split('::')[1]; const p=getPorts(c.name).find(x=>x.name===pn);return p?{...p,c,pin:key}: {name:pn,role:'passive',meta:{},c,pin:key}}; const ps=componentPins(c); const pn=key.split('::').pop(); return {...ps.find(x=>x.name===pn)||ps[0],c,pin:key}}
  function validateConnection(a,b){const pa=portObj(a),pb=portObj(b);if(!pa||!pb)return{level:'error',msg:'Không tìm thấy cổng',detail:'Hãy chọn lại hai chân.'};if(a.component===b.component&&a.pinKey===b.pinKey)return{level:'error',msg:'Không thể nối một chân vào chính nó',detail:'Chọn một cổng đích khác.'};const ra=pa.role,rb=pb.role;const ma=pa.meta||{},mb=pb.meta||{};if((ra==='ground'&&['power','power5'].includes(rb))||(rb==='ground'&&['power','power5'].includes(ra)))return{level:'error',msg:'Không thể nối GND trực tiếp vào nguồn',detail:'Nối GND với GND/đất chung, không nối VCC vào GND.'};if((ra==='power5'&&mb.voltage===3.3)||(rb==='power5'&&ma.voltage===3.3))return{level:'error',msg:'Sai mức điện áp 5V ↔ 3.3V',detail:'Có nguy cơ gây sai logic hoặc hỏng thiết bị.'};if((ra.includes('digital-out')&&rb.includes('digital-out'))||(rb.includes('digital-out')&&ra.includes('digital-out')))return{level:'error',msg:'Xung đột hai chân OUTPUT',detail:'Hai nguồn cùng điều khiển một đường tín hiệu.'};if((ra==='power5'&&mb.inputOnly)||(rb==='power5'&&ma.inputOnly))return{level:'error',msg:'Chân nhận 3.3V không phù hợp nguồn 5V',detail:'Kiểm tra mức logic của chân đích.'};if((ra==='i2c-sda'&&rb==='i2c-scl')||(rb==='i2c-sda'&&ra==='i2c-scl'))return{level:'error',msg:'Đảo SDA / SCL',detail:'SDA phải nối SDA, SCL phải nối SCL.'};if((ra==='analog-out'&&rb==='ground')||(rb==='analog-out'&&ra==='ground'))return{level:'error',msg:'Không nối ngõ ra analog trực tiếp xuống GND',detail:'Dùng tải phù hợp hoặc đầu vào đo.'};return{level:'ok',msg:'Cổng tương thích',detail:`${pa.name} ↔ ${pb.name}`}}
  function markFault(res){const a=portObj(state.source),b=portObj(state.target);if(a?.c){a.c.status='error';a.c.statusText='Lỗi nối'}if(b?.c){b.c.status='error';b.c.statusText='Lỗi nối'}updateSelectionUI();renderComponents()}
  function pinCenter(pinEl){const a=pinEl.getBoundingClientRect(),w=dom.wrap.getBoundingClientRect();return {x:(a.left+a.width/2-w.left)/state.zoom,y:(a.top+a.height/2-w.top)/state.zoom};}
  function stagePoint(clientX,clientY){const w=dom.wrap.getBoundingClientRect();return{x:(clientX-w.left)/state.zoom,y:(clientY-w.top)/state.zoom}}
  function clientToStage(x,y){return stagePoint(x,y)}
  function wirePath(a,b,offset=0){
    const dx=b.x-a.x,dy=b.y-a.y,dist=Math.max(1,Math.hypot(dx,dy));
    const nx=-dy/dist,ny=dx/dist;
    const ox=nx*offset,oy=ny*offset;
    const ax=a.x+ox,ay=a.y+oy,bx=b.x+ox,by=b.y+oy;
    const c=Math.max(55,Math.min(240,dist*.38));
    const ux=dx/dist,uy=dy/dist;
    const c1x=ax+ux*c,c1y=ay+uy*c,c2x=bx-ux*c,c2y=by-uy*c;
    return`M ${ax} ${ay} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${bx} ${by}`;
  }
  function drawPlug(x,y,angle,color,scale=1){
    const ns='http://www.w3.org/2000/svg'; const g=document.createElementNS(ns,'g');
    g.setAttribute('transform',`translate(${x} ${y}) rotate(${angle}) scale(${scale})`);
    g.innerHTML=`<rect x="-1" y="-8" width="19" height="16" rx="4" fill="#101923" stroke="#050a10" stroke-width="1.2"/><rect x="3" y="-4.5" width="10" height="9" rx="2" fill="#2b3744"/><circle cx="14" cy="0" r="2" fill="${esc(color)}" stroke="#f1f5f9" stroke-width=".9"/><path d="M4 -3 H10" stroke="#8a96a3" stroke-width="1" opacity=".65"/>`;
    dom.wireSvg.appendChild(g);
  }
  function drawBundle(a,b,spec,color){
    const count=Math.max(1,spec.count||1);
    const gap=count===1?0:6;
    const dx=b.x-a.x,dy=b.y-a.y,dist=Math.max(1,Math.hypot(dx,dy));
    const nx=-dy/dist,ny=dx/dist;
    const offsets=[]; for(let i=0;i<count;i++) offsets.push((i-(count-1)/2)*gap);
    offsets.forEach((off,i)=>{
      const d=wirePath(a,b,off);
      const shadow=document.createElementNS('http://www.w3.org/2000/svg','path');
      shadow.setAttribute('d',d);shadow.setAttribute('fill','none');shadow.setAttribute('stroke','#06111d');shadow.setAttribute('stroke-opacity','.24');shadow.setAttribute('stroke-width','11');shadow.setAttribute('stroke-linecap','round');shadow.setAttribute('transform','translate(0 4)');dom.wireSvg.appendChild(shadow);
      const main=document.createElementNS('http://www.w3.org/2000/svg','path');
      main.setAttribute('d',d);main.setAttribute('fill','none');main.setAttribute('stroke',color);main.setAttribute('stroke-width',count===1?'8':'6');main.setAttribute('stroke-linecap','round');dom.wireSvg.appendChild(main);
      const hi=document.createElementNS('http://www.w3.org/2000/svg','path');
      hi.setAttribute('d',d);hi.setAttribute('fill','none');hi.setAttribute('stroke','#fff');hi.setAttribute('stroke-opacity','.38');hi.setAttribute('stroke-width','1.6');hi.setAttribute('stroke-linecap','round');dom.wireSvg.appendChild(hi);
      const ax=a.x+nx*off,ay=a.y+ny*off,bx=b.x+nx*off,by=b.y+ny*off;
      const ang=Math.atan2(dy,dx)*180/Math.PI;
      drawPlug(ax,ay,ang+180,color,count===1?1:0.82);
      drawPlug(bx,by,ang,color,count===1?1:0.82);
    });
    // bundle collar for 2-4 cables
    if(count>1){
      const makeCollar=(pt,ang)=>{const ns='http://www.w3.org/2000/svg';const g=document.createElementNS(ns,'g');g.setAttribute('transform',`translate(${pt.x} ${pt.y}) rotate(${ang})`);g.innerHTML=`<rect x="-7" y="-11" width="14" height="22" rx="5" fill="#0f1720" opacity=".92"/><rect x="-4" y="-8" width="8" height="16" rx="3" fill="#2a3541"/>`;dom.wireSvg.appendChild(g);};
      const ang=Math.atan2(dy,dx)*180/Math.PI; makeCollar(a,ang); makeCollar(b,ang+180);
    }
  }
  function drawTempWire(a,b){
    if(!a||!b){const t=$('#tempWireGroup');if(t)t.remove();renderWireLabels();return}
    let g=$('#tempWireGroup');if(g)g.remove();
    g=document.createElementNS('http://www.w3.org/2000/svg','g');g.id='tempWireGroup';dom.wireSvg.appendChild(g);
    const spec=wireSpec(state.wireType);
    const count=spec.count||1, gap=count===1?0:6; const dx=b.x-a.x,dy=b.y-a.y,dist=Math.max(1,Math.hypot(dx,dy));const nx=-dy/dist,ny=dx/dist;
    for(let i=0;i<count;i++){const off=(i-(count-1)/2)*gap;const d=wirePath(a,b,off);const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',d);p.setAttribute('fill','none');p.setAttribute('stroke',state.wireColor);p.setAttribute('stroke-width',count===1?'8':'6');p.setAttribute('stroke-linecap','round');p.setAttribute('opacity','.9');g.appendChild(p);}
    renderWireLabels();
  }
  function addWire(){
    if(!state.source||!state.target){log('warn','Chưa đủ hai cổng','Chọn chân nguồn và chân đích trước.');toast('Hãy chọn 2 cổng trước');return false;}
    const res=validateConnection(state.source,state.target);
    if(res.level==='error'){markFault(res);log('error',res.msg,res.detail);return false;}
    const a=portObj(state.source),b=portObj(state.target);
    const duplicate=state.wires.some(w=>(w.a.component===state.source.component&&w.a.pinKey===state.source.pinKey&&w.b.component===state.target.component&&w.b.pinKey===state.target.pinKey)||(w.b.component===state.source.component&&w.b.pinKey===state.source.pinKey&&w.a.component===state.target.component&&w.a.pinKey===state.target.pinKey));
    if(duplicate){log('warn','Hai cổng đã có dây','Không tạo dây trùng.');toast('Hai cổng đã được nối');state.source=null;state.target=null;updateSelectionUI();return false;}
    snapshot();
    const spec=wireSpec(state.wireType); const w={id:'wire-'+Date.now()+'-'+Math.random().toString(36).slice(2,6),a:{...state.source},b:{...state.target},color:state.wireColor,type:spec.id,bundleCount:spec.count,length:state.length,connector:state.connector};
    state.wires.push(w);a.c.status='ok';b.c.status='ok';a.c.statusText='Đã nối';b.c.statusText='Đã nối';
    log('ok',`Đã nối ${a.c.name} / ${a.name} → ${b.c.name} / ${b.name}`,`${w.type} • ${w.length}`);
    state.source=null;state.target=null;renderComponents();toast('✓ Đã bắt điểm và nối cổng');return true;
  }
  function wireLabelText(sel){const p=portObj(sel);return p?.name||sel?.pinKey?.split('::').pop()||'PORT'}
  function renderWireLabels(){
    if(!dom.wireLabels)return; dom.wireLabels.innerHTML='';
    for(const w of state.wires){
      const a=portElementCenter(w.a),b=portElementCenter(w.b); if(!a||!b)continue;
      const ca=document.createElement('div'); ca.className='wire-end-label source'; ca.style.left=a.x+'px'; ca.style.top=a.y+'px';
      ca.innerHTML=`<span class="dot" style="background:${esc(w.color)}"></span><span>${esc(wireLabelText(w.a))}</span>`; dom.wireLabels.appendChild(ca);
      const cb=document.createElement('div'); cb.className='wire-end-label target'; cb.style.left=b.x+'px'; cb.style.top=b.y+'px';
      cb.innerHTML=`<span class="dot" style="background:${esc(w.color)}"></span><span>${esc(wireLabelText(w.b))}</span>`; dom.wireLabels.appendChild(cb);
    }
    if(state.wireDrag?.moved&&state.source){
      const a=portElementCenter(state.source); if(a){const ca=document.createElement('div');ca.className='wire-end-label source';ca.style.left=a.x+'px';ca.style.top=a.y+'px';ca.innerHTML=`<span class="dot" style="background:${esc(state.wireColor)}"></span><span>${esc(wireLabelText(state.source))}</span>`;dom.wireLabels.appendChild(ca);}
      if(state.hoverTarget){const b=pinCenter(state.hoverTarget.el);const cb=document.createElement('div');cb.className='wire-end-label '+(state.hoverTarget.valid?'target':'bad');cb.style.left=b.x+'px';cb.style.top=b.y+'px';cb.innerHTML=`<span class="dot" style="background:${esc(state.wireColor)}"></span><span>${esc(wireLabelText(state.hoverTarget.sel))}</span>`;dom.wireLabels.appendChild(cb);}
    }
  }
  function renderWires(){
    dom.wireSvg.innerHTML='';
    for(const w of state.wires){
      const a=portElementCenter(w.a),b=portElementCenter(w.b);if(!a||!b)continue;
      drawBundle(a,b,wireSpec(w.type),w.color||state.wireColor);
    }
    const temp=$('#tempWireGroup');if(temp)dom.wireSvg.appendChild(temp);renderWireLabels();
  }
  function pinElementCenter(sel){const el=$(`[data-component-id="${CSS.escape(sel.component)}"] [data-pin-key="${CSS.escape(sel.pinKey)}"]`,dom.stage);if(!el)return null;const r=el.getBoundingClientRect(),wrap=dom.wrap.getBoundingClientRect();return{x:(r.left+r.width/2-wrap.left)/state.zoom,y:(r.top+r.height/2-wrap.top)/state.zoom}}
  function portElementCenter(sel){return pinElementCenter(sel)}
  function updateSelectionUI(){dom.source.textContent=selText(state.source);dom.target.textContent=selText(state.target);$$('.pin,.breadboard-hole',dom.stage).forEach(el=>el.classList.remove('source','target','bad'));if(state.source){const el=$(`[data-pin-key="${CSS.escape(state.source.pinKey)}"]`,dom.stage);if(el)el.classList.add('source')}if(state.target){const el=$(`[data-pin-key="${CSS.escape(state.target.pinKey)}"]`,dom.stage);if(el)el.classList.add('target')}renderPortList();}
  function selText(s){if(!s)return'Chưa chọn';const c=state.components.get(s.component);return c?`${c.name} / ${s.pinKey.split('::').pop()}`:'Chưa chọn'}
  function renderPortList(){const c=state.selected?state.components.get(state.selected):null;let items=[];if(c)items=componentPins(c).slice(0,80).map(p=>({c,p}));else{for(const comp of state.components.values()){for(const p of componentPins(comp).slice(0,30))items.push({c:comp,p})}}dom.portList.innerHTML=items.map(({c,p})=>{const key=p.bb?`${c.id}::${p.name}`:`${p.key}`;const source=state.source?.pinKey===key;const target=state.target?.pinKey===key;return`<div class="port-row ${source?'selected-source':''} ${target?'selected-target':''}" data-port="${esc(key)}" data-component="${esc(c.id)}"><span class="port-dot" style="background:${portColor(p.role)}"></span><div class="port-name">${esc(c.name)} · ${esc(p.name)}</div><div class="port-meta">${esc(p.role||'passive')}</div></div>`}).join('');$$('.port-row',dom.portList).forEach(r=>r.onclick=()=>{const c=state.components.get(r.dataset.component);if(!c)return;const key=r.dataset.port;if(!state.source||state.target){state.source={component:c.id,pinKey:key};state.target=null;log('info',`Đã chọn nguồn: ${c.name} / ${key.split('::').pop()}`)}else{state.target={component:c.id,pinKey:key};validateAndPreview();}updateSelectionUI()})}
  function portColor(role){if(role==='ground')return'#111827';if(role==='power5')return'#ef4444';if(role==='power')return'#22c55e';if(role?.startsWith('analog'))return'#f59e0b';if(role?.includes('i2c'))return'#0ea5e9';if(role?.includes('digital'))return'#2563eb';return'#94a3b8'}
  function captureState(){return JSON.stringify({components:[...state.components.values()],wires:state.wires,code:state.code})}
  function checkpoint(){const s=captureState();if(state.history[state.history.length-1]!==s)state.history.push(s);if(state.history.length>60)state.history.shift();state.future=[]}
  function snapshot(){checkpoint()}
  function restoreSnapshot(s){const d=JSON.parse(s);state.components=new Map((d.components||[]).map(x=>[x.id,{scale:1,...x}]));state.wires=d.wires||[];if(d.code)state.code=d.code;state.selected=null;state.source=null;state.target=null;renderComponents()}
  function undo(){if(!state.history.length){toast('Không còn thao tác để hoàn tác');return}const current=captureState();state.future.push(current);const prev=state.history.pop();restoreSnapshot(prev);log('info','Đã hoàn tác','Khôi phục trạng thái trước thao tác gần nhất');}
  function redo(){if(!state.future.length){toast('Không còn thao tác để làm lại');return}const current=captureState();state.history.push(current);const next=state.future.pop();restoreSnapshot(next);log('info','Đã làm lại','Khôi phục thao tác vừa hoàn tác');}
  function addComponent(name,x=180,y=100,opts={}){if(!MODULES[name])return;const render=opts.render!==false,notify=opts.notify!==false,doCheckpoint=opts.checkpoint!==false;if(doCheckpoint)checkpoint();const id='c-'+Date.now()+'-'+Math.random().toString(36).slice(2,7);state.components.set(id,{id,name,x,y,r:0,status:'',statusText:'Sẵn sàng',scale:1});state.selected=id;if(render)renderComponents();if(notify){log('ok',`Đã thêm ${name}`);toast(`Đã thêm ${name}`)}return id}
  function removeSelected(){if(!state.selected)return;checkpoint();const c=state.components.get(state.selected);state.wires=state.wires.filter(w=>w.a.component!==state.selected&&w.b.component!==state.selected);state.components.delete(state.selected);log('info',`Đã xóa ${c?.name||'linh kiện'}`);state.selected=null;renderComponents()}
  function rotateSelected(){if(!state.selected)return;const c=state.components.get(state.selected);if(!c)return;checkpoint();c.r=((c.r||0)+90)%360;renderComponents();log('info',`Đã xoay ${c.name}`,`Góc ${c.r}°`)}
  function duplicateSelected(){if(!state.selected)return;const c=state.components.get(state.selected);if(!c)return;checkpoint();const id='c-'+Date.now()+'-'+Math.random().toString(36).slice(2,7);state.components.set(id,{...c,id,x:Math.min(1840,(c.x||180)+35),y:Math.min(1120,(c.y||100)+35),r:c.r||0});state.selected=id;renderComponents();log('ok',`Đã nhân bản ${c.name}`)}
  function ensureBaseHardware(){
    let board=[...state.components.values()].find(c=>c.name==='Arduino Uno R3');
    if(!board){addComponent('Arduino Uno R3',420,150,{render:false,notify:false,checkpoint:false});board=[...state.components.values()].find(c=>c.name==='Arduino Uno R3');}
    let bb=[...state.components.values()].find(c=>/Breadboard 830 point/i.test(c.name));
    if(!bb)addComponent('Breadboard 830 point',470,520,{render:false,notify:false,checkpoint:false});
  }
  function resetProject(){state.components.clear();state.wires=[];state.source=null;state.target=null;state.history=[];state.future=[];addComponent('Arduino Uno R3',420,120,{render:false,notify:false,checkpoint:false});addComponent('Breadboard 830 point',470,470,{render:false,notify:false,checkpoint:false});addComponent('Single LED',860,520,{render:false,notify:false,checkpoint:false});addComponent('10k Potentiometer',720,350,{render:false,notify:false,checkpoint:false});renderComponents();log('ok','Hệ thống đã sẵn sàng','Arduino Uno + breadboard đã được đặt sẵn. Kéo linh kiện, đổi kích thước và nối dây.');}
  function saveProject(){const data={version:2,createdAt:new Date().toISOString(),components:[...state.components.values()],wires:state.wires,code:state.code};localStorage.setItem('GH_ARDUINO_LAB_PROJECT',JSON.stringify(data));log('ok','Đã lưu project vào trình duyệt')}
  function loadProjectData(d){state.components=new Map((d.components||[]).map(x=>[x.id,{scale:1,...x}]));state.wires=(d.wires||[]).map(w=>({...w,type:normalizeWireType(w.type),bundleCount:w.bundleCount||wireSpec(w.type).count}));state.code=d.code||state.code;state.selected=null;ensureBaseHardware();renderComponents();log('ok','Đã mở project',`${state.components.size} linh kiện / ${state.wires.length} dây`)}
  function exportProject(){const d={version:2,exportedAt:new Date().toISOString(),components:[...state.components.values()],wires:state.wires,code:state.code};const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(d,null,2)],{type:'application/json'}));a.download='arduino-lab-project.json';a.click();URL.revokeObjectURL(a.href);log('ok','Đã xuất project JSON')}
  function runCode(){state.running=true;log('ok','Biên dịch và chạy sketch','Mô phỏng runtime giáo dục đang chạy');const highs=[...state.code.matchAll(/digitalWrite\s*\(\s*(\d+)\s*,\s*HIGH\s*\)/g)].map(m=>m[1]);const lows=[...state.code.matchAll(/digitalWrite\s*\(\s*(\d+)\s*,\s*LOW\s*\)/g)].map(m=>m[1]);if(highs.length||lows.length){const led=[...state.components.values()].find(c=>/led/i.test(c.name));if(led){led.status='ok';led.statusText=`GPIO ${highs[0]||lows[0]||'?'} ${highs.length?'HIGH':'LOW'}`;renderComponents()}}log('info','setup() hoàn tất','loop() đang mô phỏng theo thời gian ảo');toast('Sketch đang chạy')}
  function stopCode(){state.running=false;log('warn','Đã dừng mô phỏng');toast('Đã dừng')}
  function resetVisual(){for(const c of state.components.values()){c.status='';c.statusText='Sẵn sàng'}renderComponents()}
  function setupWireUI(){
    state.wireType=normalizeWireType(state.wireType);$('#wireTypes').innerHTML=WIRE_TYPES.map(w=>`<button class="wire-card ${state.wireType===w.id?'active':''}" data-wire="${w.id}"><span class="wire-photo"><img src="${w.asset}" alt="${esc(w.name)}" loading="lazy"></span><span><span class="wire-name">${w.name}</span><small style="display:block;color:#7b8da0;margin-top:2px">${w.sub}</small></span></button>`).join('');$$('[data-wire]').forEach(b=>b.onclick=()=>{state.wireType=b.dataset.wire;setupWireUI();toast(`Đã chọn ${wireSpec(state.wireType).name}`)});
    $('#swatches').innerHTML=COLORS.map(([n,c])=>`<button class="swatch ${state.wireColor===c?'active':''}" title="${n}" style="background:${c}" data-color="${c}"></button>`).join('');$$('[data-color]').forEach(b=>b.onclick=()=>{state.wireColor=b.dataset.color;setupWireUI()});
    $('#connectorChoices').innerHTML=['Đầu thẳng','Đầu chữ L'].map(x=>`<button class="choice ${state.connector===x?'active':''}" data-conn="${x}">${x}</button>`).join('');$$('[data-conn]').forEach(b=>b.onclick=()=>{state.connector=b.dataset.conn;setupWireUI()});
    $('#lengthChoices').innerHTML=['10 cm','20 cm','30 cm','50 cm'].map(x=>`<button class="choice ${state.length===x?'active':''}" data-len="${x}">${x}</button>`).join('');$$('[data-len]').forEach(b=>b.onclick=()=>{state.length=b.dataset.len;setupWireUI()});
  }
  function renderBoardQuickSelect(){
    const el=$('#boardQuickSelect'); if(!el)return;
    const boards=NAMES.filter(n=>{const m=MODULES[n]||{};return String(m.kind||'').toLowerCase().includes('board');}).sort((a,b)=>a.localeCompare(b,'vi'));
    el.innerHTML='<option value="">Chọn board để thêm…</option>'+boards.map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join('');
    el.onchange=()=>{const name=el.value;if(!name)return;const offset=(state.components.size%4)*34;addComponent(name,280+offset,110+offset);state.boardName=name;el.value='';};
  }

  function setupControls(){
    $('#addArduinoBtn').onclick=()=>addComponent('Arduino Uno R3',Math.max(80,220+state.components.size*18),120); $('#addBreadboardBtn').onclick=()=>addComponent('Breadboard 830 point',Math.max(80,260+state.components.size*18),500); $('#connectPortsBtn').onclick=addWire; $('#rotateBtn').onclick=rotateSelected; $('#duplicateBtn').onclick=duplicateSelected; $('#deleteBtn').onclick=removeSelected; $('#undoBtn').onclick=undo; $('#redoBtn').onclick=redo; $('#newBtn').onclick=()=>resetProject(); $('#saveBtn').onclick=saveProject; $('#exportBtn').onclick=exportProject; $('#openBtn').onclick=()=>$('#fileOpen').click(); $('#fileOpen').onchange=e=>{const f=e.target.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{try{loadProjectData(JSON.parse(rd.result))}catch(err){log('error','Không thể mở project',err.message)}};rd.readAsText(f)};
    $('#runBtn').onclick=runCode;$('#stopBtn').onclick=stopCode;$('#resetBtn').onclick=resetVisual;$('#zoomIn').onclick=()=>setZoom(state.zoom+.1);$('#zoomOut').onclick=()=>setZoom(state.zoom-.1);$('#fitBtn').onclick=fitView;
    $('#toggleWirePanel').onclick=()=>{const panel=$('.right-panel');if(!panel)return;panel.classList.toggle('collapsed');$('#toggleWirePanel').textContent=panel.classList.contains('collapsed')?'⌃':'⌄';};
    $('#selectTool').onclick=()=>setTool('select');$('#handTool').onclick=()=>setTool('hand');$('#clearConsole').onclick=()=>{state.logs=[];renderLogs()};$$('.console-filter').forEach(b=>{if(b.dataset.level)b.onclick=()=>{$$('.console-filter').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderLogs()}});
    let searchTimer=0; $('#moduleSearch').oninput=e=>{state.query=e.target.value;clearTimeout(searchTimer);searchTimer=setTimeout(renderLibrary,80)};$('#libraryClear').onclick=()=>{state.query='';state.activeCat='all';dom.search.value='';renderChips();renderLibrary()};document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();undo();return}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'){e.preventDefault();redo();return}if(e.key==='Delete')removeSelected();if(e.key==='r'&&!e.ctrlKey&&!e.metaKey){if(state.selected)rotateSelected();}});
    $$('.view-tab').forEach(t=>t.onclick=()=>{if(t.dataset.view==='code'){showCodeMode()}else{showCircuitMode()};$$('.view-tab').forEach(x=>x.classList.toggle('active',x===t))});
    $('#modalClose').onclick=hideModal;$('#modalPrimary').onclick=hideModal;
  }
  function setTool(t){state.tool=t;$('#selectTool').classList.toggle('active',t==='select');$('#handTool').classList.toggle('active',t==='hand');}
  function setZoom(z){state.zoom=Math.max(.55,Math.min(1.6,z));dom.zoom.textContent=Math.round(state.zoom*100)+'%';dom.stage.style.transform=`scale(${state.zoom})`;renderWires()}
  function fitView(){if(!state.components.size){setZoom(1);return}let minX=Infinity,minY=Infinity,maxX=0,maxY=0;for(const c of state.components.values()){minX=Math.min(minX,c.x);minY=Math.min(minY,c.y);maxX=Math.max(maxX,c.x+230);maxY=Math.max(maxY,c.y+270)}const w=dom.wrap.clientWidth,h=dom.wrap.clientHeight-260;const z=Math.min(w/(maxX-minX+100),h/(maxY-minY+100));setZoom(Math.max(.65,Math.min(1.1,z)));dom.wrap.scrollLeft=Math.max(0,(minX-50)*state.zoom);dom.wrap.scrollTop=Math.max(0,(minY-50)*state.zoom)}
  function showCodeMode(){const box=document.createElement('textarea');box.id='codeEditor';box.value=state.code;box.style.cssText='position:absolute;inset:18px;resize:none;border:0;outline:none;background:#071523;color:#dff7ff;border-radius:18px;padding:20px;font:13px/1.7 ui-monospace,SFMono-Regular,Consolas,monospace;box-shadow:0 18px 38px rgba(5,24,40,.2);z-index:20';dom.wrap.appendChild(box);box.oninput=e=>state.code=e.target.value;}
  function showCircuitMode(){const box=$('#codeEditor');if(box){state.code=box.value;box.remove()}}
  function setupCanvasPan(){dom.wrap.addEventListener('wheel',e=>{if(e.ctrlKey){e.preventDefault();setZoom(state.zoom+(e.deltaY<0?.08:-.08))}},{passive:false});dom.wrap.addEventListener('pointerdown',e=>{if(state.tool!=='hand')return;const s={x:e.clientX,y:e.clientY,sl:dom.wrap.scrollLeft,st:dom.wrap.scrollTop};const move=ev=>{dom.wrap.scrollLeft=s.sl-(ev.clientX-s.x);dom.wrap.scrollTop=s.st-(ev.clientY-s.y)};const up=()=>{window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up)};window.addEventListener('pointermove',move);window.addEventListener('pointerup',up)});}
  function setupStageDrop(){dom.wrap.addEventListener('dragover',e=>e.preventDefault());dom.wrap.addEventListener('drop',e=>{e.preventDefault();const name=e.dataTransfer.getData('text/plain');if(!name)return;const p=stagePoint(e.clientX,e.clientY);addComponent(name,Math.max(20,p.x-115),Math.max(20,p.y-90))})}
  function loadSaved(){try{const raw=localStorage.getItem('GH_ARDUINO_LAB_PROJECT');if(raw){loadProjectData(JSON.parse(raw));return}}catch(_){}resetProject()}
  function init(){renderChips();dom.grid.addEventListener('scroll',scheduleLibraryViewport,{passive:true});if('ResizeObserver' in window){libraryState.resizeObs=new ResizeObserver(()=>renderLibrary());libraryState.resizeObs.observe(dom.grid)}renderLibrary();setupWireUI();setupControls();setupCanvasPan();setupStageDrop();renderBoardQuickSelect();loadSaved();renderBoardQuickSelect();renderLogs();log('ok','Hệ thống đã sẵn sàng','247 module/board sẵn sàng • thư viện virtual + thumbnail nhẹ • ảnh đầy đủ chỉ tải khi đặt linh kiện.');}
  document.addEventListener('DOMContentLoaded',init);
})();
