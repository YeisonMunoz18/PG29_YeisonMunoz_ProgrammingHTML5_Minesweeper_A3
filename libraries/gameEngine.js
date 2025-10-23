import GameBoard from '../modules/gameBoard.js';
import GameLogic from '../modules/gameLogic.js';
import UserInput from '../modules/userInput.js';

class GameEngine {
    constructor(containerId) {
        this.containerId = containerId;

        //Decorator pattern
        this.gameBoard = new GameBoard(8, 10);
        this.gameLogic = new GameLogic(this.gameBoard);
        this.UserInput = new UserInput(this.gameLogic);
    }
}