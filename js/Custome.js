import { UI } from "./UI.js";

export class Custome extends UI {
  element = this.getElement(this.UISelectors.customeButton);
  custome = this.getElement(this.UISelectors.custome);
  //   board = document.get("[data-custome]");
  //zmienna isActive informuje nas o tym czy gracz kliknął w przycisk custome
  isActive = false;
  usersNumberOfRows = null;
  usersNumberOfCols = null;
  usersNumberOfMines = null;

  toggleCustomeSettings = () => {
    this.custome.classList.toggle("hide");
  };
}
