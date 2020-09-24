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

  #isGameFinished = false;
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
    this.#placeMinesInCells();

    this.#cellsElements = this.getElements(this.UISelectors.cell);
    this.#addCellsEventListeners();
  }

  #endGame(isWin) {
    this.#isGameFinished = true;
    this.#timer.stopTimer();

    if (!isWin) {
      //przegrana
      this.#revealMines(); //gdy gracz przegrywa pokazują mu się wszystkie komórki z minami
    }
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

  #placeMinesInCells() {
    let minesToPlace = this.#numberOfMines;

    while (minesToPlace) {
      const rowIndex = this.#getRandomInteger(0, this.#numberOfRows - 1);
      const colIndex = this.#getRandomInteger(0, this.#numberOfCols - 1);

      const cell = this.#cells[colIndex][rowIndex];

      const hasCellMine = cell.isMine;
      if (!hasCellMine) {
        cell.addMine();
        minesToPlace--;
      }
    }
  }

  #handleCellClick = (e) => {
    console.log("Klik lewy");
    const target = e.target;
    const rowIndex = parseInt(target.getAttribute("data-y"), 10);
    const colIndex = parseInt(target.getAttribute("data-x"), 10);

    const cell = this.#cells[rowIndex][colIndex];

    this.#clickCell(cell);
  };

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
    cell.revealCell();
  }

  #revealMines() {
    this.#cells
      .flat()
      .filter(({ isMine }) => isMine)
      .forEach((cell) => cell.revealCell());
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
