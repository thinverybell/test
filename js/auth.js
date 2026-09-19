/* Shared auth — students, teachers, managers, admin */
const Auth = (() => {
  const SESSION_KEY = 'giahuy-session';
  const STUDENTS_KEY = 'giahuy-students';
  const TEACHERS_KEY = 'giahuy-teachers';
  const MANAGERS_KEY = 'giahuy-managers';
  const CLASSES_KEY = 'giahuy-classes';
  const SCHEDULE_KEY = 'giahuy-schedule';
  const ADMIN_PROFILE_KEY = 'giahuy-admin-profile';
  const DEFAULT_ADMIN_PASS = 'giahuy-admin';

  /** All grantable permissions */
  const PERMS = {
    upload: 'Upload tài nguyên',
    upload_free: 'Upload tài liệu Free',
    upload_paid: 'Upload tài liệu Paid',
    access_paid: 'Tải / dùng tài liệu Paid (không cần gói)',
    library: 'Thư viện',
    music: 'Nhạc',
    stats: 'Thống kê',
    settings: 'Toàn bộ cài đặt',
    avatar: 'Đổi avatar website',
    create_student: 'Tạo học sinh',
    create_teacher: 'Tạo giáo viên',
    manage_accounts: 'Quản lý tài khoản',
    manage_managers: 'Quản lý tài khoản quản lí',
    notifications: 'Đăng thông báo hệ thống',
    schedule: 'Chỉnh lịch học',
    notify_teachers: 'Gửi thông báo cho giáo viên'
  };

  const ALL_PERM_KEYS = Object.keys(PERMS);

  function toast(msg, isError) {
    const el = document.getElementById('authToast') || document.getElementById('toast');
    if (!el) { alert(msg); return; }
    el.hidden = false;
    el.textContent = msg;
    el.classList.add('show');
    el.dataset.type = isError ? 'error' : 'ok';
    clearTimeout(el._t);
    el._t = setTimeout(() => { el.classList.remove('show'); el.hidden = true; }, 2800);
  }

  function getList(key) {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); }
    catch { return []; }
  }
  function saveList(key, list) {
    localStorage.setItem(key, JSON.stringify(list));
  }

  function getStudents() { return getList(STUDENTS_KEY); }
  function saveStudents(list) { saveList(STUDENTS_KEY, list); }
  function getTeachers() { return getList(TEACHERS_KEY); }
  function saveTeachers(list) { saveList(TEACHERS_KEY, list); }
  function getManagers() { return getList(MANAGERS_KEY); }
  function saveManagers(list) { saveList(MANAGERS_KEY, list); }

  function getStudentsByOwner(ownerId) {
    const all = getStudents();
    if (!ownerId || ownerId === 'admin') return all;
    return all.filter(s => s.ownerId === ownerId);
  }

  /**
   * Mã mời: HS- / GV- / QL- + 20 ký tự (chữ hoa, thường, số)
   * prefix: 'HS' | 'GV' | 'QL' (hoặc kind student/teacher/manager)
   */
  function genInvite(prefix) {
    let tag = 'HS';
    const p = String(prefix || '').toUpperCase();
    if (p === 'GV' || p === 'TEACHER') tag = 'GV';
    else if (p === 'QL' || p === 'MANAGER') tag = 'QL';
    else if (p === 'HS' || p === 'STUDENT') tag = 'HS';
    else if (p.indexOf('GV') === 0) tag = 'GV';
    else if (p.indexOf('QL') === 0) tag = 'QL';

    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
      'abcdefghijklmnopqrstuvwxyz' +
      '0123456789';
    let s = '';
    for (let i = 0; i < 20; i++) {
      s += chars[Math.floor(Math.random() * chars.length)];
    }
    return tag + '-' + s;
  }

  /**
   * Mật khẩu / mã mời chỉ được: A–Z, a–z, 0–9, @ và -
   * Trả về null nếu hợp lệ, hoặc chuỗi lỗi.
   */
  function validatePassChars(value, label) {
    const v = String(value == null ? '' : value);
    if (!v.length) return (label || 'Mật khẩu') + ' không được trống.';
    if (!/^[A-Za-z0-9@\-]+$/.test(v)) {
      return (label || 'Mật khẩu') + ' chỉ gồm chữ hoa, chữ thường, số, dấu @ và -.';
    }
    return null;
  }

  /* —— Admin profile (single root admin) —— */
  function getAdminProfile() {
    try {
      const raw = localStorage.getItem(ADMIN_PROFILE_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        return {
          username: p.username || 'Quản trị viên',
          password: p.password || DEFAULT_ADMIN_PASS
        };
      }
    } catch (_) {}
    return { username: 'Quản trị viên', password: DEFAULT_ADMIN_PASS };
  }

  function setAdminProfile(opts) {
    const cur = getAdminProfile();
    if (opts && opts.username != null) {
      const u = String(opts.username).trim();
      if (u.length < 2) return { ok: false, msg: 'Tên quá ngắn.' };
      cur.username = u;
    }
    if (opts && opts.password != null) {
      const pw = String(opts.password).trim();
      if (pw.length < 4) return { ok: false, msg: 'Mật khẩu tối thiểu 4 ký tự.' };
      const bad = validatePassChars(pw, 'Mật khẩu');
      if (bad) return { ok: false, msg: bad };
      cur.password = pw;
    }
    localStorage.setItem(ADMIN_PROFILE_KEY, JSON.stringify(cur));
    const s = getSession();
    if (s && s.role === 'admin') {
      s.username = cur.username;
      setSession(s);
    }
    return { ok: true, profile: cur };
  }

  function getSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw);
      if (!s || !s.role) return null;
      return s;
    } catch { return null; }
  }

  function setSession(session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  function loginStudent(username, invite) {
    const u = (username || '').trim();
    const inv = (invite || '').trim();
    if (!u || !inv) return { ok: false, msg: 'Nhập đủ tên đăng nhập và mã mời.' };
    const found = getStudents().find(x =>
      x.username.toLowerCase() === u.toLowerCase() &&
      x.inviteCode === inv
    );
    if (!found) return { ok: false, msg: 'Sai tên đăng nhập hoặc mã mời học sinh.' };
    setSession({
      role: 'student',
      username: found.username,
      id: found.id,
      ownerId: found.ownerId || null,
      at: Date.now()
    });
    return { ok: true };
  }

  function loginTeacher(username, invite) {
    const u = (username || '').trim();
    const inv = (invite || '').trim();
    if (!u || !inv) return { ok: false, msg: 'Nhập đủ tên đăng nhập và mã mời giáo viên.' };
    const found = getTeachers().find(x =>
      x.username.toLowerCase() === u.toLowerCase() &&
      x.inviteCode === inv
    );
    if (!found) return { ok: false, msg: 'Sai tên đăng nhập hoặc mã mời giáo viên.' };
    setSession({
      role: 'teacher',
      username: found.username,
      id: found.id,
      permissions: Array.isArray(found.permissions) ? found.permissions.slice() : [],
      at: Date.now()
    });
    localStorage.setItem('giahuy-admin', '1');
    return { ok: true };
  }

  function loginAdmin(password) {
    const profile = getAdminProfile();
    if ((password || '') !== profile.password) {
      return { ok: false, msg: 'Mật khẩu quản trị viên không đúng.' };
    }
    setSession({
      role: 'admin',
      username: profile.username,
      permissions: ALL_PERM_KEYS.slice(),
      at: Date.now()
    });
    localStorage.setItem('giahuy-admin', '1');
    return { ok: true };
  }

  function loginManager(username, invite) {
    const u = (username || '').trim();
    const inv = (invite || '').trim();
    if (!u || !inv) return { ok: false, msg: 'Nhập đủ tên đăng nhập và mã mời quản lí.' };
    const found = getManagers().find(x =>
      x.username.toLowerCase() === u.toLowerCase() &&
      x.inviteCode === inv
    );
    if (!found) return { ok: false, msg: 'Sai tên đăng nhập hoặc mã mời quản lí.' };
    setSession({
      role: 'manager',
      username: found.username,
      id: found.id,
      permissions: Array.isArray(found.permissions) ? found.permissions.slice() : [],
      at: Date.now()
    });
    localStorage.setItem('giahuy-admin', '1');
    return { ok: true };
  }

  function logout() {
    clearSession();
    localStorage.removeItem('giahuy-admin');
    location.href = 'login';
  }

  function isStaffRole(role) {
    return role === 'admin' || role === 'teacher' || role === 'manager';
  }

  function requireAuth(opts) {
    const s = getSession();
    if (!s) {
      location.replace('login');
      return null;
    }
    if (opts && opts.staffOnly && !isStaffRole(s.role)) {
      location.replace('/');
      return null;
    }
    if (opts && opts.adminOnly && s.role !== 'admin') {
      location.replace(isStaffRole(s.role) ? 'teacher' : '/');
      return null;
    }
    return s;
  }

  /** Does current session (or given perms) have a permission? Admin always yes. */
  function hasPerm(perm, sessionOrPerms) {
    let role, perms;
    if (Array.isArray(sessionOrPerms)) {
      role = null;
      perms = sessionOrPerms;
    } else {
      const s = sessionOrPerms || getSession();
      if (!s) return false;
      if (s.role === 'admin') return true;
      role = s.role;
      perms = s.permissions || [];
    }
    return perms.indexOf(perm) >= 0;
  }

  function usernameTaken(u, excludeId) {
    const low = u.toLowerCase();
    const lists = [getStudents(), getTeachers(), getManagers(), getList('giahuy-guests')];
    for (const list of lists) {
      if (list.some(x => x.username.toLowerCase() === low && x.id !== excludeId)) return true;
    }
    return false;
  }

  function createAccount(kind, username, ownerId, permissions, classId) {
    const u = (username || '').trim();
    if (!u) return { ok: false, msg: 'Nhập tên đăng nhập.' };
    if (u.length < 2) return { ok: false, msg: 'Tên đăng nhập quá ngắn.' };
    if (usernameTaken(u)) return { ok: false, msg: 'Tên đăng nhập đã tồn tại.' };

    if (kind === 'manager') {
      const list = getManagers();
      const row = {
        id: 'mg_' + Date.now().toString(36),
        username: u,
        inviteCode: genInvite('QL'),
        permissions: Array.isArray(permissions) ? permissions.filter(p => ALL_PERM_KEYS.indexOf(p) >= 0) : [],
        created: Date.now()
      };
      list.push(row);
      saveManagers(list);
      return { ok: true, account: row };
    }

    const key = kind === 'teacher' ? TEACHERS_KEY : STUDENTS_KEY;
    const list = getList(key);
    const row = {
      id: (kind === 'teacher' ? 'tc_' : 'st_') + Date.now().toString(36),
      username: u,
      inviteCode: genInvite(kind === 'teacher' ? 'GV' : 'HS'),
      created: Date.now()
    };
    if (kind === 'student') {
      row.ownerId = ownerId || 'admin';
      if (classId) row.classId = classId;
    }
    if (kind === 'teacher') {
      row.avatar = null;
      row.permissions = Array.isArray(permissions) ? permissions.filter(p => ALL_PERM_KEYS.indexOf(p) >= 0) : [];
    }
    list.push(row);
    saveList(key, list);
    return { ok: true, account: row };
  }

  function deleteAccount(kind, id) {
    if (kind === 'manager') {
      saveManagers(getManagers().filter(x => x.id !== id));
      return { ok: true };
    }
    const key = kind === 'teacher' ? TEACHERS_KEY : STUDENTS_KEY;
    if (kind === 'teacher') {
      const students = getStudents().filter(s => s.ownerId !== id);
      saveStudents(students);
      try { localStorage.removeItem('giahuy-avatar-' + id); } catch (_) {}
    }
    saveList(key, getList(key).filter(x => x.id !== id));
    return { ok: true };
  }

  function resetInvite(kind, id) {
    let key, prefix;
    if (kind === 'manager') { key = MANAGERS_KEY; prefix = 'QL'; }
    else if (kind === 'teacher') { key = TEACHERS_KEY; prefix = 'GV'; }
    else { key = STUDENTS_KEY; prefix = 'HS'; }
    const list = getList(key);
    const i = list.findIndex(x => x.id === id);
    if (i < 0) return { ok: false, msg: 'Không tìm thấy.' };
    list[i].inviteCode = genInvite(prefix);
    saveList(key, list);
    return { ok: true, account: list[i] };
  }

  function updateAccount(kind, id, opts) {
    let key;
    if (kind === 'manager') key = MANAGERS_KEY;
    else if (kind === 'teacher') key = TEACHERS_KEY;
    else key = STUDENTS_KEY;
    const list = getList(key);
    const i = list.findIndex(x => x.id === id);
    if (i < 0) return { ok: false, msg: 'Không tìm thấy.' };
    const row = list[i];
    if (opts && opts.username != null) {
      const u = String(opts.username).trim();
      if (u.length < 2) return { ok: false, msg: 'Tên đăng nhập quá ngắn.' };
      if (usernameTaken(u, id)) return { ok: false, msg: 'Tên đăng nhập đã tồn tại.' };
      row.username = u;
    }
    if (opts && opts.inviteCode != null) {
      const inv = String(opts.inviteCode).trim();
      if (inv.length < 4) return { ok: false, msg: 'Mã mời quá ngắn.' };
      const bad = validatePassChars(inv, 'Mã mời');
      if (bad) return { ok: false, msg: bad };
      row.inviteCode = inv;
    }
    if (opts && opts.permissions != null && (kind === 'teacher' || kind === 'manager')) {
      row.permissions = Array.isArray(opts.permissions)
        ? opts.permissions.filter(p => ALL_PERM_KEYS.indexOf(p) >= 0)
        : [];
    }
    list[i] = row;
    saveList(key, list);
    const s = getSession();
    if (s && s.id === id && (s.role === kind || (kind === 'manager' && s.role === 'manager'))) {
      s.username = row.username;
      if (row.permissions) s.permissions = row.permissions.slice();
      setSession(s);
    }
    return { ok: true, account: row };
  }

  function setPermissions(kind, id, permissions) {
    return updateAccount(kind, id, { permissions });
  }

  function getTeacherById(id) {
    return getTeachers().find(t => t.id === id) || null;
  }
  function getManagerById(id) {
    return getManagers().find(m => m.id === id) || null;
  }

  function setTeacherAvatar(id, dataUrl) {
    const list = getTeachers();
    const i = list.findIndex(x => x.id === id);
    if (i < 0) return { ok: false, msg: 'Không tìm thấy.' };
    list[i].avatar = dataUrl || null;
    saveTeachers(list);
    try {
      if (dataUrl) localStorage.setItem('giahuy-avatar-' + id, dataUrl);
      else localStorage.removeItem('giahuy-avatar-' + id);
    } catch (_) {}
    return { ok: true, account: list[i] };
  }

  function getTeacherAvatar(id) {
    try {
      const cached = localStorage.getItem('giahuy-avatar-' + id);
      if (cached) return cached;
    } catch (_) {}
    const t = getTeacherById(id);
    return (t && t.avatar) || null;
  }

  function createStudent(username, ownerId) {
    return createAccount('student', username, ownerId);
  }

  const GUESTS_KEY = 'giahuy-guests';
  function getGuests() { return getList(GUESTS_KEY); }
  function saveGuests(list) { saveList(GUESTS_KEY, list); }

  /**
   * Đăng ký tài khoản khách (acc ngoại) — chỉ xem tài liệu, không có panel.
   */
  function registerGuest(username, password) {
    const u = (username || '').trim();
    const pw = (password || '').trim();
    if (!u) return { ok: false, msg: 'Nhập tên đăng nhập.' };
    if (u.length < 2) return { ok: false, msg: 'Tên đăng nhập quá ngắn.' };
    if (usernameTaken(u) || getGuests().some(g => g.username.toLowerCase() === u.toLowerCase())) {
      return { ok: false, msg: 'Tên đăng nhập đã tồn tại.' };
    }
    if (pw.length < 4) return { ok: false, msg: 'Mật khẩu tối thiểu 4 ký tự.' };
    const bad = validatePassChars(pw, 'Mật khẩu');
    if (bad) return { ok: false, msg: bad };

    const list = getGuests();
    const row = {
      id: 'gs_' + Date.now().toString(36),
      username: u,
      password: pw,
      avatar: null,
      muted: false,
      created: Date.now()
    };
    list.push(row);
    saveGuests(list);
    setSession({
      role: 'guest',
      id: row.id,
      username: row.username,
      guest: true
    });
    return { ok: true, account: row };
  }

  function loginGuest(username, password) {
    const u = (username || '').trim();
    const pw = (password || '').trim();
    if (!u || !pw) return { ok: false, msg: 'Nhập đủ tên đăng nhập và mật khẩu.' };
    const found = getGuests().find(x => x.username === u && x.password === pw);
    if (!found) return { ok: false, msg: 'Sai tên đăng nhập hoặc mật khẩu khách.' };
    if (found.muted) return { ok: false, msg: 'Tài khoản khách đang bị hạn chế. Liên hệ hỗ trợ.' };
    setSession({
      role: 'guest',
      id: found.id,
      username: found.username,
      guest: true
    });
    return { ok: true, account: found };
  }

  function getGuestById(id) {
    return getGuests().find(g => g.id === id) || null;
  }

  function updateGuestProfile(id, opts) {
    const list = getGuests();
    const i = list.findIndex(g => g.id === id);
    if (i < 0) return { ok: false, msg: 'Không tìm thấy tài khoản.' };
    const row = list[i];
    if (opts && opts.username != null) {
      const u = String(opts.username).trim();
      if (u.length < 2) return { ok: false, msg: 'Tên đăng nhập quá ngắn.' };
      if (usernameTaken(u, id) || list.some(g => g.id !== id && g.username.toLowerCase() === u.toLowerCase())) {
        return { ok: false, msg: 'Tên đăng nhập đã tồn tại.' };
      }
      row.username = u;
    }
    if (opts && opts.password != null) {
      const pw = String(opts.password).trim();
      if (pw.length < 4) return { ok: false, msg: 'Mật khẩu tối thiểu 4 ký tự.' };
      const bad = validatePassChars(pw, 'Mật khẩu');
      if (bad) return { ok: false, msg: bad };
      row.password = pw;
    }
    if (opts && opts.avatar !== undefined) {
      row.avatar = opts.avatar;
    }
    list[i] = row;
    saveGuests(list);
    const s = getSession();
    if (s && s.id === id && s.role === 'guest') {
      s.username = row.username;
      setSession(s);
    }
    return { ok: true, account: row };
  }

  function setGuestMuted(id, muted) {
    const list = getGuests();
    const i = list.findIndex(g => g.id === id);
    if (i < 0) return { ok: false, msg: 'Không tìm thấy.' };
    list[i].muted = !!muted;
    saveGuests(list);
    return { ok: true, account: list[i] };
  }
  function deleteStudent(id) { return deleteAccount('student', id); }
  function resetInviteStudent(id) { return resetInvite('student', id); }


  /* —— Classes (lớp học sinh) —— */
  function getClasses() { return getList(CLASSES_KEY); }
  function saveClasses(list) { saveList(CLASSES_KEY, list); }

  function getClassesByTeacher(teacherId) {
    const all = getClasses();
    if (!teacherId || teacherId === 'admin') return all;
    return all.filter(c => c.teacherId === teacherId);
  }

  function createClass(name, teacherId) {
    const n = (name || '').trim();
    if (!n) return { ok: false, msg: 'Nhập tên lớp.' };
    if (n.length < 2) return { ok: false, msg: 'Tên lớp quá ngắn.' };
    const list = getClasses();
    if (list.some(c => c.teacherId === (teacherId || 'admin') && c.name.toLowerCase() === n.toLowerCase())) {
      return { ok: false, msg: 'Lớp này đã tồn tại.' };
    }
    const row = {
      id: 'cl_' + Date.now().toString(36),
      name: n,
      teacherId: teacherId || 'admin',
      created: Date.now()
    };
    list.push(row);
    saveClasses(list);
    return { ok: true, class: row };
  }

  function deleteClass(id) {
    // students in class become owner-only without class
    const students = getStudents().map(s => {
      if (s.classId === id) { const x = { ...s }; delete x.classId; return x; }
      return s;
    });
    saveStudents(students);
    // remove class-level schedule
    saveSchedule(getSchedule().filter(e => e.classId !== id));
    saveClasses(getClasses().filter(c => c.id !== id));
    return { ok: true };
  }

  function renameClass(id, name) {
    const n = (name || '').trim();
    if (n.length < 2) return { ok: false, msg: 'Tên lớp quá ngắn.' };
    const list = getClasses();
    const i = list.findIndex(c => c.id === id);
    if (i < 0) return { ok: false, msg: 'Không tìm thấy lớp.' };
    list[i].name = n;
    saveClasses(list);
    return { ok: true, class: list[i] };
  }

  function getStudentsByClass(classId) {
    return getStudents().filter(s => s.classId === classId);
  }

  /* —— Schedule —— */
  function getSchedule() { return getList(SCHEDULE_KEY); }
  function saveSchedule(list) { saveList(SCHEDULE_KEY, list); }

  const SCHEDULE_TYPES = {
    online: 'Lớp học trực tuyến',
    study: 'Học bài / Làm bài tập',
    exam: 'Kiểm tra / Đánh giá'
  };

  function addScheduleEvent(opts) {
    const date = (opts.date || '').trim(); // YYYY-MM-DD
    const type = opts.type;
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return { ok: false, msg: 'Ngày không hợp lệ.' };
    if (!SCHEDULE_TYPES[type]) return { ok: false, msg: 'Loại sự kiện không hợp lệ.' };
    if (!opts.classId && !opts.studentId) return { ok: false, msg: 'Thiếu lớp hoặc học sinh.' };
    const list = getSchedule();
    // one mark of same type per day per target
    const exists = list.find(e =>
      e.date === date && e.type === type &&
      e.classId === (opts.classId || null) &&
      e.studentId === (opts.studentId || null)
    );
    if (exists) return { ok: false, msg: 'Ngày này đã có loại sự kiện đó.' };
    const row = {
      id: 'sc_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      date,
      type,
      title: (opts.title || '').trim() || SCHEDULE_TYPES[type],
      classId: opts.classId || null,
      studentId: opts.studentId || null,
      by: opts.by || null,
      created: Date.now()
    };
    list.push(row);
    saveSchedule(list);
    return { ok: true, event: row };
  }

  function removeScheduleEvent(id) {
    saveSchedule(getSchedule().filter(e => e.id !== id));
    return { ok: true };
  }

  /** Events visible to a student: class-level + personal */
  function getScheduleForStudent(studentId, classId) {
    return getSchedule().filter(e =>
      (e.studentId && e.studentId === studentId) ||
      (e.classId && classId && e.classId === classId && !e.studentId)
    );
  }

  function getScheduleForClass(classId) {
    return getSchedule().filter(e => e.classId === classId && !e.studentId);
  }


  function apiOn() {
    return typeof GiahuyAPI !== 'undefined' && GiahuyAPI.enabled && GiahuyAPI.enabled();
  }

  function applyApiSession(session) {
    if (!session) return;
    if (session.token && typeof GiahuyAPI !== 'undefined') GiahuyAPI.setToken(session.token);
    const slim = {
      role: session.role,
      id: session.id || null,
      username: session.username,
      permissions: session.permissions,
      guest: session.guest || session.role === 'guest' || undefined,
      ownerId: session.ownerId || undefined,
      at: session.at || Date.now(),
      token: session.token || undefined
    };
    setSession(slim);
    if (session.role === 'admin' || session.role === 'teacher' || session.role === 'manager') {
      try { localStorage.setItem('giahuy-admin', '1'); } catch (_) {}
    }
  }

  /** Bản API — lưu 1 chiều vào MySQL (async) */
  async function registerGuestApi(username, password) {
    const data = await GiahuyAPI.request('/api/auth/register-guest', {
      method: 'POST',
      body: { username, password }
    });
    if (data && data.ok && data.session) applyApiSession(data.session);
    return data;
  }

  async function loginGuestApi(username, password) {
    const data = await GiahuyAPI.request('/api/auth/login-guest', {
      method: 'POST',
      body: { username, password }
    });
    if (data && data.ok && data.session) applyApiSession(data.session);
    return data;
  }

  async function loginStudentApi(username, invite) {
    const data = await GiahuyAPI.request('/api/auth/login-student', {
      method: 'POST',
      body: { username, invite }
    });
    if (data && data.ok && data.session) applyApiSession(data.session);
    return data;
  }

  async function loginTeacherApi(username, invite) {
    const data = await GiahuyAPI.request('/api/auth/login-teacher', {
      method: 'POST',
      body: { username, invite }
    });
    if (data && data.ok && data.session) applyApiSession(data.session);
    return data;
  }

  async function loginManagerApi(username, invite) {
    const data = await GiahuyAPI.request('/api/auth/login-manager', {
      method: 'POST',
      body: { username, invite }
    });
    if (data && data.ok && data.session) applyApiSession(data.session);
    return data;
  }

  async function loginAdminApi(password) {
    const data = await GiahuyAPI.request('/api/auth/login-admin', {
      method: 'POST',
      body: { password }
    });
    if (data && data.ok && data.session) applyApiSession(data.session);
    return data;
  }

  async function getGuestByIdApi(id) {
    const data = await GiahuyAPI.request('/api/accounts/guests/' + encodeURIComponent(id));
    if (data && data.ok) return data.account;
    return null;
  }

  async function updateGuestProfileApi(id, opts) {
    const data = await GiahuyAPI.request('/api/accounts/guests/' + encodeURIComponent(id), {
      method: 'PUT',
      body: opts || {}
    });
    if (data && data.ok && data.account) {
      const s = getSession();
      if (s && s.id === id && s.role === 'guest') {
        s.username = data.account.username;
        setSession(s);
      }
    }
    return data;
  }

  async function logoutApi() {
    try {
      await GiahuyAPI.request('/api/auth/logout', { method: 'POST', body: {} });
    } catch (_) {}
    if (typeof GiahuyAPI !== 'undefined') GiahuyAPI.setToken(null);
    clearSession();
    try { localStorage.removeItem('giahuy-admin'); } catch (_) {}
    location.href = '/';
  }

  return {
    toast,
    PERMS,
    ALL_PERM_KEYS,
    getStudents,
    saveStudents,
    getTeachers,
    saveTeachers,
    getManagers,
    saveManagers,
    getStudentsByOwner,
    getSession,
    setSession,
    /** Khi MySQL API bật → trả Promise; không thì sync object */
    loginStudent: function (username, invite) {
      if (apiOn()) return loginStudentApi(username, invite);
      return loginStudent(username, invite);
    },
    loginTeacher: function (username, invite) {
      if (apiOn()) return loginTeacherApi(username, invite);
      return loginTeacher(username, invite);
    },
    loginAdmin: function (password) {
      if (apiOn()) return loginAdminApi(password);
      return loginAdmin(password);
    },
    loginManager: function (username, invite) {
      if (apiOn()) return loginManagerApi(username, invite);
      return loginManager(username, invite);
    },
    logout: function () {
      if (apiOn()) return logoutApi();
      return logout();
    },
    requireAuth,
    isStaffRole,
    hasPerm,
    createAccount,
    registerGuest: function (username, password) {
      if (apiOn()) return registerGuestApi(username, password);
      return registerGuest(username, password);
    },
    loginGuest: function (username, password) {
      if (apiOn()) return loginGuestApi(username, password);
      return loginGuest(username, password);
    },
    getGuests,
    getGuestById: function (id) {
      if (apiOn()) return getGuestByIdApi(id);
      return getGuestById(id);
    },
    updateGuestProfile: function (id, opts) {
      if (apiOn()) return updateGuestProfileApi(id, opts);
      return updateGuestProfile(id, opts);
    },
    setGuestMuted,
    deleteAccount,
    resetInvite,
    updateAccount,
    setPermissions,
    getAdminProfile,
    setAdminProfile,
    validatePassChars,
    getTeacherById,
    getManagerById,
    setTeacherAvatar,
    getTeacherAvatar,
    getClasses,
    saveClasses,
    getClassesByTeacher,
    createClass,
    deleteClass,
    renameClass,
    getStudentsByClass,
    getSchedule,
    saveSchedule,
    SCHEDULE_TYPES,
    addScheduleEvent,
    removeScheduleEvent,
    getScheduleForStudent,
    getScheduleForClass,
    createStudent,
    deleteStudent,
    resetInviteStudent,
    TEACHER_PASS: DEFAULT_ADMIN_PASS,
    ADMIN_PASS: DEFAULT_ADMIN_PASS,
    /** true khi đang dùng MySQL backend */
    usingMySQL: apiOn
  };
})();

// Expose on window so other scripts can reliably use window.Auth
// (const does not create a window property)
window.Auth = Auth;

// Khi đăng xuất → hiện lại FAB lần sau vào trang chủ
(function(){
  const clearFab = () => { try { sessionStorage.removeItem('giahuy-fab-dock-hidden'); } catch (_) {} };
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-logout], #logoutBtn, .logout-btn, a[href*="logout"]');
    if (t) clearFab();
  });
  window.addEventListener('giahuy:logout', clearFab);
})();
