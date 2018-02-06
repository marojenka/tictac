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
  speed : 2,
  c : {
    x : 0,
    y : 0,
  },
  w : {
    x : 0,
    y : 0,
  },
  offset : {
    x : 0,
    y : 0,
  }
};
var pressTimer;
var clicked = false;
var drag = false;
var players = [0, 0];
var originalMousePosition;

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
                update_players(data.players);
            }
            if(last_value != null) {
                update_turn(last_value);
            }
        }
    );
    return false;
}

function update_players(new_players) {
    players = new_players;
    $('#user1').html(players[0]);
    $('#user2').html(players[1]);
}

function update_turn(value) {
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

function set_user(value) {
  $.getJSON($SCRIPT_ROOT + '/_set_user', {value: value},
    function(data) {
      if(data.value == value)
        alert('Role is set');
    }
  );
}

function set_username(value) {
  username = $('#username').val()
  $.getJSON($SCRIPT_ROOT + '/_set_username', {username: username});
}


function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    for (var x = zoom.offset.x % (gridSize * zoom.scale); x < canvas.width; x += (gridSize * zoom.scale)) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
    }
    for (var y = zoom.offset.y % (gridSize * zoom.scale); y < canvas.height; y += (gridSize * zoom.scale)) {
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
    }
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = gridThickness * zoom.scale;
    ctx.stroke();
}

function fillSquare(x, y, color){
    // fill rectangle with player color
    // change to X O if needed
    ctx.fillStyle = color;
    ctx.fillRect(zoom.offset.x + x * gridSize * zoom.scale + gridThickness * zoom.scale / 2,
                 zoom.offset.y + y * gridSize * zoom.scale + gridThickness * zoom.scale / 2,
                 (gridSize - gridThickness) * zoom.scale,
                 (gridSize - gridThickness) * zoom.scale);
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

function canvasOnClick(evt){
    var cellX = Math.floor((evt.offsetX - zoom.offset.x) / (gridSize * zoom.scale));
    var cellY = Math.floor((evt.offsetY - zoom.offset.y) / (gridSize * zoom.scale));
    setMove(cellX, cellY);
}

function fitToContainer(){
  // Make it visually fill the positioned parent
  canvas.style.width  = '100%';
  canvas.style.height = '100%';
  // ...then set the internal size to match
  canvas.width  = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}

function canvasOnMouseMove(evt){
    if(drag) {
        var mousePosition = getMouseOffset(evt);
        var offset = [mousePosition[0] - originalMousePosition[0],
                      mousePosition[1] - originalMousePosition[1]];
        if ( offset[0]**2 + offset[1]**2 > (gridSize * zoom.scale)**2 ) {
            zoom.offset.x += offset[0];
            zoom.offset.y += offset[1];
            originalMousePosition = mousePosition;
            redrawCanvas();
        }
    }
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
        }, 100);
    }
}

function canvasOnMouseUp(evt){
    var mousePosition = getMouseOffset(evt);
    var offset = [mousePosition[0] - originalMousePosition[0],
                  mousePosition[1] - originalMousePosition[1]];
    drag = false;
    clearTimeout(pressTimer);
    if ( ( clicked ) &
         ( offset[0]**2 + offset[1]**2 < 0.5 * (gridSize * zoom.scale)**2 ) )
    {
        clicked = false;
        canvasOnClick(evt);
    }
}

function canvasOnMouseWheel(evt){
    var dx = (evt.offsetX - zoom.c.x) / zoom.scale + zoom.w.x;
    var dy = (evt.offsetY - zoom.c.y) / zoom.scale + zoom.w.y;

    if (evt.deltaY < 0) {
        zoom.scale = Math.min(5, zoom.scale * zoom.speed);
    } else {
        zoom.scale =  Math.max(0.1, zoom.scale / zoom.speed);
    }
    var info = document.getElementById('zoomLevel');
    info.innerHTML = zoom.scale.toFixed(2);

    zoom.c.x = evt.offsetX; // remember old cursor coordinates
    zoom.c.y = evt.offsetY;
    zoom.w.x = dx; // remeber old delta
    zoom.w.y = dy;
    zoom.offset.x = evt.offsetX - dx * zoom.scale;
    zoom.offset.y = evt.offsetY - dy * zoom.scale;

    redrawCanvas();
    return false;
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
$('#set_username').click(function(){set_username()});
$('#bex').click(function(){set_user('0')});
$('#beo').click(function(){set_user('1')});
