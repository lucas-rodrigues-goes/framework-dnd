

var Initiative = class {

    //=====================================================================================================
    // Stored Attributes
    //=====================================================================================================

    static #data = MapTool.tokens.getTokenByID(
        getTokenID("lib:initiative", "Framework")
    );

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
                portrait: creature.portrait || creature.image,
                name: creature.name,
                attitude: creature.attitude,
                status: initiative_info.status,
                description: initiative_info.description,
                initiative: initiative_info.initiative - creatures[this.turn_order[0]].initiative,
                offset: initiative_info.offset,
            })
        }

        return return_list
    }

    static add_creature (creature=selected(), nextRound = false) {
        if (!creature) return

        // Roll
        const initial_offset = Math.ceil(Math.random() * 6) + creature.initiative_mod + (nextRound ? 12 : 0)

        // Object
        this.creatures = {
            ...this.creatures,
            [creature.id]: {
                initiative: initial_offset,
                recovery: 0,
                offset: initial_offset,
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
        while (this.creatures[current_creature_id].initiative >= 12 && false) {
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
        if (!isSuspended) console.log(`${creature.name_color} started their turn.`, "all")
        else {
            switch (creature_init.description) {
                case "Spellcasting": {
                    if (creature.has_condition("Spellcasting")) {
                        const condition = creature.get_condition("Spellcasting")
                        const {spell} = condition
                        console.log(`${creature.name_color} has finished casting ${spell.name}.`, "all")
                    }
                    else console.log(`${creature.name_color} resumed their turn.`, "all")

                    break
                }
                default: {
                    console.log(`${creature.name_color} has finished ${creature_init.description}.`, "all")
                    break
                }
            }
        }
    }

    static suspend_turn(time, description, creature=impersonated()) {
        if (creature.id != this.current_creature) return

        const creature_init = this.creatures[this.current_creature]
        const initiative = creature_init.initiative + time

        // Update initiative info
        this.creatures = {
            ...this.creatures,
            [creature.id]: {
                ...creature_init,
                initiative: initiative,
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
        creature.turn_end()

        // Calculate time advancement based on initiative difference
        const current_initiative = this.creatures[this.current_creature].initiative
        const next_creature_id = this.turn_order[1] // Next creature in turn order
        
        let initiative_difference = 0
        
        if (next_creature_id) {
            // Normal case: next creature in same round
            const next_initiative = this.creatures[next_creature_id].initiative
            initiative_difference = next_initiative - current_initiative
        } else {
            // End of round: calculate difference to first creature of next round
            const first_creature_id = this.turn_order[0]
            const first_initiative = this.creatures[first_creature_id].initiative
            // Difference from current to first creature + 12 (round advancement)
            initiative_difference = (first_initiative + 12) - current_initiative
        }
        
        // Convert initiative difference to time (each initiative point = 0.5 seconds)
        const time_advancement = initiative_difference * 0.5
        
        // Advance global time
        Time.current = Time.current + time_advancement
        
        console.log(`Time advanced by ${time_advancement} seconds (initiative difference: ${initiative_difference}).`, "debug")

        // Offset
        const creature_init = this.creatures[this.current_creature]
        const offset = creature_init.offset + 12

        // Update initiative info
        this.creatures = {
            ...this.creatures,
            [creature.id]: {...this.creatures[creature.id],
                initiative: offset + creature_init.recovery,
                recovery: 0,
                offset: offset,
                status: "None",
                description: ""
            }
        }

        // Logging
        console.log(`${creature.name_color} ended their turn. <br><br><br>`, "all")

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