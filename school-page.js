// Поведение страниц школ: терракотовая плашка, кнопки Save/Compare,
// мобильная перестановка блоков. Стили лежат в school-page.css —
// подключаются через <link>, чтобы не было вспышки неоформленной страницы.

document.addEventListener('DOMContentLoaded', function () {
  // Terracotta editorial strip — injected into .school-hero
  var hero = document.querySelector('.school-hero');
  if (hero && !hero.querySelector('.sr-editorial-strip')) {
    var strip = document.createElement('div');
    strip.className = 'sr-editorial-strip';
    strip.style.cssText = 'margin-top:16px;margin-left:-40px;margin-right:-40px;margin-bottom:-28px;padding:10px 40px;background:var(--terra);display:flex;align-items:center;justify-content:center;gap:8px;';
    strip.innerHTML = '<span style="width:4px;height:4px;border-radius:50%;background:rgba(255,255,255,0.5);display:inline-block;flex-shrink:0;"></span>'
      + '<span style="font-size:12px;font-weight:600;color:white;letter-spacing:0.05em;">Independent editorial· Schools do not pay for reviews · Verified by Schools Reviews May 2026</span>'
      + '<span style="width:4px;height:4px;border-radius:50%;background:rgba(255,255,255,0.5);display:inline-block;flex-shrink:0;"></span>';
    hero.appendChild(strip);
  }

  // Save / Compare buttons — injected after map card (above photos)
  var mapCard = document.querySelector('.map-card');
  if (mapCard && !document.querySelector('.sr-save-compare-card')) {
    var schoolName = (document.querySelector('.school-name') || {}).textContent || document.title;
    var schoolUrl = window.location.pathname;
    var saved = JSON.parse(localStorage.getItem('sr_saved_schools') || '[]');
    var isSaved = saved.some(function (s) { return s.url === schoolUrl; });

    var card = document.createElement('div');
    card.className = 'sidebar-card sr-save-compare-card';
    card.style.cssText = 'padding:12px 14px;';

    var saveBtn = document.createElement('button');
    saveBtn.id = 'sr-save-btn';
    saveBtn.textContent = isSaved ? '♥ Saved' : '♡ Save school';
    saveBtn.style.cssText = 'width:100%;padding:9px 12px;border-radius:8px;font-size:12px;font-weight:600;font-family:"DM Sans",sans-serif;cursor:pointer;border:1.5px solid var(--border);background:var(--white);color:var(--ink);margin-bottom:7px;transition:background .15s,color .15s;';
    if (isSaved) {
      saveBtn.style.background = 'var(--terra-light)';
      saveBtn.style.borderColor = '#e8c4b0';
      saveBtn.style.color = 'var(--terra)';
    }
    saveBtn.addEventListener('click', function () {
      var list = JSON.parse(localStorage.getItem('sr_saved_schools') || '[]');
      var idx = list.findIndex(function (s) { return s.url === schoolUrl; });
      if (idx >= 0) {
        list.splice(idx, 1);
        saveBtn.textContent = '♡ Save school';
        saveBtn.style.background = 'var(--white)';
        saveBtn.style.borderColor = 'var(--border)';
        saveBtn.style.color = 'var(--ink)';
      } else {
        list.push({ name: schoolName, url: schoolUrl });
        saveBtn.textContent = '♥ Saved';
        saveBtn.style.background = 'var(--terra-light)';
        saveBtn.style.borderColor = '#e8c4b0';
        saveBtn.style.color = 'var(--terra)';
      }
      localStorage.setItem('sr_saved_schools', JSON.stringify(list));
    });

    var cmpBtn = document.createElement('button');
    var queue = JSON.parse(localStorage.getItem('sr_compare_queue') || '[]');
    var inQueue = queue.includes(schoolUrl);
    cmpBtn.textContent = inQueue ? '✓ In compare' : '⇄ Add to compare';
    cmpBtn.style.cssText = 'width:100%;padding:9px 12px;border-radius:8px;font-size:12px;font-weight:600;font-family:"DM Sans",sans-serif;cursor:pointer;border:1.5px solid #0C447C;background:#E6F1FB;color:#0C447C;transition:background .15s;';
    if (inQueue) { cmpBtn.style.background = '#0C447C'; cmpBtn.style.color = 'white'; }
    cmpBtn.addEventListener('click', function () {
      var q = JSON.parse(localStorage.getItem('sr_compare_queue') || '[]');
      if (q.includes(schoolUrl)) {
        q = q.filter(function(u){ return u !== schoolUrl; });
        cmpBtn.textContent = '⇄ Add to compare';
        cmpBtn.style.background = '#E6F1FB';
        cmpBtn.style.color = '#0C447C';
      } else {
        if (q.length >= 4) { alert('Максимум 4 школы для сравнения'); return; }
        q.push(schoolUrl);
        cmpBtn.textContent = '✓ In compare';
        cmpBtn.style.background = '#0C447C';
        cmpBtn.style.color = 'white';
      }
      localStorage.setItem('sr_compare_queue', JSON.stringify(q));
    });

    card.appendChild(saveBtn);
    card.appendChild(cmpBtn);
    mapCard.parentNode.insertBefore(card, mapCard.nextSibling);
  }

  // Mobile layout: photos + map strip after assessment, save/compare after fees
  function buildMobileBar() {
    if (document.querySelector('.sr-mobile-bar')) return;
    var mainCol = document.querySelector('.main-col');
    var sidebar = document.querySelector('.sidebar');
    if (!mainCol || !sidebar) return;

    // Photos + map after assessment
    var firstSection = mainCol.querySelector('.section');
    var mMapCard = sidebar.querySelector('.map-card');
    var mPhotoCard = null;
    sidebar.querySelectorAll('.sidebar-card').forEach(function (c) {
      if (!mPhotoCard && c.querySelector('img')) mPhotoCard = c;
    });
    if (firstSection && (mMapCard || mPhotoCard)) {
      var bar = document.createElement('div');
      bar.className = 'sr-mobile-bar';
      if (mPhotoCard) bar.appendChild(mPhotoCard);
      if (mMapCard) bar.appendChild(mMapCard);
      mainCol.insertBefore(bar, firstSection.nextElementSibling);
    }

    // Save/compare card after fees section
    var scCard = sidebar.querySelector('.sr-save-compare-card');
    if (scCard) {
      var feesSection = null;
      mainCol.querySelectorAll('.section').forEach(function (s) {
        var t = s.querySelector('.sec-title');
        if (t && /fees/i.test(t.textContent)) feesSection = s;
      });
      if (feesSection) {
        scCard.style.cssText = '';
        mainCol.insertBefore(scCard, feesSection.nextElementSibling);
      }
    }
  }
  if (window.matchMedia('(max-width:768px)').matches) buildMobileBar();
});

function toggleFaq(el) {
  var answer = el.nextElementSibling;
  var icon = el.querySelector('.faq-icon');
  if (!answer) return;
  var isOpen = answer.style.display === 'block';
  answer.style.display = isOpen ? 'none' : 'block';
  if (icon) icon.textContent = isOpen ? '+' : '−';
}
