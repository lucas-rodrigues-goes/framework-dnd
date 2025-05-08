

var Race = class {

    //=====================================================================================================
    // Race parameters
    //=====================================================================================================

    #name
    #features
    #proficiencies
    #ability_scores
    #description


    
    //=====================================================================================================
    // Getter methods
    //=====================================================================================================

    get name() { return this.#name; }
    get features() { return this.#features }
    get proficiencies() { return this.#proficiencies }
    get ability_scores() { return this.#ability_scores }
    get description() { return this.#description }



    //=====================================================================================================
    // Instance management
    //=====================================================================================================

    constructor({
        name = "", // String
        features = [], // Array of feature names
        proficiencies = [], // Array of [name, level] arrays
        ability_scores = {}, // Dict of ability score modifiers
        description = "" // String
    }) {

        // Instancing
        this.#name = name
        this.#features = features
        this.#proficiencies = proficiencies
        this.#ability_scores = ability_scores
        this.#description = description

    }

    object() {
        return {
            name: this.#name,
            features: this.#features,
            proficiencies: this.#proficiencies,
            ability_scores: this.#ability_scores,
            description: this.#description
        };
    }

    //=====================================================================================================
}
