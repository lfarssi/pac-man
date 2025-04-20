import { DIRECTIONS,OBJECT_TYPE } from "./setup.js";

export function randomMovement(position, direction, objectExists){
    let dir=direction;
    let nextMovePos=position+dir.movement;
    const keys= Object.keys(DIRECTIONS)
    const maxAttemp=10
    let attemp=0
    while((objectExists(nextMovePos,OBJECT_TYPE.WALL)||objectExists(nextMovePos,OBJECT_TYPE.GHOST)&&attemp<maxAttemp)){
        console.log("errior");
        const key= keys[Math.floor(Math.random()*keys.length)]
        dir= DIRECTIONS[key]
        nextMovePos=position+dir.movement
        attemp++
    }
    return {nextMovePos, direction:dir}
}