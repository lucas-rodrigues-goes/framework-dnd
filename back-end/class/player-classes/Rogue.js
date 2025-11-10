

var Rogue = class extends PlayerClass {

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

    static level_up(humanoid, choices) {
        super.level_up(humanoid, choices, "Rogue")
        const current_level = humanoid.classes.Rogue.level

        // Update Sneak Attack
        if (current_level == 1) humanoid.set_new_resource("Sneak Attack", 1, "turn start") //--> Creates resource

        // Level based specific changes
        switch(current_level) {
            case 1: {
                const multi_class = humanoid.level != 1           

                // Add starting proficiencies
                const starting_proficiencies = !multi_class
                    ? ["Light Armor", "Martial Weapon", "Dexterity Saves", "Intelligence Saves"]
                    : ["Light Armor"] //--> Reduced list for multiclassing
                for (const proficiency of starting_proficiencies) humanoid.set_proficiency(proficiency, 0, true)
                humanoid.set_proficiency("Weapon", 2, true)
                break
            }
        }

        humanoid.save()
    }

    static level_up_info(humanoid) {
        const current_level = humanoid ? (humanoid.classes.Rogue?.level + 1) || 1 : 1
        const multi_class = humanoid ? humanoid.level != 0 : false
        const current_proficiencies = humanoid ? humanoid.proficiencies : {}

        // Return structures
        const choices = { proficiencies: [], features: [], spells: [], subclass: [] }
        const proficiencies = []
        const features = [...database.get_features_list({subtype: "Rogue"})].sort(
            (a, b) => database.features.data[a].level - database.features.data[b].level
        )

        // Combat Proficiencies
        if ([1,5,9,13,17].includes(current_level)) choices.proficiencies.push(
            super.combat_proficiency_choice(current_level, current_proficiencies)
        )

        // Choices based on level
        switch (current_level) {
            // Level 1
            case 1: {
                // Starting proficiencies
                const starting_proficiencies = !multi_class
                    ? ["Light Armor", "Dexterity Saves", "Intelligence Saves"]
                    : ["Light Armor"] //--> Reduced list for multiclassing
                for (const item of starting_proficiencies) {
                    proficiencies.push({name: item, level: 0})
                }

                // Weapon Mastery
                proficiencies.push({name: "Weapon", level: 2})

                // Choose 1 - 4 skills
                const options = ["Acrobatics", "Athletics", "Deception", "Insight", "Intimidation", "Investigation", "Perception", "Performance", "Persuasion", "Sleight of Hand", "Stealth"]
                const amount = multi_class ? 1 : 4
                choices.proficiencies.push(super.skill_choice(options, amount))

                break
            }
            // Level 2
            case 2 : {
                // Choose 2 skill expertises
                const options = Object.keys(database.proficiencies.data).filter((a) => {
                    if (database.proficiencies.data[a].type != "skill") return false
                    if (!Object.keys(current_proficiencies).includes(a)) return false
                    if (current_proficiencies[a] > 0) return false
                    return true
                })
                choices.proficiencies.push(super.skill_choice(options, 2, true))

                break
            }
        }
        
        return {proficiencies, choices, features}
    }

    //---------------------------------------------------------------------------------------------------

}

// Add to PlayerClass
PlayerClass.add("Rogue", Rogue)