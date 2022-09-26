import { AnimatedSprite, Application, Container, InteractionEvent, Sprite, Texture, Ticker } from "pixi.js";
import { characterAnimationSprites, pipeSprite, clamp, checkCollisionOneOnOne, shrinkRect, heartSprite, generateRandomNumber } from "./assets";

export class Character extends Container
{
    public maxSpeed: number;
    public jumpHeight: number;
    public gravity: number;

    private speed: number;

    constructor(maxSpeed: number, jumpHeight: number, gravity: number)
    {
        super();

        const animatedChar: AnimatedSprite = new AnimatedSprite(characterAnimationSprites.map((a) => Texture.from(a)));
        this.addChild(animatedChar);
        animatedChar.loop = true;
        animatedChar.play();
        animatedChar.animationSpeed = 0.2
        animatedChar.anchor.set(0.5, 0.5)
        var scale = 0.5
        animatedChar.scale.set(-scale, scale);

        this.maxSpeed = maxSpeed;
        this.jumpHeight = jumpHeight;
        this.gravity = gravity;
        this.speed = 0;

    }

    public update(): void
    {
        if (Ticker.shared.speed != 0)
        {
            this.speed = clamp((this.speed + this.gravity) * Ticker.shared.speed, this.maxSpeed, -9999);
            this.y = clamp((this.y + this.speed) * Ticker.shared.speed, 20, app.view.clientHeight - 20);
        }
    }

    public jump(): void
    {
        this.speed = -this.jumpHeight;
    }
}

export class Pipe extends Container
{
    private pipe1: Sprite;
    private pipe2: Sprite;

    public ignoreCollision: boolean = false;

    constructor()
    {
        super();
        this.pipe1 = Sprite.from(pipeSprite);
        this.pipe2 = Sprite.from(pipeSprite);

        this.addChild(this.pipe1);
        this.addChild(this.pipe2);

        this.pipe1.anchor.set(0.5, 0);
        this.pipe2.anchor.set(0.5, 0);

        var scale = 0.4;
        this.pipe1.scale.set(scale * 0.9, -scale)
        this.pipe2.scale.set(scale * 0.9, scale)

        var distanceOffset = 100.0;
        this.pipe1.position.y -= distanceOffset;
        this.pipe2.position.y += distanceOffset;
    }

    public checkCollision(obj: Character): boolean
    {
        const pipe1Bounds = this.pipe1.getBounds();
        const pipe2Bounds = this.pipe2.getBounds();
        const objBounds = obj.getBounds();
        shrinkRect(objBounds, 50, 50);
        return checkCollisionOneOnOne(objBounds, pipe1Bounds) || checkCollisionOneOnOne(objBounds, pipe2Bounds);
    }
}

export class Heart extends Container
{
    private heart: Sprite;

    public ignoreCollision: boolean = false;

    constructor()
    {
        super();

        this.heart = Sprite.from(heartSprite);
        this.addChild(this.heart);
        this.heart.anchor.set(0.5, 0.5);

        var scale = 0.5;
        this.heart.scale.set(scale, scale);

        this.renderable = false;
    }

    public checkCollision(obj: Character): boolean
    {
        const r = checkCollisionOneOnOne(this.heart.getBounds(), obj.getBounds());
        return r;
    }
}

export class TouchLayer extends Container
{
    private touchmask: Sprite;
    constructor()
    {
        super();
        this.touchmask = Sprite.from(pipeSprite); // doesn't matter which sprite
        this.touchmask.scale.set(99999, 99999);
        this.touchmask.alpha = 0;
        this.addChild(this.touchmask);
        this.touchmask.interactive = true;
    }

    public setCallBack(f: (...args: any[]) => void)
    {
        this.touchmask.on("pointerdown", f, this);
    }
}

export class GameRule
{
    private _state: number;
    private readonly lives: number;

    public get state(): number
    {
        return this._state;
    }


    constructor(lives: number)
    {
        this._state = -1;
        this.lives = lives;
    }

    public startGame(): void
    {
        this._state = this.lives;
    }

    public gainLive(): void
    {
        this._state++;
    }

    public gameOver(): boolean
    {
        return this._state <= 0;
    }

}

const app = new Application({
    view: document.getElementById("pixi-canvas") as HTMLCanvasElement,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
    backgroundColor: 0x6495ed,
    width: 640,
    height: 480
});

const character = new Character(10, 6.5, 0.2);
app.stage.addChild(character);
character.x = 310;
character.y = 240;

const pipes: Pipe[] = [];

for (let index = 0; index < 2; index++)
{
    const pipe = new Pipe();
    pipe.x = app.view.clientWidth + 300 * (index + 1);
    pipe.y = app.view.clientHeight / 2 + generateRandomNumber(-app.view.clientHeight / 2 + 100, app.view.clientHeight / 2 - 100);
    app.stage.addChild(pipe);
    pipes.push(pipe)
}

const heart = new Heart();
app.stage.addChild(heart);


const touchLayer = new TouchLayer();
touchLayer.setCallBack((_e: InteractionEvent) =>
{
    character.jump();
});
app.stage.addChild(touchLayer);

var shield: number = 2;
var streak: number = 0;


Ticker.shared.add(() =>
{
    if (heart.renderable)
    {
        heart.x -= 2 * Ticker.shared.speed;
        
    }

    const heartCollisionResult = heart.checkCollision(character);
    if (heartCollisionResult && heart.renderable)
    {
        shield++;
        heart.renderable = false;
    }


    pipes.forEach(pipe =>
    {
        // move pipes
        pipe.x -= 2 * Ticker.shared.speed;

        // wrap around
        if (pipe.x < -30)
        {
            pipe.x = app.view.clientWidth + 20;
            pipe.ignoreCollision = false;
            pipe.alpha = 1;

            if (streak >= 2 && !heart.renderable)
            {
                heart.renderable = true;
                heart.x = pipe.x;
                heart.y = pipe.y;
            }
        }

        const pipeCollisionResult = pipe.checkCollision(character);
        if (pipeCollisionResult && !pipe.ignoreCollision)
        {
            streak = 0;
            if (shield > 0)
            {
                shield--;
                pipe.ignoreCollision = true;
                pipe.alpha = 0.5;
            }
            else
            {
                Ticker.shared.speed = 0;
                console.log("Game over!")
            }
        }
        else if (pipe.x < app.view.width/2 - character.width/2 && !pipe.ignoreCollision)
        {
            pipe.ignoreCollision = true;
            streak++;
        }
    });
}, character);

Ticker.shared.add(character.update, character);





// TODO: UI: pause, point counter,