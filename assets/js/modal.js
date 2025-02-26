pokemonList.addEventListener("click", (event) => {
  const button = event.target.closest(".modal-button");

  if (button) {
    const pokemonIDString = button.id.split("-")[2];
    const pokemonID = parseInt(pokemonIDString);

    // Salva a posição de rolagem atual da página
    const scrollPosition = window.scrollY;

    // Busca os detalhes do Pokémon específico
    pokeApi.getPokemonDetailById(pokemonID).then((pokeData) => {
      // Busca os detalhes da espécie do Pokémon
      pokeApi.getPokemonSpecies(pokeData.species.url).then((speciesInfo) => {
        let pokemonName = button.querySelector('.name').textContent;
        const pokemonNumber = pokemonIDString.padStart(3, "0");
        const modal = document.querySelector("dialog");
        modal.classList.add("poke-card");
        const pokeImg = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${pokemonIDString}.svg`;

        // Extrair os nomes das habilidades
        const abilitiesNames = pokeData.abilities.map(ability => ability.ability.name).join(", ");

        // Monta o conteúdo do modal
        modal.innerHTML = `
          <img class="poke-img" src="${pokeImg}" alt="" style="display: none;"> <!-- Esconde a imagem inicialmente -->
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
              <p>Species: ${speciesInfo.name}</p>
              <p>Height: ${pokeData.height}</p>
              <p>Weight: ${pokeData.weight}</p>
              <p>Abilities: ${abilitiesNames}</p>
              <h1>Breading</h1>
              <p>Gender: ${speciesInfo.gender}</p>
              <p>Egg Group: ${speciesInfo.eggGroups}</p>
              <p>Egg Cycle: ${speciesInfo.eggCycle}</p>
            </div>
          </div>
        `;

        // Adiciona a classe de cor ao modal com base no tipo do Pokémon
        let colorClass = event.target.closest(".modal-button li");
        color = colorClass.classList[1];
        modal.classList.add(color);

        // Exibe o modal
        modal.showModal();

        // Fecha o modal ao clicar no botão de fechar
        modal.querySelector(".close-card").addEventListener("click", (e) => {
          e.preventDefault(); // Evita comportamentos padrão do link
          modal.classList.remove(color);
          modal.classList.remove("poke-card");
          modal.close();

          // Restaura a posição de rolagem da página
          window.scrollTo(0, scrollPosition);
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
            // Se a proporção for até 105:100, define o tamanho fixo
            imgElement.style.width = "120px";
            imgElement.style.height = "139px";
          }
          else if (aspectRatio <= 1.3) {
            // Se a proporção for até 1.2:1, define o tamanho fixo
            imgElement.style.width = "145px";
            imgElement.style.height = "133px";
          }
          // Verifica se a proporção é 170:100 (1.7:1)
          else if (Math.abs(aspectRatio - 1.7) < 0.1) { // Tolerância de 0.1 para pequenas variações
            // Se a proporção for 170:100, define a altura como 100px e ajusta a largura proporcionalmente
            const newHeight = 100; // Nova altura
            const newWidth = newHeight * aspectRatio; // Largura proporcional

            imgElement.style.width = `${newWidth}px`;
            imgElement.style.height = `${newHeight}px`;
          }
          // Verifica se a altura é 80px ou menor
          else if (naturalHeight <= maxHeight) {
            // Se a altura for 80px ou menor, redimensiona para 120px de altura
            const newHeight = 120; // Nova altura
            const newWidth = newHeight * aspectRatio; // Largura proporcional

            imgElement.style.width = `${newWidth}px`;
            imgElement.style.height = `${newHeight}px`;
          }
          // Verifica se a largura é maior que a altura
          else if (naturalWidth > naturalHeight) {
            // Se a largura for maior que a altura, define a altura máxima como 100px
            const newHeight = 100; // Nova altura
            const newWidth = newHeight * aspectRatio; // Largura proporcional

            imgElement.style.width = `${newWidth}px`;
            imgElement.style.height = `${newHeight}px`;
          }
          // Verifica se a altura é maior que 110px
          else if (naturalHeight > 110) {
            // Se a altura for maior que 110px, redimensiona proporcionalmente
            const newHeight = 130; // Nova altura
            const newWidth = newHeight * aspectRatio; // Largura proporcional

            imgElement.style.width = `${newWidth}px`;
            imgElement.style.height = `${newHeight}px`;
          }

          // Verifica se o pokemonNumber é 004 (Charmander)
          if (pokemonNumber === "004") {
            imgElement.style.left = "54%"; // Ajusta o posicionamento horizontal
          } else if (pokemonNumber === "007") {
            imgElement.style.width = "140px";
            imgElement.style.height = "149px";
            imgElement.style.left = "48%"; // Ajusta o posicionamento horizontal
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