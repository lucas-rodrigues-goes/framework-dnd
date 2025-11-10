

var Sorcerer = class extends PlayerClass {

    //---------------------------------------------------------------------------------------------------
    // Parameters
    //---------------------------------------------------------------------------------------------------

    static get lore() { 
        return `
            Sorcerers carry a magical birthright conferred upon them by an exotic bloodline, 
            some otherworldly influence, or exposure to unknown cosmic forces. No one chooses 
            sorcery; the power chooses the sorcerer.`
    }
    static get description() {
        return `
            Sorcerers are arcane casters who excel at delivering strong, flexible spellcasting in combat,
            but at the cost of knowing very few spells. Unlike wizards, sorcerers cannot learn spells from
            scrolls or spellbooks. Instead, they permanently know a limited selection and must rely on those
            choices throughout their adventures. Their strength comes from Sorcery Points, which allow them
            to empower or modify their spells through Metamagic, and also manipulate their spell slots.
            <br><br>
            Sorcerers rely on their Constitution score for their spellcasting. And usually have no martial training.`
    }
    static get healthPerLevel () { return 4 }
    static get spellcasting () {
        return {
            type: "full",
            known: true,
            ability: "constitution"
        }
    }
    static get image () { return "asset://57460f85630f7d84602ff9128eccfef4" }

    //---------------------------------------------------------------------------------------------------
    // Leveling
    //---------------------------------------------------------------------------------------------------

    static level_up(humanoid, choices) {
        super.level_up(humanoid, choices, "Sorcerer")
        const current_level = humanoid.classes.Sorcerer.level

        // Update Sorcery Points
        if (current_level == 2) humanoid.set_new_resource("Sorcery Point", 2, "long rest") //--> Creates resource
        else if (current_level == 20) humanoid.set_new_resource("Sorcery Point", 20, "short rest")
        else humanoid.set_resource_max("Sorcery Point", current_level)

        // Level based specific changes
        switch(current_level) {
            case 1: {
                const multi_class = humanoid.level != 1

                // Add starting proficiencies
                const starting_proficiencies = !multi_class
                    ? ["Constitution Saves", "Charisma Saves"]
                    : [] //--> Reduced list for multiclassing
                for (const proficiency of starting_proficiencies) humanoid.set_proficiency(proficiency, 0, true)
                humanoid.set_proficiency("Weapon", 0, true)
                break
            }
        }

        humanoid.save()
    }

    static level_up_info(humanoid) {
        const current_level = humanoid ? (humanoid.classes.Sorcerer?.level + 1) || 1 : 1
        const multi_class = humanoid ? humanoid.level != 0 : false
        const max_spell_slot_level = Math.ceil(current_level / 2)

        // Return structures
        const choices = { proficiencies: [], features: [], spells: [], subclass: [] }
        const proficiencies = []
        const features = [...database.get_features_list({subtype: "Sorcerer", optional: "false"})].sort(
            (a, b) => database.features.data[a].level - database.features.data[b].level
        )

        const metamagic_options = database.get_features_list({}, null, "Metamagic: ")

        // Choices based on level
        switch (current_level) {
            case 1: {
                // Starting proficiencies
                if (!multi_class) for (const item of ["Constitution Saves", "Charisma Saves"]) {
                    proficiencies.push({name: item, level: 0})
                }

                // Weapon Proficiency
                proficiencies.push({name: "Weapon", level: 0})

                // Choose two skills if not multiclassing
                if (!multi_class) {
                    choices.proficiencies.push(super.skill_choice(["Arcana", "Deception", "Insight", "Intimidation", "Persuasion", "Religion"], 2))
                }

                // Choose 4 new cantrips
                choices.spells.push({amount: 4, player_class: "Sorcerer", level: 0})

                // Choose 6 new spells
                choices.spells.push({amount: 2, player_class: "Sorcerer", level: max_spell_slot_level})

                break
            }
            case 2: {
                // Choose a subclass
                choices.subclass.push({options: ["School of Evocation"]})

                // Choose 3 metamagic options
                choices.features.push({amount: 3, options: metamagic_options})

                break
            }
            case 4: {
                // Choose 1 new cantrip
                choices.spells.push({amount: 1, player_class: "Sorcerer", level: 0})

                break
            }
            case 10: {
                // Choose 1 new cantrip
                choices.spells.push({amount: 1, player_class: "Sorcerer", level: 0})

                // Choose 1 metamagic option
                choices.features.push({amount: 1, options: metamagic_options})

                break
            }
            case 17: {
                // Choose 1 metamagic option
                choices.features.push({amount: 1, options: metamagic_options})

                break
            }
        }

        // On every new level learn 1 spells
        if (current_level != 1) choices.spells.push({amount: 1, player_class: "Sorcerer", level: max_spell_slot_level})
        
        return {proficiencies, choices, features}
    }

    //---------------------------------------------------------------------------------------------------

}

// Add to PlayerClass
PlayerClass.add("Sorcerer", Sorcerer)