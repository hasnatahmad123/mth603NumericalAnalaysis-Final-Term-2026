/* ==========================================================================
   MTH603 Study Companion — behaviour
   Plain ES5-friendly JS. No build step, no dependencies.
   Works offline once the page is loaded.
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- Safe storage (falls back to memory if cookies/storage blocked) ---------- */
  var mem = {};
  var store = {
    get: function (k) {
      try { var v = localStorage.getItem(k); return v === null ? mem[k] : v; }
      catch (e) { return mem[k]; }
    },
    set: function (k, v) {
      mem[k] = v;
      try { localStorage.setItem(k, v); } catch (e) { /* private mode — memory only */ }
    }
  };

  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ======================================================================
     1. Theme (light / dark)
     ====================================================================== */
  var themeBtn = $('#themeBtn');
  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    if (themeBtn) themeBtn.textContent = t === 'dark' ? '☀' : '☾';
    store.set('mth603-theme', t);
  }
  var savedTheme = store.get('mth603-theme');
  if (!savedTheme) {
    savedTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  applyTheme(savedTheme);
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
  }

  /* ======================================================================
     2. Font size (Aa cycles S → M → L → XL)
     ====================================================================== */
  var sizes = ['s', 'm', 'l', 'xl'];
  var fsBtn = $('#fsBtn');
  function applyFs(s) {
    document.documentElement.setAttribute('data-fs', s);
    store.set('mth603-fs', s);
  }
  applyFs(store.get('mth603-fs') || 'm');
  if (fsBtn) {
    fsBtn.addEventListener('click', function () {
      var cur = document.documentElement.getAttribute('data-fs') || 'm';
      applyFs(sizes[(sizes.indexOf(cur) + 1) % sizes.length]);
    });
  }

  /* ======================================================================
     3. Sections — remember which are open, and which are marked done
     ====================================================================== */
  var sections = $$('.sec');

  // Restore open state
  var openState = {};
  try { openState = JSON.parse(store.get('mth603-open') || '{}'); } catch (e) { openState = {}; }
  sections.forEach(function (sec) {
    if (openState[sec.id]) sec.open = true;
    sec.addEventListener('toggle', function () {
      openState[sec.id] = sec.open;
      store.set('mth603-open', JSON.stringify(openState));
    });
  });

  // Done state
  var done = {};
  try { done = JSON.parse(store.get('mth603-done') || '{}'); } catch (e) { done = {}; }

  function renderDone() {
    sections.forEach(function (sec) {
      var btn = $('.doneBtn', sec);
      var isDone = !!done[sec.id];
      sec.setAttribute('data-done', isDone ? '1' : '0');
      if (btn) {
        btn.textContent = isDone ? '✓ Studied' : 'Mark studied';
        btn.className = 'btn ' + (isDone ? '' : 'btn--ghost') + ' doneBtn';
      }
      var pill = $('.pill--done', sec);
      if (pill) pill.style.display = isDone ? 'inline-flex' : 'none';
    });
    updateProgress();
    renderToc();
  }

  function updateProgress() {
    var total = sections.length;
    var n = sections.filter(function (s) { return done[s.id]; }).length;
    var pct = total ? Math.round((n / total) * 100) : 0;
    var fill = $('#progressFill'), label = $('#progressLabel');
    if (fill) fill.style.width = pct + '%';
    if (label) label.textContent = n + '/' + total + ' · ' + pct + '%';
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('.doneBtn') : null;
    if (!btn) return;
    var sec = btn.closest('.sec');
    if (!sec) return;
    done[sec.id] = !done[sec.id];
    store.set('mth603-done', JSON.stringify(done));
    renderDone();
  });

  /* ======================================================================
     4. Contents drawer
     ====================================================================== */
  var drawer = $('#drawer');
  function openDrawer()  { if (drawer) { drawer.classList.add('open'); document.body.style.overflow = 'hidden'; } }
  function closeDrawer() { if (drawer) { drawer.classList.remove('open'); document.body.style.overflow = ''; } }

  var tocBtn = $('#tocBtn');
  if (tocBtn) tocBtn.addEventListener('click', openDrawer);
  if (drawer) {
    $('.drawer__scrim', drawer).addEventListener('click', closeDrawer);
    var dClose = $('#drawerClose');
    if (dClose) dClose.addEventListener('click', closeDrawer);
    drawer.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('.toc a')) closeDrawer();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeDrawer();
  });

  function renderToc() {
    var list = $('#tocList');
    if (!list) return;
    list.innerHTML = sections.map(function (sec) {
      var title = $('.sec__title', sec);
      var num   = $('.sec__num', sec);
      var mark  = done[sec.id] ? '<span class="dot" style="color:var(--grow)">●</span>' : '';
      return '<li><a href="#' + sec.id + '">' +
             '<span class="n">' + (num ? num.textContent : '') + '</span>' +
             '<span>' + (title ? title.textContent : sec.id) + '</span>' +
             mark + '</a></li>';
    }).join('');
  }

  // Opening a section when jumped to from the contents
  window.addEventListener('hashchange', openTarget);
  function openTarget() {
    var id = location.hash.replace('#', '');
    if (!id) return;
    var sec = document.getElementById(id);
    if (sec && sec.tagName === 'DETAILS') sec.open = true;
  }
  openTarget();

  /* ======================================================================
     5. Search — filters sections by their text content
     ====================================================================== */
  var searchInput = $('#searchInput');
  if (searchInput) {
    // Cache lowercase text of each section once
    sections.forEach(function (sec) { sec._text = sec.textContent.toLowerCase(); });

    var timer = null;
    searchInput.addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        var q = searchInput.value.trim().toLowerCase();
        var noRes = $('.noresults');
        if (!q) {
          document.body.classList.remove('searching');
          sections.forEach(function (s) { s.classList.remove('match'); });
          if (noRes) noRes.classList.remove('show');
          return;
        }
        document.body.classList.add('searching');
        var hits = 0;
        sections.forEach(function (sec) {
          var hit = sec._text.indexOf(q) !== -1;
          sec.classList.toggle('match', hit);
          if (hit) { sec.open = true; hits++; }
        });
        if (noRes) noRes.classList.toggle('show', hits === 0);
      }, 180);
    });
  }

  /* ======================================================================
     6. Step-by-step worked examples
     ====================================================================== */
  $$('.steps').forEach(function (block) {
    var items = $$('.steps__list li', block);
    var nextBtn = $('.steps__next', block);
    var allBtn  = $('.steps__all', block);
    var counter = $('.steps__count', block);
    var i = 0;

    function refresh() {
      items.forEach(function (li, idx) { li.classList.toggle('shown', idx < i); });
      if (counter) counter.textContent = 'Step ' + Math.min(i, items.length) + ' of ' + items.length;
      block.classList.toggle('done', i >= items.length);
      if (nextBtn) nextBtn.textContent = i === 0 ? 'Show first step' : 'Next step';
    }

    if (nextBtn) nextBtn.addEventListener('click', function () {
      if (i < items.length) { i++; refresh(); }
      if (i > 0 && items[i - 1]) {
        items[i - 1].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    });

    if (allBtn) allBtn.addEventListener('click', function () {
      if (i >= items.length) { i = 0; allBtn.textContent = 'Show all steps'; }
      else { i = items.length; allBtn.textContent = 'Hide steps'; }
      refresh();
    });

    refresh();
  });

  /* ======================================================================
     7. Quiz questions — tap an option, get instant feedback
     ====================================================================== */
  document.addEventListener('click', function (e) {
    var opt = e.target.closest ? e.target.closest('.q__opt') : null;
    if (!opt || opt.disabled) return;

    var q = opt.closest('.q');
    var opts = $$('.q__opt', q);
    var chosen = opt.getAttribute('data-correct') === '1';

    opts.forEach(function (o) {
      o.disabled = true;
      if (o.getAttribute('data-correct') === '1') o.classList.add('correct');
    });
    if (!chosen) opt.classList.add('wrong');

    var why = $('.q__why', q);
    if (why) why.classList.add('shown');
  });

  /* ======================================================================
     8. Back to top
     ====================================================================== */
  var toTop = $('#toTop');
  if (toTop) {
    window.addEventListener('scroll', function () {
      toTop.classList.toggle('show', window.scrollY > 700);
    }, { passive: true });
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ======================================================================
     9. Expand / collapse everything
     ====================================================================== */
  var expandBtn = $('#expandBtn');
  if (expandBtn) {
    expandBtn.addEventListener('click', function () {
      var anyClosed = sections.some(function (s) { return !s.open; });
      sections.forEach(function (s) { s.open = anyClosed; });
      expandBtn.textContent = anyClosed ? 'Collapse all' : 'Expand all';
    });
  }

  /* ---------- Init ---------- */
  renderDone();
})();
