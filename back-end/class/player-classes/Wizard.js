"use strict";
try {

    var Wizard = class {

        //=====================================================================================================
        // Parameters
        //=====================================================================================================

        static get description() { 
            return `
                Wizards are supreme magic-users, defined and united as a class by the spells they cast. 
                Drawing on the subtle weave of magic that permeates the cosmos, wizards cast spells of 
                explosive fire, arcing lightning, subtle deception, brute-force mind control, and much more.
            ` 
        }
        static get healthPerLevel () { return 4 }
        static get image () { return "asset://feb415509eb88654c71b1fa53d0879f1" }

        //=====================================================================================================
        // Leveling
        //=====================================================================================================

        static level_up(humanoid, choices = {skills: []}) {
            const current_level = humanoid.classes.Wizard.level

            // Update Arcane Recovery
            if (current_level == 1) humanoid.set_new_resource("Arcane Recovery", 1, "long rest") //--> Creates resource
            if ((current_level % 2) == 1 && current_level != 1) { //--> Increases resource by 1 on levels specified
                humanoid.set_resource_max("Arcane Recovery", humanoid.resources["Arcane Recovery"].max + 1)
            }

            // Level based specific changes
            switch(current_level) {
                case 1: {
                    const multi_class = humanoid.level != 1

                    // Valid choices
                    choices.skills = choices.skills || []
                    const skill_options = ["Arcana", "History", "Insight", "Investigation", "Medicine", "Religion"]

                    // Add starting proficiencies
                    const proficiencies = !multi_class
                        ? ["Mundane Weapon", "Wisdom Saves", "Intelligence Saves"]
                        : [] //--> Reduced list for multiclassing
                    for (const proficiency of proficiencies) {
                        humanoid.set_proficiency(proficiency, 0, true)
                    }

                    // Add skills
                    const skills = choices.skills.filter(skill => skill_options.includes(skill))
                    if (!multi_class) {
                        for (const skill of skills) {
                            humanoid.set_proficiency(skill, 0, true)
                        }
                    }

                    break
                }
            }

            humanoid.save()
        }

        static level_up_choices(humanoid) {
            const current_level = humanoid.classes.Wizard.level + 1 || 1
            const multi_class = humanoid.level != 0
            const max_spell_slot_level = Math.ceiling(current_level / 2)

            // Choices structure
            const choices = { skills: [], features: [], spells: [], subclass: [] }

            // On every new level learn 2 spells
            choices.spells.push({amount: 2, player_class: "Wizard", level: max_spell_slot_level})

            // Choices based on level
            switch (current_level) {
                case 1: {
                    // Choose two skills if not multiclassing
                    if (!multi_class) choices.skills.push({amount: 2, options: ["Arcana", "History", "Insight", "Investigation", "Medicine", "Religion"]})

                    // Choose three new spells
                    choices.spells.push({amount: 3, player_class: "Wizard", level: 0})

                    break
                }
                case 2: {
                    // Choose a subclass
                    choices.subclass.push({options: ["School of Evocation"]})

                    break
                }
            }
            
            return choices
        }

        //=====================================================================================================

    }

} catch (e) {
    MapTool.chat.broadcast("" + e + "\n" + e.stack)
}
