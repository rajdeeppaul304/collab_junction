"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      if (session.user.role === "brand") {
        router.push("/dashboard1");
      } else if (session.user.role === "creator") {
        router.push("/shop");
      } else {
        router.push("/");
      }
    }
  }, [session, status, router]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
    });

    setLoading(false);

    if (res.error) {
      setError(res.error);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold text-black text-center mb-6">Sign In</h2>

        {error && (
          <p className="mb-4 p-3 bg-red-100 text-red-700 border border-red-700 rounded text-center">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-md font-semibold transition-colors ${
              loading
                ? "bg-blue-300 cursor-not-allowed text-black"
                : "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
            }`}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="my-6 text-center text-gray-500 font-medium">or</div>

        <button
          onClick={handleGoogleSignIn}
          className="w-full py-3 border border-gray-300 rounded-md font-semibold text-black hover:bg-gray-100 transition-colors"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
