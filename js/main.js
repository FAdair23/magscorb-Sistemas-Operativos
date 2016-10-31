var appState = {};
var INPUTS;
var CONTAINERS;

document.onreadystatechange = function () {
    if (document.readyState === 'complete') {
        INPUTS = {
            pendingBatches: document.getElementById('pending-batches'),
            process: {
                operation: document.getElementById('op-process'),
                maxTime: document.getElementById('time-process'),
                id: document.getElementById('id-process'),
                elapsedTime: document.getElementById('past-time-process'),
                remainingTime: document.getElementById('remaining-time-process')
            },
            totalElapsedTime: document.getElementById('total-time')
        };

        CONTAINERS = {
            batch: document.getElementById('batches'),
            results: document.getElementById('results')
        };
    }
};

const appendError = ( node , errorMessage ) => {
    var parent    = node.parentNode;
    var errorSpan = document.createElement( 'span' );
    var message   = document.createTextNode( errorMessage );
    errorSpan.appendChild( message );
    parent.appendChild( errorSpan );
}

const removeError = ( node ) => {
    node.removeAttribute( 'class' );
    var parent       = node.parentNode;
    var errorSpan    = node.nextElementSibling;
    parent.removeChild( errorSpan );
}

const validateQuantity = () => {
    var errorMessage;
    var inputProcessQuantity = document.getElementById('process-quantity');
    var quantity             = 0; //A falsy value

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

const setInitialStatus = (programsQty) => {
    var idProgram;
    var maxTime;
    var remainingTime;
    var elapsedTime;
    var num1;
    var op;
    var num2;
    //El primer lote debe ser el 0 y comienza incrementándose en 1 el valor del contador dentro del for
    var batchNumber = -1;

    appState.pendingBatches   = Math.ceil(programsQty / PROGS_BY_BATCH) -1; //El primer lote ya nunca se toma como "lote pendiente"
    appState.batches          = [];
    appState.finishedPrograms = [];
    appState.totalElapsedTime = 0;
    appState.action           = 'continue';

    for (let i = 0; i < programsQty; i++) {
        if (i % PROGS_BY_BATCH === 0) {
            batchNumber ++;
            appState.batches[batchNumber] = [];
        }
        idProgram = i + 1;
        maxTime   = Math.floor((Math.random() * MAX_TIME_LIMIT) + 1);
        op        = Math.floor((Math.random() * OPER_LIMIT) + 1);
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
        appState.batches[batchNumber][i % PROGS_BY_BATCH] = {
            idProgram: idProgram,
            maxTime: maxTime,
            num1: num1,
            op: op,
            num2: num2,
            remainingTime: maxTime,
            elapsedTime: 0,
            batchNumber : batchNumber + 1
        };
    }
}

const setListeners = () => {
    document.onkeypress = (e) => {
        if (appState.action === 'continue' && (e.key === 'e' || e.key === 'E')) {
            appState.action = 'e/s-interruption';
        } else if (appState.action !== 'continue' && (e.key === 'w' || e.key === 'W')) {
            appState.action = 'error';
        } else if (e.key === 'p' || e.key === 'P') {
            appState.action = 'pause';
        } else if (appState.action === 'pause' && (e.key === 'c' || e.key === 'C')) {
            appState.action = 'continue';
            runApp();
        }
    };
}

const executeIfIsValid = () => {
    var quantity = validateQuantity();
    if ( quantity ) { //If quantity is greater than 0
        setInitialStatus( quantity );
        changeToExcecutionView();
        render();
        setListeners();
        runApp();
    }
}

const changeToExcecutionView = () => {
    var initForm  = document.getElementById('init-form');
    var execution = document.getElementById('execution');

    initForm.setAttribute('class', 'hidden');
    execution.removeAttribute('class');
}

const getOperation = ( n1 , n2 , op ) => {
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

const getResults = ( n1 , n2 , op ) => {
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

const getOpAndResult = (program) => {
    var operation   = getOperation( program.num1, program.num2, program.op );
    //If program.remainingTime = 0, then asign the result, else, asign 'ERROR'
    var result      = program.remainingTime === 0
                        ? getResults( program.num1, program.num2, program.op)
                        : 'ERROR';
    var opAndResult = operation + ' = ' + result;
    return opAndResult;
}

const batchRemove = () => {
    var oldBatch = document.getElementById('current-batch');
    if (oldBatch) {
        oldBatch.remove();
    }
}

const renderBatch = (batch) => {
    var spanId;
    var spanMte;
    var spanRemain;
    var content;
    var batchesDiv = document.createElement( "div" );

    batchRemove(); //Remove the old batch

    if (batch !== undefined) {
        batchesDiv.setAttribute( 'id' , 'current-batch' );
        CONTAINERS.batch.appendChild( batchesDiv );

        batch.forEach(function (program) {
            spanId     = document.createElement( "span" );
            spanMte    = document.createElement( "span" );
            spanRemain = document.createElement( "span" );
            content    = document.createTextNode( program.idProgram );
            spanId.appendChild( content );
            spanId.setAttribute( 'class' , 'left' );
            content    = document.createTextNode( program.maxTime );
            spanMte.appendChild( content );
            spanMte.setAttribute( 'class' , 'left' );
            content = document.createTextNode( program.remainingTime );
            spanRemain.appendChild( content );
            spanRemain.setAttribute( 'class' , 'left remaining-time' );
            batchesDiv.appendChild( spanId );
            batchesDiv.appendChild( spanMte );
            batchesDiv.appendChild( spanRemain );
        });
    }
}

const renderCurrentProcess = (process) => {
    if (process !== undefined) {
        INPUTS.process.operation.value     = getOperation(process.num1, process.num2, process.op);
        INPUTS.process.maxTime.value       = process.maxTime;
        INPUTS.process.id.value            = process.idProgram;
        INPUTS.process.elapsedTime.value   = process.elapsedTime;
        INPUTS.process.remainingTime.value = process.remainingTime;
    } else {
        INPUTS.process.operation.value     = '';
        INPUTS.process.maxTime.value       = '';
        INPUTS.process.id.value            = '';
        INPUTS.process.elapsedTime.value   = '';
        INPUTS.process.remainingTime.value = '';
    }
}

const resultsRemove = () => {
    var oldResults = document.getElementById('current-results');
    if (oldResults) {
        oldResults.remove();
    }
}

const renderResults = (results) => {
    var spanId;
    var spanOpAndResult;
    var spanBatchNumber;
    var content;
    var resultsDiv = document.createElement( "div" );

    resultsRemove(); //Remove the old batch

    resultsDiv.setAttribute( 'id' , 'current-results' );
    CONTAINERS.results.appendChild( resultsDiv );

    results.forEach(function (program) {
        spanId          = document.createElement( "span" );
        spanOpAndResult = document.createElement( "span" );
        spanBatchNumber = document.createElement( "span" );

        spanId.setAttribute( 'class', 'col-md-3' );
        spanOpAndResult.setAttribute( 'class', 'col-md-6' );
        spanBatchNumber.setAttribute( 'class', 'col-md-3 center-text' );

        content = document.createTextNode( program.idProgram );
        spanId.appendChild( content );
        content = document.createTextNode( getOpAndResult(program) );
        spanOpAndResult.appendChild( content );
        content = document.createTextNode( program.batchNumber );
        spanBatchNumber.appendChild( content );
        resultsDiv.appendChild( spanId );
        resultsDiv.appendChild( spanOpAndResult );
        resultsDiv.appendChild( spanBatchNumber );
    });
}

const render = () => {
    INPUTS.pendingBatches.value = appState.pendingBatches;
    renderBatch(appState.batches[0]);
    if (appState.batches.length > 0) {
        renderCurrentProcess(appState.batches[0][0]);
    } else {
        renderCurrentProcess();
    }
    renderResults(appState.finishedPrograms);
    INPUTS.totalElapsedTime.value = appState.totalElapsedTime;
}

const continueAction = () => {
    if (appState.batches.length > 0) {
        setTimeout(function () {
            if (appState.batches[0][0].remainingTime > 0) {
                appState.batches[0][0].remainingTime--;
                appState.totalElapsedTime++;
            } else {
                appState.finishedPrograms.push(appState.batches[0].shift());
                if (appState.batches[0].length === 0) {
                    appState.batches.shift();
                    if (appState.pendingBatches > 0) {
                        appState.pendingBatches--;
                    }
                }
            }
            render();
            runApp();
        }, 1000);
    }
}

const interruptionAction = () => {
    if (appState.batches.length > 0) {
        appState.batches[0].push(appState.batches[0].shift());
        appState.action = 'continue';
        runApp();
    }
}

const errorAction = () => {
    if (appState.batches.length > 0) {
        appState.finishedPrograms.push(appState.batches[0].shift());
        if (appState.batches[0].length === 0) {
            appState.batches.shift();
            if (appState.batches.length === 0) {
                render();
            } else {
                appState.pendingBatches--;
            }
        }
        appState.action = 'continue';
        runApp();
    }
}

const runApp = () => {
    switch (appState.action) {
        case 'continue':
            continueAction();
            break;
        case 'e/s-interruption':
            interruptionAction();
            break;
        case 'error':
            errorAction();
    }
}
