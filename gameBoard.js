import { grid_size, cell_size, object_type, class_list } from "./setup.js";

class GameBoard {
    constructor(DOMGrid){
        this.dotCount=0
        this.grid=[]
        this.DOMGrid= DOMGrid   
    }
    showGameStatus(isWinner){
        const div= document.createElement("div")
        div.classList.add("game-status")
        div.innerHTML=`${isWinner? "Win": "Game Over"}`
        this.DOMGrid.appendChild(div)
    }
    createGrid(level) {
        this.dotCount=0
        this.grid=[]
        this.DOMGrid.innerHTML=''
        this.DOMGrid.style.cssText=`grid-template-columns:repeat(${grid_size}, ${cell_size}px)`
        level.forEach((square, i)=>{
            const  div= document.createElement('div')
            div.classList.add('square',class_list[square])
            div.style.cssText=`width: ${cell_size}px; height:${cell_size}px;`
            this.DOMGrid.appendChild(div)
            this.grid.push(div)
            if (class_list[square]==object_type.DOT)this.dotCount++
        })
       
    }
    addObject(pos , classes){
        this.grid[pos].classList.add(...classes)
    }
    removeObject(pos , classes){
        this.grid[pos].classList.remove(...classes)
    }
    objectExists(pos , obj){
        return this.grid[pos].classList.contains(obj)
    }
    rotatePacMan(pos, deg){
        this.grid[pos].style.transform=`rotate({deg}deg)`
    }
    static createGameBoard(DOMGrid, level){
        const board= new this(DOMGrid)
        board.createGrid(level)
        return board
    }
}
export default GameBoard