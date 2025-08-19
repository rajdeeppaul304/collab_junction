// staticFileAPI.js
import axios from "axios"

const StaticFileAPI = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/static`
})

export default StaticFileAPI
