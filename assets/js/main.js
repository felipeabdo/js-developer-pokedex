const pokemonList = document.getElementById("pokemonList");
const loadMoreButton = document.getElementById("loadMoreButton");
const favoritesButton = document.querySelector(".head-title h3");

const limit = 12; // Limite de Pokémons por carregamento
let offset = 0; // Offset inicial
let isShowingFavorites = false; // Estado para controlar a tela de favoritos

function capitalizeFirstLetter(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function loadPokemonItens(offset, limit) {
  // Oculta a barra de rolagem durante o carregamento
  pokemonList.style.overflow = "hidden";

  pokeApi.getPokemons(offset, limit).then((pokemons = []) => {
    const newHTML = pokemons.map((pokemon, index) => `
      <button class="modal-button" id="modal-button-${pokemon.number}">
        <li class="pokemon ${pokemon.type}">
          <img src="/assets/img/pokeball1.svg" class="pokemon-ball" alt="" />
          <span class="number">#${pokemon.number.toString().padStart(3, '0')}</span>
          <span class="name">${capitalizeFirstLetter(pokemon.name)}</span>
          <div class="detail">
            <ol class="types">
              ${pokemon.types
                .map((type) => `<li class="type ${type}">${type}</li>`)
                .join("")}
            </ol>
            <img
            src="${pokemon.photo}"
            alt="${pokemon.name}"
            />
          </div>
        </li>
      </button>
    `).join("");

    // Adiciona os novos cards ao DOM
    pokemonList.innerHTML += newHTML;

    // Seleciona todos os novos cards que ainda não têm a classe .visible
    const newCards = pokemonList.querySelectorAll(".pokemon:not(.visible)");

    // Calcula o atraso entre cada card para totalizar 1 segundo
    const totalCards = newCards.length;
    const delayBetweenCards = 1000 / totalCards; // Atraso entre cada card para totalizar 1 segundo

    // Aplica a transição sequencialmente aos novos cards
    newCards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add("visible"); // Adiciona a classe para exibir o card

        // Restaura a barra de rolagem após a última transição
        if (index === newCards.length - 1) {
          pokemonList.style.overflow = "auto"; // Restaura a barra de rolagem
        }
      }, index * delayBetweenCards); // Atraso proporcional ao número de cards
    });
  });
}

// Função para carregar Pokémon favoritados
function loadFavorites(offset = 0, limit = 12) {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  if (favorites.length === 0) {
    pokemonList.innerHTML = "<p>Nenhum Pokémon favoritado.</p>";
    loadMoreButton.style.display = "none"; // Oculta o botão "Load More"
    return;
  }

  // Verifica se há mais Pokémons favoritados além do limite
  if (favorites.length <= offset + limit) {
    loadMoreButton.style.display = "none"; // Oculta o botão "Load More"
  } else {
    loadMoreButton.style.display = "block"; // Exibe o botão "Load More"
  }

  // Busca os detalhes dos Pokémon favoritados
  const pokemonsToLoad = favorites.slice(offset, offset + limit); // Carrega apenas os Pokémons dentro do limite
  Promise.all(pokemonsToLoad.map(id => pokeApi.getPokemonDetailById(id)))
    .then(pokemons => {
      const newHTML = pokemons.map(pokemon => `
        <button class="modal-button" id="modal-button-${pokemon.number}">
          <li class="pokemon ${pokemon.type}">
            <img src="/assets/img/pokeball1.svg" class="pokemon-ball" alt="" />
            <span class="number">#${pokemon.number.toString().padStart(3, '0')}</span>
            <span class="name">${capitalizeFirstLetter(pokemon.name)}</span>
            <div class="detail">
              <ol class="types">
                ${pokemon.types
                  .map((type) => `<li class="type ${type}">${type}</li>`)
                  .join("")}
              </ol>
              <img
              src="${pokemon.photo}"
              alt="${pokemon.name}"
              />
            </div>
          </li>
        </button>
      `).join("");

      // Se for o primeiro carregamento, substitui o conteúdo da lista
      if (offset === 0) {
        pokemonList.innerHTML = newHTML;
      } else {
        // Caso contrário, adiciona os novos Pokémons à lista existente
        pokemonList.innerHTML += newHTML;
      }

      // Aplica a transição sequencialmente aos cards favoritados
      const favoriteCards = pokemonList.querySelectorAll(".pokemon");
      favoriteCards.forEach((card, index) => {
        setTimeout(() => {
          card.classList.add("visible"); // Adiciona a classe para exibir o card
        }, index * 100); // Atraso de 100ms entre cada card
      });
    });
}

// Alterna entre a lista de todos os Pokémon e a lista de favoritos
favoritesButton.addEventListener("click", () => {
  if (isShowingFavorites) {
    // Volta para a lista de todos os Pokémon
    favoritesButton.textContent = "Favoritos ❤️";
    pokemonList.innerHTML = ""; // Limpa a lista antes de carregar os Pokémons
    offset = 0; // Reseta o offset para 0 ao voltar para a tela principal
    loadPokemonItens(offset, limit);
    loadMoreButton.style.display = "block"; // Exibe o botão "Load More"
  } else {
    // Mostra a lista de favoritos
    favoritesButton.textContent = "Voltar";
    pokemonList.innerHTML = ""; // Limpa a lista antes de carregar os favoritos
    offset = 0; // Reseta o offset para 0 ao entrar na tela de favoritos
    loadFavorites(offset, limit); // Carrega os primeiros Pokémons favoritados
  }
  isShowingFavorites = !isShowingFavorites;
});

// Carrega os primeiros cards ao abrir a página
loadPokemonItens(offset, limit);

// Carrega mais cards ao clicar no botão "Load More"
loadMoreButton.addEventListener("click", () => {
  if (isShowingFavorites) {
    // Na tela de favoritos, carrega mais Pokémons favoritados
    offset += limit;
    loadFavorites(offset, limit);
  } else {
    // Na tela principal, carrega mais Pokémons da lista completa
    offset += limit;
    loadPokemonItens(offset, limit);
  }
});