

var Common = class {

    //---------------------------------------------------------------------------------------------------
    // Resource Helpers
    //---------------------------------------------------------------------------------------------------

    static check_action_requirements(action_key, require_target = true) {
        const creature = impersonated();
        const action_details = this.actions_list()[action_key];
        
        if (!action_details) return { valid: false };
    
        if (!this.has_resources_available(action_details.resources)) {
            return { valid: false };
        }
    
        if (require_target && !selected()) {
            public_log(`${creature.name_color} needs to select a target for this action.`);
            return { valid: false };
        }
    
        return { valid: true, creature, action_details };
    }

    static has_resources_available(resources) {
        const creature = impersonated();
    
        let return_value = true;
        const missing_resources = [];
    
        for (const name of resources) {
            const resource = creature?.resources[name]?.value || 0;
    
            // Ignore turn resources if not in initiative
            const is_turn_resource = ["Action", "Attack Action", "Bonus Action", "Reaction", "Movement"].includes(name);
            const has_initiative = Initiative.turn_order.includes(creature.id);
            if (is_turn_resource && !has_initiative) continue;
    
            // Special case: Attack Action can be substituted by Action
            if (name === "Attack Action") {
                const action_res = creature?.resources["Action"]?.value || 0;
    
                if (resource < 1 && action_res < 1) {
                    return_value = false;
                    missing_resources.push("Attack Action"); // <-- Use the original name here
                }
    
                continue;
            }
    
            // General case
            if (resource < 1) {
                return_value = false;
                missing_resources.push(name);
            }
        }
    
        if (!return_value) {
            public_log(`${creature.name_color} has insufficient resources for this ability (${missing_resources.join(", ")}).`);
        }
    
        return return_value;
    }

    static use_resources(resources) {
        const creature = impersonated()

        for (const name of resources) {
            const resource = creature.resources[name]

            // Ignore turn resources if not in initiative
            const turn_resource = ["Action", "Attack Action", "Bonus Action", "Reaction", "Movement"].includes(name)
            const has_initative = Initiative.turn_order.includes(creature.id)
            if(turn_resource && !has_initative) continue
            
            // Consume action to create attack actions
            if (name == "Attack Action" && resource.value == 0) {

                // Reduce action
                const action_resource = creature.resources["Action"]
                creature.set_resource_value("Action", action_resource.value - 1)

                // Recharge attack action
                creature.set_resource_value("Attack Action", resource.max)
                resource.value = creature.resources[name].value
            }

            // Consume resource
            if (resource.value < 1) log("An error occurred when calculating resources, that led an empty resource ("+name+") to be spent")
            creature.set_resource_value(name, resource.value - 1)
        }
    }

    //---------------------------------------------------------------------------------------------------
    // Attack Helpers
    //---------------------------------------------------------------------------------------------------

    static make_attack(slot, creature, target) {
        const weapon = database.items.data[creature.equipment[slot]?.name]
        let advantage_weight = 0

        // Range Validation
        const range_validation = this.validate_weapon_attack_range(weapon, creature, target)
        if (range_validation.outOfRange) {
            return {
                success: false,
                message: `${creature.name_color} tried to attack ${target.name_color} using their ${weapon?.name || "fists"} but they are out of range.`
            }
        }
        advantage_weight += range_validation.advantage_weight

        // Calculate Hit
        const hit_bonus = this.calculate_weapon_attack_hit_bonus(weapon, creature)
        const hit_result = this.calculate_weapon_attack_hit_result(hit_bonus, creature, target, advantage_weight)

        // Deal damage
        const damage_result = (hit_result.success 
            ? ` dealing ${this.calculate_weapon_attack_damage(weapon, creature, target, hit_result.message, slot)} damage.`
            : `.`
        )

        // Output
        return {
            success: true,
            weapon: weapon,
            hit_result: hit_result,
            damage_result: damage_result,
            message: `${creature.name_color} attacks ${target.name_color} with their ${weapon?.name || "fists"} and ${hit_result.message} (${hit_result.roll.text_color})${damage_result}`
        }
    }

    static calculate_weapon_attack_damage(weapon, creature, target, hit_result, slot) {
        // Weapon Properties
        const isFinesse = weapon?.properties?.includes("Finesse") || false;
        const isAmmo = weapon?.properties?.includes("Ammunition") || false;
        const isOffHand = slot.includes("off hand")
        const damage_list = weapon?.damage || [{die_ammount: 1, die_size: 1, damage_type: "Bludgeoning"}];

        // Creature Bonuses
        const str_bonus = !isAmmo ? creature.score_bonus["strength"] : 0;
        const dex_bonus = isFinesse || isAmmo ? creature.score_bonus["dexterity"] : 0;
        const damage_bonus = isOffHand ? 0 : Math.max(str_bonus, Math.min(dex_bonus, 3))
        const crit_multiplier = hit_result == "lands a critical hit" ? 2 : 1;

        // Output
        const output = []
        for (const damage of damage_list) {
            // Calculate Damage
            const die_amount = damage.die_ammount * crit_multiplier
            const damage_to_deal = roll_dice(die_amount, damage.die_size) + damage_bonus

            // Deal Damage
            const damage_dealt = target.receive_damage(damage_to_deal, damage.damage_type)
            output.push(`${damage_dealt} ${damage.damage_type.toLowerCase()}`)
        }
        return output.join(", ")
    }

    static validate_weapon_attack_range(weapon, creature, target) {
        const usesAmmo = weapon?.properties?.includes("Ammunition") || false
        const isThrown = weapon?.properties?.includes("Thrown") || false
        const isReach = weapon?.properties?.includes("Reach") || false
        const range = weapon?.range || (isReach ? [10] : [5])

        // Calculated Conditions
        const distance = calculate_distance(creature, target) * 5
        const meleeRange = distance <= 5 || (distance <= 10 && isReach)

        // Output
        const output = { advantage_weight: 0, outOfRange: false, throwWeapon: false, requiresAmmo: false }
        {
            // Ranged Weapon
            if (usesAmmo) {
                const outOfRange = distance > range[1]
                const extendedRange = distance > range[0]

                // Output
                if (outOfRange) output.outOfRange = true
                else if (extendedRange || meleeRange) output.advantage_weight -= 1
                output.requiresAmmo = true
            }
            // Throwing Weapon
            else if (isThrown) { 
                const outOfRange = distance > range[1]
                const extendedRange = distance > range[0]

                // Output
                if (outOfRange) output.outOfRange = true
                else if (extendedRange) output.throwWeapon = true
            }
            // Melee Weapon
            else {
                const outOfRange = distance > range[0]

                // Output
                if (outOfRange) output.outOfRange = true
            }
        }

        return output
    }

    static calculate_weapon_attack_hit_result(hit_bonus, creature, target, advantage_weight = 0) {
        creature.face_target()
        const target_visibility = creature.target_visibility()

        // Advantage Modifiers
        advantage_weight += this.calculate_weapon_attack_roll_advantage_modifiers(creature, target)

        // Roll d20
        const roll_result = roll_20(advantage_weight, creature)
        const roll_to_hit = roll_result.result

        // Target AC + Cover
        let cover = 0; {
            // Three quarters cover
            if (target_visibility <= 0.25) cover = 5

            // Half cover
            else if (target_visibility <= 0.5) cover = 2
        }
        const target_ac = target.armor_class + cover

        // Output
        let advantage = "None"; {
            if (advantage_weight > 0) advantage = "Advantage"
            else if (advantage_weight < 0) advantage = "Disadvantage"
        }
        const output = { success: false, message: "", roll: roll_result, advantage: advantage}; {
            // Critical Hit
            if (roll_to_hit === 20) {
                output.success = true
                output.message = "lands a critical hit"
            }

            // Critical Miss
            else if (roll_to_hit === 1) {
                output.message = "critically misses"
            }

            // Hit
            else if (roll_to_hit + hit_bonus >= target_ac) {
                output.success = true
                output.message = "hits"

                // Add hit bonus to text
                output.roll.text += ` + ${hit_bonus}`
                output.roll.text_color += ` + ${hit_bonus}`
            }

            // Miss
            else {
                output.message = "misses"

                // Add hit bonus to text
                output.roll.text += ` + ${hit_bonus}`
                output.roll.text_color += ` + ${hit_bonus}`
            }
        }
        return output
    }

    static calculate_weapon_attack_hit_bonus(weapon, creature) {
        const isFinesse = weapon?.properties?.includes("Finesse") || false;
        const isAmmo = weapon?.properties?.includes("Ammunition") || false;

        // Applicable bonuses
        const str_bonus = !isAmmo ? creature.score_bonus["strength"] : 0;
        const dex_bonus = isFinesse || isAmmo ? creature.score_bonus["dexterity"] : 0;

        return Math.max(Math.min(str_bonus, 3), dex_bonus) + 2;
    }

    static calculate_weapon_attack_roll_advantage_modifiers(creature, target) {
        let output = 0; {

            // Helped
            if (creature.has_condition("Helped")) {
                creature.remove_condition("Helped")
                output += 1
            }

            // Unseen Attacker
            if (creature.has_conditions(["Hidden", "Invisible"], "any")) output += 1

            // Reckless Attack
            if (target.has_condition("Reckless Attack") || creature.has_condition("Reckless Attack")) output += 1
        }

        // Output
        return output
    }

    //---------------------------------------------------------------------------------------------------
    // Actions List
    //---------------------------------------------------------------------------------------------------

    static actions_list() {
        const creature = impersonated();
        const origin = "Common"
        const actions = {
            attack: {
                resources: ["Attack Action"],
                description: "Use your main equipped weapon (or fists) to deliver a blow to the enemy.",
                recovery: database?.items?.data[creature?.equipment["primary main hand"]?.name]?.recovery || 2,
                origin: origin
            },
            grapple: {
                resources: ["Attack Action"],
                description: "Attempt to grapple the enemy, impeding their movement.",
                recovery: 4,
                origin: origin
            },
            push: {
                resources: ["Attack Action"],
                description: "Attempt to push the enemy 5ft.",
                recovery: 4,
                origin: origin
            },
            knock_prone: {
                resources: ["Attack Action"],
                description: "Attempt to knock down the enemy.",
                recovery: 4,
                origin: origin
            },
            dash: {
                resources: ["Action"],
                description: "Gain additional movement equal to your speed.",
                recovery: 1,
                origin: origin
            },
            disengage: {
                resources: ["Action"],
                description: "Your movement doesn't provoke opportunity attacks for the rest of the turn.",
                recovery: 1,
                origin: origin
            },
            dodge: {
                resources: ["Action"],
                description: "Focus on avoiding attacks. Attack rolls against you have disadvantage.",
                recovery: 1,
                origin: origin
            },
            help: {
                resources: ["Action"],
                description: "Aid another creature in attacking or avoiding attacks.",
                recovery: 4,
                origin: origin
            },
            hide: {
                resources: ["Action"],
                description: "Attempt to hide from enemies using Stealth.",
                recovery: 1,
                origin: origin
            },
            ready: {
                resources: ["Action"],
                description: "Prepare to take an action later in response to a trigger.",
                recovery: 0,
                origin: origin
            },
            search: {
                resources: ["Action"],
                description: "Devote your attention to finding something using Perception or Investigation.",
                recovery: 1,
                origin: origin
            },
        }

        // Off Hand Attack
        const off_hand_weapon = database.items.data[creature.equipment["primary off hand"]?.name];
        const hasOffHandWeapon = off_hand_weapon ? off_hand_weapon.subtype == "weapon" : false
        if (hasOffHandWeapon) {
            actions["off_hand_attack"] = {
                resources: ["Bonus Action"],
                description: "Use your off hand weapon to deliver a blow to the enemy.",
                origin: origin
            }
        }

        // Opportunity Attack
        const weapon = database.items.data[creature.equipment["primary main hand"]?.name];
        const isWeaponRanged = weapon ? weapon.properties.includes("Ammunition") : false
        if (!isWeaponRanged) {
            actions["opportunity_attack"] = {
                resources: ["Reaction"],
                description: "You can make an opportunity attack when a hostile creature that you can see moves out of your reach. To make the opportunity attack, you use your reaction to make one melee attack against the provoking creature. The attack occurs right before the creature leaves your reach.",
                origin: origin
            }
        }
        

        return actions
    }

    //---------------------------------------------------------------------------------------------------
    // Attack Actions
    //---------------------------------------------------------------------------------------------------

    static attack() {
        const action_name = "attack"
        const slot = "primary main hand"
        const target = selected()

        // Requirements
        const { valid, creature, action_details } = this.check_action_requirements(action_name);
        if (!valid || !target) return;

        // Make attack
        const attack_result = this.make_attack(slot, creature, target)
        if (!attack_result.success) {
            public_log(attack_result.message)
            return
        }

        // Consume resources
        this.use_resources(action_details.resources)
        Initiative.set_recovery(action_details.recovery, creature)

        // Logging
        public_log(attack_result.message)
    }

    static opportunity_attack() {
        const action_name = "opportunity_attack"
        const slot = "primary main hand"
        const target = selected()

        // Requirements
        const { valid, creature, action_details } = this.check_action_requirements(action_name);
        if (!valid || !target) return;

        // Make attack
        const attack_result = this.make_attack(slot, creature, target)
        if (!attack_result.success) {
            public_log(attack_result.message)
            return
        }

        // Consume resources
        this.use_resources(action_details.resources)
        Initiative.set_recovery(action_details.recovery, creature)

        // Logging
        public_log(attack_result.message)
    }

    static off_hand_attack() {
        const action_name = "off_hand_attack"
        const slot = "primary off hand"
        const target = selected()

        // Requirements
        const { valid, creature, action_details } = this.check_action_requirements(action_name);
        if (!valid || !target) return;

        // Make attack
        const attack_result = this.make_attack(slot, creature, target)
        if (!attack_result.success) {
            public_log(attack_result.message)
            return
        }

        // Consume resources
        this.use_resources(action_details.resources)
        Initiative.set_recovery(action_details.recovery, creature)

        // Logging
        public_log(attack_result.message)
    }

    static grapple() {
        return;
    }

    static push() {
        return;
    }

    static knock_prone() {
        return;
    }

    //---------------------------------------------------------------------------------------------------
    // Other Actions
    //---------------------------------------------------------------------------------------------------

    static dash() {
        // Requirements
        const { valid, creature, action_details } = this.check_action_requirements("dash", false);
        if (!valid) return;

        // New movement
        const current_movement = creature.resources["Movement"]
        const speed = creature.speed
        creature.set_resource_max("Movement", current_movement.max + speed)
        creature.set_resource_value("Movement", current_movement.value + speed)

        // Consume resources
        this.use_resources(action_details.resources)
        Initiative.set_recovery(action_details.recovery, creature)

        // Logging
        public_log(creature.name_color + " dashes, gaining extra movement for this round.")
    }

    static disengage() {
        // Requirements
        const { valid, creature, action_details } = this.check_action_requirements("disengage", false);
        if (!valid) return;

        // Condition
        creature.set_condition("Disengage", 1)

        // Consume resources
        this.use_resources(action_details.resources)
        Initiative.set_recovery(action_details.recovery, creature)

        // Logging
        public_log(creature.name_color + " disengages, gaining immunity to opportunity attacks.")
    }

    static dodge() {
        // Requirements
        const { valid, creature, action_details } = this.check_action_requirements("dodge", false);
        if (!valid) return;

        // Condition
        creature.set_condition("Dodge", 1)

        // Consume resources
        this.use_resources(action_details.resources)
        Initiative.set_recovery(action_details.recovery, creature)

        // Logging
        public_log(creature.name_color + " focuses on dodging, making it easier for them to avoid attacks.")
    }

    static help() {
        // Requirements
        const { valid, creature, action_details } = this.check_action_requirements("help", true);
        const target = selected();
        if (!valid || !target) return;

        // Range Validation
        const distance = calculate_distance(creature, target)
        if (distance > 1) {
            public_log(`${creature.name_color} tried to help someone, but they are not in range.`)
            return
        }

        // Condition
        target.set_condition("Helped", 1)

        // Consume resources
        this.use_resources(action_details.resources)
        Initiative.set_recovery(action_details.recovery, creature)

        // Logging
        public_log(`${creature.name_color} is helping ${target.name_color} on their next roll.`)
    }

    static hide() {
        // Requirements
        const { valid, creature, action_details } = this.check_action_requirements("hide", false);
        if(creature.has_condition("Hidden")) { // Free unhide
            creature.remove_condition("Hidden")
            public_log(`${creature.name_color} has stopped hiding.`)
            return
        }
        if (!valid) return

        // Condition
        creature.set_condition("Hidden", -1)
        creature.maintain_stealth(true)

        // Consume resources
        this.use_resources(action_details.resources)
        Initiative.set_recovery(action_details.recovery, creature)
    }
    
    static ready() {
        return
    }

    static search() {
        return
    }

    //---------------------------------------------------------------------------------------------------
}
