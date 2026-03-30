import { CellValue } from "@puzzle/cellValue";
import { Puzzle } from "@puzzle/puzzle";
import { PuzzleGenerator } from "@tools/generator";
import { Solver } from "@tools/solver";
import { History } from "@tools/history";
import { Change, ChangeReason } from "@puzzle/change";

const DEFAULT_PUZZLE_SIZE = 10;
const MIN_PUZZLE_SIZE = 6;
const MAX_PUZZLE_SIZE = 16; // more than 16 can be slow
const PUZZLE_SIZE_STEP = 2;

const DEFAULT_EMPTY_RATIO = 0.5;
const MIN_EMPTY_RATIO = 0.35;
const MAX_EMPTY_RATIO = 0.65;
const EMPTY_RATIO_STEP = 0.05;

const DEFAULT_EMPTY_SKEW = 0.7;
const MIN_EMPTY_SKEW = 0.5;
const MAX_EMPTY_SKEW = 0.9;
const EMPTY_SKEW_STEP = 0.1;

let puzzleSize: number = DEFAULT_PUZZLE_SIZE;
let emptyRatio: number = DEFAULT_EMPTY_RATIO;
let emptySkew: number = DEFAULT_EMPTY_SKEW;

const CELL_CLASS: Record<CellValue, string> = {
    [CellValue.ZERO]: "cell-zero",
    [CellValue.ONE]: "cell-one",
    [CellValue.ANY]: "cell-any",
};

let puzzle: Puzzle;
let history: History;
let appElement: HTMLElement;
let generating: boolean = false;
let showHints: boolean = false;

let selectedType: 'row' | 'column' | null = null;
let selectedIndex: number | null = null;
let similarIndices: number[] = [];

function row(): HTMLElement {
    const el = document.createElement("div");
    el.className = "row";
    return el;
}

function col(): HTMLElement {
    const el = document.createElement("div");
    el.className = "column";
    return el;
}

function box(content = ""): HTMLElement {
    const el = document.createElement("div");
    el.className = "box";
    el.textContent = content;
    return el;
}

function cellButton(x: number, y: number): HTMLButtonElement {
    const cell = puzzle.getCell(x, y);
    const button = document.createElement("button");
    button.className = `cell-button ${CELL_CLASS[cell.value]}`;
    button.textContent = cell.toString();
    if (cell.user) {
        button.classList.add("user-cell");
        button.addEventListener("click", () => {
            const oldValue = puzzle.get(x, y);
            const newValue = CellValue.next(oldValue);
            const change = new Change(x, y, oldValue, newValue, ChangeReason.UserInput);
            history.recordChange(change);
            puzzle.setValueAt(x, y, newValue);
            render();
        });
    }
    return button;
}

function remainingTextRow(y: number): string {
    const zeroCount = puzzle.getRemainingValueCountInRow(y, CellValue.ZERO);
    const oneCount = puzzle.getRemainingValueCountInRow(y, CellValue.ONE);
    return remainingText(zeroCount, oneCount);
}

function remainingTextColumn(x: number): string {
    const zeroCount = puzzle.getRemainingValueCountInColumn(x, CellValue.ZERO);
    const oneCount = puzzle.getRemainingValueCountInColumn(x, CellValue.ONE);
    return remainingText(zeroCount, oneCount);
}

function remainingText(zeroCount: number, oneCount: number): string {
    if (zeroCount === 0 && oneCount === 0) return "";
    const zeroText = zeroCount == 0 ? "." : zeroCount.toString();
    const oneText = oneCount == 0 ? "." : oneCount.toString();
    return `${zeroText} / ${oneText}`;
}

function renderPuzzle(parentElement: HTMLElement) {
    const size = puzzle.size;
    const outerRow = row();

    const allSimilarSequences = Solver.allSimilarSequences(puzzle);

    // row-index column (empty header + row numbers)
    const indexColumn = col();
    indexColumn.appendChild(box());
    for (let y = 0; y < size; y++) {
        const showSimilarRows = showHints && allSimilarSequences.rows[y].length > 0;
        const rowNumber = showSimilarRows ? box((allSimilarSequences.rows[y].length).toString()) : box();
        rowNumber.classList.add("helper-cell");
        rowNumber.style.cursor = "pointer";
        if (selectedType === 'row' && selectedIndex === y) {
            rowNumber.classList.add("indicator-selected");
        } else if (selectedType === 'row' && similarIndices.includes(y)) {
            rowNumber.classList.add("indicator-similar");
        }
        rowNumber.addEventListener("click", () => {
            if (!showHints || (selectedType === 'row' && selectedIndex === y)) {
                selectedType = null;
                selectedIndex = null;
                similarIndices = [];
            } else {
                selectedType = 'row';
                selectedIndex = y;
                similarIndices = Solver.similarSequences(puzzle.rows, y, puzzle.halfSize);
            }
            render();
        });
        indexColumn.appendChild(rowNumber);
    }
    outerRow.appendChild(indexColumn);

    // one column per puzzle column x
    for (let x = 0; x < size; x++) {
        const column = col();
        const showSimilarColumns = showHints && allSimilarSequences.columns[x].length > 0;
        const header = showSimilarColumns ? box(allSimilarSequences.columns[x].length.toString()) : box();
        header.classList.add("helper-cell");
        header.style.cursor = "pointer";
        if (selectedType === 'column' && selectedIndex === x) {
            header.classList.add("indicator-selected");
        } else if (selectedType === 'column' && similarIndices.includes(x)) {
            header.classList.add("indicator-similar");
        }
        header.addEventListener("click", () => {
            if (!showHints || (selectedType === 'column' && selectedIndex === x)) {
                selectedType = null;
                selectedIndex = null;
                similarIndices = [];
            } else {
                selectedType = 'column';
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

    // column with empty header and remaining counts per row
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

function genericButton(label: string, id: string, onClick: () => void, disabled = false): HTMLButtonElement {
    const button = document.createElement("button");
    button.id = id;
    button.className = "generic-button";
    button.textContent = label;
    button.disabled = disabled;
    button.addEventListener("click", onClick);
    return button;
}

function sliderRow(label: string, min: number, max: number, step: number, value: number, format: (v: number) => string, onChange: (v: number) => void): HTMLElement {
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
        const value = parseFloat(slider.value);
        display.textContent = format(value);
        onChange(value);
    });

    return container;
}

function renderPuzzleCreation(parentElement: HTMLElement): void {
    parentElement.appendChild(sliderRow(
        "Puzzle size:", MIN_PUZZLE_SIZE, MAX_PUZZLE_SIZE, PUZZLE_SIZE_STEP, puzzleSize,
        (v) => v.toString(),
        (v) => { puzzleSize = v; }
    ));
    parentElement.appendChild(sliderRow(
        "Empty cells:", MIN_EMPTY_RATIO, MAX_EMPTY_RATIO, EMPTY_RATIO_STEP, emptyRatio,
        (v) => Math.round(v * 100) + "%",
        (v) => { emptyRatio = v; }
    ));
    parentElement.appendChild(sliderRow(
        "Empty skew:", MIN_EMPTY_SKEW, MAX_EMPTY_SKEW, EMPTY_SKEW_STEP, emptySkew,
        (v) => `${Math.round(v * 100)}/${Math.round((1 - v) * 100)}`,
        (v) => { emptySkew = v; }
    ));

    parentElement.appendChild(genericButton("New puzzle", "new-puzzle-button", () => generatePuzzle()));
}

function renderValidity(parentElement: HTMLElement, puzzle: Puzzle): void {
    const invalidReason = puzzle.validator.getInvalidReason();


    const validityEl = document.createElement("div");
    validityEl.className = `validity ${invalidReason ? "invalid" : "valid"}`;
    validityEl.textContent = invalidReason ?? "Valid";
    parentElement.appendChild(validityEl);

    if (puzzle.validator.isSolved()) {
        const el = document.createElement("div");
        el.textContent = "Congratulations, you solved the puzzle!";
        parentElement.appendChild(el);
    }
}

function renderPuzzleButtons(parentElement: HTMLElement): void {
    const showHintsButton = genericButton(showHints ? "Hide hints" : "Show hints", "hints-button", () => {
        showHints = !showHints;
        selectedType = null;
        selectedIndex = null;
        similarIndices = [];
        render();
    });
    if (showHints) showHintsButton.classList.add("active");
    parentElement.appendChild(showHintsButton);

    parentElement.appendChild(genericButton("Undo", "undo-button", () => { history.undo(); render(); }, !history.canUndo()));
    parentElement.appendChild(genericButton("Redo", "redo-button", () => { history.redo(); render(); }, !history.canRedo()));

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

function render(): void {
    appElement.innerHTML = "";
    const outerColumn = col();
    outerColumn.classList.add("app-container");

    renderPuzzleCreation(outerColumn);
    renderPuzzle(outerColumn);

    renderValidity(outerColumn, puzzle);
    renderPuzzleButtons(outerColumn);

    appElement.appendChild(outerColumn);
}

function generatePuzzle(): void {
    if (!generating) {
        generating = true;
        const newPuzzleButton = document.querySelector(".new-puzzle-button") as HTMLButtonElement;
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
    appElement = document.getElementById("app")!;
    generatePuzzle();
});
