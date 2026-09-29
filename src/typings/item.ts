export type ItemData = {
  name: string;
  label: string;
  stack: boolean;
  usable: boolean;
  close: boolean;
  count: number;
  description?: string;
  buttons?: string[];
  ammoName?: string;
  image?: string;
  // All In City: optional, only present if a Lua patch ever forwards them (src/dt/categories.ts)
  category?: string;
  bound?: boolean;
  rarity?: string;
};
