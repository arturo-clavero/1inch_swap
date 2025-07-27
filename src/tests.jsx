import { useState } from "react";
import axios from "axios";

function Secret() {
  const [response, setResponse] = useState("");

  const testBackend = async () => {
    try {
      const res = await axios.get("http://localhost:3000/"); 
      setResponse(res.data);
    } catch (error) {
      console.error(error);
      setResponse("Error: " + error.message);
    }
  };

  const generateSecret = async () => {
    try {
      const res = await axios.post("http://localhost:3000/api/generate");
      setResponse(res.data);
    } catch (error) {
      console.error(error);
      setResponse("Error: " + error.message);
    }
  };
  const lockTokens = async () => {
  try {
    const res = await axios.post(`http://localhost:3000/api/lock`);
    setResponse(res.data);
  } catch (error) {
    console.error(error);
    setResponse("Error: " + error.message);
  }
};

const withdrawTokens = async () => {
  try {
    const res = await axios.post(`http://localhost:3000/api/withdraw`);
    setResponse(res.data);
  } catch (error) {
    console.error(error);
    setResponse("Error: " + error.message);
  }
};

const refundTokens = async () => {
  try {
    const res = await axios.post(`http://localhost:3000/api/refund`);
    setResponse(res.data);
  } catch (error) {
    console.error(error);
    setResponse("Error: " + error.message);
  }
};

  return (
  <div className="secret-card">
    <h2>Backend Test</h2>
    <button onClick={testBackend}>Test GET /</button>
    <button onClick={generateSecret}>POST /generate</button>
    <button onClick={lockTokens}>POST /lock</button>
    <button onClick={withdrawTokens}>POST /withdraw</button>
    <button onClick={refundTokens}>POST /refund</button>
    <p>Response: {response}</p>
  </div>
);
}

export default Secret;
