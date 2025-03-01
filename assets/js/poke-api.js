const pokeApi = {};

pokeApi.getPokemons = (offset, limit = 12) => {
  const url = `https://pokeapi.co/api/v2/pokemon/?offset=${offset}&limit=${limit}`;
  return fetch(url)
    .then((response) => response.json())
    .then((jsonBody) => jsonBody.results)
    .then((pokemons) => pokemons.map(pokeApi.getPokemonDetail))
    .then((detailRequest) => Promise.all(detailRequest))
    .then((pokemonDetails) => pokemonDetails)
    .catch((error) => console.error(error));
};

// Nova função para buscar Pokémon por tipo
pokeApi.getPokemonsByType = (type) => {
  const url = `https://pokeapi.co/api/v2/type/${type}`;
  return fetch(url)
    .then((response) => response.json())
    .then((typeData) => {
      // Extrai a lista de Pokémon do tipo selecionado
      const pokemons = typeData.pokemon.map((entry) => entry.pokemon);
      // Busca os detalhes de cada Pokémon
      return Promise.all(pokemons.map(pokeApi.getPokemonDetail));
    })
    .catch((error) => {
      console.error(error);
      return [];
    });
};

pokeApi.getPokemonDetailById = (id) => {
  const url = `https://pokeapi.co/api/v2/pokemon/${id}/`;
  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Pokémon não encontrado');
      }
      return response.json();
    })
    .then(convertPokeApiDetailToPokemon)
    .catch((error) => {
      console.error(error);
      return null;
    });
};

pokeApi.getPokemonByName = (name) => {
  const url = `https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`;
  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Pokémon não encontrado');
      }
      return response.json();
    })
    .then(convertPokeApiDetailToPokemon)
    .catch((error) => {
      console.error(error);
      return null;
    });
};

pokeApi.getPokemonDetail = (pokemon) => {
  return fetch(pokemon.url)
    .then((response) => response.json())
    .then(convertPokeApiDetailToPokemon);
};

pokeApi.getPokemonSpecies = (url) => {
  return fetch(url)
    .then((response) => response.json())
    .then((speciesData) => {
      const genderRate = speciesData.gender_rate;
      let genderInfo = "Unknown";

      if (genderRate === -1) {
        genderInfo = "Genderless";
      } else {
        const femalePercentage = (genderRate / 8) * 100;
        const malePercentage = 100 - femalePercentage;
        genderInfo = `${malePercentage}% male, ${femalePercentage}% female`;
      }

      return {
        name: speciesData.name,
        eggGroups: speciesData.egg_groups.map(group => group.name).join(", "),
        eggCycle: speciesData.hatch_counter,
        gender: genderInfo,
      };
    });
};

function convertPokeApiDetailToPokemon(pokeDetail) {
  const pokemon = new Pokemon();
  pokemon.number = pokeDetail.id;
  pokemon.name = pokeDetail.name;

  const types = pokeDetail.types.map((typeSlot) => typeSlot.type.name);
  const type = types[0];

  pokemon.types = types;
  pokemon.type = type;

  pokemon.photo = pokeDetail.sprites.other.dream_world.front_default;

  pokemon.weight = pokeDetail.weight;
  pokemon.height = pokeDetail.height;
  pokemon.species = pokeDetail.species;
  pokemon.abilities = pokeDetail.abilities;
  pokemon.eggGroup = pokeDetail.eggGroup;
  pokemon.eggCycle = pokeDetail.eggCycle;

  return pokemon;
}