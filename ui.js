import { game } from './game.js'
import { communication } from './communication.js'

export const ui = (() => {
    const renderStartScreen = (boolean) => {
        const startScreen = document.querySelector('form');
        const startButton = document.getElementById('startGameButton');
        const startClick = (evt) => {
            evt.preventDefault(); 
            communication.publish('gameStart');
            renderStartScreen(false);
        }
        if (boolean) { 
        startScreen.classList.remove('invisible');
        startButton.addEventListener('click', startClick);
        } else { 
        startScreen.classList.add('invisible');
        startButton.removeEventListener('click', startClick);
        }
    }
    const clickHandler = (evt) => {
        communication.publish('handleClick', evt);
    }
    const drawBoard = (object) => {
        const gameInterface = document.getElementById('interface');

        for (let i=0; i<object.gameStats.gridSize; i++) {
            const rowDiv = document.createElement('div');
            rowDiv.classList.add('rowDiv');
            gameInterface.append(rowDiv);

            for (let j=0; j<object.gameStats.gridSize; j++) {
                const singleSquare = document.createElement('div');
                singleSquare.classList.add('squareDiv');
                singleSquare.setAttribute('data-row', i)
                singleSquare.setAttribute('data-column', j)
                singleSquare.addEventListener('click', clickHandler, {once: true})
                rowDiv.append(singleSquare);
            }    
        }
    }
    const drawSymbol = (object) => {
        object.clickedSquare.target.textContent = object.gameStats.currentPlayer.symbol;   
    }
    const handleWin = (object) => { //object.direction = {0: row, 1: column, 2: across, 3: counter-across}
        const singleSquares = document.querySelectorAll('.squareDiv');
        singleSquares.forEach(square => square.removeEventListener('click', clickHandler))
        
        if (object.direction === 0 || object.direction === 1) { 
            const winningSquares = document.querySelectorAll('[data-'+(object.direction===0?'row':'column')+'="'+object.gameStats.lastClickCords[object.direction]+'"]');
            winningSquares.forEach(square => square.classList.add('winningSquare'));
        }
        else if (object.direction === 2) { //across
            for (let i=0; i<object.gameStats.gridSize; i++) {
            const winningSquare = document.querySelector('[data-row="'+i+'"][data-column="'+i+'"]');
            winningSquare.classList.add('winningSquare');
            }
        }
        else if (object.direction === 3) { //counter-across
            for (let i=0; i<object.gameStats.gridSize; i++) {
            const winningSquare = document.querySelector('[data-row="'+i+'"][data-column="'+(object.gameStats.gridSize-i-1)+'"]');
            winningSquare.classList.add('winningSquare');
            }
        }
        console.log('The winner is: ')
        console.log(object.gameStats.winner)

        //creating replay button
        const gameInterface = document.getElementById('interface');
        const replayButton = document.createElement('button');
        replayButton.classList.add('replayButton');
        replayButton.textContent = 'Replay';
        gameInterface.append(replayButton);
        replayButton.addEventListener('click', () => { communication.publish('gameReplay'); clearUI();  const button = document.querySelector('.replayButton'); button.remove(gameInterface)})
    }
    const clearUI = () => {
        const singleSquares = document.querySelectorAll('.squareDiv');
        singleSquares.forEach(square => {square.textContent = ''; square.classList.remove('winningSquare'); square.addEventListener('click', clickHandler, {once: true})})
    }

    communication.subscribe('winEvent', handleWin)
    communication.subscribe('gameLogicInitiated', drawBoard)
    communication.subscribe('clickEvent', drawSymbol)

    return { renderStartScreen }
})()