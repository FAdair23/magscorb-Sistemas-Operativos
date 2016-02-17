var programs      = new Array();
var counter       = 0;
const progsByBash = 4;
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
    var inputs = {
        inputName: document.getElementById( 'name' ),
        inputNum1: document.getElementById( 'num1' ),
        inputOp: document.getElementById( 'op' ),
        inputNum2: document.getElementById( 'num2' ),
        inputMaxTime: document.getElementById( 'max-time' ),
        inputIdProgram: document.getElementById( 'id-program' )
    };
    for (var key in inputs) {
        inputs[key].value = '';
    }
    inputs.inputOp.value = 'none';
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
    var current_prog  = null;
    var error_message = '';

    var inputs = {
        inputName: document.getElementById('name'),
        inputNum1: document.getElementById('num1'),
        inputOp: document.getElementById('op'),
        inputNum2: document.getElementById('num2'),
        inputMaxTime: document.getElementById('max-time'),
        inputIdProgram: document.getElementById('id-program')
    };
    var errors        = 0;
    for (var key in inputs) {
        if( inputs[key].value.trim() === '' ) {
            if( inputs[key].getAttribute( 'class' ) !== 'error' ) {
                inputs[key].setAttribute( 'class' , 'error' );
                error_message = 'Campo requerido';
                appendError( inputs[key] , error_message );
            }
            errors ++;
        }
        else if ( key === 'input_op' ) {
            if( inputs[key].value === 'none' ) {
                if( inputs[key].getAttribute( 'class' ) === 'error' ) {
                    removeError( inputs[key] );
                }
                inputs[key].setAttribute( 'class' , 'error' );
                error_message = 'Selecciona operación!';
                appendError( inputs[key] , error_message );
                errors ++;
            }
            else if( inputs[key].getAttribute( 'class' ) === 'error' ) {
                removeError( inputs[key] );
            }
        }
        else if( inputs[key].getAttribute( 'class' ) === 'error' ) {
            removeError( inputs[key] );
        }
    }

    if( errors === 0 ) {
        current_prog = {
            name: inputs['inputName'].value,
            num1: inputs['inputNum1'].value,
            op: inputs['inputOp'].value,
            num2: inputs['inputNum2'].value,
            max_time: inputs['inputMaxTime'].value,
            id_program: inputs['inputIdProgram'].value
        };
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
    switch ( program.op ) {
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
            if ( (isEven(program.num1) && program.num2 < 0) || (program.num1 == 0 && program.num2 == 0)) {
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
        if ( programs[i].id_program == id ) {
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
    var total_time     = 0;
    var bashes_section = document.getElementById( 'bashes' );
    var bashes_div     = document.createElement( "div" );
    bashes_div.setAttribute( 'id' , 'current-bash' );
    bashes_section.appendChild( bashes_div );
    for ( i = ini; i < end; i ++ ) {
        span_id   = document.createElement( "span" );
        span_mte  = document.createElement( "span" );
        content   = document.createTextNode( programs[i].id_program );
        span_id.appendChild( content );
        span_id.setAttribute( 'class' , 'left' );
        content     = document.createTextNode( programs[i].max_time );
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
    switch ( op ) {
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
        case 'root' :
            operation = "raíz(" + n1 + "," + n2 + ")";
        break;
    }
    return operation;
}
var excecute_process = function( limit , total_time , past_time , remaining_time , last ) {
    var i = 0;
        var process = setInterval( function() {
            if ( i < limit )  {
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
    while ( index < end ) {
        (function( ind ) {
            if ( ind > ini ) {
                time_sleep = programs[ind-1].max_time;
                total_time_sleep += parseInt( time_sleep ) + 1;
            }
            setTimeout( function() {
                inputs.inputName.value         = programs[ind].name;
                inputs.inputOp.value           = getOperation( programs[ind].num1 , programs[ind].num2 , programs[ind].op );
                inputs.inputMaxTime.value      = programs[ind].max_time;
                inputs.inputId.value           = programs[ind].id_program;
                inputs.inputPastTime.value     = 0;
                inputs.inputRemaininTime.value = programs[ind].max_time;
                excecute_process(programs[ind].max_time,
                    inputs.inputTotalTime,
                    inputs.inputPastTime,
                    inputs.inputRemaininTime,
                    last
                );
                if( ind === end - 1 ) {
                    last = true;
                }
            }, (total_time_sleep) * 1000 );
        })(index);
        index++;
    }
}
var getSleepTimeByBash = function( ini , end ) {
    var i;
    var total_time = 0;
    for ( i = ini; i < end; i ++ ) {
        total_time += parseInt( programs[i].max_time ) + 1;
    }
    return total_time;
}
var excecute = function() {
    var num_bashes   = Math.trunc(counter/progsByBash);
    var remaining    = counter % progsByBash;
    var exact        = remaining ? false : true;
    var finish_round = false;
    var secondary_limit;

    var inputs = {
        inputName: document.getElementById('name-process'),
        inputOp: document.getElementById('op-process'),
        inputMaxTime: document.getElementById('time-process'),
        inputId: document.getElementById('id-process'),
        inputPastTime: document.getElementById('past-time-process'),
        inputRemaininTime: document.getElementById('remaining-time-process'),
        inputTotalTime: document.getElementById('total-time')
    };

    if( !exact ) {
        num_bashes ++;
    }
    var i,timer;
    var total_time   = 0;
    var sleep_times  = [];
    var sleep_time   = 0;
    var finish_round = false;
    for( i = 0; i < num_bashes; i ++ ) {
        sleep_times[i] = sleep_time;
        secondary_limit = i * progsByBash + progsByBash;
        if ( i === num_bashes - 1 ) {
            finish_round = true;
            if( exact ) {
                secondary_limit = i * progsByBash + progsByBash;
            }
            else {
                secondary_limit = i * progsByBash + remaining;
            }
        }
        sleep_time += getSleepTimeByBash( i * progsByBash, secondary_limit );
    }
    for( i = 0; i < num_bashes; i ++ ) {
        (function( index , n_bashes ) {
            setTimeout(function(){
                secondary_limit = index * progsByBash + progsByBash;
                if( index === n_bashes - 1 ) {
                    finish_round = true;
                    if( exact ) {
                        secondary_limit = index * progsByBash + progsByBash;
                    }
                    else {
                        secondary_limit = index * progsByBash + remaining;
                    }
                }
                bashRemove();
                total_time += bashGenerate( index * progsByBash , secondary_limit );
                sleep_time += total_time;

                excecute_bash( index * progsByBash , secondary_limit, inputs );

            }, sleep_times[index] * 1000);
        })( i , num_bashes);
    }
}
