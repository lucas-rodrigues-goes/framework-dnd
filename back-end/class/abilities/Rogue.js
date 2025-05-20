

var Rogue = class extends Common {

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
        
        return {proficiencies: proficiencies, choices: choices}
    }

    //---------------------------------------------------------------------------------------------------
    // Actions
    //---------------------------------------------------------------------------------------------------

    static actions_list() {
        const creature = impersonated();
        const origin = "Rogue"
        const actions = {}
        const hasInitiative = Initiative.turn_order.includes(creature.id)
        const isPlaying = hasInitiative ? Initiative.current_character == creature.id : true

        // Sneak Attack
        const weapon = database.items.data[creature.equipment["primary main hand"]?.name]
        const dex_weapon = weapon ? weapon.properties.includes("Finesse") || weapon.properties.includes("Ammunition") : false
        if (creature.has_feature("Sneak Attack") && dex_weapon) actions["sneak_attack"] = {
            resources: [isPlaying ? "Attack Action" : "Reaction"],
            description: database.features.data["Sneak Attack"]?.description || "",
            image: "",
            origin: origin,
        }

        return actions
    }

    static sneak_attack() {
        const action_name = "sneak_attack"
        const slot = "primary main hand"
        const target = selected()

        // Requirements
        const { valid, creature, action_details } = this.check_action_requirements(action_name);
        if (!valid || !target) return;
        const hasAdvantage = this.attack_roll_advantage_modifiers({creature, target, view_only: true}) > 0
        if (!hasAdvantage) {
            console.log(`${creature.name_color} needs advantage on attack roll to use Sneak Attack.`)
            return
        }

        // Sneak Attack damage bonus
        const weapon = database.items.data[creature.equipment[slot]?.name]
        const rogue_level = creature ? creature.classes.Rogue?.level || 1 : 1
        const damage_bonuses = [{
            die_amount: Math.ceil(rogue_level / 2),
            die_size: (calculate_distance(creature, target) * 5) > 5 ? 4 : 8,
            damage_type: weapon.damage?.[0]?.damage_type || "piercing" 
        }]

        // Make attack
        const attack_result = this.make_attack({slot, creature, target, damage_bonuses: damage_bonuses})
        if (!attack_result.success) {
            console.log(attack_result.message, "all")
            return
        }

        // Consume resources
        this.use_resources(action_details.resources)
        Initiative.set_recovery(action_details.recovery, creature)

        // Logging
        console.log(attack_result.message, "all")
    }

    //---------------------------------------------------------------------------------------------------

}

