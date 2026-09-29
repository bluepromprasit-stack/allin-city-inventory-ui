// All In City: item art with a readable fallback (Figma parity F4). ox draws item art as a CSS background, which cannot
// tell a missing PNG from a real one; 36 theme items have no art yet (TODO(theme)), so an <img> with onError falls back
// to the item's NAME inside a dashed "art pending" frame — no card is ever anonymous. Failed URLs are remembered so
// paging and re-renders do not flicker, and every subscriber (useArtMissing) re-renders when one fails.
import React, { useSyncExternalStore } from 'react';
import { getItemUrl } from '../helpers';
import { Items } from '../store/items';
import type { SlotWithItem } from '../typings';

const failed = new Set<string>();
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
const markFailed = (url: string) => {
  if (failed.has(url)) return;
  failed.add(url);
  for (const listener of listeners) listener();
};

/** True once the browser failed to load this art URL (used by the drag preview, which cannot wait for onError). */
export const isArtMissing = (url: string | undefined): boolean => !url || failed.has(url);

/**
 * isArtMissing as a hook: the caller re-renders when an <ItemImage> of that URL fails later. The small fast slot tiles
 * use it to switch items without art to a one-line name layout (a name squeezed under the count badge is unreadable).
 */
export const useArtMissing = (url: string | undefined): boolean =>
  useSyncExternalStore(subscribe, () => isArtMissing(url));

export const itemLabel = (item: SlotWithItem | string): string =>
  typeof item === 'string'
    ? Items[item]?.label || item
    : item.metadata?.label || Items[item.name]?.label || item.name;

export const ItemImage: React.FC<{
  item: SlotWithItem | string;
  className?: string;
  /** show the name when the art is missing (default); false = an empty dashed frame only (tiny icons) */
  nameFallback?: boolean;
}> = ({ item, className, nameFallback = true }) => {
  const url = getItemUrl(item);
  const missing = useArtMissing(url);

  if (!url || missing) {
    return (
      <span className={`dt-art dt-art--pending ${className ?? ''}`}>
        {nameFallback && <span className="dt-art__name">{itemLabel(item)}</span>}
      </span>
    );
  }

  return (
    <span className={`dt-art ${className ?? ''}`}>
      <img src={url} alt="" draggable={false} decoding="async" onError={() => markFailed(url)} />
    </span>
  );
};
