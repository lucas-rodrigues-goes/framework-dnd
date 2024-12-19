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
        #features = {};
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
            if (!validAttributes.includes(attribute) || value <= 0 || value > 20) {return}

            this.#attributes[attribute] = value
            this.save()
            log(this.#name+" "+attribute+" set to "+value+".")
        }


        //----------------------------------------------------------------------------------------------//
        // Sync with token
        load () {
            let token = MapTool.tokens.getTokenByID(this.id)
            let object = JSON.parse(token.getProperty("object"))

            this.#name = object.name
            this.#type = object.type
            this.#race = object.race
            this.#attributes = object.attributes;
            this.#resources = object.resources;
            this.#resistances = object.resistances;
            this.#features = object.features;

            log(this.#name+" successfully loaded.")
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
                "equipment":this.#equipment,
                "inventory":this.#inventory,
            }

            token.setName(this.#name)
            token.setProperty("object", JSON.stringify(object))
            log(this.#name+" successfully saved.")
        }


        //----------------------------------------------------------------------------------------------//
        // Functions
        create(name, type, race, str, dex, con, wis, int, cha) {
            this.name = name;
            this.type = type;
            this.race = race;
            this.set_attribute("strength",str);
            this.set_attribute("dexterity",dex);
            this.set_attribute("constitution",con);
            this.set_attribute("wisdom",wis);
            this.set_attribute("intelligence",int);
            this.set_attribute("charisma",cha);
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
    }


} catch(e) {
    MapTool.chat.broadcast(""+e+"\n"+e.stack);
}