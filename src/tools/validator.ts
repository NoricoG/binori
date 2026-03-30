import { CellValue } from "@puzzle/cellValue";
import { Change } from "@puzzle/change";
import { Puzzle } from "@puzzle/puzzle";
import { Sequence } from "@puzzle/sequence";

export class Validator {
    private readonly size: number;
    private readonly halfSize: number;

    constructor(private puzzle: Puzzle) {
        this.size = puzzle.size;
        this.halfSize = this.size / 2;
    }

    isSolved(): boolean {
        return this.isFilled() && this.isValid();
    }

    isFilled(): boolean {
        for (const column of this.puzzle.columns) {
            if (column.counts[CellValue.ANY] > 0) return false;
        }
        return true;
    }

    getInvalidReason(): string | null {
        const col = this.getFirstInvalidColumn();
        if (col !== null) return `Column ${col + 1} is invalid`;

        const row = this.getFirstInvalidRow();
        if (row !== null) return `Row ${row + 1} is invalid`;

        const cols = this.getFirstEqualColumns();
        if (cols !== null) return `Columns ${cols[0] + 1} and ${cols[1] + 1} are the same`;

        const rows = this.getFirstEqualRows();
        if (rows !== null) return `Rows ${rows[0] + 1} and ${rows[1] + 1} are the same`;

        return null;
    }

    isValid(): boolean {
        const valid = (
            this.getFirstInvalidColumn() === null &&
            this.getFirstInvalidRow() === null &&
            this.getFirstEqualColumns() === null &&
            this.getFirstEqualRows() === null
        );
        return valid;
    }

    isValidAfterChange(x: number, y: number): boolean {
        const valid = (
            this.isValidColumn(x) &&
            this.isValidRow(y) &&
            !this.columnEqualsAny(x) &&
            !this.rowEqualsAny(y)
        );
        return valid;
    }

    isValidAfterChanges(changes: Change[]): boolean {
        const affectedColumns = new Set(changes.map(c => c.x));
        const affectedRows = new Set(changes.map(c => c.y));

        for (const x of affectedColumns) {
            if (!this.isValidColumn(x) || this.columnEqualsAny(x)) {
                return false;
            }
        }

        for (const y of affectedRows) {
            if (!this.isValidRow(y) || this.rowEqualsAny(y)) {
                return false;
            }
        }

        return true;
    }

    getFirstInvalidColumn(): number | null {
        for (let x = 0; x < this.size; x++) {
            if (!this.isValidColumn(x)) return x;
        }
        return null;
    }

    getFirstInvalidRow(): number | null {
        for (let y = 0; y < this.size; y++) {
            if (!this.isValidRow(y)) return y;
        }
        return null;
    }

    isValidColumn(x: number): boolean {
        return this.isValidSequence(this.puzzle.columns[x]);
    }

    isValidRow(y: number): boolean {
        return this.isValidSequence(this.puzzle.rows[y]);
    }

    isValidSequence(sequence: Sequence): boolean {
        if (sequence.counts[CellValue.ZERO] > this.halfSize || sequence.counts[CellValue.ONE] > this.halfSize) {
            return false;
        }

        for (let i = 1; i < sequence.cells.length - 1; i++) {
            const a = sequence.cells[i - 1].value;
            const b = sequence.cells[i].value;
            const c = sequence.cells[i + 1].value;

            if (a != CellValue.ANY && a == b && b == c) {
                return false;
            }
        }
        return true;
    }

    getFirstEqualColumns(): [number, number] | null {
        for (let x = 0; x < this.size; x++) {
            for (let otherX = x + 1; otherX < this.size; otherX++) {
                if (this.columnsAreEqual(x, otherX)) return [x, otherX];
            }
        }
        return null;
    }

    getFirstEqualRows(): [number, number] | null {
        for (let y = 0; y < this.size; y++) {
            for (let otherY = y + 1; otherY < this.size; otherY++) {
                if (this.rowsAreEqual(y, otherY)) return [y, otherY];
            }
        }
        return null;
    }

    columnEqualsAny(x: number): boolean {
        for (let ox = 0; ox < this.size; ox++) {
            if (ox !== x && this.columnsAreEqual(x, ox)) return true;
        }
        return false;
    }

    rowEqualsAny(y: number): boolean {
        for (let oy = 0; oy < this.size; oy++) {
            if (oy !== y && this.rowsAreEqual(y, oy)) return true;
        }
        return false;
    }

    columnsAreEqual(xOne: number, xTwo: number): boolean {
        return this.cellArraysAreEqual(this.puzzle.columns[xOne], this.puzzle.columns[xTwo]);
    }

    rowsAreEqual(yOne: number, yTwo: number): boolean {
        return this.cellArraysAreEqual(this.puzzle.rows[yOne], this.puzzle.rows[yTwo]);
    }

    cellArraysAreEqual(a: Sequence, b: Sequence): boolean {
        if (!a.complete || !b.complete) {
            return false;
        }
        for (let i = 0; i < a.cells.length; i++) {
            if (a.cells[i].value !== b.cells[i].value) return false;
        }
        return true;
    }
}
