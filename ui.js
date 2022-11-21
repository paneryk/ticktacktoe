import { game } from "./game.js";
import { communication } from "./communication.js";

export const ui = (() => {
  const renderStartScreen = (boolean) => {
    const startScreen = document.querySelector("form");
    const startButton = document.getElementById("startGameButton");

    const crossOne = document.getElementById("crossOne");
    const crossTwo = document.getElementById("crossTwo");

    const wrapperTape = document.getElementById("wrapperTape");
    const returnToStartScreen = document.getElementById("returnToStartScreen");

    const AIselection = document.getElementById("AIplayer");
    const playerTwoForm = document.getElementById("playerTwoForm");

    const startingPlayerCheckbox = document.querySelector("#startingPlayer");

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
      wrapperTape.classList.add("swipeToCenter");
    });

    AImodeRadio.addEventListener("change", () => {
      wrapperTape.classList.add("swipeToCenter");
    });

    returnToStartScreen.addEventListener("click", () => {
      wrapperTape.classList.remove("swipeToCenter");
      twoPlayersModeRadio.checked = false;
      AImodeRadio.checked = false;
    });

    endGame.addEventListener("click", () => {
      window.location.reload();
    });

    crossOne.addEventListener("change", () => {
      if (crossOne.checked) crossTwo.checked = false;
      if (!crossOne.checked) crossTwo.checked = true;
    });

    crossTwo.addEventListener("change", () => {
      if (crossTwo.checked) crossOne.checked = false;
      if (!crossTwo.checked) crossOne.checked = true;
    });

    twoPlayersModeRadio.addEventListener("change", () => {
      playerOneHeading.textContent = "Warrior 1:";
      fieldsetPlayerOne.classList.remove("invisible");
      fieldsetPlayerTwo.classList.remove("invisible");
      fieldsetAImode.classList.add("invisible");
      fieldsetDrawStartingPlayer.classList.remove("invisible");
      startButton.classList.remove("invisible");
      AIselection.checked = false;
    });

    AImodeRadio.addEventListener("change", () => {
      playerOneHeading.textContent = "Your symbol:";
      fieldsetPlayerOne.classList.remove("invisible");
      fieldsetPlayerTwo.classList.add("invisible");
      fieldsetAImode.classList.remove("invisible");
      fieldsetDrawStartingPlayer.classList.remove("invisible");
      startButton.classList.remove("invisible");
      AIselection.checked = true;
    });

    AIselection.addEventListener("change", () => {
      playerTwoForm.classList.toggle("invisible");
    });

    const startClick = (evt) => {
      evt.preventDefault();
      wrapperTape.classList.add("swipeToLeft");
      let AI = false;
      let AImode = null;
      let startingPlayer = startingPlayerCheckbox.checked ? 1 : 2;
      if (AIselection.checked) {
        AI = true;
        AImode = "unbeatable";
        if (AImodeDummy.checked) AImode = "dummy";
      }
      communication.publish("gameStart", { startingPlayer, AI, AImode });
      /* renderStartScreen(false); */
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

    statDiv.append(pOne, pTwo, turn);
    gameInterface.append(statDiv);
  };
  const updateStats = (object) => {
    const pOne = document.querySelector(".playerOne");
    const turn = document.querySelector(".turn");
    const pTwo = document.querySelector(".playerTwo");
    turn.textContent = "Round " + object.gameStats.turns;
    pOne.textContent =
      object.players.playerOne.symbol +
      " - " +
      object.players.playerOne.wins +
      " : ";
    pTwo.textContent =
      " " +
      object.players.playerTwo.wins +
      " - " +
      object.players.playerTwo.symbol;

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
          "The winner of round " +
          (object.gameStats.turns - 1) +
          " is: " +
          object.gameStats.winner.symbol;
      } else {
        turn.textContent =
          "We have a DRAW in turn no " + (object.gameStats.turns - 1);
      }
    }
  };

  const drawSymbol = (object) => {
    hoverEffect(object.clickedSquare.target, "remove");
    object.clickedSquare.target.classList.remove("mouseOver");
    object.clickedSquare.target.textContent =
      object.gameStats.currentPlayer.symbol;
    if (object.gameStats.currentPlayer.symbol === "x")
      object.clickedSquare.target.classList.add("opponent");
  };

  const handleWin = (object) => {
    //object.direction = {0: row, 1: column, 2: across, 3: counter-across}
    const singleSquares = document.querySelectorAll(".squareDiv");

    const winningLine = document.createElement("div");
    winningLine.setAttribute("id", "winningLine");
    const board = document.getElementById("interface");

    board.append(winningLine);

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

      if (object.direction === 0) {
        winningLine.style = `top: ${
          object.gameStats.lastClickCords[0] * 100 + 50
        }px; animation: straight 0.2s ease-in; animation-fill-mode: forwards;`;
      } else if (object.direction === 1) {
        winningLine.style = `top: 25px; left: ${
          object.gameStats.lastClickCords[1] * 100 + 50
        }px; transform-origin: left center; transform: rotate(90deg); 
        animation: straight 0.2s ease-in; animation-fill-mode: forwards;`;
      }

      winningSquares.forEach((square) => square.classList.add("winningSquare"));
    } else if (object.direction === 2) {
      for (let i = 0; i < 3; i++) {
        const winningSquare = document.querySelector(
          '[data-row="' + i + '"][data-column="' + i + '"]'
        );
        winningSquare.classList.add("winningSquare");
        winningLine.style = `top: 25px; transform-origin: left center; transform: rotate(45deg); 
        animation: diagonal 0.2s ease-in; animation-fill-mode: forwards;`;
      }
    } else if (object.direction === 3) {
      for (let i = 0; i < 3; i++) {
        const winningSquare = document.querySelector(
          '[data-row="' + i + '"][data-column="' + (3 - i - 1) + '"]'
        );
        winningSquare.classList.add("winningSquare");
        winningLine.style = `top: 25px; left: 275px; transform-origin: left center; 
        transform: rotate(135deg); animation: diagonal 0.2s ease-in; animation-fill-mode: forwards;`;
      }
    }
    createReplay();
  };

  const createReplay = () => {
    const gameInterface = document.getElementById("interface");
    const replayButton = document.createElement("button");
    replayButton.classList.add("replayButton");
    replayButton.textContent = "Next round";
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
    const winningLine = document.querySelector("#winningLine");

    if (!!winningLine) winningLine.remove();
    singleSquares.forEach((square) => {
      square.textContent = "";
      square.classList.remove("winningSquare");
      square.classList.remove("opponent");
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

  return { renderStartScreen };
})();
