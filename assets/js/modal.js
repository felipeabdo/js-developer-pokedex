pokemonList.addEventListener("click", (event) => {
  const button = event.target.closest(".modal-button");

  if (button) {
    const pokemonIDString = button.id.split("-")[2];
    const pokemonID = parseInt(pokemonIDString) - 1;

    pokeApi.getPokemons(offset, limit).then((pokemons = []) => {
      const pokeData = pokemons[pokemonID];

      let pokemonName = button.querySelector('.name').textContent;
      const pokemonNumber = pokemonIDString.padStart(3, "0");
      const modal = document.querySelector("dialog");
      modal.classList.add("poke-card");
      const pokeImg = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${pokemonIDString}.svg`;

      modal.innerHTML = `
        <img class="poke-img" src="${pokeImg}" alt="">
        <div class="upper">
          <div class="card-icons">
            <a href="#" class="close-card"><img src="/assets/img/icons/arrow-left.png" alt=""></a>
            <a href="#" class="close-card"><img src="/assets/img/icons/heart.png" alt=""></a>
          </div>
          <h1>${pokemonName}</h1>
          <p>#${pokemonNumber}</p>
        </div>
        <div class="lower">
          <div class="left">
            <h1>About</h1>
            <p>Species: ${pokeData.species}</p>
            <p>Height: ${pokeData.height}</p>
            <p>Weight: ${pokeData.weight}</p>
            <p>Abilities: ${pokeData.abilities}</p>
            <h1>Breading</h1>
            <p>Gender: ${pokeData.gender}</p>
            <p>Egg Group: ${pokeData.eggGroup}</p>
            <p>Egg Cycle: ${pokeData.eggCycle}</p>
          </div>
        </div>
      `;

      let colorClass = event.target.closest(".modal-button li");
      color = colorClass.classList[1];
      modal.classList.add(color);
      modal.showModal();

      modal.querySelector(".close-card").addEventListener("click", () => {
        modal.classList.remove(color);
        modal.classList.remove("poke-card");
        modal.close();
      });
    });
  }
});
