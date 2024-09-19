import { jsonToExcel } from "./json_to_excel.js";

document.getElementById("downloadButton").style.display = "none";
document.getElementById("spinner").style.display = "none";

let preparedData = null;
let XLSX = null;

document.getElementById('getButton').addEventListener('click', async () => {
    const inputField1Value = document.getElementById('phone').value;
    const datePicker1Value = document.getElementById('date1').value;
    const datePicker2Value = document.getElementById('date2').value;
    const spinner = document.getElementById('spinner');
    const downloadButton = document.getElementById('downloadButton');
    const message = document.getElementById('message');

    // Hide the spinner and message initially
    spinner.style.display = 'none';
    message.style.display = 'none';

    // Check if all fields are provided
    if (!inputField1Value && (!datePicker1Value || !datePicker2Value)) {
        alert('All fields are needed');
        return; // Exits the function without showing the spinner
    }

    // Check if both dates are provided but MSISDN is missing
    if (!inputField1Value && datePicker1Value && datePicker2Value) {
        alert('MSISDN required');
        return; // Exits the function without showing the spinner
    }

    // Check if either of the date pickers is missing
    if (!datePicker1Value || !datePicker2Value) {
        alert('Date required');
        return; // Exits the function without showing the spinner
    }

    // Show spinner and proceed with fetching data
    spinner.style.display = 'block';
    downloadButton.style.display = 'none';
    message.style.display = 'none';

    const payload = {
        inputField1Value,
        datePicker1Value,
        datePicker2Value
    };

    try {
        const response = await axios.post("/smega_statement/user", payload);
        const data = response.data;

        // Check if data is empty
        if (!data || data.length === 0) {
            message.textContent = 'No transaction found';
            message.style.display = 'block';
            spinner.style.display = 'none';
            return;
        }

        // Preload XLSX library and prepare data
        XLSX = await import("https://cdn.sheetjs.com/xlsx-0.19.2/package/xlsx.mjs");
        preparedData = await jsonToExcel(data, XLSX);

        downloadButton.style.display = "block";

        downloadButton.addEventListener('click', () => {
            if (preparedData) {
                downloadExcel(preparedData);
            }
        });
    } catch (error) {
        console.error('Error:', error);
        message.textContent = 'An error occurred while processing your request.';
        message.style.display = 'block';
    } finally {
        spinner.style.display = 'none';
    }
});

function downloadExcel(blob) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Set the filename to include the MSISDN
    const msisdn = document.getElementById('phone').value;
    link.download = `Smega_Statement_${msisdn}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
