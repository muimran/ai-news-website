/** A list's second page or later: /page/2, /page/3 … (the first is the list's own address). */
export const match = (param) => /^[1-9]\d*$/.test(param) && Number(param) > 1;
