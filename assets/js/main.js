const pokemonList = document.getElementById("pokemonList");
const loadMoreButton = document.getElementById("loadMoreButton");

const limit = 12;
let offset = 0;

function capitalizeFirstLetter(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function loadPokemonItens(offset, limit) {
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
    const delayBetweenCards = 500 / totalCards; // Atraso entre cada card para totalizar 1 segundo

    // Aplica a transição sequencialmente aos novos cards
    newCards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add("visible"); // Adiciona a classe para exibir o card
      }, index * delayBetweenCards); // Atraso proporcional ao número de cards
    });
  });
}

// Carrega os primeiros cards ao abrir a página
loadPokemonItens(offset, limit);

// Carrega mais cards ao clicar no botão "Load More"
loadMoreButton.addEventListener("click", () => {
  offset += limit;
  loadPokemonItens(offset, limit);
});