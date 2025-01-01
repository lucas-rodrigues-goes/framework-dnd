"use strict";
try {

    var DamageType = class {

        //=====================================================================================================
        // Damage parameters
        //=====================================================================================================

        #name
        #type
        #description


        
        //=====================================================================================================
        // Getter methods
        //=====================================================================================================

        get name() { return this.#name; }
        get type() { return this.#type }
        get description() { return this.#description }



        //=====================================================================================================
        // Instance management
        //=====================================================================================================

        constructor(
            name = "", 
            type,
            description = ""
        ) {

            // Validate Level
            if (![
                "physical", "elemental", "special"
            ].includes(type)) { return }
            
            // Instancing
            this.#name = name
            this.#type = type
            this.#description = description

        }

        object() {
            return {
                "name": this.#name,
                "type": this.#type,
                "description": this.#description
            };
        }

        //=====================================================================================================
    }


} catch (e) {
    MapTool.chat.broadcast("" + e + "\n" + e.stack);
}
