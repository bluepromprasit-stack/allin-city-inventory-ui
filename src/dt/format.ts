// All In City: number and weight formatting (th-TH uses Latin digits; tabular figures come from CSS).
import { t } from './text';

const int = new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 });
const one = new Intl.NumberFormat('th-TH', { maximumFractionDigits: 1 });

export const formatCount = (n: number): string => int.format(n);

/** ox weights are grams. >= 1000 g shows kilograms with one decimal. */
export const formatWeight = (grams: number): string =>
  grams >= 1000
    ? `${one.format(grams / 1000)} ${t('ui_dt_unit_kg', 'กก.')}`
    : `${int.format(Math.max(0, Math.round(grams)))} ${t('ui_dt_unit_g', 'กรัม')}`;

/** "12.4 / 30 กก." — both sides in the unit of the maximum so the pair reads at a glance. */
export const formatWeightPair = (grams: number, max: number): string => {
  if (max >= 1000) return `${one.format(grams / 1000)} / ${one.format(max / 1000)} ${t('ui_dt_unit_kg', 'กก.')}`;
  return `${int.format(grams)} / ${int.format(max)} ${t('ui_dt_unit_g', 'กรัม')}`;
};

/** Durability tone for bars: >= 50 fine, 20-49 worn, < 20 low. Colour is never the only signal (the number is shown). */
export const durabilityTone = (d: number): 'ok' | 'warn' | 'low' => (d >= 50 ? 'ok' : d >= 20 ? 'warn' : 'low');
