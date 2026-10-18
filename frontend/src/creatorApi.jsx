import axios from "axios"

const CreatorAPI = axios.create({ baseURL: `${import.meta.env.VITE_API_BASE_URL}/creator` })

// Add a request interceptor to attach the JWT token to every request
CreatorAPI.interceptors.request.use((req) => {
  const token = localStorage.getItem("token")
  if (token) {
    req.headers.Authorization = `Bearer ${token}`
  }
  return req
})

// Add a response interceptor to handle token expiration
CreatorAPI.interceptors.response.use(
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

export default CreatorAPI
