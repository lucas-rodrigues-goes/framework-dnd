"use strict";
try {

    var Feature = class {

        //=====================================================================================================
        // Feature parameters
        //=====================================================================================================

        #name = "" // 
        #type = "" // racial, feat, class
        #subtype = undefined // specifies class
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
        // Instance management
        //=====================================================================================================

        constructor(
            name, 
            type,
            subtype,
            level = 0,
            optional = true,
            description
        ) {

            // Validate Type
            if ( ! [
                "racial", "class", "feat"
            ].includes(type)) { return }

            // Validate Subtype
            if (type != "class") { subtype = undefined }

            // Validate Level
            if (Number(level) < 0 || Number(level) > 20) { return }

            // Instance
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
