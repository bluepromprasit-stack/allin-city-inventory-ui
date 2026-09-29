import { Locale } from '../../store/locale';
import React from 'react';
import {
  FloatingFocusManager,
  FloatingOverlay,
  FloatingPortal,
  useDismiss,
  useFloating,
  useInteractions,
  useTransitionStyles,
} from '@floating-ui/react';
// All In City: restyled help dialog (upstream "Useful controls"), plus the fast slot lines and the GPL notice of this
// modified build (GPLv3 section 5(a)/(d); source location in patches/ox_inventory/web/README.md, TODO(company) URL).
import { Glyph } from '../../dt/icons';
import { t } from '../../dt/text';

interface Props {
  infoVisible: boolean;
  setInfoVisible: React.Dispatch<React.SetStateAction<boolean>>;
  fastslots: number;
}

const Line: React.FC<{ keys: string[]; text: string }> = ({ keys, text }) => (
  <div className="dt-help__row">
    <span className="dt-help__keys">
      {keys.map((key) => (
        <kbd key={key} className="dt-kbd">
          {key}
        </kbd>
      ))}
    </span>
    <span className="dt-help__text">{text}</span>
  </div>
);

const UsefulControls: React.FC<Props> = ({ infoVisible, setInfoVisible, fastslots }) => {
  const { refs, context } = useFloating({
    open: infoVisible,
    onOpenChange: setInfoVisible,
  });

  const dismiss = useDismiss(context, {
    outsidePressEvent: 'mousedown',
  });

  const { isMounted, styles } = useTransitionStyles(context);

  const { getFloatingProps } = useInteractions([dismiss]);
  const rmb = t('ui_dt_key_rmb', 'คลิกขวา');
  const click = t('ui_dt_key_click', 'คลิก');
  const drag = t('ui_dt_key_drag', 'ลาก');

  return (
    <>
      {isMounted && (
        <FloatingPortal>
          <FloatingOverlay lockScroll className="dt-help-overlay" data-open={infoVisible} style={styles}>
            <FloatingFocusManager context={context}>
              <div
                ref={refs.setFloating}
                {...getFloatingProps()}
                className="dt-help"
                style={styles}
                role="dialog"
                aria-modal="true"
                aria-labelledby="dt-help-title"
              >
                <div className="dt-help__head">
                  <p id="dt-help-title" className="dt-help__title">
                    {Locale.ui_usefulcontrols || 'วิธีใช้'}
                  </p>
                  <button
                    type="button"
                    className="dt-btn dt-btn--ghost dt-btn--square"
                    onClick={() => setInfoVisible(false)}
                    aria-label={Locale.ui_close || 'ปิด'}
                  >
                    <Glyph name="close" size={16} />
                  </button>
                </div>
                <div className="dt-help__rows">
                  <Line keys={['T']} text={t('ui_dt_help_open', 'เปิดกระเป๋า · กด T หรือ ESC อีกครั้งเพื่อปิด')} />
                  <Line
                    keys={[`1–${fastslots}`]}
                    text={t('ui_dt_help_fast', 'ลากของไปวางที่ช่องเลขด้านซ้าย ปิดกระเป๋า แล้วกดเลขนั้นเพื่อใช้')}
                  />
                  <Line keys={['TAB']} text={t('ui_dt_help_peek', 'ดูช่องด่วนโดยไม่เปิดกระเป๋า')} />
                  <Line keys={[rmb]} text={Locale.ui_rmb || 'เปิดเมนูของ'} />
                  <Line keys={['ALT', click]} text={Locale.ui_alt_lmb || 'ใช้ทันที'} />
                  {/* upstream's quick move targets the other pane; with nothing else open that is the ground
                      (upstream drew an empty "Drop" pane there, this layout hides it), so the help says so */}
                  <Line
                    keys={['CTRL', click]}
                    text={t('ui_dt_help_ctrl', 'ย้ายทั้งกองไปอีกฝั่ง · ไม่มีอีกฝั่ง = ทิ้งลงพื้น')}
                  />
                  <Line keys={['SHIFT', drag]} text={Locale.ui_shift_drag || 'แบ่งครึ่ง'} />
                  <Line
                    keys={['CTRL', 'SHIFT', click]}
                    text={t('ui_dt_help_ctrl_shift', 'ย้ายครึ่งกองไปอีกฝั่ง · ไม่มีอีกฝั่ง = ทิ้งลงพื้น')}
                  />
                  <Line keys={['CTRL', 'C']} text={Locale.ui_ctrl_c || 'คัดลอกเลขประจำอาวุธ'} />
                </div>
                <p className="dt-help__legal">
                  {t(
                    'ui_dt_legal',
                    'ox_inventory © Overextended · GPL-3.0-or-later · ฉบับแก้ไขโดย All In City · ซอร์ส: %s',
                    t('ui_dt_source_url', 'https://github.com/bluepromprasit-stack/allin-city-inventory-ui')
                  )}
                </p>
              </div>
            </FloatingFocusManager>
          </FloatingOverlay>
        </FloatingPortal>
      )}
    </>
  );
};

export default UsefulControls;
