class Game {
    constructor() {

        this.ship = new Ship();
        this.ship.alive = false;

        this.bullets = [];
        this.asteroids = [];
        this.initializeAstroids()

        this.paused = false;
        this.score = 0;

        this.title = "ASTEROIDS";

        return this;
    }

    initializeAstroids() {
        this.asteroids = [];
        for (var i = 0; i < 5; i++) {
            var xBuffer = window.innerWidth / 8;
            var yButter = window.innerHeight / 8;
            var x = window.innerWidth / 2 + (xBuffer + (window.innerWidth/2 - xBuffer) * random()) * randomSign();
            var y = window.innerHeight / 2 + (yButter + (window.innerHeight/2 - yButter) * random()) * randomSign();

            this.asteroids.push(new LargeAsteroid(new Point(x, y), new Velocity().set(1, 2 * PI * random())));
        }
    }

    initializeGame() {
        if (!this.ship.alive) {
            this.initializeAstroids();
            this.ship = new Ship(new Point(window.innerWidth / 2, window.innerHeight / 2));
            this.score = 0;

            // push()
            
        }
    }

    advance() {
        if (!this.paused) {
            this.handleInput();

            for (var i in this.asteroids) {
                this.asteroids[i].advance();
                this.wrapAroundEdge(this.asteroids[i]);
            }

            for (var i in this.bullets) {
                this.bullets[i].advance();
                this.wrapAroundEdge(this.bullets[i]);
            }

            this.ship.advance();
            this.wrapAroundEdge(this.ship);

            this.handleCollisions();
            this.removeDeadObjects();
        }
    }

    wrapAroundEdge(obj) {
        if (obj.point.x > window.innerWidth) obj.point.x = obj.point.x - window.innerWidth;
        if (obj.point.x < 0) obj.point.x = obj.point.x + window.innerWidth;
        if (obj.point.y > window.innerHeight) obj.point.y = obj.point.y - window.innerHeight;
        if (obj.point.y < 0) obj.point.y = obj.point.y + window.innerHeight;
    }

    draw() {
        this.ship.draw();

        for (var i in this.asteroids) {
            this.asteroids[i].draw();

            var x = this.asteroids[i].point.x;
            var y = this.asteroids[i].point.y;

            if (x < this.asteroids[i].radius) this.asteroids[i].drawAtPoint(new Point(x + window.innerWidth, y));
            if (x > window.innerWidth - this.asteroids[i].radius) this.asteroids[i].drawAtPoint(new Point(x - window.innerWidth, y));
            if (y < this.asteroids[i].radius) this.asteroids[i].drawAtPoint(new Point(x, y + window.innerHeight));
            if (y > window.innerHeight - this.asteroids[i].radius) this.asteroids[i].drawAtPoint(new Point(x, y - window.innerHeight));

        }

        for (var i in this.bullets) {
            this.bullets[i].draw();
        }

        if (!this.ship.alive || this.paused) {

            push()
            fill(255);
            noStroke();
            translate(window.innerWidth / 2, window.innerHeight / 2);
            textFont('monospace');
            textSize(100);
            textAlign(CENTER, CENTER);
            text(this.title, 0, 0);

            textSize(40);
            text("Press [Enter] To Start", 0, 80);
            pop();
        }
    }

    rotateRight() {
        this.ship.rotate(PI / 30.5);
    }

    rotateLeft() {
        this.ship.rotate(-PI / 30.5);
    }

    thrust() {
        if (this.ship.alive) {
            var thrust = new Velocity().set(0.4, this.ship.rotation);
            this.ship.velocity.dx += thrust.dx;
            this.ship.velocity.dy += thrust.dy;
        }
    }

    fire() {
        if (this.ship.alive) {
            var bulletVelocity = new Velocity().set(8, this.ship.rotation);
            bulletVelocity.dx += this.ship.velocity.dx;
            bulletVelocity.dy += this.ship.velocity.dy;
            var bulletPoint = new Point(this.ship.point.x, this.ship.point.y);
            this.bullets.push(new Bullet(bulletPoint, bulletVelocity));
        }
    }

    handleCollisions() {
        for (var i in this.asteroids) {
            for (var j in this.bullets) {
                if (this.getClosestDistance(this.asteroids[i], this.bullets[j]) < this.asteroids[i].radius && this.bullets[j].alive) {
                    this.breakAsteroid(this.asteroids[i]);
                    this.asteroids[i].alive = false;
                    this.bullets[j].alive = false;
                }
            }

            if (this.getClosestDistance(this.asteroids[i], this.ship) < this.asteroids[i].radius / 2 + this.ship.radius) {
                this.ship.alive = false;
                this.title = "GAME OVER";
            }
        }
    }

    breakAsteroid(asteroid) {
        switch (asteroid.radius) {
            case new LargeAsteroid().radius:
                this.asteroids.push(this.generateAsteroid(new MediumAsteroid(), asteroid, 0 + randomPM(), 1 + randomPM()));
                this.asteroids.push(this.generateAsteroid(new MediumAsteroid(), asteroid, 0 + randomPM(), -1 + randomPM()));
                this.asteroids.push(this.generateAsteroid(new SmallAsteroid(), asteroid, 2 + randomPM(), 0 + randomPM()));
                break;

            case new MediumAsteroid().radius:
                this.asteroids.push(this.generateAsteroid(new SmallAsteroid(), asteroid, 3 + randomPM(), 0 + randomPM()));
                this.asteroids.push(this.generateAsteroid(new SmallAsteroid(), asteroid, -3 + randomPM(), 0 + randomPM()));
                break;
        }
    }

    generateAsteroid(child, parent, ddx = 0, ddy = 0) {
        child.point.x = parent.point.x;
        child.point.y = parent.point.y;
        child.velocity.dx = parent.velocity.dx + ddx;
        child.velocity.dy = parent.velocity.dy + ddy;
        return child;
    }

    getClosestDistance(obj1, obj2) {
        var dMax = max(abs(obj1.velocity.dx), abs(obj1.velocity.dy));
        dMax = max(dMax, abs(obj2.velocity.dx));
        dMax = max(dMax, abs(obj2.velocity.dy));
        dMax = max(dMax, 0.1);

        var distMin = 999999999999;
        for (var i = 0.0; i <= dMax; i++) {
            var point1 = new Point(obj1.point.x + (obj1.velocity.dx * i / dMax),
                obj1.point.y + (obj1.velocity.dy * i / dMax));
            var point2 = new Point(obj2.point.x + (obj2.velocity.dx * i / dMax),
                obj2.point.y + (obj2.velocity.dy * i / dMax));

            var xDiff = point1.x - point2.x;
            var yDiff = point1.y - point2.y;

            var distSquared = (xDiff * xDiff) + (yDiff * yDiff);

            distMin = min(distMin, distSquared);
        }

        var distance = sqrt(distMin);
        return distance;
    }

    removeDeadObjects() {
        for (var i in this.asteroids) {
            if (!this.asteroids[i].alive) {
                this.asteroids.splice(i, 1);
                i--;
            }
        }

        for (var i in this.bullets) {
            if (!this.bullets[i].alive) {
                this.bullets.splice(i, 1);
                i--;
            }
        }
    }

    handleInput() {
        if (input.right) { this.rotateRight(); }
        else if (input.left) { this.rotateLeft(); }

        if (input.up) { this.thrust(); }

        if (input.space) {
            this.fire();
            input.space = false;
        }
    }
}

class Point {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
        return this;
    }

    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }

    move(velocity) {
        this.x += velocity.dx;
        this.y += velocity.dy;
        return this;
    }
}

class Velocity {
    constructor(dx = 0, dy = 0) {
        this.dx = dx;
        this.dy = dy;
        return this;
    }

    set(speed, angle) {
        this.dx = speed * cos(angle);
        this.dy = speed * sin(angle);
        return this;
    }
}

class FlyingObject {
    constructor(point = new Point(), velocity = new Velocity()) {
        this.point = point;
        this.velocity = velocity;
        this.rotation = 0;
        this.alive = true;
        return this;
    }

    advance() {
        this.point.move(this.velocity);
        return this;
    }

    rotate(angle) {
        this.rotation += angle;
    }
}


class Ship extends FlyingObject {
    constructor(point = new Point(), velocity = new Velocity()) {
        super(point, velocity);
        this.radius = 30;
        this.rotation = -PI / 2;
    };

    draw() {
        if (this.alive) {
            push()
            translate(this.point.x, this.point.y);
            rotate(this.rotation + PI / 2);
            triangle(0, -20, -10, 10, 10, 10);
            pop()
        }
    }
}


class Bullet extends FlyingObject {
    constructor(point = new Point(), velocity = new Velocity()) {
        super(point, velocity);
        this.radius = 1;
        this.rotation = -PI / 2;
        this.remainingFrames = 40;
    };

    draw() {
        if (this.alive) {
            push()
            translate(this.point.x, this.point.y);
            ellipse(0, 0, this.radius, this.radius);
            pop()
        }
    }

    advance() {
        this.point.move(this.velocity);
        if (--this.remainingFrames < 0) this.alive = false;
        return this;
    }
}


class Asteroid extends FlyingObject {
    constructor(point = new Point(), velocity = new Velocity()) {
        super(point, velocity);
        this.radius = 100;
        this.rotationSpeed = randomSign();
    };

    draw() {
        if (this.alive) {
            this.rotation += this.rotationSpeed;
            drawPath(this.shape, this.point, this.rotation);
        }
    }

    drawAtPoint(point) {
        if (this.alive) {
            this.rotation += this.rotationSpeed;
            drawPath(this.shape, point, this.rotation);
        }
    }
};

class LargeAsteroid extends Asteroid {
    constructor(point = new Point(), velocity = new Velocity()) {
        super(point, velocity);
        this.radius = 50;
        this.rotationSpeed *= PI / 160;
        this.shape = generateAsteroidShape(this.radius);
    }
}

class MediumAsteroid extends Asteroid {
    constructor(point = new Point(), velocity = new Velocity()) {
        super(point, velocity);
        this.radius = 25;
        this.rotationSpeed *= PI / 72;
        this.shape = generateAsteroidShape(this.radius);
    }
}

class SmallAsteroid extends Asteroid {
    constructor(point = new Point(), velocity = new Velocity()) {
        super(point, velocity);
        this.radius = 15;
        this.rotationSpeed *= PI / 48;
        this.shape = generateAsteroidShape(this.radius);
    }
}


///////////////////////////////////////////////////////////


function setup() {
    drawCanvas();
    game = new Game();
}

function draw() {
    drawCanvas();
    game.advance();
    game.draw();
}


function generateAsteroidShape(radius) {
    var points = []
    var rFactor = radius / 4;
    var sides = 12 + 6 * randomPM();
    for (var i = 0.0; i < 2 * PI; i += 2 * PI / sides) {
        points.push(new Point(radius * cos(i) + (rFactor * randomPM()), radius * sin(i) + (rFactor * randomPM())));
    }
    return points;
}

function drawPath(points, center, rotation = 0) {
    push();
    translate(center.x, center.y)
    rotate(rotation);
    for (var i = 0; i < points.length - 1; i++) {
        line(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
    }
    line(points[0].x, points[0].y, points[points.length - 1].x, points[points.length - 1].y);
    pop();
}

function drawCanvas() {
    createCanvas(window.innerWidth, window.innerHeight);
    background(0);
    strokeWeight(4);
    stroke(255);
    noFill();
}

function randomSign() {
    return random() > 0.5 ? -1.0 : 1.0;
}

function randomPM() {
    var num = random();
    var sign = random() > 0.5 ? -1.0 : 1.0;
    return num * sign;
}

///////////////////////////////////////////////////////////

var input = {
    right: false,
    left: false,
    up: false,
    down: false,
    space: false,
}

document.addEventListener("keydown", function (event) {
    console.log(event.which);
    switch (event.which) {
        case 32: //space
            input.space = true;
            break;
        case 39: //right arrow
            input.right = true;
            break;
        case 37: //left arrow
            input.left = true;
            break;
        case 38: //up arrow
            input.up = true;
            break;
        case 40: //down arrow
            break;
        case 13: //enter
            game.initializeGame();
            break;
    }
});

document.addEventListener("keyup", function (event) {
    // console.log(event.which);
    switch (event.which) {
        case 32: //space
            input.space = false;
            break;
        case 39: //right arrow
            input.right = false;
            break;
        case 37: //left arrow
            input.left = false;
            break;
        case 38: //up arrow
            input.up = false;
            break;
        case 40: //down arrow
            break;
    }
});