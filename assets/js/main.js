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
    // Busca por nome (case-insensitive e parcial)
    const filteredList = allPokemonList.filter(pokemon =>
      pokemon.name.toLowerCase().includes(query.toLowerCase())
    );
    if (filteredList.length > 0) {
      displayFilteredPokemon(filteredList);
    } else {
      displayFilteredPokemon([]); // Exibe "Nenhum Pokémon encontrado"
    }
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

// Função para carregar Pokémon favoritados
function loadFavorites(offset = 0, limit = 12) {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  if (favorites.length === 0) {
    pokemonList.innerHTML = "<p class='centralizado'>Nenhum Pokémon favoritado.</p>";
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
  Promise.all(
    pokemonsToLoad.map((id) => pokeApi.getPokemonDetailById(id))
  ).then((pokemons) => {
    const newHTML = pokemons
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
  // Oculta a barra de rolagem da página durante a transição
  document.body.style.overflow = "hidden";

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
    loadMoreButton.style.display = "none"; // Oculta o botão "Load More"
  }


  // Restaura a barra de rolagem após a transição
  setTimeout(() => {
    document.body.style.overflow = "auto"; // Restaura a barra de rolagem da página
  }, 100); // Pequeno atraso para garantir que a transição esteja completa

  isShowingFavorites = !isShowingFavorites;
});

// Carrega mais cards ao clicar no botão "Load More"
loadMoreButton.addEventListener("click", () => {
  // Oculta a barra de rolagem da página durante o carregamento
  document.body.style.overflow = "hidden";

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

  // Exibe ou oculta o botão "Voltar à Tela Inicial"
  document.getElementById('backToHome').style.display = isFilterActive ? 'block' : 'none';

  // Oculta o botão "Load More" se algum filtro estiver ativo
  if (isFilterActive) {
    loadMoreButton.style.display = 'none';
  } else {
    // Exibe o botão "Load More" na lista principal ou de favoritos
    loadMoreButton.style.display = isShowingFavorites ? 'none' : 'block';
  }
}

// Configura os listeners ao carregar a página
setupInputListeners();

// Carrega os primeiros Pokémon ao abrir a página
loadPokemonItens(offset, limit);