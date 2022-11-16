import { communication } from './communication.js'
import { ai } from './ai.js'

export const game = (() => {
    let boardArray = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ]
    let gameStats = {
        currentPlayer: null,
        prevStartPlayer: null,
        numberOfMoves: 0,
        win: false,
        winner: null,
        lastClickCords: null, //[row, column] 
        turns: 1,
        draw: false,
    }
    let players = {}
    const Player = (player, symbol) => { 
        return { player, symbol, wins: 0 }
    }
    const initGame = (o) => {
        const playerOneName = document.getElementById('playerOneName').value;
        const playerTwoName = document.getElementById('playerTwoName').value;
        const playerOneSymbol = document.getElementById('crossOne');
        
        createPlayers(playerOneName, !o.AI ? playerTwoName : 'AI', playerOneSymbol.checked ? 'x' : 'o', playerOneSymbol.checked ? 'o' : 'x')
        gameStats.currentPlayer = o.startingPlayer === 1 ? players.playerOne : players.playerTwo;
        gameStats.prevStartPlayer = gameStats.currentPlayer;
        communication.publish('gameLogicInitiated', { gameStats, players })
        if (gameStats.currentPlayer.player === 'AI') communication.publish('AIturn', {gameStats, boardArray, players})
    }
    const createPlayers = (nameOne, nameTwo, symbolOne, symbolTwo) => {
        const playerOne = Player(nameOne, symbolOne);
        const playerTwo = Player(nameTwo, symbolTwo);
        players.playerOne = playerOne;
        players.playerTwo = playerTwo;
    }
    const clickHandler = (clickedSquare) => {
        boardArray[clickedSquare.target.dataset.row][clickedSquare.target.dataset.column] = gameStats.currentPlayer.symbol;
        gameStats.lastClickCords = [clickedSquare.target.dataset.row, clickedSquare.target.dataset.column]
        gameStats.numberOfMoves += 1;
        communication.publish('clickEvent', { gameStats, clickedSquare, players });
        if (gameStats.numberOfMoves > 4) {
            if (checkForGameOver(boardArray, gameStats) === false) {
                changeTurn();
            }
            else {
                gameStats.currentPlayer = (gameStats.prevStartPlayer === players.playerOne ? players.playerTwo : players.playerOne)
                gameStats.prevStartPlayer = gameStats.currentPlayer;
            }
        } else changeTurn();
        
        communication.publish('turnSwapped', {gameStats, players})
        if (gameStats.currentPlayer.player === 'AI') communication.publish('AIturn', {gameStats, boardArray, players})
    }
    const changeTurn = () => {
        gameStats.currentPlayer = (gameStats.currentPlayer === players.playerOne ? players.playerTwo : players.playerOne);
        
    }
    const checkForGameOver = (boardArray, gameStats) => {
        if (winInRow(boardArray, gameStats)) { handleWin(0); return true; }
        else if (winInColumn(boardArray, gameStats)) {handleWin(1); return true;}
        else if (winAcross(boardArray, gameStats)) {handleWin(2); return true;}
        else if (winCounterAcross(boardArray, gameStats)) {handleWin(3); return true;}
        else if (checkForDraw(boardArray, gameStats)) {handleDraw(); return true;}
        else return false;
    }
    const winInColumn = function (boardArray, gameStats) {
        for (let i=0; i<3; i++) {
            let rowSequence = [];
            boardArray.forEach(element => rowSequence.push(element[i]));
        if (rowSequence.every(element => element === 'x') || rowSequence.every(element => element === 'o')) 
            { gameStats.win = true; gameStats.winner = gameStats.currentPlayer;  break;}
        }
        return gameStats.win;
    }
    const winInRow = function (boardArray, gameStats) {
        gameStats.win = boardArray.some(innerArray => {
            if (innerArray.every(element => element === 'x') || innerArray.every(element => element === 'o')) 
            { gameStats.winner = gameStats.currentPlayer; return true; }
        })
        return gameStats.win;
    }
    const winAcross = (boardArray, gameStats) => {
        let acrossSequence = [];
        for (let i=0; i<3; i++) {
            acrossSequence.push(boardArray[i][i]);
        }
        if (acrossSequence.every(element => element === 'x')) { gameStats.win = true; gameStats.winner = gameStats.currentPlayer; }
        else if (acrossSequence.every(element => element === 'o')) { gameStats.win = true; gameStats.winner = gameStats.currentPlayer; }
        return gameStats.win;
    }
    const winCounterAcross = (boardArray, gameStats) => {
        let counterAcrossSequence = [];
        for (let i=0; i<3; i++) {
            counterAcrossSequence.push(boardArray[i][3-i-1])
        }
        if (counterAcrossSequence.every(element => element === 'x')) { gameStats.win = true; gameStats.winner = gameStats.currentPlayer; }
        else if (counterAcrossSequence.every(element => element === 'o')) { gameStats.win = true; gameStats.winner = gameStats.currentPlayer; }
        return gameStats.win;
    }
    const checkForDraw = (boardArray, gameStats) => {
        if (gameStats.numberOfMoves === 9) return true;
        else return false;
    }
    const handleWin = (direction) => {
        gameStats.winner === players.playerOne ? players.playerOne.wins += 1 : players.playerTwo.wins += 1
        communication.publish('winEvent', { gameStats, direction, players})
        gameStats.turns += 1;
        
    }
    const handleDraw = () => {
        gameStats.draw = true;
        communication.publish('drawEvent')
        gameStats.turns += 1;
    }
    const gameReplay = () => {
        boardArray = [[0, 0, 0],[0, 0, 0],[0, 0, 0]];
        gameStats.numberOfMoves = 0;
        gameStats.win = false;
        gameStats.winner = null;
        gameStats.lastClickCords = null;
        gameStats.draw = false;
        communication.publish('updateStats', {gameStats, players})
        if (gameStats.currentPlayer.player === 'AI') communication.publish('AIturn', {gameStats, boardArray, players})
    }

    communication.subscribe('gameStart', initGame);
    communication.subscribe('handleClick', clickHandler);
    communication.subscribe('gameReplay', gameReplay);

    return {gameStats, checkForGameOver}

})()

//alternate starting players (now based on the last move of the game)