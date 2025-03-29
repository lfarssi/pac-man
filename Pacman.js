import { object_type, DIRECTIONS } from "./setup.js";

class Pacman{
    constructor(speed , startPos){
        this.pos= startPos
        this.speed= speed
        this.dir= null
        this.timer=0
        this.powerPill= false
        this.rotation=true
    }
    shouldMove(){
        if(!this.dir) return false;
        if (this.timer===this.speed){
            this.timer=0
            return true
        }
        this.timer++
    }
    getNextMove(objectExists){
        let nextMovePos= this.pos+this.dir.movement
        if(objectExists(nextMovePos, object_type.WALL)|| objectExists(nextMovePos, object_type.GHOSTLAIR)){
            nextMovePos= this.pos
        }
    return {nextMovePos, direction: this.dir}
    }
    makeMove(){
        const classesToRemove= [object_type.PACMAN]
        const classesToAdd= [object_type.PACMAN]
        return {classesToRemove, classesToAdd}
    }
    setNewPos(nextMovePos){
        this.pos= nextMovePos
    }
    handleKeyInput(e, objectExists){
        let dir;
        if( e.keyCode>=37 && e.keyCode<=40){
            dir= DIRECTIONS[e.key]
            console.log(e.key);
            
        }else{
            return
        }
        const nextMovePos= this.pos+ dir.movement
        if(objectExists(nextMovePos,object_type.WALL)||objectExists(nextMovePos,object_type.GHOSTLAIR))return 
        this.dir=dir
    }
}
export default Pacman