import { LEVEL,LEVEL2, LEVEL3, OBJECT_TYPE } from './setup.js';
import { randomMovement } from './ghostMoves.js';

import GameBoard from './gameBoard.js';
import Pacman from './Pacman.js';
import Ghost from './Ghost.js';

const soundDot = './sounds/munch.wav';
const soundPill = './sounds/pill.wav';
const soundGameStart = './sounds/game_start.wav';
const soundGameOver = './sounds/death.wav';
const soundGhost = './sounds/eat_ghost.wav';

const gameGrid = document.querySelector('#game');
const scoreTab = document.querySelector('#score');
const startBtn = document.querySelector('#start-game');
const pauseBtn = document.querySelector('#pause-game');
const resumeBtn = document.querySelector('#resume-game');
const restartBtn = document.querySelector('#restart-game');
const menubar = document.querySelector('#menu');
const livesDisplay = document.querySelector('#lives');
const clockDisplay = document.querySelector('#clock');
const level = document.querySelector('#level');

const power_pill_timer = 10000;
const speed = 70;
const gameBoard = GameBoard.createGameBoard(gameGrid, LEVEL);

let score = 0;
let lives = 3;
let winTime=0;
let clock = 900000; 
let clockTimer = null;
let isWinner = false;
let powerPillActive = false;
let powerPillTimer = null;
let animationId = null;
let lastTimestamp = 0;
let isPaused = false;
let isGameOver = false;
let started=false;

let pacman;
let ghosts=[];

let collision = false;


function playAudio(audio) {
    const soundEffect = new Audio(audio);
    soundEffect.play();
}

function handleKeyDown(e) {
    pacman.handleKeyInput(e, gameBoard.objectExists);
}

function showStoryScreen(message) {
    const screen= document.querySelector('#story-container')
    const content= document.querySelector('#story-content')
    content.innerHTML=`${message}`
    screen.classList.add('show')
    setTimeout(() => {
        screen.classList.remove('show');
    }, 3000);
    }   

function gameOver() {
    playAudio(soundGameOver);
    livesDisplay.innerHTML = lives;
    winTime=0
    document.removeEventListener('keydown', handleKeyDown);
    if (isWinner){
        startBtn.classList.remove('hide')
        startBtn.innerHTML="Play Again"
    }
    gameBoard.showGameStatus(isWinner);
    
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }

    clearInterval(clockTimer);
    isGameOver=true
    if (isWinner&&isGameOver) {
        showStoryScreen(`<p>Victory! Pacman has triumphed over Phantom and the ghostly legion. Neon City shines once more, and peace has returned to the neon-lit maze. You are a true hero!</p>
        `);
    }else if (isGameOver&&!isWinner){
        showStoryScreen(`<p>Tragedy strikes in Neon City. Despite Pacman's bravery, the darkness overwhelmed him. The ghosts continue to haunt the neon corridors...</p>`);
    }
    startBtn.classList.remove('hide');
    pauseBtn.classList.remove('show');
    setTimeout(() => {
        DisplayForm(score, clock);
    }, 3000);
}

function DisplayForm(score, clock) {
    const container = document.createElement('div');
    container.id = 'score-form-container';

    const formatTime = (milliseconds) => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const formattedTime = formatTime(clock);

    container.innerHTML = `
        <form id="score-form">
            <h3>Game Over - Submit Your Score</h3>
            <label for="username">Username:</label>
            <input type="text" id="username" name="username" required />
            <input type="hidden" name="score" value="${score}" />
            <input type="hidden" name="time" value="${formattedTime}" />
           <button type="button" id="submit-score">Submit</button>
        </form>
    `;

    document.body.appendChild(container);
    const form = container.querySelector('#score-form');
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        // document.getElementById('submit-score').click();
        const username = document.getElementById('username').value;

        fetch('http://localhost:8080/addScore', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: username,
                score: score,
                time: formattedTime
            })
        })  
        .then(response => response.text())
        .then(() => {
            container.remove();
          
        })
        .catch(error => {
            console.error('Error submitting score:', error);
            alert("Error submitting score.");
        });
    });
    document.getElementById('submit-score').addEventListener('click', function () {
        form.dispatchEvent(new Event('submit'));
   });
}

window.scoreboardActive = false;

window.changePage = function(newPage) {
    showScoreboard(newPage);
};
showScoreboard()
function showScoreboard(page = 1) {
    // Set flag to indicate scoreboard is active
    window.scoreboardActive = true;
    console.log( window.scoreboardActive);
    
    // Ensure game doesn't restart while viewing scores
    isPaused = true;
    isGameOver = true;
    
    const existing = document.getElementById('scoreboard-container');
    if (existing) existing.remove(); // prevent multiple boards

    fetch(`http://localhost:8080/boardScore?page=${page}`)
        .then(res => res.json())
        .then(data => {
            console.log("Scoreboard data:", data);
            
            // Create overlay to block any other interactions
            const overlay = document.createElement('div');
            overlay.id = 'scoreboard-overlay';
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
            overlay.style.zIndex = '999';
            document.body.appendChild(overlay);
            
            const container = document.createElement('div');
            container.id = 'scoreboard-container';
            
            // Apply styles to make it more visible and persistent
            container.style.position = 'fixed';
            container.style.top = '50%';
            container.style.left = '50%';
            container.style.transform = 'translate(-50%, -50%)';
            container.style.backgroundColor = 'white';
            container.style.padding = '20px';
            container.style.border = '2px solid black';
            container.style.zIndex = '1000';
            container.style.width = '80%';
            container.style.maxWidth = '600px';
            container.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
            
            // Add close button with enhanced visibility
            const closeButton = document.createElement('button');
            closeButton.textContent = 'Close Scoreboard';
            closeButton.style.position = 'absolute';
            closeButton.style.top = '10px';
            closeButton.style.right = '10px';
            closeButton.style.padding = '5px 10px';
            closeButton.style.backgroundColor = '#f44336';
            closeButton.style.color = 'white';
            closeButton.style.border = 'none';
            closeButton.style.borderRadius = '4px';
            closeButton.style.cursor = 'pointer';
            
            closeButton.addEventListener('click', function() {
                window.scoreboardActive = false;
                container.remove();
                document.getElementById('scoreboard-overlay').remove();
                startBtn.classList.remove('hide');
            });
            
            container.appendChild(closeButton);
            
            const content = document.createElement('div');
            content.innerHTML = `
                <h2 style="text-align: center; margin-top: 0;">Scoreboard</h2>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="background-color: #f2f2f2;">
                        <th style="padding: 10px; border: 1px solid #ddd;">Rank</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">Name</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">Score</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">Time</th>
                    </tr>
                    ${data.scores.map((score, idx) => `
                        <tr ${idx % 2 === 0 ? 'style="background-color: #f9f9f9;"' : ''}>
                            <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${ordinal(score.rank)}</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${score.name}</td>
                            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${score.score}</td>
                            <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${score.time}</td>
                        </tr>`).join('')}
                </table>
                <div style="margin-top: 15px; text-align: center;">
                    <span>Page ${data.page} of ${data.totalPages}</span>
                </div>
                <div style="display: flex; justify-content: center; gap: 10px; margin-top: 10px;">
                    <button id="prev-page" ${page <= 1 ? "disabled" : ""} style="padding: 5px 15px; cursor: pointer;">Previous</button>
                    <button id="next-page" ${page >= data.totalPages ? "disabled" : ""} style="padding: 5px 15px; cursor: pointer;">Next</button>
                </div>
                <div style="margin-top: 15px; text-align: center;">
                    <button id="play-again" style="padding: 10px 20px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">Play</button>
                </div>
            `;
            container.appendChild(content);
            document.body.appendChild(container);
            
            // Add event listeners to buttons
            document.getElementById('prev-page').addEventListener('click', function() {
                if (page > 1) changePage(page - 1);
            });
            
            document.getElementById('next-page').addEventListener('click', function() {
                if (page < data.totalPages) changePage(page + 1);
            });
            
            document.getElementById('play-again').addEventListener('click', function() {
                window.scoreboardActive = false;
                container.remove();
                if (document.getElementById('scoreboard-overlay')) {
                    document.getElementById('scoreboard-overlay').remove();
                }
                
                // Reset game
                winTime = 0;
                score = 0;
                lives = 3;
                isWinner = false;
                isGameOver = false;
                isPaused = false;
                
                startGame();
            });
        })
        .catch(err => {
            console.error("Error loading scores:", err);
            alert("Error loading scoreboard. Please try again.");
            window.scoreboardActive = false;
        });
}

function ordinal(n) {
    if (n % 10 === 1 && n % 100 !== 11) return n + "st";
    if (n % 10 === 2 && n % 100 !== 12) return n + "nd";
    if (n % 10 === 3 && n % 100 !== 13) return n + "rd";
    return n + "th";
}

function getKilled() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    gameBoard.removeObject(pacman.pos, [OBJECT_TYPE.PACMAN]);
    gameBoard.rotatePacMan(pacman.pos, 0);

    ghosts.forEach(ghost => {
        gameBoard.removeObject(ghost.pos, [
            OBJECT_TYPE.GHOST,
            OBJECT_TYPE.SCARED,
            ghost.name
        ]);
        ghost.reset();
    });

    pacman = new Pacman(2, 287);
    gameBoard.addObject(287, [OBJECT_TYPE.PACMAN]);
    livesDisplay.innerHTML = lives;
    document.removeEventListener('keydown', handleKeyDown);
    document.addEventListener('keydown', handleKeyDown);
    
    ghosts = [
        new Ghost(5, 188, randomMovement, OBJECT_TYPE.BLINKY),
        new Ghost(4, 209, randomMovement, OBJECT_TYPE.PINKY),
        new Ghost(3, 230, randomMovement, OBJECT_TYPE.INKY),
        new Ghost(2, 251, randomMovement, OBJECT_TYPE.CLYDE)
    ];
    
    setTimeout(() => {
        startGameLoop();
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
                OBJECT_TYPE.GHOST,
                OBJECT_TYPE.SCARED,
                collidedGhost.name
            ]);
            collidedGhost.pos = collidedGhost.startPos;
            score += 100;
        } else {
            lives--;
            if (lives <= 0 ) {
                gameBoard.removeObject(pacman.pos, [OBJECT_TYPE.PACMAN]);
                gameBoard.rotatePacMan(pacman.pos, 0);
                gameOver();
            } else {
                getKilled();
            }
        }
    } else if (clock <= 0) {
        gameBoard.removeObject(pacman.pos, [OBJECT_TYPE.PACMAN]);
        gameBoard.rotatePacMan(pacman.pos, 0);
        gameOver();
    }
}

function gameLoop(pacman, ghosts) {
    collision = false;
   

    gameBoard.moveCharacter(pacman);
    // checkCollision(pacman, ghosts);

    ghosts.forEach(ghost => gameBoard.moveCharacter(ghost));
    checkCollision(pacman, ghosts);

    if (gameBoard.objectExists(pacman.pos, OBJECT_TYPE.DOT)) {
        playAudio(soundDot);
        gameBoard.removeObject(pacman.pos, [OBJECT_TYPE.DOT]);
        gameBoard.dotCount--;
        score += 10;
    }

    if (gameBoard.objectExists(pacman.pos, OBJECT_TYPE.PILL)) {
        playAudio(soundPill);
        gameBoard.removeObject(pacman.pos, [OBJECT_TYPE.PILL]);

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
        winTime++;
        if (winTime === 3) {
            isWinner = true;
            gameOver();
        } else {
            startGame();
        }
    }
    scoreTab.innerHTML = score;
}
function gameAnimationLoop(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    
    const elapsed = timestamp - lastTimestamp;
    
    // Only update game if enough time has passed according to desired speed
    if (elapsed >= speed) {
        
        gameLoop(pacman, ghosts);
        lastTimestamp = timestamp;
    }
    
    // Continue animation loop if game is still running
    if (!isGameOver && !isPaused) {
        animationId = requestAnimationFrame(gameAnimationLoop);
    }
}

function startGameLoop() {
    lastTimestamp = 0;
    isPaused = false;
    isGameOver = false;
    animationId = requestAnimationFrame(gameAnimationLoop);
}

function startClock(initialTime = 900000) {
    clock = initialTime; 
    
    // Format MM:SS
    const formatTime = (milliseconds) => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        const formattedMinutes = minutes.toString().padStart(2, '0');
        const formattedSeconds = seconds.toString().padStart(2, '0');
        
        return `${formattedMinutes}:${formattedSeconds}`;
    };
    
    clockDisplay.innerHTML = formatTime(clock);
    
    clockTimer = setInterval(() => {
        clock -= 10;
        
        if (clock <= 0) {
            clock = 0;
            clearInterval(clockTimer);
            gameOver();
        }
        
        clockDisplay.innerHTML = formatTime(clock);
    }, 10);
}

function startGame() {
    started= true
    playAudio(soundGameStart);
    isWinner = false;
    powerPillActive = false;
    score = 0;
    lives = 3;
    startBtn.classList.add('hide');
    if (winTime==0){
        showStoryScreen(`<p>In the neon maze of Neon City, darkness has begun to creep in. Once a haven of delicious dots and peaceful passageways, the maze is now besieged by ghostly forces led by the sinister Phantom. Only one hero, Pacman, holds the key to restoring light and harmony.</p>
    `)
        gameBoard.createGrid(LEVEL);
        ghosts = [
            new Ghost(5, 188, randomMovement, OBJECT_TYPE.BLINKY),
            new Ghost(4, 209, randomMovement, OBJECT_TYPE.PINKY),
            new Ghost(3, 230, randomMovement, OBJECT_TYPE.INKY),
            new Ghost(2, 251, randomMovement, OBJECT_TYPE.CLYDE)
        ];

    } else if (winTime==1){
        document.body.style.backgroundImage = "url('./bglevel2.jpg')";

        showStoryScreen( `<p>After facing countless ghostly minions, a mysterious message reveals Phantom's hidden strength. Prepare for the ultimate challenge ahead.</p>`)
        gameBoard.createGrid(LEVEL2);
        ghosts = [
            new Ghost(4, 188, randomMovement, OBJECT_TYPE.BLINKY),
            new Ghost(3, 209, randomMovement, OBJECT_TYPE.PINKY),
            new Ghost(2, 230, randomMovement, OBJECT_TYPE.INKY),
            new Ghost(2, 251, randomMovement, OBJECT_TYPE.CLYDE)
        ];

    }else if (winTime==2){
        document.body.style.backgroundImage = "url('./bglevel3.jpg')";

        showStoryScreen( `<p>In the final showdown, Pacman confronts Phantom in the maze’s darkest depths. With courage and newfound power, he defeats the darkness, restoring peace to Neon City!</p> `)
        gameBoard.createGrid(LEVEL3);
        ghosts = [
            new Ghost(1, 188, randomMovement, OBJECT_TYPE.BLINKY),
            new Ghost(1, 209, randomMovement, OBJECT_TYPE.PINKY),
            new Ghost(1, 230, randomMovement, OBJECT_TYPE.INKY),
            new Ghost(1, 251, randomMovement, OBJECT_TYPE.CLYDE)
        ];
    }else{
        level.innerHTML = winTime+1;

        isWinner=true
        gameOver()
        return
    }
    level.innerHTML = winTime+1;
    pauseBtn.classList.add('show');
    pacman = new Pacman(2, 287);
    gameBoard.addObject(287, [OBJECT_TYPE.PACMAN]);
    document.addEventListener('keydown', handleKeyDown);


    startClock();
    startGameLoop();
}

function pauseGame() {
    if (!isPaused) {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        clearInterval(clockTimer);
        isPaused = true;
        menubar.classList.add('show')
        pauseBtn.classList.add('hide') 
    } else {
        startGameLoop();
        menubar.classList.remove('show')
        pauseBtn.classList.remove('hide') 

        startClock(clock); 
        isPaused = false;
    }
}

function restartGame() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }

    if (clockTimer) {
        clearInterval(clockTimer);
        clockTimer = null;
    }
    
    if (powerPillTimer) {
        clearTimeout(powerPillTimer);
        powerPillTimer = null;
    }
    menubar.classList.remove('show')
    pauseBtn.classList.remove('hide') 

    document.removeEventListener('keydown', handleKeyDown);
    
    isWinner = false;
    powerPillActive = false;
    score = 0;
    isPaused = false;
    isGameOver = false;
    if (pacman) {
        gameBoard.removeObject(pacman.pos, [OBJECT_TYPE.PACMAN]);
    }
    
    if (ghosts) {
        ghosts.forEach(ghost => {
            gameBoard.removeObject(ghost.pos, [
                OBJECT_TYPE.GHOST, 
                OBJECT_TYPE.SCARED, 
                ghost.name
            ]);
        });
    }
    
    scoreTab.innerHTML = score;
    
    startBtn.classList.remove('hide');
    pauseBtn.classList.remove('show');
    restartBtn.classList.remove('show');
    
    startGame();
}
document.addEventListener('keydown',(e)=>{
   console.log(e.keyCode);
   if(e.keyCode==32 && !started && !isPaused){
    startGame();
}else if(e.keyCode==27){
pauseGame();

}else if(e.keyCode==82){
    restartGame()
}
})

startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);
resumeBtn.addEventListener('click', pauseGame);
restartBtn.addEventListener('click', restartGame);
