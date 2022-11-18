import { communication } from "./communication.js";
import { game } from "./game.js";

export const ai = (() => {
  let computation = {
    currentTime: 0,
    currentCount: 0,
    totalTime: 0,
    totalCount: 0,
  };

  const makeMove = (object) => {
    //object {gameStats, boardArray, players}
    const currentBoardArray = object.boardArray;

    if (!object.gameStats.win && !object.gameStats.draw) {
      if (object.gameStats.AImode === "unbeatable") {
        let startTime = performance.now();
        const bestMove = minimax(
          currentBoardArray,
          object.gameStats.currentPlayer.symbol,
          object.players
        );
        let endTime = performance.now();
        computation.currentTime = Math.floor(endTime - startTime);
        const calculatedMove = document.querySelector(
          '[data-row="' +
            bestMove.cords[0] +
            '"][data-column="' +
            bestMove.cords[1] +
            '"]'
        );
        calculatedMove.click();
        communication.publish("AIcomputation", computation);
        console.log(
          "Analysed " +
            computation.currentCount +
            " games in " +
            computation.currentTime +
            "ms"
        );
        computation.currentCount = 0;
      } else if (object.gameStats.AImode === "dummy") {
        const optionalMoves = availableSquares(currentBoardArray);
        let randomMove = Math.floor(Math.random() * optionalMoves.length);
        const calculatedMove = document.querySelector(
          '[data-row="' +
            optionalMoves[randomMove][0] +
            '"][data-column="' +
            optionalMoves[randomMove][1] +
            '"]'
        );
        calculatedMove.click();
      }
    }
  };

  const availableSquares = (boardArray) => {
    let moves = [];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (boardArray[i][j] === 0) moves.push([i, j]);
      }
    }
    return moves;
  };

  const minimax = (currentBoardArray, currentSymbol, players) => {
    if (
      game.checkForWin(currentBoardArray) === true &&
      currentSymbol === players.playerTwo.symbol
    ) {
      computation.currentCount += 1;
      return { score: -1 };
    } else if (
    /* if currentSymbol is AI's and win is detected - it means human player placed the 
    last symbol so we need to return -1 to treat
    playerOne as minimizer */
      game.checkForWin(currentBoardArray) === true &&
      currentSymbol === players.playerOne.symbol
    ) {
      computation.currentCount += 1;
      return { score: 1 };
    } else if (game.checkForDraw(currentBoardArray) === true) {
      computation.currentCount += 1;
      return { score: 0 };
    }

    const moves = []; //moves = [[cords, score], [cords, score], ...]
    let availableMoves = availableSquares(currentBoardArray);

    for (let i = 0; i < availableMoves.length; i++) {
      let move = {};
      move.cords = [availableMoves[i][0], availableMoves[i][1]];

      currentBoardArray[availableMoves[i][0]][availableMoves[i][1]] =
        currentSymbol;

      if (currentSymbol === players.playerTwo.symbol) {
        let result = minimax(
          currentBoardArray,
          players.playerOne.symbol,
          players
        );
        move.score = result.score;
      } else {
        let result = minimax(
          currentBoardArray,
          players.playerTwo.symbol,
          players
        );
        move.score = result.score;
      }
      currentBoardArray[availableMoves[i][0]][availableMoves[i][1]] = 0;

      moves.push(move);
    }

    let bestTestPlay = null;

    if (currentSymbol === players.playerTwo.symbol) {
      let bestScore = -Infinity;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score > bestScore) {
          //moves = [[cords, score], [cords, score], ...]
          bestScore = moves[i].score;
          bestTestPlay = i;
        }
      }
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score < bestScore) {
          bestScore = moves[i].score;
          bestTestPlay = i;
        }
      }
    }

    return moves[bestTestPlay];
  };

  communication.subscribe("AIturn", makeMove);
})();
