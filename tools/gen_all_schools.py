"""Rebuild everything that lists all schools from `const schools` in the listing page:
all-schools-portugal.html (regions, counts), the listing's ItemList JSON-LD, the static
directory block at the bottom of the listing, and the "N schools" counts.
Run after adding, removing or renaming a school:  python3 tools/gen_all_schools.py"""
import html, json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LISTING = os.path.join(ROOT, 'international-private-schools-portugal.html')
ALL = os.path.join(ROOT, 'all-schools-portugal.html')
SITE = 'https://schools.reviews'

REGIONS = [  # id, title, loc fragments (checked in this order)
    ('algarve', 'Algarve', ['algarve']),
    ('porto', 'Porto &amp; the North', ['porto', 'braga', 'gaia', 'matosinhos', 'maia', 'gondomar', 'famalicão',
                                       'paços de ferreira', 'guimarães', 'viana', 'ruilhe']),
    ('cascais', 'Cascais &amp; Estoril', ['cascais', 'estoril']),
    ('oeiras', 'Oeiras', ['oeiras']),
    ('sintra', 'Sintra', ['sintra']),
    ('lisbon', 'Lisbon city', ['lisbon', 'lisboa', 'parque das nações']),
    ('greater', 'Greater Lisbon &amp; Setúbal', ['queluz', 'setúbal', 'almada', 'seixal', 'palmela', 'amadora',
                                                 'azeitão', 'loures', 'odivelas', 'barreiro', 'montijo']),
    ('centre', 'Central Portugal &amp; Madeira', ['']),  # everything else
]


def schools():
    t = open(LISTING, encoding='utf-8').read()
    i = t.find('const schools')
    body = t[i:t.find('\n];', i)]
    j = re.search(r'schoolPages\s*=\s*\{', t).end()
    pages = {int(a): b for a, b in re.findall(r"(\d+)\s*:\s*'(/[^']+\.html)'", t[j:t.find('}', j)])}
    out = []
    for item in re.split(r'\n\s*\{\s*id:', body)[1:]:
        sid = int(re.match(r'\s*(\d+)', item).group(1))
        g = lambda k: (re.search(r'\b' + k + r':\s*"([^"]*)"', item) or [None, None])[1]
        n = lambda k: (lambda m: int(m.group(1)) if m else None)(re.search(r'\b' + k + r':\s*(\d+)', item))
        if sid not in pages:
            continue
        out.append({'id': sid, 'name': g('name'), 'loc': g('loc') or '', 'prog': g('prog') or '',
                    'price': n('price'), 'max': n('priceMax'), 'url': pages[sid]})
    return out


def region(s):
    loc = s['loc'].lower()
    return next(r for r in REGIONS if any(k in loc for k in r[2]))[0]


def fees(s):
    if not s['price']:
        return 'Fees on request'
    if not s['max'] or s['max'] == s['price']:
        return f"from €{s['price']:,}/yr"
    return f"€{s['price']:,} – €{s['max']:,}/yr"


def main():
    ss = schools()
    key = lambda s: re.sub(r'^the ', '', s['name'].lower())
    order = ['lisbon', 'cascais', 'oeiras', 'sintra', 'greater', 'porto', 'algarve', 'centre']
    regs = sorted(REGIONS, key=lambda r: order.index(r[0]))
    groups = [(r, [s for s in sorted(ss, key=key) if region(s) == r[0]]) for r in regs]
    groups = [(r, g) for r, g in groups if g]
    ordered = [s for _, g in groups for s in g]
    total = len(ordered)
    esc = lambda x: html.escape(x, quote=False)

    # all-schools page
    a = open(ALL, encoding='utf-8').read()
    secs = ''.join(
        f'    <section class="as-region" id="{r[0]}">\n      <h2>{r[1]} <span>{len(g)}</span></h2>\n      <ul>\n'
        + ''.join(f'        <li><a href="{s["url"]}">{esc(s["name"])}</a><span class="as-meta">{esc(s["loc"])} · {esc(s["prog"])} · {fees(s)}</span></li>\n' for s in g)
        + '      </ul>\n    </section>\n' for r, g in groups)
    start = a.index('    <section class="as-region" id="')
    end = a.index('    <section class="as-region" id="guides"')
    a = a[:start] + secs + a[end:]
    toc = ' '.join(f'<a href="#{r[0]}">{r[1]}</a>' for r, _ in groups)
    a = re.sub(r'(<div class="as-toc">).*?(<a href="#guides">)', lambda m: m.group(1) + toc + ' ' + m.group(2), a, flags=re.S)
    a = re.sub(r'\b\d+(?= Schools\)| Schools by Region| international and private schools| schools on Schools Reviews)', str(total), a)
    a = re.sub(r'(Every one of the )\d+', rf'\g<1>{total}', a)
    open(ALL, 'w', encoding='utf-8').write(a)

    # listing: ItemList, directory block, counts
    t = open(LISTING, encoding='utf-8').read()
    items = ',\n'.join(
        '    {\n      "@type": "ListItem",\n      "position": %d,\n      "name": %s,\n      "url": %s\n    }'
        % (k + 1, json.dumps(s['name'], ensure_ascii=False), json.dumps(SITE + s['url'])) for k, s in enumerate(ordered))
    t = re.sub(r'("itemListElement": \[\n).*?(\n  \]\n\})', lambda m: m.group(1) + items + m.group(2), t, count=1, flags=re.S)
    t = re.sub(r'"numberOfItems": \d+', f'"numberOfItems": {total}', t)
    cols = ''.join(f'    <div class="dir-col"><div class="dir-title">{r[1]}</div><ul>'
                   + ''.join(f'<li><a href="{s["url"]}">{esc(s["name"])}</a></li>' for s in g) + '</ul></div>\n'
                   for r, g in groups)
    t = re.sub(r'(<div class="dir-grid">\n).*?(    </div>\n  </div>\n</section>)', lambda m: m.group(1) + cols + m.group(2), t, count=1, flags=re.S)
    t = re.sub(r'(Compare )\d+( (?:international )?[Ss]chools)', rf'\g<1>{total}\g<2>', t)
    t = re.sub(r'(<strong id="heroCount">)\d+', rf'\g<1>{total}', t)
    t = re.sub(r'(<span id="listCount">)\d+', rf'\g<1>{total}', t)
    open(LISTING, 'w', encoding='utf-8').write(t)
    print('schools', total, {r[0]: len(g) for r, g in groups})


if __name__ == '__main__':
    main()
