

var Monster = class extends Creature {

    //=====================================================================================================
    // Default Parameters
    //=====================================================================================================

    #challenge_rating = 0
    #max_health = 0
    #condition_immunities = []

    //=====================================================================================================
    // Monster Creation
    //=====================================================================================================

    create({}) {
        // Ability Scores
        if (ability_scores) {
            for (const [score, value] of Object.entries(ability_scores)) {
                this.set_ability_score(score, value)
            }
        }

        // Set basic information
        this.name = name
        this.race = race

        // Add class
        if (character_class) { this.level_up(character_class, class_choices) }

        // Fill Resources
        this.long_rest()
    }

    //=====================================================================================================
    // Health
    //=====================================================================================================
    
    get max_health() {
        return this.#max_health
    }

    set max_health(max_health) {
        this.#max_health = max_health
    }

    //=====================================================================================================
    // Instance
    //=====================================================================================================

    constructor(id, reset, inherit) {
        super(id, reset, true);
        
        // Reset validation
        const noObject = String(this.token.getProperty("object")) === "null"
        const notHumanoid = String(this.token.getProperty("class")) !== "null"
            ? !JSON.parse(this.token.getProperty("class")).includes("Humanoid")
            : true

        const needsReset = noObject || reset || notHumanoid
        if (needsReset) {
            this.name = this.token.getName();
            this.type = "Humanoid"
            if (!inherit) this.save()
        } else {
            if (!inherit) this.load()
        }
    }

    //=====================================================================================================
    // MapTool sync
    //=====================================================================================================

    load() {
        super.load()
        const object = JSON.parse(this.token.getProperty("object"));
    
        this.#classes = object.classes || this.#classes
        this.#experience = object.experience ?? this.#experience
    
        this.token.setProperty("class", JSON.stringify(["Humanoid", "Creature", "Entity"]));
    }
    
    save() {
        const object = {
            ...super.save(),
            experience: this.experience,
            classes: this.classes,
        }
        
        this.token.setProperty("class", JSON.stringify(["Humanoid", "Creature", "Entity"]));
        this.token.setProperty("object", JSON.stringify(object));
    }

    //=====================================================================================================
}