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

    static #current_time() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `[${hours}:${minutes}]`;
    }

    // Creates the log, visibility = "gm" || "all"
    static log(text, visibility = "gm") {
        const message = `${this.#current_time()} ${text}`;

        // Storage
        const history = this.history;
        history.push({ message: message, visibility: visibility });
        this.history = history

        // MapTool chat
        if (visibility === "gm") {
            MapTool.chat.broadcastToGM(`<span style="color: #666">${message}</span>`);
        } else if (visibility === "all") {
            MapTool.chat.broadcast(message);
        }
    }

    static clear() {
        this.history = []
    }

};

console.clear()

var log = function(string) {
    console.log(string);
};

var public_log = function(string) {
    console.log(string, "all");
};
