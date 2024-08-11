function addRow() {
    // Get the table body element
    const tableBody = document.querySelector("#List-table tbody");
    
    // Create a new row element
    const newRow = document.createElement("tr");
    
    // Create and append new cells to the row
    for (let i = 0; i < 3; i++) {
        const newCell = document.createElement("td");
        newCell.textContent = ''; // Leave cell content empty
        newRow.appendChild(newCell);
    }
    
    // Append the new row to the table body
    tableBody.appendChild(newRow);
}

document.addEventListener('DOMContentLoaded', () => {
    fetch('/get-list-data')
        .then(response => response.json())
        .then(data => {
            console.log('Session Data:', data);
            // Get the table body element
            const tableBody = document.querySelector("#List-table tbody");

            // Iterate over data to create rows
            data.forEach(item => {
                const row = document.createElement('tr');

                // Create and append cells for the row
                const nameCell = document.createElement('td');
                nameCell.textContent = item.name; // Assuming item.name contains the anime name
                row.appendChild(nameCell);

                // Placeholder cells for description and rating
                const descriptionCell = document.createElement('td');
                descriptionCell.textContent = 'Description placeholder';
                row.appendChild(descriptionCell);

                const ratingCell = document.createElement('td');
                ratingCell.textContent = 'Rating placeholder';
                row.appendChild(ratingCell);

                // Append the new row to the table body
                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching session data:', error));
});
