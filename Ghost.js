import { DIRECTIONS, object_type } from "./setup";

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
}