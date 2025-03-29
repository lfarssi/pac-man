import { object_type, direction } from "./setup";

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
}