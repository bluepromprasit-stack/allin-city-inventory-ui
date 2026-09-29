import React, { useState, useRef, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { useAppDispatch, useAppSelector } from '../../store';
import { selectItemAmount, setItemAmount } from '../../store/inventory';
import { DragSource } from '../../typings';
import { onUse } from '../../dnd/onUse';
import { onGive } from '../../dnd/onGive';
import { onDrop } from '../../dnd/onDrop';
// All In City: footer of the player panel (upstream: a middle column with the amount, Use, Give and Close buttons).
// Close and the help button moved to the panel header; Use and Give are still the same drop targets, and the ground
// zone replaces upstream's empty 50-space "newdrop" grid (a drop on it is upstream's drop on the first ground space).
import { Glyph, GlyphName } from '../../dt/icons';
import { t } from '../../dt/text';
import { useTextFocus } from '../../dt/textFocus';

const formatAmount = (n: number) => (n > 0 ? n.toLocaleString('en-US') : '');
const digitsOnly = (s: string) => s.replace(/\D/g, '');
const countDigitsBefore = (s: string, index: number) => digitsOnly(s.substring(0, index)).length;

const DropZone: React.FC<{
  glyph: GlyphName;
  label: string;
  tone?: 'danger';
  onItem: (source: DragSource) => void;
}> = ({ glyph, label, tone, onItem }) => {
  const [{ isOver, dragging }, drop] = useDrop<DragSource, void, { isOver: boolean; dragging: boolean }>(
    () => ({
      accept: 'SLOT',
      collect: (monitor) => ({ isOver: monitor.isOver(), dragging: monitor.getItem() !== null }),
      drop: (source) => {
        source.inventory === 'player' && onItem(source);
      },
    }),
    [onItem]
  );

  return (
    <button
      type="button"
      className={`dt-zone${tone ? ` dt-zone--${tone}` : ''}${dragging ? ' is-armed' : ''}${isOver ? ' is-over' : ''}`}
      ref={(el) => {
        drop(el);
      }}
      title={t('ui_dt_zone_hint', 'ลากของมาวาง')}
    >
      <Glyph name={glyph} size={16} />
      <span>{label}</span>
    </button>
  );
};

const InventoryControl: React.FC<{ groundDrop: boolean }> = ({ groundDrop }) => {
  const itemAmount = useAppSelector(selectItemAmount);
  const dispatch = useAppDispatch();
  const focus = useTextFocus();

  const [value, setValue] = useState(formatAmount(itemAmount));
  const inputRef = useRef<HTMLInputElement>(null);
  const cursorRef = useRef<number | null>(null);

  const commitValue = (raw: string, cursorIndex: number) => {
    const digitsBefore = countDigitsBefore(raw, cursorIndex);
    const num = parseInt(digitsOnly(raw), 10) || 0;

    setValue(formatAmount(num));
    dispatch(setItemAmount(num));
    cursorRef.current = digitsBefore;
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    commitValue(event.target.value, event.target.selectionStart ?? 0);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const el = event.currentTarget;
    const pos = el.selectionStart ?? 0;

    if (pos !== el.selectionEnd) return;

    if (event.key === 'Backspace' && el.value[pos - 1] === ',') {
      event.preventDefault();
      commitValue(el.value.slice(0, pos - 2) + el.value.slice(pos), pos - 2);
    } else if (event.key === 'Delete' && el.value[pos] === ',') {
      event.preventDefault();
      commitValue(el.value.slice(0, pos) + el.value.slice(pos + 2), pos);
    }
  };

  useEffect(() => {
    if (!inputRef.current || cursorRef.current === null) return;
    let newPos = 0;
    let count = 0;

    for (let i = 0; i < value.length && count < cursorRef.current; i++) {
      if (/\d/.test(value[i])) count++;
      newPos++;
    }

    inputRef.current.setSelectionRange(newPos, newPos);
    cursorRef.current = null;
  }, [value]);

  return (
    <div className="dt-controls">
      <label className="dt-amount" title={t('ui_dt_amount_hint', 'จำนวนที่จะย้าย ใช้ หรือให้ · เว้นว่าง = ทั้งกอง')}>
        <input
          className="dt-amount__input"
          type="text"
          inputMode="numeric"
          ref={inputRef}
          value={value}
          aria-label={t('ui_dt_amount', 'จำนวน')}
          placeholder={t('ui_dt_amount', 'จำนวน')}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={focus.onFocus}
          onBlur={focus.onBlur}
          min={0}
        />
      </label>
      <DropZone glyph="use" label={t('ui_use', 'ใช้')} onItem={(source) => onUse(source.item)} />
      <DropZone glyph="give" label={t('ui_dt_zone_give', 'ให้คนใกล้ตัว')} onItem={(source) => onGive(source.item)} />
      {groundDrop && (
        <DropZone
          glyph="drop"
          tone="danger"
          label={t('ui_dt_zone_drop', 'ทิ้งลงพื้น')}
          onItem={(source) => onDrop(source, { inventory: 'newdrop', item: { slot: 1 } })}
        />
      )}
    </div>
  );
};

export default InventoryControl;
