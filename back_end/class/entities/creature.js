"use strict";
try {

    var Creature = class extends Entity {

        //=====================================================================================================
        // Default Parameters
        //=====================================================================================================

        #name = "unnamed"
        #type = ""
        #race = ""
        #ability_scores = {
            "strength": 10, "dexterity": 10, "constitution": 10,
            "wisdom": 10, "intelligence": 10, "charisma": 10,
        }
        #health = 10
        #speed = {
            "walk":30,
            "climb":15,
            "swim":15,
            "fly":0,
            "burrow":0,
        }
        #resources = {
            "mana": {
                "current": 0,
                "maximum": 0
            },
        }
        #features = {
            "all": [], "racial": [], "feat": [],
            "barbarian": [], "bard": [], "cleric": [],
            "druid": [], "fighter": [], "monk": [],
            "paladin": [], "ranger": [], "rogue": [],
            "sorcerer": [], "warlock": [], "wizard": []
        }
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
        }
        #conditions = {}
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
        }
        #inventory = Array.from({ length: 16 }, () => null);


        //=====================================================================================================
        // Methods
        //=====================================================================================================

        create_character({name, type, race, ability_scores}) {

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
        // Name
        //=====================================================================================================

        get name() { return this.#name }

        set name(name) {
            this.#name = name

            this.save()

            log(this.#name + " updated their name.")
        }

        
        //=====================================================================================================
        // Type
        //=====================================================================================================
 
        get type() { return this.#type }

        set type(type) {
            this.#type = type

            this.save()

            log(this.#name + " type set to " + type + ".")
        }


        //=====================================================================================================
        // Race
        //=====================================================================================================

        get race() { return this.#race }

        set race(race) {
            // Old race information
            const old_race_data = database.get_race(this.race) || {};
            const old_ability_scores = old_race_data.ability_scores || {};
        
            // Remove old racial features
            for (const feature of this.#features.racial || []) {
                this.remove_feature("racial", feature);
            }
        
            // Remove ability score bonuses
            for (const [score, value] of Object.entries(this.ability_scores)) {
                const bonus = old_ability_scores[score] || 0;
                const total_value = Number(value) - Number(bonus);
                this.set_ability_score(score, total_value);
            }

            //=================================================================================================
        
            // New race information
            const new_race_data = database.get_race(race) || {};
        
            const features = new_race_data.features || [];
            const proficiencies = new_race_data.proficiencies || [];
            const ability_scores = new_race_data.ability_scores || {};
        
            // Add new racial features
            for (const feature of features) {
                this.add_feature("racial", feature);
            }
        
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
            this.#race = race;
        
            // Save state
            this.save();
        
            log(this.#name + " race set to " + race + ".");
        }
        
        


        //=====================================================================================================
        // Ability Scores
        //=====================================================================================================

        get ability_scores() { return this.#ability_scores }

        get score_bonus() {
            let bonus = function (score_value) {
                return Math.floor((score_value - 10) / 2);
            }

            return {
                strength: bonus(this.ability_scores.strength),
                dexterity: bonus(this.ability_scores.dexterity),
                constitution: bonus(this.ability_scores.constitution),
                wisdom: bonus(this.ability_scores.wisdom),
                intelligence: bonus(this.ability_scores.intelligence),
                charisma: bonus(this.ability_scores.charisma)
            }
        }

        set_ability_score(ability_score, value) {

            // Validating parameters
            if (isNaN(Number(value))) {return}
            if (!this.ability_scores[ability_score]) {return}

            value = Number(value)
            const min_score_value = 0, max_score_value = 30
            const clamped_value = Math.min(Math.max(value, min_score_value), max_score_value)

            this.#ability_scores[ability_score] = clamped_value

            this.save()

            log(this.#name + " " + ability_score + " set to " + clamped_value + ".")
        }


        //=====================================================================================================
        // Health
        //=====================================================================================================

        get health() { return this.#health }
        
        get max_health() {
            const level = this.level || 1
            let calculated_max_health = this.#ability_scores.constitution

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

        set health(health) {

            // Validating parameters
            if (isNaN(Number(health))) { return }
            const clampedHealth = Math.max(Math.min(health, this.max_health), 0)

            this.#health = clampedHealth;
            
            this.save();
        }

        receive_damage(value, type) {

            // Validating parameters
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

            this.health -= damage;

            log(this.#name + " received " + damage + " " + type + " damage.");
        }

        receive_healing(value) {
            this.health += value

            log(this.#name + " received " + value + " points of healing.");
        }


        //=====================================================================================================
        // Resistances
        //=====================================================================================================

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

        //=====================================================================================================
        // Armor Class
        //=====================================================================================================

        get armor_class() {
            return 10 + this.score_bonus.dexterity;
        }


        //=====================================================================================================
        // Speed
        //=====================================================================================================

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
        

        //=====================================================================================================
        // Resources
        //=====================================================================================================

        get resources() {return this.#resources}


        //=====================================================================================================
        // Features
        //=====================================================================================================

        get features() {return this.#features}

        add_feature(type, name) {

            const valid_feature_types = [
                "racial", "feat",
                "barbarian", "bard", "cleric", "druid", "fighter", "monk",
                "paladin", "ranger", "rogue", "sorcerer", "warlock", "wizard"
            ]

            if (!valid_feature_types.includes(type)) {
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

        remove_feature(type, name) {

            const valid_feature_types = [
                "racial", "feat",
                "barbarian", "bard", "cleric", "druid", "fighter", "monk",
                "paladin", "ranger", "rogue", "sorcerer", "warlock", "wizard"
            ]

            if (!valid_feature_types.includes(type)) { return; }

            // Removes only one instance from ALL in case gained from multiple classes  
            const index = this.#features.all.indexOf(name); if (index !== -1) { this.#features.all.splice(index, 1);}
            
            this.#features[type] = this.#features[type].filter(value => value != name);

            this.save();
            log(this.#name + " lost the " + type + " feature " + name + ".");
        }

        has_feature(name) {
            return this.#features.all.includes(name);
        }


        //=====================================================================================================
        // Proficiencies
        //=====================================================================================================

        get proficiencies () {return this.#proficiencies}

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

        remove_proficiency(name) {
            if (this.proficiencies[name]) {
                delete this.proficiencies[name]
            }

            this.save()
        }

        get_proficiency_level(name) {
            if (this.proficiencies[name]) {
                return this.proficiencies[name]
            }
            return -1
        }

        
        //=====================================================================================================
        // Skills
        //=====================================================================================================

        get skills() {
            let skills = {
                // Strength-based skills
                "Athletics": this.score_bonus.strength,
                "Intimidation": Math.max(this.score_bonus.charisma, this.score_bonus.strength),
            
                // Dexterity-based skills
                "Acrobatics": this.score_bonus.dexterity,
                "Sleight of Hand": this.score_bonus.dexterity,
                "Stealth": this.score_bonus.dexterity,
            
                // Wisdom-based skills
                "Animal Handling": this.score_bonus.wisdom,
                "Insight": this.score_bonus.wisdom,
                "Medicine": this.score_bonus.wisdom,
                "Perception": this.score_bonus.wisdom,
                "Survival": this.score_bonus.wisdom,
            
                // Intelligence-based skills
                "Arcana": this.score_bonus.intelligence,
                "History": this.score_bonus.intelligence,
                "Investigation": this.score_bonus.intelligence,
                "Nature": this.score_bonus.intelligence,
                "Religion": this.score_bonus.intelligence,
            
                // Charisma-based skills
                "Deception": this.score_bonus.charisma,
                "Performance": this.score_bonus.charisma,
                "Persuasion": this.score_bonus.charisma
            };

            // Apply Proficiency Bonus
            for (const skill in skills) {
                skills[skill] += (this.get_proficiency_level(skill) + 1) * 2
            }
            
            return skills
        }


        //=====================================================================================================
        // Conditions
        //=====================================================================================================

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
        // Inventory
        //=====================================================================================================

        get inventory () {
            this.update_inventory_slots()
            return this.#inventory
        }

        update_inventory_slots() {
            while (this.#inventory.length < 18) {this.#inventory.push(null)}
        }

        receive_item(name, amount = 1) {
            this.update_inventory_slots();
        
            const item = database.get_item(name);
            const max_stack = item.stackable ? item.max_stack || 20 : 1;
        
            // First loop: Check existing stacks
            for (let i = 0; i < this.#inventory.length && amount !== 0; i++) {
                if (this.#inventory[i] && this.#inventory[i].name === name && this.#inventory[i].amount < max_stack) {
                    const available_space = max_stack - this.#inventory[i].amount;
                    const added_amount = Math.min(amount, available_space);
        
                    // Add the amount to the existing stack
                    this.#inventory[i].amount += added_amount;
                    amount -= added_amount;
                }
            }
        
            // Second loop: If there is still remainder, add to the first empty slot
            for (let i = 0; i < this.#inventory.length && amount !== 0; i++) {
                if (this.#inventory[i] === null) {
                    const stack_amount = item.stackable ? Math.min(amount, max_stack) : 1;
                    this.#inventory[i] = { name, amount: stack_amount };
                    amount -= stack_amount;
                }
            }
        
            if (amount > 0) {
                log(amount + " items were not added because the inventory is full.");
            }
        
            this.save();
        }
        
        drop_item(index, amount) {

            this.update_inventory_slots()

            const item = this.#inventory[index];
            const item_data = database.get_item(item.name)
        
            // Ensure the item exists and is valid
            if (!item || item.amount <= 0) {
                log("No item to drop at the specified index.");
                return;
            }

            amount = !amount ? item.amount : Math.min(amount, item.amount);
        
            // Handle drop of stackable item
            if (item_data.stackable) {

                // If the amount to drop is less than the current stack
                if (amount < item.amount) {
                    item.amount -= amount
                }
                // If the amount to drop is the entire stack
                else if (amount >= item.amount) {
                    this.#inventory[index] = null
                }
            }

            // Handle non-stackable items (removal of one item at a time)
            else {
                this.#inventory[index] = null;
            }
        
            this.save();
        }

        move_item(from_index, to_index, amount) {
            this.update_inventory_slots();
        
            const default_item = { name: null, amount: 0 };
        
            const from_item = this.#inventory[from_index] || default_item;
            const to_item = this.#inventory[to_index] || default_item;
        
            // Validate source item
            if (!from_item.name) {
                log("No item to move at the source index.");
                return;
            }
        
            const item_data = database.get_item(from_item.name);
            const equal_items = from_item.name === to_item.name;
        
            amount = !amount ? from_item.amount : Math.min(amount, from_item.amount);
        
            // Destination slot has a different item, or equal items that are non stackable
            if (!equal_items && to_item.name || equal_items && !item_data.stackable) {

                this.#inventory[from_index] = to_item;
                this.#inventory[to_index] = from_item;
            } 
            // Destination slot is empty
            else if (!to_item.name) {
                
                const amount_to_move = Math.min(amount, from_item.amount);
                this.#inventory[to_index] = {
                    name: from_item.name,
                    amount: amount_to_move,
                };
        
                from_item.amount -= amount_to_move;
        
                this.#inventory[from_index] = from_item.amount === 0 ? null : from_item;
            } 
            // Destination slot has the same item and can stack
            else if (equal_items && item_data.stackable) {

                const max_stack = item_data.max_stack || 20;
                const space_available = max_stack - to_item.amount;
        
                const amount_to_send = Math.min(space_available, amount);
        
                to_item.amount += amount_to_send;
                from_item.amount -= amount_to_send;
        
                this.#inventory[from_index] = from_item.amount === 0 ? null : from_item;
        
                this.#inventory[to_index] = to_item;
            }
        
            this.save();
        }

        send_item(index) {
            if (!selected().inventory) { return }

            let target_has_empty_slot = false
            for (const slot of selected().inventory) {
                if (slot == null) {target_has_empty_slot = true}
            }

            if (!target_has_empty_slot) { return }
            
            const item = this.inventory[index]

            selected().receive_item(item.name, item.amount)
            this.drop_item(index)
        }
        

        //=====================================================================================================
        // Instance
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

        //=====================================================================================================
        // MapTool sync
        //=====================================================================================================

        load() {
            let object = JSON.parse(this.token.getProperty("object"));

            // Check for undefined values and raise an error
            const keysToCheck = [
                "name", "type", "race", "ability_scores", "speed", "health",
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
            this.#ability_scores = object.ability_scores;
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
                ability_scores: this.#ability_scores,
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
    MapTool.chat.broadcast("" + e + "\n" + e.stack)
}
