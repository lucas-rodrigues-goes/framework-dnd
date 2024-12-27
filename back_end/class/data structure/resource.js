"use strict";
try {

    var Resource = class {

        //=====================================================================================================
        // Resistance parameters
        //=====================================================================================================

        #name
        #type
        #level
        #description


        
        //=====================================================================================================
        // Getter methods
        //=====================================================================================================

        get name() { return this.#name; }
        get type() { return this.#type }
        get level() { return this.#level }
        get description() { return this.#description }



        //=====================================================================================================
        // Instance management
        //=====================================================================================================

        constructor(
            name = "",
            level = 0,
            type,
            description = ""
        ) {

            // Validate Type
            if (![
                "class", "default", "feat"
            ].includes(type)) { return }
            
            // Instancing
            this.#name = name
            this.#type = type
            this.#level = level
            this.#description = description

        }

        object() {
            return {
                "name": this.#name,
                "type": this.#type,
                "level": this.#level,
                "description": this.#description
            };
        }

        //=====================================================================================================
    }


} catch (e) {
    MapTool.chat.broadcast("" + e + "\n" + e.stack);
}
