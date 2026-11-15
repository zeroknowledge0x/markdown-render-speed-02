// parse.js - the drop-in this entry races: parse(markdown) returns, for every string, exactly the
// HTML marked 18.1.3 renders with marked's default options (gfm true, breaks false, pedantic false,
// async false), and is meant to be the faster of the two.
//
// The reference is vendored byte for byte at vendor/marked/marked.esm.js (MIT: vendor/marked/LICENSE,
// vendor/marked/NOTICE). The faster paths live in this file; anything they do not claim falls back to
// the vendored reference, so every construct keeps marked's own answer.

import { marked } from './vendor/marked/marked.esm.js';

/** The HTML marked 18.1.3 renders for `markdown`, with marked's default options. */
export function parse(markdown) {
  return marked.parse(markdown);
}
