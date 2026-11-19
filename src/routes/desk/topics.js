/* Topics Desk leaves out: not on its front, in its side list or menus, and
   not counted when topics are numbered. Their stories stay on Desk, found by
   link, search and the formats; their topic pages still answer. */
export const DESK_DROPPED = new Set(['Work After Automation', 'Climate, Chips & Infrastructure']);

export const onDesk = (key) => !DESK_DROPPED.has(key);
