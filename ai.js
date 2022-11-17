import { communication } from './communication.js'
import { game } from './game.js';
import { ui } from './ui.js';

export const ai = (() => {


    const makeMove = (object) => { //object {gameStats, boardArray, players}
        const currentBoardArray = object.boardArray;

        /* const optionalMoves = availableSquares(currentBoardArray)
            const calculatedMove = document.querySelector('[data-row="'+optionalMoves[0][0]+'"][data-column="'+optionalMoves[0][1]+'"]');
            const click = () => {calculatedMove.click();}
            setTimeout(click, 1500);
        
        
        if (object.gameStats.AImode === 'primitive') {
        if (object.gameStats.win === false) {
            const optionalMoves = availableMoves(currentBoardArray)
            const calculatedMove = document.querySelector('[data-row="'+optionalMoves[0][0]+'"][data-column="'+optionalMoves[0][1]+'"]');
            const click = () => {calculatedMove.click();}
            setTimeout(click, 1500);
        } */
        if (!object.gameStats.win && !object.gameStats.draw) {

        const bestMove = minimax(currentBoardArray, object.gameStats.currentPlayer.symbol, object.players);
        const calculatedMove = document.querySelector('[data-row="'+bestMove.cords[0]+'"][data-column="'+bestMove.cords[1]+'"]');
        calculatedMove.click();
        }
        
         
        
    
    }

    const availableSquares = (boardArray) => {
        let moves = [];
        for (let i=0; i<3; i++) {
            for (let j=0; j<3; j++) {
                if (boardArray[i][j] === 0) moves.push([i, j])
            }
        }
        return moves;
    }

    const minimax = (currentBoardArray, currentSymbol, players) => { //object {gameStats, boardArray, players}
        if (game.checkForWin(currentBoardArray) === true && currentSymbol === players.playerTwo.symbol) return {score: -1} 
        //if currentSymbol is AI's and win is detected - it means human player placed the last symbol so we need to return -1 to treat
        //playerOne as minimizer
        else if (game.checkForWin(currentBoardArray) === true && currentSymbol === players.playerOne.symbol) return {score: 1}
        else if (game.checkForDraw(currentBoardArray) === true) return {score: 0};

        const moves = []; //moves is an array [[cords, score], [cords, score], ...]
        let availableMoves = availableSquares(currentBoardArray);

        for (let i=0; i<availableMoves.length; i++) {

            let move = {};
            move.cords = [availableMoves[i][0], availableMoves[i][1]];
            
            currentBoardArray[availableMoves[i][0]][availableMoves[i][1]] = currentSymbol;
            
            if (currentSymbol === players.playerTwo.symbol) {
                let result = minimax(currentBoardArray, players.playerOne.symbol, players);
                move.score = result.score
            }
            else {
                let result = minimax(currentBoardArray, players.playerTwo.symbol, players);
                move.score = result.score
            }
            currentBoardArray[availableMoves[i][0]][availableMoves[i][1]] = 0;
            moves.push(move)
        }

        let bestTestPlay = null;

        if (currentSymbol === players.playerTwo.symbol) { //moves is an array [[cords, score], [cords, score], ...]
            let bestScore = -Infinity;
            for (let i=0; i<moves.length; i++) {
                if (moves[i].score > bestScore) {
                    bestScore = moves[i].score;
                    bestTestPlay = i
                }
            }
        } else {
            let bestScore = Infinity;
            for (let i=0; i<moves.length; i++) {
                if (moves[i].score < bestScore) {
                    bestScore = moves[i].score;
                    bestTestPlay = i
                }
            }
        }
        return moves[bestTestPlay]
        }

        

    communication.subscribe('AIturn', makeMove)
})()

//dummy AI - random square out of available
