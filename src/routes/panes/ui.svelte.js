/* Shared by the layout, the Latest pane and the topics row: whether the
   pane is folded to its strip (wide screens), whether it's open as a
   panel (phones, where it has no room of its own), and whether the reader
   is deep in a story (`reading`), which folds the pane and lowers the
   topics row out of the way unless they've opened the pane again (`pin`). */
export const ui = $state({ folded: false, sheet: false, reading: false, pin: false });
