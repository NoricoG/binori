import { Change } from "@puzzle/change";
import { Cell } from "@puzzle/cell";
import { CellValue } from "@puzzle/cellValue";
import { Puzzle } from "@puzzle/puzzle";
import { Solver } from "@tools/solver";

export class PuzzleGenerator {

    static generate(size: number, emptyRatio: number, skew: number): Puzzle {
        const puzzle = PuzzleGenerator.createSolvedPuzzle(size);
        PuzzleGenerator.emptyCells(puzzle, emptyRatio, skew);
        PuzzleGenerator.setUserAttribute(puzzle);
        return puzzle;
    }

    static emptyCells(puzzle: Puzzle, emptyRatio: number, skew: number): void {
        const cells = puzzle.getAllCells();
        const targetEmpty = Math.floor(puzzle.getNumberOfCells() * emptyRatio);

        if (skew * targetEmpty > cells.length / 2) {
            console.warn(`Skew ${skew} is too high for empty ratio ${emptyRatio}, adjusting to fit.`);
            skew = (cells.length / 2) / targetEmpty;
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

            if (randomCell.value === CellValue.ANY) {
                continue;
            }

            const needsZero = randomCell.value === CellValue.ZERO && emptyZero < targetEmptyZero;
            const needsOne = randomCell.value === CellValue.ONE && emptyOne < targetEmptyOne;

            if (needsZero || needsOne) {
                if (randomCell.value === CellValue.ZERO) {
                    emptyZero++;
                } else {
                    emptyOne++;
                }
                puzzle.setValueAt(randomCell.x, randomCell.y, CellValue.ANY);
            }
        }
    }

    static setUserAttribute(puzzle: Puzzle): void {
        const cells = puzzle.getAllCells();
        for (const cell of cells) {
            cell.user = cell.value === CellValue.ANY;
        }
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
        console.log(`Solved puzzle:\n${puzzle.toString()}`);
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
