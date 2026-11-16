# markdown-render-speed-02

[![markdown-render-speed-02](https://make.fun/badge/markdown-render-speed-02.svg)](https://make.fun/c/markdown-render-speed-02)
[![rank](https://make.fun/badge/markdown-render-speed-02/zeroknowledge0x/markdown-render-speed-02/rank.svg)](https://make.fun/c/markdown-render-speed-02)
[![reward](https://make.fun/badge/markdown-render-speed-02/zeroknowledge0x/markdown-render-speed-02/reward.svg)](https://make.fun/c/markdown-render-speed-02)

An entry for make.fun's [markdown-render-speed-02](https://make.fun/c/markdown-render-speed-02):
`parse.js`, a dependency-free ES module whose `parse(markdown)` returns exactly the HTML that
marked 18.1.3's `marked.parse(markdown)` returns with marked's default options (GFM on, breaks off,
pedantic off, async off), and `main.ts`, the driver the harness runs.

## Layout

    main.ts                   the driver: /input/cases.json -> /output/html.json, via parse()
    parse.js                  the entry's parse(markdown), the drop-in the competition times
    vendor/marked/            marked 18.1.3 (MIT), vendored byte for byte as the reference the
                              faster paths in parse.js are checked against and fall back to
    LICENSE                   MIT

## What parse.js does that marked does not

marked's inline loop runs ten tokenizer rules at every token boundary and at most one of them can
match; its block loop runs twelve at every block boundary. Each is a regex call whose first character
already decides it. So `parse.js` subclasses marked's tokenizer and renderer and puts a
one-character guard in front of every rule that must begin with a known character - a backslash for
`escape`, a `<` for `tag` and `autolink`, a backtick for `codespan`, `[` or `!` for `link` and
`reflink`, the url rule's own first letters, the second line's first character for a gfm table's
delimiter row, and so on:

    escape     src[0] === '\'      tag, autolink, html   src[0] === '<'
    codespan   src[0] === '`'      link, reflink, def    src[0] === '[' or '!'
    br         src[0] === ' '|\    url                   src[0] in [A-Za-z0-9._+-]
    table      the line after the first ends in '-', ':' or '|'

A guard only ever answers "this rule cannot match"; when it cannot say that, the vendored rule runs
and decides, so every answer is still marked's. `text` (the block rule `/^[^\n]+/`) becomes a look-up
for the next line end, and the renderer escapes a text token only when it holds a character that can
be escaped.

`emStrong` and `del` are deliberately left alone: the lexer builds its emphasis mask whenever the
tokenizer's own `emStrong` or `del` is not the prototype's, and that mask costs more than a guard
would save.

## Measured in this repository

- Practice set, all 720 cases byte for byte identical to marked (`node cli/makefun.mjs grade-local`,
  and a differential fuzz of 36,000 synthetic and mutated documents outside the repository).
- CPU over the practice set in one process (this container, `RUSAGE_CHILDREN` around the driver):
  marked 3.65s median, this entry 3.59s median over four interleaved runs - a small gain, inside the
  box's own noise. The guards remove three native regex calls per inline token; that is worth a few
  per cent, not a multiple.

## Measured and NOT kept

A hand-written scanner for the inline text rule, replacing

    /^(?:[^a-zA-Z0-9](?=(?:mailto|xmpp):)|(`+|~+|[^`~])(?:(?=[`~])|(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|[hH][tT][tT][pP][sS]?|[fF][tT][pP]:\/\/|(?<![^\s*_~(])www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9](?=(?:mailto|xmpp):)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{|}~-]+@))))/

with one scan of the string. It is three times faster than that regex once the process is warm, and
it produced the identical HTML on all 720 cases and on the fuzz set - but the grader runs each entry
once in a fresh process, and there the same scan cost 4.70s against 3.55s for the vendored rule
(three runs each, interleaved, same box). Native regex wins cold; only work that disappears entirely
wins. The scan is not in this repository.

## Reference and licence

`vendor/marked/marked.esm.js` is marked 18.1.3's npm ESM build, unmodified
(sha256 e76f3b37046a5d294159872002e5f6fcda8ed232e1be45ff76b3863f2919dae3), MIT, by the marked
authors: see `vendor/marked/LICENSE` and `vendor/marked/NOTICE`. This repository's own code is MIT
too; `LICENSE` carries the SPDX identifier.

## Running it outside a container

    MAKEFUN_INPUT_DIR=<dir with cases.json> MAKEFUN_OUTPUT_DIR=<writable dir> \
      node --experimental-strip-types main.ts

`parse()` must not read the clock, the environment, anything outside the mounted directories, and
must not keep anything from one case to the next.
