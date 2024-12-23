"use strict";
try {

    var Database = class extends Entity {

        //=====================================================================================================
        // Database Default Parameters
        //=====================================================================================================

        #creature_types = {
            "data":{},
            "playable":{
                "true":[],
                "false":[],
            }
        }

        #races = {
            "data":{},
            "type":{
                "aberration":[],
                "beast":[],
                "celestial":[],
                "construct":[],
                "dragon":[],
                "elemental":[],
                "fey":[],
                "fiend":[],
                "giant":[],
                "humanoid":[],
                "monstrosity":[],
                "ooze":[],
                "plant":[],
                "undead":[]
            },
            "playable":{
                "true":[],
                "false":[],
            }
        }

        #resources = {
            "data":{},
            "type":{},
            "level":{}
        }

        #resistances = {
            "data":{},
            "type":{
                "physical":[],
                "elemental":[],
                "special":[],
            }
        }

        #features = {
            "data":{},
            "type":{},
            "level":{}
        }

        #spells = {
            "data":{},
            "level":{
                "cantrip": [],
                "1st": [], "2nd": [], "3rd": [],
                "4th": [], "5th": [], "6th": [],
                "7th": [], "8th": [], "9th": []
            },
            "class":{
                "bard": [],
                "cleric": [],
                "druid": [],
                "sorcerer": [],
                "warlock": [],
                "wizard": []
            },
            "school":{
                "abjuration": [],
                "conjuration": [],
                "divination": [],
                "enchantment": [],
                "evocation": [],
                "illusion": [],
                "necromancy": [],
                "transmutation": []
            }
        }

        #conditions = {
            "data":{},
            "type":{
                "spell":[],
                "natural":[],
                "curse":[],
                "poison":[],
                "special":[]
            }
        }

        #items = {
            "data":{},
            "type":{}
        }



        //=====================================================================================================
        // Getter methods
        //=====================================================================================================

        get spells() {return this.#spells}



        //=====================================================================================================
        // Spell management
        //=====================================================================================================

        set_spell(name, level, school, classes,
            cast_time, range, target, components, duration,
            description, description_higher_levels) {

            if(name in this.#spells.data) {this.remove_spell(name)}
            
            let spell = new Spell(name, level, school, classes,
                cast_time, range, target, components, duration,
                description, description_higher_levels)
            
            this.#spells.data[name] = spell.object()
            this.#spells.level[spell.level].push(spell.name)
            this.#spells.school[spell.school].push(spell.name)

            spell.classes.forEach((value) => {
                this.#spells.class[value].push(spell.name)
            })

            this.save()
        }

        remove_spell(name) {
            let spell = this.#spells.data[name]

            delete this.#spells.data[spell.name]
            this.#spells.level[spell.level] = this.#spells.level[spell.level].filter(value => value != spell.name)
            this.#spells.school[spell.school] = this.#spells.school[spell.school].filter(value => value != spell.name)

            spell.classes.forEach((value) => {
                this.#spells.class[value] = this.#spells.class[value].filter(value => value != spell.name)
            })
            
            this.save()
        }



        //=====================================================================================================
        // Instance management
        //=====================================================================================================

        constructor() {
            super("CD63A98070EB4D2792D8AAC3F9504EE4")

            let has_property_object = String(this.token.getProperty("object")) != "null";

            // Reset if no previous data or if reset flag is true
            if (!has_property_object) {
                this.save();
            }
            else {
                try {
                    this.load();
                }
                catch {
                    this.save();
                }
            }
        }



        //=====================================================================================================
        // MapTool sync management
        //=====================================================================================================

        load() {
            let object = JSON.parse(this.token.getProperty("object"));

            this.#spells = object.spells;
        }

        save() {
            let object = {
                "spells": this.#spells,
            };

            this.token.setProperty("object", JSON.stringify(object));
        }

        //=====================================================================================================
    }

    var database = new Database()

    database.set_spell(
        "Fireball",
        "3rd",
        "evocation",
        ["sorcerer","wizard"],
        3,
        150,
        "A point you choose within range",
        ["vocal", "somatic","material"],
        0,
        "A bright streak flashes from your pointing finger to a point you choose within range then blossoms "+
            "with a low roar into an explosion of flame. Each creature in a 20-foot radius sphere centered on "+
            "that point must make a Dexterity saving throw. A target takes 8d6 fire damage on a failed save, "+
            "or half as much damage on a successful one. The fire spreads around corners. It ignites flammable "+
            "objects in the area that aren't being worn or carried.",
        "When you cast this spell using a spell slot of 4th level or higher, the damage increases by 1d6 for "+
            "each slot level above 3rd."
    ); 
    


} catch (e) {
    MapTool.chat.broadcast("" + e + "\n" + e.stack);
}
