"use strict";
try {

    var Item = class {

        //=====================================================================================================
        // Feature parameters
        //=====================================================================================================

        #name = ""
        #type = ""
        #weight = 0
        #rarity = "common"
        #price = 0
        #stackable = true
        #equipable = false
        #properties = []



        //=====================================================================================================
        // Getter methods
        //=====================================================================================================

        get name() { return this.#name; }
        get type() { return this.#type; }
        get weight() { return this.#weight; }
        get rarity() { return this.#rarity; }
        get price() { return this.#price; }
        get stackable() { return this.#stackable; }
        get equipable() { return this.#equipable; }
        get properties() { return this.#properties; }


        //=====================================================================================================
        // Setter methods
        //=====================================================================================================

        set name(name) {
            if (typeof name != "string") { return; }
            this.#name = name;
        }

        

        //=====================================================================================================
        // Instance management
        //=====================================================================================================

        constructor(name, type, weight, rarity, price, stackable, equipable, properties) {
            
            this.#name = name;
            this.#type = type;
            this.#weight = weight;
            this.#rarity = rarity;
            this.#price = price;
            this.#stackable = stackable;
            this.#equipable = equipable;
            this.#properties = properties;

        }

        object() {
            return {
                "name": this.#name,
                "type": this.#type,
                "weight": this.#weight,
                "rarity": this.#rarity,
                "price": this.#price,
                "stackable": this.#stackable,
                "equipable": this.#equipable,
                "properties": this.#properties
            };
        }

        //=====================================================================================================
    }


} catch (e) {
    MapTool.chat.broadcast("" + e + "\n" + e.stack);
}
