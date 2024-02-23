const button = document.querySelector(".pokemons button")
const buttons = document.querySelectorAll(".pokemons");
const modal = document.querySelector("dialog");
const buttonClose = document.querySelector("dialog button");
// const pokeLI = document.querySelectorAll("ol buttons li")

buttons.forEach(button => {
  button.onclick = function () {

    modal.showModal();
  }
});

buttonClose.onclick = function () {
  modal.close();
}



pokemonList.addEventListener('click', (event) => {

  const button = event.target.closest('.modal-button'); // Encontra o botão mais próximo clicado dentro de um item da lista
  if (button) {
    const pokemonNumber = button.id.split('-')[2]; // Extrai o número do Pokémon do ID do botão
    const modal = document.querySelector('dialog');
    modal.classList.add("poke-card");

    modal.innerHTML = `
        <div class="upper">
          <p>Número do Pokémon: ${pokemonNumber}</p>
          <button>Fechar</button>
        </div>
        <div class="lower">
          </div>
        </div>

    `;

    let colorClass = event.target.closest('.modal-button li');
    color = colorClass.classList[1]
    modal.classList.add(color)
    modal.showModal(); // Exibe o modal


    // Adicionar um ouvinte de evento de clique ao botão de fechar do modal
    modal.querySelector('button').addEventListener('click', () => {
      modal.classList.remove(color)
      modal.close(); // Fecha o modal quando o botão de fechar é clicado
    });



  }
});
