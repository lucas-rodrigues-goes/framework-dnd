"use strict";
try {

    var Proficiency = class {

        //=====================================================================================================
        // Condition parameters
        //=====================================================================================================

        #name
        #type
        #description
        #image

        
        //=====================================================================================================
        // Getter methods
        //=====================================================================================================

        get name() { return this.#name; }
        get type() { return this.#type }
        get description() { return this.#description }
        get image() { return this.#image }



        //=====================================================================================================
        // Instance management
        //=====================================================================================================

        constructor({
            name = "", // String
            type = "", // String
            description = ["Proficient", "Expert", "Master", "Grandmaster"] // Array of descriptions
        }) {

            // Validate Type
            if ( ! [
                "skill", "weapon", "combat", "save", "tool", "language"
            ].includes(type)) { return }
            
            // Instancing
            this.#name = name
            this.#type = type
            this.#description = description
            this.#image = image

        }

        object() {
            return {
                name: this.#name,
                type: this.#type,
                description: this.#description,
                image: this.#image,
            };
        }

        //=====================================================================================================
    }


} catch (e) {
    MapTool.chat.broadcast("" + e + "\n" + e.stack);
}
