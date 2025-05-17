"use client";

import { useState, useEffect } from "react";
import { signIn, getSession, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      // Redirect after successful login (credentials or Google)
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
    // no redirect here — the useEffect will catch session update and redirect
  };

  const handleGoogleSignIn = () => {
    signIn("google");
    // No redirect here either — handled by useEffect when session updates
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h2 style={styles.title}>Sign In</h2>
        <form onSubmit={handleSubmit}>
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
          {error && <p style={styles.error}>{error}</p>}
        </form>

        <div style={styles.divider}>or</div>

        <button onClick={handleGoogleSignIn} style={styles.googleButton}>
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f5f5f5",
  },
  box: {
    width: "100%",
    maxWidth: 400,
    padding: 30,
    borderRadius: 12,
    background: "#fff",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
  },
  title: {
    textAlign: "center",
    marginBottom: 20,
    fontSize: 24,
    fontWeight: 600,
  },
  input: {
    display: "block",
    width: "100%",
    padding: 10,
    marginBottom: 12,
    borderRadius: 6,
    border: "1px solid #ccc",
    fontSize: 16,
  },
  button: {
    width: "100%",
    padding: 12,
    background: "#0070f3",
    color: "#fff",
    fontWeight: 600,
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  error: {
    marginTop: 10,
    color: "red",
    textAlign: "center",
  },
  divider: {
    margin: "20px 0",
    textAlign: "center",
    color: "#888",
  },
  googleButton: {
    width: "100%",
    padding: 12,
    background: "#fff",
    color: "#333",
    fontWeight: 600,
    border: "1px solid #ccc",
    borderRadius: 6,
    cursor: "pointer",
  },
};
