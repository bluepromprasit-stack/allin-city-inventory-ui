// All In City: the secondary panel (ground, trunk, glovebox, stash, shop, crafting, other player, ...), shown next to
// the player panel with the same height (F7). Upstream rendered one more 5-column InventoryGrid here, including an
// empty 50-space grid for `newdrop` (nothing to open) — that case is now the ground drop zone in the player footer.
import React, { useCallback, useEffect, useMemo } from 'react';
import InventoryGrid from './InventoryGrid';
import PageDots from './PageDots';
import { useAppDispatch, useAppSelector } from '../../store';
import { selectRightInventory } from '../../store/inventory';
import { setOtherPage } from '../../store/view';
import { getTotalWeight, isSlotWithItem } from '../../helpers';
import { t } from '../../dt/text';
import WeightMeter from '../utils/WeightBar';

export const OTHER_PER_PAGE = 16; // 4 columns x 4 rows, same row height as the player grid

// title (TH) + overline (EN) per ox inventory type; copy TODO(theme)
const PANE: Record<string, [string, string]> = {
  drop: ['พื้น', 'GROUND'],
  trunk: ['ท้ายรถ', 'TRUNK'],
  glovebox: ['ช่องเก็บของหน้ารถ', 'GLOVEBOX'],
  stash: ['ตู้เก็บของ', 'STASH'],
  shop: ['ร้านค้า', 'SHOP'],
  crafting: ['โต๊ะประดิษฐ์', 'CRAFTING'],
  otherplayer: ['กระเป๋าของอีกคน', 'PLAYER'],
  container: ['ภาชนะ', 'CONTAINER'],
  dumpster: ['ถังขยะ', 'DUMPSTER'],
  policeevidence: ['ตู้หลักฐาน', 'EVIDENCE'],
  inspect: ['ดูกระเป๋า', 'INSPECT'],
};
const PANE_DEFAULT: [string, string] = ['ที่เก็บของ', 'STORAGE'];

const hintOf = (type: string): string => {
  if (type === 'shop') return t('ui_dt_hint_buy', 'ลากของไปที่กระเป๋าเพื่อซื้อ');
  if (type === 'crafting') return t('ui_dt_hint_craft', 'ลากของไปที่กระเป๋าเพื่อประดิษฐ์');
  if (type === 'inspect') return t('ui_dt_readonly', 'ดูอย่างเดียว');
  return t('ui_dt_hint_move', 'ลากของไปมาระหว่างสองฝั่ง');
};

const RightInventory: React.FC = () => {
  const dispatch = useAppDispatch();
  const inventory = useAppSelector(selectRightInventory);
  const page = useAppSelector((state) => state.view.otherPage);
  const type = inventory.type;
  const [title, overline] = PANE[type] ?? PANE_DEFAULT;
  const listOnly = type === 'shop' || type === 'crafting'; // not drop targets: list the offers only

  const cells = useMemo(
    () => (listOnly ? inventory.items.filter((slot) => isSlotWithItem(slot)) : inventory.items),
    [listOnly, inventory.items]
  );
  const itemCount = useMemo(() => inventory.items.filter((slot) => isSlotWithItem(slot)).length, [inventory.items]);
  const weight = useMemo(
    () => (inventory.maxWeight !== undefined ? Math.floor(getTotalWeight(inventory.items) * 1000) / 1000 : 0),
    [inventory.maxWeight, inventory.items]
  );
  const onPage = useCallback((p: number) => dispatch(setOtherPage(p)), [dispatch]);
  // a different secondary inventory starts on its first page
  useEffect(() => {
    dispatch(setOtherPage(0));
  }, [dispatch, inventory.id, type]);
  const pageCount = Math.max(1, Math.ceil(cells.length / OTHER_PER_PAGE));

  return (
    <section className={`dt-panel dt-panel--other dt-panel--${type}`} aria-labelledby="dt-other-title">
      <header className="dt-head dt-head--other">
        <div className="dt-head__title dt-head__title--start">
          <p className="dt-overline">{t(`ui_dt_pane_${type}_en`, overline)}</p>
          <h2 id="dt-other-title" className="dt-title dt-title--pane">
            {t(`ui_dt_pane_${type}`, title)}
            {type === 'inspect' && <span className="dt-chip dt-chip--info">{t('ui_dt_readonly', 'ดูอย่างเดียว')}</span>}
          </h2>
          {inventory.label ? <p className="dt-subtitle dt-subtitle--pane">{inventory.label}</p> : null}
        </div>
        {inventory.maxWeight && !listOnly ? (
          <WeightMeter weight={weight} maxWeight={inventory.maxWeight} used={itemCount} slots={inventory.slots} />
        ) : null}
      </header>

      <div className="dt-body dt-body--other">
        <InventoryGrid
          className="dt-grid--other"
          inventory={inventory}
          cells={cells}
          page={page}
          onPage={onPage}
          perPage={OTHER_PER_PAGE}
          fillers="blank"
          empty={
            itemCount === 0 ? (
              <div className="dt-empty">
                <p>{listOnly ? t('ui_dt_pane_none', 'ไม่มีรายการ') : t('ui_dt_pane_empty', 'ว่าง · ลากของมาวางที่นี่')}</p>
              </div>
            ) : undefined
          }
        />
      </div>

      <footer className="dt-foot dt-foot--other">
        <PageDots page={page} count={pageCount} onPage={onPage} />
        <span className="dt-foot__hint" title={hintOf(type)}>
          {hintOf(type)}
        </span>
      </footer>
    </section>
  );
};

export default RightInventory;
