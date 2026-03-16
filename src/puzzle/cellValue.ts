export enum CellValue {
    ZERO = 0,
    ONE = 1,
    ANY = 2
}

export namespace CellValue {
    const labels = ["O", "I", " "];

    export function toString(value: CellValue): string {
        return labels[value];
    }

    export function next(value: CellValue): CellValue {
        return ((value + 1) % 3) as CellValue;
    }

    export function opposite(value: CellValue): CellValue {
        if (value === CellValue.ZERO) return CellValue.ONE;
        if (value === CellValue.ONE) return CellValue.ZERO;
        return CellValue.ANY;
    }
}
