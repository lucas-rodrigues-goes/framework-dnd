

var Condition = class {

    //=====================================================================================================
    // Condition parameters
    //=====================================================================================================

    #name
    #type
    #duration
    #description
    #image


    
    //=====================================================================================================
    // Getter methods
    //=====================================================================================================

    get name() { return this.#name; }
    get type() { return this.#type }
    get duration() { return this.#duration }
    get description() { return this.#description }
    get image() { return this.#image }



    //=====================================================================================================
    // Instance management
    //=====================================================================================================

    constructor({
        name = "", // String
        type = "", // String
        duration = 0, // Number
        description = "", // String
        image = ""
    }) {

        // Validate Type
        if (![
            "spell", "natural", "curse", "poison", "special"
        ].includes(type)) { return }
        
        // Instancing
        this.#name = name
        this.#type = type
        this.#duration = duration
        this.#description = description
        this.#image = image

    }

    object() {
        return {
            name: this.#name,
            type: this.#type,
            duration: this.#duration,
            description: this.#description,
            image: this.#image,
        };
    }

    //=====================================================================================================
}
