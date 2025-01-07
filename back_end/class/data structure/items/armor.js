"use strict";
try {

    var Armor = class extends Equipment {

        //=====================================================================================================
        // Feature parameters
        //=====================================================================================================

        #base_armor_class



        //=====================================================================================================
        // Getter methods
        //=====================================================================================================

        get base_armor_class () { return this.#base_armor_class }



        //=====================================================================================================
        // Instance management
        //=====================================================================================================

        constructor(
            name,
            image,
            description,
            weight,
            rarity, 
            price, 
            properties, 
            bonus, 
            conditions, 
            base_armor_class
        ) {
            super(
                name,
                image,
                "armor",
                description,
                weight, 
                rarity, 
                price, 
                properties, 
                bonus, 
                conditions, 
                base_armor_class = 10
            )

            this.#base_armor_class = base_armor_class
        }

        object() {
            return {
                "name": this.name,
                "image": this.image,
                "type": this.type,
                "subtype": this.subtype,
                "description": this.description,
                "weight": this.weight,
                "rarity": this.rarity,
                "price": this.price,
                "stackable": this.stackable,
                "equippable": this.equippable,
                "properties": this.properties,
                "bonus": this.bonus,
                "conditions": this.conditions,
                "ac": this.base_armor_class
            };
        }

        //=====================================================================================================
    }


} catch (e) {
    MapTool.chat.broadcast("" + e + "\n" + e.stack);
}
