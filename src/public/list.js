document.addEventListener('DOMContentLoaded', () => {
    fetch('/get-list-data')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector("#List-table tbody");
            let sortOrder = 'asc'; // Initial sort order

            // Function to populate table
            const populateTable = (sortedData) => {
                tableBody.innerHTML = ''; // Clear existing table rows

                sortedData.forEach(item => {
                    const row = document.createElement('tr');

                    // Name cell
                    const nameCell = document.createElement('td');
                    nameCell.textContent = item.name || 'No Name Available';
                    row.appendChild(nameCell);

                    // Description cell
                    const descriptionCell = document.createElement('td');
                    const synopsisContainer = document.createElement('div');
                    synopsisContainer.className = 'synopsis-container';

                    const maxLength = 220;
                    const fullSynopsis = item.sypnopsis || 'No Synopsis Available';
                    const truncatedSynopsis = fullSynopsis.length > maxLength
                        ? fullSynopsis.substring(0, maxLength) + '...'
                        : fullSynopsis;

                    synopsisContainer.textContent = truncatedSynopsis;

                    const moreButton = document.createElement('span');
                    moreButton.className = 'more-button';
                    moreButton.textContent = fullSynopsis.length > maxLength ? 'More' : '';

                    synopsisContainer.appendChild(document.createTextNode(' '));
                    synopsisContainer.appendChild(moreButton);

                    moreButton.addEventListener('click', () => {
                        if (synopsisContainer.classList.contains('expanded')) {
                            synopsisContainer.classList.remove('expanded');
                            synopsisContainer.textContent = truncatedSynopsis;
                            moreButton.textContent = 'More';
                            synopsisContainer.appendChild(document.createTextNode(' '));
                            synopsisContainer.appendChild(moreButton);
                        } else {
                            synopsisContainer.classList.add('expanded');
                            synopsisContainer.textContent = fullSynopsis;
                            moreButton.textContent = 'Less';
                            synopsisContainer.appendChild(document.createTextNode(' '));
                            synopsisContainer.appendChild(moreButton);
                        }
                    });

                    descriptionCell.appendChild(synopsisContainer);
                    row.appendChild(descriptionCell);

                    // Genre cell
                    const genreCell = document.createElement('td');
                    genreCell.textContent = item.genres || 'No Genre Available';
                    row.appendChild(genreCell);

                    // Episodes cell
                    const episodesCell = document.createElement('td');
                    episodesCell.textContent = item.Episodes || 'No Episodes Available';
                    row.appendChild(episodesCell);

                    // Rating cell
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
                        .then(ratingData => {
                            if (ratingData.rating) {
                                select.value = ratingData.rating;
                                item.rating = ratingData.rating; // Save rating to item
                            } else {
                                item.rating = 0; // Default to 0 if no rating
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
                                item.rating = selectedRating; // Update rating in item
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
            };

            // Initial population of the table
            populateTable(data);

            // Event listener for rating column header click
            document.querySelector("#rating-header").addEventListener('click', () => {
                const sortedData = [...data].sort((a, b) => {
                    const ratingA = parseFloat(a.rating) || 0; // Convert to number or 0
                    const ratingB = parseFloat(b.rating) || 0;

                    if (sortOrder === 'asc') {
                        return ratingB - ratingA; // Descending
                    } else {
                        return ratingA - ratingB; // Ascending
                    }
                });

                populateTable(sortedData);
                sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'; // Toggle sort order
            });

            document.querySelector("#name-header").addEventListener('click', () => {
                const sortedData = [...data].sort((a, b) => {
                    const nameA = a.name || ''; // Fallback to an empty string if the name is missing
                    const nameB = b.name || ''; // Fallback to an empty string if the name is missing
            
                    if (sortOrder === 'asc') {
                        return nameA.localeCompare(nameB); // Ascending
                    } else {
                        return nameB.localeCompare(nameA); // Descending
                    }
                });
            
                populateTable(sortedData);
                sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'; // Toggle sort order
            });
        })
        .catch(error => console.error('Error fetching session data:', error));
});
