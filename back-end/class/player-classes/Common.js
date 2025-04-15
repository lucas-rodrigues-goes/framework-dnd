"use strict";
try {

    var Common = class {

        //=====================================================================================================
        // Parameters
        //=====================================================================================================

        static actions_list() {
            const creature = impersonated();
            const actions = {
                attack: {
                    resources: ["Attack Action"],
                    description: "Use your main equipped weapon (or fists) to deliver a blow to the enemy.",
                },
                grapple: {
                    resources: ["Attack Action"],
                    description: "Attempt to grapple the enemy, impeding their movement.",
                },
                push: {
                    resources: ["Attack Action"],
                    description: "Attempt to push the enemy 5ft.",
                },
                knock_prone: {
                    resources: ["Attack Action"],
                    description: "Attempt to knock down the enemy.",
                },
                dash: {
                    resources: ["Action"],
                    description: "Gain additional movement equal to your speed.",
                },
                disengage: {
                    resources: ["Action"],
                    description: "Your movement doesn't provoke opportunity attacks for the rest of the turn.",
                },
                dodge: {
                    resources: ["Action"],
                    description: "Focus on avoiding attacks. Attack rolls against you have disadvantage.",
                },
                help: {
                    resources: ["Action"],
                    description: "Aid another creature in attacking or avoiding attacks.",
                },
                hide: {
                    resources: ["Action"],
                    description: "Attempt to hide from enemies using Stealth.",
                },
                ready: {
                    resources: ["Action"],
                    description: "Prepare to take an action later in response to a trigger.",
                },
                search: {
                    resources: ["Action"],
                    description: "Devote your attention to finding something using Perception or Investigation.",
                },
            }

            // Conditional Actions
            const weapon = database.items.data[creature.equipment["primary off hand"]?.name];
            const hasOffHandWeapon = weapon ? weapon.subtype == "weapon" : false
            if (hasOffHandWeapon) {
                actions["off_hand_attack"] = {
                    resources: ["Bonus Action"],
                    description: "Use your off hand weapon to deliver a blow to the enemy.",
                }
            }

            return actions
        }

        //=====================================================================================================
        // Helpers
        //=====================================================================================================

        static has_resources_available(resources) {
            const creature = impersonated();
            for (const name of resources) {
                const resource = creature?.resources[name]?.value || 0
                if (name == "Attack Action") {
                    const action_res = creature?.resources["Action"]?.value || 0
                    return (resource > 0 || action_res > 0)
                }
                return resource > 0
            }
        }

        static calculate_hit_bonus(weapon) {
            const creature = impersonated();
            const isFinesse = weapon?.properties?.includes("Finesse") || false;
            const isAmmo = weapon?.properties?.includes("Ammunition") || false;
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

        static roll_attack(hit_bonus, target_ac) {
            const roll = Math.ceil(Math.random() * 20);
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

        static build_attack_message(target, roll_result, roll_text, damage_data) {
            const attacker = impersonated();
            let message = attacker.name + " attacks " + target.name + " and " + roll_result + " (" + roll_text + ")";

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

        static attack() {
            const creature = impersonated();

            // Requirements
            const actions_list = this.actions_list();
            if (!selected() || !actions_list?.attack || !this.has_resources_available(actions_list.attack.resources)) {
                return;
            }

            // Weapon
            const weapon = database.items.data[creature.equipment["primary main hand"]?.name];
            const hit_bonus = this.calculate_hit_bonus(weapon);
            const { result, roll_text } = this.roll_attack(hit_bonus, selected().armor_class);

            // Damage
            let damage_data = null;
            if (result === "lands a critical hit" || result === "hits") {
                damage_data = this.calculate_damage(weapon, result === "lands a critical hit");
            }

            // Logging
            public_log(this.build_attack_message(selected(), result, roll_text, damage_data));
        }

        static off_hand_attack() {
            const creature = impersonated();
            
            // Requirements
            const actions_list = this.actions_list();
            if (!selected() || !actions_list?.off_hand_attack || !this.has_resources_available(actions_list.off_hand_attack.resources)) {
                return;
            }

            // Weapon
            const weapon = database.items.data[creature.equipment["primary off hand"]?.name];
            const hit_bonus = this.calculate_hit_bonus(weapon);
            const { result, roll_text } = this.roll_attack(hit_bonus, selected().armor_class);

            // Damage
            let damage_data = null;
            if (result === "lands a critical hit" || result === "hits") {
                damage_data = this.calculate_damage(weapon, result === "lands a critical hit", true);
            }

            // Logging
            public_log(this.build_attack_message(selected(), result, roll_text, damage_data));
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
            return;
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