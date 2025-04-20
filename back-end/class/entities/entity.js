

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
    // Getter / Setter methods
    //=====================================================================================================

    // Instance
    get id() { return this.#id }
    get token() { return this.#token;}

    // Images
    get portrait() { return MTScript.evalMacro(`[r:getTokenPortrait("","`+this.id+`")]`)}
    get image() { return MTScript.evalMacro(`[r:getTokenImage("","`+this.id+`")]`)}

    // Position X
    get x() {return Number(MTScript.evalMacro(`[r:getTokenX(0,"`+this.id+`")]`))}
    set x(x) { MTScript.evalMacro(`[r:moveToken(`+x+`, `+this.y+`, 0, "`+this.id+`")]`) }

    // Position Y
    get y() {return Number(MTScript.evalMacro(`[r:getTokenY(0,"`+this.id+`")]`))}
    set y(y) { MTScript.evalMacro(`[r:moveToken(`+this.x+`, `+y+`, 0, "`+this.id+`")]`) }

    // Size
    get size() {return MTScript.evalMacro(`[r:getSize("`+this.id+`")]`)}
    set size(size) {
        if (!["Fine", "Diminutive", "Tiny", "Small", "Medium", "Large", "Huge", "Gargantuan", "Colossal"].includes(size)) return
        MTScript.evalMacro(`[r:setSize("`+size+`", "`+this.id+`")]`)
    }

    // Opacity
    get opacity() {return MTScript.evalMacro(`[r:getTokenOpacity("`+this.id+`")]`)}
    set opacity(value) { MTScript.evalMacro(`[r:setTokenOpacity(`+value+`, "`+this.id+`")]`) }

    // Sight
    get sight() {return MTScript.evalMacro(`[r:getSightType("`+this.id+`")]`)}
    set sight(value) { MTScript.evalMacro(`[r:setSightType("`+value+`", "`+this.id+`")]`) }

    // Invisible
    get invisible() {return MTScript.evalMacro(`[r:getOwnerOnlyVisible("`+this.id+`")]`) == "true"}
    set invisible(value) {
        const bool = value ? 1 : 0
        MTScript.evalMacro(`[r:setOwnerOnlyVisible(`+bool+`, "`+this.id+`")]`)
    }

    // Is player
    get player() {return this.token.isPC()}
    set player(player) {
        if (player) this.token.setPC()
        else this.token.setNPC()
    }


    //=====================================================================================================
    // Functions
    //=====================================================================================================

    // State management
    set_state(state, value=true) {
        const bool = value ? 1 : 0

        MTScript.evalMacro(`[r: setState("`+state+`", `+bool+`,"`+this.id+`") ]`)
        return value
    }
    get_state(state) {
        return MTScript.evalMacro(`[r, if(getState("`+state+`","`+this.id+`")):"true";"false"]`) == "true"
    }
    toggle_state(state) {
        MTScript.evalMacro(`[r: setState("`+state+`", !getState("`+state+`", "`+this.id+`"),"`+this.id+`") ]`)
    }

    // Center camera on token
    go_to() { MTScript.evalMacro(`[r:goTo("`+this.id+`")]`) }
   
    // Select token
    select() { MTScript.evalMacro(`[r:selectTokens("`+this.id+`")]`) }

    // Impersonate token
    impersonate() { MTScript.evalMacro(`[r:impersonate("`+this.id+`")]`) }
    
    // Get a percent of how visible the target is from 0 to 1
    target_visibility(target=selected()) {
        const visible_points = JSON.parse(MTScript.evalMacro(`[r:canSeeToken("`+target.id+`","`+this.id+`")]`))
        return visible_points.length / 5
    }

    // Move entity in a direction by a number of cells
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

    // Rotate to face another entity
    face_target(target=selected()) {
        const mode = "tokens"
        const tokenId1 = this.id
        const tokenId2 = target.id

        MTScript.evalMacro(`[r:setFacing(
            json.set("",
                "mode","` + mode + `",
                "tokenId1","` + tokenId1 + `",
                "tokenId2","` + tokenId2 + `"
            )
        )]`)
    }
    

    //=====================================================================================================
    // MapTool sync management
    //=====================================================================================================

    load() {return}
    save() {return}


    //=====================================================================================================

}