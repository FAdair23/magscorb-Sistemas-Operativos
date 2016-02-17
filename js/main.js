var programs = new Array();
var counter = 0;
var appendError = function( node , error_message ) {
    var miPadre      = node.parentNode;
    var errorSpan    = document.createElement( 'span' );
    var errorMessage = document.createTextNode( error_message );
    errorSpan.appendChild( errorMessage );
    miPadre.appendChild( errorSpan );
}
var removeError = function( node ) {
    node.removeAttribute( 'class' );
    var miPadre      = node.parentNode;
    var errorSpan    = node.nextElementSibling;
    miPadre.removeChild( errorSpan );
}
var restart = function() {
    var i;
    var inputs = new Array();
    inputs[0]  = document.getElementById( 'name' );
    inputs[1]  = document.getElementById( 'num1' );
    inputs[2]  = document.getElementById( 'op' );
    inputs[3]  = document.getElementById( 'num2' );
    inputs[4]  = document.getElementById( 'max-time' );
    inputs[5]  = document.getElementById( 'id-program' );
    for( i = 0 ; i < 6 ; i ++ ) {
        inputs[i].value = '';
    }
    inputs[2].value = 'none';
}
var guardar = function() {
    var current_prog = validate();
    var counter_span = document.getElementById('counter');
    if( current_prog ) {
        if( opValidate( current_prog ) ) {
        	if( idValidation( current_prog.id_program ) ) {
        		programs[counter] = current_prog;
	            counter ++;
	            swal("Muy bien " + current_prog.name , "Tu programa ha sido guardado" , "success");
	            counter_span.innerText = counter;
	            restart();
        	}
        	else {
        		var image_url = getImageUrl();
        		swal({
                	title: 'Id inválido',
                    text: 'El número de programa que intentas ingresar, ya ha sido registrado',
                    imageUrl: image_url
                });
        	}
        }
    }
}
var validate = function() {
    var current_prog  = false;
    var error_message = '';
    var inputs        = new Array();
    inputs[0]         = document.getElementById( 'name' );
    inputs[1]         = document.getElementById( 'num1' );
    inputs[2]         = document.getElementById( 'op' );
    inputs[3]         = document.getElementById( 'num2' );
    inputs[4]         = document.getElementById( 'max-time' );
    inputs[5]         = document.getElementById( 'id-program' );
    var errors        = 0;

    for (var i = 0; i < 6; i++) {
        if( inputs[i].value.trim() === '' ) {
            if( inputs[i].getAttribute( 'class' ) !== 'error' ) {
                inputs[i].setAttribute( 'class' , 'error' );
                error_message = 'Campo requerido';
                appendError( inputs[i] , error_message );
            }
            errors ++;
        }
        else if ( i === 2 || i === 4 ||  i === 5  ) {
            switch(i) {
                case 2: if( inputs[i].value === 'none' ) {
                            if( inputs[i].getAttribute( 'class' ) === 'error' ) {
                                removeError( inputs[i] );
                            }
                            inputs[i].setAttribute( 'class' , 'error' );
                            error_message = 'Selecciona operación!';
                            appendError( inputs[i] , error_message );
                            errors ++;
                        }
                        else if( inputs[i].getAttribute( 'class' ) === 'error' ) {
                            removeError( inputs[i] );
                        }
                break;
                case 4: if( inputs[i].value < 1 ) {
                            if( inputs[i].getAttribute( 'class' ) === 'error' ) {
                                removeError( inputs[i] );
                            }
                            inputs[i].setAttribute( 'class' , 'error' );
                            error_message = 'El número debe ser positivo!';
                            appendError( inputs[i] , error_message );
                            errors ++;
                        }
                        else if( inputs[i].getAttribute( 'class' ) === 'error' ) {
                            removeError( inputs[i] );
                        }
                break;
                case 5: if( inputs[i].value < 1 ) {
                            if( inputs[i].getAttribute( 'class' ) === 'error' ) {
                                removeError( inputs[i] );
                            }
                            inputs[i].setAttribute( 'class' , 'error' );
                            error_message = 'El número debe ser positivo!';
                            appendError( inputs[i] , error_message );
                            errors ++;
                        }
                        else if( inputs[i].getAttribute( 'class' ) === 'error' ) {
                            removeError( inputs[i] );
                        }
                break;
            }
        }
        else if( inputs[i].getAttribute( 'class' ) === 'error' ) {
            removeError( inputs[i] );
        }
    }

    if( errors === 0 ) {
        current_prog = new Object();

        current_prog.name       = inputs[0].value;
        current_prog.num1       = inputs[1].value;
        current_prog.op         = inputs[2].value;
        current_prog.num2       = inputs[3].value;
        current_prog.max_time   = inputs[4].value;
        current_prog.id_program = inputs[5].value;

        if( current_prog.op === 'none' ) {
            if( inputs[2].getAttribute( 'class' ) === 'error' ) {
                removeError( inputs[2] );
            }
            error_message = 'Selecciona operación!';
            inputs[2].setAttribute( 'class' , 'error' );
            appendError( inputs[2] , error_message );
            errors ++;
        }
        if( current_prog.max_time < 1 ) {
            if( inputs[4].getAttribute( 'class' ) === 'error' ) {
                removeError( inputs[4] );
            }
            error_message = 'El número debe ser positivo!';
            inputs[4].setAttribute( 'class' , 'error' );
            appendError( inputs[4] , error_message );
            errors ++;
        }
        if( current_prog.id_program < 1 ) {
            if( inputs[5].getAttribute( 'class' ) === 'error' ) {
                removeError( inputs[5] );
            }
            error_message = 'El número debe ser positivo!';
            inputs[5].setAttribute( 'class' , 'error' );
            appendError( inputs[5] , error_message );
            errors ++;
        }
    }
	return current_prog;
}
var getImageUrl = function() {
	var rand = Math.round((Math.random() * 100)) % 2;
    var image_url = "images/error.png";
    if ( rand ) {
        image_url = "images/no.png";
    }
    return image_url;
}
var opValidate = function( program ) {
    var valid = true;
    var image_url = getImageUrl();
    switch( program.op ) {
        case 'division':
            if( program.num2 == 0 ) {
                swal({
                	title: 'Operación inválida',
                    text: 'No puedes hacer una división entre cero',
                    imageUrl: image_url
                });
                valid = false;
            }
        break;
        case 'module':
            if( program.num2 == 0 ) {
                swal({
                	title: 'Operación inválida',
                    text: 'No puedes obtener un módulo entre cero',
                    imageUrl: image_url
                });
                valid = false;
            }
        break;
        case 'root':
            if( (isEven(program.num1) && program.num2 < 0) || (program.num1 == 0 && program.num2 == 0)) {
                swal({
                    title: 'Operación inválida',
                    text: 'No puedes obtener la raíz par de un número negativo, ni la raíz cero de cero',
                    imageUrl: image_url
                });
                valid = false;
            }
        break;
    }
    return valid;
}
function isEven( n ) {
    n = Number( n );
    return n === 0 || !!( n && !(n%2) );
}
function root( x , n ) {
    var root;
    //Está validado que no se puedan obtener raíces pares de números negativos
    x = Math.abs(x);
    if( n > 0 ) {
        n    = 1/n;
        root = Math.pow( x , n );
    }
    else if( n == 0 ) {
        //Ya validé que no puedan ser n=0 y x=0
        root = 1;
    }
    else {
        n    = 1/Math.abs( n );
        root = 1/Math.pow( x , n );
    }
    return root;
}
var idValidation = function( id ) {
    var valid = true;
    for (var i = programs.length - 1; i >= 0; i--) {
        if( programs[i].id_program == id ) {
            valid = false;
            break;
        }
    }
    return valid;
}
var bashGenerate = function( ini , end ) {
    var i;
    var span_id;
    var span_mte;
    var content;
    var total_time = 0;
    var bashes_section = document.getElementById( 'bashes' );
    var bashes_div     = document.createElement( "div" );
    bashes_div.setAttribute( 'id' , 'current-bash' );
    bashes_section.appendChild( bashes_div );
    for( i = ini; i < end; i ++ ) {
        span_id   = document.createElement( "span" );
        span_mte  = document.createElement( "span" );
        content = document.createTextNode( programs[i].id_program );
        span_id.appendChild( content );
        span_id.setAttribute( 'class' , 'left' );
        content = document.createTextNode( programs[i].max_time );
        total_time += parseInt( programs[i].max_time ) + 1;
        span_mte.appendChild( content );
        span_mte.setAttribute( 'class' , 'right' );
        bashes_div.appendChild( span_id );
        bashes_div.appendChild( span_mte );
    }
    return total_time;
}
var bashRemove = function() {
    var old_bash = document.getElementById('current-bash');
    if (old_bash) {
        old_bash.remove();
    }
}
var getOperation = function( n1 , n2 , op ) {
    var operation;
    switch( op ) {
        case 'sum' :
            operation = n1 + " + " + n2;
        break;
        case 'substraction' :
            operation = n1 + " - " + n2;
        break;
        case 'multiplication' :
            operation = n1 + " * " + n2;
        break;
        case 'division' :
            operation = n1 + " / " + n2;
        break;
        case 'module' :
            operation = n1 + " módulo " + n2;
        break;
        case 'percent' :
            operation = n1 + " % " + n2;
        break;
        case 'root' :
            operation = "raíz(" + n1 + "," + n2 + ")";
        break;
    }
    return operation;
}
var excecute_process = function( limit , total_time , past_time , remaining_time , last ) {
    var i = 0;
        var process = setInterval( function() {
            if( i < limit )  {
                i ++;
                total_time.value ++;
                past_time.value ++;
                remaining_time.value --;
            }
            else {
                if( last ) {
                    bashRemove();
                }
                clearInterval( process );
            }
        }, 1000 );
}
var excecute_bash = function( index , end , inputs ) {
    var time_sleep       = 0;
    var total_time_sleep = 0;
    var ini              = index;
    var last             = false;
    for( ; index < end; index ++ ) {
        (function( ind ) {
            if ( ind > ini ) {
                time_sleep = programs[ind-1].max_time;
                total_time_sleep += parseInt( time_sleep ) + 1;
            }
            setTimeout( function() {
                inputs[0].value = programs[ind].name;
                inputs[1].value = getOperation( programs[ind].num1 , programs[ind].num2 , programs[ind].op );
                inputs[2].value = programs[ind].max_time;
                inputs[3].value = programs[ind].id_program;
                inputs[4].value = 0;
                inputs[5].value = programs[ind].max_time;
                excecute_process( programs[ind].max_time , inputs[6] , inputs[4] , inputs[5] , last );
                if( ind === end - 1 ) {
                    last = true;
                }
            }, (total_time_sleep) * 1000 );
        })(index);
    }
}
var getSleepTimeByBash = function( ini , end ) {
    var i;
    var total_time = 0;
    for( i = ini; i < end; i ++ ) {
        total_time += parseInt( programs[i].max_time ) + 1;
    }
    return total_time;
}
var excecute = function() {
    var num_bashes   = Math.trunc(counter/6);
    var remaining    = counter % 6;
    var exact        = remaining ? false : true;
    var finish_round = false;
    var secondary_limit;

    var input_name           = document.getElementById('name-process');
    var input_op             = document.getElementById('op-process');
    var input_max_time       = document.getElementById('time-process');
    var input_id             = document.getElementById('id-process');
    var input_past_time      = document.getElementById('past-time-process');
    var input_remaining_time = document.getElementById('remaining-time-process');

    var input_total_time = document.getElementById('total-time');

    var inputs = [input_name,input_op,input_max_time,input_id,input_past_time,input_remaining_time,input_total_time];

    if( !exact ) {
        num_bashes ++;
    }
    var i,j,timer;
    i = 0;
    var total_time   = 0;
    var sleep_times  = [];
    var sleep_time   = 0;
    var finish_round = false;
    for( i = 0; i < num_bashes; i ++ ) {
        sleep_times[i] = sleep_time;
        secondary_limit = i * 6 + 6;
        if ( i === num_bashes - 1 ) {
            finish_round = true;
            if( exact ) {
                secondary_limit = i * 6 + 6;
            }
            else {
                secondary_limit = i * 6 + remaining;
            }
        }
        sleep_time += getSleepTimeByBash( i * 6, secondary_limit );
    }
    for( i = 0; i < num_bashes; i ++ ) {
            (function( index , n_bashes ) {
                setTimeout(function(){
                    secondary_limit = index * 6 + 6;
                    if( index === n_bashes - 1 ) {
                        finish_round = true;
                        if( exact ) {
                            secondary_limit = index * 6 + 6;
                        }
                        else {
                            secondary_limit = index * 6 + remaining;
                        }
                    }
                    bashRemove();
                    total_time += bashGenerate( index * 6 , secondary_limit );
                    sleep_time += total_time;

                    excecute_bash( index * 6 , secondary_limit, inputs );

                }, sleep_times[index] * 1000);
            })( i , num_bashes);
    }
}
