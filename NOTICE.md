Copyright © 2021-2026 [Linden](https://github.com/thelindat), [Luke](https://github.com/LukeWasTakenn), [Dunak](https://github.com/dunak-debug) and contributors

The original source code is available at: https://github.com/overextended/ox_inventory

---

This project is licensed under the [GPL‑3.0](https://www.gnu.org/licenses/gpl-3.0.en.html) or later. A complete copy of the license is included in the [LICENSE](./LICENSE) file.

When incorporating this work into your own project, you must:

- Clearly credit the original authors and provide a link to the original project.
- Preserve all copyright, license, and attribution notices, including this NOTICE file.
- Document any modifications made to the original work.
- Include the full text of the GPL‑3.0 license with your distribution.
- License modified versions of this project under the GPL‑3.0 or later.

If this project has been useful to you, please [consider sponsoring its continued development](https://ko-fi.com/thelindat).

---

## Frequently asked questions

### Can I redistribute modified versions of this project?
You may fork, modify, and redistribute this project, provided you comply with the license and preserve the same rights and freedoms for downstream recipients.

### Am I allowed to encrypt this project?
Recipients of this project must receive the complete corresponding source code and be able to install, motifiy, build, and run it. Distributing the project in a form — including through encryption, obfuscation, or other technical measures — that prevents recipients from exercising the rights granted by the license is not permitted.

### Can I sell a modified version of this project?
Commercial distribution is permitted, provided you comply with the terms of the license. However, recipients retain the same rights and freedoms under the license and may freely redistribute modified versions.

---

## Modifications (All In City fork of `web/`, GPL-3.0-or-later)

The text above is upstream's `NOTICE.md` (ox_inventory v2.47.9, repository root), kept verbatim. This folder is a
modified copy of upstream's `web/` folder at tag `v2.47.9`, commit `952c128fdff056fd7506d924faa6c07fb80892e9`
(https://github.com/overextended/ox_inventory). Modified by All In City (TODO(company) Co., Ltd.), first on 2026-09-29.
The whole modified work is licensed under the GPL-3.0-or-later; the full licence text is in `COPYING`, upstream's
licence notice in `LICENSE`.

| Date | Files | Change |
|---|---|---|
| 2026-09-29 | `index.html` | `lang="th"`; removed the Google Fonts (Roboto) links — no remote requests from the page |
| 2026-09-29 | `vite.config.ts` | inline `.woff2` fonts into the CSS (`assetsInlineLimit`); the dev server serves item art from the vendored resource; keep the libraries' `@license` / `/*!` headers in the minified bundle (`comments.legal`) |
| 2026-09-29 | `src/main.tsx` | removed the remote (imgur) dev background; loads the dt design tokens, fonts and styles; in game appends `https://cfx-nui-theme_ui_skin/skin/tokens.css` |
| 2026-09-29 | `src/App.tsx` | reads `fastslots` from the `init` message; upstream's browser mock (remote image URL) replaced by `src/dt/dev/mock.ts` |
| 2026-09-29 | `src/index.scss` | reduced to resets and transition classes; all styling in `src/dt/inventory.css` |
| 2026-09-29 | `src/store/index.ts`, new `src/store/view.ts` | presentation state: fast slot count, rail filter, search, pages |
| 2026-09-29 | `src/typings/item.ts` | optional `category`, `bound`, `rarity` on item data (only if a Lua patch forwards them) |
| 2026-09-29 | `src/components/inventory/index.tsx`, `LeftInventory.tsx`, `RightInventory.tsx`, `InventoryGrid.tsx` | new layout: player panel (fast slot column, 6 x 4 paged grid, category rail) and a secondary panel; `newdrop` becomes a ground drop zone |
| 2026-09-29 | new `FastSlotColumn.tsx`, `CategoryRail.tsx`, `PageDots.tsx` | numbered fast slots (spaces 1..N), rail ALL/ACCOUNT/KEY/FASHION/ACCESSORY/ECONOMY/WEAPON + SEARCH, page bars |
| 2026-09-29 | `InventorySlot.tsx` | new card and fast-tile markup; the drag/drop, click and context-menu logic is upstream's, unchanged |
| 2026-09-29 | `InventoryControl.tsx` | footer: amount, Use / Give / ground drop zones (close and help moved to the header) |
| 2026-09-29 | `InventoryHotbar.tsx` | TAB peek shows `fastslots` tiles instead of 5; durability as a bar only, broken chip, items without art show their name |
| 2026-09-29 | `InventoryContext.tsx`, `utils/menu/Menu.tsx` | item name header, separators, line chevron (menu logic unchanged) |
| 2026-09-29 | `SlotTooltip.tsx`, `UsefulControls.tsx` | restyled; category, weight, fast slot number, bound hint; help lists the fast slots and this GPL notice (removed an emoji) |
| 2026-09-29 | `utils/DragPreview.tsx`, `utils/ItemNotifications.tsx`, `utils/WeightBar.tsx` | restyled preview, notices and weight meter |
| 2026-09-29 | new `src/dt/**`, `src/generated/item-categories.json`, `scripts/*.mjs` | categories, text/format helpers, original line glyphs, dt tokens (copy of `theme_ui_skin/skin/tokens.css`), Bai Jamjuree fonts (SIL OFL 1.1, `src/dt/fonts/OFL.txt`), browser mock, generators/checks |
| 2026-09-29 | new `README.md`, `NOTICE.md` (this file), `COPYING` | build instructions and notices |

Third-party material added by the fork: Bai Jamjuree (Cadson Demak, SIL Open Font License 1.1 — the font stays under the
OFL; see `src/dt/fonts/OFL.txt`). The line glyphs in `src/dt/icons.tsx` are original work of All In City.
