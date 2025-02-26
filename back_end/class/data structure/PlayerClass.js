"use strict";
try {

    var PlayerClass = class {

        //=====================================================================================================
        // Class parameters
        //=====================================================================================================

        #name
        #base_health
        #spellcasting
        #spellcasting_ability
        #subclasses
        #resources
        #choices
        #starting_proficiencies
        #description
        
        //=====================================================================================================
        // Getter methods
        //=====================================================================================================

        get name() { return this.#name; }
        get base_health() { return this.#base_health }
        get spellcasting() { return this.#spellcasting }
        get spellcasting_ability() { return this.#spellcasting_ability }
        get subclasses() { return this.#subclasses }
        get resources() { return this.#resources }
        get choices() { return this.#choices }
        get starting_proficiencies() { return this.#starting_proficiencies }
        get description() { return this.#description }

        //=====================================================================================================
        // Instance management
        //=====================================================================================================

        constructor({
            name = "", // String
            base_health = 6, // Value from 4 to 12
            spellcasting = "none", // "none", "third", "half", "full"
            spellcasting_ability = "none", // "wisdom", "intelligence", "charisma"
            subclasses = [], // Array of subclass names
            starting_proficiencies = {first_class: [], multi_class: []}, // Arrays of {name, level}
            description = "", // String
            resources = {}, // Object { Level: [ {resource, max, restored_on?} ] }
            choices = {} // Object { Level: [ {choice} ] }
            // choice can be {type: "feature", options: [], amount} or {type: "spell", level?, class, amount}
        }) {

            // Base health validation
            base_health = Number(base_health)
            if (isNaN(base_health)) {
                log ("Base health must be a number for new PlayerClass object")
                return
            }
            else if (base_health < 4 || base_health > 12) {
                log ("Invalid base_health value for new PlayerClass object")
                return
            }

            // Spellcasting validation
            if (!["none", "third", "half", "full"].includes(spellcasting)) {
                log ("Invalid spellcasting value for new PlayerClass object")
                return
            }

            // Spellcasting modifier validation
            if (!["none", "wisdom", "intelligence", "charisma"].includes(spellcasting_ability)) {
                log ("Invalid spellcasting value for new PlayerClass object")
                return
            }

            // Subclasses validation
            if (!Array.isArray(subclasses)) {
                log ("Subclasses must be an array for new PlayerClass object")
                return
            }

            // Starting proficiencies
            if (!starting_proficiencies.first_class || !starting_proficiencies.multi_class) {
                log ("Invalid starting_proficiencies format for new PlayerClass object")
                return
            }

            // Instancing
            this.#name = name
            this.#base_health = base_health
            this.#spellcasting = spellcasting
            this.#spellcasting_ability = spellcasting_ability
            this.#subclasses = subclasses
            this.#starting_proficiencies = starting_proficiencies
            this.#description = description
            this.#resources = resources
            this.#choices = choices
        }

        object() {
            return {
                name: this.#name,
                base_health: this.#base_health,
                spellcasting: this.#spellcasting,
                spellcasting_ability: this.#spellcasting_ability,
                subclasses: this.#subclasses,
                starting_proficiencies: this.#starting_proficiencies,
                description: this.#description,
                resources: this.#resources,
                choices: this.#choices
            };
        }

        //=====================================================================================================
    }


} catch (e) {
    MapTool.chat.broadcast("" + e + "\n" + e.stack);
}
