const button = document.querySelector(".pokemons button");
const buttons = document.querySelectorAll(".pokemons");
const modal = document.querySelector("dialog");
const buttonClose = document.querySelector("dialog button");






buttons.forEach((button) => {
  button.onclick = function () {
    modal.showModal();
  };
});

buttonClose.onclick = function () {
  modal.close();
};

pokemonList.addEventListener("click", (event) => {

  const button = event.target.closest(".modal-button"); // Encontra o botão mais próximo clicado dentro de um item da lista

  if (button) {

    const pokemonID = button.id.split("-")[2]; // Extrai o número do Pokémon do ID do botão
    console.log(pokemonID)
    let pokemonName = event.target;
    console.log(pokemonName)

    const pokemonNumber = pokemonID.padStart(3, "0");
    const modal = document.querySelector("dialog");
    modal.classList.add("poke-card");
    const pokeImg = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${pokemonID}.svg`;


    modal.innerHTML = `
    <img class="poke-img" src="${pokeImg}" alt="">
        <div class="upper">

          <a href="#" class="close-card"><img src="/assets/img/icons/arrow-left.png" alt=""></a>
          <a href="#" class="close-card"><img src="/assets/img/icons/heart.png" alt=""></a>

          <h1></h1>
          <p>Número do Pokémon: #${pokemonNumber}</p>
          </div>
          <div class="lower">
          <div class="left">
            <h1>About</h1>
            <p>Species</p>
            <p>Height</p>
            <p>Weight</p>
            <p>Abilities</p>
            <h1>Breading</h1>
            <p>Gender</p>
            <p>Egg Group</p>
            <p>Egg Cycle</p>
          </div>
          <div class="right">
            <h1>‎ </h1>
            <p>Species</p>
            <p>Height</p>
            <p>Weight</p>
            <p>Abilities</p>
            <h1>‎ </h1>
            <p>Gender</p>
            <p>Egg Group</p>
            <p>Egg Cycle</p>
          </div>
        </div>
    `;

    let colorClass = event.target.closest(".modal-button li");
    color = colorClass.classList[1];
    modal.classList.add(color);
    modal.showModal(); // Exibe o modal

    // Adicionar um ouvinte de evento de clique ao botão de fechar do modal
    modal.querySelector(".close-card").addEventListener("click", () => {
      modal.classList.remove(color);
      modal.classList.remove("poke-card");
      modal.close(); // Fecha o modal quando o botão de fechar é clicado
    });
  }
});
