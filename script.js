// Variáveis globais
let listaAnimes = [];  // Lista de animes
let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];  // Recupera animes favoritados do armazenamento local
let paginaAtual = 1;  // Página atual para carregar mais animes
let listaGeneros = [];  // Lista de gêneros para o filtro

// Função para buscar animes da API
async function buscarAnimes(pagina = 1) {
    try {
        const resposta = await fetch(`https://api.jikan.moe/v4/anime?page=${pagina}`);
        const dados = await resposta.json();
        listaAnimes = [...listaAnimes, ...dados.data];
        exibirAnimes(dados.data);
        extrairGeneros(dados.data);
    } catch (erro) {
        console.log("Erro ao buscar animes:", erro);
    }
}

// Função para exibir animes na tela
function exibirAnimes(animes) {
    const elementoListaAnimes = document.getElementById('anime-list');
    elementoListaAnimes.innerHTML = '';  // Limpar o container para exibir animes filtrados

    animes.forEach(anime => {
        const itemAnime = document.createElement('div');
        itemAnime.className = 'anime-item';

        const generos = anime.genres.map(genero => genero.name).join(', ');

        itemAnime.innerHTML = `
            <img src="${anime.images.jpg.image_url}" class="anime-image" alt="${anime.title}">
            <div class="anime-genres">${generos}</div>
            <h3>${anime.title}</h3>
            <p>${anime.synopsis ? anime.synopsis.substring(0, 100) + '...' : 'Sem descrição disponível'}</p>
            <span class="favorite" onclick="alternarFavorito('${anime.mal_id}')">${favoritos.includes(anime.mal_id) ? '❤️' : '🤍'}</span>
        `;

        // Adiciona evento de clique para exibir detalhes do anime
        itemAnime.addEventListener('click', () => mostrarDetalhes(anime));
        elementoListaAnimes.appendChild(itemAnime);
    });
}

// Função para exibir detalhes do anime ao clicar
function mostrarDetalhes(anime) {
    alert(`Título: ${anime.title}\nPontuação: ${anime.score}\nEpisódios: ${anime.episodes}\nSinopse: ${anime.synopsis}`);
}

// Função para adicionar ou remover favoritos
function alternarFavorito(animeId) {
    const indice = favoritos.indexOf(animeId);
    if (indice > -1) {
        favoritos.splice(indice, 1);  // Remove dos favoritos
    } else {
        favoritos.push(animeId);  // Adiciona aos favoritos
    }
    localStorage.setItem('favoritos', JSON.stringify(favoritos));
    atualizarFavoritos();
}

// Função para atualizar favoritos na interface
function atualizarFavoritos() {
    const itensAnime = document.querySelectorAll('.anime-item');
    itensAnime.forEach(item => {
        const id = item.querySelector('.favorite').getAttribute('onclick').split("'")[1];
        item.querySelector('.favorite').textContent = favoritos.includes(Number(id)) ? '❤️' : '🤍';
    });
}

// Função para extrair e exibir gêneros no filtro
function extrairGeneros(animes) {
    animes.forEach(anime => {
        anime.genres.forEach(genero => {
            if (!listaGeneros.includes(genero.name)) {
                listaGeneros.push(genero.name);
            }
        });
    });

    const filtroGeneros = document.getElementById('genre-filter');
    filtroGeneros.innerHTML = '<option value="">Todos os Gêneros</option>';
    listaGeneros.forEach(genero => {
        const opcao = document.createElement('option');
        opcao.value = genero;
        opcao.textContent = genero;
        filtroGeneros.appendChild(opcao);
    });
}

// Função para exibir apenas animes favoritados
function exibirFavoritos() {
    const animesFavoritos = listaAnimes.filter(anime => favoritos.includes(anime.mal_id));
    exibirAnimes(animesFavoritos);
}

// Filtros e eventos
document.getElementById('genre-filter').addEventListener('change', (e) => {
    const generoSelecionado = e.target.value;
    if (generoSelecionado === '') {
        exibirAnimes(listaAnimes);  // Exibe todos os animes
    } else {
        const animesFiltrados = listaAnimes.filter(anime =>
            anime.genres.some(genero => genero.name === generoSelecionado)
        );
        exibirAnimes(animesFiltrados);
    }
});

document.getElementById('search').addEventListener('input', (e) => {
    const termoBusca = e.target.value.toLowerCase();
    const animesFiltrados = listaAnimes.filter(anime => anime.title.toLowerCase().includes(termoBusca));
    exibirAnimes(animesFiltrados);
});

document.getElementById('load-more').addEventListener('click', () => {
    paginaAtual++;
    buscarAnimes(paginaAtual);
});

document.getElementById('show-favorites').addEventListener('click', exibirFavoritos);

// Carregar os animes iniciais
buscarAnimes();
