(() => {
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const DB='giahuy-hub', VER=2;
const CATS={plugins:'Bài giảng',config:'Giáo án',mods:'Bài tập',assets:'Học liệu',tools:'Công cụ',resources:'Tài nguyên',guide:'Hướng dẫn'};
/* DEFAULT seed data đã bỏ — dùng dữ liệu từ DB / upload thật */
function db(){return new Promise((res,rej)=>{const r=indexedDB.open(DB,VER);r.onupgradeneeded=()=>{const d=r.result;if(!d.objectStoreNames.contains('files'))d.createObjectStore('files',{keyPath:'id',autoIncrement:true});if(!d.objectStoreNames.contains('music'))d.createObjectStore('music',{keyPath:'id',autoIncrement:true});if(!d.objectStoreNames.contains('meta'))d.createObjectStore('meta',{keyPath:'key'});};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
async function tx(store,mode,cb){const d=await db();return new Promise((res,rej)=>{const t=d.transaction(store,mode),s=t.objectStore(store);const out=cb(s);t.oncomplete=()=>res(out);t.onerror=()=>rej(t.error)})}
function getAll(store){return tx(store,'readonly',s=>new Promise(resolve=>{const r=s.getAll();r.onsuccess=()=>resolve(r.result)}))}
function add(store,obj){return tx(store,'readwrite',s=>s.add(obj))}
function del(store,id){return tx(store,'readwrite',s=>s.delete(id))}
/* Không seed data cứng — xóa luôn các mục mẫu builtin cũ nếu còn trong IndexedDB */
window.seed = async function seed(){
  try {
    const files = await getAll('files');
    for (const f of files) {
      if (f && f.builtin) {
        try { await del('files', f.id); } catch (_) {}
      }
    }
  } catch (_) {}
}
function notify(msg,type='ok'){const t=$('#toast');if(!t)return;t.textContent=msg;t.dataset.type=type;t.classList.add('show');clearTimeout(window.__t);window.__t=setTimeout(()=>t.classList.remove('show'),2800)}
function avatarSet(src){$$('.avatar-ring img,.mini-avatar img,.admin-avatar-preview img').forEach(i=>i.src=src)}
function jpIcon(id){return `<svg class="jp-svg" viewBox="0 0 48 48" aria-hidden="true"><use href="assets/landmarks.svg#${id}"></use></svg>`}
function enhanceStudyUI(){
  const NAV = [
    {match:/trang chủ|index/i, icon:'cil-home'},
    {match:/bài giảng|plugins/i, icon:'cil-book'},
    {match:/config|giáo án/i, icon:'cil-notes'},
    {match:/mod|bài tập/i, icon:'cil-task'},
    {match:/học liệu|assets/i, icon:'cil-education'},
    {match:/công cụ|tools/i, icon:'cil-settings'},
    {match:/tài nguyên|resources/i, icon:'cil-folder-open'},
    {match:/hướng dẫn|guide/i, icon:'cil-lightbulb'},
    {match:/kho|library|yêu thích/i, icon:'cil-heart'},
    {match:/hỏi đáp|ticket/i, icon:'cil-speech'},
    {match:/cài đặt|settings/i, icon:'cil-cog'},
    {match:/panel/i, icon:'cil-speedometer'},
  ];
  function pickIcon(text, href){
    const s = (text||'') + ' ' + (href||'');
    for (const n of NAV){ if(n.match.test(s)) return n.icon; }
    return 'cil-circle';
  }
  function iconHTML(name){ return `<i class="${name}" aria-hidden="true"></i>`; }

  // Topnav: strip old jp icons + leading symbols, add CoreUI
  $$('.topnav a').forEach(a=>{
    a.querySelectorAll('.jp-ui-icon, .cil-nav-ico').forEach(n=>n.remove());
    // remove leading decorative symbols from text nodes while keeping label
    let label = (a.textContent||'').replace(/^[\s⌂◇□✣◈⌁▤▥♡🎫⚙▣◉▶◖◌↑↓←→★☆✦]/u,'').trim();
    const ic = pickIcon(label, a.getAttribute('href'));
    a.innerHTML = `<span class="cil-nav-ico">${iconHTML(ic)}</span><span class="nav-label">${label}</span>`;
  });

  // Sidebar
  $$('.side-item').forEach(a=>{
    const icon = a.querySelector('.side-icon');
    const labelEl = a.querySelector('span:not(.side-icon):not(.chev)');
    const label = labelEl ? labelEl.textContent : a.textContent;
    const ic = pickIcon(label, a.getAttribute('href')||a.getAttribute('data-open-settings')||'');
    if(icon){ icon.innerHTML = iconHTML(ic); }
  });

  // Category cards
  $$('.category-grid .cat-card, .cat-card').forEach((a,i)=>{
    const x = a.querySelector('.cat-icon');
    if(!x) return;
    const icons = ['cil-book','cil-notes','cil-task','cil-education','cil-settings','cil-folder-open','cil-lightbulb'];
    x.innerHTML = iconHTML(icons[i%icons.length]);
  });
}

function ensureDonateUI(){
  if(document.getElementById('donateModal')) return;
  const readCfg=()=>{try{return Object.assign({method:'Chuyển khoản ngân hàng',bank:'',accountNumber:'',accountName:'Gia Huy',content:'Ung ho Gia Huy',qr:'assets/donate-qr.png'},JSON.parse(localStorage.getItem('giahuy-donate-config')||'{}'))}catch{return {method:'Chuyển khoản ngân hàng',bank:'',accountNumber:'',accountName:'Gia Huy',content:'Ung ho Gia Huy',qr:'assets/donate-qr.png'}}};
  document.body.insertAdjacentHTML('beforeend',`<button class="donate-fab" id="donateOpen" type="button" aria-label="Ủng hộ Thầy"><span class="donate-fab-icon"><i class="cil-heart"></i></span><span>Ủng hộ Thầy</span></button><div class="donate-modal" id="donateModal" aria-hidden="true"><div class="donate-box"><button class="donate-close" id="donateClose" type="button" aria-label="Đóng"><i class="cil-x"></i></button><div class="donate-kicker">CẢM ƠN BẠN ĐÃ ĐỒNG HÀNH</div><h2>Ủng hộ Thầy Gia Huy</h2><p>Nếu website hữu ích với bạn, bạn có thể ủng hộ bằng thông tin thanh toán được cấu hình trong hệ thống.</p><div class="donate-grid"><div class="donate-qr-wrap"><div class="donate-qr-frame"><img id="donateQrImg" alt="QR ủng hộ"></div><span class="donate-demo" id="donateQrHint"></span><button class="donate-action" id="donateQrOpen" type="button">Mở QR lớn</button></div><div class="donate-copy"><div class="donate-landmark"><i class="cil-heart"></i><span id="donateMethod">Chuyển khoản ngân hàng</span></div><h3 id="donateBankLine">Chưa cấu hình thông tin nhận ủng hộ</h3><div class="donate-details" id="donateDetails"></div><div class="donate-actions"><button class="donate-action" id="donateCopyInfo" type="button">Sao chép thông tin</button><button class="donate-action" id="donateReload" type="button">Làm mới</button></div><div class="donate-note"><span><i class="cil-star"></i></span> Một chút ủng hộ • một chặng đường dài</div></div></div></div></div>`);
  const paint=()=>{const c=readCfg();const img=$('#donateQrImg');if(img)img.src=c.qr||'assets/donate-qr.png';const meth=$('#donateMethod');if(meth)meth.textContent=c.method||'Chuyển khoản';const line=$('#donateBankLine');if(line)line.textContent=c.bank?(c.bank+' • '+(c.accountNumber||'')):'Chưa cấu hình thông tin nhận ủng hộ';const details=$('#donateDetails');if(details)details.innerHTML=[['Ngân hàng',c.bank],['Số tài khoản',c.accountNumber],['Chủ tài khoản',c.accountName],['Nội dung',c.content]].filter(x=>x[1]).map(x=>`<div><b>${esc(x[0])}</b><span>${esc(x[1])}</span></div>`).join('')||'<div class="donate-empty">Admin chưa cấu hình phương thức nhận ủng hộ.</div>';const hint=$('#donateQrHint');if(hint)hint.textContent=c.qr?'QR thanh toán đã sẵn sàng':'Chưa có QR riêng';};
  paint();
  $('#donateOpen')?.addEventListener('click',()=>{$('#donateModal')?.classList.add('open');$('#donateModal')?.setAttribute('aria-hidden','false');paint()});
  $('#donateClose')?.addEventListener('click',closeDonate);$('#donateModal')?.addEventListener('click',e=>{if(e.target.id==='donateModal')closeDonate()});
  $('#donateQrOpen')?.addEventListener('click',()=>{const src=$('#donateQrImg')?.src;if(src)window.open(src,'_blank','noopener')});
  $('#donateReload')?.addEventListener('click',paint);
  $('#donateCopyInfo')?.addEventListener('click',async()=>{const c=readCfg();const txt=[c.method,c.bank&&`Ngân hàng: ${c.bank}`,c.accountNumber&&`Số tài khoản: ${c.accountNumber}`,c.accountName&&`Chủ tài khoản: ${c.accountName}`,c.content&&`Nội dung: ${c.content}`].filter(Boolean).join('\n');try{await navigator.clipboard.writeText(txt);notify('Đã sao chép thông tin ủng hộ.')}catch{notify('Không thể sao chép tự động.','error')}});
  function closeDonate(){$('#donateModal')?.classList.remove('open');$('#donateModal')?.setAttribute('aria-hidden','true')}
}
const __videoCoverUrls=new Map();
function videoCoverUrl(x){if(!x?.coverBlob)return '';const k=String(x.id);if(__videoCoverUrls.has(k))return __videoCoverUrls.get(k);try{const u=URL.createObjectURL(x.coverBlob);__videoCoverUrls.set(k,u);return u}catch{return ''}}
addEventListener('beforeunload',()=>{for(const u of __videoCoverUrls.values()){try{URL.revokeObjectURL(u)}catch{}}__videoCoverUrls.clear()});
const avatarDefault='assets/images/avatar.gif';avatarSet(localStorage.getItem('giahuy-avatar')||avatarDefault);
const getAnn=()=>localStorage.getItem('giahuy-announcement')||'';
function applyAnnouncement(){const text=getAnn(),box=$('#announcementBar');if(box){box.classList.toggle('show',!!text);box.querySelector('[data-announcement-text]').textContent=text}}
function updateClock(){const t=$('#liveTime'),d=$('#liveDate');if(!t||!d)return;const n=new Date();t.textContent=new Intl.DateTimeFormat('vi-VN',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(n);d.textContent=new Intl.DateTimeFormat('vi-VN',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(n)}updateClock();setInterval(updateClock,1000);
async function weather(){
  const temp=$('#weatherTemp'),icon=$('#weatherIcon'),place=document.querySelector('.weather small');
  if(!temp||!icon)return;
  try{
    let lat=13.78, lon=109.22, placeName='Việt Nam';
    try{
      const ipR=await fetch('https://ipapi.co/json/',{cache:'no-store'});
      if(ipR.ok){
        const ip=await ipR.json();
        if(ip.latitude!=null&&ip.longitude!=null){
          lat=Number(ip.latitude); lon=Number(ip.longitude);
          placeName=[ip.city,ip.country_name].filter(Boolean).join(', ')||placeName;
        }
      }
    }catch(_ip){
      try{
        const ipR2=await fetch('https://ip-api.com/json/?fields=status,city,country,lat,lon',{cache:'no-store'});
        if(ipR2.ok){
          const ip=await ipR2.json();
          if(ip.status==='success'){
            lat=Number(ip.lat); lon=Number(ip.lon);
            placeName=[ip.city,ip.country].filter(Boolean).join(', ')||placeName;
          }
        }
      }catch(_2){}
    }
    const r=await fetch('https://api.open-meteo.com/v1/forecast?latitude='+lat+'&longitude='+lon+'&current=temperature_2m,weather_code&timezone=auto',{cache:'no-store'});
    const d=await r.json();
    const code=d.current&&d.current.weather_code;
    temp.textContent=Math.round(d.current.temperature_2m)+'°C';
    icon.innerHTML=code===0?'<i class="cil-sun"></i>':([1,2,3].includes(code)?'<i class="cil-cloud"></i>':'<i class="cil-drop"></i>');
    if(place) place.textContent=placeName;
    // đảm bảo khối thời tiết hiện
    const w=document.querySelector('.clock-card .weather');
    if(w){ w.style.display='flex'; w.style.visibility='visible'; w.style.opacity='1'; }
    const v=document.querySelector('.clock-card .visit-counter');
    if(v){ v.style.display='flex'; v.style.visibility='visible'; }
  }catch(e){}
}
weather();
function theme(){document.body.classList.toggle('light-theme',localStorage.getItem('giahuy-theme')==='light');const b=$('#themeToggle');if(b)b.textContent=document.body.classList.contains('light-theme')?'<i class="cil-sun"></i>':'◐'}theme();$('#themeToggle')?.addEventListener('click',()=>{localStorage.setItem('giahuy-theme',document.body.classList.contains('light-theme')?'dark':'light');theme()});
function scrollUI(){const p=$('#scrollProgress'),bt=$('#backTop');const max=document.documentElement.scrollHeight-innerHeight;if(p)p.style.width=(max?scrollY/max*100:0)+'%';bt?.classList.toggle('show',scrollY>500)}addEventListener('scroll',scrollUI,{passive:true});scrollUI();$('#backTop')?.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));
function modal(){const sm=$('#searchModal'),am=$('#adminModal');$('#searchOpen')?.addEventListener('click',()=>{sm?.classList.add('open');sm?.setAttribute('aria-hidden','false');renderSearch();$('#searchInput')?.focus()});$('#searchClose')?.addEventListener('click',()=>sm?.classList.remove('open'));const callOpenAdmin=(e)=>{e?.preventDefault?.();if(typeof window.openAdmin==='function')window.openAdmin()};$('#adminOpen')?.addEventListener('click',callOpenAdmin);$('#adminClose')?.addEventListener('click',()=>am?.classList.remove('open'));/* avatarBtn: role-based handler ở wireAccountAvatar — không gắn openAdmin cũ */addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('#searchOpen')?.click()}if(e.key==='Escape'){$('#searchModal')?.classList.remove('open');$('#adminModal')?.classList.remove('open');document.getElementById('detailModal')?.classList.remove('open');document.getElementById('guestProfileModal')?.classList.remove('open')}})};$$('[data-open-settings]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();if(typeof window.openAdmin==='function')window.openAdmin()}))
async function renderSearch(q=''){const box=$('#searchResults');if(!box)return;const term=q.trim().toLowerCase();const items=(await getAll('files')).filter(x=>!term||[x.name,x.cat,x.desc,x.fileName].join(' ').toLowerCase().includes(term));box.innerHTML=items.slice(0,40).map(x=>`<a class="result" href="${CATS[x.cat]?x.cat:''}#resource-${encodeURIComponent(x.id)}"><b>${esc(x.name)}</b><small>${esc(CATS[x.cat]||x.cat)} • ${esc(x.desc||x.fileName||'')}</small></a>`).join('')||'<div class="result"><b>Không tìm thấy</b><small>Thử từ khóa khác.</small></div>'}
$('#searchInput')?.addEventListener('input',e=>renderSearch(e.target.value));
function esc(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function iconFor(x){const m=(x.mime||'').toLowerCase(),f=(x.fileName||'').toLowerCase();if(m.startsWith('audio/'))return'<i class="cil-music-note"></i>';if(m.startsWith('video/')||/\.(mp4|webm|mov|mkv)$/.test(f))return'<i class="cil-media-play"></i>';if(m.startsWith('image/'))return'<i class="cil-image"></i>';if(m.includes('zip')||f.endsWith('.jar'))return'<i class="cil-folder"></i>';if(m.includes('pdf')||f.endsWith('.pdf'))return'<i class="cil-description"></i>';if(m.includes('presentation')||m.includes('powerpoint')||/\.pptx?$/.test(f))return'<i class="cil-education"></i>';if(m.includes('word')||/\.docx?$/.test(f))return'<i class="cil-notes"></i>';return '<i class="cil-file"></i>'}
function fmtSize(n){if(!n)return'0 B';const u=['B','KB','MB','GB'];let i=0,x=n;while(x>1024&&i<3){x/=1024;i++}return `${x.toFixed(i?1:0)} ${u[i]}`}
function favKey(id){return 'giahuy-fav-'+id}
function isFav(id){return localStorage.getItem(favKey(id))==='1'}
function toggleFav(id){const k=favKey(id);if(localStorage.getItem(k)==='1'){localStorage.removeItem(k);notify('Đã bỏ khỏi yêu thích.')}else{localStorage.setItem(k,'1');notify('Đã lưu vào kho cá nhân.')}renderCatalog();renderHome()}
function likeKey(id){return 'giahuy-like-'+id}
function likeSeed(id){const s=String(id);let h=0;for(let i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return 6+(h%54)}
function isLiked(id){return localStorage.getItem(likeKey(id))==='1'}
function likeCount(id){return likeSeed(id)+(isLiked(id)?1:0)}
function toggleLike(id,btn){const k=likeKey(id);if(localStorage.getItem(k)==='1'){localStorage.removeItem(k)}else{localStorage.setItem(k,'1');btn?.classList.add('like-pop');setTimeout(()=>btn?.classList.remove('like-pop'),380)}renderCatalog();renderHome()}
function downloadCount(id){return Number(localStorage.getItem('giahuy-dl-'+id)||0)}
function bumpDownload(id){localStorage.setItem('giahuy-dl-'+id,String(downloadCount(id)+1));const h=JSON.parse(localStorage.getItem('giahuy-history')||'[]');const now=Date.now();const next=[{id,at:now},...h.filter(x=>String(x.id)!==String(id))].slice(0,30);localStorage.setItem('giahuy-history',JSON.stringify(next))}
async function blobOf(id,store='files'){const d=await db();return new Promise((res,rej)=>{const r=d.transaction(store,'readonly').objectStore(store).get(id);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}

/** free | paid — mặc định free */
function fileAccess(x){return (x && x.access)==='paid'?'paid':'free'}
function currentSession(){
  try{
    if(typeof Auth!=='undefined'&&Auth.getSession)return Auth.getSession();
    return JSON.parse(localStorage.getItem('giahuy-session')||'null');
  }catch{return null}
}
function isStaffSession(s){
  s=s||currentSession();
  return !!(s&&(s.role==='admin'||s.role==='teacher'||s.role==='manager'));
}
/** GV/QL/Admin: full; quyền access_paid; HS/Khách: chỉ free (gói học tính sau) */
function canUseFile(x){
  if(!x)return false;
  if(fileAccess(x)==='free')return true;
  if(isStaffSession())return true;
  try{
    const s=currentSession();
    if(s&&typeof Auth!=='undefined'&&Auth.hasPerm&&Auth.hasPerm('access_paid',s))return true;
  }catch(_){}
  return false;
}
/** Đăng tài liệu free/paid theo quyền trong phần Phân quyền */
function canUploadAccess(kind){
  const s=currentSession();
  if(!s)return false;
  if(s.role==='admin')return true;
  if(!isStaffSession(s))return false;
  try{
    if(typeof Auth==='undefined'||!Auth.hasPerm)return true;
    if(Auth.hasPerm('settings',s))return true;
    if(kind==='paid')return !!Auth.hasPerm('upload_paid',s);
    return !!(Auth.hasPerm('upload_free',s)||Auth.hasPerm('upload',s));
  }catch(_){return true}
}
/* Giới hạn xem trước theo độ dài file */
function previewPageLimit(totalPages){
  const n = Math.max(1, Number(totalPages) || 1);
  if (n <= 3) return 1;          // 1–3 trang → xem 1
  if (n === 4) return 2;         // 4 trang → xem 2
  if (n <= 10) return 2;
  if (n <= 20) return 3;
  return 4;                      // file dài: tối đa 4 trang
}
/** Video: ≤15 phút → 2p; khoảng 30p (và dài hơn) → 5p */
function previewVideoSeconds(durationSec){
  const d = Number(durationSec) || 0;
  if (d <= 0) return 2 * 60;
  const min = d / 60;
  if (min <= 15) return 2 * 60;
  return 5 * 60;
}
function fmtPreviewTime(sec){
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m + ':' + String(r).padStart(2, '0');
}


async function downloadFile(id){
  const x=await blobOf(id);
  if(!x?.blob){notify('Mục mẫu chưa có file thật.','error');return}
  if(!canUseFile(x)){
    notify('Tài liệu trả phí — cần mua gói học để tải (tính năng gói sắp ra mắt).','error');
    return;
  }
  bumpDownload(x.id);
  const u=URL.createObjectURL(x.blob),a=document.createElement('a');
  a.href=u;a.download=x.fileName||x.name;document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(u),1000);
  notify('Đang tải xuống: '+x.name)
}

function resolveCreator(x){
  if(!x) return {name:'', role:''};
  let name = x.creatorName || x.creName || '';
  let role = x.creatorRole || x.creRole || '';
  try {
    if (typeof Auth !== 'undefined') {
      const id = x.creatorId;
      if (id === 'admin' || role === 'quản trị' || role === 'quan tri' || (!id && role === 'quản trị')) {
        const p = Auth.getAdminProfile && Auth.getAdminProfile();
        if (p && p.username) name = p.username;
        role = role || 'quản trị';
      } else if (id && Auth.getTeacherById) {
        const t = Auth.getTeacherById(id);
        if (t && t.username) { name = t.username; role = role || 'giáo viên'; }
      }
      if (id && id !== 'admin' && Auth.getManagerById) {
        const m = Auth.getManagerById(id);
        if (m && m.username) { name = m.username; role = role || 'quản lí'; }
      }
      // fallback: match stored name role admin → live admin name
      if ((!id || id === 'admin') && (role === 'quản trị' || !role) && Auth.getAdminProfile) {
        const p = Auth.getAdminProfile();
        if (p && p.username) name = p.username;
        if (!role) role = 'quản trị';
      }
    }
  } catch(_) {}
  return { name, role };
}
function card(x){
  const cre = resolveCreator(x);
  const byName = cre.name;
  const byRole = cre.role;
  const byLine = byName
    ? `<div class="cre-line">by: ${esc(byName)}${byRole ? ` (${esc(byRole)})` : ''}</div>`
    : '';
  const bySmall = byName
    ? ` • by: ${esc(byName)}${byRole ? ` (${esc(byRole)})` : ''}`
    : '';
  const dateStr = new Date(x.created || Date.now()).toLocaleDateString('vi-VN');
  const fileLabel = esc(x.fileName || 'Không có file');
  return `<article class="resource-card" id="resource-${esc(x.id)}">` +
    `<div class="card-top">` +
      `<span class="resource-icon resource-icon-media">${(String(x.mime||'').startsWith('video/')||/\.(mp4|webm|ogg|ogv|mov|m4v|avi|mkv)$/i.test(x.fileName||'')) ? (videoCoverUrl(x)?`<img class="resource-cover-img" src="${videoCoverUrl(x)}" alt="Ảnh bìa ${esc(x.name)}">`:`<i class="cil-video"></i>`) : iconFor(x)}</span>` +
      `<div style="min-width:0">` +
        `<b title="${esc(x.name)}">${esc(x.name)}</b>` +
        `<small>${esc(CATS[x.cat]||x.cat)} • ${fmtSize(x.size)}` +
          `${x.builtin?' • Mẫu':''}` +
          `${x.featured?' • <i class="cil-star"></i> Nổi bật':''}` +
          `${fileAccess(x)==='paid'?' • <span class="access-paid">Paid</span>':' • <span class="access-free">Free</span>'}` +
          `${bySmall}` +
        `</small>` +
      `</div>` +
      `<button class="fav-btn ${isFav(x.id)?'active':''}" title="${isFav(x.id)?'Bỏ yêu thích':'Lưu yêu thích'}" data-fav-id="${esc(x.id)}">` +
        `${isFav(x.id)?'<i class="cil-star"></i>':'<i class="cil-star" style="opacity:.35"></i>'}` +
      `</button>` +
    `</div>` +
    `${x.featured?'<span class="featured-badge">FEATURED</span>':''}` +
    `<p>${esc(x.desc||'Không có mô tả.')}</p>` +
    `${byLine}` +
    /* Tên file (đỏ) — 1 hàng riêng */
    `<div class="card-file-row">` +
      `<span class="tag tag-file" title="${fileLabel}">${fileLabel}</span>` +
    `</div>` +
    /* Meta: ngày (xanh lá) · lượt tải (vàng) · tim (xanh biển) */
    `<div class="card-meta-row">` +
      `<span class="tag tag-date" title="Ngày đăng"><i class="cil-calendar"></i> ${dateStr}</span>` +
      `<span class="tag tag-dl" title="Lượt tải"><i class="cil-cloud-download"></i> ${downloadCount(x.id)}</span>` +
      `<button class="tag like-btn tag-like ${isLiked(x.id)?'active':''}" title="${isLiked(x.id)?'Bỏ thích':'Thích'}" data-like-id="${esc(x.id)}">` +
        `<i class="cil-heart"></i> ${likeCount(x.id)}` +
      `</button>` +
    `</div>` +
    `<div class="card-actions">` +
      `<button class="small-btn primary" data-open-id="${esc(x.id)}">Tải xuống</button>` +
      `<button class="small-btn" data-detail-id="${esc(x.id)}">Chi tiết</button>` +
    `</div>` +
  `</article>`;
}
function detailOf(id){
  blobOf(id).then(async x => {
    if (!x) return;
    let m = document.getElementById('detailModal');
    if (!m) {
      m = document.createElement('div');
      m.className = 'search-modal detail-modal-root';
      m.id = 'detailModal';
      document.body.appendChild(m);
    }
    const blobUrl = x.blob ? URL.createObjectURL(x.blob) : null;
    const coverUrl = x.coverBlob ? URL.createObjectURL(x.coverBlob) : '';
    const mime = (x.mime || '').toLowerCase();
    const fname = (x.fileName || x.name || '').toLowerCase();
    const isImg = mime.startsWith('image/');
    const isAud = mime.startsWith('audio/');
    const isVid = mime.startsWith('video/') || /\.(mp4|webm|ogg|mov|m4v|mkv)$/i.test(fname);
    const isPdf = mime.includes('pdf') || fname.endsWith('.pdf');
    const isDocx = mime.includes('wordprocessingml') || mime.includes('msword') || /\.docx?$/.test(fname);
    const isPpt = mime.includes('presentationml') || mime.includes('ms-powerpoint') || /\.pptx?$/i.test(fname);
    const isText = mime.startsWith('text/') || /\.(txt|md|csv|json|log)$/.test(fname);
    const creator = (typeof resolveCreator === 'function') ? resolveCreator(x) : { name: x.creatorName || '', role: x.creatorRole || '' };

    const leftHtml =
      '<div class="detail-side detail-side-info">' +
      '<div class="modal-heading">' +
      '<span class="modal-kicker">CHI TIẾT TÀI LIỆU</span>' +
      '<b>' + esc(x.name) + '</b>' +
      '<small>' + esc(CATS[x.cat] || x.cat) + ' • ' + fmtSize(x.size) + ' • ' +
      new Date(x.created || Date.now()).toLocaleString('vi-VN') + '</small></div>' +
      '<div class="detail-info-body">' +
      '<div class="detail-icon">' + iconFor(x) + '</div>' +
      '<p class="detail-desc">' + esc(x.desc || 'Chưa có mô tả.') + '</p>' +
      (creator.name ? '<div class="cre-line">by: ' + esc(creator.name) +
        (creator.role ? ' (' + esc(creator.role) + ')' : '') + '</div>' : '') +
      '<div class="tag-row">' +
      '<span class="tag">' + esc(x.fileName || 'Không có file') + '</span>' +
      '<span class="tag">' + esc(x.mime || 'unknown') + '</span>' +
      '<span class="tag access-tag-' + fileAccess(x) + '">' + (fileAccess(x) === 'paid' ? 'Paid' : 'Free') + '</span>' +
      '<span class="tag"><i class="cil-cloud-download"></i> ' + downloadCount(x.id) + ' lượt tải</span>' +
      '<span class="tag">' + (isFav(x.id)
        ? '<i class="cil-star"></i> Yêu thích'
        : '<i class="cil-star" style="opacity:.35"></i> Chưa lưu') + '</span>' +
      '</div>' +
      '<div class="card-actions detail-actions">' +
      '<button class="primary-btn" id="detailDownload" type="button">' +
      (canUseFile(x) ? 'Tải xuống' : 'Paid — cần gói học') + '</button>' +
      '<button class="secondary-btn" id="detailFav" type="button">' +
      (isFav(x.id) ? 'Bỏ yêu thích' : 'Lưu yêu thích') + '</button>' +
      '<button class="secondary-btn" id="detailCopy" type="button">Sao chép thông tin</button>' +
      '</div>' +
      '<p class="detail-preview-note">Xem trước giới hạn theo độ dài file (trang / thời lượng video). Tải về để xem đủ.</p>' +
      '</div></div>';

    const rightHtml =
      '<div class="detail-side detail-side-preview">' +
      '<div class="detail-preview-head">' +
      '<span>Xem trước (tối đa 4 trang)</span>' +
      '<div class="detail-page-nav" id="detailPageNav" hidden>' +
      '<button type="button" class="secondary-btn" id="detailPagePrev" aria-label="Trang trước">‹</button>' +
      '<span id="detailPageLabel">Trang 1</span>' +
      '<button type="button" class="secondary-btn" id="detailPageNext" aria-label="Trang sau">›</button>' +
      '</div></div>' +
      '<div class="detail-preview-body" id="detailPreviewBody">' +
      '<div class="detail-preview-empty">Đang tải xem trước…</div>' +
      '</div></div>';

    m.classList.add('open');
    m.innerHTML =
      '<div class="search-box detail-box detail-box-split">' +
      '<button class="close" id="detailClose" type="button"><i class="cil-x"></i></button>' +
      '<div class="detail-split">' + leftHtml + rightHtml + '</div></div>';

    const body = m.querySelector('#detailPreviewBody');
    const nav = m.querySelector('#detailPageNav');
    const pageLabel = m.querySelector('#detailPageLabel');
    const btnPrev = m.querySelector('#detailPagePrev');
    const btnNext = m.querySelector('#detailPageNext');

    let page = 1;
    let pageCount = 1;
    let pdfDoc = null;

    function setPageUi() {
      if (pageLabel) pageLabel.textContent = 'Trang ' + page + (pageCount > 1 ? ' / ' + pageCount : '');
      if (btnPrev) btnPrev.disabled = page <= 1;
      if (btnNext) btnNext.disabled = page >= pageCount;
    }

    function ensurePdfJs() {
      if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
      return new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        s.onload = () => {
          try {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc =
              'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            resolve(window.pdfjsLib);
          } catch (e) { reject(e); }
        };
        s.onerror = () => reject(new Error('Không tải được PDF.js'));
        document.head.appendChild(s);
      });
    }

    async function paintPdfPage() {
      if (!pdfDoc) return;
      const canvas = body.querySelector('#detailPdfCanvas');
      if (!canvas) return;
      const wrap = body.querySelector('.detail-pdf-wrap') || body;
      const pg = await pdfDoc.getPage(page);
      const unscaled = pg.getViewport({ scale: 1 });
      // Chừa padding, scale theo cả chiều rộng + chiều cao để vừa khung và căn giữa
      const pad = 32;
      const boxW = Math.max(200, (wrap.clientWidth || body.clientWidth || 480) - pad);
      const boxH = Math.max(200, (wrap.clientHeight || body.clientHeight || 400) - pad);
      const scale = Math.min(2, boxW / unscaled.width, boxH / unscaled.height);
      const viewport = pg.getViewport({ scale: Math.max(0.25, scale) });
      const ctx = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      // Giữ tỉ lệ, không kéo full width — để CSS căn giữa
      canvas.style.width = viewport.width + 'px';
      canvas.style.height = viewport.height + 'px';
      canvas.style.maxWidth = '100%';
      canvas.style.maxHeight = '100%';
      await pg.render({ canvasContext: ctx, viewport }).promise;
      setPageUi();
    }

    async function renderPreview() {
      if (!x.blob) {
        body.innerHTML = '<div class="detail-preview-empty">Không có file để xem trước.<br>Hãy tải xuống nếu có.</div>';
        return;
      }
      if (isImg) {
        body.innerHTML = '<div class="detail-preview-img"><img src="' + blobUrl + '" alt=""></div>';
        return;
      }
      if (isAud) {
        body.innerHTML = '<div class="detail-preview-audio"><audio controls src="' + blobUrl + '"></audio></div>';
        return;
      }
      if (isVid) {
        const limitSecHolder = { v: 2 * 60 };
        body.innerHTML =
          '<div class="detail-preview-limit" id="detailVideoLimit">Đang đọc thời lượng video…</div>' +
          '<div class="detail-preview-video" style="display:flex;justify-content:center;padding:12px;background:#0f172a">' +
          '<video id="detailVideo" controls playsinline style="max-width:100%;max-height:min(58vh,520px);border-radius:8px;background:#000" src="' + blobUrl + '"></video>' +
          '</div>';
        const video = body.querySelector('#detailVideo');
        const limEl = body.querySelector('#detailVideoLimit');
        const applyLimit = () => {
          const dur = video.duration;
          if (!isFinite(dur) || dur <= 0) return;
          const limit = previewVideoSeconds(dur);
          limitSecHolder.v = limit;
          const totalMin = Math.round(dur / 60);
          const prevMin = Math.round(limit / 60);
          if (limEl) {
            limEl.innerHTML = 'Video ~<b>' + totalMin + ' phút</b> — xem trước tối đa <b>' +
              prevMin + ' phút</b> (' + fmtPreviewTime(limit) + '). Tải về để xem đủ.';
          }
        };
        video.addEventListener('loadedmetadata', applyLimit);
        video.addEventListener('timeupdate', () => {
          const lim = limitSecHolder.v;
          if (video.currentTime >= lim) {
            video.currentTime = lim;
            video.pause();
            if (limEl && !limEl.dataset.hit) {
              limEl.dataset.hit = '1';
              limEl.innerHTML = 'Đã hết thời lượng xem trước (<b>' + fmtPreviewTime(lim) +
                '</b>). Hãy <b>Tải xuống</b> để xem toàn bộ video.';
            }
          }
        });
        // Chặn tua quá giới hạn
        video.addEventListener('seeking', () => {
          const lim = limitSecHolder.v;
          if (video.currentTime > lim) video.currentTime = lim;
        });
        return;
      }
      if (isPdf) {
        try {
          const pdfjsLib = await ensurePdfJs();
          const ab = await x.blob.arrayBuffer();
          pdfDoc = await pdfjsLib.getDocument({ data: ab }).promise;
          const totalAll = pdfDoc.numPages || 1;
          pageCount = previewPageLimit(totalAll);
          page = 1;
          nav.hidden = false;
          body.innerHTML =
            '<div class="detail-preview-limit">Xem trước trên web tối đa <b>' + pageCount +
            '</b> / ' + totalAll + ' trang. Tải về để xem đủ.</div>' +
            '<div class="detail-pdf-wrap"><canvas id="detailPdfCanvas" class="detail-pdf-canvas"></canvas></div>';
          setPageUi();
          await paintPdfPage();
          btnPrev.onclick = async () => {
            if (page <= 1) return;
            page--;
            await paintPdfPage();
          };
          btnNext.onclick = async () => {
            if (page >= pageCount) return;
            page++;
            await paintPdfPage();
          };
          return;
        } catch (err) {
          body.innerHTML =
            '<div class="detail-preview-empty">Không xem trước PDF trên web được.<br>' +
            esc(String(err && err.message || err)) +
            '<br>Hãy <b>Tải xuống</b> để mở file.</div>';
          return;
        }
      }
      if (isText) {
        try {
          const text = await x.blob.text();
          let pages = splitTextPages(text, 1800);
          const totalAll = pages.length;
          pages = pages.slice(0, previewPageLimit(pages.length));
          pageCount = Math.max(1, pages.length);
          page = 1;
          nav.hidden = pageCount > 1 ? false : true;
          setPageUi();
          body.innerHTML =
            (totalAll > pageCount
              ? '<div class="detail-preview-limit">Xem trước ' + pageCount + '/' + totalAll + ' trang. Tải về để xem đủ.</div>'
              : '') +
            '<pre class="detail-preview-text" id="detailTextPage"></pre>';
          const pre = body.querySelector('#detailTextPage');
          const paint = () => { pre.textContent = pages[page - 1] || ''; setPageUi(); };
          paint();
          btnPrev.onclick = () => { if (page > 1) { page--; paint(); } };
          btnNext.onclick = () => { if (page < pageCount) { page++; paint(); } };
          return;
        } catch (_) {
          body.innerHTML = '<div class="detail-preview-empty">Không đọc được nội dung văn bản.</div>';
          return;
        }
      }
      if (isDocx) {
        try {
          await ensureMammoth();
          const ab = await x.blob.arrayBuffer();
          const result = await window.mammoth.convertToHtml({ arrayBuffer: ab });
          const html = result.value || '<p>(Trống)</p>';
          let pages = splitHtmlPages(html, 1200);
          const totalAll = pages.length;
          pages = pages.slice(0, previewPageLimit(pages.length));
          pageCount = Math.max(1, pages.length);
          page = 1;
          nav.hidden = false;
          setPageUi();
          body.innerHTML =
            (totalAll > pageCount
              ? '<div class="detail-preview-limit">Xem trước ' + pageCount + '/' + totalAll + ' trang. Tải về để xem đủ.</div>'
              : '<div class="detail-preview-limit">Xem trước tối đa 4 trang.</div>') +
            '<div class="detail-preview-doc" id="detailDocPage"></div>';
          const box = body.querySelector('#detailDocPage');
          const paint = () => { box.innerHTML = pages[page - 1] || ''; setPageUi(); };
          paint();
          btnPrev.onclick = () => { if (page > 1) { page--; paint(); } };
          btnNext.onclick = () => { if (page < pageCount) { page++; paint(); } };
          return;
        } catch (err) {
          body.innerHTML =
            '<div class="detail-preview-empty">Không xem trước được file Word này.<br>' +
            esc(String(err && err.message || err)) + '<br>Hãy dùng <b>Tải xuống</b>.</div>';
          return;
        }
      }

      if (isPpt) {
        try {
          // .ppt cũ (binary) khó parse trên web — ưu tiên .pptx
          if (/\.ppt$/i.test(fname) && !/\.pptx$/i.test(fname)) {
            body.innerHTML =
              '<div class="detail-preview-empty">File <b>.ppt</b> (định dạng cũ) chưa hỗ trợ xem trước trên web.<br>' +
              'Hãy chuyển sang <b>.pptx</b> hoặc dùng <b>Tải xuống</b>.</div>';
            return;
          }
          await ensureJsZip();
          const ab = await x.blob.arrayBuffer();
          const zip = await window.JSZip.loadAsync(ab);
          const slideNames = Object.keys(zip.files)
            .filter((n) => /^ppt\/slides\/slide\d+\.xml$/i.test(n))
            .sort((a, b) => {
              const na = parseInt((a.match(/slide(\d+)/i) || [])[1] || '0', 10);
              const nb = parseInt((b.match(/slide(\d+)/i) || [])[1] || '0', 10);
              return na - nb;
            });
          if (!slideNames.length) {
            body.innerHTML =
              '<div class="detail-preview-empty">Không tìm thấy slide trong file PowerPoint.<br>Hãy <b>Tải xuống</b> để mở bằng PowerPoint / LibreOffice.</div>';
            return;
          }
          const totalAll = slideNames.length;
          pageCount = previewPageLimit(totalAll);
          page = 1;
          nav.hidden = pageCount > 1 ? false : true;
          const slides = [];
          for (let i = 0; i < pageCount; i++) {
            const xml = await zip.files[slideNames[i]].async('string');
            const texts = [];
            const re = /<a:t[^>]*>([\s\S]*?)<\/a:t>/g;
            let m;
            while ((m = re.exec(xml))) {
              const t = String(m[1] || '')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'")
                .trim();
              if (t) texts.push(t);
            }
            slides.push({
              index: i + 1,
              html: texts.length
                ? texts.map((t) => '<p>' + esc(t) + '</p>').join('')
                : '<p class="muted">(Slide không có chữ — có thể chỉ gồm hình ảnh)</p>'
            });
          }
          setPageUi();
          body.innerHTML =
            '<div class="detail-preview-limit">PowerPoint: xem trước <b>' + pageCount +
            '</b> / ' + totalAll + ' slide (giới hạn theo độ dài). Tải về để xem đủ.</div>' +
            '<div class="detail-preview-ppt" id="detailPptPage"></div>';
          const box = body.querySelector('#detailPptPage');
          const paint = () => {
            const s = slides[page - 1];
            if (!s) { box.innerHTML = ''; return; }
            box.innerHTML =
              '<div class="ppt-slide-card">' +
              '<div class="ppt-slide-num">Slide ' + s.index + ' / ' + totalAll + '</div>' +
              '<div class="ppt-slide-body">' + s.html + '</div>' +
              '</div>';
            setPageUi();
          };
          paint();
          btnPrev.onclick = () => { if (page > 1) { page--; paint(); } };
          btnNext.onclick = () => { if (page < pageCount) { page++; paint(); } };
          return;
        } catch (err) {
          body.innerHTML =
            '<div class="detail-preview-empty">Không xem trước được file PowerPoint này.<br>' +
            esc(String(err && err.message || err)) +
            '<br>Hãy dùng <b>Tải xuống</b>.</div>';
          return;
        }
      }
      body.innerHTML =
        '<div class="detail-preview-empty">Định dạng này chưa hỗ trợ xem trước trên web.<br>' +
        'Dùng nút <b>Tải xuống</b> để mở bằng ứng dụng trên máy.</div>';
    }

    function splitTextPages(text, size) {
      const t = String(text || '');
      if (!t) return [''];
      const out = [];
      for (let i = 0; i < t.length; i += size) out.push(t.slice(i, i + size));
      return out;
    }

    function splitHtmlPages(html, approxChars) {
      const parts = String(html || '').split(/(?=<p\b|<h[1-6]\b|<table\b|<ul\b|<ol\b)/i).filter(Boolean);
      if (!parts.length) return [html || ''];
      const pages = [];
      let buf = '';
      for (const part of parts) {
        if (buf.length + part.length > approxChars && buf) {
          pages.push(buf);
          buf = part;
        } else buf += part;
      }
      if (buf) pages.push(buf);
      return pages.length ? pages : [html];
    }

    function ensureMammoth() {
      if (window.mammoth) return Promise.resolve();
      return new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://unpkg.com/mammoth@1.8.0/mammoth.browser.min.js';
        s.onload = () => resolve();
        s.onerror = () => reject(new Error('Không tải được thư viện xem Word'));
        document.head.appendChild(s);
      });
    }

    function ensureJsZip() {
      if (window.JSZip) return Promise.resolve();
      return new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://unpkg.com/jszip@3.10.1/dist/jszip.min.js';
        s.onload = () => resolve();
        s.onerror = () => reject(new Error('Không tải được thư viện đọc PPTX'));
        document.head.appendChild(s);
      });
    }

    function closeDetailModal() {
      try { m.classList.remove('open'); } catch (_) {}
      // Dừng video nếu đang phát
      try {
        m.querySelectorAll('video, audio').forEach((el) => {
          try { el.pause(); el.removeAttribute('src'); el.load?.(); } catch (_) {}
        });
      } catch (_) {}
      if (blobUrl) {
        try { URL.revokeObjectURL(blobUrl); } catch (_) {}
      }
      if (coverUrl) {
        try { URL.revokeObjectURL(coverUrl); } catch (_) {}
      }
    }

    // Đóng ngay khi bấm X (kể cả click vào icon bên trong)
    const closeBtn = m.querySelector('#detailClose');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeDetailModal();
      }, true);
    }
    // Bấm nền mờ bên ngoài cũng đóng
    m.addEventListener('click', (e) => {
      if (e.target === m) closeDetailModal();
    });
    // Esc đã có ở modal() — bổ sung lần nữa cho chắc
    const onEsc = (e) => {
      if (e.key === 'Escape' && m.classList.contains('open')) {
        closeDetailModal();
        document.removeEventListener('keydown', onEsc, true);
      }
    };
    document.addEventListener('keydown', onEsc, true);

    const dl = m.querySelector('#detailDownload');
    if (dl) dl.onclick = () => downloadFile(x.id);
    const fv = m.querySelector('#detailFav');
    if (fv) fv.onclick = () => { toggleFav(x.id); closeDetailModal(); };
    const cp = m.querySelector('#detailCopy');
    if (cp) cp.onclick = async () => {
      await navigator.clipboard?.writeText(`${x.name}\n${CATS[x.cat] || x.cat}\n${x.fileName || ''}`);
      notify('Đã sao chép thông tin tài nguyên.');
    };

    renderPreview();
  });
}

addEventListener('click',e=>{const id=e.target.closest?.('[data-open-id]')?.dataset.openId;if(id){e.preventDefault();downloadFile(isNaN(id)?id:Number(id))}const f=e.target.closest?.('[data-fav-id]');if(f){e.preventDefault();toggleFav(isNaN(f.dataset.favId)?f.dataset.favId:Number(f.dataset.favId))}const d=e.target.closest?.('[data-detail-id]');if(d){e.preventDefault();detailOf(isNaN(d.dataset.detailId)?d.dataset.detailId:Number(d.dataset.detailId))}const lk=e.target.closest?.('[data-like-id]');if(lk){e.preventDefault();toggleLike(isNaN(lk.dataset.likeId)?lk.dataset.likeId:Number(lk.dataset.likeId),lk)}});
async function renderCatalog(){const root=$('#catalogRoot');if(!root)return;const cat=root.dataset.cat;const title=CATS[cat]||'Tài nguyên';$('#catTitle').textContent=title;$('#catDesc').textContent='Danh sách '+title.toLowerCase()+' được Thầy Gia Huy tổng hợp và cập nhật. Lọc, sắp xếp và lưu vào kho tài liệu cá nhân.';let items=(await getAll('files')).filter(x=>x.cat===cat);const search=($('#catalogSearch')?.value||'').trim().toLowerCase();const sort=$('#catalogSort')?.value||'new';const onlyFav=$('#onlyFav')?.checked;if(search)items=items.filter(x=>[x.name,x.desc,x.fileName].join(' ').toLowerCase().includes(search));if(onlyFav)items=items.filter(x=>isFav(x.id));items.sort((a,b)=>sort==='name'?a.name.localeCompare(b.name,'vi'):sort==='downloads'?downloadCount(b.id)-downloadCount(a.id):(b.created||0)-(a.created||0));$('#catCount').textContent=`${items.length} mục${onlyFav?' • yêu thích':''}`;const list=$('#catalogList');list.innerHTML=items.length?items.map(card).join(''):'<div class="empty-state"><b>Không có kết quả phù hợp.</b><br><small>Thử đổi từ khóa hoặc bỏ bộ lọc yêu thích.</small></div>';const hash=location.hash.replace('#resource-','');if(hash){const el=document.getElementById('resource-'+CSS.escape(decodeURIComponent(hash)));el?.scrollIntoView({behavior:'smooth',block:'center'})}}
$('#catalogSearch')?.addEventListener('input',()=>renderCatalog());$('#catalogSort')?.addEventListener('change',()=>renderCatalog());$('#onlyFav')?.addEventListener('change',()=>renderCatalog());$('#refreshCatalog')?.addEventListener('click',()=>renderCatalog());
window.enterAdminPanel = function enterAdminPanel(){const f=$('#adminForm'),l=$('#adminLoader'),p=$('#adminPanel');f?.classList.add('hidden');p?.classList.add('hidden');l?.classList.remove('hidden');const bar=$('#adminLoaderBar');if(bar){bar.style.transition='none';bar.style.width='0%';requestAnimationFrame(()=>{bar.style.transition='width .78s cubic-bezier(.2,.7,.3,1)';bar.style.width='100%'})}setTimeout(()=>{l?.classList.add('hidden');p?.classList.remove('hidden');p?.classList.add('panel-enter');renderAdmin('upload');setTimeout(()=>p?.classList.remove('panel-enter'),420)},850)}
window.openAdmin = async function openAdmin(){const m=$('#adminModal');m?.classList.add('open');const admin=localStorage.getItem('giahuy-admin')==='1';if(admin){enterAdminPanel()}else{$('#adminForm')?.classList.remove('hidden');$('#adminPanel')?.classList.add('hidden');$('#adminLoader')?.classList.add('hidden')}}
$('#adminForm')?.addEventListener('submit',e=>{e.preventDefault();if($('#adminPassword').value!=='giahuy-admin'){notify('Mật khẩu Admin không đúng.','error');return}localStorage.setItem('giahuy-admin','1');notify('Đăng nhập quản trị thành công.');enterAdminPanel()});
$('#logoutAdmin')?.addEventListener('click',()=>{localStorage.removeItem('giahuy-admin');$('#adminPanel')?.classList.add('hidden');$('#adminLoader')?.classList.add('hidden');$('#adminForm')?.classList.remove('hidden');notify('Đã đăng xuất.')});
$('#changeAvatarBtn')?.addEventListener('click',()=>$('#avatarInput')?.click());$('#avatarInput')?.addEventListener('change',e=>{const f=e.target.files?.[0];if(!f)return;if(f.size>8*1024*1024){notify('Avatar tối đa 8MB.','error');return}const r=new FileReader();r.onload=()=>{localStorage.setItem('giahuy-avatar',r.result);avatarSet(r.result);notify('Đã đổi avatar.')} ;r.readAsDataURL(f)});$('#resetAvatarBtn')?.addEventListener('click',()=>{localStorage.removeItem('giahuy-avatar');avatarSet(avatarDefault);notify('Đã khôi phục avatar mặc định.')});
window.renderAdmin = async function renderAdmin(tab){const w=$('#adminWorkspace');if(!w)return;const files=await getAll('files'),mus=await getAll('music');$$('.admin-tab').forEach(b=>b.classList.toggle('active',b.dataset.adminTab===tab));if(tab==='upload'){w.innerHTML=`<div class="upload-grid"><div class="upload-box"><form class="upload-form" id="uploadResource"><label>Tên hiển thị<input name="name" placeholder="Ví dụ: ThaiCuc 1.0"></label><label>Phân loại<select name="cat">${Object.entries(CATS).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></label><label>Mô tả<textarea name="desc" placeholder="Mô tả ngắn"></textarea></label><label class="check-line"><input name="featured" type="checkbox"> Đánh dấu tài nguyên nổi bật</label><div class="access-pick" id="accessPickBox"><span class="access-pick-title">Loại tài liệu (theo quyền được cấp)</span><label class="check-line access-opt" id="accessOptFree"><input type="radio" name="access" value="free" checked> <b>Free</b> — mọi người xem/tải</label><label class="check-line access-opt" id="accessOptPaid"><input type="radio" name="access" value="paid"> <b>Paid</b> — cần gói học (GV miễn phí toàn bộ)</label><p class="upload-meta" id="accessPermHint" style="margin:6px 0 0"></p></div><div class="video-cover-picker" id="videoCoverPicker" hidden><label>Ảnh bìa video<input name="cover" type="file" accept="image/*" hidden><button type="button" class="secondary-btn" data-pick-cover>Chọn ảnh bìa</button><span data-cover-label>Chưa chọn ảnh</span></label><img data-cover-preview alt="Xem trước ảnh bìa" hidden></div><label class="dropzone"><input name="file" type="file" multiple hidden><strong>Chọn file / kéo thả</strong><span>Jar, zip, rar, png, jpg, pdf, docx, json, txt...</span></label><button class="primary-btn" type="submit">Upload & phân vào list</button><p class="upload-meta">File được lưu vào IndexedDB của trình duyệt này.</p></form></div><div class="library-box"><div class="section-head"><div><h2>Phân loại & nổi bật</h2><p>Upload một lần → tự vào đúng trang + có thể ghim lên trang chủ.</p></div></div><div class="admin-stat-grid">${Object.entries(CATS).map(([k,v])=>`<div class="admin-stat"><b>${files.filter(x=>x.cat===k).length}</b><span>${v}</span></div>`).join('')}</div><div class="admin-tip">Mẹo: đánh dấu <strong>Nổi bật</strong> cho các file quan trọng để website ưu tiên hiển thị chúng.</div></div></div>`;const form=$('#uploadResource'),input=form.querySelector('input[name=file]'),coverInput=form.querySelector('input[name=cover]'),coverWrap=form.querySelector('#videoCoverPicker'),coverPreview=form.querySelector('[data-cover-preview]'),coverLabel=form.querySelector('[data-cover-label]');
try{
  const allowFree=canUploadAccess('free');
  const allowPaid=canUploadAccess('paid');
  const optFree=form.querySelector('#accessOptFree');
  const optPaid=form.querySelector('#accessOptPaid');
  const hint=form.querySelector('#accessPermHint');
  if(optFree)optFree.style.display=allowFree?'':'none';
  if(optPaid)optPaid.style.display=allowPaid?'':'none';
  if(!allowFree&&allowPaid){const r=form.querySelector('input[name=access][value=paid]');if(r)r.checked=true}
  if(hint){
    if(!allowFree&&!allowPaid)hint.textContent='Bạn chưa được cấp quyền Upload Free/Paid — liên hệ admin.';
    else if(!allowPaid)hint.textContent='Chưa có quyền Upload Paid (cấp trong Phân quyền).';
    else if(!allowFree)hint.textContent='Chưa có quyền Upload Free.';
    else hint.textContent='Quyền upload: Free'+(allowPaid?' + Paid':'')+'.';
  }
}catch(_){}
form.querySelector('.dropzone').addEventListener('click',()=>input.click());input.addEventListener('change',()=>{form.querySelector('.dropzone span').textContent=input.files.length?`${input.files.length} file đã chọn`:'Chưa chọn file';const hasVideo=[...input.files].some(f=>f.type.startsWith('video/'));if(coverWrap)coverWrap.hidden=!hasVideo;if(!hasVideo&&coverInput)coverInput.value='';});coverWrap?.querySelector('[data-pick-cover]')?.addEventListener('click',()=>coverInput?.click());coverInput?.addEventListener('change',()=>{const f=coverInput.files?.[0];if(coverLabel)coverLabel.textContent=f?.name||'Chưa chọn ảnh';if(f&&coverPreview){coverPreview.src=URL.createObjectURL(f);coverPreview.hidden=false;}});const dz=form.querySelector('.dropzone');['dragenter','dragover'].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.add('dragging')}));['dragleave','drop'].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.remove('dragging')}));dz.addEventListener('drop',e=>{const dt=new DataTransfer();[...e.dataTransfer.files].forEach(f=>dt.items.add(f));input.files=dt.files;input.dispatchEvent(new Event('change',{bubbles:true}))});form.addEventListener('submit',async e=>{e.preventDefault();const fs=[...input.files];if(!fs.length){notify('Chưa chọn file.','error');return}const selectedCover=coverInput?.files?.[0]||null;if(fs.some(f=>f.type.startsWith('video/'))&&!selectedCover){notify('Video cần chọn ảnh bìa.','error');return}if(selectedCover&&(!selectedCover.type.startsWith('image/')||selectedCover.size>8*1024*1024)){notify('Ảnh bìa phải là ảnh và nhỏ hơn 8 MB.','error');return}const fd=new FormData(form);const accType=fd.get('access')==='paid'?'paid':'free';if(!canUploadAccess(accType)){notify(accType==='paid'?'Không có quyền upload tài liệu Paid.':'Không có quyền upload tài liệu Free.','error');return}for(const f of fs){await add('files',{name:fs.length===1?(fd.get('name')||f.name.replace(/\.[^.]+$/,'')):f.name.replace(/\.[^.]+$/,''),cat:fd.get('cat'),desc:fd.get('desc'),fileName:f.name,mime:f.type,size:f.size,blob:f,created:Date.now(),builtin:false,featured:fd.get('featured')==='on',coverBlob:(f.type.startsWith('video/')&&coverInput?.files?.[0])?coverInput.files[0]:null,coverMime:(f.type.startsWith('video/')&&coverInput?.files?.[0])?coverInput.files[0].type:'',coverFileName:(f.type.startsWith('video/')&&coverInput?.files?.[0])?coverInput.files[0].name:'',access:(fd.get('access')==='paid'?'paid':'free'),creatorName:(()=>{try{const s=JSON.parse(localStorage.getItem('giahuy-session')||'null');if(!s)return'Admin';if(s.role==='admin'){try{return JSON.parse(localStorage.getItem('giahuy-admin-profile')||'{}').username||s.username||'Quản trị viên'}catch{return s.username||'Quản trị viên'}}return s.username||'—'}catch{return'—'}})(),creatorRole:(()=>{try{const s=JSON.parse(localStorage.getItem('giahuy-session')||'null');if(!s)return'quản trị';return s.role==='teacher'?'giáo viên':s.role==='manager'?'quản lí':'quản trị'}catch{return'quản trị'}})()})}notify(`Đã upload ${fs.length} file.`);form.reset();renderAdmin('upload');renderCatalog();renderHome()})}
else if(tab==='library'){w.innerHTML=`<div class="library-box"><div class="filter-row">${Object.entries(CATS).map(([k,v])=>`<button class="filter-btn" data-lib-filter="${k}">${v}</button>`).join('')}<button class="filter-btn" data-lib-filter="featured"><i class=\"cil-star\"></i> Nổi bật</button></div><div class="library-list" id="adminLibrary">${files.map(x=>`<div class="library-row"><span class="file-icon">${iconFor(x)}</span><div><b>${esc(x.name)}</b><small>${esc(CATS[x.cat])} • ${esc(x.fileName||'')} • ${fmtSize(x.size)} • <i class="cil-cloud-download"></i> ${downloadCount(x.id)}</small></div><div class="library-actions"><button data-admin-download="${x.id}">Tải</button>${x.builtin?'':'<button data-admin-delete="'+x.id+'">Xóa</button>'}</div></div>`).join('')}</div></div>`;w.querySelectorAll('[data-lib-filter]').forEach(b=>b.addEventListener('click',()=>{const c=b.dataset.libFilter;w.querySelectorAll('.library-row').forEach(r=>{const txt=r.innerText;r.style.display=c==='featured'?(txt.includes('Nổi bật')?'grid':'none'):(txt.includes(CATS[c])?'grid':'none')})}));w.querySelectorAll('[data-admin-download]').forEach(b=>b.addEventListener('click',()=>downloadFile(isNaN(b.dataset.adminDownload)?b.dataset.adminDownload:Number(b.dataset.adminDownload))));w.querySelectorAll('[data-admin-delete]').forEach(b=>b.addEventListener('click',async()=>{if(confirm('Xóa mục này?')){await del('files',Number(b.dataset.adminDelete));renderAdmin('library');renderCatalog();renderHome()}}))}
else if(tab==='music'){w.innerHTML=`<div class="upload-box"><form class="upload-form" id="uploadMusic"><label>Tên bài nhạc<input name="name" required placeholder="Tên bài nhạc"></label><label>Nghệ sĩ / ghi chú<input name="artist" placeholder="giahuy music"></label><label class="dropzone"><input name="file" type="file" accept="audio/*" hidden><strong>Chọn file nhạc</strong><span>MP3 / WAV / OGG / M4A...</span></label><button class="primary-btn" type="submit">Thêm vào playlist</button></form></div><div class="library-box music-library"><div class="library-list">${mus.map(x=>`<div class="library-row"><span class="file-icon"><i class="cil-music-note"></i></span><div><b>${esc(x.name)}</b><small>${esc(x.artist||'giahuy')} • ${fmtSize(x.size)}</small></div><div class="library-actions"><button data-play-admin="${x.id}">Nghe</button><button data-del-music="${x.id}">Xóa</button></div></div>`).join('')||'<div class="empty-state">Chưa có bài nhạc.</div>'}</div></div>`;const form=$('#uploadMusic'),inp=form.querySelector('input[name=file]');form.querySelector('.dropzone').addEventListener('click',()=>inp.click());inp.addEventListener('change',()=>form.querySelector('.dropzone span').textContent=inp.files[0]?.name||'');form.addEventListener('submit',async e=>{e.preventDefault();const f=inp.files?.[0];if(!f){notify('Chưa chọn file nhạc.','error');return}const fd=new FormData(form);await add('music',{name:fd.get('name'),artist:fd.get('artist'),fileName:f.name,mime:f.type,size:f.size,blob:f,created:Date.now()});notify('Đã thêm bài nhạc vào playlist.');renderAdmin('music');renderMusic();renderHome()});w.querySelectorAll('[data-del-music]').forEach(b=>b.addEventListener('click',async()=>{await del('music',Number(b.dataset.delMusic));renderAdmin('music');renderMusic();renderHome()}));w.querySelectorAll('[data-play-admin]').forEach(b=>b.addEventListener('click',()=>playTrack(Number(b.dataset.playAdmin))))}
else {const totalBytes=files.reduce((a,x)=>a+(x.size||0),0)+mus.reduce((a,x)=>a+(x.size||0),0);const favs=files.filter(x=>isFav(x.id)).length;const downloads=files.reduce((a,x)=>a+downloadCount(x.id),0);w.innerHTML=`<div class="admin-stat-grid"><div class="admin-stat"><b>${files.length}</b><span>Tổng tài nguyên</span></div><div class="admin-stat"><b>${mus.length}</b><span>Bài nhạc</span></div><div class="admin-stat"><b>${downloads}</b><span>Lượt tải</span></div><div class="admin-stat"><b>${fmtSize(totalBytes)}</b><span>Dung lượng</span></div></div><div class="library-box"><h3 class="admin-section-title">Bảng điều khiển</h3><div class="admin-mini-grid">${Object.entries(CATS).map(([k,v])=>`<div class="mini-stat"><span>${esc(v)}</span><b>${files.filter(x=>x.cat===k).length}</b></div>`).join('')}</div><div class="admin-tip">Yêu thích: ${favs} mục • Nổi bật: ${files.filter(x=>x.featured).length} mục • Đăng nhập Admin hiện chỉ bảo vệ giao diện local.<br><br><strong>Mẹo:</strong> dùng banner thông báo bên dưới để đăng trạng thái bảo trì, cập nhật hoặc tin mới.</div><div class="upload-box" style="margin-top:12px"><form id="announceForm" class="upload-form"><label>Thông báo trang chủ<textarea name="text" placeholder="Ví dụ: Đang cập nhật bài giảng mới..."></textarea></label><div class="card-actions"><button class="primary-btn" type="submit">Lưu thông báo</button><button class="secondary-btn" type="button" id="clearAnnouncement">Xóa banner</button></div></form></div></div>`;$('#announceForm').addEventListener('submit',e=>{e.preventDefault();localStorage.setItem('giahuy-announcement',new FormData(e.currentTarget).get('text')||'');applyAnnouncement();notify('Đã cập nhật banner.');});$('#clearAnnouncement').addEventListener('click',()=>{localStorage.removeItem('giahuy-announcement');applyAnnouncement();notify('Đã xóa banner.')})}}
$$('.admin-tab').forEach(b=>b.addEventListener('click',()=>renderAdmin(b.dataset.adminTab)));
const audio=new Audio();audio.volume=.8;let currentTrack=null;const fmtTime=s=>{s=Math.max(0,Math.floor(s||0));return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`};
function syncMusicButtons(){const playing=!audio.paused&&!!audio.src;const main=$('#musicPlay');if(main){main.innerHTML=playing?'<i class="cil-media-pause"></i>':'<i class="cil-media-play"></i>';main.title=playing?'Dừng nhạc':'Phát nhạc';main.setAttribute('aria-label',playing?'Dừng nhạc':'Phát nhạc')}$$('[data-track]').forEach(b=>{const id=Number(b.dataset.track);const active=id===Number(currentTrack);b.classList.toggle('active',active);const icon=b.querySelector('.track-icon');if(icon)icon.innerHTML=active&&playing?'<i class="cil-media-pause"></i>':'<i class="cil-media-play"></i>';b.setAttribute('aria-label',active&&playing?`Dừng ${b.dataset.trackName||'bài nhạc'}`:`Phát ${b.dataset.trackName||'bài nhạc'}`)})}
async function renderMusic(){const list=$('#musicList');if(!list)return;const mus=await getAll('music');if(!mus.length){list.innerHTML='<div class="empty-state" style="padding:18px">Admin chưa upload nhạc. Vào Admin → Nhạc để thêm playlist.</div>';syncMusicButtons();return}list.innerHTML=mus.map(x=>`<button class="track-btn ${currentTrack===x.id?'active':''}" data-track="${x.id}" data-track-name="${esc(x.name)}"><span class="track-icon">${currentTrack===x.id&&!audio.paused?'<i class="cil-media-pause"></i>':'<i class="cil-media-play"></i>'}</span><span class="track-copy"><b>${esc(x.name)}</b><small>${esc(x.artist||'giahuy')}</small></span></button>`).join('');list.querySelectorAll('[data-track]').forEach(b=>b.addEventListener('click',async()=>{const id=Number(b.dataset.track);if(id===Number(currentTrack)){if(audio.paused){try{await audio.play()}catch(e){}}else audio.pause()}else await playTrack(id,true)}));if(!currentTrack)await playTrack(mus[0].id,false);syncMusicButtons()}
async function playTrack(id,autoplay=true){const x=await blobOf(id,'music');if(!x?.blob)return;const url=URL.createObjectURL(x.blob);if(audio.__url)URL.revokeObjectURL(audio.__url);audio.__url=url;audio.src=url;currentTrack=x.id;const n=$('#nowMusic'),a=$('#nowArtist');if(n)n.textContent=x.name;if(a)a.textContent=x.artist||'giahuy';localStorage.setItem('giahuy-last-track',x.id);syncMusicButtons();if(autoplay){try{await audio.play()}catch(e){}}renderMusic()}
$('#musicPlay')?.addEventListener('click',async()=>{if(!audio.src){const m=await getAll('music');if(m[0])return playTrack(m[0].id,true);return}if(audio.paused){try{await audio.play()}catch(e){}}else audio.pause()});$('#musicPrev')?.addEventListener('click',async()=>{const m=await getAll('music');if(!m.length)return;const i=Math.max(0,m.findIndex(x=>x.id===currentTrack)-1);playTrack(m[i].id)});$('#musicNext')?.addEventListener('click',async()=>{const m=await getAll('music');if(!m.length)return;const i=(m.findIndex(x=>x.id===currentTrack)+1)%m.length;playTrack(m[i].id)});$('#musicVolume')?.addEventListener('input',e=>audio.volume=e.target.value);$('#musicSeek')?.addEventListener('input',e=>{if(audio.duration)audio.currentTime=(e.target.value/100)*audio.duration});audio.addEventListener('play',()=>syncMusicButtons());audio.addEventListener('pause',()=>syncMusicButtons());audio.addEventListener('timeupdate',()=>{const seek=$('#musicSeek');if(seek&&audio.duration)seek.value=(audio.currentTime/audio.duration)*100;const c=$('#musicCurrent');if(c)c.textContent=fmtTime(audio.currentTime)});audio.addEventListener('loadedmetadata',()=>{const d=$('#musicDuration');if(d)d.textContent=fmtTime(audio.duration)});audio.addEventListener('ended',async()=>{const m=await getAll('music');if(!m.length)return;const i=(m.findIndex(x=>x.id===currentTrack)+1)%m.length;playTrack(m[i].id)});
async function renderHome(){const files=await getAll('files'),mus=await getAll('music');const setText=(id,v)=>{const el=$('#'+id);if(el)el.textContent=v};const by=(cat)=>files.filter(x=>x.cat===cat).length;setText('homePluginCount',by('plugins'));setText('homeAssetCount',by('assets'));setText('homeResourceCount',by('resources'));setText('homeFavCount',files.filter(x=>isFav(x.id)).length);setText('heroTotalCount',files.length);setText('heroMusicCount',mus.length);const g=$('#latestGrid');if(g){const latest=[...files].sort((a,b)=>{const af=a.featured?1:0,bf=b.featured?1:0;return bf-af||(b.created||0)-(a.created||0)}).slice(0,6);g.innerHTML=latest.length?latest.map(card).join(''):'<div class="empty-state">Chưa có tài nguyên mới.</div>'}const h=$('#historyGrid');if(h){const his=JSON.parse(localStorage.getItem('giahuy-history')||'[]');const map=new Map(files.map(x=>[String(x.id),x]));const arr=his.map(x=>map.get(String(x.id))).filter(Boolean).slice(0,4);h.innerHTML=arr.length?arr.map(card).join(''):'<div class="empty-state">Bạn chưa tải tài nguyên nào.</div>'}applyAnnouncement()}
function bumpTotalViews(){const key='giahuy-total-views';let v=Number(localStorage.getItem(key)||0);if(!v)v=8200+Math.floor(Math.random()*3200);v+=1+Math.floor(Math.random()*3);localStorage.setItem(key,String(v));return v}
function fakeOnlineCount(){const curve=[8,6,5,4,4,5,8,14,20,26,30,34,38,40,42,44,46,50,58,68,74,70,55,20];const base=curve[new Date().getHours()]||20;const jitter=Math.floor(Math.random()*9)-4;return Math.max(3,base+jitter)}
function updateFakeStats(){const v=$('#liveVisits');if(v)v.textContent=bumpTotalViews().toLocaleString('vi-VN');const o=$('#heroOnlineCount');if(o)o.textContent=fakeOnlineCount().toLocaleString('vi-VN')}
(async()=>{enhanceStudyUI();ensureDonateUI();await seed();modal();applyAnnouncement();await renderCatalog();await renderHome();await renderMusic();updateFakeStats();setInterval(()=>{const o=$('#heroOnlineCount');if(o)o.textContent=fakeOnlineCount().toLocaleString('vi-VN')},5000)
window.__giahuyAdmin = {
  CATS: typeof CATS !== 'undefined' ? CATS : {},
  getAll: typeof getAll === 'function' ? getAll : null,
  add: typeof add === 'function' ? add : null,
  del: typeof del === 'function' ? del : null,
  seed: typeof seed === 'function' ? seed : null,
  renderAdmin: typeof renderAdmin === 'function' ? renderAdmin : null,
  notify: typeof notify === 'function' ? notify : (m)=>console.log(m),
  esc: typeof esc === 'function' ? esc : (s)=>String(s||'').replace(/[&<>"']/g,c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])),
  fmtSize: typeof fmtSize === 'function' ? fmtSize : (n)=> (n? (n/1024).toFixed(1)+' KB':'0')
};
if (typeof renderAdmin === 'function') window.renderAdmin = renderAdmin;
if (typeof seed === 'function') window.seed = seed;
})();
})();

/* V12 — scroll reveal for professional lecture feel */
(function(){
  const targets = document.querySelectorAll('.music-home, .home-insights, .latest, .history-section, .intro, .section, .page-hero, .resource-cards, .category-grid');
  if (!targets.length || !('IntersectionObserver' in window)) return;
  targets.forEach(el => el.classList.add('reveal-ready'));
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  targets.forEach(el => io.observe(el));
})();

/* V13 — Unified draggable floating action dock */
(function(){
  const HIDE_KEY = 'giahuy-fab-dock-hidden';
  const path = (location.pathname || '').toLowerCase();

  // Vào panel / logout → xoá cờ ẩn để lần sau về trang chủ sẽ hiện lại
  if (path.includes('admin-panel') || path.includes('admin-login') || path.includes('login.html') || path.includes('teacher-login') || path.includes('guest-login') || path.includes('register')) {
    try { sessionStorage.removeItem(HIDE_KEY); } catch (_) {}
  }

  // Trang không cần dock (login/admin)
  if (/admin-panel|admin-login|login\.html|teacher-login|guest-login|register/.test(path)) return;

  if (document.querySelector('.fab-dock')) return;

  // Đã ẩn trong phiên này → không hiện
  try {
    if (sessionStorage.getItem(HIDE_KEY) === '1') return;
  } catch (_) {}

  document.body.classList.add('has-fab-dock');

  const dock = document.createElement('div');
  dock.className = 'fab-dock';
  dock.innerHTML = `
    <div class="fab-dock-handle" title="Kéo để di chuyển • Bấm để ẩn đến hết phiên" aria-label="Ẩn nút nổi"></div>
    <div class="fab-dock-btns">
      <button type="button" class="fab-btn" data-fab="donate" title="Ủng hộ Thầy">
        <span class="fab-ico"><i class="cil-heart"></i></span><span>Ủng hộ Thầy</span>
      </button>
      <button type="button" class="fab-btn primary" data-fab="ticket" title="Đặt câu hỏi">
        <span class="fab-ico"><i class="cil-speech"></i></span><span>Đặt câu hỏi</span>
        <span class="fab-count" id="fabTicketCount">0</span>
      </button>
      <button type="button" class="fab-btn mini" data-fab="top" title="Lên đầu trang">
        <span class="fab-ico"><i class="cil-arrow-top"></i></span>
      </button>
    </div>
  `;
  document.body.appendChild(dock);

  // Sync ticket count from existing launcher if present
  const syncCount = () => {
    const src = document.querySelector('.ticket-launcher .ticket-count, .ticket-count');
    const el = document.getElementById('fabTicketCount');
    if (el && src) el.textContent = src.textContent || '0';
  };
  syncCount();
  setInterval(syncCount, 2000);

  // Actions
  dock.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-fab]');
    if (!btn) return;
    const act = btn.getAttribute('data-fab');
    if (act === 'donate') {
      const open = document.querySelector('[data-open-donate], .donate-fab');
      if (open) open.click();
      else {
        // fallback: try open donate modal
        const m = document.querySelector('.donate-modal');
        if (m) m.classList.add('open');
      }
    } else if (act === 'ticket') {
      const open = document.querySelector('[data-open-ticket-nav], .ticket-launcher');
      if (open) open.click();
    } else if (act === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  // Drag
  const handle = dock.querySelector('.fab-dock-handle');
  let dragging = false, ox = 0, oy = 0;
  const posKey = 'giahuy-fab-dock-pos';

  // Reset bad positions (e.g. drifted over sidebar). Only restore if in safe zone.
  try {
    const saved = JSON.parse(localStorage.getItem(posKey) || 'null');
    const safe = saved
      && typeof saved.x === 'number' && typeof saved.y === 'number'
      && saved.x > 120
      && saved.y > 80
      && saved.x < window.innerWidth - 60
      && saved.y < window.innerHeight - 60;
    if (safe) {
      dock.classList.add('is-custom-pos');
      dock.style.left = saved.x + 'px';
      dock.style.top = saved.y + 'px';
      dock.style.right = 'auto';
      dock.style.bottom = 'auto';
    } else {
      localStorage.removeItem(posKey);
      dock.classList.remove('is-custom-pos');
      dock.style.left = '';
      dock.style.top = '';
      dock.style.right = '';
      dock.style.bottom = '';
    }
  } catch (_) {
    localStorage.removeItem(posKey);
  }

  const onMove = (clientX, clientY) => {
    if (!dragging) return;
    const x = Math.max(8, Math.min(window.innerWidth - dock.offsetWidth - 8, clientX - ox));
    const y = Math.max(8, Math.min(window.innerHeight - dock.offsetHeight - 8, clientY - oy));
    dock.style.left = x + 'px';
    dock.style.top = y + 'px';
    dock.style.right = 'auto';
    dock.style.bottom = 'auto';
  };

  let startX = 0, startY = 0, moved = false;
  handle.addEventListener('pointerdown', (e) => {
    dragging = true;
    moved = false;
    startX = e.clientX;
    startY = e.clientY;
    dock.classList.add('dragging');
    const rect = dock.getBoundingClientRect();
    ox = e.clientX - rect.left;
    oy = e.clientY - rect.top;
    handle.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  handle.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    if (Math.abs(e.clientX - startX) > 6 || Math.abs(e.clientY - startY) > 6) moved = true;
    onMove(e.clientX, e.clientY);
  });
  handle.addEventListener('pointerup', (e) => {
    if (!dragging) return;
    dragging = false;
    dock.classList.remove('dragging');
    // Bấm (không kéo) → ẩn dock đến hết phiên / đến khi vào panel hoặc đăng nhập lại
    if (!moved) {
      try { sessionStorage.setItem(HIDE_KEY, '1'); } catch (_) {}
      dock.style.transition = 'opacity .2s ease, transform .2s ease';
      dock.style.opacity = '0';
      dock.style.transform = 'scale(0.9)';
      setTimeout(() => {
        try { dock.remove(); } catch (_) {}
        document.body.classList.remove('has-fab-dock');
      }, 200);
      return;
    }
    try {
      dock.classList.add('is-custom-pos');
      localStorage.setItem(posKey, JSON.stringify({
        x: parseFloat(dock.style.left) || 0,
        y: parseFloat(dock.style.top) || 0
      }));
    } catch (_) {}
  });

  // Expose clear hide for logout
  window.__giahuyClearFabHide = function () {
    try { sessionStorage.removeItem(HIDE_KEY); } catch (_) {}
  };
})();

/* V16 — highlight active nav + soft page enter */
(function(){
  const path = (location.pathname.split('/').filter(Boolean).pop() || '').toLowerCase().replace(/\.html$/,'');
  document.querySelectorAll('.topnav a, .side-item').forEach(a => {
    const href = (a.getAttribute('href') || '').toLowerCase();
    if (!href || href === '#' || href.startsWith('#')) return;
    if (href === path || (path === '' && (href === '/' || href === '' || href === 'index.html'))) {
      a.classList.add('active');
    }
  });
})();

/* V19 — Auth gate + session UI on main pages */
(function(){
  // load auth if not present
  if (typeof Auth === 'undefined') {
    const s = document.createElement('script');
    s.src = 'js/auth.js';
    s.onload = bootAuth;
    document.head.appendChild(s);
  } else bootAuth();

  function bootAuth(){
    // Trang auth tự xử lý — không ép requireAuth (hỗ trợ cleanUrls: /login, /register, …)
    const path = (location.pathname || '').replace(/\/+$/, '').toLowerCase();
    const isAuthPage = /(?:^|\/)(login|register|teacher-login|admin-login)(?:\.html)?$/.test(path)
      || /(?:^|\/)(login|register|teacher-login|admin-login)$/.test(path);
    if (isAuthPage) return;

    const session = Auth.requireAuth();
    if (!session) return;

    // session chip in topbar
    const actions = document.querySelector('.top-actions');
    if (actions && !document.querySelector('.session-pill')) {
      const pill = document.createElement('span');
      pill.className = 'session-pill';
      const roleLabel = session.role === 'admin' ? 'Admin'
        : (session.role === 'manager' ? 'QL'
        : (session.role === 'teacher' ? 'GV'
        : (session.role === 'guest' ? 'Khách' : 'HS')));
      const staff = session.role === 'admin' || session.role === 'teacher' || session.role === 'manager';
      const uname = escapeText(session.username || '');
      const panelHref = staff ? 'teacher' : (session.role === 'student' ? 'student' : '');
      const panelLink = panelHref
        ? ` <a class="session-pill-panel" href="${panelHref}">Panel</a>`
        : '';
      pill.innerHTML =
        `<span class="session-pill-user" title="${roleLabel}: ${uname}">${roleLabel}: ${uname}</span>` +
        panelLink +
        ` <button type="button" id="sessionLogout">Thoát</button>`;
      actions.insertBefore(pill, actions.firstChild);
      document.getElementById('sessionLogout')?.addEventListener('click', () => Auth.logout());
    }

    // hide theme toggle
    document.getElementById('themeToggle')?.style.setProperty('display','none');

    // Đồng bộ avatar topbar theo tài khoản (không đụng handler click)
    try {
      let src = 'assets/images/avatar.gif';
      if (session.role === 'guest' && session.id && Auth.getGuestById) {
        const g = Auth.getGuestById(session.id);
        if (g && g.avatar) src = g.avatar;
      } else if (session.role === 'teacher' && session.id && Auth.getTeacherAvatar) {
        const a = Auth.getTeacherAvatar(session.id);
        if (a) src = a;
      } else if (session.role === 'admin') {
        const site = localStorage.getItem('giahuy-avatar');
        if (site) src = site;
      }
      document.querySelectorAll('#avatarBtn img, .mini-avatar img').forEach(img => { if (img) img.src = src; });
    } catch (_) {}
  }

  function escapeText(t){
    return String(t).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
})();






/* V27 — Topnav "..." dropdown (fixed: close on toggle / outside / Esc) */
(function () {
  function init() {
    const nav = document.querySelector('.topnav');
    if (!nav || nav.dataset.moreReady === 'v27') return;
    nav.dataset.moreReady = 'v27';
    nav.querySelectorAll('.nav-more-wrap').forEach((n) => n.remove());
    document.querySelectorAll('.nav-more-menu-portal').forEach((n) => n.remove());

    const links = [...nav.querySelectorAll(':scope > a')];
    if (links.length <= 5) return;

    const rest = links.slice(5);
    rest.forEach((a) => a.classList.add('nav-overflow-hidden'));

    const wrap = document.createElement('div');
    wrap.className = 'nav-more-wrap';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nav-more-btn';
    btn.title = 'Thêm mục';
    btn.textContent = '⋯';
    btn.setAttribute('aria-expanded', 'false');
    wrap.appendChild(btn);
    nav.appendChild(wrap);

    const menu = document.createElement('div');
    menu.className = 'nav-more-menu-portal';
    menu.setAttribute('role', 'menu');
    menu.hidden = true;
    menu.setAttribute('hidden', '');
    // base styles (position/size) — visibility controlled by class + hidden
    menu.style.cssText = 'position:fixed;z-index:2147483646;min-width:210px;background:#fff;border:1px solid #c5d4e6;border-radius:12px;box-shadow:0 16px 48px rgba(15,39,68,.18);padding:8px;flex-direction:column;gap:2px;';
    rest.forEach((a) => {
      const item = document.createElement('a');
      item.href = a.getAttribute('href') || '#';
      item.textContent = (a.textContent || '').replace(/\s+/g, ' ').trim();
      item.style.cssText = 'display:block;padding:11px 14px;border-radius:8px;color:#12263a;text-decoration:none;font:600 13px/1.3 Be Vietnam Pro,sans-serif;white-space:nowrap;';
      item.addEventListener('mouseenter', () => { item.style.background = '#e8eef5'; });
      item.addEventListener('mouseleave', () => { item.style.background = 'transparent'; });
      if (a.hasAttribute('data-open-ticket-nav')) {
        item.href = '#';
        item.addEventListener('click', (e) => {
          e.preventDefault();
          close();
          const t = document.querySelector('a[data-open-ticket-nav],button[data-open-ticket-nav]');
          if (t && t !== item) t.click();
        });
      } else {
        item.addEventListener('click', close);
      }
      menu.appendChild(item);
    });
    document.body.appendChild(menu);

    function isOpen() {
      return menu.classList.contains('is-open') && !menu.hidden;
    }
    function open() {
      const r = btn.getBoundingClientRect();
      // If button not visible / zero size, don't show floating menu at wrong place
      if (r.width < 2 || r.height < 2) return;
      menu.style.top = (r.bottom + 8) + 'px';
      menu.style.left = Math.min(window.innerWidth - 230, Math.max(8, r.left - 20)) + 'px';
      menu.hidden = false;
      menu.removeAttribute('hidden');
      menu.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
      btn.classList.add('is-open');
    }
    function close() {
      menu.classList.remove('is-open');
      menu.hidden = true;
      menu.setAttribute('hidden', '');
      btn.setAttribute('aria-expanded', 'false');
      btn.classList.remove('is-open');
    }

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (isOpen()) close();
      else open();
    });

    // Capture phase so outside-click always works even if other handlers stopPropagation
    document.addEventListener('click', (e) => {
      if (!isOpen()) return;
      const t = e.target;
      if (btn.contains(t) || wrap.contains(t) || menu.contains(t)) return;
      close();
    }, true);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });
    window.addEventListener('resize', close);
    window.addEventListener('scroll', close, true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  setTimeout(init, 500);
})();

/* V28 — Role-based navigation + staff panel access */
(function () {
  function role() {
    try {
      const s = JSON.parse(localStorage.getItem('giahuy-session') || 'null');
      return (s && s.role) || 'guest';
    } catch { return 'guest'; }
  }

  // Student-visible pages (and teacher/admin also see these)
  const STUDENT_HREFS = [
    'index.html', 'plugins', 'mods', 'assets.html',
    'tools', 'resources', 'guide', 'my-library', '#'
  ];
  // Hidden from students
  const STAFF_ONLY = ['config', 'teacher'];
  const SETTINGS_SELECTORS = [
    '.settings-side-link', '[data-open-settings]', '#adminOpen',
    '.settings-label', '.settings-trigger'
  ];

  function hrefKey(a) {
    const h = (a.getAttribute('href') || '').split('?')[0].split('#')[0];
    return h || '#';
  }

  function applyNav() {
    const r = role();
    const isStaff = r === 'admin' || r === 'teacher' || r === 'manager';
    const isAdmin = r === 'admin';

    // Sidebar + topnav links
    document.querySelectorAll('.side-item, .topnav > a').forEach(a => {
      const h = hrefKey(a);
      const isTicket = a.hasAttribute('data-open-ticket-nav') || /ticket|hỏi đáp/i.test(a.textContent || '');
      const isSettings = a.classList.contains('settings-side-link') || a.hasAttribute('data-open-settings');
      const isConfig = h === 'config';

      if (r === 'guest') {
        // Acc khách: trang chủ, bài giảng, bài tập, học liệu, công cụ, tài nguyên, hướng dẫn, kho, hỏi đáp
        const guestOk = (
          isTicket ||
          h === '/' || h === '' || h === 'index.html' ||
          h === 'plugins' || h === 'mods' ||
          h === 'assets.html' || h === 'assets' ||
          h === 'tools' || h === 'resources' || h === 'guide' || h === 'my-library' ||
          /bài giảng|bài tập|học liệu|công cụ|tài nguyên|hướng dẫn|kho|hỏi đáp|trang chủ/i.test(a.textContent || '')
        );
        const guestHide = (
          isConfig || h === 'teacher' || h === 'student' || h === 'config' ||
          /giáo án|config|panel/i.test(a.textContent || '')
        );
        if (guestHide && !isTicket) a.style.display = 'none';
        else if (guestOk) a.style.display = '';
        else a.style.display = 'none';
      } else if (r === 'student') {
        if (isSettings || isConfig || h === 'teacher') {
          a.style.display = 'none';
        } else {
          a.style.display = '';
        }
      } else if (r === 'teacher' || r === 'manager') {
        // GV / Quản lí: hiện Giáo án; ẩn gear Cài đặt (chỉ admin)
        if (isSettings) a.style.display = 'none';
        else a.style.display = '';
      } else {
        // admin: show all
        a.style.display = '';
      }
    });

    // Topbar settings: admin = admin center; guest = profile; others hide
    SETTINGS_SELECTORS.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        if (isAdmin) {
          el.style.display = '';
        } else if (r === 'guest') {
          el.style.display = '';
          el.setAttribute('data-guest-profile', '1');
        } else {
          el.style.display = 'none';
        }
      });
    });

    // Panel link trong sidebar — chỉ 1 mục, không trùng
    const side = document.querySelector('.side-inner');
    if (side) {
      // Xóa mọi link panel cũ (HTML tĩnh + JS trước đó) rồi gắn đúng 1 cái
      side.querySelectorAll('[data-role-panel], a[href="teacher"], a[href="student"]').forEach(el => {
        // Chỉ xóa nếu là side-item panel, tránh xóa nhầm link khác
        if (el.classList.contains('side-item') || el.hasAttribute('data-role-panel')) el.remove();
      });
      if (isStaff) {
        const a = document.createElement('a');
        a.className = 'side-item';
        a.href = 'teacher';
        a.setAttribute('data-role-panel', '1');
        const label = isAdmin ? 'Admin' : (r === 'manager' ? 'Quản lí' : 'Giáo viên');
        a.innerHTML = '<span class="side-icon"><i class="cil-speedometer"></i></span><span>Panel ' + label + '</span><span class="chev">›</span>';
        const quote = side.querySelector('.side-quote');
        if (quote) side.insertBefore(a, quote);
        else side.appendChild(a);
      } else if (r === 'student') {
        const a = document.createElement('a');
        a.className = 'side-item';
        a.href = 'student';
        a.setAttribute('data-role-panel', '1');
        a.innerHTML = '<span class="side-icon"><i class="cil-user"></i></span><span>Panel Học sinh</span><span class="chev">›</span>';
        const quote = side.querySelector('.side-quote');
        if (quote) side.insertBefore(a, quote);
        else side.appendChild(a);
      }
    }
  }

  // Staff open admin tools without password; restrict tabs for teacher
  function patchAdminAccess() {
    const r = role();
    if (r !== 'admin' && r !== 'teacher') return;

    // Auto mark admin flag so openAdmin skips password for staff session
    localStorage.setItem('giahuy-admin', '1');

    // When admin panel opens, hide tabs teachers shouldn't see
    const obs = new MutationObserver(() => {
      const panel = document.getElementById('adminPanel');
      if (!panel || panel.classList.contains('hidden')) return;
      const tabs = panel.querySelectorAll('.admin-tab');
      tabs.forEach(tab => {
        const t = tab.dataset.adminTab;
        if (r === 'teacher') {
          // only upload, library, stats
          if (t === 'music') tab.style.display = 'none';
          else tab.style.display = '';
        } else {
          tab.style.display = '';
        }
      });
      // hide avatar change for teacher
      if (r === 'teacher') {
        panel.querySelectorAll('#changeAvatarBtn, #resetAvatarBtn, .admin-actions #logoutAdmin').forEach(el => {
          if (el && el.id !== 'logoutAdmin') el.style.display = 'none';
        });
        const badge = panel.querySelector('.admin-badge');
        if (badge) badge.textContent = 'GIÁO VIÊN';
      }
    });
    const modal = document.getElementById('adminModal');
    if (modal) obs.observe(modal, { attributes: true, subtree: true, childList: true, attributeFilter: ['class'] });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { applyNav(); patchAdminAccess(); });
  } else {
    applyNav();
    patchAdminAccess();
  }
  setTimeout(() => { applyNav(); patchAdminAccess(); }, 400);
})();

/* V28.1 — open admin panel from hash / localStorage tab */
(function(){
  function tryOpen(){
    const hash = location.hash || '';
    const tab = localStorage.getItem('giahuy-open-admin-tab');
    if (!hash.startsWith('#admin') && !tab) return;
    const role = (()=>{ try{return JSON.parse(localStorage.getItem('giahuy-session')||'{}').role}catch{return null}})();
    if (role !== 'admin' && role !== 'teacher' && role !== 'manager') return;
    localStorage.setItem('giahuy-admin','1');
    const open = () => {
      if (typeof openAdmin === 'function') openAdmin();
      else document.getElementById('adminOpen')?.click();
      setTimeout(() => {
        const want = tab || (hash.replace('#admin-','') || 'upload');
        const btn = document.querySelector(`.admin-tab[data-admin-tab="${want}"]`);
        if (btn) btn.click();
        else if (typeof renderAdmin === 'function') renderAdmin(want);
        localStorage.removeItem('giahuy-open-admin-tab');
      }, 900);
    };
    setTimeout(open, 500);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tryOpen);
  else tryOpen();
})();

/* V29 — Admin tools open as full page (no modal window) */
(function () {
  function isStaff() {
    try {
      const s = JSON.parse(localStorage.getItem('giahuy-session') || 'null');
      return s && (s.role === 'admin' || s.role === 'teacher' || s.role === 'manager');
    } catch { return false; }
  }

  function goAdmin(tab) {
    const q = tab ? ('?tab=' + encodeURIComponent(tab)) : '';
    location.href = 'admin-panel' + q;
  }

  function wire() {
    if (!isStaff()) return;

    // Settings gear / admin open → full page
    ['#adminOpen', '.settings-trigger', '[data-open-settings]', '.settings-side-link'].forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        el.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          goAdmin('upload');
        }, true);
      });
    });

    // Override openAdmin if present
    window.openAdmin = function () { goAdmin('upload'); };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire);
  else wire();
  setTimeout(wire, 400);
})();

/* Guest profile + Account avatar (một module, không đắp chồng) */
(function () {
  const DEFAULT_AV = 'assets/images/avatar.gif';

  /** Auth sẵn sàng (const Auth hoặc window.Auth) */
  function readyAuth() {
    try {
      if (typeof Auth !== 'undefined' && Auth) return Auth;
      if (window.Auth) return window.Auth;
    } catch (_) {}
    return null;
  }

  function session() {
    try {
      const A = readyAuth();
      if (A && A.getSession) return A.getSession();
      return JSON.parse(localStorage.getItem('giahuy-session') || 'null');
    } catch { return null; }
  }
  function isGuest() {
    const s = session();
    return !!(s && s.role === 'guest');
  }

  function guestAvatar(s) {
    try {
      if (!s || s.role !== 'guest' || !s.id) return null;
      // Ưu tiên cache localStorage nhanh
      const cached = localStorage.getItem('giahuy-avatar-guest-' + s.id);
      if (cached) return cached;
      const A = readyAuth();
      if (A && A.getGuestById) {
        const g = A.getGuestById(s.id);
        if (g && g.avatar) {
          try { localStorage.setItem('giahuy-avatar-guest-' + s.id, g.avatar); } catch (_) {}
          return g.avatar;
        }
      }
    } catch (_) {}
    return null;
  }

  function applyTopAvatar(src) {
    const url = src || DEFAULT_AV;
    document.querySelectorAll('#avatarBtn img, .mini-avatar img').forEach(img => {
      if (img) img.src = url;
    });
  }

  function ensureModal() {
    let m = document.getElementById('guestProfileModal');
    if (m) return m;
    m = document.createElement('div');
    m.id = 'guestProfileModal';
    m.className = 'guest-profile-modal';
    m.setAttribute('aria-hidden', 'true');
    m.innerHTML =
      '<div class="guest-profile-box" role="dialog" aria-modal="true">' +
      '<h2>Hồ sơ tài khoản khách</h2>' +
      '<p class="sub">Đổi avatar, tên đăng nhập và mật khẩu.</p>' +
      '<div class="guest-av-row">' +
      '<img id="guestAvPreview" src="' + DEFAULT_AV + '" alt="">' +
      '<div class="guest-profile-actions">' +
      '<button type="button" class="t-btn primary" id="guestAvBtn">Đổi avatar</button>' +
      '<input type="file" id="guestAvFile" accept="image/*" hidden>' +
      '</div></div>' +
      '<label>Tên đăng nhập<input type="text" id="guestProfUser" maxlength="40" autocomplete="username"></label>' +
      '<label>Mật khẩu mới<input type="password" id="guestProfPass" maxlength="64" placeholder="Để trống nếu không đổi" autocomplete="new-password"></label>' +
      '<div class="guest-profile-actions">' +
      '<button type="button" class="t-btn primary" id="guestProfSave">Lưu</button>' +
      '<button type="button" class="t-btn" id="guestProfClose">Đóng</button>' +
      '</div></div>';
    document.body.appendChild(m);

    m.addEventListener('click', e => {
      if (e.target === m) closeModal();
    });
    m.querySelector('#guestProfClose').addEventListener('click', closeModal);
    m.querySelector('#guestAvBtn').addEventListener('click', () => m.querySelector('#guestAvFile').click());
    m.querySelector('#guestAvFile').addEventListener('change', e => {
      const f = e.target.files && e.target.files[0];
      const A = readyAuth();
      if (!f || !A) return;
      const reader = new FileReader();
      reader.onload = async () => {
        const s = session();
        if (!s || !s.id) return;
        const dataUrl = reader.result;
        const r = await Promise.resolve(A.updateGuestProfile(s.id, { avatar: dataUrl }));
        if (r && r.ok === false) {
          if (A.toast) A.toast(r.msg || 'Lỗi avatar', true);
          return;
        }
        try { localStorage.setItem('giahuy-avatar-guest-' + s.id, dataUrl); } catch (_) {}
        const prev = m.querySelector('#guestAvPreview');
        if (prev) prev.src = dataUrl;
        applyTopAvatar(dataUrl);
        if (A.toast) A.toast('Đã cập nhật avatar');
      };
      reader.readAsDataURL(f);
    });
    m.querySelector('#guestProfSave').addEventListener('click', async () => {
      const A = readyAuth();
      if (!A) return;
      const s = session();
      if (!s || !s.id) return;
      const opts = { username: (m.querySelector('#guestProfUser').value || '').trim() };
      const pw = (m.querySelector('#guestProfPass').value || '').trim();
      if (pw) opts.password = pw;
      const r = await Promise.resolve(A.updateGuestProfile(s.id, opts));
      if (!r || !r.ok) {
        if (A.toast) A.toast((r && r.msg) || 'Không lưu được', true);
        return;
      }
      if (A.toast) A.toast('Đã lưu hồ sơ');
      closeModal();
      setTimeout(() => location.reload(), 350);
    });
    return m;
  }

  function closeModal() {
    const m = document.getElementById('guestProfileModal');
    if (!m) return;
    m.classList.remove('open');
    m.setAttribute('aria-hidden', 'true');
    m.style.display = '';
  }

  async function openGuestProfile() {
    const s = session();
    if (!s || s.role !== 'guest') return false;
    const A = readyAuth();
    if (!A) {
      console.warn('[guest-profile] Auth chưa sẵn sàng');
      setTimeout(() => {
        if (readyAuth()) openGuestProfile();
      }, 200);
      return false;
    }
    const m = ensureModal();
    let g = null;
    try {
      g = await Promise.resolve(A.getGuestById(s.id));
    } catch (_) {}
    const av = guestAvatar(s) || (g && g.avatar) || DEFAULT_AV;
    const userEl = m.querySelector('#guestProfUser');
    const passEl = m.querySelector('#guestProfPass');
    const prev = m.querySelector('#guestAvPreview');
    if (userEl) userEl.value = (g && g.username) || s.username || '';
    if (passEl) passEl.value = '';
    if (prev) prev.src = av;
    m.classList.add('open');
    m.setAttribute('aria-hidden', 'false');
    m.style.display = 'flex';
    return true;
  }

  function isSettingsTarget(el) {
    if (!el || !el.closest) return false;
    return !!(
      el.closest('#adminOpen') ||
      el.closest('.settings-trigger') ||
      el.closest('[data-open-settings]') ||
      el.closest('.settings-side-link') ||
      el.closest('.settings-label') ||
      el.closest('[data-guest-profile]')
    );
  }

  function isAvatarTarget(el) {
    if (!el || !el.closest) return false;
    return !!(el.closest('#avatarBtn') || el.closest('.mini-avatar'));
  }

  function onDocClick(e) {
    const s = session();
    if (!s) return;

    // Acc khách: Cài đặt / avatar → hồ sơ
    if (s.role === 'guest') {
      if (isSettingsTarget(e.target) || isAvatarTarget(e.target)) {
        e.preventDefault();
        e.stopPropagation();
        openGuestProfile();
        return;
      }
    }

    // Avatar theo role (không phải guest)
    if (isAvatarTarget(e.target)) {
      e.preventDefault();
      e.stopPropagation();
      if (s.role === 'student') location.href = 'student';
      else if (s.role === 'teacher' || s.role === 'manager') location.href = 'teacher';
      else if (s.role === 'admin') location.href = 'admin-panel';
    }
  }

  function showGuestSettingsUI() {
    if (!isGuest()) return;
    document.querySelectorAll('#adminOpen, .settings-trigger, [data-open-settings], .settings-side-link, .settings-label').forEach(el => {
      el.style.display = '';
      el.style.visibility = 'visible';
      el.style.pointerEvents = 'auto';
      el.setAttribute('data-guest-profile', '1');
    });
    window.openAdmin = function () { openGuestProfile(); };
  }

  function syncAvatar() {
    const s = session();
    if (!s) {
      applyTopAvatar(DEFAULT_AV);
      return;
    }
    let src = DEFAULT_AV;
    const A = readyAuth();
    if (s.role === 'guest') {
      src = guestAvatar(s) || DEFAULT_AV;
    } else if (s.role === 'teacher' && s.id && A && A.getTeacherAvatar) {
      src = A.getTeacherAvatar(s.id) || DEFAULT_AV;
    } else if (s.role === 'admin') {
      src = localStorage.getItem('giahuy-avatar') || DEFAULT_AV;
    }
    applyTopAvatar(src);
    const btn = document.getElementById('avatarBtn');
    if (btn) {
      btn.title = (s.username || 'Tài khoản') + ' — hồ sơ';
      btn.style.cursor = 'pointer';
    }
  }

  function boot() {
    ensureModal(); // sẵn modal trong DOM
    showGuestSettingsUI();
    syncAvatar();
    window.openGuestProfile = openGuestProfile;
    if (isGuest()) window.openAdmin = function () { openGuestProfile(); };
  }

  // Capture phase — chặn handler cũ (openAdmin modal)
  document.addEventListener('click', onDocClick, true);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 300);
  setTimeout(boot, 800);
  setTimeout(syncAvatar, 1200);
})();


/* V29.1 — reset fab if drifted left */
(function(){
  try {
    const saved = JSON.parse(localStorage.getItem('giahuy-fab-dock-pos')||'null');
    if (saved && typeof saved.x === 'number' && saved.x < window.innerWidth * 0.45) {
      localStorage.removeItem('giahuy-fab-dock-pos');
    }
  } catch(_){}
  const dock = document.querySelector('.fab-dock');
  if (dock && !dock.classList.contains('is-custom-pos')) {
    dock.style.left = '';
    dock.style.top = '';
    dock.style.right = '';
    dock.style.bottom = '';
  }
})();


/* V30 — Notification bell + broadcast */
(function () {
  const NKEY = 'giahuy-notifications-v1';
  const $ = (s, r = document) => r.querySelector(s);

  function load() {
    try { return JSON.parse(localStorage.getItem(NKEY) || '[]'); } catch { return []; }
  }
  function save(list) { localStorage.setItem(NKEY, JSON.stringify(list)); }

  function session() {
    try { return JSON.parse(localStorage.getItem('giahuy-session') || 'null'); } catch { return null; }
  }

  function forMe(n, s) {
    if (!s) return false;
    if (n.to === 'all') return true;
    if (n.to === s.username) return true;
    if (n.toId && s.id && n.toId === s.id) return true;
    if (n.toRole && n.toRole === s.role) return true;
    if (n.to === 'all_teachers' && s.role === 'teacher') return true;
    return false;
  }

  function myNotifs() {
    const s = session();
    if (!s) return [];
    return load().filter(n => forMe(n, s)).sort((a, b) => (b.at || 0) - (a.at || 0));
  }

  function unreadCount() {
    return myNotifs().filter(n => !n.read).length;
  }

  window.GiahuyNotif = {
    push(entry) {
      const list = load();
      list.push({
        id: 'nf_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        title: entry.title || 'Thông báo',
        body: entry.body || '',
        type: entry.type || 'announce',
        to: entry.to || 'all',
        toId: entry.toId || null,
        toRole: entry.toRole || null,
        from: entry.from || 'Hệ thống',
        at: Date.now(),
        read: false
      });
      save(list);
      try { renderBell(); } catch (_) {}
      return true;
    },
    markRead(id) {
      const list = load().map(n => n.id === id ? { ...n, read: true } : n);
      save(list);
      renderBell();
    },
    markAllRead() {
      const s = session();
      const list = load().map(n => forMe(n, s) ? { ...n, read: true } : n);
      save(list);
      renderBell();
    },
    list: myNotifs,
    unread: unreadCount
  };

  function ensureBell() {
    const actions = document.querySelector('.top-actions');
    if (!actions || $('#notifBellWrap')) return;
    const wrap = document.createElement('div');
    wrap.id = 'notifBellWrap';
    wrap.className = 'notif-bell-wrap';
    wrap.innerHTML = `
      <button type="button" class="notif-bell-btn" id="notifBellBtn" aria-label="Thông báo" title="Thông báo">
        <i class="cil-bell"></i>
        <span class="notif-badge" id="notifBadge" hidden>0</span>
      </button>
      <div class="notif-dropdown" id="notifDropdown" hidden>
        <div class="notif-dd-head">
          <b>Thông báo</b>
          <button type="button" class="notif-mark-all" id="notifMarkAll">Đã đọc hết</button>
        </div>
        <div class="notif-dd-list" id="notifList"></div>
      </div>`;
    // Insert before session-pill if present, else at start of top-actions
    const pill = actions.querySelector('.session-pill');
    if (pill) actions.insertBefore(wrap, pill);
    else actions.insertBefore(wrap, actions.firstChild);

    $('#notifBellBtn').addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const dd = $('#notifDropdown');
      const open = dd.hidden;
      dd.hidden = !open;
      if (open) renderList();
    });
    $('#notifMarkAll').addEventListener('click', (e) => {
      e.stopPropagation();
      window.GiahuyNotif.markAllRead();
      renderList();
    });
    document.addEventListener('click', (e) => {
      const dd = $('#notifDropdown');
      if (!dd || dd.hidden) return;
      if (!wrap.contains(e.target)) dd.hidden = true;
    }, true);
  }

  function renderBell() {
    ensureBell();
    const badge = $('#notifBadge');
    if (!badge) return;
    const n = unreadCount();
    if (n > 0) {
      badge.hidden = false;
      badge.textContent = n > 99 ? '99+' : String(n);
    } else {
      badge.hidden = true;
    }
  }

  function renderList() {
    const box = $('#notifList');
    if (!box) return;
    const items = myNotifs().slice(0, 40);
    if (!items.length) {
      box.innerHTML = '<div class="notif-empty">Chưa có thông báo.</div>';
      return;
    }
    box.innerHTML = items.map(n => {
      const time = new Date(n.at || Date.now()).toLocaleString('vi-VN');
      const unread = n.read ? '' : ' is-unread';
      return `<button type="button" class="notif-item${unread}" data-nid="${n.id}">
        <span class="notif-item-title">${esc(n.title)}</span>
        <span class="notif-item-body">${esc(n.body)}</span>
        <span class="notif-item-meta">${esc(n.from || '')} · ${time}</span>
      </button>`;
    }).join('');
    box.querySelectorAll('[data-nid]').forEach(btn => {
      btn.addEventListener('click', () => {
        window.GiahuyNotif.markRead(btn.dataset.nid);
        renderList();
      });
    });
  }

  function esc(t) {
    return String(t || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function boot() {
    if (!session()) return;
    ensureBell();
    renderBell();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(boot, 50));
  else setTimeout(boot, 50);
  setTimeout(boot, 600);
})();
