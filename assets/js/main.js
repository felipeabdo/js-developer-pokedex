const pokemonList = document.getElementById("pokemonList");
const loadMoreButton = document.getElementById("loadMoreButton");
const favoritesButton = document.querySelector(".head-title h3");

const limit = 12;
let offset = 0;
let isShowingFavorites = false;
let allPokemonList = [];
let favoritesList = [];
const pokemonCache = {}; // Objeto para armazenar Pokémon já buscados
let allPokemonNames = []; // Lista de todos os nomes de Pokémon

function capitalizeFirstLetter(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

// Função para carregar todos os nomes de Pokémon
function loadAllPokemonNames() {
  const url = "https://pokeapi.co/api/v2/pokemon?limit=1000"; // Limite alto para pegar todos os Pokémon
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
    8: { start: 810, end: 898 }
  };

  const range = generationRanges[generation];
  if (!range) return;

  if (isShowingFavorites) {
    // Filtra apenas os favoritos
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    Promise.all(favorites.map(id => pokeApi.getPokemonDetailById(id)))
      .then((pokemons) => {
        const filteredList = pokemons.filter(pokemon =>
          pokemon.number >= range.start && pokemon.number <= range.end
        );
        displayFilteredPokemon(filteredList);
        loadMoreButton.style.display = "none"; // Oculta o botão "Load More" durante a filtragem
      })
      .catch((error) => {
        console.error(error);
        displayFilteredPokemon([]);
      });
  } else {
    // Filtra na lista completa de Pokémon
    allPokemonList = [];
    offset = 0;
    loadPokemonItens(range.start - 1, range.end - range.start + 1);
  }
}

// Função para buscar Pokémon por tipo (concatenando os tipos)
function loadPokemonByType(type1, type2) {
  if (isShowingFavorites) {
    // Filtra apenas os favoritos
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    Promise.all(favorites.map(id => pokeApi.getPokemonDetailById(id)))
      .then((pokemons) => {
        const filteredList = pokemons.filter(pokemon => {
          const types = pokemon.types.map(type => type.toLowerCase());
          return (
            (!type1 || types.includes(type1.toLowerCase())) &&
            (!type2 || types.includes(type2.toLowerCase()))
          );
        });
        displayFilteredPokemon(filteredList);
        loadMoreButton.style.display = "none"; // Oculta o botão "Load More" durante a filtragem
      })
      .catch((error) => {
        console.error(error);
        displayFilteredPokemon([]);
      });
  } else {
    // Filtra na lista completa de Pokémon
    allPokemonList = [];
    offset = 0;

    if (type1 && type2) {
      // Se dois tipos forem selecionados, busca Pokémon que possuem ambos os tipos
      Promise.all([pokeApi.getPokemonsByType(type1), pokeApi.getPokemonsByType(type2)])
        .then(([pokemonsType1, pokemonsType2]) => {
          const filteredPokemons = pokemonsType1.filter(pokemon1 =>
            pokemonsType2.some(pokemon2 => pokemon2.number === pokemon1.number)
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

// Função para buscar Pokémon por número ou nome na API
function searchPokemonByNumberOrName(query) {
  const isNumber = !isNaN(query);

  if (isNumber) {
    // Busca por número (ID)
    if (isShowingFavorites) {
      // Filtra apenas os favoritos
      const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
      const pokemonID = parseInt(query);

      if (favorites.includes(pokemonID)) {
        // Se o Pokémon estiver favoritado, busca os detalhes
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
      // Busca na lista completa
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
    // Busca por nome (case-insensitive e parcial)
    const normalizedQuery = query.toLowerCase().trim();

    if (isShowingFavorites) {
      // Filtra apenas os favoritos
      const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
      const matchingNames = allPokemonNames.filter(name =>
        name.toLowerCase().includes(normalizedQuery)
      );

      // Filtra os IDs dos favoritos que correspondem aos nomes encontrados
      const matchingFavorites = favorites.filter(id =>
        matchingNames.includes(allPokemonNames[id - 1])
      );

      if (matchingFavorites.length > 0) {
        // Busca os detalhes dos Pokémon favoritados que correspondem à query
        Promise.all(matchingFavorites.map(id => pokeApi.getPokemonDetailById(id)))
          .then((pokemons) => {
            const validPokemons = pokemons.filter(pokemon => pokemon !== null);
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
      // Filtra na lista completa de Pokémon
      const filteredList = allPokemonList.filter(pokemon =>
        pokemon.name.toLowerCase().includes(normalizedQuery)
      );
      if (filteredList.length > 0) {
        displayFilteredPokemon(filteredList);
      } else {
        // Se não encontrou na lista carregada, faz uma requisição à API
        const matchingNames = allPokemonNames.filter(name =>
          name.toLowerCase().includes(normalizedQuery)
        );

        if (matchingNames.length > 0) {
          Promise.all(matchingNames.map(name => pokeApi.getPokemonByName(name)))
            .then((pokemons) => {
              const validPokemons = pokemons.filter(pokemon => pokemon !== null);
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

  // Oculta o botão "Load More" após a filtragem
  checkFilters();
}

// Função para exibir os Pokémon filtrados
function displayFilteredPokemon(filteredList, shouldReplaceList = true) {
  const pokemonListElement = document.getElementById('pokemonList');

  if (filteredList.length === 0) {
    pokemonListElement.innerHTML = '<p class="centralizado">Nenhum Pokémon encontrado.</p>';
    return;
  }

  // Se a lista deve ser substituída, limpa o conteúdo atual
  if (shouldReplaceList) {
    pokemonListElement.innerHTML = '';
  }

  // Cria um fragmento de documento para armazenar os novos Pokémon
  const fragment = document.createDocumentFragment();

  // Itera sobre a lista filtrada de Pokémon
  filteredList.forEach((pokemon, index) => {
    // Verifica se o Pokémon já está na lista (apenas se não estiver substituindo a lista)
    const existingPokemon = shouldReplaceList ? null : pokemonListElement.querySelector(`#modal-button-${pokemon.number}`);
    if (!existingPokemon) {
      // Cria o novo elemento de Pokémon
      const newPokemon = document.createElement('li');
      newPokemon.classList.add('pokemon', pokemon.type);
      newPokemon.id = `modal-button-${pokemon.number}`;
      newPokemon.innerHTML = `
        <img src="/assets/img/pokeball1.svg" class="pokemon-ball" alt="" />
        <span class="number">#${pokemon.number.toString().padStart(3, '0')}</span>
        <span class="name">${capitalizeFirstLetter(pokemon.name)}</span>
        <div class="detail">
          <ol class="types">
            ${pokemon.types.map((type) => `<li class="type ${type}">${type}</li>`).join('')}
          </ol>
          <img src="${pokemon.photo}" alt="${pokemon.name}" />
        </div>
      `;

      // Adiciona o novo Pokémon ao fragmento
      fragment.appendChild(newPokemon);

      // Aplica a animação apenas aos novos Pokémon
      setTimeout(() => {
        newPokemon.classList.add('visible');
      }, index * 100); // Atraso para animação em cascata
    }
  });

  // Adiciona os novos Pokémon à lista existente
  pokemonListElement.appendChild(fragment);
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

// Função para limpar os filtros
function clearFilters() {
  // Reseta todos os filtros
  resetFilters();

  if (isShowingFavorites) {
    // Na tela de favoritos, carrega a lista de favoritos
    offset = 0;
    loadFavorites(offset, limit, false, true); // Substitui a lista
  } else {
    // Na tela principal, carrega a lista completa de Pokémon
    allPokemonList = [];
    offset = 0;
    loadPokemonItens(offset, limit, true); // Substitui a lista
  }
}

// Função para validar o campo de número (aceita apenas números)
function validateNumberInput(event) {
  const input = event.target;
  const value = input.value.replace(/\D/g, ''); // Remove tudo que não for número
  input.value = value;
}

// Função para validar o campo de nome (aceita apenas letras e caracteres especiais)
function validateNameInput(event) {
  const input = event.target;
  const value = input.value.replace(/[^a-zA-Zà-úÀ-Ú\s'-]/g, ''); // Remove números e caracteres inválidos
  input.value = value;
}

// Função para capturar o evento de "Enter" nos inputs e validar entradas
function setupInputListeners() {
  const searchByNumberInput = document.getElementById('searchByNumber');
  const searchByNameInput = document.getElementById('searchByName');

  // Validação do campo de número
  searchByNumberInput.addEventListener('input', validateNumberInput);

  // Validação do campo de nome
  searchByNameInput.addEventListener('input', validateNameInput);

  // Adiciona o listener para o input de número
  searchByNumberInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Evita o comportamento padrão de "Próximo"
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
      event.preventDefault(); // Evita o comportamento padrão de "Próximo"
      const query = searchByNameInput.value.trim();
      if (query) {
        resetFilters('searchByName');
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
    loadMoreButton.style.display = "none"; // Oculta o botão "Load More"
    return;
  }

  // Verifica se há mais Pokémons favoritados além do limite
  const totalFavorites = favorites.length;
  const hasMoreFavorites = offset + limit < totalFavorites;

  if (!hasMoreFavorites) {
    loadMoreButton.style.display = "none"; // Oculta o botão "Load More" se todos os favoritos já foram carregados
  } else {
    loadMoreButton.style.display = isFiltering ? "none" : "block"; // Exibe o botão "Load More" se houver mais favoritos
  }

  // Busca os detalhes dos Pokémon favoritados
  const pokemonsToLoad = favorites.slice(offset, offset + limit); // Carrega apenas os Pokémons dentro do limite
  Promise.all(
    pokemonsToLoad.map((id) => pokeApi.getPokemonDetailById(id))
  ).then((newPokemons) => {
    if (shouldReplaceList) {
      favoritesList = newPokemons; // Substitui a lista de favoritos
    } else {
      favoritesList = favoritesList.concat(newPokemons); // Adiciona à lista existente
    }
    displayFilteredPokemon(favoritesList, shouldReplaceList);

    // Verifica novamente se todos os favoritos foram carregados após a atualização
    if (favoritesList.length >= totalFavorites) {
      loadMoreButton.style.display = "none"; // Oculta o botão "Load More" se todos os favoritos já foram carregados
    }
  });
}

// Alterna entre a lista de todos os Pokémon e a lista de favoritos
favoritesButton.addEventListener("click", () => {
  // Oculta a barra de rolagem da página durante a transição
  document.body.style.overflow = "hidden";

  // Atualiza o estado de isShowingFavorites antes de limpar os filtros
  isShowingFavorites = !isShowingFavorites;

  // Limpa os filtros ao alternar entre as telas
  clearFilters();

  if (isShowingFavorites) {
    // Mostra a lista de favoritos
    favoritesButton.textContent = "Voltar";
    pokemonList.innerHTML = ""; // Limpa a lista antes de carregar os favoritos
    offset = 0; // Reseta o offset para 0 ao entrar na tela de favoritos
    loadFavorites(offset, limit); // Carrega os Pokémon favoritados
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    loadMoreButton.style.display = favorites.length > limit ? "block" : "none"; // Exibe o botão "Load More" apenas se houver mais de 12 favoritos
  } else {
    // Volta para a lista de todos os Pokémon
    favoritesButton.textContent = "Favoritos ❤️";
    pokemonList.innerHTML = ""; // Limpa a lista antes de carregar os Pokémons
    allPokemonList = []; // Limpa a lista de Pokémon carregados
    offset = 0; // Reseta o offset para 0 ao voltar para a tela principal
    loadPokemonItens(offset, limit); // Carrega os Pokémon da tela principal
    loadMoreButton.style.display = "block"; // Exibe o botão "Load More"
  }

  // Restaura a barra de rolagem após a transição
  setTimeout(() => {
    document.body.style.overflow = "auto"; // Restaura a barra de rolagem da página
  }, 100); // Pequeno atraso para garantir que a transição esteja completa
});

// Carrega mais cards ao clicar no botão "Load More"
loadMoreButton.addEventListener("click", () => {
  // Oculta a barra de rolagem da página durante o carregamento
  document.body.style.overflow = "hidden";

  if (isShowingFavorites) {
    // Na tela de favoritos, carrega mais Pokémons favoritados
    offset += limit;

    // Verifica se ainda há favoritos para carregar
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    if (offset < favorites.length) {
      loadFavorites(offset, limit);
    } else {
      loadMoreButton.style.display = "none"; // Oculta o botão "Load More" se todos os favoritos já foram carregados
    }
  } else {
    // Na tela principal, carrega mais Pokémons da lista completa
    offset += limit;
    loadPokemonItens(offset, limit, false); // Não substitui a lista
  }
});

// Event listeners para os filtros
document.getElementById('generationFilter').addEventListener('change', () => {
  clearCache(); // Limpa o cache ao mudar a geração
  resetFilters('generationFilter');
  const generationFilter = document.getElementById('generationFilter').value;

  if (isShowingFavorites) {
    if (generationFilter) {
      // Filtra os favoritos pela geração selecionada
      loadPokemonByGeneration(generationFilter);
    } else {
      // Se nenhuma geração for selecionada, recarrega a lista completa de favoritos
      offset = 0; // Reseta o offset
      loadFavorites(offset, limit);
    }
  } else {
    if (generationFilter) {
      // Filtra a lista completa de Pokémon pela geração selecionada
      loadPokemonByGeneration(generationFilter);
    } else {
      // Se nenhuma geração for selecionada, volta a carregar os 12 primeiros Pokémon
      allPokemonList = [];
      offset = 0;
      loadPokemonItens(offset, limit);
    }
  }

  checkFilters();
});

document.getElementById('typeFilter1').addEventListener('change', () => {
  clearCache(); // Limpa o cache ao mudar o tipo
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
  clearCache(); // Limpa o cache ao mudar o tipo
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
  clearFilters();
  checkFilters();
});

function checkFilters() {
  const isFilterActive = document.getElementById('searchByNumber').value ||
                         document.getElementById('searchByName').value ||
                         document.getElementById('generationFilter').value ||
                         document.getElementById('typeFilter1').value ||
                         document.getElementById('typeFilter2').value;

  // Oculta o botão "Load More" se algum filtro estiver ativo
  if (isFilterActive) {
    loadMoreButton.style.display = 'none';
  } else {
    // Exibe o botão "Load More" na lista principal ou de favoritos
    if (isShowingFavorites) {
      const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
      loadMoreButton.style.display = favorites.length > limit ? 'block' : 'none';
    } else {
      loadMoreButton.style.display = 'block';
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