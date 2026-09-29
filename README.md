# ox_inventory web UI — All In City fork

This folder is the **complete corresponding source** of the inventory UI that All In City ships to players inside
`resources/[core]/ox_inventory/web/build` (GPL-3.0-or-later, see `LICENSE`, `COPYING` and `NOTICE.md`).

| | |
|---|---|
| Upstream | https://github.com/overextended/ox_inventory — folder `web/` |
| Tag / commit | `v2.47.9` / `952c128fdff056fd7506d924faa6c07fb80892e9` (same as `tools/vendor.lock.json`) |
| Pristine build (release zip) | `index.js` sha256 `430cb7c4…c275c539`, `index.css` `7ef8c19c…a3805`, `index.html` `7810d483…a3c060` — upstream source at this commit rebuilds these bytes |
| License | GPL-3.0-or-later (`LICENSE` = upstream `web/LICENSE`; `COPYING` = full GPLv3 text = upstream root `LICENSE`) |
| Our changes | listed in `NOTICE.md` ("Modifications"); decision record `docs/adr/ADR-012-ox-inventory-ui-fork.md` |
| Public source offer | https://github.com/bluepromprasit-stack/allin-city-inventory-ui — public mirror of this folder, updated with every deployed release (GPLv3 §6(d)); the same URL is `ui_dt_source_url` (patch 003) and the in-game help dialog |

Upstream's structure is kept (`src/components`, `src/store`, `src/dnd`, `src/reducers`, …) so a future upstream bump is a
three-way merge of `web/`. New code lives in `src/dt/` (categories, glyphs, tokens, fonts, styles, browser mock) and in
new components next to upstream's (`FastSlotColumn`, `CategoryRail`, `PageDots`). Drag and drop, thunks, reducers,
helpers, hooks and `utils/fetchNui` are upstream's code, unchanged.

## Build

Node 22 (`$HOME/.nvm/versions/node/v22.22.2/bin` on the team Macs) and bun 1.4.2 for the frozen install (`bun.lock` is
upstream's lock file):

```bash
bash tools/ox-inventory-ui.sh --build    # npx bun@1.4.2 install --frozen-lockfile && npm run build (tsc && vite build)
bash tools/ox-inventory-ui.sh --patch    # + rewrite patches/ox_inventory/004-dt-inventory-ui.patch (GIT binary patch)
bash tools/vendor.sh --yes --only ox_inventory   # apply 001..004 on the sha256-verified release zip -> resources/[core]
bash tools/ox-inventory-ui.sh --check    # CI: the committed patch turns the pristine build into this build, byte for byte
```

`tools/vendor.sh` only picks up `patches/ox_inventory/NNN-*.patch`, so this folder is never applied as a patch. The build
is deterministic (same bytes on macOS and Linux). Fonts are inlined into `assets/index.css` because ox_inventory's
`fxmanifest.lua` serves only `web/build/index.html`, `assets/*.js` and `assets/*.css`.

## Develop in a browser

```bash
npm run dev:inventory            # from the repo root = npm --prefix patches/ox_inventory/web run start
# http://localhost:5173/?right=newdrop|drop|shop|crafting|trunk|otherplayer  &cat=weapon  &search=ข้าว  &page=2
#                        ?peek=1 (TAB peek)  &help=1  &notify=1
```

`src/dt/dev/mock.ts` replays the NUI messages of the game (`init`, `setupInventory`, `toggleHotbar`, `itemNotify`) with
the real item labels; the dev server serves item art from `resources/[core]/ox_inventory/web/images`. The mock only runs
under `import.meta.env.DEV` in a plain browser; the production build drops it (`--build` fails if it leaks).

## What talks to the game (unchanged contract, plus two additive fields)

- Lua → UI: `init` (now also `fastslots`, patch 002), `setupInventory`, `refreshSlots`, `closeInventory`, `toggleHotbar`,
  `displayMetadata`, `itemNotify`.
- UI → Lua: `uiLoaded`, `getItemData`, `useItem`, `giveItem`, `swapItems`, `buyItem`, `craftItem`, `removeComponent`,
  `removeAmmo`, `useButton`, `exit`, and new `dtTextFocus` (boolean; patch 002) while the search/amount field has focus.
- Every move is still validated by the server (`ox_inventory:swapItems`); filtering, search and paging never change
  spaces, order or server data.

## Categories and copy

- `scripts/gen-categories.mjs` generates `src/generated/item-categories.json` from
  `resources/[theme]/theme_data/data/items.json` (committed, so the mirror builds without theme_data; `--check` in CI).
- `src/dt/categories.ts` maps every item to one rail entry (ACCOUNT, KEY, FASHION, ACCESSORY, ECONOMY, WEAPON).
- Player-facing strings come from ox's locale files (`ui_*` keys only reach the page). The Thai fallbacks in the source
  must equal `locales/th.json` — `scripts/check-locale.mjs` (run by `--check`). Final copy is TODO(theme).

## Upstream bump

1. `git diff v2.47.9..vNEW -- web/` in the upstream repo, three-way merge it into this folder; take upstream's
   `package.json`/`bun.lock` changes.
2. Update the tag/commit/pristine hashes above and the `NOTICE.md` log.
3. Bump `tools/vendor.lock.json`, then `bash tools/ox-inventory-ui.sh --patch` (the preimage is the new zip), rebase
   002/003 if their hunks moved, `bash tools/vendor.sh --yes --only ox_inventory`, `npm run ci`.
