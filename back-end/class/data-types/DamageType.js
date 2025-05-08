

var DamageType = class {

    //=====================================================================================================
    // Damage parameters
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
        description = "", // String 
        image = "", // String of asset address
    }) {

        // Validate Level
        if (![
            "physical", "elemental", "special"
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
            image: this.#image
        };
    }

    //=====================================================================================================
}
