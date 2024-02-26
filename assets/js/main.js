const pokemonList = document.getElementById("pokemonList");

const loadMoreButton = document.getElementById("loadMoreButton");

const limit = 12;
let offset = 0;

function capitalizeFirstLetter(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function loadPokemonItens(offset, limit) {

  pokeApi.getPokemons(offset, limit).then((pokemons = []) => {

    const newHTML = pokemons.map((pokemon) => `
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
    </button>`).join("");

    pokemonList.innerHTML += newHTML;

  });
}

loadPokemonItens(offset, limit);

loadMoreButton.addEventListener('click', () => { // Espera uma ação pra fazer algo (click);
  offset += limit;
  loadPokemonItens(offset, limit);
})
