

var Abilities = class {
    // Ability List
    static abilities_list(creature=impersonated()) {
        try {
            let abilities_list = {
                // Special
                finish_casting: undefined,

                // Attacks
                attack: undefined,
                multishot: undefined,
                cleave: undefined,
                opportunity_attack: undefined,
                off_hand_attack: undefined,
                grapple: undefined,
                push: undefined,
                knock_prone: undefined,

                // Common
                dash: undefined,
                disengage: undefined,
                dodge: undefined,
                help: undefined,
                hide: undefined,
                ready: undefined,
                search: undefined,
                switch_weapon: undefined,
            }

            // Pull from other origins
            for (const cls of [CommonAbilities, FeatureAbilities, Spells, ProficiencyAbilities]) {
                abilities_list = {...abilities_list, ...cls.abilities_list(creature)}
            }

            return abilities_list
        } catch (error) {console.error("abilities_list()", error)}
    }

    //---------------------------------------------------------------------------------------------------
    // Resource Helpers
    //---------------------------------------------------------------------------------------------------

    static check_action_requirements(action_key, require_target = true) {
        try {
            const creature = impersonated();
            const targets = allSelected();
            const target = selected();
            const action_details = this.abilities_list()[action_key];
            if (!action_details) return { valid: false };
        
            // Validate Resources
            if (!this.has_resources_available(action_details.resources)) {
                return { valid: false };
            }
        
            // Validate Target
            if (require_target && !selected()) {
                public_log(`${creature.name_color} needs to select a target for this action.`);
                return { valid: false };
            }

            // Validate Visibility
            if (require_target && creature.target_visibility() == 0) {
                public_log(`${creature.name_color} needs to see their target.`);
                return { valid: false };
            }
        
            return { valid: true, creature, target, targets, action_details };
        } catch (error) {console.error("check_action_requirements()", error)}
    }

    static has_resources_available(resources) {
        try {
            const creature = impersonated();
            const isMonster = creature.constructor.name == "Monster"
            
            let return_value = true;
            const missing_resources = [];
            
            for (const name of resources) {
                const resource = creature?.resources[name]?.value || 0;

                // Conditions
                const isTurnResource = ["Action", "Attack Action", "Bonus Action", "Reaction", "Movement"].includes(name);
                const hasInitiative = Initiative.turn_order.includes(creature.id);
                const isSpell = JSON.stringify(resources).includes("Spell Slot")

                // Monster Ignores Specific Resources
                if (!isTurnResource && !isSpell && isMonster) continue

                // Ignore turn resources if not in initiative
                if (isTurnResource && !hasInitiative) continue;
                
                // Check if we can use Ready Action substitution
                const canUseReaction = creature.has_condition("Ready Action") && (name === "Action" || name === "Attack Action") && !isSpell
                
                switch (name) {
                    case "Attack Action": {
                        const action_res = creature?.resources["Action"]?.value || 0;
                        const reaction_res = creature?.resources["Reaction"]?.value || 0;
                        
                        if (resource < 1) {
                            if (canUseReaction && reaction_res >= 1) {
                                // Can use Reaction instead of Action
                                continue;
                            }
                            if (action_res >= 1) {
                                // Can use Action
                                continue;
                            }
                            return_value = false;
                            missing_resources.push("Attack Action");
                        }
                        break;
                    }
                    
                    case "Action": {
                        if (canUseReaction) {
                            const reaction_res = creature?.resources["Reaction"]?.value || 0;
                            if (resource < 1 && reaction_res < 1) {
                                return_value = false;
                                missing_resources.push("Action");
                            }
                        } else if (resource < 1) {
                            return_value = false;
                            missing_resources.push("Action");
                        }
                        break;
                    }
                    
                    default: {
                        if (resource < 1) {
                            return_value = false;
                            missing_resources.push(name);
                        }
                    }
                }
            }
            
            if (!return_value) {
                public_log(`${creature.name_color} has insufficient resources for this ability (${missing_resources.join(", ")}).`);
            }
            
            return return_value;
        } catch (error) {console.error("has_resources_available()", error)}
    }

    static use_resources(resources) {
        try {
            const creature = impersonated();
            const isMonster = creature.constructor.name == "Monster"

            for (const name of resources) {
                const resource = creature.resources[name];

                // Conditions
                const isTurnResource = ["Action", "Attack Action", "Bonus Action", "Reaction", "Movement"].includes(name);
                const hasInitiative = Initiative.turn_order.includes(creature.id);
                const isSpell = JSON.stringify(resources).includes("Spell Slot")

                // Ignore turn resources if not in initiative
                if (isTurnResource && !hasInitiative) continue;

                // Monster Ignores Specific Resources
                if (!isTurnResource && !isSpell && isMonster) continue
                
                // Check if we can use Ready Action substitution
                const canUseReaction = creature.has_condition("Ready Action") && (name === "Action" || name === "Attack Action");

                // Handle Attack Action with possible Action/Reaction substitution
                if (name === "Attack Action" && resource.value < 1) {
                    if (canUseReaction && creature.resources["Reaction"].value >= 1) {
                        // Use Reaction instead of Action
                        creature.set_resource_value("Reaction", creature.resources["Reaction"].value - 1);
                        creature.remove_condition("Ready Action")
                    } else if (creature.resources["Action"].value >= 1) {
                        // Use Action normally
                        creature.set_resource_value("Action", creature.resources["Action"].value - 1);
                    } else {
                        log("An error occurred when calculating resources for Attack Action");
                        continue;
                    }
                    // Recharge attack action
                    creature.set_resource_value("Attack Action", resource.max - 1);
                    continue;
                }

                // Handle Action with Ready Action substitution
                if (name === "Action" && resource.value < 1 && canUseReaction) {
                    creature.set_resource_value("Reaction", creature.resources["Reaction"].value - 1);
                    creature.remove_condition("Ready Action")
                    creature.set_resource_value("Action", resource.max);
                }

                // Default consumption
                if (resource.value < 1) {
                    log(`An error occurred when calculating resources, that led an empty resource (${name}) to be spent`);
                    continue;
                }
                creature.set_resource_value(name, resource.value - 1);
            }
        } catch (error) {console.error("use_resources()", error)}
    }

    static damage(creature, target, result, damage_dice) {
        try {
            // Critical Hit Multiplier
            const crit_multiplier = result == "lands a critical hit" ? 2 : 1

            // Save for half
            const damage_multiplier = result == "saves for half damage" ? 0.5 : 1

            // Output
            const output = []
            let count = 0
            for (const damage of damage_dice) {
                // Calculate Damage
                const die_size = Number(damage.die_size) || 0
                const die_amount = Number(damage.die_amount) * crit_multiplier
                const damage_bonus = Number(damage.damage_bonus) || Number(damage.bonus_damage) || 0

                const damage_to_deal = Math.floor((roll_dice(die_amount, die_size) + damage_bonus) * damage_multiplier)
                count ++

                // Deal Damage
                const old_hp = target.health
                const damage_dealt = target.receive_damage(damage_to_deal, damage.damage_type)
                const resisted_text = damage_to_deal - damage_dealt > 0 
                    ? ` <span style="color:grey">(-${damage_to_deal - damage_dealt})</span>`
                    : ""
                if ((old_hp - target.health) != 0) this.on_damage_target({creature, target})

                output.push(`${damage_dealt}${resisted_text} ${damage.damage_type.toLowerCase()}`)
            }
            return output.join(", ")
        } catch (error) {console.error("damage()", error)}
    }

    //---------------------------------------------------------------------------------------------------
    // Events
    //---------------------------------------------------------------------------------------------------

    static on_damage_target({creature, target}) {
        try {
            // On target kill
            if (target.has_condition("Dead")) this.on_target_kill({creature, target})

            // Hex
            if (target.has_condition("Hex")) {
                if (target.get_condition("Hex").source == creature.id) {
                    const damage_to_deal = roll_dice(1, 6)
                    const damage_dealt = target.receive_damage(damage_to_deal, "Necrotic")
                    const resisted_text = damage_to_deal - damage_dealt > 0 
                    ? ` <span style="color:grey">(-${damage_to_deal - damage_dealt})</span>`
                    : ""
                    
                    console.log(`${target.name_color} received ${damage_dealt}${resisted_text} necrotic damage from hex.`, "all")
                }
            }
        } catch (error) {console.error("on_damage_target()", error)}
    }

    static on_target_kill({creature, target}) {
        try {
            // Soul Reaper
            if (creature.has_feature("Soul Reaper")) {
                const cha_bonus = creature.score_bonus["charisma"]
                const warlock_level = creature.classes?.["Warlock"]?.level || 1
                const temp_hp = Math.max(warlock_level + cha_bonus, 1)
                creature.gain_temporary_health(temp_hp)

                // Regular effect
                if (warlock_level < 11) {
                    console.log(`${creature.name_color} received ${temp_hp} temporary hit points from their patron.`, "all")
                }
                // Level 11 additional effects
                else if (warlock_level >= 11) {
                    const healing = Math.floor(temp_hp / 2)
                    creature.receive_healing(healing)
                    console.log(`${creature.name_color} has been healed for ${healing} and received ${temp_hp} temporary hit points from their patron.`, "all")
                }
            }

            // Sneak Attack
            if (creature.has_feature("Sneak Attack")) {
                creature.set_resource_value("Sneak Attack", 1)
                console.log(`${creature.name_color} regained sneak attack.`, "all")
            }
        } catch (error) {console.error("on_target_kill()", error)}
    }

    //---------------------------------------------------------------------------------------------------
    // Spell Helpers
    //---------------------------------------------------------------------------------------------------
    
    static make_spell_attack({
        name, creature=impersonated(), target, level, spellcasting_modifier, range, damage_dice, advantage_weight = 0,
        melee_disadvantage=true, face_target = true
    }={}) {
        try {

            // Validate Target
            if (!target) return {
                success: false,
                message: `${creature.name_color} needs to select a target for this spell.`
            }
            
            // Validate Visibility
            const target_visibility = creature.target_visibility()
            if (target_visibility == 0) return {
                success: false,
                message: `${creature.name_color} needs to see their target.`
            }
            
            // Validate Range
            const range_validation = this.validate_spell_range({creature, target, range, melee_disadvantage})
            if (range_validation.outOfRange) {
                return {
                    success: false,
                    message: `${creature.name_color} tried to cast ${name}, but their target is out of range.`
                }
            }
            advantage_weight += range_validation.advantage_weight

            // Calculate Hit
            const level_number = level[0] == "c" ? 0 : Number(level[0])
            const level_bonus = Math.max(0, Math.floor((level_number - 1) / 2));
            const hit_bonus = spellcasting_modifier + 2 + level_bonus
            const hit_result = this.attack_hit_result({hit_bonus, creature, target, advantage_weight, face_target})

            // Deal damage
            const damage_result = (hit_result.success
                ? ` dealing ${this.spell_damage(creature, target, hit_result.message, damage_dice)} damage.`
                : `.`
            )

            // Metamagic Empowered Spell
            if (creature.has_condition("Metamagic: Empowered Spell")) creature.remove_condition("Metamagic: Empowered Spell")

            // Make stealth tests and others
            this.attack_roll_advantage_modifiers({creature, target})

            // Output
            return {
                success: true,
                hit_result: hit_result,
                damage_result: damage_result,
                message: `${creature.name_color} attacks ${target.name_color} (AC ${target.armor_class}) with ${name} and ${hit_result.message} (${hit_result.dice_roll.text_color})${damage_result}`
            }
        } catch (error) {console.error("make_spell_attack()", error)}
    }

    static make_spell_save({name, creature=impersonated(), targets=[], max_targets=false, spellcasting_modifier, level, half_on_fail=false, range, damage_dice=[], saving_throw_score, advantage_weight = 0}={}) {
        try {
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
                const range_validation = Spells.validate_spell_range({creature, target, range})
                if (range_validation.outOfRange) return {
                    success: false,
                    message: `${creature.name_color} tried to cast ${name}, but one target is out of range.`
                }

                // Saving Throw
                const level_number = level[0] == "c" ? 0 : Number(level[0])
                const level_bonus = Math.max(0, Math.floor((level_number - 1) / 2));
                const difficulty_class = 10 + spellcasting_modifier + level_bonus
                const save_bonus = target.saving_throws[saving_throw_score.toLowerCase()] || 0
                const save_result = this.saving_throw_result({creature, target, difficulty_class, save_bonus, half_on_fail, advantage_weight})

                // Deal damage
                let damage_result; {
                    // Damage spell
                    if (damage_dice.length >= 1) {
                        damage_result = save_result.success && !half_on_fail
                            ? ` avoiding the effects.`
                            : ` receiving ${this.spell_damage(creature, target, save_result.message, damage_dice)} damage.`
                    }

                    // Effect only spell
                    else {
                        damage_result = save_result.success
                            ? ` avoiding the effects.`
                            : `.`
                    }
                }

                // Output
                console.log(
                    `${creature.name_color} casts ${name} (DC ${save_result.difficulty_class}) on ${target.name_color},` + 
                    ` who makes a ${saving_throw_score} save and ${save_result.message} (${save_result.dice_roll.text_color})${damage_result}`
                , "all")
                output.targets.push({
                    save_result: save_result,
                    damage_result: damage_result,
                    target: target,
                })
                output.success = true
                output.message = ""
            }

            // Metamagic Empowered Spell
            if (creature.has_condition("Metamagic: Empowered Spell") && damage_dice.length > 0) {
                creature.remove_condition("Metamagic: Empowered Spell")
            }

            return output
        } catch (error) {console.error("make_spell_save()", error)}
    }

    static validate_spell_range({creature, target, range, melee_disadvantage=true}) {
        try {
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
                else if (range > 5 && melee_disadvantage) {
                    // Melee disadvantage
                    if (meleeRange) output.advantage_weight -= 1
                }
            }
            return output
        } catch (error) {console.error("validate_spell_range()", error)}
    }

    static spell_damage(creature, target, result, damage_dice) {
        try {
            // Critical Hit Multiplier
            const crit_multiplier = result == "lands a critical hit" ? 2 : 1

            // Metamagic Transmute Spells
            const hasTransmuteSpells = creature.has_condition("Metamagic: Transmute Spells")
            const element = hasTransmuteSpells ? creature.get_condition("Metamagic: Transmute Spells").element : "None"

            // Metamagic Empowered Spell
            const hasEmpoweredSpell = creature.has_condition("Metamagic: Empowered Spell")
            let empowered_spell_bonus_damage = 0

            // Save for half
            const damage_multiplier = result == "saves for half damage" ? 0.5 : 1

            // Output
            const output = []
            let count = 0
            for (const damage of damage_dice) {
                // Calculate Damage
                const die_size = Number(damage.die_size) || 0
                const die_amount = Number(damage.die_amount) * crit_multiplier
                const damage_bonus = Number(damage.damage_bonus) || Number(damage.bonus_damage) || 0
                const damage_type = hasTransmuteSpells ? element : damage.damage_type

                // Roll damage normally first
                let damage_roll = roll_dice(die_amount, die_size)
                
                // Apply Empowered Spell if active
                if (hasEmpoweredSpell) {               
                    // Simple implementation: reroll the entire damage and take the better result
                    const alternative_roll = roll_dice(die_amount, die_size, "Highest")
                    empowered_spell_bonus_damage += (alternative_roll - damage_roll) * damage_multiplier
                    damage_roll = alternative_roll
                }

                const damage_to_deal = Math.floor((damage_roll + damage_bonus) * damage_multiplier)
                count++

                // Deal Damage
                const old_hp = target.health
                const damage_dealt = target.receive_damage(damage_to_deal, damage_type)
                const resisted_text = damage_to_deal - damage_dealt > 0 
                    ? ` <span style="color:grey">(-${damage_to_deal - damage_dealt})</span>`
                    : ""
                if ((old_hp - target.health) != 0) this.on_damage_target({creature, target})

                output.push(`${damage_dealt}${resisted_text} ${damage_type.toLowerCase()}`)
            }

            // Log metamagic
            if (hasEmpoweredSpell) {
                console.log(`Empowered Spell increased damage by ${empowered_spell_bonus_damage}`, "gm")
            }

            return output.join(", ")
        } catch (error) {console.error("spell_damage()", error)}
    }

    static remove_previous(creature, name) {
        try {
            const current = creature.get_condition(`Maintaining: ${name}`)
            if (current) {
                const previous_target = instance(current.target)

                // Remove conditions
                creature.remove_condition(`Maintaining: ${name}`)
                if (previous_target) previous_target.remove_condition(name)

                return previous_target
            }
        } catch (error) {console.error("remove_previous()", error)}
    }

    static saving_throw_result({target, difficulty_class, save_bonus, half_on_fail, advantage_weight = 0}) {
        try {
            // Advantage modifiers
            advantage_weight += 0

            // Roll d20
            save_bonus += target.roll_bonus()
            const dice_roll = roll_20(advantage_weight)
            const roll_to_save = dice_roll.result + save_bonus

            // Output
            let advantage = "None"; {
                if (advantage_weight > 0) advantage = "Advantage"
                else if (advantage_weight < 0) advantage = "Disadvantage"
            }
            const output = { success: false, message: "", dice_roll, difficulty_class, advantage}; {
                // Save
                if (roll_to_save >= difficulty_class) {
                    output.success = true
                    output.message = "saves" + (half_on_fail ? " for half damage" : "")
                }

                // Fail
                else if (roll_to_save < difficulty_class || target.has_condition("Paralyzed")) {
                    output.message = "fails the save"
                }

                // Add save bonus to text
                output.dice_roll.text += ` + ${save_bonus}`
                output.dice_roll.text_color += ` + ${save_bonus}`
            }
            return output
        } catch (error) {console.error("saving_throw_result()", error)}
    }

    //---------------------------------------------------------------------------------------------------
    // Attack Helpers
    //---------------------------------------------------------------------------------------------------

    static make_attack({slot, creature=impersonated(), target=selected(), damage_bonuses=[], hit_bonus=0, use_release_sound=true}) {
        try {
            
            const weapon = database.items.data[creature.equipment[slot]?.name]
            let advantage_weight = 0

            // Range Validation
            const range_validation = this.validate_weapon_attack_range({weapon, creature, target})
            if (range_validation.outOfRange) {
                return {
                    success: false,
                    message: `${creature.name_color} tried to attack ${target.name_color} using their ${weapon?.name || "fists"} but they are out of range.`
                }
            }
            advantage_weight += range_validation.advantage_weight

            // Release Sound
            let release_sound = "swing"; {
                if (!weapon) {}
                else if( weapon.name.toLowerCase().includes("crossbow") ) release_sound = "crossbow"
                else if ( weapon.name.toLowerCase().includes("bow") ) release_sound = "bow"
            }
            if (use_release_sound) Sound.play(release_sound, 0.1)

            // Calculate Hit
            hit_bonus += this.weapon_attack_hit_bonus({weapon, creature, target})
            const hit_result = this.attack_hit_result({hit_bonus, creature, target, weapon, advantage_weight})
            if (hit_result.success) {
                damage_bonuses = [...damage_bonuses, ...this.on_attack_hit_abilities({weapon, creature, target, advantage_weight: hit_result.advantage_weight})]
            }

            // Deal damage
            const dmg_bonus = [...this.weapon_attack_damage_bonuses({creature, weapon, target}), ...damage_bonuses]
            const args = {weapon, creature, target, hit_result: hit_result.message, slot, damage_bonuses: dmg_bonus}
            const damage_result = (hit_result.success 
                ? ` dealing ${this.weapon_attack_damage(args)} damage.`
                : `.`
            )

            // Axe Expertise
            //----- knock down on a failed DC 10 + strength

            // Make stealth tests and others
            this.attack_roll_advantage_modifiers({creature, target})

            // Output
            return {
                success: true,
                weapon: weapon,
                hit_result: hit_result,
                damage_result: damage_result,
                message: `${creature.name_color} attacks ${target.name_color} (AC ${target.armor_class}) with their ${weapon?.name || "fists"} and ${hit_result.message} (${hit_result.dice_roll.text_color})${damage_result}`
            }

        } catch (error) {console.error("make_attack()", error)}
    }

    static on_attack_hit_abilities({weapon, creature=impersonated(), target=selected(), advantage_weight=0}) {
        try {
            const damage_bonuses = [];
            const fields = {};

            // Validations
            const hasInitiative = Initiative.turn_order.includes(creature.id)
            const isPlaying = hasInitiative ? Initiative.turn_order[0] == creature.id : false 

            { // Options
                // Sneak Attack
                const isDexWeapon = weapon ? weapon.properties.includes("Finesse") || weapon.properties.includes("Ammunition") : false;
                if (
                    creature.has_feature("Sneak Attack") && 
                    isDexWeapon && 
                    advantage_weight > 0 && 
                    (this.has_resources_available(["Sneak Attack"]) || !isPlaying)
                ) {
                    fields["sneak_attack"] = {
                        label: "Sneak Attack",
                        value: 1,
                        type: "check"
                    };
                }

                // Eldritch Smite
                if (
                    creature.has_feature("Invocation: Eldritch Smite") &&
                    creature.get_resource_value("Pact Slot")
                ) {
                    fields["eldritch_smite"] = {
                        label: "Eldritch Smite",
                        value: 0,
                        type: "check"
                    }
                }
            }

            // Request User Input
            if (Object.keys(fields).length <= 0) return damage_bonuses
            const response = input(fields);
            
            
            {// Apply bonuses
                // Sneak Attack
                if (response.sneak_attack == 1) {
                    const rogue_level = creature ? creature.classes.Rogue?.level || 1 : 1
                    damage_bonuses.push({
                        die_amount: Math.ceil(rogue_level / 2),
                        die_size: (calculate_distance(creature, target) * 5) > 5 ? 4 : 8,
                        damage_type: weapon.damage?.[0]?.damage_type || "piercing" 
                    });
                    if (isPlaying) this.use_resources(["Sneak Attack"])
                }

                // Eldritch Smite
                if (response.eldritch_smite == 1) {
                    const warlock_level = creature ? creature.classes.Warlock?.level || 1 : 1
                    let die_amount = 3; {
                        if (warlock_level >= 7) die_amount += 1
                        if (warlock_level >= 9) die_amount += 1
                        if (warlock_level >= 11) die_amount += 1
                    }
                    damage_bonuses.push({
                        die_amount: die_amount,
                        die_size: 8,
                        damage_type: "Force"
                    });
                    this.use_resources(["Pact Slot"])
                }
            }

            return damage_bonuses;
        } catch (error) {console.error("on_attack_hit_abilities()", error)}
    }

    static weapon_attack_damage({weapon, creature=impersonated(), target=selected(), hit_result="hit", slot, damage_bonuses=[]}) {
        try {
            function treatLastComma(str) {
                const lastIndex = str.lastIndexOf(",");
                if (lastIndex === -1) return str; // no comma found

                return (
                    str.slice(0, lastIndex) +
                    " and" +
                    str.slice(lastIndex + 1)
                );
            }

            // Weapon Properties
            const isFinesse = weapon?.properties?.includes("Finesse") || false;
            const isAmmo = weapon?.properties?.includes("Ammunition") || false;
            const isOffHand = slot.includes("off hand")
            const damage_list = (weapon?.damage 
                ? [...weapon.damage, ...damage_bonuses] 
                : [{die_amount: 1, die_size: 1, damage_type: "Bludgeoning", damage_bonus: 0}, ...damage_bonuses]
            )

            // Creature Conditions
            const hasPactOfTheBlade = creature.has_feature("Pact of the Blade")

            // Applicable bonuses
            const str_bonus = creature.score_bonus["strength"];
            const dex_bonus = Math.min(creature.score_bonus["dexterity"], 3);
            const cha_bonus = creature.score_bonus["charisma"]

            // Attribute Bonus
            let damage_attribute_bonus = str_bonus;
            if (!isAmmo && isFinesse) damage_attribute_bonus = Math.max(str_bonus, dex_bonus)
            else if (isAmmo) damage_attribute_bonus = dex_bonus

            // Special Cases
            const hasTwoWeaponProf = creature.get_proficiency_level("Two-Weapon") >= 0;
            if (isOffHand && !hasTwoWeaponProf) damage_attribute_bonus = 0;
            else if (hasPactOfTheBlade) damage_attribute_bonus = Math.max(cha_bonus, damage_attribute_bonus);
            
            // Other damage modifiers
            const damage_modifiers = this.weapon_attack_damage_modifiers({creature, target})

            // Damage
            const crit_multiplier = hit_result == "lands a critical hit" ? 2 : 1;
            const damage_multiplier = hit_result == "grazes" ? 0.5 : 1

            // Damage to deal
            const total_damage = {}
            let count = 0
            for (const damage of damage_list) {
                // Calculate Damage
                const die_size = damage.die_size || 0
                const die_amount = (damage.die_amount || damage.die_ammount || 0) * crit_multiplier
                const damage_bonus = damage.damage_bonus || 0
                const applied_once_damage_modifiers = (count == 0 ? damage_attribute_bonus + damage_modifiers : 0)

                const type = damage.damage_type
                const damage_to_deal = Math.floor( (roll_dice(die_amount, die_size) + applied_once_damage_modifiers + damage_bonus) * damage_multiplier )
                count ++

                // Store
                if (!total_damage[type]) total_damage[type] = 0
                total_damage[type] += damage_to_deal
            }

            // Output
            const output = []
            for (const type in total_damage) {
                const damage_to_deal = total_damage[type]

                // Deal Damage
                const old_hp = target.health
                const damage_dealt = target.receive_damage(damage_to_deal, type)
                const resisted_text = damage_to_deal - damage_dealt > 0 
                    ? ` <span style="color:grey">(-${damage_to_deal - damage_dealt})</span>`
                    : ""
                if ((old_hp - target.health) != 0) this.on_damage_target({creature, target})
                output.push(`${damage_dealt}${resisted_text} ${type.toLowerCase()}`)

                // Sound
                Sound.play(type.toLowerCase())
            }
            
            return treatLastComma(output.join(", "))
        } catch (error) {console.error("weapon_attack_damage()", error)}
    }

    static validate_weapon_attack_range({weapon, creature=impersonated(), target=selected()}) {
        try {
            const usesAmmo = weapon?.properties?.includes("Ammunition") || false
            const isThrown = weapon?.properties?.includes("Thrown") || false
            const isReach = weapon?.properties?.includes("Reach") || false
            const range = weapon?.range || (isReach ? [10] : [5])

            // Calculated Conditions
            const distance = calculate_distance(creature, target) * 5
            const meleeRange = distance <= 5 || (distance <= 10 && isReach)

            // Output
            const output = { advantage_weight: 0, outOfRange: false, throwWeapon: false, requiresAmmo: false }
            {
                // Ranged Weapon
                if (usesAmmo) {
                    const outOfRange = distance > range[1]
                    const extendedRange = distance > range[0]

                    // Output
                    if (outOfRange) output.outOfRange = true
                    else if (extendedRange || meleeRange) output.advantage_weight -= 1
                    output.requiresAmmo = true
                }
                // Throwing Weapon
                else if (isThrown) { 
                    const outOfRange = distance > range[1]
                    const extendedRange = distance > range[0]

                    // Output
                    if (outOfRange) output.outOfRange = true
                    else if (extendedRange) output.throwWeapon = true
                }
                // Melee Weapon
                else {
                    const outOfRange = distance > range[0]

                    // Output
                    if (outOfRange) output.outOfRange = true
                }
            }

            return output
        } catch (error) {console.error("validate_weapon_attack_range()", error)}
    }

    static attack_hit_result({hit_bonus=0, creature=impersonated(), target=selected(), weapon, advantage_weight = 0, face_target = true}) {
        try {
            if (face_target) creature.face_target(target)
            const distance = calculate_distance(creature, target) * 5
            const target_visibility = creature.target_visibility(target)

            // Advantage Modifiers
            advantage_weight += this.attack_roll_advantage_modifiers({creature, target, view_only: true})

            // Roll d20
            const dice_roll = roll_20(advantage_weight, creature)
            const roll_to_hit = dice_roll.result

            // Cover
            let cover = 0; {
                // Three quarters cover
                if (target_visibility <= 0.25) cover = 5

                // Half cover
                else if (target_visibility <= 0.5) cover = 2

                if (calculate_distance(creature, target) <= 1) cover = 0
            }
            hit_bonus -= cover

            // Hit Bonus
            hit_bonus += creature.roll_bonus()

            // Output
            let advantage = "None"; {
                if (advantage_weight > 0) advantage = "Advantage"
                else if (advantage_weight < 0) advantage = "Disadvantage"
            }

            // Calculate armor and shield bonuses for graze check
            const body_slot = target.equipment.body;
            const off_hand_slot = target.equipment["primary off hand"]
            const unarmored_armor_class = 10

            // Armor bonus
            let armor_bonus = 0, is_metal_armor = false; {
                if (body_slot) {
                    const item = database.get_item(body_slot.name)
                    if (item) {
                        for (const element of ["plate", "splint", "chain", "scale", "ring"]) { if (item.name.toLowerCase().includes(element)) is_metal_armor = true }
                        armor_bonus = Math.max((item.base_armor_class || 0) - unarmored_armor_class, 0)
                    }
                }
            }

            // Shield bonus
            let shield_bonus = 0; {
                if (off_hand_slot) {
                    const item = database.get_item(off_hand_slot.name)
                    if (item?.subtype == "shield") {
                        shield_bonus = item.bonus_armor_class || 0
                    }
                }
            }

            const roll = roll_to_hit + hit_bonus
            const hit = roll >= target.armor_class
            const forced_crit = (target.has_conditions(["Paralyzed", "Unconscious"], "any")) && distance <= 5
            const output = { success: false, message: "", dice_roll, advantage, advantage_weight };

            // Check for graze before hit determination
            if (!forced_crit && roll >= unarmored_armor_class && roll < target.armor_class) {
                // Determine if graze is possible based on armor type
                const canAxeGraze = (
                    weapon?.properties?.includes("Axe") && 
                    (creature.get_proficiency_level("Axe") >= 0) &&
                    !is_metal_armor
                )
                const canBluntGraze = (
                    weapon?.properties?.includes("Blunt") && 
                    (creature.get_proficiency_level("Blunt Weapon") >= 0) &&
                    is_metal_armor
                )
                const hasArmor = target.armor_type != "None"
                const canGraze = hasArmor && (canBluntGraze || canAxeGraze)

                if (canGraze) {
                    output.success = true;
                    output.message = "grazes";
                    // Add hit bonus to text for graze
                    output.dice_roll.text += ` + ${hit_bonus}`;
                    output.dice_roll.text_color += ` + ${hit_bonus}`;

                    // Simulate armor or leather lessening the impact
                    if (is_metal_armor) Sound.play("armor")
                    else Sound.play("bludgeoning")

                    return output;
                }
            }

            // Critical Hit
            if (roll_to_hit === 20 || (hit && forced_crit)) {
                output.success = true
                output.message = "lands a critical hit"
            }
            // Critical Miss
            else if (roll_to_hit === 1) {
                output.message = "critically misses"
            }
            // Hit
            else if (hit) {
                output.success = true
                output.message = "hits"

                // Add hit bonus to text
                output.dice_roll.text += ` + ${hit_bonus}`
                output.dice_roll.text_color += ` + ${hit_bonus}`
            }
            // Miss
            else {
                output.message = "misses"

                // Add hit bonus to text
                output.dice_roll.text += ` + ${hit_bonus}`
                output.dice_roll.text_color += ` + ${hit_bonus}`

                // Play shield sound if hit shield
                if (roll >= unarmored_armor_class + armor_bonus && roll < unarmored_armor_class + shield_bonus + armor_bonus) {
                    Sound.play("shield")
                }
            }

            return output
        } catch (error) {console.error("attack_hit_result()", error)}
    }

    static weapon_attack_hit_bonus({weapon, creature=impersonated(), target=selected()}) {
        try {
            const weapon_properties = weapon?.properties || []

            const isFinesse = weapon_properties.includes("Finesse") || false;
            const isAmmo = weapon_properties.includes("Ammunition") || false;
            const hasPactOfTheBlade = creature.has_feature("Pact of the Blade")

            // Applicable bonuses
            const str_bonus = Math.min(creature.score_bonus.strength, 3);
            const dex_bonus = creature.score_bonus.dexterity;
            const cha_bonus = creature.score_bonus.charisma
            const wis_bonus = creature.score_bonus.wisdom

            // Hit Bonus
            let hit_bonus = str_bonus;
            if (!isAmmo && isFinesse) hit_bonus = Math.max(str_bonus, dex_bonus)
            else if (isAmmo) hit_bonus = dex_bonus
            
            // Pact of the blade
            if (hasPactOfTheBlade) hit_bonus = Math.max(hit_bonus, cha_bonus)

            // Favored Enemy
            const feature_name = `Favored Enemy: ${target.type}`
            if (creature.has_feature(feature_name)) hit_bonus += wis_bonus

            // Bow/Crossbow/Dueling Proficiency
            if (
                (weapon_properties.includes("Bow") && creature.get_proficiency_level("Bow") >= 1) ||
                (weapon_properties.includes("Crossbow") && creature.get_proficiency_level("Crossbow") >= 1) ||
                (
                    !weapon_properties.includes("Two-Handed") && 
                    creature.get_proficiency_level("Dueling") >= 0 &&
                    creature.equipment["primary off hand"] == null
                )
            ) hit_bonus += 2

            // Proficiency
            const canApplyProfBonus = (
                creature.constructor.name == "Monster" ||
                ((weapon_properties.includes("Mundane")) && creature.get_proficiency_level("Weapon") >= 0) ||
                ((weapon_properties.includes("Simple")) && creature.get_proficiency_level("Weapon")) >= 1 ||
                ((weapon_properties.includes("Martial")) && creature.get_proficiency_level("Weapon")) >= 1
            )
            const prof_bonus = canApplyProfBonus ? 2 : 0

            return hit_bonus + prof_bonus;
        } catch (error) {console.error("weapon_attack_hit_bonus()", error)}
    }

    static attack_roll_advantage_modifiers({creature=impersonated(), target=selected(), view_only = false}) {
        try {
            const distance = calculate_distance(creature, target) * 5
            let output = 0; {
                // Blinded
                if (target.has_condition("Blinded")) output += 1
                if (creature.has_condition("Blinded")) output -= 1

                // Blur
                if (target.has_condition("Blur")) output -= 1

                // Dodge
                if (target.has_condition("Dodge")) output -= 1

                // Faerie Fire
                if (target.has_condition("Faerie Fire")) output += 1

                // Frostbite
                if (creature.has_condition("Frostbite")) {
                    if (!view_only) creature.remove_condition("Frostbite")
                    output -= 1
                }

                // Vicious Mockery
                if (creature.has_condition("Vicious Mockery")) {
                    if (!view_only) creature.remove_condition("Vicious Mockery")
                    output -= 1
                }

                // Guiding Bolt
                if (target.has_condition("Guiding Bolt")) {
                    if (!view_only) target.remove_condition("Guiding Bolt")
                    output += 1
                }

                // Helped
                if (creature.has_condition("Helped")) {
                    if (!view_only) creature.remove_condition("Helped")
                    output += 1
                }

                // Paralyzed
                if (target.has_condition("Paralyzed")) output += 1

                // Petrified
                if (target.has_condition("Petrified")) output += 1

                // Prone
                if (creature.has_condition("Prone")) output -= 1
                if (target.has_condition("Prone")) {
                    if (distance > 5) output -= 1
                    else if (distance <= 5) output += 1
                }

                // Reckless Attack
                if (target.has_condition("Reckless Attack") || creature.has_condition("Reckless Attack")) output += 1

                // Grappled
                if (creature.has_condition("Grappled")) {
                    // Grappled creature gains disadvantage attacking others (not the grappler)
                    const grappler_id = creature.get_condition("Grappled").source
                    if (target.id != grappler_id) output -= 1
                }
                if (target.has_condition("Grappled")) {
                    // Advantage if you are attacking someone grappled by another (you are not the grappler)
                    const grappler_id = target.get_condition("Grappled").source
                    if (creature.id != grappler_id) output += 1
                }

                // Restrained
                if (creature.has_condition("Restrained")) output -= 1
                if (target.has_condition("Restrained")) output += 1

                // Stunned
                if (target.has_condition("Stunned")) output += 1

                // Unconscious
                if (target.has_condition("Unconscious")) output += 1

                // Unseen Attacker
                if (creature.has_conditions(["Hidden", "Invisible"], "any")) {
                    if (!view_only) {
                        creature.maintain_stealth(true)
                        target.passive_search()
                        creature.remove_condition("Invisibility")
                    }
                    output += 1
                }
            }

            // Output
            return output
        } catch (error) {console.error("attack_roll_advantage_modifiers()", error)}
    }

    static weapon_attack_damage_modifiers({creature=impersonated(), target=selected()}) {
        try {
            let output = 0; {

                // Rage
                if (creature.has_condition("Rage")) {
                    output += 2
                    const barbarian_level = creature.classes?.Barbarian?.level || 0
                    if (barbarian_level >= 9) output += 1
                    if (barbarian_level >= 16) output += 1
                }

            }
            return output
        } catch (error) {console.error("weapon_attack_damage_modifiers()", error)}
    }

    static weapon_attack_damage_bonuses({creature=impersonated(), target=selected(), weapon}) {
        try {
            const output = []; {
                const default_damage = weapon?.damage?.[0]?.damage_type || "Force"

                // Favored Enemy
                const feature_name = `Favored Enemy: ${target.type}`
                if (creature.has_feature(feature_name)) {
                    output.push({die_amount: 0, die_size: 0, damage_type: default_damage, damage_bonus: creature.score_bonus.wisdom})
                }

                // Hunter's Mark
                if (target.has_condition("Hunter's Mark")) {
                    const condition = target.get_condition("Hunter's Mark")
                    if (condition.source == creature.id) {
                        output.push({die_amount: 1, die_size: 6, damage_type: default_damage, damage_bonus: 0})
                    }
                }

                // Imbue Weapon
                if (creature.has_condition("Imbue Weapon")) {
                    const condition = creature.get_condition("Imbue Weapon")
                    output.push({die_amount: 0, die_size: 0, damage_type: condition.damage_type, damage_bonus: condition.damage_bonus})
                }

                // Elemental Weapon
                if (creature.has_condition("Elemental Weapon")) {
                    const condition = creature.get_condition("Elemental Weapon")
                    output.push({die_amount: condition.die_amount || 1, die_size: 4, damage_type: condition.damage_type, damage_bonus: 0})
                }

            }
            return output
        } catch (error) {console.error("weapon_attack_damage_bonuses()", error)}
    }
}