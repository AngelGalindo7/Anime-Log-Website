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
            const tableBody = document.querySelector("#List-table tbody");

            data.forEach(item => {
                const row = document.createElement('tr');

                // Image cell
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
                    if (synopsisContainer.classList.contains('expanded')) {
                        synopsisContainer.classList.remove('expanded');
                        synopsisContainer.textContent = truncatedSynopsis;
                        moreButton.textContent = 'More';
                    } else {
                        synopsisContainer.classList.add('expanded');
                        synopsisContainer.textContent = fullSynopsis;
                        moreButton.textContent = 'Less';
                    }
                });

                synopsisContainer.appendChild(moreButton); // Append button to synopsisContainer
                descriptionCell.appendChild(synopsisContainer);

                row.appendChild(descriptionCell);

                // Rating cell
                // Create a dropdown menu for the rating column
                const anime_id = item.anime_id;
                const ratingCell = document.createElement('td');

                const select = document.createElement('select');

                const defaultOption = document.createElement('option');
                defaultOption.textContent = '--';
                defaultOption.value = '';
                select.appendChild(defaultOption);

                for (let i = 1; i <= 10; i++) {
                    const option = document.createElement('option');
                    option.value = i;
                    option.textContent = i;
                    select.appendChild(option);
                }

                // Retrieve and set the user's saved rating
                fetch(`/get-rating?anime_id=${anime_id}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.rating) {
                            select.value = data.rating;
                        }
                    });

                select.addEventListener('change', function() {
                    const selectedRating = this.value;

                    fetch('/save-rating', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            anime_id: anime_id,
                            rating: selectedRating
                        })
                    })
                    .then(response => {
                        if (response.ok) {
                            console.log('Rating saved successfully');
                        } else {
                            console.error('Failed to save rating');
                        }
                    });
                });

                ratingCell.appendChild(select);
                row.appendChild(ratingCell);

                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching session data:', error));
});
