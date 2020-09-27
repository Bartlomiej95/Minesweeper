import { Cell } from "./Cell.js";
import { UI } from "./UI.js";
import { Counter } from "./Counter.js";
import { Timer } from "./Timer.js";
import { ResetButton } from "./ResetButton.js";
import { Modal } from "./Modal.js";
import { Custome } from "./Custome.js";

class Game extends UI {
  // # - konwencja, dodanie hasza sprawia, że metody są prywatne

  #config = {
    easy: {
      cols: 8,
      rows: 8,
      mines: 10,
    },
    normal: {
      cols: 16,
      rows: 16,
      mines: 40,
    },
    expert: {
      cols: 16,
      rows: 30,
      mines: 99,
    },
  };

  #counter = new Counter();
  #timer = new Timer();
  #modal = new Modal();
  #custome = new Custome();

  #isGameFinished = false;
  #numberOfRows = null;
  #numberOfCols = null;
  #numberOfMines = null;

  //tablica reprezentująca ilość pól do gry, której ilość jest zależna od poziomu trudności
  #cells = [];
  #cellsElements = null;
  #cellsToReveal = 0;
  #revealedCells = 0;

  #board = null;
  #buttons = {
    modal: null,
    easy: null,
    normal: null,
    expert: null,
    custome: null,
    reset: new ResetButton(),
  };

  initializeGame() {
    this.#handleElements();
    this.#counter.init();
    this.#timer.init();
    this.#addButtonsEventListeners();
    this.#newGame();
  }

  #newGame(
    rows = this.#config.easy.rows,
    cols = this.#config.easy.cols,
    mines = this.#config.easy.mines
  ) {
    //domyślnie pokazujemy poziom łatwy
    this.#numberOfRows = rows;
    this.#numberOfCols = cols;
    this.#numberOfMines = mines;

    this.#counter.setValue(this.#numberOfMines);
    this.#timer.resetTimer();

    this.#cellsToReveal =
      this.#numberOfCols * this.#numberOfRows - this.#numberOfMines;

    //zmieniamy wartość css cells-in-row tak aby plansza odpowiednio rozmieściła się na ekranie
    this.#setStyles();

    this.#generateCells();
    this.#renderBoard();
    this.#placeMinesInCells();

    this.#cellsElements = this.getElements(this.UISelectors.cell);
    this.#buttons.reset.changeEmotion("neutral");

    this.#isGameFinished = false;
    this.#revealedCells = 0;

    this.#addCellsEventListeners();
  }

  #endGame(isWin) {
    this.#isGameFinished = true;
    this.#timer.stopTimer();
    this.#modal.buttonText = "Close";

    if (!isWin) {
      //przegrana
      this.#revealMines(); //gdy gracz przegrywa pokazują mu się wszystkie komórki z minami
      this.#modal.infoText = "You lost, try again";
      this.#buttons.reset.changeEmotion("negative");
      this.#modal.setText();
      this.#modal.toggleModal();
      return;
    }
    this.#modal.infoText =
      this.#timer.numberOfSeconds < this.#timer.maxNumberOfSeconds
        ? `You won, it took you ${
            this.#timer.numberOfSeconds
          } seconds. Congratulations ! `
        : "You won, congratulations!";
    this.#buttons.reset.changeEmotion("positive");
    this.#modal.setText();
    this.#modal.toggleModal();
  }

  #handleElements() {
    //chwytamy element do którego będziemy mogli wkładac komórki
    this.#board = this.getElement(this.UISelectors.board);
    this.#buttons.modal = this.getElement(this.UISelectors.modalButton);
    this.#buttons.easy = this.getElement(this.UISelectors.easyButton);
    this.#buttons.normal = this.getElement(this.UISelectors.normalButton);
    this.#buttons.expert = this.getElement(this.UISelectors.expertButton);
    this.#buttons.custome = this.getElement(this.UISelectors.customeButton);
  }

  #addCellsEventListeners() {
    // lewy przycisk i prawy przycisk myszy na polach do gry - obsługa

    this.#cellsElements.forEach((element) => {
      element.addEventListener("click", this.#handleCellClick);
      element.addEventListener("contextmenu", this.#handleCellContextMenu);
    });
  }

  #addButtonsEventListeners() {
    this.#buttons.modal.addEventListener("click", this.#modal.toggleModal);
    this.#buttons.easy.addEventListener("click", () => {
      this.#handleNewGameClick(
        this.#config.easy.rows,
        this.#config.easy.cols,
        this.#config.easy.mines
      );
    });
    this.#buttons.normal.addEventListener("click", () => {
      this.#handleNewGameClick(
        this.#config.normal.rows,
        this.#config.normal.cols,
        this.#config.normal.mines
      );
    });
    this.#buttons.expert.addEventListener("click", () => {
      this.#handleNewGameClick(
        this.#config.expert.rows,
        this.#config.expert.cols,
        this.#config.expert.mines
      );
    });
    this.#buttons.reset.element.addEventListener("click", () => {
      this.#handleNewGameClick();
    });
    this.#buttons.custome.addEventListener(
      "click",
      this.#custome.toggleCustomeSettings
    );

    this.#custome.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.#custome.validateForm();
      if (this.#custome.isValidate) {
        this.#custome.submitFormCustome(e);
        this.#handleNewGameClick(
          this.#custome.usersNumberOfRows,
          this.#custome.usersNumberOfCols,
          this.#custome.usersNumberOfMines
        );
      }
    });
  }

  #removeCellsEventListeners() {
    this.#cellsElements.forEach((element) => {
      element.removeEventListener("click", this.#handleCellClick);
      element.removeEventListener("contextmenu", this.#handleCellContextMenu);
    });
  }

  #handleNewGameClick(
    rows = this.#numberOfRows,
    cols = this.#numberOfCols,
    mines = this.#numberOfMines
  ) {
    this.#removeCellsEventListeners();
    console.log(mines);
    this.#newGame(rows, cols, mines);
  }

  #generateCells() {
    this.#cells.length = 0; //czyszczenie tablicy
    for (let row = 0; row < this.#numberOfRows; row++) {
      this.#cells[row] = [];
      for (let col = 0; col < this.#numberOfCols; col++) {
        this.#cells[row].push(new Cell(col, row));
      }
    }
  }

  #renderBoard() {
    // this.#board.innerHTML= ''; mniej wydajna opcja
    //czyszczenie tablicy
    while (this.#board.firstChild) {
      this.#board.removeChild(this.#board.lastChild);
    }
    this.#cells.flat().forEach((cell) => {
      this.#board.insertAdjacentHTML("beforeend", cell.createElement());
      cell.element = cell.getElement(cell.selector);
    });
  }

  #placeMinesInCells() {
    let minesToPlace = this.#numberOfMines;

    while (minesToPlace) {
      const rowIndex = this.#getRandomInteger(0, this.#numberOfRows - 1);
      const colIndex = this.#getRandomInteger(0, this.#numberOfCols - 1);

      const cell = this.#cells[rowIndex][colIndex];

      const hasCellMine = cell.isMine;
      if (!hasCellMine) {
        cell.addMine();
        minesToPlace--;
      }
    }
  }

  //obsługa kliklnięcia lewym przyciskiem myszy na jedno z pól do gry
  #handleCellClick = (e) => {
    console.log("Klik lewy");
    const target = e.target;
    const rowIndex = parseInt(target.getAttribute("data-y"), 10);
    const colIndex = parseInt(target.getAttribute("data-x"), 10);

    const cell = this.#cells[rowIndex][colIndex];

    this.#clickCell(cell);
  };

  // obsługa kliklnięcia prawym przyciskiem myszy na jedno z pól do gry
  #handleCellContextMenu = (e) => {
    e.preventDefault(); //zapobiegamy wyświetlaniu menu kontekstowego na prawym przycisku myszy
    const target = e.target;
    const rowIndex = parseInt(target.getAttribute("data-y"), 10);
    const colIndex = parseInt(target.getAttribute("data-x"), 10);

    const cell = this.#cells[rowIndex][colIndex];

    if (cell.isReveal || this.#isGameFinished) return;

    if (cell.isFlagged) {
      this.#counter.increment();
      cell.toggleFlag();
      return;
    }
    //warunek uniemożliwiający dodanie więcej flag niż jest min
    if (!!this.#counter.value) {
      //! - zamiana np. 0 na false !!- zamiana 0 na false + negacja na true
      this.#counter.decrement();
      cell.toggleFlag();
    }
  };

  #clickCell(cell) {
    if (this.#isGameFinished || cell.isFlagged) return; //uniemożliwiamy dalsze klikanie w pola po skończonej grze
    if (cell.isMine) {
      this.#endGame(false);
    }
    this.#setCellValue(cell);

    //przy każdym kliknięciu musimy sprawdzic czy wszystkie komórki nie są juz odkryte
    if (this.#revealedCells === this.#cellsToReveal && !this.#isGameFinished) {
      this.#endGame(true);
    }
  }

  #revealMines() {
    this.#cells
      .flat()
      .filter(({ isMine }) => isMine)
      .forEach((cell) => cell.revealCell());
  }

  #setCellValue(cell) {
    let minesCount = 0;
    for (
      let rowIndex = Math.max(cell.y - 1, 0);
      rowIndex <= Math.min(cell.y + 1, this.#numberOfRows - 1);
      rowIndex++
    ) {
      for (
        let colIndex = Math.max(cell.x - 1, 0);
        colIndex <= Math.min(cell.x + 1, this.#numberOfCols - 1);
        colIndex++
      ) {
        if (this.#cells[rowIndex][colIndex].isMine) {
          minesCount++;
        }
      }
    }
    cell.value = minesCount;
    cell.revealCell();
    this.#revealedCells++;

    //gdy pole jest puste - tzn. nie ma wokół żadnych min
    if (!cell.value) {
      for (
        let rowIndex = Math.max(cell.y - 1, 0);
        rowIndex <= Math.min(cell.y + 1, this.#numberOfRows - 1);
        rowIndex++
      ) {
        for (
          let colIndex = Math.max(cell.x - 1, 0);
          colIndex <= Math.min(cell.x + 1, this.#numberOfCols - 1);
          colIndex++
        ) {
          const cell = this.#cells[rowIndex][colIndex];
          if (!this.#cells[rowIndex][colIndex].isReveal) {
            this.#clickCell(cell);
          }
        }
      }
    }
  }

  #setStyles() {
    document.documentElement.style.setProperty(
      "--cells-in-row",
      this.#numberOfCols
    );
  }

  #getRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

window.onload = function () {
  const game = new Game();

  game.initializeGame();
};
