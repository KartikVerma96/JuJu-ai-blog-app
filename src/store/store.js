import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { api } from './services/api';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';

// The store is one big JavaScript object that holds all the state our app
// shares. Any component can read from it (useSelector) or change it
// (useDispatch) without passing props down through many layers.
//
// We build it from three slices, each living under its own key:
//   api  -> the cache RTK Query manages for us (server data: posts, users...)
//   auth -> who is currently logged in
//   ui   -> small interface flags like the theme and the mobile sidebar
export const store = configureStore({
  reducer: {
    // RTK Query stores its cache under its own key (the string 'api').
    [api.reducerPath]: api.reducer,
    auth: authReducer, // read this with state.auth
    ui: uiReducer,     // read this with state.ui
  },
  // RTK Query ships its own middleware that powers the caching and the
  // automatic re-fetching. We just add it onto the default middleware.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

// Optional, but nice: tells RTK Query to refetch data when the user returns
// to the tab or the network reconnects. The <Provider store={store}> in
// _app.js is what makes this store reachable from every component.
setupListeners(store.dispatch);
