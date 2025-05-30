

var Humanoid = class extends Creature {

    //=====================================================================================================
    // Default Parameters
    //=====================================================================================================

    #classes = {}
    #experience = 0

    //=====================================================================================================
    // Character Creation
    //=====================================================================================================

    create_character({name, race, ability_scores, character_class, class_choices}) {
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
    // Leveling and Experience
    //=====================================================================================================

    get level() {
        let total = 0
        for (const player_class in this.#classes) {
            total += Number(this.#classes[player_class].level)
        }
        return total
    }

    get level_up_experience () { 
            const level_table = {
                0: 0, 1: 300, 2: 900, 3: 2700, 4: 6500, 5: 14000, 6: 23000, 7: 34000, 8: 48000,
                9: 64000, 10: 85000, 11: 100000, 12: 120000, 13: 140000, 14: 165000, 15: 195000,
                16: 225000, 17: 265000, 18: 305000, 19: 355000
            }
            
            return level_table[this.level] - level_table[this.level - 1]
    }

    get experience () { return this.#experience }
    set experience (new_exp) {
        this.#experience = new_exp
        this.save()
    }

    get classes () { return this.#classes }

    level_up(class_choice, choices) {
        if (this.level >= 20) { return }

        // Pay experience cost
        this.experience = this.experience - this.level_up_experience

        // Create class object
        if (!this.#classes[class_choice]) {
            this.#classes[class_choice] = {level: 0, features: []}
        }

        // Increase level
        this.#classes[class_choice].level += 1

        // Call class level up
        eval(class_choice).level_up(this, choices)

        // Update spellslots
        this.update_spell_slots()

        log(this.name + " received a " + class_choice + " level.")
        this.save()
    }

    //=====================================================================================================
    // Race
    //=====================================================================================================

    get race() { return super.race }

    set race(race) {
        // Old race information
        const old_race_data = database.get_race(this.race) || {};
        const old_ability_scores = old_race_data.ability_scores || {};
    
        // Remove ability score bonuses
        for (const [score, value] of Object.entries(this.ability_scores)) {
            const bonus = old_ability_scores[score] || 0;
            const total_value = Number(value) - Number(bonus);
            this.set_ability_score(score, total_value);
        }

        //=================================================================================================
    
        // New race information
        const new_race_data = database.get_race(race) || {};
    
        const proficiencies = new_race_data.proficiencies || [];
        const ability_scores = new_race_data.ability_scores || {};
    
        // Add new proficiencies
        for (const proficiency of proficiencies) {
            this.set_proficiency(proficiency.name, proficiency.level, true);
        }
    
        // Add ability score bonuses
        for (const [score, value] of Object.entries(this.ability_scores)) {
            const bonus = ability_scores[score] || 0;
            const total_value = Number(value) + Number(bonus);
            this.set_ability_score(score, total_value);
        }
    
        // Fill HP
        this.health = this.max_health;
    
        // Change race
        super.race = race;
    
        // Save state
        this.save();
    }

    //=====================================================================================================
    // Health
    //=====================================================================================================
    
    get max_health() {
        const level = this.level || 0
        let calculated_max_health = this.ability_scores.constitution

        // Level based health increase
        for (const player_class in this.#classes) {
            const class_base_health = eval(player_class).healthPerLevel || 4

            const class_level = this.#classes[player_class].level
            calculated_max_health += class_base_health * class_level
        }

        // Feature-based modifiers
        const feature_modifiers = {
            "Dwarven Toughness": { type: "add", value: 1 * level }
        };
        for (const [feature, modifier] of Object.entries(feature_modifiers)) {
            if (this.has_feature(feature)) {
                if (modifier.type === "add") { calculated_max_health += modifier.value; } 
                else if (modifier.type === "multiply") { calculated_max_health *= modifier.value; }
            }
        }

        return calculated_max_health
    }

    //=====================================================================================================
    // Features
    //=====================================================================================================

    get features() {
        // Features received from race
        const racial_features = database.get_race(this.race) 
            ? database.get_race(this.race).features 
            : []
    
        // Features received from classes
        const class_features = database.get_features_list().filter(feature => {
            const feature_data = database.get_feature(feature)

            // Check if feature is optional
            const feature_optional = feature_data.optional
            if (feature_optional == "true") { return false }

            // Check if belong to any class the character has
            const feature_class = feature_data.subtype
            if (!this.#classes[feature_class]) { return false }

            // Checks if class level is enough for feature
            const class_level = this.#classes[feature_class].level
            const feature_level = feature_data.level
            return feature_level <= class_level
        })
    
        return [...super.features, ...racial_features, ...class_features]
    }

    //=====================================================================================================
    // Spells
    //=====================================================================================================

    get spellcasting_level() {
        let highest = 0
        for (const player_class in this.#classes) {
            const class_level = this.#classes[player_class].level
            const spellcasting = eval(player_class).spellcasting

            if (spellcasting) {
                let spellcasting_level = 0
                switch (spellcasting.type) {
                    case "full":
                        spellcasting_level = class_level
                        break
                    case "half":
                        spellcasting_level = Math.floor(class_level / 2)
                        break
                    case "third":
                        spellcasting_level = Math.floor(class_level / 3)
                        break
                }

                if (spellcasting_level > highest) highest = spellcasting_level
            }
        }

        return highest
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