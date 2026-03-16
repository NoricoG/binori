import { CellValue } from "@puzzle/cellValue";
import { Puzzle } from "@puzzle/puzzle";
import { PuzzleGenerator } from "@tools/generator";
import { Solver } from "@tools/solver";

const DEFAULT_PUZZLE_SIZE = 10;
const MIN_PUZZLE_SIZE = 6;
const MAX_PUZZLE_SIZE = 16; // more than 16 can be slow
const PUZZLE_SIZE_STEP = 2;

const DEFAULT_EMPTY_RATIO = 0.5;
const MIN_EMPTY_RATIO = 0.35;
const MAX_EMPTY_RATIO = 0.65;
const EMPTY_RATIO_STEP = 0.05;

let puzzleSize: number = DEFAULT_PUZZLE_SIZE;
let emptyRatio: number = DEFAULT_EMPTY_RATIO;

const CELL_CLASS: Record<CellValue, string> = {
    [CellValue.ZERO]: "cell-zero",
    [CellValue.ONE]: "cell-one",
    [CellValue.ANY]: "cell-any",
};

let puzzle: Puzzle;
let appEl: HTMLElement;
let generating: boolean = false;
let showHints: boolean = false;

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
    const btn = document.createElement("button");
    btn.className = `cell-btn ${CELL_CLASS[cell.value]}`;
    btn.textContent = cell.toString();
    if (cell.user) {
        btn.classList.add("user-cell");
        btn.addEventListener("click", () => {
            puzzle.setNextValueAt(x, y);
            render();
        });
    }
    return btn;
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

function renderPuzzle(): HTMLElement {
    const size = puzzle.size;
    const outerRow = row();

    // row-index column (empty header + row numbers)
    const idxCol = col();
    idxCol.appendChild(box());
    for (let y = 0; y < size; y++) {
        const rowNum = showHints ? box((y + 1).toString()) : box();
        rowNum.classList.add("helper-cell");
        idxCol.appendChild(rowNum);
    }
    outerRow.appendChild(idxCol);

    // one column per puzzle column x
    for (let x = 0; x < size; x++) {
        const c = col();
        const header = showHints ? box((x + 1).toString()) : box();
        header.classList.add("helper-cell");
        c.appendChild(header);
        for (let y = 0; y < size; y++) {
            c.appendChild(cellButton(x, y));
        }
        const text = showHints ? remainingTextColumn(x) : "";
        const remaining = box(text);
        remaining.classList.add("helper-cell");
        c.appendChild(remaining);
        outerRow.appendChild(c);
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

    return outerRow;
}

function sliderRow(label: string, min: number, max: number, step: number, value: number, format: (v: number) => string, onChange: (v: number) => void): HTMLElement {
    const container = document.createElement("div");
    container.className = "slider-row";

    const lbl = document.createElement("label");
    lbl.textContent = label;
    container.appendChild(lbl);

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
        const v = parseFloat(slider.value);
        display.textContent = format(v);
        onChange(v);
    });

    return container;
}

function render(): void {
    appEl.innerHTML = "";
    const outerCol = col();
    outerCol.classList.add("app-container");

    const invalidReason = puzzle.validator.getInvalidReason();

    outerCol.appendChild(sliderRow(
        "Puzzle size:", MIN_PUZZLE_SIZE, MAX_PUZZLE_SIZE, PUZZLE_SIZE_STEP, puzzleSize,
        (v) => v.toString(),
        (v) => { puzzleSize = v; }
    ));
    outerCol.appendChild(sliderRow(
        "Empty cells:", MIN_EMPTY_RATIO, MAX_EMPTY_RATIO, EMPTY_RATIO_STEP, emptyRatio,
        (v) => Math.round(v * 100) + "%",
        (v) => { emptyRatio = v; }
    ));

    const btn = document.createElement("button");
    btn.className = "new-puzzle-btn";
    btn.textContent = "New puzzle";
    btn.addEventListener("click", () => {
        generatePuzzle();
    });
    outerCol.appendChild(btn);


    const reset = document.createElement("button");
    reset.className = "reset-btn";
    reset.textContent = "Reset";
    reset.addEventListener("click", () => {
        for (let x = 0; x < puzzle.size; x++) {
            for (let y = 0; y < puzzle.size; y++) {
                if (puzzle.getCell(x, y).user) {
                    puzzle.setValueAt(x, y, CellValue.ANY);
                }
            }
        }
        render();
    });
    outerCol.appendChild(reset);

    const solve = document.createElement("button");
    solve.className = "solve-btn";
    solve.textContent = "Solve";
    solve.addEventListener("click", () => {
        Solver.trySolve(puzzle);
        render();
    });
    outerCol.appendChild(solve);

    const showHintsButton = document.createElement("button");
    showHintsButton.className = "hints-btn";
    showHintsButton.textContent = "Show hints";
    showHintsButton.addEventListener("click", () => {
        showHintsButton.classList.toggle("active");
        showHints = !showHints;
        render();
    });
    outerCol.appendChild(showHintsButton);

    const validityEl = document.createElement("div");
    validityEl.className = `validity ${invalidReason ? "invalid" : "valid"}`;
    validityEl.textContent = invalidReason ?? "Valid";
    outerCol.appendChild(validityEl);

    if (puzzle.validator.isSolved()) {
        const el = document.createElement("div");
        el.textContent = "Congratulations, you solved the puzzle!";
        outerCol.appendChild(el);
    }

    outerCol.appendChild(renderPuzzle());
    appEl.appendChild(outerCol);
}

function generatePuzzle(): void {
    if (!generating) {
        generating = true;
        const newPuzzleButton = document.querySelector(".new-puzzle-btn") as HTMLButtonElement;
        if (newPuzzleButton) {
            newPuzzleButton.innerHTML = "Generating...";
            newPuzzleButton.disabled = true;
        }
        puzzle = PuzzleGenerator.createSolvedPuzzle(puzzleSize);
        PuzzleGenerator.emptyCells(puzzle, emptyRatio);
        render();
        generating = false;
        if (newPuzzleButton) {
            newPuzzleButton.innerHTML = "New puzzle";
            newPuzzleButton.disabled = false;
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    appEl = document.getElementById("app")!;
    generatePuzzle();
});
