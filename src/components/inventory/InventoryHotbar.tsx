import React, { useState } from 'react';
import { getItemUrl, isSlotWithItem } from '../../helpers';
import useNuiEvent from '../../hooks/useNuiEvent';
import { useAppSelector } from '../../store';
import { selectLeftInventory } from '../../store/inventory';
import SlideUp from '../utils/transitions/SlideUp';
// All In City: the TAB peek shows the same fast slots as the inventory's left column (1..fastslots, upstream: 1..5),
// restyled as a row of numbered tiles. Timing is upstream's (3 s, TAB again hides it).
import { durabilityTone, formatCount } from '../../dt/format';
import { ItemImage, itemLabel, useArtMissing } from '../../dt/ItemImage';
import { t } from '../../dt/text';
import { Slot } from '../../typings';

// Same rules as the fast column tiles (InventorySlot variant 'fast'): durability = colour bar only (upstream's hotbar
// also drew a bar, and "92/100" covered the art), durability 0 = the grid card's "พัง" chip in place of the empty bar,
// an item without art = its name with the count on its own row (never under a badge).
const PeekTile: React.FC<{ item: Slot }> = ({ item }) => {
  const filled = isSlotWithItem(item);
  const artMissing = useArtMissing(filled ? getItemUrl(item) : undefined);
  const broken = filled && item.durability !== undefined && item.durability <= 0;
  const count = filled && item.count > 1 ? formatCount(item.count) : undefined;
  return (
    <div className={`dt-peek__tile${filled ? ' is-filled' : ''}${broken ? ' is-broken' : ''}`} role="listitem">
      <span className="dt-peek__key">{item.slot}</span>
      {filled && (
        <>
          {broken && <span className="dt-card__chip dt-peek__chip">{t('ui_dt_broken', 'พัง')}</span>}
          {artMissing ? (
            <span className="dt-peek__named">
              <span className="dt-peek__name">{itemLabel(item)}</span>
              {count && <span className="dt-peek__qty">{count}</span>}
            </span>
          ) : (
            <>
              <ItemImage item={item} className="dt-peek__art" />
              {count && <span className="dt-peek__count">{count}</span>}
            </>
          )}
          {item.durability !== undefined && !broken && (
            <span className={`dt-meter dt-meter--${durabilityTone(item.durability)}`} aria-hidden="true">
              <span style={{ transform: `scaleX(${Math.max(0, Math.min(100, item.durability)) / 100})` }} />
            </span>
          )}
        </>
      )}
    </div>
  );
};

const InventoryHotbar: React.FC = () => {
  const [hotbarVisible, setHotbarVisible] = useState(false);
  const fastslots = useAppSelector((state) => state.view.fastslots);
  const items = useAppSelector(selectLeftInventory).items.slice(0, fastslots);

  //stupid fix for timeout
  const [handle, setHandle] = useState<ReturnType<typeof setTimeout>>();
  useNuiEvent('toggleHotbar', () => {
    if (hotbarVisible) {
      setHotbarVisible(false);
    } else {
      if (handle) clearTimeout(handle);
      setHotbarVisible(true);
      setHandle(setTimeout(() => setHotbarVisible(false), 3000));
    }
  });

  return (
    <SlideUp in={hotbarVisible}>
      <div className="dt-peek" role="list" aria-label={t('ui_dt_fast_title', 'ช่องด่วน')}>
        {items.map((item) => (
          <PeekTile key={`hotbar-${item.slot}`} item={item} />
        ))}
      </div>
    </SlideUp>
  );
};

export default InventoryHotbar;
