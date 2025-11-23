

var PlayerClass = class {

    //---------------------------------------------------------------------------------------------------
    // List of Classes
    //---------------------------------------------------------------------------------------------------

    static #classes = {}
    static get list () {
        return Object.keys(this.#classes)
    }
    static get classes () {
        return this.#classes
    }
    static add (name, cls) {
        this.#classes[name] = cls
    }

    //---------------------------------------------------------------------------------------------------
    // Helpers
    //---------------------------------------------------------------------------------------------------

    static combat_proficiency_choice (current_level, current_proficiencies) {
        const options = []
        const proficiency_data = database.proficiencies.data;
        const combat_proficiencies = Object.keys(proficiency_data).filter((name) => proficiency_data[name].type.toLowerCase() == "combat");

        let max_level = 0; {
            if (current_level >= 15) max_level = 3
            else if (current_level >= 11) max_level = 2
            else if (current_level >= 7) max_level = 1
        }

        for (const prof of combat_proficiencies) {
            if (prof == "Weapon") continue

            const new_prof_level = Number(current_proficiencies[prof] || -1) + 1
            if (new_prof_level == 0 && (prof.includes("Armor") || prof == "Shield")) continue
            if (proficiency_data[prof].description[new_prof_level] == "") continue
            if (new_prof_level <= max_level) options.push({name: prof, level: new_prof_level})
        }

        return {title: "Choose a new combat proficiency", amount: 1, options: options}
    }

    static skill_choice (skills_list, amount, expertise = false) {
        let title; {
            title = amount == 1 ? "Choose a new skill" : `Choose ${amount} new skills`
            if (expertise) title = amount == 1 ? "Choose a new skill expertise" : `Choose ${amount} new skill expertises`
        }
        const options = []
        for (const prof of skills_list) options.push({name: prof, level: expertise ? 1 : 0})
        return {title, amount, options: options}
    }

    //---------------------------------------------------------------------------------------------------
    // Leveling
    //---------------------------------------------------------------------------------------------------

    static level_up(player, choices = { proficiencies: [], features: [], spells: [], subclass: [] }, player_class="") {
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

            player.set_proficiency(proficiency, level, true)
        }

        // Add features from choices
        for (const feature of choices.features) {
            player.add_feature(feature)
        }

        // Learn Spells
        for (const spell of choices.spells) {
            player.learn_spell(player_class, spell)
        }
    }

    //---------------------------------------------------------------------------------------------------

}