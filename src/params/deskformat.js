import { DESK_FORMATS } from '../routes/desk/formats.js';

/* /desk/en/investigations, /desk/en/video…: a Desk format's page */
export const match = (param) => DESK_FORMATS.some((f) => f.slug === param);
