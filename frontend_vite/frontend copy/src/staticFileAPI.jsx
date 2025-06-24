// staticFileAPI.js
import axios from "axios"

const StaticFileAPI = axios.create({
  baseURL: "http://localhost:5000/static"
})

export default StaticFileAPI
