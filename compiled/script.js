"use strict";
(() => {
  // src/puzzle/cellValue.ts
  var CellValue = /* @__PURE__ */ ((CellValue2) => {
    CellValue2[CellValue2["ZERO"] = 0] = "ZERO";
    CellValue2[CellValue2["ONE"] = 1] = "ONE";
    CellValue2[CellValue2["ANY"] = 2] = "ANY";
    return CellValue2;
  })(CellValue || {});
  ((CellValue2) => {
    const labels = ["O", "I", " "];
    function toString(value) {
      return labels[value];
    }
    CellValue2.toString = toString;
    function next(value) {
      return (value + 1) % 3;
    }
    CellValue2.next = next;
    function opposite(value) {
      if (value === 0 /* ZERO */) return 1 /* ONE */;
      if (value === 1 /* ONE */) return 0 /* ZERO */;
      return 2 /* ANY */;
    }
    CellValue2.opposite = opposite;
  })(CellValue || (CellValue = {}));

  // src/puzzle/cell.ts
  var Cell = class {
    constructor(x, y, value = 2 /* ANY */) {
      this.x = x;
      this.y = y;
      this.value = value;
    }
    user = false;
    toString() {
      return CellValue.toString(this.value);
    }
  };

  // src/puzzle/sequence.ts
  var Sequence = class {
    cells;
    // number of cells with value [zero, one, any]
    counts = [0, 0, 0];
    complete;
    constructor(cells) {
      this.cells = cells;
      for (const c of cells) this.counts[c.value]++;
      this.complete = this.counts[2 /* ANY */] === 0;
    }
    setValueAt(index, oldValue, newValue) {
      this.cells[index].value = newValue;
      this.counts[oldValue]--;
      this.counts[newValue]++;
      this.complete = this.counts[2 /* ANY */] === 0;
    }
  };

  // src/tools/validator.ts
  var Validator = class {
    constructor(puzzle2) {
      this.puzzle = puzzle2;
      this.size = puzzle2.size;
      this.halfSize = this.size / 2;
    }
    size;
    halfSize;
    isSolved() {
      return this.isFilled() && this.isValid();
    }
    isFilled() {
      for (const column of this.puzzle.columns) {
        if (column.counts[2 /* ANY */] > 0) return false;
      }
      return true;
    }
    getInvalidReason() {
      const col2 = this.getFirstInvalidColumn();
      if (col2 !== null) return `Column ${col2 + 1} is invalid`;
      const row2 = this.getFirstInvalidRow();
      if (row2 !== null) return `Row ${row2 + 1} is invalid`;
      const cols = this.getFirstEqualColumns();
      if (cols !== null) return `Columns ${cols[0] + 1} and ${cols[1] + 1} are the same`;
      const rows = this.getFirstEqualRows();
      if (rows !== null) return `Rows ${rows[0] + 1} and ${rows[1] + 1} are the same`;
      return null;
    }
    isValid() {
      const valid = this.getFirstInvalidColumn() === null && this.getFirstInvalidRow() === null && this.getFirstEqualColumns() === null && this.getFirstEqualRows() === null;
      return valid;
    }
    isValidAfterChange(x, y) {
      const valid = this.isValidColumn(x) && this.isValidRow(y) && !this.columnEqualsAny(x) && !this.rowEqualsAny(y);
      return valid;
    }
    isValidAfterChanges(changes) {
      const affectedColumns = new Set(changes.map((c) => c.x));
      const affectedRows = new Set(changes.map((c) => c.y));
      for (const x of affectedColumns) {
        if (!this.isValidColumn(x) || this.columnEqualsAny(x)) {
          return false;
        }
      }
      for (const y of affectedRows) {
        if (!this.isValidRow(y) || this.rowEqualsAny(y)) {
          return false;
        }
      }
      return true;
    }
    getFirstInvalidColumn() {
      for (let x = 0; x < this.size; x++) {
        if (!this.isValidColumn(x)) return x;
      }
      return null;
    }
    getFirstInvalidRow() {
      for (let y = 0; y < this.size; y++) {
        if (!this.isValidRow(y)) return y;
      }
      return null;
    }
    isValidColumn(x) {
      return this.isValidSequence(this.puzzle.columns[x]);
    }
    isValidRow(y) {
      return this.isValidSequence(this.puzzle.rows[y]);
    }
    isValidSequence(sequence) {
      if (sequence.counts[0 /* ZERO */] > this.halfSize || sequence.counts[1 /* ONE */] > this.halfSize) {
        return false;
      }
      for (let i = 1; i < sequence.cells.length - 1; i++) {
        const a = sequence.cells[i - 1].value;
        const b = sequence.cells[i].value;
        const c = sequence.cells[i + 1].value;
        if (a != 2 /* ANY */ && a == b && b == c) {
          return false;
        }
      }
      return true;
    }
    getFirstEqualColumns() {
      for (let x = 0; x < this.size; x++) {
        for (let otherX = x + 1; otherX < this.size; otherX++) {
          if (this.columnsAreEqual(x, otherX)) return [x, otherX];
        }
      }
      return null;
    }
    getFirstEqualRows() {
      for (let y = 0; y < this.size; y++) {
        for (let otherY = y + 1; otherY < this.size; otherY++) {
          if (this.rowsAreEqual(y, otherY)) return [y, otherY];
        }
      }
      return null;
    }
    columnEqualsAny(x) {
      for (let ox = 0; ox < this.size; ox++) {
        if (ox !== x && this.columnsAreEqual(x, ox)) return true;
      }
      return false;
    }
    rowEqualsAny(y) {
      for (let oy = 0; oy < this.size; oy++) {
        if (oy !== y && this.rowsAreEqual(y, oy)) return true;
      }
      return false;
    }
    columnsAreEqual(xOne, xTwo) {
      return this.cellArraysAreEqual(this.puzzle.columns[xOne], this.puzzle.columns[xTwo]);
    }
    rowsAreEqual(yOne, yTwo) {
      return this.cellArraysAreEqual(this.puzzle.rows[yOne], this.puzzle.rows[yTwo]);
    }
    cellArraysAreEqual(a, b) {
      if (!a.complete || !b.complete) {
        return false;
      }
      for (let i = 0; i < a.cells.length; i++) {
        if (a.cells[i].value !== b.cells[i].value) return false;
      }
      return true;
    }
  };

  // src/puzzle/change.ts
  var Change = class {
    constructor(x, y, oldValue, newValue, reason) {
      this.x = x;
      this.y = y;
      this.oldValue = oldValue;
      this.newValue = newValue;
      this.reason = reason;
    }
    apply(puzzle2) {
      puzzle2.setValueAt(this.x, this.y, this.newValue);
    }
  };

  // src/puzzle/puzzle.ts
  var Puzzle = class {
    size;
    halfSize;
    columns;
    rows;
    validator;
    constructor(size) {
      if (size % 2 !== 0) {
        throw new Error("Grid must have an even size");
      }
      this.size = size;
      this.halfSize = size / 2;
      this.columns = Array.from(
        { length: size },
        (_, x) => new Sequence(Array.from({ length: size }, (_2, y) => new Cell(x, y)))
      );
      this.rows = Array.from(
        { length: size },
        (_, y) => new Sequence(this.columns.map((column) => column.cells[y]))
      );
      this.validator = new Validator(this);
    }
    getCell(x, y) {
      return this.columns[x].cells[y];
    }
    get(x, y) {
      return this.columns[x].cells[y].value;
    }
    setValueAt(x, y, newValue) {
      const oldValue = this.get(x, y);
      if (oldValue === newValue) {
        return;
      }
      this.columns[x].setValueAt(y, oldValue, newValue);
      this.rows[y].setValueAt(x, oldValue, newValue);
    }
    setNextValueAt(x, y) {
      this.setValueAt(x, y, CellValue.next(this.get(x, y)));
    }
    clearAll() {
      for (let x = 0; x < this.size; x++) {
        for (let y = 0; y < this.size; y++) {
          this.setValueAt(x, y, 2 /* ANY */);
        }
      }
    }
    toString() {
      const rows = [];
      for (let y = 0; y < this.size; y++) {
        let row2 = "";
        for (let x = 0; x < this.size; x++) {
          row2 += this.columns[x].cells[y].toString();
        }
        rows.push(row2);
      }
      return rows.join("\n");
    }
    getNumberOfCells() {
      return this.size ** 2;
    }
    getValueCountInColumn(x, matchValue) {
      return this.columns[x].counts[matchValue];
    }
    getValueCountInRow(y, matchValue) {
      return this.rows[y].counts[matchValue];
    }
    getRemainingValueCountInColumn(x, matchValue) {
      return this.halfSize - this.getValueCountInColumn(x, matchValue);
    }
    getRemainingValueCountInRow(y, matchValue) {
      return this.halfSize - this.getValueCountInRow(y, matchValue);
    }
    getAllCells() {
      const cells = [];
      for (let x = 0; x < this.size; x++) {
        for (let y = 0; y < this.size; y++) {
          cells.push(this.columns[x].cells[y]);
        }
      }
      return cells;
    }
    getUnsolvedCells() {
      const cells = [];
      for (let x = 0; x < this.size; x++) {
        for (let y = 0; y < this.size; y++) {
          if (this.columns[x].cells[y].value === 2 /* ANY */) {
            cells.push(this.columns[x].cells[y]);
          }
        }
      }
      return cells;
    }
    reset() {
      const changes = [];
      for (let x = 0; x < this.size; x++) {
        for (let y = 0; y < this.size; y++) {
          const cell = this.getCell(x, y);
          if (cell.user) {
            changes.push(new Change(x, y, cell.value, 2 /* ANY */, 0 /* Reset */));
            this.setValueAt(x, y, 2 /* ANY */);
          }
        }
      }
      return changes;
    }
  };

  // src/tools/solver.ts
  var Solver = class _Solver {
    static undo(puzzle2, changes) {
      for (const change of changes) {
        puzzle2.setValueAt(change.x, change.y, change.oldValue);
      }
    }
    static trySolve(puzzle2) {
      return _Solver.solveAllSequentials(puzzle2);
    }
    static solveAllSequentials(puzzle2) {
      const changes = [];
      let newChanges = [];
      let foundNewChanges = true;
      while (foundNewChanges && puzzle2.validator.isValidAfterChanges(newChanges)) {
        newChanges = [];
        for (let i = 0; i < puzzle2.size; i++) {
          newChanges.push(...this.solveDoubleTriple(puzzle2.columns[i], puzzle2));
          newChanges.push(...this.solveDoubleTriple(puzzle2.rows[i], puzzle2));
          newChanges.push(...this.solveSingleValueRemaining(puzzle2.columns[i], puzzle2));
          newChanges.push(...this.solveSingleValueRemaining(puzzle2.rows[i], puzzle2));
        }
        changes.push(...newChanges);
        foundNewChanges = newChanges.length > 0;
      }
      return changes;
    }
    static solveDoubleTriple(sequence, puzzle2) {
      if (sequence.counts[2 /* ANY */] <= 1) {
        return [];
      }
      const changes = [];
      let cellA = sequence.cells[0];
      let cellB = sequence.cells[1];
      let valueA = cellA.value;
      let valueB = cellB.value;
      for (let i = 2; i < sequence.cells.length; i++) {
        const cellC = sequence.cells[i];
        let valueC = cellC.value;
        if (valueA === 2 /* ANY */ && valueB !== 2 /* ANY */ && valueB === valueC) {
          const change = new Change(cellA.x, cellA.y, 2 /* ANY */, CellValue.opposite(valueB), 2 /* BesidesDouble */);
          change.apply(puzzle2);
          changes.push(change);
          valueA = change.newValue;
        } else if (valueB === 2 /* ANY */ && valueA !== 2 /* ANY */ && valueA === valueC) {
          const change = new Change(cellB.x, cellB.y, 2 /* ANY */, CellValue.opposite(valueA), 2 /* BesidesDouble */);
          change.apply(puzzle2);
          changes.push(change);
          valueB = change.newValue;
        } else if (valueC === 2 /* ANY */ && valueA !== 2 /* ANY */ && valueA === valueB) {
          const change = new Change(cellC.x, cellC.y, 2 /* ANY */, CellValue.opposite(valueB), 3 /* BetweenSame */);
          change.apply(puzzle2);
          changes.push(change);
          valueC = change.newValue;
        }
        cellA = cellB;
        cellB = cellC;
        valueA = valueB;
        valueB = valueC;
      }
      return changes;
    }
    static solveSingleValueRemaining(sequence, puzzle2) {
      const zeroCount = sequence.counts[0 /* ZERO */];
      const oneCount = sequence.counts[1 /* ONE */];
      const zeroComplete = zeroCount === puzzle2.halfSize;
      const oneComplete = oneCount === puzzle2.halfSize;
      if (zeroComplete && oneComplete) {
        return [];
      }
      if (zeroComplete || oneComplete) {
        const changes = [];
        const remainingValue = zeroComplete ? 1 /* ONE */ : 0 /* ZERO */;
        for (const cell of sequence.cells) {
          if (cell.value === 2 /* ANY */) {
            const change = new Change(cell.x, cell.y, 2 /* ANY */, remainingValue, 4 /* SingleValueRemaining */);
            change.apply(puzzle2);
            changes.push(change);
          }
        }
        return changes;
      }
      return [];
    }
    static allSimilarSequences(puzzle2) {
      const similarColumns = [];
      const similarRows = [];
      for (let i = 0; i < puzzle2.size; i++) {
        similarColumns.push(_Solver.similarSequences(puzzle2.columns, i, puzzle2.halfSize));
        similarRows.push(_Solver.similarSequences(puzzle2.rows, i, puzzle2.halfSize));
      }
      return { columns: similarColumns, rows: similarRows };
    }
    static similarSequences(sequences, selected, gapThreshold) {
      const target = sequences[selected];
      const similar = [];
      if (target.counts[2 /* ANY */] > gapThreshold) {
        return similar;
      }
      for (let i = 0; i < sequences.length; i++) {
        if (i !== selected && sequences[i].counts[2 /* ANY */] <= gapThreshold) {
          const other = sequences[i];
          let isSimilar = true;
          for (let j = 0; j < target.cells.length; j++) {
            const valueA = target.cells[j].value;
            const valueB = other.cells[j].value;
            if (valueA !== 2 /* ANY */ && valueB !== 2 /* ANY */ && valueA !== valueB) {
              isSimilar = false;
              break;
            }
          }
          if (isSimilar) {
            similar.push(i);
          }
        }
      }
      return similar;
    }
  };

  // src/tools/generator.ts
  var PuzzleGenerator = class _PuzzleGenerator {
    static generate(size, emptyRatio2, skew) {
      const puzzle2 = _PuzzleGenerator.createSolvedPuzzle(size);
      _PuzzleGenerator.emptyCells(puzzle2, emptyRatio2, skew);
      _PuzzleGenerator.setUserAttribute(puzzle2);
      return puzzle2;
    }
    static emptyCells(puzzle2, emptyRatio2, skew) {
      const cells = puzzle2.getAllCells();
      const targetEmpty = Math.floor(puzzle2.getNumberOfCells() * emptyRatio2);
      if (skew * targetEmpty > cells.length / 2) {
        console.warn(`Skew ${skew} is too high for empty ratio ${emptyRatio2}, adjusting to fit.`);
        skew = cells.length / 2 / targetEmpty;
      }
      const skewZeroPreferred = Math.random() < 0.5;
      const skewZero = skewZeroPreferred ? skew : 1 - skew;
      const skewOne = skewZeroPreferred ? 1 - skew : skew;
      const targetEmptyZero = Math.ceil(targetEmpty * skewZero);
      const targetEmptyOne = Math.ceil(targetEmpty * skewOne);
      let emptyZero = 0;
      let emptyOne = 0;
      while (emptyZero + emptyOne < targetEmpty && cells.length > 0) {
        const randomIndex = Math.floor(Math.random() * cells.length);
        const randomCell = cells.splice(randomIndex, 1)[0];
        if (randomCell.value === 2 /* ANY */) {
          continue;
        }
        const needsZero = randomCell.value === 0 /* ZERO */ && emptyZero < targetEmptyZero;
        const needsOne = randomCell.value === 1 /* ONE */ && emptyOne < targetEmptyOne;
        if (needsZero || needsOne) {
          if (randomCell.value === 0 /* ZERO */) {
            emptyZero++;
          } else {
            emptyOne++;
          }
          puzzle2.setValueAt(randomCell.x, randomCell.y, 2 /* ANY */);
        }
      }
    }
    static setUserAttribute(puzzle2) {
      const cells = puzzle2.getAllCells();
      for (const cell of cells) {
        cell.user = cell.value === 2 /* ANY */;
      }
    }
    static createSolvedPuzzle(size) {
      const puzzle2 = new Puzzle(size);
      const solved = _PuzzleGenerator.solveAndGuess(puzzle2, puzzle2.getUnsolvedCells());
      if (!solved) {
        throw new Error("Failed to generate a solved puzzle.");
      }
      return puzzle2;
    }
    static checkValid(puzzle2) {
      if (!puzzle2.validator.isValid()) {
        return false;
      }
      for (const row2 of puzzle2.rows) {
        for (const cell of row2.cells) {
          if (cell.value === 2 /* ANY */) {
            console.warn("Generator produced an unsolved solution, continuing.");
            return false;
          }
        }
      }
      console.log(`Solved puzzle:
${puzzle2.toString()}`);
      return true;
    }
    static solveAndGuess(puzzle2, unsolved) {
      if (unsolved.length === 0) {
        return _PuzzleGenerator.checkValid(puzzle2);
      }
      const solveSteps = Solver.trySolve(puzzle2);
      for (const step of solveSteps) {
        unsolved = unsolved.filter((cell) => cell.x != step.x || cell.y != step.y);
      }
      if (unsolved.length === 0) {
        return _PuzzleGenerator.checkValid(puzzle2);
      }
      const guessIndex = Math.floor(Math.random() * unsolved.length);
      const guessCell = unsolved[guessIndex];
      const valueOptions = Math.random() < 0.5 ? [0 /* ZERO */, 1 /* ONE */] : [1 /* ONE */, 0 /* ZERO */];
      unsolved.splice(guessIndex, 1);
      for (const value of valueOptions) {
        puzzle2.setValueAt(guessCell.x, guessCell.y, value);
        if (puzzle2.validator.isValidAfterChange(guessCell.x, guessCell.y)) {
          const solveSteps2 = Solver.trySolve(puzzle2);
          for (const step of solveSteps2) {
            unsolved = unsolved.filter((cell) => cell.x != step.x || cell.y != step.y);
          }
          if (_PuzzleGenerator.solveAndGuess(puzzle2, unsolved)) {
            return true;
          } else {
            Solver.undo(puzzle2, solveSteps2);
            unsolvedAdd(solveSteps2);
          }
        }
      }
      puzzle2.setValueAt(guessCell.x, guessCell.y, 2 /* ANY */);
      unsolved.push(guessCell);
      Solver.undo(puzzle2, solveSteps);
      unsolvedAdd(solveSteps);
      return false;
      function unsolvedAdd(solveSteps2) {
        for (const step of solveSteps2) {
          unsolved.push(puzzle2.getCell(step.x, step.y));
        }
      }
    }
  };

  // src/tools/history.ts
  var History = class {
    undoStack = [];
    redoStack = [];
    puzzle;
    constructor(puzzle2) {
      this.puzzle = puzzle2;
    }
    recordChange(change) {
      const previousChanges = this.undoStack[this.undoStack.length - 1];
      if (previousChanges && previousChanges.length === 1) {
        const previousChange = previousChanges[0];
        if (previousChange.x === change.x && previousChange.y === change.y && previousChange.reason === change.reason) {
          if (previousChange.oldValue === change.newValue) {
            this.undoStack.pop();
          } else {
            previousChange.newValue = change.newValue;
          }
          this.redoStack = [];
          return;
        }
      }
      this.recordChangeSet([change]);
    }
    recordChangeSet(changes) {
      if (changes.length === 0) return;
      this.undoStack.push(changes);
      this.redoStack = [];
    }
    undo() {
      if (!this.canUndo()) {
        return false;
      }
      const changeSet = this.undoStack.pop();
      if (changeSet) {
        for (let i = changeSet.length - 1; i >= 0; i--) {
          const change = changeSet[i];
          this.puzzle.setValueAt(change.x, change.y, change.oldValue);
        }
        this.redoStack.push(changeSet);
        return true;
      }
      return false;
    }
    redo() {
      if (!this.canRedo()) {
        return false;
      }
      const changeSet = this.redoStack.pop();
      if (changeSet) {
        for (const change of changeSet) {
          this.puzzle.setValueAt(change.x, change.y, change.newValue);
        }
        this.undoStack.push(changeSet);
        return true;
      }
      return false;
    }
    canUndo() {
      return this.undoStack.length > 0;
    }
    canRedo() {
      return this.redoStack.length > 0;
    }
    clear() {
      this.undoStack = [];
      this.redoStack = [];
    }
  };

  // src/ui/ui.ts
  var DEFAULT_PUZZLE_SIZE = 10;
  var MIN_PUZZLE_SIZE = 6;
  var MAX_PUZZLE_SIZE = 16;
  var PUZZLE_SIZE_STEP = 2;
  var DEFAULT_EMPTY_RATIO = 0.5;
  var MIN_EMPTY_RATIO = 0.35;
  var MAX_EMPTY_RATIO = 0.65;
  var EMPTY_RATIO_STEP = 0.05;
  var DEFAULT_EMPTY_SKEW = 0.7;
  var MIN_EMPTY_SKEW = 0.5;
  var MAX_EMPTY_SKEW = 0.9;
  var EMPTY_SKEW_STEP = 0.1;
  var puzzleSize = DEFAULT_PUZZLE_SIZE;
  var emptyRatio = DEFAULT_EMPTY_RATIO;
  var emptySkew = DEFAULT_EMPTY_SKEW;
  var CELL_CLASS = {
    [0 /* ZERO */]: "cell-zero",
    [1 /* ONE */]: "cell-one",
    [2 /* ANY */]: "cell-any"
  };
  var puzzle;
  var history;
  var appElement;
  var generating = false;
  var showHints = false;
  var selectedType = null;
  var selectedIndex = null;
  var similarIndices = [];
  function row() {
    const el = document.createElement("div");
    el.className = "row";
    return el;
  }
  function col() {
    const el = document.createElement("div");
    el.className = "column";
    return el;
  }
  function box(content = "") {
    const el = document.createElement("div");
    el.className = "box";
    el.textContent = content;
    return el;
  }
  function cellButton(x, y) {
    const cell = puzzle.getCell(x, y);
    const button = document.createElement("button");
    button.className = `cell-button ${CELL_CLASS[cell.value]}`;
    button.textContent = cell.toString();
    if (cell.user) {
      button.classList.add("user-cell");
      button.addEventListener("click", () => {
        const oldValue = puzzle.get(x, y);
        const newValue = CellValue.next(oldValue);
        const change = new Change(x, y, oldValue, newValue, 1 /* UserInput */);
        history.recordChange(change);
        puzzle.setValueAt(x, y, newValue);
        render();
      });
    }
    return button;
  }
  function remainingTextRow(y) {
    const zeroCount = puzzle.getRemainingValueCountInRow(y, 0 /* ZERO */);
    const oneCount = puzzle.getRemainingValueCountInRow(y, 1 /* ONE */);
    return remainingText(zeroCount, oneCount);
  }
  function remainingTextColumn(x) {
    const zeroCount = puzzle.getRemainingValueCountInColumn(x, 0 /* ZERO */);
    const oneCount = puzzle.getRemainingValueCountInColumn(x, 1 /* ONE */);
    return remainingText(zeroCount, oneCount);
  }
  function remainingText(zeroCount, oneCount) {
    if (zeroCount === 0 && oneCount === 0) return "";
    const zeroText = zeroCount == 0 ? "." : zeroCount.toString();
    const oneText = oneCount == 0 ? "." : oneCount.toString();
    return `${zeroText} / ${oneText}`;
  }
  function renderPuzzle(parentElement) {
    const size = puzzle.size;
    const outerRow = row();
    const allSimilarSequences = Solver.allSimilarSequences(puzzle);
    const indexColumn = col();
    indexColumn.appendChild(box());
    for (let y = 0; y < size; y++) {
      const showSimilarRows = showHints && allSimilarSequences.rows[y].length > 0;
      const rowNumber = showSimilarRows ? box(allSimilarSequences.rows[y].length.toString()) : box();
      rowNumber.classList.add("helper-cell");
      rowNumber.style.cursor = "pointer";
      if (selectedType === "row" && selectedIndex === y) {
        rowNumber.classList.add("indicator-selected");
      } else if (selectedType === "row" && similarIndices.includes(y)) {
        rowNumber.classList.add("indicator-similar");
      }
      rowNumber.addEventListener("click", () => {
        if (!showHints || selectedType === "row" && selectedIndex === y) {
          selectedType = null;
          selectedIndex = null;
          similarIndices = [];
        } else {
          selectedType = "row";
          selectedIndex = y;
          similarIndices = Solver.similarSequences(puzzle.rows, y, puzzle.halfSize);
        }
        render();
      });
      indexColumn.appendChild(rowNumber);
    }
    outerRow.appendChild(indexColumn);
    for (let x = 0; x < size; x++) {
      const column = col();
      const showSimilarColumns = showHints && allSimilarSequences.columns[x].length > 0;
      const header = showSimilarColumns ? box(allSimilarSequences.columns[x].length.toString()) : box();
      header.classList.add("helper-cell");
      header.style.cursor = "pointer";
      if (selectedType === "column" && selectedIndex === x) {
        header.classList.add("indicator-selected");
      } else if (selectedType === "column" && similarIndices.includes(x)) {
        header.classList.add("indicator-similar");
      }
      header.addEventListener("click", () => {
        if (!showHints || selectedType === "column" && selectedIndex === x) {
          selectedType = null;
          selectedIndex = null;
          similarIndices = [];
        } else {
          selectedType = "column";
          selectedIndex = x;
          similarIndices = Solver.similarSequences(puzzle.columns, x, puzzle.halfSize);
        }
        render();
      });
      column.appendChild(header);
      for (let y = 0; y < size; y++) {
        column.appendChild(cellButton(x, y));
      }
      const text = showHints ? remainingTextColumn(x) : "";
      const remaining = box(text);
      remaining.classList.add("helper-cell");
      column.appendChild(remaining);
      outerRow.appendChild(column);
    }
    const remainingColumn = col();
    remainingColumn.appendChild(box());
    for (let y = 0; y < size; y++) {
      const text = showHints ? remainingTextRow(y) : "";
      const remaining = box(text);
      remaining.classList.add("helper-cell");
      remainingColumn.appendChild(remaining);
    }
    outerRow.appendChild(remainingColumn);
    parentElement.appendChild(outerRow);
  }
  function genericButton(label, id, onClick, disabled = false) {
    const button = document.createElement("button");
    button.id = id;
    button.textContent = label;
    button.disabled = disabled;
    button.addEventListener("click", onClick);
    return button;
  }
  function sliderRow(label, min, max, step, value, format, onChange) {
    const container = document.createElement("div");
    container.className = "slider-row";
    const labelElement = document.createElement("label");
    labelElement.textContent = label;
    container.appendChild(labelElement);
    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = min.toString();
    slider.max = max.toString();
    slider.step = step.toString();
    slider.value = value.toString();
    container.appendChild(slider);
    const display = document.createElement("span");
    display.className = "slider-value";
    display.textContent = format(value);
    container.appendChild(display);
    slider.addEventListener("input", () => {
      const value2 = parseFloat(slider.value);
      display.textContent = format(value2);
      onChange(value2);
    });
    return container;
  }
  function renderPuzzleCreation(parentElement) {
    parentElement.appendChild(sliderRow(
      "Puzzle size:",
      MIN_PUZZLE_SIZE,
      MAX_PUZZLE_SIZE,
      PUZZLE_SIZE_STEP,
      puzzleSize,
      (v) => v.toString(),
      (v) => {
        puzzleSize = v;
      }
    ));
    parentElement.appendChild(sliderRow(
      "Empty cells:",
      MIN_EMPTY_RATIO,
      MAX_EMPTY_RATIO,
      EMPTY_RATIO_STEP,
      emptyRatio,
      (v) => Math.round(v * 100) + "%",
      (v) => {
        emptyRatio = v;
      }
    ));
    parentElement.appendChild(sliderRow(
      "Empty skew:",
      MIN_EMPTY_SKEW,
      MAX_EMPTY_SKEW,
      EMPTY_SKEW_STEP,
      emptySkew,
      (v) => `${Math.round(v * 100)}/${Math.round((1 - v) * 100)}`,
      (v) => {
        emptySkew = v;
      }
    ));
    parentElement.appendChild(genericButton("New puzzle", "new-puzzle-button", () => generatePuzzle()));
  }
  function renderValidity(parentElement, puzzle2) {
    const el = document.createElement("div");
    if (puzzle2.validator.isSolved()) {
      el.textContent = "Congratulations, you solved the puzzle!";
      el.className = `validity solved`;
    } else {
      const invalidReason = puzzle2.validator.getInvalidReason();
      el.className = `validity ${invalidReason ? "invalid" : "valid"} `;
      el.textContent = invalidReason ?? "Valid";
    }
    parentElement.appendChild(el);
  }
  function renderPuzzleButtons(parentElement) {
    const showHintsButton = genericButton(showHints ? "Hide hints" : "Show hints", "hints-button", () => {
      showHints = !showHints;
      selectedType = null;
      selectedIndex = null;
      similarIndices = [];
      render();
    });
    if (showHints) showHintsButton.classList.add("active");
    parentElement.appendChild(showHintsButton);
    parentElement.appendChild(genericButton("Undo", "undo-button", () => {
      history.undo();
      render();
    }, !history.canUndo()));
    parentElement.appendChild(genericButton("Redo", "redo-button", () => {
      history.redo();
      render();
    }, !history.canRedo()));
    parentElement.appendChild(genericButton("Solve", "solve-button", () => {
      const changes = Solver.trySolve(puzzle);
      history.recordChangeSet(changes);
      render();
    }));
    parentElement.appendChild(genericButton("Reset", "reset-button", () => {
      const changes = puzzle.reset();
      history.recordChangeSet(changes);
      render();
    }));
  }
  function render() {
    appElement.innerHTML = "";
    const outerColumn = col();
    outerColumn.classList.add("app-container");
    renderPuzzleCreation(outerColumn);
    renderPuzzle(outerColumn);
    renderValidity(outerColumn, puzzle);
    renderPuzzleButtons(outerColumn);
    appElement.appendChild(outerColumn);
  }
  function generatePuzzle() {
    if (!generating) {
      generating = true;
      const newPuzzleButton = document.querySelector(".new-puzzle-button");
      if (newPuzzleButton) {
        newPuzzleButton.innerHTML = "Generating...";
        newPuzzleButton.disabled = true;
      }
      puzzle = PuzzleGenerator.generate(puzzleSize, emptyRatio, emptySkew);
      history = new History(puzzle);
      selectedType = null;
      selectedIndex = null;
      similarIndices = [];
      render();
      generating = false;
      if (newPuzzleButton) {
        newPuzzleButton.innerHTML = "New puzzle";
        newPuzzleButton.disabled = false;
      }
    }
  }
  document.addEventListener("DOMContentLoaded", () => {
    appElement = document.getElementById("app");
    generatePuzzle();
  });
})();
