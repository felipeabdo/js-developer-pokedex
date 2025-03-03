pokemonList.addEventListener("click", (event) => {
  const pokemonItem = event.target.closest(".pokemon");

  if (pokemonItem) {
    const pokemonIDString = pokemonItem.id.split("-")[2];
    const pokemonID = parseInt(pokemonIDString);

    // Salva a posição de rolagem atual da página
    const scrollPosition = window.scrollY;

    // Busca os detalhes do Pokémon específico
    pokeApi.getPokemonDetailById(pokemonID).then((pokeData) => {
      // Busca os detalhes da espécie do Pokémon
      pokeApi.getPokemonSpecies(pokeData.species.url).then((speciesInfo) => {
        let pokemonName = pokemonItem.querySelector(".name").textContent;
        const pokemonNumber = pokemonIDString.padStart(3, "0");
        const modal = document.querySelector("dialog");
        modal.classList.add("poke-card");

        // Lógica para definir a URL da imagem
        let pokeImg;
        if (pokemonID <= 649) {
          // Usa a imagem da API
          pokeImg = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${pokemonIDString}.svg`;
        } else {
          // Usa a imagem da pasta local
          pokeImg = `/assets/img/pokemons/${pokemonID}.png`;
        }

        // Extrair os nomes das habilidades
        const abilitiesNames = pokeData.abilities
          .map((ability) => ability.ability.name)
          .join(", ");

        // Monta o conteúdo do modal
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

        // Adiciona a classe de cor ao modal com base no tipo do Pokémon
        let colorClass = pokemonItem.classList[1]; // Obtém a classe de tipo diretamente do item
        let color = colorClass;
        modal.classList.add(color);

        // Exibe o modal
        modal.showModal();

        // Fecha o modal ao clicar no botão de fechar
        modal.querySelector(".close-card").addEventListener("click", (e) => {
          e.preventDefault(); // Evita comportamentos padrão do link
          closeModal(modal, color, scrollPosition);
        });

        // Fecha o modal ao clicar fora dele
        modal.addEventListener("click", (e) => {
          if (e.target === modal) {
            closeModal(modal, color, scrollPosition);
          }
        });

        // Alterna o ícone de coração e atualiza a lista de favoritos
        const favoriteButton = modal.querySelector(".favorite-button");
        const favoriteIcon = favoriteButton.querySelector("img");

        // Verifica se o Pokémon já está favoritado
        let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
        let isFavorite = favorites.includes(pokemonID);

        // Define o ícone inicial
        favoriteIcon.src = isFavorite
          ? "/assets/img/icons/heart-fill.png"
          : "/assets/img/icons/heart.png";

        // Alterna o ícone de coração e atualiza a lista de favoritos
        favoriteButton.addEventListener("click", (e) => {
          e.preventDefault();

          // Atualiza o estado de favorito
          isFavorite = !isFavorite;

          if (isFavorite) {
            // Adiciona o Pokémon aos favoritos apenas se ele ainda não estiver na lista
            if (!favorites.includes(pokemonID)) {
              favorites.push(pokemonID);
              localStorage.setItem("favorites", JSON.stringify(favorites));
            }
            favoriteIcon.src = "/assets/img/icons/heart-fill.png";
          } else {
            // Remove o Pokémon dos favoritos
            favorites = favorites.filter((id) => id !== pokemonID);
            localStorage.setItem("favorites", JSON.stringify(favorites));
            favoriteIcon.src = "/assets/img/icons/heart.png";
          }

          // Atualiza a lista de favoritos em tempo real
          if (isShowingFavorites) {
            offset = 0; // Reseta o offset para 0 ao atualizar a lista
            loadFavorites(offset, limit); // Recarrega a lista de favoritos
          }
        });

        // Redimensiona a imagem do Pokémon, se necessário
        const imgElement = modal.querySelector(".poke-img");
        imgElement.onload = () => {
          const maxHeight = 80; // Altura máxima para redimensionar imagens pequenas
          const naturalWidth = imgElement.naturalWidth;
          const naturalHeight = imgElement.naturalHeight;
          const aspectRatio = naturalWidth / naturalHeight;

          // Verifica se a proporção é até 105:100 (1.05:1)
          if (aspectRatio <= 1.05) {
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

          // Exibe a imagem com transição suave
          imgElement.style.opacity = "0"; // Inicialmente transparente
          imgElement.style.display = "block"; // Exibe a imagem
          setTimeout(() => {
            imgElement.style.opacity = "1"; // Torna a imagem visível com transição
          }, 10);
        };
      });
    });
  }
});

// Função para fechar o modal
function closeModal(modal, color, scrollPosition) {
  modal.classList.remove(color);
  modal.classList.remove("poke-card");
  modal.close();

  // Restaura a posição de rolagem da página
  window.scrollTo(0, scrollPosition);
}