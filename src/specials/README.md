# Specials

A special is a story whose page is built by hand, not from the usual story
layout: a scrollytelling piece, an interactive chart, a map.

1. **Make the story in the CMS as usual** (headline, summary, writer, topic,
   date, image) and set **Layout** to *Special*. That record is what puts the
   story in the reel, Latest, its topic, search and the writer's page.
2. **Add `src/specials/<address>.svelte`**, named after the story's address
   (its slug, e.g. `a-data-centres-day.svelte` for
   `/2026/09/a-data-centres-day`). The story page finds it and shows it in
   place of the usual layout, at the story's own address.

The component gets two props:
- `story`: the CMS record (title, dek, author, date, section, ...)
- `lang`: `'en'` or `'bn'`. A Bangla translation shares its original's
  address, so one special can serve both editions.

Two layouts (the CMS's **Layout** field):
- **Special**: inside the site's frame (header, Close), as below.
- **Special — full screen**: nothing of the site at all, only your page,
  plus one small "Second Order ✕" in the top-left corner to go back. Use it
  when the piece is its own design from edge to edge.

The full-screen "Second Order ✕" can move, or go, from the special itself:

```svelte
<script module>
  export const back = 'bottom-right'; // 'top-left' (default), 'top-right', 'bottom-left', or false
</script>
```

It's a plain link with the class `away`, so a special may restyle it with
`:global(.away) { ... }`. Before setting `false`, give readers another way
back to Second Order, and keep the piece recognisably ours when it's shared.

Inside the frame, it sits like this: the header lies over its top on arrival
(leave about 6rem of room there, or start with a picture) and leaves as the
reader scrolls; Close goes back to where they were. Use the site's colour
tokens (`--ink`, `--paper`, `--o`, `--i`, ...) so it fits both light and dark.
Anything else is up to the special: its own layout, fonts, libraries.

`a-data-centres-day.svelte` is a small working example.
