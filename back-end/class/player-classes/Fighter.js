

var Fighter = class extends Common {

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

    static level_up(humanoid, choices = { proficiencies: [], features: [], spells: [], subclass: [] }) {
        const current_level = humanoid.classes.Fighter.level

        // Update Action Surge
        if (current_level == 2) humanoid.set_new_resource("Action Surge", 1, "short rest") //--> Creates resource
        if ([17].includes(current_level)) { //--> Increases resource by 1 on levels specified
            humanoid.set_resource_max("Action Surge", humanoid.resources["Action Surge"].max + 1)
        }

        // Update Indomitable
        if (current_level == 9) humanoid.set_new_resource("Indomitable", 1, "long rest") //--> Creates resource
        if ([13, 17].includes(current_level)) { //--> Increases resource by 1 on levels specified
            humanoid.set_resource_max("Indomitable", humanoid.resources["Indomitable"].max + 1)
        }

        // Level based specific changes
        switch(current_level) {
            case 1: {
                const multi_class = humanoid.level != 1
                
                // Add Second Wind
                humanoid.set_new_resource("Second Wind", 1, "short rest")

                // Add starting proficiencies
                const starting_proficiencies = !multi_class
                    ? ["Light Armor", "Medium Armor", "Heavy Armor", "Shield", "Martial Weapon", "Strength Saves", "Constitution Saves"]
                    : ["Light Armor", "Medium Armor", "Shield", "Martial Weapon"] //--> Reduced list for multiclassing
                for (const proficiency of starting_proficiencies) {
                    humanoid.set_proficiency(proficiency, 0, true)
                }

                // Add skills from choice
                const skill_options = [
                    "Acrobatics", "Animal Handling", "Athletics", "History", "Insight", "Intimidation", "Perception", "Survival"
                ]
                const proficiencies = choices.proficiencies.filter(skill => skill_options.includes(skill))
                if (!multi_class) {
                    for (const proficiency of proficiencies) {
                        humanoid.set_proficiency(proficiency, 0, true)
                    }
                }

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
        const current_level = humanoid ? (humanoid.classes.Fighter?.level + 1) || 1 : 1
        const multi_class = humanoid ? humanoid.level != 0 : false

        // Return structures
        const choices = { proficiencies: [], features: [], spells: [], subclass: [] }
        const proficiencies = []

        // Choices based on level
        switch (current_level) {
            case 1: {
                // Starting proficiencies
                const starting_proficiencies = !multi_class
                    ? ["Light Armor", "Medium Armor", "Heavy Armor", "Shield", "Martial Weapon", "Strength Saves", "Constitution Saves"]
                    : ["Light Armor", "Medium Armor", "Shield", "Martial Weapon"] //--> Reduced list for multiclassing
                for (const item of starting_proficiencies) {
                    proficiencies.push({name: item, level: 0})
                }

                // Choose two skills if not multiclassing
                if (!multi_class) choices.proficiencies.push({amount: 2, options: [
                    "Acrobatics", "Animal Handling", "Athletics", "History", "Insight", "Intimidation", "Perception", "Survival"
                ], level: 0})

                break
            }
        }
        
        return {proficiencies: proficiencies, choices: choices}
    }

    //---------------------------------------------------------------------------------------------------
    // Actions
    //---------------------------------------------------------------------------------------------------

    static actions_list() {
        const character = impersonated();
        const origin = "Fighter"
        const actions = {}

        // Rage
        if (character.has_feature("Second Wind")) actions["second_wind"] = {
            resources: ["Bonus Action", "Second Wind"],
            description: database.features.data["Second Wind"].description,
            image: database.resources.data["Second Wind"].image,
            origin: origin,
        }

        // Action Surge
        if (character.has_feature("Action Surge")) actions["action_surge"] = {
            resources: ["Action Surge"],
            description: database.features.data["Action Surge"].description,
            image: database.resources.data["Action Surge"].image,
            origin: origin,
        }

        return actions
    }

    static second_wind() {
        const action_name = "second_wind"

        // Requirements
        const { valid, creature, action_details } = this.check_action_requirements(action_name, false);
        if (!valid) return;

        // Receive Healing
        const healing = roll(10) + (creature.classes.Fighter?.level || 1)
        creature.receive_healing(healing)

        // Consume resources
        this.use_resources(action_details.resources)
        Initiative.set_recovery(action_details.recovery, creature)

        // Logging
        public_log(`${creature.name_color} has utilized second wind, regaining ${healing} hit points`)
    }

    static action_surge() {
        const action_name = "action_surge"

        // Requirements
        const { valid, creature, action_details } = this.check_action_requirements(action_name, false);
        if (!valid) return;

        // Gain extra action
        creature.set_resource_max("Action", creature.resources["Action"].max + 1)
        creature.set_resource_value("Action", creature.resources["Action"].value + 1)

        // Consume resources
        this.use_resources(action_details.resources)
        Initiative.set_recovery(action_details.recovery, creature)

        // Logging
        public_log(`${creature.name_color} has utilized action surge, gaining an extra action.`)
    }

    //---------------------------------------------------------------------------------------------------

}