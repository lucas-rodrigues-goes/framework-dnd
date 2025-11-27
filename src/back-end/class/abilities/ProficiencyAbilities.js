

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

            // Cleave
            if (creature.get_proficiency_level("Cleaving") >= 0) abilities_list["cleave"] = {
                resources: ["Attack Action"],
                description: `At the cost of precision, you can attack 2 adjacent targets at a penalty of -5, or 3 targets at a -7 penalty.`,
                image: "asset://6896457a8a8a9e6f2444c9c0cf4830d2",
                type: "Attack",
                origin: origin,
            }
            if (creature.get_proficiency_level("Cleaving") >= 1) abilities_list["cleave"].description =
                `At the cost of precision, you can attack 2 adjacent targets at a penalty of -3, or 3 targets at a -5 penalty.`
        }

        return abilities_list
    }

    //---------------------------------------------------------------------------------------------------
    // Abilities
    //---------------------------------------------------------------------------------------------------

    static cleave () {
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
            const hasImprovedCleave = creature.get_proficiency_level("Cleaving") >= 1
            if (targets.length == 3) hit_bonus = hasImprovedCleave ? -5 : -7
            else if (targets.length == 2) hit_bonus = hasImprovedCleave ? -3 : -5
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
    }

    static heavy_striking () {}

    static focused_shooter () {}

    //---------------------------------------------------------------------------------------------------
}
