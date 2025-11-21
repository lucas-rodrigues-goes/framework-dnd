

var Ranger = class extends PlayerClass {

    //---------------------------------------------------------------------------------------------------
    // Parameters
    //---------------------------------------------------------------------------------------------------

    static get lore() { 
        return `
            Rangers are wanderers of the wilds, shaped by harsh terrain, constant travel,
            and deep familiarity with the creatures that inhabit the wilderness. Their
            instincts, training, and bond with nature turn them into expert trackers and
            hunters.`
    }

    static get description() {
        return `
            Rangers are agile combatants who mix weapon mastery with nature-driven magic.
            They specialize in scouting, tracking enemies, and controlling the battlefield
            through mobility and precision. Their spellcasting enhances their senses,
            movement, and attacks rather than providing raw magical power.
            <br><br>
            Rangers rely on Wisdom for their magic and typically fight with bows, agile
            weapons, or paired blades. Their strengths come from tracking techniques,
            intense enemy study, and battlefield awareness.`
    }
    static get healthPerLevel () { return 6 }
    static get spellcasting () {
        return {
            type: "half",
            known: true,
            ability: "wisdom"
        }
    }
    static get image () { return "asset://90baa66f12545c72476e0cfd3050620f" }

    //---------------------------------------------------------------------------------------------------
    // Leveling
    //---------------------------------------------------------------------------------------------------

    static level_up(player, choices) {
        super.level_up(player, choices, "Ranger")
        const current_level = player.classes.Ranger.level

        // Level based specific changes
        switch(current_level) {
            case 1: {
                const multi_class = player.level != 1

                // Add starting proficiencies
                const starting_proficiencies = !multi_class
                    ? ["Strength Saves", "Dexterity Saves"]
                    : [] //--> Reduced list for multiclassing
                for (const proficiency of starting_proficiencies) player.set_proficiency(proficiency, 0, true)
                player.set_proficiency("Weapon", 2, true)
                break
            }
            case 5: {
                // Extra attack
                player.add_feature("Extra Attack")
            }
        }

        player.save()
    }

    static level_up_info(player) {
        const current_level = player ? (player.classes.Ranger?.level + 1) || 1 : 1
        const multi_class = player ? player.level != 0 : false
        const max_spell_slot_level = current_level == 1 ? 0 : Math.ceil(current_level / 4)
        const current_proficiencies = player ? player.proficiencies : {}

        // Return structures
        const choices = { proficiencies: [], features: [], spells: [], subclass: [] }
        const proficiencies = []
        const features = [...database.get_features_list({subtype: "Ranger", optional: "false"})].sort(
            (a, b) => database.features.data[a].level - database.features.data[b].level
        )

        const player_features = player ? player.features : []
        const favored_enemy_options = database.get_features_list({optional: true}, null, "Favored Enemy: ").filter(element => !player_features.includes(element))

        // Choices based on level
        switch (current_level) {
            case 1: {
                // Starting proficiencies
                if (!multi_class) for (const item of ["Strength Saves", "Dexterity Saves"]) {
                    proficiencies.push({name: item, level: 0})
                }

                // Weapon Proficiency
                proficiencies.push({name: "Weapon", level: 2})

                // Choose two skills if not multiclassing
                if (!multi_class) {
                    choices.proficiencies.push(super.skill_choice([
                        "Animal Handling", "Athletics", "Insight", "Investigation", "Nature", "Perception", "Stealth", "Survival"], 3))
                }

                // Choose a favored enemy
                choices.features.push({amount: 1, options: favored_enemy_options})

                break
            }
            case 5: {
                // Extra attack
                features.push("Extra Attack")

                break
            }
            case 6: {
                // Choose a favored enemy
                choices.features.push({amount: 1, options: favored_enemy_options})

                break
            }
            case 14: {
                // Choose a favored enemy
                choices.features.push({amount: 1, options: favored_enemy_options})

                break
            }
        }

        // Learn spells
        if (current_level >= 2) choices.spells.push({amount: 1, player_class: "Ranger", level: max_spell_slot_level})
        
        return {proficiencies, choices, features}
    }

    //---------------------------------------------------------------------------------------------------

}

// Add to PlayerClass
PlayerClass.add("Ranger", Ranger)