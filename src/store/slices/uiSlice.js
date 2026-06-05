import { createSlice } from '@reduxjs/toolkit';

// A small slice for app-wide UI state that isn't server data:
//  - sidebarOpen: is the mobile admin sidebar showing?
//  - theme: 'dark' | 'light'
const initialState = {
  sidebarOpen: false,
  theme: 'dark', // matches the no-flash default; corrected from localStorage on mount
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebar(state, action) {
      state.sidebarOpen = action.payload;
    },
    setTheme(state, action) {
      state.theme = action.payload; // 'dark' or 'light'
    },
    toggleTheme(state) {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
    },
  },
});

export const { toggleSidebar, setSidebar, setTheme, toggleTheme } = uiSlice.actions;

export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
export const selectTheme = (state) => state.ui.theme;

export default uiSlice.reducer;
