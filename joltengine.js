// joltengine.js

class GameObject {
    constructor(name, type, shape, x, y, rot, xvel, yvel, rotvel, width, height, color = "black", gravity = false, collision = false, weight = 1, image = null) {
        this.name = name;
        this.type = type;
        this.shape = shape;
        this.x = x;
        this.y = y;
        this.rot = rot;
        this.xvel = xvel;
        this.yvel = yvel;
        this.rotvel = rotvel;
        this.width = width;
        this.height = height;
        this.color = color;
        this.gravity = gravity;
        this.collision = collision;
        this.weight = weight;
        this.image = null;

        if (image) {
            const img = new Image();
            img.src = image;
            this.image = img;
        }
    }

    setPosition(x, y, rot) {
        this.x = x;
        this.y = y;
        this.rot = rot;
    }

    addForce(xvel, yvel, rotvel) {
        this.xvel += xvel;
        this.yvel += yvel;
        this.rotvel += rotvel;
    }

    applyFriction(frictionX, frictionY, frictionRot) {
        this.xvel *= frictionX;
        this.yvel *= frictionY;
        this.rotvel *= frictionRot;
    }

    updatePosition() {
        this.x += this.xvel;
        this.y += this.yvel;
        this.rot += this.rotvel;
    }
}

const objects = {};

function createObject(name, type, shape, x = 0, y = 0, rot = 0, xvel = 0, yvel = 0, rotvel = 0, width = 50, height = 50, color = "black", gravity = false, collision = false, weight = 1, image = null) {
    const obj = new GameObject(name, type, shape, x, y, rot, xvel, yvel, rotvel, width, height, color, gravity, collision, weight, image);
    objects[name] = obj;
}

let GRAVITY = 0.5;

function setGravity(value) {
    GRAVITY = value;
}

function applyGravity() {
    for (const key in objects) {
        const obj = objects[key];
        if (obj.gravity) {
            obj.yvel += GRAVITY * obj.weight;
        }
    }
}

function collisionDetection() {
    for (const keyA in objects) {
        const objA = objects[keyA];
        objA.isOnGround = false;

        if (!objA.collision) continue;

        for (const keyB in objects) {
            if (keyA === keyB) continue;
            const objB = objects[keyB];
            if (!objB.collision) continue;

            if (checkCollision(objA, objB)) {
                if (objA.y < objB.y) {
                    objA.y = objB.y - objB.height / 2 - objA.height / 2;
                    objA.yvel = 0;
                    objA.isOnGround = true;
                } else {
                    objA.y = objB.y + objB.height / 2 + objA.height / 2;
                    objA.yvel = 0;
                }
            }
        }
    }
}

function checkCollision(objA, objB) {
    if (objA.shape === "rectangle" && objB.shape === "rectangle") {
        return (
            objA.x - objA.width / 2 < objB.x + objB.width / 2 &&
            objA.x + objA.width / 2 > objB.x - objB.width / 2 &&
            objA.y - objA.height / 2 < objB.y + objB.height / 2 &&
            objA.y + objA.height / 2 > objB.y - objB.height / 2
        );
    } else if (objA.shape === "circle" && objB.shape === "circle") {
        const dx = objA.x - objB.x;
        const dy = objA.y - objB.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (objA.width / 2 + objB.width / 2);
    } else {
        // rectangle-circle collision
        let circle, rect;
        if (objA.shape === "circle") {
            circle = objA;
            rect = objB;
        } else {
            circle = objB;
            rect = objA;
        }

        // closest point on rectangle to circle
        const closestX = Math.max(rect.x - rect.width / 2, Math.min(circle.x, rect.x + rect.width / 2));
        const closestY = Math.max(rect.y - rect.height / 2, Math.min(circle.y, rect.y + rect.height / 2));

        const dx = circle.x - closestX;
        const dy = circle.y - closestY;

        return (dx * dx + dy * dy) < (circle.width / 2) * (circle.width / 2);
    }
}

function drawAll(ctx, canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const key in objects) {
        const obj = objects[key];
        ctx.save();
        ctx.translate(obj.x, obj.y);
        ctx.rotate(obj.rot * Math.PI / 180);

        if (obj.image) {
            ctx.drawImage(obj.image, -obj.width / 2, -obj.height / 2, obj.width, obj.height);
        } else {
            ctx.fillStyle = obj.color;

            if (obj.shape === "circle") {
                ctx.beginPath();
                ctx.arc(0, 0, obj.width / 2, 0, 2 * Math.PI);
                ctx.fill();
            } else if (obj.shape === "rectangle") {
                ctx.fillRect(-obj.width / 2, -obj.height / 2, obj.width, obj.height);
            }
        }

        ctx.restore();
    }
}

function gameLoop(userUpdate, ctx, canvas) {
    function loop() {
        applyGravity();

        for (const key in objects) {
            objects[key].updatePosition();
        }

        collisionDetection();

        userUpdate();
        drawAll(ctx, canvas);
        requestAnimationFrame(loop);
    }
    loop();
}

export { createObject, gameLoop, objects, setGravity };
