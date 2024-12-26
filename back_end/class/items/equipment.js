"use strict";
try {

    var Equipment = class extend {

        //=====================================================================================================
        // Feature parameters
        //=====================================================================================================

        #bonus = {
            "armor class": 0,
            "all to hit": 0,
            "weapon to hit": 0,
            "spell to hit": 0,
            "spell difficulty class": 0,
            "fire": 30
        }



        //=====================================================================================================
        // Getter methods
        //=====================================================================================================

        get bonus () {return this.#bonus}


        //=====================================================================================================
        // Setter methods
        //=====================================================================================================

        

        //=====================================================================================================
        // Instance management
        //=====================================================================================================

        constructor(name, type, weight, rarity, price, stackable, properties, bonus) {
            super(name, type, weight, rarity, price, stackable, true, properties)
            
            this.#bonus = bonus

        }

        object() {
            return {
                "name": this.name,
                "type": this.type,
                "weight": this.weight,
                "rarity": this.rarity,
                "price": this.price,
                "stackable": this.stackable,
                "equipable": this.equipable,
                "properties": this.properties,
                "bonus": this.#bonus
            };
        }

        //=====================================================================================================
    }


} catch (e) {
    MapTool.chat.broadcast("" + e + "\n" + e.stack);
}
