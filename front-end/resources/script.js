`[r:'`

//=====================================================================================================
// Helper functions
//=====================================================================================================

function hash(string) {
    
    let hash = 0;

    if (string.length == 0) return hash;

    for (i = 0; i < string.length; i++) {
        char = string.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }

    return hash;
}

function getId(id) {return document.getElementById(id)}

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function capitalizeAll(str) {
    return str
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function timeUnit(time) {
    const units = [
        { threshold: 14400, unit: "Day" },
        { threshold: 600, unit: "Hour" },
        { threshold: 10, unit: "Minute" },
        { threshold: 1, unit: "Round" }
    ];

    for (const { threshold, unit } of units) {
        if (time >= threshold) {
            const value = Math.round(time / threshold);
            return value + " " + unit + (value > 1 ? "s" : "");
        }
    }

    return "1 Round"; // Default case if time is <= 1
}

function arrayToList(array, capitalize=false) {
    let return_string = ""

    for (const i in array) {
        const element = capitalize ? capitalize(array[i]) : array[i]

        return_string += element
        return_string += i != array.length-1 ? ", " : ""
    }

    return return_string
}

function isEqualJSON(a, b) {
    return JSON.stringify(a) === JSON.stringify(b)
}

//=====================================================================================================
// External functions
//=====================================================================================================

async function backend(body) {
    return fetch("macro:console@lib:back", {
        method: "POST",
        body: body,
    })
    .then(response => response.text())
    .catch(() => ""); // Return an empty string if fetch fails
}

function toBackend(arguments, valueCallback) {
    let request = new XMLHttpRequest();
    request.open("POST", "macro:console@lib:back", true);

    request.onreadystatechange = function() {
        if (request.readyState == 4) {
            valueCallback(request.response);
        }
    };
    request.send(arguments);
}

function closePage(page_name) {
    let request = new XMLHttpRequest();
    request.open("POST", "macro:closePage@lib:front", true);

    request.onreadystatechange = function() {
        if (request.readyState == 4) {
            valueCallback(request.response);
        }
    };
    request.send(page_name);
}

function openPage(page_link, arguments = getId("id").value) {
    let request = new XMLHttpRequest();
    request.open("POST", "macro:openPage@lib:front", true);

    request.onreadystatechange = function() {
        if (request.readyState == 4) {
            valueCallback(request.response);
        }
    };
    request.send(arguments + ";" + page_link);
}

function openClosePage(arguments, page_name, page_link) {
    let request = new XMLHttpRequest();
    request.open("POST", "macro:openClosePage@lib:front", true);

    request.onreadystatechange = function() {
        if (request.readyState == 4) {
            valueCallback(request.response);
        }
    };
    request.send(arguments + ";" + page_name + ";" + page_link);
}

function teleport(arguments) {
    let request = new XMLHttpRequest();
    request.open("POST", "macro:teleport@lib:back", true);

    request.onreadystatechange = function() {
        if (request.readyState == 4) {
            valueCallback(request.response);
        }
    };
    request.send(arguments);
}

//=====================================================================================================
// Mouse Tracking
//=====================================================================================================

let mouse_x = 0;
let mouse_y = 0;

// Track mouse position globally
document.addEventListener("mousemove", function (e) {
    mouse_x = e.pageX; // X-coordinate relative to the page
    mouse_y = e.pageY; // Y-coordinate relative to the page
});


//=====================================================================================================

`']`