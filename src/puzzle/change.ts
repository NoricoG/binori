import { CellValue } from "@puzzle/cellValue";
import { Puzzle } from "@puzzle/puzzle";

export enum ChangeReason {
    UserInput = 0,
    BesidesDouble = 1,
    BetweenSame = 2,
    SingleValueRemaining = 3,
}

export class Change {
    constructor(public x: number, public y: number, public oldValue: CellValue, public newValue: CellValue, public reason: ChangeReason) { }

    apply(puzzle: Puzzle): void {
        puzzle.setValueAt(this.x, this.y, this.newValue);
    }
}
