"""Ground Truth photo-illustrations: one cut-out object on a field of the
site's colours, with grain. Every crop the site makes (tall cards, wide
story headers) keeps the object whole: it sits in the centre, or rises
from the bottom edge."""
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageOps, ImageEnhance, ImageFilter

W, H = 2400, 1600
HEX = lambda h: tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))
PAL = {'o': '#e07a3f', 'o2': '#eeab84', 'o3': '#f6dccb', 'i': '#5f5e9c', 'i2': '#9c9bc9', 'i3': '#d7d7ec',
       'ink': '#111318', 'paper': '#e9ebee'}

def field(top, bottom):
    t, b = np.array(HEX(PAL[top]), float), np.array(HEX(PAL[bottom]), float)
    y = np.linspace(0, 1, H)[:, None, None] ** 1.4
    return np.broadcast_to(t * (1 - y) + b * y, (H, W, 3)).copy()

def grain(arr, amount=7, seed=1):
    rng = np.random.default_rng(seed)
    n = rng.normal(0, amount, (H, W, 1))
    return np.clip(arr + n, 0, 255)

def subject(path, mode):
    im = Image.open(path).convert('RGBA')
    a = im.getchannel('A')
    rgb = im.convert('RGB')
    if mode == 'bw':
        g = ImageOps.autocontrast(ImageOps.grayscale(rgb), cutoff=1)
        rgb = Image.merge('RGB', (g, g, g))
    else:
        rgb = ImageEnhance.Color(rgb).enhance(0.85)
    a = a.filter(ImageFilter.GaussianBlur(0.6))
    return Image.merge('RGBA', (*rgb.split(), a))

def place(canvas, sub, h, anchor):
    s = h / sub.height
    sub = sub.resize((round(sub.width * s), round(sub.height * s)), Image.LANCZOS)
    x = (W - sub.width) // 2
    y = H - sub.height if anchor == 'bottom' else (H - sub.height) // 2
    canvas.alpha_composite(sub, (x, y))
    return sub, x, y

def bubbles(canvas, sub, x, y):
    """two chat bubbles on the phone's blank screen, a conversation, above
    the thumb (and drawn only where the screen itself shows)"""
    arr = np.array(sub)
    rgb, al = arr[..., :3].astype(int), arr[..., 3]
    lum = rgb.mean(-1); sat = rgb.max(-1) - rgb.min(-1)
    m = (lum > 205) & (sat < 25) & (al > 200)
    ys, xs = np.nonzero(m)
    x0, x1 = np.percentile(xs, [3, 97]); y0, y1 = np.percentile(ys, [3, 97])
    sw, sh = x1 - x0, y1 - y0
    layer = Image.new('RGBA', sub.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    r = sw * 0.07
    bx0, bx1 = x0 + sw * 0.08, x1 - sw * 0.08
    d.rounded_rectangle([bx0, y0 + sh * 0.12, bx0 + sw * 0.64, y0 + sh * 0.27], r, fill=HEX(PAL['i']) + (255,))
    d.rounded_rectangle([bx1 - sw * 0.56, y0 + sh * 0.33, bx1, y0 + sh * 0.45], r, fill=HEX(PAL['o']) + (255,))
    screen = Image.fromarray((m * 255).astype('uint8')).filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(1))
    la = np.array(layer.getchannel('A')).astype(float) * np.array(screen).astype(float) / 255
    layer.putalpha(Image.fromarray(la.astype('uint8')))
    canvas.alpha_composite(layer, (x, y))

JOBS = {
    'electricity': dict(src='cut/photo-1596072215997-cac821d05b9c.png', top='o', bottom='o2', h=1500, anchor='bottom'),
    'surveillance': dict(src='cut/photo-1528312635006-8ea0bc49ec63.png', top='i', bottom='i2', h=900, anchor='centre'),
    'coworker': dict(src='cut/photo-1629697776809-f37ceac39e77.png', top='o3', bottom='o2', h=1450, anchor='bottom', screen=True),
}

for name, j in JOBS.items():
    for mode in ('colour', 'bw'):
        bg = Image.fromarray(field(j['top'], j['bottom']).astype('uint8')).convert('RGBA')
        sub, x, y = place(bg, subject(j['src'], mode), j['h'], j['anchor'])
        if j.get('screen'):
            bubbles(bg, sub, x, y)
        out = grain(np.array(bg.convert('RGB'), float))
        Image.fromarray(out.astype('uint8')).save(f'out/{name}-{mode}.jpg', quality=84, optimize=True, progressive=True)
        print(name, mode)
