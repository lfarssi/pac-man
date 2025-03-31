import { LEVEL, object_type } from './setup.js';
import { randomMovement } from './ghostMoves.js';

import GameBoard from './gameBoard.js';
import Pacman from './Pacman.js';
import Ghost from './Ghost.js';

const soundDot = './sounds/munch.wav';
const soundPill = './sounds/pill.wav';
const soundGameStart = './sounds/game_start.wav';
const soundGameOver = './sounds/death.wav';
const soundGhost = 'padding./sounds/eat_ghost.wav';

const gameGrid = document.querySelector('#game');
const scoreTab = document.querySelector('#score');
const startBtn = document.querySelector('#start-game');
const pauseBtn = document.querySelector('#pause-game');
const restartBtn = document.querySelector('#restart-game');
const livesDisplay = document.querySelector('#lives');
const clockDisplay = document.querySelector('#clock');

const power_pill_timer = 10000;
const speed = 80;
const gameBoard = GameBoard.createGameBoard(gameGrid, LEVEL);

let score = 0;
let lives = 3;
let clock = 900000; // 15 minutes in ms
let timer = null;
let clockTimer = null;
let isWinner = false;
let powerPillActive = false;
let powerPillTimer = null;

let pacman;
let ghosts;

let collision = false;

function playAudio(audio) {
    const soundEffect = new Audio(audio);
    soundEffect.play();
}

function handleKeyDown(e) {
    pacman.handleKeyInput(e, gameBoard.objectExists);
}

function gameOver(pacman, grid) {
    playAudio(soundGameOver);
    livesDisplay.innerHTML = lives;
    document.removeEventListener('keydown', handleKeyDown);
    gameBoard.showGameStatus(isWinner);
    clearInterval(timer);
    clearInterval(clockTimer);
    startBtn.classList.remove('hide');
    pauseBtn.classList.remove('show');
}

function getKilled() {
    clearInterval(timer);
    gameBoard.removeObject(pacman.pos, [object_type.PACMAN]);
    gameBoard.rotatePacMan(pacman.pos, 0);
    
    pacman = new Pacman(2, 287);
    gameBoard.addObject(287, [object_type.PACMAN]);
    
    document.removeEventListener('keydown', handleKeyDown);
    document.addEventListener('keydown', handleKeyDown);
    
    ghosts.forEach(ghost => {
      gameBoard.removeObject(ghost.pos, [
        object_type.GHOST,
        object_type.SCARED,
        ghost.name
      ]);
    });
    
    ghosts = [
      new Ghost(5, 188, randomMovement, object_type.BLINKY),
      new Ghost(4, 209, randomMovement, object_type.PINKY),
      new Ghost(3, 230, randomMovement, object_type.INKY),
      new Ghost(2, 251, randomMovement, object_type.CLYDE)
    ];
    
    setTimeout(() => {
      timer = setInterval(() => gameLoop(pacman, ghosts), speed);
    }, 1000);
}

function checkCollision(pacman, ghosts) {
    if (collision) return;

    const collidedGhost = ghosts.find(ghost => pacman.pos === ghost.pos);
    if (collidedGhost) {
        collision = true;
        if (pacman.powerPill) {
            playAudio(soundGhost);
            gameBoard.removeObject(collidedGhost.pos, [
                object_type.GHOST,
                object_type.SCARED,
                collidedGhost.name
            ]);
            collidedGhost.pos = collidedGhost.startPos;
            score += 100;
        } else {
            lives--;
            if (lives <= 0 ) {
                gameBoard.removeObject(pacman.pos, [object_type.PACMAN]);
                gameBoard.rotatePacMan(pacman.pos, 0);
                gameOver(pacman, gameGrid);
            } else {
                clearInterval(timer);
                getKilled();
            }
        }
    } else if (clock <= 0) {
        gameBoard.removeObject(pacman.pos, [object_type.PACMAN]);
        gameBoard.rotatePacMan(pacman.pos, 0);
        gameOver(pacman, gameGrid);
    }
}

function gameLoop(pacman, ghosts) {
    collision = false;

    livesDisplay.innerHTML = lives;
    // The clock display will be updated by the clock timer separately.

    gameBoard.moveCharacter(pacman);
    checkCollision(pacman, ghosts);

    ghosts.forEach(ghost => gameBoard.moveCharacter(ghost));
    checkCollision(pacman, ghosts);

    if (gameBoard.objectExists(pacman.pos, object_type.DOT)) {
        playAudio(soundDot);
        gameBoard.removeObject(pacman.pos, [object_type.DOT]);
        gameBoard.dotCount--;
        score += 10;
    }

    if (gameBoard.objectExists(pacman.pos, object_type.PILL)) {
        playAudio(soundPill);
        gameBoard.removeObject(pacman.pos, [object_type.PILL]);

        pacman.powerPill = true;
        score += 50;

        clearTimeout(powerPillTimer);
        powerPillTimer = setTimeout(() => (pacman.powerPill = false), power_pill_timer);
    }

    if (pacman.powerPill !== powerPillActive) {
        powerPillActive = pacman.powerPill;
        ghosts.forEach(ghost => (ghost.isScared = pacman.powerPill));
    }

    if (gameBoard.dotCount == 0) {
        isWinner = true;
        gameOver(pacman, gameGrid);
    }

    scoreTab.innerHTML = score;
}

function startClock() {
    // Reset clock to 15 minutes
    clock = 900000;
    clockDisplay.innerHTML = (clock / 60000).toFixed(0);
    // Update clock every second
    clockTimer = setInterval(() => {
        clock -= 1000;
        clockDisplay.innerHTML = (clock / 60000).toFixed(0);
        if (clock <= 0) {
            clock = 0;
            clearInterval(clockTimer);
            // Trigger game over when time runs out
            gameOver(pacman, gameGrid);
        }
    }, 1000);
}

function startGame() {
    playAudio(soundGameStart);
    isWinner = false;
    powerPillActive = false;
    score = 0;
    lives = 3;
    startBtn.classList.add('hide');
    gameBoard.createGrid(LEVEL);
    pauseBtn.classList.add('show');
    pacman = new Pacman(2, 287);
    gameBoard.addObject(287, [object_type.PACMAN]);
    document.addEventListener('keydown', handleKeyDown);

    ghosts = [
        new Ghost(5, 188, randomMovement, object_type.BLINKY),
        new Ghost(4, 209, randomMovement, object_type.PINKY),
        new Ghost(3, 230, randomMovement, object_type.INKY),
        new Ghost(2, 251, randomMovement, object_type.CLYDE)
    ];

    startClock();
    timer = setInterval(() => gameLoop(pacman, ghosts), speed);
}

function pauseGame() {
    if (timer) {
        clearInterval(timer);
        timer = null;
        clearInterval(clockTimer);
        restartBtn.classList.add('show');
        pauseBtn.textContent = "Resume";
    } else {
        timer = setInterval(() => gameLoop(pacman, ghosts), speed);
        startClock(); // Restart clock timer
        pauseBtn.textContent = "Pause";
        restartBtn.classList.remove('show');
    }
}

function restartGame() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
    
    if (clockTimer) {
        clearInterval(clockTimer);
        clockTimer = null;
    }
    
    if (powerPillTimer) {
        clearTimeout(powerPillTimer);
        powerPillTimer = null;
    }
    
    document.removeEventListener('keydown', handleKeyDown);
    
    isWinner = false;
    powerPillActive = false;
    score = 0;
    
    if (pacman) {
        gameBoard.removeObject(pacman.pos, [object_type.PACMAN]);
    }
    
    if (ghosts) {
        ghosts.forEach(ghost => {
            gameBoard.removeObject(ghost.pos, [
                object_type.GHOST, 
                object_type.SCARED, 
                ghost.name
            ]);
        });
    }
    
    scoreTab.innerHTML = score;
    pauseBtn.textContent = "Pause";
    
    startBtn.classList.remove('hide');
    pauseBtn.classList.remove('show');
    restartBtn.classList.remove('show');
    
    startGame();
}

startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);
restartBtn.addEventListener('click', restartGame);
