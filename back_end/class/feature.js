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

        set type(type) {
            if (typeof type != "string") { return; }
            this.#type = type;
        }

        set subtype(subtype) {
            if (this.#type != "class") {return}
            if (typeof subtype != "string") { return; }

            this.#subtype = subtype;
        }
        
        set level(level) {
            level = Number(cast_time)
            if (level < 1 || level > 20) { return; }

            this.#level = level;
        }

        set optional(optional) {
            optional = Boolean(optional)
            if (optional != true && optional != false) { return; }

            this.#optional = optional;
        }

        set description(description) {
            if (typeof description != "string") { return; }
            this.#description = description;
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
