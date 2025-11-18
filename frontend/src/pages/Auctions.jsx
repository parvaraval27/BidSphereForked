import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { listAuctions } from "../api";

function AuctionCard({ auction }) {
  const img = auction?.item?.images?.[0] || "";
  const imgSrc = img && (img.startsWith("http") || img.startsWith("/")) ? img : null;
  const title = auction?.title || auction?.item?.name || "Untitled Auction";
  const itemName = auction?.item?.name || "Item";
  const starting = auction?.startingPrice ?? null;
  const endTime = auction?.endTime ? new Date(auction.endTime).toLocaleString() : null;

  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
      <div className="relative">
        {imgSrc ? (
          <img src={imgSrc} alt={itemName} className="w-full h-40 object-cover" />
        ) : (
          <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-500">No image</div>
        )}
        <div className="absolute top-2 right-2">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800`}>{(auction && auction.status) || "N/A"}</span>
        </div>
      </div>
      <div className="p-4">
        <div className="text-sm text-gray-500">{auction?.item?.category || "Category"}</div>
        <div className="font-semibold text-lg text-gray-800">{title}</div>
        <div className="text-sm text-gray-600 mt-1">{itemName}</div>
        {starting != null && <div className="text-sm text-gray-800 mt-2">Starting: ₹{starting}</div>}
        {endTime && <div className="text-xs text-gray-500 mt-1">Ends: {endTime}</div>}
      </div>
    </div>
  );
}

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function Auctions() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const qs = useQuery();
  const search = qs.get("search")?.trim() || "";

  useEffect(() => {
    let mounted = true;
    async function fetch() {
      setLoading(true);
      try {
        const params = {};
        if (search) params.search = search;
        params.limit = 50;
        const res = await listAuctions(params);
        if (!mounted) return;
        setAuctions(res?.auctions || []);
      } catch (err) {
        console.error("listAuctions error:", err);
        if (mounted) setError(err.message || "Failed to load auctions");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetch();
    return () => { mounted = false; };
  }, [search]);

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold mb-3">Auctions{search ? ` — ${search}` : ""}</h1>

        {loading && <div>Loading auctions...</div>}
        {error && <div className="text-red-600">{error}</div>}

        {!loading && !error && (
          <>
            {auctions.length === 0 ? (
              <div className="text-gray-700">No items listed</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {auctions.map((a) => (
                  <Link key={a._id} to={`/auction/${a._id}`} className="block hover:opacity-95">
                    <AuctionCard auction={a} />
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
