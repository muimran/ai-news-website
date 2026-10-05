/* Shared by the layout, the Latest pane and the topics row: whether the
   pane is folded to its strip (wide screens), whether it's open as a
   panel (phones, where it has no room of its own), and whether the reader
   is deep in a story (`reading`), which folds the pane and lowers the
   topics row out of the way unless they've opened the pane again (`pin`). */
// `deep`: further in still, where a story's facts fold away too; `wide`: a
// story's wide photo is on screen, and the facts make way for it as well
// `up`: the reader is scrolling back up, which brings the header back;
// `begun`: just past the top, where a phone's header already leaves
export const ui = $state({ folded: false, sheet: false, reading: false, deep: false, wide: false, up: false, begun: false, pin: false, back: 'top-left' });
