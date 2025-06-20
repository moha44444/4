const boardSize = 8;
let board = [];
let currentPlayer = "B"; // B = プレイヤー, W = AI
const boardElement = document.getElementById("board");
const turnDisplay = document.getElementById("turn");
const resetButton = document.getElementById("resetButton");

const directions = [
  [-1, -1], [-1, 0], [-1, 1],
  [ 0, -1],         [ 0, 1],
  [ 1, -1], [ 1, 0], [ 1, 1]
];

function initBoard() {
  board = Array.from({ length: boardSize }, () => Array(boardSize).fill(""));
  board[3][3] = "W"; board[3][4] = "B";
  board[4][3] = "B"; board[4][4] = "W";
  renderBoard();
  updateTurnText();
}

function renderBoard() {
  boardElement.innerHTML = "";
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.addEventListener("click", () => handleClick(r, c));
      if (board[r][c]) {
        const stone = document.createElement("div");
        stone.classList.add("stone", board[r][c] === "B" ? "black" : "white");
        cell.appendChild(stone);
      }
      boardElement.appendChild(cell);
    }
  }
}

function handleClick(row, col) {
  if (currentPlayer !== "B") return;
  if (!isValidMove(row, col, "B")) return;
  makeMove(row, col, "B");
  currentPlayer = "W";
  updateTurnText();
  setTimeout(() => {
    aiTurn();
    checkGameEnd(); // 勝敗チェック
  }, 300);
}

function aiTurn() {
  const moves = getValidMoves("W");
  if (moves.length > 0) {
    let bestMove = null;
    let maxFlips = -1;
    for (let move of moves) {
      const flips = getFlippable(move[0], move[1], "W").length;
      if (flips > maxFlips) {
        bestMove = move;
        maxFlips = flips;
      }
    }
    if (bestMove) {
      makeMove(bestMove[0], bestMove[1], "W");
    }
  }
  currentPlayer = "B";
  updateTurnText();
  checkGameEnd(); // 勝敗チェック
}

function isValidMove(row, col, player) {
  if (board[row][col]) return false;
  return getFlippable(row, col, player).length > 0;
}

function makeMove(row, col, player) {
  const flips = getFlippable(row, col, player);
  if (flips.length === 0) return;
  board[row][col] = player;
  for (let [r, c] of flips) {
    board[r][c] = player;
  }
  renderBoard();
}

function getFlippable(row, col, player) {
  const opponent = player === "B" ? "W" : "B";
  const flippable = [];

  for (let [dr, dc] of directions) {
    let r = row + dr;
    let c = col + dc;
    const temp = [];

    while (r >= 0 && c >= 0 && r < boardSize && c < boardSize && board[r][c] === opponent) {
      temp.push([r, c]);
      r += dr;
      c += dc;
    }
    if (r >= 0 && c >= 0 && r < boardSize && c < boardSize && board[r][c] === player) {
      flippable.push(...temp);
    }
  }
  return flippable;
}

function getValidMoves(player) {
  const moves = [];
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      if (isValidMove(r, c, player)) {
        moves.push([r, c]);
      }
    }
  }
  return moves;
}

function updateTurnText() {
  turnDisplay.textContent = currentPlayer === "B" ? "あなたの番です（黒）" : "AIの番です（白）";
}

function checkGameEnd() {
  const movesB = getValidMoves("B");
  const movesW = getValidMoves("W");

  if (movesB.length === 0 && movesW.length === 0) {
    const blackCount = board.flat().filter(cell => cell === "B").length;
    const whiteCount = board.flat().filter(cell => cell === "W").length;

    let resultMessage = `ゲーム終了！ 黒: ${blackCount}枚, 白: ${whiteCount}枚 → `;

    if (blackCount > whiteCount) {
      resultMessage += "勝者: あなた（黒）";
    } else if (whiteCount > blackCount) {
      resultMessage += "勝者: AI（白）";
    } else {
      resultMessage += "引き分け";
    }

    turnDisplay.textContent = resultMessage; // 勝敗と駒数を表示
  }
}

resetButton.addEventListener("click", initBoard);
initBoard();
