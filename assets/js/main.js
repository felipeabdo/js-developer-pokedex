/* Se aparecer document.algo sempre estamos trabalhando com o DOM
e estamos escolhendo algo no HTML pra manipular. */

// Estamos pegando a lista ordenada de pokemons pra manipular.

const pokemonList = document.getElementById("pokemonList");

// Estamos pegando um botão pra manipular

const loadMoreButton = document.getElementById("loadMoreButton");

/* Estamos criando variáveis para manipular os parâmetros de consulta da solicitação feita pro endpoint da API do pokedéx */

const limit = 6;
let offset = 0;

/* A título de aprendizado: a url que usaremos sobre as variáveis acima: https://pokeapi.co/api/v2/pokemon/?offset=0&limit=0
podemos destrinchar dizendo que:

api/v2/pokemon é o endpoint

?offset=0&limit=0 são os parâmetros de consulta */

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

// Essa função transforma a primeira letra de qualquer palavra em maiúscula

function capitalizeFirstLetter(word) { // Função para transformar a primeira letra de uma palavra em maiúscula.
  return word.charAt(0).toUpperCase() + word.slice(1); // charAt(0): escolhe a a letra da posição colocada no argumento. Pense na palavra como um array de letras. toUpperCase(): transforma toda a palavra em maiúscula. + word.slice(1): o + concatena a letra transformada em maiúscula anteriormente com o resto da palavra obtido com o metodo slice(1) que retira a letra da posição escolhida na palavra.
}

function loadPokemonItens(offset, limit) { 
  pokeApi.getPokemons(offset, limit).then((pokemons = []) => {
    const newHTML = pokemons.map((pokemon) => `
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

    </li>`).join("");

    pokemonList.innerHTML += newHTML;
  });
}

loadPokemonItens(offset, limit);

loadMoreButton.addEventListener('click', () => {
  offset += limit;
  loadPokemonItens(offset, limit);
})
