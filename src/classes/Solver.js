import { EVAL_WEIGHTS, MAX_VALUE, MIN_VALUE } from "../consts/Consts";
import { checkDraw, clone, evaluationCheck, playable } from "../utils/Utils";
import Position from "./Position";

export default class Solver {
  constructor(width) {
    let columns = [...Array(width).keys()];
    columns.sort(
      (a, b) =>
        Math.abs(columns.indexOf(a) - columns.length / 2) -
        Math.abs(columns.indexOf(b) - columns.length / 2)
    );

    this.columns = columns;
  }

  negamax = position => {
    let { columns } = this;
    let { board, currentPlayer } = clone(position);

    // check for draw game
    if (checkDraw(board)) {
      return { value: 0 };
    }

    console.log("Board", board, "Player", currentPlayer);
    // check if current player can win next move
    for (let c of columns) {
      if (playable(c, board)) {
        if (position.isWinningMove(c)) {
          console.log("Winning " + c);
          return { move: c, value: MAX_VALUE };
        }
      }
    }

    let bestScore = { move: null, value: MIN_VALUE };

    for (let c of columns) {
      if (playable(c, board)) {
        let p2 = new Position(board, currentPlayer);
        p2.play(c); // It's opponent turn in P2 position after current player plays x column.

        let score = -this.negamax(p2); // If current player plays col x, his score will be the opposite of opponent's score after playing col x
        console.log(
          "Board",
          p2.board,
          "Player",
          p2.currentPlayer,
          "Score",
          score.value
        );

        if (score.value > bestScore.value) bestScore = score; // keep track of best possible score so far.
      }
    }

    return bestScore;
  };

  negamaxAB = (position, alpha, beta, depth) => {
    let { columns } = this;
    let { board, currentPlayer } = position;

    //console.log("Board ", board, "Player", currentPlayer, "Depth: ", depth);

    //check for draw game
    if (checkDraw(board)) {
      return { value: 0 };
    }

    // check if current player can win next move
    for (let c of columns) {
      if (playable(c, board)) {
        if (position.isWinningMove(c)) {
          //console.log("Winning " + c, "Board", board);
          return { move: c, value: MAX_VALUE };
        }
      }
    }

    //check if opponent can win next move
    let p2 = new Position(clone(board), -currentPlayer);
    for (let c of columns) {
      if (playable(c, board)) {
        if (p2.isWinningMove(c)) {
          //console.log("Loosing " + c, "Board", board);
          return { move: c, value: MAX_VALUE };
        }
      }
    }

    if (depth === 0) {
      let value = currentPlayer * this.evaluate(clone(position));
      //console.log("Evaluated: " + value, "Board", position.board);
      return { value };
    }

    let bestScore = { move: null, value: MIN_VALUE };

    // compute the score of all possible next move and keep the best one
    for (let c of columns) {
      if (playable(c, board)) {
        let p2 = new Position(clone(board), currentPlayer);

        p2.play(c); // It's opponent turn in P2 position after current player plays c column.

        let result = this.negamaxAB(
          p2,
          { move: beta.move, value: -beta.value },
          { move: alpha.move, value: -alpha.value },
          depth - 1
        );
        result.value = -result.value;
        if (!result.move) result.move = c;

        // explore opponent's score within [-beta;-alpha] windows:
        // no need to have good precision for score better than beta (opponent's score worse than -beta)
        // no need to check for score worse than alpha (opponent's score worse better than -alpha)

        if (result.value > bestScore.value) {
          bestScore = clone(result); // prune the exploration if we find a possible move better than what we were looking for.
        }

        if (bestScore.value > alpha.value) {
          alpha = clone(bestScore); // reduce the [alpha;beta] window for next exploration, as we only need to search for a position that is better than the best so far.
        }

        if (alpha.value >= beta.value) {
          return clone(alpha);
          //break;
        }
      }
    }
    return bestScore;
  };

  minimax = (position, alpha, beta, depth) => {
    let { columns } = this;
    let { board, currentPlayer } = position;

    console.log("Board ", board, "Player", currentPlayer, "Depth ", depth);

    // check if current player can win next move
    for (let c of columns) {
      if (playable(c, board)) {
        if (position.isWinningMove(c)) {
          console.log("Winning " + c);
          return MAX_VALUE;
        }
      }
    }

    //check if opponent can win next move
    let p2 = new Position(board, -currentPlayer);
    for (let c of columns) {
      if (playable(c, board)) {
        if (p2.isWinningMove(c)) {
          console.log("Loosing " + c);
          return MAX_VALUE;
        }
      }
    }

    if (depth === 0) {
      let value = this.evaluate(position);
      console.log("Evaluated: " + value);
      return value;
    }

    // Computer
    if (currentPlayer === -1) {
      let bestScore = MIN_VALUE;

      for (let c of columns) {
        if (playable(c, board)) {
          let p2 = new Position(board, currentPlayer);
          p2.play(c); // It's opponent turn in P2 position after current player plays c column.

          let result = this.minimax(p2, alpha, beta, depth - 1);
          //result.move = c;

          if (result > bestScore) {
            bestScore = clone(result);
          }
          if (bestScore > alpha) {
            alpha = clone(bestScore);
          }
          if (alpha >= beta) {
            break;
          }
        }
      }
      return bestScore;
    }
    // Human
    else {
      let bestScore = MAX_VALUE;

      for (let c of columns) {
        if (playable(c, board)) {
          let p2 = new Position(board, currentPlayer);
          p2.play(c); // It's opponent turn in P2 position after current player plays c column.

          let result = this.minimax(p2, alpha, beta, depth - 1);
          //result.move = c;

          if (result < bestScore) {
            bestScore = clone(result);
          }
          if (bestScore < alpha) {
            alpha = clone(bestScore);
          }
          if (alpha >= beta) {
            break;
          }
        }
      }
      return bestScore;
    }
  };

  evaluate = position => {
    let { board, currentPlayer } = position;
    let [width, heigth] = [board[0].length, board.length];
    let myFours = 0;
    let myThrees = 0;
    let myTwos = 0;
    let oppFours = 0;
    let oppThrees = 0;
    let oppTwos = 0;
    for (let r = 0; r < heigth; r++) {
      for (let c = 0; c < width; c++) {
        if (!board[r][c]) {
          let boardCopy = clone(board);

          boardCopy[r][c] = currentPlayer;
          if (currentPlayer === evaluationCheck(boardCopy, 4)) myFours++;
          if (currentPlayer === evaluationCheck(boardCopy, 3)) myThrees++;
          if (currentPlayer === evaluationCheck(boardCopy, 2)) myTwos++;

          let opponent = -currentPlayer;
          boardCopy[r][c] = opponent;
          if (opponent === evaluationCheck(boardCopy, 4)) oppFours++;
          if (opponent === evaluationCheck(boardCopy, 3)) oppThrees++;
          if (opponent === evaluationCheck(boardCopy, 2)) oppTwos++;
        }
      }
    }

    let value =
      (myFours - oppFours) * EVAL_WEIGHTS.FOURS +
      (myThrees - oppThrees) * EVAL_WEIGHTS.THREES +
      (myTwos - oppTwos) * EVAL_WEIGHTS.TWOS;

    return value;
  };

  runMinimax = (board, currentPlayer, depth) => {
    //let position = new Position(board, currentPlayer);
    let { columns } = this;

    let bestScore = MIN_VALUE;
    let bestMove = null;
    let alpha = { value: MIN_VALUE };
    let beta = { value: MAX_VALUE };

    for (let c of columns) {
      if (playable(c, board)) {
        let p2 = new Position(board, currentPlayer);
        p2.play(c);

        let result = this.minimax(p2, alpha, beta, depth);

        if (bestScore < result) {
          bestScore = clone(result);
          bestMove = c;
        }
      }
    }

    return { move: bestMove, value: bestScore };
  };

  solve = (board, currentPlayer, depth, type = 1) => {
    let position = new Position(board, currentPlayer);
    if (type === 1) {
      return this.negamaxAB(
        position,
        { value: MIN_VALUE },
        { value: MAX_VALUE },
        depth
      );
    } else if (type === 2) {
      return this.negamax(position);
    } else {
      return this.runMinimax(board, currentPlayer, depth);
    }
  };
}
