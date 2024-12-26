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
            "type":{
                "class":[],
                "racial":[],
                "type":[]
            },
            "level":{},
            "optional":{
                "true":[],
                "false":[]
            }
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
        get features() {return this.#features}
        get items() {return this.#items}



        //=====================================================================================================
        // Feature management
        //=====================================================================================================

        set_feature(name, type, subtype, level, optional, description) {

            if(name in this.#features.data) {this.remove_feature(name)}
            
            let feature = new Feature(name, type, subtype, level, optional, description)

            if (this.#features.level[feature.level] == undefined) {
                this.#features.level[feature.level] = []
            }
            if (this.#features.type[feature.subtype] == undefined && subtype) {
                this.#features.type[feature.subtype] = []
            }
            
            this.#features.data[name] = feature.object()
            this.#features.level[feature.level].push(feature.name)
            this.#features.optional[feature.optional].push(feature.name)

            if (feature.type != "class") {
                this.#features.type[feature.type].push(feature.name)
            } else {
                this.#features.type[feature.subtype].push(feature.name)
            }

            this.save()
        }

        remove_feature(name) {
            let feature = this.#features.data[name]

            delete this.#features.data[feature.name]
            this.#features.level[feature.level] = this.#features.level[feature.level].filter(value => value != feature.name)
            this.#features.optional[feature.optional] = this.#features.optional[feature.optional].filter(value => value != feature.name)

            if (feature.type != "class") {
                this.#features.type[feature.type] = this.#features.type[feature.type].filter(value => value != feature.name)
            } else {
                this.#features.type[feature.subtype] = this.#features.type[feature.subtype].filter(value => value != feature.name)
            }

            this.save()
        }



        //=====================================================================================================
        // Spell management
        //=====================================================================================================

        set_spell(
            name, 
            level, 
            school, 
            classes,
            cast_time, 
            range, 
            target, 
            components, 
            duration,
            description, 
            description_higher_levels
        ) {

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
        // Item management
        //=====================================================================================================

        set_item(
            name,
            type,
            weight = 1,
            rarity = "common",
            price = 0,
            stackable = true,
            properties = []
        ) {

            if(name in this.#items.data) {this.remove_item(name)}
            
            let item = new Item(
                name,
                type,
                undefined,
                weight,
                rarity,
                price,
                stackable,
                false,
                properties
            )

            if (this.#items.type[item.type] == undefined) {
                this.#items.type[item.type] = []
            }
            
            this.#items.data[item.name] = item.object()
            this.#items.type[item.type].push(item.name)

            this.save()
        }

        set_equipment(
            name,
            subtype,
            weight, 
            rarity, 
            price, 
            properties = [], 
            bonus = {}, 
            conditions = []
        ) {

            if(name in this.#items.data) {this.remove_item(name)}
            
            let item = new Equipment(
                name,
                subtype, 
                weight, 
                rarity, 
                price, 
                properties, 
                bonus, 
                conditions
            )

            if (this.#items.type[item.type] == undefined) {
                this.#items.type[item.type] = []
            }
            
            this.#items.data[item.name] = item.object()
            this.#items.type[item.type].push(item.name)

            this.save()
        }

        set_weapon(
            name,
            weight,
            rarity, 
            price, 
            properties = [], 
            bonus = {}, 
            conditions = [], 
            damage = [{
                "ammount": 1,
                "size": 4,
                "type": "piercing"
            }]
        ) {

            if(name in this.#items.data) {this.remove_item(name)}
            
            let item = new Weapon(
                name,
                weight,
                rarity, 
                price, 
                properties, 
                bonus, 
                conditions, 
                damage
            )

            if (this.#items.type[item.type] == undefined) {
                this.#items.type[item.type] = []
            }
            
            this.#items.data[item.name] = item.object()
            this.#items.type[item.type].push(item.name)

            this.save()
        }

        remove_item(name) {
            let item = this.#items.data[name]

            delete this.#items.data[item.name]
            this.#items.type[item.type] = this.#items.type[item.type].filter(value => value != item.name)

            this.save()
        }



        //=====================================================================================================
        // Instance management
        //=====================================================================================================

        constructor() {
            super("CD63A98070EB4D2792D8AAC3F9504EE4")

            let has_property_object = String(this.token.getProperty("object")) != "null";
            has_property_object = false;

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

            this.#features = object.features
            this.#spells = object.spells;
            this.#items = object.items;
        }

        save() {
            let object = {
                "features": this.#features,
                "spells": this.#spells,
                "items": this.#items
            };

            this.token.setProperty("object", JSON.stringify(object));
        }



        //=====================================================================================================
    }

    var database = new Database()

    database.set_item(
        "Ration",
        undefined,
        "Food",
        3,
        "common",
        1,
        true
    )

    database.set_weapon(
        "Dagger",
        undefined,
        1,
        "common",
        2,
        [],
        {},
        [],
        [{
            "ammount":1,
            "size":4,
            "type":"piercing"
        }]
        
    )

    database.set_feature(
        "Darkvision",
        'racial',
        "",
        0,
        false,
        "You have superior vision in dark and dim conditions. You can see in dim light within 30 feet of you as "+
        "if it were bright light, and in darkness as if it were dim light. You can't discern color in darkness, "+
        "only shades of gray."
    )

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
