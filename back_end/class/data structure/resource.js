"use strict";
try {

    var Resource = class {

        //=====================================================================================================
        // Resource parameters
        //=====================================================================================================

        #name
        #image
        #color
        #description
        
        //=====================================================================================================
        // Getter methods
        //=====================================================================================================

        get name() { return this.#name; }
        get image() { return this.#image; }
        get color() { return this.#color; }
        get description() { return this.#description }

        //=====================================================================================================
        // Instance management
        //=====================================================================================================

        constructor({
            name = "", // String
            image = "", // String
            color = "", // String
            description = "" // String
        }) {

            // Instance
            this.#name = name
            this.#image = image
            this.#color = color
            this.#description = description

        }

        object() {
            return {
                name: this.#name,
                image: this.#image,
                color: this.#color,
                description: this.#description
            };
        }

        //=====================================================================================================
    }


} catch (e) {
    MapTool.chat.broadcast("" + e + "\n" + e.stack);
}
