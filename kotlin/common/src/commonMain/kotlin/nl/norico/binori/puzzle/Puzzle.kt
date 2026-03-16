package nl.norico.binori.puzzle

import kotlin.math.pow

typealias Values = Array<CellValue>

class Puzzle(val size: Int, grid: Grid?) {
    private val _grid = grid ?: getEmptyGrid(size)

    val validator = Validator(this)

    companion object

    fun copy(): Puzzle {
        return Puzzle(this.size, Array(this.size) { _grid[it].copyOf() })
    }

    fun copyWithValueAt(x: Int, y: Int, value: CellValue): Puzzle {
        val updated = this.copy()
        updated[x][y] = value
        return updated
    }

    fun copyWithNextValueAt(x: Int, y: Int): Puzzle {
        val nextValue = this[x][y].next()
        return copyWithValueAt(x, y, nextValue)
    }

    override fun toString(): String {
        val s = StringBuilder(this.getNumberOfCells() + this.size)
        for (y in this[0].indices) {
            for (x in this[0].indices) {
                s.append(this[x][y])
            }
            s.append('\n')
        }
        s.deleteCharAt(s.lastIndex)
        return s.toString()
    }

    operator fun get(x: Int): Array<CellValue> {
        return _grid[x]
    }

    fun get(x: Int, y: Int): CellValue {
        return _grid[x][y]
    }


    fun getNumberOfCells(): Int {
        return this.size.toDouble().pow(2).toInt()
    }

    fun getColumnValues(x: Int): Values {
        val values = Values(this.size) { CellValue.ANY }
        for (y in this[x].indices) {
            values[y] = this[x][y]
        }
        return values
    }

    fun getRowValues(y: Int): Values {
        val values = Values(this.size) { CellValue.ANY }
        for (x in this[0].indices) {
            values[x] = this[x][y]
        }
        return values
    }

    fun countMatchingValues(values: Values, matchValue: CellValue): Int {
        var count = 0
        for (value in values) {
            if (value == matchValue) {
                count += 1
            }
        }
        return count
    }

    fun getValueCountInColumn(x: Int, matchValue: CellValue): Int {
        return countMatchingValues(this.getColumnValues(x), matchValue)
    }

    fun getValueCountInRow(y: Int, matchValue: CellValue): Int {
        return countMatchingValues(this.getRowValues(y), matchValue)
    }

    fun getRemainingValueCountInColumn(x: Int, matchValue: CellValue): Int {
        return this[x].size / 2 - this.getValueCountInColumn(x, matchValue)
    }

    fun getRemainingValueCountInRow(y: Int, matchValue: CellValue): Int {
        return this.size / 2 - this.getValueCountInRow(y, matchValue)
    }

    fun getAllCoordinates(): Coordinates {
        val cellCount = this.getNumberOfCells()
        val allCoordinates = Coordinates(cellCount)
        for (x in this._grid.indices) {
            for (y in this._grid[x].indices) {
                allCoordinates.add(Pair(x, y))
            }
        }
        return allCoordinates

    }
}