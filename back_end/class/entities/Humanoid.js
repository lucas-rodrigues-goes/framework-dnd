"use strict";
try {

    var Humanoid = class extends Creature {

        //=====================================================================================================
        // Default Parameters
        //=====================================================================================================

        #classes = {}
        #experience = 0

        //=====================================================================================================
        // Character Creation
        //=====================================================================================================

        create_character({name, race, character_class, ability_scores}) {

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
            if (character_class) { this.level_up(character_class) }

            // Fill health
            this.health = this.max_health
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

        get experience () { return this.#experience }
        get classes () { return this.#classes }

        level_up(class_choice, choices = {features: [], skills: []}) {
            if (this.level >= 20) { return }

            // Create class object
            if (!this.#classes[class_choice]) {
                this.#classes[class_choice] = {level: 0, features: []}
            }

            // Increase level
            this.#classes[class_choice].level += 1

            // Call class level up
            eval(class_choice).level_up(this, choices)

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
            let total = 0
            for (const player_class in this.#classes) {
                const class_level = this.#classes[player_class].level
                const spellcasting = database.get_player_class(player_class).spellcasting

                switch (spellcasting) {
                    case "full":
                        total += class_level
                        break
                    case "half":
                        total += Math.floor(class_level / 2)
                        break
                    case "third":
                        total += Math.floor(class_level / 3)
                        break
                }
            }

            return total
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

} catch (e) {
    MapTool.chat.broadcast("" + e + "\n" + e.stack)
}
