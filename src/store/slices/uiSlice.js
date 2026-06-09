import { createSlice } from '@reduxjs/toolkit';

// A "slice" is one section of the store, bundled together with the functions
// that are allowed to change it. This is the smallest slice in the app, so
// it's a good one to read first.
//
// It holds small interface flags that don't come from the server:
//   sidebarOpen -> is the mobile admin sidebar showing?
//   theme       -> 'dark' or 'light'
const initialState = {
  sidebarOpen: false,
  theme: 'dark', // start dark; _app.js fixes this from localStorage when the app loads
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  // Reducers are the only functions allowed to change this slice.
  // Heads up: it looks like we're mutating state directly here
  // (state.theme = ...), but Redux Toolkit runs these through a library
  // called Immer that turns it into a proper immutable update behind the
  // scenes. So writing it this way is safe.
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebar(state, action) {
      // action.payload is whatever we pass in, e.g. dispatch(setSidebar(true))
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

// createSlice automatically builds one "action" for each reducer above.
// We export them so components can do dispatch(toggleTheme()), etc.
export const { toggleSidebar, setSidebar, setTheme, toggleTheme } = uiSlice.actions;

// Selectors are little helpers that pull one value out of the store. Using
// them instead of reaching into state.ui.theme all over the place keeps
// components tidy, and gives us one spot to update if the shape ever changes.
export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
export const selectTheme = (state) => state.ui.theme;

// This reducer is what store.js registers under the `ui` key.
export default uiSlice.reducer;
