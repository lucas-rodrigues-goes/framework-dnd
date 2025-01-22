"use strict";
try {

    var Creature = class extends Entity {

        //=====================================================================================================
        // Creature Default Parameters
        //=====================================================================================================

        #name = "unnamed";
        #type = "";
        #race = "";
        #attributes = {
            "strength": 10, "dexterity": 10, "constitution": 10,
            "wisdom": 10, "intelligence": 10, "charisma": 10,
        };
        #speed = {
            "walk":30,
            "climb":15,
            "swim":15,
            "fly":0,
            "burrow":0,
        }
        #health = 10
        #resources = {
            "mana": {
                "current": 0,
                "maximum": 0
            },
        };
        #features = {
            "all": [], "racial": [], "feat": [],
            "barbarian": [], "bard": [], "cleric": [],
            "druid": [], "fighter": [], "monk": [],
            "paladin": [], "ranger": [], "rogue": [],
            "sorcerer": [], "warlock": [], "wizard": []
        };
        #proficiencies = {}
        #spells = {
            "bard": {
                "known": []
            },
            "cleric": {
                "always_prepared": [],
                "memorized": []
            },
            "druid": {
                "always_prepared": [],
                "memorized": []
            },
            "paladin": {
                "always_prepared": [],
                "memorized": []
            },
            "ranger": {
                "known": []
            },
            "sorcerer": {
                "known": []
            },
            "warlock": {
                "known": []
            },
            "wizard": {
                "known": [],
                "always_prepared": [],
                "memorized": []
            }
        };
        #conditions = {};
        #equipment = {
            "head": "",
            "body": "",
            "gloves": "",
            "feet": "",
            "amulet": "",
            "right ring": "",
            "left ring": "",
            "cape": "",
            "backpack": "",
            "primary main hand": "",
            "primary off hand": "",
            "secondary main hand": "",
            "secondary off hand": ""
        };
        #inventory = [];



        //=====================================================================================================
        // Getter methods
        //=====================================================================================================

        get name() { return this.#name; }
        get type() { return this.#type; }
        get race() { return this.#race; }

        // Array or object getters
        get attributes() { return this.#attributes; }
        get health() { return this.#health }
        get resources() { return this.#resources; }
        get features() { return this.#features; }
        get proficiencies() { return this.#proficiencies; }
        get spells() { return this.#spells; }
        get conditions() {return this.#conditions}
        get equipment() { return this.#equipment; }
        get inventory() { return this.#inventory; }

        // Calculate the attribute bonuses based on the attribute values
        get attr_bonus() {
            let bonus = function (attribute_value) {
                return Math.floor((attribute_value - 10) / 2);
            }

            return {
                "strength": bonus(this.#attributes.strength),
                "dexterity": bonus(this.#attributes.dexterity),
                "constitution": bonus(this.#attributes.constitution),
                "wisdom": bonus(this.#attributes.wisdom),
                "intelligence": bonus(this.#attributes.intelligence),
                "charisma": bonus(this.#attributes.charisma)
            }
        }

        get max_health() {
            const level = this.level || 1
            let calculated_max_health = this.#attributes.constitution

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

        get speed() {
            let baseSpeed = this.#speed.walk;
        
            // Feature-based modifiers
            const feature_modifiers = {
                "Barbaric Movement": { type: "add", value: 10 },
                "Monk Movement": { type: "add", value: 10 },
                "Roving":  { type:"add", value: 5 },
                "Fleet of Foot":  { type:"add", value: 5 },
                "Bulky":  { type:"add", value: -5 },
            };
            for (const [feature, modifier] of Object.entries(feature_modifiers)) {
                if (this.has_feature(feature)) {
                    if (modifier.type === "add") { baseSpeed += modifier.value; } 
                    else if (modifier.type === "multiply") { baseSpeed *= modifier.value; }
                }
            }

            // Condition-based modifiers
            const cnodition_modifiers = {
                "Haste": { type: "multiply", value: 2 },
                "Slow": { type: "multiply", value: 0.5 },
            };
            for (const [condition, modifier] of Object.entries(cnodition_modifiers)) {
                if (this.has_condition(condition)) {
                    if (modifier.type === "add") { baseSpeed += modifier.value; } 
                    else if (modifier.type === "multiply") { baseSpeed *= modifier.value; }
                }
            }
        
            return Math.floor(baseSpeed);
        }

        get resistances() {
            
            // Features that add/change resistances
            const feature_modifiers = {
                "Dwarven Resilience": [{ damage: "Poison", reduction: 10 }]
            };

            // Conditions that add/change resistances
            const condition_modifiers = {
                "Rage": [
                    { damage: "Slashing", reduction: 5 },
                    { damage: "Bludgeoning", reduction: 5 },
                    { damage: "Piercing", reduction: 5 }
                ]
            };

            // Default resistance values
            let resistances = {
                "Normal": {type:"default", reduction:0},
                "Nonsilver": {type:"default", reduction:0},
                "Slashing": {type:"default", reduction:0},
                "Piercing": {type:"default", reduction:0},
                "Bludgeoning": {type:"default", reduction:0},
                "Fire": {type:"default", reduction:0},
                "Cold": {type:"default", reduction:0},
                "Lightning": {type:"default", reduction:0},
                "Thunder": {type:"default", reduction:0},
                "Acid": {type:"default", reduction:0},
                "Poison": {type:"default", reduction:0},
                "Psychic": {type:"default", reduction:0},
                "Radiant": {type:"default", reduction:0},
                "Necrotic": {type:"default", reduction:0},
                "Force": {type:"default", reduction:0},
            };

            // Type Priority
            const type_priority = {
                heals: 4,
                immunity: 3,
                weakness: 2,
                default: 1
            }

            // Apply Feature Modifiers
            for (const [feature, modifiers] of Object.entries(feature_modifiers)) {
                if (this.has_feature(feature)) {
                    modifiers.forEach(modifier => {
                        const damage = modifier.damage
                        const new_reduction = modifier.reduction || 0
                        const new_type = modifier.type || "default"
                
                        if (type_priority[new_type] > type_priority[resistances[damage].type]) {
                            resistances[damage].type = new_type;
                        }
                        if (new_reduction > resistances[damage].reduction) {
                            resistances[damage].reduction = new_reduction;
                        }
                    });
                }
            }
        
            // Apply Condition Modifiers
            for (const [condition, modifiers] of Object.entries(condition_modifiers)) {
                if (this.has_condition(condition)) {
                    modifiers.forEach(modifier => {
                        const damage = modifier.damage
                        const new_reduction = modifier.reduction || 0
                        const new_type = modifier.type || "default"
                
                        if (type_priority[new_type] > type_priority[resistances[damage].type]) {
                            resistances[damage].type = new_type;
                        }
                        if (new_reduction > resistances[damage].reduction) {
                            resistances[damage].reduction = new_reduction;
                        }
                    });
                }
            }
            
            return resistances;
        }
        

        get skills() {
            let skills = {
                // Strength-based skills
                "Athletics": this.attr_bonus.strength,
                "Intimidation": Math.max(this.attr_bonus.charisma, this.attr_bonus.strength),
            
                // Dexterity-based skills
                "Acrobatics": this.attr_bonus.dexterity,
                "Sleight of Hand": this.attr_bonus.dexterity,
                "Stealth": this.attr_bonus.dexterity,
            
                // Wisdom-based skills
                "Animal Handling": this.attr_bonus.wisdom,
                "Insight": this.attr_bonus.wisdom,
                "Medicine": this.attr_bonus.wisdom,
                "Perception": this.attr_bonus.wisdom,
                "Survival": this.attr_bonus.wisdom,
            
                // Intelligence-based skills
                "Arcana": this.attr_bonus.intelligence,
                "History": this.attr_bonus.intelligence,
                "Investigation": this.attr_bonus.intelligence,
                "Nature": this.attr_bonus.intelligence,
                "Religion": this.attr_bonus.intelligence,
            
                // Charisma-based skills
                "Deception": this.attr_bonus.charisma,
                "Performance": this.attr_bonus.charisma,
                "Persuasion": this.attr_bonus.charisma
            };

            // Apply Proficiency Bonus
            for (const skill in skills) {
                skills[skill] += (this.get_proficiency_level(skill) + 1) * 2
            }
            
            return skills
        }

        // Armor class is determined by 10 + dexterity modifier
        get armor_class() {
            return 10 + this.attr_bonus.dexterity;
        }



        //=====================================================================================================
        // Setter methods
        //=====================================================================================================

        set name(name) {
            this.#name = name;
            this.save();
            log(this.#name + " updated their name.");
        }

        set type(type) {
            this.#type = type;
            this.save();
            log(this.#name + " type set to " + type + ".");
        }

        set race(race) {
            this.#race = race;
            this.save();
            log(this.#name + " race set to " + race + ".");
        }

        set health(health) {
            if (isNaN(Number(health))) { return }
            let clampedHealth = Math.max(Math.min(health, this.max_health), 0)

            this.#health = clampedHealth;
            this.save();
        }

        // Set individual attributes, checking validity (range 1-30)
        set_attribute(attribute, value) {
            value = Number(value);

            let validAttributes = ["strength", "dexterity", "constitution", "wisdom", "intelligence", "charisma"];

            if (!validAttributes.includes(attribute) || value < 1 || value > 30) {return}

            this.#attributes[attribute] = value;
            this.save();
            log(this.#name + " " + attribute + " set to " + value + ".");
        }

        set_condition(condition, value) {
            value = Number(value)
            if (value >= 1) {
                this.#conditions[condition] = value;
                log(this.#name + " received " + condition + " for " + value + " rounds.");
            } else if (value == 0) {
                delete this.#conditions[condition]
                log(this.#name + " lost the condition " + condition + ".");
            }
            this.save()
        }

        has_condition(name) {
            return name in this.#conditions
        }



        //=====================================================================================================
        // Health management
        //=====================================================================================================

        // Receive damage based on resistance type
        receive_damage(value, type) {
            if (value <= 0) {return}
            if (typeof type != "string") {return}

            const resistance = this.resistances[type];
            let damage = 0;

            // Calculate damage based on resistance
            switch (resistance.type) {
                case "immunity":
                    damage = 0;
                    break;
                case "vulnerability":
                    damage = value * 2;
                    break;
                case "heals":
                    this.receive_healing(value)
                    return
                default:
                    damage = Math.max(value - resistance.reduction, 0);
                    break;
            }

            this.health = this.health - damage;
            log(this.#name + " received " + damage + " " + type + " damage.");
        }

        // Receive healing
        receive_healing(value) {
            this.health = this.health + value
            log(this.#name + " received " + value + " points of healing.");
        }



        //=====================================================================================================
        // Feature management
        //=====================================================================================================

        // Add a feature to the creature (checking feature type and duplication)
        add_feature(type, name) {
            let validTypes = [
                "racial", "feat",
                "barbarian", "bard", "cleric", "druid", "fighter", "monk",
                "paladin", "ranger", "rogue", "sorcerer", "warlock", "wizard"
            ];
            if (!validTypes.includes(type)) {
                log(this.#name + " attempted to receive the feature " + name + ", but failed due to invalid type '" + type + "'.");
                return;
            }
            if (this.#features[type].includes(name)) {
                log(this.#name + " attempted to receive the " + type + " feature " + name + ", but failed because they already have it.");
                return;
            }

            this.#features.all.push(name);
            this.#features[type].push(name);
            this.save();
            log(this.#name + " received the " + type + " feature " + name + ".");
        }

        add_feature_list(type, name_list) {
            let i = 0
            while (i < name_list.length) {
                this.add_feature(type,name_list[i])
                i += 1
            }
        }

        // Remove a feature from the creature
        remove_feature(type, name) {
            let validTypes = [
                "racial", "feat",
                "barbarian", "bard", "cleric", "druid", "fighter", "monk",
                "paladin", "ranger", "rogue", "sorcerer", "warlock", "wizard"
            ];
            if (!validTypes.includes(type)) { return; }

            // Removes only one instance from ALL in case gained from multiple classes  
            const index = this.#features.all.indexOf(name); if (index !== -1) { this.#features.all.splice(index, 1);}
            
            this.#features[type] = this.#features[type].filter(value => value != name);

            this.save();
            log(this.#name + " lost the " + type + " feature " + name + ".");
        }

        // Check if the creature has a specific feature
        has_feature(name) {
            return this.#features.all.includes(name);
        }



        //=====================================================================================================
        // Proficiency management
        //=====================================================================================================

        // Add a proficiency to the creature
        set_proficiency(name, level, highest=false) {
            if (isNaN(Number(level))) {
                log("Invalid number when setting proficiency: "+name+" as level: "+level)
                return 
            }

            if(highest && this.proficiencies[name]) {
                this.proficiencies[name] = Math.max(this.get_proficiency_level(name), level)
            }

            this.proficiencies[name] = level
            log(this.#name + " received the proficiency " + name + ".");
            
            this.save()
        }

        // Remove a proficiency from the creature
        remove_proficiency(name) {
            if (this.proficiencies[name]) {
                delete this.proficiencies[name]
            }

            this.save()
        }

        // Get level of proficiency
        get_proficiency_level(name) {
            if (this.proficiencies[name]) {
                return this.proficiencies[name]
            }
            return -1
        }



        //=====================================================================================================
        // Instance management
        //=====================================================================================================

        constructor(id, reset) {
            super(id)
            let has_property_object = String(this.token.getProperty("object")) != "null";

            // Reset if no previous data or if reset flag is true
            if (!has_property_object || reset) {
                this.#name = this.token.getName();
                log(this.#name + " was reset.");
                this.save();
            }
            else {
                try {
                    this.load();
                }
                catch {
                    this.#name = this.token.getName();
                    log(this.#name + " failed to load and was reset.");
                    this.save();
                }
            }
        }

        // Create character, by attributing basic information, features and proficiencies
        create(name, type, race, str, dex, con, wis, int, cha) {

            // Get race information
            const race_data = database.get_race(race)
            

            // Set basic information
            this.name = name, 
            this.type = type, 
            this.race = race;


            // Add features
            this.add_feature_list("racial", race_data.features)


            // Add proficiencies
            for (const proficiency of race_data.proficiencies) {
                const name = proficiency["name"]
                const level = proficiency["level"]

                this.set_proficiency(name, level, true)
            }


            // Ability Scores
            const scores = race_data.ability_scores;
            const baseScores = { 
                strength: str, dexterity: dex, constitution: con, 
                wisdom: wis, intelligence: int, charisma: cha 
            };
            for (const [attribute, baseValue] of Object.entries(baseScores)) {
                const totalValue = Number(scores[attribute]) + Number(baseValue);
                this.set_attribute(attribute, totalValue);
            }

            // Fill health
            this.health = this.max_health

            this.save()
        }



        //=====================================================================================================
        // MapTool sync management
        //=====================================================================================================

        load() {
            let object = JSON.parse(this.token.getProperty("object"));

            // Check for undefined values and raise an error
            const keysToCheck = [
                "name", "type", "race", "attributes", "speed", "health",
                "resources", "features", "spells",
                "conditions", "equipment", "inventory"
            ];

            for (const key of keysToCheck) {
                if (object[key] === undefined) {
                    throw new Error(`Property "${key}" is undefined in the loaded object.`);
                }
            }

            this.#name = object.name;
            this.#type = object.type;
            this.#race = object.race;
            this.#attributes = object.attributes;
            this.#speed = object.speed;
            this.#health = object.health
            this.#resources = object.resources;
            this.#features = object.features;
            this.#proficiencies = object.proficiencies;
            this.#spells = object.spells;
            this.#conditions = object.conditions;
            this.#equipment = object.equipment;
            this.#inventory = object.inventory;

            this.token.setProperty("class", "Creature");
        }

        save() {
            let object = {
                name: this.#name,
                type: this.#type,
                race: this.#race,
                attributes: this.#attributes,
                speed: this.#speed,
                health: this.#health,
                resources: this.#resources,
                features: this.#features,
                proficiencies: this.#proficiencies,
                spells: this.#spells,
                conditions: this.#conditions,
                equipment: this.#equipment,
                inventory: this.#inventory
            };
            
            
            this.token.setName(this.#name);
            this.token.setProperty("object", JSON.stringify(object));
            this.token.setProperty("class", "Creature");
        }

        //=====================================================================================================
    }


} catch (e) {
    MapTool.chat.broadcast("" + e + "\n" + e.stack);
}
