colors = ['#7a7', '#c33', '#33c', '#fff']

function fill_cell(x, y, value) {
    layer = canvas.getLayer(x+'_'+y);
    console.log(value);
    console.log(colors[value]);
    layer.fillStyle = colors[value];
    canvas.drawLayers();
}
function refresh() {
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
function ping() {
// ping the server
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
        console.log('cleared')
    );
}

$(function tictac(){
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
                            if( data.count == 0 ) {
                                alert('cell is filled.')
                            } else {
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
   //  for( i=0; i<nx*ny; i++ ) {
   //      if( x > x2 - step ) {
   //          x = 0; ix = 0;
   //          iy++;
   //      }
   //      if( y >= y2 ) {
   //          y = 0; iy = 0;
   //      }
   //      x = x1 + ix * step + step / 2;
   //      y = y1 + iy * step + step / 2;
   //      ix++;
   //  }

    // $('canvas').drawPolygon({
    //       layer: true,
    //       fillStyle: '#fff',
    //       strokeStyle: '#333',
    //       strokeWidth: 2,
    //       x: 160, y: 150,
    //       radius: 100,
    //       sides: 3,
    // });
    //
    //
    // while(x1 <= x2) {
    //     $('canvas').drawLine({
    //         strokeStyle: '#aaa',
    //         strokeWidth: width,
    //         x1: x1, y1: 0,
    //         x2: x1, y2: y2
    //     });
    //     x1 = x1 + step;
    // }
    // while(y1 < y2) {
    //     $('canvas').drawLine({
    //         strokeStyle: '#aaa',
    //         strokeWidth: width,
    //         x1: 0,  y1: y1, 
    //         x2: x2, y2: y1
    //     });
    //     y1 = y1 + step;
    // };
    // canvas.click(function() {
    //     alert('')
    // });


});


// clear game board by clicling the button
$('#clear').click();
