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
    'Colégio D. Diogo de Sousa': ('New page', '20 Nov 2026', 'Website in your file is dead — the school is cdds.pt; Archdiocese of Braga, since 1949; fees not published'),
    'Colégio Novo da Maia': ('New page', '20 Nov 2026', 'Fees 2026/27 are paid ×11 (not ×10); top national rankings per the school; lunch extra from Grade 1'),
    'Colégio Salesianos Porto': ('New page', '20 Nov 2026', 'Shown as “Salesianos do Porto”; current school opened in the former Colégio dos Órfãos building (bought 2011), not 1882; fees not published'),
    'Colégio Ribadouro': ('New page', '20 Nov 2026', 'Fees 2026/27 ×11 (€4,455–€5,940/yr); main site ribadouro.com'),
    'Colégio D. Duarte': ('Skipped', '20 Nov 2026', 'School closed in 2024 (website says “Colégio Encerrado”)'),
    'Colégio Paulo VI': ('New page', '20 Nov 2026', 'Fees 2026/27: nursery ×11, other levels ×10 (€4,144–€5,642/yr); secondary scholarships'),
    'Didáxis - Cooperativa de Ensino': ('New page', '20 Nov 2026', 'Regular school (Riba de Ave) is fee-paying: €3,025–€3,430/yr 2026/27; Grades 1–12 only; the separate vocational school is free (not listed)'),
    'Colégio de Gaia': ('New page', '20 Nov 2026', 'Real website is colgaia.pt (not colegiogaia.pt); pre-school to Grade 12, not only to Grade 9; fees not published'),
    'Colégio de Nossa Senhora da Bonança': ('New page', '20 Nov 2026', 'Nursery to Grade 12 + girls’ boarding; fees not published; contratos simples/desenvolvimento'),
    'Colégio Nova Encosta': ('New page', '20 Nov 2026', 'Grades 1–12 (founded 2011); fees not published, paid ×11'),
    'Colégio João Paulo II': ('New page', '20 Nov 2026', 'School is in PORTIMÃO (Algarve), not Braga; nursery to Grade 4; latest fees 2024/25 (×12)'),
    'Colégio Internato dos Carvalhos': ('Skipped', '20 Nov 2026', 'Professional courses, teaching free (co-financed Pessoas 2030) — not a fee-paying school'),
    'Colégio D. Maria II': ('Skipped', '20 Nov 2026', 'Website aedonamaria.pt is a state school cluster (Agrupamento de Escolas)'),
    'Colégio Júlio Dinis': ('Skipped', '20 Nov 2026', 'Website in file is the state school cluster in Gondomar; private Colégio Júlio Dinis (Porto) is already on the site as CJD International School'),
    'Externato Infante D. Henrique': ('Skipped', '20 Nov 2026', 'Alfacoop cooperative: no fees published, historically contrato de associação — not confirmed as fee-paying'),
    'Colégio Rainha Santa Isabel': ('New page', '23 Nov 2026', 'Fees 2025/26 (€3,350–€4,560/yr, 10 instalments) — 2026/27 not published; Sisters of St Joseph of Cluny, since 1900; “Colégio da Rainha Santa Isabel” in your file is the same school'),
    'Colégio da Rainha Santa Isabel': ('Duplicate', '23 Nov 2026', 'Same school as Colégio Rainha Santa Isabel'),
    'Colégio de São José (Coimbra)': ('New page', '23 Nov 2026', 'Your file says Dominican sisters — the Coimbra school is Schoenstatt-based (Colégio São José, Lda.); Portuguese track to Grade 9 + US Clonlara programme Grades 1–12; tuition not published'),
    'Colégio Bissaya Barreto': ('New page', '23 Nov 2026', 'Grades 1–9 only (no pre-school); Bissaya Barreto Foundation, since 2003; real site cbb.fbb.pt; tuition not published'),
    'Colégio São Teotónio': ('Skipped', '23 Nov 2026', 'Site says it is part of the state network, funded for Grades 5–9; other levels paid but fees not published — not added (editor’s decision)'),
    'Colégio de São Pedro': ('Skipped', '23 Nov 2026', 'No school of this name found in Coimbra (Colégio de São Pedro is a University of Coimbra building)'),
    'Instituto Educativo de Lordemão': ('Skipped', '23 Nov 2026', 'Former contrato de associação school; no website or current information found'),
    'Colégio de Quiaios': ('Skipped', '23 Nov 2026', 'Former contrato de associação school; no website found'),
    'Colégio de São Martinho': ('Skipped', '23 Nov 2026', 'Location unknown; no school found'),
    'Instituto de Almalaguês': ('Skipped', '23 Nov 2026', 'Former contrato de associação school; no website or current information found'),
    'Centro de Estudos Educativos de Ançã': ('Skipped', '23 Nov 2026', 'Former contrato de associação school; no website or current information found'),
    'Colégio da Imaculada Conceição (Cernache)': ('Skipped', '23 Nov 2026', 'Former contrato de associação school; no website or current information found'),
    'Instituto Pedro Hispano': ('Skipped', '23 Nov 2026', 'In Soure; former contrato de associação school; no website found'),
    'Instituto Educativo de Souselas': ('Skipped', '23 Nov 2026', 'Lost its state contract and had no pupils by 2019'),
    'Colégio de São José - Irmãs Dominicanas': ('Skipped', '23 Nov 2026', 'No Dominican school of this name found in Coimbra; the Coimbra Colégio de São José is added separately'),
    'Instituto D. João V': ('Skipped', '23 Nov 2026', 'Louriçal (Pombal) is a contrato de associação area in 2026/27 (AGSE notice) — free state-funded classes'),
    'Colégio João de Barros': ('Skipped', '23 Nov 2026', 'Meirinhas (Pombal) is a contrato de associação area in 2026/27 (AGSE notice)'),
    'Instituto Educativo do Juncal': ('Skipped', '23 Nov 2026', 'Juncal (Porto de Mós) is a contrato de associação area in 2026/27 (AGSE notice)'),
    'Colégio Senhor dos Milagres': ('Skipped', '23 Nov 2026', 'Milagres (Leiria) is a contrato de associação area in 2026/27 (AGSE notice)'),
    'Colégio Conciliar Maria Imaculada': ('Skipped', '23 Nov 2026', 'Leiria city is a contrato de associação area in 2026/27 (AGSE notice)'),
    'Colégio Nossa Senhora de Fátima': ('Skipped', '23 Nov 2026', 'Small primary school in Leiria; no website, fees not confirmed'),
    'Colégio São Mamede': ('Skipped', '23 Nov 2026', 'Batalha; former contrato de associação school; no website or fees found'),
    'Colégio da Via-Sacra': ('New page', '23 Nov 2026', 'Founded 1908, not 1928; Grades 1–9 only (no pre-school/secondary); was free under a state contract from 1998 — 2026/27 fee €3,750/yr for all grades'),
    'Salesianos de Évora': ('New page', '23 Nov 2026', 'Nursery to Grade 12; fees not published (9 monthly payments); merit scholarships for Grades 10–12; free Cambridge exam for every pupil'),
    'Colégio do Espírito Santo': ('Duplicate', '23 Nov 2026', 'The website in your file redirects to Salesianos de Évora; Colégio do Espírito Santo in Évora is the University of Évora building'),
    'Colégio Luso-Internacional do Centro': ('Duplicate', '23 Nov 2026', 'CLIC in Marinha Grande = Leiria International School, already on the site'),
    'Colégio Luso-Internacional de Braga (CLIB)': ('Duplicate', '23 Nov 2026', 'Already on the site as CLIB — The Braga International School'),
    'Colégio da Imaculada Conceição - Viseu': ('Skipped', '23 Nov 2026', 'Former contrato de associação school; no website or current information found'),
    'Escola Jean Piaget': ('Skipped', '23 Nov 2026', 'Escola Básica e Secundária Jean Piaget, Viseu: no website or fees found'),
    'Colégio Dinis de Melo': ('Skipped', '23 Nov 2026', 'In Amor (Leiria), not Castelo Branco — a contrato de associação area in 2026/27 (AGSE notice)'),
    'Colégio do Alto': ('New page', '23 Nov 2026', 'Added as Colégio de Nossa Senhora do Alto (editor\'s decision) — no website, no information'),
    'Colégio Penas Real': ('New page', '23 Nov 2026', 'Not in your file (your second list). Alcochete, nursery–Grade 6; 2026/27 €590–600 × 12 incl. meals'),
    'Colégio de Nossa Senhora da Conceição': ('New page', '23 Nov 2026', 'Not in your file (your second list). Guimarães (Candoso), nursery–Grade 9; 2026/27 €325–396 × 11; Cambridge partner'),
    'Colégio Santo André': ('New page', '23 Nov 2026', 'Not in your file (your second list). Venda do Pinheiro (Mafra), Grades 1–12; Grades 1–9 ~€5,000/yr; secondary charges no tuition'),
    'Real Colégio de Portugal': ('New page', '23 Nov 2026', 'Not in your file (your second list). Paço do Lumiar, Lisbon, nursery–Grade 12; 2026/27 €476–554 × 11; US Dual Diploma'),
    'Academia de Música de Santa Cecília': ('New page', '23 Nov 2026', 'Not in your file (your second list). Ameixoeira, Lisbon, age 3–Grade 12, integrated music; 2026/27 €574–673 × 10'),
    'Externato das Escravas do Sagrado Coração de Jesus': ('New page', '23 Nov 2026', 'Not in your file (your second list). Porto, pre-school–Grade 9; fees not published; contratos simples/desenvolvimento'),
    'Colégio de Nossa Senhora do Alto': ('New page', '23 Nov 2026', '⚠ NO INFORMATION AT ALL — no website; fees, grades, hours and contacts must be requested from the school'),
    'Colégio Internacional de Faro': ('Skipped', '23 Nov 2026', 'No school of this name found'),
    'Colégio Laura Vicunha': ('Skipped', '23 Nov 2026', 'Fee-paying school in Vendas Novas, but no website or fees found'),
    'Externato António Sérgio': ('Skipped', '23 Nov 2026', 'No school of this name found in Beringel'),
    'Salesianos de Manique':('New page', '18 Nov 2026', 'Website in your file is dead — the school is manique.salesianos.pt; Grades 1–12; fees not published'),
    'Externato Nossa Senhora do Rosário': ('New page', '18 Nov 2026', 'Website in your file is dead — the school is ensr.salesianas.pt; Grades 5–12 only; fees 2026/27 (monthly)'),
    'Colégio Quinta do Lago': ('New page', '18 Nov 2026', 'Fees not published online; nursery to Grade 9'),
}


# schools added without any information: their rows are highlighted in the report
NO_INFO = {'Colégio de Nossa Senhora do Alto'}


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
        if row[0].value in NO_INFO:
            for c in row:
                c.fill = PatternFill('solid', fgColor='FF0000'); c.font = Font(bold=True, color='FFFFFF')
    ws.freeze_panes = 'B2'
    wb.save(os.path.expanduser(out))
    print(len(rows), 'schools ->', out)


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else '~/Downloads/schools_reviews_portuguese_private.xlsx')
