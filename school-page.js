(function () {
  if (!document.getElementById('_sp_css')) {
    var css = document.createElement('style');
    css.id = '_sp_css';
    css.textContent = [
      ':root{--ink:#1a1814;--terra:#C4633A;--terra-light:#F5EDE8;--cream:#FAF8F5;--white:#fff;--gray:#888;--border:#e8e3de;--green:#2E7D32;--green-light:#EAF3DE;--blue:#0C447C;--blue-light:#E6F1FB;}',
      '*{box-sizing:border-box;margin:0;padding:0;}html{scroll-behavior:smooth;}body{font-family:"DM Sans",sans-serif;color:var(--ink);background:var(--cream);}',
      '.beta-bar{background:var(--terra-light);border-bottom:1px solid #e8d5c8;color:#8B3A1F;font-size:12px;text-align:center;padding:9px 20px;display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;}',
      '.beta-dot{width:7px;height:7px;border-radius:50%;background:var(--terra);display:inline-block;animation:pulse 2s infinite;}',
      '@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}',
      'nav{background:var(--white);border-bottom:1px solid var(--border);height:68px;display:flex;align-items:center;justify-content:space-between;padding:0 40px;position:sticky;top:0;z-index:500;}',
      '.logo{display:flex;flex-direction:column;line-height:1;text-decoration:none;}',
      '.logo-top{font-size:22px;font-weight:800;color:var(--ink);letter-spacing:-.8px;}',
      '.logo-line{width:100%;height:2px;background:var(--terra);margin:4px 0 3px;position:relative;}',
      '.logo-line::after{content:"";position:absolute;right:-6px;top:-4px;width:7px;height:7px;border-radius:50%;background:var(--terra);}',
      '.logo-bottom{font-size:10px;color:var(--gray);letter-spacing:3.5px;text-transform:uppercase;}',
      '.nav-links{display:flex;align-items:center;gap:24px;font-size:13px;}',
      '.nav-links a{text-decoration:none;color:var(--gray);transition:color .2s;}',
      '.nav-links a:hover{color:var(--ink);}',
      '.nav-dropdown{position:relative;}',
      '.nav-dropdown>a{display:flex;align-items:center;gap:4px;color:var(--gray);text-decoration:none;}',
      '.nav-dropdown-menu{display:none;position:absolute;top:100%;left:50%;transform:translateX(-50%);background:var(--white);border:1px solid var(--border);border-radius:12px;box-shadow:0 12px 40px rgba(0,0,0,.1);min-width:210px;padding:6px;z-index:600;}',
      '.nav-dropdown-menu::before{content:"";position:absolute;top:-14px;left:0;right:0;height:14px;}',
      '.nav-dropdown:hover .nav-dropdown-menu,.nav-dropdown-menu:hover{display:block;}',
      '.nav-dropdown-menu a{display:block;padding:9px 14px;border-radius:8px;font-size:13px;color:var(--ink)!important;text-decoration:none;transition:background .15s;white-space:nowrap;}',
      '.nav-dropdown-menu a:hover{background:var(--cream);}',
      '.menu-divider{height:1px;background:var(--border);margin:4px 0;}',
      '.nav-signin{display:flex;align-items:center;gap:7px;background:var(--terra-light);border:1px solid #e8c4b0;border-radius:30px;padding:6px 14px 6px 8px;font-size:13px;font-weight:500;color:#8B3A1F;text-decoration:none;}',
      '.nav-signin-icon{width:24px;height:24px;border-radius:50%;background:var(--terra);display:flex;align-items:center;justify-content:center;}',
      '.nav-signin-icon svg{width:13px;height:13px;}',
      '.school-hero{background:var(--white);border-bottom:1px solid var(--border);padding:32px 40px 28px;}',
      '.breadcrumb{font-size:11px;color:var(--gray);margin-bottom:16px;}',
      '.breadcrumb a{color:var(--terra);text-decoration:none;}',
      '.hero-inner{display:grid;grid-template-columns:1fr auto;gap:32px;align-items:flex-start;max-width:1140px;}',
      '.school-name-row{display:flex;align-items:flex-start;gap:14px;margin-bottom:6px;}',
      '.school-name-row .school-name{flex:1;margin-bottom:0;}',
      '.school-name-row .school-monogram{flex-shrink:0;margin-top:6px;margin-bottom:0;width:44px;height:44px;font-size:15px;}',
      '.school-monogram{width:52px;height:52px;background:var(--ink);color:var(--white);border-radius:13px;display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:800;letter-spacing:-1px;margin-bottom:12px;font-family:"DM Sans",sans-serif;}',
      '.school-name{font-family:"Cormorant Garamond",serif;font-size:34px;font-weight:600;color:var(--ink);line-height:1.1;margin-bottom:6px;}',
      '.school-loc{font-size:13px;color:var(--gray);margin-bottom:14px;}',
      '.badge-row{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:16px;}',
      '.badge{font-size:10px;font-weight:700;padding:4px 10px;border-radius:20px;}',
      '.badge-verified{background:var(--green-light);color:var(--green);}',
      '.hero-price-block{background:var(--cream);border:1.5px solid var(--border);border-radius:14px;padding:16px 20px;text-align:center;flex-shrink:0;min-width:180px;}',
      '.price-label{font-size:10px;color:var(--gray);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;}',
      '.price-val{font-family:"Cormorant Garamond",serif;font-size:26px;font-weight:600;color:var(--terra);line-height:1;}',
      '.price-sub{font-size:11px;color:var(--gray);margin-top:4px;}',
      '.page-wrap{max-width:1200px;margin:0 auto;padding:32px 40px 80px;display:grid;grid-template-columns:1fr 280px;gap:24px;align-items:flex-start;}',
      '.main-col{}',
      '.sidebar{position:sticky;top:88px;}',
      '.section{margin-bottom:28px;}',
      '.sec-title{font-size:10px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--ink);padding-bottom:9px;border-bottom:2px solid var(--ink);margin-bottom:14px;}',
      '.sec-title.blue{color:var(--blue);border-bottom-color:var(--blue);}',
      '.sec-title.green{color:var(--green);border-bottom-color:var(--green);}',
      '.sec-title.terra{color:var(--terra);border-bottom-color:var(--terra);}',
      '.sr-video{background:var(--ink);border-radius:12px;padding:14px 18px;display:flex;align-items:center;gap:14px;margin-bottom:20px;}',
      '.sr-logo{line-height:1;flex-shrink:0;}',
      '.sr-logo-top{font-size:11px;font-weight:800;color:#fff;}',
      '.sr-logo-line{height:1.5px;background:var(--terra);margin:2px 0;}',
      '.sr-logo-bot{font-size:7px;color:rgba(255,255,255,.35);letter-spacing:2px;text-transform:uppercase;}',
      '.sr-video-text{font-size:12px;color:rgba(255,255,255,.6);flex:1;line-height:1.5;}',
      '.sr-cs{background:rgba(255,255,255,.1);color:rgba(255,255,255,.5);font-size:10px;font-weight:700;padding:5px 12px;border-radius:6px;white-space:nowrap;text-transform:uppercase;letter-spacing:.06em;}',
      '.sr-note{border:1.5px solid var(--border);border-radius:12px;overflow:hidden;margin-bottom:20px;}',
      '.sr-note-pros{padding:14px 18px;border-bottom:1px solid var(--border);}',
      '.sr-note-watch{padding:14px 18px;background:#fffbf9;}',
      '.sr-note-head{font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;margin-bottom:9px;}',
      '.sr-note-head.g{color:var(--green);}',
      '.sr-note-head.a{color:#b85c2a;}',
      '.sr-note-item{font-size:12px;color:var(--ink);line-height:1.65;padding:2px 0;}',
      '.sr-note-item::before{content:"— ";color:var(--gray);}',
      '.tasis-network{background:linear-gradient(135deg,#f0f4ff,#e8eef8);border:1.5px solid #c0cfe8;border-radius:12px;padding:14px 18px;margin-bottom:20px;}',
      '.tasis-network-title{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--blue);margin-bottom:8px;}',
      '.tasis-network-schools{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;}',
      '.tasis-school-tag{font-size:11px;color:var(--blue);border:1px solid #c0cfe8;border-radius:6px;padding:4px 10px;background:var(--white);}',
      '.profile-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}',
      '.profile-item{background:var(--white);border:1px solid var(--border);border-radius:9px;padding:11px 14px;}',
      '.profile-label{font-size:10px;color:var(--gray);text-transform:uppercase;letter-spacing:.05em;margin-bottom:3px;}',
      '.profile-val{font-size:13px;font-weight:600;color:var(--ink);}',
      '.acad-wrap{background:var(--white);border:1px solid var(--border);border-radius:10px;padding:0 16px;}',
      '.acad-row{display:flex;align-items:baseline;gap:12px;padding:9px 0;border-bottom:1px solid var(--border);}',
      '.acad-row:last-child{border-bottom:none;}',
      '.acad-label{font-size:11px;color:var(--gray);text-transform:uppercase;letter-spacing:.06em;flex-shrink:0;width:140px;}',
      '.acad-val{font-size:13px;font-weight:500;color:var(--ink);flex:1;}',
      '.fees-meta{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;}',
      '.fee-item{background:var(--white);border:1px solid var(--border);border-radius:9px;padding:11px 14px;}',
      '.fee-label{font-size:10px;color:var(--gray);text-transform:uppercase;letter-spacing:.05em;margin-bottom:3px;}',
      '.fee-val{font-size:13px;font-weight:600;color:var(--ink);}',
      '.grades-table{border:1px solid var(--border);border-radius:10px;overflow:hidden;}',
      '.grade-row{display:flex;justify-content:space-between;align-items:center;padding:9px 14px;border-bottom:1px solid var(--border);}',
      '.grade-row:last-child{border-bottom:none;}',
      '.grade-row:nth-child(even){background:var(--cream);}',
      '.grade-label{font-size:12px;color:var(--ink);}',
      '.grade-fee{font-size:12px;font-weight:700;color:var(--ink);}',
      '.grade-section-head{background:#f0f0ee;padding:7px 14px;font-size:10px;font-weight:700;color:var(--gray);text-transform:uppercase;letter-spacing:.07em;border-bottom:1px solid var(--border);}',
      '.incl-tag{font-size:10px;font-weight:700;color:var(--green);background:var(--green-light);border-radius:4px;padding:2px 6px;margin-left:6px;}',
      '.map-card{border:1.5px solid var(--border);border-radius:12px;overflow:hidden;margin-bottom:14px;background:var(--white);}',
      '.map-card-label{font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--gray);padding:10px 14px 8px;}',
      '.map-card-map{height:200px;width:100%;}',
      '.map-card-footer{padding:8px 14px;font-size:11px;border-top:1px solid var(--border);}',
      '.map-card-footer a{color:var(--terra);text-decoration:none;font-weight:600;}',
      '.sidebar-card{background:var(--white);border:1.5px solid var(--border);border-radius:12px;padding:16px 18px;margin-bottom:14px;}',
      '.sidebar-title{font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--gray);margin-bottom:12px;}',
      '.sidebar-row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);font-size:12px;}',
      '.sidebar-row:last-child{border-bottom:none;}',
      '.sidebar-key{color:var(--gray);}',
      '.sidebar-val{font-weight:600;color:var(--ink);}',
      '.incl-highlight{background:var(--green-light);border:1.5px solid #b8ddb8;border-radius:12px;padding:14px 18px;margin-bottom:14px;}',
      '.incl-title{font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--green);margin-bottom:8px;}',
      '.incl-list{font-size:12px;color:#2a5c2a;line-height:1.9;}',
      '.incl-list span::before{content:"✓ ";}',
      '.incl-list span{display:block;}',
      '.lock-block{background:var(--white);border:1.5px solid var(--border);border-radius:12px;overflow:hidden;margin-bottom:14px;}',
      '.lock-header{background:#f5f5f5;padding:11px 16px;display:flex;align-items:center;justify-content:space-between;}',
      '.lock-title{font-size:12px;font-weight:700;color:var(--gray);}',
      '.lock-badge{font-size:9px;font-weight:700;background:var(--border);color:var(--gray);padding:3px 8px;border-radius:20px;text-transform:uppercase;letter-spacing:.06em;}',
      '.lock-body{padding:20px 16px;text-align:center;}',
      '.lock-icon{font-size:22px;opacity:.3;margin-bottom:8px;}',
      '.lock-text{font-size:12px;color:#bbb;line-height:1.6;margin-bottom:12px;}',
      '.lock-cta{font-size:11px;font-weight:600;color:var(--terra);border:1px solid #e8c4b0;padding:7px 16px;border-radius:7px;text-decoration:none;display:inline-block;}',
      '.apply-card{background:var(--cream);border:1.5px solid var(--border);border-radius:12px;padding:16px 18px;margin-bottom:14px;text-align:center;}',
      '.apply-btn{display:block;width:100%;background:#ccc;color:#fff;border:none;border-radius:8px;padding:11px;font-size:13px;font-weight:700;cursor:default;font-family:"DM Sans",sans-serif;margin-top:12px;}',
      '.apply-note{font-size:10px;color:var(--gray);margin-top:6px;}',
      '.nearby-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px;}',
      '.nearby-card{background:var(--white);border:1.5px solid var(--border);border-radius:10px;padding:14px;text-decoration:none;transition:border-color .15s;}',
      '.nearby-card:hover{border-color:var(--terra);}',
      '.nearby-prog{font-size:10px;color:var(--gray);margin-bottom:3px;}',
      '.nearby-name{font-size:12px;font-weight:600;color:var(--ink);margin-bottom:4px;line-height:1.3;}',
      '.nearby-price{font-size:11px;color:var(--terra);font-weight:600;}',
      'footer{background:#2C2825;color:rgba(255,255,255,.5);font-size:12px;padding:40px 40px 28px;}',
      '.footer-inner{max-width:1100px;margin:0 auto;}',
      '.footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr;gap:40px;margin-bottom:28px;}',
      '.footer-logo{display:inline-flex;flex-direction:column;line-height:1;}',
      '.footer-logo-top{font-size:18px;font-weight:800;color:#fff;letter-spacing:-.6px;}',
      '.footer-logo-line{width:100%;height:2px;background:var(--terra);margin:4px 0 3px;position:relative;}',
      '.footer-logo-line::after{content:"";position:absolute;right:-5px;top:-3px;width:6px;height:6px;border-radius:50%;background:var(--terra);}',
      '.footer-logo-bottom{font-size:8px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,.3);}',
      '.footer-desc{font-size:12px;line-height:1.7;margin-top:12px;}',
      '.footer-col-title{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:rgba(255,255,255,.6);margin-bottom:14px;}',
      '.footer-links{display:flex;flex-direction:column;gap:9px;}',
      '.footer-links a{color:rgba(255,255,255,.45);text-decoration:none;font-size:12px;}',
      '.footer-bottom{border-top:1px solid rgba(255,255,255,.08);padding-top:16px;display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap;}',
      '.footer-disclaimer{font-size:11px;line-height:1.7;max-width:640px;}',
      '.footer-copy{font-size:11px;white-space:nowrap;}',
      '.sr-mobile-bar{display:none;}',
      '@media(max-width:768px){',
      'nav{padding:0 16px;height:56px;}',
      '.nav-links{gap:12px;}',
      '.nav-hide-mobile{display:none!important;}',
      '.school-hero{padding:20px 16px 16px;}',
      '.hero-inner{grid-template-columns:1fr;}',
      '.hero-price-block{display:none;}',
      '.school-name{font-size:24px;}',
      '.page-wrap{padding:20px 16px 60px;grid-template-columns:1fr;}',
      '.sidebar{order:2;}',
      '.profile-grid{grid-template-columns:1fr 1fr;}',
      '.fees-meta{grid-template-columns:1fr 1fr;}',
      '.nearby-grid{grid-template-columns:1fr;}',
      '.footer-grid{grid-template-columns:1fr;gap:20px;}',
      'footer{padding:32px 16px 20px;}',
      '.sr-mobile-bar{display:flex;align-items:flex-start;gap:10px;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;margin:0 -16px 20px;padding:0 16px 4px;}',
      '.sr-mobile-bar::-webkit-scrollbar{display:none;}',
      '.sr-mobile-bar .map-card{flex:0 0 220px;margin-bottom:0;}',
      '.sr-mobile-bar .sidebar-card{flex:0 0 220px;margin-bottom:0;}',
      '}',
      '.campus-banner{background:var(--blue-light);border:1.5px solid #b8d4ef;border-radius:12px;padding:14px 18px;margin-bottom:20px;}',
      '.campus-banner-title{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--blue);margin-bottom:8px;}',
      '.campus-links{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;}',
      '.campus-link{font-size:12px;font-weight:600;color:var(--blue);text-decoration:none;border:1px solid #b8d4ef;border-radius:6px;padding:5px 11px;background:var(--white);}',
      '.campus-link.active{background:var(--blue);color:#fff;border-color:var(--blue);}',
      '.campus-link:hover{border-color:var(--blue);}',
      '.trial-card{background:linear-gradient(135deg,#fff8f5,#fef2ec);border:1.5px solid #e8c4b0;border-radius:12px;padding:16px 18px;margin-bottom:14px;}',
      '.trial-icon{font-size:22px;margin-bottom:8px;}',
      '.trial-title{font-size:13px;font-weight:700;color:var(--terra);margin-bottom:6px;}',
      '.trial-text{font-size:12px;color:#666;line-height:1.6;}',
      '.badge-reviewed{background:var(--terra-light);color:var(--terra);}',
      '.no-data{font-size:12px;color:#bbb;font-style:italic;}',
      '.ib-highlight{background:var(--green-light);border:1.5px solid #b8dda0;border-radius:12px;padding:14px 18px;margin-bottom:20px;display:flex;align-items:center;gap:16px;}',
      '.ib-score{font-family:"Cormorant Garamond",serif;font-size:42px;font-weight:600;color:var(--green);line-height:1;}',
      '.ib-score-label{font-size:12px;color:#2E7D32;line-height:1.6;}',
      '.ib-score-label strong{display:block;font-size:13px;font-weight:700;}',
      '.campus-grid{display:grid;grid-template-columns:1fr;gap:10px;}',
      '.campus-card{background:var(--white);border:1px solid var(--border);border-radius:10px;padding:14px 16px;}',
      '.campus-tag{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--terra);margin-bottom:4px;}',
      '.campus-name{font-size:13px;font-weight:600;color:var(--ink);margin-bottom:3px;}',
      '.campus-desc{font-size:12px;color:#555;line-height:1.6;}',
      '.faq-item{border-bottom:1px solid var(--border);}',
      '.faq-item:last-child{border-bottom:none;}',
      '.faq-q{font-size:13px;font-weight:600;color:var(--ink);padding:13px 0;cursor:pointer;display:flex;justify-content:space-between;align-items:center;user-select:none;}',
      '.faq-q:hover{color:var(--terra);}',
      '.faq-icon{font-size:16px;color:var(--gray);flex-shrink:0;margin-left:12px;transition:color .15s;}',
      '.faq-a{font-size:13px;color:#555;line-height:1.7;padding-bottom:13px;display:none;}',
      '.current-badge{display:inline-flex;align-items:center;gap:6px;background:var(--green-light);border:1px solid #b8ddb8;border-radius:20px;padding:5px 12px;font-size:11px;font-weight:600;color:var(--green);margin-bottom:14px;}'
    ].join('\n');
    document.head.appendChild(css);
  }
})();

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
