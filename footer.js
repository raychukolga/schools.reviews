(function () {
  var s = document.currentScript;
  var html =
    '<footer>\n' +
    '  <div class="footer-inner">\n' +
    '    <div class="footer-grid">\n' +
    '      <div>\n' +
    '        <div class="footer-logo-top">Schools</div>\n' +
    '        <div class="footer-logo-line"></div>\n' +
    '        <div class="footer-logo-bottom">Reviews</div>\n' +
    '        <p class="footer-desc">Independent school reviews, verified data and direct applications — all in one place.</p>\n' +
    '      </div>\n' +
    '      <div>\n' +
    '        <div class="footer-col-title">Navigate</div>\n' +
    '        <div class="footer-links">\n' +
    '          <a href="/">Browse schools</a>\n' +
    '          <a href="/about.html">About us</a>\n' +
    '          <a href="/parent-dashboard.html">For parents</a>\n' +
    '          <a href="/school-dashboard.html">For schools</a>\n' +
    '          <a href="mailto:editor@schools.reviews">Contact us</a>\n' +
    '        </div>\n' +
    '      </div>\n' +
    '      <div>\n' +
    '        <div class="footer-col-title">Countries</div>\n' +
    '        <div class="footer-links">\n' +
    '          <a href="/international-private-schools-portugal.html">🇵🇹 Portugal</a>\n' +
    '          <a href="/international-private-schools-spain.html">🇪🇸 Spain</a>\n' +
    '          <a href="/international-private-schools-france.html">🇫🇷 France</a>\n' +
    '          <a href="#">🇩🇪 Germany · 🇮🇹 Italy · 🇭🇷 Croatia</a>\n' +
    '        </div>\n' +
    '      </div>\n' +
    '    </div>\n' +
    '    <div class="footer-bottom">\n' +
    '      <p class="footer-disclaimer">School data is compiled from publicly available sources' +
        ' including school websites, the IB Organization, and third-party directories.' +
        ' Schools Reviews does not guarantee the accuracy or completeness of this information.' +
        ' Fees, programmes, and school details change frequently —' +
        ' always verify directly with the school before making any decisions.</p>\n' +
    '      <span class="footer-copy">© 2026 Schools Reviews</span>\n' +
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
