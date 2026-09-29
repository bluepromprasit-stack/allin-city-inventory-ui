// All In City: browser-only mock of the NUI messages the ox_inventory client sends (vite dev server, `npm run start`).
// Never runs in the game (App.tsx calls it behind import.meta.env.DEV && isEnvBrowser(), so the build drops it).
// Item labels are the real ones: ox data/items.lua + data/weapons.lua (English upstream labels) and theme_data
// items.json label_th for theme items (no art yet — they show their name). Images come from ox web/images, served by
// vite.config.ts in dev only.
//
// Query parameters (for screenshots): ?right=newdrop|drop|shop|crafting|trunk|otherplayer  ?cat=<rail id>
//   ?search=<text>  ?page=<n>  ?help=1  ?peek=1 (inventory closed, TAB peek shown)  ?notify=1 (three item notices).
// Context menu and tooltip are opened with real mouse events (right-click / hover), not from here.
import { store } from '../../store';
import { setCategory, setPage, setSearch, setSearchOpen } from '../../store/view';
import type { ItemData, SlotWithItem } from '../../typings';
import type { RailId } from '../categories';

/** Everything the mock posts, built only when runMock() runs (the production build drops it entirely). */
const mockData = () => {
  const item = (name: string, label: string, extra: Partial<ItemData> = {}): ItemData => ({
    name,
    label,
    stack: true,
    usable: true,
    close: false,
    count: 0,
    ...extra,
  });

  const ITEMS: Record<string, ItemData> = {
    WEAPON_PISTOL: item('WEAPON_PISTOL', 'Pistol', { stack: false, ammoName: 'ammo-9' }),
    WEAPON_KNIFE: item('WEAPON_KNIFE', 'Knife', { stack: false }),
    WEAPON_BAT: item('WEAPON_BAT', 'Bat', { stack: false }),
    WEAPON_SMG: item('WEAPON_SMG', 'SMG', { stack: false, ammoName: 'ammo-9' }),
    'ammo-9': item('ammo-9', '9mm'),
    at_flashlight: item('at_flashlight', 'Tactical Flashlight'),
    water: item('water', 'Water', { description: 'ดื่มแล้วหายกระหาย' }),
    burger: item('burger', 'Burger'),
    sprunk: item('sprunk', 'Sprunk'),
    mustard: item('mustard', 'Mustard'),
    bandage: item('bandage', 'Bandage'),
    phone: item('phone', 'Phone', { stack: false }),
    radio: item('radio', 'Radio', { stack: false }),
    lockpick: item('lockpick', 'Lockpick'),
    parachute: item('parachute', 'Parachute', { stack: false }),
    armour: item('armour', 'Bulletproof Vest', { stack: false }),
    money: item('money', 'Money'),
    black_money: item('black_money', 'Dirty Money'),
    identification: item('identification', 'Identification', { image: 'images/card_id.png' }),
    mastercard: item('mastercard', 'Fleeca Card', { stack: false, image: 'images/card_bank.png' }),
    identity_card: item('identity_card', 'ไพ่ประจำตัว', {
      stack: false,
      close: true,
      description: 'ไพ่ประจำตัวของคุณ ใช้เพื่อแสดงให้คนใกล้ตัวดู',
    }),
    clothing: item('clothing', 'Clothing'),
    scrapmetal: item('scrapmetal', 'Scrap Metal'),
    garbage: item('garbage', 'Garbage'),
    paperbag: item('paperbag', 'Paper Bag', { stack: false }),
    room_key: item('room_key', 'กุญแจห้องเช่า', { stack: false }),
    lantern_kit: item('lantern_kit', 'ชุดช่างไพ่', { stack: false }),
    moonflower: item('moonflower', 'ดอกเดือน'),
    moon_porridge: item('moon_porridge', 'ข้าวต้มลานเอซ'),
    handheld_lantern_basic: item('handheld_lantern_basic', 'โคมถือพื้นฐาน', { stack: false }),
    bout_permit: item('bout_permit', 'ใบอนุญาตขึ้นเวที', { stack: false }),
    night_rice: item('night_rice', 'ข้าวหอมราตรี'),
  };

  // grams per piece (ox data/items.lua / weapons.lua values or small placeholders for the preview)
  const WEIGHT: Record<string, number> = {
    WEAPON_PISTOL: 1130, WEAPON_KNIFE: 300, WEAPON_BAT: 1134, WEAPON_SMG: 2770, 'ammo-9': 7, at_flashlight: 120,
    water: 500, burger: 220, sprunk: 350, mustard: 500, bandage: 115, phone: 190, radio: 100, lockpick: 160,
    parachute: 8000, armour: 3000, money: 0, black_money: 0, identification: 0, mastercard: 10, identity_card: 10,
    clothing: 0, scrapmetal: 80, garbage: 0, paperbag: 1, room_key: 10, lantern_kit: 900, moonflower: 20,
    moon_porridge: 300, handheld_lantern_basic: 400, bout_permit: 10, night_rice: 100,
  };

  const slot = (n: number, name: string, count = 1, metadata?: Record<string, unknown>): SlotWithItem => ({
    slot: n,
    name,
    count,
    weight: (WEIGHT[name] ?? 100) * count,
    metadata,
  });

  const PLAYER: SlotWithItem[] = [
    slot(1, 'WEAPON_PISTOL', 1, { durability: 92, ammo: 12, serial: 'AIC4821K9', components: ['at_flashlight'] }),
    slot(2, 'water', 4),
    slot(3, 'burger', 2),
    slot(4, 'phone'),
    slot(5, 'bandage', 5),
    slot(7, 'radio'),
    slot(8, 'money', 1840),
    slot(9, 'identity_card', 1, { label: 'ไพ่ประจำตัว' }),
    slot(10, 'identification'),
    slot(11, 'mastercard'),
    slot(12, 'lockpick', 3),
    slot(13, 'ammo-9', 48),
    slot(14, 'armour'),
    slot(15, 'clothing'),
    slot(16, 'parachute'),
    slot(17, 'scrapmetal', 12),
    slot(18, 'sprunk', 3),
    slot(19, 'WEAPON_KNIFE', 1, { durability: 41 }),
    slot(20, 'garbage'),
    slot(21, 'paperbag'),
    slot(22, 'room_key'),
    slot(23, 'lantern_kit'),
    slot(24, 'moonflower', 6),
    slot(25, 'moon_porridge', 2),
    slot(26, 'handheld_lantern_basic'),
    slot(27, 'black_money', 250),
    slot(28, 'WEAPON_BAT', 1, { durability: 14 }),
    slot(29, 'at_flashlight'),
    slot(30, 'mustard'),
    slot(33, 'WEAPON_SMG', 1, { durability: 100, ammo: 30, serial: 'AIC0033SM' }),
    slot(36, 'bout_permit'),
    slot(41, 'night_rice', 8),
  ];

  const RIGHT: Record<string, { type: string; slots: number; label?: string; maxWeight?: number; items: SlotWithItem[] }> = {
    newdrop: { type: 'newdrop', slots: 50, maxWeight: 30000, items: [] },
    drop: {
      type: 'drop',
      slots: 50,
      maxWeight: 30000,
      label: 'drop-8431',
      items: [slot(1, 'garbage'), slot(2, 'water', 2), slot(3, 'scrapmetal', 30), slot(5, 'WEAPON_BAT', 1, { durability: 63 })],
    },
    shop: {
      type: 'shop',
      slots: 6,
      label: 'ร้านสะดวกซื้อ (ตัวอย่าง)',
      items: [
        { ...slot(1, 'water', 20), price: 12 },
        { ...slot(2, 'burger', 15), price: 25 },
        { ...slot(3, 'sprunk', 30), price: 15 },
        { ...slot(4, 'bandage', 0), price: 40 },
        { ...slot(5, 'phone', 5), price: 850 },
        { ...slot(6, 'radio', 5), price: 450 },
      ],
    },
    crafting: {
      type: 'crafting',
      slots: 2,
      label: 'โต๊ะช่าง (ตัวอย่าง)',
      items: [
        { ...slot(1, 'lockpick', 1), ingredients: { scrapmetal: 5, WEAPON_KNIFE: 0.1 }, duration: 5000 },
        { ...slot(2, 'bandage', 2), ingredients: { paperbag: 1, water: 1 }, duration: 3000 },
      ],
    },
    trunk: {
      type: 'trunk',
      slots: 20,
      maxWeight: 60000,
      label: 'AIC 471',
      items: [slot(1, 'parachute'), slot(2, 'scrapmetal', 40), slot(4, 'water', 6)],
    },
    otherplayer: {
      type: 'otherplayer',
      slots: 50,
      maxWeight: 30000,
      label: 'ผู้เล่น #12',
      items: [slot(1, 'phone'), slot(2, 'burger', 1), slot(3, 'money', 60)],
    },
  };

  // Thai copy of the upstream ui_* keys the page reads through Locale[] (the ui_dt_* keys fall back to their Thai
  // defaults in the components). Same values as locales/th.json of patches/ox_inventory/003-dt-th-locale.patch.
  const LOCALE: Record<string, string> = {
    ui_use: 'ใช้',
    ui_give: 'ให้',
    ui_close: 'ปิด',
    ui_drop: 'ทิ้ง',
    ui_removeattachments: 'ถอดอุปกรณ์เสริม',
    ui_copy: 'คัดลอกเลขประจำอาวุธ',
    ui_durability: 'สภาพ',
    ui_ammo: 'กระสุน',
    ui_serial: 'เลขประจำอาวุธ',
    ui_components: 'อุปกรณ์เสริม',
    ui_tint: 'สีอาวุธ',
    ui_usefulcontrols: 'วิธีใช้',
    ui_rmb: 'เปิดเมนูของชิ้นนั้น',
    ui_ctrl_lmb: 'ย้ายทั้งกองไปอีกฝั่ง',
    ui_shift_drag: 'แบ่งจำนวนครึ่งหนึ่ง',
    ui_ctrl_shift_lmb: 'ย้ายครึ่งกองไปอีกฝั่ง',
    ui_alt_lmb: 'ใช้ทันที',
    ui_ctrl_c: 'ชี้ที่อาวุธแล้วกด: คัดลอกเลขประจำอาวุธ',
    ui_remove_ammo: 'ถอดกระสุน',
    ui_removed: 'นำออก',
    ui_added: 'ได้รับ',
    ui_holstered: 'เก็บอาวุธ',
    ui_equipped: 'ถืออาวุธ',
    ammo_type: 'ชนิดกระสุน',
  };

  // NUI messages arrive as fresh JSON objects; clone so the store never receives an object it froze earlier
  return { ITEMS, PLAYER, RIGHT, LOCALE };
};

const post = (action: string, data: unknown) =>
  window.dispatchEvent(new MessageEvent('message', { data: { action, data: structuredClone(data) } }));

export const runMock = () => {
  const { ITEMS, PLAYER, RIGHT, LOCALE } = mockData();
  const q = new URLSearchParams(window.location.search);
  const right = RIGHT[q.get('right') ?? 'newdrop'] ?? RIGHT.newdrop;
  const left = { id: 'dt-dev-mock', type: 'player', slots: 50, label: 'ตัวละครตัวอย่าง', maxWeight: 30000, items: PLAYER };

  setTimeout(() => {
    post('init', { locale: LOCALE, items: ITEMS, leftInventory: left, imagepath: 'images', fastslots: 7 });
    if (q.get('peek')) {
      post('toggleHotbar', null);
      return;
    }
    post('setupInventory', { leftInventory: left, rightInventory: { id: `mock-${right.type}`, ...right } });

    setTimeout(() => {
      const cat = q.get('cat') as RailId | null;
      if (cat) store.dispatch(setCategory(cat));
      const search = q.get('search');
      if (search) {
        store.dispatch(setSearchOpen(true));
        store.dispatch(setSearch(search));
      }
      if (q.get('page')) store.dispatch(setPage(Number(q.get('page')) - 1));
      if (q.get('help')) document.querySelector<HTMLButtonElement>('.dt-head__side--end .dt-btn')?.click();
      if (q.get('notify')) {
        post('itemNotify', [PLAYER[1], 'ui_added', 2]);
        post('itemNotify', [PLAYER[0], 'ui_equipped']);
        post('itemNotify', [PLAYER[3], 'ui_removed', 1]);
      }
    }, 300);
  }, 400);
};
