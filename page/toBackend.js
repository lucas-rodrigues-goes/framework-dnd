

// Sends code to the backend, and returns response
function toBackend(arguments, valueCallback) {
    let request = new XMLHttpRequest();
    request.open("POST", "macro:console@lib:main", true);

    request.onreadystatechange = function() {
        if (request.readyState == 4) {
            valueCallback(request.response);
        }
    };
    request.send(arguments);
}

// Sends dialog title to close using closeDialog macro
function closeDialog(arguments) {
    let request = new XMLHttpRequest();
    request.open("POST", "macro:closeDialog@lib:main", true);

    request.onreadystatechange = function() {
        if (request.readyState == 4) {
            valueCallback(request.response);
        }
    };
    request.send(arguments);
}