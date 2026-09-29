// All In City: player-facing copy of the fork. Every string comes from the ox locale files (`ui_*` keys reach the page
// through the `init` message, client.lua:1274-1284); patches/ox_inventory/003-dt-th-locale.patch adds locales/th.json
// and the new `ui_dt_*` keys. The fallback is the Thai copy of th.json, used only when a key is missing (browser dev
// mode before init, or an outdated locale file). Final wording is TODO(theme) — change th.json, not this file.
import { Locale } from '../store/locale';

/** `%s` placeholders are filled in order, like Lua string.format in ox's locale(). */
export const t = (key: string, fallback: string, ...args: Array<string | number>): string => {
  let out = Locale[key] || fallback;
  for (const arg of args) out = out.replace('%s', String(arg));
  return out;
};
