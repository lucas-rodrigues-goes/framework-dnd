"use strict";
try {

    var Humanoid = class extends Creature {

        //=====================================================================================================
        // Default Parameters
        //=====================================================================================================

        #classes = {}
        #experience = 0

        //=====================================================================================================
        // Methods
        //=====================================================================================================

        new({name, type, race, ability_scores}) {

            // Ability Scores
            for (const [score, value] of Object.entries(ability_scores)) {
                this.set_ability_score(score, value)
            }

            // Set basic information
            this.name = name
            this.type = type
            this.race = race
            

            // Fill health
            this.health = this.max_health
        }

        //=====================================================================================================
        // Leveling and Experience
        //=====================================================================================================

        get level() {
            let total = 0
            if (this.#classes != {}) {
                for (const player_class in this.#classes) {
                    total += this.#classes[player_class].level
                }
            }
            return total
        }

        get classes() { return this.#classes }

        level_up(class_choice, choices = {features: []}) {
            // Create class object
            const firstLevelInClass = this.#classes[class_choice] != undefined
            if (firstLevelInClass) {
                this.#classes[class_choice] = {level: 0, features: []}
            }

            // Increase level
            this.#classes[class_choice].level += 1

            // Call class level up
            const player_class = {
                "barbarian": Barbarian,
            }
            player_class[class_choice].level_up(this, choices)
        }

        //=====================================================================================================
        // Race
        //=====================================================================================================

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
        
            log(this.name + " race set to " + race + ".");
        }

        //=====================================================================================================
        // Health
        //=====================================================================================================
        
        get max_health() {
            const level = this.level || 0
            let calculated_max_health = this.ability_scores.constitution

            // Level based health increase
            for (const player_class in this.#classes) {
                const class_base_health = database.player_classes.data[player_class].base_health || 6
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
            const racial_features = database.get_race(this.race).features
        
            // Features received from classes
            const class_features = database.get_features_list().filter((feature) => {
                const feature_data = database.get_feature(feature)

                // Check if feature is optional
                const feature_optional = feature_data.feature_optional
                if (feature_optional) { return false }
        
                // Check if belong to any class the character has
                const feature_class = feature_data.subtype
                if (!this.#classes.includes(feature_class)) { return false }
        
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

        constructor(id, reset) {
            super(id)
            let has_property_object = String(this.token.getProperty("object")) != "null";

            // Reset if no previous data or if reset flag is true
            if (!has_property_object || reset) {
                this.name = this.token.getName();
                log(this.name + " was reset.");
                this.save();
            }
            else {
                try {
                    this.load();
                }
                catch {
                    this.name = this.token.getName();
                    log(this.name + " failed to load and was reset.");
                    this.save();
                }
            }
        }

        //=====================================================================================================
        // MapTool sync
        //=====================================================================================================

        load() {
            let object = JSON.parse(this.token.getProperty("object"));

            // Check for undefined values and raise an error
            const keysToCheck = [
                "name", "classes", "experience", "type", "race", "ability_scores", "speed", "health",
                "resources", "features", "spells", "proficiencies",
                "conditions", "equipment", "inventory"
            ];

            for (const key of keysToCheck) {
                if (object[key] === undefined) {
                    throw new Error(`Property "${key}" is undefined in the loaded object.`);
                }
            }

            this.name = object.name;
            this.#classes = object.classes;
            this.#experience = object.experience;
            this.type = object.type;
            this.race = object.race;
            this.ability_scores = object.ability_scores;
            this.speed = object.speed;
            this.health = object.health
            this.resources = object.resources;
            this.features = object.features;
            this.proficiencies = object.proficiencies;
            this.spells = object.spells;
            this.conditions = object.conditions;
            this.equipment = object.equipment;
            this.inventory = object.inventory;

            this.token.setProperty("class", "Creature");
        }

        save() {
            let object = {
                name: this.name,
                classes: this.classes,
                experience: this.experience,
                type: this.type,
                race: this.race,
                ability_scores: this.ability_scores,
                speed: this.speed,
                health: this.health,
                resources: this.resources,
                features: this.features,
                proficiencies: this.proficiencies,
                spells: this.spells,
                conditions: this.conditions,
                equipment: this.equipment,
                inventory: this.inventory
            };
            
            
            this.token.setName(this.name);
            this.token.setProperty("object", JSON.stringify(object));
            this.token.setProperty("class", getInheritanceChain(this.constructor));
        }

        //=====================================================================================================
    }

} catch (e) {
    MapTool.chat.broadcast("" + e + "\n" + e.stack)
}
