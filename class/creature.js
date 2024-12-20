"use strict";
try {

    var log = function (string) {
        MapTool.chat.broadcast(string)
    }

    var Creature = class {

        //----------------------------------------------------------------------------------------------//
        // Init
        id;
        #name="unnamed";
        #type="";
        #race="";
        #attributes = {
            "strength":10,
            "dexterity":10,
            "constitution":10,
            "wisdom":10,
            "intelligence":10,
            "charisma":10
        };
        #resources = {
            "health":{
                "current":this.#attributes.constitution,
                "maximum":this.#attributes.constitution
            },
        };
        #resistances = {
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
        #spells = {
            "bard": {
                "known":{
                    "cantrip":[],
                    "1st":[], "2nd":[], "3rd":[],
                    "4th":[], "5th":[], "6th":[],
                    "7th":[], "8th":[], "9th":[]
                }
            },
            "cleric": {
                "always_prepared":[],
                "memorized":[]
            },
            "druid": {
                "always_prepared":[],
                "memorized":[]
            },
            "paladin": {
                "always_prepared":[],
                "memorized":[]
            },
            "ranger": {
                "known":{
                    "1st":[],
                    "2nd":[], "3rd":[],
                    "4th":[], "5th":[]
                }
            },
            "sorcerer": {
                "known":{
                    "cantrip":[],
                    "1st":[], "2nd":[], "3rd":[],
                    "4th":[], "5th":[], "6th":[],
                    "7th":[], "8th":[], "9th":[]
                }
            },
            "warlock": {
                "known":{
                    "cantrip":[],
                    "1st":[], "2nd":[], "3rd":[],
                    "4th":[], "5th":[], "6th":[],
                    "7th":[], "8th":[], "9th":[]
                }
            },
            "wizard": {
                "known":{
                    "cantrip":[],
                    "1st":[], "2nd":[], "3rd":[],
                    "4th":[], "5th":[], "6th":[],
                    "7th":[], "8th":[], "9th":[]
                },
                "always_prepared":[],
                "memorized":[]
            }
        }
        #equipment = {
            "head":"",
            "body":"",
            "gloves":"",
            "feet":"",
            "amulet":"",
            "right ring":"",
            "left ring":"",
            "cape":"",
            "backpack":"",
            "primary main hand":"",
            "primary off hand":"",
            "secondary main hand":"",
            "secondary off hand":""
        };
        #inventory = [];

        constructor(id, reset){
            this.id = id
            let token = MapTool.tokens.getTokenByID(this.id)
            let has_property_object = String(token.getProperty("object")) != "null"

            if (!has_property_object || reset) {
                // Loads default values if none are present or reset requested
                this.#name = token.getName()
                log(this.#name+" was reset.")
                this.save()
            }
            else {
                try { // Attempts to load data from token
                    this.load()
                }
                catch { // If it fails performs reset
                    this.#name = token.getName()
                    log(this.#name+" failed to load and was reset.")
                    this.save()
                }
            }
        }


        //----------------------------------------------------------------------------------------------//
        // Getters
        get name () {return this.#name}
        get type() {return this.#type}
        get race() {return this.#race}
        get attributes() {return this.#attributes}
        get attr_bonus() {
            let calculate_bonus = function (attribute_value) {
                return Math.floor((attribute_value - 10) / 2)
            }
 
            return {
                "strength":calculate_bonus(this.#attributes.strength),
                "dexterity":calculate_bonus(this.#attributes.dexterity),
                "constitution":calculate_bonus(this.#attributes.constitution),
                "wisdom":calculate_bonus(this.#attributes.wisdom),
                "intelligence":calculate_bonus(this.#attributes.intelligence),
                "charisma":calculate_bonus(this.#attributes.charisma)
            }
        }
        get armor_class() {
            return 10 + this.attr_bonus.dexterity
        }
        get resources() {return this.#resources}
        get resistances() {return this.#resistances}
        get features() {return this.#features}
        get spells() {return this.#spells}
        get equipment() {return this.#equipment}
        get inventory() {return this.#inventory}


        //----------------------------------------------------------------------------------------------//
        // Setters
        set name (name) {
            if (typeof name != "string") { return }

            this.#name = name
            this.save()
            log(this.#name+" updated their name.")
        }
        set type (type) {
            if (typeof type != "string") { return }

            this.#type = type
            this.save()
            log(this.#name+" type set to "+type+".")
        }
        set race (race) {
            if (typeof race != "string") { return }

            this.#race = race
            this.save()
            log(this.#name+" race set to "+race+".")
        }
        set_attribute (attribute, value) {
            value = Number(value)
            let validAttributes = ["strength","dexterity","constitution","wisdom","intelligence","charisma"]
            if (!validAttributes.includes(attribute) || value < 1 || value > 30) {return}

            this.#attributes[attribute] = value
            this.save()
            log(this.#name+" "+attribute+" set to "+value+".")
        }
        add_feature(type, name) {
            let validTypes = [
                "racial", "feat",
                "barbarian", "bard", "cleric", "druid", "fighter", "monk",
                "paladin", "ranger", "rogue", "sorcerer", "warlock", "wizard"]
            if (!validTypes.includes(type)) {
                log(this.#name+" attempted to receive the feature "+name+", but failed due to invalid type '"+type+"'.")
                return
            }
            if (this.#features[type].includes(name)) {
                log(this.#name+" attempted to receive the "+type+" feature "+name+", but failed because they already have it.")
                return
            }

            this.#features.all.push(name)
            this.#features[type].push(name)
            this.save()
            log(this.#name+" received the "+type+" feature "+name+".")
        }
        remove_feature(type, name) {
            let validTypes = [
                "racial", "feat",
                "barbarian", "bard", "cleric", "druid", "fighter", "monk",
                "paladin", "ranger", "rogue", "sorcerer", "warlock", "wizard"]
            if (!validTypes.includes(type)) {return}

            this.#features.all = this.#features.all.filter(value => value != name)
            this.#features[type] = this.#features[type].filter(value => value != name)
            this.save()
            log(this.#name+" lost the "+type+" feature "+name+".")
        }


        //----------------------------------------------------------------------------------------------//
        // Sync with token
        load () {
            let token = MapTool.tokens.getTokenByID(this.id)
            let object = JSON.parse(token.getProperty("object"))

            this.#name = object.name
            this.#type = object.type
            this.#race = object.race
            this.#attributes = object.attributes
            this.#resources = object.resources
            this.#resistances = object.resistances
            this.#features = object.features
            this.#spells = object.spells
            this.#equipment = object.equipment
            this.#inventory = object.inventory

            //log(this.#name+" successfully loaded.")
        }
        save () {
            let token = MapTool.tokens.getTokenByID(this.id)
            let object = {
                "name":this.#name,
                "type":this.#type,
                "race":this.#race,
                "attributes":this.#attributes,
                "resources":this.#resources,
                "resistances":this.#resistances,
                "features":this.#features,
                "spells":this.#spells,
                "equipment":this.#equipment,
                "inventory":this.#inventory,
            }

            token.setName(this.#name)
            token.setProperty("object", JSON.stringify(object))
            //log(this.#name+" successfully saved.")
        }


        //----------------------------------------------------------------------------------------------//
        // Functions
        create(name, type, race, str, dex, con, wis, int, cha) {

            str = Number(str), dex = Number(dex), con = Number(con)
            wis = Number(wis), int = Number(int), cha = Number(cha)

            switch (race) {
                case "Hill Dwarf":
                    con += 2, wis += 1
                    break
                case "Mountain Dwarf":
                    con += 2, str += 2
                    break
                case "High Elf":
                    dex += 2, int += 1
                    break
                case "Wood Elf":
                    dex += 2, wis += 1
                    break
                case "Drow":
                    dex += 2, cha += 1
                    break
                case "Lightfoot Halfling":
                    dex += 2, cha += 1
                    break
                case "Stout Halfling":
                    dex += 2, con += 1
                    break
                case "Half-Orc":
                    str += 2, con += 1
                    break
                case "Human":
                    str += 1, dex += 1, con += 1, wis += 1, int += 1, cha += 1
                    break
                case "Dragonborn":
                    str += 2, cha += 1
                    break
                case "Tiefling":
                    int += 1, cha += 2
                    break
                case "Half-Elf":
                    dex += 1, int += 1, wis += 1, cha += 1
                    break
                case "Gnome":
                    int += 2
                    break
                case "Rock Gnome":
                    int += 2, con += 1
                    break
                case "Forest Gnome":
                    int += 2, dex += 1
                    break
                default:
                    break
            }

            this.name = name, this.type = type, this.race = race;

            this.set_attribute("strength",str); this.set_attribute("dexterity",dex);
            this.set_attribute("constitution",con); this.set_attribute("wisdom",wis);
            this.set_attribute("intelligence",int); this.set_attribute("charisma",cha);
        }

        receive_damage(value, type) {
            let health = this.#resources.health
            let resistance = this.#resistances[type]
            let damage = 0

            if (value <= 0) {return}
            
            switch (resistance) {
                case "immunity":
                    damage = 0
                    break
                case "vulnerability":
                    damage = value * 2
                    break
                case "heals":
                    damage = value * -1
                    break
                default:
                    damage = Math.max(value - resistance, 0)
                    break
            }

            health.current = health.current - damage
            health.current = Math.max(0, health.current)
            health.current = Math.min(health.current, health.maximum)
            this.save()
            log(this.#name+" received "+damage+" "+type+" damage.")
        }

        receive_healing(value) {
            let health = this.#resources.health
            let is_undead = this.#type == "Undead"

            if (is_undead) {return}
            
            health.current = health.current + value
            health.current = Math.min(health.current, health.maximum)
            this.save()
            log(this.#name+" received "+value+" points of healing.")
        }

        has_feature(name) {
            return this.#features.all.includes(name)
        }
    }

} catch(e) {
    MapTool.chat.broadcast(""+e+"\n"+e.stack);
}