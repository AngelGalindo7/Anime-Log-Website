document.addEventListener('DOMContentLoaded', function() {
    const resultsDiv = document.getElementById('search-results');
    const searchInput = document.getElementById('search');
    
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
                        actionButton.title ="Add To Favorites";
                        actionButton.classList.add('list-add');
                        actionButton.innerHTML = '<span class="material-symbols-outlined">favorite</span>';
                        actionButton.addEventListener('click', function() {
                            fetch('/favorite', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ anime_id: result.anime_id })
                            });
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

    // Handle authentication buttons
    const authButtonsContainer = document.getElementById('auth-buttons-container');
    
    fetch('/check-auth', { method: 'GET' }) // New endpoint to check auth status
        .then(response => response.json())
        .then(data => {
            if (data.loggedIn) {
                authButtonsContainer.innerHTML = `
                    <button type="button" id="logout-button">Logout</button>
                    <a href="/profile">
                        <span class="username">${data.username}</span>
                        <img src="/default-avatar.jpg" alt="Profile" class="profile-image">
                    </a>
                `;

                document.getElementById('logout-button').addEventListener('click', function() {
                    fetch('/logout', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                    .then(response => {
                        if (response.ok) {
                            window.location.href = '/'; // Redirect to the main page after logout
                        } else {
                            console.error('Logout failed');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
                });
                
            } else {
                authButtonsContainer.innerHTML = `
                    <a href="/login"><button type="button">Login</button></a>
                    <a href="/create-account"><button type="button">Create Account</button></a>
                `;
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
});
