

var PlayerClass = class {

    //---------------------------------------------------------------------------------------------------
    // Helpers
    //---------------------------------------------------------------------------------------------------

    static combat_proficiency_choice (current_level, current_proficiencies) {
        const options = []
        const proficiency_data = database.proficiencies.data
        const combat_proficiencies = Object.keys(proficiency_data).filter((name) => name != "Weapon" && proficiency_data[name].type.toLowerCase() == "combat")

        let max_level = 1; {
            if (current_level >= 11) max_level = 3
            else if (current_level >= 5) max_level = 2
        }

        for (const prof of combat_proficiencies) {
            const new_prof_level = Number(current_proficiencies[prof] || 0) + 1
            if (new_prof_level <= max_level && proficiency_data[prof].description[new_prof_level] != "") options.push({name: prof, level: new_prof_level})
        }

        return {title: "Choose a new combat proficiency", amount: 1, options: options}
    }

    static skill_choice (skills_list, amount) {
        const title = amount == 1 ? "Choose a new skill" : `Choose ${amount} new skills`
        const options = []
        for (const prof of skills_list) options.push({name: prof, level: 0})
        return {title, amount, options: options}
    }

    //---------------------------------------------------------------------------------------------------
    // Leveling
    //---------------------------------------------------------------------------------------------------

    static level_up(humanoid, choices = { proficiencies: [], features: [], spells: [], subclass: [] }, player_class="") {
        // Add skills from choices
        for (let proficiency of choices.proficiencies) {
            let level = 0; {
                if (proficiency.includes("Grandmastery")) level = 3
                else if (proficiency.includes("Mastery")) level = 2
                else if (proficiency.includes("Expertise")) level = 1

                if (level != 0) {
                    proficiency = proficiency.split(" ").slice(0, -1).join(" ");
                }
            }

            humanoid.set_proficiency(proficiency, level, true)
        }

        // Learn Spells
        for (const spell of choices.spells) {
            humanoid.learn_spell(player_class, spell)
        }
    }

    //---------------------------------------------------------------------------------------------------

}