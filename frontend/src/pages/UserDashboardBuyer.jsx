import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCurrentUser, getWatchlist, getBiddingHistory } from "../api";
/* eslint-disable react/prop-types */

function StatCard({ title, value, small }) {
  return (
    <div className="bg-white border rounded-lg p-4 flex flex-col justify-between">
      <div className="text-xs text-gray-500">{title}</div>
      <div className={`mt-2 ${small ? "text-xl" : "text-2xl"} font-semibold text-gray-800`}>{value}</div>
    </div>
  );
}

function WatchlistRow({ title = "Auction Name", bid = "₹250", bids = 0, timeLeft = "—" }) {
  return (
    <div className="flex items-center gap-4 bg-white border rounded p-3">
      <div className="w-16 h-12 bg-gray-100 rounded" />
      <div className="flex-1">
        <div className="font-medium">{title}</div>
        <div className="text-xs text-gray-500 mt-1">Current bid <span className="font-semibold text-gray-800">{bid}</span> • Bids {bids}</div>
      </div>
      <div className="text-right text-xs text-gray-500">
        <div className="text-sm text-red-600 font-semibold">{timeLeft}</div>
        <div className="mt-2"><Link to="#" className="text-blue-600 text-xs">View Auction</Link></div>
      </div>
    </div>
  );
}

export default function UserDashboardBuyer() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);

  const [watchlist, setWatchlist] = useState([]);
  const [biddingHistory, setBiddingHistory] = useState([]);
  const [loadingLists, setLoadingLists] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoadingUser(true);
      try {
        const res = await getCurrentUser().catch(() => null);
        if (!mounted) return;
        const u = res?.user || res || null;
        setUser(u);
      } catch (err) {
        console.error("getCurrentUser error:", err);
      } finally {
        if (mounted) setLoadingUser(false);
      }

      try {
        setLoadingLists(true);
        const [wlRes, bhRes] = await Promise.allSettled([getWatchlist(), getBiddingHistory()]);
        if (!mounted) return;
        if (wlRes.status === "fulfilled") setWatchlist(wlRes.value?.watchlist || []);
        if (bhRes.status === "fulfilled") setBiddingHistory(bhRes.value?.history || []);
      } catch (err) {
        console.error("list fetch error:", err);
      } finally {
        if (mounted) setLoadingLists(false);
      }
    }
    load();
    return () => (mounted = false);
  }, []);

  const displayName = (user && (user.username || user.name || user.email)) || "First Last";
  const initials = String(displayName).split(" ").map((s) => s[0] || "").slice(0, 2).join("").toUpperCase();

  const activeBids = 0;
  const totalSpending = 0;
  const watchlistCount = watchlist.length;
  const wonAuctions = 0;

  return (
    <div className="min-h-screen bg-[#fdfbf6]">
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <aside className="lg:col-span-3 bg-white border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold">{initials || "U"}</div>
            <div>
              <div className="font-semibold">{displayName || (loadingUser ? "Loading..." : "First Last")}</div>
              <div className="text-xs text-gray-500">Active bidder</div>
            </div>
          </div>

          <nav className="mt-6">
            <ul className="space-y-2 text-sm">
              <li><Link to="/buyer/dashboard" className="block py-2 px-3 rounded bg-green-50 font-medium">Dashboard</Link></li>
              <li><Link to="/my-bids" className="block py-2 px-3 rounded hover:bg-gray-50">My Bids</Link></li>
              <li><Link to="/watchlist" className="block py-2 px-3 rounded hover:bg-gray-50">Watchlist</Link></li>
              <li><Link to="/won-auctions" className="block py-2 px-3 rounded hover:bg-gray-50">Won Auctions</Link></li>
              <li><Link to="/settings" className="block py-2 px-3 rounded hover:bg-gray-50">Settings</Link></li>
            </ul>
          </nav>
        </aside>

        <main className="lg:col-span-9 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Active Bids" value={<><span className="text-2xl">{activeBids}</span><div className="text-xs text-gray-500">Across auctions</div></>} />
            <StatCard title="Total Spending" value={<><span className="text-2xl">₹{totalSpending}</span><div className="text-xs text-gray-500">This month</div></>} small />
            <StatCard title="Watchlist Items" value={<><span className="text-2xl">{watchlistCount}</span><div className="text-xs text-gray-500">Items saved</div></>} small />
            <StatCard title="Won Auctions" value={<><span className="text-2xl">{wonAuctions}</span><div className="text-xs text-gray-500">This month</div></>} small />
          </div>

          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">My Watchlist</h2>
              <div className="text-sm text-blue-600"><Link to="/watchlist">View All</Link></div>
            </div>

            <div className="space-y-3">
              {loadingLists ? (
                <div className="text-sm text-gray-500">Loading watchlist...</div>
              ) : watchlist.length === 0 ? (
                <div className="text-sm text-gray-500">You have no items in your watchlist.</div>
              ) : (
                watchlist.map((w, i) => (
                  <WatchlistRow
                    key={w._id || w.id || i}
                    title={w.title || w.item?.name || w.name || "Untitled Auction"}
                    bid={w.currentBid ? `₹${w.currentBid}` : (w.startingPrice ? `₹${w.startingPrice}` : "—")}
                    bids={w.totalBids ?? w.bids ?? 0}
                    timeLeft={w.endsIn || w.timeLeft || (w.endTime ? new Date(w.endTime).toLocaleString() : "")}
                  />
                ))
              )}
            </div>
          </div>

          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Bidding History</h2>
            <div className="space-y-3">
              {loadingLists ? (
                <div className="text-sm text-gray-500">Loading bidding history...</div>
              ) : biddingHistory.length === 0 ? (
                <div className="text-sm text-gray-500">You have no bidding history yet.</div>
              ) : (
                biddingHistory.map((b, idx) => (
                  <div key={b._id || b.id || idx} className="bg-gray-50 p-3 rounded border flex items-center gap-4">
                    <div className="w-16 h-12 bg-gray-100 rounded" />
                    <div className="flex-1">
                      <div className="font-medium">{b.auctionId?.title || b.title || b.auctionTitle || b.item?.name || "Auction"}</div>
                      <div className="text-xs text-gray-500">
                        Your bid: <span className={b.youWon ? "text-green-600" : "text-gray-700"}>{b.amount ? `₹${b.amount}` : (b.yourBid ? `₹${b.yourBid}` : "-")}</span>
                        {b.current && <> • Current: ₹{b.current}</>}
                        {b.final && <> • Final: ₹{b.final}</>}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">{b.createdAt ? new Date(b.createdAt).toLocaleString() : (b.when || b.time || (b.endedAt ? new Date(b.endedAt).toLocaleString() : ""))}</div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 text-center">
              <Link to="/bidding-history" className="text-blue-600">View All History</Link>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Trending Auctions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-40 bg-gray-100 rounded border" />
              <div className="h-40 bg-gray-100 rounded border" />
              <div className="h-40 bg-gray-100 rounded border" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}