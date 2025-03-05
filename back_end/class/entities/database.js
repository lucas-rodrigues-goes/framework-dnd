"use strict";
try {

    var Database = class extends Entity {

        //=====================================================================================================
        // Race management
        //=====================================================================================================

        #races = {
            "data":{},
        }

        reset_races() {
            this.#races = {
                "data":{},
            }

            this.save()
        }

        get races() {return this.#races}

        get_race(name) {
            const database = this.#races;
            
            // Check if the resource exists
            if (name in database.data) {
                return database.data[name];
            } else {
                return null;  // Return null if the resource doesn't exist
            }
        }

        get_races_list(filters = {}, sortBy = null, searchString = null) {
            const { } = filters;
            const database = this.#races;
            let object_names = Object.keys(database.data);
        
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
                default:
                    object_names.sort((a, b) => a.localeCompare(b));
                    break;
            }
        
            return object_names;
        }

        set_race(data) {
            const database = this.#races
            const object = new Race({...data})

            // Verify if already exists
            if(object.name in database.data) {this.remove_race(object.name)}
            

            // Data
            database.data[object.name] = object.object()


            this.save()
        }

        remove_race(name) {
            const database = this.#races
            const object = database.data[name]

            // Data
            delete database.data[object.name]

            this.save()
        }



        //=====================================================================================================
        // Proficiency management
        //=====================================================================================================

        #proficiencies = {
            "data":{},
            "type":{}
        }

        reset_proficiencies() {
            this.#proficiencies = {
                "data":{},
                "type":{},
            }

            this.save()
        }

        get proficiencies() {return this.#proficiencies}

        get_proficiency(name) {
            const database = this.#proficiencies;
            
            // Check if the resource exists
            if (name in database.data) {
                return database.data[name];
            } else {
                return null;  // Return null if the resource doesn't exist
            }
        }

        get_proficiencies_list(filters = {}, sortBy = null, searchString = null) {
            const { type } = filters;
            const database = this.#proficiencies;
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

        set_proficiency(data) {
            const database = this.#proficiencies
            const object = new Proficiency({...data})

            // Verify if already exists
            if(object.name in database.data) {this.remove_proficiency(object.name)}

            // Type
            if (!database.type[object.type]) { 
                database.type[object.type] = [] 
            }
            database.type[object.type].push(object.name)

            // Data
            database.data[object.name] = object.object()

            this.save()
        }

        remove_proficiency(name) {
            const database = this.#proficiencies
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
            const { } = filters;
            const database = this.#resources;
            let object_names = Object.keys(database.data);
        
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
                default:
                    object_names.sort((a, b) => a.localeCompare(b));
                    break;
            }
        
            return object_names;
        }

        set_resource(data) {
            const database = this.#resources
            const object = new Resource(data)

            // Verify if already exists
            if(object.name in database.data) {this.remove_resource(object.name)}            

            // Data
            database.data[object.name] = object.object()

            this.save()
        }

        remove_resource(name) {
            const database = this.#resources
            const object = database.data[name]

            // Data
            delete database.data[object.name]

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

        set_damage_type(data) {
            const database = this.#damage_types
            const object = new DamageType({...data})

            // Verify if already exists
            if(object.name in database.data) {this.remove_damage_type(object.name)}

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
        
            const classOrder = {
                "barbarian": ["Path of the Berserker", "Path of the Totem Warrior"],
                "bard": ["College of Lore", "College of Valor"],
                "cleric": ["Knowledge Domain", "Life Domain", "Light Domain", "Nature Domain", "Tempest Domain", "Trickery Domain", "War Domain"],
                "druid": ["Circle of the Land", "Circle of the Moon"],
                "fighter": ["Champion", "Battle Master", "Eldritch Knight"],
                "monk": ["Way of the Open Hand", "Way of Shadow", "Way of the Four Elements"],
                "paladin": ["Oath of Devotion", "Oath of the Ancients", "Oath of Vengeance"],
                "ranger": ["Hunter", "Beast Master"],
                "rogue": ["Thief", "Assassin", "Arcane Trickster"],
                "sorcerer": ["Draconic Bloodline", "Wild Magic"],
                "warlock": ["The Archfey", "The Fiend", "The Great Old One"],
                "wizard": ["School of Abjuration", "School of Conjuration", "School of Divination", "School of Enchantment", "School of Evocation", "School of Illusion", "School of Necromancy", "School of Transmutation"]
            };
            const flatOrder = [];
            Object.entries(classOrder).forEach(([mainClass, subclasses]) => {
                flatOrder.push(mainClass);
                flatOrder.push(...subclasses);
            });

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
                    
                        // Sort by type alphabetically (class, racial, feat)
                        if (typeA !== typeB) {
                            return typeB.localeCompare(typeA);
                        }
                    
                        const subtypeA = database.data[a].subtype || '';
                        const subtypeB = database.data[b].subtype || '';
                    
                        const indexA = flatOrder.indexOf(subtypeA);
                        const indexB = flatOrder.indexOf(subtypeB);
                    
                        // If both subtypes are found in flatOrder, compare their indices
                        if (indexA !== -1 && indexB !== -1) {
                            if (indexA !== indexB) {
                                return indexA - indexB;
                            }
                        } else {
                            // If one is found and the other isn't, prioritize the one that is found
                            if (indexA !== -1) return -1;
                            if (indexB !== -1) return 1;
                        }
                    
                        // If neither is found or if they are equal in order, sort alphabetically by subtype
                        const subtypeComparison = subtypeA.localeCompare(subtypeB);
                        if (subtypeComparison !== 0) {
                            return subtypeComparison;
                        }
                    
                        // Finally, sort by level numerically
                        const levelA = Number(database.data[a].level) || 0;
                        const levelB = Number(database.data[b].level) || 0;
                        return levelA - levelB;
                    });
                    break;
            }
        
            return object_names;
        }
        
        set_feature(data) {
            const database = this.#features
            const object = new Feature({...data})

            // Verify if already exists
            if(object.name in database.data) {this.remove_feature(object.name)}


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
        
            
            // Helper function to convert level strings to numbers
            const convertLevel = (level) => {
                if (level === "cantrip") return 0;
                if (level.endsWith("st") || level.endsWith("nd") || level.endsWith("rd") || level.endsWith("th")) {
                    return parseInt(level, 10);
                }
                return Infinity; // If the level is not recognized, place it at the end
            };

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
                    
                        const numericLevelA = convertLevel(levelA);
                        const numericLevelB = convertLevel(levelB);
                    
                        return numericLevelA - numericLevelB;
                    });
                    break;
                default:
                    // Default sorting: by level
                    object_names.sort((a, b) => {
                        const levelA = database.data[a].level || '';
                        const levelB = database.data[b].level || '';
                    
                        const numericLevelA = convertLevel(levelA);
                        const numericLevelB = convertLevel(levelB);
                        
                        if (numericLevelA != numericLevelB) {
                            return numericLevelA - numericLevelB;
                        }

                        const schoolA = database.data[a].school || '';
                        const schoolB = database.data[b].school || '';
                        return schoolA.localeCompare(schoolB);
                    });
                    break;
            }
        
            return object_names;
        }        

        set_spell(data) {
            const database = this.#spells;
            const object = new Spell({...data});
        
            // Verify if already exists
            if (object.name in database.data) {
                this.remove_spell(object.name);
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

        reset_conditions() {
            this.#conditions = {
                "data":{},
                "type":{}
            }

            this.save()
        }

        get conditions() {return this.#conditions}

        get_condition(name) {
            const database = this.#conditions;
            
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
        

        set_condition(data) {
            const database = this.#conditions;
            const object = new Condition({...data});
        
            // Verify if the condition already exists
            if (object.name in database.data) { this.remove_condition(object.name); }
        
            // Type
            if (!database.type[object.type]) {
                database.type[object.type] = [];
            }
            database.type[object.type].push(object.name);
        
            // Data
            database.data[object.name] = object.object();
        
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
            const database = this.#items;
            
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

                        if (subtypeA !== subtypeB) {
                            return subtypeA.localeCompare(subtypeB);
                        }

                        return database.data[b].price - database.data[a].price
                    });
                    break;
            }
        
            return object_names;
        }
        

        set_item(data) {
            const database = this.#items;
            const object = new Item({...data});
        
            // Verify if the item already exists
            if (object.name in database.data) {
                this.remove_item(object.name);
            }
        
            // Type
            if (!database.type[object.type]) {
                database.type[object.type] = [];
            }
            database.type[object.type].push(object.name);
        
            // Data
            database.data[object.name] = object.object();
        
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

            this.#races = object.races
            this.#proficiencies = object.proficiencies
            this.#conditions = object.conditions
            this.#resources = object.resources
            this.#damage_types = object.damage_types
            this.#features = object.features
            this.#spells = object.spells;
            this.#items = object.items;

            this.token.setProperty("class", "Database");
        }

        save() {
            let object = {
                races: this.#races,
                proficiencies: this.#proficiencies,
                conditions: this.#conditions,
                resources: this.#resources,
                damage_types: this.#damage_types,
                features: this.#features,
                spells: this.#spells,
                items: this.#items
            };

            this.token.setProperty("object", JSON.stringify(object));
            this.token.setProperty("class", JSON.stringify(["Database", "Entity"]));
        }



        //=====================================================================================================
    }

    var database = new Database()
    


} catch (e) {
    MapTool.chat.broadcast("" + e + "\n" + e.stack);
}
