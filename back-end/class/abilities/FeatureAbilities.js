

var FeatureAbilities = class extends Abilities {
    // Ability List
    static abilities_list(creature=impersonated()) {
        const origin = "FeatureAbilities"
        const abilities_list = {}
        const type = "Class"

        /* Barbarian */ {
            // Rage
            if (creature.has_feature("Rage")) abilities_list["rage"] = {
                resources: ["Bonus Action", "Rage"],
                description: database.features.data["Rage"].description,
                image: database.conditions.data["Rage"].image,
                duration: 10,
                type: type,
                origin: origin,
            }

            // Reckless Attack
            if (creature.has_feature("Reckless Attack")) abilities_list["reckless_attack"] = {
                resources: [],
                description: database.features.data["Reckless Attack"].description,
                image: database.conditions.data["Reckless Attack"]?.image || "",
                type: type,
                origin: origin,
            }
        }

        /* Fighter */ {
            // Second Wind
            if (creature.has_feature("Second Wind")) abilities_list["second_wind"] = {
                resources: ["Bonus Action", "Second Wind"],
                description: database.features.data["Second Wind"].description,
                image: database.resources.data["Second Wind"].image,
                type: type,
                origin: origin,
            }

            // Action Surge
            if (creature.has_feature("Action Surge")) abilities_list["action_surge"] = {
                resources: ["Action Surge"],
                description: database.features.data["Action Surge"].description,
                image: database.resources.data["Action Surge"].image,
                type: "Class",
                origin: origin,
            }
        }

        /* Rogue */ {
            // Sneak Attack
            const weapon = database.items.data[creature.equipment["primary main hand"]?.name]
            const dex_weapon = weapon ? weapon.properties.includes("Finesse") || weapon.properties.includes("Ammunition") : false
            if (creature.has_feature("Sneak Attack") && dex_weapon && false) abilities_list["sneak_attack"] = {
                resources: ["Attack Action"],
                description: database.features.data["Sneak Attack"]?.description || "",
                image: "asset://768444307168cbf3706b175b123254a8",
                type: "Special",
                origin: origin,
            }

            // Cunning Action
            if (creature.has_feature("Cunning Action")) {
                abilities_list["cunning_action_dash"] = {
                    resources: ["Bonus Action"],
                    description: "Gain additional movement equal to your speed.",
                    recovery: 1,
                    image: "asset://afd94483c4e745e9286407e9222d4bc1",
                    type: type,
                    origin: origin
                }
                abilities_list["cunning_action_disengage"] = {
                    resources: ["Bonus Action"],
                    description: "Your movement doesn't provoke opportunity attacks for the rest of the turn.",
                    recovery: 1,
                    image: "asset://da4599c3e9967fc3e9bd769d414fbbfd",
                    type: type,
                    origin: origin
                }
                abilities_list["cunning_action_hide"] = {
                    resources: ["Bonus Action"],
                    description: "Attempt to hide from enemies using Stealth.",
                    recovery: 1,
                    image: "asset://383a78f2be296460f79b7ecd4a350daf",
                    type: type,
                    origin: origin
                }
            }
        }

        /* Wizard */ {
            // Arcane Recovery
            if (creature.has_feature("Arcane Recovery")) abilities_list["arcane_recovery"] = {
                resources: ["Action"],
                description: database.features.data["Arcane Recovery"]?.description || "",
                image: "asset://35c7096bb5a958052e60523d7cff4543",
                type: type,
                origin: origin,
            }
        }

        /* Sorcerer */ {
            // Flexible Casting
            if (creature.has_feature("Font of Magic")) abilities_list["flexible_casting"] = {
                name: "Font of Magic",
                resources: ["Bonus Action"],
                description: "You can use a bonus action to convert between your spell slots and sorcery points.",
                image: "asset://57460f85630f7d84602ff9128eccfef4",
                type: type,
                origin: origin,
            }

            // Metamagic: Distant Spell
            if (creature.has_feature("Metamagic: Distant Spell")) abilities_list["mm_distant_spell"] = {
                name: "Distant Spell",
                resources: ["Sorcery Point"],
                description: database.features.data["Metamagic: Distant Spell"]?.description || "",
                image: "asset://57460f85630f7d84602ff9128eccfef4",
                type: type,
                origin: origin,
            }

            // Metamagic: Empowered Spell
            if (creature.has_feature("Metamagic: Empowered Spell")) abilities_list["mm_empowered_spell"] = {
                name: "Empowered Spell",
                resources: ["Sorcery Point"],
                description: database.features.data["Metamagic: Empowered Spell"]?.description || "",
                image: "asset://57460f85630f7d84602ff9128eccfef4",
                type: type,
                origin: origin,
            }

            // Metamagic: Transmute Spells
            if (creature.has_feature("Metamagic: Transmute Spells")) abilities_list["mm_transmute_spells"] = {
                name: "Transmute Spells",
                resources: ["Sorcery Point"],
                description: database.features.data["Metamagic: Transmute Spells"]?.description || "",
                image: "asset://57460f85630f7d84602ff9128eccfef4",
                type: type,
                origin: origin,
            }

            // Metamagic: Extended Spells
            if (creature.has_feature("Metamagic: Extended Spell")) abilities_list["mm_extended_spell"] = {
                name: "Extended Spells",
                resources: ["Sorcery Point"],
                description: database.features.data["Metamagic: Extended Spell"]?.description || "",
                image: "asset://57460f85630f7d84602ff9128eccfef4",
                type: type,
                origin: origin,
            }

            // Metamagic: Quickened Spell
            if (creature.has_feature("Metamagic: Quickened Spell")) abilities_list["mm_quickened_spell"] = {
                name: "Quickened Spell",
                resources: ["Sorcery Point"],
                description: database.features.data["Metamagic: Quickened Spell"]?.description || "",
                image: "asset://57460f85630f7d84602ff9128eccfef4",
                type: type,
                origin: origin,
            }
        }

        return abilities_list
    }

    //---------------------------------------------------------------------------------------------------
    // Barbarian
    //---------------------------------------------------------------------------------------------------

    static rage() {
        // Requirements
        const { valid, creature, action_details } = this.check_action_requirements("rage", false);
        if (!valid) return;

        // Reduction
        let reduction = 3; {
            const barbarian_level = creature.classes?.Barbarian?.level || 0
            if (barbarian_level > 5) reduction = 5
            if (barbarian_level > 11) reduction = 7
            if (barbarian_level > 17) reduction = 9
        }

        // Receive condition
        creature.set_condition("Rage", 10, {
            resistances: {
                Slashing: {type: "resistance", reduction: reduction},
                Bludgeoning: {type: "resistance", reduction: reduction},
                Piercing: {type: "resistance", reduction: reduction},
            }
        })

        // Consume resources
        this.use_resources(action_details.resources)
        Initiative.set_recovery(action_details.recovery, creature)

        // Logging
        public_log(`${creature.name_color} is enraged!`)
    }

    static reckless_attack() {
        // Requirements
        const { valid, creature, action_details } = this.check_action_requirements("reckless_attack", false);
        if (!valid) return;

        // Receive condition
        creature.set_condition("Reckless Attack", 1)

        // Consume resources
        this.use_resources(action_details.resources)
        Initiative.set_recovery(action_details.recovery, creature)

        // Logging
        public_log(`${creature.name_color} throws aside all concern for defense and attacks recklessly!`)
    }

    //---------------------------------------------------------------------------------------------------
    // Fighter
    //---------------------------------------------------------------------------------------------------

    static second_wind() {
        const action_name = "second_wind"

        // Requirements
        const { valid, creature, action_details } = this.check_action_requirements(action_name, false);
        if (!valid) return;

        // Receive Healing
        const healing = roll(10) + (creature.classes.Fighter?.level || 1)
        creature.receive_healing(healing)

        // Consume resources
        this.use_resources(action_details.resources)
        Initiative.set_recovery(action_details.recovery, creature)

        // Logging
        public_log(`${creature.name_color} has utilized second wind, regaining ${healing} hit points`)
    }

    static action_surge() {
        const action_name = "action_surge"

        // Requirements
        const { valid, creature, action_details } = this.check_action_requirements(action_name, false);
        if (!valid) return;

        // Gain extra action
        creature.set_resource_max("Action", creature.resources["Action"].max + 1)
        creature.set_resource_value("Action", creature.resources["Action"].value + 1)

        // Consume resources
        this.use_resources(action_details.resources)
        Initiative.set_recovery(action_details.recovery, creature)

        // Logging
        public_log(`${creature.name_color} has utilized action surge, gaining an extra action.`)
    }

    //---------------------------------------------------------------------------------------------------
    // Rogue
    //---------------------------------------------------------------------------------------------------

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
    
    static arcane_recovery(level) {
        // Ask level if not provided
        if (!level) {
            // Get the creature's spellcasting level
            const spellcastingLevel = impersonated().spellcasting_level
            
            // Calculate maximum spell slot level (ceil(spellcasting_level/2) up to maximum of 5)
            const maxSpellSlotLevel = Math.min(Math.ceil(spellcastingLevel / 2), 5)
            
            // Generate available options from 1 to maxSpellSlotLevel
            const availableOptions = []
            for (let i = 1; i <= maxSpellSlotLevel; i++) {
                availableOptions.push(i.toString())
            }

            level = input({
                "spellSlotLevel": {
                    value: availableOptions.join(","),
                    label: "Spell Slot Level",
                    type: "list",
                    options: {
                        select: 0, // Selects the first option by default
                        value: "string", // Return the string value instead of index number
                        delimiter: "," // Delimiter for the list
                    }
                }
            }).spellSlotLevel
        }

        const creature = impersonated()
        const arcane_recovery_charges = creature.resources["Arcane Recovery"].value
        const cost = {
            1: 2,
            2: 3,
            3: 5,
            4: 6,
            5: 7
        }[level]

        // Validation
        if (arcane_recovery_charges < cost) {
            public_log(`${creature.name_color} has insufficient Arcane Recovery charges for this spell level.`)
            return
        }

        // Increase Resource
        const slot = level
        const postfix = ["st", "nd", "rd"].length >= slot ? ["st", "nd", "rd"][slot - 1] : "th"
        const spell_slot = `${slot}${postfix} Level Spell Slot`
        creature.set_resource_value(spell_slot, creature.resources[spell_slot].value + 1)

        // Consume Arcane Recovery Charges
        creature.set_resource_value("Arcane Recovery", arcane_recovery_charges - cost)

        // Logging
        console.log(`${creature.name_color} used ${cost} Arcane Recovery charges to regain a ${spell_slot}.`, "all")
    }

    //---------------------------------------------------------------------------------------------------
    // Sorcerer
    //---------------------------------------------------------------------------------------------------
    
    static flexible_casting() {
        const creature = impersonated()
        const sorceryPoints = creature.resources["Sorcery Point"].value
        
        // Calculate available spell slot levels (same logic as arcane_recovery)
        const spellcastingLevel = creature.spellcasting_level
        const maxSpellSlotLevel = Math.min(Math.ceil(spellcastingLevel / 2), 5)
        
        const availableSpellSlots = []
        for (let i = 1; i <= maxSpellSlotLevel; i++) {
            availableSpellSlots.push(i.toString())
        }

        // Single input asking what to do
        const result = input({
            "action": {
                value: "Sorcery Points, Spell Slots",
                label: "Convert to",
                type: "list",
                options: {
                    select: 0,
                    value: "string",
                    delimiter: ","
                }
            },
            "spellSlotLevel": {
                value: availableSpellSlots.join(","),
                label: "Spell Slot Level",
                type: "list",
                options: {
                    select: 0,
                    value: "string",
                    delimiter: ","
                }
            }
        })

        const action = result.action
        const slotLevel = Number(result.spellSlotLevel)
        
        // Use the same cost structure as arcane_recovery
        const cost = {
            1: 2,
            2: 3,
            3: 5,
            4: 6,
            5: 7
        }[slotLevel]

        const postfix = ["st", "nd", "rd"].length >= slotLevel ? ["st", "nd", "rd"][slotLevel - 1] : "th"
        const spellSlotName = `${slotLevel}${postfix} Level Spell Slot`

        if (action === "Spell Slots") {
            // Convert Sorcery Points to Spell Slots
            if (sorceryPoints < cost) {
                public_log(`${creature.name_color} has insufficient Sorcery Points. Need ${cost} but only have ${sorceryPoints}.`)
                return
            }

            // Create spell slot and consume Sorcery Points
            creature.set_resource_value(spellSlotName, creature.resources[spellSlotName].value + 1)
            creature.set_resource_value("Sorcery Point", sorceryPoints - cost)

            console.log(`${creature.name_color} used ${cost} Sorcery Points to create a ${spellSlotName}.`, "all")

        } else if (action === "Sorcery Points") {
            // Convert Spell Slots to Sorcery Points
            if (creature.resources[spellSlotName].value < 1) {
                public_log(`${creature.name_color} has no available ${spellSlotName} to convert.`)
                return
            }

            // Consume spell slot and add Sorcery Points
            creature.set_resource_value(spellSlotName, creature.resources[spellSlotName].value - 1)
            creature.set_resource_value("Sorcery Point", sorceryPoints + cost)

            console.log(`${creature.name_color} converted a ${spellSlotName} into ${cost} Sorcery Points.`, "all")
        }
    }

    static _metamagic_ability(conditionName, cost = 1) {
        const creature = impersonated()
        
        // Check if already has condition - if so, cancel it and refund
        if (creature.has_condition(conditionName)) {
            creature.remove_condition(conditionName)
            // Refund resource if creature has Sorcery Points resource
            if (creature.resources["Sorcery Point"]) {
                creature.set_resource_value("Sorcery Point", creature.resources["Sorcery Point"].value + cost)
            }
            public_log(`${creature.name_color} has cancelled ${conditionName}.`)
            return
        }

        // Check resource if creature has Sorcery Points
        if (creature.resources["Sorcery Point"]) {
            const sorceryPoints = creature.resources["Sorcery Point"].value
            if (sorceryPoints < cost) {
                public_log(`${creature.name_color} has insufficient Sorcery Points. Need ${cost} but only have ${sorceryPoints}.`)
                return
            }
            
            // Consume resource
            creature.set_resource_value("Sorcery Point", sorceryPoints - cost)
        }

        // Set condition with indefinite duration
        creature.set_condition(conditionName, -1)

        // Logging
        public_log(`${creature.name_color} has activated ${conditionName}!`)
    }

    static mm_distant_spell() {
        this._metamagic_ability("Metamagic: Distant Spell", 1)
    }

    static mm_empowered_spell() {
        this._metamagic_ability("Metamagic: Empowered Spell", 2)
    }

    static mm_transmute_spells() {
        const conditionName = "Metamagic: Transmute Spells"
        const cost = 2
        const element = input({
            "element": {
                value: "Acid,Cold,Fire,Lightning,Poison,Thunder",
                label: "Element",
                type: "list",
                options: {
                    select: 0,
                    value: "string",
                    delimiter: ","
                }
            },
        }).element
        const creature = impersonated()
        
        // Check if already has condition - if so, cancel it and refund
        if (creature.has_condition(conditionName)) {
            creature.remove_condition(conditionName)
            // Refund resource if creature has Sorcery Points resource
            if (creature.resources["Sorcery Point"]) {
                creature.set_resource_value("Sorcery Point", creature.resources["Sorcery Point"].value + cost)
            }
            public_log(`${creature.name_color} has cancelled ${conditionName}.`)
            return
        }

        // Check resource if creature has Sorcery Points
        if (creature.resources["Sorcery Point"]) {
            const sorceryPoints = creature.resources["Sorcery Point"].value
            if (sorceryPoints < cost) {
                public_log(`${creature.name_color} has insufficient Sorcery Points. Need ${cost} but only have ${sorceryPoints}.`)
                return
            }
            
            // Consume resource
            creature.set_resource_value("Sorcery Point", sorceryPoints - cost)
        }

        // Set condition with indefinite duration
        creature.set_condition(conditionName, -1, {element})

        // Logging
        public_log(`${creature.name_color} has activated ${conditionName}!`)
    }

    static mm_extended_spell() {
        this._metamagic_ability("Metamagic: Extended Spell", 1)
    }

    static mm_quickened_spell() {
        this._metamagic_ability("Metamagic: Quickened Spell", 1)
    }

    //---------------------------------------------------------------------------------------------------
}
