/*jslint bitwise:true, es5: true */
(function (window, undefined)   {
    'use strict';
    var canvas = null, //canvas 
        ctx = null; //contexto 2d
    var body = [],//player = undefined, 
        food = null;
    var buffer = null,
        bufferCtx = null,
        bufferScale = null,
        bufferOffsetX = 0,
        bufferOffsetY = 0;
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
    var iEat = new Audio(),
        iDead = new Audio();
    var currentScene = 0,
        scenes = [];
    var mainScene = null,
        gameScene = null,
        highScene = null;
    var highscores = [],
        posHighscore = 10;

    window.requestAnimationFrame = (function () {
        return window.requestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 17);
        };
    }());

    document.addEventListener('keydown', function (evt) {
        if (evt.which >= 37 && evt.which <= 40) {
            evt.preventDefault();
        }
        lastPress = evt.which;
        //console.log(lastPress);
    }, false);

    function Scene() {
        this.id = scenes.length;
        scenes.push(this);
    }

    Scene.prototype = {
        constructor: Scene,
        load: function() {},
        paint: function(ctx) {},
        act: function() {}
    };

    function loadScene(scene) {
        currentScene = scene.id;
        scenes[currentScene].load();
    }

    function Rectangle(x, y, width, height) {
        this.x = (x == undefined) ? 0 : x;
        this.y = (y == undefined) ? 0 : y;
        this.width = (width == undefined) ? 0 : width;
        this.height = (height == undefined) ? this.width : height;
    }

    Rectangle.prototype.intersects = function (rect) {
        if (rect == undefined) {
            window.console.warn('Missing parameters on function intersects');
        } else {
            return (this.x < rect.x + rect.width &&
            this.x + this.width > rect.x &&
            this.y < rect.y + rect.height &&
            this.y + this.height > rect.y);
        }
    };

    Rectangle.prototype.fill = function (ctx) {
        if (ctx == undefined) {
            window.console.warn('Missing parameters on function fill');
        } else {
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    };
        //case img not load
    Rectangle.prototype.drawImage = function (ctx, img) {
        if (img === undefined) {
            window.console.warn('Missing parameters on function drawImage');
        } else {
            if (img.width) {
                ctx.drawImage(img, this.x, this.y);
            } else {
                ctx.strokeRect(this.x, this.y, this.width, this.height);
            }
        }
    };

    // high scores local storage
    function addHighscore(score) {
        posHighscore = 0;
        while (highscores[posHighscore] > score && posHighscore < highscores.length) {
            posHighscore += 1;
        }
        highscores.splice(posHighscore, 0, score);
        if (highscores.length > 10) {
            highscores.length = 10;
        }
        localStorage.highscores = highscores.join(',');
    }

    function canPlayOgg() {
        var aud = new Audio();
        if (aud.canPlayType('audio/ogg').replace(/no/, '')) {
            return true;
        } else {
            return false;
        }
    }

    function random(max) {
        return ~~(Math.random() * max);
    }

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        var w = window.innerWidth / buffer.width;
        var h = window.innerHeight / buffer.height;
        bufferScale = Math.min(h, w);

        bufferOffsetX = (canvas.width - (buffer.width * bufferScale)) /2;
        bufferOffsetY = (canvas.height - (buffer.height * bufferScale)) /2;
    }

    function repaint() {
        window.requestAnimationFrame(repaint);
        if (scenes.length) {
            scenes[currentScene].paint(ctx);
        }
        // paint(bufferCtx);

        // ctx.fillStyle = '#000';
        // ctx.fillRect(0, 0, canvas.width, canvas.height);
        // ctx.imageSmoothingEnabled = false;
        // ctx.drawImage(buffer, bufferOffsetX, bufferOffsetY, buffer.width * bufferScale, buffer.height * bufferScale);
    }

    function run() {
        setTimeout(run, 50);
        //act();
        if (scenes.length) {
            scenes[currentScene].act();
        }
    }

    // init function
    function init() {
        //get canvas & context
        canvas = document.getElementById('canvas');
        ctx = canvas.getContext('2d');
        // canvas.width = 600;
        // canvas.height = 300;

        // Load buffer
        buffer = document.createElement('canvas');
        bufferCtx = buffer.getContext('2d');
        buffer.width = 300;
        buffer.height = 150;

        //create food
        food = new Rectangle(80, 80, 10, 10);

        // load assets
        iBody.src = 'assets/body.png';
        iFood.src = 'assets/fruit.png';
        iEat.src = 'assets/eat.ogg';
        iDead.src = 'assets/dead.ogg';

        // Load saved highscores
        if (localStorage.highscores) {
            highscores = localStorage.highscores.split(',');
        }

        // start game
        // resize();
        run();
        repaint();
    }

    function reset() {
        gameover = false;
        pause = false;
        score = 0;
        dir = 1;
        food.x = random(canvas.width / 10 - 1) * 10;
        food.y = random(canvas.height / 10 - 1) * 10;
        body.length = 0;
        body.push(new Rectangle(40, 40, 10, 10));
        body.push(new Rectangle(0, 0, 10, 10));
        body.push(new Rectangle(0, 0, 10, 10));
    }

    // MAIN SCENE
    mainScene = new Scene();

    mainScene.paint = function(ctx) {
        // clean canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, buffer.width, buffer.height);
        //draw title
        ctx.fillStyle = '#11D0A8';
        ctx.textAlign = 'center';
        ctx.fillText('SNAKE', 150, 60);
        ctx.fillText('Press Enter', 150, 90);
    };

    mainScene.act = function() {
        // Load next scene
        if (lastPress === KEY_ENTER) {
            loadScene(gameScene);
            lastPress = null;
        }    
    };

    // GAME SCENE
    gameScene = new Scene();

    gameScene.load = function() {
        gameover = false;
        pause = false;
        score = 0;
        dir = 1;
        food.x = random(canvas.width / 10 - 1) * 10;
        food.y = random(canvas.height / 10 - 1) * 10;
        body.length = 0;
        body.push(new Rectangle(40, 40, 10, 10));
        body.push(new Rectangle(0, 0, 10, 10));
        body.push(new Rectangle(0, 0, 10, 10));
    };

    gameScene.paint = function(ctx) {
        var i = 0,
            l = 0; 

        // clean canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, buffer.width, buffer.height);

        //draw  player
        ctx.fillStyle = '#0f0';
        for (i = 0, l = body.length; i < l; i += 1) {
            //body[i].fill(ctx);
            body[i].drawImage(ctx, iBody); // player images
        }

        //draw food
        ctx.fillStyle = '#f00';
        // food.fill(ctx);
        food.drawImage(ctx, iFood); // food images

        //draw score
        ctx.fillStyle = '#F306F3';
        ctx.fillText('Score: ' + score, 0, 10);
        ctx.textAlign = 'left';

        // muestro ultima tecla presionada
        ctx.fillStyle = '#fff';
        ctx.fillText('Last press: ' + lastPress, 0, 20);

        // draw pause
        if (pause) {
            ctx.textAlign = 'center';
            if (gameover) {
                ctx.fillStyle = '#FF0000';
                ctx.fillText('GAME OVER.', 150, 75);
            } else {
                ctx.fillText('PAUSE', 150, 75);
            }
            ctx.textAlign = 'left';
        }
    }

    gameScene.act = function() {
        var i = 0,
            l = 0;
        if (!pause) {
            // game over reset
            if (gameover) {
                loadScene(highScene);
            }

            // change direction rectangle
            if (lastPress === KEY_UP && dir !== 2) {
                dir = 0;
            }
            if (lastPress === KEY_RIGHT && dir !== 3) {
                    dir = 1;
            }
            if (lastPress === KEY_DOWN && dir !== 0) {
                    dir = 2;
            }
            if (lastPress === KEY_LEFT && dir !== 1) {
                    dir = 3; 
            }

            // Move Rectangle head
            if (dir === 0) {
                body[0].y -= 10;
            }
            if (dir === 1) {
                body[0].x += 10;
            }      
            if (dir === 2) {
                body[0].y += 10;
            }
            if (dir === 3) {
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
                    iDead.play();
                    gameover = true;
                    pause = true;
                    addHighscore(score);
                }
            }

            // Out Screen
            if (body[0].x > canvas.width - body[0].width) {
                body[0].x = 0;
            }
            if (body[0].y > canvas.height - body[0].height) {
                body[0].y = 0;
            }
            if (body[0].x < 0) {
                body[0].x = canvas.width - body[0].width;
            }
            if (body[0].y < 0) {
                body[0].y = canvas.height - body[0].height;
            }

            // food intersects
            if (body[0].intersects(food)) {
                iEat.play();
                body.push(new Rectangle(food.x, food.y, 10, 10));
                score += 1;
                food.x = random(buffer.width / 10 -1) * 10;
                food.y = random(buffer.height / 10 -1) * 10;
            }
        }
        // unpause / pause
        if (lastPress === KEY_ENTER) {
            pause = !pause;
            lastPress = null;
        }
    }

    // HIGH SCORES SCENE
    highScene = new Scene();

    highScene.paint = function(ctx) {
        var i = 0,
        l = 0;
        // Clean canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Draw title
        ctx.fillStyle = '#00FF8B';
        ctx.textAlign = 'center';
        ctx.fillText('HIGH SCORES', 150, 30);
        // Draw high scores
        ctx.fillStyle = '#00FF8B';
        ctx.textAlign = 'right';
        for (i = 0, l = highscores.length; i < l; i += 1) {
            if (i === posHighscore) {
                ctx.fillText('*' + highscores[i], 180, 40 + i * 10);
            } else {
                ctx.fillText(highscores[i], 180, 40 + i * 10);
            }
        }
    };

    highScene.act = function() {
        // Load next scene
        if (lastPress === KEY_ENTER) {
            loadScene(gameScene);
            lastPress = null;
        }
    };

    // when page load complete
    window.addEventListener('load', init, false);
    //window.addEventListener('resize', resize, false);

}(window));




    