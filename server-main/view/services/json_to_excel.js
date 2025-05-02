const jsonToExcel = async (jsonRes, XLSX) => {
    try {
        if (!Array.isArray(jsonRes) || jsonRes.length === 0) {
            throw new Error("Invalid data structure: jsonRes must be an array of objects.");
        }

        // Remove duplicate key-value entries in each object
        const uniqueData = jsonRes.map(item => {
            const seen = new Set();
            return Object.fromEntries(
                Object.entries(item).filter(([key, value]) => {
                    const entry = `${key}:${value}`;
                    if (seen.has(entry)) {
                        return false;
                    } else {
                        seen.add(entry);
                        return true;
                    }
                })
            );
        });

        const worksheet = XLSX.utils.json_to_sheet(uniqueData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

        const excelBuffer = await XLSX.write(workbook, {
            bookType: 'xlsx',
            type: 'array',
            compression: true
        });

        return new Blob([excelBuffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });

    } catch (error) {
        console.error('Error generating Excel file:', error);
        return null;
    }
};

export { jsonToExcel };
