(function () {
  var s = document.currentScript;
  var backHref = s && s.dataset.backHref;
  var backLabel = s && s.dataset.backLabel;
  var backLink = backHref
    ? '<a href="' + backHref + '" class="nav-back">' + backLabel + '</a>'
    : '';

  if (!document.getElementById('_nav_css')) {
    var css = document.createElement('style');
    css.id = '_nav_css';
    css.textContent =
      '.nav-back{text-decoration:none;color:var(--gray,#888);font-size:13px;transition:color .2s}' +
      '.nav-back:hover{color:var(--ink,#1a1814)}' +
      '#_nav_menu{display:none;position:fixed;top:68px;left:0;right:0;background:#fff;' +
        'border-bottom:1px solid #e8e3de;padding:12px 16px;z-index:900;box-shadow:0 4px 20px rgba(0,0,0,.1)}' +
      '#_nav_menu.open{display:block}' +
      '._nm_sec{font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;' +
        'color:#C4633A;margin:12px 0 6px}' +
      '._nm_sec:first-child{margin-top:4px}' +
      '._nm_link{display:block;padding:10px 0;font-size:14px;color:#1a1814;' +
        'text-decoration:none;border-bottom:1px solid #e8e3de}' +
      '._nm_link:last-child{border-bottom:none}' +
      '@media(max-width:768px){' +
        '.nav-hide-mobile{display:none!important}' +
        '#_nav_hamburger{display:flex!important}' +
        '#_nav_menu{top:56px}' +
      '}';
    document.head.appendChild(css);
  }

  var html =
    '<div class="beta-bar">' +
      '<span class="beta-dot"></span>' +
      ' <strong>We’re building something new.</strong>' +
      ' School data is being added and verified — some profiles are still incomplete.' +
    '</div>\n' +
    '<nav>\n' +
    '  <a href="/" class="logo">' +
      '<span class="logo-top">Schools</span>' +
      '<div class="logo-line"></div>' +
      '<span class="logo-bottom">Reviews</span>' +
    '</a>\n' +
    '  <div class="nav-links">\n' +
    '    <a href="/about.html" class="nav-hide-mobile">About us</a>\n' +
    '    <div class="nav-dropdown nav-hide-mobile">\n' +
    '      <a href="#">Guides ▾</a>\n' +
    '      <div class="nav-dropdown-menu">\n' +
    '        <a href="/school-year-grade-by-age-guide.html">📊 School grades by age</a>\n' +
    '        <div class="menu-divider"></div>\n' +
    '        <a href="/ib-vs-cambridge-which-is-better.html">🎓 IB vs Cambridge</a>\n' +
    '        <a href="/ib-diploma-explained.html">📋 IB Diploma explained</a>\n' +
    '        <a href="/cambridge-curriculum-explained.html">🇬🇧 Cambridge explained</a>\n' +
    '        <div class="menu-divider"></div>\n' +
    '        <a href="/ib-schools-lisbon-2026.html">🇵🇹 IB schools in Lisbon</a>\n' +
    '        <a href="/international-schools-lisbon.html">🏫 Int’l schools in Lisbon</a>\n' +
    '      </div>\n' +
    '    </div>\n' +
    (backLink ? '    ' + backLink + '\n' : '') +
    '    <a href="#" class="nav-signin nav-hide-mobile">' +
      '<div class="nav-signin-icon">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2">' +
          '<circle cx="12" cy="8" r="4"/>' +
          '<path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>' +
        '</svg>' +
      '</div>' +
      'Sign in' +
    '</a>\n' +
    '    <button id="_nav_hamburger"' +
      ' style="display:none;flex-direction:column;gap:4px;background:none;border:none;cursor:pointer;padding:6px;"' +
      ' aria-label="Menu">' +
      '<span style="display:block;width:20px;height:2px;background:#1a1814;border-radius:2px;"></span>' +
      '<span style="display:block;width:20px;height:2px;background:#1a1814;border-radius:2px;"></span>' +
      '<span style="display:block;width:20px;height:2px;background:#1a1814;border-radius:2px;"></span>' +
    '</button>\n' +
    '  </div>\n' +
    '</nav>\n' +
    '<div id="_nav_menu">\n' +
    '  <div class="_nm_sec">Browse</div>\n' +
    '  <a href="/international-private-schools-portugal.html" class="_nm_link">🇵🇹 Schools in Portugal</a>\n' +
    '  <div class="_nm_sec">Guides</div>\n' +
    '  <a href="/school-year-grade-by-age-guide.html" class="_nm_link">📊 School grades by age</a>\n' +
    '  <a href="/ib-vs-cambridge-which-is-better.html" class="_nm_link">🎓 IB vs Cambridge</a>\n' +
    '  <a href="/ib-diploma-explained.html" class="_nm_link">📋 IB Diploma explained</a>\n' +
    '  <a href="/cambridge-curriculum-explained.html" class="_nm_link">🇬🇧 Cambridge explained</a>\n' +
    '  <a href="/ib-schools-lisbon-2026.html" class="_nm_link">🇵🇹 IB schools in Lisbon</a>\n' +
    '  <a href="/international-schools-lisbon.html" class="_nm_link">🏫 Int’l schools in Lisbon</a>\n' +
    '  <div class="_nm_sec">Schools Reviews</div>\n' +
    '  <a href="/about.html" class="_nm_link">About us</a>\n' +
    '  <a href="/" class="_nm_link" style="border-bottom:none">Browse all countries</a>\n' +
    '</div>';

  if (s) {
    s.insertAdjacentHTML('beforebegin', html);
    s.remove();
  } else {
    document.body.insertAdjacentHTML('afterbegin', html);
  }

  var hamburger = document.getElementById('_nav_hamburger');
  var menu = document.getElementById('_nav_menu');

  if (hamburger && menu) {
    hamburger.addEventListener('click', function (e) {
      e.stopPropagation();
      menu.classList.toggle('open');
    });
  }

  document.addEventListener('click', function (e) {
    if (menu && e.target.closest &&
        !e.target.closest('#_nav_hamburger') &&
        !e.target.closest('#_nav_menu')) {
      menu.classList.remove('open');
    }
  });
})();
