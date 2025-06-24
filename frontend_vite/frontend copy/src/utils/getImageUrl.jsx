// utils/getImageUrl.js

const BASE_STATIC_URL = "http://localhost:5000"

export default function getImageUrl(relativePath, fallback = "/static/placeholder.svg") {
  if (!relativePath) return `${BASE_STATIC_URL}${fallback}`
  return `${BASE_STATIC_URL}${relativePath}`
}