"use strict";
try {

    var Condition = class {

        //=====================================================================================================
        // Condition parameters
        //=====================================================================================================

        #name
        #type
        #duration
        #description


        
        //=====================================================================================================
        // Getter methods
        //=====================================================================================================

        get name() { return this.#name; }
        get type() { return this.#type }
        get duration() { return this.#duration }
        get description() { return this.#description }



        //=====================================================================================================
        // Instance management
        //=====================================================================================================

        constructor(
            name = "",
            duration = 0,
            type,
            description = ""
        ) {

            // Validate Type
            if (![
                "spell", "natural", "curse", "poison", "special"
            ].includes(type)) { return }
            
            // Instancing
            this.#name = name
            this.#type = type
            this.#duration = duration
            this.#description = description

        }

        object() {
            return {
                "name": this.#name,
                "type": this.#type,
                "duration": this.#duration,
                "description": this.#description
            };
        }

        //=====================================================================================================
    }


} catch (e) {
    MapTool.chat.broadcast("" + e + "\n" + e.stack);
}
