import { createSlice } from '@reduxjs/toolkit';

// This slice answers one question for the whole app: "who is logged in?"
// The navbar, the admin guard and the login page all need that answer, which
// is why it lives in shared Redux state instead of a useState in one component.
//
// The flow is kept deliberately simple and explicit:
//   1. a component calls one of the auth functions in src/lib/authApi.js
//   2. when it succeeds, the component calls dispatch(setUser(user))
//   3. every component reading selectUser updates automatically
const initialState = {
  user: null,        // the logged-in user object, or null when signed out
  status: 'loading', // 'loading' until we've checked /auth/me once, then 'ready'
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Save the logged-in user. Called after a successful login, register,
    // or the /auth/me check when the app first loads.
    setUser(state, action) {
      state.user = action.payload;
      state.status = 'ready';
    },
    // Forget the user. Called after logout, or when /auth/me tells us there
    // is no valid session.
    clearUser(state) {
      state.user = null;
      state.status = 'ready';
    },
  },
});

export const { setUser, clearUser } = authSlice.actions;

// Selectors: small readers components use to grab just the piece they need.
export const selectUser = (state) => state.auth.user;
export const selectIsAdmin = (state) => state.auth.user?.role === 'ADMIN';
export const selectAuthStatus = (state) => state.auth.status;

export default authSlice.reducer;
