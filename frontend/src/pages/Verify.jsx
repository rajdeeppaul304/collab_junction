import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import Button from "../components/ui/Button";
import API from "../api";

export default function Verify() {
  const { token } = useParams();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("Verifying your account...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided.");
      return;
    }

    API.get(`/auth/verify/${token}`)
      .then((res) => {
        setStatus("success");
        setMessage(res.data?.msg || "Your email has been verified successfully!");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.response?.data?.msg || "Verification failed. The link may be invalid or expired.");
      });
  }, [token]);

  return (
    <MainLayout>
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-[#1C1C1C] rounded-2xl p-8 shadow-lg border border-[#2B2B2B] text-center">
          {status === "loading" && (
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
              <p className="text-gray-300">{message}</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white">Email Verified!</h1>
              <p className="text-gray-400">{message}</p>
              <Link to="/signin" className="w-full">
                <Button fullWidth className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-3 rounded-xl">
                  Continue to Sign In
                </Button>
              </Link>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white">Verification Failed</h1>
              <p className="text-gray-400">{message}</p>
              <Link to="/signup" className="w-full">
                <Button fullWidth className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-3 rounded-xl">
                  Back to Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
