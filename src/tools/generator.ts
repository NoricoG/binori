import { Change } from "@puzzle/change";
import { Cell } from "@puzzle/cell";
import { CellValue } from "@puzzle/cellValue";
import { Puzzle } from "@puzzle/puzzle";
import { Solver } from "@tools/solver";

export class PuzzleGenerator {

    static emptyCells(puzzle: Puzzle, emptyRatio: number): void {
        const cells = puzzle.getAllCells();
        const emptyCells = Math.floor(puzzle.getNumberOfCells() * emptyRatio);
        for (let i = 0; i < emptyCells; i++) {
            PuzzleGenerator.emptyRandomCell(puzzle, cells);
        }
        for (const cell of cells) {
            if (cell.value !== CellValue.ANY) {
                cell.user = false;
            }
        }
    }

    private static emptyRandomCell(puzzle: Puzzle, cells: Cell[]): void {
        const randomIndex = Math.floor(Math.random() * cells.length);
        const cell = cells.splice(randomIndex, 1)[0];
        puzzle.setValueAt(cell.x, cell.y, CellValue.ANY);
    }

    static createSolvedPuzzle(size: number): Puzzle {
        const puzzle = new Puzzle(size);

        const solved = PuzzleGenerator.solveAndGuess(puzzle, puzzle.getUnsolvedCells());
        if (!solved) {
            throw new Error("Failed to generate a solved puzzle.");
        }
        return puzzle;
    }

    private static checkValid(puzzle: Puzzle): boolean {
        if (!puzzle.validator.isValid()) {
            return false;
        }
        for (const row of puzzle.rows) {
            for (const cell of row.cells) {
                if (cell.value === CellValue.ANY) {
                    console.warn("Generator produced an unsolved solution, continuing.");
                    return false;
                }
            }
        }
        console.log("Solved puzzle:", puzzle.toString());
        return true;
    }

    private static solveAndGuess(puzzle: Puzzle, unsolved: Cell[]): boolean {
        if (unsolved.length === 0) {
            return PuzzleGenerator.checkValid(puzzle);
        }

        // solve before guess
        const solveSteps = Solver.trySolve(puzzle);
        for (const step of solveSteps) {
            unsolved = unsolved.filter(cell => cell.x != step.x || cell.y != step.y);
        }

        if (unsolved.length === 0) {
            return PuzzleGenerator.checkValid(puzzle);
        }

        const guessIndex = Math.floor(Math.random() * unsolved.length);
        const guessCell = unsolved[guessIndex];

        const valueOptions: CellValue[] = Math.random() < 0.5
            ? [CellValue.ZERO, CellValue.ONE]
            : [CellValue.ONE, CellValue.ZERO];

        unsolved.splice(guessIndex, 1);
        for (const value of valueOptions) {
            // guess
            puzzle.setValueAt(guessCell.x, guessCell.y, value);
            if (puzzle.validator.isValidAfterChange(guessCell.x, guessCell.y)) {
                // solve after guess
                const solveSteps = Solver.trySolve(puzzle);
                for (const step of solveSteps) {
                    unsolved = unsolved.filter(cell => cell.x != step.x || cell.y != step.y);
                }

                // continue recursion
                if (PuzzleGenerator.solveAndGuess(puzzle, unsolved)) {
                    // go back to root of recursion
                    return true;
                } else {
                    // undo solves after guess
                    Solver.undo(puzzle, solveSteps);
                    unsolvedAdd(solveSteps);
                    // guess will be undone later
                }
            }
        }

        // undo guess
        puzzle.setValueAt(guessCell.x, guessCell.y, CellValue.ANY);
        unsolved.push(guessCell);

        // undo solves from before guess
        Solver.undo(puzzle, solveSteps);
        unsolvedAdd(solveSteps);

        return false;

        function unsolvedAdd(solveSteps: Change[]) {
            for (const step of solveSteps) {
                unsolved.push(puzzle.getCell(step.x, step.y));
            }
        }
    }
}
