

var Sound = class {

    //-----------------------------------------------------------------------------------------------------
    // Stored Attributes
    //-----------------------------------------------------------------------------------------------------

    static #data = MapTool.tokens.getTokenByID("7644598835564E7EA8BC5E323C508749");

    //-----------------------------------------------------------------------------------------------------
    // Getters / Setters
    //-----------------------------------------------------------------------------------------------------

    static get currently_streaming() {
        const object = JSON.parse(this.#data.getProperty("object"));
        return object?.currently_streaming || [];
    }

    static set currently_streaming(currently_streaming) {
        const object = JSON.parse(this.#data.getProperty("object")) || {};
        object.currently_streaming = currently_streaming;
        
        this.#data.setProperty("object", JSON.stringify(object));
    }

    //-----------------------------------------------------------------------------------------------------
    // Sound Playing/Stopping Methods
    //-----------------------------------------------------------------------------------------------------

    static play (name, {volume = 0.1, stream = false} = {}) {
        try {
            // Play Sound
            MTScript.evalMacro(`
                [h,macro("playLocal${ stream ? "Stream" : "Clip" }All@lib:JUH.media"): json.append("",
                    "audio:${name}",
                    ${stream ? -1 : 1},
                    ${volume}
                )]
            `)

            // Add stream to array
            const wasStreaming = this.currently_streaming.includes(name)
            if (stream) {
                if (!wasStreaming) this.currently_streaming = [...this.currently_streaming, name]
            }
            // If is going to be replayed, but not as a loop remove from streaming list
            else if (wasStreaming) {
                this.currently_streaming = this.currently_streaming.filter((elem) => elem != name)
            }
        } 
        catch {
            console.log(`Error occurred when playing ${name}`, "debug")
        }
    }

    static stop (name) {
        try {
            MTScript.evalMacro(`
                [h,macro("playLocalStreamAll@lib:JUH.media"): json.append("",
                    "audio:${name}",
                    0
                )]
            `)

            // Remove stream from array
            this.currently_streaming = this.currently_streaming.filter((elem) => elem != name)
        } 
        catch {
            console.log(`Error occurred when stopping ${name}`, "debug")
        }
    }

    static stopAll () {
        for (const sound of this.currently_streaming) {
            this.stop(sound)
        }
    }
}