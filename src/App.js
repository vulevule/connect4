import React, { Component } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import {
  ToastsContainer,
  ToastsContainerPosition,
  ToastsStore
} from "react-toasts";
import "./App.css";
import Solver from "./classes/Solver";
import { EASY, HARD, MEDIUM } from "./consts/Consts";
import { checkAll, clone, playable } from "./utils/Utils";

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      width: 6,
      heigth: 6,
      player1: 1,
      player2: -1,
      currentPlayer: null,
      board: [],
      connected: [],
      gameOver: false,
      message: "",
      depth: 2
    };

    this.play = this.play.bind(this);
  }

  componentDidMount() {
    this.initBoard();
  }

  handleDepthChange = e => {
    this.setState({ depth: e.target.value });
  };

  initBoard = () => {
    let { width, heigth, player1, player2 } = this.state;
    let board = [];
    for (let r = 0; r < heigth; r++) {
      board.push(new Array(width).fill(null));
    }

    let players = [player1, player2];
    let initialPlayer = players[Math.round(Math.random())];

    this.setState({
      board,
      connected: [],
      currentPlayer: initialPlayer,
      gameOver: false,
      message: ""
    });

    if (initialPlayer === player2) {
      setTimeout(() => {
        let [board, newPlayer] = this.play(
          Math.floor(width / 2) - Math.round(Math.random()),
          initialPlayer
        );
        this.setState({ board, currentPlayer: newPlayer });
      }, 500);
    }
  };

  togglePlayer = () => {
    return this.state.currentPlayer === this.state.player1
      ? this.state.player2
      : this.state.player1;
  };

  computeScores = (board, currentPlayer) => {
    if (currentPlayer === this.state.player2) {
      let { depth, width } = this.state;

      let solver = new Solver(width);

      let bestMove = solver.solve(clone(board), currentPlayer, depth);
      return bestMove;
    } else {
      // Some exception handling, or maybe allow all
    }
  };

  playHuman = async c => {
    let { gameOver, currentPlayer, player2 } = this.state;
    if (gameOver) {
      ToastsStore.warning("Game over! Please start a new game.");
      //this.setState({ message: "Game over. Please start a new game." });
      return;
    }
    if (currentPlayer === player2) {
      ToastsStore.warning("I'm thinking. Be patient!");
      return;
    }

    let [board, newPlayer] = this.play(c);
    if (!board && !newPlayer) return;
    await this.setState({ board, currentPlayer: newPlayer });
    setTimeout(() => {
      this.playAI(board, newPlayer);
    }, 500);
  };

  playAI = (
    board = this.state.board,
    currentPlayer = this.state.currentPlayer
  ) => {
    let { gameOver, player1 } = this.state;
    if (gameOver || currentPlayer === player1) {
      return;
    }
    let bestMove = this.computeScores(clone(board), currentPlayer);
    this.play(bestMove.move);
  };

  play = (c, currentPlayer = this.state.currentPlayer) => {
    let { board, heigth, player1, player2 } = this.state;
    let newPlayer = -currentPlayer;

    if (playable(c, board)) {
      // Place piece on board
      for (let r = heigth - 1; r >= 0; r--) {
        if (!board[r][c]) {
          board[r][c] = currentPlayer;
          break;
        }
      }

      // Check status of board
      let result = checkAll(board);
      if (result && result[0] === player1) {
        this.setState({
          board,
          connected: result[1],
          gameOver: true,
          currentPlayer: null
        });
        ToastsStore.success("You won!");
      } else if (result && result[0] === player2) {
        this.setState({
          board,
          connected: result[1],
          gameOver: true,
          currentPlayer: null
        });
        ToastsStore.error("You lost!");
      } else if (result === "draw") {
        this.setState({ board, gameOver: true, currentPlayer: null });
        ToastsStore.warning("Draw game.");
      } else {
        this.setState({ board, currentPlayer: newPlayer });
        return [board, newPlayer];
      }
    } else {
      // Inform somehow the user that the column is full
      ToastsStore.warning("That column is full my friend.");
      return [null, null];
    }

    return [null, null];
  };

  render = () => {
    let {
      board,
      message,
      gameOver,
      depth,
      currentPlayer,
      player1,
      player2,
      connected
    } = this.state;
    return (
      <div>
        <p className="message">
          Game complexity:{" "}
          <input
            value={EASY}
            onChange={this.handleDepthChange}
            checked={depth < MEDIUM}
            name="depth"
            type="radio"
          ></input>
          <label> Easy </label>
          <input
            value={MEDIUM}
            onChange={this.handleDepthChange}
            //checked={depth === MEDIUM}
            name="depth"
            type="radio"
          ></input>
          <label> Medium </label>
          <input
            value={HARD}
            onChange={this.handleDepthChange}
            //checked={depth === HARD}
            name="depth"
            type="radio"
          ></input>
          <label> Hard </label>
        </p>
        <p className="note">
          <b>*Note:</b> Greater complexity requires more time to calculate AI's
          best move.
        </p>
        <p className="note">First player will be randomly selected. You are the red player.</p>
        <div
          className="button"
          onClick={() => {
            this.initBoard();
          }}
        >
          New Game
        </div>

        <div className="tableContainer">
          <ClipLoader
            css={"position: absolute;"}
            sizeUnit={"px"}
            size={150}
            color={"#123abc"}
            loading={currentPlayer === player2}
          />
          <table
            className={currentPlayer === player2 ? "tableLoading" : "table"}
          >
            <thead></thead>
            <tbody>
              {board.map((row, i) => (
                <Row
                  key={i}
                  rowIndex={i}
                  row={row}
                  play={this.playHuman}
                  tokens={connected}
                  gameOver={gameOver}
                />
              ))}
            </tbody>
          </table>
        </div>

        <p className="message">
          {gameOver
            ? ""
            : currentPlayer === player1
            ? "You play now"
            : "I'm thinking..."}
        </p>
        <p className="message">{message}</p>

        <ToastsContainer
          store={ToastsStore}
          position={ToastsContainerPosition.TOP_CENTER}
        />
      </div>
    );
  };
}

const Row = ({ rowIndex, row, play, tokens, gameOver }) => {
  return (
    <tr>
      {row.map((cell, i) => (
        <Cell
          key={i}
          value={cell}
          columnIndex={i}
          play={play}
          connected={tokens.some(a =>
            [rowIndex, i].every((v, i) => v === a[i])
          )}
          gameOver={gameOver}
        />
      ))}
    </tr>
  );
};

const Cell = ({ value, columnIndex, play, connected, gameOver }) => {
  let color = "white";
  if (value === 1) {
    color = "red";
  } else if (value === -1) {
    color = "yellow";
  }

  return (
    <td>
      <div
        className={`cell ${
          gameOver ? (connected ? "connected" : "notConnected") : ""
        }`}
        onClick={() => {
          play(columnIndex);
        }}
      >
        <div className={color}></div>
      </div>
    </td>
  );
};
