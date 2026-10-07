"""The illustrations recomposed for words at the top of a card: every object
kept in the lower part of the frame, the top left as plain field."""
import json, os
import numpy as np
from PIL import Image
src = open('build.py').read()
exec(src.split('record = {}')[0])

TAP = (A['water valve pipe'] + A['water tap faucet'])[7]   # a brass tap, dripping, whole
FLIP = {'when-the-regulator-and-the-regulated-share-the-same-consultants'}

record = {}
# ONLY=slug,slug rebuilds just those
ONLY = set(filter(None, os.environ.get('ONLY', '').split(',')))
for slug, (topic, q) in plan.items():
    if ONLY and slug not in ONLY:
        continue
    path, pid = source(q)
    if slug == 'data-centerer-panir-hisab-keu-prokash-kore-na':
        path, pid = f'allcut/{TAP}.png', TAP
    sub = C.subject(path, 'bw')
    if slug in FLIP:
        sub = sub.transpose(Image.FLIP_TOP_BOTTOM)
        anchor = 'bottom'
    else:
        a = ANCHOR.get(slug)
        anchor = a if a == 'bottom' else ('bottom' if flat_bottom(path) else 'centre')
    top, bot = FIELD[topic]
    if anchor == 'bottom':
        s = min(0.60 * C.H / sub.height, 1150 / sub.width)
    else:
        s = min(0.44 * C.H / sub.height, 1000 / sub.width)
    sub = sub.resize((round(sub.width * s), round(sub.height * s)), Image.LANCZOS)
    x = (C.W - sub.width) // 2
    y = C.H - sub.height if anchor == 'bottom' else round(0.70 * C.H - sub.height / 2)
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
    print(f"{anchor:6} {y/C.H:.2f} {slug[:56]}")
if not ONLY:
    json.dump(record, open('sources_top.json', 'w'), indent=1)
