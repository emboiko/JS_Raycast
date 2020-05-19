const TILE_SIZE = 62.5;
const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;

const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE;

const FOV_ANGLE = 60 * (Math.PI / 180);

const WALL_STRIP_WIDTH = 1;
const NUM_RAYS = WINDOW_WIDTH / WALL_STRIP_WIDTH;

const MINIMAP_SCALE_FACTOR = 0.25;

class Map {
    constructor() {
        this.grid = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 1],
            [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1],
            [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ];
    }

    hasWallAt(x, y) {
        if (x < 0 || x > WINDOW_WIDTH || y < 0 || y > WINDOW_HEIGHT) {
            return true;
        }

        let mapGridIndexX = Math.floor(x / TILE_SIZE);
        let mapGridIndexY = Math.floor(y / TILE_SIZE);

        return this.grid[mapGridIndexY][mapGridIndexX] != 0;
    }

    render() {
        for (let i = 0; i < MAP_NUM_ROWS; i++) {
            for (let j = 0; j < MAP_NUM_COLS; j++) {
                let tileX = j * TILE_SIZE; 
                let tileY = i * TILE_SIZE;
                let tileColor = this.grid[i][j] == 1 ? "#222" : "#fff";
                stroke("#222");
                fill(tileColor);
                rect(
                    MINIMAP_SCALE_FACTOR * tileX,
                    MINIMAP_SCALE_FACTOR * tileY,
                    MINIMAP_SCALE_FACTOR * TILE_SIZE,
                    MINIMAP_SCALE_FACTOR * TILE_SIZE
                );
            }
        }
    }
}

class Player {
    constructor(){
        this.x = (WINDOW_WIDTH / 2);
        this.y = (WINDOW_HEIGHT / 2) + 250;
        this.radius = 3;
        this.walkDirection = 0;
        this.turnDirection = 0; 
        this.rotationAngle = Math.PI * 1.5;
        this.walkSpeed = 3;
        this.turnSpeed = 2.5 * (Math.PI / 180);
    }
    
    update(){
        this.rotationAngle += this.turnDirection * this.turnSpeed;
        let moveStep = this.walkDirection * this.walkSpeed;

        let newPlayerX = this.x + Math.cos(this.rotationAngle) * moveStep;
        let newPlayerY = this.y + Math.sin(this.rotationAngle) * moveStep;

        if (!grid.hasWallAt(newPlayerX, newPlayerY)) {
            this.x = newPlayerX;
            this.y = newPlayerY;
        }
    }

    render(){
        noStroke();
        fill("red");
        circle(
            MINIMAP_SCALE_FACTOR * this.x,
            MINIMAP_SCALE_FACTOR * this.y,
            MINIMAP_SCALE_FACTOR * this.radius
        );
    }
}

class Ray{
    constructor(rayAngle){
        this.rayAngle = normalizeAngle(rayAngle);
        this.wallHitX = 0;
        this.wallHitY = 0;
        this.distance = 0;
        this.wasHitVertical = false;

        this.isRayFacingDown = this.rayAngle > 0 && this.rayAngle < Math.PI;
        this.isRayFacingUp = !this.isRayFacingDown;

        this.isRayFacingRight = this.rayAngle < 0.5 * Math.PI || this.rayAngle > 1.5 * Math.PI;
        this.isRayFacingLeft = !this.isRayFacingRight;
    }

    cast(){
        let xintercept, yintercept;
        let xstep, ystep;

        ///////////////////////////////////
        //Horizontal Ray-Grid Intersection
        ///////////////////////////////////
        /*
         * Find coordinate of the first horizontal intersection (point A)
         * Find ystep
         * Find xstep
         * Convert intersection point (x,y) into map index [i,j]
         * if (intersection hits a wall): 
         *      store horizontal hit distance
         * else:
         *      find next horizontal intersection
         */

        let foundHorizontalWallHit = false;
        let horizontalWallHitX = 0;
        let horizontalWallHitY = 0;

        //Find the Y-Coordinate of the closest horizontal grid intersection
        yintercept = Math.floor(player.y / TILE_SIZE) * TILE_SIZE;
        //If we're pointing down, we need to add another tile
        yintercept += this.isRayFacingDown ? TILE_SIZE : 0;
        
        //Find the X-Coordinate of the closest horizontal grid intersection
        xintercept = player.x + (yintercept - player.y) / Math.tan(this.rayAngle);

        //Calculate the increment for xstep & ystep
        ystep = TILE_SIZE;
        ystep *= this.isRayFacingUp ? -1 : 1;

        xstep = TILE_SIZE / Math.tan(this.rayAngle);
        xstep *= (this.isRayFacingLeft && xstep > 0) ? -1 : 1;
        xstep *= (this.isRayFacingRight && xstep < 0) ? -1 : 1;

        let nextHorizontalTouchX = xintercept;
        let nextHorizontalTouchY = yintercept;

        //Increment xstep and ystep until we find a wall
        while (nextHorizontalTouchX >= 0 && nextHorizontalTouchX <= WINDOW_WIDTH && nextHorizontalTouchY >= 0 && nextHorizontalTouchY <= WINDOW_HEIGHT) {
            if (grid.hasWallAt(nextHorizontalTouchX, nextHorizontalTouchY - (this.isRayFacingUp ? 1:0))) {
                foundHorizontalWallHit = true;
                horizontalWallHitX = nextHorizontalTouchX;
                horizontalWallHitY = nextHorizontalTouchY;

                break;
            } else {
                nextHorizontalTouchX += xstep;
                nextHorizontalTouchY += ystep;
            }
        }

        ///////////////////////////////////
        //Vertical Ray-Grid Intersection
        ///////////////////////////////////
        /**
         * Find coordinate of the first vertical intersection 
         * Find xstep
         * Find ystep
         * Convert intersection point (x,y) into map index [i,j]
         * if (intersection hits a wall): 
         *      store vertical hit distance
         * else:
         *      find next vertical intersection
         */

        let foundVerticalWallHit = false;
        let verticalWallHitX = 0;
        let verticalWallHitY = 0;

        xintercept = Math.floor(player.x / TILE_SIZE) * TILE_SIZE;
        xintercept += this.isRayFacingRight ? TILE_SIZE : 0;
        
        yintercept = player.y + (xintercept - player.x) * Math.tan(this.rayAngle);

        xstep = TILE_SIZE;
        xstep *= this.isRayFacingLeft ? -1 : 1;

        ystep = TILE_SIZE * Math.tan(this.rayAngle);
        ystep *= (this.isRayFacingUp && ystep > 0) ? -1 : 1;
        ystep *= (this.isRayFacingDown && ystep < 0) ? -1 : 1;

        let nextVerticalTouchX = xintercept;
        let nextVerticalTouchY = yintercept;

        while (nextVerticalTouchX >= 0 && nextVerticalTouchX <= WINDOW_WIDTH && nextVerticalTouchY >= 0 && nextVerticalTouchY <= WINDOW_HEIGHT) {
            if (grid.hasWallAt(nextVerticalTouchX - (this.isRayFacingLeft ? 1:0), nextVerticalTouchY)) {
                foundVerticalWallHit = true;
                verticalWallHitX = nextVerticalTouchX;
                verticalWallHitY = nextVerticalTouchY;

                break;
            } else {
                nextVerticalTouchX += xstep;
                nextVerticalTouchY += ystep;
            }
        }

        //Calculate both horizontal & vertical distances => choose the smallest value

        let horizontalHitDistance = (foundHorizontalWallHit) 
            ? distanceBetweenPoints(player.x, player.y, horizontalWallHitX, horizontalWallHitY)
            : Number.MAX_VALUE;

        let verticalHitDistance = (foundVerticalWallHit)
            ? distanceBetweenPoints(player.x, player.y, verticalWallHitX, verticalWallHitY)
            : Number.MAX_VALUE;

        //Only store the shortest distance

        if (verticalHitDistance < horizontalHitDistance) {
            this.wallHitX = verticalWallHitX;
            this.wallHitY = verticalWallHitY;
            this.distance = verticalHitDistance;
            this.wasHitVertical = true;
        } else {
            this.wallHitX = horizontalWallHitX;
            this.wallHitY = horizontalWallHitY;
            this.distance = horizontalHitDistance;
            this.wasHitVertical = false;
        }

    }

    render(){
        stroke("rgba(255, 0, 0, 0.3)");
        line(
            MINIMAP_SCALE_FACTOR * player.x,
            MINIMAP_SCALE_FACTOR * player.y,
            MINIMAP_SCALE_FACTOR * this.wallHitX,
            MINIMAP_SCALE_FACTOR * this.wallHitY
        );
    }
}

let grid = new Map();
let player = new Player();
let rays = [];

function keyPressed(){
    if (keyCode == UP_ARROW) {
        player.walkDirection = 1;
    } else if (keyCode == DOWN_ARROW) {
        player.walkDirection = -1;
    } else if (keyCode == LEFT_ARROW) {
        player.turnDirection = -1;
    } else if (keyCode == RIGHT_ARROW) {
        player.turnDirection = 1;
    }
}

function keyReleased(){
    if (keyCode == UP_ARROW) {
        player.walkDirection = 0;
    } else if (keyCode == DOWN_ARROW) {
        player.walkDirection = 0;
    } else if (keyCode == LEFT_ARROW) {
        player.turnDirection = 0;
    } else if (keyCode == RIGHT_ARROW) {
        player.turnDirection = 0;
    }
}

function castAllRays(){
    //Start the first ray by subtracting half the FOV
    let rayAngle = player.rotationAngle - (FOV_ANGLE / 2);

    rays = [];

    for (let columns=0; columns<NUM_RAYS; columns++){
        let ray = new Ray(rayAngle);
        ray.cast();
        rays.push(ray);

        rayAngle += FOV_ANGLE / NUM_RAYS;
    }
}

function renderProjectedWalls(){
    for (let i = 0; i < NUM_RAYS; i++) {
        let ray = rays[i];
        let correctWallDistance = ray.distance * Math.cos(ray.rayAngle - player.rotationAngle);

        //Distance to projection plane
        let distanceProjectionPlane = (WINDOW_WIDTH / 2) / Math.tan(FOV_ANGLE/2);
        //Projected wall height
        let wallStripHeight = (TILE_SIZE / correctWallDistance) * distanceProjectionPlane;

        //compute transparency based on wall distance
        let alpha = 175 / correctWallDistance;
        let color = ray.wasHitVertical ? 255: 200;

        //render a rectangle with the calculated wall height
        fill(`rgba(${color}, ${color}, ${color}, ${alpha})`);
        noStroke();
        rect(
            i * WALL_STRIP_WIDTH,
            (WINDOW_HEIGHT / 2) - (wallStripHeight / 2),
            WALL_STRIP_WIDTH,
            wallStripHeight
        );
    }
}

function distanceBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt((x2-x1) * (x2-x1) + (y2 -y1) * (y2-y1));
}

function normalizeAngle(angle){
    angle = angle % (2 * Math.PI);
    if (angle < 0) {
        angle = (2 * Math.PI) + angle;
    }
    return angle;
}

function setup() {
    createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
}

function update() {
    player.update();
    castAllRays();
}

function draw() {
    clear("#000000");
    update();

    renderProjectedWalls();

    grid.render();
    
    for (ray of rays) {
        ray.render();
    }

    player.render();
}

