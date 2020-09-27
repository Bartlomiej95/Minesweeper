import { UI } from "./UI.js";

export class Custome extends UI {
  element = this.getElement(this.UISelectors.customeButton);
  custome = this.getElement(this.UISelectors.custome);
  formBtn = this.getElement(this.UISelectors.formButton);
  form = this.getElement(this.UISelectors.form);
  inputRows = this.getElement(this.UISelectors.inputRows);
  inputCols = this.getElement(this.UISelectors.inputCols);
  inputMines = this.getElement(this.UISelectors.inputMines);
  labelRows = this.getElement(this.UISelectors.labelRows);
  labelCols = this.getElement(this.UISelectors.labelCols);
  labelMines = this.getElement(this.UISelectors.labelMines);

  //zmienna isActive informuje nas o tym czy gracz kliknął w przycisk custome

  isValidate = true;
  formBtnIsClicked = false;
  usersNumberOfRows = null;
  usersNumberOfCols = null;
  usersNumberOfMines = null;

  toggleCustomeSettings = () => {
    this.custome.classList.toggle("hide");
  };

  validateForm() {
    this.isValidate = true;

    if (
      (this.inputRows.value < 4 && this.inputRows.value < 100) ||
      this.inputRows.value === ""
    ) {
      this.isValidate = false;
      this.labelRows.innerHTML =
        "Number of rows: Wpisz liczbę większą od 4, a mniejszą od 99!";
    } else if (
      (this.inputCols.value < 4 && this.inputCols.value < 100) ||
      this.inputRows.value === ""
    ) {
      this.isValidate = false;
      this.labelCols.innerHTML =
        "Number of cols: Wpisz liczbę większą od 4, a mniejszą od 99!";
    } else if (
      this.inputMines.value >= this.inputRows.value * this.inputCols.value ||
      this.inputMines.value < 0
    ) {
      this.labelMines.innerHTML =
        "Number of mines: Za dużo min! Nie może być ich więcej niż pól w grze oraz mniej od 0 ";
      this.isValidate = false;
    }
  }

  submitFormCustome(e) {
    e.preventDefault();
    this.toggleCustomeSettings();
    this.isActive = true;

    this.#setInputValues();
  }

  #setInputValues() {
    this.usersNumberOfRows = this.inputRows.value;
    this.usersNumberOfCols = this.inputCols.value;
    this.usersNumberOfMines = this.inputMines.value;
    this.#clearInput();
  }

  #clearInput() {
    this.inputRows.value = "";
    this.inputCols.value = "";
    this.inputMines.value = "";
    this.labelRows.innerHTML = "Number of rows:";
    this.labelCols.innerHTML = "Number of cols:";
    this.labelMines.innerHTML = "Number of mines:";
  }
}
