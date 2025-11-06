import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getAuction } from "../api";

function AuctionDetails() {
  const { id } = useParams();
  const [auction, setAuction] = useState(null);
  const [topBids, setTopBids] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function fetchOne() {
      setLoading(true);
      try {
        const res = await getAuction(id);
        if (!mounted) return;
        // API returns { success, auction, topBids }
        setAuction(res?.auction || res || null);
        setTopBids(res?.topBids || []);
      } catch (err) {
        console.error("getAuction error:", err);
        if (mounted) setError(err.message || "Failed to load auction");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    if (id) fetchOne();
    return () => (mounted = false);
  }, [id]);

  if (loading) return <div className="p-6">Loading auction...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!auction) return <div className="p-6">Auction not found.</div>;

  const images = auction?.item?.images || [];
  const seller = auction?.createdBy;
  const currentPrice = auction?.currentBid && auction.currentBid > 0 ? auction.currentBid : auction?.startingPrice;

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold">{auction?.title || auction?.item?.name}</h1>
            <div className="text-sm text-gray-600">{auction?.item?.category} • {auction?.item?.condition}</div>
            <div className="text-xs text-gray-500 mt-1">Created: {new Date(auction.createdAt).toLocaleString()}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Status</div>
            <div className="font-semibold">{auction?.status}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            {images.length > 0 ? (
              <img src={images[0]} alt={auction?.item?.name || "Auction image"} className="w-full h-80 object-cover rounded" />
            ) : (
              <div className="w-full h-80 bg-gray-100 flex items-center justify-center text-gray-500 rounded">No image</div>
            )}

            <p className="mt-4 text-gray-700">{auction?.description || auction?.item?.description || "No description"}</p>

            {images.length > 1 && (
              <div className="mt-6 grid grid-cols-3 gap-3">
                {images.slice(1).map((src, i) => (
                  <img key={i} src={src} alt={`thumb-${i}`} className="w-full h-24 object-cover rounded" />
                ))}
              </div>
            )}
          </div>

          <aside className="p-4 border rounded">
            <div className="text-gray-500 text-sm">Current Price</div>
            <div className="text-2xl font-bold mt-1">₹{currentPrice ?? "-"}</div>

            <div className="mt-4">
              <div className="text-gray-500 text-sm">Starting Price</div>
              <div className="font-medium">₹{auction?.startingPrice ?? "-"}</div>
            </div>

            <div className="mt-3">
              <div className="text-gray-500 text-sm">Minimum Increment</div>
              <div className="font-medium">₹{auction?.minIncrement ?? "-"}</div>
            </div>

            {auction?.buyItNowPrice !== undefined && (
              <div className="mt-3">
                <div className="text-gray-500 text-sm">Buy It Now</div>
                <div className="font-medium">₹{auction.buyItNowPrice}</div>
              </div>
            )}

            <div className="mt-4 text-sm text-gray-600">Ends: {auction?.endTime ? new Date(auction.endTime).toLocaleString() : "—"}</div>

            <div className="mt-4 border-t pt-3">
              <div className="text-xs text-gray-500">Seller</div>
              <div className="font-medium">{seller?.name || seller?.email || "Unknown"}</div>
              {seller?._id && (
                <Link to={`/user/${seller._id}`} className="text-xs text-blue-600">View seller</Link>
              )}
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <div>Total Bids: <span className="font-medium">{auction?.totalBids ?? 0}</span></div>
              <div>Total Participants: <span className="font-medium">{auction?.totalParticipants ?? 0}</span></div>
            </div>
          </aside>
        </div>

        {topBids && topBids.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Top Bids</h3>
            <div className="space-y-2">
              {topBids.map((b, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="text-sm font-medium">{b?.bidderId?.name || b?.bidderId?.email || 'Anonymous'}</div>
                    <div className="text-xs text-gray-500">{b?.timestamp ? new Date(b.timestamp).toLocaleString() : ''}</div>
                  </div>
                  <div className="text-lg font-semibold">₹{b?.amount}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuctionDetails;
