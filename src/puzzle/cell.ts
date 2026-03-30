import { CellValue } from "@puzzle/cellValue";

export class Cell {
    user: boolean = false;

    constructor(
        public x: number,
        public y: number,
        public value: CellValue = CellValue.ANY
    ) { }

    toString(): string {
        return CellValue.toString(this.value);
    }
}
