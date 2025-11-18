// Get API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const BASE_USER = `${API_BASE_URL}/bidsphere/user`;
const BASE_ADMIN = `${API_BASE_URL}/bidsphere/admin`;
const BASE_AUCTION = `${API_BASE_URL}/bidsphere/auctions`;

const BASE_UPI = `${API_BASE_URL}/bidsphere/upi`;
const BASE_PAYMENTS = `${API_BASE_URL}/bidsphere/admin/payments`;

async function postJSON(path, body) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // <-- ensure cookies (JWT/session) are sent
    body: JSON.stringify(body || {}),
  });
  if (!res.ok) throw await res.json();
  return res.json();
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
    credentials: "include", // <-- ensure cookies are sent
    headers: { "Accept": "application/json" },
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

async function putFormData(path, formData) {
  const res = await fetch(path, {
    method: "PUT",
    credentials: "include",
    body: formData,
  });
  if (!res.ok) throw await res.json();
  return res.json();
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
  const res = await fetch(path, {
    method: "DELETE",
    credentials: "include",
    headers: { "Accept": "application/json" },
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export const registerUser = (payload) => postJSON(`${BASE_USER}/register`, payload);
export const loginUser = (payload) => postJSON(`${BASE_USER}/login`, payload);
export const logoutUser = () => postJSON(`${BASE_USER}/logout`, {});
export const verifyEmail = (payload) => postJSON(`${BASE_USER}/verifyemail`, payload);

export const loginAdmin = (payload) => postJSON(`${BASE_ADMIN}/login`, payload);
export const logoutAdmin = () => postJSON(`${BASE_ADMIN}/logout`, {});
export const getAllAuctionsAdmin = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return getJSON(`${BASE_ADMIN}/auctions${qs ? `?${qs}` : ""}`);
};
export const getAuctionDetailsAdmin = (auctionId) => getJSON(`${BASE_ADMIN}/auctions/${auctionId}`);
export const verifyAuction = (auctionId) => postJSON(`${BASE_ADMIN}/auctions/${auctionId}/verify`, {});
export const removeAuctionAdmin = (auctionId) => postJSON(`${BASE_ADMIN}/auctions/${auctionId}/remove`, {});

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
// derive categories from auctions when backend has no dedicated endpoint
export const getCategories = async (opts = {}) => {
  // opts.limit can be supplied; default to 200
  const limit = typeof opts.limit === "number" ? opts.limit : 200;
  const res = await listAuctions({ limit });
  const auctions = res?.auctions || [];
  const map = new Map();
  for (const a of auctions) {
    const name = (a?.item?.category || "Uncategorized").trim();
    if (!map.has(name)) {
      const img = a?.item?.images?.[0] || null;
      map.set(name, { name, image: img });
    }
  }
  return Array.from(map.values());
};

// User endpoints
export const getCurrentUser = () => getJSON(`${BASE_USER}/me`);
export const getWatchlist = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return getJSON(`${BASE_USER}/watchlist${qs ? `?${qs}` : ""}`);
};
export const getBiddingHistory = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return getJSON(`${BASE_USER}/bidding-history${qs ? `?${qs}` : ""}`);
};

export const uploadImagesBase64 = (imagesPayload) => postJSON(`${BASE_AUCTION}/upload-base64`, imagesPayload);
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

// Bidding APIs
export const placeBid = (auctionId, amount) => 
  postJSON(`${BASE_AUCTION}/${auctionId}/bid/place`, { amount });

export const setAutoBid = (auctionId, maxLimit) => 
  postJSON(`${BASE_AUCTION}/${auctionId}/bid/setauto`, { maxLimit });

export const editAutoBid = (auctionId, autobidId, maxLimit) => 
  postJSON(`${BASE_AUCTION}/${auctionId}/bid/editauto/${autobidId}`, { maxLimit });

export const activateAutoBid = (auctionId, autobidId) => 
  postJSON(`${BASE_AUCTION}/${auctionId}/bid/activateauto/${autobidId}`, {});

export const deactivateAutoBid = (auctionId, autobidId) => 
  postJSON(`${BASE_AUCTION}/${auctionId}/bid/deactivateauto/${autobidId}`, {});

export const getUserAutoBid = (auctionId) => 
  getJSON(`${BASE_AUCTION}/${auctionId}/bid/myautobid`);

// Payment APIs

// Admin notifications (payment verifications)
export const getAdminNotifications = () => getJSON(`${BASE_ADMIN}/notifications`);
export const confirmAdminNotification = (id) => postJSON(`${BASE_ADMIN}/notifications/${id}/confirm`, {});
export const rejectAdminNotification = (id) => postJSON(`${BASE_ADMIN}/notifications/${id}/reject`, {});
// Auction-scoped payment endpoints (backend paymentRoutes)
export const createRegistrationPayment = (auctionId) => postJSON(`${BASE_AUCTION}/${auctionId}/au-registration/pay`, {});
export const verifyAuctionPayment = (auctionId, paymentId, payload) => postJSON(`${BASE_AUCTION}/${auctionId}/${paymentId}/verify`, payload);
// Winning payment endpoints (final payment by winner)
export const createWinningCodPayment = (auctionId) => postJSON(`${BASE_AUCTION}/${auctionId}/finalpay/cod`, {});
export const createWinningUpiPayment = (auctionId) => postJSON(`${BASE_AUCTION}/${auctionId}/finalpay/upi`, {});
// legacy/admin verify kept for compatibility
export const listPayments = (queryParams = {}) => {
  const params = new URLSearchParams(queryParams).toString();
  return getJSON(`${BASE_PAYMENTS}/payments${params ? `?${params}` : ''}`);
};

export const requestPasswordReset = (payload) => postJSON(`${BASE_USER}/forgetpwd`, payload);
export const resetPassword = (payload) => postJSON(`${BASE_USER}/resetpwd`, payload);
