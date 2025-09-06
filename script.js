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
    speed: GAME_CONFIG.INITIAL_SPEED,
    hasPlayed: false  // 新增：是否已经玩过游戏
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
const mobileControls = document.getElementById('mobileControls');
const modeToggle = document.getElementById('modeToggle');

// 设备检测
const deviceIsMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                       window.innerWidth <= 768 || 
                       ('ontouchstart' in window);

// 当前操作模式（可手动切换）
let isMobile = deviceIsMobile;

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
    
    // 初始化移动端控制
    initMobileControls();
    
    // 显示开始界面
    updateStartButton();
    showOverlay('贪吃蛇游戏', isMobile ? '点击开始游戏按钮开始' : '按空格键开始游戏');
}

// 绑定事件监听器
function bindEventListeners() {
    // 键盘事件
    document.addEventListener('keydown', handleKeyPress);
    
    // 按钮事件
    startBtn.addEventListener('click', handleStartButton);
    pauseBtn.addEventListener('click', togglePause);
    modeToggle.addEventListener('click', toggleMode);
    
    // 移动端控制按钮事件
    bindMobileControls();
}

// 初始化移动端控制
function initMobileControls() {
    if (isMobile) {
        mobileControls.style.display = 'block';
        // 只阻止游戏区域的滚动，允许页面其他区域滚动
        const gameArea = document.querySelector('.game-area');
        if (gameArea) {
            gameArea.addEventListener('touchmove', function(e) {
                e.preventDefault();
            }, { passive: false });
        }
    } else {
        mobileControls.style.display = 'none';
    }
    
    // 更新模式切换按钮
    updateModeToggleButton();
    
    // 更新游戏说明文案
    updateInstructions();
}

// 切换操作模式
function toggleMode() {
    isMobile = !isMobile;
    initMobileControls();
    
    // 更新提示信息
    if (gameState.isPaused) {
        showOverlay('游戏暂停', isMobile ? '点击暂停按钮继续游戏' : '按空格键继续游戏');
    } else if (!gameState.isRunning) {
        showOverlay('贪吃蛇游戏', isMobile ? '点击开始游戏按钮开始' : '按空格键开始游戏');
    }
}

// 更新模式切换按钮
function updateModeToggleButton() {
    if (isMobile) {
        modeToggle.textContent = 'PC模式';
        modeToggle.classList.add('mobile-mode');
    } else {
        modeToggle.textContent = '移动模式';
        modeToggle.classList.remove('mobile-mode');
    }
}

// 更新游戏说明文案
function updateInstructions() {
    const pcInstruction = document.querySelector('.pc-instruction');
    const mobileInstruction = document.querySelector('.mobile-instruction');
    const controlsInfo = document.getElementById('controlsInfo');
    
    if (isMobile) {
        // 移动模式：显示移动端说明，隐藏PC端说明
        if (pcInstruction) pcInstruction.style.display = 'none';
        if (mobileInstruction) mobileInstruction.style.display = 'list-item';
        
        // 更新覆盖层中的控制说明
        if (controlsInfo) {
            controlsInfo.innerHTML = `
                <p>使用下方虚拟按键控制蛇的移动</p>
                <p>点击暂停按钮暂停/继续游戏</p>
            `;
        }
    } else {
        // PC模式：显示PC端说明，隐藏移动端说明
        if (pcInstruction) pcInstruction.style.display = 'list-item';
        if (mobileInstruction) mobileInstruction.style.display = 'none';
        
        // 更新覆盖层中的控制说明
        if (controlsInfo) {
            controlsInfo.innerHTML = `
                <p>使用方向键控制蛇的移动</p>
                <p>按空格键暂停/继续游戏</p>
            `;
        }
    }
}

// 绑定移动端控制
function bindMobileControls() {
    const mobileBtns = document.querySelectorAll('.mobile-btn');
    mobileBtns.forEach(btn => {
        // 移除之前的事件监听器（避免重复绑定）
        btn.removeEventListener('click', handleMobileClick);
        btn.removeEventListener('touchstart', handleMobileTouch);
        
        // 添加新的事件监听器
        btn.addEventListener('click', handleMobileClick);
        btn.addEventListener('touchstart', handleMobileTouch);
    });
}

// 移动端点击处理
function handleMobileClick(e) {
    e.preventDefault();
    e.stopPropagation();
    const direction = e.target.getAttribute('data-direction');
    handleMobileInput(direction);
}

// 移动端触摸处理
function handleMobileTouch(e) {
    e.preventDefault();
    e.stopPropagation();
}

// 处理移动端输入
function handleMobileInput(direction) {
    if (!gameState.isRunning && direction !== 'pause') {
        return;
    }
    
    switch (direction) {
        case 'up':
            if (snake.direction.y === 0) {
                snake.nextDirection = { x: 0, y: -1 };
            }
            break;
        case 'down':
            if (snake.direction.y === 0) {
                snake.nextDirection = { x: 0, y: 1 };
            }
            break;
        case 'left':
            if (snake.direction.x === 0) {
                snake.nextDirection = { x: -1, y: 0 };
            }
            break;
        case 'right':
            if (snake.direction.x === 0) {
                snake.nextDirection = { x: 1, y: 0 };
            }
            break;
        case 'pause':
            if (gameState.isRunning) {
                togglePause();
            } else if (gameState.hasPlayed) {
                // 游戏结束后重新开始
                restartFromGameOver();
            } else {
                // 新游戏，开始游戏
                startGame();
            }
            break;
    }
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
    
    if (gameState.hasPlayed) {
        // 如果已经玩过游戏，说明游戏结束，执行重置
        restartFromGameOver();
    } else {
        // 新游戏，开始游戏
        startGame();
    }
}

// 开始游戏
function startGame() {
    gameState.isRunning = true;
    gameState.isPaused = false;
    gameState.hasPlayed = true;  // 标记已经玩过游戏
    updateStartButton();
    hideOverlay();
    gameLoop();
}

// 暂停/继续游戏
function togglePause() {
    if (!gameState.isRunning) return;
    
    gameState.isPaused = !gameState.isPaused;
    
    if (gameState.isPaused) {
        showOverlay('游戏暂停', isMobile ? '点击暂停按钮继续游戏' : '按空格键继续游戏');
    } else {
        hideOverlay();
        gameLoop();
    }
}

// 从游戏结束状态重新开始
function restartFromGameOver() {
    // 重置游戏状态，但保持分数为0（因为这是重新开始新游戏）
    gameState.isRunning = false;
    gameState.isPaused = false;
    gameState.score = 0;  // 重新开始新游戏，分数重置为0
    gameState.speed = GAME_CONFIG.INITIAL_SPEED;
    gameState.hasPlayed = false;  // 重置游戏状态，显示"开始游戏"
    
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
    showOverlay('贪吃蛇游戏', isMobile ? '点击开始游戏按钮开始' : '按空格键开始游戏');
}

// 重新开始游戏（完全重置）
function restartGame() {
    // 重置游戏状态
    gameState.isRunning = false;
    gameState.isPaused = false;
    gameState.score = 0;
    gameState.speed = GAME_CONFIG.INITIAL_SPEED;
    gameState.hasPlayed = false;  // 重置游戏状态
    
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
    showOverlay('贪吃蛇游戏', isMobile ? '点击开始游戏按钮开始' : '按空格键开始游戏');
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
    } else if (gameState.hasPlayed) {
        // 游戏已经玩过（无论得分多少），显示重新开始按钮
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
