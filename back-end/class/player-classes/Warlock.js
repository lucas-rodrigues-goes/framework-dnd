

var Warlock = class extends PlayerClass {

    //---------------------------------------------------------------------------------------------------
    // Parameters
    //---------------------------------------------------------------------------------------------------

    static get lore() {
        return `
            Warlocks forge pacts with powerful beings—eldritch entities, ancient fey, fiends, or cosmic forces.
            Through these bargains, they gain mystical knowledge and arcane abilities far beyond normal mortals.`
    }

    static get description() {
        return `
            Warlocks are arcane casters who focus on a small pool of spell slots that recharge on a short rest,
            allowing them to stay effective across multiple encounters. They know very few spells, but their
            Eldritch Invocations provide strong customization options that can dramatically alter their combat
            or utility capabilities. Their signature feature, Eldritch Blast, scales naturally with level and can
            become a reliable primary attack with the right invocations.
            <br><br>
            Warlocks rely on their Charisma score for their spellcasting. And usually have limited martial training,
            unless their Patron or Pact Boon expands their combat options.`
    }

    static get healthPerLevel () { return 5 }
    static get spellcasting () {
        return {
            type: "full",
            known: true,
            ability: "charisma"
        }
    }
    static get image () { return "asset://9663e79e3e5c493352a92ca0ba6acc60" }

    //---------------------------------------------------------------------------------------------------
    // Leveling
    //---------------------------------------------------------------------------------------------------

    static level_up(player, choices) {
        super.level_up(player, choices, "Warlock")
        const current_level = player.classes.Warlock.level

        // Update Pact Slots
        if (current_level == 1) player.set_new_resource("Pact Slot", 2, "short rest") //--> Creates resource
        else if (current_level == 5) player.set_resource_max("Pact Slot", 3)
        else if (current_level == 11) player.set_resource_max("Pact Slot", 4)
        else if (current_level == 17) player.set_resource_max("Pact Slot", 5)

        // Level based specific changes
        switch(current_level) {
            case 1: {
                const multi_class = player.level != 1

                // Add starting proficiencies
                const starting_proficiencies = !multi_class
                    ? ["Wisdom Saves", "Charisma Saves", "Light Armor"]
                    : [] //--> Reduced list for multiclassing
                for (const proficiency of starting_proficiencies) player.set_proficiency(proficiency, 0, true)
                player.set_proficiency("Weapon", 1, true)
                break
            }
            case 5: {
                // Extra attack
                if (player.has_feature("Pact of the Blade")) player.add_feature("Extra Attack")
            }
        }

        player.save()
    }

    static level_up_info(player) {
        const current_level = player ? (player.classes.Warlock?.level + 1) || 1 : 1
        const multi_class = player ? player.level != 0 : false
        const max_spell_slot_level = Math.ceil(current_level / 2)

        // Return structures
        const choices = { proficiencies: [], features: [], spells: [], subclass: [] }
        const proficiencies = []
        const features = [...database.get_features_list({subtype: "Warlock", optional: "false"})].sort(
            (a, b) => database.features.data[a].level - database.features.data[b].level
        )

        const invocations = database.get_features_list({}, null, "Invocation: ")
        const pact_boons = database.get_features_list({}, null, "Pact of the")

        // Choices based on level
        switch (current_level) {
            case 1: {
                // Starting proficiencies
                if (!multi_class) for (const item of ["Wisdom Saves", "Charisma Saves", "Light Armor"]) {
                    proficiencies.push({name: item, level: 0})
                }

                // Weapon Proficiency
                proficiencies.push({name: "Weapon", level: 1})

                // Choose two skills if not multiclassing
                if (!multi_class) {
                    choices.proficiencies.push(super.skill_choice(["Arcana", "Deception", "History", "Intimidation", "Investigation", "Nature", "Religion"], 2))
                }

                // Choose 2 new cantrips
                choices.spells.push({amount: 2, player_class: "Warlock", level: 0})

                // Choose 2 new spells
                choices.spells.push({amount: 2, player_class: "Warlock", level: max_spell_slot_level})

                break
            }
            case 2: {
                // Choose 2 invocations
                choices.features.push({amount: 3, options: invocations})

                break
            }
            case 4: {
                // Choose 1 new cantrip
                choices.spells.push({amount: 1, player_class: "Warlock", level: 0})

                // Choose a Pact Boon
                choices.features.push({amount: 1, options: pact_boons})

                break
            }
            case 5: {
                // Choose 1 invocation
                choices.features.push({amount: 1, options: invocations})

                break
            }
            case 7: {
                // Choose 1 invocation
                choices.features.push({amount: 1, options: invocations})

                break
            }
            case 9: {
                // Choose 1 invocation
                choices.features.push({amount: 1, options: invocations})

                break
            }
            case 10: {
                // Choose 1 new cantrip
                choices.spells.push({amount: 1, player_class: "Warlock", level: 0})

                break
            }
            case 12: {
                // Choose 1 invocation
                choices.features.push({amount: 1, options: invocations})

                break
            }
            case 15: {
                // Choose 1 invocation
                choices.features.push({amount: 1, options: invocations})

                break
            }
            case 18: {
                // Choose 1 invocation
                choices.features.push({amount: 1, options: invocations})

                break
            }
        }

        // On every new level learn 1 spells
        if (current_level != 1) choices.spells.push({amount: 1, player_class: "Warlock", level: max_spell_slot_level})
        
        return {proficiencies, choices, features}
    }

    //---------------------------------------------------------------------------------------------------

}

// Add to PlayerClass
PlayerClass.add("Warlock", Warlock)