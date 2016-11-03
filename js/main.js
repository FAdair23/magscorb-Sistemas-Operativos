var appState = {};
var INPUTS;
var CONTAINERS;

document.onreadystatechange = function () {
    if (document.readyState === 'complete') {
        INPUTS = {
            pendingProcessQty: document.getElementById('pending-process'),
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
            ready: document.getElementById('ready-process'),
            locked: document.getElementById('locked-process'),
            results: document.getElementById('results'),
            execResults: document.getElementById('execution-results'),
            execResultsTable: document.getElementById('execution-results-table'),
            bcp: document.getElementById('bcp'),
            bcpTable: document.getElementById('bcp-table'),
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
    var parent    = node.parentNode;
    var errorSpan = node.nextElementSibling;
    node.removeAttribute( 'class' );
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

const generateProgram = () => {
    let program;
    let idProgram;
    let maxTime;
    let num1;
    let op;
    let num2;

    appState.lastId++;
    idProgram = appState.lastId;
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
    program = {
        idProgram: idProgram,
        maxTime: maxTime,
        num1: num1,
        op: op,
        num2: num2,
        remainingTime: maxTime,
        elapsedTime: 0,
        lockedTime: 0,
        arrivalTime: 0,
    };

    return program;
}

const setInitialStatus = (programsQty) => {
    let program;

    appState.programs = {
        executing : null,
        ready: [],
        locked: [],
        new: [],
        finished: []
    }
    appState.lastId           = 0;
    appState.totalElapsedTime = 0;
    appState.action           = 'continue';

    for (let i = 0; i < programsQty; i++) {
        program = generateProgram();
        if (i === 0) {
            appState.programs.executing = program;
            appState.programs.executing.responseTime = 0;
        } else if (i < MEMORY_SIZE) {
            appState.programs.ready.push(program);
        } else {
            appState.programs.new.push(program);
        }
    }
}

const setListeners = () => {
    document.onkeypress = (e) => {
        if (appState.action === 'continue') {
            if (e.key === 'e' || e.key === 'E') {
                appState.action = 'e/s-interruption';
            } else if (e.key === 'w' || e.key === 'W') {
                appState.action = 'error';
            } else if (e.key === 'u' || e.key === 'U') {
                appState.action = 'generateProgram';
            } else if (e.key === 'b' || e.key === 'B') {
                appState.action = 'showBCP';
            } else if (e.key === 'p' || e.key === 'P') {
                appState.action = 'pause';
            }
        } else if (e.key === 'c' || e.key === 'C') {
            if (appState.action === 'pause' || appState.action === 'showBCP') {
                if (appState.action === 'showBCP') {
                    CONTAINERS.bcp.setAttribute('class', 'hidden');
                }
                appState.action = 'continue';
                runApp();
            }
        }
    };
}

const executeIfIsValid = () => {
    var quantity = validateQuantity();
    if ( quantity ) { //If quantity is greater than 0
        setInitialStatus( quantity );
        changeToExecutionView();
        render();
        setListeners();
        runApp();
    }
}

const changeToExecutionView = () => {
    document.getElementById('init-form').setAttribute('class', 'hidden');
    document.getElementById('execution').removeAttribute('class');
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

const containerRemove = (containerId) => {
    var container = document.getElementById(containerId);
    if (container) {
        container.remove();
    }
}

const renderReady = (readyList) => {
    var spanId;
    var spanMte;
    var spanRemain;
    var content;
    var readyDiv = document.createElement( "div" );

    containerRemove('current-ready'); //Remove the old ready list

    if (readyList.length > 0) {
        readyDiv.setAttribute( 'id' , 'current-ready' );
        CONTAINERS.ready.appendChild( readyDiv );

        readyList.forEach(function (program) {
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
            readyDiv.appendChild( spanId );
            readyDiv.appendChild( spanMte );
            readyDiv.appendChild( spanRemain );
        });
    }
}

const renderLocked = (lockedList) => {
    var spanId;
    var spanLockedTime;
    var content;
    var lockedDiv = document.createElement( "div" );

    containerRemove('current-locked'); //Remove the old locked list

    if (lockedList.length > 0) {
        lockedDiv.setAttribute( 'id' , 'current-locked' );
        CONTAINERS.locked.appendChild( lockedDiv );

        lockedList.forEach(function (program) {
            spanId          = document.createElement( "span" );
            spanLockedTime = document.createElement( "span" );
            content         = document.createTextNode( program.idProgram );
            spanId.appendChild( content );
            spanId.setAttribute( 'class' , 'left' );
            content = document.createTextNode( WAIT_TIME - program.lockedTime );
            spanLockedTime.appendChild( content );
            spanLockedTime.setAttribute( 'class' , 'right' );
            lockedDiv.appendChild( spanId );
            lockedDiv.appendChild( spanLockedTime );
        });
    }
}

const renderCurrentProcess = (process) => {
    if (process !== null) {
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

const renderResults = (results) => {
    var spanId;
    var spanOpAndResult;
    var content;
    var resultsDiv = document.createElement( "div" );

    containerRemove('current-results'); //Remove the old results

    resultsDiv.setAttribute( 'id' , 'current-results' );
    CONTAINERS.results.appendChild( resultsDiv );

    results.forEach(function (program) {
        spanId          = document.createElement( "span" );
        spanOpAndResult = document.createElement( "span" );

        spanId.setAttribute( 'class', 'col-md-3' );
        spanOpAndResult.setAttribute( 'class', 'col-md-9' );

        content = document.createTextNode( program.idProgram );
        spanId.appendChild( content );
        content = document.createTextNode( getOpAndResult(program) );
        spanOpAndResult.appendChild( content );
        resultsDiv.appendChild( spanId );
        resultsDiv.appendChild( spanOpAndResult );
    });
}

const renderBCP = (program, status) => {
    var tr;
    var td;
    var content;

    tr = document.createElement( "tr" );
    td = document.createElement( "td" );
    content = document.createTextNode( program.idProgram );
    td.appendChild( content );
    tr.appendChild( td );
    td = document.createElement( "td" );
    if (status === 'finalizado') {
        if (program.remainingTime > 0) {
            content = document.createTextNode( 'finalizado-err' );
        } else {
            content = document.createTextNode( 'finalizado-ok' );
        }
    } else {
        content = document.createTextNode( status );
    }
    td.appendChild( content );
    tr.appendChild( td );
    if (status === 'nuevo') {
        for (let i = 0; i < 8; i++) {
            td = document.createElement( "td" );
            content = document.createTextNode( "NULL" );
            td.appendChild( content );
            tr.appendChild( td );
        }
    } else {
        td = document.createElement( "td" );
        if (status === 'finalizado') {
            content = document.createTextNode( getOpAndResult(program) );
        } else {
            content = document.createTextNode( getOperation(program.num1, program.num2, program.op) + ' = ?' );
        }
        td.appendChild( content );
        tr.appendChild( td );
        td = document.createElement( "td" );
        content = document.createTextNode( program.arrivalTime );
        td.appendChild( content );
        tr.appendChild( td );
        td = document.createElement( "td" );
        if (status === 'finalizado') {
            content = document.createTextNode( program.endTime );
        } else {
            content = document.createTextNode( 'NULL' );
        }
        td.appendChild( content );
        tr.appendChild( td );
        td = document.createElement( "td" );
        if (status === 'finalizado') {
            content = document.createTextNode( program.endTime - program.arrivalTime );
        } else {
            content = document.createTextNode( 'NULL' );
        }
        td.appendChild( content );
        tr.appendChild( td );
        td = document.createElement( "td" );
        if (status === 'finalizado') {
            content = document.createTextNode( program.endTime - program.arrivalTime - program.elapsedTime );
        } else {
            content = document.createTextNode( appState.totalElapsedTime - program.arrivalTime - program.elapsedTime );
        }
        td.appendChild( content );
        tr.appendChild( td );
        td = document.createElement( "td" );
        content = document.createTextNode( program.elapsedTime );
        td.appendChild( content );
        tr.appendChild( td );
        td = document.createElement( "td" );
        content = document.createTextNode( program.remainingTime );
        td.appendChild( content );
        tr.appendChild( td );
        td = document.createElement( "td" );
        if (program.responseTime === undefined) {
            content = document.createTextNode( 'NULL' );
        } else {
            content = document.createTextNode( program.responseTime );
        }
        td.appendChild( content );
        tr.appendChild( td );
    }

    return tr;
}

const renderProcessesTable = () => {
    let tBody = document.createElement( "tbody" );
    let tr;

    containerRemove('bcp-tbody'); //Remove the old processes table

    tBody.setAttribute( 'id' , 'bcp-tbody' );
    CONTAINERS.bcpTable.appendChild( tBody );

    if (appState.programs.executing !== null) {
        tr = renderBCP(appState.programs.executing, 'ejecución');
        tBody.appendChild( tr );
    }
    appState.programs.finished.forEach(function (program) {
        tr = renderBCP(program, 'finalizado');
        tBody.appendChild( tr );
    });
    appState.programs.ready.forEach(function (program) {
        tr = renderBCP(program, 'listo');
        tBody.appendChild( tr );
    });
    appState.programs.locked.forEach(function (program) {
        tr = renderBCP(program, 'bloqueado');
        tBody.appendChild( tr );
    });
    appState.programs.new.forEach(function (program) {
        tr = renderBCP(program, 'nuevo');
        tBody.appendChild( tr );
    });
}

const renderExecutionResults = (finishedProcesses) => {
    var tr;
    var td;
    var content;
    var tBody = document.createElement( "tbody" );

    CONTAINERS.execResults.removeAttribute( 'class' ); //Show the results container

    containerRemove('exec-results-tbody'); //Remove the old execution results

    tBody.setAttribute( 'id' , 'exec-results-tbody' );
    CONTAINERS.execResultsTable.appendChild( tBody );

    finishedProcesses.forEach(function (program) {
        tr = document.createElement( "tr" );
        td = document.createElement( "td" );
        content = document.createTextNode( program.idProgram );
        td.appendChild( content );
        tr.appendChild( td );
        td = document.createElement( "td" );
        content = document.createTextNode( getOpAndResult(program) );
        td.appendChild( content );
        tr.appendChild( td );
        td = document.createElement( "td" );
        content = document.createTextNode( program.maxTime );
        td.appendChild( content );
        tr.appendChild( td );
        td = document.createElement( "td" );
        content = document.createTextNode( program.arrivalTime );
        td.appendChild( content );
        tr.appendChild( td );
        //if ( program.remainingTime === 0 ) {
            td = document.createElement( "td" );
            content = document.createTextNode( program.endTime );
            td.appendChild( content );
            tr.appendChild( td );
            td = document.createElement( "td" );
            content = document.createTextNode( program.endTime - program.arrivalTime );
            td.appendChild( content );
            tr.appendChild( td );
            td = document.createElement( "td" );
            content = document.createTextNode( program.responseTime );
            td.appendChild( content );
            tr.appendChild( td );
            td = document.createElement( "td" );
            content = document.createTextNode( program.endTime - program.arrivalTime - program.elapsedTime );
            td.appendChild( content );
            tr.appendChild( td );
            td = document.createElement( "td" );
            content = document.createTextNode( program.elapsedTime );
            td.appendChild( content );
            tr.appendChild( td );
        //} else {
            /*for ( let i = 0; i < 5; i++ ) {
                td = document.createElement( "td" );
                content = document.createTextNode( "ERROR" );
                td.appendChild( content );
                tr.appendChild( td );
            }
        }*/
        tBody.appendChild( tr );
    });
}

const render = () => {
    INPUTS.pendingProcessQty.value = appState.programs.new.length;
    renderReady(appState.programs.ready);
    renderLocked(appState.programs.locked);
    renderCurrentProcess(appState.programs.executing);
    renderResults(appState.programs.finished);
    renderProcessesTable();
    INPUTS.totalElapsedTime.value = appState.totalElapsedTime;
}

const continueAction = () => {
    if (appState.programs.executing !== null) {
        setTimeout(function () {
            if (appState.programs.executing.remainingTime > 0) {
                appState.programs.executing.remainingTime--;
                appState.programs.executing.elapsedTime++;
                appState.totalElapsedTime++;
                if (appState.programs.locked.length > 0) {
                    appState.programs.locked.forEach(function (program) {
                        program.lockedTime++;
                    });
                    if (appState.programs.locked[0].lockedTime === WAIT_TIME) {
                        appState.programs.locked[0].lockedTime = 0;
                        appState.programs.ready.push(appState.programs.locked.shift());
                    }
                }
            } else {
                appState.programs.executing.endTime = appState.totalElapsedTime;
                appState.programs.finished.push(appState.programs.executing);
                if (appState.programs.new.length > 0) {
                    appState.programs.new[0].arrivalTime = appState.totalElapsedTime;
                    appState.programs.ready.push(appState.programs.new.shift());
                }
                if (appState.programs.ready.length > 0) {
                    if (appState.programs.ready[0].responseTime === undefined) {
                        appState.programs.ready[0].responseTime = appState.totalElapsedTime - appState.programs.ready[0].arrivalTime;
                    }
                    appState.programs.executing = appState.programs.ready.shift();
                } else {
                    appState.programs.executing = null;
                }
            }
            render();
            runApp();
        }, 1000);
    } else if (appState.programs.ready.length > 0) {
        if (appState.programs.ready[0].responseTime === undefined) {
            appState.programs.ready[0].responseTime = appState.totalElapsedTime - appState.programs.ready[0].arrivalTime;
        }
        appState.programs.executing = appState.programs.ready.shift();
        render();
        runApp();
    } else if (appState.programs.locked.length > 0) {
        setTimeout(function () {
            appState.totalElapsedTime++;
            appState.programs.locked.forEach(function (program) {
                program.lockedTime++;
            });
            if (appState.programs.locked[0].lockedTime === WAIT_TIME) {
                appState.programs.locked[0].lockedTime = 0;
                appState.programs.executing = appState.programs.locked.shift();
            }
            render();
            runApp();
        }, 1000);
    } else {
        // render results data
        appState.action = 'finalize';
        renderExecutionResults(appState.programs.finished);
    }
}

const interruptionAction = () => {
    if (appState.programs.executing !== null) {
        appState.programs.locked.push(appState.programs.executing);
        if (appState.programs.ready.length > 0) {
            if (appState.programs.ready[0].responseTime === undefined) {
                appState.programs.ready[0].responseTime = appState.totalElapsedTime - appState.programs.ready[0].arrivalTime;
            }
            appState.programs.executing = appState.programs.ready.shift();
        } else {
            appState.programs.executing = null;
        }
        appState.action = 'continue';
        render();
        runApp();
    } else {
        appState.action = 'continue';
        runApp();
    }
}

const errorAction = () => {
    if (appState.programs.executing !== null) {
        /*if (appState.programs.executing.remainingTime === 0) {
            appState.programs.executing.endTime = appState.totalElapsedTime;
        }*/
        appState.programs.executing.endTime = appState.totalElapsedTime;
        appState.programs.finished.push(appState.programs.executing);
        if (appState.programs.new.length > 0) {
            appState.programs.new[0].arrivalTime = appState.totalElapsedTime;
            appState.programs.ready.push(appState.programs.new.shift());
        }
        if (appState.programs.ready.length > 0) {
            if (appState.programs.ready[0].responseTime === undefined) {
                appState.programs.ready[0].responseTime = appState.totalElapsedTime - appState.programs.ready[0].arrivalTime;
            }
            appState.programs.executing = appState.programs.ready.shift();
        } else {
            appState.programs.executing = null;
        }
        appState.action = 'continue';
        render();
        runApp();
    } else {
        appState.action = 'continue';
        runApp();
    }
}

const generateProgramAction = () => {
    let program    = generateProgram();
    let usedMemory = 0;

    if (appState.programs.executing !== null) {
        usedMemory++;
    }
    usedMemory += appState.programs.ready.length;
    usedMemory += appState.programs.locked.length;

    if (usedMemory < MEMORY_SIZE) {
        program.arrivalTime = appState.totalElapsedTime;
        appState.programs.ready.push(program);
    } else {
        appState.programs.new.push(program);
    }

    appState.action = 'continue';
    render();
    runApp();
}

const showBCPAction = () => {
    CONTAINERS.bcp.removeAttribute('class');
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
            break;
        case 'generateProgram':
            generateProgramAction();
            break;
        case 'showBCP':
            showBCPAction();
    }
}
