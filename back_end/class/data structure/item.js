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
        #bonus
        #conditions
        #damage
        #base_armor_class



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
        get bonus() { return this.#bonus; }
        get conditions() { return this.#conditions; }
        get damage() { return this.#damage; }
        get base_armor_class() { return this.#base_armor_class; }



        //=====================================================================================================
        // Instance management
        //=====================================================================================================

        constructor({
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
            properties = [],
            bonus = {},
            conditions = [],
            damage = [],
            base_armor_class = 0,
        }) {

            // Validate Rarity
            if ( ! [
                "common", "uncommon", "rare", "very rare", "legendary"
            ].includes(rarity)) { return }

            // Equipment
            if (type != "equipment") {
                bonus = {}
                conditions = []
                damage = []
                base_armor_class = 0
            }
            
            // Weapon
            if (subtype != "weapon") {damage = []}

            // Armor
            if (subtype != "armor") {base_armor_class = 0}

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
            this.#bonus = bonus;
            this.#conditions = conditions;
            this.#damage = damage;
            this.#base_armor_class = base_armor_class;

        }

        object() {
            return {
                name: this.#name,
                image: this.#image,
                type: this.#type,
                subtype: this.#subtype,
                description: this.#description,
                weight: this.#weight,
                rarity: this.#rarity,
                price: this.#price,
                stackable: this.#stackable,
                equippable: this.#equippable,
                properties: this.#properties,
                bonus: this.#bonus,
                conditions: this.#conditions,
                damage: this.#damage,
                base_armor_class: this.#base_armor_class,
            };
        }

        //=====================================================================================================
    }


} catch (e) {
    MapTool.chat.broadcast("" + e + "\n" + e.stack);
}
