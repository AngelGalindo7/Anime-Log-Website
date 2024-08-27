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
            const tableBody = document.querySelector("#List-table tbody");

            data.forEach(item => {
                const row = document.createElement('tr');

                // Rating cell
                const imageCell = document.createElement('td');
                imageCell.textContent = 'Image placeholder';
                row.appendChild(imageCell);

                // Name cell
                const nameCell = document.createElement('td');
                nameCell.textContent = item.name || 'No Name Available';
                row.appendChild(nameCell);

                // Description cell
                const descriptionCell = document.createElement('td');
                const synopsisContainer = document.createElement('div');
                synopsisContainer.className = 'synopsis-container'; // Correct class name

                const maxLength = 100;
                const fullSynopsis = item.sypnopsis || 'No Synopsis Available';
                const truncatedSynopsis = fullSynopsis.length > maxLength
                    ? fullSynopsis.substring(0, maxLength) + '...'
                    : fullSynopsis;

                synopsisContainer.textContent = truncatedSynopsis;

                const moreButton = document.createElement('span');
                moreButton.className = 'more-button';
                moreButton.textContent = fullSynopsis.length > maxLength ? 'More' : '';

                moreButton.addEventListener('click', () => {
                    if (synopsisContainer.textContent === truncatedSynopsis) {
                        synopsisContainer.textContent = fullSynopsis;
                        moreButton.textContent = 'Less';
                    } else {
                        synopsisContainer.textContent = truncatedSynopsis;
                        moreButton.textContent = 'More';
                    }
                });

                descriptionCell.appendChild(synopsisContainer);
                if (fullSynopsis.length > maxLength) {
                    descriptionCell.appendChild(moreButton);
                }

                row.appendChild(descriptionCell);

                // Rating cell
                const ratingCell = document.createElement('td');
                ratingCell.textContent = 'Rating placeholder';
                row.appendChild(ratingCell);

                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching session data:', error));
});
