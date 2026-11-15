# markdown-render-speed-02

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
