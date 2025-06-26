import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const getElectricityTransactionData = async (meterNumber, startDate, endDate) => {
    try {
        const url = `http://10.1.31.249:6005/api/electricity/electricity-transactions/by-date/${meterNumber}?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;

        const response = await axios.get(url);

        return response.data;
    } catch (error) {
        console.error(
            "Failed to fetch electricity transactions from public API:",
            error.response ? error.response.data : error.message
        );
        throw error;
    }
};

export { getElectricityTransactionData }; 