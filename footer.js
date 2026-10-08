(function () {
  var s = document.currentScript;

  // Стили подвала живут здесь, а не в каждой странице: раньше они были
  // скопированы в 11 файлов и успели разойтись в отступах и hover.
  if (!document.getElementById('_footer_css')) {
    var css = document.createElement('style');
    css.id = '_footer_css';
    css.textContent =
      'footer{background:#2C2825;color:rgba(255,255,255,.5);font-size:12px;padding:24px 40px 16px;}' +
      '.footer-inner{max-width:1100px;margin:0 auto;}' +
      '.footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr;gap:40px;margin-bottom:16px;align-items:start;}' +
      '.footer-logo{display:inline-flex;flex-direction:column;line-height:1;}' +
      '.footer-logo-top{font-size:18px;font-weight:800;color:#fff;letter-spacing:-.6px;}' +
      '.footer-logo-line{width:100%;height:2px;background:var(--terra,#C4633A);margin:4px 0 3px;position:relative;}' +
      '.footer-logo-line::after{content:"";position:absolute;right:-5px;top:-3px;width:6px;height:6px;border-radius:50%;background:var(--terra,#C4633A);}' +
      '.footer-logo-bottom{font-size:8px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,.3);}' +
      '.footer-desc{font-size:11.5px;line-height:1.6;margin:10px 0 0;max-width:none;}' +
      '.footer-col-title{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:rgba(255,255,255,.6);}' +
      // раскрывающиеся колонки: свой треугольник вместо браузерного маркера
      '.footer-col>summary{list-style:none;cursor:pointer;display:inline-flex;align-items:center;gap:7px;}' +
      '.footer-col>summary::-webkit-details-marker{display:none;}' +
      '.footer-col>summary::after{content:"";width:0;height:0;border-left:4px solid rgba(255,255,255,.45);border-top:3.5px solid transparent;border-bottom:3.5px solid transparent;transition:transform .2s;}' +
      '.footer-col[open]>summary::after{transform:rotate(90deg);}' +
      '.footer-col>summary:hover{color:rgba(255,255,255,.85);}' +
      '.footer-links{display:flex;flex-direction:column;gap:9px;padding-top:12px;}' +
      '.footer-links a{color:rgba(255,255,255,.45);text-decoration:none;font-size:12px;transition:color .2s;}' +
      '.footer-links a:hover{color:rgba(255,255,255,.8);}' +
      '.footer-bottom{border-top:1px solid rgba(255,255,255,.08);padding-top:14px;display:flex;justify-content:space-between;align-items:baseline;gap:20px;flex-wrap:wrap;}' +
      '.footer-copy{font-size:11px;}' +
      '.footer-copy a{color:inherit;}' +
      '.footer-note>summary{list-style:none;cursor:pointer;font-size:11px;color:rgba(255,255,255,.45);display:inline-flex;align-items:center;gap:6px;white-space:nowrap;}' +
      '.footer-note>summary::-webkit-details-marker{display:none;}' +
      '.footer-note>summary::after{content:"";width:0;height:0;border-left:4px solid rgba(255,255,255,.35);border-top:3.5px solid transparent;border-bottom:3.5px solid transparent;transition:transform .2s;}' +
      '.footer-note[open]>summary::after{transform:rotate(90deg);}' +
      '.footer-note>summary:hover{color:rgba(255,255,255,.75);}' +
      '.footer-disclaimer{font-size:11px;line-height:1.7;max-width:640px;margin:10px 0 0;}' +
      '@media(max-width:700px){.footer-grid{grid-template-columns:1fr;gap:18px;}footer{padding:24px 16px 16px;}.footer-desc{max-width:none;}}';
    document.head.appendChild(css);
  }

  var html =
    '<footer>\n' +
    '  <div class="footer-inner">\n' +
    '    <div class="footer-grid">\n' +
    '      <div>\n' +
    '        <div class="footer-logo">\n' +
    '          <div class="footer-logo-top">Schools</div>\n' +
    '          <div class="footer-logo-line"></div>\n' +
    '          <div class="footer-logo-bottom">REVIEWS</div>\n' +
    '        </div>\n' +
    '        <p class="footer-desc">Independent school reviews, verified data and direct applications — all in one place.</p>\n' +
    '      </div>\n' +
    '      <details class="footer-col">\n' +
    '        <summary class="footer-col-title">Navigate</summary>\n' +
    '        <div class="footer-links">\n' +
    '          <a href="/">Browse schools</a>\n' +
    '          <a href="/about.html">About us</a>\n' +
    '          <a href="/parent-dashboard.html">For parents</a>\n' +
    '          <a href="/school-dashboard.html">For schools</a>\n' +
    '          <a href="mailto:editor@schools.reviews">Contact us</a>\n' +
    '          <a href="/terms.html">Terms of Use</a>\n' +
    '        </div>\n' +
    '      </details>\n' +
    '      <details class="footer-col">\n' +
    '        <summary class="footer-col-title">Guides</summary>\n' +
    '        <div class="footer-links">\n' +
    '          <a href="/ib-vs-cambridge-which-is-better.html">IB vs Cambridge</a>\n' +
    '          <a href="/ib-diploma-explained.html">IB Diploma explained</a>\n' +
    '          <a href="/cambridge-curriculum-explained.html">Cambridge explained</a>\n' +
    '          <a href="/international-school-accreditations-guide.html">Accreditations explained</a>\n' +
    '          <a href="/school-year-grade-by-age-guide.html">School grades by age</a>\n' +
    '        </div>\n' +
    '      </details>\n' +
    '    </div>\n' +
    '    <div class="footer-bottom">\n' +
    '      <span class="footer-copy">© 2026 Schools Reviews. All rights reserved. · <a href="/terms.html">Terms of Use</a></span>\n' +
    '      <details class="footer-note">\n' +
    '        <summary>About our data</summary>\n' +
    '        <p class="footer-disclaimer">School data is compiled from publicly available sources' +
          ' including school websites, the IB Organization, and third-party directories.' +
          ' Schools Reviews does not guarantee the accuracy or completeness of this information.' +
          ' Fees, programmes, and school details change frequently —' +
          ' always verify directly with the school before making any decisions.</p>\n' +
    '      </details>\n' +
    '    </div>\n' +
    '  </div>\n' +
    '</footer>';

  if (s) {
    s.insertAdjacentHTML('beforebegin', html);
    s.remove();
  } else {
    document.body.insertAdjacentHTML('beforeend', html);
  }
})();
