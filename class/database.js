"use strict";
try {

    var Database = class extends Entity {

        //=====================================================================================================
        // Database Default Parameters
        //=====================================================================================================

        #features = {
            "data":{},
            "feat": [],
            "race": {},
            "class": {
                "barbarian": {},
                "bard": {},
                "cleric": {},
                "druid": {},
                "fighter": {},
                "monk": {},
                "paladin": {},
                "ranger": {},
                "rogue": {},
                "sorcerer": {},
                "warlock": {},
                "wizard": {}
            },
            "subclass": {
                "path of the berserker": {},
                "path of the totem warrior": {},
                "college of lore": {},
                "college of valor": {},
                "death domain": {},
                "life domain": {},
                "circle of the land": {},
                "circle of the moon": {},
                "champion": {},
                "battle master": {},
                "eldritch knight": {},
                "way of the open hand": {},
                "way of shadow": {},
                "way of the four elements": {},
                "oath of devotion": {},
                "oath of the ancients": {},
                "oath of vengeance": {},
                "hunter": {},
                "beast master": {},
                "thief": {},
                "assassin": {},
                "arcane trickster": {},
                "draconic bloodline": {},
                "wild magic": {},
                "archfey patron": {},
                "fiend patron": {},
                "great old one patron": {},
                "school of abjuration": {},
                "school of conjuration": {},
                "school of divination": {},
                "school of enchantment": {},
                "school of evocation": {},
                "school of illusion": {},
                "school of necromancy": {},
                "school of transmutation": {}
            }
        }



        //=====================================================================================================
        // Getter methods
        //=====================================================================================================




        //=====================================================================================================
        // Setter methods
        //=====================================================================================================




        //=====================================================================================================
        // Resource management
        //=====================================================================================================




        //=====================================================================================================
        // Feature management
        //=====================================================================================================




        //=====================================================================================================
        // Instance management
        //=====================================================================================================




        //=====================================================================================================
        // MapTool sync management
        //=====================================================================================================

        load() {
            let object = JSON.parse(this.token.getProperty("object"));

            this.#name = object.name;
        }

        save() {
            let object = {
                "name": this.#name,
            };

            this.token.setProperty("object", JSON.stringify(object));
        }

        //=====================================================================================================
    }


} catch (e) {
    MapTool.chat.broadcast("" + e + "\n" + e.stack);
}
