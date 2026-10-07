"""The current illustrations (build_top.py) redrawn in trial palettes, at
800 wide, for the Colours menu on the local copy:
static/uploads/stories/trial/<letter>/<slug>-800.jpg (not kept in git)."""
import os, sys, re
src = open('build_top.py').read()
PALETTES = {
    'B': ('#d9412b', '#ec9a86', '#f7d9d1', '#2f55c9', '#8fa6e6', '#d9e1f7'),
    'C': ('#b9472f', '#dc9a84', '#f2dcd2', '#23396e', '#7d8fbd', '#d5dcec'),
    'D': ('#ef5b3f', '#f6a690', '#fde0d7', '#1f6f8b', '#86b6c6', '#d4e8ee'),
    'E': ('#c8273e', '#e88a97', '#f7d6db', '#3d8bd9', '#9cc6ee', '#dcebfa'),
    'F': ('#d49a1f', '#e8c26e', '#f6e7c4', '#1f2f4a', '#6f7f99', '#d6dbe4'),
    'G': ('#e5603a', '#f0a38a', '#fadcd1', '#4a5a6b', '#93a1ae', '#dde3e8'),
    'H': ('#f07a6a', '#f6b2a8', '#fde3df', '#4a2346', '#9b7598', '#e7dbe6'),
    # black and one colour: the cool set turns black and greys
    'I': ('#2a52d6', '#93a8ec', '#dde4fa', '#17181c', '#8b8e96', '#dfe1e5'),
    'J': ('#e0301e', '#f09a8f', '#fadcd8', '#17181c', '#8b8e96', '#dfe1e5'),
    'K': ('#0a8a5c', '#86c9ae', '#d6eee4', '#17181c', '#8b8e96', '#dfe1e5'),
    # black and blue, every picture on one field whatever its topic
    'L': ('#2a52d6', '#93a8ec', '#dde4fa', '#17181c', '#8b8e96', '#dfe1e5'),
    'M': ('#2a52d6', '#93a8ec', '#dde4fa', '#17181c', '#8b8e96', '#dfe1e5'),
    # three-colour sets: the lightest is the page (set in the site's menu, not here)
    'N': ('#7d1d2f', '#b86a77', '#ecd3d6', '#2a4bb3', '#8296d6', '#dce2f4'),
    'O': ('#a6d22f', '#cde58a', '#ecf5cf', '#5a4fcf', '#a39de6', '#e3e0f7'),
    'P': ('#e0607e', '#f0a3b4', '#fadbe2', '#5d6b2f', '#a3ad7c', '#e1e5d2'),
}
# one field for every topic (top, bottom), in place of the topic's own pair
ONE_FIELD = {'L': ('#1b1c21', '#383a42'), 'M': ('#2a52d6', '#5a7ce4')}
for letter in sys.argv[1:] or PALETTES:
    o, o2, o3, i, i2, i3 = PALETTES[letter]
    code = src.replace("for w in (1600, 800, 240):", "for w in (800,):")
    code = code.replace("f'{OUT}/{slug}-{w}.jpg'", "f'{OUT}/trial/" + letter + "/{slug}-{w}.jpg'")
    code = code.replace("\nrecord = {}\n", "\nC.PAL.update(o='%s', o2='%s', o3='%s', i='%s', i2='%s', i3='%s')\nos.makedirs(OUT + '/trial/%s', exist_ok=True)\nrecord = {}\n" % (o, o2, o3, i, i2, i3, letter))
    if letter in ONE_FIELD:
        t, b = ONE_FIELD[letter]
        code = code.replace("\nrecord = {}\n", "\nC.PAL.update(ft='%s', fb='%s')\nFIELD = {k: ('ft', 'fb') for k in FIELD}\nrecord = {}\n" % (t, b), 1)
    code = code.replace("json.dump(record, open('sources_top.json', 'w'), indent=1)", "pass")
    g = {'__name__': '__main__'}
    exec(compile(code, 'build_top.py', 'exec'), g)
    d = f"{g['OUT']}/trial/{letter}"
    os.system(f"cp '{d}/data-centerer-panir-hisab-keu-prokash-kore-na-800.jpg' '{d}/a-data-centres-day-800.jpg'")
    print('palette', letter, 'done')
