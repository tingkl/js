var WINDOW_WIDTH = 1024;
var WINDOW_HEIGHT = 768;
var RADIUS = 8;
var MARGIN_TOP =60;
var MARGIN_LEFT = 30;

const endTime = new Date(2015, 0, 10, 8, 47, 52);
var curShowTimeSeconds = 0;

var balls = [];
var colors = ["#33B5E5","#0099CC","#AA66CC","#9933CC","#99CC00","#669900","#FFBB33","#FF8800","#FF4444","#CC0000"];
window.onload = function () {
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');

    canvas.width = WINDOW_WIDTH;
    canvas.height = WINDOW_HEIGHT;

    curShowTimeSeconds = getCurrentShowTimeSecond();

    setInterval(function() {
        render(context);
        update();
    }, 50);

}

function getCurrentShowTimeSecond () {
    var curTime = new Date();
    var ret = endTime.getTime() - curTime.getTime();
    ret = Math.round(ret / 1000);
    return ret >= 0?ret : 0;
}
function addBalls( x, y, num ) {
    var matrix = digit[num];
    for (var i = 0; i < matrix.length; i++) {
        var row = matrix[i];
        for (var j = 0; j < row.length; j++) {
            if (row[j] === 1) {
                var centerX = x + j * 2 * ( RADIUS + 1 ) + ( RADIUS + 1);
                var centerY = y + i * 2 * ( RADIUS + 1 ) + ( RADIUS + 1 );
                var aBall = {
                    x: centerX,
                    y: centerY,
                    g: 1.5 + Math.random(),
                    vx: Math.pow(-1, Math.ceil(Math.random() * 1000)) * 4,
                    vy: -5,
                    color: colors[Math.floor(Math.random() * colors.length)]
                };
                balls.push(aBall);
            }
        }
    }
}
function update() {
    var nextShowTimeSeconds = getCurrentShowTimeSecond();
    var nextTime = parseTime(nextShowTimeSeconds);
    var nextHours = nextTime.hours;
    var nextMinutes = nextTime.minutes;
    var nextSeconds= nextTime.seconds;

    var curTime = parseTime(curShowTimeSeconds);
    var curHours = curTime.hours;
    var curMinutes = curTime.minutes;
    var curSeconds = curTime.seconds;

    if( nextSeconds != curSeconds ){
        if( parseInt(curHours/10) != parseInt(nextHours/10) ){
            addBalls( MARGIN_LEFT + 0 , MARGIN_TOP , parseInt(curHours/10) );
        }
        if( parseInt(curHours%10) != parseInt(nextHours%10) ){
            addBalls( MARGIN_LEFT + 15*(RADIUS+1) , MARGIN_TOP , parseInt(curHours/10) );
        }
        if( parseInt(curMinutes/10) != parseInt(nextMinutes/10) ){
            addBalls( MARGIN_LEFT + 39*(RADIUS+1) , MARGIN_TOP , parseInt(curMinutes/10) );
        }
        if( parseInt(curMinutes%10) != parseInt(nextMinutes%10) ){
            addBalls( MARGIN_LEFT + 54*(RADIUS+1) , MARGIN_TOP , parseInt(curMinutes%10) );
        }
        if( parseInt(curSeconds/10) != parseInt(nextSeconds/10) ){
            addBalls( MARGIN_LEFT + 78*(RADIUS+1) , MARGIN_TOP , parseInt(curSeconds/10) );
        }
        if( parseInt(curSeconds%10) != parseInt(nextSeconds%10) ){
            addBalls( MARGIN_LEFT + 93*(RADIUS+1) , MARGIN_TOP , parseInt(nextSeconds%10) );
        }
        curShowTimeSeconds = nextShowTimeSeconds;

    }
    updateBalls();
}
function updateBalls() {
    for (var i = 0; i < balls.length; i++) {
        balls[i].x += balls[i].vx;
        balls[i].y += balls[i].vy;
        balls[i].vy += balls[i].g;

        if (balls[i].y >= WINDOW_HEIGHT - RADIUS) {
            balls[i].y = WINDOW_HEIGHT - RADIUS;
            balls[i].vy = - balls[i].vy * 0.75;
        }
    }

    var cnt = 0;
    for (var i = 0; i < balls.length; i++) {
        if (balls[i].x + RADIUS > 0 && balls[i].x - RADIUS < WINDOW_WIDTH) {
            balls[cnt++] = balls[i];
        }
    }

    while(balls.length > cnt) {
        balls.pop();
    }
}
function parseTime(curShowTimeSeconds) {
    var hours = parseInt(curShowTimeSeconds / 3600);
    var minutes = parseInt((curShowTimeSeconds - hours * 3600) / 60);
    var seconds = curShowTimeSeconds % 60;
    return {
        hours: hours,
        minutes: minutes,
        seconds: seconds
    };
}

function render (cxt) {

    cxt.clearRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
    var time = parseTime(curShowTimeSeconds);
    var hours = time.hours;
    var minutes = time.minutes;
    var seconds = time.seconds;

    renderDigit(MARGIN_LEFT, MARGIN_TOP, parseInt(hours / 10), cxt);
    renderDigit(MARGIN_LEFT + 15 * (RADIUS + 1), MARGIN_TOP, parseInt(hours % 10), cxt);
    renderDigit(MARGIN_LEFT + 30 * (RADIUS + 1), MARGIN_TOP, 10, cxt);

    renderDigit(MARGIN_LEFT + 39 * (RADIUS + 1), MARGIN_TOP, parseInt(minutes / 10), cxt);
    renderDigit(MARGIN_LEFT + 54 * (RADIUS + 1), MARGIN_TOP, parseInt(minutes % 10), cxt);
    renderDigit(MARGIN_LEFT + 69 * (RADIUS + 1), MARGIN_TOP, 10, cxt);

    renderDigit(MARGIN_LEFT + 78 * (RADIUS + 1), MARGIN_TOP, parseInt(seconds / 10), cxt);
    renderDigit(MARGIN_LEFT + 93 * (RADIUS + 1), MARGIN_TOP, parseInt(seconds % 10), cxt);

    for( var i = 0 ; i < balls.length ; i ++ ){
        cxt.fillStyle=balls[i].color;

        cxt.beginPath();
        cxt.arc( balls[i].x , balls[i].y , RADIUS , 0 , 2*Math.PI , true );
        cxt.closePath();

        cxt.fill();
    }
}

function renderDigit ( x, y, num, cxt) {
    cxt.fillStyle = 'rgb(0, 102, 153)';

    var matrix = digit[num];
    for (var i = 0; i < matrix.length; i++) {
        var row = matrix[i];
        for (var j = 0; j < row.length; j++) {
            if (row[j] === 1) {
                var centerX = x + j * 2 * ( RADIUS + 1 ) + ( RADIUS + 1);
                var centerY = y + i * 2 * ( RADIUS + 1 ) + ( RADIUS + 1 );
                cxt.beginPath();
                cxt.arc(centerX, centerY, RADIUS, 0, 2 * Math.PI);
                cxt.closePath();
                cxt.fill();
            }
        }
    }
}