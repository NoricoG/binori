import { CellValue } from "@puzzle/cellValue";
import { Puzzle } from "@puzzle/puzzle";

export enum ChangeReason {
    Reset = 0,
    UserInput = 1,
    BesidesDouble = 2,
    BetweenSame = 3,
    SingleValueRemaining = 4,
}

export class Change {
    constructor(public x: number, public y: number, public oldValue: CellValue, public newValue: CellValue, public reason: ChangeReason) { }

    apply(puzzle: Puzzle): void {
        puzzle.setValueAt(this.x, this.y, this.newValue);
    }
}
