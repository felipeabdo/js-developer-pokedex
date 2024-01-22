// Nesse arquivo estamos isolando o comportamento de consumo e tratamento da API.

// Nossa mini API começa com um objeto vazio:

const pokeApi = {};

// Aqui criamos um método getPokemons dentro do objeto pokeAPI que criamos acima.

pokeApi.getPokemons = (offset = 0, limit = 10) => { //nosso método getPokemons começa com um default de offset e limit.
  const url = `https://pokeapi.co/api/v2/pokemon/?offset=${offset}&limit=${limit}`; // variável com a url a ser consumida e template strings.

  return fetch(url) // Pela interface fetch API nativa no JS desde o ES6, está sendo feita uma requisição HTTP assíncrona na URL através de uma Promise.
    .then((response) => response.json()) // Aqui convertemos a resposta da requisição para um json através do método json()
    .then((jsonBody) => jsonBody.results) // Aqui buscamos o que tem dentro do array results que está no json retornado acima.
    .then((pokemons) => pokemons.map(pokeApi.getPokemonDetail)) // Usamos o método map para iterar sobre a lista de pokemons retornada e aplicar o método getPokemonDetail para buscar mais informações sobre os pokemons que estão em outra url (ver funcionamento de getPokemonDetail para melhor entendimento).
    .then((detailRequest) => Promise.all(detailRequest)) // A função Promise.all() recebe um array de Promises e retorna uma nova Promise. Esta nova Promise é resolvida quando todas as Promises no array fornecido são resolvidas. (As promises do .then acima em getPokemonDetail).
    .then((pokemonDetails) => pokemonDetails) // Finalmente temos aqui todos os detalhes dos Pokemons.
    .catch((error) => console.error(error)); // Se houver algum erro, ele ficará por aqui.
};

pokeApi.getPokemonDetail = (pokemon) => { // Aqui pegamos os detalhes específicos de cada pokemon.
  return fetch(pokemon.url) // Pela interface fetch API stá sendo feita uma requisição HTTP assíncrona na URL através de uma Promise. Ver a linha .then((pokemons) => pokemons.map(pokeApi.getPokemonDetail)) do método acima. Essa URL virá de cada iteração pelo map.
    .then((response) => response.json()) // Aqui ele transforma essa requisição em um json
    .then(convertPokeApiDetailToPokemon) // Aqui ele chama o método convertPokeApiDetailToPokemon para colocar cada informação obtida nas variáveis da instância de cada pokemon, fechando assim o pokemon com seus dados.
};

function convertPokeApiDetailToPokemon(pokeDetail) { // Aqui pegamos os detalhes dos pokemons obtidos no método acima para converter em um Pokemon.
  const pokemon = new Pokemon(); // Aqui criamos uma instancia de um novo Pokemons e guardamos em uma variável. (Ver pokemon-model.js)
  pokemon.number = pokeDetail.order; // Aqui pegamos o número do pokemon.
  pokemon.name = pokeDetail.name; // Aqui pegamos a ordem do pokemon,

  const types = pokeDetail.types.map((typeSlot) => typeSlot.type.name); // Aqui busca os tipos que são o pokemon
  // const [type] = types // Issi se chama destructuring.
  const type = types[0] // da na mesma que o codigo comentado acima. Estamos pegando o tipo principal do pokemon.

  pokemon.types = types // Aqui adicionamos todos os tipos que o pokemon é na variável da instância.
  pokemon.type = type // Aqui adicionamos o tipo principal que o pokemon é na variável da instância.

  pokemon.photo = pokeDetail.sprites.other.dream_world.front_default; //Aqui adicionamos a imagem do pokemon na variável da instância.
  return pokemon // Aqui retornamos um pokemon pronto.
}
