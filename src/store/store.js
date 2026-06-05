import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { api } from './services/api';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';

// REDUX CONCEPT — the "store" is the single source of truth for app state.
// configureStore (from Redux Toolkit) wires everything together:
//
//  - `reducer`: each key is a SLICE of state.
//      * api.reducerPath  -> the cache RTK Query manages for us (server data)
//      * auth             -> the logged-in user
//      * ui               -> small bits of UI state (e.g. sidebar open)
//  - `middleware`: api.middleware powers RTK Query's caching, deduping and
//    automatic re-fetching. We add it to the default middleware chain.
export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

// Lets RTK Query auto-refetch when the window regains focus or the network
// reconnects. The <Provider store={store}> in _app.js makes this store
// available to every React component via hooks like useSelector / useDispatch.
setupListeners(store.dispatch);
