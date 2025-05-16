

var Sound = class {

    //-----------------------------------------------------------------------------------------------------
    // Stored Attributes
    //-----------------------------------------------------------------------------------------------------

    static #data = MapTool.tokens.getTokenByID("D111E023F771474D9A6567941FB4B350");

    //-----------------------------------------------------------------------------------------------------
    // Getters / Setters
    //-----------------------------------------------------------------------------------------------------

    static get currently_playing() {
        const object = JSON.parse(this.#data.getProperty("object"));
        return object?.currently_playing || [];
    }

    static set currently_playing(currently_playing) {
        const object = JSON.parse(this.#data.getProperty("object")) || {};
        object.currently_playing = currently_playing;
        
        this.#data.setProperty("object", JSON.stringify(object));
    }

    //-----------------------------------------------------------------------------------------------------
    // Methods
    //-----------------------------------------------------------------------------------------------------

    static play (name, volume = 0.1, loop = false) {
        MTScript.evalMacro(`
            [h,macro("playLocalStreamAll@lib:JUH.media"): json.append("",
                "audio:${name}",
                ${loop ? -1 : 1},
                ${volume}
            )]
        `)
    }

    static stop (name) {
        MTScript.evalMacro(`
            [h,macro("playLocalStreamAll@lib:JUH.media"): json.append("",
                "audio:${name}",
                0
            )]
        `)
    }

}