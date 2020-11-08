var canvas = null, //canvas 
    ctx = null; //contexto 2d
var x = 50,
    y = 50;
var lastPress = null;
var KEY_LEFT = 37,
    KEY_UP = 38,
    KEY_RIGHT = 39,
    KEY_DOWN = 40,
    KEY_ENTER = 13;
var dir = 0;
var pause = true;

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

// paint rectangle
function paint(ctx) {
    // clean canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // draw square
    ctx.fillStyle = '#0f0';
    ctx.fillRect(x, y, 10, 10);

    // muestro ultima tecla presionada
    ctx.fillText('Last press: ' + lastPress, 0, 20);
}

function act() { //movimientos en el juego
    if (!pause) {
        // change direction rectangle
        if (lastPress == KEY_UP) {
            dir = 0;
        }
        if (lastPress == KEY_RIGHT) {
                dir = 1;
        }
        if (lastPress == KEY_DOWN) {
                dir = 2;
        }
        if (lastPress == KEY_LEFT) {
                dir = 3; 
        }
        // Move Rectangle
        if (dir == 0) {
            y -= 10;
        }
        if (dir == 1) {
            x += 10;
        }      
        if (dir == 2) {
            y += 10;
        }
        if (dir == 3) {
            x -= 10;
        }
        // Out Screen
        if (x > canvas.width) {
            x = 0;
        }
        if (y > canvas.height) {
            y = 0;
        }
        if (x < 0) {
            x = canvas.width;
        }
        if (y < 0) {
            y = canvas.height;
        }
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

    // start game
    run();
    repaint();
}

// when page load complete
window.addEventListener('load', init, false);


    