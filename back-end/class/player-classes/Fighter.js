

var Fighter = class extends PlayerClass {

    //---------------------------------------------------------------------------------------------------
    // Class Information
    //---------------------------------------------------------------------------------------------------

    static get lore() { 
        return `
            Fighters are disciplined combatants, defined by their mastery of arms and unwavering resolve.
            Through rigorous training and battlefield experience, fighters hone their bodies and minds 
            into lethal weapons, capable of adapting to any threat. Whether standing firm against 
            overwhelming odds or striking with unmatched precision, fighters dominate the field through 
            sheer skill, tactical prowess, and relentless determination.`
    }
    static get description() {
        return `
            Fighters are versatile warriors who excel in mastering weapons and combat techniques. 
            Whether wielding a greatsword or firing a longbow, they adapt to any battlefield with 
            skill and precision. Through relentless training and tactical discipline, Fighters 
            become deadly combatants capable of holding the line or leading the charge.
            <br><br>
            Fighters rely on Strength or Dexterity for their attacks, depending on their chosen 
            fighting style, and Constitution for durability. They are proficient with all armor and 
            weapons, allowing them to tailor their approach to any encounter, from brute-force 
            assaults to carefully calculated strikes.`
    }
    static get healthPerLevel () { return 6 }
    static get image () { return "asset://0775774cade2e68e4a9c4bd5c83ea282" }

    //---------------------------------------------------------------------------------------------------
    // Leveling
    //---------------------------------------------------------------------------------------------------

    static level_up(humanoid, choices) {
        super.level_up(humanoid, choices, "Fighter")
        const current_level = humanoid.classes.Fighter.level

        // Update Action Surge
        if (current_level == 2) humanoid.set_new_resource("Action Surge", 1, "short rest") //--> Creates resource
        if ([17].includes(current_level)) humanoid.set_resource_max("Action Surge", humanoid.resources["Action Surge"].max + 1)

        // Update Indomitable
        if (current_level == 9) humanoid.set_new_resource("Indomitable", 1, "long rest") //--> Creates resource
        if ([13, 17].includes(current_level)) humanoid.set_resource_max("Indomitable", humanoid.resources["Indomitable"].max + 1)

        // Level based specific changes
        switch(current_level) {
            // Level 1
            case 1: {
                // Verify if is multiclass
                const multi_class = humanoid.level != 1
                
                // Add Second Wind
                humanoid.set_new_resource("Second Wind", 1, "short rest")

                // Add starting proficiencies
                const starting_proficiencies = !multi_class
                    ? ["Light Armor", "Medium Armor", "Heavy Armor", "Shield", "Strength Saves", "Constitution Saves"]
                    : ["Light Armor", "Medium Armor", "Shield"] //--> Reduced list for multiclassing
                for (const proficiency of starting_proficiencies) humanoid.set_proficiency(proficiency, 0, true)
                humanoid.set_proficiency("Weapon", 2, true)
                break
            }

            // Level 5
            case 5: {
                // Add extra attack feature
                if (!humanoid.has_feature("Extra Attack")) { humanoid.add_feature("Extra Attack") }
                break
            }
        }

        humanoid.save()
    }

    static level_up_info(humanoid) {
        const current_level = humanoid ? (humanoid.classes.Fighter?.level + 1) || 1 : 1
        const multi_class = humanoid ? humanoid.level != 0 : false
        const current_proficiencies = humanoid ? humanoid.proficiencies : {}

        // Return structures
        const choices = { proficiencies: [], features: [], spells: [], subclass: [] }
        const proficiencies = []
        const features = ["Extra Attack", ...database.get_features_list({subtype: "Fighter"})].sort(
            (a, b) => database.features.data[a].level - database.features.data[b].level
        )

        // Combat Proficiencies
        if ([1,3,5,7,9,11,13,15,17,19].includes(current_level)) choices.proficiencies.push(
            super.combat_proficiency_choice(current_level, current_proficiencies)
        )

        // Based on level
        switch (current_level) {
            // Level 1
            case 1: {
                // Starting proficiencies
                const starting_proficiencies = !multi_class
                    ? ["Light Armor", "Medium Armor", "Heavy Armor", "Shield", "Strength Saves", "Constitution Saves"]
                    : ["Light Armor", "Medium Armor", "Shield"] //--> Reduced list for multiclassing
                for (const item of starting_proficiencies) {
                    proficiencies.push({name: item, level: 0})
                }

                // Weapon Mastery
                proficiencies.push({name: "Weapon", level: 2})

                // Choose two skills if not multiclassing
                if (!multi_class) {
                    choices.proficiencies.push(super.skill_choice(["Acrobatics", "Animal Handling", "Athletics", "History", "Insight", "Intimidation", "Perception", "Survival"], 2))
                }
                break
            }
        }
        
        return {proficiencies, choices, features}
    }

    //---------------------------------------------------------------------------------------------------

}