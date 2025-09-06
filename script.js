// 游戏配置
const GAME_CONFIG = {
    CANVAS_SIZE: 400,
    GRID_SIZE: 20,
    INITIAL_SPEED: 150,
    SPEED_INCREMENT: 5
};

// 游戏状态
let gameState = {
    isRunning: false,
    isPaused: false,
    score: 0,
    highScore: localStorage.getItem('snakeHighScore') || 0,
    speed: GAME_CONFIG.INITIAL_SPEED
};

// 蛇的配置
let snake = {
    body: [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ],
    direction: { x: 1, y: 0 },
    nextDirection: { x: 1, y: 0 }
};

// 食物配置
let food = {
    x: 15,
    y: 15
};

// DOM元素
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const gameOverlay = document.getElementById('gameOverlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayMessage = document.getElementById('overlayMessage');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');

// 初始化游戏
function initGame() {
    // 设置画布大小
    canvas.width = GAME_CONFIG.CANVAS_SIZE;
    canvas.height = GAME_CONFIG.CANVAS_SIZE;
    
    // 更新最高分显示
    highScoreElement.textContent = gameState.highScore;
    
    // 生成初始食物
    generateFood();
    
    // 绘制初始游戏状态
    drawGame();
    
    // 绑定事件监听器
    bindEventListeners();
    
    // 显示开始界面
    updateStartButton();
    showOverlay('贪吃蛇游戏', '按空格键开始游戏');
}

// 绑定事件监听器
function bindEventListeners() {
    // 键盘事件
    document.addEventListener('keydown', handleKeyPress);
    
    // 按钮事件
    startBtn.addEventListener('click', handleStartButton);
    pauseBtn.addEventListener('click', togglePause);
}

// 处理键盘输入
function handleKeyPress(event) {
    if (!gameState.isRunning && event.code === 'Space') {
        startGame();
        return;
    }
    
    if (gameState.isPaused && event.code === 'Space') {
        togglePause();
        return;
    }
    
    if (!gameState.isRunning) return;
    
    switch (event.code) {
        case 'ArrowUp':
            if (snake.direction.y === 0) {
                snake.nextDirection = { x: 0, y: -1 };
            }
            break;
        case 'ArrowDown':
            if (snake.direction.y === 0) {
                snake.nextDirection = { x: 0, y: 1 };
            }
            break;
        case 'ArrowLeft':
            if (snake.direction.x === 0) {
                snake.nextDirection = { x: -1, y: 0 };
            }
            break;
        case 'ArrowRight':
            if (snake.direction.x === 0) {
                snake.nextDirection = { x: 1, y: 0 };
            }
            break;
        case 'Space':
            togglePause();
            break;
    }
}

// 处理开始/重置按钮点击
function handleStartButton() {
    if (gameState.isRunning) {
        // 如果游戏正在运行，点击无效
        return;
    }
    
    if (gameState.score > 0) {
        // 如果已有分数，说明游戏结束，执行重置
        restartGame();
    } else {
        // 新游戏，开始游戏
        startGame();
    }
}

// 开始游戏
function startGame() {
    gameState.isRunning = true;
    gameState.isPaused = false;
    updateStartButton();
    hideOverlay();
    gameLoop();
}

// 暂停/继续游戏
function togglePause() {
    if (!gameState.isRunning) return;
    
    gameState.isPaused = !gameState.isPaused;
    
    if (gameState.isPaused) {
        showOverlay('游戏暂停', '按空格键继续游戏');
    } else {
        hideOverlay();
        gameLoop();
    }
}

// 重新开始游戏
function restartGame() {
    // 重置游戏状态
    gameState.isRunning = false;
    gameState.isPaused = false;
    gameState.score = 0;
    gameState.speed = GAME_CONFIG.INITIAL_SPEED;
    
    // 重置蛇
    snake.body = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    snake.direction = { x: 1, y: 0 };
    snake.nextDirection = { x: 1, y: 0 };
    
    // 生成新食物
    generateFood();
    
    // 更新显示
    updateScore();
    updateStartButton();
    drawGame();
    showOverlay('贪吃蛇游戏', '按空格键开始游戏');
}

// 游戏主循环
function gameLoop() {
    if (!gameState.isRunning || gameState.isPaused) return;
    
    updateGame();
    drawGame();
    
    setTimeout(gameLoop, gameState.speed);
}

// 更新游戏状态
function updateGame() {
    // 更新蛇的方向
    snake.direction = { ...snake.nextDirection };
    
    // 计算蛇头新位置
    const head = { ...snake.body[0] };
    head.x += snake.direction.x;
    head.y += snake.direction.y;
    
    // 检查碰撞
    if (checkCollision(head)) {
        gameOver();
        return;
    }
    
    // 添加新头部
    snake.body.unshift(head);
    
    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        gameState.score += 10;
        updateScore();
        generateFood();
        
        // 增加游戏速度
        if (gameState.speed > 80) {
            gameState.speed -= GAME_CONFIG.SPEED_INCREMENT;
        }
    } else {
        // 移除尾部
        snake.body.pop();
    }
}

// 检查碰撞
function checkCollision(head) {
    // 检查墙壁碰撞
    if (head.x < 0 || head.x >= GAME_CONFIG.CANVAS_SIZE / GAME_CONFIG.GRID_SIZE ||
        head.y < 0 || head.y >= GAME_CONFIG.CANVAS_SIZE / GAME_CONFIG.GRID_SIZE) {
        return true;
    }
    
    // 检查自身碰撞
    for (let segment of snake.body) {
        if (head.x === segment.x && head.y === segment.y) {
            return true;
        }
    }
    
    return false;
}

// 生成食物
function generateFood() {
    const gridWidth = GAME_CONFIG.CANVAS_SIZE / GAME_CONFIG.GRID_SIZE;
    const gridHeight = GAME_CONFIG.CANVAS_SIZE / GAME_CONFIG.GRID_SIZE;
    
    do {
        food.x = Math.floor(Math.random() * gridWidth);
        food.y = Math.floor(Math.random() * gridHeight);
    } while (isFoodOnSnake());
}

// 检查食物是否在蛇身上
function isFoodOnSnake() {
    for (let segment of snake.body) {
        if (food.x === segment.x && food.y === segment.y) {
            return true;
        }
    }
    return false;
}

// 绘制游戏
function drawGame() {
    // 清空画布
    ctx.fillStyle = '#FFF8DC'; // 鹅黄色背景
    ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_SIZE, GAME_CONFIG.CANVAS_SIZE);
    
    // 绘制网格线（可选）
    drawGrid();
    
    // 绘制蛇
    drawSnake();
    
    // 绘制食物
    drawFood();
}

// 绘制网格
function drawGrid() {
    ctx.strokeStyle = 'rgba(139, 69, 19, 0.1)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= GAME_CONFIG.CANVAS_SIZE; i += GAME_CONFIG.GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, GAME_CONFIG.CANVAS_SIZE);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(GAME_CONFIG.CANVAS_SIZE, i);
        ctx.stroke();
    }
}

// 绘制蛇
function drawSnake() {
    snake.body.forEach((segment, index) => {
        const x = segment.x * GAME_CONFIG.GRID_SIZE;
        const y = segment.y * GAME_CONFIG.GRID_SIZE;
        
        if (index === 0) {
            // 蛇头 - 使用粉紫色
            ctx.fillStyle = '#E6E6FA';
            ctx.fillRect(x + 1, y + 1, GAME_CONFIG.GRID_SIZE - 2, GAME_CONFIG.GRID_SIZE - 2);
            
            // 蛇头边框
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 2;
            ctx.strokeRect(x + 1, y + 1, GAME_CONFIG.GRID_SIZE - 2, GAME_CONFIG.GRID_SIZE - 2);
            
            // 绘制眼睛
            ctx.fillStyle = '#8B4513';
            const eyeSize = 3;
            const eyeOffset = 5;
            
            if (snake.direction.x === 1) { // 向右
                ctx.fillRect(x + GAME_CONFIG.GRID_SIZE - eyeOffset, y + eyeOffset, eyeSize, eyeSize);
                ctx.fillRect(x + GAME_CONFIG.GRID_SIZE - eyeOffset, y + GAME_CONFIG.GRID_SIZE - eyeOffset - eyeSize, eyeSize, eyeSize);
            } else if (snake.direction.x === -1) { // 向左
                ctx.fillRect(x + eyeOffset - eyeSize, y + eyeOffset, eyeSize, eyeSize);
                ctx.fillRect(x + eyeOffset - eyeSize, y + GAME_CONFIG.GRID_SIZE - eyeOffset - eyeSize, eyeSize, eyeSize);
            } else if (snake.direction.y === -1) { // 向上
                ctx.fillRect(x + eyeOffset, y + eyeOffset - eyeSize, eyeSize, eyeSize);
                ctx.fillRect(x + GAME_CONFIG.GRID_SIZE - eyeOffset - eyeSize, y + eyeOffset - eyeSize, eyeSize, eyeSize);
            } else if (snake.direction.y === 1) { // 向下
                ctx.fillRect(x + eyeOffset, y + GAME_CONFIG.GRID_SIZE - eyeOffset, eyeSize, eyeSize);
                ctx.fillRect(x + GAME_CONFIG.GRID_SIZE - eyeOffset - eyeSize, y + GAME_CONFIG.GRID_SIZE - eyeOffset, eyeSize, eyeSize);
            }
        } else {
            // 蛇身 - 使用浅粉色
            ctx.fillStyle = '#FFE4E1';
            ctx.fillRect(x + 2, y + 2, GAME_CONFIG.GRID_SIZE - 4, GAME_CONFIG.GRID_SIZE - 4);
            
            // 蛇身边框
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 2, y + 2, GAME_CONFIG.GRID_SIZE - 4, GAME_CONFIG.GRID_SIZE - 4);
        }
    });
}

// 绘制食物
function drawFood() {
    const x = food.x * GAME_CONFIG.GRID_SIZE;
    const y = food.y * GAME_CONFIG.GRID_SIZE;
    
    // 绘制圆形食物
    ctx.fillStyle = '#FF69B4'; // 粉红色
    ctx.beginPath();
    ctx.arc(x + GAME_CONFIG.GRID_SIZE / 2, y + GAME_CONFIG.GRID_SIZE / 2, GAME_CONFIG.GRID_SIZE / 2 - 2, 0, 2 * Math.PI);
    ctx.fill();
    
    // 食物边框
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 食物高光
    ctx.fillStyle = '#FFB6C1';
    ctx.beginPath();
    ctx.arc(x + GAME_CONFIG.GRID_SIZE / 2 - 3, y + GAME_CONFIG.GRID_SIZE / 2 - 3, 3, 0, 2 * Math.PI);
    ctx.fill();
}

// 更新分数显示
function updateScore() {
    scoreElement.textContent = gameState.score;
    
    // 更新最高分
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        highScoreElement.textContent = gameState.highScore;
        localStorage.setItem('snakeHighScore', gameState.highScore);
    }
}

// 更新开始按钮状态
function updateStartButton() {
    if (gameState.isRunning) {
        // 游戏运行中，按钮禁用
        startBtn.textContent = '游戏中...';
        startBtn.disabled = true;
        startBtn.classList.remove('reset-state');
    } else if (gameState.score > 0) {
        // 游戏结束，显示重置按钮
        startBtn.textContent = '重新开始';
        startBtn.disabled = false;
        startBtn.classList.add('reset-state');
    } else {
        // 新游戏，显示开始按钮
        startBtn.textContent = '开始游戏';
        startBtn.disabled = false;
        startBtn.classList.remove('reset-state');
    }
}

// 显示覆盖层
function showOverlay(title, message) {
    overlayTitle.textContent = title;
    overlayMessage.textContent = message;
    gameOverlay.classList.remove('hidden');
    
    if (title === '游戏结束') {
        gameOverlay.classList.add('game-over');
    } else {
        gameOverlay.classList.remove('game-over');
    }
}

// 隐藏覆盖层
function hideOverlay() {
    gameOverlay.classList.add('hidden');
}

// 游戏结束
function gameOver() {
    gameState.isRunning = false;
    updateStartButton();
    showOverlay('游戏结束', `最终分数: ${gameState.score}`);
}

// 启动游戏
initGame();
