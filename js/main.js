var programs         = [];
var counter          = 0;

//constant for programs by batch
const PROGS_BY_BATCH = 5;
//constants for operations
const ADDITION       = 1;
const SUBSTRACTION   = 2;
const MULTIPLICATION = 3;
const DIVISION       = 4;
const MODULE         = 5;
const POW            = 6;
const PERCENT        = 7;
//constants for limits to use when generate random numbers
const MAX_TIME_LIMIT = 10;
const NUMBER_LIMIT   = 100;
const OPER_LIMIT     = 7;

var appendError = function( node , errorMessage ) {
    var parent    = node.parentNode;
    var errorSpan = document.createElement( 'span' );
    var message   = document.createTextNode( errorMessage );
    errorSpan.appendChild( message );
    parent.appendChild( errorSpan );
}

var removeError = function( node ) {
    node.removeAttribute( 'class' );
    var parent       = node.parentNode;
    var errorSpan    = node.nextElementSibling;
    parent.removeChild( errorSpan );
}

var removeFirstProcess = function() {
    var currentBatch    = document.getElementById('current-batch');
    var spanWillRemoved = currentBatch.firstChild;

    currentBatch.removeChild(spanWillRemoved);
    spanWillRemoved = currentBatch.firstChild;
    currentBatch.removeChild(spanWillRemoved);
    spanWillRemoved = currentBatch.firstChild;
    currentBatch.removeChild(spanWillRemoved);
}

var validateQuantity = function() {
    var errorMessage;
    var inputProcessQuantity = document.getElementById('process-quantity');
    var quantity             = 0;

    if ( inputProcessQuantity.value.trim() === '' || inputProcessQuantity.value < 1 ) {
        if ( inputProcessQuantity.getAttribute( 'class' ) === 'error' ) {
            removeError( inputProcessQuantity );
        }
        if ( inputProcessQuantity.value.trim() === '' ) {
            errorMessage = 'Campo requerido';
        } else {
            errorMessage = '¿Ejecutar cero o menos procesos? Lo siento, no estoy aquí para éso.';
        }
        inputProcessQuantity.setAttribute( 'class' , 'error' );
        appendError( inputProcessQuantity , errorMessage );
    } else {
        quantity = inputProcessQuantity.value;
    }

    return quantity;
}

var generateNProcess = function(n) {
    var idProgram;
    var maxTime;
    var num1;
    var op;
    var num2;

    for(var i = 0; i < n; i++) {
        idProgram = counter + 1;
        maxTime = Math.floor((Math.random() * MAX_TIME_LIMIT) + 1);
        op = Math.floor((Math.random() * OPER_LIMIT) + 1);
        switch(op) {
            case ADDITION:
            case SUBSTRACTION:
            case MULTIPLICATION:
            case POW:
            case PERCENT:
                num1 = Math.floor(Math.random() * NUMBER_LIMIT);
                //Generate a negative number randomly
                if ( (Math.random() < 0.5) ) {
                    num1 *= -1;
                }
                num2 = Math.floor(Math.random() * NUMBER_LIMIT);
                //Generate a negative number randomly
                if ( (Math.random() < 0.5) ) {
                    num2 *= -1;
                }
                break;
            case DIVISION:
            case MODULE:
                num1 = Math.floor(Math.random() * NUMBER_LIMIT);
                //Generate a negative number randomly
                if ( (Math.random() < 0.5) ) {
                    num1 *= -1;
                }
                //Doesn't exist a division or module by zero, so the absolute value of num2 must be greater than zero
                num2 = Math.floor((Math.random() * NUMBER_LIMIT) + 1);
                //Generate a negative number randomly
                if ( (Math.random() < 0.5) ) {
                    num2 *= -1;
                }
                break;
        }
        programs[counter] = {
            idProgram: idProgram,
            maxTime: maxTime,
            num1: num1,
            op: op,
            num2: num2,
            remainingTime: maxTime
        };
        counter++;
    }
}

var executeIfIsValid = function() {
    var quantity = validateQuantity();
    if ( quantity ) {
        generateNProcess( quantity );
        execute();
    }
}

var batchGenerate = function( ini , end ) {
    var i;
    var spanId;
    var spanMte;
    var spanRemain;
    var content;
    var totalTime      = 0;
    var batchesSection = document.getElementById( 'batches' );
    var batchesDiv     = document.createElement( "div" );
    batchesDiv.setAttribute( 'id' , 'current-batch' );
    batchesSection.appendChild( batchesDiv );
    for ( i = ini; i < end; i ++ ) {
        spanId     = document.createElement( "span" );
        spanMte    = document.createElement( "span" );
        spanRemain = document.createElement( "span" );
        content    = document.createTextNode( programs[i].idProgram );
        spanId.appendChild( content );
        spanId.setAttribute( 'class' , 'left' );
        content    = document.createTextNode( programs[i].maxTime );
        totalTime += parseInt( programs[i].maxTime ) + 1;
        spanMte.appendChild( content );
        spanMte.setAttribute( 'class' , 'left' );
        content = document.createTextNode( programs[i].remainingTime );
        spanRemain.appendChild( content );
        spanRemain.setAttribute( 'class' , 'left remaining-time' );
        batchesDiv.appendChild( spanId );
        batchesDiv.appendChild( spanMte );
        batchesDiv.appendChild( spanRemain );
    }
    return totalTime;
}

var batchRemove = function( pendingBatches ) {
    var oldBatch = document.getElementById('current-batch');
    if (oldBatch) {
        pendingBatches.value = pendingBatches.value - 1;
        oldBatch.remove();
    }
}

var getOperation = function( n1 , n2 , op ) {
    var operation;
    switch ( op ) {
        case ADDITION :
            operation = n1 + " + " + n2;
            break;
        case SUBSTRACTION :
            operation = n1 + " - " + n2;
            break;
        case MULTIPLICATION :
            operation = n1 + " * " + n2;
            break;
        case DIVISION :
            operation = n1 + " / " + n2;
            break;
        case MODULE :
            operation = n1 + " módulo " + n2;
            break;
        case POW :
            operation = n1 + "^" + n2;
            break;
        case PERCENT :
            operation = n1 + "% de " + n2;
            break;
    }
    return operation;
}

var getResults = function( n1 , n2 , op ) {
    var result;
    switch ( op ) {
        case ADDITION :
            result = parseFloat(n1) + parseFloat(n2);
            break;
        case SUBSTRACTION :
            result = n1 - n2;
            break;
        case MULTIPLICATION :
            result = n1 * n2;
            break;
        case DIVISION :
            result = n1 / n2;
            break;
        case MODULE :
            result = n1 % n2;
            break;
        case POW :
            result = Math.pow( n1, n2 );
            break;
        case PERCENT :
            result = n1 / 100 * n2 ;
            break;
    }
    return result;
}

var getOpAndResult = function(index) {
    var opAndResult = getOperation( programs[index].num1, programs[index].num2, programs[index].op ) +
                      ' = ' + getResults( programs[index].num1, programs[index].num2, programs[index].op);
    return opAndResult;
}

var printResult = function( index ) {
    var resultsSection  = document.getElementById( 'results' );
    var spanId          = document.createElement( 'span' );
    var spanOpAndResult = document.createElement( 'span' );
    var spanBatchNumber = document.createElement( 'span' );
    var textId          = document.createTextNode( programs[index].idProgram );
    var textOpAndResult = document.createTextNode( getOpAndResult(index) );
    var textBatchNumber = document.createTextNode( Math.ceil((index + 1)/PROGS_BY_BATCH) );

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

var executeProcess = function( limit, totalTime, pastTime, remainingTime, index ) {
    var i         = 0;
    var myProcess = setInterval( function() {
        if ( i < limit )  {
            i ++;
            totalTime.value ++;
            pastTime.value ++;
            remainingTime.value --;
        } else {
            printResult( index );
            if ( (index + 1) % PROGS_BY_BATCH !== 0 || index + 1 === programs.length ) {
                removeFirstProcess();
            }
            clearInterval( myProcess );
        }
    }, 1000 );
}

var executeBatch = function( index, end, inputs ) {
    var timeSleep      = 0;
    var totalTimeSleep = 0;
    var ini            = index;
    while ( index < end ) {
        (function( ind ) {
            if ( ind > ini ) {
                timeSleep       = programs[ind-1].maxTime;
                totalTimeSleep += parseInt( timeSleep ) + 1;
            }
            setTimeout( function() {
                inputs.inputOp.value            = getOperation( programs[ind].num1 , programs[ind].num2 , programs[ind].op );
                inputs.inputMaxTime.value       = programs[ind].maxTime;
                inputs.inputId.value            = programs[ind].idProgram;
                inputs.inputPastTime.value      = 0;
                inputs.inputRemainingTime.value = programs[ind].remainingTime;
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

var getSleepTimeByBatch = function( ini , end ) {
    var i;
    var totalTime = 0;
    for ( i = ini; i < end; i ++ ) {
        totalTime += parseInt( programs[i].maxTime ) + 1;
    }
    return totalTime;
}

var changeToExcecutionView = function() {
    var initForm  = document.getElementById('init-form');
    var execution = document.getElementById('execution');

    initForm.setAttribute('class', 'hidden');
    execution.removeAttribute('class');
}

var execute = function() {
    var i,timer,secondaryLimit;
    var numBatches  = Math.ceil(counter/PROGS_BY_BATCH);
    var remaining   = counter % PROGS_BY_BATCH;
    var exact       = remaining ? false : true;
    var finishRound = false;
    var totalTime   = 0;
    var sleepTimes  = [];
    var sleepTime   = 0;
    var finishRound = false;
    var inputs      = {
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
    if ( numBatches > 0 ) {
        inputs.inputPendingBatches.value = numBatches - 1;
    }
    //Cálculo de los tiempos que debe detenerse el for principal para cada iteración.
    for( i = 0; i < numBatches; i ++ ) {
        sleepTimes[i]  = sleepTime;
        secondaryLimit = i * PROGS_BY_BATCH + PROGS_BY_BATCH;
        if ( i === numBatches - 1 ) {
            finishRound = true;
            if( !exact ) {
                secondaryLimit = i * PROGS_BY_BATCH + remaining;
            }
        }
        sleepTime += getSleepTimeByBatch( i * PROGS_BY_BATCH, secondaryLimit );
    }
    //Inicio del for principal
    for( i = 0; i < numBatches; i ++ ) {
        (function( index , nBatches ) {
            setTimeout(function() {
                secondaryLimit = index * PROGS_BY_BATCH + PROGS_BY_BATCH;
                if( index === nBatches - 1 ) {
                    finishRound = true;
                    if( !exact ) {
                        secondaryLimit = index * PROGS_BY_BATCH + remaining;
                    }
                }
                batchRemove( inputs.inputPendingBatches );
                totalTime += batchGenerate( index * PROGS_BY_BATCH , secondaryLimit );
                sleepTime += totalTime;

                executeBatch( index * PROGS_BY_BATCH , secondaryLimit, inputs );

            }, sleepTimes[index] * 1000);
        })( i , numBatches);
    }
}
