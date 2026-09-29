// All In City: the player panel (Figma parity F1-F5; upstream rendered one 5-column InventoryGrid here).
//   header  weight | INVENTORY / กระเป๋าส่วนตัว (centred) | help + close
//   body    fast slot column (spaces 1..fastslots) | 6 x 4 card grid (the other spaces, paged) | category rail + search
//   footer  page bars | amount + Use / Give / ground drop zones
// Everything is presentation: spaces keep their numbers and every move is upstream's onDrop/onBuy/onCraft.
import React, { useCallback, useMemo, useState } from 'react';
import InventoryGrid from './InventoryGrid';
import FastSlotColumn from './FastSlotColumn';
import CategoryRail from './CategoryRail';
import PageDots from './PageDots';
import InventoryControl from './InventoryControl';
import UsefulControls from './UsefulControls';
import { useAppDispatch, useAppSelector } from '../../store';
import { selectLeftInventory, selectRightInventory } from '../../store/inventory';
import { setCategory, setPage, setSearchOpen } from '../../store/view';
import { getTotalWeight, isSlotWithItem } from '../../helpers';
import { Slot } from '../../typings';
import { fetchNui } from '../../utils/fetchNui';
import { RAIL, RailId, categoryLabel, categoryOf } from '../../dt/categories';
import { itemLabel } from '../../dt/ItemImage';
import { t } from '../../dt/text';
import { Glyph } from '../../dt/icons';
import WeightMeter from '../utils/WeightBar';

export const PER_PAGE = 24; // 6 columns x 4 rows (Figma parity F3)

const normalise = (s: string) => s.normalize('NFC').toLocaleLowerCase('th');

const LeftInventory: React.FC = () => {
  const dispatch = useAppDispatch();
  const inventory = useAppSelector(selectLeftInventory);
  const rightType = useAppSelector(selectRightInventory).type;
  const fastslots = useAppSelector((state) => state.view.fastslots);
  const category = useAppSelector((state) => state.view.category);
  const search = useAppSelector((state) => state.view.search);
  const page = useAppSelector((state) => state.view.page);
  const [helpOpen, setHelpOpen] = useState(false);

  const fast = Math.min(fastslots, inventory.items.length);
  const fastItems = inventory.items.slice(0, fast);
  const rest = inventory.items.slice(fast);
  const query = normalise(search.trim());
  const filtering = category !== 'all' || query !== '';

  const matches = useCallback(
    (slot: Slot) => {
      if (!isSlotWithItem(slot)) return false;
      if (category !== 'all' && categoryOf(slot.name) !== category) return false;
      if (query === '') return true;
      return normalise(itemLabel(slot)).includes(query) || normalise(slot.name).includes(query);
    },
    [category, query]
  );

  // ALL: every space after the fast slots, in space order (the real bag layout). Filtered: matching items in space
  // order, the last page padded with real empty spaces so every visible cell is still a normal drop target.
  const cells = useMemo(() => {
    if (!filtering) return rest;
    const hits = rest.filter(matches);
    const room = Math.max(1, Math.ceil(hits.length / PER_PAGE)) * PER_PAGE - hits.length;
    return [...hits, ...rest.filter((slot) => !isSlotWithItem(slot)).slice(0, room)];
  }, [filtering, rest, matches]);
  const hitCount = filtering ? rest.filter(matches).length : rest.length;
  // matches in the fast column count too: "nothing found" must never show while a fast tile is marked as a match
  const fastHitCount = filtering ? fastItems.filter(matches).length : fastItems.length;

  const counts = useMemo(() => {
    const out = Object.fromEntries(RAIL.map((id) => [id, 0])) as Record<RailId, number>;
    for (const slot of inventory.items) {
      if (!isSlotWithItem(slot)) continue;
      out.all += 1;
      out[categoryOf(slot.name)] += 1;
    }
    return out;
  }, [inventory.items]);

  const weight = useMemo(
    () => (inventory.maxWeight !== undefined ? Math.floor(getTotalWeight(inventory.items) * 1000) / 1000 : 0),
    [inventory.maxWeight, inventory.items]
  );
  const used = counts.all;
  const onPage = useCallback((p: number) => dispatch(setPage(p)), [dispatch]);
  const pageCount = Math.max(1, Math.ceil(cells.length / PER_PAGE));

  // nothing in the grid: either nothing at all, or every match sits in the fast column (say so — a gold tile border
  // alone is easy to miss next to an empty grid)
  const empty =
    filtering && hitCount === 0 ? (
      <div className="dt-empty">
        <p>
          {fastHitCount > 0
            ? t('ui_dt_found_in_fast', 'ของที่ตรงอยู่ในช่องด่วนด้านซ้าย (%s ช่อง)', fastHitCount)
            : query !== ''
              ? t('ui_dt_search_empty', 'ไม่พบ "%s" ในกระเป๋า', search.trim())
              : t('ui_dt_filter_empty', 'ไม่มีของในหมวด %s', categoryLabel(category))}
        </p>
        <button
          type="button"
          className="dt-btn dt-btn--ghost"
          onClick={() => {
            dispatch(setSearchOpen(false));
            dispatch(setCategory('all'));
          }}
        >
          {t('ui_dt_show_all', 'ดูทั้งหมด')}
        </button>
      </div>
    ) : undefined;

  return (
    <section className="dt-panel dt-panel--player" aria-labelledby="dt-inv-title">
      <header className="dt-head">
        <div className="dt-head__side">
          {inventory.maxWeight ? (
            <WeightMeter weight={weight} maxWeight={inventory.maxWeight} used={used} slots={inventory.slots} />
          ) : null}
        </div>
        <div className="dt-head__title">
          <h1 id="dt-inv-title" className="dt-title">
            {t('ui_dt_title_en', 'INVENTORY')}
          </h1>
          <p className="dt-subtitle">{t('ui_dt_title', 'กระเป๋าส่วนตัว')}</p>
        </div>
        <div className="dt-head__side dt-head__side--end">
          <button type="button" className="dt-btn dt-btn--ghost dt-btn--icon" onClick={() => setHelpOpen(true)}>
            <Glyph name="help" size={16} />
            <span>{t('ui_dt_help', 'วิธีใช้')}</span>
          </button>
          <button type="button" className="dt-btn dt-btn--ghost dt-btn--icon" onClick={() => fetchNui('exit')}>
            <span>{t('ui_close', 'ปิด')}</span>
            <kbd className="dt-kbd">T</kbd>
            <kbd className="dt-kbd">ESC</kbd>
          </button>
        </div>
      </header>

      <div className="dt-body">
        <div className="dt-fastwrap">
          <p className="dt-fastwrap__title" aria-hidden="true">
            {t('ui_dt_fast_title', 'ช่องด่วน')}
          </p>
          <FastSlotColumn inventory={inventory} items={fastItems} filtering={filtering} matches={matches} />
        </div>
        <InventoryGrid
          className="dt-grid--player"
          inventory={inventory}
          cells={cells}
          page={page}
          onPage={onPage}
          perPage={PER_PAGE}
          fillers={filtering ? 'free' : 'blank'}
          empty={empty}
        />
        <CategoryRail counts={counts} />
      </div>

      <footer className="dt-foot">
        <div className="dt-foot__pages">
          <PageDots page={page} count={pageCount} onPage={onPage} />
          <span className="dt-foot__hint" title={t('ui_dt_fast_hint', 'ลากของไปวางที่ช่องเลข แล้วกดเลขนั้นเพื่อใช้')}>
            {t('ui_dt_fast_hint', 'ลากของไปวางที่ช่องเลข แล้วกดเลขนั้นเพื่อใช้')}
          </span>
        </div>
        <InventoryControl groundDrop={rightType === 'newdrop'} />
      </footer>
      <UsefulControls infoVisible={helpOpen} setInfoVisible={setHelpOpen} fastslots={fast} />
    </section>
  );
};

export default LeftInventory;
