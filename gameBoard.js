import { grid_size, cell_size, OBJECT_TYPE, class_list } from "./setup.js";

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
        level.forEach((square)=>{
            const  div= document.createElement('div')
            div.classList.add('square',class_list[square])
            console.log(class_list[square]);
            
            div.style.cssText=`width: ${cell_size}px; height:${cell_size}px;`
            this.DOMGrid.appendChild(div)
            this.grid.push(div)
            if (class_list[square]==OBJECT_TYPE.DOT)this.dotCount++
        })
       
    }
    addObject(pos , classes){
        this.grid[pos].classList.add(...classes)
    }
    removeObject(pos , classes){
        this.grid[pos].classList.remove(...classes)
    }
    objectExists=(pos , obj)=>{
        return this.grid[pos].classList.contains(obj)
    }
    rotatePacMan(pos, deg){
        this.grid[pos].style.transform=`rotate(${deg}deg)`
    }
    moveCharacter(character){
        if(character.shouldMove()){
            const {nextMovePos, direction}=character.getNextMove(this.objectExists.bind(this))
            const {classesToRemove, classesToAdd}=character.makeMove()
            if(character.rotation&& nextMovePos!==character.pos){
                this.rotatePacMan(nextMovePos,character.dir.rotation)
                this.rotatePacMan(character.pos,0)
            }   
            this.removeObject(character.pos,classesToRemove)
            this.addObject(nextMovePos,classesToAdd)
            character.setNewPos(nextMovePos,direction )
        }
    }
    static createGameBoard(DOMGrid, level){
        const board= new this(DOMGrid)
        board.createGrid(level)
        return board
    }
}
export default GameBoard