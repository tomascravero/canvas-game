var canvas = null, //canvas 
    ctx = null; //contexto 2d
var body = new Array(),//player = null, 
    food = null;
var lastPress = null;
var KEY_LEFT = 37,
    KEY_UP = 38,
    KEY_RIGHT = 39,
    KEY_DOWN = 40,
    KEY_ENTER = 13;
var dir = 0;
var pause = true;
var gameover = true;
var score = 0;
var iBody = new Image(),
    iFood = new Image();
var iEat = new Audio();

window.requestAnimationFrame = (function () {
    return window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    function (callback) {
        window.setTimeout(callback, 17);
    };
}());

document.addEventListener('keydown', function (evt) {
    lastPress = evt.which;
    //console.log(lastPress);
}, false);

function Rectangle(x, y, width, height) {
    this.x = (x == null) ? 0 : x;
    this.y = (y == null) ? 0 : y;
    this.width = (width == null) ? 0 : width;
    this.height = (height == null) ? this.width : height;

    this.intersects = function (rect) {
        if (rect == null) {
            window.console.warn('Missing parameters on function intersects');
        } else {
            return (this.x < rect.x + rect.width &&
            this.x + this.width > rect.x &&
            this.y < rect.y + rect.height &&
            this.y + this.height > rect.y);
        }
    };

    this.fill = function (ctx) {
        if (ctx == null) {
            window.console.warn('Missing parameters on function fill');
        } else {
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    };
}

function random(max) {
    return Math.floor(Math.random() * max);
}

function reset() {
    score = 0;
    dir = 1;
    body[0].x = 40;
    body[0].y = 40;
    food.x = random(canvas.width / 10 - 1) * 10;
    food.y = random(canvas.height / 10 - 1) * 10;
    gameover = false;
    body.length = 0;
    body.push(new Rectangle(40, 40, 10, 10));
    body.push(new Rectangle(0, 0, 10, 10));
    body.push(new Rectangle(0, 0, 10, 10));
}

// paint rectangle
function paint(ctx) {
    // clean canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    //draw  player
    //ctx.fillStyle = '#0f0';
    for (i = 0, l = body.length; i < l; i += 1) {
        //body[i].fill(ctx);
        ctx.drawImage(iBody, body[i].x, body[i].y); // player images
    }

    //draw food
    // ctx.fillStyle = '#f00';
    // food.fill(ctx);
    ctx.drawImage(iFood, food.x, food.y); // food images

    //draw score
    ctx.fillText('Score: ' + score, 0, 10);

    // muestro ultima tecla presionada
    ctx.fillStyle = '#fff';
    ctx.fillText('Last press: ' + lastPress, 0, 20);

    // draw pause
    if (pause) {
        ctx.textAlign = 'center';
        if (gameover) {
            ctx.fillText('GAME OVER.', 150, 75);
        } else {
            ctx.fillText('PAUSE', 150, 75);
        }
        ctx.textAlign = 'left';
    }   
}

function act() { //movimientos en el juego
    if (!pause) {
        // change direction rectangle
        if (lastPress == KEY_UP && dir != 2) {
            dir = 0;
        }
        if (lastPress == KEY_RIGHT && dir != 3) {
                dir = 1;
        }
        if (lastPress == KEY_DOWN && dir != 0) {
                dir = 2;
        }
        if (lastPress == KEY_LEFT && dir != 1) {
                dir = 3; 
        }
        // Move Rectangle
        if (dir == 0) {
            body[0].y -= 10;
        }
        if (dir == 1) {
            body[0].x += 10;
        }      
        if (dir == 2) {
            body[0].y += 10;
        }
        if (dir == 3) {
            body[0].x -= 10;
        }
        // Move Body
        for (i = body.length - 1; i > 0; i -= 1) {
            body[i].x = body[i - 1].x;
            body[i].y = body[i - 1].y;
        }
        // Body Intersects
        for (i = 2, l = body.length; i < l; i += 1) {
            if (body[0].intersects(body[i])) {
                gameover = true;
                pause = true;
            }
        }
        // Out Screen
        if (body[0].x > canvas.width) {
            body[0].x = 0;
        }
        if (body[0].y > canvas.height) {
            body[0].y = 0;
        }
        if (body[0].x < 0) {
            body[0].x = canvas.width;
        }
        if (body[0].y < 0) {
            body[0].y = canvas.height;
        }
        if (body[0].intersects(food)) {
            iEat.play();
            body.push(new Rectangle(food.x, food.y, 10, 10));
            score += 1;
            food.x = random(canvas.width / 10 -1) * 10;
            food.y = random(canvas.height / 10 -1) * 10;
        }
    }
    if (gameover) {
        reset();
    }
    if (lastPress == KEY_ENTER) {
        pause = !pause;
        lastPress = null;
    }
}

function repaint() {
    window.requestAnimationFrame(repaint);
    paint(ctx);
}

function run() {
    setTimeout(run, 50);
    act();
}

// init function
function init() {
    //get canvas & context
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    // create player
    body[0] = new Rectangle(40, 40, 10, 10);

    //create food
    food = new Rectangle(80, 80, 10, 10);

    // load assets
    iBody.src = 'assets/body.png';
    iFood.src = 'assets/fruit.png';
    iEat.src = 'assets/eat.ogg';

    // start game
    run();
    repaint();
}

// when page load complete
window.addEventListener('load', init, false);


    