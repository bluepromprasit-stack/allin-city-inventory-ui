import React, { useContext } from 'react';
import { createPortal } from 'react-dom';
import { TransitionGroup } from 'react-transition-group';
import useNuiEvent from '../../hooks/useNuiEvent';
import useQueue from '../../hooks/useQueue';
import { Locale } from '../../store/locale';
import { SlotWithItem } from '../../typings';
import Fade from './transitions/Fade';
// All In City: restyled item notices (art or name, verb, label, quantity), with a coloured edge per kind — the verb is
// always printed, so colour is never the only signal. Closed inventory: a column above the wallet (bottom-right);
// open inventory: a row under the panels, so a notice never covers a card. Timing is upstream's (2.5 s).
import { useAppSelector } from '../../store';
import { ItemImage, itemLabel } from '../../dt/ItemImage';
import { formatCount } from '../../dt/format';

interface ItemNotificationProps {
  item: SlotWithItem;
  text: string;
  /** All In City: the locale key (ui_added / ui_removed / ui_equipped / ui_holstered) picks the edge colour */
  kind?: string;
  count?: number;
}

export const ItemNotificationsContext = React.createContext<{
  add: (item: ItemNotificationProps) => void;
} | null>(null);

export const useItemNotifications = () => {
  const itemNotificationsContext = useContext(ItemNotificationsContext);
  if (!itemNotificationsContext) throw new Error(`ItemNotificationsContext undefined`);
  return itemNotificationsContext;
};

const KIND: Record<string, string> = {
  ui_added: 'added',
  ui_removed: 'removed',
  ui_equipped: 'equipped',
  ui_holstered: 'holstered',
};

const ItemNotification = React.forwardRef(
  (props: { item: ItemNotificationProps; style?: React.CSSProperties }, ref: React.ForwardedRef<HTMLDivElement>) => {
    const slotItem = props.item.item;

    return (
      <div className={`dt-notice dt-notice--${KIND[props.item.kind ?? ''] ?? 'info'}`} style={props.style} ref={ref}>
        <ItemImage item={slotItem} className="dt-notice__art" nameFallback={false} />
        <span className="dt-notice__verb">{props.item.text}</span>
        <span className="dt-notice__label">{itemLabel(slotItem)}</span>
        {props.item.count ? <span className="dt-notice__count">×{formatCount(props.item.count)}</span> : null}
      </div>
    );
  }
);

let nextId = 0;

export const ItemNotificationsProvider = ({ children }: { children: React.ReactNode }) => {
  const inventoryOpen = useAppSelector((state) => state.view.visible);
  const queue = useQueue<{
    id: number;
    item: ItemNotificationProps;
    ref: React.RefObject<HTMLDivElement | null>;
  }>();

  const add = (item: ItemNotificationProps) => {
    const ref = React.createRef<HTMLDivElement>();
    const notification = { id: ++nextId, item, ref: ref };

    queue.add(notification);

    const timeout = setTimeout(() => {
      queue.remove();
      clearTimeout(timeout);
    }, 2500);
  };

  useNuiEvent<[item: SlotWithItem, text: string, count?: number]>('itemNotify', ([item, text, count]) => {
    add({ item: item, text: `${Locale[text] ?? text}`, kind: text, count });
  });

  return (
    <ItemNotificationsContext.Provider value={{ add }}>
      {children}
      {createPortal(
        <TransitionGroup
          className={`dt-notices${inventoryOpen ? ' is-inventory-open' : ''}`}
          aria-live="polite"
          role="status"
        >
          {queue.values.slice(-3).map((notification) => (
            <Fade key={`item-notification-${notification.id}`}>
              <ItemNotification item={notification.item} ref={notification.ref} />
            </Fade>
          ))}
        </TransitionGroup>,
        document.body
      )}
    </ItemNotificationsContext.Provider>
  );
};
