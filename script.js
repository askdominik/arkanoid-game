//select canvas
const cvs = document.getElementById("Arkanoid");
const ctx = cvs.getContext("2d");

//styling the canvas
cvs.style.border = "1px solid #0ff";
ctx.lineWidth = 3;

//create the paddle
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 20;
const PADDLE_MARGIN_BOTTOM = 50; //pixels from bottom to paddle

const MAX_LEVEL = 3;
let LEVEL = 1;

const paddle = {
    x : cvs.width/2 - PADDLE_WIDTH/2,
    y : cvs.height - PADDLE_HEIGHT - PADDLE_MARGIN_BOTTOM,
    width : PADDLE_WIDTH,
    height : PADDLE_HEIGHT,
    dx : 5 //amount of pixels paddle will move to the right or to the left
}

//draw the paddle
function drawPaddle(){
    ctx.fillStyle = "#2e3548";
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

    ctx.strokeStyle = "#ffcd05";
    ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

//move the paddle
let leftArrow = false;
let rightArrow = false;
document.addEventListener("keydown", function(event){
    if(event.keyCode == 37){
        leftArrow = true;
    } else if(event.keyCode == 39){
        rightArrow = true;
    }
});

document.addEventListener("keyup", function(event){
    if(event.keyCode == 37){
        leftArrow = false;
    } else if(event.keyCode == 39){
        rightArrow = false;
    }
});

function movePaddle(){
    if(rightArrow && paddle.x + paddle.width < cvs.width){
        paddle.x += paddle.dx;
    }else if(leftArrow && paddle.x > 0){
        paddle.x -= paddle.dx;
    }
}

//create the ball
const BALL_RADIUS = 8;
const ball = {
    x : cvs.width/2,
    y : paddle.y - BALL_RADIUS,
    radius : BALL_RADIUS,
    speed : 3,
    dx : 3 * (Math.random() * 2 - 1),
    dy : -3
}

//draw a ball
function drawBall(){
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
    ctx.fillStyle = "#ffcd05";
    ctx.fill();
    ctx.strokeStyle = "#2e3548";
    ctx.stroke();

    ctx.closePath();
}

//move the ball
function moveBall(){
    ball.x += ball.dx;
    ball.y += ball.dy;
}

//ball wall collision
let LIFE = 3;

function ballWallCollision(){
    if(ball.x + ball.radius > cvs.width || ball.x - ball.radius < 0){
        ball.dx = -ball.dx;
        WALL.play();
    }
    if(ball.y - ball.radius < 0){
        ball.dy = -ball.dy;
        WALL.play();
    }
    if(ball.y + ball.radius > cvs.height){
        LIFE--;
        LIFE_LOST.play();
        resetBall();
    }
}

//reset ball
function resetBall(){
    ball.x = cvs.width/2;;
    ball.y = paddle.y - BALL_RADIUS;
    ball.dx = 3 * (Math.random() * 2 - 1);
    ball.dy = -3;
}

//ball paddle collision
function ballPaddleCollision(){
    if(ball.x < paddle.x + paddle.width && ball.x > paddle.x && paddle.y < paddle.y + paddle.height && ball.y > paddle.y){

        PADDLE_HIT.play();
        
        //check where the ball hit the paddle
        let collidePoint = ball.x - (paddle.x + paddle.width / 2);

        //normalize the values
        collidePoint = collidePoint / (paddle.width / 2);

        //calculate the angle of the ball
        let angle = collidePoint * Math.PI / 3;

        ball.dx = ball.speed * Math.sin(angle);
        ball.dy = - ball.speed * Math.cos(angle);
    }
}

//create the brick
const brick = {
    row : 1,
    column : 5,
    width : 55,
    height : 20,
    offSetLeft : 20,
    offSetTop : 20,
    marginTop : 40,
    fillColor : "#2e3548",
    strokeColor: "#FFF"
}

let bricks = [];

//create the bricks
function createBricks(){
    for(let i = 0; i < brick.row; i++) {
        bricks[i] = [];
        for(let j = 0; j < brick.column; j++){
            bricks[i][j] = {
                x : j * (brick.width + brick.offSetLeft) + brick.offSetLeft,
                y : i * (brick.width + brick.offSetTop) + brick.offSetTop + brick.marginTop,
                status : true
            };
        }
    }
}

createBricks();

//draw the bricks
function drawBricks(){
    for(let i = 0; i < brick.row; i++) {
        for(let j = 0; j < brick.column; j++){
            if(bricks[i][j].status){
                ctx.fillStyle = brick.fillColor;
                ctx.fillRect(bricks[i][j].x, bricks[i][j].y, brick.width, brick.height);
                
                ctx.strokeStyle = brick.strokeColor;
                ctx.strokeRect(bricks[i][j].x, bricks[i][j].y, brick.width, brick.height);
            }
        }
    }
}

//ball brick collision
let SCORE = 0;
const SCORE_UNIT = 10;

function ballBrickCollision(){
    for(let i = 0; i < brick.row; i++){
        for(let j = 0; j < brick.column; j++){
            let b = bricks[i][j];
            if(b.status){
                if(ball.x + ball.radius > b.x && ball.x - ball.radius < b.x + brick.width && ball.y + ball.radius > b.y && ball.y - ball.radius < b.y + brick.height){
                    BRICK_HIT.play();
                    b.status = false; // the brick is broken
                    ball.dy = - ball.dy;
                    SCORE += SCORE_UNIT;
                }
            }
        }
    }
}

//show the game stats
function showGameStats(text, textX, textY, img, imgX, imgY){
    ctx.fillStyle = "#FFF";
    ctx.font = "25px Germania One";
    ctx.fillText(text, textX, textY);
    ctx.drawImage(img, imgX, imgY, 25, 25);
}

//game over
let GAME_OVER = false;
function gameOver(){
    if(LIFE <= 0){
        showYouLose()
        GAME_OVER = true;
    }
}

//level up
function levelUp(){
    let isLevelDone = true;

    for(let i = 0; i < brick.row; i++){
        for(let j = 0; j < brick.column; j++){
            isLevelDone = isLevelDone && ! bricks[i][j].status;
        }
    }
    
    if(isLevelDone){
        WIN.play();

        if(LEVEL >= MAX_LEVEL){
            showYouWin();
            GAME_OVER = true;
            return;
        }

        brick.row++;
        createBricks();
        ball.speed += 0.5;
        resetBall();
        LEVEL++;
    }
}

function draw(){
    drawPaddle();
    drawBall();
    drawBricks();
    showGameStats(SCORE, 35, 25, SCORE_IMG, 5, 5);
    showGameStats(LIFE, cvs.width - 25, 25, LIFE_IMG, cvs.width - 55, 5);
    showGameStats(LEVEL, cvs.width/2, 25, LEVEL_IMG, cvs.width/2 - 30, 5);
}

function update(){
    movePaddle();
    moveBall();
    ballWallCollision();
    ballPaddleCollision();
    ballBrickCollision();
    gameOver();
    levelUp();
}

function loop(){
    //clear the canvas
    ctx.drawImage(BG_IMG, 0, 0);
    draw();
    update();

    if(!GAME_OVER){
        requestAnimationFrame(loop);
    }
}

loop();

//select sound element
const soundElement = document.getElementById("sound");

soundElement.addEventListener("click", audioManager);

function audioManager(){
    //change image sound on/off
    let imgSrc = soundElement.getAttribute("src");
    let SOUND_IMG = imgSrc == "img/SOUND_ON.png" ? "img/SOUND_OFF.png" : "img/SOUND_ON.png";

    soundElement.setAttribute("src", SOUND_IMG);

    //mute and unmute sounds
    WALL.muted = WALL.muted ? false : true;
    PADDLE_HIT.muted = PADDLE_HIT.muted ? false : true;
    BRICK_HIT.muted = BRICK_HIT.muted ? false : true;
    WIN.muted = WIN.muted ? false : true;
    LIFE_LOST.muted = LIFE_LOST.muted ? false : true;
}

//show game over message
//select elements
const gameover = document.getElementById("gameover");
const youwin = document.getElementById("youwin");
const youlose = document.getElementById("youlose");
const restart = document.getElementById("restart");

//click on play again button
restart.addEventListener("click", function(){
    location.reload(); //reload the page
})

//show you win
function showYouWin(){
    gameover.style.display = "block";
    youwon.style.display = "block";
}

//show you lose
function showYouLose(){
    gameover.style.display = "block";
    youlose.style.display = "block";
}


