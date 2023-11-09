// Checks if the number is already used in the given row
const isInRow = (grid, row, number) => {
  return grid[row].reduce((conflicts, cell, col) => {
    if (cell === number) {
      conflicts.push({ row, col });
    }
    return conflicts;
  }, []);
};

// Checks if the number is already used in the given column
const isInCol = (grid, col, number) => {
  return grid.reduce((conflicts, row, rowIndex) => {
    if (row[col] === number) {
      conflicts.push({ row: rowIndex, col });
    }
    return conflicts;
  }, []);
};

// Checks if the number is already used in the 3x3 subgrid
const isInSubgrid = (grid, row, col, number) => {
  const conflicts = [];
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (grid[startRow + i][startCol + j] === number) {
        conflicts.push({ row: startRow + i, col: startCol + j });
      }
    }
  }

  return conflicts;
};

// Function that combines the checks for row, column, and subgrid
const isValidPlacement = (grid, row, col, number) => {
  return (
    !isInRow(grid, row, number) &&
    !isInCol(grid, col, number) &&
    !isInSubgrid(grid, row, col, number)
  );
};
