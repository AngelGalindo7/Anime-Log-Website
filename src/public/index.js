document.addEventListener('DOMContentLoaded', function() {
        const resultsDiv = document.getElementById('search-results');
        const searchInput = document.getElementById('search');
        // console.log("test");
        searchInput.addEventListener('input', function() {
            const query = this.value;
            if (query.length > 0) {
                fetch('/search', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ search: query })
                })
                .then(response => response.json())
                .then(data => {
                    resultsDiv.innerHTML = ''; // Clear previous results
                    if (data.results.length > 0) {
                        resultsDiv.style.display = 'block';
                        data.results.forEach(function(result) {
                            // Create a container for the result item
                            const resultItem = document.createElement('div');
                            resultItem.className = 'result-item';
    
                            // Add the result name
                            const nameSpan = document.createElement('span');
                            nameSpan.textContent = result.name;
                            resultItem.appendChild(nameSpan);
    
                            // Create the button
                            const actionButton = document.createElement('button');
                            actionButton.title ="Add To Favorites"
                            actionButton.classList.add('list-add');
                            actionButton.innerHTML = '<span class="material-symbols-outlined">favorite</span>';
                            // actionButton.style.display = 'inline-block';
                            actionButton.addEventListener('click', function() {
                                // console.log('Button clicked for ID:', result.anime_id); // debug
                                fetch('/favorite', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({ anime_id: result.anime_id })
                                })
                            });
    
                            resultItem.appendChild(actionButton);    
                            resultsDiv.appendChild(resultItem);
                        });
                    } else {
                        resultsDiv.style.display = 'none';
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
            } else {
                resultsDiv.innerHTML = ''; // Clear results
                resultsDiv.style.display = 'none';
            }
        });
    
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.search-bar')) {
                resultsDiv.style.display = 'none';
            }
        });
    
        searchInput.addEventListener('focus', function() {
            if (resultsDiv.children.length > 0) {
                resultsDiv.style.display = 'block';
            }
        });
    
        resultsDiv.addEventListener('mousedown', function(e) {
            e.stopPropagation();
        });
});   
