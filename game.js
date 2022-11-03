import { communication } from './communication.js'

export const game = (() => {
    let boardArray = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ]
    let gameStats = {
        currentPlayer: null,
        numberOfMoves: 0,
        gridSize: 3,
        win: false,
        winner: null,
        lastClickCords: null //[row, column] 
    }
    let players = {}
    const Player = (player, symbol) => { //player constructor
        return { player, symbol, wins: 0 }
    }
    const initGame = () => {
        const playerOneName = document.getElementById('playerOneName').value;
        const playerTwoName = document.getElementById('playerTwoName').value;
        const playerOneSymbol = document.getElementById('crossOne');
        
        createPlayers(playerOneName, playerTwoName, playerOneSymbol.checked ? 'x' : 'o', playerOneSymbol.checked ? 'o' : 'x')
        gameStats.currentPlayer = players.playerOne;
        communication.publish('gameLogicInitiated', { gameStats, players })
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
        checkForWin();
        changeTurn();
    }
    const changeTurn = () => {
        gameStats.currentPlayer = (gameStats.currentPlayer === players.playerOne ? players.playerTwo : players.playerOne);
    }
    const checkForWin = () => {
        if (winInRow()) { handleWin(0); return true; }
        else if (winInColumn()) {handleWin(1); return true;}
        else if (winAcross()) {handleWin(2); return true;}
        else if (winCounterAcross()) {handleWin(3); return true;}
        else return false;
    }
    const winInColumn = function () {
        for (let i=0; i<gameStats.gridSize; i++) {
            let rowSequence = [];
            boardArray.forEach(element => rowSequence.push(element[i]));
        if (rowSequence.every(element => element === 'x') || rowSequence.every(element => element === 'o')) 
            { gameStats.win = true; gameStats.winner = gameStats.currentPlayer;  break;}
        }
        return gameStats.win;
    }
    const winInRow = function () {
        gameStats.win = boardArray.some(innerArray => {
            if (innerArray.every(element => element === 'x') || innerArray.every(element => element === 'o')) 
            { gameStats.winner = gameStats.currentPlayer; return true; }
        })
        return gameStats.win;
    }
    const winAcross = () => {
        let acrossSequence = [];
        for (let i=0; i<gameStats.gridSize; i++) {
            acrossSequence.push(boardArray[i][i]);
        }
        if (acrossSequence.every(element => element === 'x')) { gameStats.win = true; gameStats.winner = gameStats.currentPlayer; }
        else if (acrossSequence.every(element => element === 'o')) { gameStats.win = true; gameStats.winner = gameStats.currentPlayer; }
        return gameStats.win;
    }
    const winCounterAcross = () => {
        let counterAcrossSequence = [];
        for (let i=0; i<gameStats.gridSize; i++) {
            counterAcrossSequence.push(boardArray[i][gameStats.gridSize-i-1])
        }
        if (counterAcrossSequence.every(element => element === 'x')) { gameStats.win = true; gameStats.winner = gameStats.currentPlayer; }
        else if (counterAcrossSequence.every(element => element === 'o')) { gameStats.win = true; gameStats.winner = gameStats.currentPlayer; }
        return gameStats.win;
    }
    const handleWin = (direction) => {
        gameStats.winner === players.playerOne ? players.playerOne.wins += 1 : players.playerTwo.wins += 1
        communication.publish('winEvent', { gameStats, direction, players})
    }
    const gameReplay = () => {
        console.log(players.playerOne);
        console.log(players.playerTwo);
        boardArray = [[0, 0, 0],[0, 0, 0],[0, 0, 0]];
        gameStats.numberOfMoves = 0;
        gameStats.win = false;
        gameStats.winner = null;
        gameStats.lastClickCords = null;
    }

    communication.subscribe('gameStart', initGame);
    communication.subscribe('handleClick', clickHandler);
    communication.subscribe('gameReplay', gameReplay);

})()