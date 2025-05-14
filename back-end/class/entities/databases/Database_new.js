

var Database = class extends Entity {

    //=====================================================================================================
    // Bases
    //=====================================================================================================
    
    // Races
    #races = { data: {} }
    get races () {
        // Get
        const get (name) {
            const database = this.#races;
            
            // Check if the resource exists
            if (name in database.data) {
                return database.data[name];
            } else {
                return null;  // Return null if the resource doesn't exist
            }
        }

        const list (filters = {}, sortBy = null, searchString = null) {
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

        // Set
        function set (object) {
            const database = this.#races
            const object = data.race.create(object)

            // Verify if already exists
            if(object.name in database.data) {remove(object.name)}

            // Data
            database.data[object.name] = object.object()

            this.save()
        }

        // Remove
        function remove (name) {
            const database = this.#races
            const object = database.data[name]

            // Data
            delete database.data[object.name]

            this.save()
        }

        // Reset
        function reset (name) {
            this.#races = { data: {} }
            this.save()
        }

        return { get, list, set, remove, reset }
    }

    // Proficiency
    //...
    

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
