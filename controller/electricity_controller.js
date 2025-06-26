import { getElectricityTransactionData } from "../services/electricity_service.js";

const getElectricityTransactions = async (req, res, next) => {
    const { meterNumber, startDate, endDate } = req.query;

    if (!meterNumber || !startDate || !endDate) {
        return res.status(400).json({ success: false, message: 'Meter number, start date, and end date are required' });
    }

    try {
        const results = await getElectricityTransactionData(meterNumber, startDate, endDate);
        res.status(200).json({
            success: true,
            transactions: Array.isArray(results) ? results : (results.transactions || [])
        });
    } catch (error) {
        const statusCode = error.response ? error.response.status : 500;
        const message = error.response?.data?.message || "An error occurred while fetching electricity transactions.";
        res.status(statusCode).json({ success: false, message });
    }
};

const createElectricityTransaction = async (req, res, next) => {
    const transactionData = req.body;
    
    // Basic validation
    if (!transactionData || !transactionData.meter || !transactionData.amount) {
        return res.status(400).json({ success: false, message: 'Invalid transaction data provided.' });
    }

    console.log('Received new transaction:', transactionData);

    // In a real application, you would save this to a database.
    // For now, we just simulate success and return the data.
    res.status(201).json({ 
        success: true, 
        message: 'Transaction created successfully',
        transaction: transactionData 
    });
};

export { getElectricityTransactions, createElectricityTransaction }; 
