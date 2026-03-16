package nl.norico.binori.puzzle

class Validator(val puzzle: Puzzle) {

    fun isSolved(): Boolean {
        return isFilled() && this.isValid()
    }

    fun isFilled(): Boolean {
        for (x in this.puzzle[0].indices) {
            for (y in this.puzzle[0].indices) {
                if (this.puzzle[x][y] == CellValue.ANY) {
                    return false
                }
            }
        }
        return true
    }

    fun getInvalidReason(): String? {
        val invalidColumn = getFirstInvalidColumn()
        if (invalidColumn != null) {
            return "Column $invalidColumn is invalid."
        }

        val invalidRow = getFirstInvalidRow()
        if (invalidRow != null) {
            return "Row $invalidRow is invalid."
        }

        val equalColumns = getFirstEqualColumns()
        if (equalColumns != null) {
            return "Columns ${equalColumns.first} and ${equalColumns.second} are the same."
        }

        val equalRows = getFirstEqualRows()
        if (equalRows != null) {
            return "Rows ${equalRows.first} and ${equalRows.second} are the same."
        }

        return null
    }

    fun isValid(): Boolean {
        return getFirstInvalidColumn() == null && getFirstInvalidRow() == null && getFirstEqualColumns() == null && getFirstEqualRows() == null
    }

    fun getFirstInvalidColumn(): Int? {
        for (x in this.puzzle[0].indices) {
            if (!isValidColumn(x)) {
                return x
            }
        }
        return null
    }

    fun getFirstInvalidRow(): Int? {
        for (y in this.puzzle[0].indices) {
            if (!isValidRow(y)) {
                return y
            }
        }
        return null
    }

    fun isValidColumn(x: Int): Boolean {
        return isValidSequence(this.puzzle.getColumnValues(x))
    }

    fun isValidRow(y: Int): Boolean {
        return isValidSequence(this.puzzle.getRowValues(y))
    }

    fun isValidSequence(values: Values): Boolean {
        return !anyValueOccursThreeInRow(values) && !anyValueOccursMoreThanHalf(values)
    }

    fun anyValueOccursThreeInRow(values: Values): Boolean {
        // 01110 return true, 0110 returns false
        for (i in 2 until values.size) {
            val consecutiveValues =
                values[i] != CellValue.ANY && values[i - 1] != CellValue.ANY && values[i - 2] != CellValue.ANY
            val equalValues = values[i] == values[i - 1] && values[i - 1] == values[i - 2]
            if (consecutiveValues && equalValues)
                return true
        }
        return false
    }

    fun anyValueOccursMoreThanHalf(values: Values): Boolean {
        val counts: MutableMap<CellValue, Int> = mutableMapOf()
        for (value in values) {
            if (value != CellValue.ANY) {
                counts[value] = counts.getOrElse(value) { 0 } + 1
            }
        }
        for (v in counts.values) {
            if (v > values.size / 2) {
                return true
            }
        }
        return false
    }

    fun getFirstEqualColumns(): Pair<Int, Int>? {
        for (currentX in this.puzzle[0].indices) {
            for (otherX in currentX + 1 until this.puzzle.size) {
                if (columnsAreEqual(currentX, otherX)) {
                    return Pair(currentX, otherX)
                }
            }
        }
        return null
    }

    fun getFirstEqualRows(): Pair<Int, Int>? {
        for (currentY in this.puzzle[0].indices) {
            for (otherY in currentY + 1 until this.puzzle[0].size) {
                if (rowsAreEqual(currentY, otherY)) {
                    return Pair(currentY, otherY)
                }
            }
        }
        return null
    }

    fun columnsAreEqual(xOne: Int, xTwo: Int): Boolean {
        return valuesAreEqual(this.puzzle.getColumnValues(xOne), this.puzzle.getColumnValues(xTwo))
    }

    fun rowsAreEqual(yOne: Int, yTwo: Int): Boolean {
        return valuesAreEqual(this.puzzle.getRowValues(yOne), this.puzzle.getRowValues(yTwo))
    }

    fun valuesAreEqual(a: Values, b: Values): Boolean {
        for (i in a.indices) {
            if (a[i] == CellValue.ANY || a[i] != b[i]) {
                return false
            }
        }
        return true
    }
}