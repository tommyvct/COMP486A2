import { AnimatedSprite, Application, Container, Graphics, InteractionEvent, Sprite, Texture, Ticker } from "pixi.js";
import { characterAnimationSprites, pipeSprite, clamp, checkCollisionOneOnOne, drawDebugRect } from "./assets";

export class Character extends Container {
    public maxSpeed: number;
    public jumpHeight: number;
    public gravity: number;

    private speed: number;
    
    constructor(maxSpeed: number, jumpHeight: number, gravity: number) {
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

    public update(): void {
        this.speed = clamp(this.speed + this.gravity, this.maxSpeed, -9999);
        this.y = clamp(this.y + this.speed, 20, app.renderer.height - 20);
    }

    public jump(): void {
        this.speed = -this.jumpHeight;
    }
}

export class Pipe extends Container {
    private pipe1: Sprite;
    private pipe2: Sprite;

    constructor() {
        super();
        this.pipe1 = Sprite.from(pipeSprite);
        this.pipe2 = Sprite.from(pipeSprite);

        this.addChild(this.pipe1);
        this.addChild(this.pipe2);

        this.pipe1.anchor.set(0.5, 0);
        this.pipe2.anchor.set(0.5, 0);

        var scale = 0.4;
        this.pipe1.scale.set(scale, -scale)
        this.pipe2.scale.set(scale, scale)

        var distanceOffset = 100.0;
        this.pipe1.position.y -= distanceOffset;
        this.pipe2.position.y += distanceOffset;
    }

    public checkCollision(obj: Character): boolean {
        const pipe1Bounds = this.pipe1.getBounds();
        const pipe2Bounds = this.pipe2.getBounds();
        const objBounds = obj.getBounds();
        
        drawDebugRect(debug[0] as Graphics, pipe1Bounds);
        drawDebugRect(debug[1] as Graphics, pipe2Bounds);
        drawDebugRect(debug[2] as Graphics, objBounds);

        return checkCollisionOneOnOne(objBounds, pipe1Bounds) || checkCollisionOneOnOne(objBounds, pipe2Bounds);
    }
}


export class TouchLayer extends Container {
    private touchmask: Sprite;
    constructor() {
        super();
        this.touchmask = Sprite.from(pipeSprite); // doesn't matter which sprite
        this.touchmask.scale.set(99999, 99999);
        this.touchmask.alpha = 0;
        this.addChild(this.touchmask);
        this.touchmask.interactive = true;
    }

    public setCallBack(f: (...args: any[]) => void) {
        this.touchmask.on("pointerdown", f, this);
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

const character = new Character(10, 8, 0.2);
app.stage.addChild(character);
character.x = 310;
character.y = 240;

const pipe = new Pipe();
app.stage.addChild(pipe);
pipe.x = 500;
pipe.y = 350;

const touchLayer = new TouchLayer();
touchLayer.setCallBack((e: InteractionEvent) => {
    character.jump();
    console.log("e: ", e)
});
app.stage.addChild(touchLayer);

Ticker.shared.add(() => {
    // character.position.y = clamp(character.position.y + 1, 20, app.renderer.height - 20);
    var result = pipe.checkCollision(character);
    console.log("Collision: " + result);
}, character);

Ticker.shared.add(character.update, character);

const debug: Graphics[] = [];

for (let i = 0; i < 3; i++) {
    const graphic = new Graphics();
    debug.push(graphic);
    app.stage.addChild(graphic);
}

// TODO: Logic: tolerate collision, heart, counter, etc
// TODO: UI: pause, point counter,

// TODO: collision detection
// TODO: physics