// All In City: presentation state of the forked UI (fast slot count, rail filter, search, pages). Nothing here is sent
// to the game or changes an inventory: filtering and paging only choose which spaces are drawn.
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RailId } from '../dt/categories';

/** Fast slots when the client sends no `fastslots` (patch 002 missing): ox_inventory's stock hotkey1..5. */
export const FAST_DEFAULT = 5;
/** patches/ox_inventory/002-dt-fastslots.patch clamps the convar to keys 1-9. */
export const FAST_MAX = 9;

interface ViewState {
  fastslots: number;
  category: RailId;
  search: string;
  searchOpen: boolean;
  page: number;
  otherPage: number;
  visible: boolean;
}

const initialState: ViewState = {
  fastslots: FAST_DEFAULT,
  category: 'all',
  search: '',
  searchOpen: false,
  page: 0,
  otherPage: 0,
  visible: false,
};

export const viewSlice = createSlice({
  name: 'view',
  initialState,
  reducers: {
    setFastslots(state, action: PayloadAction<number | undefined>) {
      const n = Math.floor(Number(action.payload));
      state.fastslots = Number.isFinite(n) ? Math.max(1, Math.min(FAST_MAX, n)) : FAST_DEFAULT;
    },
    setCategory(state, action: PayloadAction<RailId>) {
      state.category = action.payload;
      state.page = 0;
    },
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
      state.page = 0;
    },
    setSearchOpen(state, action: PayloadAction<boolean>) {
      state.searchOpen = action.payload;
      if (!action.payload) state.search = '';
      state.page = 0;
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = Math.max(0, action.payload);
    },
    setOtherPage(state, action: PayloadAction<number>) {
      state.otherPage = Math.max(0, action.payload);
    },
    /** Every open starts on page 1 of ALL with no search. The search field is closed on close already, so it never
     *  mounts (and grabs focus, i.e. game keys) in the first frame of the next open. */
    setVisible(state, action: PayloadAction<boolean>) {
      if (action.payload !== state.visible) {
        state.search = '';
        state.searchOpen = false;
        if (action.payload) {
          state.category = 'all';
          state.page = 0;
          state.otherPage = 0;
        }
      }
      state.visible = action.payload;
    },
  },
});

export const { setFastslots, setCategory, setSearch, setSearchOpen, setPage, setOtherPage, setVisible } =
  viewSlice.actions;

export default viewSlice.reducer;
