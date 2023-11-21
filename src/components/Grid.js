import React from "react";
import Cell from "./Cell";

const Grid = ({
  grid,
  onCellSelect,
  initialGrid,
  selectedCell,
  baseColors,
  errorCells,
}) => {
  return (
    <div className="grid">
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="row">
          {row.map((cell, colIndex) => {
            const initialCellValue = initialGrid[rowIndex][colIndex];
            const isSelected =
              selectedCell.row === rowIndex && selectedCell.col === colIndex;
            return (
              <Cell
                key={`${rowIndex}-${colIndex}`}
                value={cell}
                initialCellValue={initialCellValue}
                isSelected={isSelected}
                onSelect={() => onCellSelect(rowIndex, colIndex)}
                backgroundColor={cell !== 0 ? baseColors[cell - 1] : null}
                isError={errorCells.some(
                  (ec) => ec.row === rowIndex && ec.col === colIndex,
                )}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Grid;
