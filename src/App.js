import React, { useState, useEffect, useRef } from "react";
import "./styles.css";
import puzzles from "./puzzles.json";
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

const currentSet = "Nov28b-2023";
const currentColors = puzzles[currentSet].Colors;
const currentPuzzle = puzzles[currentSet].Puzzle;
const currentPuzzleSolution = puzzles[currentSet].Solution;

const formatTime = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const getInitialState = () => {
  try {
    const savedDataString = localStorage.getItem("puzzleData");
    const savedData = JSON.parse(savedDataString);
    if (savedData && savedData.currentSet === currentSet) {
      return savedData;
    }
  } catch (error) {
    console.error("Error reading from local storage", error);
  }
  // Default values if no suitable saved state is available
  return {
    grid: currentPuzzle.map((row) => [...row]),
    initialGrid: currentPuzzle.map((row) => [...row]),
    selectedCell: { row: null, col: null },
    timer: 0,
    isTimerPaused: false,
    isPuzzleSolved: false,
  };
};

const initialState = getInitialState();

export default function App() {
  const [grid, setGrid] = useState(initialState.grid);
  const [initialGrid, setInitialGrid] = useState(initialState.initialGrid);
  const [selectedCell, setSelectedCell] = useState(initialState.selectedCell);
  const [numberDisabled, setNumberDisabled] = useState(Array(9).fill(false));
  const [isPuzzleSolved, setIsPuzzleSolved] = useState(
    initialState.isPuzzleSolved,
  );
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showPauseDialog, setShowPauseDialog] = useState(
    initialState.isTimerPaused,
  );
  const [timer, setTimer] = useState(initialState.timer);
  const [isTimerPaused, setIsTimerPaused] = useState(
    initialState.isTimerPaused,
  );
  const [errorCells, setErrorCells] = useState([]);

  const checkErrors = () => {
    const newErrorCells = [];
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        if (grid[i][j] !== 0 && grid[i][j] !== currentPuzzleSolution[i][j]) {
          newErrorCells.push({ row: i, col: j });
        }
      }
    }
    setErrorCells(newErrorCells);
  };

  useEffect(() => {
    // Only save to local storage if the grid is not empty
    if (grid.length > 0 && initialGrid.length > 0) {
      const savedData = {
        grid,
        initialGrid,
        selectedCell,
        timer,
        isTimerPaused,
        currentSet,
        isPuzzleSolved,
      };

      localStorage.setItem("puzzleData", JSON.stringify(savedData));
    }
  }, [grid, initialGrid, selectedCell, timer, isTimerPaused, isPuzzleSolved]);

  useEffect(() => {
    // Define the handler
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsTimerPaused(true);
        setShowPauseDialog(true);
      } else {
        // Optional: Resume the timer or keep it paused
        // setIsTimerPaused(false);
      }
    };

    // Add event listener
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Clean up the event listener
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    try {
      const savedDataString = localStorage.getItem("puzzleData");
      console.log("Saved Data String:", savedDataString); // Debugging statement

      const savedData = JSON.parse(savedDataString);
      console.log("Parsed Saved Data:", savedData); // Debugging statement

      if (savedData && savedData.currentSet === currentSet) {
        console.log("Loading saved data for current set");
        setGrid(savedData.grid || currentPuzzle.map((row) => [...row]));
        setInitialGrid(
          savedData.initialGrid || currentPuzzle.map((row) => [...row]),
        );
        setSelectedCell(savedData.selectedCell || { row: null, col: null });
        setTimer(savedData.timer || 0);
        setIsTimerPaused(savedData.isTimerPaused || false);
        setIsPuzzleSolved(savedData.isPuzzleSolved || false);
      } else {
        console.log("Initializing new grid or clearing local storage");
        localStorage.clear();
        setGrid(currentPuzzle.map((row) => [...row]));
        setInitialGrid(currentPuzzle.map((row) => [...row]));
        setSelectedCell({ row: null, col: null });
        setTimer(0);
        setIsTimerPaused(false);
        setIsPuzzleSolved(false);
      }
    } catch (error) {
      console.error("Error reading from local storage", error);
    }

    window.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("touchstart", handleOutsideClick);

    return () => {
      window.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("touchstart", handleOutsideClick);
    };
  }, []);

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
    const newPausedState = !isTimerPaused;
    setIsTimerPaused(newPausedState);

    // Set the pause dialog visibility based on the timer's paused state
    if (!isPuzzleSolved) {
      setShowPauseDialog(newPausedState);
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

        // Remove the cell from errorCells if it's currently an error
        if (
          errorCells.some((ec) => ec.row === rowIndex && ec.col === colIndex)
        ) {
          setErrorCells(
            errorCells.filter(
              (ec) => ec.row !== rowIndex || ec.col !== colIndex,
            ),
          );
        }
      }
    }
  };

  const handleNumberSelect = (number) => {
    if (selectedCell.row == null || selectedCell.col == null) return;

    const newGrid = [...grid];
    newGrid[selectedCell.row][selectedCell.col] = number;

    // Remove the cell from errorCells if it's currently an error
    if (
      errorCells.some(
        (ec) => ec.row === selectedCell.row && ec.col === selectedCell.col,
      )
    ) {
      setErrorCells(
        errorCells.filter(
          (ec) => ec.row !== selectedCell.row || ec.col !== selectedCell.col,
        ),
      );
    }

    setGrid(newGrid);
  };

  const handleInputChange = (e, rowIndex, colIndex) => {
    const value = e.target.value ? parseInt(e.target.value, 10) : 0;
    const newGrid = [...grid];
    newGrid[rowIndex][colIndex] = value;

    // Remove the cell from errorCells if it's currently an error
    if (errorCells.some((ec) => ec.row === rowIndex && ec.col === colIndex)) {
      setErrorCells(
        errorCells.filter((ec) => ec.row !== rowIndex || ec.col !== colIndex),
      );
    }

    setGrid(newGrid);
  };

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
        <p className="timer">
          {formatTime(timer)}
          <button className="button--pause" onClick={togglePause}>
            <span className="material-symbols-sharp">pause</span>
          </button>
        </p>

        <button className="button button--action" onClick={checkErrors}>
          Check Puzzle
        </button>
      </div>

      <Grid
        grid={grid}
        handleInputChange={handleInputChange}
        initialGrid={initialGrid}
        onCellSelect={handleCellSelect}
        selectedCell={selectedCell}
        baseColors={currentColors}
        errorCells={errorCells}
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
      {/* <button className="button button--debug" onClick={localStorage.clear()}>
        Clear localStorage (Debug)
      </button>
      <button
        className="button button--debug"
        onClick={solvePuzzleForDebugging}
      >
        Solve Puzzle (Debug)
      </button> */}
    </div>
  );
}
