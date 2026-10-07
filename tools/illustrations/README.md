# Story illustrations

How the photo-illustrations in `static/uploads/stories/` are made: one object
cut out of a free Unsplash photo, set in black and white on its topic's
colours, with grain. Run on a Mac (the cut-out uses macOS Vision).

- `plan.json`: each story's topic and the search used for its object.
- `cands1.txt`, `cands2.txt`: the Unsplash photo ids found for each search.
- `cut.swift`: cuts the object out of a photo (macOS Vision foreground mask);
  the cut-outs are PNGs in `allcut/`, the downloaded photos in `allsrc/`.
- `compose.py`: the palette, the colour field, grain, the chat bubbles.
- `build.py`: the first version (objects up to most of the frame's height).
- `build_top.py`: **the current one.** Objects kept in the lower part of the
  frame (from 40% down), so the card's words can stand on plain colour at the
  top. Hands that hung from the top edge are flipped to rise from the bottom;
  the water stories use a whole brass tap.
- `thumbs.mjs`: makes the 240-wide copies (search results use them); run it
  after rebuilding: `node tools/illustrations/thumbs.mjs`.
- `sources_top.json`: which Unsplash photo each story's image came from (the
  same ids are in `PHOTOS` in `src/lib/site/reel.js`, for credit).

The downloaded photos and cut-outs (about 230 MB) are not kept in the repo;
every one can be downloaded again from Unsplash by its id
(`https://images.unsplash.com/<id>`) and cut again with `cut.swift`.
Scripts expect `allsrc/`, `allcut/` and `cut/` beside them and write straight
into `static/uploads/stories/`.
