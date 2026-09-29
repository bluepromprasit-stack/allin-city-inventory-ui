// All In City: page indicator, bottom-left (Figma parity F3). Short bars, never dots or diamonds (a small diamond reads
// as a card suit — COMPLIANCE-REDLINES V-02). Each bar is a 40 px button; hovering one for 400 ms while dragging an item
// flips to that page, so an item can travel to another page mid-drag. More than 8 pages: previous/next arrows instead.
import React, { useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { DragSource } from '../../typings';
import { Glyph } from '../../dt/icons';
import { t } from '../../dt/text';

const FLIP_MS = 400;
const MAX_BARS = 8;

const useFlipOnHover = (onHover: () => void) => {
  const [{ isOver }, drop] = useDrop<DragSource, void, { isOver: boolean }>(
    () => ({ accept: 'SLOT', collect: (monitor) => ({ isOver: monitor.isOver() }), canDrop: () => false }),
    []
  );
  useEffect(() => {
    if (!isOver) return;
    const timer = window.setTimeout(onHover, FLIP_MS);
    return () => window.clearTimeout(timer);
  }, [isOver, onHover]);
  return { isOver, drop };
};

const Bar: React.FC<{ index: number; active: boolean; onPage: (p: number) => void }> = ({ index, active, onPage }) => {
  const { isOver, drop } = useFlipOnHover(() => onPage(index));
  return (
    <button
      type="button"
      ref={(el) => {
        drop(el);
      }}
      className={`dt-pages__bar${active ? ' is-active' : ''}${isOver ? ' is-hover' : ''}`}
      aria-label={t('ui_dt_page_n', 'หน้า %s', index + 1)}
      aria-current={active ? 'page' : undefined}
      onClick={() => onPage(index)}
    >
      <span />
    </button>
  );
};

const Arrow: React.FC<{ dir: -1 | 1; disabled: boolean; onStep: () => void }> = ({ dir, disabled, onStep }) => {
  const { drop } = useFlipOnHover(() => !disabled && onStep());
  return (
    <button
      type="button"
      ref={(el) => {
        drop(el);
      }}
      className={`dt-pages__arrow${dir < 0 ? ' is-prev' : ''}`}
      disabled={disabled}
      onClick={onStep}
      aria-label={dir < 0 ? t('ui_dt_page_prev', 'หน้าก่อน') : t('ui_dt_page_next', 'หน้าถัดไป')}
    >
      <Glyph name="chevron" size={16} />
    </button>
  );
};

const PageDots: React.FC<{ page: number; count: number; onPage: (page: number) => void }> = ({ page, count, onPage }) => {
  const total = Math.max(1, count);
  const current = Math.min(page, total - 1);
  return (
    <nav className="dt-pages" aria-label={t('ui_dt_pages', 'หน้า')}>
      {total <= MAX_BARS ? (
        <div className="dt-pages__bars">
          {Array.from({ length: total }, (_, i) => (
            <Bar key={i} index={i} active={i === current} onPage={onPage} />
          ))}
        </div>
      ) : (
        <div className="dt-pages__bars">
          <Arrow dir={-1} disabled={current === 0} onStep={() => onPage(Math.max(0, current - 1))} />
          <Arrow dir={1} disabled={current >= total - 1} onStep={() => onPage(Math.min(total - 1, current + 1))} />
        </div>
      )}
      <span className="dt-pages__label">{t('ui_dt_page', 'หน้า %s / %s', current + 1, total)}</span>
    </nav>
  );
};

export default PageDots;
