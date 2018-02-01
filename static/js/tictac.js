colors = ['#7a7', '#c33', '#33c', '#fff'];
need_redraw = true; 
nx = 30; ny = 30;
move_number = 0;

function redraw() {
    if( need_redraw ) {
        canvas.drawLayers();
        need_redraw = false;
    }
}

function fill_cell(x, y, value) {
    layer = canvas.getLayer(x+'_'+y);
    if( layer.data.value != value ) {
        layer.data.value = value;
        layer.fillStyle = colors[value];
        need_redraw = true;
    }
}

function refresh() {
    need_redraw = true;
    group = canvas.getLayerGroup('cells')
    //for( i in group ) {
    for(i=0; i<nx*ny; i++) {
        console.log(i);
        group[i].data.value = 0;
        group[i].fillStyle = colors[0];
    }
    $.getJSON($SCRIPT_ROOT + '/_refresh', {},
      function(data) {
        for(i in data.data) {
          cell = data.data[i];
          fill_cell(cell[0], cell[1], cell[2]);
          console.log(cell);
        }
      }
    );
    redraw();
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

function init() {
    // fill initial canvas and shit
    canvas = $('canvas')
    step = 100;
    nx = Math.floor(canvas.width()  / step);
    ny = Math.floor(canvas.height() / step);
    x1 = 0; x2 = step * nx;
    y1 = 0; y2 = step * ny;

    ix = 0; iy = 0;
    x = 0; y = 0;
    console.log(nx);
    console.log(ny);
    icolor = 0;
    for( i=0; i<nx; i++) {
        for( j=0; j<ny; j++) {
            x = x1 + i * step + step / 2;
            y = y1 + j * step + step / 2;

            canvas.drawRect({
                layer: true,
                name: i + '_' + j,
                groups: ['cells'],
                strokeStyle: '#c33',
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

            canvas.drawText({
                layer: true,
                fromCenter: false,
                fillStyle: '#9cf',
                strokeStyle: '#25a',
                strokeWidth: 1,
                x: x, y: y,
                fontSize: 12,
                fontFamily: 'Verdana, sans-serif',
                text: i + ' ' + j,
            });
        }
    }
}

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


// clear game board by clicling the button
$('#clear').click(clear);
$('#refresh').click(refresh);
$('#bex').click(function(){set_user('0')});
$('#beo').click(function(){set_user('1')});
