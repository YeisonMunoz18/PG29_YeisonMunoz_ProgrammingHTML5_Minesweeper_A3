class Minesweeper {
    constructor(size, bombsCount) {
        this.size = size;
        this.totalCells = size * size;
        this.bombsCount = bombsCount;
        this.isGameOver = false;
        this.flagsCounter = 0;

        this.timerInterval = null;
        this.secondsElapsed = 0;
        this.timerEl = null;
 
        this.boardEl = document.querySelector('#board');
        this.flagCountEl = document.querySelector('#flags');
        this.ResetbtnEl = document.querySelector('#reset');
        this.buttonBegEl = document.querySelector('#beginner');
        this.buttonIntEl = document.querySelector('#intermediate');
        this.buttonExpEl = document.querySelector('#expert');

        this.board = Array(this.totalCells).fill('').map(() => ({
            hasBomb: false,
            isRevealed: false,
            isFlagged: false,
            bombsAround: 0
        }));

        let bombsPlaced = 0;
        while (bombsPlaced < bombsCount) {
            const randomIndex = Math.floor(Math.random() * this.totalCells)
            if (!this.board[randomIndex].hasBomb) {
                this.board[randomIndex].hasBomb = true;
                console.log("bomb is: " + randomIndex + " " + this.board[randomIndex].hasBomb);
                bombsPlaced++;
            }
        }

        for (let i = 0; i < this.totalCells; i++) {
            if (!this.board[i].hasBomb) {
                let countAround = 0;
                const neighbors = [
                    -this.size - 1,
                    -this.size,
                    -this.size + 1,
                    - 1,
                    + 1,
                    +this.size - 1,
                    +this.size,
                    +this.size + 1
                ];

                for (let n = 0; n < neighbors.length; n++) {
                    const neighborIndex = i + neighbors[n];

                    if (neighborIndex < 0 || neighborIndex >= this.totalCells) continue;

                    if (this.board[neighborIndex].hasBomb) countAround++;
                }
                this.board[i].bombsAround = countAround;
                console.log(i + "has this bombs around: " + this.board[i].bombsAround);
            } 
        }

        this.init();
        this.ResetbtnEl.addEventListener('click', () => this.resetGame());
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

    init = () => {
        this.isGameOver = false;
        

        this.flagCountEl.textContent = this.flagsCounter;

        this.boardEl.innerHTML = '';

        this.board.map((_, index) => {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.index = index;

            cell.addEventListener('click', () => this.handleLeftClick(index));
            cell.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.handleRightClick(index);
            });
            this.boardEl.appendChild(cell);
        });
    };

    handleLeftClick = (index) => {

        if (this.isGameOver) return;

        if (this.secondsElapsed === 0 && !this.timerInterval) {
            this.startTimer();
        }

        const cell = this.boardEl.children[index];
        const current = this.board[index];

        if (current.isRevealed || current.isFlagged) return;

        current.isRevealed = true;
        cell.classList.add('revealed');

        if (current.hasBomb) {
            this.gameOver();
            return;
        }

        if (current.bombsAround > 0) {
            this.paintNumber(cell, current.bombsAround);    
            return;
        }
        this.revealEmptyNeighbors(index);
        this.checkWin();
    };

    revealEmptyNeighbors = (index) => {
        const neighbors = [
            -this.size - 1,
            -this.size,
            -this.size + 1,
            - 1,
            + 1,
            +this.size - 1,
            +this.size,
            +this.size + 1
        ];

        for (let n = 0; n < neighbors.length; n++) {
            const neighborIndex = index + neighbors[n];
            if (neighborIndex < 0 || neighborIndex >= this.totalCells) continue;

            const currentRow = Math.floor(index / this.size);
            const neighborRow = Math.floor(neighborIndex / this.size);
            if (Math.abs(neighborRow - currentRow) > 1) continue;

            const neighbor = this.board[neighborIndex];
            const cell = this.boardEl.children[neighborIndex];

            if (!neighbor.isRevealed && !neighbor.hasBomb) {
                neighbor.isRevealed = true;
                cell.classList.add('revealed');

                if (neighbor.bombsAround > 0) {
                    this.paintNumber(cell, neighbor.bombsAround);
                } else {
                    this.revealEmptyNeighbors(neighborIndex);
                }
            }
        }
    };

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

    handleRightClick = (index) => {

        if (this.isGameOver) return;

        
        const cell = this.boardEl.children[index];
        const current = this.board[index];

        if (current.isRevealed) return;

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

        this.flagCountEl.textContent = this.flagsCounter;
    };

    checkWin = () => {
        const unrevealed = this.board.filter(cell => !cell.isRevealed && !cell.hasBomb);
        if (unrevealed.length === 0) {
            this.isGameOver = true;
            alert('Gano pedazo de fukin');
        }
    }

    gameOver = () => {
        this.stopTimer();
        this.isGameOver = true;

        console.log("PERDIO PERRA");
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

    resetGame = () => {
        this.secondsElapsed = 0;
        this.updateTimerDisplay();

        this.isGameOver = false;
        this.flagsCounter = 0;

        this.board = Array(this.totalCells).fill('').map(() => ({
            hasBomb: false,
            isRevealed: false,
            isFlagged: false,
            bombsAround: 0
        }));

        let bombsPlaced = 0;
        while (bombsPlaced < this.bombsCount) {
            const randomIndex = Math.floor(Math.random() * this.totalCells);
            if (!this.board[randomIndex].hasBomb) {
                this.board[randomIndex].hasBomb = true;
                bombsPlaced++;
            }
        }

        for (let i = 0; i < this.totalCells; i++) {
            if (!this.board[i].hasBomb) {
                let countAround = 0;
                const neighbors = [
                    -this.size - 1, -this.size, -this.size + 1,
                    -1, +1,
                    +this.size - 1, +this.size, +this.size + 1
                ];
                for (const offset of neighbors) {
                    const neighborIndex = i + offset;
                    if (neighborIndex >= 0 && neighborIndex < this.totalCells) {
                        if (this.board[neighborIndex].hasBomb) countAround++;
                    }
                }
                this.board[i].bombsAround = countAround;
            }
        }

        this.init();
    }

    startTimer = () => {
        this.timerEl = document.querySelector('#timer');
        this.secondsElapsed = 0;

        if (this.timerInterval) clearInterval(this.timerInterval);

        this.timerInterval = setInterval(() => {
            this.secondsElapsed++;
            this.updateTimerDisplay();
        }, 1000);
    };

    stopTimer = () => {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
    };

    updateTimerDisplay = () => {
        this.timerEl.textContent = this.secondsElapsed.toString().padStart(3, '0');
    };
}

new Minesweeper(8, 10);