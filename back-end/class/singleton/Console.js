

var console = class {

    //=====================================================================================================
    // Stored Attributes
    //=====================================================================================================

    static #data = MapTool.tokens.getTokenByID(
        getTokenID("lib:console", "Framework")
    );

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

    // Creates the log, visibility = "debug" || "gm" || "all"
    static log(text, visibility = "debug") {
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

    static indent(object, visibility) {

        function escape_html(str) {
            return String(str)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");
        }

        function format(value, level = 0) {
            const indent = "&nbsp;".repeat(level * 4);   // 4-space indentation in HTML

            if (value === null) return "null";
            if (typeof value !== "object") {
                return escape_html(JSON.stringify(value));
            }

            // Array
            if (Array.isArray(value)) {
                if (value.length === 0) return "[]";

                let result = "[<br>";
                const inner = value
                    .map(v => indent + "&nbsp;&nbsp;&nbsp;&nbsp;" + format(v, level + 1))
                    .join(",<br>");
                result += inner + "<br>" + indent + "]";
                return result;
            }

            // Object
            const keys = Object.keys(value);
            if (keys.length === 0) return "{}";

            let result = "{<br>";
            const inner = keys
                .map(key => {
                    const key_html = escape_html(JSON.stringify(key));
                    const val_html = format(value[key], level + 1);
                    return (
                        indent +
                        "&nbsp;&nbsp;&nbsp;&nbsp;" +  // indent one level (4 spaces)
                        key_html +
                        ": " +
                        val_html
                    );
                })
                .join(",<br>");

            result += inner + "<br>" + indent + "}";
            return result;
        }

        const html = format(object, 0);

        this.log(html, visibility);
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