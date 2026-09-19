(async function(){
  'use strict';
  if(document.body.closest('.locked-zone')) return;
  const host=document.querySelector('main.content');
  if(!host || document.getElementById('ghHomeUpgrade')) return;
  const platform=window.GiaHuyPlatform;
  if(platform?.ready){try{await platform.ready}catch{}}
  const data=platform?.DATA || {
    courses:[],videos:[],assignments:[],flashcards:[],games:[],materials:[],notices:[]
  };
  const icon=(name)=>`<i class="${name}" aria-hidden="true"></i>`;
  const esc=v=>String(v??'').replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]));
  const section=(id,title,desc,body,href,label)=>`<section class="ghx-section shell" id="${id}"><div class="ghx-head"><div><span class="ghx-kicker">THẦY GIA HUY</span><h2>${title}</h2><p>${desc}</p></div>${href?`<a class="ghx-link" href="${href}">${label||'Xem tất cả'} ${icon('cil-arrow-right')}</a>`:''}</div>${body}</section>`;
  const track=t=>window.GiaHuyPlatform?.track?.(t)||null;
  const wrap=document.createElement('div');wrap.id='ghHomeUpgrade';wrap.innerHTML='';

  const continueCards=data.courses.slice(0,3).map(c=>`<article class="ghx-card ghx-course-card"><div class="ghx-iconbox">${icon(c.icon)}</div><span class="ghx-tag">${esc(c.tag)}</span><h3>${esc(c.title)}</h3><p>${esc(c.desc)}</p><div class="ghx-progress"><i style="width:${c.progress}%"></i></div><div class="ghx-card-meta"><span>${c.progress}% hoàn thành</span><a href="plugins.html?course=${encodeURIComponent(c.id)}" data-home-track="course_open">Tiếp tục ${icon('cil-arrow-right')}</a></div></article>`).join('');
  wrap.insertAdjacentHTML('beforeend',section('ghxContinue','Tiếp tục học','Các nội dung bạn có thể mở ngay.',`<div class="ghx-grid ghx-grid-3">${continueCards}</div>`,'plugins.html','Xem khóa học'));

  const courses=data.courses.slice(0,6).map(c=>`<article class="ghx-card ghx-course-card"><div class="ghx-thumb"><div class="ghx-thumb-icon">${icon(c.icon)}</div><span class="ghx-tag">${esc(c.tag)}</span></div><div class="ghx-card-body"><h3>${esc(c.title)}</h3><p>${esc(c.desc)}</p><div class="ghx-card-meta"><span>${c.lessons} bài</span><span>${c.done} hoàn thành</span></div><div class="ghx-progress"><i style="width:${c.progress}%"></i></div><div class="ghx-card-meta"><span>${c.progress}%</span><a href="plugins.html?course=${encodeURIComponent(c.id)}">Mở khóa học ${icon('cil-arrow-right')}</a></div></div></article>`).join('');
  wrap.insertAdjacentHTML('beforeend',section('ghxCourses','Khóa học nổi bật','Học theo chuyên đề với tiến độ rõ ràng.',`<div class="ghx-grid ghx-grid-3">${courses}</div>`,'plugins.html','Xem tất cả'));

  const videoData=platform?.getVideos?.() || data.videos;
  const videos=videoData.slice(0,4).map(v=>`<article class="ghx-card ghx-video-card"><div class="ghx-video-thumb"><span>${icon(v.icon)}</span><b>${esc(v.duration)}</b><i>${icon('cil-media-play')}</i></div><div class="ghx-card-body"><h3>${esc(v.title)}</h3><div class="ghx-card-meta"><span>${esc(v.subject)}</span><span>${esc(v.views)} lượt xem</span></div><button class="ghx-btn" data-home-video="${esc(v.id)}">Xem video ${icon('cil-arrow-right')}</button></div></article>`).join('');
  wrap.insertAdjacentHTML('beforeend',section('ghxVideos','Video bài giảng','Các video mới và nội dung trực quan.',`<div class="ghx-grid ghx-grid-4">${videos}</div>`,'videos.html','Thư viện video'));

  const assigns=data.assignments.slice(0,4).map(a=>`<article class="ghx-row-card"><div class="ghx-iconbox">${icon(a.icon)}</div><div class="ghx-row-main"><b>${esc(a.title)}</b><span>${esc(a.subject)} · Hạn ${esc(a.deadline)}</span><div class="ghx-progress"><i style="width:${a.progress}%"></i></div></div><span class="ghx-status ${a.progress===100?'success':a.progress>0?'progress':'warning'}">${esc(a.status)}</span><a class="ghx-btn soft" href="mods.html?assignment=${encodeURIComponent(a.id)}">${a.progress===100?'Kết quả':'Làm bài'}</a></article>`).join('');
  wrap.insertAdjacentHTML('beforeend',section('ghxAssignments','Bài tập cần hoàn thành','Theo dõi deadline và tiến độ.',`<div class="ghx-list">${assigns}</div>`,'mods.html','Quản lý bài tập'));


  const fcs=data.flashcards.slice(0,4).map(f=>`<article class="ghx-card ghx-small-card"><div class="ghx-iconbox">${icon(f.icon)}</div><h3>${esc(f.title)}</h3><p>${f.cards} thẻ · ${esc(f.subject)}</p><div class="ghx-progress"><i style="width:${f.progress}%"></i></div><a class="ghx-btn soft" href="flashcards.html?deck=${encodeURIComponent(f.id)}" data-home-track="flashcard_session">Ôn tập ${icon('cil-arrow-right')}</a></article>`).join('');
  wrap.insertAdjacentHTML('beforeend',section('ghxFlashcards','Flashcard gần đây','Ôn nhanh những kiến thức cần nhớ.',`<div class="ghx-grid ghx-grid-4">${fcs}</div>`,'flashcards.html','Mở Flashcard'));

  const games=data.games.slice(0,6).map(g=>`<article class="ghx-card ghx-game-card"><div class="ghx-game-art">${icon(g.icon)}<span>GAME</span></div><div class="ghx-card-body"><h3>${esc(g.title)}</h3><p>${esc(g.cat)}</p><a class="ghx-btn primary" href="games.html?game=${encodeURIComponent(g.id)}">Chơi ngay ${icon('cil-media-play')}</a></div></article>`).join('');
  wrap.insertAdjacentHTML('beforeend',section('ghxGames','Game Center','Giải lao bằng những trò chơi giải trí thực.',`<div class="ghx-grid ghx-grid-3">${games}</div>`,'games.html','Mở Game Center'));

  const mats=data.materials.slice(0,6).map(m=>`<article class="ghx-row-card"><div class="ghx-iconbox">${icon(m.icon)}</div><div class="ghx-row-main"><b>${esc(m.title)}</b><span>${esc(m.type)} · ${esc(m.meta)}</span></div><a class="ghx-btn soft" href="resources.html">Mở ${icon('cil-arrow-right')}</a></article>`).join('');
  wrap.insertAdjacentHTML('beforeend',section('ghxMaterials','Học liệu & tài nguyên','Tổng hợp tài liệu gần đây.',`<div class="ghx-list">${mats}</div>`,'resources.html','Xem kho tài nguyên'));

  const notices=data.notices.slice(0,5).map(n=>`<article class="ghx-row-card"><div class="ghx-iconbox">${icon(n.icon)}</div><div class="ghx-row-main"><b>${esc(n.title)}</b><span>${esc(n.time)}</span></div><span class="ghx-dot"></span></article>`).join('');
  const qna=`<div class="ghx-two-col"><div class="ghx-panel"><div class="ghx-panel-head"><h3>Thông báo mới</h3><a href="notifications.html">Xem tất cả</a></div>${notices}</div><div class="ghx-panel"><div class="ghx-panel-head"><h3>Cộng đồng Hỏi đáp</h3><a href="qna.html">Tham gia</a></div><div class="ghx-community"><div class="ghx-community-icon">${icon('cil-speech')}</div><div><b>Đặt câu hỏi, chia sẻ cách học và trao đổi cùng cộng đồng.</b><p>Mở trang Hỏi đáp để xem câu hỏi mới và gửi câu hỏi của bạn.</p><a class="ghx-btn primary" href="qna.html">Mở Hỏi đáp ${icon('cil-arrow-right')}</a></div></div></div></div>`;
  wrap.insertAdjacentHTML('beforeend',section('ghxCommunity','Thông báo & cộng đồng','Luôn theo dõi nội dung mới của website.',qna,null,null));

  /* Always inject inside main.content so sections share the same left offset as hero/insights above. */
  host.appendChild(wrap);

  // Safety: if anything moved #ghHomeUpgrade outside main, pull it back in.
  (function ensureInsideMain(){
    const node = document.getElementById('ghHomeUpgrade');
    const main = document.querySelector('main.content, main#top, .content');
    if(node && main && node.parentElement !== main){
      main.appendChild(node);
    }
  })();

  document.querySelectorAll('[data-home-track]').forEach(el=>el.addEventListener('click',()=>track(el.dataset.homeTrack,{source:'home'})));
  document.querySelectorAll('[data-home-video]').forEach(btn=>btn.addEventListener('click',async()=>{
    const v=videoData.find(x=>x.id===btn.dataset.homeVideo) || data.videos.find(x=>x.id===btn.dataset.homeVideo); if(!v)return;
    if(platform?.openVideo){ await platform.openVideo(v); track('video_open',{id:v.id,source:'home'}); return; }
    const overlay=document.createElement('div');overlay.className='ghx-video-modal';overlay.innerHTML=`<div class="ghx-video-backdrop"></div><div class="ghx-video-dialog"><button class="ghx-close" aria-label="Đóng">${icon('cil-x')}</button><span class="ghx-kicker">VIDEO BÀI GIẢNG</span><h2>${esc(v.title)}</h2><div class="ghx-video-placeholder">${icon('cil-video')}<p>Chưa có nguồn video được gắn cho nội dung này.</p></div><div class="ghx-card-meta"><span>${esc(v.subject)}</span><span>${esc(v.duration)}</span></div></div>`;document.body.appendChild(overlay);track('video_open',{id:v.id,source:'home'});overlay.querySelector('.ghx-close').addEventListener('click',()=>overlay.remove());overlay.querySelector('.ghx-video-backdrop').addEventListener('click',()=>overlay.remove());
  }));
})();
