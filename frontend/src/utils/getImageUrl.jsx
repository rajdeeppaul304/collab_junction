// utils/getImageUrl.js

const BASE_STATIC_URL = import.meta.env.VITE_API_BASE_URL || ""

// The fallback lives in this app's own /public folder (served at the site
// root by Vite), not on the backend - so it must NOT be prefixed with the
// API base URL like real uploaded images are.
export default function getImageUrl(relativePath, fallback = "/placeholder.svg") {
  if (!relativePath) return fallback
  if (relativePath.startsWith("http://") || relativePath.startsWith("https://") || relativePath.startsWith("blob:") || relativePath.startsWith("data:")) {
    return relativePath
  }
  const base = (BASE_STATIC_URL || "").replace(/\/+$/, "")
  const path = relativePath.startsWith("/") ? relativePath : `/${relativePath}`
  return `${base}${path}`
}