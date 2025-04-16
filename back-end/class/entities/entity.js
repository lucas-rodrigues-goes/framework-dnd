"use strict";
try {
    var Entity = class {

        //=====================================================================================================
        // Entity Default Parameters
        //=====================================================================================================

        #id;
        #token;

        constructor(id) {
            this.#id = id
            this.#token = MapTool.tokens.getTokenByID(id)
        }


        //=====================================================================================================
        // Getter methods
        //=====================================================================================================

        get id() { return this.#id }
        get token() { return this.#token;}

        get portrait() { return MTScript.evalMacro(`[r:getTokenPortrait("","`+this.id+`")]`)}
        get image() { return MTScript.evalMacro(`[r:getTokenImage("","`+this.id+`")]`)}
        get x() {return Number(MTScript.evalMacro(`[r:getTokenX(0,"`+this.id+`")]`))}
        get y() {return Number(MTScript.evalMacro(`[r:getTokenY(0,"`+this.id+`")]`))}
        get player() {return this.token.isPC()}


        //=====================================================================================================
        // Setter methods
        //=====================================================================================================

        set x(x) { MTScript.evalMacro(`[r:moveToken(`+x+`, `+this.y+`, 0, "`+this.id+`")]`) }
        set y(y) { MTScript.evalMacro(`[r:moveToken(`+this.x+`, `+y+`, 0, "`+this.id+`")]`) }
        set player(player) {
            if (player) this.token.setPC()
            else this.token.setNPC()
        }


        //=====================================================================================================
        // Functions
        //=====================================================================================================

        go_to() { MTScript.evalMacro(`[r:goTo("`+this.id+`")]`) }
        select() { MTScript.evalMacro(`[r:selectTokens("`+this.id+`")]`) }
        impersonate() { MTScript.evalMacro(`[r:impersonate("`+this.id+`")]`) }
        target_visibility(target=selected()) {
            const visible_points = JSON.parse(MTScript.evalMacro(`[r:canSeeToken("`+target.id+`","`+this.id+`")]`))
            return visible_points.length / 5
        }
        move(direction, cells) {
            cells = Number(cells)
            if (isNaN(cells)) return

            switch (direction) {
                case "up":
                    this.y -= cells
                    break
                case "down":
                    this.y += cells
                    break
                case "left":
                    this.x -= cells
                    break
                case "right":
                    this.x += cells
                    break
            }
        }
        

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
