

var Common = class {

    //---------------------------------------------------------------------------------------------------
    // Actions List
    //---------------------------------------------------------------------------------------------------

    static actions_list() {
        const creature = impersonated();
        const origin = "Common"

        const actions = {
            finish_casting: undefined,
            attack: {
                resources: ["Attack Action"],
                description: "Use your main equipped weapon (or fists) to deliver a blow to the enemy.",
                recovery: database?.items?.data[creature?.equipment["primary main hand"]?.name]?.recovery || 2,
                origin: origin
            },
            opportunity_attack: undefined,
            off_hand_attack: undefined,
            grapple: {
                resources: ["Attack Action"],
                description: "Attempt to grapple the enemy, impeding their movement.",
                recovery: 4,
                image: "asset://3a90ab2008c2c129ca918ded3f25ef35",
                origin: origin
            },
            push: {
                resources: ["Attack Action"],
                description: "Attempt to push the enemy 5ft.",
                recovery: 4,
                image: "asset://3c2d43aac056025447140691ea97647d",
                origin: origin
            },
            knock_prone: {
                resources: ["Attack Action"],
                description: "Attempt to knock down the enemy.",
                recovery: 4,
                image: "asset://74e398f61ad927dc3855f4ec649c86f9",
                origin: origin
            },
            dash: {
                resources: ["Action"],
                description: "Gain additional movement equal to your speed.",
                recovery: 1,
                image: "asset://70343940fea7217d05b65ddf243b1004",
                origin: origin
            },
            disengage: {
                resources: ["Action"],
                description: "Your movement doesn't provoke opportunity attacks for the rest of the turn.",
                recovery: 1,
                image: "asset://31ded0026d18d1dffa98ae83c02154e2",
                origin: origin
            },
            dodge: {
                resources: ["Action"],
                description: "Focus on avoiding attacks. Attack rolls against you have disadvantage.",
                recovery: 1,
                image: "asset://d8f7756c4828ffea746144ca2f2643b2",
                origin: origin
            },
            help: {
                resources: ["Action"],
                description: "Aid another creature in attacking or avoiding attacks.",
                recovery: 4,
                image: "asset://3968417b9587fa72407aea0b473fcb9a",
                origin: origin
            },
            hide: {
                resources: ["Action"],
                description: "Attempt to hide from enemies using Stealth.",
                recovery: 1,
                image: "asset://14959f9d383aad57803f897bc0e0f6c2",
                origin: origin
            },
            ready: {
                resources: ["Action"],
                description: "Prepare to take an action later in response to a trigger.",
                recovery: 0,
                image: "asset://93420b4771de042d1c336f1c9c0a96ba",
                origin: origin
            },
            search: {
                resources: ["Action"],
                description: "Devote your attention to finding something using Perception or Investigation.",
                recovery: 1,
                image: "asset://4429fcc699ba0b55fd3373841aebaf00",
                origin: origin
            },
            switch_weapon: undefined
        }

        // Finish Casting
        {
            if (creature.has_condition("Spellcasting") && Initiative.current_creature == creature.id) {
                const condition = creature.get_condition("Spellcasting")
                const { spell } = condition

                actions.finish_casting = {
                    name: "Finish Casting: " + spell.name,
                    resources: [],
                    recovery: 0,
                    image: spell.image,
                    origin: "Spells",
                    description: `Use this button to finish casting prepared spell.`
                }
            }
        }

        // Attack
        {
            // Validations
            const weapon = database.items.data[creature.equipment["primary main hand"]?.name];
            const hasWeapon = weapon ? true : false
            const isWeaponRanged = hasWeapon ? weapon.properties.includes("Ammunition") : false
            const isWeaponMelee = hasWeapon && !isWeaponRanged

            // Image
            let image = ""; {
                if (!hasWeapon) image = "asset://15d2e36a9ee7d30bdeca4d0b62572db5"
                else if (isWeaponRanged) image = "asset://3eac5c3acef297725dbd3b0095ab9c94"
                else if (isWeaponMelee) image = "asset://3c434b2998bc504339382ce6b11bb90b"
            }

            // Add Image
            actions["attack"].image = image
        }
        

        // Off Hand Attack
        {
            // Validations
            const off_hand_weapon = database.items.data[creature.equipment["primary off hand"]?.name];
            const hasOffHandWeapon = off_hand_weapon ? off_hand_weapon.subtype == "weapon" : false
            const isOffHandWeaponRanged = hasOffHandWeapon ? off_hand_weapon.properties.includes("Ammunition") : false
            const isOffHandWeaponMelee = hasOffHandWeapon && !isOffHandWeaponRanged

            // Image
            let image = ""; {
                if (!hasOffHandWeapon) image = "asset://1d595c7a3a9f4d9dc169556dcaaff1de"
                else if (isOffHandWeaponRanged) image = "asset://9796a1abd6f8333e3582dcfc0af36632"
                else if (isOffHandWeaponMelee) image = "asset://a641145f8429182fb6fd43f39eddd72a"
            }

            // Adding Action
            if (hasOffHandWeapon) {
                actions["off_hand_attack"] = {
                    resources: ["Bonus Action"],
                    description: "Use your off hand weapon to deliver a blow to the enemy.",
                    image: image,
                    origin: origin
                }
            }
        }

        // Opportunity Attack
        {
            // Validations
            const weapon = database.items.data[creature.equipment["primary main hand"]?.name];
            const hasWeapon = weapon ? true : false
            const isWeaponRanged = hasWeapon ? weapon.properties.includes("Ammunition") : false
            const isWeaponMelee = hasWeapon && !isWeaponRanged

            // Image
            let image = ""; {
                if (!hasWeapon) image = "asset://3adce848e00dae81db4189b6d12614ed"
                else if (isWeaponRanged) image = "asset://ea66850f4615b91472e44413ccb48a2b"
                else if (isWeaponMelee) image = "asset://ccdbfa20d147bb42add0079e9f239f2f"
            }

            // Add Action
            if (
                !isWeaponRanged && 
                Initiative.turn_order.includes(creature.id) && 
                Initiative.turn_order[0] != creature.id
            ) {
                actions["opportunity_attack"] = {
                    resources: ["Reaction"],
                    description: "You can make an opportunity attack when a hostile creature that you can see moves out of your reach. To make the opportunity attack, you use your reaction to make one melee attack against the provoking creature. The attack occurs right before the creature leaves your reach.",
                    image: image,
                    origin: origin
                }
            }
        }

        // Switch Weapon
        {
            const hasInitiative = Initiative.turn_order.includes(creature.id)
            const canUse = hasInitiative ? Initiative.current_creature == creature.id : true
            if (canUse && (creature.equipment["secondary main hand"] != null || creature.equipment["secondary off hand"] != null)) {
                actions.switch_weapon = {
                    name: "Switch Weapon",
                    resources: [],
                    recovery: 0,
                    image: "asset://4df58740b798e04911f0356e8931b486",
                    origin: origin,
                    description: `Switch primary and secondary weapon slots.`
                }
            }
        }

        return actions
    }

    //---------------------------------------------------------------------------------------------------
    // Resource Helpers
    //---------------------------------------------------------------------------------------------------

    static check_action_requirements(action_key, require_target = true) {
        const creature = impersonated();
        const action_details = this.actions_list()[action_key];
        if (!action_details) return { valid: false };
    
        // Validate Resources
        if (!this.has_resources_available(action_details.resources)) {
            return { valid: false };
        }
    
        // Validate Target
        if (require_target && !selected()) {
            public_log(`${creature.name_color} needs to select a target for this action.`);
            return { valid: false };
        }

        // Validate Range
        if (require_target && creature.target_visibility() == 0) {
            public_log(`${creature.name_color} needs to see their target.`);
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
            
            // Check if we can use Ready Action substitution
            const isNotSpell = !JSON.stringify(resources).includes("Spell Slot")
            const can_use_reaction = creature.has_condition("Ready Action") && (name === "Action" || name === "Attack Action") && isNotSpell
            
            switch (name) {
                case "Attack Action": {
                    const action_res = creature?.resources["Action"]?.value || 0;
                    const reaction_res = creature?.resources["Reaction"]?.value || 0;
                    
                    if (resource < 1) {
                        if (can_use_reaction && reaction_res >= 1) {
                            // Can use Reaction instead of Action
                            continue;
                        }
                        if (action_res >= 1) {
                            // Can use Action
                            continue;
                        }
                        return_value = false;
                        missing_resources.push("Attack Action");
                    }
                    break;
                }
                
                case "Action": {
                    if (can_use_reaction) {
                        const reaction_res = creature?.resources["Reaction"]?.value || 0;
                        if (resource < 1 && reaction_res < 1) {
                            return_value = false;
                            missing_resources.push("Action");
                        }
                    } else if (resource < 1) {
                        return_value = false;
                        missing_resources.push("Action");
                    }
                    break;
                }
                
                default: {
                    if (resource < 1) {
                        return_value = false;
                        missing_resources.push(name);
                    }
                }
            }
        }
        
        if (!return_value) {
            public_log(`${creature.name_color} has insufficient resources for this ability (${missing_resources.join(", ")}).`);
        }
        
        return return_value;
    }

    static use_resources(resources) {
        const creature = impersonated();

        for (const name of resources) {
            const resource = creature.resources[name];

            // Ignore turn resources if not in initiative
            const turn_resource = ["Action", "Attack Action", "Bonus Action", "Reaction", "Movement"].includes(name);
            const has_initiative = Initiative.turn_order.includes(creature.id);
            if (turn_resource && !has_initiative) continue;
            
            // Check if we can use Ready Action substitution
            const can_use_reaction = creature.has_condition("Ready Action") && 
                                (name === "Action" || name === "Attack Action");

            // Handle Attack Action with possible Action/Reaction substitution
            if (name === "Attack Action" && resource.value < 1) {
                if (can_use_reaction && creature.resources["Reaction"].value >= 1) {
                    // Use Reaction instead of Action
                    creature.set_resource_value("Reaction", creature.resources["Reaction"].value - 1);
                    creature.remove_condition("Ready Action")
                } else if (creature.resources["Action"].value >= 1) {
                    // Use Action normally
                    creature.set_resource_value("Action", creature.resources["Action"].value - 1);
                } else {
                    log("An error occurred when calculating resources for Attack Action");
                    continue;
                }
                // Recharge attack action
                creature.set_resource_value("Attack Action", resource.max - 1);
                continue;
            }

            // Handle Action with Ready Action substitution
            if (name === "Action" && resource.value < 1 && can_use_reaction) {
                creature.set_resource_value("Reaction", creature.resources["Reaction"].value - 1);
                creature.remove_condition("Ready Action")
                creature.set_resource_value("Action", resource.max);
            }

            // Default consumption
            if (resource.value < 1) {
                log(`An error occurred when calculating resources, that led an empty resource (${name}) to be spent`);
                continue;
            }
            creature.set_resource_value(name, resource.value - 1);
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

        // Release Sound
        let release_sound = "swing"; {
            if (!weapon) {}
            else if( weapon.name.toLowerCase().includes("crossbow") ) release_sound = "crossbow"
            else if ( weapon.name.toLowerCase().includes("bow") ) release_sound = "bow"
        }
        Sound.play(release_sound, 0.1)

        // Calculate Hit
        const hit_bonus = this.weapon_attack_hit_bonus(weapon, creature)
        const hit_result = this.attack_hit_result(hit_bonus, creature, target, advantage_weight)

        // Deal damage
        const damage_result = (hit_result.success 
            ? ` dealing ${this.weapon_attack_damage(weapon, creature, target, hit_result.message, slot)} damage.`
            : `.`
        )

        // Output
        return {
            success: true,
            weapon: weapon,
            hit_result: hit_result,
            damage_result: damage_result,
            message: `${creature.name_color} attacks ${target.name_color} (AC ${target.armor_class}) with their ${weapon?.name || "fists"} and ${hit_result.message} (${hit_result.roll.text_color})${damage_result}`
        }
    }

    static weapon_attack_damage(weapon, creature, target, hit_result, slot) {
        // Weapon Properties
        const isFinesse = weapon?.properties?.includes("Finesse") || false;
        const isAmmo = weapon?.properties?.includes("Ammunition") || false;
        const isOffHand = slot.includes("off hand")
        const damage_list = (weapon?.damage 
            ? [...weapon.damage, ...this.weapon_attack_damage_bonuses(creature)] 
            : [{die_amount: 1, die_size: 1, damage_type: "Bludgeoning", damage_bonus: 0}]
        )

        // Creature Bonuses
        const str_bonus = !isAmmo ? creature.score_bonus["strength"] : 0;
        const dex_bonus = isFinesse || isAmmo ? creature.score_bonus["dexterity"] : 0
        const damage_attribute_bonus = (isOffHand ? 0 : Math.max(str_bonus, Math.min(dex_bonus, 3)))
        const damage_modifiers = this.weapon_attack_damage_modifiers(creature, target)

        // Damage
        const crit_multiplier = hit_result == "lands a critical hit" ? 2 : 1;

        // Output
        const output = []
        let count = 0
        for (const damage of damage_list) {
            // Calculate Damage
            const die_size = damage.die_size || 0
            const die_amount = (damage.die_amount || damage.die_ammount || 0) * crit_multiplier
            const damage_bonus = damage.damage_bonus || 0
            const applied_once_damage_modifiers = (count == 0 ? damage_attribute_bonus + damage_modifiers : 0)

            const damage_to_deal = roll_dice(die_amount, die_size) + applied_once_damage_modifiers + damage_bonus
            count ++

            // Deal Damage
            const damage_dealt = target.receive_damage(damage_to_deal, damage.damage_type)
            output.push(`${damage_dealt} ${damage.damage_type.toLowerCase()}`)

            // Sound
            if (damage_dealt > 0) Sound.play(damage.damage_type.toLowerCase())
        }
        function replaceLastCommaWithAnd(str) {
            const lastIndex = str.lastIndexOf(",");
            if (lastIndex === -1) return str; // no comma found

            return (
                str.slice(0, lastIndex) +
                " and" +
                str.slice(lastIndex + 1)
            );
        }
        return replaceLastCommaWithAnd(output.join(", "))
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

    static attack_hit_result(hit_bonus, creature, target, advantage_weight = 0) {
        creature.face_target()
        const target_visibility = creature.target_visibility()

        // Advantage Modifiers
        advantage_weight += this.attack_roll_advantage_modifiers(creature, target)

        // Roll d20
        const roll_result = roll_20(advantage_weight, creature)
        const roll_to_hit = roll_result.result

        // Cover
        let cover = 0; {
            // Three quarters cover
            if (target_visibility <= 0.25) cover = 5

            // Half cover
            else if (target_visibility <= 0.5) cover = 2

            if (calculate_distance(creature, target) <= 1) cover = 0
        }
        hit_bonus -= cover

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
            else if (roll_to_hit + hit_bonus >= target.armor_class) {
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

        // Sound
        if (!output.message.includes("hit")) {
            const body_slot = target.equipment.body;
            const off_hand_slot = target.equipment["primary off hand"]
            const unarmored_armor_class = 10 + target.score_bonus.dexterity

            // Armor bonus
            let armor_bonus = 0; {
                if (body_slot) {
                    const item = database.get_item(body_slot.name)
                    if (item) {
                        let is_metal = false
                        for (const element of ["plate", "splint", "chain", "scale", "ring"]) { if (item.name.toLowerCase().includes(element)) is_metal = true }
                        if (is_metal) {
                            armor_bonus = Math.max((item.base_armor_class || 0) - unarmored_armor_class, 0)
                        }
                    }
                }
            }

            // Shield bonus
            let shield_bonus = 0; {
                if (off_hand_slot) {
                    const item = database.get_item(off_hand_slot.name)
                    if (item?.subtype == "shield") {
                        shield_bonus = item.bonus_armor_class || 0
                    }
                }
            }

            const roll = roll_to_hit + hit_bonus
            if (roll < unarmored_armor_class) {}
            else if (roll < unarmored_armor_class + armor_bonus) Sound.play("armor")
            else if (roll < unarmored_armor_class + shield_bonus + armor_bonus) Sound.play("shield")
        }

        return output
    }

    static weapon_attack_hit_bonus(weapon, creature) {
        const isFinesse = weapon?.properties?.includes("Finesse") || false;
        const isAmmo = weapon?.properties?.includes("Ammunition") || false;

        // Applicable bonuses
        const str_bonus = !isAmmo ? creature.score_bonus["strength"] : 0;
        const dex_bonus = isFinesse || isAmmo ? creature.score_bonus["dexterity"] : 0;

        return Math.max(Math.min(str_bonus, 3), dex_bonus) + 2;
    }

    static attack_roll_advantage_modifiers(creature, target) {
        let output = 0; {
            // Blur
            if (target.has_condition("Blur")) output -= 1

            // Dodge
            if (target.has_condition("Dodge")) output -= 1 

            // Helped
            if (creature.has_condition("Helped")) {
                creature.remove_condition("Helped")
                output += 1
            }

            // Reckless Attack
            if (target.has_condition("Reckless Attack") || creature.has_condition("Reckless Attack")) output += 1

            // Unseen Attacker
            if (creature.has_conditions(["Hidden", "Invisible"], "any")) {
                creature.maintain_stealth(true)
                target.passive_search()
                output += 1
            }
        }

        // Output
        return output
    }

    static weapon_attack_damage_modifiers(creature, target) {
        let output = 0; {

            // Rage
            if (creature.has_condition("Rage")) {
                output += 2
                const barbarian_level = creature.classes?.Barbarian?.level || 0
                if (barbarian_level >= 9) output += 1
                if (barbarian_level >= 16) output += 1
            }

        }
        return output
    }

    static weapon_attack_damage_bonuses(creature, target) {
        const output = []; {

            // Imbue Weapon
            if (creature.has_condition("Imbue Weapon")) {
                const condition = creature.get_condition("Imbue Weapon")
                output.push({die_amount: 0, die_size: 0, damage_type: condition.damage_type, damage_bonus: condition.damage_bonus})
            }

        }
        return output
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
        // Free unhide
        const creature = impersonated()
        if(creature.has_condition("Hidden")) {
            creature.remove_condition("Hidden")
            public_log(`${creature.name_color} has stopped hiding.`)
            return
        }

        // Requirements
        const { valid, action_details } = this.check_action_requirements("hide", false);
        if (!valid) return

        // Condition
        creature.set_condition("Hidden", -1)
        creature.maintain_stealth(true)

        // Consume resources
        this.use_resources(action_details.resources)
        Initiative.set_recovery(action_details.recovery, creature)
    }

    static search() {
        // Requirements
        const { valid, creature, action_details } = this.check_action_requirements("search", false);
        if (!valid) return

        // Condition
        creature.active_search()

        // Consume resources
        this.use_resources(action_details.resources)
        Initiative.set_recovery(action_details.recovery, creature)
    }
    
    static ready() {
        // Requirements
        const { valid, creature, action_details } = this.check_action_requirements("ready", false);
        if (!valid) return

        // Condition
        creature.set_condition("Ready Action", 1)

        // Consume resources
        this.use_resources(action_details.resources)
        Initiative.set_recovery(action_details.recovery, creature)

        // Logging
        console.log(`${creature.name_color} is readying an action.`, "all")
    }

    static switch_weapon() {
        // Requirements
        const { valid, creature, action_details } = this.check_action_requirements("switch_weapon", false);
        if (!valid) return

        // Switch Weapons
        creature.switch_weapon_sets()

        // Logging
        console.log(`${creature.name_color} switched weapon sets.`, "all")
    }

    //---------------------------------------------------------------------------------------------------
}
