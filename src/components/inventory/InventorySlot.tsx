import React, { useCallback, useRef } from 'react';
import { DragSource, Inventory, InventoryType, Slot, SlotWithItem } from '../../typings';
import { useDrag, useDragDropManager, useDrop } from 'react-dnd';
import { useAppDispatch } from '../../store';
import { onDrop } from '../../dnd/onDrop';
import { onBuy } from '../../dnd/onBuy';
import { canCraftItem, canPurchaseItem, getItemUrl, isSlotWithItem } from '../../helpers';
import { onUse } from '../../dnd/onUse';
import { onCraft } from '../../dnd/onCraft';
import useNuiEvent from '../../hooks/useNuiEvent';
import { ItemsPayload } from '../../reducers/refreshSlots';
import { closeTooltip, openTooltip } from '../../store/tooltip';
import { openContextMenu } from '../../store/contextMenu';
import { useMergeRefs } from '@floating-ui/react';
// All In City: presentation helpers (the drag/drop, click and context-menu logic below is upstream's, unchanged)
import { categoryOf, isBound, tierOf } from '../../dt/categories';
import { durabilityTone, formatCount } from '../../dt/format';
import { Glyph } from '../../dt/icons';
import { ItemImage, itemLabel, useArtMissing } from '../../dt/ItemImage';
import { t } from '../../dt/text';

interface SlotProps {
  inventoryId: Inventory['id'];
  inventoryType: Inventory['type'];
  inventoryGroups: Inventory['groups'];
  item: Slot;
  /** All In City: 'fast' = a numbered tile of the fast slot column, 'card' = a grid card (default) */
  variant?: 'card' | 'fast';
  /** All In City: rail filter / search state of a fast tile (tiles are never hidden, only marked) */
  filter?: 'match' | 'dim';
}

/** Right side of the card strip (F4): shop price, crafting yield, durability "d/100", else the quantity. */
const stripValue = (item: SlotWithItem, inventoryType: Inventory['type']): string => {
  if (inventoryType === InventoryType.CRAFTING) return item.count ? `×${formatCount(item.count)}` : '';
  if (item.durability !== undefined) return `${Math.max(0, Math.trunc(item.durability))}/100`;
  return item.count ? formatCount(item.count) : '';
};

const InventorySlot: React.ForwardRefRenderFunction<HTMLDivElement, SlotProps> = (
  { item, inventoryId, inventoryType, inventoryGroups, variant = 'card', filter },
  ref
) => {
  const manager = useDragDropManager();
  const dispatch = useAppDispatch();
  const timerRef = useRef<number | null>(null);

  const canDrag = useCallback(() => {
    return canPurchaseItem(item, { type: inventoryType, groups: inventoryGroups }) && canCraftItem(item, inventoryType);
  }, [item, inventoryType, inventoryGroups]);

  const [{ isDragging }, drag] = useDrag<DragSource, void, { isDragging: boolean }>(
    () => ({
      type: 'SLOT',
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      item: () =>
        isSlotWithItem(item, inventoryType !== InventoryType.SHOP)
          ? {
              inventory: inventoryType,
              item: {
                name: item.name,
                slot: item.slot,
              },
              image: item?.name && `url(${getItemUrl(item) || 'none'}`,
            }
          : null,
      canDrag,
    }),
    [inventoryType, item]
  );

  const [{ isOver, canDropHere }, drop] = useDrop<DragSource, void, { isOver: boolean; canDropHere: boolean }>(
    () => ({
      accept: 'SLOT',
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDropHere: monitor.canDrop(), // All In City: drives the target highlight only
      }),
      drop: (source) => {
        dispatch(closeTooltip());
        switch (source.inventory) {
          case InventoryType.SHOP:
            onBuy(source, { inventory: inventoryType, item: { slot: item.slot } });
            break;
          case InventoryType.CRAFTING:
            onCraft(source, { inventory: inventoryType, item: { slot: item.slot } });
            break;
          default:
            onDrop(source, { inventory: inventoryType, item: { slot: item.slot } });
            break;
        }
      },
      canDrop: (source) =>
        (source.item.slot !== item.slot || source.inventory !== inventoryType) &&
        inventoryType !== InventoryType.SHOP &&
        inventoryType !== InventoryType.CRAFTING,
    }),
    [inventoryType, item]
  );

  useNuiEvent('refreshSlots', (data: { items?: ItemsPayload | ItemsPayload[] }) => {
    if (!isDragging && !data.items) return;
    if (!Array.isArray(data.items)) return;

    const itemSlot = data.items.find(
      (dataItem) => dataItem.item.slot === item.slot && dataItem.inventory === inventoryId
    );

    if (!itemSlot) return;

    manager.dispatch({ type: 'dnd-core/END_DRAG' });
  });

  const connectRef = (element: HTMLDivElement | null) => {
    if (!element) return;
    drag(drop(element));
  };

  const handleContext = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (inventoryType !== 'player' || !isSlotWithItem(item)) return;

    dispatch(openContextMenu({ item, coords: { x: event.clientX, y: event.clientY } }));
  };

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    dispatch(closeTooltip());
    if (timerRef.current) clearTimeout(timerRef.current);
    if (event.ctrlKey && isSlotWithItem(item) && inventoryType !== 'shop' && inventoryType !== 'crafting') {
      onDrop({ item: item, inventory: inventoryType });
    } else if (event.altKey && isSlotWithItem(item) && inventoryType === 'player') {
      onUse(item);
    }
  };

  const refs = useMergeRefs([connectRef, ref]);

  // ---- All In City markup (upstream: background-image tiles with a white hotbar number on spaces 1-5) ---------------
  const hasItem = isSlotWithItem(item);
  const disabled =
    !canPurchaseItem(item, { type: inventoryType, groups: inventoryGroups }) || !canCraftItem(item, inventoryType);
  const sameSpace = isOver && isDragging;
  const target = isOver && !sameSpace ? (canDropHere ? ' is-target' : ' is-invalid') : '';
  const hover = hasItem
    ? {
        onMouseEnter: () => {
          timerRef.current = window.setTimeout(() => {
            dispatch(openTooltip({ item, inventoryType }));
          }, 400) as unknown as number;
        },
        onMouseLeave: () => {
          dispatch(closeTooltip());
          if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
          }
        },
      }
    : {};
  const durability = hasItem && inventoryType !== 'shop' ? item.durability : undefined;
  const label = hasItem ? itemLabel(item) : '';
  const broken = durability !== undefined && durability <= 0;
  // fast tiles only: an item without art gets a one-line name + count row (the card's name fallback does not fit)
  const artMissing = useArtMissing(variant === 'fast' && hasItem ? getItemUrl(item) : undefined);

  if (variant === 'fast') {
    const aria = hasItem
      ? t('ui_dt_fast_n', 'ช่องด่วน %s', item.slot) + `: ${label}`
      : t('ui_dt_fast_n', 'ช่องด่วน %s', item.slot) + `: ${t('ui_dt_empty', 'ว่าง')}`;
    // durability is the colour bar only (the "92/100" text covered the art of a 42 px tile; the tooltip has it)
    const count = hasItem && item.count > 1 ? formatCount(item.count) : undefined;
    return (
      <div
        ref={refs}
        onContextMenu={handleContext}
        onClick={handleClick}
        role="listitem"
        aria-label={aria}
        className={`dt-fast${hasItem ? ' is-filled' : ' is-empty'}${filter ? ` is-${filter}` : ''}${
          broken ? ' is-broken' : ''
        }${isDragging ? ' is-dragging' : ''}${target}`}
      >
        <span className="dt-fast__key" aria-hidden="true">
          {item.slot}
        </span>
        {hasItem && (
          <div className={`dt-fast__body${artMissing ? ' dt-fast__body--named' : ''}`} {...hover}>
            {broken && <span className="dt-card__chip dt-fast__chip">{t('ui_dt_broken', 'พัง')}</span>}
            {artMissing ? (
              <>
                <span className="dt-fast__name">{label}</span>
                {count && <span className="dt-fast__qty">{count}</span>}
              </>
            ) : (
              <>
                <ItemImage item={item} className="dt-fast__art" />
                {count && <span className="dt-fast__count">{count}</span>}
              </>
            )}
            {durability !== undefined && !broken && (
              <span className={`dt-meter dt-meter--${durabilityTone(durability)}`} aria-hidden="true">
                <span style={{ transform: `scaleX(${Math.max(0, Math.min(100, durability)) / 100})` }} />
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  const category = hasItem ? categoryOf(item.name) : undefined;
  const tier = hasItem ? tierOf(item.name, item.metadata) : undefined;
  const bound = hasItem && inventoryType === 'player' && isBound(item.name);
  const shopItem = isSlotWithItem(item) && inventoryType === 'shop' ? item : undefined;
  const soldOut = shopItem !== undefined && shopItem.count === 0;
  const price = shopItem?.price !== undefined && shopItem.price > 0 ? shopItem.price : undefined;
  const itemCurrency =
    price !== undefined && shopItem?.currency && shopItem.currency !== 'money' && shopItem.currency !== 'black_money'
      ? shopItem.currency
      : undefined;
  // upstream coloured black_money prices red and money prices green: keep a dirty price visibly different
  const dirtyPrice = price !== undefined && shopItem?.currency === 'black_money';

  return (
    <div
      ref={refs}
      onContextMenu={handleContext}
      onClick={handleClick}
      role="listitem"
      aria-label={hasItem ? label : t('ui_dt_empty', 'ว่าง')}
      data-tier={tier}
      className={`dt-card${hasItem ? ' is-filled' : ' is-empty'}${disabled ? ' is-disabled' : ''}${
        broken ? ' is-broken' : ''
      }${isDragging ? ' is-dragging' : ''}${inventoryType === 'inspect' ? ' is-readonly' : ''}${target}`}
    >
      {hasItem && (
        <div className="dt-card__body" {...hover}>
          {broken && <span className="dt-card__chip">{t('ui_dt_broken', 'พัง')}</span>}
          {soldOut && <span className="dt-card__chip">{t('ui_dt_sold_out', 'หมด')}</span>}
          <ItemImage item={item} className="dt-card__art" />
          <div className="dt-card__strip">
            <span className="dt-card__marks">
              {category && <Glyph name={category} size={14} className="dt-card__cat" />}
              {bound && <Glyph name="lock" size={14} className="dt-card__lock" />}
            </span>
            {price !== undefined ? (
              <span className={`dt-card__value dt-card__price${dirtyPrice ? ' dt-card__price--dirty' : ''}`}>
                {itemCurrency ? (
                  <ItemImage item={itemCurrency} className="dt-card__currency" nameFallback={false} />
                ) : (
                  <Glyph name="bia" size={14} className="dt-card__bia" />
                )}
                {formatCount(price)}
              </span>
            ) : (
              <span className="dt-card__value">{stripValue(item, inventoryType)}</span>
            )}
          </div>
          {durability !== undefined && (
            <span className={`dt-meter dt-meter--${durabilityTone(durability)}`} aria-hidden="true">
              <span style={{ transform: `scaleX(${Math.max(0, Math.min(100, durability)) / 100})` }} />
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(React.forwardRef(InventorySlot));
