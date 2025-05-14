

var Initiative = class {

    //=====================================================================================================
    // Stored Attributes
    //=====================================================================================================

    static #data = MapTool.tokens.getTokenByID("6C44FBFB69674787B1D79E5DF5DCDC12")

    //=====================================================================================================
    // Creatures
    //=====================================================================================================

    static get creatures () {
        const object = JSON.parse(this.#data.getProperty("object"))
        return object?.creatures || {}
    }

    static set creatures (creatures) {
        const object = JSON.parse(this.#data.getProperty("object")) || {}
        object.creatures = creatures

        this.#data.setProperty("object", JSON.stringify(object))
    }

    static get creatures_info () {
        const return_list = []
        const creatures = this.creatures

        for (const id of this.turn_order) {
            const creature = instance(id)
            if (!creature) {
                this.remove_creature(id)
                continue
            }
            const initiative_info = creatures[id]

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

    static add_creature (creature=selected(), nextRound = false) {
        if (!creature) return

        // Roll
        const initiative_roll = Math.ceil(Math.random() * 6)

        // Object
        this.creatures = {
            ...this.creatures,
            [creature.id]: {
                initiative: initiative_roll + creature.initiative_mod + (nextRound ? 12 : 0),
                recovery: 0,
                status: "None", // None, Playing, Suspended
                description: ""
            }
        }

        // Clear creature combat resources
        for (const name of ["Action", "Bonus Action", "Attack Action", "Reaction", "Movement"]) {
            creature.set_resource_value(name, 0)
        }

        // Logging
        log(creature.name + " has been added to the initiative tracker.")
    }

    static add_creatures (creatures=allSelected()) {
        if (creatures.length < 1) return

        // Verifies if round has already started
        let hasPlayer = false
        for (const id in this.creatures) {
            if (this.creatures[id].status == "Playing") {
                hasPlayer = true
            }
        }

        // Adds new character
        for (const creature of creatures) {
            this.add_creature(creature, hasPlayer)
        }

        // If round hasnt started, starts it
        if (!hasPlayer) this.next_creature()
    }

    static remove_creature (id=getSelected()) {
        const temp_creatures = this.creatures
        delete temp_creatures[id]
        this.creatures = temp_creatures
    }

    static clear_initiative () {
        this.creatures = {}
    }

    //=====================================================================================================
    // Rounds
    //=====================================================================================================

    static get current_round () {
        const object = JSON.parse(this.#data.getProperty("object"))
        return object?.current_round || 0
    }

    static set current_round (current_round) {
        const object = JSON.parse(this.#data.getProperty("object")) || 0
        object.current_round = current_round

        this.#data.setProperty("object", JSON.stringify(object))
    }

    static get turn_order () {

        // Verify Invalid IDs
        for (const id of Object.keys(this.creatures)) {
            if (instance(id) == undefined) this.remove_creature(id)
        }

        // Sort by initiative
        const return_value = Object.keys(this.creatures).sort(
            (a, b) => this.creatures[a].initiative - this.creatures[b].initiative
        )

        // Set move lock
        moveLock(return_value.length < 1)

        return return_value
    }

    static get current_creature () {
        if (this.turn_order.length < 1) return null
        const current_creature_id = this.turn_order[0]

        // Decrease initiative for all if current init > 12
        while (this.creatures[current_creature_id].initiative >= 12) {
            for (const id of this.turn_order) {
                this.creatures = {
                    ...this.creatures,
                    [id]: {
                        ...this.creatures[id],
                        initiative: this.creatures[id].initiative - 12,
                    }
                }
            }

            this.current_round += 1
        }

        return current_creature_id
    }

    //=====================================================================================================
    // Methods
    //=====================================================================================================

    static next_creature() {
        // Next playing creature
        const creature = instance(this.current_creature)
        const creature_init = this.creatures[this.current_creature]

        // If was suspended don't reset values
        const isSuspended = creature_init.status == "Suspended"
        const recovery = isSuspended ? creature_init.recovery : 0

        // Update initiative info
        this.creatures = {
            ...this.creatures,
            [creature.id]: {
                ...creature_init,
                recovery: recovery,
                status: "Playing",
                description: ""
            }
        }
        
        // Recover resources
        if (!isSuspended) creature.turn_start()

        // Logging
        if (!isSuspended) public_log(`${creature.name_color} started their turn.`)
        else public_log(`${creature.name_color} has finished ${creature_init.description}.`)
    }

    static suspend_turn(time, description, creature=impersonated()) {
        if (creature.id != this.current_creature) return

        // Update initiative info
        const creature_init = this.creatures[this.current_creature]
        this.creatures = {
            ...this.creatures,
            [creature.id]: {
                ...creature_init,
                initiative: creature_init.initiative + time,
                status: "Suspended",
                description: description
            }
        }

        // Logging
        public_log(`${creature.name_color} has started ${description}.`)

        // Next creature
        this.next_creature()
    }

    static end_turn(creature=impersonated()) {
        if (creature.id != this.current_creature) return

        // Clear remaining combat resources except reaction
        for (const name of ["Action", "Bonus Action", "Attack Action", "Movement"]) {
            creature.set_resource_value(name, 0)
        }

        // Update initiative info
        const creature_init = this.creatures[this.current_creature]
        this.creatures = {
            ...this.creatures,
            [creature.id]: {
                initiative: Math.max(12 + creature_init.recovery + creature.initiative_mod, 12),
                recovery: 0,
                status: "None",
                description: ""
            }
        }

        // Logging
        public_log(`${creature.name_color} ended their turn.`)

        // Next creature
        this.next_creature()
    }

    static set_recovery(value, creature=impersonated()) {
        if (!this.turn_order.includes(creature.id)) return

        // Update initiative info
        const creature_init = this.creatures[creature.id]
        this.creatures = {
            ...this.creatures,
            [creature.id]: {
                ...creature_init,
                recovery: Math.max(creature_init.recovery, (value || 0)),
            }
        }
    }

}