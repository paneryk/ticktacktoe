import { communication } from './communication.js'
import { game } from './game.js';
import { ui } from './ui.js';

export const ai = (() => {

    

    const makeMove = (object) => { //object {gameStats, boardArray, players}
        let optionalMoves = availableMoves(object.boardArray)
        if (object.gameStats.win === false) {
        const calculatedMove = document.querySelector('[data-row="'+optionalMoves[0][0]+'"][data-column="'+optionalMoves[0][1]+'"]');
        const click = () => {calculatedMove.click();}
        setTimeout(click, 1500);
        }

    }

    const availableMoves = (boardArray) => {
        let moves = [];
        for (let i=0; i<3; i++) {
            for (let j=0; j<3; j++) {
                if (boardArray[i][j] === 0) moves.push([i, j])
            }
        }
        return moves;
    }



    communication.subscribe('AIturn', makeMove)
})()

