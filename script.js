let animeList = [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let currentPage = 1;
let genresList = [];


async function fetchAnimes(page = 1) {
    const response = await fetch(`https://api.jikan.moe/v4/anime?page=${page}`);
    const data = await response.json();
    animeList = [...animeList, ...data.data];
    displayAnimes(data.data);
    extractGenres(data.data); 
}

function displayAnimes(animes) {
    const animeListElement = document.getElementById('anime-list');
    animeListElement.innerHTML = ''; 
    animes.forEach(anime => {
        const animeItem = document.createElement('div');
        animeItem.className = 'anime-item';

        const genres = anime.genres.map(genre => genre.name).join(', ');

        animeItem.innerHTML = `
            <img src="${anime.images.jpg.image_url}" class="anime-image" alt="${anime.title}">
            <div class="anime-genres">${genres}</div>
            <h3>${anime.title}</h3>
            <p>${anime.synopsis ? anime.synopsis.substring(0, 100) + '...' : 'No description available'}</p>
            <span class="favorite" onclick="toggleFavorite('${anime.mal_id}')">${favorites.includes(anime.mal_id) ? '❤️' : '🤍'}</span>
        `;

        animeItem.addEventListener('click', () => showDetails(anime));
        animeListElement.appendChild(animeItem);
    });
}

function showDetails(anime) {
    alert(`Title: ${anime.title}\nScore: ${anime.score}\nEpisodes: ${anime.episodes}\nSynopsis: ${anime.synopsis}`);
}

function toggleFavorite(animeId) {
    const index = favorites.indexOf(animeId);
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(animeId);
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    refreshFavorites();
}

function refreshFavorites() {
    const animeItems = document.querySelectorAll('.anime-item');
    animeItems.forEach(item => {
        const id = item.querySelector('.favorite').getAttribute('onclick').split("'")[1];
        item.querySelector('.favorite').textContent = favorites.includes(id) ? '❤️' : '🤍';
    });
}

function extractGenres(animes) {
    animes.forEach(anime => {
        anime.genres.forEach(genre => {
            if (!genresList.includes(genre.name)) {
                genresList.push(genre.name);
            }
        });
    });

    const genreFilter = document.getElementById('genre-filter');
    genreFilter.innerHTML = '<option value="">Todos os gêneros</option>';
    genresList.forEach(genre => {
        const option = document.createElement('option');
        option.value = genre;
        option.textContent = genre;
        genreFilter.appendChild(option);
    });
}

document.getElementById('genre-filter').addEventListener('change', (e) => {
    const selectedGenre = e.target.value;
    if (selectedGenre === '') {
        displayAnimes(animeList); 
    } else {
        const filteredAnimes = animeList.filter(anime =>
            anime.genres.some(genre => genre.name === selectedGenre)
        );
        displayAnimes(filteredAnimes);
    }
});

document.getElementById('search').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredAnimes = animeList.filter(anime => anime.title.toLowerCase().includes(searchTerm));
    displayAnimes(filteredAnimes);
});

document.getElementById('load-more').addEventListener('click', () => {
    currentPage++;
    fetchAnimes(currentPage);
});


fetchAnimes();
