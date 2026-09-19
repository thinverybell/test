/*! Thầy Gia Huy — shared content adapter for unlocked pages. */
(function (global) {
  'use strict';

  const STORAGE = {
    profile: 'giahuy-profile',
    quizHistory: 'giahuy-quiz-history',
    quizAttempts: 'giahuy-quiz-attempts-v1',
    flashcardDecks: 'giahuy-flashcard-decks-v1'
  };

  function read(key, fallback) {
    try {
      const v = JSON.parse(localStorage.getItem(key) || 'null');
      return v == null ? fallback : v;
    } catch (_) { return fallback; }
  }

  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (_) { return false; }
  }

  function session() {
    try { return JSON.parse(localStorage.getItem('giahuy-session') || 'null'); }
    catch (_) { return null; }
  }

  function assignments(fallback) {
    try {
      if (global.Edu?.getAssignments) {
        const current = session();
        return global.Edu.getAssignments().map((a) => {
          const submission = current?.id && global.Edu.mySubmission ? global.Edu.mySubmission(a.id, current.id) : null;
          const submitted = !!submission;
          const status = submitted
            ? (submission.status === 'graded' ? 'Đã hoàn thành' : 'Đang làm')
            : (Number(a.due) < Date.now() ? 'Quá hạn' : 'Chưa làm');
          const progress = submitted ? 100 : 0;
          return {
            id: a.id,
            title: a.title,
            subject: a.subjectName || global.Edu.subjectOf(a.subject).name,
            subjectId: a.subject,
            deadline: global.Edu.fmtDate ? global.Edu.fmtDate(a.due) : new Date(a.due).toLocaleDateString('vi-VN'),
            status,
            progress,
            icon: global.Edu.subjectOf(a.subject).icon || 'cil-task',
            desc: a.desc || '',
            points: a.points || 0,
            due: a.due,
            submission
          };
        });
      }
    } catch (_) {}
    return Array.isArray(fallback) ? fallback.slice() : [];
  }

  function quizzes(fallback) {
    try {
      if (global.Edu?.getQuizzes) {
        return global.Edu.getQuizzes().map((q) => ({
          id: q.id,
          title: q.title,
          subject: global.Edu.subjectOf(q.subject).name,
          subjectId: q.subject,
          questions: q.questions?.length || 0,
          minutes: Number(q.timeLimit || 0),
          level: q.level || 'Theo chương trình',
          icon: global.Edu.subjectOf(q.subject).icon || 'cil-list-numbered',
          items: q.questions || []
        }));
      }
    } catch (_) {}
    return Array.isArray(fallback) ? fallback.slice() : [];
  }

  function flashcardDecks(fallback) {
    const base = Array.isArray(fallback) ? fallback.map((d) => ({ ...d, items: Array.isArray(d.items) ? d.items.slice() : [] })) : [];
    try {
      const extra = read(STORAGE.flashcardDecks, []);
      if (Array.isArray(extra)) base.push(...extra);
      if (global.Edu?.getFlashcards) {
        const all = global.Edu.getFlashcards();
        const knownIds = new Set(base.flatMap((d) => (d.items || []).map((i) => i.id).filter(Boolean)));
        const extraCards = all.filter((c) => !knownIds.has(c.id));
        if (extraCards.length) {
          base.push({
            id: 'user-flashcards',
            title: 'Thẻ đã tạo',
            subject: 'Kho cá nhân',
            cards: extraCards.length,
            progress: 0,
            icon: 'cil-layers',
            items: extraCards.map((c) => ({ id: c.id, front: c.front, back: c.back }))
          });
        }
      }
    } catch (_) {}
    return base;
  }

  function saveDeck(deck) {
    const decks = read(STORAGE.flashcardDecks, []);
    const idx = decks.findIndex((d) => d.id === deck.id);
    if (idx >= 0) decks[idx] = deck;
    else decks.unshift(deck);
    write(STORAGE.flashcardDecks, decks);
    return deck;
  }

  function profile(fallback) {
    return { ...fallback, ...read(STORAGE.profile, {}) };
  }

  function saveProfile(profileData) {
    return write(STORAGE.profile, profileData);
  }

  function quizHistory() { return read(STORAGE.quizHistory, []); }

  function recordQuizAttempt(attempt) {
    const history = quizHistory();
    history.push(attempt);
    write(STORAGE.quizHistory, history.slice(-100));
    try {
      const s = session();
      if (global.Edu?.saveQuizAttempt && s?.id) {
        global.Edu.saveQuizAttempt(attempt.id, s.id, s.username || '', attempt.answers || {}, attempt.score, attempt.total);
      }
    } catch (_) {}
  }

  global.GiaHuyContent = {
    assignments,
    quizzes,
    flashcardDecks,
    saveDeck,
    profile,
    saveProfile,
    quizHistory,
    recordQuizAttempt,
    session
  };
})(window);
