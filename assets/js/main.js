const pokemonList = document.getElementById("pokemonList");
const loadMoreButton = document.getElementById("loadMoreButton");
const favoritesButton = document.querySelector(".head-title h3");

const SEARCH_BY_NUMBER = "searchByNumber";
const SEARCH_BY_NAME = "searchByName";
const GENERATION_FILTER = "generationFilter";
const TYPE_FILTER_1 = "typeFilter1";
const TYPE_FILTER_2 = "typeFilter2";

const limit = 12;
let offset = 0;
let isShowingFavorites = false;
let allPokemonList = [];
let favoritesList = [];
const pokemonCache = {}; // Objeto para armazenar Pokémon já buscados
let allPokemonNames = []; // Lista de todos os nomes de Pokémon

// IDs de Pokémon que recebem estilos especiais
const SPECIAL_POKEMON_IDS = [
  924, 925, 529, 551, 602, 618, 437, 486, 263, 264, 276, 277, 287, 290, 329,
  333, 334, 375, 376, 380, 381, 167, 169, 170, 171, 211, 220, 232, 22, 41, 42,
  49, 50, 53, 74, 75, 81, 89, 132, 980
];

// Função para capitalizar a primeira letra de uma palavra
function capitalizeFirstLetter(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

// Função para carregar todos os nomes de Pokémon
function loadAllPokemonNames() {
  const url = "https://pokeapi.co/api/v2/pokemon?limit=1000";
  return fetch(url)
    .then((response) => response.json())
    .then((jsonBody) => jsonBody.results.map((pokemon) => pokemon.name))
    .catch((error) => {
      console.error("Erro ao carregar nomes de Pokémon:", error);
      return [];
    });
}

// Função para carregar Pokémon da API com base no offset e limite
function loadPokemonItens(offset, limit, shouldReplaceList = true) {
  document.body.style.overflow = "hidden";

  pokeApi.getPokemons(offset, limit).then((pokemons = []) => {
    if (shouldReplaceList) {
      allPokemonList = pokemons; // Substitui a lista completa
    } else {
      allPokemonList = allPokemonList.concat(pokemons); // Adiciona à lista existente
    }
    displayFilteredPokemon(allPokemonList, shouldReplaceList);
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
    8: { start: 810, end: 898 },
    9: { start: 899, end: 10279 },
  };

  const range = generationRanges[generation];
  if (!range) return;

  if (isShowingFavorites) {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    Promise.all(favorites.map((id) => pokeApi.getPokemonDetailById(id)))
      .then((pokemons) => {
        const filteredList = pokemons.filter(
          (pokemon) =>
            pokemon.number >= range.start && pokemon.number <= range.end
        );
        displayFilteredPokemon(filteredList);
        loadMoreButton.style.display = "none"; // Oculta o botão "Load More"
      })
      .catch((error) => {
        console.error(error);
        displayFilteredPokemon([]);
      });
  } else {
    allPokemonList = [];
    offset = 0;
    loadPokemonItens(range.start - 1, range.end - range.start + 1);
  }
}

// Função para buscar Pokémon por tipo
function loadPokemonByType(type1, type2) {
  if (isShowingFavorites) {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    Promise.all(favorites.map((id) => pokeApi.getPokemonDetailById(id)))
      .then((pokemons) => {
        const filteredList = pokemons.filter((pokemon) => {
          const types = pokemon.types.map((type) => type.toLowerCase());
          return (
            (!type1 || types.includes(type1.toLowerCase())) &&
            (!type2 || types.includes(type2.toLowerCase()))
          );
        });
        displayFilteredPokemon(filteredList);
        loadMoreButton.style.display = "none"; // Oculta o botão "Load More"
      })
      .catch((error) => {
        console.error(error);
        displayFilteredPokemon([]);
      });
  } else {
    allPokemonList = [];
    offset = 0;

    if (type1 && type2) {
      // Se dois tipos forem selecionados, busca Pokémon que possuem ambos os tipos
      Promise.all([
        pokeApi.getPokemonsByType(type1),
        pokeApi.getPokemonsByType(type2),
      ])
        .then(([pokemonsType1, pokemonsType2]) => {
          const filteredPokemons = pokemonsType1.filter((pokemon1) =>
            pokemonsType2.some((pokemon2) => pokemon2.number === pokemon1.number)
          );
          allPokemonList = filteredPokemons;
          displayFilteredPokemon(allPokemonList);
        })
        .catch((error) => {
          console.error(error);
          displayFilteredPokemon([]);
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
          displayFilteredPokemon([]);
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
          displayFilteredPokemon([]);
        });
    } else {
      // Se nenhum tipo for selecionado, volta a carregar os 12 primeiros Pokémon
      loadPokemonItens(offset, limit);
    }
  }
}

// Função para buscar Pokémon por número ou nome
function searchPokemonByNumberOrName(query) {
  const isNumber = !isNaN(query);

  if (isNumber) {
    if (isShowingFavorites) {
      const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
      const pokemonID = parseInt(query);

      if (favorites.includes(pokemonID)) {
        pokeApi.getPokemonDetailById(pokemonID)
          .then((pokemon) => {
            if (pokemon) {
              displayFilteredPokemon([pokemon]);
            } else {
              displayFilteredPokemon([]);
            }
          })
          .catch((error) => {
            console.error(error);
            displayFilteredPokemon([]);
          });
      } else {
        displayFilteredPokemon([]); // Pokémon não encontrado nos favoritos
      }
    } else {
      pokeApi.getPokemonDetailById(query)
        .then((pokemon) => {
          if (pokemon) {
            pokemonCache[query] = pokemon; // Armazena no cache
            displayFilteredPokemon([pokemon]);
          } else {
            displayFilteredPokemon([]);
          }
        })
        .catch((error) => {
          console.error(error);
          displayFilteredPokemon([]);
        });
    }
  } else {
    const normalizedQuery = query.toLowerCase().trim();

    if (isShowingFavorites) {
      const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
      const matchingNames = allPokemonNames.filter((name) =>
        name.toLowerCase().includes(normalizedQuery)
      );

      const matchingFavorites = favorites.filter((id) =>
        matchingNames.includes(allPokemonNames[id - 1])
      );

      if (matchingFavorites.length > 0) {
        Promise.all(matchingFavorites.map((id) => pokeApi.getPokemonDetailById(id)))
          .then((pokemons) => {
            const validPokemons = pokemons.filter((pokemon) => pokemon !== null);
            if (validPokemons.length > 0) {
              displayFilteredPokemon(validPokemons);
            } else {
              displayFilteredPokemon([]);
            }
          })
          .catch((error) => {
            console.error(error);
            displayFilteredPokemon([]);
          });
      } else {
        displayFilteredPokemon([]); // Nenhum Pokémon encontrado
      }
    } else {
      const filteredList = allPokemonList.filter((pokemon) =>
        pokemon.name.toLowerCase().includes(normalizedQuery)
      );
      if (filteredList.length > 0) {
        displayFilteredPokemon(filteredList);
      } else {
        const matchingNames = allPokemonNames.filter((name) =>
          name.toLowerCase().includes(normalizedQuery)
        );

        if (matchingNames.length > 0) {
          Promise.all(matchingNames.map((name) => pokeApi.getPokemonByName(name)))
            .then((pokemons) => {
              const validPokemons = pokemons.filter((pokemon) => pokemon !== null);
              if (validPokemons.length > 0) {
                displayFilteredPokemon(validPokemons);
              } else {
                displayFilteredPokemon([]);
              }
            })
            .catch((error) => {
              console.error(error);
              displayFilteredPokemon([]);
            });
        } else {
          displayFilteredPokemon([]);
        }
      }
    }
  }

  checkFilters();
}

// Função para exibir os Pokémon filtrados
function displayFilteredPokemon(filteredList, shouldReplaceList = true) {
  const pokemonListElement = document.getElementById("pokemonList");

  if (filteredList.length === 0) {
    pokemonListElement.innerHTML = '<p class="centralizado">Nenhum Pokémon encontrado.</p>';
    return;
  }

  if (shouldReplaceList) {
    pokemonListElement.innerHTML = "";
  }

  const fragment = document.createDocumentFragment();

  filteredList.forEach((pokemon, index) => {
    const existingPokemon = shouldReplaceList
      ? null
      : pokemonListElement.querySelector(`#modal-button-${pokemon.number}`);
    if (!existingPokemon) {
      const newPokemon = document.createElement("li");
      newPokemon.classList.add("pokemon", pokemon.type);
      newPokemon.id = `modal-button-${pokemon.number}`;
      newPokemon.innerHTML = `
        <img src="/assets/img/pokeball1.svg" class="pokemon-ball" alt="" />
        <span class="number">#${pokemon.number.toString().padStart(3, "0")}</span>
        <span class="name">${capitalizeFirstLetter(pokemon.name)}</span>
        <div class="detail">
          <ol class="types">
            ${pokemon.types.map((type) => `<li class="type ${type}">${type}</li>`).join("")}
          </ol>
          <img src="${pokemon.photo}" alt="${pokemon.name}" />
        </div>
      `;

      // Verifica se o Pokémon é especial
      if (SPECIAL_POKEMON_IDS.includes(pokemon.number)) {
        const typesList = newPokemon.querySelector(".types");
        if (typesList) {
          typesList.classList.add("types-special");
        }
      }

      fragment.appendChild(newPokemon);

      setTimeout(() => {
        newPokemon.classList.add("visible");
      }, index * 100);
    }
  });

  pokemonListElement.appendChild(fragment);
}

// Função para resetar os filtros
function resetFilters(exceptFilters = []) {
  const filters = {
    [SEARCH_BY_NUMBER]: document.getElementById(SEARCH_BY_NUMBER),
    [SEARCH_BY_NAME]: document.getElementById(SEARCH_BY_NAME),
    [GENERATION_FILTER]: document.getElementById(GENERATION_FILTER),
    [TYPE_FILTER_1]: document.getElementById(TYPE_FILTER_1),
    [TYPE_FILTER_2]: document.getElementById(TYPE_FILTER_2),
  };

  for (const [key, input] of Object.entries(filters)) {
    if (!exceptFilters.includes(key)) {
      input.value = "";
    }
  }
}

// Função para limpar os filtros
function clearFilters() {
  resetFilters();

  if (isShowingFavorites) {
    offset = 0;
    loadFavorites(offset, limit, false, true);
  } else {
    allPokemonList = [];
    offset = 0;
    loadPokemonItens(offset, limit, true);
  }
}

// Função para validar o campo de número
function validateNumberInput(event) {
  const input = event.target;
  const value = input.value.replace(/\D/g, "");
  input.value = value;
}

// Função para validar o campo de nome
function validateNameInput(event) {
  const input = event.target;
  const value = input.value.replace(/[^a-zA-Zà-úÀ-Ú\s'-]/g, "");
  input.value = value;
}

// Função para configurar listeners de input
function setupInputListeners() {
  const searchByNumberInput = document.getElementById(SEARCH_BY_NUMBER);
  const searchByNameInput = document.getElementById(SEARCH_BY_NAME);

  searchByNumberInput.addEventListener("input", validateNumberInput);
  searchByNameInput.addEventListener("input", validateNameInput);

  searchByNumberInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const query = searchByNumberInput.value.trim();
      if (query) {
        resetFilters([SEARCH_BY_NUMBER]);
        searchPokemonByNumberOrName(query);
      }
    }
  });

  searchByNameInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const query = searchByNameInput.value.trim();
      if (query) {
        resetFilters([SEARCH_BY_NAME]);
        searchPokemonByNumberOrName(query);
      }
    }
  });
}

// Função para carregar Pokémon favoritados
function loadFavorites(offset = 0, limit = 12, isFiltering = false, shouldReplaceList = true) {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  if (favorites.length === 0) {
    pokemonList.innerHTML = "<p class='centralizado'>Nenhum Pokémon favoritado.</p>";
    loadMoreButton.style.display = "none";
    return;
  }

  const totalFavorites = favorites.length;
  const hasMoreFavorites = offset + limit < totalFavorites;

  if (!hasMoreFavorites) {
    loadMoreButton.style.display = "none";
  } else {
    loadMoreButton.style.display = isFiltering ? "none" : "block";
  }

  const pokemonsToLoad = favorites.slice(offset, offset + limit);
  Promise.all(pokemonsToLoad.map((id) => pokeApi.getPokemonDetailById(id)))
    .then((newPokemons) => {
      if (shouldReplaceList) {
        favoritesList = newPokemons;
      } else {
        favoritesList = favoritesList.concat(newPokemons);
      }
      displayFilteredPokemon(favoritesList, shouldReplaceList);

      if (favoritesList.length >= totalFavorites) {
        loadMoreButton.style.display = "none";
      }
    });
}

// Alterna entre a lista de todos os Pokémon e a lista de favoritos
favoritesButton.addEventListener("click", () => {
  document.body.style.overflow = "hidden";
  isShowingFavorites = !isShowingFavorites;
  clearFilters();

  if (isShowingFavorites) {
    favoritesButton.textContent = "Voltar";
    pokemonList.innerHTML = "";
    offset = 0;
    loadFavorites(offset, limit);
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    loadMoreButton.style.display = favorites.length > limit ? "block" : "none";
  } else {
    favoritesButton.textContent = "Favoritos ❤️";
    pokemonList.innerHTML = "";
    allPokemonList = [];
    offset = 0;
    loadPokemonItens(offset, limit);
    loadMoreButton.style.display = "block";
  }

  setTimeout(() => {
    document.body.style.overflow = "auto";
  }, 100);
});

// Carrega mais cards ao clicar no botão "Load More"
loadMoreButton.addEventListener("click", () => {
  document.body.style.overflow = "hidden";

  if (isShowingFavorites) {
    offset += limit;
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    if (offset < favorites.length) {
      loadFavorites(offset, limit, false, false);
    } else {
      loadMoreButton.style.display = "none";
    }
  } else {
    offset += limit;
    loadPokemonItens(offset, limit, false);
  }
});

// Event listeners para os filtros
document.getElementById(GENERATION_FILTER).addEventListener("change", () => {
  clearCache();
  resetFilters([GENERATION_FILTER]);
  const generationFilter = document.getElementById(GENERATION_FILTER).value;

  if (isShowingFavorites) {
    if (generationFilter) {
      loadPokemonByGeneration(generationFilter);
    } else {
      offset = 0;
      loadFavorites(offset, limit);
    }
  } else {
    if (generationFilter) {
      loadPokemonByGeneration(generationFilter);
    } else {
      allPokemonList = [];
      offset = 0;
      loadPokemonItens(offset, limit);
    }
  }

  checkFilters();
});

document.getElementById(TYPE_FILTER_1).addEventListener("change", () => {
  clearCache();
  resetFilters([TYPE_FILTER_1, TYPE_FILTER_2]); // Mantém os valores dos dropdowns de tipo
  const typeFilter1 = document.getElementById(TYPE_FILTER_1).value;
  const typeFilter2 = document.getElementById(TYPE_FILTER_2).value;

  if (typeFilter1 || typeFilter2) {
    loadPokemonByType(typeFilter1, typeFilter2);
  } else {
    allPokemonList = [];
    offset = 0;
    loadPokemonItens(offset, limit);
  }
  checkFilters();
});

document.getElementById(TYPE_FILTER_2).addEventListener("change", () => {
  clearCache();
  resetFilters([TYPE_FILTER_1, TYPE_FILTER_2]); // Mantém os valores dos dropdowns de tipo
  const typeFilter1 = document.getElementById(TYPE_FILTER_1).value;
  const typeFilter2 = document.getElementById(TYPE_FILTER_2).value;

  if (typeFilter1 || typeFilter2) {
    loadPokemonByType(typeFilter1, typeFilter2);
  } else {
    allPokemonList = [];
    offset = 0;
    loadPokemonItens(offset, limit);
  }
  checkFilters();
});

document.getElementById("clearFilters").addEventListener("click", () => {
  clearFilters();
  checkFilters();
});

// Função para verificar se há filtros ativos
function checkFilters() {
  const isFilterActive =
    document.getElementById(SEARCH_BY_NUMBER).value ||
    document.getElementById(SEARCH_BY_NAME).value ||
    document.getElementById(GENERATION_FILTER).value ||
    document.getElementById(TYPE_FILTER_1).value ||
    document.getElementById(TYPE_FILTER_2).value;

  if (isFilterActive) {
    loadMoreButton.style.display = "none";
  } else {
    if (isShowingFavorites) {
      const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
      loadMoreButton.style.display = favorites.length > limit ? "block" : "none";
    } else {
      loadMoreButton.style.display = "block";
    }
  }
}

// Função para limpar o cache
function clearCache() {
  for (const key in pokemonCache) {
    delete pokemonCache[key];
  }
}

// Configura os listeners ao carregar a página
setupInputListeners();

// Carrega todos os nomes de Pokémon ao iniciar a aplicação
loadAllPokemonNames().then((names) => {
  allPokemonNames = names;
});

// Carrega os primeiros Pokémon ao abrir a página
loadPokemonItens(offset, limit);