import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  getAuction, 
  placeBid, 
  getCurrentUser, 
  listPayments,
  setAutoBid,
  editAutoBid,
  activateAutoBid,
  deactivateAutoBid,
  getUserAutoBid
} from "../api";

function pad(n) {
  return String(n).padStart(2, "0");
}

function AuctionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [auction, setAuction] = useState(null);
  const [topBids, setTopBids] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ days: "--", hours: "--", mins: "--", secs: "--" });
  const intervalRef = useRef(null);
  const [bidAmount, setBidAmount] = useState("");
  const [placingBid, setPlacingBid] = useState(false);
  
  // Auto-bid
  const [autoBidEnabled, setAutoBidEnabled] = useState(false);
  const [autoBidAmount, setAutoBidAmount] = useState("");
  const [autoBidData, setAutoBidData] = useState(null);
  const [autoBidLoading, setAutoBidLoading] = useState(false);
  const [showAutoBidModal, setShowAutoBidModal] = useState(false);
  
  // User & payment
  const [currentUser, setCurrentUser] = useState(null);
  const [hasPaid, setHasPaid] = useState(false);
  const [paymentCheckLoading, setPaymentCheckLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

  // Fetch auction
  useEffect(() => {
    let mounted = true;
    async function fetchAuction() {
      setLoading(true);
      setError(null);
      try {
        const res = await getAuction(id);
        if (!mounted) return;
        const auctionData = res?.auction || res || null;
        setAuction(auctionData);
        setTopBids(res?.topBids || []);
      } catch (err) {
        console.error("getAuction error:", err);
        if (mounted) setError(err.message || "Failed to load auction");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    if (id) fetchAuction();
    return () => (mounted = false);
  }, [id]);

  // Fetch current user early to avoid UI flash for sellers
  useEffect(() => {
    let mounted = true;
    (async function fetchMe() {
      try {
        const me = await getCurrentUser().catch(() => null);
        if (!mounted) return;
        const user = me?.user || null;
        setCurrentUser(user);
      } catch (err) {
        // ignore
      }
    })();
    return () => (mounted = false);
  }, []);

  // fetch current user and check payment status for this auction
  useEffect(() => {
    let mounted = true;
    async function checkUserAndPayment() {
      if (!auction?._id) return;
      setPaymentCheckLoading(true);
      try {
        const me = await getCurrentUser().catch(() => null);
        if (!mounted) return;
        const user = me?.user || null;
        setCurrentUser(user);

        if (!user) {
          setHasPaid(false);
          setPaymentStatus(null);
          return;
        }

        // If auction already has this user registered (admin-confirmed), treat as paid
        try {
          const regs = auction?.registrations || auction?.registeredUsers || [];
          const isRegistered = Array.isArray(regs) && regs.some((r) => String(r) === String(user._id));
          if (isRegistered) {
            setHasPaid(true);
            setPaymentStatus("REGISTERED");
            return;
          }
        } catch (e) {
          // ignore and continue to payment lookup
        }

         // call admin payments list (backend supports filtering)
        const res = await listPayments({ auctionId: auction._id, bidderId: user._id });
        // res.data is array
        const payments = res?.data || [];
        // consider multiple backend-paid statuses (admin sets 'SUCCESS')
        const paidStatuses = ["CAPTURED", "SUCCESS", "PAID", "COMPLETED"];
        const paid = payments.find((p) => paidStatuses.includes((p.status || "").toUpperCase()));
        if (paid) {
          setHasPaid(true);
          setPaymentStatus(paid.status || "SUCCESS");
        } else {
          const pending = payments.find((p) => (p.status || "").toUpperCase() === "PENDING");
          setHasPaid(false);
          setPaymentStatus(pending ? pending.status : null);
        }
      } catch (err) {
        console.error("checkUserAndPayment error:", err);
        setHasPaid(false);
        setPaymentStatus(null);
      } finally {
        if (mounted) setPaymentCheckLoading(false);
      }
    }
    checkUserAndPayment();
    return () => (mounted = false);
  }, [auction?._id]);

  // Fetch auto-bid status
  useEffect(() => {
    let mounted = true;
    async function fetchAutoBid() {
      if (!auction?._id || !currentUser?._id) return;
      try {
        const data = await getUserAutoBid(auction._id);
        if (!mounted) return;
        if (data?.autoBid) {
          setAutoBidData(data.autoBid);
          setAutoBidEnabled(data.autoBid.isActive);
          setAutoBidAmount(data.autoBid.maxLimit.toString());
        }
      } catch (err) {
        console.error("fetchAutoBid error:", err);
      }
    }
    fetchAutoBid();
    return () => (mounted = false);
  }, [auction?._id, currentUser?._id]);

  // Countdown timer
  useEffect(() => {
    function compute() {
      const endTime = auction?.endTime || auction?.endsAt || auction?.end;
      if (!endTime) {
        setTimeLeft({ days: "--", hours: "--", mins: "--", secs: "--" });
        return;
      }
      const end = new Date(endTime).getTime();
      if (isNaN(end)) {
        setTimeLeft({ days: "--", hours: "--", mins: "--", secs: "--" });
        return;
      }
      const now = Date.now();
      const diff = Math.max(0, end - now);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);
      setTimeLeft({ days: pad(days), hours: pad(hours), mins: pad(mins), secs: pad(secs) });
    }

    compute();
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(compute, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [auction]);

  // Handle manual bid
  const handlePlaceBid = async () => {
    const val = Number(bidAmount);
    if (!val || isNaN(val) || val <= 0) {
      alert("Please enter a valid bid amount");
      return;
    }

    const currentPrice = auction?.currentBid && auction.currentBid > 0 ? auction.currentBid : auction?.startingPrice;
    const minInc = Number(auction?.minIncrement || 1);
    const minRequired = Number(currentPrice) + minInc;
    
    if (val < minRequired) {
      alert(`Your bid must be at least ₹${minRequired} (current: ₹${currentPrice} + min increment: ₹${minInc})`);
      return;
    }

    try {
      setPlacingBid(true);
      await placeBid(auction._id, val);
      const res = await getAuction(auction._id);
      setAuction(res?.auction || res || auction);
      setTopBids(res?.topBids || []);
      setBidAmount("");
      alert("Bid placed successfully!");
    } catch (err) {
      console.error("placeBid error:", err);
      alert(err?.message || "Failed to place bid");
    } finally {
      setPlacingBid(false);
    }
  };

  // Handle auto-bid setup/edit
  const handleSetupAutoBid = async () => {
    const val = Number(autoBidAmount);
    if (!val || isNaN(val) || val <= 0) {
      alert("Please enter a valid maximum bid amount");
      return;
    }

    const currentPrice = auction?.currentBid && auction.currentBid > 0 ? auction.currentBid : auction?.startingPrice;
    const minInc = Number(auction?.minIncrement || 1);
    const minRequired = Number(currentPrice) + minInc;
    
    if (val < minRequired) {
      alert(`Your maximum bid must be at least ₹${minRequired}`);
      return;
    }

    try {
      setAutoBidLoading(true);
      if (autoBidData?._id) {
        await editAutoBid(auction._id, autoBidData._id, val);
        alert("Auto-bid limit updated!");
        setAutoBidData({ ...autoBidData, maxLimit: val });
      } else {
        const result = await setAutoBid(auction._id, val);
        setAutoBidData(result);
        alert("Auto-bid created successfully!");
      }
      setShowAutoBidModal(false);
    } catch (err) {
      console.error("handleSetupAutoBid error:", err);
      alert(err?.message || "Failed to set up auto-bid");
    } finally {
      setAutoBidLoading(false);
    }
  };

  // Handle auto-bid toggle
  const handleToggleAutoBid = async (enabled) => {
    if (!autoBidData?._id) {
      setShowAutoBidModal(true);
      return;
    }

    try {
      setAutoBidLoading(true);
      if (enabled) {
        await activateAutoBid(auction._id, autoBidData._id);
        setAutoBidEnabled(true);
        alert("Auto-bid activated!");
      } else {
        await deactivateAutoBid(auction._id, autoBidData._id);
        setAutoBidEnabled(false);
        alert("Auto-bid deactivated");
      }
    } catch (err) {
      console.error("handleToggleAutoBid error:", err);
      alert(err?.message || "Failed to toggle auto-bid");
      setAutoBidEnabled(!enabled);
    } finally {
      setAutoBidLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading auction...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Auction not found</div>
      </div>
    );
  }

  const images = auction?.item?.images || [];
  const seller = auction?.createdBy;
  const displaySellerName = seller?.username || seller?.name || (seller?.email ? seller.email.split("@")[0] : "Unknown");
  const currentPrice = auction?.currentBid && auction.currentBid > 0 ? auction.currentBid : auction?.startingPrice;
  const isSeller = currentUser?._id && seller?._id && currentUser._id.toString() === seller._id.toString();
  const isAuctionLive = auction?.status === "LIVE";

  // If user has not paid registration fee and is not the seller, show pre-payment landing page
  // Ensure sellers never see the registration/pay UI
  if (!hasPaid && (!currentUser || !isSeller)) {
    return (
      <div className="p-6 bg-[#f7f5f0] min-h-screen">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-semibold">{auction?.title || auction?.item?.name}</h1>
                  <div className="text-sm text-gray-600 mt-1">{auction?.item?.category} • {auction?.item?.condition}</div>
                </div>
                <div>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    auction?.status === "LIVE" ? "bg-green-100 text-green-800" :
                    auction?.status === "UPCOMING" ? "bg-blue-100 text-blue-800" :
                    auction?.status === "ENDED" ? "bg-gray-100 text-gray-800" :
                    "bg-yellow-100 text-yellow-800"
                  }`}>{auction?.status || "N/A"}</span>
                </div>
              </div>

              <div className="w-full h-96 bg-gray-100 rounded overflow-hidden mb-4">
                {images.length > 0 ? (
                  <img src={images[0]} alt={auction?.item?.name || "Auction"} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No image available</div>
                )}
              </div>

              {images.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto mb-2">
                  {images.slice(0,6).map((src,i) => (
                    <img key={i} src={src} alt={`thumb-${i}`} className="w-20 h-14 object-cover rounded border" />
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside className="lg:col-span-4">
            <div className="sticky top-6 space-y-4">
              <div className="bg-yellow-100 p-4 rounded-lg shadow">
                <div className="text-sm text-gray-700 font-semibold">AUCTION ENDS IN</div>
                <div className="mt-3 grid grid-cols-4 gap-2">
                  <div className="bg-yellow-400 text-white rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{timeLeft.days}</div>
                    <div className="text-xs">DAYS</div>
                  </div>
                  <div className="bg-yellow-400 text-white rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{timeLeft.hours}</div>
                    <div className="text-xs">HOURS</div>
                  </div>
                  <div className="bg-yellow-400 text-white rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{timeLeft.mins}</div>
                    <div className="text-xs">MINS</div>
                  </div>
                  <div className="bg-yellow-400 text-white rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{timeLeft.secs}</div>
                    <div className="text-xs">SECS</div>
                  </div>
                </div>
                <div className="text-xs text-gray-600 mt-2">Ends: {auction?.endTime ? new Date(auction.endTime).toLocaleString() : "–"}</div>
              </div>

              <div className="bg-white p-4 rounded-lg border">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-xs text-gray-500">Starting Bid</div>
                    <div className="font-semibold">₹{auction?.startingPrice ?? '-'}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-xs text-gray-500">Current Bid</div>
                    <div className="font-semibold text-green-700">₹{currentPrice ?? '-'}</div>
                  </div>
                </div>

                <div className="mb-3 text-sm text-gray-600">
                  <div>Auction Starts: {auction?.startTime ? new Date(auction.startTime).toLocaleString() : '—'}</div>
                  <div>Auction Ends: {auction?.endTime ? new Date(auction.endTime).toLocaleString() : '—'}</div>
                </div>

                <button onClick={() => navigate(`/registration-fee/${auction._id}`)} className="w-full mb-2 bg-blue-600 text-white py-3 rounded font-semibold">
                  Pay Token Fee • ₹{Math.round((auction?.startingPrice || 0) * 0.01) || 0}
                </button>

                <button disabled className="w-full mb-2 bg-yellow-400 text-black py-3 rounded font-semibold opacity-60">
                  Place Bid • ₹{currentPrice ?? '-'}
                </button>

                <button className="w-full mb-2 bg-gray-100 text-gray-800 py-2 rounded">Add to Watchlist</button>

                <div className="flex gap-2 mt-2">
                  <button className="flex-1 py-2 border rounded">Share</button>
                  <button className="flex-1 py-2 border rounded">Report</button>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <h4 className="font-semibold mb-2">Live Auction Activity</h4>
                <div className="text-sm text-gray-500">{topBids.length === 0 ? 'No bids yet' : `Top bid: ₹${topBids[0]?.amount}`}</div>
              </div>
            </div>
          </aside>
        </div>

        <div className="max-w-7xl mx-auto mt-6 bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Item Details</h3>
          <p className="text-sm text-gray-700">{auction?.description || auction?.item?.description || 'No description provided.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#f3f3f3] min-h-screen">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Images + Details */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-lg shadow p-6">
            
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-semibold">{auction?.title || auction?.item?.name}</h1>
                <div className="text-sm text-gray-600 mt-1">
                  {auction?.item?.category} • {auction?.item?.condition}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Created: {new Date(auction.createdAt).toLocaleString()}
                </div>
              </div>
              <div>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                  auction?.status === "LIVE" ? "bg-green-100 text-green-800" :
                  auction?.status === "UPCOMING" ? "bg-blue-100 text-blue-800" :
                  auction?.status === "ENDED" ? "bg-gray-100 text-gray-800" :
                  auction?.status === "YET_TO_BE_VERIFIED" ? "bg-yellow-100 text-yellow-800" :
                  "bg-red-100 text-red-800"
                }`}>
                  {auction?.status || "N/A"}
                </span>
              </div>
            </div>

            {/* Main Image */}
            <div className="w-full h-96 bg-gray-100 rounded overflow-hidden mb-4">
              {images.length > 0 ? (
                <img 
                  src={images[0]} 
                  alt={auction?.item?.name || "Auction"} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No image available
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto mb-6">
                {images.slice(0, 6).map((src, i) => (
                  <img 
                    key={i} 
                    src={src} 
                    alt={`thumb-${i}`} 
                    className="w-20 h-14 object-cover rounded border cursor-pointer hover:border-blue-500" 
                  />
                ))}
                {images.length > 6 && (
                  <div className="w-20 h-14 bg-gray-800 text-white flex items-center justify-center rounded text-sm">
                    +{images.length - 6}
                  </div>
                )}
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded text-center">
                <div className="font-semibold text-xl">{auction?.totalBids ?? 0}</div>
                <div className="text-xs text-gray-600">Total Bids</div>
              </div>
              <div className="bg-gray-50 p-4 rounded text-center">
                <div className="font-semibold text-xl">{auction?.totalParticipants ?? 0}</div>
                <div className="text-xs text-gray-600">Bidders</div>
              </div>
              <div className="bg-gray-50 p-4 rounded text-center">
                <div className="font-semibold text-xl">{auction?.watching ?? 0}</div>
                <div className="text-xs text-gray-600">Watching</div>
              </div>
              <div className="bg-gray-50 p-4 rounded text-center">
                <div className="font-semibold text-xl">₹{auction?.startingPrice ?? "-"}</div>
                <div className="text-xs text-gray-600">Starting Bid</div>
              </div>
            </div>

            {/* Description */}
            <div className="mt-6 bg-white p-4 rounded border">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                {auction?.description || auction?.item?.description || "No description provided."}
              </p>
            </div>
          </div>
        </div>

        {/* Right sidebar: countdown, bid box, activity */}
        <aside className="lg:col-span-4">
          <div className="sticky top-6 space-y-4">
              {/* Seller Info */}
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">{displaySellerName.slice(0,2).toUpperCase()}</div>
                <div>
                  <div className="text-sm font-medium">{displaySellerName}</div>
                  <div className="text-xs text-gray-500">Verified Seller</div>
                </div>
              </div>
            </div>

            {/* Countdown Timer */}
            <div className="bg-yellow-100 p-4 rounded-lg shadow">
              <div className="text-sm text-gray-700 font-semibold">AUCTION ENDS IN</div>
              <div className="mt-3 grid grid-cols-4 gap-2">
                <div className="bg-yellow-400 text-white rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">{timeLeft.days}</div>
                  <div className="text-xs">DAYS</div>
                </div>
                <div className="bg-yellow-400 text-white rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">{timeLeft.hours}</div>
                  <div className="text-xs">HOURS</div>
                </div>
                <div className="bg-yellow-400 text-white rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">{timeLeft.mins}</div>
                  <div className="text-xs">MINS</div>
                </div>
                <div className="bg-yellow-400 text-white rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">{timeLeft.secs}</div>
                  <div className="text-xs">SECS</div>
                </div>
              </div>
              <div className="text-xs text-gray-600 mt-2">
                Ends: {auction?.endTime ? new Date(auction.endTime).toLocaleString() : "–"}
              </div>
            </div>

            {/* Bidding Section - Only show if not seller */}
            {!isSeller && (
              <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Place Your Bid</h3>
                
                {/* Current Price */}
                <div className="bg-gray-50 p-3 rounded mb-4 flex justify-between items-center">
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Current Highest Bid</div>
                    <div className="text-xl font-bold text-gray-900">₹{currentPrice ?? "-"}</div>
                  </div>
                  <div className="text-xs text-green-600 font-medium">Reserve price met</div>
                </div>

                {/* Manual Bid Input */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-900">
                      Manual Bid Amount
                    </label>
                    <span className="text-xs text-gray-500">Min. bid increment - ₹{auction?.minIncrement || 200}</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                    <input
                      type="number"
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-lg font-semibold"
                      placeholder="Enter amount"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      disabled={!isAuctionLive || autoBidEnabled || isSeller}
                    />
                  </div>
                  <button
                    className="w-full mt-3 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 rounded disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                    onClick={handlePlaceBid}
                    disabled={!isAuctionLive || placingBid || autoBidEnabled || isSeller}
                  >
                    {placingBid ? "Placing..." : bidAmount ? `Place Bid - ₹${bidAmount}` : "Place Bid"}
                  </button>

                  {/* Status Messages */}
                  {!isAuctionLive && !isSeller && (
                    <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                      Bidding is only allowed when auction is LIVE
                    </div>
                  )}
                  {autoBidEnabled && (
                    <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
                      Manual bidding disabled while auto-bid is active
                    </div>
                  )}
                </div>

                {/* Auto-Bid Section */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">Auto-Bid</span>
                        <button 
                          className="text-xs text-gray-500 hover:text-gray-700"
                          title="Set your maximum bid and let our system automatically bid for you up to that amount"
                        >
                        </button>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Set your maximum bid and let our system automatically bid for you up to that amount
                      </div>
                      {autoBidData && (
                        <div className="text-xs text-gray-600 mt-1 font-medium">Max Limit: ₹{autoBidData.maxLimit}</div>
                      )}
                    </div>
                    
                    {/* Toggle Switch */}
                    <label className="relative inline-flex items-center cursor-pointer ml-3">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={autoBidEnabled}
                        onChange={(e) => handleToggleAutoBid(e.target.checked)}
                        disabled={autoBidLoading}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {autoBidData && (
                    <button
                      onClick={() => setShowAutoBidModal(true)}
                      className="w-full text-xs text-blue-600 hover:text-blue-700 hover:underline mt-2 text-left"
                      disabled={autoBidLoading}
                    >
                      Edit Auto-Bid Settings
                    </button>
                  )}
                </div>

              </div>
            )}

            {isSeller && (
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-center text-gray-600">
                  <p className="text-sm">You are the seller of this auction</p>
                </div>
              </div>
            )}

            {/* Bid History */}
            <div className="bg-white p-5 rounded-lg shadow border border-gray-200">
              <h4 className="text-lg font-bold text-gray-900 mb-4">Live Auction Activity</h4>
              <div className="space-y-0 max-h-80 overflow-y-auto">
                {topBids.length === 0 ? (
                  <div className="text-sm text-gray-500 text-center py-6">No bids yet</div>
                ) : (
                  <>
                    {topBids.slice(0, 5).map((bid, i) => {
                      const bidderData = bid?.userId || bid?.bidderId;
                      const bidderName = bidderData?.username || 
                                        bidderData?.name || 
                                        (bidderData?.email || "").split("@")[0] || 
                                        "Anonymous";
                       const isLeading = i === 0;
                       
                      const getTimeAgo = (createdAt) => {
                        if (!createdAt) return "";
                        const now = Date.now();
                        const bidTime = new Date(createdAt).getTime();
                        const diffMs = now - bidTime;
                        const diffMins = Math.floor(diffMs / 60000);
                        const diffSecs = Math.floor(diffMs / 1000);
                        
                        if (diffSecs < 30) return "Just now";
                        if (diffMins < 1) return `${diffSecs} sec ago`;
                        if (diffMins < 60) return `${diffMins} min ago`;
                        const diffHours = Math.floor(diffMins / 60);
                        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
                        const diffDays = Math.floor(diffHours / 24);
                        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
                      };
                      
                      return (
                        <div key={i} className={`flex items-center justify-between p-3 ${
                          isLeading ? 'bg-green-50' : i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}>
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                              <div className="w-full h-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
                                {bidderName.slice(0, 2).toUpperCase()}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="text-sm font-semibold text-gray-900">{bidderName}</div>
                                  <div className="text-xs text-gray-700">
                                    Placed Bid: <span className="font-semibold">₹{bid?.amount?.toLocaleString()}</span>
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500 text-right ml-2">
                                  {getTimeAgo(bid?.createdAt)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {topBids.length > 0 && (
                      <button
                        onClick={() => navigate(`/auction/${id}/bid-history`)}
                        className="w-full py-3 mt-2 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition"
                      >
                        View Full Bidding History
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

          </div>
        </aside>
      </div>

      {/* Auto-Bid Modal */}
      {showAutoBidModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">
              {autoBidData ? "Edit Auto-Bid" : "Set Up Auto-Bid"}
            </h3>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              Set your maximum bid limit. The system will automatically place bids on your behalf 
              when others bid, keeping you in the lead up to your maximum limit.
            </p>
            
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Maximum Bid Amount
              </label>
              <input
                type="number"
                className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter maximum amount"
                value={autoBidAmount}
                onChange={(e) => setAutoBidAmount(e.target.value)}
              />
              <div className="text-xs text-gray-500 mt-2">
                Current: ₹{currentPrice} • Min increment: ₹{auction?.minIncrement || 1}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAutoBidModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition"
                disabled={autoBidLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleSetupAutoBid}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition"
                disabled={autoBidLoading}
              >
                {autoBidLoading ? "Saving..." : "Save Auto-Bid"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default AuctionDetails;