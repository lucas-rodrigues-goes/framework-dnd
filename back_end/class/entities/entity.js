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

        #id;
        #token;
        #portrait;

        constructor(id) {
            this.#id = id
            this.#token = MapTool.tokens.getTokenByID(id)
            this.#portrait = MTScript.evalMacro(`[r:getTokenPortrait("","`+id+`")]`)
        }



        //=====================================================================================================
        // Getter methods
        //=====================================================================================================

        get token() { return this.#token;}
        get portrait() { return this.#portrait;}
        
        get player() {
            return this.#token.isPC()
        }



        //=====================================================================================================
        // Setter methods
        //=====================================================================================================

        get token() { return this.#token;}
        get portrait() { return this.#portrait;}
        
        set player(player) {
            if (player) { this.#token.setPC() } 
            else { this.#token.setNPC() }
        }



        //=====================================================================================================
        // Functions
        //=====================================================================================================

        go_to() { MTScript.evalMacro(`[r:goTo("`+this.#id+`")]`) }
        select() { MTScript.evalMacro(`[r:selectTokens("`+this.#id+`")]`) }
        
        


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
