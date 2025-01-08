"use strict";
try {

    // Function to facilitate logging, and easy log disabling.
    var log = function (string) {
        MapTool.chat.broadcast(string);
    }



    var Entity = class {

        //=====================================================================================================
        // Entity Default Parameters
        //=====================================================================================================

        #token;
        #portrait;

        constructor(id) {
            this.#token = MapTool.tokens.getTokenByID(id)
            this.#portrait = MTScript.evalMacro(`[r:getTokenPortrait("","`+id+`")]`)
        }



        //=====================================================================================================
        // Getter methods
        //=====================================================================================================

        get token() { return this.#token;}
        get portrait() { return this.#portrait;}



        //=====================================================================================================
        // MapTool sync management
        //=====================================================================================================

        load() {return}

        save() {return}

        //=====================================================================================================

    }


} catch (e) {
    MapTool.chat.broadcast("" + e + "\n" + e.stack);
}
