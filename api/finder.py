"""School Finder — Vercel Python function.

POST /api/finder  {"messages": [{"role": "user"|"assistant", "content": "..."}], "criteria": {...}}
→ {"reply", "understood", "next_question", "picks": [{"slug", "url", "name", "why"}], "criteria"}

The answer comes only from the site's own school pages (see _kb.py), passed to
Claude in a cached system prompt. ANTHROPIC_API_KEY lives in Vercel env vars.
"""
import hashlib
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import _kb  # noqa: E402

MODEL = 'claude-haiku-5-5'
OUTSIDE_LISBON = r'sintra|cascais|carcavelos|estoril|oeiras|taguspark|linh[oó]|amadora|barcarena|almada|set[uú]bal|palmela|colares|loures|odivelas|queluz'
MAX_MESSAGES = 10
MAX_CHARS = 1000
RATE_LIMIT = 30          # requests per IP per hour (per warm instance, best effort)
ALLOWED_ORIGINS = ('https://schools.reviews',)
ALLOWED_SUFFIX = '-raychukolga-1465s-projects.vercel.app'  # Vercel previews

RULES = """You are the School Finder on schools.reviews, an independent directory of international schools in Portugal.
You help parents find schools that fit their family. You answer ONLY from the school data below.

Rules:
- Use only the data below. If something is not there (class size, religion, exam results, places, waiting lists…), say it is "not listed on our page — worth asking the school". Never guess.
- Neutral tone. Never say "best", "top", "cheapest", "better", "worse" or rank schools by quality. Different schools suit different families.
- Fees: always quote the range shown on the school's page. Do not calculate a fee for the child's year.
- Do not promise places, discounts or admission dates.
- If a school is marked "NOT verified", never call its data verified.
- Be short: 1–2 sentences per reply, one question at a time.
- Never repeat back what the parent told you and do not start with thanks ("Thanks, that helps…", "Thanks for the details…"). The chips already show it.
- Reply format when you return picks: "I found <exact number of picks> schools — you can look at them now, or we can narrow it down." followed by the next question in one sentence. Nothing else.
- Reply format when you have no picks yet: just the next question in one sentence (plus a guide link if relevant).
- The next question must appear in "reply" (the site shows only its option buttons).
- Lisbon: when a parent says "Lisbon" and has not said whether that means the city only, return picks in Lisbon city only (schools whose Area names Lisbon / Lisbon City and NOT another municipality such as Sintra, Cascais, Carcavelos, Oeiras, Taguspark, Linhó, Alfragide/Amadora, Barcarena, Almada or Setúbal) and ask: "Only Lisbon city, or also nearby areas — Oeiras, Cascais, Sintra (about 20–30 minutes by car)?" with options ["Lisbon city only", "Include nearby areas", "Not sure"]. If they include nearby areas (or are not sure), add schools in Oeiras, Cascais / Estoril, Sintra and the rest of Greater Lisbon.
- IB: when a parent asks for IB and it is not yet clear which, ask: "Full IB from the early years to graduation (PYP, MYP and Diploma), or just the IB Diploma in the last two years?" with options ["Full IB (all years)", "IB Diploma only", "Not sure"], and always end the reply with: "Not sure of the difference? See our guide: https://schools.reviews/ib-diploma-explained.html". Full IB = schools whose programme is "Full IB"; IB Diploma only = any school offering the IB Diploma.
- Point to school pages and our guides when useful.
- Stay on choosing a school in Portugal. For anything else, politely bring the conversation back.
- Do not ask for names, emails, phone numbers or other personal data.
- Reply in the language the parent writes in. Chips in "understood", question options and "why" lines are ALWAYS in English, even when the parent writes in another language (the site is in English).

How to run the conversation:
- After each parent message, list what you understood as short chips (e.g. "Age 7", "IB", "Oeiras", "Up to €15k").
- Ask only for what is missing, one question at a time, with short options. Possible questions, in this order, skipping anything already known or irrelevant:
  1 children and ages · 2 start date (This school year / Next September / Later / Not sure) · 3 area (Lisbon city / Cascais / Estoril / Oeiras / Sintra / Porto / Algarve / Madeira / Other / Not decided) · 4 yearly budget per child (Up to €10k / €10–15k / €15–20k / €20k+ / Not sure yet / Budget isn't a deciding factor) · 5 teaching language (English / Portuguese / Bilingual EN + PT / French / German / Spanish / Dutch / No preference) · 6 curriculum (IB / British / Cambridge / American / National (country) curriculum / Montessori / alternative / Not sure — explain) · 7 importance of Portuguese · 8 all the way to graduation or the next few years · 9 class size · 10 religious ethos · 11 anything else.
  Do not ask about English-language support.
- Branching after 8: "all the way to graduation" (or a child aged 11+) → only schools that go to age 18; you may ask whether exam results and university pathways matter. "Next few years" → explain that schools ending at 10–12 or separate junior campuses are a normal option; you may ask about atmosphere (nature / outdoor learning, animals, forest school, Montessori).
- When the parent is not sure about the curriculum (or asks what the programmes are), answer right away from our guide, in 2–3 short neutral sentences, then link it. Summary of our guide: "Both IB and Cambridge are recognised by universities worldwide. IB is one programme with coursework, the Extended Essay and Theory of Knowledge, and builds analytical thinking and independence; Cambridge (IGCSE, then A Levels) is mainly exam-based and lets students specialise in fewer subjects — often a good fit for UK universities. Many Cambridge schools in Portugal also offer the IB Diploma in the last two years." End with: "More in our guide: https://schools.reviews/ib-vs-cambridge-which-is-better.html". Then ask one simple question that helps decide (e.g. whether the child prefers broad studies or specialising, or which country they may study in), and offer "No preference — show all" as an option.
- When the parent is not sure about the teaching language: one neutral sentence (most international schools teach in English; bilingual schools add strong Portuguese; national schools follow their own country's system) and link https://schools.reviews/school-year-grade-by-age-guide.html.
- As soon as you know the child's age plus an area OR a curriculum, you MUST return picks in that same reply, and you may still ask the next question. Do not wait for the budget or other answers before showing schools. Keep refining in later turns.
- If the parent names a curriculum + area (e.g. "British school near Cascais", "German school in Porto"), return picks even without an age.
- Topics our pages only partly cover (religion, class size, exam results): name the schools whose page mentions it, and say that for the other schools it is not listed on our page. Never say a school is "the only" one.
- "understood" holds only school-search criteria. Leave it empty for off-topic or general questions.
- picks: up to 8 schools that fit, in a sensible order (closest fit first). Each "why" is one short line based only on the data (e.g. "IB from age 3 · Oeiras · €11,790–€26,760/yr"). Do not put verification status in "why" (the card shows it). For fees always use the school's full range from the "Fees:" line, never one year group's fee. Use the exact slug from the data.
- If nothing fits, say so honestly, return no picks, and offer one criterion to relax as next_question options.
- General questions (e.g. IB vs Cambridge): answer briefly and link the guide; next_question may be null.

Always answer by calling the "respond" tool."""

TOOL = {
    'name': 'respond',
    'description': 'Reply to the parent and update the School Finder state.',
    'input_schema': {
        'type': 'object',
        'properties': {
            'reply': {'type': 'string', 'description': 'Text shown to the parent, 1–3 sentences.'},
            'understood': {'type': 'array', 'items': {'type': 'string'}, 'description': 'Short criteria chips.'},
            'next_question': {
                'type': ['object', 'null'],
                'properties': {
                    'id': {'type': 'string'},
                    'text': {'type': 'string'},
                    'options': {'type': 'array', 'items': {'type': 'string'}},
                    'multi': {'type': 'boolean'},
                },
                'required': ['id', 'text', 'options', 'multi'],
            },
            'picks': {
                'type': 'array',
                'items': {
                    'type': 'object',
                    'properties': {'slug': {'type': 'string'}, 'why': {'type': 'string'}},
                    'required': ['slug', 'why'],
                },
            },
            'criteria': {
                'type': 'object',
                'description': 'Structured criteria so far, e.g. {"ages":[7],"area":"oeiras","programme":["ib"],"budget_max":15000,"languages":["english"]}.',
            },
        },
        'required': ['reply', 'understood', 'next_question', 'picks', 'criteria'],
    },
}

_KB = None
_SYSTEM = None
_HITS = {}


def _load():
    global _KB, _SYSTEM
    if _KB is None:
        _KB = _kb.build()
        _SYSTEM = [
            {'type': 'text', 'text': RULES},
            {'type': 'text', 'text': _kb.as_prompt(_KB), 'cache_control': {'type': 'ephemeral'}},
        ]
        if _KB['warnings']:
            print(json.dumps({'kb_warnings': _KB['warnings']}))
    return _KB, _SYSTEM


def _redis(*commands):
    """Upstash Redis REST pipeline; returns None when the store is not configured or fails."""
    url = os.environ.get('KV_REST_API_URL') or os.environ.get('UPSTASH_REDIS_REST_URL')
    token = os.environ.get('KV_REST_API_TOKEN') or os.environ.get('UPSTASH_REDIS_REST_TOKEN')
    if not (url and token):
        return None
    try:
        req = urllib.request.Request(url.rstrip('/') + '/pipeline', data=json.dumps(list(commands)).encode(),
                                     headers={'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json'})
        with urllib.request.urlopen(req, timeout=3) as r:
            return [x.get('result') for x in json.load(r)]
    except Exception as e:  # noqa: BLE001 — the assistant must keep working without the store
        print(json.dumps({'redis_error': repr(e)[:200]}))
        return None


def _rate_ok(ip):
    # the IP is only hashed into a counter key that expires after an hour; it is never stored
    key = 'finder:rl:' + hashlib.sha256(('sr-finder|' + ip).encode()).hexdigest()[:16] + ':' + time.strftime('%Y%m%d%H')
    res = _redis(['INCR', key], ['EXPIRE', key, 3600])
    if res is not None:
        return int(res[0]) <= RATE_LIMIT
    now = time.time()  # fallback: per-instance memory
    hits = [t for t in _HITS.get(ip, []) if now - t < 3600]
    hits.append(now)
    _HITS[ip] = hits
    return len(hits) <= RATE_LIMIT


def _log(entry):
    """Anonymous query log: what parents ask, what we understood, which schools we showed."""
    line = json.dumps(entry, ensure_ascii=False)
    print(line)
    _redis(['LPUSH', 'finder:log', line], ['LTRIM', 'finder:log', 0, 99999])


def _clean_messages(raw):
    msgs = []
    for m in (raw or [])[-MAX_MESSAGES:]:
        role = m.get('role')
        text = str(m.get('content', ''))[:MAX_CHARS].strip()
        if role in ('user', 'assistant') and text:
            if msgs and msgs[-1]['role'] == role:
                msgs[-1]['content'] += '\n' + text
            else:
                msgs.append({'role': role, 'content': text})
    while msgs and msgs[0]['role'] != 'user':
        msgs.pop(0)
    return msgs


def ask(messages, criteria):
    """Call Claude and return the validated respond() payload."""
    kb, system = _load()
    msgs = _clean_messages(messages)
    if not msgs:
        raise ValueError('empty conversation')
    if criteria:
        msgs[-1]['content'] += '\n\n[Criteria collected so far: ' + json.dumps(criteria)[:800] + ']'
    body = {
        'model': MODEL,
        'max_tokens': 1200,
        'system': system,
        'tools': [TOOL],
        'tool_choice': {'type': 'tool', 'name': 'respond'},
        'messages': msgs,
    }
    return _finish(kb, body)


def _enough(c):
    has = lambda *keys: any(v not in (None, '', [], {}) for k, v in c.items() if any(x in k.lower() for x in keys))
    return (has('age') and (has('area', 'location', 'city') or has('programme', 'program', 'curriculum'))) or \
        (has('area', 'location', 'city') and has('programme', 'program', 'curriculum', 'language'))


def _call(body):
    req = urllib.request.Request(
        'https://api.anthropic.com/v1/messages',
        data=json.dumps(body).encode(),
        headers={
            'content-type': 'application/json',
            'x-api-key': os.environ['ANTHROPIC_API_KEY'],
            'anthropic-version': '2023-06-01',
        },
    )
    with urllib.request.urlopen(req, timeout=25) as r:
        return json.load(r)


def _finish(kb, body):
    data = _call(body)
    out = next(b['input'] for b in data['content'] if b.get('type') == 'tool_use')
    if not out.get('picks') and _enough(out.get('criteria') or {}):
        # the model sometimes keeps asking questions; parents should see schools as soon as possible
        body['messages'][-1]['content'] += '\n\n[Note from the site: there are enough criteria now — include picks in this reply.]'
        data = _call(body)
        out = next(b['input'] for b in data['content'] if b.get('type') == 'tool_use')
    q = out.get('next_question') or {}
    # the buttons belong to next_question, so the question in the text must be the same one
    if q.get('text') and q['text'] not in out.get('reply', ''):
        r = out.get('reply', '')
        m = re.search(r'[^.!?]*\?\s*$', r)
        out['reply'] = (r[:m.start()].rstrip() + ' ' + q['text']) if m else (r.rstrip() + ' ' + q['text'])
    if any('IB Diploma only' in o for o in q.get('options') or []) and 'ib-diploma-explained' not in out.get('reply', ''):
        out['reply'] = out.get('reply', '').rstrip() + ' Not sure of the difference? See our guide: https://schools.reviews/ib-diploma-explained.html'
    by_slug = {s['slug']: s for s in kb['schools']}
    raw = out.get('picks') or []
    # "Lisbon" means the city until the parent opts in to nearby areas (the model does not always hold to this)
    asked = ' '.join(m['content'] for m in body['messages'] if m['role'] == 'user').lower()
    area = json.dumps(out.get('criteria') or {}).lower()
    if 'lisbon' in area and not re.search(r'nearby|suburb|greater lisbon|not sure|oeiras|cascais|estoril|sintra|carcavelos|almada', asked + ' ' + area):
        city = [p for p in raw if p.get('slug') in by_slug and not re.search(OUTSIDE_LISBON, by_slug[p['slug']]['area'].lower())]
        if city:
            raw = city
            out['reply'] = re.sub(r'I found \d+ schools?', 'I found %d school%s' % (len(city), '' if len(city) == 1 else 's'), out.get('reply', ''))
    picks = []
    for p in raw:
        s = by_slug.get(p.get('slug'))
        if s and s['slug'] not in [x['slug'] for x in picks]:
            picks.append({'slug': s['slug'], 'id': s['id'], 'url': s['url'], 'name': s['name'], 'why': p.get('why', '')})
    out['picks'] = picks
    out['usage'] = data.get('usage', {})
    return out


class handler(BaseHTTPRequestHandler):
    def _origin_ok(self):
        o = self.headers.get('Origin')
        return not o or o in ALLOWED_ORIGINS or o.endswith(ALLOWED_SUFFIX)

    def _send(self, code, payload):
        b = json.dumps(payload, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Cache-Control', 'no-store')
        o = self.headers.get('Origin')
        if o and self._origin_ok():
            self.send_header('Access-Control-Allow-Origin', o)
            self.send_header('Vary', 'Origin')
        self.end_headers()
        self.wfile.write(b)

    def do_GET(self):
        # health check: no secrets, just whether the pieces are in place
        kb, _ = _load()
        store = _redis(['LLEN', 'finder:log'])
        return self._send(200, {'ok': True, 'schools': len(kb['schools']), 'key': bool(os.environ.get('ANTHROPIC_API_KEY')),
                                'store': store is not None, 'logged': store[0] if store else 0,
                                'errors': [w for w in kb['warnings'] if 'no assessment' not in w and 'no fee table' not in w]})

    def do_OPTIONS(self):
        self.send_response(204 if self._origin_ok() else 403)
        o = self.headers.get('Origin')
        if o and self._origin_ok():
            self.send_header('Access-Control-Allow-Origin', o)
            self.send_header('Access-Control-Allow-Methods', 'POST')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        if not self._origin_ok():
            return self._send(403, {'error': 'forbidden'})
        ip = (self.headers.get('x-forwarded-for') or '').split(',')[0].strip()
        if not _rate_ok(ip):
            return self._send(429, {'error': 'Too many questions in a short time — please try again later.'})
        try:
            n = min(int(self.headers.get('Content-Length') or 0), 20000)
            req = json.loads(self.rfile.read(n) or b'{}')
            out = ask(req.get('messages'), req.get('criteria'))
        except urllib.error.HTTPError as e:
            print(json.dumps({'api_error': e.code, 'body': e.read()[:300].decode('utf-8', 'replace')}))
            return self._send(502, {'error': 'The assistant is unavailable right now — please use the filters.'})
        except Exception as e:  # noqa: BLE001
            print(json.dumps({'error': repr(e)[:300]}))
            return self._send(400, {'error': 'Something went wrong — please try again.'})
        # anonymous log: what parents ask and what we understood (no IP, no personal data)
        last = next((m.get('content', '') for m in reversed(req.get('messages') or []) if m.get('role') == 'user'), '')
        _log({'t': time.strftime('%Y-%m-%d %H:%M'), 'q': str(last)[:300], 'understood': out.get('understood'),
              'picks': [p['slug'] for p in out['picks']], 'usage': out.pop('usage', {})})
        return self._send(200, out)
