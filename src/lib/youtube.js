/** The 11-character id of a YouTube link (watch, youtu.be, embed or
    shorts), or null for anything else. */
export const ytId = (url) =>
  (typeof url === 'string' &&
    url.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/))([\w-]{11})/)?.[1]) ||
  null;
