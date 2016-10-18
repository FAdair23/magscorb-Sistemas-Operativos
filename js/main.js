var programs       = [];
var counter        = 0;
const progsByBatch = 5;

var appendError = function ( node , errorMessage ) {
    var parent    = node.parentNode;
    var errorSpan = document.createElement( 'span' );
    var message   = document.createTextNode( errorMessage );
    errorSpan.appendChild( message );
    parent.appendChild( errorSpan );
}

var removeError = function ( node ) {
    var parent    = node.parentNode;
    var errorSpan = node.nextElementSibling;
    node.removeAttribute( 'class' );
    parent.removeChild( errorSpan );
}

var removeFirstProcess = function () {
    var currentBatch    = document.getElementById('current-batch');
    var spanWillRemoved = currentBatch.firstChild;

    currentBatch.removeChild(spanWillRemoved);
    spanWillRemoved = currentBatch.firstChild;
    currentBatch.removeChild(spanWillRemoved);
}

var restart = function () {
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

var guardar = function () {
    var currentProg = validate();
    var counterSpan = document.getElementById('counter');
    if( currentProg && opValidate( currentProg ) ) {
    	if( idValidation( currentProg.idProgram ) ) {
    		programs[counter] = currentProg;
            counter ++;
            swal("Muy bien " + currentProg.name , "Tu programa ha sido guardado" , "success");
            counterSpan.innerText = counter;
            restart();
    	} else {
    		var imageUrl = getImageUrl();
    		swal({
            	title: 'Id inválido',
                text: 'El número de programa que intentas ingresar, ya ha sido registrado',
                imageUrl: imageUrl
            });
    	}
    }
}

var validate = function () {
    var currentProg  = null;
    var errorMessage = '';
    var errors       = 0;
    var hasError     = false;

    var inputs = {
        inputName: document.getElementById('name'),
        inputNum1: document.getElementById('num1'),
        inputOp: document.getElementById('op'),
        inputNum2: document.getElementById('num2'),
        inputMaxTime: document.getElementById('max-time'),
        inputIdProgram: document.getElementById('id-program')
    };
    for (var key in inputs) {
        hasError = false; //Reiniciar bandera
        //Limpiar errores anteriores del campo.
        if ( inputs[key].getAttribute( 'class' ) === 'error' ) {
            removeError( inputs[key] );
        }
        if ( inputs[key].value.trim() === '' ) {
            errorMessage = 'Campo requerido';
            hasError = true;
        } else if ( key === 'inputOp' && inputs[key].value === 'none' ) {
            errorMessage = 'Selecciona operación!';
            hasError = true;
        } else if ( key === 'inputId' && inputs[key].value <= '0' ) {
            errorMessage = 'El Id debe ser mayor a 0';
            hasError = true;
        } else if ( key === 'inputMaxTime' && inputs[key].value <= '0' ) {
            errorMessage = 'El tiempo máximo estimado debe ser mayor a 0';
            hasError = true;
        }

        if ( hasError ) {
            inputs[key].setAttribute( 'class' , 'error' );
            appendError( inputs[key] , errorMessage );
            errors ++;
        }
    }

    if( errors === 0 ) {
        currentProg = {
            name: inputs['inputName'].value,
            num1: inputs['inputNum1'].value,
            op: inputs['inputOp'].value,
            num2: inputs['inputNum2'].value,
            maxTime: inputs['inputMaxTime'].value,
            idProgram: inputs['inputIdProgram'].value
        };
    }
	return currentProg;
}

var getImageUrl = function () {
	var rand     = Math.round((Math.random() * 100)) % 2;
    var imageUrl = "images/error.png";
    if ( rand ) {
        imageUrl = "images/no.png";
    }
    return imageUrl;
}

var opValidate = function ( program ) {
    var isValid = true;
    var imageUrl = getImageUrl();
    switch ( program.op ) {
        case 'division':
            if( program.num2 == 0 ) {
                swal({
                	title: 'Operación inválida',
                    text: 'No puedes hacer una división entre cero',
                    imageUrl: imageUrl
                });
                isValid = false;
            }
        break;
        case 'module':
            if( program.num2 == 0 ) {
                swal({
                	title: 'Operación inválida',
                    text: 'No puedes obtener un módulo entre cero',
                    imageUrl: imageUrl
                });
                isValid = false;
            }
        break;
    }
    return isValid;
}

var idValidation = function ( id ) {
    var isValid = true;
    for (var i = programs.length - 1; i >= 0; i--) {
        if ( programs[i].idProgram == id ) {
            isValid = false;
            break;
        }
    }
    return isValid;
}

var batchGenerate = function ( ini , end ) {
    var i;
    var spanId;
    var spanMte;
    var content;
    var totalTime      = 0;
    var batchesSection = document.getElementById( 'batches' );
    var batchesDiv     = document.createElement( "div" );
    batchesDiv.setAttribute( 'id' , 'current-batch' );
    batchesSection.appendChild( batchesDiv );
    for ( i = ini; i < end; i ++ ) {
        spanId    = document.createElement( "span" );
        spanMte   = document.createElement( "span" );
        content   = document.createTextNode( programs[i].idProgram );
        spanId.appendChild( content );
        spanId.setAttribute( 'class' , 'left' );
        content     = document.createTextNode( programs[i].maxTime );
        totalTime += parseInt( programs[i].maxTime ) + 1;
        spanMte.appendChild( content );
        spanMte.setAttribute( 'class' , 'right' );
        batchesDiv.appendChild( spanId );
        batchesDiv.appendChild( spanMte );
    }
    return totalTime;
}

var batchRemove = function ( pendingBatches ) {
    var oldBatch = document.getElementById('current-batch');
    if (oldBatch) {
        pendingBatches.value = pendingBatches.value - 1;
        oldBatch.remove();
    }
}

var getOperation = function ( n1 , n2 , op ) {
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
        case 'pow' :
            operation = n1 + "^" + n2;
        break;
        case 'percent' :
            operation = n1 + "% de " + n2;
        break;
    }
    return operation;
}

var getResults = function ( n1 , n2 , op ) {
    var result;
    switch ( op ) {
        case 'sum' :
            result = parseFloat(n1) + parseFloat(n2);
        break;
        case 'substraction' :
            result = n1 - n2;
        break;
        case 'multiplication' :
            result = n1 * n2;
        break;
        case 'division' :
            result = n1 / n2;
        break;
        case 'module' :
            result = n1 % n2;
        break;
        case 'pow' :
            result = Math.pow( n1, n2 );
        break;
        case 'percent' :
            result = n1 / 100 * n2;
        break;
    }
    return result;
}

var getOpAndResult = function (index) {
    var opAndResult = getOperation( programs[index].num1, programs[index].num2, programs[index].op )
                    + ' = ' + getResults( programs[index].num1, programs[index].num2, programs[index].op);
    return opAndResult;
}

var printResult = function ( index ) {
    var resultsSection  = document.getElementById( 'results' );
    var spanId          = document.createElement( 'span' );
    var spanOpAndResult = document.createElement( 'span' );
    var spanBatchNumber = document.createElement( 'span' );
    var textId          = document.createTextNode( programs[index].idProgram );
    var textOpAndResult = document.createTextNode( getOpAndResult(index) );
    var textBatchNumber = document.createTextNode( Math.ceil((index + 1)/progsByBatch) );

    spanId.setAttribute( 'class', 'col-md-3' );
    spanOpAndResult.setAttribute( 'class', 'col-md-6' );
    spanBatchNumber.setAttribute( 'class', 'col-md-3 center-text' );
    spanId.appendChild( textId );
    spanOpAndResult.appendChild( textOpAndResult );
    spanBatchNumber.appendChild( textBatchNumber );
    resultsSection.appendChild( spanId );
    resultsSection.appendChild( spanOpAndResult );
    resultsSection.appendChild( spanBatchNumber );
}

var executeProcess = function ( limit, totalTime, pastTime, remainingTime, index ) {
    var i         = 0;
    var myProcess = setInterval( function () {
        if ( i < limit )  {
            i ++;
            totalTime.value ++;
            pastTime.value ++;
            remainingTime.value --;
        } else {
            printResult( index );
            if ( (index + 1) % progsByBatch !== 0 || index + 1 === programs.length ) {
                removeFirstProcess();
            }
            clearInterval( myProcess );
        }
    }, 1000 );
}

var executeBatch = function ( index, end, inputs ) {
    var timeSleep      = 0;
    var totalTimeSleep = 0;
    var ini            = index;

    while ( index < end ) {
        (function ( ind ) {
            if ( ind > ini ) {
                timeSleep       = programs[ind-1].maxTime;
                totalTimeSleep += parseInt( timeSleep ) + 1;
            }
            setTimeout( function () {
                inputs.inputName.value          = programs[ind].name;
                inputs.inputOp.value            = getOperation( programs[ind].num1 , programs[ind].num2 , programs[ind].op );
                inputs.inputMaxTime.value       = programs[ind].maxTime;
                inputs.inputId.value            = programs[ind].idProgram;
                inputs.inputPastTime.value      = 0;
                inputs.inputRemainingTime.value = programs[ind].maxTime;
                executeProcess(
                    programs[ind].maxTime,
                    inputs.inputTotalTime,
                    inputs.inputPastTime,
                    inputs.inputRemainingTime,
                    ind
                );
            }, (totalTimeSleep) * 1000 );
        })(index);
        index++;
    }
}

var getSleepTimeByBatch = function ( ini , end ) {
    var i;
    var totalTime = 0;
    for ( i = ini; i < end; i ++ ) {
        totalTime += parseInt( programs[i].maxTime ) + 1;
    }
    return totalTime;
}

var changeToExcecutionView = function () {
    var initForm  = document.getElementById('init-form');
    var execution = document.getElementById('execution');

    initForm.setAttribute('class', 'hidden');
    execution.removeAttribute('class');
}

var execute = function () {
    var i,timer,secondaryLimit;
    var numBatches  = Math.ceil(counter/progsByBatch);
    var remaining   = counter % progsByBatch;
    var exact       = remaining ? false : true;
    var finishRound = false;
    var totalTime   = 0;
    var sleepTimes  = [];
    var sleepTime   = 0;
    var finishRound = false;
    var inputs      = {
        inputName: document.getElementById('name-process'),
        inputOp: document.getElementById('op-process'),
        inputMaxTime: document.getElementById('time-process'),
        inputId: document.getElementById('id-process'),
        inputPastTime: document.getElementById('past-time-process'),
        inputRemainingTime: document.getElementById('remaining-time-process'),
        inputTotalTime: document.getElementById('total-time'),
        inputPendingBatches: document.getElementById('pending-batches')
    };
    changeToExcecutionView();
    //Inicialización del input de "lotes pendientes" (si es que hay lotes)
    if ( progsByBatch > 0 ) {
        inputs.inputPendingBatches.value = numBatches - 1;
    }
    //Cálculo de los tiempos que debe detenerse el for principal para cada iteración.
    for ( i = 0; i < numBatches; i ++ ) {
        sleepTimes[i]  = sleepTime;
        secondaryLimit = i * progsByBatch + progsByBatch;
        if ( i === numBatches - 1 ) {
            finishRound = true;
            if( exact ) {
                secondaryLimit = i * progsByBatch + progsByBatch;
            }
            else {
                secondaryLimit = i * progsByBatch + remaining;
            }
        }
        sleepTime += getSleepTimeByBatch( i * progsByBatch, secondaryLimit );
    }
    //Inicio del for principal
    for ( i = 0; i < numBatches; i ++ ) {
        (function ( index , nBatches ) {
            setTimeout(function () {
                secondaryLimit = index * progsByBatch + progsByBatch;
                if ( index === nBatches - 1 ) {
                    finishRound = true;
                    if ( exact ) {
                        secondaryLimit = index * progsByBatch + progsByBatch;
                    } else {
                        secondaryLimit = index * progsByBatch + remaining;
                    }
                }
                batchRemove( inputs.inputPendingBatches );
                totalTime += batchGenerate( index * progsByBatch , secondaryLimit );
                sleepTime += totalTime;

                executeBatch( index * progsByBatch , secondaryLimit, inputs );
            }, sleepTimes[index] * 1000);
        })( i , numBatches);
    }
}
