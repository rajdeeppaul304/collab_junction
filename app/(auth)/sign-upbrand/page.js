"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BrandSignup() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/signupbrand", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Signup failed");
      return;
    }

    router.push("/signin?signup=success&verified=false");
  }

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  return (
    <div style={styles.container}>
      <div style={styles.formBox}>
        <h2 style={styles.title}>Brand Signup</h2>
        <form onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            required
            style={styles.input}
          />
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
          <button type="submit" disabled={loading} style={loading ? styles.buttonDisabled : styles.button}>
            {loading ? "Signing up..." : "Sign Up as Brand"}
          </button>
          {error && <p style={styles.error}>{error}</p>}
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f0f4f8",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "1rem",
  },
  formBox: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: 8,
    boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
  },
  title: {
    marginBottom: "1.5rem",
    fontSize: "1.8rem",
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: "0.75rem 1rem",
    marginBottom: "1rem",
    borderRadius: 6,
    border: "1.5px solid #ccc",
    fontSize: "1rem",
    outlineColor: "#0070f3",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    padding: "0.75rem",
    backgroundColor: "#0070f3",
    border: "none",
    borderRadius: 6,
    color: "#fff",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  buttonDisabled: {
    width: "100%",
    padding: "0.75rem",
    backgroundColor: "#6c8edf",
    border: "none",
    borderRadius: 6,
    color: "#eee",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "not-allowed",
  },
  error: {
    marginTop: "1rem",
    color: "red",
    fontWeight: "500",
    textAlign: "center",
  },
};
