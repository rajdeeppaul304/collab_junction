import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import { OfferAPI } from "../utils/marketplaceApi";
import { getSocket } from "../utils/socket";
import {
  Handshake,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
  DollarSign,
  ArrowRight,
  RefreshCw,
  Search,
} from "lucide-react";

export default function OffersList() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== "all" ? { status: statusFilter } : {};
      const res = await OfferAPI.list(params);
      setOffers(res.data || []);
    } catch (err) {
      console.error("Failed to fetch offers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();

    const socket = getSocket();
    const handleOfferUpdate = () => {
      fetchOffers();
    };

    socket.on("offer_status_changed", handleOfferUpdate);
    socket.on("notification_new", handleOfferUpdate);

    return () => {
      socket.off("offer_status_changed", handleOfferUpdate);
      socket.off("notification_new", handleOfferUpdate);
    };
  }, [statusFilter]);

  const filteredOffers = offers.filter((o) => {
    const term = searchTerm.toLowerCase();
    return (
      (o.product_name || "").toLowerCase().includes(term) ||
      (o.brand_name || "").toLowerCase().includes(term) ||
      (o.creator_name || "").toLowerCase().includes(term)
    );
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return "bg-sky-500/10 text-sky-400 border-sky-500/30";
      case "countered":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "accepted":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "paid":
        return "bg-green-500/10 text-green-400 border-green-500/30";
      case "completed":
        return "bg-yellow-400/10 text-yellow-400 border-yellow-400/30";
      case "rejected":
      case "cancelled":
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
      default:
        return "bg-neutral-800 text-neutral-300";
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-white">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-xl bg-yellow-400/10 text-yellow-400 border border-yellow-400/20">
                <Handshake className="w-5 h-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-black">Offer Negotiations &amp; Deals</h1>
            </div>
            <p className="text-sm text-neutral-400">
              Manage deal proposals, negotiate budgets, and track campaign milestones.
            </p>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-[#1c1c1e] p-4 rounded-2xl border border-neutral-800 shadow-xl">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by product, brand, or creator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#141416] border border-neutral-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-yellow-400"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: "all", label: "All" },
              { id: "pending", label: "Pending" },
              { id: "countered", label: "Countered" },
              { id: "accepted", label: "Accepted" },
              { id: "paid", label: "Paid" },
              { id: "completed", label: "Completed" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  statusFilter === tab.id
                    ? "bg-yellow-400 text-black shadow-md shadow-yellow-400/10"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Offer Cards */}
        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-yellow-400" />
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[#1c1c1e] border border-neutral-800 text-neutral-500">
            <Handshake className="w-12 h-12 mx-auto mb-3 opacity-40 text-yellow-400" />
            <h3 className="text-base font-semibold text-neutral-300">No offers found</h3>
            <p className="text-xs mt-1 text-neutral-500">
              {statusFilter !== "all"
                ? `No offers currently in '${statusFilter}' state.`
                : "Explore products in the Store or respond to creator interests to launch new collaboration deals."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOffers.map((o) => (
              <Link
                key={o.id}
                to={`/offers/${o.id}`}
                className="group bg-[#1c1c1e] border border-neutral-800 hover:border-yellow-400/50 rounded-3xl p-5 transition-all hover:-translate-y-1 shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-4 mb-4">
                    <img
                      src={o.product_image}
                      alt={o.product_name}
                      className="w-16 h-16 rounded-2xl object-cover bg-neutral-900 border border-neutral-700/80 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(
                            o.status
                          )}`}
                        >
                          {o.status}
                        </span>
                        <span className="text-[11px] text-neutral-500 font-mono">
                          #{o.id}
                        </span>
                      </div>
                      <h3 className="font-bold text-white text-base truncate group-hover:text-yellow-400 transition-colors">
                        {o.product_name}
                      </h3>
                      <p className="text-xs text-neutral-400 truncate mt-0.5">
                        Brand: <span className="text-neutral-200">{o.brand_name}</span> &bull; Creator:{" "}
                        <span className="text-neutral-200">{o.creator_name}</span>
                      </p>
                    </div>
                  </div>

                  {o.terms && (
                    <p className="text-xs text-neutral-400 line-clamp-2 bg-[#141416] p-2.5 rounded-xl border border-neutral-800/80 italic mb-4">
                      &ldquo;{o.terms}&rdquo;
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase block">Current Budget</span>
                    <span className="text-lg font-black text-yellow-400">
                      ₹{o.budget?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-yellow-400 group-hover:translate-x-1 transition-transform">
                    View Deal
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
