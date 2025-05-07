import { jsonToExcel } from "./json_to_excel.js";

// Initialize UI components
document.getElementById("downloadButton").classList.add("hidden");
document.getElementById("spinner").classList.add("hidden");
document.getElementById("transaction-results-section").classList.add("hidden");

// Modal elements for no transactions
const noTransactionsModal = document.getElementById('no-transactions-modal');
const noTransactionsMessageText = document.getElementById('no-transactions-message-text').querySelector('span');
const noTransactionsBackBtn = document.getElementById('no-transactions-back-btn');
let modalTimeout = null; // To store the timeout ID

function showNoTransactionsModal(phoneNumber) {
    noTransactionsMessageText.textContent = phoneNumber;
    noTransactionsModal.classList.remove('hidden');
    // Trigger CSS transition for modal entrance
    setTimeout(() => {
        noTransactionsModal.querySelector('div > div').classList.remove('scale-95', 'opacity-0');
        noTransactionsModal.querySelector('div > div').classList.add('scale-100', 'opacity-100');
    }, 10); // Short delay to ensure transition applies

    // Clear any existing timeout
    if (modalTimeout) {
        clearTimeout(modalTimeout);
    }
    // Set new timeout to hide modal
    modalTimeout = setTimeout(() => {
        hideNoTransactionsModal();
    }, 5000);
}

function hideNoTransactionsModal() {
    noTransactionsModal.querySelector('div > div').classList.add('scale-95', 'opacity-0');
    noTransactionsModal.querySelector('div > div').classList.remove('scale-100', 'opacity-100');
    setTimeout(() => {
        noTransactionsModal.classList.add('hidden');
    }, 300); // Match transition duration
    if (modalTimeout) {
        clearTimeout(modalTimeout);
        modalTimeout = null;
    }
}

noTransactionsBackBtn.addEventListener('click', hideNoTransactionsModal);

let preparedData = null;
let XLSX = null;

document.getElementById('getButton').addEventListener('click', async () => {
    const inputField1Value = document.getElementById('phone').value;
    const datePicker1Value = document.getElementById('date1').value;
    const datePicker2Value = document.getElementById('date2').value;
    const spinner = document.getElementById('spinner');
    const downloadButton = document.getElementById('downloadButton');
    const message = document.getElementById('message');
    const transactionResultsSection = document.getElementById('transaction-results-section');

    // Hide the spinner and message initially
    spinner.classList.add('hidden');
    message.classList.add('hidden');
    transactionResultsSection.classList.add('hidden');

    // Input validations
    if (!inputField1Value && (!datePicker1Value || !datePicker2Value)) {
        message.textContent = 'All fields are needed';
        message.classList.remove('hidden');
        return;
    }
    if (!inputField1Value && datePicker1Value && datePicker2Value) {
        message.textContent = 'Phone number required';
        message.classList.remove('hidden');
        return;
    }
    if (!datePicker1Value || !datePicker2Value) {
        message.textContent = 'Both dates are required';
        message.classList.remove('hidden');
        return;
    }

    // Show spinner
    spinner.classList.remove('hidden');
    downloadButton.classList.add('hidden');
    message.classList.add('hidden');

    const payload = {
        inputField1Value,
        datePicker1Value,
        datePicker2Value
    };

    try {
        const response = await axios.post("/smega_statement/user", payload);
        const data = response.data;

        if (!data || !Array.isArray(data.transactions) || data.transactions.length === 0) {
            showNoTransactionsModal(inputField1Value); 
            spinner.classList.add('hidden');
            transactionResultsSection.classList.add('hidden');
            downloadButton.classList.add('hidden');
            return;
        }

        // Load XLSX and prepare the Excel blob
        XLSX = await import("https://cdn.sheetjs.com/xlsx-0.19.2/package/xlsx.mjs");
        preparedData = await jsonToExcel(data.transactions, XLSX);

        // Log the received transactions to the console for inspection
        console.log("Received transactions:", data.transactions);

        // Display results in the table
        displayTransactionsInTable(data.transactions);
        
        // Show download button and results section
        downloadButton.classList.remove('hidden');
        transactionResultsSection.classList.remove('hidden');

    } catch (error) {
        console.error('Error:', error);
        message.textContent = 'An error occurred while processing your request.';
        message.classList.remove('hidden');
    } finally {
        spinner.classList.add('hidden');
    }
});

document.getElementById('downloadButton').addEventListener('click', () => {
    if (preparedData) {
        downloadExcel(preparedData);
    }
});

function downloadExcel(blob) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    const msisdn = document.getElementById('phone').value;
    link.download = `Smega_Statement_${msisdn}.xlsx`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Function to display results in the table
function displayTransactionsInTable(transactions) {
    const resultsBody = document.getElementById('transaction-table-body');
    const noTransactionsMessage = document.getElementById('no-transactions-message');
    resultsBody.innerHTML = ''; // Clear previous results or no transaction message

    if (!transactions || transactions.length === 0) {
        resultsBody.innerHTML = `<tr><td colspan="4" class="text-center py-10 text-gray-500">No transactions found for the selected criteria.</td></tr>`;
        return;
    }
    
    let balance = 0; // This will be recalculated based on POST_BALANCE if available, or by running sum of AMOUNT.
    
    transactions.forEach((transaction, index) => {
        const row = document.createElement('tr');
        row.classList.add('hover:bg-gray-50', 'transition-colors', 'duration-150');
        
        let date = 'N/A';
        if (transaction.TRANSFER_DATE) {
            try {
                const d = new Date(transaction.TRANSFER_DATE);
                if (!isNaN(d.getTime())) {
                    const year = d.getFullYear();
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    const hours = String(d.getHours()).padStart(2, '0');
                    const minutes = String(d.getMinutes()).padStart(2, '0');
                    const seconds = String(d.getSeconds()).padStart(2, '0');
                    date = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
                } else {
                    date = transaction.TRANSFER_DATE;
                }
            } catch (e) {
                date = transaction.TRANSFER_DATE;
            }
        }
        
        const description = transaction.SERVICE_TYPE || transaction.EXT_REFERENCE || 'N/A';
        const amount = parseFloat(transaction.AMOUNT) || 0;
        
        // Use POST_BALANCE if available and it's the first transaction, otherwise calculate running balance
        // Or, if transactions are reliably ordered and POST_BALANCE is always the balance *after* this specific transaction.
        // For simplicity and robustness if order or POST_BALANCE meaning is uncertain, recalculating running balance is safer.
        // If POST_BALANCE is definitively the balance *after* this transaction, we can directly use it.
        // Let's assume for now that the transactions are ordered and POST_BALANCE is the balance after the current transaction.
        // If not, we would need to re-sort or sum manually.
        let currentTransactionBalance;
        if (typeof transaction.POST_BALANCE !== 'undefined' && transaction.POST_BALANCE !== null) {
            currentTransactionBalance = parseFloat(transaction.POST_BALANCE);
            balance = currentTransactionBalance; // Update overall balance to the latest post_balance
        } else {
            // Fallback to calculating running balance if POST_BALANCE is not available
            if (index === 0) { // If first transaction and no POST_BALANCE, try PREVIOUS_BALANCE + AMOUNT
                 balance = (parseFloat(transaction.PREVIOUS_BALANCE) || 0) + amount;
            } else {
                 balance += amount; // Add current transaction's amount to the running balance
            }
            currentTransactionBalance = balance;
        }
        
        row.innerHTML = `
            <td class="px-4 py-2 text-xs text-gray-700">${date}</td>
            <td class="px-4 py-2 text-xs text-gray-700">${description}</td>
            <td class="px-4 py-2 text-xs ${amount >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}">
                ${amount >= 0 ? '+' : ''}${amount.toFixed(2)}
            </td>
            <td class="px-4 py-2 text-xs text-gray-800 font-medium">${currentTransactionBalance.toFixed(2)}</td>
        `;
        
        resultsBody.appendChild(row);
    });
}

/* // Old displayResults function - can be fully removed now
function displayResults(transactions) {
    const resultsBody = document.getElementById('results-body');
// ... existing code ...
*/
