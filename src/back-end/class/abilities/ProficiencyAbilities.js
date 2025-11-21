

var ProficiencyAbilities = class extends Abilities {
    // Ability List
    static abilities_list(creature=impersonated()) {
        const origin = "ProficiencyAbilities"
        const abilities_list = {}
        const type = "Proficiency"

        /* Combat Proficiencies */ {
            const item_slot = creature.equipment["primary main hand"];
            const weapon_name = item_slot?.name;
            const weapon = weapon_name ? database.items.data[weapon_name] : undefined;

            // Multishot
            if (creature.get_proficiency_level("Bow") >= 2 && weapon?.properties?.includes("Bow")) abilities_list["multishot"] = {
                resources: ["Attack Action"],
                description: `When you use this ability, you can choose to strike up to 2 adjacent targets with a -5 penalty to your hit bonus, or 3 adjacent targets at a -7 penalty.`,
                image: "asset://8f1fd7e5fa3d764630f297ae0181ded0",
                type: "Attack",
                origin: origin,
            }

            // Cleave
            if (creature.get_proficiency_level("Sword") >= 2 && weapon?.properties?.includes("Greatsword") ||
                creature.get_proficiency_level("Axe") >= 2 && weapon?.properties?.includes("Greataxe") ||
                creature.get_proficiency_level("Polearm") >= 2 && weapon?.properties?.includes("Glaive")
            ) abilities_list["cleave"] = {
                resources: ["Attack Action"],
                description: `When you use this ability, you can choose to strike up to 2 adjacent targets with a -5 penalty to your hit bonus, or 3 adjacent targets at a -7 penalty.`,
                image: "asset://6896457a8a8a9e6f2444c9c0cf4830d2",
                type: "Attack",
                origin: origin,
            }
        }

        return abilities_list
    }

    //---------------------------------------------------------------------------------------------------
    // Abilities
    //---------------------------------------------------------------------------------------------------

    static multishot() {
        try {
            const action_name = "multishot"
            const slot = "primary main hand"
            const targets = allSelected()

            // Requirements
            const { valid, creature, action_details } = this.check_action_requirements(action_name, false)
            if (!valid) return

            // Hit bonus and target validation
            let hit_bonus ; {
                // Target count
                if (targets.length < 2) {
                    console.log(`${creature.name} needs to select at least 2 targets for this action.`, "all")
                    return
                }
                else if (targets.length > 3) {
                    console.log(`${creature.name} can only select up to 3 targets for this action.`, "all")
                    return
                }
                
                // Range Validation
                for (const target of targets) {
                    const weapon = database.items.data[creature.equipment[slot]?.name]
                    const range_validation = this.validate_weapon_attack_range({weapon, creature, target})
                    if (range_validation.outOfRange) {
                        console.log(`${creature.name_color} tried to attack ${target.name_color} using their ${weapon?.name || "fists"} but they are out of range.`, "all")
                        return
                    }
                }

                // Target adjacency
                for (const target of targets) {
                    // Verify if any of the other targets is adjacent to current
                    let isAdjacent = false
                    for (const target2 of targets) {
                        if (target2.id == target.id) continue
                        if (calculate_distance(target, target2) <= 1) {
                            isAdjacent = true
                            break
                        }
                    }

                    // Log
                    if (!isAdjacent) {
                        console.log(`${creature.name} must select adjacent targets for this action.`, "all")
                        return
                    }
                }

                // Hit Bonus
                if (targets.length == 3) hit_bonus = -7
                else if (targets.length == 2) hit_bonus = -5
            }

            // Make Attacks
            let i = 0
            for (const target of targets) {
                const attack_result = this.make_attack({slot, creature, target, hit_bonus, use_release_sound: i==0})
                console.log(attack_result.message, "all")
                i++
            }

            // Consume resources
            this.use_resources(action_details.resources)
            Initiative.set_recovery(action_details.recovery, creature)
        } catch (error) { console.error("cleave()", error) }
    }

    static cleave() {
        try {
            const action_name = "cleave"
            const slot = "primary main hand"
            const targets = allSelected()

            // Requirements
            const { valid, creature, action_details } = this.check_action_requirements(action_name, false)
            if (!valid) return

            // Hit bonus and target validation
            let hit_bonus ; {
                // Target count
                if (targets.length < 2) {
                    console.log(`${creature.name} needs to select at least 2 targets for this action.`, "all")
                    return
                }
                else if (targets.length > 3) {
                    console.log(`${creature.name} can only select up to 3 targets for this action.`, "all")
                    return
                }
                
                // Range Validation
                for (const target of targets) {
                    const weapon = database.items.data[creature.equipment[slot]?.name]
                    const range_validation = this.validate_weapon_attack_range({weapon, creature, target})
                    if (range_validation.outOfRange) {
                        console.log(`${creature.name_color} tried to attack ${target.name_color} using their ${weapon?.name || "fists"} but they are out of range.`, "all")
                        return
                    }
                }

                // Target adjacency
                for (const target of targets) {
                    // Verify if any of the other targets is adjacent to current
                    let isAdjacent = false
                    for (const target2 of targets) {
                        if (target2.id == target.id) continue
                        if (calculate_distance(target, target2) <= 1) {
                            isAdjacent = true
                            break
                        }
                    }

                    // Log
                    if (!isAdjacent) {
                        console.log(`${creature.name} must select adjacent targets for this action.`, "all")
                        return
                    }
                }

                // Hit Bonus
                if (targets.length == 3) hit_bonus = -7
                else if (targets.length == 2) hit_bonus = -5
            }

            // Make Attacks
            let i = 0
            for (const target of targets) {
                const attack_result = this.make_attack({slot, creature, target, hit_bonus, use_release_sound: i==0})
                console.log(attack_result.message, "all")
                i++
            }

            // Consume resources
            this.use_resources(action_details.resources)
            Initiative.set_recovery(action_details.recovery, creature)
        } catch (error) { console.error("cleave()", error) }
    }

    //---------------------------------------------------------------------------------------------------
}
