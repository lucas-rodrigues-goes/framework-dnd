

var Wizard = class {

    //---------------------------------------------------------------------------------------------------
    // Parameters
    //---------------------------------------------------------------------------------------------------

    static get lore() { 
        return `
            Wizards are supreme magic-users, defined and united as a class by the spells they cast.
            Drawing on the subtle weave of magic that permeates the cosmos, wizards cast spells of
            explosive fire, arcing lightning, subtle deception, brute-force mind control, and much more.`
    }
    static get description() {
        return `
            Wizards are arcane casters who are capable of providing excelent utility and decent damage, 
            but at the cost of being very fragile. A wizard can learn spells as they come across scrolls 
            and spellbooks in their adventures, but can only memorize a portion of these every day.
            <br><br>
            Wizards rely on their Intelligence score for their spells. And usually have no martial training.`
    }
    static get healthPerLevel () { return 4 }
    static get spellcasting () {
        return {
            type: "full",
            memorization: true,
            known: true,
            ability: "intelligence"
        }
    }
    static get image () { return "asset://feb415509eb88654c71b1fa53d0879f1" }

    //---------------------------------------------------------------------------------------------------
    // Leveling
    //---------------------------------------------------------------------------------------------------

    static level_up(humanoid, choices = { proficiencies: [], features: [], spells: [], subclass: [] }) {
        const current_level = humanoid.classes.Wizard.level

        // Update Arcane Recovery
        if (current_level == 1) humanoid.set_new_resource("Arcane Recovery", 2, "long rest") //--> Creates resource
        else humanoid.set_resource_max("Arcane Recovery", current_level + 1)

        // Learn Spells
        for (const spell of choices.spells) {
            humanoid.learn_spell("Wizard", spell)
        }

        // Level based specific changes
        switch(current_level) {
            case 1: {
                const multi_class = humanoid.level != 1

                // Add starting proficiencies
                const starting_proficiencies = !multi_class
                    ? ["Mundane Weapon", "Wisdom Saves", "Intelligence Saves"]
                    : [] //--> Reduced list for multiclassing
                for (const proficiency of starting_proficiencies) {
                    humanoid.set_proficiency(proficiency, 0, true)
                }

                // Add skills from choice
                const skill_options = ["Arcana", "History", "Insight", "Investigation", "Medicine", "Religion"]
                const proficiencies = choices.proficiencies.filter(skill => skill_options.includes(skill))
                if (!multi_class) {
                    for (const proficiency of proficiencies) {
                        humanoid.set_proficiency(proficiency, 0, true)
                    }
                }

                break
            }
        }

        humanoid.save()
    }

    static level_up_info(humanoid) {
        const current_level = humanoid ? (humanoid.classes.Wizard?.level + 1) || 1 : 1
        const multi_class = humanoid ? humanoid.level != 0 : false
        const max_spell_slot_level = Math.ceil(current_level / 2)

        // Return structures
        const choices = { proficiencies: [], features: [], spells: [], subclass: [] }
        const proficiencies = []

        // Choices based on level
        switch (current_level) {
            case 1: {
                // Starting proficiencies
                if (!multi_class) for (const item of ["Mundane Weapon", "Wisdom Saves", "Intelligence Saves"]) {
                    proficiencies.push({name: item, level: 0})
                }

                // Choose two skills if not multiclassing
                if (!multi_class) choices.proficiencies.push({amount: 2, options: ["Arcana", "History", "Insight", "Investigation", "Medicine", "Religion"], level: 0})

                // Choose 3 new cantrips
                choices.spells.push({amount: 3, player_class: "Wizard", level: 0})

                // Choose 6 new spells
                choices.spells.push({amount: 6, player_class: "Wizard", level: max_spell_slot_level})

                break
            }
            case 2: {
                // Choose a subclass
                choices.subclass.push({options: ["School of Evocation"]})

                break
            }
            case 4: {
                // Choose 1 new cantrip
                choices.spells.push({amount: 1, player_class: "Wizard", level: 0})

                break
            }
            case 10: {
                // Choose 1 new cantrip
                choices.spells.push({amount: 1, player_class: "Wizard", level: 0})

                break
            }
        }

        // On every new level learn 2 spells
        if (current_level != 1) choices.spells.push({amount: 2, player_class: "Wizard", level: max_spell_slot_level})
        
        return {proficiencies: proficiencies, choices: choices}
    }

    //---------------------------------------------------------------------------------------------------

}