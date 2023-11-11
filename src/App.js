import React, { useState, useEffect } from "react";
import "./styles.css";
import puzzles from "./puzzles.json";
import colors from "./colors.json";
import Grid from "./components/Grid";

const currentColors = colors.softPalette;

export default function App() {
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(null);
  const [grid, setGrid] = useState([]);
  const [initialGrid, setInitialGrid] = useState([]);
  const [selectedCell, setSelectedCell] = useState({ row: null, col: null });
  const [numberDisabled, setNumberDisabled] = useState(Array(9).fill(false));

  const loadRandomPuzzle = () => {
    const randomIndex = Math.floor(Math.random() * puzzles.RawSudoku.length);
    setCurrentPuzzleIndex(randomIndex);
    const newPuzzle = puzzles.RawSudoku[randomIndex].map((row) => [...row]);
    setGrid(newPuzzle);
    setInitialGrid(newPuzzle.map((row) => [...row]));
  };

  const isNumberMaxedOut = (number, currentGrid) => {
    let totalOccurrences = 0;
    let rowOccurrences = 0;

    for (let row = 0; row < currentGrid.length; row++) {
      let foundInRow = false;
      for (let col = 0; col < currentGrid[row].length; col++) {
        if (currentGrid[row][col] === number) {
          totalOccurrences += 1;
          foundInRow = true;
        }
      }
      if (foundInRow) rowOccurrences += 1;
    }

    return totalOccurrences === 9 || rowOccurrences === 9;
  };

  const checkSolution = () => {
    const solution = puzzles.SolvedSudoku[currentPuzzleIndex];
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (grid[i][j] !== solution[i][j]) {
          alert("Incorrect solution!");
          return;
        }
      }
    }
    alert("Congratulations! You've solved the puzzle!");
  };

  const handleOutsideClick = (event) => {
    if (!event.target.matches(".cell, .button")) {
      setSelectedCell({ row: null, col: null });
    }
  };

  const handleCellSelect = (rowIndex, colIndex) => {
    setSelectedCell({ row: rowIndex, col: colIndex });

    if (initialGrid[rowIndex][colIndex] === 0) {
      const newGrid = [...grid];

      if (selectedCell.row === rowIndex && selectedCell.col === colIndex) {
        newGrid[rowIndex][colIndex] = 0;
        setGrid(newGrid);
      }
    }
  };

  const handleNumberSelect = (number) => {
    if (selectedCell.row == null || selectedCell.col == null) return;

    const newGrid = [...grid];
    newGrid[selectedCell.row][selectedCell.col] = number;
    setGrid(newGrid);
  };

  const handleInputChange = (e, rowIndex, colIndex) => {
    const value = e.target.value ? parseInt(e.target.value, 10) : 0;
    const newGrid = [...grid];
    newGrid[rowIndex][colIndex] = value;
    setGrid(newGrid);
  };

  useEffect(() => {
    window.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("touchstart", handleOutsideClick);

    return () => {
      window.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("touchstart", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    loadRandomPuzzle();
  }, []);

  useEffect(() => {
    const newNumberDisabled = currentColors.map((_, i) =>
      isNumberMaxedOut(i + 1, grid),
    );
    setNumberDisabled(newNumberDisabled);
  }, [grid]);

  const loadNewPuzzle = () => {
    loadRandomPuzzle();
  };

  return (
    <div className="App">
      <h1 className="heading heading--one">Coloroku</h1>
      <div className="action-bar">
        <div className="action-buttons">
          <button className="button button--action" onClick={loadNewPuzzle}>
            New Game
          </button>
          <button className="button button--action" onClick={checkSolution}>
            Check Puzzle
          </button>
        </div>
      </div>
      <Grid
        grid={grid}
        handleInputChange={handleInputChange}
        initialGrid={initialGrid}
        onCellSelect={handleCellSelect}
        selectedCell={selectedCell}
        baseColors={currentColors}
      />
      <div className="color-buttons">
        <div className="color-buttons">
          {Array.from({ length: 9 }, (_, i) => (
            <button
              className={`button button--color ${
                numberDisabled[i] ? "button--disabled" : ""
              }`}
              key={i}
              style={{ backgroundColor: currentColors[i] }}
              onClick={() => handleNumberSelect(i + 1)}
              disabled={numberDisabled[i]}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
