document.addEventListener('DOMContentLoaded', function() {
    const favoriteButton = document.getElementById('favorite-button');

    if (favoriteButton) {
        // Fetch favorite status and initialize the button
        fetchFavoriteStatus();

        // Add click event listener to the favorite button
        favoriteButton.addEventListener('click', handleFavoriteButtonClick);
    }

    // Function to fetch and set favorite status on page load
    function fetchFavoriteStatus() {
        fetch('/get-favorites', { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                const favoriteAnimeIds = new Set(data.favoriteAnimeIds);
                const animeId = favoriteButton.getAttribute('data-anime-id');
                const isFavorited = favoriteAnimeIds.has(Number(animeId));
                updateFavoriteButton(isFavorited);
            })
            .catch(error => {
                console.error('Error fetching favorite status:', error);
            });
    }

    // Function to handle the favorite button click event
    function handleFavoriteButtonClick() {
        const animeId = favoriteButton.getAttribute('data-anime-id');
        const isFavorited = favoriteButton.classList.contains('favorited');

        fetch('/favorite', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ anime_id: animeId })
        })
        .then(response => response.json())
        .then(data => {
            if (data.action === 'favorited') {
                updateFavoriteButton(true);
            } else if (data.action === 'unfavorited') {
                updateFavoriteButton(false);
            }
        })
        .catch(error => {
            console.error('Error toggling favorite status:', error);
        });
    }

    // Function to update the favorite button's appearance
    function updateFavoriteButton(isFavorited) {
        const icon = favoriteButton.querySelector('.material-symbols-outlined');
        if (isFavorited) {
            icon.style.color = 'red';
            favoriteButton.classList.add('favorited');
        } else {
            icon.style.color = 'black';
            favoriteButton.classList.remove('favorited');
        }
    }
});
