import React, { useEffect, useState } from 'react';
import useNuiEvent from '../../hooks/useNuiEvent';
import InventoryHotbar from './InventoryHotbar';
import { useAppDispatch, useAppSelector } from '../../store';
import { refreshSlots, setAdditionalMetadata, setupInventory } from '../../store/inventory';
import { useExitListener } from '../../hooks/useExitListener';
import type { Inventory as InventoryProps } from '../../typings';
import RightInventory from './RightInventory';
import LeftInventory from './LeftInventory';
import Tooltip from '../utils/Tooltip';
import { closeTooltip } from '../../store/tooltip';
import InventoryContext from './InventoryContext';
import { closeContextMenu } from '../../store/contextMenu';
import Fade from '../utils/transitions/Fade';
// All In City: presentation state + text-field focus handling (see dt/textFocus.ts)
import { setVisible } from '../../store/view';
import { blurTextField } from '../../dt/textFocus';

const Inventory: React.FC = () => {
  const [inventoryVisible, setInventoryVisible] = useState(false);
  const dispatch = useAppDispatch();
  const rightType = useAppSelector((state) => state.inventory.rightInventory.type);

  useNuiEvent<boolean>('setInventoryVisible', setInventoryVisible);
  useNuiEvent<false>('closeInventory', () => {
    setInventoryVisible(false);
    dispatch(closeContextMenu());
    dispatch(closeTooltip());
  });
  useExitListener(setInventoryVisible);

  useNuiEvent<{
    leftInventory?: InventoryProps;
    rightInventory?: InventoryProps;
  }>('setupInventory', (data) => {
    dispatch(setupInventory(data));
    !inventoryVisible && setInventoryVisible(true);
  });

  useNuiEvent('refreshSlots', (data) => dispatch(refreshSlots(data)));

  useNuiEvent('displayMetadata', (data: Array<{ metadata: string; value: string }>) => {
    dispatch(setAdditionalMetadata(data));
  });

  // All In City: every open starts on page 1 of ALL; a closed inventory leaves no text field focused
  useEffect(() => {
    dispatch(setVisible(inventoryVisible));
    if (!inventoryVisible) blurTextField();
  }, [dispatch, inventoryVisible]);

  // `newdrop` (ox's default right side when nothing is nearby) is the ground drop zone of the player footer, not a pane
  const twoPane = rightType !== '' && rightType !== 'newdrop';

  return (
    <>
      <Fade in={inventoryVisible}>
        <div className={`dt-inv${twoPane ? ' is-two-pane' : ''}`} role="dialog" aria-modal="true" aria-labelledby="dt-inv-title">
          <div className="dt-inv__scrim" aria-hidden="true" />
          <div className="dt-inv__stage">
            <LeftInventory />
            {twoPane && <RightInventory />}
          </div>
          <Tooltip />
          <InventoryContext />
        </div>
      </Fade>
      <InventoryHotbar />
    </>
  );
};

export default Inventory;
