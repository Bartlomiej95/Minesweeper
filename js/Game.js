import { Cell } from "./Cell.js";
import { UI } from "./UI.js";
import { Counter } from "./Counter.js";
import { Timer } from "./Timer.js";

class Game extends UI {
  // # - konwencja, dodanie hasza sprawia, że metody są prywatne

  #config = {
    easy: {
      cols: 8,
      rows: 8,
      mines: 10,
    },
    medium: {
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

  #numberOfRows = null;
  #numberOfCols = null;
  #numberOfMines = null;

  //tablica reprezentująca ilość pól do gry, której ilość jest zależna od poziomu trudności
  #cells = [];
  #cellsElements = null;

  #board = null;

  initializeGame() {
    this.#handleElements();
    this.#counter.init();
    this.#timer.init();
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
    this.#timer.startTimer();

    //zmieniamy wartość css cells-in-row tak aby plansza odpowiednio rozmieściła się na ekranie
    this.#setStyles();

    this.#generateCells();
    this.#renderBoard();

    this.#cellsElements = this.getElements(this.UISelectors.cell);
    this.#addCellsEventListeners();
  }

  #handleElements() {
    //chwytamy element do którego będziemy mogli wkładac komórki
    this.#board = this.getElement(this.UISelectors.board);
  }

  #addCellsEventListeners() {
    // lewy przycisk i prawy przycisk myszy na polach do gry - obsługa

    this.#cellsElements.forEach((element) => {
      element.addEventListener("click", this.#handleCellClick);
      element.addEventListener("contextmenu", this.#handleCellContextMenu);
    });
  }

  #generateCells() {
    for (let row = 0; row < this.#numberOfRows; row++) {
      this.#cells[row] = [];
      for (let col = 0; col < this.#numberOfCols; col++) {
        this.#cells[row].push(new Cell(col, row));
      }
    }
  }

  #renderBoard() {
    this.#cells.flat().forEach((cell) => {
      this.#board.insertAdjacentHTML("beforeend", cell.createElement());
      cell.element = cell.getElement(cell.selector);
    });
  }

  #handleCellClick = (e) => {
    console.log("Klik lewy");
    const target = e.target;
    const rowIndex = parseInt(target.getAttribute("data-y"), 10);
    const colIndex = parseInt(target.getAttribute("data-x"), 10);

    this.#cells[rowIndex][colIndex].revealCell();
  };

  #handleCellContextMenu = (e) => {
    e.preventDefault(); //zapobiegamy wyświetlaniu menu kontekstowego na prawym przycisku myszy
    const target = e.target;
    const rowIndex = parseInt(target.getAttribute("data-y"), 10);
    const colIndex = parseInt(target.getAttribute("data-x"), 10);

    const cell = this.#cells[rowIndex][colIndex];

    if (cell.isReveal) return;

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

  #setStyles() {
    document.documentElement.style.setProperty(
      "--cells-in-row",
      this.#numberOfCols
    );
  }
}

window.onload = function () {
  const game = new Game();

  game.initializeGame();
};
