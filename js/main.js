var appState = {};
var INPUTS;
var CONTAINERS;

Array.prototype.clone = function() {
	return this.slice(0);
};

document.onreadystatechange = function () {
    if (document.readyState === 'complete') {
        INPUTS = {
            pendingProcessQty: document.getElementById('pending-process'),
            process: {
                operation: document.getElementById('op-process'),
                maxTime: document.getElementById('time-process'),
                id: document.getElementById('id-process'),
                elapsedTime: document.getElementById('past-time-process'),
                remainingTime: document.getElementById('remaining-time-process'),
                quantum: document.getElementById('quantum-process'),
            },
            totalElapsedTime: document.getElementById('total-time')
        };

        CONTAINERS = {
            processToEnter: document.getElementById('process-to-enter'),
            //locked: document.getElementById('locked-process'),
            results: document.getElementById('results'),
            execResults: document.getElementById('execution-results'),
            execResultsTable: document.getElementById('execution-results-table'),
            bcp: document.getElementById('bcp'),
            bcpTable: document.getElementById('bcp-table'),
            memoryTable: document.getElementById('memory-table'),
        };
    }
};

const appendError = ( node , errorMessage ) => {
    var parent    = node.parentNode;
    var errorSpan = document.createElement( 'span' );
    var message   = document.createTextNode( errorMessage );
    errorSpan.appendChild( message );
    parent.appendChild( errorSpan );
};

const removeError = ( node ) => {
    var parent    = node.parentNode;
    var errorSpan = node.nextElementSibling;
    node.removeAttribute( 'class' );
    parent.removeChild( errorSpan );
};

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
        if ( inputProcessQuantity.hasAttribute('class') ) {
            removeError( inputProcessQuantity );
        }
        quantity = inputProcessQuantity.value;
    }

    return quantity;
};

const validateQuantum = () => {
    var errorMessage;
    var inputQuantum = document.getElementById('quantum-value');
    var quantum      = 0; //A falsy value

    if ( inputQuantum.value.trim() === '' || inputQuantum.value < 1 ) {
        if ( inputQuantum.getAttribute( 'class' ) === 'error' ) {
            removeError( inputQuantum );
        }
        if ( inputQuantum.value.trim() === '' ) {
            errorMessage = 'Campo requerido';
        } else {
            errorMessage = 'El quantum debe ser mayor a cero';
        }
        inputQuantum.setAttribute( 'class' , 'error' );
        appendError( inputQuantum , errorMessage );
    } else {
        if ( inputQuantum.hasAttribute('class') ) {
            removeError( inputQuantum );
        }
        quantum = inputQuantum.value;
    }

    return quantum;
};

const generateProgram = () => {
    let program;
    let id;
    let maxTime;
    let num1;
    let op;
    let num2;
    let programSize;

    appState.lastId++;
    id          = appState.lastId;
    maxTime     = Math.floor((Math.random() * (MAX_TIME_LIMIT - (MIN_TIME_LIMIT - 1))) + MIN_TIME_LIMIT);
    op          = Math.floor((Math.random() * OPER_LIMIT) + 1);
    programSize = Math.floor((Math.random() * (MAX_SIZE - (MIN_SIZE - 1))) + MIN_SIZE);
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
        id: id,
        maxTime: maxTime,
        num1: num1,
        op: op,
        num2: num2,
        remainingTime: maxTime,
        elapsedTime: 0,
        lockedTime: 0,
        arrivalTime: 0,
        quantum: 0,
        size: programSize,
        pages: Math.ceil(programSize / FRAME_SIZE),
        frames: [],
    };

    return program;
};

const pushProgramInMemory = (program) => {
    for (var i = 0; i < program.pages; i++) {
        program.frames.push(appState.freeFrames.shift());
    }
};

const pullProgramFromMemory = (program) => {
    let framesLength = program.frames.length;

    for (var i = 0; i < framesLength; i++) {
        appState.freeFrames.push(program.frames.shift());
    }
};

const setBytesStatus = (program, status) => {
    program.frames.forEach(function (frame, index) {
        if (index === program.frames.length - 1 && (program.size % FRAME_SIZE !== 0)) {
            for (var i = 0; i < FRAME_SIZE; i++) {
                if (i < program.size % FRAME_SIZE) {
                    if (status === '') {
                        appState.memoryFrames[frame.id].bytes[i].text = '';
                    } else {
                        appState.memoryFrames[frame.id].bytes[i].text = 'ID: ' + program.id;
                    }
                    appState.memoryFrames[frame.id].bytes[i].className = status;
                } else {
                    appState.memoryFrames[frame.id].bytes[i].text      = '';
                    appState.memoryFrames[frame.id].bytes[i].className = '';
                }
            }
        } else {
            for (var i = 0; i < FRAME_SIZE; i++) {
                if (status === '') {
                    appState.memoryFrames[frame.id].bytes[i].text = '';
                } else {
                    appState.memoryFrames[frame.id].bytes[i].text = 'ID: ' + program.id;
                }
                appState.memoryFrames[frame.id].bytes[i].className = status;
            }
        }
    });
}

const setInitialStatus = (programsQty, quantum) => {
    let program;

    setInitialMemoryStatus();
    loadOSInMemory();
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
    appState.quantum          = quantum;

    for (let i = 0; i < programsQty; i++) {
        program = generateProgram();
        if (i === 0) {
            appState.programs.executing              = program;
            appState.programs.executing.quantum      = appState.quantum;
            appState.programs.executing.responseTime = 0;
            pushProgramInMemory(program);
            setBytesStatus(program, 'executing');
        } else if (program.pages <= appState.freeFrames.length && appState.programs.new.length === 0) {
            appState.programs.ready.push(program);
            pushProgramInMemory(program);
            setBytesStatus(program, 'ready');
        } else {
            appState.programs.new.push(program);
        }
    }
};

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
            } else if (e.key === 'p' || e.key === 'P' || e.key === 't' || e.key === 'T') {
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
};

const executeIfIsValid = () => {
    let quantity = validateQuantity();
    let quantum  = validateQuantum();
    if ( quantity  && quantum) { //If quantity and quantum are greater than 0
        setInitialStatus( quantity, quantum );
        changeToExecutionView();
        render();
        setListeners();
        runApp();
    }
};

const changeToExecutionView = () => {
    document.getElementById('init-form').setAttribute('class', 'hidden');
    document.getElementById('execution').removeAttribute('class');
};

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
};

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
};

const getOpAndResult = (program) => {
    var operation   = getOperation( program.num1, program.num2, program.op );
    //If program.remainingTime = 0, then asign the result, else, asign 'ERROR'
    var result      = program.remainingTime === 0
                        ? getResults( program.num1, program.num2, program.op)
                        : 'ERROR';
    var opAndResult = operation + ' = ' + result;
    return opAndResult;
};

const containerRemove = (containerId) => {
    var container = document.getElementById(containerId);
    if (container) {
        container.remove();
    }
};

const renderMemoryTableHead = () => {
    let content;
    let th;
    let tHead = document.createElement( "thead" );
    let tRow  = document.createElement( "tr" );

    th      = document.createElement( "th" );
    content = document.createTextNode( "No. Marco" );
    th.appendChild( content );
    tRow.appendChild( th );

    for (var i = 0; i < FRAME_SIZE; i++) {
        th      = document.createElement( "th" );
        content = document.createTextNode( "B" + i );
        th.appendChild( content );
        tRow.appendChild( th );
    }
    tHead.appendChild( tRow );
    CONTAINERS.memoryTable.appendChild( tHead );
};

const setInitialMemoryStatus = () => {
    let frame;
    let id;
    let byte;
    let className;
    let text;
    let bytes;
    let framesQty = Math.ceil(MEMORY_SIZE / FRAME_SIZE);

    appState.memoryFrames = [];
    for (var i = 0; i < framesQty; i++) {
        bytes  = [];
        id     = i;

        if (i !== framesQty - 1 && MEMORY_SIZE % FRAME_SIZE > 0) {
            for (var j = 0; j < MEMORY_SIZE % FRAME_SIZE; j++) {
                className = "";
                text      = "";
                byte = {
                    className: className,
                    text: text
                };
                bytes.push( byte );
            }
        } else {
            for (var j = 0; j < FRAME_SIZE; j++) {
                className = "";
                text      = "";
                byte = {
                    className: className,
                    text: text
                };
                bytes.push( byte );
            }
        }
        frame = {
            id: id,
            bytes: bytes
        };
        appState.memoryFrames.push( frame );
    }
};

const renderMemoryTableBody = () => {
    let content;
    let td;
    let tRow;
    let tBody       = document.createElement( "tbody" );
    let memoryTBody = document.getElementById('memory-tbody');

    if (memoryTBody) {
        memoryTBody.remove();
    }
    appState.memoryFrames.forEach (function (frame, index) {
        id      = index;
        tRow    = document.createElement( "tr" );
        td      = document.createElement( "td" );
        content = document.createTextNode( index );
        td.appendChild( content );
        tRow.appendChild( td );

        frame.bytes.forEach (function (byte) {
            td      = document.createElement( "td" );
            content = document.createTextNode( byte.text );
            td.setAttribute('class', byte.className);
            td.appendChild(content);
            tRow.appendChild( td );
        });

        tBody.appendChild( tRow );
    });

    tBody.setAttribute('id', 'memory-tbody');
    CONTAINERS.memoryTable.appendChild( tBody );
};

const loadOSInMemory = () => {
    let freeFrame;
    appState.freeFrames = appState.memoryFrames.clone();
    let os = {
        frames: Math.ceil(OS_SIZE / FRAME_SIZE),
        rest: OS_SIZE % FRAME_SIZE,
    }
    if (os.rest === 0){
        for (var i = 0; i < os.frames; i++) {
            freeFrame = appState.freeFrames.shift();
            appState.memoryFrames[freeFrame.id].bytes.forEach(function(byte) {
                byte.className = 'occupied-by-os';
                byte.text      = 'SO';
            });
        }
    } else {
        for (var i = 0; i < os.frames - 1; i++) {
            freeFrame = appState.freeFrames.shift();
            appState.memoryFrames[freeFrame.id].bytes.forEach(function(byte) {
                byte.className = 'occupied-by-os';
                byte.text      = 'SO';
            });
        }
        freeFrame = appState.freeFrames.shift();
        appState.memoryFrames[freeFrame.id].bytes.forEach(function(byte, index) {
            if (index < os.rest) {
                byte.className = 'occupied-by-os';
                byte.text      = 'SO';
            } else {
                byte.className = '';
                byte.text      = '';
            }
        });
    }
};

const renderMemoryTable = () => {
    if (CONTAINERS.memoryTable.childElementCount === 0) {
        renderMemoryTableHead();
    }
    renderMemoryTableBody();
};

const renderProcessToEnter = (newProcessList) => {
    var spanId;
    var spanSize;
    var content;
    var processToEnterDiv = document.createElement( "div" );

    containerRemove('current-process-to-enter'); //Remove the old ready list

    if (newProcessList.length > 0) {
        processToEnterDiv.setAttribute( 'id' , 'current-process-to-enter' );
        CONTAINERS.processToEnter.appendChild( processToEnterDiv );

        spanId   = document.createElement( "span" );
        spanSize = document.createElement( "span" );
        content  = document.createTextNode( newProcessList[0].id );
        spanId.appendChild( content );
        spanId.setAttribute( 'class' , 'col-md-3' );
        content = document.createTextNode( newProcessList[0].size );
        spanSize.appendChild( content );
        spanSize.setAttribute( 'class' , 'col-md-9' );
        processToEnterDiv.appendChild( spanId );
        processToEnterDiv.appendChild( spanSize );
    }
};

/*const renderLocked = (lockedList) => {
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
            content         = document.createTextNode( program.id );
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
*/
const renderCurrentProcess = (process) => {
    if (process !== null) {
        INPUTS.process.operation.value     = getOperation(process.num1, process.num2, process.op);
        INPUTS.process.maxTime.value       = process.maxTime;
        INPUTS.process.id.value            = process.id;
        INPUTS.process.elapsedTime.value   = process.elapsedTime;
        INPUTS.process.remainingTime.value = process.remainingTime;
        INPUTS.process.quantum.value       = process.quantum;
    } else {
        INPUTS.process.operation.value     = '';
        INPUTS.process.maxTime.value       = '';
        INPUTS.process.id.value            = '';
        INPUTS.process.elapsedTime.value   = '';
        INPUTS.process.remainingTime.value = '';
        INPUTS.process.quantum.value       = '';
    }
};

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

        content = document.createTextNode( program.id );
        spanId.appendChild( content );
        content = document.createTextNode( getOpAndResult(program) );
        spanOpAndResult.appendChild( content );
        resultsDiv.appendChild( spanId );
        resultsDiv.appendChild( spanOpAndResult );
    });
};

const renderBCP = (program, status) => {
    var tr;
    var td;
    var content;

    tr = document.createElement( "tr" );
    td = document.createElement( "td" );
    content = document.createTextNode( program.id );
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
};

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
};

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
        content = document.createTextNode( program.id );
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
};

const render = () => {
    INPUTS.pendingProcessQty.value = appState.programs.new.length;
    renderProcessToEnter(appState.programs.new);
    renderMemoryTable();
    //renderLocked(appState.programs.locked);
    renderCurrentProcess(appState.programs.executing);
    renderResults(appState.programs.finished);
    renderProcessesTable();
    INPUTS.totalElapsedTime.value = appState.totalElapsedTime;
};

const continueAction = () => {
    if (appState.programs.executing !== null) {
        setTimeout(function () {
            if (appState.programs.executing.remainingTime > 0) {
                appState.programs.executing.remainingTime--;
                appState.programs.executing.quantum--;
                appState.programs.executing.elapsedTime++;
                appState.totalElapsedTime++;
                if (appState.programs.executing.quantum === 0) {
                    setBytesStatus(appState.programs.executing, 'ready');
                    appState.programs.ready.push(appState.programs.executing);
                    if (appState.programs.ready.length > 0) {
                        if (appState.programs.ready[0].responseTime === undefined) {
                            appState.programs.ready[0].responseTime = appState.totalElapsedTime - appState.programs.ready[0].arrivalTime;
                        }
                        appState.programs.executing         = appState.programs.ready.shift();
                        appState.programs.executing.quantum = appState.quantum;
                        setBytesStatus(appState.programs.executing, 'executing');
                    } else {
                        appState.programs.executing = null;
                    }
                }
                if (appState.programs.locked.length > 0) {
                    appState.programs.locked.forEach(function (program) {
                        program.lockedTime++;
                    });
                    if (appState.programs.locked[0].lockedTime === WAIT_TIME) {
                        appState.programs.locked[0].lockedTime = 0;
                        setBytesStatus(appState.programs.locked.slice(0,1)[0], 'ready');
                        appState.programs.ready.push(appState.programs.locked.shift());
                    }
                }
            } else {
                appState.programs.executing.endTime = appState.totalElapsedTime;
                setBytesStatus(appState.programs.executing, '');
                pullProgramFromMemory(appState.programs.executing);
                appState.programs.finished.push(appState.programs.executing);
                if (appState.programs.new.length > 0 && appState.programs.new[0].pages <= appState.freeFrames.length) {
                    appState.programs.new[0].arrivalTime = appState.totalElapsedTime;
                    pushProgramInMemory(appState.programs.new[0]);
                    setBytesStatus(appState.programs.new[0], 'ready');
                    appState.programs.ready.push(appState.programs.new.shift());
                }
                if (appState.programs.ready.length > 0) {
                    if (appState.programs.ready[0].responseTime === undefined) {
                        appState.programs.ready[0].responseTime = appState.totalElapsedTime - appState.programs.ready[0].arrivalTime;
                    }
                    appState.programs.executing         = appState.programs.ready.shift();
                    appState.programs.executing.quantum = appState.quantum;
                    setBytesStatus(appState.programs.executing, 'executing');
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
        appState.programs.executing         = appState.programs.ready.shift();
        appState.programs.executing.quantum = appState.quantum;
        setBytesStatus(appState.programs.executing, 'executing');
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
                appState.programs.executing            = appState.programs.locked.shift();
                appState.programs.executing.quantum    = appState.quantum;
                setBytesStatus(appState.programs.executing, 'executing');
            }
            render();
            runApp();
        }, 1000);
    } else {
        // render results data
        appState.action = 'finalize';
        renderExecutionResults(appState.programs.finished);
    }
};

const interruptionAction = () => {
    if (appState.programs.executing !== null) {
        setBytesStatus(appState.programs.executing, 'locked');
        appState.programs.locked.push(appState.programs.executing);
        if (appState.programs.ready.length > 0) {
            if (appState.programs.ready[0].responseTime === undefined) {
                appState.programs.ready[0].responseTime = appState.totalElapsedTime - appState.programs.ready[0].arrivalTime;
            }
            appState.programs.executing         = appState.programs.ready.shift();
            appState.programs.executing.quantum = appState.quantum;
            setBytesStatus(appState.programs.executing, 'executing');
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
};

const errorAction = () => {
    if (appState.programs.executing !== null) {
        /*if (appState.programs.executing.remainingTime === 0) {
            appState.programs.executing.endTime = appState.totalElapsedTime;
        }*/
        appState.programs.executing.endTime = appState.totalElapsedTime;
        setBytesStatus(appState.programs.executing, '');
        pullProgramFromMemory(appState.programs.executing);
        appState.programs.finished.push(appState.programs.executing);
        if (appState.programs.new.length > 0 && appState.programs.new[0].pages <= appState.freeFrames.length) {
            appState.programs.new[0].arrivalTime = appState.totalElapsedTime;
            pushProgramInMemory(appState.programs.new[0]);
            setBytesStatus(appState.programs.new[0], 'ready');
            appState.programs.ready.push(appState.programs.new.shift());
        }
        if (appState.programs.ready.length > 0) {
            if (appState.programs.ready[0].responseTime === undefined) {
                appState.programs.ready[0].responseTime = appState.totalElapsedTime - appState.programs.ready[0].arrivalTime;
            }
            appState.programs.executing         = appState.programs.ready.shift();
            appState.programs.executing.quantum = appState.quantum;
            setBytesStatus(appState.programs.executing, 'executing');
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
};

const generateProgramAction = () => {
    let program    = generateProgram();

    if (appState.freeFrames.length >= program.pages && appState.programs.new.length === 0) {
        program.arrivalTime = appState.totalElapsedTime;
        pushProgramInMemory(program);
        setBytesStatus(program, 'ready');
        appState.programs.ready.push(program);
    } else {
        appState.programs.new.push(program);
    }

    appState.action = 'continue';
    render();
    runApp();
};

const showBCPAction = () => {
    CONTAINERS.bcp.removeAttribute('class');
};

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
};
