import { jsonToExcel } from "./json_to_excel.js";

document.getElementById("downloadButton").style.display = "none";
document.getElementById("spinner").style.display = "none";

let preparedData = null;
let XLSX = null;

document.getElementById('getButton').addEventListener('click', async () => {
    document.getElementById("downloadButton").style.display = "none";
    document.getElementById("spinner").style.display = "block";
    const inputField1Value = document.getElementById('phone').value;
    const datePicker1Value = document.getElementById('date1').value;
    const datePicker2Value = document.getElementById('date2').value;

    if (inputField1Value && datePicker1Value && datePicker2Value) {
        const payload = {
            inputField1Value,
            datePicker1Value,
            datePicker2Value
        };

        try {
            const response = await axios.post("http://localhost:3600/smega_statement/user", payload);
            console.log(response);
            document.getElementById("spinner").style.display = "none";
            document.getElementById("downloadButton").style.display = "block";

            // Preload XLSX library and prepare data
            XLSX = await import("https://cdn.sheetjs.com/xlsx-0.19.2/package/xlsx.mjs");
            preparedData = await jsonToExcel(response.data, XLSX);

            document.getElementById("downloadButton").addEventListener('click', () => {
                if (preparedData) {
                    downloadExcel(preparedData);
                }
            });
        } catch (error) {
            console.error('Error:', error);
            document.getElementById("spinner").style.display = "none";
        }
    }
});

function downloadExcel(blob) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = "Smega_Statement.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}