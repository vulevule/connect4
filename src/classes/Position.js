import { checkAll, clone } from "../utils/Utils";

export default class Position {
  constructor(board = [], currentPlayer = 1) {
    this.board = board;
    this.currentPlayer = currentPlayer;
  }

  isWinningMove = c => {
    let board = clone(this.board);
    let heigth = board.length;
    let { currentPlayer } = this;

    for (let r = heigth - 1; r >= 0; r--) {
      if (!board[r][c]) {
        board[r][c] = currentPlayer;
        return currentPlayer === checkAll(board);
      }
    }
  };

  play = (c, board = this.board) => {
    let { currentPlayer } = this;
    let heigth = board.length;

    for (let r = heigth - 1; r >= 0; r--) {
      if (!board[r][c]) {
        board[r][c] = currentPlayer;
        break;
      }
    }

    this.togglePlayer();

    return board;
  };

  togglePlayer = () => {
    this.currentPlayer = -this.currentPlayer;
  };
}
