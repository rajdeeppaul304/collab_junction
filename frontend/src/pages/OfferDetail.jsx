import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import { OfferAPI } from "../utils/marketplaceApi";
import { getSocket } from "../utils/socket";
import OfferTimeline from "../components/offers/OfferTimeline";
import OfferChat from "../components/chat/OfferChat";
import PaymentCheckoutModal from "../components/payments/PaymentCheckoutModal";
import { useAuth } from "../context/AuthContext";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  XCircle,
  ShieldCheck,
  Send,
  CreditCard,
  MessageSquare,
} from "lucide-react";

export default function OfferDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Counter Modal State
  const [isCounterOpen, setIsCounterOpen] = useState(false);
  const [counterBudget, setCounterBudget] = useState("");
  const [counterNotes, setCounterNotes] = useState("");
  const [submittingCounter, setSubmittingCounter] = useState(false);

  // Reject Modal State
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [submittingReject, setSubmittingReject] = useState(false);

  // Payment Modal State
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const fetchOffer = async () => {
    try {
      setLoading(true);
      const res = await OfferAPI.get(id);
      setOffer(res.data);
      setCounterBudget(res.data.budget);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to load offer details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffer();

    // Listen to real-time offer state changes
    const socket = getSocket();
    const handleOfferChanged = (updatedOffer) => {
      if (Number(updatedOffer.id) === Number(id)) {
        fetchOffer();
      }
    };

    socket.on("offer_status_changed", handleOfferChanged);

    return () => {
      socket.off("offer_status_changed", handleOfferChanged);
    };
  }, [id]);

  const handleAccept = async () => {
    if (!window.confirm("Are you sure you want to accept this proposal?")) return;
    try {
      const res = await OfferAPI.accept(id);
      setOffer(res.data.offer);
      fetchOffer();
    } catch (err) {
      alert(err.response?.data?.msg || "Could not accept offer");
    }
  };

  const handleCounterSubmit = async (e) => {
    e.preventDefault();
    if (!counterBudget || Number(counterBudget) < 0) {
      alert("Please enter a valid budget amount");
      return;
    }
    try {
      setSubmittingCounter(true);
      const res = await OfferAPI.counter(id, {
        budget: Number(counterBudget),
        notes: counterNotes,
      });
      setOffer(res.data.offer);
      setIsCounterOpen(false);
      fetchOffer();
    } catch (err) {
      alert(err.response?.data?.msg || "Could not submit counter-offer");
    } finally {
      setSubmittingCounter(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmittingReject(true);
      const res = await OfferAPI.reject(id, { reason: rejectReason });
      setOffer(res.data.offer);
      setIsRejectOpen(false);
      fetchOffer();
    } catch (err) {
      alert(err.response?.data?.msg || "Could not reject offer");
    } finally {
      setSubmittingReject(false);
    }
  };

  const handleComplete = async () => {
    if (!window.confirm("Confirm that all campaign deliverables have been fulfilled?")) return;
    try {
      const res = await OfferAPI.complete(id);
      setOffer(res.data.offer);
      fetchOffer();
    } catch (err) {
      alert(err.response?.data?.msg || "Could not complete offer");
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400" />
        </div>
      </MainLayout>
    );
  }

  if (error || !offer) {
    return (
      <MainLayout>
        <div className="max-w-xl mx-auto my-16 p-8 bg-[#1c1c1e] border border-neutral-800 rounded-3xl text-center text-white">
          <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Offer Not Accessible</h2>
          <p className="text-neutral-400 text-sm mb-6">{error || "Offer not found."}</p>
          <Link
            to="/offers"
            className="inline-block px-6 py-2.5 rounded-full bg-yellow-400 text-black font-semibold hover:bg-yellow-300"
          >
            &larr; Back to Offers
          </Link>
        </div>
      </MainLayout>
    );
  }

  const currentUserId = user?.id;
  const isMyTurn =
    offer.status === "pending" || offer.status === "countered"
      ? offer.last_action_by !== currentUserId
      : false;

  const canAcceptOrCounter =
    (offer.status === "pending" || offer.status === "countered") && isMyTurn;

  const canPay = offer.status === "accepted" && offer.is_brand;
  const canComplete =
    (offer.status === "accepted" || offer.status === "paid") &&
    (offer.is_brand || offer.is_creator);

  const getStatusBadge = () => {
    switch (offer.status) {
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
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            to="/offers"
            className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Offers
          </Link>
          <span className="text-neutral-600">/</span>
          <span className="text-xs font-mono text-neutral-400">Offer #{offer.id}</span>
        </div>

        {/* Offer Summary Header Card */}
        <div className="bg-[#1c1c1e] border border-neutral-800 rounded-3xl p-6 sm:p-8 mb-8 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4 sm:gap-6">
              <img
                src={offer.product_image}
                alt={offer.product_name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-neutral-700 bg-neutral-900 flex-shrink-0"
              />
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusBadge()}`}
                  >
                    {offer.status}
                  </span>
                  <span className="text-xs text-neutral-400">
                    Version v{offer.version}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  {offer.product_name}
                </h1>
                <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                  Brand: <strong className="text-neutral-200">{offer.brand_name}</strong> &bull; Creator:{" "}
                  <strong className="text-neutral-200">{offer.creator_name}</strong>
                </p>
              </div>
            </div>

            {/* Price & Action Hero Box */}
            <div className="bg-[#242428] p-5 rounded-2xl border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between lg:justify-end gap-6">
              <div>
                <span className="text-xs text-neutral-400 block mb-0.5">Agreed / Proposed Budget:</span>
                <span className="text-3xl font-black text-yellow-400">
                  ₹{offer.budget?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Action Buttons based on state machine */}
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                {canAcceptOrCounter && (
                  <>
                    <button
                      onClick={() => setIsCounterOpen(true)}
                      className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-amber-500/40 text-amber-300 hover:bg-amber-500/10 text-sm font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Counter
                    </button>
                    <button
                      onClick={handleAccept}
                      className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-emerald-400 text-black hover:bg-emerald-300 text-sm font-bold flex items-center justify-center gap-1.5 transition-transform hover:scale-105 shadow-lg shadow-emerald-500/20 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Accept Deal
                    </button>
                  </>
                )}

                {canPay && (
                  <button
                    onClick={() => setIsPaymentOpen(true)}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-yellow-400 text-black hover:bg-yellow-300 text-sm font-extrabold flex items-center justify-center gap-2 transition-transform hover:scale-105 shadow-xl shadow-yellow-400/20 cursor-pointer animate-bounce"
                  >
                    <CreditCard className="w-4 h-4" />
                    Pay Escrow (₹{offer.budget?.toLocaleString()})
                  </button>
                )}

                {canComplete && offer.status === "paid" && (
                  <button
                    onClick={handleComplete}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-yellow-400 text-black hover:bg-yellow-300 text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Mark Campaign Completed
                  </button>
                )}

                {(offer.status === "pending" || offer.status === "countered") && (
                  <button
                    onClick={() => setIsRejectOpen(true)}
                    className="p-2.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-sm transition-colors cursor-pointer"
                    title="Reject or Cancel Offer"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Turn Banner */}
          {(offer.status === "pending" || offer.status === "countered") && (
            <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center gap-2 text-xs">
              {isMyTurn ? (
                <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  Action Required: It is your turn to accept, counter, or decline.
                </span>
              ) : (
                <span className="text-neutral-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  Awaiting counterparty response to your latest proposal.
                </span>
              )}
            </div>
          )}
        </div>

        {/* 2-Column Workspace: Chat & Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Real-time In-App Chat */}
          <div className="lg:col-span-7">
            <OfferChat
              offerId={offer.id}
              currentUserId={currentUserId}
              currentUserName={user?.name || "User"}
            />
          </div>

          {/* Right Column: State Machine Audit Trail Timeline */}
          <div className="lg:col-span-5">
            <OfferTimeline history={offer.history || []} />
          </div>
        </div>
      </div>

      {/* Counter Offer Modal */}
      {isCounterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#1c1c1e] border border-neutral-800 rounded-3xl p-6 text-white shadow-2xl">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-amber-400" />
              Submit Counter-Proposal
            </h3>
            <form onSubmit={handleCounterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Proposed Budget (₹ INR)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  required
                  value={counterBudget}
                  onChange={(e) => setCounterBudget(e.target.value)}
                  className="w-full bg-[#141416] border border-neutral-700 rounded-xl px-4 py-2.5 text-white font-semibold focus:border-yellow-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Updated Terms / Scope Notes
                </label>
                <textarea
                  rows={3}
                  value={counterNotes}
                  onChange={(e) => setCounterNotes(e.target.value)}
                  placeholder="Explain your deliverables, deliverables schedule, or reasoning..."
                  className="w-full bg-[#141416] border border-neutral-700 rounded-xl p-3 text-sm text-white focus:border-yellow-400 focus:outline-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCounterOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-700 text-sm font-semibold hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCounter}
                  className="flex-1 py-2.5 rounded-xl bg-amber-400 text-black text-sm font-bold hover:bg-amber-300"
                >
                  {submittingCounter ? "Submitting..." : "Send Counter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {isRejectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#1c1c1e] border border-neutral-800 rounded-3xl p-6 text-white shadow-2xl">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-rose-400">
              <XCircle className="w-5 h-5" />
              Decline / Cancel Offer
            </h3>
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Reason for rejection (optional)
                </label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Schedule conflict, budget constraints..."
                  className="w-full bg-[#141416] border border-neutral-700 rounded-xl p-3 text-sm text-white focus:border-rose-400 focus:outline-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRejectOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-700 text-sm font-semibold hover:bg-neutral-800"
                >
                  Keep Offer
                </button>
                <button
                  type="submit"
                  disabled={submittingReject}
                  className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-bold hover:bg-rose-400"
                >
                  {submittingReject ? "Declining..." : "Confirm Decline"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Razorpay Escrow Modal */}
      <PaymentCheckoutModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        offer={offer}
        onPaymentSuccess={(updatedOffer) => {
          setOffer(updatedOffer);
          fetchOffer();
        }}
      />
    </MainLayout>
  );
}
