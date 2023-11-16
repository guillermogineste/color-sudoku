import React, { useState, useEffect, useRef } from "react";
import "./styles.css";
import puzzles from "./original-puzzles.json";
import colors from "./colors.json";
import Grid from "./components/Grid";
import {
  AlertDialog,
  AlertDialogLabel,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogContent,
} from "@reach/alert-dialog";
import partyPopperImage from "./images/party-popper_1f389.png";
import pauseImage from "./images/pause-button_23f8-fe0f.png";

const currentColors = colors["Nov16-2023"];
const currentPuzzleIndex = 3;
const currentPuzzle = puzzles.RawSudoku[currentPuzzleIndex];
const currentPuzzleSolution = puzzles.SolvedSudoku[currentPuzzleIndex];

const formatTime = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export default function App() {
  const [grid, setGrid] = useState([]);
  const [initialGrid, setInitialGrid] = useState([]);
  const [selectedCell, setSelectedCell] = useState({ row: null, col: null });
  const [numberDisabled, setNumberDisabled] = useState(Array(9).fill(false));
  const [isPuzzleSolved, setIsPuzzleSolved] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTimerPaused, setIsTimerPaused] = useState(false);

  useEffect(() => {
    let interval;
    if (!isPuzzleSolved && !isTimerPaused) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPuzzleSolved, isTimerPaused]);

  const togglePause = () => {
    setIsTimerPaused(!isTimerPaused);
    if (!isPuzzleSolved) {
      setShowPauseDialog(!showPauseDialog);
    }
  };

  const closeBtnRef = useRef(null);

  const solvePuzzleForDebugging = () => {
    setGrid(currentPuzzleSolution.map((row) => [...row]));
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

  // const checkSolution = () => {
  //   const solution = currentPuzzleSolution;
  //   for (let i = 0; i < 9; i++) {
  //     for (let j = 0; j < 9; j++) {
  //       if (grid[i][j] !== solution[i][j]) {
  //         alert("Incorrect solution!");
  //         return;
  //       }
  //     }
  //   }
  //   alert("Congratulations! You've solved the puzzle!");
  // };

  const checkIfPuzzleSolved = () => {
    const solution = currentPuzzleSolution;

    if (!grid.length || grid.some((row) => !row)) {
      return;
    }

    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (!grid[i] || grid[i][j] !== solution[i][j]) {
          setIsPuzzleSolved(false);
          console.log("Puzzle not solved");
          return;
        }
      }
    }
    console.log("Puzzle solved");
    setShowSuccessDialog(true);
    setIsPuzzleSolved(true);
  };
  const closeDialog = () => {
    setShowSuccessDialog(false);
    setShowPauseDialog(false);
    if (!isPuzzleSolved) {
      setIsTimerPaused(false);
    }
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
    setGrid(currentPuzzle.map((row) => [...row]));
    setInitialGrid(currentPuzzle.map((row) => [...row]));

    window.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("touchstart", handleOutsideClick);

    return () => {
      window.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("touchstart", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    const newNumberDisabled = currentColors.map((_, i) =>
      isNumberMaxedOut(i + 1, grid),
    );
    setNumberDisabled(newNumberDisabled);

    checkIfPuzzleSolved();
  }, [grid]);

  return (
    <div className="App">
      <h1 className="heading heading--one">Coloroku</h1>
      <div className="action-bar">
        <p className="timer">{formatTime(timer)}</p>
        <button className="button button--pause" onClick={togglePause}>
          <span class="material-symbols-sharp">pause</span>
        </button>
      </div>

      <div className="action-bar">
        <div className="action-buttons">
          {/* <button className="button button--action" onClick={checkSolution}>
            Check Puzzle
          </button> */}
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

      <AlertDialog
        isOpen={showSuccessDialog}
        onDismiss={closeDialog}
        leastDestructiveRef={closeBtnRef}
        className="full-screen-dialog-overlay"
      >
        <AlertDialogOverlay />
        <AlertDialogContent className="full-screen-dialog-content">
          <img
            src={partyPopperImage}
            className="success-image"
            alt="Party Popper"
          />
          <AlertDialogLabel className="heading heading--one">
            Congratulations!
          </AlertDialogLabel>
          <AlertDialogDescription className="heading heading--two">
            You solved the puzzle in {formatTime(timer)}
          </AlertDialogDescription>
          <div className="alert-buttons">
            <button
              className="button button--close"
              ref={closeBtnRef}
              onClick={closeDialog}
            >
              Close
            </button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog
        isOpen={showPauseDialog}
        onDismiss={closeDialog}
        leastDestructiveRef={closeBtnRef}
        className="full-screen-dialog-overlay"
      >
        <AlertDialogOverlay />
        <AlertDialogContent className="full-screen-dialog-content">
          <img src={pauseImage} className="success-image" alt="Party Popper" />

          <AlertDialogLabel className="heading heading--one">
            Paused
          </AlertDialogLabel>
          <button
            className="button button--action"
            ref={closeBtnRef}
            onClick={closeDialog}
          >
            Keep going
          </button>
          <div className="alert-buttons">
            <button
              className="button button--close"
              ref={closeBtnRef}
              onClick={closeDialog}
            >
              Close
            </button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
      {/* <button
        className="button button--debug"
        onClick={solvePuzzleForDebugging}
      >
        Solve Puzzle (Debug)
      </button> */}
    </div>
  );
}
