

var console = class {

    //=====================================================================================================
    // Stored Attributes
    //=====================================================================================================

    static #data = MapTool.tokens.getTokenByID("D111E023F771474D9A6567941FB4B350");

    //=====================================================================================================
    // Getters / Setters
    //=====================================================================================================

    static get history() {
        const object = JSON.parse(this.#data.getProperty("object"));
        return object?.history || [];
    }

    static set history(history) {
        const object = JSON.parse(this.#data.getProperty("object")) || {};
        object.history = history;
        
        this.#data.setProperty("object", JSON.stringify(object));
    }

    //=====================================================================================================
    // Methods
    //=====================================================================================================

    static #time_hours_minutes() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `[${hours}:${minutes}]`;
    }

    static #time_hours_minutes_seconds() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        return `[${hours}:${minutes}:${seconds}]`;
    }

    // Creates the log, visibility = "gm" || "all"
    static log(text, visibility = "gm") {
        const message = `${this.#time_hours_minutes()} ${text}`;
        const history = this.history;

        // MapTool chat
        switch(visibility) {
            // Debug
            case "debug": {
                MapTool.chat.broadcastToGM(`<span style="color:rgb(197, 70, 70)">${this.#time_hours_minutes_seconds()} ${text}</span>`)
                break
            }
            // GM
            case "gm": {
                MapTool.chat.broadcastToGM(`<span style="color: #666">${message}</span>`)
                history.push({ message: message, visibility: visibility });
                break
            }
            // All
            case "all": {
                MapTool.chat.broadcast(message);
                history.push({ message: message, visibility: visibility });
                break
            }
        }

        // Update History
        this.history = history
    }

    static clear() {
        this.history = []
    }

}

console.clear()

// Backwards compatibility
var log = function(string) {
    console.log(string);
};
var public_log = function(string) {
    console.log(string, "all");
};