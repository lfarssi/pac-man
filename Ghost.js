import { DIRECTIONS, object_type } from "./setup.js";

class Ghost{
    constructor(speed=5,startPos,movement, name){
        this.name=name
        this.movement=movement
        this.startPos=startPos
        this.pos=startPos
        this.dir=DIRECTIONS.ArrowRight
        this.speed=speed
        this.timer=0
        this.isScared=false
        this.rotation=false
    }
    shouldMove(){
        if(this.timer===this.speed){
            this.timer=0
            return true
        }
        this.timer++
        return false
    }
    getNextMove(objectExists){
        const   {nextMovePos, direction}=this.movement(
            this.pos,
            this.dir,
            objectExists
        )
        return {nextMovePos, direction}
    }
    makeMove(){
        const classesToRemove=[object_type.GHOST,object_type.SCARED, this.name]
        let classesToAdd=[object_type.GHOST, this.name]
        if(this.isScared)classesToAdd=[...classesToAdd, object_type.SCARED]
        return {classesToRemove, classesToAdd}
    }
    setNewPos(nextMovePos, direction){
        this.pos=nextMovePos
        this.dir=direction
    }
}

export default Ghost