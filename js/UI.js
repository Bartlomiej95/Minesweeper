export class UI {
  UISelectors = {
    board: `[data-board]`,
    cell: `[data-cell]`,
    counter: `[data-counter]`,
    timer: `[data-timer]`,
    resetButton: "[data-button-reset]",
    easyButton: "[data-button-easy]",
    normalButton: "[data-button-normal]",
    expertButton: "[data-button-expert]",
    customeButton: "[data-button-custome]",
    modal: "[data-modal]",
    modalHeader: "[data-modal-header]",
    modalButton: "[data-modal-button]",
    custome: "[data-custome]",
    inputRows: "[data-input-rows]",
    inputCols: "[data-input-cols]",
    inputMines: "[data-input-mines]",
    labelRows: "[data-label-rows]",
    labelCols: "[data-label-cols]",
    labelMines: "[data-label-mines]",
    formButton: "[data-form-button]",
    form: "[data-form]",
  };

  getElement(selector) {
    return document.querySelector(selector);
  }

  getElements(selector) {
    return document.querySelectorAll(selector);
  }
}
