// 游戏初始化

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const nextPieceCanvas = document.getElementById('nextPieceCanvas');
const nextPieceCtx = nextPieceCanvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const linesElement = document.getElementById('lines');

let BLOCK_SIZE = 30;

function calculateBlockSize() {
  const container = document.querySelector('.game-container');
  const containerWidth = container.clientWidth;
  const displayWidth = Math.floor(containerWidth * 0.5);
  BLOCK_SIZE = Math.min(60, Math.floor(displayWidth / BOARD_WIDTH));
  return BLOCK_SIZE;
}
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
let isPaused = false;

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
  // 确保canvas的width/height属性与CSS设置一致
  nextPieceCanvas.width = nextPieceCanvas.clientWidth;
  nextPieceCanvas.height = nextPieceCanvas.clientHeight;
  
  nextPieceCtx.clearRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);
  if (nextPiece) {
    // 计算预览区域中心点
    const centerX = nextPieceCanvas.width / 2;
    const centerY = nextPieceCanvas.height / 2;
    
    // 计算方块组的整体宽度和高度
    const pieceWidth = nextPiece[0].length * BLOCK_SIZE;
    const pieceHeight = nextPiece.length * BLOCK_SIZE;
    
    // 计算方块组的左上角坐标，确保居中显示
    const startX = centerX - pieceWidth / 2;
    const startY = centerY - pieceHeight / 2;
    
    // 直接绘制方块，不再强制1:1比例
    drawPiece(nextPiece, startX / BLOCK_SIZE, startY / BLOCK_SIZE, nextPieceCtx);
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
  
  // 检查旋转后是否会超出边界
  if (currentPieceX + newPiece[0].length > BOARD_WIDTH) {
    return piece; // 如果会超出右边界，返回原方块
  }
  if (currentPieceX < 0) {
    return piece; // 如果会超出左边界，返回原方块
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

let dropSpeed = 1000;
let isQuickDropping = false;
let clearingLines = false;

async function clearLines() {
  let linesCleared = 0;
  let linesToClear = [];
  
  // 先收集所有需要消除的行
  for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
    if (board[y].every(cell => cell !== 0)) {
      linesToClear.push(y);
    }
  }
  linesCleared = linesToClear.length;
  console.log('linesToClear:', linesToClear);

  if (linesCleared > 0) {
    clearingLines = true;
    await animateClearLines(linesToClear, () => {
      // 一次性更新游戏板数据
      const newBoard = board.filter((_, y) => !linesToClear.includes(y));
      newBoard.unshift(...Array(linesCleared).fill().map(() => Array(BOARD_WIDTH).fill(0)));
      board = newBoard;
      clearingLines = false;
    });
    
    // 更新分数
    score += linesCleared * 100 * level;
    lines += linesCleared;
    if (lines >= level * 10) {
      level++;
      dropSpeed = 1000 / level;
    }
    updateScore();
  }
  
  return linesCleared;
}

function animateClearLines(lineIndices, callback) {
  return new Promise(resolve => {
    const animations = lineIndices.map(y => {
      return new Promise(animResolve => {
        const duration = 500; // 动画持续时间（毫秒）
        const startTime = Date.now();

        function animate() {
          const currentTime = Date.now();
          const progress = (currentTime - startTime) / duration;

          if (progress >= 1) {
            animResolve();
            return;
          }

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          drawBoard();

          lineIndices.forEach(y => {
            const centerX = Math.floor(BOARD_WIDTH / 2);
            for (let x = 0; x < BOARD_WIDTH; x++) {
              if (board[y][x] !== 0) {
                const distanceFromCenter = Math.abs(x - centerX);
                const maxDistance = Math.max(centerX, BOARD_WIDTH - centerX);
                const normalizedDistance = distanceFromCenter / maxDistance;
                const alpha = Math.max(0, 1 - (progress + normalizedDistance * 0.8));

                ctx.globalAlpha = alpha;
                drawBlock(x, y, COLORS[board[y][x]]);
                ctx.globalAlpha = 1.0;
              }
            }
          });

          if (currentPiece) {
            drawGhostPiece();
            drawPiece(currentPiece, currentPieceX, currentPieceY);
          }
          drawNextPiece();

          requestAnimationFrame(animate);
        }

        animate();
      });
    });

    Promise.all(animations).then(() => {
      callback();
      resolve();
    }).catch(err => {
      console.error('Animation error:', err);
      callback();
      resolve();
    });
  });
}

function quickDrop() {
      if (!gameInterval || gameOver || isPaused || clearingLines) return;

      isQuickDropping = true;
      dropSpeed = 20; // 加快下落速度

      function animateQuickDrop() {
        if (!isQuickDropping || checkCollision(currentPiece, currentPieceX, currentPieceY + 1)) {
          isQuickDropping = false;
          dropSpeed = 1000 / level;
          moveDown();
          return;
        }

        currentPieceY++;
        draw();
        setTimeout(animateQuickDrop, dropSpeed);
      }

      animateQuickDrop();
    }

function gameLoop() {
      if (!isPaused && !clearingLines) {
        moveDown();
      }
    }

function startGame() {
      if (gameInterval) return;

      board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
      score = 0;
      level = 1;
      lines = 0;
      gameOver = false;
      isPaused = false;
      dropSpeed = 1000;
      updateScore();

      currentPiece = createPiece();
      nextPiece = createPiece();
      currentPieceX = Math.floor((BOARD_WIDTH - currentPiece[0].length) / 2);
      currentPieceY = 0;

      draw();
      gameInterval = setInterval(gameLoop, dropSpeed);
      startBtn.disabled = true;
      dropBtn.disabled = false;
      pauseBtn.disabled = false;
      pauseBtn.textContent = '暂停游戏';
    }

function endGame() {
      clearInterval(gameInterval);
      gameInterval = null;
      alert('游戏结束！得分：' + score);
      startBtn.disabled = false;
      dropBtn.disabled = true;
      pauseBtn.disabled = true;
    }

function togglePause() {
      if (!gameInterval || gameOver) return;

      isPaused = !isPaused;
      pauseBtn.textContent = isPaused ? '继续游戏' : '暂停游戏';
    }

// 触摸相关变量
let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;

  // 触摸开始
  canvas.addEventListener('touchstart', (e) => {
    if (gameOver || isPaused) return;
    e.preventDefault();

    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchStartTime = Date.now();
  });

  // 触摸移动
  canvas.addEventListener('touchmove', (e) => {
    if (gameOver || isPaused || clearingLines) return;
    e.preventDefault();

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;

    // 水平滑动距离超过30像素时移动方块
    if (Math.abs(deltaX) > 30) {
      if (deltaX > 0) {
        moveRight();
      } else {
        moveLeft();
      }
      touchStartX = touch.clientX;
    }

    // 下滑加速，根据滑动距离动态调整速度
    if (deltaY > 100) { // 增加下滑触发阈值
      isQuickDropping = true;
      // 调整速度范围为200ms-1000ms，使用更平缓的计算方式
      const speedRange = 800; // 速度变化范围
      const maxSpeed = 1000; // 最慢速度
      const minSpeed = 200;  // 最快速度
      const normalizedDelta = Math.min(deltaY, speedRange) / speedRange;
      dropSpeed = maxSpeed - (normalizedDelta * (maxSpeed - minSpeed));
      moveDown();
    }
  });

  canvas.addEventListener('touchend', (e) => {
    if (gameOver || isPaused || clearingLines) return;
    e.preventDefault();

    // 恢复正常下落速度
    isQuickDropping = false;
    dropSpeed = 1000 / level;

    const touchEndTime = Date.now();
    const touchDuration = touchEndTime - touchStartTime;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    const touchDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (touchDuration < 200 && touchDistance < 20) {
      rotate();
    }

    // 重置触摸状态变量
    touchStartX = 0;
    touchStartY = 0;
    touchStartTime = 0;
  });

  // 触摸取消
  canvas.addEventListener('touchcancel', () => { });

  // 添加键盘事件监听
  document.addEventListener('keydown', (e) => {
    if (gameOver || !gameInterval) return;

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
  const dropBtn = document.getElementById('dropBtn');
  const pauseBtn = document.getElementById('pauseBtn');

  dropBtn.addEventListener('click', quickDrop);
  pauseBtn.addEventListener('click', togglePause);

  // 初始化按钮状态
  dropBtn.disabled = true;
  pauseBtn.disabled = true;
  function updateScore() {
    scoreElement.textContent = score;
    levelElement.textContent = level;
    linesElement.textContent = lines;
  }
  function draw() {
    // 根据游戏板宽高比例计算方块大小
    const container = document.querySelector('.game-container');
    const containerWidth = container.clientWidth;
    const displayWidth = Math.floor(containerWidth * 0.5);
    BLOCK_SIZE = Math.min(60, Math.floor(displayWidth / BOARD_WIDTH));
    // BLOCK_SIZE = Math.floor(displayWidth / BOARD_WIDTH);
    
    // 设置canvas尺寸以匹配游戏板比例
    canvas.width = BOARD_WIDTH * BLOCK_SIZE;
    canvas.height = BOARD_HEIGHT * BLOCK_SIZE;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBoard();
    if (currentPiece) {
      drawGhostPiece();
      drawPiece(currentPiece, currentPieceX, currentPieceY);
    }
    drawNextPiece();
  }

  function drawGhostPiece() {
    if (!currentPiece) return;

    let ghostY = currentPieceY;
    while (!checkCollision(currentPiece, currentPieceX, ghostY + 1)) {
      ghostY++;
    }

    // 绘制虚线连接
    currentPiece.forEach((row, dy) => {
      row.forEach((value, dx) => {
        if (value !== 0) {
          ctx.beginPath();
          ctx.setLineDash([5, 5]);
          ctx.strokeStyle = COLORS[value];
          ctx.moveTo((currentPieceX + dx) * BLOCK_SIZE + BLOCK_SIZE / 2, (currentPieceY + dy) * BLOCK_SIZE + BLOCK_SIZE / 2);
          ctx.lineTo((currentPieceX + dx) * BLOCK_SIZE + BLOCK_SIZE / 2, (ghostY + dy) * BLOCK_SIZE + BLOCK_SIZE / 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });
    });

    ctx.globalAlpha = 0.3;
    drawPiece(currentPiece, currentPieceX, ghostY);
    ctx.globalAlpha = 1.0;
  }
  function moveLeft() {
    if (!gameInterval || gameOver || isPaused || clearingLines) return;
    if (!checkCollision(currentPiece, currentPieceX - 1, currentPieceY)) {
      currentPieceX--;
      draw();
    }
  }

  function moveRight() {
    if (!gameInterval || gameOver || isPaused || clearingLines) return;
    if (!checkCollision(currentPiece, currentPieceX + 1, currentPieceY)) {
      currentPieceX++;
      draw();
    }
  }

  function moveDown() {
    if (!gameInterval || gameOver || isPaused || clearingLines) return;

    if (!checkCollision(currentPiece, currentPieceX, currentPieceY + 1)) {
      currentPieceY++;
      draw();
    } else {
      mergePiece();
      clearLines();

      if (currentPieceY === 0) {
        gameOver = true;
        endGame();
        return;
      }

      // 重置所有与下落速度相关的状态，确保下一个方块从正常速度开始
      isQuickDropping = false;
      dropSpeed = 1000 / level;

      currentPiece = nextPiece;
      nextPiece = createPiece();
      currentPieceX = Math.floor((BOARD_WIDTH - currentPiece[0].length) / 2);
      currentPieceY = 0;
      draw();
    }
  }

  function rotate() {
    if (!gameInterval || gameOver || isPaused || clearingLines) return;

    const rotatedPiece = rotatePiece(currentPiece);
    if (!checkCollision(rotatedPiece, currentPieceX, currentPieceY)) {
      currentPiece = rotatedPiece;
      draw();
    }
  }