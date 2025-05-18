"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyOTP() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [otpExpiryTimer, setOtpExpiryTimer] = useState(30);

  // Resend cooldown countdown (30 seconds)
  useEffect(() => {
    let timerId;
    if (resendTimer > 0) {
      timerId = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timerId);
  }, [resendTimer]);

  // OTP expiry countdown (30 seconds)
  useEffect(() => {
    let otpTimerId;
    if (otpExpiryTimer > 0) {
      otpTimerId = setTimeout(() => setOtpExpiryTimer(otpExpiryTimer - 1), 1000);
    }
    return () => clearTimeout(otpTimerId);
  }, [otpExpiryTimer]);

  // Reset OTP expiry timer on resend success
  useEffect(() => {
    if (resendTimer === 30) {
      setOtpExpiryTimer(30);
    }
  }, [resendTimer]);

  if (!email) {
    return (
      <p className="text-red-600 text-center mt-10 text-lg font-semibold">
        No email provided. Please sign up first.
      </p>
    );
  }

  async function handleVerify(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || "OTP verification failed");
        return;
      }

      setSuccess(true);

      setTimeout(() => {
        router.push("/sign-in");
      }, 1500);
    } catch {
      setLoading(false);
      setError("Something went wrong. Please try again.");
    }
  }

  async function handleResend() {
    setError(null);
    setResendLoading(true);

    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setResendLoading(false);

      if (!res.ok) {
        setError(data.error || "Failed to resend OTP");
        return;
      }

      setError(null);
      setResendTimer(30); // start resend cooldown
      setOtpExpiryTimer(30); // reset OTP expiry timer
    } catch {
      setResendLoading(false);
      setError("Failed to resend OTP. Please try again.");
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-xl shadow-lg font-sans">
      <h2 className="text-3xl font-extrabold text-center text-black mb-6">
        Verify OTP
      </h2>
      <p className="text-center text-black mb-7">
        Enter the OTP sent to{" "}
        <span className="font-semibold text-blue-600 break-words">{email}</span>
      </p>

      {success ? (
        <p className="text-green-600 font-bold text-center text-lg">
          OTP Verified! Redirecting to sign-in...
        </p>
      ) : (
        <>
          <form onSubmit={handleVerify} className="mb-5">
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.trim())}
              placeholder="Enter OTP"
              required
              pattern="\d{6}"
              maxLength={6}
              inputMode="numeric"
              disabled={loading || resendLoading}
              className="w-full px-5 py-4 mb-3 text-2xl font-semibold tracking-widest text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
            <p
              className={`text-center mb-5 font-semibold text-sm select-none tabular-nums ${
                otpExpiryTimer > 5 ? "text-black" : "text-red-600"
              }`}
            >
              {/* Uncomment below if you want to show expiry */}
              {/* {otpExpiryTimer > 0
                ? `OTP expires in ${otpExpiryTimer}s`
                : "OTP expired"} */}
            </p>
            <button
              type="submit"
              disabled={loading || resendLoading}
              className={`w-full py-4 text-xl font-extrabold rounded-lg transition-colors
                ${
                  loading
                    ? "bg-blue-300 cursor-not-allowed text-black"
                    : "bg-blue-600 hover:bg-blue-700 cursor-pointer shadow-lg text-white"
                }`}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>

          <div className="flex justify-center items-center gap-4 text-sm text-black">
            <button
              onClick={handleResend}
              disabled={resendLoading || resendTimer > 0 || loading}
              className={`px-6 py-3 font-semibold rounded-lg transition-colors
                ${
                  resendLoading
                    ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                    : resendTimer > 0
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white cursor-pointer hover:bg-blue-700 shadow-md"
                }`}
            >
              {resendLoading ? "Resending..." : "Resend OTP"}
            </button>
          </div>
        </>
      )}

      {error && (
        <p className="mt-6 text-center text-red-600 font-semibold text-base">
          {error}
        </p>
      )}
    </div>
  );
}
