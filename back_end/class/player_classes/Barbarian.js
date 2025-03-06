"use strict";
try {

    var Barbarian = class {

        //=====================================================================================================
        // Parameters
        //=====================================================================================================

        static #description = ``
        static #healthPerLevel = 7

        static get description() { return this.#description }
        static get healthPerLevel () { return this.#healthPerLevel }

        //=====================================================================================================
        // Leveling
        //=====================================================================================================

        static level_up(humanoid, choices = {skills: []}) {
            const current_level = humanoid.classes.barbarian.level

            // Update Rage
            if (current_level == 1) humanoid.set_new_resource("Rage", 2, "long rest") //--> Creates resource
            if ([3, 6, 12, 17].includes(current_level)) { //--> Increases resource by 1 on levels specified
                humanoid.set_resource_max("Rage", humanoid.resources["Rage"].max + 1)
            }

            // Level based specific changes
            switch(current_level) {
                case 1: {
                    const multi_class = humanoid.level != 1

                    // Valid choices
                    choices.skills = choices.skills || []
                    const skill_options = ["Animal Handling", "Athletics", "Intimidation", "Nature", "Perception", "Survival"]

                    // Add starting proficiencies
                    const proficiencies = !multi_class
                        ? ["Light Armor", "Medium Armor", "Shield", "Martial Weapon", "Strength Saves", "Constitution Saves"]
                        : ["Shield", "Martial Weapon"] //--> Reduced list for multiclassing
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

                case 5: {
                    // Add extra attack feature
                    if (!humanoid.has_feature("Extra Attack")) { humanoid.add_feature("Extra Attack") }

                    break
                }

                case 20: {
                    // Increase STR and CON by 4 each
                    for (const score of ["strength", "constitution"]) {
                        humanoid.set_ability_score(score, humanoid.ability_scores[score] + 4)
                    }

                    break
                }
            }

            humanoid.save()
        }

        //=====================================================================================================

    }

} catch (e) {
    MapTool.chat.broadcast("" + e + "\n" + e.stack)
}
