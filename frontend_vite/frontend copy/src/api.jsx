import axios from "axios"

const API = axios.create({ baseURL: "http://localhost:5000/api" })

// Add a request interceptor to attach the JWT token to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token")
  if (token) {
    req.headers.Authorization = `Bearer ${token}`
  }
  return req
})

// Add a response interceptor to handle token expiration
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the error is due to an expired token (401 Unauthorized)
    if (error.response && error.response.status === 401) {
      // Clear the token from localStorage
      localStorage.removeItem("token")

      // Redirect to login page
      window.location.href = "/signin"
    }

    return Promise.reject(error)
  },
)

export default API
