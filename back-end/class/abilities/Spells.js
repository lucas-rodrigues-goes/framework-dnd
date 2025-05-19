

var Spells = class {

    //---------------------------------------------------------------------------------------------------
    // Cast Spell
    //---------------------------------------------------------------------------------------------------

    static finish_casting () {
        const creature = impersonated()
        if (!creature.has_condition("Spellcasting")) return

        // Get spell data
        const condition = creature.get_condition("Spellcasting")
        const { spell } = condition

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

        // Remove Spellcasting Condition
        creature.remove_condition("Spellcasting")
    }

    static cast_spell(spell, player_class) {
        spell.cast_time = Number(spell.cast_time)
        spell.range = Number(spell.range)
        const {name, level, school, target, cast_time, range, duration, classes, components} = spell
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
            if (cast_time >= 0) resources = ["Action"]
            else if (cast_time == -1) resources = ["Bonus Action"]
            else if (cast_time == -2) resources = ["Reaction"]

            // Spell Slot
            if (level != "cantrip") resources.push(`${level} Level Spell Slot`)
        }
        if(!Common.has_resources_available(resources)) return

        // Instant Casting
        if (!Initiative.turn_order.includes(creature.id) || cast_time <= 0) {
            // Call Spell
            const spellcast_result = spell_function({...spell, spellcasting_modifier: spellcasting_modifier})

            // Spell Result
            if (spellcast_result.message) console.log(spellcast_result.message, "all")
            if (!spellcast_result.success) return
            
            // Set Recovery
            const recovery = cast_time == 0 ? 1 : 0
            if (cast_time >= 0) Initiative.set_recovery(recovery, creature)
        }
        else {
            // Set spellcasting condition
            creature.set_condition("Spellcasting", 1, {spell: {...spell, spellcasting_modifier: spellcasting_modifier}})

            // Suspend Turn
            Initiative.suspend_turn(cast_time, "Spellcasting", creature)
        }

        // Sound
        Sound.play("spell")

        // Consume Resources
        Common.use_resources(resources)
    }

    //---------------------------------------------------------------------------------------------------
    // Helpers
    //---------------------------------------------------------------------------------------------------

    static make_spell_attack({name, target, spellcasting_modifier, range, damage_dice, advantage_weight = 0}={}) {
        const creature = impersonated()
        
        // Validate Visibility
        const target_visibility = creature.target_visibility()
        if (target_visibility == 0) return {
            success: false,
            message: `${creature.name_color} needs to see their target.`
        }
        
        // Validate Range
        const range_validation = Spells.validate_spell_range(creature, target, range)
        if (range_validation.outOfRange) {
            return {
                success: false,
                message: `${creature.name_color} tried to cast ${name}, but their target is out of range.`
            }
        }
        advantage_weight += range_validation.advantage_weight

        // Calculate Hit
        const hit_bonus = spellcasting_modifier + 2
        const hit_result = Common.attack_hit_result(hit_bonus, creature, target, advantage_weight)

        // Deal damage
        const damage_result = (hit_result.success
            ? ` dealing ${Spells.spell_damage(creature, target, hit_result.message, damage_dice)} damage.`
            : `.`
        )

        // Output
        return {
            success: true,
            hit_result: hit_result,
            damage_result: damage_result,
            message: `${creature.name_color} attacks ${target.name_color} (AC ${target.armor_class}) with ${name} and ${hit_result.message} (${hit_result.roll.text_color})${damage_result}`
        }
    }

    static make_spell_save({name, targets=[], max_targets=false, spellcasting_modifier, half_on_fail=false, range, damage_dice, saving_throw_score, advantage_weight = 0}={}) {
        const creature = impersonated()

        // Validate Targets
        if (max_targets) {
            if (targets.length > max_targets) return {
                success: false,
                message: `${creature.name_color} can only select up to ${max_targets} target${max_targets > 1 ? "s" : ""} for this spell.`
            }
        }

        const output = {success: false, targets: [], message: `${creature.name_color} needs to choose a target for this spell.`}
        for (const target of targets) {
            // Validate Target
            if (!target) return {
                success: false,
                message: `${creature.name_color} tried to cast ${name}, but one target is invalid.`
            }

            // Validate Range
            const range_validation = Spells.validate_spell_range(creature, target, range)
            if (range_validation.outOfRange) return {
                success: false,
                message: `${creature.name_color} tried to cast ${name}, but one target is out of range.`
            }

            // Saving Throw
            const save_bonus = target.saving_throws[saving_throw_score.toLowerCase()] || 0
            const save_result = Spells.saving_throw_result(creature, target, spellcasting_modifier, save_bonus, half_on_fail, 0)

            // Deal damage
            const damage_result = (save_result.success && !half_on_fail
                ? ` avoiding the effects.`
                : ` receiving ${Spells.spell_damage(creature, target, save_result.message, damage_dice)} damage.`
            )

            // Output
            console.log(
                `${creature.name_color} casts ${name} (DC ${save_result.difficulty_class}) on ${target.name_color},` + 
                ` who makes a ${saving_throw_score} saving throw and ${save_result.message} (${save_result.roll.text_color})${damage_result}`
            , "all")
            output.targets.push({
                save_result: save_result,
                damage_result: damage_result,
                target: target,
            })
            output.success = true
            output.message = ""
        }

        return output
    }

    static validate_spell_range(creature, target, range) {
        range = Number(range)
        const distance = calculate_distance(creature, target) * 5
        const meleeRange = distance <= 5

        // Output
        const output = { advantage_weight: 0, outOfRange: false }
        {
            // Out of Range
            output.outOfRange = distance > range

            // Melee Spell
            if (range == 5) {

            }

            // Ranged Spell
            else if (range > 5) {
                // Melee disadvantage
                if (meleeRange) output.advantage_weight -= 1
            }
        }
        return output
    }

    static spell_damage(creature, target, result, damage_dice) {
        // Critical Hit Multiplier
        const crit_multiplier = result == "lands a critical hit" ? 2 : 1

        // Save for half
        const damage_multiplier = result == "saves for half damage" ? 0.5 : 1

        // Output
        const output = []
        let count = 0
        for (const damage of damage_dice) {
            // Calculate Damage
            const die_size = damage.die_size || 0
            const die_amount = damage.die_amount * crit_multiplier
            const damage_bonus = damage.damage_bonus || 0

            const damage_to_deal = Math.floor((roll_dice(die_amount, die_size) + damage_bonus) * damage_multiplier)
            count ++

            // Deal Damage
            const damage_dealt = target.receive_damage(damage_to_deal, damage.damage_type)
            output.push(`${damage_dealt} ${damage.damage_type.toLowerCase()}`)
        }
        return output.join(", ")
    }

    static remove_previous(creature, name) {
        const current = creature.get_condition(`Maintaining: ${name}`)
        if (current) {
            const previous_target = instance(current.target)

            // Remove conditions
            creature.remove_condition(`Maintaining: ${name}`)
            if (previous_target) previous_target.remove_condition(name)

            return previous_target
        }
    }

    static saving_throw_result(creature, target, spellcasting_modifier, save_bonus, half_on_fail, advantage_weight = 0) {
        // Advantage modifiers
        advantage_weight += 0

        // Roll d20
        const roll_result = roll_20(advantage_weight)
        const roll_to_save = roll_result.result + save_bonus

        // Difficulty Class
        const difficulty_class = 10 + spellcasting_modifier

        // Output
        let advantage = "None"; {
            if (advantage_weight > 0) advantage = "Advantage"
            else if (advantage_weight < 0) advantage = "Disadvantage"
        }
        const output = { success: false, message: "", roll: roll_result, difficulty_class: difficulty_class, advantage: advantage}; {
            // Save
            if (roll_to_save >= difficulty_class) {
                output.success = true
                output.message = "saves" + (half_on_fail ? " for half damage" : "")
            }

            // Fail
            else if (roll_to_save < difficulty_class) {
                output.message = "fails the save"
            }

            // Add save bonus to text
            output.roll.text += ` + ${save_bonus}`
            output.roll.text_color += ` + ${save_bonus}`
        }
        return output
    }

    //---------------------------------------------------------------------------------------------------
    // Cantrips
    //---------------------------------------------------------------------------------------------------

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
                ? `${creature.name_color} cast ${name} on ${target.name_color} boosting their unarmored AC to 13.`
                : `${creature.name_color} cast ${name} boosting their unarmored AC to 13.`
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
            message: `${creature.name_color} cast ${name} gaining a +${bonus_armor_class} bonus to their armor class.`
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

    //---------------------------------------------------------------------------------------------------
    // 2nd Level Spells
    //---------------------------------------------------------------------------------------------------

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

    static blur (spell) {
        const creature = impersonated()
        const { name, duration } = spell

        // Set condition
        creature.set_condition(name, duration)
        return {
            success: true,
            message: `${creature.name_color} cast ${name} giving attackers disadvantage on their attacks against them.`
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
        creature.set_condition("Concentration", spell.duration, {
            name: name,
            targets: [target],
        })
        target.set_condition(name, spell.duration, {
            bonus_armor_class: 2
        })
        return {
            success: true,
            message: (creature.id != target.id
                ? `${creature.name_color} cast ${name} on ${target.name_color}.`
                : `${creature.name_color} cast ${name} on themselves.`
            )
        }
    }

    //---------------------------------------------------------------------------------------------------
    // 4th Level Spells
    //---------------------------------------------------------------------------------------------------

    //---------------------------------------------------------------------------------------------------
    // 5th Level Spells
    //---------------------------------------------------------------------------------------------------

    static cone_of_cold (spell) {
        const creature = impersonated()

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
            saving_throw_score: "Constitution"
        })
    }

    //---------------------------------------------------------------------------------------------------
}
