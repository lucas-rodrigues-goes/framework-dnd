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
    get owners() {return MTScript.evalMacro(`[r:getOwners(",", "${this.id}")]`).split(",")}

    // Images
    get portrait() { return MTScript.evalMacro(`[r:getTokenPortrait("","${this.id}")]`)}
    get image() { return MTScript.evalMacro(`[r:getTokenImage("","${this.id}")]`)}

    // Opacity
    get opacity() {return MTScript.evalMacro(`[r:getTokenOpacity("${this.id}")]`)}
    set opacity(value) { MTScript.evalMacro(`[r:setTokenOpacity(${value}, "${this.id}")]`) }

    // Sight
    get sight() {return MTScript.evalMacro(`[r:getSightType("${this.id}")]`)}
    set sight(value) { 
        MTScript.evalMacro(`[r:setHasSight(1, "${this.id}")]`)
        MTScript.evalMacro(`[r:setSightType("${value}", "${this.id}")]`)
    }

    // Invisible
    get invisible() {return MTScript.evalMacro(`[r:getOwnerOnlyVisible("${this.id}")]`) == "true"}
    set invisible(value) {
        const bool = value ? 1 : 0
        MTScript.evalMacro(`[r:setOwnerOnlyVisible(${bool}, "${this.id}")]`)
    }

    // Is player
    get player() {return this.token.isPC()}
    set player(player) {
        if (player) this.token.setPC()
        else this.token.setNPC()
    }

    // Size
    get size() {return MTScript.evalMacro(`[r:getSize("${this.id}")]`)}
    set size(size) {
        if (!["Fine", "Diminutive", "Tiny", "Small", "Medium", "Large", "Huge", "Gargantuan", "Colossal"].includes(size)) return
        MTScript.evalMacro(`[r:setSize("${size}", "${this.id}")]`)
    }

    // Position X
    get x() {
        const size = this.size;
        const sizeToCells = {
            "Large": 0.5,
            "Huge": 1,
            "Gargantuan": 1.5,
            "Colossal": 2.5
        };
        const baseX = Number(MTScript.evalMacro(`[r:getTokenX(0,"${this.id}")]`));
        return baseX + (sizeToCells[size] || 0);
    }
    set x(x) {
        const size = this.size;
        const sizeToCells = {
            "Large": 0.5,
            "Huge": 1,
            "Gargantuan": 1.5,
            "Colossal": 2.5
        };
        const offset = sizeToCells[size] || 0;
        const adjustedX = x - offset;
        MTScript.evalMacro(`[r:moveToken(${adjustedX}, ${this.y - (sizeToCells[this.size] || 0)}, 0, "${this.id}")]`);
    }

    // Position Y
    get y() {
        const size = this.size;
        const sizeToCells = {
            "Large": 0.5,
            "Huge": 1,
            "Gargantuan": 1.5,
            "Colossal": 2.5
        };
        const baseY = Number(MTScript.evalMacro(`[r:getTokenY(0,"${this.id}")]`));
        return baseY + (sizeToCells[size] || 0);
    }
    set y(y) {
        const size = this.size;
        const sizeToCells = {
            "Large": 0.5,
            "Huge": 1,
            "Gargantuan": 1.5,
            "Colossal": 2.5
        };
        const offset = sizeToCells[size] || 0;
        const adjustedY = y - offset;
        MTScript.evalMacro(`[r:moveToken(${this.x - (sizeToCells[this.size] || 0)}, ${adjustedY}, 0, "${this.id}")]`);
    }

    // Facing
    get facing() {
        const directions = {
            "90": "up",
            "0": "right",
            "-90": "down",
            "180": "left",
            "45": "right-up",
            "-45": "right-down",
            "135": "left-up",
            "-135": "left-down"
        };

        return directions[MTScript.evalMacro(`[r:getTokenFacing("${this.id}")]`)];
    }
    set facing(direction) {
        const angles = {
            "up": "90",
            "right": "0",
            "down": "-90",
            "left": "180",
            "right-up": "45",
            "right-down": "-45",
            "left-up": "135",
            "left-down": "-135"
        }

        MTScript.evalMacro(`[r:setTokenFacing(${angles[direction]}, "${this.id}")]`)
    }


    //=====================================================================================================
    // Functions
    //=====================================================================================================

    // State management
    set_state(state, value=true) {
        const bool = value ? 1 : 0

        MTScript.evalMacro(`[r: setState("${state}", ${bool},"${this.id}") ]`)
        return value
    }
    get_state(state) { return MTScript.evalMacro(`[r, if(getState("${state}","${this.id}")):"true";"false"]`) == "true" }
    toggle_state(state) { MTScript.evalMacro(`[r: setState("${state}", !getState("${state}", "${this.id}"),"${this.id}") ]`) }

    // Light management
    set_light(light, value=true) {
        const bool = value ? 1 : 0

        MTScript.evalMacro(`[r: setLight("D20","${light}", ${bool},"${this.id}") ]`)
        return value
    }

    // Center camera on token
    go_to() { MTScript.evalMacro(`[r:goTo("${this.id}")]`) }
   
    // Select token
    select() { MTScript.evalMacro(`[r:selectTokens("${this.id}")]`) }

    // Impersonate token
    impersonate() { MTScript.evalMacro(`[r:impersonate("${this.id}")]`) }
    
    // Get a percent of how visible the target is from 0 to 1
    target_visibility(target=selected()) {
        if (!target) return false
        const visible_points = JSON.parse(MTScript.evalMacro(`[r:canSeeToken("${target.id}","${this.id}")]`))
        return visible_points.length / 5
    }

    // Move entity in a direction by a number of cells
    move(direction, cells) {
        cells = Number(cells)
        if (isNaN(cells)) return

        switch (direction) {
            // Cardinal directions
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
                
            // Diagonal directions
            case "right-up":
                this.x += cells
                this.y -= cells
                break
            case "right-down":
                this.x += cells
                this.y += cells
                break
            case "left-up":
                this.x -= cells
                this.y -= cells
                break
            case "left-down":
                this.x -= cells
                this.y += cells
                break
        }
    }

    // Rotate to face another entity
    face_target(target=selected()) {
        this.facing = calculate_direction(this, target)
    }
    

    //=====================================================================================================
    // MapTool sync management
    //=====================================================================================================

    load() {return}
    save() {return}


    //=====================================================================================================

}