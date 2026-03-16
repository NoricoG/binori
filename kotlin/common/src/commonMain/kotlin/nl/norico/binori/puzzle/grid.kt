package nl.norico.binori.puzzle

typealias Grid = Array<Array<CellValue>>

fun getEmptyGrid(size: Int): Grid {
    if (size % 2 == 1) {
        throw Exception("Grid must have an even size")
    }
    return Array(size) {
        Array(size) {
            CellValue.ANY
        }
    }
}