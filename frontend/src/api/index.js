const BASE_USER = "/bidsphere/user";
const BASE_ADMIN = "/bidsphere/admin";
const BASE_AUCTION = "/bidsphere/auctions";

async function postJSON(path, body) {
  const res = await fetch(path, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await res.json() : null;
  if (!res.ok) throw new Error(data?.message || "Request failed");
  return data;
}

async function patchJSON(path, body) {
  const res = await fetch(path, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || "Request failed");
  return data;
}

async function getJSON(path) {
  const res = await fetch(path, { credentials: "include" });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || "Request failed");
  return data;
}

async function putFormData(path, formData) {
  const res = await fetch(path, {
    method: "PUT",
    credentials: "include",
    body: formData,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || "Request failed");
  return data;
}

async function del(path) {
  const res = await fetch(path, { method: "DELETE", credentials: "include" });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || "Request failed");
  return data;
}

export const registerUser = (payload) => postJSON(`${BASE_USER}/register`, payload);
export const loginUser = (payload) => postJSON(`${BASE_USER}/login`, payload);
export const logoutUser = () => postJSON(`${BASE_USER}/logout`, {});
export const verifyEmail = (payload) => postJSON(`${BASE_USER}/verifyemail`, payload);

export const loginAdmin = (payload) => postJSON(`${BASE_ADMIN}/login`, payload);
export const logoutAdmin = () => postJSON(`${BASE_ADMIN}/logout`, {});

export const getAuction = (id) => getJSON(`${BASE_AUCTION}/${id}`);
export const saveAuctionDraft = (id, payload) => patchJSON(`${BASE_AUCTION}/${id}/draft`, payload);
export const updateAuction = (id, formData) => putFormData(`${BASE_AUCTION}/${id}`, formData);
export const deleteAuction = (id) => del(`${BASE_AUCTION}/${id}`);
