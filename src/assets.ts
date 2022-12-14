import { Graphics, Rectangle, TextStyle } from "pixi.js";

export const characterAnimationSprites: Array<string> = 
[
    "character/boss03-act-00.png",
    "character/boss03-act-01.png",
    "character/boss03-act-02.png",
    "character/boss03-act-03.png",
    "character/boss03-act-04.png",
    "character/boss03-act-05.png",
    "character/boss03-act-06.png",
    "character/boss03-act-07.png",
    "character/boss03-act-08.png",
    "character/boss03-act-09.png",
    "character/boss03-act-10.png",
    "character/boss03-act-11.png",
    "character/boss03-act-12.png",
    "character/boss03-act-13.png"
]

export const pipeSprite: string = "pipe.png";
export const heartSprite: string = "heart_fill.png";
export const pauseSprite: string = "pause.png"
export const blackSprite: string = "black.png"

export function clamp(toClamp: number, limit1: number, limit2: number) 
{
    var min = Math.min(limit1, limit2);
    var max = Math.max(limit1, limit2);

    if (toClamp < min)
        return min;
    else if (toClamp > max)
        return max;
    else
        return toClamp;
}

export function checkCollisionOneOnOne(a: Rectangle, b: Rectangle)
{
    const rightmostLeft = a.left < b.left ? b.left : a.left;
    const leftmostRight = a.right > b.right ? b.right : a.right;

    if (leftmostRight <= rightmostLeft)
    {
        return false;
    }

    const bottommostTop = a.top < b.top ? b.top : a.top;
    const topmostBottom = a.bottom > b.bottom ? b.bottom : a.bottom;
    
    return topmostBottom > bottommostTop;
}

export function drawDebugRect(graphics: Graphics, rect: Rectangle)
{
    if (graphics == undefined)
    {
        return;
    }
    graphics.clear();
    graphics.lineStyle(5, 0xff0000, 1);
    graphics.beginFill(0, 0)

    graphics.moveTo(rect.left, rect.top);
    graphics.lineTo(rect.right, rect.top);
    graphics.lineTo(rect.right, rect.bottom);
    graphics.lineTo(rect.left, rect.bottom);
    graphics.closePath();
    graphics.endFill();
}

export function shrinkRect(rect: Rectangle, shrinkX: number, shrinkY: number)
{
    rect.x += shrinkX/2;
    rect.y += shrinkY/2;
    rect.width -= shrinkX;
    rect.height -= shrinkY;
}

/**
* Genrate random int
* @param min 
* @param max 
* @returns random int - min & max inclusive
*/
export const generateRandomNumber = (min: number, max: number) => {
    // credit: https://infinitbility.com/how-to-get-random-number-in-typescript/
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; 
}

export const ts = new TextStyle(
    {
        align: "center",
        fontSize: 42,
        fill: "#FFFFFF"
    }
);