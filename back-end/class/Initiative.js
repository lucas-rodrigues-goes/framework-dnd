

var Initiative = class {

    //=====================================================================================================
    // Attributes
    //=====================================================================================================

    static #creatures = {}
    static #total_rounds = 1

    //=====================================================================================================
    // Getters
    //=====================================================================================================

    static get creatures () {return this.#creatures}
    static get total_rounds () {return this.#total_rounds}
    static get current_creature() {return this.turn_order[0] || null}
    static get turn_order () {
        const creatures = this.#creatures
        const turn_order = Object.keys(creatures).sort(
            (a, b) => creatures[a].initiative - creatures[b].initiative
        )

        return turn_order
    }

    //=====================================================================================================
    // Setters
    //=====================================================================================================

    static clear_initiative() { this.#creatures = {} }
    
    static add_creature(creature=selected()) {
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

    static remove_creature(creature=selected()) {
        delete this.#creatures[creature.id]

        // Logging
        log(creature.name + " has been removed from the initiative tracker.")
    }

    static set_recovery(value, creature=impersonated()) {
        const current_recovery = this.#creatures[creature.id].recovery
        this.#creatures[creature.id].recovery = Math.max(current_recovery, value)
    }

    static start_turn() {
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
            public_log(creature.name + " resumed their turn.")
        }
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
            initiative: 12 + init_creature.recovery + creature.initiative_mod,
            recovery: 0,
            status: "None",
            description: ""
        }

        // Logging
        public_log(creature.name + " ended their turn.")
        
        // Start next turn
        this.start_turn()
    }
}