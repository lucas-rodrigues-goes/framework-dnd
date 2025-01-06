"use strict";
try {

    var Database = class extends Entity {

        //=====================================================================================================
        // Database Default Parameters
        //=====================================================================================================

        #classes = {
        }

        #races = {
        }

        #proficiencies = {
            "data":{},
            "type":{}
        }

        #resources = {
            "data":{},
            "type":{},
            "subtype":{},
            "level":{}
        }

        #damage_types = {
            "data":{},
            "type":{}
        }

        #features = {
            "data":{},
            "type":{},
            "subtype":{},
            "level":{},
            "optional":{}
        }

        #spells = {
            "data":{},
            "level":{},
            "class":{},
            "school":{}
        }

        #conditions = {
            "data":{},
            "type":{}
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
        get resources() {return this.#resources}
        get damage_types() {return this.#damage_types}
        get items() {return this.#items}



        //=====================================================================================================
        // Proficiency management
        //=====================================================================================================

        /* set_proficiency(name, type, proficient, expert, master, grandmaster) {

            if(name in this.#proficiencies.data) {this.remove_proficiency(name)}
            
            let proficiency = new Proficiency(name, type, [proficient, expert, master, grandmaster])

            this.#proficiencies.data[proficiency.name] = proficiency.object()
            this.#proficiencies.type[proficiency.type].push(proficiency.name)

            this.save()
        } */

        /* remove_proficiency(name) {
            let proficiency = this.#proficiencies.data[name]

            delete this.#resistances.data[resistance.name]
            this.#resistances.type[resistance.type] = this.#resistances.type[resistance.type].filter(value => value != resistance.name)

            this.save()
        } */



        //=====================================================================================================
        // Resource management
        //=====================================================================================================

        set_resource(name, type, subtype, level, description) {
            const database = this.#resources
            const object = new Resource(name, type, subtype, level, description)

            // Verify if already exists
            if(name in database.data) {this.remove_resource(name)}


            // Type
            if (!database.type[object.type]) { 
                database.type[object.type] = [] 
            }
            database.type[object.type].push(object.name)

            // Subtype
            if (!database.subtype[object.subtype]) { 
                database.subtype[object.subtype] = [] 
            }
            database.subtype[object.subtype].push(object.name)

            // Level
            if (!database.level[object.level]) { 
                database.level[object.level] = [] 
            }
            database.level[object.level].push(object.name)
            

            // Data
            database.data[object.name] = object.object()


            this.save()
        }

        remove_resource(name) {
            const database = this.#resources
            const object = database.data[name]

            // Data
            delete database.data[object.name]

            // Type
            database.type[object.type] = database.type[object.type].filter(value => value != object.name)

            // Subtype
            database.subtype[object.subtype] = database.subtype[object.subtype].filter(value => value != object.name)

            // Level
            database.level[object.level] = database.level[object.level].filter(value => value != object.name)

            this.save()
        }




        //=====================================================================================================
        // Damage type management
        //=====================================================================================================

        set_damage_type(name, type, description, image) {
            const database = this.#damage_types
            const object = new DamageType(name, type, description, image)

            // Verify if already exists
            if(name in database.data) {this.remove_damage_type(name)}


            // Type
            if (!database.type[object.type]) { 
                database.type[object.type] = [] 
            }
            database.type[object.type].push(object.name)


            // Data
            database.data[object.name] = object.object()


            this.save()
        }

        remove_damage_type(name) {
            const database = this.#damage_types
            const object = database.data[name]

            // Data
            delete database.data[object.name]

            // Type
            database.type[object.type] = database.type[object.type].filter(value => value != object.name)


            this.save()
        }



        //=====================================================================================================
        // Feature management
        //=====================================================================================================

        set_feature(name, type, subtype, level, optional, description) {
            const database = this.#features
            const object = new Feature(name, type, subtype, level, optional, description)

            // Verify if already exists
            if(name in database.data) {this.remove_resource(name)}


            // Type
            if (!database.type[object.type]) { 
                database.type[object.type] = [] 
            }
            database.type[object.type].push(object.name)

            // Subtype
            if (!database.subtype[object.subtype]) { 
                database.subtype[object.subtype] = [] 
            }
            database.subtype[object.subtype].push(object.name)

            // Level
            if (!database.level[object.level]) { 
                database.level[object.level] = [] 
            }
            database.level[object.level].push(object.name)

            // Optional
            if (!database.optional[object.optional]) { 
                database.optional[object.optional] = [] 
            }
            database.optional[object.optional].push(object.name)
            

            // Data
            database.data[object.name] = object.object()


            this.save()
        }

        remove_feature(name) {
            const database = this.#features
            const object = database.data[name]

            // Data
            delete database.data[object.name]

            // Type
            database.type[object.type] = database.type[object.type].filter(value => value != object.name)

            // Subtype
            database.subtype[object.subtype] = database.subtype[object.subtype].filter(value => value != object.name)

            // Level
            database.level[object.level] = database.level[object.level].filter(value => value != object.name)

            // Optional
            database.optional[object.optional] = database.optional[object.optional].filter(value => value != object.name)

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
            const database = this.#spells;
            const object = new Spell(
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
            );
        
            // Verify if already exists
            if (name in database.data) {
                this.remove_spell(name);
            }
        
            // Level
            if (!database.level[object.level]) {
                database.level[object.level] = [];
            }
            database.level[object.level].push(object.name);
        
            // School
            if (!database.school[object.school]) {
                database.school[object.school] = [];
            }
            database.school[object.school].push(object.name);
        
            // Classes
            object.classes.forEach((cls) => {
                if (!database.class[cls]) {
                    database.class[cls] = [];
                }
                database.class[cls].push(object.name);
            });
        
            // Data
            database.data[object.name] = object.object();
        
            this.save();
        }
        
        remove_spell(name) {
            const database = this.#spells;
            const object = database.data[name];
        
            // Data
            delete database.data[object.name];
        
            // Level
            database.level[object.level] = database.level[object.level].filter(
                (value) => value != object.name
            );
        
            // School
            database.school[object.school] = database.school[object.school].filter(
                (value) => value != object.name
            );
        
            // Classes
            object.classes.forEach((cls) => {
                database.class[cls] = database.class[cls].filter(
                    (value) => value != object.name
                );
            });
        
            this.save();
        }
        



        //=====================================================================================================
        // Condition management
        //=====================================================================================================

        set_condition(
            name,
            type,
            duration,
            description
        ) {

            if(name in this.#conditions.data) {this.remove_condition(name)}
            
            let condition = new Condition(
                name,
                type,
                duration,
                description
            )

            if (this.#conditions.type[condition.type] == undefined) {
                this.#conditions.type[condition.type] = []
            }
            
            this.#conditions.data[condition.name] = condition.object()
            this.#conditions.type[condition.type].push(condition.name)

            this.save()
        }

        remove_condition(name) {
            let condition = this.#conditions.data[name]

            delete this.#conditions.data[condition.name]
            this.#conditions.type[condition.type] = this.#conditions.type[condition.type].filter(value => value != condition.name)

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

            this.#proficiencies = object.proficiencies
            this.#resources = object.resources
            this.#damage_types = object.damage_types
            this.#features = object.features
            this.#spells = object.spells;
            this.#items = object.items;
        }

        save() {
            let object = {
                "proficiencies": this.#proficiencies,
                "resources": this.#resources,
                "damage_types": this.#damage_types,
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
        "Food",
        3,
        "common",
        10,
        true
    )

    database.set_weapon(
        "Dagger",
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

    database.set_spell(
        "Fireball",
        "3rd",
        "evocation",
        ["sorcerer", "wizard"],
        3,
        150,
        "A point you choose within range",
        ["vocal", "somatic", "material"],
        0,
        "A bright streak flashes from your pointing finger to a point you choose within range then blossoms " +
            "with a low roar into an explosion of flame. Each creature in a 20-foot radius sphere centered on " +
            "that point must make a Dexterity saving throw. A target takes 8d6 fire damage on a failed save, " +
            "or half as much damage on a successful one. The fire spreads around corners. It ignites flammable " +
            "objects in the area that aren't being worn or carried.",
        "When you cast this spell using a spell slot of 4th level or higher, the damage increases by 1d6 for " +
            "each slot level above 3rd."
    );
    


} catch (e) {
    MapTool.chat.broadcast("" + e + "\n" + e.stack);
}
