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

colors = ['#fdf6e3', '#cb4b16', '#268bd2', '#eee8d5'];
need_redraw = true; 
nx = 30; ny = 30;
move_number = 0;
var canvas, ctx;
var gridColor = '#eee8d5';
var fillColor = 'green';
var gridSize = 50;
var gridThickness = 4;
var offsetX = 0;
var offsetY = 0;

function redraw() {
    // if global variable need_redraw is True
    // then redraw whole layer.
    // Not really efficien eh?
    if( need_redraw ) {
        canvas.drawLayers();
        need_redraw = false;
    }
}

function fill_cell(x, y, value) {
    // fill just one cell
    layer = canvas.getLayer(x+'_'+y);
    if( layer.data.value != value ) {
        layer.data.value = value;
        // layer.fillStyle = colors[value];
        // need_redraw = true;
        canvas.animateLayer(layer, {fillStyle: colors[value]}, 50);
    }
}

function refresh() {
    // reset all layers to 0
    need_redraw = true;
    group = canvas.getLayerGroup('cells')
    for(i=0; i<nx*ny; i++) {
        console.log(i);
        group[i].data.value = 0;
        group[i].fillStyle = colors[0];
    }
    redraw();
    $.getJSON($SCRIPT_ROOT + '/_refresh', {},
      function(data) {
        for(i in data.data) {
          cell = data.data[i];
          fill_cell(cell[0], cell[1], cell[2]);
          console.log(cell);
        }
      }
    );
}

function update() {
    $.getJSON($SCRIPT_ROOT + '/_update', {move_number: move_number},
      function(data) {
        moves = data.moves;
        for(i=0; i<moves.length; i++) {
          fill_cell(moves[i][0], moves[i][1], moves[i][2]);
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
        move_number = 0;
        need_redraw = true;
        group = canvas.getLayerGroup('cells')
        //for( i in group ) {
        for(i=0; i<nx*ny; i++) {
            console.log(i);
            group[i].data.value = 0;
            group[i].fillStyle = colors[0];
        }
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
    var canvasWidth = canvas.width;
    var canvasHeight = canvas.height;
    ctx.beginPath();
    for (var x = offsetX%gridSize; x < canvasWidth; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
    }
    for (var y = offsetY%gridSize; y < canvasHeight; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(canvasWidth, y);
    }
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = gridThickness;
    ctx.stroke();
}

function redrawProgress(){
    // get all moves and redraw it
    // rewrite data, use only 2 sets of moves, dont waste memory on whole field
    
}

function init() {
    // fill initial canvas and shit
    canvas = $('canvas')
    step = 50;
    nx = Math.floor(canvas.width()  / step);
    ny = Math.floor(canvas.height() / step);
    x1 = 0; x2 = step * nx;
    y1 = 0; y2 = step * ny;

    ix = 0; iy = 0;
    x = 0; y = 0;
    icolor = 0;
    for( i=0; i<nx; i++) {
        for( j=0; j<ny; j++) {
            x = x1 + i * step + step / 2;
            y = y1 + j * step + step / 2;

            canvas.drawRect({
                layer: true,
                name: i + '_' + j,
                groups: ['cells'],
                strokeStyle: colors[3],
                strokeWidth: 4,
                fromCenter: true,
                fillstyle: colors[0],
                x: x, y: y,
                width: step, height: step,
                data: { x: i, y: j },
                click: function(layer) {
                    Layer = layer
                    $.getJSON(
                        $SCRIPT_ROOT + '/_move', { x: layer.data.x, y: layer.data.y }, 
                        function(data) {
                            console.log(data);
                            if( data.count != 0 ) {
                            //     alert('cell is filled.')
                            // } else {
                                fill_cell(data.x, data.y, data.value);
                            }
                        });
                },
            });

            // annotate each cell with index
            // debuging?
            // canvas.drawText({
            //     layer: true,
            //     fromCenter: false,
            //     fillStyle: '#9cf',
            //     strokeStyle: '#25a',
            //     strokeWidth: 1,
            //     x: x, y: y,
            //     fontSize: 12,
            //     fontFamily: 'Verdana, sans-serif',
            //     text: i + ' ' + j,
            // });
        }
    }
}

function fillSquare(context, x, y, color){
    // fill rectangle with player color
    // change to X O if needed
    context.fillStyle = color; // change to player color
    context.fillRect(x+gridThickness/2-1, y+gridThickness/2-1, gridSize-gridThickness, gridSize-gridThickness);
}

function fillCell(evt){
    var rect = canvas.getBoundingClientRect();
    var cellX =  1 + (evt.clientX - rect.left) - (evt.clientX - rect.left)%gridSize;
    var cellY = 1 + (evt.clientY - rect.top) - (evt.clientY - rect.top)%gridSize;
    fillSquare(ctx, cellX, cellY, fillColor)
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
    canvas.addEventListener('click', fillCell, false);
    ctx = canvas.getContext("2d");

    resizeCanvas()
}

function redrawCanvas(){
    drawGrid();
    redrawProgress();
}

function resizeCanvas(){
    fitToContainer();
    redrawCanvas();
}

window.onload = function(){
        InitCanvas();
    }
/* If you dont know how to rewrite it, then comment it, right?
function loop() {
    update();
    redraw();
    setTimeout(loop, 1000);
}

$(function tictac(){
    init();
    refresh();
    redraw();
    loop();
});
*/
window.addEventListener("onresize", resizeCanvas, false);

// clear game board by clicling the button
$('#clear').click(clear);
$('#refresh').click(refresh);
$('#bex').click(function(){set_user('0')});
$('#beo').click(function(){set_user('1')});
