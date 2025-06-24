import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./auth/Signup";
import Signin from "./auth/Signin";
import Verify from "./Verify";
import CreatorDashboard from "./dashboard/CreatorDashboard";
import BrandDashboard from "./dashboard/BrandDashboard";
import SetRole from "./auth/SetRole";  // Import the SetRole component
import ProtectedRoute from "./ProtectedRoute";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/verify/:token" element={<Verify />} />
        
        {/* Add the /set-role route */}
        <Route path="/set-role" element={<SetRole />} />

        {/* Protected routes for dashboards */}
        <Route path="/dashboard/creator" element={
          <ProtectedRoute role="CREATOR">
            <CreatorDashboard />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/brand" element={
          <ProtectedRoute role="BRAND">
            <BrandDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}
