import {LEVEL, object_type} from './setup.js';
import { randomMovement } from './ghostMoves.js';

import GameBoard from './gameBoard.js';
import Pacman from './Pacman.js';
import Ghost from './Ghost.js';

const soundDot = './sounds/munch.wav'
const soundPill = './sounds/pill.wav'
const soundGameStart = './sounds/game_start.wav'
const soundGameOver = './sounds/death.wav'
const soundGhost = './sounds/eat_ghost.wav'

const gameGrid = document.querySelector('#game')
const scoreTab = document.querySelector('#score')
const startBtn = document.querySelector('#start-game')
const pauseBtn = document.querySelector('#pause-game')

const power_pill_timer= 10000
const speed= 80
const gameBoard= GameBoard.createGameBoard(gameGrid, LEVEL)

let score=0
let timer= null
let isWinner = false
let powerPillActive= false
let powerPillTimer= null

let pacman;
let ghosts;

function playAudio(audio){
    const soundEffect=new Audio(audio)
    soundEffect.play()
}

function gameOver(pacman, grid){
    playAudio(soundGameOver)
    document.removeEventListener('keydown',e=>pacman.handleKeyInput(e,gameBoard.objectExists))
    gameBoard.showGameStatus(isWinner)
    clearInterval(timer)
    startBtn.classList.remove('hide')
}
function checkCollision(pacman, ghosts){
    const collidedGhost=ghosts.find(ghost=>pacman.pos===ghost.pos)
    if (collidedGhost){
        if(pacman.powerPill){
            playAudio(soundGhost)
            gameBoard.removeObject(collidedGhost.pos, [
                object_type.GHOST,
                object_type.SCARED,
                collidedGhost.name
            ])
            collidedGhost.pos=collidedGhost.startPos
            score+=100
        }else{
            gameBoard.removeObject(pacman.pos,[object_type.PACMAN])
            gameBoard.rotatePacMan(pacman.pos,0)
            gameOver(pacman,gameGrid)
        }
    }
}
function gameLoop(pacman, ghosts){
    gameBoard.moveCharacter(pacman)
    checkCollision(pacman,ghosts)

    ghosts.forEach(ghost=>gameBoard.moveCharacter(ghost))
    checkCollision(pacman,ghosts)


    if(gameBoard.objectExists(pacman.pos, object_type.DOT)){
        playAudio(soundDot)
        gameBoard.removeObject(pacman.pos, [object_type.DOT])
        gameBoard.dotCount--
        score+=10
    }

    if(gameBoard.objectExists(pacman.pos, object_type.PILL)){
        playAudio(soundPill)
        gameBoard.removeObject(pacman.pos, [object_type.PILL])

        pacman.powerPill=true
        score+=50

        clearTimeout(powerPillTimer)
        powerPillTimer=setTimeout(()=>pacman.powerPill=false,power_pill_timer)
    }

    if(pacman.powerPill !== powerPillActive){
        powerPillActive=pacman.powerPill
        ghosts.forEach(ghost=>ghost.isScared=pacman.powerPill)
    }

    if (gameBoard.dotCount==0){
        isWinner=true
        gameOver(pacman,ghosts)
    }

    scoreTab.innerHTML=score
}


function startGame(){
    playAudio(soundGameStart)
    isWinner=false
    powerPillActive=false
    score=0
    startBtn.classList.add('hide')
    gameBoard.createGrid(LEVEL)
    pauseBtn.classList.add('show')
    pacman= new Pacman(2,287)
    gameBoard.addObject(287,[object_type.PACMAN])
    document.addEventListener('keydown',(e)=>{
        pacman.handleKeyInput(e,gameBoard.objectExists)
    })

     ghosts=[
        new Ghost(5, 188, randomMovement, object_type.BLINKY),
        new Ghost(4, 209, randomMovement, object_type.PINKY),
        new Ghost(3, 230, randomMovement, object_type.INKY),
        new Ghost(2, 251, randomMovement, object_type.CLYDE)
    ]

    timer=setInterval(()=>gameLoop(pacman,ghosts),speed)
}
function pauseGame(){
    if(timer){
        clearInterval(timer)
        timer = null
        pauseBtn.textContent = "Resume"
    } else {
        timer = setInterval(() => gameLoop(pacman, ghosts), speed)
        pauseBtn.textContent = "Pause"
    }
}

startBtn.addEventListener('click', startGame)
pauseBtn.addEventListener('click', pauseGame)