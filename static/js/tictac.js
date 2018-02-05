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
var offsetX = 0;
var offsetY = 0;


function update(mn = moveNumber) {
    $.getJSON($SCRIPT_ROOT + '/_update', {move_number: mn},
        function(data) {
            moves = data.moves;
            //console.log(data);
            moveNumber = data.move_number;
            for(i=0; i < moves.length; i++) {
                fillSquare(moves[i][0], moves[i][1], colors[moves[i][2]]);
            }
        }
    );
    return false;
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

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    for (var x = offsetX%gridSize; x < canvas.width; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
    }
    for (var y = offsetY%gridSize; y < canvas.height; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
    }
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = gridThickness;
    ctx.stroke();
}

function fillSquare(x, y, color){
    // fill rectangle with player color
    // change to X O if needed
    ctx.fillStyle = color;
    ctx.fillRect(x*gridSize + gridThickness/2, y*gridSize + gridThickness/2, gridSize-gridThickness, gridSize-gridThickness);
}

function setMove(x, y){
    $.getJSON(
        $SCRIPT_ROOT + '/_move', { x: x, y: y }, 
        function(data) {
            console.log(data);
            if( data.count != 0 ) {
            //     alert('cell is filled.')
            // } else {
                update();
            }
        });
}

function canvasOnClick(evt){
    var rect = canvas.getBoundingClientRect();
    var cellX = Math.floor((evt.clientX - rect.left)/gridSize);
    var cellY = Math.floor((evt.clientY - rect.top)/gridSize);
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

function InitCanvas(){
    canvas = document.getElementById('gamefield');
    canvas.addEventListener('click', canvasOnClick, false);
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

window.onload = function(){
        InitCanvas();
    }

function loop() {
    update();
    setTimeout(loop, 1000);
}

window.addEventListener("onresize", resizeCanvas, false);

// clear game board by clicling the button
$('#clear').click(clear);
$('#refresh').click(function(){update(0)});
$('#bex').click(function(){set_user('0')});
$('#beo').click(function(){set_user('1')});
