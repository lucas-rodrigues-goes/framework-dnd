

var Cleric = class {

    //---------------------------------------------------------------------------------------------------
    // Parameters
    //---------------------------------------------------------------------------------------------------

    static get lore() { 
        return `
            Clerics are intermediaries between the mortal world and the distant planes of the gods. As 
            varied as the gods they serve, clerics strive to embody the handiwork of their deities. No 
            ordinary priest, a cleric is imbued with divine magic.`
    }
    static get description() {
        return `
            Clerics are divine agents of their deities, wielding holy magic to heal, protect, and smite foes. 
            They are versatile spellcasters, capable of bolstering allies, turning undead, and calling upon 
            their god's wrath. Unlike other casters, clerics prepare spells each day from their entire class list, 
            making them adaptable to any challenge.
            <br><br>
            Clerics rely on their Wisdom score for spellcasting and often wear sturdy armor, allowing them to 
            stand firm in battle while supporting their allies with divine power. Their strength comes not just 
            from their spells, but from their unshakable faith.`
    }
    static get healthPerLevel () { return 5 }
    static get spellcasting () {
        return {
            type: "full",
            memorization: true,
            known: false,
            ability: "wisdom"
        }
    }
    static get image () { return "asset://039a32067cd1c26bf1e18c423a218f5c" }

    //---------------------------------------------------------------------------------------------------
    // Leveling
    //---------------------------------------------------------------------------------------------------

    static level_up(humanoid, choices = { proficiencies: [], features: [], spells: [], subclass: [] }) {
        const current_level = humanoid.classes.Cleric.level

        // Update Channel Divinity
        if (current_level == 1) humanoid.set_new_resource("Channel Divinity", 1, "short rest") //--> Creates resource
        else if ([6, 18].includes(current_level)) humanoid.set_resource_max("Channel Divinity", humanoid.resources["Channel Divinity"].max + 1)

        // Learn Spells
        for (const spell of choices.spells) {
            humanoid.learn_spell("Cleric", spell)
        }

        // Level based specific changes
        switch(current_level) {
            case 1: {
                const multi_class = humanoid.level != 1

                // Add starting proficiencies
                const starting_proficiencies = !multi_class
                    ? ["Simple Weapon", "Light Armor", "Medium Armor", "Shield", "Wisdom Saves", "Charisma Saves"]
                    : [] //--> Reduced list for multiclassing
                for (const proficiency of starting_proficiencies) {
                    humanoid.set_proficiency(proficiency, 0, true)
                }

                // Add skills from choice
                const skill_options = ["History", "Insight", "Medicine", "Persuasion", "Religion"]
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
        const current_level = humanoid ? (humanoid.classes.Cleric?.level + 1) || 1 : 1
        const multi_class = humanoid ? humanoid.level != 0 : false

        // Return structures
        const choices = { proficiencies: [], features: [], spells: [], subclass: [] }
        const proficiencies = []
        const features = [...database.get_features_list({subtype: "Cleric"})].sort(
            (a, b) => database.features.data[a].level - database.features.data[b].level
        )

        // Choices based on level
        switch (current_level) {
            case 1: {
                // Starting proficiencies
                const starting_proficiencies = !multi_class
                    ? ["Light Armor", "Medium Armor", "Shield", "Simple Weapon", "Wisdom Saves", "Charisma Saves"]
                    : [] //--> Reduced list for multiclassing
                for (const item of starting_proficiencies) {
                    proficiencies.push({name: item, level: 0})
                }

                // Choose two skills if not multiclassing
                if (!multi_class) choices.proficiencies.push({amount: 2, options: [
                    "History", "Insight", "Medicine", "Persuasion", "Religion"
                ], level: 0})

                // Choose 3 new cantrips
                choices.spells.push({amount: 3, player_class: "Cleric", level: 0})

                break
            }
        }
        
        return {proficiencies, choices, features}
    }

    //---------------------------------------------------------------------------------------------------

}