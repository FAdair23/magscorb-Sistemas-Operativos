var appState = {};
var INPUTS;

document.onreadystatechange = function () {
    if (document.readyState === 'complete') {
        INPUTS = {
            producerStatus: document.getElementById('producer-status'),
            consumerStatus: document.getElementById('consumer-status'),
        };
    }
};

const setListeners = () => {
    document.onkeyup = (e) => {
        if (appState.action === 'continue') {
            if (e.key === 'Escape') {
                appState.action = 'exit';
            }
        }
    };
}

const setInitialStatus = () => {
    appState.products        = [];
    appState.nextId          = 1;
    appState.getInPriority   = PRODUCER;
    appState.action          = 'continue';
    appState.containerStatus = 'free';

    appState.producer = {
        status: 'Intentando ingresar',
        sleepTime: 0,
        remainingProduce: 0,
    };
    appState.consumer = {
        status: 'Intentando ingresar',
        sleepTime: 0,
        remainingConsume: 0,
    };
};

const restartDivStatus = () => {
    for (let i = 1; i <= CONTAINER_SIZE; i++) {
        setDivStatus(i, 'empty');
    }
}

const generateProduct = () => {
    let product = {};

    product.id = appState.nextId;
    if (appState.nextId === 50) {
        appState.nextId = 1;
    } else {
        appState.nextId++;
    }
    appState.products.push(product);
}

const consumeProduct = () => {
    appState.products.shift();
}

const setDivStatus = (id, status) => {
    let div = document.getElementById(id);
    div.setAttribute('class', status);
};

const continueAction = () => {
    if (appState.containerStatus === 'free') {
        if (appState.producer.status === 'Intentando ingresar' && appState.getInPriority === PRODUCER) {
            appState.getInPriority = !appState.getInPriority;
            getIn('producer');
        } else if (appState.consumer.status === 'Intentando ingresar' && appState.getInPriority === CONSUMER) {
            appState.getInPriority = !appState.getInPriority;
            getIn('consumer');
        } else if (appState.producer.status === 'Intentando ingresar') {
            getIn('producer');
        } else if (appState.consumer.status === 'Intentando ingresar') {
            getIn('consumer');
        } else {
            setTimeout(function () {
                appState.producer.sleepTime--;
                appState.consumer.sleepTime--;
                if (appState.producer.sleepTime === 0) {
                    appState.producer.status = 'Intentando ingresar';
                }
                if (appState.consumer.sleepTime === 0) {
                    appState.consumer.status = 'Intentando ingresar';
                }
                render();
                runApp();
            }, 1000);
        }
    } else {
        if (appState.producer.status === 'Produciendo' && canIProduce()) {
            setTimeout(function () {
                produce();
                if (appState.consumer.status === 'Durmiendo' && appState.consumer.sleepTime === 0) {
                    appState.consumer.status = 'Intentando ingresar';
                }
                render();
                runApp();
            }, 1000);
        } else if (appState.consumer.status === 'Consumiendo' && canIConsume()) {
            setTimeout(function () {
                consume();
                if (appState.producer.status === 'Durmiendo' && appState.producer.sleepTime === 0) {
                    appState.producer.status = 'Intentando ingresar';
                }
                render();
                runApp();
            }, 1000);
        } else if (appState.producer.status === 'Produciendo') {
            sleep('producer');
        } else { //appState.consumer.status === 'Consumiendo'
            sleep('consumer');
        }
    }
}

const canIProduce = () => {
    let isValid = false;
    if (appState.products.length < CONTAINER_SIZE && appState.producer.remainingProduce > 0) {
        isValid = true;
    }
    return isValid;
}

const produce = () => {
    generateProduct();
    appState.producer.remainingProduce--;
    if (appState.consumer.status === 'Durmiendo') {
        appState.consumer.sleepTime--;
    }
}

const canIConsume = () => {
    let isValid = false;
    if (appState.products.length > 0 && appState.consumer.remainingConsume > 0) {
        isValid = true;
    }
    return isValid;
}

const consume = () => {
    consumeProduct();
    appState.consumer.remainingConsume--;
}

const sleep = (agent) => {
    if (agent === 'producer') {
        appState.producer.status    = 'Durmiendo';
        appState.producer.sleepTime = Math.floor((Math.random() * MAX_TIME_SLEEP) + 1);
    } else {
        appState.consumer.status    = 'Durmiendo';
        appState.consumer.sleepTime = Math.floor((Math.random() * MAX_TIME_SLEEP) + 1);
    }
    appState.containerStatus = 'free';
    runApp();
}

const getIn = (agent) => {
    if (agent === 'producer') {
        appState.producer.status           = 'Produciendo';
        appState.producer.remainingProduce = Math.floor((Math.random() * MAX_PROD_CONS) + 1);
    } else {
        appState.consumer.status           = 'Consumiendo';
        appState.consumer.remainingConsume = Math.floor((Math.random() * MAX_PROD_CONS) + 1);
    }
    appState.containerStatus = 'occupied';
    runApp();
}

const renderStatus = () => {
    INPUTS.producerStatus.value = appState.producer.status;
    INPUTS.consumerStatus.value = appState.consumer.status;
}

const renderOccupied = () => {
    appState.products.forEach(function (product) {
        setDivStatus(product.id, 'occupied');
    });
}

const render = () => {
    renderStatus();
    restartDivStatus();
    renderOccupied();
}

const runApp = () => {
    switch (appState.action) {
        case 'continue':
            continueAction();
            break;
    }
}

const startApp = () => {
    document.getElementById('start-app').setAttribute('disabled', 'disabled');
    setInitialStatus();
    setListeners();
    runApp();
}
