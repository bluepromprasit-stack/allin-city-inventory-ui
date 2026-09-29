// All In City: while an inventory text field has focus, game key mappings must not fire on typed letters (T would close
// the inventory, K would open the trunk, WASD would walk). patches/ox_inventory/002-dt-fastslots.patch registers the
// NUI callback `dtTextFocus`, which turns SetNuiFocusKeepInput off while `true` and back on with `false` (only while the
// inventory is open; every open sets it on again). Without that patch the call fails quietly and ox behaves as before.
import { useEffect, useRef } from 'react';
import { fetchNui } from '../utils/fetchNui';

const send = (focused: boolean) => {
  fetchNui('dtTextFocus', focused).catch(() => undefined);
};

/**
 * Focus/blur props for a text field. A field that unmounts while focused does not reliably fire `blur` in CEF, so the
 * hook also releases the game keys on unmount.
 */
export const useTextFocus = () => {
  const focused = useRef(false);
  useEffect(
    () => () => {
      if (focused.current) {
        focused.current = false;
        send(false);
      }
    },
    []
  );
  return {
    onFocus: () => {
      focused.current = true;
      send(true);
    },
    onBlur: () => {
      focused.current = false;
      send(false);
    },
  };
};

/** Blur whatever text field has focus (on close), so the next open starts with game keys live again. */
export const blurTextField = () => {
  const el = document.activeElement;
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) el.blur();
};
