# Connect 4 game with AI

Connect 4 interactive game with AI heuristics for playing against the computer. Whole aplication is written in React.js.

## Instalation

Run command prompt or any shell and open project directory.  
Run `npm install` and then `npm start` and the application will open in your default browser.

## Usage

Application randomly selects first player (human or AI) and depending on that, allowes player to play first move or plays move itself. Player can choose level of the game (easy, medium, hard). Greater complexity requires more time to calculate AI's best move. This will be further described in the algorithm below.

## Algorithm

Application uses Negamax version of Minimax algorithm with Alpha-Beta prunning for calculating next best move depending on board's previous state and current player. Algorithm produces a **_tree_** containing all game states as a tree nodes. Every node has it's own value, representing distance to victory. The bigger the value, the better state will be for current player. Algorithm searches through the tree to find the best victory path.

Since the total number of all possible game states produces enourmous computational cost, evaluation function is added to calculate (estimate) next state's value under the specified depth of search.  
This is typical _performance vs. computational cost trade-off_, so optimal search depth for Connect 4 game would be **5**, since most human players usually think 5 moves in advance. This parameter can be set in game complexity: _Easy - 2, Medium - 5, Hard - 8_.  
At hard level, computer will beat you most of the time :)

_Evaluation function_ is the most important part of the algorithm, since most of the game states are calculated through this. There can be many different implementations, the one considered here prooved itself quite useful: Calculate all potential connected fours, threes, and twos for both players and substract them. Multiply results by specified weigths (potentially connected four is more valuable for victory than threes or twos )

```javascript
const EVAL_WEIGHTS = {
  FOURS: 10,
  THREES: 5,
  TWOS: 2
};

const evaluate = position => {
  let { board, currentPlayer } = position; // current game state, represented with 2D array and player on move

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

        // evaluationCheck() returns true if there are connected tokens for the given board
        // and for how many tokens connected we are looking for
        boardCopy[r][c] = currentPlayer;
        if (currentPlayer === evaluationCheck(boardCopy, 4)) myFours++;
        if (currentPlayer === evaluationCheck(boardCopy, 3)) myThrees++;
        if (currentPlayer === evaluationCheck(boardCopy, 2)) myTwos++;

        // do the same for the opposite player
        let opponent = -currentPlayer;
        boardCopy[r][c] = opponent;
        if (opponent === evaluationCheck(boardCopy, 4)) oppFours++;
        if (opponent === evaluationCheck(boardCopy, 3)) oppThrees++;
        if (opponent === evaluationCheck(boardCopy, 2)) oppTwos++;
      }
    }
  }

  // substract results, multiplied by given weigths
  let value =
    (myFours - oppFours) * EVAL_WEIGHTS.FOURS +
    (myThrees - oppThrees) * EVAL_WEIGHTS.THREES +
    (myTwos - oppTwos) * EVAL_WEIGHTS.TWOS;

  return value;
};
```

## Optimization

_Alpha-Beta prunning_ is added for reducing unneccesary searches. In short: It skips some branches of search tree which will never have impact on the final result. More info on the [link][1].

_Move ordering_ is added to give advantage to some moves who mostly have better chance of being victorious. If the column order goes like this: [1,2,3,4,5,6], columns will be explored in order: [3,4,2,5,1,6]. Reason for this is that columns in the middle of the board have usually more chance for win.

Some other optimizations like _Iterative deepening_ and _Transposition table_ will be added in future releases.

[1]: https://en.wikipedia.org/wiki/Alpha%E2%80%93beta_pruning
