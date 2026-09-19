(function () {
  'use strict';

  const DATA = {
    courses: [
      { id:'physics-electric', title:'Vật lý 11 — Điện học', tag:'VẬT LÝ 11', desc:'Điện trường, điện thế, tụ điện và dòng điện.', progress:72, lessons:18, done:13, icon:'cil-bolt' },
      { id:'physics-oscillation', title:'Vật lý 11 — Dao động', tag:'VẬT LÝ 11', desc:'Dao động điều hòa, con lắc, lò xo và năng lượng.', progress:58, lessons:15, done:9, icon:'cil-chart-line' },
      { id:'math-functions', title:'Toán 11 — Hàm số', tag:'TOÁN 11', desc:'Hàm số lượng giác, biến thiên và bài tập vận dụng.', progress:44, lessons:20, done:8, icon:'cil-calculator' },
      { id:'chem-balance', title:'Hóa học 11 — Cân bằng', tag:'HÓA 11', desc:'Cân bằng hóa học và bài luyện tập theo chuyên đề.', progress:36, lessons:12, done:4, icon:'cil-beaker' },
      { id:'bio-metabolism', title:'Sinh học 11 — Chuyển hóa', tag:'SINH 11', desc:'Chuyển hóa vật chất và năng lượng trong tế bào.', progress:62, lessons:17, done:11, icon:'cil-leaf' },
      { id:'web-project', title:'Tin học — Dự án web', tag:'TIN HỌC', desc:'Thực hành HTML, CSS, JavaScript và triển khai website.', progress:81, lessons:14, done:12, icon:'cil-code' }
    ],
    videos: [
      { id:'v1', title:'Điện trường và cường độ điện trường', subject:'Vật lý 11', duration:'18:42', views:'1,2K', icon:'cil-bolt', src:'' },
      { id:'v2', title:'Dao động điều hòa — từ đồ thị đến công thức', subject:'Vật lý 11', duration:'24:10', views:'860', icon:'cil-chart-line', src:'' },
      { id:'v3', title:'Hướng dẫn đọc đồ thị hàm số', subject:'Toán 11', duration:'13:08', views:'532', icon:'cil-graph', src:'' },
      { id:'v4', title:'Cân bằng hóa học — ví dụ minh họa', subject:'Hóa 11', duration:'21:30', views:'614', icon:'cil-beaker', src:'' },
      { id:'v5', title:'Cảm ứng điện từ — thí nghiệm trực quan', subject:'Vật lý 11', duration:'16:24', views:'742', icon:'cil-bolt', src:'' },
      { id:'v6', title:'Sóng cơ và hiện tượng giao thoa', subject:'Vật lý 11', duration:'19:05', views:'486', icon:'cil-graph', src:'' }
    ],
    assignments: [
      { id:'a1', title:'Bài tập lực và chuyển động', subject:'Vật lý 10', deadline:'18/09/2026', status:'Đang làm', progress:65, icon:'cil-task' },
      { id:'a2', title:'Phiếu bài tập điện trường', subject:'Vật lý 11', deadline:'20/09/2026', status:'Chưa làm', progress:0, icon:'cil-bolt' },
      { id:'a3', title:'Ôn tập hàm số lượng giác', subject:'Toán 11', deadline:'22/09/2026', status:'Chưa làm', progress:18, icon:'cil-calculator' },
      { id:'a4', title:'Bài thực hành mạch điện', subject:'Vật lý 11', deadline:'16/09/2026', status:'Đã hoàn thành', progress:100, icon:'cil-check-circle' },
      { id:'a5', title:'Bài tập cân bằng hóa học', subject:'Hóa 11', deadline:'24/09/2026', status:'Chưa làm', progress:0, icon:'cil-beaker' },
      { id:'a6', title:'Sơ đồ chuyển hóa năng lượng', subject:'Sinh 11', deadline:'25/09/2026', status:'Đang làm', progress:46, icon:'cil-leaf' }
    ],
    flashcards: [
      { id:'fc1', title:'Định luật Newton', subject:'Vật lý', cards:24, progress:76, icon:'cil-layers', front:'Định luật II Newton', back:'F = m·a. Gia tốc cùng hướng với hợp lực và tỉ lệ thuận với hợp lực, tỉ lệ nghịch với khối lượng.' },
      { id:'fc2', title:'Công thức dao động', subject:'Vật lý', cards:32, progress:48, icon:'cil-chart-line', front:'Chu kỳ con lắc lò xo', back:'T = 2π√(m/k).' },
      { id:'fc3', title:'Từ vựng tiếng Anh', subject:'Tiếng Anh', cards:50, progress:62, icon:'cil-language', front:'oscillation', back:'dao động' },
      { id:'fc4', title:'Cân bằng hóa học', subject:'Hóa học', cards:28, progress:31, icon:'cil-beaker', front:'Hằng số cân bằng', back:'Kc biểu diễn quan hệ giữa nồng độ sản phẩm và chất phản ứng ở trạng thái cân bằng, theo phương trình đã cân bằng.' }
    ],
    quizzes: [
      { id:'q1', title:'Cơ học — Lực và chuyển động', subject:'Vật lý 10', questions:4, minutes:10, level:'Cơ bản', icon:'cil-list-numbered', items:[
        {q:'Một vật khối lượng 2 kg chịu hợp lực 6 N. Gia tốc của vật bằng?', options:['1 m/s²','2 m/s²','3 m/s²','6 m/s²'], answer:2},
        {q:'Khi hợp lực bằng 0, vật đang chuyển động thẳng đều sẽ...', options:['dừng ngay','tiếp tục thẳng đều','tăng tốc','đổi hướng'], answer:1},
        {q:'Ma sát trượt phụ thuộc mạnh vào...', options:['màu bề mặt','lực ép và hệ số ma sát','thời gian','vận tốc ánh sáng'], answer:1},
        {q:'Đơn vị SI của lực là...', options:['J','W','N','Pa'], answer:2}
      ]},
      { id:'q2', title:'Hàm số lượng giác', subject:'Toán 11', questions:5, minutes:12, level:'Trung bình', icon:'cil-calculator', items:[
        {q:'sin²x + cos²x bằng...', options:['0','1','2','sin x'], answer:1},
        {q:'Chu kỳ của sin x là...', options:['π/2','π','2π','4π'], answer:2},
        {q:'cos 0 bằng...', options:['0','1','-1','2'], answer:1},
        {q:'tan x không xác định khi...', options:['cos x = 0','sin x = 0','x = 0','tan x = 1'], answer:0},
        {q:'Miền giá trị của cos x là...', options:['[0,1]','[-1,1]','R','[-2,2]'], answer:1}
      ]},
      { id:'q3', title:'Cân bằng hóa học', subject:'Hóa 11', questions:5, minutes:15, level:'Trung bình', icon:'cil-beaker', items:[
        {q:'Ở trạng thái cân bằng, tốc độ phản ứng thuận và nghịch...', options:['bằng nhau','đều bằng 0','luôn khác nhau','không liên quan'], answer:0},
        {q:'Xúc tác làm thay đổi...', options:['Kc','tốc độ đạt cân bằng','thành phần cân bằng','nhiệt phản ứng'], answer:1},
        {q:'Tăng nồng độ chất phản ứng thường làm hệ...', options:['dịch theo chiều tạo sản phẩm','không đổi','luôn tạo chất phản ứng','dừng lại'], answer:0},
        {q:'Kc phụ thuộc vào...', options:['nhiệt độ','màu sắc','xúc tác','thể tích dụng cụ'], answer:0},
        {q:'Cân bằng hóa học là cân bằng...', options:['tĩnh','động','cơ học','nhiệt'], answer:1}
      ]}
    ],
    games: [
      {id:'racing',title:'Neon Racer',cat:'Racing',difficulty:'Dễ',icon:'cil-car-alt',description:'Đổi làn, né xe và gom năng lượng để tạo chuỗi điểm liên tục.',tagline:'Tốc độ · phản xạ · combo'},
      {id:'space',title:'Galaxy Defender',cat:'Shooter',difficulty:'Trung bình',icon:'cil-airplane-mode',description:'Điều khiển chiến cơ, bắn mục tiêu, sống sót qua từng đợt tấn công.',tagline:'Bắn · né · lên cấp'},
      {id:'runner',title:'Sky Runner',cat:'Runner',difficulty:'Dễ',icon:'cil-running',description:'Chạy không ngừng, nhảy qua chướng ngại và thu thập năng lượng.',tagline:'Chạy · nhảy · combo'},
      {id:'shooter',title:'Cyber Blaster',cat:'Shooter',difficulty:'Trung bình',icon:'cil-center-focus',description:'Ngắm bằng chuột hoặc chạm, hạ mục tiêu robot trước khi chúng áp sát.',tagline:'Ngắm · bắn · sinh tồn'},
      {id:'survival',title:'Survival Arena',cat:'Survival',difficulty:'Khó',icon:'cil-fire',description:'Sống sót giữa vòng vây, nhặt năng lượng và giữ khoảng cách với đối thủ.',tagline:'Sinh tồn · né · nâng cấp'},
      {id:'tank',title:'Tank Arena',cat:'Battle',difficulty:'Trung bình',icon:'cil-shield-alt',description:'Điều khiển xe tăng, ngắm mục tiêu và chiếm ưu thế trong đấu trường.',tagline:'Di chuyển · ngắm · chiến thuật'},
      {id:'brick-breaker',title:'Brick Breaker',cat:'Arcade',difficulty:'Dễ',icon:'cil-layers',description:'Đập toàn bộ gạch, giữ bóng trong sân và săn chuỗi combo.',tagline:'Bóng · combo · phá gạch'},
      {id:'fruit-catch',title:'Fruit Rush',cat:'Arcade',difficulty:'Dễ',icon:'cil-leaf',description:'Hứng trái cây rơi, né bom và cố gắng đạt điểm cao nhất.',tagline:'Phản xạ · tốc độ · điểm số'},
      {id:'basketball',title:'Hoop Master',cat:'Sports',difficulty:'Trung bình',icon:'cil-basketball',description:'Canh góc, lực và nhịp ném để ghi điểm liên tiếp.',tagline:'Góc ném · lực · streak'},
      {id:'bowling',title:'Strike Bowling',cat:'Sports',difficulty:'Dễ',icon:'cil-bowling',description:'Ngắm hướng và lực để hạ pin, săn strike và spare.',tagline:'Ngắm · lực · strike'},
      {id:'dodge',title:'Neon Dodge',cat:'Arcade',difficulty:'Khó',icon:'cil-speedometer',description:'Di chuyển giữa vùng nguy hiểm, né vật cản và gom sao năng lượng.',tagline:'Né · phản xạ · tốc độ'},
      {id:'tower-defense',title:'Mini Tower Defense',cat:'Strategy',difficulty:'Khó',icon:'cil-settings',description:'Đặt tháp phòng thủ, bảo vệ căn cứ và nâng cấp hỏa lực theo từng wave.',tagline:'Chiến thuật · phòng thủ · wave'}
    ],
    materials: [
      {title:'Chuyên đề dao động điều hòa',type:'PDF',meta:'6,8 MB · 18/09/2026',icon:'cil-description'},
      {title:'Slide bài giảng Điện trường',type:'PPTX',meta:'8,2 MB · 17/09/2026',icon:'cil-screen-desktop'},
      {title:'Bộ đề ôn tập Vật lý 11',type:'PDF',meta:'4,1 MB · 16/09/2026',icon:'cil-list-numbered'},
      {title:'Bài tập trắc nghiệm Hóa học',type:'DOCX',meta:'2,6 MB · 16/09/2026',icon:'cil-file'},
      {title:'Sơ đồ tư duy cảm ứng điện từ',type:'PNG',meta:'1,3 MB · 15/09/2026',icon:'cil-image-plus'},
      {title:'Bộ công thức Toán 11',type:'PDF',meta:'3,2 MB · 14/09/2026',icon:'cil-calculator'}
    ],
    notices: [
      {id:'n1',title:'Bài giảng Vật lý 11 mới được cập nhật',time:'10 phút trước',icon:'cil-book',unread:true},
      {id:'n2',title:'Có 4 bài tập đang chờ xử lý',time:'1 giờ trước',icon:'cil-task',unread:true},
      {id:'n3',title:'Một bộ học liệu mới đã được bổ sung',time:'Hôm qua',icon:'cil-folder-open',unread:false},
      {id:'n4',title:'Một tài liệu vừa được thêm vào Kho học liệu',time:'Hôm qua',icon:'cil-folder-open',unread:false},
      {id:'n5',title:'Có một câu hỏi mới trong Hỏi đáp',time:'2 ngày trước',icon:'cil-speech',unread:false}
    ],
    qna: [
      {id:'qna1',title:'Làm sao phân biệt lực ma sát nghỉ và ma sát trượt?',subject:'Vật lý 10',replies:6,time:'12 phút trước',status:'Mới'},
      {id:'qna2',title:'Cách tổ chức bài tập theo chủ đề Vật lý 11?',subject:'Vật lý 11',replies:3,time:'1 giờ trước',status:'Đang thảo luận'},
      {id:'qna3',title:'Thầy có tài liệu ôn tập dao động không?',subject:'Vật lý 11',replies:8,time:'Hôm qua',status:'Học liệu'}
    ]
  };

  // Runtime enrichment from the same IndexedDB used by the existing admin uploader.
  // This deliberately leaves the locked admin/panel/login source untouched.
  let runtimeVideos = DATA.videos.slice();
  let runtimeFiles = [];

  function openHubDB(){
    return new Promise((resolve,reject)=>{
      if(!window.indexedDB){ reject(new Error('IndexedDB unavailable')); return; }
      const req=indexedDB.open('giahuy-hub',2);
      req.onupgradeneeded=()=>{
        const db=req.result;
        if(!db.objectStoreNames.contains('files')) db.createObjectStore('files',{keyPath:'id',autoIncrement:true});
        if(!db.objectStoreNames.contains('music')) db.createObjectStore('music',{keyPath:'id',autoIncrement:true});
        if(!db.objectStoreNames.contains('meta')) db.createObjectStore('meta',{keyPath:'key'});
      };
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>reject(req.error||new Error('Cannot open giahuy-hub'));
    });
  }

  async function getHubAll(storeName){
    const db=await openHubDB();
    return await new Promise((resolve,reject)=>{
      const tx=db.transaction(storeName,'readonly');
      const req=tx.objectStore(storeName).getAll();
      req.onsuccess=()=>resolve(req.result||[]);
      req.onerror=()=>reject(req.error||new Error('Cannot read '+storeName));
    });
  }

  function isVideoFile(file){
    const mime=String(file?.mime||'').toLowerCase();
    const name=String(file?.fileName||file?.name||'').toLowerCase();
    return mime.startsWith('video/') || /\.(mp4|webm|ogg|ogv|mov|m4v|avi|mkv)$/.test(name);
  }

  async function hydrateRuntimeData(){
    try{
      runtimeFiles=await getHubAll('files');
      const uploads=runtimeFiles.filter(isVideoFile).map(file=>({
        id:`upload-${file.id}`,
        fileId:file.id,
        title:file.name||file.fileName||'Video đã tải lên',
        subject:file.cat||'Video',
        duration:'Video tải lên',
        views:String(file.views||0),
        icon:'cil-video',
        src:'',
        uploaded:true,
        fileName:file.fileName||file.name||''
      }));
      runtimeVideos=[...uploads,...DATA.videos];
    }catch{
      runtimeFiles=[];
      runtimeVideos=DATA.videos.slice();
    }
  }

  const runtimeReady=hydrateRuntimeData();

  // Expand demo decks into multiple actual study cards.
  DATA.flashcards.forEach((f)=>{
    if(f.items?.length) return;
    const base={front:f.front,back:f.back};
    if(f.id==='fc1') f.items=[base,{front:'Định luật I Newton nói gì?',back:'Nếu hợp lực tác dụng lên vật bằng 0, vật giữ trạng thái đứng yên hoặc chuyển động thẳng đều.'},{front:'Đơn vị SI của lực?',back:'Newton (N).'}];
    else if(f.id==='fc2') f.items=[base,{front:'Tần số góc của dao động điều hòa?',back:'ω = 2π/T = 2πf.'},{front:'Biên độ là gì?',back:'Giá trị lớn nhất của li độ trong dao động điều hòa.'}];
    else if(f.id==='fc3') f.items=[base,{front:'velocity',back:'vận tốc'},{front:'frequency',back:'tần số'},{front:'period',back:'chu kỳ'}];
    else if(f.id==='fc4') f.items=[base,{front:'pH < 7 biểu thị môi trường gì?',back:'Môi trường axit.'},{front:'pH = 7 biểu thị môi trường gì?',back:'Môi trường trung tính ở điều kiện quy ước.'}];
    else f.items=[base];
    f.cards=f.items.length;
  });

  const ICON = (name, label='') => `<i class="${name}"${label ? ` aria-hidden="true"` : ''}></i>`;
  const qs = (s,c=document)=>c.querySelector(s);
  const qsa = (s,c=document)=>[...c.querySelectorAll(s)];
  const esc = v => String(v ?? '').replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]));
  const readJSON = (key, fallback) => { try { const v=JSON.parse(localStorage.getItem(key)||'null'); return v ?? fallback; } catch { return fallback; } };
  const writeJSON = (key, value) => localStorage.setItem(key, JSON.stringify(value));

  function track(type, payload={}) {
    const stats = readJSON('giahuy-stats-events', []);
    stats.push({type, payload, ts:Date.now()});
    while(stats.length > 500) stats.shift();
    writeJSON('giahuy-stats-events', stats);
  }

  function theme() {
    const key='giahuy-theme';
    const apply=mode=>{
      document.body.classList.toggle('gh-dark',mode==='dark');
      qsa('[data-theme-toggle], [data-theme]').forEach(btn=>{
        const icon=qs('i',btn);
        if(icon) icon.className=mode==='dark'?'cil-sun':'cil-moon';
        btn.setAttribute('aria-pressed', mode==='dark'?'true':'false');
        btn.title=mode==='dark'?'Chuyển sang giao diện sáng':'Chuyển sang giao diện tối';
      });
    };
    const saved=localStorage.getItem(key)||'light';
    apply(saved);
    qsa('[data-theme-toggle], [data-theme]').forEach(btn=>{
      if(btn.dataset.themeBound) return;
      btn.dataset.themeBound='1';
      btn.addEventListener('click',()=>{
        const next=document.body.classList.contains('gh-dark')?'light':'dark';
        localStorage.setItem(key,next); apply(next);
      });
    });
    window.addEventListener('storage',e=>{if(e.key===key) apply(e.newValue||'light');});
  }

  function wireSearch(root) {
    const input=qs('[data-page-search]',root);
    const items=()=>qsa('[data-searchable]',root);
    let activeChip='all';
    const run=()=>{
      const term=(input?.value||'').trim().toLowerCase();
      let visible=0;
      items().forEach(el=>{
        const hay=(el.dataset.searchable||el.textContent).toLowerCase();
        const value=(el.dataset.category||'').toLowerCase();
        const chipOk=activeChip==='all'||value===activeChip||value.startsWith(activeChip+' ')||value.startsWith(activeChip+'-');
        const textOk=!term||hay.includes(term);
        const ok=chipOk&&textOk;
        el.hidden=!ok;
        if(ok) visible++;
      });
      const empty=qs('[data-filter-empty]',root);
      if(empty) empty.hidden=visible>0;
    };
    input?.addEventListener('input',run);
    qsa('[data-chip]',root).forEach(btn=>btn.addEventListener('click',()=>{
      qsa('[data-chip]',root).forEach(x=>x.classList.remove('active'));
      btn.classList.add('active');
      activeChip=(btn.dataset.chip||'all').toLowerCase();
      run();
    }));
    run();
  }

  function navHTML(active) {
    const links=[
      ['index.html','cil-home','Trang chủ','home'],['plugins.html','cil-book','Bài giảng','plugins'],['config.html','cil-notes','Giáo án','config'],['mods.html','cil-task','Bài tập','mods'],['assets.html','cil-education','Học liệu','assets'],['tools.html','cil-settings','Công cụ','tools'],['resources.html','cil-folder-open','Tài nguyên','resources'],['guide.html','cil-lightbulb','Hướng dẫn','guide'],['my-library.html','cil-heart','Kho cá nhân','library'],['qna.html','cil-speech','Hỏi đáp','qna'],['flashcards.html','cil-layers','Flashcard','flashcards'],['quiz.html','cil-list-numbered','Quiz','quiz'],['videos.html','cil-video','Video','videos'],['games.html','cil-videogame','Game Center','games'],['statistics.html','cil-chart','Thống kê','statistics'],['notifications.html','cil-bell','Thông báo','notifications'],['profile.html','cil-user','Hồ sơ','profile'],['settings.html','cil-cog','Cài đặt','settings']
    ];
    return links.map(([href,ico,label,key])=>`<a class="gh-side-link ${active===key?'active':''}" href="${href}">${ICON(ico)}<span>${label}</span></a>`).join('');
  }

  function pageShell({active,title,desc,kicker='THẦY GIA HUY'}) {
    document.body.innerHTML=`<div class="gh-app"><header class="gh-header"><a class="gh-brand" href="index.html"><img src="assets/logo-giahuy.png" alt="Thầy Gia Huy"><span class="gh-brand-copy"><b>THẦY GIA HUY</b><span>Nền tảng giáo dục trực tuyến</span></span></a><label class="gh-header-search">${ICON('cil-search')}<input id="globalSearch" placeholder="Tìm kiếm bài giảng, tài liệu, video, game..." autocomplete="off"></label><nav class="gh-header-nav"><a href="index.html" class="${active==='home'?'active':''}">Trang chủ</a><a href="plugins.html" class="${active==='plugins'?'active':''}">Bài giảng</a><a href="games.html" class="${active==='games'?'active':''}">Game</a></nav><div class="gh-header-actions"><button class="gh-icon-btn" data-theme-toggle aria-label="Đổi giao diện">${ICON('cil-moon')}</button><a class="gh-icon-btn" href="notifications.html" title="Thông báo">${ICON('cil-bell')}</a><a href="profile.html"><img class="gh-avatar" src="assets/images/avatar.gif" alt="Hồ sơ Thầy Gia Huy"></a></div></header><div class="gh-layout"><aside class="gh-sidebar"><div class="gh-side-label">Điều hướng</div>${navHTML(active)}<div class="gh-side-divider"></div><div class="gh-side-label">Giáo viên</div><a class="gh-side-link" href="teacher.html">${ICON('cil-school')}<span>Khu giáo viên</span></a><a class="gh-side-link" href="admin-panel.html">${ICON('cil-shield-alt')}<span>Quản trị</span></a><div class="gh-quote">“Học tập hiệu quả bắt đầu từ những trải nghiệm trực quan.”<small>— Thầy Gia Huy</small></div></aside><main class="gh-main"><div class="gh-container"><div class="gh-page-head"><div><div class="kicker">${esc(kicker)}</div><h1>${esc(title)}</h1><p>${esc(desc)}</p></div><div class="gh-actions"><a class="gh-btn" href="index.html">${ICON('cil-arrow-left')} Trang chủ</a></div></div><div id="pageRoot"></div><footer class="gh-footer"><div class="gh-footer-inner"><span>© ${new Date().getFullYear()} Thầy Gia Huy</span><span>Học tập trực quan · Thầy Gia Huy</span></div></footer></div></main></div><nav class="gh-bottom-nav"><a class="${active==='home'?'active':''}" href="index.html">${ICON('cil-home')}Trang chủ</a><a class="${active==='plugins'?'active':''}" href="plugins.html">${ICON('cil-book')}Bài giảng</a><a class="${active==='games'?'active':''}" href="games.html">${ICON('cil-videogame')}Game</a><a href="settings.html">${ICON('cil-menu')}Menu</a></nav></div>`;
    document.title=`${title} — Thầy Gia Huy`;
    theme();
    qs('#globalSearch')?.addEventListener('keydown',e=>{
      if(e.key==='Enter'){
        const q=e.target.value.trim();
        if(q) location.href=`index.html?search=${encodeURIComponent(q)}`;
      }
    });
    return qs('#pageRoot');
  }

  function cardCourse(c){
    return `<article class="gh-card gh-course gh-hover" data-searchable="${esc(c.title+' '+c.tag+' '+c.desc)}" data-category="${esc(c.tag)}"><div class="gh-thumb gh-thumb-icon">${ICON(c.icon)}</div><div class="gh-course-body"><span class="gh-tag">${esc(c.tag)}</span><div class="gh-title">${esc(c.title)}</div><p class="gh-desc">${esc(c.desc)}</p><div class="gh-meta"><span>${ICON('cil-book')}${c.lessons} bài</span><span>${ICON('cil-check')}${c.done} hoàn thành</span></div><div class="gh-progress"><i style="width:${c.progress}%"></i></div><div class="gh-card-foot"><span class="muted">${c.progress}% tiến độ</span><a class="gh-btn soft" href="plugins.html?course=${encodeURIComponent(c.id)}" data-track="course">Tiếp tục</a></div></div></article>`;
  }

  function renderCourses(root, filter=true){
    root.innerHTML=`<div class="gh-grid gh-grid-3">${DATA.courses.map(cardCourse).join('')}</div><div class="gh-empty" data-filter-empty hidden>${ICON('cil-search')}Không tìm thấy khóa học phù hợp.</div>`;
    if(filter) wireSearch(root);
    const requested=new URLSearchParams(location.search).get('course');
    if(requested){const c=DATA.courses.find(x=>x.id===requested);if(c)setTimeout(()=>openCourseDetails(c),0);}
  }

  function openCourseDetails(c){
    const modal=openModal(`<div class="gh-modal-head"><div><span class="kicker">KHÓA HỌC</span><h2>${esc(c.title)}</h2></div><button class="gh-icon-btn" data-close-modal aria-label="Đóng">${ICON('cil-x')}</button></div><div class="gh-panel inset"><div class="gh-meta"><span>${esc(c.tag)}</span><span>${c.lessons} bài</span><span>${c.progress}% tiến độ</span></div><p class="gh-desc">${esc(c.desc)}</p><div class="gh-progress"><i style="width:${c.progress}%"></i></div></div><div class="gh-modal-actions"><a class="gh-btn primary" href="mods.html">${ICON('cil-task')} Bài tập</a><button class="gh-btn" data-close-modal>Đóng</button></div>`);
    qs('[data-close-modal]',modal)?.addEventListener('click',()=>closeModal(modal));
    track('course_open',{id:c.id});
  }

  async function renderVideos(root){
    await runtimeReady;
    const videos=runtimeVideos;
    root.innerHTML=`<section class="gh-toolbar"><label class="gh-search">${ICON('cil-search')}<input data-page-search placeholder="Tìm video bài giảng..."></label><span class="gh-chip active">${ICON('cil-video')}${videos.length} video</span></section><div class="gh-grid gh-grid-3">${videos.map(v=>`<article class="gh-card gh-video gh-hover" data-searchable="${esc(v.title+' '+v.subject+' '+(v.fileName||''))}"><div class="gh-thumb gh-thumb-icon"><span class="gh-video-icon">${ICON(v.icon)}</span><span class="gh-play">${ICON('cil-media-play')}</span><span class="gh-duration">${esc(v.duration)}</span>${v.uploaded?'<span class="gh-upload-badge">Đã tải lên</span>':''}</div><div class="gh-card pad"><div class="gh-title">${esc(v.title)}</div><div class="gh-meta"><span>${esc(v.subject)}</span><span>${esc(v.views)} lượt xem</span></div><div class="gh-card-foot"><span class="muted">${v.uploaded?'Video từ thư viện':'Video bài giảng'}</span><button class="gh-btn primary" data-watch-video="${esc(v.id)}">Xem video</button></div></div></article>`).join('')}</div><div class="gh-empty" data-filter-empty hidden>${ICON('cil-search')}Không tìm thấy video.</div>`;
    wireSearch(root);
    qsa('[data-watch-video]',root).forEach(btn=>btn.addEventListener('click',async()=>openVideo(runtimeVideos.find(v=>v.id===btn.dataset.watchVideo))));
    const requested=new URLSearchParams(location.search).get('video');
    if(requested){const v=runtimeVideos.find(x=>x.id===requested);if(v)setTimeout(()=>openVideo(v),0);}
  }

  function liveAssignments(){
    return window.GiaHuyContent?.assignments?.(DATA.assignments) || DATA.assignments.slice();
  }

  function liveQuizzes(){
    return window.GiaHuyContent?.quizzes?.(DATA.quizzes) || DATA.quizzes.slice();
  }

  function liveFlashcardDecks(){
    const decks=window.GiaHuyContent?.flashcardDecks?.(DATA.flashcards) || DATA.flashcards.slice();
    decks.forEach(d=>{
      if(!Array.isArray(d.items)||!d.items.length){
        const base=d.front?{front:d.front,back:d.back}:null;
        d.items=base?[base]:[];
      }
      d.cards=d.items.length || Number(d.cards||0);
    });
    return decks;
  }

  function renderAssignments(root){
    const filters=['Tất cả','Chưa làm','Đang làm','Đã hoàn thành','Quá hạn'];
    const assignments=liveAssignments();
    root.innerHTML=`<section class="gh-toolbar"><label class="gh-search">${ICON('cil-search')}<input data-page-search placeholder="Tìm bài tập..." autocomplete="off"></label><div class="gh-filter-row">${filters.map((x,i)=>`<button class="gh-chip ${i===0?'active':''}" data-status="${esc(x)}">${esc(x)}</button>`).join('')}</div><a class="gh-btn primary" href="mods.html">${ICON('cil-plus')} Quản lý bài tập</a></section><div class="gh-grid gh-grid-2" id="assignmentList"></div><div class="gh-empty" id="assignmentEmpty" hidden>${ICON('cil-task')}Không có bài tập phù hợp.</div>`;
    const list=qs('#assignmentList',root);
    const render=status=>{
      const arr=(status==='Tất cả'?assignments:assignments.filter(a=>a.status===status));
      list.innerHTML=arr.map(a=>`<article class="gh-card pad gh-hover" data-searchable="${esc(a.title+' '+a.subject+' '+a.status+' '+a.deadline)}"><div class="gh-card-foot tight"><span class="gh-tag">${esc(a.subject)}</span><span class="gh-status ${a.status==='Đã hoàn thành'?'success':a.status==='Quá hạn'?'danger':'progress'}">${esc(a.status)}</span></div><div class="gh-title">${esc(a.title)}</div><p class="gh-desc">${esc(a.desc||'Theo dõi nội dung, hạn nộp và tiến độ của bài tập.')}</p><div class="gh-meta"><span>${ICON('cil-calendar')}${esc(a.deadline)}</span><span>${Number(a.points||0)} điểm</span></div><div class="gh-progress"><i style="width:${Math.max(0,Math.min(100,Number(a.progress||0)))}%"></i></div><div class="gh-card-foot"><span class="muted">${Math.max(0,Math.min(100,Number(a.progress||0)))}% hoàn thành</span><a class="gh-btn ${Number(a.progress||0)===100?'':'primary'}" href="mods.html?assignment=${encodeURIComponent(a.id)}">${Number(a.progress||0)===100?'Xem kết quả':'Làm bài'}</a></div></article>`).join('');
      qs('#assignmentEmpty',root).hidden=arr.length>0;
      const search=qs('[data-page-search]',root);
      if(search){ const term=search.value.trim().toLowerCase(); let visible=0; qsa('[data-searchable]',list).forEach(el=>{const ok=!term||el.dataset.searchable.toLowerCase().includes(term);el.hidden=!ok;if(ok)visible++;}); if(term)qs('#assignmentEmpty',root).hidden=visible>0; }
    };
    render('Tất cả');
    qsa('[data-status]',root).forEach(btn=>btn.addEventListener('click',()=>{qsa('[data-status]',root).forEach(x=>x.classList.remove('active'));btn.classList.add('active');render(btn.dataset.status)}));
    wireSearch(root);
    const requested=new URLSearchParams(location.search).get('assignment');
    if(requested){const a=assignments.find(x=>x.id===requested);if(a)setTimeout(()=>openAssignmentDetails(a),0);}
  }

  function openAssignmentDetails(a){
    const complete=Number(a.progress||0)>=100||a.status==='Đã hoàn thành';
    const modal=openModal(`<div class="gh-modal-head"><div><span class="kicker">BÀI TẬP</span><h2>${esc(a.title)}</h2></div><button class="gh-icon-btn" data-close-modal aria-label="Đóng">${ICON('cil-x')}</button></div><div class="gh-panel inset"><div class="gh-meta"><span>${esc(a.subject)}</span><span>Hạn ${esc(a.deadline)}</span><span>${esc(a.status)}</span></div><p class="gh-desc">${esc(a.desc||'Xem đầy đủ nội dung và mở trang bài tập để thực hiện.')}</p><p class="gh-note">${ICON(complete?'cil-check-circle':'cil-info')} ${complete?'Bài tập này đã được ghi nhận hoàn thành.':'Bấm “Mở bài tập” để đi tới luồng bài tập hiện tại của website.'}</p><div class="gh-progress"><i style="width:${Math.max(0,Math.min(100,Number(a.progress||0)))}%"></i></div></div><div class="gh-modal-actions">${complete?`<a class="gh-btn soft" href="mods.html?assignment=${encodeURIComponent(a.id)}">${ICON('cil-task')} Xem bài tập</a>`:`<a class="gh-btn primary" href="mods.html?assignment=${encodeURIComponent(a.id)}">${ICON('cil-task')} Mở bài tập</a>`}<button class="gh-btn" data-close-modal>Đóng</button></div>`);
    modal.querySelectorAll('a[href*="assignment="]').forEach(el=>el.addEventListener('click',()=>track('assignment_open',{id:a.id})));
    track('assignment_open',{id:a.id});
  }

  function renderFlashcards(root){
    const decks=liveFlashcardDecks();
    root.innerHTML=`<section class="gh-toolbar"><label class="gh-search">${ICON('cil-search')}<input data-page-search placeholder="Tìm bộ flashcard..." autocomplete="off"></label><button class="gh-btn primary" data-create-deck>${ICON('cil-plus')} Tạo bộ thẻ</button></section><div class="gh-grid gh-grid-4" id="fcGrid">${decks.map(f=>`<article class="gh-card pad gh-hover" data-searchable="${esc(f.title+' '+f.subject)}"><div class="gh-stat-icon">${ICON(f.icon||'cil-layers')}</div><div class="gh-title">${esc(f.title)}</div><div class="gh-meta"><span>${Number(f.cards||f.items?.length||0)} thẻ</span><span>${esc(f.subject||'Chủ đề')}</span></div><div class="gh-progress"><i style="width:${Math.max(0,Math.min(100,Number(f.progress||0)))}%"></i></div><div class="gh-card-foot"><span class="muted">${Math.max(0,Math.min(100,Number(f.progress||0)))}% đã biết</span><button class="gh-btn primary" data-study-fc="${esc(f.id)}">Ôn tập</button></div></article>`).join('')}</div><div class="gh-empty" data-filter-empty hidden>${ICON('cil-search')}Không tìm thấy bộ thẻ.</div>`;
    wireSearch(root);
    qsa('[data-study-fc]',root).forEach(btn=>btn.addEventListener('click',()=>openFlashcard(decks.find(x=>x.id===btn.dataset.studyFc))));
    qs('[data-create-deck]',root)?.addEventListener('click',()=>openSimpleForm('Tạo bộ flashcard','Ví dụ: Công thức Vật lý 11','deck'));
    const requested=new URLSearchParams(location.search).get('deck');
    if(requested){const d=decks.find(x=>x.id===requested);if(d)setTimeout(()=>openFlashcard(d),0);}
  }

  function renderQuiz(root){
    const quizzes=liveQuizzes();
    root.innerHTML=`<section class="gh-toolbar"><label class="gh-search">${ICON('cil-search')}<input data-page-search placeholder="Tìm quiz..." autocomplete="off"></label><span class="gh-chip active">${ICON('cil-list-numbered')}${quizzes.length} bộ quiz</span></section><div class="gh-grid gh-grid-3">${quizzes.map(q=>`<article class="gh-card pad gh-hover" data-searchable="${esc(q.title+' '+q.subject+' '+q.level)}"><div class="gh-stat-icon">${ICON(q.icon||'cil-list-numbered')}</div><div class="gh-title">${esc(q.title)}</div><p class="gh-desc">${Number(q.questions||q.items?.length||0)} câu · ${Number(q.minutes||0)} phút · ${esc(q.level||'Theo chương trình')}</p><div class="gh-card-foot"><span class="muted">${esc(q.subject)}</span><button class="gh-btn primary" data-start-quiz="${esc(q.id)}">Bắt đầu</button></div></article>`).join('')}</div><div class="gh-empty" data-filter-empty hidden>${ICON('cil-search')}Không tìm thấy quiz.</div><section class="gh-section gh-panel"><div class="gh-section-head"><div><h2>Lịch sử luyện tập</h2><p>Kết quả được lưu trên thiết bị hiện tại.</p></div></div><div id="quizHistory"></div></section>`;
    wireSearch(root);
    qsa('[data-start-quiz]',root).forEach(btn=>btn.addEventListener('click',()=>openQuiz(quizzes.find(q=>q.id===btn.dataset.startQuiz))));
    renderQuizHistory(qs('#quizHistory',root));
  }

  function renderQuizHistory(root){
    const history=window.GiaHuyContent?.quizHistory?.() || readJSON('giahuy-quiz-history',[]);
    root.innerHTML=history.length?`<div class="gh-list">${history.slice().reverse().slice(0,10).map(h=>{const pct=h.total?Math.round(h.score/h.total*100):0;return `<div class="gh-list-item"><span class="gh-list-icon">${ICON('cil-check-circle')}</span><div class="gh-list-main"><b>${esc(h.title||'Quiz')}</b><span>${h.score}/${h.total} câu đúng · ${new Date(h.ts).toLocaleString('vi-VN')}</span></div><span class="gh-chip active">${pct}%</span></div>`}).join('')}</div>`:`<div class="gh-empty">${ICON('cil-clock')}Chưa có lượt luyện tập nào.</div>`;
  }

  function gameBestScore(id){
    const map=readJSON('giahuy-game-highscores',{});
    return Number(map?.[id]||0);
  }

  function renderGames(root){
    const categories=['all','Racing','Shooter','Runner','Survival','Battle','Arcade','Sports','Strategy'];
    const featured=DATA.games.slice(0,4);
    root.innerHTML=`
      <section class="gh-game-hero">
        <div class="gh-game-hero-copy">
          <span class="gh-game-kicker">GAME CENTER</span>
          <h2>Giải lao thật vui với những trò chơi thực</h2>
          <p>Chơi trực tiếp trên trình duyệt, lưu kỷ lục trên thiết bị và chọn game theo thể loại. Không có câu hỏi học tập trong gameplay.</p>
          <div class="gh-game-hero-actions">
            <button class="gh-btn primary" data-featured-game="${esc(featured[0]?.id||'racing')}">${ICON('cil-media-play')} Chơi ngay</button>
            <span class="gh-game-stat"><b>${DATA.games.length}</b><small>trò chơi</small></span>
            <span class="gh-game-stat"><b>${categories.length-1}</b><small>thể loại</small></span>
          </div>
        </div>
        <div class="gh-game-hero-art" aria-hidden="true">
          <div class="game-orb orb-a"></div><div class="game-orb orb-b"></div><div class="game-orb orb-c"></div>
          <div class="game-hero-badge"><span>${ICON('cil-videogame')}</span><b>THẦY GIA HUY</b><small>Arcade Zone</small></div>
        </div>
      </section>
      <section class="gh-card pad gh-game-toolbar-card">
        <div class="gh-toolbar">
          <label class="gh-search">${ICON('cil-search')}<input data-page-search placeholder="Tìm game theo tên hoặc thể loại..." autocomplete="off"></label>
          <div class="gh-filter-row">${categories.map((x,i)=>`<button type="button" class="gh-chip ${i===0?'active':''}" data-chip="${x}">${x==='all'?'Tất cả':x}</button>`).join('')}</div>
        </div>
      </section>
      <section class="gh-game-featured gh-section">
        <div class="gh-section-head"><div><span class="kicker">ĐỀ XUẤT</span><h2>Chơi ngay</h2><p>Những game nổi bật để mở nhanh.</p></div></div>
        <div class="gh-grid gh-grid-4">${featured.map(g=>gameCardMarkup(g,true)).join('')}</div>
      </section>
      <section class="gh-section">
        <div class="gh-section-head"><div><span class="kicker">TẤT CẢ GAME</span><h2>Kho trò chơi</h2><p>Mỗi game có luật chơi và cơ chế riêng.</p></div></div>
        <div class="gh-grid gh-grid-4" id="gamesGrid">${DATA.games.map(g=>gameCardMarkup(g,false)).join('')}</div>
      </section>
      <div class="gh-empty" data-filter-empty hidden>${ICON('cil-search')}Không tìm thấy game phù hợp.</div>`;

    wireSearch(root);
    qsa('[data-play-game], [data-featured-game]',root).forEach(btn=>btn.addEventListener('click',()=>{
      const id=btn.dataset.playGame||btn.dataset.featuredGame;
      const g=DATA.games.find(x=>x.id===id);
      if(g)openGame(g);
    }));
    const requested=new URLSearchParams(location.search).get('game');
    if(requested){const g=DATA.games.find(x=>x.id===requested);if(g)setTimeout(()=>openGame(g),0);}
  }

  function gameCardMarkup(g,featured=false){
    return `<article class="gh-card gh-game gh-game-pro gh-hover ${featured?'featured':''}" data-searchable="${esc(g.title+' '+g.cat+' '+g.description+' '+g.tagline)}" data-category="${esc(g.cat)}">
      <div class="gh-game-cover game-cover-${esc(g.id)}">
        <div class="gh-game-cover-bg"></div>
        <span class="gh-game-icon">${ICON(g.icon)}</span>
        <span class="gh-game-type">${esc(g.cat)}</span>
        <span class="gh-game-difficulty">${esc(g.difficulty)}</span>
        ${featured?'<span class="gh-game-featured-badge">NỔI BẬT</span>':''}
      </div>
      <div class="gh-game-body-pro">
        <div class="gh-game-title-row"><h3>${esc(g.title)}</h3><span class="gh-game-best">${gameBestScore(g.id).toLocaleString('vi-VN')}</span></div>
        <p>${esc(g.description)}</p>
        <div class="gh-game-meta-pro"><span>${ICON('cil-gamepad')} ${esc(g.tagline)}</span><span>${ICON('cil-star')} Kỷ lục</span></div>
        <div class="gh-card-foot"><span class="muted">${esc(g.cat)}</span><button type="button" class="gh-btn primary" data-play-game="${esc(g.id)}">${ICON('cil-media-play')} Chơi ngay</button></div>
      </div>
    </article>`;
  }

  async function renderStatistics(root){
    const events=readJSON('giahuy-stats-events',[]);
    await runtimeReady;
    const count=t=>events.filter(e=>e.type===t).length;
    const fileCounts={};runtimeFiles.forEach(f=>{fileCounts[f.cat]=(fileCounts[f.cat]||0)+1;});
    const today=new Date();today.setHours(0,0,0,0);
    const todayEvents=events.filter(e=>e.ts>=today.getTime()).length;
    const stats=[['cil-book','Khóa học đã mở',count('course_open')],['cil-task','Bài tập đã mở',count('assignment_open')],['cil-videogame','Lượt chơi game',count('game_open')],['cil-video','Video đã xem',count('video_open')],['cil-layers','Phiên flashcard',count('flashcard_session')],['cil-list-numbered','Quiz hoàn thành',count('quiz_complete')],['cil-file','Tài nguyên đã upload',runtimeFiles.length]];
    const activityCounts=[['Bài tập','assignment_open'],['Video','video_open'],['Flashcard','flashcard_session'],['Game','game_open']];
    const activityTotal=activityCounts.reduce((sum,[,type])=>sum+count(type),0);
    const bars=activityCounts.map(([label,type])=>[label,activityTotal?Math.round(count(type)/activityTotal*100):0,count(type)]);
    const quizHistory=window.GiaHuyContent?.quizHistory?.() || [];
    const quizScore=quizHistory.length?Math.round(quizHistory.reduce((sum,h)=>sum+(h.total?Number(h.score||0)/Number(h.total||1):0),0)/quizHistory.length*100):0;
    root.innerHTML=`<div class="gh-grid gh-grid-4 stats">${stats.map(x=>`<div class="gh-card gh-stat"><span class="gh-stat-icon">${ICON(x[0])}</span><span><small>${x[1]}</small><strong>${x[2]}</strong></span></div>`).join('')}</div><section class="gh-detail-grid gh-section"><section class="gh-panel"><div class="gh-section-head"><div><h2>Phân bố hoạt động</h2><p>Tỷ trọng được tính trực tiếp từ các sự kiện đã ghi nhận trên thiết bị.</p></div></div><div class="gh-stat-bars">${bars.map(x=>`<div class="gh-bar-row"><div><span>${x[0]}</span><b>${x[1]}% · ${x[2]} lượt</b></div><div class="gh-bar"><i style="width:${x[1]}%"></i></div></div>`).join('')}</div></section><aside class="gh-panel"><div class="gh-section-head"><div><h2>Điểm quiz gần đây</h2><p>Dựa trên ${quizHistory.length} lượt làm quiz đã lưu.</p></div></div><div class="gh-mini-stats"><div><small>Điểm trung bình</small><b>${quizScore}%</b></div><div><small>File thực tế</small><b>${runtimeFiles.length}</b></div><div><small>Hôm nay</small><b>${todayEvents}</b></div><div><small>Tổng sự kiện</small><b>${events.length}</b></div></div></aside></section><section class="gh-section gh-panel"><div class="gh-section-head"><div><h2>Kho nội dung thực tế</h2><p>Dữ liệu file đọc từ IndexedDB của website.</p></div></div><div class="gh-mini-stats">${Object.entries({plugins:'Bài giảng',config:'Giáo án',mods:'Bài tập',assets:'Học liệu',tools:'Công cụ',resources:'Tài nguyên',guide:'Hướng dẫn'}).map(([k,v])=>`<div><small>${v}</small><b>${fileCounts[k]||0}</b></div>`).join('')}</div></section><section class="gh-section gh-panel"><div class="gh-section-head"><div><h2>Hoạt động gần đây</h2><p>${todayEvents} hoạt động trong hôm nay · ${events.length} hoạt động tổng cộng.</p></div></div><div class="gh-activity">${events.slice().reverse().slice(0,10).map(e=>`<div class="gh-activity-item"><span class="gh-dot"></span><div><b>${esc(eventLabel(e.type))}</b><span>${new Date(e.ts).toLocaleString('vi-VN')}</span></div></div>`).join('')||'<div class="gh-empty">Chưa có dữ liệu.</div>'}</div></section>`;
  }

  function eventLabel(type){
    return ({course_open:'Mở khóa học',assignment_open:'Mở bài tập',game_open:'Chơi game',video_open:'Mở video',flashcard_session:'Ôn flashcard',quiz_complete:'Hoàn thành quiz'}[type]||'Hoạt động');
  }

  function renderNotifications(root){
    const read=readJSON('giahuy-read-notices',{});
    root.innerHTML=`<section class="gh-panel"><div class="gh-section-head"><div><h2>Tất cả thông báo</h2><p>Thông báo mới nhất của hệ thống.</p></div><button class="gh-btn" id="markAllRead">${ICON('cil-check')} Đánh dấu đã đọc</button></div><div class="gh-list">${DATA.notices.map(n=>{const isRead=!!read[n.id]||!n.unread;return `<button class="gh-list-item gh-notice ${isRead?'read':''}" data-notice="${n.id}"><span class="gh-list-icon">${ICON(n.icon)}</span><span class="gh-list-main"><b>${esc(n.title)}</b><span>${esc(n.time)}</span></span><span class="gh-chip ${isRead?'':'active'}">${isRead?'Đã đọc':'Mới'}</span></button>`}).join('')}</div></section>`;
    qsa('[data-notice]',root).forEach(el=>el.addEventListener('click',()=>{const r=readJSON('giahuy-read-notices',{});r[el.dataset.notice]=true;writeJSON('giahuy-read-notices',r);el.classList.add('read');const chip=qs('.gh-chip',el);if(chip){chip.textContent='Đã đọc';chip.classList.remove('active');}}));
    qs('#markAllRead',root)?.addEventListener('click',()=>{const r=readJSON('giahuy-read-notices',{});DATA.notices.forEach(n=>r[n.id]=true);writeJSON('giahuy-read-notices',r);renderNotifications(root)});
  }

  function renderProfile(root){
    const profile=readJSON('giahuy-profile',{name:'Thầy Gia Huy',role:'Giáo viên · Người xây dựng nội dung học tập',bio:'Chia sẻ bài giảng, học liệu, bài tập, công cụ và trải nghiệm trực quan giúp việc học hiệu quả hơn.',website:'',className:'THPT'});
    root.innerHTML=`<section class="gh-grid gh-grid-2"><article class="gh-card pad"><div class="gh-profile"><img src="assets/images/avatar.gif" alt="${esc(profile.name)}"><div><h2>${esc(profile.name)}</h2><p>${esc(profile.role)}</p></div></div><div class="gh-mini-stats"><div><small>Bài giảng</small><b>${DATA.courses.length}</b></div><div><small>Học liệu</small><b>${DATA.materials.length}</b></div><div><small>Game</small><b>${DATA.games.length}</b></div></div></article><article class="gh-card pad"><div class="gh-section-head"><div><h2>Giới thiệu</h2><p>${esc(profile.className)}</p></div><button class="gh-btn primary" id="editProfile">${ICON('cil-pencil')} Chỉnh hồ sơ</button></div><p class="gh-desc">${esc(profile.bio)}</p>${profile.website?`<a class="gh-link" href="${esc(profile.website)}" target="_blank" rel="noopener">${ICON('cil-globe-alt')} Website cá nhân</a>`:''}</article></section><section class="gh-section gh-panel"><div class="gh-section-head"><div><h2>Hoạt động gần đây</h2><p>Hoạt động trên website này.</p></div></div><div class="gh-list">${DATA.notices.slice(0,4).map(n=>`<div class="gh-list-item"><span class="gh-list-icon">${ICON(n.icon)}</span><div class="gh-list-main"><b>${esc(n.title)}</b><span>${esc(n.time)}</span></div></div>`).join('')}</div></section>`;
    qs('#editProfile',root)?.addEventListener('click',()=>openProfileForm());
  }

  function renderSettings(root){
    const notifications=localStorage.getItem('giahuy-notifications-enabled')!=='false';
    root.innerHTML=`<div class="gh-detail-grid"><section class="gh-panel"><div class="gh-section-head"><div><h2>Tùy chọn</h2><p>Thiết lập chỉ áp dụng cho các khu vực được phép chỉnh sửa.</p></div></div><div class="gh-setting-list"><div class="gh-setting"><span class="gh-list-icon">${ICON('cil-brightness')}</span><div><b>Giao diện</b><small>Chuyển giữa sáng và tối.</small></div><button class="gh-btn" data-theme-toggle>${ICON('cil-moon')} Đổi</button></div><div class="gh-setting"><span class="gh-list-icon">${ICON('cil-bell')}</span><div><b>Thông báo</b><small>Nhận cập nhật nội dung và hoạt động mới.</small></div><button class="gh-switch ${notifications?'on':''}" id="notificationToggle" aria-pressed="${notifications}"><span></span></button></div><div class="gh-setting"><span class="gh-list-icon">${ICON('cil-lock-locked')}</span><div><b>Vùng khóa</b><small>Panel và Login được giữ nguyên, không chỉnh sửa.</small></div><span class="gh-chip active">Bảo vệ</span></div></div></section><aside class="gh-panel"><h2>Trợ giúp</h2><p class="gh-desc">Các thay đổi ở đây không tác động tới Panel, Login, Register hoặc Authentication.</p><a class="gh-btn primary" href="guide.html">${ICON('cil-lightbulb')} Xem hướng dẫn</a></aside></div>`;
    theme();
    qs('#notificationToggle',root)?.addEventListener('click',e=>{const on=!e.currentTarget.classList.contains('on');e.currentTarget.classList.toggle('on',on);e.currentTarget.setAttribute('aria-pressed',String(on));localStorage.setItem('giahuy-notifications-enabled',String(on));});
  }

  function renderQna(root){
    let questions=readJSON('giahuy-qna',DATA.qna);
    questions=questions.map(q=>({...q,replyItems:Array.isArray(q.replyItems)?q.replyItems:[]}));
    const save=()=>writeJSON('giahuy-qna',questions);
    const paint=()=>{
      root.innerHTML=`<section class="gh-toolbar"><label class="gh-search">${ICON('cil-search')}<input id="qnaSearch" placeholder="Tìm câu hỏi..." autocomplete="off"></label><button class="gh-btn primary" id="askQuestion">${ICON('cil-plus')} Đặt câu hỏi</button></section><div class="gh-list" id="qnaList">${questions.map(q=>`<button class="gh-list-item qna-row" data-qna="${esc(q.id)}"><span class="gh-list-icon">${ICON('cil-speech')}</span><span class="gh-list-main"><b>${esc(q.title)}</b><span>${esc(q.subject)} · ${Number(q.replies||q.replyItems.length||0)} trả lời · ${esc(q.time)}</span></span><span class="gh-chip">${esc(q.status||'Mới')}</span></button>`).join('')}</div><div class="gh-empty" id="qnaEmpty" hidden>${ICON('cil-search')}Không tìm thấy câu hỏi.</div>`;
      const input=qs('#qnaSearch',root);
      const filter=()=>{const term=input.value.trim().toLowerCase();let n=0;qsa('[data-qna]',root).forEach(x=>{const ok=x.textContent.toLowerCase().includes(term);x.hidden=!ok;if(ok)n++;});qs('#qnaEmpty',root).hidden=n>0;};
      input.addEventListener('input',filter);
      qs('#askQuestion',root).addEventListener('click',()=>openQnaForm(questions,paint));
      qsa('[data-qna]',root).forEach(el=>el.addEventListener('click',()=>{const q=questions.find(x=>x.id===el.dataset.qna);if(q)openQnaDetail(q,questions,save,paint);}));
    };
    paint();
  }

  function renderHome(){
    // This page is normally handled by js/gh-home-upgrade.js so it never replaces the legacy home shell.
    return null;
  }

  function openModal(content, cls=''){ 
    qsa('.gh-modal').forEach(m=>closeModal(m));
    const modal=document.createElement('div');
    modal.className=`gh-modal ${cls}`;
    modal.innerHTML=`<div class="gh-modal-backdrop" data-modal-close></div><div class="gh-modal-dialog" role="dialog" aria-modal="true" tabindex="-1">${content}</div>`;
    document.body.appendChild(modal);
    document.body.classList.add('gh-modal-open');
    const close=()=>closeModal(modal);
    qsa('[data-modal-close]',modal).forEach(el=>el.addEventListener('click',close));
    qsa('[data-close-modal]',modal).forEach(el=>el.addEventListener('click',close));
    modal._ghEscape=e=>{if(e.key==='Escape')close();};
    document.addEventListener('keydown',modal._ghEscape);
    requestAnimationFrame(()=>qs('.gh-modal-dialog',modal)?.focus());
    return modal;
  }
  function closeModal(modal){
    if(!modal)return;
    try{modal._ghCleanup?.()}catch{}
    if(modal._ghEscape)document.removeEventListener('keydown',modal._ghEscape);
    modal.remove();
    document.body.classList.remove('gh-modal-open');
  }

  async function openVideo(v){
    if(!v)return;
    let src=v.src||'';
    let objectUrl='';
    if(v.fileId){
      try{
        const files=runtimeFiles.length?runtimeFiles:await getHubAll('files');
        const record=files.find(f=>String(f.id)===String(v.fileId));
        if(record?.blob){objectUrl=URL.createObjectURL(record.blob);src=objectUrl;}
      }catch{}
    }
    track('video_open',{id:v.id});
    const modal=openModal(`<div class="gh-modal-head"><div><span class="kicker">VIDEO BÀI GIẢNG</span><h2>${esc(v.title)}</h2></div><button class="gh-icon-btn" data-close-modal aria-label="Đóng">${ICON('cil-x')}</button></div><div class="gh-video-player">${src?`<video controls playsinline preload="metadata" src="${esc(src)}"></video>`:`<div class="gh-sim-placeholder"><div class="big">${ICON('cil-video')}</div><h3>Chưa có nguồn video</h3><p>Nội dung này chưa có file video hoặc URL phát. Các video được upload vào thư viện của website sẽ xuất hiện tại đây tự động.</p><a class="gh-btn" href="videos.html">Quay lại thư viện</a></div>`}</div><div class="gh-modal-actions"><span class="gh-chip">${esc(v.subject)}</span><span class="muted">${esc(v.duration)} · ${esc(v.views)} lượt xem</span><button class="gh-btn primary" data-close-modal>Đóng</button></div>`,'wide');
    const cleanup=()=>{if(objectUrl){URL.revokeObjectURL(objectUrl);objectUrl='';}};
    modal._ghCleanup=cleanup;
  }

  function openFlashcard(f){
    if(!f)return;
    const deck=(f.items&&f.items.length)?f.items:[{front:f.front,back:f.back}];
    let current=0,known=0,unknown=0;
    const modal=openModal(`<div class="gh-modal-head"><div><span class="kicker">FLASHCARD</span><h2>${esc(f.title)}</h2></div><button class="gh-icon-btn" data-close-modal aria-label="Đóng">${ICON('cil-x')}</button></div><div class="flashcard-progress-row"><span id="fcIndex">Thẻ 1/${deck.length}</span><div class="gh-progress"><i id="fcBar" style="width:${100/deck.length}%"></i></div></div><div id="flashcardStage"></div><div class="flashcard-actions"><button class="gh-btn danger-soft" id="fcUnknown">${ICON('cil-x')} Chưa nhớ</button><button class="gh-btn" id="fcPrev">${ICON('cil-arrow-left')} Trước</button><button class="gh-btn" id="fcNext">Tiếp ${ICON('cil-arrow-right')}</button><button class="gh-btn success-soft" id="fcKnown">${ICON('cil-check')} Đã nhớ</button></div>`,'flashcard-modal');
    const paint=()=>{
      const item=deck[current];
      const stage=qs('#flashcardStage',modal);
      stage.innerHTML=`<div class="flashcard3d" tabindex="0" id="studyCard"><div class="flashcard-face front"><span class="gh-tag">${esc(f.subject)}</span><h2>${esc(item.front)}</h2><small>Nhấn thẻ hoặc Enter để lật</small></div><div class="flashcard-face back"><span class="gh-tag">ĐÁP ÁN</span><p>${esc(item.back)}</p><small>Đánh giá mức độ nhớ</small></div></div>`;
      const card=qs('#studyCard',modal);
      card.addEventListener('click',()=>card.classList.toggle('flipped'));
      card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();card.classList.toggle('flipped')}});
      qs('#fcIndex',modal).textContent=`Thẻ ${current+1}/${deck.length}`;
      qs('#fcBar',modal).style.width=`${((current+1)/deck.length)*100}%`;
      qs('#fcPrev',modal).disabled=current===0;
      qs('#fcNext',modal).innerHTML=`${ICON(current===deck.length-1?'cil-check':'cil-arrow-right')}${current===deck.length-1?'Hoàn tất':'Tiếp'}`;
    };
    const finish=()=>{
      track('flashcard_session',{id:f.id,known,unknown,total:deck.length});
      qs('#flashcardStage',modal).innerHTML=`<div class="quiz-result"><div class="quiz-result-icon">${ICON('cil-layers')}</div><h2>Hoàn thành bộ thẻ</h2><p>Đã nhớ: <b>${known}</b> · Chưa nhớ: <b>${unknown}</b></p><div class="gh-progress"><i style="width:${deck.length?known/deck.length*100:0}%"></i></div></div>`;
      qs('.flashcard-actions',modal).innerHTML=`<button class="gh-btn primary" data-close-modal>${ICON('cil-check')} Đóng</button>`;
      qs('[data-close-modal]',modal)?.addEventListener('click',()=>closeModal(modal));
    };
    qs('#fcUnknown',modal).addEventListener('click',()=>{unknown++;if(current<deck.length-1){current++;paint()}else finish()});
    qs('#fcKnown',modal).addEventListener('click',()=>{known++;if(current<deck.length-1){current++;paint()}else finish()});
    qs('#fcPrev',modal).addEventListener('click',()=>{if(current>0){current--;paint()}});
    qs('#fcNext',modal).addEventListener('click',()=>{if(current<deck.length-1){current++;paint()}else finish()});
    paint();
  }

  function openQuiz(quiz){
    if(!quiz)return;
    let index=0,answers=[],startedAt=Date.now(),timer=null,secondsLeft=Math.max(0,Number(quiz.minutes||0)*60);
    const modal=openModal(`<div class="gh-modal-head"><div><span class="kicker">QUIZ</span><h2>${esc(quiz.title)}</h2><p class="gh-desc">${esc(quiz.subject||'')} · ${quiz.items.length} câu</p></div><button class="gh-icon-btn" data-close-modal aria-label="Đóng">${ICON('cil-x')}</button></div><div class="gh-quiz"><div class="gh-quiz-progress"><span id="quizProgress">1 / ${quiz.items.length}</span><div class="gh-progress"><i id="quizBar" style="width:${100/quiz.items.length}%"></i></div><span class="gh-quiz-timer" id="quizTimer">${formatTimer(secondsLeft)}</span></div><div id="quizQuestion"></div><div class="gh-modal-actions"><button class="gh-btn" id="quizPrev">${ICON('cil-arrow-left')} Trước</button><button class="gh-btn primary" id="quizNext">Tiếp theo ${ICON('cil-arrow-right')}</button></div></div>`,'quiz-modal');
    const finish=()=>{
      if(timer){clearInterval(timer);timer=null;}
      const score=quiz.items.reduce((n,q,i)=>n+(answers[i]===q.answer?1:0),0);
      const attempt={id:quiz.id,title:quiz.title,score,total:quiz.items.length,answers,ts:Date.now(),elapsed:Date.now()-startedAt};
      if(window.GiaHuyContent?.recordQuizAttempt)window.GiaHuyContent.recordQuizAttempt(attempt);
      else {const h=readJSON('giahuy-quiz-history',[]);h.push(attempt);writeJSON('giahuy-quiz-history',h.slice(-100));}
      track('quiz_complete',{id:quiz.id,score,total:quiz.items.length});
      const review=quiz.items.map((q,i)=>{const chosen=answers[i];const ok=chosen===q.answer;return `<div class="quiz-review-item ${ok?'ok':'bad'}"><div><b>${i+1}. ${esc(q.q)}</b><span>${ok?'Đúng':'Chưa đúng'} · ${chosen==null?'Chưa trả lời':'Bạn chọn: '+esc(q.options[chosen])} · Đáp án: ${esc(q.options[q.answer])}</span></div></div>`}).join('');
      qs('.gh-quiz',modal).innerHTML=`<div class="quiz-result"><div class="quiz-result-icon">${ICON(score===quiz.items.length?'cil-star':'cil-check')}</div><h2>${score}/${quiz.items.length}</h2><p>Bạn trả lời đúng ${score} câu.</p><div class="gh-progress"><i style="width:${quiz.items.length?score/quiz.items.length*100:0}%"></i></div></div><div class="quiz-review"><div class="gh-section-head"><div><h3>Ôn lại đáp án</h3><p>Xem câu đã trả lời và đáp án đúng.</p></div></div>${review}</div><div class="gh-modal-actions"><button class="gh-btn primary" data-close-modal>${ICON('cil-check')} Hoàn tất</button></div>`;
      qsa('[data-close-modal]',modal).forEach(b=>b.addEventListener('click',()=>closeModal(modal)));
    };
    modal._ghCleanup=()=>{if(timer){clearInterval(timer);timer=null;}};
    const paint=()=>{
      const item=quiz.items[index];
      qs('#quizProgress',modal).textContent=`${index+1} / ${quiz.items.length}`;
      qs('#quizBar',modal).style.width=`${((index+1)/quiz.items.length)*100}%`;
      qs('#quizQuestion',modal).innerHTML=`<div class="quiz-question"><h3>${index+1}. ${esc(item.q)}</h3><div class="quiz-options">${item.options.map((o,i)=>`<button class="quiz-option ${answers[index]===i?'selected':''}" data-opt="${i}">${String.fromCharCode(65+i)}. ${esc(o)}</button>`).join('')}</div></div>`;
      qsa('[data-opt]',modal).forEach(b=>b.addEventListener('click',()=>{answers[index]=Number(b.dataset.opt);paint()}));
      qs('#quizPrev',modal).disabled=index===0;
      qs('#quizNext',modal).innerHTML=`${ICON(index===quiz.items.length-1?'cil-check':'cil-arrow-right')}${index===quiz.items.length-1?'Nộp bài':'Tiếp theo'}`;
    };
    if(secondsLeft>0){
      timer=setInterval(()=>{secondsLeft--;const el=qs('#quizTimer',modal);if(el)el.textContent=formatTimer(secondsLeft);if(secondsLeft<=0)finish();},1000);
    }
    qs('#quizPrev',modal).addEventListener('click',()=>{if(index>0){index--;paint()}});
    qs('#quizNext',modal).addEventListener('click',()=>{if(index<quiz.items.length-1){index++;paint()}else finish()});
    paint();
  }

  function formatTimer(seconds){
    const s=Math.max(0,Number(seconds||0));
    return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  }

  function openSimpleForm(title,placeholder,kind){
    const modal=openModal(`<div class="gh-modal-head"><div><span class="kicker">${esc(kind.toUpperCase())}</span><h2>${esc(title)}</h2></div><button class="gh-icon-btn" data-close-modal aria-label="Đóng">${ICON('cil-x')}</button></div><form class="gh-form-grid" id="simpleForm"><div class="gh-field full"><label for="simpleValue">Tên bộ thẻ</label><input id="simpleValue" required maxlength="120" placeholder="${esc(placeholder)}"><span class="gh-field-help">Bộ thẻ được lưu trên thiết bị hiện tại.</span></div><div class="gh-field"><label for="deckSubject">Chủ đề</label><select id="deckSubject"><option>Vật lý</option><option>Toán</option><option>Hóa học</option><option>Sinh học</option><option>Tiếng Anh</option><option>Kho cá nhân</option></select></div><div class="gh-field"><label for="deckFront">Mặt trước</label><input id="deckFront" maxlength="300" required placeholder="Khái niệm / câu hỏi"></div><div class="gh-field full"><label for="deckBack">Mặt sau</label><textarea id="deckBack" rows="4" maxlength="1200" required placeholder="Đáp án / giải thích"></textarea></div><div class="gh-modal-actions"><button type="button" class="gh-btn" data-close-modal>Hủy</button><button class="gh-btn primary" type="submit">${ICON('cil-check')} Tạo bộ thẻ</button></div></form>`);
    qs('#simpleForm',modal).addEventListener('submit',e=>{
      e.preventDefault();
      const name=qs('#simpleValue',modal).value.trim();
      const front=qs('#deckFront',modal).value.trim();
      const back=qs('#deckBack',modal).value.trim();
      const subject=qs('#deckSubject',modal).value;
      if(!name||!front||!back){showToast('Vui lòng nhập đủ tên bộ thẻ và nội dung hai mặt.');return;}
      if(kind==='deck'){
        const deck={id:`deck-${Date.now()}`,title:name,subject,cards:1,progress:0,icon:'cil-layers',items:[{id:`card-${Date.now()}`,front,back}]};
        window.GiaHuyContent?.saveDeck?.(deck);
      }
      track('content_create',{kind,name,subject});
      closeModal(modal);
      if(kind==='deck')renderFlashcards(qs('#pageRoot'));
      showToast(kind==='deck'?'Đã tạo bộ flashcard.':'Đã tạo bản nháp trên thiết bị.');
    });
  }

  function openProfileForm(){
    const p=readJSON('giahuy-profile',{name:'Thầy Gia Huy',role:'Giáo viên · Người xây dựng nội dung học tập',bio:'Chia sẻ bài giảng, học liệu, bài tập, công cụ và trải nghiệm trực quan giúp việc học hiệu quả hơn.',website:'',className:'THPT'});
    const modal=openModal(`<div class="gh-modal-head"><div><span class="kicker">PROFILE</span><h2>Chỉnh hồ sơ</h2></div><button class="gh-icon-btn" data-close-modal>${ICON('cil-x')}</button></div><form class="gh-form-grid" id="profileForm"><div class="gh-field"><label>Tên hiển thị</label><input name="name" required value="${esc(p.name)}"></div><div class="gh-field"><label>Vai trò</label><input name="role" value="${esc(p.role)}"></div><div class="gh-field full"><label>Giới thiệu</label><textarea name="bio" rows="4">${esc(p.bio)}</textarea></div><div class="gh-field full"><label>Website</label><input name="website" type="url" value="${esc(p.website)}"></div><div class="gh-modal-actions"><button type="button" class="gh-btn" data-close-modal>Hủy</button><button class="gh-btn primary" type="submit">${ICON('cil-check')} Lưu</button></div></form>`);
    qs('#profileForm',modal).addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(e.currentTarget);writeJSON('giahuy-profile',{...p,name:fd.get('name'),role:fd.get('role'),bio:fd.get('bio'),website:fd.get('website')});closeModal(modal);renderProfile(qs('#pageRoot'));showToast('Đã lưu hồ sơ.');});
  }

  function openQnaForm(questions,paint){
    const modal=openModal(`<div class="gh-modal-head"><div><span class="kicker">HỎI ĐÁP</span><h2>Đặt câu hỏi</h2></div><button class="gh-icon-btn" data-close-modal>${ICON('cil-x')}</button></div><form class="gh-form-grid" id="qnaForm"><div class="gh-field full"><label>Tiêu đề</label><input name="title" required placeholder="Bạn muốn hỏi điều gì?"></div><div class="gh-field"><label>Môn</label><select name="subject"><option>Vật lý 10</option><option>Vật lý 11</option><option>Toán 11</option><option>Hóa 11</option><option>Sinh 11</option></select></div><div class="gh-field"><label>Tag</label><input name="status" value="Mới"></div><div class="gh-field full"><label>Nội dung</label><textarea name="body" rows="5" placeholder="Mô tả câu hỏi..."></textarea></div><div class="gh-modal-actions"><button type="button" class="gh-btn" data-close-modal>Hủy</button><button class="gh-btn primary" type="submit">${ICON('cil-send')} Đăng câu hỏi</button></div></form>`);
    qs('#qnaForm',modal).addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(e.currentTarget);questions.push({id:'qna-'+Date.now(),title:fd.get('title'),subject:fd.get('subject'),replies:0,time:'vừa đăng',status:fd.get('status')||'Mới',body:fd.get('body')||''});writeJSON('giahuy-qna',questions);closeModal(modal);paint();showToast('Đã đăng câu hỏi.');});
  }

  function openQnaDetail(q,questions,save,paint){
    if(!q)return;
    q.replyItems=Array.isArray(q.replyItems)?q.replyItems:[];
    const modal=openModal(`<div class="gh-modal-head"><div><span class="kicker">HỎI ĐÁP</span><h2>${esc(q.title)}</h2><p class="gh-desc">${esc(q.subject)} · ${Number(q.replies||q.replyItems.length||0)} trả lời</p></div><button class="gh-icon-btn" data-close-modal aria-label="Đóng">${ICON('cil-x')}</button></div><div class="gh-panel inset"><div class="gh-meta"><span>${esc(q.subject)}</span><span>${esc(q.time)}</span><span>${esc(q.status||'Mới')}</span></div><p class="gh-desc qna-body">${esc(q.body||'Người hỏi chưa thêm mô tả chi tiết.')}</p></div><section class="gh-section"><div class="gh-section-head"><div><h3>Phản hồi</h3><p>Trao đổi ngay trong câu hỏi.</p></div></div><div class="gh-list" id="qnaReplies"></div></section><form class="gh-form-grid" id="qnaReplyForm"><div class="gh-field full"><label for="qnaReplyText">Nội dung phản hồi</label><textarea id="qnaReplyText" name="reply" rows="4" maxlength="1200" required placeholder="Viết câu trả lời hoặc hướng dẫn..."></textarea></div><div class="gh-modal-actions"><button type="button" class="gh-btn" data-close-modal>Đóng</button><button class="gh-btn primary" type="submit">${ICON('cil-send')} Gửi phản hồi</button></div></form>`,'qna-modal');
    const replyRoot=qs('#qnaReplies',modal);
    const paintReplies=()=>{
      const items=q.replyItems||[];
      replyRoot.innerHTML=items.length?items.map((r,i)=>`<div class="gh-list-item"><span class="gh-list-icon">${ICON(r.author==='Thầy Gia Huy'?'cil-school':'cil-user')}</span><div class="gh-list-main"><b>${esc(r.author||'Người dùng')}</b><span>${new Date(r.ts||Date.now()).toLocaleString('vi-VN')}</span><p>${esc(r.text)}</p></div></div>`).join(''):`<div class="gh-empty">${ICON('cil-speech')}Chưa có phản hồi. Hãy là người đầu tiên trả lời.</div>`;
    };
    paintReplies();
    qs('#qnaReplyForm',modal).addEventListener('submit',e=>{
      e.preventDefault();
      const text=qs('#qnaReplyText',modal).value.trim();
      if(!text)return;
      const author=readJSON('giahuy-profile',{name:'Người dùng'}).name||'Người dùng';
      q.replyItems.push({id:`reply-${Date.now()}`,author,text,ts:Date.now()});
      q.replies=q.replyItems.length;
      q.time='vừa cập nhật';
      save();
      paintReplies();
      qs('#qnaReplyText',modal).value='';
      showToast('Đã gửi phản hồi.');
      track('qna_reply',{id:q.id});
      if(paint)paint();
    });
    track('qna_open',{id:q.id});
  }

  function showToast(text){
    let t=qs('.gh-toast');if(!t){t=document.createElement('div');t.className='gh-toast';document.body.appendChild(t);}t.textContent=text;t.classList.add('show');clearTimeout(t._timer);t._timer=setTimeout(()=>t.classList.remove('show'),2200);
  }

  function openGame(game){
    if(!game)return;
    track('game_open',{id:game.id});
    const modal=openModal(`<div class="gh-modal-head game-modal-head-pro"><div><span class="kicker">GAME CENTER</span><h2>${esc(game.title)}</h2><p>${esc(game.description)}</p></div><button class="gh-icon-btn" data-close-modal aria-label="Đóng">${ICON('cil-x')}</button></div><div class="game-stage game-stage-pro"><canvas id="gameCanvas" width="900" height="520"></canvas><div class="game-hud"><span id="gameScore">Score: 0</span><span id="gameLevel">Level: 1</span><span id="gameLives">♥♥♥</span><span id="gameBest">Best: 0</span><span id="gameCombo">Combo —</span><button class="gh-btn soft" id="gamePause">${ICON('cil-media-pause')} Tạm dừng</button><button class="gh-btn soft" id="gameRestart">${ICON('cil-reload')} Chơi lại</button><button class="gh-btn soft" id="gameMute">${ICON('cil-volume-high')} Âm thanh</button><button class="gh-btn soft" id="gameFullscreen">${ICON('cil-fullscreen')} Toàn màn hình</button></div><div class="game-overlay-msg" id="gameOverlayMsg" hidden></div><div class="game-help" id="gameHelp"></div><div class="game-touch-controls" id="gameTouchControls"><button data-game-action="left" aria-label="Trái">${ICON('cil-arrow-left')}</button><button data-game-action="right" aria-label="Phải">${ICON('cil-arrow-right')}</button><button data-game-action="up" aria-label="Lên">${ICON('cil-arrow-top')}</button><button data-game-action="down" aria-label="Xuống">${ICON('cil-arrow-bottom')}</button><button data-game-action="jump" aria-label="Nhảy">${ICON('cil-chevron-top')}</button><button data-game-action="fire" aria-label="Bắn">${ICON('cil-media-play')}</button></div></div><div class="gh-modal-actions game-pro-actions"><span class="gh-chip">${esc(game.cat)}</span><span class="gh-chip">${esc(game.difficulty)}</span><span class="muted">${esc(game.tagline)}</span></div>`,'game-modal');
    const Engine=window.GiaHuyGames?.GameEngine;
    if(typeof Engine!=='function'){
      closeModal(modal);
      showToast('Game Engine chưa sẵn sàng. Vui lòng tải lại trang.');
      return;
    }
    const engine=new Engine(qs('#gameCanvas',modal),game.id,modal);
    engine.start();
    modal._ghCleanup=()=>engine.stop();
    qs('#gameRestart',modal)?.addEventListener('click',()=>engine.start());
    qs('#gamePause',modal)?.addEventListener('click',()=>engine.togglePause?.());
    qs('#gameMute',modal)?.addEventListener('click',e=>{
      const muted=engine.fx?.toggle?.() ?? false;
      e.currentTarget.innerHTML=`${ICON(muted?'cil-volume-off':'cil-volume-high')} ${muted?'Bật âm thanh':'Tắt âm thanh'}`;
    });
    qs('#gameFullscreen',modal)?.addEventListener('click',async e=>{
      const stage=qs('.game-stage-pro',modal);
      try{
        if(document.fullscreenElement===stage){await document.exitFullscreen();e.currentTarget.innerHTML=`${ICON('cil-fullscreen')} Toàn màn hình`;}
        else if(stage?.requestFullscreen){await stage.requestFullscreen();e.currentTarget.innerHTML=`${ICON('cil-fullscreen-exit')} Thoát toàn màn hình`;}
        else showToast('Trình duyệt không hỗ trợ toàn màn hình cho khu vực game.');
      }catch{showToast('Không thể bật toàn màn hình.');}
    });
  }

  class GameEngine {
    constructor(canvas,id,modal){this.c=canvas;this.ctx=canvas.getContext('2d');this.id=id;this.modal=modal;this.raf=0;this.keys=new Set();this.running=false;this.score=0;this.level=1;this.last=0;this.state={};this.onKey=e=>{this.keys.add(e.key.toLowerCase());};this.onKeyUp=e=>this.keys.delete(e.key.toLowerCase());}
    start(){this.stop();this.running=true;this.score=0;this.level=1;this.last=performance.now();window.addEventListener('keydown',this.onKey);window.addEventListener('keyup',this.onKeyUp);this.init();this.loop(this.last);}
    stop(){this.running=false;cancelAnimationFrame(this.raf);window.removeEventListener('keydown',this.onKey);window.removeEventListener('keyup',this.onKeyUp);this.c.removeEventListener('click',this.onCanvasBowling);this.c.removeEventListener('click',this.onCanvasBasket);}
    text(){qs('#gameHelp',this.modal).textContent=this.help||'Chơi để đạt điểm cao nhất.';qs('#gameScore',this.modal).textContent=`Score: ${Math.floor(this.score)}`;qs('#gameLevel',this.modal).textContent=`Level: ${this.level}`;}
    init(){this.player={x:450,y:450,w:28,h:28,vx:0,vy:0};this.items=[];this.bullets=[];this.enemies=[];this.t=0;this.help='';if(this.id==='racing'){this.help='← → hoặc A/D để chuyển làn. Né xe và sống càng lâu càng tốt.';this.roadX=250;this.lane=1;this.player.y=440;this.spawn=0;} else if(this.id==='space'||this.id==='shooter'||this.id==='tank'){this.help=this.id==='space'?'← → di chuyển, Space để bắn.':'Di chuyển bằng phím mũi tên/WASD, Space để bắn.';this.spawn=0;} else if(this.id==='runner'){this.help='Space hoặc ↑ để nhảy qua chướng ngại vật.';this.player.x=150;this.player.y=430;this.ground=460;this.spawn=0;this.jump=false;} else if(this.id==='survival'){this.help='Di chuyển bằng WASD/←↑↓→ và né các khối đỏ.';this.spawn=0;} else if(this.id==='bowling'){this.help='Click lên sân để chọn hướng; giữ Space để ném.';this.ball={x:450,y:460,vx:0,vy:0,active:false};this.pins=[...Array(10)].map((_,i)=>({x:390+(i%4)*40+(Math.floor(i/4)*20),y:90+Math.floor(i/4)*38,hit:false}));this.c.addEventListener('click',this.onCanvasBowling);this.c.addEventListener('mousedown',()=>this.state.charge=0.2);} else if(this.id==='basketball'){this.help='Click để ném bóng vào rổ. Mỗi lần trúng được 1 điểm.';this.ball={x:160,y:420,vx:0,vy:0,active:false};this.hoop={x:700,y:180,w:90,h:10};this.c.addEventListener('click',this.onCanvasBasket);}}
    loop(now){if(!this.running)return;const dt=Math.min(.032,(now-this.last)/1000);this.last=now;this.t+=dt;this.update(dt);this.draw();this.text();this.raf=requestAnimationFrame(t=>this.loop(t));}
    update(dt){this.level=1+Math.floor(this.score/80);if(this.id==='racing')this.updateRacing(dt);if(this.id==='space'||this.id==='shooter'||this.id==='tank')this.updateShooter(dt);if(this.id==='runner')this.updateRunner(dt);if(this.id==='survival')this.updateSurvival(dt);if(this.id==='bowling')this.updateBowling(dt);if(this.id==='basketball')this.updateBasket(dt);}
    bounds(x,min,max){return Math.max(min,Math.min(max,x));}
    updateRacing(dt){const speed=190+this.level*18;let dx=(this.keys.has('arrowright')||this.keys.has('d')?1:0)-(this.keys.has('arrowleft')||this.keys.has('a')?1:0);this.player.x=this.bounds(this.player.x+dx*250*dt,this.roadX+35,this.roadX+365);this.spawn-=dt;if(this.spawn<=0){this.spawn=Math.max(.42,1.05-this.level*.04);const lanes=[0,1,2,3];const lane=lanes[Math.floor(Math.random()*4)];this.items.push({x:this.roadX+45+lane*90,y:-50,w:34,h:58});}this.items.forEach(o=>o.y+=speed*dt);this.items=this.items.filter(o=>o.y<560);for(const o of this.items){if(Math.abs(o.x-this.player.x)<28&&Math.abs(o.y-this.player.y)<45){this.running=false;this.help='Va chạm! Bấm Chơi lại để thử lại.';}}if(this.running)this.score+=dt*10;}
    updateShooter(dt){const isTank=this.id==='tank';const speed=260;let dx=(this.keys.has('arrowright')||this.keys.has('d')?1:0)-(this.keys.has('arrowleft')||this.keys.has('a')?1:0);let dy=(this.keys.has('arrowdown')||this.keys.has('s')?1:0)-(this.keys.has('arrowup')||this.keys.has('w')?1:0);this.player.x=this.bounds(this.player.x+dx*speed*dt,30,870);this.player.y=this.bounds(this.player.y+dy*speed*dt,70,470);if(this.keys.has(' ')&&!this._shot){this._shot=true;this.bullets.push({x:this.player.x,y:this.player.y-20,vx:0,vy:-500});}if(!this.keys.has(' '))this._shot=false;this.spawn-=dt;if(this.spawn<=0){this.spawn=Math.max(.25,.75-this.level*.03);this.enemies.push({x:30+Math.random()*840,y:-30,w:26,h:26,v:60+this.level*12});}this.bullets.forEach(b=>b.y+=b.vy*dt);this.enemies.forEach(e=>e.y+=e.v*dt);for(const b of this.bullets){for(const e of this.enemies){if(!e.dead&&Math.abs(b.x-e.x)<22&&Math.abs(b.y-e.y)<22){e.dead=true;b.dead=true;this.score+=10;}}}for(const e of this.enemies){if(!e.dead&&Math.abs(e.x-this.player.x)<24&&Math.abs(e.y-this.player.y)<24){this.running=false;this.help='Bạn đã bị hạ! Bấm Chơi lại.';}}this.bullets=this.bullets.filter(b=>!b.dead&&b.y>-20);this.enemies=this.enemies.filter(e=>!e.dead&&e.y<550);if(this.id==='shooter')this.enemies.forEach(e=>e.y+=20*dt);if(isTank)this.score+=dt*2;else this.score+=dt*4;}
    updateRunner(dt){this.spawn-=dt;const gravity=1200,jump=-500;if((this.keys.has(' ')||this.keys.has('arrowup'))&&!this.jump&&this.player.y>=this.ground-30){this.player.vy=jump;this.jump=true;}this.player.vy+=gravity*dt;this.player.y+=this.player.vy*dt;if(this.player.y>=this.ground-30){this.player.y=this.ground-30;this.player.vy=0;this.jump=false;}if(this.spawn<=0){this.spawn=Math.max(.5,1.05-this.level*.03);this.items.push({x:920,y:this.ground-26,w:22+Math.random()*16,h:30+Math.random()*30,v:280+this.level*20});}this.items.forEach(o=>o.x-=o.v*dt);for(const o of this.items){if(Math.abs(o.x-this.player.x)<26&&Math.abs(o.y-this.player.y)<35){this.running=false;this.help='Va chạm! Bấm Chơi lại.';}}this.items=this.items.filter(o=>o.x>-50);this.score+=dt*12;}
    updateSurvival(dt){let dx=(this.keys.has('arrowright')||this.keys.has('d')?1:0)-(this.keys.has('arrowleft')||this.keys.has('a')?1:0);let dy=(this.keys.has('arrowdown')||this.keys.has('s')?1:0)-(this.keys.has('arrowup')||this.keys.has('w')?1:0);this.player.x=this.bounds(this.player.x+dx*240*dt,25,875);this.player.y=this.bounds(this.player.y+dy*240*dt,75,480);this.spawn-=dt;if(this.spawn<=0){this.spawn=Math.max(.2,.6-this.level*.02);const a=Math.random()*Math.PI*2;this.enemies.push({x:450+Math.cos(a)*480,y:280+Math.sin(a)*280,v:70+this.level*9});}this.enemies.forEach(e=>{const dx=this.player.x-e.x,dy=this.player.y-e.y,d=Math.hypot(dx,dy)||1;e.x+=dx/d*e.v*dt;e.y+=dy/d*e.v*dt;if(d<25)this.running=false;});this.enemies=this.enemies.filter(e=>e.x>-40&&e.x<940&&e.y>40&&e.y<520);this.score+=dt*9;}
    onCanvasBowling=(e)=>{if(!this.ball.active){const r=this.c.getBoundingClientRect();const tx=(e.clientX-r.left)/r.width*this.c.width;this.ball.x=450;this.ball.y=460;const ang=Math.atan2(90-this.ball.y,tx-this.ball.x);this.ball.vx=Math.cos(ang)*430;this.ball.vy=Math.sin(ang)*430;this.ball.active=true;}};
    updateBowling(dt){if(this.ball?.active){this.ball.x+=this.ball.vx*dt;this.ball.y+=this.ball.vy*dt;if(this.ball.y<80||this.ball.x<20||this.ball.x>880){this.ball.active=false;this.score+=this.pins.filter(p=>p.hit).length*5;setTimeout(()=>this.resetBowling(),300); }for(const p of this.pins){if(!p.hit&&Math.hypot(p.x-this.ball.x,p.y-this.ball.y)<25){p.hit=true;this.score+=10;}}}}
    resetBowling(){this.ball.x=450;this.ball.y=460;this.ball.active=false;this.pins.forEach(p=>p.hit=false);}
    onCanvasBasket=(e)=>{if(!this.ball.active){const r=this.c.getBoundingClientRect();const tx=(e.clientX-r.left)/r.width*this.c.width;const ty=(e.clientY-r.top)/r.height*this.c.height;const ang=Math.atan2(ty-this.ball.y,tx-this.ball.x);this.ball.vx=Math.cos(ang)*350;this.ball.vy=Math.sin(ang)*350-350;this.ball.active=true;}};
    updateBasket(dt){if(this.ball.active){this.ball.vy+=680*dt;this.ball.x+=this.ball.vx*dt;this.ball.y+=this.ball.vy*dt;if(this.ball.x>this.hoop.x&&this.ball.x<this.hoop.x+this.hoop.w&&this.ball.y>this.hoop.y-12&&this.ball.y<this.hoop.y+12){this.score+=10;this.ball.active=false;this.ball.x=160;this.ball.y=420;}if(this.ball.y>520||this.ball.x>940||this.ball.x<0){this.ball.active=false;this.ball.x=160;this.ball.y=420;}}}
    draw(){const c=this.c,x=this.ctx;x.clearRect(0,0,c.width,c.height);x.fillStyle='#eef2ff';x.fillRect(0,0,c.width,c.height);if(this.id==='racing')this.drawRacing(x);else if(this.id==='space'||this.id==='shooter'||this.id==='tank')this.drawShooter(x);else if(this.id==='runner')this.drawRunner(x);else if(this.id==='survival')this.drawSurvival(x);else if(this.id==='bowling')this.drawBowling(x);else if(this.id==='basketball')this.drawBasket(x);}
    playerDraw(x,color='#4f46e5'){x.fillStyle=color;x.beginPath();x.arc(this.player.x,this.player.y,16,0,Math.PI*2);x.fill();}
    drawRacing(x){x.fillStyle='#334155';x.fillRect(250,0,400,520);x.strokeStyle='#fff';x.setLineDash([24,20]);x.lineWidth=5;x.beginPath();x.moveTo(450,0);x.lineTo(450,520);x.stroke();x.setLineDash([]);x.fillStyle='#22c55e';x.fillRect(0,0,250,520);x.fillRect(650,0,250,520);this.items.forEach(o=>{x.fillStyle='#ef4444';x.fillRect(o.x-17,o.y-29,34,58);});this.playerDraw(x);}
    drawShooter(x){x.fillStyle=this.id==='tank'?'#0f172a':'#0b1020';x.fillRect(0,0,900,520);for(let i=0;i<40;i++){x.fillStyle='rgba(255,255,255,.18)';x.fillRect((i*83)%900,(i*137)%520,2,2);}this.enemies.forEach(e=>{x.fillStyle='#ef4444';x.beginPath();x.arc(e.x,e.y,13,0,Math.PI*2);x.fill();});this.bullets.forEach(b=>{x.fillStyle='#fbbf24';x.fillRect(b.x-3,b.y-10,6,18);});this.playerDraw(x,this.id==='tank'?'#22c55e':'#38bdf8');}
    drawRunner(x){x.fillStyle='#dff6ff';x.fillRect(0,0,900,520);x.fillStyle='#86efac';x.fillRect(0,this.ground,900,60);this.items.forEach(o=>{x.fillStyle='#ef4444';x.fillRect(o.x-o.w/2,o.y-o.h/2,o.w,o.h);});this.playerDraw(x,'#7c3aed');}
    drawSurvival(x){x.fillStyle='#111827';x.fillRect(0,0,900,520);this.enemies.forEach(e=>{x.fillStyle='#ef4444';x.fillRect(e.x-12,e.y-12,24,24);});this.playerDraw(x,'#38bdf8');}
    drawBowling(x){x.fillStyle='#7dd3fc';x.fillRect(0,0,900,520);x.fillStyle='#fef3c7';x.fillRect(250,30,400,470);this.pins.forEach(p=>{x.fillStyle=p.hit?'#94a3b8':'#ef4444';x.beginPath();x.arc(p.x,p.y,10,0,Math.PI*2);x.fill();});if(this.ball){x.fillStyle='#1d4ed8';x.beginPath();x.arc(this.ball.x,this.ball.y,13,0,Math.PI*2);x.fill();}}
    drawBasket(x){x.fillStyle='#bae6fd';x.fillRect(0,0,900,520);x.fillStyle='#f8fafc';x.fillRect(0,390,900,130);x.strokeStyle='#94a3b8';x.lineWidth=5;x.beginPath();x.moveTo(this.hoop.x,this.hoop.y);x.lineTo(this.hoop.x+this.hoop.w,this.hoop.y);x.stroke();x.fillStyle='#f97316';x.beginPath();x.arc(this.hoop.x+this.hoop.w/2,this.hoop.y+14,38,0,Math.PI*2);x.stroke();x.fillStyle='#f59e0b';x.beginPath();x.arc(this.ball.x,this.ball.y,14,0,Math.PI*2);x.fill();}
  }

  async function renderPage(){
    const page=document.body.dataset.page||'';
    const configs={
      plugins:['plugins','Bài giảng','Thư viện bài giảng, khóa học và nội dung theo môn.'],
      courses:['plugins','Khóa học','Tổng hợp khóa học, bài giảng và tiến độ.'],
      config:['config','Giáo án','Kho giáo án và kế hoạch dạy học.'],
      mods:['mods','Bài tập','Bài tập cần làm, đang làm và đã hoàn thành.'],
      assignments:['mods','Bài tập','Bài tập cần làm, đang làm và đã hoàn thành.'],
      assets:['assets','Học liệu','Kho học liệu trực quan theo môn học.'],
      tools:['tools','Công cụ','Bộ công cụ hỗ trợ dạy học và học tập.'],
      resources:['resources','Tài nguyên','Kho tài nguyên và file dùng chung.'],
      guide:['guide','Hướng dẫn','Help Center và hướng dẫn sử dụng website.'],
      library:['library','Kho cá nhân','Nội dung đã lưu, yêu thích và gần đây.'],
      'my-library':['library','Kho cá nhân','Nội dung đã lưu, yêu thích và gần đây.'],
      flashcards:['flashcards','Flashcard','Ôn tập theo bộ thẻ, tiến độ và chủ đề.'],
      quiz:['quiz','Quiz ôn tập','Kho quiz tương tác và lịch sử luyện tập.'],
      videos:['videos','Video bài giảng','Video mới và nội dung bài giảng.'],
      games:['games','Game Center','Khu trò chơi giải trí thực.'],
      statistics:['statistics','Thống kê','Tổng quan hoạt động trên website.'],
      notifications:['notifications','Thông báo','Các thông báo mới và hoạt động gần đây.'],
      profile:['profile','Hồ sơ','Thông tin và hoạt động của Thầy Gia Huy.'],
      settings:['settings','Cài đặt','Quản lý giao diện, thông báo và tùy chọn.'],
      qna:['qna','Hỏi đáp','Khu vực câu hỏi, thảo luận và trợ giúp cộng đồng.']
    };
    const c=configs[page];
    if(!c)return;
    const root=pageShell({active:c[0],title:c[1],desc:c[2]});
    await runtimeReady;
    if(page==='plugins'||page==='courses') renderCourses(root);
    else if(page==='videos') await renderVideos(root);
    else if(page==='mods'||page==='assignments') renderAssignments(root);
    else if(page==='flashcards') renderFlashcards(root);
    else if(page==='quiz') renderQuiz(root);
    else if(page==='games') renderGames(root);
    else if(page==='statistics') await renderStatistics(root);
    else if(page==='notifications') renderNotifications(root);
    else if(page==='profile') renderProfile(root);
    else if(page==='settings') renderSettings(root);
    else if(page==='qna') renderQna(root);
    else if(page==='config'||page==='assets'||page==='tools'||page==='resources'||page==='guide'||page==='library'||page==='my-library') await renderCatalogBridge(root,page);
    track('page_view',{page});
  }

  async function renderCatalogBridge(root,page){
    await runtimeReady;
    const meta={config:['Giáo án','cil-notes','Kế hoạch dạy học và giáo án đã phân loại.'],assets:['Học liệu','cil-education','Hình ảnh, slide, âm thanh và học liệu trực quan.'],tools:['Công cụ','cil-settings','Các công cụ giúp tạo nội dung và hỗ trợ lớp học.'],resources:['Tài nguyên','cil-folder-open','File và tài nguyên dùng chung.'],guide:['Hướng dẫn','cil-lightbulb','Các bài hướng dẫn sử dụng hệ thống.'],library:['Kho cá nhân','cil-heart','Nội dung đã lưu và yêu thích.'],'my-library':['Kho cá nhân','cil-heart','Nội dung đã lưu và yêu thích.']}[page]||['Thư viện','cil-apps',''];
    const routeFor=(item)=>item.route||(item.type==='COURSE'?`plugins.html?course=${encodeURIComponent(item.id||'')}`:item.type==='VIDEO'?`videos.html?video=${encodeURIComponent(item.id||'')}`:'resources.html');
    const dbItems=runtimeFiles.filter(f=>{ if(page==='library'||page==='my-library'){ try{return localStorage.getItem('giahuy-fav-'+f.id)==='1'||localStorage.getItem('giahuy-history')?.includes(String(f.id));}catch{return false;} } return !f.cat||f.cat===page; }).slice(0,30).map(f=>({title:f.name||f.fileName||'Tài nguyên',type:(f.fileName||'FILE').split('.').pop().toUpperCase(),meta:`${Math.max(0,Math.round((f.size||0)/1024))} KB`,icon:'cil-file',id:f.id,route:'resources.html'}));
    const items=[...dbItems,...DATA.materials.map(m=>({...m,route:'resources.html'})),...DATA.courses.map(c=>({title:c.title,type:'COURSE',meta:`${c.lessons} bài · ${c.progress}% tiến độ`,icon:c.icon,id:c.id,route:`plugins.html?course=${encodeURIComponent(c.id)}`})),...runtimeVideos.slice(0,10).map(v=>({title:v.title,type:'VIDEO',meta:`${v.duration} · ${v.views} lượt xem`,icon:'cil-video',id:v.id,route:`videos.html?video=${encodeURIComponent(v.id)}`}))];
    root.innerHTML=`<section class="gh-hero compact"><div><span class="kicker">THƯ VIỆN</span><h2>${esc(meta[0])}</h2><p>${esc(meta[2])}</p><div class="gh-actions"><a class="gh-btn primary" href="${page==='guide'?'guide.html':'resources.html'}">${ICON(meta[1])} Khám phá</a><a class="gh-btn" href="index.html">${ICON('cil-home')} Trang chủ</a></div></div><div class="gh-hero-art"><span class="orb"></span><span class="hero-icon">${ICON(meta[1])}</span></div></section><section class="gh-section gh-card pad"><div class="gh-toolbar"><label class="gh-search">${ICON('cil-search')}<input data-page-search placeholder="Tìm trong ${esc(meta[0].toLowerCase())}..."></label><div class="gh-filter-row"><button type="button" class="gh-chip active" data-catalog-sort="all">Tất cả</button><button type="button" class="gh-chip" data-catalog-sort="new">Mới nhất</button><button type="button" class="gh-chip" data-catalog-sort="popular">Phổ biến</button></div></div><div class="gh-grid gh-grid-3" id="catalogItems">${items.map((i,idx)=>`<article class="gh-card pad gh-hover" data-index="${idx}" data-popularity="${Math.max(0,100-idx)}" data-searchable="${esc(i.title+' '+i.type+' '+i.meta)}"><div class="gh-stat-icon">${ICON(i.icon||'cil-file')}</div><span class="gh-tag">${esc(i.type)}</span><div class="gh-title">${esc(i.title)}</div><p class="gh-desc">${esc(i.meta)}</p><div class="gh-card-foot"><span class="muted">${idx%2?'Đã cập nhật':'Nổi bật'}</span><a class="gh-btn soft" href="${esc(routeFor(i))}">Mở</a></div></article>`).join('')}</div><div class="gh-empty" data-filter-empty hidden>${ICON('cil-search')}Không tìm thấy nội dung.</div></section>`;
    wireSearch(root);
    const catalog=qs('#catalogItems',root);
    const originalItems=catalog?[...catalog.children]:[];
    qsa('[data-catalog-sort]',root).forEach(btn=>btn.addEventListener('click',()=>{
      qsa('[data-catalog-sort]',root).forEach(x=>x.classList.remove('active'));
      btn.classList.add('active');
      const mode=btn.dataset.catalogSort;
      const sorted=originalItems.slice().sort((a,b)=>{
        if(mode==='popular') return Number(b.dataset.popularity||0)-Number(a.dataset.popularity||0);
        if(mode==='new') return Number(b.dataset.index||0)-Number(a.dataset.index||0);
        return Number(a.dataset.index||0)-Number(b.dataset.index||0);
      });
      sorted.forEach(el=>catalog.appendChild(el));
      const search=qs('[data-page-search]',root); search?.dispatchEvent(new Event('input'));
    }));
  }

  const originalPath=location.pathname.split('/').pop()||'index.html';
  const map={'flashcards.html':'flashcards','quiz.html':'quiz','videos.html':'videos','games.html':'games','statistics.html':'statistics','notifications.html':'notifications','profile.html':'profile','settings.html':'settings','qna.html':'qna','plugins.html':'plugins','config.html':'config','mods.html':'mods','assets.html':'assets','tools.html':'tools','resources.html':'resources','guide.html':'guide','my-library.html':'my-library','index.html':'home'};
  document.body.dataset.page=map[originalPath]||document.body.dataset.page||'';
  if(document.body.classList.contains('gh-bootstrap')) renderPage();
  window.GiaHuyPlatform={DATA,track,showToast,ready:runtimeReady,getVideos:()=>runtimeVideos,getFiles:()=>runtimeFiles,openVideo};
})();
