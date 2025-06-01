

var ProficiencyAbilities = class extends Abilities {
    // Ability List
    static abilities_list(creature=impersonated()) {
        const origin = "ProficiencyAbilities"
        const abilities_list = {}
        const type = "Proficiency"

        /* Combat Proficiencies */ {
            const weapon = database.items.data[creature.equipment["primary main hand"]?.name]

            // Multishot
            if (
                creature.get_proficiency_level("Bow") >= 1 && weapon.properties.includes("Bow")
            ) abilities_list["multishot"] = {
                resources: ["Attack Action"],
                description: database.proficiencies.data["Bow"].description[1],
                image: "",
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
    }

    //---------------------------------------------------------------------------------------------------
}
