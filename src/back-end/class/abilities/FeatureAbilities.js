

var FeatureAbilities = class extends Abilities {
    // Ability List
    static abilities_list(creature=impersonated()) {
        const functionName = (name) => name
            .replace(/:/g, '')
            .replace(/'/g, '')
            .replace(/ /g, '_')
            .toLowerCase()
        const showName = (name) => name.split(": ").length > 1 ? name.split(": ")[1] : name
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
            const dex_weapon = weapon ? weapon.properties.includes("Finesse") || weapon.properties.includes("Ametamagicunition") : false
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
                image: "asset://9450ecc71390028f870554777fd30aa9",
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
                image: "asset://8b516a8c5b986107a44dbbe3604e4921",
                type: type,
                origin: origin,
            }

            // Metamagic: Distant Spell
            if (creature.has_feature("Metamagic: Distant Spell")) abilities_list["metamagic_distant_spell"] = {
                name: "Distant Spell",
                resources: ["Sorcery Point"],
                description: database.features.data["Metamagic: Distant Spell"]?.description || "",
                image: "asset://6d29265ebcb20f82aa9dc7f4ef8f9770",
                type: type,
                origin: origin,
            }

            // Metamagic: Empowered Spell
            if (creature.has_feature("Metamagic: Empowered Spell")) abilities_list["metamagic_empowered_spell"] = {
                name: "Empowered Spell",
                resources: ["Sorcery Point"],
                description: database.features.data["Metamagic: Empowered Spell"]?.description || "",
                image: "asset://c0c5e4d651770d8a0a75d7effbab970e",
                type: type,
                origin: origin,
            }

            // Metamagic: Transmute Spells
            if (creature.has_feature("Metamagic: Transmute Spells")) abilities_list["metamagic_transmute_spells"] = {
                name: "Transmute Spells",
                resources: ["Sorcery Point"],
                description: database.features.data["Metamagic: Transmute Spells"]?.description || "",
                image: "asset://c13971b025cf97b90d4ff5ee17cd9702",
                type: type,
                origin: origin,
            }

            // Metamagic: Extended Spell
            if (creature.has_feature("Metamagic: Extended Spell")) abilities_list["metamagic_extended_spell"] = {
                name: "Extended Spell",
                resources: ["Sorcery Point"],
                description: database.features.data["Metamagic: Extended Spell"]?.description || "",
                image: "asset://31ce71797870fbfb2f73ea599cae5e36",
                type: type,
                origin: origin,
            }

            // Metamagic: Quickened Spell
            if (creature.has_feature("Metamagic: Quickened Spell")) abilities_list["metamagic_quickened_spell"] = {
                name: "Quickened Spell",
                resources: ["Sorcery Point"],
                description: database.features.data["Metamagic: Quickened Spell"]?.description || "",
                image: "asset://60567c73fd315a82ce2a75d4c9bd8fab",
                type: type,
                origin: origin,
            }
        }

        /* Warlock */ {
            let name;
            
            name = "Invocation: Armor of Shadows"
            if (creature.has_feature(name)) abilities_list[functionName(name)] = {
                name: showName(name),
                resources: ["Action"],
                description: database.features.data[name]?.description || "",
                image: "asset://183703eb6c279573111270c93b8b3110",
                type: type,
                origin: origin,
            }

            name = "Invocation: Fiendish Vigor"
            if (creature.has_feature(name)) abilities_list[functionName(name)] = {
                name: showName(name),
                resources: ["Action"],
                description: database.features.data[name]?.description || "",
                image: "asset://ddeff0e369848928fe844a9d17b1dcfe",
                type: type,
                origin: origin,
            }

            name = "Invocation: Maddening Hex"
            if (creature.has_feature(name)) abilities_list[functionName(name)] = {
                name: showName(name),
                resources: ["Bonus Action"],
                description: database.features.data[name]?.description || "",
                image: "asset://eaafbc9a39caf1309ce1c1ef12260992",
                type: type,
                origin: origin,
            }

            name = "Invocation: Shroud of Shadow"
            if (creature.has_feature(name)) abilities_list[functionName(name)] = {
                name: showName(name),
                resources: ["Action"],
                description: database.features.data[name]?.description || "",
                image: "asset://dbb54113cc9b2b32991f44356f5d869d",
                type: type,
                origin: origin,
            }
        }

        /* Ranger */ {
            let name;
            
            name = "Ranger's Companion"
            if (creature.has_feature(name)) abilities_list[functionName(name)] = {
                name: showName(name),
                resources: ["Action"],
                description: database.features.data[name]?.description || "",
                image: "asset://f0a05f39feac18ad8603bda1c9297ce4",
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
            if (barbarian_level >= 5) reduction = 5
            if (barbarian_level >= 11) reduction = 8
            if (barbarian_level >= 17) reduction = 10
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
        public_log(creature.name_color + " disengages, gaining imetamagicunity to opportunity attacks.")
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
        const action_name = "arcane_recovery"
        
        // Requirements
        const { valid, creature, action_details } = this.check_action_requirements(action_name, false);
        if (!valid) return

        // Ask level if not provided
        if (!level) {
            // Get the creature's spellcasting level
            const spellcastingLevel = creature.spellcasting_level
            
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
                        select: 0,
                        value: "string",
                        delimiter: ","
                    }
                }
            }).spellSlotLevel
        }

        const arcane_recovery_charges = creature.resources["Arcane Recovery"].value
        const cost = {
            1: 2,
            2: 3,
            3: 5,
            4: 6,
            5: 7
        }[level]

        // Validation
        if (!cost) {
            public_log(`${creature.name_color} selected an invalid spell slot level.`)
            return
        }
        
        if (arcane_recovery_charges < cost) {
            public_log(`${creature.name_color} has insufficient Arcane Recovery charges for this spell level. Need ${cost} but only have ${arcane_recovery_charges}.`)
            return
        }

        // Increase Resource
        const slot = parseInt(level)
        const postfix = ["st", "nd", "rd"].length >= slot ? ["st", "nd", "rd"][slot - 1] : "th"
        const spell_slot = `${slot}${postfix} Level Spell Slot`
        creature.set_resource_value(spell_slot, creature.resources[spell_slot].value + 1)

        // Consume Arcane Recovery Charges
        creature.set_resource_value("Arcane Recovery", arcane_recovery_charges - cost)

        // Consume resources (moved to after successful execution)
        this.use_resources(action_details.resources)
        Initiative.set_recovery(action_details.recovery, creature)

        // Logging
        console.log(`${creature.name_color} used ${cost} Arcane Recovery charges to regain a ${spell_slot}.`, "all")
    }

    //---------------------------------------------------------------------------------------------------
    // Sorcerer
    //---------------------------------------------------------------------------------------------------
    
    static flexible_casting() {
        const creature = impersonated()
        const sorceryPoints = creature.resources["Sorcery Point"].value

        // Requirements
        const { valid, action_details } = this.check_action_requirements("flexible_casting", false);
        if (!valid) return
        
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
                type: "radio",
                options: {
                    select: 0,
                    value: "string",
                    delimiter: ","
                }
            },
            "spellSlotLevel": {
                value: availableSpellSlots.join(","),
                label: "Spell Slot Level",
                type: "radio",
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

        // Consume resources
        this.use_resources(action_details.resources)
        Initiative.set_recovery(action_details.recovery, creature)
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

    static metamagic_distant_spell() {
        this._metamagic_ability("Metamagic: Distant Spell", 1)
    }

    static metamagic_empowered_spell() {
        this._metamagic_ability("Metamagic: Empowered Spell", 2)
    }

    static metamagic_transmute_spells() {
        const conditionName = "Metamagic: Transmute Spells"
        const cost = 2
        const element = input({
            "element": {
                value: "Acid,Cold,Fire,Lightning,Poison,Thunder",
                label: "Element",
                type: "radio",
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

    static metamagic_extended_spell() {
        this._metamagic_ability("Metamagic: Extended Spell", 1)
    }

    static metamagic_quickened_spell() {
        this._metamagic_ability("Metamagic: Quickened Spell", 1)
    }

    //---------------------------------------------------------------------------------------------------
    // Warlock
    //---------------------------------------------------------------------------------------------------

    static invocation_armor_of_shadows () {
        // Requirements
        const require_target = false
        const { valid, action_details } = this.check_action_requirements("invocation_armor_of_shadows", require_target);
        if (!valid) return

        // Effect
        Sound.play("invocation")
        const spellcast = Spells.mage_armor({name: "Armor of Shadows", force_self: true})
        if (spellcast.message) console.log(spellcast.message, "all")

        // Consume resources
        this.use_resources(action_details.resources)
        Initiative.set_recovery(action_details.recovery, creature)
    }

    static invocation_fiendish_vigor () {
        // Requirements
        const require_target = false
        const { creature, valid, action_details } = this.check_action_requirements("invocation_fiendish_vigor", require_target);
        if (!valid) return

        // Effect
        Sound.play("invocation")
        const spellcast = Spells.false_life({
            name: "Fiendish Vigor",
            spellcasting_modifier: creature.score_bonus.charisma || 0
        })
        if (spellcast.message) console.log(spellcast.message, "all")

        // Consume resources
        this.use_resources(action_details.resources)
        Initiative.set_recovery(action_details.recovery, creature)
    }

    static invocation_maddening_hex () {
        // Requirements
        const require_target = false
        const { creature, targets, valid, action_details } = this.check_action_requirements("invocation_maddening_hex", require_target);
        if (!valid) return
        if (targets.length < 1) {
            console.log(`${creature.name_color} needs to select a target for this action.`, "all")
        }

        // Localize hexed target
        let hexed_target
        for (const target of targets) {
            for (const condition of ["Hex", "Sign of Ill Omen", "Hexblade's Curse"]) {
                if (target.has_condition(condition)) {
                    if (target.get_condition(condition).source == creature.id) {
                        hexed_target = target
                        break
                    }
                }
            }
        }

        if (!hexed_target) {
            console.log(`${creature.name_color} needs to select a valid hexed target for this ability.`, "all")
        }

        // Effect
        Sound.play("invocation")
        const damage = Math.max(creature.score_bonus.charisma || 1, 1)
        for (const target of targets) {
            if (calculate_distance(target, hexed_target) * 5 <= 5) {
                const damageDealt = target.receive_damage(damage, "Psychic")
                console.log(`${creature.name_color} casts Maddening Hex on ${target.name_color} dealing ${damageDealt} psychic damage.`, "all")
            }
        }

        // Consume resources
        this.use_resources(action_details.resources)
        Initiative.set_recovery(action_details.recovery, creature)
    }

    static invocation_shroud_of_shadow () {
        // Requirements
        const require_target = false
        const { valid, action_details } = this.check_action_requirements("invocation_shroud_of_shadow", require_target);
        if (!valid) return

        // Effect
        Sound.play("invocation")
        const spellcast = Spells.invisibility({name: "Shroud of Shadow", force_self: true})
        if (spellcast.message) console.log(spellcast.message, "all")

        // Consume resources
        this.use_resources(action_details.resources)
        Initiative.set_recovery(action_details.recovery, creature)
    }

    //---------------------------------------------------------------------------------------------------
    // Ranger
    //---------------------------------------------------------------------------------------------------

    static rangers_companion () {
        const name = `Ranger's Companion`

        // Requirements
        const require_target = false
        const { valid, creature, target, action_details } = this.check_action_requirements("rangers_companion", require_target);
        if (!valid) return

        // Remove previous companion
        if (!target) {
            input({
                "none": {
                    label: "Are you sure you want to end your bond with your current companion?",
                    type: "label",
                    options: {
                        span: true
                    }
                }
            })
            const previous_target = this.remove_previous(creature, name); 
            return {
                success: false, 
                message: (previous_target
                    ? `${creature.name_color} ended their bond with ${previous_target.name_color}.`
                    : `${creature.name_color} needs to choose a target for this spell.`
                )
            }
        }

        // Max target XP
        const level = creature.classes.Ranger.level
        let max_exp; {
            if (level >= 15) max_exp = 450
            else if (level >= 7) max_exp = 200
            else if (level >= 5) max_exp = 100
            else if (level >= 3) max_exp = 50
        }
        if (target.exp > max_exp) {
            console.log(`This creature is too powerful for this.`, "all")
            return
        }

        // Validate Type
        if (["Humanoid"].includes(target.type)) {
            console.log(`${creature.name_color} selected an invalid creature for a companion.`, "all")
            return
        }

        // Validate Visibility
        const target_visibility = creature.target_visibility()
        if (target_visibility == 0) {
            console.log(`${creature.name_color} needs to see their target.`, "all")
            return
        }

        // Validate Range
        if (calculate_distance(creature, target) > 1) {
            console.log(`${creature.name_color} tried to cast ${name}, but their target is out of range.`, "all")
            return
        }

        // Validate if is in combat
        if (Initiative.turn_order.includes(creature.id)) {
            console.log(`This ability cannot be used while in combat.`)
            return
        }

        // Effect
        Spells.remove_previous(creature, name)
        target.set_condition(name, -1, {
            source: creature.id
        })
        creature.set_condition(`Maintaining: ${name}`, -1, {
            target: target.id
        })

        // Change name
        const newName = input({
            "name": {
                label: "Choose a name",
                type: "text",
                options: {
                }
            }
        }).name
        target.name = newName
        target.alignment = "friendly"

        target.long_rest()
        console.log(`${creature.name_color} cast ${name} on ${target.name_color}.`, "all")

        // Consume resources
        this.use_resources(action_details.resources)
        Initiative.set_recovery(action_details.recovery, creature)
    }

    //---------------------------------------------------------------------------------------------------
}
