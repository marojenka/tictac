console.log('alive');
$(function(){
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
    colors = ['#c33', '#33c']
    icolor = 0;
    for( i=0; i<nx*ny; i++ ) {
        if( x > x2 - step ) {
            x = 0; ix = 0;
            iy++;
        }
        if( y >= y2 ) {
            y = 0; iy = 0;
        }
        x = x1 + ix * step + step / 2;
        y = y1 + iy * step + step / 2;
        ix++;
        canvas.drawRect({
            layer: true,
            strokeStyle: '#c33',
            strokeWidth: 4,
            fromCenter: true,
            fillstyle: '#7a7',
            x: x, y: y,
            width: step, height: step,
            click: function(layer) {
                $(this).animateLayer(
                    layer, { fillStyle: colors[icolor] }, 500
                );
                if( icolor == 0 ) {
                    icolor = 1;
                } else {
                    icolor = 0;
                }
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
            // text: ix.toString() + ' ' + iy.toString() + ' ' + i,
  text: i,
        });
    }

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
