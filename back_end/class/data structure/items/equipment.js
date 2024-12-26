"use strict";
try {

    var Equipment = class extends Item {

        //=====================================================================================================
        // Feature parameters
        //=====================================================================================================

        #bonus
        #conditions



        //=====================================================================================================
        // Getter methods
        //=====================================================================================================
        
        get bonus () {return this.#bonus}
        get conditions () {return this.#conditions}



        //=====================================================================================================
        // Instance management
        //=====================================================================================================

        constructor(
            name,
            image,
            subtype, 
            weight, 
            rarity, 
            price, 
            properties, 
            bonus = {}, 
            conditions = []
        ) {
            super(
                name,
                image,
                "equipment", // Type
                subtype,
                weight, 
                rarity, 
                price, 
                false, // Stackable
                true, // Equippable
                properties
            )
            
            this.#bonus = bonus
            this.#conditions = conditions

        }

        object() {
            return {
                "name": this.name,
                "image": this.image,
                "type": this.type,
                "subtype": this.subtype,
                "weight": this.weight,
                "rarity": this.rarity,
                "price": this.price,
                "stackable": this.stackable,
                "equippable": this.equippable,
                "properties": this.properties,
                "bonus": this.#bonus,
                "conditions": this.#conditions
            };
        }

        //=====================================================================================================
    }


} catch (e) {
    MapTool.chat.broadcast("" + e + "\n" + e.stack);
}
