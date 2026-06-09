// Plain functions that talk to our /api/auth endpoints from the browser.
// Nothing fancy here on purpose: it's just fetch(). Each one returns the JSON
// the server sent back, or throws an Error (with a message we can show in a
// toast) when the request fails.
//
// The usual flow in a component is two simple steps:
//   const data = await loginRequest(form);  // 1. call the API
//   dispatch(setUser(data.user));           // 2. save the user in Redux
//
// `credentials: 'include'` tells the browser to send (and accept) our login
// cookie, which is how the server knows who we are.

// Small helper so the POST endpoints below don't repeat themselves.
async function postJson(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });

  // The API always answers with JSON; fall back to {} if the body is empty.
  const data = await res.json().catch(() => ({}));

  // res.ok is false for 4xx/5xx. Throw so the caller's catch can show the error.
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

// POST /api/auth/login -> { user }
export function loginRequest(credentials) {
  return postJson('/api/auth/login', credentials);
}

// POST /api/auth/register -> { user }
export function registerRequest(details) {
  return postJson('/api/auth/register', details);
}

// POST /api/auth/logout -> clears the login cookie on the server
export function logoutRequest() {
  return postJson('/api/auth/logout');
}

// GET /api/auth/me -> { user } when the cookie is valid, otherwise it throws.
// We call this once when the app loads to see if someone is already signed in.
export async function fetchCurrentUser() {
  const res = await fetch('/api/auth/me', { credentials: 'include' });
  if (!res.ok) throw new Error('Not logged in');
  return res.json();
}
