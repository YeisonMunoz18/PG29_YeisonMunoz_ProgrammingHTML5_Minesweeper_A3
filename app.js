
// @Copyright Yeison - VFS 2025-2026

// Minesweeper main class - controls the entire game logic and UI interaction
class Minesweeper {
    constructor(size, bombsCount) {
        // Basic game setup
        this.size = size;               // Grid dimension (size * size)
        this.totalCells = size * size;  // Total number of cells
        this.bombsCount = bombsCount;   // Total number of bombs in the board
        this.isGameOver = false;        // Flag indicating if the game has ended
        this.flagsCounter = 0;          // Counter for placed flags

        // Timer system
        this.timerInterval = null;      // Interval reference for the timer
        this.secondsElapsed = 0;        // Counter for elapsed seconds
        this.timerEl = null;            // HTML element for timer display
 
        this.boardEl = document.querySelector('#board');
        this.flagCountEl = document.querySelector('#flags');
        this.ResetbtnEl = document.querySelector('#reset');
        this.buttonBegEl = document.querySelector('#beginner');
        this.buttonIntEl = document.querySelector('#intermediate');
        this.buttonExpEl = document.querySelector('#expert');

        // Create an empty board structure
        this.board = Array(this.totalCells).fill('').map(() => ({
            hasBomb: false,
            isRevealed: false,
            isFlagged: false,
            bombsAround: 0
        }));

        // Random bomb placement
        let bombsPlaced = 0;
        while (bombsPlaced < bombsCount) {
            const randomIndex = Math.floor(Math.random() * this.totalCells)
            if (!this.board[randomIndex].hasBomb) {
                this.board[randomIndex].hasBomb = true;
                bombsPlaced++;
            }
        }

        // Calculate bombs around each cell
        for (let i = 0; i < this.totalCells; i++) {
            if (!this.board[i].hasBomb) {
                const neighbors = this.getNeighborIndices(i);
                let countAround = 0;
                for (const ni of neighbors) if (this.board[ni].hasBomb) countAround++;
                this.board[i].bombsAround = countAround;
            } 
        }

        // Initialize the board and attach events
        this.init();

        // Reset button event
        this.ResetbtnEl.addEventListener('click', () => this.resetGame());

        // Difficulty buttons - create new boards
        this.buttonBegEl.addEventListener('click', () => {
            this.boardEl.innerHTML = '';
            this.boardEl.style.gridTemplateColumns = 'repeat(8, 50px)';
            new Minesweeper(8, 10);
        });

        this.buttonIntEl.addEventListener('click', () => {
            this.boardEl.innerHTML = '';
            this.boardEl.style.gridTemplateColumns = 'repeat(10, 45px)';
            new Minesweeper(10, 15);
        });

        this.buttonExpEl.addEventListener('click', () => {
            this.boardEl.innerHTML = '';
            this.boardEl.style.gridTemplateColumns = 'repeat(12, 40px)';
            new Minesweeper(12, 20);
        });
    }

    // Initialize and render the board
    init = () => {
        this.isGameOver = false;
        this.flagCountEl.textContent = this.flagsCounter;
        this.boardEl.innerHTML = '';

        // Create cell elements and attach mouse events
        this.board.map((_, index) => {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.index = index;

            // Left-click (reveal)
            cell.addEventListener('click', () => this.handleLeftClick(index));

            // Right-click (flag)
            cell.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.handleRightClick(index);
            });
            this.boardEl.appendChild(cell);
        });
    };

    // Return valid neighbor indices around a given cell
    getNeighborIndices = (i) => {
        const res = [];
        const r = Math.floor(i / this.size);
        const c = i % this.size;
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = r + dr, nc = c + dc;
                if (nr < 0 || nr >= this.size || nc < 0 || nc >= this.size) continue;
                res.push(nr * this.size + nc);
            }
        }
        return res;
    }

    // Handle left click (reveal cell)
    handleLeftClick = (index) => {

        if (this.isGameOver) return;

        // Start timer on first click
        if (this.secondsElapsed === 0 && !this.timerInterval) {
            this.startTimer();
        }

        const cell = this.boardEl.children[index];
        const current = this.board[index];

        if (current.isRevealed || current.isFlagged) return;

        current.isRevealed = true;
        cell.classList.add('revealed');

        // If bomb clicked, end game
        if (current.hasBomb) {
            this.gameOver();
            return;
        }

        // Show number if bombs nearby
        if (current.bombsAround > 0) {
            this.paintNumber(cell, current.bombsAround);    
            return;
        }

        // If no bombs nearby, reveal empty neighbors recursively
        this.revealEmptyNeighbors(index);
        this.checkWin();
    };

    // Reveal all empty neighbor cells recursively
    revealEmptyNeighbors = (index) => {
        const neighbors = this.getNeighborIndices(index);

        for (const neighborIndex of neighbors) {
            const neighbor = this.board[neighborIndex];
            const cell = this.boardEl.children[neighborIndex];

            // Skip if flagged
            if (neighbor.isFlagged) continue;

            // Reveal if not already revealed or bomb
            if (!neighbor.isRevealed && !neighbor.hasBomb) {
                neighbor.isRevealed = true;
                cell.classList.add('revealed');

                if (neighbor.bombsAround > 0) {
                    this.paintNumber(cell, neighbor.bombsAround);
                    this.checkWin();
                } else {
                    this.revealEmptyNeighbors(neighborIndex);
                    this.checkWin();
                }
            }
        }
    };

    // Draw number on cell with color
    paintNumber = (cell, n) => {
        cell.textContent = n;
        const colors = {
            1: '#1976d2',
            2: '#388e3c',
            3: '#d32f2f',
            4: '#7b1fa2',
            5: '#f57c00',
            6: '#00838f',
            7: '#424242',
            8: '#000000'
        };
        cell.style.color = colors[n] || '#000'
    };

    // Handle right click (toggle flag)
    handleRightClick = (index) => {

        if (this.isGameOver) return;
        
        const cell = this.boardEl.children[index];
        const current = this.board[index];

        if (current.isRevealed) return;

        // Toggle flag state
        current.isFlagged = !current.isFlagged;
        if (current.isFlagged) {
            const img = document.createElement('img');
            img.src = 'images/flag.png';
            img.alt = "flag";
            img.style.width = '100%';
            img.style.height = '100%';
            cell.innerHTML = '';
            cell.appendChild(img);
            this.flagsCounter++;
        } else {
            cell.innerHTML = '';
            this.flagsCounter--;
        }

        // Update flag counter display
        this.flagCountEl.textContent = this.flagsCounter;
    };

    // Check if player has won
    checkWin = () => {
        const unrevealed = this.board.filter(cell => !cell.isRevealed && !cell.hasBomb);
        if (unrevealed.length === 0) {
            this.isGameOver = true;
            alert('You win!');
        }
    }

    // Game over logic (reveal all bombs)
    gameOver = () => {
        this.stopTimer();
        this.isGameOver = true;

        // Reveal all bombs visually
        for (let i = 0; i < this.totalCells; i++) {
            const cell = this.boardEl.children[i];
            if (this.board[i].hasBomb) {
                cell.innerHTML = '';
                const img = document.createElement('img');
                img.src = 'images/bomb.png';
                img.alt = 'bomb';
                img.style.width = '100%';
                img.style.height = '100%';
                cell.appendChild(img);
                cell.style.background = "#e53935"
            }
        }
    };

    // Reset the current game
    resetGame = () => {
        this.stopTimer();
        this.secondsElapsed = 0;
        if (this.timerEl) this.timerEl.textContent = '000';
        this.updateTimerDisplay();

        this.isGameOver = false;
        this.flagsCounter = 0;
        this.flagCountEl.textContent = this.flagsCounter;

        // Recreate the board structure
        this.board = Array(this.totalCells).fill('').map(() => ({
            hasBomb: false,
            isRevealed: false,
            isFlagged: false,
            bombsAround: 0
        }));

        // Place bombs again
        let bombsPlaced = 0;
        while (bombsPlaced < this.bombsCount) {
            const randomIndex = Math.floor(Math.random() * this.totalCells);
            if (!this.board[randomIndex].hasBomb) {
                this.board[randomIndex].hasBomb = true;
                bombsPlaced++;
            }
        }

        // Recalculate surrounding bombs
        for (let i = 0; i < this.totalCells; i++) {
            if (!this.board[i].hasBomb) {
                let countAround = 0;
                const neighbors = this.getNeighborIndices(i);
                for (const ni of neighbors) if (this.board[ni].hasBomb) countAround++;
                this.board[i].bombsAround = countAround;
            }
        }

        // Reinitialize the visual board
        this.init();
    }

    // Timer start
    startTimer = () => {
        this.timerEl = document.querySelector('#timer');
        this.secondsElapsed = 0;

        if (this.timerInterval) clearInterval(this.timerInterval);

        // Increment seconds every 1 second
        this.timerInterval = setInterval(() => {
            this.secondsElapsed++;
            this.updateTimerDisplay();
        }, 1000);
    };

    // Stop timer
    stopTimer = () => {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
    };

    // Update timer display on screen
    updateTimerDisplay = () => {
        this.timerEl.textContent = this.secondsElapsed.toString().padStart(3, '0');
    };
}

// Start default game (8x8 grid, 10 bombs)
new Minesweeper(8, 10);