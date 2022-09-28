import { AnimatedSprite, Application, Container, InteractionEvent, Sprite, Texture, Ticker, Text, BitmapText, BitmapFont } from "pixi.js";
import { characterAnimationSprites, pipeSprite, clamp, checkCollisionOneOnOne, shrinkRect, heartSprite, generateRandomNumber, pauseSprite, blackSprite, ts } from "./assets";

// boilerplace credit: https://www.pixijselementals.com/

/**
 * Containing sprite and callbacks for jumping and updating position
 */
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

    /**
     * Numerical integration from acceleration to displacement, with respect to time.
     */
    public update(): void
    {
        if (Ticker.shared.speed != 0) // if not paused
        {
            this.speed = clamp((this.speed + this.gravity) * Ticker.shared.speed, this.maxSpeed, -9999);
            this.y = clamp((this.y + this.speed) * Ticker.shared.speed, 20, app.view.clientHeight - 20);
        }
    }

    /**
     * Callback function to make the character jump
     */
    public jump(): void
    {
        this.speed = -this.jumpHeight;
    }
}

/**
 * Containing Sprites and collision detection for the pipe
 */
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

    /**
     * Collision detection against this object
     * 
     * @param obj the character to be tested against
     * @returns whether 2 objects collided with each other
     */
    public checkCollision(obj: Character): boolean
    {
        const pipe1Bounds = this.pipe1.getBounds();
        const pipe2Bounds = this.pipe2.getBounds();
        const objBounds = obj.getBounds();
        shrinkRect(objBounds, 50, 50);
        return checkCollisionOneOnOne(objBounds, pipe1Bounds) || checkCollisionOneOnOne(objBounds, pipe2Bounds);
    }
}

/**
 * Containing Sprites and collision detection for the heart
 */
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

    /**
     * Collision detection against this object
     * 
     * @param obj the character to be tested against
     * @returns whether 2 objects collided with each other
     */
    public checkCollision(obj: Character): boolean
    {
        const r = checkCollisionOneOnOne(this.heart.getBounds(), obj.getBounds());
        return r;
    }
}

/**
 * A transparent sprite with interaction on.
 * I don't know if there's a better way to handle user input
 */
export class TouchLayer extends Container
{
    private touchmask: Sprite;

    constructor()
    {
        super();
        this.touchmask = Sprite.from(blackSprite); // doesn't matter which sprite
        this.touchmask.scale.set(99999, 99999);
        this.touchmask.alpha = 0;
        this.addChild(this.touchmask);
        this.touchmask.interactive = true;
    }

    /**
     * Pass the callback function to the touchmask sprite.
     * @param f callback function
     */
    public setCallBack(f: (...args: any[]) => void)
    {
        this.touchmask.on("pointerdown", f, this);
    }
}

/**
 * Sprites and text objects displaying pause button, current points and remaining shields
 */
export class HUD extends Container
{
    private pause: Sprite;
    private currentPoints: BitmapText;
    private currentShields: BitmapText;

    private blackBackground: Sprite;
    private resume: Text;

    constructor()
    {
        super();

        this.pause = Sprite.from(pauseSprite);
        this.addChild(this.pause);
        this.pause.renderable = true;
        this.pause.interactive = true;

        BitmapFont.from("comic 32",
            {
                fill: "#FFFFFF",
                fontFamily: "Comic Sans MS",
                fontSize: 32
            });
        this.currentPoints = new BitmapText("",
            {
                fontName: "comic 32",
                fontSize: 32,
                tint: 0xFFFFFF
            });
        this.currentPoints.anchor.set(0.5, 0);
        this.addChild(this.currentPoints);
        this.currentPoints.x = app.view.clientWidth / 2;
        this.currentPoints.y = 0;

        this.currentShields = new BitmapText("",
            {
                fontName: "comic 32",
                fontSize: 32,
                tint: 0xFFFFFF
            });
        this.currentShields.anchor.set(1, 0)
        this.addChild(this.currentShields);
        this.currentShields.x = app.view.clientWidth;
        this.currentShields.y = 0;

        this.blackBackground = Sprite.from(blackSprite);
        this.blackBackground.scale.set(9999, 9999);
        this.blackBackground.alpha = 0.8;
        this.blackBackground.renderable = false;
        this.addChild(this.blackBackground);


        this.resume = new Text('resume', ts);
        this.resume.anchor.set(0.5, 0.5);
        this.addChild(this.resume);
        this.resume.x = app.view.clientWidth / 2;
        this.resume.y = app.view.clientHeight / 2;
        this.resume.renderable = false;
        this.resume.interactive = false;
    }

    /**
     * Define what will happen when pause button is clicked
     * 
     * @param f callback function
     */
    public setPauseCallBack(f: (...args: any[]) => void)
    {
        this.pause.on("pointerdown", f, this);
        this.pause.on("pointerdown", (..._args: any[]) => 
        {
            // hide pause button
            this.pause.renderable = false;
            this.pause.interactive = false;
            //show blackBackground
            this.blackBackground.interactive = true;
            this.blackBackground.renderable = true;
            // show resume button
            this.resume.renderable = true;
            this.resume.interactive = true;
        }, this);
    }

    /**
     * Define what will happen when resume button is clicked
     * 
     * @param f callback function
     */
    public setResumeCallBack(f: (...args: any[]) => void)
    {
        this.resume.on("pointerdown", f, this);
        this.resume.on("pointerdown", (..._args: any[]) => 
        {
            // show pause button
            this.resume.renderable = false;
            this.resume.interactive = false;
            // hide blackBackground
            this.blackBackground.interactive = false;
            this.blackBackground.renderable = false;
            // hide resume button
            this.pause.renderable = true;
            this.pause.interactive = true;
        }, this);
    }

    /**
     * Update points earned on display
     * 
     * @param point 
     */
    public setPoints(point: number)
    {
        this.currentPoints.text = "" + point;
    }

    /**
     * Update the remaining shield number on display
     * 
     * @param shields remaining shield
     */
    public setShields(shields: number)
    {
        this.currentShields.text = "" + shields
    }
}

/**
 * Sprites and text object displaying the game start and game over screen.
 */
export class GameCover extends Container
{
    private blackBackground: Sprite;
    private startButton: Text;
    private retryButton: Text;
    private score: Text;

    constructor()
    {
        super();

        this.blackBackground = Sprite.from(blackSprite);
        this.blackBackground.scale.set(9999, 9999);
        this.blackBackground.alpha = 0.8;
        this.addChild(this.blackBackground);
        this.blackBackground.interactive = true;
        this.blackBackground.renderable = true;

        this.startButton = new Text("start", ts);
        this.startButton.anchor.set(0.5, 0.5);
        this.addChild(this.startButton);
        this.startButton.x = app.view.clientWidth / 2;
        this.startButton.y = app.view.clientHeight / 2;
        this.startButton.interactive = true;
        this.startButton.renderable = true;

        this.retryButton = new Text("start", ts);
        this.retryButton.anchor.set(0.5, 0.5);
        this.addChild(this.retryButton);
        this.retryButton.x = app.view.clientWidth / 2;
        this.retryButton.y = app.view.clientHeight / 2;
        this.retryButton.interactive = false;
        this.retryButton.renderable = false;

        this.score = new Text("", ts);
        this.score.anchor.set(0.5, 0.5);
        this.addChild(this.score);
        this.score.renderable = false;
        this.score.x = app.view.clientWidth / 2;
        this.score.y = app.view.clientHeight * 0.35
    }

    /**
     * Define what will happen when start button is clicked
     * 
     * @param f callback function
     */
    public setStartCallback(f: (...args: any[]) => void)
    {
        this.startButton.on("pointerdown", f, this);
        this.startButton.on("pointerdown", () =>
        {
            // hide retry button
            this.retryButton.interactive = false;
            this.retryButton.renderable = false;
            // hide blackBackground
            this.blackBackground.interactive = false;
            this.blackBackground.renderable = false;
            // hide score text
            this.score.renderable = false;
            this.score.renderable = false;
            // hide start button
            this.startButton.interactive = false;
            this.startButton.renderable = false;
        }, this);
    }

    /**
     * Define what will happen when restart button is clicked
     * 
     * @param f callback function
     */
    public setRestartCallback(f: (...args: any[]) => void)
    {
        this.startButton.on("pointerdown", f, this);
        this.startButton.on("pointerdown", () =>
        {
            // hide retry button
            this.retryButton.interactive = false;
            this.retryButton.renderable = false;
            // hide blackBackground
            this.blackBackground.interactive = false;
            this.blackBackground.renderable = false;
            // hide score text
            this.score.renderable = false;
            this.score.renderable = false;
            // hide start button
            this.startButton.interactive = false;
            this.startButton.renderable = false;
        }, this);
    }

    /**
     * Show the game over screen
     * 
     * @param score final score
     */
    public showGameOver(score: number)
    {
        // show blackBackground
        this.blackBackground.renderable = true;
        this.blackBackground.interactive = true;
        // show score
        this.score.text = "your score: " + score;
        this.score.renderable = true;
        // show retry button
        this.startButton.text = "retry";
        this.startButton.interactive = true;
        this.startButton.renderable = true;
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

// init character
const character = new Character(10, 6.5, 0.2);
app.stage.addChild(character);
character.x = 310;
character.y = app.view.clientHeight / 2;

// init pipes
const pipes: Pipe[] = [];

for (let index = 0; index < 2; index++)
{
    const pipe = new Pipe();
    pipe.x = app.view.clientWidth + 300 * (index + 1);
    pipe.y = app.view.clientHeight / 2 + generateRandomNumber(-app.view.clientHeight / 2 + 100, app.view.clientHeight / 2 - 100);
    app.stage.addChild(pipe);
    pipes.push(pipe)
}

// init heart
const heart = new Heart();
app.stage.addChild(heart);

// init touch detector
const touchLayer = new TouchLayer();
touchLayer.setCallBack((_e: InteractionEvent) =>
{
    character.jump();
});
app.stage.addChild(touchLayer);

// init game counter
const maxShield = 2;
var shield: number = 2;
var streak: number = 0;
var points: number = 0;

// game rule loop
Ticker.shared.add(() =>
{
    // move heart
    if (heart.renderable)
    {
        heart.x -= 2 * Ticker.shared.speed;
    }

    // take heart for shield
    const heartCollisionResult = heart.checkCollision(character);
    if (heartCollisionResult && heart.renderable && shield < maxShield)
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
            pipe.y = app.view.clientHeight / 2 + generateRandomNumber(-app.view.clientHeight / 2 + 100, app.view.clientHeight / 2 - 100);
            pipe.ignoreCollision = false;
            pipe.alpha = 1;

            // if successfully passed 2 pipes, and not full shield, give heart
            if (streak >= 2 && !heart.renderable && shield < maxShield)
            {
                heart.renderable = true;
                heart.x = pipe.x;
                heart.y = pipe.y;
            }
        }

        // collision calculation
        const pipeCollisionResult = pipe.checkCollision(character);
        // if collision happened
        if (pipeCollisionResult && !pipe.ignoreCollision)
        {
            streak = 0;
            // we still have a chance or two
            if (shield > 0)
            {
                shield--;
                pipe.ignoreCollision = true;
                pipe.alpha = 0.5;
            }
            else // you are done, try harder next time
            {
                Ticker.shared.speed = 0;
                gameCover.showGameOver(points);
            }
        }
        // no collision, increase counter
        else if (pipe.x < app.view.clientWidth / 2 - character.width / 2 && !pipe.ignoreCollision)
        {
            pipe.ignoreCollision = true;
            streak++;
            points++;
        }
    });
}, character);

// character physics
Ticker.shared.add(character.update, character);

// pause and resume
const hud = new HUD();
hud.setPauseCallBack((_e: InteractionEvent) =>
{
    Ticker.shared.speed = 0;

});
hud.setResumeCallBack((_e: InteractionEvent) =>
{
    Ticker.shared.speed = 1;
});
app.stage.addChild(hud);

// loop for updating hud
Ticker.shared.add(() =>
{
    hud.setPoints(points);
    hud.setShields(shield);
});

// game star and over screen
const gameCover = new GameCover();
app.stage.addChild(gameCover);
gameCover.setStartCallback(() =>
{
    Ticker.shared.speed = 1;
});
// reset everything
gameCover.setRestartCallback(() =>
{
    Ticker.shared.speed = 1;
    for (let index = 0; index < 2; index++)
    {
        pipes[index].x = app.view.clientWidth + 300 * (index + 1);
        pipes[index].y = app.view.clientHeight / 2 + generateRandomNumber(-app.view.clientHeight / 2 + 100, app.view.clientHeight / 2 - 100);
        pipes[index].alpha = 1;
    }

    character.y = app.view.clientHeight / 2;

    shield = maxShield;
    streak = 0;
    points = 0;
});

// don't start the game yet
Ticker.shared.speed = 0;

