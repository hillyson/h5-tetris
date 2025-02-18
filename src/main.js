import './style.css';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const nextPieceCanvas = document.getElementById('nextPieceCanvas');
const nextPieceCtx = nextPieceCanvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const linesElement = document.getElementById('lines');

const BLOCK_SIZE = 30;
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const COLORS = [
  '#000000',  // 空白
  '#FF0000',  // 红色 - I
  '#00FF00',  // 绿色 - J
  '#0000FF',  // 蓝色 - L
  '#FFFF00',  // 黄色 - O
  '#FF00FF',  // 紫色 - S
  '#00FFFF',  // 青色 - T
  '#FFA500'   // 橙色 - Z
];

const SHAPES = [
  [],
  [[1, 1, 1, 1]],  // I
  [[2, 0, 0], [2, 2, 2]],  // J
  [[0, 0, 3], [3, 3, 3]],  // L
  [[4, 4], [4, 4]],  // O
  [[0, 5, 5], [5, 5, 0]],  // S
  [[0, 6, 0], [6, 6, 6]],  // T
  [[7, 7, 0], [0, 7, 7]]   // Z
];

let board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
let currentPiece = null;
let currentPieceX = 0;
let currentPieceY = 0;
let nextPiece = null;
let gameInterval = null;
let score = 0;
let level = 1;
let lines = 0;
let gameOver = false;

function createPiece() {
  const pieceIndex = Math.floor(Math.random() * (SHAPES.length - 1)) + 1;
  return SHAPES[pieceIndex];
}

function drawBlock(x, y, color, context = ctx) {
  context.fillStyle = color;
  context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
  context.strokeStyle = '#000';
  context.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

function drawBoard() {
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      drawBlock(x, y, COLORS[board[y][x]]);
    }
  }
}

function drawPiece(piece, x, y, context = ctx) {
  piece.forEach((row, dy) => {
    row.forEach((value, dx) => {
      if (value !== 0) {
        drawBlock(x + dx, y + dy, COLORS[value], context);
      }
    });
  });
}

function drawNextPiece() {
  nextPieceCtx.clearRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);
  if (nextPiece) {
    const offsetX = (nextPieceCanvas.width / BLOCK_SIZE - nextPiece[0].length) / 2;
    const offsetY = (nextPieceCanvas.height / BLOCK_SIZE - nextPiece.length) / 2;
    drawPiece(nextPiece, offsetX, offsetY, nextPieceCtx);
  }
}

function checkCollision(piece, x, y) {
  return piece.some((row, dy) => {
    return row.some((value, dx) => {
      if (value === 0) return false;
      const newX = x + dx;
      const newY = y + dy;
      return newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT || (newY >= 0 && board[newY][newX] !== 0);
    });
  });
}

function rotatePiece(piece) {
  const newPiece = Array(piece[0].length).fill().map(() => Array(piece.length).fill(0));
  for (let y = 0; y < piece.length; y++) {
    for (let x = 0; x < piece[0].length; x++) {
      newPiece[x][piece.length - 1 - y] = piece[y][x];
    }
  }
  return newPiece;
}

function mergePiece() {
  currentPiece.forEach((row, dy) => {
    row.forEach((value, dx) => {
      if (value !== 0) {
        board[currentPieceY + dy][currentPieceX + dx] = value;
      }
    });
  });
}

function clearLines() {
  let linesCleared = 0;
  for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
    if (board[y].every(cell => cell !== 0)) {
      board.splice(y, 1);
      board.unshift(Array(BOARD_WIDTH).fill(0));
      linesCleared++;
      y++;
    }
  }
  if (linesCleared > 0) {
    lines += linesCleared;
    score += linesCleared * 100 * level;
    level = Math.floor(lines / 10) + 1;
    updateScore();
  }
}

function updateScore() {
  scoreElement.textContent = score;
  levelElement.textContent = level;
  linesElement.textContent = lines;
}

function gameLoop() {
  moveDown();
}

function moveDown() {
  if (!checkCollision(currentPiece, currentPieceX, currentPieceY + 1)) {
    currentPieceY++;
    draw();
  } else {
    mergePiece();
    clearLines();
    if (currentPieceY <= 0) {
      gameOver = true;
      endGame();
      return;
    }
    currentPiece = nextPiece;
    nextPiece = createPiece();
    currentPieceX = Math.floor((BOARD_WIDTH - currentPiece[0].length) / 2);
    currentPieceY = 0;
    draw();
  }
}

function moveLeft() {
  if (!checkCollision(currentPiece, currentPieceX - 1, currentPieceY)) {
    currentPieceX--;
    draw();
  }
}

function moveRight() {
  if (!checkCollision(currentPiece, currentPieceX + 1, currentPieceY)) {
    currentPieceX++;
    draw();
  }
}

function rotate() {
  const rotatedPiece = rotatePiece(currentPiece);
  if (!checkCollision(rotatedPiece, currentPieceX, currentPieceY)) {
    currentPiece = rotatedPiece;
    draw();
  }
}

function calculateShadowY() {
  let shadowY = currentPieceY;
  while (!checkCollision(currentPiece, currentPieceX, shadowY + 1)) {
    shadowY++;
  }
  return shadowY;
}

function drawShadow() {
  const shadowY = calculateShadowY();
  
  // 绘制半透明的影子方块
  ctx.globalAlpha = 0.3;
  drawPiece(currentPiece, currentPieceX, shadowY);
  ctx.globalAlpha = 1.0;
  
  // 绘制虚线连接
  currentPiece.forEach((row, dy) => {
    row.forEach((value, dx) => {
      if (value !== 0) {
        const startX = (currentPieceX + dx) * BLOCK_SIZE + BLOCK_SIZE / 2;
        const startY = (currentPieceY + dy) * BLOCK_SIZE + BLOCK_SIZE / 2;
        const endY = (shadowY + dy) * BLOCK_SIZE + BLOCK_SIZE / 2;
        
        ctx.beginPath();
        ctx.setLineDash([5, 5]);
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX, endY);
        ctx.strokeStyle = '#666';
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBoard();
  if (currentPiece) {
    drawShadow();
    drawPiece(currentPiece, currentPieceX, currentPieceY);
  }
  drawNextPiece();
}

function startGame() {
  if (gameInterval) return;
  
  board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
  score = 0;
  level = 1;
  lines = 0;
  gameOver = false;
  updateScore();
  
  currentPiece = createPiece();
  nextPiece = createPiece();
  currentPieceX = Math.floor((BOARD_WIDTH - currentPiece[0].length) / 2);
  currentPieceY = 0;
  
  draw();
  gameInterval = setInterval(gameLoop, 1000 / level);
  startBtn.disabled = true;
}

function endGame() {
  clearInterval(gameInterval);
  gameInterval = null;
  alert('游戏结束！得分：' + score);
  startBtn.disabled = false;
}

document.addEventListener('keydown', (e) => {
  if (gameOver) return;
  
  switch (e.key) {
    case 'ArrowLeft':
      moveLeft();
      break;
    case 'ArrowRight':
      moveRight();
      break;
    case 'ArrowDown':
      moveDown();
      break;
    case 'ArrowUp':
      rotate();
      break;
  }
});

startBtn.addEventListener('click', startGame);