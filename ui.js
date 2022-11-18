import { game } from "./game.js";
import { communication } from "./communication.js";

export const ui = (() => {
  const renderStartScreen = (boolean) => {
    const startScreen = document.querySelector("form");
    const startButton = document.getElementById("startGameButton");

    const crossOne = document.getElementById("crossOne");
    const crossTwo = document.getElementById("crossTwo");
    const circleOne = document.getElementById("circleOne");
    const circleTwo = document.getElementById("circleTwo");

    const AIselection = document.getElementById("AIplayer");
    const playerTwoForm = document.getElementById("playerTwoForm");

    const startingPlayerButton = document.getElementById(
      "startingPlayerButton"
    );
    const startingPlayerPar = document.querySelector("#startingPlayer");
    const startingPlayerSpan = document.querySelector("#startingPlayer span");

    const twoPlayersModeRadio = document.querySelector("#twoPlayersMode");
    const AImodeRadio = document.querySelector("#AImode");
    const AImodeDummy = document.querySelector("#dummyAI");

    const playerOneHeading = document.querySelector(".playerOneHeading");

    const fieldsetPlayerOne = document.querySelector("#playerOneFieldset");
    const fieldsetPlayerTwo = document.querySelector("#playerTwoFieldset");
    const fieldsetAImode = document.querySelector("#AImodeFieldSet");
    const fieldsetDrawStartingPlayer = document.querySelector(
      "#drawStartingPlayer"
    );

    twoPlayersModeRadio.addEventListener("change", () => {
      playerOneHeading.textContent = "Player 1 symbol:";
      fieldsetPlayerOne.classList.remove("invisible");
      fieldsetPlayerTwo.classList.remove("invisible");
      fieldsetAImode.classList.add("invisible");
      fieldsetDrawStartingPlayer.classList.remove("invisible");
      startButton.classList.remove("invisible");
      AIselection.checked = false;
    });

    AImodeRadio.addEventListener("change", () => {
      playerOneHeading.textContent = "Human player symbol:";
      fieldsetPlayerOne.classList.remove("invisible");
      fieldsetPlayerTwo.classList.add("invisible");
      fieldsetAImode.classList.remove("invisible");
      fieldsetDrawStartingPlayer.classList.remove("invisible");
      startButton.classList.remove("invisible");
      AIselection.checked = true;
    });

    crossOne.addEventListener("change", () => {
      if (crossOne.checked) circleTwo.checked = true;
    });
    circleOne.addEventListener("change", () => {
      if (circleOne.checked) crossTwo.checked = true;
    });
    AIselection.addEventListener("change", () => {
      playerTwoForm.classList.toggle("invisible");
    });

    let startingPlayer = 1;

    startingPlayerButton.addEventListener("click", () => {
      startingPlayerPar.classList.remove("invisible");
      startingPlayer = Math.floor(Math.random() * 2 + 1);
      startingPlayerSpan.textContent = startingPlayer;
    });

    const startClick = (evt) => {
      evt.preventDefault();
      let AI = false;
      let AImode = null;
      if (AIselection.checked) {
        AI = true;
        AImode = "unbeatable";
        if (AImodeDummy.checked) AImode = "dummy";
      }
      communication.publish("gameStart", { startingPlayer, AI, AImode });
      renderStartScreen(false);
    };
    if (boolean) {
      startScreen.classList.remove("invisible");
      startButton.addEventListener("click", startClick);
    } else {
      startScreen.classList.add("invisible");
      startButton.removeEventListener("click", startClick);
    }
  };
  const clickHandler = (evt) => {
    communication.publish("handleClick", evt);
  };
  const mouseOver = (evt) => {
    evt.target.classList.add("mouseOver");
    evt.target.textContent = game.gameStats.currentPlayer.symbol;
  };
  const mouseOut = (evt) => {
    evt.target.classList.remove("mouseOver");
    evt.target.textContent = "";
  };
  const hoverEffect = (square, action) => {
    if (action === "add") {
      square.addEventListener("mouseenter", mouseOver);
      square.addEventListener("mouseleave", mouseOut);
    }
    if (action === "remove") {
      square.removeEventListener("mouseenter", mouseOver);
      square.removeEventListener("mouseleave", mouseOut);
    }
  };
  const drawBoard = (object) => {
    const gameInterface = document.getElementById("interface");

    for (let i = 0; i < 3; i++) {
      const rowDiv = document.createElement("div");
      rowDiv.classList.add("rowDiv");
      gameInterface.append(rowDiv);

      for (let j = 0; j < 3; j++) {
        const singleSquare = document.createElement("div");
        singleSquare.classList.add("squareDiv");
        singleSquare.setAttribute("data-row", i);
        singleSquare.setAttribute("data-column", j);
        singleSquare.addEventListener("click", clickHandler, { once: true });
        hoverEffect(singleSquare, "add");
        rowDiv.append(singleSquare);
      }
    }
  };
  const drawStats = () => {
    const gameInterface = document.getElementById("interface");
    const statDiv = document.createElement("div");
    statDiv.classList.add("stats");
    const pOne = document.createElement("p");
    pOne.classList.add("playerOne");
    const pTwo = document.createElement("p");
    pTwo.classList.add("playerTwo");
    const turn = document.createElement("p");
    turn.classList.add("turn");

    statDiv.append(turn, pOne, pTwo);
    gameInterface.append(statDiv);
  };
  const updateStats = (object) => {
    const pOne = document.querySelector(".playerOne");
    const turn = document.querySelector(".turn");
    const pTwo = document.querySelector(".playerTwo");
    turn.textContent = "You're playing round number " + object.gameStats.turns;
    pOne.textContent =
      " (" +
      object.players.playerOne.symbol +
      "): " +
      object.players.playerOne.wins;
    pTwo.textContent =
      " (" +
      object.players.playerTwo.symbol +
      "): " +
      object.players.playerTwo.wins;
    if (object.gameStats.currentPlayer === object.players.playerOne) {
      pOne.classList.add("selected");
      pTwo.classList.remove("selected");
    } else {
      pTwo.classList.add("selected");
      pOne.classList.remove("selected");
    }
    if (object.gameStats.win === true || object.gameStats.draw === true) {
      pOne.classList.remove("selected");
      pTwo.classList.remove("selected");
      if (object.gameStats.win === true) {
        turn.textContent =
          "The winner of turn no " +
          (object.gameStats.turns - 1) +
          " is: " +
          object.gameStats.winner.symbol;
      } else {
        turn.textContent =
          "We have a DRAW in turn no " + (object.gameStats.turns - 1);
      }
    }
  };
  const updateComputation = (computation) => {
    const turn = document.querySelector(".turn");
    turn.textContent +=
      "Analysed " +
      computation.currentCount +
      " games in " +
      computation.currentTime +
      "ms";
  };
  const drawSymbol = (object) => {
    hoverEffect(object.clickedSquare.target, "remove");
    object.clickedSquare.target.classList.remove("mouseOver");
    object.clickedSquare.target.textContent =
      object.gameStats.currentPlayer.symbol;
  };
  const handleWin = (object) => {
    //object.direction = {0: row, 1: column, 2: across, 3: counter-across}
    const singleSquares = document.querySelectorAll(".squareDiv");
    singleSquares.forEach((square) => {
      square.removeEventListener("click", clickHandler);
      hoverEffect(square, "remove");
    });

    if (object.direction === 0 || object.direction === 1) {
      const winningSquares = document.querySelectorAll(
        "[data-" +
          (object.direction === 0 ? "row" : "column") +
          '="' +
          object.gameStats.lastClickCords[object.direction] +
          '"]'
      );
      winningSquares.forEach((square) => square.classList.add("winningSquare"));
    } else if (object.direction === 2) {
      for (let i = 0; i < 3; i++) {
        const winningSquare = document.querySelector(
          '[data-row="' + i + '"][data-column="' + i + '"]'
        );
        winningSquare.classList.add("winningSquare");
      }
    } else if (object.direction === 3) {
      for (let i = 0; i < 3; i++) {
        const winningSquare = document.querySelector(
          '[data-row="' + i + '"][data-column="' + (3 - i - 1) + '"]'
        );
        winningSquare.classList.add("winningSquare");
      }
    }
    createReplay();
  };
  const createReplay = () => {
    const gameInterface = document.getElementById("interface");
    const replayButton = document.createElement("button");
    replayButton.classList.add("replayButton");
    replayButton.textContent = "Replay";
    gameInterface.append(replayButton);
    replayButton.addEventListener("click", () => {
      clearUI();
      communication.publish("gameReplay");
      const button = document.querySelector(".replayButton");
      button.remove(gameInterface);
    });
  };
  const clearUI = () => {
    const singleSquares = document.querySelectorAll(".squareDiv");
    singleSquares.forEach((square) => {
      square.textContent = "";
      square.classList.remove("winningSquare");
      square.addEventListener("click", clickHandler, { once: true });
      hoverEffect(square, "add");
    });
  };

  communication.subscribe("winEvent", handleWin);
  communication.subscribe("gameLogicInitiated", drawBoard);
  communication.subscribe("gameLogicInitiated", drawStats);
  communication.subscribe("gameLogicInitiated", updateStats);
  communication.subscribe("clickEvent", drawSymbol);
  communication.subscribe("turnSwapped", updateStats);
  communication.subscribe("updateStats", updateStats);
  communication.subscribe("drawEvent", createReplay);
  communication.subscribe("AIcomputation", updateComputation);

  return { renderStartScreen };
})();
