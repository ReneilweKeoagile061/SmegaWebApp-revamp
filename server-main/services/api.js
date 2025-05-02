import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const getToken = async () => {
  try {
    const response = await axios.post(
      process.env.TOKEN_URL,
      {
        username: process.env.USER_NAME,
        password: process.env.PASSWORD,
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    console.log("Token response:", response.data); // ✅ Log full token response

    return response.data.access_token;
  } catch (err) {
    console.error("Token fetch failed:", err.response?.data || err.message);
    throw err;
  }
};

const getTransactionData = async (msisdn, startDate, endDate) => {
  try {
    const token = await getToken();

    const url = `${process.env.TRANSACTION_URL}/${msisdn}?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;

    console.log("Requesting transactions from URL:", url);
    console.log("Authorization header:", `Bearer ${token}`); // ✅ Log token being sent

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Transaction response:", response.data); // ✅ Log full transaction data

    return response.data;
  } catch (err) {
    console.error("Transaction fetch failed:", err.response?.data || err.message);
    throw err;
  }
};

export { getTransactionData };
