// All In City: paged card grid (upstream: one scrolling 5-column grid that lazy-rendered 30 spaces at a time).
// Paging and filtering only choose which spaces are drawn; every card keeps its real space number, so drag and drop
// goes through upstream's onDrop / onBuy / onCraft exactly as before.
import React, { useEffect, useRef } from 'react';
import { useDrop } from 'react-dnd';
import { DragSource, Inventory, InventoryType, Slot } from '../../typings';
import InventorySlot from './InventorySlot';
import { store, useAppSelector } from '../../store';
import { onDrop } from '../../dnd/onDrop';
import { onBuy } from '../../dnd/onBuy';
import { onCraft } from '../../dnd/onCraft';
import { closeTooltip } from '../../store/tooltip';
import { t } from '../../dt/text';

/**
 * Drop on a free cell of a filtered grid: the first empty space of the target inventory after the fast slots (fast
 * slots are only ever filled on purpose), else any empty space. Same thunks as a drop on a real card.
 */
export const dropOnFreeSpace = (source: DragSource, targetType: Inventory['type']) => {
  const state = store.getState();
  const target = targetType === InventoryType.PLAYER ? state.inventory.leftInventory : state.inventory.rightInventory;
  if (target.type === InventoryType.SHOP || target.type === InventoryType.CRAFTING) return;
  const skip = targetType === InventoryType.PLAYER ? state.view.fastslots : 0;
  const empty =
    target.items.find((s) => s.slot > skip && s.name === undefined) ?? target.items.find((s) => s.name === undefined);
  if (!empty) return;
  store.dispatch(closeTooltip());
  const to = { inventory: targetType, item: { slot: empty.slot } };
  if (source.inventory === InventoryType.SHOP) onBuy(source, to);
  else if (source.inventory === InventoryType.CRAFTING) onCraft(source, to);
  else onDrop(source, to);
};

const FreeCell: React.FC<{ targetType: Inventory['type'] }> = ({ targetType }) => {
  const [{ isOver }, drop] = useDrop<DragSource, void, { isOver: boolean }>(
    () => ({
      accept: 'SLOT',
      collect: (monitor) => ({ isOver: monitor.isOver() }),
      drop: (source) => dropOnFreeSpace(source, targetType),
    }),
    [targetType]
  );
  return (
    <div
      ref={(el) => {
        drop(el);
      }}
      role="listitem"
      aria-label={t('ui_dt_empty', 'ว่าง')}
      className={`dt-card is-empty is-free${isOver ? ' is-target' : ''}`}
    />
  );
};

interface GridProps {
  inventory: Inventory;
  /** every cell to show, in display order, across all pages */
  cells: Slot[];
  page: number;
  onPage: (page: number) => void;
  perPage: number;
  /** what pads the last page: 'free' = drop cells that route to the first free space, 'blank' = invisible fillers */
  fillers: 'free' | 'blank';
  /** shown over the grid when there is nothing to list (filtered view with no result, empty secondary) */
  empty?: React.ReactNode;
  className?: string;
}

const WHEEL_GAP_MS = 250;

const InventoryGrid: React.FC<GridProps> = ({ inventory, cells, page, onPage, perPage, fillers, empty, className }) => {
  const isBusy = useAppSelector((state) => state.inventory.isBusy);
  const pageCount = Math.max(1, Math.ceil(cells.length / perPage));
  const current = Math.min(page, pageCount - 1);
  const lastWheel = useRef(0);

  // keep the parent's page in range when the list shrinks (filter, refresh)
  useEffect(() => {
    if (current !== page) onPage(current);
  }, [current, page, onPage]);

  const visible = cells.slice(current * perPage, (current + 1) * perPage);
  const pad = perPage - visible.length;

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (pageCount < 2 || Math.abs(event.deltaY) < 1) return;
    const now = Date.now();
    if (now - lastWheel.current < WHEEL_GAP_MS) return;
    lastWheel.current = now;
    const next = Math.max(0, Math.min(pageCount - 1, current + (event.deltaY > 0 ? 1 : -1)));
    if (next !== current) onPage(next);
  };

  return (
    <div
      className={`dt-grid ${className ?? ''}`}
      role="list"
      style={{ pointerEvents: isBusy ? 'none' : 'auto' }}
      onWheel={handleWheel}
    >
      <div className="dt-grid__page" key={current}>
        {visible.map((item) => (
          <InventorySlot
            key={`${inventory.type}-${inventory.id}-${item.slot}`}
            item={item}
            inventoryType={inventory.type}
            inventoryGroups={inventory.groups}
            inventoryId={inventory.id}
          />
        ))}
        {Array.from({ length: pad }, (_, i) =>
          fillers === 'free' ? (
            <FreeCell key={`free-${i}`} targetType={inventory.type} />
          ) : (
            <div key={`blank-${i}`} className="dt-card is-blank" aria-hidden="true" />
          )
        )}
      </div>
      {empty && <div className="dt-grid__empty">{empty}</div>}
    </div>
  );
};

export default InventoryGrid;
