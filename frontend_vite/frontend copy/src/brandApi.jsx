import axios from "axios"

const BrandAPI = axios.create({ baseURL: "http://localhost:5000/brand" })

// Attach JWT token to every request
BrandAPI.interceptors.request.use((req) => {
  const token = localStorage.getItem("token")
  if (token) {
    req.headers.Authorization = `Bearer ${token}`
  }
  return req
})

// Handle token expiration (401 errors)
BrandAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token")
      window.location.href = "/signin"
    }

    return Promise.reject(error)
  }
)

export default BrandAPI
