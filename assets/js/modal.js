pokemonList.addEventListener("click", (event) => {
  const pokemonItem = event.target.closest(".pokemon");

  if (pokemonItem) {
    const pokemonIDString = pokemonItem.id.split("-")[2];
    const pokemonID = parseInt(pokemonIDString);
    const scrollPosition = window.scrollY;

    pokeApi.getPokemonDetailById(pokemonID).then((pokeData) => {
      pokeApi.getPokemonSpecies(pokeData.species.url).then((speciesInfo) => {
        const pokemonName = pokemonItem.querySelector(".name").textContent;
        const pokemonNumber = pokemonIDString.padStart(3, "0");
        const modal = document.querySelector("dialog");
        modal.classList.add("poke-card");

        const pokeImg = pokemonID <= 649
          ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${pokemonIDString}.svg`
          : `/assets/img/pokemons/${pokemonID}.png`;

        const abilitiesNames = pokeData.abilities
          .map((ability) => ability.ability.name)
          .join(", ");

        modal.innerHTML = `
          <img class="poke-img" src="${pokeImg}" alt="" style="display: none;">
          <div class="upper">
            <div class="card-icons">
              <a href="#" class="close-card"><img src="/assets/img/icons/arrow-left.png" alt=""></a>
              <a href="#" class="favorite-button"><img src="/assets/img/icons/heart.png" alt=""></a>
            </div>
            <h1>${pokemonName}</h1>
            <p>#${pokemonNumber}</p>
          </div>
          <div class="lower">
            <div class="left">
              <h1>About</h1>
              <p>Species: ${speciesInfo.name}</p>
              <p>Height: ${pokeData.height}</p>
              <p>Weight: ${pokeData.weight}</p>
              <p>Abilities: ${abilitiesNames}</p>
              <h1>Breeding</h1>
              <p>Gender: ${speciesInfo.gender}</p>
              <p>Egg Group: ${speciesInfo.eggGroups}</p>
              <p>Egg Cycle: ${speciesInfo.eggCycle}</p>
            </div>
          </div>
        `;

        const colorClass = pokemonItem.classList[1];
        modal.classList.add(colorClass);

        modal.showModal();

        modal.querySelector(".close-card").addEventListener("click", (e) => {
          e.preventDefault();
          closeModal(modal, colorClass, scrollPosition);
        });

        modal.addEventListener("click", (e) => {
          if (e.target === modal) {
            closeModal(modal, colorClass, scrollPosition);
          }
        });

        const favoriteButton = modal.querySelector(".favorite-button");
        const favoriteIcon = favoriteButton.querySelector("img");
        let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
        let isFavorite = favorites.includes(pokemonID);

        favoriteIcon.src = isFavorite
          ? "/assets/img/icons/heart-fill.png"
          : "/assets/img/icons/heart.png";

        favoriteButton.addEventListener("click", (e) => {
          e.preventDefault();
          isFavorite = !isFavorite;

          if (isFavorite) {
            if (!favorites.includes(pokemonID)) {
              favorites.push(pokemonID);
              localStorage.setItem("favorites", JSON.stringify(favorites));
            }
            favoriteIcon.src = "/assets/img/icons/heart-fill.png";
          } else {
            favorites = favorites.filter((id) => id !== pokemonID);
            localStorage.setItem("favorites", JSON.stringify(favorites));
            favoriteIcon.src = "/assets/img/icons/heart.png";
          }

          if (isShowingFavorites) {
            offset = 0;
            loadFavorites(offset, limit);
          }
        });

        const imgElement = modal.querySelector(".poke-img");
        imgElement.onload = () => {
          const maxHeight = 80;
          const naturalWidth = imgElement.naturalWidth;
          const naturalHeight = imgElement.naturalHeight;
          const aspectRatio = naturalWidth / naturalHeight;

          if (pokemonID === 813 || pokemonID === 896) {
            imgElement.style.width = "90px";
            imgElement.style.height = "150px";
          } else if (pokemonID === 899) {
            imgElement.style.width = "131px";
            imgElement.style.height = "150px";
          } else if (pokemonID === 897) {
            imgElement.style.width = "174px";
            imgElement.style.height = "150px";
            imgElement.style.top = "90px";
            imgElement.style.left = "152px";
          } else if (aspectRatio <= 1.05) {
            imgElement.style.width = "120px";
            imgElement.style.height = "139px";
          } else if (aspectRatio <= 1.3) {
            imgElement.style.width = "145px";
            imgElement.style.height = "133px";
          } else if (Math.abs(aspectRatio - 1.7) < 0.1) {
            const newHeight = 100;
            const newWidth = newHeight * aspectRatio;
            imgElement.style.width = `${newWidth}px`;
            imgElement.style.height = `${newHeight}px`;
          } else if (naturalHeight <= maxHeight) {
            const newHeight = 120;
            const newWidth = newHeight * aspectRatio;
            imgElement.style.width = `${newWidth}px`;
            imgElement.style.height = `${newHeight}px`;
          } else if (naturalWidth > naturalHeight) {
            const newHeight = 100;
            const newWidth = newHeight * aspectRatio;
            imgElement.style.width = `${newWidth}px`;
            imgElement.style.height = `${newHeight}px`;
          } else if (naturalHeight > 110) {
            const newHeight = 130;
            const newWidth = newHeight * aspectRatio;
            imgElement.style.width = `${newWidth}px`;
            imgElement.style.height = `${newHeight}px`;
          }

          imgElement.style.opacity = "0";
          imgElement.style.display = "block";
          setTimeout(() => {
            imgElement.style.opacity = "1";
          }, 10);
        };
      });
    });
  }
});

function closeModal(modal, color, scrollPosition) {
  modal.classList.remove(color);
  modal.classList.remove("poke-card");
  modal.close();
  window.scrollTo(0, scrollPosition);
}