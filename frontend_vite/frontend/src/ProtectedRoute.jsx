import { Navigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';

export default function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");

  // If there's no token, redirect to signin page
  if (!token) return <Navigate to="/signin" />;

  try {
    const decoded = jwtDecode(token);

    // Access role from the 'sub' object in the decoded token
    const userRole = decoded.sub?.role;

    // If the user role doesn't match the required role, redirect to signin
    if (role && userRole !== role) return <Navigate to="/signin" />;

    return children; // Render the protected content if role matches
  } catch {
    return <Navigate to="/signin" />; // Handle invalid or expired token
  }
}
