/**
 * 365 Play Game - Sudoku Challenge
 * Main JavaScript file for game functionality
 */

// DOM Elements
const sudokuGrid = document.querySelector('.sudoku-grid');
const numberButtons = document.querySelectorAll('.number-btn');
const difficultyButtons = document.querySelectorAll('.difficulty-btn');
const newGameButton = document.getElementById('new-game');
const hintButton = document.getElementById('hint');
const checkButton = document.getElementById('check');
const solveButton = document.getElementById('solve');
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const currentLevelDisplay = document.getElementById('current-level');

// Game variables
let timer;
let seconds = 0;
let selectedCell = null;
let difficulty = 'easy';
let gameBoard = [];
let solution = [];
let hintsUsed = 0;

// Difficulty settings (number of cells to reveal)
const difficultySetting = {
    easy: 45,
    medium: 35,
    hard: 25,
    expert: 17
};

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    startNewGame();
    
    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('show');
        });
    }
});

/**
 * Set up all event listeners for the game
 */
function setupEventListeners() {
    // Difficulty buttons
    difficultyButtons.forEach(button => {
        button.addEventListener('click', () => {
            difficulty = button.dataset.level;
            currentLevelDisplay.textContent = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
            
            // Update active button
            difficultyButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            startNewGame();
        });
    });
    
    // Number buttons
    numberButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (selectedCell && !selectedCell.classList.contains('given')) {
                const number = button.dataset.number;
                
                if (number === '0') {
                    // Eraser button
                    selectedCell.textContent = '';
                    selectedCell.classList.remove('incorrect');
                } else {
                    selectedCell.textContent = number;
                    
                    // Check if the number is correct
                    const row = parseInt(selectedCell.dataset.row);
                    const col = parseInt(selectedCell.dataset.col);
                    
                    if (solution[row][col].toString() !== number) {
                        selectedCell.classList.add('incorrect');
                    } else {
                        selectedCell.classList.remove('incorrect');
                    }
                    
                    // Check if the game is complete
                    if (isGameComplete()) {
                        stopTimer();
                        setTimeout(() => {
                            alert('Congratulations! You solved the puzzle!');
                        }, 500);
                    }
                }
            }
        });
    });
    
    // Game control buttons
    newGameButton.addEventListener('click', startNewGame);
    hintButton.addEventListener('click', giveHint);
    checkButton.addEventListener('click', checkSolution);
    solveButton.addEventListener('click', showSolution);
}

/**
 * Start a new Sudoku game
 */
function startNewGame() {
    // Reset game state
    stopTimer();
    seconds = 0;
    updateTimerDisplay();
    hintsUsed = 0;
    
    // Generate a new puzzle
    const result = generateSudoku(difficultySetting[difficulty]);
    gameBoard = result.puzzle;
    solution = result.solution;
    
    // Create the grid
    createGrid();
    
    // Start the timer
    startTimer();
    
    // Set first difficulty button as active by default if none is selected
    if (!document.querySelector('.difficulty-btn.active')) {
        difficultyButtons[0].classList.add('active');
    }
}

/**
 * Create the Sudoku grid in the DOM
 */
function createGrid() {
    // Clear existing grid
    sudokuGrid.innerHTML = '';
    
    // Create cells
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const cell = document.createElement('div');
            cell.classList.add('sudoku-cell');
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            // Set cell content
            const value = gameBoard[row][col];
            if (value !== 0) {
                cell.textContent = value;
                cell.classList.add('given');
            }
            
            // Add event listener for cell selection
            cell.addEventListener('click', () => {
                // Remove selected class from previous cell
                if (selectedCell) {
                    selectedCell.classList.remove('selected');
                }
                
                // Select new cell
                cell.classList.add('selected');
                selectedCell = cell;
            });
            
            sudokuGrid.appendChild(cell);
        }
    }
}

/**
 * Generate a Sudoku puzzle with the given number of revealed cells
 * @param {number} revealedCells - Number of cells to reveal
 * @returns {Object} - Object containing the puzzle and solution
 */
function generateSudoku(revealedCells) {
    // Start with a solved puzzle
    const solvedBoard = createSolvedBoard();
    
    // Create a copy for the puzzle
    const puzzle = JSON.parse(JSON.stringify(solvedBoard));
    
    // Randomly hide cells based on difficulty
    const totalCells = 81;
    const cellsToHide = totalCells - revealedCells;
    let hiddenCells = 0;
    
    while (hiddenCells < cellsToHide) {
        const row = Math.floor(Math.random() * 9);
        const col = Math.floor(Math.random() * 9);
        
        if (puzzle[row][col] !== 0) {
            puzzle[row][col] = 0;
            hiddenCells++;
        }
    }
    
    return {
        puzzle: puzzle,
        solution: solvedBoard
    };
}

/**
 * Create a solved Sudoku board
 * @returns {Array} - 2D array representing a solved Sudoku board
 */
function createSolvedBoard() {
    // Create an empty board
    const board = Array(9).fill().map(() => Array(9).fill(0));
    
    // Fill the board using backtracking
    solveSudoku(board);
    
    return board;
}

/**
 * Solve a Sudoku board using backtracking algorithm
 * @param {Array} board - 2D array representing the Sudoku board
 * @returns {boolean} - Whether the board was successfully solved
 */
function solveSudoku(board) {
    // Find an empty cell
    const emptyCell = findEmptyCell(board);
    
    // If no empty cell is found, the board is solved
    if (!emptyCell) {
        return true;
    }
    
    const [row, col] = emptyCell;
    
    // Try placing numbers 1-9
    for (let num = 1; num <= 9; num++) {
        if (isValidPlacement(board, row, col, num)) {
            // Place the number
            board[row][col] = num;
            
            // Recursively try to solve the rest of the board
            if (solveSudoku(board)) {
                return true;
            }
            
            // If we reach here, the number didn't work, so backtrack
            board[row][col] = 0;
        }
    }
    
    // No solution was found
    return false;
}

/**
 * Find an empty cell in the Sudoku board
 * @param {Array} board - 2D array representing the Sudoku board
 * @returns {Array|null} - Coordinates [row, col] of an empty cell, or null if none found
 */
function findEmptyCell(board) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === 0) {
                return [row, col];
            }
        }
    }
    return null;
}

/**
 * Check if a number can be placed in a cell
 * @param {Array} board - 2D array representing the Sudoku board
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @param {number} num - Number to check
 * @returns {boolean} - Whether the number can be placed
 */
function isValidPlacement(board, row, col, num) {
    // Check row
    for (let i = 0; i < 9; i++) {
        if (board[row][i] === num) {
            return false;
        }
    }
    
    // Check column
    for (let i = 0; i < 9; i++) {
        if (board[i][col] === num) {
            return false;
        }
    }
    
    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[boxRow + i][boxCol + j] === num) {
                return false;
            }
        }
    }
    
    return true;
}

/**
 * Start the game timer
 */
function startTimer() {
    stopTimer(); // Clear any existing timer
    
    timer = setInterval(() => {
        seconds++;
        updateTimerDisplay();
    }, 1000);
}

/**
 * Stop the game timer
 */
function stopTimer() {
    if (timer) {
        clearInterval(timer);
    }
}

/**
 * Update the timer display
 */
function updateTimerDisplay() {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    
    minutesDisplay.textContent = mins.toString().padStart(2, '0');
    secondsDisplay.textContent = secs.toString().padStart(2, '0');
}

/**
 * Provide a hint by revealing a random cell
 */
function giveHint() {
    if (hintsUsed >= 3) {
        alert('You have used all your hints for this game!');
        return;
    }
    
    // Find all empty or incorrect cells
    const emptyCells = [];
    const cells = document.querySelectorAll('.sudoku-cell');
    
    cells.forEach(cell => {
        if (!cell.classList.contains('given')) {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            
            if (cell.textContent === '' || cell.classList.contains('incorrect')) {
                emptyCells.push({cell, row, col});
            }
        }
    });
    
    if (emptyCells.length === 0) {
        alert('No empty cells left to provide a hint!');
        return;
    }
    
    // Randomly select a cell to provide a hint for
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    const {cell, row, col} = emptyCells[randomIndex];
    
    // Reveal the correct number
    cell.textContent = solution[row][col];
    cell.classList.remove('incorrect');
    cell.classList.add('given');
    
    hintsUsed++;
    
    // Check if the game is complete
    if (isGameComplete()) {
        stopTimer();
        setTimeout(() => {
            alert('Congratulations! You solved the puzzle!');
        }, 500);
    }
}

/**
 * Check if the current board state matches the solution
 */
function checkSolution() {
    let incorrectCells = 0;
    const cells = document.querySelectorAll('.sudoku-cell');
    
    cells.forEach(cell => {
        if (!cell.classList.contains('given')) {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            
            if (cell.textContent === '') {
                incorrectCells++;
            } else if (cell.textContent !== solution[row][col].toString()) {
                cell.classList.add('incorrect');
                incorrectCells++;
            } else {
                cell.classList.remove('incorrect');
            }
        }
    });
    
    if (incorrectCells === 0) {
        alert('Your solution is correct!');
        stopTimer();
    } else {
        alert(`There are ${incorrectCells} incorrect or empty cells.`);
    }
}

/**
 * Show the complete solution
 */
function showSolution() {
    if (confirm('Are you sure you want to see the solution? This will end the current game.')) {
        const cells = document.querySelectorAll('.sudoku-cell');
        
        cells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            
            cell.textContent = solution[row][col];
            cell.classList.remove('incorrect');
            cell.classList.add('given');
        });
        
        stopTimer();
    }
}

/**
 * Check if the game is complete
 * @returns {boolean} - Whether the game is complete
 */
function isGameComplete() {
    const cells = document.querySelectorAll('.sudoku-cell');
    
    for (const cell of cells) {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        
        if (cell.textContent === '' || cell.textContent !== solution[row][col].toString()) {
            return false;
        }
    }
    
    return true;
} 