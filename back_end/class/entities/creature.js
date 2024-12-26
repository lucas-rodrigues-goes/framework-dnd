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
            "strength": 10,
            "dexterity": 10,
            "constitution": 10,
            "wisdom": 10,
            "intelligence": 10,
            "charisma": 10,
        };
        #speed = {
            "walk":30,
            "climb":15,
            "swim":15,
            "fly":0,
            "burrow":0,
        }
        #resources = {
            "health": {
                "current": this.#attributes.constitution,
                "maximum": this.#attributes.constitution
            },
        };
        #resistances = {
            "non-magical": 0,
            "non-silvered": 0,
            "slashing": 0,
            "piercing": 0,
            "bludgeoning": 0,
            "fire": 0,
            "cold": 0,
            "lightning": 0,
            "thunder": 0,
            "acid": 0,
            "poison": 0,
            "psychic": 0,
            "radiant": 0,
            "necrotic": 0,
            "force": 0
        };
        #features = {
            "all": [],
            "racial": [],
            "feat": [],
            "barbarian": [],
            "bard": [],
            "cleric": [],
            "druid": [],
            "fighter": [],
            "monk": [],
            "paladin": [],
            "ranger": [],
            "rogue": [],
            "sorcerer": [],
            "warlock": [],
            "wizard": []
        };
        #proficiencies = {}
        #spells = {
            "bard": {
                "known": {
                    "cantrip": [],
                    "1st": [], "2nd": [], "3rd": [],
                    "4th": [], "5th": [], "6th": [],
                    "7th": [], "8th": [], "9th": []
                }
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
                "known": {
                    "1st": [],
                    "2nd": [], "3rd": [],
                    "4th": [], "5th": []
                }
            },
            "sorcerer": {
                "known": {
                    "cantrip": [],
                    "1st": [], "2nd": [], "3rd": [],
                    "4th": [], "5th": [], "6th": [],
                    "7th": [], "8th": [], "9th": []
                }
            },
            "warlock": {
                "known": {
                    "cantrip": [],
                    "1st": [], "2nd": [], "3rd": [],
                    "4th": [], "5th": [], "6th": [],
                    "7th": [], "8th": [], "9th": []
                }
            },
            "wizard": {
                "known": {
                    "cantrip": [],
                    "1st": [], "2nd": [], "3rd": [],
                    "4th": [], "5th": [], "6th": [],
                    "7th": [], "8th": [], "9th": []
                },
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
        get resources() { return this.#resources; }
        get resistances() { return this.#resistances; }
        get features() { return this.#features; }
        get proficiencies() { return this.#proficiencies; }
        get spells() { return this.#spells; }
        get conditions() {return this.#conditions}
        get equipment() { return this.#equipment; }
        get inventory() { return this.#inventory; }

        // Calculate the attribute bonuses based on the attribute values
        get attr_bonus() {
            let calculate_bonus = function (attribute_value) {
                return Math.floor((attribute_value - 10) / 2);
            }

            return {
                "strength": calculate_bonus(this.#attributes.strength),
                "dexterity": calculate_bonus(this.#attributes.dexterity),
                "constitution": calculate_bonus(this.#attributes.constitution),
                "wisdom": calculate_bonus(this.#attributes.wisdom),
                "intelligence": calculate_bonus(this.#attributes.intelligence),
                "charisma": calculate_bonus(this.#attributes.charisma)
            }
        }

        // Armor class is determined by 10 + dexterity modifier
        get armor_class() {
            return 10 + this.attr_bonus.dexterity;
        }



        //=====================================================================================================
        // Setter methods
        //=====================================================================================================

        set name(name) {
            if (typeof name != "string") { return; }
            this.#name = name;
            this.save();
            log(this.#name + " updated their name.");
        }

        set type(type) {
            if (typeof type != "string") { return; }
            this.#type = type;
            this.save();
            log(this.#name + " type set to " + type + ".");
        }

        set race(race) {
            if (typeof race != "string") { return; }
            this.#race = race;
            this.save();
            log(this.#name + " race set to " + race + ".");
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

        set_resistance(resistance, value) {
            let validResistances = ["slashing", "piercing", "bludgeoning", "fire", "cold", "lightning", "thunder",
                "acid", "poison", "psychic", "radiant", "necrotic", "force"]
            let validValues = [0, 10, 20, 30, "immunity", "vulnerability", "heals"]

            if (!validResistances.includes(resistance)) {return}
            if (!validValues.includes(value)) {return}

            this.#resistances[resistance] = value;
            this.save()
            log(this.#name + " " + resistance + " resistance set to " + value + ".");
        }

        set_condition(condition, value) {
            value = Number(value)
            if (value >= 1) {
                this.#conditions[condition] = value;
                this.save()
                log(this.#name + " received " + condition + " for " + value + " rounds.");
            } else if (value == 0) {
                delete this.#conditions[condition]
                this.save()
                log(this.#name + " lost the condition " + condition + ".");
            }
        }



        //=====================================================================================================
        // Resource management
        //=====================================================================================================

        // Receive damage based on resistance type
        receive_damage(value, type) {
            if (value <= 0) {return}
            if (typeof type != "string") {return}

            let health = this.#resources.health;
            let resistance = this.#resistances[type];
            let damage = 0;

            // Calculate damage based on resistance
            switch (resistance) {
                case "immunity":
                    damage = 0;
                    break;
                case "vulnerability":
                    damage = value * 2;
                    break;
                case "heals":
                    damage = value * -1;
                    break;
                default:
                    damage = Math.max(value - resistance, 0);
                    break;
            }

            health.current -= damage;
            health.current = Math.max(0, health.current);
            health.current = Math.min(health.current, health.maximum);
            this.save();
            log(this.#name + " received " + damage + " " + type + " damage.");
        }

        // Receive healing
        receive_healing(value) {
            let health = this.#resources.health;
            let unhealable = ["Undead", "Construct"]


            if (unhealable.includes(this.#type)) {return}

            health.current = health.current + value;
            health.current = Math.min(health.current, health.maximum);
            this.save();
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

            this.#features.all = this.#features.all.filter(value => value != name);
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

        // Add a feature to the creature (checking feature type and duplication)
        set_proficiency(name, level) {
        }

        // Remove a feature from the creature
        remove_proficiency(name) {
        }

        // Check if the creature has a specific feature
        get_proficiency_level(name) {
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

        // Create a new creature by setting attributes, race, and type
        create(name, type, race, str, dex, con, wis, int, cha) {
            str = Number(str), dex = Number(dex), con = Number(con);
            wis = Number(wis), int = Number(int), cha = Number(cha);

            // Apply type-specific bonuses and features
            switch (type) {

                case "Undead":
                    this.set_resistance("necrotic","immunity")
                    this.set_resistance("poison", "immunity")
                    this.set_resistance("radiant", "vulnerability")
                    break;
                
                case "Construct":
                    this.set_resistance("necrotic","immunity")
                    this.set_resistance("poison", "immunity")
                    break;

                default:
                    break;
            }

            // Apply race-specific bonuses and features
            switch (race) {

                case "Hill Dwarf":
                    con += 2, wis += 1;
                    this.add_feature_list(
                        "racial", ["Dwarven Resilience", "Stonecunning", "Dwarven Toughness"]);
                    this.set_resistance("poison", 10);
                    break;

                case "Mountain Dwarf":
                    con += 2, str += 2;
                    this.add_feature_list(
                        "racial", ["Dwarven Resilience", "Stonecunning", "Dwarven Armor Training"]);
                    this.set_resistance("poison", 10);
                    break;

                case "High Elf":
                    dex += 2, int += 1;
                    this.add_feature_list(
                        "racial", ["Keen Senses", "Fey Ancestry", "Trance", "Elf Weapon Training", "Cantrip"]);
                    break;

                case "Wood Elf":
                    dex += 2, wis += 1;
                    this.add_feature_list(
                        "racial", ["Darkvision", "Keen Senses", "Fey Ancestry", "Trance", "Elf Weapon Training",
                            "Fleet of Foot", "Mask of the Wild"]);
                    break;

                case "Drow":
                    dex += 2, cha += 1;
                    this.add_feature_list(
                        "racial", ["Superior Darkvision", "Keen Senses", "Fey Ancestry", "Trance", "Drow Magic",
                            "Drow Weapon Training", "Sunlight Sensitivity"]);
                    break;

                case "Lightfoot Halfling":
                    dex += 2, cha += 1;
                    this.add_feature_list(
                        "racial", ["Lucky", "Brave", "Halfling Nimbleness", "Naturally Stealthy"]);
                    break;

                case "Stout Halfling":
                    dex += 2, con += 1;
                    this.add_feature_list(
                        "racial", ["Lucky", "Brave", "Halfling Nimbleness", "Stout Resilience"]);
                    break;

                case "Half-Orc":
                    str += 2, con += 1;
                    this.add_feature_list(
                        "racial", ["Menacing", "Relentless Endurance", "Savage Attacks"]);
                    break;

                case "Human":
                    str += 1, dex += 1, con += 1, wis += 1, int += 1, cha += 1;
                    this.add_feature_list(
                        "racial", []);
                    break;

                case "Half-Elf":
                    dex += 1, int += 1, wis += 1, cha += 1;
                    this.add_feature_list(
                        "racial", ["Fey Ancestry"]);
                    break;
                    
                case "Gnome":
                    int += 2;
                    this.add_feature_list(
                        "racial", ["Darkvision", "Gnome Cunning"]);
                    break;
                case "Rock Gnome":
                    int += 2, con += 1;
                    this.add_feature_list(
                        "racial", ["Darkvision", "Gnome Cunning", "Artificer's Lore", "Tinker"]);
                    break;

                case "Forest Gnome":
                    int += 2, dex += 1;
                    this.add_feature_list(
                        "racial", ["Darkvision", "Gnome Cunning", "Natural Illusionist", "Speak with Small Beasts"]);
                    break;

                default:
                    break;
            }

            this.name = name, this.type = type, this.race = race;

            this.set_attribute("strength", str); this.set_attribute("dexterity", dex);
            this.set_attribute("constitution", con); this.set_attribute("wisdom", wis);
            this.set_attribute("intelligence", int); this.set_attribute("charisma", cha);
        }



        //=====================================================================================================
        // MapTool sync management
        //=====================================================================================================

        load() {
            let object = JSON.parse(this.token.getProperty("object"));

            this.#name = object.name;
            this.#type = object.type;
            this.#race = object.race;
            this.#attributes = object.attributes;
            this.#resources = object.resources;
            this.#resistances = object.resistances;
            this.#features = object.features;
            this.#spells = object.spells;
            this.#conditions = object.conditions;
            this.#equipment = object.equipment;
            this.#inventory = object.inventory;
        }

        save() {
            let object = {
                "name": this.#name,
                "type": this.#type,
                "race": this.#race,
                "attributes": this.#attributes,
                "resources": this.#resources,
                "resistances": this.#resistances,
                "features": this.#features,
                "spells": this.#spells,
                "conditions": this.#conditions,
                "equipment": this.#equipment,
                "inventory": this.#inventory,
            };

            this.token.setName(this.#name);
            this.token.setProperty("object", JSON.stringify(object));
        }

        //=====================================================================================================
    }


} catch (e) {
    MapTool.chat.broadcast("" + e + "\n" + e.stack);
}
