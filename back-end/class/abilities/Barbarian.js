

var Barbarian = class extends Common {

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

    static level_up(humanoid, choices = { proficiencies: [], features: [], spells: [], subclass: [] }) {
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
                for (const proficiency of starting_proficiencies) {
                    humanoid.set_proficiency(proficiency, 0, true)
                }

                // Add skills from choice
                const skill_options = ["Animal Handling", "Athletics", "Intimidation", "Nature", "Perception", "Survival"]
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

    static level_up_info(humanoid) {
        const current_level = humanoid ? (humanoid.classes.Barbarian?.level + 1) || 1 : 1
        const multi_class = humanoid ? humanoid.level != 0 : false

        // Return structures
        const choices = { proficiencies: [], features: [], spells: [], subclass: [] }
        const proficiencies = []

        // Choices based on level
        switch (current_level) {
            case 1: {
                // Starting proficiencies
                const starting_proficiencies = !multi_class
                    ? ["Light Armor", "Medium Armor", "Shield", "Martial Weapon", "Strength Saves", "Constitution Saves"]
                    : ["Shield", "Martial Weapon"] //--> Reduced list for multiclassing
                for (const item of starting_proficiencies) {
                    proficiencies.push({name: item, level: 0})
                }

                // Choose two skills if not multiclassing
                if (!multi_class) choices.proficiencies.push({amount: 2, options: ["Animal Handling", "Athletics", "Intimidation", "Nature", "Perception", "Survival"], level: 0})

                break
            }
            case 3: {
                // Choose a subclass
                choices.subclass.push({options: ["Berserker"]})

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
        const origin = "Barbarian"
        const actions = {}

        // Rage
        if (character.has_feature("Rage")) actions["rage"] = {
            resources: ["Bonus Action", "Rage"],
            description: database.features.data["Rage"].description,
            image: database.conditions.data["Rage"].image,
            origin: origin,
        }

        // Reckless Attack
        if (character.has_feature("Reckless Attack")) actions["reckless_attack"] = {
            resources: [],
            description: database.features.data["Reckless Attack"].description,
            image: database.conditions.data["Reckless Attack"]?.image || "",
            origin: origin,
        }

        return actions
    }

    static rage() {
        // Requirements
        const { valid, creature, action_details } = this.check_action_requirements("rage", false);
        if (!valid) return;

        // Receive condition
        creature.set_condition("Rage")

        // Consume resources
        this.use_resources(action_details.resources)
        Initiative.set_recovery(action_details.recovery, creature)

        // Logging
        public_log(`${creature.name_color} is enraged!`)
    }

    static reckless_attack() {
        // Requirements
        const { valid, creature, action_details } = this.check_action_requirements("reckless_attack", false);
        if (!valid) return;

        // Receive condition
        creature.set_condition("Reckless Attack", 1)

        // Consume resources
        this.use_resources(action_details.resources)
        Initiative.set_recovery(action_details.recovery, creature)

        // Logging
        public_log(`${creature.name_color} throws aside all concern for defense and attacks recklessly!`)
    }

    //---------------------------------------------------------------------------------------------------

}

