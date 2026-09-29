// All In City: item categories for the filter rail (Figma parity F2, 2026-09-28). Presentation only: a category never
// changes where an item is, what it weighs or what the server allows (CLAUDE.md "Server-authoritative rules").
//
// Rail = exactly the brief's entries, in the brief's order: ALL, ACCOUNT, KEY, FASHION, ACCESSORY, ECONOMY, WEAPON,
// then SEARCH (CategoryRail.tsx). Every item resolves to exactly one of the six non-ALL categories, so ALL always shows
// everything and nothing is ever hidden by the mapping itself.
import generated from '../generated/item-categories.json';
import { Items } from '../store/items';
import { t } from './text';

export type CategoryId = 'account' | 'key' | 'fashion' | 'accessory' | 'economy' | 'weapon';
export type RailId = 'all' | CategoryId;

/** Fixed rail order (never reshuffles; empty entries stay in place, dimmed). */
export const RAIL: RailId[] = ['all', 'account', 'key', 'fashion', 'accessory', 'economy', 'weapon'];

// Labels come from locales (`ui_dt_cat_<id>` / `ui_dt_cat_<id>_en`, patches/ox_inventory/003-dt-th-locale.patch);
// these are the fallbacks used when a key is missing. Final copy is TODO(theme).
const LABEL_TH: Record<RailId | 'search', string> = {
  all: 'ทั้งหมด',
  account: 'บัญชี',
  key: 'กุญแจ',
  fashion: 'แฟชั่น',
  accessory: 'อุปกรณ์',
  economy: 'เศรษฐกิจ',
  weapon: 'อาวุธ',
  search: 'ค้นหา',
};
const LABEL_EN: Record<RailId | 'search', string> = {
  all: 'ALL',
  account: 'ACCOUNT',
  key: 'KEY',
  fashion: 'FASHION',
  accessory: 'ACCESSORY',
  economy: 'ECONOMY',
  weapon: 'WEAPON',
  search: 'SEARCH',
};

export const categoryLabel = (id: RailId | 'search'): string => t(`ui_dt_cat_${id}`, LABEL_TH[id]);
export const categoryCaption = (id: RailId | 'search'): string => t(`ui_dt_cat_${id}_en`, LABEL_EN[id]);

/**
 * theme_data items.json `category` -> rail entry (F2 definitions):
 *   ACCOUNT   documents, identity card, licences, cards, cash/money-like and bank items
 *   KEY       keys, keycards, key fobs
 *   FASHION   clothing, outfits, masks, bags worn (theme `cosmetic`: lanterns carried for looks, badges)
 *   ACCESSORY phone, radio, gadgets, tools, equipment
 *   ECONOMY   food, drinks, medicine, materials, trade goods and every other consumable or sellable
 *   WEAPON    weapons, ammo, attachments, throwables
 * A rail id is accepted as-is too, so a future Lua patch may forward either vocabulary as `Items[name].category`.
 */
const THEME_TO_RAIL: Record<string, CategoryId> = {
  document: 'account',
  key: 'key',
  cosmetic: 'fashion',
  tool: 'accessory',
  weapon: 'weapon',
  consumable: 'economy',
  material: 'economy',
  quest: 'economy',
  misc: 'economy',
};

/** Per-item overrides where the theme table's category and the rail's meaning differ. TODO(theme): confirm. */
const OVERRIDE: Record<string, CategoryId> = {
  bout_permit: 'account', // theme `misc`, but it is a permit (licence) -> ACCOUNT
};

/** Upstream items of ox_inventory data/items.lua (v2.47.9) that are not in theme_data. */
const STOCK: Record<string, CategoryId> = {
  money: 'account',
  black_money: 'account',
  identification: 'account',
  mastercard: 'account',
  clothing: 'fashion',
  panties: 'fashion',
  phone: 'accessory',
  radio: 'accessory',
  lockpick: 'accessory',
  parachute: 'accessory',
  armour: 'accessory', // body armour = equipment (F2 ACCESSORY); not a weapon, ammo or attachment
  burger: 'economy',
  testburger: 'economy',
  sprunk: 'economy',
  water: 'economy',
  mustard: 'economy',
  bandage: 'economy',
  garbage: 'economy',
  paperbag: 'economy',
  scrapmetal: 'economy',
};

/** Name heuristics for items no table knows yet (checked in this order; the default is ECONOMY). */
const HEURISTICS: Array<[RegExp, CategoryId]> = [
  [/^WEAPON_|^ammo[-_]|^at_/i, 'weapon'],
  [/(^|[_-])(keys?|keycard|keyfob|carkeys?|vehiclekeys?)([_-]|$)/i, 'key'],
  [/(^|[_-])(card|id|license|licence|permit|document|cash|money|cheque|bank)([_-]|$)/i, 'account'],
  [/(^|[_-])(outfit|clothing|mask|hat|helmet|glasses|shirt|pants|shoes|backpack)([_-]|$)/i, 'fashion'],
  [/(^|[_-])(phone|radio|tablet|laptop|gps|lockpick|drill|toolkit|repairkit|flashlight|camera|binoculars)([_-]|$)/i, 'accessory'],
];

type GeneratedEntry = { category: string; bound?: boolean };
const THEME: Record<string, GeneratedEntry> = (generated as { items: Record<string, GeneratedEntry> }).items;

const toRail = (value: unknown): CategoryId | undefined => {
  if (typeof value !== 'string' || value === '') return undefined;
  if (value in THEME_TO_RAIL) return THEME_TO_RAIL[value];
  return (RAIL as string[]).includes(value) && value !== 'all' ? (value as CategoryId) : undefined;
};

const cache = new Map<string, CategoryId>();

/** The one rail category of an item name (never 'all'). */
export const categoryOf = (name: string): CategoryId => {
  const hit = cache.get(name);
  if (hit) return hit;
  const fromItem = toRail((Items[name] as { category?: unknown } | undefined)?.category);
  const known = fromItem ?? OVERRIDE[name] ?? toRail(THEME[name]?.category) ?? STOCK[name];
  const resolved: CategoryId = known ?? HEURISTICS.find(([re]) => re.test(name))?.[1] ?? 'economy';
  // Items[] fills in lazily (getItemData) — only cache answers that a later Items[] update cannot change
  if (fromItem || OVERRIDE[name] || THEME[name] || STOCK[name]) cache.set(name, resolved);
  return resolved;
};

/** Bound items (theme_data `bound: true`, e.g. identity_card) cannot leave the holder's bag. Hint only: the dt_ledger
 *  swapItems hook still decides on the server. */
export const isBound = (name: string): boolean =>
  (Items[name] as { bound?: boolean } | undefined)?.bound === true || THEME[name]?.bound === true;

/** Optional rarity tint (F4): only when the item data carries one. No item has rarity data today, so every card is
 *  neutral. Tier names and colours are TODO(theme). */
export type Tier = 'uncommon' | 'rare' | 'epic' | 'legendary';
const TIERS: Tier[] = ['uncommon', 'rare', 'epic', 'legendary'];
export const tierOf = (name: string, metadata?: { [key: string]: any }): Tier | undefined => {
  const raw = metadata?.rarity ?? (Items[name] as { rarity?: unknown } | undefined)?.rarity;
  return typeof raw === 'string' && (TIERS as string[]).includes(raw) ? (raw as Tier) : undefined;
};
