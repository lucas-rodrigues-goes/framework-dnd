

var Initiative = class {

    //=====================================================================================================
    // Stored Attributes
    //=====================================================================================================

    static #creatures = {}
    static #current_round = 0

    //=====================================================================================================
    // Getters
    //=====================================================================================================

    static get creatures () {return this.#creatures}
    static get current_creature() {
        if (this.turn_order.length < 1) return null
        
        // Gather creature ID
        const creature_id = this.turn_order[0]

        // If initiative for that ID is higher than or 12, subtract 12 from all initiatives
        while (this.creatures[creature_id].initiative >= 12) {
            for (const id of this.turn_order) {
                this.#creatures[id].initiative -= 12
            }

            this.#current_round += 1
        }

        return creature_id
    }
    static get current_round () { return this.#current_round }
    static get turn_order() {
        // Create a new object with only valid creatures
        const validCreatures = {};
        for (const id of Object.keys(this.#creatures)) {
            if (instance(id)) {
                validCreatures[id] = this.#creatures[id];
            }
        }
        
        // Update #creatures if any were removed
        if (Object.keys(validCreatures).length !== Object.keys(this.#creatures).length) {
            this.#creatures = validCreatures;
        }
    
        // Sort the remaining creatures
        return Object.keys(this.#creatures).sort(
            (a, b) => this.#creatures[a].initiative - this.#creatures[b].initiative
        );
    }
    static get creatures_info () {
        const return_list = []
        for (const id of this.turn_order) {
            const creature = instance(id)
            const initiative_info = this.#creatures[id]

            return_list.push({
                id: id,
                player: creature.player,
                portrait: creature.portrait,
                name: creature.name,
                status: initiative_info.status,
                description: initiative_info.description,
                initiative: initiative_info.initiative,
            })
        }

        return return_list
    }

    //=====================================================================================================
    // Private
    //=====================================================================================================

    static #start_turn() {
        // Validation
        if (this.turn_order.length < 2) {
            public_log("End of initiative.")
            return
        }

        // New playing creature
        const init_creature = this.creatures[this.current_creature]
        const creature = instance(this.current_creature)

        if (init_creature.status == "None") {
            // Update creature initiative object
            this.#creatures[this.current_creature] = {
                ...init_creature,
                recovery: 0,
                status: "Playing",
                description: "",
            }
            
            // Reset per turn resources
            creature.turn_start()

            // Logging
            public_log(creature.name + " started their turn.")
        }
        else if (init_creature.status == "Suspended") {
            this.#creatures[this.current_creature] = {
                ...init_creature,
                status: "Playing",
                description: "",
            }

            // Logging
            public_log(creature.name + " has finished " + init_creature.description + ".")
        }
    }

    //=====================================================================================================
    // Management
    //=====================================================================================================

    static clear_initiative() { this.#creatures = {} }
    
    static add_creatures(creatures=allSelected()) {
        // Add creatures to initiative
        for (let i = 0; i < creatures.length; i++) {
            const creature = creatures[i]
            const initiative_roll = Math.ceil(Math.random() * 6)

            // Add creature to initiative
            this.#creatures[creature.id] = {
                initiative: initiative_roll + creature.initiative_mod,
                recovery: 0,
                status: "None", // None, Playing, Suspended
                description: ""
            }

            // Clear creature combat resources
            for (const name of ["Action", "Bonus Action", "Attack Action", "Reaction", "Movement"]) {
                creature.set_resource_value(name, 0)
            }

            // Logging
            log(creature.name + " has been added to the initiative tracker.")
        }
        this.#start_turn()
    }

    static remove_creatures(creatures=allSelected()) {
        // Remove creatures from initiative
        for (let i = 0; i < creatures.length; i++) {
            const creature = creatures[i]
            delete this.#creatures[creature.id]

            // Logging
        log(creature.name + " has been removed from the initiative tracker.")
        }
    }

    //=====================================================================================================
    // Creature
    //=====================================================================================================

    static set_recovery(value, creature=impersonated()) {
        const current_recovery = this.#creatures[creature.id].recovery
        this.#creatures[creature.id].recovery = Math.max(current_recovery, value)
    }

    static suspend_turn(time, description, creature=impersonated()) {
        // Validation
        if (creature.id != this.current_creature) return

        // Update creature initiative object
        const init_creature = this.creatures[this.current_creature]
        this.#creatures[this.current_creature] = {
            initiative: init_creature.initiative + time,
            status: "Suspended",
            description: description
        }

        // Logging
        public_log(creature.name + " has started " + description + ".")

        // Start next turn
        this.#start_turn()
    }

    static end_turn(creature=impersonated()) {
        // Validation
        if (creature.id != this.current_creature) return

        // Clear turn combat resources BUT reaction
        for (const name of ["Action", "Bonus Action", "Attack Action", "Movement"]) {
            creature.set_resource_value(name, 0)
        }

        // Update creature initiative object
        const init_creature = this.creatures[this.current_creature]
        this.#creatures[this.current_creature] = {
            initiative: Math.max(12 + init_creature.recovery + creature.initiative_mod, 12),
            recovery: 0,
            status: "None",
            description: ""
        }

        // Logging
        public_log(creature.name + " ended their turn.")
        
        // Start next turn
        this.#start_turn()
    }
}