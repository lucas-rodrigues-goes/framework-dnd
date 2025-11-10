

var Barbarian = class extends PlayerClass {

    //---------------------------------------------------------------------------------------------------
    // Class Information
    //---------------------------------------------------------------------------------------------------

    static get lore() {
        return `
            Barbarians are primal warriors, defined by their fierce rage and unyielding endurance. 
            Channeling the untamed fury of the wilderness or their ancestral spirits, barbarians 
            unleash devastating blows, shrug off mortal wounds, and dominate the battlefield through 
            raw physical power and indomitable will.`
    }
    static get description() {
        return `
            Barbarians are brutal combatants who excel in close-quarters combat, trading defense for 
            overwhelming offense. While raging, they deal massive damage and resist harm, but their 
            power wanes as their fury fades. Barbarians grow stronger by embracing their primal instincts, 
            gaining supernatural resilience and ferocity as they master their rage.
            <br><br>
            Barbarians rely on Strength for attacks and Constitution for survival. They typically abstain
            from heavy armor, trusting their toughened bodies and battle instincts to protect them.`
    }
    static get healthPerLevel () { return 7 }
    static get image () { return "asset://d963c8b40a27e349e6239dcc3a1cbce2" }

    //---------------------------------------------------------------------------------------------------
    // Leveling
    //---------------------------------------------------------------------------------------------------

    static level_up(humanoid, choices) {
        super.level_up(humanoid, choices, "Barbarian")
        const current_level = humanoid.classes.Barbarian.level

        // Update Rage
        if (current_level == 1) humanoid.set_new_resource("Rage", 2, "long rest") //--> Creates resource
        if ([3, 6, 12, 17].includes(current_level)) { //--> Increases resource by 1 on levels specified
            humanoid.set_resource_max("Rage", humanoid.resources["Rage"].max + 1)
        }

        // Level based specific changes
        switch(current_level) {
            case 1: {
                const multi_class = humanoid.level != 1           

                // Add starting proficiencies
                const starting_proficiencies = !multi_class
                    ? ["Light Armor", "Medium Armor", "Shield", "Martial Weapon", "Strength Saves", "Constitution Saves"]
                    : ["Shield", "Martial Weapon"] //--> Reduced list for multiclassing
                for (const proficiency of starting_proficiencies) humanoid.set_proficiency(proficiency, 0, true)
                humanoid.set_proficiency("Weapon", 2, true)
                break
            }

            case 5: {
                // Add extra attack feature
                if (!humanoid.has_feature("Extra Attack")) { humanoid.add_feature("Extra Attack") }

                break
            }
        }

        humanoid.save()
    }

    static level_up_info(humanoid) {
        const current_level = humanoid ? (humanoid.classes.Barbarian?.level + 1) || 1 : 1
        const multi_class = humanoid ? humanoid.level != 0 : false
        const current_proficiencies = humanoid ? humanoid.proficiencies : {}

        // Return structures
        const choices = { proficiencies: [], features: [], spells: [], subclass: [] }
        const proficiencies = []
        const features = ["Extra Attack", ...database.get_features_list({subtype: "Barbarian"})].sort(
            (a, b) => database.features.data[a].level - database.features.data[b].level
        )

        // Combat Proficiencies
        if ([1,5,9,13,17].includes(current_level)) choices.proficiencies.push(
            super.combat_proficiency_choice(current_level, current_proficiencies)
        )

        // Choices based on level
        switch (current_level) {
            case 1: {
                // Starting proficiencies
                const starting_proficiencies = !multi_class
                    ? ["Light Armor", "Medium Armor", "Shield", "Strength Saves", "Constitution Saves"]
                    : ["Shield"] //--> Reduced list for multiclassing
                for (const item of starting_proficiencies) {
                    proficiencies.push({name: item, level: 0})
                }

                // Weapon Mastery
                proficiencies.push({name: "Weapon", level: 2})

                // Choose two skills if not multiclassing
                if (!multi_class) {
                    choices.proficiencies.push(super.skill_choice(["Animal Handling", "Athletics", "Intimidation", "Nature", "Perception", "Survival"], 2))
                }
                break
            }
        }
        
        return {proficiencies, choices, features}
    }

    //---------------------------------------------------------------------------------------------------

}

// Add to PlayerClass
PlayerClass.add("Barbarian", Barbarian)