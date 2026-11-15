// main.ts - the entry's driver for make.fun's markdown-render-speed-02.
//
// The harness runs `node /bot/main.ts` on Node 22, which strips the TypeScript types
// (erasable syntax only). It reads the case set from /input/cases.json, renders each case
// alone with parse() from ./parse.js, and writes /output/html.json: a JSON array of the HTML
// strings, one per case, in the cases' order.
//
// Outside a container MAKEFUN_INPUT_DIR and MAKEFUN_OUTPUT_DIR stand in for /input and /output.

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from './parse.js';

type Case = { id: string; markdown: string };

const inputDir = process.env.MAKEFUN_INPUT_DIR ?? '/input';
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const cases: Case[] = JSON.parse(readFileSync(join(inputDir, 'cases.json'), 'utf8'));

// One output string per case, in the set's order, each rendered from that case's own markdown.
const html = new Array<string>(cases.length);
for (let i = 0; i < cases.length; i += 1) {
  html[i] = parse(cases[i].markdown);
}

writeFileSync(join(outputDir, 'html.json'), JSON.stringify(html));
