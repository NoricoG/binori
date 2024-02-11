package nl.norico.binori.puzzle

import androidx.compose.ui.graphics.Color

enum class CellValue(private val index: Int) {
    ZERO(0),
    ONE(1),
    ANY(2);

    private val labels = arrayOf("O", "I", " ")
    private val backgroundColors = arrayOf(Color.Gray, Color.Black, Color.White)
    private val textColors = arrayOf(Color.Black, Color.White, Color.Black)

    override fun toString(): String {
        return labels[this.index]
    }

    fun getBackgroundColor(): Color {
        return backgroundColors[this.index]
    }

    fun getTextColor(): Color {
        return textColors[this.index]
    }

    fun next(): CellValue {
        val allValues = CellValue.values()
        return allValues[(this.index + 1) % allValues.size]
    }
}