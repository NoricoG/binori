import { Change, ChangeReason } from "@puzzle/change";
import { CellValue } from "@puzzle/cellValue";
import { Puzzle } from "@puzzle/puzzle";
import { Sequence } from "@puzzle/sequence";

export class Solver {
    static undo(puzzle: Puzzle, changes: Change[]): void {
        for (const change of changes) {
            puzzle.setValueAt(change.x, change.y, change.oldValue);
        }
    }

    static trySolve(puzzle: Puzzle): Change[] {
        return Solver.solveAllSequentials(puzzle);
    }

    static solveAllSequentials(puzzle: Puzzle): Change[] {
        const changes: Change[] = [];
        let newChanges: Change[] = [];
        let foundNewChanges = true;

        while (foundNewChanges && puzzle.validator.isValidAfterChanges(newChanges)) {
            newChanges = [];
            for (let i = 0; i < puzzle.size; i++) {
                newChanges.push(...this.solveDoubleTriple(puzzle.columns[i], puzzle));
                newChanges.push(...this.solveDoubleTriple(puzzle.rows[i], puzzle));
                newChanges.push(...this.solveSingleValueRemaining(puzzle.columns[i], puzzle));
                newChanges.push(...this.solveSingleValueRemaining(puzzle.rows[i], puzzle));
            }
            changes.push(...newChanges);
            foundNewChanges = newChanges.length > 0;
        }
        return changes;
    }

    static solveDoubleTriple(sequence: Sequence, puzzle: Puzzle): Change[] {
        if (sequence.counts[CellValue.ANY] <= 1) {
            return [];
        }

        const changes: Change[] = [];

        let cellA = sequence.cells[0];
        let cellB = sequence.cells[1];
        let valueA = cellA.value;
        let valueB = cellB.value;

        for (let i = 2; i < sequence.cells.length; i++) {
            const cellC = sequence.cells[i];
            let valueC = cellC.value;

            // .00 .11 -> 100 011
            if (valueA === CellValue.ANY && valueB !== CellValue.ANY && valueB === valueC) {
                const change = new Change(cellA.x, cellA.y, CellValue.ANY, CellValue.opposite(valueB), ChangeReason.BesidesDouble);
                change.apply(puzzle);
                changes.push(change);
                valueA = change.newValue;
            }
            // 0.0 1.1 -> 010 101
            else if (valueB === CellValue.ANY && valueA !== CellValue.ANY && valueA === valueC) {
                const change = new Change(cellB.x, cellB.y, CellValue.ANY, CellValue.opposite(valueA), ChangeReason.BesidesDouble);
                change.apply(puzzle);
                changes.push(change);
                valueB = change.newValue;
            }
            // 00. 11. -> 001 110
            else if (valueC === CellValue.ANY && valueA !== CellValue.ANY && valueA === valueB) {
                const change = new Change(cellC.x, cellC.y, CellValue.ANY, CellValue.opposite(valueB), ChangeReason.BetweenSame);
                change.apply(puzzle);
                changes.push(change);
                valueC = change.newValue;
            }

            cellA = cellB; cellB = cellC;
            valueA = valueB; valueB = valueC;
        }

        return changes;
    }

    static solveSingleValueRemaining(sequence: Sequence, puzzle: Puzzle): Change[] {
        const zeroCount = sequence.counts[CellValue.ZERO];
        const oneCount = sequence.counts[CellValue.ONE];

        const zeroComplete = zeroCount === puzzle.halfSize;
        const oneComplete = oneCount === puzzle.halfSize;

        if (zeroComplete && oneComplete) {
            return [];
        }

        if (zeroComplete || oneComplete) {
            const changes: Change[] = [];
            const remainingValue = zeroComplete ? CellValue.ONE : CellValue.ZERO;
            for (const cell of sequence.cells) {
                if (cell.value === CellValue.ANY) {
                    const change = new Change(cell.x, cell.y, CellValue.ANY, remainingValue, ChangeReason.SingleValueRemaining);
                    change.apply(puzzle);
                    changes.push(change);
                }
            }
            return changes;
        }
        return [];
    }
}
