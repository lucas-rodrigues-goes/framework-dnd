

var Features = class extends Abilities {
    // Ability List
    static abilities_list(character=impersonated()) {
        const origin = "Features"
        const abilities_list = {}

        /* Barbarian */ {
            // Rage
            if (character.has_feature("Rage")) abilities_list["rage"] = {
                resources: ["Bonus Action", "Rage"],
                description: database.features.data["Rage"].description,
                image: database.conditions.data["Rage"].image,
                duration: 10,
                type: "Class",
                origin: origin,
            }

            // Reckless Attack
            if (character.has_feature("Reckless Attack")) abilities_list["reckless_attack"] = {
                resources: [],
                description: database.features.data["Reckless Attack"].description,
                image: database.conditions.data["Reckless Attack"]?.image || "",
                type: "Class",
                origin: origin,
            }
        }

        /* Fighter */ {
            // Second Wind
            if (character.has_feature("Second Wind")) abilities_list["second_wind"] = {
                resources: ["Bonus Action", "Second Wind"],
                description: database.features.data["Second Wind"].description,
                image: database.resources.data["Second Wind"].image,
                type: "Class",
                origin: origin,
            }

            // Action Surge
            if (character.has_feature("Action Surge")) abilities_list["action_surge"] = {
                resources: ["Action Surge"],
                description: database.features.data["Action Surge"].description,
                image: database.resources.data["Action Surge"].image,
                type: "Class",
                origin: origin,
            }
        }

        /* Rogue */ {
            // Sneak Attack
            const weapon = database.items.data[character.equipment["primary main hand"]?.name]
            const dex_weapon = weapon ? weapon.properties.includes("Finesse") || weapon.properties.includes("Ammunition") : false
            if (character.has_feature("Sneak Attack") && dex_weapon) abilities_list["sneak_attack"] = {
                resources: ["Attack Action"],
                description: database.features.data["Sneak Attack"]?.description || "",
                image: "asset://435a7b34151f79f73434ceb6afa08b30",
                type: "Attack",
                origin: origin,
            }

            // Cunning Action
            if (character.has_feature("Cunning Action")) {
                const type = "Class"
                abilities_list["cunning_action_dash"] = {
                    resources: ["Bonus Action"],
                    description: "Gain additional movement equal to your speed.",
                    recovery: 1,
                    image: "asset://7fe39c0d255e80ca5660f8d9a6abba3d",
                    type: type,
                    origin: origin
                }
                abilities_list["cunning_action_disengage"] = {
                    resources: ["Bonus Action"],
                    description: "Your movement doesn't provoke opportunity attacks for the rest of the turn.",
                    recovery: 1,
                    image: "asset://ea67e63502d661de59785523fbd74e7a",
                    type: type,
                    origin: origin
                }
                abilities_list["cunning_action_hide"] = {
                    resources: ["Bonus Action"],
                    description: "Attempt to hide from enemies using Stealth.",
                    recovery: 1,
                    image: "asset://1ac1fc61d91ead286a1ed4bf61f791fc",
                    type: type,
                    origin: origin
                }
            }
        }

        return abilities_list
    }

    //---------------------------------------------------------------------------------------------------
    // Barbarian
    //---------------------------------------------------------------------------------------------------

    // Rage
    static rage() {
        // Requirements
        const { valid, character, action_details } = this.check_action_requirements("rage", false);
        if (!valid) return;

        // Reduction
        let reduction = 3; {
            const barbarian_level = character.classes?.Barbarian?.level || 0
            if (barbarian_level > 5) reduction = 5
            if (barbarian_level > 11) reduction = 7
            if (barbarian_level > 17) reduction += 9
        }

        // Receive condition
        character.set_condition("Rage", 10, {
            resistances: {
                Slashing: {type: "resistance", reduction: reduction},
                Bludgeoning: {type: "resistance", reduction: reduction},
                Piercing: {type: "resistance", reduction: reduction},
            }
        })

        // Consume resources
        this.use_resources(action_details.resources)
        Initiative.set_recovery(action_details.recovery, character)

        // Logging
        public_log(`${character.name_color} is enraged!`)
    }

    // Reckless Attack
    static reckless_attack() {
        // Requirements
        const { valid, character, action_details } = this.check_action_requirements("reckless_attack", false);
        if (!valid) return;

        // Receive condition
        character.set_condition("Reckless Attack", 1)

        // Consume resources
        this.use_resources(action_details.resources)
        Initiative.set_recovery(action_details.recovery, character)

        // Logging
        public_log(`${character.name_color} throws aside all concern for defense and attacks recklessly!`)
    }

    //---------------------------------------------------------------------------------------------------
    // Fighter
    //---------------------------------------------------------------------------------------------------

    // Second Wind
    static second_wind() {
        const action_name = "second_wind"

        // Requirements
        const { valid, character, action_details } = this.check_action_requirements(action_name, false);
        if (!valid) return;

        // Receive Healing
        const healing = roll(10) + (character.classes.Fighter?.level || 1)
        character.receive_healing(healing)

        // Consume resources
        this.use_resources(action_details.resources)
        Initiative.set_recovery(action_details.recovery, character)

        // Logging
        public_log(`${character.name_color} has utilized second wind, regaining ${healing} hit points`)
    }

    // Action Surge
    static action_surge() {
        const action_name = "action_surge"

        // Requirements
        const { valid, character, action_details } = this.check_action_requirements(action_name, false);
        if (!valid) return;

        // Gain extra action
        character.set_resource_max("Action", character.resources["Action"].max + 1)
        character.set_resource_value("Action", character.resources["Action"].value + 1)

        // Consume resources
        this.use_resources(action_details.resources)
        Initiative.set_recovery(action_details.recovery, character)

        // Logging
        public_log(`${character.name_color} has utilized action surge, gaining an extra action.`)
    }

    //---------------------------------------------------------------------------------------------------
    // Rogue
    //---------------------------------------------------------------------------------------------------

    // Sneak Attack
    static sneak_attack() {
        const action_name = "sneak_attack"
        const slot = "primary main hand"
        const target = selected()

        // Requirements
        const { valid, creature, action_details } = this.check_action_requirements(action_name);
        if (!valid || !target) return;
        const hasAdvantage = this.attack_roll_advantage_modifiers({creature, target, view_only: true}) > 0
        if (!hasAdvantage) {
            console.log(`${creature.name_color} needs advantage on attack roll to use Sneak Attack.`, "all")
            return
        }

        // Sneak Attack damage bonus
        const weapon = database.items.data[creature.equipment[slot]?.name]
        const rogue_level = creature ? creature.classes.Rogue?.level || 1 : 1
        const damage_bonuses = [{
            die_amount: Math.ceil(rogue_level / 2),
            die_size: (calculate_distance(creature, target) * 5) > 5 ? 4 : 8,
            damage_type: weapon.damage?.[0]?.damage_type || "piercing" 
        }]

        // Make attack
        const attack_result = this.make_attack({slot, creature, target, damage_bonuses: damage_bonuses})
        if (!attack_result.success) {
            console.log(attack_result.message, "all")
            return
        }

        // Consume resources
        this.use_resources(action_details.resources)
        Initiative.set_recovery(action_details.recovery, creature)

        // Logging
        console.log(attack_result.message, "all")
    }

    // Cunning Action Dash
    static cunning_action_dash () {
        // Requirements
        const { valid, creature, action_details } = this.check_action_requirements("cunning_action_dash", false);
        if (!valid) return;

        // New movement
        const current_movement = creature.resources["Movement"]
        const speed = creature.speed
        creature.set_resource_max("Movement", current_movement.max + speed)
        creature.set_resource_value("Movement", current_movement.value + speed)

        // Consume resources
        this.use_resources(action_details.resources)
        Initiative.set_recovery(action_details.recovery, creature)

        // Logging
        public_log(creature.name_color + " dashes, gaining extra movement for this round.")
    }
    
    // Cunning Action Disengage
    static cunning_action_disengage () {
        // Requirements
        const { valid, creature, action_details } = this.check_action_requirements("cunning_action_disengage", false);
        if (!valid) return;

        // Condition
        creature.set_condition("Disengage", 1)

        // Consume resources
        this.use_resources(action_details.resources)
        Initiative.set_recovery(action_details.recovery, creature)

        // Logging
        public_log(creature.name_color + " disengages, gaining immunity to opportunity attacks.")
    }

    // Cunning Action Hide
    static cunning_action_hide () {
        // Free unhide
        const creature = impersonated()
        if(creature.has_condition("Hidden")) {
            creature.remove_condition("Hidden")
            public_log(`${creature.name_color} has stopped hiding.`)
            return
        }

        // Requirements
        const { valid, action_details } = this.check_action_requirements("cunning_action_hide", false);
        if (!valid) return

        // Condition
        creature.set_condition("Hidden", -1)
        creature.maintain_stealth(true)

        // Consume resources
        this.use_resources(action_details.resources)
        Initiative.set_recovery(action_details.recovery, creature)
    }

    //---------------------------------------------------------------------------------------------------
    // Wizard
    //---------------------------------------------------------------------------------------------------
    
    // Arcane Recovery
    static arcane_recovery(level) {
        const character = impersonated()
        const arcane_recovery_charges = character.resources["Arcane Recovery"].value
        const cost = {
            1: 2,
            2: 3,
            3: 5,
            4: 6,
            5: 7
        }[level]

        // Validation
        if (arcane_recovery_charges < cost) {
            public_log(`${character.name_color} has insufficient Arcane Recovery charges for this spell level.`)
            return
        }

        // Increase Resource
        const slot = level
        const postfix = ["st", "nd", "rd"].length >= slot ? ["st", "nd", "rd"][slot - 1] : "th"
        const spell_slot = `${slot}${postfix} Level Spell Slot`
        character.set_resource_value(spell_slot, character.resources[spell_slot].value + 1)

        // Consume Arcane Recovery Charges
        character.set_resource_value("Arcane Recovery", arcane_recovery_charges - cost)

        // Logging
        console.log(`${character.name} used ${cost} Arcane Recovery charges to regain a ${spell_slot}.`, "all")
    }

    //---------------------------------------------------------------------------------------------------
}
