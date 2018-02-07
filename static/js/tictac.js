// base03    #002b36
// base02    #073642
// base01    #586e75
// base00    #657b83
// base0     #839496
// base1     #93a1a1
// base2     #eee8d5
// base3     #fdf6e3
// yellow    #b58900
// orange    #cb4b16
// red       #dc322f
// magenta   #d33682
// violet    #6c71c4
// blue      #268bd2
// cyan      #2aa198
// green     #859900

var colors = ['#fdf6e3', '#cb4b16', '#268bd2', '#eee8d5'];
var moveNumber = 0;
var canvas, ctx;
var gridColor = '#eee8d5';
var gridSize = 50;
var gridThickness = 4;
var zoom = {
    scale : 1,
    speed : 1.1,
    c : {
        x : 0,
        y : 0,
    },
    w : {
        x : 0,
        y : 0,
    }
};
var pressTimer;
var clicked = false;
var drag = false;
var players = [0, 0];
var originalMousePosition;

var scale = {
    length : function(number) {
        return (number * zoom.scale);
    },
    x : function(number) {
        return ((number - zoom.w.x) * zoom.scale + zoom.c.x);
    },
    y : function(number) {
        return ((number - zoom.w.y) * zoom.scale + zoom.c.y);
    },
    x_INV : function(number) {
        return ((number - zoom.c.x) / zoom.scale + zoom.w.x);
    },
    y_INV : function(number) {
        return ((number - zoom.c.y) / zoom.scale + zoom.w.y);
    }
};

function getMouseOffset(event) {
    var offset  = [event.offsetX || event.pageX - $(event.target).offset().left,
                   event.offsetY || event.pageY - $(event.target).offset().top];
    return offset;
}

function update(mn = moveNumber) {
    $.getJSON($SCRIPT_ROOT + '/_update', {move_number: mn},
        function(data) {
            moves = data.moves;
            moveNumber = data.move_number;
            last_value = null;
            for(i=0; i < moves.length; i++) {
                fillSquare(moves[i][0], moves[i][1], colors[moves[i][2]]);
                last_value = moves[i][2];
            }
            if(data.players[0] != players[0] ||
               data.players[1] != players[1])
            {
                console.log(players);
                updatePlayers(data.players);
            }
            if(last_value != null) {
                updateTurn(last_value);
            }
        }
    );
    return false;
}

function updatePlayers(newPlayers) {
    players = newPlayers;
    $('#user1').html(players[0]);
    $('#user2').html(players[1]);
}

function updateTurn(value) {
    other = value == 1 ? 2 : 1;
    $('#user'+value).css('background-color', colors[0]);
    $('#user'+other).css('background-color', colors[other]);
}

function ping() {
    $('#foo').bind('click', function() {
        $.getJSON($SCRIPT_ROOT + '/ping', {},
            function(data) {
                $("#result").text(data.answer);
            }
        );
    return false;
    });
}

function clear() {
    $.getJSON($SCRIPT_ROOT + '/_clear', {},
        function(date) {
            moveNumber = 0;
            drawGrid();
        }
    );
}

function setUser(value) {
    $.getJSON($SCRIPT_ROOT + '/_set_user', {value: value},
        function(data) {
            if(data.value == value)
                alert('Role is set');
        }
    );
}

function setUsername(value) {
    username = $('#username').val()
    $.getJSON($SCRIPT_ROOT + '/_set_username', {username: username});
}

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    for (var x = scale.x(0) % scale.length(gridSize) ; x < canvas.width; x += scale.length(gridSize)) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
    }
    for (var y = scale.y(0) % scale.length(gridSize); y < canvas.height; y += scale.length(gridSize)) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
    }
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = scale.length(gridThickness);
    ctx.stroke();
}

function fillSquare(x, y, color){
    // fill rectangle with player color
    // change to X O if needed
    ctx.fillStyle = color;
    ctx.fillRect(scale.x(x * gridSize) + scale.length(gridThickness / 2),
                 scale.y(y * gridSize) + scale.length(gridThickness / 2),
                 scale.length(gridSize - gridThickness),
                 scale.length(gridSize - gridThickness));
}

function setMove(x, y){
    $.getJSON(
        $SCRIPT_ROOT + '/_move', { x: x, y: y },
        function(data) {
            if( data.count != 0 ) {
                update();
            }
        }
    );
}

function fitToContainer(){
    canvas.style.width  = '100%';
    canvas.style.height = '100%';
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

function canvasOnClick(evt){
    var mousePosition = getMouseOffset(evt);
    var cellX = Math.floor(scale.x_INV(mousePosition[0]) / gridSize);
    var cellY = Math.floor(scale.y_INV(mousePosition[1]) / gridSize);
    setMove(cellX, cellY);
}

function canvasOnMouseMove(evt){
    if(drag) {
        var mousePosition = getMouseOffset(evt);
        var offset = [mousePosition[0] - originalMousePosition[0],
                      mousePosition[1] - originalMousePosition[1]];
        if ( offset[0]**2 + offset[1]**2 > scale.length(gridSize)**2 ) {
            zoom.c.x += offset[0];
            zoom.c.y += offset[1];
            originalMousePosition = mousePosition;
            redrawCanvas();
        }
    }
    evt.preventDefault();
    return false;
}

function canvasOnMouseDown(evt){
    if ( clicked ) {
        clicked = false;
        drag = false;
    } else if ( drag ) {
        drag = false;
    } else {
        clicked = true;
        originalMousePosition = getMouseOffset(evt);
        pressTimer = setTimeout(function() {
            clicked = false;
            drag = true;
            evt.target.style.cursor = "move";
        }, 300);
    }
    evt.preventDefault();
    return false;
}

function canvasOnMouseUp(evt){
    var mousePosition = getMouseOffset(evt);
    var offset = [mousePosition[0] - originalMousePosition[0],
                  mousePosition[1] - originalMousePosition[1]];
    drag = false;
    evt.target.style.cursor = "auto";
    clearTimeout(pressTimer);
    if ( ( clicked ) &
         ( offset[0]**2 + offset[1]**2 < 0.5 * scale.length(gridSize)**2 ) )
    {
        clicked = false;
        canvasOnClick(evt);
    }
    evt.preventDefault();
    return false;
}

function canvasOnMouseWheel(evt){
    var mousePosition = getMouseOffset(evt);
    var dx = scale.x_INV(mousePosition[0]);
    var dy = scale.y_INV(mousePosition[1]);

    if (evt.deltaY < 0) {
        zoom.scale = Math.min(5, zoom.scale * zoom.speed);
    } else {
        zoom.scale =  Math.max(0.1, zoom.scale / zoom.speed);
    }
    document.getElementById('zoomLevel').innerHTML = zoom.scale.toFixed(2);

    zoom.c.x = mousePosition[0];
    zoom.c.y = mousePosition[1];
    zoom.w.x = dx;
    zoom.w.y = dy;

    redrawCanvas();
    evt.preventDefault();
    return false;
}

function resetScale(){
    zoom.c.x = 0;
    zoom.c.y = 0;
    zoom.w.x = 0;
    zoom.w.y = 0;
    zoom.scale = 1;
    document.getElementById('zoomLevel').innerHTML = 1;
    redrawCanvas();
}

function InitCanvas(){
    canvas = document.getElementById('gamefield');
    canvas.addEventListener('mousemove', canvasOnMouseMove, false);
    canvas.addEventListener('mousedown', canvasOnMouseDown,false);
    canvas.addEventListener('mouseup', canvasOnMouseUp, false);
    canvas.addEventListener("wheel", canvasOnMouseWheel, false);

    ctx = canvas.getContext("2d");

    resizeCanvas();
    loop();
}

function redrawCanvas(){
    drawGrid();
    update(0);
}

function resizeCanvas(){
    fitToContainer();
    redrawCanvas();
}

function loop() {
    update();
    setTimeout(loop, 1000);
}

window.addEventListener("onresize", resizeCanvas, false);

$(function tictac() {
    InitCanvas();
});

// clear game board by clicling the button
$('#clear').click(clear);
$('#refresh').click(function(){update(0)});
$('#setUsername').click(function(){setUsername()});
$('#bex').click(function(){setUser('0')});
$('#beo').click(function(){setUser('1')});
$('#resetScale').click(resetScale);
