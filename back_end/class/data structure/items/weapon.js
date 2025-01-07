"use strict";
try {

    var Weapon = class extends Equipment {

        //=====================================================================================================
        // Feature parameters
        //=====================================================================================================

        #damage



        //=====================================================================================================
        // Getter methods
        //=====================================================================================================

        get damage () { return this.#damage }



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
            damage = [{
                "ammount": 1,
                "size": 4,
                "type": "piercing"
            }]
        ) {
            super(
                name,
                image,
                "weapon",
                description,
                weight, 
                rarity, 
                price, 
                properties, 
                bonus, 
                conditions
            )

            this.#damage = damage
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
                "damage": this.damage
            };
        }

        //=====================================================================================================
    }


} catch (e) {
    MapTool.chat.broadcast("" + e + "\n" + e.stack);
}
