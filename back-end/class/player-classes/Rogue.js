

var Rogue = class {

    //---------------------------------------------------------------------------------------------------
    // Class Information
    //---------------------------------------------------------------------------------------------------

    static get lore() { 
        return `
            Rogues are elusive combatants, defined by their agility, precision, and cunning.
            Mastering the arts of stealth, deception, and tactical strikes, rogues slip through shadows,
            exploit every weakness, and strike with deadly accuracy. They dominate the battlefield not
            through brute force, but through calculated moves, quick reflexes, and razor-sharp intellect.`
    }
    static get description() {
        return `
            Rogues are cunning skirmishers who excel in precision strikes and stealth over brute strength. 
            Instead of charging headlong into battle, they rely on agility, deception, and expert timing to 
            outmaneuver their foes. With a keen eye for opportunity, rogues exploit vulnerabilities to deliver 
            devastating sneak attacks and escape before their enemies can retaliate.
            <br><br>
            Rogues thrive on Dexterity for both offense and defense, using swift movements and quick reflexes to 
            survive. They often avoid heavy armor, preferring speed, subtlety, and shadows to stay one step ahead 
            of danger.`
    }
    static get healthPerLevel () { return 5 }
    static get image () { return "asset://e105c25e25210a5e107d49ef0af2bfb5" }

    //---------------------------------------------------------------------------------------------------
    // Leveling
    //---------------------------------------------------------------------------------------------------

    static level_up(humanoid, choices = { proficiencies: [], features: [], spells: [], subclass: [] }) {
        const current_level = humanoid.classes.Rogue.level

        // Level based specific changes
        switch(current_level) {
            case 1: {
                const multi_class = humanoid.level != 1           

                // Add starting proficiencies
                const starting_proficiencies = !multi_class
                    ? ["Light Armor", "Martial Weapon", "Dexterity Saves", "Intelligence Saves"]
                    : ["Light Armor"] //--> Reduced list for multiclassing
                for (const proficiency of starting_proficiencies) {
                    humanoid.set_proficiency(proficiency, 0, true)
                }

                // Add skills from choice
                const skill_options = ["Acrobatics", "Athletics", "Deception", "Insight", "Intimidation", "Investigation", "Perception", "Performance", "Persuasion", "Sleight of Hand", "Stealth"]
                const proficiencies = choices.proficiencies.filter(skill => skill_options.includes(skill))
                for (const proficiency of proficiencies) {
                    humanoid.set_proficiency(proficiency, 0, true)
                }

                break
            }
        }

        humanoid.save()
    }

    static level_up_info(humanoid) {
        const current_level = humanoid ? (humanoid.classes.Rogue?.level + 1) || 1 : 1
        const multi_class = humanoid ? humanoid.level != 0 : false

        // Return structures
        const choices = { proficiencies: [], features: [], spells: [], subclass: [] }
        const proficiencies = []
        const features = [...database.get_features_list({subtype: "Rogue"})].sort(
            (a, b) => database.features.data[a].level - database.features.data[b].level
        )

        // Choices based on level
        switch (current_level) {
            case 1: {
                // Starting proficiencies
                const starting_proficiencies = !multi_class
                    ? ["Light Armor", "Martial Weapon", "Dexterity Saves", "Intelligence Saves"]
                    : ["Light Armor"] //--> Reduced list for multiclassing
                for (const item of starting_proficiencies) {
                    proficiencies.push({name: item, level: 0})
                }

                // Choose two skills if not multiclassing
                choices.proficiencies.push({
                    amount: multi_class ? 1 : 4, 
                    options: ["Acrobatics", "Athletics", "Deception", "Insight", "Intimidation", "Investigation", "Perception", "Performance", "Persuasion", "Sleight of Hand", "Stealth"], 
                    level: 0
                })

                break
            }
        }
        
        return {proficiencies, choices, features}
    }

    //---------------------------------------------------------------------------------------------------

}

