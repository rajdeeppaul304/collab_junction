// utils/getImageUrl.js

const BASE_STATIC_URL = import.meta.env.VITE_API_BASE_URL

export default function getImageUrl(relativePath, fallback = "/static/placeholder.svg") {
  if (!relativePath) return `${BASE_STATIC_URL}${fallback}`
  return `${BASE_STATIC_URL}${relativePath}`
}