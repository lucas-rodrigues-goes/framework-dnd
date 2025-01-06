"use strict";
try {

    var Database = class extends Entity {


        //=====================================================================================================
        // Proficiency management
        //=====================================================================================================

        #proficiencies = {
            "data":{},
            "type":{}
        }

        reset_proficiencies() {
            this.#resources = {
                "data":{},
                "type":{},
                "subtype":{},
                "level":{}
            }

            this.save()
        }

        get proficiencies() {return this.#proficiencies}



        //=====================================================================================================
        // Resource management
        //=====================================================================================================

        #resources = {
            "data":{},
            "type":{},
            "subtype":{},
            "level":{}
        }

        reset_resources() {
            this.#resources = {
                "data":{},
                "type":{},
                "subtype":{},
                "level":{}
            }

            this.save()
        }

        get resources() {return this.#resources}

        get_resource(name) {
            const database = this.#resources;
            
            // Check if the resource exists
            if (name in database.data) {
                return database.data[name];
            } else {
                return null;  // Return null if the resource doesn't exist
            }
        }

        get_resources_list(filters = {}, sortBy = null, searchString = null) {
            const { type, subtype, level } = filters;
            const database = this.#resources;
            let object_names = Object.keys(database.data);
        
            // Apply type filter if provided
            if (type) {
                if (database.type[type]) {
                    object_names = database.type[type];
                } else {
                    return []; // Return empty array if type doesn't exist
                }
            }
        
            // Apply subtype filter
            if (subtype) {
                if (database.subtype[subtype]) {
                    const subtype_names = database.subtype[subtype];
                    object_names = object_names.filter(name => subtype_names.includes(name));
                } else {
                    return []; // Return empty array if subtype doesn't exist
                }
            }
        
            // Apply level filter
            if (level) {
                if (database.level[level]) {
                    const level_names = database.level[level];
                    object_names = object_names.filter(name => level_names.includes(name));
                } else {
                    return []; // Return empty array if level doesn't exist
                }
            }
        
            // Filter by searchString if provided
            if (searchString) {
                const lowerSearchString = searchString.toLowerCase();
                object_names = object_names.filter(name => {
                    const resource = database.data[name];
                    return Object.values(resource).some(value =>
                        String(value).toLowerCase().includes(lowerSearchString)
                    );
                });
            }
                
            // Sort the object names if a sortBy parameter is provided
            switch (sortBy) {
                case "name":
                    object_names.sort((a, b) => a.localeCompare(b));
                    break;
                case "type":
                    object_names.sort((a, b) => {
                        const typeA = database.data[a].type || '';
                        const typeB = database.data[b].type || '';
                        return typeA.localeCompare(typeB);
                    });
                    break;
                case "subtype":
                    object_names.sort((a, b) => {
                        const subtypeA = database.data[a].subtype || '';
                        const subtypeB = database.data[b].subtype || '';
                        return subtypeA.localeCompare(subtypeB);
                    });
                    break;
                case "level":
                    object_names.sort((a, b) => {
                        const levelA = database.data[a].level || '';
                        const levelB = database.data[b].level || '';
                        return levelA.localeCompare(levelB);
                    });
                    break;
                default:
                    // Default sorting: by type, then subtype, then level
                    object_names.sort((a, b) => {
                        const typeA = database.data[a].type || '';
                        const typeB = database.data[b].type || '';
                        if (typeA !== typeB) {
                            return typeA.localeCompare(typeB);
                        }
                        const subtypeA = database.data[a].subtype || '';
                        const subtypeB = database.data[b].subtype || '';
                        if (subtypeA !== subtypeB) {
                            return subtypeA.localeCompare(subtypeB);
                        }
                        const levelA = database.data[a].level || '';
                        const levelB = database.data[b].level || '';
                        return levelA.localeCompare(levelB);
                    });
                    break;
            }
        
            return object_names;
        }

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
            database.type[object.type] = database.type[object.type].filter(
                value => value != object.name
            )

            // Subtype
            database.subtype[object.subtype] = database.subtype[object.subtype].filter(
                value => value != object.name
            )

            // Level
            database.level[object.level] = database.level[object.level].filter(
                value => value != object.name
            )

            this.save()
        }



        //=====================================================================================================
        // Damage type management
        //=====================================================================================================

        #damage_types = {
            "data":{},
            "type":{}
        }

        reset_damage_types() {
            this.#damage_types = {
                "data":{},
                "type":{}
            }

            this.save()
        }

        get damage_types() {return this.#damage_types}

        get_damage_type(name) {
            const database = this.#damage_types;
            
            // Check if the resource exists
            if (name in database.data) {
                return database.data[name];
            } else {
                return null;  // Return null if the resource doesn't exist
            }
        }

        get_damage_type_list(filters = {}, sortBy = null, searchString = null) {
            const { type } = filters;
            const database = this.#damage_types;
            let object_names = Object.keys(database.data);
        
            // Apply type filter if provided
            if (type) {
                if (database.type[type]) {
                    object_names = database.type[type];
                } else {
                    return []; // Return empty array if type doesn't exist
                }
            }
        
            // Filter by searchString if provided
            if (searchString) {
                const lowerSearchString = searchString.toLowerCase();
                object_names = object_names.filter(name => {
                    const resource = database.data[name];
                    return Object.values(resource).some(value =>
                        String(value).toLowerCase().includes(lowerSearchString)
                    );
                });
            }
        
            // Sort the object names if a sortBy parameter is provided
            switch (sortBy) {
                case "name":
                    object_names.sort((a, b) => a.localeCompare(b));
                    break;
                case "type":
                    object_names.sort((a, b) => {
                        const typeA = database.data[a].type || '';
                        const typeB = database.data[b].type || '';
                        return typeA.localeCompare(typeB);
                    });
                    break;
                default:
                    // Default sorting: by type
                    object_names.sort((a, b) => {
                        const typeA = database.data[a].type || '';
                        const typeB = database.data[b].type || '';
                        return typeA.localeCompare(typeB);
                    });
                    break;
            }
        
            return object_names;
        }          

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
            database.type[object.type] = database.type[object.type].filter(
                value => value != object.name
            )


            this.save()
        }



        //=====================================================================================================
        // Feature management
        //=====================================================================================================

        #features = {
            "data":{},
            "type":{},
            "subtype":{},
            "level":{},
            "optional":{}
        }

        reset_features() {
            this.#features = {
                "data":{},
                "type":{},
                "subtype":{},
                "level":{},
                "optional":{}
            }

            this.save()
        }

        get features() {return this.#features}

        get_feature(name) {
            const database = this.#features;
            
            // Check if the resource exists
            if (name in database.data) {
                return database.data[name];
            } else {
                return null;  // Return null if the resource doesn't exist
            }
        }

        get_features_list(filters = {}, sortBy = null, searchString = null) {
            const { type, subtype, level, optional } = filters;
            const database = this.#features;
            let object_names = Object.keys(database.data);
        
            // Apply type filter if provided
            if (type) {
                if (database.type[type]) {
                    object_names = database.type[type];
                } else {
                    return []; // Return empty array if type doesn't exist
                }
            }
        
            // Apply subtype filter
            if (subtype) {
                if (database.subtype[subtype]) {
                    const subtype_names = database.subtype[subtype];
                    object_names = object_names.filter(name => subtype_names.includes(name));
                } else {
                    return []; // Return empty array if subtype doesn't exist
                }
            }
        
            // Apply level filter
            if (level) {
                if (database.level[level]) {
                    const level_names = database.level[level];
                    object_names = object_names.filter(name => level_names.includes(name));
                } else {
                    return []; // Return empty array if level doesn't exist
                }
            }
        
            // Apply optional filter
            if (optional) {
                if (database.optional[optional]) {
                    const optional_names = database.optional[optional];
                    object_names = object_names.filter(name => optional_names.includes(name));
                } else {
                    return []; // Return empty array if optional doesn't exist
                }
            }
        
            // Filter by searchString if provided
            if (searchString) {
                const lowerSearchString = searchString.toLowerCase();
                object_names = object_names.filter(name => {
                    const resource = database.data[name];
                    return Object.values(resource).some(value =>
                        String(value).toLowerCase().includes(lowerSearchString)
                    );
                });
            }
        
            // Sort the object names if a sortBy parameter is provided
            switch (sortBy) {
                case "name":
                    object_names.sort((a, b) => a.localeCompare(b));
                    break;
                case "type":
                    object_names.sort((a, b) => {
                        const typeA = database.data[a].type || '';
                        const typeB = database.data[b].type || '';
                        return typeA.localeCompare(typeB);
                    });
                    break;
                case "subtype":
                    object_names.sort((a, b) => {
                        const subtypeA = database.data[a].subtype || '';
                        const subtypeB = database.data[b].subtype || '';
                        return subtypeA.localeCompare(subtypeB);
                    });
                    break;
                case "level":
                    object_names.sort((a, b) => {
                        const levelA = Number(database.data[a].level) || '';
                        const levelB = Number(database.data[b].level) || '';
                        return levelA - levelB;
                    });
                    break;
                default:
                    // Default sorting: by type, then subtype, then level
                    object_names.sort((a, b) => {
                        const typeA = database.data[a].type || '';
                        const typeB = database.data[b].type || '';
                        if (typeA !== typeB) {
                            return typeB.localeCompare(typeA);
                        }
                        const subtypeA = database.data[a].subtype || '';
                        const subtypeB = database.data[b].subtype || '';
                        if (subtypeA !== subtypeB) {
                            return subtypeA.localeCompare(subtypeB);
                        }
                        const levelA = Number(database.data[a].level) || '';
                        const levelB = Number(database.data[b].level) || '';
                        return levelA - levelB;
                    });
                    break;
            }
        
            return object_names;
        }
        

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
            database.type[object.type] = database.type[object.type].filter(
                value => value != object.name
            )

            // Subtype
            database.subtype[object.subtype] = database.subtype[object.subtype].filter(
                value => value != object.name
                
            )

            // Level
            database.level[object.level] = database.level[object.level].filter(
                value => value != object.name
            )

            // Optional
            database.optional[object.optional] = database.optional[object.optional].filter(
                value => value != object.name
            )

            this.save()
        }



        //=====================================================================================================
        // Spell management
        //=====================================================================================================

        #spells = {
            "data":{},
            "level":{},
            "class":{},
            "school":{}
        }

        reset_spells() {
            this.#spells = {
                "data":{},
                "level":{},
                "class":{},
                "school":{}
            }

            this.save()
        }

        get spells() {return this.#spells}

        get_spell(name) {
            const database = this.#spells;
            
            // Check if the resource exists
            if (name in database.data) {
                return database.data[name];
            } else {
                return null;  // Return null if the resource doesn't exist
            }
        }

        get_spells_list(filters = {}, sortBy = null, searchString = null) {
            const { level, school, player_class } = filters;
            const database = this.#spells;
            let object_names = Object.keys(database.data);
        
            // Apply school filter if provided
            if (school) {
                if (database.school[school]) {
                    object_names = database.school[school];
                } else {
                    return []; // Return empty array if school doesn't exist
                }
            }
        
            // Apply level filter
            if (level) {
                if (database.level[level]) {
                    const level_names = database.level[level];
                    object_names = object_names.filter(name => level_names.includes(name));
                } else {
                    return []; // Return empty array if level doesn't exist
                }
            }

            // Apply class filter
            if (player_class) {
                if (database.class[player_class]) {
                    const class_names = database.class[player_class];
                    object_names = object_names.filter(name => class_names.includes(name));
                } else {
                    return []; // Return empty array if level doesn't exist
                }
            }
        
            // Filter by searchString if provided
            if (searchString) {
                const lowerSearchString = searchString.toLowerCase();
                object_names = object_names.filter(name => {
                    const resource = database.data[name];
                    return Object.values(resource).some(value =>
                        String(value).toLowerCase().includes(lowerSearchString)
                    );
                });
            }
        
            // Sort the object names if a sortBy parameter is provided
            switch (sortBy) {
                case "name":
                    object_names.sort((a, b) => a.localeCompare(b));
                    break;
                case "school":
                    object_names.sort((a, b) => {
                        const schoolA = database.data[a].school || '';
                        const schoolB = database.data[b].school || '';
                        return schoolA.localeCompare(schoolB);
                    });
                    break;
                case "duration":
                    object_names.sort((a, b) => {
                        const durationA = database.data[a].duration || '';
                        const durationB = database.data[b].duration || '';
                        return durationA.localeCompare(durationB);
                    });
                    break;
                case "level":
                    object_names.sort((a, b) => {
                        const levelA = database.data[a].level || '';
                        const levelB = database.data[b].level || '';
                        return levelA.localeCompare(levelB);
                    });
                    break;
                default:
                    // Default sorting: by level
                    object_names.sort((a, b) => {
                        const levelA = database.data[a].level || '';
                        const levelB = database.data[b].level || '';
                        return levelA.localeCompare(levelB);
                    });
                    break;
            }
        
            return object_names;
        }        

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

        #conditions = {
            "data":{},
            "type":{}
        }

        reset_condition() {
            this.#conditions = {
                "data":{},
                "type":{}
            }

            this.save()
        }

        get conditions() {return this.#conditions}

        get_condition(name) {
            const database = this.#damage_types;
            
            // Check if the resource exists
            if (name in database.data) {
                return database.data[name];
            } else {
                return null;  // Return null if the resource doesn't exist
            }
        }

        get_conditions_list(filters = {}, sortBy = null, searchString = null) {
            const { type } = filters;
            const database = this.#conditions;
            let object_names = Object.keys(database.data);
        
            // Apply type filter if provided
            if (type) {
                if (database.type[type]) {
                    object_names = database.type[type];
                } else {
                    return []; // Return empty array if type doesn't exist
                }
            }
        
            // Filter by searchString if provided
            if (searchString) {
                const lowerSearchString = searchString.toLowerCase();
                object_names = object_names.filter(name => {
                    const resource = database.data[name];
                    return Object.values(resource).some(value =>
                        String(value).toLowerCase().includes(lowerSearchString)
                    );
                });
            }
        
            // Sort the object names if a sortBy parameter is provided
            switch (sortBy) {
                case "name":
                    object_names.sort((a, b) => a.localeCompare(b));
                    break;
                case "type":
                    object_names.sort((a, b) => {
                        const typeA = database.data[a].type || '';
                        const typeB = database.data[b].type || '';
                        return typeA.localeCompare(typeB);
                    });
                    break;
                default:
                    // Default sorting: by type
                    object_names.sort((a, b) => {
                        const typeA = database.data[a].type || '';
                        const typeB = database.data[b].type || '';
                        return typeA.localeCompare(typeB);
                    });
                    break;
            }
        
            return object_names;
        }
        

        set_condition(name, type, duration, description) {
            const database = this.#conditions;
            const condition = new Condition(name, type, duration, description);
        
            // Verify if the condition already exists
            if (name in database.data) {
                this.remove_condition(name);
            }
        
            // Type
            if (!database.type[condition.type]) {
                database.type[condition.type] = [];
            }
            database.type[condition.type].push(condition.name);
        
            // Data
            database.data[condition.name] = condition.object();
        
            this.save();
        }
        
        remove_condition(name) {
            const database = this.#conditions;
            const condition = database.data[name];
        
            // Data
            delete database.data[condition.name];
        
            // Type
            database.type[condition.type] = database.type[condition.type].filter(
                (value) => value != condition.name
            );
        
            this.save();
        }



        //=====================================================================================================
        // Item management
        //=====================================================================================================
        
        #items = {
            "data":{},
            "type":{}
        }

        reset_items() {
            this.#items = {
                "data":{},
                "type":{}
            }

            this.save()
        }

        get items() {return this.#items}

        get_item(name) {
            const database = this.#damage_types;
            
            // Check if the resource exists
            if (name in database.data) {
                return database.data[name];
            } else {
                return null;  // Return null if the resource doesn't exist
            }
        }

        get_items_list(filters = {}, sortBy = null, searchString = null) {
            const { type, subtype } = filters;
            const database = this.#items;
            let object_names = Object.keys(database.data);
        
            // Apply type filter if provided
            if (type) {
                if (database.type[type]) {
                    object_names = database.type[type];
                } else {
                    return []; // Return empty array if type doesn't exist
                }
            }
        
            // Apply subtype filter
            if (subtype) {
                if (database.subtype[subtype]) {
                    const subtype_names = database.subtype[subtype];
                    object_names = object_names.filter(name => subtype_names.includes(name));
                } else {
                    return []; // Return empty array if subtype doesn't exist
                }
            }
        
            // Filter by searchString if provided
            if (searchString) {
                const lowerSearchString = searchString.toLowerCase();
                object_names = object_names.filter(name => {
                    const resource = database.data[name];
                    return Object.values(resource).some(value =>
                        String(value).toLowerCase().includes(lowerSearchString)
                    );
                });
            }
        
            // Sort the object names if a sortBy parameter is provided
            switch (sortBy) {
                case "name":
                    object_names.sort((a, b) => a.localeCompare(b));
                    break;
                case "type":
                    object_names.sort((a, b) => {
                        const typeA = database.data[a].type || '';
                        const typeB = database.data[b].type || '';
                        return typeA.localeCompare(typeB);
                    });
                    break;
                case "subtype":
                    object_names.sort((a, b) => {
                        const subtypeA = database.data[a].subtype || '';
                        const subtypeB = database.data[b].subtype || '';
                        return subtypeA.localeCompare(subtypeB);
                    });
                    break;
                default:
                    // Default sorting: by type, then subtype
                    object_names.sort((a, b) => {
                        const typeA = database.data[a].type || '';
                        const typeB = database.data[b].type || '';
                        if (typeA !== typeB) {
                            return typeA.localeCompare(typeB);
                        }
                        const subtypeA = database.data[a].subtype || '';
                        const subtypeB = database.data[b].subtype || '';
                        return subtypeA.localeCompare(subtypeB);
                    });
                    break;
            }
        
            return object_names;
        }
        

        set_item(
            name, 
            type, 
            weight = 1, 
            rarity = "common", 
            price = 0, 
            stackable = true, 
            properties = []
        ) {
            const database = this.#items;
            const item = new Item(name, type, undefined, weight, rarity, price, stackable, false, properties);
        
            // Verify if the item already exists
            if (name in database.data) {
                this.remove_item(name);
            }
        
            // Type
            if (!database.type[item.type]) {
                database.type[item.type] = [];
            }
            database.type[item.type].push(item.name);
        
            // Data
            database.data[item.name] = item.object();
        
            this.save();
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
            const database = this.#items;
            const item = new Equipment(name, subtype, weight, rarity, price, properties, bonus, conditions);
        
            // Verify if the item already exists
            if (name in database.data) {
                this.remove_item(name);
            }
        
            // Type
            if (!database.type[item.type]) {
                database.type[item.type] = [];
            }
            database.type[item.type].push(item.name);
        
            // Data
            database.data[item.name] = item.object();
        
            this.save();
        }
        
        set_weapon(
            name, 
            weight, 
            rarity, 
            price, 
            properties = [], 
            bonus = {}, 
            conditions = [], 
            damage = [{ "ammount": 1, "size": 4, "type": "piercing" }]
        ) {
            const database = this.#items;
            const item = new Weapon(name, weight, rarity, price, properties, bonus, conditions, damage);
        
            // Verify if the item already exists
            if (name in database.data) {
                this.remove_item(name);
            }
        
            // Type
            if (!database.type[item.type]) {
                database.type[item.type] = [];
            }
            database.type[item.type].push(item.name);
        
            // Data
            database.data[item.name] = item.object();
        
            this.save();
        }
        
        remove_item(name) {
            const database = this.#items;
            const item = database.data[name];
        
            // Data
            delete database.data[item.name];
        
            // Type
            database.type[item.type] = database.type[item.type].filter(
                (value) => value != item.name
            );
        
            this.save();
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
