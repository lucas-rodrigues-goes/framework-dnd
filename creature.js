"use strict";
try {

    class Creature {

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
            this.load()
        }

        // Getters
        get name () {return this.#name}
        get type() {return this.#type}
        get race() {return this.#race}

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
        }
        save () {
            let token = MapTool.tokens.getTokenByID(this.id)
            let object = JSON.parse(token.getProperty("object"))

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
        reset (name, type, race) {
            this.#name = name
            this.#type = type
            this.#race = race
            this.#attributes = {
                "strength":10,
                "dexterity":10,
                "constitution":10,
                "wisdom":10,
                "intelligence":10,
                "charisma":10
            };
            this.#resources = {
                "health":this.#attributes.constitution,
            };
            this.#resistances = {};
            this.#features = {};

            this.save()
        }
        
    }
    
    let creature = new Creature("1097F232224B497486E8D53C4A3AC6FD")
    creature.reset("Pedro","Humanoid","Elf")

} catch(e) {
    MapTool.chat.broadcast(""+e+"\n"+e.stack);
}