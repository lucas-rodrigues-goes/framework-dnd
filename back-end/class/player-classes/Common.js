"use strict";
try {

    var Common = class {

        //=====================================================================================================
        // Helpers
        //=====================================================================================================

        static has_resources_available(resources) {
            const creature = impersonated();

            let return_value = true
            const missing_resources = []
            for (const name of resources) {
                const resource = creature?.resources[name]?.value || 0

                // Ignore turn resources if not in initiative
                const turn_resource = ["Action", "Attack Action", "Bonus Action", "Reaction", "Movement"].includes(name)
                const has_initative = Initiative.turn_order.includes(creature.id)
                if(turn_resource && !has_initative) continue

                // Verify if can use action to create attack action
                if (name == "Attack Action") {
                    const action_res = creature?.resources["Action"]?.value || 0

                    // Store return values
                    if(resource < 1 && action_res < 1) {
                        return_value = false
                        missing_resources.push("Action")
                    }
                    continue
                }

                // Store return values
                if (resource < 1) {
                    return_value = false
                    missing_resources.push(name)
                }
            }

            if(!return_value) public_log(creature.name +" has insuficient resources for this ability (" + missing_resources.join(", ") + ").")
            return return_value
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

        static validate_range(weapon) {
            // Helper
            function calculateDistance(x1, y1, x2, y2) {
                const dx = x2 - x1; // Difference in X-coordinates
                const dy = y2 - y1; // Difference in Y-coordinates
                const distance = Math.round(Math.sqrt(dx * dx + dy * dy))
                //log("Distance: " + distance)
                return distance;
            }

            // Conditions
            const usesAmmo = weapon?.properties?.includes("Ammunition") || false;
            const isThrown = weapon?.properties?.includes("Thrown") || false
            const isReach = weapon?.properties?.includes("Reach") || false
            const range = weapon?.range || (isReach ? [10] : [5])

            // Parameters
            const creature = impersonated()
            const target = selected()
            const distance = calculateDistance(creature.x, creature.y, target.x, target.y) * 5

            if (usesAmmo || isThrown) {
                if (distance > range[1]) return "Unsufficient"
                else if (distance > range[0]) return "Extended"
                else return "Normal"
            } else {
                if (distance > range[0]) return "Unsufficient"
                else return "Normal"
            }
        }

        static calculate_hit_bonus(weapon) {
            // Validations
            const creature = impersonated();
            const isFinesse = weapon?.properties?.includes("Finesse") || false;
            const isAmmo = weapon?.properties?.includes("Ammunition") || false;


            // Applicable bonuses
            const str_bonus = !isAmmo ? creature.score_bonus["strength"] : 0;
            const dex_bonus = isFinesse || isAmmo ? creature.score_bonus["dexterity"] : 0;

            return Math.max(Math.min(str_bonus, 3), dex_bonus) + 2;
        }

        static calculate_damage(weapon, is_critical, off_hand=false) {
            const creature = impersonated();
            const isFinesse = weapon?.properties?.includes("Finesse") || false;
            const isAmmo = weapon?.properties?.includes("Ammunition") || false;
            const damage_list = weapon?.damage || [{die_ammount: 1, die_size: 1, damage_type: "Bludgeoning"}];

            const str_bonus = !isAmmo ? creature.score_bonus["strength"] : 0;
            const dex_bonus = isFinesse || isAmmo ? creature.score_bonus["dexterity"] : 0;
            const damage_bonus = Math.max(str_bonus, Math.min(dex_bonus, 3));
            const crit_multiplier = is_critical ? 2 : 1;

            const calculated_damage = {};
            for (const damage of damage_list) {
                let total_damage = off_hand ? 0 : damage_bonus;
                for (let i = 0; i < damage.die_ammount * crit_multiplier; i++) {
                    total_damage += Math.ceil(Math.random() * damage.die_size);
                }
                calculated_damage[damage.damage_type] = total_damage;
            }

            return calculated_damage;
        }

        static roll_attack(hit_bonus, target) {
            const roll = Math.ceil(Math.random() * 20);
            const target_visibility = impersonated().target_visibility();

            // Face target
            impersonated().face_target()
            
            // Target AC
            let cover = 0
            if (target_visibility <= 0.25) cover = 5 // Three quarters cover
            else if (target_visibility <= 0.5) cover = 2 // Half cover
            const target_ac = target.armor_class + cover

            // Roll Result
            let roll_result;
            if (roll === 20) roll_result = "lands a critical hit";
            else if (roll === 1) roll_result = "critically misses";
            else if (roll + hit_bonus >= target_ac) roll_result = "hits";
            else roll_result = "misses";

            return {
                result: roll_result,
                roll_text: roll_result.includes("critical") ? "Nat " + roll : roll + hit_bonus,
            };
        }

        static build_attack_message(target, roll_result, roll_text, damage_data, means) {
            const attacker = impersonated();
            let message = attacker.name + " attacks " + target.name + " with " + means + " and " + roll_result + " (" + roll_text + ")";

            if (damage_data) {
                message += " dealing ";
                const damage_parts = [];
                for (const type in damage_data) {
                    target.receive_damage(damage_data[type], type);
                    damage_parts.push(damage_data[type] + " " + type.toLowerCase());
                }
                message += damage_parts.join(", ") + " damage.";
            } else {
                message += ".";
            }

            return message;
        }

        //=====================================================================================================
        // Actions
        //=====================================================================================================

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

        static attack() {
            const creature = impersonated();

            // Requirements
            const function_name = "attack"
            const action_details = this.actions_list()[function_name];
            if (!action_details) return
            if (!selected() || !this.has_resources_available(action_details.resources)) {
                return;
            }

            // Weapon
            const weapon = database.items.data[creature.equipment["primary main hand"]?.name];
            const hit_bonus = this.calculate_hit_bonus(weapon);
            const { result, roll_text } = this.roll_attack(hit_bonus, selected());
            const means = weapon ? "their " + weapon?.name : "their fists"

            // Validate Range
            const range_validation = this.validate_range(weapon)
            if (range_validation == "Unsufficient") {
                public_log(creature.name + " tried to attack " + selected().name + " using " + means + " but they are out of range.")
                return
            }

            // Damage
            let damage_data = null;
            if (result === "lands a critical hit" || result === "hits") {
                damage_data = this.calculate_damage(weapon, result === "lands a critical hit");
            }

            // Consume resources
            this.use_resources(action_details.resources)
            Initiative.set_recovery(action_details.recovery, creature)

            // Logging
            public_log(this.build_attack_message(selected(), result, roll_text, damage_data, means));
        }

        static opportunity_attack() {
            const creature = impersonated();

            // Requirements
            const function_name = "opportunity_attack"
            const action_details = this.actions_list()[function_name];
            if (!action_details) return
            if (!selected() || !this.has_resources_available(action_details.resources)) {
                return;
            }

            // Weapon
            const weapon = database.items.data[creature.equipment["primary main hand"]?.name];
            const hit_bonus = this.calculate_hit_bonus(weapon);
            const { result, roll_text } = this.roll_attack(hit_bonus, selected());
            const means = weapon ? "their " + weapon?.name : "their fists"

            // Validate Range
            const range_validation = this.validate_range(weapon)
            if (range_validation == "Unsufficient") {
                public_log(creature.name + " tried to attack " + selected().name + " using " + means + " but they are out of range.")
            }

            // Damage
            let damage_data = null;
            if (result === "lands a critical hit" || result === "hits") {
                damage_data = this.calculate_damage(weapon, result === "lands a critical hit");
            }

            // Consume resources
            this.use_resources(action_details.resources)
            Initiative.set_recovery(action_details.recovery, creature)

            // Logging
            public_log(this.build_attack_message(selected(), result, roll_text, damage_data, means));
        }

        static off_hand_attack() {
            const creature = impersonated();
            
            // Requirements
            const function_name = "off_hand_attack"
            const action_details = this.actions_list()[function_name];
            if (!action_details) return
            if (!selected() || !this.has_resources_available(action_details.resources)) {
                return;
            }

            // Weapon
            const weapon = database.items.data[creature.equipment["primary off hand"]?.name];
            const hit_bonus = this.calculate_hit_bonus(weapon);
            const { result, roll_text } = this.roll_attack(hit_bonus, selected());
            const means = weapon ? "their " + weapon?.name : "their fists"

            // Validate Range
            const range_validation = this.validate_range(weapon)
            if (range_validation == "Unsufficient") {
                public_log(creature.name + " tried to attack " + selected().name + " using " + means + " but they are out of range.")
            }

            // Damage
            let damage_data = null;
            if (result === "lands a critical hit" || result === "hits") {
                damage_data = this.calculate_damage(weapon, result === "lands a critical hit", true);
            }

            // Consume resources
            this.use_resources(action_details.resources)
            Initiative.set_recovery(action_details.recovery, creature)

            // Logging
            public_log(this.build_attack_message(selected(), result, roll_text, damage_data, means));
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

        static dash() {
            const creature = impersonated()

            // Requirements
            const function_name = "dash"
            const action_details = this.actions_list()[function_name];
            if (!action_details) return
            if (!selected() || !this.has_resources_available(action_details.resources)) {
                return;
            }

            // New movement
            const current_movement = creature.resources["Movement"]
            const speed = creature.speed
            creature.set_resource_max("Movement", current_movement.max + speed)
            creature.set_resource_value("Movement", current_movement.value + speed)

            // Consume resources
            this.use_resources(action_details.resources)
            Initiative.set_recovery(action_details.recovery, creature)

            // Logging
            public_log(creature.name + " dashes, gaining extra movement for this round.")
        }

        static disengage() {
            return;
        }

        static dodge() {
            return;
        }

        static help() {
            return;
        }

        static hide() {
            return;
        }
        
        static ready() {
            return;
        }

        static search() {
            return;
        }

        //=====================================================================================================
    }

} catch (e) {
    MapTool.chat.broadcast("" + e + "\n" + e.stack)
}