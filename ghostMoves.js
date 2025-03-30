import { DIRECTIONS,object_type } from "./setup.js";

export function randomMovement(position, direction, objectExists){
    let dir=direction;
    let nextMovePos=position+dir.movement;
    const keys= Object.keys(DIRECTIONS)
    while(objectExists(nextMovePos,object_type.WALL)||objectExists(nextMovePos,object_type.GHOSTLAIR)){
        const key= keys[Math.floor(Math.random()*keys.length)]
        dir= DIRECTIONS[key]
        nextMovePos=position+dir.movement
    }
    return {nextMovePos, direction:dir}
}