import React from "react";
import { CheckCircle2, Clock, DollarSign, XCircle, RefreshCw, Send, ShieldAlert } from "lucide-react";

export default function OfferTimeline({ history = [] }) {
  if (!history || history.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-neutral-500 bg-[#1c1c1e] rounded-2xl border border-neutral-800">
        No state changes recorded yet.
      </div>
    );
  }

  const getActionBadge = (action) => {
    switch (action) {
      case "created":
        return {
          icon: <Send className="w-4 h-4 text-sky-400" />,
          color: "bg-sky-400/10 text-sky-400 border-sky-400/30",
          label: "Offer Initiated",
        };
      case "countered":
        return {
          icon: <RefreshCw className="w-4 h-4 text-amber-400" />,
          color: "bg-amber-400/10 text-amber-400 border-amber-400/30",
          label: "Counter-Proposal",
        };
      case "accepted":
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
          color: "bg-emerald-400/10 text-emerald-400 border-emerald-400/30",
          label: "Deal Accepted",
        };
      case "paid":
        return {
          icon: <DollarSign className="w-4 h-4 text-green-400" />,
          color: "bg-green-400/10 text-green-400 border-green-400/30",
          label: "Payment Escrowed",
        };
      case "completed":
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-yellow-400" />,
          color: "bg-yellow-400/10 text-yellow-400 border-yellow-400/30",
          label: "Campaign Completed",
        };
      case "rejected":
      case "cancelled":
        return {
          icon: <XCircle className="w-4 h-4 text-rose-400" />,
          color: "bg-rose-400/10 text-rose-400 border-rose-400/30",
          label: action === "cancelled" ? "Offer Cancelled" : "Offer Rejected",
        };
      default:
        return {
          icon: <Clock className="w-4 h-4 text-neutral-400" />,
          color: "bg-neutral-800 text-neutral-300 border-neutral-700",
          label: action,
        };
    }
  };

  return (
    <div className="bg-[#1c1c1e] border border-neutral-800 rounded-2xl p-6 shadow-xl">
      <h3 className="text-base font-semibold text-white mb-6 flex items-center justify-between">
        <span>State Machine Audit Log</span>
        <span className="text-xs font-normal text-neutral-400">
          {history.length} transition{history.length > 1 ? "s" : ""}
        </span>
      </h3>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-neutral-800">
        {history.map((item, index) => {
          const badge = getActionBadge(item.action);
          return (
            <div key={item.id || index} className="relative group">
              {/* Timeline Dot */}
              <div className="absolute -left-[27px] top-1 p-1 bg-[#1c1c1e] rounded-full ring-2 ring-neutral-700">
                {badge.icon}
              </div>

              {/* Event Content */}
              <div className="bg-[#242427] border border-neutral-800 rounded-xl p-4 transition-all hover:border-neutral-700">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${badge.color}`}
                    >
                      {badge.label}
                    </span>
                    <span className="text-xs text-neutral-400">
                      by <strong className="text-neutral-200">{item.actor_name}</strong>
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-500">
                    {item.created_at ? new Date(item.created_at).toLocaleString() : ""}
                  </span>
                </div>

                <div className="mt-2 flex items-baseline justify-between text-sm">
                  <span className="text-xs text-neutral-400">Proposed Budget:</span>
                  <span className="text-base font-bold text-yellow-400">
                    ₹{item.budget?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {item.notes && (
                  <p className="mt-2 text-xs text-neutral-300 bg-[#171719] p-2.5 rounded-lg border border-neutral-800/80 italic leading-relaxed">
                    &ldquo;{item.notes}&rdquo;
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
