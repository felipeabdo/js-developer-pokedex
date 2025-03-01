const pokemonList = document.getElementById("pokemonList");
const loadMoreButton = document.getElementById("loadMoreButton");
const favoritesButton = document.querySelector(".head-title h3");

const limit = 12;
let offset = 0;
let isShowingFavorites = false;
let allPokemonList = [];

function capitalizeFirstLetter(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

// Função para carregar Pokémon da API com base no offset e limite
function loadPokemonItens(offset, limit) {
  document.body.style.overflow = "hidden";

  pokeApi.getPokemons(offset, limit).then((pokemons = []) => {
    allPokemonList = allPokemonList.concat(pokemons);
    displayFilteredPokemon(allPokemonList);
  });
}

// Função para buscar Pokémon por geração
function loadPokemonByGeneration(generation) {
  const generationRanges = {
    1: { start: 1, end: 151 },
    2: { start: 152, end: 251 },
    3: { start: 252, end: 386 },
    4: { start: 387, end: 493 },
    5: { start: 494, end: 649 },
    6: { start: 650, end: 721 },
    7: { start: 722, end: 809 },
    8: { start: 810, end: 898 }
  };

  const range = generationRanges[generation];
  if (!range) return;

  // Limpa a lista atual e carrega os Pokémon da geração selecionada
  allPokemonList = [];
  offset = 0;
  loadPokemonItens(range.start - 1, range.end - range.start + 1);
}

// Função para buscar Pokémon por tipo (concatenando os tipos)
function loadPokemonByType(type1, type2) {
  // Limpa a lista atual e faz uma requisição à API para buscar Pokémon dos tipos selecionados
  allPokemonList = [];
  offset = 0;

  if (type1 && type2) {
    // Se dois tipos forem selecionados, busca Pokémon que possuem ambos os tipos
    Promise.all([pokeApi.getPokemonsByType(type1), pokeApi.getPokemonsByType(type2)])
      .then(([pokemonsType1, pokemonsType2]) => {
        // Filtra os Pokémon que estão presentes nas duas listas
        const filteredPokemons = pokemonsType1.filter(pokemon1 =>
          pokemonsType2.some(pokemon2 => pokemon2.number === pokemon1.number)
        );
        allPokemonList = filteredPokemons;
        displayFilteredPokemon(allPokemonList);
      })
      .catch((error) => {
        console.error(error);
        displayFilteredPokemon([]); // Exibe "Nenhum Pokémon encontrado" em caso de erro
      });
  } else if (type1) {
    // Se apenas o primeiro tipo for selecionado
    pokeApi.getPokemonsByType(type1)
      .then((pokemons = []) => {
        allPokemonList = pokemons;
        displayFilteredPokemon(allPokemonList);
      })
      .catch((error) => {
        console.error(error);
        displayFilteredPokemon([]); // Exibe "Nenhum Pokémon encontrado" em caso de erro
      });
  } else if (type2) {
    // Se apenas o segundo tipo for selecionado
    pokeApi.getPokemonsByType(type2)
      .then((pokemons = []) => {
        allPokemonList = pokemons;
        displayFilteredPokemon(allPokemonList);
      })
      .catch((error) => {
        console.error(error);
        displayFilteredPokemon([]); // Exibe "Nenhum Pokémon encontrado" em caso de erro
      });
  } else {
    // Se nenhum tipo for selecionado, volta a carregar os 12 primeiros Pokémon
    loadPokemonItens(offset, limit);
  }
}

// Função para buscar Pokémon por número ou nome na API
function searchPokemonByNumberOrName(query) {
  // Verifica se a query é um número (ID) ou um nome
  const isNumber = !isNaN(query);

  if (isNumber) {
    // Busca por número (ID)
    pokeApi.getPokemonDetailById(query)
      .then((pokemon) => {
        if (pokemon) {
          displayFilteredPokemon([pokemon]); // Exibe o Pokémon encontrado
        } else {
          displayFilteredPokemon([]); // Exibe "Nenhum Pokémon encontrado"
        }
      })
      .catch((error) => {
        console.error(error);
        displayFilteredPokemon([]); // Exibe "Nenhum Pokémon encontrado" em caso de erro
      });
  } else {
    // Busca por nome
    pokeApi.getPokemonByName(query)
      .then((pokemon) => {
        if (pokemon) {
          displayFilteredPokemon([pokemon]); // Exibe o Pokémon encontrado
        } else {
          displayFilteredPokemon([]); // Exibe "Nenhum Pokémon encontrado"
        }
      })
      .catch((error) => {
        console.error(error);
        displayFilteredPokemon([]); // Exibe "Nenhum Pokémon encontrado" em caso de erro
      });
  }
}

// Função para exibir os Pokémon filtrados
function displayFilteredPokemon(filteredList) {
  const pokemonListElement = document.getElementById('pokemonList');
  pokemonListElement.innerHTML = '';

  if (filteredList.length === 0) {
    pokemonListElement.innerHTML = '<p class="centralizado">Nenhum Pokémon encontrado.</p>';
    return;
  }

  const newHTML = filteredList
    .map(
      (pokemon) => `
      <li class="pokemon ${pokemon.type}" id="modal-button-${pokemon.number}">
        <img src="/assets/img/pokeball1.svg" class="pokemon-ball" alt="" />
        <span class="number">#${pokemon.number.toString().padStart(3, '0')}</span>
        <span class="name">${capitalizeFirstLetter(pokemon.name)}</span>
        <div class="detail">
          <ol class="types">
            ${pokemon.types.map((type) => `<li class="type ${type}">${type}</li>`).join('')}
          </ol>
          <img src="${pokemon.photo}" alt="${pokemon.name}" />
        </div>
      </li>
    `
    )
    .join('');

  pokemonListElement.innerHTML = newHTML;

  const newCards = pokemonListElement.querySelectorAll('.pokemon:not(.visible)');
  newCards.forEach((card, index) => {
    setTimeout(() => {
      card.classList.add('visible');
    }, index * 100);
  });
}

// Função para resetar os filtros (exceto o que está sendo usado)
function resetFilters(exceptFilter = null) {
  if (exceptFilter !== 'searchByNumber') {
    document.getElementById('searchByNumber').value = '';
  }
  if (exceptFilter !== 'searchByName') {
    document.getElementById('searchByName').value = '';
  }
  if (exceptFilter !== 'generationFilter') {
    document.getElementById('generationFilter').value = '';
  }
  if (exceptFilter !== 'typeFilter1') {
    document.getElementById('typeFilter1').value = '';
  }
  if (exceptFilter !== 'typeFilter2') {
    document.getElementById('typeFilter2').value = '';
  }
}

// Função para capturar o evento de "Enter" nos inputs
function setupInputListeners() {
  const searchByNumberInput = document.getElementById('searchByNumber');
  const searchByNameInput = document.getElementById('searchByName');

  // Adiciona o listener para o input de número
  searchByNumberInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      const query = searchByNumberInput.value.trim();
      if (query) {
        resetFilters('searchByNumber');
        searchPokemonByNumberOrName(query);
      }
    }
  });

  // Adiciona o listener para o input de nome
  searchByNameInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      const query = searchByNameInput.value.trim();
      if (query) {
        resetFilters('searchByName');
        searchPokemonByNumberOrName(query);
      }
    }
  });
}

// Event listeners para os filtros
document.getElementById('generationFilter').addEventListener('change', () => {
  resetFilters('generationFilter');
  const generationFilter = document.getElementById('generationFilter').value;
  if (generationFilter) {
    loadPokemonByGeneration(generationFilter);
  } else {
    // Se nenhuma geração for selecionada, volta a carregar os 12 primeiros Pokémon
    allPokemonList = [];
    offset = 0;
    loadPokemonItens(offset, limit);
  }
  checkFilters();
});

document.getElementById('typeFilter1').addEventListener('change', () => {
  // Reseta apenas os inputs de número e nome e o dropdown de geração
  document.getElementById('searchByNumber').value = '';
  document.getElementById('searchByName').value = '';
  document.getElementById('generationFilter').value = '';

  const typeFilter1 = document.getElementById('typeFilter1').value;
  const typeFilter2 = document.getElementById('typeFilter2').value;

  if (typeFilter1 || typeFilter2) {
    loadPokemonByType(typeFilter1, typeFilter2);
  } else {
    // Se nenhum tipo for selecionado, volta a carregar os 12 primeiros Pokémon
    allPokemonList = [];
    offset = 0;
    loadPokemonItens(offset, limit);
  }
  checkFilters();
});

document.getElementById('typeFilter2').addEventListener('change', () => {
  // Reseta apenas os inputs de número e nome e o dropdown de geração
  document.getElementById('searchByNumber').value = '';
  document.getElementById('searchByName').value = '';
  document.getElementById('generationFilter').value = '';

  const typeFilter1 = document.getElementById('typeFilter1').value;
  const typeFilter2 = document.getElementById('typeFilter2').value;

  if (typeFilter1 || typeFilter2) {
    loadPokemonByType(typeFilter1, typeFilter2);
  } else {
    // Se nenhum tipo for selecionado, volta a carregar os 12 primeiros Pokémon
    allPokemonList = [];
    offset = 0;
    loadPokemonItens(offset, limit);
  }
  checkFilters();
});

document.getElementById('clearFilters').addEventListener('click', () => {
  resetFilters();
  allPokemonList = [];
  offset = 0;
  loadPokemonItens(offset, limit);
  checkFilters();
});

document.getElementById('backToHome').addEventListener('click', () => {
  resetFilters();
  allPokemonList = [];
  offset = 0;
  loadPokemonItens(offset, limit);
  document.getElementById('backToHome').style.display = 'none';
});

function checkFilters() {
  const isFilterActive = document.getElementById('searchByNumber').value ||
                         document.getElementById('searchByName').value ||
                         document.getElementById('generationFilter').value ||
                         document.getElementById('typeFilter1').value ||
                         document.getElementById('typeFilter2').value;

  document.getElementById('backToHome').style.display = isFilterActive ? 'block' : 'none';
}

// Configura os listeners ao carregar a página
setupInputListeners();

// Carrega os primeiros Pokémon ao abrir a página
loadPokemonItens(offset, limit);