import { Cell } from "@puzzle/cell";
import { CellValue } from "@puzzle/cellValue";
import { Sequence } from "@puzzle/sequence";
import { Validator } from "@tools/validator";
import { Change, ChangeReason } from "./change";

export class Puzzle {
    readonly size: number;
    readonly halfSize: number;
    columns: Sequence[];
    rows: Sequence[];
    validator: Validator;

    constructor(size: number) {
        if (size % 2 !== 0) {
            throw new Error("Grid must have an even size");
        }
        this.size = size;
        this.halfSize = size / 2;

        this.columns = Array.from({ length: size }, (_, x) =>
            new Sequence(Array.from({ length: size }, (_, y) => new Cell(x, y)))
        );
        // rows share Cell objects with columns
        this.rows = Array.from({ length: size }, (_, y) =>
            new Sequence(this.columns.map(column => column.cells[y]))
        );

        this.validator = new Validator(this);
    }

    getCell(x: number, y: number): Cell {
        return this.columns[x].cells[y];
    }

    get(x: number, y: number): CellValue {
        return this.columns[x].cells[y].value;
    }

    setValueAt(x: number, y: number, newValue: CellValue): void {
        const oldValue = this.get(x, y);
        if (oldValue === newValue) {
            return;
        }

        this.columns[x].setValueAt(y, oldValue, newValue);
        this.rows[y].setValueAt(x, oldValue, newValue);
    }

    setNextValueAt(x: number, y: number): void {
        this.setValueAt(x, y, CellValue.next(this.get(x, y)));
    }

    clearAll(): void {
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                this.setValueAt(x, y, CellValue.ANY);
            }
        }
    }

    toString(): string {
        const rows: string[] = [];
        for (let y = 0; y < this.size; y++) {
            let row = "";
            for (let x = 0; x < this.size; x++) {
                row += this.columns[x].cells[y].toString();
            }
            rows.push(row);
        }
        return rows.join("\n");
    }

    getNumberOfCells(): number {
        return this.size ** 2;
    }

    getValueCountInColumn(x: number, matchValue: CellValue): number {
        return this.columns[x].counts[matchValue];
    }

    getValueCountInRow(y: number, matchValue: CellValue): number {
        return this.rows[y].counts[matchValue];
    }

    getRemainingValueCountInColumn(x: number, matchValue: CellValue): number {
        return this.halfSize - this.getValueCountInColumn(x, matchValue);
    }

    getRemainingValueCountInRow(y: number, matchValue: CellValue): number {
        return this.halfSize - this.getValueCountInRow(y, matchValue);
    }

    getAllCells(): Cell[] {
        const cells: Cell[] = [];
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                cells.push(this.columns[x].cells[y]);
            }
        }
        return cells;
    }

    getUnsolvedCells(): Cell[] {
        const cells: Cell[] = [];
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                if (this.columns[x].cells[y].value === CellValue.ANY) {
                    cells.push(this.columns[x].cells[y]);
                }
            }
        }
        return cells;
    }

    reset(): Change[] {
        const changes: Change[] = [];
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                const oldValue = this.get(x, y);
                if (oldValue !== CellValue.ANY) {
                    changes.push(new Change(x, y, oldValue, CellValue.ANY, ChangeReason.Reset));
                    this.setValueAt(x, y, CellValue.ANY);
                }
            }
        }
        return changes;
    }
}
