import { createSlice } from '@reduxjs/toolkit';
import { api } from '../services/api';

const initialState = {
  user: null,
  // 'loading' until the first /auth/me resolves, then 'ready'.
  status: 'loading',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
      state.status = 'ready';
    },
    clearUser(state) {
      state.user = null;
      state.status = 'ready';
    },
  },
  extraReducers: (builder) => {
    // Keep the auth slice in sync with RTK Query auth endpoints so any
    // component reading `state.auth.user` updates automatically.
    builder.addMatcher(api.endpoints.me.matchFulfilled, (state, { payload }) => {
      state.user = payload.user;
      state.status = 'ready';
    });
    builder.addMatcher(api.endpoints.me.matchRejected, (state) => {
      state.user = null;
      state.status = 'ready';
    });
    builder.addMatcher(api.endpoints.login.matchFulfilled, (state, { payload }) => {
      state.user = payload.user;
      state.status = 'ready';
    });
    builder.addMatcher(api.endpoints.register.matchFulfilled, (state, { payload }) => {
      state.user = payload.user;
      state.status = 'ready';
    });
    builder.addMatcher(api.endpoints.logout.matchFulfilled, (state) => {
      state.user = null;
      state.status = 'ready';
    });
  },
});

export const { setUser, clearUser } = authSlice.actions;

export const selectUser = (state) => state.auth.user;
export const selectIsAdmin = (state) => state.auth.user?.role === 'ADMIN';
export const selectAuthStatus = (state) => state.auth.status;

export default authSlice.reducer;
