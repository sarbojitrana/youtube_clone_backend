const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

async function handle(res) {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.message || `Request failed (${res.status})`);
  }
  return data;
}

export function authHeader(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function registerUser({ fullName, email, username, password, avatar }) {
  const form = new FormData();
  form.append("fullName", fullName);
  form.append("email", email);
  form.append("username", username);
  form.append("password", password);
  form.append("avatar", avatar);

  const res = await fetch(`${API_URL}/users/register`, {
    method: "POST",
    body: form,
  });
  return handle(res);
}

export async function loginUser({ identifier, password }) {
  const isEmail = identifier.includes("@");
  const res = await fetch(`${API_URL}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(
      isEmail ? { email: identifier, password } : { username: identifier, password }
    ),
  });
  return handle(res);
}

export async function logoutUser(token) {
  const res = await fetch(`${API_URL}/users/logout`, {
    method: "POST",
    headers: authHeader(token),
  });
  return handle(res);
}

export async function fetchCurrentUser(token) {
  const res = await fetch(`${API_URL}/users/current-user`, {
    headers: authHeader(token),
  });
  return handle(res);
}
