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

pokeApi.getPokemonDetail = (pokemon) => {

  return fetch(pokemon.url)
    .then((response) => response.json())
    .then(convertPokeApiDetailToPokemon);
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

  pokemon.weight = pokeDetail.weight
  pokemon.height = pokeDetail.height
  pokemon.species = pokeDetail.species
  pokemon.abilities = pokeDetail.abilities
  pokemon.eggGroup = pokeDetail.eggGroup
  pokemon.eggCycle = pokeDetail.eggCycle


  return pokemon;
}
