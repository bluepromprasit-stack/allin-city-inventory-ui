import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { useDragLayer, useDragDropManager } from 'react-dnd';
import { DragSource, SlotWithItem } from '../../typings';
// All In City: the preview is the item's art (or its name when there is no art yet) with a quantity chip, instead of
// upstream's bare background image. Position tracking below is upstream's.
import { store } from '../../store';
import { isSlotWithItem } from '../../helpers';
import { ItemImage } from '../../dt/ItemImage';
import { formatCount } from '../../dt/format';

const sourceSlot = (data: DragSource): SlotWithItem | undefined => {
  const { inventory } = store.getState();
  const inv = data.inventory === 'player' ? inventory.leftInventory : inventory.rightInventory;
  const slot = inv.items[data.item.slot - 1];
  return slot && isSlotWithItem(slot) && slot.name === data.item.name ? slot : undefined;
};

const DragPreview: React.FC = () => {
  const manager = useDragDropManager();
  const rootRef = useRef<HTMLDivElement>(null);

  // Only collect item/isDragging here, so we re-render on drag start/end rather than
  // on every pointer move.
  const { data, isDragging } = useDragLayer((monitor) => ({
    data: monitor.getItem() as DragSource | null,
    isDragging: monitor.isDragging(),
  }));

  useEffect(() => {
    document.body.classList.toggle('inv-dragging', isDragging);
    return () => document.body.classList.remove('inv-dragging');
  }, [isDragging]);

  // Write the position straight to the node so the preview tracks the cursor 1:1
  // instead of lagging a render behind it.
  useLayoutEffect(() => {
    if (!isDragging) return;
    const monitor = manager.getMonitor();
    const el = rootRef.current;
    const apply = () => {
      const offset = monitor.getClientOffset();
      if (el && offset) {
        el.style.transform = `translate3d(${offset.x}px, ${offset.y}px, 0) translate(-50%, -50%)`;
      }
    };
    apply();
    return monitor.subscribeToOffsetChange(apply);
  }, [isDragging, manager]);

  if (!isDragging || !data?.item) return null;

  const slot = sourceSlot(data);
  const count = slot && slot.count > 1 ? slot.count : undefined;

  return (
    <div className="dt-drag" ref={rootRef}>
      <ItemImage item={slot ?? data.item.name} className="dt-drag__art" />
      {count !== undefined && <span className="dt-drag__count">{formatCount(count)}</span>}
    </div>
  );
};

export default DragPreview;
