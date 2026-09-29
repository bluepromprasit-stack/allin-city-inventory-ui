// All In City: weight meter of a panel header (upstream: a red/green mixed bar under the grid title, and the same bar
// for durability). Status is never colour alone: the value is always printed and "near full" / "full" get a text chip.
import React from 'react';
import { Glyph } from '../../dt/icons';
import { formatCount, formatWeightPair } from '../../dt/format';
import { t } from '../../dt/text';

const WeightMeter: React.FC<{ weight: number; maxWeight: number; used?: number; slots?: number }> = ({
  weight,
  maxWeight,
  used,
  slots,
}) => {
  const ratio = maxWeight > 0 ? weight / maxWeight : 0;
  const state = ratio >= 1 ? 'full' : ratio >= 0.8 ? 'near' : 'ok';

  return (
    <div className={`dt-weight is-${state}`}>
      <div className="dt-weight__row">
        <Glyph name="weight" size={14} className="dt-weight__glyph" />
        <span className="dt-weight__label">{t('ui_dt_weight', 'น้ำหนัก')}</span>
        <span className="dt-weight__value">{formatWeightPair(weight, maxWeight)}</span>
        {state !== 'ok' && (
          <span className={`dt-chip dt-chip--${state}`}>
            {state === 'full' ? t('ui_dt_weight_full', 'เต็ม') : t('ui_dt_weight_near', 'ใกล้เต็ม')}
          </span>
        )}
      </div>
      <div
        className="dt-weight__bar"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={maxWeight}
        aria-valuenow={weight}
        aria-label={t('ui_dt_weight', 'น้ำหนัก')}
      >
        <span style={{ transform: `scaleX(${Math.max(0, Math.min(1, ratio))})` }} />
      </div>
      {used !== undefined && slots !== undefined && (
        <span className="dt-weight__spaces">{t('ui_dt_spaces', 'ใช้ไป %s / %s ช่อง', formatCount(used), formatCount(slots))}</span>
      )}
    </div>
  );
};

export default WeightMeter;
