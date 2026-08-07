package com.example.nxrchat.util

import android.graphics.Bitmap
import android.graphics.Color
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.asImageBitmap
import java.security.MessageDigest

object QrUtils {

    /**
     * Generates a high-contrast QR Matrix ImageBitmap for rendering in Compose.
     */
    fun generateQrBitmap(
        content: String,
        size: Int = 512,
        darkColor: Int = Color.parseColor("#0D1B2A"),
        lightColor: Int = Color.WHITE
    ): ImageBitmap {
        val matrixSize = 29 // 29x29 grid
        val bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
        val pixels = IntArray(size * size)
        val cellSize = size / matrixSize

        val grid = BooleanArray(matrixSize * matrixSize)

        // Seed generator from content hash
        val digest = MessageDigest.getInstance("SHA-256")
        val hash = digest.digest(content.toByteArray())

        // 1. Draw corner finder patterns (7x7 boxes at top-left, top-right, bottom-left)
        fun setSquare(startR: Int, startC: Int, length: Int, fill: Boolean) {
            for (r in 0 until length) {
                for (c in 0 until length) {
                    val row = startR + r
                    val col = startC + c
                    if (row in 0 until matrixSize && col in 0 until matrixSize) {
                        grid[row * matrixSize + col] = fill
                    }
                }
            }
        }

        fun drawFinderPattern(row: Int, col: Int) {
            setSquare(row, col, 7, true)
            setSquare(row + 1, col + 1, 5, false)
            setSquare(row + 2, col + 2, 3, true)
        }

        drawFinderPattern(0, 0)
        drawFinderPattern(0, matrixSize - 7)
        drawFinderPattern(matrixSize - 7, 0)

        // 2. Alignment pattern
        drawFinderPattern(matrixSize - 9, matrixSize - 9)

        // 3. Timing patterns (alternating dots)
        for (i in 7 until matrixSize - 7) {
            grid[6 * matrixSize + i] = (i % 2 == 0)
            grid[i * matrixSize + 6] = (i % 2 == 0)
        }

        // 4. Fill data modules based on content hash and text bytes
        val textBytes = content.toByteArray()
        var byteIdx = 0
        var bitIdx = 0

        for (r in 0 until matrixSize) {
            for (c in 0 until matrixSize) {
                val idx = r * matrixSize + c
                // Skip finder pattern zones
                val inTopLeft = r in 0..7 && c in 0..7
                val inTopRight = r in 0..7 && c in (matrixSize - 8) until matrixSize
                val inBottomLeft = r in (matrixSize - 8) until matrixSize && c in 0..7
                val inBottomRightAlign = r in (matrixSize - 10)..(matrixSize - 4) && c in (matrixSize - 10)..(matrixSize - 4)

                if (!inTopLeft && !inTopRight && !inBottomLeft && !inBottomRightAlign && r != 6 && c != 6) {
                    val hashByte = hash[(r + c + byteIdx) % hash.size].toInt() and 0xFF
                    val textByte = if (textBytes.isNotEmpty()) textBytes[byteIdx % textBytes.size].toInt() and 0xFF else 0
                    val combinedBit = ((hashByte xor textByte xor (r * 31 + c)) shr (bitIdx % 8)) and 1
                    grid[idx] = (combinedBit == 1)

                    bitIdx++
                    if (bitIdx % 8 == 0) byteIdx++
                }
            }
        }

        // Render grid onto bitmap
        for (y in 0 until size) {
            val r = (y / cellSize).coerceIn(0, matrixSize - 1)
            for (x in 0 until size) {
                val c = (x / cellSize).coerceIn(0, matrixSize - 1)
                val isDark = grid[r * matrixSize + c]
                pixels[y * size + x] = if (isDark) darkColor else lightColor
            }
        }

        bitmap.setPixels(pixels, 0, size, 0, 0, size, size)
        return bitmap.asImageBitmap()
    }
}
