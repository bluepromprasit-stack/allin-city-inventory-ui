// All In City: the fast slot column on the left of the player panel (Figma parity F1). Tiles are the player's own spaces
// 1..fastslots rendered by the normal InventorySlot, so dragging an item onto a numbered tile is upstream's onDrop to
// that space; after closing, key N uses space N (ox hotkeyN -> useSlot(N), client.lua; keys 6-9 come from
// patches/ox_inventory/002-dt-fastslots.patch). The rail filter never hides a tile: matches are marked, others dimmed.
import React from 'react';
import { Inventory, Slot } from '../../typings';
import InventorySlot from './InventorySlot';
import { isSlotWithItem } from '../../helpers';
import { useAppSelector } from '../../store';
import { t } from '../../dt/text';

const FastSlotColumn: React.FC<{
  inventory: Inventory;
  items: Slot[];
  filtering: boolean;
  matches: (slot: Slot) => boolean;
}> = ({ inventory, items, filtering, matches }) => {
  // same lock as upstream's grid wrapper (InventoryGrid): no new drag or drop while a move waits for the server
  const isBusy = useAppSelector((state) => state.inventory.isBusy);
  return (
    <div
      className="dt-fastcol"
      role="list"
      aria-label={t('ui_dt_fast_title', 'ช่องด่วน')}
      style={{ pointerEvents: isBusy ? 'none' : 'auto' }}
    >
      {items.map((item) => (
        <InventorySlot
          key={`fast-${inventory.id}-${item.slot}`}
          variant="fast"
          item={item}
          inventoryType={inventory.type}
          inventoryGroups={inventory.groups}
          inventoryId={inventory.id}
          filter={filtering && isSlotWithItem(item) ? (matches(item) ? 'match' : 'dim') : undefined}
        />
      ))}
    </div>
  );
};

export default FastSlotColumn;
