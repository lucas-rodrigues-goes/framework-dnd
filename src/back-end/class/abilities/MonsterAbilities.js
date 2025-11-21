

var MonsterAbilities = class extends Abilities {

    //---------------------------------------------------------------------------------------------------
    // Helpers
    //---------------------------------------------------------------------------------------------------

    // Rewritten for monster abilities
    static check_action_requirements(ability) {
        const creature = impersonated();
        const targets = allSelected();
        const target = selected();

        if (!this.has_resources_available(ability.resources)) {
            return { valid: false };
        }

        return { valid: true, creature, target, targets };
    }

    static execute_special_ability(ability, creature, targets) {
        // Validate target selection count
        if (targets.length === 0) {
            console.log(`${creature.name_color} must select at least 1 target for ${ability.name}.`, "all");
            return;
        }
        if (ability.max_targets && targets.length > ability.max_targets) {
            console.log(`${creature.name_color} can only target up to ${ability.max_targets} creature(s) with ${ability.name}.`, "all");
            return;
        }

        // Process each target
        for (const target of targets) {
            // Validate Range
            const range_validation = this.validate_spell_range({creature, target, range: ability.range});
            if (range_validation.outOfRange) {
                console.log(`${creature.name_color} tried to use ${ability.name} on ${target.name_color} but they are out of range.`, "all");
                continue;
            }

            // Make saving throw if DC is specified
            let save_result = null;
            if (ability.difficulty_class > 0) {
                const save_attribute = ability.save_attribute?.toLowerCase() || "dexterity";
                const save_bonus = target.saving_throws[save_attribute] || 0;
                
                save_result = this.saving_throw_result({
                    creature,
                    target,
                    difficulty_class: ability.difficulty_class,
                    save_bonus,
                    half_on_fail: ability.half_damage_on_save,
                    advantage_weight: 0
                });
            }

            // Handle damage - FIXED LOGIC
            let damage_result = "";
            const saving_throw_messages = [];
            
            if (ability.damage && ability.damage.length > 0) {
                if (save_result) {
                    // Has saving throw
                    if (save_result.success && !ability.half_damage_on_save) {
                        // Save succeeds and no half damage → no damage
                        damage_result = ` avoiding the effects.`;
                    } else {
                        // Save fails OR save succeeds with half damage → apply damage
                        damage_result = ` receiving ${this.damage(creature, target, save_result.message, ability.damage)} damage.`;
                    }
                } else {
                    // No saving throw → full damage
                    damage_result = ` receiving ${this.damage(creature, target, "hit", ability.damage)} damage.`;
                }
            } else {
                // No damage dice, just effects
                if (save_result) {
                    damage_result = save_result.success ? ` avoiding the effects.` : `.`;
                } else {
                    damage_result = `.`;
                }
            }

            // Apply conditions on failed save (or always if no save required)
            if (ability.conditions && ability.conditions.length > 0) {
                const applies_conditions = !save_result || !save_result.success;
                
                if (applies_conditions) {
                    for (const condition of ability.conditions) {
                        const { name, duration } = condition;
                        const duration_text = duration == -1 ? `` : ` for ${duration} rounds`;

                        target.set_condition(name, duration);
                        saving_throw_messages.push(`${target.name_color} received ${name} condition${duration_text} due to ${ability.name.toLowerCase()}.`);
                    }
                } else if (save_result) {
                    saving_throw_messages.push(`${target.name_color} resisted the effects of ${ability.name.toLowerCase()}.`);
                }
            }

            // Output results
            if (save_result) {
                console.log(
                    `${creature.name_color} uses ${ability.name} (DC ${save_result.difficulty_class}) on ${target.name_color},` + 
                    ` who makes a ${ability.save_attribute} save and ${save_result.message} (${save_result.dice_roll.text_color})${damage_result}`,
                    "all"
                );
            } else {
                // No saving throw - automatic effect
                console.log(
                    `${creature.name_color} uses ${ability.name} on ${target.name_color}${damage_result}`,
                    "all"
                );
            }

            // Output condition messages
            for (const message of saving_throw_messages) {
                console.log(message, "all");
            }

            // Play damage sound
            if (ability.damage && ability.damage.length > 0) {
                // Only play sound if damage was actually dealt
                const dealtDamage = !save_result || (save_result && (!save_result.success || ability.half_damage_on_save));
                if (dealtDamage) {
                    for (const damage of ability.damage) {
                        Sound.play(damage.damage_type.toLowerCase());
                    }
                }
            } else {
                Sound.play("spell");
            }
        }

        // Set recovery (cast_time replaces recovery for special abilities)
        Initiative.set_recovery(ability.cast_time || 0, creature);
    }

    // Finish casting for monster abilities
    static finish_monster_casting() {
        const creature = impersonated();
        if (!creature.has_condition("Spellcasting")) return;

        const condition = creature.get_condition("Spellcasting");
        const { spell, isMonsterAbility } = condition;

        if (!isMonsterAbility) return;

        this.execute_special_ability(spell, creature, allSelected());
        creature.remove_condition("Spellcasting");
        
        // Consume resources for delayed casting
        this.use_resources(spell.resources);
    }

    static use(ability) {
        switch (ability.type) {
            case "Attack":
                this.attack(ability)
                break
            case "Special":
                this.special(ability)
                break
            case "Monster Ability":
                this.special(ability)
                break
        }
    }


    //---------------------------------------------------------------------------------------------------
    // Main Ability Logic
    //---------------------------------------------------------------------------------------------------

    static attack(ability) {
        // Requirements
        const { valid, creature, targets } = this.check_action_requirements(ability);
        if (!valid || !creature) return;

        // Parameters
        const damage_list = [...ability.damage]
        let hit_bonus = ability.hit_bonus

        /* Buffs */ ; {
            // Ranger's Companion
            if (creature.has_condition("Ranger's Companion")) {
                const condition = creature.get_condition("Ranger's Companion")
                const source = instance(condition.source)
                if (source) {
                    hit_bonus += Number(source.score_bonus.wisdom)
                }
            }
        }

        // Validate target selection count
        if (targets.length === 0) {
            console.log(`${creature.name_color} must select at least 1 target.`, "all");
            return;
        }
        if (targets.length > ability.max_targets) {
            console.log(`${creature.name_color} can only target up to ${ability.max_targets} creature(s) with ${ability.name}.`, "all");
            return;
        }
        if (targets.length > 3) {
            console.log(`${creature.name_color} cannot target more than 3 creatures with any attack.`, "all");
            return;
        }

        // Validate adjacency if more than 1 target
        if (targets.length > 1) {
            for (const t1 of targets) {
                let adjacent = false;
                for (const t2 of targets) {
                    if (t1.id === t2.id) continue;
                    if (calculate_distance(t1, t2) <= 1) {
                        adjacent = true;
                        break;
                    }
                }
                if (!adjacent) {
                    console.log(`${creature.name_color} must select adjacent targets for this attack.`, "all");
                    return;
                }
            }
        }

        // Attack each target
        let i = 0;
        for (const target of targets) {
            // Range Validation
            const in_range = (calculate_distance(creature, target) * 5) <= ability.range;
            if (!in_range) {
                console.log(`${creature.name_color} tried to attack ${target.name_color} using ${ability.name} but they are out of range.`, "all");
                continue;
            }

            // Release sound only on first strike
            if (i === 0) Sound.play("swing", 0.1);

            // Calculate hit
            const hit_result = this.attack_hit_result({
                hit_bonus,
                creature,
                target,
                advantage_weight: 0
            });

            // Damage result
            const damage_result = hit_result.success
                ? ` dealing ${this.damage(creature, target, hit_result.message, damage_list)} damage.`
                : `.`

            // Make stealth checks and others
            this.attack_roll_advantage_modifiers({creature, target})

            // Damage sound
            if (hit_result.success) {
                for (const damage of damage_list) Sound.play(damage.damage_type.toLowerCase())
            }

            // Apply condition
            const saving_throw_messages = []
            const appliesCondition = ability.conditions.length > 0
            const appliesDamageOnSaveFail = (ability?.damage_on_save_fail?.length || 0) > 0
            if ((appliesCondition || appliesDamageOnSaveFail) && hit_result.success) {
                let applyEffects = true
                const requiresSave = ability.difficulty_class != 0

                if (requiresSave) {
                    const saving_throw_score = ability.save_attribute
                    const save_bonus = target.saving_throws[saving_throw_score.toLowerCase()] || 0
                    const save_result = this.saving_throw_result({
                        creature, target, 
                        difficulty_class: ability.difficulty_class, 
                        save_bonus, 
                        half_on_fail: false,
                        advantage_weight: 0
                    })

                    applyEffects = save_result.success
                    if (!save_result.success) saving_throw_messages.push(`${target.name_color} resisted the effects of ${ability.name.toLowerCase()}.`)
                }

                if (applyEffects) {
                    for (const condition of ability.conditions) {
                        const {name, duration} = condition
                        const duration_text = duration == -1 ? `` : ` for ${duration} rounds`

                        target.set_condition(name, duration)
                        saving_throw_messages.push(`${target.name_color} received ${name} condition${duration_text} due to ${ability.name.toLowerCase()}.`)
                    }
                    if (appliesDamageOnSaveFail) {
                        const damage = this.damage(creature, target, "failed save", ability.damage_on_save_fail)
                        saving_throw_messages.push(`${target.name_color} received ${damage} damage due to ${ability.name.toLowerCase()}`)
                    }
                }
                else if (ability.half_damage_on_save && appliesDamageOnSaveFail) {
                    const damage = this.damage(creature, target, "saves for half damage", ability.damage_on_save_fail)
                    saving_throw_messages.push(`${target.name_color} resisted some of the effects of ${ability.name.toLowerCase()} receiving ${damage} damage.`)
                }
            }

            // Output
            console.log(`${creature.name_color} attacks ${target.name_color} (AC ${target.armor_class}) with ${ability.name.toLowerCase()} and ${hit_result.message} (${hit_result.dice_roll.text_color})${damage_result}`, "all")
            for (const message of saving_throw_messages) console.log(message, "all")
            i++;
        }

        // Consume resources only once
        this.use_resources(ability.resources);
        Initiative.set_recovery(ability.recovery, creature);
    }

    static special(ability) {
        // Requirements
        const { valid, creature, targets } = this.check_action_requirements(ability);
        if (!valid || !creature) return;

        // Handle cast time (delayed execution if cast_time > 0)
        if (ability.cast_time > 0 && Initiative.turn_order.includes(creature.id)) {
            // Set condition for delayed casting
            creature.set_condition("Spellcasting", 1, { 
                spell: ability,
                isMonsterAbility: true 
            });
            Initiative.suspend_turn(ability.cast_time, "Spellcasting", creature);
            
            console.log(`${creature.name_color} begins casting ${ability.name}...`, "all");
            return;
        }

        // Instant execution (no cast time or not in initiative)
        this.execute_special_ability(ability, creature, targets);
        
        // Consume resources
        this.use_resources(ability.resources);
    }

}
