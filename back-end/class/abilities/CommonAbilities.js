

var CommonAbilities = class extends Abilities {
    // Ability List
    static abilities_list(creature=impersonated()) {
        const origin = "CommonAbilities"
        const type = "Common"

        const abilities_list = {
            // Attacks
            attack: {
                resources: ["Attack Action"],
                description: "Use your main equipped weapon (or fists) to deliver a blow to the enemy.",
                recovery: database?.items?.data[creature?.equipment["primary main hand"]?.name]?.recovery || 2,
                type: "Attack",
                origin: origin
            },
            grapple: {
                resources: ["Attack Action"],
                description: "Attempt to grapple the enemy, impeding their movement. When grappling a creature, they have disadvantage on attacks to targets other than you " +
                             "and attacks from others on that creature are made with advantage.",
                recovery: 4,
                image: "asset://3a90ab2008c2c129ca918ded3f25ef35",
                type: "Attack",
                origin: origin
            },
            push: {
                resources: ["Attack Action"],
                description: "Attempt to push the enemy 5ft.",
                recovery: 4,
                image: "asset://3c2d43aac056025447140691ea97647d",
                type: "Attack",
                origin: origin
            },
            knock_prone: {
                resources: ["Attack Action"],
                description: "Attempt to knock down the enemy.",
                recovery: 4,
                image: "asset://74e398f61ad927dc3855f4ec649c86f9",
                type: "Attack",
                origin: origin
            },

            // Common
            dash: {
                resources: ["Action"],
                description: "Gain additional movement equal to your speed.",
                recovery: 1,
                image: "asset://70343940fea7217d05b65ddf243b1004",
                type: type,
                origin: origin
            },
            disengage: {
                resources: ["Action"],
                description: "Your movement doesn't provoke opportunity attacks for the rest of the turn.",
                recovery: 1,
                image: "asset://31ded0026d18d1dffa98ae83c02154e2",
                type: type,
                origin: origin
            },
            dodge: {
                resources: ["Action"],
                description: "Focus on avoiding attacks. Attack rolls against you have disadvantage.",
                recovery: 1,
                image: "asset://d8f7756c4828ffea746144ca2f2643b2",
                type: type,
                origin: origin
            },
            help: {
                resources: ["Action"],
                description: "Aid another creature in attacking or avoiding attacks.",
                recovery: 4,
                image: "asset://3968417b9587fa72407aea0b473fcb9a",
                type: type,
                origin: origin
            },
            hide: {
                resources: ["Action"],
                description: "Attempt to hide from enemies using Stealth.",
                recovery: 1,
                image: "asset://14959f9d383aad57803f897bc0e0f6c2",
                type: type,
                origin: origin
            },
            ready: {
                resources: ["Action"],
                description: "Prepare to take an action later in response to a trigger.",
                recovery: 0,
                image: "asset://93420b4771de042d1c336f1c9c0a96ba",
                type: type,
                origin: origin
            },
            search: {
                resources: ["Action"],
                description: "Devote your attention to finding something using Perception or Investigation.",
                recovery: 1,
                image: "asset://4429fcc699ba0b55fd3373841aebaf00",
                type: type,
                origin: origin
            },
        }

        /* Attack */ {
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
            abilities_list["attack"].image = image

            // If unnarmed and has monster custom attack, do not show unnarmed attack
            if (!hasWeapon && creature.custom_abilities) {
                for (const name in creature.custom_abilities) {
                    const ability = creature.custom_abilities[name]
                    if (ability.type == "Attack") {
                        abilities_list["attack"] = undefined
                    }
                }
            }
        }
        
        /* Off Hand Attack */ {
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
                abilities_list["off_hand_attack"] = {
                    resources: ["Bonus Action"],
                    description: "Use your off hand weapon to deliver a blow to the enemy.",
                    image: image,
                    type: "Attack",
                    origin: origin
                }
            }
        }

        /* Opportunity Attack */ { 
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
                abilities_list["opportunity_attack"] = {
                    resources: ["Reaction"],
                    description: "You can make an opportunity attack when a hostile creature that you can see moves out of your reach. To make the opportunity attack, you use your reaction to make one melee attack against the provoking creature. The attack occurs right before the creature leaves your reach.",
                    image: image,
                    type: "Attack",
                    origin: origin
                }
            }
        }

        /* Switch Weapon */ {
            const hasInitiative = Initiative.turn_order.includes(creature.id)
            const canUse = hasInitiative ? Initiative.current_creature == creature.id : true
            if (canUse && (creature.equipment["secondary main hand"] != undefined || creature.equipment["secondary off hand"] != undefined)) {
                abilities_list.switch_weapon = {
                    name: "Switch Weapon",
                    resources: [],
                    recovery: 0,
                    image: "asset://4df58740b798e04911f0356e8931b486",
                    origin: origin,
                    type: "Common",
                    description: `Switch primary and secondary weapon slots.`
                }
            }
        }

        /* Escape Grapple */ { 
            if (creature.has_condition("Grappled")) {
                abilities_list.escape_grapple = {
                    name: "Escape Grapple",
                    resources: ["Action"],
                    recovery: 0,
                    image: "asset://3a90ab2008c2c129ca918ded3f25ef35",
                    origin: origin,
                    type: "Special",
                    description: `Attempt to escape grapple.`
                }
            }
        }

        /* Stop Grappling */ { 
            if (creature.has_condition("Grappling")) {
                abilities_list.stop_grappling = {
                    name: "Stop Grappling",
                    resources: [],
                    recovery: 0,
                    image: "asset://3a90ab2008c2c129ca918ded3f25ef35",
                    origin: origin,
                    type: "Special",
                    description: `Release grappled creature.`
                }
            }
        }

        /* Stand up */ { 
            if (creature.has_condition("Prone")) {
                abilities_list.stand_up = {
                    name: "Stand up",
                    resources: ["Movement"],
                    recovery: 0,
                    image: "asset://74e398f61ad927dc3855f4ec649c86f9",
                    origin: origin,
                    type: "Special",
                    description: `Stand up from prone.`
                }
            }
        }

        return abilities_list
    }

    //---------------------------------------------------------------------------------------------------
    // Special
    //---------------------------------------------------------------------------------------------------

    static escape_grapple() {
        const function_name = "escape_grapple"

        // Helper
        const makeCheck = (creature, target=false) => {
            const dice_roll = roll_20()
            const bonus = (target
                ? Math.max(creature.skills.Athletics, creature.skills.Acrobatics)
                : creature.skills.Athletics
            )

            return {
                result: dice_roll.result + bonus,
                dice_roll,
                bonus,
                text: `${dice_roll.text_color} ${bonus >= 0 ? "+" : "-"} ${bonus}`
            }
        }

        // Requirements
        const { valid, creature, action_details } = this.check_action_requirements(function_name, false);
        if (!valid) return;

        // Validate creature is grappled
        if (!creature.has_condition("Grappled")) {
            console.log(`${creature.name_color} is not grappled.`, "all")
            return
        }

        // Get grappler
        const grappler_id = creature.get_condition("Grappled").source
        const grappler = instance(grappler_id)
        if (!grappler) {
            console.log(`${creature.name_color} tried to escape grapple but the grappler is no longer valid.`, "all")
            creature.remove_condition("Grappled")
            return
        }

        // Make escape check (Athletics or Acrobatics) vs grappler's Athletics
        const escape_check = makeCheck(creature, true)
        const grappler_check = makeCheck(grappler)
        
        let message = "", success = false; {
            if (escape_check.result > grappler_check.result) {
                success = true
                message = `${creature.name_color} (${escape_check.text}) successfully escaped the grapple from ${grappler.name_color} (DC ${grappler_check.text}).`
            }
            else {
                message = `${creature.name_color} (${escape_check.text}) attempted to escape the grapple from ${grappler.name_color} (DC ${grappler_check.text}) but failed.`
            }
        }

        // Remove conditions and restore movement if successful
        if (success) {
            // Remove Grappled condition from creature
            creature.remove_condition("Grappled")
            
            // Remove Grappling condition from grappler if it points to this creature
            if (grappler.has_condition("Grappling") && grappler.get_condition("Grappling").target == creature.id) {
                grappler.remove_condition("Grappling")
                
                // Restore grappler's movement (double it back, but cap at max)
                const current_movement = grappler.get_resource_value("Movement")
                const max_movement = grappler.resources["Movement"].max
                const restored_movement = Math.min(current_movement * 2, max_movement)
                grappler.set_resource_value("Movement", restored_movement)
            }
        }

        // Consume resources
        this.use_resources(action_details.resources)
        Initiative.set_recovery(action_details.recovery, creature)

        // Logging
        console.log(message, "all")
    }

    static stop_grappling() {
        const function_name = "stop_grappling"

        // Requirements
        const { valid, creature, action_details } = this.check_action_requirements(function_name, false);
        if (!valid) return;

        // Validate creature is grappling
        if (!creature.has_condition("Grappling")) {
            console.log(`${creature.name_color} is not grappling anyone.`, "all")
            return
        }

        // Get grappled target
        const grappled_id = creature.get_condition("Grappling").target
        const grappled_target = instance(grappled_id)
        if (!grappled_target) {
            console.log(`${creature.name_color} tried to stop grappling but the target is no longer valid.`, "all")
            creature.remove_condition("Grappling")
            return
        }

        // Remove conditions
        creature.remove_condition("Grappling")
        
        // Remove Grappled condition from target if it points to this creature
        if (grappled_target.has_condition("Grappled") && grappled_target.get_condition("Grappled").source == creature.id) {
            grappled_target.remove_condition("Grappled")
        }

        // Restore creature's movement (double it back, but cap at max)
        const current_movement = creature.get_resource_value("Movement")
        const max_movement = creature.resources["Movement"].max
        const restored_movement = Math.min(current_movement * 2, max_movement)
        creature.set_resource_value("Movement", restored_movement)

        // Consume resources (should be empty, but just in case)
        this.use_resources(action_details.resources)
        Initiative.set_recovery(action_details.recovery, creature)

        // Logging
        console.log(`${creature.name_color} released ${grappled_target.name_color} from the grapple.`, "all")
    }

    static stand_up() {
        const function_name = "stand_up"

        // Requirements
        const { valid, creature, action_details } = this.check_action_requirements(function_name, false);
        if (!valid) return;

        // Validate creature is prone
        if (!creature.has_condition("Prone")) {
            console.log(`${creature.name_color} is not prone.`, "all")
            return
        }

        // Calculate half movement cost
        const speed = creature.speed
        const half_movement = Math.floor(speed / 2)
        const current_movement = creature.resources["Movement"]
        
        // Check if creature has enough movement
        if (current_movement.value < half_movement && Initiative.turn_order.includes(creature.id)) {
            console.log(`${creature.name_color} doesn't have enough movement (${current_movement.value}/${half_movement}) to stand up.`, "all")
            return
        }

        // Consume half movement
        const new_movement = current_movement.value - half_movement
        creature.set_resource_value("Movement", new_movement)

        // Remove Prone condition
        creature.remove_condition("Prone")

        // Set recovery
        Initiative.set_recovery(action_details.recovery, creature)

        // Logging
        console.log(`${creature.name_color} stands up from prone, using ${half_movement} feet of movement.`, "all")
    }

    //---------------------------------------------------------------------------------------------------
    // Attacks
    //---------------------------------------------------------------------------------------------------

    static attack() {
        const action_name = "attack"
        const slot = "primary main hand"
        const target = selected()

        // Requirements
        const { valid, creature, action_details } = this.check_action_requirements(action_name);
        if (!valid || !target) return;

        // Make attack
        const attack_result = this.make_attack({slot, creature, target})
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
        const attack_result = this.make_attack({slot, creature, target})
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
        const attack_result = this.make_attack({slot, creature, target})
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
        const function_name = "grapple"

        // Helper
        const makeCheck = (creature, target=false) => {
            const dice_roll = roll_20()
            const bonus = (target
                ? Math.max(creature.skills.Athletics, creature.skills.Acrobatics)
                : creature.skills.Athletics
            )

            return {
                result: dice_roll.result + bonus,
                dice_roll,
                bonus,
                text: `${dice_roll.text_color} ${bonus >= 0 ? "+" : "-"} ${bonus}`
            }
        }

        // Requirements
        const { valid, creature, target, action_details } = this.check_action_requirements(function_name, true);
        if (!valid) return;

        // Validate Range
        if (calculate_distance(target, creature) > 1) {
            console.log(`${creature.name_color} tried to grapple ${target.name_color} but they are too far.`, "all")
            return
        }

        // Strength Checks
        const c_check = makeCheck(creature)
        const t_check = makeCheck(target, true)
        let message = "", success = false; {
            if (c_check.result > t_check.result) {
                success = true
                message = `${creature.name_color} (DC ${c_check.text}) has begun to grapple ${target.name_color} (${t_check.text}).`
            }
            else {
                message = `${creature.name_color} (DC ${c_check.text}) attempted to grapple ${target.name_color} (${t_check.text}) but failed.`
            }
        }

        // Add conditions
        if (success) {
            // Creature
            creature.set_condition("Grappling", -1, {
                target: target.id,
                offset: { x: target.x - creature.x, y: target.y - creature.y }
            })
            const new_movement = Math.floor(creature.get_resource_value("Movement") / 2)
            creature.set_resource_value("Movement", new_movement)

            // Target
            target.set_condition("Grappled", -1, {
                source: creature.id
            })
        }

        // Consume resources
        this.use_resources(action_details.resources)
        Initiative.set_recovery(action_details.recovery, creature)

        // Logging
        console.log(message, "all")
    }

    static push() {
        const function_name = "push"

        // Helper
        const makeCheck = (creature, target=false) => {
            const dice_roll = roll_20()
            const bonus = (target
                ? Math.max(creature.skills.Athletics, creature.skills.Acrobatics)
                : creature.skills.Athletics
            )

            return {
                result: dice_roll.result + bonus,
                dice_roll,
                bonus,
                text: `${dice_roll.text_color} ${bonus >= 0 ? "+" : "-"} ${bonus}`
            }
        }

        // Requirements
        const { valid, creature, target, action_details } = this.check_action_requirements(function_name, true);
        if (!valid) return;

        // Validate Range
        if (calculate_distance(target, creature) > 1) {
            console.log(`${creature.name_color} tried to push ${target.name_color} but they are too far.`, "all")
            return
        }

        // Strength Checks
        const c_check = makeCheck(creature)
        const t_check = makeCheck(target, true)
        let message = "", success = false; {
            if (c_check.result > t_check.result) {
                success = true
                message = `${creature.name_color} (DC ${c_check.text}) pushed ${target.name_color} (${t_check.text}) by 5ft.`
            }
            else {
                message = `${creature.name_color} (DC ${c_check.text}) attempted to push ${target.name_color} (${t_check.text}) but failed.`
            }
        }

        // Push
        if (success) {
            const direction = calculate_direction(creature, target)
            const cells = 1
            target.move(direction, cells)
        }

        // Consume resources
        this.use_resources(action_details.resources)
        Initiative.set_recovery(action_details.recovery, creature)

        // Logging
        console.log(message, "all")
    }

    static knock_prone() {
        const function_name = "knock_prone"

        // Helper
        const makeCheck = (creature, target=false) => {
            const dice_roll = roll_20()
            const bonus = (target
                ? Math.max(creature.skills.Athletics, creature.skills.Acrobatics)
                : creature.skills.Athletics
            )

            return {
                result: dice_roll.result + bonus,
                dice_roll,
                bonus,
                text: `${dice_roll.text_color} ${bonus >= 0 ? "+" : "-"} ${bonus}`
            }
        }

        // Requirements
        const { valid, creature, target, action_details } = this.check_action_requirements(function_name, true);
        if (!valid) return;

        // Validate Range
        if (calculate_distance(target, creature) > 1) {
            console.log(`${creature.name_color} tried to knock down ${target.name_color} but they are too far.`, "all")
            return
        }

        // Strength Checks
        const c_check = makeCheck(creature)
        const t_check = makeCheck(target, true)
        let message = "", success = false; {
            if (c_check.result > t_check.result) {
                success = true
                message = `${creature.name_color} (DC ${c_check.text}) knocked down ${target.name_color} (${t_check.text}).`
            }
            else {
                message = `${creature.name_color} (DC ${c_check.text}) attempted to knock down ${target.name_color} (${t_check.text}) but failed.`
            }
        }

        // Apply Prone condition
        if (success) {
            target.set_condition("Prone", -1)
        }

        // Consume resources
        this.use_resources(action_details.resources)
        Initiative.set_recovery(action_details.recovery, creature)

        // Logging
        console.log(message, "all")
    }

    //---------------------------------------------------------------------------------------------------
    // Common
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
