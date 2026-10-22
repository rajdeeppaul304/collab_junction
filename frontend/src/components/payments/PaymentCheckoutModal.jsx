import React, { useState } from "react";
import { CreditCard, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { OfferAPI } from "../../utils/marketplaceApi";

export default function PaymentCheckoutModal({ isOpen, onClose, offer, onPaymentSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !offer) return null;

  const handlePayNow = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Create order on backend (with idempotency protection)
      const idempKey = `order_${offer.id}_${Date.now()}`;
      const res = await OfferAPI.createPaymentOrder(
        { offer_id: offer.id },
        idempKey
      );

      const { order_id, amount, razorpay_key_id } = res.data;

      // 2. Load Razorpay SDK dynamically if not already loaded
      const loadRazorpayScript = () => {
        return new Promise((resolve) => {
          if (window.Razorpay) {
            resolve(true);
            return;
          }
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      };

      const isLoaded = await loadRazorpayScript();

      if (!isLoaded || !window.Razorpay) {
        // Fallback for offline / demo environments without external CDN access
        const confirmMock = window.confirm(
          `Razorpay test environment:\nSimulate successful payment authorization for ₹${amount.toLocaleString()}?`
        );
        if (confirmMock) {
          const verifyRes = await OfferAPI.verifyPayment({
            razorpay_order_id: order_id,
            razorpay_payment_id: `pay_mock_${Date.now()}`,
            razorpay_signature: "mock_sig_valid",
          });
          onPaymentSuccess(verifyRes.data.offer);
          onClose();
        }
        setLoading(false);
        return;
      }

      // 3. Open real Razorpay Checkout modal
      const options = {
        key: razorpay_key_id || "rzp_test_collabjunction",
        amount: Math.round(amount * 100),
        currency: "INR",
        name: "Collab Junction",
        description: `Escrow Payment for ${offer.product_name}`,
        order_id: order_id,
        prefill: {
          name: offer.brand_name || "Brand Partner",
        },
        theme: {
          color: "#facc15",
        },
        handler: async function (response) {
          try {
            const verifyRes = await OfferAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id || order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            onPaymentSuccess(verifyRes.data.offer);
            onClose();
          } catch (verErr) {
            setError(verErr.response?.data?.msg || "Payment verification failed.");
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to initiate payment. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-[#1c1c1e] border border-neutral-800 rounded-3xl p-6 shadow-2xl text-white">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-yellow-400/10 text-yellow-400 rounded-xl border border-yellow-400/20">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Secure Escrow Checkout</h3>
              <p className="text-xs text-neutral-400">Razorpay Test Gateway</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-full hover:bg-neutral-800"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="my-6 space-y-4">
          <div className="bg-[#242428] p-4 rounded-2xl border border-neutral-800">
            <div className="flex justify-between text-xs text-neutral-400 mb-1">
              <span>Campaign Product:</span>
              <span className="text-neutral-200 font-medium">{offer.product_name}</span>
            </div>
            <div className="flex justify-between text-xs text-neutral-400 mb-1">
              <span>Creator:</span>
              <span className="text-neutral-200 font-medium">{offer.creator_name}</span>
            </div>
            <div className="flex justify-between text-xs text-neutral-400 mb-3">
              <span>Offer ID:</span>
              <span className="text-neutral-400 font-mono">#{offer.id}</span>
            </div>
            <div className="pt-3 border-t border-neutral-700/60 flex items-baseline justify-between">
              <span className="text-sm font-semibold text-white">Total Amount:</span>
              <span className="text-2xl font-black text-yellow-400">
                ₹{offer.budget?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-2 text-xs text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong>100% Escrow Protection:</strong> Funds are locked safely in escrow until you approve final campaign deliverables.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 px-4 rounded-xl border border-neutral-700 text-neutral-300 hover:bg-neutral-800 text-sm font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePayNow}
            disabled={loading}
            className="flex-1 py-3 px-4 rounded-xl bg-yellow-400 text-black hover:bg-yellow-300 text-sm font-bold flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] shadow-lg shadow-yellow-400/20 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay ₹${offer.budget?.toLocaleString("en-IN")}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
