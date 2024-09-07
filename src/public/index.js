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
                        const resultItem = document.createElement('div');
                        resultItem.className = 'result-item';
                        
                        const nameSpan = document.createElement('span');
                        nameSpan.textContent = result.name;
                        nameSpan.style.cursor = 'pointer'; // Change cursor to pointer for clickable effect

                        // Event listener to redirect to the anime page
                        resultItem.addEventListener('click', function() {
                            window.location.href = `/go-to-anime/${result.anime_id}`; // Redirect to dynamic route
                        });

                        resultItem.appendChild(nameSpan)
                        

                        const actionButton = document.createElement('button');
                        actionButton.title = result.isFavorited ? "Remove from Favorites" : "Add to Favorites";
                        actionButton.classList.add('list-add');
                        actionButton.innerHTML = `<span class="material-symbols-outlined" style="color: ${result.isFavorited ? 'red' : 'white'};">favorite</span>`;
                        actionButton.addEventListener('click', function() {
                            fetch('/favorite', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ anime_id: result.anime_id })
                            })
                            .then(response => response.json())
                            .then(data => {
                                if (data.action === 'favorited') {
                                    actionButton.innerHTML = '<span class="material-symbols-outlined" style="color: red;">favorite</span>';
                                } else if (data.action === 'unfavorited') {
                                    actionButton.innerHTML = '<span class="material-symbols-outlined" style="color: white;">favorite</span>';
                                }
                            });
                        });
                        
                        resultItem.appendChild(actionButton);    
                        resultsDiv.appendChild(resultItem);
                    });
                } else {
                    resultsDiv.style.display = 'none';
                }
            });
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
                    <span class="username">${data.username}</span>
                    <div class="profile-container">
                        <img src="/new_default.svg.png" alt="Profile" class="profile-image" id="profileImage">
                        <div class="dropdown-menu" id="dropdownMenu">
                            <a href="/profile"><button id="profileButton">Profile</button></a>
                            <button id="logoutButton">Logout</button>
                        </div>
                    </div>
                `;

                const profileImage = document.getElementById('profileImage');
                const dropdownMenu = document.getElementById('dropdownMenu');

                profileImage.addEventListener('click', function() {
                    dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
                });

                document.addEventListener('click', function(event) {
                    if (!event.target.closest('.profile-container')) {
                        dropdownMenu.style.display = 'none';
                    }
                });

                document.getElementById('logoutButton').addEventListener('click', function() {
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

document.addEventListener("DOMContentLoaded", function() {
    const prevButton = document.querySelector(".carousel-button.prev");
    const nextButton = document.querySelector(".carousel-button.next");
    const carouselImages = document.querySelector(".carousel-images");
    const totalImages = carouselImages.children.length;
    const imagesPerSlide = 5; // Number of images to show per slide
    const imageWidth = 240; // Updated image width
    const margin = 20; // Space between images
    const slideWidth = (imageWidth + margin) * imagesPerSlide; // Adjusted slide width
    let currentIndex = 0;

    function updateCarousel() {
        carouselImages.style.transform = `translateX(${-currentIndex * slideWidth}px)`;
    }

    prevButton.addEventListener("click", function() {
        if (currentIndex > 0) {
            currentIndex--;
        } else {
            currentIndex = Math.ceil(totalImages / imagesPerSlide) - 1; // Move to the last slide
        }
        updateCarousel();
    });
    
    nextButton.addEventListener("click", function() {
        if (currentIndex < Math.ceil(totalImages / imagesPerSlide) - 1) {
            currentIndex++;
        } else {
            currentIndex = 0; // Move to the first slide
        }
        updateCarousel();
    });

    const imageContainers = document.querySelectorAll(".image-container");
    imageContainers.forEach(container => {
        const image = container.querySelector("img");
        image.style.cursor = 'pointer';
        const animeId = container.querySelector(".favorite-button").getAttribute("data-anime-id");
        
        image.addEventListener("click", function() {
            if (animeId) {
                window.location.href = `/go-to-anime/${animeId}`;
            } else {
                console.error("Anime ID not found");
            }
        });
    });

});

document.addEventListener('DOMContentLoaded', function() {
    const favoriteButtons = document.querySelectorAll('.favorite-button');

    // Fetch favorite status for carousel
    fetch('/get-favorites', { method: 'GET' })
        .then(response => response.json())
        .then(data => {
            const favoriteAnimeIds = new Set(data.favoriteAnimeIds);

            // Update favorite buttons in the carousel based on fetched data
            favoriteButtons.forEach(button => {
                const animeId = button.getAttribute('data-anime-id');
                const icon = button.querySelector('span');
                if (favoriteAnimeIds.has(Number(animeId))) {
                    icon.style.color = 'red';
                } else {
                    icon.style.color = 'black';
                }
            });

            // Add event listeners to favorite buttons
            favoriteButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const animeId = button.getAttribute('data-anime-id');

                    const icon = button.querySelector('span');
                    const isFavorited = icon.style.color === 'red';

                    fetch('/favorite', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ anime_id: animeId })
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.action === 'favorited') {
                            icon.style.color = 'red';
                        } else if (data.action === 'unfavorited') {
                            icon.style.color = 'black';
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
                });
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });

});



document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login');
    const errorMessageDiv = document.getElementById('error-message');

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const formData = new FormData(loginForm);
        const formDataObj = Object.fromEntries(formData.entries());

        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formDataObj)
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                errorMessageDiv.textContent = data.error;
            } else if (data.redirect) {
                window.location.href = data.redirect;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            errorMessageDiv.textContent = 'An unexpected error occurred.';
        });
    });
});
