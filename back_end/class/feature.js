"use strict";
try {

    var Feature = class {

        //=====================================================================================================
        // Feature parameters
        //=====================================================================================================

        #name = "" // 
        #type = "" // racial, feat, class
        #subtype = undefined // is used instead of type when defined
        #level = 0 // 0 if no level requirement
        #optional = true // whether it is automatically added (for races and classes)
        #description = ""

        
        //=====================================================================================================
        // Getter methods
        //=====================================================================================================

        get name() { return this.#name; }
        get type() { return this.#type; }
        get subtype() { return this.#subtype; }
        get level() { return this.#level; }
        get optional() { return this.#optional; }
        get description() { return this.#description; }


        //=====================================================================================================
        // Setter methods
        //=====================================================================================================

        set name(name) {
            if (typeof name != "string") { return; }
            this.#name = name;
        }
        
        set cast_time(cast_time) {
            cast_time = Number(cast_time)
            if (Number(cast_time) < 1 || Number(cast_time) > 12) { return; }

            this.#cast_time = cast_time;
        }


        //=====================================================================================================
        // Instance management
        //=====================================================================================================

        constructor(name, type, subtype, level, optional, description) {
            
            this.#name = name
            this.#type = type
            this.#subtype = subtype
            this.#level = level
            this.#optional = optional
            this.#description = description

        }

        object() {
            return {
                "name": this.#name,
                "type": this.#type,
                "subtype": this.#subtype,
                "level": this.#level,
                "optional": this.#optional,
                "description": this.#description
            };
        }

        //=====================================================================================================
    }


} catch (e) {
    MapTool.chat.broadcast("" + e + "\n" + e.stack);
}
