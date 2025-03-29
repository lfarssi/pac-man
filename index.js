import {LEVEL, object_type} from './setup.js';
import GameBoard from './gameBoard.js';
import Pacman from './Pacman.js';
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

}
function checkCollision(pacman, ghosts){

}
function gameLoop(pacman, ghosts){
    gameBoard.moveCharacter(pacman)
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
    timer=setInterval(()=>gameLoop(pacman),speed)
}
startBtn.addEventListener('click', startGame)