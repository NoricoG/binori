import { Cell } from "@puzzle/cell";
import { CellValue } from "@puzzle/cellValue";

export class Sequence {
    readonly cells: Cell[];
    // number of cells with value [zero, one, any]
    readonly counts: [number, number, number] = [0, 0, 0];
    complete: boolean;

    constructor(cells: Cell[]) {
        this.cells = cells;

        for (const c of cells) this.counts[c.value]++;
        this.complete = this.counts[CellValue.ANY] === 0;
    }

    setValueAt(index: number, oldValue: CellValue, newValue: CellValue): void {
        this.cells[index].value = newValue;

        this.counts[oldValue]--;
        this.counts[newValue]++;

        this.complete = this.counts[CellValue.ANY] === 0;
    }
}
