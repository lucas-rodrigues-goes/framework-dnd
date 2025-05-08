

var Feature = class {

    //=====================================================================================================
    // Feature parameters
    //=====================================================================================================

    #name
    #type 
    #subtype 
    #level
    #optional
    #description
    #image

    
    //=====================================================================================================
    // Getter methods
    //=====================================================================================================

    get name() { return this.#name; }
    get type() { return this.#type; }
    get subtype() { return this.#subtype; }
    get level() { return this.#level; }
    get optional() { return this.#optional; }
    get description() { return this.#description; }
    get image() { return this.#image }



    //=====================================================================================================
    // Instance management
    //=====================================================================================================

    constructor({
        name = "", // String 
        type = "", // String 
        subtype = "", // String for classes in case of type class
        level = 0, // Number 
        optional = true, // Boolean 
        description = "", // String
        image = "", // Asset url
    }) {

        // Validate Type
        if ( ! [
            "racial", "class", "feat"
        ].includes(type)) { return }

        // Validate Subtype
        if (type != "class") { subtype = undefined }

        // Validate Level
        if (Number(level) < 0 || Number(level) > 20) { return }

        // Instancing
        this.#name = name
        this.#type = type
        this.#subtype = subtype
        this.#level = level
        this.#optional = optional
        this.#description = description
        this.#image = image

    }

    object() {
        return {
            name: this.#name,
            type: this.#type,
            subtype: this.#subtype,
            level: this.#level,
            optional: this.#optional,
            description: this.#description,
            image: this.#image,
        };
    }

    //=====================================================================================================
}
