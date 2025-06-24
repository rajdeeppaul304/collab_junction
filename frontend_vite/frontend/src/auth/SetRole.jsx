import { useState, useEffect } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';

export default function SetRole() {
  const [role, setRole] = useState("CREATOR");
  const [githubId, setGithubId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Extract the github_id from URL params or redirect if not found
    const urlParams = new URLSearchParams(window.location.search);
    const githubId = urlParams.get("github_id");

    if (!githubId) {
      navigate("/signin"); // If no github_id found, redirect to sign-in page
    } else {
      setGithubId(githubId);
    }
  }, [navigate]);
const handleRoleSelection = async () => {
  if (!githubId) {
    alert("GitHub ID is missing.");
    return;
  }

  try {
    const response = await API.post("/set_role", {
      github_id: githubId,
      user_role: role,
    });

    alert(response.data.msg);

    const token = response.data.token;
    localStorage.setItem("token", token);

    // Optional: decode the token to decide where to go
    const decoded = jwtDecode(token);
    const userRole = decoded.sub?.role;

    if (userRole === "CREATOR") {
      navigate("/dashboard/creator");
    } else if (userRole === "BRAND") {
      navigate("/dashboard/brand");
    } else {
      navigate("/dashboard"); // fallback
    }
  } catch (err) {
    console.error("Error setting role:", err);
    alert(err.response?.data?.msg || "Error setting role.");
  }
};


  return (
    <div>
      <h2>Select Your Role</h2>
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="CREATOR">Creator</option>
        <option value="BRAND">Brand</option>
      </select>
      <button onClick={handleRoleSelection}>Confirm Role</button>
    </div>
  );
}
