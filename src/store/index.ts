import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import inventoryReducer from './inventory';
import tooltipReducer from './tooltip';
import contextMenuReducer from './contextMenu';
import viewReducer from './view';

export const store = configureStore({
  reducer: {
    inventory: inventoryReducer,
    tooltip: tooltipReducer,
    contextMenu: contextMenuReducer,
    view: viewReducer, // All In City: presentation state (store/view.ts)
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
