/*! Thầy Gia Huy — Education core (assignments, grades, quiz, flashcards, progress) */
(function (global) {
  'use strict';

  const KEYS = {
    assignments: 'giahuy-assignments-v1',
    submissions: 'giahuy-submissions-v1',
    grades: 'giahuy-grades-v1',
    quizzes: 'giahuy-quizzes-v1',
    quizAttempts: 'giahuy-quiz-attempts-v1',
    flashcards: 'giahuy-flashcards-v1',
    notes: 'giahuy-notes-v1',
    progress: 'giahuy-progress-v1',
    subjects: 'giahuy-subjects-v1'
  };

  const SUBJECTS_DEFAULT = [
    { id: 'toan', name: 'Toán', color: '#4f6ef7', icon: 'cil-calculator' },
    { id: 'van', name: 'Ngữ văn', color: '#e07a3d', icon: 'cil-book' },
    { id: 'anh', name: 'Tiếng Anh', color: '#2bb0a6', icon: 'cil-language' },
    { id: 'ly', name: 'Vật lý', color: '#8b5cf6', icon: 'cil-lightbulb' },
    { id: 'hoa', name: 'Hóa học', color: '#ef4444', icon: 'cil-flask' },
    { id: 'sinh', name: 'Sinh học', color: '#22c55e', icon: 'cil-leaf' },
    { id: 'su', name: 'Lịch sử', color: '#b45309', icon: 'cil-bank' },
    { id: 'dia', name: 'Địa lý', color: '#0ea5e9', icon: 'cil-globe-alt' },
    { id: 'tin', name: 'Tin học', color: '#6366f1', icon: 'cil-devices' },
    { id: 'khac', name: 'Khác', color: '#64748b', icon: 'cil-folder' }
  ];

  const QUIZ_SEED = [
    {
      id: 'quiz-toan-can',
      subject: 'toan',
      title: 'Căn bậc hai — Lớp 9',
      desc: 'Ôn tập kiến thức căn bậc hai cơ bản',
      timeLimit: 10,
      questions: [
        { q: '√16 bằng bao nhiêu?', options: ['2', '4', '8', '16'], answer: 1 },
        { q: '√(9/25) bằng?', options: ['3/5', '9/25', '3/25', '5/3'], answer: 0 },
        { q: 'Điều kiện của √(x−3) là?', options: ['x > 3', 'x ≥ 3', 'x ≤ 3', 'x ≠ 3'], answer: 1 },
        { q: '√50 rút gọn thành?', options: ['5√2', '2√5', '25√2', '10√5'], answer: 0 },
        { q: '√a · √b = ? (a,b ≥ 0)', options: ['√(a+b)', '√(a·b)', 'a√b', '√(a/b)'], answer: 1 }
      ]
    },
    {
      id: 'quiz-anh-tenses',
      subject: 'anh',
      title: 'English Tenses — Present',
      desc: 'Present Simple & Present Continuous',
      timeLimit: 8,
      questions: [
        { q: 'She ___ to school every day.', options: ['go', 'goes', 'going', 'gone'], answer: 1 },
        { q: 'Look! It ___ outside.', options: ['rains', 'rain', 'is raining', 'rained'], answer: 2 },
        { q: 'I usually ___ coffee in the morning.', options: ['drink', 'drinks', 'am drinking', 'drank'], answer: 0 },
        { q: 'They ___ football now.', options: ['play', 'plays', 'are playing', 'played'], answer: 2 },
        { q: 'The sun ___ in the east.', options: ['rise', 'rises', 'is rising', 'rose'], answer: 1 }
      ]
    },
    {
      id: 'quiz-van-tv',
      subject: 'van',
      title: 'Từ vựng & Thành ngữ',
      desc: 'Ôn tập thành ngữ tiếng Việt phổ biến',
      timeLimit: 7,
      questions: [
        { q: '“Nước chảy đá mòn” nghĩa là?', options: ['Kiên trì sẽ thành công', 'Nước rất mạnh', 'Đá mềm', 'Không làm gì'], answer: 0 },
        { q: '“Một nắng hai sương” chỉ?', options: ['Thời tiết', 'Vất vả mưu sinh', 'Du lịch', 'Nghỉ ngơi'], answer: 1 },
        { q: '“Cơm lành canh ngọt” chỉ?', options: ['Món ăn ngon', 'Cuộc sống hòa thuận', 'Nấu ăn giỏi', 'Nhà hàng'], answer: 1 },
        { q: 'Trái nghĩa của “siêng năng”?', options: ['Chăm chỉ', 'Lười biếng', 'Cần cù', 'Kiên trì'], answer: 1 }
      ]
    },
    {
      id: 'quiz-ly-co',
      subject: 'ly',
      title: 'Cơ học — Lực & Chuyển động',
      desc: 'Kiến thức cơ bản về lực',
      timeLimit: 10,
      questions: [
        { q: 'Đơn vị lực trong hệ SI là?', options: ['Joule', 'Newton', 'Watt', 'Pascal'], answer: 1 },
        { q: 'Lực hấp dẫn Trái Đất tác dụng lên vật gọi là?', options: ['Ma sát', 'Đàn hồi', 'Trọng lực', 'Hướng tâm'], answer: 2 },
        { q: 'Công thức vận tốc đều: v = ?', options: ['s/t', 't/s', 's·t', 'a·t'], answer: 0 },
        { q: 'Gia tốc trọng trường g ≈ ?', options: ['8.9 m/s²', '9.8 m/s²', '10.8 m/s²', '6.7 m/s²'], answer: 1 }
      ]
    }
  ];

  const FLASH_SEED = [
    { id: 'fc1', subject: 'toan', front: 'Công thức nghiệm phương trình ax²+bx+c=0', back: 'x = (−b ± √Δ) / (2a), với Δ = b² − 4ac' },
    { id: 'fc2', subject: 'toan', front: 'Định lý Pytago', back: 'Trong tam giác vuông: a² + b² = c² (c là cạnh huyền)' },
    { id: 'fc3', subject: 'anh', front: 'Present Perfect — cấu trúc', back: 'S + have/has + V3/ed + …' },
    { id: 'fc4', subject: 'anh', front: '“Although” dùng như thế nào?', back: 'Although + S + V, S + V (mặc dù…)' },
    { id: 'fc5', subject: 'van', front: 'Ẩn dụ là gì?', back: 'Gọi tên sự vật này bằng tên sự vật khác có nét tương đồng' },
    { id: 'fc6', subject: 'ly', front: 'Định luật I Newton', back: 'Vật đang đứng yên/chuyển động thẳng đều sẽ giữ nguyên trạng thái nếu không có lực tác dụng' },
    { id: 'fc7', subject: 'hoa', front: 'Công thức tính số mol', back: 'n = m/M = V/22.4 (đktc) = C·V' },
    { id: 'fc8', subject: 'sinh', front: 'Quang hợp xảy ra ở đâu?', back: 'Lục lạp (chủ yếu ở lá xanh)' }
  ];

  function load(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  function save(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }

  function uid(prefix) {
    return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
  }

  function ensureSeed() {
    if (!localStorage.getItem(KEYS.subjects)) save(KEYS.subjects, SUBJECTS_DEFAULT);
    if (!localStorage.getItem(KEYS.quizzes)) save(KEYS.quizzes, QUIZ_SEED);
    if (!localStorage.getItem(KEYS.flashcards)) save(KEYS.flashcards, FLASH_SEED);
    if (!localStorage.getItem(KEYS.assignments)) {
      const demo = [
        {
          id: 'asg-demo-1',
          title: 'Bài tập Căn bậc hai — Tuần 3',
          subject: 'toan',
          desc: 'Làm các bài 1–12 trang 45 SGK. Nộp ảnh hoặc file PDF.',
          due: Date.now() + 3 * 86400000,
          points: 10,
          classId: null,
          createdBy: 'admin',
          createdAt: Date.now() - 86400000,
          status: 'open'
        },
        {
          id: 'asg-demo-2',
          title: 'Viết đoạn văn nghị luận 200 chữ',
          subject: 'van',
          desc: 'Chủ đề: Ý nghĩa của sự kiên trì trong học tập.',
          due: Date.now() + 5 * 86400000,
          points: 15,
          classId: null,
          createdBy: 'admin',
          createdAt: Date.now() - 43200000,
          status: 'open'
        },
        {
          id: 'asg-demo-3',
          title: 'Vocabulary Unit 5 — Flashcards',
          subject: 'anh',
          desc: 'Học 20 từ mới Unit 5 và làm bài quiz kèm theo.',
          due: Date.now() + 2 * 86400000,
          points: 10,
          classId: null,
          createdBy: 'admin',
          createdAt: Date.now() - 7200000,
          status: 'open'
        }
      ];
      save(KEYS.assignments, demo);
    }
  }

  /* —— Subjects —— */
  function getSubjects() {
    ensureSeed();
    return load(KEYS.subjects, SUBJECTS_DEFAULT);
  }

  function subjectOf(id) {
    return getSubjects().find(s => s.id === id) || { id: id || 'khac', name: id || 'Khác', color: '#64748b', icon: 'cil-folder' };
  }

  /* —— Assignments —— */
  function getAssignments() {
    ensureSeed();
    return load(KEYS.assignments, []);
  }

  function saveAssignments(list) {
    save(KEYS.assignments, list);
  }

  function createAssignment(data) {
    const list = getAssignments();
    const item = {
      id: uid('asg'),
      title: (data.title || '').trim(),
      subject: data.subject || 'khac',
      desc: (data.desc || '').trim(),
      due: data.due || Date.now() + 7 * 86400000,
      points: Number(data.points) || 10,
      classId: data.classId || null,
      createdBy: data.createdBy || 'admin',
      createdAt: Date.now(),
      status: 'open'
    };
    if (!item.title) return { ok: false, msg: 'Nhập tiêu đề bài tập.' };
    list.unshift(item);
    saveAssignments(list);
    return { ok: true, item };
  }

  function updateAssignment(id, patch) {
    const list = getAssignments();
    const i = list.findIndex(x => x.id === id);
    if (i < 0) return { ok: false, msg: 'Không tìm thấy.' };
    list[i] = { ...list[i], ...patch };
    saveAssignments(list);
    return { ok: true, item: list[i] };
  }

  function deleteAssignment(id) {
    saveAssignments(getAssignments().filter(x => x.id !== id));
    const subs = getSubmissions().filter(s => s.assignmentId !== id);
    save(KEYS.submissions, subs);
    return { ok: true };
  }

  function getSubmissions() {
    return load(KEYS.submissions, []);
  }

  function submitAssignment(assignmentId, studentId, studentName, content) {
    const subs = getSubmissions();
    const existing = subs.find(s => s.assignmentId === assignmentId && s.studentId === studentId);
    if (existing) {
      existing.content = content;
      existing.submittedAt = Date.now();
      existing.status = 'submitted';
      save(KEYS.submissions, subs);
      return { ok: true, submission: existing, updated: true };
    }
    const sub = {
      id: uid('sub'),
      assignmentId,
      studentId,
      studentName: studentName || 'Học sinh',
      content: (content || '').trim(),
      submittedAt: Date.now(),
      status: 'submitted',
      score: null,
      feedback: ''
    };
    subs.push(sub);
    save(KEYS.submissions, subs);
    bumpProgress(studentId, 'assignment');
    return { ok: true, submission: sub };
  }

  function gradeSubmission(subId, score, feedback) {
    const subs = getSubmissions();
    const s = subs.find(x => x.id === subId);
    if (!s) return { ok: false, msg: 'Không tìm thấy bài nộp.' };
    s.score = Number(score);
    s.feedback = feedback || '';
    s.status = 'graded';
    s.gradedAt = Date.now();
    save(KEYS.submissions, subs);

    // mirror into grades book
    const asg = getAssignments().find(a => a.id === s.assignmentId);
    addGrade({
      studentId: s.studentId,
      studentName: s.studentName,
      subject: asg ? asg.subject : 'khac',
      title: asg ? asg.title : 'Bài tập',
      score: s.score,
      maxScore: asg ? asg.points : 10,
      type: 'assignment',
      refId: s.assignmentId
    });
    return { ok: true, submission: s };
  }

  function mySubmission(assignmentId, studentId) {
    return getSubmissions().find(s => s.assignmentId === assignmentId && s.studentId === studentId) || null;
  }

  /* —— Grades —— */
  function getGrades() {
    return load(KEYS.grades, []);
  }

  function addGrade(data) {
    const list = getGrades();
    const g = {
      id: uid('gr'),
      studentId: data.studentId,
      studentName: data.studentName || '',
      subject: data.subject || 'khac',
      title: data.title || 'Điểm',
      score: Number(data.score),
      maxScore: Number(data.maxScore) || 10,
      type: data.type || 'manual',
      refId: data.refId || null,
      note: data.note || '',
      at: Date.now()
    };
    list.unshift(g);
    save(KEYS.grades, list);
    return { ok: true, grade: g };
  }

  function deleteGrade(id) {
    save(KEYS.grades, getGrades().filter(g => g.id !== id));
    return { ok: true };
  }

  function gradesForStudent(studentId) {
    return getGrades().filter(g => g.studentId === studentId);
  }

  function averageForStudent(studentId, subjectId) {
    let list = gradesForStudent(studentId);
    if (subjectId) list = list.filter(g => g.subject === subjectId);
    if (!list.length) return null;
    const pct = list.map(g => (g.score / (g.maxScore || 10)) * 10);
    const avg = pct.reduce((a, b) => a + b, 0) / pct.length;
    return Math.round(avg * 100) / 100;
  }

  /* —— Quizzes —— */
  function getQuizzes() {
    ensureSeed();
    return load(KEYS.quizzes, QUIZ_SEED);
  }

  function getQuiz(id) {
    return getQuizzes().find(q => q.id === id) || null;
  }

  function saveQuizAttempt(quizId, studentId, studentName, answers, score, total) {
    const list = load(KEYS.quizAttempts, []);
    const att = {
      id: uid('qa'),
      quizId,
      studentId,
      studentName: studentName || '',
      answers,
      score,
      total,
      pct: total ? Math.round((score / total) * 100) : 0,
      at: Date.now()
    };
    list.unshift(att);
    save(KEYS.quizAttempts, list);
    bumpProgress(studentId, 'quiz', att.pct);
    if (studentId) {
      const quiz = getQuiz(quizId);
      addGrade({
        studentId,
        studentName,
        subject: quiz ? quiz.subject : 'khac',
        title: quiz ? 'Quiz: ' + quiz.title : 'Quiz',
        score: score,
        maxScore: total,
        type: 'quiz',
        refId: quizId
      });
    }
    return att;
  }

  function myQuizAttempts(studentId, quizId) {
    return load(KEYS.quizAttempts, []).filter(a => a.studentId === studentId && (!quizId || a.quizId === quizId));
  }

  function gradeQuiz(quiz, answerMap) {
    let score = 0;
    const detail = [];
    (quiz.questions || []).forEach((q, i) => {
      const chosen = answerMap[i];
      const ok = chosen === q.answer;
      if (ok) score++;
      detail.push({ i, ok, chosen, correct: q.answer });
    });
    return { score, total: quiz.questions.length, detail };
  }

  /* —— Flashcards & Notes —— */
  function getFlashcards(subjectId) {
    ensureSeed();
    const all = load(KEYS.flashcards, FLASH_SEED);
    return subjectId ? all.filter(f => f.subject === subjectId) : all;
  }

  function addFlashcard(data) {
    const list = getFlashcards();
    const card = {
      id: uid('fc'),
      subject: data.subject || 'khac',
      front: (data.front || '').trim(),
      back: (data.back || '').trim(),
      createdAt: Date.now()
    };
    if (!card.front || !card.back) return { ok: false, msg: 'Nhập đủ 2 mặt thẻ.' };
    list.unshift(card);
    save(KEYS.flashcards, list);
    return { ok: true, card };
  }

  function deleteFlashcard(id) {
    save(KEYS.flashcards, getFlashcards().filter(f => f.id !== id));
    return { ok: true };
  }

  function getNotes(ownerId) {
    return load(KEYS.notes, []).filter(n => !ownerId || n.ownerId === ownerId);
  }

  function saveNote(data) {
    const list = load(KEYS.notes, []);
    if (data.id) {
      const i = list.findIndex(n => n.id === data.id);
      if (i >= 0) {
        list[i] = { ...list[i], ...data, updatedAt: Date.now() };
        save(KEYS.notes, list);
        return { ok: true, note: list[i] };
      }
    }
    const note = {
      id: uid('note'),
      ownerId: data.ownerId || 'guest',
      subject: data.subject || 'khac',
      title: (data.title || 'Ghi chú').trim(),
      body: (data.body || '').trim(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    list.unshift(note);
    save(KEYS.notes, list);
    return { ok: true, note };
  }

  function deleteNote(id) {
    save(KEYS.notes, load(KEYS.notes, []).filter(n => n.id !== id));
    return { ok: true };
  }

  /* —— Progress / streaks —— */
  function getProgress(userId) {
    const all = load(KEYS.progress, {});
    if (!all[userId]) {
      all[userId] = {
        assignmentsDone: 0,
        quizzesDone: 0,
        quizAvg: 0,
        studyMinutes: 0,
        streak: 0,
        lastStudy: null,
        xp: 0
      };
    }
    return all[userId];
  }

  function bumpProgress(userId, type, extra) {
    if (!userId) return;
    const all = load(KEYS.progress, {});
    const p = all[userId] || {
      assignmentsDone: 0,
      quizzesDone: 0,
      quizAvg: 0,
      studyMinutes: 0,
      streak: 0,
      lastStudy: null,
      xp: 0
    };
    const today = new Date().toDateString();
    if (p.lastStudy !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      p.streak = p.lastStudy === yesterday ? (p.streak || 0) + 1 : 1;
      p.lastStudy = today;
    }
    if (type === 'assignment') {
      p.assignmentsDone = (p.assignmentsDone || 0) + 1;
      p.xp = (p.xp || 0) + 15;
    } else if (type === 'quiz') {
      p.quizzesDone = (p.quizzesDone || 0) + 1;
      const pct = Number(extra) || 0;
      p.quizAvg = p.quizzesDone <= 1 ? pct : Math.round((p.quizAvg * (p.quizzesDone - 1) + pct) / p.quizzesDone);
      p.xp = (p.xp || 0) + Math.max(5, Math.round(pct / 5));
    } else if (type === 'study') {
      p.studyMinutes = (p.studyMinutes || 0) + (Number(extra) || 5);
      p.xp = (p.xp || 0) + 3;
    }
    all[userId] = p;
    save(KEYS.progress, all);
    return p;
  }

  function levelFromXp(xp) {
    const levels = [0, 50, 120, 220, 350, 500, 700, 950, 1250, 1600];
    let lv = 1;
    for (let i = 0; i < levels.length; i++) {
      if (xp >= levels[i]) lv = i + 1;
    }
    const cur = levels[lv - 1] || 0;
    const next = levels[lv] || cur + 400;
    return { level: lv, xp, cur, next, pct: Math.min(100, Math.round(((xp - cur) / (next - cur)) * 100)) };
  }

  /* —— Helpers —— */
  function fmtDate(ts) {
    if (!ts) return '—';
    return new Date(ts).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  function fmtDateTime(ts) {
    if (!ts) return '—';
    return new Date(ts).toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  function dueLabel(ts) {
    const d = ts - Date.now();
    if (d < 0) return { text: 'Quá hạn', cls: 'due-late' };
    if (d < 86400000) return { text: 'Hôm nay', cls: 'due-soon' };
    if (d < 2 * 86400000) return { text: 'Ngày mai', cls: 'due-soon' };
    const days = Math.ceil(d / 86400000);
    return { text: 'Còn ' + days + ' ngày', cls: 'due-ok' };
  }

  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
  }

  ensureSeed();

  global.Edu = {
    KEYS,
    getSubjects,
    subjectOf,
    getAssignments,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    getSubmissions,
    submitAssignment,
    gradeSubmission,
    mySubmission,
    getGrades,
    addGrade,
    deleteGrade,
    gradesForStudent,
    averageForStudent,
    getQuizzes,
    getQuiz,
    gradeQuiz,
    saveQuizAttempt,
    myQuizAttempts,
    getFlashcards,
    addFlashcard,
    deleteFlashcard,
    getNotes,
    saveNote,
    deleteNote,
    getProgress,
    bumpProgress,
    levelFromXp,
    fmtDate,
    fmtDateTime,
    dueLabel,
    esc,
    ensureSeed
  };
})(window);
