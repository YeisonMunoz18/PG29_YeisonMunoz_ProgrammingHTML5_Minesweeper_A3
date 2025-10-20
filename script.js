class GameBoard {
    constructor(size, bombsCount) {
        this.size = size;
        this.totalCells = size * size;
        this.bombsCount = bombsCount;

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
                    +this.size
                ];

                for (let n = 0; n < neighbors.length; n++) {
                    const neighborIndex = i + neighbors[n];

                    if (neighborIndex < 0 || neighborIndex >= this.totalCells) continue;

                    if (this.board[neighborIndex].hasBomb) countAround++;
                }
                this.board[i].bombsAround = countAround;
                console.log(i + "has this bombs around: " + this.board[i].bombsAround);

                this.init();
            }
        }
    }

    init = () => {
        this.boardEl = document.querySelector('#board-container');

        this.boardEl.innerHTML = '';

        this.board.map((_, index) => {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.index = index;

            cell.addEventListener('click', () => this.handleLeftClick(index));
            cell.addEventListener('contextmenu', () => this.handleRightClick(index));
            this.boardEl.appendChild(cell);
        });
    };

    handleLeftClick = (index) => {

        if (this.board[index].isRevealed) return;
        if (this.board[index].hasBomb) gameOver();

        this.board[index].isRevealed = true;

        console.log(index + " is revealed?" + this.board[index].isRevealed);
    }

    handleRightClick = () => {
        if (this.board[index].isRevealed)
    }

    gameOver = () => {
        console.log("tuki");
    }
}

new GameBoard(10, 10);