import { getTransactionData } from "./api.js";

const processQuery = async (params) => {
  const msisdn = params.inputField1Value;
  const startDate = params.datePicker1Value;
  const endDate = params.datePicker2Value;

  try {
    const result = await getTransactionData(msisdn, startDate, endDate);
    return result;
  } catch (error) {
    console.error("Failed to process query:", error);
    throw error;
  }
};

export { processQuery };
