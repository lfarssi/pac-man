import { DIRECTIONS,OBJECT_TYPE } from "./setup.js";

export function randomMovement(position, direction, objectExists){
    let dir=direction;
    let nextMovePos=position+dir.movement;
    const keys= Object.keys(DIRECTIONS)
    while(objectExists(nextMovePos,OBJECT_TYPE.WALL)||objectExists(nextMovePos,OBJECT_TYPE.GHOST)){
       // console.log("errior");
        
        
        const key= keys[Math.floor(Math.random()*keys.length)]
        dir= DIRECTIONS[key]
        nextMovePos=position+dir.movement
    }
    return {nextMovePos, direction:dir}
}