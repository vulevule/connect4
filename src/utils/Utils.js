export function checkVertical(board, size = 4) {
  let [width, heigth] = [board[0].length, board.length];
  // Check only if row is 3 or greater
  for (let r = size - 1; r < heigth; r++) {
    for (let c = 0; c < width; c++) {
      if (board[r][c]) {
        let count = 1;
        let tokens = [[r, c]];
        for (let e = 1; e < size; e++) {
          if (board[r][c] === board[r - e][c]) {
            count++;
            tokens.push([r - e, c]);
            if (count >= size) return [board[r][c], tokens];
          } else {
            count = 0;
            tokens = [[r, c]];
          }
        }

        // if (
        //   board[r][c] === board[r - 1][c] &&
        //   board[r][c] === board[r - 2][c] &&
        //   board[r][c] === board[r - 3][c]
        // ) {
        //   return board[r][c];
        // }
      }
    }
  }
}

export function checkHorizontal(board, size = 4) {
  let heigth = board.length;
  // Check only if column is 3 or less
  for (let r = 0; r < heigth; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c]) {
        let count = 1;
        let tokens = [[r, c]];
        for (let e = 1; e < size; e++) {
          if (board[r][c] === board[r][c + e]) {
            count++;
            tokens.push([r, c + e]);
            if (count >= size) return [board[r][c], tokens];
          } else {
            count = 0;
            tokens = [[r, c]];
          }
        }

        // if (
        //   board[r][c] === board[r][c + 1] &&
        //   board[r][c] === board[r][c + 2] &&
        //   board[r][c] === board[r][c + 3]
        // ) {
        //   return board[r][c];
        // }
      }
    }
  }
}

export function checkDiagonalRight(board, size = 4) {
  let heigth = board.length;
  // Check only if row is 3 or greater AND column is 3 or less
  for (let r = size - 1; r < heigth; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c]) {
        let count = 1;
        let tokens = [[r, c]];
        for (let e = 1; e < size; e++) {
          if (board[r][c] === board[r - e][c + e]) {
            count++;
            tokens.push([r - e, c + e]);
            if (count >= size) return [board[r][c], tokens];
          } else {
            count = 0;
            tokens = [[r, c]];
          }
        }

        // if (
        //   board[r][c] === board[r - 1][c + 1] &&
        //   board[r][c] === board[r - 2][c + 2] &&
        //   board[r][c] === board[r - 3][c + 3]
        // ) {
        //   return board[r][c];
        // }
      }
    }
  }
}

export function checkDiagonalLeft(board, size = 4) {
  let [width, heigth] = [board[0].length, board.length];
  // Check only if row is 3 or greater AND column is 3 or greater
  for (let r = size - 1; r < heigth; r++) {
    for (let c = size - 1; c < width; c++) {
      if (board[r][c]) {
        let count = 1;
        let tokens = [[r, c]];
        for (let e = 1; e < size; e++) {
          if (board[r][c] === board[r - e][c - e]) {
            count++;
            tokens.push([r - e, c - e]);
            if (count >= size) return [board[r][c], tokens];
          } else {
            count = 0;
            tokens = [[r, c]];
          }
        }

        // if (
        //   board[r][c] === board[r - 1][c - 1] &&
        //   board[r][c] === board[r - 2][c - 2] &&
        //   board[r][c] === board[r - 3][c - 3]
        // ) {
        //   return board[r][c];
        // }
      }
    }
  }
}

export function checkDraw(board) {
  let [width, heigth] = [board[0].length, board.length];
  for (let r = 0; r < heigth; r++) {
    for (let c = 0; c < width; c++) {
      if (board[r][c] === null) {
        return null;
      }
    }
  }
  return "draw";
}

export function checkAll(board, size = 4) {
  return (
    checkVertical(board, size) ||
    checkDiagonalRight(board, size) ||
    checkDiagonalLeft(board, size) ||
    checkHorizontal(board, size) ||
    checkDraw(board)
  );
}

export function evaluationCheck(board, size = 4) {
  let checkedDL = checkDiagonalLeft(board, size);
  let checkedDR = checkDiagonalRight(board, size);
  let checkedH = checkHorizontal(board, size);

  return (
    (checkedDL && checkedDL[0]) ||
    (checkedDR && checkedDR[0]) ||
    (checkedH && checkedH[0])
  );
}

export function playable(c, board) {
  for (let r = board.length - 1; r >= 0; r--) {
    if (!board[r][c]) {
      return true;
    }
  }

  return false;
}

export function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export function empty(board) {
  let [width, heigth] = [board[0].length, board.length];
  for (let r = 0; r < heigth; r++) {
    for (let c = 0; c < width; c++) {
      if (board[r][c]) {
        return false;
      }
    }
  }

  return true;
}

export function evaluate(position) {
  //returns position of lowest empty slot in column x
  const maxY = (c, board) => {
    let heigth = board.length - 1;
    while (heigth >= 0 && board[heigth][c]) {
      heigth--;
    }
    return heigth;
  };

  let { board, currentPlayer } = position;
  let [width, heigth] = [board[0].length, board.length];

  //finds next valid move in all columns
  let maxYArray = [];
  for (let c = 0; c < width; c++) {
    maxYArray[c] = maxY(c, board);
  }

  //finds the heighest piece in each column touching another piece
  let maxYHArray = [];
  for (let c = 0; c < width; c++) {
    maxYHArray[c] =
      c !== 0 && maxYArray[c - 1] < maxYArray[c]
        ? maxYArray[c - 1]
        : maxYArray[c];
    maxYHArray[c] =
      c !== width - 1 && maxYArray[c + 1] < maxYArray[c]
        ? maxYArray[c + 1]
        : maxYHArray[c];
    maxYHArray[c] = Math.min(0, maxYHArray[c] - 1);
  }

  console.log(maxYArray);
  console.log(maxYHArray);

  let winningMoves = 0;
  for (let c = 0; c < heigth; c++) {
    for (let r = maxYHArray[c]; r <= maxYArray[c]; r++) {
      if (!board[r][c]) {
        console.log("Checking");

        let opponent = -currentPlayer;

        board[r][c] = currentPlayer;
        if (checkAll(board) === currentPlayer) {
          winningMoves++;
        }

        board[r][c] = opponent;
        if (checkAll(board) === opponent) {
          winningMoves--;
        }

        board[r][c] = null;
      }
    }
  }

  console.log(winningMoves);

  return winningMoves;
}
