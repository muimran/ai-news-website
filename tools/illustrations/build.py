"""All 46 story illustrations: the chosen cut-out for each story, in black
and white, on its topic's field, with grain; saved at two widths."""
import json, os
import numpy as np
from PIL import Image
import compose as C

OUT = '/Volumes/Work/13.GIT/ai_news_website/static/uploads/stories'
os.makedirs(OUT, exist_ok=True)
plan = json.load(open('plan.json'))

def cands(f):
    d = {}
    for line in open(f):
        q, _, rest = line.partition(':')
        d[q.strip()] = [x for x in rest.split() if x.startswith('photo-') and os.path.exists(f'allcut/{x}.png')]
    return d
A, B = cands('cands1.txt'), cands('cands2.txt')
PICK = {  # query -> (list, 1-based choice)
 'construction crane sky': (A, 1), 'ballot box': (B['ballot2'], 5), 'smartwatch white background': (A, 1),
 'headset headphones microphone white background': (A, 2), 'computer mouse white background': (A, 2),
 'fountain pen white background': (A, 2), 'instant polaroid camera': (A, 1), 'water tap faucet': (A, 1),
 'computer chip processor': (A, 1), 'old notebook journal': (A, 2), 'stack of books white background': (A, 1),
 'hard hat helmet white background': (B['helmet'], 1), 'studio microphone': (A, 1), 'gavel': (A, 3),
 'price tag': (A, 3), 'light bulb dark background': (A, 4), 'wedding rings': (A, 3), 'vintage typewriter': (A, 3),
 'vintage television set': (A, 4), 'filing cabinet': (B['archive box'], 1), 'wrench tool white background': (A, 3),
 'film clapperboard': (B['clapper'], 3), 'electrical switch lever': (A, 2), 'jenga tower': (A, 1), 'raised fist': (A, 2),
 'medicine pills blister pack': (A, 4), 'shipping container': (B['container'], 2), 'school desk chair': (A, 4),
 'dictionary book': (B['dictionary'], 1), 'power plug socket': (A, 1), 'receipt paper': (A, 3), 'open padlock': (A, 1),
 'handshake white background': (A, 2), 'house keys': (A, 4), 'letterpress type': (B['keyboard'], 3),
 'sewing machine': (A, 1), 'water valve pipe': (A, 3), 'motorcycle': (A, 2), 'stethoscope': (A, 1),
 'megaphone': (A, 4), 'magnifying glass': (A, 1), 'fingerprint': (A, 3), 'drone quadcopter': (A, 3),
}
FIELD = {'The AI Race': ('o', 'o2'), 'Machines and Power': ('i', 'i2'), 'Work After Automation': ('o3', 'o2'),
         'AI & Everyday Life': ('i3', 'i2'), 'Climate, Chips & Infrastructure': ('o2', 'i2'),
         'AI Across Bangladesh': ('i2', 'o2')}

def source(q):
    if q.startswith('='):
        return 'cut/' + q[1:] + '.png', q[1:]
    lst, n = PICK[q]
    ids = lst[q] if isinstance(lst, dict) else lst
    return f'allcut/{ids[n - 1]}.png', ids[n - 1]

# where the original photo cut the object off, its straight edge sits on the
# frame's edge it came from, not floating mid-frame
ANCHOR = {
    'the-ai-boom-is-reaching-places-investors-forgot-to-look': 'bottom',
    'the-next-ai-race-may-be-about-electricity-not-models': 'bottom',
    'the-mirpur-annotators-who-unionised-and-what-happened-next': 'bottom',
    'two-labs-one-grid-and-a-city-that-was-not-consulted': 'bottom',
    'what-happens-when-a-chatbot-becomes-your-co-worker': 'bottom',
    'nirbachone-bhuya-content-kothay-toiri-hoy': 'bottom',
    'when-the-regulator-and-the-regulated-share-the-same-consultants': 'top',
    'data-centerer-panir-hisab-keu-prokash-kore-na': 'top',
}

# now and then a texture in the field, drawn in the field's own colour (a
# shade darker on a light field, lighter on a dark one), chosen to suit
TEXTURE = {
    'the-next-ai-race-may-be-about-electricity-not-models': 'halftone',
    'chinese-open-weight-models-are-winning-on-price-not-benchmarks': 'halftone',
    'the-quiet-consolidation-of-the-ai-supply-chain': 'halftone',
    'bangla-bhashar-model-toiri-korchen-jara': 'halftone',
    'who-owns-the-data-generated-by-ordinary-life': 'grid',
    'what-a-data-broker-actually-sells-line-by-line': 'grid',
    'sadharon-jiboner-tothyer-malik-ke': 'grid',
    'the-hidden-workers-teaching-machines-how-to-see': 'grid',
    'synthetic-anchors-are-reading-the-news-on-four-dhaka-channels': 'lines',
    'the-film-industry-that-decided-to-label-everything': 'lines',
    'every-photo-you-posted-in-2011-is-still-working': 'lines',
    'a-voice-actor-is-suing-over-a-performance-she-never-gave': 'rings',
    'nirbachone-bhuya-content-kothay-toiri-hoy': 'rings',
    'the-procurement-documents-that-show-how-a-country-buys-surveillance': 'rings',
    'silheter-cha-bagane-drone-o-sromik': 'rings',
}

def texture(arr, kind, cx, cy):
    """blend the field towards a darker or lighter shade of itself where the
    texture is drawn"""
    from PIL import ImageDraw
    mask = Image.new('L', (C.W, C.H), 0)
    d = ImageDraw.Draw(mask)
    if kind == 'halftone':
        step = 30
        for yy in range(0, C.H + step, step):
            for xx in range(0, C.W + step, step):
                t = (xx / C.W * 0.6 + yy / C.H * 0.4)          # fades in across the frame
                r = step * 0.46 * max(0.0, t - 0.15) / 0.85
                if r > 1.2:
                    d.ellipse([xx - r, yy - r, xx + r, yy + r], fill=255)
    elif kind == 'grid':
        for xx in range(0, C.W, 80):
            d.rectangle([xx, 0, xx + 1, C.H], fill=255)
        for yy in range(0, C.H, 80):
            d.rectangle([0, yy, C.W, yy + 1], fill=255)
    elif kind == 'lines':
        for yy in range(0, C.H, 12):
            d.rectangle([0, yy, C.W, yy + 3], fill=255)
    elif kind == 'rings':
        for r in range(90, 2400, 70):
            d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=255, width=4)
    m = np.array(mask, float)[..., None] / 255
    # one direction for the whole image, from the field's overall brightness,
    # so a graded field shows no seam where it would otherwise flip
    shade = arr + (255 - arr) * 0.2 if arr.mean() < 165 else arr * 0.86
    return arr * (1 - m) + shade * m

def flat_bottom(path):
    a = np.array(Image.open(path).getchannel('A')) > 128
    return a[-1].mean() > 0.12

record = {}
for slug, (topic, q) in plan.items():
    path, pid = source(q)
    anchor = ANCHOR.get(slug) or ('bottom' if flat_bottom(path) else 'centre')
    top, bot = FIELD[topic]
    sub = C.subject(path, 'bw')
    # fit: rising from the foot, or centred in the box every crop keeps
    s = min((1120 if anchor == 'centre' else 1380) / sub.height, 1150 / sub.width)
    sub = sub.resize((round(sub.width * s), round(sub.height * s)), Image.LANCZOS)
    x = (C.W - sub.width) // 2
    y = {'bottom': C.H - sub.height, 'top': 0}.get(anchor, (C.H - sub.height) // 2)
    f = C.field(top, bot)
    if slug in TEXTURE:
        f = texture(f, TEXTURE[slug], x + sub.width // 2, y + sub.height // 2)
    bg = Image.fromarray(f.astype('uint8')).convert('RGBA')
    bg.alpha_composite(sub, (x, y))
    if slug == 'what-happens-when-a-chatbot-becomes-your-co-worker':
        C.bubbles(bg, sub, x, y)
    img = Image.fromarray(C.grain(np.array(bg.convert('RGB'), float), amount=5).astype('uint8'))
    for w in (1600, 800):
        img.resize((w, w * 2 // 3), Image.LANCZOS).save(f'{OUT}/{slug}-{w}.jpg', quality=80, optimize=True, progressive=True)
    record[slug] = pid
    print(f"{anchor:6} {pid}  {slug[:56]}")
json.dump(record, open('sources.json', 'w'), indent=1)
