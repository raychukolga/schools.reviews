"""Export all private Portuguese schools (ptPrivate) from the listing to an Excel file for the editor.
Usage: python3 tools/export_pt_private.py ~/Downloads/schools_reviews_portuguese_private.xlsx"""
import os, re, sys
from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill

NUM = r'(\d+)'
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NOTES = {  # what changed versus the editor's source file / earlier page
    'Colégio Planalto': ('Updated', '18 Nov 2026', 'Was marked international; boys only from Grade 1; official 2026/27 fees (were estimates €6,000–€10,000)'),
    'Colégio Luso-Francês': ('Updated', '18 Nov 2026', 'Was marked British/French; official 2026/27 fees; Grade 13 removed'),
    'Colégio Cesário Verde': ('Updated', '18 Nov 2026', 'Was "Cesário Verde Int\'l School (SEK)", listed as IB; no IB, only up to Grade 9; renamed, new URL'),
    'Colégio Moderno': ('New page', '18 Nov 2026', 'Your file says Catholic — the school says it is secular (escola laica); fees updated to 2026/27'),
    'Colégio Valsassina': ('New page', '18 Nov 2026', 'Fees updated to 2026/27'),
    'Colégio São João de Brito': ('New page', '18 Nov 2026', 'Fees 2026/27 added (missing in your file)'),
    'Colégio Manuel Bernardes': ('New page', '18 Nov 2026', 'Address and website added (cmb.pt); fees updated to 2026/27'),
    'Colégio Mira Rio': ('New page', '18 Nov 2026', 'Fees updated to 2026/27 (same price list as Planalto)'),
    'Colégio de São Tomás': ('New page', '18 Nov 2026', 'Website in your file is dead — the school is now colegiodestomas.com; fees 2026/27 added; 2 campuses (Quinta das Conchas, Sete Rios)'),
    'Salesianos de Lisboa': ('New page', '18 Nov 2026', 'Fees not published online — page says "on request"; merit scholarships and state support added'),
    'Colégio do Sagrado Coração de Maria': ('New page', '18 Nov 2026', 'Fees updated to 2026/27; address added (Av. Manuel da Maia 2)'),
    'Colégio Pedro Arrupe': ('New page', '18 Nov 2026', 'Fees updated to 2026/27; owned by the Alves Ribeiro group with Jesuit collaboration'),
    'Colégio Oriente': ('New page', '18 Nov 2026', 'Fees updated to 2026/27 (nursery from 6 months)'),
    'Colégio de Santa Maria': ('New page', '18 Nov 2026', 'Website in your file is dead — the school is colegiodesantamaria.pt; fees 2026/27; only up to Grade 9'),
    'Externato Marista de Lisboa': ('New page', '18 Nov 2026', 'Website in your file is dead — the school is ext.marista-lisboa.org; fees updated to 2026/27'),
    'Colégio Vasco da Gama': ('New page', '18 Nov 2026', 'Not in Lisbon — it is in Meleças, Sintra; part of International Schools Partnership; tuition not published online'),
    'Colégio Amor de Deus': ('New page', '18 Nov 2026', 'Website in your file is dead — the school is cad.edu.pt; fees updated to 2026/27'),
    'Colégio Marista de Carcavelos': ('New page', '18 Nov 2026', 'Fees not published online (price page is empty)'),
    'Colégio Quadrante': ('New page', '18 Nov 2026', 'Not in your file — added on request; To Be Schools group; nursery to Grade 6; fees 2025/26 (2026/27 not published)'),
    'Colégio Atlântico': ('New page', '18 Nov 2026', 'Fees updated to 2026/27 (11 instalments); IB Diploma option in secondary (€8,580/yr)'),
    'Colégio Guadalupe': ('New page', '18 Nov 2026', 'Fees not published online — page says "on request"; dual Portuguese–Cambridge track (AICE Diploma)'),
    'Colégio Campo de Flores': ('New page', '18 Nov 2026', 'Fees 2026/27 (10 instalments); school buses; optional US Dual Diploma'),
    'Colégio Frei Cristóvão': ('Skipped', '18 Nov 2026', 'Website in your file redirects to an unrelated site; no school of this name found in Azeitão (a Colégio Frei Cristóvão exists in Caldas da Rainha)'),
    'Colégio Rainha D. Leonor': ('New page', '19 Nov 2026', 'Fees 2026/27 (annual €4,950–€5,400); Cambridge International School; founded 2005'),
    'Externato Cooperativo da Benedita': ('Skipped', '19 Nov 2026', 'State-funded contract school (contrato de associação) — not a fee-paying private school; no website'),
    'Externato Dom Fuas Roupinho': ('Skipped', '19 Nov 2026', 'Free state/EU-funded vocational school (Grades 10–12 only) — not a fee-paying private school'),
    'Externato de Penafirme': ('Skipped', '19 Nov 2026', 'State-funded contract school, free for local pupils — not a fee-paying private school'),
    'Grande Colégio Universal': ('New page', '19 Nov 2026', 'Fees updated to 2026/27 (€4,170–€4,920/yr); founded 1910; website moved to gcolegiouniversal.com'),
    'Colégio Nossa Senhora do Rosário': ('New page', '19 Nov 2026', 'Fees 2026/27 are monthly (€604.50–€687.50); annual shown as about ×10; RSCM sisters, since 1872'),
    'Colégio Efanor': ('New page', '19 Nov 2026', 'Fees 2026/27 checked (€6,620–€7,800/yr); Belmiro de Azevedo Foundation; founded 2008'),
    'Colégio Cedros': ('New page', '19 Nov 2026', 'Boys only from Grade 1 (Fomento); fees 2025/26 — 2026/27 not published'),
    'Colégio Horizonte': ('New page', '19 Nov 2026', 'Girls only from Grade 1 (Fomento); in Vila Nova de Gaia, not Porto; listed twice in your file; fees 2025/26'),
    'Colégio Horizonte Porto': ('Duplicate', '19 Nov 2026', 'Same school as Colégio Horizonte'),
    'Colégio Luso Internacional do Porto?': ('Duplicate', '19 Nov 2026', 'Same school as CLIP — Oporto International School, already on the site'),
    'Salesianos de Manique': ('New page', '18 Nov 2026', 'Website in your file is dead — the school is manique.salesianos.pt; Grades 1–12; fees not published'),
    'Externato Nossa Senhora do Rosário': ('New page', '18 Nov 2026', 'Website in your file is dead — the school is ensr.salesianas.pt; Grades 5–12 only; fees 2026/27 (monthly)'),
    'Colégio Quinta do Lago': ('New page', '18 Nov 2026', 'Fees not published online; nursery to Grade 9'),
}


def main(out):
    t = open(os.path.join(ROOT, 'international-private-schools-portugal.html'), encoding='utf-8').read()
    i = t.find('const schools'); body = t[i:t.find('\n];', i)]
    j = re.search(r'schoolPages\s*=\s*\{', t).end()
    pages = {int(a): b for a, b in re.findall(r"(\d+)\s*:\s*'(/[^']+\.html)'", t[j:t.find('}', j)])}
    rows = []
    for item in re.split(r'\n\s*\{\s*id:', body)[1:]:
        if 'ptPrivate:true' not in item:
            continue
        sid = int(re.match(r'\s*(\d+)', item).group(1))
        g = lambda k, p=r'"([^"]*)"': (re.search(r'\b' + k + r':\s*' + p, item) or [None, None])[1]
        name = g('name')
        page = open(os.path.join(ROOT, pages[sid].lstrip('/')), encoding='utf-8').read()
        owner = re.search(r'Owner / type</div>\s*<div class="profile-val">([^<]*)', page)
        lo, hi = g('price', NUM), g('priceMax', NUM)
        fees = f'€{int(lo):,} – €{int(hi):,}' if lo and hi else (f'from €{int(lo):,}' if lo else 'on request')
        st, date, note = NOTES.get(name, ('', '', ''))
        rows.append([name, st, date, g('loc'), owner.group(1).strip() if owner else '', g('prog'),
                     '%s–%s' % (g('ageFrom', NUM), g('ageTo', NUM)), fees,
                     ('Verified ' + g('verDate')) if 'verified:true' in item else 'Not yet — please review',
                     'https://schools.reviews' + pages[sid], g('website'), note])
    wb = Workbook(); ws = wb.active; ws.title = 'Portuguese private schools'
    head = ['School', 'On the site', 'Date', 'Area', 'Type / owner', 'Programme', 'Ages', 'Tuition 2026/27 (per year)',
            'Verified', 'Page on schools.reviews', 'School website', 'What changed vs your file / old page']
    ws.append(head)
    for r in rows:
        ws.append(r)
    for c in ws[1]:
        c.font = Font(bold=True, color='FFFFFF'); c.fill = PatternFill('solid', fgColor='C4633A')
    for col, w in zip('ABCDEFGHIJKL', [30, 12, 13, 22, 50, 24, 8, 22, 22, 55, 30, 70]):
        ws.column_dimensions[col].width = w
    for row in ws.iter_rows(min_row=2):
        for c in row:
            c.alignment = Alignment(wrap_text=True, vertical='top')
        row[9].hyperlink = row[9].value
    ws.freeze_panes = 'B2'
    wb.save(os.path.expanduser(out))
    print(len(rows), 'schools ->', out)


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else '~/Downloads/schools_reviews_portuguese_private.xlsx')
