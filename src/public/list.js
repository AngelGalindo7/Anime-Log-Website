function addRow() {
    // Get the table body element
    const tableBody = document.querySelector("#List-table tbody");
    
    // Create a new row element
    const newRow = document.createElement("tr");
    
    // Create and append new cells to the row
    for (let i = 0; i < 3; i++) {
        const newCell = document.createElement("td");
        //newCell.textContent = `Row ${tableBody.rows.length + 1}, Cell ${i + 1}`;
        newCell.textContent = '';
        newRow.appendChild(newCell);
    }
    
    // Append the new row to the table body
    tableBody.appendChild(newRow);
}
