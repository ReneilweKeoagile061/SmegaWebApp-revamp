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
    const modal = noTransactionsModal;
    const modalContent = modal.querySelector('div > div');
    
    // Store the last focused element
    const lastFocusedElement = document.activeElement;
    
    noTransactionsMessageText.textContent = phoneNumber;
    modal.classList.remove('hidden');
    
    // Focus trap
    const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];
    
    modal.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstFocusableElement) {
                    e.preventDefault();
                    lastFocusableElement.focus();
                }
            } else {
                if (document.activeElement === lastFocusableElement) {
                    e.preventDefault();
                    firstFocusableElement.focus();
                }
            }
        }
    });
    
    // Focus first element
    firstFocusableElement.focus();
    
    // Trigger CSS transition
    setTimeout(() => {
        modalContent.classList.remove('scale-95', 'opacity-0');
        modalContent.classList.add('scale-100', 'opacity-100');
    }, 10);

    // Clear any existing timeout
    if (modalTimeout) {
        clearTimeout(modalTimeout);
    }
    
    // Set new timeout to hide modal
    modalTimeout = setTimeout(() => {
        hideNoTransactionsModal();
        // Restore focus
        lastFocusedElement.focus();
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

// Security and data sanitization functions
function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    return input.replace(/[<>'"]/g, '');
}

function sanitizeAmount(amount) {
    const num = parseFloat(amount);
    return isNaN(num) ? 0 : num;
}

function sanitizeDate(date) {
    if (!date) return 'N/A';
    try {
        const d = new Date(date);
        return isNaN(d.getTime()) ? 'N/A' : d.toISOString().slice(0, 10);
    } catch (e) {
        return 'N/A';
    }
}

function maskSensitiveData(data) {
    if (!data) return 'N/A';
    const str = String(data);
    if (str.length <= 4) return str;
    return str.slice(0, 2) + '*'.repeat(str.length - 4) + str.slice(-2);
}

document.getElementById('getButton').addEventListener('click', async () => {
    const button = document.getElementById('getButton');
    const spinner = document.getElementById('spinner');
    const message = document.getElementById('message');
    const transactionResultsSection = document.getElementById('transaction-results-section');
    const downloadButton = document.getElementById('downloadButton');

    // Disable button and show loading state
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    spinner.classList.remove('hidden');
    message.classList.add('hidden');
    transactionResultsSection.classList.add('hidden');
    downloadButton.classList.add('hidden');

    const inputField1Value = sanitizeInput(document.getElementById('phone').value);
    const datePicker1Value = sanitizeDate(document.getElementById('date1').value);
    const datePicker2Value = sanitizeDate(document.getElementById('date2').value);

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
        
        // Set preparedData to the array of transactions
        preparedData = data.transactions;
        
        // Show download button and results section
        downloadButton.classList.remove('hidden');
        transactionResultsSection.classList.remove('hidden');

    } catch (error) {
        console.error('Error:', error);
        message.textContent = 'An error occurred while processing your request. Please try again.';
        message.classList.remove('hidden');
        message.setAttribute('role', 'alert');
    } finally {
        // Re-enable button and hide loading state
        button.disabled = false;
        button.setAttribute('aria-busy', 'false');
        spinner.classList.add('hidden');
    }
});

// Add jsPDF PDF generation for statement
async function generateStatementPDF(transactions, walletNumber) {
    if (!window.jspdf) {
        console.error('jsPDF library not found. Make sure it is loaded before this script.');
        return;
    }
    const CHUNK_SIZE = 50;
    const totalPages = Math.ceil(transactions.length / CHUNK_SIZE);
    const jsPDF = window.jspdf.jsPDF;
    const doc = new jsPDF();
    let processedTransactions = 0;
    let total = 0;
    transactions.forEach(txn => {
        total += parseFloat(txn.AMOUNT) || 0;
    });
    for (let page = 0; page < totalPages; page++) {
        const start = page * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, transactions.length);
        const chunk = transactions.slice(start, end);
        if (page > 0) {
            doc.addPage();
        }
        const showCustomerInfo = page === 0;
        const showTotalAmount = page === totalPages - 1;
        await generatePageContent(doc, chunk, page + 1, totalPages, walletNumber, showCustomerInfo, showTotalAmount, total);
        processedTransactions += chunk.length;
    }
    doc.save(`SMEGA_Statement_${walletNumber}_${new Date().toISOString().slice(0,10)}.pdf`);
}

// Separate function for generating page content
async function generatePageContent(doc, transactions, currentPage, totalPages, walletNumber, showCustomerInfo, showTotalAmount, total) {
    console.log("Generating PDF with transactions:", transactions);
    
    if (!Array.isArray(transactions)) {
        console.error('Transactions data is not an array:', transactions);
        return;
    }
    
    if (transactions.length === 0) {
        console.warn("No transactions found to display in PDF");
    }
    
    async function getImageBase64(url) {
        return new Promise((resolve, reject) => {
            const img = new window.Image();
            img.crossOrigin = 'Anonymous';
            img.onload = function () {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = reject;
            img.src = url;
        });
    }

    // Modern Header Design
    doc.setFillColor(250, 250, 250);
    doc.rect(0, 0, 210, 297, 'F');
    doc.setFillColor(0, 130, 72);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setDrawColor(0, 130, 72);
    doc.setLineWidth(1.2);
    doc.line(0, 40, 210, 40);
    try {
        const btcLogo = await getImageBase64('../resoures/image.png');
        doc.addImage(btcLogo, 'PNG', 15, 10, 20, 20);
    } catch (e) {}
    try {
        const smegaMoneyLogo = await getImageBase64('../resoures/Smega money.png');
        doc.addImage(smegaMoneyLogo, 'PNG', 175, 10, 20, 20);
    } catch (e) {}
    doc.setTextColor(255, 255, 255);
    doc.setFont('times', 'bold');
    doc.setFontSize(22);
    doc.text('SMEGA WALLET', 105, 20, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(13);
    doc.text('Statement of Account', 105, 32, { align: 'center' });

    // Only show customer info on first page
    if (showCustomerInfo) {
        doc.setFillColor(245, 245, 245);
        doc.roundedRect(10, 45, 190, 40, 3, 3, 'F');
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.5);
        doc.roundedRect(10, 45, 190, 40, 3, 3);
        let customerName = '';
        let accountBalance = '-';
        if (transactions.length > 0 && transactions[0].CUSTOMER_NAME) {
            customerName = transactions[0].CUSTOMER_NAME;
            if (customerName === 'N/A') customerName = '';
        }
        if (transactions.length > 0) {
            const t = transactions[0];
            if (t.POST_BALANCE !== undefined && !isNaN(parseFloat(t.POST_BALANCE))) {
                accountBalance = `P ${parseFloat(t.POST_BALANCE).toFixed(2)}`;
            } else if (t.BALANCE !== undefined && !isNaN(parseFloat(t.BALANCE).toFixed(2))) {
                accountBalance = `P ${parseFloat(t.BALANCE).toFixed(2)}`;
            }
        }
        const customerPhone = transactions.length > 0 ? (transactions[0].CUSTOMER_CONTACT || transactions[0].MSISDN || walletNumber) : walletNumber;
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Account Information', 15, 55);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Wallet Number: ${walletNumber}`, 15, 65);
        doc.text(`Statement Date: ${new Date().toISOString().slice(0, 10)}`, 105, 65);
        doc.text(`Account Balance: ${accountBalance}`, 15, 73);
        if (customerName && customerName.trim() !== '' && customerName !== 'N/A') {
            doc.text(`Customer Name: ${customerName}`, 15, 81);
        } else {
            doc.text('Customer Name: -', 15, 81);
        }
    }

    // Adjusted column widths for better fit
    const headers = ["Date", "Description", "Amount", "Prev Balance", "Post Balance", "Service", "Type", "Receiver"];
    // Wider receiver, slightly narrower others
    const colWidths = [22, 32, 16, 20, 20, 26, 14, 40];
    let y = showCustomerInfo ? 85 : 55;
    doc.setFontSize(8); // Smaller font for better fit
    let x = 10;
    headers.forEach((header, i) => {
        doc.setFillColor(0, 130, 72);
        doc.rect(x, y, colWidths[i], 8, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text(header, x + (colWidths[i] / 2), y + 5.5, { align: 'center' });
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.3);
        doc.line(x, y + 8, x + colWidths[i], y + 8);
        x += colWidths[i];
    });
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7); // Smaller font for table body
    let fill = false;
    if (transactions.length === 0) {
        doc.setTextColor(100, 100, 100);
        doc.setFont('helvetica', 'italic');
        doc.text("No transactions found for the selected period.", 105, y + 10, { align: 'center' });
    } else {
        transactions.forEach((txn, idx) => {
            if (y > 250) return; // Prevent overflow, handled by chunking
            if (fill) {
                doc.setFillColor(245, 245, 245);
            } else {
                doc.setFillColor(255, 255, 255);
            }
            x = 10;
            headers.forEach((_, i) => {
                doc.rect(x, y, colWidths[i], 6, 'F');
                x += colWidths[i];
            });
            x = 10;
            doc.setTextColor(0, 0, 0);
            const date = txn.TRANSFER_DATE ? new Date(txn.TRANSFER_DATE).toISOString().slice(0, 10) : 'N/A';
            const description = (txn.SERVICE_TYPE || txn.EXT_REFERENCE || 'N/A').toString().substring(0, 18);
            const amount = parseFloat(txn.AMOUNT) || 0;
            const prevBalance = txn.PREVIOUS_BALANCE !== undefined ? parseFloat(txn.PREVIOUS_BALANCE).toFixed(2) : 'N/A';
            const postBalance = txn.POST_BALANCE !== undefined ? parseFloat(txn.POST_BALANCE).toFixed(2) : 'N/A';
            const serviceName = (txn.SERVICE_NAME || '').substring(0, 16) || txn.SERVICE_TYPE || 'N/A';
            const transType = (txn.TRANS_TYPE || txn.TRANSACTION_TYPE || 'N/A').toString().substring(0, 8);
            const receiver = (txn.RECEIVER || txn.RECEIVER_MSISDN || 'N/A').toString().substring(0, 20); // Unmasked, truncated for fit
            doc.text(date, x + (colWidths[0] / 2), y + 4, { align: 'center' });
            x += colWidths[0];
            doc.text(description, x + 2, y + 4, { align: 'left' });
            x += colWidths[1];
            if (amount > 0) {
                doc.setTextColor(0, 128, 0);
            } else {
                doc.setTextColor(220, 0, 0);
            }
            doc.text(amount.toFixed(2), x + colWidths[2] - 2, y + 4, { align: 'right' });
            x += colWidths[2];
            doc.setTextColor(0, 0, 0);
            doc.text(prevBalance, x + colWidths[3] - 2, y + 4, { align: 'right' });
            x += colWidths[3];
            doc.text(postBalance, x + colWidths[4] - 2, y + 4, { align: 'right' });
            x += colWidths[4];
            doc.setTextColor(0, 0, 0);
            doc.text(serviceName, x + 2, y + 4, { align: 'left' });
            x += colWidths[5];
            doc.text(transType, x + (colWidths[6] / 2), y + 4, { align: 'center' });
            x += colWidths[6];
            doc.text(receiver, x + 2, y + 4, { align: 'left' });
            y += 6;
            fill = !fill;
        });
    }

    // Modern Footer Design
    const footerY = 280;

    // Signature space just above the footer
    let sigY = footerY - 15;
    if (currentPage === totalPages) {
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.1);
        doc.line(10, sigY, 100, sigY);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text("Authorized Signature / Stamp", 10, sigY + 7);
    }

    // Modern Footer Design
    doc.setFillColor(245, 245, 245);
    doc.rect(0, footerY - 5, 210, 40, 'F');
    doc.setDrawColor(0, 130, 72);
    doc.setLineWidth(0.5);
    doc.line(10, footerY - 5, 200, footerY - 5);
    try {
        const smegaLogo = await getImageBase64('../resoures/Smega money.png');
        doc.addImage(smegaLogo, 'PNG', 165, footerY, 32, 18);
    } catch (e) {
        console.warn("Could not load Smega logo for footer:", e);
    }
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.1);
    doc.line(10, footerY + 5, 100, footerY + 5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("Authorized Signature / Stamp", 10, footerY + 12);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(128);
    doc.text(
        `Generated: ${new Date().toISOString().slice(0, 16).replace('T', ' ')} | Page ${currentPage} of ${totalPages}`,
        105, footerY + 8, { align: 'center' }
    );
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(70, 70, 70);
    doc.text('Botswana Telecommunications Corporation Limited', 105, footerY + 15, { align: 'center' });
    doc.text('Head Office: Megaleng House, Khama Crescent, Gaborone', 105, footerY + 20, { align: 'center' });
    doc.text('Contact: +267 365 6000 | Toll-Free: 0800 365 365', 105, footerY + 25, { align: 'center' });

    // Update page number display
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(128);
    doc.text(`Page ${currentPage} of ${totalPages}`, 200, 295, { align: 'right' });
}

// Replace download button logic to use PDF
// preparedData should be your transactions array

document.getElementById('downloadButton').addEventListener('click', async () => {
    const msisdn = document.getElementById('phone').value;
    if (preparedData) {
        try {
            await generateStatementPDF(preparedData, msisdn);
        } catch (error) {
            console.error("Error generating PDF:", error);
        }
    }
});

// Function to display results in the table
function displayTransactionsInTable(transactions) {
    const resultsBody = document.getElementById('transaction-table-body');
    resultsBody.innerHTML = '';

    // Extract and display customer info from the first transaction
    let customerName = '-';
    let customerPhone = '-';
    let accountBalance = '-';
    if (transactions && transactions.length > 0) {
        const t = transactions[0];
        customerName = t.CUSTOMER_NAME && t.CUSTOMER_NAME !== 'N/A' ? t.CUSTOMER_NAME : '-';
        customerPhone = t.MSISDN || t.CUSTOMER_CONTACT || '-';
        if (t.POST_BALANCE !== undefined && !isNaN(parseFloat(t.POST_BALANCE))) {
            accountBalance = `P ${parseFloat(t.POST_BALANCE).toFixed(2)}`;
        } else if (t.BALANCE !== undefined && !isNaN(parseFloat(t.BALANCE))) {
            accountBalance = `P ${parseFloat(t.BALANCE).toFixed(2)}`;
        }
    }
    document.getElementById('customer-name').textContent = customerName;
    document.getElementById('customer-phone').textContent = customerPhone;
    document.getElementById('account-balance').textContent = accountBalance;

    if (!transactions || transactions.length === 0) {
        resultsBody.innerHTML = `<tr><td colspan="8" class="text-center py-10 text-gray-500" role="alert" aria-live="polite">No transactions found for the selected criteria.</td></tr>`;
        return;
    }

    transactions.forEach((txn, idx) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-4 py-2 text-xs text-gray-700">${txn.TRANSFER_DATE ? new Date(txn.TRANSFER_DATE).toISOString().slice(0, 10) : 'N/A'}</td>
            <td class="px-4 py-2 text-xs text-gray-700">${txn.SERVICE_TYPE || txn.EXT_REFERENCE || 'N/A'}</td>
            <td class="px-4 py-2 text-xs text-gray-700">${parseFloat(txn.AMOUNT) || 0}</td>
            <td class="px-4 py-2 text-xs text-gray-700">${txn.PREVIOUS_BALANCE !== undefined ? parseFloat(txn.PREVIOUS_BALANCE).toFixed(2) : 'N/A'}</td>
            <td class="px-4 py-2 text-xs text-gray-700">${txn.POST_BALANCE !== undefined ? parseFloat(txn.POST_BALANCE).toFixed(2) : 'N/A'}</td>
            <td class="px-4 py-2 text-xs text-gray-700">${txn.SERVICE_NAME || txn.SERVICE_TYPE || 'N/A'}</td>
            <td class="px-4 py-2 text-xs text-gray-700">${txn.RECEIVER || txn.RECEIVER_MSISDN || 'N/A'}</td>
            <td class="px-4 py-2 text-xs text-gray-700">${txn.TRANS_TYPE || txn.TRANSACTION_TYPE || 'N/A'}</td>
        `;
        resultsBody.appendChild(row);
    });
}