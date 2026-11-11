// School Finder — AI helper for choosing a school (spec: SCHOOL-FINDER-SPEC.md).
// Loaded on every page by nav.js. On the listing it drives the list and the map
// through window.srFinderHooks (defined in international-private-schools-portugal.html);
// on other pages the floating button opens the listing with ?finder=open.
(function () {
  if (window.__srFinder) return;
  window.__srFinder = true;

  var LISTING = '/international-private-schools-portugal.html';
  var API = '/api/finder';
  var SHOWN_KEY = 'sr_finder_sheet_shown';   // sessionStorage: the sheet pops up once per visit
  var EXAMPLES = [
    "My daughter is 7, we're looking for an IB school near Cascais, budget up to €15k",
    'Two kids, 5 and 11, moving to Lisbon next September, English-speaking school',
    'Is there a Montessori school in the Algarve?',
    "What's the difference between IB and Cambridge?"
  ];
  var GUIDE_HELP = {
    language: { text: 'Most international schools teach in English; bilingual schools add a strong Portuguese track, and national schools (French, German, Spanish…) follow their own country\'s system.', href: '/school-year-grade-by-age-guide.html', label: 'School grades by age' },
    curriculum: { text: 'Both are recognised by universities worldwide. IB is one programme with coursework, an Extended Essay and Theory of Knowledge — it builds analytical thinking and independence. Cambridge (IGCSE, then A Levels) is mainly exam-based and lets students specialise in fewer subjects — often a good fit for UK universities. Many Cambridge schools in Portugal also offer the IB Diploma in the last two years.', href: '/ib-vs-cambridge-which-is-better.html', label: 'IB vs Cambridge' }
  };
  var QUESTIONS = [
    { id: 'children', text: 'How many children, and how old are they?', type: 'text', placeholder: 'e.g. two kids, 5 and 11' },
    { id: 'start', text: 'When would they start?', options: ['This school year', 'Next September', 'Later', 'Not sure'] },
    { id: 'area', text: 'Where do you live, or plan to live?', options: ['Lisbon city', 'Cascais / Estoril', 'Oeiras', 'Sintra', 'Porto', 'Algarve', 'Madeira', 'Other', 'Not decided'] },
    { id: 'lisbon', text: 'Only Lisbon city, or also nearby areas?', options: ['Lisbon city only', 'Include nearby areas', 'Not sure'],
      when: function (a) { return a.area === 'Lisbon city'; },
      note: 'Many international schools are in Oeiras, Cascais and Sintra — about 20–30 minutes by car from the centre.' },
    { id: 'budget', text: "What's your yearly budget per child?", options: ['Up to €10k', '€10–15k', '€15–20k', '€20k+', 'Not sure yet', "Budget isn't a deciding factor"] },
    { id: 'language', text: 'Which language should lessons be taught in?', multi: true, help: 'language', options: ['English', 'Portuguese', 'Bilingual EN + PT', 'French', 'German', 'Spanish', 'Dutch', 'No preference'] },
    { id: 'curriculum', text: 'Do you have a curriculum in mind?', help: 'curriculum', options: ['IB', 'British / Cambridge', 'American', 'National (country) curriculum', 'Montessori / alternative', 'Not sure — explain'] },
    { id: 'ib', text: 'Full IB from the early years to graduation, or just the IB Diploma in the last two years?', options: ['Full IB (all years)', 'IB Diploma only', 'Not sure'],
      when: function (a) { return a.curriculum === 'IB'; },
      note: 'Full IB = PYP, MYP and Diploma in one school. The IB Diploma is the last two years only (ages 16–18).',
      link: { href: '/ib-diploma-explained.html', label: 'Not sure of the difference? Read our IB guide →' } },
    { id: 'portuguese', text: 'How important is Portuguese language?', options: ['Very — we want strong Portuguese', 'Some is fine', 'Not important'] },
    { id: 'journey', text: 'Are you choosing a school for the whole journey to graduation, or for the next few years?', options: ['All the way to graduation', 'For the next few years', 'Not sure'] },
    { id: 'exams', text: 'Do exam results and the path to university matter to you?', options: ['Yes, a lot', 'Somewhat', 'Not a priority'],
      when: function (a) { return a.journey === 'All the way to graduation' || maxAge(a.children) >= 11; } },
    { id: 'atmosphere', text: 'What kind of atmosphere appeals to you?', multi: true, options: ['Nature / outdoor learning', 'Animals', 'Forest school', 'Montessori', 'No preference'],
      when: function (a) { return a.journey === 'For the next few years'; },
      note: 'Some schools only go up to age 10–12, or have a separate campus for younger children — that is a normal option for the next few years.' },
    { id: 'class', text: 'Does class size matter to you?', options: ['Small classes are important', 'Not a priority'] },
    { id: 'religion', text: 'Religious ethos?', options: ['Must be secular', 'A religious school is fine', 'Looking for a specific one (Catholic, Christian…)'] },
    { id: 'extra', text: "Anything else you'd like to add? Just type it in your own words.", type: 'text', optional: true, placeholder: 'Optional' }
  ];

  var onListing = location.pathname === LISTING;
  var conv = [];            // [{role, content}]
  var criteria = {};
  var chips = [];
  var lastPicks = [];
  var answers = {};
  var qIndex = 0;
  var busy = false;
  var panel, sheet, fab;

  // ── helpers ──────────────────────────────────────────────────────────────
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function linkify(s) {
    return esc(s).replace(/https:\/\/schools\.reviews(\/[\w\-./#?=&;%]*)?/g, function (u, path) {
      return '<a href="' + (path || '/') + '">' + (path || 'schools.reviews') + '</a>';
    });
  }
  function maxAge(text) { var m = String(text || '').match(/\d+/g); return m ? Math.max.apply(null, m.map(Number)) : 0; }
  function ssGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function ssSet(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  function track(name, params) { try { if (window.gtag) window.gtag('event', name, params || {}); } catch (e) {} }
  function schoolCount() {
    var h = window.srFinderHooks;
    return h && h.count ? h.count() : 57;
  }
  function isMobile() { return window.innerWidth <= 768; }

  // ── styles ───────────────────────────────────────────────────────────────
  var CSS =
    '.srf *{box-sizing:border-box}' +
    '.srf{font-family:"DM Sans",sans-serif;color:#1a1814}' +
    '.srf-btn{min-height:44px;border:none;border-radius:10px;background:#B5552E;color:#fff;font:600 14px "DM Sans",sans-serif;padding:0 18px;cursor:pointer;white-space:nowrap}' +
    '.srf-btn:hover{background:#9E4A28}.srf-btn[disabled]{opacity:.5;cursor:default}' +
    '.srf-ghost{min-height:44px;border:1.5px solid #e8e3de;border-radius:10px;background:#fff;color:#1a1814;font:600 13px "DM Sans",sans-serif;padding:0 14px;cursor:pointer}' +
    '.srf-link{background:none;border:none;color:#9E4A28;font:600 13px "DM Sans",sans-serif;cursor:pointer;padding:10px 0;min-height:44px;text-align:left}' +
    '.srf-label{font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#9E4A28}' +
    '.srf-title{font-family:"Cormorant Garamond",serif;font-size:26px;font-weight:600;line-height:1.15;margin:6px 0 6px}' +
    '.srf-sub{font-size:14px;color:#555;line-height:1.55;margin:0 0 12px}' +
    '.srf-row{display:flex;gap:8px;align-items:stretch}' +
    '.srf-input{flex:1;min-width:0;min-height:44px;border:1.5px solid #e8e3de;border-radius:10px;padding:10px 12px;font:14px "DM Sans",sans-serif;background:#FAF8F5;color:#1a1814;outline:none;resize:none}' +
    '.srf-input:focus{border-color:#1a1814;background:#fff}' +
    '.srf-mic{width:44px;min-height:44px;flex:none;border:1.5px solid #e8e3de;border-radius:10px;background:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#1a1814}' +
    '.srf-mic.on{background:#B5552E;border-color:#B5552E;color:#fff;animation:srfPulse 1.2s infinite}' +
    '@keyframes srfPulse{0%,100%{box-shadow:0 0 0 0 rgba(181,85,46,.45)}50%{box-shadow:0 0 0 8px rgba(181,85,46,0)}}' +
    '.srf-trust{list-style:none;margin:12px 0 0;padding:0;font-size:12px;color:#555;line-height:1.5}' +
    '.srf-trust li{padding:2px 0 2px 20px;position:relative}.srf-trust li:before{content:"✓";position:absolute;left:0;color:#2E7D32;font-weight:700}' +
    '.srf-listening{font-size:12px;color:#9E4A28;margin-top:6px;display:none}.srf-listening.on{display:block}' +
    // floating button
    '#srf-fab{position:fixed;right:16px;bottom:16px;z-index:1600;display:flex;align-items:center;gap:8px;min-height:48px;padding:0 18px 0 14px;border:none;border-radius:30px;background:#1a1814;color:#fff;font:600 14px "DM Sans",sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.25);cursor:pointer;transition:bottom .2s}' +
    '#srf-fab:hover{background:#2d2a26}#srf-fab.raised{bottom:76px}#srf-fab.hidden{display:none}' +
    // bottom sheet (not a modal: the page stays visible and scrollable)
    '#srf-sheet{position:fixed;left:50%;bottom:0;transform:translate(-50%,110%);width:min(560px,100%);z-index:1700;background:#fff;border:1px solid #e8e3de;border-bottom:none;border-radius:18px 18px 0 0;box-shadow:0 -10px 40px rgba(0,0,0,.15);padding:18px 18px 16px;transition:transform .35s ease}' +
    '#srf-sheet.open{transform:translate(-50%,0)}' +
    '.srf-x{position:absolute;top:8px;right:8px;width:44px;height:44px;border:none;background:none;font-size:20px;color:#888;cursor:pointer}' +
    // top entry on the listing
    '.srf-hero{margin-top:16px;max-width:520px}' +
    '.srf-hero-sub{font-size:14px;color:#4A433D;line-height:1.5;margin:0 0 10px}' +
    '.srf-hero .srf-link{padding:8px 0 0;min-height:0}' +
    '.srf-hero-trust{font-size:12px;color:#2E7D32;margin-top:8px}' +
    '.srf-top{background:#FAF8F5;padding:24px 40px;border-bottom:1px solid #e8e3de}' +
    '.srf-top-card{background:#1a1814;border-radius:18px;padding:24px 28px;box-shadow:0 12px 40px rgba(26,24,20,.18)}' +
    '.srf-top .srf-label{color:#E8A47F}' +
    '.srf-top-title{font-family:"Cormorant Garamond",serif;font-size:32px;font-weight:600;line-height:1.15;color:#fff;margin:6px 0 6px}' +
    '.srf-top-title em{color:#E8A47F}' +
    '.srf-top-sub{font-size:14px;color:rgba(255,255,255,.7);margin:0 0 14px;line-height:1.5}' +
    '.srf-top .srf-input{background:#fff;border-color:#fff;font-size:15px}' +
    '.srf-top .srf-mic{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.3);color:#fff}' +
    '.srf-top .srf-mic.on{background:#B5552E;border-color:#B5552E}' +
    '.srf-top .srf-link{color:#E8A47F}.srf-top .srf-listening{color:#E8A47F}' +
    // panel
    '#srf-panel{position:fixed;top:0;right:0;bottom:0;width:420px;max-width:100%;z-index:2500;background:#FAF8F5;border-left:1px solid #e8e3de;box-shadow:-12px 0 40px rgba(0,0,0,.12);display:none;flex-direction:column}' +
    '#srf-panel.open{display:flex}' +
    '.srf-head{display:flex;align-items:center;justify-content:space-between;padding:10px 8px 10px 18px;background:#fff;border-bottom:1px solid #e8e3de}' +
    '.srf-indep{font-size:11px;color:#2E7D32;background:#EAF3DE;padding:7px 18px;line-height:1.4}' +
    '.srf-body{flex:1;overflow-y:auto;padding:16px 18px;-webkit-overflow-scrolling:touch}' +
    '.srf-foot{padding:12px 18px calc(12px + env(safe-area-inset-bottom));background:#fff;border-top:1px solid #e8e3de}' +
    '.srf-chips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px}' +
    '.srf-chip{background:#F5EDE8;color:#8B3A1F;border-radius:20px;padding:5px 11px;font-size:12px;font-weight:600}' +
    '.srf-msg{margin:0 0 12px;font-size:14px;line-height:1.55}' +
    '.srf-msg.u{margin-left:40px;background:#1a1814;color:#fff;border-radius:14px 14px 4px 14px;padding:10px 13px}' +
    '.srf-msg.a{background:#fff;border:1px solid #e8e3de;border-radius:14px 14px 14px 4px;padding:10px 13px}' +
    '.srf-msg.a a{color:#9E4A28}' +
    '.srf-opts{display:flex;flex-wrap:wrap;gap:8px;margin:4px 0 14px}' +
    '.srf-opt{min-height:44px;border:1.5px solid #e8e3de;border-radius:22px;background:#fff;padding:0 15px;font:500 13px "DM Sans",sans-serif;color:#1a1814;cursor:pointer;text-align:left}' +
    '.srf-opt:hover{border-color:#1a1814}.srf-opt.sel{background:#1a1814;border-color:#1a1814;color:#fff}' +
    '.srf-picks-cta{display:block;width:100%;margin:2px 0 14px}' +
    '.srf-progress{height:4px;background:#e8e3de;border-radius:4px;overflow:hidden;margin:6px 0 4px}.srf-progress i{display:block;height:100%;background:#B5552E}' +
    '.srf-qnum{font-size:12px;color:#888}' +
    '.srf-q{font-family:"Cormorant Garamond",serif;font-size:24px;font-weight:600;line-height:1.2;margin:10px 0 14px}' +
    '.srf-help{background:#fff;border:1px solid #e8e3de;border-radius:12px;padding:10px 12px;font-size:13px;color:#555;line-height:1.5;margin:0 0 12px}' +
    '.srf-help a{color:#9E4A28;font-weight:600}' +
    '.srf-nav{display:flex;justify-content:space-between;gap:8px;align-items:center}' +
    '.srf-typing{display:inline-flex;gap:4px;padding:12px 14px;background:#fff;border:1px solid #e8e3de;border-radius:14px;margin-bottom:12px}' +
    '.srf-typing i{width:6px;height:6px;border-radius:50%;background:#bbb;animation:srfDot 1s infinite}.srf-typing i:nth-child(2){animation-delay:.15s}.srf-typing i:nth-child(3){animation-delay:.3s}' +
    '@keyframes srfDot{0%,100%{opacity:.3}50%{opacity:1}}' +
    '@media(max-width:768px){#srf-panel{width:100%;border-left:none}.srf-hero .srf-row{flex-wrap:wrap}.srf-hero .srf-input{flex:1 1 100%}.srf-hero .srf-btn{flex:1}.srf-top{padding:16px}.srf-top-card{padding:18px 16px}.srf-top-title{font-size:26px}.srf-top .srf-row{flex-wrap:wrap}.srf-top .srf-input{flex:1 1 100%}.srf-top .srf-btn{flex:1}#srf-fab{right:12px;bottom:12px}#srf-fab.raised{bottom:72px}}';

  var MIC_SVG = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v5"/></svg>';

  // ── voice input ─────────────────────────────────────────────────────────
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  function micButton(input, status) {
    if (!SR) return '';
    return '<button type="button" class="srf-mic" aria-label="Speak" data-mic="' + input + '" data-status="' + (status || '') + '">' + MIC_SVG + '</button>';
  }
  var rec = null;
  function toggleMic(btn) {
    var input = document.getElementById(btn.dataset.mic);
    var status = btn.dataset.status && document.getElementById(btn.dataset.status);
    if (rec) { rec.stop(); return; }
    rec = new SR();
    rec.lang = navigator.language || 'en-GB';
    rec.interimResults = true;
    rec.continuous = false;
    var base = input.value ? input.value.replace(/\s*$/, ' ') : '';
    rec.onresult = function (e) {
      var t = '';
      for (var i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
      input.value = base + t;
    };
    var failed = false;
    rec.onend = function () {
      rec = null; btn.classList.remove('on');
      if (status && !failed) status.classList.remove('on');
      input.focus();
    };
    rec.onerror = function (e) {
      failed = true;
      var msg = {
        'not-allowed': 'Microphone access is blocked — allow it in your browser (the icon in the address bar) and try again.',
        'service-not-allowed': 'Voice input is turned off in this browser — please type instead.',
        'audio-capture': 'No microphone found — please type instead.',
        'no-speech': "Didn't catch that — tap the microphone and speak again.",
        'network': 'Voice input needs an internet connection — please try again or type.'
      }[e.error] || 'Voice input did not work here — please type instead.';
      if (status) { status.textContent = msg; status.classList.add('on'); }
      track('finder_voice_error', { error: e.error });
    };
    btn.classList.add('on');
    if (status) { status.textContent = 'Listening… speak now'; status.classList.add('on'); }
    track('finder_voice');
    try { rec.start(); } catch (e) { rec.onend(); }
  }

  // rotating example in every finder input
  var exIdx = 0;
  setInterval(function () {
    exIdx = (exIdx + 1) % EXAMPLES.length;
    document.querySelectorAll('.srf-rot').forEach(function (el) { if (!el.value) el.placeholder = EXAMPLES[exIdx]; });
  }, 3500);

  function entryHTML(prefix) {
    return '<div class="srf-row">' +
      '<input id="' + prefix + '-in" class="srf-input srf-rot" type="text" placeholder="' + esc(EXAMPLES[0]) + '" aria-label="Tell us what matters to your family" enterkeyhint="search">' +
      micButton(prefix + '-in', prefix + '-ls') +
      '<button type="button" class="srf-btn" data-go="' + prefix + '-in">Find schools</button></div>' +
      '<div class="srf-listening" id="' + prefix + '-ls">Listening… speak now</div>';
  }
  function trustLine() {
    return 'Searches only our own directory of ' + schoolCount() + ' schools · No school pays to appear';
  }
  function trustHTML() {
    return '<ul class="srf-trust">' +
      '<li>Every international school in Portugal — ' + schoolCount() + ' schools</li>' +
      "<li>Fees, programmes and ages from each school's published information — verified where marked ✓</li>" +
      '<li>No school pays to appear in results</li></ul>';
  }

  // ── panel ────────────────────────────────────────────────────────────────
  function buildPanel() {
    panel = document.createElement('div');
    panel.id = 'srf-panel';
    panel.className = 'srf';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'School Finder');
    panel.innerHTML =
      '<div class="srf-head"><span class="srf-label">School Finder</span>' +
      '<button type="button" class="srf-x" style="position:static" aria-label="Close" data-close>✕</button></div>' +
      '<div class="srf-indep">✓ ' + esc(trustLine()) + '</div>' +
      '<div class="srf-body" id="srf-body"></div>' +
      '<div class="srf-foot" id="srf-foot"></div>';
    document.body.appendChild(panel);
  }

  function openPanel(firstText) {
    if (!onListing) { location.href = LISTING + '?finder=open' + (firstText ? '&q=' + encodeURIComponent(firstText) : ''); return; }
    if (!panel) buildPanel();
    closeSheet(false);
    panel.classList.add('open');
    if (fab) fab.classList.add('hidden');
    track('finder_open');
    if (firstText) { startChat(); send(firstText); }
    else if (!conv.length) renderIntro();
    else renderChat();
  }
  function closePanel() {
    if (panel) panel.classList.remove('open');
    if (fab) fab.classList.remove('hidden');
    if (rec) rec.stop();
  }

  function renderIntro() {
    document.getElementById('srf-body').innerHTML =
      '<div class="srf-title">Not sure where to start?</div>' +
      "<p class=\"srf-sub\">Tell us what matters to your family — by voice or text. We'll show matching schools on the map.</p>" +
      entryHTML('srf-p') +
      '<button type="button" class="srf-link" data-guided>Or answer a few quick questions →</button>' +
      trustHTML();
    document.getElementById('srf-foot').innerHTML = '';
    document.getElementById('srf-foot').style.display = 'none';
  }

  function startChat() {
    document.getElementById('srf-foot').style.display = '';
    document.getElementById('srf-foot').innerHTML = entryHTML('srf-c').replace('>Find schools<', '>Send<');
  }

  function renderChat(pending) {
    var body = document.getElementById('srf-body');
    var h = '';
    if (chips.length) h += '<div class="srf-chips">' + chips.map(function (c) { return '<span class="srf-chip">' + esc(c) + '</span>'; }).join('') + '</div>';
    conv.forEach(function (m, i) {
      h += '<div class="srf-msg ' + (m.role === 'user' ? 'u' : 'a') + '">' + (m.role === 'user' ? esc(m.content) : linkify(m.content)) + '</div>';
      if (i === conv.length - 1 && m.role === 'assistant') {
        if (lastPicks.length) {
          h += '<button type="button" class="srf-btn srf-picks-cta" data-showpicks>Show ' + lastPicks.length + ' school' + (lastPicks.length > 1 ? 's' : '') + ' on the map →</button>';
        }
        if (m.q && m.q.options && m.q.options.length) {
          h += '<div class="srf-opts">' + m.q.options.map(function (o) { return '<button type="button" class="srf-opt" data-ans="' + esc(o) + '">' + esc(o) + '</button>'; }).join('') + '</div>';
        }
      }
    });
    if (pending) h += '<div class="srf-typing" aria-label="Thinking"><i></i><i></i><i></i></div>';
    body.innerHTML = h;
    body.scrollTop = body.scrollHeight;
  }

  function send(text) {
    text = String(text || '').trim();
    if (!text || busy) return;
    busy = true;
    conv.push({ role: 'user', content: text });
    if (!document.getElementById('srf-c-in')) startChat();
    renderChat(true);
    track('finder_query');
    fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: conv.slice(-10).map(function (m) { return { role: m.role, content: m.content }; }), criteria: criteria })
    }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        busy = false;
        if (!res.ok || res.j.error) {
          conv.push({ role: 'assistant', content: (res.j && res.j.error) || 'Something went wrong — please try again.' });
          renderChat();
          return;
        }
        var o = res.j;
        criteria = o.criteria || criteria;
        if (o.understood && o.understood.length) chips = o.understood;
        conv.push({ role: 'assistant', content: o.reply || '', q: o.next_question });
        if (o.picks && o.picks.length) {
          lastPicks = o.picks;
          if (window.srFinderHooks) {
            window.srFinderHooks.applyPicks(o.picks, chips);
            if (!isMobile()) window.srFinderHooks.showResults();  // the panel sits beside the list on desktop
          }
        }
        renderChat();
      })
      .catch(function () {
        busy = false;
        conv.push({ role: 'assistant', content: 'The assistant is unavailable right now — please use the filters.' });
        renderChat();
      });
  }

  // ── step-by-step questions ───────────────────────────────────────────────
  function activeQuestions() { return QUESTIONS.filter(function (q) { return !q.when || q.when(answers); }); }

  function renderGuided() {
    var qs = activeQuestions();
    if (qIndex >= qs.length) return finishGuided();
    var q = qs[qIndex];
    var body = document.getElementById('srf-body');
    var given = Object.keys(answers).filter(function (k) { return answers[k]; }).map(function (k) { return answers[k]; });
    var h = '';
    if (given.length) h += '<div class="srf-chips">' + given.map(function (c) { return '<span class="srf-chip">' + esc(c) + '</span>'; }).join('') + '</div>';
    h += '<div class="srf-qnum">Question ' + (qIndex + 1) + ' of ' + qs.length + '</div>' +
      '<div class="srf-progress"><i style="width:' + Math.round(100 * qIndex / qs.length) + '%"></i></div>' +
      '<div class="srf-q">' + esc(q.text) + '</div>';
    if (q.note) h += '<div class="srf-help">' + esc(q.note) + (q.link ? '<br><a href="' + q.link.href + '" target="_blank">' + esc(q.link.label) + '</a>' : '') + '</div>';
    if (q.type === 'text') {
      h += '<div class="srf-row"><input id="srf-g-in" class="srf-input" type="text" placeholder="' + esc(q.placeholder || '') + '" value="' + esc(answers[q.id] || '') + '">' +
        micButton('srf-g-in', 'srf-g-ls') + '</div><div class="srf-listening" id="srf-g-ls">Listening… speak now</div>';
    } else {
      var cur = (answers[q.id] || '').split(', ');
      h += '<div class="srf-opts">' + q.options.map(function (o) {
        return '<button type="button" class="srf-opt' + (cur.indexOf(o) > -1 ? ' sel' : '') + '" data-gopt="' + esc(o) + '">' + esc(o) + '</button>';
      }).join('') + '</div>';
      if (q.help) {
        var g = GUIDE_HELP[q.help];
        h += '<details class="srf-help"' + (/^Not sure/.test(answers[q.id] || '') ? ' open' : '') + '><summary style="cursor:pointer;font-weight:600;color:#9E4A28">Not sure?</summary><p style="margin:6px 0 4px">' + esc(g.text) +
          '</p><a href="' + g.href + '" target="_blank">More in our guide: ' + esc(g.label) + ' →</a></details>';
      }
    }
    body.innerHTML = h;
    var foot = document.getElementById('srf-foot');
    foot.style.display = '';
    foot.innerHTML = '<div class="srf-nav"><button type="button" class="srf-ghost" data-back' + (qIndex ? '' : ' disabled style="opacity:.4"') + '>← Back</button>' +
      '<button type="button" class="srf-link" data-skipall>Skip and show schools now</button>' +
      '<button type="button" class="srf-btn" data-next>' + (q.optional ? 'Skip / Next' : 'Next') + ' →</button></div>';
  }

  function saveGuidedText() {
    var qs = activeQuestions(), q = qs[qIndex], el = document.getElementById('srf-g-in');
    if (q && q.type === 'text' && el) answers[q.id] = el.value.trim();
  }

  function finishGuided() {
    var lines = activeQuestions().filter(function (q) { return answers[q.id]; }).map(function (q) { return q.text + ' ' + answers[q.id]; });
    track('finder_guided_done', { answered: lines.length });
    conv = [];
    chips = [];
    startChat();
    send(lines.length ? "Here's what we're looking for:\n" + lines.join('\n') : 'Show me international schools in Portugal.');
  }

  // ── bottom sheet + floating button + top entry ───────────────────────────
  function buildSheet() {
    sheet = document.createElement('div');
    sheet.id = 'srf-sheet';
    sheet.className = 'srf';
    sheet.setAttribute('role', 'complementary');
    sheet.setAttribute('aria-label', 'School Finder');
    sheet.innerHTML = '<button type="button" class="srf-x" aria-label="Close" data-sheetclose>✕</button>' +
      '<div class="srf-label">School Finder</div><div class="srf-title">Not sure where to start?</div>' +
      "<p class=\"srf-sub\">Tell us what matters to your family — by voice or text. We'll show matching schools on the map.</p>" +
      entryHTML('srf-s') +
      '<button type="button" class="srf-link" data-guided>Or answer a few quick questions →</button>' + trustHTML();
    document.body.appendChild(sheet);
  }
  function maybeShowSheet() {
    if (ssGet(SHOWN_KEY)) return;
    var shown = false;
    function show() {
      if (shown || (panel && panel.classList.contains('open'))) return;
      shown = true;
      ssSet(SHOWN_KEY, '1');
      window.removeEventListener('scroll', onScroll);
      if (!sheet) buildSheet();
      requestAnimationFrame(function () { sheet.classList.add('open'); });
      track('finder_sheet_shown');
    }
    function onScroll() {
      var max = document.documentElement.scrollHeight - innerHeight;
      if (max > 0 && scrollY / max >= 0.4) show();
    }
    setTimeout(show, 8000);
    window.addEventListener('scroll', onScroll, { passive: true });
  }
  function closeSheet(remember) {
    if (!sheet) return;
    sheet.classList.remove('open');
  }

  function buildFab() {
    fab = document.createElement('button');
    fab.id = 'srf-fab';
    fab.type = 'button';
    fab.className = 'srf';
    fab.innerHTML = MIC_SVG + '<span>Find a school</span>';
    fab.addEventListener('click', function () { openPanel(); });
    document.body.appendChild(fab);
    // keep clear of the Compare bar on the listing
    setInterval(function () {
      var bar = document.getElementById('compareBar');
      var up = bar && getComputedStyle(bar).display !== 'none';
      fab.classList.toggle('raised', !!up);
    }, 800);
  }

  var VARIANT = new URLSearchParams(location.search).get('fv') || 'card';  // temporary: design review

  function buildHeroEntry() {
    var head = document.querySelector('.hero-head');
    if (!head) return;
    var box = document.createElement('div');
    box.className = 'srf srf-hero';
    box.innerHTML = '<p class="srf-hero-sub">Tell us what matters to your family — by voice or text — and we\'ll find matching schools.</p>' +
      entryHTML('srf-h') +
      '<button type="button" class="srf-link" data-guided>Or answer a few quick questions →</button>' +
      '<div class="srf-hero-trust">✓ ' + esc(trustLine()) + '</div>';
    head.appendChild(box);
  }

  function buildTopEntry() {
    var anchor = document.querySelector('.video-reviews-section') || document.querySelector('.search-bar-top');
    if (!anchor) return;
    var box = document.createElement('div');
    box.className = 'srf srf-top';
    box.innerHTML = '<div class="srf-top-card"><div class="srf-label">School Finder · new</div>' +
      '<div class="srf-top-title">Not sure where to start? <em>Ask our School Finder.</em></div>' +
      "<p class=\"srf-top-sub\">Tell us what matters to your family — by voice or text. We'll show matching schools on the map.</p>" +
      entryHTML('srf-t') +
      '<button type="button" class="srf-link" data-guided>Or answer a few quick questions →</button></div>';
    anchor.parentNode.insertBefore(box, anchor);
  }

  // ── events (one delegated listener) ─────────────────────────────────────
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-go],[data-guided],[data-close],[data-sheetclose],[data-ans],[data-gopt],[data-next],[data-back],[data-skipall],[data-showpicks],.srf-mic');
    if (!t) return;
    if (t.classList.contains('srf-mic')) return toggleMic(t);
    if (t.hasAttribute('data-go')) {
      var inp = document.getElementById(t.dataset.go);
      var v = inp && inp.value.trim();
      if (!v) { inp && inp.focus(); return; }
      if (inp) inp.value = '';
      if (!panel || !panel.classList.contains('open')) {
        if (!onListing) return openPanel(v);
        openPanel();
        startChat();
      }
      return send(v);
    }
    if (t.hasAttribute('data-guided')) {
      if (!onListing) { location.href = LISTING + '?finder=guided'; return; }
      openPanel();
      answers = {}; qIndex = 0;
      track('finder_guided_start');
      return renderGuided();
    }
    if (t.hasAttribute('data-close')) return closePanel();
    if (t.hasAttribute('data-sheetclose')) return closeSheet(true);
    if (t.hasAttribute('data-ans')) return send(t.dataset.ans);
    if (t.hasAttribute('data-gopt')) {
      var q = activeQuestions()[qIndex], o = t.dataset.gopt;
      if (q.multi) {
        var cur = answers[q.id] ? answers[q.id].split(', ') : [];
        var i = cur.indexOf(o);
        if (i > -1) cur.splice(i, 1); else cur.push(o);
        answers[q.id] = cur.join(', ');
        return renderGuided();
      }
      answers[q.id] = o;
      if (o === 'Not sure — explain') return renderGuided();  // keep the "Not sure?" note on screen
      qIndex++;
      return renderGuided();
    }
    if (t.hasAttribute('data-next')) { saveGuidedText(); qIndex++; return renderGuided(); }
    if (t.hasAttribute('data-back')) { saveGuidedText(); if (qIndex) qIndex--; return renderGuided(); }
    if (t.hasAttribute('data-skipall')) { saveGuidedText(); return finishGuided(); }
    if (t.hasAttribute('data-showpicks')) {
      if (isMobile()) closePanel();
      if (window.srFinderHooks) window.srFinderHooks.showResults();
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && panel && panel.classList.contains('open')) return closePanel();
    if (e.key !== 'Enter' || !e.target.classList || !e.target.classList.contains('srf-input')) return;
    e.preventDefault();
    if (e.target.id === 'srf-g-in') { saveGuidedText(); qIndex++; return renderGuided(); }
    var btn = e.target.parentNode.querySelector('[data-go]');
    if (btn) btn.click();
  });

  // public: the listing's "Ask a follow-up" link
  window.srFinder = {
    open: function () { openPanel(); if (conv.length) { startChat(); renderChat(); } },
    reset: function () { conv = []; chips = []; criteria = {}; lastPicks = []; }
  };

  function init() {
    var st = document.createElement('style');
    st.id = 'srf-css';
    st.textContent = CSS;
    document.head.appendChild(st);
    buildFab();
    if (!onListing) return;
    if (VARIANT === 'card') buildTopEntry();
    if (VARIANT === 'hero') buildHeroEntry();
    var p = new URLSearchParams(location.search);
    if (p.get('finder') === 'open') openPanel(p.get('q') || '');
    else if (p.get('finder') === 'guided') { openPanel(); answers = {}; qIndex = 0; renderGuided(); }
    else if (!p.get('picks')) maybeShowSheet();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
