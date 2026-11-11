"""Knowledge base for the School Finder, built from the site's own HTML.

Reads the listing (const schools + schoolPages) and each school page, and
returns compact plain-text facts per school. Runs at function cold start, so
every push that changes a school page also changes what the assistant knows.
"""
import html
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LISTING = 'international-private-schools-portugal.html'
GUIDES = {
    'ib-vs-cambridge-which-is-better.html': 'IB vs Cambridge: differences and which suits your child',
    'ib-diploma-explained.html': 'What is the IB programme? PYP, MYP, Diploma',
    'cambridge-curriculum-explained.html': 'Cambridge curriculum explained: IGCSE, A Levels',
    'international-school-accreditations-guide.html': 'International school accreditations in Portugal',
    'school-year-grade-by-age-guide.html': 'School grades by age: IB, British, American, Portuguese',
    'international-schools-lisbon.html': 'International schools in Lisbon — guide',
    'ib-schools-lisbon-2026.html': 'IB schools in Lisbon — guide',
}
SKIP_SECTIONS = ('School photos', 'Other schools', 'Frequently asked questions')


def _read(name):
    with open(os.path.join(ROOT, name), encoding='utf-8') as f:
        return f.read()


def _text(fragment):
    t = re.sub(r'<br\s*/?>', ' ', fragment)
    t = re.sub(r'<[^>]+>', ' ', t)
    t = html.unescape(t)
    return re.sub(r'\s+', ' ', t).strip()


def _listing():
    t = _read(LISTING)
    i = t.find('const schools')
    body = t[i:t.find('\n];', i)]
    j = t.find('schoolPages')
    pages = {int(a): b for a, b in re.findall(r"(\d+)\s*:\s*'(/[^']+\.html)'", t[j:j + 20000])}
    out = []
    for item in re.split(r'\n\s*\{\s*id:', body)[1:]:
        sid = int(re.match(r'\s*(\d+)', item).group(1))

        def g(key, pat=r'"([^"]*)"'):
            m = re.search(r'\b' + key + r':\s*' + pat, item)
            return m.group(1) if m else None
        num = lambda k: (lambda v: int(float(v)) if v not in (None, 'null') else None)(g(k, r'([\d.]+|null)'))
        out.append({
            'id': sid, 'name': g('name'), 'area': g('loc'), 'programme': g('prog'),
            'fee_min': num('price'), 'fee_max': num('priceMax'),
            'age_from': num('ageFrom'), 'age_to': num('ageTo'),
            'lat': float(g('lat', r'([-\d.]+)') or 0), 'lng': float(g('lng', r'([-\d.]+)') or 0),
            'verified': g('verified', r'(true|false)') == 'true', 'ver_date': g('verDate'),
            'visited': g('reviewed', r'(true|false)') == 'true',
            'boarding': g('boarding', r'(true|false)') == 'true',
            'url': pages.get(sid),
        })
    return out


def _page_facts(url):
    """Main column of a school page as short 'label: value' lines, by section."""
    h = _read(url.lstrip('/'))
    main = h[h.find('<div class="main-col">'):h.find('<div class="sidebar">')]
    main = re.sub(r'<script.*?</script>|<style.*?</style>', '', main, flags=re.S)
    lines, warn = [], []
    badge = re.search(r'badge-verified">([^<]*)', h)
    parts = re.split(r'<div class="sec-title[^"]*"[^>]*>(.*?)</div>', main)
    # parts: [before-first-title, title1, body1, title2, body2, ...]
    chunks = [('About', parts[0])] + [(_text(parts[k]), parts[k + 1]) for k in range(1, len(parts) - 1, 2)]
    about = []
    for title, body in chunks:
        if title.startswith(SKIP_SECTIONS):
            # descriptive paragraphs sometimes sit after the photo gallery
            about += [_text(p) for p in re.findall(r'<p style="font-size:15px[^>]*>(.*?)</p>', body, re.S)]
            continue
        about += [_text(p) for p in re.findall(r'<p style="font-size:15px[^>]*>(.*?)</p>', body, re.S)]
        if title == 'Schools Reviews assessment':
            for cls, label in (('pros', 'What we like'), ('watch', 'Worth noting')):
                m = re.search(r'class="sr-note-' + cls + r'">(.*?)(?=<div class="sr-note-(?:pros|watch)"|$)', body, re.S)
                pts = [_text(x) for x in re.findall(r'sr-note-item">(.*?)</div>', m.group(1), re.S)] if m else []
                pts = [x for x in pts if not x.startswith(('We are updating', 'Information on this page is being updated'))]
                if pts:
                    lines.append(label + ': ' + ' | '.join(pts))
            continue
        rows = re.findall(r'class="(?:profile|acad|fee)-label">(.*?)</div>\s*<div class="(?:profile|acad|fee)-val">(.*?)</div>\s*</div>', body, re.S)
        rows = [(_text(a), _text(b)) for a, b in rows]
        grades = [(_text(a), _text(b)) for a, b in re.findall(r'grade-label">(.*?)</div><div class="grade-fee">(.*?)</div>', body, re.S)]
        notes = [_text(p) for p in re.findall(r'<p style="font-size:1[12]px[^>]*>(.*?)</p>', body, re.S)]
        if not (rows or grades or notes):
            continue
        sec = [f'{a}: {b}' for a, b in rows if b and b not in ('—', 'Ask the school', 'None confirmed')]
        if grades:
            sec.append('Tuition by year: ' + '; '.join(f'{a} {b}' for a, b in grades))
        sec += [n for n in notes if n and not n.startswith('Click any photo')]
        if sec:
            lines.append(f'[{title}] ' + ' · '.join(sec))
    if not any(l.startswith('What we like') for l in lines):
        warn.append('no assessment')
    if not any('Tuition by year' in l for l in lines):
        warn.append('no fee table')
    about = [a for a in about if a]
    return {'verified_badge': badge.group(1).strip() if badge else None,
            'about': ' '.join(about), 'facts': lines}, warn


def build():
    schools, warnings = [], []
    for s in _listing():
        if not s['url']:
            warnings.append(f"{s['name']}: no page")
            continue
        try:
            p, w = _page_facts(s['url'])
        except Exception as e:  # a broken page must not take the assistant down
            warnings.append(f"{s['url']}: {e}")
            continue
        warnings += [f"{s['url']}: {x}" for x in w]
        s['slug'] = s['url'].strip('/').removesuffix('.html')
        s.update(p)
        if s['age_from'] is None:  # fall back to the page's profile line, e.g. "Ages: 3–18 years"
            m = re.search(r'Ages: (\d+)(?:\.0)? ?(months?)?\s*–\s*(\d+)', ' '.join(p['facts']))
            if m:
                s['age_from'], s['age_to'] = (0 if m.group(2) else int(m.group(1))), int(m.group(3))
        schools.append(s)
    return {'schools': schools, 'guides': GUIDES, 'warnings': warnings}


def as_prompt(kb):
    """The knowledge base as one stable text block for the system prompt."""
    out = []
    for s in kb['schools']:
        ages = f"{s['age_from']}–{s['age_to']}" if s['age_from'] is not None and s['age_to'] else 'see page'
        fees = f"€{s['fee_min']:,}–€{s['fee_max']:,}/yr" if s['fee_min'] else 'fees on request'
        ver = f"Verified {s['ver_date']}" if s['verified'] and s['ver_date'] else ('Verified' if s['verified'] else 'NOT verified')
        out.append('\n'.join([
            f"## {s['name']}  (slug: {s['slug']})",
            f"Area: {s['area']} · Programme: {s['programme']} · Ages: {ages} · Fees: {fees} · {ver}"
            + (' · Visited and filmed by us' if s['visited'] else '') + (' · Boarding' if s['boarding'] else ''),
            f"Page: https://schools.reviews{s['url']}",
            s['about'],
            *s['facts'],
        ]))
    guides = '\n'.join(f'- {t}: https://schools.reviews/{u}' for u, t in kb['guides'].items())
    return '# Schools\n\n' + '\n\n'.join(out) + '\n\n# Guides\n' + guides


if __name__ == '__main__':
    kb = build()
    print(json.dumps(kb['warnings'], indent=1))
    print(len(kb['schools']), 'schools,', len(as_prompt(kb)), 'chars')
