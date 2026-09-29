// All In City: original line glyphs for the inventory (UI-SPEC section 9 style: viewBox 24, stroke 1.5, round caps,
// currentColor). Drawn for this fork — nothing taken from the reference screenshot or from an icon pack.
// COMPLIANCE-REDLINES V-01/V-02: no suit shapes, no round coins or stacked discs, no wheel/dial; money is a folded
// banknote, the ACCOUNT glyph is a badge on a lanyard (never a playing card), the weapon glyph is a bracket reticle.
import React from 'react';
import type { RailId } from './categories';

export type GlyphName =
  | RailId
  | 'search'
  | 'lock'
  | 'bia'
  | 'use'
  | 'give'
  | 'drop'
  | 'close'
  | 'help'
  | 'chevron'
  | 'time'
  | 'weight';

const PATHS: Record<GlyphName, string[]> = {
  // 2 x 2 grid
  all: ['M4.5 4.5h5.5v5.5H4.5z', 'M14 4.5h5.5v5.5H14z', 'M4.5 14h5.5v5.5H4.5z', 'M14 14h5.5v5.5H14z'],
  // badge on a lanyard (same drawing as dt_ui LineIcon `idcard`)
  account: [
    'M7 6h10a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z',
    'M10 3h4v4h-4z',
    'M12 10a2.2 2.2 0 1 1 0 4.4a2.2 2.2 0 1 1 0-4.4',
    'M8.5 18.5c.7-1.6 2-2.4 3.5-2.4s2.8.8 3.5 2.4',
  ],
  // key with a square bow (no round shape)
  key: ['M3.5 8.5h6v7h-6z', 'M9.5 12h11', 'M17 12v3.5', 'M20.5 12v2.5', 'M6.5 11v2'],
  // coat hanger
  fashion: ['M10 5.5a2 2 0 1 1 2 2V9', 'M12 9l-8.4 6.3c-.7.5-.3 1.7.5 1.7h15.8c.8 0 1.2-1.2.5-1.7z'],
  // hand radio: body, antenna, speaker lines, button
  accessory: ['M7.5 8h9v12.5h-9z', 'M14 8V3.5', 'M10 11.5h4', 'M10 14h4', 'M10 16.5h4'],
  // market basket with a handle
  economy: ['M3.5 10h17l-2 10h-13z', 'M7.5 10l3-6', 'M16.5 10l-3-6', 'M9 13.5v3.5', 'M12 13.5v3.5', 'M15 13.5v3.5'],
  // bracket reticle (four corners + cross ticks, no ring)
  weapon: ['M4 9V4h5', 'M15 4h5v5', 'M20 15v5h-5', 'M9 20H4v-5', 'M12 7.5v3', 'M12 13.5v3', 'M7.5 12h3', 'M13.5 12h3'],
  search: ['M10.5 4a6.5 6.5 0 1 1 0 13a6.5 6.5 0 1 1 0-13', 'M15.5 15.5L20 20'],
  lock: ['M6 11h12v9H6z', 'M8.5 11V8a3.5 3.5 0 0 1 7 0v3', 'M12 14.5v2.5'],
  // folded banknote (same drawing as dt_ui LineIcon `cash`)
  bia: ['M3 7h14l4 4v6H3z', 'M17 7v4h4', 'M6 11h6', 'M6 14h9'],
  use: ['M4 13v6h16v-6', 'M12 3.5v10', 'M8 9.5l4 4 4-4'],
  give: ['M8 5a2.5 2.5 0 1 1 0 5a2.5 2.5 0 1 1 0-5', 'M3.5 19c.6-3 2.4-5 4.5-5s3.9 2 4.5 5', 'M14 12h6.5', 'M17.5 9l3 3-3 3'],
  drop: ['M12 4v11', 'M8 11l4 4 4-4', 'M5 20h14'],
  close: ['M6 6l12 12', 'M18 6L6 18'],
  help: [
    'M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z',
    'M9.6 9.2a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1.1.9-1.1 1.7v.4',
    'M12 16.6v.01',
  ],
  chevron: ['M9.5 6l6 6-6 6'],
  // hourglass (crafting time)
  time: ['M7 4h10', 'M7 20h10', 'M8 4c0 4 8 4 8 8s-8 4-8 8', 'M16 4c0 4-8 4-8 8s8 4 8 8'],
  // hanging scale weight (trapezoid block with a handle)
  weight: ['M6.5 9h11l2 11h-15z', 'M9.5 9a2.5 2.5 0 1 1 5 0'],
};

export const Glyph: React.FC<{ name: GlyphName; size?: number; className?: string }> = ({ name, size = 16, className }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    {PATHS[name].map((d) => (
      <path key={d} d={d} />
    ))}
  </svg>
);
