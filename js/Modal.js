import { UI } from "./UI.js";

export class Modal extends UI {
  buttonText = "";
  infoText = "";
  element = this.getElement(this.UISelectors.modal);
  button = this.getElement(this.UISelectors.modalButton);
  header = this.getElement(this.UISelectors.modalHeader);

  toggleModal = () => {
    console.log(this);
    this.element.classList.toggle("hide");
  };

  setText() {
    this.header.textContent = this.infoText;
    this.button.textContent = this.buttonText;
  }
}
