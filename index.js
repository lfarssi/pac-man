import {LEVEL, object_type} from './setup.js';
import { randomMovement } from './ghostMoves.js';

import GameBoard from './gameBoard.js';
import Pacman from './Pacman.js';
import Ghost from './Ghost.js';

const gameGrid = document.querySelector('#game')
const scoreTab = document.querySelector('#score')
const startBtn = document.querySelector('#start-game')

const power= 10000
const speed= 80
const gameBoard= GameBoard.createGameBoard(gameGrid, LEVEL)

let score=0
let timer= null
let isWinner = false
let powerPillActive= false
let powerPillTimer= null


function gameOver(pacman, grid){
    document.removeEventListener('keydown',e=>pacman.handleKeyInput(e,gameBoard.objectExists))
    gameBoard.showGameStatus(isWinner)
    clearInterval(timer)
    startBtn.classList.remove('hide')
}
function checkCollision(pacman, ghosts){
    const collidedGhost=ghosts.find(ghost=>pacman.pos===ghost.pos)
    if (collidedGhost){
        if(pacman.powerPillActive){
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


    
}
function startGame(){
    isWinner=false
    powerPillActive=false
    score=0
    startBtn.classList.add('hide')
    gameBoard.createGrid(LEVEL)
    const pacman= new Pacman(2,287)
    gameBoard.addObject(287,[object_type.PACMAN])
    document.addEventListener('keydown',(e)=>{
        pacman.handleKeyInput(e,gameBoard.objectExists)
    })

    const ghosts=[
        new Ghost(5, 188, randomMovement, object_type.BLINKY),
        new Ghost(4, 209, randomMovement, object_type.PINKY),
        new Ghost(3, 230, randomMovement, object_type.INKY),
        new Ghost(2, 251, randomMovement, object_type.CLYDE)
    ]

    timer=setInterval(()=>gameLoop(pacman,ghosts),speed)
}
startBtn.addEventListener('click', startGame)