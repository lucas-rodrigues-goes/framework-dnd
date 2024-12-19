"use strict";
try {

    var Creature = class {

        // Init

        id;
        #name;
        #type;
        #race;
        #attributes = {}
        #resources = {}
        #resistances = {}
        #features = {}

        constructor(id){
            this.id = id
            let token = MapTool.tokens.getTokenByID(this.id)

            if (token.getProperty("object") != "empty") {
                this.load()
            }
        }

        // Getters
        get name () {return this.#name}
        get type() {return this.#type}
        get race() {return this.#race}
        get attributes() {return this.#attributes}
        get armor_class() {
            return 10 + this.attribute_bonus.dexterity
        }
        get attribute_bonus() {
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

        // Setters
        set name (name) {
            if (typeof name != "string") { return }
            this.#name = name
            this.save()
        }
        set type (type) {
            if (typeof type != "string") { return }
            this.#type = type
            this.save()
        }
        set race (race) {
            if (typeof race != "string") { return }
            this.#race = race
            this.save()
        }
        set_attribute (attribute, value) {
            let validAttributes = ["strength","dexterity","constitution","wisdom","intelligence","charisma"]

            if (validAttributes.includes(attribute) && value > 0 && value <= 20) {
                this.#attributes[attribute] = value
                this.save()
            }
        }

        // Sync with token
        reset (name, type, race) {
            let token = MapTool.tokens.getTokenByID(this.id)
            let object = {
                "name":name,
                "type":type,
                "race":race,
                "attributes":{
                    "strength":10,
                    "dexterity":10,
                    "constitution":10,
                    "wisdom":10,
                    "intelligence":10,
                    "charisma":10
                },
                "resources": {
                    "health":10,
                },
                "resistances":{},
                "features":{}
            }

            token.setName(name)
            token.setProperty("object", JSON.stringify(object))
            this.load()
        }
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
        }
        save () {
            let token = MapTool.tokens.getTokenByID(this.id)
            let object = {}

            object.name = this.#name
            object.type = this.#type
            object.race = this.#race
            object.attributes = this.#attributes;
            object.resources = this.#resources;
            object.resistances = this.#resistances;
            object.features = this.#features;

            token.setName(this.#name)
            token.setProperty("object", JSON.stringify(object))
        }
        
    }


} catch(e) {
    MapTool.chat.broadcast(""+e+"\n"+e.stack);
}