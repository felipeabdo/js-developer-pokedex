const pokemonList = document.getElementById("pokemonList");
const loadMoreButton = document.getElementById("loadMoreButton");
const limit = 6;
let offset = 0;

// function convertPokemonToLi(pokemon) {
//   console.log(pokemon);
//   return `
//     <li class="pokemon ${pokemon.type}">

//       <span class="number">#${pokemon.number}</span>
//       <span class="name">${pokemon.name}</span>

//       <div class="detail">

//         <ol class="types">
//           ${pokemon.types
//             .map((type) => `<li class="type ${type}">${type}</li>`)
//             .join("")}
//         </ol>

//         <img
//         src="${pokemon.photo}"
//         alt="${pokemon.name}"
//         />
//       </div>

//     </li>
//   `;
// }

function loadPokemonItens(offset, limit) {
  pokeApi.getPokemons(offset, limit).then((pokemons = []) => {
    const newHTML = pokemons.map((pokemon) => `
    <li class="pokemon ${pokemon.type}">

      <img src="/assets/img/pokeball1.svg" class="pokemon-ball" alt="" />

      <span class="number">#${pokemon.number.toString().padStart(3, '0')}</span>

      <span class="name">${pokemon.name}</span>

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

    </li>`).join("");

    pokemonList.innerHTML += newHTML;
  });
}

loadPokemonItens(offset, limit);

loadMoreButton.addEventListener('click', () => {
  offset += limit;
  loadPokemonItens(offset, limit);
})
