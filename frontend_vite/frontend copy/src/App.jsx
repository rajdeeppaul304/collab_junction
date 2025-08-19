import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import About from "./pages/About"
import Signin from "./pages/Signin"
import Signup from "./pages/Signup"
import Verify from "./pages/Verify"
import BrandDashboard from "./pages/BrandDashboard"
import Store from "./pages/Store"
import Products from "./pages/Products"
import ProductDetail from "./pages/ProductDetail"
import Profile from "./pages/Profile"
import CreatorInterests from "./pages/CreatorInterests"
import AddProduct from "./pages/AddProduct"
import EditProduct from "./pages/EditProduct"
import ManageProducts from "./pages/ManageProducts"
import FAQ from "./pages/FAQ"
import Contact from "./pages/Contact"
import NotFound from "./pages/NotFound"
import ProtectedRoute from "./components/ProtectedRoute"
import { AuthProvider } from "./context/AuthContext"

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify/:token" element={<Verify />} />
          <Route path="/store" element={<Store />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />

          {/* Protected Routes - CREATOR only */}
         
          <Route
            path="/profile"
            element={
              <ProtectedRoute role="CREATOR">
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - BRAND only */}
          <Route
            path="/dashboard/brand"
            element={
              <ProtectedRoute role="BRAND">
                <BrandDashboard />
              </ProtectedRoute>
            }
            
          />
          <Route
            path="/brand/creator-profile/:id"
            element={
              <ProtectedRoute role="BRAND">
                <Profile viewOnly={true} />
              </ProtectedRoute>
            }
            
          />
          
          {/* <Route path="/product/:id" element={<ProductDetail />} /> */}
          <Route
            path="/add-product"
            element={
              <ProtectedRoute role="BRAND">
                <AddProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage-products"
            element={
              <ProtectedRoute role="BRAND">
                <ManageProducts />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/products/:productId/edit" 
            element={
              <ProtectedRoute role="BRAND">
                <EditProduct />
              </ProtectedRoute>
            } 
          />

       
          <Route 
            path="/brand/interests"
            element={
              <ProtectedRoute role="BRAND">
                <CreatorInterests />
              </ProtectedRoute>
            }
          />

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
