const BASE_USER = "/bidsphere/user";
const BASE_ADMIN = "/bidsphere/admin";

async function postJSON(path, body) {
  const res = await fetch(path, {
    method: "POST",
    credentials: "include", 
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await res.json() : null;

  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

// User APIs
export const registerUser = (payload) => postJSON(`${BASE_USER}/register`, payload);
export const loginUser = (payload) => postJSON(`${BASE_USER}/login`, payload);
export const logoutUser = () => postJSON(`${BASE_USER}/logout`, {});
export const verifyEmail = (payload) => postJSON(`${BASE_USER}/verifyemail`, payload);

// Admin APIs
export const loginAdmin = (payload) => postJSON(`${BASE_ADMIN}/login`, payload);
export const logoutAdmin = () => postJSON(`${BASE_ADMIN}/logout`, {});