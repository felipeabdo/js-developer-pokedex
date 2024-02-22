// const button = document.querySelector(".pokemons button")
const buttons = document.querySelectorAll(".pokemons");
const modal = document.querySelector("dialog");
const buttonClose = document.querySelector("dialog button");

buttons.forEach(button => {
  button.onclick = function () {
    modal.showModal();
  }
});

buttonClose.onclick = function () {
  modal.close();
}
