// All In City: category rail on the right of the player panel (Figma parity F2): exactly the brief's entries in the
// brief's order — ALL, ACCOUNT, KEY, FASHION, ACCESSORY, ECONOMY, WEAPON — then SEARCH as the last entry, which opens a
// search field in place. Thai label first, the brief's English word as a caption. One entry is active at a time
// (SEARCH counts as an entry). Filtering is client-side only: it never changes spaces, order or server data.
import React, { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { setCategory, setSearch, setSearchOpen } from '../../store/view';
import { RAIL, RailId, categoryCaption, categoryLabel } from '../../dt/categories';
import { Glyph } from '../../dt/icons';
import { t } from '../../dt/text';
import { formatCount } from '../../dt/format';
import { useTextFocus } from '../../dt/textFocus';

/** SEARCH entry opened in place: filters by item label and name (Thai or English), never closes the inventory on "t". */
const SearchField: React.FC = () => {
  const dispatch = useAppDispatch();
  const search = useAppSelector((state) => state.view.search);
  const inputRef = useRef<HTMLInputElement>(null);
  const focus = useTextFocus();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="dt-rail__item dt-rail__search is-active">
      <Glyph name="search" size={16} className="dt-rail__glyph" />
      <input
        ref={inputRef}
        type="text"
        className="dt-rail__input"
        value={search}
        placeholder={t('ui_dt_search_placeholder', 'พิมพ์ชื่อของ')}
        aria-label={t('ui_dt_search', 'ค้นหาของ')}
        maxLength={40}
        spellCheck={false}
        autoComplete="off"
        onChange={(event) => dispatch(setSearch(event.target.value))}
        onFocus={focus.onFocus}
        onBlur={() => {
          focus.onBlur();
          if (search.trim() === '') dispatch(setSearchOpen(false));
        }}
        onKeyUp={(event) => {
          // ESC with text clears the search and keeps the inventory open; ESC on an empty field closes as usual
          if (event.key === 'Escape' && search !== '') {
            event.stopPropagation();
            dispatch(setSearch(''));
          }
        }}
      />
      {search !== '' && (
        <button
          type="button"
          className="dt-rail__clear"
          aria-label={t('ui_dt_search_clear', 'ล้างคำค้น')}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            dispatch(setSearch(''));
            inputRef.current?.focus();
          }}
        >
          <Glyph name="close" size={14} />
        </button>
      )}
    </div>
  );
};

const CategoryRail: React.FC<{ counts: Record<RailId, number> }> = ({ counts }) => {
  const dispatch = useAppDispatch();
  const category = useAppSelector((state) => state.view.category);
  const searchOpen = useAppSelector((state) => state.view.searchOpen);
  const listRef = useRef<HTMLDivElement>(null);

  const pick = (id: RailId) => {
    if (searchOpen) dispatch(setSearchOpen(false));
    dispatch(setCategory(id));
  };

  // radiogroup keyboard: arrows move and select, like a native radio group
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    const buttons = Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>('button[role="radio"]') ?? []);
    const at = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (at < 0) return;
    event.preventDefault();
    const next = buttons[Math.max(0, Math.min(buttons.length - 1, at + (event.key === 'ArrowDown' ? 1 : -1)))];
    next.focus();
    next.click();
  };

  return (
    <div className="dt-rail">
      <div
        className="dt-rail__list"
        role="radiogroup"
        aria-label={t('ui_dt_rail', 'ประเภทไอเทม')}
        ref={listRef}
        onKeyDown={handleKeyDown}
      >
        {RAIL.map((id) => {
          const active = !searchOpen && category === id;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={active}
              tabIndex={active || (searchOpen && id === 'all') ? 0 : -1}
              className={`dt-rail__item${active ? ' is-active' : ''}${counts[id] === 0 ? ' is-zero' : ''}`}
              onClick={() => pick(id)}
            >
              <Glyph name={id} size={16} className="dt-rail__glyph" />
              <span className="dt-rail__text">
                <span className="dt-rail__label">{categoryLabel(id)}</span>
                <span className="dt-rail__caption">{categoryCaption(id)}</span>
              </span>
              <span className="dt-rail__count">{formatCount(counts[id])}</span>
            </button>
          );
        })}
      </div>
      {searchOpen ? (
        <SearchField />
      ) : (
        <button
          type="button"
          className="dt-rail__item dt-rail__search-open"
          onClick={() => {
            dispatch(setCategory('all'));
            dispatch(setSearchOpen(true));
          }}
        >
          <Glyph name="search" size={16} className="dt-rail__glyph" />
          <span className="dt-rail__text">
            <span className="dt-rail__label">{categoryLabel('search')}</span>
            <span className="dt-rail__caption">{categoryCaption('search')}</span>
          </span>
        </button>
      )}
    </div>
  );
};

export default CategoryRail;
