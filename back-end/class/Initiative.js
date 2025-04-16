

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

    static add_creature(creature=selected()) {
        const initiative_roll = Math.ceil(Math.random() * 6)

        this.#creatures[creature.id] = {
            initiative: initiative_roll + creature.initiative_mod,
            recovery: 0,
            status: "None", // None, Playing, Suspended
            description: ""
        }
    }

    static remove_creature(creature=selected()) {
        delete this.#creatures[creature.id]
    }

    static set_recovery(value, creature=impersonated()) {
        const current_recovery = this.#creatures[creature.id].recovery
        this.#creatures[creature.id].recovery = Math.max(current_recovery, value)
    }

    static start() {
        if (turn_order.length < 2) {
            log("Failed to start initiative, due to insufficient characters")
            return
        }

        
        this.current_creature = this.turn_order[0]
        this.#creatures[this.current_creature].recovery = 0
        this.#creatures[this.current_creature].status = "Playing"
        instance(this.current_creature).turn_start()
    }

    static end_turn(creature=impersonated()) {

    }
}