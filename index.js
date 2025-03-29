import {LEVEL, object_type} from './setup.js';
import GameBoard from './gameBoard.js';

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
    
}
function startGame(){

}