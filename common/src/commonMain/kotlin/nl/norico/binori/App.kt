package nl.norico.binori

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.Text
import androidx.compose.material.Button
import androidx.compose.material.ButtonDefaults
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import nl.norico.binori.puzzle.*

@Composable
fun App() {
    val puzzleSize = 8
    val emptyRatio = 0.6
    val blockSize = 50.dp

//    var puzzle by remember { mutableStateOf(createEmptyPuzzle(puzzleSize)) }
    var puzzle by remember { mutableStateOf(PuzzleCreator.createSolvablePuzzle(puzzleSize, emptyRatio)) }
    val replacePuzzle = { newPuzzle: Puzzle ->
        puzzle = newPuzzle
    }

    Row(Modifier.background(CellValue.ANY.getBackgroundColor())){
        showPuzzle(puzzle, replacePuzzle, blockSize)
        Column {
            showValidity(puzzle, blockSize)
            Button(
                onClick = {puzzle = PuzzleCreator.createSolvablePuzzle(puzzleSize, emptyRatio)},
                modifier = Modifier.height(blockSize).width(blockSize * 3),
                ) {
                Text("New puzzle")
            }
        }
    }
}

@Composable
fun showPuzzle(puzzle: Puzzle, replacePuzzle: (Puzzle) -> Unit, blockSize: Dp) {
    if (puzzle.validator.isSolved()) {
        Text("Congratulations, you solved the puzzle")
    } else {
        // all columns in a row
        Row {
            Column {
                Box(
                    Modifier.height(blockSize).width(blockSize),
                    Alignment.Center
                ) {}
                for (y in puzzle[0].indices) {
                    Box(
                        Modifier.height(blockSize).width(blockSize),
                        Alignment.Center
                    ) {
                        Text(y.toString())
                    }
                }
            }
            for (x in puzzle[0].indices) {
                // all cells in a column
                Column {
                    Box(
                        Modifier.height(blockSize).width(blockSize),
                        Alignment.Center
                    ) {
                        Text(x.toString())
                    }
                    for (y in puzzle[x].indices) {
                        Button(
                            onClick = { replacePuzzle(puzzle.copyWithNextValueAt(x, y)) },
                            modifier = Modifier.height(blockSize).width(blockSize),
                            colors = ButtonDefaults.buttonColors(
                                backgroundColor = puzzle[x][y].getBackgroundColor(),
                                contentColor = puzzle[x][y].getTextColor()
                            )
                        ) {
                            Text("${puzzle[x][y]}")
                        }
                    }
                    // remaining counts at botom
                    Box(
                        Modifier.height(blockSize).width(blockSize),
                        Alignment.Center,
                    ) {
                        val remainingZero = puzzle.getRemainingValueCountInColumn(x, CellValue.ZERO)
                        if (remainingZero != 0) {
                            Text("$remainingZero")
                        } else {
                            Text("✔️")
                        }
                    }
                    Box(
                        Modifier.height(blockSize).width(blockSize),
                        Alignment.Center,
                    ) {
                        val remainingOne = puzzle.getRemainingValueCountInColumn(x, CellValue.ONE)
                        if (remainingOne != 0) {
                            Text("$remainingOne")
                        } else {
                            Text("✔️")
                        }

                    }
                }
            }
            // column with remaining 0 counts
            Column {
                Box(
                    Modifier.height(blockSize).width(blockSize),
                    Alignment.Center
                ) {}
                for (y in puzzle[0].indices) {
                    Box(
                        modifier = Modifier.height(blockSize).width(blockSize),
                        Alignment.Center
                    ) {
                        val remainingZero = puzzle.getRemainingValueCountInRow(y, CellValue.ZERO)
                        if (remainingZero != 0) {
                            Text("$remainingZero")
                        } else {
                            Text("✔️")
                        }
                    }
                }
                Box(
                    modifier = Modifier.height(blockSize).width(blockSize),
                    Alignment.Center
                ) {
                    Text(CellValue.ZERO.toString())
                }
            }
            // column with remaining 1 counts
            Column {
                Box(
                    Modifier.height(blockSize).width(blockSize),
                    Alignment.Center
                ) {}
                for (y in puzzle[0].indices) {
                    Box(
                        modifier = Modifier.height(blockSize).width(blockSize),
                        Alignment.Center
                    ) {
                        val remainingOne = puzzle.getRemainingValueCountInRow(y, CellValue.ONE)
                        if (remainingOne != 0) {
                            Text("$remainingOne")
                        } else {
                            Text("✔️")
                        }
                    }
                }
                Box(
                    modifier = Modifier.height(blockSize).width(blockSize),
                    Alignment.Center
                ) {
                }
                Box(
                    modifier = Modifier.height(blockSize).width(blockSize),
                    Alignment.Center
                ) {
                    Text(CellValue.ONE.toString())
                }
            }
        }
    }
}

@Composable
fun showValidity(puzzle: Puzzle, blockSize: Dp) {
    var color = Color.Red
    var invalidReason = puzzle.validator.getInvalidReason()

    if (invalidReason == null) {
        color = Color.Green
        invalidReason = "Valid"
    }

    Box(
        modifier = Modifier.height(blockSize).width(blockSize * 4),
        contentAlignment = Alignment.Center
    ) {
        Text(invalidReason, color=color)
    }
}