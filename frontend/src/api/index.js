const BASE_USER = "/bidsphere/user";
const BASE_ADMIN = "/bidsphere/admin";
const BASE_AUCTION = "/bidsphere/auctions";

const BASE_UPI = "/bidsphere/upi";
const BASE_PAYMENTS = "/bidsphere/admin/payments";

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
  const res = await fetch(path, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await res.json() : null;

  if (!res.ok) throw new Error(data.error || data.message || "Request failed");
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

async function putJSON(path, body) {
  const res = await fetch(path, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
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
export const updateAuction = (id, body) => {
  // allow either FormData (for legacy) or plain JSON object
  if (typeof FormData !== "undefined" && body instanceof FormData) {
    return putFormData(`${BASE_AUCTION}/${id}`, body);
  }
  return putJSON(`${BASE_AUCTION}/${id}`, body);
};
export const deleteAuction = (id) => del(`${BASE_AUCTION}/${id}`);
export const createAuction = (payload) => postJSON(`${BASE_AUCTION}/create`, payload);
export const getMyAuctions = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return getJSON(`${BASE_AUCTION}/mine${qs ? `?${qs}` : ""}`);
};
export const listAuctions = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return getJSON(`${BASE_AUCTION}${qs ? `?${qs}` : ""}`);
};
export const getCurrentUser = () => getJSON(`${BASE_USER}/me`);
export const uploadImagesBase64 = (imagesPayload) => postJSON(`${BASE_AUCTION}/upload-base64`, imagesPayload);
/**
 * Upload images as multipart/form-data using XMLHttpRequest so callers can
 * receive progress updates. Accepts either a FormData or an Array<File>.
 *
 * Usage:
 *   // with FormData
 *   uploadImagesFormData(fd, (progress) => console.log(progress.percent));
 *
 *   // with files array
 *   uploadImagesFormData([file1, file2], (p) => ...)
 *
 * Returns a promise that resolves to the parsed JSON response from the server.
 */
export async function uploadImagesFormData(formData) {
  const res = await fetch(`${BASE_AUCTION}/upload`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || "Request failed");
  return data;
}



// Payment APIs
export const createUpiOrder = (payload) => postJSON(`${BASE_UPI}/create-order`, payload);
export const createCodOrder = (payload) => postJSON(`${BASE_UPI}/create-cod`, payload);
export const getPaymentStatus = (paymentId) => getJSON(`${BASE_UPI}/status/${paymentId}`);
export const verifyPayment = (payload) => postJSON(`${BASE_PAYMENTS}/verify-payment`, payload);
export const listPayments = (queryParams = {}) => {
  const params = new URLSearchParams(queryParams).toString();
  return getJSON(`${BASE_PAYMENTS}/payments${params ? `?${params}` : ''}`);
};