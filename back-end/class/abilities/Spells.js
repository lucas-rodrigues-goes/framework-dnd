

var Spells = class extends Abilities {
    // Ability List
    static abilities_list(creature=impersonated()) {
        const origin = "Spells"
        const abilities_list = {}

        // Finish Casting
        if (creature.has_condition("Spellcasting") && Initiative.current_creature == creature.id) {
            const condition = creature.get_condition("Spellcasting")
            const { spell } = condition

            abilities_list.finish_casting = {
                name: "Finish Casting: " + spell.name,
                resources: [],
                recovery: 0,
                image: spell.image,
                origin: origin,
                type: "Special",
                description: `Use this button to finish casting prepared spell.`
            }
        }

        return abilities_list
    }

    //---------------------------------------------------------------------------------------------------
    // Cast Spell
    //---------------------------------------------------------------------------------------------------

    static finish_casting () {
        const creature = impersonated()
        if (!creature.has_condition("Spellcasting")) return

        // Get spell data
        const condition = creature.get_condition("Spellcasting")
        const { spell } = condition
        const { components } = spell

        // Remove Concentration if new spell requires it
        if (components.includes("concentration")) creature.remove_condition("Concentration")

        // Remove Invisibility
        creature.remove_condition("Invisibility")

        // Spell Function
        const spell_function_name = spell.name.replace(/ /g, "_").toLowerCase()
        const spell_function = Spells[spell_function_name]

        // Call Spell
        const spellcast_result = spell_function(spell)

        // Sound
        Sound.play("spell")

        // Spell Result
        if (spellcast_result.message) console.log(spellcast_result.message, "all")
        if (!spellcast_result.success) return

        // Remove Spellcasting
        creature.remove_condition("Spellcasting")
    }

    static cast_spell(spell, player_class) {
        spell.cast_time = Number(spell.cast_time)
        spell.range = Number(spell.range)
        const {name, level, components} = spell
        const creature = impersonated()

        // Player Class Object
        const player_cls_obj = eval(player_class)
        const spellcasting_modifier = creature.score_bonus[player_cls_obj.spellcasting.ability]

        // Spell Function
        const spell_function_name = name.replace(/ /g, "_").toLowerCase()
        const spell_function = Spells[spell_function_name]

        // Resources
        let resources = []; {
            // Action
            if (spell.cast_time >= 0) resources = ["Action"]
            else if (spell.cast_time == -1) resources = ["Bonus Action"]
            else if (spell.cast_time == -2) resources = ["Reaction"]

            // Spell Slot
            if (level != "cantrip") resources.push(`${level} Level Spell Slot`)
        }
        if(!this.has_resources_available(resources)) return

        // Cast Time
        if (spell.cast_time > 0) {
            // Calculate weight
            let haste_slow_weight = 0
            if (creature.has_condition("Haste")) haste_slow_weight += 1
            if (creature.has_condition("Slow")) haste_slow_weight -= 1

            // Apply on cast time
            if (haste_slow_weight > 0) spell.cast_time = Math.floor(spell.cast_time / 2)
            else if (haste_slow_weight < 0) spell.cast_time = spell.cast_time * 2
        }

        // Instant Casting
        if (!Initiative.turn_order.includes(creature.id) || spell.cast_time <= 0) {
            // Remove Concentration if new spell requires it
            if (components.includes("concentration")) creature.remove_condition("Concentration")
                
            // Remove Invisibility
            creature.remove_condition("Invisibility")

            // Call Spell
            const spellcast_result = spell_function({...spell, spellcasting_modifier: spellcasting_modifier})

            // Spell Result
            if (spellcast_result.message) console.log(spellcast_result.message, "all")
            if (!spellcast_result.success) return
            
            // Set Recovery
            const recovery = spell.cast_time == 0 ? 1 : 0
            if (spell.cast_time >= 0) Initiative.set_recovery(recovery, creature)
        }
        else {
            // Set spellcasting condition
            creature.set_condition("Spellcasting", 1, {spell: {...spell, spellcasting_modifier: spellcasting_modifier}})

            // Suspend Turn
            Initiative.suspend_turn(spell.cast_time, "Spellcasting", creature)
        }

        // Sound
        Sound.play("spell")

        // Consume Resources
        this.use_resources(resources)
    }

    static concentrate(creature, spell, targets) {
        // New concentration
        creature.set_condition("Concentration", spell.duration, {
            condition: spell.name,
            targets: targets,
        })
        console.log(`${creature.name_color} has started concentrating on ${spell.name}.`, "all")
    }

    //---------------------------------------------------------------------------------------------------
    // Cantrips
    //---------------------------------------------------------------------------------------------------

    static cure_wounds(spell) {
        const creature = impersonated()
        const target = selected()
        const { name, range, spellcasting_modifier } = spell

        // Validate Visibility
        const target_visibility = creature.target_visibility()
        if (target_visibility == 0) return {
            success: false,
            message: `${creature.name_color} needs to see their target.`
        }

        // Validate Range
        const range_validation = Spells.validate_spell_range(creature, target, range)
        if (range_validation.outOfRange) return {
            success: false,
            message: `${creature.name_color} tried to cast ${name}, but their target is out of range.`
        }

        // Die amount
        let die_amount = 1; {
            const levels = [3, 5, 7] 
            if (creature.spellcasting_level >= levels[0]) die_amount += 1
            if (creature.spellcasting_level >= levels[1]) die_amount += 1
            if (creature.spellcasting_level >= levels[2]) die_amount += 1
        }

        // Apply effect
        const healing = roll_dice(die_amount, 8) + spellcasting_modifier
        target.receive_healing(healing)

        return {
            success: true,
            message: (creature.id != target.id
                ? `${creature.name_color} cast ${name} on ${target.name_color}, who receives ${healing} hit points.`
                : `${creature.name_color} cast ${name} on themselves, receiving ${healing} hit points.`
            )
        }
    }

    static frostbite(spell) {
        const creature = impersonated()

        // Die amount
        let die_amount = 1; {
            const levels = [5, 11, 17] 
            if (creature.spellcasting_level >= levels[0]) die_amount += 1
            if (creature.spellcasting_level >= levels[1]) die_amount += 1
            if (creature.spellcasting_level >= levels[2]) die_amount += 1
        }

        Sound.play("cold")
        const save_return = Spells.make_spell_save({
            ...spell,
            targets: allSelected(),
            max_targets: 1,
            damage_dice: [{die_amount: die_amount, die_size: 4, damage_type: "Cold", damage_bonus: spell.spellcasting_modifier}],
            saving_throw_score: "Constitution"
        })

        // Apply effect
        for (const element of save_return.targets) {
            if (!element.save_result.success) {
                element.target.set_condition(spell.name, spell.duration)
            }
        }

        return save_return
    }

    static fire_bolt(spell) {
        const creature = impersonated()

        // Die amount
        let die_amount = 1; {
            const levels = [5, 11, 17] 
            if (creature.spellcasting_level >= levels[0]) die_amount += 1
            if (creature.spellcasting_level >= levels[1]) die_amount += 1
            if (creature.spellcasting_level >= levels[2]) die_amount += 1
        }

        Sound.play("fire")
        return Spells.make_spell_attack({
            ...spell,
            target: selected(),
            damage_dice: [{die_amount: die_amount, die_size: 6, damage_type: "Fire", damage_bonus: spell.spellcasting_modifier}],
        })
    }

    static guidance(spell) {
        const creature = impersonated()
        const target = selected()
        const { name, range } = spell

        // Validate Visibility
        const target_visibility = creature.target_visibility()
        if (target_visibility == 0) return {
            success: false,
            message: `${creature.name_color} needs to see their target.`
        }

        // Validate Range
        const range_validation = Spells.validate_spell_range(creature, target, range)
        if (range_validation.outOfRange) return {
            success: false,
            message: `${creature.name_color} tried to cast ${name}, but their target is out of range.`
        }

        // Apply effect
        target.set_condition(spell.name, spell.duration)
        Spells.concentrate(creature, spell, [target])

        return {
            success: true,
            message: (creature.id != target.id
                ? `${creature.name_color} cast ${name} on ${target.name_color}.`
                : `${creature.name_color} cast ${name}.`
            )
        }
    }

    static healing_word(spell) {
        const creature = impersonated()
        const target = selected()
        const { name, range, spellcasting_modifier } = spell

        // Validate Visibility
        const target_visibility = creature.target_visibility()
        if (target_visibility == 0) return {
            success: false,
            message: `${creature.name_color} needs to see their target.`
        }

        // Validate Range
        const range_validation = Spells.validate_spell_range(creature, target, range)
        if (range_validation.outOfRange) return {
            success: false,
            message: `${creature.name_color} tried to cast ${name}, but their target is out of range.`
        }

        // Die amount
        let die_amount = 1; {
            const levels = [3, 5, 7] 
            if (creature.spellcasting_level >= levels[0]) die_amount += 1
            if (creature.spellcasting_level >= levels[1]) die_amount += 1
            if (creature.spellcasting_level >= levels[2]) die_amount += 1
        }

        // Apply effect
        const healing = roll_dice(die_amount, 4) + spellcasting_modifier
        target.receive_healing(healing)

        return {
            success: true,
            message: (creature.id != target.id
                ? `${creature.name_color} cast ${name} on ${target.name_color}, who receives ${healing} hit points.`
                : `${creature.name_color} cast ${name} on themselves, receiving ${healing} hit points.`
            )
        }
    }

    static ray_of_frost(spell) {
        const target = selected()
        const creature = impersonated()

        // Die amount
        let die_amount = 1; {
            const levels = [5, 11, 17] 
            if (creature.spellcasting_level >= levels[0]) die_amount += 1
            if (creature.spellcasting_level >= levels[1]) die_amount += 1
            if (creature.spellcasting_level >= levels[2]) die_amount += 1
        }

        // Spell Attack
        Sound.play("cold")
        const attack_return = Spells.make_spell_attack({
            ...spell,
            target: target,
            damage_dice: [{die_amount: die_amount, die_size: 4, damage_type: "Cold", damage_bonus: spell.spellcasting_modifier}],
        })

        // Ray of Frost condition
        if(attack_return?.hit_result?.message?.includes("hit")) {
            target.set_condition("Ray of Frost", spell.duration)
        }

        return attack_return
    }

    static light(spell) {
        const [creature, target] = [impersonated(), selected()]
        const { name, range } = spell

        // Remove previous light
        if (!target) {const previous_target = Spells.remove_previous(creature, name); return {
            success: false, 
            message: (previous_target
                ? `${creature.name_color} ended ${name} on ${previous_target.name_color}.`
                : `${creature.name_color} needs to choose a target for this spell.`
            )
        }}

        // Validate Visibility
        const target_visibility = creature.target_visibility()
        if (target_visibility == 0) return {
            success: false,
            message: `${creature.name_color} needs to see their target.`
        }

        // Validate Range
        const range_validation = Spells.validate_spell_range(creature, target, range)
        if (range_validation.outOfRange) return {
            success: false,
            message: `${creature.name_color} tried to cast ${name}, but their target is out of range.`
        }

        // Add new light
        Spells.remove_previous(creature, name)
        target.set_condition(name, spell.duration)
        creature.set_condition(`Maintaining: ${name}`, spell.duration, {
            target: target.id
        })

        return {
            success: true,
            message: `${creature.name_color} cast ${name} on ${target.name_color}.`
        }
    }

    static imbue_weapon(spell) {
        const [creature, target] = [impersonated(), selected()]
        const { name, range, spellcasting_modifier } = spell

        // Remove Previous
        if (!target) {const previous_target = Spells.remove_previous(creature, name); return {
            success: false, 
            message: (previous_target
                ? `${creature.name_color} ended ${name} on ${previous_target.name_color}.`
                : `${creature.name_color} needs to choose a target for this spell.`
            )
        }}

        // Validate Visibility
        const target_visibility = creature.target_visibility()
        if (target_visibility == 0) return {
            success: false,
            message: `${creature.name_color} needs to see their target.`
        }

        // Validate Range
        const range_validation = Spells.validate_spell_range(creature, target, range)
        if (range_validation.outOfRange) return {
            success: false,
            message: `${creature.name_color} tried to cast ${name}, but their target is out of range.`
        }

        // Add new imbue weapon
        Spells.remove_previous(creature, name)
        const damage_type = ["Fire", "Lightning", "Cold"][roll(3)-1]
        target.set_condition(name, spell.duration, {
            damage_bonus: spellcasting_modifier,
            damage_type: damage_type
        })
        creature.set_condition(`Maintaining: ${name}`, spell.duration, {
            target: target.id
        })

        return {
            success: true,
            message: `${creature.name_color} cast ${name} on ${target.name_color} granting them bonus ${damage_type} damage on their weapon attacks.`
        }
    }

    static sacred_flame(spell) {
        const creature = impersonated()

        // Die amount
        let die_amount = 1; {
            const levels = [5, 11, 17] 
            if (creature.spellcasting_level >= levels[0]) die_amount += 1
            if (creature.spellcasting_level >= levels[1]) die_amount += 1
            if (creature.spellcasting_level >= levels[2]) die_amount += 1
        }

        Sound.play("radiant")
        return Spells.make_spell_save({
            ...spell,
            targets: allSelected(),
            max_targets: 1,
            damage_dice: [{die_amount: die_amount, die_size: 4, damage_type: "Radiant", damage_bonus: spell.spellcasting_modifier}],
            saving_throw_score: "Dexterity"
        })
    }

    //---------------------------------------------------------------------------------------------------
    // 1st Level Spells
    //---------------------------------------------------------------------------------------------------

    static bane(spell) {
        const creature = impersonated()
        const saving_throw_score = "Charisma"

        // Target Amount
        let max_targets = 3; {
            const levels = [3, 5, 7] 
            if (creature.spellcasting_level >= levels[0]) max_targets += 1
            if (creature.spellcasting_level >= levels[1]) max_targets += 1
            if (creature.spellcasting_level >= levels[2]) max_targets += 1
        }

        // Saving throws
        const save_return = Spells.make_spell_save({
            ...spell,
            targets: allSelected(),
            max_targets: max_targets,
            saving_throw_score: saving_throw_score
        })

        // Apply effect
        const targets = []
        let success = false
        for (const element of save_return.targets) {
            if (!element.save_result.success) {
                success = true
                element.target.set_condition(spell.name, spell.duration, {
                    saving_throw: {
                        difficulty_class: 10 + spell.spellcasting_modifier,
                        score: saving_throw_score
                    }
                })
                targets.push(element.target.id)
            }
        }
        if (success) Spells.concentrate(creature, spell, targets)

        return save_return
    }

    static bless(spell) {
        const creature = impersonated()
        const targets = allSelected()
        const { name, range } = spell

        // Target Amount
        let max_targets = 3; {
            const levels = [3, 5, 7] 
            if (creature.spellcasting_level >= levels[0]) max_targets += 1
            if (creature.spellcasting_level >= levels[1]) max_targets += 1
            if (creature.spellcasting_level >= levels[2]) max_targets += 1
            if (targets.length > max_targets) return {
                success: false,
                message: `${creature.name_color} can only select up to ${max_targets} target${max_targets > 1 ? "s" : ""} for this spell.`
            }
        }

        // Validate Range
        for (const target of targets) {
            const range_validation = Spells.validate_spell_range(creature, target, range)
            if (range_validation.outOfRange) return {
                success: false,
                message: `${creature.name_color} tried to cast ${name}, but their target is out of range.`
            }
        }

        // Apply effect
        const concentration_targets = []
        for (const target of targets) {
            target.set_condition(spell.name, spell.duration)
            concentration_targets.push(target.id)
            console.log(`${creature.name_color} casts ${name} on ${target.name_color}.`, "all")
        }
        Spells.concentrate(creature, spell, concentration_targets)

        return {
            success: true,
            message: ""
        }
    }

    static burning_hands (spell) {
        const creature = impersonated()

        // Die amount
        let die_amount = 3; {
            const levels = [3, 5, 7] 
            if (creature.spellcasting_level >= levels[0]) die_amount += 1
            if (creature.spellcasting_level >= levels[1]) die_amount += 1
            if (creature.spellcasting_level >= levels[2]) die_amount += 1
        }
        
        // Output
        Sound.play("fire")
        return Spells.make_spell_save({
            ...spell,
            targets: allSelected(),
            half_on_fail: true,
            damage_dice: [{die_amount: die_amount, die_size: 6, damage_type: "Fire"}],
            saving_throw_score: "Dexterity"
        })
    }

    static guiding_bolt(spell) {
        const target = selected()
        const creature = impersonated()

        // Die amount
        let die_amount = 4; {
            const levels = [3, 5, 7] 
            if (creature.spellcasting_level >= levels[0]) die_amount += 1
            if (creature.spellcasting_level >= levels[1]) die_amount += 1
            if (creature.spellcasting_level >= levels[2]) die_amount += 1
        }

        // Spell Attack
        Sound.play("radiant")
        const attack_return = Spells.make_spell_attack({
            ...spell,
            target: target,
            damage_dice: [{die_amount: die_amount, die_size: 6, damage_type: "Radiant", damage_bonus: spell.spellcasting_modifier}],
        })

        // Ray of Frost condition
        if(attack_return?.hit_result?.message?.includes("hit")) {
            target.set_condition("Guiding Bolt", spell.duration)
        }

        return attack_return
    }

    static mage_armor (spell) {
        const [creature, target] = [impersonated(), selected()]
        const { name, range, spellcasting_modifier } = spell

        // Target self if no target
        if (!target) target = creature

        // Validate Visibility
        const target_visibility = creature.target_visibility()
        if (target_visibility == 0) return {
            success: false,
            message: `${creature.name_color} needs to see their target.`
        }

        // Validate Range
        const range_validation = Spells.validate_spell_range(creature, target, range)
        if (range_validation.outOfRange) return {
            success: false,
            message: `${creature.name_color} tried to cast ${name}, but their target is out of range.`
        }

        // Set condition
        target.set_condition(name, spell.duration)
        return {
            success: true,
            message: (creature.id != target.id
                ? `${creature.name_color} cast ${name} on ${target.name_color}.`
                : `${creature.name_color} cast ${name}.`
            )
        }
    }

    static shield (spell) {
        const creature = impersonated()
        const { name, duration } = spell

        // Bonus Armor Class
        let bonus_armor_class = 3; {
            const levels = [3, 5, 7] 
            if (creature.spellcasting_level >= levels[0]) bonus_armor_class += 1
            if (creature.spellcasting_level >= levels[1]) bonus_armor_class += 1
            if (creature.spellcasting_level >= levels[2]) bonus_armor_class += 1
        }

        // Set condition
        creature.set_condition(name, duration, {
            bonus_armor_class: bonus_armor_class
        })
        return {
            success: true,
            message: `${creature.name_color} cast ${name}.`
        }
    }

    //---------------------------------------------------------------------------------------------------
    // 2nd Level Spells
    //---------------------------------------------------------------------------------------------------
    
    static blindness(spell) {
        const creature = impersonated()
        const saving_throw_score = "Constitution"

        // Target Amount
        let max_targets = 1; {
            const levels = [5, 7, 9] 
            if (creature.spellcasting_level >= levels[0]) max_targets += 1
            if (creature.spellcasting_level >= levels[1]) max_targets += 1
            if (creature.spellcasting_level >= levels[2]) max_targets += 1
        }

        // Saving throws
        const save_return = Spells.make_spell_save({
            ...spell,
            targets: allSelected(),
            max_targets: max_targets,
            saving_throw_score: saving_throw_score
        })

        // Apply effect
        for (const element of save_return.targets) {
            if (!element.save_result.success) {
                element.target.set_condition(spell.name, spell.duration, {
                    saving_throw: {
                        difficulty_class: 10 + spell.spellcasting_modifier,
                        score: saving_throw_score
                    }
                })
            }
        }

        return save_return
    }

    static blur (spell) {
        const creature = impersonated()
        const { name, duration } = spell

        // Set condition
        creature.set_condition(name, duration)
        return {
            success: true,
            message: `${creature.name_color} cast ${name}.`
        }
    }

    static hold_person(spell) {
        const creature = impersonated()
        const saving_throw_score = "Wisdom"

        // Fail if non-humanoid is selected
        for (const target of allSelected()) {
            if (target.type != "Humanoid") {
                console.log(`${creature.name_color} tried to cast ${spell.name} but non-humanoids can't be targets for this spell.`)
            }
        }

        // Target Amount
        let max_targets = 1; {
            const levels = [5, 7, 9] 
            if (creature.spellcasting_level >= levels[0]) max_targets += 1
            if (creature.spellcasting_level >= levels[1]) max_targets += 1
            if (creature.spellcasting_level >= levels[2]) max_targets += 1
        }

        // Saving throws
        const save_return = Spells.make_spell_save({
            ...spell,
            targets: allSelected(),
            max_targets: max_targets,
            saving_throw_score: saving_throw_score
        })

        // Apply effect
        const targets = []
        let success = false
        for (const element of save_return.targets) {
            if (!element.save_result.success) {
                success = true
                element.target.set_condition(spell.name, spell.duration, {
                    saving_throw: {
                        difficulty_class: 10 + spell.spellcasting_modifier,
                        score: saving_throw_score
                    }
                })
                targets.push(element.target.id)
            }
        }
        if (success) Spells.concentrate(creature, spell, targets)

        return save_return
    }

    static reveal_invisibility(spell) {
        const { name, range } = spell
        const creature = impersonated()

        const invisibilityConditions = ["Invisibility", "Greater Invisibility"]
        const revealed_creatures = []
        for (const target of mapCreatures()) {
            const distance = calculate_distance(creature, target) * 5

            if (distance <= range && target.has_conditions(invisibilityConditions, "any")) {
                for (const c of invisibilityConditions) target.remove_condition(c)
                revealed_creatures.push(target.name_color)
            }
        }

        return {
            success: true,
            message: revealed_creatures.length >= 1
                ? `${creature.name_color} cast ${name} and revealed ${revealed_creatures.join(", ")}.`
                : `${creature.name_color} cast ${name} and revealed no creatures.`
        }
    }

    static shatter (spell) {
        const creature = impersonated()

        // Die amount
        let die_amount = 3; {
            const levels = [5, 7, 9] 
            if (creature.spellcasting_level >= levels[0]) die_amount += 1
            if (creature.spellcasting_level >= levels[1]) die_amount += 1
            if (creature.spellcasting_level >= levels[2]) die_amount += 1
        }
        
        // Output
        Sound.play("thunder")
        return Spells.make_spell_save({
            ...spell,
            targets: allSelected(),
            half_on_fail: true,
            damage_dice: [{die_amount: die_amount, die_size: 8, damage_type: "Thunder"}],
            saving_throw_score: "Dexterity"
        })
    }

    static invisibility(spell) {
        const creature = impersonated()
        const targets = allSelected()
        const { name, range } = spell

        // Target Amount
        let max_targets = 1; {
            const levels = [3, 5, 7] 
            if (creature.spellcasting_level >= levels[0]) max_targets += 1
            if (creature.spellcasting_level >= levels[1]) max_targets += 1
            if (creature.spellcasting_level >= levels[2]) max_targets += 1
            if (targets.length > max_targets) return {
                success: false,
                message: `${creature.name_color} can only select up to ${max_targets} target${max_targets > 1 ? "s" : ""} for this spell.`
            }
        }

        // Validate Range
        for (const target of targets) {
            const range_validation = Spells.validate_spell_range(creature, target, range)
            if (range_validation.outOfRange) return {
                success: false,
                message: `${creature.name_color} tried to cast ${name}, but their target is out of range.`
            }
        }

        // Apply effect
        const concentration_targets = []
        for (const target of targets) {
            target.set_condition(spell.name, spell.duration)
            concentration_targets.push(target.id)
            console.log(`${creature.name_color} casts ${name} on ${target.name_color}.`, "all")
        }
        Spells.concentrate(creature, spell, concentration_targets)

        return {
            success: true,
            message: ""
        }
    }

    //---------------------------------------------------------------------------------------------------
    // 3rd Level Spells
    //---------------------------------------------------------------------------------------------------

    static fireball (spell) {
        const creature = impersonated()

        // Die amount
        let die_amount = 6; {
            const levels = [7, 9, 11] 
            if (creature.spellcasting_level >= levels[0]) die_amount += 1
            if (creature.spellcasting_level >= levels[1]) die_amount += 1
            if (creature.spellcasting_level >= levels[2]) die_amount += 1
        }
        
        // Output
        Sound.play("fire")
        return Spells.make_spell_save({
            ...spell,
            targets: allSelected(),
            half_on_fail: true,
            damage_dice: [{die_amount: die_amount, die_size: 6, damage_type: "Fire"}],
            saving_throw_score: "Dexterity"
        })
    }

    static haste (spell) {
        const [creature, target] = [impersonated(), selected()]
        const { name, range } = spell

        // Target self if no target
        if (!target) target = creature

        // Validate Visibility
        const target_visibility = creature.target_visibility()
        if (target_visibility == 0) return {
            success: false,
            message: `${creature.name_color} needs to see their target.`
        }

        // Validate Range
        const range_validation = Spells.validate_spell_range(creature, target, range)
        if (range_validation.outOfRange) return {
            success: false,
            message: `${creature.name_color} tried to cast ${name}, but their target is out of range.`
        }

        // Set condition
        Spells.concentrate(creature, spell, [target.id])
        target.set_condition(name, spell.duration, {
            bonus_armor_class: 2
        })
        return {
            success: true,
            message: (creature.id != target.id
                ? `${creature.name_color} cast ${name} on ${target.name_color}.`
                : `${creature.name_color} cast ${name}.`
            )
        }
    }

    //---------------------------------------------------------------------------------------------------
    // 4th Level Spells
    //---------------------------------------------------------------------------------------------------

    static stoneskin (spell) {
        const creature = impersonated()
        const { name, duration } = spell

        // Charges
        let charges = 3; {
            const levels = [9, 11, 13]
            if (creature.spellcasting_level >= levels[0]) charges += 1
            if (creature.spellcasting_level >= levels[1]) charges += 1
            if (creature.spellcasting_level >= levels[2]) charges += 1
        }

        // Set condition
        creature.set_condition(name, duration, {
            charges: charges,
            resistances: {
                Slashing: {type: "immunity"},
                Bludgeoning: {type: "immunity"},
                Piercing: {type: "immunity"},
            }
        })
        return {
            success: true,
            message: `${creature.name_color} cast ${name}.`
        }
    }

    //---------------------------------------------------------------------------------------------------
    // 5th Level Spells
    //---------------------------------------------------------------------------------------------------

    static cone_of_cold (spell) {
        const creature = impersonated()
        const saving_throw_score = "Constitution"

        // Die amount
        let die_amount = 8; {
            const levels = [11, 13, 15] 
            if (creature.spellcasting_level >= levels[0]) die_amount += 1
            if (creature.spellcasting_level >= levels[1]) die_amount += 1
            if (creature.spellcasting_level >= levels[2]) die_amount += 1
        }
        
        // Output
        Sound.play("cold")
        return Spells.make_spell_save({
            ...spell,
            targets: allSelected(),
            half_on_fail: true,
            damage_dice: [{die_amount: die_amount, die_size: 8, damage_type: "Cold"}],
            saving_throw_score: saving_throw_score
        })
    }

    static hold_monster(spell) {
        const creature = impersonated()
        const saving_throw_score = "Wisdom"

        // Target Amount
        let max_targets = 1; {
            const levels = [11, 13, 15] 
            if (creature.spellcasting_level >= levels[0]) max_targets += 1
            if (creature.spellcasting_level >= levels[1]) max_targets += 1
            if (creature.spellcasting_level >= levels[2]) max_targets += 1
        }

        // Saving throws
        const save_return = Spells.make_spell_save({
            ...spell,
            targets: allSelected(),
            max_targets: max_targets,
            saving_throw_score: saving_throw_score
        })

        // Apply effect
        const targets = []
        let success = false
        for (const element of save_return.targets) {
            if (!element.save_result.success) {
                success = true
                element.target.set_condition(spell.name, spell.duration, {
                    saving_throw: {
                        difficulty_class: 10 + spell.spellcasting_modifier,
                        score: saving_throw_score
                    }
                })
                targets.push(element.target.id)
            }
        }
        if (success) Spells.concentrate(creature, spell, targets)

        return save_return
    }

    //---------------------------------------------------------------------------------------------------
}
