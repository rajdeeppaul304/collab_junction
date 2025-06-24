import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";  // Import useParams
import API from "./api";

export default function Verify() {
  const { token } = useParams();  // Extract the token from the URL
  const [message, setMessage] = useState("Verifying...");

  useEffect(() => {
    console.log("Token from URL:", token);  // Debugging line to check token value

    if (token) {
      API.get(`/verify/${token}`)
        .then((res) => setMessage(res.data.msg))
        .catch((err) => setMessage(err.response?.data?.msg || "Verification failed"));
    } else {
      setMessage("No token provided");
    }
  }, [token]);

  return <h2>{message}</h2>;
}
