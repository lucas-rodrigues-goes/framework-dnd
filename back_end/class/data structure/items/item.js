"use strict";
try {

    var Item = class {

        //=====================================================================================================
        // Feature parameters
        //=====================================================================================================

        #name
        #image
        #type
        #subtype
        #description
        #weight
        #rarity
        #price
        #stackable
        #equippable
        #properties



        //=====================================================================================================
        // Getter methods
        //=====================================================================================================

        get name() { return this.#name; }
        get image() { return this.#image }
        get subtype () {return this.#subtype}
        get description () {return this.#description}
        get type() { return this.#type; }
        get weight() { return this.#weight; }
        get rarity() { return this.#rarity; }
        get price() { return this.#price; }
        get stackable() { return this.#stackable; }
        get equippable() { return this.#equippable; }
        get properties() { return this.#properties; }



        //=====================================================================================================
        // Instance management
        //=====================================================================================================

        constructor(
            name,
            image,
            type,
            subtype,
            description="",
            weight = 1,
            rarity = "common",
            price = 0,
            stackable = true,
            equippable = false,
            properties = []
        ) {

            // Validate Rarity
            if ( ! [
                "common", "uncommon", "rare", "very rare", "legendary"
            ].includes(rarity)) { return }

            this.#name = name;
            this.#image = image;
            this.#type = type;
            this.#subtype = subtype
            this.#description = description
            this.#weight = weight;
            this.#rarity = rarity;
            this.#price = price;
            this.#stackable = stackable;
            this.#equippable = equippable;
            this.#properties = properties;

        }

        object() {
            return {
                "name": this.#name,
                "image": this.#image,
                "type": this.#type,
                "subtype": this.#subtype,
                "description": this.#description,
                "weight": this.#weight,
                "rarity": this.#rarity,
                "price": this.#price,
                "stackable": this.#stackable,
                "equippable": this.#equippable,
                "properties": this.#properties
            };
        }

        //=====================================================================================================
    }


} catch (e) {
    MapTool.chat.broadcast("" + e + "\n" + e.stack);
}
