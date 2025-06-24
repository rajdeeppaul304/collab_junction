import { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';

export default function Signin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/signin", form);
      console.log("Response:", res); // Log the response to inspect its contents
      const token = res.data.token;
      localStorage.setItem("token", token);

      // Decode the token to check its payload
      const decodedToken = jwtDecode(token);
      console.log("Decoded Token:", decodedToken); // Inspect the full decoded token

      // Access the role from the 'sub' object
      const { role } = decodedToken.sub; 
      console.log("role:", role); // Check if the role is now accessible

      if (role === "CREATOR") navigate("/dashboard/creator");
      else if (role === "BRAND") navigate("/dashboard/brand");
    } catch (err) {
      console.error("Error during signin:", err); // Log the error for inspection
      alert(err.response?.data?.msg || "Signin failed");
    }
  };

  return (
    <div>
      <form onSubmit={submit}>
        <h2>Signin</h2>
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
        <button type="submit">Signin</button>
      </form>
    </div>
  );
}
