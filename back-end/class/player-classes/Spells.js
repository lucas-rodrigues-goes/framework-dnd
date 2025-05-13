

var Spells = class {

    //---------------------------------------------------------------------------------------------------
    // Cast Spell
    //---------------------------------------------------------------------------------------------------

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

        // Cantrips
        if (level == "cantrip") {
            // Call Spell
            const spellcast_result = spell_function({...spell, creature: creature, spellcasting_modifier: spellcasting_modifier})

            // Spell Result
            console.log(spellcast_result.message, "all")
            if (!spellcast_result.success) return
            
            // Set Recovery
            if (cast_time >= 0) Initiative.set_recovery(cast_time, creature)
        }

        // Consume Resources
        Common.use_resources(resources)
    }

    //---------------------------------------------------------------------------------------------------
    // Helpers
    //---------------------------------------------------------------------------------------------------

    static make_spell_attack({name, creature, target, spellcasting_modifier, range, damage_dice, advantage_weight = 0}={}) {
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
        const damage_bonus = spellcasting_modifier
        const damage_result = (hit_result.success
            ? ` dealing ${Spells.spell_attack_damage(creature, target, hit_result.message, damage_dice, damage_bonus)} damage.`
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

    static spell_attack_damage(creature, target, hit_result, damage_dice, damage_bonus = 0) {
        // Critical Hit Multiplier
        const crit_multiplier = hit_result == "lands a critical hit" ? 2 : 1

        // Output
        const output = []
        let count = 0
        for (const damage of damage_dice) {
            // Calculate Damage
            const die_amount = damage.die_amount * crit_multiplier
            const damage_to_deal = roll_dice(die_amount, damage.die_size) + (count == 0 ? damage_bonus : 0)
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

    //---------------------------------------------------------------------------------------------------
    // Cantrips
    //---------------------------------------------------------------------------------------------------

    static fire_bolt(spell) {
        return Spells.make_spell_attack({
            ...spell,
            target: selected(),
            damage_dice: [{die_amount: 1, die_size: 6, damage_type: "Fire"}],
        })
    }

    static ray_of_frost(spell) {
        const target = selected()

        // Spell Attack
        const attack_return = Spells.make_spell_attack({
            ...spell,
            target: target,
            damage_dice: [{die_amount: 1, die_size: 4, damage_type: "Cold"}],
        })

        // Ray of Frost condition
        if(attack_return.hit_result.message.includes("hit")) {
            target.set_condition("Ray of Frost", spell.duration || 2)
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

    //---------------------------------------------------------------------------------------------------
    // 1st Level Spells
    //---------------------------------------------------------------------------------------------------



    //---------------------------------------------------------------------------------------------------
}
