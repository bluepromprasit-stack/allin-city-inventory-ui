import { Inventory, SlotWithItem } from '../../typings';
import React, { Fragment, useMemo } from 'react';
import { Items } from '../../store/items';
import { Locale } from '../../store/locale';
import { useAppSelector } from '../../store';
import Markdown from '../utils/Markdown';
// All In City: restyled tooltip (F4: the item name lives here). Same data as upstream, plus the category, weight,
// the fast slot number and the bound hint. Descriptions still render only through Markdown (DOMPurify.sanitize).
import { categoryCaption, categoryLabel, categoryOf, isBound } from '../../dt/categories';
import { formatCount, formatWeight } from '../../dt/format';
import { Glyph } from '../../dt/icons';
import { ItemImage } from '../../dt/ItemImage';
import { t } from '../../dt/text';

const Row: React.FC<{ label: React.ReactNode; children: React.ReactNode }> = ({ label, children }) => (
  <>
    <dt>{label}</dt>
    <dd>{children}</dd>
  </>
);

const SlotTooltip: React.ForwardRefRenderFunction<
  HTMLDivElement,
  { item: SlotWithItem; inventoryType: Inventory['type']; style: React.CSSProperties }
> = ({ item, inventoryType, style }, ref) => {
  const additionalMetadata = useAppSelector((state) => state.inventory.additionalMetadata);
  const fastslots = useAppSelector((state) => state.view.fastslots);
  const itemData = useMemo(() => Items[item.name], [item]);
  const ingredients = useMemo(() => {
    if (!item.ingredients) return null;
    return Object.entries(item.ingredients).sort((a, b) => a[1] - b[1]);
  }, [item]);
  const description = item.metadata?.description || itemData?.description;
  const ammoName = itemData?.ammoName && Items[itemData?.ammoName]?.label;
  const category = categoryOf(item.name);
  const fast = inventoryType === 'player' && item.slot <= fastslots ? item.slot : undefined;
  const bound = inventoryType === 'player' && isBound(item.name);
  const each = item.count > 0 ? item.weight / item.count : item.weight;

  return (
    <div className="dt-tip" ref={ref} style={style} role="tooltip">
      <div className="dt-tip__head">
        <p className="dt-tip__name">{item.metadata?.label || itemData?.label || item.name}</p>
        <span className="dt-tip__cat">
          <Glyph name={category} size={14} />
          {categoryLabel(category)}
          <span className="dt-tip__cat-en">{categoryCaption(category)}</span>
        </span>
      </div>
      {!itemData ? null : (
        <>
          <dl className="dt-tip__rows">
            {fast !== undefined && (
              <Row label={t('ui_dt_fast_title', 'ช่องด่วน')}>
                <kbd className="dt-kbd">{fast}</kbd> {t('ui_dt_fast_use', 'กดเลขนี้เพื่อใช้')}
              </Row>
            )}
            {inventoryType !== 'shop' && item.count > 0 && (
              <Row label={t('ui_dt_count', 'จำนวน')}>{formatCount(item.count)}</Row>
            )}
            {item.weight > 0 && (
              <Row label={t('ui_dt_weight', 'น้ำหนัก')}>
                {/* player/other inventories carry the stack's total weight; shop and crafting entries carry the weight
                    of ONE piece (ox modules/shops/server.lua, modules/crafting) with count = stock / yield */}
                {item.count > 1 && inventoryType !== 'shop' && inventoryType !== 'crafting'
                  ? t('ui_dt_weight_each', 'ชิ้นละ %s · รวม %s', formatWeight(each), formatWeight(item.weight))
                  : formatWeight(item.weight)}
              </Row>
            )}
            {inventoryType === 'shop' && item.price !== undefined && (
              <Row label={t('ui_dt_price', 'ราคา')}>
                <span className="dt-tip__price">
                  <Glyph name="bia" size={14} />
                  {formatCount(item.price)}
                  {item.currency && item.currency !== 'money' ? ` ${Items[item.currency]?.label || item.currency}` : ''}
                </span>
              </Row>
            )}
            {inventoryType === 'shop' && item.count !== undefined && (
              <Row label={t('ui_dt_stock', 'คงเหลือ')}>{formatCount(item.count)}</Row>
            )}
            {inventoryType === 'crafting' && (
              <Row label={t('ui_dt_craft_time', 'ใช้เวลา')}>
                {t('ui_dt_seconds', '%s วินาที', (item.duration !== undefined ? item.duration : 3000) / 1000)}
              </Row>
            )}
            {inventoryType !== 'crafting' && (
              <>
                {item.durability !== undefined && (
                  <Row label={Locale.ui_durability || 'สภาพ'}>{Math.trunc(item.durability)}%</Row>
                )}
                {item.metadata?.ammo !== undefined && <Row label={Locale.ui_ammo || 'กระสุน'}>{item.metadata.ammo}</Row>}
                {ammoName && <Row label={Locale.ammo_type || 'ชนิดกระสุน'}>{ammoName}</Row>}
                {item.metadata?.serial && <Row label={Locale.ui_serial || 'เลขประจำอาวุธ'}>{item.metadata.serial}</Row>}
                {item.metadata?.components && item.metadata?.components[0] && (
                  <Row label={Locale.ui_components || 'อุปกรณ์เสริม'}>
                    {(item.metadata?.components).map((component: string, index: number, array: []) =>
                      index + 1 === array.length ? Items[component]?.label : Items[component]?.label + ', '
                    )}
                  </Row>
                )}
                {item.metadata?.weapontint && <Row label={Locale.ui_tint || 'สีอาวุธ'}>{item.metadata.weapontint}</Row>}
                {item.metadata?.type && <Row label={t('ui_dt_type', 'ชนิด')}>{String(item.metadata.type)}</Row>}
                {additionalMetadata.map((data: { metadata: string; value: string }, index: number) => (
                  <Fragment key={`metadata-${index}`}>
                    {item.metadata && item.metadata[data.metadata] && (
                      <Row label={data.value}>{item.metadata[data.metadata]}</Row>
                    )}
                  </Fragment>
                ))}
              </>
            )}
          </dl>
          {inventoryType === 'crafting' && ingredients && (
            <div className="dt-tip__ingredients">
              <p className="dt-tip__section">{t('ui_dt_ingredients', 'วัตถุดิบที่ต้องใช้')}</p>
              {ingredients.map((ingredient) => {
                const [name, count] = [ingredient[0], ingredient[1]];
                return (
                  <div className="dt-tip__ingredient" key={`ingredient-${name}`}>
                    <ItemImage item={name} className="dt-tip__ingredient-art" nameFallback={false} />
                    <p>
                      {count >= 1
                        ? `${count}× ${Items[name]?.label || name}`
                        : count === 0
                          ? `${Items[name]?.label || name}`
                          : count < 1 && `${count * 100}% ${Items[name]?.label || name}`}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
          {bound && (
            <div className="dt-tip__bound">
              <Glyph name="lock" size={14} />
              {t('ui_dt_bound', 'ผูกกับตัว · ย้ายออกจากกระเป๋าไม่ได้')}
            </div>
          )}
          {description && (
            <div className="dt-tip__desc">
              <Markdown content={description} className="tooltip-markdown" />
            </div>
          )}
          {inventoryType === 'player' && (
            <p className="dt-tip__foot">{t('ui_dt_tip_foot', 'คลิกขวา = เมนู · Alt+คลิก = ใช้ · Shift+ลาก = แบ่งครึ่ง')}</p>
          )}
        </>
      )}
    </div>
  );
};

export default React.forwardRef(SlotTooltip);
