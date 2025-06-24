import { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [form, setForm] = useState({ email: "", password: "", user_role: "CREATOR" });
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/signup", form);
      alert("Verification email sent!");
      navigate("/signin");
    } catch (err) {
      alert(err.response?.data?.msg || "Signup failed");
    }
  };

  const handleGithubSignup = async () => {
    try {
      // Send the selected user role to the backend
      // const response = await API.post("/set_temp_role", { user_role: form.user_role });

      // Redirect the user to GitHub for authentication
      window.location.href = "http://localhost:5000/api/login/github"; // Adjust URL based on your server setup
    } catch (err) {
      alert(err.response?.data?.msg || "Error during role setting");
    }
  };

  return (
    <div>
      <form onSubmit={submit}>
        <h2>Signup</h2>
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <select
          value={form.user_role}
          onChange={(e) => setForm({ ...form, user_role: e.target.value })}
        >
          <option value="CREATOR">Creator</option>
          <option value="BRAND">Brand</option>
        </select>
        <button type="submit">Signup</button>
      </form>

      {/* GitHub OAuth Signup Button */}
      <button onClick={handleGithubSignup}>Sign up with GitHub</button>
    </div>
  );
}
