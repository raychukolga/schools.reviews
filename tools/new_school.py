"""Create a school page from a JSON spec (layout copied from colegio-planalto-portugal.html),
add the school to `const schools` / `schoolPages` in the listing and to sitemap.xml.
Usage: python3 tools/new_school.py spec.json   (then run tools/gen_all_schools.py)"""
import html, json, math, os, re, sys, urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LISTING = os.path.join(ROOT, 'international-private-schools-portugal.html')
TEMPLATE = os.path.join(ROOT, 'colegio-planalto-portugal.html')
e = lambda x: html.escape(str(x), quote=False)
ea = lambda x: html.escape(str(x), quote=True)

P = '    <p style="font-size:15px;color:#444;line-height:1.85;margin-bottom:12px;">{}</p>\n\n'
PI = '        <div class="profile-item"><div class="profile-label">{}</div><div class="profile-val">{}</div></div>\n'
WIDE = ('        <div class="profile-item" style="grid-column:span 2;">\n          <div class="profile-label">{}</div>\n'
        '          <div class="profile-val">{}</div>\n        </div>\n')
GREEN = '<span style="background:#EAF3DE;color:#2E7D32;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;">{}</span>'
GREY = '<span style="background:#f5f5f5;color:#888;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;">None confirmed</span>'
AR = '        <div class="acad-row"><div class="acad-label">{}</div><div class="acad-val">{}</div></div>\n'
FI = '      <div class="fee-item"><div class="fee-label">{}</div><div class="fee-val">{}</div></div>\n'
FAQ = ('        <div class="acad-row" style="flex-direction:column;align-items:flex-start;gap:6px;padding:14px 0;{}">\n'
       '          <div style="font-size:13px;font-weight:600;color:var(--ink);">{}</div>\n'
       '          <div style="font-size:13px;color:#555;line-height:1.7;">{}</div>\n        </div>\n')


def chips(items, wrap=True):
    if not items:
        return f'<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:5px;">{GREY}</div>' if wrap else f'<div style="margin-top:5px;">{GREY}</div>'
    inner = ''.join(GREEN.format(e('✓ ' + x)) for x in items)
    return f'<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:5px;">{inner}</div>' if wrap else f'<div style="margin-top:5px;">{inner}</div>'


def section(title, cls, rows):
    return (f'    <div class="section">\n      <div class="sec-title{(" " + cls) if cls else ""}">{title}</div>\n      <div class="acad-wrap">\n'
            + ''.join(AR.format(e(a), b) for a, b in rows) + '      </div>\n    </div>\n\n')


def fee_text(s):
    if not s.get('price'):
        return 'Fees on request', 'not published by the school'
    if not s.get('priceMax') or s['priceMax'] == s['price']:
        return f"€{s['price']:,}", '/yr'
    return f"€{s['price']:,}", f"up to €{s['priceMax']:,} /yr"


def listing_schools():
    t = open(LISTING, encoding='utf-8').read()
    i = t.find('const schools')
    body = t[i:t.find('\n];', i)]
    j = re.search(r'schoolPages\s*=\s*\{', t).end()
    pages = {int(a): b for a, b in re.findall(r"(\d+)\s*:\s*'(/[^']+\.html)'", t[j:t.find('}', j)])}
    out = []
    for item in re.split(r'\n\s*\{\s*id:', body)[1:]:
        sid = int(re.match(r'\s*(\d+)', item).group(1))
        g = lambda k, pat=r'"([^"]*)"': (re.search(r'\b' + k + r':\s*' + pat, item) or [None, None])[1]
        out.append({'id': sid, 'name': g('name'), 'prog': g('prog'), 'lat': float(g('lat', r'([-\d.]+)') or 0),
                    'lng': float(g('lng', r'([-\d.]+)') or 0), 'price': g('price', r'(\d+)'), 'max': g('priceMax', r'(\d+)'),
                    'url': pages.get(sid)})
    return t, out


def build_page(s, others):
    t = open(TEMPLATE, encoding='utf-8').read()
    url = f"/{s['slug']}.html"
    title = f"{s['name']}, {s['city']} — Review &amp; Fees 2026"
    desc = ea(s['meta_description'])
    head = t[:t.index('<script type="application/ld+json">')]
    head = re.sub(r'<title>.*?</title>', f'<title>{title}</title>', head)
    head = re.sub(r'(<meta (?:name|property)="(?:description|og:description|twitter:description)" content=")[^"]*', lambda m: m.group(1) + desc, head)
    head = re.sub(r'(<meta property="og:title" content=")[^"]*', lambda m: m.group(1) + ea(f"{s['name']} — Fees & Info 2026 | Schools Reviews"), head)
    head = re.sub(r'(<meta name="twitter:title" content=")[^"]*', lambda m: m.group(1) + ea(f"{s['name']} — Fees & Info 2026"), head)
    head = head.replace('/colegio-planalto-portugal.html', url)
    ld = {'@context': 'https://schema.org', '@type': 'School', 'name': s['name'], 'description': s['ld_description'],
          'address': {'@type': 'PostalAddress', 'streetAddress': s['address'], 'addressCountry': 'PT'},
          'url': 'https://schools.reviews' + url}
    if s.get('founded'):
        ld['foundingDate'] = str(s['founded'])
    head += '<script type="application/ld+json">\n' + json.dumps(ld, ensure_ascii=False, indent=2) + '\n</script>\n'
    rest = t[t.index('</script>', t.index('application/ld+json')) + len('</script>\n'):]
    pre = rest[:rest.index('<div class="school-hero">')]
    pv, ps = fee_text(s)
    badges = ''.join(f'        <span class="badge" style="background:#F1EFE8;color:#444;">{e(b)}</span>\n' for b in s.get('badges', ['Portuguese private school']))
    if s.get('ib_badge'):
        badges = '        <a href="/ib-diploma-explained.html" class="badge" style="background:#EAF3DE;color:#2E7D32;text-decoration:none;">IB</a>\n' + badges
    if s.get('verDate'):
        badges += f'        <span class="badge badge-verified">✓ Verified {s["verDate"]}</span>\n'
    hero = f'''<div class="school-hero">
  <div class="breadcrumb"><a href="/">Home</a> → <a href="/international-private-schools-portugal.html">Portugal</a> → {e(s['name'])}</div>
  <div class="hero-inner">
    <div>      <div class="school-name-row"><h1 class="school-name">{e(s['name'])}</h1><div class="school-monogram">{e(s['short'])}</div></div>
      <div class="school-loc">📍 {e(s['address'])}</div>
      <div class="badge-row">
{badges}      </div>
    </div>
    <div class="hero-price-block">
      <div class="price-label">Annual tuition</div>
      <div class="price-val">{pv}</div>
      <div class="price-sub">{ps}</div>
    </div>
  </div>
</div>

<div class="page-wrap">
  <div class="main-col">

'''
    tm = t[t.index('<div class="page-wrap">'):]
    video = tm[tm.index('    <div class="sr-video">'):tm.index('    <div class="section">')]
    item = lambda x: f'          <div class="sr-note-item">{e(x)}</div>\n'
    main = video + ('    <div class="section">\n      <div class="sec-title">Schools Reviews assessment</div>\n      <div class="sr-note">\n'
                    '        <div class="sr-note-pros">\n          <div class="sr-note-head g">✓ What we like</div>\n'
                    + ''.join(item(x) for x in s['pros']) + '        </div>\n        <div class="sr-note-watch">\n          <div class="sr-note-head a">◎ Worth noting</div>\n'
                    + ''.join(item(x) for x in s['watch']) + '        </div>\n      </div>\n    </div>\n\n')
    main += ''.join(P.format(e(x)) for x in s['about'])
    prof = ''.join(PI.format(e(a), e(b)) for a, b in s['profile'])
    prof += PI.format('Boarding', '<span style="color:#888">No</span>')
    prof += WIDE.format('Programme authorisations', chips(s.get('authorisations')))
    prof += WIDE.format('Institutional accreditations', chips(s.get('accreditations')))
    prof += WIDE.format('Portuguese education licence', chips([s['licence']] if s.get('licence') else [], wrap=False))
    prof += WIDE.format('Owner / type', e(s['owner']))
    main += '    <div class="section">\n      <div class="sec-title">School profile</div>\n      <div class="profile-grid">\n' + prof + '</div>\n    </div>\n\n'
    main += section('Academics', 'blue', [(a, b) for a, b in s['academics']])
    main += section('Sport &amp; activities within curriculum', 'green', s.get('curriculum_activities') or [('Info', 'Details available from the school directly')])
    main += section('After school activities', 'green', s.get('after_school') or [('Sports', 'Ask the school'), ('Languages', 'Ask the school')])
    fm = ''.join(FI.format(e(a), e(b)) for a, b in s.get('fee_items', []))
    gr = ''.join(f'        <div class="grade-row"><div class="grade-label">{e(a)}</div><div class="grade-fee">{e(b)}'
                 + (f' <span style="font-size:11px;color:#888;font-weight:400;">· {e(c)}</span>' if c else '') + '</div></div>\n'
                 for a, b, c in s.get('grades', []))
    main += (f'    <div class="section">\n      <div class="sec-title terra">Fees · {s.get("fee_year", "2026/27")}</div>\n      <div class="fees-meta">\n{fm}      </div>\n'
             f'      <div class="grades-table">\n{gr}      </div>\n      <p style="font-size:11px;color:#bbb;margin-top:8px;">* {e(s.get("fee_note", ""))}{" " if s.get("fee_note") else ""}Always verify fees directly with the school — they change annually.</p>\n    </div>\n\n')
    faqs = s['faq']
    main += ('    <div class="section">\n      <div class="sec-title">Frequently asked questions</div>\n      <div class="acad-wrap" style="padding:0 16px;">\n'
             + ''.join(FAQ.format('border-bottom:none;' if k == len(faqs) - 1 else '', e(q), e(a)) for k, (q, a) in enumerate(faqs))
             + '      </div>\n    </div>\n\n  </div>\n\n')
    side = tm[tm.index('  <div class="sidebar">'):tm.index('<div style="background:var(--white);border-top:1px solid var(--border);padding:32px 40px;">')]
    side = re.sub(r'https://maps\.google\.com/\?q=[^"]*', 'https://maps.google.com/?q=' + urllib.parse.quote(s['name'] + ' ' + s['city']), side)
    near = sorted([o for o in others if o['url'] and o['lat']], key=lambda o: math.hypot(o['lat'] - s['lat'], (o['lng'] - s['lng']) * 0.78))[:2]
    cards = '      <a href="/international-private-schools-portugal.html" class="nearby-card"><div class="nearby-prog">All programmes</div><div class="nearby-name">Browse all schools in Portugal →</div><div class="nearby-price">75+ schools listed</div></a>\n'
    for o in near:
        pr = f"€{int(o['price']):,} – €{int(o['max']):,} /yr" if o['price'] and o['max'] and o['max'] != o['price'] else (f"from €{int(o['price']):,} /yr" if o['price'] else 'Fees on request')
        cards += f'      <a href="{o["url"]}" class="nearby-card"><div class="nearby-prog">{e(o["prog"])}</div><div class="nearby-name">{e(o["name"])}</div><div class="nearby-price">{pr}</div></a>\n'
    nearby = ('<div style="background:var(--white);border-top:1px solid var(--border);padding:32px 40px;">\n  <div style="max-width:900px;margin:0 auto;">\n'
              '    <div class="sec-title" style="margin-bottom:16px;">Other schools in this area</div>\n    <div class="nearby-grid">\n' + cards + '    </div>\n  </div>\n</div>\n\n')
    tail = t[t.index('<script src="/footer.js"></script>'):]
    tail = tail.replace('38.7679052, -9.1662542', f"{s['lat']}, {s['lng']}")
    return head + pre + hero + main + side + nearby + tail


def listing_entry(s, sid):
    js = lambda v: json.dumps(v, ensure_ascii=False)
    lines = [f'  {{ id:{sid}, name:{js(s["name"])}, short:{js(s["short"])},',
             f'    address:{js(s["address"])}, loc:{js(s["loc"])}, prog:{js(s["prog"])},',
             f'    price:{s.get("price") or "null"}, priceMax:{s.get("priceMax") or "null"},']
    extra = [f'{k}:{js(s[k])}' for k in ('earlyPrice', 'primaryPrice', 'middlePrice', 'secondaryPrice') if s.get(k)]
    if extra:
        lines.append('    ' + ', '.join(extra) + ',')
    extra = [f'{k}:{js(s[k]) if isinstance(s[k], str) else str(s[k]).lower()}' for k in ('appFee', 'enrollFee', 'annualEnrollFee', 'lunchIncluded', 'lunchPrice', 'schoolBus', 'lessonsStart', 'lessonsEnd') if k in s]
    if extra:
        lines.append('    ' + ', '.join(extra) + ',')
    ver = f'verified:true, verDate:{js(s["verDate"])}' if s.get('verDate') else 'verified:false'
    lines.append(f'    reviewed:false, {ver}, boarding:false, ptPrivate:{str(s.get("ptPrivate", True)).lower()}, ageFrom:{s["ageFrom"]}, ageTo:{s["ageTo"]},')
    lines.append(f'    bg:"#EAF3DE", color:"#27500A", lat:{s["lat"]}, lng:{s["lng"]},')
    if s.get('founded'):
        lines.append(f'    founded:{s["founded"]},')
    lines.append(f'    description:{js(s["description"])},')
    lines.append(f'    srNote:{{\n      pros:{js(s["srPros"])},\n      watch:{js(s["srWatch"])},\n    }},')
    lines.append(f'    website:{js(s["website"])} }},')
    return '\n'.join(lines)


def main(path):
    s = json.load(open(path, encoding='utf-8'))
    t, others = listing_schools()
    if any(o['name'] == s['name'] for o in others):
        sys.exit(f"already listed: {s['name']}")
    page = build_page(s, others)
    open(os.path.join(ROOT, s['slug'] + '.html'), 'w', encoding='utf-8').write(page)
    sid = max(o['id'] for o in others) + 1
    i = t.find('const schools'); j = t.find('\n];', i)
    prev = t[:j].rstrip()
    if not prev.endswith(','):  # the last entry may have no trailing comma
        t = prev + ',' + t[len(prev):]
        j = t.find('\n];', i)
    t = t[:j] + '\n' + listing_entry(s, sid) + t[j:]
    m = re.search(r'schoolPages\s*=\s*\{', t)
    k = t.find('\n};', m.end()) if t.find('\n};', m.end()) != -1 else t.find('}', m.end())
    close = t.rfind('\n', m.end(), t.find('}', m.end()))
    t = t[:close] + f"\n  {sid}: '/{s['slug']}.html'," + t[close:]
    open(LISTING, 'w', encoding='utf-8').write(t)
    sm = os.path.join(ROOT, 'sitemap.xml')
    x = open(sm, encoding='utf-8').read()
    if s['slug'] not in x:
        x = x.replace('</urlset>', f"  <url>\n    <loc>https://schools.reviews/{s['slug']}.html</loc>\n    <lastmod>{__import__('datetime').date.today()}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n</urlset>")
        open(sm, 'w', encoding='utf-8').write(x)
    print('added', sid, s['name'])


if __name__ == '__main__':
    main(sys.argv[1])
