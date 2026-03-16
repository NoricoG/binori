package nl.norico.binori.puzzle

import kotlin.random.Random

typealias Coordinates = ArrayDeque<Pair<Int, Int>>

class PuzzleCreator {

    companion object {

        fun createSolvablePuzzle(size: Int, emptyRatio: Double): Puzzle {
            val puzzle = createSolvedPuzzle(size)
            val coordinates = puzzle.getAllCoordinates()
            val emptyCells = (puzzle.getNumberOfCells() * emptyRatio).toInt()
            for (i in 0 until emptyCells) {
                emptyRandomCell(puzzle, coordinates)
            }
            return puzzle
        }

        private fun emptyRandomCell(puzzle: Puzzle, coordinates: Coordinates) {
            val randomIndex = Random.nextInt(coordinates.size)
            val randomCoordinates = coordinates.removeAt(randomIndex)
            val x = randomCoordinates.first
            val y = randomCoordinates.second
            puzzle[x][y] = CellValue.ANY
        }

        private fun createSolvedPuzzle(size: Int): Puzzle {
            val puzzle = Puzzle(size, null)
            val allCoordinates = puzzle.getAllCoordinates()
            return fillNextIndex(puzzle, allCoordinates) ?: throw Exception("No solved puzzle created")
        }

        // TODO: simplify or add comments
        private fun fillNextIndex(puzzle: Puzzle, remainingCoordinates: Coordinates): Puzzle? {
            if (!puzzle.validator.isValid()) {
                // dead end
                return null
            }
            if (remainingCoordinates.isEmpty()) {
                // a valid complete puzzle has been found
                return puzzle
            }

            val randomIndex = Random.nextInt(remainingCoordinates.size)
            val nextCoordinates = remainingCoordinates.removeAt(randomIndex)
            val nextX = nextCoordinates.first
            val nextY = nextCoordinates.second

            var valueOptions = arrayOf(CellValue.ZERO, CellValue.ONE)
            if (Random.nextInt(2) == 1) {
                valueOptions = arrayOf(CellValue.ONE, CellValue.ZERO)
            }

            for (value in valueOptions) {
                val newPuzzle = puzzle.copyWithValueAt(nextX, nextY, value)
                val remainingCoordinatesCopy = Coordinates(remainingCoordinates)
                val result = fillNextIndex(newPuzzle, remainingCoordinatesCopy)
                if (result != null) {
                    return result
                }
            }
            return null
        }

    }
}
