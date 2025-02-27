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
        #max_stack
        #properties

        // Equipment
        #bonus_armor_class
        #conditions

        // Weapon
        #damage
        #recovery

        // Armor
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
        get max_stack() { return this.#max_stack }
        get properties() { return this.#properties; }


        get bonus_armor_class() { return this.#bonus_armor_class; }
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
            max_stack = 20,
            properties = [],

            // Equipment  
            bonus_armor_class = 0,
            conditions = [],

            // Weapon
            damage = [
                {
                    die_ammount: 1,
                    die_size: 4,
                    damage_type: "Piercing"
                }
            ],
            recovery = 0,

            // Armor
            base_armor_class = 0,
        }) {

            // Validate Rarity
            if ( ! [
                "common", "uncommon", "rare", "very rare", "legendary"
            ].includes(rarity)) { return }

            // Equipment
            if (type != "equipment") {
                bonus_armor_class = 0
                conditions = []
                damage = []
                recovery = 0
                base_armor_class = 0
            } else {
                stackable = false
                max_stack = 1
            }
            
            // Weapon
            if (subtype != "weapon") {damage = []; recovery = 0}

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
            this.#max_stack = max_stack;
            this.#properties = properties;
            this.#bonus_armor_class = bonus_armor_class;
            this.#conditions = conditions;
            this.#damage = damage;
            this.#recovery = recovery;
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
                max_stack: this.#max_stack,
                properties: this.#properties,
                bonus_armor_class: this.#bonus_armor_class,
                conditions: this.#conditions,
                damage: this.#damage,
                recovery: this.#recovery,
                base_armor_class: this.#base_armor_class,
            };
        }

        //=====================================================================================================
    }


} catch (e) {
    MapTool.chat.broadcast("" + e + "\n" + e.stack);
}
